import {useEffect, useRef} from 'react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {ArrowLeft, ArrowRight, Database, Graph, Sparkle, GitBranch, Package, Stack, Play, MagnifyingGlass, SquaresFour, CheckCircle} from '@phosphor-icons/react';
import {intelligenceStages} from './intelligenceContent.js';
import {intelligenceAssetSources} from './intelligenceAssets.js';
import {intelligenceProposals,proposalCase} from './intelligenceProposalsContent.js';
import './intelligence-experience.css';

const stageIcons = [Database, Graph, Sparkle, GitBranch, Package, Stack];
const exampleIcons = [MagnifyingGlass, SquaresFour, CheckCircle];
const stageHeadlines = [
  ['让信息相遇，\n让创造有据。', 'Bring information together.\nGive creation a foundation.'],
  ['让数据被理解，\n释放更深层的价值。', 'Understand the data.\nDiscover deeper value.'],
  ['看见关联中的信号，\n找到下一种可能。', 'See the signal.\nDiscover the possibility.'],
  ['展开选择，\n让方向更加清晰。', 'Explore the choices.\nFind a clearer direction.'],
  ['让洞察成形，\n让创造走向市场。', 'Give insight a form.\nBring creation to market.'],
  ['每一次创造，\n都是下一次的起点。', 'Every creation becomes\na new beginning.'],
];

/** The parent owns the clock, selected stage and the three-level journey. */
export function IntelligenceExperience({
  lang,
  playing = true,
  stage = 0,
  mode = 'auto',
  view,
  progress = 0,
  onSelect,
  onResume,
  onExample,
  onBack,
  onActivity,
  onHold,
  proposalScheme='A',
  decisionChoice=0,
  onDecision,
  onDecisionContinue,
}) {
  const navigation = useRef();
  const handlers = useRef();
  handlers.current = {onSelect, onActivity, onHold};
  useEffect(() => {
    const gestures = bindScenePointer(navigation.current, {
      claimClick: true,
      includeControls: true,
      cancelOnMultiple: true,
      onStart() { handlers.current.onActivity?.(); handlers.current.onHold?.(true); },
      onEnd() { handlers.current.onHold?.(false); },
      onTap(_event, gesture) {
        const button = gesture.target.closest('[data-intelligence-stage]');
        if (button) handlers.current.onSelect?.(Number(button.dataset.intelligenceStage));
      },
    });
    const hidden = () => { if (document.hidden) gestures.cancel(); };
    document.addEventListener('visibilitychange', hidden);
    return () => {
      gestures.dispose();
      handlers.current.onHold?.(false);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);

  const l = lang === 'zh' ? 0 : 1;
  const index = Number.isInteger(stage) ? Math.max(0, Math.min(5, stage)) : 0;
  const current = intelligenceStages[index];
  const proposal=intelligenceProposals.find(item=>item.id===proposalScheme)||intelligenceProposals[0];
  const example=index===4?proposalCase(proposalScheme):current.example;
  const isCase = (view || (mode === 'case' ? 'case' : 'detail')) === 'case';
  const isAuto = mode === 'auto';
  const stageProgress = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  const number = String(index + 1).padStart(2, '0');
  const activity = () => onActivity?.();

  return <section
    className={`intelligence-experience${isCase ? ' is-case' : ' is-detail'}`}
    lang={l === 0 ? 'zh' : 'en'}
    data-mode={mode}
    data-view={isCase ? 'case' : 'detail'}
    data-stage={current.id}
    aria-label={isCase ? ['智能与洞察 · 业务示例', 'Intelligence & insights · Business example'][l] : ['智能与洞察 · 阶段详情', 'Intelligence & insights · Stage detail'][l]}
    onPointerDownCapture={activity}
    onKeyDownCapture={activity}
    onFocusCapture={activity}
  >
    {!isCase && <div className="intelligence-copy" key={`detail-${current.id}-${lang}`}>
      <header className="intelligence-stage-heading">
        <span className="intelligence-stage-number" aria-hidden="true">{number}</span>
        <div>
          <p className="intelligence-stage-name">{current.name[l]}</p>
          <p className="intelligence-name-en" lang={l === 0 ? 'en' : 'zh'}>{current.name[l === 0 ? 1 : 0]}</p>
        </div>
      </header>
      <h1>{index===4?proposal.title[l]:stageHeadlines[index][l]}</h1>
      <p className="intelligence-description">{index===4?proposal.description[l]:current.description[l]}</p>
      <button className="intelligence-example exhibit-action" onClick={onExample}>
        <span>{['查看典型案例', 'Explore an example'][l]}</span><ArrowRight aria-hidden="true" />
      </button>
      <div className="intelligence-playback">
        <span className={`intelligence-status${isAuto && playing ? ' is-auto' : ''}`}>
          <span aria-hidden="true" />
          {!playing ? ['动画已暂停', 'Animation paused'][l] : isAuto ? ['自动演进', 'Evolving automatically'][l] : ['停留探索', 'Explore at your pace'][l]}
        </span>
        {!isAuto && <button className="intelligence-resume" onClick={onResume}>
          <Play weight="fill" aria-hidden="true" />{['继续演进', 'Resume journey'][l]}
        </button>}
      </div>
    </div>}

    {index === 0 && !isCase && <>
      <div className="intelligence-asset-sources" aria-label={['数据资产的来源','Sources of knowledge assets'][l]}>
        {['information','expertise'].map((family,i)=><div className={`intelligence-source-family is-${family}`} key={family}>
          <p>{i===0?['外部信息','EXTERNAL INFORMATION'][l]:['专家知识','EXPERT KNOWLEDGE'][l]}</p>
          <ul>{intelligenceAssetSources.filter(source=>source.family===family).map(source=><li key={source.id}>{source.name[l]}</li>)}</ul>
        </div>)}
      </div>
      <div className="intelligence-asset-caption">
        <strong>{['可追溯的知识资产','TRACEABLE KNOWLEDGE ASSETS'][l]}</strong>
        <span>{['多源采集 · 语义整理 · 专家校核','MULTIPLE SOURCES · SEMANTIC ORGANIZATION · EXPERT REVIEW'][l]}</span>
      </div>
    </>}

    {index === 3 && <div className="intelligence-decision-controls">
      <div role="group" aria-label={['比较产品方向','Compare product directions'][l]}>
        {[['随行创作','Portable creation'],['桌面共享','Shared studio']].map((name,i)=><button key={i} aria-pressed={decisionChoice===i} onClick={()=>onDecision?.(i)}><small>0{i+1}</small><span>{name[l]}</span></button>)}
      </div>
      <p>{decisionChoice===0?['收纳与携带优先，工具随创作出发。','Prioritize carrying and storage; keep creative tools together.'][l]:['展开工作空间，让工具与材料更易共享。','Open the workspace and make tools and materials easier to share.'][l]}</p>
      <button className="exhibit-action decision-continue" onClick={onDecisionContinue}>{['以此方向进入价值实现','Develop this direction'][l]}<ArrowRight aria-hidden="true"/></button>
      <small>{['概念样机 · 场景选择示意','CONCEPT PROTOTYPES · ILLUSTRATIVE CHOICES'][l]}</small>
    </div>}
    {index === 5 && !isCase && <div className="intelligence-evolution-caption"><span>{['市场反馈','FEEDBACK'][l]}</span><i/><span>{['知识积累','KNOWLEDGE'][l]}</span><i/><span>{['再次创造','NEXT CREATION'][l]}</span></div>}

    {isCase && <>
      <article className="intelligence-case" key={`example-${current.id}-${lang}`} aria-labelledby="intelligence-case-title">
        <header>
          <p className="intelligence-case-kicker"><span>{number} · {current.name[l]}</span><i aria-hidden="true" />{['业务示例', 'BUSINESS EXAMPLE'][l]}</p>
          <h1 id="intelligence-case-title">{example.title[l]}</h1>
          <p className="intelligence-case-summary">{example.summary[l]}</p>
        </header>
        <ol className="intelligence-case-steps">
          {example.steps.map((step, i) => {
            const Icon = exampleIcons[i];
            return <li key={i}>
              <span className="intelligence-step-icon"><Icon weight="light" aria-hidden="true" /></span>
              <span>{step[l]}</span>
            </li>;
          })}
        </ol>
        <p className="intelligence-case-outcome"><Sparkle weight="light" aria-hidden="true" /><span>{example.outcome[l]}</span></p>
      </article>
      {index!==4&&<figure className="intelligence-case-visual">
        <p className="intelligence-case-category">{['儿童创意用品', 'CREATIVE PLAY'][l]}<span>{index===0?['研究依据汇聚','RESEARCH FOUNDATION'][l]:['产品方向探索', 'PRODUCT DIRECTION'][l]}</span></p>
        <div className="intelligence-case-space" aria-hidden="true" />
        <figcaption>{index===0?['信息有来源，判断有依据。','TRACEABLE SOURCES. INFORMED JUDGMENT.'][l]:['从洞察，走向下一次创造。', 'FROM INSIGHT TO THE NEXT CREATION.'][l]}</figcaption>
      </figure>}
    </>}

    <button className="intelligence-back exhibit-action" onClick={onBack}>
      <ArrowLeft aria-hidden="true" /><span>{isCase ? ['返回阶段详情', 'Back to stage detail'][l] : ['返回全局总览', 'Back to the overview'][l]}</span>
    </button>

    <nav ref={navigation} className="intelligence-navigation" aria-label={['探索六个阶段', 'Explore the six stages'][l]}>
      {intelligenceStages.map((entry, i) => {
        const Icon = stageIcons[i];
        const selected = i === index;
        return <button
          key={entry.id}
          className="intelligence-stage-button"
          aria-pressed={selected}
          data-intelligence-stage={i}
          onClick={event => { if (event.detail === 0) onSelect?.(i); }}
          style={selected ? {'--intelligence-stage-progress': `${isAuto ? stageProgress * 100 : 100}%`} : undefined}
        >
          <span className="intelligence-stage-icon"><Icon weight="light" aria-hidden="true" /></span>
          <span className="intelligence-stage-label"><small>0{i + 1}</small><span>{entry.name[l]}</span></span>
          <span className="intelligence-stage-line" aria-hidden="true"><span /></span>
        </button>;
      })}
    </nav>
    <p className="intelligence-note">{['场景示意 · 未接入实时数据', 'Illustrative scenario · No live data'][l]}</p>
  </section>;
}
