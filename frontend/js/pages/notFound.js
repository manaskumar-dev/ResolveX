export async function renderNotFound(container) {
  container.innerHTML = `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div class="text-center">
        <div class="mb-8">
          <h1 class="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mb-4">404</h1>
        </div>

        <h2 class="text-4xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p class="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a data-link href="/" class="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 inline-flex items-center justify-center gap-2">
            Go Back Home
          </a>
          <button id="go-back-btn" class="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 inline-flex items-center justify-center gap-2">
            Go Back
          </button>
        </div>

        <div class="mt-16">
          <p class="text-gray-500 text-sm">Lost? Try one of these:</p>
          <div class="mt-4 space-y-2">
            <a data-link href="/complaints" class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block">View Complaints</a>
            <a data-link href="/create" class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block">Create Complaint</a>
            <a data-link href="/profile" class="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block">My Profile</a>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#go-back-btn').addEventListener('click', () => window.history.back());
}
