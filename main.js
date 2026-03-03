const { app, BrowserWindow, Menu, shell, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    title: 'P2P 跨地域文件传输'
  });

  // 从 GitHub Pages 加载最新代码
  // 如果本地文件存在且有 --dev 参数,则加载本地文件用于开发
  const localIndexPath = path.join(__dirname, 'index.html');

  if (process.argv.includes('--dev') && fs.existsSync(localIndexPath)) {
    mainWindow.loadFile('index.html');
    console.log('开发模式: 加载本地文件');
  } else {
    mainWindow.loadURL('https://xiao-wu990.github.io/wjcs');
    console.log('生产模式: 从 GitHub Pages 加载');
  }

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 页面加载完成后的处理
  mainWindow.webContents.on('did-finish-load', () => {
    const url = mainWindow.webContents.getURL();

    if (url.includes('github.io')) {
      console.log('✅ 已从 GitHub Pages 加载最新版本');
    } else {
      console.log('🔧 开发模式: 使用本地文件');
    }
  });

  // 监听加载错误
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('❌ 加载失败:', errorCode, errorDescription);

    // 如果从GitHub Pages加载失败,尝试加载本地文件
    if (errorDescription.includes('net::ERR_INTERNET_DISCONNECTED') ||
        errorDescription.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('📡 网络不可用,尝试加载本地文件...');

      const localIndexPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(localIndexPath)) {
        mainWindow.loadFile('index.html');
        showNotification('离线模式', '已切换到本地文件');
      } else {
        showNotification('加载失败', '无法加载应用,请检查网络连接');
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '检查更新', accelerator: 'CmdOrCtrl+U', click: () => {
          mainWindow.reload();
          showNotification('已更新', '应用已重新加载最新代码');
        }},
        { label: '新建连接', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.reload() },
        { type: 'separator' },
        { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '开发者工具', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于', click: () => shell.openExternal('https://github.com') },
        { label: '反馈问题', click: () => shell.openExternal('mailto:3530388417@qq.com') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  createMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.setAsDefaultProtocolClient('p2p-transfer');

// 显示系统通知
function showNotification(title, body) {
  if (Notification.isSupported()) {
    new Notification({
      title: title,
      body: body,
      icon: path.join(__dirname, 'icon.png') // 可选: 添加应用图标
    }).show();
  }
}
