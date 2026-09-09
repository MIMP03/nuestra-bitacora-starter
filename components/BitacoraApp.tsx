'use client';
import { useEffect, useMemo, useState } from 'react';
import { initialActivities } from '@/lib/activities';

type Activity={id:string;name:string;emoji:string;isCustom:boolean};
type DateItem={id:string;scheduledAt:string;status:string;createdBy:string;activity:Activity;reviews:{user:string;rating:number|null;comment:string|null}[]};
const seed:Activity[]=initialActivities.map((a,i)=>({...a,id:`seed-${i}`,isCustom:false}));

export default function BitacoraApp(){
 const [tab,setTab]=useState<'home'|'wheel'|'log'>('home');
 const [activities,setActivities]=useState<Activity[]>(seed);
 const [selected,setSelected]=useState<Activity|null>(null);
 const [spinning,setSpinning]=useState(false);
 const [custom,setCustom]=useState('');
 const [date,setDate]=useState(''); const [time,setTime]=useState('');
 const [dates,setDates]=useState<DateItem[]>([]); const [detail,setDetail]=useState<DateItem|null>(null);
 const [user,setUser]=useState<'Tú'|'Ella'>('Tú');
 const [loading,setLoading]=useState(false);
 const next=useMemo(()=>dates.filter(d=>d.status==='scheduled').sort((a,b)=>+new Date(a.scheduledAt)-+new Date(b.scheduledAt))[0], [dates]);
 useEffect(()=>{fetch('/api/dates').then(r=>r.ok?r.json():[]).then(setDates).catch(()=>{});},[]);
 const spin=()=>{if(spinning||!activities.length)return;setSpinning(true);setSelected(null);let n=0;const timer=setInterval(()=>{setSelected(activities[Math.floor(Math.random()*activities.length)]);n++;if(n>=14){clearInterval(timer);setSpinning(false);}},90)};
 const add=()=>{const name=custom.trim();if(!name)return;const a={id:`custom-${Date.now()}`,name,emoji:'✨',isCustom:true};setActivities(x=>[...x,a]);setCustom('');};
 const remove=(id:string)=>setActivities(x=>x.filter(a=>a.id!==id));
 const schedule=async()=>{if(!selected||!date||!time)return;setLoading(true);try{const r=await fetch('/api/dates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({activityId:selected.id,date,time,createdBy:user})});if(r.ok){const item=await r.json();setDates(x=>[...x,item]);setTab('home');}}finally{setLoading(false)}};
 return <main className="shell">
  <header><div><span className="eyebrow">UN ESPACIO PARA DOS</span><h1>Nuestra Bitácora</h1></div><button className="user-pill" onClick={()=>setUser(user==='Tú'?'Ella':'Tú')}>{user}</button></header>
  {tab==='home'&&<section className="page"><div className="hero"><p className="eyebrow">PRÓXIMA CITA</p>{next?<><div className="next-emoji">{next.activity.emoji}</div><h2>{next.activity.name}</h2><p>{new Date(next.scheduledAt).toLocaleString('es-PE',{dateStyle:'full',timeStyle:'short'})}</p><Countdown target={next.scheduledAt}/></>:<><div className="empty-icon">♡</div><h2>Aún no hay una próxima cita</h2><p>Dejen que la ruleta elija la siguiente.</p></>}<button className="primary" onClick={()=>setTab('wheel')}>🎲 SORTEAR CITA</button></div><button className="secondary wide" onClick={()=>setTab('log')}>📖 Nuestra Bitácora <span>{dates.length}</span></button></section>}
  {tab==='wheel'&&<section className="page"><SectionTitle title="Ruleta de citas" onBack={()=>setTab('home')}/><div className={`wheel ${spinning?'spin':''}`}>{selected?<><span>{selected.emoji}</span><strong>{selected.name}</strong></>:<span>🎲</span>}</div><button className="primary" onClick={spin}>{spinning?'SORTEANDO…':'🎲 SORTEAR CITA'}</button>{selected&&!spinning&&<div className="actions"><button className="secondary" onClick={spin}>🎲 VOLVER A SORTEAR</button><button className="accept" onClick={()=>document.getElementById('schedule')?.scrollIntoView({behavior:'smooth'})}>✅ ACEPTAR</button></div>}
  <div className="card" id="schedule"><h3>➕ Agregar mi propia actividad</h3><input value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Cocinar la misma receta…"/><button className="secondary wide" onClick={add}>AGREGAR ACTIVIDAD</button><div className="custom-list">{activities.filter(a=>a.isCustom).map(a=><div key={a.id}><span>{a.emoji} {a.name}</span><button onClick={()=>remove(a.id)} aria-label="Eliminar">×</button></div>)}</div></div>
  {selected&&!spinning&&<div className="card"><h3>📅 Agendar la cita</h3><p className="muted">Actividad: {selected.emoji} {selected.name}</p><div className="grid"><label>Fecha<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Hora<input type="time" value={time} onChange={e=>setTime(e.target.value)}/></label></div><button className="primary" disabled={loading||!date||!time} onClick={schedule}>{loading?'GUARDANDO…':'❤️ AGENDAR CITA'}</button></div>}</section>}
  {tab==='log'&&<section className="page"><SectionTitle title="Nuestra Bitácora" onBack={()=>setTab('home')}/><div className="count"><strong>{dates.length}</strong><span>CITAS</span></div>{dates.length===0?<div className="card center"><p>Todavía no hay citas anteriores.</p></div>:<div className="history">{dates.map((d,i)=><button className="history-item" key={d.id} onClick={()=>setDetail(d)}><span className="num">{i+1}</span><span className="activity">{d.activity.emoji} {d.activity.name}</span><span>{d.reviews.find(r=>r.user==='Tú')?.rating?`⭐ ${d.reviews.find(r=>r.user==='Tú')?.rating}`:'—'}</span></button>)}</div>}{detail&&<div className="modal" onClick={()=>setDetail(null)}><div className="modal-box" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setDetail(null)}>×</button><div className="next-emoji">{detail.activity.emoji}</div><h2>{detail.activity.name}</h2><p>{new Date(detail.scheduledAt).toLocaleString('es-PE',{dateStyle:'full',timeStyle:'short'})}</p><Review date={detail} user={user}/></div></div>}</section>}
  <nav><button className={tab==='home'?'active':''} onClick={()=>setTab('home')}>⌂<small>Inicio</small></button><button className={tab==='wheel'?'active':''} onClick={()=>setTab('wheel')}>🎲<small>Ruleta</small></button><button className={tab==='log'?'active':''} onClick={()=>setTab('log')}>📖<small>Bitácora</small></button></nav>
 </main>
}
function SectionTitle({title,onBack}:{title:string;onBack:()=>void}){return <div className="section-title"><button onClick={onBack}>←</button><h2>{title}</h2></div>}
function Countdown({target}:{target:string}){const [now,setNow]=useState(Date.now());useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);let ms=Math.max(0,+new Date(target)-now);let d=Math.floor(ms/86400000);ms%=86400000;let h=Math.floor(ms/3600000);ms%=3600000;let m=Math.floor(ms/60000);let s=Math.floor(ms/1000)%60;return <div className="countdown"><div><b>{d}</b><small>días</small></div><div><b>{String(h).padStart(2,'0')}</b><small>hrs</small></div><div><b>{String(m).padStart(2,'0')}</b><small>min</small></div><div><b>{String(s).padStart(2,'0')}</b><small>seg</small></div></div>}
function Review({date,user}:{date:DateItem;user:'Tú'|'Ella'}){const mine=date.reviews.find(r=>r.user===user);return <div className="review"><p><b>{user}</b> — {mine?.rating?'⭐'.repeat(mine.rating):'Sin calificar'}</p><p className="quote">{mine?.comment||'Todavía no has dejado un comentario.'}</p><button className="secondary wide">✏️ EDITAR MI VALORACIÓN</button><hr/><p><b>{user==='Tú'?'Ella':'Tú'}</b> — {date.reviews.find(r=>r.user!=='Tú'&&r.user!=='Ella')?.rating||date.reviews.find(r=>r.user!==(user))?.rating? '⭐':'Sin calificar'}</p></div>}
