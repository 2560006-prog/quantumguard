# 🌾 Farmer Verification System

A full-stack web application for digital farmer onboarding and verification built with **Next.js 14**, **Supabase**, and **TypeScript**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth, DB, Storage) |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (email/password) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── register/       # Farmer registration
│   ├── dashboard/
│   │   ├── farmer/         # Farmer portal
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── profile/           # Profile form (create/edit)
│   │   │   ├── documents/         # Document upload
│   │   │   └── status/            # Verification status
│   │   ├── validator/      # Validator portal
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── farmers/           # All farmers list
│   │   │   │   └── [id]/          # Farmer detail + review
│   │   │   └── reviews/           # My reviews
│   │   └── admin/          # Admin portal
│   │       ├── page.tsx           # Dashboard home
│   │       ├── farmers/           # All farmers + management
│   │       │   └── [id]/          # Farmer detail (admin view)
│   │       ├── validators/        # Validator management
│   │       ├── analytics/         # Stats & charts
│   │       └── settings/          # Admin settings
│   └── page.tsx            # Root redirect
├── components/
│   ├── shared/             # Reusable components
│   │   ├── Sidebar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StatCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── farmer/             # Farmer-specific components
│   ├── validator/          # Validator-specific components
│   │   ├── ValidatorReviewForm.tsx
│   │   └── DocumentViewer.tsx
│   └── admin/              # Admin-specific components
│       ├── AdminFarmerActions.tsx
│       ├── AdminAssignValidator.tsx
│       ├── AdminValidatorManager.tsx
│       ├── AdminRoleChanger.tsx
│       └── AdminSettingsClient.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Auth + role middleware
│   └── utils.ts            # Helper functions
└── types/
    └── index.ts            # TypeScript type definitions

database/
└── schema.sql              # Full DB schema (run in Supabase)
```

---

## ⚙️ Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `database/schema.sql`
3. Paste and run it — this creates all tables, policies, triggers, and storage buckets

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install Dependencies & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 👥 User Roles & Setup

### Creating Demo Users

After setting up Supabase, create users via the app's register page or Supabase Auth dashboard.

```markdown
**To create an Admin:**
1. Register a user with any email (e.g., `admin@demo.com`)
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE public.users SET role = 'admin' WHERE email = 'admin@demo.com';
```

**To create a Validator:**
1. Either register a user and promote via Admin Dashboard → Validators → Add Validator
2. Or run SQL:
```sql
UPDATE public.users SET role = 'validator' WHERE email = 'validator@demo.com';
```

**Farmers** register normally via `/auth/register` and get the `farmer` role by default.

---

## 🔐 Role-Based Access

| Feature | Farmer | Validator | Admin |
|---------|--------|-----------|-------|
| Submit profile | ✅ | ❌ | ❌ |
| Upload documents | ✅ | ❌ | ❌ |
| View own status | ✅ | ❌ | ❌ |
| View all farmers | ❌ | ✅ | ✅ |
| Approve/Reject | ❌ | ✅ | ✅ |
| Assign validators | ❌ | ❌ | ✅ |
| Delete records | ❌ | ❌ | ✅ |
| Analytics | ❌ | ❌ | ✅ |
| Manage validators | ❌ | ❌ | ✅ |

---

## 🗄️ Database Schema

```
auth.users (Supabase built-in)
    │
    ▼
public.users           ← role, profile info
    │
    ├── farmer_profiles   ← personal, farm, bank details
    │       │
    │       ├── documents         ← file uploads (linked to storage)
    │       │
    │       └── verification_status  ← pending/under_review/approved/rejected
    │
    └── activity_logs    ← audit trail
```

---

## 📦 Storage Buckets

| Bucket | Access | Contents |
|--------|--------|----------|
| `profile-photos` | Public | Farmer profile photos |
| `farmer-documents` | Private (signed URLs) | Land records, identity proof, etc. |

---

## 🎨 Features

- **Dark, earthy theme** — green accents on deep dark background, inspired by nature
- **Fully responsive** — works on mobile and desktop
- **Real-time data** — all dashboards fetch live from Supabase
- **Role-based routing** — middleware redirects based on user role
- **Row Level Security** — Supabase RLS ensures data isolation
- **File uploads** — profile photos + multiple document types
- **Progress tracking** — visual verification pipeline for farmers
- **Audit logging** — validator actions are recorded

---

## 🔧 Key Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint check
```

---

## 📝 Notes

- Supabase email confirmation may be required depending on your project settings. For development, disable it in Auth → Settings → Email Confirmations
- The `farmer_overview` view in the DB provides a convenient joined query used across dashboards
- All timestamps are stored in UTC (Supabase default)
