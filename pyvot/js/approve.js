import { fillSummary, findProduct, guard, loadProducts, mountShell, resetJob, saveOrder } from './portal.js';

const order = guard('approve');
if (order) {
  mountShell('approve');
  init(order);
}

async function init(current) {
  const summary = document.querySelector('#order-summary');
  const error = document.querySelector('#approve-error');
  const preview = document.querySelector('#approve-preview');
  const form = document.querySelector('#approve-form');
  const confirmation = document.querySelector('#confirmation');
  const jobRef = document.querySelector('#job-ref');
  const another = document.querySelector('#another-order');

  try {
    const products = await loadProducts();
    fillSummary(summary, findProduct(products, current.productId), current);
  } catch (loadError) {
    error.hidden = false;
    error.textContent = loadError.message;
  }

  preview.src = current.artworkDataUrl;
  preview.alt = current.artworkName ? `Approved artwork ${current.artworkName}` : 'Artwork preview';

  const showConfirmation = (ref) => {
    form.hidden = true;
    confirmation.hidden = false;
    jobRef.textContent = ref;
  };

  if (current.approved && current.jobRef) showConfirmation(current.jobRef);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const ref = current.jobRef || `PYV-${Math.floor(1000 + Math.random() * 9000)}`;
    const saved = saveOrder({ approved: true, jobRef: ref });
    showConfirmation(saved.jobRef);
  });

  another.addEventListener('click', () => resetJob());
}
