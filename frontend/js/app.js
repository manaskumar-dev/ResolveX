// ==========================================================================
// App bootstrap
//
// Vanilla-JS equivalent of App.jsx + main.jsx: defines the route table
// (mirroring the original <Routes>/<Route> tree and the <Protected>
// wrapper) and mounts the navbar + router into the page.
// ==========================================================================

import { initRouter } from './router.js';
import { renderNavBar } from './components/navbar.js';
import { onAuthChange } from './auth.js';

import { renderLogin } from './pages/login.js';
import { renderSignup } from './pages/signup.js';
import { renderProfile } from './pages/profile.js';
import { renderCreateComplaint } from './pages/createComplaint.js';
import { renderComplaintsList } from './pages/complaintsList.js';
import { renderComplaintDetails } from './pages/complaintDetails.js';
import { renderNotFound } from './pages/notFound.js';

import { renderAdminDashboard } from './pages/admin/dashboard.js';
import { renderAdminAgents } from './pages/admin/agents.js';
import { renderAdminUsers } from './pages/admin/users.js';
import { renderAdminComplaints } from './pages/admin/complaints.js';

import { renderAgentDashboard } from './pages/agent/dashboard.js';
import { renderAgentComplaints } from './pages/agent/complaints.js';
import { renderComplaintDetailAgent } from './pages/agent/complaintDetail.js';

const routeTable = [
  // Public routes
  { path: '/login', render: renderLogin },
  { path: '/signup', render: renderSignup },

  // User routes
  { path: '/complaints', render: renderComplaintsList, protectedRoute: true },
  { path: '/complaint/:ticketId', render: renderComplaintDetails, protectedRoute: true },
  { path: '/create', render: renderCreateComplaint, protectedRoute: true },
  { path: '/profile', render: renderProfile, protectedRoute: true, role: 'user' },

  // Admin routes
  { path: '/admin/dashboard', render: renderAdminDashboard, protectedRoute: true, role: 'admin' },
  { path: '/admin/agents', render: renderAdminAgents, protectedRoute: true, role: 'admin' },
  { path: '/admin/users', render: renderAdminUsers, protectedRoute: true, role: 'admin' },
  { path: '/admin/complaints', render: renderAdminComplaints, protectedRoute: true, role: 'admin' },

  // Agent routes
  { path: '/agent/dashboard', render: renderAgentDashboard, protectedRoute: true, role: 'agent' },
  { path: '/agent/complaints', render: renderAgentComplaints, protectedRoute: true, role: 'agent' },
  { path: '/agent/complaint/:ticketId', render: renderComplaintDetailAgent, protectedRoute: true, role: 'agent' },

  // Not found (explicit path, matches original <Route path="/not-found">'s target usage)
  { path: '/not-found', render: renderNotFound },

  // Default
  { path: '/', redirect: '/complaints' },
];

function mount() {
  const navbarRoot = document.getElementById('navbar-root');
  const appRoot = document.getElementById('app-root');

  const refreshNavbar = () => renderNavBar(navbarRoot);

  onAuthChange(refreshNavbar);
  refreshNavbar();

  initRouter({
    root: appRoot,
    routeTable,
    notFound: renderNotFound,
    afterNavigate: refreshNavbar,
  });
}

document.addEventListener('DOMContentLoaded', mount);
