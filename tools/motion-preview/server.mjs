import http from 'node:http';
import path from 'node:path';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { FRAME_COUNT } from './sequence.mjs';
const root=process.cwd(),source=path.join(root,'tools/motion-preview'),output=path.join(root,'docs/concepts/rowan-entry-motion.mp4');
let status={state:'idle',frame:0,total:FRAME_COUNT};
await mkdir(path.dirname(output),{recursive:true});
http.createServer(async(request,response)=>{
 try{
  const url=new URL(request.url,'http://127.0.0.1:5188');
  if(request.method==='POST'){
   if(request.headers.origin!=='http://127.0.0.1:5188'){response.writeHead(403).end();return;}
   if(url.pathname==='/export/start'){status={state:'rendering',frame:0,total:FRAME_COUNT};response.end('started');return;}
   if(url.pathname==='/export/progress'){
    const frame=Number(url.searchParams.get('frame'));if(!Number.isInteger(frame)||frame<status.frame||frame>FRAME_COUNT)throw new Error('Invalid frame progress');
    status.frame=frame;console.log(`Encoded ${frame}/${FRAME_COUNT}`);response.end('ok');return;
   }
   if(['/export/finish','/export/poster'].includes(url.pathname)){
    const chunks=[];let size=0;for await(const chunk of request){size+=chunk.length;if(size>100*1024*1024)throw new Error('Export too large');chunks.push(chunk);}
    const data=Buffer.concat(chunks);
    if(url.pathname==='/export/finish'){
     if(data.subarray(4,8).toString()!=='ftyp')throw new Error('Expected MP4');await writeFile(output,data);status={...status,state:'done',frame:FRAME_COUNT,file:'/video.mp4'};console.log(`DONE ${output}`);
    }else{
     if(data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Expected PNG');await writeFile(path.join(root,'docs/concepts/rowan-entry-poster.png'),data);
    }
    response.end('saved');return;
   }
   response.writeHead(404).end();return;
  }
  if(url.pathname==='/status'){response.setHeader('Content-Type','application/json');response.end(JSON.stringify(status));return;}
  let file;
  if(url.pathname==='/')file=path.join(source,'index.html');
  else if(['/scene.mjs','/sequence.mjs','/mux.mjs'].includes(url.pathname))file=path.join(source,url.pathname.slice(1));
  else if(url.pathname==='/classic.png')file=path.join(root,'docs/concepts/rowan-98-crt.png');
  else if(url.pathname==='/modern.png')file=path.join(root,'docs/concepts/rowan-2026-mixed-type-v3.png');
  else if(url.pathname==='/video.mp4')file=output;
  else if(url.pathname.startsWith('/vendor/three/')){
   const library=path.join(root,'node_modules/three');file=path.resolve(library,decodeURIComponent(url.pathname.slice('/vendor/three/'.length)));if(!file.startsWith(library+path.sep)||!file.endsWith('.js')){response.writeHead(403).end();return;}
  }else{response.writeHead(404).end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.png':'image/png','.mp4':'video/mp4'};
  response.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');response.setHeader('Cache-Control','no-store');response.end(await readFile(file));
 }catch(error){console.error(error.message);response.writeHead(500,{'Content-Type':'text/plain'}).end(error.message);}
}).listen(5188,'127.0.0.1',()=>console.log('Motion renderer: http://127.0.0.1:5188/'));
