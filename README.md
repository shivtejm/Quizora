# Quizora - Online Examination & Evaluation Platform
> An enterprise-grade, full-stack automated multiple-choice examination platform with instant objective grading, instructor isolation, and real-time analytics.

---

## 📁 Project Architecture & Directory Structure

```text
InterviewEvaluatioon/
├── app/
│   ├── frontend/                       # Client-Side Application
│   │   ├── css/
│   │   │   └── styles.css              # Custom styling, dark mode & responsive UI
│   │   ├── js/
│   │   │   ├── app.js                  # Shared utilities, Supabase & REST API sync
│   │   │   ├── dashboard.js            # Analytics, KPI metrics & Canvas charts
│   │   │   ├── interview.js            # Live candidate interview & scoring engine
│   │   │   ├── questions.js            # Question bank management (CRUD)
│   │   │   └── results.js              # Evaluation directory & candidate report modal
│   │   ├── index.html                  # Landing page
│   │   ├── login.html                  # Authentication portal (Admin & Candidate)
│   │   ├── admin-dashboard.html        # Recruiter & Admin overview dashboard
│   │   ├── question-bank.html          # Question library manager
│   │   ├── results.html                # Candidate evaluation directory & reports
│   │   └── interview.html              # Candidate automated interview interface
│   │
│   └── backend/                        # Server-Side Application
│       ├── src/
│       │   ├── config/
│       │   │   └── supabase.js         # Supabase cloud database configuration
│       │   ├── controllers/
│       │   │   ├── authController.js   # Authentication & session verification
│       │   │   ├── questionsController.js # Questions CRUD controller
│       │   │   └── resultsController.js   # Results storage & evaluation controller
│       │   ├── routes/
│       │   │   ├── authRoutes.js       # /api/auth routes
│       │   │   ├── questionRoutes.js   # /api/questions routes
│       │   │   └── resultRoutes.js     # /api/results routes
│       │   ├── services/
│       │   │   └── nlpEvaluationService.js # NLP scoring & keyword extraction
│       │   ├── data/                   # Persistent local fallback storage
│       │   │   ├── questions.json
│       │   │   └── results.json
│       │   └── app.js                  # Express application setup & middleware
│       ├── database/
│       │   └── schema.sql              # Supabase / PostgreSQL DDL migration script
│       ├── .env.example                # Environment variables template
│       ├── package.json                # Backend dependencies & run scripts
│       └── server.js                   # Node.js server entry point (Port 5000)
│
├── index.html                          # Root entry point (forwards to app/frontend/)
├── package.json                        # Root workspace configuration
└── README.md                           # Documentation & setup guide
```

---

## 🚀 How to Run the Project

### Option A: Full-Stack Mode (Frontend + Node.js/Express Backend)

1. **Install backend dependencies**:
   ```bash
   cd app/backend
   npm install
   ```
2. **Start the backend server**:
   ```bash
   npm start
   # Server starts at: http://localhost:5000
   # API Health Check: http://localhost:5000/api/health
   ```
3. **Open the frontend**:
   - The Express server automatically serves the frontend at `http://localhost:5000/index.html`!
   - Or start a static frontend server:
     ```bash
     python -m http.server 3000 --directory app/frontend
     # Open in browser: http://localhost:3000
     ```

### Option B: Standalone Frontend Mode (GitHub Pages / Static)
- You can host `app/frontend/` directly on **GitHub Pages**, **Vercel**, or **Netlify**.
- The frontend includes built-in offline fallbacks (`localStorage`) and direct Supabase connectivity, so it functions with or without the Node.js backend.

---

## 📡 RESTful API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `POST` | `/api/auth/login` | Authenticate user session |
| `GET` | `/api/questions` | List questions (supports `?category=` and `?difficulty=`) |
| `GET` | `/api/questions/:id` | Get question by ID |
| `POST` | `/api/questions` | Add new question |
| `PUT` | `/api/questions/:id` | Update existing question |
| `DELETE` | `/api/questions/:id` | Delete question |
| `GET` | `/api/results` | List all evaluations (supports `?status=` and `?search=`) |
| `GET` | `/api/results/stats` | Dashboard statistics & KPI metrics |
| `GET` | `/api/results/:id` | Get detailed candidate evaluation report |
| `POST` | `/api/results/evaluate` | Submit answers & generate automated evaluation |

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

Run the SQL script located at `app/backend/database/schema.sql` in your **Supabase Dashboard → SQL Editor** to initialize the cloud tables, indexes, and row-level security policies.

---

## 📬 Contact & Support

For queries, assistance, or contributions, reach out to:
- **Shivtej Mahatme**: [shivtej.connect@gmail.com](mailto:shivtej.connect@gmail.com)
- **Sakshi Arungade**: [sakshi.arungade8767@gmail.com](mailto:sakshi.arungade8767@gmail.com)

