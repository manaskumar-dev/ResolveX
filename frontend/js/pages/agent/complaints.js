import { getAgentComplaints } from '../../api.js';
import { navigate } from '../../router.js';
import { esc, statusClass, formatDate } from '../../utils.js';

const STATUSES = ['all', 'Open', 'In Progress', 'Resolved', 'Completed', 'Re-opened'];

export async function renderAgentComplaints(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">&#9203;</div>
        <p class="text-gray-600 text-lg">Loading complaints...</p>
      </div>
    </div>
  `;

  let complaints = [];
  let error = null;
  let filterStatus = 'all';

  try {
    const res = await getAgentComplaints();
    complaints = res.data.data || [];
  } catch (err) {
    error = 'Failed to load complaints';
  }

  function complaintCard(complaint) {
    return `
      <div data-open="${esc(complaint.ticketId)}" class="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all p-6 cursor-pointer">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">${esc(complaint.category)}</h3>
            <p class="text-gray-600 mt-2 leading-relaxed">${esc(complaint.desc.substring(0, 120))}...</p>
          </div>
          <span class="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${statusClass(
            complaint.status
          )}">${esc(complaint.status || 'Open')}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div><p class="text-xs font-semibold text-gray-600 uppercase">Ticket ID</p><p class="font-mono text-sm font-semibold text-gray-800">${esc(
              complaint.ticketId.substring(0, 12)
            )}...</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div><p class="text-xs font-semibold text-gray-600 uppercase">User</p><p class="font-semibold text-gray-800">${esc(
              complaint.userId?.name || 'N/A'
            )}</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div><p class="text-xs font-semibold text-gray-600 uppercase">Email</p><p class="text-sm text-gray-800 break-all">${esc(
              complaint.userId?.email || 'N/A'
            )}</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div><p class="text-xs font-semibold text-gray-600 uppercase">Created</p><p class="font-semibold text-gray-800">${esc(
              formatDate(complaint.createdAt, { month: 'short', day: 'numeric' })
            )}</p></div>
          </div>
        </div>

        <button data-open="${esc(complaint.ticketId)}" class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2">
          View Details
        </button>
      </div>
    `;
  }

  function renderPage() {
    const filteredComplaints = complaints.filter((c) => (filterStatus === 'all' ? true : c.status === filterStatus));

    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
        <div class="max-w-6xl mx-auto">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-800 flex items-center gap-3">My Assigned Complaints</h1>
            <p class="text-gray-600 mt-2">Manage all complaints assigned to you</p>
          </div>

          ${
            error
              ? `<div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"><p class="text-red-700 font-medium">${esc(
                  error
                )}</p></div>`
              : ''
          }

          <div class="mb-8 flex gap-3 flex-wrap" id="status-filters">
            ${STATUSES.map(
              (status) => `
              <button data-status="${esc(status)}" class="px-6 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }">
                ${status === 'all' ? 'All' : esc(status)}
              </button>
            `
            ).join('')}
          </div>

          <div class="space-y-4">
            ${
              filteredComplaints.length === 0
                ? `
              <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <p class="text-gray-700 text-lg font-semibold">No complaints found</p>
                <p class="text-gray-600 mt-2">There are no complaints for this filter</p>
              </div>
            `
                : filteredComplaints.map(complaintCard).join('')
            }
          </div>

          ${
            filteredComplaints.length > 0
              ? `
            <div class="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-6 flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Complaints Assigned</p>
                <p class="text-4xl font-bold text-indigo-600 mt-2">${filteredComplaints.length}</p>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;

    container.querySelector('#status-filters').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-status]');
      if (!btn) return;
      filterStatus = btn.getAttribute('data-status');
      renderPage();
    });

    container.querySelectorAll('[data-open]').forEach((el) => {
      el.addEventListener('click', () => navigate(`/agent/complaint/${el.getAttribute('data-open')}`));
    });
  }

  renderPage();
}
