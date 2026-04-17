import { useState, useEffect } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLATFORMS = {
  gpay:     { name: "Google Pay", color: "#1a73e8", bg: "#e8f0fe", emoji: "🔵" },
  phonepe:  { name: "PhonePe",    color: "#5f259f", bg: "#f3e8ff", emoji: "🟣" },
  paytm:    { name: "Paytm",      color: "#002970", bg: "#e0e7ff", emoji: "🔷" },
  amazon:   { name: "Amazon",     color: "#c45500", bg: "#fff7e6", emoji: "🟠" },
  flipkart: { name: "Flipkart",   color: "#2874F0", bg: "#eff6ff", emoji: "💙" },
  swiggy:   { name: "Swiggy",     color: "#FC8019", bg: "#fff4ee", emoji: "🧡" },
  zomato:   { name: "Zomato",     color: "#CB202D", bg: "#fef2f2", emoji: "❤️" },
  myntra:   { name: "Myntra",     color: "#FF3F6C", bg: "#fff0f4", emoji: "🌸" },
  physical: { name: "Physical",   color: "#059669", bg: "#ecfdf5", emoji: "🎟️" },
  other:    { name: "Other",      color: "#6B7280", bg: "#f9fafb", emoji: "✨" },
};
const CATEGORIES = ["All","Food","Shopping","Travel","Entertainment","Fuel","Health","Electronics","Fashion","Other"];

const SEED = [
  { id:"s1", title:"₹50 off on Swiggy", description:"Get ₹50 off on your next Swiggy order. Min order ₹199.", platform:"swiggy", category:"Food", discountText:"₹50 OFF", originalValue:50, price:10, code:"SWIG50OFF", expiryDate: daysFromNow(7), status:"active", createdBy:"Ravi Kumar", createdByUPI:"ravi@gpay", createdAt:new Date().toISOString(), claimedBy:null, claimedAt:null, minOrder:"₹199", maxDiscount:"", terms:"Valid once per user." },
  { id:"s2", title:"GPay ₹30 Cashback", description:"Unused GPay scratch card worth ₹30 cashback on any UPI payment.", platform:"gpay", category:"Other", discountText:"₹30 CASHBACK", originalValue:30, price:0, code:"GPAY30CB", expiryDate: daysFromNow(3), status:"active", createdBy:"Priya S", createdByUPI:"", createdAt:new Date().toISOString(), claimedBy:null, claimedAt:null, minOrder:"", maxDiscount:"", terms:"One-time use only." },
  { id:"s3", title:"Amazon 15% off Electronics", description:"15% off on electronics. Max discount ₹500.", platform:"amazon", category:"Electronics", discountText:"15% OFF", originalValue:500, price:49, code:"AMZ15ELEC", expiryDate: daysFromNow(14), status:"active", createdBy:"Karthik M", createdByUPI:"karthik@phonepe", createdAt:new Date().toISOString(), claimedBy:null, claimedAt:null, minOrder:"₹1000", maxDiscount:"₹500", terms:"Valid on select products." },
  { id:"s4", title:"Flipkart Fashion ₹200 off", description:"₹200 off on fashion orders above ₹999.", platform:"flipkart", category:"Fashion", discountText:"₹200 OFF", originalValue:200, price:25, code:"FKFASH200", expiryDate: daysFromNow(5), status:"active", createdBy:"Sneha R", createdByUPI:"sneha@paytm", createdAt:new Date().toISOString(), claimedBy:null, claimedAt:null, minOrder:"₹999", maxDiscount:"", terms:"Not valid with other coupons." },
  { id:"s5", title:"Zomato ₹100 off", description:"₹100 off on restaurant orders. Min ₹299.", platform:"zomato", category:"Food", discountText:"₹100 OFF", originalValue:100, price:0, code:"ZOM100FREE", expiryDate: daysFromNow(2), status:"active", createdBy:"Arjun P", createdByUPI:"", createdAt:new Date().toISOString(), claimedBy:null, claimedAt:null, minOrder:"₹299", maxDiscount:"", terms:"Valid once per account." },
];

function daysFromNow(d) {
  const dt = new Date(); dt.setDate(dt.getDate()+d);
  return dt.toISOString().split("T")[0];
}
function uid() { return "c_"+Date.now()+"_"+Math.random().toString(36).slice(2,6); }
function daysLeft(exp) { return Math.ceil((new Date(exp)-new Date())/(864e5)); }
function expired(exp) { return daysLeft(exp)<0; }

// ─── Storage ──────────────────────────────────────────────────────────────────
async function dbGet(k,shared=false){try{const r=await window.storage.get(k,shared);return r?JSON.parse(r.value):null;}catch{return null;}}
async function dbSet(k,v,shared=false){try{await window.storage.set(k,JSON.stringify(v),shared);}catch{}}

// ─── Reusable Styles ──────────────────────────────────────────────────────────
const inp = {width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #e5e7eb",fontSize:14,outline:"none",fontFamily:"DM Sans,sans-serif",boxSizing:"border-box"};
const lbl = {fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:6};
const btn = (bg,c="#fff") => ({background:bg,color:c,border:"none",borderRadius:12,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Sora,sans-serif"});

// ─── PlatformBadge ────────────────────────────────────────────────────────────
function PlatformBadge({p,sm=true}){
  const pl=PLATFORMS[p]||PLATFORMS.other;
  return <span style={{background:pl.bg,color:pl.color,border:`1px solid ${pl.color}22`,padding:sm?"2px 8px":"4px 12px",borderRadius:20,fontSize:sm?11:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>{pl.emoji} {pl.name}</span>;
}

// ─── CouponCard ───────────────────────────────────────────────────────────────
function CouponCard({c,onClick}){
  const dl=daysLeft(c.expiryDate), exp=expired(c.expiryDate);
  const off=exp||c.status!=="active";
  const [hov,setHov]=useState(false);
  return(
    <div onClick={()=>!off&&onClick(c)} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{background:off?"#f5f5f5":"#fff",border:`1px solid ${off?"#e0e0e0":"#ffe0d0"}`,borderRadius:16,overflow:"hidden",cursor:off?"default":"pointer",opacity:off?.7:1,transform:hov&&!off?"translateY(-3px)":"none",boxShadow:hov&&!off?"0 10px 28px rgba(255,107,53,.15)":"0 1px 4px rgba(0,0,0,.05)",transition:"all .2s"}}>
      {/* Top gradient */}
      <div style={{background:off?"#d1d5db":"linear-gradient(135deg,#FF6B35,#ff9a5c)",padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{color:"#fff",fontSize:22,fontWeight:800,fontFamily:"Sora,sans-serif",letterSpacing:-.5}}>{c.discountText}</div>
          <div style={{color:"rgba(255,255,255,.8)",fontSize:11,marginTop:2}}>{c.minOrder?`Min ${c.minOrder}`:"No minimum"}</div>
        </div>
        <div style={{background:c.price===0?"#10B981":"#1A1A2E",color:"#fff",padding:"6px 12px",borderRadius:20,fontSize:13,fontWeight:700}}>
          {c.price===0?"FREE":`₹${c.price}`}
        </div>
      </div>
      {/* Body */}
      <div style={{padding:"12px 16px"}}>
        <div style={{fontWeight:600,fontSize:14,color:"#1A1A2E",marginBottom:4,lineHeight:1.3}}>{c.title}</div>
        <div style={{fontSize:12,color:"#6B7280",marginBottom:10,lineHeight:1.4}}>{c.description.length>65?c.description.slice(0,65)+"…":c.description}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <PlatformBadge p={c.platform}/>
          <span style={{fontSize:11,fontWeight:600,color:exp?"#ef4444":dl<=3?"#f59e0b":"#9CA3AF"}}>
            {c.status==="claimed"?"✓ Claimed":c.status==="purchased"?"✓ Sold":exp?"✗ Expired":dl===0?"Expires today!":dl===1?"1 day left":`${dl}d left`}
          </span>
        </div>
      </div>
      <div style={{borderTop:"2px dashed #f0f0f0",margin:"0 16px"}}/>
      <div style={{padding:"8px 16px",display:"flex",justifyContent:"space-between"}}>
        <span style={{fontSize:11,color:"#9CA3AF"}}>by {c.createdBy}</span>
        <span style={{fontSize:11,color:"#9CA3AF"}}>🏷️ {c.category}</span>
      </div>
    </div>
  );
}

// ─── CouponModal ──────────────────────────────────────────────────────────────
function CouponModal({coupon:init,onClose,onClaim,user,onLogin}){
  const [coupon,setCoupon]=useState(init);
  const [step,setStep]=useState("detail");
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(false);
  const dl=daysLeft(coupon.expiryDate), exp=expired(coupon.expiryDate);
  const isOwner=user&&user.displayName===coupon.createdBy;
  const alreadyMine=user&&coupon.claimedBy===user.displayName;

  const copy=(txt)=>{navigator.clipboard?.writeText(txt);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  const doClaim=async(paid)=>{setBusy(true);const u=await onClaim(coupon,paid);setCoupon(u);setStep("revealed");setBusy(false);};

  return(
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:16,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:460,maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.18)",fontFamily:"DM Sans,sans-serif"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#FF6B35,#ff9a5c)",padding:"22px 24px 18px",borderRadius:"20px 20px 0 0",position:"relative"}}>
          <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"rgba(255,255,255,.2)",border:"none",borderRadius:20,color:"#fff",width:30,height:30,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          <div style={{fontSize:30,fontWeight:800,color:"#fff",fontFamily:"Sora,sans-serif",letterSpacing:-1}}>{coupon.discountText}</div>
          <div style={{color:"rgba(255,255,255,.9)",fontSize:13,marginTop:3}}>{coupon.title}</div>
        </div>

        <div style={{padding:24}}>
          {step==="detail"&&<>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
              <PlatformBadge p={coupon.platform} sm={false}/>
              <span style={{background:"#f3f4f6",color:"#4B5563",padding:"4px 12px",borderRadius:20,fontSize:13,fontWeight:500}}>🏷️ {coupon.category}</span>
            </div>

            <p style={{color:"#374151",fontSize:14,lineHeight:1.65,marginBottom:16}}>{coupon.description}</p>

            <div style={{background:"#fafafa",borderRadius:12,padding:16,marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {coupon.minOrder&&<div><div style={{fontSize:11,color:"#9CA3AF",marginBottom:2}}>Min. Order</div><div style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>{coupon.minOrder}</div></div>}
              {coupon.maxDiscount&&<div><div style={{fontSize:11,color:"#9CA3AF",marginBottom:2}}>Max Discount</div><div style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>{coupon.maxDiscount}</div></div>}
              <div><div style={{fontSize:11,color:"#9CA3AF",marginBottom:2}}>Expires</div><div style={{fontSize:14,fontWeight:600,color:exp?"#ef4444":dl<=3?"#f59e0b":"#1A1A2E"}}>{exp?"Expired":dl===0?"Today!":dl===1?"Tomorrow":`${dl} days`}</div></div>
              <div><div style={{fontSize:11,color:"#9CA3AF",marginBottom:2}}>Coupon Value</div><div style={{fontSize:14,fontWeight:600,color:"#1A1A2E"}}>₹{coupon.originalValue||"—"}</div></div>
            </div>

            {coupon.terms&&<div style={{fontSize:12,color:"#9CA3AF",padding:"8px 12px",background:"#fef9f7",borderRadius:8,border:"1px solid #ffe0d0",marginBottom:14}}>📋 {coupon.terms}</div>}

            <div style={{fontSize:12,color:"#6B7280",marginBottom:20}}>Listed by <strong>{coupon.createdBy}</strong>{coupon.createdByUPI&&` · UPI: ${coupon.createdByUPI}`}</div>

            {alreadyMine&&<div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:12,fontSize:13,color:"#92400e"}}>✅ You have already claimed this coupon — check My Dashboard for the code.</div>}
            {isOwner&&<div style={{background:"#e0f2fe",borderRadius:12,padding:12,fontSize:13,color:"#0277bd"}}>📌 This is your listing</div>}
            {!isOwner&&!alreadyMine&&coupon.status==="active"&&!exp&&(
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>Price</div>
                  <div style={{fontSize:26,fontWeight:800,fontFamily:"Sora,sans-serif",color:coupon.price===0?"#10B981":"#1A1A2E"}}>{coupon.price===0?"FREE":`₹${coupon.price}`}</div>
                </div>
                <button disabled={busy} onClick={()=>{if(!user){onClose();onLogin();return;}coupon.price>0?setStep("payment"):doClaim(false);}} style={{...btn("linear-gradient(135deg,#FF6B35,#ff9a5c)"),flex:1,padding:"14px 20px",fontSize:15}}>
                  {busy?"Processing…":coupon.price===0?"🎁 Claim Free Coupon":`🛒 Buy for ₹${coupon.price}`}
                </button>
              </div>
            )}
            {coupon.status!=="active"&&!alreadyMine&&<div style={{background:"#f3f4f6",borderRadius:12,padding:12,fontSize:13,color:"#6B7280",textAlign:"center"}}>This coupon is no longer available</div>}
          </>}

          {step==="payment"&&<>
            <h3 style={{fontFamily:"Sora,sans-serif",fontSize:18,fontWeight:700,marginBottom:16}}>Complete Payment</h3>
            <div style={{background:"#fafafa",borderRadius:14,padding:18,marginBottom:16}}>
              <div style={{fontSize:13,color:"#6B7280",marginBottom:6}}>Send to seller</div>
              <div style={{fontSize:28,fontWeight:800,fontFamily:"Sora,sans-serif",color:"#1A1A2E",marginBottom:12}}>₹{coupon.price}</div>
              {coupon.createdByUPI?(<div>
                <div style={{fontSize:11,color:"#9CA3AF",marginBottom:4}}>Seller UPI ID</div>
                <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <code style={{fontSize:14,color:"#1A1A2E"}}>{coupon.createdByUPI}</code>
                  <button onClick={()=>copy(coupon.createdByUPI)} style={{background:"#f3f4f6",border:"none",borderRadius:6,padding:"4px 10px",fontSize:12,cursor:"pointer",color:"#374151",fontWeight:600}}>Copy</button>
                </div>
              </div>):(<p style={{fontSize:13,color:"#6B7280"}}>Contact seller: <strong>{coupon.createdBy}</strong></p>)}
            </div>
            <p style={{fontSize:13,color:"#6B7280",lineHeight:1.55,marginBottom:20}}>⚠️ After sending payment, click below to reveal the code. This action cannot be undone.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep("detail")} style={{...btn("#f3f4f6","#374151"),flex:1}}>Back</button>
              <button disabled={busy} onClick={()=>doClaim(true)} style={{...btn("linear-gradient(135deg,#10B981,#059669)"),flex:2}}>
                {busy?"Revealing…":"✓ I've Paid – Reveal Code"}
              </button>
            </div>
          </>}

          {step==="revealed"&&<>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:52,marginBottom:8}}>🎉</div>
              <h3 style={{fontFamily:"Sora,sans-serif",fontSize:20,fontWeight:700,color:"#1A1A2E",margin:"0 0 6px"}}>Here's your coupon!</h3>
              <p style={{fontSize:14,color:"#6B7280",margin:0}}>Copy and use before it expires</p>
            </div>
            <div style={{background:"linear-gradient(135deg,#fff9f7,#fff)",border:"2.5px dashed #FF6B35",borderRadius:16,padding:"24px",textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:11,color:"#9CA3AF",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Coupon Code</div>
              <div style={{fontSize:30,fontWeight:800,fontFamily:"Sora,sans-serif",color:"#FF6B35",letterSpacing:4,marginBottom:14}}>{coupon.code}</div>
              <button onClick={()=>copy(coupon.code)} style={{...btn(copied?"#10B981":"#FF6B35"),padding:"9px 24px",fontSize:14}}>
                {copied?"✓ Copied!":"📋 Copy Code"}
              </button>
            </div>
            <div style={{background:"#f0fdf4",borderRadius:12,padding:12,fontSize:13,color:"#166534",marginBottom:16}}>
              ✓ Marked as {coupon.price>0?"purchased":"claimed"}. No longer visible to others.
            </div>
            <button onClick={onClose} style={{...btn("#1A1A2E"),width:"100%",textAlign:"center"}}>Done</button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ─── AuthModal ────────────────────────────────────────────────────────────────
function AuthModal({onLogin,onClose}){
  const [name,setName]=useState(""), [upi,setUpi]=useState("");
  const go=()=>{if(!name.trim())return;onLogin({username:name.trim(),displayName:name.trim(),upiId:upi.trim(),joinedAt:new Date().toISOString()});};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16,backdropFilter:"blur(4px)"}}>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:380,padding:32,fontFamily:"DM Sans,sans-serif",boxShadow:"0 24px 64px rgba(0,0,0,.18)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:38,marginBottom:8}}>🎫</div>
          <h2 style={{fontFamily:"Sora,sans-serif",fontSize:22,fontWeight:800,color:"#1A1A2E",margin:"0 0 6px"}}>Join CouponDen</h2>
          <p style={{color:"#6B7280",fontSize:14,margin:0}}>Start sharing and saving on coupons</p>
        </div>
        <div style={{marginBottom:14}}>
          <label style={lbl}>Your Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Priya Sharma" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"} onKeyDown={e=>e.key==="Enter"&&go()}/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={lbl}>UPI ID <span style={{fontWeight:400,color:"#9CA3AF"}}>(optional, for receiving payments)</span></label>
          <input value={upi} onChange={e=>setUpi(e.target.value)} placeholder="e.g. yourname@gpay" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        </div>
        <button onClick={go} disabled={!name.trim()} style={{...btn(name.trim()?"linear-gradient(135deg,#FF6B35,#ff9a5c)":"#e5e7eb",name.trim()?"#fff":"#9CA3AF"),width:"100%",marginBottom:10}}>Get Started →</button>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",color:"#9CA3AF",fontSize:13,cursor:"pointer",padding:8}}>Browse without signing in</button>
      </div>
    </div>
  );
}

// ─── AddView ──────────────────────────────────────────────────────────────────
function AddView({user,onAdd,onLogin}){
  const empty={title:"",description:"",platform:"gpay",category:"Food",discountText:"",originalValue:"",price:"0",code:"",expiryDate:"",minOrder:"",maxDiscount:"",terms:"",createdByUPI:user?.upiId||""};
  const [f,setF]=useState(empty);
  const [busy,setBusy]=useState(false);
  const [ok,setOk]=useState(false);
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const valid=f.title&&f.code&&f.expiryDate&&f.discountText;

  if(!user) return(
    <div style={{textAlign:"center",padding:"60px 20px",fontFamily:"DM Sans,sans-serif"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔐</div>
      <h3 style={{fontFamily:"Sora,sans-serif",fontSize:20,fontWeight:700,color:"#1A1A2E",marginBottom:8}}>Sign in to list coupons</h3>
      <p style={{color:"#6B7280",marginBottom:24,fontSize:14}}>Create your free profile to start sharing your unused coupons</p>
      <button onClick={onLogin} style={btn("linear-gradient(135deg,#FF6B35,#ff9a5c)")}>Get Started →</button>
    </div>
  );

  const submit=async()=>{
    if(!valid)return;
    setBusy(true);
    await onAdd({id:uid(),...f,originalValue:Number(f.originalValue)||0,price:Number(f.price)||0,status:"active",createdBy:user.displayName,createdByUPI:f.createdByUPI||user.upiId||"",createdAt:new Date().toISOString(),claimedBy:null,claimedAt:null});
    setOk(true); setF({...empty,createdByUPI:user.upiId||""}); setBusy(false);
    setTimeout(()=>setOk(false),4000);
  };

  return(
    <div style={{maxWidth:600,margin:"0 auto",fontFamily:"DM Sans,sans-serif",paddingBottom:40}}>
      <h2 style={{fontFamily:"Sora,sans-serif",fontSize:24,fontWeight:800,color:"#1A1A2E",marginBottom:4}}>List a Coupon</h2>
      <p style={{color:"#6B7280",fontSize:14,marginBottom:24}}>Share your unused coupon — free or earn a small amount</p>

      {ok&&<div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:14,marginBottom:20,fontSize:14,color:"#166534"}}>🎉 Coupon listed successfully and is now live!</div>}

      <div style={{display:"grid",gap:16}}>
        {/* Platform */}
        <div>
          <label style={lbl}>Platform *</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {Object.entries(PLATFORMS).map(([k,p])=>(
              <button key={k} onClick={()=>set("platform",k)} style={{padding:"6px 13px",borderRadius:20,fontSize:12,fontWeight:500,border:"1.5px solid",borderColor:f.platform===k?p.color:"#e5e7eb",background:f.platform===k?p.bg:"#fff",color:f.platform===k?p.color:"#6B7280",cursor:"pointer"}}>{p.emoji} {p.name}</button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label style={lbl}>Category *</label>
          <select value={f.category} onChange={e=>set("category",e.target.value)} style={{...inp,cursor:"pointer"}}>
            {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Title */}
        <div>
          <label style={lbl}>Coupon Title *</label>
          <input value={f.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. ₹50 off on Swiggy order" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        </div>

        {/* Description */}
        <div>
          <label style={lbl}>Description</label>
          <textarea value={f.description} onChange={e=>set("description",e.target.value)} placeholder="Describe the offer, terms..." rows={3} style={{...inp,resize:"vertical"}} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        </div>

        {/* Discount + Value */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={lbl}>Discount Label *</label>
            <input value={f.discountText} onChange={e=>set("discountText",e.target.value)} placeholder="e.g. ₹50 OFF" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div>
            <label style={lbl}>Coupon Value (₹)</label>
            <input type="number" value={f.originalValue} onChange={e=>set("originalValue",e.target.value)} placeholder="50" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
        </div>

        {/* Min order + Max discount */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={lbl}>Min. Order</label>
            <input value={f.minOrder} onChange={e=>set("minOrder",e.target.value)} placeholder="e.g. ₹199" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div>
            <label style={lbl}>Max Discount</label>
            <input value={f.maxDiscount} onChange={e=>set("maxDiscount",e.target.value)} placeholder="e.g. ₹500" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
        </div>

        {/* Expiry */}
        <div>
          <label style={lbl}>Expiry Date *</label>
          <input type="date" value={f.expiryDate} onChange={e=>set("expiryDate",e.target.value)} min={new Date().toISOString().split("T")[0]} style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        </div>

        {/* Code */}
        <div>
          <label style={lbl}>Coupon Code * <span style={{fontWeight:400,color:"#9CA3AF"}}>(hidden until claimed)</span></label>
          <input value={f.code} onChange={e=>set("code",e.target.value.toUpperCase())} placeholder="e.g. SWIG50OFF" style={{...inp,fontFamily:"monospace",letterSpacing:1.5,fontSize:15}} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        </div>

        {/* Price */}
        <div>
          <label style={lbl}>Your Price (₹) — set 0 to share for free</label>
          <input type="number" min="0" value={f.price} onChange={e=>set("price",e.target.value)} style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          {Number(f.price)>0&&<p style={{fontSize:12,color:"#9CA3AF",marginTop:6,margin:"6px 0 0"}}>Buyer will pay you via UPI before seeing the code.</p>}
        </div>

        {/* UPI (only if paid) */}
        {Number(f.price)>0&&(
          <div>
            <label style={lbl}>Your UPI ID <span style={{fontWeight:400,color:"#9CA3AF"}}>(shown to buyer for payment)</span></label>
            <input value={f.createdByUPI} onChange={e=>set("createdByUPI",e.target.value)} placeholder="yourname@gpay" style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
        )}

        {/* Terms */}
        <div>
          <label style={lbl}>Terms & Conditions</label>
          <input value={f.terms} onChange={e=>set("terms",e.target.value)} placeholder="Any usage restrictions..." style={inp} onFocus={e=>e.target.style.borderColor="#FF6B35"} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
        </div>

        <button onClick={submit} disabled={busy||!valid} style={{...btn(valid?"linear-gradient(135deg,#FF6B35,#ff9a5c)":"#e5e7eb",valid?"#fff":"#9CA3AF"),padding:"15px",fontSize:15,opacity:busy?.7:1}}>
          {busy?"Listing…":"🚀 List Coupon"}
        </button>
      </div>
    </div>
  );
}

// ─── DashboardView ────────────────────────────────────────────────────────────
function DashboardView({coupons,user,onLogin,onEdit}){
  const [copied,setCopied]=useState(null);
  const copy=(id,code)=>{navigator.clipboard?.writeText(code);setCopied(id);setTimeout(()=>setCopied(null),2000);};

  if(!user) return(
    <div style={{textAlign:"center",padding:"60px 20px",fontFamily:"DM Sans,sans-serif"}}>
      <div style={{fontSize:48,marginBottom:16}}>👤</div>
      <h3 style={{fontFamily:"Sora,sans-serif",fontSize:20,fontWeight:700,color:"#1A1A2E",marginBottom:8}}>Sign in to see your dashboard</h3>
      <button onClick={onLogin} style={btn("linear-gradient(135deg,#FF6B35,#ff9a5c)")}>Sign In</button>
    </div>
  );

  const listed=coupons.filter(c=>c.createdBy===user.displayName);
  const claimed=coupons.filter(c=>c.claimedBy===user.displayName);
  const activeL=listed.filter(c=>c.status==="active"&&!expired(c.expiryDate)).length;
  const earned=listed.filter(c=>c.status==="purchased").reduce((a,c)=>a+c.price,0);
  const saved=claimed.reduce((a,c)=>a+c.originalValue,0);

  const Stat=({label,val,color,sub})=>(
    <div style={{background:"#fff",borderRadius:14,padding:"16px 18px",flex:1,minWidth:100,border:"1px solid #f0f0f0"}}>
      <div style={{fontSize:22,fontWeight:800,fontFamily:"Sora,sans-serif",color}}>{val}</div>
      <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{label}</div>
      {sub&&<div style={{fontSize:11,color:"#9CA3AF"}}>{sub}</div>}
    </div>
  );

  const statusStyle=(c)=>{
    const a=c.status==="active"&&!expired(c.expiryDate);
    return{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,background:a?"#dcfce7":c.status==="claimed"?"#dbeafe":c.status==="purchased"?"#fef9c3":"#f3f4f6",color:a?"#166534":c.status==="claimed"?"#1e40af":c.status==="purchased"?"#854d0e":"#6B7280"};
  };

  return(
    <div style={{fontFamily:"DM Sans,sans-serif"}}>
      {/* Profile card */}
      <div style={{background:"linear-gradient(135deg,#1A1A2E,#2d2d4e)",borderRadius:18,padding:"22px 24px",marginBottom:22,color:"#fff"}}>
        <div style={{width:50,height:50,background:"linear-gradient(135deg,#FF6B35,#ff9a5c)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12}}>
          {user.displayName[0].toUpperCase()}
        </div>
        <div style={{fontFamily:"Sora,sans-serif",fontSize:20,fontWeight:800}}>{user.displayName}</div>
        {user.upiId&&<div style={{fontSize:13,opacity:.75,marginTop:3}}>💳 {user.upiId}</div>}
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
        <Stat label="Listed" val={listed.length} color="#FF6B35"/>
        <Stat label="Active" val={activeL} color="#10B981"/>
        <Stat label="Earned" val={`₹${earned}`} color="#F59E0B"/>
        <Stat label="Saved" val={`₹${saved}`} color="#3B82F6"/>
      </div>

      {/* My Listings */}
      <h3 style={{fontFamily:"Sora,sans-serif",fontSize:17,fontWeight:700,marginBottom:12}}>My Listings ({listed.length})</h3>
      {listed.length===0?<p style={{color:"#9CA3AF",fontSize:14,marginBottom:24}}>You haven't listed any coupons yet.</p>:(
        <div style={{display:"grid",gap:8,marginBottom:28}}>
          {listed.map(c=>(
            <div key={c.id} style={{background:"#fff",borderRadius:12,padding:"13px 16px",border:"1px solid #f0f0f0",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:"#1A1A2E",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.title}</div>
                <div style={{fontSize:12,color:"#9CA3AF",marginTop:2}}>{c.discountText} · {c.price===0?"Free":`₹${c.price}`} · Exp: {c.expiryDate}</div>
              </div>
              <span style={statusStyle(c)}>{c.status==="active"&&!expired(c.expiryDate)?"Active":c.status==="claimed"?"Claimed":c.status==="purchased"?"Sold":"Expired"}</span>
            </div>
          ))}
        </div>
      )}

      {/* Claimed */}
      <h3 style={{fontFamily:"Sora,sans-serif",fontSize:17,fontWeight:700,marginBottom:12}}>Coupons I Saved ({claimed.length})</h3>
      {claimed.length===0?<p style={{color:"#9CA3AF",fontSize:14}}>You haven't claimed any coupons yet.</p>:(
        <div style={{display:"grid",gap:10}}>
          {claimed.map(c=>(
            <div key={c.id} style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #f0f0f0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:600,fontSize:14,color:"#1A1A2E"}}>{c.title}</div>
                <PlatformBadge p={c.platform}/>
              </div>
              <div style={{background:"#fef9f7",border:"2px dashed #FF6B35",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:11,color:"#9CA3AF",marginBottom:2}}>Code</div>
                  <code style={{fontSize:18,fontWeight:800,color:"#FF6B35",letterSpacing:2}}>{c.code}</code>
                </div>
                <button onClick={()=>copy(c.id,c.code)} style={{...btn(copied===c.id?"#10B981":"#FF6B35"),padding:"7px 14px",fontSize:12}}>
                  {copied===c.id?"✓ Copied":"Copy"}
                </button>
              </div>
              <div style={{fontSize:11,color:"#9CA3AF",marginTop:8}}>Expires: {c.expiryDate} · Value: ₹{c.originalValue}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App(){
  const [view,setView]=useState("browse");
  const [user,setUser]=useState(null);
  const [coupons,setCoupons]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAuth,setShowAuth]=useState(false);
  const [selected,setSelected]=useState(null);
  const [search,setSearch]=useState("");
  const [cat,setCat]=useState("All");
  const [plat,setPlat]=useState("all");
  const [freeOnly,setFreeOnly]=useState(false);
  const [showInactive,setShowInactive]=useState(false);

  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
    link.rel="stylesheet";
    document.head.appendChild(link);
  },[]);

  useEffect(()=>{
    (async()=>{
      const [u,raw]=await Promise.all([dbGet("cd_user"),dbGet("cd_coupons",true)]);
      let c=raw||SEED;
      // Auto-expire
      const updated=c.map(x=>x.status==="active"&&expired(x.expiryDate)?{...x,status:"expired"}:x);
      if(JSON.stringify(updated)!==JSON.stringify(c)) await dbSet("cd_coupons",updated,true);
      setCoupons(updated); setUser(u); setLoading(false);
    })();
  },[]);

  const login=async u=>{setUser(u);await dbSet("cd_user",u);setShowAuth(false);};

  const addCoupon=async c=>{
    const updated=[c,...coupons];
    setCoupons(updated);
    await dbSet("cd_coupons",updated,true);
    setView("browse");
  };

  const claimCoupon=async(coupon,paid)=>{
    const updated=coupons.map(c=>c.id===coupon.id?{...c,status:paid?"purchased":"claimed",claimedBy:user?.displayName||"Guest",claimedAt:new Date().toISOString()}:c);
    setCoupons(updated);
    await dbSet("cd_coupons",updated,true);
    return updated.find(c=>c.id===coupon.id);
  };

  // Filter
  const filtered=coupons.filter(c=>{
    if(search){const q=search.toLowerCase();if(![c.title,c.description,c.discountText,c.createdBy].some(t=>t.toLowerCase().includes(q)))return false;}
    if(cat!=="All"&&c.category!==cat)return false;
    if(plat!=="all"&&c.platform!==plat)return false;
    if(freeOnly&&c.price!==0)return false;
    return true;
  });
  const active=filtered.filter(c=>c.status==="active"&&!expired(c.expiryDate));
  const inactive=filtered.filter(c=>c.status!=="active"||expired(c.expiryDate));

  if(loading) return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"DM Sans,sans-serif",flexDirection:"column",gap:12}}>
      <div style={{fontSize:42}}>🎫</div>
      <div style={{color:"#9CA3AF",fontSize:14}}>Loading CouponDen…</div>
    </div>
  );

  const navBtn=(v,label)=>(
    <button onClick={()=>{ if(v==="add"||v==="dashboard"){if(!user){setShowAuth(true);return;}}setView(v);}} style={{background:view===v?"#FF6B35":"transparent",color:view===v?"#fff":"#6B7280",border:`1.5px solid ${view===v?"#FF6B35":"transparent"}`,borderRadius:8,padding:"6px 13px",fontSize:13,fontWeight:600,cursor:"pointer",transition:"all .15s"}}>
      {label}
    </button>
  );

  return(
    <div style={{minHeight:"100vh",background:"#FAFAF8",fontFamily:"DM Sans,sans-serif"}}>
      {/* Navbar */}
      <nav style={{background:"#fff",borderBottom:"1px solid #f0f0f0",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
        <button onClick={()=>setView("browse")} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:0}}>
          <span style={{fontSize:22}}>🎫</span>
          <span style={{fontFamily:"Sora,sans-serif",fontWeight:800,fontSize:19,color:"#1A1A2E"}}>Coupon<span style={{color:"#FF6B35"}}>Den</span></span>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
          {navBtn("browse","🏪 Browse")}
          {navBtn("add","+ List")}
          {navBtn("dashboard","👤 Me")}
          {!user
            ?<button onClick={()=>setShowAuth(true)} style={{background:"#1A1A2E",color:"#fff",border:"none",borderRadius:8,padding:"7px 15px",fontSize:13,fontWeight:600,cursor:"pointer"}}>Sign In</button>
            :<div style={{background:"#fff9f7",border:"1.5px solid #ffe0d0",borderRadius:8,padding:"5px 12px",fontSize:13,fontWeight:600,color:"#FF6B35"}}>{user.displayName.split(" ")[0]}</div>
          }
        </div>
      </nav>

      <main style={{maxWidth:1160,margin:"0 auto",padding:"22px 14px"}}>
        {/* BROWSE */}
        {view==="browse"&&<>
          {/* Hero */}
          <div style={{background:"linear-gradient(135deg,#1A1A2E 0%,#2d2d4e 100%)",borderRadius:20,padding:"30px 26px",marginBottom:26,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-10,right:-10,fontSize:130,opacity:.04,lineHeight:1}}>🎫</div>
            <h1 style={{fontFamily:"Sora,sans-serif",fontSize:26,fontWeight:800,color:"#fff",margin:"0 0 6px",lineHeight:1.25}}>
              Save more with<br/><span style={{color:"#FF6B35"}}>shared coupons</span>
            </h1>
            <p style={{color:"rgba(255,255,255,.6)",fontSize:13,marginBottom:20}}>Claim free or buy unused coupons from real users · GPay · PhonePe · Swiggy · Amazon & more</p>
            <div style={{position:"relative",maxWidth:500}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search coupons, platforms, categories…"
                style={{width:"100%",padding:"12px 44px 12px 16px",borderRadius:12,border:"none",fontSize:14,fontFamily:"DM Sans,sans-serif",outline:"none",boxSizing:"border-box",boxShadow:"0 4px 16px rgba(0,0,0,.2)"}}/>
              <span style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:16}}>🔍</span>
            </div>
          </div>

          {/* Category filter */}
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:8,marginBottom:8}}>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{padding:"6px 15px",borderRadius:20,fontSize:13,fontWeight:500,border:"1.5px solid",borderColor:cat===c?"#FF6B35":"#e5e7eb",background:cat===c?"#FF6B35":"#fff",color:cat===c?"#fff":"#6B7280",cursor:"pointer",whiteSpace:"nowrap",transition:"all .15s"}}>
                {c}
              </button>
            ))}
          </div>

          {/* Platform filter */}
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:10,marginBottom:12,alignItems:"center"}}>
            <button onClick={()=>setPlat("all")} style={{padding:"5px 13px",borderRadius:20,fontSize:12,fontWeight:500,border:"1.5px solid",borderColor:plat==="all"?"#1A1A2E":"#e5e7eb",background:plat==="all"?"#1A1A2E":"#fff",color:plat==="all"?"#fff":"#6B7280",cursor:"pointer",whiteSpace:"nowrap"}}>All</button>
            {Object.entries(PLATFORMS).map(([k,p])=>(
              <button key={k} onClick={()=>setPlat(k)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:500,border:"1.5px solid",borderColor:plat===k?p.color:"#e5e7eb",background:plat===k?p.bg:"#fff",color:plat===k?p.color:"#6B7280",cursor:"pointer",whiteSpace:"nowrap"}}>{p.emoji} {p.name}</button>
            ))}
            <button onClick={()=>setFreeOnly(!freeOnly)} style={{padding:"5px 13px",borderRadius:20,fontSize:12,fontWeight:600,border:"1.5px solid",borderColor:freeOnly?"#10B981":"#e5e7eb",background:freeOnly?"#dcfce7":"#fff",color:freeOnly?"#166534":"#6B7280",cursor:"pointer",whiteSpace:"nowrap"}}>🎁 Free Only</button>
          </div>

          {/* Count bar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontSize:13,color:"#9CA3AF"}}>{active.length} active coupon{active.length!==1?"s":""} available</span>
            {inactive.length>0&&<button onClick={()=>setShowInactive(!showInactive)} style={{fontSize:12,color:"#9CA3AF",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>
              {showInactive?"Hide":"Show"} {inactive.length} inactive
            </button>}
          </div>

          {/* Active grid */}
          {active.length===0&&inactive.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px",color:"#9CA3AF"}}>
              <div style={{fontSize:48,marginBottom:12}}>🔍</div>
              <div style={{fontSize:16,fontWeight:600,color:"#6B7280"}}>No coupons found</div>
              <div style={{fontSize:14,marginTop:6}}>Try different filters or be the first to list one!</div>
            </div>
          ):(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:14,marginBottom:28}}>
                {active.map(c=><CouponCard key={c.id} c={c} onClick={setSelected}/>)}
              </div>
              {showInactive&&inactive.length>0&&<>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                  <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
                  <span style={{fontSize:13,color:"#9CA3AF",fontWeight:500}}>Inactive / Expired</span>
                  <div style={{flex:1,height:1,background:"#e5e7eb"}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:14}}>
                  {inactive.map(c=><CouponCard key={c.id} c={c} onClick={()=>{}}/>)}
                </div>
              </>}
            </>
          )}
        </>}

        {view==="add"&&<AddView user={user} onAdd={addCoupon} onLogin={()=>setShowAuth(true)}/>}
        {view==="dashboard"&&<DashboardView coupons={coupons} user={user} onLogin={()=>setShowAuth(true)}/>}
      </main>

      {/* Footer */}
      <footer style={{textAlign:"center",padding:"20px 16px",fontSize:12,color:"#D1D5DB",borderTop:"1px solid #f0f0f0",background:"#fff",marginTop:20}}>
        🎫 CouponDen · Share & save on unused coupons · All transactions are peer-to-peer
      </footer>

      {showAuth&&<AuthModal onLogin={login} onClose={()=>setShowAuth(false)}/>}
      {selected&&<CouponModal coupon={selected} onClose={()=>setSelected(null)} onClaim={claimCoupon} user={user} onLogin={()=>setShowAuth(true)}/>}
    </div>
  );
}
