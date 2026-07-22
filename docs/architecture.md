# Architecture

```
              React Native + Expo (mobile)
                        |
                        | HTTP REST
                        v
                     FastAPI
                        |
        +---------------+---------------+
        v               v               v
   PostgreSQL       AI/ML Python    External APIs
   + PostGIS                        OpenStreetMap
        |                           Open-Meteo / Nominatim
        v
   Next.js Admin
```

## Complaint status flow

PENDING -> UNDER_REVIEW -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED

## Roles

CITIZEN, OFFICER, ADMIN
