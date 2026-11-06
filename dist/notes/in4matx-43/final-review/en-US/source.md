# INF 43 Final Review Notes (Cumulative Final Review)
### Introduction to Software Engineering · Prof. James (Jim) Jones · Spring 2026

> **Exam info**: Tuesday, June 9, 10:30–12:30, in-person, **closed notes**, all **multiple-choice / multiple-answer** (no free-form). The final is **cumulative**, and **the vast majority of questions come straight from the weekly quizzes**. These notes are organized around the "Big Questions"; each topic comes with **core concepts + diagrams + ⚠️ common quiz traps**.
>
> **How to study** (the professor's own words): *Study past quizzes; do flash-card-style self-testing — cover the answer and try it yourself first.* The end of these notes has a "⚡ One-page cheat sheet + high-frequency traps summary."

---

> 📌 **About the "➕ Supplementary topics" sections**: The professor said *"the quiz will focus on these topics, but I reserve the right to ask about any other lecture/reading information as well."* So these notes add small sections marked **"➕ Supplementary topics"** at the end of several themes — material the **quizzes did not directly test, but that lecture / reading covered**, and that could still show up on the final.


## 📚 Navigation: 8 Big Questions ↔ Topics ↔ Quizzes

| # | Big Question | Topic | Lectures | Quiz |
|---|---|---|---|---|
| 1 | What is software engineering? | SE foundations / principles / No Silver Bullet | L1–L2 | **Q1** |
| 2 | How do we know what to build? | Requirements | L3–L4 | **Q2** |
| 3 | (same) | Use Cases | L5 | **Q3** |
| 4 | How do we conduct ourselves? | Professional ethics (ACM) | L6 | **Q3** |
| 5 | How do we structure the software? | Software architecture + 6 styles | L7–L8 | **Q4** |
| 6 | How do we structure it in detail? | Design + UML class diagrams | L9–L10 | **Q5** |
| 7 | How do we meet the user's needs? | User-centered design (UCD) + Nielsen | L11–L12 | **Q6** |
| 8 | How do we know the software works? | Testing (black/white-box, coverage) | L13–L16 | **Q7** |
| 9 | What process do we follow? | Process models (8 of them) | L17–L18 | **Q8 (practice exam)** |

> The **INF 43 Recurring Fundamental Principles** run through the whole course (almost every topic loops back to them; you should be able to use them to explain why a design / requirement / architecture is good):
> **Rigor & formality · Separation of concerns (= modularity + divide-and-conquer + abstraction) · Anticipation of change · Generality · Incrementality.**

---

## 1️⃣ What is Software Engineering? (L1–L2 · Quiz 1)

### 1.1 Definitions of SE (be able to explain the keyword in each)

- **Tsui/Karam/Bernal**: a *broad field* touching all aspects of developing & supporting a software system.
- **Ghezzi et al.**: building software so large it's built by *teams of engineers*.
- **Parnas**: *Multi-person construction of multi-version software*. (The most cited: multi-person + multi-version.)
- **Schach**: production of *fault-free*, on-time, on-budget software that meets the user's needs *and is easy to modify*.
- **INF 43 definition** ⭐: *The process of constructing software; development phases **other than programming**; principles & qualities of enduring value.*

> **Programming vs. Software Engineering (Q1.1)**: Programming is just writing code; SE also has to **manage large-scale systems, teams, processes, and complexity**.

### 1.2 Three perspectives (who matters most? keyword pairing)

| Perspective | What matters most |
|---|---|
| **Business** (Shawna, CEO) | **Money** (cost, revenue) |
| **Engineering** (Andy) | **Internal quality of the software** |
| **User** (Clara) | **"Everything that the user sees"** |

> ⚠️ **Quiz 1 matching question**: Engineering → internal quality, Business → money, User → everything the user sees. The User perspective is considered the **most important** (everything is centered on the user).

### 1.3 Three essential ingredients

> **People + Processes + Tools.** Of these, **People are the most important** ⭐ (echoing Davis's "people are the key to success").
> ⚠️ The answer to Q1.2 is **People**, not "all equally important."

### 1.4 Abstraction and other principles (recognize the examples)

> **Abstraction**: hide internal logic behind a simple interface. *A function call providing a simple interface while hiding the implementation* = abstraction (Q1.3).

### 1.5 No Silver Bullet (Fred Brooks, 1986) ⭐⭐⭐ high-frequency

- **The "silver bullet" metaphor**: a single bullet that can kill a werewolf = a single breakthrough that would drop development difficulty by **10×**. Brooks argues: **no such silver bullet exists.**
- **Key distinction**: **Essential complexity** = difficulty inherent in the problem itself (hard to remove); **Accidental complexity** = difficulty introduced by tools/languages/environment (can be reduced with better tools). Past breakthroughs mostly attacked the "accidental"; the remaining "essential" part is the hard bone.

**The 4 essential difficulties** (memorize; definitions get tested individually):

| Difficulty | Meaning |
|---|---|
| **Complexity** | Software is more complex than any other human artifact; *no two parts are alike* |
| **Conformity** | Software must conform to human-made institutions and systems (which change) |
| **Changeability** | Successful software is always asked to change (because it "looks" easy to change) |
| **Invisibility** | Software has no physical form; it can't be visualized in geometric space |

> ⚠️ **Common traps (Q1.4 / Q8.5 / Q8.12)**:
> - The advice Brooks is **least likely** to give = *"always build everything from scratch yourself, never reuse"* → wrong; he advocates **buy vs. build (reuse)**.
> - His argument is *"within a decade no single technique will bring a 10× improvement"*; not "AI will be the silver bullet," nor "many small improvements stacked up reach 10×."
> - **Difficulty of learning a modeling tool = accidental**; **difficulty of understanding the business process = essential.**

---

### ➕ Supplementary topics: principle details & the silver-bullet lists (lecture, not directly quizzed)

- **Software is more than code**: code · documentation/user manuals · designs/specs · test cases · plans/schedules. **Engineering = the creative application of science and mathematics** to design and build, involving trade-offs, risk analysis, skill, and knowledge.
- **Three classic sets of SE principles (know the source and key words)**:
  - **Davis (1994)**: quality first · deliver to the customer early · understand the problem first · choose the right process · **good management > good technology** · people are the key to success.
  - **Royce (1998)**: architecture-first · component-based (**buy vs. build**) · frequent customer previews · incremental releases.
  - **Wasserman (1996)**: modularity · abstraction · UI prototyping · reuse · metrics.
- **Different roles "see" different parts of the software**: user = UI; programmer = source / internal design; society = impact/trends/dangers; business = profit/cost/training; manager = team/budget/schedule.
- **"False" silver bullets (once thought to be, but aren't)**: high-level languages, time-sharing, OOP, AI, expert systems, automatic/graphical programming, program verification, environments/tools, workstations.
- **Potential silver bullets (genuinely helpful but not silver bullets)**: **buy vs. build** · requirements refinement + rapid prototyping · incremental development · great designers.
- **Three enduring software qualities**: **Correctness (first) · Efficiency · Robustness.**


## 2️⃣ Requirements (L3–L4 · Quiz 2)

### 2.1 Software failure & why requirements matter

- Industry data is sobering (CHAOS): only ~29% of projects succeed, ~52% are challenged, ~19% fail.
- **Top failure causes** are mostly requirements-related: lack of user involvement, incomplete requirements, changing requirements, lack of process discipline / metrics / resources.
- **Requirements defects account for 70%+ of rework cost**; rework is 30–50% of the total budget. **The later you fix, the more expensive** (cost of change rises exponentially).

![Software life cycle cost: maintenance accounts for 67%](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/lifecycle_costs.png)
*Life cycle cost: Maintenance alone is ~67%; requirements analysis is only ~2%, yet it determines everything that follows.*

![Cost of change rises exponentially across phases](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/cost_of_change.png)
*Cost of change: the further along (implementation/integration/maintenance), the more expensive it is to change a requirement → so get requirements right early.*

### 2.2 The definition of a requirement

> **Requirements = WHAT the software should do, *without* saying HOW.** Describe the user's **needs**, not the user's **wants**.
> ⚠️ Specifying "write the backend in Python" = **how / an implementation decision**, not a requirement (Q2.2's worst requirement example).

### 2.3 The requirements phase: analysis vs. specification

| Sub-phase | English | Meaning |
|---|---|---|
| **Requirements analysis** | Requirements **Analysis** | *coming to know & understand* what the system should do (**understanding**) |
| **Requirements specification** | Requirements **Specification** | *documenting* the requirements (**recording**); also refers to the **requirements document** itself (SRS) |

> ⚠️ Q2.13/15/16/17 test this distinction repeatedly: **Analysis = understanding; Specification = the act of documenting/recording.**

### 2.4 Requirements analysis techniques (which is NOT one?)

Interview · Observe (observe the customer, the CNBC medical article) · Use cases/scenarios · Prototype · Research (study existing solutions) · **Data-driven** (data analysis / **A/B testing**, Netflix being the most famous).

> ⚠️ **Testing is NOT a requirements analysis technique** (Q2.14) — testing is a verification activity that happens after implementation.
> ⚠️ The category that employs the **most programmers** in the US = **In-house staff** (companies writing software for themselves), not games / outsourcing / open source (Q2.5).

### 2.5 Requirements document structure (what goes in each section = exam staple)

| Document section | What goes in it |
|---|---|
| **Executive Summary** | A short (≤1 page) product overview: main goals, key features, key risks |
| **Application Context** | The **environment/scenario** the system runs in, and everything/hardware/external systems it touches (e.g., "an iPad placed in the library lobby, connected to the county library database") |
| **Environmental Requirements** | Platform, hardware, OS, web/mobile/desktop, programming language, standards |
| **Functional Requirements** | The **functions/features/information** the system provides ("what the system should do") |
| **Software Qualities ("ilities" / non-functional requirements)** | correctness, reliability, efficiency, usability, security, scalability… "**secure and beautiful**" belongs here |
| **Assumptions / Risks** | Assumed premises, uncertain future risks (recording risk **is** within the requirements engineer's responsibility) |
| **Future Changes** | Anticipated changes; the document should be structured to absorb change easily |
| **Glossary** | Precise definitions of non-standard terms |

> ⚠️ High-frequency Q2: iPad/scanner/database → **Application Context**; "secure and beautiful" → **Software Qualities**; a list of functions → **Functional Requirements**.
> ⚠️ Q8.10: runs on iOS = **context**; responds within 2 seconds = performance (non-functional); client-server = an architecture decision; written in Swift = an implementation choice.

### 2.6 Ziv's Law ⭐

> **Ziv's Law**: software development is inherently **unpredictable**; requirements and other documents can **never be fully understood**; uncertainty is inherent and unavoidable in SE.
> → Corollary: **assume the requirements document will change sooner or later** (don't treat it as carved in stone). (Agile's appeal to Ziv's Law loops back here too.)

---

### ➕ Supplementary topics: specification methods / verification / acceptance test plan (lecture, not directly quizzed)

- **The requirements document has many readers**: customers, developers, managers, testers, documenters, maintainers, system engineers, architects, marketing… (→ it must be clear and unambiguous).
- **Specification Methods**: ① natural language (SRS, user stories) ② diagrams (**data flow, finite state machines, Petri nets**) ③ formal languages (**Z, TLA+**) ④ models (domain / usage / goal model).
- **Criteria for good requirements / spec verification**: is each one **complete, understandable, unambiguous, non-conflicting, verifiable, with defined terms, unbiased**? (The to-do-app example keeps asking *Complete? Unambiguous? Non-conflicting? Verifiable?*)
- **Acceptance Test Plan**: often accompanies the requirements specification; defines how to decide each requirement is satisfied; **passing all tests binds the customer to accept**; may contain specific test cases / a required number to pass.
- An **approximate UI** is usually part of the spec too; the document structure itself embodies rigor, separation of concerns, abstraction, anticipation of change, and other principles.


## 3️⃣ Use Cases (L5 · Quiz 3)

### 3.1 What / why

> **Use case = a piece of *text* that describes the interaction between an actor and the system in order to achieve some *goal*.** Note: **a use case is textual** — don't confuse it with a *use case diagram* (Q3.6).

- **Why use them**: they stay close to user goals / map easily to design and implementation / make it easy to **verify-and-validate** the design → **they map well to acceptance tests in Agile** (Q3.1).
- **NOT good for**: User interfaces, Data formats, Business rules, **Non-functional requirements** (Q3.7). They need to be combined with other requirements methods.

### 3.2 The three flows

| Flow | Meaning |
|---|---|
| **Basic Flow** | The "happy day" normal success scenario |
| **Alternative Flow** | The goal is reached, but via a **different path** |
| **Exception Flow** | The goal is **not reached** (failure) |

> A use case should cover all flows (success and failure). **A database schema is not part of a use case** (that's a design artifact, Q3.3).

### 3.3 Actors

> Actor = an **external entity** that interacts with the system: **a person / a hardware device / another software system** (Q3.4). The one that initiates the use case is the **primary actor**.

### 3.4 Use case diagram

![Use case diagram (ATM example): actors, system boundary, use cases](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/usecase_diagram_atm.png)
*A use case diagram = actors (stick figures) + system boundary (box) + use cases (ovals) + the lines connecting them. It is the **graphical** view.*

![Use case diagram (library system)](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/usecase_diagram_library.png)
*A more complex example: actors like Patron / Staff / Browser connected to various use cases. Reading tip: a use case's **primary actor** = the actor connected to it that initiates it.*

> ⚠️ Q3 diagram-reading: the use case connected only to "Prospective customer" = **Creating profile**; the primary actor of "Get ingredient request" = **Procurement**.

---

### ➕ Supplementary topics: Include / Extend relationships & the use case model (lecture, not directly quizzed) ⭐

- **Relationships between use cases (drawn in the use case diagram)**:
  - **«include»**: one use case **always** uses the behavior of another — extracts a common sub-flow (e.g., multiple use cases all "Validate user").
  - **«extend»**: optionally adds extra behavior **under a specific condition**; the base use case **does not depend on** the extending use case.
  - **Extension points**: the places in the base use case where extension is allowed.
- **Use case template fields** (know roughly what they are): Name · Actors · Goal · **Precondition / Postcondition** · **Trigger** · Basic/Alternative/Exception flows · Includes/Extends · Special/Performance/Data requirements.
- **Questions for finding actors / use cases**: "Who uses/installs/starts/shuts down the system? Who provides/obtains information? Which external devices or systems interact directly? Can all functional requirements be covered by use cases?"
- **Use case model = one or more use case diagrams + the textual descriptions of the use cases**; it is the **unifying thread / communication tool** that runs through development and connects all kinds of stakeholders.


## 4️⃣ Professional Ethics (L6 · Quiz 3)

> The **ACM/IEEE Software Engineering Code of Ethics**, 8 principles. The highest priority is **Public First**.

| # | Principle | Key words |
|---|---|---|
| 1 | **Public** ⭐ | Put the public interest first: safety, health, privacy, and welfare come **above all**; disclose dangers, report significant risks |
| 2 | Client & Employer | Act in the client's/employer's interest — but **bounded by "ethical limits and the public interest"** |
| 3 | Product | High quality, reliable, well-tested, maintainable; fix known defects before release |
| 4 | Judgment | Maintain integrity and independence, decide based on **evidence**, refuse bribes |
| 5 | Management | Promote a healthy/ethical development environment, realistic schedules, QA, and encourage raising concerns |
| 6 | Profession | Uphold the reputation and standards of the profession |
| 7 | Colleagues | Be fair, give credit, do constructive reviews, anti-discrimination |
| 8 | **Self** | **Lifelong learning**, improve your skills, know the limits of your own competence |

> ⚠️ High-frequency Quiz 3: ACM's foremost concern = **the public good**; managers should foster **healthy workplaces**; respecting privacy = **minimize data collection**; lifelong learning matters because **knowledge becomes obsolete quickly**.
> **When client interest conflicts with the public interest → the public wins** (Principle 1 > Principle 2).

---

## 5️⃣ Software Architecture (L7–L8 · Quiz 4 + attendance quiz)

### 5.1 Definition and value

> **Software architecture = the set of *principal* design decisions about a system.** It is the **blueprint** for building and evolving the system. The key word is **"principal"** — not the source code, not the UI look, not the test plan.

**"Principal" decisions cover**: Structure · Behavior · Interaction · Non-functional properties.

**Why architecture (benefits)**: Intellectual control · **Conceptual integrity** · Effective communication · **Reusability** · **Maintainability**.
> ⚠️ Q4.8: architecture **does not guarantee correctness** (correctness still relies on implementation + testing + verification).
> ⚠️ **Conceptual integrity** (which Brooks called the most important consideration in system design) = having different teams follow a **single coherent vision** (Q4.7).

### 5.2 Elements of architecture

![Architecture elements: Components / Connectors / Configuration](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_elements.png)

| Element | Meaning |
|---|---|
| **Component** | A primary **unit of computation / data store** (the main building block of the system) |
| **Connector** | The mechanism of **interaction/communication** between components |
| **Configuration** | The **architectural diagram (topology)** that arranges components + connectors |

### 5.3 Prescriptive vs. Descriptive + architectural erosion

| | Meaning |
|---|---|
| **Prescriptive architecture** | as-designed / as-intended — the architecture in the **design/intent** |
| **Descriptive architecture** | as-implemented / as-realized — the **actual** architecture in the code |

> **Architectural erosion**: as a system evolves, you should change the prescriptive architecture first, but in practice people change the code directly → a gap opens between the two.
> ⚠️ Causes of erosion (Q4.12): **short deadlines (time pressure)**, careless developers, lack of a documented prescriptive architecture, code optimization, inadequate tool support. ("Too much documentation / too many tools / too much conceptual integrity" actually **protect** the architecture and don't cause erosion.)

### 5.4 Limits of the building analogy (Q4.3)

> Key differences between software and buildings: software is **far broader in purpose**, more **malleable**, **invisible**, and **changes frequently** after deployment. Common ground = both start with a **blueprint before construction**.

### 5.5 The six architectural styles ⭐⭐⭐

> **A style = a named set of architectural design decisions**, suited to a particular context, that **constrain** the design decisions and give the system **beneficial qualities**; i.e., a named set of components/connectors/configurations.
> ⚠️ Attendance quiz: using a given style **does not guarantee** the system is more efficient ("always more efficient" is wrong).

#### ① Model-View-Controller (MVC)
![MVC](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_mvc.png)

- **Model**: data + business logic (account balance, rules).
- **View**: **displays** the data to the user.
- **Controller**: receives **user input**, decides which model operation to call, then tells the view to update.
- **Benefits**: Modularity, Anticipation of change (**separation of concerns** — UI and data logic can evolve independently).
> ⚠️ ATM, click "Withdraw" → the **Controller** decides what to do (the View only detects the click; Q8.16).

#### ② Client-Server
![Client-Server](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_client_server.png)

- The client **requests** from the server, the server **responds**; **centralizes** data/security/access.
- **Benefits**: shared data and services across many clients, **centralized control**.
> ⚠️ Clients **do not talk to each other directly** (that's P2P). Cloud computing lets client-server run mostly in the cloud (AWS got its start here).

#### ③ Layered
![Layered](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_layered.png)

- Each layer **depends only on the layer directly below** (e.g., the Android stack, restaurant protocols).
- **Benefits**: Modularity, Abstraction, Anticipation of change, **Reuse**.
> ⚠️ Attendance quiz: the **lower layers are the most reusable** (they provide general services to the upper layers).

#### ④ Peer-to-Peer (P2P)
![P2P](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_peer_to_peer.png)

- Each peer is both client and server, with **no central server** (Skype group video).
- **Benefits**: Efficient, Robust.

#### ⑤ Pipe-and-Filter
![Pipe-and-Filter](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_pipe_filter.png)

- **Filter = component** (processes data); **Pipe = connector** (carries the data stream). Examples: a compiler scanner→parser→translator; `ls -l | grep "Aug" | sort`.
- **Benefits**: Modularity, Reuse, Anticipation of change.

#### ⑥ Publish-Subscribe (pub-sub)
![Pub-Sub](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_pub_sub.png)

- Publishers send events to a subscription manager; **subscribers only receive the events they subscribed to** (stock quotes).
- **Benefits**: Efficiency, Scalability.

| Style | In one line | Main benefits |
|---|---|---|
| MVC | UI/logic/data split three ways | Modularity, anticipation of change |
| Client-Server | Clients request a central server | Centralized control, sharing |
| Layered | Each layer depends downward | Modularity, abstraction, reuse |
| P2P | Peers, no center | Efficient, robust |
| Pipe-Filter | Data flows through filters | Modularity, reuse |
| Pub-Sub | Events pushed by subscription | Efficient, scalable |

> **Evolution**: all successful software evolves; the trend is **Monolithic → Microservices** (each service deployed independently, managing its own data to **reduce coupling**). Mixing several styles is common.

---

### ➕ Supplementary topics: REST/Web architecture & real cases (lecture, not directly quizzed)

- **The WWW = the REST reference architecture** (a classic case; understand its characteristics):
  - The Web is a collection of **resources**, each with a unique name, the **URL**; a URL locates an **origin server** on the Internet.
  - The **client (user agent / browser) requests** resources from the server; the client operates on **representations** of resources.
  - Communication uses a **uniform, general protocol, HTTP**; and every communication must be **self-contained / stateless**.
  - **No single piece of code implements this architecture**; the style's constraints aren't visible in the code — you can only understand them from the **architectural viewpoint**.
- **Functional vs. non-functional requirements (Facebook example)**: functional = friends/feed/News Feed/messages/photos…; non-functional = performance, scalability, availability, security, privacy, reliability, portability.
- **Real architecture cases** (know roughly whether each is client-server / layered / hybrid): Email (client↔server), AUTOSAR (automotive), Netflix, Reddit. **Mixing multiple styles is common.**
- **AI-assisted architecture (Week 5 reading)**: treat Claude as your "architecture mentor" — you are the architect, the AI is the consultant; nearly all student projects are **client-server** (Frontend displays / Backend logic / Database stores), which can mix in a layered backend + componentized/MVC frontend; the connector protocol is usually **HTTP/REST** (request-response, JSON), **WebSocket** for real-time, **RPC/gRPC** between services. The minimal runnable version = a single endpoint completing a "frontend → backend → database" round-trip.


## 6️⃣ Detailed Design + UML (L9–L10 · Quiz 5 + attendance quiz)

### 6.1 Design vs. architecture

> **Software design = all the creative decisions about *how* the system is realized** (the "how" to requirements' "what").
> **Architecture = a *subset* of design decisions — the "principal / system-level" ones.** Architectural decisions are **harder to change** (pull one thread and the whole thing moves).

> ⚠️ Q8.6 false statement: "architecture is about internal structure and implementation, while design is mainly about appearance and UI" → wrong. Architecture is a **subset** of design; design is much more than UI (it includes data structures, algorithms, module interfaces, class organization…).
> ⚠️ Example of a system-level design decision: **which communication protocol to use** (affects every component); how a variable is spelled is local and doesn't count.

### 6.2 The 6 design approaches (classified by "what dominates them")

![Functional Decomposition](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/functional_decomposition.png)
*Functional decomposition: recursively break a **function** into sub-functions until the leaves are small enough to be implemented by a single function/method.*

| Approach | What dominates |
|---|---|
| Software architecture | The main structural decisions |
| **Functional decomposition** | Decomposing **functionality** |
| **Relational database design** | Decomposing **data** (entities/attributes/relationships → tables) |
| **Object-oriented design (UML)** | Decomposing **entities** — **both data + computation** |
| **User interface design** | **Envisioning and iterating** the UI (sketches, prototypes, feedback) |
| Sketching | Quick sketches |

> A **Class = a blueprint for making objects**; an **Object = data + methods** (encapsulation). The advantage of OO = unifying data and computation in "objects."

### 6.3 The nature of design: purpose, iteration, abstraction

> **The 3 purposes of design**: **to Think · to Talk · to Prescribe** what to build.
> Design develops **iteratively** (not fixed once at the start, nor done only after the code is written).

> **Abstraction = removing irrelevant information while keeping/highlighting the relevant** (selective omission). Each **design notation supports only one kind of abstraction** → so you need multiple diagrams. Multiple models = **complementary views** of the system (class diagram = structure, sequence diagram = interaction, state diagram = lifecycle), complementing rather than duplicating each other (Q8.9).
> One-line definition: **SE = the process of building a set of related models to represent the system-to-be.**

### 6.4 UML class diagram ⭐⭐

![UML class diagram structure: name / attributes / operations + visibility](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_class_structure.png)

- **Three compartments**: top = **class Name**, middle = **Attributes**, bottom = **Operations**.
- **Visibility symbols**: `+` **public** · `−` **private** · `#` **protected** · `~` **package**.

![Class → code (Airplane example)](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_class_airplane.png)
*`+getSpeed():int`, `-speed:int` → correspond to a public method / a private field.*

### 6.5 Relationships between classes

![Inheritance](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_inheritance.png)
![Association](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_association.png)

- **Inheritance (is-a)**: general→specific (Animal ← Hippo). A **hollow triangle arrow** points to the parent (Q5.20).
- **Association**: a connection between classes (teaches / listens to).
- **Multiplicity**: the number at one end = how many instances of this class correspond to **one** instance of the other. **Read it from the opposite end.**

> ⚠️ **Multiplicity trap (Q5.22)**: X —— `*` Y means each X is associated with **many** Ys → X should hold a **collection/List of Y**, not a single Y, and certainly not the number 1.

![Aggregation (hollow diamond)](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_aggregation.png)
![Composition (filled diamond)](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_composition.png)

**Aggregation vs. Composition (exam staple)** — use the **destruction test**:

| | Relationship | Can the part exist independently? | Diamond |
|---|---|---|---|
| **Aggregation** | whole-part (has-a) | **Yes** (the whole is destroyed, the part survives) | hollow ◇ |
| **Composition** | a **stronger** form of whole-part, with **existence dependency** | **No** (the whole is destroyed, the part dies with it) | filled ◆ |

> ⚠️ Q8.11 false statement: "Aggregation means the part cannot exist independently" → that's the rule for **composition**.

### 6.6 Design principles

![High Cohesion / Low Coupling](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/cohesion_coupling.png)

> **High Cohesion**: keep **related** functionality together (elements within a module are strongly related).
> **Low Coupling**: reduce **dependencies** between modules.
> Goal = **high cohesion + low coupling** → change doesn't spread, reuse is easy.
> ⚠️ Q8.2 trap: **"Cohesion measures how much a module depends on other modules" = wrong** (that's the definition of **coupling**).

> **Information Hiding**: hide the design decisions **most likely to change**, protecting the rest of the program from their changes.

---

### ➕ Supplementary topics: other UML diagrams & design notations (lecture, not directly quizzed)

- **Different phases use different "languages"**: Requirements → **English**; Design → **diagrams / UML**; Coding/Testing → **Java / Python**. *"A good notation frees the brain from unnecessary work." —Whitehead.*
- **UML represents different aspects of a system**: **Class diagram = structure**; **Activity diagram = workflow/behavior**; **Sequence diagram = interaction (messages over time)**; Use case diagram = user-system interaction.
- **Other design diagrams/notations**: UI mockups / wireframes (e.g., Balsamiq), pseudocode, **ER diagrams**, architecture diagrams, storyboards, sketches.
- Each notation supports **one kind of abstraction** → you need multiple diagrams to describe the same system from different angles. In one line: **SE = building a set of related models to represent the system-to-be.**


## 7️⃣ User-Centered Design (UCD) (L11–L12 · Quiz 6)

### 7.1 Why usability matters

> *"A well-designed interface = the program behaves exactly as the user expects."* UCD is simple and cheap, yet it boosts sales, satisfaction, and efficiency. Software engineers are **usually not** the users of their own software → so dedicated methods are needed.

### 7.2 The eight UCD methods (memorize + be able to distinguish)

| Method | What it is / key distinction |
|---|---|
| **Interviews** | Ask users to **say** what they do — will **miss tacit/collaborative** work |
| **Observations (ethnography)** | Watch what users **actually** do — reveals tacit practices interviews miss (e.g., shift handoff) |
| **Personas** | A design tool that **personifies** an abstract user role ("19-year-old commuter student Alex"); **not a statistical sample**, and not a substitute for user testing |
| **Scenarios** | A piece of **text narrative**: the user's goal/situation (→ derive design implications) |
| **Storyboards** | The **visual version** of a scenario: comic-strip-style depiction of the surroundings and the interaction sequence |
| **Wireframes / Mockups** | Low-fidelity interface sketches |
| **Design Guidelines (standards)** | Components + styles + code samples + accessibility defaults; solve the "**each team in a big org reinventing the wheel → inconsistency**" problem (e.g., U.S. Web Design Standards) |
| **Heuristic Evaluation** | Experts check the interface **against established principles** (Nielsen's 10) |
| **User Testing** | Real users perform real tasks, **think aloud**, while you observe their hesitations/errors |

> ⚠️ High-frequency Q6 distinctions:
> - Collaborative work that interviews miss → use **observation** to fill the gap.
> - **Heuristic eval (principle-driven, experts)** vs **user testing (behavior-driven, real users)** — both can be done at any stage and both can use tasks; the difference is "principles vs. behavior."
> - Three government sites with three different password rules → violates **consistency and reuse across services** (design standards).
> - Shared 508-compliant components → **accessibility and consistency by default, reducing duplicate implementation.**

### 7.3 Nielsen's ten heuristics (paired with examples = how it's tested) ⭐⭐

| Heuristic | In one line | Example on the quiz |
|---|---|---|
| **Visibility of system status** | Let users know the current state/progress | Only a spinner, never says whether it'll take 5 seconds or 5 minutes |
| **Match system & real world** | Use the user's language, not jargon | A printer shows "PC LOAD LETTER" (engineer-speak) |
| **User control & freedom** | Provide undo/exit ("emergency exits") | Cropping an image has **no undo** |
| **Consistency & standards** | Consistent look/behavior | A university site changes all its nav/branding after a jump, looks like you left the official site |
| **Error prevention** | Prevent errors from happening | A delete dialog's buttons are "Proceed" / "Delete," with no clear "Cancel" |
| **Recognition rather than recall** | Make information visible, reduce memory load | Asked to remember a 12-digit confirmation code from the previous page; menus with pictures > plain text |
| **Flexibility & efficiency (accelerators)** | Provide shortcuts for power users | Keyboard shortcuts invisible to novices, usable by experts; returning customers skip onboarding |
| **Aesthetic & minimalist design** | Keep the interface clean, only essential info | Contrast/Repetition/Alignment/Proximity |
| **Help users recognize/recover from errors** | Clear error messages with a solution | — |
| **Help & documentation** | Provide help docs when needed | — |

> **Lessons from the restaurant usability reading (Nielsen Group)**: *"Just take the money"* (don't force sign-up/surveys/membership before checkout) · *Use pictures* (pictures > recall, echoing recognition > recall) · *Retain valued features* (a redesign shouldn't break familiarity) · let returning users **skip onboarding** straight to common actions.

---

### ➕ Supplementary topics: usability testing details & minimalist design principles (lecture, not directly quizzed)

- **Visual principles of minimalist design (CRAP)**: **Contrast · Repetition · Alignment · Proximity.**
- **Cognitive walkthrough**: an evaluator takes the perspective of a new user and walks through each step of a task to check whether it's natural and reasonable.
- **Elements of planning a user test**: **Subjects · The system · Tasks · The session · Measures taken**; improve the design first with a checklist / heuristic evaluation, **then** bring it to real users.
- Why it's hard: UX design draws on psychology, cognitive science, aesthetics, and art — and **software engineers usually aren't the target users of their own software**, which is exactly why these UCD methods are needed.


## 8️⃣ Testing (L13–L16 · Quiz 7 + Quiz 8) ⭐⭐⭐ the densest topic

### 8.1 QA: Verification vs. Validation

| | Question | Meaning |
|---|---|---|
| **Verification** | *"Are we building the system **right**?"* | Does it conform to the **spec/design docs**? |
| **Validation** | *"Are we building the **right** system?"* | Does it meet the user's **real needs**? |

> **QA = all activities that measure and improve product quality.** Techniques: **Formal methods, Static analysis, Reviews/Inspections, Testing** (used in combination).
> ⚠️ Q7.2 / Q8.15: checking whether code conforms to the **technical design document** = **verification**; users finding it hard to use / the analysis being pointless = **validation**. A system can **pass verification yet fail validation** (the spec is implemented correctly, but the spec itself doesn't meet the user's needs).

### 8.2 The IEEE chain: Mistake → Fault → Error → Failure ⭐⭐⭐

![IEEE chain: Mistake → Fault → Error → Failure](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/ieee_fault_chain.png)

| Term | Definition |
|---|---|
| **Mistake** | A human action that produces an incorrect result (a person's slip while writing code) |
| **Fault / Bug** | The wrong step/data definition in the code — you can **point to it in the code** ("defect" usually means a fault) |
| **Error** | The difference between the computed result and the correct result at run time (an **internal** erroneous state) |
| **Failure** | The (wrong) result of a fault — the **externally visible** anomalous behavior/output |

> ⚠️ Decision-question pattern:
> - "An employee receives the **wrong overtime pay**" / "AssertionError: expected x but was y" = **Failure** (externally visible).
> - **A fault does not necessarily cause a failure** (that path isn't executed, or the error state is overwritten by later logic).

![Testing levels: unit → integration → system](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/testing_levels.png)

### 8.3 Testing fundamentals

> **Dijkstra**: *"Testing can show the presence of bugs, but never their absence."*
> ⚠️ Therefore "better testing can make software bug-free" / "we found and fixed all the bugs" = **wrong** (Q7.5 / Q7.9 / Q8.15).

- **Who tests**: programmers, testers, users (acceptance / **alpha** / **beta** testing), crowdsourcing / bug bounty.
- **Testing levels (speed fast→slow, scope small→large)**: **Unit (ms) → Integration (s) → System/acceptance (min)** — the "testing pyramid."
- **Test Oracle**: the mechanism that decides whether a test **passes/fails** (the expected output for a given input); hard to automate. ⚠️ An oracle is **not** "predicting where faults are most likely." Two independent implementations can serve as oracles for each other (**N-version programming**).
- **Peer code review** = a human **reviews the code changes** before merging (e.g., a GitHub PR).
- **When to stop testing**: find as many faults as possible within a fixed time/budget; the new-fault discovery rate approaches zero; the agreed quality requirement / the planned QA activities are met. ⚠️ It **cannot** be "all bugs found and fixed."

### 8.4 Black-box (specification-driven)

> Derive tests from the **specification**, without looking at the internal code.

- **Equivalence Class Partitioning**: split the input domain into classes that are "equivalent for finding errors"; the classes should **cover the whole input domain** and **not overlap**; test one representative value per class.
- **Boundary Value Analysis (BVA)**: many errors occur at **boundaries** (`<` vs `<=` confusion) → test values **at the boundary** of each class.
- **Systematic steps**: ① determine the input domain ② find a basis for partitioning (size/structure/correctness/intuition) ③ partition into sub-domains ④ pick a representative value per sub-domain ⑤ test representative values + boundary values.
- **Combinatorial testing**: with multiple parameters, partition each and then **combine** the values.

> ⚠️ **BVA range trap (Q7.13 / Q7.14, the most error-prone)**:
> - Password length 8–16 → three partitions too-short(<8) / valid / too-long(>16); test **the boundaries of all partitions** = **{7, 8, 16, 17}**.
> - But if asked for the boundary values of the partition "**18 ≤ age < 50**" itself = **{18, 49}** (49 is the largest integer satisfying <50; 50 is outside). ⚠️ {17,18,49,50} is the full BVA set **across all partitions** — read carefully whether it's asking about "the whole domain" or "one partition."
> - The steps of equivalence partitioning do **not** include "collect user feedback for validation" (that's validation, not a black-box step).

### 8.5 White-box (structure/code-driven)

> Derive tests from the **source code**: build a **control-flow graph (CFG)** and express tests via graph coverage.

![Control-flow graph CFG (getSecondElement)](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/control_flow_graph.png)

- **CFG rules**: every graph has an **entry** and an **exit** node; each node ≈ one atomic instruction (about one line); edges are directed; **any node with ≥2 outgoing edges** must **label** its out-edges by condition (predicate T/F, switch value) — these are the **branches**.
> ⚠️ Q7.11: multiple out-edges need labels because the labels **indicate the condition for each path**.

![Statement / Node Coverage](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/statement_coverage.png)
![Branch / Edge Coverage](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/branch_coverage.png)

| Coverage criterion | Requires |
|---|---|
| **Statement / Node coverage** | Every **node (statement)** executed at least once |
| **Branch / Edge coverage** | Every **branch (edge)** traversed — **stronger** than statement coverage, better at finding logic errors |
| **Condition / Method / Method-call / Data-flow** | Each condition, each method, each call site, each definition-use |
| **Path coverage** | Every **path** traversed — the **strongest**, but loops cause path explosion, so it's often **infeasible** |

> **Coverage hierarchy (exam staple)**: **Path ⊇ Branch ⊇ Statement.**
> ⚠️ **Branch is strictly stronger than statement**: achieving branch coverage **automatically** satisfies statement coverage, but not vice versa. Example: `if (x) doThing();` tested only with `x=true` → full statement coverage, but only half the branches covered.
> ⚠️ So "100% statement coverage ⇒ 100% branch coverage" = **wrong** (Q7.8).

**Minimum test-case counts (high-frequency calculation question)**:
- `if(A){ print; if(B){print} print }` → **statement coverage needs at least 1 case** (A=true, B=true walks every statement once).
- Three **sequential** (non-nested) `if(A) / if(B) / if(C)` → **6 branches** total (3×2); **branch coverage needs at least 2 cases** (all-true once + all-false once).

### 8.6 Other QA techniques

- **Inspections & Reviews (humans read docs/code to find defects)**: surprisingly effective; also transfers knowledge and shares code ownership.
- **Formal Methods**: correctness proofs — **verification only**, usually paired with a formal specification.
- **Static Analysis**: analyze the source without running it to find potential defects (e.g., FindBugs); results need human review (many warnings are false positives).

---

### ➕ Supplementary topics: full coverage table / oracle examples / untested testing types (lecture, not directly quizzed)

- **Black-box equivalence partitioning worked example (grade 0–100 → letter)**: partitions F(0–59) / D(60–69) / C(70–79) / B(80–89) / A(90–100) + invalid(<0, >100); boundary values like -1, 0, 59, 60, 69, 70, 79, 80, 89, 90, 100, 101. Pick a representative + boundary values per partition.
- **Other coverage criteria** (white-box): **Condition coverage** (each condition tested T/F, e.g., `a>b || c>d`) · **Method coverage** (each method executed) · **Method-call coverage** (each call site reaches each method, including polymorphism) · **Data-flow** (definition→use) · **Path coverage** (each path; for loops take 0/1/average/max iterations; strongest but often **infeasible**).
- **Limits of white-box**: you can cover all nodes/edges and still miss an obvious fault; some node/edge/loop combinations are **infeasible**.
- **Test oracle example (cosine)**: how do you know cos(0.5)=0.8776 is correct? — use a known mathematical property or a reference implementation as the oracle.
- **Testing types the course doesn't go deep on but you should know exist**: Regression · Integration · Interaction/Mocking · Debugging · Mutation · Fuzz · Exploratory testing.
- **Confidence vs. number of tests**: more cases means higher confidence, but there's a "sweet spot" of diminishing returns — more is not always better (and you can never reach "proven bug-free").


## 9️⃣ Software Process Models (L17–L18 · Quiz 8) ⭐⭐

> **Why have a process**: SE is hard (complexity/conformity/changeability/invisibility) → use a **well-defined process** to ensure "do the right thing / do the thing right / miss nothing." The process is **not a silver bullet** (Brooks).
> **A Model = a simplified representation**; a process model can be **prescriptive** or **descriptive**.

**The 8 life cycle models** (high-level process): Build-and-Fix · Waterfall · Rapid Prototyping · Incremental · Spiral · RUP · XP · Agile.

### ① Build-and-Fix
![Build-and-Fix](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_build_and_fix.png)
Write a first version, then keep changing it until the client is satisfied. **Pro**: fine for **small programs**. **Con**: **not rigorous enough** for any non-trivial project.

### ② Waterfall
![Waterfall](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_waterfall.png)
Linear phases: Requirements → Design → Implementation → Integration → Testing → Maintenance.
**Pro**: understand requirements thoroughly first, disciplined, lots of documentation; suited to projects with **clear, stable requirements**. **Con**: rigid, hard to handle change, little user involvement, often no time left for testing (Healthcare.gov).
> ⚠️ Q8.13: waterfall **assumes requirements are relatively stable.**

### ③ Rapid Prototyping
![Rapid Prototyping](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_rapid_prototyping.png)
Build a simple prototype **then throw it away** to figure out the requirements, then develop for real. *"People don't know what they want until you show it to them." —Jobs / Humphrey's Law.*

### ④ Incremental
![Incremental](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_incremental.png)
Do requirements + architectural design first, then **for each increment** do detailed design/implementation/integration/testing/delivery. (MS shifted from the Win8 "ta-da" to Win10's iteration + user feedback + A/B.)

### ⑤ Spiral ⭐⭐ high-frequency
![Spiral](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_spiral.png)
Each loop **always starts with Risk Analysis**, the middle steps **vary based on the risk analysis result**, and the loop **ends with verification**.
**Pro**: suited to **uncertain, complex new projects**; the **highest-risk parts are done first**. **Con**: developers must be good at risk analysis; the "end of the project" may be unclear.
> ⚠️ Q8.13 reversal trap: Spiral does **not** "defer the highest-risk requirements to later" — on the contrary, it tackles the highest-risk items **as early as possible**. Its organizing principle = **risk management**. Spiral and Agile are both **iterative.**

### ⑥ Rational Unified Process (RUP)
![RUP](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_rup.png)
Three signature traits: **Use-case driven · Architecture-centric · Iterative & incremental.** Four phases: **Inception → Elaboration → Construction → Transition**; each iteration walks through all workflows.
**Pro**: risk-driven, incremental, lots of tool support, detailed guidance. **Con**: **very heavyweight**, complex, requires dedicated expertise.

### ⑦ Extreme Programming (XP)
An "extreme" reaction against heavyweight processes like waterfall (targeting: long cycles, difficulty handling change, the assumption that requirements are fully understood from the start, reliance on heroic effort, complex methodology, duplicated work).
**Core practices (≈12–14)**: Whole team · **Small releases** · Customer tests · **Simple design** · **Pair programming** · **Test-driven development (TDD)** · Design improvement (refactoring) · **Continuous integration** · Collective code ownership · Coding standards · Sustainable pace · Open space · Shared understanding · Rapid fine feedback.
> ⚠️ **Pair programming = two people, one machine** (driver writes, navigator reviews, taking turns) — XP's signature practice (Q8.1 / Q8.14). XP is **lighter than RUP.**

### ⑧ Agile
Evolved from XP / Scrum / Crystal / Kanban. The **Agile Manifesto (2001) four values** ("value the left over the right"):

| Value | Over |
|---|---|
| **Individuals & interactions** | processes & tools |
| **Working software** | comprehensive documentation |
| **Customer collaboration** | contract negotiation |
| **Responding to change** | following a plan |

**Principles**: welcome changing requirements, daily business-and-developer collaboration, build around motivated people, face-to-face communication, continuous delivery.
**Pro**: customer/developer satisfaction, adapts to change, suited to unclear requirements / small teams. **Con**: little documentation, unstable requirements, technical debt; the original Agile is ill-suited to large teams / safety-critical projects / projects where the customer can't participate.
> ⚠️ Agile does **not** require fully nailing down requirements before implementation (that's anti-Agile).

### Process model quick comparison

| Model | Iterative? | Suited to | One-line memory |
|---|---|---|---|
| Build-and-Fix | No | Small programs | Build then patch |
| Waterfall | No | **Stable**, clear requirements | Linear, doc-heavy, rigid |
| Rapid Prototyping | — | Unclear requirements | Prototype → discard → rebuild |
| Incremental | Yes | Deliverable in chunks | Add piece by piece |
| **Spiral** | Yes | Uncertain/high-risk new projects | **Risk-driven, riskiest first** |
| RUP | Yes | Large, needs guidance | Use-case-driven + architecture-centric, **heavyweight** |
| XP | Yes | Fast-changing | Pairing + TDD + small releases |
| Agile | Yes | Volatile requirements / small teams | Embrace change, light docs |

> **The big trend**: from **rigid / heavyweight / document-driven** → **lightweight / agile.**

---

### ➕ Supplementary topics: RUP's four phases / Boehm risks / Scrum / meanings of "model" (lecture, not directly quizzed)

- **RUP's four phases (in order)**: **Inception → Elaboration → Construction → Transition**; every iteration walks through all workflows (Business Modeling, Requirements, Analysis & Design, Implementation, Test, Deployment + supporting ones).
- **Spiral's Boehm Top-10 risks (example + response)**: short-staffed → hire top talent / train; unrealistic schedule/budget → detailed estimation / reuse / increments; building the wrong function → user research / prototyping; constantly changing requirements → information hiding / increments; external components/tasks falling short → compatibility analysis / reference checks.
- **Scrum**: the most popular Agile framework (iterates by sprint).
- **The two meanings of "model"**: model = **an ideal/exemplar**, or model = **a simplified representation**; a software process model can be **prescriptive** or **descriptive**.
- **Other course topics (background)**: **AI-assisted development** (see §5 Week 5 reading) · **version control / GitHub** · project estimation · **social responsibility (= ethics, see §4)**.


## ⚡ One-page cheat sheet + high-frequency traps (the last 10 minutes before the exam)

**🔑 Must-memorize list**
- **3 ingredients**: People (most important) + Processes + Tools
- **3 perspectives**: Business = money / Engineering = internal quality / User = everything seen (most important)
- **4 essential difficulties** (Brooks): Complexity, Conformity, Changeability, Invisibility
- **Essential (inherent, hard to remove) vs Accidental (incidental, tools can reduce) complexity**
- **Requirements = WHAT not HOW**; needs not wants; Ziv's Law = requirements will change
- **Analysis = understanding / Specification = recording (= the document)**
- **Use case = text**; flows = basic/alternative/exception; actor = person/hardware/software; **not good for non-functional requirements**
- **ACM**: Public First is the top priority; client interest vs public → the public wins
- **Architecture = principal design decisions**; elements = Components/Connectors/Configuration; **doesn't guarantee correctness**
- **Prescriptive (design) vs Descriptive (code)**; erosion's main cause = short deadlines
- **6 styles**: MVC / Client-Server / Layered (lower layers most reusable) / P2P / Pipe-Filter / Pub-Sub
- **MVC**: Model = data & logic / View = display / Controller = handle input
- **Class = blueprint, Object = data + methods**; UML compartments = Name/Attributes/Operations; `+`public `−`private `#`protected `~`package
- **Multiplicity `*` → hold a collection** (read from the opposite end)
- **Aggregation (hollow ◇, can stand alone) vs Composition (filled ◆, existence dependency)** — destruction test
- **High cohesion + low coupling** (cohesion = internal relatedness; coupling = inter-module dependency, don't swap them)
- **8 UCD methods** + **Nielsen's 10 heuristics** (be able to match examples)
- **V&V**: Verification = build it right (conforms to spec) / Validation = build the right thing (conforms to the user)
- **Mistake → Fault → Error → Failure**; a fault doesn't necessarily → failure
- **Dijkstra**: testing only proves bugs exist, never their absence → "tested all the bugs" is always wrong
- **Branch ⊇ Statement**; branch automatically satisfies statement, not vice versa; Path is strongest but often infeasible
- **Testing levels**: Unit → Integration → System (fast → slow)
- **Spiral**: each loop starts with risk analysis, **riskiest first** (not deferred)
- **XP**: pair programming + TDD; lighter than RUP
- **Agile's 4 values**; doesn't require fully fixed requirements up front

**⚠️ Top 10 traps you'll fall into**
1. The **minimum number of cases** for statement vs branch coverage, and that "statement ⇒ branch" is **wrong**.
2. **BVA — read the scope carefully**: the whole input domain vs the boundaries of one partition ({7,8,16,17} vs {18,49}).
3. **Don't reverse the Coupling/Cohesion definitions** (cohesion = internal; coupling = external dependency).
4. **Aggregation vs Composition**: can it exist independently → composition cannot.
5. **Verification ≠ Validation** (conforms to the spec vs meets the user's needs).
6. **Failure** = externally visible (wrong overtime pay / AssertionError); it's not a fault.
7. **Spiral does the riskiest first**, not deferred; risk-driven.
8. **Requirements are the what**; specifying a language/protocol/iOS-use-Swift = how/implementation, not a requirement; the iOS platform = context.
9. **Client-Server ≠ P2P** (clients don't connect to each other directly).
10. **Architecture doesn't guarantee correctness**; architecture is a **subset** of design (design is far more than UI).

---

## 🌳 Knowledge Tree

```
INF 43 Software Engineering
├── What is SE?            → definitions · 3 perspectives · 3 ingredients (People) · principles · No Silver Bullet (4 difficulties)
├── Requirements           → what≠how · analysis/spec · document structure · Ziv's Law
│   └── Use Cases          → text · flows · actors · use case diagram (except non-functional)
├── Ethics (ACM)           → 8 principles · Public First
├── Architecture           → principal decisions · components/connectors/configuration · prescriptive vs descriptive · erosion
│   └── 6 styles           → MVC · Client-Server · Layered · P2P · Pipe-Filter · Pub-Sub
├── Design + UML           → 6 approaches · think/talk/prescribe · abstraction · class diagram/relationships · cohesion & coupling
├── User-Centered UCD      → 8 methods · Nielsen's 10 heuristics
├── Testing                → V&V · IEEE chain · levels · black-box (EP/BVA) · white-box (CFG/coverage) · Dijkstra
└── Process Models         → Build-Fix · Waterfall · Prototyping · Incremental · Spiral · RUP · XP · Agile
```

> **One-line summary**: Software engineering = *the process of building a set of related models to represent the system-to-be* — from "what to build (requirements/use cases)," to "how to structure it (architecture/design/UML)," to "how to fit the user (UCD)," to "how to know it works (testing)," to "what process to follow (process models)," looping back throughout to fundamentals like **rigor, separation of concerns, and anticipation of change.**

---

*Notes based on: INF 43 Lectures 1–19 (slides) + Quizzes 1–8 (including the Practice Final) + attendance quizzes. Diagrams taken from the course slides; the architectural-style diagrams and the IEEE chain were redrawn based on the course content. Good luck on the exam! 💪*