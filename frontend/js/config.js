// ==========================================================================
// Application configuration
//
// The original React app read the backend URL from a Vite build-time env
// variable (import.meta.env.VITE_API_URL). Since this is now a plain
// static site with no build step, the equivalent runtime configuration
// point is `window.APP_CONFIG.API_BASE_URL`, set in index.html.
//
// Change the value in index.html (the small inline <script> at the top)
// to point at your backend deployment - nothing else needs to change.
// ==========================================================================

export const API_BASE_URL =
  (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || '';
