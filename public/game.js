import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js';

const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const COST=2;
let wallet=Number(localStorage.getItem('myLumoWallet')||20);
let lastServer=null, toastTimer=null, lastCompletedId=0, activeServerId=0;
let currentAction='idle', actionStart=0, actionDuration=4000, targetPos=null, actionPhase=0;

function setWallet(n){wallet=Math.max(0,Math.floor(n));localStorage.setItem('myLumoWallet',String(wallet));$('#walletTop').textContent=wallet}
function toast(msg,error=false){const el=$('#toast');el.textContent=msg;el.classList.toggle('error',error);el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function relative(iso){const m=Math.floor((Date.now()-new Date(iso).getTime())/60000);if(m<1)return'most';if(m<60)return m+' perce';const h=Math.floor(m/60);return h<24?h+' órája':Math.floor(h/24)+' napja'}

setWallet(wallet);

// renderer + scene
const wrap=$('#gameCanvasWrap');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fc7df);
scene.fog=new THREE.FogExp2(0x9fcbdc,0.008);

const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,1000);
camera.position.set(14,9,16);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
wrap.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.06;
controls.minDistance=5;
controls.maxDistance=28;
controls.maxPolarAngle=Math.PI*.48;
controls.target.set(0,2,0);

scene.add(new THREE.HemisphereLight(0xdff4ff,0x355030,2.8));
const sun=new THREE.DirectionalLight(0xfff2cf,4.2);sun.position.set(-14,22,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;scene.add(sun);

// materials
const mat=(color,rough=.75)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:0});
const white=mat(0xf7f7f1,.92), furShade=mat(0xe6e8e4,.95), pink=mat(0xf3a7b8,.8), dark=mat(0x263340,.72), blueEye=mat(0x28a9ff,.25), black=mat(0x0b1015,.45), gold=mat(0xd7ad46,.4);
const grass=mat(0x4b853f,1), dirt=mat(0x8a714f,1), road=mat(0x65707c,1), sand=mat(0xd8bd82,1), water=mat(0x2b98c9,.25);
const wood=mat(0x8b572f,1), roof=mat(0xa94635,1), cityMat=mat(0xbfc7cf,.85), glassMat=mat(0x72b8df,.15), red=mat(0xd53e34,.5);

// ground/world
const ground=new THREE.Mesh(new THREE.CircleGeometry(90,64),grass);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const path=new THREE.Mesh(new THREE.BoxGeometry(7,.08,58),road);path.position.set(17,.02,-8);path.rotation.y=-.18;path.receiveShadow=true;scene.add(path);
const beach=new THREE.Mesh(new THREE.CircleGeometry(17,48),sand);beach.rotation.x=-Math.PI/2;beach.position.set(-28,.03,-23);beach.receiveShadow=true;scene.add(beach);
const sea=new THREE.Mesh(new THREE.CircleGeometry(31,64),water);sea.rotation.x=-Math.PI/2;sea.position.set(-43,-.02,-32);scene.add(sea);

// trees
function tree(x,z,s=1){
  const g=new THREE.Group();
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22*s,.32*s,2.2*s,8),wood);trunk.position.y=1.1*s;trunk.castShadow=true;g.add(trunk);
  const crown1=new THREE.Mesh(new THREE.ConeGeometry(1.3*s,2.9*s,10),mat(0x2f6c37,1));crown1.position.y=3.0*s;crown1.castShadow=true;g.add(crown1);
  const crown2=new THREE.Mesh(new THREE.ConeGeometry(1.05*s,2.4*s,10),mat(0x397e3f,1));crown2.position.y=4.15*s;crown2.castShadow=true;g.add(crown2);
  g.position.set(x,0,z);scene.add(g);return g;
}
for(let i=0;i<40;i++){const a=i*.82;const r=16+(i%7)*2.8;tree(Math.cos(a)*r-3,Math.sin(a)*r+4,.7+(i%5)*.08)}

// mountains
for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.ConeGeometry(5+i*.25,10+i*.5,5),mat(0x66756f,1));m.position.set(-34+i*9,4,-42-(i%2)*5);m.rotation.y=i*.4;scene.add(m)}

// city
const city=new THREE.Group();city.position.set(30,0,-12);scene.add(city);
for(let i=0;i<16;i++){const h=4+(i%5)*2.3;const b=new THREE.Mesh(new THREE.BoxGeometry(3.2,h,3.2),i%3?cityMat:glassMat);b.position.set((i%4)*4.1-6.2,h/2,Math.floor(i/4)*4.3-6.5);b.castShadow=true;b.receiveShadow=true;city.add(b)}
const pizzaShop=new THREE.Group();pizzaShop.position.set(24,0,-3);scene.add(pizzaShop);
const shopBody=new THREE.Mesh(new THREE.BoxGeometry(6,3.6,5),mat(0xc8895a,1));shopBody.position.y=1.8;shopBody.castShadow=true;pizzaShop.add(shopBody);
const awning=new THREE.Mesh(new THREE.BoxGeometry(6.4,.35,1.6),red);awning.position.set(0,2.7,2.7);pizzaShop.add(awning);

// home
const home=new THREE.Group();home.position.set(-12,0,17);scene.add(home);
const hb=new THREE.Mesh(new THREE.BoxGeometry(6,4,5),mat(0xd5a66f,1));hb.position.y=2;hb.castShadow=true;home.add(hb);
const hr=new THREE.Mesh(new THREE.ConeGeometry(4.6,2.6,4),roof);hr.position.y=5;hr.rotation.y=Math.PI/4;hr.castShadow=true;home.add(hr);

// beach props
const palmTrunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.35,5,8),wood);palmTrunk.position.set(-23,2.5,-21);palmTrunk.rotation.z=-.12;scene.add(palmTrunk);
for(let i=0;i<6;i++){const leaf=new THREE.Mesh(new THREE.BoxGeometry(.25,.12,4),mat(0x2d7c49,1));leaf.position.set(-23,5.2,-21);leaf.rotation.y=i*Math.PI/3;leaf.rotation.z=.35;scene.add(leaf)}

// car
const car=new THREE.Group();car.position.set(20,.35,-7);scene.add(car);
const carBody=new THREE.Mesh(new THREE.BoxGeometry(3.6,.9,1.8),red);carBody.position.y=.7;carBody.castShadow=true;car.add(carBody);
const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.9,.8,1.5),glassMat);cabin.position.set(.1,1.35,0);car.add(cabin);
for(const x of [-1.2,1.2])for(const z of [-.9,.9]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.28,16),black);w.rotation.x=Math.PI/2;w.position.set(x,.35,z);car.add(w)}

// chicken & dog
function animal(type,pos){
 const g=new THREE.Group();
 const color=type==='dog'?0xb87f4a:0xf1efe6;
 const body=new THREE.Mesh(new THREE.SphereGeometry(.65,18,14),mat(color,1));body.scale.set(1.2,.85,1);body.position.y=.7;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.43,18,14),mat(color,1));head.position.set(.55,1.15,0);g.add(head);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),black);eye.position.set(.91,1.23,.25);g.add(eye);
 if(type==='chicken'){const comb=new THREE.Mesh(new THREE.SphereGeometry(.13,8,8),red);comb.position.set(.55,1.58,0);g.add(comb)}
 g.position.copy(pos);scene.add(g);return g;
}
const dog=animal('dog',new THREE.Vector3(10,0,10));const chicken=animal('chicken',new THREE.Vector3(-8,0,13));

// LUMO character
function makeLumo(){
  const g=new THREE.Group(); g.name='Lumo';
  const body=new THREE.Mesh(new THREE.SphereGeometry(1.05,32,24),white);body.scale.set(.9,1.15,.82);body.position.y=1.45;body.castShadow=true;g.add(body);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(.63,24,18),furShade);chest.scale.set(.9,1.15,.35);chest.position.set(0,1.35,.72);g.add(chest);
  const head=new THREE.Mesh(new THREE.SphereGeometry(1.14,36,28),white);head.scale.set(1.03,.92,.96);head.position.y=3.02;head.castShadow=true;g.add(head);
  // ears
  for(const s of [-1,1]){
    const ear=new THREE.Mesh(new THREE.ConeGeometry(.48,1.05,4),white);ear.position.set(.65*s,4.03,0);ear.rotation.z=-s*.2;ear.rotation.y=Math.PI/4;ear.castShadow=true;g.add(ear);
    const inner=new THREE.Mesh(new THREE.ConeGeometry(.28,.68,4),pink);inner.position.set(.65*s,4.03,.09);inner.rotation.z=-s*.2;inner.rotation.y=Math.PI/4;g.add(inner);
  }
  // eyes
  for(const s of [-1,1]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.27,20,16),blueEye);eye.scale.set(.82,1.2,.38);eye.position.set(.43*s,3.17,.95);g.add(eye);
    const pupil=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),black);pupil.scale.set(.72,1.3,.35);pupil.position.set(.43*s,3.15,1.16);g.add(pupil);
    const shine=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),mat(0xffffff,.1));shine.position.set(.37*s,3.28,1.25);g.add(shine);
  }
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),pink);nose.scale.set(1,.65,.65);nose.position.set(0,2.93,1.12);g.add(nose);
  const muzzleL=new THREE.Mesh(new THREE.SphereGeometry(.22,14,12),white);muzzleL.scale.set(1.3,.7,.75);muzzleL.position.set(-.18,2.76,1.08);g.add(muzzleL);
  const muzzleR=muzzleL.clone();muzzleR.position.x=.18;g.add(muzzleR);
  // legs
  for(const s of [-1,1]){
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.24,.7,8,12),white);leg.position.set(.42*s,.55,.18);leg.castShadow=true;g.add(leg);leg.userData.side=s;leg.name='leg';
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.20,.72,8,12),white);arm.position.set(.66*s,1.65,.18);arm.rotation.z=s*.25;g.add(arm);arm.userData.side=s;arm.name='arm';
  }
  // tail
  const tail=new THREE.Mesh(new THREE.TorusGeometry(.72,.17,12,24,Math.PI*1.35),white);tail.rotation.set(Math.PI/2,.2,-.7);tail.position.set(-.85,1.25,-.25);g.add(tail);tail.name='tail';
  // medal
  const collar=new THREE.Mesh(new THREE.TorusGeometry(.72,.06,10,28),mat(0x4386b4,.35));collar.rotation.x=Math.PI/2;collar.position.set(0,2.25,.05);g.add(collar);
  const medal=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.07,24),gold);medal.rotation.x=Math.PI/2;medal.position.set(0,2.15,.82);g.add(medal);
  g.scale.set(.72,.72,.72);
  g.position.set(0,0,4);
  scene.add(g); return g;
}
const lumo=makeLumo();
const legs=$$('none'); // no-op to keep browser syntax simple
const limbLegs=lumo.children.filter(o=>o.name==='leg'), limbArms=lumo.children.filter(o=>o.name==='arm'), tail=lumo.children.find(o=>o.name==='tail');

// props held/eaten
const pizza=new THREE.Group();pizza.visible=false;scene.add(pizza);
const crust=new THREE.Mesh(new THREE.CylinderGeometry(.75,.75,.12,24),mat(0xd59a47,1));crust.rotation.x=Math.PI/2;pizza.add(crust);
const cheese=new THREE.Mesh(new THREE.CylinderGeometry(.68,.68,.13,24),mat(0xf2cf55,.8));cheese.rotation.x=Math.PI/2;cheese.position.z=.04;pizza.add(cheese);
for(let i=0;i<5;i++){const pep=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.03,12),red);pep.rotation.x=Math.PI/2;pep.position.set(Math.cos(i*1.2)*.35,Math.sin(i*1.2)*.35,.12);pizza.add(pep)}

const guitar=new THREE.Group();guitar.visible=false;scene.add(guitar);
const gb=new THREE.Mesh(new THREE.SphereGeometry(.52,18,14),mat(0xb26935,.6));gb.scale.set(.8,1.1,.22);guitar.add(gb);
const neck=new THREE.Mesh(new THREE.BoxGeometry(.14,1.6,.12),wood);neck.position.y=.95;guitar.add(neck);

// destinations
const destinations={
  forest:new THREE.Vector3(0,0,4),
  city:new THREE.Vector3(25,0,-8),
  pizza:new THREE.Vector3(22,0,-1),
  beach:new THREE.Vector3(-27,0,-20),
  home:new THREE.Vector3(-10,0,13),
  mountain:new THREE.Vector3(-4,0,-26),
  car:new THREE.Vector3(18,0,-6),
  friend:new THREE.Vector3(9,0,9),
  chicken:new THREE.Vector3(-7,0,12),
  house:new THREE.Vector3(-11,0,15)
};

function actionTarget(a){
 if(['city','pizza','beach','home','mountain','car','friend','chicken','house','forest'].includes(a)) return destinations[a==='forest'?'forest':a].clone();
 return null;
}

function beginAction(item){
 activeServerId=item.id; currentAction=item.action||'explore'; actionStart=performance.now(); actionDuration=Math.max(2500,(item.completeAt||Date.now()+4000)-(item.startedAt||Date.now()));
 actionPhase=0; targetPos=actionTarget(currentAction);
 $('#taskText').textContent='#'+item.id+' · '+item.command;
}

function faceDirection(dir){
 if(dir.lengthSq()<.0001)return;
 const ang=Math.atan2(dir.x,dir.z); lumo.rotation.y=ang;
}

function walkTo(target,t){
 const p=Math.min(1,t/actionDuration);
 const dir=target.clone().sub(lumo.position);dir.y=0;faceDirection(dir);
 const speed=Math.min(.075,dir.length()*.08);
 if(dir.length()>.25){dir.normalize();lumo.position.addScaledVector(dir,speed)}
 const step=Math.sin(performance.now()*.012)*.42;
 limbLegs.forEach((leg,i)=>leg.rotation.x=(i?1:-1)*step);
 limbArms.forEach((arm,i)=>arm.rotation.x=(i?-1:1)*step*.7);
 lumo.position.y=Math.abs(Math.sin(performance.now()*.012))*.05;
 return p;
}

function animateAction(now){
 const t=now-actionStart;
 pizza.visible=false;guitar.visible=false;
 if(currentAction==='idle'){lumo.position.y=0;tail.rotation.z=-.7+Math.sin(now*.003)*.15;return}
 if(targetPos && actionPhase===0){
   walkTo(targetPos,t);
   if(lumo.position.distanceTo(targetPos)<.7 || t>actionDuration*.62){actionPhase=1;actionStart=now}
   return;
 }
 const local=now-actionStart;
 if(currentAction==='dance'){
   lumo.rotation.z=Math.sin(local*.012)*.22;lumo.position.y=Math.abs(Math.sin(local*.015))*.32;
   limbArms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(1.0+Math.sin(local*.018)*.4));
 } else if(currentAction==='pizza'){
   pizza.visible=true;pizza.position.copy(lumo.position).add(new THREE.Vector3(.8,2.1,.65));
   const bite=Math.abs(Math.sin(local*.008));lumo.rotation.x=-bite*.08;pizza.scale.setScalar(1-bite*.12);
 } else if(currentAction==='guitar'){
   guitar.visible=true;guitar.position.copy(lumo.position).add(new THREE.Vector3(.7,1.6,.55));guitar.rotation.z=-.5;
   limbArms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(.7+Math.sin(local*.02)*.2));
 } else if(currentAction==='car'){
   car.position.x+=Math.sin(local*.004)*.002;lumo.position.copy(car.position).add(new THREE.Vector3(0,1.2,0));lumo.rotation.y=Math.PI/2;
 } else if(currentAction==='friend'){
   lumo.rotation.y=Math.atan2(dog.position.x-lumo.position.x,dog.position.z-lumo.position.z);lumo.position.y=Math.abs(Math.sin(local*.01))*.08;
 } else if(currentAction==='chicken'){
   lumo.rotation.y=Math.atan2(chicken.position.x-lumo.position.x,chicken.position.z-lumo.position.z);lumo.position.y=Math.abs(Math.sin(local*.01))*.08;
 } else if(currentAction==='house'){
   lumo.rotation.y=Math.sin(local*.004)*.2;limbArms.forEach((a,i)=>a.rotation.x=(i?1:-1)*Math.sin(local*.018)*.7);
 } else if(currentAction==='sleep'){
   lumo.rotation.z=-Math.PI/2;lumo.position.y=.65;
 } else {
   lumo.position.y=Math.abs(Math.sin(local*.009))*.06;
 }
 tail.rotation.z=-.7+Math.sin(now*.004)*.15;
}

function finishAction(){currentAction='idle';activeServerId=0;lumo.rotation.x=0;lumo.rotation.z=0;limbLegs.forEach(x=>x.rotation.x=0);limbArms.forEach(x=>{x.rotation.x=0;x.rotation.z=x.userData.side*.25});pizza.visible=false;guitar.visible=false}

// camera follows Lumo
const desiredCam=new THREE.Vector3();
function followCamera(){
 controls.target.lerp(new THREE.Vector3(lumo.position.x,lumo.position.y+1.8,lumo.position.z),.06);
 if(!controls._dragging){ /* orbit controls handles user camera */ }
}

// UI/server
function country(){const l=(navigator.language||'').toLowerCase();if(l.startsWith('ro'))return'🇷🇴 Románia';if(l.startsWith('hu'))return'🇭🇺 Magyarország';if(l==='en-us')return'🇺🇸 USA';if(l.startsWith('en'))return'🇬🇧 Egyesült Királyság';if(l.startsWith('de'))return'🇩🇪 Németország';return'🌍 Világ'}
async function submitCommand(text){
 text=String(text||'').trim();if(!text)return toast('Írj egy parancsot.',true);if(wallet<COST)return toast('Nincs elég Lumo egyenleged.',true);
 setWallet(wallet-COST);
 try{const r=await fetch('/api/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:text,country:country()})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Nem sikerült elküldeni.');toast('#'+d.id+' bekerült a sorba. Lumo meg fogja csinálni.');closeCommand();await poll()}
 catch(e){setWallet(wallet+COST);toast(e.message,true)}
}
function renderState(s){
 lastServer=s;const l=s.lumo;
 $('#statMood').textContent=l.mood;$('#statLevel').textContent=l.level;$('#statLocation').textContent=l.location;$('#statItems').textContent=l.inventory.length;$('#statFollowers').textContent=Number(l.followers).toLocaleString('hu-HU');
 $('#queueText').textContent=s.queue.length?s.queue.length+' parancs várakozik.':'Nincs várakozó parancs.';
 $('#worldChanges').innerHTML=(l.worldChanges||[]).slice(0,14).map(x=>'<div class="change">✓ '+safe(x)+'</div>').join('');
 $('#historyList').innerHTML=(s.history||[]).slice(0,30).map(x=>'<div class="history-item"><b>#'+x.id+' · '+safe(x.command)+'</b><span>'+safe(x.country||'🌍 Világ')+' · '+relative(x.completedAt||x.createdAt)+'</span></div>').join('');
 if(s.current){
   const total=Math.max(1,s.current.completeAt-s.current.startedAt),pct=Math.min(99,Math.max(1,Math.round((Date.now()-s.current.startedAt)/total*100)));
   $('#taskProgress').style.width=pct+'%';$('#taskPct').textContent=pct+'%';
   if(activeServerId!==s.current.id)beginAction(s.current);
 }else{
   $('#taskProgress').style.width='0%';$('#taskPct').textContent='0%';$('#taskText').textContent='Lumo várja a következő parancsot.';
   if(activeServerId)finishAction();
 }
 const newest=s.history?.[0]; if(newest && newest.id!==lastCompletedId){lastCompletedId=newest.id}
}
async function poll(){try{const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw 0;renderState(await r.json())}catch{}}

function openCommand(prefill=''){const m=$('#commandModal');m.hidden=false;$('#commandInput').value=prefill;$('#charCount').textContent=prefill.length+'/140';setTimeout(()=>$('#commandInput').focus(),0)}
function closeCommand(){$('#commandModal').hidden=true}
$('#commandButton').addEventListener('click',()=>openCommand());$('#closeCommand').addEventListener('click',closeCommand);$('#commandModal').addEventListener('click',e=>{if(e.target===$('#commandModal'))closeCommand()});
$('#commandInput').addEventListener('input',e=>$('#charCount').textContent=e.target.value.length+'/140');$('#sendCommand').addEventListener('click',()=>submitCommand($('#commandInput').value));
$$('[data-command]').forEach(b=>b.addEventListener('click',()=>openCommand(b.dataset.command)));
$('#openMap').addEventListener('click',()=>$('#mapPanel').hidden=false);$('#openHistory').addEventListener('click',()=>$('#historyPanel').hidden=false);$$('[data-close-panel]').forEach(b=>b.addEventListener('click',()=>b.parentElement.hidden=true));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCommand();$('#mapPanel').hidden=true;$('#historyPanel').hidden=true}});

// load complete
let lp=10;const loadInt=setInterval(()=>{lp=Math.min(94,lp+10);$('#loadBar').style.width=lp+'%'},90);
setTimeout(()=>{clearInterval(loadInt);$('#loadBar').style.width='100%';setTimeout(()=>{$('#loadingScreen').style.opacity='0';setTimeout(()=>$('#loadingScreen').style.display='none',450)},180)},700);

window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

poll();setInterval(poll,700);
const clock=new THREE.Clock();
function loop(now){
 requestAnimationFrame(loop);
 animateAction(now);
 followCamera();
 controls.update();
 renderer.render(scene,camera);
}
requestAnimationFrame(loop);
