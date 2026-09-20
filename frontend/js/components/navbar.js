// ==========================================================================
// NavBar
//
// Vanilla-JS equivalent of components/NavBar.jsx. Re-rendered on every
// route change and on every auth change so it always reflects the current
// user/role.
// ==========================================================================

import { getAuth, logout } from '../auth.js';
import { getAgentComplaints } from '../api.js';
import { navigate } from '../router.js';
import { esc, statusClass } from '../utils.js';

let dropdownOpen = false;
let quickComplaints = [];

function dashboardLink(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'agent':
      return '/agent/dashboard';
    default:
      return '/complaints';
  }
}

async function loadQuickComplaints() {
  try {
    const res = await getAgentComplaints();
    quickComplaints = (res.data.data || []).slice(0, 6);
  } catch (e) {
    // ignore, matches original silent failure
  }
}

function quickComplaintsMarkup() {
  if (quickComplaints.length === 0) {
    return `<div class="text-sm text-gray-500 text-center py-3">No assigned complaints</div>`;
  }
  return `
    <div class="space-y-2 max-h-64 overflow-y-auto">
      ${quickComplaints
        .map(
          (c) => `
        <button type="button" data-agent-quick-complaint="${esc(c.ticketId)}" class="w-full text-left p-3 hover:bg-indigo-50 rounded-lg transition border border-gray-200 hover:border-indigo-300">
          <div class="font-semibold text-gray-900">${esc(c.category)}</div>
          <div class="text-xs text-gray-600 mt-1">${esc(c.ticketId.substring(0, 8))}...</div>
          <div class="flex justify-between items-center mt-2">
            <span class="px-2 py-1 rounded text-xs font-medium ${statusClass(c.status)}">${esc(c.status)}</span>
          </div>
        </button>
      `
        )
        .join('')}
    </div>
  `;
}

export async function renderNavBar(container) {
  const { token, user } = getAuth();

  container.innerHTML = `
    <nav class="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <a data-link href="${token ? dashboardLink(user?.role) : '/login'}" class="font-bold text-xl text-gray-900 hover:text-indigo-600 transition flex items-center gap-2">
          <span>ComplaintMS</span>
        </a>
        <div class="flex items-center gap-6" id="navbar-links"></div>
      </div>
    </nav>
  `;

  const linksEl = container.querySelector('#navbar-links');

  if (!token) {
    linksEl.innerHTML = `
      <a data-link href="/login" class="text-gray-700 hover:text-indigo-600 transition font-medium">Login</a>
      <a data-link href="/signup" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">Sign Up</a>
    `;
    return;
  }

  let roleLinks = '';
  if (user?.role === 'user') {
    roleLinks = `
      <a data-link href="/complaints" class="text-gray-700 hover:text-indigo-600 transition font-medium">My Complaints</a>
      <a data-link href="/create" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium">+ Register</a>
    `;
  } else if (user?.role === 'admin') {
    roleLinks = `
      <a data-link href="/admin/dashboard" class="text-gray-700 hover:text-indigo-600 transition font-medium">Dashboard</a>
      <a data-link href="/admin/agents" class="text-gray-700 hover:text-indigo-600 transition font-medium">Agents</a>
      <a data-link href="/admin/complaints" class="text-gray-700 hover:text-indigo-600 transition font-medium">Complaints</a>
    `;
  } else if (user?.role === 'agent') {
    roleLinks = `
      <a data-link href="/agent/dashboard" class="text-gray-700 hover:text-indigo-600 transition font-medium">Dashboard</a>
      <div class="relative inline-block">
        <button type="button" id="agent-dropdown-btn" class="text-gray-700 hover:text-indigo-600 transition font-medium flex items-center gap-1">
          <span>Complaints</span>
          <span id="agent-dropdown-caret" class="transition-transform">&#9660;</span>
        </button>
        <div id="agent-dropdown-panel" class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 text-gray-800 p-4 border border-gray-200" style="display:none;">
          <div class="text-sm font-bold text-gray-900 mb-3">Assigned Complaints</div>
          <div id="agent-dropdown-list">${quickComplaintsMarkup()}</div>
          <div class="mt-3 text-center border-t pt-3">
            <a data-link href="/agent/complaints" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View all complaints &rarr;</a>
          </div>
        </div>
      </div>
    `;
  }

  const profileLink =
    user?.role === 'user'
      ? `<a data-link href="/profile" class="text-gray-700 hover:text-indigo-600 transition flex items-center gap-2 font-medium">
          <span class="text-lg">&#128100;</span>
          <span class="max-w-24 truncate">${esc(user?.name || 'Profile')}</span>
        </a>`
      : `<span class="text-gray-700 flex items-center gap-2 font-medium">
          <span class="text-lg">&#128100;</span>
          <span class="max-w-24 truncate">${esc(user?.name || 'User')}</span>
        </span>`;

  linksEl.innerHTML = `
    ${roleLinks}
    <div class="flex items-center gap-3 border-l border-gray-200 pl-6">
      ${profileLink}
      <button type="button" id="logout-btn" class="text-white bg-red-500 hover:bg-red-600 transition px-4 py-2 rounded-lg font-medium text-sm">Logout</button>
    </div>
  `;

  linksEl.querySelector('#logout-btn').addEventListener('click', () => {
    logout();
    navigate('/login');
  });

  if (user?.role === 'agent') {
    await loadQuickComplaints();
    const list = linksEl.querySelector('#agent-dropdown-list');
    if (list) list.innerHTML = quickComplaintsMarkup();

    const btn = linksEl.querySelector('#agent-dropdown-btn');
    const panel = linksEl.querySelector('#agent-dropdown-panel');
    const caret = linksEl.querySelector('#agent-dropdown-caret');

    const setOpen = (open) => {
      dropdownOpen = open;
      panel.style.display = open ? 'block' : 'none';
      caret.classList.toggle('rotate-180', open);
    };
    setOpen(dropdownOpen);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!dropdownOpen);
    });

    panel.addEventListener('click', (e) => {
      const quickBtn = e.target.closest('[data-agent-quick-complaint]');
      if (quickBtn) {
        setOpen(false);
        navigate(`/agent/complaint/${quickBtn.getAttribute('data-agent-quick-complaint')}`);
      }
    });

    document.addEventListener(
      'click',
      () => {
        if (dropdownOpen) setOpen(false);
      },
      { once: true }
    );
  }
}
