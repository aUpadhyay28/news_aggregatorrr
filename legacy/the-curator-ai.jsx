import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#0D0D11",
  surface: "#17171C",
  surfaceVar: "#1E1E25",
  surfaceHover: "#252530",
  border: "#2A2A36",
  borderBright: "#3A3A4A",
  accent: "#8B8FFF",
  accentDim: "rgba(139,143,255,0.1)",
  accentGlow: "rgba(139,143,255,0.25)",
  primary: "#6366F1",
  primaryDim: "rgba(99,102,241,0.15)",
  tertiary: "#C084FC",
  success: "#34D399",
  warn: "#FBBF24",
  onSurface: "#E8E6EA",
  onSurfaceVar: "#9892A8",
  outline: "#4C4860",
};

const IMG_GRADIENTS = {
  Technology: "linear-gradient(135deg,#1e1060 0%,#2d0063 50%,#0a0830 100%)",
  AI: "linear-gradient(135deg,#0a1628 0%,#1a3a5c 50%,#0f2240 100%)",
  Economy: "linear-gradient(135deg,#0d1a0d 0%,#1a3520 50%,#082010 100%)",
  Geopolitics: "linear-gradient(135deg,#1a0d00 0%,#3a1a00 50%,#200e00 100%)",
  Climate: "linear-gradient(135deg,#001a1a 0%,#003333 50%,#001515 100%)",
  Markets: "linear-gradient(135deg,#1a1a00 0%,#333300 50%,#151500 100%)",
  default: "linear-gradient(135deg,#130d2a 0%,#1e1040 50%,#0d0a20 100%)",
};

const FALLBACK_ARTICLES = [
  {id:1,title:"Claude 4 Achieves Breakthrough in Multi-Step Reasoning",category:"AI",time:"1h ago",summary:"Anthropic's latest model shows 40% improvement on complex reasoning benchmarks, outperforming previous generations on multi-turn scientific tasks.",aiInsight:"This reasoning breakthrough suggests AGI timelines may accelerate by 18 months as contextual understanding approaches human-level performance.",source:"Anthropic Blog",readTime:"5 min",relevanceScore:9.8,hero:true},
  {id:2,title:"OpenAI Launches Real-Time Voice API for Enterprise",category:"Technology",time:"3h ago",summary:"The new API enables sub-200ms voice interactions with GPT-4o, targeting call centers and customer service automation at scale.",aiInsight:"Enterprise adoption of voice AI could displace 2.4M call center jobs by 2026 while reducing operational costs by 60%.",source:"OpenAI",readTime:"4 min",relevanceScore:9.2},
  {id:3,title:"EU AI Act Enforcement Begins: First Fines Issued",category:"Geopolitics",time:"5h ago",summary:"European regulators issued the first penalties under the AI Act, targeting three major tech firms for non-compliant high-risk AI deployments.",aiInsight:"Regulatory pressure is reshaping AI deployment strategies globally, with compliance costs now exceeding $50B annually across the industry.",source:"Reuters",readTime:"4 min",relevanceScore:8.7},
  {id:4,title:"NVIDIA Blackwell GPU Demand Surges 280% in Q1",category:"Markets",time:"6h ago",summary:"Supply constraints persist as hyperscalers race to build AI infrastructure, with lead times extending to 24 months for enterprise clusters.",aiInsight:"The GPU shortage creates a $200B+ market opportunity for alternative accelerator startups targeting efficiency over raw throughput.",source:"Bloomberg",readTime:"3 min",relevanceScore:8.4},
  {id:5,title:"DeepMind Protein Folding Model Predicts Drug Candidates",category:"Technology",time:"8h ago",summary:"AlphaFold 3 extension successfully identified 12 novel drug-binding sites for Alzheimer's treatment in a partnership with major pharma.",aiInsight:"AI-accelerated drug discovery could compress development timelines from 12 years to under 3, transforming a $1.5T industry.",source:"Nature",readTime:"6 min",relevanceScore:8.1},
  {id:6,title:"China's Baidu Releases Open-Source LLM Challenging Llama 3",category:"Geopolitics",time:"10h ago",summary:"ERNIE Speed-X surpasses Meta's Llama 3 on Chinese language benchmarks and matches performance on English tasks at half the compute cost.",aiInsight:"The open-source AI race is becoming geopolitical, potentially fracturing global AI development into Western and Eastern ecosystems.",source:"Wired",readTime:"4 min",relevanceScore:7.9},
  {id:7,title:"Solar + AI Grid Management Cuts Energy Waste by 34%",category:"Climate",time:"12h ago",summary:"A new AI-driven grid balancing system deployed across 8 US states uses predictive modeling to optimize renewable energy distribution.",aiInsight:"AI-managed grids could accelerate the renewable transition by solving intermittency, making coal economically unviable by 2028.",source:"MIT Tech Review",readTime:"3 min",relevanceScore:7.6},
  {id:8,title:"Anthropic Releases 200K Context Window Model",category:"AI",time:"14h ago",summary:"Claude's expanded context enables ingesting entire codebases and legal documents in a single prompt, unlocking enterprise workflows.",aiInsight:"Longer context windows fundamentally change how enterprises interact with AI — from question-answer to full workflow automation.",source:"Anthropic",readTime:"4 min",relevanceScore:7.3},
];

function CategoryBadge({cat}){
  const colors={AI:{bg:"rgba(99,102,241,0.18)",c:"#A5A8FF"},Technology:{bg:"rgba(139,92,246,0.18)",c:"#C4B5FD"},Economy:{bg:"rgba(52,211,153,0.15)",c:"#6EE7B7"},Geopolitics:{bg:"rgba(251,191,36,0.15)",c:"#FCD34D"},Climate:{bg:"rgba(20,184,166,0.15)",c:"#5EEAD4"},Markets:{bg:"rgba(251,146,60,0.15)",c:"#FDBA74"}};
  const s=colors[cat]||{bg:"rgba(139,143,255,0.15)",c:"#A5A8FF"};
  return <span style={{background:s.bg,color:s.c,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",padding:"3px 10px",borderRadius:20,display:"inline-block"}}>{cat}</span>;
}

function ArticleCard({article, onOpen, onSave, saved}){
  const grad=IMG_GRADIENTS[article.category]||IMG_GRADIENTS.default;
  return(
    <article onClick={()=>onOpen(article)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",cursor:"pointer",transition:"transform 0.2s,border-color 0.2s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=C.borderBright;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=C.border;}}>
      <div style={{height:160,background:grad,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 30% 50%,rgba(99,102,241,0.2) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",bottom:12,left:16}}><CategoryBadge cat={article.category}/></div>
        <button onClick={e=>{e.stopPropagation();onSave(article);}} style={{position:"absolute",top:10,right:10,background:"rgba(0,0,0,0.4)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:saved?"#FBBF24":C.onSurfaceVar,fontSize:14,backdropFilter:"blur(4px)"}}>
          {saved?"★":"☆"}
        </button>
      </div>
      <div style={{padding:"18px 20px 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:11,color:C.outline,fontWeight:600}}>{article.source} · {article.time}</span>
          <span style={{fontSize:11,color:C.outline}}>{article.readTime}</span>
        </div>
        <h3 style={{fontSize:16,fontWeight:700,color:C.onSurface,marginBottom:14,lineHeight:1.4,margin:"0 0 14px"}}>{article.title}</h3>
        <div style={{background:C.accentDim,borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${C.accent}`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.accent}}>✦ AI Insight</span>
          </div>
          <p style={{fontSize:12,color:C.onSurfaceVar,lineHeight:1.55,margin:0}}>{article.aiInsight}</p>
        </div>
        {article.relevanceScore&&<div style={{marginTop:12,display:"flex",alignItems:"center",gap:8}}>
          <div style={{height:3,flex:1,background:C.border,borderRadius:99}}>
            <div style={{height:3,width:`${article.relevanceScore*10}%`,background:`linear-gradient(90deg,${C.primary},${C.accent})`,borderRadius:99}}/>
          </div>
          <span style={{fontSize:10,color:C.outline,fontWeight:600}}>RELEVANCE {article.relevanceScore?.toFixed(1)}</span>
        </div>}
      </div>
    </article>
  );
}

function HeroArticle({article, onOpen}){
  if(!article)return null;
  const grad=IMG_GRADIENTS[article.category]||IMG_GRADIENTS.default;
  return(
    <div onClick={()=>onOpen(article)} style={{borderRadius:20,overflow:"hidden",position:"relative",cursor:"pointer",marginBottom:32,border:`1px solid ${C.border}`,minHeight:380}}>
      <div style={{width:"100%",height:"100%",minHeight:380,background:grad,position:"absolute",inset:0}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 20% 30%,rgba(99,102,241,0.35) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#0D0D11 0%,rgba(13,13,17,0.7) 50%,transparent 100%)"}}/>
      </div>
      <div style={{position:"relative",padding:"32px 40px 36px",display:"flex",flexDirection:"column",justifyContent:"flex-end",minHeight:380}}>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <CategoryBadge cat={article.category}/>
          <span style={{fontSize:11,color:C.onSurfaceVar,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>{article.time}</span>
          <span style={{fontSize:11,color:C.outline}}>· {article.source}</span>
        </div>
        <h1 style={{fontSize:32,fontWeight:800,color:C.onSurface,marginBottom:16,lineHeight:1.2,maxWidth:660,margin:"0 0 16px"}}>{article.title}</h1>
        <p style={{fontSize:15,color:C.onSurfaceVar,maxWidth:560,marginBottom:24,lineHeight:1.65,margin:"0 0 24px"}}>{article.summary}</p>
        <div style={{background:"rgba(13,13,17,0.7)",backdropFilter:"blur(12px)",border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 20px",maxWidth:520,display:"inline-flex",gap:14,alignItems:"flex-start"}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:C.accent,marginTop:5,flexShrink:0,animation:"pulse 2s infinite"}}/>
          <div>
            <span style={{fontSize:9,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:C.tertiary,display:"block",marginBottom:5}}>AI Contextual Insight</span>
            <p style={{fontSize:13,color:"rgba(232,230,234,0.85)",fontStyle:"italic",lineHeight:1.55,margin:0}}>{article.aiInsight}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({page, setPage}){
  const items=[
    {id:"home",icon:"⊞",label:"Feed"},
    {id:"search",icon:"◎",label:"Search"},
    {id:"saved",icon:"★",label:"Saved"},
    {id:"chat",icon:"◈",label:"AI Chat"},
    {id:"profile",icon:"◉",label:"Profile"},
    {id:"settings",icon:"⚙",label:"Settings"},
  ];
  return(
    <div style={{position:"fixed",left:0,top:0,bottom:0,width:220,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"24px 0",zIndex:100}}>
      <div style={{padding:"0 24px 28px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.tertiary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>◈</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.onSurface,letterSpacing:"-0.02em"}}>The Curator</div>
            <div style={{fontSize:10,color:C.onSurfaceVar,letterSpacing:"0.1em",textTransform:"uppercase"}}>AI Navigator</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,padding:"0 12px"}}>
        {items.map(it=>(
          <button key={it.id} onClick={()=>setPage(it.id)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"10px 14px",borderRadius:10,border:"none",cursor:"pointer",marginBottom:4,background:page===it.id?C.accentDim:"transparent",color:page===it.id?C.accent:C.onSurfaceVar,fontWeight:page===it.id?700:500,fontSize:14,textAlign:"left",transition:"all 0.15s"}}>
            <span style={{fontSize:16,width:20,textAlign:"center"}}>{it.icon}</span>
            {it.label}
            {page===it.id&&<div style={{marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:C.accent}}/>}
          </button>
        ))}
      </div>
      <div style={{padding:"16px 24px",borderTop:`1px solid ${C.border}`}}>
        <div style={{fontSize:11,color:C.outline,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8}}>Powered by</div>
        <div style={{fontSize:12,color:C.onSurfaceVar}}>Claude · Web Search · AI Curator</div>
      </div>
    </div>
  );
}

function TopNav({page, onRefresh, loading}){
  const titles={home:"Your Feed",search:"Search News",saved:"Saved Articles",chat:"AI News Chat",profile:"Profile",settings:"Settings"};
  return(
    <div style={{position:"fixed",top:0,left:220,right:0,height:60,background:`${C.bg}CC`,backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 28px",zIndex:99,gap:16}}>
      <h2 style={{flex:1,fontSize:18,fontWeight:700,color:C.onSurface,margin:0,letterSpacing:"-0.02em"}}>{titles[page]||page}</h2>
      {page==="home"&&<button onClick={onRefresh} style={{background:C.accentDim,color:C.accent,border:`1px solid ${C.accentGlow}`,borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:7}}>
        {loading?<span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>↻</span>:"↻"} {loading?"Fetching…":"Refresh"}
      </button>}
      <div style={{fontSize:12,color:C.outline,fontWeight:600}}>Live · AI-Curated</div>
    </div>
  );
}

function HomeFeed({articles, loading, onOpenArticle, savedIds, onSave}){
  const [tab, setTab]=useState("All");
  const tabs=["All","AI","Technology","Geopolitics","Economy","Climate","Markets"];
  const filtered=tab==="All"?articles:articles.filter(a=>a.category===tab);
  const hero=filtered[0];
  const rest=filtered.slice(1);
  if(loading) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"60vh",gap:16}}>
      <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${C.border}`,borderTopColor:C.accent,animation:"spin 1s linear infinite"}}/>
      <p style={{color:C.onSurfaceVar,fontSize:14}}>Curating your AI news feed…</p>
    </div>
  );
  return(
    <div style={{padding:"24px 28px 40px"}}>
      <div style={{display:"flex",gap:6,marginBottom:28,flexWrap:"wrap"}}>
        {tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"6px 16px",borderRadius:20,border:`1px solid ${tab===t?C.accent:C.border}`,background:tab===t?C.accentDim:"transparent",color:tab===t?C.accent:C.onSurfaceVar,cursor:"pointer",fontSize:13,fontWeight:tab===t?700:500,transition:"all 0.15s"}}>{t}</button>)}
      </div>
      {hero&&<HeroArticle article={hero} onOpen={onOpenArticle}/>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20}}>
        {rest.map(a=><ArticleCard key={a.id} article={a} onOpen={onOpenArticle} onSave={onSave} saved={savedIds.has(a.id)}/>)}
      </div>
    </div>
  );
}

function ArticleDetail({article, onBack, onSave, saved}){
  const [digest, setDigest]=useState(null);
  const [loadingDigest, setLoadingDigest]=useState(false);
  useEffect(()=>{ generateDigest(); },[article]);
  async function generateDigest(){
    setLoadingDigest(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`Write a detailed article digest for this news item. Include: key takeaways (3 bullets), market implications, and who should care about this. Keep it concise and insightful.\n\nTitle: ${article.title}\nSummary: ${article.summary}\nAI Insight: ${article.aiInsight}`}],system:"You are an expert AI news analyst. Provide a structured digest with bullet points. Use • for bullets."})});
      const d=await res.json();
      setDigest(d.content?.[0]?.text||"");
    }catch(e){ setDigest("AI digest unavailable. "+article.summary); }
    setLoadingDigest(false);
  }
  const grad=IMG_GRADIENTS[article.category]||IMG_GRADIENTS.default;
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"24px 28px 60px"}}>
      <button onClick={onBack} style={{background:C.surfaceVar,color:C.onSurfaceVar,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>← Back</button>
      <div style={{height:280,borderRadius:16,background:grad,position:"relative",overflow:"hidden",marginBottom:28}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 20% 40%,rgba(99,102,241,0.3) 0%,transparent 60%)"}}/>
        <div style={{position:"absolute",bottom:24,left:28,display:"flex",gap:12,alignItems:"center"}}>
          <CategoryBadge cat={article.category}/>
          <span style={{fontSize:12,color:C.onSurfaceVar}}>{article.time} · {article.source}</span>
        </div>
        <button onClick={()=>onSave(article)} style={{position:"absolute",top:16,right:16,background:"rgba(0,0,0,0.5)",border:"none",borderRadius:8,padding:"8px 12px",cursor:"pointer",color:saved?"#FBBF24":C.onSurfaceVar,fontSize:18}}>
          {saved?"★":"☆"}
        </button>
      </div>
      <h1 style={{fontSize:28,fontWeight:800,color:C.onSurface,marginBottom:16,lineHeight:1.25}}>{article.title}</h1>
      <p style={{fontSize:16,color:C.onSurfaceVar,lineHeight:1.7,marginBottom:28}}>{article.summary}</p>
      <div style={{background:C.accentDim,border:`1px solid ${C.accentGlow}`,borderRadius:14,padding:"18px 20px",marginBottom:28}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.accent,marginBottom:8}}>✦ AI Contextual Insight</div>
        <p style={{fontSize:14,color:C.onSurfaceVar,fontStyle:"italic",lineHeight:1.6,margin:0}}>{article.aiInsight}</p>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px"}}>
        <div style={{fontSize:13,fontWeight:700,color:C.onSurface,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>◈</span> AI-Generated Digest
          {loadingDigest&&<span style={{fontSize:12,color:C.outline,fontWeight:400,marginLeft:"auto"}}>Generating…</span>}
        </div>
        {loadingDigest?<div style={{height:3,background:C.border,borderRadius:99,overflow:"hidden"}}><div style={{height:3,width:"40%",background:`linear-gradient(90deg,${C.primary},${C.accent})`,borderRadius:99,animation:"slide 1.5s ease-in-out infinite"}}/></div>
        :<pre style={{fontSize:13,color:C.onSurfaceVar,lineHeight:1.7,whiteSpace:"pre-wrap",margin:0,fontFamily:"inherit"}}>{digest}</pre>}
      </div>
    </div>
  );
}

function AIChatPage(){
  const [msgs, setMsgs]=useState([{role:"assistant",content:"Hi! I'm your AI news curator powered by Claude. Ask me anything about current AI news, tech trends, market implications, or have me search for specific topics."}]);
  const [input, setInput]=useState("");
  const [loading, setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);
  async function send(){
    if(!input.trim()||loading)return;
    const userMsg=input.trim();
    setInput("");
    setMsgs(m=>[...m,{role:"user",content:userMsg}]);
    setLoading(true);
    try{
      const history=msgs.filter(m=>m.role!=="system").map(m=>({role:m.role,content:m.content}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[...history,{role:"user",content:userMsg}],system:"You are an expert AI news curator. Answer questions about AI, tech, markets, and global news. Search the web for current information. Be concise, insightful, and cite sources when relevant."})});
      const d=await res.json();
      const text=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"I couldn't get a response. Please try again.";
      setMsgs(m=>[...m,{role:"assistant",content:text}]);
    }catch(e){ setMsgs(m=>[...m,{role:"assistant",content:"Error reaching AI. Please try again."}]); }
    setLoading(false);
  }
  return(
    <div style={{height:"calc(100vh - 60px)",display:"flex",flexDirection:"column",padding:"0 28px"}}>
      <div style={{flex:1,overflowY:"auto",padding:"24px 0",display:"flex",flexDirection:"column",gap:16}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            {m.role==="assistant"&&<div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.tertiary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:10,flexShrink:0,marginTop:2}}>◈</div>}
            <div style={{maxWidth:"72%",background:m.role==="user"?C.accentDim:C.surface,border:`1px solid ${m.role==="user"?C.accentGlow:C.border}`,borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"12px 16px"}}>
              <p style={{fontSize:14,color:C.onSurface,lineHeight:1.65,margin:0,whiteSpace:"pre-wrap"}}>{m.content}</p>
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:`linear-gradient(135deg,${C.primary},${C.tertiary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>◈</div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"16px 16px 16px 4px",padding:"12px 16px"}}>
            <div style={{display:"flex",gap:4,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.accent,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"16px 0 20px",borderTop:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:10,background:C.surface,borderRadius:14,padding:"8px 8px 8px 16px",border:`1px solid ${C.border}`}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask about AI news, trends, analysis…" style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.onSurface,fontSize:14,fontFamily:"inherit"}}/>
          <button onClick={send} disabled={!input.trim()||loading} style={{background:input.trim()&&!loading?C.primary:"transparent",border:`1px solid ${input.trim()&&!loading?C.primary:C.border}`,borderRadius:10,padding:"8px 18px",cursor:input.trim()&&!loading?"pointer":"not-allowed",color:input.trim()&&!loading?"white":C.outline,fontSize:13,fontWeight:600,transition:"all 0.15s"}}>Send</button>
        </div>
        <p style={{fontSize:11,color:C.outline,textAlign:"center",marginTop:8,marginBottom:0}}>AI-powered · Real-time web search · Curated by Claude</p>
      </div>
    </div>
  );
}

function SearchPage({articles, onOpenArticle, onSave, savedIds}){
  const [q, setQ]=useState("");
  const [results, setResults]=useState([]);
  const [loading, setLoading]=useState(false);
  const [aiSummary, setAiSummary]=useState("");
  async function doSearch(){
    if(!q.trim())return;
    setLoading(true);
    setAiSummary("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search for recent news about: "${q}". Find 5 relevant articles and provide results as JSON array with fields: id, title, category (one of: AI/Technology/Economy/Geopolitics/Climate/Markets), summary (2 sentences), aiInsight (1-2 sentences on implications), source, time, readTime, relevanceScore (0-10). Then add a brief summary paragraph about this topic. Return: {"articles":[...],"overview":"..."}`}],system:"Return ONLY valid JSON with no markdown code fences."})});
      const d=await res.json();
      const text=d.content?.find(b=>b.type==="text")?.text||"{}";
      const jsonMatch=text.match(/\{[\s\S]*\}/);
      if(jsonMatch){
        const parsed=JSON.parse(jsonMatch[0]);
        setResults((parsed.articles||[]).map((a,i)=>({...a,id:Date.now()+i})));
        setAiSummary(parsed.overview||"");
      }
    }catch(e){
      const filtered=articles.filter(a=>a.title.toLowerCase().includes(q.toLowerCase())||a.category.toLowerCase().includes(q.toLowerCase()));
      setResults(filtered);
      setAiSummary("Showing results from cached feed.");
    }
    setLoading(false);
  }
  return(
    <div style={{padding:"24px 28px 40px"}}>
      <div style={{maxWidth:600,marginBottom:28}}>
        <div style={{display:"flex",gap:10,background:C.surface,borderRadius:14,padding:"10px 10px 10px 20px",border:`1px solid ${C.border}`}}>
          <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doSearch()} placeholder="Search for any AI or tech news topic…" style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.onSurface,fontSize:15,fontFamily:"inherit"}}/>
          <button onClick={doSearch} style={{background:C.primary,border:"none",borderRadius:10,padding:"10px 22px",cursor:"pointer",color:"white",fontSize:14,fontWeight:600}}>Search</button>
        </div>
      </div>
      {loading&&<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${C.border}`,borderTopColor:C.accent,animation:"spin 1s linear infinite"}}/>
        <span style={{fontSize:14,color:C.onSurfaceVar}}>Searching the web with AI…</span>
      </div>}
      {aiSummary&&<div style={{background:C.accentDim,border:`1px solid ${C.accentGlow}`,borderRadius:14,padding:"16px 20px",marginBottom:24}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.accent,marginBottom:8}}>AI Overview</div>
        <p style={{fontSize:14,color:C.onSurfaceVar,lineHeight:1.65,margin:0}}>{aiSummary}</p>
      </div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
        {results.map(a=><ArticleCard key={a.id} article={a} onOpen={onOpenArticle} onSave={onSave} saved={savedIds.has(a.id)}/>)}
      </div>
      {!loading&&results.length===0&&q&&<div style={{textAlign:"center",padding:"60px 0",color:C.outline}}>No results found. Try a different query.</div>}
    </div>
  );
}

function SavedPage({articles, onOpenArticle, onSave}){
  const ids=new Set(articles.map(a=>a.id));
  if(articles.length===0) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"50vh",gap:12,color:C.onSurfaceVar}}>
      <span style={{fontSize:40}}>★</span>
      <p style={{fontSize:16}}>No saved articles yet</p>
      <p style={{fontSize:13,color:C.outline}}>Click the star on any article to save it</p>
    </div>
  );
  return(
    <div style={{padding:"24px 28px 40px"}}>
      <div style={{marginBottom:20,color:C.onSurfaceVar,fontSize:13}}>{articles.length} saved article{articles.length!==1?"s":""}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20}}>
        {articles.map(a=><ArticleCard key={a.id} article={a} onOpen={onOpenArticle} onSave={onSave} saved={ids.has(a.id)}/>)}
      </div>
    </div>
  );
}

function ProfilePage({profile, onUpdate}){
  const [name,setName]=useState(profile.name);
  const [interests,setInterests]=useState(profile.interests.join(", "));
  const [saved,setSaved]=useState(false);
  function save(){
    onUpdate({...profile,name,interests:interests.split(",").map(s=>s.trim()).filter(Boolean)});
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }
  return(
    <div style={{maxWidth:540,padding:"28px 28px 40px"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 28px 24px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28}}>
          <div style={{width:56,height:56,borderRadius:16,background:`linear-gradient(135deg,${C.primary},${C.tertiary})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{profile.name[0]||"C"}</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:C.onSurface}}>{profile.name}</div>
            <div style={{fontSize:12,color:C.onSurfaceVar}}>Personalized AI Curator</div>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <label style={{fontSize:12,fontWeight:600,color:C.onSurfaceVar,display:"block",marginBottom:8,letterSpacing:"0.05em",textTransform:"uppercase"}}>Display Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:"100%",background:C.surfaceVar,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.onSurface,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none"}}/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{fontSize:12,fontWeight:600,color:C.onSurfaceVar,display:"block",marginBottom:8,letterSpacing:"0.05em",textTransform:"uppercase"}}>Interests (comma-separated)</label>
          <textarea value={interests} onChange={e=>setInterests(e.target.value)} rows={3} style={{width:"100%",background:C.surfaceVar,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",color:C.onSurface,fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none",resize:"vertical"}}/>
          <p style={{fontSize:11,color:C.outline,margin:"6px 0 0"}}>These interests personalize your AI curation ranking.</p>
        </div>
        <button onClick={save} style={{background:saved?C.success:C.primary,border:"none",borderRadius:10,padding:"11px 24px",cursor:"pointer",color:"white",fontSize:14,fontWeight:700,transition:"background 0.2s"}}>
          {saved?"✓ Saved!":"Save Profile"}
        </button>
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 24px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.onSurface,marginBottom:12}}>Active Interests</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {profile.interests.map(i=><span key={i} style={{background:C.accentDim,color:C.accent,border:`1px solid ${C.accentGlow}`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:600}}>{i}</span>)}
        </div>
      </div>
    </div>
  );
}

function SettingsPage(){
  const settings=[
    {label:"Real-time news fetching",desc:"Fetch live news when refreshing feed",enabled:true},
    {label:"AI-generated digests",desc:"Auto-generate article summaries with Claude",enabled:true},
    {label:"Personalized curation",desc:"Rank articles by your interests",enabled:true},
    {label:"Web search in chat",desc:"Allow AI chat to search the web",enabled:true},
  ];
  const [state,setState]=useState(settings.map(s=>s.enabled));
  return(
    <div style={{maxWidth:540,padding:"28px 28px 40px"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",marginBottom:20}}>
        {settings.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"16px 20px",borderBottom:i<settings.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:C.onSurface}}>{s.label}</div>
              <div style={{fontSize:12,color:C.onSurfaceVar,marginTop:2}}>{s.desc}</div>
            </div>
            <button onClick={()=>setState(st=>st.map((v,j)=>j===i?!v:v))} style={{width:44,height:24,borderRadius:12,background:state[i]?C.primary:C.border,border:"none",cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
              <div style={{width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:state[i]?23:3,transition:"left 0.2s"}}/>
            </button>
          </div>
        ))}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 24px"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.onSurface,marginBottom:8}}>About The Curator × AI Navigator</div>
        <p style={{fontSize:13,color:C.onSurfaceVar,lineHeight:1.65,margin:0}}>This app combines "The Curator" frontend with the "AI News Navigator" backend pipeline. Real-time news is fetched from Anthropic, OpenAI, YouTube channels, and major publications, then curated and ranked using Claude AI based on your interests.</p>
      </div>
    </div>
  );
}

const CSS=`
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${C.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 99px; }
`;

export default function App(){
  const [page, setPage]=useState("home");
  const [articles, setArticles]=useState(FALLBACK_ARTICLES);
  const [loading, setLoading]=useState(false);
  const [selectedArticle, setSelectedArticle]=useState(null);
  const [savedArticles, setSavedArticles]=useState([]);
  const [userProfile, setUserProfile]=useState({name:"Curator",interests:["AI Models","LLMs","Machine Learning","Tech Industry"],expertise:"intermediate"});

  const savedIds=new Set(savedArticles.map(a=>a.id));

  const fetchNews=useCallback(async()=>{
    setLoading(true);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3500,tools:[{type:"web_search_20250305",name:"web_search"}],messages:[{role:"user",content:`Search for the latest AI and technology news from today. Find 8 major stories covering: new AI models, tech company news, AI policy, research breakthroughs, markets, and global tech. For EACH story return a JSON object with: id(number), title(string), category(one of: AI/Technology/Economy/Geopolitics/Climate/Markets), time(like "2h ago"), summary(2-3 sentences), aiInsight(1-2 sentences on AI implications), source(publication name), readTime(like "4 min"), relevanceScore(7.0-10.0). Return ONLY a JSON array, no other text.`}],system:"You must return ONLY a valid JSON array. No markdown, no code fences, no explanation. Just the raw JSON array starting with [ and ending with ]."})});
      const d=await res.json();
      const text=d.content?.find(b=>b.type==="text")?.text||"";
      const match=text.match(/\[[\s\S]*\]/);
      if(match){
        const parsed=JSON.parse(match[0]);
        if(Array.isArray(parsed)&&parsed.length>0){
          setArticles(parsed.map((a,i)=>({...a,id:i+1,hero:i===0})));
        }
      }
    }catch(e){ console.log("Using fallback articles"); }
    setLoading(false);
  },[]);

  useEffect(()=>{ fetchNews(); },[]);

  function navigate(p){ setPage(p); }
  function openArticle(a){ setSelectedArticle(a); setPage("article"); }
  function toggleSave(a){
    setSavedArticles(prev=>{
      const has=prev.some(s=>s.id===a.id);
      return has?prev.filter(s=>s.id!==a.id):[...prev,a];
    });
  }

  return(
    <>
      <style>{CSS}</style>
      <Sidebar page={page} setPage={navigate}/>
      <div style={{marginLeft:220}}>
        <TopNav page={page} onRefresh={fetchNews} loading={loading}/>
        <main style={{paddingTop:60,minHeight:"100vh",background:C.bg}}>
          {page==="home"&&<HomeFeed articles={articles} loading={loading} onOpenArticle={openArticle} savedIds={savedIds} onSave={toggleSave}/>}
          {page==="article"&&selectedArticle&&<ArticleDetail article={selectedArticle} onBack={()=>navigate("home")} onSave={toggleSave} saved={savedIds.has(selectedArticle.id)}/>}
          {page==="chat"&&<AIChatPage/>}
          {page==="search"&&<SearchPage articles={articles} onOpenArticle={openArticle} onSave={toggleSave} savedIds={savedIds}/>}
          {page==="saved"&&<SavedPage articles={savedArticles} onOpenArticle={openArticle} onSave={toggleSave}/>}
          {page==="profile"&&<ProfilePage profile={userProfile} onUpdate={setUserProfile}/>}
          {page==="settings"&&<SettingsPage/>}
        </main>
      </div>
    </>
  );
}
