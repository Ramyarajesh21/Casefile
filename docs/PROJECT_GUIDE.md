# Project Guide

This project aims to simulate a premium detective game with a cinematic interface and investigation workflow. It is intentionally built with a simple but scalable structure so beginners can understand the architecture.

## Frontend flow

1. Landing page introduces the game.
2. User registers or signs in.
3. Dashboard lists available and current investigations.
4. Case library renders all cases.
5. Case details lead to an investigation workspace.
6. Users discover clues, evidence, and interview witnesses.
7. The investigation ends with deduction and a final accusation.
8. Results update XP and ranking.

## Backend flow

1. API accepts registration and login.
2. Investigation records are created per user and case.
3. Clues and evidence are discovered/collected with relational records.
4. Results are computed server-side using data validated by the backend.
5. Score and XP are saved into the user record and associated result.

## Shared rules

- All case content is fictional and stored in SQL.
- The backend is the source of truth for scoring and validation.
- The frontend should never trust user-submitted solution values.
- MySQL should be configured before running the app locally.
