# API Documentation

## Base URL

- Local backend: `http://localhost:5000/api`

## Authentication

Most routes are open for the prototype demo, but the structure supports secure session flow. In a production system, use a bearer token or server-side session.

## Endpoints

### Auth

#### POST /api/auth/register

Creates a new user account.

Request body:

```json
{
  "full_name": "Jane Doe",
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "Secret123",
  "confirm_password": "Secret123"
}
```

#### POST /api/auth/login

Logs a user in.

Request body:

```json
{
  "username": "detective_demo",
  "password": "Detective@123"
}
```

#### GET /api/auth/me

Returns the current user profile if available.

### Cases

#### GET /api/cases

Returns all cases.

#### GET /api/cases/:case_id

Returns a single case.

#### GET /api/cases/:case_id/clues

Returns all clues for the case.

#### GET /api/cases/:case_id/evidence

Returns evidence for the case.

#### GET /api/cases/:case_id/witnesses

Returns the witnesses for the case.

#### GET /api/cases/:case_id/suspects

Returns suspects for the case.

#### GET /api/cases/:case_id/timeline

Returns timeline events for the case.

### Investigations

#### POST /api/investigations/start

Starts an investigation.

Request body:

```json
{
  "user_id": 1,
  "case_id": 1
}
```

#### GET /api/investigations/:investigation_id

Fetches an investigation.

#### POST /api/investigations/:investigation_id/clues/:clue_id/discover

Marks a clue as discovered.

#### POST /api/investigations/:investigation_id/evidence/:evidence_id/collect

Marks evidence as collected.

#### POST /api/investigations/:investigation_id/witnesses/:witness_id/interview

Records a witness interview.

#### GET /api/investigations/:investigation_id/deductions

Returns deductions entered in the case.

#### POST /api/investigations/:investigation_id/deductions

Creates a deduction.

#### POST /api/investigations/:investigation_id/accusation

Submits the final accusation.

#### GET /api/investigations/:investigation_id/result

Returns the solved/failed case result.

### Profile

#### GET /api/profile

Returns the current detective profile.

#### GET /api/profile/statistics

Returns investigation totals and stats.
