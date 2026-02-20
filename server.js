const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 1314;
const USERS_FILE = path.join(__dirname, 'users.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

const users = new Map();
const messages = [];

// 默认设置
const defaultSettings = {
  registrationOpen: true,
  showHistory: false
};

function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载用户数据失败:', error);
  }
  return {};
}

function saveUsers(usersData) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
  } catch (error) {
    console.error('保存用户数据失败:', error);
  }
}

function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
  return { ...defaultSettings };
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('保存设置失败:', error);
  }
}

function isAdmin(username) {
  const usersData = loadUsers();
  const userKeys = Object.keys(usersData);
  if (userKeys.length === 0) return false;
  // 第一个注册的用户是管理员
  return userKeys[0] === username;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只允许上传图片文件'));
  }
});

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 获取设置
app.get('/api/settings', (req, res) => {
  const settings = loadSettings();
  res.json(settings);
});

// 获取管理员状态
app.post('/api/admin-status', (req, res) => {
  const { username } = req.body;
  res.json({
    isAdmin: isAdmin(username),
    settings: loadSettings()
  });
});

// 更新设置（仅管理员）
app.post('/api/settings', (req, res) => {
  const { username, settings } = req.body;
  
  if (!isAdmin(username)) {
    return res.status(403).json({ success: false, message: '只有管理员可以修改设置' });
  }
  
  saveSettings(settings);
  res.json({ success: true, message: '设置已更新' });
});

// 清空聊天记录（仅管理员）
app.post('/api/clear-messages', (req, res) => {
  const { username } = req.body;
  
  if (!isAdmin(username)) {
    return res.status(403).json({ success: false, message: '只有管理员可以清空记录' });
  }
  
  messages.length = 0;
  io.emit('messages_cleared');
  res.json({ success: true, message: '聊天记录已清空' });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const settings = loadSettings();
  
  // 检查注册是否开放
  if (!settings.registrationOpen) {
    const usersData = loadUsers();
    if (Object.keys(usersData).length > 0) {
      return res.status(403).json({ success: false, message: '注册已关闭，请联系管理员' });
    }
  }
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }
  
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ success: false, message: '用户名长度应为2-20个字符' });
  }
  
  if (password.length < 4) {
    return res.status(400).json({ success: false, message: '密码长度至少为4个字符' });
  }
  
  const usersData = loadUsers();
  
  if (usersData[username]) {
    return res.status(400).json({ success: false, message: '用户名已存在' });
  }
  
  const isFirstUser = Object.keys(usersData).length === 0;
  
  usersData[username] = {
    password: password,
    isAdmin: isFirstUser,
    createdAt: new Date().toISOString()
  };
  
  saveUsers(usersData);
  
  if (isFirstUser) {
    res.json({ success: true, message: '注册成功！你是基地的第一个用户，已成为管理员' });
  } else {
    res.json({ success: true, message: '注册成功，请登录' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
  }
  
  const usersData = loadUsers();
  
  if (!usersData[username]) {
    return res.status(400).json({ success: false, message: '用户名不存在，请先注册' });
  }
  
  if (usersData[username].password !== password) {
    return res.status(400).json({ success: false, message: '密码错误' });
  }
  
  res.json({ 
    success: true, 
    message: '登录成功',
    isAdmin: isAdmin(username)
  });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有上传文件' });
  }
  
  res.json({
    success: true,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.on('user_join', (userData) => {
    const isUserAdmin = isAdmin(userData.username);
    const settings = loadSettings();
    
    users.set(socket.id, {
      id: socket.id,
      username: userData.username,
      isAdmin: isUserAdmin,
      color: getRandomColor(),
      joinTime: new Date()
    });
    
    socket.broadcast.emit('user_joined', {
      username: userData.username,
      userCount: users.size
    });
    
    // 根据设置决定是否发送历史消息
    if (settings.showHistory) {
      socket.emit('message_history', messages.slice(-50));
    }
    
    socket.emit('admin_status', { isAdmin: isUserAdmin });
    
    io.emit('user_count', users.size);
  });
  
  socket.on('send_message', (data) => {
    const user = users.get(socket.id);
    if (!user) return;
    
    const message = {
      id: Date.now(),
      username: user.username,
      isAdmin: user.isAdmin,
      color: user.color,
      content: data.content,
      type: data.type || 'text',
      imageUrl: data.imageUrl,
      timestamp: new Date()
    };
    
    messages.push(message);
    if (messages.length > 100) {
      messages.shift();
    }
    
    io.emit('new_message', message);
  });
  
  socket.on('typing', (isTyping) => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_typing', {
        username: user.username,
        isTyping: isTyping
      });
    }
  });
  
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      socket.broadcast.emit('user_left', {
        username: user.username,
        userCount: users.size - 1
      });
      users.delete(socket.id);
      io.emit('user_count', users.size);
    }
    console.log('用户断开连接:', socket.id);
  });
});

function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#FF6F61'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

server.listen(PORT, '0.0.0.0', () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    基地已启动                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('📱 局域网访问:');
  console.log(`   http://${localIP}:${PORT}`);
  console.log('');
  console.log('🌐 DDNS访问:');
  console.log(`   http://<你的域名>:${PORT}`);
  console.log('');
  console.log('✨ 功能说明:');
  console.log('   ✓ 用户注册和登录');
  console.log('   ✓ 实时消息');
  console.log('   ✓ 发送表情');
  console.log('   ✓ 上传图片');
  console.log('   ✓ 相机拍照（局域网内支持）');
  console.log('   ✓ 管理员功能');
  console.log('');
});
