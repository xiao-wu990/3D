# Replit 部署指南

将文件传输应用部署到 Replit，完全免费使用。

## 🚀 快速部署

### 方式 1：从 GitHub 导入（推荐）

1. **将代码推送到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

2. **访问 Replit**
   - 打开 https://replit.com
   - 登录或注册账号

3. **创建新的 Replit**
   - 点击 "Create Repl"
   - 选择 "Import from GitHub"
   - 输入你的 GitHub 仓库地址
   - 点击 "Import"

4. **配置 Replit**
   - Replit 会自动识别 Node.js 项目
   - 等待依赖安装完成

5. **启动服务**
   - 点击顶部的 "Run" 按钮
   - 等待服务启动
   - 点击显示的 URL 地址访问

### 方式 2：直接在 Replit 创建

1. **创建 Replit**
   - 访问 https://replit.com
   - 点击 "Create Repl"
   - 选择 "Node.js" 模板
   - 命名为 "file-transfer"

2. **上传文件**
   - 将所有文件上传到 Replit
   - 或者复制粘贴代码文件内容

3. **启动服务**
   - 点击 "Run" 按钮
   - 等待服务启动

## 📱 获取访问地址

启动成功后，Replit 会显示一个 Web 预览窗口，点击右上角的 "Open in a new tab" 按钮。

地址格式类似：
```
https://你的repl名.你的用户名.replit.co
```

**分享给朋友：**
- 发送端：`https://xxx.replit.co`
- 接收端：`https://xxx.replit.co?role=receiver`

## ⚠️ 休眠限制

### 什么是休眠？

Replit 免费版有休眠限制：
- **无活动 15 分钟** → 应用自动休眠
- **唤醒时间**：10-30 秒
- **每月免费时长**：约 100-200 小时

### 如何避免休眠？

**方法 1：使用 ping 服务（推荐）**
访问：https://uptimerobot.com/
- 添加你的 Replit 地址
- 设置每 5-10 分钟访问一次
- 可以保持应用在线

**方法 2：使用自唤醒脚本**
在 Replit 中添加 `keep-alive.js`：
```javascript
const https = require('https');
setInterval(() => {
  const url = process.env.REPL_URL || 'https://你的repl地址.replit.co';
  https.get(url, () => {
    console.log('Keep-alive ping sent at', new Date().toISOString());
  });
}, 14 * 60 * 1000); // 14 分钟（小于 15 分钟休眠限制）
```

**方法 3：升级 Replit（付费）**
- Hacker 计划：$20/月
- 无休眠限制
- 更强的性能

## 🔧 常见问题

### 问题 1：应用启动失败

**解决方案：**
- 检查 `package.json` 中的 `scripts.start` 是否正确
- 确保所有依赖已安装
- 查看 Console 中的错误信息

### 问题 2：无法访问应用

**解决方案：**
- 点击 "Run" 按钮重新启动
- 等待 10-30 秒（可能是休眠唤醒）
- 检查网络连接

### 问题 3：WebSocket 连接失败

**解决方案：**
- Replit 支持 WebSocket
- 确保使用正确的端口（默认 3000）
- 检查防火墙设置

### 问题 4：上传目录权限问题

**解决方案：**
- Replit 的 `/tmp` 目录可以写入
- 修改 `server.js` 中的上传目录：
```javascript
const upload = multer({
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }
});
```

## 📝 环境变量（可选）

如果需要配置环境变量：

1. 在 Replit 左侧面板点击 "Secrets (Environment Variables)"
2. 添加环境变量：
   - `PORT`: `3000`
   - `NODE_ENV`: `production`

## 🌐 域名绑定（可选）

### 使用自定义域名

1. 在 Replit 项目设置中点击 "Domains"
2. 添加你的域名
3. 在域名 DNS 设置中添加 CNAME 记录

### 使用免费域名

Replit 自动提供 `.replit.co` 子域名，无需配置。

## 📊 监控和日志

### 查看日志
- 在 Replit 的 "Console" 面板查看运行日志
- 可以看到 WebSocket 连接、文件传输等信息

### 监控访问
- 使用 UptimeRobot 监控应用可用性
- 设置告警通知

## 🚀 性能优化

1. **减少文件大小** - 避免传输超大文件（建议 < 100MB）
2. **使用压缩** - 启用 gzip 压缩
3. **清理旧文件** - 定期清理 `/tmp/uploads` 中的旧文件
4. **使用缓存** - 对静态资源启用缓存

## 💡 最佳实践

1. **定期使用** - 避免长时间休眠导致唤醒慢
2. **保持更新** - 定期更新依赖包
3. **监控使用量** - 查看每月免费额度使用情况
4. **备份代码** - 定期备份到 GitHub

## 🆘 获取帮助

- Replit 文档：https://docs.replit.com/
- Replit 社区：https://replit.com/community
- 提交 Issue：https://github.com/你的仓库/issues

## 📄 许可证

MIT License

---

**提示**：如果需要 24/7 在线且无休眠限制，建议升级到 Replit Hacker 计划或使用 Railway 等云服务。
