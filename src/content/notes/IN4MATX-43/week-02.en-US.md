---
title: "Requirements Engineering"
summary: "Software failures, why requirements matter, requirements analysis and specification, the requirements document, specification methods, and Ziv's Law."
---

# Informatics 43 — Week 2 Lecture Notes

## Table of Contents

1. [Software Failures](#1-software-failures)
2. [Why Requirements Matter](#2-why-requirements-matter)
3. [Requirements Engineering](#3-requirements-engineering)
4. [Requirements Specification Document](#4-requirements-specification-document)
5. [Specification Methods and Verification](#5-specification-methods-and-verification)
6. [Ziv's Law](#6-zivs-law)
7. [Wrap-Up and Memory Framework](#7-wrap-up-and-memory-framework)

---

## 1. Software Failures

### 1.1 The real problems behind failure

The failure readings identify several root causes for why software projects go wrong: complexity, conformity (having to integrate with existing human systems), difficulty measuring progress, the burden of "legacy" systems, and "Hubble Psychology" (overconfidence or groupthink that prevents teams from seeing problems).

**Hubble Psychology** — named after the Hubble Space Telescope — refers to the belief that if you keep pouring money into a failing project, it will eventually work out. The Hubble telescope was seen as a huge failure during development (Congress invested millions and NASA kept asking for more), but it eventually became a success. Other examples: Amazon was losing more than it was making for years before turning around. However, most projects with this mindset simply fail — like the California DMV modernization project that spent **$134 million** before the entire project was thrown away. Over-optimism is dangerous; software failures should be expected, and planning for them is essential.

### 1.2 Case study: Minnesota licensing system

Minnesota's license and registration system failed because the team never clearly defined roles or what the software should be. The project went massively over budget, with plans being revised again and again. HP was contracted to do the work but eventually stepped away from the project. This is a classic case of requirements issues combined with bad management — the team simply did not know what they were building.

### 1.3 Case study: TSB Banking

TSB, a UK bank, attempted to migrate from one infrastructure to another. On the day of the switch, customers could not log in or withdraw money. Those who could log in found their balances were wrong — some had no money, some had extra money, and some could even access other people's accounts. This is one of the most dramatic examples of what can go wrong during a software migration.

### 1.4 Case study: Shopa

Shopa was a British startup that shut down largely because the company never figured out what product to build. Internal teams had no shared understanding of the product direction, leading to conflict between engineering and sales. This is a textbook example of what happens when requirements are absent or unclear.

![Shopa closure announcement screenshot with the diagnosis quote: "The company … is still trying to figure out what product to build … no one knows inside the company what they are building."](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-2/shopa-failure.jpg)

### 1.5 Industry statistics

| Statistic | Source |
|------|--------|
| Only **50%** of IT projects deliver on budget and on time; cost overruns on average **double** the budget; **34%** delivered late | Jurgen Laartz |
| Only **29%** of projects considered successful; **52%** "challenged"; **19%** failed; billions wasted per year | 2015 CHAOS reports |
| The **most reported cause** of discovered defects was requirements problems (omissions, changes, or errors) | Kassab, DeFranco, LaPlante (IEEE SW 2017) |

### 1.6 Top software failure causes

The top causes of software project failure are:

1. **Lack of user input/involvement** — the most frequently cited problem
2. **Incomplete requirements and specifications** — requirements issues
3. **Changing requirements and specifications** — requirements issues
4. **Lack of discipline in development processes** — lack of rigor/formality
5. **Lack of methodical usage of metrics** — lack of rigor/formality
6. **Lack of resources**

> The first three are all **requirements issues**. The middle two reflect a **lack of rigor and formality** — one of the INF 43 core principles from Week 1.

---

## 2. Why Requirements Matter

### 2.1 Definition

$$\boxed{\textbf{Requirements} = \text{what the software should do (without saying how it should do it)}}$$

An important distinction: requirements address what a customer **needs**, not what a customer **wants**.

> **The "faster horse" analogy:** A customer says they want a faster horse. Why? Because they need faster transportation. The best solution turns out to be building a car — something the customer never asked for, but exactly what they needed. Always dig deeper to find the real need behind the stated want.

### 2.2 Evidence for their importance

Poor requirements are the single most common reason projects stumble or fail. According to CHAOS reports, requirements defects account for more than **70%** of rework costs, and rework itself consumes about **30–50%** of the total project budget. Lack of user input and involvement is consistently listed as the most frequent problem.

![Kassab et al. (IEEE SW 2017) bar chart of reported defect causes across 98 projects — "Requirements problems (omissions, changes, or errors)" is the single most reported cause, above design, testing, and coding problems.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-2/kassab-defect-causes.jpg)

### 2.3 Software life cycle costs

The vast majority of software cost comes after the initial build:

| Phase | Share of total cost |
|------|-----|
| Analysis | 2% |
| Specification | 5% |
| Design | 6% |
| Module Coding | 5% |
| Module Testing | 7% |
| Integration | 8% |
| **Maintenance** | **67%** |

![Software life cycle costs pie chart: Maintenance dominates at 67% of total cost; Analysis through Integration together account for only 33%.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-2/lifecycle-costs.png)

### 2.4 Cost of change grows over time

Changes are cheapest during analysis and specification. The cost increases dramatically as you move into design, implementation, integration, and especially maintenance. This is why investing time in requirements up front saves enormous cost later.

![Cost-of-change bar chart: relative cost stays near zero through Analysis, Specification, and Design, rises modestly at Implementation and Integration, and spikes to roughly 200× by Maintenance.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-2/cost-of-change.png)

### 2.5 Which category employs the most programmers in the US?

**A. In-house staff writing systems for internal use.** Most programmers do not work at game companies or on consumer apps — they build internal business systems.

---

## 3. Requirements Engineering

### 3.1 The requirements phase in the waterfall model

In the waterfall model, the requirements phase is the very first stage. It is split into two sub-activities:

| Sub-activity | What it means |
|------|------|
| **Requirements analysis** | The activity of discovering, observing, and gathering customer needs |
| **Requirements specification** | The activity of describing and documenting customer needs; also refers to the resulting document |

The expanded waterfall shows: Requirements Analysis → Requirements Specification → Design → Implementation → Verification → Maintenance.

![Waterfall model diagram with Requirements analysis and Requirements specification split into the first two stages, flowing into Design, Implementation, Verification, and Maintenance.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-2/waterfall.png)

### 3.2 Techniques for requirements analysis

There are many ways to discover what a system should do:

- **Interview the customer** — ask directly
- **Observe the customer** — watch how they actually work
- **Create use cases / scenarios / user stories** — describe interactions step by step
- **Prototype solutions** — build something quick to get feedback
- **Identify important objects, roles, functions, goals**
- **Perform research** — study the domain
- **Construct models** — create abstract representations
- **Data-driven analysis** — use analytics, A/B testing, prototyping, and market research to evaluate potential features

### 3.3 The todo list app example

The lecture walks through a "build me a todo list app" scenario to show how vague requirements evolve into precise ones. The first version has only six basic requirements. The improved version adds ordering, character limits, undo for delete, usability targets (complete tasks within 5 minutes without training), calendar integration, and social sharing.

Good requirements should be: **complete**, **unambiguous**, **non-conflicting**, and **verifiable**.

---

## 4. Requirements Specification Document

### 4.1 Purpose

The requirements specification serves as the **fundamental reference point** between the customer and the software producer. It defines the "what" (not the "how"), environmental constraints, software constraints, and software qualities.

It is worth spending significant time on this document because it is the source for all future steps in the software life cycle, and changes are cheaper now than later.

### 4.2 Users of a requirements document

Many different stakeholders read this document: customers, developers, managers, testers, documenters, maintainers, system engineers, software architects, marketing personnel, and others.

### 4.3 Document structure

| Section | What goes in it |
|------|------|
| **Introduction** | What the document is about, who created it, who it is for, outline |
| **Executive summary** | Short (≤1 page) description of main goals, key features, key risks/obstacles |
| **Application context** | The usage situation (home, office, etc.) and all things the system affects (objects, processes, other software, hardware, people) |
| **Environmental requirements** | Platforms (hardware: OS, memory, disk; software: web/mobile/desktop, open source vs enterprise), programming languages, standards |
| **Functional requirements** | All concepts, functions, features, and information the system provides to users. What should the system do? What info does it need? What happens when something goes wrong? |
| **Software qualities (non-functional requirements)** | The "ilities": correctness, reliability, efficiency, usability, maintainability, portability, reusability, interoperability, robustness, security, scalability, etc. Helps developers assess implementation tradeoffs. |
| **Other requirements** | Cost, documentation, manuals, tutorials, training, and anything that doesn't fit elsewhere |
| **Time schedule** | Delivery dates (initial, acceptance period, final), milestones (prototype, design complete, sprints) |
| **Potential risks** | Future uncertain events that could cause loss: new methodology, unfamiliar requirements, resource shortage, aggressive schedule, tight funding, security, ethical issues |
| **Assumptions** | Factors believed true during the project lifecycle (end-user characteristics, technology infrastructure, resource/funding availability). If they change, project outcomes may suffer. |
| **Future changes** | Anticipated changes; structure the document to absorb them (define concepts once, partition concerns, avoid redundancy) |
| **Glossary** | Precise definitions of terms used throughout the document |
| **Reference documents** | Pointers to existing processes/tools, similar software, literature |
| **User interface** | An approximate UI is normally included |
| **Acceptance test plan** | Specifies how each requirement will be verified; binds the customer to accept the system if it passes all tests |

### 4.4 Connection to INF 43 principles

The requirements document itself is structured to reflect the fundamental SE principles: rigor, separation of concerns (modularity, abstraction), anticipation of change, generality, and incrementality. Not every project requires every section.

---

## 5. Specification Methods and Verification

### 5.1 Specification methods

| Method | Examples |
|------|------|
| Natural language | SRS, user stories |
| Diagrams | Data flow diagrams, finite state machines, Petri nets |
| Formal language | Z, TLA+ |
| Models | Domain model (objects), usage model (use cases), goal model |

### 5.2 Verification checklist

When verifying a requirements specification, ask:

- Is it **complete**?
- Is each requirement **understandable**?
- Is each requirement **unambiguous**?
- Are any requirements **in conflict**?
- Can each requirement be **verified**?
- Are all terms and concepts **defined**?
- Is the specification **unbiased**?

---

## 6. Ziv's Law

**Ziv's Law** states that software development is unpredictable and documented artifacts such as requirements will never be fully understood. Uncertainty is inherent and inevitable in software engineering processes and products.

> This does not mean requirements are useless — it means we should expect imperfection and plan for change, which connects directly to the principle of **anticipation of change**.

---

## 7. Wrap-Up and Memory Framework

```text
Week 2 knowledge structure
|
+-- Software failures
|   +-- root causes: complexity, conformity, progress measurement, legacy, hubris
|   +-- Hubble Psychology: over-optimism (Amazon, CA DMV $134M waste)
|   +-- case studies: Minnesota (undefined roles), TSB (migration disaster), Shopa (no product direction)
|   +-- stats: 29% success rate, 34% late, cost overruns double budget
|   +-- top failure causes → mostly requirements issues + lack of rigor
|
+-- Why requirements matter
|   +-- definition: what (not how); needs (not wants)
|   +-- "faster horse" analogy: dig for real needs behind stated wants
|   +-- 70%+ of rework costs from requirements defects
|   +-- cost of change grows exponentially over project phases
|   +-- maintenance = 67% of total life cycle cost
|
+-- Requirements engineering
|   +-- analysis: discover/observe/gather customer needs
|   +-- specification: describe/document customer needs
|   +-- analysis techniques: interview, observe, use cases, prototypes, data-driven
|   +-- good requirements: complete, unambiguous, non-conflicting, verifiable
|
+-- Requirements specification document
|   +-- purpose: fundamental reference between customer and producer
|   +-- sections: introduction, executive summary, application context,
|   |   environmental requirements, functional requirements, software qualities,
|   |   other requirements, time schedule, risks, assumptions, future changes,
|   |   glossary, references, UI, acceptance test plan
|   +-- structured according to INF 43 principles
|
+-- Specification methods
|   +-- natural language, diagrams, formal language, models
|   +-- verification: complete, unambiguous, non-conflicting, verifiable, defined, unbiased
|
+-- Ziv's Law
    +-- uncertainty is inherent and inevitable in SE
    +-- requirements will never be fully understood
    +-- plan for change
```

### One-sentence summary

> Requirements engineering — the systematic analysis and specification of what software should do — is the most critical phase of development because requirements defects are the top cause of project failure, the most expensive to fix later, and the document structure itself must embody the same SE principles (rigor, separation of concerns, anticipation of change) that govern the entire discipline.
