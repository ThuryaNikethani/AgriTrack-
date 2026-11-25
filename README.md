# AgriTrack 🌱

**Smart Polytunnel & Agricultural Management System**

AgriTrack manages the polytunnel run by **Kurunduwatta Villa & Cottages** (Athukorala Tea Factory). The polytunnel grows fresh vegetables for villa guests and for visitors to the tea factory.

It keeps cultivation, harvests, fertilizer, inventory, sales, expenses and profitability in one place, and it flags anything that needs attention.

## Features

| Module | What it does |
| --- | --- |
| **Dashboard** | Overview of active crops, harvests that are due or overdue, reorder reminders, monthly income, expenses and profit, and charts |
| **Crop Management** | Crop cycles with vegetable, variety, bed, planting date, expected harvest date, number of plants and expected yield |
| **Harvest Management** | Scheduled vs actual harvest date and quantity. Rows are **highlighted** when a harvest is overdue, late, or **below the expected quantity** (±10% tolerance) |
| **Sales Management** | Sales to the Villa, the Tea Factory or external customers. Records quantity in kg or g, unit price, total, and the remaining harvest stock |
| **Expense Management** | Fertilizer, seeds, labour, equipment, maintenance and other costs. Each expense can be linked to a crop |
| **Fertilizer Management** | Fertilizer types, usage per crop, restocking (recorded as an expense automatically) and remaining stock |
| **Inventory Management** | Seeds, supplies and equipment with stock in/out movements |
| **Financial Analytics** | Daily, monthly and annual income vs expenses, net profit or loss, revenue by customer, and crop-wise profitability |
| **Reports** | 10 reports with date and crop filters. Print-ready, with **PDF** download and **Excel** export |
| **Notifications** | Low or out-of-stock reorder reminders, upcoming harvest reminders and overdue harvest alerts. Shown in the app and optionally sent by email |
| **User Management** | Admin and staff accounts with role-based access |

### Reports

Daily Cultivation · Daily Harvest · Daily Sales · Daily Expense · Monthly Financial · Annual Financial · Crop Performance · Fertilizer Usage · Profit & Loss · Inventory

### Profit calculation

```
Net Profit = Total Revenue − Total Expenses
```

Crop profit is calculated as:

- **Revenue:** the crop's sales.
- **Costs:** the expenses linked to the crop, plus the estimated cost of fertilizer applied to it (quantity used × average purchase price).

This shows which vegetable is the most profitable. Villa supply and outside sales are reported separately.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 15 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 with shadcn-style components |
| Backend | Next.js server actions & API routes |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Auth.js (NextAuth v5) with credentials and roles |
| Validation | Zod |
| Charts | Recharts |
| PDF reports | @react-pdf/renderer |
| Excel reports | ExcelJS |
| Notifications | In-app, plus email via Nodemailer |
| Deployment | Vercel (with a daily cron job) |

## Getting started

### 1. Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer (local, Docker, or a hosted service such as Neon or Supabase)

### 2. Install

```bash
git clone https://github.com/ThuryaNikethani/AgriTrack-.git
cd AgriTrack-
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL`: your PostgreSQL connection string.
- `AUTH_SECRET`: a long random string. You can generate one with `npx auth secret`.
- `SMTP_*` and `NOTIFY_EMAIL_TO`: optional. Fill these in to receive alert emails.
- `CRON_SECRET`: protects the scheduled notifications endpoint.

### 4. Create the database and sample data

```bash
npx prisma migrate deploy   # create tables
npm run db:seed             # demo users + sample crops, harvests, sales, expenses
```

> **Neon:** run migrations against the direct connection, not the pooler. Remove `-pooler` from the host name for the `migrate deploy` command, and keep the pooled URL in `.env` for the app.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000 and sign in:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@agritrack.local` | `admin123` |
| Staff | `staff@agritrack.local` | `staff123` |

> Change these passwords from **Users** after the first login.

## Configuration

Harvest rules are in [`src/lib/harvest.ts`](src/lib/harvest.ts):

```ts
export const HARVEST_RULES = {
  dueSoonDays: 3,          // reminder window before the scheduled date
  graceDays: 0,            // days after the scheduled date still counted as on time
  quantityTolerance: 0.1,  // ±10% of the expected quantity
};
```

Each fertilizer and inventory item has its own **reorder level**. A notification is created when its stock falls to that level or below.

## Deployment (Vercel)

1. Push the repository to GitHub and import it in Vercel.
2. Add the environment variables from `.env.example`.
3. Set the build command to `prisma migrate deploy && next build`, or run migrations separately.
4. `vercel.json` schedules `/api/cron/notifications` once a day. It refreshes alerts and emails any new ones.

## Project structure

```
prisma/              schema, migrations, seed data
src/app/(app)/       authenticated pages (dashboard, crops, harvests, sales, ...)
src/app/api/         Auth.js, report downloads (PDF / Excel), cron job
src/app/login/       sign-in page
src/components/      UI components, charts, layout
src/lib/             business logic (harvest rules, finance, reports, notifications)
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Create or apply migrations in development |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Prisma Studio |

## Image credits

- Crop photos in `public/crops/` come from the Kurunduwatta Plant Identification cards, except:
- `public/crops/spring-onion.jpg`: "A Spring onions on the poly boxes" by Peachyeung316,
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), via
  [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:A_Spring_onions_on_the_poly_boxes.jpg). Resized.
