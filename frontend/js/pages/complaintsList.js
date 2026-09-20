import { getAllComplaints, getCompletedComplaints } from '../api.js';
import { esc, statusClass, formatDateShort } from '../utils.js';

export async function renderComplaintsList(container) {
  container.innerHTML = `<div class="mt-8 text-center text-gray-600">Loading your complaints...</div>`;

  let activeComplaints = [];
  let completedComplaints = [];
  let error = null;
  let showCompleted = false;

  try {
    const res = await getAllComplaints();
    if (res.data.data) {
      activeComplaints = res.data.data.filter((c) => c.status !== 'Completed');
    } else {
      error = res.data.message;
    }

    try {
      const completedRes = await getCompletedComplaints();
      if (completedRes.data.data) {
        completedComplaints = completedRes.data.data;
      }
    } catch (err) {
      console.error('Unable to load completed complaints count');
    }
  } catch (e) {
    error = 'Unable to fetch complaints';
  }

  function complaintCard(complaint) {
    return `
      <a data-link href="/complaint/${esc(complaint.ticketId)}" class="block">
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition">
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <h3 class="font-bold text-lg text-gray-900 mb-1">${esc(complaint.category)}</h3>
              <p class="text-gray-600 text-sm line-clamp-2">${esc(complaint.desc)}</p>
            </div>
            <span class="ml-4 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusClass(
              complaint.status
            )}">${esc(complaint.status || 'Open')}</span>
          </div>

          <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p class="text-xs text-gray-600 mb-1">Ticket ID</p>
              <p class="text-sm font-mono text-gray-900 truncate">${esc(complaint.ticketId.substring(0, 12))}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600 mb-1">Created</p>
              <p class="text-sm text-gray-900">${esc(formatDateShort(complaint.createdAt))}</p>
            </div>
            <div class="text-right">
              <p class="text-indigo-600 font-semibold text-sm hover:text-indigo-700">View Details &rarr;</p>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  function renderPage() {
    const displayComplaints = showCompleted ? completedComplaints : activeComplaints;

    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div class="mt-8">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-4xl font-bold text-gray-900 mb-1">My Complaints</h1>
              <p class="text-gray-600">Track and manage your submitted complaints</p>
            </div>
            <a data-link href="/create" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center gap-2 group">New Complaint</a>
          </div>

          ${
            error
              ? `<div class="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200 flex items-start gap-3"><span>${esc(
                  error
                )}</span></div>`
              : ''
          }

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-1 inline-flex gap-1 mb-6">
            <button id="tab-active" class="px-6 py-2 rounded-lg font-semibold transition ${
              !showCompleted ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }">
              <span class="flex items-center gap-2">Active <span class="bg-opacity-20 bg-white px-2 py-1 rounded text-sm">(${
                activeComplaints.length
              })</span></span>
            </button>
            <button id="tab-completed" class="px-6 py-2 rounded-lg font-semibold transition ${
              showCompleted ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }">
              <span class="flex items-center gap-2">Completed <span class="bg-opacity-20 bg-white px-2 py-1 rounded text-sm">(${
                completedComplaints.length
              })</span></span>
            </button>
          </div>

          <div class="space-y-4">
            ${
              displayComplaints.length === 0
                ? `
              <div class="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
                <p class="text-gray-700 font-semibold mb-2">${
                  showCompleted ? 'No completed complaints' : 'No active complaints yet'
                }</p>
                <p class="text-gray-600 mb-6">${
                  showCompleted ? 'Your resolved complaints will appear here' : 'Create your first complaint to get started'
                }</p>
                ${
                  !showCompleted
                    ? `<a data-link href="/create" class="text-indigo-600 hover:text-indigo-700 font-medium">Create a complaint &rarr;</a>`
                    : ''
                }
              </div>
            `
                : displayComplaints.map(complaintCard).join('')
            }
          </div>
        </div>
      </div>
    `;

    container.querySelector('#tab-active').addEventListener('click', () => {
      showCompleted = false;
      renderPage();
    });
    container.querySelector('#tab-completed').addEventListener('click', () => {
      showCompleted = true;
      renderPage();
    });
  }

  renderPage();
}
