const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗',
  '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝',
  '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌',
  '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢',
  '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠',
  '🥳', '🥸', '😎', '🤓', '🧐', '😕', '😟', '🙁',
  '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨',
  '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞',
  '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
  '👍', '👎', '👏', '🙌', '🤝', '❤️', '💔', '💯',
  '🎉', '🎊', '🎁', '🏆', '⭐', '🔥', '✨', '💫',
  '🌞', '🌙', '⭐', '🌈', '🌸', '🌺', '🌹', '🌻'
];

let socket = null;
let currentUser = null;
let typingTimeout = null;
let isRegisterMode = false;
let mediaStream = null;

const loginPage = document.getElementById('login-page');
const chatPage = document.getElementById('chat-page');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginSuccess = document.getElementById('login-success');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const switchBtn = document.getElementById('switch-btn');
const switchText = document.getElementById('switch-text');
const messagesContainer = document.getElementById('messages-container');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const logoutBtn = document.getElementById('logout-btn');
const userCountSpan = document.getElementById('user-count');
const typingIndicator = document.getElementById('typing-indicator');
const typingText = document.getElementById('typing-text');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const emojiGrid = document.getElementById('emoji-grid');
const imageBtn = document.getElementById('image-btn');
const imageInput = document.getElementById('image-input');
const cameraBtn = document.getElementById('camera-btn');
const cameraModal = document.getElementById('camera-modal');
const cameraPreview = document.getElementById('camera-preview');
const cameraCanvas = document.getElementById('camera-canvas');
const captureBtn = document.getElementById('capture-btn');
const closeCameraBtn = document.getElementById('close-camera-btn');
const imagePreviewModal = document.getElementById('image-preview-modal');
const previewImage = document.getElementById('preview-image');
const closePreviewBtn = document.getElementById('close-preview-btn');
const adminBtn = document.getElementById('admin-btn');
const adminModal = document.getElementById('admin-modal');
const closeAdminBtn = document.getElementById('close-admin-btn');
const registrationSwitch = document.getElementById('registration-switch');
const historySwitch = document.getElementById('history-switch');
const clearMessagesBtn = document.getElementById('clear-messages-btn');

let isAdmin = false;
let currentSettings = {
  registrationOpen: true,
  showHistory: false
};

function updateTimeTheme() {
  const hour = new Date().getHours();
  const root = document.documentElement;
  
  if (hour >= 6 && hour < 12) {
    root.style.setProperty('--bg-primary', '#1a1a2e');
    root.style.setProperty('--bg-secondary', '#25253d');
    root.style.setProperty('--bg-tertiary', '#2d2d4a');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#a0a0b0');
    root.style.setProperty('--border-color', '#3d3d5c');
    root.style.setProperty('--primary-color', '#6366f1');
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)');
    root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #1a1a2e 0%, #25253d 100%)');
  } else if (hour >= 12 && hour < 18) {
    root.style.setProperty('--bg-primary', '#1e293b');
    root.style.setProperty('--bg-secondary', '#334155');
    root.style.setProperty('--bg-tertiary', '#475569');
    root.style.setProperty('--text-primary', '#f1f5f9');
    root.style.setProperty('--text-secondary', '#94a3b8');
    root.style.setProperty('--border-color', '#475569');
    root.style.setProperty('--primary-color', '#3b82f6');
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)');
    root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #1e293b 0%, #334155 100%)');
  } else if (hour >= 18 && hour < 22) {
    root.style.setProperty('--bg-primary', '#1a1625');
    root.style.setProperty('--bg-secondary', '#2d2640');
    root.style.setProperty('--bg-tertiary', '#3d3557');
    root.style.setProperty('--text-primary', '#f5f5f5');
    root.style.setProperty('--text-secondary', '#a0a0b0');
    root.style.setProperty('--border-color', '#4a4267');
    root.style.setProperty('--primary-color', '#8b5cf6');
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)');
    root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #1a1625 0%, #2d2640 100%)');
  } else {
    root.style.setProperty('--bg-primary', '#0f0f1a');
    root.style.setProperty('--bg-secondary', '#1a1a2e');
    root.style.setProperty('--bg-tertiary', '#25253d');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#a0a0b0');
    root.style.setProperty('--border-color', '#2d2d4a');
    root.style.setProperty('--primary-color', '#6366f1');
    root.style.setProperty('--gradient-primary', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)');
    root.style.setProperty('--gradient-secondary', 'linear-gradient(135deg, #1a1a2e 0%, #25253d 100%)');
  }
}

updateTimeTheme();
setInterval(updateTimeTheme, 60000);

function vibrate(duration = 10) {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
}

function initEmojiPicker() {
  emojiGrid.innerHTML = '';
  emojis.forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'emoji-item';
    span.textContent = emoji;
    span.addEventListener('click', () => {
      vibrate(5);
      messageInput.value += emoji;
      messageInput.focus();
      emojiPicker.classList.add('hidden');
    });
    emojiGrid.appendChild(span);
  });
}

switchBtn.addEventListener('click', () => {
  vibrate();
  isRegisterMode = !isRegisterMode;
  if (isRegisterMode) {
    submitText.textContent = '注册';
    switchText.textContent = '已有账号？';
    switchBtn.textContent = '登录';
    document.querySelector('.login-header p').textContent = '创建新账号';
  } else {
    submitText.textContent = '登录';
    switchText.textContent = '还没有账号？';
    switchBtn.textContent = '注册';
    document.querySelector('.login-header p').textContent = '登录后进入基地';
  }
  loginError.style.display = 'none';
  loginSuccess.style.display = 'none';
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  vibrate();
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  
  if (!username || !password) {
    showLoginError('请输入用户名和密码');
    return;
  }
  
  const endpoint = isRegisterMode ? '/api/register' : '/api/login';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      if (isRegisterMode) {
        showLoginSuccess(data.message);
        vibrate([50, 50, 50]);
        setTimeout(() => {
          isRegisterMode = false;
          switchBtn.click();
        }, 1500);
      } else {
        currentUser = { username };
        connectSocket();
        showChatPage();
        vibrate(100);
      }
    } else {
      showLoginError(data.message);
      vibrate(100);
    }
  } catch (error) {
    showLoginError('操作失败，请重试');
    vibrate(100);
  }
});

function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
  loginSuccess.style.display = 'none';
  setTimeout(() => {
    loginError.style.display = 'none';
  }, 3000);
}

function showLoginSuccess(message) {
  loginSuccess.textContent = message;
  loginSuccess.style.display = 'block';
  loginError.style.display = 'none';
  setTimeout(() => {
    loginSuccess.style.display = 'none';
  }, 3000);
}

function showChatPage() {
  loginPage.classList.add('hidden');
  chatPage.classList.remove('hidden');
  setTimeout(() => {
    messageInput.focus();
  }, 100);
}

function showLoginPage() {
  chatPage.classList.add('hidden');
  loginPage.classList.remove('hidden');
  usernameInput.value = '';
  passwordInput.value = '';
  loginError.style.display = 'none';
  loginSuccess.style.display = 'none';
  currentUser = null;
}

function connectSocket() {
  socket = io();
  
  socket.on('connect', () => {
    socket.emit('user_join', currentUser);
  });
  
  socket.on('message_history', (history) => {
    messagesDiv.innerHTML = '';
    history.forEach(msg => addMessage(msg));
    scrollToBottom();
  });
  
  socket.on('new_message', (message) => {
    addMessage(message);
    scrollToBottom();
    if (message.username !== currentUser?.username) {
      vibrate(20);
    }
  });
  
  socket.on('user_joined', (data) => {
    addSystemMessage(`${data.username} 加入了基地`);
    userCountSpan.textContent = data.userCount;
  });
  
  socket.on('user_left', (data) => {
    addSystemMessage(`${data.username} 离开了基地`);
    userCountSpan.textContent = data.userCount;
  });
  
  socket.on('user_count', (count) => {
    userCountSpan.textContent = count;
  });
  
  socket.on('user_typing', (data) => {
    if (data.isTyping) {
      typingText.textContent = `${data.username} 正在输入...`;
      typingIndicator.style.display = 'flex';
    } else {
      typingIndicator.style.display = 'none';
    }
  });

  socket.on('admin_status', (data) => {
    isAdmin = data.isAdmin;
    if (isAdmin) {
      adminBtn.classList.remove('hidden');
      loadAdminSettings();
    }
  });

  socket.on('messages_cleared', () => {
    messagesDiv.innerHTML = '';
    addSystemMessage('管理员清空了聊天记录');
  });
}

function addMessage(message) {
  const messageDiv = document.createElement('div');
  const isOwn = message.username === currentUser?.username;
  messageDiv.className = `message ${isOwn ? 'own' : ''}`;
  
  const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let content = '';
  if (message.type === 'image') {
    content = `<img src="${message.imageUrl}" alt="图片" onclick="previewImageFunc('${message.imageUrl}')">`;
  } else {
    content = escapeHtml(message.content);
  }
  
  const adminBadge = message.isAdmin ? '<span class="admin-badge">👑</span>' : '';
  
  messageDiv.innerHTML = `
    <div class="message-wrapper">
      <div class="message-avatar ${message.isAdmin ? 'admin' : ''}" style="background: ${message.color}">
        ${message.username[0].toUpperCase()}
      </div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-username" style="color: ${message.color}">${escapeHtml(message.username)}${adminBadge}</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-body">${content}</div>
      </div>
    </div>
  `;
  
  messagesDiv.appendChild(messageDiv);
}

function addSystemMessage(text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = `<div class="system-message">${text}</div>`;
  messagesDiv.appendChild(messageDiv);
  scrollToBottom();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendMessage() {
  const content = messageInput.value.trim();
  if (!content || !socket) return;
  
  vibrate();
  socket.emit('send_message', {
    content,
    type: 'text'
  });
  
  messageInput.value = '';
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

messageInput.addEventListener('input', () => {
  if (socket) {
    socket.emit('typing', true);
    
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('typing', false);
    }, 1000);
  }
});

logoutBtn.addEventListener('click', () => {
  vibrate();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  showLoginPage();
});

emojiBtn.addEventListener('click', () => {
  vibrate();
  emojiPicker.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
    emojiPicker.classList.add('hidden');
  }
});

imageBtn.addEventListener('click', () => {
  vibrate();
  imageInput.click();
});

imageInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  vibrate();
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      socket.emit('send_message', {
        content: '发送了一张图片',
        type: 'image',
        imageUrl: data.url
      });
    }
  } catch (error) {
    console.error('上传失败:', error);
  }
  
  imageInput.value = '';
});

cameraBtn.addEventListener('click', async () => {
  vibrate();
  
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  const isLAN = location.hostname.startsWith('192.168.') || location.hostname.startsWith('10.') || location.hostname.startsWith('172.');
  
  if (!isLocalhost && !isLAN) {
    alert('⚠️ 相机功能仅限局域网使用\n\n外网访问请使用"上传图片"功能');
    return;
  }
  
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('您的浏览器不支持相机功能');
      return;
    }
    
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });
    
    cameraPreview.srcObject = mediaStream;
    cameraModal.classList.remove('hidden');
    
  } catch (error) {
    console.error('相机访问错误:', error);
    
    let errorMsg = '无法访问相机\n\n';
    
    if (error.name === 'NotAllowedError') {
      errorMsg += '请在手机设置中授予相机权限';
    } else if (error.name === 'NotFoundError') {
      errorMsg += '未检测到相机设备';
    } else if (error.name === 'NotReadableError') {
      errorMsg += '相机被其他应用占用';
    } else {
      errorMsg += '错误: ' + error.message;
    }
    
    alert(errorMsg);
  }
});

closeCameraBtn.addEventListener('click', () => {
  vibrate();
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  cameraModal.classList.add('hidden');
});

captureBtn.addEventListener('click', () => {
  vibrate(50);
  
  const context = cameraCanvas.getContext('2d');
  cameraCanvas.width = cameraPreview.videoWidth;
  cameraCanvas.height = cameraPreview.videoHeight;
  context.drawImage(cameraPreview, 0, 0);
  
  cameraCanvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('image', blob, 'photo.jpg');
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        socket.emit('send_message', {
          content: '拍摄了一张照片',
          type: 'image',
          imageUrl: data.url
        });
      }
    } catch (error) {
      console.error('上传失败:', error);
    }
  }, 'image/jpeg', 0.9);
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  cameraModal.classList.add('hidden');
});

window.previewImageFunc = function(imageUrl) {
  vibrate();
  previewImage.src = imageUrl;
  imagePreviewModal.classList.remove('hidden');
};

closePreviewBtn.addEventListener('click', () => {
  vibrate();
  imagePreviewModal.classList.add('hidden');
});

imagePreviewModal.addEventListener('click', (e) => {
  if (e.target === imagePreviewModal) {
    imagePreviewModal.classList.add('hidden');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!cameraModal.classList.contains('hidden')) {
      closeCameraBtn.click();
    }
    if (!imagePreviewModal.classList.contains('hidden')) {
      imagePreviewModal.classList.add('hidden');
    }
    if (!emojiPicker.classList.contains('hidden')) {
      emojiPicker.classList.add('hidden');
    }
  }
});

initEmojiPicker();

document.addEventListener('touchmove', (e) => {
  if (e.target.closest('.messages-container') || e.target.closest('.emoji-picker')) {
    return;
  }
  e.preventDefault();
}, { passive: false });

// 管理员功能
async function loadAdminSettings() {
  try {
    const response = await fetch('/api/settings');
    currentSettings = await response.json();
    registrationSwitch.checked = currentSettings.registrationOpen;
    historySwitch.checked = currentSettings.showHistory;
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

async function saveAdminSettings() {
  if (!isAdmin) return;
  
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser.username,
        settings: currentSettings
      })
    });
    
    const data = await response.json();
    if (data.success) {
      // 设置已保存
    }
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

async function clearAllMessages() {
  if (!isAdmin) return;
  
  if (!confirm('确定要清空所有聊天记录吗？此操作不可恢复。')) {
    return;
  }
  
  try {
    const response = await fetch('/api/clear-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser.username })
    });
    
    const data = await response.json();
    if (data.success) {
      messagesDiv.innerHTML = '';
      addSystemMessage('管理员清空了聊天记录');
      adminModal.classList.add('hidden');
    }
  } catch (error) {
    console.error('清空消息失败:', error);
  }
}

// 管理按钮事件
adminBtn.addEventListener('click', () => {
  vibrate();
  adminModal.classList.remove('hidden');
});

closeAdminBtn.addEventListener('click', () => {
  vibrate();
  adminModal.classList.add('hidden');
});

registrationSwitch.addEventListener('change', (e) => {
  vibrate();
  currentSettings.registrationOpen = e.target.checked;
  saveAdminSettings();
});

historySwitch.addEventListener('change', (e) => {
  vibrate();
  currentSettings.showHistory = e.target.checked;
  saveAdminSettings();
});

clearMessagesBtn.addEventListener('click', () => {
  vibrate();
  clearAllMessages();
});

adminModal.addEventListener('click', (e) => {
  if (e.target === adminModal) {
    adminModal.classList.add('hidden');
  }
});
