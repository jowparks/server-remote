uniffi::setup_scaffolding!();

#[derive(thiserror::Error, uniffi::Error, Debug)]
pub enum EnumError {
    #[error("Oops: {msg}\n{backtrace}")]
    Oops { msg: String, backtrace: String },
}

use std::backtrace::Backtrace;
use std::collections::HashMap;
use std::os::unix::fs::MetadataExt;
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

/// This struct is a convenience wrapper
/// around a russh client
/// that handles the input/output event loop
#[derive(uniffi::Object)]
pub struct Session {
    session: Arc<Mutex<client::Handle<Client>>>,
    output: Arc<Mutex<HashMap<String, Arc<Mutex<UnboundedReceiver<String>>>>>>,
    transfer_progress: Arc<Mutex<HashMap<String, Arc<Mutex<ReceiverWatch<u64>>>>>>,
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
        let handle = TOKIO_RUNTIME.spawn(async move {
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
        });
        handle.await.unwrap()
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
        let handle = TOKIO_RUNTIME.spawn(async move {
            let channel = self.session.lock().await.channel_open_session().await?;
            channel.request_subsystem(true, "sftp").await?;
            let sftp = SftpSession::new(channel.into_stream()).await?;

            println!(
                "RUST: Transferring between {} {}",
                source_path, destination_path
            );

            let mut source_file: FileType;
            let mut destination_file: FileType;
            if direction == "upload" {
                source_file = FileType::Tokio(TokioFile::open(source_path).await?);
                destination_file = FileType::Russh(sftp.create(destination_path).await?);
            } else {
                source_file = FileType::Russh(sftp.open(source_path).await?);
                destination_file = FileType::Tokio(TokioFile::create(destination_path).await?);
            }
            let file_size = source_file.file_size().await?;
            let mut total_bytes = 0u64;
            let (transfer_sender, transfer_receiver) = tokio::sync::watch::channel(0u64);
            {
                let mut transfer = self.transfer_progress.lock().await;
                transfer.insert(transfer_id.clone(), Arc::new(Mutex::new(transfer_receiver)));
            }

            let mut buffer = [0; 100000];
            println!("RUST: Transferring");
            loop {
                if !cancel_receiver.is_empty() {
                    sftp.close().await?;
                    drop(cancel_receiver);
                    println!("Transfer Cancelled {}", transfer_id);
                    break;
                }
                let bytes_left = file_size - total_bytes;
                let read_size = std::cmp::min(buffer.len(), bytes_left as usize);

                let bytes_read = source_file.read(&mut buffer[..read_size]).await?;
                if bytes_read == 0 {
                    break;
                }
                // println!("RUST: Transferring {} bytes", bytes_read);

                destination_file.write_all(&buffer[..bytes_read]).await?;
                total_bytes += bytes_read as u64;
                transfer_sender.send(total_bytes)?;
            }
            Ok(())
        });
        handle.await.unwrap()
    }

    async fn transfer_progress(self: Arc<Self>, transfer_id: &str) -> Option<u64> {
        let transfer_id = transfer_id.to_owned();
        let handle = TOKIO_RUNTIME.spawn(async move {
            let transfer = self.transfer_progress.lock().await;
            let progress = transfer.get(&transfer_id);
            if let Some(progress) = progress {
                Some(progress.lock().await.borrow().clone())
            } else {
                None
            }
        });
        handle.await.unwrap()
    }

    async fn read_output(self: Arc<Self>, command_id: &str) -> Option<String> {
        let command_id = command_id.to_owned();
        let handle = TOKIO_RUNTIME.spawn(async move {
            let output = self.output.lock().await;
            let rx = output.get(&command_id);
            if let Some(rx) = rx {
                rx.lock().await.recv().await
            } else {
                None
            }
        });
        handle.await.unwrap()
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
        let handle = TOKIO_RUNTIME.spawn(async move {
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
        });
        handle.await.unwrap()
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
