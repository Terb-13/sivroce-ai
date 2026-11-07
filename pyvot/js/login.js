import { DEMO_EMAIL, DEMO_PASSWORD, loadOrder, mountShell, saveOrder } from './portal.js';

mountShell('login');

const form = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const error = document.querySelector('#login-error');
const returning = document.querySelector('#returning');
const order = loadOrder();

if (order.authed && returning) {
  returning.hidden = false;
  const who = returning.querySelector('[data-email]');
  if (who) who.textContent = order.email || DEMO_EMAIL;
}

document.querySelector('#fill-demo')?.addEventListener('click', () => {
  emailInput.value = DEMO_EMAIL;
  passwordInput.value = DEMO_PASSWORD;
  error.hidden = true;
  emailInput.focus();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    error.hidden = false;
    error.textContent = 'Those credentials do not match the demo sign-in.';
    return;
  }
  saveOrder({ authed: true, email: DEMO_EMAIL });
  window.location.href = 'order.html';
});
