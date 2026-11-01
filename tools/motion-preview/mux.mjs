// One silent AVC track; realtime encoding avoids reordered composition timestamps.
const text=value=>new TextEncoder().encode(value);
function join(...parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
function u32(...values){const out=new Uint8Array(values.length*4),view=new DataView(out.buffer);values.forEach((v,i)=>view.setUint32(i*4,v));return out;}
function u16(...values){const out=new Uint8Array(values.length*2),view=new DataView(out.buffer);values.forEach((v,i)=>view.setUint16(i*2,v));return out;}
const zero=n=>new Uint8Array(n);
const box=(type,...parts)=>{const body=join(...parts);return join(u32(body.length+8),text(type),body);};
const full=(type,flags,...parts)=>box(type,u32(flags),...parts);
const matrix=u32(0x10000,0,0,0,0x10000,0,0,0,0x40000000);
export function makeMP4(samples,description,width,height,fps){
  if(!samples.length||!description?.byteLength)throw new Error('Missing AVC samples/configuration');
  const timescale=60000,delta=timescale/fps,duration=samples.length*delta;
  if(!Number.isInteger(delta))throw new Error('Invalid frame timescale');
  for(let i=1;i<samples.length;i++)if(samples[i].timestamp<=samples[i-1].timestamp)throw new Error('Reordered AVC frames');
  const avc1=box('avc1',zero(6),u16(1),zero(16),u16(width,height),u32(0x480000,0x480000,0),u16(1),zero(32),u16(24,65535),box('avcC',new Uint8Array(description)));
  const sizes=full('stsz',0,u32(0,samples.length,...samples.map(s=>s.data.length)));
  const keys=samples.flatMap((s,i)=>s.key?[i+1]:[]);if(keys[0]!==1)throw new Error('First frame is not a keyframe');
  const sync=full('stss',0,u32(keys.length,...keys));
  const ftyp=box('ftyp',text('isom'),u32(512),text('isomiso2avc1mp41'));
  function moov(offset){
    const stbl=box('stbl',full('stsd',0,u32(1),avc1),full('stts',0,u32(1,samples.length,delta)),full('stsc',0,u32(1,1,samples.length,1)),sizes,full('stco',0,u32(1,offset)),sync);
    const minf=box('minf',full('vmhd',1,u16(0,0,0,0)),box('dinf',full('dref',0,u32(1),full('url ',1))),stbl);
    const mdia=box('mdia',full('mdhd',0,u32(0,0,timescale,duration),u16(0x55c4,0)),full('hdlr',0,u32(0),text('vide'),zero(12),text('VideoHandler\0')),minf);
    const tkhd=full('tkhd',7,u32(0,0,1,0,duration),zero(8),u16(0,0,0,0),matrix,u32(width*65536,height*65536));
    const mvhd=full('mvhd',0,u32(0,0,timescale,duration,0x10000),u16(0x100,0),zero(8),matrix,zero(24),u32(2));
    return box('moov',mvhd,box('trak',tkhd,mdia));
  }
  const offset=ftyp.length+moov(0).length+8;
  return new Blob([ftyp,moov(offset),box('mdat',...samples.map(s=>s.data))],{type:'video/mp4'});
}
