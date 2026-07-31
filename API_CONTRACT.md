# API_CONTRACT.md

# KickStartGH Frontend ↔ Backend Contract

This document is an early, illustrative sketch of the contract shape. For the full,
source-derived entity/field/endpoint reference (including Seasons, formations, and the
marketability profile), see `SRS.md`, which supersedes this document in detail and scope.

## Base URL

Development:

```text
http://localhost:8000/api/v1
```

Production:

```text
https://api.kickstartgh.com/api/v1
```

---

# Authentication

All protected routes require:

```http
Authorization: Bearer <token>
```

---

# Teams

## Create Team

POST

```text
/api/v1/teams
```

Request:

```json
{
  "name": "Osagyefo FC",
  "nickname": "The Lions",
  "region": "Western Region",
  "district": "Ellembelle",
  "homeGround": "Community Park",
  "yearEstablished": 2024
}
```

Response:

```json
{
  "id": "team_001",
  "name": "Osagyefo FC",
  "logo": null,
  "createdAt": "2026-07-13T10:00:00Z"
}
```

---

# Seasons

Season is the top-level container: players are registered per season, and matches and
training sessions each belong to exactly one season.

## List Seasons

GET

```text
/api/v1/teams/:teamId/seasons
```

Response:

```json
[
  {
    "id": "season_2026",
    "name": "2026 Season",
    "startDate": "2026-01-01",
    "endDate": "2026-12-31",
    "status": "active",
    "competitionCategory": "Ellembelle District League"
  }
]
```

---

## Create Season

POST

```text
/api/v1/teams/:teamId/seasons
```

Request:

```json
{
  "name": "2027 Season",
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "competitionCategory": "League"
}
```

---

## Activate Season

POST

```text
/api/v1/seasons/:id/activate
```

Marks `:id` as `"active"` and the previously-active season as `"completed"`. Only one
season is ever active at a time.

---

## Register Player For Season

POST

```text
/api/v1/seasons/:id/players
```

Request:

```json
{
  "playerId": "player_001",
  "jerseyNumber": 9
}
```

A player's jersey number and status are season-specific; the same player can carry a
different jersey number in a different season.

---

# Players

## Get Players

GET

```text
/api/v1/teams/:teamId/players?seasonId=season_2026
```

Response:

```json
[
  {
    "id": "player_001",
    "fullName": "Kwesi Mensah",
    "position": "Forward",
    "jerseyNumber": 9,
    "photo": null
  }
]
```

---

## Create Player

POST

```text
/api/v1/players
```

Request:

```json
{
  "teamId": "team_001",
  "fullName": "Kwesi Mensah",
  "position": "Forward",
  "dateOfBirth": "2005-05-12",
  "phone": "+233XXXXXXXXX"
}
```

---

# Matches

## Create Match

POST

```text
/api/v1/matches
```

Request:

```json
{
  "teamId": "team_001",
  "seasonId": "season_2026",
  "opponent": "Unity FC",
  "date": "2026-08-01",
  "venue": "Community Park"
}
```

---

# Reports

## Generate Team Report

POST

```text
/api/v1/reports/team
```

Request:

```json
{
  "teamId": "team_001",
  "columns": [
    "headCoach",
    "matchesPlayed",
    "wins",
    "losses"
  ],
  "format": "pdf"
}
```

Response:

```json
{
  "downloadUrl": "..."
}
```

---

# Error Format

All API errors must follow:

```json
{
  "message": "Validation failed",
  "errors": {
    "phone": [
      "Phone number is required"
    ]
  }
}
```
