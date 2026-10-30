---
title: "Software Process and Life Cycle Models"
summary: "From testing to process: why software engineering needs a defined process, what a model is, and the eight life cycle models (build-and-fix, waterfall, rapid prototyping, incremental, spiral, RUP, XP, Agile/Scrum) — including the fourteen XP practices, the Agile Manifesto and its principles, Ziv's Law, a side-by-side comparison of all models, and the Quiz 9 / final exam study guide."
---

# Informatics 43 — Week 9 Lecture Notes

> Covers **Lecture 17 & Lecture 18**: *"What process do we follow to develop the software? (Parts 1 & 2)"*

## Table of Contents

1. [Where We Are — From Testing to Process](#1-where-we-are--from-testing-to-process)
2. [Why We Need Processes — The Difficulties of Software Engineering](#2-why-we-need-processes--the-difficulties-of-software-engineering)
3. [What Is a Model, and What Is It For?](#3-what-is-a-model-and-what-is-it-for)
4. [The Software Life Cycle Models — The Catalog](#4-the-software-life-cycle-models--the-catalog)
5. [Build-and-Fix](#5-build-and-fix)
6. [Waterfall](#6-waterfall)
7. [Rapid Prototyping](#7-rapid-prototyping)
8. [Incremental](#8-incremental)
9. [Spiral](#9-spiral)
10. [Rational Unified Process (RUP)](#10-rational-unified-process-rup)
11. [Extreme Programming (XP)](#11-extreme-programming-xp)
12. [The Fourteen XP Practices](#12-the-fourteen-xp-practices)
13. [From XP to Agile — The Agile Manifesto](#13-from-xp-to-agile--the-agile-manifesto)
14. [Agile Principles, Ziv's Law, and Scrum](#14-agile-principles-zivs-law-and-scrum)
15. [Agile — Strengths, Weaknesses, and Adoption](#15-agile--strengths-weaknesses-and-adoption)
16. [The Big Picture — Comparing All Eight Models](#16-the-big-picture--comparing-all-eight-models)
17. [Quiz 9 / Final Exam Study Guide](#17-quiz-9--final-exam-study-guide)
18. [Wrap-Up and Memory Framework](#18-wrap-up-and-memory-framework)

---

## 1. Where We Are — From Testing to Process

Weeks 7 and 8 lived inside a single activity: **quality assurance and testing**. The previous lecture closed out white-box testing — using **program graphs derived from source code** to derive test cases, choosing those cases to hit different types of coverage (**node, edge, loop, condition, path**), and surveying the other QA approaches (**inspections/reviews, formal methods, static analysis**).

Week 9 zooms all the way out. We stop asking *how do we do one activity well* and start asking how the whole effort is **organized**:

$$\boxed{\textbf{What process do we follow to develop the software?}}$$

The full arc of the course is now complete, and process models are the meta-layer that orchestrates everything beneath them:

$$\boxed{\textbf{Requirements} \to \textbf{Architecture} \to \textbf{Design} \to \textbf{UCD} \to \textbf{Code} \to \textbf{QA \& Testing} \;\Rightarrow\; \textbf{Process Models}}$$

Two lectures cover the territory. **Lecture 17 (Part 1)** motivates *why* we need processes (software engineering is intrinsically hard), defines what a process *model* is, and walks through the first five models — **build-and-fix, waterfall, rapid prototyping, incremental, spiral** — and introduces RUP. **Lecture 18 (Part 2)** drills into **RUP**, then **Extreme Programming (XP)** and **Agile**, and frames the whole unit around a historical shift: *from rigid, heavyweight, document-driven processes to lightweight, agile ones.*

---

## 2. Why We Need Processes — The Difficulties of Software Engineering

The starting premise is blunt: **software engineering is hard, and we need processes to help.** The lecture grounds this in the classic argument from Fred Brooks's essay **"No Silver Bullet"** — software has a set of *essential* qualities (essential difficulties) that no tool or trick can wish away.

| Essential difficulty | Why it makes SE hard |
|------|------|
| **Complexity** | Software is among the most complex artifacts humans build; no two parts are alike, and complexity grows *faster than linearly* with size. There is no simplifying physics to fall back on |
| **Conformity** | Software must conform to a mass of arbitrary external interfaces, institutions, and prior systems that it cannot redesign — much of its complexity is imposed, not chosen |
| **Changeability** | Software is under constant pressure to change, *because* it is malleable and embodies the system's function. The thing everyone wants modified is always the software |
| **Invisibility** | Software has no natural geometric or spatial representation. You cannot "see" it the way you see a bridge or a circuit board, which makes it hard to reason about and communicate |

On top of these four, the lecture adds a fifth motivator: software can have **potentially drastic or disastrous consequences** (the failure case studies from Week 7 — Boeing 737 Max, Therac-style hazards, Y2K — are the backdrop here).

**Processes as a remedy.** Because the difficulties are essential, the response is *discipline*, not a magic tool. Software is engineered via a **defined process**, which exists to:

- make sure we **do the right things**, **do things right**, and **do not forget anything**;
- and to be *fitted to the situation* — **different processes** suit different kinds of software, companies, and situations.

> ⚠️ Brooks's punchline is a likely quiz/exam point: a process is **not a silver bullet** [Brooks, *"No Silver Bullet"*]. Brooks argued that no single development — in technology *or* management — would by itself produce an order-of-magnitude improvement in software productivity, reliability, or simplicity within a decade. Processes help us manage the essential difficulties; they do not eliminate them.

---

## 3. What Is a Model, and What Is It For?

The lecture first disambiguates the word "model," because it carries two everyday meanings:

| Sense of "model" | Example | Relevant here? |
|------|------|------|
| **Model = Ideal** | A fashion model; "a model student" — something held up as the standard to imitate | ❌ Not this sense |
| **Model = Simplified Representation** | A scale-model car; an **architecture model** (Layered, Client-Server, Model-View-Controller); a **software process model** (Waterfall, Rapid Prototyping, Spiral) | ✅ This is the sense we use |

So a **software process model** is a *simplified representation* of how software development proceeds — it abstracts away detail to capture the high-level shape of the work.

$$\boxed{\textbf{A software life cycle model is a high-level process.}}$$

**What is a process model *for*?** It can play two roles, and the same model can do both:

| Role | Meaning |
|------|------|
| **Prescriptive** | *Enforcing rules* — telling the team what they *should* do and in what order |
| **Descriptive** | *Serving to describe or characterize* — capturing what a team *actually* does, so it can be studied and improved |

> The prescriptive/descriptive distinction is worth keeping straight: a process model on a whiteboard that dictates "requirements before design before code" is being used *prescriptively*; a researcher who watches how a real team works and draws the resulting flow is using a model *descriptively*. Most real models are used both ways.

---

## 4. The Software Life Cycle Models — The Catalog

The course covers **eight** life cycle models. Listed roughly in historical order, they also trace a broad arc from heavyweight/rigid to lightweight/agile:

| # | Model | One-line character |
|---|------|------|
| 1 | **Build-and-fix** | No real process — code first, patch forever |
| 2 | **Waterfall** | Strict sequential phases, document-heavy |
| 3 | **Rapid prototyping** | Throwaway prototype to pin down requirements first |
| 4 | **Incremental** | Build and deliver the system in pieces |
| 5 | **Spiral** | Risk-driven; do the riskiest parts first |
| 6 | **Rational Unified Process (RUP)** | Heavyweight, use-case-driven, iterative |
| 7 | **Extreme Programming (XP)** | Lightweight, feedback-driven reaction to heavyweight processes |
| 8 | **Agile** | Umbrella philosophy that XP, Scrum, Kanban, etc. belong to |

> The lecture's organizing storyline (made explicit in the Lecture 18 summary) is a **shift over time**: from *rigid, heavyweight, document-driven* processes (waterfall, RUP) toward *lightweight, agile* ones (XP, Scrum, Agile). Build-and-fix sits before the arc even starts — it is the *absence* of process that everything else is reacting against.

---

## 5. Build-and-Fix

**Build-and-fix** is the degenerate case: there is no requirements phase, no design phase, no plan. You just write code and keep patching it.

**The lifecycle:**

$$\text{Build first version} \to \text{Modify until client is satisfied} \to \text{Operations mode} \to \text{Retirement}$$

The slide diagram draws the loop with two kinds of arrows: solid arrows for **development** and dotted arrows for **maintenance** (the "modify until client is satisfied" box loops back on itself, and maintenance arrows feed from operations back into modification).

![Lecture's Build-and-Fix lifecycle diagram. Four orange boxes connected by arrows step diagonally down-right: "Build first version" leads to "Modify until client is satisfied" (which loops back on itself via a solid black self-arrow), then on to "Operations mode" and finally "Retirement." A legend at lower-left distinguishes solid black arrows for Development from dotted teal arrows for Maintenance; a dotted teal maintenance arrow runs from Operations mode back up into the "Modify until client is satisfied" box, showing there is no requirements or design phase — you just code and keep patching.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/build-and-fix-lifecycle.png)

| Strengths | Weaknesses |
|------|------|
| Good for **small programs** that do not require much maintenance or many developers | **Not rigorous enough** for non-trivial projects — no spec, no design, no documentation, no plan |

> Build-and-fix is the baseline against which every other model is an improvement. Its single virtue — that you start coding immediately — is also why it collapses on anything large: with no requirements and no design, complexity, changeability, and the need to coordinate many developers have nowhere to be managed.

---

## 6. Waterfall

The **waterfall** model imposes a strict, ordered sequence of phases. Each phase is fully completed (and documented) before the next begins, like water flowing down a series of steps.

**The phases:**

$$\text{Requirements} \to \text{Design} \to \text{Implementation} \to \text{Integration} \to \text{Testing} \to \text{Operations mode} \to \text{Retirement}$$

In the slide diagram, solid (development) arrows step strictly downward through the phases, while dotted (maintenance) arrows run back upward — and a **"Changed requirements"** box feeds back into the phases to represent maintenance after the system is operational.

![Lecture's Waterfall lifecycle diagram. Seven orange phase boxes cascade strictly down a staircase from upper-left to lower-right: Requirements phase → Design phase → Implementation phase → Integration phase → Testing phase → Operations mode → Retirement, each linked by solid black development arrows that only ever step downward. A separate "Changed requirements" box at the top right, plus a set of dotted teal maintenance arrows running back up the right side and into each earlier phase, represent maintenance after the system is operational. The legend at lower-left labels solid arrows Development and dotted arrows Maintenance, capturing waterfall's strict, document-heavy, one-direction-at-a-time flow.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/waterfall-lifecycle.png)

| Strengths | Weaknesses |
|------|------|
| Promotes **understanding of requirements first** | **Rigid**, not amenable to change |
| **Disciplined, rigorous, formal** | **Limited user input** |
| Produces **lots of documentation** | **Bad** for projects with *any* ambiguity in requirements or technology |
| Good for projects with **well-understood requirements unlikely to change** | Often **run out of time for testing** (testing is last, so schedule slips eat into it) |
| **Provided a starting point** for other software process models | Real-world failure: **Healthcare.gov** |

> ⚠️ Memorable quote (likely exam material) — Clay Shirky, on the Healthcare.gov rollout (2013): *"The waterfall model amounts to a pledge by all parties not to learn anything while doing the actual work."* The criticism is that waterfall freezes all the learning into the requirements phase up front, and forbids the team from adapting once they discover — as they always do — that the plan was wrong.

---

## 7. Rapid Prototyping

**Rapid prototyping** addresses waterfall's "limited user input" weakness. Instead of locking down requirements on paper first, you **build and discard a simple prototype** — a quick, throwaway version whose only job is to elicit and validate what the users actually want. Once it has done that job, you throw it away and develop the real system.

**The lifecycle:**

$$\text{Build and discard simple prototype} \to \text{Design} \to \text{Implementation} \to \text{Integration} \to \text{Testing} \to \text{Operations mode} \to \text{Retirement}$$

The "build and discard simple prototype" box replaces the requirements phase at the head of an otherwise waterfall-like flow; the rest of the diagram uses the same development/maintenance arrows and "Changed requirements" feedback.

![Lecture's Rapid Prototyping lifecycle diagram. It mirrors the waterfall staircase, but the head box is highlighted in red — "Build and discard simple prototype" — replacing the requirements phase, and is followed by Design phase → Implementation phase → Integration phase → Testing phase → Operations mode → Retirement, with the same solid development arrows stepping down and dotted teal maintenance arrows (plus a "Changed requirements" box) feeding back up. On the left sit the two justifying quotes — Humphrey's Law ("People don't know what they want until they see what they don't want.") and Steve Jobs ("People don't know what they want until you show it to them.") — alongside the Development / Maintenance legend.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/rapid-prototyping-lifecycle.png)

The two quotes on the slide capture *why* prototyping works:

> *"People don't know what they want until you show it to them."* — **Steve Jobs**
>
> *"People don't know what they want until they see what they don't want."* — **Humphrey's Law**

> The key word is **discard**. The prototype is a *learning device*, not the first version of the product. Building it cheaply and being willing to throw it away is what lets the team surface hidden or misunderstood requirements before committing to a full, expensive build.

---

## 8. Incremental

The **incremental** model delivers the system in **pieces (increments)** rather than all at once. You do the requirements and high-level architecture once, then repeatedly build, test, and ship one increment at a time.

**The lifecycle:**

$$\text{Requirements} \to \text{Architectural design} \to \underbrace{[\text{detailed design} \to \text{implement} \to \text{integrate} \to \text{test} \to \text{deliver}]}_{\textbf{FOR EACH INCREMENT}} \to \text{Operations mode} \to \text{Retirement}$$

The central "FOR EACH INCREMENT" box reads: *Perform detailed design, implementation, and integration. Test. Deliver to client.* A second slide visualizes this as a descending staircase of analysis → design → implementation → testing → deployment → maintenance, each staircase producing **Release 1, Release 2, Release 3, … Release n**.

![Lecture's Incremental lifecycle diagram. "Requirements phase" leads to "Architectural design" (both done once), which feeds into a large red "FOR EACH INCREMENT" box reading "Perform detailed design, implementation, and integration. Test. Deliver to client." A solid development arrow loops back on this box to show the per-increment repetition, before flowing to "Operations mode" and "Retirement," with dotted teal maintenance arrows feeding back to the requirements/architecture phases. The Development / Maintenance legend sits at lower-left — emphasizing that requirements and high-level architecture are fixed up front while the build-test-deliver inner loop repeats once per increment.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/incremental-lifecycle.png)

![A second "Incremental Model" slide visualizing increments as overlapping mini-waterfalls. A tall "Requirements" box at the upper-left fans out into a cascade of dark blue staircases, each running Analysis → Design → Implementation → Testing → Deployment → Maintenance and terminating in a gold "Release" box — the staggered staircases produce Release1, Release2, Release3, …, Release n in turn, with a green arrow looping back from Release3 to "Release n." It drives home that the system is delivered in working pieces over successive releases rather than all at once. (Source: testingfreak.com, credited on the slide.)](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/incremental-staircase-releases.png)

**Case study — Microsoft evolves its process:**

| Era | Approach |
|------|------|
| **Before (Windows 8 and earlier)** | The **"Ta-da" approach** — develop in secret, then unveil a finished release in one big reveal |
| **After (Windows 10)** | **Iterative**, driven by **user feedback** (the lecture even asks: *too much?*), and using **A/B testing** to compare alternatives on real users |

> Incremental is the first model where the client sees *working software early and often*. That early feedback is its big advantage — and it is the same instinct that XP and Agile push to its limit a few models later.

---

## 9. Spiral

The **spiral** model (Boehm) is **risk-driven**. Development proceeds in loops around a spiral; at the start of each loop you do **risk analysis**, and the steps taken in that loop are **variable, depending on what the risk analysis found** (a loop might be a rapid prototype, or a specification, or a design, or an implementation — then a "verify" step). The riskiest, most uncertain parts are tackled **first**.

The slide diagram shows a spiral of expanding loops, each beginning with **Risk analysis** and ending with **Verify**, with the inner activities labeled *Rapid prototype? / Specification? / Design? / Implementation?* — the question marks emphasizing that *which* activity happens is decided by the risk analysis, not fixed in advance.

![Lecture's Spiral model diagram (Boehm). A red-and-white spiral of four expanding loops winds outward from the center; each loop is annotated "Risk analysis" near the top and "Verify" along the bottom, so every pass through the spiral begins with risk analysis and ends with verification. A green hand-drawn oval encircles the column of inner-activity labels — "Rapid prototype?", "Specification?", "Design?", "Implementation?" — each ending in a question mark, and a red arrow points to it with the caption "Variable steps, depending on risk analysis," underscoring that which activity a given loop performs is chosen by the risk analysis rather than fixed in advance.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/spiral-model.png)

**Boehm's Top 10 software risks (the six shown), with management techniques:**

| Risk | Risk management technique |
|------|------|
| Personnel shortfalls | Staff with top talent, job matching, morale building |
| Unrealistic schedules and budgets | Detailed cost/schedule estimation, reuse, incremental development |
| Developing the wrong software functions | User surveys, prototyping |
| Continuing stream of software changes | Information hiding, incremental development |
| Shortfalls in externally furnished components | Compatibility analysis |
| Shortfalls in externally performed tasks | Reference checking, competitive design or prototyping |

*(Adapted from Hans Schaefer's "Software Risk Management: A Calculated Gamble.")*

| Strengths | Weaknesses |
|------|------|
| Good for **new projects with uncertain, complex requirements** | Developers have to be **competent at risk analysis** |
| The **riskiest parts get developed first** (failures surface early, when they're cheapest to fix) | The **"end of project" may not be known** — the spiral can keep going |

> The spiral's defining move is **front-loading risk**. Waterfall does the easy, well-understood requirements work first and discovers the hard problems late; the spiral deliberately attacks the scary, uncertain parts first so a doomed project fails early rather than after years of investment.

---

## 10. Rational Unified Process (RUP)

**RUP** is a heavyweight, highly-structured iterative process defined by three characteristics:

- **Use case driven** — development is organized around use cases (what users want to accomplish).
- **Architecture centric** — the system architecture is a central, first-class artifact.
- **Iterative and incremental** — built in repeated iterations, each adding increments of capability.

**The RUP model is a 2-D structure** (the famous "humps" diagram):

| Axis | Contents |
|------|------|
| **Phases** (horizontal / time) | **Inception → Elaboration → Construction → Transition** |
| **Process workflows** (vertical) | Business Modeling, Requirements, Analysis & Design, Implementation, Test, Deployment |
| **Supporting workflows** (vertical) | Configuration Management, (Project) Management, Environment |

Two captions on the diagram state the core idea:

- **"Workflows group activities logically"** — each workflow is a coherent kind of work (e.g., everything to do with requirements).
- **"In an iteration, you walk through all workflows"** — within a single iteration you touch *every* workflow, but the *amount* of effort in each shifts across the phases (the colored "humps" are tall for Requirements early on, tall for Implementation in the middle, tall for Deployment near the end).

![The canonical "RUP Model" humps diagram. The horizontal axis lists the four Phases (Inception, Elaboration, Construction, Transition) subdivided into iterations (Preliminary Iteration(s), Iter. #1, #2, #n, … #m+1); the vertical axis lists the six Process Workflows (Business Modeling, Requirements, Analysis & Design, Implementation, Test, Deployment) and three Supporting Workflows (Configuration Mgmt, Management, Environment). Each workflow has a red filled "hump" curve showing how much effort it consumes over time — Requirements and Analysis are tall early, Implementation peaks in the middle, Deployment swells near the end. A teal vertical box highlights a single iteration cutting through every row (annotated "In an iteration, you walk through all workflows"), and a callout notes "Workflows group activities logically."](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/rup-humps-workflows.png)

The lecture also shows three detailed RUP **workflows** as examples of how much guidance RUP provides: **Architectural Analysis**, **Analysis & Design**, and **Use Case Analysis** (each is its own elaborate diagram of roles, activities, and artifacts).

| Strengths | Weaknesses |
|------|------|
| **Risk-driven, incremental** | **Heavyweight (very!)** |
| **Lots of tool support** | **Complicated** — needs special expertise to implement |
| **Provides a lot of guidance** (detailed workflows, roles, artifacts) | |

> RUP is the high-water mark of the *heavyweight* tradition: enormous, prescriptive, tool-supported, and thorough. Its strengths (guidance, tooling) and its weaknesses (heavyweight, complicated) are two sides of the same coin — and the heaviness of processes like RUP is exactly what XP and Agile were created to revolt against.

---

## 11. Extreme Programming (XP)

**XP** (Kent Beck) is a deliberately *"extreme"* reaction against waterfall and other heavyweight/traditional processes. The lecture lists the problems with those traditional processes that XP is reacting to:

- **Lengthy development times**
- **Inability to cope with changing requirements**
- **Assumption that requirements are completely understood before the project begins**
- **Too much reliance on heroic development effort**
- **Complex methodology**
- **Waste / duplication of effort**

(The slide literally crosses these out with a giant red **X** to signal: XP rejects all of this.)

![Lecture's "Extreme Programming (XP)" slide. Under the heading "More 'extreme' reaction to waterfall and other heavyweight/traditional processes, which usually have:" a bulleted list of their problems — lengthy development times, inability to cope with changing requirements, the assumption that requirements are completely understood before the project begins, too much reliance on heroic development effort, complex methodology, and waste/duplication of effort — is struck through by one enormous red X drawn across the whole list, visually declaring that XP rejects all of these traits.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/xp-rejects-heavyweight.png)

**XP process steps:**

1. **Determine the desired features** (as user *stories*).
2. **Estimate, prioritize, refine** those stories.
3. **Implement / deliver each task** — typically using **test-driven development** and **pair programming**.
4. **Follow the XP values and principles** throughout (see §12).

> The spirit of XP: take the things that traditional processes treat as occasional or end-of-project activities — testing, integration, design review, customer feedback — and do them **all the time, in tiny increments**. "Extreme" means dialing every good practice up to maximum frequency.

---

## 12. The Fourteen XP Practices

XP is defined by a set of mutually reinforcing **practices and principles**:

| # | Practice | What it means |
|---|------|------|
| 1 | **Whole team** | Customer, developers, and everyone needed sit and work together as one team |
| 2 | **Small releases** | Ship small, frequent, working increments rather than one big delivery |
| 3 | **Customer tests** | The customer specifies acceptance tests that define when a feature is "done" |
| 4 | **Simple design** | Build the simplest thing that works; no speculative generality |
| 5 | **Pair programming** | Two developers at one keyboard — continuous, real-time code review |
| 6 | **Test-driven development (TDD)** | Write the test *before* the code (see the red-green-refactor cycle below) |
| 7 | **Design improvement** | Continuously *refactor* — improve the design without changing behavior |
| 8 | **Continuous integration** | Integrate and test changes constantly, not in a big merge at the end |
| 9 | **Collective code ownership** | Anyone may change any code; no private silos |
| 10 | **Coding standards** | Shared conventions so all the code looks like one author wrote it |
| 11 | **Sustainable pace / developer welfare** | No death marches; avoid burnout (the slide crosses out an exhausted, slumped developer) |
| 12 | **Open space** | A shared physical workspace that promotes communication |
| 13 | **Shared understanding** | Everyone holds the same mental model (the "I'm glad we all agree… oh… ah-ha!" cartoon) |
| 14 | **Rapid, fine feedback** | Feedback loops at every timescale, from seconds to months |

**The TDD cycle** (red-green-refactor):

$$\text{Add test} \to \text{See test fail (red)} \to \text{Write code} \to \text{Run tests (green)} \to \text{Refactor} \to (\text{repeat})$$

![Lecture's Test-Driven Development cycle diagram: six colored circles arranged in a ring with arrows flowing clockwise — "Add Tests" → "See Tests Fail" → "Write Code" → "Run Tests" → "Refactor" → "Run Tests" — and the words "Test-Driven Development" labeled in the center. It depicts the red-green-refactor loop: you write the test first, watch it fail, write just enough code to pass, then refactor, repeating continuously.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/tdd-red-green-refactor.png)

**XP's nested feedback loops** run at every timescale at once:

$$\text{Release Plan (months)} \to \text{Iteration Plan (weeks)} \to \text{Acceptance Test (days)} \to \text{Stand-Up Meeting (one day)} \to \text{Pair Negotiation (hours)} \to \text{Unit Test (minutes)} \to \text{Pair Programming (seconds)} \to \text{Code}$$

![The "Extreme Programming Planning/Feedback Loops" diagram (J. Donovan Wells). A vertical column of colored boxes runs top to bottom — Release Plan, Iteration Plan, Acceptance Test, Stand Up Meeting, Pair Negotiation, Unit Test, Pair Programming, Code — each labeled at the right with its timescale (months, weeks, days, one day, hours, minutes, seconds). Red arrows on the right cascade downward through the boxes, while a fan of red arrows on the left loops each lower, faster activity back up to a higher, slower one, illustrating that XP runs nested feedback loops simultaneously at every timescale from seconds (pair programming) to months (release planning).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/xp-feedback-loops.png)

> For the exam you do **not** need to memorize all fourteen. Know that XP is a *bundle* of lightweight practices, and be able to name the headline ones — **pair programming, test-driven development, small releases, continuous integration, simple design** — and explain how they reinforce the XP goal of frequent, low-risk, feedback-rich delivery.

---

## 13. From XP to Agile — The Agile Manifesto

**Agile** is the broader philosophy that XP helped launch. It *includes and evolved from* **Extreme Programming, Scrum, Crystal, Kanban, and others.**

Its founding document is **The Agile Manifesto (2001)**, framed as *"We have come to value…"* a set of four trade-offs:

| We value this more… | …over this (still valued, just less) |
|------|------|
| **Individuals and interactions** | Processes and tools |
| **Working software** | Comprehensive documentation |
| **Customer collaboration** | Contract negotiation |
| **Responding to change** | Following a plan |

> ⚠️ The four value statements are prime exam material. The crucial nuance: the manifesto says the items on the **left are valued more**, but *"while there is value in the items on the right."* Agile does not say documentation or plans are worthless — it says that when they conflict with working software and responsiveness, the left wins.

---

## 14. Agile Principles, Ziv's Law, and Scrum

**Some Agile principles** (the lecture's selection):

- **Welcome change in requirements** — even late in development.
- **Business people and developers work together daily** throughout the project.
- **Build projects around motivated individuals** — trust them to get the job done.
- **Face-to-face conversation is the best way to convey information.**
- **Documentation is just a means to an end** — not the goal.
- **Continuous delivery** of working software.

**Ziv's Law** — the theoretical justification for the agile stance:

$$\boxed{\textbf{Software development is unpredictable, and documented artifacts such as requirements will never be fully understood.}}$$

> Ziv's Law says **uncertainty is inherent and inevitable** in software engineering processes and products. This is the direct rebuttal to waterfall's core assumption (that requirements can be completely understood up front): if uncertainty can never be eliminated, then a process that *embraces change* will beat one that tries to *freeze* the plan.

**Scrum** — the most popular agile *framework*. The lecture introduces it via a short "Scrum in 10 minutes" video rather than deep slides, but the vocabulary it covers is worth knowing:

| Scrum element | Role |
|------|------|
| **Product backlog** | The full, prioritized list of everything the product might need |
| **Release backlog** | The subset targeted for an upcoming release |
| **Sprints** | Short, fixed-length development cycles |
| **Team roles** | E.g., Product Owner, Scrum Master, Development Team |
| **Daily standups** | Brief daily synchronization meetings |
| **Burndown charts** | Track remaining work over a sprint |
| **Retrospectives** | Post-sprint reflection to improve the process |
| **Estimations** | Sizing the work (e.g., story points) |

> Note for the exam: Scrum got a *video*, not a detailed lecture — so the expectation is recognition of the vocabulary and that Scrum is an agile framework, not a deep walkthrough of the ceremonies.

---

## 15. Agile — Strengths, Weaknesses, and Adoption

| Strengths | Weaknesses |
|------|------|
| **Customer (and developer) satisfaction** | **Lack of documentation** |
| **Adaptable to changing circumstances** | **Unstable requirements** |
| Good for projects with **unclear, changing requirements** | **Technical debt** |
| Good for **small teams** | Original agile ideas are **not ideal** for projects with **large teams**, **safety-critical requirements**, or where **customer involvement is not possible** |

**Industry adoption** (two surveys shown side by side):

![The lecture's industry-adoption slide showing two surveys side by side. On the left, a horizontal bar chart from the Stack Overflow Developer Survey 2018 ("Which methodologies do developers use?") with Agile by far the longest bar, followed by Scrum, then much shorter bars for Kanban, pair programming, Extreme Programming, the formal "waterfall" standard, Lean, and others. On the right, a pie chart from Kassab et al. (IEEE Software, 2017) showing the single methodology that best described each project: Scrum dominates at 39.29%, with Waterfall model 11.90%, Spiral 7.14%, Prototyping 5.95%, feature-driven 4.76%, Extreme Programming 3.57%, and Unified Process (RUP) just 1.19%. Together the two charts show agile and Scrum dominating practice while heavyweight, document-driven processes have shrunk to a minority.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-9/agile-adoption-surveys.png)

*Stack Overflow Developer Survey 2018 — "Which methodologies do developers use?" (select all that apply, 58,981 responses):*

| Methodology | % of respondents |
|------|------|
| **Agile** | 85.4% |
| **Scrum** | 62.7% |
| **Kanban** | 35.2% |
| **Pair programming** | 28.4% |
| **Extreme Programming (XP)** | 15.7% |
| Formal standard (ISO 9001 / IEEE 12207, "waterfall") | 15.1% |
| Lean | 9.6% |

*Kassab et al., "Software Testing: The State of the Practice," IEEE Software, 2017 — the single methodology that best described each project:*

| Methodology | Share |
|------|------|
| **Scrum** | 39.29% |
| **Waterfall model** | 11.90% |
| **Spiral model** | 7.14% |
| Prototyping | 5.95% |
| Feature-driven development | 4.76% |
| Extreme Programming | 3.57% |
| V-model | 2.38% |
| Lean software development | 2.38% |
| Unified Process (RUP) | 1.19% |
| (None / Unknown / Other) | 7.14% each |

> The data tells the whole story of the unit: **agile and Scrum dominate practice**, while the heavyweight, document-driven processes (waterfall, RUP/Unified Process) have shrunk to a small minority. This is the empirical evidence behind the "shift from heavyweight to lightweight" arc.

---

## 16. The Big Picture — Comparing All Eight Models

| Model | Core idea | Iterative? | Best for | Key weakness | Weight |
|------|------|------|------|------|------|
| **Build-and-fix** | Code, then patch — no process | Loop, but unplanned | Tiny, throwaway programs | Not rigorous; collapses on non-trivial projects | None |
| **Waterfall** | Strict sequential phases, document-heavy | No | Well-understood, stable requirements | Rigid; bad with ambiguity; testing squeezed | Heavy |
| **Rapid prototyping** | Throwaway prototype to learn requirements | Prototype, then waterfall-like | Unclear requirements; need user input | Prototype can be mistaken for the product | Medium |
| **Incremental** | Deliver the system in pieces (releases) | Yes (per increment) | Projects that benefit from early, partial delivery | Architecture must be set up front | Medium |
| **Spiral** | Risk-driven; riskiest parts first | Yes (per loop) | New projects with uncertain, complex requirements | Needs risk-analysis expertise; fuzzy "end" | Medium–heavy |
| **RUP** | Use-case-driven, architecture-centric, iterative | Yes | Large projects needing structure + tooling | Heavyweight; complicated; needs expertise | Very heavy |
| **XP** | Lightweight bundle of feedback-rich practices | Yes (continuous) | Small teams; changing requirements | Light on docs; not for large/safety-critical | Light |
| **Agile** | Umbrella philosophy (XP, Scrum, Kanban…) | Yes (continuous) | Small teams; unclear/changing requirements | Docs, unstable reqs, technical debt; not for large/safety-critical | Light |

$$\boxed{\textbf{The historical arc: rigid, heavyweight, document-driven (waterfall, RUP)} \;\longrightarrow\; \textbf{lightweight, agile (XP, Scrum, Agile).}}$$

---

## 17. Quiz 9 / Final Exam Study Guide

This was the **last content unit** of the course — the next session is the course wrap-up, final exam review, and an ungraded mini practice quiz. Everything below is fair game.

### 17.1 Vocabulary you must be able to define

| Term | One-sentence definition |
|------|------|
| **Software life cycle model** | A high-level (simplified-representation) process for developing software |
| **Prescriptive model** | A model used to *enforce rules* about what to do |
| **Descriptive model** | A model used to *describe or characterize* what is actually done |
| **Build-and-fix** | Code a first version, then modify until the client is satisfied — no spec, no design |
| **Waterfall** | Strict sequential phases (requirements → design → implementation → integration → testing → operations → retirement), documentation-heavy |
| **Rapid prototyping** | Build and *discard* a simple prototype to pin down requirements before real development |
| **Incremental** | Do requirements + architecture once, then build and deliver the system in increments |
| **Spiral** | Risk-driven; each loop starts with risk analysis; riskiest parts developed first |
| **RUP** | Heavyweight process that is use-case driven, architecture-centric, iterative and incremental |
| **Extreme Programming (XP)** | Lightweight, feedback-rich process built from practices like TDD and pair programming |
| **Agile** | Umbrella philosophy (XP, Scrum, Kanban, Crystal…) defined by the Agile Manifesto |
| **Scrum** | The most popular agile framework — sprints, backlogs, standups, retrospectives |

### 17.2 The four essential difficulties (Brooks)

**Complexity, Conformity, Changeability, Invisibility** — why software engineering is intrinsically hard. Plus: *processes are not a silver bullet* (Brooks).

### 17.3 The eight models, in order

Build-and-fix → Waterfall → Rapid prototyping → Incremental → Spiral → RUP → XP → Agile. Be able to give each one's **core idea, one strength, and one weakness**, and to match a model to a scenario (e.g., *uncertain complex requirements* → spiral or prototyping; *stable well-understood requirements* → waterfall; *small team, changing requirements* → agile/XP; *safety-critical, large team* → **not** plain agile).

### 17.4 The quotes (memorize the wording)

| Quote | Source | Point |
|------|------|------|
| *"No silver bullet"* | **Brooks** | No single advance gives an order-of-magnitude SE improvement in a decade |
| *"The waterfall model amounts to a pledge by all parties not to learn anything while doing the actual work."* | **Clay Shirky** (Healthcare.gov) | Waterfall forbids adapting to what you learn |
| *"People don't know what they want until you show it to them."* | **Steve Jobs** | Justifies prototyping |
| *"People don't know what they want until they see what they don't want."* | **Humphrey's Law** | Justifies prototyping |
| *Software development is unpredictable; uncertainty is inherent and inevitable* | **Ziv's Law** | Justifies agile / embracing change |

### 17.5 RUP specifics

Three characteristics (**use-case driven, architecture-centric, iterative and incremental**); the **four phases** (Inception, Elaboration, Construction, Transition); the idea that *in one iteration you walk through all workflows*; strengths (guidance, tooling, risk-driven) vs. weaknesses (heavyweight, complicated).

### 17.6 XP and Agile specifics

XP is a *reaction* to heavyweight processes; know the headline **practices** (pair programming, TDD, small releases, continuous integration, simple design) and the **TDD red-green-refactor** cycle. Know the **four Agile Manifesto values** (and the nuance that the right-hand items still have value), a few **agile principles**, and that Scrum is the most popular agile framework.

### 17.7 The big arc + the data

Be able to state the **shift from heavyweight/document-driven to lightweight/agile**, and cite the survey evidence (**Agile ~85%, Scrum the most common single methodology; waterfall/RUP now a minority**).

---

## 18. Wrap-Up and Memory Framework

```text
Week 9 knowledge structure
|
+-- The question this week
|   +-- "What process do we follow to develop the software?"
|   +-- A software life cycle model = a HIGH-LEVEL process
|       (model = simplified representation, not "ideal")
|   +-- Used PRESCRIPTIVELY (enforce rules) or DESCRIPTIVELY (characterize)
|
+-- Why we need processes (Lecture 17)
|   +-- SE is hard -- Brooks's essential difficulties:
|   |     Complexity, Conformity, Changeability, Invisibility
|   |     (+ potentially disastrous consequences)
|   +-- Process = do the right things / do them right / forget nothing
|   +-- NOT a silver bullet  [Brooks, "No Silver Bullet"]
|
+-- The five "classic" models (Lecture 17)
|   +-- Build-and-fix : code -> patch; tiny programs only
|   +-- Waterfall     : Req->Design->Impl->Integration->Test->Ops->Retire
|   |                   rigorous + documented; rigid; bad w/ ambiguity
|   |                   (Healthcare.gov; Shirky quote)
|   +-- Rapid prototyping : build & DISCARD prototype to learn reqs
|   |                       (Jobs; Humphrey's Law)
|   +-- Incremental   : deliver in pieces (Release 1..n)
|   |                   (MS: Win8 "Ta-da" -> Win10 iterative + A/B)
|   +-- Spiral        : RISK-DRIVEN; riskiest parts first; variable steps
|                       (Boehm's top-10 risks); end may not be known
|
+-- Heavyweight peak (Lecture 17->18)
|   +-- RUP : use-case driven + architecture-centric + iterative/incremental
|             4 phases: Inception, Elaboration, Construction, Transition
|             workflows x iterations ("humps")
|             strong: guidance/tooling | weak: HEAVYWEIGHT, complicated
|
+-- The lightweight revolt (Lecture 18)
|   +-- XP : extreme reaction to heavyweight processes
|   |        14 practices (pair programming, TDD, small releases,
|   |        continuous integration, simple design, ...)
|   |        steps: stories -> estimate/prioritize -> deliver -> values
|   +-- Agile : umbrella (XP, Scrum, Crystal, Kanban, ...)
|   |   +-- Manifesto (2001): individuals>process, working sw>docs,
|   |   |   collaboration>contracts, responding>plan (left valued MORE)
|   |   +-- Ziv's Law: uncertainty is inherent & inevitable
|   |   +-- Scrum: sprints, backlogs, standups, burndown, retrospectives
|   +-- Strengths: satisfaction, adaptable, good small teams
|       Weaknesses: few docs, unstable reqs, tech debt;
|       not for large / safety-critical / no-customer projects
|
+-- The big arc + data
    +-- SHIFT: rigid/heavyweight/document-driven -> lightweight/agile
    +-- Surveys: Agile ~85% (SO 2018); Scrum #1 single method (Kassab 2017);
        waterfall + RUP now a minority
```

### One-sentence summary

> Because software engineering is intrinsically hard (Brooks's **complexity, conformity, changeability, invisibility**) and **no process is a silver bullet**, teams adopt a **software life cycle model** — a high-level process used prescriptively or descriptively — and these have evolved along a clear arc from **rigid, heavyweight, document-driven** approaches (**build-and-fix → waterfall → rapid prototyping → incremental → spiral → RUP**) toward **lightweight, feedback-driven, change-embracing** ones (**XP → Agile/Scrum**), a shift now confirmed in practice by surveys where **agile and Scrum dominate** and waterfall and RUP have become the minority.
