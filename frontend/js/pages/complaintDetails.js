import { getComplaint, addReview } from '../api.js';
import { renderChatPortal } from '../components/chatPortal.js';
import { getAuth } from '../auth.js';
import { navigate } from '../router.js';
import { esc, statusClass, formatDateTime } from '../utils.js';

export async function renderComplaintDetails(container, params) {
  const { ticketId } = params;
  const { role: authRole } = getAuth();
  const role = authRole || 'user';

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">&#9203;</div>
        <p class="text-gray-600 text-lg">Loading complaint details...</p>
      </div>
    </div>
  `;

  let complaint = null;
  let error = null;

  try {
    const res = await getComplaint(ticketId);
    complaint = res.data.data;
  } catch (e) {
    error = 'Unable to fetch complaint details';
  }

  if (!complaint) {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div class="text-center">
          <p class="text-gray-700 text-xl font-semibold">Complaint not found</p>
        </div>
      </div>
    `;
    return;
  }

  let rating = 5;
  let comment = '';
  let result = 'Satisfied';
  let message = null;
  let reviewLoading = false;

  function renderPage() {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
        <div class="max-w-4xl mx-auto">
          <button id="back-btn" class="mb-8 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition hover:gap-3">
            <span>&larr;</span> Back to Complaints
          </button>

          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div class="flex justify-between items-start mb-8">
              <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">${esc(complaint.category)}</h1>
                <p class="text-gray-600 flex items-center gap-2">Ticket ID: <span class="font-mono bg-gray-100 px-3 py-1 rounded">${esc(
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
                <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">Attached Image</h3>
                <div class="relative group">
                  <img src="${esc(complaint.img)}" alt="complaint" class="max-w-md rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition" />
                </div>
              </div>
            `
                : ''
            }

            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-100">
              <h3 class="font-semibold text-gray-700 mb-4 flex items-center gap-2">Timeline</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex items-start gap-4">
                  <div>
                    <p class="text-sm text-gray-600">Registered on</p>
                    <p class="font-semibold text-gray-800">${esc(formatDateTime(complaint.createdAt))}</p>
                  </div>
                </div>
                ${
                  complaint.resolvedAt
                    ? `
                  <div class="flex items-start gap-4">
                    <div>
                      <p class="text-sm text-gray-600">Resolved on</p>
                      <p class="font-semibold text-gray-800">${esc(formatDateTime(complaint.resolvedAt))}</p>
                    </div>
                  </div>
                `
                    : ''
                }
              </div>
            </div>

            ${
              complaint.resolutionMessage
                ? `
              <div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-8 flex items-start gap-4">
                <div>
                  <h3 class="font-semibold text-green-900 mb-2">Resolution Message</h3>
                  <p class="text-green-800">${esc(complaint.resolutionMessage)}</p>
                </div>
              </div>
            `
                : ''
            }
          </div>

          <div id="chat-portal-container"></div>

          ${
            complaint.status === 'Resolved'
              ? `
            <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">Share Your Feedback</h2>
              <p class="text-gray-600 mb-6">Help us improve by rating your experience</p>

              <div id="review-alerts">
                ${
                  error
                    ? `<div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"><div><p class="font-semibold text-red-800">Error</p><p class="text-red-700">${esc(
                        error
                      )}</p></div></div>`
                    : ''
                }
                ${
                  message
                    ? `<div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3"><div><p class="font-semibold text-green-800">Success</p><p class="text-green-700">${esc(
                        message
                      )}</p></div></div>`
                    : ''
                }
              </div>

              <form id="review-form" class="space-y-6">
                <div class="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100">
                  <label class="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">Rating (1-5) *</label>
                  <div class="flex gap-3" id="rating-stars">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (num) =>
                          `<button type="button" data-rating="${num}" class="text-4xl transition-transform hover:scale-110 ${
                            rating >= num ? 'text-yellow-400' : 'text-gray-300'
                          }">&#9733;</button>`
                      )
                      .join('')}
                  </div>
                  <p class="text-sm text-gray-700 mt-3 font-medium">Your Rating: <span id="rating-value" class="text-yellow-600 text-lg">${rating}/5</span></p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Your Feedback *</label>
                  <textarea id="review-comment" rows="4" placeholder="Please share your experience with this complaint resolution..." class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800 resize-none">${esc(
                    comment
                  )}</textarea>
                  <p class="text-sm text-gray-600 mt-2" id="comment-count">${comment.length} characters</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Resolution Status *</label>
                  <select id="review-result" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800">
                    <option value="Satisfied" ${result === 'Satisfied' ? 'selected' : ''}>Satisfied - Issue resolved</option>
                    <option value="Not Satisfied" ${
                      result === 'Not Satisfied' ? 'selected' : ''
                    }>Not Satisfied - Issue not fully resolved</option>
                  </select>
                </div>

                <button type="submit" id="review-submit" class="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Submit Feedback
                </button>
              </form>
            </div>
          `
              : ''
          }

          ${
            complaint.status !== 'Resolved' && complaint.status !== 'Completed'
              ? `
            <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 flex items-start gap-4">
              <div>
                <p class="text-blue-900 font-semibold mb-2">Feedback Coming Soon</p>
                <p class="text-blue-800">Feedback will be available once your complaint status becomes <strong>Resolved</strong>.</p>
                <p class="text-blue-700 text-sm mt-2">Current Status: <strong class="text-lg">${esc(
                  complaint.status || 'Open'
                )}</strong></p>
              </div>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => navigate('/complaints'));

    if (complaint.status !== 'Completed' && complaint.status !== 'Open') {
      renderChatPortal(container.querySelector('#chat-portal-container'), { ticketId, userRole: role });
    }

    const reviewForm = container.querySelector('#review-form');
    if (reviewForm) {
      const starsEl = container.querySelector('#rating-stars');
      const ratingValueEl = container.querySelector('#rating-value');
      const commentEl = container.querySelector('#review-comment');
      const commentCountEl = container.querySelector('#comment-count');
      const resultEl = container.querySelector('#review-result');
      const submitBtn = container.querySelector('#review-submit');

      starsEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-rating]');
        if (!btn) return;
        rating = Number(btn.getAttribute('data-rating'));
        Array.from(starsEl.children).forEach((el, idx) => {
          el.classList.toggle('text-yellow-400', idx + 1 <= rating);
          el.classList.toggle('text-gray-300', idx + 1 > rating);
        });
        ratingValueEl.textContent = `${rating}/5`;
      });

      commentEl.addEventListener('input', (e) => {
        comment = e.target.value;
        commentCountEl.textContent = `${comment.length} characters`;
      });

      resultEl.addEventListener('change', (e) => {
        result = e.target.value;
      });

      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!comment.trim()) {
          error = 'Please provide a comment';
          renderPage();
          return;
        }

        reviewLoading = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        try {
          await addReview(ticketId, { rating: parseInt(rating), comment, result });
          message = 'Review submitted successfully!';
          error = null;
          renderPage();
          setTimeout(() => navigate('/complaints'), 1500);
        } catch (e2) {
          error = e2?.response?.data?.message || 'Failed to add review';
          renderPage();
        } finally {
          reviewLoading = false;
        }
      });
    }
  }

  renderPage();
}
