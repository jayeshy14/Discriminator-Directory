use actix_web::{web, HttpRequest, HttpResponse, Responder};
use serde_json::json;
use crate::graph_disc::{GraphDatabase, DatabaseInterface};
use crate::solana_connection::SolanaConnection;
use log::{error, info};

pub async fn query_discriminators_endpoint(
    db: web::Data<GraphDatabase>,
    solana_client: web::Data<SolanaConnection>,
    program_id: web::Path<String>,
) -> impl Responder {
    let program_id = program_id.into_inner();

    // Check if discriminators are in the database
    let discriminators = db.query_discriminators_and_instructions(&program_id).await;

    match discriminators {
        Ok(discriminators) => {
            if !discriminators.is_empty() {
                // Return discriminators if found in the database
                HttpResponse::Ok().json(discriminators)
            } else {
                // If not found in DB, fetch from Solana
                let accounts_result = solana_client.get_program_accounts(&program_id);

                match accounts_result.await {
                    Ok(accounts) => {
                        let mut uploaded_any = false;
                        for (pub_key, account) in accounts {
                            // Skip accounts with insufficient data
                            if account.data.len() < 8 {
                                continue;
                            }

                            let data = &account.data;
                            // Extract the discriminator from account data
                            let discriminator_data = data[0..8].to_vec();
                            let instruction_data = data[8..].to_vec();

                            if let Err(e) = db.upload_discriminator(
                                &program_id,
                                discriminator_data,
                                instruction_data,
                                &pub_key.to_string(),
                            ).await {
                                error!("Error uploading discriminator: {}", e);
                                return HttpResponse::InternalServerError().body(e.to_string());
                            }

                            uploaded_any = true;
                        }

                        if uploaded_any {
                            let disc = db.query_discriminators_and_instructions(&program_id).await;
                            match disc {
                                Ok(disc) => HttpResponse::Ok().json(disc),
                                Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
                            }
                        } else {
                            HttpResponse::NotFound().body("No discriminators found in Solana accounts")
                        }
                    }
                    Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
                }
            }
        }
        Err(e) => HttpResponse::InternalServerError().body(e.to_string()),
    }
}


pub async fn upload_discriminator_endpoint(
    db: web::Data<GraphDatabase>,
    program_id: web::Path<String>,
    discriminator_info: web::Json<(String, String, String)>,
    req: HttpRequest,
) -> impl Responder {
    let program_id = program_id.into_inner();
    let (discriminator, instruction, _) = discriminator_info.into_inner();
    info!("Uploading discriminator for program_id: {}", program_id);

    // Extract user_id from the headers
    let user_id = match req.headers().get("user_id") {
        Some(value) => match value.to_str() {
            Ok(v) => v.to_string(),
            Err(_) => return HttpResponse::BadRequest().json(json!({"error": "Invalid user_id header value"})),
        },
        None => return HttpResponse::BadRequest().json(json!({"error": "Missing user_id header"})),
    };

    match db.upload_discriminator(&program_id, discriminator.into_bytes(), instruction.into_bytes(), &user_id).await {
        Ok(_) => HttpResponse::Ok().json(json!({"status": "Discriminator uploaded successfully"})),
        Err(e) => {
            error!("Error uploading discriminator to DB: {}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to upload discriminator to DB"}))
        }
    }
}

// New endpoint to query instructions by discriminator ID
pub async fn query_instructions_endpoint(
    db: web::Data<GraphDatabase>,
    discriminator_id: web::Path<String>,
) -> impl Responder {
    let discriminator_id = discriminator_id.into_inner();
    info!("Querying instructions for discriminator_id: {}", discriminator_id);
    
    // Query the database for instructions with this discriminator ID
    match db.query_instructions_by_discriminator(&discriminator_id).await {
        Ok(instructions) => {
            HttpResponse::Ok().json(instructions)
        },
        Err(e) => {
            error!("Error querying instructions: {}", e);
            HttpResponse::InternalServerError().json(json!({"error": "Failed to query instructions"}))
        }
    }
}
