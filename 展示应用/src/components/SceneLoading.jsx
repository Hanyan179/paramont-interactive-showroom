import { loadingMessage } from '../config/uiCopy.js';

export function SceneLoading({ lang }) {
  return <div className="world-loading" role="status">{loadingMessage(lang)}</div>;
}
