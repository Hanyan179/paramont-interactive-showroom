import {withCatalogLabels} from '../../共享组件/catalogLabels.js';
// Paths resolve relative to the module, including when mounted below another app.
export const asset = path => new URL(path.replace(/^\//,''), new URL('.', document.baseURI)).href;
export async function loadContent(){
 const [catalog,official,domains,concepts,media,variants]=await Promise.all(['catalog','official-content','domains','concepts','explorer-media','product-skus'].map(async file=>{const r=await fetch(asset(`shared/${file}.json`));if(!r.ok)throw Error(`Content unavailable: ${file}`);return r.json();}));
 return {catalog:withCatalogLabels(catalog),brands:official.brands,domains:domains.domains,items:concepts.items,media:media.items,skus:variants.items};
}
export const hasModel=(media)=>Boolean(media?.model);
export function availableViews(media){return [media?.model&&'model',media?.images?.length&&'photos',media?.video&&'video'].filter(Boolean);}
export function presentation(media,saved={}){const views=availableViews(media);return {...saved,mode:views.includes(saved.mode)?saved.mode:views.includes(media?.default)?media.default:views[0],photo:Math.max(0,Math.min(saved.photo||0,(media?.images?.length||1)-1))};}
// Display copy summarizes the verified brand scope; full evidence stays in shared data.
export const brandCopy={
 scentos:{descriptor:['香味创意文具','Scented creative stationery'],description:['将香味融入文具、画笔与创意美术用品，让色彩与感官一起参与创作。','Scented stationery, markers and creative art supplies bring color and the senses into everyday creativity.']},
 'sugar-rush':{descriptor:['糖果香味创作','Candy-inspired creativity'],description:['以糖果与甜点香味为灵感，呈现文具、创意套装、贴纸与礼品。','Stationery, creative kits, stickers and gifts inspired by candy and dessert scents.']},
 'clean-colouring':{descriptor:['洁净涂色','A cleaner coloring experience'],description:['香味技术结合画笔、颜料与纸品，让涂色创作更整洁。','Scent technology meets pens, paints and paper designed to reduce coloring mess.']},
 influencer:{descriptor:['创作者设计系列','Creator design collections'],description:['与内容创作者共同参与产品设计，将个人创意带入产品系列。','Product design collaborations bring content creators’ ideas into product collections.']},
 'yay-hooray':{descriptor:['木质玩具与游戏','Wooden toys & games'],description:['木质玩具、游戏、拼图与手作，延伸到充满探索乐趣的户外玩耍。','Wooden toys, games, puzzles and crafts extend into outdoor play and discovery.']}
};
const brandPillars={
 scentos:[['香味体验','Scent experience'],['色彩表达','Color expression'],['创意美术','Creative art']],
 'sugar-rush':[['糖果香味','Candy scents'],['创意套装','Creative kits'],['趣味礼赠','Playful gifts']],
 'clean-colouring':[['香味技术','Scent technology'],['整洁涂色','Cleaner coloring'],['画笔与纸品','Pens & paper']],
 influencer:[['创作者参与','Creator involvement'],['产品设计','Product design'],['个性表达','Individual expression']],
 'yay-hooray':[['木质玩具','Wooden toys'],['拼图与手作','Puzzles & crafts'],['户外玩耍','Outdoor play']]
};
for(const [id,pillars] of Object.entries(brandPillars))brandCopy[id].pillars=pillars;
