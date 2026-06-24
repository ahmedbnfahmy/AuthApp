# Registration — endpoints

## `POST /auth/register`

Create a new user and tenant (admin).

| | |
|---|---|
| **Host** | Platform (`localhost` or app apex) |
| **Auth** | None |
| **Content-Type** | `application/json` |

### Request body

| Field | Type | Required | Constraints |
|-------|------|----------|---------------|
| `email` | string | Yes | Valid email, globally unique |
| `password` | string | Yes | 8–72 characters |
| `tenantName` | string | Yes | 2–100 characters |
| `domainSlug` | string | Yes | `^[a-z0-9]+(?:-[a-z0-9]+)*$`, unique |

```json
{
  "email": "jane@acme.com",
  "password": "password123",
  "tenantName": "Acme Corp",
  "domainSlug": "acme"
}
```

### Success — `201 Created`

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "access_token": "eyJ...",
    "user": { "id": "uuid", "email": "jane@acme.com" },
    "tenant": {
      "id": "uuid",
      "name": "Acme Corp",
      "domainSlug": "acme"
    },
    "role": "admin"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400` | Validation failed |
| `409` | Email already registered |
| `409` | Workspace slug already taken |

### Example

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@acme.com",
    "password": "password123",
    "tenantName": "Acme Corp",
    "domainSlug": "acme"
  }'
```

Bruno: `src/AuthApp/Register.yml`
