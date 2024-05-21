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
