An equation can look much simpler than a program. No loops, no mutable state, just a few additions and multiplications. Hilbert’s tenth problem exposes how misleading that impression can be: integer polynomial equations can encode arbitrary computation.

That connection is why this subject belongs in a computer-science notebook. It also explains why a proof assistant is useful here. A statement about equations becomes a statement about programs, with a long chain of translations between them. Each translation has to preserve exactly the right meaning.

In 2018, I co-authored an early report on formalizing the Davis–Putnam–Robinson–Matiyasevich theorem in Isabelle. My [original post](/blog/hilbert-10-meets-isabelle/) remains in the archive. This is a fresh explanation, including what happened later and how to read a new development: OpenAI’s model-generated manuscript claiming undecidability over the **rational numbers**. That last part is a report on a candidate proof, not an announcement that I have verified it.

## The question is existence, not enumeration

A Diophantine equation is a polynomial equation, usually with integer coefficients, whose unknowns are required to be integers. A familiar example is:

{{math:pythagoras}}

The tuple (3, 4, 5) is a solution. Finding more Pythagorean triples is an interesting problem, but it is not Hilbert’s tenth problem. In his 1900 list, Hilbert asked for a finite procedure deciding whether a given equation has **any integer solution**. The input includes the equation and its number of variables; the required output is yes or no. [1](#r1)

We can certainly search. Enumerate integer tuples by increasing bounds on their absolute values, evaluate the polynomial exactly, and stop when a zero appears. Every particular solution will eventually be examined. But what does the search do when no solution exists? It keeps going. Looking farther without finding anything is not a certificate that nothing exists.

A decision procedure must terminate on both kinds of input. It cannot answer “no” merely because a time limit expired. Undecidability says that no algorithm can meet that requirement for every integer-coefficient polynomial. It does not say that every individual equation is difficult, that useful solvers are impossible, or that restricted families cannot have elegant algorithms.

Allowing exponentiation produces an **exponential Diophantine equation**. For instance:

{{math:exponential}}

Here an unknown appears in an exponent, which is not allowed in a polynomial expression. Saying that exponentiation is *Diophantine* means something subtler than calling this equation polynomial: the relation between x and y can be represented by a polynomial equation after introducing a fixed collection of existentially quantified natural-number witnesses. There is no claim that a polynomial in x simply equals 2ˣ for every x. This distinction is one of the central bridges in the proof.

## A very small machine can express a very large problem

To connect equations with computation, start with a register machine. Its registers hold natural numbers, initially zero except for designated inputs. Its instruction pointer, or IP, selects the next instruction. One standard instruction set has only three operations:

- Increment a chosen register and jump to a named instruction.
- If a chosen register is nonzero, decrement it and jump to one instruction; otherwise leave it at zero and jump to another.
- Halt.

Subtraction never produces a negative register. Branching is explicit, and an increment includes its destination. Those details matter: a hand-wavy list of “addition, subtraction, and loops” is not yet a machine specification.

The following program adds R₁ into R₀. Starting from 2 and 3, it repeatedly transfers one unit, leaving 5 and 0.

:::figure register

The program preserves R₀ + R₁ after each complete transfer, although the sum temporarily drops between the decrement and increment. That small detail already shows why we need an instruction-level execution trace rather than an informal description of the loop.

With sufficiently many registers and instructions, machines of this kind can simulate Turing machines; Turing machines can simulate them too. Registers are unbounded mathematical natural numbers, not fixed-width CPU registers. Universality concerns the whole class of programs, not this particular addition example. [2](#r2) [3](#r3)

The halting problem asks whether an arbitrary machine, on a specified input, eventually reaches halt. A machine that searches for a mathematical witness may halt when it finds one and run forever otherwise. That is exactly the asymmetry we saw when enumerating solutions of equations.

A set is **computably enumerable** when a program can recognize its members: on a member it eventually accepts; on a nonmember it need not finish. A **decidable** set has a program that finishes with the correct answer on every input. Every decidable set is computably enumerable, but the halting set shows that the converse fails. “Enumerable” does not mean we can recognize when its enumeration is complete.

## Packing an unbounded execution into finitely many witnesses

For a halting computation, there is a finite execution history: the initial state, each intermediate state, and the final halting state. We would like equations to assert that some such history exists, and that every adjacent pair follows a legal instruction.

The first obstacle is runtime. We cannot introduce one existential variable for every time step, because we do not know in advance how long the computation lasts. The polynomial produced from a program must be a fixed, finite object. Its number of variables cannot grow later as the machine runs.

The escape is to put an arbitrarily long finite history into a fixed number of arbitrarily large integers. Digit expansions make the storage idea tangible. In base 10, the sequence (3, 2, 1, 0) can be packed into 123 if the earliest value occupies the units place. We must also retain its length: otherwise the final zero disappears from the usual written numeral.

:::figure packing

For a general finite history, choose a base larger than the entries being packed. The base, the packed number, and the length can themselves be witnesses. A long execution then requires larger witness *values*, rather than a longer list of variables.

Storage alone is not enough. We need arithmetic relations that retrieve positions, compare entries, encode the instruction pointer, and ensure that **all** transitions are legal. Simply writing “check every step” would introduce a bounded universal condition; the real construction must turn that condition into the permitted existential arithmetic form. This is where digit relations, divisibility, and number theory do substantive work.

The classical proof proceeds through exponential Diophantine descriptions. Davis, Putnam, and Robinson established the representation of computably enumerable relations with exponentiation allowed in 1961. Matiyasevich’s 1970 work supplied the missing number-theoretic ingredient that removes exponentiation, completing the polynomial representation theorem. [4](#r4) [5](#r5) [6](#r6)

The useful mental model is therefore not “a polynomial executes a program.” It is “a polynomial has a solution exactly when a valid accepting computation has witnesses.” Solving the equation is a question about the existence of a certificate. The certificate may contain enormous integers, and searching for it need not have any computable termination bound.

## What DPRM actually says

The Davis–Putnam–Robinson–Matiyasevich theorem states that every computably enumerable set of natural numbers is Diophantine. For such a set A, there is an integer-coefficient polynomial P and a fixed number k of witnesses such that:

{{math:dprm}}

There are corresponding statements for relations with several input parameters. The polynomial depends on the set or recognizing program, but not on the particular input n. Specializing n yields an equation whose solvability represents that input’s membership question.

The reverse direction is straightforward: enumerate the natural-number witness tuples and test the polynomial. A successful tuple eventually appears when one exists. Thus existential polynomial solvability and computable enumerability describe the same class of conditions over the naturals.

Apply the theorem to the halting set. If an algorithm decided all these polynomial existence questions, it would decide halting. That contradiction gives the negative answer to Hilbert’s tenth problem.

The natural-number and all-integer formulations can be connected without confusing their domains. An arbitrary integer can be expressed as a difference of two naturals. In the other direction, Lagrange’s four-square theorem expresses a nonnegative integer as a sum of four integer squares. Substituting those sums for natural-number variables transfers the existential question to integer variables; for positive integers, add one. These substitutions explain why the choice between ℕ and ℤ does not rescue a general decider. [6](#r6)

## Formalization makes the bridges inspectable

The 2018 *Hilbert Meets Isabelle* report was an account of an attempt, not a declaration of a completed kernel-checked DPRM proof. I am one of its twelve co-authors. The report describes the project’s early approach to expressing computability through equations and checking that mathematics in Isabelle/HOL. [7](#r7)

The 2019 short paper *The DPRM Theorem in Isabelle* reported substantial progress, including exponentiation and register-machine arithmetization, but explicitly described remaining gaps. Its authors were Jonas Bayer, Marco David, Abhik Pal, Benedikt Stock, and Dierk Schleicher; I was acknowledged as an earlier contributor, not listed as a co-author. [8](#r8)

The completed Archive of Formal Proofs entry, *Diophantine Equations and the DPRM Theorem*, is dated **June 6, 2022**. Its authors are Jonas Bayer, Marco David, Benedikt Stock, Abhik Pal, Yuri Matiyasevich, and Dierk Schleicher. The entry includes register-machine specifications, execution arithmetization, exponentiation, and the final DPRM development. This later milestone is distinct from the early report; I am not one of its listed authors. [9](#r9)

There is also an independent Coq development by Dominique Larchey-Wendling and Yannick Forster. Its extended publication appeared in 2022 and uses Conway’s FRACTRAN as an intermediate language between machine computation and equations. Different encodings can establish the same theorem, and comparing their formal structure is instructive. [10](#r10)

Formalization requires specifying what a machine is, what a step means, what a polynomial is, and why each transformation preserves acceptance or solvability. A proof assistant checks the derivation against those definitions and its logical foundations. That is much stronger evidence than plausible prose, but it still leaves us responsible for understanding the theorem statement, assumptions, and scope. An integer DPRM formalization is not, by itself, a formalization of a new theorem about rational solutions.

## Why the rational numbers are a different frontier

Now change the unknowns’ domain to ℚ. The equation 2x − 1 = 0 has a rational solution, x = 1/2, but no integer solution. More possible values can turn an integer “no” into a rational “yes.”

Clearing denominators does not repair this automatically. For a fixed rational tuple, we can multiply through to obtain integer equations involving numerators and denominators. But those numerators and denominators become additional unknowns. That translation does not force the original unknowns to be integers, and it does not transfer the undecidability of arbitrary integer equations to rational ones.

One sufficient route would be an **existential Diophantine definition of ℤ inside ℚ**. We could attach that definition to each rational unknown, restricting it to integer values using only further existential polynomial witnesses. A Diophantine model of full integer arithmetic could serve a similar purpose.

Universal or mixed-quantifier definitions are different. Koenigsmann’s universal definition of ℤ in ℚ is a major result, but a formula saying “for every rational…” is not an existential polynomial-solvability query. Moving between logical fragments is precisely the difficult part, not a harmless change in notation. [11](#r11)

## The new claim uses finite tests instead

OpenAI’s manuscript *Hilbert’s tenth problem over the rational numbers* bears the date **September 24, 2026**. The public repository was created on **October 6, 2026**. The version discussed here was checked on **October 7, 2026**, at commit `adc7f1241b42e322a6451854ab7e4b4c146bf78a`. The manuscript date, release date, and this article’s evidence check are different events. [12](#r12) [15](#r15)

The claimed route is not a single existential formula defining integers. Given a nonconstant integer polynomial f, the manuscript constructs an effectively generated sequence of finite tests. Each test is answerable using finitely many rational-solvability queries. The intended equivalence is:

{{math:finite}}

An integer zero supplies witnesses for all the tests. The difficult direction is that, if there is no integer zero, **some finite test fails**. This is not a claim that we know how many tests to inspect in advance. [12](#r12)

Suppose, hypothetically, that we had an algorithm deciding rational solvability. We could run two searches with it:

:::figure oracle

Dovetailing means neither search waits for the other to finish. Under the claimed equivalence, an integer solution makes the witness lane terminate, while its absence makes the failed-test lane terminate. That would decide integer solvability, contradicting DPRM. The logical contradiction is relatively easy to explain; the arithmetic that justifies the equivalence is the candidate proof’s burden.

## How elliptic indices meet a height contradiction

Here is the architecture of that arithmetic argument, not an independent verification of its lemmas. The manuscript works with a specific rank-one elliptic curve over:

{{math:field}}

A nontorsion point P generates a finite-index infinite cyclic subgroup, so multiples nP can label integers. The tests attach elliptic points to elements a of a modeled ring R. If every finite test succeeds, compactness supplies a simultaneous model in an elementary extension of the rational field.

This last phrase is important. Compactness does **not** directly give an ordinary rational solution of the entire infinite collection. The extension also carries integer indices, and those may be nonstandard: larger in absolute value than every ordinary integer. The point assignment gives:

{{math:index}}

The map η is additive and injective, with η(1) = 1. It is not initially known to preserve multiplication. Consequently, a modeled equation f(a₁, …, aₙ) = 0 does not immediately imply f(η(a₁), …, η(aₙ)) = 0. Treating this additive labeling as a model of full integer arithmetic would skip the central obstruction.

The manuscript uses **paired prime-adic comparisons** to connect ring values with their indices. A primary comparison involves truncated elliptic logarithms. A second, on the conjugate curve, provides the integrality control needed for that comparison. These are local statements at primes, to prescribed precision; they are not a global multiplication identity.

Two other mechanisms arrange where those comparisons apply. An existential denominator-parity condition allows only even negative valuations outside a fixed exceptional set; it does not eliminate every denominator. Prime-pattern constraints organize representations as sums of three slopes, with contact forms chosen to make the local tests usable. Both parts are needed to turn local information into a uniform bound.

The height input concerns contact with **five fixed rational points** on the projective line. For a rational point s written in coprime integer coordinates, M(s) is the squarefree product of nonexceptional primes where a contact form has odd valuation. “Odd” is essential: M does not record every numerator or denominator prime indiscriminately. The claimed estimate is:

{{math:height}}

Here h is logarithmic Weil height, and H and c are fixed constants. Roughly, the estimate limits a rational point’s arithmetic size using this carefully selected prime information. The reduction transfers that estimate to the ambient elementary extension. [12](#r12), §§2 and 4.

To see the intended contradiction, take the modeled root coordinates and set:

{{math:delta}}

Let B be the maximum of 1 and the absolute values of their indices. If δ is zero, elementarity supplies an ordinary integer solution. Otherwise its size is bounded by a fixed polynomial in B. The local comparisons force each relevant contact prime to divide this *same* δ to a sufficiently high order.

The product M for each tested slope is therefore constrained by δ. Choosing the precision in terms of f’s degree and the height exponent turns the height estimate into an upper bound **linear in B**, uniformly for every ring element. Uniformity matters: the argument must also apply to ring elements representing the attached elliptic points’ coordinates, not merely to the original root tuple.

But the height of the x-coordinate of nP grows **quadratically in n**, up to a bounded error, because the canonical height satisfies that quadratic law and P is nontorsion. Applying the linear upper bound to a point with maximal index yields, after absorbing fixed constants:

{{math:bound}}

That inequality bounds B by an ordinary constant. An ambient integer lying in an ordinary finite interval is an ordinary integer. Additivity, η(1) = 1, and injectivity then identify the modeled root coordinates with those ordinary integers. This is how the proposed argument tries to exclude a spurious nonstandard solution, completing the hard direction of the finite-test equivalence. [12](#r12), §2, “The height contradiction.”

## The dependencies are part of the proof claim

The rational manuscript’s denominator-parity argument uses a new companion, *A pointwise 2-converse for elliptic curves with rational two-torsion*, Theorem 1.1. It claims that, for a curve with nonzero rational two-torsion and full 2-power Selmer corank zero or one, analytic rank and Mordell–Weil rank equal that corank and the Tate–Shafarevich group is finite. That is stronger than merely assuming the curve has rank at most one. [13](#r13)

The height argument uses another new companion, *Fontaine–Mazur modularity at the prime 2*, Theorem 1.1. It claims modularity, up to Tate twist, for continuous irreducible odd two-dimensional 2-adic representations unramified outside finitely many primes and de Rham at 2 with distinct Hodge–Tate weights, without a residual-image hypothesis. [14](#r14)

These are **model-generated claims in the same release**, not settled background that this article can quietly import.

:::figure dependencies

OpenAI’s repository overview explicitly warns that unformalized results could have issues. At the pinned commit, I found no entry for the rational Hilbert theorem or these two companion titles in `lean/formalization.yaml`. That is a statement about this catalogue at this version, not proof that no formal work exists anywhere. I have not run a Lean checker for this claimed theorem or independently checked its arithmetic dependencies. [15](#r15)

The manuscript also claims rational solvability has Turing degree **0′**, the degree of the halting problem. Its lower bound uses the oracle reduction above; its upper bound uses the computable enumerability of rational solutions. A Turing reduction may make multiple oracle queries. It is not automatically a many-one reduction sending each halting instance to a single equivalent rational equation.

Its quartic consequence comes from introducing variables for arithmetic-circuit gates. Each gate gives a quadratic equation qᵢ = 0, and, over ℚ, their conjunction becomes:

{{math:quartic}}

Squares are nonnegative, so the sum vanishes exactly when every gate equation does. The resulting polynomial has degree at most four, but the number of variables, summands, and coefficient sizes is unbounded. The manuscript does **not** establish many-one completeness of rational solvability, a fixed-variable undecidability bound, or an existential definition of ℤ inside ℚ by this argument. [12](#r12), §7, Corollary 7.1.

## Keep the question and the evidence separate

DPRM shows that the boundary between programs and equations is much thinner than it looks. Formalization makes the translations across that boundary precise enough to inspect and mechanically check.

The new rational manuscript is worth understanding because its proposed finite-test route is different from the tempting “just define the integers” shortcut. But understanding that architecture is not validating the proof. For now, the useful stance is specific curiosity: follow the equivalence, inspect the new inputs, distinguish additive indices from multiplication, and keep the claim’s status attached to every conclusion drawn from it.

## References

References [12–15] are pinned to the release commit checked on October 7, 2026. The historical sources below distinguish original results, early reports, and completed formal developments.

#### R1

David Hilbert. *Mathematical Problems*, Problem 10. English translation by Mary Winston Newson of the 1900 address; *Bulletin of the American Mathematical Society* 8(10), 437–479 (1902). [DOI: 10.1090/S0002-9904-1902-00923-3](https://doi.org/10.1090/S0002-9904-1902-00923-3).

#### R2

Alan M. Turing. *On Computable Numbers, with an Application to the Entscheidungsproblem*. *Proceedings of the London Mathematical Society*, series 2, 42(1), 230–265 (1936–1937). [DOI: 10.1112/plms/s2-42.1.230](https://doi.org/10.1112/plms/s2-42.1.230).

#### R3

Marvin L. Minsky. *Recursive Unsolvability of Post’s Problem of “Tag” and Other Topics in Theory of Turing Machines*. *Annals of Mathematics*, second series, 74(3), 437–455 (1961). [DOI: 10.2307/1970290](https://doi.org/10.2307/1970290). A primary source for counter-machine universality; the demonstration above uses an explicit increment/decrement-and-branch variant.

#### R4

Martin Davis, Hilary Putnam, and Julia Robinson. *The Decision Problem for Exponential Diophantine Equations*. *Annals of Mathematics*, second series, 74(3), 425–436 (1961). [DOI: 10.2307/1970289](https://doi.org/10.2307/1970289).

#### R5

Yuri V. Matiyasevich. *Enumerable Sets Are Diophantine*. *Soviet Mathematics Doklady* 11, 354–358 (1970); Russian original, *Doklady Akademii Nauk SSSR* 191(2), 279–282. [Original paper record](https://www.mathnet.ru/eng/dan35274).

#### R6

Martin Davis. *Hilbert’s Tenth Problem is Unsolvable*. *The American Mathematical Monthly* 80(3), 233–269 (1973), especially the representation and normal-form discussion. [DOI: 10.2307/2318447](https://doi.org/10.2307/2318447).

#### R7

Benedikt Stock, Abhik Pal, Maria Antonia Oprea, Yufei Liu, Malte Sophian Hassler, Simon Dubischar, Prabhat Devkota, Yiping Deng, Marco David, Bogdan Ciurezu, Jonas Bayer, and Deepak Aryal. *Hilbert Meets Isabelle: Formalisation of the DPRM Theorem in Isabelle*. EasyChair Preprint 152, May 22, 2018, 11 pages. [DOI: 10.29007/3q4s](https://doi.org/10.29007/3q4s); [preprint](https://easychair.org/publications/preprint/GhvC).

#### R8

Jonas Bayer, Marco David, Abhik Pal, Benedikt Stock, and Dierk Schleicher. *The DPRM Theorem in Isabelle (Short Paper)*. *10th International Conference on Interactive Theorem Proving (ITP 2019)*, LIPIcs 141, 33:1–33:7 (2019). [DOI: 10.4230/LIPIcs.ITP.2019.33](https://doi.org/10.4230/LIPIcs.ITP.2019.33). The abstract explicitly records the remaining gaps.

#### R9

Jonas Bayer, Marco David, Benedikt Stock, Abhik Pal, Yuri Matiyasevich, and Dierk Schleicher. *Diophantine Equations and the DPRM Theorem*. *Archive of Formal Proofs*, June 6, 2022, ISSN 2150-914X. [Entry and formal proof development](https://isa-afp.org/entries/DPRM_Theorem.html).

#### R10

Dominique Larchey-Wendling and Yannick Forster. *Hilbert’s Tenth Problem in Coq (Extended Version)*. *Logical Methods in Computer Science* 18(1), article 35, March 1, 2022. [DOI: 10.46298/lmcs-18(1:35)2022](https://doi.org/10.46298/lmcs-18%281:35%292022); [publisher record](https://lmcs.episciences.org/9153). The construction uses FRACTRAN and constructive type theory.

#### R11

Jochen Koenigsmann. *Defining ℤ in ℚ*. *Annals of Mathematics* 183(1), 73–93 (2016), Theorem 1 and its consequences for logical fragments. [DOI: 10.4007/annals.2016.183.1.2](https://doi.org/10.4007/annals.2016.183.1.2).

#### R12

OpenAI. *Hilbert’s Tenth Problem over the Rational Numbers*. Model-generated OpenAI Math Release preprint dated September 24, 2026. [Pinned manuscript](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/preprints/Hilberts-tenth-problem-over-the-rational-numbers-September-24-2026/main.pdf). Relevant locations: §1, Theorem 1.1 and proof strategy; §2, finite rational tests, compactness, and height contradiction; §3, pole parity; §4, five-point height estimate; §§5–6, elliptic comparisons and prime patterns; §7, Corollary 7.1 and its explicit limitations. This article summarizes the claim, not a verified theorem.

#### R13

OpenAI. *A Pointwise 2-Converse for Elliptic Curves with Rational Two-Torsion*. Model-generated companion preprint dated September 24, 2026, Theorem 1.1. [Pinned manuscript](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/preprints/A-pointwise-2-converse-for-elliptic-curves-with-rational-two-torsion-September-24-2026/paper.pdf). New claimed input to [12], §3, not independently validated here.

#### R14

OpenAI. *Fontaine–Mazur Modularity at the Prime 2*. Model-generated companion preprint dated September 23, 2026, Theorem 1.1; normalization in §2.1. [Pinned manuscript](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/preprints/Fontaine-Mazur-modularity-at-the-prime-2-September-23-2026/paper.pdf). New claimed modularity input to [12], §4, without a residual-image hypothesis.

#### R15

OpenAI. *Mathematics manuscript collection*: [repository overview](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/README.md) and [formalization catalogue](https://github.com/openai/math/blob/adc7f1241b42e322a6451854ab7e4b4c146bf78a/lean/formalization.yaml), release commit `adc7f1241b42e322a6451854ab7e4b4c146bf78a`, committed October 6, 2026; checked October 7, 2026. The overview describes an internal model and mixed verification stages, and warns that unformalized results could have issues. Catalogue absence is only evidence about that catalogue at this commit.
