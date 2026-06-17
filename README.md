# 玄关天气泡泡

一个面向玄关 kiosk 屏的轻量信息面板原型。首版只保留三个必要模块：

- 日期时间
- 天气
- 出门一句话

界面使用 Matter.js 做泡泡碰撞和缓慢漂浮，React 渲染信息内容，Motion 处理 DOM 动效。

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：

```txt
http://127.0.0.1:5173
```

## 生产预览

```bash
npm run build
npm run serve
```

默认生产预览地址：

```txt
http://127.0.0.1:4173
```

## Debian + Sway + Chromium Kiosk

推荐在设备上使用生产构建运行：

```bash
cd kiosk-dashboard
npm install
npm run build
PORT=4173 HOST=127.0.0.1 npm run serve
```

然后启动 Chromium：

```bash
chromium --kiosk http://127.0.0.1:4173
```

如果要在 Sway 启动时自动运行，可以把服务和浏览器命令放进 Sway 配置或 systemd user service。建议先手动确认屏幕分辨率、GPU 加速和字体渲染效果，再做开机自启。

## 数据入口

当前天气和建议是 mock 数据，集中在：

```txt
src/data/dashboard.ts
```

后续接真实天气 API 时，优先替换这一层，不需要改泡泡布局和物理系统。
