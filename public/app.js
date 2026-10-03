(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const COST = 2;
  const sceneByAction = {
    pizza:'/assets/lumo-pizza.jpg', dance:'/assets/action-dance.jpg', city:'/assets/action-city.jpg', car:'/assets/action-car.jpg',
    friend:'/assets/action-friend.jpg', beach:'/assets/action-beach.jpg', house:'/assets/action-house.jpg', chicken:'/assets/lumo-chicken.jpg',
    dress:'/assets/lumo-chicken.jpg', guitar:'/assets/lumo-forest.jpg', sleep:'/assets/lumo-forest.jpg', mountain:'/assets/world-map.jpg',
    forest:'/assets/lumo-forest.jpg', home:'/assets/action-house.jpg', explore:'/assets/lumo-forest.jpg'
  };
  const actionLabels = {
    pizza:'🍕 Pizza', dance:'🎵 Tánc', city:'🏙️ Város', car:'🚗 Autó', friend:'🐶 Barát', beach:'🏖️ Tengerpart',
    house:'🏠 Ház', chicken:'🐔 Csirke', dress:'🧢 Öltözés', guitar:'🎸 Gitár', sleep:'😴 Alvás', mountain:'⛰️ Hegyek',
    forest:'🌲 Erdő', home:'🏠 Otthon', explore:'✨ Új parancs'
  };
  const markerPositions = { 'Erdő':['22%','49%'], 'Város':['76%','39%'], 'Tengerpart':['23%','75%'], 'Otthon':['66%','75%'], 'Hegyek':['50%','20%'] };
  let wallet = Number(localStorage.getItem('myLumoWallet') || 20);
  let lastState = null;
  let myLastCommandId = Number(localStorage.getItem('myLumoLastCommandId') || 0);
  let pollTimer = null, toastTimer = null;

  function setWallet(n) {
    wallet = Math.max(0, Math.floor(n)); localStorage.setItem('myLumoWallet', String(wallet));
    $('#walletTop').textContent = wallet; $('#walletShop').textContent = wallet;
  }
  function toast(msg, error=false) {
    const el=$('#toast'); el.textContent=msg; el.classList.toggle('error',error); el.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),3200);
  }
  function nav(name) {
    $$('.view').forEach(v=>v.classList.remove('active')); $('#view-'+name)?.classList.add('active');
    $$('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.nav===name)); window.scrollTo({top:0,behavior:'smooth'});
  }
  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function relativeTime(iso){const ms=Date.now()-new Date(iso).getTime();const m=Math.max(0,Math.floor(ms/60000));if(m<1)return'most';if(m<60)return`${m} perce`;const h=Math.floor(m/60);if(h<24)return`${h} órája`;return`${Math.floor(h/24)} napja`;}
  function renderHistory(list, full=false){
    const rows=list.map(x=>`<div class="history-row"><div class="flag">${escapeHtml((x.country||'🌍').split(' ')[0])}</div><div><b>#${x.id} · ${escapeHtml(x.command)}</b><small>${escapeHtml(x.country||'🌍 Világ')}</small></div>${full?`<span class="action-badge">${escapeHtml(actionLabels[x.action]||'✨ Parancs')}</span>`:''}<time>${relativeTime(x.completedAt||x.createdAt)}</time></div>`).join('');
    if(full) $('#fullHistory').innerHTML=rows||'<p>Nincs még előzmény.</p>'; else $('#miniHistory').innerHTML=rows||'<p>Nincs még előzmény.</p>';
  }
  function renderState(s){
    lastState=s; const l=s.lumo;
    $('#statMood').textContent=l.mood; $('#statLevel').textContent=l.level; $('#statItems').textContent=l.inventory.length; $('#statLocation').textContent=l.location;
    $('#lastAction').textContent=l.lastAction; $('#lastLocation').textContent=l.location; $('#mapCurrent').textContent=l.location;
    $('#inventory').innerHTML=l.inventory.slice(-8).map(i=>`<span class="chip">${escapeHtml(i)}</span>`).join('');
    $('#worldChanges').innerHTML=l.worldChanges.slice(0,12).map(c=>`<div class="change">✓ ${escapeHtml(c)}</div>`).join('');
    renderHistory(s.history.slice(0,5),false); renderHistory(s.history,true);
    const latest=s.history[0]; if(latest){
      const scene=sceneByAction[latest.action]||sceneByAction.explore; $('#heroScene').src=scene; $('#stateImage').src=scene; $('#tiktokImage').src=scene;
      $('#tiktokCommand').textContent='„'+latest.command+'”';
    }
    const pos=markerPositions[l.location]||markerPositions['Erdő']; $('#lumoMarker').style.left=pos[0];$('#lumoMarker').style.top=pos[1];
    renderProcessing(s);
  }
  function renderProcessing(s){
    const cur=s.current; const bar=$('#progressBar');
    if(cur){
      $('#processTitle').textContent=`#${cur.id} · ${cur.command}`; $('#processSub').textContent=`Lumo most végrehajtja • ${cur.country}`;
      const total=Math.max(1,cur.completeAt-cur.startedAt), elapsed=Math.max(0,Date.now()-cur.startedAt), pct=Math.max(2,Math.min(99,Math.round(elapsed/total*100)));
      bar.style.width=pct+'%'; $('#processPercent').textContent=pct+'%'; $('#queueText').textContent=s.queue.length?`${s.queue.length} további parancs várakozik.`:'Ez az egyetlen aktív parancs.';
    } else {
      bar.style.width='0%';$('#processPercent').textContent='0%';$('#processTitle').textContent='Lumo várja a következő parancsot.';$('#processSub').textContent='A következő ember döntése itt jelenik meg.';$('#queueText').textContent=s.queue.length?`${s.queue.length} parancs várakozik.`:'Nincs várakozó parancs.';
    }
  }
  async function getState(){try{const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw new Error();renderState(await r.json());}catch{toast('Nem sikerült elérni a My Lumo szervert.',true)}}
  function countryFromLocale(){
    const lang=(navigator.language||'').toLowerCase();
    if(lang.startsWith('ro')) return '🇷🇴 Románia';
    if(lang.startsWith('hu')) return '🇭🇺 Magyarország';
    if(lang.startsWith('de')) return '🇩🇪 Németország';
    if(lang.startsWith('fr')) return '🇫🇷 Franciaország';
    if(lang.startsWith('it')) return '🇮🇹 Olaszország';
    if(lang.startsWith('es')) return '🇪🇸 Spanyolország';
    if(lang.startsWith('pt')) return '🇧🇷 Brazília';
    if(lang==='en-us') return '🇺🇸 USA';
    if(lang.startsWith('en')) return '🇬🇧 Egyesült Királyság';
    return '🌍 Világ';
  }
  async function submitCommand(command){
    const text=String(command||'').trim(); if(!text)return toast('Írj be egy parancsot.',true); if(wallet<COST){nav('shop');return toast('Nincs elég Lumo egyenleged.',true)}
    setWallet(wallet-COST);
    try{
      const r=await fetch('/api/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:text,country:countryFromLocale()})});
      const data=await r.json(); if(!r.ok)throw new Error(data.error||'A parancs nem küldhető el.');
      myLastCommandId=data.id;localStorage.setItem('myLumoLastCommandId',String(data.id));toast(`#${data.id} parancs bekerült a sorba. Lumo meg fogja csinálni.`);nav('home');await getState();
    }catch(e){setWallet(wallet+COST);toast(e.message||'Hiba történt.',true)}
  }
  function openModal(prefill=''){const m=$('#commandModal');m.hidden=false;$('#modalInput').value=prefill;setTimeout(()=>$('#modalInput').focus(),0)}
  function closeModal(){ $('#commandModal').hidden=true; }

  $$('.nav-btn,[data-nav]').forEach(b=>b.addEventListener('click',e=>{const n=b.dataset.nav;if(n)nav(n)}));
  $('#heroCommand').addEventListener('click',()=>openModal()); $('#closeModal').addEventListener('click',closeModal);
  $('#commandModal').addEventListener('click',e=>{if(e.target===$('#commandModal'))closeModal()});
  $('#modalSend').addEventListener('click',()=>{const v=$('#modalInput').value;closeModal();submitCommand(v)});
  $('#commandInput').addEventListener('input',e=>$('#charCount').textContent=`${e.target.value.length}/140`);
  $('#commandForm').addEventListener('submit',e=>{e.preventDefault();const v=$('#commandInput').value;$('#commandInput').value='';$('#charCount').textContent='0/140';submitCommand(v)});
  $$('[data-command]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.command)));
  $$('[data-topup]').forEach(b=>b.addEventListener('click',()=>{const amount=Number(b.dataset.topup);setWallet(wallet+amount);toast(`DEMO: +${amount} Lumo hozzáadva. Valódi pénzt nem vontunk le.`)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#commandModal').hidden)closeModal()});
  setWallet(wallet); getState(); pollTimer=setInterval(getState,1000);
})();
