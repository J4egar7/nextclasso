// Small product picture for the cart, saved items, checkout and order
// history. Shows the real photo (fully, never cropped) when the product has
// one, and falls back to its emoji.
export default function ItemThumb({ item, fallback = "🛍️" }) {
  const src = item?.images?.[0] || item?.image;
  if (src) return <img className="item-thumb-img" src={src} alt="" loading="lazy" />;
  return item?.emoji || fallback;
}
