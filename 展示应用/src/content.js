export const variants = [
  { id: 'atlas', name: ['深蓝地平线', 'Sapphire Atlas'], label: ['空间与全球布局', 'Space & global presence'], page: 'locations', pageLabel: ['全球布局', 'Global presence'], theme: 'dark' },
  { id: 'studio', name: ['创意造物场', 'Creative Matter'], label: ['品牌与专属样品', 'Brands & collections'], page: 'brands', pageLabel: ['品牌探索', 'Explore brands'], theme: 'light' },
  { id: 'gallery', name: ['无限灵感廊', 'Infinite Editions'], label: ['品类与产品探索', 'Categories & discovery'], page: 'categories', pageLabel: ['品类探索', 'Explore categories'], theme: 'gallery' },
];

export const fallbackContent = {
  settings: { idleSeconds: 90, slideSeconds: 12 },
  locations: [
    { id: 'china', name: ['中国', 'China'], lat: 35, lng: 104, city: '', type: '', description: '', media: [] },
    { id: 'cambodia', name: ['柬埔寨', 'Cambodia'], lat: 12.6, lng: 104.9, city: '', type: '', description: '', media: [] },
    { id: 'usa', name: ['美国', 'United States'], lat: 38, lng: -98, city: '', type: '', description: '', media: [] },
  ],
  brands: [
    { id: 'scentos', name: 'Scentos', descriptor: ['香味创意文具', 'Scented creativity'], description: ['围绕香味文具、画笔与创意美术用品展开。', 'Scented stationery, markers and creative art materials.'], color: '#b8d4d5', image: 'a1-markers.png', logo: 'logo-scentos.png' },
    { id: 'sugar-rush', name: 'Sugar Rush', descriptor: ['糖果香味创作', 'A sweeter kind of creativity'], description: ['以糖果与甜点气味为灵感的文具与创意套装。', 'Stationery and creative kits inspired by candy and dessert scents.'], color: '#dbc4c2', image: 'b2-paper-kit.png', logo: 'logo-sugar-rush.png' },
    { id: 'clean-colouring', name: 'Scentos Clean Colouring', descriptor: ['洁净涂色', 'Clean colouring'], description: ['将香味技术与减少涂色脏乱的画笔、颜料及纸张结合。', 'Scent technology meets mess-conscious markers, paint and paper.'], color: '#bbcedf', image: 'a3-paper-mountains.png', logo: 'logo-clean-colouring.png' },
    { id: 'influencer', name: 'The Influencer Initiative', descriptor: ['创作者合作', 'Made with creators'], description: ['与内容创作者协作的产品设计系列。', 'Product design collections developed with content creators.'], color: '#bdc3d3', image: 'a2-sketchbook.png', logo: 'logo-influencer.png' },
    { id: 'yay-hooray', name: 'YAY HOORAY!', descriptor: ['木质玩具与游戏', 'Play comes naturally'], description: ['木质玩具、游戏、拼图、手工与户外玩耍。', 'Wooden toys, games, puzzles, crafts and outdoor play.'], color: '#d7ccba', image: 'b1-wooden-arches.png', logo: 'logo-yay-hooray.png' },
  ],
  samples: [
    { id: 'sample-01', brand: 'scentos', category: 'stationery', name: ['画笔 · 材质探索', 'Markers · material study'], image: 'a1-markers.png', video: '/media/generated/concept-film.mp4' },
    { id: 'sample-02', brand: 'influencer', category: 'paper', name: ['纸本 · 日常灵感', 'Paper · everyday ideas'], image: 'a2-sketchbook.png' },
    { id: 'sample-03', brand: 'clean-colouring', category: 'craft', name: ['纸艺 · 山峰构成', 'Paper craft · mountain forms'], image: 'a3-paper-mountains.png' },
    { id: 'sample-04', brand: 'yay-hooray', category: 'toys', name: ['木作 · 平衡游戏', 'Wood · balance & play'], image: 'b1-wooden-arches.png' },
    { id: 'sample-05', brand: 'sugar-rush', category: 'craft', name: ['礼盒 · 创作时刻', 'Creative kit · a moment to make'], image: 'b2-paper-kit.png' },
    { id: 'sample-06', brand: 'scentos', category: 'stationery', name: ['色彩 · 触感实验', 'Colour · a tactile study'], image: 'b3-crayons.png' },
  ],
  categories: [
    { id: 'all', name: ['全部', 'All'] }, { id: 'stationery', name: ['创意文具', 'Stationery'] },
    { id: 'paper', name: ['纸品', 'Paper goods'] }, { id: 'craft', name: ['创意手工', 'Crafts'] }, { id: 'toys', name: ['玩具与游戏', 'Toys & games'] },
  ],
};

export const asset = (file) => `/media/generated/${file}`;
