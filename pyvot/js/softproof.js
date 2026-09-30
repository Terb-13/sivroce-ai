import { fillSummary, findProduct, guard, loadProducts, mountShell, saveOrder } from './portal.js';

const order = guard('softproof');
if (order) {
  mountShell('softproof');
  init(order);
}

async function init(current) {
  const error = document.querySelector('#softproof-error');
  const summary = document.querySelector('#order-summary');
  const stage = document.querySelector('#stage');
  const canvas = document.querySelector('#softproof-canvas');
  const fallback = document.querySelector('#softproof-fallback');
  const continueLink = document.querySelector('#continue-softproof');
  const resetView = document.querySelector('#reset-view');

  let product = null;
  try {
    const products = await loadProducts();
    product = findProduct(products, current.productId);
    fillSummary(summary, product, current);
  } catch (loadError) {
    error.hidden = false;
    error.textContent = loadError.message;
  }

  if (!product) {
    error.hidden = false;
    if (!error.textContent) {
      error.textContent = 'That product is no longer in the catalog. Go back and choose a format again.';
    }
    return;
  }

  continueLink.addEventListener('click', (event) => {
    if (continueLink.classList.contains('is-disabled')) event.preventDefault();
  });

  const enableContinue = () => {
    saveOrder({ softproofSeen: true });
    continueLink.classList.remove('is-disabled');
    continueLink.removeAttribute('aria-disabled');
  };

  const showFlat = () => {
    canvas.hidden = true;
    fallback.hidden = false;
    fallback.src = current.artworkDataUrl;
    fallback.alt = `Artwork for ${product.name}`;
    resetView.hidden = true;
    const note = document.querySelector('.stage-note');
    if (note) note.textContent = 'Flat preview — 3D is unavailable in this browser.';
    enableContinue();
  };

  let THREE;
  let OrbitControls;
  try {
    THREE = await import('three');
    ({ OrbitControls } = await import('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js'));
  } catch {
    showFlat();
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  } catch {
    showFlat();
    return;
  }

  if (!renderer.getContext()) {
    showFlat();
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  canvas.addEventListener('pointerdown', () => {
    controls.autoRotate = false;
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 1.35);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff4ee, 0.45);
  fill.position.set(-4, 1, -2);
  scene.add(fill);

  const texture = await new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(current.artworkDataUrl, resolve, undefined, reject);
  }).catch(() => null);

  if (!texture) {
    showFlat();
    return;
  }

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const pack = makePack(THREE, product, texture);
  centerObject(THREE, pack);
  scene.add(pack);

  const fitted = fitCamera(THREE, camera, controls, pack);
  const distance = fitted.position.length();
  controls.minDistance = distance * 0.65;
  controls.maxDistance = distance * 2.5;
  controls.enablePan = false;
  const resize = () => {
    const width = stage.clientWidth || 640;
    const height = stage.clientHeight || 480;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);
  resetView.addEventListener('click', () => {
    camera.position.copy(fitted.position);
    controls.target.set(0, 0, 0);
    controls.update();
  });

  const frame = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  frame();
  enableContinue();
}

function makePack(THREE, product, texture) {
  const preview = product.preview || { width: 2, height: 2.6, depth: 0.6 };
  const width = Number(preview.width) || 2;
  const height = Number(preview.height) || 2.6;
  const depth = Number(preview.depth) || 0.6;
  const art = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.42, metalness: 0.02 });
  const film = new THREE.MeshStandardMaterial({ color: '#f6f2ee', roughness: 0.62, metalness: 0.03 });
  const seal = new THREE.MeshStandardMaterial({ color: '#efe6df', roughness: 0.7, metalness: 0 });

  if (product.shape === 'rollstock') {
    const radius = Math.max(width, depth) / 2;
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 72);
    const mesh = new THREE.Mesh(geometry, [art, film, film]);
    mesh.rotation.z = Math.PI / 2;
    return mesh;
  }

  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), [film, film, seal, film, art, art]);
  group.add(body);

  if (product.shape === 'pouch' || product.shape === 'stickpack') {
    const lip = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.98, Math.min(0.1, height * 0.045), depth * 0.42),
      seal
    );
    lip.position.y = height / 2;
    group.add(lip);
  }

  return group;
}

function centerObject(THREE, object) {
  const bounds = new THREE.Box3().setFromObject(object);
  const center = bounds.getCenter(new THREE.Vector3());
  object.position.sub(center);
}

function fitCamera(THREE, camera, controls, object) {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = bounds.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, size.z, 0.5);
  const distance = span * 2.15;
  const position = new THREE.Vector3(distance * 0.42, distance * 0.28, distance);
  camera.position.copy(position);
  controls.target.set(0, 0, 0);
  controls.update();
  return { position };
}
