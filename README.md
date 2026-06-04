# AI-Powered SQL Query Generator & Executor

A full-stack MERN application to connect to external databases, generate SQL queries using OpenAI's GPT-4 based on natural language prompts, and execute them safely.

## Features
- **Dynamic Database Connections**: Connect to MySQL or PostgreSQL databases safely.
- **AI SQL Generation**: Use GPT-4o to turn plain English into optimized SQL queries.
- **Query Executor**: Run the AI-generated queries directly against your external databases and view the results in a data table.
- **Security First**: Encrypted connection credentials, JWT authentication, and dangerous query validation (blocks DROP, DELETE without WHERE, etc.).

## Setup

### Prerequisites
- Node.js (v18+)
- Java SDK 17+ and Maven
- MongoDB instance (running locally on `mongodb://localhost:27017/sqlgpt`)

### Environment Variables
Rename `.env.example` to `.env` and fill in your values. The `ENCRYPTION_KEY` must be exactly 32 characters long.

### Run Locally

**Backend (Java Spring Boot):**
```bash
cd server-java
mvn spring-boot:run
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Architecture
- **Client**: React (Vite), Tailwind CSS v3, Radix UI, Monaco Editor, Zustand.
- **Server**: Java Spring Boot, MongoDB (Spring Data MongoDB), Spring Security, JDBC.

## License
MIT
