# Informatics 43 — Week 4 Lecture Notes

## Table of Contents

1. [From Requirements to Structure — Why We Need Architecture](#1-from-requirements-to-structure--why-we-need-architecture)
2. [The Architect — An Analogy (and Its Limits)](#2-the-architect--an-analogy-and-its-limits)
3. [Defining Software Architecture](#3-defining-software-architecture)
4. [Architecture in Action — Worked Examples](#4-architecture-in-action--worked-examples)
5. [Elements of Software Architecture](#5-elements-of-software-architecture)
6. [Prescriptive vs. Descriptive Architecture](#6-prescriptive-vs-descriptive-architecture)
7. [Architectural Erosion](#7-architectural-erosion)
8. [Architectural Styles — Definition](#8-architectural-styles--definition)
9. [The Six Architectural Styles](#9-the-six-architectural-styles)
10. [Mixing Styles](#10-mixing-styles)
11. [Evolution and Architecture](#11-evolution-and-architecture)
12. [Connection to the Fundamental Principles](#12-connection-to-the-fundamental-principles)
13. [Quiz 4 Study Guide](#13-quiz-4-study-guide)
14. [Wrap-Up and Memory Framework](#14-wrap-up-and-memory-framework)

---

## 1. From Requirements to Structure — Why We Need Architecture

### 1.1 The gap between requirements and code

After Weeks 2–3 we have a requirements specification and a set of use cases. The natural next question is: *now what?* Given the same set of requirements, there are **many possible ways** to structure the resulting system — different arrangements of modules, different divisions of responsibility, different communication patterns. Architecture is the discipline of making those structural decisions deliberately.

The progression is:

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture \& Design} \;\longrightarrow\; \textbf{Code}}$$

Architecture sits in the middle — it is **not** the requirements (which say *what* the system must do), and it is **not** the code (which says exactly *how* every detail is implemented). It is the high-level structure that bridges the two.

### 1.2 Why architecture matters in software engineering

Architecture is valuable for five concrete reasons:

| Benefit | What it means |
|------|------|
| **Intellectual control** | Keeps a large, complex system understandable by humans |
| **Conceptual integrity** | Ensures the system has a coherent "story" rather than being a patchwork of styles |
| **Effective project communication** | Gives teams a shared vocabulary and shared diagrams to reason about the system |
| **Reusability** | Well-structured components can be reused across systems or variants |
| **Maintainability** | Helps manage a family of variant systems and supports long-term evolution |

---

## 2. The Architect — An Analogy (and Its Limits)

### 2.1 What a (building) architect does

Software architecture borrows its name from building architecture, and the analogy is genuinely useful. A building architect:

- Plays a **distinctive role** in a project, separate from the construction workers
- Has **broad training**, **extensive experience**, and **deep domain understanding**
- **Leads the team**, **communicates well**, and is a **decision maker**
- Works at a **higher level of abstraction** than those performing the actual construction
- Often serves as the **interface to key business stakeholders/customers**

A software architect plays a parallel role in a software project.

### 2.2 Where the analogy breaks down

The analogy is a helpful starting point but should not be pushed too far — software is genuinely different from buildings:

- Software serves a **much broader range of purposes** than buildings do
- We know **much more about buildings than software** (centuries vs. decades)
- Software is **far more malleable** than physical materials — changing a building after construction is enormously expensive; changing software is comparatively cheap
- **Software is a machine**, not a static structure — it has runtime behavior
- **Software is invisible** — you cannot see it, walk through it, or inspect it the way you can a building

> Keep the analogy as intuition, but remember: software architecture has to grapple with behavior, change, and invisibility in a way that building architecture does not.

---

## 3. Defining Software Architecture

### 3.1 The primary definition

$$\boxed{\textbf{Software architecture} = \text{the set of } \textit{principal design decisions} \text{ about the system}}$$

The word **"principal"** is doing a lot of work here. Not every design decision is architectural — only the ones that are fundamental enough to shape the system overall. These principal decisions cover:

| Aspect | What it addresses |
|------|------|
| **Structure** | How the system is divided into parts |
| **Behavior** | How those parts act over time |
| **Interaction** | How the parts communicate with each other |
| **Non-functional properties** | Performance, scalability, security, reliability, etc. |

### 3.2 Architecture as blueprint

A second, complementary definition:

> **Software architecture is the blueprint for a software system's construction and evolution.**

The word "evolution" matters as much as "construction" — architecture is not just about getting the system built; it is about setting the system up to change gracefully over time.

### 3.3 Other useful definitions

Several well-known authors have offered their own framings, and each highlights something different:

| Source | Definition | What it emphasizes |
|------|------|------|
| **Clements, Bass, Kazman** | "The set of structures needed to reason about the system, which comprise software elements, relations among them, and properties of both." | Reasoning / analysis |
| **Spinellis** | "How your whole system … will be decomposed into processes or services; how data are stored, communicated, and processed; and how all parts fit together to deliver the required functionality, reliability, capacity, scalability, maintainability, and portability." | Decomposition and non-functional properties |
| **Fowler** | "The highest-level breakdown of a system into its parts; the decisions that are hard to change." | What is *hard to change* |
| **Natarén** | "The clear definition of multiple high-level components that, when working together, form your system and solve your problem." | High-level components working together |

> All four definitions circle the same idea from different angles: architecture = the important, high-level, hard-to-change decisions that shape the system.

---

## 4. Architecture in Action — Worked Examples

### 4.1 Example: Email

Email has a short functional spec:

- Send and receive messages
- Get your own messages, not others'
- Addressing scheme
- Store messages
- Electronic
- Blocks spam

At the architectural level, email is commonly structured as **client ↔ client** communication (mediated by servers under the hood). The architecture captures the high-level interaction pattern, not the implementation details of each mail program.

### 4.2 Example: The World Wide Web (REST)

The Web can be described in multiple ways — several diagrams and narratives can all be valid descriptions of the same architecture. The key properties of the Web's architecture (also known as the **REST reference architecture**) are:

- The Web is a collection of **resources**, each with a unique name (**URL**)
- A URL can be used to determine the identity of a machine on the Internet (the **origin server**), from which the resource may be obtained
- **Clients** (user agents / Web browsers) make requests of servers for their resources
- Clients manipulate **representations** of resources (not the resources themselves)
- All communication between user agents and origin servers must be performed by a **simple, generic protocol (HTTP)**
- All communication must be **fully self-contained** (stateless)

**Three important observations about the Web's architecture:**

1. **There is no single piece of code that implements the architecture** — it is a property of the whole system, not of any one file or program
2. **The stylistic constraints are not apparent in the code** — you cannot read any one HTTP server's source and see "REST" stamped on it
3. **The Web is one of the world's most successful applications**, and it can only be **understood adequately from an architectural vantage point**

> This example is crucial: it shows that architecture is a way of thinking about a system that exists *above* any particular codebase. The diagrams, constraints, and protocol rules *are* the architecture.

### 4.3 Example: Facebook

Facebook illustrates how many requirements — both functional and non-functional — drive architectural decisions.

**Functional requirements include:** friend lists, status updates, news feed, comments / likes / reactions, messaging, photos, location services, 3rd-party apps, and many more.

**Non-functional requirements include:**

- Efficiency / performance
- Scalability
- Availability
- Security
- Privacy
- Reliability
- Portability

> Architecture has to satisfy both sets simultaneously. A structure that delivers the functional behavior but fails on scalability or availability is not an acceptable architecture for Facebook.

### 4.4 Example: Client-Server

The most common distributed-system architecture. Its defining features:

- **Clients make requests** of servers
- **Centralized** control over data, security, and access

Client-server shows up everywhere precisely because centralization simplifies a lot of concerns (especially security and data consistency). It is covered in more detail as one of the six architectural styles in Section 9.

---

## 5. Elements of Software Architecture

A software architecture is built from **three kinds of building blocks**:

| Element | Meaning |
|------|------|
| **Components** | The parts that do the work (modules, services, processes, etc.) |
| **Connectors** | The mechanisms by which components communicate (calls, pipes, message queues, networks, events, …) |
| **Configurations** | The specific way components and connectors are **arranged** — topology |

> The trio *components + connectors + configurations* is the vocabulary that every architectural style below uses. When you read "pipe-and-filter" or "publish-subscribe," each style is essentially a named recipe describing *which* components, *which* connectors, and *which* configurations to use.

---

## 6. Prescriptive vs. Descriptive Architecture

### 6.1 Two perspectives on the same system

Every real system effectively has two architectures:

| Perspective | What it is | Also called |
|------|------|------|
| **Prescriptive architecture** | The architecture as **intended** by the designers | as-designed, as-intended |
| **Descriptive architecture** | The architecture as actually **realized** in the code that runs | as-implemented, as-realized |

### 6.2 Why they diverge

For simple / young systems the two may match. For large, long-lived systems (examples discussed in class: **Linux**, **iRODS**, **HADOOP**), the prescriptive and descriptive architectures can differ dramatically. The prescriptive diagram is clean and modular; the descriptive diagram reveals shortcuts, hacks, and dependencies that were never intended.

---

## 7. Architectural Erosion

### 7.1 What erosion is

$$\boxed{\textbf{Architectural erosion} = \text{when a system's actual (descriptive) architecture drifts away from its intended (prescriptive) architecture}}$$

The ideal process is: **when the system evolves, modify the prescriptive architecture first**, then update the implementation to match. In practice, the **system — and thus the descriptive architecture — is often modified directly**, with no corresponding update to the prescriptive architecture. Over time the gap widens.

### 7.2 Why it happens

Erosion is rarely caused by a single factor. Common contributors:

- **Developer sloppiness** — taking a shortcut and not documenting it
- **Short deadlines** — the prescriptive update gets skipped "just this once" (and then never)
- **Lack of (documented) prescriptive architecture** — if the intended design was never written down, developers cannot violate it in any meaningful sense
- **Code optimizations** — performance fixes that cut across module boundaries
- **Inadequate techniques or tool support** — no automated way to check whether the code conforms to the design

> Architectural erosion is a maintenance problem as much as a design problem. Avoiding it requires deliberate effort: documenting the prescriptive architecture, keeping it current, and checking conformance.

---

## 8. Architectural Styles — Definition

### 8.1 What an architectural style is

An **architectural style** is:

- A **named collection of architectural design decisions** that
  - are applicable in a given development context,
  - **constrain** architectural design decisions, and
  - result in **beneficial qualities** in each resulting system.
- Equivalently: a **named, commonly used set of components / connectors / configurations**, where **each component/connector has its own job**.

### 8.2 Why styles are useful

A style is essentially a proven recipe. When you adopt a style, you inherit its benefits (modularity, scalability, etc.) but also its constraints (you have to play by its rules). The remainder of Lecture 8 covers six widely-used styles, each with a motivating example and a list of benefits.

---

## 9. The Six Architectural Styles

The course discusses six architectural styles. These are **not an exhaustive list** — many others exist — but they are the six you are responsible for knowing.

### 9.1 Model-View-Controller (MVC)

**Example: ATM**

Goals for an ATM include withdrawals, deposits, transfers, and balance checks, *and* a clear separation of concerns:

- The team wants to **experiment with different UIs**
- The team wants to **isolate business rules**, since those change frequently

The MVC structure separates the system into three parts:

| Part | Responsibility | ATM mapping |
|------|------|------|
| **Model** | Holds the data and business rules | Bank account, business rules |
| **View** | Presents information to the user | ATM display |
| **Controller** | Handles user input and coordinates model/view | Input handler |

**Key benefits:** **Modularity**, **Anticipation of Change** (you can swap views without touching the model, and change business rules without touching the UI).

> **MVC is particularly aimed at UI concerns.** In practice, when people talk about "the controller" in MVC, they almost always mean *UI-driven* control (handling button clicks, form submissions, etc.). The reason the pattern exists is that mixing data, rendering, and UI logic in one place produces code that is very hard to change — changing a color, a metric, or a business rule becomes a cross-cutting edit. MVC separates those concerns precisely so each can change independently.

![MVC mapped onto an ATM: the ATM display (view), a rules component (controller), and the bank account (model) connected by arrows showing who talks to whom.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/mvc-atm.png)

---

### 9.2 Client-Server

**Example: Online multi-player video game**

Goals:

- Multi-player, online
- Control access to data and players

Structure: **one game server** with **many game clients** (game client 1, game client 2, game client 3, …). Clients make requests; the server holds centralized state.

**Key benefits:**

- **Sharing data and services** over a wide range of clients
- **Centralized control** over access, functionality, and data

**Main drawback:** the central server is a **single point of load and failure** — one server can easily be **overwhelmed** as the number of clients grows, and if it goes down, all clients lose service. Scaling client-server systems (replicating servers, load balancing, caching) is largely a response to this weakness.

**Cloud computing has changed client-server.** Most modern client-server applications run on servers in the cloud:

| Before cloud | With cloud |
|------|------|
| Software developers had to manage physical servers | Servers managed by a third party (started by **AWS**) |
| Single data center, hard to scale | Cloud providers also provide application services |

Benefits of cloud: **scalability**, **more computing power**, potentially **cost-effective**.
Drawbacks: **security/privacy** concerns, and it **may not be cost-effective** at all scales.

![Client-server for an online multiplayer game: three game clients each send requests to a single centralized game server.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/client-server-game.png)

---

### 9.3 Layered

**Example: Restaurant**

Goals:

- Prepare and serve food to customers
- Enforce a specific protocol of interaction
- Abstract away irrelevant details
- Minimize the effects of changes
- **Separate concerns**: keep each part focused on a specific task

Structure: the system is divided into **layers**, each layer communicating only with the layers immediately above and below it. A real-world example is **Android**, which is organized as a stack of layers (kernel, libraries, application framework, applications).

**Key benefits:** **Modularity**, **Abstraction**, **Anticipation of Change**, **Reuse**.

> **The lowest layer is generally the most reusable.** The Android example makes this concrete: the **Linux kernel** sits at the bottom, and it is reused not just by Android but by most servers on the internet. The higher up you go, the more application-specific things become; the lower you go, the more general and reusable the layer is. This is why re-skinning an app (swapping the top UI layer) is cheap, but swapping the kernel is almost unthinkable.

> A restaurant works because the waiter doesn't cook, the cook doesn't take orders from customers, and the customer doesn't go into the kitchen. Each layer has a defined interface with the layers it contacts.

![Android as a layered architecture: Applications on top, then Application Framework, then Libraries and Android Runtime, with the Linux Kernel at the bottom.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/layered-android.jpg)

---

### 9.4 Peer-to-Peer (P2P)

**Example: Skype**

Goals:

- Online (multi-person) video chat and voice calls
- Share the same functionality between multiple people **without slowing down video/audio streaming**

Structure: peers (skype 1, skype 2, skype 3) talk **directly to each other** — there is no centralized server mediating every call. Every peer plays essentially the same role.

**Key benefits:** **Efficient** (no central bottleneck), **Robust** (no single point of failure — if one peer drops out, the rest of the system keeps going).

**Other real-world examples:** **BitTorrent**, **Bitcoin**, and in a broad sense **the internet itself** — all share the P2P property that no single node is essential.

> **In practice, "pure" P2P is rare.** Most deployed P2P systems still have a small client-server component for things the peers can't do well on their own — e.g., Skype needs a central directory to look up which IP address corresponds to which username, and BitTorrent traditionally used trackers for the same reason. The *bulk traffic* (video, audio, files) goes peer-to-peer, but a thin coordination layer is usually centralized.

![Peer-to-peer topology for Skype: three peers (skype 1, skype 2, skype 3) communicating directly with each other — no central server mediates the calls.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/p2p-skype.png)

---

### 9.5 Pipe-and-Filter

**Example: Compiler**

Goals:

- Translate a high-level programming language into a low-level one the computer can execute
- Separate different steps of translation so you can **add / edit / remove / replace** steps easily

Structure: a **filter** is a component that reads an input stream and produces an output stream. A **pipe** is a connector that carries the stream from one filter to the next.

For a compiler:

```
scanner --> stream (tokens) --> parser --> stream (parse trees) --> translator
   ^filter        ^pipe         ^filter         ^pipe              ^filter
```

The classic Unix-shell example:

```
ls -l | grep "Aug" | sort
```

Each command is a filter; each `|` is a pipe. Output of one filter becomes input of the next.

**Key benefits:** **Modularity**, **Reuse**, **Anticipation of Change** (you can insert, remove, or rearrange filters without touching the others).

![Pipe-and-filter for the Unix `ls -l | grep "Aug" | sort` pipeline: three filter components (print records, filter "Aug" records, sort) separated by stream connectors (pipes).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/pipe-filter-unix.png)

---

### 9.6 Publish-Subscribe ("Pub-Sub")

**Example: Stock market ticker**

Goals:

- Filter through enormous amounts of info (stock prices) and **only broadcast info that a subscriber is interested in**

Structure: a **subscription manager** sits between the data source (the stock market) and the **subscribers** (trader 1, trader 2, trader 3). Subscribers register their interests; the manager routes only relevant events to each.

**Key benefits:** **Efficiency** (subscribers aren't flooded with data they don't want), **Scalability** (adding subscribers doesn't require changing publishers).

![Publish-subscribe for a stock-market ticker: the stock market publishes to a subscription manager (connector), which routes only relevant events to trader 1, trader 2, and trader 3.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/pub-sub-stock.png)

---

## 10. Mixing Styles

Real systems rarely fit neatly into a single style — mixing is often necessary. For example, a stock-market-ticker system can combine pub-sub (for pushing prices to traders) *with* a client-server substructure (a stock market server, a subscription manager, and a stock database shared among components), plus a purchasing-rules component wired in on the side.

> When you see a real architecture diagram, expect a **combination** of styles. "This system uses pub-sub *and* client-server *and* layered" is a normal, healthy description — not a sign of confused design.

---

## 11. Evolution and Architecture

### 11.1 Evolution is inevitable

> **All successful software evolves.** Evolution is an essential part of software development and must be accommodated / planned for as much as possible.

**Architecture is a key tool in accommodating evolution.** The prescriptive/descriptive framing from Section 6, the style choices from Section 9, and the fundamental principles below all exist largely to make future evolution cheaper.

### 11.2 The Web as the canonical evolution example

The World Wide Web is probably the clearest case of an architecture that enabled benefits its designers never foresaw. The earliest version (1991) was little more than **plain text with hyperlinks** (e.g. the original CERN page). By the late 1990s it supported e-commerce (early Amazon). Today it supports video streaming, social networks, real-time apps, and much more.

> None of these later uses were anticipated in the original design. But because the *bones* chosen in the REST reference architecture — URLs, HTTP, stateless requests, resource representations — were solid and general, the Web has been able to **layer new capabilities on top** of the same foundation for more than three decades without a redesign. This is architecture-enabled evolution working at its best.

![Screenshot of the first World Wide Web page (info.cern.ch, 1991) — plain text with blue hyperlinks. The same architectural bones now support video streaming, e-commerce, and real-time apps.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/web-cern-1991.png)

### 11.3 Trend: from monolithic to microservices

One concrete evolutionary trend in industry today: monolithic applications (everything in one large deployable unit) are increasingly being broken apart into **microservices** (many small, independently deployable services). Real systems that have made this transition include **Netflix**.

![Monolithic vs. microservices: a single deployable unit with all features bundled together, versus many small independently deployable services communicating with each other.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-4/monolithic-vs-microservices.png)

---

## 12. Connection to the Fundamental Principles

The same fundamental principles from Week 1 apply to software architecture:

| Principle | How it shows up in architecture |
|------|------|
| **Rigor and formality** | Precise diagrams, precise style definitions, precise component/connector vocabulary |
| **Separation of concerns** (modularity, divide and conquer, abstraction) | Every style above is an instance of separating concerns — MVC separates data/UI/control, layered separates levels of abstraction, pub-sub separates publishers from subscribers |
| **Anticipation of change** | Choosing styles (MVC, layered, pipe-and-filter) that make change cheap; keeping prescriptive architecture updated |
| **Generality** | Styles themselves are general solutions applicable across many systems |
| **Incrementality** | Architecture enables adding features, filters, services, or subscribers incrementally |

> Architecture is not a separate subject from these principles — it is one of the most visible places where they are applied.

---

## 13. Quiz 4 Study Guide

You should know and understand:

- **What software architecture is**
  - The set of principal design decisions about the system
  - The blueprint for construction and evolution
  - Why architecture matters (intellectual control, conceptual integrity, communication, reusability, maintainability)
- **Elements of software architecture**
  - Components, connectors, configurations
- **Architectural erosion**
  - Prescriptive vs. descriptive architectures
  - Why erosion happens
- **The six architectural styles**
  - Model-View-Controller
  - Client-Server
  - Layered
  - Peer-to-Peer
  - Pipe-and-Filter
  - Publish-Subscribe
  - For each: know the motivating example, the structural pattern, and the key benefits

---

## 14. Wrap-Up and Memory Framework

```text
Week 4 knowledge structure
|
+-- Why architecture
|   +-- bridges requirements -> code
|   +-- gives: intellectual control, conceptual integrity,
|   |          communication, reusability, maintainability
|   +-- analogy to building architect (but software is malleable,
|       invisible, a machine, and we know less about it)
|
+-- Definition of software architecture
|   +-- the set of PRINCIPAL design decisions about the system
|   +-- covers: structure, behavior, interaction, non-functional properties
|   +-- blueprint for CONSTRUCTION and EVOLUTION
|   +-- other definitions: Clements/Bass/Kazman, Spinellis, Fowler, Natarén
|
+-- Architecture in action
|   +-- Email            -> client-to-client
|   +-- WWW / REST       -> resources + URLs + HTTP + stateless
|   |                       (no single file IS the architecture)
|   +-- Facebook         -> many functional + many non-functional reqs
|   +-- Client-Server    -> most common distributed architecture
|
+-- Elements of architecture
|   +-- components   (the parts that do work)
|   +-- connectors   (how parts communicate)
|   +-- configurations (how they are arranged)
|
+-- Prescriptive vs. descriptive
|   +-- prescriptive = as-designed / as-intended
|   +-- descriptive  = as-implemented / as-realized
|   +-- examples where they diverge: Linux, iRODS, Hadoop
|
+-- Architectural erosion
|   +-- descriptive drifts away from prescriptive over time
|   +-- causes: sloppiness, deadlines, no docs,
|               optimizations, weak tooling
|
+-- Architectural style (definition)
|   +-- named collection of design decisions
|   +-- applicable in a given context
|   +-- constrains further decisions
|   +-- produces beneficial qualities
|
+-- The 6 styles
|   +-- MVC             (ATM)            -> modularity, anticipation of change
|   |                                       (specifically targets UI concerns)
|   +-- Client-Server   (video game)     -> sharing data/services, centralized control
|   |                                       drawback: single server can be overwhelmed
|   |                                       (cloud changed client-server)
|   +-- Layered         (restaurant,     -> modularity, abstraction,
|   |                    Android)            anticipation of change, reuse
|   |                                       (lowest layer = most reusable, e.g. Linux kernel)
|   +-- Peer-to-Peer    (Skype,          -> efficient, robust
|   |                    BitTorrent,        (pure P2P is rare; usually has
|   |                    Bitcoin)            a small client-server layer for
|   |                                        user/peer discovery)
|   +-- Pipe-and-Filter (compiler,       -> modularity, reuse,
|   |                    ls | grep | sort)   anticipation of change
|   +-- Publish-Subscribe (stock ticker) -> efficiency, scalability
|
+-- Mixing styles
|   +-- real systems usually combine multiple styles
|
+-- Evolution
|   +-- all successful software evolves
|   +-- architecture is the key tool for managing evolution
|   +-- canonical example: the Web
|   |   (CERN 1991 plain text -> Amazon 1997 -> modern social/video)
|   |   -> REST bones stayed, features layered on top for 30+ years
|   +-- trend: monolithic -> microservices (Netflix)
|
+-- Fundamental principles (still the same 5)
    +-- rigor and formality
    +-- separation of concerns (modularity, divide & conquer, abstraction)
    +-- anticipation of change
    +-- generality
    +-- incrementality
```

### One-sentence summary

> Software architecture is the set of principal design decisions — components, connectors, and configurations — that sits between requirements and code, exists as both a prescriptive (intended) and a descriptive (realized) view that tend to drift apart over time (erosion), and is expressed through named, reusable styles (MVC, client-server, layered, peer-to-peer, pipe-and-filter, publish-subscribe) whose whole purpose is to apply the fundamental SE principles — especially separation of concerns and anticipation of change — so that the system can evolve gracefully.
