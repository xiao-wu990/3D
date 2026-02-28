const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const QRCode = require('qrcode');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// 存储连接的客户端
const clients = new Map();
// 存储传输会话
const transfers = new Map();
// 存储接收端
const receivers = new Map();

// 文件上传配置
const uploadDir = process.env.REPL_ID ? '/tmp/uploads' : 'uploads/';
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024 // 10GB
  }
});

// 确保上传目录存在
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 获取本机局域网IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

// 静态文件服务
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// 生成二维码API
app.get('/api/qrcode', async (req, res) => {
  try {
    const connectionUrl = `http://${localIP}:${PORT}?role=receiver&token=${Date.now()}`;
    const qrCodeDataURL = await QRCode.toDataURL(connectionUrl, {
      width: 300,
      margin: 2
    });
    res.json({
      ip: localIP,
      port: PORT,
      connectionUrl,
      qrCode: qrCodeDataURL
    });
  } catch (error) {
    res.status(500).json({ error: '生成二维码失败' });
  }
});

// 文件上传API
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }

  const { receiverId, senderId } = req.body;
  const transferId = req.body.transferId || Date.now().toString();

  // 记录传输信息
  transfers.set(transferId, {
    file: req.file,
    senderId,
    receiverId,
    status: 'completed',
    timestamp: new Date().toISOString()
  });

  // 通知接收端
  const receiver = clients.get(receiverId);
  if (receiver && receiver.readyState === WebSocket.OPEN) {
    receiver.send(JSON.stringify({
      type: 'file_received',
      transferId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    }));
  }

  // 通知发送端传输完成
  const sender = clients.get(senderId);
  if (sender && sender.readyState === WebSocket.OPEN) {
    sender.send(JSON.stringify({
      type: 'file_sent',
      transferId,
      fileName: req.file.originalname,
      fileSize: req.file.size
    }));
  }

  res.json({
    success: true,
    transferId,
    fileName: req.file.originalname,
    fileSize: req.file.size
  });
});

// 下载文件API
app.get('/api/download/:transferId', (req, res) => {
  const transfer = transfers.get(req.params.transferId);
  if (!transfer || !transfer.file) {
    return res.status(404).json({ error: '文件不存在' });
  }

  res.download(transfer.file.path, transfer.file.originalname);
});

// 获取接收端列表API
app.get('/api/receivers', (req, res) => {
  console.log('📋 收到 /api/receivers 请求');
  console.log('📊 当前 receivers Map 大小:', receivers.size);

  const receiverList = [];
  receivers.forEach((info, id) => {
    receiverList.push({
      id,
      ...info,
      connected: info.connected || false
    });
    console.log(`  - 接收端: ${id}`);
  });

  console.log('📤 返回接收端列表:', receiverList.length, '个');
  res.json({ receivers: receiverList });
});

// 发送端请求连接
app.get('/api/connect/:receiverId', (req, res) => {
  const receiver = receivers.get(req.params.receiverId);
  if (!receiver) {
    return res.status(404).json({ error: '接收端不存在' });
  }

  res.json({ success: true, message: '正在请求连接' });
});

// WebSocket连接处理
wss.on('connection', (ws, req) => {
  const clientId = Date.now().toString();

  // 解析WebSocket连接的URL来获取role参数
  let role = 'sender';
  try {
    if (req.url) {
      const urlParts = req.url.split('?');
      if (urlParts.length > 1) {
        const searchParams = new URLSearchParams(urlParts[1]);
        role = searchParams.get('role') || 'sender';
      }
    }
  } catch (error) {
    console.error('解析URL参数失败:', error);
  }

  console.log(`🔍 WebSocket连接 - ID: ${clientId}, req.url: ${req.url}, 角色: ${role}`);

  clients.set(clientId, ws);

  // 如果是接收端，注册到receivers列表
  if (role === 'receiver') {
    receivers.set(clientId, {
      id: clientId,
      connectedAt: new Date().toISOString()
    });
    console.log('✅ 接收端已注册:', clientId, `当前接收端总数: ${receivers.size}`);
  } else {
    console.log('📤 发送端已连接:', clientId);
  }

  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    role,
    localIP,
    port: PORT
  }));

  console.log(`🌐 新客户端连接 - ID: ${clientId}, 角色: ${role}, 总客户端数: ${clients.size}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'connect_to_receiver':
          handleConnectToReceiver(ws, clientId, data);
          break;
        case 'accept_connection':
          handleAcceptConnection(ws, clientId, data);
          break;
        case 'ping':
          handlePing(ws, clientId, data);
          break;
      }
    } catch (error) {
      console.error('消息处理错误:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    receivers.delete(clientId);

    // 通知连接的另一方断开
    const peerId = clients.get(clientId + '_peer');
    if (peerId) {
      const peer = clients.get(peerId);
      if (peer && peer.readyState === WebSocket.OPEN) {
        peer.send(JSON.stringify({
          type: 'peer_disconnected',
          disconnectedId: clientId
        }));
      }
      clients.delete(clientId + '_peer');
      clients.delete(peerId + '_peer');
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket错误:', error);
  });
});

function handleConnectToSender(ws, clientId, data) {
  const receiver = clients.get(data.receiverId);
  if (receiver && receiver.readyState === WebSocket.OPEN) {
    receiver.send(JSON.stringify({
      type: 'connection_request',
      senderId: clientId
    }));
  }
}

function handleConnectToReceiver(ws, clientId, data) {
  console.log(`🔗 发送端 ${clientId} 请求连接到接收端 ${data.receiverId}`);

  const receiver = clients.get(data.receiverId);

  if (!receiver) {
    console.error(`❌ 接收端 ${data.receiverId} 不存在`);
    ws.send(JSON.stringify({
      type: 'connection_failed',
      reason: '接收端不存在'
    }));
    return;
  }

  if (receiver.readyState !== WebSocket.OPEN) {
    console.error(`❌ 接收端 ${data.receiverId} 未打开`);
    ws.send(JSON.stringify({
      type: 'connection_failed',
      reason: '接收端已断开连接'
    }));
    return;
  }

  // 发送连接请求给接收端
  try {
    receiver.send(JSON.stringify({
      type: 'connection_request',
      senderId: clientId
    }));
    console.log(`✅ 已向接收端 ${data.receiverId} 发送连接请求`);
  } catch (error) {
    console.error('❌ 发送连接请求失败:', error);
    ws.send(JSON.stringify({
      type: 'connection_failed',
      reason: '发送请求失败'
    }));
  }
}

function handleAcceptConnection(ws, clientId, data) {
  const senderId = data.senderId;
  console.log('处理接受连接，clientId:', clientId, 'senderId:', senderId);

  const sender = clients.get(senderId);
  const receiver = clients.get(clientId);

  if (sender && sender.readyState === WebSocket.OPEN && receiver && receiver.readyState === WebSocket.OPEN) {
    // 建立连接对
    clients.set(clientId + '_peer', senderId);
    clients.set(senderId + '_peer', clientId);

    console.log('建立连接对:', clientId, '↔', senderId);

    sender.send(JSON.stringify({
      type: 'connection_accepted',
      receiverId: clientId
    }));

    receiver.send(JSON.stringify({
      type: 'connection_established',
      senderId: senderId
    }));

    console.log('已发送连接确认消息');
  } else {
    console.error('无法建立连接 - sender存在:', !!sender, 'receiver存在:', !!receiver);
    if (receiver && receiver.readyState === WebSocket.OPEN) {
      receiver.send(JSON.stringify({
        type: 'connection_failed',
        reason: '发送端已断开连接'
      }));
    }
  }
}

function handlePing(ws, clientId, data) {
  const peerId = clients.get(clientId + '_peer');
  if (peerId) {
    const peer = clients.get(peerId);
    if (peer && peer.readyState === WebSocket.OPEN) {
      peer.send(JSON.stringify({
        type: 'ping',
        from: clientId
      }));
    }
  }
}

// 启动服务器
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 局域网文件传输服务已启动');
  console.log('='.repeat(50));
  console.log(`\n📌 访问地址：`);
  console.log(`   本地访问: http://localhost:${PORT}`);
  console.log(`   局域网访问: http://${localIP}:${PORT}`);
  console.log(`\n📱 接收端访问: http://${localIP}:${PORT}?role=receiver`);
  console.log(`\n💡 使用说明：`);
  console.log(`   1. 在浏览器打开接收端: http://${localIP}:${PORT}?role=receiver`);
  console.log(`   2. 在另一个浏览器标签页打开发送端: http://${localIP}:${PORT}`);
  console.log(`   3. 发送端点击"连接"，接收端点击"接受"`);
  console.log(`\n` + '='.repeat(50) + '\n');
});

module.exports = { app, server, wss };
