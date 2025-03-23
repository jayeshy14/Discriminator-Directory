use actix_web::{web, App, HttpServer, HttpResponse};
use std::sync::Arc;
use actix_cors::Cors;
use log::{info, error, warn, LevelFilter};

// Importing modules containing functionalities
mod graph_disc;
mod query;
mod solana_connection;

// Importing specific functionalities from the modules
use graph_disc::{GraphDatabase, DatabaseInterface};
use query::{query_discriminators_endpoint, upload_discriminator_endpoint, query_instructions_endpoint};
use solana_connection::SolanaConnection;

// Simple handler for health check
async fn health_check() -> HttpResponse {
    HttpResponse::Ok().body("Discriminator Directory API is running")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::builder()
        .filter_level(LevelFilter::Info)
        .init();
    
    info!("Starting Discriminator Directory service");

    // PostgreSQL connection string
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:password@localhost:5432/discriminator_directory".to_string());

    // Try to create a database connection
    let db = match GraphDatabase::new(&database_url).await {
        Ok(db) => {
            info!("Successfully connected to the database.");
            let db_arc = Arc::new(db);
            
            // Fetch the list of program IDs from the database
            match db_arc.get_all_program_ids().await {
                Ok(program_ids) => {
                    info!("Fetched {} program IDs", program_ids.len());
                    
                    // Start real-time listeners for each program ID
                    let solana_client = Arc::new(SolanaConnection::new("https://api.devnet.solana.com"));
                    for program_id in program_ids {
                        let db_clone = db_arc.clone();
                        let solana_client_clone = solana_client.clone();
                        let program_id_clone = program_id.clone();
                    
                        tokio::spawn(async move {
                            if let Err(e) = solana_client_clone.real_time_listener(db_clone, program_id_clone).await {
                                error!("Error in real time listener: {}", e);
                            }
                        });
                    }
                    
                    Some((db_arc, Some(solana_client)))
                },
                Err(e) => {
                    error!("Failed to fetch program IDs: {:?}", e);
                    let solana_client = Arc::new(SolanaConnection::new("https://api.devnet.solana.com"));
                    Some((db_arc, Some(solana_client)))
                }
            }
        },
        Err(e) => {
            error!("Failed to connect to the database: {:?}", e);
            warn!("Starting server with limited functionality - database operations will not work");
            warn!("Make sure PostgreSQL is running and accessible at {}", database_url);
            
            None
        }
    };
    
    info!("Starting HTTP server on 127.0.0.1:8080");

    // Configure the server based on database availability
    match db {
        Some((database, Some(solana_client))) => {
            // Full functionality with database and Solana client
            HttpServer::new(move || {
                App::new()
                    .app_data(web::Data::from(database.clone()))
                    .app_data(web::Data::from(solana_client.clone()))
                    .wrap(Cors::default()
                        .allow_any_origin()
                        .allow_any_method()
                        .allow_any_header()
                    )
                    .service(
                        web::scope("")
                            .route("/", web::get().to(health_check))
                            .route("/health", web::get().to(health_check))
                            .route("/upload_discriminator/{program_id}", web::post().to(upload_discriminator_endpoint))
                            .route("/query_discriminators/{program_id}", web::get().to(query_discriminators_endpoint))
                            .route("/query_instructions/{discriminator_id}", web::get().to(query_instructions_endpoint))
                    )
            })
            .bind("127.0.0.1:8080")?
            .run()
            .await
        },
        Some((database, None)) => {
            // Database available but no Solana client
            let solana_client = Arc::new(SolanaConnection::new("https://api.devnet.solana.com"));
            HttpServer::new(move || {
                App::new()
                    .app_data(web::Data::from(database.clone()))
                    .app_data(web::Data::from(solana_client.clone()))
                    .wrap(Cors::default()
                        .allow_any_origin()
                        .allow_any_method()
                        .allow_any_header()
                    )
                    .service(
                        web::scope("")
                            .route("/", web::get().to(health_check))
                            .route("/health", web::get().to(health_check))
                            .route("/upload_discriminator/{program_id}", web::post().to(upload_discriminator_endpoint))
                            .route("/query_discriminators/{program_id}", web::get().to(query_discriminators_endpoint))
                            .route("/query_instructions/{discriminator_id}", web::get().to(query_instructions_endpoint))
                    )
            })
            .bind("127.0.0.1:8080")?
            .run()
            .await
        },
        None => {
            // Limited functionality mode - only health check available
            HttpServer::new(move || {
                App::new()
                    .wrap(Cors::default()
                        .allow_any_origin()
                        .allow_any_method()
                        .allow_any_header()
                    )
                    .service(
                        web::scope("")
                            .route("/", web::get().to(health_check))
                            .route("/health", web::get().to(health_check))
                            .route("/upload_discriminator/{program_id}", web::get().to(|| async {
                                HttpResponse::ServiceUnavailable().body("Database not available")
                            }))
                            .route("/query_discriminators/{program_id}", web::get().to(|| async {
                                HttpResponse::ServiceUnavailable().body("Database not available")
                            }))
                            .route("/query_instructions/{discriminator_id}", web::get().to(|| async {
                                HttpResponse::ServiceUnavailable().body("Database not available")
                            }))
                    )
            })
            .bind("127.0.0.1:8080")?
            .run()
            .await
        }
    }
}