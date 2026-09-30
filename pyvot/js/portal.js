const STORAGE_KEY = 'pyvot-demo-order';

export const DEMO_EMAIL = 'customer@pyvott.com';
export const DEMO_PASSWORD = 'packaging';

export const STEPS = [
  { id: 'login', label: 'Sign in', href: 'index.html' },
  { id: 'order', label: 'Order', href: 'order.html' },
  { id: 'artwork', label: 'Artwork', href: 'artwork.html' },
  { id: 'softproof', label: 'Softproof', href: 'softproof.html' },
  { id: 'approve', label: 'Approve', href: 'approve.html' },
];

export function loadOrder() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveOrder(patch) {
  const next = { ...loadOrder(), ...patch };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error('This browser could not keep the demo order. Try a smaller image.');
  }
  return next;
}

export function clearOrder() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function resetJob() {
  const { email } = loadOrder();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ authed: true, email: email || DEMO_EMAIL }));
  window.location.href = 'order.html';
}

export async function loadProducts() {
  const response = await fetch('products.json', { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('The product catalog could not be loaded.');
  const data = await response.json();
  if (!data || !Array.isArray(data.products)) {
    throw new Error('The product catalog is missing a products list.');
  }
  return data.products;
}

export function findProduct(products, id) {
  return products.find((product) => product.id === id) || null;
}

function stepUnlocked(id, order) {
  if (id === 'login') return true;
  if (!order.authed) return false;
  if (id === 'order') return true;
  if (!order.productId || !order.quantity) return false;
  if (id === 'artwork') return true;
  if (!order.artworkDataUrl) return false;
  if (id === 'softproof') return true;
  return id === 'approve' && Boolean(order.softproofSeen);
}

export function guard(page) {
  const order = loadOrder();
  if (stepUnlocked(page, order)) return order;
  const lockedAt = STEPS.findIndex((step) => !stepUnlocked(step.id, order));
  const target = STEPS[Math.max(0, lockedAt - 1)];
  if (target && target.id !== page) window.location.replace(target.href);
  return null;
}

function stepClass(step, page, order) {
  if (step.id === page) return 'step is-current';
  if (stepUnlocked(step.id, order)) return 'step is-done';
  return 'step is-locked';
}

export function mountShell(page) {
  const order = loadOrder();
  const header = document.querySelector('[data-shell]');
  if (!header) return;

  const bar = document.createElement('div');
  bar.className = 'site-header';

  const logoLink = document.createElement('a');
  logoLink.className = 'logo';
  logoLink.href = 'index.html';
  const logo = document.createElement('img');
  logo.src = 'assets/logo.svg';
  logo.alt = 'Pyvot';
  logoLink.append(logo);

  const actions = document.createElement('div');
  actions.className = 'header-actions';
  const pill = document.createElement('span');
  pill.className = 'demo-pill';
  pill.textContent = 'Demo';
  actions.append(pill);

  if (order.authed) {
    const signOut = document.createElement('button');
    signOut.type = 'button';
    signOut.className = 'button-secondary';
    signOut.textContent = 'Sign out';
    signOut.addEventListener('click', () => {
      clearOrder();
      window.location.href = 'index.html';
    });
    actions.append(signOut);
  }

  bar.append(logoLink, actions);

  const banner = document.createElement('p');
  banner.className = 'demo-banner';
  banner.textContent = 'Demo — this is not a live ordering system.';

  const nav = document.createElement('nav');
  nav.className = 'steps';
  nav.setAttribute('aria-label', 'Order steps');

  STEPS.forEach((step, index) => {
    const unlocked = stepUnlocked(step.id, order);
    const current = step.id === page;
    const node = !current && unlocked ? document.createElement('a') : document.createElement('span');
    node.className = stepClass(step, page, order);
    if (node.tagName === 'A') node.href = step.href;
    if (current) node.setAttribute('aria-current', 'step');

    const number = document.createElement('span');
    number.className = 'step-index';
    number.textContent = String(index + 1);
    const label = document.createElement('span');
    label.textContent = step.label;
    node.append(number, label);
    nav.append(node);
  });

  header.replaceChildren(bar, banner, nav);

  const footer = document.querySelector('[data-footer]');
  if (footer && !footer.childElementCount) {
    const link = document.createElement('a');
    link.href = 'https://pyvott.com/';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Pyvot';
    footer.append(link, document.createTextNode(' · Flexible packaging order demo'));
  }
}

export function fillSummary(list, product, order) {
  list.replaceChildren();
  const rows = [
    ['Format', product ? product.name : order.productId],
    ['Quantity', order.quantity ? String(order.quantity) : ''],
  ];
  if (product && Array.isArray(product.specs)) {
    for (const spec of product.specs) {
      rows.push([spec.name, order.specs?.[spec.id] || '']);
    }
  }
  if (order.artworkName) rows.push(['Artwork', order.artworkName]);

  for (const [label, value] of rows) {
    if (!value) continue;
    const term = document.createElement('dt');
    term.textContent = label;
    const detail = document.createElement('dd');
    detail.textContent = value;
    list.append(term, detail);
  }
}

export function readArtworkFile(file) {
  if (!file) return Promise.reject(new Error('Choose an image file.'));
  if (!/^image\/(png|jpeg|webp|gif|svg\+xml)$/.test(file.type)) {
    return Promise.reject(new Error('Use a PNG, JPG, WebP, or GIF.'));
  }
  if (file.size > 12 * 1024 * 1024) {
    return Promise.reject(new Error('Use an image under 12 MB for this demo.'));
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const largest = Math.max(image.width, image.height);
      if (!largest) {
        URL.revokeObjectURL(url);
        reject(new Error('That image could not be read. Try a PNG or JPG.'));
        return;
      }
      const scale = Math.min(1, 1024 / largest);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      try {
        resolve({
          artworkName: file.name,
          artworkDataUrl: canvas.toDataURL('image/jpeg', 0.86),
          softproofSeen: false,
          approved: false,
          jobRef: '',
        });
      } catch {
        reject(new Error('That image could not be prepared. Try a PNG or JPG.'));
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That image could not be read. Try a PNG or JPG.'));
    };
    image.src = url;
  });
}
