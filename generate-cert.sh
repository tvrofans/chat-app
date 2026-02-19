#!/bin/bash

HOST_IP="192.168.5.170"
CHAT_DIR="/tmp/chat-app"

echo "生成自签名SSL证书..."
echo ""

openssl req -x509 -newkey rsa:2048 \
  -keyout "$CHAT_DIR/key.pem" \
  -out "$CHAT_DIR/cert.pem" \
  -days 365 \
  -nodes \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=ChatApp/OU=Chat/CN=$HOST_IP" \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ SSL证书生成成功"
  echo ""
  echo "证书文件:"
  echo "  - $CHAT_DIR/key.pem"
  echo "  - $CHAT_DIR/cert.pem"
  echo ""
  echo "有效期: 365天"
else
  echo "❌ 证书生成失败"
  exit 1
fi
