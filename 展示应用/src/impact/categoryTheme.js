// The category gallery shares the theatre's flowing atmosphere. Only its palette
// changes; product artwork keeps the same daylight exposure.
export const categoryThemes={
  light:{background:'#c7d7e1',deep:'#b6c8d4',blue:'#5b7181',silver:'#9cb0b9',floor:'#8ba9ba',frame:'#718796',edge:'#c9dae3',caption:'#dce5e9',captionInk:'#17334a',captionMuted:'#4b6070',ink:'#17334a',muted:'#405567',accent:'#607a8c',line:'#55778e40',surface:'#e0e9ee',button:'#e4edf2d9'},
  dark:{background:'#071725',deep:'#071725',blue:'#315873',silver:'#557082',floor:'#315873',frame:'#263f52',edge:'#7192a6',caption:'#102b3d',captionInk:'#edf4f7',captionMuted:'#a9c4d4',ink:'#edf4f7',muted:'#a9c4d4',accent:'#d5c6a5',line:'#87aec744',surface:'#102b3d',button:'#133449d9'},
};
export const categoryThemeId=value=>Object.hasOwn(categoryThemes,value)?value:'dark';
