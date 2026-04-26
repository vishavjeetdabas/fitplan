// ===== STATE =====
const today=new Date(),di=(today.getDay()+6)%7,dkey=`fp_${today.toISOString().slice(0,10)}`;
function LS(k,v){if(v!==undefined)localStorage.setItem(k,JSON.stringify(v));else try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
let S=LS(dkey)||{meals:{},ck:{},water:0};
function save(){LS(dkey,S);syncToCloud()}

// ===== PHOTO DB (IndexedDB) =====
let pdb;
function openDB(){return new Promise(r=>{const q=indexedDB.open('FitPlanPhotos',1);q.onupgradeneeded=e=>e.target.result.createObjectStore('photos',{keyPath:'id',autoIncrement:true});q.onsuccess=e=>{pdb=e.target.result;r()};q.onerror=()=>r()})}
function dbAdd(d){return new Promise(r=>{const t=pdb.transaction('photos','readwrite');t.objectStore('photos').add(d);t.oncomplete=()=>r()})}
function dbAll(){return new Promise(r=>{const t=pdb.transaction('photos','readonly'),q=t.objectStore('photos').getAll();q.onsuccess=()=>r(q.result)})}
function dbDel(id){return new Promise(r=>{const t=pdb.transaction('photos','readwrite');t.objectStore('photos').delete(id);t.oncomplete=()=>r()})}

// ===== INIT =====
document.addEventListener('DOMContentLoaded',async()=>{
  document.getElementById('hdrDate').textContent=today.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});
  await openDB();
  initSupabase();
  renderAll();
  initTabs();
});

function renderAll(){
  renderWater();renderMacros();renderMeals();renderSupps();renderRules();
  renderDays();renderWorkout(di);renderWarmup();
  renderPhotos();renderWeights();renderAnalytics();
  renderCK();renderLM();renderGR();calcStreak();
}

// ===== TABS =====
function initTabs(){
  document.querySelectorAll('.tb').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.tb').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const t=document.getElementById(b.dataset.tab);
    t.classList.add('active');t.style.animation='none';t.offsetHeight;t.style.animation='fi .3s ease';
  }));
}

// ===== WATER =====
function renderWater(){
  const el=document.getElementById('waterDrops');
  el.innerHTML='';
  for(let i=0;i<4;i++){
    const d=document.createElement('div');
    d.className='water-drop'+(i<S.water?' filled':'');
    d.innerHTML=`<span class="wd-label">${i+1}L</span><span class="wd-check">💧</span>`;
    d.onclick=()=>{S.water=S.water===(i+1)?i:i+1;save();renderWater();updateCKwater()};
    el.appendChild(d);
  }
  document.getElementById('waterFill').style.width=(S.water/4*100)+'%';
  document.getElementById('waterCount').textContent=S.water+'/4L';
}
window.resetWater=()=>{S.water=0;save();renderWater()};
function updateCKwater(){if(S.water>=4&&!S.ck.c1){S.ck.c1=true;save();renderCK()}}

// ===== MACROS =====
function renderMacros(){
  let tp=0,tc=0,tf=0,tl=0;
  MEALS.forEach(m=>{if(S.meals[m.id]){tp+=m.p;tc+=m.c;tf+=m.f;tl+=m.cal}});
  const C=2*Math.PI*42;
  setRing('pRing',tp/170,C);setRing('cRing',tc/270,C);setRing('fRing',tf/75,C);
  document.getElementById('pVal').textContent=tp;
  document.getElementById('cVal').textContent=tc;
  document.getElementById('fVal').textContent=tf;
  document.getElementById('calNow').textContent=tl;
  document.getElementById('calFill').style.width=Math.min(100,tl/2450*100)+'%';
}
function setRing(id,p,c){const e=document.getElementById(id);e.style.strokeDasharray=c;e.style.strokeDashoffset=c-Math.min(1,p)*c}

// ===== MEALS =====
function renderMeals(){
  document.getElementById('mealsList').innerHTML=MEALS.map(m=>`
  <div class="mc${S.meals[m.id]?' chk':''}" id="mc-${m.id}">
    <div class="mh" onclick="mExp('${m.id}')">
      <div class="mchk" onclick="event.stopPropagation();mChk('${m.id}')"></div>
      <div class="mtb">${m.time}</div>
      <div class="minfo"><div class="mname">${m.name}</div><div class="mcal">~${m.cal} kcal</div></div>
      <div class="mchev">›</div>
    </div>
    <div class="mdets"><div class="mbody">
      <ul class="flist">${m.foods.map(f=>`<li class="fitem"><span>${f[0]}</span>${f[1]}</li>`).join('')}</ul>
      ${m.note?`<div class="fnote">💡 ${m.note}</div>`:''}
      <div class="mmacros"><div class="mpill p">P:${m.p}g</div><div class="mpill c">C:${m.c}g</div><div class="mpill ft">F:${m.f}g</div></div>
    </div></div>
  </div>`).join('');
}
window.mExp=id=>document.getElementById('mc-'+id).classList.toggle('exp');
window.mChk=id=>{S.meals[id]=!S.meals[id];save();document.getElementById('mc-'+id).classList.toggle('chk',S.meals[id]);renderMacros()};

// ===== SUPPLEMENTS =====
function renderSupps(){
  document.getElementById('suppList').innerHTML=SUPPS.map(s=>`<div class="si"><div class="si-icon" style="background:${s.bg}">${s.i}</div><div><div class="si-name">${s.n}</div><div class="si-det">${s.d}</div></div></div>`).join('');
}

// ===== RULES =====
function renderRules(){
  document.getElementById('rulesList').innerHTML=RULES.map((r,i)=>`<div class="ri"><div class="rnum">${i+1}</div><div class="rtxt">${r}</div></div>`).join('');
}

// ===== GYM DAY SELECTOR =====
function renderDays(){
  document.getElementById('daySel').innerHTML=DAYS.map((d,i)=>`<div class="dp${i===di?' act':''}${i===6?' rest':''}" onclick="selDay(${i})">${d}</div>`).join('');
}
window.selDay=i=>{document.querySelectorAll('.dp').forEach((p,x)=>p.classList.toggle('act',x===i));renderWorkout(i)};

// ===== GYM WORKOUT =====
let curDay=di;
function renderWorkout(d){
  curDay=d;const w=WK[d],h=document.getElementById('workoutHdr'),el=document.getElementById('exList'),ec=document.getElementById('exCount'),ex=document.getElementById('extraGym');
  if(w.rest){
    h.innerHTML=`<div class="wrest">😴</div><div class="wname">Rest Day</div><div class="wfocus">Recovery & Active Rest</div>`;
    el.innerHTML='';ec.textContent='';
    document.getElementById('warmupHdr').style.display='none';document.getElementById('warmupList').style.display='none';
    ex.innerHTML=w.ra.map(a=>`<div class="exc"><div class="exinfo"><div class="exname">${a}</div></div></div>`).join('');
    return;
  }
  document.getElementById('warmupHdr').style.display='';document.getElementById('warmupList').style.display='';
  h.innerHTML=`<div class="wtype">${w.t}</div><div class="wname">${w.n}</div><div class="wfocus">${w.f}</div>`;
  ec.textContent=w.ex.length+' exercises';
  const logged=LS('gym_'+dkey)||{};
  el.innerHTML=w.ex.map((e,i)=>{
    const key=d+'_'+i,hasLog=logged[key];
    // Get last session data for smart preview
    let lastStr='';
    for(let x=1;x<=14;x++){const dt=new Date(today);dt.setDate(dt.getDate()-x);const k='gym_'+`fp_${dt.toISOString().slice(0,10)}`;const l=LS(k);
      if(l&&l[key]){lastStr=l[key].map(s=>s.kg+'kg×'+s.reps).join(', ');break}}
    return `<div class="exc" onclick="openGymLog(${d},${i})">
      <div class="exnum">${i+1}</div>
      <div class="exinfo"><div class="exname">${e.n}</div>
        <div class="exmeta"><div class="exs">Sets: <span>${e.s}</span></div><div class="exr">Rest: <span>${e.r}</span></div></div>
        ${e.nt?`<div class="exnote">${e.nt}</div>`:''}
        ${hasLog?`<div class="ex-logged-preview">${hasLog.map(s=>s.kg+'×'+s.reps).join(' · ')}</div>`
          :lastStr?`<div class="ex-last-preview">Last: ${lastStr}</div>`:''}
      </div>${hasLog?'<div class="ex-log-badge">✓</div>':'<div class="ex-log-empty">Log</div>'}
    </div>`}).join('');
  // Posture correction — shown after EVERY workout day
  ex.innerHTML=`<div class="shdr"><h2 class="slabel">Posture Correction</h2><span class="ssub">15 min</span></div>`
    +POSTURE.map(p=>`<div class="pcard"><div class="ptitle">${p.n} · <span style="color:var(--grn)">${p.s}</span></div><div class="pwhy">↳ ${p.w}</div></div>`).join('');
  if(w.xn)ex.innerHTML+=`<div class="glass" style="text-align:center;margin-top:12px;padding:16px"><span style="font-size:15px;font-weight:600;color:var(--blu)">${w.xn}</span></div>`;
}

function renderWarmup(){
  document.getElementById('warmupList').innerHTML=WARMUP.map(w=>`<div class="wui"><span>${w[0]}</span><span>${w[1]}</span></div>`).join('');
}

// ===== GYM LOG MODAL (Advanced) =====
let glDay,glIdx,restTimer=null,restSec=0;
function getLastSession(d,i){
  const key=d+'_'+i;
  for(let x=1;x<=30;x++){const dt=new Date(today);dt.setDate(dt.getDate()-x);const k='gym_'+`fp_${dt.toISOString().slice(0,10)}`;const l=LS(k);
    if(l&&l[key])return{sets:l[key],date:dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'})}}
  return null;
}
window.openGymLog=(d,i)=>{
  glDay=d;glIdx=i;const e=WK[d].ex[i];
  document.getElementById('glName').textContent=e.n;
  document.getElementById('glTarget').textContent=`Target: ${e.s} · Rest: ${e.r}`;
  const sets=document.getElementById('glSets');
  const logged=LS('gym_'+dkey)||{};
  const existing=logged[d+'_'+i]||[];
  const last=getLastSession(d,i);
  // Show last session banner
  const prevEl=document.getElementById('glPrev');
  if(last)prevEl.innerHTML=`<div class="gl-prev-banner"><span class="gl-prev-label">Last (${last.date})</span><span class="gl-prev-data">${last.sets.map(s=>s.kg+'kg × '+s.reps).join(' → ')}</span></div>`;
  else prevEl.innerHTML='';
  // Determine number of sets
  const numSets=existing.length||(last?last.sets.length:parseInt(e.s)||3);
  sets.innerHTML='';
  for(let s=0;s<Math.max(numSets,1);s++){
    const v=existing[s]||{};
    // Smart defaults: use existing > last session > empty
    const defKg=v.kg||(last&&last.sets[s]?last.sets[s].kg:'')||'';
    const defReps=v.reps||(last&&last.sets[s]?last.sets[s].reps:'')||'';
    const done=v.kg&&v.reps;
    sets.innerHTML+=`<div class="gl-set${done?' done':''}" data-idx="${s}">
      <div class="gl-set-num">${s+1}</div>
      <div class="gl-set-field"><label>KG</label><input type="number" inputmode="decimal" placeholder="${last&&last.sets[s]?last.sets[s].kg:'-'}" value="${defKg}"></div>
      <span class="gl-set-x">×</span>
      <div class="gl-set-field"><label>REPS</label><input type="number" inputmode="numeric" placeholder="${last&&last.sets[s]?last.sets[s].reps:'-'}" value="${defReps}"></div>
      <button class="gl-set-check${done?' active':''}" onclick="markSetDone(this,${s})">✓</button>
    </div>`;
  }
  // Reset rest timer
  clearInterval(restTimer);restTimer=null;restSec=0;
  document.getElementById('restTimerDisplay').textContent='';
  document.getElementById('restTimerBtn').textContent='⏱ Start Rest';
  document.getElementById('restTimerBtn').classList.remove('running');
  renderGymHistory(d,i);
  document.getElementById('gymLogModal').classList.add('show');
};
window.markSetDone=(btn,idx)=>{
  const row=btn.closest('.gl-set');
  const ins=row.querySelectorAll('input');
  if(ins[0].value&&ins[1].value){
    row.classList.toggle('done');btn.classList.toggle('active');
    // Auto-start rest timer when set is marked done
    if(row.classList.contains('done'))startRestTimer();
  }
};
window.addSetRow=()=>{
  const sets=document.getElementById('glSets'),c=sets.children.length+1;
  const last=getLastSession(glDay,glIdx);
  sets.innerHTML+=`<div class="gl-set" data-idx="${c-1}">
    <div class="gl-set-num">${c}</div>
    <div class="gl-set-field"><label>KG</label><input type="number" inputmode="decimal" placeholder="-"></div>
    <span class="gl-set-x">×</span>
    <div class="gl-set-field"><label>REPS</label><input type="number" inputmode="numeric" placeholder="-"></div>
    <button class="gl-set-check" onclick="markSetDone(this,${c-1})">✓</button>
  </div>`;
};
window.removeLastSet=()=>{
  const sets=document.getElementById('glSets');
  if(sets.children.length>1)sets.removeChild(sets.lastChild);
};
// Rest Timer
function startRestTimer(){
  clearInterval(restTimer);restSec=0;
  const btn=document.getElementById('restTimerBtn'),disp=document.getElementById('restTimerDisplay');
  btn.textContent='⏱ Running';btn.classList.add('running');
  restTimer=setInterval(()=>{restSec++;const m=Math.floor(restSec/60),s=restSec%60;disp.textContent=`${m}:${s.toString().padStart(2,'0')}`;
    if(restSec>=180){disp.style.color='var(--red)'}else if(restSec>=90){disp.style.color='var(--org)'}else{disp.style.color='var(--grn)'}
  },1000);
}
window.toggleRestTimer=()=>{
  if(restTimer){clearInterval(restTimer);restTimer=null;document.getElementById('restTimerBtn').textContent='⏱ Start Rest';document.getElementById('restTimerBtn').classList.remove('running');document.getElementById('restTimerDisplay').textContent='';restSec=0}
  else startRestTimer();
};
window.saveGymLog=()=>{
  const rows=document.querySelectorAll('#glSets .gl-set'),data=[];
  rows.forEach(r=>{const ins=r.querySelectorAll('input');const kg=parseFloat(ins[0].value),reps=parseInt(ins[1].value);if(kg&&reps)data.push({kg,reps})});
  if(!data.length)return;
  const logged=LS('gym_'+dkey)||{};logged[glDay+'_'+glIdx]=data;LS('gym_'+dkey,logged);
  syncGymLogToCloud(glDay+'_'+glIdx,data);
  clearInterval(restTimer);restTimer=null;
  closeModal('gymLogModal');renderWorkout(curDay);
};
function renderGymHistory(d,i){
  const h=document.getElementById('glHistory');
  const dates=[];
  for(let x=1;x<=30;x++){const dt=new Date(today);dt.setDate(dt.getDate()-x);const k='gym_'+`fp_${dt.toISOString().slice(0,10)}`;const l=LS(k);
    if(l&&l[d+'_'+i])dates.push({date:dt.toLocaleDateString('en-IN',{day:'numeric',month:'short'}),sets:l[d+'_'+i]})}
  // Volume trend
  let volHtml='';
  if(dates.length>=2){
    const vols=dates.slice(0,5).reverse().map(d=>({label:d.date,vol:d.sets.reduce((a,s)=>a+s.kg*s.reps,0)}));
    const maxVol=Math.max(...vols.map(v=>v.vol));
    volHtml=`<div class="gl-vol-chart"><div class="gl-vol-label">Volume Trend</div><div class="gl-vol-bars">${vols.map(v=>`<div><div class="gl-vol-bar" style="height:${(v.vol/maxVol)*40}px"></div><div class="gl-vol-val">${(v.vol/1000).toFixed(1)}k</div></div>`).join('')}</div></div>`;
  }
  h.innerHTML=volHtml+(dates.length?dates.slice(0,5).map(d=>`<div class="gl-hist"><b>${d.date}</b> — ${d.sets.map(s=>s.kg+'kg × '+s.reps).join(', ')}</div>`).join(''):'<div style="font-size:12px;color:var(--t3);padding:8px 0">No history yet</div>');
}

// ===== PHOTOS =====
let viewingPhotoId=null,pendingPhoto=null;
async function renderPhotos(){
  const photos=await dbAll();
  const g=document.getElementById('photoGrid');
  photos.sort((a,b)=>new Date(b.date)-new Date(a.date));
  g.innerHTML=(photos.length?photos.map(p=>`<div class="pg-item" onclick="viewPhoto(${p.id})"><img src="${p.data}"><div class="pg-date">${new Date(p.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</div></div>`).join(''):'')
    +`<div class="pg-item pg-empty" onclick="openPhotoModal()">+</div>`;
}
window.openPhotoModal=()=>{
  pendingPhoto=null;
  document.getElementById('photoPreview').style.display='none';
  document.getElementById('photoInput').value='';
  document.getElementById('photoDate').value=today.toISOString().slice(0,10);
  document.getElementById('savePhotoBtn').disabled=true;
  document.getElementById('photoModal').classList.add('show');
};
window.openCamera=()=>document.getElementById('cameraInput').click();
window.handlePhoto=el=>{
  const file=el.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();img.onload=()=>{
      const canvas=document.createElement('canvas');
      const max=800,scale=Math.min(max/img.width,max/img.height,1);
      canvas.width=img.width*scale;canvas.height=img.height*scale;
      canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      pendingPhoto=canvas.toDataURL('image/jpeg',0.7);
      document.getElementById('photoPreview').src=pendingPhoto;
      document.getElementById('photoPreview').style.display='block';
      document.getElementById('savePhotoBtn').disabled=false;
    };img.src=e.target.result;
  };reader.readAsDataURL(file);
};
window.savePhoto=async()=>{
  if(!pendingPhoto)return;
  const dt=document.getElementById('photoDate').value;
  await dbAdd({data:pendingPhoto,date:dt});
  uploadPhotoToCloud(pendingPhoto,dt);
  closeModal('photoModal');renderPhotos();
};
window.viewPhoto=async id=>{
  viewingPhotoId=id;
  const photos=await dbAll();const p=photos.find(x=>x.id===id);if(!p)return;
  document.getElementById('pvImg').src=p.data;
  document.getElementById('pvDate').textContent=new Date(p.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  document.getElementById('photoViewer').classList.add('show');
};
window.deletePhoto=async()=>{
  if(!viewingPhotoId)return;
  // Delete from cloud if it has a cloudId
  const photos=await dbAll();const p=photos.find(x=>x.id===viewingPhotoId);
  if(p&&p.cloudId)deletePhotoFromCloud(p.cloudId,p.cloudPath||'');
  // Also try to find & delete cloud record by date
  if(p)deletePhotoByDate(p.date);
  await dbDel(viewingPhotoId);closeModal('photoViewer');renderPhotos();
};
window.replacePhoto=async()=>{
  // Delete old photo from cloud first
  const photos=await dbAll();const p=photos.find(x=>x.id===viewingPhotoId);
  if(p&&p.cloudId)deletePhotoFromCloud(p.cloudId,p.cloudPath||'');
  if(p)deletePhotoByDate(p.date);
  await dbDel(viewingPhotoId);
  closeModal('photoViewer');openPhotoModal();
};

// ===== WEIGHT LOG =====
function getWeights(){return LS('weights')||[]}
function setWeights(w){LS('weights',w)}
window.openWeightModal=()=>{
  document.getElementById('weightInput').value='';
  document.getElementById('weightDate').value=today.toISOString().slice(0,10);
  document.getElementById('weightModal').classList.add('show');
};
window.saveWeight=()=>{
  const kg=parseFloat(document.getElementById('weightInput').value),dt=document.getElementById('weightDate').value;
  if(!kg||!dt)return;
  const w=getWeights();w.push({kg,date:dt});w.sort((a,b)=>new Date(a.date)-new Date(b.date));setWeights(w);
  syncWeightToCloud(kg,dt);
  closeModal('weightModal');renderWeights();renderAnalytics();
};
function renderWeights(){
  const w=getWeights(),last10=w.slice(-10);
  const chart=document.getElementById('weightChart');
  if(!last10.length){chart.innerHTML='<div style="text-align:center;color:var(--t3);font-size:13px;padding:20px">No weight data yet. Tap + Log to start.</div>';
    document.getElementById('weightHistory').innerHTML='';return;}
  // SVG Line Graph
  const W=360,H=140,pad={t:25,r:15,b:30,l:40};
  const pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
  const min=Math.min(...last10.map(x=>x.kg))-0.5,max=Math.max(...last10.map(x=>x.kg))+0.5,range=max-min||1;
  const pts=last10.map((x,i)=>{
    const px=pad.l+(i/(last10.length-1||1))*pw;
    const py=pad.t+ph-((x.kg-min)/range)*ph;
    return{x:px,y:py,kg:x.kg,date:new Date(x.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})};
  });
  const line=pts.map((p,i)=>(i===0?'M':'L')+p.x.toFixed(1)+','+p.y.toFixed(1)).join(' ');
  const area=line+` L${pts[pts.length-1].x.toFixed(1)},${pad.t+ph} L${pts[0].x.toFixed(1)},${pad.t+ph} Z`;
  // Grid lines
  const steps=4,gridLines=[];
  for(let i=0;i<=steps;i++){
    const v=min+(range/steps)*i;
    const y=pad.t+ph-((v-min)/range)*ph;
    gridLines.push(`<line x1="${pad.l}" y1="${y.toFixed(1)}" x2="${W-pad.r}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    <text x="${pad.l-6}" y="${y.toFixed(1)}" fill="rgba(245,245,247,0.35)" font-size="9" text-anchor="end" dominant-baseline="middle" font-family="Inter">${v.toFixed(1)}</text>`);
  }
  // X labels
  const xLabels=last10.length<=5?pts:pts.filter((_,i)=>i===0||i===pts.length-1||i===Math.floor(pts.length/2));
  const xlHtml=xLabels.map(p=>`<text x="${p.x.toFixed(1)}" y="${H-5}" fill="rgba(245,245,247,0.35)" font-size="8" text-anchor="middle" font-family="Inter">${p.date}</text>`).join('');
  // Change indicator
  const first=last10[0].kg,latest=last10[last10.length-1].kg,diff=(latest-first).toFixed(1);
  const diffColor=diff<=0?'var(--grn)':'var(--red)';
  const arrow=diff<=0?'↓':'↑';
  chart.innerHTML=`<div class="wt-line-chart">
    <div class="wt-change-badge" style="color:${diffColor}">${arrow} ${Math.abs(diff)}kg</div>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
      <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--grn)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--grn)" stop-opacity="0"/></linearGradient></defs>
      ${gridLines.join('')}
      <path d="${area}" fill="url(#wg)"/>
      <path d="${line}" fill="none" stroke="var(--grn)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--bg)" stroke="var(--grn)" stroke-width="2"/>
        <text x="${p.x.toFixed(1)}" y="${(p.y-10).toFixed(1)}" fill="var(--t2)" font-size="8" text-anchor="middle" font-family="Inter" font-weight="600">${p.kg}</text>`).join('')}
      ${xlHtml}
    </svg>
  </div>`;
  const hist=w.slice().reverse().slice(0,10);
  document.getElementById('weightHistory').innerHTML=hist.map(x=>`<div class="wt-entry"><span>${new Date(x.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span><b>${x.kg} kg</b><span class="wt-del" onclick="delWeight('${x.date}',${x.kg})">✕</span></div>`).join('');
}
window.delWeight=(dt,kg)=>{let w=getWeights();w=w.filter(x=>!(x.date===dt&&x.kg===kg));setWeights(w);deleteWeightFromCloud(dt);renderWeights();renderAnalytics()};

// ===== ANALYTICS =====
function renderAnalytics(){
  const el=document.getElementById('analytics');
  // Meal completion last 7 days
  let mealDays=[],waterDays=[],calDays=[];
  for(let i=6;i>=0;i--){
    const d=new Date(today);d.setDate(d.getDate()-i);
    const k=`fp_${d.toISOString().slice(0,10)}`,s=LS(k);
    const done=s?Object.values(s.meals||{}).filter(Boolean).length:0;
    mealDays.push({day:d.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,2),val:done,max:6});
    waterDays.push({day:d.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,2),val:s?s.water||0:0,max:4});
    let cal=0;if(s)MEALS.forEach(m=>{if(s.meals&&s.meals[m.id])cal+=m.cal});
    calDays.push({day:d.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,2),val:cal,max:2450});
  }
  // Weight trend
  const wts=getWeights(),latest=wts.length?wts[wts.length-1].kg:'--',first=wts.length?wts[0].kg:0;
  const change=wts.length>=2?(latest-first).toFixed(1):'--';
  // Gym consistency last 7 days
  let gymDays=0;
  for(let i=0;i<7;i++){const d=new Date(today);d.setDate(d.getDate()-i);const k='gym_'+`fp_${d.toISOString().slice(0,10)}`;if(LS(k))gymDays++}
  // Checklist avg
  let ckTotal=0,ckDays=0;
  for(let i=0;i<7;i++){const d=new Date(today);d.setDate(d.getDate()-i);const k=`fp_${d.toISOString().slice(0,10)}`,s=LS(k);
    if(s&&s.ck){ckDays++;ckTotal+=Object.values(s.ck).filter(Boolean).length}}
  const ckAvg=ckDays?(ckTotal/ckDays).toFixed(1):'0';

  el.innerHTML=`
  <div class="an-card"><div class="an-val" style="color:var(--grn)">${latest}<small style="font-size:14px">kg</small></div><span class="an-label">Current Weight</span></div>
  <div class="an-card"><div class="an-val" style="color:${parseFloat(change)<=0?'var(--grn)':'var(--red)'}">${change}<small style="font-size:14px">kg</small></div><span class="an-label">Total Change</span></div>
  <div class="an-card"><div class="an-val" style="color:var(--blu)">${gymDays}<small style="font-size:14px">/7</small></div><span class="an-label">Gym This Week</span></div>
  <div class="an-card"><div class="an-val" style="color:var(--org)">${ckAvg}<small style="font-size:14px">/9</small></div><span class="an-label">Avg Checklist</span></div>
  <div class="an-card wide"><span class="an-label" style="margin-bottom:6px">Meals Completed (7 days)</span>
    <div class="an-bar-row">${mealDays.map(d=>`<div><div class="an-bar" style="height:${(d.val/d.max)*50}px;background:var(--grn)"></div><div class="an-bar-lbl">${d.day}</div></div>`).join('')}</div></div>
  <div class="an-card wide"><span class="an-label" style="margin-bottom:6px">Water Intake (7 days)</span>
    <div class="an-bar-row">${waterDays.map(d=>`<div><div class="an-bar" style="height:${(d.val/d.max)*50}px;background:var(--blu)"></div><div class="an-bar-lbl">${d.day}</div></div>`).join('')}</div></div>
  <div class="an-card wide"><span class="an-label" style="margin-bottom:6px">Calories (7 days)</span>
    <div class="an-bar-row">${calDays.map(d=>`<div><div class="an-bar" style="height:${(d.val/d.max)*50}px;background:var(--org)"></div><div class="an-bar-lbl">${d.day}</div></div>`).join('')}</div></div>`;
}

// ===== CHECKLIST =====
function renderCK(){
  document.getElementById('ckList').innerHTML=CK.map(c=>{
    const done=S.ck[c.id]?'done':'';
    return `<div class="cki ${done}" onclick="tCK('${c.id}',this)"><div class="ckbox"></div><span class="ckemoji">${c.e}</span><span class="cktxt">${c.t}</span></div>`}).join('');
  updCKP();
}
window.tCK=(id,el)=>{S.ck[id]=!S.ck[id];save();el.classList.toggle('done',S.ck[id]);updCKP();calcStreak()};
function updCKP(){document.getElementById('ckProg').textContent=Object.values(S.ck).filter(Boolean).length+'/'+CK.length}

// ===== STREAK =====
function calcStreak(){
  let s=0;const d=new Date(today);d.setDate(d.getDate()-1);
  for(let i=0;i<365;i++){const k=`fp_${d.toISOString().slice(0,10)}`,st=LS(k);
    if(st&&st.ck&&Object.values(st.ck).filter(Boolean).length>=6){s++;d.setDate(d.getDate()-1)}else break}
  if(Object.values(S.ck).filter(Boolean).length>=6)s++;
  document.getElementById('streakNum').textContent=s;
}

// ===== LOOKMAX =====
function renderLM(){document.getElementById('lmList').innerHTML=LM.map(l=>`<div class="lmi"><span class="lmi-e">${l[0]}</span><div><div class="lmi-t">${l[1]}</div><div class="lmi-d">${l[2]}</div></div></div>`).join('')}

// ===== GROCERY =====
function renderGR(){document.getElementById('grList').innerHTML=`<div class="gr-grid">${GR.map(g=>`<div class="gri"><span>${g[0]}</span>${g[1]}</div>`).join('')}</div>`}

// ===== MODAL HELPERS =====
window.closeModal=id=>document.getElementById(id).classList.remove('show');
document.querySelectorAll('.modal-overlay').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
