# 更新日志

## 版本 1.1.0 (2026-02-19)

### 新增功能
✅ **注册功能** - 新增用户注册入口
  - 登录页面可以切换到注册模式
  - 用户需要先注册才能登录
  - 用户数据保存在 users.json 文件中

### 修改内容
✅ **端口修改** - 访问端口从 3000 改为 1314
  - 访问地址: http://192.168.5.170:1314

✅ **登录验证** - 必须使用已注册的用户名和密码才能登录
  - 未注册用户无法登录
  - 密码错误会提示
  - 退出后不保存登录信息

✅ **相机权限优化** - 改进手机访问相机功能
  - 添加详细的错误提示
  - 检测HTTPS连接（手机浏览器需要HTTPS才能访问相机）
  - 提供权限授予指导

### 功能测试

#### 注册测试
```bash
curl -X POST http://localhost:1314/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'
```

#### 登录测试
```bash
curl -X POST http://localhost:1314/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"1234"}'
```

### 相机功能说明

**重要**: 手机浏览器访问相机需要HTTPS连接

#### 解决方案：

**方案一：使用自签名证书（快速测试）**
```bash
# 生成证书
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# 修改 server.js 使用 HTTPS
```

**方案二：使用反向代理（推荐生产环境）**
```bash
# 安装 Nginx
sudo apt install nginx

# 配置 Let's Encrypt 证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

**方案三：临时测试**
- 在手机上首次访问时，忽略证书警告
- 或在桌面浏览器测试相机功能

### 文件结构
```
/tmp/chat-app/
├── server.js          # 后端服务器（新增注册接口）
├── users.json         # 用户数据文件（自动生成）
├── public/
│   ├── index.html     # 前端页面（新增注册切换）
│   ├── style.css      # 样式（新增注册样式）
│   └── app.js         # 前端逻辑（新增注册功能和相机优化）
└── uploads/           # 图片存储目录
```

### 管理命令

```bash
# 启动服务
/tmp/chat-app/start.sh start

# 停止服务
/tmp/chat-app/start.sh stop

# 重启服务
/tmp/chat-app/start.sh restart

# 查看状态
/tmp/chat-app/start.sh status

# 开机自启
sudo /tmp/chat-app/start.sh install
```

### 用户数据管理

#### 查看用户列表
```bash
cat /tmp/chat-app/users.json
```

#### 删除用户
```bash
# 编辑 users.json 文件，删除对应用户即可
nano /tmp/chat-app/users.json
```

#### 备份用户数据
```bash
cp /tmp/chat-app/users.json /tmp/chat-app/users.json.backup
```

### 访问地址
- **本地**: http://localhost:1314
- **局域网**: http://192.168.5.170:1314

### 注意事项
1. 相机功能在手机上需要 HTTPS 连接
2. 用户数据存储在文件中，重启服务不会丢失
3. 密码为明文存储，生产环境建议加密
4. 上传的图片存储在 uploads/ 目录
