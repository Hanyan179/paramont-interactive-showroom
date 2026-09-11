// 展厅与产品模块共用。修改后刷新开发页；交付版需依次重新构建产品模块和主展厅。
// 临时比较：/?quality=fluid、/?quality=exhibition、/?quality=studio。
// 未设置的字段继承所选档位。参数含义、范围和模型清单见 docs/画质与模型维护.md。
export default {
  preset: 'exhibition', // fluid 流畅 / exhibition 展厅 / studio 精修
  render: {
    // maxPixels: 8294400, // 三维画布像素预算，3840 × 2160；不影响文字分辨率
    // maxDpr: 2,
    // shadowMapSize: 2048,
    // ao: true,         // 区域近景接触阴影；保留总览原有光影构图
    // bloom: 0.22,      // 主展厅发光强度；产品模块没有额外泛光后期
    // exposure: 0.96,
    // environment: 1,  // 相对各场景原有环境反射强度
  },
  models: {
    // 示例：monument: { geometry: 1.5, surfaceDetail: true, surfaceStrength: 0.28 },
    // geometry 是相对原模型曲面细分的倍率，不是目标总面数。
    monument: {},
    story: {},
    globe: {},
    samples: {},
    china: {},
    cambodia: {},
    usa: {},
    news: {},
    analytics: {},
    // 产品公共设置；单款可用同名字段覆盖。
    products: {},
    lipstick: {}, serum: {}, compact: {}, rings: {},
    maraca: {}, puzzle: {}, balloon: {}, gift: {},
  },
};
