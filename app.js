
let products = JSON.parse(localStorage.getItem('fb_products') || '[]');
let cart     = JSON.parse(localStorage.getItem('fb_cart')     || '[]');
let nextId   = parseInt(localStorage.getItem('fb_nextId')     || '1');

let activeCat = 'Tous';
let searchQ   = '';


const DEFAULT_PRODUCTS = [
  
  { id: nextId++, nom: 'Hamburger',        prix: 2500, categorie: 'Sandwich', stock: 20},
  { id: nextId++, nom: 'Cheeseburger',     prix: 3000, categorie: 'Sandwich', stock: 15 },
  { id: nextId++, nom: 'Pizza Margherita', prix: 5000, categorie: 'Pizza',    stock: 10 },
  { id: nextId++, nom: 'Coca-Cola',        prix:  800, categorie: 'Boisson',  stock: 30 },
  { id: nextId++, nom: 'Glace Vanille',    prix: 1000, categorie: 'Dessert',  stock: 12 },
];

if (!products.length) {
  products = DEFAULT_PRODUCTS;
  save();
}

function save() {
  localStorage.setItem('fb_products', JSON.stringify(products));
  localStorage.setItem('fb_cart',     JSON.stringify(cart));
  localStorage.setItem('fb_nextId',   String(nextId));
}



function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.display      = 'block';
  toast.style.opacity      = '1';
  toast.style.backgroundColor = type === 'error' ? '#e74c3c' : '#27ae60';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 2000);
}


function updateStats() {
  const totalItems = cart.reduce((sum, c) => sum + c.qty, 0);
  const totalMoney = cart.reduce((sum, c) => sum + c.prix * c.qty, 0);

  document.getElementById('stat-prods').textContent = products.length;
  document.getElementById('stat-cart').textContent  = totalItems;
  document.getElementById('stat-total').textContent = totalMoney.toLocaleString('fr-FR');
}


/*
   AFFICHAGE DES PRODUITS
 */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  let list = products;

  if (activeCat !== 'Tous') {
    list = list.filter(p => p.categorie === activeCat);
  }
  if (searchQ) {
    list = list.filter(p => p.nom.toLowerCase().includes(searchQ.toLowerCase()));
  }

  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = '<div class="empty">Aucun produit trouvé</div>';
    return;
  }

  list.forEach(p => {
    // Quantité actuellement sélectionnée sur la carte (hors panier)
    const cartItem  = cart.find(c => c.id === p.id);
    const selectedQ = 0; // remis à 0 après chaque ajout

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
    
      <div class="product-name">${p.nom}</div>
      <div class="product-cat">${p.categorie}</div>
      <div class="product-price">${p.prix.toLocaleString('fr-FR')} FCFA</div>
      <div class="product-stock ${p.stock <= 3 ? 'low' : ''}">
        📦 Stock : ${p.stock}
      </div>

      <div class="qty-ctrl">
        <button class="qty-btn" data-id="${p.id}" data-act="dec" aria-label="Diminuer la quantité">−</button>
        <span class="qty-val" id="qty-${p.id}">${selectedQ}</span>
        <button class="qty-btn" data-id="${p.id}" data-act="inc" aria-label="Augmenter la quantité">+</button>
      </div>
      <button class="btn btn-success btn-full" data-id="${p.id}" data-act="addcart"
              style="margin-top:4px">Ajouter au panier</button>
      <button class="btn btn-danger btn-full"  data-id="${p.id}" data-act="delprod"
              style="margin-top:2px">Supprimer</button>
    `;
    grid.appendChild(card);
  });
}


/*
   AFFICHAGE DU PANIER
    */
function renderCart() {
  const cartBox  = document.getElementById('cart-items');
  const totalBox = document.getElementById('total-box');
  const linesBox = document.getElementById('total-lines');

  if (!cart.length) {
    cartBox.innerHTML = '<div class="empty">Le panier est vide</div>';
    totalBox.style.display = 'none';
    return;
  }

  totalBox.style.display = 'block';
  cartBox.innerHTML = '';
  let linesHTML = '';
  let grand = 0;

  cart.forEach(c => {
    const sous = c.prix * c.qty;
    grand += sous;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-name">${c.nom}</div>
      <div class="cart-item-row">
        <div class="qty-ctrl">
          <button class="qty-btn" data-id="${c.id}" data-act="cartdec" aria-label="Diminuer">−</button>
          <span class="qty-val">${c.qty}</span>
          <button class="qty-btn" data-id="${c.id}" data-act="cartinc" aria-label="Augmenter">+</button>
        </div>
        <button class="qty-btn" data-id="${c.id}" data-act="cartdel" aria-label="Supprimer du panier"
                style="color:#e74c3c;border-color:#e74c3c">🗑</button>
      </div>
      <div class="cart-item-row">
        <span class="cart-item-sub">${c.prix.toLocaleString('fr-FR')} FCFA × ${c.qty}</span>
        <span class="cart-subtotal">${sous.toLocaleString('fr-FR')} FCFA</span>
      </div>
    `;
    cartBox.appendChild(row);

    linesHTML += `
      <div class="total-line">
        <span>${c.nom} ×${c.qty}</span>
        <span>${sous.toLocaleString('fr-FR')} FCFA</span>
      </div>`;
  });

  linesBox.innerHTML = linesHTML;
  document.getElementById('grand-total').textContent =
    grand.toLocaleString('fr-FR') + ' FCFA';
}


/* 
   RENDU COMPLET
 */
function fullRender() {
  renderProducts();
  renderCart();
  updateStats();
}


/* 
   AJOUT D'UN PRODUIT AU MENU
    */
document.getElementById('btn-add-prod').addEventListener('click', () => {
  const nom   = document.getElementById('p-nom').value.trim();
  const prix  = parseFloat(document.getElementById('p-prix').value);
  const cat   = document.getElementById('p-cat').value;
  const stock = parseInt(document.getElementById('p-stock').value);

  if (!nom || isNaN(prix) || prix < 0 || !cat || isNaN(stock) || stock < 0) {
    showToast('Veuillez remplir tous les champs correctement.', 'error');
    return;
  }

  products.push({ id: nextId++, nom, prix, categorie: cat, stock });
  save();
  fullRender();
  showToast(`"${nom}" ajouté au menu`);

  // Réinitialiser le formulaire
  document.getElementById('p-nom').value   = '';
  document.getElementById('p-prix').value  = '';
  document.getElementById('p-stock').value = '';
  document.getElementById('p-cat').value   = '';
});


/* 
   Formulaire
   */
document.getElementById('toggle-form').addEventListener('click', () => {
  const fields = document.getElementById('form-fields');
  const btn    = document.getElementById('toggle-form');
  const isHidden = fields.style.display === 'none';
  fields.style.display = isHidden ? '' : 'none';
  btn.textContent      = isHidden ? '▲' : '▼';
});


/* 
   RECHERCHE
 */
document.getElementById('search').addEventListener('input', e => {
  searchQ = e.target.value;
  renderProducts();
});


/* 
   FILTRES PAR CATÉGORIE
    */
document.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCat = btn.dataset.cat;
    renderProducts();
  });
});



/*
  Le panier
*/
document.getElementById('cart-items').addEventListener('click', e => {
  const btn  = e.target.closest('[data-act]');
  if (!btn) return;

  const id   = parseInt(btn.dataset.id);
  const act  = btn.dataset.act;
  const item = cart.find(c => c.id === id);
  const prod = products.find(p => p.id === id);
  if (!item) return;

  if (act === 'cartinc') {
    if (prod && prod.stock > 0) {
      item.qty++;
      prod.stock--;
    } else {
      showToast('Stock insuffisant', 'error');
    }

  } else if (act === 'cartdec') {
    if (item.qty > 1) {
      item.qty--;
      if (prod) prod.stock++;
    } else {
      // Quantité tombe à 0 → retirer du panier
      if (prod) prod.stock += item.qty;
      cart = cart.filter(c => c.id !== id);
    }

  } else if (act === 'cartdel') {
    if (prod) prod.stock += item.qty;
    cart = cart.filter(c => c.id !== id);
  }

  save();
  fullRender();
});


/*
   VIDER LE PANIER
*/
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


/* 
   GÉNÉRATION DE FACTURE
*/
document.getElementById('btn-invoice').addEventListener('click', () => {
  if (!cart.length) { showToast('Le panier est vide', 'error'); return; }

  const panel   = document.getElementById('invoice-panel');
  const content = document.getElementById('invoice-content');
  const total   = cart.reduce((s, c) => s + c.prix * c.qty, 0);
  const now     = new Date().toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const lines = cart.map(c =>
    `<div class="invoice-line">
       <span>${c.nom} ×${c.qty}</span>
       <span>${(c.prix * c.qty).toLocaleString('fr-FR')} FCFA</span>
     </div>`
  ).join('');

  content.innerHTML = `
    <div class="invoice">
      <div class="invoice-header">
        <div class="invoice-title">FAST BURGER</div>
        <div class="invoice-date">${now}</div>
      </div>
      <hr class="invoice-separator" />
      ${lines}
      <div class="invoice-total">
        <span>TOTAL</span>
        <span>${total.toLocaleString('fr-FR')} FCFA</span>
      </div>
      <div class="invoice-footer">Merci de votre visite !</div>
    </div>
  `;

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth' });
});


/* 
   INITIALISATION
 */
fullRender();
