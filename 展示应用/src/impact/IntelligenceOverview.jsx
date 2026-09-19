import {ArrowUpRight} from '@phosphor-icons/react';
import {intelligenceProposals} from './intelligenceProposalsContent.js';

export function IntelligenceOverview({lang,playing,onSelect,scheme='A'}){
  const l=lang==='zh'?0:1;
  const proposal=intelligenceProposals.find(item=>item.id===scheme)||intelligenceProposals[0];
  return <section className="intelligence-overview" lang={lang} aria-label={['智能与洞察 · 全局总览','Intelligence & insights · Overview'][l]}>
    <div className="intelligence-overview-copy">
      <p className="intelligence-overview-eyebrow">{['智能与洞察','INTELLIGENCE & INSIGHTS'][l]}</p>
      <h1>{proposal.title[l]}</h1>
      <p className="intelligence-overview-description">{proposal.description[l]}</p>
      <span className="intelligence-overview-signature">PRODUCTS. KNOWLEDGE. POSSIBILITY.</span>
      <button className="intelligence-overview-explore exhibit-action" onClick={()=>onSelect?.('impact')}>{['探索智能与洞察','Explore the intelligence'][l]}<ArrowUpRight aria-hidden="true"/></button>
    </div>
    <div className="intelligence-overview-caption"><span>{['产品与市场，在这里连接。','WHERE PRODUCTS MEET POSSIBILITY.'][l]}</span><small>{!playing?['品类示意 · 动画已暂停','CONCEPT PRODUCT IMAGERY · ANIMATION PAUSED'][l]:['实时三维演绎 · 产品为品类示意','LIVE SPATIAL EXHIBIT · CONCEPT PRODUCT IMAGERY'][l]}</small></div>
  </section>;
}
