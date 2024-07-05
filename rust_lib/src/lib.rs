uniffi::setup_scaffolding!();

#[derive(thiserror::Error, uniffi::Error, Debug)]
pub enum EnumError {
    #[error("Oops: {msg}\n{backtrace}")]
    Oops { msg: String, backtrace: String },
}

use russh_sftp::protocol::FileType as RusshFileType;
use std::backtrace::Backtrace;
use std::collections::HashMap;
use std::future::Future;
use std::ops::Not;
use std::os::unix::fs::MetadataExt;
use std::pin::Pin;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::sync::mpsc::{Sender, UnboundedReceiver};
use tokio::sync::watch::Receiver as ReceiverWatch;
use tokio::sync::{mpsc, Mutex};

use anyhow::Result;
use async_trait::async_trait;
use once_cell::sync::Lazy;
use russh::*;
use russh_keys::*;
use russh_sftp::client::fs::File as RusshFile;
use russh_sftp::client::SftpSession;
use tokio::fs::File as TokioFile;
use tokio::runtime::Runtime;

static TOKIO_RUNTIME: Lazy<Arc<Runtime>> = Lazy::new(|| Arc::new(Runtime::new().unwrap()));

#[derive(Debug)]
struct PathInfo {
    path: String,
    file_type: RusshFileType,
    size: u64,
}

enum FileType {
    Russh(RusshFile),
    Tokio(TokioFile),
}

impl FileType {
    async fn file_size(&self) -> Result<u64, EnumError> {
        match self {
            FileType::Russh(russh_file) => Ok(russh_file.metadata().await?.size.unwrap_or(0)),
            FileType::Tokio(tokio_file) => Ok(tokio_file.metadata().await?.size()),
        }
    }

    async fn file_type(&self) -> Result<RusshFileType, EnumError> {
        match self {
            FileType::Russh(russh_file) => {
                let metadata = russh_file.metadata().await?;
                Ok(metadata.file_type())
            }
            FileType::Tokio(tokio_file) => {
                let metadata = tokio_file.metadata().await?;
                if metadata.is_dir() {
                    Ok(RusshFileType::Dir)
                } else {
                    Ok(RusshFileType::File)
                }
            }
        }
    }

    async fn read(&mut self, buf: &mut [u8]) -> Result<usize, EnumError> {
        match self {
            FileType::Russh(russh_file) => Ok(russh_file.read(buf).await?),
            FileType::Tokio(tokio_file) => Ok(tokio_file.read(buf).await?),
        }
    }

    async fn write_all(&mut self, buf: &[u8]) -> Result<(), EnumError> {
        match self {
            FileType::Russh(russh_file) => russh_file.write_all(buf).await?,
            FileType::Tokio(tokio_file) => tokio_file.write_all(buf).await?,
        }
        Ok(())
    }
}

struct Client {}

// More SSH event handlers
// can be defined in this trait
// In this example, we're only using Channel, so these aren't needed.
#[async_trait]
impl client::Handler for Client {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &key::PublicKey,
    ) -> Result<bool, Self::Error> {
        Ok(true)
    }
}

#[derive(uniffi::Record, Debug, Clone)]
pub struct TransferProgress {
    pub transferred: u64,
    pub total: u64,
}

/// This struct is a convenience wrapper
/// around a russh client
/// that handles the input/output event loop
#[derive(uniffi::Object)]
pub struct Session {
    session: Arc<Mutex<client::Handle<Client>>>,
    output: Arc<Mutex<HashMap<String, Arc<Mutex<UnboundedReceiver<String>>>>>>,
    transfer_progress: Arc<Mutex<HashMap<String, Arc<Mutex<ReceiverWatch<TransferProgress>>>>>>,
    cancellation: Arc<Mutex<HashMap<String, Arc<Mutex<Sender<u8>>>>>>,
}

#[uniffi::export]
fn connect(user: String, password: String, addrs: String) -> Result<Arc<Session>, EnumError> {
    std::env::set_var("RUST_BACKTRACE", "1");

    println!("1 Connecting to {}", addrs);
    TOKIO_RUNTIME.block_on(async {
        let config = client::Config { ..<_>::default() };

        let config = Arc::new(config);
        let sh = Client {};

        println!("2 Connecting to {}", addrs);
        let mut session =
            client::connect(config, addrs, sh)
                .await
                .map_err(|e| EnumError::Oops {
                    msg: format!("Failed to connect: {}", e),
                    backtrace: Backtrace::capture().to_string(),
                })?;

        println!("3 Connecting");
        let auth_res = session
            .authenticate_password(user, password)
            .await
            .map_err(|e| EnumError::Oops {
                msg: format!("Failed to authenticate: {}", e),
                backtrace: Backtrace::capture().to_string(),
            })?;

        println!("4 Connecting");
        if !auth_res {
            return Err(EnumError::Oops {
                msg: String::from("Authentication with password failed"),
                backtrace: Backtrace::capture().to_string(),
            });
        }
        println!("5 Connecting");
        Ok(Arc::new(Session {
            session: Arc::new(Mutex::new(session)),
            output: Arc::new(Mutex::new(HashMap::new())),
            cancellation: Arc::new(Mutex::new(HashMap::new())),
            transfer_progress: Arc::new(Mutex::new(HashMap::new())),
        }))
    })
}

#[uniffi::export]
impl Session {
    // TODO test that this works when the connection is lost and regained
    async fn test_connection(self: Arc<Self>) -> Result<String, EnumError> {
        // timeout after 300 ms
        TOKIO_RUNTIME
            .spawn(async move {
                let result = tokio::time::timeout(std::time::Duration::from_millis(300), async {
                    let session = self.session.lock().await;
                    let mut channel = session.channel_open_session().await?;
                    channel.exec(true, "echo i").await?;
                    loop {
                        let msg = channel.wait().await;
                        match msg {
                            Some(msg) => match msg {
                                ChannelMsg::Data { data } => {
                                    return Ok(String::from_utf8(data.to_vec()).unwrap());
                                }
                                _ => continue,
                            },
                            None => {
                                return Err(EnumError::Oops {
                                    msg: "No channel message returned".to_string(),
                                    backtrace: Backtrace::capture().to_string(),
                                })
                            }
                        }
                    }
                })
                .await;

                // Handle the timeout case
                match result {
                    Ok(operation_result) => operation_result,
                    Err(_) => Err(EnumError::Oops {
                        msg: "Operation timed out".to_string(),
                        backtrace: Backtrace::capture().to_string(),
                    }),
                }
            })
            .await
            .map_err(|join_err| EnumError::from(join_err))?
    }

    async fn exec(self: Arc<Self>, command_id: &str, command: &str) -> Result<String, EnumError> {
        std::env::set_var("RUST_BACKTRACE", "1");
        let command_clone = command.to_owned();
        let command_id_clone = command_id.to_owned();
        let (cancel_sender, cancel_receiver) = mpsc::channel::<u8>(1);
        {
            self.cancellation
                .lock()
                .await
                .insert(command_id.to_string(), Arc::new(Mutex::new(cancel_sender)));
        }
        let (tx, rx) = mpsc::unbounded_channel::<String>();
        {
            self.output
                .lock()
                .await
                .insert(command_id.to_string(), Arc::new(Mutex::new(rx)));
        }

        let mut channel;
        {
            let session = self.session.lock().await;
            channel = session.channel_open_session().await?;
        }
        TOKIO_RUNTIME
            .spawn(async move {
                let mut return_code = String::new();

                channel.exec(true, command_clone).await?;

                loop {
                    if !cancel_receiver.is_empty() {
                        channel.close().await?;
                        drop(cancel_receiver);
                        println!("Cancelled command {}", command_id_clone);
                        break;
                    }
                    // returns None if the channel is closed
                    let Some(msg) = channel.wait().await else {
                        drop(tx);
                        break;
                    };
                    println!("msg: {:?}", msg);
                    match msg {
                        ChannelMsg::Data { ref data } => {
                            let data_str = String::from_utf8(data.to_vec()).unwrap();
                            tx.send(data_str)?;
                        }

                        ChannelMsg::ExitStatus { exit_status } => {
                            return_code = format!("{}", exit_status);
                        }
                        _ => {
                            // println!("Unhandled message: {:?}", msg);
                        }
                    }
                }
                Ok(return_code)
            })
            .await
            .map_err(|join_err| EnumError::from(join_err))?
    }

    async fn transfer(
        self: Arc<Self>,
        transfer_id: &str,
        source_path: &str,
        destination_path: &str,
        direction: &str,
    ) -> Result<(), EnumError> {
        let transfer_id = transfer_id.to_owned();
        let source_path = source_path.to_owned();
        let destination_path = destination_path.to_owned();
        let direction = direction.to_owned();
        let (cancel_sender, cancel_receiver) = mpsc::channel::<u8>(1);
        {
            self.cancellation
                .lock()
                .await
                .insert(transfer_id.to_string(), Arc::new(Mutex::new(cancel_sender)));
        }

        TOKIO_RUNTIME
            .spawn(async move {
                let channel = self.session.lock().await.channel_open_session().await?;
                channel.request_subsystem(true, "sftp").await?;
                let sftp = SftpSession::new(channel.into_stream()).await?;

                // TODO: fix error here, seems like it is using //home instead of /home, then test recursive directory with /home folder
                println!(
                    "RUST: Transferring between {} {}",
                    source_path.clone(),
                    destination_path
                );

                let source: FileType;
                if direction == "upload" {
                    source = FileType::Tokio(TokioFile::open(source_path.clone()).await?);
                } else {
                    source = FileType::Russh(sftp.open(source_path.clone()).await?);
                }

                let mut files: Vec<PathInfo> = vec![];
                let ft = source.file_type().await?;
                files.push(PathInfo {
                    path: source_path.clone(),
                    file_type: ft,
                    size: source.file_size().await?,
                });

                println!("RUST: File type {:?}", ft);
                // TODO test this updated code
                if ft == RusshFileType::Dir {
                    if direction == "upload" {
                        files.extend(
                            self.list_directory_contents_local(source_path.clone())
                                .await?,
                        );
                    } else if direction == "download" {
                        files.extend(
                            self.list_directory_contents_sftp(source_path.clone())
                                .await?,
                        );
                    }
                    println!("RUST: Files {:?}", files);
                }

                let (transfer_sender, transfer_receiver) =
                    tokio::sync::watch::channel(TransferProgress {
                        transferred: 0u64,
                        total: 0u64,
                    });
                {
                    let mut transfer = self.transfer_progress.lock().await;
                    transfer.insert(transfer_id.clone(), Arc::new(Mutex::new(transfer_receiver)));
                }

                let total_size = files.iter().map(|p| p.size).sum::<u64>();

                transfer_sender.send(TransferProgress {
                    transferred: 0,
                    total: total_size,
                })?;

                let mut transferred_bytes = 0u64;
                let mut buffer = [0; 100000];
                println!(
                    "RUST: Transferring id {} total size {}",
                    transfer_id, total_size
                );
                // todo test this recursive copy
                for source_file_info in files {
                    // destination should be destination path + source_file.0 - source_path
                    let destination_path = destination_path.to_owned()
                        + &source_file_info.path[source_path.clone().len()..];
                    println!(
                        "RUST: Transferring from {} to {}",
                        source_file_info.path, destination_path
                    );
                    if source_file_info.file_type == RusshFileType::Dir {
                        println!("RUST: Creating directory {}", destination_path.clone());
                        if direction == "upload" {
                            if (sftp.try_exists(destination_path.clone()).await?).not() {
                                sftp.create_dir(destination_path.clone()).await?;
                            }
                        } else {
                            if tokio::fs::metadata(destination_path.clone()).await.is_err() {
                                tokio::fs::create_dir(destination_path.clone()).await?;
                            }
                        }
                        transferred_bytes += source_file_info.size;
                        transfer_sender.send(TransferProgress {
                            transferred: transferred_bytes,
                            total: total_size,
                        })?;
                        continue;
                    }
                    let mut source_file: FileType;
                    let mut destination_file: FileType;
                    println!("RUST: Creating file {}", destination_path.clone());
                    if direction == "upload" {
                        destination_file =
                            FileType::Russh(sftp.create(destination_path.clone()).await?);
                        source_file =
                            FileType::Tokio(TokioFile::open(source_file_info.path).await?);
                    } else {
                        destination_file =
                            FileType::Tokio(TokioFile::create(destination_path.clone()).await?);
                        source_file = FileType::Russh(sftp.open(source_file_info.path).await?);
                    }

                    println!("RUST: Transferring file {}", destination_path.clone());
                    loop {
                        if !cancel_receiver.is_empty() {
                            sftp.close().await?;
                            println!("Transfer Cancelled {}", transfer_id);
                            break;
                        }
                        let bytes_left = total_size - transferred_bytes;
                        let read_size = std::cmp::min(buffer.len(), bytes_left as usize);

                        let bytes_read = source_file.read(&mut buffer[..read_size]).await?;
                        if bytes_read == 0 {
                            break;
                        }

                        destination_file.write_all(&buffer[..bytes_read]).await?;
                        transferred_bytes += bytes_read as u64;
                        transfer_sender.send(TransferProgress {
                            transferred: transferred_bytes,
                            total: total_size,
                        })?;
                    }
                }
                Ok(())
            })
            .await?
    }

    // TODO progress seems to be updating but it isn't getting propogated to front end
    async fn transfer_progress(
        self: Arc<Self>,
        transfer_id: &str,
    ) -> Result<TransferProgress, EnumError> {
        let transfer_id = transfer_id.to_owned();
        TOKIO_RUNTIME
            .spawn(async move {
                let transfer = self.transfer_progress.lock().await;
                let progress = transfer.get(&transfer_id);
                if let Some(progress) = progress {
                    let p = progress.lock().await.borrow().clone();
                    println!("RUST: Progress {} {:?}", transfer_id, p);
                    p
                } else {
                    println!("RUST: Progress not found {}", transfer_id);
                    TransferProgress {
                        transferred: 0,
                        total: 1,
                    }
                }
            })
            .await
            .map_err(|join_err| EnumError::from(join_err))
    }

    async fn read_output(self: Arc<Self>, command_id: &str) -> Result<Option<String>, EnumError> {
        let command_id = command_id.to_owned();
        TOKIO_RUNTIME
            .spawn(async move {
                let output = self.output.lock().await;
                let rx = output.get(&command_id);
                if let Some(rx) = rx {
                    rx.lock().await.recv().await
                } else {
                    None
                }
            })
            .await
            .map_err(|join_err| EnumError::from(join_err))
    }

    fn close(self: Arc<Self>) -> Result<(), EnumError> {
        TOKIO_RUNTIME.block_on(async {
            let session = self.session.lock().await;
            session
                .disconnect(Disconnect::ByApplication, "", "English")
                .await?;
            Ok(())
        })
    }

    async fn cancel(self: Arc<Self>, id: &str) -> Result<(), EnumError> {
        let id = id.to_owned();
        TOKIO_RUNTIME
            .spawn(async move {
                let map = self.cancellation.lock().await;
                let cancellation = map.get(&id);
                if let Some(cancellation) = cancellation {
                    cancellation.lock().await.send(1).await?;
                    println!("Cancelling {}", id);
                    Ok(())
                } else {
                    Err(EnumError::Oops {
                        msg: format!("ID {} not found", id),
                        backtrace: Backtrace::capture().to_string(),
                    })
                }
            })
            .await?
    }
}

impl Session {
    // WARNING: only use this inside existing tokio runtime thread
    async fn list_directory_contents_local(
        &self,
        source_path: String,
    ) -> Result<Vec<PathInfo>, EnumError> {
        let mut items = vec![];
        println!("RUST: Listing local directory contents of {}", source_path);
        let mut read_dir = tokio::fs::read_dir(&source_path).await?;
        while let Some(entry) = read_dir.next_entry().await? {
            let path = entry.path();
            let metadata = entry.metadata().await?;
            let file_type = if path.is_dir() {
                RusshFileType::Dir
            } else {
                RusshFileType::File
            };
            let file_size = metadata.len();

            let entry_path = source_path.clone() + "/" + &entry.file_name().to_string_lossy();
            items.push(PathInfo {
                path: entry_path.clone(),
                file_type: file_type,
                size: file_size,
            });
            if metadata.file_type().is_dir() {
                let sub_items = self
                    .list_directory_contents_local_wrapper(entry_path)
                    .await?;
                items.extend(sub_items);
            }
        }
        Ok(items)
    }

    fn list_directory_contents_local_wrapper(
        &self,
        source_path: String, // Take ownership
    ) -> Pin<Box<dyn Future<Output = Result<Vec<PathInfo>, EnumError>> + Send + '_>> {
        // Now directly pass the owned Strings without referencing them
        Box::pin(self.list_directory_contents_local(source_path))
    }

    // WARNING: only use this inside existing tokio runtime thread
    async fn list_directory_contents_sftp(
        &self,
        source_path: String,
    ) -> Result<Vec<PathInfo>, EnumError> {
        let mut items = vec![];
        println!("RUST: Listing sftp directory contents of {}", source_path);
        // Assuming `self.session` and `SftpSession` are defined elsewhere in your code
        let channel = self.session.lock().await.channel_open_session().await?;
        channel.request_subsystem(true, "sftp").await?;
        let sftp = SftpSession::new(channel.into_stream()).await?;

        let readdir = sftp.read_dir(&source_path).await?;
        for dir_entry in readdir {
            let file_type = dir_entry.file_type();

            let entry_path = source_path.clone() + "/" + &dir_entry.file_name();
            items.push(PathInfo {
                path: entry_path.clone(),
                file_type: file_type,
                size: dir_entry.metadata().size.unwrap_or(0),
            });
            if file_type == RusshFileType::Dir {
                let sub_items = self
                    .list_directory_contents_sftp_wrapper(entry_path)
                    .await?;
                items.extend(sub_items);
            }
        }
        Ok(items)
    }

    fn list_directory_contents_sftp_wrapper(
        &self,
        source_path: String, // Take ownership
    ) -> Pin<Box<dyn Future<Output = Result<Vec<PathInfo>, EnumError>> + Send + '_>> {
        // Now directly pass the owned Strings without referencing them
        Box::pin(self.list_directory_contents_sftp(source_path))
    }
}

impl From<russh::Error> for EnumError {
    fn from(error: russh::Error) -> Self {
        EnumError::Oops {
            msg: format!("russh: {}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}

impl From<russh_sftp::client::error::Error> for EnumError {
    fn from(error: russh_sftp::client::error::Error) -> Self {
        EnumError::Oops {
            msg: format!("russh_sftp: {}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}

impl From<std::io::Error> for EnumError {
    fn from(error: std::io::Error) -> Self {
        EnumError::Oops {
            msg: format!("std: {}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}

impl From<tokio::task::JoinError> for EnumError {
    fn from(error: tokio::task::JoinError) -> Self {
        EnumError::Oops {
            msg: format!("tokio: {}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}

impl From<tokio::time::error::Elapsed> for EnumError {
    fn from(error: tokio::time::error::Elapsed) -> Self {
        EnumError::Oops {
            msg: format!("tokio elapsed err: {}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}

impl<T: std::fmt::Debug> From<tokio::sync::mpsc::error::SendError<T>> for EnumError {
    fn from(error: tokio::sync::mpsc::error::SendError<T>) -> Self {
        EnumError::Oops {
            msg: format!("tokio mspc send error: {:?}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}

impl<T: std::fmt::Debug> From<tokio::sync::watch::error::SendError<T>> for EnumError {
    fn from(error: tokio::sync::watch::error::SendError<T>) -> Self {
        EnumError::Oops {
            msg: format!("tokio watch send error: {:?}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}
