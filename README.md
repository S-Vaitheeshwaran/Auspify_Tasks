# Auspify Tasks

This repository contains a React frontend and a Spring Boot backend:

- `Task_Frontend` - React, Vite, and npm
- `Tasks_Backend` - Java 21, Spring Boot, Maven, and MySQL

## Prerequisites

- Node.js and npm
- JDK 21
- MySQL Server

## Configure and run the backend

1. Create the database in MySQL:

   ```sql
   CREATE DATABASE TaskAuspify;
   ```

2. Open `Tasks_Backend/src/main/resources/application.properties`.
3. Set `spring.datasource.username` and `spring.datasource.password` to your local MySQL credentials.
4. Replace `app.jwt.secret=ENTER_BASE64_ENCODED_32_BYTE_SECRET_HERE` with a newly generated Base64 secret containing at least 32 random bytes. For example, in PowerShell:

   ```powershell
   $bytes = New-Object byte[] 32
   $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
   $rng.GetBytes($bytes)
   [Convert]::ToBase64String($bytes)
   $rng.Dispose()
   ```

   Keep this key private. Changing it invalidates existing login tokens.
5. Configure email sending:
   - Set `spring.mail.username` and `app.mail.from` to the Gmail account that sends email.
   - Replace `spring.mail.password=ENTER_YOUR_GMAIL_APP_PASSWORD_HERE` with that account's **Google App Password**. Enable 2-Step Verification on the Google account and generate an App Password; do not use your regular Gmail password.
   - Keep the App Password private and do not commit your real password to Git.
6. From `Tasks_Backend`, start the Spring Boot application:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

   Alternatively, import `Tasks_Backend` as an existing Maven project in Eclipse and run its Spring Boot application class.

The backend listens on `http://localhost:8080`. Its CORS configuration allows the Vite development origin at `http://localhost:5173`.

## Configure and run the frontend

1. In `Task_Frontend`, create a local `.env` file with the backend URL:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:8080
   ```

   Keep this file local; do not commit credentials or secrets in it.
2. From `Task_Frontend`, install dependencies and start Vite:

   ```powershell
   npm install
   npm run dev
   ```

3. Open the local URL printed by Vite, typically `http://localhost:5173`.

For a production build, run `npm run build` from `Task_Frontend`.
