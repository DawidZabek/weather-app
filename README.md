# Weather App (Server-side) — Next.js + Tailwind + MongoDB

A server-side weather application built with **Next.js (App Router)** and **Tailwind CSS**, using **MongoDB** for data persistence.  
The project is designed to meet the **Variant II (server application)** grading requirements.

---

## Project description

The application allows users to search for cities, display weather information, and manage a list of favorite locations.  
All business logic and data access are handled on the server side via REST API endpoints.

---

## Target users

- Users who want to quickly check weather conditions for selected cities.
- People planning trips or outdoor activities who need reliable weather information.

---

## User benefits

- Ability to save frequently checked cities as favorites.
- Centralized server-side API providing consistent weather data.

---

## Functional requirements

1. Fetch weather data for a selected city.
2. Display weather information returned by the server.
3. Add cities to a list of favorites stored in the database.
4. Retrieve the list of favorite cities from the database.

---

## Non-functional requirements

1. The application should be responsive on desktop and mobile devices.
2. The API should return meaningful HTTP status codes and error messages.

---

## Tech stack

- Next.js (React, App Router)
- TypeScript
- Tailwind CSS
- MongoDB (with Mongoose)

---

## Architecture

### Frontend
- Next.js App Router pages
- Tailwind CSS for styling

### Backend
- REST API implemented using Next.js Route Handlers (`app/api/*`)
- Server-side request and response handling

### Database
- MongoDB used for data persistence
- Collection: `favorites`

---

## REST API documentation

### Favorites

#### GET `/api/favorites`
Returns a list of all favorite cities.

**Response codes:**
- `200 OK` – list returned successfully

---

#### POST `/api/favorites`
Adds a new city to favorites.

**Request body:**
```json
{
  "city": "Warsaw",
  "lat": 52.2297,
  "lon": 21.0122
}
```

**Response codes:**
- `201 Created` – favorite added successfully
- `400 Bad Request` – invalid request data
- `409 Conflict` – city already exists in favorites

---

## Database schema

### favorites
Fields:
- `city` – string (required)
- `lat` – number (required)
- `lon` – number (required)
- `createdAt` – date
- `updatedAt` – date

---

## Getting started (local development)

### Prerequisites
- Node.js and npm
- Local MongoDB instance (MongoDB Compass recommended)

---

### Installation

```bash
npm install
```

---

### Environment configuration

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/weather-app
```

Example file:
- `.env.example`

---

### Running the application

```bash
npm run dev
```

Application URL:
- http://localhost:3000

API example:
- http://localhost:3000/api/favorites

---

## Notes for grading (Variant II)

This project includes:
- Server-side application architecture
- REST API with documented endpoints
- Database integration with read and write operations
- Clear project specification
- Consistent coding standards (TypeScript, English naming)

---

## Planned extensions

- External weather API integration (`/api/weather`)
- Delete favorites endpoint (`DELETE /api/favorites/:id`)
- Search history stored in MongoDB
- Basic automated tests
