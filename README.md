## Personal Finance Dashboard – Budgeting and Expense Tracking System

**Stack**: Next.js (React) + Tailwind CSS frontend, Node.js + Express.js backend, MongoDB Atlas, JWT auth, Chart.js, CSV import/export.

### 1. Project structure

- **Root**
  - `package.json` – monorepo scripts (`dev`, `dev:backend`, `dev:frontend`)
- **backend**
  - `src/server.js` – Express app entry
  - `src/config/db.js` – MongoDB connection
  - `src/models` – `User`, `Transaction`, `Budget`
  - `src/controllers` – `authController`, `transactionController`, `budgetController`, `reportController`
  - `src/routes` – `authRoutes`, `transactionRoutes`, `budgetRoutes`, `reportRoutes`
  - `src/middleware` – `authMiddleware` (JWT), `errorMiddleware`
- **frontend**
  - `pages` – `index`, `login`, `register`, `dashboard`, `reports`
  - `components` – layout, charts, budget bars, alerts
  - `hooks` – `useAuth`
  - `utils` – `api` (Axios instance)

### 2. Environment variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB_NAME=personal_finance_dashboard
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Install dependencies

From the project root:

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 4. Run locally

In the project root:

```bash
npm run dev
```

This runs:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:3000`

Then open `http://localhost:3000` in the browser.

### 5. Core flows

- **Register/Login**: `/register` and `/login` pages call `/api/auth/register` and `/api/auth/login`. JWT is stored in `localStorage` and attached to requests.
- **Dashboard**:
  - Summary cards: total income, total expenses, remaining balance.
  - Pie chart: category distribution of monthly expenses.
  - Line chart: daily spending trend for the current month.
  - Transaction management: add/delete transactions (income or expense).
  - Budgets: set monthly budget per category; progress bars with warning at 80% and danger at 100%+.
  - CSV: export all transactions, import from CSV.
- **Reports**:
  - Date-range filters.
  - Monthly breakdown table and cumulative summary.

### 6. Deployment (high level)

- **Backend (Render)**:
  - Create new Web Service from the `backend` folder.
  - Set build command: `npm install` and start command: `npm start`.
  - Configure environment variables (same as `backend/.env`).
- **Frontend (Vercel)**:
  - Import the repo.
  - Set root directory to `frontend`.
  - Set env var `NEXT_PUBLIC_API_URL` to your Render backend URL, e.g. `https://your-backend.onrender.com`.
  - Deploy.


