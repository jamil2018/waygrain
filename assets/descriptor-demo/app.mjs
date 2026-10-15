/* global document, CustomEvent */
import { calculate } from './calculate.mjs';
const form = document.querySelector('#calculate-form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const error = document.querySelector('#calculation-error');
  try {
    const result = calculate(
      document.querySelector('#quantity').value,
      document.querySelector('#unit-price').value,
    );
    document.querySelector('#total').textContent = result.total;
    document.querySelector('#discount-note').textContent = result.discounted
      ? '10% quantity discount applied.'
      : 'No quantity discount.';
    error.textContent = '';
    form.dispatchEvent(
      new CustomEvent('fixture-calculated', { bubbles: true }),
    );
  } catch (failure) {
    error.textContent = failure.message;
    document.querySelector('#total').textContent = 'Invalid input';
    document.querySelector('#discount-note').textContent =
      'Correct the inputs to calculate a total.';
  }
});
