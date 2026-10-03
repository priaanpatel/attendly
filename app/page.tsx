 "use client";

import { useMemo, useState } from "react";
import {
  CalendarDays, ChartNoAxesCombined, MessageCircle, Settings,
  Upload, Check, X, Ban, ChevronRight, Sparkles, Target, Clock3
} from "lucide-react";

type Status = "attended" | "missed" | "cancelled" | "upcoming";
type ClassItem = { id:number; day:string; time:string; subject:string; status:Status };

const initialClasses: ClassItem[] = [
  {id:1,day:"Monday",time:"09:00 – 10:00",subject:"French",status:"attended"},
  {id:2,day:"Monday",time:"10:00 – 11:00",subject:"Marketing",status:"attended"},
  {id:3,day:"Monday",time:"11:00 – 12:00",subject:"Psychology",status:"missed"},
  {id:4,day:"Monday",time:"12:00 – 13:00",subject:"IKS",status:"upcoming"},
  {id:5,day:"Tuesday",time:"09:00 – 10:00",subject:"French",status:"upcoming"},
  {id:6,day:"Tuesday",time:"10:00 – 11:00",subject:"Media & Society",status:"upcoming"}
];

function pctColor(p:number) {
  if (p < 50) return "red";
  if (p < 65) return "orange";
  if (p < 80) return "yellow";
  return "green";
}

export default function Home() {
  const [tab, setTab] = useState<"home"|"attendance"|"assistant"|"settings">("home");
  const [classes, setClasses] = useState(initialClasses);
  const [target, setTarget] = useState(75);
  const [question, setQuestion] = useState("");

  const attended = classes.filter(c => c.status === "attended").length;
  const conducted = classes.filter(c => c.status !== "cancelled" && c.status !== "upcoming").length;
  const percentage = conducted ? Math.round((attended / conducted) * 1000) / 10 : 0;
  const today = classes.filter(c => c.day === "Monday");
  const color = pctColor(percentage);

  const subjectStats = useMemo(() => {
    const subjects = Array.from(new Set(classes.map(c=>c.subject)));
    return subjects.map(subject => {
      const list = classes.filter(c=>c.subject===subject && c.status!=="cancelled" && c.status!=="upcoming");
      const a = list.filter(c=>c.status==="attended").length;
      return {subject, attended:a, conducted:list.length, pct:list.length ? Math.round(a/list.length*100):100};
    });
  }, [classes]);

  function setStatus(id:number, status:Status) {
    setClasses(prev => prev.map(c => c.id===id ? {...c,status} : c));
  }

  function assistantAnswer(q:string) {
    if (!q.trim()) return;
    setQuestion("");
    setTab("assistant");
  }

  return (
    <main className="app">
      <header className="topbar">
        <div><div className="brand">Attendly</div><div className="muted">Your attendance, made simple.</div></div>
        <button className="iconBtn"><Settings size={19}/></button>
      </header>

      <div className="content">
        {tab==="home" && <>
          <section className="heroCard">
            <div>
              <div className="eyebrow">OVERALL ATTENDANCE</div>
              <h1>{percentage}%</h1>
              <p>{attended} attended · {conducted} conducted</p>
              <span className={`statusPill ${color}`}>{percentage >= target ? "On target" : `${target-percentage}% below target`}</span>
            </div>
            <div className={`ring ${color}`} style={{"--progress": `${Math.min(percentage,100)}%`} as React.CSSProperties}>
              <div className="ringInner"><strong>{percentage}%</strong><span>attendance</span></div>
            </div>
          </section>

          <section className="sectionHead"><div><h2>Today</h2><p>Monday · 4 classes</p></div><button onClick={()=>setTab("attendance")} className="textBtn">View all <ChevronRight size={16}/></button></section>
          <section className="card">
            <div className="dayProgress"><div><strong>2 of 4</strong><span>classes logged</span></div><div className="miniBar"><i style={{width:"50%"}}/></div></div>
            {today.map(c=><ClassRow key={c.id} c={c} setStatus={setStatus}/>)}
          </section>

          <section className="sectionHead"><div><h2>Attendance snapshot</h2><p>Where your buffer stands</p></div></section>
          <section className="card stats">
            {subjectStats.map(s=><div className="statRow" key={s.subject}><div><strong>{s.subject}</strong><span>{s.attended}/{s.conducted || 0} attended</span></div><div className={`statPct ${pctColor(s.pct)}`}>{s.conducted?s.pct:"—"}%</div></div>)}
          </section>

          <button className="assistantBanner" onClick={()=>setTab("assistant")}><div className="spark"><Sparkles size={20}/></div><div><strong>Ask your attendance assistant</strong><span>Find out what you can safely miss.</span></div><ChevronRight/></button>
        </>}

        {tab==="attendance" && <>
          <PageTitle title="Attendance" subtitle="Your subjects and daily records"/>
          <section className="card">
            <div className="uploadBox"><Upload size={20}/><div><strong>Import timetable</strong><span>Upload a timetable image to set up your classes.</span></div><button className="smallBtn">Upload</button></div>
          </section>
          <section className="card stats">
            {subjectStats.map(s=><div className="subjectCard" key={s.subject}><div className="subjectTop"><div><strong>{s.subject}</strong><span>{s.attended} / {s.conducted} attended</span></div><b className={pctColor(s.pct)}>{s.conducted?s.pct:"—"}%</b></div><div className="bar"><i className={pctColor(s.pct)} style={{width:`${s.pct}%`}}/></div></div>)}
          </section>
          <section className="sectionHead"><div><h2>Monday</h2><p>Edit today's records</p></div></section>
          <section className="card">{today.map(c=><ClassRow key={c.id} c={c} setStatus={setStatus}/>)}</section>
        </>}

        {tab==="assistant" && <>
          <PageTitle title="Assistant" subtitle="Plan around your attendance target"/>
          <section className="goalCard"><Target size={20}/><div><span>YOUR TARGET</span><strong>{target}% attendance</strong></div><button onClick={()=>setTarget(target===75?80:75)}>{target===75?"Change to 80%":"Change to 75%"}</button></section>
          <section className="chat">
            <div className="bubble bot"><Sparkles size={15}/><div><strong>Attendance Assistant</strong><p>You're at <b>{percentage}%</b>. Your target is <b>{target}%</b>. I can analyze your timetable and tell you where you have flexibility.</p></div></div>
            <div className="bubble bot"><p><b>Example:</b> If you need to choose one class to miss, I'll compare the impact on each subject rather than treating every class equally.</p></div>
            {question && <div className="bubble user">{question}</div>}
          </section>
          <div className="quickPrompts">
            {["Can I miss anything tomorrow?","How many classes do I need for 75%?","Which subject is risky?"].map(q=><button key={q} onClick={()=>assistantAnswer(q)}>{q}</button>)}
          </div>
          <div className="chatInput"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==="Enter"&&assistantAnswer(question)} placeholder="Ask about your attendance..."/><button onClick={()=>assistantAnswer(question)}><MessageCircle size={18}/></button></div>
        </>}

        {tab==="settings" && <>
          <PageTitle title="Settings" subtitle="Control how Attendly works"/>
          <section className="card settingsList">
            <Setting icon={<Target/>} title="Attendance target" value={`${target}%`} />
            <Setting icon={<CalendarDays/>} title="Timetable" value="6 classes loaded" />
            <Setting icon={<Clock3/>} title="Class reminders" value="On" />
            <Setting icon={<ChartNoAxesCombined/>} title="Weekly summary" value="On" />
          </section>
          <section className="card"><div className="uploadBox"><Upload size={20}/><div><strong>Replace timetable</strong><span>Upload a new timetable image.</span></div><button className="smallBtn">Upload</button></div></section>
        </>}
      </div>

      <nav className="bottomNav">
        <Nav icon={<CalendarDays/>} label="Home" active={tab==="home"} onClick={()=>setTab("home")}/>
        <Nav icon={<ChartNoAxesCombined/>} label="Attendance" active={tab==="attendance"} onClick={()=>setTab("attendance")}/>
        <Nav icon={<MessageCircle/>} label="Assistant" active={tab==="assistant"} onClick={()=>setTab("assistant")}/>
        <Nav icon={<Settings/>} label="Settings" active={tab==="settings"} onClick={()=>setTab("settings")}/>
      </nav>
    </main>
  );
}

function ClassRow({c,setStatus}:{c:ClassItem;setStatus:(id:number,s:Status)=>void}) {
  return <div className="classRow"><div className="time">{c.time}</div><div className="classInfo"><strong>{c.subject}</strong><span>{c.status==="upcoming"?"Upcoming":c.status}</span></div><div className="actions">
    <button title="Attended" className={c.status==="attended"?"selected yes":""} onClick={()=>setStatus(c.id,"attended")}><Check size={16}/></button>
    <button title="Missed" className={c.status==="missed"?"selected no":""} onClick={()=>setStatus(c.id,"missed")}><X size={16}/></button>
    <button title="Cancelled" className={c.status==="cancelled"?"selected cancel":""} onClick={()=>setStatus(c.id,"cancelled")}><Ban size={16}/></button>
  </div></div>
}
function Nav({icon,label,active,onClick}:{icon:React.ReactNode;label:string;active:boolean;onClick:()=>void}) { return <button className={`navItem ${active?"active":""}`} onClick={onClick}>{icon}<span>{label}</span></button> }
function PageTitle({title,subtitle}:{title:string;subtitle:string}) { return <div className="pageTitle"><h1>{title}</h1><p>{subtitle}</p></div> }
function Setting({icon,title,value}:{icon:React.ReactNode;title:string;value:string}) { return <div className="setting"><div className="settingIcon">{icon}</div><div><strong>{title}</strong><span>{value}</span></div><ChevronRight size={18}/></div> }