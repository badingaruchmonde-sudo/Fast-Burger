// ===== DONNÉES =====
let products = JSON.parse(localStorage.getItem('fb_products') || '[]');
let cart = JSON.parse(localStorage.getItem('fb_cart') || '[]');
let sales = JSON.parse(localStorage.getItem('fb_sales') || '[]');
let nextId = parseInt(localStorage.getItem('fb_nextId') || '1');
let activeCat = 'Tous';
let searchQ = '';

if (!products.length) {
  products = [
    { id: nextId++, nom: 'Hamburger', prix: 2500, categorie: 'Sandwich', stock: 20 },
    { id: nextId++, nom: 'Cheeseburger', prix: 3000, categorie: 'Sandwich', stock: 15 },
    { id: nextId++, nom: 'Pizza Margherita', prix: 5000, categorie: 'Pizza', stock: 10 },
    { id: nextId++, nom: 'Coca-Cola', prix: 800, categorie: 'Boisson', stock: 30 },
    { id: nextId++, nom: 'Glace Vanille', prix: 1000, categorie: 'Dessert', stock: 12 },
  ];
  save();
}

function save() {
  localStorage.setItem('fb_products', JSON.stringify(products));
  localStorage.setItem('fb_cart', JSON.stringify(cart));
  localStorage.setItem('fb_sales', JSON.stringify(sales));
  localStorage.setItem('fb_nextId', String(nextId));
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.backgroundColor = type === 'error' ? '#e74c3c' : '#27ae60';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => (toast.style.display = 'none'), 300);
  }, 2000);
}

// ===== AFFICHAGE =====
function fullRender() {
  renderProducts();
  renderCart();
  updateStats();
  renderHistory();
}

function updateStats() {
  document.getElementById('stat-prods').textContent = products.length;
  document.getElementById('stat-cart').textContent = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('stat-total').textContent =
    cart.reduce((s, c) => s + c.prix * c.qty, 0).toLocaleString('fr-FR');
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  let list = products;
  if (activeCat !== 'Tous') list = list.filter(p => p.categorie === activeCat);
  if (searchQ) list = list.filter(p => p.nom.toLowerCase().includes(searchQ.toLowerCase()));

  grid.innerHTML = list.length
    ? list.map(p => `
      <div class="product-card">
        <div class="product-name">${p.nom}</div>
        <div class="product-cat">${p.categorie}</div>
        <div class="product-price">${p.prix.toLocaleString('fr-FR')} FCFA</div>
        <div class="product-stock ${p.stock <= 3 ? 'low' : ''}">📦 Stock : ${p.stock}</div>
        <div class="qty-ctrl">
          <button class="qty-btn" data-id="${p.id}" data-act="dec">−</button>
          <span class="qty-val" id="qty-${p.id}">0</span>
          <button class="qty-btn" data-id="${p.id}" data-act="inc">+</button>
        </div>
        <button class="btn btn-success btn-full" data-id="${p.id}" data-act="addcart" style="margin-top:4px">Ajouter au panier</button>
        <button class="btn btn-danger btn-full" data-id="${p.id}" data-act="delprod" style="margin-top:2px">Supprimer</button>
      </div>`).join('')
    : '<div class="empty">Aucun produit trouvé</div>';
}

function renderCart() {
  const cartBox = document.getElementById('cart-items');
  const totalBox = document.getElementById('total-box');

  if (!cart.length) {
    cartBox.innerHTML = '<div class="empty">Le panier est vide</div>';
    totalBox.style.display = 'none';
    return;
  }

  totalBox.style.display = 'block';
  let grand = 0;

  cartBox.innerHTML = cart.map(c => {
    const sous = c.prix * c.qty;
    grand += sous;
    return `
      <div class="cart-item">
        <div class="cart-item-name">${c.nom}</div>
        <div class="cart-item-row">
          <div class="qty-ctrl">
            <button class="qty-btn" data-id="${c.id}" data-act="cartdec">−</button>
            <span class="qty-val">${c.qty}</span>
            <button class="qty-btn" data-id="${c.id}" data-act="cartinc">+</button>
          </div>
          <button class="qty-btn" data-id="${c.id}" data-act="cartdel" style="color:#e74c3c;border-color:#e74c3c">🗑</button>
        </div>
        <div class="cart-item-row">
          <span class="cart-item-sub">${c.prix.toLocaleString('fr-FR')} FCFA × ${c.qty}</span>
          <span class="cart-subtotal">${sous.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>`;
  }).join('');

  document.getElementById('total-lines').innerHTML = cart.map(c =>
    `<div class="total-line"><span>${c.nom} ×${c.qty}</span><span>${(c.prix * c.qty).toLocaleString('fr-FR')} FCFA</span></div>`
  ).join('');

  document.getElementById('grand-total').textContent = grand.toLocaleString('fr-FR') + ' FCFA';
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const summary = document.getElementById('history-stats');

  const totalVentes = sales.length;
  const totalCA = sales.reduce((s, v) => s + v.total, 0);

  summary.innerHTML = `
    <div class="stat"><div class="stat-val">${totalVentes}</div><div class="stat-lbl">Ventes réalisées</div></div>
    <div class="stat"><div class="stat-val">${totalCA.toLocaleString('fr-FR')}</div><div class="stat-lbl">Chiffre d'affaires (FCFA)</div></div>
  `;

  list.innerHTML = sales.length
    ? sales.slice().reverse().map(v => `
      <div class="sale-card">
        <div class="sale-card-header">
          <span class="sale-date">${v.date}</span>
          <span class="sale-total">${v.total.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <div class="sale-items">${v.items.map(i => `${i.nom} ×${i.qty}`).join(', ')}</div>
      </div>`).join('')
    : '<div class="empty">Aucune vente enregistrée</div>';
}


document.getElementById('btn-add-prod').addEventListener('click', () => {
  const nom = document.getElementById('p-nom').value.trim();
  const prix = parseFloat(document.getElementById('p-prix').value);
  const cat = document.getElementById('p-cat').value;
  const stock = parseInt(document.getElementById('p-stock').value);

  if (!nom || isNaN(prix) || prix < 0 || !cat || isNaN(stock) || stock < 0) {
    showToast('Veuillez remplir tous les champs correctement.', 'error');
    return;
  }

  products.push({ id: nextId++, nom, prix, categorie: cat, stock });
  save();
  fullRender();
  showToast(`"${nom}" ajouté au menu`);

  ['p-nom', 'p-prix', 'p-stock', 'p-cat'].forEach(id => (document.getElementById(id).value = ''));
});


document.getElementById('toggle-form').addEventListener('click', () => {
  const fields = document.getElementById('form-fields');
  const btn = document.getElementById('toggle-form');
  const isHidden = fields.style.display === 'none';
  fields.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? '▲' : '▼';
});


document.getElementById('search').addEventListener('input', e => {
  searchQ = e.target.value;
  renderProducts();
});

document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    renderProducts();
  });
});


document.getElementById('products-grid').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;

  const id = parseInt(btn.dataset.id);
  const act = btn.dataset.act;
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  const qtyEl = document.getElementById('qty-' + id);
  const curQty = qtyEl ? parseInt(qtyEl.textContent) || 0 : 0;

  if (act === 'inc') {
    if (curQty < prod.stock) qtyEl.textContent = curQty + 1;
    else showToast('Stock insuffisant', 'error');

  } else if (act === 'dec') {
    if (curQty > 0) qtyEl.textContent = curQty - 1;

  } else if (act === 'addcart') {
    if (curQty === 0) { showToast('Sélectionnez une quantité', 'error'); return; }
    if (curQty > prod.stock) { showToast('Stock insuffisant', 'error'); return; }

    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty += curQty;
    else cart.push({ id: prod.id, nom: prod.nom, prix: prod.prix, qty: curQty });

    prod.stock -= curQty;
    save();
    fullRender();
    showToast(`${curQty}× ${prod.nom} ajouté au panier`);

  } else if (act === 'delprod') {
    const inCart = cart.find(c => c.id === id);
    if (inCart) {
      prod.stock += inCart.qty;
      cart = cart.filter(c => c.id !== id);
    }
    products = products.filter(p => p.id !== id);
    save();
    fullRender();
    showToast(`"${prod.nom}" supprimé du menu`);
  }
});


document.getElementById('cart-items').addEventListener('click', e => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;

  const id = parseInt(btn.dataset.id);
  const act = btn.dataset.act;
  const item = cart.find(c => c.id === id);
  const prod = products.find(p => p.id === id);
  if (!item) return;

  if (act === 'cartinc') {
    if (prod && prod.stock > 0) { item.qty++; prod.stock--; }
    else showToast('Stock insuffisant', 'error');

  } else if (act === 'cartdec') {
    if (item.qty > 1) { item.qty--; if (prod) prod.stock++; }
    else { if (prod) prod.stock += item.qty; cart = cart.filter(c => c.id !== id); }

  } else if (act === 'cartdel') {
    if (prod) prod.stock += item.qty;
    cart = cart.filter(c => c.id !== id);
  }

  save();
  fullRender();
});


document.getElementById('btn-clear').addEventListener('click', () => {
  if (!cart.length) { showToast('Le panier est déjà vide', 'error'); return; }
  cart.forEach(c => {
    const p = products.find(p => p.id === c.id);
    if (p) p.stock += c.qty;
  });
  cart = [];
  document.getElementById('invoice-panel').style.display = 'none';
  save();
  fullRender();
  showToast('Panier vidé');
});


document.getElementById('btn-invoice').addEventListener('click', () => {
  if (!cart.length) { showToast('Le panier est vide', 'error'); return; }

  const total = cart.reduce((s, c) => s + c.prix * c.qty, 0);
  const now = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Enregistrement de la vente dans l'historique
  sales.push({
    date: now,
    items: cart.map(c => ({ nom: c.nom, qty: c.qty, prix: c.prix })),
    total
  });
  save();
  renderHistory();

  const lines = cart.map(c =>
    `<div class="invoice-line"><span>${c.nom} ×${c.qty}</span><span>${(c.prix * c.qty).toLocaleString('fr-FR')} FCFA</span></div>`
  ).join('');

  document.getElementById('invoice-content').innerHTML = `
    <div class="invoice">
      <div class="invoice-header">
        <div class="invoice-title">FAST BURGER</div>
        <div class="invoice-date">${now}</div>
      </div>
      <hr class="invoice-separator" />
      ${lines}
      <div class="invoice-total"><span>TOTAL</span><span>${total.toLocaleString('fr-FR')} FCFA</span></div>
      <div class="invoice-footer">Merci de votre visite !</div>
    </div>`;

  document.getElementById('invoice-panel').style.display = 'block';
  document.getElementById('invoice-panel').scrollIntoView({ behavior: 'smooth' });
});

// ===== HISTORIQUE : toggle & effacer =====
document.getElementById('toggle-history').addEventListener('click', () => {
  const fields = document.getElementById('history-fields');
  const btn = document.getElementById('toggle-history');
  const isHidden = fields.style.display === 'none';
  fields.style.display = isHidden ? '' : 'none';
  btn.textContent = isHidden ? '▲' : '▼';
});

document.getElementById('btn-clear-history').addEventListener('click', () => {
  if (!sales.length) { showToast("L'historique est déjà vide", 'error'); return; }
  sales = [];
  save();
  renderHistory();
  showToast('Historique effacé');
});


fullRender();