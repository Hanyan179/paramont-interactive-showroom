import {safeDocumentURL} from '../documents/reading.js';

export function playableFilms(items=[]){
  return items.filter(item=>item.id&&safeDocumentURL(item.src)&&/\.(mp4|webm|ogg)(?:[?#]|$)/i.test(item.src));
}
export function nextFilm(items,id,direction=1){
  if(!items.length)return null;
  const index=Math.max(0,items.findIndex(item=>item.id===id));
  return items[(index+direction+items.length)%items.length];
}
