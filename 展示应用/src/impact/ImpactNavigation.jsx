import {House,GlobeHemisphereWest,Tag,SquaresFour,ChartBar} from '@phosphor-icons/react';
import './impact-navigation.css';

const chapterIcons=[House,GlobeHemisphereWest,Tag,SquaresFour,ChartBar];

export function ImpactNavigation({moments,index,onSelect,lang}){
  return <nav data-chapter-navigation lang={lang==='zh'?'zh-CN':'en'} aria-label={lang==='zh'?'选择视觉主题':'Choose a visual chapter'}>
    {moments.map((moment,i)=>{
      const Icon=chapterIcons[i];
      return <button key={moment.id} data-chapter-index={i} aria-current={index===i?'step':undefined} onClick={()=>onSelect(i)}>
        <Icon weight="light" aria-hidden="true"/>
        <span>{moment.name[lang==='zh'?0:1]}</span>
      </button>;
    })}
  </nav>;
}
