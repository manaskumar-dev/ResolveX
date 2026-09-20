import { updateProfile, deleteUser, getAllComplaints } from '../api.js';
import { getUser, logout, setUser } from '../auth.js';
import { navigate } from '../router.js';
import { esc, formatDate } from '../utils.js';

export async function renderProfile(container) {
  const user = getUser();

  if (user?.role !== 'user') {
    navigate('/not-found', { replace: true });
    return;
  }

  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
      <div class="text-center">
        <p class="text-gray-600 text-lg">Loading your profile...</p>
      </div>
    </div>
  `;

  let editing = false;
  let name = user?.name || '';
  let error = user && !user.name ? 'User information not available' : null;
  let message = null;
  let stats = { total: 0, open: 0, inProgress: 0, resolved: 0, completed: 0 };

  try {
    const res = await getAllComplaints();
    if (res.data.data) {
      const complaints = res.data.data;
      stats = {
        total: complaints.length,
        open: complaints.filter((c) => c.status === 'Open').length,
        inProgress: complaints.filter((c) => c.status === 'In Progress').length,
        resolved: complaints.filter((c) => c.status === 'Resolved').length,
        completed: complaints.filter((c) => c.status === 'Completed').length,
      };
    }
  } catch (err) {
    console.error('Failed to fetch complaint stats');
  }

  function renderPage() {
    container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-12">
        <div class="max-w-2xl mx-auto">
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-gray-800 flex items-center gap-3">My Profile</h1>
            <p class="text-gray-600 mt-2">Manage your account and view summary</p>
          </div>

          <div id="profile-alerts">
            ${
              error
                ? `<div class="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                    <div><p class="font-semibold text-red-800">Error</p><p class="text-red-700">${esc(error)}</p></div>
                  </div>`
                : ''
            }
            ${
              message
                ? `<div class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-start gap-3">
                    <div><p class="font-semibold text-green-800">Success</p><p class="text-green-700">${esc(
                      message
                    )}</p></div>
                  </div>`
                : ''
            }
          </div>

          ${
            user
              ? `
          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                  <div class="flex items-center gap-3 mb-3">
                    <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Name</label>
                  </div>
                  <div id="name-display">
                    ${
                      editing
                        ? `<input type="text" id="name-input" value="${esc(
                            name
                          )}" class="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-800" placeholder="Enter your name" />`
                        : `<p class="text-2xl font-semibold text-gray-800">${esc(user.name)}</p>`
                    }
                  </div>
                </div>

                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                  <div class="flex items-center gap-3 mb-3">
                    <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Email</label>
                  </div>
                  <p class="text-lg font-semibold text-gray-800 break-all">${esc(user?.email || 'N/A')}</p>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                  <div class="flex items-center gap-3 mb-3">
                    <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Member Since</label>
                  </div>
                  <p class="text-lg font-semibold text-gray-800">${esc(formatDate(user?.createdAt))}</p>
                </div>

                <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                  <div class="flex items-center gap-3 mb-3">
                    <label class="block text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Type</label>
                  </div>
                  <p class="text-lg font-semibold text-orange-600 capitalize">${esc(user.role || 'User')}</p>
                </div>
              </div>

              <div class="flex gap-4 flex-wrap" id="profile-actions">
                ${
                  editing
                    ? `
                    <button id="save-btn" class="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2">Save Changes</button>
                    <button id="cancel-btn" class="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">Cancel</button>
                  `
                    : `<button id="edit-btn" class="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2">Edit Profile</button>`
                }
                <button id="delete-btn" class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-2">Delete Account</button>
              </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-6">Complaint Summary</h2>
              <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div class="text-center">
                    <p class="text-3xl font-bold text-blue-600">${stats.total}</p>
                    <p class="text-sm text-gray-700 mt-2 font-medium">Total</p>
                  </div>
                </div>
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div class="text-center">
                    <p class="text-3xl font-bold text-yellow-600">${stats.open}</p>
                    <p class="text-sm text-gray-700 mt-2 font-medium">Open</p>
                  </div>
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div class="text-center">
                    <p class="text-3xl font-bold text-blue-600">${stats.inProgress}</p>
                    <p class="text-sm text-gray-700 mt-2 font-medium">In Progress</p>
                  </div>
                </div>
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div class="text-center">
                    <p class="text-3xl font-bold text-green-600">${stats.resolved}</p>
                    <p class="text-sm text-gray-700 mt-2 font-medium">Resolved</p>
                  </div>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div class="text-center">
                    <p class="text-3xl font-bold text-purple-600">${stats.completed}</p>
                    <p class="text-sm text-gray-700 mt-2 font-medium">Completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 flex items-start gap-3">
              <div>
                <p class="font-semibold text-blue-900 mb-1">Account Information</p>
                <p class="text-blue-800 text-sm">Your profile data is stored securely. You can update your name at any time, but your email cannot be changed.</p>
              </div>
            </div>
          </div>
          `
              : ''
          }
        </div>
      </div>
    `;

    wireEvents();
  }

  function wireEvents() {
    const editBtn = container.querySelector('#edit-btn');
    const saveBtn = container.querySelector('#save-btn');
    const cancelBtn = container.querySelector('#cancel-btn');
    const deleteBtn = container.querySelector('#delete-btn');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        editing = true;
        renderPage();
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        editing = false;
        name = user.name;
        renderPage();
      });
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const input = container.querySelector('#name-input');
        const newName = input.value;
        if (!newName.trim()) {
          error = 'Name cannot be empty';
          renderPage();
          return;
        }
        try {
          await updateProfile({ name: newName });
          message = 'Profile updated successfully!';
          name = newName;
          user.name = newName;
          setUser(user);
          editing = false;
          error = null;
          renderPage();
          setTimeout(() => {
            message = null;
            renderPage();
          }, 3000);
        } catch (err) {
          error = err?.response?.data?.message || 'Failed to update profile';
          renderPage();
        }
      });
    }
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
          try {
            await deleteUser();
            alert('Account deleted successfully');
            logout();
            navigate('/login');
          } catch (err) {
            error = err?.response?.data?.message || 'Failed to delete account';
            renderPage();
          }
        }
      });
    }
  }

  renderPage();
}
