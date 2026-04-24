# Informatics 43 — Week 3 Lecture Notes

## Table of Contents

1. [Use Cases — What and Why](#1-use-cases--what-and-why)
2. [The Three Types of Flows](#2-the-three-types-of-flows)
3. [Why Use Cases (and Why Not)](#3-why-use-cases-and-why-not)
4. [Actors](#4-actors)
5. [Identifying Use Cases](#5-identifying-use-cases)
6. [Building a Use Case](#6-building-a-use-case)
7. [Use Case Examples](#7-use-case-examples)
8. [Use Case Template](#8-use-case-template)
9. [Use Case Diagrams](#9-use-case-diagrams)
10. [The Use Case Model — Bringing It All Together](#10-the-use-case-model--bringing-it-all-together)
11. [Social Impacts and Ethics](#11-social-impacts-and-ethics)
12. [ACM/IEEE Software Engineering Code of Ethics](#12-acmieee-software-engineering-code-of-ethics)
13. [Quiz 3 Study Guide](#13-quiz-3-study-guide)
14. [Wrap-Up and Memory Framework](#14-wrap-up-and-memory-framework)

---

## 1. Use Cases — What and Why

### 1.1 Definition

$$\boxed{\textbf{Use Case} = \text{a textual description of a set of actions defining interactions between an actor and the system to achieve a goal}}$$

A use case captures, in plain text, *how* a user (or other external entity) interacts with a system step-by-step in order to accomplish something meaningful. It is not code, not a UI mockup, and not a design — it is a story about behavior from the outside.

### 1.2 What a use case includes

Every use case should describe:

| Element | What it means |
|------|------|
| **Basic functionality / goal** | What the actor is trying to achieve |
| **Precondition** | What must be true *before* the use case can begin |
| **Flow of events** | The sequence of steps that occurs |
| **Postcondition** | What is true *after* the use case completes successfully |
| **Error condition / alternative flow** | What happens when things deviate from the happy path |

### 1.3 Relationship to requirements

> Use cases go **hand-in-hand with requirements**. They are not a replacement for the requirements specification document from Week 2 — they are a complementary technique that captures *behavior* in a form that is easy for both customers and developers to read and verify.

---

## 2. The Three Types of Flows

### 2.1 What a flow is

A **flow** is a sequence of steps describing an interaction between a "user" and a "system." A use case is essentially a *collection of flows* that, taken together, accomplish a specific user goal.

### 2.2 The three types of flows

| Flow type | Meaning |
|------|------|
| **Basic Flow** | The "happy day" scenario — everything works as expected and the goal is achieved |
| **Alternative Flow** | The goal is still achieved, but in an alternate way (e.g., a shortcut, a different starting point, an optional path) |
| **Exception Flow** | The goal is **not** achieved — something went wrong (invalid input, system error, missing data) |

> A use case should capture **all possible flows** — both successful and unsuccessful ones. Skipping the unhappy paths is one of the most common mistakes in writing use cases.

---

## 3. Why Use Cases (and Why Not)

### 3.1 Why use cases — strengths over other requirements methods

| Other requirements engineering methods | Use cases |
|------|------|
| May not map well to design/code | **Map well** to design and implementation constructs |
| May not translate well to acceptance tests | Make it **easy to verify/validate** a design and implementation against user goals |
| Can be difficult for non-experts to understand | **Framed in terms of user goals**, flows of events, user requests, and system responses — accessible to non-technical stakeholders |

### 3.2 Why **not** use cases — what they're bad at

Use cases are **not good for** specifying:

- **User interfaces** — use cases say *what* happens, not what the screen looks like
- **Data formats** — use cases don't define schemas, file types, or message structures
- **Business rules** — complex policies and constraints belong elsewhere
- **Non-functional requirements** — performance, security, scalability, etc. (the "ilities" from Week 2) are not captured by use cases

> **Best practice:** Produce use cases **in conjunction with** other requirements engineering methods. Use cases are one tool in the toolbox, not the entire toolbox.

---

## 4. Actors

### 4.1 What an actor is

An **actor** represents an **external** entity that interacts with the system. The "external" part is important — actors live *outside* the system boundary.

Actors can be:

- **A human** (customer, administrator, technician)
- **Hardware** (a sensor, a printer, a card reader)
- **Another software system** (a payment gateway, a third-party API, a legacy database)

### 4.2 Primary actors and dialogue

A use case is **initiated by an actor** — specifically the **primary actor** — to invoke a certain functionality in the system. The use case itself is essentially a **dialogue** between actors and the system.

In a use case diagram, an actor is drawn as a stick figure.

### 4.3 Identifying actors — useful questions (Part I)

Actors are discovered by reading system documents and by talking with customers and domain experts. Useful starter questions:

- Who **uses** the system?
- Who **installs** the system?
- Who **starts up** the system?
- Who **shuts down** the system?
- What other **devices and external systems** work directly with the system?

### 4.4 Identifying actors — additional questions (Part II)

Beyond the basics, also ask:

- Who **gets information** from this system?
- Who **provides information** to the system?
- Does anything **happen automatically** at a preset time? (a scheduler counts as an actor)
- Who is **interested in** a certain requirement?
- **Where in the organization** is the system used?
- Who will **benefit** from the use of the system?
- Who will **support and maintain** the system?
- Does the system use an **external resource**?
- Does **one person play several different roles**? (one person, multiple actors)
- Do **several people play the same role**? (many people, one actor)
- Does the system interact with a **legacy system**?

### 4.5 Practice — actors for a ToDo List App

Brainstorming actors for a ToDo List App might surface: the end user (the person managing tasks), an administrator, a calendar service (external software system), a notification service, a backup/cloud sync service, and possibly other users when tasks are shared.

---

## 5. Identifying Use Cases

Once actors are identified, derive use cases by asking:

- What **functions** will the actor want from the system?
- What are the **tasks** of each actor?
- Does the system **store information**? What actors will **create, read, update, or delete (CRUD)** that information?
- What use cases will **support and maintain** the system?
- Can **all functional requirements** be performed by the use cases? *(This is a coverage check — every functional requirement should map to at least one use case.)*

---

## 6. Building a Use Case

### 6.1 Scope guidelines

When defining the scope of a single use case:

- Describe **what**, not **how**
- Use **audience-friendly terminology** (no jargon the customer won't understand)
- Include:
  - How the use case **starts and ends**
  - The interactions (in sequence) between use case and actors
  - What **data** is needed by / exchanged during the use case
  - The **basic flow**
  - **Alternative / exception flows** (if applicable)

### 6.2 Step-by-step build process

1. **Name** the use case (a short verb phrase like "Buy a Product" or "Add Item Deadline")
2. **Describe the Basic Flow** as a numbered sequence of steps
3. **Add variations**, if applicable:
   - Alternative Flows (other ways to succeed)
   - Exception Flows (ways to fail)

---

## 7. Use Case Examples

### 7.1 Example: Buy a Product

**Basic Flow**

1. Customer browses catalog and selects items to buy
2. Customer goes to check out
3. Customer fills in shipping information
4. System presents full pricing information, including shipping
5. Customer fills in credit card information
6. System authorizes purchase
7. System confirms sale immediately
8. System sends confirmation email to customer

**Alternative Flow** — *3a. Customer is regular (repeat) customer*

1. System displays current shipping, pricing, and billing information
2. Customer may accept or override defaults, returns to BF at step 6

> Notice the numbering convention: `3a` means "an alternative branching off from step 3 of the basic flow." The alternative flow ends by returning the user to a specific step in the basic flow.

### 7.2 Example: Add Item Deadline (ToDo List App)

**Basic Flow**

1. User selects list item to which they want to add a deadline
2. System presents detailed view of list item (name, completed/not completed, description)
3. User selects the deadline field
4. System presents user with a way to enter a date and time
5. User enters date and time for deadline
6. System shows item with new deadline

**Alternative Flow** — *5a. User wants to add deadline to calendar*

1. After adding deadline, user selects an option to post to calendar
2. System posts deadline to calendar, displays a confirmation to user
3. Return to BF at step 6

**Exception Flow** — *5a. Date/time is invalid*

1. System notifies user that date/time is invalid, deadline not added to item

> This example shows all three flow types in one use case. Note that an alternative and an exception can both branch from the same step number — the labels (`5a`) are local to each flow category.

### 7.3 Example: Toggle Completed State

**Basic Flow**

1. User selects list item they wish to toggle
2. System presents detailed view of list item (name, completed/not completed, description)
3. User toggles completed state
4. System shows item with new completed state

**Alternative Flow** — *1a. User swipes left on list item*

1. System displays the option to toggle completed state
2. User confirms selection
3. Return to BF at step 4

> The alternative here is a *gesture-based shortcut* that skips the detailed view entirely and rejoins the basic flow at the final step.

---

## 8. Use Case Template

A full use case description, when written formally, includes much more than just the flows. The complete template:

| Section | What goes in it |
|------|------|
| **Name / title** | Short verb phrase identifying the use case |
| **Description** | One- to two-sentence summary of what the use case does |
| **Revision History** | Who changed what and when |
| **Actors** | All actors involved (primary and secondary) |
| **System Scope** | What system this use case belongs to |
| **Goal** | What the primary actor wants to achieve |
| **Level** | Granularity (e.g., user-goal level, sub-function level) |
| **Assumptions** | What is assumed to be true |
| **Relationships** | How this use case relates to others — `Includes` (always invokes another), `Extends` (optionally extended by another), `Extension Points` (where extensions can hook in) |
| **Precondition** | What must be true before the use case starts |
| **Trigger Events** | What kicks off the use case |
| **Basic Flow** | Numbered steps for the happy day scenario, with title |
| **Postconditions** | What is true after the basic flow completes |
| **Alternative Flows** (1, 2, 3, …) | Each with a title and step description |
| **Exception Flows** | Each with a title and step description |
| **Activity Diagram** | Optional graphical view of the flow |
| **User Interface** | Optional UI sketches |
| **Special Requirements** | Performance requirements, reports, data requirements |
| **Outstanding Issues** | Open questions still to be resolved |

> Not every use case needs every section. The template is a checklist — use what's relevant for the project.

---

## 9. Use Case Diagrams

### 9.1 What a use case diagram is

A **use case diagram** is a **graphical view** of actors, use cases, and their interactions. It complements (does *not* replace) the textual descriptions.

### 9.2 The four visual elements

| Element | Notation |
|------|------|
| **Actor** | Stick figure outside the system boundary |
| **Use case** | Oval inside the system boundary, labeled with the use case name |
| **System boundary** | Rectangle (often labeled with the system name) enclosing all use cases |
| **Association** | A line connecting an actor to a use case it participates in |

### 9.3 Example: ATM use case diagram

The ATM example shows:

- **System boundary:** a rectangle labeled "ATM"
- **Two actors:** `ATM User` (left side) and `Bank Back-end System` (right side) — note that the second actor is *another software system*, not a human
- **Three use cases inside the boundary:** `Withdraw money`, `Deposit money`, `Transfer money`
- **Lines** connecting both actors to all three use cases — both the user and the back-end system participate in each transaction

![ATM use case diagram: two actors (ATM User, Bank Back-end System) associated with three use cases (Withdraw money, Deposit money, Transfer money) inside an ATM system boundary, annotated with the four visual elements.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-3/uc-diagram-atm.png)

### 9.4 Example: Air Travel use case diagram

The Passenger Service system shows multiple actors (Check-In Representative, Passenger, Customs of Destination Airport, Baggage Transportation) interacting with use cases like Check-In, Automated Check-In, Express Check-In, Boarding, and Requesting Passenger List. The Passenger participates in most use cases; specialized actors like Customs and Baggage Transportation only connect to use cases relevant to their role.

![Air Travel use case diagram: Passenger Service system with four actors around it and five check-in / boarding use cases inside.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-3/uc-diagram-air-travel.png)

### 9.5 Example: Incident Management use case diagram

A simpler example with two actors (`FieldOfficer` and `Dispatcher`) and three use cases (`OpenIncident`, `ReportEmergency`, `AllocateResources`). The diagram makes it visually clear which actor is involved in which scenarios — for instance, the FieldOfficer reports emergencies while the Dispatcher opens incidents and allocates resources.

![Incident Management use case diagram: FieldOfficer and Dispatcher actors connected to OpenIncident, ReportEmergency, and AllocateResources use cases.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-3/uc-diagram-incident-mgmt.png)

### 9.6 Example: Library Software use case diagram

A richer example with three actors (`Patron`, `Browser`, `Staff`) and many use cases (`ReserveBookCopy`, `BorrowBookCopy`, `ExtendLoan`, `ReturnBookCopy`, `WhichBooksOnTopic?`, `CheckForReservation`, `AddBookCopy`, `RemoveBookCopy`, `UpdateCatalog`, `WhoBorrowedWhat?`). This shows how:

- Different actors have different privileges (Browser can only search; Patron can borrow/return/reserve; Staff has administrative use cases)
- Some use cases (`WhichBooksOnTopic?`) are shared across multiple actor types

![Library Software use case diagram: Patron, Browser, and Staff actors connected to ten use cases covering lending, reservations, and catalog administration.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-3/uc-diagram-library.png)

---

## 10. The Use Case Model — Bringing It All Together

There is generally **one use case model per system**, consisting of:

1. **Use case diagrams** (one or more) — the graphical view
2. **Textual descriptions** of use cases — the detailed step-by-step content

Together these form a complete picture of system behavior from the user's perspective.

![The use case model = use case diagram + textual descriptions of each use case.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-3/use-case-model.png)

### 10.1 A variety of readers

The use case model is consumed by an unusually diverse audience:

- Marketing personnel, human factors engineers, specialty engineers
- System engineers
- Reviewers
- Software developers
- System / software testers
- Project managers
- Technical writers

### 10.2 Two key roles of use cases

> 1. **Use cases serve as a unifying thread throughout development** — the same use case is referenced during design, implementation, testing, and documentation. They tie all phases together.
> 2. **Use cases serve as a communication / understanding tool among diverse stakeholders** — because they are written in plain language framed around user goals, everyone from marketing to QA to engineering can read and discuss them.

### 10.3 Connection to the INF 43 fundamental principles

The same fundamental principles from Week 1 apply to use case modeling:

- **Rigor and formality**
- **Separation of concerns** (modularity, abstraction)
- **Anticipation of change**
- **Generality**
- **Incrementality**

> These principles apply to **all aspects** of software engineering — not just code, not just requirements documents, but also use case models.

---

## 11. Social Impacts and Ethics

### 11.1 "Do cool things that matter / Don't do bad things"

Software engineers have a responsibility to **think and learn** about the social responsibility of their work. Software is not neutral — the systems we build affect real people, and decisions about *what* to build (and *how*) carry ethical weight.

Examples of software domains where ethical questions are unavoidable:

- **Social media** (mental health, misinformation, addictive design)
- **Car software** (safety, autonomous driving liability)
- **Video games** (loot boxes, screen time, representation)
- **Dating sites** (matching algorithms, user safety)
- **Employment sites** (algorithmic bias in hiring)
- **Gambling sites** (addiction, predatory mechanics)

### 11.2 Why ethics matters

Three core reasons:

1. **Software impacts society** — broadly and often in ways the designer didn't anticipate
2. **Failures cause harm** — sometimes financial, sometimes physical, sometimes psychological
3. **Engineers have responsibility** — being the ones who built it, we cannot fully outsource accountability to "the company" or "the users"

---

## 12. ACM/IEEE Software Engineering Code of Ethics

Full name: **Software Engineering Code of Ethics and Professional Practices**

### 12.1 Background

- Developed jointly by **ACM and IEEE**
- Created by a **multinational task force**
- An **approved professional standard** for the software engineering field

### 12.2 Purpose

The Code exists to:

- **Guide ethical decisions** when difficult tradeoffs arise
- **Define responsibilities** that come with being a software engineer
- **Educate professionals** on what ethical practice looks like

### 12.3 Overview of the 8 Principles

The Code is organized around eight stakeholder-oriented principles:

| # | Principle | Focus |
|---|------|------|
| 1 | **Public** | Society at large |
| 2 | **Client & Employer** | The people paying for the work |
| 3 | **Product** | The software itself |
| 4 | **Judgment** | Personal professional integrity |
| 5 | **Management** | Leadership responsibilities |
| 6 | **Profession** | The field of software engineering |
| 7 | **Colleagues** | Fellow engineers |
| 8 | **Self** | Personal growth and development |

### 12.4 Principle 1 — Public

Act consistently with the public interest. Specifically:

- Act in the public interest
- Disclose dangers to users / public
- Approve software only if safe
- Consider privacy and fairness
- Report significant risks

### 12.5 Principle 2 — Client & Employer

Act in the best interests of the client and employer, consistent with the public interest:

- Act in best interests of client / employer
- Maintain confidentiality
- Be honest about limitations
- Avoid conflicts of interest
- Do not use employer resources improperly

### 12.6 Principle 3 — Product

Ensure that products and related modifications meet the highest professional standards possible:

- Strive for high quality and reliability
- Use appropriate testing and validation
- Document properly
- Ensure maintainability
- Fix known defects before release

### 12.7 Principle 4 — Judgment

Maintain integrity and independence in professional judgment:

- Maintain integrity and independence
- Avoid deceptive practices
- Disclose conflicts of interest
- Base decisions on evidence
- Reject bribery or undue influence

### 12.8 Principle 5 — Management

(For software engineering managers and leaders.) Subscribe to and promote an ethical approach to the management of software development and maintenance:

- Promote ethical development practices
- Ensure realistic schedules
- Provide proper resources
- Support quality assurance
- Encourage reporting of concerns

### 12.9 Principle 6 — Profession

Advance the integrity and reputation of the profession consistent with the public interest:

- Advance integrity of the profession
- Follow standards and best practices
- Contribute to public understanding
- Avoid discrediting the field
- Support ethical policies

### 12.10 Principle 7 — Colleagues

Be fair to and supportive of your colleagues:

- Be fair and supportive
- Credit others' work
- Review work constructively
- Avoid discrimination
- Help colleagues develop skills

### 12.11 Principle 8 — Self

Participate in lifelong learning regarding the practice of the profession and promote an ethical approach:

- Engage in lifelong learning
- Improve technical competence
- Know limits of expertise
- Seek feedback and improvement
- Act with personal integrity

### 12.12 One-line summary of all eight principles

| Principle | One-line takeaway |
|------|------|
| **Public First** | Prioritize safety, health, privacy, and societal well-being above all else |
| **Client & Employer** | Act in their best interests — within ethical boundaries and the public good |
| **Product Quality** | Deliver software that is safe, reliable, well-tested, and maintainable |
| **Professional Judgment** | Maintain integrity, independence, and evidence-based decision-making |
| **Ethical Management** | Foster environments that support quality, transparency, and accountability |
| **Advance the Profession** | Uphold standards, contribute knowledge, and maintain public trust |
| **Respect Colleagues** | Be fair, give credit, support others, and avoid harm or discrimination |
| **Commit to Self-Improvement** | Continuously develop skills, recognize limits, and act with integrity |

---

## 13. Quiz 3 Study Guide

You should know and understand:

- **Use cases**
  - Actors (what they are, how to identify them, examples of human/hardware/software actors)
  - Flows: **basic / alternative / exception** (definitions and when each applies)
- **Use case descriptions** (the textual format — name, flows, preconditions, postconditions)
- **Use case diagrams** (system boundary, actors, use cases, associations)
- **Purposes / uses of use cases** (unifying thread; communication tool; complement to other RE methods)
- Be able to **assess basic ethical issues** based on the ACM Code of Ethics article

---

## 14. Wrap-Up and Memory Framework

```text
Week 3 knowledge structure
|
+-- Use Cases
|   +-- definition: textual description of actor-system interactions to achieve a goal
|   +-- includes: goal, precondition, flow, postcondition, error/alternative
|   +-- complement requirements (do NOT replace them)
|
+-- Flows
|   +-- basic flow: happy day
|   +-- alternative flow: goal achieved, different path
|   +-- exception flow: goal NOT achieved
|   +-- a use case must capture ALL flows (success + failure)
|
+-- Why use cases
|   +-- map well to design/code
|   +-- map well to acceptance tests
|   +-- accessible to non-experts
|   +-- BUT bad for: UI, data formats, business rules, non-functional requirements
|   +-- use alongside other RE methods, not instead of them
|
+-- Actors
|   +-- EXTERNAL entities: human, hardware, other software
|   +-- primary actor initiates the use case
|   +-- identify by asking who uses/installs/starts/shuts down the system,
|   |   who gives/gets information, scheduled events, legacy systems, etc.
|
+-- Building use cases
|   +-- what (not how), audience-friendly terminology
|   +-- name -> basic flow -> add alternative/exception flows
|   +-- examples: Buy a Product, Add Item Deadline, Toggle Completed State
|   +-- numbering convention: 3a = branch off step 3
|
+-- Use case template (formal)
|   +-- name, description, revision history, actors, scope, goal, level
|   +-- assumptions, relationships (includes/extends), precondition, triggers
|   +-- basic flow + postconditions, alternative flows, exception flows
|   +-- activity diagram, UI, special requirements, outstanding issues
|
+-- Use case diagrams
|   +-- 4 elements: actor (stick figure), use case (oval), system boundary (box), association (line)
|   +-- examples: ATM, Air Travel, Incident Management, Library Software
|
+-- Use case model = diagrams + textual descriptions
|   +-- one model per system
|   +-- unifying thread throughout development
|   +-- communication tool for diverse stakeholders
|   +-- still embodies the 7 fundamental SE principles
|
+-- Social impacts & ethics
|   +-- software impacts society, failures cause harm, engineers responsible
|   +-- "Do cool things that matter / Don't do bad things"
|
+-- ACM/IEEE Code of Ethics (8 principles)
    +-- Public         -> safety, privacy, fairness, disclose risks
    +-- Client/Employer-> best interests, confidentiality, no conflicts
    +-- Product        -> quality, testing, documentation, maintainability
    +-- Judgment       -> integrity, evidence-based, no bribery
    +-- Management     -> realistic schedules, resources, QA, reporting
    +-- Profession     -> standards, public understanding, reputation
    +-- Colleagues     -> fairness, credit, no discrimination
    +-- Self           -> lifelong learning, know your limits, integrity
```

### One-sentence summary

> Use cases are textual narratives — anchored by actors, basic/alternative/exception flows, and visualized in use case diagrams — that serve as both a unifying thread through development and a shared language across diverse stakeholders; meanwhile, the ACM/IEEE Code of Ethics reminds us that software engineering is a profession with stakeholder obligations across eight dimensions (Public, Client, Product, Judgment, Management, Profession, Colleagues, Self) — and the public always comes first.
