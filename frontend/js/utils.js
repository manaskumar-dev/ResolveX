// ==========================================================================
// Shared helpers used across pages
// ==========================================================================

export const CATEGORIES = ['Electricity', 'Water', 'Gas', 'Road', 'Sewer'];

const STATUS_CLASS = {
  'Open': 'status-open',
  'In Progress': 'status-in-progress',
  'Resolved': 'status-resolved',
  'Completed': 'status-completed',
  'Re-opened': 'status-reopened',
};

export function statusClass(status) {
  return STATUS_CLASS[status] || 'status-default';
}

// Basic HTML-escaping for any user-supplied text interpolated into markup.
export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(dateStr, options) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', options || { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString();
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Tiny helper to wire up a <form> submit handler without inline HTML
// attributes (keeps CSP-friendliness and mirrors React's onSubmit).
export function onSubmit(form, handler) {
  form.addEventListener('submit', handler);
}

export function qs(root, selector) {
  return root.querySelector(selector);
}

export function qsa(root, selector) {
  return Array.from(root.querySelectorAll(selector));
}
