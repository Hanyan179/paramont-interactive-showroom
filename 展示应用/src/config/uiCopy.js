const loadingLabels = {
  showroom: ['正在加载展厅', 'Loading the showroom'],
  products: ['正在加载品牌与产品', 'Loading brands & products'],
};

export function loadingMessage(lang, area = 'showroom') {
  return loadingLabels[area][lang === 'zh' ? 0 : 1];
}
