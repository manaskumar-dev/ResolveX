import { createAgent, getAllAgents } from '../../api.js';
import { esc, CATEGORIES, formatDate } from '../../utils.js';

export async function renderAdminAgents(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">&#9203;</div>
        <p class="text-gray-600 text-lg">Loading agents...</p>
      </div>
    </div>
  `;

  let agents = [];
  let showForm = false;
  let formData = { name: '', email: '', password: '', category: CATEGORIES[0] };
  let error = null;
  let message = null;
  let creating = false;

  try {
    const res = await getAllAgents();
    agents = res.data.data || [];
  } catch (err) {
    error = err?.response?.data?.message || 'Failed to load agents';
  }

  function agentsTable() {
    if (agents.length === 0) {
      return `
        <div class="p-12 text-center">
          <p class="text-gray-700 text-lg font-semibold">No agents found</p>
          <p class="text-gray-600 mt-2">Create an agent to get started</p>
        </div>
      `;
    }
    return `
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
            </tr>
          </thead>
          <tbody>
            ${agents
              .map(
                (agent, index) => `
              <tr class="border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition">
                <td class="px-6 py-4"><div class="flex items-center gap-3"><p class="font-semibold text-gray-900">${esc(
                  agent.name
                )}</p></div></td>
                <td class="px-6 py-4 text-gray-700 break-all">${esc(agent.email)}</td>
                <td class="px-6 py-4"><span class="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">${esc(
                  agent.category || 'N/A'
                )}</span></td>
                <td class="px-6 py-4 text-gray-700">${esc(formatDate(agent.createdAt, { year: 'numeric', month: 'short', day: 'numeric' }))}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderPage() {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
        <div class="max-w-6xl mx-auto">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-4xl font-bold text-gray-800 flex items-center gap-3">Agents Management</h1>
              <p class="text-gray-600 mt-2">Create and manage support agents</p>
            </div>
            <button id="toggle-form-btn" class="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2">
              ${showForm ? 'Cancel' : 'Create Agent'}
            </button>
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

          ${
            showForm
              ? `
            <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">Create New Agent</h2>
              <form id="agent-form" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Name *</label>
                    <input type="text" id="agent-name" value="${esc(
                      formData.name
                    )}" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800" placeholder="Agent name" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Email *</label>
                    <input type="email" id="agent-email" value="${esc(
                      formData.email
                    )}" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800" placeholder="agent@example.com" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Password *</label>
                    <input type="password" id="agent-password" value="${esc(
                      formData.password
                    )}" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800" placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">Category *</label>
                    <select id="agent-category" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition bg-white text-gray-800">
                      ${CATEGORIES.map(
                        (cat) => `<option value="${esc(cat)}" ${cat === formData.category ? 'selected' : ''}>${esc(cat)}</option>`
                      ).join('')}
                    </select>
                  </div>
                </div>
                <button type="submit" id="agent-submit" class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Create Agent
                </button>
              </form>
            </div>
          `
              : ''
          }

          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            ${agentsTable()}
          </div>
        </div>
      </div>
    `;

    container.querySelector('#toggle-form-btn').addEventListener('click', () => {
      showForm = !showForm;
      renderPage();
    });

    const form = container.querySelector('#agent-form');
    if (form) {
      const nameInput = container.querySelector('#agent-name');
      const emailInput = container.querySelector('#agent-email');
      const passwordInput = container.querySelector('#agent-password');
      const categorySelect = container.querySelector('#agent-category');
      const submitBtn = container.querySelector('#agent-submit');

      nameInput.addEventListener('input', (e) => (formData.name = e.target.value));
      emailInput.addEventListener('input', (e) => (formData.email = e.target.value));
      passwordInput.addEventListener('input', (e) => (formData.password = e.target.value));
      categorySelect.addEventListener('change', (e) => (formData.category = e.target.value));

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        error = null;

        if (!formData.name || !formData.email || !formData.password) {
          error = 'All fields are required';
          renderPage();
          return;
        }
        if (formData.password.length < 6) {
          error = 'Password must be at least 6 characters';
          renderPage();
          return;
        }

        creating = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        try {
          const res = await createAgent(formData);
          message = 'Agent created successfully!';
          agents = [...agents, res.data.data];
          formData = { name: '', email: '', password: '', category: CATEGORIES[0] };
          showForm = false;
          renderPage();
          setTimeout(() => {
            message = null;
            renderPage();
          }, 3000);
        } catch (err) {
          error = err?.response?.data?.message || 'Failed to create agent';
          renderPage();
        } finally {
          creating = false;
        }
      });
    }
  }

  renderPage();
}
