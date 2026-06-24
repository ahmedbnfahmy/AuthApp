# AuthApp Documentation

Feature documentation lives under [`features/`](./features/). Each feature has:

| File | Purpose |
|------|---------|
| **Design.md** | What the feature does, domain rules, flows, security |
| **Endpoints.md** | HTTP contract — request, response, errors, examples |

## Platform

- [Architecture.md](./Architecture.md) — multi-tenant data model and auth strategy

## Features

| Feature | Design | Endpoints |
|---------|--------|-----------|
| Roles & subdomains (RBAC) | [Design](./features/roles-and-subdomains/Design.md) | — |
| Registration | [Design](./features/register/Design.md) | [Endpoints](./features/register/Endpoints.md) |
| Login | [Design](./features/login/Design.md) | [Endpoints](./features/login/Endpoints.md) |
| Moderator portals | [Design](./features/moderator-portals/Design.md) | [Endpoints](./features/moderator-portals/Endpoints.md) |
| Members | [Design](./features/members/Design.md) | [Endpoints](./features/members/Endpoints.md) |

## Subdomain model (quick reference)

```
localhost / app.myapp.com     → platform (register)
acme.localhost                → tenant root (admin)
north.acme.localhost          → moderator portal (moderator, cashier, customer)
```

Set `BASE_DOMAIN=localhost` in `.env` for local dev. API clients must send the correct `Host` header to target a tenant or portal.

## Bruno / OpenCollection

HTTP examples: `src/AuthApp/*.yml`
