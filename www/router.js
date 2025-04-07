// Simple router implementation
const routes = {
  '/login': 'www/login.html',
  '/chats': 'www/chat-list.html',
  '/chat': 'www/chat.html'
};

async function loadRoute(route) {
  const path = routes[route] || routes['/login'];
  const response = await fetch(path);
  const html = await response.text();
  document.getElementById('app').innerHTML = html;
  
  // Initialize any page-specific JS
  if (route === '/chat') initChat();
  if (route === '/chats') initChatList();
}

function initChat() {
  const input = document.querySelector('.message-input input');
  const sendBtn = document.querySelector('.message-input button');
  
  sendBtn.addEventListener('click', () => {
    if (input.value.trim()) {
      // Message sending logic will be handled by existing app.js
      input.value = '';
    }
  });
}

function initChatList() {
  const chatItems = document.querySelectorAll('.chat-item');
  chatItems.forEach(item => {
    item.addEventListener('click', () => {
      window.location.hash = '/chat';
    });
  });
}

// Handle initial route
window.addEventListener('load', () => {
  const initialRoute = window.location.hash.slice(1) || '/login';
  loadRoute(initialRoute);
});

// Handle route changes
window.addEventListener('hashchange', () => {
  const route = window.location.hash.slice(1);
  loadRoute(route);
});