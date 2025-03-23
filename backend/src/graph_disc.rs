use std::error::Error;

use serde::{Deserialize, Serialize};
use log::{info, error, debug};
use thiserror::Error;
use sha2::{Digest, Sha256};
use sqlx::{PgPool, postgres::PgPoolOptions, Row};

use async_trait::async_trait;

// Structs for representing data in PostgreSQL
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Program {
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Discriminator {
    pub id: String,
    pub discriminator_id: String,
    pub discriminator_data: Vec<u8>,
    pub instruction: Instruction,
    pub user_id: String,
    pub program_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Instruction {
    pub id: String,
    pub instruction_id: String,
    pub instruction_data: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    pub id: String,
}

// Custom error type to handle database-related errors
#[derive(Error, Debug)]
pub enum DatabaseError {
    #[error("Database error: {0}")]
    SqlxError(#[from] sqlx::Error),

    #[error("Failed to insert data: {0}")]
    InsertionError(String),
    
    #[error("Failed to execute query: {0}")]
    QueryError(String),
    
    #[error("Data parsing error: {0}")]
    DataParsingError(String),
    
    #[error("Transaction error: {0}")]
    TransactionError(String),
}

// Database interface trait for testing
#[async_trait]
pub trait DatabaseInterface: Send + Sync {
    async fn upload_discriminator(
        &self,
        program_id: &str,
        discriminator_data: Vec<u8>,
        instruction_data: Vec<u8>,
        user_id: &str,
    ) -> Result<(), DatabaseError>;
    
    async fn query_discriminators_and_instructions(&self, program_id: &str) -> Result<Vec<Discriminator>, DatabaseError>;
    
    async fn get_all_program_ids(&self) -> Result<Vec<String>, DatabaseError>;

    // Add new method for querying instructions by discriminator ID
    async fn query_instructions_by_discriminator(&self, discriminator_id: &str) -> Result<Vec<String>, DatabaseError>;
}

// Struct for interacting with the PostgreSQL database
pub struct GraphDatabase {
    pool: PgPool,
}

// Implement Clone for GraphDatabase
impl Clone for GraphDatabase {
    fn clone(&self) -> Self {
        GraphDatabase {
            pool: self.pool.clone(),
        }
    }
}

#[async_trait]
impl DatabaseInterface for GraphDatabase {
    async fn upload_discriminator(
        &self,
        program_id: &str,
        discriminator_data: Vec<u8>,
        instruction_data: Vec<u8>,
        user_id: &str,
    ) -> Result<(), DatabaseError> {
        debug!("Uploading discriminator for program {}", program_id);
        
        if discriminator_data.len() != 8 {
            return Err(DatabaseError::DataParsingError(format!(
                "Invalid discriminator data length: {}, expected 8 bytes", 
                discriminator_data.len()
            )));
        }

        let discriminator_id = hex::encode(&discriminator_data);
        let instruction_id = hex::encode(&instruction_data);
        
        // Create a transaction so we can rollback if any part fails
        let mut tx = self.pool.begin().await
            .map_err(|e| DatabaseError::TransactionError(e.to_string()))?;
        
        // Insert or update program
        sqlx::query(r#"
            INSERT INTO programs (id) 
            VALUES ($1)
            ON CONFLICT (id) DO NOTHING
        "#)
        .bind(program_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| DatabaseError::InsertionError(e.to_string()))?;
        
        // Insert or update user
        sqlx::query(r#"
            INSERT INTO users (id) 
            VALUES ($1)
            ON CONFLICT (id) DO NOTHING
        "#)
        .bind(user_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| DatabaseError::InsertionError(e.to_string()))?;
        
        // Generate unique IDs for discriminator and instruction
        let discriminator_unique_id = format!("{}_{}", program_id, discriminator_id);
        let instruction_unique_id = format!("{}_{}", program_id, Self::hash_key(&instruction_id));
        
        // Insert or update instruction
        sqlx::query(r#"
            INSERT INTO instructions (id, instruction_id, instruction_data) 
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE 
            SET instruction_id = EXCLUDED.instruction_id,
                instruction_data = EXCLUDED.instruction_data
        "#)
        .bind(&instruction_unique_id)
        .bind(&instruction_id)
        .bind(&instruction_data)
        .execute(&mut *tx)
        .await
        .map_err(|e| DatabaseError::InsertionError(e.to_string()))?;
        
        // Insert or update discriminator with relationships
        sqlx::query(r#"
            INSERT INTO discriminators (id, discriminator_id, discriminator_data, instruction_id, user_id, program_id) 
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE 
            SET discriminator_id = EXCLUDED.discriminator_id,
                discriminator_data = EXCLUDED.discriminator_data,
                instruction_id = EXCLUDED.instruction_id,
                user_id = EXCLUDED.user_id
        "#)
        .bind(&discriminator_unique_id)
        .bind(&discriminator_id)
        .bind(&discriminator_data)
        .bind(&instruction_unique_id)
        .bind(user_id)
        .bind(program_id)
        .execute(&mut *tx)
        .await
        .map_err(|e| DatabaseError::InsertionError(e.to_string()))?;
        
        // Commit the transaction
        tx.commit().await
            .map_err(|e| DatabaseError::TransactionError(e.to_string()))?;
        
        info!("Successfully uploaded discriminator {} for program {}", discriminator_id, program_id);
        Ok(())
    }
    
    async fn query_discriminators_and_instructions(&self, program_id: &str) -> Result<Vec<Discriminator>, DatabaseError> {
        debug!("Querying discriminators for program {}", program_id);
        
        let rows = sqlx::query(r#"
            SELECT d.id, d.discriminator_id, d.discriminator_data, d.program_id, d.user_id,
                   i.id as instruction_id, i.instruction_id as instruction_id_value, i.instruction_data
            FROM discriminators d
            JOIN instructions i ON d.instruction_id = i.id
            WHERE d.program_id = $1
        "#)
        .bind(program_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DatabaseError::QueryError(e.to_string()))?;
        
        let mut discriminators = Vec::new();
        
        for row in rows {
            let discriminator = Discriminator {
                id: row.get("id"),
                discriminator_id: row.get("discriminator_id"),
                discriminator_data: row.get("discriminator_data"),
                program_id: row.get("program_id"),
                user_id: row.get("user_id"),
                instruction: Instruction {
                    id: row.get("instruction_id"),
                    instruction_id: row.get("instruction_id_value"),
                    instruction_data: row.get("instruction_data"),
                },
            };
            
            discriminators.push(discriminator);
        }
        
        info!("Found {} discriminators for program {}", discriminators.len(), program_id);
        Ok(discriminators)
    }
    
    async fn get_all_program_ids(&self) -> Result<Vec<String>, DatabaseError> {
        debug!("Fetching all program IDs");
        
        let rows = sqlx::query("SELECT id FROM programs")
            .fetch_all(&self.pool)
            .await
            .map_err(|e| DatabaseError::QueryError(e.to_string()))?;
        
        let program_ids: Vec<String> = rows.iter()
            .map(|row| row.get("id"))
            .collect();
            
        info!("Retrieved {} program IDs", program_ids.len());
        Ok(program_ids)
    }

    async fn query_instructions_by_discriminator(&self, discriminator_id: &str) -> Result<Vec<String>, DatabaseError> {
        debug!("Querying instructions for discriminator {}", discriminator_id);
        
        let rows = sqlx::query(r#"
            SELECT i.instruction_data 
            FROM instructions i
            JOIN discriminators d ON i.id = d.instruction_id
            WHERE d.discriminator_id = $1
        "#)
        .bind(discriminator_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| DatabaseError::QueryError(e.to_string()))?;
        
        let instructions: Vec<String> = rows.iter()
            .map(|row| {
                let instruction_data: Vec<u8> = row.get("instruction_data");
                hex::encode(instruction_data)
            })
            .collect();
            
        info!("Found {} instructions for discriminator {}", instructions.len(), discriminator_id);
        Ok(instructions)
    }
}

impl GraphDatabase {
    // Function to initialize a new GraphDatabase instance
    pub async fn new(database_url: &str) -> Result<Self, Box<dyn Error>> {
        info!("Connecting to PostgreSQL at {}", database_url);
        
        // Create a connection pool
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await?;
        
        // Initialize database schema if needed
        Self::initialize_schema(&pool).await?;
        
        info!("Successfully initialized database connection");
        
        Ok(GraphDatabase { pool })
    }
    
    // Create database schema if it doesn't exist
    async fn initialize_schema(pool: &PgPool) -> Result<(), Box<dyn Error>> {
        // Create programs table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS programs (
                id TEXT PRIMARY KEY
            )
        "#)
        .execute(pool)
        .await?;
        
        // Create users table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY
            )
        "#)
        .execute(pool)
        .await?;
        
        // Create instructions table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS instructions (
                id TEXT PRIMARY KEY,
                instruction_id TEXT NOT NULL,
                instruction_data BYTEA NOT NULL
            )
        "#)
        .execute(pool)
        .await?;
        
        // Create discriminators table
        sqlx::query(r#"
            CREATE TABLE IF NOT EXISTS discriminators (
                id TEXT PRIMARY KEY,
                discriminator_id TEXT NOT NULL,
                discriminator_data BYTEA NOT NULL,
                instruction_id TEXT NOT NULL REFERENCES instructions(id),
                user_id TEXT NOT NULL REFERENCES users(id),
                program_id TEXT NOT NULL REFERENCES programs(id)
            )
        "#)
        .execute(pool)
        .await?;
        
        // Create index on discriminators
        sqlx::query(r#"
            CREATE INDEX IF NOT EXISTS idx_discriminators_program_id ON discriminators(program_id)
        "#)
        .execute(pool)
        .await?;
        
        Ok(())
    }
    
    // Function to hash keys
    fn hash_key(input: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(input);
        hex::encode(hasher.finalize())
    }
}
