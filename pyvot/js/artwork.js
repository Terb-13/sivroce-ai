import {
  fillSummary,
  findProduct,
  guard,
  loadProducts,
  mountShell,
  readArtworkFile,
  saveOrder,
} from './portal.js';

const order = guard('artwork');
if (order) {
  mountShell('artwork');
  init(order);
}

async function init(current) {
  const summary = document.querySelector('#order-summary');
  const error = document.querySelector('#artwork-error');
  const preview = document.querySelector('#artwork-preview');
  const empty = document.querySelector('#artwork-empty');
  const fileName = document.querySelector('#artwork-name');
  const input = document.querySelector('#artwork-file');
  const continueLink = document.querySelector('#continue-artwork');

  const showPreview = (dataUrl, name) => {
    preview.hidden = false;
    preview.src = dataUrl;
    preview.alt = name ? `Preview of ${name}` : 'Artwork preview';
    empty.hidden = true;
    fileName.textContent = name || '';
    continueLink.classList.remove('is-disabled');
    continueLink.removeAttribute('aria-disabled');
  };

  try {
    const products = await loadProducts();
    fillSummary(summary, findProduct(products, current.productId), current);
  } catch (loadError) {
    error.hidden = false;
    error.textContent = loadError.message;
  }

  if (current.artworkDataUrl) showPreview(current.artworkDataUrl, current.artworkName);

  continueLink.addEventListener('click', (event) => {
    if (continueLink.classList.contains('is-disabled')) event.preventDefault();
  });

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    error.hidden = true;
    if (!file) return;
    try {
      const stored = await readArtworkFile(file);
      saveOrder(stored);
      showPreview(stored.artworkDataUrl, stored.artworkName);
    } catch (readError) {
      error.hidden = false;
      error.textContent = readError.message;
    }
  });
}
