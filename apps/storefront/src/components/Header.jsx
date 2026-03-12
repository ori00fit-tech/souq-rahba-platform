import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL } from "../lib/config";

const T = {
  navy:"#16356b",
  blue:"#1d4ed8",
  teal:"#0f766e",
  gold:"#b08d3c",
  sand:"#f5f1e8",
  border:"#ddd5c2",
  white:"#ffffff",
  shadow:"rgba(22,53,107,0.10)"
};

const navIcons={
  "/":"🏠",
  "/products":"🛍️",
  "/sellers":"🏪",
  "/my-orders":"📦",
  "/auth":"👤",
  "/help":"💬"
};

const navLabels={
  "/":"الرئيسية",
  "/products":"المنتجات",
  "/sellers":"الباعة",
  "/my-orders":"طلباتي",
  "/auth":"الحساب",
  "/help":"المساعدة"
};

export default function Header(){
  const {cart,query,setQuery}=useApp();
  const [menuOpen,setMenuOpen]=useState(false);
  const [searchFocused,setSearchFocused]=useState(false);

  return(
<>
<header style={s.header}>
<div style={s.colorBar}/>

<div style={s.inner}>

<div style={s.row}>

<button onClick={()=>setMenuOpen(true)} style={s.iconBtn}>
<HamburgerIcon/>
</button>

<Link to="/" style={s.logo}>
<img src="/brand/logo-icon.png" alt="RAHBA" style={s.logoImg}/>
<div style={s.logoText}>
<span style={s.logoName}>RAHBA</span>
<span style={s.logoSub}>Marketplace</span>
</div>
</Link>

<NavLink to="/cart" style={s.cartBtn}>
<span>🛒</span>
<span style={s.cartLabel}>السلة</span>
{cart.length>0&&<span style={s.cartBadge}>{cart.length}</span>}
</NavLink>

</div>

<div style={{...s.searchWrap,...(searchFocused?s.searchWrapFocus:{})}}>
<SearchIcon color={searchFocused?T.navy:"#9e9080"}/>
<input
value={query}
onChange={e=>setQuery(e.target.value)}
onFocus={()=>setSearchFocused(true)}
onBlur={()=>setSearchFocused(false)}
placeholder="ابحث عن منتجات..."
style={s.searchInput}
/>
</div>

</div>
</header>

{menuOpen&&(
<>
<div onClick={()=>setMenuOpen(false)} style={s.overlay}/>

<aside style={s.drawer}>

<div style={s.drawerHeader}>
<div style={{display:"flex",alignItems:"center",gap:"10px"}}>
<img src="/brand/logo-icon.png" style={s.drawerLogo}/>
<div>
<div style={{fontWeight:900}}>RAHBA</div>
<div style={{fontSize:"11px",opacity:0.8}}>Marketplace</div>
</div>
</div>

<button onClick={()=>setMenuOpen(false)} style={s.closeBtn}>✕</button>
</div>

<nav style={s.drawerNav}>
{Object.entries(navLabels).map(([path,label])=>(
<NavLink
key={path}
to={path}
onClick={()=>setMenuOpen(false)}
style={s.drawerLink}
>
<span style={s.drawerIcon}>{navIcons[path]}</span>
<span>{label}</span>
</NavLink>
))}

<a
href={SELLER_PORTAL_URL}
target="_blank"
rel="noopener noreferrer"
style={s.sellerLink}
>
🏷️ لوحة البائع ↗
</a>

</nav>

<div style={s.drawerFooter}>
<NavLink to="/cart" onClick={()=>setMenuOpen(false)} style={s.drawerCartBtn}>
🛒 السلة
<span style={s.drawerCartBadge}>{cart.length}</span>
</NavLink>
</div>

</aside>
</>
)}

</>
);
}

function HamburgerIcon(){
return(
<svg width="20" height="16" viewBox="0 0 20 16">
<rect width="20" height="2.5" rx="1.25" fill="#16356b"/>
<rect y="6.75" width="14" height="2.5" rx="1.25" fill="#16356b"/>
<rect y="13.5" width="20" height="2.5" rx="1.25" fill="#16356b"/>
</svg>
);
}

function SearchIcon({color}){
return(
<svg width="18" height="18" viewBox="0 0 18 18">
<circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeWidth="1.8"/>
<path d="M12 12L16 16" stroke={color} strokeWidth="1.8"/>
</svg>
);
}

const s={

header:{
position:"sticky",
top:0,
zIndex:60,
background:T.sand,
borderBottom:`1px solid ${T.border}`,
boxShadow:`0 2px 16px ${T.shadow}`
},

colorBar:{
height:"4px",
background:`linear-gradient(90deg,#16356b,#1d4ed8,#0ea5e9,#0f766e,#16a34a)`
},

inner:{
maxWidth:"1200px",
margin:"0 auto",
padding:"12px 16px",
display:"grid",
gap:"12px"
},

row:{
display:"grid",
gridTemplateColumns:"48px 1fr auto",
alignItems:"center",
gap:"12px"
},

iconBtn:{
width:"48px",
height:"48px",
borderRadius:"14px",
border:`1.5px solid ${T.border}`,
background:T.white,
display:"grid",
placeItems:"center",
cursor:"pointer"
},

logo:{
display:"flex",
alignItems:"center",
gap:"10px",
textDecoration:"none",
justifySelf:"center"
},

logoImg:{
width:"40px",
height:"40px"
},

logoText:{
display:"grid",
lineHeight:1
},

logoName:{
fontSize:"22px",
fontWeight:900,
color:T.navy
},

logoSub:{
fontSize:"11px",
color:T.teal
},

cartBtn:{
display:"flex",
alignItems:"center",
gap:"6px",
padding:"10px 14px",
borderRadius:"14px",
border:`1.5px solid ${T.border}`,
background:T.white,
textDecoration:"none",
color:T.navy,
fontWeight:800
},

cartLabel:{
fontSize:"13px"
},

cartBadge:{
background:T.navy,
color:"#fff",
borderRadius:"999px",
padding:"2px 6px",
fontSize:"11px"
},

searchWrap:{
display:"flex",
alignItems:"center",
gap:"10px",
padding:"0 14px",
height:"48px",
borderRadius:"24px",
border:`1.5px solid ${T.border}`,
background:"#fff"
},

searchWrapFocus:{
borderColor:T.blue
},

searchInput:{
flex:1,
border:"none",
outline:"none",
background:"transparent"
},

overlay:{
position:"fixed",
inset:0,
background:"rgba(0,0,0,0.4)",
zIndex:70
},

drawer:{
position:"fixed",
top:0,
right:0,
bottom:0,
width:"78%",
maxWidth:"300px",
background:T.sand,
zIndex:80,
display:"grid",
gridTemplateRows:"auto 1fr auto"
},

drawerHeader:{
padding:"16px",
background:`linear-gradient(135deg,#16356b,#1d4ed8)`,
color:"#fff",
display:"flex",
justifyContent:"space-between"
},

drawerLogo:{
width:"36px",
height:"36px"
},

closeBtn:{
background:"none",
border:"none",
color:"#fff",
fontSize:"18px",
cursor:"pointer"
},

drawerNav:{
padding:"16px",
display:"grid",
gap:"6px"
},

drawerLink:{
textDecoration:"none",
display:"flex",
gap:"12px",
padding:"13px 14px",
borderRadius:"12px",
background:"#fff",
border:`1px solid ${T.border}`,
color:T.navy
},

drawerIcon:{
width:"24px"
},

sellerLink:{
marginTop:"6px",
textDecoration:"none",
padding:"13px",
borderRadius:"12px",
background:"#edf4ff",
border:"1px solid #bdd4f8",
color:T.blue
},

drawerFooter:{
padding:"14px"
},

drawerCartBtn:{
display:"flex",
alignItems:"center",
gap:"10px",
padding:"14px",
borderRadius:"14px",
background:T.navy,
color:"#fff",
textDecoration:"none",
fontWeight:800
},

drawerCartBadge:{
marginLeft:"auto",
background:"#fff",
color:T.navy",
borderRadius:"999px",
padding:"2px 6px",
fontSize:"12px"
}

};
