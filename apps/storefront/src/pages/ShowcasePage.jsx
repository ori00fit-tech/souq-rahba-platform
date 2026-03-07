import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   ZELLIGE DESIGN SYSTEM
   Colors extracted from authentic Moroccan Zellige tile:
   Cobalt Blue, Brick Red, Olive Green, Gold, Ivory, Black
═══════════════════════════════════════════════════════ */
const Z = {
  // Primary Zellige palette
  cobalt:    "#1B3A6B",   // deep cobalt blue
  cobaltMid: "#2855A0",   // mid blue
  cobaltLight:"#4A7CC7",  // light blue
  cobaltPale: "#D6E4F7",  // pale blue tint
  brick:     "#B8391A",   // brick red
  brickDark: "#8B2510",   // dark brick
  brickLight:"#D45A38",   // light brick
  brickPale: "#FAE8E3",   // pale brick
  olive:     "#3D5C2E",   // olive green
  oliveMid:  "#5A8042",   // mid olive
  olivePale: "#E4EDD9",   // pale olive
  gold:      "#C8922A",   // zellige gold
  goldLight: "#E8B84B",   // bright gold
  goldPale:  "#FDF3DC",   // pale gold
  ivory:     "#F8F4EC",   // warm ivory background
  ivoryDark: "#EDE7D8",   // darker ivory
  cream:     "#FBF8F2",   // cream
  charcoal:  "#1C1C1E",   // near black
  darkBlue:  "#0D2444",   // darkest blue (nav)
  ink:       "#2C2416",   // warm ink
  gray:      "#6B6560",   // warm gray
  grayLight: "#E8E2D8",   // warm light gray
  white:     "#FFFFFF",

  // Geometric pattern colors (from zellige)
  geo1: "#1B3A6B",
  geo2: "#B8391A",
  geo3: "#3D5C2E",
  geo4: "#C8922A",
  geo5: "#F8F4EC",
};

/* ═══════════════════════════════════════════════════════
   ZELLIGE SVG PATTERN (Generated geometric mosaic)
═══════════════════════════════════════════════════════ */
const ZelligeSVGPattern = () => (
  <svg width="0" height="0" style={{position:"absolute"}}>
    <defs>
      <pattern id="zellige-sm" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill={Z.ivory}/>
        <polygon points="20,2 38,20 20,38 2,20" fill="none" stroke={Z.cobalt} strokeWidth="1.5" opacity="0.3"/>
        <polygon points="20,8 32,20 20,32 8,20" fill="none" stroke={Z.brick} strokeWidth="1" opacity="0.2"/>
        <circle cx="20" cy="20" r="3" fill={Z.gold} opacity="0.25"/>
        <circle cx="0" cy="0" r="2" fill={Z.cobalt} opacity="0.2"/>
        <circle cx="40" cy="0" r="2" fill={Z.cobalt} opacity="0.2"/>
        <circle cx="0" cy="40" r="2" fill={Z.cobalt} opacity="0.2"/>
        <circle cx="40" cy="40" r="2" fill={Z.cobalt} opacity="0.2"/>
      </pattern>
      <pattern id="zellige-hero" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="80" height="80" fill={Z.darkBlue}/>
        {/* 8-pointed star */}
        <polygon points="40,5 47,28 70,20 55,38 75,48 52,50 55,74 40,58 25,74 28,50 5,48 25,38 10,20 33,28" fill="none" stroke={Z.goldLight} strokeWidth="1" opacity="0.15"/>
        <polygon points="40,15 45,30 60,25 50,37 65,45 50,46 52,62 40,52 28,62 30,46 15,45 30,37 20,25 35,30" fill="none" stroke={Z.cobaltLight} strokeWidth="0.8" opacity="0.2"/>
        <circle cx="40" cy="40" r="5" fill={Z.gold} opacity="0.2"/>
        <circle cx="0" cy="0" r="3" fill={Z.cobaltLight} opacity="0.15"/>
        <circle cx="80" cy="80" r="3" fill={Z.cobaltLight} opacity="0.15"/>
        <circle cx="80" cy="0" r="3" fill={Z.brick} opacity="0.12"/>
        <circle cx="0" cy="80" r="3" fill={Z.brick} opacity="0.12"/>
      </pattern>
      <pattern id="zellige-card" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="transparent"/>
        <polygon points="10,1 19,10 10,19 1,10" fill="none" stroke={Z.cobalt} strokeWidth="0.6" opacity="0.12"/>
        <circle cx="10" cy="10" r="1.5" fill={Z.gold} opacity="0.15"/>
      </pattern>
    </defs>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700;800;900&family=Cinzel:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{
      font-family:'Tajawal',sans-serif;
      background:${Z.ivory};
      color:${Z.ink};
      direction:rtl;
      -webkit-font-smoothing:antialiased;
      overflow-x:hidden;
    }
    ::-webkit-scrollbar{width:6px;}
    ::-webkit-scrollbar-track{background:${Z.ivoryDark};}
    ::-webkit-scrollbar-thumb{background:${Z.cobalt};border-radius:3px;}
    input,select,textarea,button{font-family:'Tajawal',sans-serif;}

    @keyframes fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
    @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
    @keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
    @keyframes ticker{from{transform:translateX(0);}to{transform:translateX(-50%);}}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    @keyframes bounceIn{0%{transform:scale(0);opacity:0;}60%{transform:scale(1.15);}100%{transform:scale(1);opacity:1;}}
    @keyframes rotate-star{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(200,146,42,0.3);}50%{box-shadow:0 0 40px rgba(200,146,42,0.6);}}

    .page-enter{animation:fadeIn .4s ease both;}
    .reveal{opacity:0;transform:translateY(20px);transition:opacity .6s ease,transform .6s ease;}
    .reveal.visible{opacity:1;transform:translateY(0);}

    /* Zellige border decoration */
    .z-border-top{
      height:8px;
      background:repeating-linear-gradient(
        90deg,
        ${Z.cobalt} 0px 14px,
        ${Z.gold} 14px 28px,
        ${Z.brick} 28px 42px,
        ${Z.olive} 42px 56px,
        ${Z.cobaltLight} 56px 70px,
        ${Z.goldLight} 70px 84px,
        ${Z.charcoal} 84px 98px,
        ${Z.brickLight} 98px 112px
      );
    }

    /* Star shape clip */
    .star-clip{clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);}

    /* Hover link underline */
    .nav-link{position:relative;text-decoration:none;}
    .nav-link::after{content:'';position:absolute;bottom:-2px;right:0;left:0;height:2px;background:${Z.goldLight};transform:scaleX(0);transition:transform .25s;}
    .nav-link:hover::after{transform:scaleX(1);}

    /* Product card shine */
    .card-shine{position:relative;overflow:hidden;}
    .card-shine::before{content:'';position:absolute;top:0;right:-200%;width:80%;height:100%;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%);transition:right .5s ease;z-index:1;pointer-events:none;}
    .card-shine:hover::before{right:120%;}
  `}</style>
);

/* ═══════════════════════════════════════════════════════
   ZELLIGE BORDER COMPONENT
═══════════════════════════════════════════════════════ */
const ZBorder = ({ height=8 }) => (
  <div style={{
    height,
    background:`repeating-linear-gradient(90deg,
      ${Z.cobalt} 0px 14px, ${Z.gold} 14px 28px,
      ${Z.brick} 28px 42px, ${Z.olive} 42px 56px,
      ${Z.cobaltLight} 56px 70px, ${Z.goldLight} 70px 84px,
      ${Z.charcoal} 84px 98px, ${Z.brickLight} 98px 112px
    )`
  }} />
);

/* ═══════════════════════════════════════════════════════
   GEOMETRIC STAR DECORATION
═══════════════════════════════════════════════════════ */
const ZStar = ({ size=24, color=Z.gold, opacity=0.6, style={} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity, ...style }}>
    <polygon points="12,1 14.5,8.5 22,9 16.5,14 18.5,22 12,17.5 5.5,22 7.5,14 2,9 9.5,8.5" fill={color}/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════ */
const PRODUCTS = [
  {id:1,name:"أحذية رياضية نايكي إير ماكس",nameEn:"Nike Air Max",price:580,oldPrice:830,cat:"أزياء",subCat:"أحذية",emoji:"👟",seller:"Sneaker House MA",sellerCity:"الدار البيضاء",rating:4.9,reviews:247,badge:"خصم 30%",badgeColor:Z.brick,cod:true,stock:12,prime:true,desc:"أحذية رياضية فاخرة من نايكي بتقنية Air Max للراحة القصوى. مقاسات 38–46.",tags:["رياضة","نايكي","أحذية"]},
  {id:2,name:"هاتف سامسونج جالاكسي A55",nameEn:"Samsung Galaxy A55",price:3499,oldPrice:3999,cat:"إلكترونيات",subCat:"هواتف",emoji:"📱",seller:"TechZone Casa",sellerCity:"الدار البيضاء",rating:4.6,reviews:189,badge:"جديد",badgeColor:Z.cobalt,cod:true,stock:5,prime:true,desc:"شاشة Super AMOLED 6.6 بوصة، كاميرا ثلاثية 50MP، بطارية 5000mAh، ضمان سنة.",tags:["سامسونج","هواتف","إلكترونيات"]},
  {id:3,name:"مجموعة عناية أرغان مغربي",nameEn:"Argan Beauty Set",price:220,oldPrice:400,cat:"جمال",subCat:"عناية",emoji:"🧴",seller:"BeautyHub Maroc",sellerCity:"الرباط",rating:4.8,reviews:532,badge:"الأكثر مبيعاً",badgeColor:Z.olive,cod:true,stock:30,prime:true,desc:"مجموعة عناية طبيعية 100% بزيت الأرغان المغربي. مرطب، سيروم، وصابون.",tags:["أرغان","جمال","طبيعي"]},
  {id:4,name:"PlayStation 5 — نسخة مغرب",nameEn:"PlayStation 5",price:6999,oldPrice:null,cat:"إلكترونيات",subCat:"ألعاب",emoji:"🎮",seller:"GamerZone MA",sellerCity:"طنجة",rating:5.0,reviews:84,badge:"محدود",badgeColor:Z.brickDark,cod:true,stock:3,prime:false,desc:"جهاز PS5 النسخة الرسمية للمغرب مع ضمان سنة وإمكانية الإرجاع 7 أيام.",tags:["بلايستيشن","ألعاب","سوني"]},
  {id:5,name:"تاجين فخار فاسي يدوي",nameEn:"Fes Clay Tajine",price:185,oldPrice:250,cat:"منزل",subCat:"أواني",emoji:"🏺",seller:"Artisanat Fès",sellerCity:"فاس",rating:4.7,reviews:163,badge:"صنع يدوي",badgeColor:Z.gold,cod:true,stock:20,prime:false,desc:"تاجين أصيل من فخار فاس. يدوي الصنع بنقوش بربرية وألوان الزليج الطبيعية.",tags:["تاجين","فاس","تراث"]},
  {id:6,name:"لابتوب أسوس VivoBook 15",nameEn:"Asus VivoBook 15",price:4999,oldPrice:5800,cat:"إلكترونيات",subCat:"حواسيب",emoji:"💻",seller:"PC Shop Rabat",sellerCity:"الرباط",rating:4.5,reviews:211,badge:"خصم 14%",badgeColor:Z.brick,cod:false,stock:8,prime:true,desc:"Intel Core i7، 16GB RAM، SSD 512GB، شاشة FHD 15.6 بوصة. مثالي للعمل.",tags:["لابتوب","أسوس","حواسيب"]},
  {id:7,name:"جلباب مغربي فاخر رجالي",nameEn:"Moroccan Djellaba",price:450,oldPrice:600,cat:"أزياء",subCat:"جلابيب",emoji:"👘",seller:"Medina Fashion",sellerCity:"مراكش",rating:4.9,reviews:98,badge:"خصم 25%",badgeColor:Z.brick,cod:true,stock:15,prime:false,desc:"جلباب مغربي فاخر من قماش القطن الناعم مع تطريز يدوي. متوفر بعدة ألوان.",tags:["جلباب","مغربي","أزياء"]},
  {id:8,name:"قفطان عرس مطرز فاسي",nameEn:"Fes Wedding Kaftan",price:1800,oldPrice:2400,cat:"أزياء",subCat:"قفاطين",emoji:"👗",seller:"Dar Al-Kaftan",sellerCity:"فاس",rating:5.0,reviews:67,badge:"حصري",badgeColor:Z.goldLight,cod:false,stock:4,prime:false,desc:"قفطان عرس فاسي بتطريز ذهبي يدوي. تحفة فنية مغربية أصيلة للمناسبات الكبرى.",tags:["قفطان","عرس","فاس"]},
];

const CATEGORIES = [
  {name:"أزياء وملابس",emoji:"👗",count:12400,color:Z.brickPale,accent:Z.brick,icon:"👗"},
  {name:"إلكترونيات",emoji:"📱",count:5600,color:Z.cobaltPale,accent:Z.cobalt,icon:"📱"},
  {name:"جمال وعناية",emoji:"🧴",count:8200,color:Z.olivePale,accent:Z.olive,icon:"🧴"},
  {name:"منزل وديكور",emoji:"🏺",count:9800,color:Z.goldPale,accent:Z.gold,icon:"🏺"},
  {name:"مواد غذائية",emoji:"🫒",count:3400,color:Z.olivePale,accent:Z.oliveMid,icon:"🫒"},
  {name:"رياضة",emoji:"⚽",count:4100,color:Z.cobaltPale,accent:Z.cobaltMid,icon:"⚽"},
  {name:"كتب وثقافة",emoji:"📚",count:2200,color:Z.goldPale,accent:Z.gold,icon:"📚"},
  {name:"حرف وتراث",emoji:"🏵️",count:1800,color:Z.brickPale,accent:Z.brickLight,icon:"🏵️"},
];

const BANNERS = [
  {title:"تخفيضات الصيف الكبرى",sub:"حتى 70% على الأزياء والإلكترونيات",cta:"تسوق الآن",emoji:"🌟",bg:`linear-gradient(135deg, ${Z.cobalt} 0%, ${Z.darkBlue} 100%)`},
  {title:"رمضان كريم — عروض خاصة",sub:"هدايا مغربية أصيلة بأسعار استثنائية",cta:"اكتشف",emoji:"🌙",bg:`linear-gradient(135deg, ${Z.brickDark} 0%, ${Z.brick} 100%)`},
  {title:"الحرف المغربية",sub:"زليج • تاجين • قفطان • عطور الأرض",cta:"استكشف",emoji:"🏺",bg:`linear-gradient(135deg, ${Z.olive} 0%, ${Z.oliveMid} 100%)`},
];

/* ═══════════════════════════════════════════════════════
   SHARED UI COMPONENTS
═══════════════════════════════════════════════════════ */
function Btn({children,variant="primary",size="md",onClick,style={},disabled=false,full=false}){
  const [hov,setHov]=useState(false);
  const base={display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"'Tajawal',sans-serif",fontWeight:700,borderRadius:6,transition:"all .2s ease",opacity:disabled?.55:1,width:full?"100%":undefined,textDecoration:"none"};
  const sz={sm:{padding:"7px 16px",fontSize:13},md:{padding:"10px 22px",fontSize:14},lg:{padding:"14px 30px",fontSize:16},xl:{padding:"17px 36px",fontSize:17}};
  const vars={
    primary:{background:hov?Z.gold:Z.goldLight,color:Z.charcoal,boxShadow:hov?"0 4px 16px rgba(200,146,42,.4)":"0 2px 8px rgba(200,146,42,.25)"},
    cobalt:{background:hov?Z.cobaltMid:Z.cobalt,color:Z.white,boxShadow:hov?"0 4px 16px rgba(27,58,107,.5)":"0 2px 8px rgba(27,58,107,.3)"},
    brick:{background:hov?Z.brickDark:Z.brick,color:Z.white,boxShadow:hov?"0 4px 16px rgba(184,57,26,.5)":"0 2px 8px rgba(184,57,26,.3)"},
    olive:{background:hov?Z.olive:Z.oliveMid,color:Z.white},
    outline:{background:"transparent",border:`1.5px solid ${Z.cobalt}`,color:Z.cobalt,transform:hov?"translateY(-1px)":"none"},
    ghost:{background:hov?`${Z.cobalt}10`:"transparent",color:Z.cobalt},
    white:{background:Z.white,color:Z.charcoal,boxShadow:"0 2px 12px rgba(0,0,0,.12)"},
  };
  return(
    <button disabled={disabled} onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{...base,...sz[size],...vars[variant],transform:hov&&!disabled?"translateY(-1px)":"none",...style}}>
      {children}
    </button>
  );
}

function ZCard({children,style={},hover=true,pattern=false}){
  const [hov,setHov]=useState(false);
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:Z.white,borderRadius:8,border:`1px solid ${hov&&hover?Z.cobaltLight:Z.grayLight}`,transition:"all .3s ease",transform:hover&&hov?"translateY(-5px)":"none",boxShadow:hov&&hover?"0 12px 40px rgba(27,58,107,.15)":"0 2px 8px rgba(0,0,0,.06)",position:"relative",overflow:"hidden",...style}}>
      {pattern&&<div style={{position:"absolute",inset:0,background:"url(#zellige-card)",opacity:.4,pointerEvents:"none"}}/>}
      {children}
    </div>
  );
}

function Stars({rating,size=13}){
  const full=Math.floor(rating),half=rating%1>=.5;
  return(
    <span style={{color:Z.goldLight,fontSize:size,letterSpacing:1}}>
      {"★".repeat(full)}{half?"½":""}<span style={{color:Z.grayLight,fontSize:size}}>{"★".repeat(5-full-(half?1:0))}</span>
    </span>
  );
}

function PrimeBadge(){
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:3,background:`linear-gradient(90deg,${Z.cobalt},${Z.cobaltMid})`,color:Z.white,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:3,letterSpacing:.5,fontFamily:"'Cinzel',serif"}}>
      ⚡ PRIME
    </span>
  );
}

function Toast({msg,type="success",onClose}){
  useEffect(()=>{const t=setTimeout(onClose,3200);return()=>clearTimeout(t);},[]);
  const colors={success:{bg:Z.olive,icon:"✓"},error:{bg:Z.brick,icon:"✕"},info:{bg:Z.cobalt,icon:"ℹ"}};
  const c=colors[type];
  return(
    <div style={{position:"fixed",bottom:28,left:28,zIndex:9999,background:c.bg,color:Z.white,padding:"14px 20px",borderRadius:10,boxShadow:"0 8px 32px rgba(0,0,0,.25)",animation:"slideDown .3s ease",display:"flex",alignItems:"center",gap:12,fontSize:14,fontWeight:600,maxWidth:360}}>
      <span style={{width:26,height:26,background:"rgba(255,255,255,.2)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{c.icon}</span>
      {msg}
      <button onClick={onClose} style={{background:"none",border:"none",color:"rgba(255,255,255,.6)",cursor:"pointer",fontSize:18,marginRight:4}}>×</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION — Amazon-style with Zellige identity
═══════════════════════════════════════════════════════ */
function Nav({page,setPage,cart,user,setUser}){
  const [search,setSearch]=useState("");
  const [searchCat,setSearchCat]=useState("الكل");
  const cartCount=cart.reduce((a,i)=>a+i.qty,0);

  return(
    <header style={{position:"fixed",top:0,width:"100%",zIndex:1000}}>
      {/* Main nav bar */}
      <div style={{background:Z.darkBlue,padding:"0 20px"}}>
        <div style={{maxWidth:1540,margin:"0 auto",height:64,display:"flex",alignItems:"center",gap:16}}>

          {/* Logo */}
          <button onClick={()=>setPage("home")} style={{background:"none",border:"none",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:2,padding:"8px 10px",borderRadius:6,transition:"background .2s"}}
            onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.goldLight}`}
            onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
              <span style={{fontFamily:"'Amiri',serif",fontSize:30,fontWeight:700,color:Z.goldLight,lineHeight:1}}>سوق</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:Z.goldLight,letterSpacing:2,lineHeight:1}}>SOUQ.MA</span>
            </div>
            <div style={{width:3,height:36,background:`repeating-linear-gradient(to bottom, ${Z.cobalt} 0 5px, ${Z.gold} 5px 10px, ${Z.brick} 10px 15px, ${Z.olive} 15px 20px)`,marginRight:4,borderRadius:2}} />
          </button>

          {/* Location */}
          <button style={{background:"none",border:"1px solid transparent",borderRadius:6,cursor:"pointer",color:Z.white,fontSize:12,padding:"8px 8px",transition:"border .2s",flexShrink:0,textAlign:"right"}}
            onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.goldLight}`}
            onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
            <div style={{color:"rgba(255,255,255,.65)",fontSize:11}}>📍 التوصيل إلى</div>
            <div style={{fontWeight:700,fontSize:13}}>المغرب</div>
          </button>

          {/* Search bar — Amazon-style */}
          <div style={{flex:1,display:"flex",height:42,borderRadius:8,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.3)"}}>
            <select value={searchCat} onChange={e=>setSearchCat(e.target.value)}
              style={{background:Z.grayLight,border:"none",padding:"0 12px",fontSize:12,cursor:"pointer",outline:"none",color:Z.ink,borderRadius:"8px 0 0 8px",minWidth:120}}>
              <option>الكل</option>
              {CATEGORIES.map(c=><option key={c.name}>{c.name}</option>)}
            </select>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&setPage("products")}
              placeholder="ابحث في سوق المغرب..."
              style={{flex:1,border:"none",outline:"none",padding:"0 16px",fontSize:15,direction:"rtl",background:Z.white,color:Z.ink}}/>
            <button onClick={()=>setPage("products")}
              style={{background:Z.goldLight,border:"none",padding:"0 18px",cursor:"pointer",fontSize:20,transition:"background .2s"}}
              onMouseEnter={e=>e.currentTarget.style.background=Z.gold}
              onMouseLeave={e=>e.currentTarget.style.background=Z.goldLight}>
              🔍
            </button>
          </div>

          {/* Language */}
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.08)",padding:"4px",borderRadius:6,flexShrink:0}}>
            {["ع","FR","EN"].map((l,i)=>(
              <button key={l} style={{padding:"4px 8px",border:"none",background:i===0?Z.goldLight:"transparent",borderRadius:4,fontSize:11,fontWeight:700,cursor:"pointer",color:i===0?Z.charcoal:"rgba(255,255,255,.7)",transition:"all .2s"}}>
                {l}
              </button>
            ))}
          </div>

          {/* Account */}
          {user?(
            <button onClick={()=>setPage("dashboard")} style={{background:"none",border:"1px solid transparent",borderRadius:6,cursor:"pointer",color:Z.white,padding:"8px 10px",transition:"border .2s",flexShrink:0,textAlign:"right"}}
              onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.goldLight}`}
              onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.65)"}}>أهلاً،</div>
              <div style={{fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:5}}>{user.name} <span style={{fontSize:10}}>▾</span></div>
            </button>
          ):(
            <button onClick={()=>setPage("login")} style={{background:"none",border:"1px solid transparent",borderRadius:6,cursor:"pointer",color:Z.white,padding:"8px 10px",transition:"border .2s",flexShrink:0,textAlign:"right"}}
              onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.goldLight}`}
              onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
              <div style={{fontSize:11,color:"rgba(255,255,255,.65)"}}>أهلاً، سجّل الدخول</div>
              <div style={{fontWeight:700,fontSize:13}}>الحساب والطلبات ▾</div>
            </button>
          )}

          {/* Returns */}
          <button onClick={()=>setPage("dashboard")} style={{background:"none",border:"1px solid transparent",borderRadius:6,cursor:"pointer",color:Z.white,padding:"8px 10px",transition:"border .2s",flexShrink:0,textAlign:"right"}}
            onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.goldLight}`}
            onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.65)"}}>الإرجاع</div>
            <div style={{fontWeight:700,fontSize:13}}>والطلبات</div>
          </button>

          {/* Cart */}
          <button onClick={()=>setPage("cart")} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid transparent",borderRadius:6,cursor:"pointer",color:Z.white,padding:"8px 10px",transition:"border .2s",flexShrink:0,position:"relative"}}
            onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.goldLight}`}
            onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
            <div style={{position:"relative"}}>
              <span style={{fontSize:28}}>🛒</span>
              <span style={{position:"absolute",top:-6,right:-8,background:Z.goldLight,color:Z.charcoal,fontSize:12,fontWeight:800,minWidth:20,height:20,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",animation:cartCount?"bounceIn .3s ease":"none"}}>
                {cartCount}
              </span>
            </div>
            <div style={{fontWeight:700,fontSize:14,paddingTop:8}}>السلة</div>
          </button>
        </div>
      </div>

      {/* Secondary nav — category links */}
      <div style={{background:Z.cobalt,padding:"0 20px"}}>
        <div style={{maxWidth:1540,margin:"0 auto",height:38,display:"flex",alignItems:"center",gap:2,overflowX:"auto"}}>
          <button onClick={()=>setPage("products")} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"1px solid transparent",borderRadius:4,cursor:"pointer",color:Z.white,padding:"5px 10px",fontSize:13,fontWeight:600,whiteSpace:"nowrap",transition:"border .2s"}}
            onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.white}`}
            onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
            ☰ جميع الأقسام
          </button>
          <div style={{width:1,height:20,background:"rgba(255,255,255,.2)",margin:"0 4px"}}/>
          {["تخفيضات اليوم","الأكثر مبيعاً","الوافد الجديد","حرف مغربية","Prime سوق","البائع معنا","خدمة العملاء"].map(l=>(
            <button key={l} onClick={()=>setPage(l.includes("بائع")?"register":l.includes("العملاء")?"cart":"products")}
              style={{background:"none",border:"1px solid transparent",borderRadius:4,cursor:"pointer",color:"rgba(255,255,255,.92)",padding:"5px 10px",fontSize:13,whiteSpace:"nowrap",transition:"border .2s"}}
              onMouseEnter={e=>e.currentTarget.style.border=`1px solid ${Z.white}`}
              onMouseLeave={e=>e.currentTarget.style.border="1px solid transparent"}>
              {l}
            </button>
          ))}
          {user&&(
            <button onClick={()=>setUser(null)} style={{marginRight:"auto",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.6)",fontSize:12}}>خروج</button>
          )}
        </div>
      </div>

      <ZBorder height={4}/>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCT CARD — Amazon-style
═══════════════════════════════════════════════════════ */
function ProductCard({product:p,onAdd,delay=0}){
  const [hov,setHov]=useState(false);
  const [wish,setWish]=useState(false);
  const [added,setAdded]=useState(false);

  const handleAdd=()=>{
    if(!p.stock)return;
    onAdd();setAdded(true);
    setTimeout(()=>setAdded(false),1800);
  };

  const discount=p.oldPrice?Math.round((1-p.price/p.oldPrice)*100):null;

  return(
    <div className="card-shine" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:Z.white,borderRadius:8,border:`1px solid ${hov?Z.cobaltLight:Z.grayLight}`,transition:"all .3s ease",boxShadow:hov?"0 8px 30px rgba(27,58,107,.18)":"0 1px 4px rgba(0,0,0,.07)",display:"flex",flexDirection:"column",animation:`fadeUp .5s ease ${delay}s both`,overflow:"hidden"}}>

      {/* Image area */}
      <div style={{position:"relative",background:Z.ivory,height:220,display:"flex",alignItems:"center",justifyContent:"center",borderBottom:`1px solid ${Z.grayLight}`,overflow:"hidden"}}>
        <div style={{fontSize:80,transition:"transform .3s",transform:hov?"scale(1.08)":"scale(1)"}}>
          {p.emoji}
        </div>
        {/* zellige pattern overlay */}
        <div style={{position:"absolute",inset:0,backgroundImage:"url(#zellige-card)",opacity:.06,pointerEvents:"none"}}/>

        {/* Badges */}
        <div style={{position:"absolute",top:0,right:0,display:"flex",flexDirection:"column",gap:4,padding:10}}>
          {p.badge&&<span style={{background:p.badgeColor||Z.brick,color:Z.white,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:3,display:"inline-block"}}>{p.badge}</span>}
          {discount&&<span style={{background:Z.brick,color:Z.white,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:3}}>-%{discount}</span>}
        </div>

        {/* Wishlist */}
        <button onClick={()=>setWish(!wish)}
          style={{position:"absolute",top:10,left:10,width:34,height:34,background:wish?`${Z.brick}20`:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>
          {wish?"❤️":"🤍"}
        </button>

        {p.prime&&<div style={{position:"absolute",bottom:10,right:10}}><PrimeBadge/></div>}
        {!p.stock&&<div style={{position:"absolute",inset:0,background:"rgba(255,255,255,.75)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:Z.brick}}>نفذت الكمية</div>}
      </div>

      {/* Info */}
      <div style={{padding:"14px 14px 10px",flex:1,display:"flex",flexDirection:"column",gap:6}}>
        {/* Seller */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:11,color:Z.cobaltMid,fontWeight:600,cursor:"pointer"}}>{p.seller}</span>
          <span style={{fontSize:10,background:`${Z.olive}15`,color:Z.olive,padding:"1px 6px",borderRadius:3,fontWeight:600}}>✓ موثق</span>
        </div>

        {/* Name */}
        <div style={{fontSize:14,fontWeight:600,color:Z.ink,lineHeight:1.45,minHeight:40,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
          {p.name}
        </div>

        {/* Rating */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Stars rating={p.rating}/>
          <span style={{fontSize:12,color:Z.cobaltMid,textDecoration:"underline",cursor:"pointer"}}>{p.reviews} تقييم</span>
        </div>

        {/* Price */}
        <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:22,fontWeight:800,color:Z.ink}}>
            {p.price.toLocaleString()}
          </span>
          <span style={{fontSize:13,color:Z.gray}}>د.م</span>
          {p.oldPrice&&<span style={{fontSize:13,color:Z.gray,textDecoration:"line-through"}}>{p.oldPrice.toLocaleString()} د.م</span>}
        </div>

        {/* Delivery */}
        <div style={{fontSize:12,color:Z.olive,fontWeight:500}}>
          {p.cod?"🚚 توصيل مجاني + دفع عند التسليم":"🚚 توصيل خلال 48 ساعة"}
        </div>

        {/* Stock warning */}
        {p.stock<=5&&p.stock>0&&<div style={{fontSize:12,color:Z.brick,fontWeight:600}}>⚠️ بقي {p.stock} فقط في المخزون!</div>}
      </div>

      {/* Add to cart */}
      <div style={{padding:"0 14px 14px"}}>
        <button onClick={handleAdd} disabled={!p.stock}
          style={{width:"100%",padding:"9px",background:added?Z.olive:Z.goldLight,border:"none",borderRadius:20,cursor:p.stock?"pointer":"not-allowed",fontSize:14,fontWeight:700,color:Z.charcoal,transition:"all .25s",boxShadow:added?"0 4px 12px rgba(61,92,46,.4)":"0 2px 8px rgba(200,146,42,.3)",opacity:p.stock?1:.5}}>
          {added?"✓ تمت الإضافة للسلة 🎉":"أضف إلى السلة"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════ */
function HomePage({setPage,addToCart}){
  const [bannerIdx,setBannerIdx]=useState(0);
  const [todayFilter,setTodayFilter]=useState("الكل");

  useEffect(()=>{
    const t=setInterval(()=>setBannerIdx(i=>(i+1)%BANNERS.length),5000);
    return()=>clearInterval(t);
  },[]);

  const banner=BANNERS[bannerIdx];

  // Scroll reveal
  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible");});
    },{threshold:.1});
    document.querySelectorAll(".reveal").forEach(el=>obs.observe(el));
    return()=>obs.disconnect();
  },[]);

  return(
    <div style={{paddingTop:106}}>

      {/* ── HERO BANNER ── */}
      <div style={{position:"relative",overflow:"hidden",height:420,background:banner.bg,transition:"background 1s ease"}}>
        {/* Zellige geometric overlay */}
        <div style={{position:"absolute",inset:0,opacity:.08}}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" fill="none" stroke="white" strokeWidth="1.5"/>
                <polygon points="50,20 80,35 80,65 50,80 20,65 20,35" fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="1"/>
                <circle cx="0" cy="0" r="5" fill="white" opacity=".3"/>
                <circle cx="100" cy="0" r="5" fill="white" opacity=".3"/>
                <circle cx="0" cy="100" r="5" fill="white" opacity=".3"/>
                <circle cx="100" cy="100" r="5" fill="white" opacity=".3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)"/>
          </svg>
        </div>

        <div style={{maxWidth:1540,margin:"0 auto",padding:"0 60px",height:"100%",display:"flex",alignItems:"center",gap:60,position:"relative",zIndex:1}}>
          <div style={{flex:1}}>
            <div style={{fontSize:64,marginBottom:16,animation:"float 4s ease-in-out infinite"}}>{banner.emoji}</div>
            <h1 style={{fontFamily:"'Amiri',serif",fontSize:"clamp(32px,4vw,58px)",color:Z.white,lineHeight:1.2,marginBottom:12,textShadow:"0 2px 12px rgba(0,0,0,.3)"}}>
              {banner.title}
            </h1>
            <p style={{fontSize:18,color:"rgba(255,255,255,.85)",marginBottom:28}}>{banner.sub}</p>
            <Btn variant="primary" size="xl" onClick={()=>setPage("products")} style={{animation:"glow 3s ease-in-out infinite"}}>
              {banner.cta} ←
            </Btn>
          </div>

          {/* Right: Zellige decorative motif */}
          <div style={{flexShrink:0,display:"flex",justifyContent:"center",alignItems:"center"}}>
            <div style={{width:320,height:320,borderRadius:"50%",border:`3px solid rgba(255,255,255,.2)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
              <div style={{width:260,height:260,borderRadius:"50%",border:`3px solid rgba(255,255,255,.15)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="160" height="160" viewBox="0 0 160 160" style={{opacity:.7}}>
                    {/* Zellige 8-star pattern */}
                    <polygon points="80,10 93,52 138,52 102,78 117,122 80,97 43,122 58,78 22,52 67,52" fill="none" stroke="white" strokeWidth="2"/>
                    <polygon points="80,25 90,57 122,57 97,76 107,108 80,89 53,108 63,76 38,57 70,57" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"/>
                    <circle cx="80" cy="80" r="20" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2"/>
                    <circle cx="80" cy="80" r="8" fill="rgba(255,255,255,.2)"/>
                    {[0,45,90,135,180,225,270,315].map(deg=>{
                      const r=Math.PI*deg/180;
                      const x=80+66*Math.cos(r),y=80+66*Math.sin(r);
                      return<circle key={deg} cx={x} cy={y} r="5" fill="rgba(255,255,255,.35)"/>;
                    })}
                  </svg>
                </div>
              </div>
              {/* Rotating outer ring */}
              <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"1px dashed rgba(255,255,255,.2)",animation:"rotate-star 30s linear infinite"}}/>
            </div>
          </div>
        </div>

        {/* Banner dots */}
        <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",display:"flex",gap:8}}>
          {BANNERS.map((_,i)=>(
            <button key={i} onClick={()=>setBannerIdx(i)}
              style={{width:i===bannerIdx?24:8,height:8,borderRadius:4,background:i===bannerIdx?Z.goldLight:"rgba(255,255,255,.4)",border:"none",cursor:"pointer",transition:"all .3s"}}/>
          ))}
        </div>
      </div>

      <ZBorder/>

      {/* ── TICKER ── */}
      <div style={{background:Z.cobalt,overflow:"hidden",padding:"10px 0"}}>
        <div style={{display:"flex",width:"max-content",animation:"ticker 35s linear infinite"}}>
          {[...Array(2)].map((_,gi)=>(
            ["🚚 توصيل مجاني +200 درهم","💵 الدفع عند التسليم في كل المدن","🔄 استرجاع 7 أيام (قانون 31-08)","⚡ توصيل 24-48 ساعة","🛡️ منصة مرخصة وآمنة","🏺 منتجات مغربية أصيلة","📦 +50,000 منتج متاح"].map((t,i)=>(
              <span key={`${gi}-${i}`} style={{padding:"0 32px",fontSize:13,fontWeight:600,color:Z.white,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:20}}>
                {t}<span style={{width:4,height:4,background:`${Z.goldLight}`,borderRadius:"50%",display:"inline-block"}}/>
              </span>
            ))
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT: 3-column Amazon layout ── */}
      <div style={{maxWidth:1540,margin:"0 auto",padding:"20px 20px"}}>

        {/* DEALS OF THE DAY */}
        <section className="reveal" style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <h2 style={{fontFamily:"'Amiri',serif",fontSize:26,color:Z.ink}}>عروض اليوم 🔥</h2>
              <div style={{background:Z.brick,color:Z.white,padding:"4px 12px",borderRadius:4,fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                <span style={{animation:"pulse 1s ease-in-out infinite"}}>⏱</span>
                ينتهي في: 08:42:15
              </div>
            </div>
            <Btn variant="ghost" onClick={()=>setPage("products")}>عرض كل العروض ←</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {PRODUCTS.filter(p=>p.oldPrice).slice(0,4).map((p,i)=>(
              <ProductCard key={p.id} product={p} onAdd={()=>addToCart(p)} delay={i*.07}/>
            ))}
          </div>
        </section>

        {/* CATEGORIES + PROMO CARDS */}
        <section className="reveal" style={{marginBottom:32}}>
          <h2 style={{fontFamily:"'Amiri',serif",fontSize:26,color:Z.ink,marginBottom:14}}>تسوق حسب الفئة</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {/* Category cards */}
            {CATEGORIES.slice(0,4).map((cat,i)=>{
              const [hov,setHov]=useState(false);
              return(
                <div key={cat.name} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
                  onClick={()=>setPage("products")}
                  style={{background:Z.white,border:`1px solid ${hov?cat.accent:Z.grayLight}`,borderRadius:8,padding:"20px 16px",cursor:"pointer",transition:"all .3s",transform:hov?"translateY(-4px)":"none",boxShadow:hov?`0 8px 24px ${cat.accent}30`:"0 1px 4px rgba(0,0,0,.06)",animation:`fadeUp .5s ease ${i*.08}s both`}}>
                  <div style={{fontSize:40,marginBottom:12,display:"block",textAlign:"center",transition:"transform .3s",transform:hov?"scale(1.1)":"scale(1)"}}>{cat.emoji}</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:700,color:Z.ink,marginBottom:4}}>{cat.name}</div>
                    <div style={{fontSize:12,color:Z.gray}}>+{cat.count.toLocaleString()} منتج</div>
                    <div style={{marginTop:10,fontSize:12,fontWeight:600,color:cat.accent}}>تسوق الآن ←</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginTop:16}}>
            {CATEGORIES.slice(4).map((cat,i)=>{
              const [hov,setHov]=useState(false);
              return(
                <div key={cat.name} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
                  onClick={()=>setPage("products")}
                  style={{background:Z.white,border:`1px solid ${hov?cat.accent:Z.grayLight}`,borderRadius:8,padding:"20px 16px",cursor:"pointer",transition:"all .3s",transform:hov?"translateY(-4px)":"none",boxShadow:hov?`0 8px 24px ${cat.accent}30`:"0 1px 4px rgba(0,0,0,.06)"}}>
                  <div style={{fontSize:40,marginBottom:12,display:"block",textAlign:"center"}}>{cat.emoji}</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:700,color:Z.ink,marginBottom:4}}>{cat.name}</div>
                    <div style={{fontSize:12,color:Z.gray}}>+{cat.count.toLocaleString()} منتج</div>
                    <div style={{marginTop:10,fontSize:12,fontWeight:600,color:cat.accent}}>تسوق الآن ←</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BESTSELLERS */}
        <section className="reveal" style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <h2 style={{fontFamily:"'Amiri',serif",fontSize:26,color:Z.ink}}>الأكثر مبيعاً ⭐</h2>
            <Btn variant="ghost" onClick={()=>setPage("products")}>عرض الكل ←</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {PRODUCTS.sort((a,b)=>b.reviews-a.reviews).slice(0,4).map((p,i)=>(
              <ProductCard key={p.id} product={p} onAdd={()=>addToCart(p)} delay={i*.07}/>
            ))}
          </div>
        </section>

        {/* ZELLIGE PROMO BANNER */}
        <section className="reveal" style={{marginBottom:32,borderRadius:12,overflow:"hidden",position:"relative"}}>
          <div style={{background:`linear-gradient(135deg, ${Z.darkBlue} 0%, ${Z.cobalt} 50%, ${Z.cobaltMid} 100%)`,padding:"40px 60px",display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:40}}>
            {/* Zellige pattern overlay */}
            <div style={{position:"absolute",inset:0,opacity:.07}}>
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="banner-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                    <polygon points="30,3 57,18 57,42 30,57 3,42 3,18" fill="none" stroke="white" strokeWidth="1"/>
                    <polygon points="30,12 48,22 48,38 30,48 12,38 12,22" fill="none" stroke="white" strokeWidth=".7"/>
                    <circle cx="30" cy="30" r="5" fill="none" stroke="white" strokeWidth=".8"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#banner-pattern)"/>
              </svg>
            </div>
            <div style={{position:"relative",zIndex:1}}>
              <div style={{display:"inline-block",background:Z.goldLight,color:Z.charcoal,fontSize:12,fontWeight:800,padding:"4px 14px",borderRadius:3,marginBottom:14,fontFamily:"'Cinzel',serif",letterSpacing:1}}>PRIME MAROC</div>
              <h2 style={{fontFamily:"'Amiri',serif",fontSize:"clamp(24px,3vw,42px)",color:Z.white,lineHeight:1.25,marginBottom:10}}>
                اشترك في <span style={{color:Z.goldLight}}>Prime سوق</span><br/>وتمتع بتوصيل مجاني غير محدود
              </h2>
              <p style={{fontSize:16,color:"rgba(255,255,255,.75)",marginBottom:24}}>
                توصيل سريع 24 ساعة • أولوية في العروض • إرجاع مجاني
              </p>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <Btn variant="primary" size="lg">ابدأ مجاناً 30 يوماً</Btn>
                <Btn variant="white" size="lg">تعرف أكثر</Btn>
              </div>
            </div>
            <div style={{position:"relative",zIndex:1,textAlign:"center"}}>
              <div style={{fontSize:80,animation:"float 5s ease-in-out infinite"}}>⚡</div>
              <div style={{color:Z.goldLight,fontFamily:"'Amiri',serif",fontSize:32,marginTop:-10}}>49 د.م/شهر</div>
            </div>
          </div>
        </section>

        {/* MOROCCAN HERITAGE SECTION */}
        <section className="reveal" style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <h2 style={{fontFamily:"'Amiri',serif",fontSize:26,color:Z.ink}}>الحرف والتراث المغربي 🏺</h2>
              <ZStar size={20}/>
            </div>
            <Btn variant="ghost" onClick={()=>setPage("products")}>كل المنتجات ←</Btn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {PRODUCTS.filter(p=>["أزياء","منزل"].includes(p.cat)).slice(0,4).map((p,i)=>(
              <ProductCard key={p.id} product={p} onAdd={()=>addToCart(p)} delay={i*.07}/>
            ))}
          </div>
        </section>

        {/* TRUST BADGES */}
        <section className="reveal" style={{marginBottom:32}}>
          <div style={{background:Z.white,borderRadius:10,border:`1px solid ${Z.grayLight}`,padding:"28px 32px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
              {[
                {icon:"🔒",title:"دفع آمن 100%",desc:"تشفير SSL + 3D Secure + CMI"},
                {icon:"🔄",title:"إرجاع مجاني",desc:"خلال 7 أيام (قانون 31-08)"},
                {icon:"🚚",title:"توصيل لكل المغرب",desc:"24-48 ساعة • دفع عند التسليم"},
                {icon:"🏅",title:"ضمان الجودة",desc:"منتجات مفحوصة ومعتمدة KYC"},
              ].map(t=>(
                <div key={t.title} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:46,height:46,background:Z.cobaltPale,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.icon}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:Z.ink,marginBottom:3}}>{t.title}</div>
                    <div style={{fontSize:12,color:Z.gray,lineHeight:1.5}}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <ZBorder/>
      <footer style={{background:Z.darkBlue}}>
        <div style={{maxWidth:1540,margin:"0 auto",padding:"40px 20px 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr",gap:40,marginBottom:40}}>
            <div>
              <div style={{fontFamily:"'Amiri',serif",fontSize:36,color:Z.goldLight,marginBottom:8}}>سوق.ما</div>
              <p style={{fontSize:13,color:"rgba(255,255,255,.45)",lineHeight:1.8,marginBottom:16,maxWidth:280}}>
                منصة التجارة الإلكترونية المغربية الأولى. مبنية على Cloudflare Workers و GitHub Actions.
              </p>
              <div style={{display:"flex",gap:8,marginBottom:16}}>
                {["📘","📸","🐦","💼","▶️"].map(s=>(
                  <div key={s} style={{width:36,height:36,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>{s}</div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["☁️ Cloudflare","🐙 GitHub","🔒 SSL","📜 CNDP"].map(b=>(
                  <span key={b} style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.1)",borderRadius:4,padding:"3px 10px",fontSize:11,color:"rgba(255,255,255,.5)",fontWeight:600}}>{b}</span>
                ))}
              </div>
            </div>
            {[
              ["الشركة",["عنّا","وظائف","أخبار","المسؤولية","الاستدامة"]],
              ["خدمة العملاء",["مساعدة","طلباتي","الإرجاع","تتبع الشحنة","اتصل بنا"]],
              ["للبائعين",["سجّل","لوحة التحكم","البائع الرئيسي","الفوترة CGI","KYC"]],
              ["قانوني",["الخصوصية","الشروط","كوكيز","CNDP","قانون 09-08"]],
            ].map(([title,links])=>(
              <div key={title}>
                <div style={{fontSize:13,fontWeight:800,color:Z.white,marginBottom:14,textTransform:"uppercase",letterSpacing:.8}}>{title}</div>
                {links.map(l=>(
                  <div key={l} style={{fontSize:13,color:"rgba(255,255,255,.45)",marginBottom:8,cursor:"pointer",transition:"color .2s"}}
                    onMouseEnter={e=>e.target.style.color=Z.goldLight}
                    onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.45)"}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Payment methods bar */}
          <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:20,marginBottom:20,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>طرق الدفع:</span>
            {[["💵","COD"],["💳","CMI"],["🍎","Apple Pay"],["🤖","Google Pay"],["🅿","PayPal"],["🏦","تحويل"]].map(([icon,label])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:5,padding:"5px 12px",fontSize:12,color:"rgba(255,255,255,.55)"}}>
                <span style={{fontSize:16}}>{icon}</span>{label}
              </div>
            ))}
          </div>

          <div style={{borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.3)"}}>© 2026 سوق.ما — جميع الحقوق محفوظة | Powered by Cloudflare Workers + GitHub Actions</div>
            <div style={{display:"flex",gap:20}}>
              {["سياسة الخصوصية","الشروط","كوكيز","خريطة الموقع"].map(l=>(
                <span key={l} style={{fontSize:12,color:"rgba(255,255,255,.3)",cursor:"pointer"}}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PRODUCTS PAGE — with sidebar filters (Amazon-style)
═══════════════════════════════════════════════════════ */
function ProductsPage({addToCart}){
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("الكل");
  const [sort,setSort]=useState("featured");
  const [maxPrice,setMaxPrice]=useState(10000);
  const [codOnly,setCodOnly]=useState(false);
  const [primeOnly,setPrimeOnly]=useState(false);
  const [minRating,setMinRating]=useState(0);

  const filtered=PRODUCTS
    .filter(p=>category==="الكل"||p.cat===category)
    .filter(p=>p.name.includes(search)||p.seller.includes(search)||p.tags?.some(t=>t.includes(search)))
    .filter(p=>p.price<=maxPrice)
    .filter(p=>!codOnly||p.cod)
    .filter(p=>!primeOnly||p.prime)
    .filter(p=>p.rating>=minRating)
    .sort((a,b)=>sort==="price-asc"?a.price-b.price:sort==="price-desc"?b.price-a.price:sort==="rating"?b.rating-a.rating:sort==="reviews"?b.reviews-a.reviews:0);

  return(
    <div style={{paddingTop:106,minHeight:"100vh",background:Z.ivory}}>
      {/* breadcrumb */}
      <div style={{background:Z.white,borderBottom:`1px solid ${Z.grayLight}`,padding:"10px 20px"}}>
        <div style={{maxWidth:1540,margin:"0 auto",fontSize:13,color:Z.gray,display:"flex",alignItems:"center",gap:8}}>
          <span style={{cursor:"pointer",color:Z.cobaltMid}}>الرئيسية</span>
          <span>›</span>
          <span>المنتجات</span>
          {category!=="الكل"&&<><span>›</span><span style={{color:Z.ink}}>{category}</span></>}
          <span style={{marginRight:"auto",fontWeight:600,color:Z.ink}}>{filtered.length} نتيجة</span>
        </div>
      </div>

      <div style={{maxWidth:1540,margin:"0 auto",padding:"20px",display:"grid",gridTemplateColumns:"240px 1fr",gap:20}}>

        {/* SIDEBAR */}
        <aside style={{position:"sticky",top:116,height:"fit-content"}}>
          <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:20,marginBottom:16}}>

            <div style={{fontSize:15,fontWeight:800,color:Z.ink,marginBottom:16,paddingBottom:10,borderBottom:`2px solid ${Z.grayLight}`}}>
              ⚙️ تصفية النتائج
            </div>

            {/* Category */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:Z.ink,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>القسم</div>
              {["الكل",...new Set(PRODUCTS.map(p=>p.cat))].map(cat=>(
                <div key={cat} onClick={()=>setCategory(cat)}
                  style={{padding:"8px 10px",cursor:"pointer",borderRadius:5,background:category===cat?`${Z.cobalt}12`:"transparent",color:category===cat?Z.cobalt:Z.gray,fontSize:14,fontWeight:category===cat?700:400,marginBottom:3,display:"flex",justifyContent:"space-between",transition:"all .15s"}}>
                  <span>{cat}</span>
                  <span style={{fontSize:12,color:Z.gray}}>{cat==="الكل"?PRODUCTS.length:PRODUCTS.filter(p=>p.cat===cat).length}</span>
                </div>
              ))}
            </div>

            {/* Price */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:Z.ink,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>
                السعر: <span style={{color:Z.cobalt,fontFamily:"'IBM Plex Mono'"}}>{maxPrice.toLocaleString()} د.م</span>
              </div>
              <input type="range" min={100} max={10000} step={50} value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)}
                style={{width:"100%",accentColor:Z.cobalt,cursor:"pointer"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:Z.gray,marginTop:4}}>
                <span>100 د.م</span><span>10,000 د.م</span>
              </div>
              {/* Price quick filters */}
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                {[["أقل من 200",200],["200-500",500],["500-1000",1000],["أكثر من 1000",10000]].map(([label,val])=>(
                  <button key={label} onClick={()=>setMaxPrice(val)}
                    style={{padding:"4px 9px",fontSize:11,border:`1px solid ${maxPrice===val?Z.cobalt:Z.grayLight}`,borderRadius:4,background:maxPrice===val?`${Z.cobalt}12`:Z.white,color:maxPrice===val?Z.cobalt:Z.gray,cursor:"pointer",fontFamily:"'Tajawal',sans-serif"}}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:Z.ink,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>التقييم</div>
              {[4,3,2,0].map(r=>(
                <label key={r} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:6}}>
                  <input type="radio" name="rating" checked={minRating===r} onChange={()=>setMinRating(r)} style={{accentColor:Z.cobalt}}/>
                  <Stars rating={r||5} size={12}/>
                  <span style={{fontSize:12,color:Z.gray}}>{r===0?"الكل":`${r}+ نجوم`}</span>
                </label>
              ))}
            </div>

            {/* Toggles */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:13,fontWeight:700,color:Z.ink,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>خيارات</div>
              {[[codOnly,setCodOnly,"💵 الدفع عند التسليم"],[primeOnly,setPrimeOnly,"⚡ Prime فقط"]].map(([val,set,label])=>(
                <label key={label} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginBottom:10}}>
                  <div onClick={()=>set(!val)} style={{width:38,height:20,background:val?Z.cobalt:Z.grayLight,borderRadius:10,position:"relative",transition:"background .2s",cursor:"pointer",flexShrink:0}}>
                    <div style={{width:16,height:16,background:Z.white,borderRadius:"50%",position:"absolute",top:2,right:val?2:20,transition:"right .2s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
                  </div>
                  <span style={{fontSize:13,color:Z.ink}}>{label}</span>
                </label>
              ))}
            </div>

            <button onClick={()=>{setCategory("الكل");setCodOnly(false);setPrimeOnly(false);setMaxPrice(10000);setMinRating(0);}}
              style={{width:"100%",padding:"9px",background:`${Z.brick}12`,color:Z.brick,border:`1px solid ${Z.brick}30`,borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"'Tajawal',sans-serif"}}>
              🔄 إعادة ضبط الفلاتر
            </button>
          </div>
        </aside>

        {/* PRODUCTS */}
        <div>
          {/* Sort bar */}
          <div style={{background:Z.ivoryDark,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
            <span style={{fontSize:14,color:Z.gray}}>
              <strong style={{color:Z.ink}}>{filtered.length}</strong> نتيجة {category!=="الكل"&&`في "${category}"`}
            </span>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:13,color:Z.gray}}>ترتيب حسب:</span>
              <div style={{display:"flex",gap:6}}>
                {[["featured","مميز"],["price-asc","السعر ↑"],["price-desc","السعر ↓"],["rating","الأعلى تقييماً"],["reviews","الأكثر تقييماً"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setSort(v)}
                    style={{padding:"6px 12px",border:`1px solid ${sort===v?Z.cobalt:Z.grayLight}`,borderRadius:5,background:sort===v?Z.cobalt:Z.white,color:sort===v?Z.white:Z.gray,fontSize:12,cursor:"pointer",fontFamily:"'Tajawal',sans-serif",fontWeight:sort===v?700:400}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"80px 0",background:Z.white,borderRadius:8,border:`1px solid ${Z.grayLight}`}}>
              <div style={{fontSize:60,marginBottom:16}}>🔍</div>
              <h3 style={{fontSize:22,color:Z.ink,marginBottom:8}}>لا توجد نتائج</h3>
              <p style={{color:Z.gray}}>جرب تعديل الفلاتر أو كلمات البحث</p>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {filtered.map((p,i)=>(
                <ProductCard key={p.id} product={p} onAdd={()=>addToCart(p)} delay={i*.04}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CART + CHECKOUT
═══════════════════════════════════════════════════════ */
function CartPage({cart,setCart,setPage,setToast}){
  const [step,setStep]=useState(1);
  const [pay,setPay]=useState("cod");
  const [form,setForm]=useState({name:"",phone:"",city:"",addr:"",email:"",notes:""});
  const [ordered,setOrdered]=useState(false);

  const total=cart.reduce((a,i)=>a+i.price*i.qty,0);
  const shipping=total>=200?0:30;
  const codFee=pay==="cod"?0:0;
  const grand=total+shipping+codFee;
  const discount=cart.reduce((a,i)=>a+(i.oldPrice?i.oldPrice-i.price:0)*i.qty,0);

  const removeItem=id=>setCart(c=>c.filter(i=>i.id!==id));
  const updateQty=(id,qty)=>{if(qty<1)return removeItem(id);setCart(c=>c.map(i=>i.id===id?{...i,qty}:i));};

  const placeOrder=()=>{
    if(!form.name||!form.phone||!form.city||!form.addr){
      setToast({msg:"يرجى ملء جميع الحقول المطلوبة ✱",type:"error"});return;
    }
    setOrdered(true);setCart([]);
  };

  if(ordered) return(
    <div style={{paddingTop:106,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:Z.ivory}}>
      <div style={{textAlign:"center",maxWidth:500,padding:"60px 40px",background:Z.white,borderRadius:12,border:`1px solid ${Z.grayLight}`,boxShadow:"0 8px 40px rgba(0,0,0,.1)",animation:"fadeUp .6s ease"}}>
        <div style={{width:80,height:80,background:`${Z.olive}15`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:40,animation:"bounceIn .7s ease"}}>✓</div>
        <h2 style={{fontFamily:"'Amiri',serif",fontSize:38,color:Z.ink,marginBottom:10}}>تم تأكيد طلبك! 🎉</h2>
        <div style={{fontFamily:"'IBM Plex Mono'",fontSize:18,color:Z.cobalt,fontWeight:600,marginBottom:8}}>
          #MRK-{Date.now().toString().slice(-7)}
        </div>
        <p style={{color:Z.gray,fontSize:15,lineHeight:1.7,marginBottom:20}}>
          {pay==="cod"?"سيتواصل معك المورد لتأكيد التسليم والدفع عند الاستلام":"تم إرسال تأكيد الدفع لبريدك الإلكتروني"}
        </p>
        <div style={{background:`${Z.olive}10`,border:`1px solid ${Z.olive}25`,borderRadius:8,padding:16,marginBottom:24,textAlign:"right"}}>
          <div style={{fontSize:14,fontWeight:700,color:Z.olive,marginBottom:6}}>📦 معلومات الطلب</div>
          <div style={{fontSize:13,color:Z.gray,lineHeight:1.8}}>
            الاسم: {form.name}<br/>
            الهاتف: {form.phone}<br/>
            التوصيل إلى: {form.city}<br/>
            طريقة الدفع: {pay==="cod"?"💵 دفع عند التسليم":pay==="card"?"💳 بطاقة بنكية":"أخرى"}
          </div>
        </div>
        <Btn variant="cobalt" size="lg" onClick={()=>setPage("home")}>← العودة للرئيسية</Btn>
      </div>
    </div>
  );

  return(
    <div style={{paddingTop:106,minHeight:"100vh",background:Z.ivory}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"20px"}}>
        {/* Steps */}
        <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:"16px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}>
          {[["1","مراجعة السلة"],["2","التوصيل والدفع"],["3","التأكيد"]].map(([n,l],i)=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:8}}>
              {i>0&&<div style={{width:40,height:2,background:step>i?Z.cobalt:Z.grayLight}}/>}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:30,height:30,borderRadius:"50%",background:step>i?Z.olive:step===i+1?Z.cobalt:Z.grayLight,color:step>=i+1?Z.white:Z.gray,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,transition:"all .3s"}}>{step>i?"✓":n}</div>
                <span style={{fontSize:14,fontWeight:step===i+1?700:400,color:step===i+1?Z.cobalt:Z.gray}}>{l}</span>
              </div>
            </div>
          ))}
        </div>

        {cart.length===0&&step===1?(
          <div style={{textAlign:"center",padding:"80px 0",background:Z.white,borderRadius:8,border:`1px solid ${Z.grayLight}`}}>
            <div style={{fontSize:64,marginBottom:16}}>🛒</div>
            <h3 style={{fontFamily:"'Amiri',serif",fontSize:28,marginBottom:8}}>السلة فارغة</h3>
            <p style={{color:Z.gray,marginBottom:24}}>ابدأ التسوق واكتشف آلاف المنتجات</p>
            <Btn variant="cobalt" size="lg" onClick={()=>setPage("products")}>← تسوق الآن</Btn>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:20,alignItems:"start"}}>
            <div>
              {step===1?(
                <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,overflow:"hidden"}}>
                  <div style={{padding:"18px 20px",borderBottom:`1px solid ${Z.grayLight}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <h2 style={{fontFamily:"'Amiri',serif",fontSize:24}}>سلة التسوق ({cart.reduce((a,i)=>a+i.qty,0)} منتج)</h2>
                    {discount>0&&<div style={{fontSize:13,color:Z.olive,fontWeight:600}}>🎉 وفّرت {discount.toLocaleString()} د.م</div>}
                  </div>
                  {cart.map((item,idx)=>(
                    <div key={item.id} style={{display:"flex",gap:16,padding:"20px",borderBottom:idx<cart.length-1?`1px solid ${Z.grayLight}`:"none",alignItems:"flex-start"}}>
                      <div style={{width:110,height:110,background:Z.ivory,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,flexShrink:0,border:`1px solid ${Z.grayLight}`}}>{item.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:16,fontWeight:600,color:Z.ink,marginBottom:4}}>{item.name}</div>
                        <div style={{fontSize:13,color:Z.cobaltMid,marginBottom:4}}>{item.seller} · {item.sellerCity}</div>
                        {item.cod&&<div style={{fontSize:12,color:Z.olive,marginBottom:6}}>✓ الدفع عند التسليم</div>}
                        {item.prime&&<PrimeBadge/>}
                        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10}}>
                          <div style={{display:"flex",alignItems:"center",border:`1px solid ${Z.grayLight}`,borderRadius:5,overflow:"hidden"}}>
                            <button onClick={()=>updateQty(item.id,item.qty-1)} style={{width:32,height:32,border:"none",background:Z.ivory,cursor:"pointer",fontSize:18,fontFamily:"'Tajawal'"}}>−</button>
                            <span style={{width:40,textAlign:"center",fontSize:14,fontWeight:700,borderRight:`1px solid ${Z.grayLight}`,borderLeft:`1px solid ${Z.grayLight}`,height:32,lineHeight:"32px"}}>{item.qty}</span>
                            <button onClick={()=>updateQty(item.id,item.qty+1)} style={{width:32,height:32,border:"none",background:Z.ivory,cursor:"pointer",fontSize:18,fontFamily:"'Tajawal'"}}>+</button>
                          </div>
                          <button onClick={()=>removeItem(item.id)} style={{fontSize:13,color:Z.brick,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'Tajawal'"}}>حذف</button>
                          <button style={{fontSize:13,color:Z.cobaltMid,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'Tajawal'"}}>حفظ للاحقاً</button>
                        </div>
                      </div>
                      <div style={{textAlign:"left",flexShrink:0}}>
                        <div style={{fontSize:22,fontWeight:800,color:Z.ink}}>{(item.price*item.qty).toLocaleString()}</div>
                        <div style={{fontSize:12,color:Z.gray}}>د.م</div>
                        {item.oldPrice&&<div style={{fontSize:12,color:Z.gray,textDecoration:"line-through"}}>{(item.oldPrice*item.qty).toLocaleString()} د.م</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ):(
                <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:24}}>
                  <h2 style={{fontFamily:"'Amiri',serif",fontSize:24,marginBottom:20}}>معلومات التوصيل</h2>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                    {[["الاسم الكامل *","name","👤","محمد الحسيني"],["رقم الهاتف *","phone","📱","06XXXXXXXX"],["البريد الإلكتروني","email","✉️","email@example.com"]].map(([label,key,icon,ph])=>(
                      <div key={key} style={{display:"flex",flexDirection:"column",gap:5}}>
                        <label style={{fontSize:13,fontWeight:600,color:Z.ink}}>{label}</label>
                        <div style={{position:"relative"}}>
                          <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:16}}>{icon}</span>
                          <input value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                            style={{width:"100%",padding:"11px 40px 11px 12px",border:`1.5px solid ${Z.grayLight}`,borderRadius:6,fontSize:14,outline:"none",direction:"rtl",fontFamily:"'Tajawal'"}}
                            onFocus={e=>e.target.style.borderColor=Z.cobalt}
                            onBlur={e=>e.target.style.borderColor=Z.grayLight}/>
                        </div>
                      </div>
                    ))}
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      <label style={{fontSize:13,fontWeight:600,color:Z.ink}}>المدينة *</label>
                      <select value={form.city} onChange={e=>setForm({...form,city:e.target.value})}
                        style={{padding:"11px 12px",border:`1.5px solid ${Z.grayLight}`,borderRadius:6,fontSize:14,outline:"none",direction:"rtl",fontFamily:"'Tajawal'",background:Z.white}}>
                        <option value="">اختر المدينة...</option>
                        {["الدار البيضاء","الرباط","مراكش","فاس","طنجة","أكادير","وجدة","مكناس","القنيطرة","سلا"].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:20}}>
                    <label style={{fontSize:13,fontWeight:600,color:Z.ink}}>العنوان التفصيلي *</label>
                    <textarea value={form.addr} onChange={e=>setForm({...form,addr:e.target.value})} placeholder="الشارع، الحي، رقم المبنى، الطابق..." rows={3}
                      style={{padding:"11px 14px",border:`1.5px solid ${Z.grayLight}`,borderRadius:6,fontSize:14,outline:"none",direction:"rtl",resize:"none",fontFamily:"'Tajawal'"}}
                      onFocus={e=>e.target.style.borderColor=Z.cobalt}
                      onBlur={e=>e.target.style.borderColor=Z.grayLight}/>
                  </div>

                  {/* Payment */}
                  <h3 style={{fontSize:17,fontWeight:700,marginBottom:14,color:Z.ink}}>طريقة الدفع</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {[
                      ["cod","💵","الدفع عند التسليم","ادفع عند استلام طلبك — آمن ومضمون",true],
                      ["card","💳","بطاقة بنكية","CMI • Visa • Mastercard مع 3D Secure",false],
                      ["apple","🍎","Apple Pay","دفع بلمسة واحدة",false],
                      ["paypal","🅿️","PayPal","للدفع المحلي والدولي",false],
                    ].map(([id,icon,label,desc,recommended])=>(
                      <label key={id} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",border:`2px solid ${pay===id?Z.cobalt:Z.grayLight}`,borderRadius:8,cursor:"pointer",background:pay===id?`${Z.cobalt}06`:Z.white,transition:"all .2s"}}>
                        <input type="radio" name="pay" value={id} checked={pay===id} onChange={()=>setPay(id)} style={{accentColor:Z.cobalt,width:18,height:18}}/>
                        <span style={{fontSize:22}}>{icon}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:Z.ink,display:"flex",alignItems:"center",gap:8}}>
                            {label}
                            {recommended&&<span style={{background:`${Z.olive}15`,color:Z.olive,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:3}}>الأكثر استخداماً</span>}
                          </div>
                          <div style={{fontSize:12,color:Z.gray,marginTop:2}}>{desc}</div>
                        </div>
                        {pay===id&&<span style={{color:Z.cobalt,fontSize:20}}>✓</span>}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ORDER BOX */}
            <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,overflow:"hidden",position:"sticky",top:116}}>
              <ZBorder height={4}/>
              <div style={{padding:20}}>
                <h3 style={{fontFamily:"'Amiri',serif",fontSize:20,marginBottom:16}}>ملخص الطلب</h3>

                <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:14}}>
                  {cart.map(i=>(
                    <div key={i.id} style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                      <span style={{color:Z.gray}}>{i.emoji} {i.name.slice(0,18)}... ×{i.qty}</span>
                      <span style={{fontWeight:600}}>{(i.price*i.qty).toLocaleString()} د.م</span>
                    </div>
                  ))}
                </div>

                <div style={{borderTop:`1px dashed ${Z.grayLight}`,paddingTop:12,marginBottom:12}}>
                  {[[`المجموع (${cart.reduce((a,i)=>a+i.qty,0)} منتج)`,`${total.toLocaleString()} د.م`,Z.ink],
                    ["التوصيل",shipping===0?"مجاني 🎉":`${shipping} د.م`,Z.olive],
                    discount>0?["توفير",`- ${discount.toLocaleString()} د.م`,Z.brick]:null
                  ].filter(Boolean).map(([label,val,color])=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",fontSize:14,marginBottom:8}}>
                      <span style={{color:Z.gray}}>{label}</span>
                      <span style={{color,fontWeight:600}}>{val}</span>
                    </div>
                  ))}
                </div>

                <div style={{display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:800,color:Z.ink,borderTop:`2px solid ${Z.grayLight}`,paddingTop:14,marginBottom:16}}>
                  <span>الإجمالي</span>
                  <div style={{textAlign:"left"}}>
                    <div style={{color:Z.ink}}>{grand.toLocaleString()}</div>
                    <div style={{fontSize:12,color:Z.gray,fontWeight:400}}>درهم مغربي</div>
                  </div>
                </div>

                {shipping>0&&(
                  <div style={{background:`${Z.goldLight}15`,border:`1px solid ${Z.goldLight}40`,borderRadius:6,padding:"10px 12px",marginBottom:14,fontSize:12,color:Z.gold,fontWeight:600}}>
                    💡 أضف {(200-total).toLocaleString()} د.م للحصول على توصيل مجاني!
                  </div>
                )}

                {step===1?(
                  <Btn variant="primary" size="lg" full onClick={()=>setStep(2)}>
                    متابعة → التوصيل والدفع
                  </Btn>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <Btn variant="cobalt" size="lg" full onClick={placeOrder}>
                      {pay==="cod"?"✅ تأكيد الطلب":"💳 إتمام الدفع الآن"}
                    </Btn>
                    <Btn variant="ghost" size="md" full onClick={()=>setStep(1)}>← رجوع للسلة</Btn>
                  </div>
                )}

                <div style={{textAlign:"center",marginTop:14,fontSize:11,color:Z.gray,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  🔒 دفع آمن ومشفر | SSL | CMI | CNDP
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH PAGE — Zellige split layout
═══════════════════════════════════════════════════════ */
function AuthPage({mode,setPage,setUser}){
  const [tab,setTab]=useState(mode);
  const [form,setForm]=useState({name:"",email:"",phone:"",pass:"",type:"buyer"});
  const [loading,setLoading]=useState(false);

  const submit=()=>{
    setLoading(true);
    setTimeout(()=>{
      setUser({name:form.name||form.email.split("@")[0],email:form.email,type:form.type});
      setPage(form.type==="seller"?"dashboard":"home");
    },1600);
  };

  return(
    <div style={{paddingTop:106,minHeight:"100vh",display:"grid",gridTemplateColumns:"1fr 1fr"}}>
      {/* LEFT: Zellige Panel */}
      <div style={{background:`linear-gradient(160deg, ${Z.darkBlue} 0%, ${Z.cobalt} 60%, ${Z.cobaltMid} 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:60,position:"relative",overflow:"hidden"}}>
        {/* Animated zellige background */}
        <div style={{position:"absolute",inset:0,opacity:.1}}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-zellige" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="transparent"/>
                <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="white" strokeWidth="1.5"/>
                <polygon points="40,16 64,28 64,52 40,64 16,52 16,28" fill="none" stroke="white" strokeWidth="1"/>
                <polygon points="40,28 52,34 52,46 40,52 28,46 28,34" fill="none" stroke="white" strokeWidth=".8"/>
                <circle cx="40" cy="40" r="4" fill="rgba(255,255,255,.3)"/>
                <circle cx="0" cy="0" r="3" fill="rgba(255,255,255,.2)"/>
                <circle cx="80" cy="80" r="3" fill="rgba(255,255,255,.2)"/>
                <circle cx="80" cy="0" r="3" fill="rgba(255,255,255,.2)"/>
                <circle cx="0" cy="80" r="3" fill="rgba(255,255,255,.2)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-zellige)"/>
          </svg>
        </div>

        {/* Decorative circles */}
        <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",border:`2px solid ${Z.goldLight}20`}}/>
        <div style={{position:"absolute",bottom:-60,left:-60,width:240,height:240,borderRadius:"50%",border:`2px solid ${Z.brick}15`}}/>

        <div style={{position:"relative",zIndex:1,textAlign:"center",maxWidth:400}}>
          <div style={{fontFamily:"'Amiri',serif",fontSize:72,color:Z.goldLight,lineHeight:1,marginBottom:4,textShadow:"0 4px 20px rgba(0,0,0,.4)"}}>سوق.ما</div>

          {/* Zellige star decoration */}
          <div style={{margin:"20px auto",width:80,height:80,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="80" height="80" viewBox="0 0 80 80">
              <polygon points="40,5 48,28 72,28 53,43 60,67 40,52 20,67 27,43 8,28 32,28" fill={Z.goldLight} opacity=".8"/>
              <polygon points="40,15 46,32 64,32 50,42 55,59 40,49 25,59 30,42 16,32 34,32" fill={Z.white} opacity=".3"/>
            </svg>
          </div>

          <h2 style={{fontFamily:"'Amiri',serif",fontSize:28,color:Z.white,marginBottom:12,lineHeight:1.3}}>
            السوق المغربي الأول
          </h2>
          <p style={{fontSize:15,color:"rgba(255,255,255,.65)",lineHeight:1.9,marginBottom:36}}>
            انضم لأكثر من 200,000 مشترٍ و3,000+ بائع على أكبر منصة تجارة إلكترونية في المغرب
          </p>

          {/* Trust points */}
          <div style={{display:"flex",flexDirection:"column",gap:14,textAlign:"right"}}>
            {[["⚖️","متوافق مع قانون 31-08 وحقوق المستهلك"],["🔒","حماية البيانات وفق CNDP وقانون 09-08"],["💵","دفع عند التسليم في جميع المدن المغربية"],["🧾","فواتير قانونية متوافقة مع CGI"]].map(([icon,text])=>(
              <div key={text} style={{display:"flex",alignItems:"center",gap:12,color:"rgba(255,255,255,.82)",fontSize:14}}>
                <span style={{width:34,height:34,background:"rgba(255,255,255,.1)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:60,background:Z.cream}}>
        <div style={{width:"100%",maxWidth:440,animation:"fadeUp .5s ease"}}>
          {/* Tab switcher */}
          <div style={{display:"flex",background:Z.grayLight,borderRadius:8,padding:4,marginBottom:28}}>
            {[["login","تسجيل الدخول"],["register","إنشاء حساب"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{flex:1,padding:"11px",border:"none",borderRadius:6,background:tab===t?Z.white:"transparent",color:tab===t?Z.ink:Z.gray,fontSize:15,fontWeight:tab===t?800:500,cursor:"pointer",transition:"all .2s",boxShadow:tab===t?"0 2px 8px rgba(0,0,0,.08)":"none",fontFamily:"'Tajawal'"}}>
                {l}
              </button>
            ))}
          </div>

          <h2 style={{fontFamily:"'Amiri',serif",fontSize:32,color:Z.ink,marginBottom:4}}>
            {tab==="login"?"مرحباً بعودتك 👋":"أنشئ حسابك 🚀"}
          </h2>
          <p style={{fontSize:14,color:Z.gray,marginBottom:24}}>
            {tab==="login"?"ادخل بياناتك للوصول لحسابك":"سجّل مجاناً وابدأ التسوق في دقيقة"}
          </p>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {tab==="register"&&(
              <>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:13,fontWeight:700,color:Z.ink}}>الاسم الكامل</label>
                  <div style={{position:"relative"}}>
                    <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:17}}>👤</span>
                    <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="محمد أمين..."
                      style={{width:"100%",padding:"12px 42px 12px 12px",border:`1.5px solid ${Z.grayLight}`,borderRadius:7,fontSize:14,outline:"none",direction:"rtl",fontFamily:"'Tajawal'"}}
                      onFocus={e=>e.target.style.borderColor=Z.cobalt} onBlur={e=>e.target.style.borderColor=Z.grayLight}/>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  <label style={{fontSize:13,fontWeight:700,color:Z.ink}}>نوع الحساب</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    {[["buyer","🛍️","مشتري","تسوق من آلاف المنتجات"],["seller","🏪","بائع","بع منتجاتك للمغرب"]].map(([t,icon,label,desc])=>(
                      <button key={t} onClick={()=>setForm({...form,type:t})}
                        style={{padding:"12px 10px",border:`2px solid ${form.type===t?Z.cobalt:Z.grayLight}`,borderRadius:8,background:form.type===t?`${Z.cobalt}08`:Z.white,cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                        <div style={{fontSize:26,marginBottom:4}}>{icon}</div>
                        <div style={{fontSize:13,fontWeight:700,color:form.type===t?Z.cobalt:Z.ink}}>{label}</div>
                        <div style={{fontSize:11,color:Z.gray,marginTop:2}}>{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {[
              ["البريد الإلكتروني","email","email","✉️","email@example.com"],
              ...(tab==="register"?[["رقم الهاتف","phone","tel","📱","06XXXXXXXX"]]:[]),
              ["كلمة المرور","pass","password","🔒","••••••••"],
            ].map(([label,key,type,icon,ph])=>(
              <div key={key} style={{display:"flex",flexDirection:"column",gap:5}}>
                <label style={{fontSize:13,fontWeight:700,color:Z.ink}}>{label}</label>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",fontSize:17}}>{icon}</span>
                  <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={ph}
                    style={{width:"100%",padding:"12px 42px 12px 12px",border:`1.5px solid ${Z.grayLight}`,borderRadius:7,fontSize:14,outline:"none",direction:"rtl",fontFamily:"'Tajawal'"}}
                    onFocus={e=>e.target.style.borderColor=Z.cobalt} onBlur={e=>e.target.style.borderColor=Z.grayLight}/>
                </div>
              </div>
            ))}
          </div>

          {tab==="login"&&(
            <div style={{textAlign:"left",marginTop:6,marginBottom:2}}>
              <span style={{color:Z.cobaltMid,fontSize:13,cursor:"pointer",fontWeight:500}}>نسيت كلمة المرور؟</span>
            </div>
          )}

          <button onClick={submit} disabled={loading}
            style={{width:"100%",marginTop:22,padding:"14px",background:loading?Z.gray:`linear-gradient(90deg, ${Z.cobalt}, ${Z.cobaltMid})`,color:Z.white,border:"none",borderRadius:7,fontSize:16,fontWeight:700,cursor:loading?"not-allowed":"pointer",fontFamily:"'Tajawal'",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all .2s",boxShadow:loading?"none":"0 4px 16px rgba(27,58,107,.4)"}}>
            {loading?<><span style={{width:20,height:20,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 1s linear infinite",display:"inline-block"}}/>جاري التحميل...</>:tab==="login"?"دخول →":"إنشاء الحساب 🎉"}
          </button>

          <div style={{textAlign:"center",marginTop:18,fontSize:14,color:Z.gray}}>
            {tab==="login"?<>ليس لديك حساب؟ <span onClick={()=>setTab("register")} style={{color:Z.cobalt,fontWeight:700,cursor:"pointer"}}>سجّل الآن</span></>
              :<>لديك حساب؟ <span onClick={()=>setTab("login")} style={{color:Z.cobalt,fontWeight:700,cursor:"pointer"}}>ادخل هنا</span></>}
          </div>

          {/* Alt login */}
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${Z.grayLight}`}}>
            <div style={{fontSize:12,color:Z.gray,textAlign:"center",marginBottom:12}}>أو ادخل بواسطة</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["🇲🇦","CIH / Attijariwafa"],["📱","WhatsApp OTP"]].map(([icon,label])=>(
                <button key={label} style={{padding:"10px",border:`1px solid ${Z.grayLight}`,borderRadius:7,background:Z.white,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:13,fontFamily:"'Tajawal'",color:Z.ink}}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DASHBOARD — Seller Dashboard Amazon Seller Central style
═══════════════════════════════════════════════════════ */
function DashboardPage({user}){
  const [tab,setTab]=useState("overview");

  const recentOrders=[
    {id:"ORD-8821",product:"أحذية نايكي إير",buyer:"أحمد الزاهر",city:"الدار البيضاء",total:580,status:"delivered",pay:"cod",date:"اليوم"},
    {id:"ORD-8820",product:"سامسونج A55",buyer:"فاطمة المودني",city:"الرباط",total:3499,status:"shipping",pay:"card",date:"أمس"},
    {id:"ORD-8819",product:"جلباب مغربي",buyer:"يوسف بنعلي",city:"مراكش",total:450,status:"pending",pay:"cod",date:"أمس"},
    {id:"ORD-8818",product:"مجموعة أرغان",buyer:"سلمى الإدريسي",city:"فاس",total:220,status:"cancelled",pay:"cod",date:"28 مايو"},
    {id:"ORD-8817",product:"تاجين فخاري",buyer:"مريم بنسعيد",city:"طنجة",total:185,status:"delivered",pay:"cod",date:"27 مايو"},
  ];
  const statusStyle={delivered:["✓","تم التسليم",Z.olive],shipping:["🚚","في الطريق",Z.gold],pending:["⏳","قيد التأكيد",Z.cobalt],cancelled:["✕","ملغى","#999"]};

  const navItems=[
    ["overview","📊","لوحة التحكم"],
    ["orders","📦","الطلبات",127],
    ["inventory","🏷️","المنتجات"],
    ["analytics","📈","التحليلات"],
    ["wallet","💰","المحفظة"],
    ["invoices","🧾","الفواتير CGI"],
    ["disputes","⚠️","النزاعات",2],
    ["kyc","🛡️","KYC والامتثال"],
    ["settings","⚙️","الإعدادات"],
  ];

  return(
    <div style={{paddingTop:106,minHeight:"100vh",background:Z.ivory,display:"grid",gridTemplateColumns:"220px 1fr"}}>
      {/* SIDEBAR */}
      <aside style={{background:Z.darkBlue,minHeight:"calc(100vh - 106px)",position:"sticky",top:106,height:"calc(100vh - 106px)",overflowY:"auto"}}>
        <ZBorder height={4}/>
        <div style={{padding:"20px 0"}}>
          {/* Profile */}
          <div style={{padding:"0 16px 18px",borderBottom:"1px solid rgba(255,255,255,.08)",marginBottom:8}}>
            <div style={{width:50,height:50,background:`linear-gradient(135deg,${Z.brick},${Z.brickDark})`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:Z.white,fontSize:20,fontWeight:800,marginBottom:10}}>
              {user?.name?.[0]||"م"}
            </div>
            <div style={{fontSize:14,fontWeight:700,color:Z.white}}>{user?.name||"محمد أمين"}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:8}}>بائع موثق ✓</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(61,92,46,.3)",borderRadius:4,padding:"3px 8px"}}>
              <span style={{width:6,height:6,background:Z.olive,borderRadius:"50%",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,color:"#6BCB77",fontWeight:600}}>نشط</span>
            </div>
          </div>

          {navItems.map(([id,icon,label,badge])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 16px",border:"none",background:tab===id?`${Z.goldLight}15`:"transparent",color:tab===id?Z.goldLight:"rgba(255,255,255,.55)",cursor:"pointer",fontSize:13,fontWeight:tab===id?700:400,borderRight:tab===id?`3px solid ${Z.goldLight}`:"3px solid transparent",transition:"all .2s",textAlign:"right"}}>
              <span style={{fontSize:17}}>{icon}</span>
              <span style={{flex:1}}>{label}</span>
              {badge&&<span style={{background:Z.brick,color:Z.white,fontSize:10,fontWeight:700,padding:"2px 6px",borderRadius:3}}>{badge}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{padding:24,overflowY:"auto"}}>
        {/* Top bar */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:"14px 20px"}}>
          <div>
            <h1 style={{fontFamily:"'Amiri',serif",fontSize:26,color:Z.ink}}>
              {{"overview":"لوحة التحكم","orders":"الطلبات","inventory":"المنتجات","analytics":"التحليلات","wallet":"المحفظة","invoices":"الفواتير","disputes":"النزاعات","kyc":"KYC والامتثال","settings":"الإعدادات"}[tab]}
            </h1>
            <div style={{fontSize:12,color:Z.gray}}>الجمعة 6 مارس 2026 · آخر تحديث: منذ دقيقتين</div>
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="outline" size="sm">📥 تصدير CSV</Btn>
            <Btn variant="cobalt" size="sm">+ منتج جديد</Btn>
          </div>
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20}}>
          {[
            {label:"المبيعات هذا الشهر",val:"48,250",unit:"د.م",icon:"💰",color:Z.olive,bg:`${Z.olive}12`,trend:"+12.4%",up:true},
            {label:"الطلبات",val:"127",unit:"طلب",icon:"📦",color:Z.brick,bg:`${Z.brick}12`,trend:"+8.1%",up:true},
            {label:"المنتجات النشطة",val:"34",unit:"منتج",icon:"🏷️",color:Z.cobalt,bg:`${Z.cobalt}12`,trend:"+3",up:true},
            {label:"متوسط التقييم",val:"4.8",unit:"/ 5.0",icon:"⭐",color:Z.gold,bg:`${Z.gold}12`,trend:"ممتاز",up:true},
          ].map((s,i)=>(
            <div key={s.label} style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:18,animation:`fadeUp .5s ease ${i*.07}s both`,transition:"all .25s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
              onMouseLeave={e=>e.currentTarget.style.transform="none"}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{width:44,height:44,background:s.bg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.icon}</div>
                <span style={{fontSize:11,fontWeight:700,color:s.color,background:s.bg,padding:"3px 8px",borderRadius:3}}>{s.up?"↑":""} {s.trend}</span>
              </div>
              <div style={{fontFamily:"'IBM Plex Mono'",fontSize:26,fontWeight:700,color:Z.ink,marginBottom:2}}>{s.val} <span style={{fontSize:12,color:Z.gray,fontFamily:"'Tajawal'"}}>{s.unit}</span></div>
              <div style={{fontSize:12,color:Z.gray}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
          {/* Bar chart */}
          <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{fontSize:16,fontWeight:700,color:Z.ink}}>📈 المبيعات اليومية — مايو 2026</h3>
              <span style={{fontSize:12,color:Z.gray,background:Z.grayLight,padding:"3px 10px",borderRadius:4}}>درهم مغربي</span>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:5,height:120,paddingBottom:8}}>
              {[45,70,55,90,75,110,85,95,60,88,100,115,65,72,95,88,108,90,78,65,105,88,75,92,96,108,85,90,78,88].map((h,i)=>(
                <div key={i} style={{flex:1,background:`linear-gradient(to top,${Z.cobalt},${Z.cobaltLight})`,borderRadius:"3px 3px 0 0",height:`${h}%`,minWidth:5,transition:"all .3s",cursor:"pointer",opacity:.85}}
                  onMouseEnter={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.background=`linear-gradient(to top,${Z.gold},${Z.goldLight})`;}}
                  onMouseLeave={e=>{e.currentTarget.style.opacity=".85";e.currentTarget.style.background=`linear-gradient(to top,${Z.cobalt},${Z.cobaltLight})`;}}/>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:Z.gray}}>
              <span>1 مايو</span><span>10</span><span>20</span><span>31 مايو</span>
            </div>
          </div>

          {/* Donut-style breakdown */}
          <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:20}}>
            <h3 style={{fontSize:16,fontWeight:700,color:Z.ink,marginBottom:16}}>🥧 المبيعات حسب الفئة</h3>
            {[["أزياء",42,Z.brick],["إلكترونيات",31,Z.cobalt],["جمال",18,Z.olive],["منزل",9,Z.gold]].map(([label,pct,color])=>(
              <div key={label} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:13,color:Z.ink}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:700,color}}>{pct}%</span>
                </div>
                <div style={{height:8,background:Z.grayLight,borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:4,transition:"width 1.2s ease"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,overflow:"hidden",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:`1px solid ${Z.grayLight}`}}>
            <h3 style={{fontSize:16,fontWeight:700,color:Z.ink}}>📦 آخر الطلبات</h3>
            <Btn variant="ghost" size="sm">عرض الكل ←</Btn>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:Z.ivoryDark}}>
                  {["رقم الطلب","المنتج","المشتري","المدينة","المبلغ","الدفع","الحالة","التاريخ","إجراء"].map(h=>(
                    <th key={h} style={{padding:"10px 16px",textAlign:"right",fontSize:11,fontWeight:800,color:Z.gray,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o,i)=>{
                  const [sIcon,sLabel,sColor]=statusStyle[o.status];
                  return(
                    <tr key={o.id} style={{borderBottom:`1px solid ${Z.grayLight}`,transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=Z.ivory}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"13px 16px",fontSize:12,fontWeight:700,color:Z.cobalt,fontFamily:"'IBM Plex Mono'"}}>{o.id}</td>
                      <td style={{padding:"13px 16px",fontSize:13,color:Z.ink}}>{o.product}</td>
                      <td style={{padding:"13px 16px",fontSize:13,color:Z.ink}}>{o.buyer}</td>
                      <td style={{padding:"13px 16px",fontSize:12,color:Z.gray}}>📍 {o.city}</td>
                      <td style={{padding:"13px 16px",fontSize:15,fontWeight:800,color:Z.ink}}>{o.total.toLocaleString()} <span style={{fontSize:11,color:Z.gray}}>د.م</span></td>
                      <td style={{padding:"13px 16px",fontSize:12}}>{o.pay==="cod"?"💵 COD":"💳 بطاقة"}</td>
                      <td style={{padding:"13px 16px"}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${sColor}15`,color:sColor,padding:"4px 10px",borderRadius:4,fontSize:11,fontWeight:700}}>
                          {sIcon} {sLabel}
                        </span>
                      </td>
                      <td style={{padding:"13px 16px",fontSize:12,color:Z.gray}}>{o.date}</td>
                      <td style={{padding:"13px 16px"}}>
                        <button style={{padding:"4px 10px",border:`1px solid ${Z.grayLight}`,borderRadius:4,background:Z.white,fontSize:11,cursor:"pointer",color:Z.cobalt,fontFamily:"'Tajawal'"}}>تفاصيل</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          {[
            {icon:"🧾",title:"الفواتير — CGI",desc:"آخر فاتورة: FAC-2026-127 • سلسلة متصلة ✓",color:Z.olive,cta:"عرض الفواتير"},
            {icon:"🛡️",title:"KYC والامتثال",desc:"الحساب موثق ✓ • آخر تحديث CNDP: مارس 2026",color:Z.cobalt,cta:"تحديث الوثائق"},
            {icon:"⚠️",title:"النزاعات المفتوحة",desc:"2 نزاع قيد المعالجة • SLA: 48 ساعة",color:Z.brick,cta:"معالجة النزاعات"},
          ].map(c=>(
            <div key={c.title} style={{background:Z.white,border:`1px solid ${Z.grayLight}`,borderRadius:8,padding:18,borderTop:`3px solid ${c.color}`}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:26}}>{c.icon}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:Z.ink,marginBottom:4}}>{c.title}</div>
                  <div style={{fontSize:12,color:Z.gray,lineHeight:1.6}}>{c.desc}</div>
                </div>
              </div>
              <button style={{padding:"7px 14px",background:`${c.color}12`,color:c.color,border:`1px solid ${c.color}30`,borderRadius:6,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"'Tajawal'"}}>
                {c.cta} →
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════ */
export default function ShowcasePage(){
  const [page,setPage]=useState("home");
  const [cart,setCart]=useState([]);
  const [user,setUser]=useState(null);
  const [toast,setToast]=useState(null);

  const addToCart=useCallback(product=>{
    setCart(prev=>{
      const ex=prev.find(i=>i.id===product.id);
      if(ex)return prev.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i);
      return[...prev,{...product,qty:1}];
    });
    setToast({msg:`✓ تمت إضافة "${product.name.slice(0,22)}..." للسلة`,type:"success"});
  },[]);

  const nav=p=>{setPage(p);window.scrollTo({top:0,behavior:"smooth"});};

  return(
    <>
      <GlobalStyle/>
      <ZelligeSVGPattern/>
      <Nav page={page} setPage={nav} cart={cart} user={user} setUser={setUser}/>
      <div className="page-enter" key={page}>
        {page==="home"&&<HomePage setPage={nav} addToCart={addToCart}/>}
        {page==="products"&&<ProductsPage addToCart={addToCart}/>}
        {page==="cart"&&<CartPage cart={cart} setCart={setCart} setPage={nav} setToast={setToast}/>}
        {page==="login"&&<AuthPage mode="login" setPage={nav} setUser={setUser}/>}
        {page==="register"&&<AuthPage mode="register" setPage={nav} setUser={setUser}/>}
        {page==="dashboard"&&<DashboardPage user={user}/>}
      </div>
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </>
  );
}
