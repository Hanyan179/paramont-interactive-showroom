// The embedded explorer and its host share one set of local navigation intents.
export const explorerViews = [
  {id:'room', label:['样品空间','Sample room']},
  {id:'brands', label:['品牌档案','Brands']},
  {id:'categories', label:['品类目录','Categories']},
  {id:'products', label:['产品目录','Products']},
];
export const isExplorerView = view => explorerViews.some(item=>item.id===view);
export const sectionForView = view => view==='room'?'products':view;
export function resolveExplorerView(section, view) {
  if(isExplorerView(view)&&sectionForView(view)===section)return view;
  return section==='products'?'room':isExplorerView(section)?section:'room';
}
