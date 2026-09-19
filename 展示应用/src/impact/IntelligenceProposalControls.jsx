import {Play} from '@phosphor-icons/react';
import {intelligenceProposals,researchRegions} from './intelligenceProposalsContent.js';
import './intelligence-proposals.css';

export function IntelligenceProposalControls({lang,selection,phase,onChange,showDemo=true}){
  const l=lang==='zh'?0:1,p=intelligenceProposals.find(item=>item.id===selection.scheme)||intelligenceProposals[0];
  return <aside className="intelligence-proposal-controls" aria-label={['展示方案比较','Compare exhibit concepts'][l]}>
    <div className="intelligence-proposal-picker">
      <span>{['方案试映','CONCEPT PREVIEW'][l]}</span>
      <div role="group" aria-label={['选择展示方案','Choose a concept'][l]}>
        {intelligenceProposals.map(item=><button key={item.id} aria-pressed={selection.scheme===item.id} onClick={()=>onChange({scheme:item.id,step:0})}><small>{item.id}</small>{item.name[l]}</button>)}
      </div>
    </div>
    {showDemo&&<div className="intelligence-proposal-demo">
      <div className="proposal-choices">
        {selection.scheme==='B'?<div role="group" aria-label={['研究区域','Research region'][l]}>{researchRegions.map((region,i)=><button key={i} aria-pressed={selection.region===i} onClick={()=>onChange({region:i,step:0})}>{region.name[l]}</button>)}</div>:<div role="group" aria-label={['设计方向','Design direction'][l]}>{(selection.scheme==='C'?[['随行创作','Portable set'],['桌面共享','Shared desktop']]:[['青瓷绿','Sage finish'],['陶土红','Clay finish']]).map((name,i)=><button key={i} aria-pressed={selection.variant===i} onClick={()=>onChange({variant:i})}>{name[l]}</button>)}</div>}
        <button className="proposal-autoplay" aria-pressed={selection.step===null} onClick={()=>onChange({step:null})}><Play weight="fill"/>{['自动演示','Play sequence'][l]}</button>
      </div>
      <div className="proposal-story-steps" role="group" aria-label={['演示动作','Demo sequence'][l]}>{p.steps.map((step,i)=><button key={i} aria-pressed={phase===i} onClick={()=>onChange({step:i})}><small>0{i+1}</small><span>{step[l]}</span></button>)}</div>
      <p className="proposal-question" aria-live="polite">{p.questions[phase][l]}</p>
      <p className="proposal-disclosure">{['原创概念样机 · 非在售产品复刻 · 业务假设待验证','ORIGINAL CONCEPT · NOT A PRODUCT REPLICA · HYPOTHESES TO VALIDATE'][l]}</p>
    </div>}
  </aside>;
}
