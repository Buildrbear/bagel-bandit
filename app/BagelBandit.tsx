"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const W = 960, H = 540;
type Mode = "menu" | "playing" | "won" | "lost";
type Thing = { x:number; y:number; vx:number; vy:number; r:number; kind:"bagel"|"broom"|"coffee"; life:number; spin:number };
type Particle = { x:number;y:number;vx:number;vy:number;life:number;color:string;size:number;text?:string };
type Game = {
  mode:Mode; x:number;y:number;vx:number;vy:number;facing:number; hearts:number; score:number; crumbs:number;
  combo:number; comboClock:number; time:number; dash:number; dashTime:number; invuln:number; spawn:number;
  things:Thing[]; particles:Particle[]; shake:number; boss:{x:number;y:number;vx:number;vy:number;r:number;hp:number;hit:number}|null;
};

const makeGame = ():Game => ({ mode:"menu",x:480,y:300,vx:0,vy:0,facing:1,hearts:3,score:0,crumbs:0,combo:0,comboClock:0,time:90,dash:0,dashTime:0,invuln:0,spawn:0,things:[],particles:[],shake:0,boss:null });

export default function BagelBandit(){
  const canvasRef=useRef<HTMLCanvasElement>(null); const game=useRef<Game>(makeGame()); const keys=useRef(new Set<string>());
  const demo=useRef(false); const [captureAvailable,setCaptureAvailable]=useState(false);
  const [mode,setMode]=useState<Mode>("menu"); const [finalScore,setFinalScore]=useState(0); const audio=useRef<AudioContext|null>(null);
  const beep=useCallback((freq:number,duration=.06,type:OscillatorType="square",volume=.035)=>{ try { const Ctx=window.AudioContext || (window as typeof window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext; if(!Ctx)return; audio.current ??= new Ctx(); const a=audio.current,o=a.createOscillator(),g=a.createGain(); o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(volume,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+duration);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+duration); }catch{} },[]);
  const start=useCallback(()=>{ const n=makeGame();n.mode="playing"; for(let i=0;i<7;i++) n.things.push(spawnBagel()); game.current=n;setMode("playing");beep(220,.08);setTimeout(()=>beep(440,.1),70); },[beep]);
  const recordClip=useCallback(()=>{ const canvas=canvasRef.current;if(!canvas||typeof MediaRecorder==="undefined")return;const n=makeGame();n.mode="playing";n.crumbs=24;n.score=2400;n.invuln=999;for(let i=0;i<8;i++)n.things.push(spawnBagel());game.current=n;demo.current=true;setMode("playing");const chunks:BlobPart[]=[];const recorder=new MediaRecorder(canvas.captureStream(30),{mimeType:"video/webm"});recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{demo.current=false;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(chunks,{type:"video/webm"}));a.download="bagel-bandit-gameplay.webm";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};recorder.start();setTimeout(()=>recorder.stop(),18000);},[]);

  useEffect(()=>setCaptureAvailable(new URLSearchParams(location.search).has("capture")),[]);

  useEffect(()=>{ const down=(e:KeyboardEvent)=>{ const k=e.key.toLowerCase(); if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault(); keys.current.add(k); if((k==="enter"||k===" ")&&game.current.mode!=="playing")start();}; const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase()); addEventListener("keydown",down);addEventListener("keyup",up);return()=>{removeEventListener("keydown",down);removeEventListener("keyup",up)};},[start]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return; let raf=0,last=performance.now();
    const frame=(now:number)=>{ const dt=Math.min((now-last)/1000,.033);last=now;if(demo.current&&game.current.mode==="playing"){keys.current.clear();const g=game.current,target=g.boss??g.things.find(t=>t.kind==="bagel");if(target){const dx=target.x-g.x,dy=target.y-g.y;if(dx>8)keys.current.add("d");if(dx<-8)keys.current.add("a");if(dy>8)keys.current.add("s");if(dy<-8)keys.current.add("w");if(Math.hypot(dx,dy)>90)keys.current.add(" ");}} update(game.current,dt,keys.current,beep,(m)=>{setMode(m);setFinalScore(game.current.score)}); draw(ctx,game.current,now);raf=requestAnimationFrame(frame);};
    raf=requestAnimationFrame(frame);return()=>cancelAnimationFrame(raf);
  },[beep]);

  return <main className="game-page"><div className="shell">
    <header className="masthead"><div className="brand"><small>A TINY PIGEON CRIME SPREE</small>BAGEL BANDIT</div><div className="status-pill">NO LOGIN · NO MERCY · 90 SECONDS</div></header>
    <section className="cabinet" aria-label="Bagel Bandit game"><div className="screen"><canvas ref={canvasRef} width={W} height={H} aria-label="Game arena" />
      {mode!=="playing"&&<div className="overlay"><div className="card">
        {mode==="menu"?<><span className="kicker">URGENT PIGEON BUSINESS</span><h1 className="title">STEAL THE BAGEL.</h1><p className="subtitle">You are a pigeon in a tiny balaclava. Grab 30 bagel chunks, survive the café staff, then dash-bonk the legendary <strong>Everything Bagel</strong>.</p><div className="controls"><span>WASD / ARROWS — WADDLE</span><span>SPACE — CRIME DASH</span></div><button className="start" onClick={start}>Begin the heist ↵</button>{captureAvailable&&<button className="capture" onClick={recordClip}>Record 18s demo</button>}</>:
        <><span className="kicker">{mode==="won"?"ABSOLUTE BREADLARCENY":"THE CAFÉ WON"}</span><h1 className="title">{mode==="won"?"BAGEL ACQUIRED.":"BUSTED."}</h1><p className="subtitle">{mode==="won"?"History will remember this as a completely necessary crime.":"The tiny balaclava fooled nobody. Disgraceful. Try again."}</p><div className="result-score">FINAL SCORE: {finalScore.toLocaleString()}</div><button className="start" onClick={start}>Commit another crime ↵</button></>}
      </div></div>}<div className="scanlines" /></div></section>
    <footer className="bottom"><div><strong>THE JOB:</strong> crumbs → mega bagel → freedom</div><div>Sound on · Best played with both hands and poor judgment</div></footer>
  </div></main>;
}

function spawnBagel():Thing { return {x:80+Math.random()*800,y:115+Math.random()*370,vx:0,vy:0,r:12,kind:"bagel",life:99,spin:Math.random()*6}; }
function burst(g:Game,x:number,y:number,color:string,n=10,text?:string){ for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=50+Math.random()*180;g.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.5,color,size:2+Math.random()*5});} if(text)g.particles.push({x,y:y-10,vx:0,vy:-70,life:.8,color,size:18,text}); }
function hit(a:{x:number;y:number;r:number},b:{x:number;y:number;r:number}){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r}

function update(g:Game,dt:number,keys:Set<string>,beep:(f:number,d?:number,t?:OscillatorType,v?:number)=>void,end:(m:Mode)=>void){
  if(g.mode!=="playing")return; g.time-=dt;g.dash=Math.max(0,g.dash-dt);g.dashTime=Math.max(0,g.dashTime-dt);g.invuln=Math.max(0,g.invuln-dt);g.comboClock-=dt;g.shake=Math.max(0,g.shake-dt*15);
  if(g.comboClock<=0)g.combo=0;
  let dx=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0),dy=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0); const mag=Math.hypot(dx,dy)||1;dx/=mag;dy/=mag;if(dx)g.facing=Math.sign(dx);
  if(keys.has(" ")&&g.dash<=0&&(dx||dy)){g.dash=.8;g.dashTime=.2;g.vx=dx*760;g.vy=dy*760;g.shake=5;beep(135,.08,"sawtooth",.045);}
  const speed=g.dashTime>0?760:250,acc=g.dashTime>0?12:9;g.vx+=(dx*speed-g.vx)*Math.min(1,acc*dt);g.vy+=(dy*speed-g.vy)*Math.min(1,acc*dt);g.x=Math.max(35,Math.min(W-35,g.x+g.vx*dt));g.y=Math.max(105,Math.min(H-35,g.y+g.vy*dt));
  g.spawn-=dt;if(g.spawn<=0){g.spawn=Math.max(.38,1.25-(90-g.time)*.008);const side=Math.floor(Math.random()*4),b:Thing={x:side===0?-30:side===1?W+30:Math.random()*W,y:side===2?-30:side===3?H+30:105+Math.random()*(H-120),vx:0,vy:0,r:18,kind:Math.random()<.78?"broom":"coffee",life:8,spin:0}; if(b.kind==="coffee"){b.x=70+Math.random()*(W-140);b.y=130+Math.random()*(H-180);b.r=24;b.life=5;}else{const a=Math.atan2(g.y-b.y,g.x-b.x)+(Math.random()-.5)*.55;b.vx=Math.cos(a)*(180+Math.random()*90);b.vy=Math.sin(a)*(180+Math.random()*90);}g.things.push(b);}
  for(const t of g.things){t.life-=dt;t.spin+=dt*(t.kind==="broom"?7:2);t.x+=t.vx*dt;t.y+=t.vy*dt;if(t.kind==="bagel"&&hit({x:g.x,y:g.y,r:20},t)){t.life=0;g.crumbs++;g.combo++;g.comboClock=3.2;const mult=Math.min(5,1+Math.floor(g.combo/4));g.score+=100*mult;g.shake=2;burst(g,t.x,t.y,"#ffd24a",12,`+${100*mult}`);beep(480+g.combo*22,.05,"square",.03);if(g.crumbs<30)g.things.push(spawnBagel());}
    if((t.kind==="broom"||t.kind==="coffee")&&hit({x:g.x,y:g.y,r:17},t)){if(g.dashTime>0&&t.kind==="broom"){t.life=0;g.score+=250;g.shake=7;burst(g,t.x,t.y,"#70e0ad",18,"BONK +250");beep(115,.12,"square",.06);}else if(g.invuln<=0){g.hearts--;g.invuln=1.35;g.combo=0;g.shake=12;burst(g,g.x,g.y,"#ff4e36",22,"RUDE!");beep(75,.22,"sawtooth",.07);if(g.hearts<=0){g.mode="lost";end("lost");}}}}
  g.things=g.things.filter(t=>t.life>0&&t.x>-80&&t.x<W+80&&t.y>-80&&t.y<H+80);
  if(g.crumbs>=30&&!g.boss){g.boss={x:W-105,y:270,vx:-130,vy:70,r:62,hp:6,hit:0};burst(g,700,270,"#ff4e36",30,"THE EVERYTHING BAGEL!");beep(65,.45,"sawtooth",.06);}
  if(g.boss){const b=g.boss;b.hit=Math.max(0,b.hit-dt);b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<90||b.x>W-90)b.vx*=-1;if(b.y<165||b.y>H-80)b.vy*=-1;if(hit({x:g.x,y:g.y,r:20},b)){if(g.dashTime>0&&b.hit<=0){b.hp--;b.hit=.55;g.vx*=-.55;g.vy*=-.55;g.score+=500;g.shake=14;burst(g,b.x,b.y,"#ffd24a",26,`BAGEL BONK ${6-b.hp}/6`);beep(95+b.hp*30,.12,"square",.07);if(b.hp<=0){g.score+=3000;g.mode="won";end("won");}}else if(g.invuln<=0&&b.hit<=0){g.hearts--;g.invuln=1.3;g.shake=12;beep(70,.2,"sawtooth",.07);if(g.hearts<=0){g.mode="lost";end("lost");}}}}
  for(const p of g.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy=p.text?p.vy:p.vy+240*dt;}g.particles=g.particles.filter(p=>p.life>0);
  if(g.time<=0&&g.mode==="playing"){g.mode="lost";end("lost");}
}

function draw(ctx:CanvasRenderingContext2D,g:Game,now:number){
  ctx.save();const sx=(Math.random()-.5)*g.shake,sy=(Math.random()-.5)*g.shake;ctx.translate(sx,sy);ctx.fillStyle="#b9dcc7";ctx.fillRect(-20,-20,W+40,H+40);
  ctx.fillStyle="#d8c394";ctx.fillRect(0,88,W,H-88);for(let y=105;y<H;y+=54){for(let x=(Math.floor(y/54)%2)*54;x<W;x+=108){ctx.fillStyle="rgba(66,49,58,.07)";ctx.fillRect(x,y,54,54)}}
  ctx.fillStyle="#201926";ctx.fillRect(0,0,W,88);ctx.fillStyle="#fff4d6";ctx.font="700 18px var(--font-mono)";ctx.fillText(`CRUMBS ${Math.min(g.crumbs,30)}/30`,24,34);ctx.fillText(`TIME ${Math.max(0,Math.ceil(g.time))}`,24,65);ctx.fillStyle="#ff4e36";ctx.fillText("♥".repeat(g.hearts)+"♡".repeat(3-g.hearts),210,51);ctx.fillStyle="#ffd24a";ctx.font="400 26px var(--font-display)";ctx.textAlign="right";ctx.fillText(g.score.toString().padStart(6,"0"),W-24,51);ctx.textAlign="left";
  if(g.combo>1){ctx.fillStyle="#ff4e36";ctx.font="400 18px var(--font-display)";ctx.fillText(`${g.combo}x CRIME SPREE`,400,52);}
  for(const t of g.things){if(t.kind==="bagel"){ctx.save();ctx.translate(t.x,t.y+Math.sin(now/180+t.spin)*3);ctx.rotate(t.spin);ctx.fillStyle="#c67a31";ctx.beginPath();ctx.arc(0,0,14,0,7);ctx.fill();ctx.fillStyle="#ffe7a4";ctx.beginPath();ctx.arc(0,0,6,0,7);ctx.fill();ctx.fillStyle="#17131d";for(let i=0;i<5;i++)ctx.fillRect(Math.cos(i*2)*8,Math.sin(i*2)*8,2,2);ctx.restore();}else if(t.kind==="broom"){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(Math.atan2(t.vy,t.vx));ctx.fillStyle="#7f4b2e";ctx.fillRect(-35,-4,54,8);ctx.fillStyle="#ff4e36";ctx.fillRect(15,-17,28,34);ctx.fillStyle="#fff4d6";for(let i=-12;i<14;i+=8)ctx.fillRect(39,i,10,3);ctx.restore();}else{ctx.fillStyle="rgba(92,45,27,.72)";ctx.beginPath();ctx.ellipse(t.x,t.y,30,20,Math.sin(t.spin)*.2,0,7);ctx.fill();ctx.fillStyle="rgba(255,244,214,.55)";ctx.font="700 10px var(--font-mono)";ctx.textAlign="center";ctx.fillText("HOT",t.x,t.y+3);ctx.textAlign="left";}}
  if(g.boss){const b=g.boss;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(now/270);ctx.fillStyle=b.hit>0&&Math.floor(now/50)%2?"#fff4d6":"#bd6f2a";ctx.beginPath();ctx.arc(0,0,b.r,0,7);ctx.fill();ctx.fillStyle="#f3cb79";ctx.beginPath();ctx.arc(0,0,27,0,7);ctx.fill();for(let i=0;i<26;i++){ctx.fillStyle=i%3?"#17131d":"#fff4d6";ctx.fillRect(Math.cos(i*1.9)*45,Math.sin(i*1.9)*45,4,2)}ctx.restore();ctx.fillStyle="#201926";ctx.fillRect(330,98,300,15);ctx.fillStyle="#ff4e36";ctx.fillRect(334,102,292*(b.hp/6),7);ctx.fillStyle="#201926";ctx.font="700 12px var(--font-mono)";ctx.textAlign="center";ctx.fillText("THE EVERYTHING BAGEL — DASH TO BONK",480,132);ctx.textAlign="left";}
  drawPigeon(ctx,g.x,g.y,g.facing,g.invuln>0&&Math.floor(now/70)%2===0,g.dashTime>0,now);
  for(const p of g.particles){ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.color;if(p.text){ctx.font=`400 ${p.size}px var(--font-display)`;ctx.textAlign="center";ctx.fillText(p.text,p.x,p.y);ctx.textAlign="left";}else{ctx.fillRect(p.x,p.y,p.size,p.size)}}ctx.globalAlpha=1;
  if(g.mode==="playing"&&!g.boss&&g.crumbs<30){ctx.fillStyle="rgba(32,25,38,.75)";ctx.fillRect(350,H-40,260,24);ctx.fillStyle="#fff4d6";ctx.font="700 11px var(--font-mono)";ctx.textAlign="center";ctx.fillText(g.crumbs<3?"GRAB BAGELS · SPACE TO DASH":"KEEP THE CRIME SPREE ALIVE",480,H-24);ctx.textAlign="left";}
  ctx.restore();
}

function drawPigeon(ctx:CanvasRenderingContext2D,x:number,y:number,face:number,blink:boolean,dash:boolean,now:number){if(blink)return;ctx.save();ctx.translate(x,y);ctx.scale(face,1);if(dash){ctx.fillStyle="rgba(255,255,255,.28)";for(let i=1;i<4;i++)ctx.fillRect(-24-i*15,-10,i*10,5)}ctx.fillStyle="#526c78";ctx.beginPath();ctx.ellipse(0,7,24,19,0,0,7);ctx.fill();ctx.fillStyle="#70e0ad";ctx.beginPath();ctx.arc(12,-10,15,0,7);ctx.fill();ctx.fillStyle="#35454e";ctx.beginPath();ctx.moveTo(2,-15);ctx.lineTo(23,-28);ctx.lineTo(28,-8);ctx.lineTo(8,-4);ctx.fill();ctx.fillStyle="#17131d";ctx.fillRect(15,-15,5,5);ctx.fillStyle="#ffb52f";ctx.beginPath();ctx.moveTo(25,-9);ctx.lineTo(39,-4);ctx.lineTo(25,-1);ctx.fill();ctx.strokeStyle="#ff4e36";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-5,22);ctx.lineTo(-7,29+Math.sin(now/80)*3);ctx.moveTo(9,22);ctx.lineTo(12,29-Math.sin(now/80)*3);ctx.stroke();ctx.restore();}
