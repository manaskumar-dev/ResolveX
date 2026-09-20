import { getAgentComplaints } from '../../api.js';
import { navigate } from '../../router.js';
import { esc, statusClass, formatDateShort } from '../../utils.js';

export async function renderAgentDashboard(container) {
  container.innerHTML = `<div class="mt-8 text-center text-gray-600">Loading dashboard...</div>`;

  let stats = { open: 0, inProgress: 0, resolved: 0 };
  let complaints = [];
  let error = null;

  try {
    const res = await getAgentComplaints();
    complaints = res.data.data || [];
    stats = {
      open: complaints.filter((c) => c.status === 'Open').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
    };
  } catch (err) {
    error = 'Failed to load complaints';
  }

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div class="mt-8">
        <div class="mb-10">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Agent Dashboard</h1>
          <p class="text-gray-600">Manage and resolve assigned complaints</p>
        </div>

        ${
          error
            ? `<div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3"><span>${esc(
                error
              )}</span></div>`
            : ''
        }

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-6">
              <div><p class="text-gray-600 text-sm font-medium mb-1">Open Complaints</p><p class="text-4xl font-bold text-yellow-600">${
                stats.open
              }</p></div>
            </div>
            <p class="text-xs text-gray-600">Waiting for assignment</p>
          </div>

          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-6">
              <div><p class="text-gray-600 text-sm font-medium mb-1">In Progress</p><p class="text-4xl font-bold text-blue-600">${
                stats.inProgress
              }</p></div>
            </div>
            <p class="text-xs text-gray-600">Currently working on</p>
          </div>

          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-6">
              <div><p class="text-gray-600 text-sm font-medium mb-1">Resolved</p><p class="text-4xl font-bold text-green-600">${
                stats.resolved
              }</p></div>
            </div>
            <p class="text-xs text-gray-600">Completed resolutions</p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Your Assigned Complaints</h2>

          ${
            complaints.length === 0
              ? `
            <div class="text-center py-12">
              <p class="text-gray-700 font-semibold mb-2">No complaints assigned yet</p>
              <p class="text-gray-600">New complaints will appear here once assigned by admin</p>
            </div>
          `
              : `
            <div class="space-y-3">
              ${complaints
                .slice(0, 8)
                .map(
                  (complaint) => `
                <button data-goto="${esc(complaint.ticketId)}" class="w-full text-left bg-gradient-to-r from-gray-50 to-white hover:from-indigo-50 hover:to-indigo-50 p-5 rounded-lg border border-gray-200 hover:border-indigo-300 transition group">
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-1">
                      <h3 class="font-bold text-gray-900 group-hover:text-indigo-600 transition">${esc(
                        complaint.category
                      )}</h3>
                      <p class="text-sm text-gray-600 mt-1 line-clamp-1">${esc(complaint.desc)}</p>
                      <p class="text-xs text-gray-500 mt-2">Registered: ${esc(formatDateShort(complaint.createdAt))}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusClass(
                      complaint.status
                    )}">${esc(complaint.status || 'Open')}</span>
                  </div>
                </button>
              `
                )
                .join('')}
              ${
                complaints.length > 8
                  ? `<button id="view-all-btn" class="w-full text-center text-indigo-600 hover:text-indigo-700 font-semibold py-3 mt-4">View all ${complaints.length} complaints &rarr;</button>`
                  : ''
              }
            </div>
          `
          }
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-goto]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(`/agent/complaint/${btn.getAttribute('data-goto')}`));
  });
  const viewAllBtn = container.querySelector('#view-all-btn');
  if (viewAllBtn) viewAllBtn.addEventListener('click', () => navigate('/agent/complaints'));
}
