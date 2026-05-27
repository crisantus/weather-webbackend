# WeatherTrack Server

This is the backend API for WeatherTrack. It handles authentication, weather lookups, saved locations, weather history, and database access.

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT authentication
- OpenWeather API

## Folder Structure

```txt
server/
  prisma/              # Prisma schema
  src/config/          # Environment and Prisma setup
  src/middlewares/     # Auth and error middleware
  src/modules/         # Feature modules
  src/utils/           # Helper functions
```

## Environment Variables

The server uses one local env file:

```txt
server/.env
```

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/weathertrack?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT="5000"
CLIENT_URL="http://localhost:3000"
OPENWEATHER_API_KEY="your-openweathermap-api-key"
OPENWEATHER_BASE_URL="https://api.openweathermap.org/data/2.5"
```

Do not commit `.env` to GitHub.

## OpenWeather API Key

Get a free API key here:

```txt
https://openweathermap.org/api
```

Put it in:

```env
OPENWEATHER_API_KEY="your-real-key"
```

## Install

From the project root:

```bash
npm install
```

Or from inside `server/`:

```bash
npm install
```

## Prisma Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

If you run commands from inside `server/`, use:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## Run Locally

From the project root:

```bash
npm run dev:server
```

Or from inside `server/`:

```bash
npm run dev
```

The API runs at:

```txt
http://localhost:5000
```

Health check:

```txt
GET http://localhost:5000/health
```

## Build

From the project root:

```bash
npm run build:server
```

Or from inside `server/`:

```bash
npm run build
```

## Start Production Build

```bash
npm run build
npm start
```

## Typecheck

```bash
npm run typecheck
```

## API Routes

Authentication:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Weather:

```txt
GET /api/weather/current?city=Lagos
GET /api/weather/location/:locationId
```

Locations:

```txt
GET    /api/locations
POST   /api/locations
GET    /api/locations/:id
PATCH  /api/locations/:id
DELETE /api/locations/:id
PATCH  /api/locations/:id/default
```

History:

```txt
GET    /api/weather-history
GET    /api/weather-history/:id
DELETE /api/weather-history/:id
DELETE /api/weather-history
```

Protected routes require:

```txt
Authorization: Bearer your_access_token
```

## Deployment

Deploy this folder to a Node.js host like Render, Railway, Fly.io, or similar.

Common settings:

- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Set production environment variables in the hosting dashboard:

```env
DATABASE_URL="your-production-postgres-url"
JWT_SECRET="your-production-secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="https://your-frontend-url.vercel.app"
OPENWEATHER_API_KEY="your-openweather-api-key"
OPENWEATHER_BASE_URL="https://api.openweathermap.org/data/2.5"
```
