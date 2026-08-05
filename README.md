# Blindly

Blindly is a Next.js creator-discovery product with separate fan and creator authentication paths, a consumer feed, discovery, creator profiles, and social actions.

## Requirements

- Node.js 24
- npm
- PostgreSQL

## Local setup

1. Install dependencies and create a local environment file:

   ```powershell
   npm ci
   Copy-Item .env.example .env
   ```

2. Fill in the required values described below. Use a local PostgreSQL database for development.

3. Generate the Prisma client and create the development schema:

   ```powershell
   npx prisma generate
   npx prisma db push
   ```

4. Start the application:

   ```powershell
   npm run dev
   ```

5. Open [http://localhost:3000/landing](http://localhost:3000/landing).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection used by the application. |
| `JWT_ACCESS_SECRET` | Yes | Secret for access tokens. Use a unique random value of at least 32 bytes. |
| `JWT_REFRESH_SECRET` | Yes | Separate secret for refresh tokens, also at least 32 bytes. |
| `NEXT_PUBLIC_APP_URL` | Yes | Public application origin, such as `http://localhost:3000` locally. |
| `GOOGLE_CLIENT_ID` | No | Enables Google sign-in only when paired with `GOOGLE_CLIENT_SECRET` and a trusted app origin. |
| `GOOGLE_CLIENT_SECRET` | No | Server-only Google OAuth secret. Never expose it to browser code. |
| `RESEND_API_KEY` | No | Enables password-reset email only when paired with `PASSWORD_RESET_FROM_EMAIL`. |
| `PASSWORD_RESET_FROM_EMAIL` | No | Verified Resend sender used for password recovery. |
| `SEED_DATABASE_URL` | Seed only | Separate local PostgreSQL database that may receive development fixtures. |
| `SEED_DEVELOPMENT_CONFIRMATION` | Seed only | Must be `local-development` before the seed command will run. |
| `SEED_PASSWORD` | No | Password for seeded accounts; defaults to `Test1234`. |
| `BLINDLY_DEMO_CONTENT_CONFIRMATION` | Operator only | Explicit, one-time confirmation required to import fictional Blindly demo content. |
| `RAZORPAY_KEY_ID` | No | Reserved for payment integration. |
| `RAZORPAY_KEY_SECRET` | No | Reserved for payment integration. |

Do not reuse access and refresh secrets. Do not commit `.env` or copy production database credentials into seed configuration.
Google OAuth uses `/api/auth/google/callback` on `NEXT_PUBLIC_APP_URL`. Password recovery stays visibly unavailable until both Resend variables are configured.

## Development seed data

Seeding is deliberately restricted to a separate local PostgreSQL database. Create the schema in that database first, restore the application database variable, then run the guarded seed command:

```powershell
$creavoraAppDatabase = "postgresql://creavora:creavora@localhost:5432/creavora_dev?schema=public"
$creavoraSeedDatabase = "postgresql://creavora:creavora@localhost:5432/creavora_seed?schema=public"
$env:DATABASE_URL = $creavoraSeedDatabase
npx prisma db push
$env:DATABASE_URL = $creavoraAppDatabase
$env:SEED_DATABASE_URL = $creavoraSeedDatabase
$env:NODE_ENV = "development"
$env:SEED_DEVELOPMENT_CONFIRMATION = "local-development"
npm run db:seed
```

The command rejects production mode, remote seed hosts, missing confirmation, and a seed URL that matches `DATABASE_URL`. To inspect the fixtures after the seed completes, start the local app with `DATABASE_URL` pointed at that seeded database. Never run `npm run db:seed` in Vercel or against production data.

## Production demo-content import (operator-only)

The fictional Blindly demo-content importer is an operator-only, one-time release operation. It is **not part of the Vercel build** and must not be configured as a Vercel build step, deployment hook, or automatic seed. Do not add the confirmation variable to Vercel environment variables.

Only after the whole branch has been reviewed, integrated into `main`, and the connected GitHub/Vercel deployment is Ready, an authorized operator may pull the production environment into an uncommitted local shell session. Vercel environment pulls are operator-only and never committed. The exact confirmation is `BLINDLY_DEMO_CONTENT_CONFIRMATION=blindly-production-demo-content`. Confirm that `DATABASE_URL` is the intended production PostgreSQL database, then run this exact command once:

```powershell
$env:BLINDLY_DEMO_CONTENT_CONFIRMATION="blindly-production-demo-content"; npm run db:import-demo-content
```

Capture the importer counts printed by the command. Then verify `/home`, `/feed`, `/explore`, `/live`, `/messages`, `/saved`, `/collections`, `/notifications`, `/profile`, and `/settings` on the deployed application. Do not push, deploy, or import production data as part of local development or pull-request verification.

## Verification

Run the same checks expected before release:

```powershell
npm run test
npm run lint
npx prisma validate
npm run build
git diff --check
```

To run only the landing and navigation smoke test:

```powershell
npm run test -- tests/components/landing-auth.test.jsx
```

## Vercel configuration

Create a Vercel project from this repository with these settings:

- Framework preset: Next.js
- Node.js version: 24.x
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: Next.js default

Configure `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `NEXT_PUBLIC_APP_URL` for Production and Preview as appropriate. Use a managed PostgreSQL connection for deployed environments. Keep all `SEED_*` variables unset in production. Apply the Prisma schema through the project’s controlled database release process before sending traffic to a new database.

After deployment is ready, verify the public landing route directly:

```powershell
curl.exe -fsS -o NUL -w "%{http_code}" https://creavora.vercel.app/landing
```

The expected response is `200`. A non-zero curl exit code or any other status blocks the release.

## Continuous integration

The consumer smoke workflow runs on pull requests and pushes to `main`. It installs from the lockfile, validates the Prisma schema, runs all tests, lints the project, and performs a production build.
