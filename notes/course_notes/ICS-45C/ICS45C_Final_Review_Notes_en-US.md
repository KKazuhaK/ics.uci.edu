# ICS 45C — C++ Programming · Final Review Notes

**Course:** ICS 45C (Course 35770), Prof. Raymond Klefstad · **Coverage:** Weeks 1–10 (the full course)
**Built from:** the 109-question *Study Guide* (the coverage checklist) + all weekly lecture decks (C Tour, Arrays, Classes, Strings, Dynamic Arrays, Linked Lists, Topics 6–9) + the Topic 10 Final Review deck.

> **How to use this:** The sections below follow the official Study Guide's 13 topic groups in order. Each answer is written to be exam-ready: a tight definition, the key points, Klefstad's own code from the slides, common traps (⚠️), and Python contrasts (🐍) where they help. Study-Guide question numbers are noted like **(Q34)** so you can map back. The most exam-likely material is flagged 💡.

---

## Exam logistics & strategy (from the Topic 10 deck)

- **Read the instructions carefully before the exam.** Know your **assigned seat** (posted to EdStem shortly before). Bring **photo ID** (photo rosters also used).
- **Phone fully stowed** — phone out = zero / "felony cheating." No visors, hoodies, or sunglasses that block your eyes.
- **Bubble in your Exam Version** and print your **name + UCI NetID** on the answer sheet.
- **Test-taking strategy:** read each question carefully → read it *again* → use the booklet as scratch paper → answer → bubble it in right away → **trust what you learned; don't second-guess yourself into a wrong answer** → review at the end if time allows.
- **Code Reviews may be on the Final.** The professor states this explicitly (see the Code Review appendix at the end).

---

## Table of Contents
1. [C++ Programs & Programming](#1-c-programs--programming-q18)
2. [Variables & Expressions](#2-variables--expressions-q923)
3. [Memory Areas, Object Lifetimes & Scope](#3-memory-areas-object-lifetimes--scope-q2432)
4. [Arrays, Strings & Linked Lists](#4-arrays-strings--linked-lists-q3338)
5. [Functions & Parameters](#5-functions--parameters-q3948)
6. [Classes & Objects](#6-classes--objects-q4965)
7. [Inheritance & Polymorphism](#7-inheritance--polymorphism-q6673)
8. [Templates](#8-templates-q7477)
9. [Lambdas](#9-lambdas-q7880)
10. [Exceptions](#10-exceptions-q8185)
11. [Namespaces](#11-namespaces-q8690)
12. [I/O Streams, Files & stringstreams](#12-io-streams-files--stringstreams-q9194)
13. [STL Containers, Iterators & Algorithms](#13-stl-containers-iterators--algorithms-q95109)
- [Appendix A — Klefstad's aphorisms](#appendix-a--klefstads-aphorisms-keep-these-in-mind)
- [Appendix B — Quick comparison tables](#appendix-b--quick-comparison-tables)
- [Appendix C — Code reviews (may be on the Final)](#appendix-c--code-reviews-may-be-on-the-final)
- [Appendix D — Priority topics](#appendix-d--priority-topics-for-your-final)
- [The 12 most important things](#the-12-most-important-things-to-walk-in-knowing)

---

# 1. C++ Programs & Programming (Q1–8)

### Header file (.hpp) vs source file (.cpp) — (Q1)
- **`.hpp` (header) = the interface.** It *declares* what a module provides: class declarations, function prototypes, `constexpr` constants. Header files are `#include`d by other files.
- **`.cpp` (source) = the implementation.** It *defines* how each function/method works. `.cpp` files are compiled; they `#include` the `.hpp` they implement.
- Splitting a module into `.hpp` + `.cpp` lets you move `#include` dependencies down into the `.cpp`, which **reduces how much has to recompile** on each build (the build tool — make/cmake — tracks dependencies).

> ⚠️ **Course rule:** Never put `using namespace std;` in a `.hpp` header. It leaks into every file that includes the header. (Inside a `.cpp` it's tolerated in this course's slides, but headers must stay clean.)

### Preprocessor directives — (Q2)
Lines starting with `#`, handled by the **preprocessor** (the first compilation step, before the compiler):
- `#include <file>` — textually pastes in declarations (e.g., `#include <iostream>` brings in I/O declarations).
- `#define NAME value` — defines a **macro** (text substitution).
- `#ifdef` / `#ifndef` … `#endif` — conditional compilation (compile this block only if a name is / isn't defined).

#### Conditional compilation in depth — `#ifdef` / `#ifndef` / `#if` / `#else` / `#elif` / `#endif` 💡
**Conditional compilation** lets the **preprocessor keep or delete a whole block of code before the compiler ever sees it**, based on whether a macro is defined (or on a compile-time constant). Skipped code is never compiled — it's as if you had deleted it.

| Directive | Keeps the block when… |
|---|---|
| `#ifdef NAME` | `NAME` **is** `#define`d |
| `#ifndef NAME` | `NAME` is **not** defined |
| `#if expr` | the constant-integer `expr` is **non-zero** (may use `defined(NAME)`) |
| `#elif expr` | the previous tests failed **and** `expr` is non-zero (else-if) |
| `#else` | all previous tests failed |
| `#endif` | closes the block — **every `#if`/`#ifdef`/`#ifndef` needs a matching `#endif`** |
| `#undef NAME` | (not a test) removes an existing definition |

**Where does the name come from?** Either a `#define` in the code, or a **compiler flag**: `g++ -DDEBUG ...` defines `DEBUG`; `-DLEVEL=2` defines it *with a value*. (This is how the course build switches `assert` off — with `-DNDEBUG`.)
```cpp
// 1) Include guard — THE most common use (see Q4 below)
#ifndef COMPLEX_HPP
#define COMPLEX_HPP
// ... header body: compiled at most once per translation unit ...
#endif

// 2) Platform-specific code (exactly one branch survives the preprocessor)
#ifdef _WIN32
    constexpr char SEP = '\\';     // Windows
#elif defined(__APPLE__)
    constexpr char SEP = '/';      // macOS
#else
    constexpr char SEP = '/';      // Linux / other
#endif

// 3) Debug-only code, switched on with  g++ -DDEBUG
#ifdef DEBUG
    std::cerr << "x = " << x << '\n';   // exists only in debug builds
#endif

// 4) Test a VALUE, not just "is it defined?"
#if LEVEL >= 2
    verbose_logging();
#endif
```
> ⚠️ **Traps:** `#ifdef X` only asks *"does `X` exist?"* — to branch on its value use `#if X == 1`. Every `#if`/`#ifdef`/`#ifndef` **must** have a matching `#endif` (a missing one gives a confusing "unterminated #if" error). These names have **no type and no scope** (they're raw preprocessor text) — which is exactly why modern C++ keeps the preprocessor for *include guards and platform/build configuration* and prefers `constexpr` + `if constexpr` for ordinary logic.
🐍 Python has **no preprocessor**. The nearest cousins — `if __debug__:` or `if sys.platform == "win32":` — run at **run time**, and the untaken branch is still compiled; `#ifdef` instead *removes* code before compilation.

### Macros, and what to use instead — (Q3)
A **macro** is a preprocessor text substitution (`#define MAX 1024`). The preprocessor blindly replaces text *before* the compiler runs, so macros have **no type checking and no scope**.
- 💡 **In modern C++ replace macros with two things:**
  1. **`constexpr` (or `const`) variables** instead of `#define` constants → typed, scoped, debuggable.
  2. **`inline` functions / function templates** instead of function-like macros → type-checked, no surprising re-evaluation of arguments.

### Include guards — (Q4)
Prevent a header from being included more than once in the same translation unit (which would cause "redefinition" errors).
```cpp
// Complex.hpp
#ifndef COMPLEX_HPP        // if not yet defined...
#define COMPLEX_HPP        // ...define it, then...
class Complex { /* ... */ };   // ...include this body only once
#endif
```
(Modern alternative: `#pragma once` at the top of the header.)

### Incremental vs big-bang development — (Q5)
**Incremental** = write a small piece, **test it**, then add the next piece. **Big-bang** = write everything, then try to run it.
- Incremental wins because bugs are isolated to the small piece you just added, so they're easy to find. With big-bang, bugs from many places interact and are "too hard to find."
- > Klefstad: *"I just want to get it to work" / "I'll clean it up later"* leads to errors that are too hard to find. **Clean it up now.** *If a function is more than 5 lines, re-factor it. Test each piece.*

### Writing & handling test cases — (Q6)
Write tests **as you write each function** (Test-Driven Development), not after. The course's TDD loop for a method (from the String deck):
1. Pick a public method. 2. Write a **nominal test case**. 3. Identify/invent a helper. 4. Write the method using only helpers. 5. Write the helpers. 6. Write & run a **helper tester** (in `student_gtests.cpp`). 7. Run the nominal tester for the method. 8. Review: can it be cleaner / better-named / use another helper? Then add **boundary-condition** tests.
- Google Test is used: `EXPECT_EQ`, `EXPECT_NE`. *Testing is often more than half the work.*

### Object-oriented vs procedural/functional — (Q7)
- **Procedural/functional:** the program is organized around **functions** that operate on passive data.
- **Object-oriented:** the program is organized around **objects** that bundle **data + the functions (methods) that act on that data**, with control over construction, copying, and destruction, and the ability to use **inheritance** and **polymorphism**. Only an object's own methods may touch its `private` parts.

### Magic numbers — (Q8)
A **magic number** is an unexplained literal in code (`1024`, `0.40`). They hurt readability and are error-prone to change.
- 💡 **Fix:** give them names with a `constexpr` constant.
```cpp
constexpr int BUF_SIZE = 1024;          // not  char buf[1024];
constexpr double QUIZ_WEIGHT = 0.40;    // not  grade = quiz * 0.40;
return PI * r * r;                      // not  return 3.14159 * r * r;
```

---

# 2. Variables & Expressions (Q9–23)

### Declaration vs definition (variables) — (Q9)
- A **declaration** introduces a name and its type ("this name exists, here's its type").
- A **definition** also allocates storage / provides the body.
- For an ordinary local variable, `int x;` is *both* a declaration and a definition. A declaration that is **not** a definition uses `extern`:
```cpp
extern int g;   // declaration only (g is defined in some other file)
int g = 5;      // definition (allocates storage, here in this file)
```

### Operator precedence & parenthesizing — (Q10)
Operators bind in a fixed precedence order; parentheses override it. Highest → lowest (subset from the slides): `++ -- (unary) + - (unary)` → `* / %` → `+ - (binary)` → `= += -= *= /= %=`. Key **access** operators: dereference `*`, index `[]`, address-of `&`, member-arrow `->`.
```cpp
int j = 8 - k * i / 2 + k * 2;   // == 8 - ((k*i)/2) + (k*2)
*p->next      // means *(p->next)   ( -> binds tighter than * )
*a[i]         // means *(a[i])      ( [] binds tighter than * )
&a[0]         // means &(a[0])
```
> ⚠️ When unsure on the exam, **parenthesize explicitly** and trace it.

#### Operator precedence — the table worth memorizing

Building on (Q10): the three pointer-tracing examples there are the *easy* part. What trips people up on the exam is the **relative** ordering of operators that look unrelated (`<<` vs `?:`, `==` vs `&`). Memorize this table top-to-bottom; that is enough to parse anything Klefstad puts on the final.

**Precedence table — high → low** (everything in one band is *equal* precedence, broken by associativity):

| Level | Operators | Associativity | Read it as |
|---|---|---|---|
| 1 (highest) | `()` `[]` `->` `.` postfix `++` `--` | left → right | call / index / member / post-inc |
| 2 | prefix `++` `--` unary `+` `-` `!` `~` deref `*` address `&` `(type)` `sizeof` | **right → left** | all the unary ops |
| 3 | `*` `/` `%` | left → right | multiplicative |
| 4 | `+` `-` (binary) | left → right | additive |
| 5 | `<<` `>>` | left → right | shift / stream insert-extract |
| 6 | `<` `<=` `>` `>=` | left → right | relational |
| 7 | `==` `!=` | left → right | equality |
| 8 | `&` | left → right | bitwise AND |
| 9 | `^` | left → right | bitwise XOR |
| 10 | `\|` | left → right | bitwise OR |
| 11 | `&&` | left → right | logical AND |
| 12 | `\|\|` | left → right | logical OR |
| 13 | `?:` | **right → left** | conditional (ternary) |
| 14 | `=` `+=` `-=` `*=` `/=` `%=` `<<=` … | **right → left** | assignment |
| 15 (lowest) | `,` | left → right | comma |

💡 The two **right-to-left** bands you actually use are: the unary band (2), the conditional `?:` (13), and assignment (14). Everything else binds left-to-right.

**The traps that show up every term** — each with the exam-style line:

(a) ⚠️ `<<` (level 5) is **higher** than `?:` (level 13). So a ternary inside a stream insert *must* be parenthesized:
```cpp
cout << a ? b : c;     // parses as (cout << a) ? b : c -- b/c discarded; -Werror rejects it
cout << (a ? b : c);   // correct: insert b or c
```

(b) ⚠️ `==` (level 7) is **higher** than bitwise `&` (level 8). The classic bit-test bug:
```cpp
if (x & 1 == 0) { ... }    // parses as  x & (1 == 0)  ==  x & 0  ==  0  -> always false!
if ((x & 1) == 0) { ... }  // correct: test the low bit
```

(c) ⚠️ `?:` (level 13) is **higher** than `=` (level 14), so the assignment binds *loosest*:
```cpp
int m = a > b ? a : b;     // (a > b ? a : b) computed first, then assigned -- this is fine
m = cond ? x : y = 0;      // parses as  m = (cond ? x : (y = 0))  -- right-to-left, surprising
```

(d) Pointer/access chain — prefix `*` (level 2) is **lower** than `->` `[]` (level 1), so the access happens first (continuing the Q10 examples):
```cpp
*p->next      // == *(p->next)     -> first, then deref
*a[i]         // == *(a[i])        index first, then deref
&a[0]         // == &(a[0])        index first, then take address
++*p          // == ++(*p)         deref first, then pre-increment the pointee
*p++          // == *(p++)         post-inc the POINTER, deref the OLD pointer
```

(e) ⚠️🐍 Sequencing: `i = i++ + ++i;` reads/writes `i` multiple times with no sequence point between them → **undefined behavior**. Precedence tells you how it *parses*, not the *order of side effects*. 🐍 Python evaluates left-to-right with defined semantics and has no `++`/`--` at all; in C++ this line is simply **not allowed** — never write it.

**Manual traces** (always rewrite into the fully-parenthesized form first, then evaluate):
```cpp
// 1)  mixed arithmetic, given k = 3, i = 4
int j = 8 - k * i / 2 + k * 2;
//   step 1 (level 3, L→R):  8 - ((k * i) / 2) + (k * 2)
//   step 2 substitute:      8 - ((3 * 4) / 2) + (3 * 2) = 8 - 6 + 6
//   step 3 (level 4, L→R):  (8 - 6) + 6 = 8

// 2)  bit + equality, given x = 6
bool even = x & 1 == 0;
//   == x & (1 == 0)   (level 7 before level 8)
//   == 6 & 0  == 0  -> false   (wrong intent!)   fix: (x & 1) == 0  -> true

// 3)  logical vs relational vs shift
if (a < b == c > d) { ... }
//   == ((a < b) == (c > d))    (level 6 before level 7) -- compares two bools
cout << x + 1 << " " << (n > 0 ? "+" : "-");
//   == (((cout << (x + 1)) << " ") << (n > 0 ? "+" : "-"))   -- note the required parens on ?:
```

💡 **Exam move:** you do *not* need the whole table memorized perfectly under pressure — when in doubt, **add explicit parentheses and hand-trace** the parenthesized form. Correct-and-obvious beats clever-and-wrong, and `-Werror` won't flag extra parens.

### L-value vs R-value — (Q11)
- **L-value** = something with an identity/address that can appear on the **left** of `=` (a named, addressable object). Example: a variable `x`, an array element `v[i]`, `*p`.
- **R-value** = a temporary/value with no persistent address (right side only). Example: a literal `10`, the result of `a + b`, a returned-by-value temporary.
```cpp
int x = 10;   // x is an L-value, 10 is an R-value
x = 5;        // OK: L-value on left
5 = x;        // ERROR: 5 is an R-value
v[i] = v[i-1]*2;   // v[i] L-value; v[i-1]*2 R-value
```
This matters for `operator[]` returning `int&` (an L-value, so `v[0]=1` works) and for **R-value references `&&`** used by move semantics (Section 6).

### Reference parameter — (Q12)
A parameter declared with `&`. The function receives the **actual object itself** (an alias), not a copy, so it can **modify the caller's variable**.
```cpp
void increment(int & x) { x = x + 1; }
int z = 10; increment(z); increment(z);   // z is now 12
```

### Reference return type — (Q13)
A function returns `T&` — a reference to an existing object, so the **call can be used as an L-value** (you can assign into it). Classic use: `operator[]`.
```cpp
int & operator[](int index) { return buf[index]; }  // returns ref to the element
v[0] = 1;   // works: v[0] is an L-value
```
> ⚠️ Never return a reference to a **local** variable — it dies when the function returns (dangling reference).

### Reference variable — (Q14)
A local alias for an existing object, fixed at construction (it can never be "re-seated" to refer to something else).
```cpp
int i = 10;
int & r = i;   // r is another name for i
r = 70;        // changes i to 70
```

### Reference vs pointer — (Q15) 💡
| | Reference `int& r` | Pointer `int* p` |
|---|---|---|
| Holds | an alias to one object | an address |
| Must be initialized? | **Yes**, at declaration | No (but uninitialized = dangerous) |
| Can be reseated? | **No** | Yes (`p = &other;`) |
| Can be null? | No | Yes (`nullptr`) |
| Syntax to use target | `r` directly | `*p` (deref), `p->m` |
```cpp
int i = 10;
int * p = &i;   // pointer: & gives the address of i
*p = 60;        // changes i indirectly
int & j = i;    // reference: set once, alias of i
j = 70;         // changes i indirectly
```
🐍 Python names are *references* to objects (closest to C++ references), but Python has nothing like a raw pointer or the `*`/`&` distinction.

**⚠️ Declaring several pointers on one line — the `*` binds to the variable, not the type.**
```cpp
int* p1, p2, p3;     // ONLY p1 is a pointer; p2 and p3 are plain int!
                     // (the * attaches to the declarator, not to 'int')
int x = 0;
p2 = &x;             // error: invalid conversion from 'int*' to 'int'  (p2 is an int)

int *q1, *q2, *q3;   // fix: put a * on each name (clearest: one declaration per line)
```
> 💡 Contrast `int q1, q2, q3;` — there `int` applies to all three, so all three are `int`. The surprise only happens with `*` (and `&`): they bind to each individual name, not to the type.

### `const` keyword — (Q16)
`const` means "cannot be modified." Used on variables, parameters (protect from accidental modification + enable `const&` efficiency), and member functions (promise not to modify `*this`).
```cpp
const int i = 10;            // i may not be reassigned
void print(const Coins & c)  // c can't be modified inside print; const& avoids a copy
{ c.quarters = 0; }          // ERROR caught by compiler
```

### `constexpr` — (Q17)
`constexpr` = a value (or function) computable **at compile time**. Use it for true compile-time constants and array sizes.
```cpp
constexpr double PI = 3.1415926536;
constexpr int len = 5;
int a[len] = {0};   // OK: len is a compile-time constant
```
**`constexpr` vs `const` (Q17 / Final-review slide):** `const` = "won't change after initialization" (may be a runtime value); `constexpr` = "known at compile time" (stronger; usable where a compile-time constant is required, like a stack array bound).

### Constant pointer vs pointer to constant — (Q18) 💡 (very common trap)
Read right-to-left around the `*`:
```cpp
int * const p = &i;        // CONSTANT POINTER: p can't change, *p can
                           //   p = &j;   ERROR     *p = 5;  OK
const int * p = &i;        // POINTER TO CONST: p can change, *p can't
                           //   p = &j;   OK        *p = 5;  ERROR
const int * const p = &i;  // both fixed: p can't change AND *p can't change
```

### `const_cast` — (Q19)
Removes (or adds) `const`/`volatile` from a type. Necessary only when you must pass a logically-modifiable object through an API that wrongly takes/returns `const`. **Rare and a code smell** — modifying an object that was truly `const` is undefined behavior.
```cpp
const int * cp = &x;
int * p = const_cast<int*>(cp);   // strip const (use only when you know x isn't really const)
```

### `static_cast` — (Q20) 💡
The normal, checked-at-compile-time conversion between related types (numeric conversions, `void*`→`T*`, up/down a hierarchy without runtime check).
```cpp
int i = c;                                // char -> int (implicit, widening)
char c = static_cast<char>(i);            // int -> char (narrowing, must be explicit)
int x = static_cast<int>(std::round(d));  // double -> int with rounding
```
> ⚠️ **Course build uses `-Werror`.** Implicit *narrowing* conversions (e.g., `double → int`, `int → char`) become errors, so you must make them explicit with `static_cast`.

#### The four C++ casts compared — `static_cast` / `const_cast` / `dynamic_cast` / `reinterpret_cast` 💡

C++ replaces the one-size-fits-all C-style cast with **four named casts**, each with a narrow job. Picking the right one documents *intent* and lets the compiler reject misuse. This pulls together `const_cast` (Q19) and `static_cast` (Q20) and adds the two you haven't seen yet.

| Cast | What it does | Checked when? | Typical use | Safety |
|:---|:---|:---:|:---|:---|
| `static_cast<T>` | Convert between **related** types | **Compile time** (no runtime check) | numeric conversions, `void*`→`T*`, up/down a hierarchy | Safe *if* the relationship is real; a wrong downcast is **undefined behavior** |
| `const_cast<T>` | Add/strip `const` / `volatile` | Compile time | force a value through a wrongly-`const` API | Stripping `const` then **writing** a truly-`const` object is undefined behavior — code smell |
| `dynamic_cast<T>` | Cross a **polymorphic** hierarchy with a checked downcast | **Run time** (uses RTTI) | safe `Base*` → `Derived*` | Safe: tells you at run time whether the cast was valid |
| `reinterpret_cast<T>` | Reinterpret the **raw bits** | Compile time (no real check) | pointer ↔ integer, low-level/`memcpy`-style code | **Dangerous**, almost never correct in this course |

**`static_cast` — (Q20) 💡** The everyday conversion between related types: numeric conversions, `void*`→`T*`, and up/down an inheritance hierarchy *with no runtime check*.
```cpp
char c  = static_cast<char>(i);            // int -> char (narrowing, must be explicit)
int  x  = static_cast<int>(std::round(d)); // double -> int with rounding
Base* b = static_cast<Base*>(derivedPtr);  // upcast: always safe (Derived is-a Base)
```
> ⚠️ **Course build uses `-Werror`.** Implicit *narrowing* conversions (`double → int`, `int → char`) become errors, so you must make them explicit with `static_cast`. A `static_cast` **downcast** compiles with no complaint but does **no** runtime check — if the object isn't really that derived type, you get **undefined behavior**.

**`const_cast` — (Q19)** The only cast that can add or remove `const`/`volatile`. Necessary only to pass a logically-modifiable object through an API that wrongly takes `const`. **Rare and a code smell**; writing through a pointer to a truly-`const` object is undefined behavior.
```cpp
const int* cp = &x;
int* p = const_cast<int*>(cp);   // strip const (only when you know x isn't really const)
```

**`dynamic_cast` — the checked downcast** 💡 Only works on **polymorphic types** — the base class must have **at least one virtual function** (in our hierarchy, the virtual destructor / `draw()` already make `Shape` polymorphic, see §7). Use it to safely turn a `Base*` into a `Derived*` at run time:
- **Pointer version** returns `nullptr` if the object isn't actually that derived type.
- **Reference version** can't return null, so it **throws `std::bad_cast`** on failure.
- **Upcasting** (`Derived*` → `Base*`) is implicit — you never need a cast for it.
```cpp
Shape* shapePtr = pic.at(i);                       // static type Shape*, dynamic type unknown
if (Circle* cp = dynamic_cast<Circle*>(shapePtr)) {
    cp->setRadius(5);            // safe: ran only because shapePtr really points to a Circle
}                               // not a Circle -> dynamic_cast yields nullptr, branch skipped

Shape& s = *shapePtr;
Circle& cr = dynamic_cast<Circle&>(s);  // reference form: throws std::bad_cast if not a Circle
```
> 💡 If you find yourself reaching for `dynamic_cast` a lot, prefer a **virtual function** instead — let each `Shape` answer through dispatch (the §7 polymorphism point) rather than type-testing.

**`reinterpret_cast` — raw bit reinterpretation** ⚠️ Tells the compiler to treat the bits as a different, *unrelated* type (e.g., pointer ↔ integer). It performs **no** conversion of value or representation. Almost never appropriate in this course; reserved for low-level systems code.
```cpp
std::uintptr_t addr = reinterpret_cast<std::uintptr_t>(ptr); // pointer -> integer (rare, low-level)
```

> ⚠️ **Never use a C-style cast `(T)x`.** It silently tries `static_cast`, then `const_cast`, then `reinterpret_cast` (or a combination) in a "best-effort" order — so a typo can quietly turn an intended numeric conversion into a bit reinterpretation, with no diagnostic. The four named casts state your **intent**, are **checked** appropriately, and are **greppable** (you can search the codebase for `reinterpret_cast` to audit risky code). Always use them.

> 🐍 Python has no compile-time types to cast: `int(x)` / `str(x)` are **runtime conversions** that build new objects, and `isinstance(obj, Circle)` is the rough analog of a `dynamic_cast` check. There's nothing like `const_cast` (no `const`) or `reinterpret_cast` (no raw memory reinterpretation) — those exist only because C++ exposes static types and memory.

### `auto` — (Q21)
`auto` lets the compiler **deduce** a variable's type from its initializer. Great for verbose iterator types and lambdas.
```cpp
auto fn = [](int i){ return i*i; };                 // a lambda
for (auto x : {1,2,3,4,5}) cout << x << endl;        // x deduced as int
for (auto it = V.begin(); it != V.end(); ++it) ...   // no need to spell out the iterator type
```

### Signed vs unsigned integer — (Q22)
- **Signed** can hold negative and positive values (one bit effectively encodes sign).
- **Unsigned** holds only non-negatives, doubling the positive range; it **wraps around** on underflow/overflow.
- > ⚠️ Classic bug: `v.size()` is **unsigned**. `for (int i = 0; i < v.size(); ++i)` mixes signed/unsigned; `v.size() - 1` when `size()==0` wraps to a huge number.

**Example — watch it wrap:**
```cpp
unsigned u = 0;
u = u - 1;               // 4294967295 (UINT_MAX, 32-bit) — unsigned WRAPS; it is NOT -1

vector<int> v;           // empty;  v.size() has type size_t (unsigned)
auto n = v.size() - 1;   // 18446744073709551615 (64-bit size_t wraps!) — NOT -1

for (int i = 0; i < v.size(); ++i) { /* ... */ }   // int vs size_t → -Wsign-compare (an ERROR under -Werror)
```
**Fixes:**
```cpp
for (size_t i = 0; i < v.size(); ++i) { /* ... */ }   // A) use the matching unsigned type
for (int x : v) { /* ... */ }                          // B) range-based for — no index, no sign issue (preferred)
if (!v.empty())                                        // C) guard before subtracting from an unsigned size
    for (size_t i = 0; i + 1 < v.size(); ++i) { /* ... */ }   // compare with +1; never compute size()-1 on empty
```
> 💡 Index with `size_t` (or use a range-based `for`), and **never write `container.size() - 1` without first checking it isn't empty** — on an empty container it underflows to ~1.8×10¹⁹.

### Ternary conditional operator `?:` — (Q23)
`condition ? valueIfTrue : valueIfFalse` — an **expression** that yields a value (unlike `if`, which is a statement).
```cpp
int factorial(int n) { return n == 0 ? 1 : n * factorial(n - 1); }
int max = a > b ? a : b;
```
🐍 Python's `x if cond else y` is the same idea (note the different word order).

---

# 3. Memory Areas, Object Lifetimes & Scope (Q24–32)

### Lifetime of an object — (Q24) 💡
> Klefstad: *"Every object has a life-time: born, lives, dies."*
- **Birth = allocation + construction** (memory reserved, then the constructor runs).
- **Lives** = the object is usable.
- **Death = destruction + deallocation** (the destructor runs, then memory is reclaimed).
> ⚠️ **Terminology:** it's **destruction**, *not* "deconstruction." The professor calls this out specifically.

The *when* depends on the memory area: a **stack** object lives from its declaration to the end of its enclosing `{ }` block; a **heap** object lives from `new` until `delete`; a **static/global** object lives for the whole program.

### Default value of an uninitialized primitive — (Q25)
- A **local (stack)** primitive that you don't initialize holds **garbage** (whatever bits were there). `int foo;  // what happens here? — undefined value`
- A **static/global** primitive is **zero-initialized** by default.

### Pass-by-value vs pass-by-reference — (Q26, also Q40)
- **By value (a.k.a. copy/value):** the function gets its **own copy** (built with the copy constructor for class types); changes don't affect the caller. *Klefstad's analogy: emailing you a PDF of HW1 — you have your own copy.*
- **By reference (`&`):** the function gets an **alias** to the caller's object; changes are visible to the caller, and no copy is made. *Analogy: sharing a link to the Google Doc.*
- **Two reasons to pass by reference:** (1) to **modify** the actual argument, and (2) **efficiency** — avoid copying a big object. `const &` is the idiom for "efficiency without modification."

### Static vs stack variable (both local to a function) — (Q27)
Both are declared inside a function, but:
- A **stack** local is created each time the function is entered and destroyed when it returns (fresh every call).
- A `static` local lives in **static storage**: it is created **once**, **retains its value between calls**, and lives for the whole program.
```cpp
void f() {
    int s = 0;          // reset to 0 every call
    static int t = 0;   // initialized once; remembers across calls
    ++s; ++t;
}
```

### Stack variable vs heap variable — (Q28)
- **Stack:** automatically managed (created at declaration, destroyed at end of block). Size must be fixed; fast.
- **Heap (free store):** explicitly managed with `new`/`delete`; lives until you `delete` it; size can be decided at runtime. **You** are responsible for freeing it (or it leaks).

### `new` / `delete` for dynamic memory — (Q29)
```cpp
int * p = new int{42};   // allocate one int on the heap, construct with 42
delete p;                // destruct + free that one object
```
`new` reserves heap memory **and** constructs the object; `delete` destructs **and** frees it.

### `new[]` vs `new` (and matching `delete`) — (Q30) 💡
```cpp
int * a = new int[size];   // allocate an ARRAY of 'size' ints (size may be runtime value)
delete[] a;                // MUST use delete[] for arrays

int * p = new int{42};     // allocate a SINGLE int
delete p;                  // MUST use plain delete for a single object
```
> ⚠️ **`new[]` pairs with `delete[]`; `new` pairs with `delete`.** Mismatching them is **undefined behavior**. The reason: array allocation records how many elements exist so every element's destructor can run; `delete` (no brackets) only handles one object.

### Local vs global variable — (Q31)
- **Local:** declared inside a block/function; visible only there; on the stack (or `static` storage if marked `static`).
- **Global:** declared outside all functions; visible across the file (and other files via `extern`); lives in static storage for the whole program. Globals are discouraged (hidden coupling).

### Memory leak — (Q32)
Heap storage that is **never `delete`d** and to which you've lost the last pointer — "storage lost forever due to a missing `delete`." Causes:
- Forgetting `delete`/`delete[]`.
- Overwriting the only pointer to a heap object before deleting it.
- A class that allocates in its constructor but has **no (or a wrong) destructor** → every object leaks (Rule of Three, Section 6).

> ⚠️ **Pointer hazards to memorize (Klefstad's "Pointer Caveats"):**
> - **Uninitialized pointer** → `int *p; *p = 0;` ⇒ Segmentation Violation (SIGSEGV / "seg fault").
> - **Dangling reference** → a pointer to a *dead* object; using it is a FATAL, hard-to-debug error.
> - **Memory leak** → missing `delete`.
> - **Redundant delete** → deleting the same storage twice.
> - 💡 **Wisdom: restrict dynamic allocation to class implementations** (let a class's constructor/destructor manage the heap — RAII).

---

# 4. Arrays, Strings & Linked Lists (Q33–38)

### Linked list vs array — trade-offs (Q33) 💡
| | **Array** | **Linked list** |
|---|---|---|
| Storage | one contiguous block | separate node objects chained by pointers |
| Indexing `A[i]` | **O(1)** (2–3 instructions) | **O(n)** — must walk the chain |
| Size | fixed at allocation; grow = allocate bigger + copy (expensive) | grows/shrinks freely |
| Insert/remove in middle | expensive (shift elements) | cheap **where you already have a pointer** |
| Overhead | none per element | a `next` pointer per node |
- Both "should only be used as the *implementation* of classes." A linked list's nodes are chained with pointers; `nullptr` marks the end; an empty list has `head == nullptr`.

### Shallow copy vs deep copy — (Q34) 💡 (heavily tested — see Appendix D)
- **Shallow copy:** copies the pointer value only → two objects point at the **same** heap array. Disaster: both destructors `delete[]` the same memory (**double-free**), and changes through one affect the other.
- **Deep copy:** allocates a **new** heap array and copies the elements → the two objects are independent.
```cpp
// Deep copy constructor for a class holding 'int* buf':
Vector(const Vector & v) : maxLen(v.maxLen), buf(new int[v.maxLen]) {
    for (int i = 0; i < v.maxLen; ++i) buf[i] = v.buf[i];   // copy each element
}
```
🐍 Shallow copy ≈ `b = a` (both names → same list object); deep copy ≈ `copy.deepcopy(a)`. In C++ the **default** (compiler-generated) copy is *member-wise* = shallow for pointer members, which is why you must write your own (Rule of Three).

### C-style string vs `std::string` — (Q35) 💡
| | **C-string** | **`std::string`** |
|---|---|---|
| What it is | a raw `char` array, **null-terminated** `'\0'` | a class that manages its own buffer |
| Length | `strlen()` scans for `'\0'` (O(n)); chars past `'\0'` are garbage | `.size()` is stored (O(1)) |
| Operations | `strcpy`, `strcat`, `strlen`, `strcmp`, manual loops | `=`, `+`, `+=`, `==`, `[]`, `.size()`, iterators |
| Safety | no bounds checking; you manage memory | manages memory/growth for you |
```cpp
char s[12] = "Hello World";   // 11 chars + 1 for '\0' = 12
char s2[]  = "Hello World";   // size deduced (12)
char *s4   = "Hello World";   // pointer to a string literal (read-only!)
std::string t = "hello";      // class; t.size() is O(1)
```
> ⚠️ Writing through a `char*` to a string **literal** (`s4[0]='M';`) is a segfault — literals are read-only.

### Declare `buf`, point it to a `2*N` int array, store `N`, then delete — (Q36)
This exact pattern shows up on exams:
```cpp
int * buf = new int[2 * N];   // local stack pointer -> heap array of 2*N ints
buf[2*N - 1] = N;             // store N in the LAST element (index 2*N - 1)
delete[] buf;                 // array allocation -> delete[]
```

**Why not just `int buf[2*N];`?** A plain C-style **stack** array needs a size that is a **compile-time constant**. When `N` is a *runtime* value, `2*N` isn't known until the program runs, so `int buf[2*N];` is a **variable-length array (VLA)** — a non-standard compiler extension, **not** ISO C++. A standards-conforming build rejects it:
```cpp
int N = readSize();   // runtime value
int buf[2*N];         // ❌ error: "ISO C++ forbids variable length array 'buf'"  (-pedantic / -Wvla)
                      //    (plain g++ allows it as an extension, but it is non-portable)
```
Even where that extension compiles, a stack array is the **wrong tool** here: it dies at the end of its block (it can't outlive the function or be returned), it can't be resized, and a large `N` can **overflow the stack**. You use the **heap** (`new int[2*N]`) precisely because the heap can be sized at **runtime** and lives until you `delete[]` it.
> 💡 `int buf[2*N];` *is* legal **only when `N` is a compile-time constant**: `constexpr int N = 5; int buf[2*N];` — a fixed-size stack array (Q17 / Q28). The moment the size is a runtime value, you need `new[]`.

### Is `A[i]` bounds-checked for a C array? — (Q37) 💡
**No.** A low-level C array is just a base address; `A[i]` computes `*(A + i)` with **no** check that `i` is in range. If `i` is out of range you read/write memory outside the array → undefined behavior: garbage values, corrupted data, or a seg fault. (That's *why* we wrap arrays in a class with a checked `operator[]`.)
```cpp
int a[5] = {0};
a[-1] = 0;     // "what happens?" — writes outside the array; undefined behavior
a[5] = 99;     // also out of bounds
```

### Default value of C-array elements — (Q38)
Same rule as Q25: an **uninitialized** local C array holds **garbage**. To zero it, initialize explicitly:
```cpp
int counts[26] = {0};   // all 26 elements set to 0
int a[len] = {0};       // zero-initialize
```

#### Linked-list essentials (the SLL you implemented for the String/Picture homeworks)
> 💡 **Mandatory member names in this course: `data` and `next`.** ("We all must use `data` and `next` so we are speaking the same language.")
```cpp
struct Node { char data; Node * next; };   // node

// Traverse (one pass!):
for (Node * p = head; p != nullptr; p = p->next)
    cout << p->data << ' ';

// Add to front (push):  head = new Node{ c, head };
// Remove front (pop) — must recycle the removed node:
char pop() {
    Node * tmp = head;        // save the node to delete
    char ret = tmp->data;
    head = head->next;        // unlink
    delete tmp;               // recycle  (NOT: delete head; head = head->next;  -> dangling!)
    return ret;
}
// Destructor — free the whole chain with a temp pointer:
~CharList() {
    for (Node * p = head; p != nullptr; ) {
        Node * tmp = p; p = p->next; delete tmp;
    }
}
```
> ⚠️ **One pass only.** Don't walk the list twice unless you must. Don't make extra copies. And never `delete p;` *then* `p = p->next;` — that reads freed memory (dangling reference).

**RAII (Resource Acquisition Is Initialization)** — the design principle behind all of this: wrap each resource (heap memory) in a class whose **constructor acquires** it, **destructor releases** it, **copy** makes a deep copy, and **move** transfers ownership. A simple, systematic way to prevent leaks. Memory ownership question to always ask: *who owns the heap memory?* (e.g., the `String`/`Picture` owns it, **not** the individual `Node`/`Shape`).

#### Recursion (the Linked List deck pairs it with lists) 💡
**Recursion** is a function that calls itself — structurally like an inductive proof. Klefstad's **three laws of recursion**: (1) there must be a **base case** (a terminal case answered without recursing); (2) each call must **change state and move toward the base case**; (3) the function must **call itself** (the recursive case).
```cpp
int sumN(int n)     { return n == 0 ? 0 : n + sumN(n - 1); }       // base: n == 0 -> 0
int factorial(int n){ return n == 0 ? 1 : n * factorial(n - 1); }  // base: 0! == 1
```
Linked lists are a natural fit — handle one node, then recurse on `next`; the base case is `nullptr`:
```cpp
int length(Node * L) { return L == nullptr ? 0 : 1 + length(L->next); }   // base: empty list
```
> ⚠️ Miss the base case (or fail to move toward it) → **infinite recursion** → the call stack overflows. Each recursive call gets its **own stack frame** with its own parameters/locals (this is how the call stack implements recursion).
🐍 Same idea as Python recursion, but C++ has a much smaller default recursion depth and **no automatic big integers**, so deep recursion can overflow the stack and large results can overflow an `int`.

#### C-style array decay ⚠️ (a classic trap; ties into Q33/Q37)
When a C array is passed to a function it **decays** to a plain pointer to its first element — the **size is lost**. That's why a parameter written `int a[]` is really `int* a`, and why you must pass the length separately.
```cpp
void f(int a[], int n) {            // 'a' is actually int* — the size is gone
    // sizeof(a) == size of a POINTER (e.g. 8), NOT the array's bytes
    for (int i = 0; i < n; ++i) {}  // must use the passed-in length n
    // for (auto x : a) {}          // ERROR here: a is a pointer now, not an array
}
int main() {
    int A[5] = {0};
    for (auto x : A) {}             // OK here: A is still a real array in this scope
    f(A, 5);                        // A decays to int* on the way in
}
```
> 💡 This is a big reason `std::vector` / `std::array` are safer — they carry their size with them and **don't decay**.

---

# 5. Functions & Parameters (Q39–48)

### Function declaration vs definition — (Q39)
- **Declaration (prototype):** the signature only, ending in `;`. Tells the compiler the name, parameter types, and return type so calls can be checked. `double average(double x, double y);`
- **Definition:** the declaration **plus the body** `{ ... }` — the actual implementation.
> 💡 A function must be **declared before it is called** (or the compiler errors "undeclared"), and **defined before linking** (or the linker errors "undefined"). See Q42–Q44 logic below.

### Pass-by-value vs pass-by-reference — (Q40)
(Same as Q26.) Value = a copy you can modify locally; reference (`&`) = an alias that lets you modify the caller's object and avoids a copy. `const&` = efficient + read-only.

### `std::swap` and its required parameter mode — (Q41) 💡
Swaps two values. It **must take its parameters by reference** — otherwise it would swap *copies* and the caller's variables wouldn't change.
```cpp
template <typename T>
void swap(T & a, T & b) { T tmp = a; a = b; b = tmp; }   // & is required!
int x = 1, y = 2;  std::swap(x, y);   // now x==2, y==1
```
Used heavily in move operations (swap `buf` pointers instead of copying arrays). `std::swap` lives in `<utility>`.

### Function overloading vs overriding — (Q43) 💡
- **Overloading:** multiple functions with the **same name but different parameter lists**, resolved **at compile time** by the arguments. (A form of *static* polymorphism.)
- **Overriding:** a **derived class** redefines a **`virtual`** function it inherited, with the **same signature**, resolved **at run time** by the object's actual type. (*Dynamic* polymorphism — Section 7.)
```cpp
int  min(int a, int b);        // overload 1
double min(double a, double b); // overload 2  (same name, different params)

struct Base    { virtual void draw(); };
struct Derived : Base { void draw() override; };  // override (same signature, virtual)
```

#### `virtual` overriding in depth — how dynamic dispatch works 💡💡

> 🔗 This is the deep companion to **Q68** (virtual functions, Section 7) and the **virtual destructor** (Q69) — the dispatch mechanism and the pitfalls.

With `virtual`, a call through a **base pointer or reference** is dispatched at **run time** to the override matching the object's **actual (dynamic) type** — the call goes through a hidden per-object vtable pointer (Q68). Without `virtual`, the very same call binds at **compile time** to the **declared (static)** type.
```cpp
struct Shape  { virtual void draw() const { cout << "Shape\n"; } virtual ~Shape() = default; };
struct Circle : Shape { void draw() const override { cout << "Circle\n"; } };

Shape* s = new Circle;
s->draw();     // "Circle" — virtual: dispatched by the ACTUAL type
               // if draw() were NOT virtual: "Shape" (bound by the declared type Shape*)
delete s;      // needs Shape's virtual destructor (Q69), or Circle's part leaks
```
**What actually counts as an override** (writing `override` makes the compiler check all of it):
- same **name**, same **parameter list**, same **`const`/ref-qualifiers**;
- the base function is **`virtual`**;
- return type **identical** — or **covariant** (`Derived*`/`Derived&` where the base returns `Base*`/`Base&`).
- Add `override` so any mismatch is a **compile error**; add `final` to forbid overriding it further.
```cpp
struct Base { virtual void f(int); virtual Base* clone() const; };
struct Good : Base {
    void  f(int)        override;   // ✅ real override
    Good* clone() const override;   // ✅ covariant return is allowed
};
struct Oops : Base {
    void  f(double)     override;   // ❌ error: "marked 'override', but does not override"
};
```

**⚠️ The traps that bite on the exam:**

**(1) Name hiding, not overriding.** A derived member with the **same name but a different signature** *hides* **all** base overloads of that name — they disappear from the derived interface:
```cpp
struct B { void f(int) {} };
struct D : B { void f() {} };   // hides B::f(int)
D d;
d.f(3);       // ❌ "no matching function for call to 'D::f(int)'" — hidden, not overloaded
d.B::f(3);    // ✅ qualify it  (or write  using B::f;  inside D to un-hide)
```
**(2) Forgot `virtual`** → no dynamic dispatch: a base-pointer call uses the **base** version. (And then `override` won't even compile — which is exactly why you should always write `override`.)

**(3) Default arguments bind to the static type.** A virtual call runs the derived **body** but takes the **base's** default argument — so never change a default in an override:
```cpp
struct B { virtual void g(int x = 1) { cout << "B " << x; } };
struct D : B { void g(int x = 2) override { cout << "D " << x; } };
B* p = new D;
p->g();       // prints "D 1" — D's body, but B's default arg!  (keep defaults identical)
```
**(4) Object slicing.** Copy a `Derived` into a `Base` **by value** and the derived part is sliced off; later virtual calls use `Base`. Always pass/store polymorphic objects **by reference or pointer**:
```cpp
D d;          // the D from above (overrides g)
B  b = d;     // copy-by-value: slices the D part off
b.g();        // "B 1" — b is a B; the override is gone
B& r = d;     // bind by reference instead
r.g();        // "D 1" — through a reference, dispatch still works
```
🐍 In Python every method is already "virtual" (dynamic), and there is no overloading or slicing; C++ makes you opt in with `virtual` and punishes by-value copies of derived objects with slicing.

> 🛡️ **Preventing slicing — two layers.** (1) If the base is **abstract** (has a pure virtual), then `Base b = d;` and `vector<Base>` won't even compile — `error: cannot allocate an object of abstract type 'Base'`. Abstractness already forbids by-value copies, so the *silent* slice only bites with a **concrete** base. (2) For a concrete polymorphic base, `=delete` its copy constructor and copy assignment (or make the copy constructor `protected`) so an accidental `Base b = d;` becomes a hard `error: use of deleted function`. That is why HW6 keeps `Shape*` in a `Picture` and never stores/copies a `Shape` by value. 🔗 see Q71 (abstract class) and Q73 (the `vector<Shape*>` demo).

### Overloading an operator: top-level vs member — (Q44) 💡 (Final-review "operators" slide)
- **As a member function:** the **left operand is `this`** (implicit), so you declare **one fewer** parameter.
- **As a top-level (plain) function:** you declare **all** operands explicitly.
```cpp
// Member: left operand is *this
bool operator==(const Vector & v) { /* compare this with v */ }

// Top-level: BOTH operands explicit. operator<< MUST be top-level (left operand is a stream):
ostream & operator<<(ostream & out, const Complex & c) { c.print(out); return out; }
istream & operator>>(istream & in, Complex & c)        { c.read(in);  return in;  }
```
**Which must be members:** `=`, `[]`, `()`, `->`, and type-conversion operators **must be member functions**. `<<` and `>>` **cannot** be members (their left operand is the stream) — make them top-level (often `friend`). Symmetric operators like `== != < > + -` can be either (member with one param, or top-level with two).

**Worked example — one class, both kinds of operator (with output):**
```cpp
#include <iostream>
using namespace std;   // OK inside a .cpp (never in a .hpp)

class Complex {
    double re, im;
public:
    Complex(double r = 0, double i = 0) : re(r), im(i) {}

    // MEMBER operators: the left operand is *this, so you declare ONE fewer parameter
    Complex  operator+ (const Complex& rhs) const { return Complex{re + rhs.re, im + rhs.im}; }
    bool     operator==(const Complex& rhs) const { return re == rhs.re && im == rhs.im; }
    Complex& operator+=(const Complex& rhs)       { re += rhs.re; im += rhs.im; return *this; }  // return *this to chain

    friend ostream& operator<<(ostream&, const Complex&);   // let the stream op read private re/im
};

// TOP-LEVEL (friend): the left operand is the stream, so it CANNOT be a member
ostream& operator<<(ostream& out, const Complex& c) {
    return out << "(" << c.re << ", " << c.im << ")";
}

int main() {
    Complex a{1, 2}, b{3, -4};
    cout << (a + b)  << '\n';   // a.operator+(b)      -> (4, -2)
    cout << (a == b) << '\n';   // a.operator==(b)     -> 0   (false)
    a += b;                     // a.operator+=(b)
    cout << a        << '\n';   // operator<<(cout, a) -> (4, -2)
}
```
**Output:**
```text
(4, -2)
0
(4, -2)
```
> 💡 `a + b` is really `a.operator+(b)` — the **member's** left operand is `a` (`*this`), so it takes only **one** explicit parameter. `cout << a` is `operator<<(cout, a)` — its left operand is the **stream**, so it **must** be a top-level function (a `friend` here so it can read the private `re`/`im`).

### Inline function — (Q45)
A function marked `inline` is a *request* that the compiler **substitute the body at the call site** instead of making a real call. Benefit: removes call overhead for tiny functions (and is the modern, type-safe replacement for function-like macros). Defining a function **inside** a class body makes it implicitly inline.

### Default argument — (Q46)
A parameter given a default value in the **declaration**; if the caller omits that argument, the default is used. It can be **overridden** simply by supplying a value.
```cpp
double toCentigrade(double f = 32.0) { return 5.0*(f-32.0)/9.0; }
toCentigrade();      // uses 32.0
toCentigrade(6.0);   // overrides the default with 6.0
```
> ⚠️ Defaults go on the declaration (in the `.hpp`), not repeated in the `.cpp` definition; and only **trailing** parameters may have defaults.

### Friend function — (Q47) 💡
A non-member function (or another class) that a class **grants access to its `private`/`protected` members**, declared with `friend` *inside* the class.
> Klefstad's framing: *"Who says I am your friend? — me (the class granting friendship), not you."* The friend gets the privilege to read the class's private parts.
- Why use it: e.g., `operator<<` must be a top-level function but needs to read private data → make it a `friend`.

### `constexpr` variable / `constexpr` function — (Q48)
- A **`constexpr` variable** is a compile-time constant (Q17).
- A **`constexpr` function** *can* be evaluated at compile time when given compile-time arguments (and at run time otherwise). Use them to compute constants without macros.

#### How C++ programs are built — (which error comes from which tool?) 💡 (Final-review "declarations vs definitions" slide; the link-vs-compile-error distinction and "multiply defined" trip people up)
| Stage | Handles | Typical error |
|---|---|---|
| **Preprocessor** | `#include`, `#define`, `#ifdef` | (text errors) |
| **Compiler** | one pass per source file; must be **declared before called** | **"undeclared"** identifier; type / **syntax** errors; **"redefinition"** (same file) |
| **Linker** | combines `.o` files; called function must be **defined** | **"undefined reference"**; **"multiply defined"** (same symbol defined in 2 files) |
| **Loader** | loads the executable into RAM, calls `main()` | — |
| (run time) | — | **segmentation fault** (bad pointer/index) |

#### Which stage reports which error — worked examples 💡

The Section 5 table tells you *which tool* catches each error; here is a **runnable minimal snippet** for each, the tool that fires, and the message you'll roughly see. Compile with the course-style build (`g++ -std=c++20 -Wall -Werror ...`).

**(1) Undeclared identifier — compiler** (Q4)
Calling `foo()` before any declaration is visible in this translation unit:
```cpp
int main() {
    foo();              // used here, but never declared above
    return 0;
}
void foo() { }          // declaration/definition comes too late
```
> Compiler: `error: 'foo' was not declared in this scope`. The compiler reads **top-to-bottom, one file at a time**, so the name must be **declared before it is called** (a prototype above `main` would fix it). 🐍 Unlike Python, where a function just needs to *exist* by call time at run time, C++ resolves names at compile time.

**(2) Type / narrowing error — compiler (an error under `-Werror`)** (Q20)
Narrowing conversions are diagnosed in **brace-initialization** `{ }` (copy-init with `=` does **not** trigger the narrowing rule):
```cpp
double d = 3.9;
int n{d};               // narrowing double -> int
char c{300};            // narrowing int -> char (300 doesn't fit)
```
> `int n{d}` is a **warning** by default that `-Werror` turns into a hard error (`error: narrowing conversion of 'd' from 'double' to 'int'`); `char c{300}` is **already an error** even without `-Werror`. ⚠️ Fix by making the conversion explicit: `int n{static_cast<int>(d)};`, `char c{static_cast<char>(300)};`. This is caught at **compile time**, in the single file being compiled.

**(3) Syntax error (e.g. a missing `;`) — compiler**
One missing token derails the parser, and the message often points at the *next* line:
```cpp
struct Point { int x; int y; }   // missing ';' after the closing brace

int main() { Point p; return 0; }
```
> Compiler: `error: expected ';' after struct definition`. ⚠️ The flagged line is often *after* the real mistake — on a baffling error, check the **previous** line for a missing `;`, `}`, or `)`.

**(4) Redefinition in one translation unit — compiler** (Q4 — why include guards exist)
Define the same type twice in a single file — most often by `#include`-ing a guard-less header twice:
```cpp
// shape.hpp — NO include guard
struct Shape { int sides; };
```
```cpp
// main.cpp
#include "shape.hpp"
#include "shape.hpp"   // 2nd inclusion -> struct Shape defined twice in THIS file
int main() { return 0; }
```
> Compiler: `error: redefinition of 'struct Shape'` — caught at **compile time**, inside one translation unit. ✅ Fix: wrap the header in an **include guard** (`#ifndef SHAPE_HPP` / `#define SHAPE_HPP` / … / `#endif`) or `#pragma once`; the second `#include` then expands to nothing.
> 💡 Contrast with (6) below: a **redefinition** is one file seeing a type twice (a **compiler** error); **"multiply defined"** is two files each emitting the same symbol (a **linker** error). Include guards fix the former, not the latter.

**(5) Undefined reference — linker** (Q4)
The function is **declared and called**, so the compiler is happy — but no definition is ever supplied (or you forgot to compile/link the `.cpp` that defines it):
```cpp
void foo();             // declaration only — promise it exists somewhere
int main() {
    foo();              // compiles fine: declaration is in scope
    return 0;
}
// no definition of foo() anywhere in the linked .o files
```
> Linker: `undefined reference to 'foo()'`. ⚠️ The classic real-world cause is forgetting a file on the command line — `g++ main.cpp` instead of `g++ main.cpp foo.cpp`. The compiler only needs the **declaration**; the linker needs the **definition**.

**(6) Multiply defined — linker** (Q4)
Put a **non-`inline` function definition in a header**, then `#include` that header from two `.cpp` files:
```cpp
// util.hpp  — a real DEFINITION (body), not inline
void foo() { }          // every .cpp that includes this gets its own copy
```
```cpp
// a.cpp
#include "util.hpp"
```
```cpp
// b.cpp
#include "util.hpp"
```
> Linker (building `a.o` + `b.o`): `multiple definition of 'foo()'`. Each translation unit emitted its own `foo`, and the linker refuses to pick one.

> ⚠️ **Common misconception — include guards do NOT fix this.** An include guard (`#ifndef … #define … #endif`) only stops the **same header from being textually included twice within one translation unit**, which prevents *type/class* redefinition. It does **nothing** across separate `.cpp` files: `a.cpp` and `b.cpp` are compiled independently, each runs the guard from scratch, so each still emits a definition of `foo()`. The real fixes are:
> - mark the function `inline` in the header (the linker is then allowed to merge the identical copies), or
> - leave only the **declaration** in the header and move the **definition** into a single `.cpp`.

**(7) Segmentation fault — run time** (Q4)
Compiles and links cleanly; blows up only when executed:
```cpp
int main() {
    int* p = nullptr;
    *p = 42;            // dereference of null pointer -> undefined behavior
    int a[3] = {};
    return a[1000000];  // wild out-of-bounds index -> undefined behavior
}
```
> No tool warns here — it is **undefined behavior** that typically surfaces as `Segmentation fault (core dumped)` from the OS at **run time**.

**One-line takeaway:** the **compiler** works **per file and needs declarations**; the **linker** **merges files and needs definitions**.

#### Declaration × definition × use — the full truth table 💡💡
The whole "undeclared vs undefined reference" confusion in one matrix. **Declared** = a prototype is visible before the call; **Defined** = a body exists in some linked `.o`; **Used** = actually called. (Every row verified with `g++ -std=c++20 -Wall -Wextra`.)

| Declared | Defined | Used | Compile | Link | What happens |
|:---:|:---:|:---:|:---:|:---:|---|
| ✅ | ✅ | ✅ | ✅ | ✅ | normal — everything resolves |
| ✅ | ✅ | ❌ | ✅ | ✅ | declared + defined but unused — perfectly fine, not even a warning |
| ✅ | ❌ | ✅ | ✅ | ❌ | `undefined reference` — the linker hunts for the body and can't find it (the case people ask about) |
| ✅ | ❌ | ❌ | ✅ | ✅ | declared, no body, never called — nobody references it, so the linker never looks → no error |
| ❌ | — | ✅ | ❌ | — | `undeclared` — the compiler stops here; it never reaches the linker |
| ❌ | ✅ | ✅ | depends | — | a definition is also a declaration: define-before-use compiles and links; define-after-use is `undeclared` at the call |

> 💡 The two rows that matter: **declared-but-not-defined** only explodes **when it is used** (row 3 → linker `undefined reference`); if nothing calls it (row 4) the linker has no reason to look, so it links clean. A name that was **never declared** (row 5) dies at **compile** time — it never gets far enough to be a *link* error. The last row is why you can call a function defined earlier in the same file without a separate prototype, but one defined later needs a prototype above the call.

---

# 6. Classes & Objects (Q49–65)

> This is the heart of the course. Anchor example: Klefstad's `Vector`/`IntList`/`String` classes that own a heap array `int* buf`.

### Class declaration vs definition — (Q49)
- A **class declaration** (in the `.hpp`) is analogous to a function prototype: it lists members and method signatures.
- A **class definition** provides the bodies. (Member functions are typically *defined* in the `.cpp` using the `ClassName::method` form.)
```cpp
// Complex.hpp — declaration
class Complex { float re, im; public:
    Complex(float r = 0, float i = 0);
    void print(ostream & out) const;
};
// Complex.cpp — definitions
Complex::Complex(float r, float i) : re(r), im(i) {}
void Complex::print(ostream & out) const { out << "(" << re << "+" << im << "i)"; }
```

### Class vs object — (Q50)
A **class** is the blueprint (defines what objects of that type look like + their behavior). An **object** is an actual instance created from the class, with its **own copy of the data members** and its own lifetime.

### Private vs public member — (Q51)
- **`public:`** = the **interface** — accessible to everyone (the "controls": steering wheel, pedals).
- **`private:`** = the **implementation** — accessible **only to the class's own member functions** (and friends) (the "internals": engine, fuel injection).
- Simple rule: **data members private; most methods (and constructors/destructor) public;** helper methods often private.

### Private vs protected member — (Q52)
Both are inaccessible to outside code. The difference is inheritance:
- **`private`** members are **not** accessible to derived classes.
- **`protected`** members **are** accessible to derived classes (but still not to outside code).
> Rule of thumb: keep representation **private** so derived classes don't depend on it (you can change it later). Use `protected` only when derived classes genuinely need direct access.

| Member is… | Class itself + friends | Derived classes | Outside code |
|:---|:---:|:---:|:---:|
| `public` | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |

(So **`protected` = `private` plus "also visible to derived classes."**)

> 🔗 Different from the Q67 inheritance-mode table: this one is about who can access a member; that one is about how an inheritance mode re-labels inherited members.

### Constructor and its role — (Q53)
A special member function (same name as the class, no return type) that **builds and initializes `this` object**; called **automatically right after allocation**. Use a **member initializer list** to construct data members:
```cpp
Vector(int newLen) : maxLen{newLen}, buf{ new int[newLen] } { }   // init list builds members
```

### Copy constructor + three uses — (Q54) 💡
Constructs a **new** object as a **duplicate of an existing one**; signature takes **one parameter: a (`const`) reference to the same class type**.
```cpp
Vector(const Vector & v) : maxLen(v.maxLen), buf(new int[v.maxLen]) {
    for (int i = 0; i < v.maxLen; ++i) buf[i] = v.buf[i];   // DEEP copy
}
```
**Three situations that call it:**
1. **Initialization from an existing object:** `Vector v1{v};`
2. **Passing by value:** `Vector foo(Vector v)` — the argument is copy-constructed.
3. **Returning by value:** `return v;` — the return value is copy-constructed.
> ⚠️ Best practice: the parameter must be **`const&`** (so you can copy temporaries and don't accidentally modify the source); a copy constructor should have **no side effects**.

### Destructor — (Q55)
A special member (`~ClassName()`, no parameters, no return) that **cleans up** before deallocation; called **automatically** when the object dies (end of block for stack objects, `delete` for heap objects). For a class owning heap memory, it **frees** it:
```cpp
~Vector() { delete[] buf; }
```

### `this` pointer — (Q56)
Every (non-static) member function has a hidden pointer parameter **`this`** pointing to the object the method was called on — like Python's explicit `self`. Members of `this` are directly visible (you can write `re` or `this->re`). You also `return *this;` from assignment operators.
```cpp
void print(ostream & out) const { out << re; /* re of this */ }
Vector & operator=(const Vector & v) { /* ... */ return *this; }
```

### Struct vs class — (Q57) 💡
**The only difference is the default access level:** members of a `struct` are **`public` by default**; members of a `class` are **`private` by default**. (Default *inheritance* is likewise public for struct, private for class.) Everything else is identical — both can have constructors, methods, access specifiers, etc.

### Constructor vs destructor (when called) — (Q58)
- **Constructor** runs at **birth**, right after allocation, to set up the object.
- **Destructor** runs at **death**, right before deallocation, to clean up.
- Order over a block: objects are destroyed in **reverse** order of construction.

### `const` member function vs non-`const` — (Q59) 💡
A method declared `const` (the keyword goes **after** the parameter list) promises **not to modify `this`**; inside it, `this` is treated as const, so it can't change data members and can only call other `const` methods. You may call a `const` method on a `const` object; a non-`const` method **cannot** be called on a `const` object.
```cpp
void print(ostream & out) const;   // const: doesn't modify the object
void append(int value);            // non-const: modifies the object
```
> ⚠️ `operator<<` takes `const T&`, so the `print` it calls **must be `const`**.

### Constructor vs assignment operator — (Q60) 💡
- A **constructor** builds a **brand-new** object from raw memory (the target doesn't exist yet).
- The **assignment operator `=`** updates an **already-constructed** object from another → it must **clean up its old resources first**, then copy, then `return *this;`.
```cpp
Vector & operator=(const Vector & v) {
    if (this != &v) {              // self-assignment check (IDENTITY — see below)
        maxLen = v.maxLen;
        delete[] buf;              // free the OLD array (we already exist)
        buf = new int[v.maxLen];
        for (int i = 0; i < maxLen; ++i) buf[i] = v.buf[i];
    }
    return *this;                  // enables chaining a = b = c;
}
```
> 💡 **Self-assignment check uses IDENTITY, `this != &v`, not value comparison.** Klefstad's slide shows `if (*this != v)` is **wrong** — self-assignment is about being the *same object* (same address), not having an equal *value*. Comparing values (`operator!=`) is the wrong test (and may be undefined/expensive). The danger it guards against: on `a = a`, `delete[] buf` would free the very array you're about to copy from.

### Move assignment vs copy assignment — (Q61) 💡
**Copy** assignment duplicates the source (deep copy) and leaves it intact. **Move** assignment **steals the source's heap resources** (it's a temporary that's about to die), avoiding allocation/copying. Move is selected when the right-hand side is an **R-value** (a temporary, or something you wrapped in `std::move`).
```cpp
Vector & operator=(Vector && v) {          // && = R-value reference; note: NO const
    delete[] buf;                          // free our old array
    buf = v.buf;  maxLen = v.maxLen;        // steal v's array
    v.buf = nullptr;                       // CRITICAL: leave v safe to destruct
    return *this;
}
```

### Move constructor vs copy constructor — (Q62) 💡💡 (exam favorite)
A **move constructor** builds a new object by **taking ownership of a dying object's resources** instead of copying them. Parameter is an **R-value reference `T&&`** (no `const`). Called when initializing from a temporary / an `std::move`-d object.
```cpp
Vector(Vector && v) : maxLen(v.maxLen), buf(v.buf) {   // steal the pointer
    v.buf = nullptr;   // ***very important*** to avoid a redundant-delete (double-free) error!!!
}
```
> 💡 **Memorize: the move constructor (and move assignment) MUST set `v.buf = nullptr`.** The moved-from object **still has its destructor called**, and `delete[] nullptr` is safe — but if you leave `v.buf` pointing at the array you just stole, *both* destructors free it → double free / crash.

**Copy vs move at a glance:**
| | Copy | Move |
|---|---|---|
| Parameter | `const T&` | `T&&` (no const) |
| Source after | unchanged | emptied (`buf = nullptr`) |
| Work | allocate + copy elements | steal pointer (cheap) |
| Triggered by | L-value source | R-value / `std::move` source |

#### Worked example — when each of the 4 special members fires (with output) 💡💡
One class that owns a heap `int* buf`, with all four special members instrumented so you can see exactly which one runs. `std::move` (from `<utility>`) turns an l-value into an r-value, so it selects the **move** versions:
```cpp
#include <iostream>
#include <utility>          // std::move
using namespace std;

class Vec {
    int* buf;
    int  n;
public:
    Vec(int len) : buf(new int[len]), n(len) { cout << "ctor\n"; }
    ~Vec() { delete[] buf; }

    Vec(const Vec& o) : buf(new int[o.n]), n(o.n) {           // (1) COPY ctor
        for (int i = 0; i < n; ++i) buf[i] = o.buf[i];        //     deep-copy each element
        cout << "copy ctor\n";
    }
    Vec& operator=(const Vec& o) {                            // (2) COPY assignment
        cout << "copy =\n";
        if (this != &o) {                                     //     self-assignment check (identity)
            delete[] buf;                                     //     free the OLD array first
            n = o.n; buf = new int[n];
            for (int i = 0; i < n; ++i) buf[i] = o.buf[i];
        }
        return *this;                                         //     return *this -> chaining
    }
    Vec(Vec&& o) noexcept : buf(o.buf), n(o.n) {              // (3) MOVE ctor — steal the pointer
        o.buf = nullptr; o.n = 0;                             //     leave source safe to destruct
        cout << "move ctor\n";
    }
    Vec& operator=(Vec&& o) noexcept {                        // (4) MOVE assignment
        cout << "move =\n";
        if (this != &o) {
            delete[] buf; buf = o.buf; n = o.n;
            o.buf = nullptr; o.n = 0;                         //     null out source -> no double free
        }
        return *this;
    }
};

int main() {
    Vec a{3}, b{3};
    Vec c = a;              // (1) copy ctor — initialize from an L-value
    c = b;                  // (2) copy =    — assign into an existing object from an L-value
    Vec d = std::move(a);   // (3) move ctor — initialize from an R-value (std::move)
    d = std::move(b);       // (4) move =    — assign from an R-value
}
```
**Output:**
```text
ctor
ctor
copy ctor
copy =
move ctor
move =
```
> 💡 The trigger is **what is on the right**: an **L-value** source (a named object like `a`) picks the **copy** version; an **R-value** source (a temporary, or `std::move(a)`) picks the **move** version. **Initializing** a new object (`Vec c = …`) calls a **constructor**; assigning into an **existing** object (`c = …`) calls an **assignment operator**. Copy = allocate + deep-copy; move = steal the pointer + null the source. (The destructors at the end print nothing.)

### Static vs non-static **data** member — (Q63)
- A **non-static** data member exists **per object** (each instance has its own).
- A **`static`** data member is **shared by all objects** of the class (one copy total); accessed as `ClassName::member`.

**Example — one shared `count`, one `id` per object (with output):**
```cpp
#include <iostream>
using namespace std;

class Widget {
    int id;                 // non-static: each object has its OWN
    static int count;       // static: ONE shared copy for the whole class
public:
    Widget() : id(++count) {}              // bump the shared counter; give this object its id
    int myId() const { return id; }
    static int total() { return count; }   // static member function: has no 'this'
};

int Widget::count = 0;      // define + initialize the static member ONCE (in a .cpp)

int main() {
    Widget a, b, c;
    cout << a.myId() << " " << b.myId() << " " << c.myId() << '\n';  // per-object ids
    cout << Widget::total() << '\n';                                  // shared count, via ClassName::
    cout << "sizeof(Widget) = " << sizeof(Widget) << '\n';           // static is NOT stored per object
}
```
**Output:**
```text
1 2 3
3
sizeof(Widget) = 4
```
> 💡 Each `Widget` got its **own** `id` (1, 2, 3) — the **non-static** member. There is only **one** `count`, shared by all objects (so `total()` is 3) — the **static** member, reached as `Widget::total()`. Note `sizeof(Widget) == 4` (just the one `int id`): the static `count` lives **once** in static storage, **not** inside each object. ⚠️ A static data member must be **defined once outside the class** (`int Widget::count = 0;`) or the linker reports "undefined reference".

### Static vs non-static **member function** — (Q64)
- A **non-static** method has a `this` pointer and operates on a specific object.
- A **`static`** method has **no `this`** — it belongs to the class, not an instance, and can only touch static members / its parameters. In this course the **String helper functions are `static`** (general-purpose, know nothing about a specific object), called as `String::strcpy(...)`.

### Default constructor — (Q65) 💡
A constructor callable with **no arguments** (either takes no params, or all params have defaults). Used when you declare an object with no initializer:
```cpp
Vector v;       // default-constructed
Vector arr[10]; // each element default-constructed
```
> ⚠️ **Two traps:** (1) `Vector result;` calls the default constructor, but `Vector result();` declares a **function** ("most vexing parse") — Klefstad's slide flags *"Note no parens!!!"*. (2) If you declare **any** constructor of your own, the compiler **stops** generating the implicit default constructor — you must add it back (`Vector() = default;` or write one) if you still need no-arg construction.

#### The Rule of Three / Five / Zero — (ties Q54–Q62 together) 💡💡💡
> **RULE OF THREE: if your class contains any (raw) pointer / owns a resource, you must write all three:**
> 1. **copy constructor** (deep copy)
> 2. **copy assignment `operator=`** (free old, deep copy, self-assignment check)
> 3. **destructor** (free the resource)
>
> **RULE OF FIVE:** add the two **move** operations (move constructor + move assignment) for efficiency.
>
> **RULE OF ZERO** (Topic 7): *if you can avoid defining the special operations, do.* If your members are all well-behaved types (`std::string`, `std::vector`, `std::map`, smart pointers…), they manage themselves → **write none of the five**; the compiler-generated defaults are correct.

**What the defaults do, and why they're wrong for a raw pointer:** the compiler-generated copy constructor / copy assignment do a **member-wise (shallow) copy**, and the default destructor does nothing special. With a `char* buf`:
```cpp
String::~String() { delete[] buf; }
String(const String & s) = default;   // shallow copy -> two objects share buf -> double free!
String & operator=(const String & s) = default;   // same disaster
// And an empty hand-written one is just as bad:
String(const String & s) { }          // buf left uninitialized (garbage) -> crash
```
- `= default` asks for the compiler's version; **`= delete`** removes a function entirely (e.g., `unique_ptr` deletes its copy operations so it can't be copied).

---

# 7. Inheritance & Polymorphism (Q66–73)

> Anchor example: the `Shape` hierarchy (`Circle`, `Rectangle`, `Square`) collected in a `Picture` (HW6).

### Inheritance, and how it simplifies design — (Q66)
A **derived** class **inherits all members** of its **base** class and may **add** members or **override** methods. This lets you build a new type by *extending* an existing one **without copying/modifying its source**, and lets one framework operate on a whole family of types.
```cpp
class Shape { /* ... */ };
class Triangle : public Shape { /* ... */ };   // "Triangle is a kind of Shape"
```
> Distinguish **inheritance ("is a kind of")** from **containment ("has a"/"is a part of")**. An `Engine` is *part of* a `Car` → make it a **data member**. A `Car` *is a kind of* `Vehicle` → use **public inheritance**.

**Example — a shared base function (the reuse half of inheritance):**
```cpp
#include <iostream>
using namespace std;

struct Account {
    double balance = 0;
    void deposit(double x) { balance += x; }   // SHARED: written once, inherited by every account
    virtual double interest() const = 0;       // this part varies per account type
};
struct Savings  : Account { double interest() const override { return balance * 0.05; } };
struct Checking : Account { double interest() const override { return balance * 0.01; } };

int main() {
    Savings s; Checking c;
    s.deposit(1000);                 // Account::deposit — inherited, not rewritten
    c.deposit(1000);                 // the very same function
    cout << s.interest() << '\n';    // Savings::interest
    cout << c.interest() << '\n';    // Checking::interest
}
```
**Output:**
```text
50
10
```
> 💡 `deposit()` is written **once** in `Account` and **inherited unchanged** by both `Savings` and `Checking` — that is inheritance as **code reuse** (no copy-paste). `interest()` is `virtual`, so it **varies** per type — that is polymorphism. Most real base classes mix both: shared concrete methods **plus** virtual hooks.

### Base class vs derived class — (Q67)
- **Base** (superclass/parent): defines the common data + methods.
- **Derived** (subclass/child): inherits them, may add more, may override. A derived class can itself be a base for a further class (`Menu : public Window : public Screen`).

#### `public` vs `protected` vs `private` inheritance (Topic 6 PPT slide 27) 💡
The **inheritance mode** controls what the base class's members *become* inside the derived class. **`public` inheritance is the only one that models "is-a"** (and the only one for polymorphic hierarchies); `protected`/`private` inheritance mean "implemented-in-terms-of," not "is-a."

| Base member | `public` inheritance | `protected` inheritance | `private` inheritance |
|:---:|:---:|:---:|:---:|
| `public` | public | protected | private |
| `protected` | protected | protected | private |
| `private` | inaccessible | inaccessible | inaccessible |

> Read the mode as a **ceiling**: members come through *at most* as accessible as the mode allows, and a base's `private` members are **never** directly accessible to the derived class regardless of mode. Building a `Stack` on top of a `Vector` via `private` inheritance is "reuse," not "is-a" — don't use *public* inheritance for that (array subscripting into a stack makes no sense).

> 🔗 Not the same as the Q52 table: **that** one shows who can access a member of a given access level (class / derived / outside); **this** one shows what access an inherited member ends up with under each inheritance mode.

### Virtual function — (Q68) 💡
A member function marked `virtual` uses **dynamic binding**: the version called is chosen at **run time** by the object's **actual (dynamic) type**, not its declared (static) type. This is what makes polymorphism work through a base pointer/reference.
```cpp
struct Base    { virtual int f(); int g(); };   // f is virtual, g is not
struct Derived : Base { int f() override; };     // "once virtual, always virtual"
```
> Style: write `override` when overriding (the compiler then verifies the signature matches). `virtual` is optional in the derived class but preferred for clarity.

> 🔗 This is the **definition**. For which version actually runs, see **Static vs dynamic binding** just below; for the vtable dispatch mechanism and the override pitfalls (name hiding, slicing, default-arg binding), see the **"`virtual` overriding in depth"** block under Q43.

### Static vs dynamic binding — (which version runs?) 💡
Two "types" are in play whenever you use a base pointer or reference: the **static (declared) type** — what you wrote in the declaration — and the **dynamic (actual) type** — the real type of the object it refers to. The question is **which one decides which function runs**:
- A **non-virtual** call is resolved at **compile time** by the **static (declared)** type.
- A **virtual** call is resolved at **run time** by the **dynamic (actual)** type — that is polymorphism.
```cpp
#include <iostream>
using namespace std;

struct Animal {
    void name()          { cout << "Animal\n"; }   // NON-virtual
    virtual void sound() { cout << "...\n";    }   // virtual
};
struct Dog : Animal {
    void name()           { cout << "Dog\n";  }    // hides Animal::name (NOT an override)
    void sound() override { cout << "Woof\n"; }
};

int main() {
    Dog d;
    Animal& a = d;     // static (declared) type = Animal;  dynamic (actual) type = Dog
    a.name();          // non-virtual -> chosen by the STATIC type  -> "Animal"
    a.sound();         // virtual     -> chosen by the DYNAMIC type -> "Woof"
}
```
**Output:**
```text
Animal
Woof
```
> 💡 Same object `d`, same handle `a` — yet `a.name()` prints **Animal** while `a.sound()` prints **Woof**. The only difference is `virtual`: without it the call follows the **declared** type (`Animal`); with it the call follows the **actual** type (`Dog`). That is exactly why a `Picture` holding many `Shape*`/`Shape&` can call `draw()` and get each real shape's version (the *heterogeneous* case). Static binding is fine when the set is *homogeneous* or you only want reuse.

### Virtual destructor, and why it matters — (Q69) 💡💡
When you `delete` a derived object **through a base pointer**, only the base destructor runs **unless the base destructor is `virtual`** — so the derived part leaks/under-destructs. **Rule:** any class with virtual functions (any base of a polymorphic hierarchy) needs a **virtual destructor**, introduced at the **root**.
```cpp
class Shape {
public:
    virtual double perimeter() = 0;
    virtual ~Shape() = default;    // REQUIRED so 'delete shapePtr' destructs the real type
};
```
(It may be omitted only if no object will ever be destroyed through a base pointer.)

### Virtual function vs pure virtual function — (Q70) 💡
- A **virtual** function **has a definition**; derived classes *may* override it.
- A **pure virtual** function has **no definition** and is declared `= 0`; derived classes **must** override it to become concrete.
```cpp
virtual void rotate(int d);       // virtual: has (or will have) a body
virtual void draw() = 0;          // pure virtual: no body, MUST be overridden
```

### Abstract class — (Q71) 💡
A class with **one or more pure virtual functions** (`= 0`) is **abstract** — it describes *what* a family of types can do without saying *how*. You **cannot instantiate** it directly (`Shape s;` gives `error: cannot declare variable 's' to be of abstract type 'Shape'`); you can only use **pointers or references** to it (`Shape* sp; Shape& sr;`), which then point at concrete derived objects.

An abstract class is still a real class — it **can** have:
- **data members** and **constructors** (run by the derived class's constructor);
- **non-pure (concrete) methods with bodies** (like `describe()` below), which may even call the pure ones;
- a **virtual destructor** (and it should have one — Q69).

What it **can't** do is exist as a standalone object — and a derived class that **fails to override every** pure virtual is **itself still abstract**.
```cpp
struct Shape {
    virtual double area() const = 0;   // pure virtual -> Shape is abstract
    void describe() const;             // a concrete (non-pure) method is still allowed
    virtual ~Shape() = default;
};
// Shape s;                 // ERROR: cannot declare variable 's' to be of abstract type 'Shape'
Shape* sp = new Circle(3);  // OK: use the abstract base only through a pointer/reference
```
> 🔗 For a full runnable polymorphism demo — a `vector<Shape*>` of `Circle`/`Square` with output — see the **complete example at the end of Q73**.

### Pure virtual destructor — (Q72)
You may declare a destructor pure virtual (`virtual ~Shape() = 0;`) to **force the class to be abstract** when it has no other pure virtual function. Catch: a pure virtual destructor **still needs a definition** (the body), because every derived destructor calls the base destructor.
```cpp
class Base { public: virtual ~Base() = 0; };
Base::~Base() {}   // must still provide a body
```

### How polymorphism works + benefits — (Q73) 💡
**Polymorphism** = the actual operation invoked by a call depends on the object's type.
- **Static polymorphism** via **overloading** (compile time).
- **Dynamic polymorphism** via **virtual functions** (run time): a base pointer/reference can refer to any derived object, and a virtual call dispatches to the right override.
```cpp
void rotate_all(Shape* vec[], int size, int angle) {
    for (int i = 0; i < size; ++i)
        vec[i]->rotate(angle);   // dispatches to Circle::/Rectangle::/Square::rotate at run time
}
```
**Benefit — extensible frameworks:** you can add a **new** `Shape` subtype (e.g., `Square`) **without changing** `rotate_all` or `Picture`. *"Picture knows nothing about Triangle, only about Shape."*
> Construction/destruction order: **base constructed first, then derived members**; destruction is the reverse. A derived constructor calls the base constructor first (the default if you don't name one).

#### Complete example — polymorphism in action (with output) 💡💡
The whole Section-7 picture in one runnable program: an abstract `Shape` interface, two concrete shapes, and **framework code (`printAll`) that mentions only `Shape`** — yet each call runs the real type's version.
```cpp
#include <iostream>
#include <vector>
#include <string>
using namespace std;

struct Shape {                                  // abstract base = the interface
    virtual string name() const = 0;
    virtual double area() const = 0;
    virtual ~Shape() = default;                 // virtual dtor: delete through Shape* is safe
};
struct Circle : Shape {
    double r;
    Circle(double r_) : r(r_) {}
    string name() const override { return "Circle"; }
    double area() const override { return 3.14159 * r * r; }
};
struct Square : Shape {
    double s;
    Square(double s_) : s(s_) {}
    string name() const override { return "Square"; }
    double area() const override { return s * s; }
};

// Framework code: knows ONLY about Shape — it never names Circle/Square
void printAll(const vector<Shape*>& pic) {
    for (const Shape* sp : pic)
        cout << sp->name() << " area = " << sp->area() << '\n';   // dynamic dispatch
}

int main() {
    vector<Shape*> pic = { new Circle(2), new Square(3) };
    printAll(pic);                              // each call dispatches to the real type
    for (Shape* sp : pic) delete sp;            // virtual dtor -> the right destructor runs
}
```
**Output:**
```text
Circle area = 12.5664
Square area = 9
```
> 💡 The key lines are `sp->name()` / `sp->area()`: through a `Shape*`, the **actual** type (`Circle` or `Square`) decides what runs — that is polymorphism. `printAll` never mentions a concrete shape, so to support a new one (say `Triangle`) you **only add a new class** — the framework stays untouched. And `virtual ~Shape()` is what makes `delete sp` destroy the real object correctly (Q69).

---

# 8. Templates (Q74–77)

### Kinds of template parameters + defaults — (Q74) 💡
A template parameter list is comma-separated; the kinds are:
- **`typename T`** (a type parameter) — for containers of any element type. (`class T` means the same thing but is the older spelling.)
- **A non-type parameter**, e.g. **`int N`** — for things like array sizes or default counts.

They **can have defaults**, just like default function arguments:
```cpp
template <typename charType = char, int capacity = 100>
class basic_string { /* ... */ };   // std::wstring is basic_string with charType = wchar_t
```

### Template function — (Q75)
A function written once for **any type**; the compiler generates a concrete version per type used.
```cpp
template <typename Type>
Type min(Type a, Type b) { return a < b ? a : b; }
```
A template type `T` must support whatever operations the body uses (here `operator<`). You can **specialize** for a type where the generic version is wrong/inefficient:
```cpp
char * min(char * a, char * b) { return strcmp(a,b) < 0 ? a : b; }  // special-case C-strings
```

#### Overload resolution with templates — the priority ladder (and traps) 💡💡
When several versions could match a call, the compiler picks the **best match**, not "whoever was written first" — **writing order does not change which one is chosen.** Suppose three candidates share the name `mymin`:
```cpp
#include <iostream>
#include <cstring>
using namespace std;
template<typename T> T  mymin(T a, T b)   { cout << "[generic T]\n";          return a < b ? a : b; }
template<typename T> T* mymin(T* a, T* b) { cout << "[pointer T*]\n";         return *a < *b ? a : b; }
char* mymin(char* a, char* b)             { cout << "[non-template char*]\n"; return strcmp(a,b) < 0 ? a : b; }

int main() {
    int x = 1, y = 2;               mymin(x, y);     // int   -> only the generic T matches
    int a = 1, b = 2;               mymin(&a, &b);   // int*  -> T* beats T (more specialized)
    char s1[] = "ab", s2[] = "cd";  mymin(s1, s2);   // char* -> all 3 match -> non-template wins
}
```
**Output:**
```text
[generic T]
[pointer T*]
[non-template char*]
```
**The priority ladder** (applied once the candidates otherwise tie / are all exact matches): **(1)** a non-template function beats any template; **(2)** among templates, the **more specialized** one wins (`T*` is more specialized than `T` — every `T*` is also a `T`, but not the reverse); **(3)** otherwise the generic template. Reorder the three definitions however you like — the result is identical.

**⚠️ Trap 1 — `char* min(char*, char*)` is an overload, not a true specialization.** Klefstad's slides call it "specialize," but by the standard a real **explicit specialization** needs `template <>`:
```cpp
template <> char* min<char*>(char* a, char* b) { /* ... */ }   // explicit specialization
```
For the exam: when a template and a plain function are equally good, the **plain (non-template) one wins**. Plain overloads are also safer — an explicit specialization must be declared *before* the template is first used for that type, or you silently get the wrong version.

**⚠️ Trap 2 — `T min(T, T)` forces both arguments to be the same `T`.** Mixed types fail to deduce:
```cpp
char* cp; int* ip;
mymin(cp, ip);   // char* and int* -> ERROR: deduced conflicting types for 'T' ('char*' and 'int*')
```
To accept two independent types, use **two** type parameters:
```cpp
template <typename T, typename U> auto mymin(T a, U b) { return a < b ? a : b; }
mymin(3, 4.5);   // OK
```

### Instantiating a template **function** — (Q76)
Just **call it** — the compiler **deduces** the type from the arguments and instantiates that version:
```cpp
int    x = min(10, 20);       // Type = int
double y = min(10.5, 20.8);   // Type = double
```
(You can also force it explicitly: `min<double>(10, 20.8);`.)

### Instantiating a template **class** — (Q77) 💡
Supply the type argument(s) in angle brackets; that creates a real, usable type:
```cpp
Stack<double> dstack;          // a Stack of double
using intStack = Stack<int>;   // type alias (preferred over old 'typedef Stack<char> charStack;')
```
**A complete, runnable instantiation:** "instantiating" a class template means the compiler **stamps out a real, separate class for each type you use** — `Stack<int>` and `Stack<string>` are two distinct classes generated from the one template.
```cpp
#include <iostream>
#include <string>
using namespace std;

template <typename T>
class Stack {
    T buf[100];
    int len = 0;
public:
    void push(T x) { buf[len++] = x; }
    T    pop()     { return buf[--len]; }
    bool empty() const { return len == 0; }
};

int main() {
    using IntStack = Stack<int>;   // type alias for Stack<int>
    IntStack s;                    // exactly the same as 'Stack<int> s;'
    s.push(1); s.push(2);
    cout << s.pop() << '\n';       // 2

    Stack<string> w;               // or instantiate directly, no alias needed
    w.push("hi"); w.push("yo");
    cout << w.pop() << '\n';       // yo
}
```
**Output:**
```text
2
yo
```

> ⚠️ **Defining template methods outside the class:** every out-of-class method must be prefixed with the template parameter list **and** qualified with `ClassName<T>::`. Because of this, template definitions usually live **entirely in the `.hpp`** (the compiler needs the full definition to instantiate per type).
```cpp
template <typename T>
void Stack<T>::push(T x) { buf[len++] = x; }
```

**Function-resolution order** (overloads + templates, simplified): match non-template functions first; if exactly one, use it; else try template instantiations; if none, retry non-templates allowing type conversions. (`const` matching: a non-`const` formal can't bind a `const` actual; a `const&` formal binds either, creating a temporary for literals; a plain `&` formal needs a valid L-value — `swap(10,20)` is an error.)

---

# 9. Lambdas (Q78–80)

### What is a lambda — (Q78) 💡
An **anonymous local function object** you can define inline and pass to STL algorithms. Form: `[capture](params){ body }` (or `[]{}` with no params).
```cpp
auto fn = [](int i){ return i * i; };   // store in 'auto'
cout << fn(4) << endl;                  // 16
([](string s){ cout << "hello " << s << endl; })("world");   // define-and-call: (fn)(arg)
```
Lambdas shine as algorithm arguments:
```cpp
transform(V.begin(), V.end(), V.begin(), [](int i){ return i+1; });   // add 1 to each
for_each(istream_iterator<string>(in), istream_iterator<string>(),
         [&](string & s){ ++M[s]; });   // word-count: capture M by reference
```

### Lambda capture — (Q79)
The **`[ ]`** lists variables from the **enclosing scope** that the lambda may use inside its body, and **how** it grabs them (by reference or by copy). Without capturing, a lambda can't see local variables.

### Capture modes — (Q80) 💡
| Capture | Meaning |
|---|---|
| `[]` | capture **nothing** |
| `[&]` | capture all used variables **by reference** |
| `[=]` | capture all used variables **by copy** |
| `[M]` | capture only `M`, **by copy** (nothing else) |
| `[=, &M]` | `M` by **reference**, everything else by **copy** |
| `[&, M]` | `M` by **copy**, everything else by **reference** |
> ⚠️ **By reference (`&`)** sees/affects the live variable (e.g., `++M[s]` updates the real map). **By copy (`=`)** works on a private snapshot — changes don't propagate out, and capturing a big object by copy is expensive. By reference is dangerous if the lambda outlives the captured variable.

> ⚠️ **Order matters in exactly one spot — a default capture (`=` or `&`) must come first.** `[=, &x]` and `[&, x]` are fine; `[&x, =]` is a syntax error (`expected identifier before '='`). A named capture *after* a default must also use the **opposite** mode — `[=, x]` is rejected (`error: explicit by-copy capture of 'x' redundant with by-copy capture default`), so it has to be `[=, &x]`. (Listing the same variable twice — `[x, x]` — is an error too.)

> Note (Topic 7 "Rule of Zero"): lambdas + standard containers are why you so often need to write *none* of the special member functions.

---

# 10. Exceptions (Q81–85)

### `try`-`catch` to handle exceptions — (Q81) 💡
Put risky code in a **`try`** block; handle problems in one or more **`catch`** blocks. If something inside `try` (or a function it calls) `throw`s, control jumps to a matching `catch`, skipping the rest of the `try`.
```cpp
try {
    int i = v[10];          // may throw out_of_range
} catch (const std::out_of_range & e) {
    cerr << "bad index: " << e.what() << endl;
} catch (...) {             // catch-all
    cerr << "some other error" << endl;
}
```

### What an exception is, and why — (Q82)
An **exception** is a signal that a **run-time error** occurred (e.g., an out-of-bounds index or `pop()` on an empty stack). It's a **non-local alternative to `return`**: it lets you report an error from deep in a call chain to a handler far up the stack, *"but should be used with care."* (For **synchronous** errors only — not GUI events/interrupts/signals.)

### What is actually thrown — (Q83) 💡
**An object.** You can throw any value, but idiomatically you throw an object of an **exception class** (often from the standard hierarchy), carrying info about the error.
```cpp
char & operator[](int index) {
    if (!in_bounds(index)) throw std::string("index out of bounds");  // throw an object
    return buf[index];
}
```

**Build the message at run time with a `stringstream`** — fold in live values (capacity, index, …), then `throw` the resulting `string`:
```cpp
#include <iostream>
#include <sstream>
#include <string>
using namespace std;

struct Stack {
    int data[100]; int top = 0; int cap = 100;
    int pop() {
        if (top <= 0) {
            stringstream ss;
            ss << "pop() on empty stack of capacity " << cap;   // build the message with runtime values
            throw ss.str();                                     // throw the resulting std::string
        }
        return data[--top];
    }
};

int main() {
    Stack s;
    try { s.pop(); }                      // empty -> throws
    catch (const string& msg) {           // catch the thrown string
        cout << "caught: " << msg << '\n';
    }
}
```
**Output:**
```text
caught: pop() on empty stack of capacity 100
```
> 💡 `ss.str()` hands back everything streamed into `ss` as one `std::string`, so the thrown message can carry live data (here `cap`) that a plain string literal can't. (This course throws a `std::string`; the standard library instead throws `std::exception` subclasses whose `what()` carries the text.)

### How C++ matches `catch` to a `throw` — (Q84) 💡
The thrown object's **type** is matched against each `catch` clause **in order, top to bottom**; the **first compatible** handler runs. A `catch` for a **base** class type catches **derived** exceptions too (so order specific → general; `catch(...)` last). Matching is by type — there is **no** implicit numeric conversion as in function-argument matching.

**Example — a base handler catches derived exceptions, so order specific → general (with output):**
```cpp
#include <iostream>
#include <stdexcept>   // out_of_range, exception
using namespace std;

int main() {
    try {
        throw out_of_range("index 5 is out of range");   // out_of_range : logic_error : exception
    }
    catch (const out_of_range& e) {     // most specific FIRST -> this one runs
        cout << "out_of_range: " << e.what() << '\n';
    }
    catch (const exception& e) {        // base: would catch ANY std exception (incl. out_of_range)
        cout << "exception: " << e.what() << '\n';
    }
    catch (...) {                       // catch-all: last resort, no error info
        cout << "unknown error\n";
    }
}
```
**Output:**
```text
out_of_range: index 5 is out of range
```
> ⚠️ **Put the base handler after the specific ones.** Since `catch (const exception&)` also catches an `out_of_range`, writing it first makes the specific handler unreachable — g++ even warns: `exception of type 'std::out_of_range' will be caught by earlier handler`. Always order **specific → general**, with `catch (...)` last.
> 💡 **`e.what()`** is a `virtual` member of `std::exception` that returns a `const char*` — a short, human-readable description of the error. For the standard exceptions it is the message you passed to the constructor (here `"index 5 is out of range"`); your own exception classes can override `what()` to return their own text.

### Tracing a throw/catch program — (Q85)
Be able to predict the output. Key points: code **after** the throw inside the `try` is **skipped**; **local stack objects unwind** (their destructors run) as the stack unwinds to the handler; after the matching `catch` finishes, execution continues **after** the whole try/catch.

#### Standard exception hierarchy (root: `std::exception`) 💡
- Thrown by the language/runtime: **`bad_alloc`** (`new` failed), **`bad_cast`** (a `dynamic_cast` to a reference failed), **`bad_typeid`**, `ios::failure` (I/O error).
- **`logic_error`** (preventable by the programmer): `domain_error`, `invalid_argument`, `length_error` (e.g., appending too many chars onto a string), **`out_of_range`** (bad `operator[]` index).
- **`runtime_error`** (detected only at run time): `range_error`, `overflow_error`, `underflow_error`.

---

# 11. Namespaces (Q86–90)

### What a namespace is + why — (Q86) 💡
A **named scope** for grouping related identifiers, so names in different libraries don't collide. *All* C++ standard-library names live in namespace **`std`**. (In this course you put your linked-list helpers in `namespace list`, used as `list::Node`, `list::copy()`.)

### Create & use a namespace — (Q87)
```cpp
namespace mySpace {
    class Stack;
    void myStackFunction(Stack s);
}
mySpace::Stack stk;          // qualified use
mySpace::myStackFunction(stk);
```
> A namespace is **cumulative / open**: you can re-open it in another file and add more — the pieces combine.
```cpp
namespace mySpace { void another(); }   // adds 'another' to mySpace
```

### Opening a namespace so its names are directly visible — (Q88)
Three levels of "bring names in":
```cpp
mySpace::Stack stk;          // 1) fully qualified (no import)
using mySpace::Stack;        // 2) using-declaration: import ONE name
Stack stk;
using namespace mySpace;     // 3) using-directive: open the WHOLE namespace
using namespace std;         //    (everything becomes directly visible)
```

**What each one actually does:**
- **Fully qualified** (`mySpace::Stack`): no import at all — you write `namespace::name` every time. Never ambiguous; the right choice in a **header** (`.hpp`).
- **`using`-declaration** (`using mySpace::Stack;`): brings **one specific name** into the current scope, so afterward `Stack` alone means `mySpace::Stack`.
- **`using`-directive** (`using namespace mySpace;`): opens the **whole** namespace — every name in it becomes directly visible at once (handy, but can drag in clashes — see Q90).

```cpp
#include <iostream>
using namespace std;

namespace audio {
    void play()  { cout << "audio::play\n"; }
    int  volume = 7;
}

int main() {
    audio::play();              // 1) fully qualified — no import needed
    using audio::volume;        // 2) using-declaration: import just this one name
    cout << volume << '\n';     //    'volume' alone now means audio::volume
    using namespace audio;      // 3) using-directive: open the WHOLE namespace
    play();                     //    every audio name is now directly visible
}
```
**Output:**
```text
audio::play
7
audio::play
```
> 💡 Prefer them in this order of safety: **fully qualified > `using`-declaration > `using`-directive.** Qualifying never surprises you; a `using`-declaration imports exactly one name; a `using`-directive opens everything and is the one that can cause ambiguity — which is why **`using namespace std;` is banned in headers** (Q90).

### Namespace alias — (Q89)
Give a long namespace a short local name:
```cpp
namespace fs = std::filesystem;   // now write fs::path instead of std::filesystem::path
```

### Trade-offs: using a namespace vs not — (Q90) 💡
- **Pros:** avoids name clashes; organizes large libraries; lets two libraries reuse the same simple names.
- **Cons of opening one (`using namespace std;`):** pulls in *every* name, which can reintroduce ambiguity and hide bugs.
> ⚠️ **Course rule:** never `using namespace std;` in a **`.hpp`** (it forces the open namespace on every file that includes the header). Prefer qualifying (`std::cout`) or narrow `using std::cout;` declarations in `.cpp` files.

---

# 12. I/O Streams, Files & stringstreams (Q91–94)

### Inserters & extractors on streams — (Q91) 💡
- **`<<` is the inserter** — sends data **to** an output stream. It's a **left-associative binary** operator, so you can chain: `cout << a << b << endl;` parses as `((cout << a) << b) << endl`.
- **`>>` is the extractor** — reads data **from** an input stream; for strings it reads **one whitespace-delimited word** at a time, and **returns the stream**, which is *false* at end-of-file. That's why the read-loop idiom works:
```cpp
string word;
while (in >> word) { out << word << endl; }   // stops at EOF
```
- `getline(in, line)` reads a whole **line** (up to `'\n'`).

### Two examples of C++ streams — (Q92)
Any two of: **`cin`/`cout`/`cerr`** (terminal), **`ifstream`/`ofstream`** (files), **`istringstream`/`ostringstream`/`stringstream`** (in-memory strings). Streams can be terminal, file, string, socket, … and share the same `<<`/`>>` interface.
```cpp
#include <fstream>
ifstream in("input.txt");
ofstream out("output.txt");
string line;
while (getline(in, line)) out << line << endl;
in.close(); out.close();
```

### `iomanip` formatting (with example) — (Q93) 💡
`<iomanip>` manipulators control field width, alignment, precision, etc. From the Final-review deck: `endl`, `ends`, `left`, `right`, `setw(n)`.
```cpp
#include <iomanip>
cout << setw(8) << right << 42  << '\n';   // width 8, right-aligned: "      42"
cout << setw(8) << left  << "hi" << "|\n"; // left-aligned in width 8:  "hi      |"
cout << fixed << setprecision(2) << 3.14159 << '\n';   // "3.14"
```
> ⚠️ `setw(n)` applies to the **next item only**; alignment/precision flags are **sticky** (stay set until changed).

#### More `<iomanip>` / stream manipulators — (Q93) 💡
Q93 already showed `setw`, `left`/`right`, `setprecision`, and `fixed`. Here is the rest of the everyday toolbox, plus the **one-shot vs sticky** rule that exam questions love.

**The rest of the common manipulators** (all in `<iomanip>` unless noted; `<<` order matters):

| Manipulator | What it does |
|---|---|
| `setfill(c)` | Sets the **fill character** used to pad to `setw` width (default `' '`). |
| `left` / `right` / `internal` | **Alignment** within `setw`: pad on the right / pad on the left / pad **between sign and digits** (e.g. `-  42`). In `<iostream>`. |
| `setprecision(n)` | Number of digits: total significant digits in **default** mode, digits **after** the point under `fixed`/`scientific`. |
| `fixed` / `scientific` / `defaultfloat` | Float format: `3.14` / `3.14e+00` / general (`defaultfloat` resets to the default). In `<iostream>`. |
| `hex` / `oct` / `dec` | Integer base (16 / 8 / 10). In `<iostream>`. |
| `showbase` / `noshowbase` | Show the base prefix (`0x`, `0`) on integers. |
| `boolalpha` / `noboolalpha` | Print bools as `true`/`false` instead of `1`/`0`. |
| `uppercase` / `nouppercase` | Uppercase letters in hex (`0XFF`) and scientific (`1.5E+10`). |
| `showpos` / `noshowpos` | Print a leading `+` on non-negative numbers. |

```cpp
#include <iostream>
#include <iomanip>
std::cout << std::boolalpha << (1 < 2) << '\n';            // true   (not 1)
std::cout << std::hex << std::showbase << 255 << '\n';     // 0xff
std::cout << std::uppercase << std::hex << 255 << '\n';    // 0XFF
std::cout << std::dec << std::nouppercase << std::noshowbase; // undo the sticky hex/uppercase/base first
std::cout << std::showpos << 42 << '\n';                   // +42
std::cout << std::noshowpos;                               // reset back to plain decimal
```

⚠️ Note: every line above writes to the **same** `std::cout`, so the sticky flags accumulate. Without the reset line, `std::cout << std::showpos << 42` would print `0X2A` (hex + uppercase + base prefix still active), **not** `+42` — the exact sticky trap below.

⚠️ **One-shot vs sticky** — the single most-tested trap:
- `setw(n)` (and `width()`) is **one-shot**: it applies to **only the next inserted item**, then resets to 0.
- Everything else — `setfill`, `left`/`right`/`internal`, `setprecision`, `fixed`/`scientific`, `hex`/`oct`/`dec`, `boolalpha`, `showpos`, `uppercase`, … — is **sticky**: it stays in effect until you change it.

```cpp
std::cout << std::setfill('0') << std::setw(4) << 7 << '\n';  // 0007
std::cout << 7 << '\n';                                       // 7   (setw expired; setfill still set but no width to pad)
```

⚠️ **`endl` vs `'\n'`** — another classic:
- `'\n'` writes a newline **only**.
- `std::endl` writes a newline **and flushes the buffer** (forces output out now).
- Flushing is expensive, so spamming `endl` inside a hot loop is **slow** — prefer `'\n'` and let the stream flush on its own (or call `std::flush` once when you actually need it).

```cpp
for (int i = 0; i < 1'000'000; ++i)
    std::cout << i << '\n';     // fast: buffered
    // std::cout << i << std::endl;  // SLOW: flushes a million times
```

**Right-aligning a column (echoes Q93)** — `setfill` + sticky alignment, `setw` reapplied each row:

```cpp
int vals[] = {7, 42, 1234};
for (int v : vals)
    std::cout << std::setw(6) << v << '\n';   // pad with spaces (default)
//      7
//     42
//   1234

std::cout << std::setfill('0') << std::right; // sticky: set once
for (int v : vals)
    std::cout << std::setw(6) << v << '\n';   // re-apply setw each line (one-shot)
// 000007
// 000042
// 001234
```

💡 Pattern to remember: set the **sticky** state (`setfill`, alignment) **once before the loop**; re-issue the **one-shot** `setw(n)` **on every line**.

### `stringstream` (parse a line into typed components) — (Q94) 💡💡 (you use this in HW8 `compute_grades`)
A **`stringstream`** is a stream backed by a string — you can extract typed values from it with `>>` just like from `cin`. The standard pattern is **`getline` a whole line, then wrap it in a `stringstream`** to parse fields. This **bounds** parsing to that one line (it can't accidentally read into the next line).
```cpp
#include <sstream>
string line = "Alice 95 88 77";
istringstream ss(line);
string name; int q1, q2, q3;
ss >> name >> q1 >> q2 >> q3;   // name="Alice", q1=95, q2=88, q3=77
```
🐍 Like `line.split()` in Python, but type-aware (it converts `"95"` straight into an `int`).

---

# 13. STL Containers, Iterators & Algorithms (Q95–109)

> The STL is **three composable pieces** (largely Alexander Stepanov's design): **containers** hold things, **algorithms** do things, and **iterators** connect any algorithm to any container. Plus **function objects/lambdas** (make algorithms flexible) and **standard exceptions**.

### STL container — (Q95)
A class template that **holds a collection** of objects. Two big families:
- **Sequence containers** (ordered): `array`, **`vector`** (dynamic array), `list` (doubly linked), `forward_list` (singly linked), `deque` (push/pop both ends).
- **Associative containers** (sorted): **`set`**, `multiset`, **`map`**, `multimap`, plus the `unordered_` (hash) versions.
```cpp
vector<int> v;  for (int i=0;i<100;++i) v.push_back(i);   // dynamic array
```

### STL algorithm — (Q96)
A function template that **processes a range** (copy, find, sort, transform, accumulate…). It works on **any** container because it talks to **iterators**, not the container directly.
```cpp
#include <algorithm>
#include <ranges>      // the ranges:: versions (C++20)

// classic form — pass a [first, last) iterator pair that marks the range:
sort(V.begin(), V.end());                 // (first, last): begin() = first, end() = one-past-last
auto pos = find(V.begin(), V.end(), 3);   // (first, last, value) -> iterator to the 3 (else end())

// C++20 ranges form — pass the whole container, no begin()/end():
ranges::sort(V);                          // (range)
auto pos2 = ranges::find(V, 3);           // (range, value)
```

### Container iterator — (Q97)
An object that **points into a container** (like an array pointer), letting you read/advance through elements. Every container provides `C.begin()` (first) and `C.end()` (**one past** the last).
```cpp
for (vector<int>::iterator p = V.begin(); p != V.end(); ++p)
    cout << *p << endl;   // *p reads the current element
```
**Iterator operations:** `*` (current element), `->` (member of current), `++` (next), `--` (previous, if supported), `==`/`!=`, `=`.

### Relationship between containers, algorithms & iterators — (Q98) 💡
Iterators are the **glue**: an algorithm is written against the iterator interface, so the *same* algorithm runs on a `vector`, `list`, `set`, etc. This is why STL is "composable" — N containers + M algorithms work in all N×M combinations through one iterator abstraction.

### Range-based `for` loop — (Q99) 💡
Iterates over every element of a container without explicit iterators:
```cpp
for (auto e : V)        cout << e;       // e is a COPY of each element
for (auto const & E : V) cout << E;       // E is a const reference (no copy) — preferred for reading
for (auto & E : V)       E += 1;          // reference — lets you modify elements
for (auto x : {1,2,3,4,5}) cout << x;     // works on initializer lists too
```
🐍 This is C++'s `for x in V:`.

### `std::string` container (with example) — (Q100)
A sequence of characters with random access and rich operations (`=`, `+`, `+=`, `==`, `[]`, `.size()`, iterators):
```cpp
string s = "hello";
s[0] = 'H';
for (char c : s) cout << c;   // Hello
```

### `std::vector` (with example) — (Q101) 💡
A **dynamic array** — fast random access via `operator[]`, fast append/remove at the **back** (`push_back`, `pop_back`, `back`) in O(1) amortized.
```cpp
vector<int> v(100, 0);   // 100 elements, all 0
v.push_back(7);
cout << v[0] << " " << v.back() << " " << v.size();
```
🐍 The C++ equivalent of a Python `list`.

**⚠️ `()` vs `{}` when constructing — they can mean different things.** With `{}`, if the type has an `initializer_list` constructor (every STL container does), the braces prefer **that**, so the values become the *elements*:
```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a(100);    // (100): 100 ints, all 0
    vector<int> b{100};    // {100}: ONE int with value 100   <- the surprise
    vector<int> c(3, 7);   // (3,7): 3 ints, all 7
    vector<int> d{3, 7};   // {3,7}: 2 ints, 3 and 7

    cout << "a(100): size=" << a.size() << '\n';
    cout << "b{100}: size=" << b.size() << "  first=" << b[0] << '\n';
    cout << "c(3,7): size=" << c.size() << "  {" << c[0] << "," << c[1] << "," << c[2] << "}\n";
    cout << "d{3,7}: size=" << d.size() << "  {" << d[0] << "," << d[1] << "}\n";
}
```
**Output:**
```text
a(100): size=100
b{100}: size=1  first=100
c(3,7): size=3  {7,7,7}
d{3,7}: size=2  {3,7}
```
> 💡 Rule: `(...)` always calls a normal constructor (here the *count* ctor); `{...}` prefers the `initializer_list` ctor when one exists, treating the contents as **elements**. For a type with no `initializer_list` ctor the two forms agree. `{}` also forbids narrowing (Q20) — so it's the safer default *except* for sized containers, where you usually want `()`.

### `std::map` (with example) — (Q102) 💡
A **sorted** associative container of **`pair<key, value>`**, indexable by **any** key type; **unique keys**; `insert`/`find`/`erase` are **O(log N)**; iterates in **key order**.
```cpp
map<string,int> A;
A["Bill"] = 33; A["George"] = 29; A["Al"] = 27;
for (auto const & [name, age] : A)        // C++17 structured bindings ("destructuring for")
    cout << name << " is " << age << " "; // Al is 27 Bill is 33 George is 29  (sorted by key)
```
> ⚠️ **`operator[]` on a map silently inserts a default-valued entry if the key is absent** — a classic trap. Use `.find()` if you only mean to look up.
🐍 Like a Python `dict`, but **kept sorted by key**.

**Two ways to read a map's key/value — side by side:**
```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string,int> m = {{"Al", 27}, {"Bill", 33}};

    for (const auto& [key, val] : m)               // way 1: structured bindings (C++17)
        cout << key << '=' << val << ' ';
    cout << '\n';

    for (const auto& p : m)                         // way 2: .first / .second
        cout << p.first << '=' << p.second << ' ';  // each element is pair<const string, int>
    cout << '\n';
}
```
**Output:**
```text
Al=27 Bill=33
Al=27 Bill=33
```
> 💡 A `map` element is a `pair<const Key, Value>`, so `[key, val]` just unpacks that pair: `key` ≡ `p.first` and `val` ≡ `p.second`. (Through an iterator it is `it->first` / `it->second`.) The `const` on the key means you may change `val` / `.second`, but never the key.

### `std::set` (with example) — (Q103)
A **sorted** collection of **unique** values (the element *is* its own key); `insert`/`find`/`erase` O(log N). `multiset` allows duplicates.
```cpp
set<char> S;
for (char c='A'; c<='Z'; ++c) S.insert(c);
for (char c='Z'; c>='A'; --c) S.insert(c);   // duplicates ignored
for (auto E : S) cout << E;                  // ABC...Z, each once
if (S.find('A') != S.end()) cout << "A is in there";
```
🐍 Like a Python `set`, but **sorted**.

### `std::pair` (with example) — (Q104)
Holds **two values** of possibly different types, accessed as `.first` and `.second`. A `map`'s elements are pairs.
```cpp
pair<string,int> p{"Al", 27};
cout << p.first << " " << p.second;   // Al 27
```

### Map vs set — (Q105) 💡
Both are **sorted, unique-keyed** associative containers. The difference: a **set** stores **just keys** (the value is the key); a **map** stores **key→value pairs**, sorted **by the key (`.first`)**, with the value (`.second`) along for the ride.

#### Common container operations — quick reference 💡
The member functions you reach for day to day (each container's own example is Q100–Q104):

| What you want | Syntax | Big-O | Containers |
|---|---|---|---|
| add at the back | `c.push_back(x)`, `c.emplace_back(args)` | amortized O(1) | `vector` `deque` `list` |
| remove from the back | `c.pop_back()` | O(1) | `vector` `deque` `list` |
| add / remove at the front | `c.push_front(x)` / `c.pop_front()` | O(1) | `deque` `list` |
| first / last element | `c.front()` / `c.back()` | O(1) | `vector` `deque` `list` |
| size / is-empty / wipe | `c.size()`, `c.empty()`, `c.clear()` | O(1); `clear()` O(n) | all |
| element access (unchecked / checked) | `v[i]` / `v.at(i)` | O(1) | `vector` `deque` `string` |
| erase by position / range | `c.erase(it)`, `c.erase(first, last)` | O(n); `list` O(1)/node | `vector` `deque` `list` `string` |
| insert / find / count / contains / erase | `c.insert(x)`, `c.find(x)`, `c.count(x)`, `c.contains(x)` (C++20), `c.erase(x)` | O(log n); `unordered_` avg O(1) | `set` `map` |
| keyed access | `m[k]` (inserts if absent!), `m.at(k)` | O(log n) | `map` |
| adapters | stack: `push` / `pop` / `top`; queue: `push` / `pop` / `front` / `back` | O(1) | `stack` `queue` |

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;
    v.push_back(10);                 // [10]
    v.push_back(20);                 // [10, 20]
    v.emplace_back(30);              // [10, 20, 30]  (constructs in place)
    cout << v.size() << " " << v.front() << " " << v.back() << '\n';   // 3 10 30
    v.pop_back();                    // [10, 20]
    v[0] = 99;                       // unchecked write -> [99, 20]
    cout << v.at(1) << " " << (v.empty() ? "empty" : "filled") << '\n'; // 20 filled
    v.clear();                       // []
    cout << v.size() << '\n';        // 0
}
```
**Output:**
```text
3 10 30
20 filled
0
```
> ⚠️ `v[i]` and `v.at(i)` differ on a bad index: `[]` is **unchecked** (undefined behavior), `at()` **throws `std::out_of_range`**. And `m[k]` on a `map` **inserts a default entry** when `k` is absent — for a pure membership test use `m.contains(k)` (C++20, returns `bool`), or the older `m.find(k) != m.end()` / `m.count(k)` (Q102). (`string::contains` only arrived in C++23.)

#### Iterating a container — the ways to loop 💡
Same data, several styles (range-based `for` is Q99, the iterator loop is Q97):
```cpp
#include <iostream>
#include <vector>
#include <map>
#include <string>
using namespace std;

int main() {
    vector<int> v = {10, 20, 30};

    for (size_t i = 0; i < v.size(); ++i) cout << v[i] << ' ';          // 1) index loop (vector/deque/string)
    cout << '\n';
    for (auto it = v.begin(); it != v.end(); ++it) cout << *it << ' ';  // 2) iterator loop (any container)
    cout << '\n';
    for (auto x : v) cout << x << ' ';                                  // 3) range-for by value (a copy)
    cout << '\n';
    for (const auto& x : v) cout << x << ' ';                           // 4) range-for by const& (read, no copy)
    cout << '\n';
    for (auto& x : v) x += 1;                                           // 5) range-for by & (modify in place)
    for (const auto& x : v) cout << x << ' ';
    cout << '\n';
    for (auto it = v.rbegin(); it != v.rend(); ++it) cout << *it << ' '; // 6) reverse iterator
    cout << '\n';

    map<string,int> m = {{"a",1},{"b",2}};
    for (const auto& [key, val] : m) cout << key << '=' << val << ' ';  // 7) structured bindings (map/pair)
    cout << '\n';
}
```
**Output:**
```text
10 20 30
10 20 30
10 20 30
10 20 30
11 21 31
31 21 11
a=1 b=2
```
> 💡 Read with **`for (const auto& x : v)`** (no copy), modify with **`for (auto& x : v)`**; plain `for (auto x : v)` copies each element. The **index loop** works only on random-access containers (`vector`/`deque`/`string`); the **iterator loop** works on every container. `rbegin()`/`rend()` go backwards, and structured bindings `[key, val]` unpack a `map`/`pair`.

#### Inserting / erasing while iterating — iterator invalidation 💡💡
Modifying a container mid-loop can **invalidate** the iterator you hold; the fix is to reseat it on the iterator that `erase`/`insert` **returns** — never `++` an erased iterator:
```cpp
// WRONG: erase invalidates `it`, so the next ++it is undefined behavior
for (auto it = v.begin(); it != v.end(); ++it)
    if (*it % 2 == 0) v.erase(it);          // dangling it  (a -D_GLIBCXX_DEBUG build aborts here)

// RIGHT: erase returns an iterator to the next element; advance only when you DON'T erase
for (auto it = v.begin(); it != v.end(); )  // note: no ++it in the loop header
    if (*it % 2 == 0) it = v.erase(it);     // reseat it on the returned iterator
    else              ++it;
```
For a `vector`, prefer the **erase–remove idiom** (or the C++20 one-liner) over a hand-written loop:
```cpp
#include <algorithm>   // remove_if
v.erase(remove_if(v.begin(), v.end(), [](int x){ return x % 2 == 0; }), v.end());
std::erase_if(v, [](int x){ return x % 2 == 0; });   // C++20: same effect, one line
```
**Output** — the manual `erase` loop, the erase–remove idiom, and `erase_if` all turn `{1, 2, 3, 4, 5, 6}` into:
```text
1 3 5
```
⚠️ **Invalidation rules differ by container:**
- **`vector` / `deque` / `string`** — `erase`/`insert` invalidate every iterator and reference **at or after** the edit point; a reallocating `push_back`/`insert` invalidates **all** of them. Always reseat from the returned iterator.
- **`list`** — only the **erased** element's iterator dies; `insert` invalidates nothing. (Cheap middle edits are the whole reason to reach for `list`.)
- **`set` / `map` / `unordered_*`** (node-based) — `erase` invalidates **only the erased** iterator and (since C++11) **returns the next** one, so the same `it = c.erase(it)` loop works here too.

#### Container complexity — what the operations table doesn't show 💡
Two cross-container facts you can't read off the operations table above (random access, back/front insert, and find are already in its **Big-O** column):
| Operation | `vector` | `deque` | `list` | `set` / `map` | `unordered_set/map` |
|---|:---:|:---:|:---:|:---:|:---:|
| Insert/remove in **middle** (have iterator) | O(n) | O(n) | **O(1)** | — | — |
| Iteration order | insertion | insertion | insertion | **sorted by key** | unspecified |

> 💡 Choose by what must be fast: random access → `vector`; many front ops → `deque`; cheap middle insert/erase **when you already hold an iterator** → `list`; **sorted** keyed lookup → `set`/`map`; fastest **unsorted** lookup → `unordered_*`.

### `std::transform` (with example) — (Q106) 💡
Applies a function to each element of a source range and writes the results to a destination.
```cpp
// classic: transform(first, last, dest, op)
//   first,last = source range;  dest = where results go;  op = function applied to each element
transform(V.begin(), V.end(), V.begin(), [](int i){ return i+1; });   // dest == source -> in place: each +1
transform(begin(L1), end(L1), back_inserter(L2), square);             // L2 = squares of L1

// C++20 ranges: transform(range, dest, op)
ranges::transform(V, V.begin(), [](int i){ return i+1; });            // in place
ranges::transform(L1, back_inserter(L2), square);                     // L2 = squares of L1
```

### `std::accumulate` (with example) — (Q107) 💡
Reduces a range to a single value (sum by default), starting from an initial value. Lives in **`<numeric>`**.
```cpp
// accumulate(first, last, init [, op])
//   first,last = range;  init = starting value AND it fixes the RESULT TYPE;  op = combine (default +)
int total = accumulate(V.begin(), V.end(), 0);                       // sum, starting from 0
int prod  = accumulate(V.begin(), V.end(), 1, [](int a, int b){ return a*b; });  // product, from 1
```
> ⚠️ **Course note (HW8):** `accumulate` has **no `ranges::` version** — call it with the classic iterator-pair syntax (`accumulate(begin, end, init)`), even when you use `ranges::` versions of other algorithms.

> ⚠️ The `init` argument also fixes the **result type**: on a `vector<double>`, `accumulate(d.begin(), d.end(), 0)` accumulates into an **`int`** (truncates!) — pass `0.0` to get a `double`.

### `std::copy` and `std::move` — (Q108) 💡
- **`copy(first, last, dest)`** copies a range to a destination iterator. Pair it with an **insert iterator** so the destination grows:
```cpp
// copy(first, last, dest):  first,last = source range;  dest = output iterator
copy(L.begin(), L.end(), back_inserter(V));   // back_inserter -> V.push_back() for each
copy(istream_iterator<string>(in), istream_iterator<string>(),   // read words until EOF...
     back_inserter(V));                                          // ...into V
unique_copy(V.begin(), V.end(), ostream_iterator<string>(out, "\n"));  // write, skip adjacent dups
ranges::copy(L, back_inserter(V));            // C++20 ranges form: copy(range, dest)
```
- **`std::move` (the function)** casts an L-value to an R-value reference so a **move** (steal resources) happens instead of a copy: `b = std::move(a);` — afterward `a` is in a valid-but-empty state. Don't confuse the move *cast* with `memmove`/copying.
- **`std::move` (the algorithm)** is a different thing with the same name: it move-assigns a whole range into a destination (each element is left empty), e.g. `ranges::move(src, back_inserter(dst));`. Same shape as `copy`, but it *moves* rather than copies.

### `std::for_each` and `std::copy_if` 💡
- **`for_each(first, last, fn)`** runs `fn` on every element — for its **side effect** (print, mutate). Give the lambda a `T&` parameter and it can modify the elements in place.
- **`copy_if(first, last, dest, pred)`** copies only the elements for which `pred(x)` is true (it is `copy` + `filter` in one call).
```cpp
#include <iostream>
#include <vector>
#include <iterator>   // back_inserter, ostream_iterator
#include <algorithm>  // for_each, copy_if, ranges::*
#include <ranges>
using namespace std;

int main() {
    vector<int> v = {1, 2, 3, 4, 5, 6};

    // for_each: run a function on EVERY element (here: just print).
    cout << "print:  ";
    for_each(v.begin(), v.end(), [](int n){ cout << n << ' '; });
    cout << '\n';

    // for_each with a T& parameter MODIFIES each element in place:
    for_each(v.begin(), v.end(), [](int& n){ n *= 10; });    // each *= 10
    cout << "x10:    ";
    ranges::for_each(v, [](int n){ cout << n << ' '; });     // ranges form: whole container
    cout << '\n';

    // copy_if: copy ONLY the elements that pass the predicate.
    vector<int> picked;
    copy_if(v.begin(), v.end(), back_inserter(picked),
            [](int n){ return n % 20 == 0; });               // keep multiples of 20
    cout << "mult20: ";
    ranges::copy(picked, ostream_iterator<int>(cout, " "));  // ranges::copy to print
    cout << '\n';
}
```
**Output:**
```text
print:  1 2 3 4 5 6 
x10:    10 20 30 40 50 60 
mult20: 20 40 60 
```
> 💡 All four take iterator pairs in the classic form and a whole range in the `ranges::` form. The `_if` family (`copy_if`, `find_if`, `count_if`, `remove_if`) takes a **predicate** (returns `bool`); `transform`/`for_each` take an **operation** (does work / returns a new value).

### Iterator vs `const_iterator` — (Q109)
- A plain **`iterator`** lets you read **and modify** the element it points to (`*it = x;`).
- A **`const_iterator`** lets you **read only** (`*it` is const) — used when iterating a `const` container or when you don't intend to change elements (`cbegin()`/`cend()` give const iterators).

#### Iterator categories (which container gives which) 💡
| Category | Can… | Containers |
|---|---|---|
| input / output | read **or** write a sequence once, forward | stream iterators |
| forward | read+write, move `++` | `forward_list`; your HW9 `SetList` iterator |
| bidirectional | `++` **and** `--` | `list`, `set`, `map`, `multiset`, `multimap` |
| random access | bidirectional **+ `[]`, `+n`** | `vector`, `deque`, `string`; your HW9 `MapArray` iterator |
| contiguous (C++17) | random access + physically adjacent | `array`, `vector`, `string` |

#### Declaring an iterator's category — `iterator_category` & `iterator_traits` 💡
A custom iterator advertises **which of those categories it is** with five member typedefs, so STL algorithms can pick the best implementation. The key one is `iterator_category`, set to a **tag type**:
```cpp
struct MyIter {
    using iterator_category = std::forward_iterator_tag;   // <- the category tag
    using value_type        = int;
    using difference_type   = std::ptrdiff_t;
    using pointer           = int*;
    using reference         = int&;
    // ... plus the operator*, operator++, operator==, ... this category requires
};
```
The tags, weakest → strongest: `input_iterator_tag` / `output_iterator_tag` → `forward_iterator_tag` → `bidirectional_iterator_tag` → `random_access_iterator_tag` → `contiguous_iterator_tag` (C++20). Read one back with `std::iterator_traits<It>::iterator_category` (library iterators report their own — `vector<int>::iterator` is `random_access_iterator_tag`, `list<int>::iterator` is `bidirectional_iterator_tag`).
> 💡 Why it matters: algorithms **dispatch on the tag**. `std::distance(a, b)` and `std::advance(it, n)` are **O(1)** on a random-access iterator (just `b - a` / `it += n`) but **O(n)** on a forward/bidirectional one (step one at a time). ⚠️ Declaring a *stronger* category than your iterator truly supports is a bug — algorithms will then call operations (`+= n`, `[]`, `--`) you never wrote.

#### Writing `operator++` / `operator--` by iterator category 💡 (HW9)
**The pre/post "shell" is fixed for every category — only "the step" (the one commented line) changes:**
```cpp
// PRE-increment: do one step, return *this BY REFERENCE
Iter& operator++() { /* one step forward */ return *this; }

// POST-increment: save old value, reuse pre-increment, return the OLD copy
Iter  operator++(int) { Iter tmp = *this; ++(*this); return tmp; }
```
- The `int` parameter is an **unused dummy** that only distinguishes post from pre.
- **Post-increment is always "save a copy + call pre-increment"** — this never changes across categories. The thing that differs between categories is the *step* inside pre-increment.
- `--` has the identical shape; its step is "one step **backward**." Prefer `++it` over `it++` in loops (post makes an extra copy).

**① forward** — singly-linked list (your `SetList`). Only `++`; **no `--`** (can't go back).
```cpp
// member: ListNode* current;
Iter& operator++()    { current = current->next; return *this; }   // step = follow `next`
Iter  operator++(int) { Iter tmp = *this; ++(*this); return tmp; }
// NO operator-- : forward doesn't require it, and a singly-linked list can't do it
```

**② bidirectional** — doubly-linked list / tree (the *real* `std::set` / `std::map`). Both `++` and `--`, one node at a time.
```cpp
// member: Node* current;   (each node has BOTH prev and next)
Iter& operator++()    { current = current->next; return *this; }   // step forward = `next`
Iter  operator++(int) { Iter t = *this; ++(*this); return t; }
Iter& operator--()    { current = current->prev; return *this; }   // step back = `prev`  ← what bidi adds over forward
Iter  operator--(int) { Iter t = *this; --(*this); return t; }
// still NO +n : to go back 3, call -- three times
```

**③ random-access** — contiguous memory (your `MapArray`; member is a raw pointer). `++`/`--` are pointer arithmetic, and you also get jumps.
```cpp
// member: value_type* current;   (value_type = std::pair<const Key, Value>)
Iter& operator++()    { ++current; return *this; }   // step = pointer ++ (address + sizeof(elem))
Iter  operator++(int) { Iter t = *this; ++current; return t; }
Iter& operator--()    { --current; return *this; }
Iter  operator--(int) { Iter t = *this; --current; return t; }
```

**The random-access extras — the `+= -= + -` family (plus `[]`, comparisons, and iterator-distance) — this is what makes it "random access":**
```cpp
using difference_type = std::ptrdiff_t;

// jump in place (return *this by reference)
Iter& operator+=(difference_type n) { current += n; return *this; }
Iter& operator-=(difference_type n) { current -= n; return *this; }

// jump producing a NEW iterator (return by value)
Iter  operator+(difference_type n) const { return Iter{ current + n }; }   // it + n
Iter  operator-(difference_type n) const { return Iter{ current - n }; }   // it - n

// DISTANCE between two iterators — returns a NUMBER, not an iterator
difference_type operator-(const Iter& o) const { return current - o.current; }   // it2 - it1

// subscript:  it[k]  ==  *(it + k)
reference operator[](difference_type k) const { return current[k]; }

// ordering — forward/bidirectional only have == and != ; random-access adds these:
bool operator<(const Iter& o) const  { return current <  o.current; }
bool operator>(const Iter& o) const  { return current >  o.current; }
bool operator<=(const Iter& o) const { return current <= o.current; }
bool operator>=(const Iter& o) const { return current >= o.current; }
```
> 💡 **Capability stacks by category.** forward gives `++ == != * ->`; bidirectional **adds** `--`; random-access **adds** `+= -= + -`, `it2 - it1`, `[]`, and `< > <= >=`. All of it is nearly free in `MapArray` precisely because `current` is a **raw pointer**, so `current += n` already does the correct address arithmetic. (For full symmetry, `n + it` is provided as a free function `Iter operator+(difference_type n, const Iter& it)`, since the member form only handles `it + n`.)
> ⚠️ **Vs. the Week 9 code:** Klefstad's HW9 `SetList`/`MapArray` return pre-increment **by value** (`iterator operator++()`, matching his slide 12). The `Iter&` form above is the standard one used by real `std::` iterators — both compile because both `return *this`, but `Iter&` is the canonical, copy-free form.


#### Iterator **adapters** (used constantly in the algorithm examples) 💡
- **Insert iterators:** `back_inserter(c)` → `c.push_back`; `front_inserter(c)` → `c.push_front`; `inserter(c, pos)` → `c.insert` (the only one that works on `set`/`map`).
- **Stream iterators:** `istream_iterator<T>(in)` reads `T`s with `>>` (default-constructed `istream_iterator<T>()` = the EOF end marker); `ostream_iterator<T>(out, "sep")` writes with `<<`, **appending the separator after every element** (including the last).
- **Reverse iterators:** `c.rbegin()`/`c.rend()` walk backward.

#### C++20 Ranges & views (Topic 9) 💡

Two related C++20 features, both living in `<ranges>`.

**(1) `ranges::` algorithms — pass the whole container.** A *range* is just a `begin()..end()` pair, and every container already is one. So the `ranges::` version of an algorithm takes the container directly — no more `.begin()`/`.end()`:
```cpp
ranges::sort(v);                 // instead of  sort(v.begin(), v.end())
auto it = ranges::find(v, 42);   // instead of  find(v.begin(), v.end(), 42)
```

**(2) Views — lazy pipelines built with `|`.** A *view* (in `std::ranges::views`) is a lightweight range you build by piping a source through adaptors such as `filter` and `transform`. Read it left to right: `v | filter(...) | transform(...)` means *"take `v`, keep the elements that pass the filter, then transform each survivor."* The result is itself a range, so you can range-`for` over it.

The whole point is the word **lazy**: building the pipeline computes *nothing*. The filter/transform run only while you iterate, one element at a time, and only for the elements you actually reach.
```cpp
#include <iostream>
#include <vector>
#include <ranges>     // std::ranges and std::ranges::views (C++20)
#include <algorithm>  // ranges::sort
using namespace std;
namespace rv = std::ranges::views;   // short alias: rv:: == views::

int main() {
    vector<int> v = {5, 2, 8, 1, 4, 7, 6, 3};

    ranges::sort(v);                       // (1) whole-container algorithm
    cout << "sorted: ";
    for (int x : v) cout << x << ' ';
    cout << '\n';

    // (2) build a pipeline: keep evens, then square them. Nothing runs yet.
    auto pipeline = v | rv::filter([](int n){ return n % 2 == 0; })
                      | rv::transform([](int n){ return n * n; });
    cout << "even squares: ";
    for (int x : pipeline) cout << x << ' ';   // work happens HERE, on demand
    cout << '\n';

    // (3) take(3) stops early -- the 4th even number is never even squared.
    cout << "first 3 even squares: ";
    for (int x : v | rv::filter([](int n){ return n % 2 == 0; })
                   | rv::transform([](int n){ return n * n; })
                   | rv::take(3))
        cout << x << ' ';
    cout << '\n';
}
```
**Output:**
```text
sorted: 1 2 3 4 5 6 7 8 
even squares: 4 16 36 64 
first 3 even squares: 4 16 36 
```

Want to *see* the laziness? Drop a print inside the transform and watch when it fires:
```cpp
vector<int> v = {1, 2, 3, 4};
auto squares = v | rv::transform([](int n){
    cout << "  [computing " << n << '*' << n << "]\n";   // marks WHEN work runs
    return n * n;
});
cout << "view built (nothing computed yet)\n";
for (int x : squares) cout << "got " << x << '\n';
```
**Output:**
```text
view built (nothing computed yet)
  [computing 1*1]
got 1
  [computing 2*2]
got 4
  [computing 3*3]
got 9
  [computing 4*4]
got 16
```
> 💡 Look at the order: `view built` prints first, then each square is computed *right before* its own `got` line — the work is interleaved with the loop, never done up front. That is exactly what "lazy / on demand" means, and it is why `take(3)` above keeps the 4th even number from ever being squared.

| Adaptor | What it does |
|---|---|
| `filter(pred)` | keep only the elements where `pred(x)` is true |
| `transform(f)` | replace each element `x` with `f(x)` |
| `take(n)` / `drop(n)` | keep the first `n` / skip the first `n` |
| `reverse` | walk the range back to front |

#### Smart pointers (Topic 9) — RAII for single objects 💡
- **`unique_ptr<T>`** — sole owner; deletes the object when it dies; **copy is deleted** (move only, via `std::move`). `auto p = std::make_unique<T>(args);`
- **`shared_ptr<T>`** — shared ownership; the object is deleted when the **last** `shared_ptr` dies (reference counting). `auto sp = std::make_shared<T>(args);`
**Two ways to create one — and why the first is discouraged:**
```cpp
// ❌ Discouraged — raw new: you name the type twice, and it is exception-unsafe.
unique_ptr<Widget> a{new Widget(1)};   // works, but verbose
shared_ptr<Widget> b{new Widget(2)};   // also forces a SECOND heap allocation

// ✅ Preferred — make_xxx: type written once, no visible `new`.
auto a = make_unique<Widget>(1);
auto b = make_shared<Widget>(2);       // one allocation for object + control block
```
**A full run, using the preferred form:**
```cpp
#include <iostream>
#include <memory>      // unique_ptr, shared_ptr, make_unique, make_shared
using namespace std;

struct Widget {
    int id;
    Widget(int i) : id(i) { cout << "ctor " << id << '\n'; }
    ~Widget()             { cout << "dtor " << id << '\n'; }
};

int main() {
    auto u = make_unique<Widget>(1);     // unique_ptr<Widget>, the sole owner
    cout << "u->id = " << u->id << '\n'; // use it like a raw pointer
    auto u2 = std::move(u);              // transfer ownership; u is now null
    cout << "u is " << (u ? "set" : "null") << '\n';

    auto s = make_shared<Widget>(2);     // shared_ptr<Widget>, use_count = 1
    auto s2 = s;                         // copy -> shared ownership, use_count = 2
    cout << "use_count = " << s.use_count() << '\n';
}   // u2 frees Widget 1; Widget 2 freed when the last shared_ptr dies
```
**Output:**
```text
ctor 1
u->id = 1
u is null
ctor 2
use_count = 2
dtor 2
dtor 1
```
> 💡 Why `make_xxx` instead of `unique_ptr<T>(new T(...))`? (1) **exception-safe** — no leak if some other argument's evaluation throws; (2) you write the type **once** (no `new T`); (3) `make_shared` uses a **single allocation** for the object + its control block. Use the pointer like any other: `p->member`, `*p`, `p.get()` for the raw pointer, `p.reset()` to free early.

**Common mistake — copying a `unique_ptr` won't compile:**
```cpp
auto u = make_unique<Widget>(1);
auto bad = u;             // ❌ tries to COPY — unique_ptr has no copy constructor
auto ok  = std::move(u);  // ✅ move instead: ownership transfers, u becomes null
```
The compiler stops you — this is a build error, not a runtime surprise (template noise trimmed):
```text
error: use of deleted function
       'std::unique_ptr<...>::unique_ptr(const std::unique_ptr<...>&)'
note: declared here
  unique_ptr(const unique_ptr&) = delete;
```
> 💡 A `unique_ptr` is the *sole* owner, so copying it would make two owners that both try to `delete` the same object. C++ deletes the copy constructor to turn that into a **compile error** instead of a double-free. `shared_ptr` is the opposite — copying is fine, it just bumps the reference count.

> ⚠️ **HW9 trap (from the Topic 9 slides):** if a linked-list node's `next` is a `unique_ptr`, **iterators can't alias the list** — so for `SetList` you must use a **raw `ListNode*`**, not `unique_ptr`, for `next`.

| | `unique_ptr<T>` | `shared_ptr<T>` |
|---|:---:|:---:|
| Owners | exactly **1** | **1..many** (ref-counted) |
| Copyable? | ❌ (copy `= delete`) | ✅ (bumps the count) |
| Movable? | ✅ (transfers ownership) | ✅ |
| Overhead | none beyond `T` | a control block (count + deleter) |
| Frees the object when | the `unique_ptr` dies | the **last** `shared_ptr` dies (count → 0) |
| Make it with | `std::make_unique<T>(args)` | `std::make_shared<T>(args)` |

> 💡 Default to **`unique_ptr`** (cheaper, unambiguous ownership); use `shared_ptr` only when ownership is genuinely shared. Prefer `make_unique`/`make_shared` over raw `new` (exception-safe, no repeated type name). This is the modern face of RAII: with smart-pointer (or `std::vector`/`std::string`) members, the **Rule of Three collapses into the Rule of Zero** — you write *none* of the special functions.

---

# Appendix A — Klefstad's aphorisms (keep these in mind)

These are the professor's own sayings from the decks — the kind of "wisdom" that shows up in concept questions:

- *"With great power comes great responsibility."* — about dynamic allocation: `new`/`delete` give power but you must manage it.
- *"Wisdom: restrict dynamic allocation to class implementations."* — wrap raw `new`/`delete` inside a class (RAII); don't scatter them through `main`.
- *"I just want to get it to work" / "I'll clean it up later"* → leads to bugs too hard to find. **Clean it up now.** *If a function is more than 5 lines, re-factor it. Test each piece.*
- *"All code has bugs, but only readable code can be fixed."* (Code Review deck) — readability is correctness insurance.
- The original purpose of code reviews: *"force developers to write code that other developers understand."*
- **Naming:** *"We all must use `data` and `next` so we are speaking the same language."* (linked-list node members)
- **Friendship:** *"Who says I am your friend? — me, not you."* (the class grants `friend` status)
- **The "Remember" slide (final wrap-up):**
  - **Three areas of memory:** static (data segment), stack, free store (heap).
  - **Every object has a lifetime** (born → lives → dies; **destruction**, not "deconstruction").
  - **Pass by reference has two purposes:** (1) modify the actual argument, (2) efficiency (avoid a copy).
  - **"If you don't use it, …"** — an open prompt about not declaring/allocating what you don't need (Rule-of-Zero spirit): don't `new` what you won't `delete`; don't pass by value what you could pass by `const&`.

---

# Appendix B — Quick comparison tables

### Pointer vs reference
| | Pointer `T*` | Reference `T&` |
|---|---|---|
| Reseatable | yes | no (fixed at init) |
| Nullable | yes (`nullptr`) | no |
| Must init | no | yes |
| Use target | `*p`, `p->m` | `r` directly |

### `struct` vs `class`
Only the **default access** differs: `struct` → public; `class` → private. (Same for default inheritance.)

### Copy vs move (special members)
| | Copy ctor / copy `=` | Move ctor / move `=` |
|---|---|---|
| Param | `const T&` | `T&&` |
| Effect | deep copy; source unchanged | steal resources; source emptied |
| Source after | intact | `buf = nullptr` (**required**) |
| Trigger | L-value source | R-value / `std::move` |

### Rule of Three / Five / Zero
- **Three:** own a raw pointer → write copy ctor + copy `=` + destructor.
- **Five:** also write move ctor + move `=`.
- **Zero:** use `std::vector`/`string`/`map`/smart pointers → write **none**.

### `const` placement around a pointer (read right→left)
| Declaration | `p` reseatable? | `*p` writable? |
|---|---|---|
| `int * p` | yes | yes |
| `int * const p` | **no** | yes |
| `const int * p` | yes | **no** |
| `const int * const p` | **no** | **no** |

### Container cheat-sheet
| Container | Ordering | Lookup | Notes |
|---|---|---|---|
| `vector` | insertion | `[]` O(1) | dynamic array; fast back ops (≈ Python list) |
| `set` | sorted | O(log N) | unique values (≈ sorted Python set) |
| `map` | sorted by key | O(log N) | unique keys, `pair<K,V>` (≈ sorted dict); `[]` inserts! |
| `list` | insertion | O(n) | doubly linked; bidirectional iterators |

### Which compilation stage reports the error?
`undeclared` → **compiler**. `undefined reference` / `multiply defined` → **linker**. `segmentation fault` → **run time**.

### Worked pointer/reference traces (Final-review favorites — trace these by hand)
```cpp
int i = 10;
int * p = &i;       // p -> i
int ** pp = &p;     // pp -> p
int * & rp = p;     // rp is an alias of p (a reference to a pointer)
i  = 20;            // i = 20
*p = 30;            // i = 30  (through the pointer)
*rp = 50;           // *rp == *p, so i = 50
// final: i == 50

// const version — what's allowed?
const int i = 10;
const int * const p = &i;   // can't reseat p, can't write *p
const int & r = i;          // read-only alias of i
// p = &j;  ERROR    *p = 5;  ERROR    r = 5;  ERROR
```
```cpp
// Adding to the front of a linked list (one line!):
head = new Node{'C', head};   // new node's next = old head, then head points to new node
```

---

# Appendix C — Code reviews (may be on the Final)

The professor states **questions about Code Reviews may appear on the Final.** The skill being tested is **reading and mentally executing code** to (1) find **bugs** and (2) improve **readability**.

**How to write a good review (the required format):**
```
line X [bug]: The buggy code does {outcome} because {specific wrong code}.
              Instead it should {desired outcome}, so use {correct code}.
line Y [readability]: {unclear code}. Instead, {clearer code}.
```
- Be **specific and substantive** with line numbers and exact fixes; "the code seems complicated" earns nothing.
- Group all sentences about **one** issue together; lead with the line number.
- Mentally trace first (paper, not PythonTutor); *then* you may verify in a compiler/PythonTutor.
- Be friendly and respectful; avoid starting a sentence with a vague "This will…" — name what the code does.

**The recurring example** is a linked-list `remove()` with bugs like `return temp;` (returns only the first node, so removing the head fails — should `return L;`) and confusing names (`temp2`→`new_next`, `temp3`→`node_to_delete`). Be ready to read SLL pointer code and spot dangling pointers, wrong return values, and memory leaks.

---

# Appendix D — Priority topics for your Final

These are the **highest-value clusters** for this exam, mapped onto the sections above. Prioritize them:

1. **Tracing control flow** *(biggest cluster: loops, `if`/nested `if`, conditional expressions, `switch`, boolean conditions).* The Topic 10 deck explicitly lists iteration (`for` with 3 fields / ranged `for` / `while` / `do-while`), the `switch`/`case`/`default`/`break` structure, and mixed arithmetic & `i++` vs `++i`. **Practice hand-tracing** small programs and writing the exact output. → relates to Section 2.
2. **Rule of Three & default copy semantics** *(deep copy, default copy ctor, default copy assignment).* Know exactly why the compiler-generated copy is a **shallow** copy and how it causes a double-free. → Section 6 (Rule of Three), Section 4 (shallow vs deep).
3. **Code-review tracing** *(deep copy, dynamic-array resize, constructor initialization, array search).* Re-read the `IntList::increaseArrayTo`, copy constructor, and `indexOf` code in Section 6 and be able to find bugs in them. → Appendix C + Section 6.
4. **Arrays & C-strings, traced** *(array bounds, stack-array initialization, C-string traversal).* No bounds checking (Section 4 Q37); uninitialized → garbage (Q25/Q38); the five C-string traversal idioms (which work and which don't). → Section 4.
5. **Subscript operator `[]`** *(overloaded subscripting).* It returns `int&` (an L-value) and which class does bounds-checking. → Section 6 Q44/Q59, Section 2 Q13.
6. **Build pipeline & declarations** *(function declarations, compile vs link errors, multiple definitions).* Which stage catches which error; include guards prevent "multiply defined." → Section 5 table + Section 1 Q4.

> These six clusters carry the most exam points. If you trace ~10 short programs by hand and can write a correct Rule-of-Three class from scratch, you'll have covered the highest-value material.

---

# 🎯 The 12 most important things to walk in knowing

1. **Object lifetime:** born (allocate + construct) → lives → dies (**destruct** + deallocate). Stack = block scope; heap = `new`…`delete`; static = whole program.
2. **Three memory areas:** static/data segment, stack, free store (heap).
3. **`new`↔`delete`, `new[]`↔`delete[]`** — never mismatch them.
4. **Rule of Three:** any raw pointer member ⇒ write **copy ctor + copy `=` + destructor**; the default copy is a **shallow** copy → double-free.
5. **Move ctor / move `=` MUST set the source's pointer to `nullptr`** (the moved-from object is still destructed → otherwise double-free).
6. **Self-assignment check is IDENTITY:** `if (this != &v)`, never `if (*this != v)`.
7. **Shallow vs deep copy** — and why deep copy + a destructor are inseparable.
8. **Reference vs pointer**, and **`const` placement** (constant pointer vs pointer-to-const).
9. **Pass by `const&`** for big read-only objects (efficiency); by `&` to modify; by value for an independent copy.
10. **Virtual functions + virtual destructor** give run-time dispatch; a class with a pure virtual function is **abstract** (can't instantiate). `delete` through a base pointer needs a **virtual destructor**.
11. **STL = containers + iterators + algorithms**; `vector`/`set`/`map`/`pair`; range-based `for`; `transform`/`accumulate`/`copy`/`find`/`sort`; `map::operator[]` silently inserts.
12. **Build pipeline:** compiler catches *undeclared* + type errors; linker catches *undefined* / *multiply defined*; bad pointers/indices seg-fault at run time. **Include guards** prevent multiple definitions.

> Course conventions to honor on code questions: member names **`data`/`next`**; **no `using namespace std;` in `.hpp`**; use **`static_cast`** for narrowing conversions (the build uses `-Werror`); it's **destruction**, not "deconstruction."

**Stay confident, stay focused, and do your best. Good luck on the Final! 🍀**
