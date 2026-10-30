// Single place that turns a Supabase `products` row into the shape the
// storefront uses. Used by the browser store (live updates) and by the
// server-side fetch (first render), so both always agree.

// Only public-safe columns. manufacturing_cost is deliberately NOT here.
export const PUBLIC_COLUMNS =
  "id, name, brand, category, price, price_num, stock, description, weight, weight_unit, images, emoji, bg, badge, rating, reviews, purchases, views";

// Card photos always sit on a neutral white background. Colour comes from a
// per-product accent instead: a vivid outline and "+" button. The accent is
// derived from the product id, so it looks random across the catalogue but is
// always the same colour for the same product (no flicker between visits).
export const CARD_BG = "#FFFFFF";

const ACCENTS = [
  "#E11D74", // raspberry
  "#0891B2", // teal
  "#16A34A", // green
  "#EA580C", // orange
  "#2563EB", // blue
  "#DC2626", // red
  "#0D9488", // emerald
  "#C026D3", // fuchsia
  "#D97706", // amber
  "#4F46E5", // indigo
  "#DB2777", // pink
  "#0284C7", // sky
];

export function colourThemeFor(row) {
  const key = String(row.id ?? row.name ?? "");
  // FNV-1a then a final mix, so consecutive ids do not get consecutive colours.
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15; h = Math.imul(h, 2246822519); h ^= h >>> 13;
  return { bg: CARD_BG, accent: ACCENTS[(h >>> 0) % ACCENTS.length] };
}

const digitsToInt = (s) => parseInt(String(s ?? "").replace(/[^0-9]/g, ""), 10) || 0;

// "3200", "Rs 3200", "PKR 3,200" all become "PKR 3,200" so every card on
// the site shows prices the same way no matter how the admin typed them.
export function formatPKR(n) {
  return `PKR ${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
}

export function mapRowToProduct(row) {
  const priceNum = Number(row.price_num) > 0 ? Number(row.price_num) : digitsToInt(row.price);
  const theme = colourThemeFor(row);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: priceNum > 0 ? formatPKR(priceNum) : row.price,
    priceNum,
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
