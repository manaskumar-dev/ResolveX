import { login } from '../auth.js';
import { navigate } from '../router.js';
import { esc } from '../utils.js';

export async function renderLogin(container) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-block bg-indigo-100 p-3 rounded-full mb-4">
            <span class="text-4xl">CMS</span>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">ComplaintMS</h1>
          <p class="text-gray-600">Streamlined complaint management</p>
        </div>

        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p class="text-gray-600 text-sm mt-1">Sign in to your account</p>
          </div>

          <div id="login-error"></div>

          <form id="login-form" class="space-y-5">
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input
                type="email"
                id="login-email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                id="login-password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              id="login-submit"
              class="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Login
            </button>
          </form>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-600">Don't have an account?</span>
            </div>
          </div>

          <a data-link href="/signup" class="w-full block text-center bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300">
            Create Account
          </a>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const emailInput = container.querySelector('#login-email');
  const passwordInput = container.querySelector('#login-password');
  const errorEl = container.querySelector('#login-error');
  const submitBtn = container.querySelector('#login-submit');

  function showError(msg) {
    errorEl.innerHTML = msg
      ? `<div class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3"><span class="text-sm font-medium">${esc(
          msg
        )}</span></div>`
      : '';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError(null);

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Email and password are required');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    try {
      const res = await login(email, password);
      if (res?.data?.token) {
        const role = res?.data?.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'agent') navigate('/agent/dashboard');
        else navigate('/complaints');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Login failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}
