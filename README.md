\section{Weather App -- Server-Side Web Application}

\subsection{Project Description}
Weather App is a fullstack \textbf{server-side web application} that allows users to check current weather conditions, weekly forecasts, and visualize precipitation data on an interactive world map.  
The application exposes its own \textbf{REST API}, integrates with external weather services, and stores user data in a \textbf{MongoDB} database.

The project was developed as part of the \textit{JavaScript Programming Languages} course and fulfills the requirements of \textbf{Variant II -- Server-Side Application}.

\subsection{Target Users}
\begin{itemize}
  \item Individual users who want to check weather conditions, save favorite cities, and explore weather data on a map.
  \item Academic audience -- demonstration of a correct server-side architecture using JavaScript, REST API, database integration, and automated testing.
\end{itemize}

\subsection{User Benefits}
\begin{itemize}
  \item Fast access to current weather data and forecasts
  \item Ability to save favorite cities after logging in
  \item Interactive world map with precipitation radar
  \item Secure authentication and persistent user data
\end{itemize}

\subsection{Technology Stack}
\begin{itemize}
  \item Next.js 16 (App Router) -- server-side framework
  \item React with TypeScript -- frontend UI
  \item MongoDB with Mongoose -- NoSQL database
  \item NextAuth.js -- authentication and session handling
  \item Open-Meteo API -- weather data provider
  \item RainViewer API -- precipitation radar tiles
  \item Leaflet and React-Leaflet -- interactive maps
  \item Tailwind CSS -- UI styling
  \item Vitest and Testing Library -- automated tests
  \item GitHub Actions -- CI pipeline
\end{itemize}

\subsection{Functional Requirements}
\begin{enumerate}
  \item City weather search -- users can search for a city and receive current weather data.
  \item User registration and login -- users can create an account and authenticate using email and password.
  \item Favorite cities management -- logged-in users can add and remove favorite cities stored in MongoDB.
  \item World weather map -- users can navigate to a map view displaying precipitation radar and click any point to fetch weather data.
  \item Seven-day weather forecast -- users can view a weekly weather forecast for a selected city.
\end{enumerate}

\subsection{Non-Functional Requirements}
\subsubsection{Security}
\begin{itemize}
  \item Passwords are hashed using the \texttt{bcrypt} algorithm.
  \item Authentication is handled via NextAuth using JWT-based sessions.
\end{itemize}

\subsubsection{Reliability and Error Handling}
\begin{itemize}
  \item REST API returns proper HTTP status codes (200, 400, 401, 404, 500, 502).
  \item Network and upstream API errors are handled gracefully.
\end{itemize}

\subsubsection{Usability}
\begin{itemize}
  \item Responsive user interface created with Tailwind CSS.
  \item Clear loading indicators and error messages.
\end{itemize}

\subsection{Application Architecture}
The application follows a \textbf{server-side architecture}.

\begin{itemize}
  \item Frontend (Client Components) -- responsible for user interaction, forms, and map rendering.
  \item Backend (API Routes -- Server Components) -- responsible for business logic, database access, and communication with external APIs.
\end{itemize}

The frontend never communicates directly with third-party APIs.  
All external API calls are performed exclusively on the server via internal REST endpoints.

\subsection{API Endpoints}

\subsubsection{Weather}
\begin{itemize}
  \item \texttt{GET /api/weather?city=CityName} -- returns current weather data for a given city.
\end{itemize}

\subsubsection{Map}
\begin{itemize}
  \item \texttt{GET /api/map/weather?lat=\dots\&lon=\dots} -- returns weather data for a selected map point.
  \item \texttt{GET /api/map/radar} -- returns precipitation radar tile information.
\end{itemize}

\subsubsection{Authentication}
\begin{itemize}
  \item \texttt{POST /api/auth/register} -- registers a new user.
  \item \texttt{POST /api/auth/[...nextauth]} -- handles login and session management.
\end{itemize}

\subsubsection{Favorites}
\begin{itemize}
  \item \texttt{GET /api/favorites} -- returns the user’s favorite cities.
  \item \texttt{POST /api/favorites} -- adds a city to favorites.
  \item \texttt{DELETE /api/favorites/\{cityKey\}} -- removes a city from favorites.
\end{itemize}

\subsection{Database}
The application uses \textbf{MongoDB} with the following collections:
\begin{itemize}
  \item \texttt{users} -- registered users
  \item \texttt{favorites} -- user favorite cities
\end{itemize}

Mongoose is used as the Object Data Modeling (ODM) layer.

\subsection{Testing}
Automated tests were implemented using \textbf{Vitest} and \textbf{Testing Library}.  
Test coverage includes API routes and frontend components.

Tests can be executed locally or automatically via the CI pipeline.

\subsection{CI/CD}
The project includes a \textbf{GitHub Actions} workflow that:
\begin{itemize}
  \item installs dependencies,
  \item runs automated tests,
  \item fails the build if any test does not pass.
\end{itemize}

\subsection{Conclusion}
The Weather App project fulfills all requirements of a server-side web application.  
It demonstrates proper separation of concerns, secure authentication, integration with external APIs, database usage, and automated testing.

\subsection{Author}
Dawid Ząbek
