# 将探索模块接入其他展厅

模块使用隔离的 iframe，宿主展厅保留自己的视觉、导航和公司内容。无需把三维依赖、样式或页面状态合并进宿主。已经在 5178 的产品探索入口实际接入。模块内部仅有品牌、品类、产品三块，公司介绍与合作案例由宿主展示。

## 1. 放置同一份离线模块

在本模块目录构建、校验并导出到目标应用的静态资源目录：

```sh
npm run check
npm run build
node scripts/export-module.mjs /absolute/path/to/other-app/public/modules/product-explorer
```

导出目录内部的所有文件需要保留。入口使用明确的 `index.html`，避免开发服务器把目录路径回退到宿主首页。

导出是构建快照。共享数据的维护入口仍是 `../共享数据`；其他展厅不应各自修改导出目录里的 JSON。更新内容后重新构建和导出。脚本只清理其上一次清单记录的文件，保留其他文件。

## 2. React 宿主

将本目录的 `ProductExplorer.jsx` 与 `ProductExplorer.css` 一起放到宿主的组件目录：

```jsx
<ProductExplorer
  open={exploring}
  lang={language}
  onLanguage={setLanguage}
  onClose={() => setExploring(false)}
  src="/modules/product-explorer/index.html"
/>
```

始终挂载组件，通过 `open` 控制显示，才能保留探索状态。父页面内容在打开期间设为 `inert`，并暂停父页面自动展示；不要清空章节、位置、筛选或选中项。关闭后恢复原来的宿主导航状态。5178 的 `src/App.jsx` 已采用这一做法。

组件支持加载反馈、15 秒后重试入口、语言同步、返回与来源校验。`src` 也可使用另一受控本地端口，但离线交付推荐同源目录。不要写死 5208。

## 3. 普通网页或其他框架

使用相同 iframe 和消息契约即可，不需要 React。

```js
const moduleUrl = new URL('/modules/product-explorer/index.html', location.href);
moduleUrl.searchParams.set('embed', '1');
moduleUrl.searchParams.set('parentOrigin', location.origin);
moduleUrl.searchParams.set('lang', 'zh');
iframe.src = moduleUrl.href;
iframe.allow = 'fullscreen';
iframe.referrerPolicy = 'strict-origin-when-cross-origin';

const send = (type, payload = {}) => iframe.contentWindow.postMessage({
  channel: 'paramont-explorer', version: 1, type, ...payload
}, moduleUrl.origin);

window.addEventListener('message', event => {
  if (event.origin !== moduleUrl.origin || event.source !== iframe.contentWindow) return;
  const message = event.data;
  if (message?.channel !== 'paramont-explorer' || message.version !== 1) return;
  if (message.type === 'ready') send('visibility', { visible: true });
  if (message.type === 'close') {
    send('visibility', { visible: false });
    iframe.hidden = true;
    // 恢复宿主页面先前的状态和焦点。
  }
  if (message.type === 'language' && ['zh', 'en'].includes(message.language)) {
    // 将合法语言值同步给宿主。
  }
});
```

再次打开时显示同一 iframe，并发送 `visibility: true`。需要主动切换语言时发送 `language` 消息；不通过改写 iframe 的 `src` 同步语言，否则会丢失状态。不要移除父来源参数或限制 referrer 为 `no-referrer`，否则跨来源握手会被拒绝。

| 消息 | 方向 | 内容 |
| --- | --- | --- |
| ready | 模块 → 宿主 | 模块内容与场景已就绪 |
| close | 模块 → 宿主 | 请求返回宿主，宿主自己决定恢复哪一页 |
| language | 双向 | `language: 'zh'` 或 `'en'` |
| visibility | 宿主 → 模块 | `visible: true / false`，控制动画和自动展示 |
| state | 模块 → 宿主 | 当前 hash 路径、领域和产品选择，供宿主记录 |

模块仅接受父窗口、已校验来源以及契约版本匹配的消息。宿主也需要双重检查 `event.source` 和 `event.origin`，不要接受任意页面请求关闭或跳转。

## 4. 可用的初始内容位置

可给入口附加 `#/beauty`、`#/play`、`#/party`，或 `#/party/gift` 这样的现有产品路径；也支持 `#/play/rings/rings-02` 和 `#/party/gift/gift-02` 直达具体款式。所有导航发生在 iframe 内；宿主 URL 和宿主选中状态由宿主管理。

当前场景是 8 个精选概念的编排。增加更多真实产品时，要同时扩充产品资料与关系依据；增加新的场景物件还需在 `src/scene.js` 中安排构图。图片媒介通过 `explorer-media.json` 配置；没有模型时设 `model: null`，默认使用图片，不需要生成虚假的模型。

模型项当前引用本项目程序模型；没有宣称已经支持任意 GLB 文件上传。首版也没有后台或产品关系编辑器。

## 产品与款式数据

新共享文件 `product-skus.json` 通过 `productId` 指向 `concepts.json.items` 中的产品。每个款式携带独立媒介与演示编号；礼盒款式均无模型。`state.selection` 新增可选 `sku` 字段，原 `domain`、`product` 与消息版本继续保留。已有产品路径继续有效；非法或跨产品款式参数回到该产品的第一款，不跨产品选择。

所有当前款式为概念。真实资料接入时，应同时维护产品身份、真实编号、品牌依据与媒介，不把演示编号或配色当成真实供货规格。
