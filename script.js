const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const BASE_TITLE = document.title;
let tT;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tT); tT = setTimeout(() => t.classList.remove('on'), 2200); };
function reveal() {
  const io = reveal.io || (reveal.io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); reveal.io.unobserve(x.target); } }), { threshold: .1 }));
  $$('.rv:not(.in)').forEach(n => io.observe(n));
}
const sizeSel = (id, p) => `<select id="${id}" aria-label="Size">${SIZES.map(s => `<option ${stockOf(p, s) ? '' : 'disabled'}>${s}</option>`).join('')}</select>`;

/* ---------- Shop grid (search / filter / sort) ---------- */
const F = { q: '', cat: 'all', tag: '', sort: 'rel' };
const TAGN = { college: 'College Fits', street: 'Street Fits', dark: 'Dark Aesthetic', baggy: 'Baggy & Cargos', tees: 'Oversized Tees' };
function grid() {
  let l = PRODUCTS.filter(p => (F.cat === 'all' || p.cat === F.cat) && (!F.tag || p.tags.includes(F.tag)) &&
    (!F.q || (p.name + ' ' + CATS[p.cat] + ' ' + p.tags.join(' ')).toLowerCase().includes(F.q)));
  if (F.sort === 'lo') l.sort((a, b) => a.price - b.price); if (F.sort === 'hi') l.sort((a, b) => b.price - a.price);
  $('#grid').innerHTML = l.length ? l.map(card).join('') : '<p class="empty">No fits found. Try another search or filter.</p>';
  $('#count').textContent = `${l.length} item${l.length === 1 ? '' : 's'}${F.tag ? ' · ' + TAGN[F.tag] : ''}`;
  $$('[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === F.cat));
  reveal();
}
function setFilter(o, go = true) {
  Object.assign(F, { cat: 'all', tag: '', q: '' }, o); $('#q').value = F.q; $('#sort').value = F.sort; grid();
  if (go) $('#shop').scrollIntoView();
}

/* ---------- Sections ---------- */
const VIBES = [
  ['college', 'COLLEGE FITS', 'Affordable everyday college outfits.', ['UT-T01', 'UT-C01'], '#e8e6df'],
  ['street', 'STREET FITS', 'Bold oversized streetwear combinations.', ['UT-T03', 'UT-C03'], '#d8d4c8'],
  ['dark', 'DARK AESTHETIC', 'Minimal black and neutral outfits.', ['UT-T02', 'UT-C02'], '#2b2b2b'],
  ['baggy', 'BAGGY CULTURE', 'Relaxed fits, cargos, and baggy bottoms.', [null, 'UT-J01'], '#cfd6dd'],
  ['tees', 'OVERSIZED TEES', 'Graphic and minimal oversized T-shirts.', ['UT-T04', null], '#e0dccf']
];
function vibes() {
  $('#vibes').innerHTML = VIBES.map(([t, n, d, [a, b], bg]) =>
    `<a class="vibe rv" href="#shop" data-tag="${t}"><img loading="lazy" src="${outfit(byId(a), byId(b), null, bg)}" alt="${n} outfit illustration"><span><b>${n}</b><small>${d}</small></span></a>`).join('');
}
function fits() {
  $('#fits').innerHTML = PRODUCTS.filter(p => p.cat === 'combo').map((p, i) => {
    const [t, l] = p.items.map(byId);
    return `<article class="fit rv"><div class="ph"><img loading="lazy" src="${artOf(p)}" alt="${p.name}: ${t.name} with ${l.name}"></div>
<div class="fi"><span class="eyebrow">OUTFIT 0${i + 1}</span><h3>${p.name.toUpperCase()}</h3><p>${t.name} + ${l.name}</p>
<p class="pr big">${fmt(p.price)} <s>${fmt(origOf(p))}</s></p><p class="mut">Combo price vs. combined price — demo labels, verify before launch.</p>
<p class="gift">${p.gift}</p>
<div class="sels"><label>Tee size ${sizeSel('ts-' + p.id, t)}</label><label>Lower size ${sizeSel('ls-' + p.id, l)}</label></div>
<button class="btn lime" data-a="fit" data-id="${p.id}">GET THE FIT</button></div></article>`;
  }).join('');
}
let U = 'all';
function under() {
  const l = PRODUCTS.filter(p => p.price < 999 && (U === 'all' || p.cat === U));
  $('#ugrid').innerHTML = l.length ? l.map(card).join('') : '<p class="empty">Nothing here yet.</p>';
  $$('[data-u]').forEach(b => b.classList.toggle('on', b.dataset.u === U)); reveal();
}
function gallery() {
  const g = [['UT-T01', 'UT-C02', '#e8e6df'], ['UT-T02', 'UT-J01', '#d8d4c8'], ['UT-T04', 'UT-C01', '#2b2b2b'], ['UT-T03', 'UT-J02', '#e0dccf'], ['UT-T01', 'UT-C03', '#cfd6dd'], ['UT-T02', 'UT-C01', '#1c1c1c']];
  $('#gal').innerHTML = g.map(([a, b, bg], i) => `<a class="rv" href="${CONFIG.instagram}" target="_blank" rel="noopener"><img loading="lazy" src="${outfit(byId(a), byId(b), i % 2 ? byId('UT-A01') : null, bg)}" alt="UKTHRIFT style post ${i + 1}"></a>`).join('');
}

/* ---------- Build your fit ---------- */
const B = { t: null, l: null, a: null };
function builder() {
  const opt = (k, list) => list.map(p => `<button class="opt" data-a="pick" data-k="${k}" data-id="${p.id}" aria-pressed="false"><img src="${artOf(p)}" alt=""><span>${p.name}<b>${fmt(p.price)}</b></span></button>`).join('');
  $('#bt').innerHTML = opt('t', PRODUCTS.filter(p => p.cat === 'tee'));
  $('#bl').innerHTML = opt('l', PRODUCTS.filter(p => p.cat === 'cargo' || p.cat === 'jeans'));
  $('#ba').innerHTML = opt('a', PRODUCTS.filter(p => p.cat === 'acc')) + '<button class="opt" data-a="pick" data-k="a" data-id="" aria-pressed="true"><span>No accessory<b>₹0</b></span></button>';
  buildUpdate();
}
function buildPrice() {
  const sub = [B.t, B.l, B.a].reduce((a, p) => a + (p ? p.price : 0), 0), d = B.t && B.l ? CONFIG.builderDiscount : 0;
  return { sub, d, total: sub - d };
}
function buildUpdate() {
  $('#bprev').src = outfit(B.t, B.l, B.a, '#e8e6df');
  const { sub, d, total } = buildPrice();
  $('#bsum').innerHTML = [B.t, B.l, B.a].filter(Boolean).map(p => `<li><span>${p.name}</span><span>${fmt(p.price)}</span></li>`).join('') +
    (d ? `<li class="ok"><span>Combo discount</span><span>−${fmt(d)}</span></li>` : '');
  $('#btotal').textContent = fmt(total); $('#bsub').textContent = sub ? `Subtotal ${fmt(sub)}` : 'Pick a tee and a lower to start';
  $$('.opt').forEach(o => o.setAttribute('aria-pressed', String((B[o.dataset.k] ? B[o.dataset.k].id : '') === o.dataset.id)));
  const ts = $('#bts'), ls = $('#bls');
  ts.innerHTML = B.t ? SIZES.map(s => `<option ${stockOf(B.t, s) ? '' : 'disabled'}>${s}</option>`).join('') : '<option>—</option>';
  ls.innerHTML = B.l ? SIZES.map(s => `<option ${stockOf(B.l, s) ? '' : 'disabled'}>${s}</option>`).join('') : '<option>—</option>';
}

/* ---------- Add helpers ---------- */
function addP(p, size, qty = 1) {
  if (p.cat === 'acc') size = 'One size';
  else if (!size) { toast('Select a size first'); return false; }
  else if (!stockOf(p, size)) { toast('That size is sold out'); return false; }
  Cart.add({ id: p.id, name: p.name, price: p.price, size, qty }); toast(`${p.name} added to cart`); openDrawer('cart'); return true;
}

/* ---------- Drawer (cart / wishlist) ---------- */
let mode = 'cart';
function openDrawer(m) { mode = m; renderDrawer(); $('#drawer').classList.add('open'); $('#scrim').classList.add('on'); $('#drawer').setAttribute('aria-hidden', 'false'); }
function closeDrawer() { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('on'); $('#drawer').setAttribute('aria-hidden', 'true'); }
const imgOf = i => i.img || artOf(byId(i.id));
function renderDrawer() {
  const D = $('#dbody'), F2 = $('#dfoot');
  if (mode === 'wish') {
    $('#dtitle').textContent = `WISHLIST (${Cart.wish.length})`; F2.innerHTML = '';
    D.innerHTML = Cart.wish.length ? '<ul class="cl">' + Cart.wish.map(id => { const p = byId(id); return `<li class="ci"><img src="${artOf(p)}" alt=""><div><b>${p.name}</b><small>${fmt(p.price)}</small><a class="ln" href="#/product/${p.id}" data-a="closeD">View &amp; choose size</a></div><div><button class="ln" data-a="wish" data-id="${id}">Remove</button></div></li>`; }).join('') + '</ul>'
      : '<div class="empty"><b>Your wishlist is empty</b><p>Tap ♡ on any piece to save it here.</p><button class="btn sm" data-a="shop">Browse the drop</button></div>';
    return;
  }
  const it = Cart.items; $('#dtitle').textContent = `CART (${Cart.count()})`;
  D.innerHTML = it.length ? '<ul class="cl">' + it.map(i => `<li class="ci"><img src="${imgOf(i)}" alt=""><div><b>${i.name}</b><small>${i.size}</small><div class="q"><button data-a="qty" data-k="${i.key}" data-d="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-a="qty" data-k="${i.key}" data-d="1" aria-label="Increase quantity">+</button></div></div><div class="r"><b>${fmt(i.price * i.qty)}</b><button class="ln" data-a="rm" data-k="${i.key}">Remove</button></div></li>`).join('') + '</ul>'
    : '<div class="empty"><b>Your cart is empty</b><p>Build a full outfit and start with the Complete the Fit section.</p><button class="btn sm" data-a="shop">Start shopping</button></div>';
  F2.innerHTML = it.length ? `<form id="cpf" class="cp"><input id="cpi" placeholder="Demo coupon (UKFIRST / FIT50)" aria-label="Coupon code" value="${Cart.coupon ? Cart.coupon.code : ''}"><button class="btn sm">Apply</button></form><p id="cpm" class="mut"></p>
<div class="tot"><span>Subtotal</span><span>${fmt(Cart.subtotal())}</span></div>${Cart.discount() ? `<div class="tot ok"><span>Coupon ${Cart.coupon.code}</span><span>−${fmt(Cart.discount())}</span></div>` : ''}
<div class="tot big"><span>Total</span><span>${fmt(Cart.total())}</span></div><p class="mut">Demo checkout · shipping not calculated.</p><button class="btn lime full" data-a="checkout">CHECKOUT</button>` : '';
}

/* ---------- Checkout (WhatsApp) ---------- */
function openCheckout() {
  if (!Cart.items.length) return toast('Your cart is empty');
  closeDrawer();
  $('#cosum').innerHTML = Cart.items.map(i => `<li><span>${i.qty}× ${i.name} (${i.size})</span><span>${fmt(i.price * i.qty)}</span></li>`).join('') +
    (Cart.discount() ? `<li class="ok"><span>Coupon ${Cart.coupon.code}</span><span>−${fmt(Cart.discount())}</span></li>` : '') + `<li class="big"><span>Total</span><span>${fmt(Cart.total())}</span></li>`;
  $('#co').showModal();
}
function submitOrder(e) {
  e.preventDefault(); const f = e.target, v = n => f.elements[n].value.trim(); let ok = true;
  const chk = (n, re, m) => { const el = f.elements[n], good = re.test(v(n)); el.setAttribute('aria-invalid', String(!good)); $('#e-' + n).textContent = good ? '' : m; if (!good) ok = false; };
  chk('name', /.{2,}/, 'Enter your name'); chk('phone', /^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');
  chk('address', /.{6,}/, 'Enter your full address'); chk('city', /.{2,}/, 'Enter your city'); chk('state', /.{2,}/, 'Enter your state'); chk('pin', /^\d{6}$/, 'Enter a 6-digit pincode');
  if (!ok) return;
  const msg = `*UKTHRIFT order request (demo checkout)*\n\n` + Cart.items.map(i => `• ${i.qty}× ${i.name} [${i.id}] — ${i.size} — ${fmt(i.price * i.qty)}`).join('\n') +
    `\n\nSubtotal: ${fmt(Cart.subtotal())}` + (Cart.discount() ? `\nCoupon ${Cart.coupon.code}: −${fmt(Cart.discount())}` : '') + `\n*Total: ${fmt(Cart.total())}*\n\n` +
    `Name: ${v('name')}\nPhone: ${v('phone')}\nAddress: ${v('address')}, ${v('city')}, ${v('state')} - ${v('pin')}`;
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  toast('Opening WhatsApp — nothing is saved on a server.'); $('#co').close();
}

/* ---------- Product detail (direct URLs: #/product/UT-T01) ---------- */
function showPdp(p) {
  document.title = `${p.name} — UKTHRIFT`;
  const ts = totalStock(p), rel = PRODUCTS.filter(x => x.id !== p.id && (x.cat === p.cat || x.tags.some(t => p.tags.includes(t)))).slice(0, 4);
  const low = SIZES.filter(s => stockOf(p, s) > 0 && stockOf(p, s) <= 4).map(s => `${s}: ${stockOf(p, s)} left`).join(' · ');
  $('#pdp').innerHTML = `<div class="wrap"><button class="ln x" data-a="closeP">← Back to shop</button>
<div class="pd"><div class="gl"><div class="ph main"><img id="pm" src="${artOf(p)}" alt="${p.name}"></div><div class="ths">${[0, 1, 2].map(v => `<button class="th${v ? '' : ' on'}" data-a="thumb" data-v="${v}" aria-label="Image ${v + 1}"><img src="${artOf(p, v)}" alt=""></button>`).join('')}</div></div>
<div class="pi"><span class="eyebrow">${CATS[p.cat]} · ${p.id}</span><h1>${p.name.toUpperCase()}</h1><p class="pr big">${priceHTML(p)}</p>
<p class="${ts ? 'ok' : 'bad'}">${ts ? 'In stock' : 'Sold out'}${low ? ' — ' + low + ' (demo stock)' : ''}</p><p>${p.desc}</p>
${p.cat === 'acc' ? '<p class="mut">One size</p>' : `<div class="chips lg">${chips(p)}</div><button class="ln" data-a="guide">Size guide</button>`}
<div class="row"><div class="q"><button data-a="pq" data-d="-1" aria-label="Decrease quantity">−</button><span id="pq">1</span><button data-a="pq" data-d="1" aria-label="Increase quantity">+</button></div>
<button class="btn lime" data-a="padd" data-id="${p.id}" ${ts ? '' : 'disabled'}>ADD TO CART</button></div>
<a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Hi UKTHRIFT, I have a question about ${p.name} (${p.id})`)}">WHATSAPP ENQUIRY</a>
<p class="mut"><b>Fabric:</b> ${p.fabric}</p></div></div>
<h2 class="mid">YOU MAY ALSO LIKE</h2><div class="grid">${rel.map(card).join('')}</div></div>`;
  $$('#pdp .rv').forEach(n => n.classList.add('in'));
}
function route() {
  const m = location.hash.match(/^#\/product\/([\w-]+)/), p = m && byId(m[1]), o = $('#pdp');
  if (p) { showPdp(p); o.classList.add('open'); document.body.classList.add('lock'); o.scrollTop = 0; }
  else { o.classList.remove('open'); document.body.classList.remove('lock'); document.title = BASE_TITLE; }
}
const closePdp = () => { history.replaceState(null, '', location.pathname + location.search); route(); };

/* ---------- Events ---------- */
const menu = o => { $('#mm').classList.toggle('open', o); $('#burger').setAttribute('aria-expanded', String(o)); };
document.addEventListener('click', e => {
  const tg = e.target.closest('[data-tag]');
  if (tg) { e.preventDefault(); menu(false); closePdp(); setFilter(tg.dataset.tag === 'all' ? {} : { tag: tg.dataset.tag }); return; }
  const el = e.target.closest('[data-a]'); if (!el) return; const a = el.dataset.a, id = el.dataset.id, p = id && byId(id);
  switch (a) {
    case 'size': $$('.chip', el.parentNode).forEach(c => c.classList.remove('on')); el.classList.add('on'); break;
    case 'wish': { const on = Cart.toggleWish(id); toast(on ? 'Saved to wishlist ♥' : 'Removed from wishlist'); break; }
    case 'view': location.hash = '#/product/' + id; break;
    case 'add': addP(p, ($('.chip.on', el.closest('.card')) || {}).dataset?.s); break;
    case 'fit': { const t = byId(p.items[0]), l = byId(p.items[1]), ts = $('#ts-' + id).value, ls = $('#ls-' + id).value;
      if (!stockOf(t, ts) || !stockOf(l, ls)) return toast('Selected size is sold out');
      Cart.add({ id: p.id, name: p.name, price: p.price, size: `Tee ${ts} / Lower ${ls}`, qty: 1 }); toast(`${p.name} added`); openDrawer('cart'); break; }
    case 'pick': B[el.dataset.k] = id ? byId(id) : null; buildUpdate(); break;
    case 'badd': { if (!B.t || !B.l) return toast('Pick a tee and a lower first');
      const ts = $('#bts').value, ls = $('#bls').value; if (!stockOf(B.t, ts) || !stockOf(B.l, ls)) return toast('Selected size is sold out');
      const pr = buildPrice(); Cart.add({ id: 'BUILD-' + [B.t, B.l, B.a].filter(Boolean).map(x => x.id).join('-'), name: 'Custom Fit: ' + [B.t, B.l, B.a].filter(Boolean).map(x => x.name).join(' + '), price: pr.total, size: `Tee ${ts} / Lower ${ls}`, qty: 1, img: outfit(B.t, B.l, B.a) });
      toast('Your custom fit is in the cart'); openDrawer('cart'); break; }
    case 'qty': Cart.qty(el.dataset.k, +el.dataset.d); break;
    case 'rm': Cart.remove(el.dataset.k); break;
    case 'openCart': openDrawer('cart'); break; case 'openWish': openDrawer('wish'); break;
    case 'closeD': closeDrawer(); break; case 'shop': closeDrawer(); closePdp(); $('#shop').scrollIntoView(); break;
    case 'checkout': openCheckout(); break;
    case 'search': { const s = $('#sb'); s.hidden = !s.hidden; if (!s.hidden) $('#q').focus(); break; }
    case 'menu': menu(!$('#mm').classList.contains('open')); break;
    case 'closeP': closePdp(); break;
    case 'thumb': $('#pm').src = $('img', el).src; $$('.th').forEach(t => t.classList.toggle('on', t === el)); break;
    case 'pq': { const q = $('#pq'); q.textContent = Math.max(1, Math.min(10, +q.textContent + +el.dataset.d)); break; }
    case 'padd': { const s = ($('#pdp .chip.on') || {}).dataset?.s; addP(p, s, +$('#pq').textContent); break; }
    case 'guide': $('#sg').showModal(); break;
    case 'closeDlg': el.closest('dialog').close(); break;
    case 'soon': e.preventDefault(); toast('Placeholder page — add real content before launch'); break;
  }
});
document.addEventListener('click', e => {
  const c = e.target.closest('[data-c]'); if (c) setFilter({ cat: c.dataset.c }, false);
  const u = e.target.closest('[data-u]'); if (u) { U = u.dataset.u; under(); }
  if (e.target.id === 'scrim') closeDrawer();
});
document.addEventListener('submit', e => {
  if (e.target.id === 'cpf') { e.preventDefault(); $('#cpm').textContent = Cart.applyCoupon($('#cpi').value); const m = $('#cpm').textContent; renderDrawer(); $('#cpm').textContent = m; }
  if (e.target.id === 'cof') submitOrder(e);
  if (e.target.id === 'nl') { e.preventDefault(); const i = $('#nle'), ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim()), m = $('#nlm');
    i.setAttribute('aria-invalid', String(!ok)); m.textContent = ok ? 'You’re on the list (demo only — nothing was saved to a server).' : 'Please enter a valid email address.'; if (ok) i.value = ''; }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); menu(false); if ($('#pdp').classList.contains('open')) closePdp(); } });
document.addEventListener('cart:change', () => {
  $('#cc').textContent = Cart.count(); $('#wc').textContent = Cart.wish.length; $('#cc').hidden = !Cart.count(); $('#wc').hidden = !Cart.wish.length;
  if ($('#drawer').classList.contains('open')) renderDrawer();
  $$('.wb').forEach(b => { const on = Cart.wish.includes(b.dataset.id); b.setAttribute('aria-pressed', on); b.textContent = on ? '♥' : '♡'; });
});
window.addEventListener('hashchange', route);
$('#q').addEventListener('input', e => { F.q = e.target.value.trim().toLowerCase(); F.cat = 'all'; F.tag = ''; grid(); });
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') $('#shop').scrollIntoView(); });
$('#sort').addEventListener('change', e => { F.sort = e.target.value; grid(); });

/* ---------- Init ---------- */
$('#bar').textContent = CONFIG.announcement;
$('#heroImg').src = outfit(byId('UT-T01'), byId('UT-C02'), byId('UT-A01'), '#1c1c1c');
$$('.wa').forEach(a => a.href = `https://wa.me/${CONFIG.whatsapp}`); $$('.ig').forEach(a => a.href = CONFIG.instagram);
$('#grid').innerHTML = '<div class="sk"></div>'.repeat(8);
vibes(); fits(); builder(); under(); gallery(); route(); reveal();
setTimeout(grid, 450); document.dispatchEvent(new Event('cart:change'));
