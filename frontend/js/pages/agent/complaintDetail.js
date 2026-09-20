import { getAgentComplaints, updateComplaintInProgress, updateComplaintResolved } from '../../api.js';
import { renderChatPortal } from '../../components/chatPortal.js';
import { getAuth } from '../../auth.js';
import { navigate } from '../../router.js';
import { esc, statusClass, formatDate } from '../../utils.js';

export async function renderComplaintDetailAgent(container, params) {
  const { ticketId } = params;
  const { role } = getAuth();

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">&#9203;</div>
        <p class="text-gray-600 text-lg">Loading complaint...</p>
      </div>
    </div>
  `;

  let complaint = null;
  let error = null;
  let message = null;
  let resolveMode = false;
  let resolutionMsg = '';
  let updatingStatus = false;
  let showChat = false;

  async function fetchComplaint() {
    try {
      const res = await getAgentComplaints();
      const found = (res.data.data || []).find((c) => c.ticketId === ticketId);
      if (found) {
        complaint = found;
        error = null;
      } else {
        error = 'Complaint not found';
      }
    } catch (err) {
      error = 'Failed to load complaint';
    }
  }

  await fetchComplaint();

  if (!complaint) {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-gray-700 text-xl font-semibold">${esc(error || 'Complaint not found')}</p>
        </div>
      </div>
    `;
    return;
  }

  function renderPage() {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
        <div class="max-w-5xl mx-auto">
          <button id="back-btn" class="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition hover:gap-3">
            <span>&larr;</span> Back to Complaints
          </button>

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

          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">${esc(complaint.category)}</h1>
                <p class="text-gray-600 flex items-center gap-2">Ticket: <span class="font-mono bg-gray-100 px-3 py-1 rounded">${esc(
                  complaint.ticketId
                )}</span></p>
              </div>
              <span class="px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap ${statusClass(
                complaint.status
              )}">${esc(complaint.status || 'Open')}</span>
            </div>

            <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 mb-8 border border-indigo-100">
              <h3 class="font-semibold text-gray-700 mb-3 flex items-center gap-2">Description</h3>
              <p class="text-gray-800 leading-relaxed">${esc(complaint.desc)}</p>
            </div>

            ${
              complaint.img
                ? `
              <div class="mb-8">
                <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">Attachment</h3>
                <img src="${esc(complaint.img)}" alt="complaint" class="max-w-md rounded-xl border-2 border-gray-200 shadow-lg" />
              </div>
            `
                : ''
            }

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">User Information</h3>
                <div class="space-y-3">
                  <div><p class="text-sm text-gray-600">Name</p><p class="font-semibold text-gray-800">${esc(
                    complaint.userId?.name || 'N/A'
                  )}</p></div>
                  <div><p class="text-sm text-gray-600">Email</p><p class="font-semibold text-gray-800 break-all">${esc(
                    complaint.userId?.email || 'N/A'
                  )}</p></div>
                </div>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">Timeline</h3>
                <div>
                  <p class="text-sm text-gray-600">Created on</p>
                  <p class="font-semibold text-gray-800">${esc(
                    formatDate(complaint.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })
                  )}</p>
                </div>
              </div>
            </div>

            ${
              complaint.resolutionMessage
                ? `
              <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 flex items-start gap-4">
                <div>
                  <h3 class="font-semibold text-green-900 mb-2">Resolution Message</h3>
                  <p class="text-green-800 mb-2">${esc(complaint.resolutionMessage)}</p>
                  <p class="text-sm text-green-700">Resolved on: ${esc(
                    formatDate(complaint.resolvedAt, { year: 'numeric', month: 'short', day: 'numeric' })
                  )}</p>
                </div>
              </div>
            `
                : ''
            }

            ${
              complaint.review
                ? `
              <div class="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
                <h3 class="font-semibold text-amber-900 mb-4 flex items-center gap-2">User Feedback & Review</h3>
                <div class="space-y-4">
                  <div>
                    <p class="text-sm text-amber-700 font-semibold mb-2">Rating</p>
                    <div class="flex gap-2 items-center">
                      <div class="flex gap-1">
                        ${[1, 2, 3, 4, 5]
                          .map(
                            (num) =>
                              `<span class="text-2xl ${
                                complaint.review.rating >= num ? 'text-yellow-400' : 'text-gray-300'
                              }">&#9733;</span>`
                          )
                          .join('')}
                      </div>
                      <span class="text-xl font-bold text-amber-700">${complaint.review.rating}/5</span>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-amber-700 font-semibold mb-2">Comment</p>
                    <p class="text-amber-900 bg-white rounded p-3 border border-amber-200">${esc(complaint.review.comment)}</p>
                  </div>
                  <div>
                    <p class="text-sm text-amber-700 font-semibold mb-2">Satisfaction Status</p>
                    <span class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                      complaint.review.result === 'Satisfied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }">${complaint.review.result === 'Satisfied' ? 'Satisfied' : 'Not Satisfied'}</span>
                  </div>
                </div>
              </div>
            `
                : ''
            }

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              ${
                complaint.status === 'Open' || complaint.status === 'Re-opened'
                  ? `<button id="start-progress-btn" class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">Start Progress</button>`
                  : ''
              }
              ${
                complaint.status === 'In Progress'
                  ? `<button id="mark-resolved-btn" class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2">Mark as Resolved</button>`
                  : ''
              }
              <button id="toggle-chat-btn" ${complaint.status === 'Completed' ? 'disabled' : ''} class="px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
      complaint.status === 'Completed'
        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
        : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg hover:from-purple-600 hover:to-purple-700'
    }">
                ${showChat ? 'Close Chat' : 'Open Chat'}
              </button>
            </div>

            ${
              resolveMode
                ? `
              <form id="resolve-form" class="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <h3 class="font-semibold text-lg text-green-900 mb-4 flex items-center gap-2">Mark Complaint as Resolved</h3>
                <div class="mb-4">
                  <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Resolution Message *</label>
                  <textarea id="resolution-msg" rows="5" placeholder="Describe how the issue was resolved..." class="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800 resize-none">${esc(
                    resolutionMsg
                  )}</textarea>
                  <p class="text-sm text-gray-600 mt-2" id="resolution-char-count">${resolutionMsg.length} characters</p>
                </div>
                <div class="flex gap-3">
                  <button type="submit" id="resolve-confirm-btn" class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">Confirm Resolve</button>
                  <button type="button" id="resolve-cancel-btn" class="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">Cancel</button>
                </div>
              </form>
            `
                : ''
            }

            ${
              showChat
                ? `
              <div class="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 class="font-semibold text-lg text-purple-900 mb-4 flex items-center gap-2">Chat with User</h3>
                <div id="agent-chat-container"></div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => navigate('/agent/complaints'));

    const startProgressBtn = container.querySelector('#start-progress-btn');
    if (startProgressBtn) {
      startProgressBtn.addEventListener('click', async () => {
        updatingStatus = true;
        startProgressBtn.disabled = true;
        startProgressBtn.textContent = 'Updating...';
        try {
          await updateComplaintInProgress(complaint.ticketId);
          message = 'Complaint status updated to In Progress';
          await fetchComplaint();
          renderPage();
          setTimeout(() => {
            message = null;
            renderPage();
          }, 3000);
        } catch (err) {
          error = err?.response?.data?.message || 'Failed to update status';
          renderPage();
        } finally {
          updatingStatus = false;
        }
      });
    }

    const markResolvedBtn = container.querySelector('#mark-resolved-btn');
    if (markResolvedBtn) {
      markResolvedBtn.addEventListener('click', () => {
        resolveMode = true;
        renderPage();
      });
    }

    const toggleChatBtn = container.querySelector('#toggle-chat-btn');
    if (toggleChatBtn) {
      toggleChatBtn.addEventListener('click', () => {
        showChat = !showChat;
        renderPage();
      });
    }

    const resolveForm = container.querySelector('#resolve-form');
    if (resolveForm) {
      const textarea = container.querySelector('#resolution-msg');
      const charCount = container.querySelector('#resolution-char-count');
      const cancelBtn = container.querySelector('#resolve-cancel-btn');
      const confirmBtn = container.querySelector('#resolve-confirm-btn');

      textarea.addEventListener('input', (e) => {
        resolutionMsg = e.target.value;
        charCount.textContent = `${resolutionMsg.length} characters`;
      });

      cancelBtn.addEventListener('click', () => {
        resolveMode = false;
        resolutionMsg = '';
        renderPage();
      });

      resolveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!resolutionMsg.trim()) {
          error = 'Please provide a resolution message';
          renderPage();
          return;
        }

        updatingStatus = true;
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Resolving...';
        try {
          await updateComplaintResolved(complaint.ticketId, { resolutionMsg });
          message = 'Complaint resolved successfully!';
          resolveMode = false;
          resolutionMsg = '';
          error = null;
          await fetchComplaint();
          renderPage();
          setTimeout(() => {
            message = null;
            renderPage();
          }, 3000);
        } catch (err) {
          error = err?.response?.data?.message || 'Failed to resolve complaint';
          renderPage();
        } finally {
          updatingStatus = false;
        }
      });
    }

    const chatContainer = container.querySelector('#agent-chat-container');
    if (chatContainer) {
      renderChatPortal(chatContainer, { ticketId: complaint.ticketId, userRole: role });
    }
  }

  renderPage();
}
