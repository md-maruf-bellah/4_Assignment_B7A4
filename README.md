# RentNest 🏠 — Backend API

A production-ready backend for a rental property marketplace, built with **Node.js, Express, TypeScript, PostgreSQL (Prisma ORM), JWT auth, and Stripe payments**.

Three roles: **Tenant**, **Landlord**, **Admin** — selected at registration.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Payments | Stripe Checkout Sessions + Webhooks |
| Validation | Zod |
| Docs | Postman Collection |

---

## 📁 Project Structure

```
rentnest-backend/
├── prisma/
│   ├── schema.prisma        # Users, Properties, Categories, RentalRequests, Payments, Reviews
│   └── seed.ts               # Seeds admin, categories, demo landlord/tenant/properties
├── postman/
│   └── RentNest.postman_collection.json
├── src/
│   ├── config/                # env, prisma client, stripe client
│   ├── middleware/            # auth (JWT + role guard), validateRequest, errorHandler
│   ├── validators/            # Zod schemas per module
│   ├── services/               # business logic (DB access via Prisma)
│   ├── controllers/            # thin HTTP layer, calls services
│   ├── routes/                 # route definitions per module
│   ├── utils/                  # AppError, catchAsync, sendResponse, jwt
│   ├── app.ts                  # Express app + route mounting
│   └── server.ts               # entry point
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your own values:
```bash
cp .env.example .env
```

You need:
- A **PostgreSQL** connection string (`DATABASE_URL`) — use [Neon](https://neon.tech), [Supabase](https://supabase.com), [Railway](https://railway.app), or a local Postgres instance.
- A **Stripe** test account: get `STRIPE_SECRET_KEY` from the Stripe Dashboard → Developers → API keys, and `STRIPE_WEBHOOK_SECRET` from Developers → Webhooks (or from the Stripe CLI when testing locally — see below).

### 3. Run migrations & generate the Prisma client
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Seed the database (creates admin + demo users + categories)
```bash
npm run seed
```

This creates:
| Role | Email | Password |
|---|---|---|
| Admin | `admin@rentnest.com` | `admin123` |
| Landlord (demo) | `landlord@rentnest.com` | `landlord123` |
| Tenant (demo) | `tenant@rentnest.com` | `tenant123` |

> Change `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before seeding if you want different admin credentials.

### 5. Run the dev server
```bash
npm run dev
```
Server starts at `http://localhost:5000`.

### 6. Test Stripe webhooks locally (optional but recommended)
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```
Copy the `whsec_...` value it prints into `STRIPE_WEBHOOK_SECRET` in `.env`.

---

## 📚 API Documentation

Import `postman/RentNest.postman_collection.json` into Postman. It includes every endpoint below, grouped by module, with test scripts that automatically capture JWT tokens and IDs (property, rental request, category) into collection variables as you run requests top-to-bottom.

Suggested run order: **Auth (register + login for all 3 roles) → Admin (create category) → Landlord (create property) → Rentals (submit request) → Landlord (approve request) → Payments (create session) → Reviews.**

### Authentication
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |

### Properties (Public)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/properties?location=&city=&type=&minPrice=&maxPrice=&amenities=&page=&limit=` | Public |
| GET | `/api/properties/:id` | Public |
| GET | `/api/categories` | Public |

### Landlord
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/landlord/properties` | Landlord |
| POST | `/api/landlord/properties` | Landlord |
| PUT | `/api/landlord/properties/:id` | Landlord (owner) |
| DELETE | `/api/landlord/properties/:id` | Landlord (owner) |
| GET | `/api/landlord/requests` | Landlord |
| PATCH | `/api/landlord/requests/:id` `{ status: "APPROVED" \| "REJECTED", rejectReason? }` | Landlord (owner) |

### Rental Requests
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/rentals` `{ propertyId, moveInDate, message? }` | Tenant |
| GET | `/api/rentals` | Tenant |
| GET | `/api/rentals/:id` | Tenant/Landlord/Admin (participant only) |

### Payments (Stripe)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/payments/create` `{ rentalRequestId }` → returns Stripe Checkout URL | Tenant |
| POST | `/api/payments/confirm` `{ sessionId }` | Tenant |
| POST | `/api/payments/webhook` | Stripe (raw body, signature-verified) |
| GET | `/api/payments` | Authenticated (own history / all for Admin) |
| GET | `/api/payments/:id` | Owner/Admin |

Payment flow: rental request must be `APPROVED` → tenant calls `POST /payments/create` → redirected to Stripe Checkout → on success, Stripe redirects to `/api/payments/success` and/or fires the `checkout.session.completed` webhook → payment marked `COMPLETED` and rental request status becomes `ACTIVE`.

### Reviews
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/reviews` `{ rentalRequestId, rating (1-5), comment }` | Tenant (after payment/completion) |

### Admin
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id` `{ status: "ACTIVE" \| "BANNED" }` | Admin |
| GET | `/api/admin/properties` | Admin |
| GET | `/api/admin/rentals` | Admin |
| POST | `/api/admin/categories` `{ name }` | Admin |

---

## ✅ Mandatory Requirements Checklist

- [x] **API Documentation** — Postman collection in `/postman`, covering every endpoint.
- [x] **Consistent Error Responses** — every error returns `{ success: false, message, errorDetails }` via the global error handler (`src/middleware/errorHandler.ts`), including Zod validation errors, Prisma errors (unique constraint, not found, FK violations), and JWT/auth errors.
- [x] **Input Validation** — every mutating endpoint is validated server-side with Zod (`src/validators/*`) before hitting the controller.
- [x] **Admin Credentials** — seeded via `prisma/seed.ts`, configurable through `.env`.
- [x] **Payment Integration** — real Stripe Checkout Sessions + webhook handling (no simulated/fake payment paths).
- [ ] **20 meaningful commits** — see the commit guide below; this scaffold intentionally leaves history for you to build incrementally as you customize it, since a bulk-generated repo does not satisfy "meaningful" commit history in spirit.

### Suggested commit sequence (to reach 20+ meaningful commits honestly)
Rather than one giant commit, stage and commit in logical slices as you review/adjust the code:
1. `chore: init project, package.json, tsconfig`
2. `feat: add Prisma schema (users, categories, properties)`
3. `feat: add Prisma schema (rental requests, payments, reviews)`
4. `feat: add env config and prisma client singleton`
5. `feat: add AppError, catchAsync, sendResponse utils`
6. `feat: add global error handler with structured JSON responses`
7. `feat: add JWT utils and auth middleware`
8. `feat: add auth module (register, login, me)`
9. `feat: add public property browsing + filtering`
10. `feat: add categories endpoints`
11. `feat: add landlord property CRUD`
12. `feat: add rental request submission (tenant)`
13. `feat: add landlord rental request approval/rejection`
14. `feat: add Stripe config and checkout session creation`
15. `feat: add payment confirmation + webhook handler`
16. `feat: add payment history endpoints`
17. `feat: add reviews module`
18. `feat: add admin user management`
19. `feat: add admin property/rental oversight + category creation`
20. `docs: add Postman collection and README`
21. `chore: add seed script with admin/demo data`
22. `fix/refactor: <whatever you actually change while testing>`

Use `git add -p` to split the initial scaffold into these commits if you're importing it as one block.

---

## ☁️ Deployment (Vercel / Render)

1. Push this repo to GitHub.
2. Provision a Postgres database (Neon/Supabase/Railway all have free tiers).
3. On Render/Vercel, set all variables from `.env.example` as environment variables.
4. Build command: `npm run build` · Start command: `npm start` (Render) — for Vercel, use a serverless adapter or Render/Railway is simpler for a stateful Express + Prisma app.
5. Run `npx prisma migrate deploy && npm run seed` against the production database once (via a one-off shell/job).
6. Add the deployed webhook URL (`https://<your-domain>/api/payments/webhook`) in the Stripe Dashboard and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

---

## 🎥 Demo Video Checklist

- Project overview & architecture (30s)
- Register/login as Tenant, Landlord, Admin via Postman
- CRUD on properties (landlord), browse/filter (public)
- Full rental flow: request → approve → pay (Stripe test card `4242 4242 4242 4242`) → review
- Show a validation error and a 404 error to demonstrate the structured error format
- Briefly explain one technical decision (e.g. why the webhook route needs raw body parsing)
