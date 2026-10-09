import {ArrowRight, Sparkle, Play, MagnifyingGlass, SquaresFour, CheckCircle} from '@phosphor-icons/react';
import {intelligenceStages} from './intelligenceContent.js';
import './intelligence-experience.css';

const exampleIcons = [MagnifyingGlass, SquaresFour, CheckCircle];
const stageHeadlines = [
  ['汇聚多源数据，\n建立分析基础。', 'Connect the data.\nGround the analysis.'],
  ['看清市场变化，\n研判未来需求。', 'Read market shifts.\nAnticipate demand.'],
  ['发现产品机会，\n看清取舍依据。', 'Find opportunities.\nWeigh the trade-offs.'],
  ['明确产品方向，\n推动方案成形。', 'Choose a direction.\nShape the product.'],
  ['让产品走向市场，\n让订单完成交付。', 'Bring products to market.\nDeliver on orders.'],
  ['复盘经营结果，\n积累下一轮经验。', 'Review the results.\nInform the next cycle.'],
];

/** The parent owns the clock, selected stage and the three-level journey. */
export function IntelligenceExperience({
  lang,
  playing = true,
  stage = 0,
  mode = 'auto',
  view,
  onResume,
  onExample,
  onActivity,
}) {
  const l = lang === 'zh' ? 0 : 1;
  const index = Number.isInteger(stage) ? Math.max(0, Math.min(5, stage)) : 0;
  const current = intelligenceStages[index];
  const example=current.example;
  const isCase = (view || (mode === 'case' ? 'case' : 'detail')) === 'case';
  const isAuto = mode === 'auto';
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
    {!isCase && <div className="intelligence-copy-reveal"><div className="intelligence-copy" key={`detail-${current.id}-${lang}`}>
      <header className="intelligence-stage-heading">
        <span className="intelligence-stage-number" aria-hidden="true">{number}</span>
        <div>
          <p className="intelligence-stage-name">{current.name[l]}</p>
        </div>
      </header>
      <h1>{stageHeadlines[index][l]}</h1>
      <p className="intelligence-description">{current.description[l]}</p>
      <button className="intelligence-example exhibit-action" onClick={onExample}>
        <span>{['查看业务示例', 'Explore an example'][l]}</span><ArrowRight aria-hidden="true" />
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
    </div></div>}

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
    </>}

    <p className="intelligence-note">{['概念商品 · 演示数据 · 未接入实时服务', 'CONCEPT PRODUCT · DEMONSTRATION DATA · NO LIVE SERVICES'][l]}</p>
  </section>;
}
