# Clipping Frontend

React + Vite frontend for the Clipping creator platform.

## Stack
- React 18
- React Router v6
- Axios
- Vite (dev server + build)
- CSS Modules

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start your FastAPI backend
Make sure your backend is running on port 8000:
```bash
python main.py
```

### 3. Start the frontend
```bash
npm run dev
```

Open http://localhost:5173

> The Vite proxy automatically forwards `/api/*` requests to `http://localhost:8000`
> so you don't have any CORS issues in development.

---

## Project Structure

```
src/
├── api/
│   └── index.js          # All FastAPI calls (auth, campaigns, submissions, identity)
├── context/
│   └── AuthContext.jsx   # JWT auth state, persists across page refresh
├── components/
│   ├── Layout.jsx         # Sidebar + navigation shell
│   ├── Layout.module.css
│   ├── UI.jsx             # Button, Input, Card, Badge, StatCard, Alert, etc.
│   └── UI.module.css
├── pages/
│   ├── Welcome.jsx        # Landing page
│   ├── Login.jsx          # POST /api/v1/auth/login
│   ├── Register.jsx       # POST /api/v1/auth/register
│   ├── Dashboard.jsx      # GET /api/v1/identity/dashboard/:creator_id
│   ├── Campaigns.jsx      # GET /api/v1/campaigns/
│   ├── CampaignDetail.jsx # GET /api/v1/campaigns/:id + POST join + POST submission
│   ├── Submissions.jsx    # GET /api/v1/submissions/passed/:campaign_id
│   └── Profile.jsx        # GET /api/v1/identity/dashboard/:creator_id
├── App.jsx                # Routes
├── main.jsx               # Entry point
└── index.css              # Global CSS variables
```

---

## API Endpoints Used

| Page | Method | Endpoint |
|------|--------|----------|
| Login | POST | `/api/v1/auth/login` |
| Register | POST | `/api/v1/auth/register` |
| Dashboard | GET | `/api/v1/identity/dashboard/:creator_id` |
| Campaigns list | GET | `/api/v1/campaigns/?status=active` |
| Campaign detail | GET | `/api/v1/campaigns/:id` |
| Join campaign | POST | `/api/v1/campaigns/:id/join` |
| Submit content | POST | `/api/v1/submissions/` |
| View submissions | GET | `/api/v1/submissions/passed/:campaign_id` |

---

## Deploy

### Frontend → Vercel
```bash
npm run build
# Upload dist/ folder to Vercel or run:
npx vercel
```

### Backend → Render / Railway
Point to your FastAPI repo, set start command to `python main.py`

### Update API base URL for production
In `src/api/index.js`, change:
```js
const BASE = '/api/v1'
// to:
const BASE = 'https://your-backend.onrender.com/api/v1'
```

And remove the proxy from `vite.config.js` (proxy only works in dev).
