import {
  getUnassignedComplaints,
  getAllComplaints_admin,
  getAgentsByCategory,
  assignComplaint,
  getAllAgents,
} from '../../api.js';
import { getQueryParams } from '../../router.js';
import { esc, statusClass, formatDate } from '../../utils.js';

export async function renderAdminComplaints(container) {
  const showOnlyUnassigned = getQueryParams().get('filter') !== 'all';

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
  let message = null;
  let selectedComplaint = null;
  let selectedAgent = '';
  let assigningComplaint = null;
  let categoryAgents = [];

  async function fetchComplaints() {
    try {
      const res = showOnlyUnassigned ? await getUnassignedComplaints() : await getAllComplaints_admin();
      complaints = res.data.data || [];
      error = null;
    } catch (err) {
      error = 'Failed to load complaints';
    }
  }

  async function fetchAgents() {
    try {
      await getAllAgents();
    } catch (err) {
      console.error('Failed to load agents');
    }
  }

  await fetchComplaints();
  await fetchAgents();

  function complaintCard(complaint) {
    return `
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all p-6">
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
            <div><p class="text-xs font-semibold text-gray-600 uppercase">Registered</p><p class="font-semibold text-gray-800">${esc(
              formatDate(complaint.createdAt, { month: 'short', day: 'numeric' })
            )}</p></div>
          </div>
        </div>

        ${
          complaint.assignedTo
            ? `
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 flex items-start gap-4">
            <div>
              <p class="text-sm font-semibold text-gray-700">Assigned to</p>
              <p class="font-bold text-green-700 text-lg">${esc(complaint.assignedTo?.name || 'Agent')}</p>
              <p class="text-sm text-green-600">${esc(complaint.assignedTo?.email || '')}</p>
            </div>
          </div>
        `
            : complaint.status === 'Open' || complaint.status === 'Re-opened'
            ? `
          <button data-assign="${esc(complaint._id)}" class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2">
            Assign to Agent
          </button>
        `
            : ''
        }
      </div>
    `;
  }

  function modalMarkup() {
    if (!selectedComplaint) return '';
    return `
      <div id="assign-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 class="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">Assign Complaint</h2>
          <p class="text-gray-600 mb-6">Assigning complaint to an agent in the <strong class="text-indigo-600">${esc(
            selectedComplaint.category
          )}</strong> category.</p>

          <form id="assign-form" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Select Agent *</label>
              <select id="assign-agent-select" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800">
                <option value="">-- Choose an agent --</option>
                ${
                  categoryAgents.length > 0
                    ? categoryAgents
                        .map((agent) => `<option value="${esc(agent._id)}">${esc(agent.name)} (${esc(agent.email)})</option>`)
                        .join('')
                    : `<option disabled>No agents available for this category</option>`
                }
              </select>
              ${
                categoryAgents.length === 0
                  ? `<p class="text-xs text-red-600 mt-2 flex items-center gap-2">No agents assigned to this category</p>`
                  : ''
              }
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" id="assign-submit-btn" ${
                assigningComplaint === selectedComplaint._id || !selectedAgent ? 'disabled' : ''
              } class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                ${assigningComplaint === selectedComplaint._id ? 'Assigning...' : 'Assign'}
              </button>
              <button type="button" id="assign-cancel-btn" class="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  function renderPage() {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
        <div class="max-w-6xl mx-auto">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-800 flex items-center gap-3">${
              showOnlyUnassigned ? 'Complaints to Assign' : 'All Complaints'
            }</h1>
            <p class="text-gray-600 mt-2">${
              showOnlyUnassigned ? 'Manage unassigned complaints' : 'View all system complaints'
            }</p>
          </div>

          ${
            error
              ? `<div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"><p class="text-red-700 font-medium">${esc(
                  error
                )}</p></div>`
              : ''
          }
          ${
            message
              ? `<div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3"><p class="text-green-700 font-medium">${esc(
                  message
                )}</p></div>`
              : ''
          }

          <div class="space-y-4">
            ${
              complaints.length === 0
                ? `
              <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <p class="text-gray-700 text-lg font-semibold">${
                  showOnlyUnassigned ? '&#10003; All complaints have been assigned!' : 'No complaints found'
                }</p>
                <p class="text-gray-600 mt-2">There are no complaints to display at this time.</p>
              </div>
            `
                : complaints.map(complaintCard).join('')
            }
          </div>
        </div>
      </div>

      ${modalMarkup()}
    `;

    container.querySelectorAll('[data-assign]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const complaint = complaints.find((c) => c._id === btn.getAttribute('data-assign'));
        selectedComplaint = complaint;
        try {
          const res = await getAgentsByCategory(complaint.ticketId);
          categoryAgents = res.data.data || [];
        } catch (err) {
          categoryAgents = [];
        }
        renderPage();
      });
    });

    const modal = container.querySelector('#assign-modal');
    if (modal) {
      const form = container.querySelector('#assign-form');
      const select = container.querySelector('#assign-agent-select');
      const cancelBtn = container.querySelector('#assign-cancel-btn');

      select.addEventListener('change', (e) => {
        selectedAgent = e.target.value;
        renderPage();
      });

      cancelBtn.addEventListener('click', () => {
        selectedComplaint = null;
        selectedAgent = '';
        renderPage();
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedAgent) {
          error = 'Please select an agent';
          renderPage();
          return;
        }

        assigningComplaint = selectedComplaint._id;
        renderPage();
        try {
          await assignComplaint(selectedComplaint.ticketId, { agentId: selectedAgent });
          message = 'Complaint assigned successfully!';
          selectedComplaint = null;
          selectedAgent = '';
          await fetchComplaints();
          renderPage();
          setTimeout(() => {
            message = null;
            renderPage();
          }, 3000);
        } catch (err) {
          error = err?.response?.data?.message || 'Failed to assign complaint';
          renderPage();
        } finally {
          assigningComplaint = null;
        }
      });
    }
  }

  renderPage();
}
