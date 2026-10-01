# CASEFILE

CASEFILE is a detective investigation web application and portfolio project demonstrating full-stack development with a React frontend, a Python Flask API, SQLAlchemy, and a MySQL relational database.

Users can register and sign in, select a case, investigate its scene, clues, evidence, witnesses, and suspects, build deductions, submit an accusation, and review the result. This is an educational portfolio project, not a commercial production system.

## Project Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- utils/
|   |-- .env.example
|   |-- requirements.txt
|   `-- run.py
|-- database/
|   |-- schema.sql
|   `-- seed.sql
|-- docs/
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- layouts/
|   |   |-- pages/
|   |   `-- services/
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- package.json
|-- package-lock.json
`-- README.md
```

The backend contains Flask routes, SQLAlchemy models, utilities, and a services directory. The frontend source contains the React app, shared components, context, layouts, pages, and API services. Additional guides are in `docs/`.

## Features

- Account registration, login, logout, and protected routes
- bcrypt password hashing and Flask session-based authentication
- Case library, case details, and investigation dashboard
- Crime scene, clues, evidence, witnesses, suspects, and timeline
- Deductions, accusation submission, and case results
- Profile, settings, user statistics, and account deletion

## Technologies

- Frontend: React, JavaScript, React Router, Vite, HTML, and CSS
- Backend: Python, Flask, Flask-CORS, Flask-SQLAlchemy, SQLAlchemy, and bcrypt
- Database: MySQL with PyMySQL
- Backend environment loading: `python-dotenv`

The React frontend makes HTTP requests to the Flask API. SQLAlchemy provides the backend's database integration.

## Database

The SQL scripts create the `casefile_db` MySQL database. The schema includes users, cases, victims, suspects, witnesses, clues, evidence, timeline events, investigations, discovered clues, collected evidence, witness interviews, deductions, accusations, case results, and user statistics.

The application also calls SQLAlchemy's `create_all()` during startup. `database/schema.sql` drops and recreates its tables, so review it and back up any data before running it against an existing database. `database/seed.sql` inserts sample cases and an intentional demo/test account.

## Local Setup

### Prerequisites

- Node.js and npm
- Python 3
- MySQL and a MySQL client to execute the SQL files

Run these steps from a local checkout of the repository.

### 1. Set up the database

Execute `database/schema.sql` in your MySQL client, followed by `database/seed.sql`. The seed includes an intentional demo/test account; it is sample data, not a personal account.

### 2. Configure and start the backend

In PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env` with your own local database credentials, and replace the template `SECRET_KEY` with a locally generated value. Do not commit `.env` or share real credentials. `CORS_ORIGINS` configures the frontend origins accepted by the API.

On macOS/Linux, activate the environment with `source .venv/bin/activate` and copy the template with `cp .env.example .env`.

With the virtual environment active and the terminal in `backend/`, start Flask:

```bash
python run.py
```

The development server listens on `http://localhost:5000`.

### 3. Configure and start the frontend

In a second terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend template sets `VITE_API_URL` to `http://localhost:5000/api`. Vite's default development address is `http://localhost:5173`. If Vite selects a different port, include that origin in the backend's `CORS_ORIGINS` value.

On macOS/Linux, copy the template with `cp .env.example .env`.

### Build and lint

Run from `frontend/`:

```bash
npm run build
npm run lint
```

The frontend package does not define a test script, and no automated test suite is included in the repository.

## Documentation

- `docs/API_DOCUMENTATION.md`
- `docs/DATABASE_GUIDE.md`
- `docs/PROJECT_GUIDE.md`

## Portfolio Context

CASEFILE showcases React UI development, Flask API integration, session-based authentication, relational database design, and a multi-step investigation workflow.

**Author:** Ramya S, M.Sc. IT | Python Full Stack Developer

## License

No license file is included in the repository; terms of use have not been specified.