# API Gateway

Express-based API gateway with tenant isolation, authentication, and mock leads management.

## Features

- Tenant resolution from headers and origins
- JWT token validation
- CORS support
- Mock authentication with token generation
- Tenant-scoped leads API
- Health check endpoint

## Building

```bash
nx build api-gateway
```

## Running

```bash
nx serve api-gateway
```

The server will start on `http://localhost:3000`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret (default: dev-secret-key-change-in-production)

## API Endpoints

### Health

- `GET /api/health` - Health check

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### Leads

- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/leads/:id` - Get single lead
- `PATCH /api/leads/:id` - Update lead status
