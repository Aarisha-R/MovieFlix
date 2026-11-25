# MovieFlix

MovieFlix is a React movie browser with an Express API. User accounts and profiles are stored in PostgreSQL; passwords are hashed and browser sessions use HttpOnly cookies.

## Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer

## Run locally

1. Create a PostgreSQL database named `movieflix` (for example, in pgAdmin).
2. Copy `.env.example` to `.env` and set `DATABASE_URL` to your PostgreSQL connection string.
3. Generate a session secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and put the result in `JWT_SECRET` in `.env`.
4. Install dependencies with `npm install`.
5. In one terminal, run the API with `npm run server`.
6. In another terminal, run the React app with `npm start`.
7. Open `http://localhost:3000` (or the alternate port shown by React if 3000 is busy) and create an account. The API creates the required tables on startup.

Locally, `API_PORT` sets the API port (default `5000`), and the React app uses `3000` unless that port is occupied. `REACT_APP_API_URL` points the frontend to the API, and `CLIENT_ORIGIN` should match the frontend origin. For deployment, set these to your deployed API and frontend origins. Use HTTPS in production; set `PGSSL=true` when the PostgreSQL provider requires TLS.

Profiles are scoped to the signed-in account. Existing browser-only profiles are transferred when the first account is registered. Movie favorites are still stored locally in the browser.
