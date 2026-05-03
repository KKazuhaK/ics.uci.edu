# Informatics 43 — Week 5 Lecture Notes

> Covers **Lecture 9 & Lecture 10**: *"How do we structure the software in detail? (Parts 1 & 2)"*

## Table of Contents

1. [From Architecture to Design — Where Lecture 9 Begins](#1-from-architecture-to-design--where-lecture-9-begins)
2. [What Software Design Is](#2-what-software-design-is)
3. [Design Phase of Software Engineering](#3-design-phase-of-software-engineering)
4. [Software Design Goals and Activities](#4-software-design-goals-and-activities)
5. [Six Approaches to Software Design](#5-six-approaches-to-software-design)
6. [Designs and Models — What They Look Like](#6-designs-and-models--what-they-look-like)
7. [Purpose of Designs: Think, Talk, Prescribe](#7-purpose-of-designs-think-talk-prescribe)
8. [Abstraction — The Core Move of SE](#8-abstraction--the-core-move-of-se)
9. [Design Notations and Languages (Lecture 10)](#9-design-notations-and-languages-lecture-10)
10. [UML Class Diagrams](#10-uml-class-diagrams)
11. [Relationships Between Classes](#11-relationships-between-classes)
12. [Other UML Diagrams](#12-other-uml-diagrams)
13. [Other (Non-UML) Diagrams](#13-other-non-uml-diagrams)
14. [What Is Software Engineering? (Restated)](#14-what-is-software-engineering-restated)
15. [Design Principles — Cohesion, Coupling, Information Hiding](#15-design-principles--cohesion-coupling-information-hiding)
16. [Quiz 5 Study Guide](#16-quiz-5-study-guide)
17. [Wrap-Up and Memory Framework](#17-wrap-up-and-memory-framework)

---

## 1. From Architecture to Design — Where Lecture 9 Begins

Week 4 ended with **architecture**: the *principal*, system-shaping decisions, packaged as named **architectural styles** (MVC, client-server, layered, peer-to-peer, pipe-and-filter, publish-subscribe). It also closed with the reminder that **all successful software evolves**, and that architecture is the main tool we have to plan for that evolution.

Week 5 zooms one level **down**. Once the principal decisions are in place, *how do we structure the software in detail?* That is the design phase, and it covers everything from system-wide decisions (which language, which libraries, which protocols) all the way down to individual classes, methods, and screen layouts.

The progression we are building up is now:

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture} \;\longrightarrow\; \textbf{Design (in detail)} \;\longrightarrow\; \textbf{Code}}$$

---

## 2. What Software Design Is

### 2.1 Design = all the creative decisions; architecture is a subset

A useful mental picture: **design decisions** form a big set, and **architectural decisions** are a *subset* of them — specifically, the ones important enough to be called *principal*.

| Layer | Scope | Examples |
|------|------|------|
| **Architectural decisions** | The "principal" subset | Style, components, connectors, configuration |
| **Design decisions (whole)** | Everything creative about how the system is built | Architecture *plus* every smaller decision |

Both layers cover the same four aspects of the system:

| Aspect | What it captures |
|------|------|
| **Structure** | How the system is divided into parts |
| **Behavior** | How those parts act over time |
| **Interaction** | How the parts communicate |
| **Non-functional properties** | Performance, scalability, security, reliability, etc. |

> The word **"principal"** is what distinguishes architecture from design. Architecture is the small core of decisions that shape everything else; design is the whole iceberg, including those decisions and all the smaller ones beneath them.

---

## 3. Design Phase of Software Engineering

Design fits into the classic waterfall picture as the step between requirements and implementation:

```
Requirements (what)  →  Design (how)  →  Implementation  →  Verification  →  Maintenance
```

The mental shorthand worth memorizing:

$$\boxed{\textbf{Requirements} = \textit{what} \quad\quad \textbf{Design} = \textit{how}}$$

Design is where we commit to a *way* of satisfying the requirements — it is the bridge between "the system shall do X" and the actual code that does X.

---

## 4. Software Design Goals and Activities

Design is **not a single act**. It is a mix of two kinds of work, one big-and-upfront and one small-and-iterative.

### 4.1 System-wide decisions

Decisions that apply to the whole system and are usually made early:

- Architecture (style, components, connectors)
- Programming language(s)
- Libraries and frameworks
- Platforms (web, mobile, desktop, embedded)
- Communication protocols (HTTP, gRPC, MQTT, …)

### 4.2 Lower-level decisions, made *iteratively*

The bulk of design work is small, repeated cycles of:

1. **Studying the problem** — understanding the requirement or sub-problem at hand
2. **Identifying solutions** — sketching candidate designs
3. **Creating abstractions** — picking the structures, classes, screens, or data formats
4. **Evaluating** — checking the candidate, then iterating

> Design is not "decide once, write code forever." It is loops within loops: a high-level loop for system-wide choices, and many small loops at the module, class, and UI level. The word *iterative* shows up in this lecture as much as it did in the architecture lecture.

---

## 5. Six Approaches to Software Design

The course identifies **six approaches** (the same six the Quiz asks about). Each one is a different *lens* — a different way to break the system down so the design problem becomes tractable.

| # | Approach | What it breaks the system down by |
|---|------|------|
| 1 | **Software architecture** | Principal/structural decisions (Week 4) |
| 2 | **Functional decomposition** | Functionality |
| 3 | **Relational database design** | Data |
| 4 | **Object-oriented design and UML** | Entities in the domain + the functionality of each |
| 5 | **User interface design** | The user-facing screens, iterated |
| 6 | **Sketching** | Free-form drawing (covered in Lecture 10) |

### 5.1 Functional decomposition

Build a tree of functionality, root to leaves. Example from the slides — an "Achieve" goal-tracking app:

```
0. Achieve
├── 1. Authenticate
│   ├── 1.1 Login
│   └── 1.2 Logout
├── 2. Goal Setting
│   ├── 2.1 Create goal
│   ├── 2.2 Edit goal
│   ├── 2.3 Delete goal
│   └── 2.4 Mark goal complete
└── 3. Messaging
    ├── 3.1 View message
    ├── 3.2 Send message
    └── 3.3 Delete message
```

> Design process driven by *breaking down the functionality*. Useful when the system's identity is best captured as "the set of things it can do."

### 5.2 Relational database design

Design process driven by *breaking down the data*. The system is described in terms of **tables**, the **columns** in those tables, and the **keys** that link them together (e.g. a `Publishers` table, an `Authors` table, and a `Books` table joined by `PubID` and `AuthorID`).

> Useful when the system's identity is best captured as "the data it stores and the relationships between that data."

### 5.3 Object-oriented design and UML

- An **object** contains both **data** and **methods**.
- A **class** is a **blueprint for making objects**.

Design process driven by *breaking down the entities in the domain and the functionality that accompanies each entity*. The **Student / Enrollment / Seminar / Professor** UML diagram in the slides is the canonical example — each real-world thing becomes a class with its own attributes (data) and operations (methods), connected to other classes by relationships.

> Useful when the system is best captured as "a collection of interacting things."

### 5.4 User interface design

Design process driven by *envisioning the user interface and iterating*. Mockups and wireframes (sometimes hand-drawn, sometimes done in tools like **InVision** or **Balsamiq**) are the design artifact, and each round of iteration tightens the UI.

> Useful when the system is best captured as "what the user sees and does."

### 5.5 Sketching

The most informal approach — pencil/whiteboard drawings used to explore ideas quickly. Covered in more depth in Lecture 10 as one of the "other diagrams."

---

## 6. Designs and Models — What They Look Like

Lecture 9 spends several slides showing what *designs* actually look like in practice. The point of these slides is to broaden the student's mental image of "design" beyond just code-like artifacts:

| Type | Examples shown in lecture |
|------|------|
| **Sketches** | Hand-drawn napkins, notebook pages with rough shapes and arrows |
| **Physical models** | 3D architectural models of buildings and city blocks |
| **Blueprints** | Floor plans of a building (rooms labeled, dimensions marked) |
| **Whiteboard models** | A wall of multi-color whiteboard drawings — boxes, arrows, equations, all over a panoramic shot |
| **UML class diagrams** | Formal boxes-with-three-sections-and-arrows |

> The pattern: a design is **any external representation of the structure or behavior of the system-to-be**. It can be a doodle or a precise UML diagram. They are all on the same spectrum.

---

## 7. Purpose of Designs: Think, Talk, Prescribe

There are **three** reasons designers produce designs, and a fourth meta-property they all share.

| Purpose | What the design is for |
|------|------|
| **Designs to think** | An aid to the designer's own reasoning — putting the system on paper so the brain can manipulate it |
| **Designs to talk** | A shared artifact for discussing the system with teammates, customers, or other stakeholders |
| **Designs to prescribe** | A specification that tells implementers *exactly* what to build |

And the meta-property:

$$\boxed{\textbf{Designs are developed iteratively.}}$$

A design is rarely produced in one pass — it gets sketched, discussed, revised, and tightened across many iterations before becoming prescriptive enough to hand to implementers. The same design might *start* as a "to think" doodle, *become* a "to talk" diagram in a meeting, and *end up* as a "to prescribe" UML class diagram in the design document.

> Note for Quiz 5: the slide uses *think, talk, prescribe*, while the quiz study slide phrases it as *think, communicate, prescribe* — these mean the same thing. "Talk" and "communicate" are interchangeable here.

---

## 8. Abstraction — The Core Move of SE

### 8.1 What an abstraction is

$$\boxed{\textbf{Abstraction} = \text{removing irrelevant information and retaining/highlighting the relevant information}}$$

Every design notation we use — UML class diagrams, ER diagrams, mockups, pseudo code, architecture diagrams — is a way of **abstracting**. Each notation throws away certain things and emphasizes others.

### 8.2 Every notation has its own abstraction

| Notation | What it highlights | What it abstracts away |
|------|------|------|
| Functional decomposition tree | What the system **does** | Data, classes, screens |
| Relational schema | The **data** and its relationships | Behavior, screens |
| UML class diagram | **Entities** and their static relationships | Time, dynamic behavior, UI |
| UI mockup | What the user **sees** | Internal logic, data layout |
| Architecture diagram | High-level **components and connectors** | Internal class structure, code |
| Code | Every executable detail | Nothing — but you can't see the forest |

> No single notation captures everything. Different design problems call for different notations, which is why designers learn many.

### 8.3 The big claim

> **Software engineering is all about constructing and elaborating abstractions/models.**

This is the punchline of Lecture 9 and reappears in Lecture 10 as: *"Software engineering is the process of building a set of related models that represent the system-to-be."* When the course says SE is about models, it means **a set of related models** — not one master diagram, but several, each abstracting a different aspect.

---

## 9. Design Notations and Languages (Lecture 10)

Lecture 10 reframes the design phase by stepping back and asking: *what languages do we use at each stage of software development?*

### 9.1 Different languages for different stages

| Stage | Language |
|------|------|
| **Requirements** | English (or another natural language) |
| **Design** | **Diagrams / UML** |
| **Coding / Testing** | Java, Python, etc. |

> Design notations are the *language of the design phase* — they sit between English and code on the spectrum of precision. Diagrams are precise enough to support reasoning but loose enough to discuss with non-programmers.

### 9.2 Why notation matters

The lecture quotes A.N. Whitehead (1911):

> *A good notation relieves the brain of unnecessary work and frees it to concentrate on more advanced problems.*

The takeaway: **a good notation is not a cosmetic choice** — it is part of how the designer thinks. UML, ER diagrams, mockups, and pseudocode are all attempts to provide notation that lets the designer reason at the right level of abstraction.

---

## 10. UML Class Diagrams

### 10.1 What UML is

**UML (Unified Modeling Language)** is the **industry standard** for software design and modeling. It is a *family* of diagram types, each capturing a different aspect of the system:

- **Class diagrams** — structure (the focus of Lecture 10)
- **Activity diagrams** — workflow / control flow
- **Sequence diagrams** — interactions over time
- **Use case diagrams** — actors and their interactions with the system
- … and more

### 10.2 What a class diagram is for

A UML class diagram is used in **decomposing a system into modules known as classes**. Typical uses:

- **Model domain concepts** (the entities in the problem space)
- **Create a detailed, object-oriented design** of the code to be implemented

### 10.3 The class box

A class is drawn as a box with **three compartments**:

| Compartment | Contains |
|------|------|
| Top | Class name |
| Middle | Attributes (data fields), with type |
| Bottom | Operations (methods), with parameters and return type |

**Visibility markers:**

| Symbol | Meaning |
|------|------|
| `+` | **public** |
| `−` | **private** |

> **Both visibility markers (`+` / `−`) and return types are *optional* in UML notation.** It is common to see class diagrams where some or all of these are omitted — especially during early/informal design when the goal is just to communicate structure. They get filled in as the diagram becomes more *prescriptive*.

Generic template:

```
+-----------------------------------------+
|              Class Name                 |
+-----------------------------------------+
| -attribute : Type                       |
| -attribute : Type                       |
+-----------------------------------------+
| +operation(parameter) : ReturnType      |
| +operation(parameter) : ReturnType      |
+-----------------------------------------+
```

![Canonical three-section UML class box: name on top, attributes (with types) in the middle, operations (with parameters and return types) at the bottom.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/uml-class-box-template.png)

### 10.4 Translation to code — `Airplane` example

UML class:

```
+--------------------------+
|        Airplane          |
+--------------------------+
| - speed : int            |
+--------------------------+
| + getSpeed() : int       |
| + setSpeed(int) : void   |
+--------------------------+
```

Equivalent Java:

```java
public class Airplane {
    private int speed;

    public Airplane(int speed) {
        this.speed = speed;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }
}
```

Using it:

```java
Airplane a = new Airplane(5);
a.setSpeed(10);
System.out.println("" + a.getSpeed());
```

![Airplane class diagram alongside its Java code: the attribute -speed:int translates to private int speed, and operations +getSpeed():int / +setSpeed(int):void map directly to public methods.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/airplane-class-to-code.png)

> Notice the direct mapping: the `−` becomes `private`, the `+` becomes `public`, attributes become fields, operations become methods, and parameter / return types map straight across. This is why UML class diagrams are so commonly used in OO design — they translate to code almost mechanically.

### 10.5 Prescriptive vs. Descriptive UML — connection back to Week 4

The **prescriptive vs. descriptive** distinction from Week 4 (architecture) applies to UML class diagrams too:

| Perspective | Where the diagram comes from |
|------|------|
| **Prescriptive** UML | Drawn by the *designer* before code is written — the *intended* class structure |
| **Descriptive** UML | **Auto-generated from the existing code** by a tool — the *actual* class structure |

Tools that read source code and produce UML class diagrams ("reverse engineering") let teams **compare prescriptive against descriptive** to detect **design erosion** — exactly analogous to architectural erosion. If the descriptive diagram has classes, fields, or relationships that the prescriptive one does not (or vice versa), the implementation has drifted from the design.

> The same prescriptive/descriptive lens that applies at the architectural level applies one zoom-in further, at the class-design level. Erosion is not just a Week-4 phenomenon — it shows up wherever a planned model has to keep up with evolving code.

---

## 11. Relationships Between Classes

Classes never live in isolation. UML defines several relationship types; the four the lecture covers are **inheritance, association (with multiplicity), aggregation, and composition**.

### 11.1 Inheritance

Drawn as a **hollow triangle arrow** pointing from the child class to the parent class. The child inherits the parent's attributes and methods, and can add its own.

Example: `Hippo` inherits from `Animal`. `Animal` has `food type`, `location`, `makeNoise()`, `eat()`, `roam()`. `Hippo` adds `submerged: boolean` and `submerge()`, and overrides `makeNoise()` and `eat()`.

```
        Animal
        ▲
        │  (inheritance)
        │
        Hippo
```

![UML inheritance: Hippo points to Animal via a hollow-triangle arrow, indicating Hippo is-a Animal — inheriting the parent's attributes and methods, overriding some (makeNoise / eat) and adding its own (submerged / submerge()).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/inheritance-hippo-animal.png)

### 11.2 Association

A plain line between two classes means the two classes are **connected** in some way. Associations can be enriched in three ways:

| Enrichment | What it adds |
|------|------|
| **Label** (e.g. `takes class from`) | A name describing the relationship |
| **Direction** (arrowhead) | Which class "knows about" the other |
| **Multiplicity** (numbers at each end) | How many of each class participate |

The lecture's running example uses **Student** and **Instructor**:

- A plain line = "Student is associated with Instructor"
- With `1...*` on the Student side and `1` on the Instructor side = "many students per one instructor"
- Two labels (`listens to` / `teaches`) = the relationship has a directional reading
- An arrow from Router to DomainNameServer = "Router knows about DNS, but DNS does not know about Router"

**Default conventions when annotations are missing:**

| If you see... | Default meaning |
|------|------|
| **No arrows** (plain line) | **Bidirectional** — both classes know about each other |
| **Arrow on one side only** | **Unidirectional** — only the source class knows about the target |
| **No multiplicity numbers** | **1-to-1** by default |
| **No label** | The association exists but is left unnamed |

> The defaults matter on quizzes: a plain undecorated line between two classes is *not* "no information given" — it specifically means **bidirectional 1-to-1**. Adding arrows or multiplicities is how you *narrow* the relationship from this default.

![Student / Instructor association variants: a plain "takes class from" labeled line, then a 1...* / 1 multiplicity ("one Instructor with many Students"), then directional `listens to` / `teaches` labels, and finally a Router → DomainNameServer arrow ("navigable in one direction only").](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/association-student-instructor.png)

### 11.3 Multiplicity

Multiplicity annotates the **endpoints** of an association line:

| Notation | Meaning |
|------|------|
| `1` | exactly one |
| `0..1` | zero or one (optional) |
| `*` or `0..*` | zero or more |
| `1..*` | one or more (at least one) |
| `2..5` | between two and five (inclusive) |

The lecture's six-row table:

| A — B | Reading |
|------|------|
| `A —— B` (no numbers) | One B with each A; one A with each B |
| `A 1 ←→ 1 B` | Same as above |
| `A 1 —— * B` | Zero or more Bs with each A; one A with each B |
| `A * —— * B` | Zero or more Bs with each A; ditto As with each B |
| `A 1 —— 2..5 B` | Two to five Bs with each A; one A with each B |
| `A —→ * B` | Zero or more Bs with each A; **B knows nothing about A** |

> The arrowhead is doing extra work in the last row: the relationship is **navigable in only one direction**. A holds references to its Bs, but B has no reference back to A.

![Six multiplicity examples: 1↔1 (bidirectional one-to-one), 1↔1 (numbered version), 1—* (one-to-many), *—* (many-to-many), 1—2..5 (one with two-to-five), —→* (directional, where the right side knows nothing about the left). Each row pairs A and B class boxes with endpoint numbers and connecting lines or arrows.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/multiplicity-examples.png)

### 11.4 Whole-Part: Aggregation

**Aggregation** = "one object **contains** (or is composed of) a set of other objects." Drawn with a **hollow diamond** on the *whole* end.

- Aggregation relationships are **transitive** (if A aggregates B and B aggregates C, then A aggregates C)
- Aggregation relationships are **asymmetric** (if A aggregates B, then B does not aggregate A)

Example: a `Crate` contains `Bottle`s. The bottles can exist outside the crate; the crate just *holds* them.

![Aggregation: hollow diamond on the whole's end. Crate aggregates Bottle — the crate "holds" the bottles, but bottles can exist independently of the crate.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/aggregation-crate-bottle.png)

### 11.5 Whole-Part: Composition

**Composition** = a *stronger* variant of aggregation that **adds existence dependency**. Drawn with a **filled (solid) diamond** on the whole end.

The defining property: **if the whole is destroyed, the parts are destroyed too**. The parts cannot exist independently.

Example: a `House` is composed of `Room`s. If the House is demolished, its Rooms cease to exist as well.

| Property | Aggregation (◇) | Composition (◆) |
|------|------|------|
| Whole "contains" parts | Yes | Yes |
| Parts can exist independently | Yes | **No** |
| Symbol | Hollow diamond | Filled diamond |

> The crate/bottle vs. house/room distinction is the standard way to remember this: bottles can leave the crate, rooms cannot leave the house.

![Composition: filled diamond on the whole's end. House composes Room — rooms cannot exist independently of the house; when the house is demolished, the rooms cease to exist.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/composition-house-room.png)

---

## 12. Other UML Diagrams

Besides class diagrams, the lecture briefly previews three other UML diagram types. These are not the focus of Quiz 5, but they show the breadth of UML.

### 12.1 Activity diagram

Like a flowchart of activities. The slide example shows an ATM:

```
Insert Card → Enter PIN → ◇ decision
                          │
                  [Invalid PIN] → Confiscate PIN
                  [Valid PIN]   → Display Menu → ●
```

Captures **control flow**: which activity follows which, where decisions branch.

![UML activity diagram for an ATM: flow goes Insert Card → Enter PIN → decision diamond. Invalid PIN leads to Confiscate Card; Valid PIN leads to Display Menu and onward to the end node (filled circle).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/activity-diagram-atm.png)

### 12.2 Sequence diagram

A grid of **lifelines** (vertical dashed lines, one per actor or system), with **horizontal arrows** showing messages exchanged between them in *time order* (top to bottom).

Captures **interactions over time**: who calls whom, in what order.

![UML sequence diagram example: each participant has a vertical (dashed) lifeline; horizontal arrows represent messages exchanged in time order (top to bottom), capturing "who calls whom, in what sequence."](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/sequence-diagram-example.png)

### 12.3 Use case diagram

**Stick-figure actors** on the outside, **labeled ovals** (use cases) inside a system boundary. Lines show which actor participates in which use case.

Captures **what users can do with the system**: e.g. for an airline, *Passenger* participates in *Check-In, Automated Check-In, Express Check-In, Boarding*; *Check-In Representative* participates in *Check-In*; etc.

![Airline use case diagram: a Passenger stick figure outside the system boundary participates in the Check-In, Automated Check-In, Express Check-In, and Boarding ovals; a Check-In Representative participates in Check-In.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/use-case-airline.png)

---

## 13. Other (Non-UML) Diagrams

UML is one design notation among many. The lecture explicitly walks through several **non-UML** notations to drive home the point that designers use whatever notation fits the problem.

| Notation | Captures | Typical tool/medium |
|------|------|------|
| **UI mockups** | What the user sees | Hand sketches, **Balsamiq**, Figma |
| **Pseudo code** | Algorithmic logic | Plain text with `Begin / Until / If / End` keywords |
| **Entity-Relationship (ER) diagram** | Data entities and their relationships | ER notation (rectangles for entities, diamonds for relationships, ovals for attributes) |
| **Architecture diagrams** | High-level components and connectors | Boxes-and-arrows (e.g. Mail Server ↔ Mail Server with SMTP, POP/IMAP) |
| **Storyboards** | A *sequence* of UI/usage moments, comic-strip style | Hand sketches or comic panels |
| **Sketches** | Anything, very loosely | Whiteboards, napkins |

> All of these — UML and non-UML alike — are *statements in a language with a syntax*. Each notation is the language; each diagram is a sentence in that language.

---

## 14. What Is Software Engineering? (Restated)

After walking through all of these notations, Lecture 10 restates the definition of SE:

$$\boxed{\textbf{Software engineering} = \text{the process of building a set of \textit{related models} that represent the system-to-be.}}$$

The key word is **related**. A real project produces **many** models — UML class diagrams, sequence diagrams, ER diagrams, architecture diagrams, UI mockups, pseudocode — and the engineer's job is to keep them **consistent with each other** and with the eventual code.

---

## 15. Design Principles — Cohesion, Coupling, Information Hiding

Two principles dominate the discussion of *good* design.

### 15.1 High Cohesion / Low Coupling

| Term | Definition |
|------|------|
| **Cohesion** | How tightly the elements *inside* a module belong together |
| **Coupling** | How strongly *separate* modules depend on each other |

The principle:

$$\boxed{\textbf{Aim for HIGH cohesion } (\text{group related things together})\textbf{ and LOW coupling } (\text{keep unrelated things apart}).}$$

Effects of getting this right:

- **Changes don't propagate.** A change inside one module stays inside that module instead of cascading through the system.
- **Reuse is facilitated.** A highly cohesive module does one thing well, which makes it pluggable into other systems.

The lecture's classic visualization: ten nodes labeled 1–10, partitioned into modules A, B, C.

| Bad design ☹ | Good design ☺ |
|------|------|
| **Low cohesion** — related nodes are spread across several modules | **High cohesion** — related nodes are grouped in the same module |
| **High coupling** — many lines cross module boundaries | **Low coupling** — few lines cross module boundaries |

![Cohesion vs. coupling visual contrast: left side shows low cohesion / high coupling — nodes 1–10 scattered across modules A, B, C with many cross-module lines; right side shows high cohesion / low coupling — related nodes grouped within the same module with few cross-module lines.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/cohesion-coupling.png)

### 15.2 Information Hiding

**Information hiding** = hiding the design decisions that are most likely to change, so that other parts of the program are protected from those changes.

The slide quotes a definition that is worth memorizing:

> *Showing only those details to the outside world which are necessary for the outside world, and hiding all other details from the outside world.*

The connection to coupling is direct: information hiding is a *technique* for reducing coupling. If module A only exposes a small public interface, module B can only depend on that interface — not on A's internals — so A's internals are free to change without breaking B.

### 15.3 Why these principles matter

Both principles serve the **anticipation of change** principle from Week 1:

| Principle (Week 5) | Serves (Week 1) |
|------|------|
| High cohesion / low coupling | Anticipation of change, reuse, separation of concerns |
| Information hiding | Anticipation of change, abstraction |

---

## 16. Quiz 5 Study Guide

You should know and understand:

- **The six approaches to software design**
  - Software architecture
  - Functional decomposition
  - Relational database design
  - Object-oriented design (and UML)
  - User interface design
  - Sketching
  - For each: know what it breaks the system down by

- **Purposes of designs**
  - **Think** — aid the designer's own reasoning
  - **Communicate** (a.k.a. *talk*) — share with stakeholders/teammates
  - **Prescribe** — specify what implementers must build
  - And: designs are developed *iteratively*

- **Abstraction**
  - Remove irrelevant info, retain/highlight relevant info
  - Every design notation supports a particular kind of abstraction
  - SE = constructing and elaborating abstractions/models

- **Diagrams**
  - **UML class diagrams**: class boxes (name / attributes / operations), `+` public, `−` private, mapping to code
  - **Associations**: lines, labels, direction (arrowheads), multiplicity
  - **Multiplicities**: `1`, `0..1`, `*`, `0..*`, `1..*`, `2..5`
  - **Aggregation** (hollow diamond) vs **Composition** (filled diamond, adds *existence dependency*)

- **Design principles**
  - **High cohesion / low coupling** — what each means, and why both matter (changes don't propagate, reuse facilitated)
  - **Information hiding** — hide what's likely to change; expose only what's necessary

---

## 17. Wrap-Up and Memory Framework

```text
Week 5 knowledge structure
|
+-- Where we are
|   +-- Requirements (what)  -> Architecture  -> Design (how)  -> Code
|   +-- Design = ALL creative decisions; architecture is the
|       "principal" subset
|   +-- Design covers: structure, behavior, interaction,
|       non-functional properties
|
+-- Goals/activities of design
|   +-- system-wide decisions (architecture, language, libraries,
|   |                          platforms, protocols)
|   +-- iterative lower-level loop:
|       study problem -> identify solutions -> create abstractions
|       -> evaluate -> repeat
|
+-- Six approaches to software design
|   +-- 1. Software architecture            (Week 4)
|   +-- 2. Functional decomposition         -> break down FUNCTIONALITY
|   +-- 3. Relational database design       -> break down DATA
|   +-- 4. Object-oriented design + UML     -> break down ENTITIES + their FUNCTIONALITY
|   +-- 5. User interface design            -> envision UI, iterate
|   +-- 6. Sketching                        -> free-form, fast, informal
|
+-- Designs / Models
|   +-- can be: sketches, physical models, blueprints,
|   |           whiteboard scribbles, UML diagrams
|   +-- purposes: think | talk (communicate) | prescribe
|   +-- always developed ITERATIVELY
|
+-- Abstraction
|   +-- = remove irrelevant info, retain relevant info
|   +-- every design notation supports a kind of abstraction
|   +-- SE = constructing & elaborating abstractions/models
|
+-- Design notations / languages
|   +-- Requirements -> English
|   +-- Design       -> Diagrams / UML
|   +-- Coding       -> Java, Python, ...
|   +-- Whitehead: good notation frees the brain
|
+-- UML
|   +-- industry standard
|   +-- class diagrams, activity diagrams, sequence diagrams,
|       use case diagrams, ...
|
+-- UML class diagrams
|   +-- 3-compartment box: name | attributes | operations
|   +-- visibility: + public, - private
|   +-- mechanical mapping to code (Airplane example)
|
+-- Relationships between classes
|   +-- Inheritance     (hollow triangle: child -> parent)
|   +-- Association     (line; can have label, direction, multiplicity)
|   |   +-- multiplicity: 1, 0..1, *, 0..*, 1..*, 2..5
|   +-- Aggregation     (hollow diamond on the whole)
|   |   +-- transitive + asymmetric
|   |   +-- parts can exist independently  (crate / bottle)
|   +-- Composition     (filled diamond on the whole)
|       +-- variant of aggregation
|       +-- adds EXISTENCE DEPENDENCY  (house / room)
|
+-- Other UML diagrams
|   +-- Activity   (control flow)
|   +-- Sequence   (interaction over time)
|   +-- Use case   (actors x system functions)
|
+-- Other (non-UML) diagrams
|   +-- UI mockups (Balsamiq)
|   +-- Pseudo code
|   +-- ER diagrams
|   +-- Architecture diagrams
|   +-- Storyboards
|   +-- Sketches
|
+-- "What is SE?" (restated)
|   +-- the process of building a set of RELATED MODELS
|       that represent the system-to-be
|
+-- Design principles
|   +-- High cohesion (group related)
|   |   /  Low coupling (separate unrelated)
|   |   -> changes don't propagate
|   |   -> reuse is facilitated
|   +-- Information hiding
|       -> hide decisions most likely to change
|       -> expose only what the outside world needs
|       -> serves anticipation of change
```

### One-sentence summary

> Design is the *how* to requirements' *what* — it is the iterative production of a set of related models (UML class/activity/sequence/use-case diagrams, ER diagrams, UI mockups, pseudocode, sketches, architecture diagrams) that abstract different aspects of the system-to-be, where each notation supports a different kind of abstraction; UML class diagrams (with `+`/`−` visibility, associations with multiplicity, inheritance, and aggregation vs. composition) are the workhorse for object-oriented structure, and the whole effort is judged by how well it achieves **high cohesion / low coupling** and **information hiding** so that change can be absorbed without cascading.
