import {groupEN,groupZH,historyEN} from './companyCopy.js';
import { useEffect, useRef } from 'react';
import { storySteps, stepDescriptions, milestoneTitles, overviewStops } from './homeStoryContent';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@phosphor-icons/react';


export function CompanyStory({ chapter, onChapter, official, lang, onEnter, selection, onSelection, overviewFocus, onOverviewEnter, onOverviewClear, onNews, onDocument }) {
  const l = lang === 'zh' ? 0 : 1, t = (zh, en) => l === 0 ? zh : en;
  const {company,year,capability,detail}=selection;
  const readingArea=useRef(null);
  useEffect(()=>{if(readingArea.current)readingArea.current.scrollTop=0;},[chapter,capability,detail,company]);
  const setCompany=company=>onSelection({company}),setYear=year=>onSelection({year}),setCapability=capability=>onSelection({capability,detail:null});
  const groups = official?.company_groups || [], timeline = official?.history || [], capabilities = official?.capabilities || [];
  return <>
    <section ref={readingArea} className={`company-story chapter-${chapter} ${chapter===1&&detail!==null?'has-exhibit':''}`} aria-label={t('公司介绍', 'Company introduction')}>
      <div className="story-page" key={chapter}>
        <p className="eyebrow">PARAMONT / {t(['连接世界','公司介绍','协作网络','时间足迹','公司动态'][chapter],['CONNECTED WORLD','ABOUT US','OUR COMPANIES','OUR STORY','COMPANY NEWS'][chapter])}</p>
        {chapter === 0 && <div className="overview-context" key={overviewFocus??'intro'}>{overviewFocus===null?<h1>{t('让创意，','Ideas,')}<br/>{t('连接世界。','connected.')}</h1>:<><button className="overview-clear" onClick={onOverviewClear} aria-label={t('回到总览','Back to overview')}><ArrowLeft size={20}/></button><h1>{overviewStops[overviewFocus][l]}</h1><p className="story-lead">{[
          ['从创意出发，认识我们的团队与历程。','Discover our people and our story.'],['从研发与制造，到连接世界的供应链。','From design and manufacturing to a connected supply chain.'],['品牌、品类与样品，在同一个空间探索。','Explore brands, categories and samples in one space.'],['从国际趋势，到品类洞察与产品创造。','From global trends to category insight and product creation.']
        ][overviewFocus][l]}</p><button className="text-button overview-enter" onClick={()=>onOverviewEnter(overviewFocus)}>{t('进入探索','Explore')}<ArrowRight size={22}/></button></>}</div>}

        {chapter === 1 && <><h1>{t('把想象，','Imagination,')}<br/>{t('变成日常。','made everyday.')}</h1><p className="story-lead">{t('连接产品设计、开发与市场的一站式伙伴。','An integrated partner for product design, development and marketing.')}</p><div className="story-capabilities">{capabilities.map((c,i)=><button key={c.id} className={capability===i?'active':''} aria-pressed={capability===i} onClick={()=>setCapability(i)}><span>0{i+1}</span>{c.title[lang]}</button>)}</div>{capabilities[capability] && <div className="story-capability-detail" key={capability}><p className="story-insight">{capabilities[capability].description[lang]}</p><div className="story-step-list" aria-label={t('能力展点','Capability exhibits')}>{storySteps[capability].map((label,i)=><button key={i} aria-pressed={detail===i} className={detail===i?'active':''} onClick={()=>onSelection({detail:detail===i?null:i})}>{label[l]}</button>)}</div>{detail!==null&&<div className="story-reveal" key={detail}><div><span>{storySteps[capability][detail][l]}</span><button onClick={()=>onSelection({detail:null})} aria-label={t('返回能力总览','Back to capability overview')}><ArrowLeft size={18}/></button></div><p>{stepDescriptions[capability][detail][l]}</p></div>}</div>}</>}
        {chapter === 2 && <><h1>{t('不同专长，','Different strengths.')}<br/>{t('共同创造。','Shared possibility.')}</h1><div className="company-network">{groups.map((g,i)=><button key={g.name} className={company===i?'active':''} aria-pressed={company===i} onClick={()=>setCompany(i)}><small>0{i+1}</small><span>{g.name}</span></button>)}</div>{groups[company] && <div className="network-detail" key={company}><p>{l===0 ? groupZH[company] : groupEN[company]}</p></div>}</>}
        {chapter === 3 && <><p className="milestone-title">{milestoneTitles[year][l]}</p><h1 className="story-year">{timeline[year]?.year || '2003'}</h1><p className="story-lead timeline-summary" key={year}>{l===0 ? (year===5?'公司更名为宁波高山数智文化科技股份有限公司。':timeline[year]?.summary_zh) : historyEN[year]}</p><div className="timeline-rail">{timeline.map((h,i)=><button key={h.year} onClick={()=>setYear(i)} className={i===year?'active':''} aria-pressed={i===year}><i/>{h.year}</button>)}</div><input className="story-time-slider" type="range" min="0" max={Math.max(0,timeline.length-1)} step="1" value={year} onChange={e=>setYear(Number(e.target.value))} aria-label={t('发展年份','Year in our history')} aria-valuetext={String(timeline[year]?.year||2003)}/><div className="timeline-arrows"><button className="icon-button" onClick={()=>setYear(Math.max(0,year-1))} disabled={year===0} aria-label={t('上一个年份','Previous year')}><ArrowLeft/></button><span>{String(year+1).padStart(2,'0')} / {String(timeline.length).padStart(2,'0')}</span><button className="icon-button" onClick={()=>setYear(Math.min(timeline.length-1,year+1))} disabled={year===timeline.length-1} aria-label={t('下一个年份','Next year')}><ArrowRight/></button></div></>}
        {chapter===4&&<><h1>{t('我们的故事，','Our stories,')}<br/>{t('正在发生。','in motion.')}</h1><p className="story-lead">{t('影像与文字，记录公司、团队与创意。','Films and stories from our company, people and ideas.')}</p><button className="text-button overview-enter" onClick={()=>onNews('films')}>{t('打开公司动态','Explore company news')}<ArrowRight size={22}/></button></>}
        {chapter>0&&chapter<4&&<button className="document-entry" onClick={onDocument}>{chapter===2?t('阅读协作网络资料','Read about our companies'):chapter===3?t('阅读发展历程','Read our history'):t('阅读公司资料','Read company profile')}<ArrowUpRight/></button>}
      </div>
    </section>

    {chapter>0&&chapter<4&&<div className="home-scene-caption" aria-hidden="true"><span>{t(['一个创意，万千可能','从专长，到共同创造','同一个世界，不同的专长','每一步，构筑下一步'][chapter],['ONE IDEA. MANY POSSIBILITIES.','EXPERTISE IN MOTION','CONNECTED BY DESIGN','EVERY CHAPTER BUILDS THE NEXT'][chapter])}</span><small>{t(chapter===3?'发展历程的空间演绎':'PARAMONT · 创意构造',chapter===3?'An interpretation of our history':'PARAMONT · Creative form')}</small></div>}

  </>;
}
