# TaskFlow Frontend

This `src` is a clean React frontend built around the supplied Express controllers/routes.

## Expected setup

The existing frontend should have React, Vite and `react-router-dom` installed.

Create/use:

```env
VITE_API_URL=http://localhost:5000/api
```

Then copy this `src` folder into the React project and run:

```bash
npm run dev
```

## Routes

- `/login`
- `/dashboard`
- `/tasks`
- `/engagements`
- `/clients`
- `/users`
- `/services`
- `/templates`

## Important backend limitations found during review

The frontend cannot fix server-side bugs. Two supplied backend implementations have limitations:

1. `POST /api/service-types` only reads `name` and `description`, but the ServiceType model in the saved backend requires `type` and `taskTemplate`. This can make creating a brand-new service type fail validation.
2. `POST /api/engagements/:id/next-period` currently sets `nextPeriod` to `null` and returns success without creating the next engagement/tasks.

The UI exposes the available server functionality, but those two server-side behaviors need backend changes if they are required to actually create the records.
