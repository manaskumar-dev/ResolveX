import { createComplaint } from '../api.js';
import { navigate } from '../router.js';
import { esc, CATEGORIES } from '../utils.js';

export async function renderCreateComplaint(container) {
  let category = CATEGORIES[0];
  let desc = '';
  let img = '';
  let error = null;
  let message = null;
  let loading = false;

  function renderPage() {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div class="mt-8 max-w-3xl mx-auto">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Register New Complaint</h1>
            <p class="text-gray-600">Tell us about the issue you're facing</p>
          </div>

          <div class="bg-white rounded-xl shadow-md border border-gray-100 p-8 space-y-6">
            <div id="cc-alerts">
              ${
                error
                  ? `<div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3"><span class="text-sm font-medium">${esc(
                      error
                    )}</span></div>`
                  : ''
              }
              ${
                message
                  ? `<div class="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-start gap-3"><span class="text-sm font-medium">${esc(
                      message
                    )}</span></div>`
                  : ''
              }
            </div>

            <form id="cc-form" class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">Category *</label>
                <select id="cc-category" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white">
                  ${CATEGORIES.map((cat) => `<option value="${esc(cat)}" ${cat === category ? 'selected' : ''}>${esc(cat)}</option>`).join('')}
                </select>
                <p class="text-xs text-gray-600 mt-2">Select the category that best describes your issue</p>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">Description *</label>
                <textarea id="cc-desc" rows="6" placeholder="Please describe your complaint in detail. Be specific about the issue, location, and any relevant details..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white resize-none">${esc(
                  desc
                )}</textarea>
                <div class="flex justify-between items-center mt-2">
                  <p class="text-xs text-gray-600">Minimum 10 characters required</p>
                  <p id="cc-desc-count" class="text-xs font-medium ${desc.length > 500 ? 'text-red-600' : 'text-gray-600'}">${desc.length} / 500</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-3">Image URL (optional)</label>
                <input type="url" id="cc-img" value="${esc(img)}" placeholder="https://example.com/image.jpg" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white" />
                <p class="text-xs text-gray-600 mt-2">Add an image to support your complaint (e.g., broken road, damaged property)</p>
              </div>

              <button type="submit" id="cc-submit" class="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                Register Complaint
              </button>
            </form>
          </div>

          <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="font-semibold text-blue-900 mb-2">Tips for better complaints:</h3>
            <ul class="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>Be specific about the location and time</li>
              <li>Describe the issue clearly with details</li>
              <li>Include relevant photos if possible</li>
              <li>Mention any safety concerns</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#cc-form');
    const categorySelect = container.querySelector('#cc-category');
    const descInput = container.querySelector('#cc-desc');
    const descCount = container.querySelector('#cc-desc-count');
    const imgInput = container.querySelector('#cc-img');
    const submitBtn = container.querySelector('#cc-submit');

    categorySelect.addEventListener('change', (e) => {
      category = e.target.value;
    });
    imgInput.addEventListener('input', (e) => {
      img = e.target.value;
    });
    descInput.addEventListener('input', (e) => {
      desc = e.target.value;
      descCount.textContent = `${desc.length} / 500`;
      descCount.className = `text-xs font-medium ${desc.length > 500 ? 'text-red-600' : 'text-gray-600'}`;
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error = null;

      if (!category || !desc.trim()) {
        error = 'Category and description are required';
        renderPage();
        return;
      }
      if (desc.trim().length < 10) {
        error = 'Description must be at least 10 characters';
        renderPage();
        return;
      }

      loading = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';
      try {
        await createComplaint({ category, desc, img });
        message = 'Complaint registered successfully!';
        renderPage();
        setTimeout(() => navigate('/complaints'), 1500);
      } catch (err) {
        error = err?.response?.data?.message || 'Failed to register complaint';
        renderPage();
      } finally {
        loading = false;
      }
    });
  }

  renderPage();
}
