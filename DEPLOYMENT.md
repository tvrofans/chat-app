# 聊天应用部署指南

## 快速开始

### 当前状态
服务器已在运行中！

### 访问地址
- 本地访问: http://localhost:3000
- 局域网访问: http://192.168.5.170:3000

### 管理命令

```bash
# 查看状态
/tmp/chat-app/start.sh status

# 停止服务
/tmp/chat-app/start.sh stop

# 启动服务
/tmp/chat-app/start.sh start

# 重启服务
/tmp/chat-app/start.sh restart
```

## 开机自启动设置

### 方法一：使用系统服务（推荐）

```bash
# 安装为系统服务
sudo /tmp/chat-app/start.sh install

# 管理服务
sudo systemctl start chat-app    # 启动
sudo systemctl stop chat-app     # 停止
sudo systemctl status chat-app   # 查看状态
sudo systemctl restart chat-app  # 重启

# 查看日志
sudo journalctl -u chat-app -f
```

### 方法二：使用 crontab

```bash
crontab -e
# 添加以下行
@reboot /tmp/chat-app/start.sh start
```

## 生产环境建议

### 1. 移动到更合适的目录

```bash
sudo mv /tmp/chat-app /opt/chat-app
```

注意：修改服务文件中的路径

### 2. 配置防火墙

```bash
# 如果使用ufw
sudo ufw allow 3000/tcp

# 如果使用iptables
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save
```

### 3. 使用 Nginx 反向代理

创建 Nginx 配置文件:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 配置 HTTPS（使用 Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 故障排查

### 查看日志

```bash
# 如果使用系统服务
sudo journalctl -u chat-app -f

# 直接运行时的输出
# 查看终端输出
```

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   sudo lsof -i :3000
   # 或
   sudo netstat -tuln | grep 3000
   
   # 结束占用进程
   sudo kill -9 <PID>
   ```

2. **权限问题**
   ```bash
   # 给uploads目录写权限
   chmod 755 /tmp/chat-app/uploads
   ```

3. **Node.js 版本**
   ```bash
   node --version  # 建议 >= 14.0.0
   ```

## 性能优化

### 1. 限制消息历史记录
在 `server.js` 中已设置最多保留100条消息

### 2. 图片大小限制
在 `server.js` 中已设置最大10MB

### 3. 定期清理上传文件

```bash
# 添加定时任务清理7天前的图片
crontab -e
# 添加
0 2 * * * find /tmp/chat-app/uploads -mtime +7 -delete
```

## 备份

```bash
# 备份整个应用
tar -czf chat-app-backup.tar.gz /tmp/chat-app
```

## 更新应用

```bash
# 停止服务
/tmp/chat-app/start.sh stop

# 更新代码后重启
/tmp/chat-app/start.sh start
```
