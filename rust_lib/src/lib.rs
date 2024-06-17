uniffi::setup_scaffolding!();

#[derive(thiserror::Error, uniffi::Error, Debug)]
pub enum EnumError {
    #[error("Oops: {msg}\n{backtrace}")]
    Oops { msg: String, backtrace: String },
}

use std::backtrace::Backtrace;
use std::collections::HashMap;
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
use russh_sftp::client::SftpSession;
use tokio::fs::File as LocalFile;
use tokio::runtime::Runtime;

static TOKIO_RUNTIME: Lazy<Arc<Runtime>> = Lazy::new(|| Arc::new(Runtime::new().unwrap()));

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

    // TODO test this and get the paths right for the download in a platform agnostic way (handle paths in ios/android code)
    async fn download(
        self: Arc<Self>,
        transfer_id: &str,
        remote_path: &str,
        local_path: &str,
    ) -> Result<(), EnumError> {
        let transfer_id = transfer_id.to_owned();
        let remote_path = remote_path.to_owned();
        let local_path = local_path.to_owned();
        println!(
            "RUST2: Downloading {} {} to {}",
            transfer_id, remote_path, local_path
        );
        let handle = TOKIO_RUNTIME.spawn(async move {
            let channel = self.session.lock().await.channel_open_session().await?;
            channel.request_subsystem(true, "sftp").await?;
            println!("RUST2: sftp sesh");
            let sftp = SftpSession::new(channel.into_stream()).await?;

            println!("RUST: Download starting async");
            let mut file = sftp.open(remote_path).await?;
            // print file inof

            // println!("RUST: File metadata: {:?}", metadata);
            // Open a local file for writin

            // store download id in session with total bytes
            let (download_sender, download_receiver) = tokio::sync::watch::channel(0u64);
            {
                let mut transfer = self.transfer_progress.lock().await;
                transfer.insert(transfer_id.clone(), Arc::new(Mutex::new(download_receiver)));
            }

            // Create a buffer for the data
            let mut local_file = LocalFile::create(local_path).await?;
            let metadata = file.metadata().await?;
            let file_size = metadata.size.unwrap_or(0);
            let mut total_bytes = 0u64;

            // Determine buffer size based on file size, with a minimum of 1MB and a maximum of 100MB
            let buffer_size = if file_size < 1_000_000 {
                100_000
            } else {
                std::cmp::min(file_size as usize / 10, 100_000_000)
            };
            let mut buffer = vec![0; buffer_size];
            // TODO: make this read min(buffer.len(), bytes_left) instead of just buffer.len()
            loop {
                // Read data from the remote file
                let bytes_left = file_size - total_bytes;
                let read_size = std::cmp::min(buffer.len(), bytes_left as usize);

                let bytes_read = file.read(&mut buffer[..read_size]).await?;
                // // If no bytes were read, the file is done
                if bytes_read == 0 {
                    break;
                }
                // Write the data to the local file
                local_file.write_all(&buffer[..bytes_read]).await?;

                total_bytes += bytes_read as u64;
                download_sender.send(total_bytes)?;
            }
            println!("RUST: Download done");

            Ok(())
        });
        handle.await.unwrap()
    }

    async fn upload(
        self: Arc<Self>,
        transfer_id: &str,
        local_path: &str,
        remote_path: &str,
    ) -> Result<(), EnumError> {
        let transfer_id = transfer_id.to_owned();
        let remote_path = remote_path.to_owned();
        let local_path = local_path.to_owned();
        let handle = TOKIO_RUNTIME.spawn(async move {
            let channel = self.session.lock().await.channel_open_session().await?;
            channel.request_subsystem(true, "sftp").await?;
            let sftp = SftpSession::new(channel.into_stream()).await?;

            println!("RUST: Uploading from {} to {}", local_path, remote_path);
            let mut file = sftp.create(remote_path).await?;
            let mut local_file = LocalFile::open(local_path).await?;
            let metadata = local_file.metadata().await?;
            let file_size = metadata.len();
            let mut total_bytes = 0u64;
            let (upload_sender, upload_receiver) = tokio::sync::watch::channel(0u64);
            {
                let mut transfer = self.transfer_progress.lock().await;
                transfer.insert(transfer_id.clone(), Arc::new(Mutex::new(upload_receiver)));
            }

            let mut buffer = [0; 100000];
            println!("RUST: Uploading");
            loop {
                let bytes_left = file_size - total_bytes;
                let read_size = std::cmp::min(buffer.len(), bytes_left as usize);

                let bytes_read = local_file.read(&mut buffer[..read_size]).await?;
                if bytes_read == 0 {
                    break;
                }
                println!("RUST: Uploading {} bytes", bytes_read);

                file.write_all(&buffer[..bytes_read]).await?;
                total_bytes += bytes_read as u64;
                upload_sender.send(total_bytes)?;
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

    async fn cancel(self: Arc<Self>, command_id: &str) -> Result<(), EnumError> {
        let command_id = command_id.to_owned();
        let handle = TOKIO_RUNTIME.spawn(async move {
            let map = self.cancellation.lock().await;
            let cancellation = map.get(&command_id);
            if let Some(cancellation) = cancellation {
                cancellation.lock().await.send(1).await?;
                println!("Cancelling command {}", command_id);
                Ok(())
            } else {
                Err(EnumError::Oops {
                    msg: format!("Command {} not found", command_id),
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
