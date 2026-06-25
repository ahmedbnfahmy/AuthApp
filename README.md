# AuthApp

Multi-tenant authentication API built with [NestJS](https://nestjs.com/). Each company (tenant) gets its own subdomain; admins can create nested moderator portals where staff and customers operate under role-based access control.

## Features

### Registration

New companies sign up in one request. Creates a **user**, **tenant**, and **admin** membership, and returns a JWT immediately.

- `POST /auth/register` — public, platform host

[Design](src/documents/features/register/Design.md) · [Endpoints](src/documents/features/register/Endpoints.md)

### Login

Host-scoped authentication. Send the `Host` header to target a tenant or portal; the API resolves context and returns a JWT with the correct `tenant_id`, `portal_id`, and `role` from the database.

- `POST /auth/login` — tenant root (admin) or portal host (moderator, cashier, customer)

[Design](src/documents/features/login/Design.md) · [Endpoints](src/documents/features/login/Endpoints.md)

### Moderator portals

Admins provision nested subdomains under their tenant and assign a moderator to each portal.

- `POST /auth/portals` — create portal + moderator
- `GET /auth/portals` — list portals

Example: admin on `acme.localhost` creates slug `north` → `north.acme.localhost`

[Design](src/documents/features/moderator-portals/Design.md) · [Endpoints](src/documents/features/moderator-portals/Endpoints.md)

### Members

Invite users and update roles within a tenant or portal.

- `POST /auth/members` — add co-admin (tenant root) or cashier/customer (portal host)
- `PATCH /auth/members/:userId/role` — change role

[Design](src/documents/features/members/Design.md) · [Endpoints](src/documents/features/members/Endpoints.md)

### Roles & subdomains (RBAC)

| Role | Login host | Description |
|------|------------|-------------|
| **admin** | `{tenant}.BASE_DOMAIN` | Tenant owner; creates portals and co-admins |
| **moderator** | `{portal}.{tenant}.BASE_DOMAIN` | Manages a portal; invites cashiers and customers |
| **cashier** | portal host | Staff on a moderator subdomain |
| **customer** | portal host | Same host as cashiers |

[Full design doc](src/documents/features/roles-and-subdomains/Design.md)

### Subdomain model

```
localhost                     → platform (register)
acme.localhost                → tenant root (admin)
north.acme.localhost          → moderator portal
```

Set `BASE_DOMAIN=localhost` in `.env` for local development. Clients must send the correct `Host` header (curl, Bruno, or reverse proxy).

## API overview

| Method | Path | Host | Auth |
|--------|------|------|------|
| `POST` | `/auth/register` | platform | public |
| `POST` | `/auth/login` | tenant or portal | public |
| `POST` | `/auth/portals` | tenant root | admin |
| `GET` | `/auth/portals` | tenant root | admin |
| `POST` | `/auth/members` | tenant or portal | admin, moderator |
| `PATCH` | `/auth/members/:userId/role` | tenant or portal | admin, moderator |
| `GET` | `/health` | any | public |

Bruno/OpenCollection requests: `src/AuthApp/*.yml`

## Documentation

Detailed per-feature design and endpoint specs: [`src/documents/README.md`](src/documents/README.md)

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm 10+

### Environment

Copy `.env` and configure:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=auth_app
BASE_DOMAIN=localhost
JWT_SECRET=your-secret
```

### Install & run

```bash
npm install
npm run migration:run
npm run start:dev
```

### Migrations

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- src/database/migrations/MigrationName
```

## Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Built with

- [NestJS](https://nestjs.com/)
- [TypeORM](https://typeorm.io/) + PostgreSQL
- [JWT](https://github.com/nestjs/jwt) for access tokens
- [class-validator](https://github.com/typestack/class-validator) for request validation
