import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── helpers ───────────────────────────────────────────────────────────────────

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function paise(rupees: number) {
  return Math.round(rupees * 100);
}

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=3840&q=100&auto=format&fit=crop`;
}

// ── image pools by category ───────────────────────────────────────────────────
// 4 images per category, all 3840×2160 (4K) via Unsplash CDN

const IMGS = {
  dcut: [
    img('1553062407-98eeb64c6a62'), // colourful eco shopping bags
    img('1607082348824-0a96f2a4b9da'), // fabric carry bags on shelf
    img('1584917865442-de89b1c78e2e'), // white non-woven bag close-up
    img('1619566636858-adf3ef46400b'), // eco bags flat lay
  ],
  wcut: [
    img('1593640408182-31c228b59c3b'), // non-woven carry bags
    img('1610832958736-dc7c88ae6d06'), // fabric shopping bags store
    img('1548036328-c9fa89d128fa'),    // W-cut style tote
    img('1619566636858-adf3ef46400b'), // eco flat-lay bags
  ],
  loop: [
    img('1602573991155-21f0143bb5d2'), // canvas loop handle tote
    img('1544816155-12df9643f363'),    // premium loop bag boutique
    img('1524583596654-3d5e8af6e3f0'), // stylish carry bag
    img('1526045431048-f857369baa35'), // tote bag lifestyle
  ],
  box: [
    img('1607082348824-0a96f2a4b9da'), // box bag on shelf
    img('1584917865442-de89b1c78e2e'), // flat bottom bag
    img('1553062407-98eeb64c6a62'),    // bags arranged
    img('1610832958736-dc7c88ae6d06'), // bags in store
  ],
  gift: [
    img('1607082348824-0a96f2a4b9da'), // gift bag golden
    img('1512909006721-3d6018887383'), // festive gift bags
    img('1513475382585-d06e58bcb0e0'), // gift wrapping bags
    img('1549465220-1a8b9238cd48'),    // luxury gift bags
  ],
  tote: [
    img('1602573991155-21f0143bb5d2'), // canvas tote lifestyle
    img('1526045431048-f857369baa35'), // oversized tote bag
    img('1548036328-c9fa89d128fa'),    // tote bag street
    img('1524583596654-3d5e8af6e3f0'), // tote flat lay
  ],
  promo: [
    img('1553062407-98eeb64c6a62'),    // colourful promo bags
    img('1572635196237-14b3f281503f'), // promotional event bags
    img('1593640408182-31c228b59c3b'), // printed bags
    img('1610832958736-dc7c88ae6d06'), // bag with branding space
  ],
  grocery: [
    img('1610832958736-dc7c88ae6d06'), // grocery bag market
    img('1553062407-98eeb64c6a62'),    // green grocery bag
    img('1584917865442-de89b1c78e2e'), // grocery carry bag
    img('1593640408182-31c228b59c3b'), // supermarket bags
  ],
  retail: [
    img('1544816155-12df9643f363'),    // retail store bags
    img('1602573991155-21f0143bb5d2'), // shopping retail bag
    img('1524583596654-3d5e8af6e3f0'), // fashion store bag
    img('1526045431048-f857369baa35'), // stylish retail bag
  ],
  medical: [
    img('1584917865442-de89b1c78e2e'), // white medical bag
    img('1593640408182-31c228b59c3b'), // clean white carry bag
    img('1553062407-98eeb64c6a62'),    // pharma bag
    img('1610832958736-dc7c88ae6d06'), // clinic bag
  ],
  wine: [
    img('1549465220-1a8b9238cd48'),    // wine bottle gift bag
    img('1512909006721-3d6018887383'), // wine bag dark premium
    img('1513475382585-d06e58bcb0e0'), // bottle bag close up
    img('1607082348824-0a96f2a4b9da'), // wine bag shelf
  ],
  laundry: [
    img('1584917865442-de89b1c78e2e'), // large white laundry bag
    img('1553062407-98eeb64c6a62'),    // laundry bag fabric
    img('1593640408182-31c228b59c3b'), // hotel laundry bag
    img('1610832958736-dc7c88ae6d06'), // laundry room bag
  ],
  shoe: [
    img('1542291026-7eec264c27ff'),    // shoe bag store display
    img('1544816155-12df9643f363'),    // shoe packaging bag
    img('1524583596654-3d5e8af6e3f0'), // shoe bag close up
    img('1526045431048-f857369baa35'), // shoe bag lifestyle
  ],
  sari: [
    img('1519657337-8c8d9fc7c5b2'),    // fabric textile bag
    img('1610832958736-dc7c88ae6d06'), // garment bag store
    img('1593640408182-31c228b59c3b'), // sari packing bag
    img('1553062407-98eeb64c6a62'),    // pink purple fabric bag
  ],
  event: [
    img('1512909006721-3d6018887383'), // event bags display
    img('1513475382585-d06e58bcb0e0'), // corporate event bag
    img('1549465220-1a8b9238cd48'),    // wedding return gift bag
    img('1607082348824-0a96f2a4b9da'), // event conference bag
  ],
  eco: [
    img('1619566636858-adf3ef46400b'), // eco natural beige bag
    img('1553062407-98eeb64c6a62'),    // green eco bag
    img('1602573991155-21f0143bb5d2'), // reusable eco tote
    img('1548036328-c9fa89d128fa'),    // eco bag nature
  ],
  school: [
    img('1553062407-98eeb64c6a62'),    // colourful school bag
    img('1593640408182-31c228b59c3b'), // stationery bag
    img('1610832958736-dc7c88ae6d06'), // book carry bag
    img('1584917865442-de89b1c78e2e'), // school supply bag
  ],
  temple: [
    img('1513475382585-d06e58bcb0e0'), // saffron fabric bag
    img('1549465220-1a8b9238cd48'),    // red festive bag
    img('1512909006721-3d6018887383'), // puja bag
    img('1607082348824-0a96f2a4b9da'), // prasad bag
  ],
  agri: [
    img('1584917865442-de89b1c78e2e'), // black agri bag
    img('1553062407-98eeb64c6a62'),    // green agriculture bag
    img('1610832958736-dc7c88ae6d06'), // seed bag farm
    img('1593640408182-31c228b59c3b'), // agri packaging bag
  ],
  bakery: [
    img('1607082348824-0a96f2a4b9da'), // bakery paper-look bag
    img('1549465220-1a8b9238cd48'),    // brown bakery bag
    img('1512909006721-3d6018887383'), // cake bag close-up
    img('1513475382585-d06e58bcb0e0'), // pastry bag shelf
  ],
  drawstring: [
    img('1542291026-7eec264c27ff'),    // black drawstring bag
    img('1524583596654-3d5e8af6e3f0'), // drawstring lifestyle
    img('1526045431048-f857369baa35'), // drawstring gym bag
    img('1544816155-12df9643f363'),    // drawstring pouch
  ],
  heavy: [
    img('1584917865442-de89b1c78e2e'), // heavy duty white bag
    img('1553062407-98eeb64c6a62'),    // thick fabric bag
    img('1610832958736-dc7c88ae6d06'), // industrial bag
    img('1593640408182-31c228b59c3b'), // heavy bag close up
  ],
  laminated: [
    img('1544816155-12df9643f363'),    // glossy laminated bag
    img('1549465220-1a8b9238cd48'),    // matte premium bag
    img('1602573991155-21f0143bb5d2'), // laminated retail bag
    img('1524583596654-3d5e8af6e3f0'), // luxury laminated bag
  ],
  cold: [
    img('1593640408182-31c228b59c3b'), // insulated bag white
    img('1610832958736-dc7c88ae6d06'), // cold storage bag
    img('1584917865442-de89b1c78e2e'), // thermal bag
    img('1553062407-98eeb64c6a62'),    // delivery bag
  ],
  lightweight: [
    img('1553062407-98eeb64c6a62'),    // lightweight thin bag
    img('1619566636858-adf3ef46400b'), // mass distribution bag
    img('1593640408182-31c228b59c3b'), // event giveaway bag
    img('1610832958736-dc7c88ae6d06'), // budget promo bag
  ],
};

// ── product definitions ───────────────────────────────────────────────────────

const PRODUCTS = [
  // ── D-Cut bags ───────────────────────────────────────────────────────────────
  {
    title: 'D-Cut Non-Woven Bag – Small',
    desc: 'Lightweight small D-cut non-woven carry bag ideal for retail and gifting. Available in multiple colours with custom printing.',
    basePrice: paise(12), images: IMGS.dcut,
    variants: [
      { size: '8×10 inch', color: 'White', shape: 'D-Cut', gsm: 60, ppkg: paise(110), stock: 5000 },
      { size: '8×10 inch', color: 'Blue',  shape: 'D-Cut', gsm: 60, ppkg: paise(110), stock: 4000 },
      { size: '8×10 inch', color: 'Red',   shape: 'D-Cut', gsm: 60, ppkg: paise(112), stock: 3500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(108) }, { minQtyKg: 500, ppkg: paise(104) }, { minQtyKg: 1000, ppkg: paise(100) }],
  },
  {
    title: 'D-Cut Non-Woven Bag – Medium',
    desc: 'Medium D-cut bag for grocery and pharmacy outlets. Strong handle, vibrant colour options.',
    basePrice: paise(16), images: IMGS.dcut,
    variants: [
      { size: '10×12 inch', color: 'White', shape: 'D-Cut', gsm: 70, ppkg: paise(115), stock: 6000 },
      { size: '10×12 inch', color: 'Green', shape: 'D-Cut', gsm: 70, ppkg: paise(115), stock: 4500 },
      { size: '10×12 inch', color: 'Pink',  shape: 'D-Cut', gsm: 70, ppkg: paise(117), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(112) }, { minQtyKg: 500, ppkg: paise(108) }, { minQtyKg: 1000, ppkg: paise(104) }],
  },
  {
    title: 'D-Cut Non-Woven Bag – Large',
    desc: 'Large D-cut bag for supermarkets and bulk retail. Excellent load capacity, reusable and eco-friendly.',
    basePrice: paise(22), images: IMGS.dcut,
    variants: [
      { size: '12×15 inch', color: 'White', shape: 'D-Cut', gsm: 80, ppkg: paise(120), stock: 5000 },
      { size: '12×15 inch', color: 'Navy',  shape: 'D-Cut', gsm: 80, ppkg: paise(120), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(116) }, { minQtyKg: 500, ppkg: paise(112) }, { minQtyKg: 1000, ppkg: paise(108) }],
  },
  {
    title: 'D-Cut Non-Woven Bag – Extra Large',
    desc: 'Extra large D-cut bag for rice, flour and large grocery items. Heavy-duty 100 GSM fabric.',
    basePrice: paise(30), images: IMGS.dcut,
    variants: [
      { size: '14×18 inch', color: 'White',  shape: 'D-Cut', gsm: 100, ppkg: paise(130), stock: 3000 },
      { size: '14×18 inch', color: 'Yellow', shape: 'D-Cut', gsm: 100, ppkg: paise(130), stock: 2500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(126) }, { minQtyKg: 500, ppkg: paise(122) }, { minQtyKg: 1000, ppkg: paise(118) }],
  },

  // ── W-Cut bags ───────────────────────────────────────────────────────────────
  {
    title: 'W-Cut Non-Woven Bag – Small',
    desc: 'Small W-cut bag with U-shaped handle cutout. Perfect for boutiques and small retail shops.',
    basePrice: paise(14), images: IMGS.wcut,
    variants: [
      { size: '9×11 inch', color: 'White',  shape: 'W-Cut', gsm: 60, ppkg: paise(112), stock: 5000 },
      { size: '9×11 inch', color: 'Purple', shape: 'W-Cut', gsm: 60, ppkg: paise(112), stock: 3500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(109) }, { minQtyKg: 500, ppkg: paise(106) }, { minQtyKg: 1000, ppkg: paise(102) }],
  },
  {
    title: 'W-Cut Non-Woven Bag – Medium',
    desc: 'Medium W-cut bag for garment and apparel stores. Wide gusset, holds bulky items comfortably.',
    basePrice: paise(18), images: IMGS.wcut,
    variants: [
      { size: '11×14 inch', color: 'White', shape: 'W-Cut', gsm: 70, ppkg: paise(118), stock: 5500 },
      { size: '11×14 inch', color: 'Black', shape: 'W-Cut', gsm: 70, ppkg: paise(118), stock: 4000 },
      { size: '11×14 inch', color: 'Red',   shape: 'W-Cut', gsm: 70, ppkg: paise(120), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(114) }, { minQtyKg: 500, ppkg: paise(110) }, { minQtyKg: 1000, ppkg: paise(106) }],
  },
  {
    title: 'W-Cut Non-Woven Bag – Large',
    desc: 'Large W-cut bag for department stores and supermarkets. Reinforced handle area for heavy loads.',
    basePrice: paise(25), images: IMGS.wcut,
    variants: [
      { size: '13×16 inch', color: 'White',  shape: 'W-Cut', gsm: 80, ppkg: paise(125), stock: 4000 },
      { size: '13×16 inch', color: 'Orange', shape: 'W-Cut', gsm: 80, ppkg: paise(125), stock: 2800 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(121) }, { minQtyKg: 500, ppkg: paise(117) }, { minQtyKg: 1000, ppkg: paise(113) }],
  },

  // ── Loop handle bags ──────────────────────────────────────────────────────────
  {
    title: 'Loop Handle Non-Woven Bag – Small',
    desc: 'Stylish small loop handle bag with soft rope handles. Popular for boutiques, cosmetics and gifting.',
    basePrice: paise(25), images: IMGS.loop,
    variants: [
      { size: '8×10×4 inch', color: 'White', shape: 'Loop Handle', gsm: 80, ppkg: paise(135), stock: 3000 },
      { size: '8×10×4 inch', color: 'Black', shape: 'Loop Handle', gsm: 80, ppkg: paise(135), stock: 2500 },
      { size: '8×10×4 inch', color: 'Pink',  shape: 'Loop Handle', gsm: 80, ppkg: paise(138), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(130) }, { minQtyKg: 500, ppkg: paise(126) }, { minQtyKg: 1000, ppkg: paise(122) }],
  },
  {
    title: 'Loop Handle Non-Woven Bag – Medium',
    desc: 'Medium loop handle bag with gusset base. Ideal for apparel retail and premium gifting.',
    basePrice: paise(35), images: IMGS.loop,
    variants: [
      { size: '10×12×4 inch', color: 'White',  shape: 'Loop Handle', gsm: 90, ppkg: paise(140), stock: 3500 },
      { size: '10×12×4 inch', color: 'Navy',   shape: 'Loop Handle', gsm: 90, ppkg: paise(140), stock: 2500 },
      { size: '10×12×4 inch', color: 'Maroon', shape: 'Loop Handle', gsm: 90, ppkg: paise(142), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(136) }, { minQtyKg: 500, ppkg: paise(132) }, { minQtyKg: 1000, ppkg: paise(128) }],
  },
  {
    title: 'Loop Handle Non-Woven Bag – Large',
    desc: 'Large loop handle bag for shopping malls and fashion retailers. Premium feel with soft handles.',
    basePrice: paise(50), images: IMGS.loop,
    variants: [
      { size: '12×15×5 inch', color: 'White', shape: 'Loop Handle', gsm: 100, ppkg: paise(150), stock: 3000 },
      { size: '12×15×5 inch', color: 'Black', shape: 'Loop Handle', gsm: 100, ppkg: paise(150), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(146) }, { minQtyKg: 500, ppkg: paise(142) }, { minQtyKg: 1000, ppkg: paise(138) }],
  },

  // ── Box bags ─────────────────────────────────────────────────────────────────
  {
    title: 'Box Bag Non-Woven – Small',
    desc: 'Small box-style non-woven bag with flat bottom gusset. Stands upright, perfect for food and bakeries.',
    basePrice: paise(20), images: IMGS.box,
    variants: [
      { size: '7×9×3 inch', color: 'White', shape: 'Box Bag', gsm: 70, ppkg: paise(118), stock: 4000 },
      { size: '7×9×3 inch', color: 'Brown', shape: 'Box Bag', gsm: 70, ppkg: paise(118), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(114) }, { minQtyKg: 500, ppkg: paise(110) }, { minQtyKg: 1000, ppkg: paise(106) }],
  },
  {
    title: 'Box Bag Non-Woven – Medium',
    desc: 'Medium box bag with wide flat bottom. Great for pharma, grocery and food delivery brands.',
    basePrice: paise(28), images: IMGS.box,
    variants: [
      { size: '9×12×4 inch', color: 'White', shape: 'Box Bag', gsm: 80, ppkg: paise(125), stock: 4500 },
      { size: '9×12×4 inch', color: 'Green', shape: 'Box Bag', gsm: 80, ppkg: paise(125), stock: 3200 },
      { size: '9×12×4 inch', color: 'Red',   shape: 'Box Bag', gsm: 80, ppkg: paise(127), stock: 2500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(121) }, { minQtyKg: 500, ppkg: paise(117) }, { minQtyKg: 1000, ppkg: paise(113) }],
  },
  {
    title: 'Box Bag Non-Woven – Large',
    desc: 'Large box bag with reinforced base. Ideal for large volume grocery and FMCG distribution.',
    basePrice: paise(40), images: IMGS.box,
    variants: [
      { size: '12×16×5 inch', color: 'White',  shape: 'Box Bag', gsm: 100, ppkg: paise(135), stock: 3500 },
      { size: '12×16×5 inch', color: 'Yellow', shape: 'Box Bag', gsm: 100, ppkg: paise(135), stock: 2500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(131) }, { minQtyKg: 500, ppkg: paise(127) }, { minQtyKg: 1000, ppkg: paise(123) }],
  },

  // ── Promotional bags ──────────────────────────────────────────────────────────
  {
    title: 'Promotional Non-Woven Bag – Standard',
    desc: 'Budget-friendly promotional bag for events, trade fairs and product launches. Large print area.',
    basePrice: paise(10), images: IMGS.promo,
    variants: [
      { size: '10×12 inch', color: 'White', shape: 'D-Cut', gsm: 55, ppkg: paise(100), stock: 10000 },
      { size: '10×12 inch', color: 'Blue',  shape: 'D-Cut', gsm: 55, ppkg: paise(100), stock: 8000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(97) }, { minQtyKg: 500, ppkg: paise(94) }, { minQtyKg: 1000, ppkg: paise(90) }],
  },
  {
    title: 'Promotional Non-Woven Bag – Premium',
    desc: 'Premium promotional bag with high-GSM fabric for corporate events and brand campaigns.',
    basePrice: paise(20), images: IMGS.promo,
    variants: [
      { size: '11×14 inch', color: 'White', shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 6000 },
      { size: '11×14 inch', color: 'Black', shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 4000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(118) }, { minQtyKg: 500, ppkg: paise(114) }, { minQtyKg: 1000, ppkg: paise(110) }],
  },

  // ── Grocery bags ──────────────────────────────────────────────────────────────
  {
    title: 'Grocery Non-Woven Bag – Economy',
    desc: 'Economy grocery bag designed for vegetable and fruit shops. Durable, washable and reusable.',
    basePrice: paise(8), images: IMGS.grocery,
    variants: [
      { size: '10×13 inch', color: 'Green', shape: 'D-Cut', gsm: 55, ppkg: paise(98), stock: 12000 },
      { size: '10×13 inch', color: 'White', shape: 'D-Cut', gsm: 55, ppkg: paise(98), stock: 10000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(95) }, { minQtyKg: 500, ppkg: paise(92) }, { minQtyKg: 1000, ppkg: paise(88) }],
  },
  {
    title: 'Grocery Non-Woven Bag – Standard',
    desc: 'Standard-weight grocery bag for supermarkets and kirana stores. Suitable for heavy produce.',
    basePrice: paise(14), images: IMGS.grocery,
    variants: [
      { size: '11×14 inch', color: 'Green',  shape: 'W-Cut', gsm: 70, ppkg: paise(114), stock: 8000 },
      { size: '11×14 inch', color: 'White',  shape: 'W-Cut', gsm: 70, ppkg: paise(114), stock: 7000 },
      { size: '11×14 inch', color: 'Orange', shape: 'W-Cut', gsm: 70, ppkg: paise(116), stock: 4000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(110) }, { minQtyKg: 500, ppkg: paise(107) }, { minQtyKg: 1000, ppkg: paise(103) }],
  },

  // ── Retail shopping bags ──────────────────────────────────────────────────────
  {
    title: 'Retail Shopping Non-Woven Bag – Small',
    desc: 'Smart small retail bag for apparel, accessories and footwear outlets. Crisp finish.',
    basePrice: paise(18), images: IMGS.retail,
    variants: [
      { size: '8×11×3 inch', color: 'White', shape: 'Loop Handle', gsm: 80, ppkg: paise(130), stock: 4000 },
      { size: '8×11×3 inch', color: 'Black', shape: 'Loop Handle', gsm: 80, ppkg: paise(130), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(126) }, { minQtyKg: 500, ppkg: paise(122) }, { minQtyKg: 1000, ppkg: paise(118) }],
  },
  {
    title: 'Retail Shopping Non-Woven Bag – Large',
    desc: 'Large retail shopping bag for clothing stores and department outlets. Wide and spacious.',
    basePrice: paise(40), images: IMGS.retail,
    variants: [
      { size: '13×17×5 inch', color: 'White',  shape: 'Loop Handle', gsm: 100, ppkg: paise(145), stock: 3000 },
      { size: '13×17×5 inch', color: 'Maroon', shape: 'Loop Handle', gsm: 100, ppkg: paise(145), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(141) }, { minQtyKg: 500, ppkg: paise(137) }, { minQtyKg: 1000, ppkg: paise(133) }],
  },

  // ── Gift bags ─────────────────────────────────────────────────────────────────
  {
    title: 'Gift Non-Woven Bag – Small',
    desc: 'Elegant small gift bag for festivals, weddings and corporate gifting. Satin-finish fabric.',
    basePrice: paise(30), images: IMGS.gift,
    variants: [
      { size: '7×9×3 inch', color: 'Gold',   shape: 'Box Bag', gsm: 90, ppkg: paise(145), stock: 2500 },
      { size: '7×9×3 inch', color: 'Silver', shape: 'Box Bag', gsm: 90, ppkg: paise(145), stock: 2000 },
      { size: '7×9×3 inch', color: 'Red',    shape: 'Box Bag', gsm: 90, ppkg: paise(148), stock: 1800 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(140) }, { minQtyKg: 500, ppkg: paise(136) }, { minQtyKg: 1000, ppkg: paise(132) }],
  },
  {
    title: 'Gift Non-Woven Bag – Medium',
    desc: 'Medium gift bag with ribbon handle. Ideal for Diwali, weddings and premium brand gifting.',
    basePrice: paise(45), images: IMGS.gift,
    variants: [
      { size: '10×13×4 inch', color: 'Gold',   shape: 'Box Bag', gsm: 100, ppkg: paise(155), stock: 2000 },
      { size: '10×13×4 inch', color: 'Pink',   shape: 'Box Bag', gsm: 100, ppkg: paise(155), stock: 1800 },
      { size: '10×13×4 inch', color: 'Purple', shape: 'Box Bag', gsm: 100, ppkg: paise(158), stock: 1500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(150) }, { minQtyKg: 500, ppkg: paise(146) }, { minQtyKg: 1000, ppkg: paise(142) }],
  },
  {
    title: 'Gift Non-Woven Bag – Large',
    desc: 'Large premium gift bag for corporate hampers and festive sets. Thick 120 GSM fabric.',
    basePrice: paise(65), images: IMGS.gift,
    variants: [
      { size: '13×16×5 inch', color: 'Gold',  shape: 'Box Bag', gsm: 120, ppkg: paise(165), stock: 1500 },
      { size: '13×16×5 inch', color: 'Black', shape: 'Box Bag', gsm: 120, ppkg: paise(165), stock: 1200 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(160) }, { minQtyKg: 500, ppkg: paise(156) }, { minQtyKg: 1000, ppkg: paise(152) }],
  },

  // ── Wine bags ─────────────────────────────────────────────────────────────────
  {
    title: 'Wine Bottle Non-Woven Bag – Single',
    desc: 'Tall slim non-woven bag for single wine or juice bottles. Popular for gifting and restaurants.',
    basePrice: paise(18), images: IMGS.wine,
    variants: [
      { size: '4×14 inch', color: 'Burgundy', shape: 'D-Cut', gsm: 80, ppkg: paise(128), stock: 3000 },
      { size: '4×14 inch', color: 'Black',    shape: 'D-Cut', gsm: 80, ppkg: paise(128), stock: 2500 },
      { size: '4×14 inch', color: 'Gold',     shape: 'D-Cut', gsm: 80, ppkg: paise(130), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(124) }, { minQtyKg: 500, ppkg: paise(120) }, { minQtyKg: 1000, ppkg: paise(116) }],
  },
  {
    title: 'Wine Bottle Non-Woven Bag – Double',
    desc: 'Wide double-bottle non-woven bag for wine packs and gift sets. Sturdy base with gusset.',
    basePrice: paise(30), images: IMGS.wine,
    variants: [
      { size: '8×14×4 inch', color: 'Burgundy', shape: 'Box Bag', gsm: 90, ppkg: paise(138), stock: 2500 },
      { size: '8×14×4 inch', color: 'Black',    shape: 'Box Bag', gsm: 90, ppkg: paise(138), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(134) }, { minQtyKg: 500, ppkg: paise(130) }, { minQtyKg: 1000, ppkg: paise(126) }],
  },

  // ── Laundry bags ──────────────────────────────────────────────────────────────
  {
    title: 'Laundry Non-Woven Bag – Standard',
    desc: 'Spacious laundry bag for hotels and laundry services. Easy to wash and quick drying.',
    basePrice: paise(35), images: IMGS.laundry,
    variants: [
      { size: '16×20 inch', color: 'White', shape: 'D-Cut', gsm: 80, ppkg: paise(122), stock: 4000 },
      { size: '16×20 inch', color: 'Blue',  shape: 'D-Cut', gsm: 80, ppkg: paise(122), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(118) }, { minQtyKg: 500, ppkg: paise(114) }, { minQtyKg: 1000, ppkg: paise(110) }],
  },
  {
    title: 'Laundry Non-Woven Bag – Large',
    desc: 'Extra large laundry bag for bulk linen handling in hotels.',
    basePrice: paise(50), images: IMGS.laundry,
    variants: [
      { size: '18×24 inch', color: 'White', shape: 'D-Cut', gsm: 100, ppkg: paise(132), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(128) }, { minQtyKg: 500, ppkg: paise(124) }, { minQtyKg: 1000, ppkg: paise(120) }],
  },

  // ── Tote bags ─────────────────────────────────────────────────────────────────
  {
    title: 'Tote Non-Woven Bag – Standard',
    desc: 'Classic tote style non-woven bag with long shoulder handles. Great for daily shopping.',
    basePrice: paise(30), images: IMGS.tote,
    variants: [
      { size: '12×14×4 inch', color: 'White', shape: 'Loop Handle', gsm: 90, ppkg: paise(140), stock: 4000 },
      { size: '12×14×4 inch', color: 'Beige', shape: 'Loop Handle', gsm: 90, ppkg: paise(140), stock: 3000 },
      { size: '12×14×4 inch', color: 'Denim', shape: 'Loop Handle', gsm: 90, ppkg: paise(142), stock: 2500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(136) }, { minQtyKg: 500, ppkg: paise(132) }, { minQtyKg: 1000, ppkg: paise(128) }],
  },
  {
    title: 'Tote Non-Woven Bag – Oversized',
    desc: 'Oversized tote bag for beach, travel and grocery hauls. Reinforced long handles.',
    basePrice: paise(55), images: IMGS.tote,
    variants: [
      { size: '15×17×5 inch', color: 'White', shape: 'Loop Handle', gsm: 100, ppkg: paise(152), stock: 2500 },
      { size: '15×17×5 inch', color: 'Khaki', shape: 'Loop Handle', gsm: 100, ppkg: paise(152), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(148) }, { minQtyKg: 500, ppkg: paise(144) }, { minQtyKg: 1000, ppkg: paise(140) }],
  },

  // ── Medical bags ──────────────────────────────────────────────────────────────
  {
    title: 'Medical Non-Woven Bag – Standard',
    desc: 'Clean white non-woven bag for pharmacies and clinics. Hygienic and wipeable surface.',
    basePrice: paise(12), images: IMGS.medical,
    variants: [
      { size: '8×12 inch', color: 'White', shape: 'D-Cut', gsm: 65, ppkg: paise(108), stock: 8000 },
      { size: '8×12 inch', color: 'Blue',  shape: 'D-Cut', gsm: 65, ppkg: paise(108), stock: 6000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(104) }, { minQtyKg: 500, ppkg: paise(101) }, { minQtyKg: 1000, ppkg: paise(97) }],
  },
  {
    title: 'Medical Non-Woven Bag – Large',
    desc: 'Larger pharma bag for clinics and diagnostic centres. Suitable for medical equipment packing.',
    basePrice: paise(22), images: IMGS.medical,
    variants: [
      { size: '12×15 inch', color: 'White', shape: 'W-Cut', gsm: 80, ppkg: paise(120), stock: 5000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(116) }, { minQtyKg: 500, ppkg: paise(112) }, { minQtyKg: 1000, ppkg: paise(108) }],
  },

  // ── Agriculture bags ──────────────────────────────────────────────────────────
  {
    title: 'Agriculture Non-Woven Bag – 1 KG',
    desc: 'Small crop and seed bag for nurseries and agri dealers. UV-treated fabric for outdoor use.',
    basePrice: paise(5), images: IMGS.agri,
    variants: [
      { size: '5×8 inch', color: 'Black', shape: 'D-Cut', gsm: 50, ppkg: paise(88), stock: 20000 },
      { size: '5×8 inch', color: 'Green', shape: 'D-Cut', gsm: 50, ppkg: paise(88), stock: 15000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(85) }, { minQtyKg: 500, ppkg: paise(82) }, { minQtyKg: 1000, ppkg: paise(78) }],
  },
  {
    title: 'Agriculture Non-Woven Bag – 5 KG',
    desc: 'Medium agri bag for seed and fertiliser packing. High GSM for outdoor durability.',
    basePrice: paise(12), images: IMGS.agri,
    variants: [
      { size: '10×14 inch', color: 'Black', shape: 'D-Cut', gsm: 70, ppkg: paise(110), stock: 10000 },
      { size: '10×14 inch', color: 'Green', shape: 'D-Cut', gsm: 70, ppkg: paise(110), stock: 8000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(106) }, { minQtyKg: 500, ppkg: paise(103) }, { minQtyKg: 1000, ppkg: paise(99) }],
  },

  // ── Bakery bags ───────────────────────────────────────────────────────────────
  {
    title: 'Bakery Non-Woven Bag – Small',
    desc: 'Compact bakery bag for pastries, breads and snack shops. Food-safe non-woven fabric.',
    basePrice: paise(10), images: IMGS.bakery,
    variants: [
      { size: '7×9×3 inch', color: 'White', shape: 'Box Bag', gsm: 60, ppkg: paise(104), stock: 6000 },
      { size: '7×9×3 inch', color: 'Brown', shape: 'Box Bag', gsm: 60, ppkg: paise(104), stock: 5000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(100) }, { minQtyKg: 500, ppkg: paise(97) }, { minQtyKg: 1000, ppkg: paise(93) }],
  },
  {
    title: 'Bakery Non-Woven Bag – Large',
    desc: 'Large bakery bag for cake boxes and bulk pastry orders. Kraft-look print available.',
    basePrice: paise(20), images: IMGS.bakery,
    variants: [
      { size: '12×15×5 inch', color: 'White', shape: 'Box Bag', gsm: 80, ppkg: paise(122), stock: 4000 },
      { size: '12×15×5 inch', color: 'Brown', shape: 'Box Bag', gsm: 80, ppkg: paise(122), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(118) }, { minQtyKg: 500, ppkg: paise(114) }, { minQtyKg: 1000, ppkg: paise(110) }],
  },

  // ── Shoe bags ─────────────────────────────────────────────────────────────────
  {
    title: 'Shoe Non-Woven Bag – Single Pair',
    desc: 'Single-pair shoe bag for footwear stores and hospitality. Keeps shoes dust-free.',
    basePrice: paise(15), images: IMGS.shoe,
    variants: [
      { size: '12×15 inch', color: 'White', shape: 'D-Cut', gsm: 70, ppkg: paise(116), stock: 5000 },
      { size: '12×15 inch', color: 'Black', shape: 'D-Cut', gsm: 70, ppkg: paise(116), stock: 4000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(112) }, { minQtyKg: 500, ppkg: paise(109) }, { minQtyKg: 1000, ppkg: paise(105) }],
  },
  {
    title: 'Shoe Non-Woven Bag – Double Pair',
    desc: 'Wide double-pair shoe bag for sports and fashion retail.',
    basePrice: paise(25), images: IMGS.shoe,
    variants: [
      { size: '16×18 inch', color: 'White', shape: 'D-Cut', gsm: 80, ppkg: paise(124), stock: 3500 },
      { size: '16×18 inch', color: 'Navy',  shape: 'D-Cut', gsm: 80, ppkg: paise(124), stock: 2500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(120) }, { minQtyKg: 500, ppkg: paise(116) }, { minQtyKg: 1000, ppkg: paise(112) }],
  },

  // ── Sari / garment bags ───────────────────────────────────────────────────────
  {
    title: 'Sari Packing Non-Woven Bag',
    desc: 'Long wide sari bag for textile shops and fashion stores. Soft fabric prevents snagging.',
    basePrice: paise(22), images: IMGS.sari,
    variants: [
      { size: '16×20 inch', color: 'White',  shape: 'W-Cut', gsm: 80, ppkg: paise(120), stock: 4000 },
      { size: '16×20 inch', color: 'Pink',   shape: 'W-Cut', gsm: 80, ppkg: paise(120), stock: 3000 },
      { size: '16×20 inch', color: 'Purple', shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 2500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(116) }, { minQtyKg: 500, ppkg: paise(112) }, { minQtyKg: 1000, ppkg: paise(108) }],
  },
  {
    title: 'Garment Cover Non-Woven Bag',
    desc: 'Full-length garment cover bag for suits, kurtas and formal wear. Protects from dust.',
    basePrice: paise(28), images: IMGS.sari,
    variants: [
      { size: '18×36 inch', color: 'White', shape: 'W-Cut', gsm: 60, ppkg: paise(115), stock: 3500 },
      { size: '18×36 inch', color: 'Grey',  shape: 'W-Cut', gsm: 60, ppkg: paise(115), stock: 2800 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(111) }, { minQtyKg: 500, ppkg: paise(108) }, { minQtyKg: 1000, ppkg: paise(104) }],
  },

  // ── Event / wedding bags ──────────────────────────────────────────────────────
  {
    title: 'Wedding Return Gift Non-Woven Bag',
    desc: 'Beautiful wedding return gift bag with golden accent. Popular for shaadi and puja functions.',
    basePrice: paise(35), images: IMGS.event,
    variants: [
      { size: '10×12×3 inch', color: 'Red',  shape: 'Box Bag', gsm: 100, ppkg: paise(148), stock: 3000 },
      { size: '10×12×3 inch', color: 'Gold', shape: 'Box Bag', gsm: 100, ppkg: paise(148), stock: 2500 },
      { size: '10×12×3 inch', color: 'Pink', shape: 'Box Bag', gsm: 100, ppkg: paise(150), stock: 2000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(143) }, { minQtyKg: 500, ppkg: paise(139) }, { minQtyKg: 1000, ppkg: paise(135) }],
  },
  {
    title: 'Corporate Event Non-Woven Bag',
    desc: 'Slim professional bag for corporate seminars, conferences and annual events.',
    basePrice: paise(20), images: IMGS.event,
    variants: [
      { size: '11×14 inch', color: 'Navy',  shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 5000 },
      { size: '11×14 inch', color: 'Black', shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 4000 },
      { size: '11×14 inch', color: 'White', shape: 'W-Cut', gsm: 80, ppkg: paise(120), stock: 5000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(118) }, { minQtyKg: 500, ppkg: paise(114) }, { minQtyKg: 1000, ppkg: paise(110) }],
  },

  // ── Eco bags ──────────────────────────────────────────────────────────────────
  {
    title: 'Eco Non-Woven Bag – Natural Beige',
    desc: 'Undyed natural beige non-woven bag for organic and eco-conscious brands. Fully reusable.',
    basePrice: paise(18), images: IMGS.eco,
    variants: [
      { size: '10×13 inch', color: 'Beige', shape: 'W-Cut', gsm: 80, ppkg: paise(118), stock: 5000 },
      { size: '10×13 inch', color: 'Cream', shape: 'W-Cut', gsm: 80, ppkg: paise(118), stock: 4000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(114) }, { minQtyKg: 500, ppkg: paise(110) }, { minQtyKg: 1000, ppkg: paise(106) }],
  },
  {
    title: 'Eco Non-Woven Bag – Printed Slogan',
    desc: '"Save Earth" slogan printed eco bag. Popular for NGOs, schools and environment campaigns.',
    basePrice: paise(22), images: IMGS.eco,
    variants: [
      { size: '11×14 inch', color: 'Green', shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 5000 },
      { size: '11×14 inch', color: 'White', shape: 'W-Cut', gsm: 80, ppkg: paise(122), stock: 4500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(118) }, { minQtyKg: 500, ppkg: paise(114) }, { minQtyKg: 1000, ppkg: paise(110) }],
  },

  // ── School bags ───────────────────────────────────────────────────────────────
  {
    title: 'School Stationery Non-Woven Bag',
    desc: 'Compact stationery and book bag for schools and coaching centres. Bright colour options.',
    basePrice: paise(12), images: IMGS.school,
    variants: [
      { size: '10×12 inch', color: 'Blue',   shape: 'D-Cut', gsm: 60, ppkg: paise(108), stock: 7000 },
      { size: '10×12 inch', color: 'Red',    shape: 'D-Cut', gsm: 60, ppkg: paise(108), stock: 5000 },
      { size: '10×12 inch', color: 'Yellow', shape: 'D-Cut', gsm: 60, ppkg: paise(110), stock: 5000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(104) }, { minQtyKg: 500, ppkg: paise(101) }, { minQtyKg: 1000, ppkg: paise(97) }],
  },
  {
    title: 'Library Book Non-Woven Bag',
    desc: 'Durable book carry bag for libraries and book fairs. Fits standard textbooks comfortably.',
    basePrice: paise(18), images: IMGS.school,
    variants: [
      { size: '12×15 inch', color: 'Blue',  shape: 'W-Cut', gsm: 70, ppkg: paise(116), stock: 5000 },
      { size: '12×15 inch', color: 'Green', shape: 'W-Cut', gsm: 70, ppkg: paise(116), stock: 4000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(112) }, { minQtyKg: 500, ppkg: paise(108) }, { minQtyKg: 1000, ppkg: paise(105) }],
  },

  // ── Temple bags ───────────────────────────────────────────────────────────────
  {
    title: 'Puja Prasad Non-Woven Bag – Small',
    desc: 'Sacred prasad bag for temples and religious events. Saffron and red colour options.',
    basePrice: paise(6), images: IMGS.temple,
    variants: [
      { size: '6×8 inch', color: 'Saffron', shape: 'D-Cut', gsm: 55, ppkg: paise(96), stock: 15000 },
      { size: '6×8 inch', color: 'Red',     shape: 'D-Cut', gsm: 55, ppkg: paise(96), stock: 12000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(92) }, { minQtyKg: 500, ppkg: paise(89) }, { minQtyKg: 1000, ppkg: paise(85) }],
  },
  {
    title: 'Temple Donation Non-Woven Bag',
    desc: 'Large temple collection and donation bag with print space for temple name and logo.',
    basePrice: paise(15), images: IMGS.temple,
    variants: [
      { size: '10×13 inch', color: 'Saffron', shape: 'D-Cut', gsm: 70, ppkg: paise(114), stock: 8000 },
      { size: '10×13 inch', color: 'Red',     shape: 'D-Cut', gsm: 70, ppkg: paise(114), stock: 6000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(110) }, { minQtyKg: 500, ppkg: paise(107) }, { minQtyKg: 1000, ppkg: paise(103) }],
  },

  // ── Specialty bags ────────────────────────────────────────────────────────────
  {
    title: 'Lightweight Non-Woven Bag – 40 GSM',
    desc: 'Ultra-lightweight 40 GSM bag for mass distribution at events and free gifting campaigns.',
    basePrice: paise(4), images: IMGS.lightweight,
    variants: [
      { size: '9×11 inch', color: 'White', shape: 'D-Cut', gsm: 40, ppkg: paise(82), stock: 25000 },
      { size: '9×11 inch', color: 'Blue',  shape: 'D-Cut', gsm: 40, ppkg: paise(82), stock: 20000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(79) }, { minQtyKg: 500, ppkg: paise(76) }, { minQtyKg: 1000, ppkg: paise(72) }],
  },
  {
    title: 'Cold Storage Non-Woven Bag',
    desc: 'Insulated non-woven bag for frozen food, dairy and cold beverage delivery.',
    basePrice: paise(55), images: IMGS.cold,
    variants: [
      { size: '12×14×5 inch', color: 'White', shape: 'Box Bag', gsm: 120, ppkg: paise(168), stock: 2000 },
      { size: '12×14×5 inch', color: 'Blue',  shape: 'Box Bag', gsm: 120, ppkg: paise(168), stock: 1500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(163) }, { minQtyKg: 500, ppkg: paise(158) }, { minQtyKg: 1000, ppkg: paise(154) }],
  },
  {
    title: 'Drawstring Non-Woven Bag – Small',
    desc: 'Drawstring pouch bag for gym, school and travel accessories. Lightweight and compact.',
    basePrice: paise(16), images: IMGS.drawstring,
    variants: [
      { size: '10×12 inch', color: 'Black', shape: 'D-Cut', gsm: 70, ppkg: paise(118), stock: 5000 },
      { size: '10×12 inch', color: 'Navy',  shape: 'D-Cut', gsm: 70, ppkg: paise(118), stock: 4000 },
      { size: '10×12 inch', color: 'Red',   shape: 'D-Cut', gsm: 70, ppkg: paise(120), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(114) }, { minQtyKg: 500, ppkg: paise(110) }, { minQtyKg: 1000, ppkg: paise(107) }],
  },
  {
    title: 'Drawstring Non-Woven Bag – Large',
    desc: 'Large drawstring bag for sports kits, laundry and travel. Extra cord length for comfort.',
    basePrice: paise(28), images: IMGS.drawstring,
    variants: [
      { size: '14×18 inch', color: 'Black', shape: 'D-Cut', gsm: 80, ppkg: paise(128), stock: 3500 },
      { size: '14×18 inch', color: 'White', shape: 'D-Cut', gsm: 80, ppkg: paise(128), stock: 3000 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(124) }, { minQtyKg: 500, ppkg: paise(120) }, { minQtyKg: 1000, ppkg: paise(116) }],
  },
  {
    title: 'Heavy Duty Non-Woven Bag – 120 GSM',
    desc: 'Extra-strong 120 GSM bag for industrial and heavy retail use. Holds up to 10 kg.',
    basePrice: paise(60), images: IMGS.heavy,
    variants: [
      { size: '14×18 inch', color: 'White', shape: 'W-Cut', gsm: 120, ppkg: paise(172), stock: 2000 },
      { size: '14×18 inch', color: 'Black', shape: 'W-Cut', gsm: 120, ppkg: paise(172), stock: 1800 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(167) }, { minQtyKg: 500, ppkg: paise(162) }, { minQtyKg: 1000, ppkg: paise(158) }],
  },
  {
    title: 'Laminated Non-Woven Bag – Glossy',
    desc: 'Glossy laminated non-woven bag for premium retail. Water-resistant with vibrant print finish.',
    basePrice: paise(45), images: IMGS.laminated,
    variants: [
      { size: '11×14×4 inch', color: 'White', shape: 'Loop Handle', gsm: 90, ppkg: paise(158), stock: 2500 },
      { size: '11×14×4 inch', color: 'Black', shape: 'Loop Handle', gsm: 90, ppkg: paise(158), stock: 2000 },
      { size: '11×14×4 inch', color: 'Gold',  shape: 'Loop Handle', gsm: 90, ppkg: paise(162), stock: 1500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(153) }, { minQtyKg: 500, ppkg: paise(148) }, { minQtyKg: 1000, ppkg: paise(144) }],
  },
  {
    title: 'Laminated Non-Woven Bag – Matte',
    desc: 'Matte laminated bag for luxury brands. Soft-touch premium feel with high-GSM base.',
    basePrice: paise(50), images: IMGS.laminated,
    variants: [
      { size: '11×14×4 inch', color: 'Black',  shape: 'Loop Handle', gsm: 100, ppkg: paise(162), stock: 2000 },
      { size: '11×14×4 inch', color: 'White',  shape: 'Loop Handle', gsm: 100, ppkg: paise(162), stock: 1800 },
      { size: '11×14×4 inch', color: 'Maroon', shape: 'Loop Handle', gsm: 100, ppkg: paise(165), stock: 1500 },
    ],
    tiers: [{ minQtyKg: 200, ppkg: paise(157) }, { minQtyKg: 500, ppkg: paise(152) }, { minQtyKg: 1000, ppkg: paise(148) }],
  },
];

// ── seed ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed — Shree Shyam Bags\n');

  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const productSlug = slug(p.title);

    const exists = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (exists) {
      // Update images if product exists but has no images
      const imgCount = await prisma.productImage.count({ where: { productId: exists.id } });
      if (imgCount === 0) {
        await prisma.productImage.createMany({
          data: p.images.map((url) => ({ url, productId: exists.id })),
        });
        console.log(`  🖼   Images added to "${p.title}"`);
      } else {
        console.log(`  ⏭  Skipped  "${p.title}" (already exists)`);
      }
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        title:       p.title,
        slug:        productSlug,
        description: p.desc,
        basePrice:   p.basePrice,
        isActive:    true,
        images: {
          create: p.images.map((url) => ({ url })),
        },
        variants: {
          create: p.variants.map((v) => ({
            size:       v.size,
            color:      v.color,
            shape:      v.shape,
            gsm:        v.gsm,
            price:      v.ppkg,
            pricePerKg: v.ppkg,
            stock:      v.stock,
            isActive:   true,
            pricingTiers: {
              create: p.tiers.map((t) => ({
                minQtyKg:   t.minQtyKg,
                pricePerKg: t.ppkg,
              })),
            },
          })),
        },
      },
    });

    console.log(`  ✅  Created  "${p.title}" — ${p.images.length} images, ${p.variants.length} variants`);
    created++;
  }

  console.log(`\n🎉  Done — ${created} products created, ${skipped} skipped`);
}

main()
  .catch((e) => { console.error('❌  Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
