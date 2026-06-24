# Members — endpoints

## `POST /auth/members`

Add a member to the tenant or portal.

| | |
|---|---|
| **Host** | Tenant root (`admin` only) or portal host (`cashier` / `customer`) |
| **Auth** | Bearer JWT |
| **Guards** | `RequireTenantGuard`, `TenantGuard`, `RolesGuard` |
| **Roles** | `admin`, `moderator` |

### Request body

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email |
| `password` | string | Conditional | Required for new users; optional when linking existing user |
| `role` | enum | Yes | `admin` \| `moderator` \| `cashier` \| `customer` |

**On tenant root:** only `role: admin` is accepted.

**On portal host:** use `cashier` or `customer` (moderator assigns); admin may also add cashier/customer.

```json
{
  "email": "cashier@acme.com",
  "password": "password123",
  "role": "cashier"
}
```

### Success — `201 Created`

```json
{
  "success": true,
  "message": "Member added",
  "data": {
    "userId": "uuid",
    "email": "cashier@acme.com",
    "role": "cashier",
    "portalId": "portal-uuid"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400` | Wrong role for host (e.g. cashier on tenant root) |
| `400` | Password required for new user |
| `403` | Actor cannot assign this role |
| `409` | User already a tenant member |

---

## `PATCH /auth/members/:userId/role`

Change an existing member's role.

| | |
|---|---|
| **Host** | Tenant root or portal host (must match member's portal scope) |
| **Auth** | Bearer JWT |
| **Roles** | `admin`, `moderator` |

### Request body

```json
{
  "role": "customer"
}
```

### Success — `200 OK`

```json
{
  "success": true,
  "message": "Member role updated",
  "data": {
    "userId": "uuid",
    "role": "customer",
    "portalId": "portal-uuid"
  }
}
```

### Errors

| Status | Condition |
|--------|-----------|
| `400` | Member not found |
| `400` | Cannot demote last admin |
| `403` | Actor cannot assign target role |
| `403` | Portal scope mismatch |

### Example (add cashier on portal)

```bash
curl -X POST http://localhost:3000/auth/members \
  -H "Content-Type: application/json" \
  -H "Host: north.acme.localhost" \
  -H "Authorization: Bearer <admin-or-moderator-token>" \
  -d '{
    "email": "cashier@acme.com",
    "password": "password123",
    "role": "cashier"
  }'
```

Bruno: `src/AuthApp/AddMember.yml`
