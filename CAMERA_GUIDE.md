# 相机功能使用指南

## 问题说明

手机浏览器访问相机需要 HTTPS 安全连接，这是浏览器的安全策略。

## 解决方案

### 方案一：使用 HTTPS 启动脚本（推荐）

```bash
/tmp/chat-app/start-https.sh
```

**访问地址**: https://192.168.5.170:1314

**首次访问步骤**:

#### iPhone Safari
1. 打开 Safari，输入 `https://192.168.5.170:1314`
2. 点击"显示详细信息"
3. 点击"访问此网站"
4. 输入锁屏密码确认
5. 授予相机权限

#### Android Chrome
1. 打开 Chrome，输入 `https://192.168.5.170:1314`
2. 点击"高级"
3. 点击"继续访问 192.168.5.170（不安全）"
4. 授予相机权限

### 方案二：切换回 HTTP

如果不需要相机功能，可以使用 HTTP：

```bash
/tmp/chat-app/start.sh restart
```

**访问地址**: http://192.168.5.170:1314

## 功能对比

| 功能 | HTTP | HTTPS |
|------|------|-------|
| 登录注册 | ✅ | ✅ |
| 聊天消息 | ✅ | ✅ |
| 表情发送 | ✅ | ✅ |
| 图片上传 | ✅ | ✅ |
| 相机拍照 | ❌ | ✅ |

## 管理命令

```bash
# 启动 HTTP 服务（端口 1314）
/tmp/chat-app/start.sh start

# 启动 HTTPS 服务（端口 1314）
/tmp/chat-app/start-https.sh

# 停止所有服务
/tmp/chat-app/start.sh stop

# 查看服务状态
/tmp/chat-app/start.sh status
```

## 常见问题

### 1. 证书警告

**原因**: 使用自签名证书，浏览器无法验证

**解决**: 点击"继续访问"或"高级" -> "继续"

### 2. 相机黑屏

**原因**: 未授予相机权限

**解决**: 
- iPhone: 设置 -> Safari -> 相机 -> 允许
- Android: 设置 -> 应用 -> Chrome -> 权限 -> 相机 -> 允许

### 3. HTTPS 无法访问

**原因**: 防火墙阻止

**解决**:
```bash
sudo ufw allow 1314/tcp
```

### 4. 想使用正式证书

**步骤**:
1. 购买域名
2. 配置域名解析到树莓派IP
3. 使用 Let's Encrypt 申请免费证书

```bash
# 安装 certbot
sudo apt install certbot

# 申请证书（需要域名）
sudo certbot certonly --standalone -d your-domain.com

# 复制证书
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /tmp/chat-app/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /tmp/chat-app/key.pem

# 启动 HTTPS 服务
/tmp/chat-app/start-https.sh
```

## 生产环境建议

1. 使用正式域名和 SSL 证书
2. 配置 Nginx 反向代理
3. 启用防火墙规则
4. 定期备份数据

## 技术说明

### 浏览器安全策略

现代浏览器要求以下 API 必须在安全上下文中使用：
- getUserMedia（相机/麦克风）
- Geolocation（地理位置）
- Service Workers
- Clipboard API

安全上下文包括：
- HTTPS 连接
- localhost
- 127.0.0.1

### 自签名证书

自签名证书特点：
- ✅ 快速部署
- ✅ 免费
- ✅ 功能完整
- ❌ 浏览器警告
- ❌ 需要手动信任

适用于：
- 内网测试
- 开发环境
- 个人使用

不适用于：
- 生产环境
- 公开服务
- 商业应用
