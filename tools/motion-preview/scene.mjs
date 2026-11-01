import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FPS, FRAME_COUNT, DURATION, shotAt, handoffAt, ease, clamp } from './sequence.mjs';
import { makeMP4 } from './mux.mjs';

const width = 1280, height = 800;
const film = document.querySelector('#film'), ctx = film.getContext('2d');
const status = document.querySelector('#status');
const play = document.querySelector('#play'), exportButton = document.querySelector('#export');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(width, height);
renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#171b19');
scene.fog = new THREE.Fog('#171b19', 18, 42);
const camera = new THREE.PerspectiveCamera(40, width / height, .05, 60);
const overview = new THREE.Vector3(0, 3.15, 12.4);
const overviewTarget = new THREE.Vector3(0, .10, 0);
const environmentScene = new RoomEnvironment();
const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(environmentScene, .025);
scene.environment = environment.texture;
scene.environmentIntensity = .30;
environmentScene.dispose(); pmrem.dispose();
scene.add(new THREE.HemisphereLight('#dde1dc', '#161a16', .8));
const key = new THREE.DirectionalLight('#ffe9cd', 3.6);
key.position.set(-3, 8, 6); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -11, right: 11, top: 9, bottom: -7, near: .5, far: 30 });
key.shadow.bias = -.0003; key.shadow.normalBias = .025;
scene.add(key);
const fill = new THREE.DirectionalLight('#a8c2db', 1.25); fill.position.set(7, 4, 0); scene.add(fill);
const rim = new THREE.DirectionalLight('#c5d6b9', 1.8); rim.position.set(0, 6, -7); scene.add(rim);

function block(w,h,d,color,roughness=.6,metalness=0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness,metalness}));
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
const floor = new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:'#252a27',roughness:.85}));
floor.rotation.x = -Math.PI/2; floor.position.y = -2.7; floor.receiveShadow = true; scene.add(floor);
const wall = block(40,18,.3,'#171c19',.92); wall.position.set(0,4,-6); scene.add(wall);

function desk(x) {
  const group = new THREE.Group(); group.position.x = x;
  const top = block(5.35,.15,2.1,'#333934',.48); top.position.set(0,-.83,-.12); group.add(top);
  const edge = block(5.35,.045,2.1,'#202b23',.6); edge.position.set(0,-.93,-.12); group.add(edge);
  for (const xx of [-2.24,2.24]) for (const zz of [-.81,.66]) {
    const leg=block(.10,1.70,.10,'#242e28',.43,.55); leg.position.set(xx,-1.85,zz); group.add(leg);
  }
  const brace=block(4.6,.09,.09,'#29372e',.5,.4);brace.position.set(0,-1.45,-.8);group.add(brace);
  scene.add(group);
}
desk(-3.08); desk(3.08);

function roundedShape(w,h,r) {
  const shape=new THREE.Shape();const x=-w/2,y=-h/2;
  shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
  shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
  shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape;
}
async function loadImage(url) {
  const image=new Image(); image.src=url; await image.decode(); return image;
}
const images=await Promise.all([loadImage('/classic.png'),loadImage('/modern.png')]);
const monitorWidth=4.48,monitorHeight=2.8;
const monitors=images.map((image,index)=>{
  const group=new THREE.Group();group.position.set(index ? 3.08 : -3.08,1.04,0);group.rotation.y=index ? -.075 : .075;
  const depth=index ? .12 : .94;
  const geometry=new THREE.ExtrudeGeometry(roundedShape(monitorWidth-.04,monitorHeight-.04,index ? .06 : .14),{depth,bevelEnabled:true,bevelThickness:index ? .025 : .06,bevelSize:index ? .025 : .06,bevelSegments:4,steps:1,curveSegments:12});
  geometry.translate(0,0,-depth-.10);
  const body=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:index ? '#303a36' : '#30382f',roughness:index ? .36 : .68,metalness:index ? .72 : 0}));body.castShadow=true;body.receiveShadow=true;group.add(body);
  const texture=new THREE.Texture(image);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const front=new THREE.Mesh(new THREE.PlaneGeometry(monitorWidth,monitorHeight),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));front.position.z=.012;group.add(front);
  const neck=block(index ? .18 : .6,.48,index ? .12 : .45,index ? '#464f48' : '#333d31',.45,index ? .75 : 0);neck.position.set(0,-1.63,-.20);group.add(neck);
  const base=block(index ? 1.35 : 1.9,.08,index ? .65 : .85,index ? '#3d4941' : '#343f32',.43,index ? .65 : 0);base.position.set(0,-1.82,-.1);group.add(base);
  scene.add(group);
  const spill=new THREE.PointLight(index ? '#d9e6ff' : '#29c2ba',index ? 3.2 : 2.3,4.5,2);spill.position.set(group.position.x,.13,.85);scene.add(spill);
  return {group,front,image,index};
});
scene.updateMatrixWorld(true);
const fitDistance=(monitorHeight/2)/Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
const destinations=monitors.map(({group,front})=>{
  const target=front.getWorldPosition(new THREE.Vector3());
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(group.quaternion);
  const position=target.clone().addScaledVector(normal,fitDistance);
  const curve=new THREE.CubicBezierCurve3(overview.clone(),overview.clone().add(new THREE.Vector3(0,-.12,-1.1)),position.clone().addScaledVector(normal,2.8).add(new THREE.Vector3(0,.12,0)),position);
  return {target,position,curve};
});

function placeCamera(era,progress) {
  const dest=destinations[era];camera.position.copy(dest.curve.getPoint(progress));
  camera.lookAt(new THREE.Vector3().lerpVectors(overviewTarget,dest.target,progress));camera.updateMatrixWorld();
}
// Check the endpoint against the actual projected front before exporting hundreds of frames.
for (const [index,monitor] of monitors.entries()) {
  placeCamera(index,1);
  const corner=new THREE.Vector3(monitorWidth/2,monitorHeight/2,0).applyMatrix4(monitor.front.matrixWorld).project(camera);
  if (Math.abs(corner.x-1)>.0001 || Math.abs(corner.y-1)>.0001) throw new Error('Camera/screen endpoint does not register');
}

function rect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function picker(t,shot) {
  if(!shot.chooser)return;
  const alpha=shot.chooser, x=390,y=615,w=500,h=144;
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(0,(1-alpha)*10);
  ctx.shadowColor='#0009';ctx.shadowBlur=30;ctx.shadowOffsetY=12;ctx.fillStyle='#f0f0e9';rect(x,y,w,h,12);ctx.fill();ctx.shadowColor='transparent';
  ctx.fillStyle='#202722';ctx.font='500 22px system-ui';ctx.fillText('Choose your',x+27,y+37);
  ctx.font='italic 25px Georgia';ctx.fillText('computer.',x+165,y+37);
  const labels=[['Rowan 98','1998 · Classic'],['Rowan','2026 · Modern']];
  for(let i=0;i<2;i++){
    const bx=x+24+i*230,by=y+57,selected=shot.selected===i;
    ctx.fillStyle=selected?'#e4e9de':'#ffffff';ctx.strokeStyle=selected?'#9d3d2b':'#d1d6cc';ctx.lineWidth=selected?2:1;rect(bx,by,222,66,7);ctx.fill();ctx.stroke();
    ctx.fillStyle='#202722';ctx.font='600 17px system-ui';ctx.fillText(labels[i][0],bx+16,by+26);
    ctx.fillStyle='#626c60';ctx.font='12px system-ui';ctx.fillText(labels[i][1],bx+16,by+46);
    ctx.fillStyle=selected?'#9d3d2b':'#9ca694';ctx.beginPath();ctx.arc(bx+201,by+22,3,0,Math.PI*2);ctx.fill();
  }
  const local=t<5?clamp((t-.9)/.8):clamp((t-6.55)/.7);
  const destinationX=x+24+shot.era*230+155,destinationY=y+91;
  const px=THREE.MathUtils.lerp(987,destinationX,ease(local)),py=THREE.MathUtils.lerp(774,destinationY,ease(local));
  ctx.translate(px,py);ctx.shadowColor='#0006';ctx.shadowBlur=4;ctx.shadowOffsetY=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,20);ctx.lineTo(5,15);ctx.lineTo(10,25);ctx.lineTo(14,23);ctx.lineTo(9,13);ctx.lineTo(17,13);ctx.closePath();ctx.fillStyle='#fff';ctx.strokeStyle='#252b27';ctx.lineWidth=1.1;ctx.fill();ctx.stroke();ctx.restore();
}

function renderFrame(time) {
  const shot=shotAt(time);placeCamera(shot.era,shot.progress);
  renderer.render(scene,camera);
  ctx.clearRect(0,0,width,height);ctx.drawImage(renderer.domElement,0,0);
  const handoff=handoffAt(shot.progress);
  if(handoff){ctx.globalAlpha=handoff;ctx.drawImage(images[shot.era],0,0,width,height);ctx.globalAlpha=1;}
  picker(time,shot);return shot;
}

await renderer.compileAsync(scene,camera);
renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
const encoderConfig={codec:'avc1.420028',width,height,bitrate:8_000_000,framerate:FPS,latencyMode:'realtime',avc:{format:'avc'}};
const encoderSupport=await VideoEncoder.isConfigSupported(encoderConfig);
if(!encoderSupport.supported)throw new Error('H.264 export is not supported by this browser');
renderFrame(1.0);status.textContent='Ready · 12 seconds';play.disabled=false;exportButton.disabled=false;
let playing=false;
play.addEventListener('click',()=>{
  if(playing)return;playing=true;play.disabled=true;exportButton.disabled=true;
  const start=performance.now();
  function tick(now){const t=Math.min((now-start)/1000,DURATION);const shot=renderFrame(t);status.textContent=shot.phase;if(t<DURATION)requestAnimationFrame(tick);else{playing=false;play.disabled=false;exportButton.disabled=false;}}
  requestAnimationFrame(tick);
});
const png=()=>new Promise((resolve,reject)=>film.toBlob(blob=>blob?resolve(blob):reject(new Error('Frame capture failed')),'image/png'));
async function send(path,body){const response=await fetch(path,{method:'POST',body});if(!response.ok)throw new Error(await response.text());return response;}
exportButton.addEventListener('click',async()=>{
  play.disabled=true;exportButton.disabled=true;
  try{
    renderFrame(1);await send('/export/poster',await png());await send('/export/start');
    const samples=[];let description,encodingError;
    const encoder=new VideoEncoder({output(chunk,metadata){const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);samples.push({data,timestamp:chunk.timestamp,key:chunk.type==='key'});if(metadata?.decoderConfig?.description)description=metadata.decoderConfig.description;},error(error){encodingError=error;}});
    encoder.configure(encoderConfig);
    for(let frame=0;frame<FRAME_COUNT;frame++){
      if(encodingError)throw encodingError;
      renderFrame(frame/FPS);const image=new VideoFrame(film,{timestamp:Math.round(frame*1e6/FPS),duration:Math.round(1e6/FPS)});
      encoder.encode(image,{keyFrame:frame%120===0});image.close();if(frame%8===7)await encoder.flush();
      if(frame%15===0)status.textContent=`Rendering ${frame+1} / ${FRAME_COUNT}`;
      if(frame%60===59)await send(`/export/progress?frame=${frame+1}`);
    }
    await encoder.flush();encoder.close();if(encodingError)throw encodingError;
    if(samples.length!==FRAME_COUNT)throw new Error('Video frame count mismatch');
    status.textContent='Finalizing MP4…';await send('/export/finish',makeMP4(samples,description,width,height,FPS));
    status.textContent='Export complete · 60fps';document.querySelector('#download').hidden=false;
  }catch(error){status.textContent=`Export failed: ${error.message}`;console.error(error);}
  finally{play.disabled=false;exportButton.disabled=false;}
});
