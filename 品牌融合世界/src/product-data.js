export const skusFor=(data,productId)=>(data?.skus||[]).filter(s=>s.productId===productId);
export function resolveSku(data,productId,skuId){const choices=skusFor(data,productId);return choices.find(s=>s.id===skuId)||choices[0]||null;}
export function categoryFor(data,product){return data.catalog.subcategories.find(c=>c.id===product.subcategoryId);}
export function productResults(data,{query='',categoryId='all',subcategoryId=null,brandId='all'}={}){
 const term=query.trim().toLowerCase();
 return data.items.flatMap(product=>{
  const category=categoryFor(data,product),parent=data.catalog.categories.find(c=>c.id===category?.parent),brand=data.brands?.find(b=>b.id===product.brandId),skus=skusFor(data,product.id);
  if(categoryId!=='all'&&category?.parent!==categoryId||subcategoryId&&product.subcategoryId!==subcategoryId||brandId!=='all'&&product.brandId!==brandId)return [];
  const productMatch=[product.id,...product.name,...product.topic,category?.name,parent?.name,...(parent?.label||[]),brand?.name].join(' ').toLowerCase().includes(term);
  const matching=skus.find(s=>[s.id,s.code,...s.name].join(' ').toLowerCase().includes(term));
  return productMatch||matching?[{product,sku:productMatch?skus[0]:matching,count:skus.length}]:[];
 });
}
