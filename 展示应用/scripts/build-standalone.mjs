import {spawnSync} from 'node:child_process';
// Offline packages intentionally retain the dated archive and never impersonate a live PDM connection.
const result=spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','build'],{
  stdio:'inherit',shell:process.platform==='win32',env:{...process.env,VITE_ADVERTISING_STANDALONE:'1'},
});
if(result.error) throw result.error;
process.exit(result.status??1);
