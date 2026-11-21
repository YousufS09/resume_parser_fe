# Resume Parser Frontend

React single-page app for the Resume Parser Service: upload resumes, browse parsed candidates, and view, re-parse, download, or delete each profile.

## Tech stack

React 19, React Router 7, Axios, Vite, oxlint. Deployed on Netlify.

## Pages

| Route | Page |
| --- | --- |
| `/dashboard` | Parsing metrics: totals, average confidence, top skills, recent resumes |
| `/upload` | Drag-and-drop upload of PDF/DOCX files (5 MB max), parsed one at a time with per-file status and retry |
| `/results` | Searchable, paged table of parsed resumes. `?q=` filters by name, email, skill, or filename (used by the header search) |
| `/results/:id` | Candidate profile with links, skills, experience, education, certifications, projects, and raw parsed JSON. Actions: download original, re-parse, delete |

## Setup

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and expects the backend at `http://localhost:3000` by default.

## Configuration

Set these in a `.env.local` file, or in the Netlify site settings for deployments:

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_RESUME_API_BASE_URL` | `http://localhost:3000/api/parse` | Backend URL. A bare origin or `/api` is expanded to `/api/parse`. |
| `VITE_RESUME_API_TIMEOUT_MS` | `120000` | Request timeout. Parsing with the LLM can take several seconds. |

The backend must allow the frontend's origin in its `ALLOWED_ORIGINS` setting.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

CI (`.github/workflows/frontend-ci.yml`) runs lint and build on every push and pull request to `main`.

## Deployment

`netlify.toml` builds with `npm run build`, publishes `dist/`, and redirects all routes to `index.html` so client-side routes work on refresh.
