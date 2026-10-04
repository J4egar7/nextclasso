// Misc shared constants used by the admin panel and the Skincare/Makeup
// browse pages.
//
// These are the actual fine-grained categories the storefront filters and
// tabs by (Skincare page: Cleansers/Serums/etc, Makeup page: Lips/Eyes/etc).
// The admin category dropdown uses this same list so a product an admin
// adds actually shows up correctly filtered and tabbed on the right page —
// previously the admin form only offered broad buckets ("Skincare",
// "Makeup") which didn't match any of the fine-grained tabs those pages
// filter by, so admin-added products could only ever appear under "All".
const WEIGHT_UNITS = ["g","ml","fl oz","oz","kg","L"];

const SKINCARE_CATEGORIES = ["Cleansers","Serums","Moisturisers","SPF","Masks","Eye Care","Toners","Oils"];
const MAKEUP_CATEGORIES = ["Lips","Eyes","Face","Nails","Cheeks","Primers","Tools"];
// Shown on their own pages: "Fragrance" on /fragrances and "Hair & Body" on
// /hair-care (not on the Skincare or Makeup browse pages).
const OTHER_CATEGORIES = ["Fragrance","Hair & Body"];

const CATEGORIES = [...SKINCARE_CATEGORIES, ...MAKEUP_CATEGORIES, ...OTHER_CATEGORIES];

const BADGES = ["", "bestseller", "new", "dermatologist", "k-beauty", "luxury", "cult fav", "icon"];

// Curated card-background gradients admins can pick from in place of
// typing raw CSS — keeps the storefront's visual style consistent.
const BG_PRESETS = [
  { label: "Pink",   value: "linear-gradient(135deg,#FFD6E7,#FFACC7)" },
  { label: "Mint",   value: "linear-gradient(135deg,#D4F5E9,#A8E6CF)" },
  { label: "Peach",  value: "linear-gradient(135deg,#FFE0CC,#FFAB73)" },
  { label: "Lilac",  value: "linear-gradient(135deg,#E8D5F5,#C9A8F0)" },
  { label: "Sky",    value: "linear-gradient(135deg,#E0F2FE,#BAE6FD)" },
  { label: "Butter", value: "linear-gradient(135deg,#FFFDE7,#FFF59D)" },
  { label: "Sand",   value: "linear-gradient(135deg,#F3E5D8,#E8D5C4)" },
  { label: "Rose",   value: "linear-gradient(135deg,#F8C8D4,#F4A0B5)" },
  { label: "Slate",  value: "linear-gradient(135deg,#E8EAF6,#C5CAE9)" },
  { label: "Ink",    value: "linear-gradient(135deg,#212121,#424242)" },
];

export { WEIGHT_UNITS, CATEGORIES, SKINCARE_CATEGORIES, MAKEUP_CATEGORIES, OTHER_CATEGORIES, BADGES, BG_PRESETS };
