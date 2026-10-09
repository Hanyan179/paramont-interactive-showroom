// Standalone/offline packages have no DSR backend. Their archived content stays explicitly separate.
export const isStandaloneAdvertising = () => import.meta.env.VITE_ADVERTISING_STANDALONE === '1';
