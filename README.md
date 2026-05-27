# Fantasy Baseball Platform

A full-stack fantasy baseball application built with React Native and Node.js. Users can create accounts, form leagues, draft real MLB players, manage rosters, propose trades, and track live player stats — all backed by real-time MLB data from the ESPN API.

## Live Demo

> **Frontend:** https://capstone-project-nj9b.vercel.app/
> **Backend:** https://capstone-project-33jg.onrender.com/ 

---

## Features

- **Authentication** — Secure account creation and login using JWT and bcrypt password hashing
- **League Management** — Create or join leagues with custom settings
- **Snake Draft** — Live drafting interface with state managed on the frontend
- **Roster Management** — Add/drop players from the waiver wire, set lineups, and manage positions
- **Trades** — Propose, review, and accept/reject trades with other teams in your league
- **Live Player Stats** — Daily stat sync powered by the ESPN MLB API via a scheduled cron job (runs nightly at 3 AM)
- **Live Scoreboard** — Real-time MLB game scores pulled from the ESPN API

---

## Tech Stack

**Frontend**
- React Native + Expo (file-based routing via Expo Router)
- TypeScript
- Supabase JS client (for auth session management)
- Axios (HTTP requests to the backend)
- React Navigation (bottom tabs)

**Backend**
- Node.js + Express 5
- PostgreSQL (via the `pg` driver)
- Supabase (database hosting)
- JWT (`jsonwebtoken`) + bcrypt for authentication
- `node-cron` for scheduled daily stat syncs
- Axios (ESPN API calls)

**Deployment**
- Frontend: Vercel
- Backend: Render

---

## Project Structure

```
fantasy-app/
├── app/                    # Expo Router screens
│   ├── index.tsx           # Landing / splash screen
│   ├── login.tsx           # Login screen
│   ├── signup.tsx          # Account creation
│   ├── home.tsx            # Home dashboard
│   ├── leagues.tsx         # League list
│   ├── leagues/[id].tsx    # Individual league view
│   ├── teams/[id].tsx      # Team roster & management
│   ├── trades/[teamId].tsx # Trade hub
│   ├── trades/createTrade.tsx
│   ├── game.tsx            # Live scoreboard
│   ├── player.tsx          # Player detail
│   ├── players/[id].tsx    # Player stats page
│   ├── profile.tsx         # User profile
│   ├── createLeague.tsx
│   ├── joinLeague.tsx
│   ├── positionPlayer.tsx  # Lineup slot management
│   └── navbar.tsx
├── services/               # Frontend API layer
│   ├── api.tsx             # Axios base config
│   ├── auth.tsx
│   ├── leagues.tsx
│   ├── teams.tsx
│   ├── players.tsx
│   ├── trades.tsx
│   ├── user.tsx
│   └── scheduler.tsx
├── constants/
│   └── theme.ts            # App-wide color/style constants
├── server/                 # Express backend
│   ├── server.js           # Entry point + cron job
│   ├── config/db.js        # PostgreSQL connection pool
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leagueController.js  # Includes syncAllLeagues()
│   │   ├── teamController.js
│   │   ├── playerController.js
│   │   └── tradesController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── leagueRoutes.js
│       ├── teamRoutes.js
│       ├── playerRoutes.js
│       └── tradeRoutes.js
└── assets/
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/...` | Register / login |
| GET/POST | `/leagues/...` | League CRUD |
| GET/POST | `/teams/...` | Team & roster management |
| GET/POST | `/players/...` | Player lookup |
| GET/POST | `/trades/...` | Trade management |
| GET | `/api/mlb/teams` | Live MLB team data (ESPN) |
| GET | `/api/mlb/scoreboard` | Live MLB scoreboard (ESPN) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with a PostgreSQL database
- A `.env` file in `server/` with your database credentials and JWT secret

### Frontend

```bash
cd fantasy-app
npm install
npx expo start
```

Scan the QR code in Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

### Backend

```bash
cd fantasy-app/server
npm install
npm run dev   # uses nodemon for hot reload
```

The server runs on port `5001` by default.

### Environment Variables

Create a `server/.env` file:

```
PORT=5001
DATABASE_URL=your_supabase_postgres_connection_string
JWT_SECRET=your_jwt_secret
```

---

## Contributors

- [Jay Cook](https://github.com/JayMCook)
- [Samin Faruque](https://github.com/sfaruque10)
