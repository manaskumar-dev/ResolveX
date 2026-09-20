import { getAllUsers } from '../../api.js';
import { esc, formatDate } from '../../utils.js';

export async function renderAdminUsers(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin text-4xl mb-4">&#9203;</div>
        <p class="text-gray-600 text-lg">Loading users...</p>
      </div>
    </div>
  `;

  let users = [];
  let error = null;
  let searchTerm = '';

  try {
    const res = await getAllUsers();
    users = res.data.data || [];
  } catch (err) {
    error = err?.response?.data?.message || 'Failed to load users';
  }

  function renderPage() {
    const filteredUsers = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8">
        <div class="max-w-6xl mx-auto">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-800 flex items-center gap-3 mb-4">Users Management</h1>
            <p class="text-gray-600">View and manage all registered users</p>
          </div>

          <div class="mb-8">
            <div class="relative">
              <input type="text" id="user-search" placeholder="Search by name or email..." value="${esc(
                searchTerm
              )}" class="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800" />
            </div>
          </div>

          ${
            error
              ? `<div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3"><p class="text-red-700 font-medium">${esc(
                  error
                )}</p></div>`
              : ''
          }

          <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            ${
              filteredUsers.length === 0
                ? `
              <div class="p-12 text-center">
                <p class="text-gray-700 text-lg font-semibold">${
                  searchTerm ? 'No users found matching your search' : 'No users found'
                }</p>
              </div>
            `
                : `
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                      <th class="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredUsers
                      .map(
                        (user, index) => `
                      <tr class="border-t border-gray-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-indigo-50 transition">
                        <td class="px-6 py-4"><div class="flex items-center gap-3"><p class="font-semibold text-gray-900">${esc(
                          user.name
                        )}</p></div></td>
                        <td class="px-6 py-4 text-gray-700 break-all">${esc(user.email)}</td>
                        <td class="px-6 py-4 text-gray-700">${esc(
                          formatDate(user.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })
                        )}</td>
                        <td class="px-6 py-4"><span class="bg-gradient-to-r from-green-100 to-green-50 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 flex items-center gap-2 w-fit">Active</span></td>
                      </tr>
                    `
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
            }
          </div>

          <div class="mt-8 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-6 flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Total Users</p>
              <p class="text-4xl font-bold text-indigo-600 mt-2">${filteredUsers.length}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#user-search').addEventListener('input', (e) => {
      searchTerm = e.target.value;
      const activeElement = document.activeElement;
      const selStart = e.target.selectionStart;
      renderPage();
      const newInput = container.querySelector('#user-search');
      newInput.focus();
      newInput.setSelectionRange(selStart, selStart);
    });
  }

  renderPage();
}
