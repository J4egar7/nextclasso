// Customer review/testimonial content

const reviews = [
  { id:1, avatar:"👩‍🦰", name:"Ayesha K.", product:"LANEIGE Sleeping Mask", text:"I've been using this for 3 months and my skin has never looked better. The texture is heavenly and I wake up literally glowing!", rating:5 },
  { id:2, avatar:"👩🏻", name:"Sana M.", product:"FENTY Pro Filt'r", text:"Finally a foundation that matches my NC15! The coverage is flawless and it lasts all day through the Karachi heat. Total holy grail!", rating:5 },
  { id:3, avatar:"👩🏽", name:"Zara H.", product:"Charlotte Tilbury Pillow Talk", text:"Worth every penny! The formula is so creamy and the colour is universally flattering. I've bought 3 backups already.", rating:5 },
  { id:4, avatar:"👧", name:"Fatima R.", product:"Some By Mi Toner", text:"My acne-prone skin has transformed. This toner sorted my texture and breakouts in just 4 weeks. Absolutely obsessed!", rating:5 },
  { id:5, avatar:"👩‍🦱", name:"Maryam B.", product:"The Ordinary HA 2%", text:"Insane value for the price. My skin drinks this up and feels plump all day. Repurchased 7 times and counting!", rating:5 },
  { id:6, avatar:"👩🏼", name:"Alia T.", product:"Tatcha Dewy Serum", text:"Splurged on this and zero regrets. The texture is like liquid silk and my pores have visibly minimised. Game changing serum!", rating:5 },
  { id:7, avatar:"👩🏾", name:"Nadia S.", product:"ABH Norvina Palette", text:"The pigmentation is INSANE. One swipe and you're done. The earthy tones are perfect for everyday and the bold shades for events!", rating:5 },
  { id:8, avatar:"🧕", name:"Hira A.", product:"NARS Orgasm Blush", text:"Living up to its legendary reputation! This blush gives me life every single morning. The packaging is chef's kiss too!", rating:5 },
];

const skincareReviews = [
  { id:1, avatar:"🧴", name:"Ayesha K.", product:"LANEIGE Water Sleeping Mask", text:"I wake up with the dewiest skin every morning. This mask has completely transformed my dry patches — absolutely worth every rupee.", rating:5 },
  { id:2, avatar:"🌿", name:"Fatima R.", product:"Some By Mi AHA BHA PHA Toner", text:"My acne-prone skin has never been this clear. Four weeks in and my texture has smoothed out dramatically. This toner is pure magic!", rating:5 },
  { id:3, avatar:"💧", name:"Maryam B.", product:"The Ordinary Hyaluronic Acid 2%", text:"Insane value for money. My skin literally drinks this up — plump and bouncy all day long. On my seventh repurchase now!", rating:5 },
  { id:4, avatar:"☀️", name:"Sana M.", product:"Anua Heartleaf SPF 50+", text:"Finally a sunscreen that doesn't leave a white cast on my NC30 skin. Lightweight, non-greasy, and my skin feels calm all day.", rating:5 },
  { id:5, avatar:"🌸", name:"Alia T.", product:"Tatcha The Dewy Serum", text:"I splurged on this and have zero regrets. The texture is like liquid silk and my fine lines have visibly softened after just a month.", rating:5 },
  { id:6, avatar:"🍵", name:"Hina Z.", product:"Innisfree Green Tea Serum", text:"Such a lovely, lightweight serum. My skin looks brighter and more even-toned. The Jeju green tea scent is an added bonus!", rating:5 },
];

const makeupReviews = [
  { id:1, avatar:"💄", name:"Zara H.", product:"Charlotte Tilbury Pillow Talk", text:"Worth every single penny. The formula is impossibly creamy and the shade is flattering on literally everyone. I've bought four backups already!", rating:5 },
  { id:2, avatar:"✨", name:"Nadia S.", product:"ABH Norvina Pro Pigment Palette", text:"The pigmentation is absolutely insane — one swipe and you're done. The earthy tones are perfect for daily wear, the bold shades for events.", rating:5 },
  { id:3, avatar:"🎭", name:"Hira A.", product:"NARS Blush in Orgasm", text:"Living up to its legendary reputation every single morning. This blush gives me the most beautiful natural flush. The packaging is stunning too!", rating:5 },
  { id:4, avatar:"👄", name:"Sara Q.", product:"Fenty Gloss Bomb", text:"This gloss is genuinely life-changing. The colour payoff is insane, the scent is divine, and it looks gorgeous on every skin tone.", rating:5 },
  { id:5, avatar:"💅", name:"Layla B.", product:"Urban Decay All Nighter Spray", text:"I wore my makeup through a 10-hour wedding in July heat. Not a single budge. This setting spray is an absolute non-negotiable for me now.", rating:5 },
  { id:6, avatar:"🌟", name:"Rania M.", product:"Charlotte Tilbury Airbrush Foundation", text:"I've tried every foundation and this is genuinely the best I've ever used. It looks like real skin — my guests couldn't believe I was wearing makeup!", rating:5 },
];

const productReviews = [
  { name:"Ayesha K.", avatar:"👩‍🦰", city:"Karachi", text:"Genuinely one of the best products I've ever used. My skin looked visibly transformed after just two weeks — smoother, brighter, and so healthy.", rating:5, date:"2026-03-14" },
  { name:"Sana M.", avatar:"👩🏻", city:"Lahore", text:"Good but not magic. Took about a month to notice anything, and the scent is a bit strong for my taste. Still repurchasing though.", rating:4, date:"2026-03-02" },
  { name:"Fatima R.", avatar:"👧", city:"Islamabad", text:"Holy grail.", rating:5, date:"2026-02-26" },
  { name:"Zara H.", avatar:"👩🏽", city:"Lahore", text:"The formula is so thoughtfully made. You can tell real science went into this — my pores are tighter, my skin is clearer, and I get compliments constantly. I've already gone through two bottles and ordered a third before I ran out, which says everything about how reliable this has become in my routine.", rating:5, date:"2026-02-11" },
  { name:"Maryam B.", avatar:"👩‍🦱", city:"Karachi", text:"Solid product, does what it says. Nothing life-changing for me but no complaints either.", rating:4, date:"2026-01-29" },
  { name:"Alia T.", avatar:"👩🏼", city:"Peshawar", text:"Delivered fast and exactly as described.", rating:5, date:"2026-01-18" },
  { name:"Nadia S.", avatar:"👩🏾", city:"Karachi", text:"Bought this for my mum and she's obsessed. She keeps asking me to order more. The quality feels luxury-level for the price.", rating:5, date:"2025-12-30" },
  { name:"Hira A.", avatar:"🧕", city:"Lahore", text:"It's fine — does the basics well. Wouldn't call it a holy grail but I'll finish the bottle and probably try something else next.", rating:4, date:"2025-12-19" },
  { name:"Sara Q.", avatar:"💁‍♀️", city:"Islamabad", text:"Packaging arrived sealed and the product itself smells amazing. Texture is lighter than I expected which I actually prefer for everyday use.", rating:5, date:"2025-12-05" },
  { name:"Layla B.", avatar:"🌸", city:"Faisalabad", text:"Took a while to see results but I'm glad I stuck with it. Around the three-week mark things really started clicking for my skin.", rating:4, date:"2025-11-21" },
  { name:"Rania M.", avatar:"🌟", city:"Karachi", text:"Worth it.", rating:5, date:"2025-11-09" },
  { name:"Dua F.", avatar:"☀️", city:"Multan", text:"Fast dispatch, nice packaging, product does the job. Would buy again when I run out.", rating:4, date:"2025-10-27" },
  { name:"Mehwish A.", avatar:"👩🏻‍🦳", city:"Rawalpindi", text:"This has genuinely become a staple. I rotate a lot of products but this one never gets swapped out — consistent results every single time I use it.", rating:5, date:"2025-10-14" },
  { name:"Komal I.", avatar:"👩🏿", city:"Lahore", text:"Decent. A little pricey for what it is but the quality is there.", rating:4, date:"2025-09-30" },
  { name:"Iqra N.", avatar:"👩🏽‍🦱", city:"Karachi", text:"My dermatologist actually recommended something similar and this comes very close at a fraction of the price. Been using it for six weeks now and my skin texture has noticeably evened out, especially around problem areas I'd struggled with for years.", rating:5, date:"2025-09-12" },
];

export { reviews, skincareReviews, makeupReviews, productReviews };
