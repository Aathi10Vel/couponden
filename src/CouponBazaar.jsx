import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "./supabase";

// ─── Platform config ───────────────────────────────────────────────────────
const PLATFORM_CONFIG = {
  gpay:     { label: "GPay",     bg: "#E8F0FE", text: "#1A73E8", icon: "G" },
  phonepe:  { label: "PhonePe",  bg: "#F3E5F5", text: "#7B1FA2", icon: "P" },
  paytm:    { label: "Paytm",    bg: "#E0F7FA", text: "#00838F", icon: "₱" },
  swiggy:   { label: "Swiggy",   bg: "#FFF3E0", text: "#E65100", icon: "S" },
  zomato:   { label: "Zomato",   bg: "#FFEBEE", text: "#C62828", icon: "Z" },
  amazon:   { label: "Amazon",   bg: "#FFF8E1", text: "#E65100", icon: "A" },
  flipkart: { label: "Flipkart", bg: "#E3F2FD", text: "#1565C0", icon: "F" },
  physical: { label: "Physical", bg: "#E8F5E9", text: "#2E7D32", icon: "#" },
  other:    { label: "Other",    bg: "#F5F5F5", text: "#424242", icon: "?" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const daysLeft = (iso) => {
  const diff = new Date(iso) - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d === 0) return `${h}h left`;
  return `${d}d left`;
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const today = () => new Date().toISOString().split("T")[0];

// Maps Supabase snake_case rows to camelCase for the UI
const mapRow = (row) => ({
  id: row.id,
  title: row.title,
  code: row.code,
  description: row.description || "",
  platform: row.platform,
  discount: row.discount,
  isFree: row.is_free,
  sellingPrice: row.selling_price,
  validUntil: row.valid_until,
  status: row.status,
  inactiveReason: row.inactive_reason,
  sellerId: row.seller_id,
  sellerName: row.seller_name,
  claimedBy: row.claimed_by,
  createdAt: row.created_at,
});

// ─── Platform badge ────────────────────────────────────────────────────────
function PlatformBadge({ platform }) {
  const cfg = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other;
  return (
    <span style={{
      background: cfg.bg, color: cfg.text,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      letterSpacing: 0.2, display: "inline-block",
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ coupon }) {
  if (coupon.status === "inactive") {
    const map = {
      claimed:   ["Claimed",   "#059669", "#ECFDF5"],
      purchased: ["Purchased", "#2563EB", "#EFF6FF"],
      expired:   ["Expired",   "#9CA3AF", "#F3F4F6"],
    };
    const [label, color, bg] = map[coupon.inactiveReason] || ["Inactive", "#9CA3AF", "#F3F4F6"];
    return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{label}</span>;
  }
  const diff = new Date(coupon.validUntil) - Date.now();
  if (diff < 86400000)
    return <span style={{ background: "#FEF3C7", color: "#D97706", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Expiring soon</span>;
  return <span style={{ background: "#ECFDF5", color: "#059669", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Active</span>;
}

// ─── Auth screen ───────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handle = async () => {
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            name: name.trim() || email.split("@")[0],
          });
        }
        setMessage("Check your email to confirm your account, then log in.");
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%", padding: "12px 16px", borderRadius: 12,
    border: `1.5px solid ${hasError ? "#EF4444" : "#E5E4DC"}`,
    fontSize: 15, outline: "none", boxSizing: "border-box",
    marginBottom: 12, fontFamily: "inherit", background: "#FAFAF9",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF9", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", maxWidth: 400, width: "100%", border: "1.5px solid #F0EFE8" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#1C1C1E" }}>CouponBazaar</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#9CA3AF" }}>Share · Sell · Save</p>
        </div>

        <div style={{ display: "flex", background: "#F5F5F3", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }}
              style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 14, fontFamily: "inherit",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#D97706" : "#9CA3AF",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {mode === "signup" && (
          <input type="text" placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)} style={inputStyle(false)} />
        )}
        <input type="email" placeholder="Email address" value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle(false)} />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)} style={inputStyle(false)} />

        {error   && <div style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ background: "#F0FDF4", color: "#16A34A", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{message}</div>}

        <button onClick={handle} disabled={loading || !email || !password}
          style={{ width: "100%", background: loading ? "#FCD34D" : "#F59E0B", color: "#fff", border: "none",
            borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

// ─── Modal wrapper ─────────────────────────────────────────────────────────
function Modal({ onClose, children, title }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 500, width: "100%",
        maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1C1C1E" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "#F5F5F3", border: "none", borderRadius: "50%",
            width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "#6B7280",
            display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Coupon card ───────────────────────────────────────────────────────────
function CouponCard({ coupon, onClick }) {
  const isInactive = coupon.status === "inactive";
  return (
    <div onClick={() => onClick(coupon)}
      style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #F0EFE8",
        padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.18s ease" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,158,11,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#F0EFE8"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>

      {isInactive && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.88)", zIndex: 2,
          display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{coupon.inactiveReason === "expired" ? "⏰" : "✅"}</div>
            <span style={{ background: "#F3F4F6", color: "#6B7280", padding: "6px 18px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
              {coupon.inactiveReason === "claimed" ? "Claimed" : coupon.inactiveReason === "purchased" ? "Purchased" : "Expired"}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 8 }}>
        <PlatformBadge platform={coupon.platform} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <StatusBadge coupon={coupon} />
          {coupon.status === "active" && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{daysLeft(coupon.validUntil)}</span>}
        </div>
      </div>

      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#1C1C1E", lineHeight: 1.4 }}>{coupon.title}</h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B7280", lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {coupon.description || "No description provided."}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>{coupon.discount}</span>
        {coupon.isFree
          ? <span style={{ background: "#ECFDF5", color: "#059669", padding: "5px 14px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>FREE</span>
          : <span style={{ background: "#FEF3C7", color: "#D97706", padding: "5px 14px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>₹{coupon.sellingPrice}</span>
        }
      </div>

      <div style={{ paddingTop: 12, borderTop: "1px solid #F5F5F3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FEF3C7",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#D97706" }}>
            {(coupon.sellerName || "?").charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{coupon.sellerName}</span>
        </div>
        <span style={{ fontSize: 12, color: "#C4C4C0" }}>{timeAgo(coupon.createdAt)}</span>
      </div>
    </div>
  );
}

// ─── Detail modal ──────────────────────────────────────────────────────────
function DetailModal({ coupon, onClose, onClaim, onPurchase, currentUserId }) {
  const [step, setStep] = useState("detail");
  const [copied, setCopied] = useState(false);
  const isOwn = coupon.sellerId === currentUserId;
  const isClaimedByMe = coupon.claimedBy === currentUserId;
  const canSee = isOwn || isClaimedByMe;
  const cfg = PLATFORM_CONFIG[coupon.platform] || PLATFORM_CONFIG.other;

  const copyCode = () => {
    navigator.clipboard.writeText(coupon.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryDate = new Date(coupon.validUntil).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Modal onClose={onClose} title="Coupon Details">
      <div style={{ background: cfg.bg, borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.text, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>{cfg.icon}</div>
        <div>
          <div style={{ fontWeight: 700, color: cfg.text, fontSize: 15 }}>{cfg.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1C1C1E" }}>{coupon.discount}</div>
        </div>
        <div style={{ marginLeft: "auto" }}><StatusBadge coupon={coupon} /></div>
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1C1C1E" }}>{coupon.title}</h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{coupon.description}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[["Expires", expiryDate], ["Time left", daysLeft(coupon.validUntil)], ["Listed by", coupon.sellerName], ["Price", coupon.isFree ? "Free" : `₹${coupon.sellingPrice}`]].map(([label, value]) => (
          <div key={label} style={{ background: "#FAFAF9", borderRadius: 10, padding: "10px 14px", border: "1px solid #F0EFE8" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{value}</div>
          </div>
        ))}
      </div>

      {canSee ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Coupon Code</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: "#F5F5F3", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#1C1C1E", letterSpacing: 2, border: "1.5px dashed #E5E4DC" }}>
              {coupon.code}
            </div>
            <button onClick={copyCode} style={{ background: copied ? "#ECFDF5" : "#F5F5F3", color: copied ? "#059669" : "#6B7280", border: "none", borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      ) : coupon.status === "active" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Coupon Code</div>
          <div style={{ background: "#F5F5F3", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, border: "1.5px dashed #E5E4DC" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#C4C4C0", letterSpacing: 4, flex: 1 }}>• • • • • • • •</div>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Unlock to reveal</span>
          </div>
        </div>
      )}

      {coupon.status === "inactive" ? (
        <div style={{ background: "#F9F9F9", borderRadius: 12, padding: 16, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
          This coupon is no longer available
        </div>
      ) : isOwn ? (
        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "#2563EB", fontWeight: 500, textAlign: "center" }}>
          This is your listing — you can always see your own code
        </div>
      ) : step === "detail" ? (
        coupon.isFree ? (
          <button onClick={() => onClaim(coupon)} style={{ width: "100%", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            Claim for Free
          </button>
        ) : (
          <div>
            <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#92400E" }}>Price to unlock code</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#D97706" }}>₹{coupon.sellingPrice}</span>
            </div>
            <button onClick={() => setStep("payment")} style={{ width: "100%", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: 14, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Buy for ₹{coupon.sellingPrice}
            </button>
          </div>
        )
      ) : step === "payment" ? (
        <div>
          <div style={{ background: "#FAFAF9", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #F0EFE8", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>Amount to pay</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1C1C1E" }}>₹{coupon.sellingPrice}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>to {coupon.sellerName}</div>
          </div>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16, textAlign: "center", lineHeight: 1.5 }}>
            Integrate Razorpay here for real payments. Click below to simulate.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep("detail")} style={{ flex: 1, background: "#F5F5F3", color: "#6B7280", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Back</button>
            <button onClick={() => { onPurchase(coupon); setStep("success"); }} style={{ flex: 2, background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Confirm Payment</button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#059669", marginBottom: 4 }}>Payment successful!</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Your coupon code is unlocked</div>
          <div style={{ background: "#F5F5F3", borderRadius: 10, padding: "14px 20px", fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: "#1C1C1E", letterSpacing: 3, border: "1.5px dashed #E5E4DC", marginBottom: 16 }}>
            {coupon.code}
          </div>
          <button onClick={copyCode} style={{ background: copied ? "#ECFDF5" : "#F5F5F3", color: copied ? "#059669" : "#6B7280", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      )}
    </Modal>
  );
}

// ─── Add coupon modal ──────────────────────────────────────────────────────
function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: "", code: "", description: "", platform: "gpay", discount: "", isFree: true, sellingPrice: "", validUntil: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title = "Title is required";
    if (!form.code.trim())     e.code = "Coupon code is required";
    if (!form.discount.trim()) e.discount = "Discount value is required";
    if (!form.validUntil)      e.validUntil = "Expiry date is required";
    if (form.validUntil && new Date(form.validUntil) <= new Date()) e.validUntil = "Date must be in the future";
    if (!form.isFree && (!form.sellingPrice || Number(form.sellingPrice) <= 0)) e.sellingPrice = "Enter a valid price";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await onAdd(form);
    setLoading(false);
  };

  const inp = (label, key, placeholder, opts = {}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label} {!opts.optional && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      <input value={form[key]} onChange={e => { set(key, e.target.value); setErrors(p => ({ ...p, [key]: null })); }}
        placeholder={placeholder} type={opts.type || "text"} min={opts.min}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
          border: `1.5px solid ${errors[key] ? "#EF4444" : "#E5E4DC"}`,
          outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFAF9" }} />
      {errors[key] && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  return (
    <Modal onClose={onClose} title="Share a Coupon">
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Platform <span style={{ color: "#EF4444" }}>*</span></label>
        <select value={form.platform} onChange={e => set("platform", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, border: "1.5px solid #E5E4DC", outline: "none", boxSizing: "border-box", background: "#FAFAF9", fontFamily: "inherit" }}>
          {Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => <option key={id} value={id}>{cfg.label}</option>)}
        </select>
      </div>

      {inp("Coupon Title", "title", "e.g. ₹50 cashback on recharge")}
      {inp("Coupon / Offer Code", "code", "e.g. GPAY50RCH")}
      {inp("Discount Value", "discount", "e.g. ₹50 off, 20% cashback")}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Description <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          placeholder="Terms, minimum order, conditions..." rows={3}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, border: "1.5px solid #E5E4DC", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", background: "#FAFAF9" }} />
      </div>

      {inp("Valid Until", "validUntil", "", { type: "date", min: today() })}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Listing Type <span style={{ color: "#EF4444" }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["true", "Free", "Share for free", "#ECFDF5", "#059669"], ["false", "Paid", "Set a price", "#FEF3C7", "#D97706"]].map(([val, label, sub, bg, color]) => (
            <div key={val} onClick={() => set("isFree", val === "true")}
              style={{ padding: 14, borderRadius: 12, cursor: "pointer", textAlign: "center",
                border: `2px solid ${String(form.isFree) === val ? color : "#E5E4DC"}`,
                background: String(form.isFree) === val ? bg : "#fff", transition: "all 0.15s" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: String(form.isFree) === val ? color : "#374151" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {!form.isFree && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Selling Price (₹) <span style={{ color: "#EF4444" }}>*</span></label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "#D97706" }}>₹</span>
            <input value={form.sellingPrice} onChange={e => { set("sellingPrice", e.target.value); setErrors(p => ({ ...p, sellingPrice: null })); }}
              placeholder="e.g. 20" type="number" min="1"
              style={{ width: "100%", padding: "10px 14px 10px 28px", borderRadius: 10, fontSize: 14,
                border: `1.5px solid ${errors.sellingPrice ? "#EF4444" : "#E5E4DC"}`,
                outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFAF9" }} />
          </div>
          {errors.sellingPrice && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.sellingPrice}</div>}
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Keep it fair — buyers pay this to unlock the code</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: "#F5F5F3", color: "#6B7280", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading}
          style={{ flex: 2, background: loading ? "#FCD34D" : "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loading ? "Listing..." : "List Coupon"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Main app ──────────────────────────────────────────────────────────────
export default function CouponBazaar() {
  const [session, setSession]     = useState(null);
  const [profile, setProfile]     = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [coupons, setCoupons]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("browse");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [priceFilter, setPriceFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [toast, setToast]         = useState(null);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Load profile
  useEffect(() => {
    if (!session) { setProfile(null); return; }
    supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data }) => setProfile(data));
  }, [session]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Fetch all coupons from Supabase
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      showToast("Failed to load coupons: " + error.message, "error");
    } else {
      const now = new Date();
      const mapped = (data || []).map(row => {
        const c = mapRow(row);
        // Mark expired ones locally without extra DB call
        if (c.status === "active" && new Date(c.validUntil) < now) {
          return { ...c, status: "inactive", inactiveReason: "expired" };
        }
        return c;
      });
      setCoupons(mapped);
    }
    setLoading(false);
  }, [showToast]);

  // Load coupons when logged in
  useEffect(() => {
    if (session) fetchCoupons();
    else { setCoupons([]); setLoading(false); }
  }, [session, fetchCoupons]);

  // Realtime: auto-refresh when any row changes
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("coupons-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "coupons" }, fetchCoupons)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session, fetchCoupons]);

  // Claim a free coupon
  const handleClaim = useCallback(async (coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ status: "inactive", inactive_reason: "claimed", claimed_by: session.user.id })
      .eq("id", coupon.id);
    if (error) { showToast("Failed to claim: " + error.message, "error"); return; }
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: "inactive", inactiveReason: "claimed", claimedBy: session.user.id } : c));
    showToast("Coupon claimed! The code is now visible.");
  }, [session, showToast]);

  // Purchase a paid coupon
  const handlePurchase = useCallback(async (coupon) => {
    const { error } = await supabase
      .from("coupons")
      .update({ status: "inactive", inactive_reason: "purchased", claimed_by: session.user.id })
      .eq("id", coupon.id);
    if (error) { showToast("Payment failed: " + error.message, "error"); return; }
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, status: "inactive", inactiveReason: "purchased", claimedBy: session.user.id } : c));
    showToast(`Payment of ₹${coupon.sellingPrice} confirmed. Code unlocked!`);
  }, [session, showToast]);

  // Add a new coupon
  const handleAdd = useCallback(async (form) => {
    const sellerName = profile?.name || session?.user?.email?.split("@")[0] || "User";
    const { error } = await supabase.from("coupons").insert({
      title:         form.title.trim(),
      code:          form.code.trim().toUpperCase(),
      description:   form.description.trim(),
      platform:      form.platform,
      discount:      form.discount.trim(),
      is_free:       form.isFree,
      selling_price: form.isFree ? 0 : Number(form.sellingPrice),
      valid_until:   new Date(form.validUntil + "T23:59:59").toISOString(),
      status:        "active",
      seller_id:     session.user.id,
      seller_name:   sellerName,
    });
    if (error) { showToast("Failed to list: " + error.message, "error"); return; }
    setShowAdd(false);
    showToast("Coupon listed! Others can now claim or buy it.");
    // Realtime will trigger fetchCoupons automatically
  }, [session, profile, showToast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Derived data
  const myListings  = useMemo(() => coupons.filter(c => c.sellerId === session?.user?.id), [coupons, session]);
  const myClaimed   = useMemo(() => coupons.filter(c => c.claimedBy === session?.user?.id), [coupons, session]);
  const activeCount = useMemo(() => coupons.filter(c => c.status === "active").length, [coupons]);

  const displayed = useMemo(() => {
    if (tab === "listings") return myListings;
    if (tab === "claimed")  return myClaimed;
    return coupons.filter(c => {
      if (c.status !== "active") return false;
      if (platformFilter !== "all" && c.platform !== platformFilter) return false;
      if (priceFilter === "free" && !c.isFree) return false;
      if (priceFilter === "paid" && c.isFree)  return false;
      const q = search.toLowerCase().trim();
      if (q) { const hay = `${c.title} ${c.platform} ${c.discount} ${c.description}`.toLowerCase(); if (!hay.includes(q)) return false; }
      return true;
    });
  }, [coupons, tab, platformFilter, priceFilter, search, myListings, myClaimed]);

  const TABS = [
    { id: "browse",   label: "Browse",      count: activeCount },
    { id: "listings", label: "My Listings", count: myListings.length },
    { id: "claimed",  label: "Claimed",     count: myClaimed.length },
  ];

  const PLATFORM_FILTERS = [
    { id: "all", label: "All" },
    ...Object.entries(PLATFORM_CONFIG).map(([id, v]) => ({ id, label: v.label })),
  ];

  if (!authReady) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAFAF9", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏷️</div>
        <div style={{ fontSize: 15, color: "#9CA3AF" }}>Loading...</div>
      </div>
    </div>
  );

  if (!session) return <AuthScreen />;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100vh", background: "#FAFAF9", color: "#1C1C1E" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {toast && (
        <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, maxWidth: 340,
          background: toast.type === "error" ? "#FEF2F2" : "#F0FDF4",
          border: `1px solid ${toast.type === "error" ? "#FECACA" : "#BBF7D0"}`,
          color: toast.type === "error" ? "#DC2626" : "#16A34A",
          padding: "12px 18px", borderRadius: 12, fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)", animation: "slideIn 0.2s ease" }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #F0EFE8", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 16, height: 66 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: "#F59E0B", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏷️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19, color: "#1C1C1E", lineHeight: 1 }}>CouponBazaar</div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500, letterSpacing: 0.5 }}>SHARE · SELL · SAVE</div>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 460 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3AF" }}>🔍</span>
              <input value={search} onChange={e => { setSearch(e.target.value); if (tab !== "browse") setTab("browse"); }}
                placeholder="Search coupons, platforms..."
                style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 11, border: "1.5px solid #E5E4DC", background: "#FAFAF9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <button onClick={() => setShowAdd(true)}
              style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 11, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
              + Share Coupon
            </button>
            <div onClick={handleSignOut} title="Click to sign out"
              style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#D97706", fontSize: 14, cursor: "pointer", border: "2px solid #FDE68A", userSelect: "none" }}>
              {(profile?.name || session.user.email || "U").charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0EFE8" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
                fontWeight: tab === t.id ? 700 : 500, fontSize: 14, fontFamily: "inherit",
                color: tab === t.id ? "#D97706" : "#6B7280",
                borderBottom: `2.5px solid ${tab === t.id ? "#F59E0B" : "transparent"}`,
                display: "flex", alignItems: "center", gap: 8 }}>
              {t.label}
              <span style={{ background: tab === t.id ? "#FEF3C7" : "#F3F4F6", color: tab === t.id ? "#D97706" : "#9CA3AF", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {tab === "browse" && (
        <div style={{ background: "#fff", borderBottom: "1px solid #F0EFE8", overflowX: "auto" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 20px", display: "flex", gap: 7, alignItems: "center" }}>
            {PLATFORM_FILTERS.map(p => (
              <button key={p.id} onClick={() => setPlatformFilter(p.id)}
                style={{ padding: "6px 14px", borderRadius: 20,
                  border: `1.5px solid ${platformFilter === p.id ? "#F59E0B" : "#E5E4DC"}`,
                  background: platformFilter === p.id ? "#FEF3C7" : "#fff",
                  color: platformFilter === p.id ? "#D97706" : "#6B7280",
                  fontWeight: platformFilter === p.id ? 700 : 500,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {p.label}
              </button>
            ))}
            <div style={{ width: 1, height: 22, background: "#E5E4DC", margin: "0 4px", flexShrink: 0 }} />
            {[["all", "All"], ["free", "🆓 Free"], ["paid", "💰 Paid"]].map(([val, label]) => (
              <button key={val} onClick={() => setPriceFilter(val)}
                style={{ padding: "6px 14px", borderRadius: 20,
                  border: `1.5px solid ${priceFilter === val ? "#10B981" : "#E5E4DC"}`,
                  background: priceFilter === val ? "#ECFDF5" : "#fff",
                  color: priceFilter === val ? "#059669" : "#6B7280",
                  fontWeight: priceFilter === val ? 700 : 500,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px" }}>
        {tab === "listings" && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>My Listings</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#9CA3AF" }}>Coupons you have shared or put up for sale</p>
          </div>
        )}
        {tab === "claimed" && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Claimed Coupons</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#9CA3AF" }}>Coupons you have claimed or purchased</p>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: "spin 1s linear infinite" }}>⏳</div>
            <div style={{ fontSize: 15, color: "#9CA3AF" }}>Loading coupons from database...</div>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{tab === "browse" ? "🔍" : tab === "listings" ? "📋" : "📦"}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              {tab === "browse" ? "No coupons found" : tab === "listings" ? "No listings yet" : "Nothing claimed yet"}
            </div>
            <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
              {tab === "browse" ? "Try changing filters or be the first to share one!" :
               tab === "listings" ? "Share a coupon you are not using — someone will thank you!" :
               "Browse and claim free coupons or buy discounted ones"}
            </div>
            {tab !== "browse" && (
              <button onClick={() => tab === "listings" ? setShowAdd(true) : setTab("browse")}
                style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                {tab === "listings" ? "+ Share a Coupon" : "Browse Coupons"}
              </button>
            )}
          </div>
        ) : (
          <>
            {tab === "browse" && <div style={{ marginBottom: 16, fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>{displayed.length} active coupon{displayed.length !== 1 ? "s" : ""} available</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
              {displayed.map(c => <CouponCard key={c.id} coupon={c} onClick={setSelected} />)}
            </div>
          </>
        )}
      </main>

      {selected && (
        <DetailModal
          coupon={coupons.find(c => c.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onClaim={handleClaim}
          onPurchase={handlePurchase}
          currentUserId={session.user.id}
        />
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}

      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #C4C4C0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E4DC; border-radius: 3px; }
      `}</style>
    </div>
  );
}
