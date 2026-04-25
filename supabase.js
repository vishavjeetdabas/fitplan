// ===== SUPABASE CONFIG =====
const SUPABASE_URL='https://wuejokvgdxutlphqbtya.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWpva3ZnZHh1dGxwaHFidHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDg2NzEsImV4cCI6MjA4ODI4NDY3MX0.HByu7oq24xivu5sO08fBKcWSA8VI1rWwBTHHCozmbkM';

let sb,currentUser=null;

// Init Supabase client
function initSupabase(){
  sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  sb.auth.onAuthStateChange((event,session)=>{
    if(session?.user){
      currentUser=session.user;
      document.getElementById('authScreen').classList.remove('show');
      document.getElementById('main').style.display='';
      document.querySelector('.tabbar').style.display='';
      document.getElementById('userEmail').textContent=session.user.email;
      document.querySelectorAll('.profileEl').forEach(e=>e.style.display='');
      syncFromCloud();
    } else {
      currentUser=null;
      document.getElementById('authScreen').classList.add('show');
      document.getElementById('main').style.display='none';
      document.querySelector('.tabbar').style.display='none';
      document.querySelectorAll('.profileEl').forEach(e=>e.style.display='none');
    }
  });
}

// ===== AUTH =====
async function authSignUp(){
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPass').value;
  const err=document.getElementById('authError');
  if(!email||!pass){err.textContent='Enter email and password';return}
  if(pass.length<6){err.textContent='Password must be 6+ characters';return}
  err.textContent='';
  setAuthLoading(true);
  const{error}=await sb.auth.signUp({email,password:pass});
  setAuthLoading(false);
  if(error){err.textContent=error.message}
  else{err.style.color='var(--grn)';err.textContent='Check your email to confirm, then log in!'}
}

async function authLogin(){
  const email=document.getElementById('authEmail').value.trim();
  const pass=document.getElementById('authPass').value;
  const err=document.getElementById('authError');
  if(!email||!pass){err.textContent='Enter email and password';return}
  err.textContent='';
  setAuthLoading(true);
  const{error}=await sb.auth.signInWithPassword({email,password:pass});
  setAuthLoading(false);
  if(error){err.style.color='var(--red)';err.textContent=error.message}
}

async function authLogout(){
  await sb.auth.signOut();
  currentUser=null;
}

function setAuthLoading(on){
  document.getElementById('loginBtn').disabled=on;
  document.getElementById('signupBtn').disabled=on;
  document.getElementById('loginBtn').textContent=on?'Loading...':'Log In';
}

// ===== CLOUD SYNC =====
async function syncFromCloud(){
  if(!currentUser)return;
  // Sync today's daily data
  const{data}=await sb.from('fitplan_days').select('data').eq('user_id',currentUser.id).eq('date_key',dkey.replace('fp_','')).maybeSingle();
  if(data){
    S=data.data;
    if(!S.meals)S.meals={};
    if(!S.ck)S.ck={};
    if(!S.water)S.water=0;
    save();
  }
  // Sync weights
  const{data:wts}=await sb.from('fitplan_weights').select('*').eq('user_id',currentUser.id).order('date_key',{ascending:true});
  if(wts&&wts.length)LS('weights',wts.map(w=>({kg:parseFloat(w.kg),date:w.date_key})));
  // Sync gym logs for today
  const{data:gl}=await sb.from('fitplan_gym_logs').select('*').eq('user_id',currentUser.id).eq('date_key',dkey.replace('fp_',''));
  if(gl&&gl.length){
    const logged={};
    gl.forEach(g=>logged[g.exercise_key]=g.sets);
    LS('gym_'+dkey,logged);
  }
  renderAll();
}

async function syncToCloud(){
  if(!currentUser)return;
  const dateKey=dkey.replace('fp_','');
  // Upsert daily data
  await sb.from('fitplan_days').upsert({
    user_id:currentUser.id,date_key:dateKey,data:S,updated_at:new Date().toISOString()
  },{onConflict:'user_id,date_key'});
}

async function syncWeightToCloud(kg,dateKey){
  if(!currentUser)return;
  await sb.from('fitplan_weights').upsert({
    user_id:currentUser.id,date_key:dateKey,kg:kg
  },{onConflict:'user_id,date_key'});
}

async function deleteWeightFromCloud(dateKey){
  if(!currentUser)return;
  await sb.from('fitplan_weights').delete().eq('user_id',currentUser.id).eq('date_key',dateKey);
}

async function syncGymLogToCloud(exerciseKey,sets){
  if(!currentUser)return;
  const dateKey=dkey.replace('fp_','');
  await sb.from('fitplan_gym_logs').upsert({
    user_id:currentUser.id,date_key:dateKey,exercise_key:exerciseKey,sets:sets,updated_at:new Date().toISOString()
  },{onConflict:'user_id,date_key,exercise_key'});
}

// Photo cloud sync
async function uploadPhotoToCloud(base64,dateKey){
  if(!currentUser)return null;
  const blob=await(await fetch(base64)).blob();
  const path=`${currentUser.id}/${dateKey}_${Date.now()}.jpg`;
  const{error}=await sb.storage.from('photos').upload(path,blob,{contentType:'image/jpeg'});
  if(error){console.error('Upload error:',error);return null}
  // Save reference
  await sb.from('fitplan_photos').insert({user_id:currentUser.id,date_key:dateKey,storage_path:path});
  return path;
}

async function loadPhotosFromCloud(){
  if(!currentUser)return[];
  const{data}=await sb.from('fitplan_photos').select('*').eq('user_id',currentUser.id).order('date_key',{ascending:false});
  if(!data)return[];
  return data.map(p=>({
    id:p.id,date:p.date_key,cloudPath:p.storage_path,
    url:`${SUPABASE_URL}/storage/v1/object/public/photos/${p.storage_path}`
  }));
}

async function deletePhotoFromCloud(photoId,storagePath){
  if(!currentUser)return;
  await sb.storage.from('photos').remove([storagePath]);
  await sb.from('fitplan_photos').delete().eq('id',photoId);
}
