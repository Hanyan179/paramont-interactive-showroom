// One public navigation system. Overview model order is part of its scene contract.
export const showroomAreas = [
  { id: 'home', label: ['公司介绍', 'Company'], overview: ['公司介绍', 'Company introduction'] },
  { id: 'locations', label: ['工厂能力', 'Factory & supply'], overview: ['全球布局', 'Global presence'] },
  { id: 'products', label: ['品牌与产品', 'Brands & products'], overview: ['品牌与产品', 'Brands & products'] },
  { id: 'analytics', label: ['数据分析', 'Data analysis'], overview: ['数据分析', 'Data analysis'] },
];

export const explorerPages = ['brands', 'categories', 'products'];
export const isExplorerPage = page => explorerPages.includes(page);
export const activeArea = page => isExplorerPage(page) ? 'products' : page;

// Legacy experiments remain addressable; they are not additional showroom areas.
const routePages = {
  atlas: [...showroomAreas.map(area => area.id), 'brands', 'categories'],
  studio: ['home', 'brands'],
  gallery: ['home', 'categories'],
};

export function resolveRoute(hash) {
  const [requestedVariant = 'atlas', requestedPage = 'home'] = hash.replace(/^#\/?/, '').split('/');
  const variant = Object.hasOwn(routePages, requestedVariant) ? requestedVariant : 'atlas';
  return { variant, page: routePages[variant].includes(requestedPage) ? requestedPage : 'home' };
}
