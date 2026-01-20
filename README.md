# 🌦️ Weather App – Server-Side Web Application

## Project Description
**Weather App** is a fullstack **server-side web application** that allows users to check current weather conditions, weekly forecasts, and visualize precipitation data on an interactive world map.  
The application exposes its own **REST API**, integrates with external weather services, and stores user data in a **MongoDB** database.


---

## Target Users
- **Individual users** who want to check weather conditions, save favorite cities, and explore weather data on a map.

---

## User Benefits
- Fast access to current weather data and forecasts
- Ability to save favorite cities after logging in
- Interactive world map with precipitation radar
- Secure authentication and persistent user data

---

## Technology Stack
- **Next.js 16 (App Router)** – server-side framework
- **React + TypeScript** – frontend UI
- **MongoDB + Mongoose** – NoSQL database
- **NextAuth.js** – authentication and session handling
- **Open-Meteo API** – weather data provider
- **RainViewer API** – precipitation radar tiles
- **Leaflet + React-Leaflet** – interactive maps
- **Tailwind CSS** – UI styling
- **Vitest + Testing Library** – automated tests
- **GitHub Actions** – CI pipeline

---

## Functional Requirements
1. **City weather search**  
   Users can search for a city and receive current weather data.

2. **User registration and login**  
   Users can create an account and authenticate using email and password.

3. **Favorite cities management**  
   Logged-in users can add and remove favorite cities stored in MongoDB.

4. **World weather map**  
   Users can navigate to a map view displaying precipitation radar and click any point to fetch weather data.

5. **7-day weather forecast**  
   Users can view a weekly weather forecast for a selected city.

---

## Non-Functional Requirements

### Security
- Passwords are hashed using `bcrypt`
- Authentication handled via NextAuth (JWT-based sessions)

### Reliability & Error Handling
- REST API returns proper HTTP status codes (200, 400, 401, 404, 500, 502)
- Network and upstream API errors are handled gracefully

### Usability
- Responsive UI using Tailwind CSS
- Clear loading states and error messages

---

## Application Architecture
The application follows a **server-side architecture**.

### Frontend (Client Components)
- User interface
- Forms and user interactions
- Interactive map rendering

### Backend (API Routes – Server Components)
- Business logic
- Database access
- Communication with external APIs

The frontend **never communicates directly with third-party APIs**.  
All external API calls are performed on the server via internal REST endpoints.

---

## API Endpoints

### Weather
- `GET /api/weather?city=CityName`  
  Returns current weather data for a given city.

### Map
- `GET /api/map/weather?lat=..&lon=..`  
  Returns weather data for a selected map point.
- `GET /api/map/radar`  
  Returns precipitation radar tile information.

### Authentication
- `POST /api/auth/register`  
  Registers a new user.
- `POST /api/auth/[...nextauth]`  
  Handles login and session management.

### Favorites
- `GET /api/favorites`  
  Returns the user’s favorite cities.
- `POST /api/favorites`  
  Adds a city to favorites.
- `DELETE /api/favorites/{cityKey}`  
  Removes a city from favorites.

---

## Database
The application uses **MongoDB** with the following collections:
- `users` – registered users
- `favorites` – user favorite cities

Mongoose is used as the ODM layer.

---

## Testing
Automated tests were implemented using **Vitest** and **Testing Library**.

Covered areas:
- API routes (weather, map radar)
- Main page rendering and interactions

## Run tests locally

Run the test suite in watch mode during development using:

npm test

## Run tests once (CI mode)

Run all tests once (used in CI pipelines):

npm run test:run

## Run tests with coverage

Generate test coverage report:

npm run test:coverage

## CI

Tests are automatically executed on every push using GitHub Actions.  
The pipeline installs dependencies, runs the test suite and fails the build if any test does not pass.

## How to Run the Project

Install dependencies and start the development server:

npm install  
npm run dev

The application will be available at:  
http://localhost:3000

## Author

Dawid Ząbek  
Weather App – JavaScript Programming Languages Project
