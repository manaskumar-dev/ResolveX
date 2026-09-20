// ==========================================================================
// Router
//
// A small client-side router using the History API, replacing
// react-router-dom's <BrowserRouter>/<Routes>/<Route>. Supports:
//   - static paths ("/complaints")
//   - dynamic params ("/complaint/:ticketId")
//   - query strings (accessible via getQueryParams())
//   - "protected" routes that require auth (and optionally a role),
//     mirroring the original <Protected> wrapper component.
//   - programmatic navigation via navigate(path)
//   - automatic interception of in-app links (<a data-link href="...">)
// ==========================================================================

import { getAuth } from './auth.js';

let routes = [];
let rootEl = null;
let notFoundRoute = null;
let onNavigate = null; // optional callback fired after every render (e.g. re-render navbar)

function matchRoute(pathname) {
  for (const route of routes) {
    const paramNames = [];
    const pattern = route.path.replace(/:[^/]+/g, (match) => {
      paramNames.push(match.slice(1));
      return '([^/]+)';
    });
    const regex = new RegExp(`^${pattern}$`);
    const match = pathname.match(regex);
    if (match) {
      const params = {};
      paramNames.forEach((name, idx) => {
        params[name] = decodeURIComponent(match[idx + 1]);
      });
      return { route, params };
    }
  }
  return null;
}

export function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    window.history.replaceState({}, '', path);
  } else {
    window.history.pushState({}, '', path);
  }
  render();
}

async function render() {
  const pathname = window.location.pathname;
  const matched = matchRoute(pathname);

  if (onNavigate) onNavigate();

  if (!matched) {
    if (notFoundRoute) {
      rootEl.innerHTML = '';
      await notFoundRoute(rootEl, {});
    }
    return;
  }

  const { route, params } = matched;

  if (route.redirect) {
    navigate(typeof route.redirect === 'function' ? route.redirect(params) : route.redirect, { replace: true });
    return;
  }

  if (route.protectedRoute) {
    const { token, role } = getAuth();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (route.role && role !== route.role) {
      navigate('/not-found', { replace: true });
      return;
    }
  }

  rootEl.innerHTML = '';
  await route.render(rootEl, params);
  window.scrollTo(0, 0);
}

export function initRouter({ root, routeTable, notFound, afterNavigate }) {
  rootEl = root;
  routes = routeTable;
  notFoundRoute = notFound;
  onNavigate = afterNavigate;

  // Intercept clicks on internal links so navigation doesn't reload the page.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link]');
    if (!link) return;
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    e.preventDefault();
    navigate(url.pathname + url.search);
  });

  window.addEventListener('popstate', render);

  render();
}

export { render as rerender };
