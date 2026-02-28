# Replit 部署快速指南

## 📋 准备工作

### 1. 访问 Replit
打开 https://replit.com 并登录/注册账号

### 2. 创建新的 Repl

**方式 A：导入 GitHub 仓库（推荐）**
1. 将代码推送到 GitHub（见下方）
2. 在 Replit 点击 "Create Repl" → "Import from GitHub"
3. 粘贴你的 GitHub 仓库地址
4. 点击 "Import"

**方式 B：直接创建**
1. 点击 "Create Repl"
2. 选择 "Node.js"
3. 命名为 "file-transfer"
4. 点击 "Create Repl"

### 3. 如果选择方式 B，上传文件

将以下文件上传到 Replit：
- `server.js`
- `public/` 文件夹（包含 index.html, app.js, style.css）
- `package.json`

## 🚀 启动服务

1. 在 Replit 编辑器中点击顶部绿色按钮 **"Run"**
2. 等待依赖安装完成
3. 看到 "服务器运行在" 提示即启动成功
4. 点击右侧预览窗口右上角的 **"Open in a new tab"**

## 🌐 获取访问地址

启动成功后，访问地址格式：
```
https://你的repl名.你的用户名.replit.co
```

**示例：**
- Repl 名称：file-transfer
- 用户名：xiaowu
- 访问地址：`https://file-transfer.xiaowu.replit.co`

## 📱 分享给朋友

**发送端地址：**
```
https://file-transfer.xiaowu.replit.co
```

**接收端地址：**
```
https://file-transfer.xiaowu.replit.co?role=receiver
```

## ⚡ 保持应用在线（避免休眠）

### 方法 1：使用 UptimeRobot（推荐）

1. 访问 https://uptimerobot.com/
2. 注册账号（免费）
3. 点击 "Add New Monitor"
4. 配置：
   - Monitor Type: HTTPS
   - URL: 你的 Replit 地址
   - Monitoring Interval: 5 minutes
5. 点击 "Create Monitor"

这样每 5 分钟会自动访问一次，保持应用在线。

### 方法 2：使用内置 Keep-Alive

在 Replit 中添加 `keep-alive.js`：
```javascript
const https = require('https');
const URL = require('url').URL;

// 每 14 分钟访问一次（小于 15 分钟休眠限制）
setInterval(() => {
  const url = new URL(process.env.REPL_URL || 'https://你的repl地址.replit.co');
  https.get(url, (res) => {
    console.log('Keep-alive ping:', res.statusCode, new Date().toISOString());
  }).on('error', (err) => {
    console.error('Keep-alive error:', err.message);
  });
}, 14 * 60 * 1000); // 14 分钟

console.log('Keep-alive service started');
```

然后在 `package.json` 中修改：
```json
{
  "scripts": {
    "start": "node server.js & node keep-alive.js"
  }
}
```

## 🔧 常见问题

### Q: 应用启动失败？
**A:**
- 检查 Console 中的错误信息
- 确保所有文件都已上传
- 确认 `package.json` 中有正确的 `scripts.start`

### Q: 无法访问应用？
**A:**
- 应用可能休眠了，点击 "Run" 重新启动
- 等待 10-30 秒（唤醒时间）
- 检查是否在正确的端口（默认 3000）

### Q: 文件上传失败？
**A:**
- Replit 的 `/tmp` 目录有空间限制
- 建议单个文件不要超过 100MB
- 定期清理上传的文件

### Q: 连接超时？
**A:**
- 检查网络连接
- 可能是应用休眠了，重新启动
- 确保使用 https:// 而不是 http://

## 📊 监控使用情况

在 Replit 仪表板查看：
- 每月运行小时数
- 存储空间使用
- 网络流量

免费版限制：
- 约 100-200 小时/月
- 512MB 存储

## 💡 提示

- **首次唤醒** 可能需要 10-30 秒
- **保持使用** 可以避免休眠
- **定期清理** 上传的文件节省空间
- **监控额度** 避免超出限制

## 🆘 需要帮助？

- 查看 [README-REPLIT.md](./README-REPLIT.md) 获取详细文档
- Replit 社区：https://replit.com/community
- 提交 Issue

---

**恭喜！你的应用已部署到 Replit，可以免费使用了！** 🎉
