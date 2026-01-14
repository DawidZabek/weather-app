# Weather App (Server-side) — Next.js + Tailwind + MongoDB

A simple server-side weather application built with **Next.js (App Router)** and **Tailwind CSS**, with a **MongoDB** database for storing user data (favorites, later also search history).  
The project is designed to meet the **Variant II (server application)** grading requirements.

---

## Project description

The application allows users to search for a city, view current weather and forecasts, and save favorite locations.  
The server exposes a REST API and persists user data in MongoDB.

---

## Target users (at least 2)

- People planning trips/commutes who need quick weather checks.
- Outdoor/sports enthusiasts (running, cycling) who rely on forecasts.

---

## User benefits (at least 2)

- Faster access to frequently checked locations via favorites.
- A cleaner and consistent interface for weather data (server-side API as a single source).

---

## Functional requirements (at least 4)

1. Search for a city and fetch its current weather.
2. Display a multi-day forecast for the selected city.
3. Manage favorite cities (add/remove/list) stored in MongoDB.
4. Store and display search history (planned feature, stored in MongoDB).

---

## Non-functional requirements (at least 2)

1. Responsive UI for at least two breakpoints (mobile/desktop) on key screens.
2. Error handling and clear messages (validation errors, external API errors, empty results).

---

## Tech stack (at least 2)

- Next.js (React) + TypeScript
- Tailwind CSS
- MongoDB (via Mongoose)

---

## Architecture overview

### Frontend
- Next.js App Router pages
- Tailwind CSS for styling

### Backend (server-side)
- Next.js Route Handlers under `app/api/*`
- REST endpoints returning proper HTTP status codes and JSON

### Database
- MongoDB used for persistence
- Collections (current):
  - `favorites`

---

## REST API

### Favorites

#### `GET /api/favorites`
Returns the list of favorite cities.

- **200 OK** — returns an array of favorites

#### `POST /api/favorites`
Creates a new favorite city.

Request body:
```json
{
  "city": "Warsaw",
  "lat": 52.2297,
  "lon": 21.0122
}
