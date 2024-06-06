uniffi::setup_scaffolding!();

#[derive(thiserror::Error, uniffi::Error, Debug)]
pub enum EnumError {
    #[error("Oops: {msg}\n{backtrace}")]
    Oops { msg: String, backtrace: String },
}

#[derive(uniffi::Record)]
pub struct WitnessNode {
    pub side: String,
    pub hash_of_sibling: Vec<u8>,
}

#[derive(uniffi::Record)]
pub struct SpendComponents {
    pub note: Vec<u8>,
    pub witness_root_hash: Vec<u8>,
    pub witness_tree_size: u64,
    pub witness_auth_path: Vec<WitnessNode>,
}

#[derive(uniffi::Record)]
pub struct NoteParams {
    owner: Vec<u8>,
    value: u64,
    memo: Vec<u8>,
    asset_id: Vec<u8>,
    sender: Vec<u8>,
}

#[derive(uniffi::Record)]
pub struct Key {
    pub spending_key: String,
    pub view_key: String,
    pub incoming_view_key: String,
    pub outgoing_view_key: String,
    pub public_address: String,
    pub proof_authorizing_key: String,
}

#[uniffi::export]
fn test_rust(num1: u64, num2: u64) -> u64 {
    num1 + num2
}

// #[derive(uniffi::Object)]
// pub struct NativeNote {
//     pub(crate) note: Note,
// }

// #[uniffi::export]
// impl NativeNote {
//     pub fn value(&self) -> u64 {
//         self.note.value()
//     }
// }

use std::backtrace::Backtrace;
use std::collections::HashMap;
///
/// Run this example with:
/// cargo run --all-features --example client_exec_interactive -- -k <private key path> <host> <command>
///
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc::UnboundedReceiver;
use tokio::sync::{mpsc, Mutex};

use anyhow::Result;
use async_trait::async_trait;
use once_cell::sync::Lazy;
use russh::*;
use russh_keys::*;
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
        }))
    })
}

#[uniffi::export]
impl Session {
    fn exec(self: Arc<Self>, command_id: &str, command: &str) -> Result<String, EnumError> {
        std::env::set_var("RUST_BACKTRACE", "1");
        // TODO: convert this to spawn potentially instead of needing to block
        TOKIO_RUNTIME.block_on(async {
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
            let mut return_code = String::new();

            channel.exec(true, command).await?;
            channel.close().await?;

            loop {
                // returns None if the channel is closed
                let Some(msg) = channel.wait().await else {
                    break;
                };
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
    }

    fn read_output(self: Arc<Self>, command_id: &str) -> Option<String> {
        TOKIO_RUNTIME.block_on(async {
            let output = self.output.lock().await;
            let rx = output.get(command_id);
            if let Some(rx) = rx {
                rx.lock().await.recv().await
            } else {
                None
            }
        })
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
}

impl From<russh::Error> for EnumError {
    fn from(error: russh::Error) -> Self {
        EnumError::Oops {
            msg: format!("russh: {}", error),
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

impl From<tokio::sync::mpsc::error::SendError<String>> for EnumError {
    fn from(error: tokio::sync::mpsc::error::SendError<String>) -> Self {
        EnumError::Oops {
            msg: format!("tokio: {}", error),
            backtrace: Backtrace::capture().to_string(),
        }
    }
}
