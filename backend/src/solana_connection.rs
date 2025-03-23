use std::error::Error;
use std::str::FromStr;
use std::sync::Arc;
use solana_client::{rpc_client::RpcClient, rpc_response::RpcConfirmedTransactionStatusWithSignature};
use solana_sdk::account::Account;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::signature::Signature;
use solana_transaction_status::UiTransactionEncoding;
use solana_sdk::pubkey::Pubkey;
use tokio::task;
use log::{info, error, warn, debug};
use thiserror::Error;


use crate::graph_disc::DatabaseInterface;

#[derive(Error, Debug)]
pub enum SolanaError {
    #[error("RPC client error: {0}")]
    RpcError(String),
    
    #[error("Failed to parse pubkey: {0}")]
    PubkeyParseError(String),
    
    #[error("Failed to parse signature: {0}")]
    SignatureParseError(String),
    
    #[error("Transaction decode error")]
    TransactionDecodeError,
    
    #[error("Invalid instruction data: {0}")]
    InvalidInstructionData(String),
}

pub struct SolanaConnection {
    client: Arc<RpcClient>,
}

impl SolanaConnection {
    pub fn new(url: &str) -> Self {
        let client = Arc::new(RpcClient::new_with_commitment(url.to_string(), CommitmentConfig::confirmed()));
        info!("Connected to Solana node at {}", url);
        SolanaConnection { client }
    }

    // Use spawn_blocking for RPC calls
    pub async fn get_program_accounts(&self, program_id: &str) -> Result<Vec<(Pubkey, Account)>, String> {
        let program_id_str = program_id.to_string();
        let program_pubkey = match Pubkey::from_str(program_id) {
            Ok(pubkey) => pubkey,
            Err(e) => {
                let err_msg = format!("Invalid program ID {}: {}", program_id, e);
                error!("{}", err_msg);
                return Err(err_msg);
            }
        };
        
        let client = self.client.clone();
        debug!("Fetching program accounts for program {}", program_id);

        // Move the RPC call to a blocking task
        match task::spawn_blocking(move || {
            client.get_program_accounts(&program_pubkey)
        }).await {
            Ok(result) => match result {
                Ok(accounts) => {
                    info!("Successfully fetched {} accounts for program {}", accounts.len(), program_id_str);
                    Ok(accounts)
                },
                Err(e) => {
                    let err_msg = format!("Failed to get program accounts: {}", e);
                    error!("{}", err_msg);
                    Err(err_msg)
                }
            },
            Err(e) => {
                let err_msg = format!("Task execution error: {}", e);
                error!("{}", err_msg);
                Err(err_msg)
            }
        }
    }
    
    pub async fn get_transactions(
        &self, 
        program_id: &str
    ) -> Result<Vec<RpcConfirmedTransactionStatusWithSignature>, SolanaError> {
        let program_pubkey = match Pubkey::from_str(program_id) {
            Ok(pubkey) => pubkey,
            Err(e) => return Err(SolanaError::PubkeyParseError(e.to_string())),
        };
    
        debug!("Fetching signatures for program {}", program_id);
        let client = self.client.clone();
        
        // Use spawn_blocking to handle the synchronous part of this call.
        let signatures = match task::spawn_blocking(move || {
            client.get_signatures_for_address(&program_pubkey)
        }).await {
            Ok(result) => match result {
                Ok(sigs) => {
                    info!("Retrieved {} transaction signatures for program {}", sigs.len(), program_id);
                    sigs
                },
                Err(e) => return Err(SolanaError::RpcError(e.to_string())),
            },
            Err(e) => return Err(SolanaError::RpcError(e.to_string())),
        };
    
        Ok(signatures)
    }

    pub async fn real_time_listener<T>(
        &self, 
        db: Arc<T>,
        program_id: String,
    ) -> Result<(), Box<dyn Error + Send + Sync>> 
    where 
        T: DatabaseInterface + Send + Sync + 'static
    {
        info!("Starting real-time listener for program {}", program_id);
        
        // Keep track of processed signatures to avoid duplication
        let mut processed_signatures = std::collections::HashSet::new();
        
        loop {
            match self.get_transactions(&program_id).await {
                Ok(signatures) => {
                    info!("Fetched {} signatures for program {}", signatures.len(), program_id);
                    
                    for signature in signatures {
                        // Skip already processed signatures
                        if processed_signatures.contains(&signature.signature) {
                            continue;
                        }
                        
                        let tx_signature = match Signature::from_str(&signature.signature) {
                            Ok(sig) => sig,
                            Err(e) => {
                                error!("Failed to parse signature {}: {}", signature.signature, e);
                                continue;
                            }
                        };
                        
                        let client = self.client.clone();
                        
                        // Use spawn_blocking for the RPC call
                        let transaction_result = match task::spawn_blocking(move || {
                            client.get_transaction(&tx_signature, UiTransactionEncoding::Json)
                        }).await {
                            Ok(result) => match result {
                                Ok(tx) => tx,
                                Err(e) => {
                                    error!("Failed to get transaction {}: {}", signature.signature, e);
                                    continue;
                                }
                            },
                            Err(e) => {
                                error!("Task execution error for transaction {}: {}", signature.signature, e);
                                continue;
                            }
                        };

                        // Decode and process the transaction
                        if let Some(transaction) = transaction_result.transaction.transaction.decode() {
                            let instructions = transaction.message.instructions();
                            debug!("Processing {} instructions in transaction {}", instructions.len(), signature.signature);

                            // Get account keys from the appropriate message type
                            let account_keys = match &transaction.message {
                                solana_sdk::message::VersionedMessage::Legacy(message) => &message.account_keys,
                                solana_sdk::message::VersionedMessage::V0(message) => &message.account_keys,
                            };

                            for (i, instruction) in instructions.iter().enumerate() {
                                // Get the real program ID for this instruction
                                let program_id_index = instruction.program_id_index as usize;
                                if program_id_index >= account_keys.len() {
                                    warn!("Invalid program ID index {} in instruction {}", program_id_index, i);
                                    continue;
                                }
                                
                                let instruction_program_id = account_keys[program_id_index].to_string();
                                
                                let accounts = instruction.accounts.clone();
                                let data = instruction.data.clone();
                                
                                // Skip instructions with insufficient data
                                if data.len() < 8 {
                                    debug!("Instruction data too short in transaction {}, instruction {}", signature.signature, i);
                                    continue;
                                }
                                
                                let discriminator_data = data[0..8].to_vec();
                                let instruction_data = data[8..].to_vec();
                                
                                // Use the first account as user ID, or fall back to the transaction signature
                                let user_id = if !accounts.is_empty() && (accounts[0] as usize) < account_keys.len() {
                                    account_keys[accounts[0] as usize].to_string()
                                } else {
                                    signature.signature.clone()
                                };

                                // Store the extracted data in the database
                                if let Err(e) = db.upload_discriminator(
                                    &instruction_program_id,
                                    discriminator_data,
                                    instruction_data,
                                    &user_id,
                                ).await {
                                    error!("Failed to store transaction data for {}: {}", signature.signature, e);
                                } else {
                                    debug!("Successfully stored discriminator from transaction {}", signature.signature);
                                }
                            }
                        } else {
                            warn!("Could not decode transaction {}", signature.signature);
                        }
                        
                        // Mark this signature as processed
                        processed_signatures.insert(signature.signature);
                        
                        // Limit the size of the processed signatures set
                        if processed_signatures.len() > 1000 {
                            processed_signatures.clear();
                        }
                    }
                }
                Err(e) => error!("Error fetching transactions for program {}: {:?}", program_id, e),
            }

            debug!("Waiting before next polling cycle for program {}", program_id);
            tokio::time::sleep(tokio::time::Duration::from_secs(30)).await;
        }
    }
}

// Implement the Clone trait manually
impl Clone for SolanaConnection {
    fn clone(&self) -> Self {
        SolanaConnection {
            client: Arc::clone(&self.client),
        }
    }
}

