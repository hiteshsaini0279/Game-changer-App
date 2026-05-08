# 🚀 180 Days Consistency Challenge

> A full-stack SaaS productivity app for CS students preparing for 30+ LPA tech placements.
> Built with React + Node.js + MongoDB.

---

## 🗂️ Project Structure

```
180days/
├── backend/
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── dailyController.js
│   │   ├── dsaController.js
│   │   ├── devController.js
│   │   ├── subjectController.js
│   │   ├── englishController.js
│   │   └── analyticsController.js
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Daily.js
│   │   ├── DSA.js
│   │   ├── DevProject.js
│   │   ├── Subject.js
│   │   └── English.js
│   ├── middleware/
│   │   └── auth.js          # JWT middleware
│   ├── routes/              # Express routers
│   │   ├── auth.js
│   │   ├── daily.js
│   │   ├── dsa.js
│   │   ├── dev.js
│   │   ├── subjects.js
│   │   ├── english.js
│   │   └── analytics.js
│   ├── seed.js              # Demo data seeder
│   ├── server.js            # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Layout.jsx      # Sidebar + mobile nav
    │   │   └── dashboard/
    │   │       └── Heatmap.jsx     # GitHub-style heatmap
    │   ├── context/
    │   │   └── store.js            # Zustand stores
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx   # Main analytics hub
    │   │   ├── DailyPage.jsx       # Daily tracker
    │   │   ├── DSAPage.jsx         # Problem tracker
    │   │   ├── DevPage.jsx         # Projects + Kanban
    │   │   ├── SubjectsPage.jsx    # OOPS/DBMS/OS/CN
    │   │   ├── EnglishPage.jsx     # English sessions
    │   │   └── AnalyticsPage.jsx   # Deep analytics
    │   ├── utils/
    │   │   ├── api.js              # Axios instance
    │   │   └── helpers.js          # Utilities + constants
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone & Install

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env — set your MONGODB_URI and JWT_SECRET
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/180days
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Seed Demo Data (optional)

```bash
cd backend
node seed.js
```

This creates:
- Demo user: `demo@180days.app` / `demo123`
- 30 days of daily logs
- 30 DSA problems
- 3 dev projects
- All 4 subjects initialized
- 5 English sessions

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend
npm run dev       # runs on :5000

# Terminal 2 — Frontend
cd frontend
npm run dev       # runs on :5173
```

Open → **http://localhost:5173**

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Daily Tracker
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/daily` | Get all entries (paginated) |
| POST | `/api/daily` | Create entry |
| PUT | `/api/daily/:id` | Update entry |
| DELETE | `/api/daily/:id` | Delete entry |
| GET | `/api/daily/today` | Get today's entry |
| GET | `/api/daily/heatmap` | Get heatmap data |

### DSA
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dsa` | Get all problems (filterable) |
| POST | `/api/dsa` | Add problem |
| PUT | `/api/dsa/:id` | Update problem |
| DELETE | `/api/dsa/:id` | Delete problem |
| GET | `/api/dsa/stats` | Topic/difficulty stats |

### Dev Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dev` | All projects |
| POST | `/api/dev` | Create project |
| PUT | `/api/dev/:id` | Update project |
| DELETE | `/api/dev/:id` | Delete project |
| POST | `/api/dev/:id/tasks` | Add task |
| PUT | `/api/dev/:id/tasks/:taskId` | Update task |

### Subjects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all 4 subjects |
| PUT | `/api/subjects/:id` | Update subject |
| PUT | `/api/subjects/:id/topics/:topicId` | Update topic |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Full dashboard summary |
| GET | `/api/analytics/weekly/:weekNum` | Week detail |

---

## 🏭 Production Deployment

### Backend (Railway / Render)
```bash
# Set env vars:
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<strong_secret>
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```bash
# In vite.config.js, update proxy or set env:
VITE_API_URL=https://your-backend.railway.app/api

# Update utils/api.js baseURL to:
baseURL: import.meta.env.VITE_API_URL || '/api'
```

---

## ✨ Features Checklist

- [x] JWT Authentication (register/login/protected routes)
- [x] Daily Tracker with mood, streak, auto-complete detection
- [x] No Zero Day alert system
- [x] GitHub-style Activity Heatmap
- [x] DSA tracker with filters, revision queue, topic radar chart
- [x] Dev Projects with Kanban board (To Do / In Progress / Done)
- [x] Core Subjects tracker (OOPS, DBMS, OS, CN) with confidence levels
- [x] English Practice with mistake tracking & vocabulary log
- [x] Analytics: weekly charts, daily trends, projections
- [x] Dark / Light mode
- [x] Responsive (mobile + desktop)
- [x] Data export (CSV + JSON)
- [x] Framer Motion animations throughout
- [x] Demo data seeder

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + custom glass components |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand (persist) |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |

---

Built with ❤️ for serious placement aspirants. Stay consistent. 🚀
