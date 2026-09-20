import { signup } from '../auth.js';
import { navigate } from '../router.js';
import { esc } from '../utils.js';

export async function renderSignup(container) {
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
            <h2 class="text-2xl font-bold text-gray-900">Create Account</h2>
            <p class="text-gray-600 text-sm mt-1">Join us today to register complaints</p>
          </div>

          <div id="signup-error"></div>

          <form id="signup-form" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input type="text" id="signup-name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white" placeholder="John Doe" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input type="email" id="signup-email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white" placeholder="you@example.com" />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input type="password" id="signup-password" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white" placeholder="At least 6 characters" />
              <p class="text-xs text-gray-600 mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
              <input type="password" id="signup-confirm" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-gray-50 hover:bg-white" placeholder="Confirm your password" />
            </div>

            <button
              type="submit"
              id="signup-submit"
              class="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Create Account
            </button>
          </form>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-600">Already have an account?</span>
            </div>
          </div>

          <a data-link href="/login" class="w-full block text-center bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 transition border border-gray-300">
            Login Here
          </a>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#signup-form');
  const nameInput = container.querySelector('#signup-name');
  const emailInput = container.querySelector('#signup-email');
  const passwordInput = container.querySelector('#signup-password');
  const confirmInput = container.querySelector('#signup-confirm');
  const errorEl = container.querySelector('#signup-error');
  const submitBtn = container.querySelector('#signup-submit');

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

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (!name || !email || !password || !confirmPassword) {
      showError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    try {
      const res = await signup(name, email, password);
      if (res?.data?.message) {
        alert('Signup successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      showError(err?.response?.data?.message || 'Signup failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}
