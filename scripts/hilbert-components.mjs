import { escape } from './templates.mjs';

// These fixed MathML fragments are authored source, not arbitrary TeX or HTML.
const expressions = {
  pythagoras: ['x squared plus y squared equals z squared', '<msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><msup><mi>y</mi><mn>2</mn></msup><mo>=</mo><msup><mi>z</mi><mn>2</mn></msup>'],
  exponential: ['y equals two to the power x', '<mi>y</mi><mo>=</mo><msup><mn>2</mn><mi>x</mi></msup>'],
  dprm: ['n belongs to A if and only if there exist natural numbers w one through w k with P of n and these witnesses equal to zero', '<mtable><mtr><mtd><mi>n</mi><mo>∈</mo><mi>A</mi><mo>⟺</mo><mo>∃</mo><msub><mi>w</mi><mn>1</mn></msub><mo>,</mo><mo>…</mo><mo>,</mo><msub><mi>w</mi><mi>k</mi></msub><mo>∈</mo><mi mathvariant="normal">ℕ</mi><mo>:</mo></mtd></mtr><mtr><mtd><mi>P</mi><mo>(</mo><mi>n</mi><mo>,</mo><msub><mi>w</mi><mn>1</mn></msub><mo>,</mo><mo>…</mo><mo>,</mo><msub><mi>w</mi><mi>k</mi></msub><mo>)</mo><mo>=</mo><mn>0</mn></mtd></mtr></mtable>'],
  packing: ['three plus two times ten plus one times ten squared plus zero times ten cubed equals one hundred twenty three', '<mn>3</mn><mo>+</mo><mn>2</mn><mo>·</mo><mn>10</mn><mo>+</mo><mn>1</mn><mo>·</mo><msup><mn>10</mn><mn>2</mn></msup><mo>+</mo><mn>0</mn><mo>·</mo><msup><mn>10</mn><mn>3</mn></msup><mo>=</mo><mn>123</mn>'],
  finite: ['f has an integer zero if and only if every finite rational test succeeds', '<mtable><mtr><mtd><mtext>f has an integer zero</mtext></mtd></mtr><mtr><mtd><mo>⟺</mo><mtext>every finite rational test succeeds</mtext></mtd></mtr></mtable>'],
  field: ['F equals the rationals with square root of two adjoined', '<mi>F</mi><mo>=</mo><mi mathvariant="normal">ℚ</mi><mo>(</mo><msqrt><mn>2</mn></msqrt><mo>)</mo>'],
  index: ['T sub a equals eta of a times P, with eta of a an element of the nonstandard integers', '<msub><mi>T</mi><mi>a</mi></msub><mo>=</mo><mi>η</mi><mo>(</mo><mi>a</mi><mo>)</mo><mi>P</mi><mo>,</mo><mspace width="0.5em"/><mi>η</mi><mo>(</mo><mi>a</mi><mo>)</mo><mo>∈</mo><mmultiscripts><mi mathvariant="normal">ℤ</mi><mprescripts/><none/><mo>∗</mo></mmultiscripts>'],
  height: ['h of s is at most H times M of s to the power c', '<mi>h</mi><mo>(</mo><mi>s</mi><mo>)</mo><mo>≤</mo><mi>H</mi><msup><mrow><mi>M</mi><mo>(</mo><mi>s</mi><mo>)</mo></mrow><mi>c</mi></msup>'],
  delta: ['delta equals f of eta of a one through eta of a n', '<mi>δ</mi><mo>=</mo><mi>f</mi><mo>(</mo><mi>η</mi><mo>(</mo><msub><mi>a</mi><mn>1</mn></msub><mo>)</mo><mo>,</mo><mo>…</mo><mo>,</mo><mi>η</mi><mo>(</mo><msub><mi>a</mi><mi>n</mi></msub><mo>)</mo><mo>)</mo>'],
  bound: ['B squared is at most C times B plus C prime', '<msup><mi>B</mi><mn>2</mn></msup><mo>≤</mo><mi>C</mi><mi>B</mi><mo>+</mo><msup><mi>C</mi><mo>′</mo></msup>'],
  quartic: ['the sum from i equals one to s of q sub i squared equals zero', '<munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>s</mi></munderover><msubsup><mi>q</mi><mi>i</mi><mn>2</mn></msubsup><mo>=</mo><mn>0</mn>']
};

function math(name) {
  if (!Object.hasOwn(expressions, name)) throw new Error(`Unknown article math: ${name}`);
  const item = expressions[name];
  if (!item) throw new Error(`Unknown article math: ${name}`);
  return `<span class="article-math"><math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="${escape(item[0])}">${item[1]}</math></span>`;
}

const figures = {
  register: `<figure class="explanation" id="register-demo" aria-labelledby="register-caption" data-register-demo>
    <span class="figure-kicker">01 / A machine you can follow</span>
    <h3>Add 3 to 2, one instruction at a time</h3>
    <div class="table-scroll"><table><caption>Program; registers contain natural numbers</caption><thead><tr><th scope="col">IP</th><th scope="col">Instruction</th></tr></thead><tbody>
      <tr data-instruction="0" aria-current="step"><th scope="row">0</th><td>If R₁ &gt; 0: decrement R₁, jump to 1. Otherwise jump to 2.</td></tr>
      <tr data-instruction="1"><th scope="row">1</th><td>Increment R₀; jump to 0.</td></tr>
      <tr data-instruction="2"><th scope="row">2</th><td>Halt.</td></tr></tbody></table></div>
    <p class="machine-status" role="status" aria-live="polite" aria-atomic="true" data-machine-status>Initial state: IP = 0; R₀ = 2; R₁ = 3; running.</p>
    <div class="machine-controls" hidden data-machine-controls><button type="button" data-machine-step>Step one instruction</button><button type="button" data-machine-reset>Reset to 2 + 3</button></div>
    <details><summary>Read the complete execution trace (works without JavaScript)</summary>
      <div class="table-scroll"><table><caption>State after each step</caption><thead><tr><th scope="col">Step</th><th scope="col">IP</th><th scope="col">R₀</th><th scope="col">R₁</th><th scope="col">State</th></tr></thead><tbody>
      ${[[0,0,2,3,'Initial'],[1,1,2,2,'Running'],[2,0,3,2,'Running'],[3,1,3,1,'Running'],[4,0,4,1,'Running'],[5,1,4,0,'Running'],[6,0,5,0,'Running'],[7,2,5,0,'Running'],[8,2,5,0,'Halted']].map(([step,ip,r0,r1,status])=>`<tr><th scope="row">${step}</th><td>${ip}</td><td>${r0}</td><td>${r1}</td><td>${status}</td></tr>`).join('')}
      </tbody></table></div>
    </details><figcaption id="register-caption">A toy addition program, not a halting decider. The highlighted row is the next instruction; halt itself takes one step.</figcaption>
  </figure>`,
  packing: `<figure class="explanation" aria-labelledby="packing-caption">
    <span class="figure-kicker">02 / Store a history in a number</span><h3>Four values, one packed integer</h3>
    <ol class="packing-digits" aria-label="Values from earliest to latest"><li><span>t = 0</span><strong>3</strong></li><li><span>t = 1</span><strong>2</strong></li><li><span>t = 2</span><strong>1</strong></li><li><span>t = 3</span><strong>0</strong></li></ol>
    <p class="math-line">${math('packing')}</p><p>Record the base <strong>10</strong> and length <strong>4</strong> too. The earliest value is the least-significant digit.</p>
    <ol class="proof-flow"><li><strong>Computation</strong><span>Initial state → legal steps → halt</span></li><li><strong>Exponential equations</strong><span>Packed histories and arithmetic checks</span></li><li><strong>Polynomial witnesses</strong><span>Replace exponentiation by existential equations</span></li></ol>
    <figcaption id="packing-caption">The digit example illustrates storage only. It is not the DPRM encoding or a proof that every transition check is polynomial.</figcaption>
  </figure>`,
  oracle: `<figure class="explanation" aria-labelledby="oracle-caption">
    <span class="figure-kicker">03 / Two searches, conditional on the claim</span><h3>What a hypothetical rational oracle would let us do</h3>
    <div class="oracle-lanes"><section aria-labelledby="yes-lane"><h4 id="yes-lane">Search A · Integer witnesses</h4><ol><li>Enumerate integer tuples fairly.</li><li>Evaluate f exactly.</li><li>If f = 0, stop with <strong>YES</strong>.</li></ol></section>
    <section aria-labelledby="no-lane"><h4 id="no-lane">Search B · Failed finite tests</h4><ol><li>Generate the next finite test.</li><li>Ask the rational oracle its finitely many queries.</li><li>If the test fails, stop with <strong>NO</strong>.</li></ol></section></div>
    <p class="scheduler">Dovetail: give each lane successive finite amounts of work.</p>
    <figcaption id="oracle-caption">This is a logical reduction, not an implemented oracle. The manuscript’s claimed equivalence guarantees that one lane stops. Without it, both could run forever.</figcaption>
  </figure>`,
  dependencies: `<figure class="explanation" aria-labelledby="dependencies-caption">
    <span class="figure-kicker">04 / Keep the status attached to the result</span><h3>Three different kinds of evidence</h3>
    <dl class="dependency-map"><div><dt>Established background</dt><dd>DPRM over ℕ/ℤ; computation theory; the completed AFP development.</dd></div><div><dt>New model-generated inputs</dt><dd>Pointwise 2-converse → denominator parity.<br>Fontaine–Mazur at 2 → five-point height bound.<br>Both feed the claimed rational reduction.</dd></div><div><dt>Not established by this article</dt><dd>Independent verification of those manuscripts, or a kernel-checked proof of the complete rational theorem.</dd></div></dl>
    <figcaption id="dependencies-caption">The arrows describe the released argument’s dependencies, not their validation. A claim’s proof status includes the status of its new inputs.</figcaption>
  </figure>`
};

export const hilbertExtensions = [
  {
    name: 'articleMath', level: 'inline', start: src => src.indexOf('{{math:'),
    tokenizer(src) {
      const match = /^\{\{math:([a-z-]+)\}\}/.exec(src);
      if (match) return { type: 'articleMath', raw: match[0], name: match[1] };
    },
    renderer: token => math(token.name)
  },
  {
    name: 'articleFigure', level: 'block', start: src => src.indexOf(':::figure '),
    tokenizer(src) {
      const match = /^:::figure ([a-z-]+)(?:\n|$)/.exec(src);
      if (match) return { type: 'articleFigure', raw: match[0], name: match[1] };
    },
    renderer(token) {
      if (!Object.hasOwn(figures, token.name)) throw new Error(`Unknown article figure: ${token.name}`);
      return figures[token.name];
    }
  }
];
