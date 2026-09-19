import {useEffect, useRef} from 'react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import {ArrowLeft, ArrowRight, Database, Graph, Sparkle, GitBranch, Package, Stack, Play, MagnifyingGlass, SquaresFour, CheckCircle} from '@phosphor-icons/react';
import {intelligenceStages} from './intelligenceContent.js';
import './intelligence-experience.css';

const stageIcons = [Database, Graph, Sparkle, GitBranch, Package, Stack];
const exampleIcons = [MagnifyingGlass, SquaresFour, CheckCircle];
const stageHeadlines = [
  ['让信息相遇，\n让创造有据。', 'Bring information together.\nGive creation a foundation.'],
  ['让数据被理解，\n释放更深层的价值。', 'Understand the data.\nDiscover deeper value.'],
  ['看见关联中的信号，\n找到下一种可能。', 'See the signal.\nDiscover the possibility.'],
  ['让想法成形，\n让决策可见。', 'Give ideas their form.\nMake decisions tangible.'],
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
  const example=current.example;
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
        </div>
      </header>
      <h1>{stageHeadlines[index][l]}</h1>
      <p className="intelligence-description">{current.description[l]}</p>
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

    <button className="intelligence-back exhibit-action" onClick={onBack}>
      <ArrowLeft aria-hidden="true" /><span>{isCase ? ['返回阶段详情', 'Back to stage detail'][l] : ['返回展厅', 'Back to the showroom'][l]}</span>
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
    <p className="intelligence-note">{['概念商品 · 演示数据 · 未接入实时服务', 'CONCEPT PRODUCT · DEMONSTRATION DATA · NO LIVE SERVICES'][l]}</p>
  </section>;
}
