# 分支、开发与验收边界

本文只依据仓库中已经公开的源码与说明整理，不复制企业工作簿或扩充业务数据。核对基线：`main@29719ee1a6053fa9bdc05891b04927d8c671f161`；第二版参考 `design-v2@14505ca88cc398aee858cb748312df0655e7cf91`。本次文档检查未运行安装、构建、测试或打包。

## 分支地图

| 分支 | 用途与边界 |
| --- | --- |
| main | 默认分支，保留第一版检查点；主 README 的旧交接记录继续保留 |
| design-v2 | 已存在的第二版工作线，含 Windows 离线打包脚本；以该分支自身文件为准 |
| codex/open-source-readiness-20261003 | 从 main 创建的文档准备分支，不包含 design-v2 的代码合并 |

第二版入口：[固定提交 README](https://github.com/Hanyan179/paramont-interactive-showroom/blob/14505ca88cc398aee858cb748312df0655e7cf91/README.md)。切换前先保存自己的修改，检查已有本地/远端分支；不要直接照历史 `git switch -c design-v2` 命令重复建分支。

## 组件地图

```text
根 package.json 编排
  ├─ 品牌融合世界：React + Three.js 产品模块
  │    build → dist → scripts/export-module.mjs
  │                   ↓ 展示应用/public/modules/product-explorer
  └─ 展示应用：React + Three.js 主展厅
       src/config → 四区/导航/展示配置
       src/components + interaction + documents + impact → 界面与交互
       build → 展示应用/dist/client + Sites 适配产物
共享组件 → 两端画质、帧循环、导航协议
共享数据 → 相对符号链接与共用内容
官网采集 → 公司事实来源记录
```

进一步见 [开发与扩展指南](../展示应用/docs/开发与扩展指南.md)。嵌入模式只保留主展厅的全局导航和巡展控制，产品模块保留自己的款式、筛选及媒体状态。

## 环境与启动

根 [package.json](../package.json) 要求 Node `>=22`；两个应用锁定的 React 插件要求 `^20.19.0 || >=22.12.0`，组合使用时至少需要 Node 22.12。根未固定 npm 版本，安装按两个子目录的锁文件执行。

```sh
npm run setup
npm run build
npm run dev
```

`setup` 顺序执行两个子项目的 `npm ci`。根 `dev` 调用主展厅 `dev:lan`，监听 `0.0.0.0:5183`，会允许网络接口上的连接；仅本机开发可改用下述一次性参数，不改仓库配置：

```sh
npm --prefix 展示应用 run dev -- --host 127.0.0.1 --port 5183 --strictPort
```

访问 `http://127.0.0.1:5183/?quality=exhibition#/atlas/home`。`studio`、`exhibition`、`fluid` 为已有画质参数；没有外部 AI 服务接入承诺。Vite 开发服务和模块的开发期截图写入接口不是经过加固的生产服务，请勿直接暴露公网。

源码中的共享数据采用符号链接；macOS/Linux 保持目录结构，Windows 开发需正确检出符号链接。共享资源丢失时先检查链接和相邻目录，不能通过拷入新的私密原始工作簿来绕过。

## 配置与构建

当前 main 没有统一 `.env.example` 或集中服务器秘密配置。导航、区域、展示节奏和画质分别在 `展示应用/src/config/`、`共享组件/qualityConfig.js` 等源码中；静态内容在 public 与共享数据中。放入前端构建的字段均可被访问者读取，不要放密钥。

根 `build` 的顺序是产品模块构建 → 导出模块 → 主展厅构建，成品位于 `展示应用/dist/client/`。导出脚本按上次清单替换生成文件，不能用它维护手写源码。

```sh
npm test
npm run build
npm run preview
```

根 preview 在 `127.0.0.1:5183` 预览成品，不能与占用该端口的开发服务同时运行。静态成品需 HTTP 服务，不能直接双击 HTML。GitHub 代码提交不构成网站部署。

## 测试的实际范围

根 `npm test` 运行产品数据/探索检查与产品目录测试、主展厅 Node 测试、内容校验。命令定义见两个应用的 package.json；本仓库未宣称统一端到端自动验收覆盖全部设备。

浏览器人工回归应记录首页/四区/产品详情/返回、双语、拖动与点击区分、首次唤醒、暂停恢复、资源失效和视口。历史 [触摸回归记录](../展示应用/docs/首页与触摸回归记录.md) 与新提交结果需分开。真实 Windows 启动、墙面触摸校准、4K 观看与持续运行需在目标硬件单独确认。

## design-v2 的 Windows 打包

`package:windows` 只在已核对的 design-v2 中出现，main 没有该命令。该分支文档描述 macOS/Linux 构建、便携 Node 运行时、Windows x64 的 START/VERIFY 和 settings 文件。打包会联网取运行时并生成较大产物，需要单独核对来源、校验与再分发文件；本次未执行，也未验证外部下载是否可用。

目标设备与限制应读 [design-v2 使用说明](https://github.com/Hanyan179/paramont-interactive-showroom/blob/14505ca88cc398aee858cb748312df0655e7cf91/展示应用/scripts/offline/使用说明.txt)。文档或制作环境验证不等于 Windows 实机和触摸大屏验收。离线页面资源与外链/办公附件的软件需求也应分别检查。
