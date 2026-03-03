# P2P 跨平台实时通信工具 🌐

## ✨ 核心功能

### 📱 实时通信
- 💬 文字消息 - 实时发送和接收文字
- 🖼️ 图片消息 - 发送图片并实时预览
- 🎬 视频消息 - 发送视频并在网页中播放
- 🎙️ 语音消息 - 录制并发送语音
- 📎 文件传输 - 发送任意类型文件,可直接下载

### 📞 通话功能
- 📹 视频通话 - 支持音视频双向通信
- 📞 语音通话 - 纯语音通话
- 🎤 麦克风模式 - 实时传输麦克风音频

### 🌐 跨平台支持
- ✅ Web 版本 - 浏览器直接使用
- ✅ Windows 版本 - Electron 桌面应用
- ✅ Android 版本 - Android 原生应用
- ✅ 三平台互通 - 所有平台可以互相通信

### 🎨 用户界面
- 🌙 暗黑模式支持
- 📱 响应式设计
- 🎯 直观的操作界面
- ⚡ 流畅的动画效果

## 🚀 快速开始

### Web 版本（最简单）

1. 安装依赖：
```bash
npm install
```

2. 启动服务器：
```bash
npm start
```

3. 在浏览器中打开：
- 本地访问：http://localhost:3000
- 局域网访问：http://你的IP:3000

### Windows 版本

需要手动创建 `main.js` 文件（内容见下方 Windows 构建指南），然后：

```bash
# 安装 Electron
npm install electron@latest --save-dev
npm install electron-builder@latest --save-dev

# 开发模式运行
npm run electron-dev

# 打包 Windows 应用
npm run build-win
```

### Android 版本

```bash
# 安装 Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 初始化（需要手动创建 capacitor.json）
npx cap init com.p2p.communication "P2P实时通信"

# 添加 Android 平台
npx cap add android

# 同步代码
npx cap sync android

# 打开 Android Studio
npx cap open android
```

## 📖 详细使用说明

### 连接步骤（所有平台通用）

1. **选择模式**
   - 发送端：主动发起连接
   - 接收端：等待对方连接

2. **获取 ID**
   - 系统自动生成 6 位 Peer ID
   - 将 ID 发送给对方

3. **建立连接**
   - 发送端输入对方 ID
   - 点击"连接"按钮
   - 连接成功后即可开始通信

### 发送消息

1. **文字消息**
   - 在输入框输入文字
   - 点击发送按钮或按 Enter
   - 支持 Shift+Enter 换行

2. **图片消息**
   - 点击图片按钮 🖼️
   - 选择图片文件
   - 图片会显示在聊天窗口
   - 点击图片可以放大预览

3. **视频消息**
   - 点击视频按钮 🎬
   - 选择视频文件
   - 视频会自动嵌入聊天窗口

4. **语音消息**
   - 点击录音按钮 🎙️
   - 开始录制
   - 再次点击停止录制
   - 语音会自动发送

5. **文件传输**
   - 点击文件按钮 📎
   - 选择任意文件
   - 接收方可以点击下载

### 视频通话

1. 点击"视频通话"按钮 📹
2. 对方会收到通话请求
3. 对方同意后建立视频连接
4. 可以切换摄像头和麦克风

### 语音通话

1. 点击"语音通话"按钮 📞
2. 对方会收到通话请求
3. 对方同意后建立语音连接

### 麦克风模式

1. 点击"麦克风模式"按钮 🎤
2. 发送端说话的声音会实时传输
3. 接收端可以直接听到
4. 再次点击关闭麦克风模式

## 🔧 Windows 版本详细指南

### 1. 创建 main.js

在项目根目录创建 `main.js` 文件，内容如下：

```javascript
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.argv.includes('--dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    title: 'P2P 实时通信'
  });

  mainWindow.loadFile('index.html');

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
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
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: '开发者工具', accelerator: 'F12', click: () => mainWindow.webContents.openDevTools() },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+Minus', role: 'zoomOut' },
        { type: 'separator' },
        { label: '切换主题', accelerator: 'CmdOrCtrl+T', click: () => {
          mainWindow.webContents.executeJavaScript('toggleTheme()');
        }}
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '使用帮助', accelerator: 'F1', click: () => {
          mainWindow.webContents.executeJavaScript('showHelp()');
        }},
        { label: '关于', click: () => {
          alert('P2P 实时通信工具 v2.0.0\n跨平台支持: Web, Windows, Android');
        }}
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### 2. 更新 package.json

确保 package.json 包含以下内容：

```json
{
  "main": "main.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "electron": "electron .",
    "electron-dev": "electron . --dev",
    "build-win": "electron-builder --win"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ws": "^8.14.2",
    "qrcode": "^1.5.3",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "nodemon": "^3.0.1"
  },
  "build": {
    "appId": "com.p2p.communication",
    "productName": "P2P实时通信",
    "directories": {
      "output": "dist"
    },
    "win": {
      "target": "nsis"
    }
  }
}
```

### 3. 安装依赖并构建

```bash
npm install electron@latest --save-dev
npm install electron-builder@latest --save-dev

# 开发模式运行
npm run electron-dev

# 打包应用
npm run build-win
```

打包后的应用在 `dist` 目录中，可以直接安装使用。

## 🤖 Android 版本详细指南

### 1. 创建 capacitor.json

在项目根目录创建 `capacitor.json` 文件：

```json
{
  "appId": "com.p2p.communication",
  "appName": "P2P实时通信",
  "webDir": ".",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}
```

### 2. 安装依赖

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android --save
```

### 3. 初始化项目

```bash
npx cap init
```

按照提示输入：
- App name: P2P实时通信
- App ID: com.p2p.communication
- Web dir: .

### 4. 添加 Android 平台

```bash
npx cap add android
```

### 5. 同步代码

```bash
npx cap sync android
```

### 6. 打开 Android Studio

```bash
npx cap open android
```

在 Android Studio 中：
1. 等待 Gradle 同步完成
2. 点击 Run 按钮（绿色三角形）运行到模拟器或真机
3. 或选择 Build → Build Bundle(s) / APK(s) → Build APK(s) 生成 APK

### 7. 生成签名 APK（发布版本）

1. 创建签名密钥：
```bash
keytool -genkey -v -keystore p2p-communication.keystore -alias p2p -keyalg RSA -keysize 2048 -validity 10000
```

2. 在 `android/app/build.gradle` 中配置签名：
```gradle
android {
    signingConfigs {
        release {
            storeFile file("p2p-communication.keystore")
            storePassword "your-store-password"
            keyAlias "p2p"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. 生成发布版 APK：
```bash
cd android
./gradlew assembleRelease
```

APK 在 `android/app/build/outputs/apk/release/` 目录中。

## 🔗 三平台互通说明

### 通信原理

所有平台使用相同的 PeerJS 技术栈，通过 Peer ID 进行连接：

1. **Web 版本**：在浏览器中运行，使用 PeerJS CDN
2. **Windows 版本**：在 Electron 中加载相同的 index.html
3. **Android 版本**：在 WebView 中加载 index.html

### 互通测试

以下是各种组合的测试场景：

| 平台1 | 平台2 | 功能支持 |
|-------|-------|---------|
| Web | Web | ✅ 全部功能 |
| Web | Windows | ✅ 全部功能 |
| Web | Android | ✅ 全部功能 |
| Windows | Windows | ✅ 全部功能 |
| Windows | Android | ✅ 全部功能 |
| Android | Android | ✅ 全部功能 |

### 注意事项

- 所有平台必须在联网状态下使用
- 穿透能力取决于网络环境
- 局域网内连接速度最快
- 跨地域连接需要稳定的互联网

## ☁️ 部署到 GitHub Pages

### 1. 创建 GitHub 仓库

1. 登录 GitHub，创建新仓库
2. 上传项目文件（或使用 git push）

### 2. 启用 GitHub Pages

1. 进入仓库设置
2. 找到 "Pages" 部分
3. 选择 `main` 分支作为源
4. 点击 Save

### 3. 访问应用

等待几分钟后，访问：
```
https://yourusername.github.io/repo-name
```

### 4. 分享给他人

将 GitHub Pages 链接分享给任何人，他们都可以直接使用。

## 📦 其他云平台部署

### Vercel（推荐）

```bash
npm install -g vercel
vercel login
vercel --prod
```

3分钟获得永久免费域名！

### Netlify

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Replit

直接在 Replit 上创建项目，上传代码，点击 Run 即可。

## 🛠️ 配置说明

### 修改端口

编辑 `server.js`：
```javascript
const PORT = process.env.PORT || 3000;
```

### 修改文件大小限制

编辑 `server.js`：
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 * 1024 // 10GB
}
```

### 使用自定义 PeerJS 服务器

默认使用 PeerJS 的公共服务器。要使用自己的服务器：

```javascript
peer = new Peer(shortId, {
  host: 'your-server.com',
  port: 9000,
  path: '/peerjs',
  secure: true
});
```

## ❓ 常见问题

### Q: 连接失败怎么办？

A: 检查以下几点：
- ✅ 确保双方都在线且网络正常
- ✅ 检查 ID 是否输入正确
- ✅ 尝试刷新页面重新连接
- ✅ 检查浏览器控制台（F12）是否有错误

### Q: 文件传输很慢怎么办？

A: 文件传输速度取决于网络带宽，建议：
- 使用局域网内连接
- 压缩大文件后再传输
- 避免在网络高峰期传输

### Q: 视频通话卡顿怎么办？

A: 尝试以下方法：
- 降低视频质量
- 关闭摄像头，只使用语音
- 使用更好的网络连接
- 关闭其他占用带宽的应用

### Q: 麦克风模式没有声音？

A: 检查：
- 浏览器/应用是否有麦克风权限
- 对方是否开启了麦克风模式
- 系统音量设置是否正确
- 麦克风硬件是否正常工作

### Q: Android 版本无法访问摄像头？

A: 检查：
- Android 6.0+ 需要运行时权限
- 在 AndroidManifest.xml 中添加权限：
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### Q: Windows 版本无法启动？

A: 检查：
- Node.js 版本是否正确（建议 v16+）
- 是否正确安装了 electron
- main.js 文件是否创建且语法正确
- 检查开发者工具中的错误信息

## 📝 技术栈

### Web 版本
- PeerJS（WebRTC 封装）
- WebRTC（实时通信）
- MediaRecorder API（录音）
- getUserMedia API（媒体访问）
- 原生 HTML/CSS/JavaScript

### Windows 版本
- Electron（桌面应用框架）
- Chromium 渲染引擎
- Node.js 运行时

### Android 版本
- Capacitor（混合应用框架）
- Android WebView
- 原生 Android API

## 📂 项目结构

```
.
├── index.html          # 主页面（所有平台共用）
├── main.js            # Electron 主进程（需手动创建）
├── server.js          # 后端服务器（可选）
├── package.json       # 项目配置
├── capacitor.json     # Capacitor 配置（需手动创建）
├── public/            # 静态资源
├── uploads/           # 上传文件目录
├── android/           # Android 项目（由 Capacitor 生成）
├── build/             # Electron 构建资源
└── dist/              # 构建输出目录
```

## 🎯 开发路线图

- [x] 文字、图片、视频、语音消息
- [x] 文件传输
- [x] 视频和语音通话
- [x] 麦克风模式
- [x] Web 版本
- [x] Windows 版本
- [x] Android 版本
- [x] 三平台互通
- [x] GitHub 部署支持
- [ ] iOS 版本
- [ ] 端到端加密
- [ ] 群组聊天
- [ ] 消息历史记录
- [ ] 文件夹传输
- [ ] 传输进度显示

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 自由使用和修改

## 📮 联系方式

- Email: 3530388417@qq.com
- QQ群: https://qm.qq.com/q/zQn8MgrIDS

---

**享受使用 P2P 跨平台实时通信工具！🎉**


