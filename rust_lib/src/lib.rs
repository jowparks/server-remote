uniffi::setup_scaffolding!();

#[derive(thiserror::Error, uniffi::Error, Debug)]
pub enum EnumError {
    #[error("Oops: {msg}")]
    Oops { msg: String },
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

///
/// Run this example with:
/// cargo run --all-features --example client_exec_interactive -- -k <private key path> <host> <command>
///
use std::path::Path;
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::Mutex;

use anyhow::Result;
use async_trait::async_trait;
use russh::*;
use russh_keys::*;
use tokio::io::AsyncWriteExt;
use tokio::net::ToSocketAddrs;

// #[tokio::main]
// async fn main() -> Result<()> {
//     env_logger::builder()
//         .filter_level(log::LevelFilter::Info)
//         .init();

//     // CLI options are defined later in this file
//     let cli = Cli::parse();

//     info!("Connecting to {}:{}", cli.host, cli.port);
//     info!("Key path: {:?}", cli.private_key);
//     info!("OpenSSH Certificate path: {:?}", cli.openssh_certificate);

//     // Session is a wrapper around a russh client, defined down below
//     let mut ssh = Session::connect(
//         cli.private_key,
//         cli.username.unwrap_or("root".to_string()),
//         cli.openssh_certificate,
//         (cli.host, cli.port),
//     )
//     .await?;
//     info!("Connected");

//     let code = {
//         // We're using `termion` to put the terminal into raw mode, so that we can
//         // display the output of interactive applications correctly
//         let _raw_term = std::io::stdout().into_raw_mode()?;
//         ssh.call(
//             &cli.command
//                 .into_iter()
//                 .map(|x| shell_escape::escape(x.into())) // arguments are escaped manually since the SSH protocol doesn't support quoting
//                 .collect::<Vec<_>>()
//                 .join(" "),
//         )
//         .await?
//     };

//     println!("Exitcode: {:?}", code);
//     ssh.close().await?;
//     Ok(())
// }

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
}

#[uniffi::export]
async fn connect(user: String, password: String, addrs: String) -> Result<Session, EnumError> {
    let config = client::Config {
        inactivity_timeout: Some(Duration::from_secs(5)),
        ..<_>::default()
    };

    let config = Arc::new(config);
    let sh = Client {};

    let mut session = client::connect(config, addrs, sh).await?;

    let auth_res = session.authenticate_password(user, password).await?;

    if !auth_res {
        return Err(EnumError::Oops {
            msg: String::from("Authentication with password failed"),
        });
    }
    Ok(Session {
        session: Arc::new(Mutex::new(session)),
    })
}

#[uniffi::export]
impl Session {
    async fn call(&self, command: &str) -> Result<u32, EnumError> {
        let session = self.session.lock().await;
        let mut channel = session.channel_open_session().await?;
        channel.exec(true, command).await?;

        let mut code = None;
        // save channel msg data to string
        let mut output: Vec<u8> = Vec::new();

        loop {
            // There's an event available on the session channel
            let Some(msg) = channel.wait().await else {
                break;
            };
            match msg {
                // Write data to the terminal
                ChannelMsg::Data { ref data } => {
                    // add data to vec using std::io::Write
                    output.write_all(data).await?;
                }
                // The command has returned an exit code
                ChannelMsg::ExitStatus { exit_status } => {
                    code = Some(exit_status);
                    // cannot leave the loop immediately, there might still be more data to receive
                }
                _ => {}
            }
        }
        Ok(code.expect("program did not exit cleanly"))
    }

    async fn close(&self) -> Result<(), EnumError> {
        let session = self.session.lock().await;
        session
            .disconnect(Disconnect::ByApplication, "", "English")
            .await?;
        Ok(())
    }
}

impl From<russh::Error> for EnumError {
    fn from(error: russh::Error) -> Self {
        EnumError::Oops {
            msg: format!("{}", error),
        }
    }
}

impl From<std::io::Error> for EnumError {
    fn from(error: std::io::Error) -> Self {
        EnumError::Oops {
            msg: format!("{}", error),
        }
    }
}
