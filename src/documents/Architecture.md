Designing an authentication application for a multi-tenant system means you need to securely isolate different companies (tenants) while potentially allowing users to exist across multiple tenants.

Here is a breakdown of the standard architecture, database strategies, and token structures used to build a robust multi-tenant auth app.

---

## 1. Core Architectural Models

There are two main ways to map users to tenants, depending on your business logic:

### Model A: Tenant-Bound Users (Isolated)

Users belong to **one and only one** tenant. A user at Company A cannot log into Company B, even if they use the same email.

* **Sign-in URL:** Typically requires a tenant identifier (e.g., `companyA.myapp.com/login` or `myapp.com/login/companyA`).
* **Pros:** High isolation, simpler permission logic.

### Model B: Global Users (Shared/Slack-style)

A single user account can belong to **multiple** tenants. The user logs in globally and then selects which tenant (workspace) they want to access.

* **Sign-in URL:** A single global page (e.g., `myapp.com/login`).
* **Pros:** Better user experience for B2B apps where consultants or agencies work with multiple clients.

---

## 2. Database Structure (Schema Design)

To support multi-tenancy, your authentication database needs a clear relational hierarchy. Below is the standard **Many-to-Many** approach, which is the most flexible as it supports both Model A and Model B.

```
[ Tenants ] 1 --------- * [ Tenant_Users ] * --------- 1 [ Users ]
                               |
                               * --------- 1 [ Roles/Permissions ]

```

### Table Definitions

#### `tenants`

Stores the high-level organization data.

* `id` (UUID, Primary Key)
* `name` (e.g., "Acme Corp")
* `domain/slug` (e.g., "acme" for `acme.myapp.com`)
* `status` (active, suspended)

#### `users`

Stores global authentication credentials.

* `id` (UUID, Primary Key)
* `email` (Unique)
* `password_hash`
* `is_global_admin` (Boolean, for your own internal team)

#### `tenant_users` (The Junction Table)

This is the secret sauce. It links a user to a specific tenant and defines their access context.

* `tenant_id` (Foreign Key -> tenants.id)
* `user_id` (Foreign Key -> users.id)
* `role` (e.g., "Admin", "Member")
* *Composite Primary Key:* (`tenant_id`, `user_id`)

---

## 3. The Authentication & Token Flow

When a user authenticates, your auth app shouldn't just verify *who* they are; it must verify *which tenant* they are accessing.

### Step 1: The Login Request

The client sends the credentials along with the intended tenant context.

* If using subdomains, the backend infers the tenant from `acme.myapp.com`.
* If using a global login, the user logs in first, is presented with a list of their tenants, and selects one.

### Step 2: Token Generation (JWT)

Once authenticated, the auth app issues a JSON Web Token (JWT). **Crucially, the JWT must include the `tenant_id` in its payload.** ```json
{
"sub": "user_123456789",
"name": "Jane Doe",
"email": "jane@acme.com",
"tenant_id": "tenant_abc987",
"role": "workspace_admin",
"exp": 1718912345
}

```

### Step 3: API Gateway / Downstream Services
When the user makes requests to your core application APIs, the API gateway or middleware decrypts the JWT, reads the `tenant_id`, and automatically scopes all database queries to that tenant:
```sql
-- The backend automatically appends the tenant_id to ensure data isolation
SELECT * FROM invoices WHERE tenant_id = 'tenant_abc987';

```

---

## 4. Key Security Considerations

* **Tenant Isolation at DB Level:** Ensure your application code uses a "Row-Level Security" (RLS) approach or a shared-process middleware that guarantees a developer cannot accidentally forget a `WHERE tenant_id = X` clause.
* **Custom Identity Providers (SAML/OIDC):** Large enterprises will want to log in using their own systems (like Okta, Azure AD, or Google Workspace). Your auth app needs a `tenant_idp_settings` table to map specific email domains or tenants to external Enterprise SSO providers.
* **Token Expiry on Tenant Suspension:** If a tenant misses a payment and is suspended, your auth app must revoke all active tokens associated with that `tenant_id` immediately.

Are you building this auth system from scratch using something like Node.js/Go, or are you looking to integrate a third-party provider (like Auth0, Clerk, or Supabase) to handle the multi-tenancy for you?

---

## Feature documentation

Per-feature design and API contracts live under [documents/features/](./features/) (index: [documents/README.md](./README.md)).

Implemented features include hierarchical subdomain RBAC: roles (`admin`, `moderator`, `cashier`, `customer`), moderator portals, host-based login, and member management. Start with [roles-and-subdomains/Design.md](./features/roles-and-subdomains/Design.md).