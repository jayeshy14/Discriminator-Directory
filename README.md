# Discriminator Directory

An open-source infrastructure that enables developers to interact with unknown blockchain programs by providing a comprehensive, community-driven database of program discriminators.

## Overview

Discriminator Directory simplifies parsing program instructions and fosters better interaction with deployed but undocumented smart contracts on Solana. It provides:

- A searchable, comprehensive discriminator directory
- Real-time blockchain indexing of program discriminators
- A community-driven platform for contributing and accessing discriminators
- A robust API for querying and uploading discriminators

## Project Structure

The project consists of two main components:

1. **Backend** - A Rust-based API service that:
   - Connects to PostgreSQL to store and retrieve discriminators
   - Interfaces with the Solana blockchain to fetch on-chain data
   - Provides endpoints for querying and uploading discriminators
   - Monitors the blockchain in real-time to index new discriminators

2. **Frontend** - A React-based web application that:
   - Allows users to search for discriminators by program ID
   - Provides a form for uploading new discriminators
   - Displays discriminator data in a user-friendly format

## Setup Instructions

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Node.js](https://nodejs.org/) (v14 or newer)
- [PostgreSQL](https://www.postgresql.org/download/) (v12 or newer)

### Backend Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/discriminator-directory.git
   cd discriminator-directory
   ```

2. Set up the PostgreSQL database:
   ```
   createdb discriminator_directory
   ```

3. Configure the database connection string as an environment variable:
   ```
   export DATABASE_URL=postgres://username:password@localhost:5432/discriminator_directory
   ```

4. Build and run the backend:
   ```
   cd backend
   cargo build
   cargo run
   ```

   The backend API will be available at http://localhost:8080

### Frontend Setup

1. Install dependencies:
   ```
   cd frontend
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

   The frontend application will be available at http://localhost:3000

## API Documentation

### Endpoints

#### GET `/health`
Check if the API is running.

**Response:**
```
Discriminator Directory API is running
```

#### GET `/query_discriminators/{program_id}`
Get all discriminators associated with a program ID.

**Parameters:**
- `program_id` (path): The Solana program ID to query

**Response:**
```json
[
  {
    "id": "program_id_discriminator_id",
    "discriminator_id": "discriminator_id",
    "discriminator_data": [1, 2, 3, 4, 5, 6, 7, 8],
    "program_id": "program_id",
    "user_id": "user_id",
    "instruction": {
      "id": "instruction_id",
      "instruction_id": "instruction_id_value",
      "instruction_data": [9, 10, 11, 12, ...]
    }
  },
  ...
]
```

#### POST `/upload_discriminator/{program_id}`
Upload a new discriminator for a program.

**Parameters:**
- `program_id` (path): The Solana program ID
- Request body: JSON array containing [`discriminator`, `instruction`, `metadata`]
- Headers: `user_id` - The ID of the user uploading the discriminator

**Request Example:**
```json
["01020304050607", "0809101112131415", "metadata"]
```

**Response:**
```json
{
  "status": "Discriminator uploaded successfully"
}
```

## Features and Usage

### Searching for Discriminators

1. Navigate to the "Search Discriminators" page
2. Enter a valid Solana program ID
3. Click "Search"
4. View the results, which include:
   - Discriminator IDs
   - Raw discriminator data
   - Associated instruction data
   - User ID who contributed the discriminator

### Uploading Discriminators

1. Navigate to the "Upload Discriminator" page
2. Enter the program ID, user ID, discriminator data, and instruction data
3. Click "Upload Discriminator"
4. The discriminator will be added to the database and available for others to query

### Real-time Blockchain Monitoring

The backend automatically monitors the Solana blockchain for new transactions related to programs stored in the database. When new transactions are detected, the system extracts discriminators and adds them to the database.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.