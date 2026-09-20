# ComplaintMS Frontend (Vanilla HTML / CSS / JavaScript)

This frontend was converted from React to plain HTML, CSS, and vanilla
JavaScript. It talks to the same backend, using the same REST endpoints,
the same JWT-in-`localStorage` auth flow, and the same client-side routing
behaviour as the original React app.

## Running locally

No build step, no `npm install`. Just serve the folder as static files.

Options:

```bash
# Any static file server works, e.g.:
npx serve .
# or
python3 -m http.server 5173
```

Then open the printed URL in your browser.

> Because this is a client-side-routed single page app, if you deep-link to
> a route like `/complaints` directly, your static file server needs to be
> configured to fall back to `index.html` for unknown paths. A `_redirects`
> file (Netlify's SPA fallback format) is included for that purpose.

## Configuring the backend URL

Open `index.html` and edit the inline config block near the top of `<head>`:

```html
<script>
  window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:8080',
  };
</script>
```

Set `API_BASE_URL` to wherever your backend (see `../backend`) is running.
This is the equivalent of the old `VITE_API_URL` build-time environment
variable — just set at runtime instead of build time, since there is no
longer a bundler.

## Project structure

```
frontend/
  index.html              Single HTML shell / SPA entry point
  _redirects              Netlify SPA fallback rule
  css/                     Plain CSS (utility classes + base styles)
  js/
    app.js                 Route table + bootstrap
    api.js                 fetch()-based API client
    auth.js                Auth state (token/user), backed by localStorage
    router.js               Client-side history-API router
    utils.js                Shared helpers (status colors, formatting, escaping)
    components/
      navbar.js             Top navigation bar
      chatPortal.js          Complaint communication portal
    pages/
      login.js, signup.js, profile.js, createComplaint.js,
      complaintsList.js, complaintDetails.js, notFound.js
      admin/dashboard.js, admin/agents.js, admin/users.js, admin/complaints.js
      agent/dashboard.js, agent/complaints.js, agent/complaintDetail.js
```

## Notes

- No React, no build tooling (Vite/Tailwind/PostCSS) is used anymore.
- All API calls, request/response shapes, and localStorage keys are
  unchanged from the original app, so the backend requires **no changes**.
