# Informatics 43 — Week 1 Lecture Notes

## Table of Contents

1. [Software Is Everywhere](#1-software-is-everywhere)
2. [What Is Software Engineering?](#2-what-is-software-engineering)
3. [Three Ways to View Software Engineering](#3-three-ways-to-view-software-engineering)
4. [The Three Core Elements of Software Engineering](#4-the-three-core-elements-of-software-engineering)
5. [Software Engineering Principles](#5-software-engineering-principles)
6. [No Silver Bullet](#6-no-silver-bullet)
7. [Course Questions and Learning Outcomes](#7-course-questions-and-learning-outcomes)
8. [Wrap-Up and Memory Framework](#8-wrap-up-and-memory-framework)

---

## 1. Software Is Everywhere

The course begins with a simple but important claim: software has spread into almost every part of society, and its influence is both deep and impossible to ignore.

| Domain | Example |
|------|----------|
| **Automotive** | In a Two-Mode Hybrid transmission project, about **70% of the engineering effort** went into control software. Software has become central to modern cars. |
| **Healthcare** | Epic EHR deployments are extremely expensive: Duke University spent about **$700 million**, and the UC system spent about **$150 million**. |
| **Politics** | Studies suggest that politicians who appear higher in search results are more likely to receive votes. Software can quietly shape democratic outcomes. |
| **Military** | The Navy developed a "Pirate Predictor" algorithm that combines intelligence and environmental data to model pirate behavior. |
| **Space** | Space missions depend heavily on software-based control systems. |
| **Disaster response** | Software helps coordinate rescue, logistics, and emergency response. |
| **Games** | The video game industry earned **$43.8 billion** in 2018, driven by titles such as Fortnite and Call of Duty. |
| **Law enforcement** | Software is used for suspect tracking and location analysis. |

**Main takeaway:** software has two sides.

- It can be exciting, useful, life-saving, and empowering.
- It can also harm people.

> This raises the core course question: if software matters this much, how do we build it well? That is what software engineering tries to answer.

---

## 2. What Is Software Engineering?

### 2.1 Software is more than code

**Software** includes far more than just source code:

- Code
- Documentation and user manuals
- Designs and specifications
- Test cases
- Plans and schedules

**Engineering** means applying science and mathematics creatively to design and build things while dealing with:

- trade-offs
- risk analysis
- technical judgment
- limited time and resources

### 2.2 Comparing expert definitions

| Source | Definition emphasis |
|------|-------------|
| **Tsui, Karam, Bernal** | Software engineering is broad and includes **all aspects** of software development and support. |
| **Ghezzi, Jazayeri, Mandrioli** | It is concerned with software systems so large that they require **one or more teams of engineers**. |
| **Parnas** | The short version: **multiple people** building **multiple versions** of software. |
| **Schach** | The most complete version: produce software that is **reliable**, delivered **on time**, **within budget**, and **easy to change** as needs evolve. |

### 2.3 The INF 43 course definition

This course frames software engineering around three pillars:

1. **The process of constructing software**
2. **Phases of development other than programming**
3. **Principles and qualities of enduring value**

The second point matters a lot: requirements, design, testing, deployment, and maintenance all count. Coding is only one part of the story.

The third point includes qualities such as:

- correctness
- efficiency
- robustness

Secondary topics include project management, scheduling, business models, software's social impact, and AI.

---

## 3. Three Ways to View Software Engineering

The lecture introduces three fictional stakeholders to show that different people see the same software in different ways.

| Person | Role | Perspective | Main concern | How software engineering helps |
|------|------|----------|----------|-------------------|
| **Shawna** | CEO | **Business** | cost, profit, ROI, market opportunity | controls cost, manages delivery, creates business value |
| **Andy** | Software engineer | **Engineering** | implementation, reliability, code quality, performance | provides methods and tools for building dependable systems |
| **Clara** | Working parent | **User** | usability, interface quality, enjoyment, convenience | keeps design centered on real user needs |

Other valid perspectives include:

- the programmer's view: source code and internal design
- the electrical engineer's view: chips, power, hardware constraints
- society's view: consequences, trends, risks, impact
- the designer's view: structure and product form
- the project manager's view: teams, budget, schedule
- the professor's view: principles, models, theory
- the student's view: workload, opportunity, challenge, and fun

> The key lesson is that software engineering must balance the needs of many stakeholders at the same time.

---

## 4. The Three Core Elements of Software Engineering

**People + Processes + Tools**

This is one of the central formulas of the course.

- **People**: software is built by human beings, so skill, communication, and collaboration matter.
- **Processes**: development needs structure and repeatable workflows.
- **Tools**: IDEs, version control, test frameworks, and related tools improve productivity, but they do not replace people or process.

---

## 5. Software Engineering Principles

### 5.1 Principle summaries from different authors

**Davis (1994)** emphasizes:

- quality first
- deliver working products early
- understand the problem before solving it
- choose an appropriate process
- management matters
- people are the key to success

**Royce (1998)** emphasizes:

- an architecture-first process
- component-based development
- frequent demonstrations to customers
- incremental release

**Wasserman (1996)** emphasizes:

- modularity
- abstraction
- user-interface prototyping
- reuse
- metrics

### 5.2 INF 43 core principles

| Principle | Meaning |
|------|------|
| **Rigor and Formality** | Replace ad hoc work with disciplined, systematic methods. Use explicit representations and clear reasoning. |
| **Separation of Concerns** | Break a complex problem into smaller, manageable parts. |
| **Modularity** | Split a system into modules with clear responsibilities. |
| **Divide and Conquer** | Solve a large problem by solving smaller subproblems. |
| **Abstraction** | Hide unnecessary detail and expose only what matters. |
| **Anticipation of Change** | Design with future change in mind so software is easier to modify. |
| **Generality** | Prefer solutions that can apply more broadly instead of solving only one narrow case. |
| **Incrementality** | Build software step by step instead of trying to finish everything at once. |

---

## 6. No Silver Bullet

### 6.1 Background

- **Author**: Frederick Brooks
- **Year**: 1986
- **Status**: one of the foundational articles in software engineering
- **Main claim**: there is no single technology or method that will improve software productivity by an order of magnitude in ten years

### 6.2 The four essential properties of software

Brooks argues that software is difficult because of its **essence**, not just because of temporary or accidental obstacles.

| Essential property | Meaning | Why it matters |
|----------|------|----------|
| **Complexity** | Software is made of many interconnected concepts and relationships. | Its parts are rarely identical, so complexity grows quickly. |
| **Conformity** | Software must conform to rules, standards, institutions, and legacy systems that already exist. | Many constraints come from the outside world and cannot be redesigned away. |
| **Changeability** | Successful software will always be changed. | Users, regulations, hardware, and environments keep changing. |
| **Invisibility** | Software does not have a natural physical shape. | It is harder to visualize the full system than a physical object like a building. |

### 6.3 False silver bullets

Brooks reviews several technologies that were once treated as miracle solutions:

- high-level languages
- time-sharing
- unified programming environments
- object-oriented programming
- AI
- expert systems
- automatic or graphical programming
- program verification
- tools and environments
- workstations

His argument is not that these are useless. They help, but they mostly reduce **accidental difficulties**, not the **essential difficulties** of software.

### 6.4 Promising directions

Brooks does identify several directions that can help significantly, even if they are not true silver bullets.

| Direction | Why it helps |
|------|-------------|
| **Buy vs. Build** | Reuse good components instead of rebuilding everything yourself. |
| **Requirements refinement + rapid prototyping** | Find mistakes in requirements early, before they become expensive. |
| **Incremental development** | Reduce risk through gradual development and repeated feedback. |
| **Great designers** | The gap between great designers and average designers is enormous. Human talent matters. |

---

## 7. Course Questions and Learning Outcomes

### 7.1 The course-wide questions

| Question | Theme |
|------|----------|
| How do we know what to build? | **Requirements engineering** |
| How do we organize software structure? | **Software architecture** |
| How do we design software details? | **Design, models, and notations** |
| How do we make software meet user needs? | **User orientation** |
| How do we know whether software works correctly? | **Testing** |
| What process should we follow to develop it? | **Software process models** |

### 7.2 Learning outcomes

By the end of the course, students should be able to:

- describe core software engineering principles
- create requirement documents and use-case models
- explain software architecture and architectural styles
- create UML class diagrams
- create black-box and white-box test plans
- explain different software process models
- recognize principles and practices of good user-oriented design

---

## 8. Wrap-Up and Memory Framework

```text
Week 1 knowledge structure
|
+-- Software is everywhere
|   +-- automotive / healthcare / politics / military / space / disaster response / games / law enforcement
|   +-- software can help people
|   +-- software can harm people
|   +-- therefore: how do we build good software?
|
+-- Definitions of software engineering
|   +-- broad scope
|   +-- scale and teamwork
|   +-- multiple people, multiple versions
|   +-- quality, time, cost, maintainability
|   +-- INF 43 definition: process + non-programming phases + enduring principles
|
+-- Three perspectives
|   +-- business
|   +-- engineering
|   +-- user
|
+-- Three core elements
|   +-- people
|   +-- processes
|   +-- tools
|
+-- INF 43 principles
|   +-- rigor and formality
|   +-- separation of concerns
|   |   +-- modularity
|   |   +-- divide and conquer
|   |   +-- abstraction
|   +-- anticipation of change
|   +-- generality
|   +-- incrementality
|
+-- No Silver Bullet
    +-- no single miracle solution
    +-- essence vs. accidents
    +-- complexity / conformity / changeability / invisibility
    +-- false silver bullets
    +-- promising directions
```

### One-sentence summary

> Software engineering is not just programming. It is the combination of people, process, and tools, guided by systematic principles that help us deal with the inherent complexity, conformity, changeability, and invisibility of software while balancing many stakeholder perspectives.
