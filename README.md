# Complaint Management System (ComplaintMS)

A streamlined complaint management platform built with Node.js, Express, MongoDB, and a vanilla HTML/CSS/JavaScript frontend.

## Features

### User Features
- Register and login with email/password
- Create and submit complaints
- Track complaint status in real-time
- View complaint details and resolution messages
- Leave reviews on resolved complaints
- Access personal profile with account summary
- Real-time chat with assigned agents

### Agent Features
- View assigned complaints
- Update complaint status (Open → In Progress → Resolved)
- Communicate with users via chat
- Send email notifications to users on status updates

### Admin Features
- Create and manage agents
- View all complaints in the system
- Manage all users
- Monitor agent performance
- System-wide statistics

## Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Nodemailer / Brevo API for email notifications
- Bcrypt for password hashing

**Frontend:**
- Plain HTML, CSS, and vanilla JavaScript (no framework, no build step)
- Client-side routing via the History API
- `fetch()`-based API client
- No bundler required — served as static files

## Project Structure

```
ResolveX/
├── backend/
│   ├── adminRole/          # Admin controllers, routes, middlewares
│   ├── agentRole/          # Agent controllers, routes, middlewares
│   ├── userRole/           # User controllers, routes, models, middlewares
│   ├── utils/              # Email sending utilities
│   ├── app.js              # Express app setup
│   ├── createAdmin.js      # Admin creation script
│   ├── package.json
│   └── .env.example        # Template for .env
│
└── frontend/
    ├── index.html           # SPA entry point (backend URL configured here)
    ├── _redirects           # Netlify SPA fallback rule
    ├── css/                 # Plain CSS (utility classes + base styles)
    └── js/
        ├── app.js           # Route table + bootstrap
        ├── api.js           # fetch()-based API client
        ├── auth.js          # Auth state (token/user), backed by localStorage
        ├── router.js        # Client-side history-API router
        ├── utils.js         # Shared helpers (status colors, formatting, escaping)
        ├── components/
        │   ├── navbar.js        # Top navigation bar
        │   └── chatPortal.js    # Complaint communication portal
        └── pages/
            ├── login.js, signup.js, profile.js, createComplaint.js,
            ├── complaintsList.js, complaintDetails.js, notFound.js
            ├── admin/dashboard.js, admin/agents.js, admin/users.js, admin/complaints.js
            └── agent/dashboard.js, agent/complaints.js, agent/complaintDetail.js
```

## Installation & Setup

### Prerequisites
- Node.js
- MongoDB (local install or a free MongoDB Atlas cluster)
- npm

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/CMS
JWT_SECRET=your_secret_key
PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Optional: Email notifications (Brevo API)
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> If you don't have MongoDB installed locally, create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), whitelist your IP (or `0.0.0.0/0` for local dev), and use the connection string it gives you as `MONGODB_URI`.

5. Create admin user (one-time setup):
```bash
node createAdmin.js
```

6. Start backend server:
```bash
npm start
```

Server will run on `http://localhost:8080` (or whatever `PORT` you set).

### Frontend Setup

No installation or build step needed — it's static HTML/CSS/JS.

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Open `index.html` and set the backend URL near the top of `<head>`:
```html
<script>
  window.APP_CONFIG = {
    API_BASE_URL: 'http://localhost:8080',
  };
</script>
```

3. Serve the folder with any static file server, e.g.:
```bash
npx serve .
```

4. Open the printed URL (e.g. `http://localhost:3000`) in your browser.

> Because this is a client-side-routed single page app, deep-linking directly to a route like `/complaints` requires your static file server to fall back to `index.html` for unknown paths. A `_redirects` file (Netlify's SPA fallback format) is included for that purpose.

## CORS Configuration

The backend's allowed origins are configured in `backend/app.js` (`corsOptions.origin`). If you serve the frontend from a different host/port than what's listed there, add it to that array so the browser doesn't block requests.

## Email Configuration

To enable email notifications via Brevo:

1. Create a [Brevo](https://www.brevo.com/) account and generate an API key
2. Add to backend `.env`:
```env
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_sender_email@example.com
```

Email notifications are optional — the app runs fine without them.

## API Routes

### Auth Routes
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `DELETE /auth/delete` - Delete account

### User Routes
- `GET /user/allComplaints` - Get all user complaints
- `GET /user/completedComplaints` - Get completed complaints
- `POST /user/regComplain` - Create complaint
- `GET /user/complaint/:ticketId` - Get complaint details
- `GET /user/profile` - Get profile
- `PUT /user/profile` - Update profile

### Review Routes
- `POST /review/review/:ticketId` - Add a review to a resolved complaint

### Agent Routes
- `GET /agent/allComplaints` - Get assigned complaints
- `GET /agent/complaint/:ticketId` - Get a single assigned complaint
- `PUT /agent/complaint/:ticketId/in-progress` - Mark as in progress
- `PUT /agent/complaint/:ticketId/resolve` - Mark as resolved

### Admin Routes
- `POST /admin/createAgent` - Create new agent
- `GET /admin/allAgents` - Get all agents
- `GET /admin/allUsers` - Get all users
- `GET /admin/allComplaints` - Get all complaints
- `GET /admin/unassignedComplaints` - Get unassigned complaints
- `GET /admin/allAgentByCategory/:ticketId` - Get agents matching a complaint's category
- `POST /admin/assignComplaint/:ticketId` - Assign a complaint to an agent

### Message Routes
- `GET /message/user/complaint/:ticketId/messages` - Get messages (user side)
- `POST /message/user/complaint/:ticketId/message` - Send a message (user side)
- `GET /message/agent/complaint/:ticketId/messages` - Get messages (agent side)
- `POST /message/agent/complaint/:ticketId/message` - Send a message (agent side)

## Database Models

### User Auth
- name, email, password, role, category, timestamps

### User Data
- name, email, userId, timestamps

### Complaint
- category, description, status, ticketId, userId, assignedTo, resolutionMessage, review, timestamps.

## Contributing

Feel free to submit issues and enhancement requests!

## Support

For issues or questions, please create an issue in the repository.
