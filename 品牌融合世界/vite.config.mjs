import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const shared=path.resolve(root,'../共享数据');
function entries(dir,prefix='') { return fs.readdirSync(dir).flatMap(name=>{const abs=path.join(dir,name),key=path.posix.join(prefix,name); return fs.statSync(abs).isDirectory()?entries(abs,key):[{abs,key}];}); }
const sharedFiles=()=>entries(shared).filter(f=>!f.key.endsWith('.md'));
export default defineConfig({
 base:"./",
 plugins:[react(),{
  name:'paramont-shared-source',
  configureServer(server){
   server.middlewares.use('/shared',(req,res,next)=>{
    const key=decodeURIComponent((req.url||'').split('?')[0]).replace(/^\//,'');
    const f=sharedFiles().find(f=>f.key===key); if(!f){res.statusCode=404;res.end('Unknown shared asset');return;}
    res.setHeader('Content-Type',key.endsWith('.json')?'application/json; charset=utf-8':key.endsWith('.svg')?'image/svg+xml':key.endsWith('.png')?'image/png':'application/octet-stream');res.setHeader('Cache-Control','no-cache');res.end(fs.readFileSync(f.abs));
   });
   server.middlewares.use('/__capture',async(req,res)=>{
    if(req.method!=='POST'){res.statusCode=405;res.end();return;}
    const filename=new URL(req.url,'http://localhost').searchParams.get('file');
    if(!/^[a-z0-9-]+\.(png|webm)$/.test(filename||'')){res.statusCode=400;res.end();return;}
    const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>20e6){res.statusCode=413;res.end();return;}chunks.push(chunk);}
    fs.writeFileSync(path.join(root,'public/studies',filename),Buffer.concat(chunks));res.end('saved');
   });
  },
  generateBundle(){
   const integrity={generatedAt:new Date().toISOString(),source:'../共享数据',files:{}};
   for(const f of sharedFiles()){const source=fs.readFileSync(f.abs);this.emitFile({type:'asset',fileName:'shared/'+f.key,source});integrity.files[f.key]=crypto.createHash('sha256').update(source).digest('hex');}
   this.emitFile({type:'asset',fileName:'shared-integrity.json',source:JSON.stringify(integrity,null,2)});
  }
 }],
 server:{host:'127.0.0.1',port:5208,strictPort:true},
 build:{target:'es2022',chunkSizeWarningLimit:800,rollupOptions:{output:{manualChunks:{three:['three']}}}}
});
