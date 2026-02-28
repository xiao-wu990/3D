# Ngrok 内网穿透部署指南

使用 ngrok 将本地文件传输服务暴露到公网，支持外网访问。

## 🚀 快速开始

### 1. 安装 ngrok

访问 [ngrok 官网](https://ngrok.com/download) 下载对应系统的版本。

**Windows:**
1. 下载 `ngrok-v3-stable-windows-amd64.zip`
2. 解压到任意文件夹（如 `C:\ngrok`）
3. 将该文件夹添加到系统环境变量 PATH

或者直接下载到项目文件夹使用。

### 2. 注册并获取 Authtoken（可选但推荐）

1. 访问 [ngrok.com/signup](https://ngrok.com/signup) 注册账号
2. 登录后获取 Authtoken
3. 在命令行运行：
```bash
ngrok config add-authtoken 你的authtoken
```

**不注册也可以使用免费版，但每次启动地址会变化。**

### 3. 启动本地服务

```bash
# 在项目根目录
npm start
```

服务会在 `http://localhost:3000` 启动。

### 4. 启动 ngrok 穿透

**方式 1: 使用命令行（已配置环境变量）**
```bash
ngrok http 3000
```

**方式 2: 直接使用 ngrok 可执行文件**
```bash
# Windows
.\ngrok.exe http 3000

# 或使用完整路径
C:\ngrok\ngrok.exe http 3000
```

### 5. 获取公网地址

ngrok 启动后会显示类似信息：

```
Session Status                Online
Account                       (计划: 免费版)
Version                       3.x.x
Region                        Asia Pacific (ap)
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
```

**复制 `https://xxxx-xx-xx-xx-xx.ngrok-free.app` 这个地址，这就是您的公网访问地址！**

## 📱 使用方法

### 发送端

1. 复制 ngrok 的公网地址（如 `https://xxxx.ngrok-free.app`）
2. 发送给其他用户
3. 其他用户访问：`https://xxxx.ngrok-free.app?role=receiver`
4. 等待接收端上线
5. 连接并发送文件

### 接收端

1. 访问发送端分享的地址：`https://xxxx.ngrok-free.app?role=receiver`
2. 等待连接
3. 接收文件

## 💡 高级用法

### 固定域名（需要付费）

ngrok 免费版每次启动地址会变化，如需固定域名：
1. 升级到付费版
2. 在 ngrok Dashboard 创建自定义域名
3. 配置域名指向你的应用

### 同时暴露多个端口

```bash
# 在不同终端
ngrok http 3000  # 主应用
ngrok http 3001  # 其他服务
```

### 使用配置文件

创建 `ngrok.yml`:
```yaml
tunnels:
  app:
    addr: 3000
    proto: http
```

启动:
```bash
ngrok start --all
```

## ⚠️ 注意事项

1. **电脑必须保持开机** - ngrok 只能穿透已启动的服务
2. **网络稳定性** - 确保网络连接稳定
3. **免费版限制**:
   - 每次启动地址会变化
   - 有连接数限制
   - 有流量限制
4. **安全性** - 公网地址任何人都可以访问，建议：
   - 设置连接密码（需要后端支持）
   - 定期更换 ngrok 地址
   - 不要传输敏感文件

## 🔧 故障排除

### 问题 1: ngrok 无法启动

**解决方案**:
- 检查本地服务是否已启动（`npm start`）
- 检查端口 3000 是否被占用
- 检查防火墙是否阻止

### 问题 2: 公网地址无法访问

**解决方案**:
- 检查 ngrok 是否正常运行
- 检查本地服务是否正常
- 尝试重新启动 ngrok
- 检查网络连接

### 问题 3: 速度慢

**解决方案**:
- ngrok 免费版有速度限制
- 尝试选择不同的地区（在 ngrok 配置中）
- 升级到付费版

## 📝 示例

### 完整启动流程

```bash
# 终端 1: 启动本地服务
cd C:\Users\Lenovo\CodeBuddy\20260228200833
npm start

# 终端 2: 启动 ngrok
cd C:\ngrok
ngrok http 3000

# 复制显示的公网地址，分享给朋友
# 朋友访问: https://xxxx.ngrok-free.app?role=receiver
```

### 一键启动脚本（Windows）

创建 `start.bat`:
```batch
@echo off
echo 正在启动本地服务...
start cmd /k "npm start"
timeout /t 3
echo 正在启动 ngrok...
start cmd /k "ngrok http 3000"
echo 服务已启动！
pause
```

双击 `start.bat` 即可自动启动所有服务。

## 🎯 与其他方案对比

| 方案 | 成本 | 速度 | 稳定性 | 复杂度 |
|------|------|------|--------|--------|
| 本地 + ngrok | 免费 | 中 | 中 | 简单 |
| Railway | $5/月 | 快 | 高 | 中等 |
| Render | 免费 | 中 | 中 | 简单 |
| Replit | 免费 | 中 | 中 | 最简单 |

## 📚 更多资源

- [ngrok 官方文档](https://ngrok.com/docs)
- [ngrok Windows 安装指南](https://ngrok.com/docs/agent/windows)
- [项目 README](./README.md)

---

**提示**: 如需永久在线，建议使用 Railway 或 Render 等云平台。
