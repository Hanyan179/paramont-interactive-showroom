import {ArrowRight} from '@phosphor-icons/react';
import './company-entrance.css';

export function CompanyEntrance({lang,onRead,onLanguage}){
  const l=lang==='zh'?0:1;
  return <>
    <div className="company-languages" role="group" aria-label={['选择语言','Select language'][l]}>
      <button lang="en" aria-pressed={lang==='en'} onClick={()=>onLanguage('en')}>EN</button>
      <span aria-hidden="true">|</span>
      <button lang="zh" aria-pressed={lang==='zh'} onClick={()=>onLanguage('zh')}>中文</button>
    </div>
    <section className="company-entrance-copy">
      <h1 className={l?'is-english':'is-chinese'}>{['创意，','CREATIVITY'][l]}<br/><span>{['连接世界。','CONNECTS.'][l]}</span></h1>
      <p className={`company-promise ${l?'is-english':''}`}>{['让更好的产品，点亮更美好的生活','Better products. Brighter lives. Together.'][l]}</p>
      <button className="company-explore exhibit-action" onClick={onRead}>
        <span>{['了解我们的故事','EXPLORE OUR STORY'][l]}</span>
        <ArrowRight weight="light" aria-hidden="true"/>
      </button>

    </section>
  </>;
}
