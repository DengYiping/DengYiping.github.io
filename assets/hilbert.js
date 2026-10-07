import { initialState, stepMachine } from './hilbert-machine.mjs';

for (const demo of document.querySelectorAll('[data-register-demo]')) {
  const status = demo.querySelector('[data-machine-status]');
  const step = demo.querySelector('[data-machine-step]');
  const reset = demo.querySelector('[data-machine-reset]');
  let state = initialState();
  function render() {
    status.textContent = `Step ${state.steps}: IP = ${state.ip}; R₀ = ${state.r0}; R₁ = ${state.r1}; ${state.halted ? 'halted — result 5.' : 'running.'}`;
    step.disabled = state.halted;
    for (const row of demo.querySelectorAll('[data-instruction]')) {
      if (Number(row.dataset.instruction) === state.ip) row.setAttribute('aria-current', 'step');
      else row.removeAttribute('aria-current');
    }
  }
  step.addEventListener('click', () => { state = stepMachine(state); render(); });
  reset.addEventListener('click', () => { state = initialState(); render(); });
  render();
  demo.querySelector('[data-machine-controls]').hidden = false;
}
