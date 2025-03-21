FROM rust:1.67 as backend-builder

# Create a new empty shell project
WORKDIR /usr/src/discriminator-directory
COPY backend .

# Build the backend
RUN cargo build --release

# Build the frontend
FROM node:16-alpine as frontend-builder
WORKDIR /usr/src/discriminator-directory
COPY frontend .
RUN npm install
RUN npm run build

# Final image
FROM debian:bullseye-slim
WORKDIR /usr/src/discriminator-directory

# Install OpenSSL
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy the backend binary from the builder
COPY --from=backend-builder /usr/src/discriminator-directory/target/release/discriminator-directory .

# Copy the frontend build
COPY --from=frontend-builder /usr/src/discriminator-directory/build ./frontend/build

# Set the environment variable
ENV DATABASE_URL=postgres://postgres:password@postgres:5432/discriminator_directory

# Expose the port
EXPOSE 8080

# Run the binary
CMD ["./discriminator-directory"]