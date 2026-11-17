/* ===== UKTHRIFT data layer — swap PRODUCTS/COUPONS for a Sheets/API fetch later ===== */
const CONFIG = {
  brand: 'UKTHRIFT',
  whatsapp: '919999999999',            // <-- replace with real number (country code + number, no +)
  instagram: 'https://instagram.com/ukthrift',
  announcement: 'NEW DROP AVAILABLE — EXPLORE THE COLLECTION',
  builderDiscount: 100,                // ₹ off Build-Your-Fit when tee + lower chosen. Set 0 to disable.
  demo: true
};
const COUPONS = {                      // demo coupons only
  UKFIRST: { type: 'pct', v: 10, label: '10% off' },
  FIT50: { type: 'flat', v: 50, label: '₹50 off' }
};
const SIZES = ['S', 'M', 'L', 'XL'];
const CATS = { tee: 'T-shirts', cargo: 'Cargos', jeans: 'Jeans', acc: 'Accessories', combo: 'Combos' };

/* ---- Generated garment illustrations (no external images, nothing can break) ---- */
const lum = h => { const n = parseInt(h.slice(1), 16); return ((n >> 16) * 299 + (n >> 8 & 255) * 587 + (n & 255) * 114) / 1000; };
const SH = {
  tee: c => `<path d="M120 120L170 100Q200 128 230 100L280 120L335 190L292 218L272 192V400H128V192L108 218L65 190Z" fill="${c}" stroke="#0003" stroke-width="2"/><text x="200" y="215" font-family="Impact,sans-serif" font-size="22" text-anchor="middle" fill="${lum(c) > 140 ? '#111' : '#fff'}">UKTHRIFT</text>`,
  cargo: c => `<path d="M130 80H270L298 440H215L200 210L185 440H102Z" fill="${c}" stroke="#0003" stroke-width="2"/><rect x="112" y="250" width="50" height="70" fill="#000" opacity=".15"/><rect x="238" y="250" width="50" height="70" fill="#000" opacity=".15"/><rect x="130" y="80" width="140" height="18" fill="#000" opacity=".2"/>`,
  jeans: c => `<path d="M135 80H265L290 440H215L200 200L185 440H110Z" fill="${c}" stroke="#0003" stroke-width="2"/><path d="M200 200V90M150 110Q175 130 190 112M250 110Q225 130 210 112" stroke="#fff" stroke-opacity=".4" fill="none" stroke-dasharray="4 3"/>`,
  acc: c => `<path d="M110 300Q110 150 200 150Q290 150 290 300Z" fill="${c}" stroke="#0003" stroke-width="2"/><rect x="104" y="290" width="192" height="44" rx="6" fill="${c}" stroke="#0003" stroke-width="2"/><path d="M130 292V332M160 292V332M190 292V332M220 292V332M250 292V332M280 292V332" stroke="#000" opacity=".2"/>`
};
const wrap = (inner, bg, vb = '0 0 400 500') => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><rect width="400" height="500" fill="${bg}"/>${inner}</svg>`);
function outfit(t, l, a, bg = '#e8e6df') {
  let s = '';
  if (t && l) s += `<g transform="translate(80 170) scale(.6)">${SH[l.cat](l.color)}</g><g transform="translate(80 10) scale(.6)">${SH.tee(t.color)}</g>`;
  else if (t || l) { const x = t || l; s += SH[x.cat](x.color); }
  else s += `<rect x="60" y="80" width="280" height="340" fill="none" stroke="#888" stroke-dasharray="8 8"/><text x="200" y="255" text-anchor="middle" font-family="Impact,sans-serif" font-size="26" fill="#888">PICK YOUR PIECES</text>`;
  if (a) s += `<g transform="translate(300 20) scale(.3)">${SH.acc(a.color)}</g>`;
  return wrap(s, bg);
}
function artOf(p, view = 0) {
  const bg = view === 2 ? '#161616' : '#e8e6df', vb = view === 1 ? '70 70 260 325' : '0 0 400 500';
  if (p.cat === 'combo') return outfit(byId(p.items[0]), byId(p.items[1]), null, bg);
  return wrap(SH[p.cat](p.color), bg, vb);
}

/* ---- Products. stock = demo size-wise inventory ---- */
const PRODUCTS = [
  { id: 'UT-T01', name: 'Oversized White Tee', cat: 'tee', price: 449, color: '#f4f4f0', badge: 'Best Seller', tags: ['college', 'tees'], stock: { S: 8, M: 12, L: 10, XL: 4 }, desc: 'Clean oversized drop-shoulder tee with a minimal chest mark. Built for everyday college wear.', fabric: 'Demo: 100% cotton, 180 GSM' },
  { id: 'UT-T02', name: 'Washed Black Graphic Tee', cat: 'tee', price: 499, color: '#161616', badge: 'New', tags: ['street', 'dark', 'tees'], stock: { S: 5, M: 9, L: 7, XL: 0 }, desc: 'Faded black oversized tee with a bold back graphic. Pairs with every baggy bottom.', fabric: 'Demo: cotton, 200 GSM, washed finish' },
  { id: 'UT-T03', name: 'Boxy Sand Tee', cat: 'tee', price: 449, color: '#cdbb9a', badge: '', tags: ['street', 'tees'], stock: { S: 6, M: 10, L: 8, XL: 6 }, desc: 'Boxy-cut neutral tee. Soft, structured, easy to layer.', fabric: 'Demo: cotton, 180 GSM' },
  { id: 'UT-T04', name: 'Olive Oversized Tee', cat: 'tee', price: 479, color: '#5b6340', badge: 'New', tags: ['street', 'tees'], stock: { S: 4, M: 8, L: 8, XL: 3 }, desc: 'Earthy olive oversized tee that works with black or beige lowers.', fabric: 'Demo: cotton, 190 GSM' },
  { id: 'UT-C01', name: 'Beige Baggy Cargo', cat: 'cargo', price: 749, color: '#c9b79c', badge: 'Best Seller', tags: ['college', 'baggy'], stock: { S: 5, M: 9, L: 9, XL: 5 }, desc: 'Relaxed baggy cargo with deep side pockets and an easy drawcord waist.', fabric: 'Demo: cotton twill' },
  { id: 'UT-C02', name: 'Black Utility Cargo', cat: 'cargo', price: 799, color: '#1b1b1b', badge: '', tags: ['dark', 'street', 'baggy'], stock: { S: 3, M: 7, L: 6, XL: 4 }, desc: 'All-black utility cargo with a wide leg and tonal pockets.', fabric: 'Demo: cotton twill' },
  { id: 'UT-C03', name: 'Olive Parachute Cargo', cat: 'cargo', price: 849, color: '#4f5a3a', badge: 'New', tags: ['street', 'baggy'], stock: { S: 4, M: 6, L: 5, XL: 2 }, desc: 'Lightweight parachute-style cargo with a dramatic baggy silhouette.', fabric: 'Demo: nylon blend' },
  { id: 'UT-J01', name: 'Washed Blue Baggy Jeans', cat: 'jeans', price: 899, color: '#5d7fa3', badge: 'Best Seller', tags: ['baggy', 'college'], stock: { S: 4, M: 8, L: 8, XL: 4 }, desc: 'Classic washed-blue baggy denim with a relaxed straight leg.', fabric: 'Demo: 12 oz denim' },
  { id: 'UT-J02', name: 'Black Baggy Jeans', cat: 'jeans', price: 949, color: '#222', badge: '', tags: ['dark', 'baggy'], stock: { S: 3, M: 6, L: 6, XL: 3 }, desc: 'Deep black baggy jeans. The base of every dark aesthetic fit.', fabric: 'Demo: 12 oz denim' },
  { id: 'UT-A01', name: 'Ribbed Black Beanie', cat: 'acc', price: 199, color: '#111', badge: 'New', tags: ['dark', 'street'], stock: { S: 20, M: 20, L: 20, XL: 20 }, desc: 'Ribbed one-size beanie to finish the fit.', fabric: 'Demo: acrylic rib knit' },
  { id: 'UT-B01', name: 'The College Fit', cat: 'combo', items: ['UT-T01', 'UT-C01'], price: 949, badge: 'Combo', gift: 'Free pocket gift included (demo offer)', tags: ['college'], desc: 'Oversized White Tee + Beige Baggy Cargo. A full coordinated outfit in one add.', fabric: 'See individual pieces' },
  { id: 'UT-B02', name: 'The Street Fit', cat: 'combo', items: ['UT-T02', 'UT-C02'], price: 979, badge: 'Combo', gift: 'Free pocket gift included (demo offer)', tags: ['street', 'dark'], desc: 'Washed Black Graphic Tee + Black Utility Cargo. Dark, bold, ready to go.', fabric: 'See individual pieces' }
];
