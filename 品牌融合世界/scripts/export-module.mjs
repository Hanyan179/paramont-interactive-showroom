import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.resolve(process.argv[2]||path.join(root,'../展示应用/public/modules/product-explorer'));
if(!fs.existsSync(path.join(root,'dist/shared-integrity.json')))throw Error('Build the module before exporting.');
fs.mkdirSync(target,{recursive:true});
// Only files from the previous module manifest are replaced or removed.
const manifest=path.join(target,'module-files.json');
if(fs.existsSync(manifest))for(const name of JSON.parse(fs.readFileSync(manifest))){const dest=path.resolve(target,name);if(!dest.startsWith(target+path.sep))throw Error('Invalid prior manifest');if(fs.existsSync(dest))fs.unlinkSync(dest);}
fs.cpSync(path.join(root,'dist'),target,{recursive:true});
const files=(dir,prefix='')=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(f=>f.isDirectory()?files(path.join(dir,f.name),prefix+f.name+'/'):[prefix+f.name]);
fs.writeFileSync(manifest,JSON.stringify(files(path.join(root,'dist')),null,2)+'\n');
console.log('Offline explorer exported to '+target);
