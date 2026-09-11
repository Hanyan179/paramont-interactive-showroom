// Resolve a requested sample only against loaded records. Never fall back to
// another product when the requested sample or its style is unavailable.
export function resolveExplorerTarget(message,items=[],skus=[]){
 if(message.section!=='products'||message.view!=='room'||typeof message.productId!=='string')return null;
 const product=items.find(p=>p.id===message.productId);if(!product)return null;
 const sku=skus.find(s=>s.id===message.skuId&&s.productId===product.id);
 if(message.skuId&&!sku)return null;
 return {mode:'detail',domain:product.domain,product:product.id,sku:sku?.id||null};
}
