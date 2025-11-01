// Data contoh menu
const MENU_ITEMS = [
  {
    id: "cup-injection",
    name: "Cup Injection",
    price: 20000,
    image: "./assets/cup-injection.png",
  },
  {
    id: "paper-cup",
    name: "Paper Cup",
    price: 7500,
    image: "./assets/paper-cup.png",
  },
  {
    id: "plastik",
    name: "Plastik",
    price: 7500,
    image: "./assets/plastik.png",
  },
  {
    id: "gula",
    name: "Gula",
    price: 17500,
    image: "./assets/gula.png",
  },
  {
    id: "indomilk",
    name: "Indomilk",
    price: 15000,
    image: "./assets/indomilk.png",
  },
  {
    id: "milo",
    name: "Milo",
    price: 19000,
    image: "./assets/milo.png",
  },
  {
    id: "brownies-crispy",
    name: "Brownies Crispy",
    price: 20000,
    image: "./assets/brownies-crispy.png",
  },
  {
    id: "chimi",
    name: "Chimi",
    price: 18000,
    image: "./assets/chimi.png",
  },
  {
    id: "beng-beng",
    name: "Beng-Beng",
    price: 38000,
    image: "./assets/beng-beng.png",
  },
  {
    id: "fruta-gummy",
    name: "Fruta Gummy",
    price: 18000,
    image: "./assets/fruta-gummy.png",
  },
  {
    id: "permen-kis",
    name: "Permen Kis",
    price: 7000,
    image: "./assets/permen-kis.png",
  },
  {
    id: "permen-kopiko",
    name: "Permen Kopiko",
    price: 10000,
    image: "./assets/permen-kopiko.png",
  },
  {
    id: "nextar",
    name: "Nextar",
    price: 17000,
    image: "./assets/nextar.png",
  },
  {
    id: "chocolate-pie",
    name: "Chocolate Pie",
    price: 20000,
    image: "./assets/chocolate-pie.png",
  },
  {
    id: "nabati-wafer",
    name: "Nabati Wafer",
    price: 17000,
    image: "./assets/nabati-wafer.png",
  },
  {
    id: "nabati-wafer-mini",
    name: "Nabati Wafer Mini",
    price: 8500,
    image: "./assets/nabati-wafer-mini.png",
  },
  {
    id: "nabati-rolls",
    name: "Nabati Rolls",
    price: 17000,
    image: "./assets/nabati-rolls.png",
  },
  {
    id: "nabati-pasta",
    name: "Nabati Pasta",
    price: 13000,
    image: "./assets/nabati-pasta.png",
  },
  {
    id: "time-break",
    name: "Time Break",
    price: 17000,
    image: "./assets/time-break.png",
  },
  {
    id: "choco-chips",
    name: "Choco Chips",
    price: 9000,
    image: "./assets/choco-chips.png",
  },
  {
    id: "sereal-2in1",
    name: "Sereal 2in1",
    price: 18000,
    image: "./assets/sereal-2in1.png",
  },
];

// Formatter Rupiah
const fmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

// State + persistence
const STATE_KEY = 'agen-alamanda-state-v1';
let state = { quantities: {}, modalRows: [], jual: { price: 0, qty: 0 } };
function loadState(){
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY));
    if (s && typeof s === 'object') state = Object.assign(state, s);
  } catch(e) { /* ignore */ }
}
function saveState(){
  try { localStorage.setItem(STATE_KEY, JSON.stringify({
    quantities: state.quantities, modalRows: state.modalRows, jual: state.jual
  })); } catch(e){ /* ignore */ }
}

// Helpers
const toInt = v => { const n = parseInt(v,10); return Number.isFinite(n) ? n : 0; };
const esc = s => String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

// DOM refs
const itemsGrid = document.getElementById('items-grid');
const totalBayarEl = document.getElementById('total-bayar');
const btnHitungStruk = document.getElementById('btn-hitung-struk');
const overlay = document.getElementById('overlay');
const receiptList = document.getElementById('receipt-list');
const receiptTotal = document.getElementById('receipt-total');

const fab = document.getElementById('fab');
const fabIcon = document.getElementById('fab-icon');
const fabTooltip = document.getElementById('fab-tooltip');
const menuPesanan = document.getElementById('menu-pesanan');
const menuHarga = document.getElementById('menu-harga');

const modalRowsEl = document.getElementById('modal-rows');
const btnAddRow = document.getElementById('btn-add-row');
const totalModalEl = document.getElementById('total-modal');

const hargaJualInput = document.getElementById('harga-jual');
const jumlahJualInput = document.getElementById('jumlah-jual');
const totalJualEl = document.getElementById('total-jual');

const btnHitungHarga = document.getElementById('btn-hitung-harga');
const hargaResultCard = document.getElementById('harga-result');
const resTotalModal = document.getElementById('res-total-modal');
const resTotalJual = document.getElementById('res-total-jual');
const resProfit = document.getElementById('res-profit');
const resProfitUnit = document.getElementById('res-profit-unit');

// RENDER menu items
function renderMenuItems(){
  itemsGrid.innerHTML = '';
  MENU_ITEMS.forEach(it => {
    const qty = state.quantities[it.id] || 0;
    const card = document.createElement('article');
    card.className = 'card-item';
    card.innerHTML = `
      <div class="item-media" aria-hidden="true"><img src="${it.image}" alt=""></div>
      <div class="item-body">
        <div class="item-title">${esc(it.name)}</div>
        <div class="item-price">${fmt.format(it.price)}</div>
      </div>
      <div class="qty-controls" aria-live="polite">
        <button class="btn-round btn-decr" data-id="${it.id}" aria-label="Kurangi ${esc(it.name)}">−</button>
        <div class="qty-display" id="qty-${it.id}">${qty}</div>
        <button class="btn-round btn-incr" data-id="${it.id}" aria-label="Tambah ${esc(it.name)}">+</button>
      </div>
    `;
    itemsGrid.appendChild(card);
  });

  // attach handlers via delegation for reliability
  itemsGrid.querySelectorAll('.btn-incr').forEach(b => b.addEventListener('click', e => {
    const id = e.currentTarget.dataset.id;
    state.quantities[id] = (state.quantities[id]||0) + 1;
    document.getElementById(`qty-${id}`).textContent = state.quantities[id];
    updateTotalBayar(); saveState();
  }));
  itemsGrid.querySelectorAll('.btn-decr').forEach(b => b.addEventListener('click', e => {
    const id = e.currentTarget.dataset.id;
    state.quantities[id] = Math.max(0, (state.quantities[id]||0) - 1);
    document.getElementById(`qty-${id}`).textContent = state.quantities[id];
    updateTotalBayar(); saveState();
  }));
}

// Total bayar
function calculateTotalBayar(){ return MENU_ITEMS.reduce((s,it)=> s + (state.quantities[it.id]||0) * it.price, 0); }
function updateTotalBayar(){ const t = calculateTotalBayar(); totalBayarEl.textContent = fmt.format(t); btnHitungStruk.disabled = t === 0; }

// Receipt modal (show/hide using style.display to avoid hidden-attribute edge cases)
function openReceipt(){
  receiptList.innerHTML = '';
  let total = 0;
  MENU_ITEMS.forEach(it => {
    const q = state.quantities[it.id] || 0;
    if(q > 0){
      const sub = q * it.price; total += sub;
      const r = document.createElement('div'); r.className = 'receipt-item';
      r.innerHTML = `<div>${esc(it.name)} × ${q}</div><div>${fmt.format(sub)}</div>`;
      receiptList.appendChild(r);
    }
  });
  receiptTotal.textContent = fmt.format(total);
  if (overlay) overlay.style.display = 'flex';
  // focus for accessibility
  const closeBtn = document.getElementById('close-modal');
  if (closeBtn) closeBtn.focus();
}
function closeReceipt(){
  if (overlay) overlay.style.display = 'none';
}

// Reset order
function resetOrder(){
  state.quantities = {};
  renderMenuItems();
  updateTotalBayar();
  closeReceipt();
  saveState();
}

// Safe modal handlers: delegation on document to ensure clicks are caught
function setupModalHandlers(){
  // show receipt button
  if (btnHitungStruk) btnHitungStruk.addEventListener('click', openReceipt);

  // delegate clicks for close/reset (works even if elements changed)
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('#close-modal, #close-modal-2');
    if (closeBtn) { closeReceipt(); return; }
    const resetBtn = e.target.closest('#reset-order');
    if (resetBtn) { resetOrder(); return; }
  });

  // click on overlay outside modal closes it
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeReceipt(); });

  // ESC closes modal
  window.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') closeReceipt(); });
}

// FAB/menu switch
function setFabForMenu(menu){
  if(menu === 'pesanan'){
    fab.setAttribute('aria-label','Kalkulator Harga');
    fabTooltip.textContent = 'Kalkulator Harga';
    fabIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#fff" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4h6v2H9V6zm0 4h2v2H9v-2zm4 0h2v2h-2v-2zM9 16h2v2H9v-2zm4 0h2v2h-2v-2z"/></svg>`;
  } else {
    fab.setAttribute('aria-label','Kembali ke Pesanan');
    fabTooltip.textContent = 'Kembali ke Pesanan';
    fabIcon.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#fff" d="M10 3v2H5v14h14V5h-5V3h7v18H3V3z"/></svg>`;
  }
}
function setupFab(){
  if (!fab) return;
  fab.addEventListener('click', () => {
    const isPesanan = menuPesanan.classList.contains('active');
    if (isPesanan) {
      menuPesanan.classList.remove('active'); menuHarga.classList.add('active'); setFabForMenu('harga');
    } else {
      menuHarga.classList.remove('active'); menuPesanan.classList.add('active'); setFabForMenu('pesanan');
    }
  });
  setFabForMenu('pesanan');
}

// Modal rows (Menu 2)
function createModalRowObj(opts={}){ return { id: opts.id || ('r_'+Math.random().toString(36).slice(2,9)), name: opts.name||'', price: toInt(opts.price||0), qty: toInt(opts.qty||0) }; }
function ensureModalRows(){ if (!Array.isArray(state.modalRows) || state.modalRows.length === 0) state.modalRows = [createModalRowObj()]; }
function renderModalRows(){
  modalRowsEl.innerHTML = '';
  ensureModalRows();
  state.modalRows.forEach(row => {
    const el = document.createElement('div'); el.className = 'modal-row'; el.dataset.id = row.id;
    el.innerHTML = `
      <input class="r-name" placeholder="Nama barang" value="${esc(row.name)}" aria-label="Nama barang" />
      <input class="r-price" type="number" min="0" inputmode="numeric" value="${row.price}" aria-label="Harga" />
      <input class="r-qty" type="number" min="0" inputmode="numeric" value="${row.qty}" aria-label="Jumlah" />
      <div class="r-subtotal" aria-label="Subtotal">${fmt.format(row.price * row.qty)}</div>
      <button class="row-remove" aria-label="Hapus baris">✕</button>
    `;
    modalRowsEl.appendChild(el);

    const nameI = el.querySelector('.r-name'), priceI = el.querySelector('.r-price'), qtyI = el.querySelector('.r-qty'),
          subE = el.querySelector('.r-subtotal'), rm = el.querySelector('.row-remove');

    nameI.addEventListener('input', e => { row.name = e.target.value; saveState(); });
    priceI.addEventListener('input', e => { row.price = toInt(e.target.value); subE.textContent = fmt.format(row.price * row.qty); updateTotalModal(); saveState(); });
    qtyI.addEventListener('input', e => { row.qty = toInt(e.target.value); subE.textContent = fmt.format(row.price * row.qty); updateTotalModal(); saveState(); });
    rm.addEventListener('click', () => { state.modalRows = state.modalRows.filter(r => r.id !== row.id); renderModalRows(); updateTotalModal(); saveState(); });
  });
}
function updateTotalModal(){
  const t = state.modalRows.reduce((s,r)=> s + toInt(r.price) * toInt(r.qty), 0);
  totalModalEl.textContent = fmt.format(t);
  resTotalModal.textContent = fmt.format(t);
}

// Harga jual handlers
function updateTotalJual(){
  const price = toInt(hargaJualInput.value || state.jual.price);
  const qty = toInt(jumlahJualInput.value || state.jual.qty);
  const tot = price * qty;
  totalJualEl.textContent = fmt.format(tot);
  resTotalJual.textContent = fmt.format(tot);
  state.jual.price = price; state.jual.qty = qty; saveState();
}
function setupHargaJualHandlers(){
  if (hargaJualInput) hargaJualInput.addEventListener('input', updateTotalJual);
  if (jumlahJualInput) jumlahJualInput.addEventListener('input', updateTotalJual);
  if (btnHitungHarga) btnHitungHarga.addEventListener('click', () => {
    const totalModal = state.modalRows.reduce((s,r)=> s + toInt(r.price) * toInt(r.qty), 0);
    const totalJual = toInt(hargaJualInput.value) * toInt(jumlahJualInput.value);
    const profit = totalJual - totalModal;
    const profitPerUnit = toInt(jumlahJualInput.value) === 0 ? null : Math.round(profit / toInt(jumlahJualInput.value));
    resTotalModal.textContent = fmt.format(totalModal);
    resTotalJual.textContent = fmt.format(totalJual);
    resProfit.textContent = fmt.format(profit);
    resProfitUnit.textContent = profitPerUnit === null ? '—' : fmt.format(profitPerUnit);
    hargaResultCard.hidden = false;
  });
}

// Init
function init(){
  loadState();
  MENU_ITEMS.forEach(it => { if (state.quantities[it.id] == null) state.quantities[it.id] = 0; });
  renderMenuItems(); updateTotalBayar();
  ensureModalRows(); renderModalRows(); updateTotalModal();

  // restore jual inputs
  if (hargaJualInput) hargaJualInput.value = state.jual.price || '';
  if (jumlahJualInput) jumlahJualInput.value = state.jual.qty || '';
  updateTotalJual();

  setupModalHandlers(); setupFab(); setupHargaJualHandlers();

  if (btnAddRow) btnAddRow.addEventListener('click', () => { state.modalRows.push(createModalRowObj()); renderModalRows(); updateTotalModal(); saveState(); });

  // ensure overlay initial hidden
  if (overlay) overlay.style.display = 'none';
}
init();