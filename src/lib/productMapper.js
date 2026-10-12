// Single place that turns a Supabase `products` row into the shape the
// storefront uses. Used by the browser store (live updates) and by the
// server-side fetch (first render), so both always agree.

// Only public-safe columns. manufacturing_cost is deliberately NOT here.
export const PUBLIC_COLUMNS =
  "id, name, brand, category, price, price_num, old_price, stock, description, weight, weight_unit, images, emoji, bg, badge, rating, reviews, purchases, views";

// Every product gets a colour theme: a card background plus an accent used
// for its outline, glow, badge and add button. If the admin picked a
// background preset, that preset's accent is used. Otherwise a theme is
// chosen from the product's id, so the same product is always the same
// colour and neighbouring products differ.
const PALETTE = [
  { accent: "#FF5E8A", bg: "linear-gradient(135deg,#FFD6E7,#FF9EBF)" }, // pink
  { accent: "#10B981", bg: "linear-gradient(135deg,#D4F5E9,#7DDDB5)" }, // mint
  { accent: "#FF8A4C", bg: "linear-gradient(135deg,#FFE0CC,#FFA66E)" }, // peach
  { accent: "#8B5CF6", bg: "linear-gradient(135deg,#E8D5F5,#B794F6)" }, // lilac
  { accent: "#0EA5E9", bg: "linear-gradient(135deg,#E0F2FE,#7DD3FC)" }, // sky
  { accent: "#F5B700", bg: "linear-gradient(135deg,#FFF8CC,#FFE066)" }, // butter
  { accent: "#E11D74", bg: "linear-gradient(135deg,#F8C8D4,#F4799B)" }, // rose
  { accent: "#FF5E5B", bg: "linear-gradient(135deg,#FFE1DE,#FF9C97)" }, // coral
];

// The admin's BG_PRESETS (src/data/constants.js) mapped to an accent colour.
const PRESET_ACCENTS = {
  "linear-gradient(135deg,#FFD6E7,#FFACC7)": "#FF5E8A", // Pink
  "linear-gradient(135deg,#D4F5E9,#A8E6CF)": "#10B981", // Mint
  "linear-gradient(135deg,#FFE0CC,#FFAB73)": "#FF8A4C", // Peach
  "linear-gradient(135deg,#E8D5F5,#C9A8F0)": "#8B5CF6", // Lilac
  "linear-gradient(135deg,#E0F2FE,#BAE6FD)": "#0EA5E9", // Sky
  "linear-gradient(135deg,#FFFDE7,#FFF59D)": "#F5B700", // Butter
  "linear-gradient(135deg,#F3E5D8,#E8D5C4)": "#B8825A", // Sand
  "linear-gradient(135deg,#F8C8D4,#F4A0B5)": "#E11D74", // Rose
  "linear-gradient(135deg,#E8EAF6,#C5CAE9)": "#6366F1", // Slate
  "linear-gradient(135deg,#212121,#424242)": "#6B7280", // Ink
};

export function colourThemeFor(row) {
  const key = String(row.id ?? row.name ?? "");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  const fallback = PALETTE[h % PALETTE.length];
  const bg = (row.bg || "").trim();
  if (!bg) return fallback;
  return { bg, accent: PRESET_ACCENTS[bg] || fallback.accent };
}

const digitsToInt = (s) => parseInt(String(s ?? "").replace(/[^0-9]/g, ""), 10) || 0;

// "3200", "Rs 3200", "PKR 3,200" all become "PKR 3,200" so every card on
// the site shows prices the same way no matter how the admin typed them.
export function formatPKR(n) {
  return `PKR ${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
}

export function mapRowToProduct(row) {
  const priceNum = Number(row.price_num) > 0 ? Number(row.price_num) : digitsToInt(row.price);
  const oldNum = digitsToInt(row.old_price);
  const theme = colourThemeFor(row);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: priceNum > 0 ? formatPKR(priceNum) : row.price,
    priceNum,
    old: oldNum > 0 ? formatPKR(oldNum) : row.old_price,
    stock: row.stock,
    description: row.description,
    desc: row.description,
    weight: row.weight,
    weightUnit: row.weight_unit,
    images: row.images || [],
    emoji: row.emoji,
    bg: theme.bg,
    accent: theme.accent,
    badge: row.badge,
    rating: row.rating,
    reviews: row.reviews,
    purchases: row.purchases,
    views: row.views,
  };
}
