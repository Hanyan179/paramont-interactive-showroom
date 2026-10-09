import {useEffect, useRef, useState} from 'react';
import {House, GlobeHemisphereWest, Tag, SquaresFour, ChartBar, ArrowLeft, ArrowRight} from '@phosphor-icons/react';
import {bindScenePointer} from '../interaction/scenePointer.js';
import './impact-navigation.css';

const chapterIcons = [House, GlobeHemisphereWest, Tag, SquaresFour, ChartBar];

export function ImpactNavigation({moments, index, onSelect, lang, open = true, stages, stage, onStageSelect}) {
  const [showChapters, setShowChapters] = useState(false);
  const navigation = useRef(null);
  useEffect(() => {
    const gestures = bindScenePointer(navigation.current, {
      claimClick: true, includeControls: true, cancelOnMultiple: true,
      onTap(_event, gesture) { gesture.target.closest('button')?.click(); },
    });
    const hidden = () => { if (document.hidden) gestures.cancel(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { gestures.dispose(); document.removeEventListener('visibilitychange', hidden); };
  }, []);
  useEffect(() => { if (open) navigation.current?.querySelector('button')?.focus(); }, [open, showChapters]);
  useEffect(() => { setShowChapters(false); }, [open, index, Boolean(stages)]);
  const l = lang === 'zh' ? 0 : 1;
  const showStages = stages && !showChapters;
  return <nav ref={navigation} hidden={!open} data-chapter-navigation lang={l === 0 ? 'zh-CN' : 'en'} aria-label={showStages ? ['探索六个阶段', 'Explore the six stages'][l] : ['选择视觉主题', 'Choose a visual chapter'][l]}>
    <div className="impact-menu-heading">{showStages ? ['智能与洞察', 'Intelligence & insights'][l] : ['展厅导航', 'Explore the showroom'][l]}</div>
    {stages && <button className="impact-menu-switch" onClick={() => setShowChapters(value => !value)}>
      {showStages ? <ArrowLeft aria-hidden="true"/> : <ArrowRight aria-hidden="true"/>}
      <span>{showStages ? ['全部展区', 'All chapters'][l] : ['六个阶段', 'Six stages'][l]}</span>
    </button>}
    {showStages ? stages.map((entry, i) => <button key={entry.id} data-intelligence-stage={i} aria-current={stage === i ? 'step' : undefined} onClick={() => onStageSelect(i)}>
      <span className="impact-menu-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <span>{entry.name[l]}</span>
    </button>) : moments.map((moment, i) => {
      const Icon = chapterIcons[i];
      return <button key={moment.id} data-chapter-index={i} aria-current={index === i ? 'step' : undefined} onClick={() => onSelect(i)}>
        <Icon weight="light" aria-hidden="true"/><span>{moment.name[l]}</span>
      </button>;
    })}
  </nav>;
}
