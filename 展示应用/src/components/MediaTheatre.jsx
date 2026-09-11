import {useEffect,useRef,useState} from 'react';
import {House,X,Play,Pause,SpeakerHigh,SpeakerSlash,CornersOut,SkipBack,SkipForward,ArrowUpRight} from '@phosphor-icons/react';
import {useDialog} from '../hooks';
import {localText,safeDocumentURL,readingEstimate} from '../documents/reading';
import {nextFilm} from '../media/library';
import '../media-theatre.css';

const clock=value=>`${Math.floor((value||0)/60)}:${String(Math.floor((value||0)%60)).padStart(2,'0')}`;

function FocusBoundary({children,onClose,enabled}){
  const root=useRef(null);useDialog(root,onClose,enabled);
  useEffect(()=>{
    let wasFullscreen=!!document.fullscreenElement,lastExit=-Infinity;
    const changed=()=>{if(wasFullscreen&&!document.fullscreenElement)lastExit=performance.now();wasFullscreen=!!document.fullscreenElement;};
    const escape=event=>{if(event.key==='Escape'&&(document.fullscreenElement||performance.now()-lastExit<400))event.stopImmediatePropagation();};
    document.addEventListener('fullscreenchange',changed);root.current.addEventListener('keydown',escape,true);
    const target=root.current;return()=>{document.removeEventListener('fullscreenchange',changed);target.removeEventListener('keydown',escape,true);};
  },[]);
  return <div className="media-focus-boundary" ref={root}>{children}</div>;
}

export function MediaTheatre({mode,phase='open',onMode,automatic=false,films,publications,lang,onClose,onHome,onRead}){
  const t=(zh,en)=>lang==='zh'?zh:en,txt=value=>localText(value,lang);
  const [filmId,setFilmId]=useState(films[0]?.id),[playing,setPlaying]=useState(false),[muted,setMuted]=useState(true),[progress,setProgress]=useState(0),[duration,setDuration]=useState(0),[error,setError]=useState('');
  const video=useRef(null),screen=useRef(null);
  const film=films.find(item=>item.id===filmId)||films[0];
  const advance=direction=>{const next=nextFilm(films,film?.id,direction);if(next)setFilmId(next.id);};
  useEffect(()=>{
    const element=video.current;if(!element||mode!=='films'||phase!=='open')return;
    setError('');setProgress(0);setDuration(0);
    element.play().catch(()=>setPlaying(false));
    let resume=false;
    const visibility=()=>{if(document.hidden){resume=!element.paused;element.pause();}else if(resume){resume=false;element.play().catch(()=>setPlaying(false));}};
    document.addEventListener('visibilitychange',visibility);
    return()=>{document.removeEventListener('visibilitychange',visibility);element.pause();};
  },[film?.src,mode,phase]);
  const full=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await screen.current?.requestFullscreen();}catch{setError(t('请使用系统全屏按钮。','Use the system fullscreen control.'));}};
  const content=<section className={`media-theatre ${mode} phase-${phase} ${automatic?'is-automatic':''}`} role="dialog" aria-modal={!automatic} aria-label={mode==='films'?t('公司影像放映室','Company film theatre'):t('新闻与刊物阅览室','Company journal')} data-tour-media={automatic?'true':undefined}>
    <header><div><p>PARAMONT / COMPANY NEWS</p><h2>{t('公司动态','Company news')}</h2></div>{!automatic&&<nav className="news-media-tabs" aria-label={t('新闻形式','News format')}>{[['films','影像','Films'],['journal','图文','Stories']].map(([id,zh,en])=><button key={id} aria-pressed={mode===id} onClick={()=>onMode(id)}>{t(zh,en)}</button>)}</nav>}<div className="media-header-tools">{onHome&&!automatic&&<button className="media-close" onClick={onHome} aria-label={t('返回公司首页','Company home')}><House/></button>}<button className="media-close" onClick={onClose} aria-label={t('返回展厅','Back to the exhibition')}><X/></button></div></header>
    {mode==='films'?<div className="film-layout">
      <div className="film-primary"><div className="film-screen" ref={screen}>
        {film?<video ref={video} key={film.src} src={safeDocumentURL(film.src)} poster={safeDocumentURL(film.poster)} muted={muted} playsInline preload="metadata" data-tour-media={automatic?'true':undefined} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onTimeUpdate={e=>setProgress(e.currentTarget.currentTime)} onLoadedMetadata={e=>setDuration(e.currentTarget.duration)} onEnded={()=>{if(films.length===1){video.current.currentTime=0;video.current.play().catch(()=>{});}else advance(1);}} onError={()=>setError(t('影片暂时无法播放，可选择另一部。','This film is unavailable. Choose another film.'))}/>:<p className="film-empty">{t('公司影片即将呈现','Company films coming soon')}</p>}
        {film&&<div className="film-controls"><input type="range" min="0" max={Number.isFinite(duration)?duration:0} step="0.1" value={progress} aria-label={t('影片进度','Film progress')} onChange={e=>{video.current.currentTime=Number(e.target.value);setProgress(Number(e.target.value));}}/><div>
          <button aria-label={t('上一部影片','Previous film')} onClick={()=>advance(-1)}><SkipBack/></button><button aria-label={playing?t('暂停影片','Pause film'):t('播放影片','Play film')} onClick={()=>playing?video.current.pause():video.current.play().catch(()=>setError(t('请重新选择影片。','Please select the film again.')))}>{playing?<Pause/>:<Play/>}</button><button aria-label={t('下一部影片','Next film')} onClick={()=>advance(1)}><SkipForward/></button><span className="film-clock">{clock(progress)} / {clock(duration)}</span><button aria-label={muted?t('开启影片声音','Unmute film'):t('影片静音','Mute film')} onClick={()=>setMuted(value=>!value)}>{muted?<SpeakerSlash/>:<SpeakerHigh/>}</button><button aria-label={t('影片全屏','Film fullscreen')} onClick={full}><CornersOut/></button>
        </div></div>}
      </div><div className="film-caption"><h3>{txt(film?.title)}</h3><span>{txt(film?.status)}</span></div>{error&&<p className="media-error" role="status">{error}</p>}</div>
      <aside className="film-playlist" aria-label={t('影片选择','Film selection')}><div className="film-playlist-title"><span>{t('影片选择','The collection')}</span><small>{t('顺序循环','Continuous play')}</small></div>{films.map((item,index)=><button key={item.id} className={film?.id===item.id?'active':''} aria-pressed={film?.id===item.id} onClick={()=>setFilmId(item.id)}><span className="film-number">{String(index+1).padStart(2,'0')}</span><div><strong>{txt(item.title)}</strong><small>{txt(item.status)}</small></div><Play/></button>)}{films.some(item=>item.concept)&&<p className="film-library-note">{t('当前为概念影片。公司宣传片待补充。','Concept films are shown while company films are being prepared.')}</p>}</aside>
    </div>:<div className="publication-grid">{publications.map(doc=><button key={doc.id} onClick={()=>onRead(doc)}><div className="publication-cover">{doc.cover&&<img src={safeDocumentURL(doc.cover.src)} alt={txt(doc.cover.caption)} />}<span>{txt(doc.category)}</span></div><div className="publication-copy"><small>{txt(doc.status)}</small><h3>{txt(doc.title)}</h3><p>{txt(doc.summary)}</p><div><span>{t('约','About ')}{readingEstimate(doc,lang).minutes}{t(' 分钟阅读',' min read')}</span><ArrowUpRight/></div></div></button>)}{!publications.length&&<p>{t('刊物正在准备中。','Publications are being prepared.')}</p>}</div>}
  </section>;
  return <div style={{display:'contents'}} inert={phase!=='open'?true:undefined}>{automatic?content:<FocusBoundary onClose={onClose} enabled={phase==='open'}>{content}</FocusBoundary>}</div>;
}
