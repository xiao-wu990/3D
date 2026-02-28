// 全局状态
let currentRole = null;
let ws = null;
let clientId = null;
let peerId = null;
let localIP = null;
let myId = null;

// 页面加载时检查URL参数
window.addEventListener('DOMContentLoaded', () => {
  console.log('页面已加载');
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');
  console.log('URL参数 role:', role);
  if (role) {
    selectRole(role);
  }
});

// 选择角色
function selectRole(role) {
  console.log('选择角色:', role);
  currentRole = role;
  hideAllScreens();

  if (role === 'sender') {
    showScreen('sender-connect-screen');
    connectWebSocket('sender');
  } else if (role === 'receiver') {
    showScreen('receiver-connect-screen');
    connectWebSocket('receiver');
    loadQRCode();
    fetchLocalIP();
  }
}

// 连接WebSocket
function connectWebSocket(role = 'sender') {
  console.log('连接WebSocket，角色:', role);

  // 构建WebSocket URL，带上role参数
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${window.location.host}/?role=${role}`;
  console.log('🔗 WebSocket URL:', wsUrl);

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ WebSocket已连接');
      showNotification('已连接到服务器', 'success');

      // 如果是发送端，连接成功后加载接收端列表
      if (role === 'sender') {
        setTimeout(() => {
          loadReceiversList();
        }, 500);
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 收到消息:', data);
        handleMessage(data);
      } catch (error) {
        console.error('消息解析错误:', error);
      }
    };

    ws.onclose = () => {
      console.log('❌ WebSocket已断开');
      showNotification('服务器连接已断开', 'error');
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket错误:', error);
      showNotification('连接服务器失败', 'error');
    };
  } catch (error) {
    console.error('连接错误:', error);
    showNotification('无法连接到服务器', 'error');
  }
}

// 处理WebSocket消息
function handleMessage(data) {
  switch (data.type) {
    case 'connected':
      clientId = data.clientId;
      myId = data.clientId;
      localIP = data.localIP;
      console.log('🎉 我的ID:', clientId);

      if (currentRole === 'receiver') {
        console.log('我是接收端，等待发送端连接...');
      }
      break;

    case 'connection_request':
      console.log('🔔 收到连接请求，发送端ID:', data.senderId);
      handleConnectionRequest(data.senderId);
      break;

    case 'connection_accepted':
    case 'connection_established':
      peerId = data.senderId || data.receiverId;
      console.log('✅ 连接成功！对方ID:', peerId);
      showNotification('连接成功！', 'success');

      // 跳转到传输界面
      setTimeout(() => {
        if (currentRole === 'receiver') {
          showScreen('receiver-transfer-screen');
          initFileUpload('receiver');
        } else {
          showScreen('sender-transfer-screen');
          initFileUpload('sender');
        }
      }, 500);
      break;

    case 'connection_failed':
      console.error('❌ 连接失败:', data.reason);
      showNotification('连接失败: ' + data.reason, 'error');
      break;

    case 'file_received':
      console.log('📥 收到文件:', data.fileName);
      handleFileReceived(data);
      break;

    case 'file_sent':
      console.log('✅ 文件发送成功:', data.fileName);
      showNotification('文件发送成功: ' + data.fileName, 'success');
      break;

    case 'peer_disconnected':
      console.log('👋 对方已断开连接');
      showNotification('对方已断开连接', 'error');
      goBack();
      break;
  }
}

// 处理连接请求
let pendingSenderId = null;

function handleConnectionRequest(senderId) {
  console.log('🔔 收到连接请求，发送端ID:', senderId);
  console.log('📋 设置 pendingSenderId:', senderId);
  pendingSenderId = senderId;

  const requestDiv = document.getElementById('connection-request');
  if (requestDiv) {
    requestDiv.classList.remove('hidden');
    console.log('✅ 连接请求对话框已显示');
  } else {
    console.error('❌ 找不到连接请求元素');
  }

  // 10秒后自动隐藏
  setTimeout(() => {
    if (pendingSenderId === senderId) {
      console.log('⏱️ 连接请求超时');
      pendingSenderId = null;
      if (requestDiv && !requestDiv.classList.contains('hidden')) {
        requestDiv.classList.add('hidden');
        showNotification('连接请求已超时', 'warning');
      }
    }
  }, 10000);
}

// 接受连接
function acceptConnection() {
  console.log('🤝 准备接受连接');
  console.log('📋 当前 pendingSenderId:', pendingSenderId);

  if (!ws) {
    console.error('❌ WebSocket未连接');
    showNotification('连接错误，请刷新页面', 'error');
    return;
  }

  if (!pendingSenderId) {
    console.error('❌ 没有待处理的连接请求');
    console.error('💡 可能的原因：连接请求已超时或已处理');
    showNotification('连接错误：没有待处理的请求', 'error');
    // 隐藏对话框
    const requestDiv = document.getElementById('connection-request');
    if (requestDiv) {
      requestDiv.classList.add('hidden');
    }
    return;
  }

  console.log('✅ 开始接受连接，发送端ID:', pendingSenderId);

  try {
    const message = {
      type: 'accept_connection',
      senderId: pendingSenderId
    };
    console.log('📤 发送消息:', message);

    ws.send(JSON.stringify(message));
    console.log('✅ 已发送接受连接消息');
    showNotification('✅ 正在建立连接...', 'success');

    // 不要立即清空pendingSenderId，等待连接建立
    console.log('⏳ 等待连接建立...');
  } catch (error) {
    console.error('❌ 发送消息失败:', error);
    showNotification('❌ 连接失败', 'error');
    pendingSenderId = null;
  }

  // 隐藏对话框
  const requestDiv = document.getElementById('connection-request');
  if (requestDiv) {
    requestDiv.classList.add('hidden');
  }
}

// 拒绝连接
function rejectConnection() {
  console.log('🚫 拒绝连接');
  console.log('📋 清空 pendingSenderId:', pendingSenderId);
  pendingSenderId = null;
  const requestDiv = document.getElementById('connection-request');
  if (requestDiv) {
    requestDiv.classList.add('hidden');
  }
  showNotification('已拒绝连接请求', 'error');
}

// 加载接收端列表
async function loadReceiversList() {
  console.log('🔍 开始加载接收端列表...');
  const listContainer = document.getElementById('receivers-list');

  if (!listContainer) {
    console.error('❌ 找不到receivers-list元素');
    return;
  }

  listContainer.innerHTML = '<div class="loading">⏳ 正在搜索接收端...</div>';

  try {
    console.log('📡 请求 /api/receivers...');
    const response = await fetch('/api/receivers');
    console.log('📥 响应状态:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 接收端列表数据:', data);

    if (data.receivers && data.receivers.length > 0) {
      console.log(`✅ 找到 ${data.receivers.length} 个接收端`);
      listContainer.innerHTML = '';

      data.receivers.forEach((receiver, index) => {
        const item = document.createElement('div');
        item.className = 'receiver-item';
        item.innerHTML = `
          <div class="receiver-info">
            <div class="receiver-icon">📥</div>
            <div>
              <div class="receiver-name">接收端 ${index + 1}</div>
              <div class="receiver-id">ID: ${receiver.id.slice(-6)}</div>
            </div>
          </div>
          <button class="receiver-connect-btn" onclick="connectToReceiver('${receiver.id}')">
            🔗 连接
          </button>
        `;
        listContainer.appendChild(item);
        console.log(`  - 接收端 ${index + 1}: ${receiver.id}`);
      });
    } else {
      listContainer.innerHTML = `
        <div class="no-receivers">
          <div>❌ 暂无可用接收端</div>
          <div class="help-text-small">请确保接收端已启动并访问: http://localhost:3000?role=receiver</div>
        </div>
      `;
      console.log('⚠️ 没有找到接收端');
      console.log('💡 提示：请先在另一个标签页打开接收端: http://localhost:3000?role=receiver');
    }
  } catch (error) {
    console.error('❌ 获取接收端列表失败:', error);
    listContainer.innerHTML = `
      <div class="no-receivers">
        <div>❌ 获取接收端列表失败</div>
        <div class="error-text">${error.message}</div>
      </div>
    `;
  }
}

// 连接到接收端
function connectToReceiver(receiverId) {
  console.log('🔗 请求连接到接收端:', receiverId);

  if (!ws) {
    showNotification('请先连接服务器', 'error');
    connectWebSocket('sender');
    setTimeout(() => connectToReceiver(receiverId), 1000);
    return;
  }

  if (ws.readyState !== WebSocket.OPEN) {
    showNotification('正在连接服务器...', 'warning');
    setTimeout(() => connectToReceiver(receiverId), 1000);
    return;
  }

  try {
    const message = {
      type: 'connect_to_receiver',
      receiverId: receiverId
    };
    console.log('📤 发送消息:', message);
    ws.send(JSON.stringify(message));
    console.log('✅ 已发送连接请求');
    showNotification('已发送连接请求，等待对方接受...', 'success');
  } catch (error) {
    console.error('❌ 发送连接请求失败:', error);
    showNotification('发送请求失败', 'error');
  }
}

// 加载二维码
async function loadQRCode() {
  console.log('加载二维码...');
  const qrContainer = document.getElementById('qrcode');

  if (!qrContainer) {
    console.error('找不到qrcode元素');
    return;
  }

  try {
    const response = await fetch('/api/qrcode');
    const data = await response.json();
    qrContainer.innerHTML = `<img src="${data.qrCode}" alt="连接二维码" />`;
    console.log('✅ 二维码加载成功');
  } catch (error) {
    console.error('❌ 加载二维码失败:', error);
    qrContainer.innerHTML = '<div class="qr-loading">❌ 加载失败</div>';
  }
}

// 获取本地IP
async function fetchLocalIP() {
  console.log('获取本地IP...');
  try {
    const response = await fetch('/api/qrcode');
    const data = await response.json();
    const ipElement = document.getElementById('local-ip');
    if (ipElement) {
      ipElement.textContent = `${data.ip}:${data.port}`;
      console.log('✅ 本地IP:', `${data.ip}:${data.port}`);
    }
  } catch (error) {
    console.error('❌ 获取IP失败:', error);
  }
}

// 复制IP地址
function copyIP() {
  const ipText = document.getElementById('local-ip').textContent;
  navigator.clipboard.writeText(ipText).then(() => {
    showNotification('✅ IP地址已复制', 'success');
  }).catch(() => {
    showNotification('❌ 复制失败', 'error');
  });
}

// 显示二维码扫描提示
function showQRScannerHint() {
  document.getElementById('qr-hint-dialog').classList.remove('hidden');
}

// 关闭二维码扫描提示
function closeQRHint() {
  document.getElementById('qr-hint-dialog').classList.add('hidden');
}

// 显示接收端列表区域
function showReceiversSection() {
  document.getElementById('receivers-section').classList.remove('hidden');
}

// 打开IP输入对话框
function openIPInput() {
  closeQRHint();
  document.getElementById('ip-input-dialog').classList.remove('hidden');
}

// 关闭IP输入对话框
function closeIPInput() {
  document.getElementById('ip-input-dialog').classList.add('hidden');
  document.getElementById('ip-address').value = '';
}

// 通过IP地址连接
function connectToIP() {
  const ipInput = document.getElementById('ip-address').value.trim();
  if (!ipInput) {
    showNotification('请输入IP地址', 'error');
    return;
  }

  closeIPInput();
  showNotification('请先在浏览器打开接收端页面，然后刷新此页面', 'warning');

  // 提示用户
  alert(`请在浏览器中打开：\n\nhttp://${ipInput}?role=receiver\n\n然后在发送端页面点击刷新`);
}

// 修改loadReceiversList，显示接收端列表区域
const originalLoadReceiversList = loadReceiversList;
loadReceiversList = function() {
  showReceiversSection();
  originalLoadReceiversList();
};

// 初始化文件上传
function initFileUpload(role) {
  console.log('初始化文件上传，角色:', role);
  const uploadArea = document.getElementById(role + '-upload-area');
  const fileInput = document.getElementById(role + '-file-input');

  if (!uploadArea || !fileInput) {
    console.error('找不到上传元素');
    return;
  }

  // 点击上传区域
  uploadArea.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
      fileInput.click();
    }
  });

  // 文件选择
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => uploadFile(file, role));
  });

  // 拖拽上传
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => uploadFile(file, role));
  });

  console.log('✅ 文件上传初始化完成');
}

// 上传文件
async function uploadFile(file, role) {
  console.log('📤 开始上传文件:', file.name);

  if (!peerId) {
    showNotification('❌ 未连接到对方', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('senderId', clientId);
  formData.append('receiverId', peerId);
  formData.append('transferId', Date.now().toString());

  addTransferToList(file, 'uploading', role);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      updateTransferStatus(file.name, 'completed', role);
      console.log('✅ 文件上传成功:', result);
    } else {
      throw new Error('上传失败');
    }
  } catch (error) {
    console.error('❌ 上传错误:', error);
    updateTransferStatus(file.name, 'failed', role);
    showNotification('❌ 文件发送失败', 'error');
  }
}

// 添加到传输列表
function addTransferToList(file, status, role) {
  const transferList = document.getElementById(role + '-transfers');
  if (!transferList) return;

  const item = document.createElement('div');
  item.className = 'transfer-item';
  item.id = `transfer-${file.name.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const icon = getFileIcon(file.name);
  const size = formatFileSize(file.size);

  item.innerHTML = `
    <div class="file-icon">${icon}</div>
    <div class="file-info">
      <div class="file-name">${file.name}</div>
      <div class="file-size">${size}</div>
    </div>
    <div class="file-status ${status}">${getStatusLabel(status)}</div>
  `;

  transferList.appendChild(item);
}

// 更新传输状态
function updateTransferStatus(fileName, status, role) {
  const item = document.getElementById(`transfer-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`);
  if (item) {
    const statusEl = item.querySelector('.file-status');
    statusEl.className = `file-status ${status}`;
    statusEl.textContent = getStatusLabel(status);

    if (status === 'completed') {
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'file-action';
      downloadBtn.textContent = '📥 下载';
      downloadBtn.onclick = () => downloadFile(fileName);
      item.appendChild(downloadBtn);
    }
  }
}

// 处理接收到的文件
function handleFileReceived(data) {
  console.log('📥 处理接收到的文件:', data.fileName);
  showNotification(`✅ 收到文件: ${data.fileName}`, 'success');

  const transferList = document.getElementById('receiver-transfers');
  if (!transferList) return;

  const item = document.createElement('div');
  item.className = 'transfer-item';
  item.id = `transfer-${data.fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;

  const icon = getFileIcon(data.fileName);
  const size = formatFileSize(data.fileSize);

  item.innerHTML = `
    <div class="file-icon">${icon}</div>
    <div class="file-info">
      <div class="file-name">${data.fileName}</div>
      <div class="file-size">${size}</div>
    </div>
    <button class="file-action" onclick="downloadFile('${data.transferId}')">📥 下载</button>
  `;

  transferList.appendChild(item);
}

// 下载文件
function downloadFile(transferId) {
  console.log('📥 下载文件:', transferId);
  window.open(`/api/download/${transferId}`, '_blank');
}

// 获取文件图标
function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  const icons = {
    'pdf': '📄',
    'doc': '📝', 'docx': '📝',
    'xls': '📊', 'xlsx': '📊',
    'ppt': '📽️', 'pptx': '📽️',
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
    'mp4': '🎬', 'avi': '🎬', 'mkv': '🎬',
    'mp3': '🎵', 'wav': '🎵',
    'zip': '📦', 'rar': '📦', '7z': '📦',
    'txt': '📃',
    'js': '⚙️', 'html': '🌐', 'css': '🎨',
  };
  return icons[ext] || '📄';
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 获取状态标签
function getStatusLabel(status) {
  const labels = {
    'uploading': '⏳ 上传中',
    'completed': '✅ 已完成',
    'failed': '❌ 失败'
  };
  return labels[status] || status;
}

// 显示屏幕
function showScreen(screenId) {
  console.log('显示屏幕:', screenId);
  hideAllScreens();
  const screen = document.getElementById(screenId);
  if (screen) {
    screen.classList.remove('hidden');
  } else {
    console.error('找不到屏幕:', screenId);
  }
}

// 隐藏所有屏幕
function hideAllScreens() {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
}

// 返回
function goBack() {
  console.log('返回欢迎页面');
  if (ws) {
    ws.close();
    ws = null;
  }
  peerId = null;
  clientId = null;
  showScreen('welcome-screen');
}

// 断开连接
function disconnect() {
  console.log('断开连接');
  if (ws) {
    ws.close();
    ws = null;
  }
  peerId = null;
  goBack();
}

// 显示通知
function showNotification(message, type = 'success') {
  console.log('📢 通知:', message, type);
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.remove('hidden');

    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
}
