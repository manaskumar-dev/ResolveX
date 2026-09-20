import { getAllUsers, getAllAgents, getAllComplaints_admin } from '../../api.js';
import { esc } from '../../utils.js';

export async function renderAdminDashboard(container) {
  container.innerHTML = `<div class="mt-8 text-center">Loading dashboard...</div>`;

  let stats = { totalUsers: 0, totalAgents: 0, totalComplaints: 0 };
  let error = null;

  try {
    const [usersRes, agentsRes, complaintsRes] = await Promise.all([
      getAllUsers(),
      getAllAgents(),
      getAllComplaints_admin(),
    ]);
    stats = {
      totalUsers: usersRes.data.data?.length || 0,
      totalAgents: agentsRes.data.data?.length || 0,
      totalComplaints: complaintsRes.data.data?.length || 0,
    };
  } catch (err) {
    error = 'Failed to load statistics';
  }

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div class="mt-8">
        <div class="mb-10">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p class="text-gray-600">Manage your complaint system</p>
        </div>

        ${
          error
            ? `<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-start gap-3"><span>${esc(
                error
              )}</span></div>`
            : ''
        }

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-6">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                <p class="text-4xl font-bold text-gray-900">${stats.totalUsers}</p>
              </div>
            </div>
            <a data-link href="/admin/users" class="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">View Users <span>&rarr;</span></a>
          </div>

          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-6">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Total Agents</p>
                <p class="text-4xl font-bold text-gray-900">${stats.totalAgents}</p>
              </div>
            </div>
            <a data-link href="/admin/agents" class="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1">Manage Agents <span>&rarr;</span></a>
          </div>

          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-6">
              <div>
                <p class="text-gray-600 text-sm font-medium mb-1">Total Complaints</p>
                <p class="text-4xl font-bold text-gray-900">${stats.totalComplaints}</p>
              </div>
            </div>
            <a data-link href="/admin/complaints?filter=all" class="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">View Complaints <span>&rarr;</span></a>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a data-link href="/admin/agents" class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition font-semibold flex items-center justify-center gap-3 group">
              <span>Manage Agents</span>
            </a>
            <a data-link href="/admin/complaints" class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl hover:shadow-lg transition font-semibold flex items-center justify-center gap-3 group">
              <span>Assign Complaints</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}
