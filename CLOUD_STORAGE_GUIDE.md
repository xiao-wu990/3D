# 永久免费云存储方案

## 🎯 推荐方案（按优先级排序）

### 1. **Vercel** ⭐⭐⭐⭐⭐（最推荐）

**优点：**
- ✅ 完全免费，无限制
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 简单易用，连接GitHub即可
- ✅ 支持Node.js应用
- ✅ 提供永久网址：`https://你的项目名.vercel.app`

**限制：**
- 无限制，只是冷启动可能慢一点

**使用步骤：**

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署项目
vercel

# 4. 按提示操作，会得到永久网址
```

**或通过网页部署：**
1. 访问 https://vercel.com
2. 用GitHub账号登录
3. 点击"New Project"
4. 导入你的GitHub仓库
5. 点击"Deploy"
6. 获得永久网址！

---

### 2. **Railway** ⭐⭐⭐⭐

**优点：**
- ✅ 每月$5免费额度（够用）
- ✅ 自动HTTPS
- ✅ 支持数据库
- ✅ 实时日志
- ✅ 简单易用

**限制：**
- 每月$5免费额度

**使用步骤：**

```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 部署
railway up
```

---

### 3. **Render** ⭐⭐⭐⭐

**优点：**
- ✅ 免费tier
- ✅ 自动HTTPS
- ✅ 支持多种语言
- ✅ 从GitHub自动部署

**限制：**
- 免费版15分钟无活动会休眠
- 每月750小时运行时间

**使用步骤：**
1. 访问 https://render.com
2. 用GitHub登录
3. 点击"New +" → "Web Service"
4. 连接GitHub仓库
5. 配置后点击"Create Web Service"
6. 获得网址

---

### 4. **Fly.io** ⭐⭐⭐

**优点：**
- ✅ 每月$3免费额度
- ✅ 全球部署
- ✅ 快速启动
- ✅ 支持Docker

**限制：**
- 需要信用卡验证

**使用步骤：**

```bash
# 1. 安装Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. 登录
flyctl auth signup

# 3. 部署
flyctl launch
```

---

### 5. **Glitch** ⭐⭐⭐（适合学习）

**优点：**
- ✅ 完全免费
- ✅ 在线编辑
- ✅ 实时预览
- ✅ 简单易用

**限制：**
- 每天重启一次
- 不适合生产环境

**使用步骤：**
1. 访问 https://glitch.com
2. 点击"Start a Project"
3. 上传代码或导入GitHub
4. 获得网址

---

## ⚠️ 重要提示

### 关于局域网文件传输

即使部署到云端获得永久网址，**仍然有这些限制**：

1. **局域网传输特性**：
   - 本工具设计用于局域网设备间传输
   - 即使云服务器是永久的，发送端和接收端仍需要在同一局域网
   - 不能跨互联网传输文件

2. **推荐使用场景**：
   - ✅ 局域网内设备间文件传输
   - ✅ 家庭/办公室网络
   - ✅ 同一WiFi环境

3. **不适合场景**：
   - ❌ 跨城市文件传输
   - ❌ 不同网络环境
   - ❌ 公网文件分享

### 如果需要真正的云端文件存储

如果你想要真正的云端文件存储（跨互联网），建议：

**方案A：使用现有云存储服务**
- Google Drive
- 百度网盘
- 阿里云盘
- OneDrive

**方案B：搭建真正的云盘**
- Nextcloud（开源云盘）
- Seafile（私有云存储）
- ownCloud

这些方案提供真正的云端存储，支持从任何地方访问。

---

## 🚀 最快的部署方式（推荐Vercel）

### 方式1：命令行部署（最快）

```bash
# 1. 安装Vercel
npm install -g vercel

# 2. 登录
vercel login

# 3. 进入项目目录
cd 你的项目路径

# 4. 一键部署
vercel --prod

# 完成！你会得到一个永久网址
```

### 方式2：网页部署（最简单）

1. 将代码推送到GitHub
2. 访问 https://vercel.com/new
3. 导入GitHub仓库
4. 点击"Deploy"
5. 等待部署完成（约1-2分钟）
6. 获得永久网址！

---

## 📝 部署后的访问

部署成功后，你会得到类似这样的网址：

- **Vercel**: `https://lan-file-transfer.vercel.app`
- **Railway**: `https://你的应用名.up.railway.app`
- **Render**: `https://你的应用名.onrender.com`

这些网址都是永久的，从任何地方都可以访问！

---

## 🔧 部署注意事项

1. **确保package.json正确**
   - 检查`"start"`脚本
   - 确保所有依赖都在`dependencies`中

2. **环境变量**（如果需要）
   - Vercel: 在Project Settings中添加
   - Railway: 在Variables中添加
   - Render: 在Environment中添加

3. **端口设置**
   - 使用`process.env.PORT`
   - 不要硬编码端口号

---

## ❓ 常见问题

**Q: 免费额度够用吗？**
A: Vercel完全免费，其他平台的免费额度足够个人使用。

**Q: 会被删除吗？**
A: 只要你不手动删除，永久可用。

**Q: 可以绑定自己的域名吗？**
A: 可以！所有平台都支持自定义域名。

**Q: 如何更新代码？**
A: 推送到GitHub，会自动重新部署。

**Q: 支持HTTPS吗？**
A: 所有平台都自动提供HTTPS。

---

## 🎉 总结

**推荐方案：Vercel**
- 完全免费
- 最简单
- 速度最快
- 提供永久网址

**立即部署：**
```bash
npm install -g vercel
vercel login
vercel
```

3分钟就能获得永久免费的网址！
