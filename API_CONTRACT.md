# API_CONTRACT.md

# KickStartGH Frontend ↔ Backend Contract

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

# Players

## Get Players

GET

```text
/api/v1/teams/:teamId/players
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
