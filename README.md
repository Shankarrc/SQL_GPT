# AI-Powered SQL Query Generator & Executor

A full-stack MERN application to connect to external databases, generate SQL queries using OpenAI's GPT-4 based on natural language prompts, and execute them safely.

## Features
- **Dynamic Database Connections**: Connect to MySQL or PostgreSQL databases safely.
- **AI SQL Generation**: Use GPT-4o to turn plain English into optimized SQL queries.
- **Query Executor**: Run the AI-generated queries directly against your external databases and view the results in a data table.
- **Security First**: Encrypted connection credentials, JWT authentication, and dangerous query validation (blocks DROP, DELETE without WHERE, etc.).

## Setup

### Prerequisites
- Docker & Docker Compose (Recommended)
- Node.js (if running locally)
- MongoDB instance (if running locally without Docker)

### Environment Variables
Rename `.env.example` to `.env` and fill in your values, especially your `OPENAI_API_KEY`. The `ENCRYPTION_KEY` must be exactly 32 characters long.

### Run with Docker Compose (Recommended)
\`\`\`bash
docker-compose up --build
\`\`\`
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Run Locally (Without Docker)

**Backend:**
\`\`\`bash
cd server
npm install
npm run build
npm start
# Or for dev: npm run dev
\`\`\`

**Frontend:**
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

## Architecture
- **Client**: React (Vite), Tailwind CSS v3, ShadCN UI, Monaco Editor, Zustand.
- **Server**: Node.js, Express, TypeScript, Mongoose.

## License
MIT
