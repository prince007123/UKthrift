/* Demo cart + wishlist. localStorage only — nothing is sent to any server. */
const Cart = (() => {
  const CK = 'ukt_cart', WK = 'ukt_wish';
  const load = k => { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };
  let items = load(CK), wish = load(WK), coupon = null;
  const fire = () => { save(CK, items); save(WK, wish); document.dispatchEvent(new Event('cart:change')); };
  return {
    get items() { return items; }, get wish() { return wish; }, get coupon() { return coupon; },
    add(l) {
      const key = l.id + '|' + l.size, f = items.find(i => i.key === key);
      if (f) f.qty = Math.min(10, f.qty + (l.qty || 1)); else items.push({ ...l, key, qty: l.qty || 1 });
      fire();
    },
    qty(k, d) { const i = items.find(x => x.key === k); if (!i) return; i.qty = Math.max(1, Math.min(10, i.qty + d)); fire(); },
    remove(k) { items = items.filter(i => i.key !== k); fire(); },
    clear() { items = []; coupon = null; fire(); },
    toggleWish(id) { const on = !wish.includes(id); wish = on ? [...wish, id] : wish.filter(x => x !== id); fire(); return on; },
    count: () => items.reduce((a, i) => a + i.qty, 0),
    subtotal: () => items.reduce((a, i) => a + i.price * i.qty, 0),
    applyCoupon(code) {
      const c = COUPONS[(code || '').trim().toUpperCase()];
      if (!c) { coupon = null; fire(); return 'Invalid demo coupon.'; }
      coupon = { code: code.trim().toUpperCase(), ...c }; fire(); return `${coupon.code} applied (${c.label}).`;
    },
    discount() { if (!coupon) return 0; const s = this.subtotal(); return Math.min(s, coupon.type === 'pct' ? Math.round(s * coupon.v / 100) : coupon.v); },
    total() { return this.subtotal() - this.discount(); }
  };
})();
