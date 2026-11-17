/* Rendering helpers — no data lives here */
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const byId = id => PRODUCTS.find(p => p.id === id);
const stockOf = (p, s) => p.cat === 'combo' ? Math.min(...p.items.map(i => byId(i).stock[s])) : p.stock[s];
const totalStock = p => SIZES.reduce((a, s) => a + stockOf(p, s), 0);
const origOf = p => p.cat === 'combo' ? p.items.reduce((a, i) => a + byId(i).price, 0) : 0;
const chips = p => SIZES.map(s => `<button class="chip" data-a="size" data-s="${s}" ${stockOf(p, s) ? '' : 'disabled'} aria-label="Size ${s}${stockOf(p, s) ? '' : ' sold out'}">${s}</button>`).join('');
const priceHTML = p => `${fmt(p.price)}${origOf(p) ? ` <s title="Demo combined price">${fmt(origOf(p))}</s>` : ''}`;

const card = p => {
  const w = Cart.wish.includes(p.id);
  return `<article class="card rv"><div class="ph"><a href="#/product/${p.id}" tabindex="-1"><img loading="lazy" src="${artOf(p)}" alt="${p.name} — ${CATS[p.cat]}"></a>
${p.badge ? `<span class="tag">${p.badge}</span>` : ''}
<button class="wb" data-a="wish" data-id="${p.id}" aria-pressed="${w}" aria-label="Wishlist ${p.name}">${w ? '♥' : '♡'}</button>
<button class="qv" data-a="view" data-id="${p.id}">Quick view</button></div>
<h3><a href="#/product/${p.id}">${p.name}</a></h3><p class="pr">${priceHTML(p)}</p>
<div class="chips">${p.cat === 'acc' ? '<span class="one">One size</span>' : chips(p)}</div>
<button class="btn sm" data-a="add" data-id="${p.id}">Add to cart</button></article>`;
};
