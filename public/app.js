const socket = io();
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const emojiButton = document.getElementById('emojiButton');
const fileInput = document.getElementById('fileInput');
const attachButton = document.getElementById('attachButton');
const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const emailSubject = document.getElementById('emailSubject');
const emailMessage = document.getElementById('emailMessage');
const emailSendButton = document.getElementById('emailSendButton');

// Emoji picker
emojiButton.addEventListener('click', () => {
  const emojis = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '🤔', '👏'];
  const emojiContainer = document.createElement('div');
  emojiContainer.className = 'absolute bottom-12 bg-white shadow-lg rounded p-2 grid grid-cols-4 gap-1';
  
  emojis.forEach(emoji => {
    const btn = document.createElement('button');
    btn.textContent = emoji;
    btn.className = 'text-2xl hover:bg-gray-100 p-1 rounded';
    btn.addEventListener('click', () => {
      messageInput.value += emoji;
      messageInput.focus();
      emojiContainer.remove();
    });
    emojiContainer.appendChild(btn);
  });
  
  emojiButton.parentNode.appendChild(emojiContainer);
});

// File attachment
attachButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  if (fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        socket.emit('private message', {
          from: currentUser,
          to: 'general',
          text: `[Attachment: ${result.fileName}]`,
          attachment: result.filePath
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }
});

socket.on('private message', (msg) => {
  const messageElement = document.createElement('div');
  messageElement.className = 'mb-2 p-2 bg-gray-100 rounded';
  
  let content = `<div class="font-bold">${msg.from}</div>`;
  content += `<div class="break-words">${msg.text}</div>`;
  
  if (msg.attachment) {
    if (msg.attachment.match(/\.(jpg|jpeg|png|gif)$/i)) {
      content += `<img src="${msg.attachment}" class="mt-2 max-w-xs rounded">`;
    } else {
      content += `<div class="mt-2">
        <a href="${msg.attachment}" target="_blank" class="text-blue-500">Download Attachment</a>
      </div>`;
    }
  }
  
  content += `<div class="text-xs text-gray-500">${new Date(msg.timestamp).toLocaleTimeString()}</div>`;
  messageElement.innerHTML = content;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (text) {
    socket.emit('private message', {
      from: currentUser,
      to: 'general',
      text: text
    });
    messageInput.value = '';
  }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

emailForm.addEventListener('submit', sendEmail);