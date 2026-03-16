const { app, BrowserWindow, Menu, shell, Notification, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

// GitHub 仓库配置
const GITHUB_REPO = 'xiao-wu990/wjcs';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const GITHUB_RELEASES = `https://github.com/${GITHUB_REPO}/releases`;

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
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadURL('https://xiao-wu990.github.io/wjcs');
    console.log('生产模式: 从 GitHub Pages 加载');
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
          { label: '检查更新', accelerator: 'CmdOrCtrl+U', click: async () => {
            showNotification('正在检查', '正在检查更新...');
            try {
              const updateInfo = await checkForUpdates();
              if (updateInfo.hasUpdate) {
                showUpdateNotification(updateInfo);
              } else {
                showNotification('已是最新', `当前已是最新版本 v${updateInfo.latestVersion}`);
              }
            } catch (error) {
              showNotification('检查失败', '无法连接到更新服务器');
            }
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

  // 启动自动更新检测（每2小时检查一次）
  const updateCheckInterval = startAutoCheck(7200000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // 应用退出时清除定时器
  app.on('before-quit', () => {
    clearInterval(updateCheckInterval);
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

// ========== 版本检测相关函数 ==========

/**
 * 比较版本号
 */
function isNewerVersion(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return true;
    if (v1Part < v2Part) return false;
  }

  return false;
}

/**
 * 格式化发布说明
 */
function formatReleaseNotes(notes) {
  if (!notes) return '暂无更新说明';

  return notes
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, '').trim())
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, '• ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * 获取下载 URL
 */
function getDownloadUrl(releaseInfo) {
  if (!releaseInfo.assets || releaseInfo.assets.length === 0) {
    return GITHUB_RELEASES;
  }

  const windowsAsset = releaseInfo.assets.find(asset =>
    asset.name.endsWith('.exe') || asset.name.endsWith('.msi')
  );

  return windowsAsset ? windowsAsset.browser_download_url : GITHUB_RELEASES;
}

/**
 * 检查 GitHub 上的最新版本
 */
function checkForUpdates() {
  return new Promise((resolve, reject) => {
    console.log('🔍 检查更新...');

    let currentVersion = '1.0.0';
    try {
      const packageJson = require('./package.json');
      currentVersion = packageJson.version;
    } catch (e) {
      console.log('无法读取 package.json，使用默认版本');
    }

    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: `/repos/${GITHUB_REPO}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'P2P-Transfer-App',
        'Accept': 'application/vnd.github.v3+json'
      },
      rejectUnauthorized: false // 忽略 SSL 证书验证
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => { data += chunk; });

      res.on('end', () => {
        try {
          const releaseInfo = JSON.parse(data);

          if (releaseInfo.message && releaseInfo.message.includes('Not Found')) {
            console.log('❌ 未找到发布信息');
            resolve({ hasUpdate: false, currentVersion });
            return;
          }

          const latestVersion = releaseInfo.tag_name.replace('v', '');

          console.log(`📦 当前版本: v${currentVersion}`);
          console.log(`📦 最新版本: v${latestVersion}`);

          if (isNewerVersion(latestVersion, currentVersion)) {
            console.log('✅ 发现新版本!');
            resolve({
              hasUpdate: true,
              currentVersion,
              latestVersion,
              tagName: releaseInfo.tag_name,
              releaseUrl: releaseInfo.html_url,
              releaseNotes: formatReleaseNotes(releaseInfo.body),
              publishedAt: releaseInfo.published_at,
              downloadUrl: getDownloadUrl(releaseInfo)
            });
          } else {
            console.log('✅ 已是最新版本');
            resolve({ hasUpdate: false, currentVersion, latestVersion });
          }
        } catch (error) {
          console.error('❌ 解析版本信息失败:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 检查更新失败:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * 显示更新通知
 */
function showUpdateNotification(updateInfo) {
  if (!Notification.isSupported()) {
    return;
  }

  const notification = new Notification({
    title: `🎉 发现新版本 v${updateInfo.latestVersion}`,
    body: `当前版本: v${updateInfo.currentVersion}\n点击查看更新详情`,
    icon: path.join(__dirname, 'icon.png')
  });

  notification.on('click', () => {
    if (mainWindow) {
      showUpdateDialog(updateInfo);
      mainWindow.show();
      mainWindow.focus();
    }
  });

  notification.show();
}

/**
 * 显示更新详情对话框
 */
function showUpdateDialog(updateInfo) {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '发现新版本',
    message: `新版本 v${updateInfo.latestVersion} 可用`,
    detail: `当前版本: v${updateInfo.currentVersion}\n\n📝 更新内容:\n${updateInfo.releaseNotes}`,
    buttons: ['前往下载', '稍后提醒'],
    defaultId: 0,
    cancelId: 1,
    noLink: true
  }).then((result) => {
    if (result.response === 0) {
      shell.openExternal(updateInfo.downloadUrl);
    }
  });
}

/**
 * 定期检查更新
 */
function startAutoCheck(interval = 7200000) {
  console.log('🔄 启动自动更新检测，检测间隔:', interval / 1000 / 60, '分钟');

  const checkAndNotify = () => {
    checkForUpdates()
      .then(updateInfo => {
        if (updateInfo?.hasUpdate) {
          showUpdateNotification(updateInfo);
        }
      })
      .catch(error => {
        console.log('检查更新失败:', error.message);
      });
  };

  // 立即检查一次
  checkAndNotify();

  // 定期检查
  return setInterval(checkAndNotify, interval);
}
