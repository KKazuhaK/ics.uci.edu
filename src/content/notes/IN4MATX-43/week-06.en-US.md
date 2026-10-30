---
title: "User-Centered Design and Usability"
summary: "How to make software that meets the user's needs: why usability matters, the eight user-centered design methods (interviews, personas, scenarios, storyboards, wireframes, design guidelines, heuristic evaluation, user testing), and Nielsen's ten heuristics."
---

# Informatics 43 — Week 6 Lecture Notes

> Covers **Lecture 11 & Lecture 12**: *"How do we make software that meets the user's needs? (Parts 1 & 2)"*

## Table of Contents

1. [From Design to Users — Where Lecture 11 Begins](#1-from-design-to-users--where-lecture-11-begins)
2. [Why Usability Matters](#2-why-usability-matters)
3. [The Business Case for User-Centered Design](#3-the-business-case-for-user-centered-design)
4. [Usability Failures — A Gallery of Lessons](#4-usability-failures--a-gallery-of-lessons)
5. [Three Famous Quotes Worth Memorizing](#5-three-famous-quotes-worth-memorizing)
6. [Why Usability Engineering Is So Hard](#6-why-usability-engineering-is-so-hard)
7. [The Rise of the UX Designer](#7-the-rise-of-the-ux-designer)
8. [The Eight User-Centered Design Methods (Lecture 12)](#8-the-eight-user-centered-design-methods-lecture-12)
9. [Method 1: Interviews and Observations](#9-method-1-interviews-and-observations)
10. [Method 2: Personas](#10-method-2-personas)
11. [Method 3: Scenarios](#11-method-3-scenarios)
12. [Method 4: Storyboards](#12-method-4-storyboards)
13. [Method 5: Wireframes and Mockups](#13-method-5-wireframes-and-mockups)
14. [Method 6: Design Guidelines](#14-method-6-design-guidelines)
15. [Method 7: Heuristic Evaluation (Nielsen)](#15-method-7-heuristic-evaluation-nielsen)
16. [Method 8: User Testing](#16-method-8-user-testing)
17. [Quiz 6 Study Guide](#17-quiz-6-study-guide)
18. [Wrap-Up and Memory Framework](#18-wrap-up-and-memory-framework)

---

## 1. From Design to Users — Where Lecture 11 Begins

Week 5 closed with **design principles** — high cohesion, low coupling, information hiding — and the broader claim that *software engineering is the process of building a set of related models that represent the system-to-be*. Those models capture **structure, behavior, interaction, and non-functional properties** of a system.

Week 6 adds the missing piece: a system can be perfectly factored, beautifully decoupled, and architecturally pristine, and **still be unusable**. The question this week is therefore one zoom out from "how is the system structured?" to:

$$\boxed{\textbf{How do we make software that meets the } \textit{user's} \textbf{ needs?}}$$

The progression we are building up is now:

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture} \;\longrightarrow\; \textbf{Design (in detail)} \;\longrightarrow\; \textbf{User-Oriented Methods} \;\longrightarrow\; \textbf{Code}}$$

Lecture 11 motivates **why** user orientation (usability) matters. Lecture 12 walks through **eight** user-centered design methods that the rest of the quarter will build on.

---

## 2. Why Usability Matters

The lecture opens with a deliberately mixed image set — an MRI machine, a power-plant control wall, an airliner cockpit — to make a single point: usability is not a "nice to have" decoration on top of *important* software, it is **embedded in the consequences of using that software**. A misread switch on a cockpit panel or a confusing button on an MRI console is not a UI bug; it is a safety event.

The Obama '08 campaign example reinforces the same idea in a much lower-stakes domain. The team A/B-tested two homepage variants that differed on **two** dimensions — the hero image (a portrait of Obama vs. a family photo) and the call-to-action button (`SIGN UP` vs. `LEARN MORE`). The family-photo + `LEARN MORE` variant **lifted sign-ups by roughly 40%**, which the campaign later estimated as on the order of **$60M in additional contributions**. The same logic that applies in life-critical systems applies in marketing: **how the interface looks and is worded changes what users do**.

![Two A/B-tested Obama '08 homepage variants: the left version has a red "SIGN UP" button under a hero portrait of Obama; the right version has a "LEARN MORE" button under a family photo. Same campaign, same email-and-zip form — the only differences are the image and the CTA wording, and that combination measurably changed conversion (≈40% more sign-ups, ≈$60M more donations).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/obama-08-ab-test-signup-vs-learnmore.png)

> The takeaway is not "usability is about pretty buttons." It is that **the user's behavior is part of the system**. Designing without considering that behavior is designing only half the system.

---

## 3. The Business Case for User-Centered Design

The lecture lists five payoffs of doing user-centered design (UCD) right:

| Payoff | What it means in practice |
|------|------|
| **Simple** | UCD techniques (interviews, personas, mockups, heuristic checks) are not exotic — most are pen-and-paper |
| **Inexpensive** | The methods are dramatically cheaper than redesigning a shipped product |
| **Higher sales** | Usable products convert more first-time visitors into paying customers |
| **Higher satisfaction** | Users complete tasks without frustration |
| **Higher efficiency** | Users complete tasks faster, with fewer errors |

Lecture 11's closing summary slide collapses this list into a four-bullet payoff: **sales increase, performance increases, traffic counts increase, frustration decreases** — and the punchline, *"it's all about the user."*

A subtler point the slide makes:

> The benefit of UCD shifts over time **from conversion (first-time customers) to loyalty (repeat customers)**. Early on, good UX wins users. Later, good UX *keeps* them.

But despite all of this, **the methods are often not used**. The rest of Lecture 11 shows what happens when they aren't.

---

## 4. Usability Failures — A Gallery of Lessons

Lecture 11 catalogs a series of real-world usability failures. They are funny, but each one encodes a lesson that maps directly onto a Nielsen heuristic from Lecture 12.

| Failure example | What went wrong | Heuristic violated |
|------|------|------|
| Printer message: *"There is no help available for this"* | Help system promises help, then refuses to give any | Help and documentation |
| HP printer: *"PC LOAD LETTER"* | Cryptic error message — engineer's language, not user's | Match system to real world |
| Warning dialog: *"Proceeding with Delete will erase your hard drive. [Proceed] [Delete]"* | Both buttons sound identical and dangerous | Error prevention; user control |
| ATM kiosk with **"Yes"** and **"No"** labels misaligned with the physical buttons | Touch labels don't match button positions | Consistency; match real world |
| Marriott hotel system — green-on-black 1980s mainframe interface | A multi-billion-dollar company still running unusable legacy software | Multiple — minimalist design, recognition over recall |
| UI Generator with `cr_int_sprd`, `tax_on_dr_int` field names | Internal abbreviations leaked into the user-facing UI | Match system to real world |
| Office 97 macros warning vs. Office 2010's slim banner | Old version interrupted with a wall of text; new version uses a small banner with progressive disclosure | Minimalist design |
| **Hawaii false missile alert (2018)** | Operator picked the wrong item from a poorly-labeled list (`PACOM (CDW) - STATE ONLY` vs `DRILL-PACOM (DEMO) STATE ONLY`); a real alert went out by mistake | Error prevention; recognition over recall; visibility of status |
| Two urinals plumbed into a corner so close their users would face each other | Physical UX, not software — but the principle is identical | Designer didn't think about the actual use context |

A few of these are worth seeing rather than just reading about — the funny ones encode the heuristic violation more vividly than any prose description.

![A Windows XP "Warning" dialog: red X icon, message "Proceeding with the operation 'Delete' will erase the contents of your hard drive. What do you wish to do?" — and **two buttons that both sound dangerous**, labeled `Proceed` and `Delete`. The user has no clear safe option.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-proceed-or-delete-dialog.png)

![Photo of an ATM kiosk: the on-screen prompt says "WANT RECEIPT? YES OR NO" but the physical Yes/No buttons on the bezel are positioned so the labels don't line up with them — the user has to guess which side is "Yes." Consistency / match-real-world fail.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-atm-yes-no-mismatch.jpg)

![Office 97 vs. Office 2010 macros warning. Office 97 (top) interrupts the user with a wall-of-text Warning dialog, three confusingly similar buttons (`Disable Macros` / `Enable Macros` / `Do Not Open`), and a checkbox. Office 2010 (bottom) replaces the whole thing with a slim yellow Security Warning banner and a single `Enable Content` button — minimalism + progressive disclosure.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-office-97-vs-2010-macros.png)

![The Hawaii false-missile-alert dropdown (2018). The "State EOC" submenu lists, in plain text, several almost-identical items: `1. TEST Message`, `DRILL-PACOM (DEMO) STATE ONLY`, `False Alarm BMD (CEM) - STATE ONLY`, `Monthly Test (RMT) - STATE ONLY`, `PACOM (CDW) - STATE ONLY`. The operator picked the real alert by mistake — recognition / error-prevention fail with real consequences.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-hawaii-missile-alert-dropdown.jpg)

Then the contrast slide:

| "Typical Apple product" | "A Google product" | "Your company's app" |
|------|------|------|
| One word: **Touch** | One field, one button: **Find** | Forty fields, twelve buttons, color-coded chaos (`SSN`, `FT/PT`, `TQP STAT`, `CAT CD`, …) |

![Three boxes labeled "Typical Apple product…", "A Google product…", and "Your company's app…". Apple shows a screen with the single word "TOUCH"; Google shows a single search field with one button "FIND"; the company app shows a dense form with a dozen cryptic abbreviations (`SSN`, `FT/PT`, `TQP STAT`, `CAT CD`, …) and a wall of buttons (`OKAY`, `APPLY`, `SAVE`, `UNDO`, `HELP`, `DELETE`, `EDIT`, `SELECT`, `BROWSE`, `ERRORS`).](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/first-impressions-apple-google-vs-app.png)

The point: **first impressions matter**. The same task — let the user start using the product — looks like one button on Apple's screen, one search box on Google's, and a wall of cryptic acronyms on the typical enterprise app. Users decide in seconds whether the product is worth learning.

---

## 5. Three Famous Quotes Worth Memorizing

The lecture quotes three definitions of "good UI" that capture the spirit of the whole week:

> **"A user interface is well-designed when the program behaves exactly how the user thought it would."**
> — Joel on Software

> **"A GUI should provide GUIdance!"**
> — hallofshame.gp.co.at

> **"Focus on the user, and all else will follow."**
> — Google

The first quote is the operational definition: usability = match between **the user's mental model** and **the program's behavior**. The second is the design directive: an interface should actively *guide* the user through the task. The third is the strategic principle: get the user right and other concerns (sales, efficiency, retention) take care of themselves.

---

## 6. Why Usability Engineering Is So Hard

If UCD pays off and the methods are simple and cheap, why is good usability still rare? Lecture 11 gives two reasons:

### 6.1 Usability draws on disciplines outside of CS

| Discipline | What it contributes |
|------|------|
| **Psychology** | How people perceive, attend, and remember |
| **Cognitive science** | How people form mental models and make decisions |
| **Aesthetics** | What feels balanced, clean, and trustworthy |
| **Art** | Composition, color, typography |

A traditional CS curriculum trains *none* of these well. Software engineers are equipped to reason about correctness and performance, not about color contrast or working-memory limits.

### 6.2 The audience problem

$$\boxed{\textbf{Software engineers are generally } \textit{not} \textbf{ the audience of the software they develop.}}$$

The engineer's intuitions about "what's obvious" are calibrated on engineers, not on the actual users — accountants, doctors, drivers, schoolchildren, retirees. Designing well for a user you don't resemble requires *deliberate methods* to bridge the gap. That is exactly what Lecture 12's eight methods provide.

---

## 7. The Rise of the UX Designer

Because usability draws on so many fields outside CS, a separate role has emerged:

| Visual / craft skills | Process / research skills |
|------|------|
| Drawing | Programming |
| Color theory | Information architecture |
| Design basics | Research |
| Typography | Human behavior |
| Logic | User testing |
| Art | Ideation |
| History | Prototyping |
| Anthropology | Communication |
| Math | Collaboration |

> The UX designer sits at the intersection of art, social science, and engineering. Software engineers are not expected to *be* UX designers, but they are expected to **work with** them and to apply the basic UCD methods themselves on smaller projects.

---

## 8. The Eight User-Centered Design Methods (Lecture 12)

Lecture 12 introduces the **eight** user-centered design methods that the rest of the unit will treat one by one. Memorize this list — the quiz study guide explicitly calls for "the 8 user-centered design methods."

| # | Method | One-line role |
|---|------|------|
| 1 | **Interviews and observations of end users** | Find out what users actually do |
| 2 | **Personas** | Compress user research into memorable archetypes |
| 3 | **Scenarios** | Narrative descriptions of a persona using the system |
| 4 | **Storyboards** | Comic-strip visualizations of scenarios |
| 5 | **Wireframes and Mockups** | Low-fidelity drawings of the actual UI |
| 6 | **Design guidelines** | Reusable rules and components for visual consistency |
| 7 | **Heuristic Evaluation** | Expert review against a checklist of usability principles |
| 8 | **User testing** | Real users, real tasks, observed performance |

The methods roughly progress from **understanding users → describing them → drawing the system → evaluating the design**. They are not strictly sequential — most projects loop back through several of them as the design matures.

---

## 9. Method 1: Interviews and Observations

The first method is also the most basic: **go talk to and watch real users**. The lecture's images make the point — pilots in cockpits, air-traffic controllers in towers, analysts at multi-monitor workstations, dispatchers in operations centers. Each environment has its own constraints (lighting, noise, time pressure, multitasking) that you cannot guess at from a desk.

| Activity | What it produces |
|------|------|
| **Interviews** | Direct verbal data — what users say they do, want, and struggle with |
| **Observations** | Indirect behavioral data — what users *actually* do, including things they don't mention in interviews |

> The two complement each other. Interviews capture intent and frustration; observations catch the workarounds and habits users no longer notice they have.

---

## 10. Method 2: Personas

A **persona** is a fictional, concrete archetype of a user — built from interview/observation data — that the design team can refer to throughout the project ("would Blake do this?").

### 10.1 What a persona contains

The MyFlix examples (Blake, Carrie) and the OpenMoko examples (John "The Greenhorn", Emily "The Casual User", Akiko "The Texter", Stephan "The Business User", Roberto "The Power User", Ricky "The Hacker") share a consistent structure:

![Blake — MyFlix Content Consumer persona card. Photo of Blake in a printed T-shirt and glasses; demographics column on the left (Age 27, Male, Single, no children, Bachelors in Software Engineering, Programmer). Right column: a quote ("I'm so excited that a new independent theater opened up. I'm going to tweet my friends about it."), bio ("Blake is a Sci-Fi buff and also likes independent and edgy films and TV shows…"), Goals (keep in touch with like-minded friends, discover new content, share opinions), Tasks (watches unique shows with friends, shares opinions on social media, works at a software company), Technical Skill ("very familiar with how apps typically work and uses several gadgets"), and Environment ("uses his iPhone during his commute and watches TV in his apartment").](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/persona-blake-myflix-consumer.jpg)

| Section | Contents |
|------|------|
| **Photo and name** | Makes the persona feel like a person, not a spreadsheet row |
| **Demographics** | Age, gender, marital status, children, education, occupation |
| **Quote** | A short first-person line capturing their voice |
| **Bio / profile** | One paragraph of who they are and what they care about |
| **Goals** | What they want to accomplish (with the product and in life) |
| **Tasks** | Specific things they do |
| **Technical skill** | Their comfort with the relevant technology |
| **Environment** | Where and when they use the product |

### 10.2 Why personas work

A list of "user requirements" is abstract; a persona is concrete. When a designer asks *"would Blake (27, programmer, sci-fi buff, watches TV with friends) actually click this?"*, the answer comes more sharply than it does for *"would the user click this?"*. Personas make the user **specific enough to argue with**.

### 10.3 Personas come in sets

Real systems have multiple user types. The MyFlix project, for instance, distinguishes:

- **Blake** — content consumer (the customer)
- **Carrie** — application administrator at a movie studio (a back-office user)

A complete persona set covers every meaningfully different user role. The OpenMoko set goes further with six personas spanning the full spectrum from non-technical (Greenhorn) to deeply technical (Hacker), so that no design decision accidentally optimizes for only one slice of the audience.

---

## 11. Method 3: Scenarios

A **scenario** is a short *narrative* describing a specific persona using the system to accomplish a specific goal. It is written in plain English, in the third person, in a present-tense storytelling voice.

### 11.1 Two MyFlix scenario examples

**Scenario 1: Joining MyFlix**

> *While Blake is searching the Internet to find out if there are any local theaters playing a newly released independent film, he finds the profile page for the film which is also released on MyFlix. Excited that he can watch it and similar films in the comfort of his apartment, he creates an account and begins paying the regular monthly fee. He accesses his account from his TV's browser and is able to stream the movie.*

**Scenario 2: Discovering Content**

> *Blake has some pretty specific tastes in films and TV shows. At work he browses through various categories on the MyFlix website and reads the reviews on some films in the categories he likes. Reading several summaries and recommendations that match his preferences, he adds these films to his ever growing queue, so later he can quickly pick something to watch.*

### 11.2 What scenarios accomplish

| Function | How |
|------|------|
| **Connects persona to system** | The persona stops being a static profile and starts *doing things* |
| **Surfaces requirements** | "Account creation," "queue," "TV browser support" — features fall out of the narrative |
| **Stays domain-neutral** | No buttons, no screens, no widgets — yet — just user goals and outcomes |

> A scenario is **persona + goal + context, written as a story**. It is the bridge from "who the user is" (persona) to "what we need to build" (mockups, requirements). Each persona usually has multiple scenarios, one per major goal.

---

## 12. Method 4: Storyboards

A **storyboard** is the *visual* version of a scenario — a sequence of comic-strip panels, each showing one moment in the user's experience, often with handwritten captions and speech/thought bubbles.

### 12.1 What a storyboard panel typically contains

| Element | Purpose |
|------|------|
| **Drawing of the scene** | The user, the device, the environment |
| **Speech bubbles** | What characters say |
| **Thought bubbles** | What the user is *thinking* (key for surfacing confusion) |
| **Caption** | A line of narration tying the panel to the next |

### 12.2 The B&Q shopping example

The lecture shows an eight-panel storyboard of "Sarah" using a paintbrush-styled checkout system at a B&Q hardware store: she enters and swipes her card, the device greets her by name, she scans paint, gets a "you may like…" suggestion, browses for a paintbrush, asks for help, gets help from a real person, then exits — *all that shopping and help, what a successful trip!* Each panel adds one beat to the narrative.

![An eight-panel hand-drawn comic storyboard of "Sarah" using a paintbrush-styled checkout system at a B&Q hardware store. Panel 1: she enters and swipes her loyalty card. Panel 2: device greets her by name. Panel 3: she scans paint and the device suggests a paintbrush. Panel 4: she goes to find one. Panel 5: she's confused, with a thought bubble "I do really need a paintbrush, I wonder where I can find it…". Panel 6: she asks a staff member, "Help?". Panel 7: the staff person helps her. Panel 8: she exits with the caption "all that shopping and help, what a successful trip!". The thought-bubble in panel 5 is the heart of the storyboard — it surfaces a moment of friction in the user experience.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/storyboard-bq-paintbrush-sarah.jpg)

### 12.3 Why storyboards beat plain text

Scenarios capture goals in words; storyboards capture **emotion, environment, and timing** in pictures. A frustrated thought bubble in panel three (*"I do really need a paintbrush, I wonder where I can find it…"*) communicates a usability problem more vividly than a paragraph of text. Storyboards also force the designer to think about the *physical* context — where the user is standing, what they're holding, who else is around.

> Storyboards are deliberately rough and hand-drawn. Polishing a storyboard would be a waste — its purpose is to provoke conversation about the *experience*, not to look pretty.

---

## 13. Method 5: Wireframes and Mockups

A **wireframe** or **mockup** is a low-fidelity drawing of an actual screen of the product — the layout, the controls, the labels, the navigation — without committing to final colors, typography, or images.

### 13.1 The fidelity spectrum

| Fidelity | Examples | When to use |
|------|------|------|
| **Hand sketch** | Pencil on paper | Earliest brainstorming, throw-away |
| **Low-fi wireframe** | Balsamiq Mockups (deliberately sketchy look) | Early reviews, where you want to discuss *structure* without arguing about colors |
| **High-fi mockup** | Figma, Sketch, Photoshop | Late stage, near-final visual design |
| **Interactive prototype** | Clickable Figma, InVision | Ready for user testing |

### 13.2 The MyFlix Zombie Romance wireframe

The lecture's example is the movie detail page for "Zombie Romance" on MyFlix:

- A browser-chrome frame at the top (back / forward / stop / home / URL bar)
- A site header with `MyFlix | Categories | …` on the left, a search box in the middle, and `Signup - Login` on the right
- A left-side navigation: `Browse Movies`, `Read Reviews`, `Sign Up`
- A breadcrumb trail: `Home > Horror > New Releases > Zombie Romance`
- The movie title, release year, synopsis, and a `Cast and Crew` link
- A `Sign Up to Watch` call-to-action button
- A "Similar Movies On MyFlix" row with three placeholder thumbnails (drawn as boxes with X's)

![Balsamiq-style wireframe of the MyFlix "Zombie Romance" movie detail page. Top: browser-chrome with back/forward/stop/home buttons and the URL `myflix.com/zombie-romance`. Site header: `MyFlix | Categories | …` on the left, a search box in the middle, `Signup - Login` on the right. Left sidebar: `Browse Movies`, `Read Reviews`, `Sign Up`. Main column: breadcrumb `Home > Horror > New Releases > Zombie Romance`, the movie title "Zombie Romance" with year "Released in 2014", a synopsis, a `Cast and Crew` link, a `Sign Up to Watch` button, and a "Similar Movies On MyFlix" row with three placeholder thumbnails (boxes with X's). No real images, no final fonts, no brand colors — by design.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/wireframe-myflix-zombie-romance.png)

Notice what's *not* there: no real images (placeholders only), no final fonts, no brand colors. The wireframe is designed to surface decisions about **layout, labels, and information hierarchy**, not visual polish.

### 13.3 What Balsamiq-style sketchy wireframes signal

Tools like Balsamiq deliberately render wireframes in a hand-drawn-looking style for a social reason: they signal *"this is rough — comment on the structure, not the polish."* If a stakeholder is shown a pixel-perfect mockup too early, they critique font choices instead of information architecture.

---

## 14. Method 6: Design Guidelines

**Design guidelines** are reusable rules and pre-built components that ensure consistency across an organization's products. Without them, every team invents its own buttons, colors, and form patterns — and the result is a chaotic user experience.

### 14.1 The "Before" — what happens without guidelines

The lecture's "Before" slide collects two dozen U.S. government website buttons all meant to do roughly the same thing — submit a form, log in, search:

`SUBMIT`, `JOIN US`, `Log in`, `Register`, `Search`, `GET THE LATEST`, `Apply Now`, `Get started`, `Sign In`, `Subscribe`, `Create an account`, `LOG IN`, `Where's My Refund?`, `Q Search`, `Apply`, `Search`, `Reset`, `Learn more`, `Login`, `TRY OUR VISA WIZARD`, `Get Weather`, `All Outbreaks`, `Search`, `go`, …

![A "Before" wall of about two dozen real U.S.-government-website buttons all meant to do roughly the same thing: `SUBMIT`, `JOIN US`, `Log in`, `Register`, `Search`, `GET THE LATEST`, `Apply Now`, `Get started`, `Sign In`, `Subscribe`, `Create an account`, `LOG IN`, `Where's My Refund?`, `Q Search`, `Apply`, `Search`, `Reset`, `Learn more`, `Login`, `TRY OUR VISA WIZARD`, `Get Weather`, `All Outbreaks`, `Search`, `go`, … Each button is a different color, shape, size, and verb — a user who learns one site relearns the next from scratch.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/design-guidelines-before-button-chaos.png)

Every button is a different color, shape, size, and verb. A user who learns one site relearns the next from scratch.

### 14.2 The "After" — the U.S. Web Design Standards

A design guideline document typically contains:

| Section | Contents |
|------|------|
| **Visual style** | Primary and secondary color palette (e.g., `#0071bc` primary blue, `#205493` darker, `#112e51` darkest, `#212121` base), typography pairings, spacing scale |
| **Typography** | Approved typefaces, type-pairing rules, link styles |
| **Components** | Buttons, form controls, tables, alerts, accordions — each with examples |
| **Wireframes / patterns** | Reusable layouts (e.g., the password reset form: show requirements up front, show progress as the user types, allow show typing, disable submit until valid) |
| **Code** | Copy-pasteable HTML/CSS markup so developers don't re-implement components |

> A design guideline is **"the right way to do it" packaged as components**. It saves designers from re-deciding, saves developers from re-implementing, and saves users from re-learning.

### 14.3 Why guidelines win

| Without guidelines | With guidelines |
|------|------|
| Every team invents buttons | Buttons are imported from a shared library |
| Color palette drifts site-to-site | One palette, one brand |
| Form patterns vary wildly | Password reset, login, search all behave the same |
| New designers have to be onboarded by example | New designers read the guide and produce on-brand work on day one |

---

## 15. Method 7: Heuristic Evaluation (Nielsen)

**Heuristic evaluation** = using research-backed principles to evaluate and improve the usability of a system, *without* needing real users present. It is also called *discount usability testing* because it is dramatically cheaper than full user studies.

### 15.1 The process

| Step | What happens |
|------|------|
| **Select tasks** | Pick representative things a user would do (e.g., "sign up and watch a movie") |
| **Someone plays the user** | An evaluator walks through each task |
| **Evaluators focus on an aspect** | Each evaluator looks at the system through one heuristic lens at a time |
| **Someone takes notes** | Findings get written down for later prioritization |

### 15.2 Nielsen's 10 Heuristics — the centerpiece of Quiz 6

The quiz study guide says explicitly: *"Know and understand all the Nielsen heuristics."* Here are the ten, with the lecture's example for each.

#### 15.2.1 Visibility of system status

The system should always **tell the user what's happening** through appropriate feedback in reasonable time.

> Example: Picnik (photo editor) showing a green progress bar with the playful message *"Fluffing clouds…"* while it loads. Or an inline confirmation: *"Your password has been emailed."* The user is never left wondering whether the system noticed their click.

#### 15.2.2 Match between system and the real world

The system should **speak the user's language** and follow real-world conventions, not internal jargon.

> Example: macOS Finder uses a **folder** icon for folders, a **document** icon for documents, a **camera** icon for the camera app. iTunes uses **Library / Music / Movies / TV Shows / Podcasts / Audiobooks / Radio** — words a music listener already knows. Compare to `cr_int_sprd` from the Lecture 11 fail slide.

#### 15.2.3 User control and freedom

Users **make mistakes** and need a clearly marked "emergency exit" — undo, redo, cancel, back, exit.

> Example: every browser has a **back arrow**. Every editor has **Ctrl+Z**. Every multi-step form has a **Cancel** button next to the primary action. Photoshop's edit toolbar puts undo/redo right next to cut/copy/paste.

#### 15.2.4 Consistency and standards

Users should **not have to wonder** whether different words, situations, or actions mean the same thing. Follow **platform conventions**.

> Example: Microsoft Office uses the same ribbon, the same icons, and the same shortcuts across Word, Excel, PowerPoint. Mobile platforms have standard icons (phone, search, heart, play, mail, settings) that mean the same thing across apps. Google Translate puts the language picker in the same spot every time.

#### 15.2.5 Error prevention

Better than good error messages is a careful design that **prevents the error from happening in the first place**.

> Example: A form's `Update` button stays *disabled* (grayed out) until the user enters something to share — they cannot submit empty content. PowerPoint asks *"Do you want to save the changes made to 'Lecture7-1'? [Don't Save] [Cancel] [Save]"* before closing — three clearly distinct options, with **Save as the primary action** (highlighted) and Cancel as the secondary, so the user does not accidentally lose work.

#### 15.2.6 Recognition rather than recall

**Minimize the user's memory load** by making objects, actions, and options *visible*. The user should not have to remember information from one part of the dialogue to another.

> Example: macOS font picker shows each font name **rendered in that font**, so you recognize the look. PHP/IDE autocomplete shows a dropdown of `str_pad`, `str_repeat`, `str_replace`, `str_rot13`, `strcasecmp`, `strchr`, `strcmp`, … — the developer recognizes the right function instead of having to recall it from scratch.

#### 15.2.7 Flexibility and efficiency of use (Accelerators)

**Accelerators** — keyboard shortcuts, gestures, command palettes — let **expert users speed up** without slowing down novices.

> Example: OmniFocus's "Common Shortcuts" panel: `Return` for Add Action, `⌘N` for New Window, `^⌘S` for Synchronize with Server, `⌘K` for Clean Up, `⌘1` / `⌘2` for Planning / Context modes, `⌥⌘1` for Inbox, `^⌥Space` for Quick Entry. A novice never has to learn these; an expert depends on them.

#### 15.2.8 Aesthetic and minimalist design

Dialogues should not contain irrelevant information. **Every extra element competes** with the relevant elements for the user's attention.

> Example: A blog search dropdown that uses **contrast** (one prominent search button), **repetition** (consistent radio buttons for `Everything / Entries / Photos / Videos / Audio / Users`), **alignment** (everything in a tidy column), and **proximity** (related options grouped together). The four design principles the slide names — **contrast, repetition, alignment, proximity** — are worth memorizing as the recipe for minimalist design.

![A blog header and search dropdown demonstrating the four minimalist-design principles. Top nav: `Home / Entries / Photos / Videos / Audio` with a single prominent blue `Q Search` button (contrast). Below it, a "Search:" panel with consistently styled radio buttons for `Everything / Entries / Photos / Videos / Audio / Users` (repetition), all aligned in a tidy column (alignment), with a "Tags" group sitting just below the scope group (proximity). Nothing decorative — every element earns its place.](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/heuristic-8-minimalist-search-dropdown.png)

#### 15.2.9 Help users recognize, diagnose, and recover from errors

When errors do occur, error messages should be in **plain language**, **precisely describe the problem**, and **constructively suggest a solution**.

> Example: A signup form with three failures, each shown next to the relevant field with a clear, kindly worded message: *"bert is already taken. Please choose a different username."* / *"Passwords must be at least 6 characters and can only contain letters and numbers."* / *"The email provided does not appear to be valid."* Or a 404 page that says *"Oh no! It seems the page you were trying to find on my site isn't around anymore. Report it missing using my contact form, or browse my articles listing or browse my blog."*

#### 15.2.10 Help and documentation

Even though the system should be usable without docs, **help should exist** — and it should be easy to search, focused on the user's task, list concrete steps, and not be too large.

> Example: Picnik's onboarding tooltip *"Welcome to Picnik Collages! Making collages from your photos has never been easier."* with a "1 of 8" wizard. Or a small inline `?` icon next to a confusing field that, on click, pops *"Which one is right for me? Use Windows when… Use SNMP for… SSH works best for…"* — context-specific help, exactly where it's needed.

### 15.3 Summary table

| # | Heuristic | One-line summary |
|---|------|------|
| 1 | **Visibility of system status** | Always show what's happening |
| 2 | **Match system and real world** | Speak the user's language |
| 3 | **User control and freedom** | Provide undo, exit, cancel |
| 4 | **Consistency and standards** | Same word/icon = same thing; follow platform conventions |
| 5 | **Error prevention** | Stop errors before they happen |
| 6 | **Recognition rather than recall** | Show options instead of asking the user to remember |
| 7 | **Accelerators** | Shortcuts for experts, default path for novices |
| 8 | **Minimalist design** | Use contrast, repetition, alignment, proximity; remove the rest |
| 9 | **Help users recover from errors** | Plain-language messages with concrete next steps |
| 10 | **Help and documentation** | Searchable, task-focused, concrete |

---

## 16. Method 8: User Testing

**User testing** = putting real users in front of the (real or prototype) system, giving them representative tasks, and watching what happens. Where heuristic evaluation uses experts and a checklist, user testing uses **real users** and **observed behavior**.

### 16.1 Improve before testing

User testing is expensive — don't waste a session on a design with obvious flaws. Run the cheaper checks first:

| Pre-test method | What it catches |
|------|------|
| **Checklists** | Generic UI quality issues (spacing, alignment, label clarity) |
| **Heuristic evaluation** | Violations of Nielsen's 10 heuristics |
| **Cognitive walkthrough** | Step-by-step "would the user know what to do here?" review |

Only after these is it worth booking real users.

### 16.2 Planning a user test — the five things to design

| Element | Decisions to make |
|------|------|
| **Subjects** | How many users? What demographics? How are they recruited? |
| **The system** | Which version — paper prototype, clickable mockup, beta, or live? |
| **Tasks** | What will users be asked to do? (Should be realistic, not artificial) |
| **The session** | Where? How long? Who facilitates? Are there think-aloud instructions? |
| **Measures taken** | What is recorded — completion time, error count, satisfaction rating, video, eye-tracking? |

> Notice the parallel to a controlled experiment in any other field: subjects, materials, procedure, measures. User testing is empirical research, just specialized to UI.

### 16.3 Two settings for user testing

#### 16.3.1 Professional usability labs

Dedicated facilities with a **one-way mirror**, a controlled testing room (where the user works at a single computer, sometimes with eye-tracking), and an observation room where researchers watch in real time. Sessions are video-recorded for later coding. Expensive but rigorous.

#### 16.3.2 Less formal user testing

Many real-world tests are far simpler:

- **Beta releases** with feedback channels — the lecture shows a "Super Secret β" page covered in red comment markers from real users
- **Analytics dashboards** — real-time graphs of session duration, screens-per-session, top-screens-visited, goal completions, in-app revenue. These reveal *what* users do; they don't always explain *why*.
- **A/B testing** — show variant A to half of users, variant B to the other half, measure which converts better (the Obama campaign example from Lecture 11)

> Big projects use the lab; everyday product work leans on beta cycles, analytics, and A/B tests. Both are "user testing" in the sense that real users drive the data.

---

## 17. Quiz 6 Study Guide

The quiz study guide slide explicitly calls out **three** items:

### 17.1 The 8 user-centered design methods

You should be able to name and briefly describe each:

| # | Method | What it produces |
|---|------|------|
| 1 | **Interviews and observations** | Direct data from real users about what they say and do |
| 2 | **Personas** | Fictional but research-grounded archetypes (with photo, demographics, goals, tasks, environment) |
| 3 | **Scenarios** | Short narratives of a persona using the system to accomplish a goal |
| 4 | **Storyboards** | Comic-strip visualizations of scenarios (panels, captions, thought bubbles) |
| 5 | **Wireframes and Mockups** | Low-fidelity drawings of actual screens (Balsamiq-style) |
| 6 | **Design guidelines** | Reusable colors, typography, components, and code (e.g. U.S. Web Design Standards) |
| 7 | **Heuristic Evaluation** | Expert review against Nielsen's 10 heuristics |
| 8 | **User testing** | Real users + real tasks + observation, in a lab or informally |

### 17.2 All ten Nielsen heuristics

Memorize the 10 heuristics from §15.2. A useful mnemonic is to group them:

- **Tell the user what's going on:** (1) visibility, (2) match real world, (10) help and documentation
- **Let the user steer:** (3) user control, (7) accelerators
- **Make the system predictable:** (4) consistency, (8) minimalist design
- **Handle errors gracefully:** (5) prevention, (6) recognition over recall, (9) recover

### 17.3 Main ideas of the online readings

(See Canvas for the two short readings; the main ideas of those readings are also fair game.)

### 17.4 Other concepts that could appear

- **Why usability matters** (sales/satisfaction/efficiency/loyalty; first impressions; safety contexts)
- **Why usability engineering is hard** (draws on psychology/cognitive science/aesthetics/art; engineers ≠ audience)
- **The three quotes** (Joel: program behaves how user thought; "GUI should provide GUIdance"; Google: focus on the user)
- **The four minimalist-design principles** (contrast, repetition, alignment, proximity)
- **The five user-test planning elements** (subjects, system, tasks, session, measures)
- **Pre-test improvement methods** (checklists, heuristic evaluation, cognitive walkthrough)

---

## 18. Wrap-Up and Memory Framework

```text
Week 6 knowledge structure
|
+-- Where we are
|   +-- Requirements -> Architecture -> Design -> USER METHODS -> Code
|   +-- Question this week: how do we make software that
|       meets the USER's needs?
|
+-- Why usability matters (Lecture 11)
|   +-- Stakes: from MRI/cockpit safety to web conversion
|   +-- Payoffs: simple, inexpensive, sales+, satisfaction+,
|   |            efficiency+, loyalty over time
|   +-- Famous quotes:
|   |   +-- Joel: UI is well-designed when program behaves
|   |   |        exactly how user thought it would
|   |   +-- "GUI should provide GUIdance"
|   |   +-- Google: focus on the user, all else follows
|   +-- Why it's hard:
|       +-- needs psychology, cognitive science, aesthetics, art
|       +-- engineers are NOT the audience -> need methods
|
+-- The 8 User-Centered Design Methods (Lecture 12)
|   +-- 1. Interviews and observations
|   |       -> direct data from real users
|   +-- 2. Personas
|   |       -> photo + demographics + quote + bio +
|   |          goals + tasks + tech skill + environment
|   |       -> sets cover multiple user roles
|   +-- 3. Scenarios
|   |       -> short narrative: persona + goal + context
|   |       -> in plain English, third person
|   +-- 4. Storyboards
|   |       -> comic-strip visualization of a scenario
|   |       -> thought bubbles surface confusion
|   +-- 5. Wireframes / Mockups
|   |       -> low-fi drawings of actual screens
|   |       -> Balsamiq-style sketchiness signals
|   |          "comment on structure, not polish"
|   +-- 6. Design guidelines
|   |       -> color palette + typography + components +
|   |          wireframes + code
|   |       -> US Web Design Standards as canonical example
|   +-- 7. Heuristic Evaluation (Nielsen) **
|   |       -> process: select tasks, play user,
|   |          evaluate per heuristic, take notes
|   |       -> 10 heuristics (memorize):
|   |          1. Visibility of system status
|   |          2. Match between system and real world
|   |          3. User control and freedom
|   |          4. Consistency and standards
|   |          5. Error prevention
|   |          6. Recognition rather than recall
|   |          7. Accelerators (flexibility & efficiency)
|   |          8. Aesthetic and minimalist design
|   |             (contrast, repetition, alignment, proximity)
|   |          9. Help users recognize/recover from errors
|   |         10. Help and documentation
|   +-- 8. User testing
|           -> improve first (checklists, heuristic eval,
|              cognitive walkthrough)
|           -> plan: Subjects, System, Tasks, Session, Measures
|           -> formal lab OR informal (beta, analytics, A/B)
|
+-- Quiz 6 study guide
    +-- 8 user-centered design methods
    +-- all 10 Nielsen heuristics
    +-- main ideas of online readings
```

### One-sentence summary

> User-centered design exists because **a well-architected system that ignores its users still fails** — and software engineers, who are not their own audience, need explicit methods to bridge that gap; those methods proceed from understanding users (**interviews and observations**) to describing them (**personas, scenarios, storyboards**) to drafting the system (**wireframes/mockups, design guidelines**) to evaluating it (**heuristic evaluation against Nielsen's ten principles, then user testing with real users in labs or via beta/analytics/A/B**), and the operational definition of "good" running through all of it is Joel's: the interface is well-designed when the program behaves exactly the way the user expected it to.
