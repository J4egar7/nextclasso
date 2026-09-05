// Filter/concern categories and shade swatches used on product pages

const skincareConcerns = [
  { icon:"💧", name:"Hydration", count:"124 products", filterCat:"Moisturisers" },
  { icon:"✨", name:"Anti-Aging", count:"98 products", filterCat:"Serums" },
  { icon:"🌿", name:"Acne Control", count:"87 products", filterCat:"Toners" },
  { icon:"🌸", name:"Brightening", count:"76 products", filterCat:"Serums" },
  { icon:"🛡️", name:"Sensitive Skin", count:"112 products", filterCat:"Cleansers" },
  { icon:"☀️", name:"Sun Protection", count:"63 products", filterCat:"SPF" },
  { icon:"🔬", name:"Pore Care", count:"54 products", filterCat:"Toners" },
  { icon:"🌙", name:"Night Repair", count:"89 products", filterCat:"Masks" },
];

const makeupConcerns = [
  { icon:"💋", name:"Lips", count:"5 products", filterCat:"Lips" },
  { icon:"👁️", name:"Eyes", count:"5 products", filterCat:"Eyes" },
  { icon:"✨", name:"Face", count:"5 products", filterCat:"Face" },
  { icon:"💅", name:"Nails", count:"3 products", filterCat:"Nails" },
  { icon:"🌸", name:"Cheeks", count:"3 products", filterCat:"Cheeks" },
  { icon:"🔮", name:"Primers", count:"2 products", filterCat:"Primers" },
  { icon:"🖌️", name:"Tools", count:"2 products", filterCat:"Tools" },
];

const shades = [
  "#F5C5A3","#E8A882","#D4896A","#C07050","#A85038","#8B3528",
  "#F9D8CF","#F4B8A8","#E89080","#D46858","#C04840","#A02828",
  "#FFB3C8","#FF8CAD","#F46890","#E04478","#C02060","#A00048",
  "#E8C8A0","#D4A878","#C08858","#A86840","#8B5030","#6A3820",
];

const skinTones = [
  { name:"Fair",   color:"#FDDCB5" },
  { name:"Light",  color:"#F5C49A" },
  { name:"Medium", color:"#D4956A" },
  { name:"Tan",    color:"#B5722A" },
  { name:"Deep",   color:"#7A4510" },
  { name:"Rich",   color:"#4A2508" },
];

export { skincareConcerns, makeupConcerns, shades, skinTones };
