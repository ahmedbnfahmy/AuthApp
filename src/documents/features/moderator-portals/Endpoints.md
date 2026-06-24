# Moderator portals — endpoints

## `POST /auth/portals`

Create a moderator portal and assign a moderator.

| | |
|---|---|
| **Host** | Tenant root only — e.g. `acme.localhost` |
| **Auth** | Bearer JWT |
| **Guards** | `RequireTenantGuard`, `TenantGuard`, `RolesGuard` |
| **Roles** | `admin` |

### Request body

| Field | Type | Required | Constraints |
|-------|------|----------|---------------|
| `slug` | string | Yes | 2–100 chars, `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `moderatorEmail` | string | Yes | Valid email |
| `moderatorPassword` | string | Yes | 8–72 chars (for new users) |

```json
{
  "slug": "north",
  "moderatorEmail": "mod@acme.com",
  "moderatorPassword": "password123"
}
```

### Success — `201 Created`

```json
{
  "success": true,
  "message": "Moderator portal created",
  "data": {
    "portal": {
      "id": "uuid",
      "slug": "north",
      "host": "north.acme.localhost"
    },
    "moderator": {
      "id": "uuid",
      "email": "mod@acme.com"
    }
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400` | Called on portal host (must use tenant root) |
| `400` | Validation failed |
| `401` | Missing or invalid token |
| `403` | Not admin |
| `409` | Portal slug taken |
| `409` | Moderator already a tenant member |

---

## `GET /auth/portals`

List portals for the current tenant.

| | |
|---|---|
| **Host** | Tenant root only |
| **Auth** | Bearer JWT |
| **Roles** | `admin` |

### Success — `200 OK`

```json
{
  "success": true,
  "message": "Portals retrieved",
  "data": [
    {
      "id": "uuid",
      "slug": "north",
      "host": "north.acme.localhost",
      "status": "active",
      "createdAt": "2026-06-24T07:00:00.000Z"
    }
  ]
}
```

### Example

```bash
curl -X POST http://localhost:3000/auth/portals \
  -H "Content-Type: application/json" \
  -H "Host: acme.localhost" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "slug": "north",
    "moderatorEmail": "mod@acme.com",
    "moderatorPassword": "password123"
  }'
```

Bruno: `src/AuthApp/CreatePortal.yml`
