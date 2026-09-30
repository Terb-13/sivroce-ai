import { findProduct, guard, loadProducts, mountShell, saveOrder } from './portal.js';

const order = guard('order');
if (!order) {
  // Redirecting to the previous step.
} else {
  mountShell('order');
  init(order);
}

async function init(current) {
  const catalog = document.querySelector('#catalog');
  const catalogError = document.querySelector('#catalog-error');
  const form = document.querySelector('#order-form');
  const specFields = document.querySelector('#spec-fields');
  const specHint = document.querySelector('#spec-hint');
  const quantity = document.querySelector('#quantity');
  let products = [];

  const showError = (message) => {
    catalogError.hidden = false;
    catalogError.textContent = message;
  };

  try {
    products = await loadProducts();
  } catch (error) {
    showError(error.message || 'The product catalog could not be loaded.');
    return;
  }

  if (!products.length) {
    showError('No products are in the catalog yet.');
    return;
  }

  if (current.quantity) quantity.value = String(current.quantity);

  const renderSpecs = (product) => {
    specFields.replaceChildren();
    for (const spec of product?.specs || []) {
      const label = document.createElement('label');
      label.className = 'field';
      const title = document.createElement('span');
      title.textContent = spec.label;
      const select = document.createElement('select');
      select.name = spec.id;
      select.required = true;
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Choose';
      placeholder.disabled = true;
      placeholder.selected = !current.specs?.[spec.id];
      select.append(placeholder);
      for (const option of spec.options || []) {
        const node = document.createElement('option');
        node.value = option;
        node.textContent = option;
        if (current.specs?.[spec.id] === option) node.selected = true;
        select.append(node);
      }
      label.append(title, select);
      specFields.append(label);
    }
  };

  for (const product of products) {
    const label = document.createElement('label');
    label.className = 'product-card';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'product';
    input.value = product.id;
    input.required = true;
    input.checked = product.id === current.productId;
    const name = document.createElement('span');
    name.className = 'product-name';
    name.textContent = product.name;
    const summary = document.createElement('span');
    summary.className = 'product-summary';
    summary.textContent = product.summary;
    input.addEventListener('change', () => {
      current = { ...current, specs: {} };
      if (specHint) specHint.hidden = true;
      renderSpecs(product);
    });
    label.append(input, name, summary);
    catalog.append(label);
  }

  const selected = findProduct(products, current.productId);
  if (selected && specHint) specHint.hidden = true;
  renderSpecs(selected);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const product = findProduct(products, String(data.get('product') || ''));
    const amount = Number(data.get('quantity'));
    if (!product || !Number.isInteger(amount) || amount < 1) {
      showError('Choose a product and a whole-number quantity.');
      return;
    }
    const specs = {};
    for (const spec of product.specs || []) {
      const value = String(data.get(spec.id) || '');
      if (!value) {
        showError(`Choose a ${spec.label.toLowerCase()}.`);
        return;
      }
      specs[spec.id] = value;
    }
    saveOrder({
      productId: product.id,
      quantity: amount,
      specs,
      softproofSeen: false,
      approved: false,
      jobRef: '',
    });
    window.location.href = 'artwork.html';
  });
}
