# 🎤 CGT48-谭思慧 唱歌切片收藏馆

<p align="center">
  <a href="https://tsh.abm48.com/">
    <img src="https://img.shields.io/badge/Live-点击访问网站-ff6b81?style=for-the-badge&logo=safari" alt="Website">
  </a>
  <a href="https://gitee.com/albert-chen04/video-editing-toolkit">
    <img src="https://img.shields.io/badge/Tools-桌面版剪辑软件-409EFF?style=for-the-badge&logo=python" alt="Tools">
  </a>
</p>

这是一个为 **CGT48 成员谭思慧** 建立的个人应援档案站。

项目核心是基于**直播唱歌切片文本记录**，自动生成一个可检索、可追溯、可下载的歌曲归档库。同时包含成员简介、上传后台等功能。

## 📸 界面预览

| 日期归档墙 | 切片检索与列表 | 成员简介 | 上传后台 |
| :---: | :---: | :---: | :---: |
| <img src="screenshots/screenshot1.png" width="300" alt="日期归档" /> | <img src="screenshots/screenshot2.png" width="300" alt="切片列表" /> | <img src="screenshots/screenshot3.png" width="300" alt="成员简介" /> | <img src="screenshots/screenshot4.png" width="300" alt="上传后台" /> |

## ✨ 核心功能

### 1. 🗂️ 归档与检索
*   **多视图浏览**: 提供 **"日历归档墙"** 和 **"瀑布流列表"** 两种模式，支持按日期快速回溯。
*   **毫秒级搜索**: 纯前端实现，支持输入 **歌名** 或 **日期** (如 `2025-12-08`) 实时过滤。
*   **双站联动**: 一键复制 `歌名+日期` 组合关键词，并自动跳转至 [小偶像音乐站](https://abm48.com)，实现"查到即听到"。

### 2. 🔄 自动化数据流
*   **自动更新**: 服务器端配置了自动化脚本。只需上传 `.txt` 切片记录文件，网站数据会在 1 分钟内自动解析并更新，无需重新编译前端。
*   **批量下载**: 支持将搜索结果对应的源 `.txt` 文件批量打包下载。

### 3. 👤 成员简介
*   **API 数据**: 调用后端 API 获取成员基本信息、总选排名等数据。
*   **图片预览**: 支持头像等图片的全屏预览查看。

## 🛠️ 技术栈

*   **核心框架**: Vue 3 + Vite
*   **UI 组件库**: Element Plus
*   **后端**: PHP (提供 profile、upload 等 API)
*   **数据脚本**: Node.js (服务端自动化解析生成 `data.json`)
*   **工具库**: JSZip (文件打包)

## 🚀 快速开始

### 环境配置

项目需要一个 `.env` 文件来配置后端 API 地址。在项目根目录创建 `.env` 文件：

```bash
# .env
# 后端 API 地址（开发环境指向本地 PHP 服务）
VITE_API_BASE_URL=http://localhost:8000
```

如果不创建 `.env` 文件，Vite 开发服务器会使用默认的代理配置，将 `/profile.php` 等请求转发到 `http://localhost:8000`。

### 本地开发

1.  **克隆项目**
    ```bash
    git clone [项目地址]
    cd tsh-fansite
    ```

2.  **创建 .env 文件**（参照上方「环境配置」）

3.  **安装依赖**
    ```bash
    npm install
    ```

4.  **准备数据**
    *   将切片记录 `.txt` 文件放入 `scripts/txt_source/` 目录。
    *   运行脚本生成数据：
    ```bash
    npm run gen
    ```

5.  **启动 PHP 后端**（如果需要简介、上传功能）
    ```bash
    php -S localhost:8000
    ```

6.  **启动前端服务**
    ```bash
    npm run dev
    ```

## 📦 部署说明

本项目为纯静态网站，但为了支持 **FFmpeg.wasm** 的多线程特性，服务器 (**Nginx**) 必须配置特定的响应头 (COOP/COEP)。

### 推荐 Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /www/wwwroot/your-project;
    index index.html;

    # 1. 核心：为所有 HTML/JS/CSS 添加跨域隔离头，否则 FFmpeg 无法启动
    add_header Cross-Origin-Opener-Policy same-origin always;
    add_header Cross-Origin-Embedder-Policy require-corp always;

    # 2. 正确处理 .wasm 文件类型
    location ~ \.wasm$ {
        default_type application/wasm;
    }

    # 3. PHP 后端转发
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # 4. 防止 Vue 路由刷新 404
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 自动化更新数据配置 (Linux/宝塔)

1.  在服务器安装 Node.js。
2.  设置计划任务（Cron Job），每分钟执行一次生成脚本：
    ```bash
    /path/to/node /www/wwwroot/your-project/scripts/gen-data.js
    ```
3.  只需通过 FTP 上传新的 TXT 文件，网站即可自动更新。

## 🌿 分支说明

| 分支 | 说明 |
| :---: | :--- |
| **lite** | 当前维护分支，去掉了在线剪辑功能，主打轻量。**以后只更新此分支** |
| main | 旧版主分支，包含 Web 端在线剪辑功能（已停止维护） |

## ✂️ 关于剪辑

本项目已移除 Web 端批量剪辑功能，如需使用剪辑工具：

*   **[在线批量剪辑 (Web版)](https://gitee.com/albert-chen04/tools-site)**: 独立的 Web 剪辑项目，支持切片本导入、批量剪切。
*   **[桌面版剪辑软件](https://gitee.com/albert-chen04/video-editing-toolkit)**: 功能更强大的 Python 桌面版，支持切片本一键导入剪切。

## 🔗 相关项目

*   **[Tools Site](https://gitee.com/albert-chen04/tools-site)**: Web 版在线批量剪辑工具（独立项目）。
*   **[Video Editing Toolkit](https://gitee.com/albert-chen04/video-editing-toolkit)**: 桌面版剪辑软件原身，功能更强大。
*   **[Albert Music Frontend](https://abm48.com)**: 关联的音乐网站。
*   **[Singing Detector](https://gitee.com/albert-chen04/singing_detector)**: 弹幕唱歌检测工具。

## ❤️ 致谢

感谢谭思慧每天带来的动听歌声。