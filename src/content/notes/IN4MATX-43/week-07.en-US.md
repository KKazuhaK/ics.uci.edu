---
title: "Quality Assurance and Software Testing"
summary: "How do we know the software works? Verification vs. validation, the four QA technique families, the basic testing process, IEEE testing terminology (mistake/fault/error/failure), the three levels of testing (unit/integration/system), six ways to choose test cases, test oracles, and how to know when we're done testing."
---

# Informatics 43 — Week 7 Lecture Notes

> Covers **Lecture 13 & Lecture 14**: *"How do we know the software works? (Parts 1 & 2)"*

## Table of Contents

1. [Where We Are — From Building to Verifying](#1-where-we-are--from-building-to-verifying)
2. [A Second Look at Failures](#2-a-second-look-at-failures)
3. [The Failure Case Studies](#3-the-failure-case-studies)
4. [NASA's Cardinal Rules for Safety](#4-nasas-cardinal-rules-for-safety)
5. [The Power of Ten — Rules for Safety-Critical Code](#5-the-power-of-ten--rules-for-safety-critical-code)
6. [Quality Assurance — Verification vs. Validation](#6-quality-assurance--verification-vs-validation)
7. [QA Techniques — A Mixed Toolbox](#7-qa-techniques--a-mixed-toolbox)
8. [The Basic Testing Process](#8-the-basic-testing-process)
9. [A Concrete Example: Python `unittest`](#9-a-concrete-example-python-unittest)
10. [Testing Goals and the Dijkstra Quote](#10-testing-goals-and-the-dijkstra-quote)
11. [Testing Terminology (IEEE 610.12-90)](#11-testing-terminology-ieee-61012-90)
12. [Who Does the Testing?](#12-who-does-the-testing)
13. [The Three Levels of Testing](#13-the-three-levels-of-testing)
14. [Levels of Testing in Practice — The ToDoList Example](#14-levels-of-testing-in-practice--the-todolist-example)
15. [How to Choose Test Cases — The Sweet-Spot Problem](#15-how-to-choose-test-cases--the-sweet-spot-problem)
16. [Six Ways to Choose Test Cases](#16-six-ways-to-choose-test-cases)
17. [Test Oracles — Knowing If the Output Is Right](#17-test-oracles--knowing-if-the-output-is-right)
18. [All Software Has Bugs](#18-all-software-has-bugs)
19. [How Do We Know When We're Done Testing?](#19-how-do-we-know-when-were-done-testing)
20. [Quiz 7 Study Guide](#20-quiz-7-study-guide)
21. [Wrap-Up and Memory Framework](#21-wrap-up-and-memory-framework)

---

## 1. Where We Are — From Building to Verifying

Week 6 closed with **user-centered design** — interviews, personas, scenarios, storyboards, mockups, design guidelines, heuristic evaluation, and user testing — eight methods organized around a single claim: *it's all about the user*. The promise of doing UCD well was concrete and measurable: **sales increase, performance increases, traffic counts increase**, frustration decreases.

Week 7 asks the question one step further down the pipeline. We have designed the system around the user. We have implemented it. Now:

$$\boxed{\textbf{How do we know the software actually } \textit{works}\textbf{?}}$$

The full progression we are building up is now:

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture} \;\longrightarrow\; \textbf{Design} \;\longrightarrow\; \textbf{User-Centered Methods} \;\longrightarrow\; \textbf{Code} \;\longrightarrow\; \textbf{QA \& Testing}}$$

Two lectures cover the territory. **Lecture 13** motivates *why* QA matters (a second look at failure case studies), defines **Quality Assurance** as verification + validation, lists the four QA technique families, and then drills into testing itself: the basic process, the four IEEE terms (mistake/fault/error/failure), who does it, and the three levels (unit/functional/system). **Lecture 14** opens the testing toolbox: *how to choose test cases*, *how to know if the output is right* (test oracles), *all software has bugs*, and *when are we done testing*.

---

## 2. A Second Look at Failures

We have seen failure case studies before — usability failures in Week 6, requirements failures earlier in the course. Lecture 13 returns to failures from a new angle: **most large software failures are QA failures**. The systems were built; they shipped; and somewhere between requirements and release, the work of verifying that the system actually behaved correctly was either skipped, rushed, or done badly.

The gallery in this lecture is not chosen to scare students. It is chosen to make one point:

> **Bad software is not a hypothetical risk.** Real airliners have crashed, real spacecraft have been lost, real cars have killed people, and real billions of dollars have been spent fixing things that should have been correct in the first place — all because nobody verified the software thoroughly enough.

The argument across the gallery is also that *severity scales with consequence*, not with code size. A two-digit year field cost the world $300 billion. A single sensor reading killed two planes full of people. The cost of a missing QA practice is not proportional to how clever the bug was.

---

## 3. The Failure Case Studies

| Case | What went wrong | The QA lesson |
|------|------|------|
| **Boeing 737 Max** | The MCAS flight-control software trusted a single angle-of-attack sensor and could push the nose down without pilot consent. Two crashes (Lion Air 610, Ethiopian 302), 346 deaths | Safety-critical systems must not allow a *single* event to trigger a hazardous action; QA failures get embedded in business priorities — "safety doesn't come first, money does" |
| **Toyota "Unintended Acceleration"** | Drivers reported cars accelerating uncommanded. Investigations pointed to software defects in throttle control — the code was tangled (no high cohesion / low coupling), and although it *did* produce internal error codes, nothing was done with them: there was no fail-safe / "safe mode" to fall back into | Software complexity without **robustness** is dangerous; this is exactly the failure mode NASA's second cardinal rule (§4) exists to prevent |
| **Apollo 8 / Margaret Hamilton** | Hamilton's team at MIT wrote the on-board flight software with an explicit *priority-display* / error-recovery design — when the computer was overloaded, it would shed low-priority tasks rather than crash. This design saved Apollo 11's landing. (The famous photo shows Hamilton standing next to a stack of code listings taller than she is.) | Good QA practice — defensive design, error handling, priority management — *prevented* a disaster |
| **Mars Polar Lander** | The lander crashed into the Martian surface in 1999. The leading cause: spurious signals when the legs deployed were interpreted as touchdown, so the engines were cut off ~40 m above the surface | Software interpreted sensor input incorrectly; the spec did not anticipate a transient signal |
| **Y2K** | Two-digit year fields (`MM/DD/YY`) made it ambiguous whether `00` meant 2000 or 1900. Some systems wrapped, some renamed `1999` to `19100`. Worldwide remediation cost ~**$300 billion**; the eventual day-of impact was relatively minor *because* of that effort | A "small" data-definition shortcut, multiplied across millions of programs and decades, becomes a civilization-scale bug |

> The Boeing 737 Max quote from IEEE Spectrum is worth keeping in mind for the quiz: *"The 737 Max saga teaches us not only about the **limits of technology** and the **risks of complexity**, it teaches us about our real priorities. Today, **safety doesn't come first — money comes first**, and safety's only utility in that regard is in helping to keep the money coming."*

The Apollo 8 case is the positive counter-example in the set. The other four show what happens without rigorous QA; Apollo 8 shows what disciplined engineering looks like — and that even with primitive hardware, *correct software is possible if you treat verification as a first-class engineering activity*.

![Black-and-white NASA photograph of Margaret Hamilton standing next to a stack of printouts of the Apollo Guidance Computer source code that is taller than she is.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/apollo-8-margaret-hamilton-code-stack.jpg)

![Photograph of an LED departure board at École Centrale de Nantes displaying "BIENVENUE A L'ECOLE CENTRALE DE NANTES — 12 HEURES 09 — 3 JANVIER 1900", a Y2K rollover bug in action.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/y2k-french-station-jan-1900.jpg)

---

## 4. NASA's Cardinal Rules for Safety

NASA's full safety-critical software standard runs 388 pages. The lecture extracts the two "cardinal rules" that summarize the philosophy:

| Rule | Plain English |
|------|------|
| **No single event or action shall be allowed to initiate a potentially hazardous event.** | Hazardous actions must require *multiple* independent triggers. A single sensor glitch, a single button press, a single message must never be enough to cause harm |
| **When an unsafe condition or command is detected, the system shall (a) inhibit the potentially hazardous event sequence, and (b) initiate procedures to bring the system to a predetermined "safe" state.** | Detection isn't enough — the system must also *stop* the hazard and actively *move toward* safety |

Notice how the Boeing 737 Max failure violates the first rule directly: a single angle-of-attack sensor was sufficient to trigger the MCAS pitch-down command. Multiple sensors, cross-checking, and pilot override would have satisfied the rule.

> A simple everyday illustration of rule #2 is a **traffic light**. The normal modes are red and green, but the light cannot be allowed to fail *stuck on green* — that's a hazardous state. When something goes wrong, the system falls back to a predetermined safe state: **all directions blink red**, and drivers default to treating the intersection as a stop sign. That is exactly the cardinal-rule pattern: detect → inhibit the hazard → enter a safe state.

> Cardinal rules like these are not testing techniques; they are **design constraints** that make testable correctness possible. You cannot test your way out of an architecture that lets one bad reading kill people.

---

## 5. The Power of Ten — Rules for Safety-Critical Code

A complementary list, **"The Power of Ten — Rules for Developing Safety Critical Code"** (Holzmann, IEEE Computer, June 2006), gives coding-level discipline for safety-critical systems. Holzmann wrote these at **NASA's Jet Propulsion Laboratory**, where the target was spacecraft software — code that has to run for years without supervision in an environment where **cosmic rays can flip bits at random** and there is no chance to roll out a patch. That context is why the rules read as draconian: every one closes off a specific class of bug that the JPL team had seen in flight software.

| # | Rule | Why |
|---|------|------|
| 1 | Restrict to simple control flow constructs | No `goto`, no `setjmp/longjmp`, no recursion — keeps the call graph analyzable |
| 2 | Give all loops a fixed upper-bound | Makes it possible to prove loop termination |
| 3 | Do not use dynamic memory allocation after initialization | Avoids leaks, fragmentation, and use-after-free in long-running systems |
| 4 | Limit functions to no more than 60 lines of text | A function should fit on one screen — keeps reviewers able to reason about it |
| 5 | Use minimally two assertions per function on average | Document and check assumptions at runtime |
| 6 | Declare data objects at the smallest possible level of scope | Limits the blast radius of any one variable |
| 7 | Check the return value of non-void functions, and check the validity of function parameters | Never silently ignore errors or invalid input |
| 8 | Limit the use of the preprocessor to file inclusion and simple macros | Macros that hide control flow defeat static analysis |
| 9 | Limit the use of pointers; no more than two levels of dereferencing per expression | Aliasing is the source of many of the worst safety bugs |
| 10 | Compile with all warnings enabled, and use one or more source code analyzers | Free QA — the compiler and tools already know about most common mistakes |

> These rules are draconian on purpose. They are aimed at code that flies airplanes and spacecraft, not at a personal project. But the underlying logic — *make code analyzable, make assumptions explicit, fail loudly rather than quietly* — generalizes to any project where correctness matters.

---

## 6. Quality Assurance — Verification vs. Validation

The lecture's operational definition of QA is:

$$\boxed{\textbf{Quality Assurance} = \textbf{all activities designed to measure and improve quality in a product}}$$

QA decomposes into two sister activities. Both are needed; they answer different questions.

| Activity | Question it answers | What it compares |
|------|------|------|
| **Verification** | *"Are we building the system **right**?"* | System against **Specifications** — does the system conform to what the spec says it should do? |
| **Validation** | *"Are we building the **right** system?"* | System (and the spec itself) against **Requirements** — does the spec, and the system that implements it, actually serve the user's purpose? |

![Three-block diagram contrasting verification and validation: an arrow labelled "Validation" runs between Requirements and System, and an arrow labelled "Verification" runs between Specifications and System.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/verification-validation-diagram.png)

The diagram in the slide shows three boxes — Requirements, Specifications, System — connected by two arrows:

- **Verification** arrow: between Specifications and System (does the built thing match the written spec?)
- **Validation** arrow: from System back to Requirements (does the built thing fulfill the actual need?)

> A system can be **verified but not validated**: it perfectly implements the spec, but the spec captured the wrong requirements, so the product is useless. A system can also be **validated but not verified**: it happens to satisfy users, but does not conform to its own spec, so it's brittle and hard to maintain. Good QA needs both.

This V&V framing is also useful as a mental model for **what** QA activities are *for*. Reviews of a requirements document are validation (does the spec match what users need?). Unit tests of a function are verification (does the function match its spec?). Beta testing is mostly validation (do real users get what they need from the running system?).

---

## 7. QA Techniques — A Mixed Toolbox

Lecture 13 lists four families of QA technique. The lecture's punchline is the box at the bottom of the slide: **"Use a mixture of techniques!"** No single technique catches all faults; each has a sweet spot.

| Technique | What it is | Strength |
|------|------|------|
| **Formal methods** | Mathematical proofs that the program meets its specification | Highest assurance; works for small, critical components |
| **Static analysis of program properties** | Tools that inspect the source code (or bytecode) without running it — type checkers, linters, dataflow analyzers, security scanners | Cheap, fast, finds whole classes of bugs (null derefs, unused variables, simple races) |
| **Reviews and inspections** | Humans reading the code/document together and looking for defects | Catches issues that automated tools cannot — design smells, naming confusions, misunderstood requirements |
| **Testing** | Running the program on chosen inputs and comparing to expected outputs | The most common in industry; concrete, repeatable, and produces evidence of behavior |

Testing is the rest of this week's focus and most of next week's. Reviews and static analysis are touched on briefly; formal methods are mentioned mainly so you know they exist and that for the most safety-critical systems they are non-optional.

---

## 8. The Basic Testing Process

The lecture lays out the testing process as a tight loop:

1. **Devise a test case (input)** — pick the input(s) to feed into the unit under test
2. **Create the expected output** — write down what the *correct* output for that input should be
3. **Run the test case** — execute the unit on the chosen input
4. **Capture the actual output** — record what the unit actually produced
5. **Compare actual output to expected output**
6. *Lather, rinse, and repeat*

Step 5 is the decision rule, and it has exactly two outcomes:

| Comparison | Outcome |
|------|------|
| Actual output **=** expected output | Test case **SUCCEEDS** / **PASSES** |
| Actual output **≠** expected output | Test case **FAILS** (report the failure) |

> Two subtleties hide inside this six-step loop. **(1)** Step 2 (the expected output) is *not* trivial — it requires you to know, ahead of time, what the right answer is. The mechanism for knowing the right answer is called a **test oracle**, and Lecture 14 returns to it. **(2)** Most of this loop is **automated** in modern practice — test frameworks run thousands of cases automatically and compare actual vs. expected on each one. Human time is spent designing the test cases, not running them.

---

## 9. A Concrete Example: Python `unittest`

The lecture shows a minimal example using Python's standard `unittest` framework. It is worth walking through because every term in Lecture 13 maps onto a piece of this code.

```python
import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()
```

Running this produces:

```
...
----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK
```

| Code element | Map to terminology |
|------|------|
| `class TestStringMethods(unittest.TestCase)` | A test suite — a collection of test cases |
| `def test_upper(self)` | An individual test case (devise input, create expected output, compare) |
| `self.assertEqual('foo'.upper(), 'FOO')` | The compare step — actual output is `'foo'.upper()`, expected output is `'FOO'` |
| `self.assertTrue(...)` / `self.assertFalse(...)` | Specialized comparisons for boolean expected outputs |
| `with self.assertRaises(TypeError):` | Negative test — the expected output is *an exception*; the test passes when the exception is raised |
| `Ran 3 tests in 0.000s — OK` | Three test cases passed; no failures |

> Note how short the code is. The `unittest` framework hides the loop machinery; the engineer writes only the (input, expected-output) pairs. This is what "much of the testing process is automated" actually looks like in practice.

---

## 10. Testing Goals and the Dijkstra Quote

The lecture summarizes the goals of testing as:

1. **Find and fix failures/faults/errors.**
2. **Improve confidence** that the system performs *as specified* (verification) and *as desired* (validation).
3. Do both of the above in a way that is **accurate**, **thorough**, **repeatable**, and **systematic**.

Note that the slide draws a line through "Complete" and replaces it with "Thorough." That is not a typo — it is the key insight, made explicit by the famous Dijkstra quote in the red box at the bottom of the slide:

> $$\boxed{\textbf{"Program testing can be used to show the presence of bugs, but never to show their absence."}\;[\text{Dijkstra}]}$$

Why? Because for any non-trivial program, the input space is enormous (often infinite). You cannot run the program on every input — you can only run it on a sample. Any test you write that *passes* tells you the program is correct **on that input**. It tells you *nothing* about the inputs you did not test. Bugs in untested inputs are still there, waiting.

This is why testing can never be "complete" in any logical sense. The best testing can do is be **thorough enough** that the bugs left are too rare or too obscure to matter in practice. "Thorough" is an engineering judgment; "complete" is a mathematical impossibility.

> ⚠️ The Dijkstra quote is an **attendance-quiz topic** in this lecture. Memorize the wording: *"Program testing can be used to show the presence of bugs, but never to show their absence."*

---

## 11. Testing Terminology (IEEE 610.12-90)

The IEEE Standard Glossary of Software Engineering Terminology (IEEE 610.12-90) distinguishes four terms that everyday speech tends to collapse into "bug." On the quiz, knowing the differences is non-negotiable.

| Term | Definition | What you point at |
|------|------|------|
| **Mistake** | A *human action* that produces an incorrect result | The person (coder or user) |
| **Fault / Bug** | An incorrect step, process, or data definition in a computer program | A specific location **in the code** |
| **Error** | A difference between a computed result and the correct result | An *internal* or *external* state during execution |
| **Failure** | The (incorrect) result of a fault | The *externally visible* unexpected behavior or output |

The common industry term **"defect"** usually means **fault**.

> The chain of causation is: **Mistake → Fault → Error → Failure.** A programmer makes a mistake (typed `<` instead of `<=`), which embeds a fault (the wrong operator in the code). At runtime, that fault produces an error (the comparison computes the wrong boolean), which propagates to a failure (the user sees the wrong screen, or the system crashes).

A useful illustration: a developer misreads a spec and writes `count > 0` when the spec says "non-negative." That is the **mistake**. The line of code `if (count > 0)` is the **fault**. When the program runs with `count == 0`, the comparison returns `false` when it should have returned `true` — that internal wrong value is the **error**. Eventually a function that depended on it returns the wrong total, which the user sees on screen — that visible incorrect output is the **failure**.

---

## 12. Who Does the Testing?

Testing is not the job of one role. Different testers find different bugs.

| Who | When / How |
|------|------|
| **Programmers** | Write unit tests as they code (often: before they code, in test-driven development); run them on every change. Catch low-level faults early |
| **Testers** (dedicated QA staff) | Design and run more rigorous test suites — integration tests, regression tests, scripted system tests. Often write tests against the spec without looking at the code |
| **Users** | Test the system in something closer to real-world conditions, in several flavors: |
| 　　↳ Acceptance testing | Customer or customer's representative verifies that the system meets contracted requirements before it is accepted |
| 　　↳ Alpha testing | Internal use, typically still by the developing organization, in a controlled environment |
| 　　↳ Beta testing | Real, external users with a pre-release build, in real-world conditions |
| 　　↳ Crowdsourcing / bug bounties | Pay outside testers (security researchers, the public) per bug found. Common for security-sensitive systems |

> The reason "who" matters: **each tester has different blind spots**. Programmers know how the code is supposed to work, so they unconsciously test the cases they already wrote for. Independent testers don't share those assumptions and find different bugs. Real users hit input combinations no engineer would think to try.

---

## 13. The Three Levels of Testing

![Mike Cohn's test pyramid showing Unit Tests at the wide base, Integration Tests in the middle, and System Tests at the narrow top, with left axis "more isolation → more integration" and right axis "faster → slower". Source: M. Cohn, Succeeding with Agile, 2009.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/test-pyramid-cohn.png)

Testing also varies by *scope*. The slide presents the classic three levels, often visualized as a **testing pyramid** — many tests at the bottom (cheap, fast), few at the top (expensive, slow).

| Level | What it tests | Where it sits on the pyramid |
|------|------|------|
| **Unit testing** | A single code unit (function, class, module) in isolation | Bottom — many tests, fast, highly isolated |
| **Functional / integration testing** | The *interfaces* among integrated units — what happens when modules call each other | Middle — fewer tests, slower, more integrated |
| **System / acceptance testing** | The complete, assembled system against its requirements | Top — few tests, slowest, full integration |

The pyramid's axes give the two trade-offs:

| Axis | Bottom (unit) | Top (system) |
|------|------|------|
| **Isolation ↔ Integration** | More isolation | More integration |
| **Speed** | Faster | Slower |

> The pyramid is normative as well as descriptive: you should have *many* fast unit tests, *some* integration tests, and *a few* end-to-end system tests. Projects that invert the pyramid — relying on end-to-end tests to catch low-level bugs — end up with slow, flaky test suites that nobody trusts.

---

## 14. Levels of Testing in Practice — The ToDoList Example

The lecture grounds the three levels in a concrete example: a `ToDoList` application.

![Three side-by-side red panels for a ToDo list app. Left: ToDoListItem class with its fields and methods, marked Unit testing (ToDoListItem.setPriority()). Middle: List DB containing a ToDoList of items with addItem/editItem/deleteItem/markDone, marked Functional/integration testing (ToDoList.editItem()). Right: ToDoListApp wrapping ListDB, UI, Calendar, Settings, Notifications, marked System/acceptance testing (Create/Edit/Delete a list).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/todolist-three-levels-of-testing.png)

```text
Application:  ToDoListApp
              ├── ListDB
              ├── UI
              ├── Calendar
              ├── Settings
              └── Notifications

ListDB:       Stores ToDoList objects
              └── ToDoList
                    ├── items: List<ToDoListItem>
                    ├── addItem(), editItem(), deleteItem(), markDone(), ...

ToDoListItem: ├── description: String
              ├── dateCreated: Date
              ├── priority: int
              ├── done: boolean
              └── editDescription(), setPriority(), markDone()
```

Each testing level targets a different layer of this design:

| Level | Concrete example from the slide |
|------|------|
| **Unit testing** | `ToDoListItem.setPriority()` — test that the single method correctly updates the `priority` field on a single item |
| **Functional / integration testing** | `ToDoList.editItem()` — test that editing an item *through the `ToDoList` interface* correctly updates the underlying `ToDoListItem` and persists |
| **System / acceptance testing** | High-level user workflows: *Create a new list*, *Edit list info*, *Edit list item*, *Delete list*. Tests the whole app — UI, DB, calendar, notifications — end-to-end |

> The mapping is mechanical: **a class method → unit test; a class-to-class interface → integration test; a user-facing workflow → system test**. When you write a new feature, you should think about which level each new test belongs to.

---

## 15. How to Choose Test Cases — The Sweet-Spot Problem

Lecture 14 opens with a deceptively simple function:

```c
int multiplier(int a, int b) {
    return a * b;
}
```

How many test cases does this function have? On a 32-bit `int`, the input space is $2^{32} \times 2^{32} = 2^{64} \approx 1.8 \times 10^{19}$ pairs. Even at a billion tests per second, exhaustive testing would take ~580 years.

This is the basic tension of testing: the input space is effectively infinite, but the time and budget for testing are very finite.

$$\boxed{\textbf{Test design = picking a small sample of inputs that finds as many bugs as possible.}}$$

The slide visualizes this as a curve of **confidence in the module being tested** (y-axis) vs. **number of test cases with correct outputs** (x-axis):

![Concave curve showing Confidence in module being tested rising with the Number of test cases with correct outputs. A red arrow midway up the curve labels the inflection point "Sweet spot?".](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/sweet-spot-curve.png)

- The curve starts low and rises steeply at first — each new test case adds a lot of confidence.
- The curve flattens out as you add more cases — diminishing returns.
- The **sweet spot** is the point where the curve has flattened enough that additional tests aren't buying much new confidence.

> The sweet spot is an engineering judgment, not a fixed number. For a safety-critical system, the curve flattens later (and the budget for chasing diminishing returns is higher). For a small internal tool, the sweet spot comes much earlier.

The rest of the lecture is about *how to pick* those test cases so each one is worth the time — so each new test case is buying as much confidence as possible.

---

## 16. Six Ways to Choose Test Cases

The lecture lists six concrete strategies for choosing test cases. Some are based on the spec, some on the code, some on the history of the project itself.

| # | Strategy | What it uses | Lecture status |
|---|------|------|------|
| 1 | **Intuition** | The tester's experience and gut feeling about what might break | Mentioned, not preferred — useful but not systematic |
| 2 | **Specification (black-box testing)** | The *specification* of what the program should do, without looking at the code | Two systematic sub-strategies follow: |
| 2a | 　　Equivalence-class partitioning | Group inputs into classes that the spec treats the same; pick one representative per class | Black-box, systematic |
| 2b | 　　Boundary-value analysis | Pick inputs *at the edges* of equivalence classes (zero, max, off-by-one) — bugs cluster at boundaries | Black-box, systematic |
| 3 | **Code (white-box testing)** | The *source code itself*, to ensure every part is exercised | One sub-strategy: |
| 3a | 　　Path analysis | Ensure each path through the control flow graph is tested at least once | White-box, systematic |
| 4 | **Existing test cases (regression testing)** | The test suite from previous versions — re-run every existing test on the new version to make sure nothing that used to work has broken | Defensive — catches *new* bugs in *old* features |
| 5 | **Faults** | Known fault patterns (common bug taxonomies, things this team has gotten wrong before) | Often part of "intuition" in practice, but can be made systematic |

The three big categories worth keeping straight for the quiz:

| Category | Looks at | Strengths |
|------|------|------|
| **Black-box (specification-based)** | What the program *should* do | Independent of implementation; catches missing features, misread specs |
| **White-box (code-based)** | What the program *does* | Catches dead code, untested branches, implementation-specific bugs |
| **Regression** | What the program *used to* do | Catches new code breaking old behavior |

> Lecture 14 doesn't drill into the techniques themselves — that's next week ("Testing, part 3: Black-box testing"). The point of slide 36 is the *vocabulary*: black-box vs. white-box, equivalence partitioning vs. boundary values vs. path analysis vs. regression. Be able to name and briefly describe each.

---

## 17. Test Oracles — Knowing If the Output Is Right

Going back to step 5 of the basic testing process: *compare actual output to expected output*. This raises a question that sounds trivial but isn't:

$$\boxed{\textbf{How do we know what the } \textit{expected} \textbf{ output should be in the first place?}}$$

The mechanism that answers this question is called a **test oracle**.

> **Test Oracle**: a mechanism for deciding whether a test case execution succeeds or fails — i.e., what the correct output is for a given input.

The slide notes that **oracles are difficult to automate**. Why? Consider the cosine example:

> Your test execution shows `cos(0.5) = 0.87758256189`. **Oracle?**

How do we *decide* whether `0.87758256189` is correct? Several oracle strategies are possible, each with trade-offs:

| Oracle strategy | How it works for `cos(0.5)` | Trade-off |
|------|------|------|
| **Manual computation** | Compute `cos(0.5)` by hand or on paper | Impossible for non-trivial cases; doesn't scale |
| **Reference implementation** | Compare against a trusted library (`math.cos` in some other language) | What if both implementations have the same bug? Who validates the reference? |
| **Algebraic identity** | Check that `cos(x)^2 + sin(x)^2 ≈ 1` | Indirect — passes the identity does not prove the value is right, just consistent |
| **Domain knowledge** | We know `cos(0) = 1` and `cos(π/2) = 0`, and `0.5` is in between, so the answer should be near `0.88` | Sanity check, not a real oracle |
| **Specification / formal definition** | Compute from the Taylor series to verify | Theoretically rigorous, often impractical |
| **Human expert** | A mathematician or domain expert eyeballs the output | Doesn't automate, doesn't scale |

> The cosine example is intentionally simple. The point is that **even for a function with a precise mathematical definition, deciding what the right answer is requires real work**. For most software — UI flows, business rules, machine learning models — the oracle problem is much harder, because the "correct" behavior may not have a closed-form definition at all.

In practice, oracles in test code look like the `assertEqual` calls in the `unittest` example from §9: the test author **hard-codes the expected output** alongside the input. That's a perfectly valid oracle as long as the author wrote down the *right* expected value — which puts the burden of correctness on whoever wrote the test.

⚠️ **Test oracles are also an attendance-quiz topic** ("Systematic Testing and Oracles") in this lecture.

---

## 18. All Software Has Bugs

Lecture 14 makes a sobering claim, which it backs up with both a quote and a counter-example:

> *"All nontrivial code has defects, and the probability of nontrivial defects increases with code size. The more code you use to solve a problem, the harder it gets for someone else to understand what you did and to maintain your code when you have moved on to write still larger programs."*
> — Holzmann, *Code Inflation*, IEEE Software, 2015

The counter-example is concrete and deliberately startling:

> **Q**: What is the required period of *failure-free operation* for conventional takeoffs and landings of the **F-35 Joint Strike Fighter**?
> (a) 6,000 years   (b) 600 years   (c) 60 years   (d) **6 hours**

The answer is **(d) 6 hours**. The most expensive weapons program in human history sets its software reliability target at *six hours* between failures — and a recent government report stated that **even that target had not yet been realized**. If a multi-billion-dollar fighter jet cannot be expected to run six hours without a software failure, the idea that ordinary software is bug-free is a fantasy.

The contrast with consumer-scale targets is instructive. **Uber**, for example, publishes availability goals roughly along the lines of:

| Metric | Target |
|------|------|
| Overall availability | **99.99%** |
| Cumulative downtime per year | ~ **1 hour** |
| Downtime per week | ~ **1 minute** |
| Failure rate | ~ **1 failure per 10,000 runs** |

Those numbers sound aggressive until you compare them against what they actually allow — *an hour of broken service every year* — and notice that even hitting them is hard. Reliability is always a budget, never a guarantee.

The slide on "bizarre bugs" reinforces the same point from a different angle: real bug trackers contain entries like *"OpenOffice will not print on Tuesdays"* (Ubuntu bug #248619). The bug was real, reproducible, and eventually traced to a date-handling issue. Bugs in production are stranger than test cases would lead you to expect.

![Screenshot of Ubuntu Launchpad bug #248619, reported 2008-07-15 by jgallo, titled "file incorrectly labeled as Erlang JAM file (OOo does not print on Tuesdays)". Both file (Debian) and file (Ubuntu) rows show status "Fix Released" with importance High.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/bug-ubuntu-prints-on-tuesdays.png)

The takeaway is not nihilism. It is calibration:

| Wrong belief | Better belief |
|------|------|
| "If I test enough, my software will be bug-free." | "My software will have bugs. Testing reduces their number and severity." |
| "A bug means I'm a bad engineer." | "A bug means I'm an engineer. Good engineers measure, fix, and prevent recurrence." |
| "Defects scale linearly with code size." | "Defects scale *worse* than linearly with code size — small, simple code is easier to keep correct." |

This is also one of the strongest arguments for the **Power of Ten** rules (§5) and for design principles like high cohesion / low coupling: less code, simpler code, more local code → fewer bugs, easier verification.

---

## 19. How Do We Know When We're Done Testing?

Since we can never be *complete* (Dijkstra), and since all software has bugs, "done" must be defined operationally. The lecture gives four working answers — labeled (I) through (IV) — that real projects use, alone or in combination. (The slide deck happens to skip directly from II to IV; (III), described from lecture audio, is the **fault seeding** technique below.)

### 19.1 (I) Fixed time / fixed budget

> *Aim to reveal as many faults as possible in a fixed period of time with a fixed budget.*
> *Target specific areas of the system.*
> *Aim to meet the quality requirements established for the project.*

In this model, testing stops when the time or money allocated to it runs out — what matters is that the *limited* budget is spent on the *highest-risk* areas (areas with high complexity, high churn, high user-facing impact, or weak prior coverage).

### 19.2 (II) Problem-find rate stabilizes near zero

The slide shows a curve of **number of problems found per hour** over **days of testing**: a rapid ramp-up, a peak, then a slow decay toward zero. When the find rate flattens to near-zero, you've extracted most of the easy bugs and additional testing is not buying much.

![Line chart of Number of problems found per hour over time, ramping up to a peak around Day 2 and then declining toward zero by Day 5. A blue arrow at the right marks the inflection point with the caption "Could stop testing when the problem find rate stabilizes to near zero".](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/bug-find-rate-curve.png)

> Risk: a low find rate can also mean *your testers are bad at finding bugs*, not that the system is bug-free. This metric must be combined with code coverage and other signals to be trustworthy.

### 19.3 (III) Fault seeding (defect injection / mutation testing)

A clever twist on (II) that turns the "are we done?" question into something measurable. The idea:

1. Deliberately **inject (seed) a set of known artificial bugs** into the code — small mutations like flipping `<` to `<=`, swapping `+` and `-`, returning the wrong variable.
2. Run the existing test suite **without telling the testers** which bugs are real and which are seeded.
3. Count how many of the seeded bugs the test suite caught.

The intuition is statistical: if the seeded bugs are *similar in kind* to the real bugs that remain in the code, then **the fraction of seeded bugs caught is an estimate of the fraction of real bugs caught**. If your suite caught 90% of the seeded faults, you can reasonably believe it's catching roughly 90% of the real ones too, and infer how many bugs are still left undiscovered.

| Strength | Weakness |
|------|------|
| Gives a *quantitative* answer to "how good is my test suite?" | Only as accurate as the assumption that seeded bugs resemble real ones |
| Forces the team to confront blind spots — bugs that *no* test catches | Generating realistic seeded bugs is itself non-trivial |
| Forms the basis of modern **mutation testing** tools (PIT for Java, Stryker for JS, mutmut for Python) | Automated mutation testing can be slow on large codebases |

> Conceptually, fault seeding answers a different question than (I) or (II). Those ask *"have we tested enough?"* using time or trends. Seeding asks *"is the test suite itself any good?"* — and that's often the more honest question.

### 19.4 (IV) Industry-survey exit criteria (Kassab et al., 2017)

The lecture shows results from a 103-project industry survey (Kassab, DeFranco, Laplante, *Software Testing: The State of the Practice*, IEEE Software 34(5), 2017) on which exit criteria are actually used:

![Horizontal bar chart (Figure 6 from Kassab et al. 2017) showing how 103 projects answered Yes/No for six possible exit criteria for test completion. "Each requirement has been tested at least once" is the most common Yes (~65%); "The planned test budget is depleted" is the least common Yes (~10%).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/exit-criteria-kassab-2017.png)

| Criterion | Used in practice? |
|------|------|
| **Each requirement has been tested at least once** | ✅ Most common — ~65% Yes |
| **All planned test activities have been performed** | ✅ ~60% Yes |
| The delivery time has been reached | Mixed — ~40% Yes |
| Sufficient defects have been found to have trust in the software | ❌ ~25% Yes (most: No) |
| The values specified in the metrics have been reached | ❌ ~20% Yes |
| **The planned test budget is depleted** | ❌ ~10% Yes |

The survey's headline finding (and the one most worth remembering):

$$\boxed{\textbf{The most common real-world exit criterion is: "each requirement has been tested at least once."}}$$

This is a *requirement-coverage* criterion. It is concrete, easy to measure, and pragmatic — you can't ship before every requirement has at least one test backing it. It does not guarantee bug-free software (nothing does), but it ties testing back to the spec, which closes the verification loop.

> The contrast with "the planned test budget is depleted" (only 10% Yes) is reassuring — most projects don't simply ship when they run out of money. The contrast with "sufficient defects have been found to have trust" (only 25% Yes) is the discouraging side: most teams *don't* have a defect-density threshold they hold themselves to.

---

## 20. Quiz 7 Study Guide

Quiz 7 has been postponed to the following week, but the substantive content of Lectures 13 & 14 is fair game. Focus areas:

### 20.1 Vocabulary you must be able to define

| Term | One-sentence definition |
|------|------|
| **Quality Assurance (QA)** | All activities designed to measure and improve quality in a product |
| **Verification** | Does the system conform to specifications? ("Building the system right") |
| **Validation** | Does the system serve its purpose? ("Building the right system") |
| **Mistake** | A *human action* that produces an incorrect result |
| **Fault / Bug / Defect** | An incorrect step, process, or data definition in the code |
| **Error** | A difference between a computed result and the correct result (internal or external) |
| **Failure** | The externally visible incorrect result of a fault |
| **Test case** | An input + expected output pair used to exercise the system |
| **Test oracle** | A mechanism for deciding whether a test case execution succeeds or fails |
| **Unit testing** | Testing of a single code unit |
| **Integration / functional testing** | Testing of interfaces among integrated units |
| **System / acceptance testing** | Testing of the complete system against requirements |
| **Black-box testing** | Test design based on the specification, not the code |
| **White-box testing** | Test design based on the source code itself |
| **Regression testing** | Re-running existing tests on a new version to ensure old features still work |

### 20.2 The four QA techniques

Formal methods, static analysis, reviews and inspections, testing — *use a mixture*.

### 20.3 The four "who"s

Programmers, testers, users (acceptance / alpha / beta / crowdsourcing-bug-bounties).

### 20.4 The three levels of testing

Unit → functional/integration → system/acceptance. Be able to give a one-sentence definition of each and a concrete example (the ToDoList walkthrough is the canonical one).

### 20.5 The Dijkstra quote (attendance-quiz topic)

> *"Program testing can be used to show the presence of bugs, but never to show their absence."*

Be able to write it down, and to explain *why*: the input space is too large to exhaust, so testing samples; samples can find bugs but cannot prove no bugs exist.

### 20.6 Test cases and oracles (attendance-quiz topic)

How to choose test cases (intuition, black-box [equivalence partitioning, boundary values], white-box [path analysis], regression, faults). What a test oracle is and why automating it is hard (cosine example).

### 20.7 When are we done testing?

Be able to list the main approaches: fixed time/budget, target specific areas, meet quality requirements, find-rate stabilization, **fault seeding** (inject known bugs, measure what fraction the suite catches → estimate what fraction of real bugs remain), and — the most common in practice — *each requirement tested at least once*.

### 20.8 Failure case studies and safety rules

Recognize Boeing 737 Max, Toyota Unintended Acceleration, Apollo 8 / Margaret Hamilton (positive example), Mars Polar Lander, Y2K. Know **NASA's two cardinal rules** and the general spirit of **The Power of Ten** (don't memorize all ten, but understand: simple control flow, fixed loop bounds, no dynamic allocation, small functions, assertions, scoped data, check return values, simple preprocessor, limit pointers, warnings + analyzers).

---

## 21. Wrap-Up and Memory Framework

```text
Week 7 knowledge structure
|
+-- Where we are
|   +-- Requirements -> Architecture -> Design -> User methods
|       -> Code -> QA & TESTING
|   +-- Question this week: how do we know the software works?
|
+-- Why QA matters (Lecture 13)
|   +-- Failure case studies:
|   |   +-- Boeing 737 Max  -> single sensor; safety vs. money
|   |   +-- Toyota          -> uncommanded acceleration
|   |   +-- Apollo 8        -> Hamilton; defensive design (POSITIVE)
|   |   +-- Mars Polar Lander -> spurious touchdown signal
|   |   +-- Y2K             -> 2-digit year; $300B remediation
|   +-- NASA's Cardinal Rules for Safety:
|   |   +-- No single event triggers a hazard
|   |   +-- On unsafe condition: inhibit + go to safe state
|   +-- The Power of Ten (Holzmann, IEEE 2006):
|       +-- 10 rules for safety-critical code
|       +-- simple control flow, bounded loops, no dynamic alloc,
|           small fns, 2 assertions/fn, smallest scope, check
|           return values, limited preprocessor, limited pointers,
|           all warnings + analyzers
|
+-- Quality Assurance (Lecture 13)
|   +-- QA = all activities to measure & improve quality
|   +-- Verification: build the system right (vs. spec)
|   +-- Validation:   build the right system (vs. requirements)
|   +-- Four QA technique families:
|       +-- Formal methods
|       +-- Static analysis
|       +-- Reviews and inspections
|       +-- Testing                 <-- focus of weeks 7-8
|       (use a mixture!)
|
+-- Testing basics (Lecture 13)
|   +-- Basic process: input -> expected -> run -> actual ->
|       compare -> pass/fail -> repeat (mostly automated)
|   +-- Goals: find faults; improve confidence (verification +
|       validation); be accurate / THOROUGH / repeatable /
|       systematic
|   +-- Dijkstra: "testing shows presence of bugs, never absence"
|   +-- Terminology (IEEE 610.12-90):
|   |   +-- Mistake  = human action
|   |   +-- Fault    = code defect      (= "bug" = "defect")
|   |   +-- Error    = wrong computed value
|   |   +-- Failure  = visible wrong output
|   |   (chain: Mistake -> Fault -> Error -> Failure)
|   +-- Who tests:
|   |   +-- Programmers (unit tests, TDD)
|   |   +-- Testers / QA staff
|   |   +-- Users: acceptance / alpha / beta / bug bounty
|   +-- Three levels (pyramid: many fast unit, few slow system):
|       +-- Unit:        a single function/class
|       +-- Integration: interfaces among units
|       +-- System:      complete system vs. requirements
|       (ToDoList example: setPriority -> editItem -> "create list")
|
+-- Test design (Lecture 14)
|   +-- Problem: input space ~ infinite, budget finite
|   |   -> pick test cases that buy max confidence
|   |   -> "sweet spot" on the confidence-vs-tests curve
|   +-- Six ways to choose test cases:
|   |   +-- 1. Intuition
|   |   +-- 2. Specification = BLACK-BOX:
|   |   |       +-- Equivalence-class partitioning
|   |   |       +-- Boundary-value analysis
|   |   +-- 3. Code = WHITE-BOX:
|   |   |       +-- Path analysis
|   |   +-- 4. Existing tests = REGRESSION TESTING
|   |   +-- 5. Faults
|   +-- Test oracles:
|   |   +-- Mechanism to decide pass/fail
|   |   +-- Hard to automate (cosine example: is 0.87758... right?)
|   |   +-- Strategies: hard-coded expected, reference impl,
|   |       algebraic identity, domain knowledge, spec, expert
|   +-- All software has bugs:
|       +-- Holzmann: "All nontrivial code has defects..."
|       +-- F-35 reliability target: 6 hours (not yet met!)
|       +-- Uber availability target: 99.99% (~1 hr/yr downtime)
|       +-- Bizarre bugs (OOo won't print on Tuesdays)
|
+-- When are we done? (Lecture 14)
|   +-- (I)   Fixed time/budget; target high-risk areas; meet
|   |         quality requirements
|   +-- (II)  Stop when find-rate stabilizes near zero
|   +-- (III) FAULT SEEDING / defect injection:
|   |         inject known artificial bugs -> measure what
|   |         fraction the test suite catches -> estimate what
|   |         fraction of REAL bugs remain. Basis of mutation
|   |         testing (PIT, Stryker, mutmut).
|   +-- (IV)  Kassab industry survey: most common exit criterion
|             in practice = "each requirement tested at least
|             once" (~65% Yes), then "all planned activities done"
|
+-- Quiz 7 prep (postponed one week)
    +-- All four IEEE terms (mistake/fault/error/failure)
    +-- Verification vs. validation
    +-- Four QA techniques
    +-- Three levels of testing + example
    +-- Dijkstra quote (memorize wording)
    +-- Black-box vs. white-box vs. regression
    +-- Test oracles (what & why hard to automate)
    +-- Fault seeding as a way to evaluate the test suite itself
    +-- "Each requirement tested at least once" as the most
        common exit criterion in industry
```

### One-sentence summary

> Quality assurance answers *"how do we know the software works?"* through a mixture of **formal methods, static analysis, reviews, and testing**; testing in particular runs the program on chosen inputs and compares actual to expected outputs across three nested levels (**unit, integration, system**), is staffed by programmers, dedicated testers, and users (**alpha, beta, bug bounties**), and uses systematic test-case design (**black-box equivalence partitioning and boundary values, white-box path analysis, regression**) plus a **test oracle** to decide pass/fail — but as **Dijkstra** reminds us, *"program testing can be used to show the presence of bugs, but never to show their absence,"* so the working definition of "done" in industry is operational: most often, **each requirement has been tested at least once**.
