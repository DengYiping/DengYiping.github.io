// A pure, bounded example. This does not decide halting for arbitrary programs.
export function initialState() {
  return { ip: 0, r0: 2, r1: 3, steps: 0, halted: false };
}

export function stepMachine(state) {
  if (state.halted) return state;
  const next = { ...state, steps: state.steps + 1 };
  if (state.ip === 0) {
    if (state.r1 > 0) { next.r1--; next.ip = 1; }
    else next.ip = 2;
  } else if (state.ip === 1) {
    next.r0++; next.ip = 0;
  } else if (state.ip === 2) next.halted = true;
  else throw new Error('Invalid toy-machine instruction pointer.');
  return next;
}
