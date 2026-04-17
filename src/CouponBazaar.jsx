import { useState, useEffect, useMemo, useCallback } from "react";

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

const CURRENT_USER = { id: "u1", name: "You", initials: "YO" };

const uid = () => Math.random().toString(36).slice(2, 9);

const fut = (days) => new Date(Date.now() + days * 86400000).toISOString();
const past = (h) => new Date(Date.now() - h * 3600000).toISOString();

const INITIAL_COUPONS = [
  { id: "s1", title: "₹50 cashback on mobile recharge", code: "GPAY50RCH",
    description: "Get ₹50 cashback on mobile recharge of ₹200 or more using GPay. Valid once per user. Offer applies to all operators.",
    platform: "gpay", discount: "₹50 cashback", isFree: true, sellingPrice: 0,
    validUntil: fut(6), status: "active", inactiveReason: null,
    sellerId: "u2", sellerName: "Arun K.", createdAt: past(2), claimedBy: null },
  { id: "s2", title: "₹100 off first PhonePe order", code: "PPE100FIRST",
    description: "Use this code for ₹100 discount on your first order via PhonePe. Minimum order value ₹399. Valid for new users only.",
    platform: "phonepe", discount: "₹100 off", isFree: false, sellingPrice: 15,
    validUntil: fut(3), status: "active", inactiveReason: null,
    sellerId: "u3", sellerName: "Priya S.", createdAt: past(5), claimedBy: null },
  { id: "s3", title: "Swiggy 40% off weekends", code: "SWGY40WKND",
    description: "Flat 40% off on Swiggy orders every Saturday and Sunday. Maximum discount ₹80. Applicable on select restaurants.",
    platform: "swiggy", discount: "40% off", isFree: false, sellingPrice: 20,
    validUntil: fut(10), status: "active", inactiveReason: null,
    sellerId: "u4", sellerName: "Karthik R.", createdAt: past(1), claimedBy: null },
  { id: "s4", title: "Zomato Gold 3-month trial", code: "ZGOLD3MTH",
    description: "Activate 3 months of Zomato Gold membership absolutely free. New users and lapsed members only. One code per account.",
    platform: "zomato", discount: "3 months free", isFree: true, sellingPrice: 0,
    validUntil: fut(2), status: "active", inactiveReason: null,
    sellerId: "u5", sellerName: "Divya M.", createdAt: past(0.5), claimedBy: null },
  { id: "s5", title: "Amazon ₹200 electronics voucher", code: "AMZ200ELEC",
    description: "Get ₹200 off on electronics purchase of ₹1000 or more on Amazon India. Single use code. Non-transferable after redemption.",
    platform: "amazon", discount: "₹200 off", isFree: false, sellingPrice: 30,
    validUntil: fut(15), status: "active", inactiveReason: null,
    sellerId: "u6", sellerName: "Vikram P.", createdAt: past(4), claimedBy: null },
  { id: "s6", title: "Flipkart 500 SuperCoins transfer", code: "FLK500COIN",
    description: "Transfer 500 SuperCoins worth approx ₹50 to your Flipkart account. Contact seller for account transfer process.",
    platform: "flipkart", discount: "500 coins", isFree: false, sellingPrice: 25,
    validUntil: fut(7), status: "active", inactiveReason: null,
    sellerId: "u7", sellerName: "Meena L.", createdAt: past(6), claimedBy: null },
  { id: "s7", title: "Big Bazaar ₹150 physical coupon", code: "BB150SAVE",
    description: "Physical coupon valid at any Big Bazaar outlet across India. Minimum purchase ₹800. Single use only. Contact seller to claim.",
    platform: "physical", discount: "₹150 off", isFree: false, sellingPrice: 10,
    validUntil: fut(20), status: "active", inactiveReason: null,
    sellerId: "u8", sellerName: "Ravi T.", createdAt: past(8), claimedBy: null },
  { id: "s8", title: "Paytm ₹75 on utility bill payment", code: "PAYTMBILL75",
    description: "₹75 cashback on electricity or water bill payment via Paytm. Minimum bill amount ₹500. Credited within 48 hours.",
    platform: "paytm", discount: "₹75 cashback", isFree: true, sellingPrice: 0,
    validUntil: fut(4), status: "active", inactiveReason: null,
    sellerId: "u9", sellerName: "Sanjay V.", createdAt: past(12), claimedBy: null },
  { id: "s9", title: "GPay ₹30 on first UPI payment", code: "GPAYUPI30",
    description: "Earn ₹30 cashback on your first UPI payment through GPay. Applicable on any merchant payment above ₹100.",
    platform: "gpay", discount: "₹30 cashback", isFree: true, sellingPrice: 0,
    validUntil: fut(9), status: "active", inactiveReason: null,
    sellerId: "u10", sellerName: "Nisha R.", createdAt: past(3), claimedBy: null },
  { id: "s10", title: "Amazon 10% off fashion", code: "AMZFASH10",
    description: "Get 10% off on fashion & clothing orders above ₹600 on Amazon. Maximum discount ₹150. Offer valid on select styles.",
    platform: "amazon", discount: "10% off", isFree: false, sellingPrice: 12,
    validUntil: fut(5), status: "active", inactiveReason: null,
    sellerId: "u11", sellerName: "Teja K.", createdAt: past(7), claimedBy: null },
];

const EMPTY_FORM = {
  title: "", code: "", description: "", platform: "gpay",
  discount: "", isFree: true, sellingPrice: "", validUntil: "",
};

const daysLeft = (iso) => {
  const diff = new Date(iso) - Date.now();
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d === 0) return `${h}h left`;
  return `${d}d ${h}h left`;
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

function StatusBadge({ coupon }) {
  if (coupon.status === "inactive") {
    const map = { claimed: ["Claimed", "#059669", "#ECFDF5"], purchased: ["Purchased", "#2563EB", "#EFF6FF"], expired: ["Expired", "#9CA3AF", "#F3F4F6"] };
    const [label, color, bg] = map[coupon.inactiveReason] || ["Inactive", "#9CA3AF", "#F3F4F6"];
    return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{label}</span>;
  }
  const diff = new Date(coupon.validUntil) - Date.now();
  if (diff < 86400000)
    return <span style={{ background: "#FEF3C7", color: "#D97706", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Expiring soon</span>;
  return <span style={{ background: "#ECFDF5", color: "#059669", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>Active</span>;
}

function CouponCard({ coupon, onClick }) {
  const isInactive = coupon.status === "inactive";
  return (
    <div
      onClick={() => onClick(coupon)}
      style={{
        background: "#fff", borderRadius: 16, border: "1.5px solid #F0EFE8",
        padding: "20px", cursor: "pointer", position: "relative", overflow: "hidden",
        transition: "all 0.18s ease",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#F59E0B";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(245,158,11,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#F0EFE8";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {isInactive && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(255,255,255,0.88)",
          zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: 16, backdropFilter: "blur(2px)",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>
              {coupon.inactiveReason === "expired" ? "⏰" : "✅"}
            </div>
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
          {coupon.status === "active" && (
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{daysLeft(coupon.validUntil)}</span>
          )}
        </div>
      </div>

      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#1C1C1E", lineHeight: 1.4 }}>
        {coupon.title}
      </h3>
      <p style={{
        margin: "0 0 16px", fontSize: 13, color: "#6B7280", lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {coupon.description}
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>{coupon.discount}</span>
        {coupon.isFree ? (
          <span style={{ background: "#ECFDF5", color: "#059669", padding: "5px 14px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>FREE</span>
        ) : (
          <span style={{ background: "#FEF3C7", color: "#D97706", padding: "5px 14px", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>₹{coupon.sellingPrice}</span>
        )}
      </div>

      <div style={{ paddingTop: 12, borderTop: "1px solid #F5F5F3", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#D97706" }}>
            {coupon.sellerName.charAt(0)}
          </div>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>{coupon.sellerName}</span>
        </div>
        <span style={{ fontSize: 12, color: "#C4C4C0" }}>{timeAgo(coupon.createdAt)}</span>
      </div>
    </div>
  );
}

function Modal({ onClose, children, title }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 20, maxWidth: 500, width: "100%", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px 0" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1C1C1E" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "#F5F5F3", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 18, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
}

function DetailModal({ coupon: initialCoupon, coupons, onClose, onClaim, onPurchase }) {
  const coupon = coupons.find(c => c.id === initialCoupon.id) || initialCoupon;
  const [step, setStep] = useState("detail");
  const [copied, setCopied] = useState(false);
  const isOwn = coupon.sellerId === CURRENT_USER.id;
  const isClaimedByMe = coupon.claimedBy === CURRENT_USER.id;
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
      {/* Platform header */}
      <div style={{ background: cfg.bg, borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.text, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700 }}>
          {cfg.icon}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: cfg.text, fontSize: 15 }}>{cfg.label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#1C1C1E" }}>{coupon.discount}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <StatusBadge coupon={coupon} />
        </div>
      </div>

      <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1C1C1E" }}>{coupon.title}</h3>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{coupon.description}</p>

      {/* Info row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          ["Expires", expiryDate],
          ["Time left", daysLeft(coupon.validUntil)],
          ["Listed by", coupon.sellerName],
          ["Price", coupon.isFree ? "Free" : `₹${coupon.sellingPrice}`],
        ].map(([label, value]) => (
          <div key={label} style={{ background: "#FAFAF9", borderRadius: 10, padding: "10px 14px", border: "1px solid #F0EFE8" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1C1E" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Coupon code section */}
      {canSee ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Coupon Code</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, background: "#F5F5F3", borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#1C1C1E", letterSpacing: 2, border: "1.5px dashed #E5E4DC" }}>
              {coupon.code}
            </div>
            <button
              onClick={copyCode}
              style={{ background: copied ? "#ECFDF5" : "#F5F5F3", color: copied ? "#059669" : "#6B7280", border: "none", borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      ) : coupon.status === "active" && step === "detail" ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9CA3AF", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Coupon Code</div>
          <div style={{ background: "#F5F5F3", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, border: "1.5px dashed #E5E4DC" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#C4C4C0", letterSpacing: 4, flex: 1 }}>• • • • • • • •</div>
            <span style={{ fontSize: 12, color: "#9CA3AF" }}>Unlock to reveal</span>
          </div>
        </div>
      ) : null}

      {/* Action area */}
      {coupon.status === "inactive" ? (
        <div style={{ background: "#F9F9F9", borderRadius: 12, padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
          This coupon is no longer available
        </div>
      ) : isOwn ? (
        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "#2563EB", fontWeight: 500, textAlign: "center" }}>
          This is your listing — code is always visible to you
        </div>
      ) : step === "detail" ? (
        coupon.isFree ? (
          <button
            onClick={() => { onClaim(coupon); }}
            style={{ width: "100%", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            Claim for Free
          </button>
        ) : (
          <div>
            <div style={{ background: "#FEF3C7", borderRadius: 12, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, color: "#92400E" }}>Price to unlock code</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#D97706" }}>₹{coupon.sellingPrice}</span>
            </div>
            <button
              onClick={() => setStep("payment")}
              style={{ width: "100%", background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 16, fontWeight: 700, cursor: "pointer" }}
            >
              Buy for ₹{coupon.sellingPrice}
            </button>
          </div>
        )
      ) : step === "payment" ? (
        <div>
          <div style={{ background: "#FAFAF9", borderRadius: 12, padding: "20px", marginBottom: 16, border: "1px solid #F0EFE8", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>Amount to pay</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1C1C1E" }}>₹{coupon.sellingPrice}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>to {coupon.sellerName}</div>
          </div>
          <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16, textAlign: "center", lineHeight: 1.5 }}>
            In a live app, payment would be processed here via UPI/GPay/PhonePe. Click below to simulate.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep("detail")}
              style={{ flex: 1, background: "#F5F5F3", color: "#6B7280", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
            >
              Back
            </button>
            <button
              onClick={() => { onPurchase(coupon); setStep("success"); }}
              style={{ flex: 2, background: "#16A34A", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
            >
              Confirm Payment
            </button>
          </div>
        </div>
      ) : step === "success" ? (
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#059669", marginBottom: 4 }}>Payment successful!</div>
          <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>Coupon code has been unlocked</div>
          <div style={{ background: "#F5F5F3", borderRadius: 10, padding: "14px 20px", fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: "#1C1C1E", letterSpacing: 3, border: "1.5px dashed #E5E4DC", marginBottom: 16 }}>
            {coupon.code}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(coupon.code).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ background: copied ? "#ECFDF5" : "#F5F5F3", color: copied ? "#059669" : "#6B7280", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      ) : null}
    </Modal>
  );
}

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.code.trim()) e.code = "Coupon code is required";
    if (!form.discount.trim()) e.discount = "Discount description is required";
    if (!form.validUntil) e.validUntil = "Expiry date is required";
    if (new Date(form.validUntil) <= new Date()) e.validUntil = "Date must be in the future";
    if (!form.isFree && (!form.sellingPrice || Number(form.sellingPrice) <= 0)) e.sellingPrice = "Enter a valid price";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd(form);
  };

  const inp = (label, key, placeholder, opts = {}) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label} {!opts.optional && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      <input
        value={form[key]}
        onChange={e => { set(key, e.target.value); setErrors(prev => ({ ...prev, [key]: null })); }}
        placeholder={placeholder}
        type={opts.type || "text"}
        min={opts.min}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
          border: `1.5px solid ${errors[key] ? "#EF4444" : "#E5E4DC"}`,
          outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFAF9",
        }}
      />
      {errors[key] && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  return (
    <Modal onClose={onClose} title="Share a Coupon">
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Platform <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <select
          value={form.platform}
          onChange={e => set("platform", e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, border: "1.5px solid #E5E4DC", outline: "none", boxSizing: "border-box", background: "#FAFAF9", fontFamily: "inherit" }}
        >
          {Object.entries(PLATFORM_CONFIG).map(([id, cfg]) => (
            <option key={id} value={id}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {inp("Coupon Title", "title", "e.g. ₹50 cashback on recharge")}
      {inp("Coupon / Offer Code", "code", "e.g. GPAY50RCH")}
      {inp("Discount Value", "discount", "e.g. ₹50 off, 20% cashback")}

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Description <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Terms, conditions, minimum order amount..."
          rows={3}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14, border: "1.5px solid #E5E4DC", outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", background: "#FAFAF9" }}
        />
      </div>

      {inp("Valid Until", "validUntil", "", { type: "date", min: today() })}

      {/* Pricing type */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
          Listing Type <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[["true", "Free", "Share for free", "#ECFDF5", "#059669"], ["false", "Paid", "Set a price", "#FEF3C7", "#D97706"]].map(([val, label, sub, bg, color]) => (
            <div
              key={val}
              onClick={() => set("isFree", val === "true")}
              style={{
                padding: "14px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                border: `2px solid ${String(form.isFree) === val ? color : "#E5E4DC"}`,
                background: String(form.isFree) === val ? bg : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: String(form.isFree) === val ? color : "#374151" }}>{label}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {!form.isFree && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Selling Price (₹) <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "#D97706" }}>₹</span>
            <input
              value={form.sellingPrice}
              onChange={e => { set("sellingPrice", e.target.value); setErrors(prev => ({ ...prev, sellingPrice: null })); }}
              placeholder="e.g. 20"
              type="number"
              min="1"
              style={{
                width: "100%", padding: "10px 14px 10px 28px", borderRadius: 10, fontSize: 14,
                border: `1.5px solid ${errors.sellingPrice ? "#EF4444" : "#E5E4DC"}`,
                outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#FAFAF9",
              }}
            />
          </div>
          {errors.sellingPrice && <div style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.sellingPrice}</div>}
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>Keep it fair — buyers pay this to unlock the code</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button
          onClick={onClose}
          style={{ flex: 1, background: "#F5F5F3", color: "#6B7280", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{ flex: 2, background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          List Coupon
        </button>
      </div>
    </Modal>
  );
}

export default function CouponBazaar() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [tab, setTab] = useState("browse");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Auto-expire check
  useEffect(() => {
    const check = () => {
      setCoupons(prev => prev.map(c =>
        c.status === "active" && new Date(c.validUntil) < new Date()
          ? { ...c, status: "inactive", inactiveReason: "expired" }
          : c
      ));
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  const myListings = useMemo(() => coupons.filter(c => c.sellerId === CURRENT_USER.id), [coupons]);
  const myClaimed  = useMemo(() => coupons.filter(c => c.claimedBy === CURRENT_USER.id), [coupons]);
  const activeCount = useMemo(() => coupons.filter(c => c.status === "active").length, [coupons]);

  const displayed = useMemo(() => {
    if (tab === "listings") return myListings;
    if (tab === "claimed")  return myClaimed;
    return coupons.filter(c => {
      if (c.status !== "active") return false;
      if (platformFilter !== "all" && c.platform !== platformFilter) return false;
      if (priceFilter === "free" && !c.isFree) return false;
      if (priceFilter === "paid" && c.isFree) return false;
      const q = search.toLowerCase().trim();
      if (q) {
        const hay = `${c.title} ${c.platform} ${c.discount} ${c.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [coupons, tab, platformFilter, priceFilter, search, myListings, myClaimed]);

  const handleClaim = useCallback((coupon) => {
    setCoupons(prev => prev.map(c =>
      c.id === coupon.id
        ? { ...c, status: "inactive", inactiveReason: "claimed", claimedBy: CURRENT_USER.id }
        : c
    ));
    showToast("Coupon claimed! The code is now visible.");
  }, [showToast]);

  const handlePurchase = useCallback((coupon) => {
    setCoupons(prev => prev.map(c =>
      c.id === coupon.id
        ? { ...c, status: "inactive", inactiveReason: "purchased", claimedBy: CURRENT_USER.id }
        : c
    ));
    showToast(`Payment of ₹${coupon.sellingPrice} confirmed. Code unlocked!`);
  }, [showToast]);

  const handleAdd = useCallback((form) => {
    const newCoupon = {
      id: uid(),
      ...form,
      sellingPrice: form.isFree ? 0 : Number(form.sellingPrice),
      validUntil: new Date(form.validUntil + "T23:59:59").toISOString(),
      status: "active",
      inactiveReason: null,
      sellerId: CURRENT_USER.id,
      sellerName: CURRENT_USER.name,
      createdAt: new Date().toISOString(),
      claimedBy: null,
    };
    setCoupons(prev => [newCoupon, ...prev]);
    setShowAdd(false);
    showToast("Coupon listed successfully! Others can now claim or buy it.");
  }, [showToast]);

  const TABS = [
    { id: "browse",   label: "Browse",     count: activeCount },
    { id: "listings", label: "My Listings", count: myListings.length },
    { id: "claimed",  label: "Claimed",     count: myClaimed.length },
  ];

  const PLATFORM_FILTERS = [
    { id: "all", label: "All Platforms" },
    ...Object.entries(PLATFORM_CONFIG).map(([id, v]) => ({ id, label: v.label })),
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", background: "#FAFAF9", color: "#1C1C1E" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999, maxWidth: 340,
          background: toast.type === "error" ? "#FEF2F2" : "#F0FDF4",
          border: `1px solid ${toast.type === "error" ? "#FECACA" : "#BBF7D0"}`,
          color: toast.type === "error" ? "#DC2626" : "#16A34A",
          padding: "12px 18px", borderRadius: 12, fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)", animation: "slideIn 0.2s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ background: "#fff", borderBottom: "1px solid #F0EFE8", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 16, height: 66 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, background: "#F59E0B", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🏷️
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19, color: "#1C1C1E", lineHeight: 1 }}>CouponBazaar</div>
              <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 500, letterSpacing: 0.5 }}>SHARE · SELL · SAVE</div>
            </div>
          </div>

          <div style={{ flex: 1, maxWidth: 460 }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3AF" }}>🔍</span>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); if (tab !== "browse") setTab("browse"); }}
                placeholder="Search coupons, platforms..."
                style={{ width: "100%", padding: "9px 14px 9px 36px", borderRadius: 11, border: "1.5px solid #E5E4DC", background: "#FAFAF9", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 11, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#E5920A"}
            onMouseLeave={e => e.currentTarget.style.background = "#F59E0B"}
          >
            + Share Coupon
          </button>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #F0EFE8" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 20px", display: "flex" }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
                fontWeight: tab === t.id ? 700 : 500, fontSize: 14,
                color: tab === t.id ? "#D97706" : "#6B7280",
                borderBottom: `2.5px solid ${tab === t.id ? "#F59E0B" : "transparent"}`,
                display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {t.label}
              <span style={{
                background: tab === t.id ? "#FEF3C7" : "#F3F4F6",
                color: tab === t.id ? "#D97706" : "#9CA3AF",
                fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
              }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters (browse only) ── */}
      {tab === "browse" && (
        <div style={{ background: "#fff", borderBottom: "1px solid #F0EFE8", overflowX: "auto" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 20px", display: "flex", gap: 7, alignItems: "center" }}>
            {PLATFORM_FILTERS.map(p => (
              <button
                key={p.id}
                onClick={() => setPlatformFilter(p.id)}
                style={{
                  padding: "6px 14px", borderRadius: 20,
                  border: `1.5px solid ${platformFilter === p.id ? "#F59E0B" : "#E5E4DC"}`,
                  background: platformFilter === p.id ? "#FEF3C7" : "#fff",
                  color: platformFilter === p.id ? "#D97706" : "#6B7280",
                  fontWeight: platformFilter === p.id ? 700 : 500,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.13s", fontFamily: "inherit",
                }}
              >
                {p.label}
              </button>
            ))}
            <div style={{ width: 1, height: 22, background: "#E5E4DC", margin: "0 4px", flexShrink: 0 }} />
            {[["all", "All"], ["free", "🆓 Free"], ["paid", "💰 Paid"]].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setPriceFilter(val)}
                style={{
                  padding: "6px 14px", borderRadius: 20,
                  border: `1.5px solid ${priceFilter === val ? "#10B981" : "#E5E4DC"}`,
                  background: priceFilter === val ? "#ECFDF5" : "#fff",
                  color: priceFilter === val ? "#059669" : "#6B7280",
                  fontWeight: priceFilter === val ? 700 : 500,
                  fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                  transition: "all 0.13s", fontFamily: "inherit",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 20px" }}>
        {/* Section header */}
        {tab === "listings" && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1C1C1E" }}>My Listings</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#9CA3AF" }}>Coupons you have shared or put up for sale</p>
          </div>
        )}
        {tab === "claimed" && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#1C1C1E" }}>Claimed Coupons</h2>
            <p style={{ margin: 0, fontSize: 14, color: "#9CA3AF" }}>Coupons you have claimed or purchased</p>
          </div>
        )}

        {displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>
              {tab === "browse" ? "🔍" : tab === "listings" ? "📋" : "📦"}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
              {tab === "browse" ? "No coupons found" : tab === "listings" ? "No listings yet" : "Nothing claimed yet"}
            </div>
            <div style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
              {tab === "browse" ? "Try changing your filters or search something else" :
               tab === "listings" ? "Start by sharing a coupon you are not using" :
               "Browse and claim free coupons or buy discounted ones"}
            </div>
            {tab !== "browse" && (
              <button
                onClick={() => tab === "listings" ? setShowAdd(true) : setTab("browse")}
                style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 12, padding: "12px 28px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
              >
                {tab === "listings" ? "+ Share a Coupon" : "Browse Coupons"}
              </button>
            )}
          </div>
        ) : (
          <>
            {tab === "browse" && (
              <div style={{ marginBottom: 16, fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>
                {displayed.length} active coupon{displayed.length !== 1 ? "s" : ""} available
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
              {displayed.map(c => (
                <CouponCard key={c.id} coupon={c} onClick={setSelected} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selected && (
        <DetailModal
          coupon={selected}
          coupons={coupons}
          onClose={() => setSelected(null)}
          onClaim={(c) => { handleClaim(c); }}
          onPurchase={(c) => { handlePurchase(c); }}
        />
      )}

      {/* ── Add Modal ── */}
      {showAdd && (
        <AddModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; }
        input::placeholder { color: #C4C4C0; }
        textarea::placeholder { color: #C4C4C0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E5E4DC; border-radius: 3px; }
      `}</style>
    </div>
  );
}
