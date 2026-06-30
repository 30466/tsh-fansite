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

| 日期归档墙 | 切片检索与列表 | 日历归档墙 | 成员简介 | 上传后台 |
| :---: | :---: | :---: | :---: | :---: |
| <img src="screenshots/screenshot1.png" width="300" alt="日期归档" /> | <img src="screenshots/screenshot2.png" width="300" alt="切片列表" /> | <img src="screenshots/screenshot3.png" width="300" alt="切片列表" /> | <img src="screenshots/screenshot4.png" width="300" alt="成员简介" /> | <img src="screenshots/screenshot5.png" width="300" alt="上传后台" /> |

## ✨ 核心功能

### 1. 🗂️ 归档与检索
*   **多视图浏览**: 提供 **"日历归档墙"** 和 **"瀑布流列表"** 两种模式，支持按日期快速回溯。
*   **毫秒级搜索**: 纯前端实现，支持输入 **歌名** 或 **日期** (如 `2025-12-08`) 实时过滤。
*   **双站联动**: 一键复制 `歌名+日期` 组合关键词，并自动跳转至 [小偶像音乐站](https://abm48.com)，实现"查到即听到"。

### 2. 🔄 自动化数据流
*   **自动更新**: 服务器端配置了自动化脚本。只需上传 `.txt` 切片记录文件，网站数据会在 1 分钟内自动解析并更新，无需重新编译前端。
*   **批量下载**: 支持将搜索结果对应的源 `.txt` 文件批量打包下载。

### 3. 👤 成员简介
*   **API 数据**: 通过 `profile.php` 后端代理调用 [abm48.com](https://abm48.com) 公开 API 获取成员基本信息、总选排名等数据。
  - 名称→ID 映射：`GET https://abm48.com/api/public/snh48/mapping`
  - 成员详情：`GET https://abm48.com/api/public/snh48/members/{id}`
  - 总选排名：`GET https://abm48.com/api/public/snh48/members/{id}/election-ranks`
*   **图片预览**: 支持头像等图片的全屏预览查看。

### 4. ✂️ 一键剪切

*   **在线直接剪切**：从直播回放中直接裁剪歌曲片段，无需下载完整录播
*   **CDN + 直连双路竞速**：每个分片同时从 `/cdn` 代理和直连两路发起请求，
    `Promise.any` 取最先成功的，失败自动重试
*   **阶梯重试**：最多重试 5 次，超时逐次递增（5s → 5s → 5s → 8s → 10s），
    应对网络波动
*   **滑动窗口 Worker Pool**：并非简单分批，而是所有 Worker 通过原子索引竞争取任务，
    空闲 Worker 自动接手，最大化利用并发
*   **并发可调**：支持调节同时下载的分片数（5~30，步进 5），默认 15
*   **剪切策略**：优先 `-c copy` 快速无损剪切，失败则回退重编码
*   **FFmpeg 健康自愈**：每次剪切后检查实例状态，异常自动重建
*   **取消中止**：剪切过程中可随时中止，立即停止所有下载请求

## 🛠️ 技术栈

*   **核心框架**: Vue 3 + Vite
*   **UI 组件库**: Element Plus
*   **后端**: PHP (提供 profile、upload 等 API)
*   **数据脚本**: Node.js (服务端自动化解析生成 `data.json`)
*   **工具库**: JSZip (文件打包)、@ffmpeg/ffmpeg (浏览器端 FFmpeg)

## 🚀 快速开始

### 环境配置

项目需要创建一个 `.env` 文件存放上传管理密码（由 `upload.php` 后端读取校验）。

在项目根目录创建 `.env` 文件：

```bash
# .env
# 上传后台管理密码（upload.php 读取此变量校验，前端不可见）
UPLOAD_PASSWORD=your_password_here
```

如果不创建此文件或未设置 `UPLOAD_PASSWORD`，上传页面将无法使用。

### 本地开发

1.  **克隆项目（lite 分支）**
    ```bash
    git clone -b lite [项目地址]
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
    add_header Cross-Origin-Embedder-Policy credentialless always;

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

    # 4. 音乐站 API 代理（搜索、音频流、歌曲详情）——如服务器已配置可省略
    location /api/ {
        proxy_pass https://abm48.com/api/;
        proxy_set_header Host abm48.com;
        proxy_ssl_server_name on;
        proxy_cache off;
    }

    # 5. 工具站 API 代理（成员映射、录播列表、M3U8 等）
    location /tools-api/ {
        proxy_pass https://tools.abm48.com/;
        proxy_set_header Host tools.abm48.com;
        proxy_ssl_server_name on;
        proxy_cache off;
    }

    # 5. CDN 代理（剪切下载 TS 分片用）
    location /cdn/ {
        proxy_pass https://idol-vod.48.cn/;
        proxy_set_header Host idol-vod.48.cn;
        proxy_set_header Origin https://h5.48.cn;
        proxy_set_header Referer https://h5.48.cn/;
        proxy_ssl_server_name on;
        proxy_cache off;
    }

    # 6. source.48.cn 代理（封面图片 / 弹幕文件下载用）
    location /source48/ {
        proxy_pass https://source.48.cn/;
        proxy_set_header Host source.48.cn;
        proxy_set_header Referer https://live.48.cn/;
        proxy_ssl_server_name on;
        proxy_cache off;
    }

    # 7. 防止 Vue 路由刷新 404
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🌿 分支说明

| 分支 | 说明 |
| :---: | :--- |
| **lite** | 当前维护分支，支持在线一键剪切。**以后只更新此分支** |
| main | 旧版主分支，包含 Web 端在线剪辑功能（已停止维护） |

## ✂️ 关于剪辑

本站提供两种剪切方式：

**「一键剪切」**：在歌曲卡片上直接剪切单首歌曲片段
*   点击按钮即可从直播回放中直接裁剪对应歌曲片段，下载到本地
*   支持调节并发数、CDN + 后端 + 直连 **三路竞速**下载、5 次阶梯重试
*   使用 FFmpeg.wasm 在浏览器端完成剪切，无需服务器处理

**「批量剪切」**：在录播回放页面导入切片本，批量处理多片段
*   入口：导航栏 **口袋48 → 录播回放** → 选择录播 → 右侧 Tab "批量剪切"
*   支持导入 TXT 切片本（`名称:`/`开始:`/`结束:` 格式）
*   每个片段依次下载分片 → 剪切 → 立即下载，全部在浏览器完成

## 🔗 相关项目

*   **[Tools Site](https://gitee.com/albert-chen04/tools-site)**: Web 版在线批量剪辑工具（独立项目）。
*   **[Video Editing Toolkit](https://gitee.com/albert-chen04/video-editing-toolkit)**: 桌面版剪辑软件原身，功能更强大。
*   **[Albert Music Frontend](https://abm48.com)**: 关联的音乐网站。
*   **[Singing Detector](https://gitee.com/albert-chen04/singing_detector)**: 弹幕唱歌检测工具。

## ❤️ 致谢

感谢谭思慧每天带来的动听歌声。