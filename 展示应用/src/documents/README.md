# 展厅文档内容维护

阅读器由 DocumentReader.jsx 统一展示。四区入口在 App.jsx 解析本地内容，不创建另一套导航或业务系统。

## 替换资料

`public/data/reading-documents.json` 为文档 ID → 内容覆盖的映射；默认空对象。按需覆盖 title、summary、status、category、author、updated、cover、sections、sources、attachments。刷新页面后加载；这里只维护展示版本，原文件放素材收集/08_展示文档。

默认 ID：公司 company-introduction；分析 analysis-0 至 analysis-3；地点 location-地点ID-章节ID-展点ID（总览为 overview）；产品 product-产品ID-款式ID。阅读器 DOM 的 data-document 标明当前精确 ID。

中英文使用 [中文, English] 数组，也支持 {zh, en}。updated 使用真实日期字符串，不自动填当前日期。status 标注来源或概念性质；未确认资料不可标为正式成果。

sections 中每节有 id、title、blocks。blocks 严格按顺序混排：

```json
{
  "analysis-1": {
    "title": ["品类研究", "Category research"],
    "author": ["已确认的作者", "Confirmed author"],
    "status": ["研究方法示意", "Approach study"],
    "sections": [{
      "id": "research",
      "title": ["发现与依据", "Findings and evidence"],
      "blocks": [
        {"type": "paragraph", "text": ["第一段正文", "First paragraph"]},
        {"type": "image", "src": "/media/generated/a2-sketchbook.png", "caption": ["视觉概念图", "Visual concept"]},
        {"type": "paragraph", "text": ["图片之后的正文", "Text after the image"]},
        {"type": "gallery", "images": [
          {"src": "/media/generated/a1-markers.png", "caption": ["示意图一", "Study one"]},
          {"src": "/media/generated/b1-wooden-arches.png", "caption": ["示意图二", "Study two"]}
        ]}
      ]
    }]
  }
}
```

也兼容每节 paragraphs、items、images 的简版配置。多图相册最多每行三张；图片可点开、前后切换、按钮缩放与双击缩放。来源为 `{label:[中,英],url,description:[中,英]}`；附件为 `{title:[中,英],format:"PDF",url:"/documents/实际文件.pdf"}`。文件确实放入 public/documents 后再配置链接，不能添加不存在的空附件。附件使用浏览器打开原文件；Office 等格式可能下载，不是当前阅读器的原生格式。

正文以文本组件渲染，不执行 HTML。文件和图片链接只接受站内绝对路径及 http/https；现场离线内容应全部使用站内文件。

预计阅读时间：中文 400 字/分钟、英文 200 词/分钟，图片每张 10 秒，至少 1 分钟；只算当前语言、已配置的正文和图片。这个数值不是退出期限。阅读期间父展厅 blocked，嵌入模块 visibility=false，背景区域 inert；关闭恢复选择与阅读位置。
