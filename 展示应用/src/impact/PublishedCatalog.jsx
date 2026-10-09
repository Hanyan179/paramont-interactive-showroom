import './published-catalog.css';

export function PublishedCatalog({ snapshot, urls, lang, onRead, onActivity, selected, setSelected }) {
  const t = (zh,en) => lang === 'zh' ? zh : en;
  const category = snapshot.categories.find(c => c.sourceId === selected);
  const products = selected ? snapshot.productsData.filter(p => p.categoryIds?.includes(selected) || p.categoryId === selected) : snapshot.productsData;
  function readProduct(product) {
    onActivity();
    onRead({ id: `published-product-${product.id}`, title: [product.name || '',product.name || ''], category: ['已发布产品','Published product'], status: ['真实产品资料快照','Product data snapshot'], summary: [product.description?.zh || '', product.description?.en || ''],
      cover: product.imageAssetId ? { src: urls[product.imageAssetId], caption: [product.name,product.name] } : undefined,
      sections: [{ id: 'details', title: ['产品资料','Product information'], blocks: [{ type: 'list', items: [
        [`货号：${product.number || '—'}`,`Item number: ${product.number || '—'}`], [`品牌：${product.brand || '—'}`,`Brand: ${product.brand || '—'}`], [`品类：${product.category || '—'}`,`Category: ${product.category || '—'}`],
      ] }] }], sources: [{ label: ['PDM 产品数据管理','PDM product data'], description: [snapshot.fetchedAt,snapshot.fetchedAt] }] });
  }
  return <section className="published-catalog" aria-label={t('真实品类与产品','Published categories and products')} onPointerDown={onActivity} onKeyDown={onActivity}>
    <header><p>{t('品类与产品','CATEGORIES & PRODUCTS')}</p><h1>{category?.name || t('探索我们的产品','Explore our products')}</h1>
      <p>{category?.description?.[lang] || t('以下为已选入并发布的真实产品资料。','Selected, published product records.')}</p></header>
    <nav aria-label={t('选择品类','Choose category')}><button aria-pressed={!selected} onClick={() => setSelected(null)}>{t('全部已发布产品','All published products')}</button>{snapshot.categories.map(c => <button key={c.sourceId} aria-pressed={selected === c.sourceId} onClick={() => setSelected(c.sourceId)}>{c.name}</button>)}</nav>
    {category?.coverAssetId && <img className="published-category-cover" src={urls[category.coverAssetId]} alt={category.name} />}
    <div className="published-product-grid">{products.map(p => <button key={p.id} className="published-product" onClick={() => readProduct(p)}>
      {p.imageAssetId ? <img src={urls[p.imageAssetId]} alt={p.name || ''} /> : <span className="published-no-image">{t('暂无图片','No image')}</span>}
      <strong>{p.name || t('未提供名称','Name unavailable')}</strong><span>{p.number || '—'}</span><small>{p.brand || '—'}</small>
    </button>)}</div>
    {!products.length && <p role="status">{t('这个范围尚未发布产品。','No products published in this selection.')}</p>}
    <p className="published-data-note">{t('已发布产品数量','Published products')}: {products.length} · {t('数据获取时间','Data retrieved')}: {snapshot.fetchedAt}</p>
  </section>;
}
