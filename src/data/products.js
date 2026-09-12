// Product catalogs for each section of the site

const homeProducts = [
  { id:1, emoji:"🌸", brand:"LANEIGE", name:"Water Sleeping Mask", price:"PKR 3,200", old:"PKR 4,100", rating:4.9, reviews:812, badge:"bestseller", bg:"linear-gradient(135deg,#FFD6E7,#FFACC7)" },
  { id:2, emoji:"🌿", brand:"SOME BY MI", name:"AHA BHA PHA Toner", price:"PKR 2,800", old:"PKR 3,500", rating:4.8, reviews:634, badge:"new", bg:"linear-gradient(135deg,#D4F5E9,#A8E6CF)" },
  { id:3, emoji:"✨", brand:"FENTY BEAUTY", name:"Pro Filt'r Foundation", price:"PKR 6,500", old:"PKR 8,200", rating:4.9, reviews:1024, badge:"bestseller", bg:"linear-gradient(135deg,#FFE0CC,#FFAB73)" },
  { id:4, emoji:"💄", brand:"CHARLOTTE T.", name:"Pillow Talk Lipstick", price:"PKR 4,100", old:null, rating:4.7, reviews:523, badge:"new", bg:"linear-gradient(135deg,#F8C8D4,#F4A0B5)" },
];

const skincareProducts = [
  // Cleansers
  { id:10, emoji:"🌙", brand:"CERAVE", name:"Hydrating Facial Cleanser", price:"PKR 1,800", priceNum:1800, desc:"Gentle non-foaming cleanser with ceramides for normal to dry skin", badge:"bestseller", bg:"linear-gradient(135deg,#E8D5F5,#C9A8F0)", rating:4.9, reviews:2103, purchases:8400, views:32000, category:"Cleansers" },
  { id:16, emoji:"🫧", brand:"LA ROCHE-POSAY", name:"Toleriane Hydrating Cleanser", price:"PKR 2,400", priceNum:2400, desc:"Ultra-gentle cleanser for sensitive and reactive skin types", badge:"dermatologist", bg:"linear-gradient(135deg,#E0F2FE,#BAE6FD)", rating:4.8, reviews:1540, purchases:5200, views:19000, category:"Cleansers" },
  { id:17, emoji:"🍑", brand:"FRESH", name:"Soy Face Cleanser", price:"PKR 4,200", priceNum:4200, desc:"Award-winning gel-cream cleanser that removes makeup effortlessly", badge:null, bg:"linear-gradient(135deg,#FFDBB4,#FFC090)", rating:4.7, reviews:980, purchases:3100, views:14000, category:"Cleansers" },
  { id:18, emoji:"🌊", brand:"INNISFREE", name:"Green Tea Foam Cleanser", price:"PKR 1,600", priceNum:1600, desc:"Jeju green tea foam that gently purifies and calms the skin", badge:"k-beauty", bg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", rating:4.6, reviews:720, purchases:2800, views:11000, category:"Cleansers" },
  // Serums
  { id:11, emoji:"💧", brand:"THE ORDINARY", name:"Hyaluronic Acid 2% + B5", price:"PKR 1,200", priceNum:1200, desc:"Multi-weight HA with B5 for intense surface and below-surface hydration", badge:"cult fav", bg:"linear-gradient(135deg,#D4E8FF,#A8CAFE)", rating:4.8, reviews:1876, purchases:9200, views:41000, category:"Serums" },
  { id:12, emoji:"🌺", brand:"TATCHA", name:"The Dewy Serum", price:"PKR 9,800", priceNum:9800, desc:"Plumping bouncy serum with hyaluronic acid and leopard lily", badge:"luxury", bg:"linear-gradient(135deg,#FFD6E7,#FFC2D4)", rating:4.9, reviews:945, purchases:2100, views:18000, category:"Serums" },
  { id:19, emoji:"⚗️", brand:"SKINCEUTICALS", name:"C E Ferulic Serum", price:"PKR 14,500", priceNum:14500, desc:"Iconic vitamin C serum that neutralises free radicals and visibly firms skin", badge:"luxury", bg:"linear-gradient(135deg,#FFF9C4,#FFF176)", rating:5.0, reviews:1120, purchases:1800, views:22000, category:"Serums" },
  { id:20, emoji:"🌹", brand:"DRUNK ELEPHANT", name:"T.L.C. Framboos Serum", price:"PKR 11,200", priceNum:11200, desc:"Glycolic/lactic/tartaric/citric and salicylic acid blend for resurfacing", badge:null, bg:"linear-gradient(135deg,#FCE4EC,#F48FB1)", rating:4.7, reviews:840, purchases:2400, views:17000, category:"Serums" },
  { id:21, emoji:"🔬", brand:"PAULA'S CHOICE", name:"10% Niacinamide Booster", price:"PKR 3,600", priceNum:3600, desc:"Concentrated niacinamide serum visibly reduces pores and uneven skin tone", badge:"new", bg:"linear-gradient(135deg,#E8EAF6,#C5CAE9)", rating:4.8, reviews:1320, purchases:4700, views:26000, category:"Serums" },
  // Moisturisers
  { id:22, emoji:"🏔️", brand:"LA MER", name:"Crème de la Mer", price:"PKR 28,000", priceNum:28000, desc:"Legendary sea kelp Miracle Broth moisturiser for ultimate skin transformation", badge:"luxury", bg:"linear-gradient(135deg,#B2EBF2,#80DEEA)", rating:4.9, reviews:780, purchases:900, views:15000, category:"Moisturisers" },
  { id:23, emoji:"💦", brand:"NEUTROGENA", name:"Hydro Boost Water Gel", price:"PKR 2,800", priceNum:2800, desc:"Hyaluronic acid gel-cream that continuously releases hydration", badge:"bestseller", bg:"linear-gradient(135deg,#E0F7FA,#B2EBF2)", rating:4.8, reviews:3200, purchases:11000, views:48000, category:"Moisturisers" },
  { id:24, emoji:"🌾", brand:"FIRST AID BEAUTY", name:"Ultra Repair Cream", price:"PKR 3,400", priceNum:3400, desc:"Intense hydration for dry, distressed skin with colloidal oatmeal", badge:null, bg:"linear-gradient(135deg,#F3E5D8,#E8D5C4)", rating:4.7, reviews:1880, purchases:5600, views:21000, category:"Moisturisers" },
  { id:25, emoji:"🫐", brand:"SULWHASOO", name:"First Care Activating Serum", price:"PKR 8,400", priceNum:8400, desc:"Herbal Korean essence that activates skin's natural renewal cycle", badge:"k-beauty", bg:"linear-gradient(135deg,#EDE7F6,#D1C4E9)", rating:4.8, reviews:620, purchases:1400, views:9800, category:"Moisturisers" },
  // SPF
  { id:13, emoji:"☀️", brand:"ANUA", name:"Heartleaf Quercetinol SPF 50+", price:"PKR 2,400", priceNum:2400, desc:"Lightweight calming sunscreen with zero white cast — K-beauty darling", badge:"k-beauty", bg:"linear-gradient(135deg,#FFFDE7,#FFF59D)", rating:4.8, reviews:1523, purchases:6800, views:35000, category:"SPF" },
  { id:26, emoji:"🌅", brand:"ISNTREE", name:"Hyaluronic Acid Watery Sun Gel", price:"PKR 2,100", priceNum:2100, desc:"Water gel SPF 50+ that melts into skin with no greasiness whatsoever", badge:"new", bg:"linear-gradient(135deg,#FFF8E1,#FFECB3)", rating:4.7, reviews:890, purchases:3400, views:18000, category:"SPF" },
  { id:27, emoji:"🛡️", brand:"SUPERGOOP!", name:"Unseen Sunscreen SPF 40", price:"PKR 5,200", priceNum:5200, desc:"Invisible gel-formula SPF that doubles as a makeup primer", badge:null, bg:"linear-gradient(135deg,#F3F4F6,#E5E7EB)", rating:4.6, reviews:1100, purchases:2900, views:22000, category:"SPF" },
  // Masks
  { id:14, emoji:"🍯", brand:"LANEIGE", name:"Lip Sleeping Mask", price:"PKR 2,200", priceNum:2200, desc:"Overnight lip treatment with sweet vitamin complex for plump morning lips", badge:"bestseller", bg:"linear-gradient(135deg,#FFE0B2,#FFCC80)", rating:5.0, reviews:3012, purchases:12000, views:55000, category:"Masks" },
  { id:28, emoji:"🎭", brand:"SK-II", name:"Facial Treatment Mask", price:"PKR 6,800", priceNum:6800, desc:"Pitera-drenched sheet mask delivering 10 years of luminosity in 15 minutes", badge:"luxury", bg:"linear-gradient(135deg,#E8EAF6,#9FA8DA)", rating:4.9, reviews:1240, purchases:2200, views:19000, category:"Masks" },
  { id:29, emoji:"🌋", brand:"GLOW RECIPE", name:"Watermelon Glow Sleeping Mask", price:"PKR 4,600", priceNum:4600, desc:"Overnight AHA exfoliating mask with hyaluronic acid for glass skin", badge:null, bg:"linear-gradient(135deg,#FCE4EC,#EF9A9A)", rating:4.7, reviews:760, purchases:2800, views:16000, category:"Masks" },
  // Eye Care
  { id:30, emoji:"👁️", brand:"TATCHA", name:"Luminance Eye Cream", price:"PKR 7,200", priceNum:7200, desc:"Powerful brightening eye cream with Japanese superfoods for dark circles", badge:null, bg:"linear-gradient(135deg,#F8BBD9,#F48FB1)", rating:4.6, reviews:430, purchases:1100, views:8400, category:"Eye Care" },
  { id:31, emoji:"✨", brand:"OLEHENRIKSEN", name:"Banana Bright Eye Crème", price:"PKR 3,800", priceNum:3800, desc:"Vitamin C and banana powder blend to colour-correct and brighten instantly", badge:"new", bg:"linear-gradient(135deg,#FFFDE7,#FFF176)", rating:4.7, reviews:560, purchases:1800, views:12000, category:"Eye Care" },
  // Toners
  { id:15, emoji:"🌿", brand:"INNISFREE", name:"Green Tea Balancing Toner", price:"PKR 2,600", priceNum:2600, desc:"Antioxidant-rich toner from Jeju green tea to balance and refine pores", badge:"k-beauty", bg:"linear-gradient(135deg,#E8F5E9,#C8E6C9)", rating:4.7, reviews:887, purchases:3100, views:15000, category:"Toners" },
  { id:32, emoji:"🌸", brand:"SOME BY MI", name:"AHA BHA PHA 30 Days Miracle Toner", price:"PKR 2,800", priceNum:2800, desc:"Triple acid toner visibly transforms acne-prone skin in 30 days", badge:"cult fav", bg:"linear-gradient(135deg,#FCE4EC,#F8BBD9)", rating:4.8, reviews:2340, purchases:7600, views:38000, category:"Toners" },
  { id:33, emoji:"💎", brand:"COSRX", name:"Advanced Snail 96 Mucin Toner", price:"PKR 3,100", priceNum:3100, desc:"96% snail secretion filtrate toner for intense repair and hydration", badge:"bestseller", bg:"linear-gradient(135deg,#E8EAF6,#C5CAE9)", rating:4.9, reviews:1860, purchases:6900, views:32000, category:"Toners" },
  // Oils
  { id:34, emoji:"🫒", brand:"THE ORDINARY", name:"100% Organic Rosehip Seed Oil", price:"PKR 1,800", priceNum:1800, desc:"Cold-pressed rosehip oil rich in omega fatty acids for scar fading and glow", badge:null, bg:"linear-gradient(135deg,#FFCCBC,#FFAB91)", rating:4.6, reviews:1240, purchases:4200, views:21000, category:"Oils" },
  { id:35, emoji:"🌻", brand:"DRUNK ELEPHANT", name:"Virgin Marula Luxury Face Oil", price:"PKR 8,600", priceNum:8600, desc:"Potent, fast-absorbing marula oil for lasting hydration and luminosity", badge:"luxury", bg:"linear-gradient(135deg,#FFF9C4,#FFF176)", rating:4.8, reviews:680, purchases:1600, views:11000, category:"Oils" },
];

const makeupProducts = [
  // Lips
  { id:50, emoji:"👄", brand:"FENTY BEAUTY", name:"Gloss Bomb Universal Lip", price:"PKR 3,800", priceNum:3800, desc:"Explosive shine + colour in a universal peachy nude for all skin tones", badge:"bestseller", bg:"linear-gradient(135deg,#FFB3C6,#FF6B9D)", rating:4.9, reviews:4200, purchases:16000, views:72000, category:"Lips" },
  { id:51, emoji:"🌹", brand:"CHARLOTTE TILBURY", name:"Pillow Talk Lipstick", price:"PKR 4,100", priceNum:4100, desc:"The universally flattering rosy-nude lipstick in creamy matte finish", badge:"icon", bg:"linear-gradient(135deg,#F8C8D4,#F4A0B5)", rating:4.9, reviews:5600, purchases:18000, views:85000, category:"Lips" },
  { id:52, emoji:"💋", brand:"MAC", name:"Retro Matte Lipstick — Ruby Woo", price:"PKR 2,800", priceNum:2800, desc:"Iconic retro matte formula — the most famous red lip in beauty history", badge:"icon", bg:"linear-gradient(135deg,#FFCDD2,#EF9A9A)", rating:4.8, reviews:3800, purchases:12000, views:61000, category:"Lips" },
  { id:53, emoji:"✨", brand:"ARMANI BEAUTY", name:"Lip Maestro Velvet Lip", price:"PKR 5,400", priceNum:5400, desc:"Velvety liquid lip in a range of couture-inspired shades", badge:null, bg:"linear-gradient(135deg,#E8D5F5,#CE93D8)", rating:4.7, reviews:920, purchases:2800, views:14000, category:"Lips" },
  { id:54, emoji:"🍒", brand:"DIOR BEAUTY", name:"Addict Lip Glow Oil", price:"PKR 6,200", priceNum:6200, desc:"Glossy tinted lip oil with cherry oil for plumped, nourished lips", badge:"new", bg:"linear-gradient(135deg,#FFCDD2,#F48FB1)", rating:4.8, reviews:1480, purchases:4200, views:28000, category:"Lips" },
  // Eyes
  { id:55, emoji:"🎭", brand:"ABH", name:"Norvina Pro Pigment Palette", price:"PKR 7,200", priceNum:7200, desc:"Ultra-pigmented pressed powder eyeshadow palette with transition shades", badge:"limited", bg:"linear-gradient(135deg,#B3D9FF,#6DB8FF)", rating:4.9, reviews:2800, purchases:6400, views:38000, category:"Eyes" },
  { id:56, emoji:"🦋", brand:"URBAN DECAY", name:"Naked3 Eyeshadow Palette", price:"PKR 8,800", priceNum:8800, desc:"12 rosy and smoky neutrals with Rose Gold highlight and deep plum", badge:"bestseller", bg:"linear-gradient(135deg,#FCE4EC,#F8BBD9)", rating:4.8, reviews:3400, purchases:7200, views:44000, category:"Eyes" },
  { id:57, emoji:"🖤", brand:"BENEFIT", name:"BADgal BANG Mascara", price:"PKR 3,200", priceNum:3200, desc:"Volumising mascara with aerospace-derived formula for 36-hour wear", badge:"bestseller", bg:"linear-gradient(135deg,#212121,#424242)", rating:4.7, reviews:4100, purchases:14000, views:58000, category:"Eyes" },
  { id:58, emoji:"🌟", brand:"CHARLOTTE TILBURY", name:"Pillow Talk Push Up Lashes Mascara", price:"PKR 3,600", priceNum:3600, desc:"Curved wand lifts and curls for doe-eyed, fanned-out lashes", badge:"new", bg:"linear-gradient(135deg,#F3E5F5,#CE93D8)", rating:4.6, reviews:1220, purchases:3900, views:22000, category:"Eyes" },
  { id:59, emoji:"✏️", brand:"ANASTASIA BH", name:"Brow Wiz Micro-Pencil", price:"PKR 2,900", priceNum:2900, desc:"Ultra-slim retractable brow pencil for natural, hair-like strokes", badge:"cult fav", bg:"linear-gradient(135deg,#D7CCC8,#BCAAA4)", rating:4.9, reviews:5200, purchases:19000, views:78000, category:"Eyes" },
  // Face
  { id:60, emoji:"🌟", brand:"FENTY BEAUTY", name:"Pro Filt'r Soft Matte Foundation", price:"PKR 6,500", priceNum:6500, desc:"Buildable medium-to-full coverage matte foundation in 50 inclusive shades", badge:"bestseller", bg:"linear-gradient(135deg,#FFE0CC,#FFAB73)", rating:4.9, reviews:7200, purchases:22000, views:98000, category:"Face" },
  { id:61, emoji:"🏔️", brand:"CHARLOTTE TILBURY", name:"Magic Foundation", price:"PKR 8,900", priceNum:8900, desc:"Award-winning micro-blurring foundation that fades fine lines and pores", badge:"luxury", bg:"linear-gradient(135deg,#FFDDE7,#FFB3CB)", rating:4.8, reviews:2100, purchases:5800, views:34000, category:"Face" },
  { id:62, emoji:"☁️", brand:"NARS", name:"Sheer Glow Foundation", price:"PKR 5,800", priceNum:5800, desc:"Weightless natural finish foundation with buildable skin-like coverage", badge:null, bg:"linear-gradient(135deg,#F5F5F5,#EEEEEE)", rating:4.7, reviews:2800, purchases:8400, views:42000, category:"Face" },
  { id:63, emoji:"✨", brand:"URBAN DECAY", name:"All Nighter Setting Spray", price:"PKR 4,400", priceNum:4400, desc:"16-hour makeup lock technology in matte finish — no budge, no fade", badge:"cult fav", bg:"linear-gradient(135deg,#E8EAF6,#C5CAE9)", rating:4.8, reviews:4600, purchases:15000, views:64000, category:"Face" },
  { id:64, emoji:"🌸", brand:"TOO FACED", name:"Born This Way Setting Powder", price:"PKR 3,900", priceNum:3900, desc:"Micro-fine translucent powder with coconut water and rice starch", badge:"new", bg:"linear-gradient(135deg,#FCE4EC,#F8BBD9)", rating:4.6, reviews:1400, purchases:4200, views:24000, category:"Face" },
  // Nails
  { id:65, emoji:"💅", brand:"OPI", name:"Nail Lacquer — Infinite Shine", price:"PKR 2,100", priceNum:2100, desc:"Up to 11 days of chip-resistant, high-shine wear — no lamp needed", badge:"bestseller", bg:"linear-gradient(135deg,#CE93D8,#BA68C8)", rating:4.7, reviews:3100, purchases:10000, views:45000, category:"Nails" },
  { id:66, emoji:"💜", brand:"ESSIE", name:"Gel Couture Nail Polish", price:"PKR 1,800", priceNum:1800, desc:"Two-step gel couture system for 14-day wear in 60 fashion-forward shades", badge:null, bg:"linear-gradient(135deg,#E8EAF6,#9FA8DA)", rating:4.5, reviews:1800, purchases:5600, views:26000, category:"Nails" },
  { id:67, emoji:"🌈", brand:"SALLY HANSEN", name:"Miracle Gel Top Coat", price:"PKR 1,200", priceNum:1200, desc:"No-UV gel top coat that delivers 14-day glossy durability", badge:null, bg:"linear-gradient(135deg,#E1F5FE,#B3E5FC)", rating:4.4, reviews:2200, purchases:7200, views:31000, category:"Nails" },
  // Cheeks
  { id:68, emoji:"💎", brand:"NARS", name:"Blush in Orgasm", price:"PKR 5,600", priceNum:5600, desc:"The legendary peachy-pink shimmer blush — a universal flattery icon", badge:"icon", bg:"linear-gradient(135deg,#FFCBA4,#FF9A62)", rating:4.9, reviews:6800, purchases:21000, views:92000, category:"Cheeks" },
  { id:69, emoji:"🌺", brand:"BENEFIT", name:"Dandelion Blush", price:"PKR 3,800", priceNum:3800, desc:"Sheer baby-pink blush for a fresh, flushed complexion", badge:null, bg:"linear-gradient(135deg,#FCE4EC,#F48FB1)", rating:4.7, reviews:1900, purchases:5400, views:28000, category:"Cheeks" },
  { id:70, emoji:"🫦", brand:"HOURGLASS", name:"Ambient Lighting Blush", price:"PKR 6,400", priceNum:6400, desc:"Luminous blush that bathes skin in warm, flattering light", badge:"luxury", bg:"linear-gradient(135deg,#FFCCBC,#FFAB91)", rating:4.8, reviews:940, purchases:2200, views:18000, category:"Cheeks" },
  // Primers
  { id:71, emoji:"🔮", brand:"SMASHBOX", name:"Photo Finish Primer", price:"PKR 3,200", priceNum:3200, desc:"Silicone-based primer that blurs pores and extends foundation up to 8 hours", badge:"bestseller", bg:"linear-gradient(135deg,#EDE7F6,#B39DDB)", rating:4.6, reviews:2800, purchases:9000, views:38000, category:"Primers" },
  { id:72, emoji:"💡", brand:"BENEFIT", name:"Porefessional Face Primer", price:"PKR 2,800", priceNum:2800, desc:"Bestselling pore-minimising primer that creates a smooth base instantly", badge:"bestseller", bg:"linear-gradient(135deg,#FFF9C4,#FFF176)", rating:4.7, reviews:4100, purchases:13000, views:56000, category:"Primers" },
  // Tools
  { id:73, emoji:"🖌️", brand:"SIGMA BEAUTY", name:"F80 Flat Kabuki Brush", price:"PKR 3,400", priceNum:3400, desc:"Award-winning flat top kabuki for seamless foundation blending", badge:null, bg:"linear-gradient(135deg,#F5F5F5,#E0E0E0)", rating:4.8, reviews:2100, purchases:6200, views:29000, category:"Tools" },
  { id:74, emoji:"🫧", brand:"BEAUTYBLENDER", name:"Original Blending Sponge", price:"PKR 2,600", priceNum:2600, desc:"The iconic pink egg sponge for flawless, streak-free blending", badge:"icon", bg:"linear-gradient(135deg,#FCE4EC,#F48FB1)", rating:4.7, reviews:5400, purchases:17000, views:71000, category:"Tools" },
];

// The full catalog, every product across every section — used for direct
// product-page lookups (so any product, not just bestsellers, has a working URL).
const allProducts = [...homeProducts, ...skincareProducts, ...makeupProducts];

// Curated for the mobile homepage carousel — every product across all three
// catalogs that's tagged "bestseller", capped at 12 for the carousel (2 at a time x 6 pages).
const bestsellerProducts = allProducts
  .filter(p => p.badge === "bestseller")
  .slice(0, 12);

export { homeProducts, skincareProducts, makeupProducts, bestsellerProducts, allProducts };
