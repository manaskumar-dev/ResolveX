# Complaint Management System (ComplaintMS)

A streamlined complaint management platform built with Node.js, Express, MongoDB, React, and Tailwind CSS.

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
- Nodemailer for email notifications
- Bcrypt for password hashing

**Frontend:**
- React with React Router
- Tailwind CSS for styling
- Axios for API requests
- Vite as build tool

## Project Structure

```
14. Complaint Management System/
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
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── context/        # React context (Auth)
    │   ├── pages/          # Page components
    │   ├── api.js          # API endpoints
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── package.json
    ├── vite.config.js
    └── .env.example        # Template for .env
```

## Installation & Setup

### Prerequisites
- Node.js
- MongoDB
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
FRONTEND_URL=http://localhost:5173

# Optional: Email notifications
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

5. Create admin user (one-time setup):
```bash
node createAdmin.js
```

6. Start backend server:
```bash
npm start
```

Server will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:8080
```

5. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Email Configuration

To enable email notifications:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password
3. Add to backend `.env`:
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

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

### Agent Routes
- `GET /agent/complaints` - Get assigned complaints
- `PUT /agent/complaint/:ticketId/in-progress` - Mark as in progress
- `PUT /agent/complaint/:ticketId/resolved` - Mark as resolved

### Admin Routes
- `POST /admin/createAgent` - Create new agent
- `GET /admin/agents` - Get all agents
- `GET /admin/users` - Get all users
- `GET /admin/complaints` - Get all complaints

## Database Models

### User Auth
- name, email, password, role, category, timestamps

### User Data
- name, email, userId, timestamps

### Complaint
- title, category, description, status, ticketId, userId, assignedTo, messages, resolutionMessage, timestamps

## Contributing

Feel free to submit issues and enhancement requests!

## Support

For issues or questions, please create an issue in the repository.