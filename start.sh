#!/bin/bash

CHAT_DIR="/tmp/chat-app"
HOST_IP="192.168.5.170"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║             聊天应用 - 手机专用版                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -f "$CHAT_DIR/cert.pem" ] || [ ! -f "$CHAT_DIR/key.pem" ]; then
  echo "📝 首次运行，正在生成SSL证书..."
  echo ""
  
  chmod +x "$CHAT_DIR/generate-cert.sh"
  bash "$CHAT_DIR/generate-cert.sh"
  
  echo ""
fi

echo "🛑 停止已有服务..."
pkill -f "node server.js" 2>/dev/null
sleep 1

echo "🚀 启动HTTPS服务器..."
cd "$CHAT_DIR"
node server.js

echo ""
echo "服务已停止"
