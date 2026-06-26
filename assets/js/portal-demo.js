// Customer Portal Prototype Demo
(function () {
  const ORDERS = [
    { id: 'PO-2847', customer: 'Apex Industrial Supply', product: 'Custom bracket assembly', status: 'in_production', due: '2026-07-02', qty: 2400, proof: 'approved', shipments: [{ carrier: 'FedEx Freight', tracking: '784923456789', eta: '2026-07-05', status: 'Scheduled' }], proofHistory: [{ date: '2026-06-10', action: 'Proof v1 sent', by: 'Design Team' }, { date: '2026-06-12', action: 'Revision requested — hole tolerance', by: 'Customer' }, { date: '2026-06-14', action: 'Proof v2 approved', by: 'Customer' }] },
    { id: 'PO-2851', customer: 'Midwest Packaging Co.', product: 'Die-cut corrugated inserts', status: 'proof_pending', due: '2026-07-08', qty: 12000, proof: 'revision', shipments: [], proofHistory: [{ date: '2026-06-15', action: 'Proof v1 sent', by: 'Design Team' }, { date: '2026-06-17', action: 'Revision requested — fold line adjustment', by: 'Customer' }] },
    { id: 'PO-2856', customer: 'Precision Motion Systems', product: 'CNC machined housings', status: 'shipped', due: '2026-06-20', qty: 480, proof: 'approved', shipments: [{ carrier: 'UPS Ground', tracking: '1Z999AA10123456784', eta: '2026-06-22', status: 'In transit' }], proofHistory: [{ date: '2026-05-28', action: 'Proof approved', by: 'Customer' }] },
    { id: 'PO-2860', customer: 'Greenfield Automotive', product: 'Stamped heat shields', status: 'quoted', due: '2026-07-15', qty: 8000, proof: 'not_started', shipments: [], proofHistory: [] },
    { id: 'PO-2863', customer: 'Summit Medical Devices', product: 'Sterile tray components', status: 'in_production', due: '2026-07-01', qty: 3200, proof: 'approved', shipments: [{ carrier: 'FedEx Priority', tracking: '784923456801', eta: '2026-07-03', status: 'Label created' }], proofHistory: [{ date: '2026-06-08', action: 'Proof approved', by: 'QA Team' }] },
    { id: 'PO-2867', customer: 'Riverdale Fabrication', product: 'Welded frame assemblies', status: 'proof_pending', due: '2026-07-12', qty: 150, proof: 'awaiting_review', shipments: [], proofHistory: [{ date: '2026-06-18', action: 'Proof v1 sent', by: 'Design Team' }] },
  ];

  const STATUS_LABELS = {
    quoted: { label: 'Quoted', class: 'bg-navy-100 text-navy-700' },
    proof_pending: { label: 'Proof Pending', class: 'bg-amber-100 text-amber-800' },
    in_production: { label: 'In Production', class: 'bg-teal-100 text-teal-800' },
    shipped: { label: 'Shipped', class: 'bg-blue-100 text-blue-800' },
  };

  const PROOF_LABELS = {
    not_started: 'Not started',
    awaiting_review: 'Awaiting review',
    revision: 'Revision requested',
    approved: 'Approved',
  };

  let selectedId = null;
  let filtered = [...ORDERS];

  const els = {
    search: document.getElementById('portal-search'),
    filter: document.getElementById('portal-filter'),
    list: document.getElementById('portal-list'),
    detail: document.getElementById('portal-detail'),
    empty: document.getElementById('portal-empty'),
    confirm: document.getElementById('portal-confirm'),
    confirmMsg: document.getElementById('portal-confirm-msg'),
  };

  if (!els.list) return;

  function renderList() {
    const q = (els.search?.value || '').toLowerCase();
    const f = els.filter?.value || 'all';
    filtered = ORDERS.filter((o) => {
      const matchQ = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
      const matchF = f === 'all' || o.status === f;
      return matchQ && matchF;
    });

    els.list.innerHTML = filtered.map((o) => {
      const st = STATUS_LABELS[o.status];
      const active = selectedId === o.id ? 'ring-2 ring-teal bg-teal-50' : 'hover:bg-navy-50';
      return `<button type="button" data-order="${o.id}" class="w-full text-left px-4 py-3 border-b border-navy-100 transition-colors ${active}">
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-semibold text-navy text-sm">${o.id}</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full ${st.class}">${st.label}</span>
        </div>
        <p class="text-xs text-navy-600 truncate">${o.customer}</p>
        <p class="text-xs text-navy-500 truncate">${o.product}</p>
      </button>`;
    }).join('');

    els.empty?.classList.toggle('hidden', filtered.length > 0);

    els.list.querySelectorAll('[data-order]').forEach((btn) => {
      btn.addEventListener('click', () => selectOrder(btn.dataset.order));
    });
  }

  function selectOrder(id) {
    selectedId = id;
    const o = ORDERS.find((x) => x.id === id);
    if (!o) return;
    renderList();

    const st = STATUS_LABELS[o.status];
    els.detail.innerHTML = `
      <div class="p-5 border-b border-navy-100 flex items-start justify-between gap-4">
        <div>
          <h4 class="font-bold text-navy text-lg">${o.id}</h4>
          <p class="text-sm text-navy-600">${o.customer}</p>
        </div>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.class}">${st.label}</span>
      </div>
      <div class="p-5 space-y-5 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div><p class="text-navy-500 text-xs uppercase tracking-wide mb-1">Product</p><p class="font-medium text-navy">${o.product}</p></div>
          <div><p class="text-navy-500 text-xs uppercase tracking-wide mb-1">Quantity</p><p class="font-medium text-navy">${o.qty.toLocaleString()} units</p></div>
          <div><p class="text-navy-500 text-xs uppercase tracking-wide mb-1">Due Date</p><p class="font-medium text-navy">${o.due}</p></div>
          <div><p class="text-navy-500 text-xs uppercase tracking-wide mb-1">Proof Status</p><p class="font-medium text-navy">${PROOF_LABELS[o.proof]}</p></div>
        </div>
        <div>
          <p class="text-navy-500 text-xs uppercase tracking-wide mb-2">Proof History</p>
          ${o.proofHistory.length ? `<ul class="space-y-2">${o.proofHistory.map((h) => `<li class="flex gap-2 text-navy-600"><span class="text-navy-400 shrink-0">${h.date}</span><span>${h.action} <span class="text-navy-400">— ${h.by}</span></span></li>`).join('')}</ul>` : '<p class="text-navy-500 italic">No proof activity yet.</p>'}
        </div>
        <div>
          <p class="text-navy-500 text-xs uppercase tracking-wide mb-2">Shipment</p>
          ${o.shipments.length ? o.shipments.map((s) => `<div class="bg-navy-50 rounded-lg p-3"><p class="font-medium text-navy">${s.carrier}</p><p class="text-navy-600 text-xs mt-1">Tracking: ${s.tracking}</p><p class="text-navy-500 text-xs">ETA ${s.eta} · ${s.status}</p></div>`).join('') : '<p class="text-navy-500 italic">Not yet shipped.</p>'}
        </div>
        ${o.proof !== 'approved' && o.status !== 'shipped' ? `<button type="button" id="proof-update-btn" class="w-full py-2.5 bg-teal text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-sm">Request Proof Update</button>` : ''}
      </div>`;

    const btn = document.getElementById('proof-update-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        els.confirmMsg.textContent = `Proof update request logged for ${o.id}. Example outcomes from this engagement: ~38% reduction in status inquiry volume when customers self-serve through the portal.`;
        els.confirm.classList.remove('hidden');
        setTimeout(() => els.confirm.classList.add('hidden'), 5000);
      });
    }
  }

  els.search?.addEventListener('input', renderList);
  els.filter?.addEventListener('change', renderList);
  renderList();
  if (ORDERS.length) selectOrder(ORDERS[0].id);
})();