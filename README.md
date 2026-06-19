# NL2SQL

NL2SQL is a TypeScript and Express backend that lets authenticated users connect PostgreSQL or MySQL databases and query them using natural language.

Instead of sending raw user prompts directly to an LLM, NL2SQL first understands the connected database. It ingests the live schema, normalizes it into a graph-like intermediate representation, retrieves only the most relevant schema context, and then generates SQL, query plans, or explanations through an LLM service.

## Why This Project Exists

Natural-language-to-SQL systems often fail because they hallucinate table names, columns, joins, or relationships. NL2SQL is built around a schema-aware pipeline that grounds model output in the actual connected database.

The system can:

- Register user-owned database connections.
- Verify PostgreSQL and MySQL credentials before storing them.
- Ingest live database schema metadata.
- Convert tables, columns, keys, and relationships into a structured schema IR.
- Retrieve relevant schema context for a natural-language question.
- Generate SQL, explain query intent, or produce a conceptual query plan.
- Store conversation history per database.
- Validate generated SQL before execution.
- Execute generated SQL against the connected database.

## Core Features

- JWT-based authentication
- User-scoped database registration
- PostgreSQL and MySQL support
- Live schema ingestion
- Schema normalization and type mapping
- Primary-key and foreign-key extraction
- Graph-style schema intermediate representation
- Context-aware prompt building
- Conversation memory
- SQL generation mode
- Query planning mode
- Explanation mode
- Generated SQL validation
- Optional SQL execution
- Centralized API error handling

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- MySQL
- Groq API
- Gemini API support
- JWT
- cookie-parser
- mysql2
- pg

## Architecture Overview

```text
Client
  |
  | JWT-authenticated request
  v
Express API
  |
  v
Controller Layer
  |
  +--> Connection Testing
  |
  +--> Schema Ingestion Pipeline
  |       |
  |       +--> PostgreSQL Extractor
  |       +--> MySQL Extractor
  |       +--> Schema Normalizer
  |       +--> Type Mapper
  |       +--> Relation Resolver
  |
  +--> Prompt Builder
  |       |
  |       +--> Schema Cleaner
  |       +--> Context Retriever
  |
  +--> LLM Services
  |       |
  |       +--> SQL Mode
  |       +--> PLAN Mode
  |       +--> EXPLAIN Mode
  |
  +--> SQL Validator
  |
  +--> SQL Executor
  |
  v
Prisma + Application Database
```

> Diagram idea: replace this section with a high-level architecture diagram showing the request flow from client to API, schema pipeline, LLM services, validator, executor, and database.

## Data Model

```text
User
  -> Database
      -> Conversation
          -> Message
```

The Prisma schema stores:

- Users
- Registered databases
- Cached schema IR
- Conversations
- User and assistant messages
- Generated SQL
- Response modes

Supported database types:

```text
POSTGRES
MYSQL
```

Supported response modes:

```text
SQL
PLAN
EXPLAIN
```

## Schema Ingestion Pipeline

The schema ingestion pipeline lives in:

```text
src/orchestration/schema_injestion
```

It extracts database metadata from PostgreSQL or MySQL, including:

- Tables
- Columns
- Data types
- Nullable fields
- Primary keys
- Foreign keys

The raw schema is normalized into a common structure and then transformed into a graph-style schema IR.

### Schema IR Shape

```ts
{
  nodes: [
    {
      table: "users",
      columns: [
        {
          name: "id",
          type: "string",
          nullable: false
        }
      ],
      primaryKeys: ["id"]
    }
  ],
  edges: [
    {
      fromTable: "orders",
      fromColumn: "user_id",
      toTable: "users",
      toColumn: "id"
    }
  ],
  adjacency: {
    users: [
      {
        table: "orders",
        via: "id",
        targetColumn: "user_id"
      }
    ]
  }
}
```

This structure helps the system understand relationships between tables and retrieve nearby related tables when building prompts.

> Diagram idea: add a schema ingestion diagram showing `Database -> Extractor -> Normalizer -> Relation Resolver -> Schema IR`.

## Prompt Building

The prompt builder lives in:

```text
src/orchestration/prompt_builder
```

Prompt construction follows this flow:

1. Clean the schema by removing system tables such as `_prisma_migrations`.
2. Detect relevant seed tables from the user query.
3. Match against table names and column names.
4. Expand through schema relationships using graph adjacency.
5. Trim the schema to the most relevant context.
6. Add recent conversation history.
7. Send the final prompt to the selected LLM service.

If no relevant seed table is found, the system falls back to the full schema to avoid losing useful context.

## Query Modes

### SQL Mode

Generates executable SQL when possible.

Expected output:

```json
{
  "mode": "SQL",
  "message": "Generated SQL successfully.",
  "sql": "SELECT ...",
  "tablesUsed": ["users", "orders"]
}
```

### PLAN Mode

Produces a conceptual query plan without generating executable SQL.

Expected output:

```json
{
  "mode": "PLAN",
  "message": "Find the relevant customer records, connect them to their orders, and aggregate revenue per customer.",
  "sql": null,
  "tablesUsed": ["customers", "orders"]
}
```

### EXPLAIN Mode

Produces a natural-language explanation without generating SQL.

Expected output:

```json
{
  "mode": "EXPLAIN",
  "message": "This question is asking for the total value of orders grouped by each customer.",
  "sql": null,
  "tablesUsed": ["customers", "orders"]
}
```

## API Routes

Base path:

```text
/api/v1
```

Routes:

```text
POST /api/v1/register-user
POST /api/v1/database-registeration-postgres
POST /api/v1/database-registeration-mysql
POST /api/v1/schema-injestion
POST /api/v1/query
POST /api/v1/execute
```

Health check:

```text
GET /
```

Response:

```text
health check
```

## Authentication

Protected routes use JWT authentication.

The token can be provided through:

- `accessToken` cookie
- `Authorization: Bearer <token>` header

Expected JWT payload:

```ts
{
  sessionID: string;
  userID: string;
  role: string;
}
```

## Example Requests

### Register a User

```http
POST /api/v1/register-user
Authorization: Bearer <token>
```

### Register a PostgreSQL Database

```http
POST /api/v1/database-registeration-postgres
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "analytics-db",
  "host": "localhost",
  "port": 5432,
  "username": "postgres",
  "password": "password",
  "dbName": "analytics"
}
```

### Register a MySQL Database

```http
POST /api/v1/database-registeration-mysql
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "sales-db",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "password",
  "dbName": "sales"
}
```

### Ingest Schema

```http
POST /api/v1/schema-injestion
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "analytics-db"
}
```

### Ask a Natural-Language Query

```http
POST /api/v1/query
Authorization: Bearer <token>
Content-Type: application/json

{
  "dbname": "analytics-db",
  "conversationName": "sales-analysis",
  "query": "show total revenue by customer",
  "mode": "SQL"
}
```

Example response:

```json
{
  "success": true,
  "result": {
    "mode": "SQL",
    "message": "Generated SQL successfully.",
    "sql": "SELECT ...",
    "tablesUsed": ["customers", "orders"]
  }
}
```

### Execute Generated SQL

```http
POST /api/v1/execute
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "analytics-db",
  "conversationName": "sales-analysis"
}
```

Example response:

```json
{
  "success": true,
  "connection": {
    "rows": [],
    "rowCount": 0,
    "command": "SELECT"
  }
}
```

## SQL Validation

Generated SQL is validated before execution.

The current validator:

- Allows `null` SQL for PLAN and EXPLAIN modes.
- Blocks destructive keywords:
  - `DROP`
  - `ALTER`
  - `TRUNCATE`
  - `DELETE`
- Extracts referenced table names.
- Checks that referenced tables exist in the ingested schema IR.

This reduces hallucinated and unsafe SQL, although production systems should use a full SQL parser for stronger validation.

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nl2sql"
JWT_SECRET="your-jwt-secret"
GROQ_API_KEY="your-groq-api-key"
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

## Installation

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

Default local server:

```text
http://localhost:3000
```

## Project Structure

```text
src/
  app.ts
  index.ts

  controller/
    database.controller.ts

  routes/
    databases.routes.ts

  middleware/
    verifyjwt.ts
    error.middleware.ts

  db/
    db.ts

  service/
    sql_groq_service.ts
    plan_groq_Service.ts
    explain_groq_Service.ts
    geminiService.ts
    validator.ts

  utils/
    connectionTest.ts
    executor.ts
    encrypter.ts
    decrypter.ts
    errorHandler.ts

  orchestration/
    schema_injestion/
      SI_orchestrator.ts
      pipeline/
        1_postgres_extractor.ts
        1_mysql_extractor.ts
        2_normalizer.ts
        2_typeMapper.ts
        3_relationResolver.ts

    prompt_builder/
      PB_orceshtrator.ts
      pipeline/
        1_schemaCleaner.ts
        2_contextRetriever.ts

prisma/
  schema.prisma
  migrations/
```

## Security Notes

Database passwords are currently Base64 encoded before storage and decoded before connection use. This is useful for development, but Base64 is not encryption.

For production, replace this with real encryption such as AES-GCM, a cloud KMS, or a dedicated secrets manager.

Recommended production hardening:

- Use read-only database users for query execution.
- Replace regex-based validation with SQL parser-based validation.
- Add query result limits.
- Add rate limiting.
- Add audit logs for generated and executed SQL.
- Add connection timeout controls.
- Add role-based permissions.

## Current Limitations

- SQL validation is regex-based.
- Database credential protection is not production-grade yet.
- No automated test suite is currently configured.
- SQL execution should be restricted more heavily before production use.
- No OpenAPI/Swagger documentation is currently included.

## Future Improvements

- Real credential encryption
- SQL parser validation
- Docker support
- OpenAPI documentation
- Unit and integration tests
- Schema refresh scheduling
- Read-only execution mode
- Pagination for large query results
- Query cost estimation
- Frontend dashboard
- Support for additional databases

## License

ISC
