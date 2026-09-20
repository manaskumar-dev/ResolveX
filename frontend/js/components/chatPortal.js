// ==========================================================================
// Chat Portal
//
// Vanilla-JS equivalent of components/ChatPortal.jsx. Renders into a given
// container and wires up its own event listeners. Usable from both the
// user complaint-details page and the agent complaint-detail page.
// ==========================================================================

import { getUserMessages, sendUserMessage, getAgentMessages, sendAgentMessage } from '../api.js';
import { esc } from '../utils.js';

export function renderChatPortal(container, { ticketId, userRole }) {
  const role = userRole || 'user';
  let messages = [];
  let loading = false;
  let error = null;

  container.innerHTML = `
    <div class="bg-white rounded-lg shadow-md p-6 mt-6">
      <h3 class="text-xl font-bold text-gray-800 mb-4">&#128172; Communication Portal</h3>
      <div id="chat-error"></div>
      <div id="chat-messages" class="bg-gray-50 rounded p-4 h-64 overflow-y-auto mb-4 border border-gray-200"></div>
      <form id="chat-form" class="flex gap-2">
        <input
          type="text"
          id="chat-input"
          placeholder="Type your message..."
          class="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Send</button>
      </form>
    </div>
  `;

  const errorEl = container.querySelector('#chat-error');
  const messagesEl = container.querySelector('#chat-messages');
  const form = container.querySelector('#chat-form');
  const input = container.querySelector('#chat-input');

  function renderError() {
    errorEl.innerHTML = error
      ? `<div class="bg-red-100 text-red-700 p-3 rounded mb-4">${esc(error)}</div>`
      : '';
  }

  function renderMessages() {
    if (loading) {
      messagesEl.innerHTML = `<p class="text-center text-gray-500">Loading messages...</p>`;
      return;
    }
    if (messages && messages.length > 0) {
      messagesEl.innerHTML = `
        <div class="space-y-3">
          ${messages
            .map((msg) => {
              const mine = msg.sender === role;
              return `
              <div class="flex ${mine ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs px-4 py-2 rounded-lg ${
                  mine ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-300 text-gray-800 rounded-bl-none'
                }">
                  <p class="text-sm">${esc(msg.message)}</p>
                  <p class="text-xs opacity-70 mt-1">${esc(new Date(msg.timestamp).toLocaleTimeString())}</p>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      `;
    } else {
      messagesEl.innerHTML = `<p class="text-center text-gray-500">No messages yet. Start a conversation!</p>`;
    }
  }

  async function fetchMessages() {
    try {
      loading = true;
      renderMessages();
      const res = role === 'user' ? await getUserMessages(ticketId) : await getAgentMessages(ticketId);
      messages = res.data.data || [];
      error = null;
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      if (err?.response?.status !== 404) {
        error = 'Failed to load messages';
      }
    } finally {
      loading = false;
      renderError();
      renderMessages();
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) {
      error = 'Message cannot be empty';
      renderError();
      return;
    }

    try {
      if (role === 'user') {
        await sendUserMessage(ticketId, { message: value });
      } else {
        await sendAgentMessage(ticketId, { message: value });
      }
      input.value = '';
      await fetchMessages();
    } catch (err) {
      error = err?.response?.data?.message || 'Failed to send message';
      renderError();
    }
  });

  if (ticketId) {
    fetchMessages();
  }
}
