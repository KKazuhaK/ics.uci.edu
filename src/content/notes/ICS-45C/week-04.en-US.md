---
title: "Reading Notes"
summary: "Literals, constexpr, dynamic memory (new/delete), copy/move constructors, Rule of Three/Five, and the IntList example."
---

# Information and Computer Science 45C — Week 4 Reading Notes

## Table of Contents

- [1. Literals](#1-literals)
- [2. Constant Expressions & Compile-Time Programming](#2-constant-expressions--compile-time-programming)
- [3. Constexpr Variables](#3-constexpr-variables)
- [4. Magic Numbers](#4-magic-numbers)
- [5. The Conditional Operator](#5-the-conditional-operator)
- [6. C-style String Symbolic Constants](#6-c-style-string-symbolic-constants)
- [7. Pointers, References, and Dynamic Memory Fundamentals](#7-pointers-references-and-dynamic-memory-fundamentals)
- [8. Dynamic Memory Allocation with new and delete](#8-dynamic-memory-allocation-with-new-and-delete)
- [9. Dynamically Allocating Arrays](#9-dynamically-allocating-arrays)
- [10. Shallow vs. Deep Copying](#10-shallow-vs-deep-copying)
- [11. The Copy Constructor](#11-the-copy-constructor)
- [12. Overloading the Copy Assignment Operator](#12-overloading-the-copy-assignment-operator)
- [13. The Rule of Three (and Five)](#13-the-rule-of-three-and-five)
- [14. Move Constructors and Move Assignment](#14-move-constructors-and-move-assignment)
- [15. Class Initialization Forms](#15-class-initialization-forms)
- [16. Copy Elision (briefly)](#16-copy-elision-briefly)
- [17. Extended Example: IntList (Putting It All Together)](#17-extended-example-intlist-putting-it-all-together)
- [18. Week 4 Quick Reference & Top Takeaways](#18-week-4-quick-reference--top-takeaways)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate Week 4 Assigned Reading (LearnCpp chapters 5.2, 5.4/5.5, 5.6, 6.6, 17.11, 19.1, 19.2, 14.14, 14.15, 21.12, 21.13, 22.3) with lecture slides (Dyn_Array.pptx and related PPTs). Topics are organized by concept, not by source — each section fuses Reading content with PPT content where both cover the same topic.

---

## 1. Literals

> Corresponds to LearnCpp 5.2 — Literals

### 1.1 What is a Literal?

A **literal** is a value inserted directly into the code. Literals are sometimes called **literal constants** because their meaning cannot be redefined — `5` always means the integral value 5.

```cpp
return 5;                     // 5 is an integer literal
bool myNameIsAlex { true };   // true is a boolean literal
double d { 3.4 };             // 3.4 is a double literal
std::cout << "Hello, world!"; // "Hello, world!" is a C-style string literal
```

### 1.2 The Default Type of a Literal

Every literal has a type, deduced from its value.

| Literal value | Examples | Default type | Note |
|---|---|---|---|
| Integer | `5`, `0`, `-3` | `int` | |
| Boolean | `true`, `false` | `bool` | |
| Floating point | `1.2`, `0.0`, `3.4` | **`double`** (not `float`!) | |
| Character | `'a'`, `'\n'` | `char` | single quotes |
| C-style string | `"Hello, world!"` | `const char[14]` | double quotes; includes null terminator |

> ⚠️ **Easy trap**: floating-point literals default to `double`, not `float`. This causes the classic `float f { 4.1 };` warning — see §1.6 below.

### 1.3 Literal Suffixes

If the default type isn't what you want, you can change the type of a literal by adding a suffix:

| Data type | Suffix | Meaning |
|---|---|---|
| integral | `u` or `U` | `unsigned int` |
| integral | `l` or `L` | `long` |
| integral | `ul`, `uL`, `Ul`, `UL`, `lu`, `lU`, `Lu`, `LU` | `unsigned long` |
| integral | `ll` or `LL` | `long long` |
| integral | `ull`, `uLL`, `Ull`, `ULL`, `llu`, `llU`, `LLu`, `LLU` | `unsigned long long` |
| integral | `z` or `Z` | signed `std::size_t` (C++23) |
| integral | `uz`, `uZ`, `Uz`, `UZ`, `zu`, `zU`, `Zu`, `ZU` | `std::size_t` (C++23) |
| floating point | `f` or `F` | `float` |
| floating point | `l` or `L` | `long double` |
| string | `s` | `std::string` |
| string | `sv` | `std::string_view` |

**In most cases, suffixes aren't needed (except for `f`).**

### 1.4 Suffix Casing Rules

Most suffixes are **case-insensitive**, with two exceptions:

- **`s` and `sv` must be lower case**
- **Two consecutive `l` or `L` characters must have the same casing** (`lL` and `Ll` are NOT accepted; `ll` and `LL` are fine)

> 💡 **Best Practice**: Prefer literal suffix `L` (upper case) over `l` (lower case).
> In some fonts, lowercase `l` looks identical to digit `1`. `5L` is instantly clear; `5l` could be misread as `51`.

### 1.5 Integral Literals (No Suffix Usually Needed)

```cpp
std::cout << 5  << '\n';  // 5 (no suffix) is type int
std::cout << 5L << '\n';  // 5L is type long
std::cout << 5u << '\n';  // 5u is type unsigned int
```

Even when initializing non-`int` types, non-suffixed `int` literals usually work:

```cpp
int a { 5 };          // ok: types match
unsigned int b { 6 }; // ok: compiler converts int value 6 to unsigned int value 6
long c { 7 };         // ok: compiler converts int value 7 to long value 7
```

The compiler converts the `int` literal to the appropriate type. This works because these conversions are **widening** (no data loss).

### 1.6 Floating-Point Literals (The `f` Suffix Matters!)

By default, floating-point literals are `double`. To make them `float`, use the `f` (or `F`) suffix:

```cpp
std::cout << 5.0  << '\n';  // 5.0 (no suffix) is type double
std::cout << 5.0f << '\n';  // 5.0f is type float
```

**The classic new-programmer trap**:

```cpp
float f { 4.1 };  // ⚠️ warning: 4.1 is a double literal, not a float
```

**Why the warning?** The compiler determines a literal's type **independently of how it's used**. `4.1` has no suffix, so it's `double`. Converting `double` → `float` can lose precision, hence the warning.

**Two fixes**:

```cpp
float f { 4.1f };   // ✅ use 'f' suffix so the literal is a float
double d { 4.1 };   // ✅ or change variable to double to match
```

### 1.7 Scientific Notation for Floating-Point

Two ways to write floating-point literals:

**Standard notation** (decimal point):
```cpp
double pi { 3.14159 };  // standard notation
double d { -1.23 };     // can be negative
double why { 0. };      // syntactically acceptable but AVOID — hard to see the dot (prefer 0.0)
```

**Scientific notation** (with `e`):
```cpp
double avogadro { 6.02e23 };       // 6.02 × 10^23
double protonCharge { 1.6e-19 };   // 1.6 × 10^-19 (negative exponent allowed)
```

### 1.8 String Literals: Two Non-Obvious Facts

String literals are placed between **double quotes** (vs. `char` literals in single quotes). They're called **C-style strings** because they were inherited from C.

For historical reasons, strings are not a fundamental type in C++ — they have a strange, complicated type that's hard to work with.

**Fact #1: All C-style string literals have an implicit null terminator.**

`"hello"` appears to have 5 characters but actually has 6: `'h'`, `'e'`, `'l'`, `'l'`, `'o'`, and `'\0'` (ASCII code 0). This trailing `'\0'` is the **null terminator**, and a string ending with one is called a **null-terminated string**.

This is why `"Hello, world!"` has type `const char[14]` rather than `const char[13]` — the null terminator counts as a character.

> 💡 **Why null terminator?** Historical; it lets functions like `strlen` determine where the string ends by scanning until they find `'\0'`.

**Fact #2: C-style string literals are const objects that live for the entire program.**

> 💡 **Key Insight**: C-style string literals are const objects created at the start of the program and guaranteed to exist for the entirety of the program.

Unlike most other literals (which are values, not objects), C-style string literals are real objects at real addresses. This is why you can safely return a string literal from a function:

```cpp
const char* getGreeting() {
    return "Hello";  // ✅ safe — "Hello" exists for entire program
}
```

> ⚠️ **Contrast**: `std::string` and `std::string_view` literals (with `s` / `sv` suffix) create **temporary** objects that are destroyed at the end of the full expression they appear in. They must be used immediately.

---

## 2. Constant Expressions & Compile-Time Programming

> Corresponds to LearnCpp 5.4/5.5 — Constant Expressions
> (Note: the course reading lists LearnCpp 5.4, which on the current LearnCpp site is split into 5.4 "as-if rule" and 5.5 "constant expressions". Both are covered here.)

### 2.1 Compile-Time vs. Runtime

Expressions in C++ evaluate at one of two times:

| Phase | When | Who does the work |
|---|---|---|
| **Compile-time** | When you compile your program | The compiler |
| **Runtime** | When your program actually runs | The compiled executable |

Some expressions **must** evaluate at runtime:
```cpp
std::cin >> x;         // requires user input — only known at runtime
std::cout << 5 << '\n'; // requires the terminal to exist — only at runtime
```

### 2.2 The as-if Rule (From 5.4)

Under the **as-if rule**, the compiler is free to optimize by shifting work from runtime to compile-time, as long as the observable behavior is unchanged:

```cpp
const double x { 1.2 };
const double y { 3.4 };
const double z { x + y };  // x + y MAY evaluate at runtime or compile-time
```

Since `x` and `y` are known at compile-time, the compiler may compute `4.6` during compilation and use that directly.

### 2.3 Problems with the as-if Rule

While nice, the as-if rule has issues:

- We can't **force** compile-time evaluation — it's up to the compiler's sophistication
- Different compilers / platforms / compilation options may produce different results
- **Silent failures**: Code we wanted to run at compile-time may silently fall back to runtime if it's ineligible (typo, misunderstanding), and we'd never know
- No feedback from the compiler about what it chose to do

**Compile-time programming** = explicitly using C++ features that **guarantee** compile-time evaluation.

### 2.4 Benefits of Compile-Time Programming

From the Reading, there are **five major benefits**:

| Benefit | Explanation |
|---|---|
| **Performance** | Compile-time evaluation → smaller, faster programs |
| **Versatility** | Only compile-time values can be used where compile-time values are required (array sizes, template arguments, etc.) |
| **Predictability** | Compiler will halt if code can't run at compile-time (no silent fallback) |
| **Quality — error detection** | Many errors can be caught at compile-time, not runtime |
| **Quality — no UB at compile-time** | If compile-time evaluation would trigger undefined behavior, the compiler halts. UB is **not allowed** at compile-time |

### 2.5 Key C++ Features for Compile-Time Programming

All of these ultimately rely on **constant expressions**:

- **Constexpr variables** (§3)
- **Constexpr functions** (briefly at §3.7)
- **Templates** (future chapter)
- **`static_assert`** (future chapter)

### 2.6 Definition of Constant Expression

The C++ standard barely mentions "compile-time" at all. Instead, it defines a **constant expression**:

> 💡 **Key Insight**: A **constant expression** is a non-empty sequence of literals, constant variables, operators, and function calls, **all of which must be evaluatable at compile-time**. In a constant expression, **each part** of the expression must be evaluatable at compile-time.

An expression that is **not** a constant expression is called a **non-constant expression** or informally a **runtime expression**.

### 2.7 What CAN Be in a Constant Expression?

Most commonly:

- **Literals** (e.g., `5`, `1.2`)
- **Most operators with constant expression operands** (e.g., `3 + 4`, `2 * sizeof(int)`)
- **Const integral variables with a constant expression initializer** — a historical exception. Modern C++ prefers `constexpr`.
- **Constexpr variables**
- **Constexpr function calls with constant expression arguments**

### 2.8 What CANNOT Be in a Constant Expression?

> ⚠️ **This is a common quiz/exam trap**:

- **Non-const variables** (value could change at any moment)
- **Const non-integral variables** — even with a constant expression initializer! (e.g., `const double d { 1.2 };` is NOT usable in a constant expression — to use it, define as `constexpr` instead)
- **Return values of non-constexpr functions** — even when the return expression is a constant expression (e.g., `int five() { return 5; }` — `five()` is still a runtime expression)
- **Function parameters** — even of constexpr functions
- **Operators with non-constant-expression operands** (e.g., `std::cout << 5` — `std::cout` isn't a constant expression)
- **Operators `new`, `delete`, `throw`, `typeid`, and `operator,`** (comma)

### 2.9 Worked Examples (From Reading)

**Constant expressions**:
```cpp
5;                  // constant expression (literal)
1.2;                // constant expression (literal)
"Hello world!";     // constant expression (literal)
5 + 6;              // constant expression (both operands are literals)
1.2 * 3.4;          // constant expression
8 - 5.6;            // constant expression (even though operands have different types!)
sizeof(int) + 1;    // constant expression (sizeof is known at compile-time)
```

**Runtime expressions**:
```cpp
getNumber();        // runtime (user input inside the function)
five();             // runtime (non-constexpr function; return expr is constant but call isn't)
std::cout << 5;     // runtime (std::cout isn't a constant expression)
```

**Variables**:
```cpp
const int a { 5 };         // ✅ usable in constant expressions (const int + const-expr init)
const int b { a };         // ✅ a is a constant expression
const long c { a + 2 };    // ✅ a + 2 is a constant expression

int d { 5 };               // ❌ non-const
const int e { d };         // ❌ initializer is non-const
const double f { 1.2 };    // ❌ const but NOT integral!
```

### 2.10 Nomenclature Recap

Two ways to phrase the same idea:

- **"X is usable in a constant expression"** — emphasizes X
- **"X is a constant expression"** — emphasizes the expression containing X

Both mean the same thing.

### 2.11 Constant Expressions Don't ALWAYS Evaluate at Compile-Time (Counterintuitive!)

> 💡 **Key Insight**: The compiler is **only required** to evaluate constant expressions at compile-time in contexts that **require** a constant expression. It may or may not do so otherwise.

```cpp
const int x { 3 + 4 };  // 3 + 4 MUST be evaluated at compile-time (x is usable in const expressions)
int y { 3 + 4 };        // 3 + 4 MAY be evaluated at compile-time or runtime (y isn't)
```

**The four levels of compile-time evaluation probability**:

| Likelihood | Condition |
|---|---|
| **Never** | Non-constant expression where compiler can't determine all values |
| **Possibly** | Non-constant expression where compiler CAN determine all values (optimized under as-if) |
| **Likely** | Constant expression used in context that doesn't require it |
| **Always** | Constant expression used in context that requires a constant expression |

The technical term for "must evaluate at compile-time" is **manifestly constant-evaluated expression**.

### 2.12 Why Do Compile-Time Expressions Need to Be Constant?

Imagine the alternative — tracking which variables are currently compile-time-known:

```cpp
int x { 5 };       // x is known to the compiler
std::cin >> x;     // x is no longer known!
```

If we allowed non-const variables in compile-time expressions, the compiler would have to track which values are known at every program point. Adding a single line like `std::cin >> x;` could invisibly break compile-time expressions elsewhere.

**Solution**: Require that variables used in constant expressions be `const` (or `constexpr`). Then their values never change — simple, reliable.

### 2.13 Quiz Highlights (From the Reading)

```cpp
char a { 'q' };              // 'q' is const-expr; a is NOT (non-const)
const int b { 0 };           // 0 is const-expr; b IS (const int + const-expr init)
const double c { 5.0 };      // 5.0 is const-expr; c is NOT (const but NOT integral)
const int d { a * 2 };       // a not const-expr → a*2 not const-expr → d not const-expr
int e { c + 1.0 };           // c not const-expr → e not const-expr
const int f { d * 2 };       // d not const-expr → f not const-expr (even though f is const int)
const int g { getNumber() }; // function call not const-expr → g not const-expr
const int h{};               // value-initialized to 0; h IS const-expr
```

> ⚠️ **Trap**: In case (c), many people mistakenly say `c` is a constant expression because it's `const` and initialized with a literal. **It's not** — `double` is not an integral type, so the historical "const integral" exception doesn't apply. Use `constexpr double c { 5.0 };` instead.

---

## 3. Constexpr Variables

> Corresponds to LearnCpp 5.5/5.6 — Constexpr Variables

### 3.1 The Problem with `const` for Compile-Time Constants

Using `const` to create compile-time constants has three issues:

1. **Ambiguity** — you can't easily tell if a `const` variable is usable in a constant expression:
   ```cpp
   int a { 5 };        // clearly not usable in const expr
   const int b { a };  // clearly NOT usable (initializer not const-expr)
   const int c { 5 };  // clearly usable
   
   const int d { someVar };     // 🤔 depends on someVar's definition
   const int e { getValue() };  // 🤔 depends on getValue()'s definition
   ```
   You'd have to recursively inspect every initializer.

2. **No way to require** — you can't tell the compiler "this MUST be usable in a constant expression, halt otherwise". `const` just silently creates a runtime constant.

3. **Integrals only** — the "const can be used in constant expressions" rule applies only to integral types. `const double` doesn't qualify.

### 3.2 The `constexpr` Keyword

`constexpr` (short for "constant expression") solves all three problems.

> 💡 **Key Insight**: A **constexpr variable is always a compile-time constant**. It must be initialized with a constant expression, otherwise a **compilation error** results.

```cpp
int five() { return 5; }  // non-constexpr function

int main()
{
    constexpr double gravity { 9.8 };  // ✅ 9.8 is a constant expression
    constexpr int sum { 4 + 5 };       // ✅ 4 + 5 is a constant expression
    constexpr int something { sum };   // ✅ sum is a constant expression

    std::cin >> age;
    constexpr int myAge { age };  // ❌ COMPILE ERROR: age is not a constant expression
    constexpr int f { five() };   // ❌ COMPILE ERROR: return value of five() is not constexpr
}
```

**Crucially, `constexpr` works on non-integral types**:
```cpp
constexpr double d { 1.2 };  // ✅ d can be used in constant expressions!
// Compare: const double d { 1.2 };  // ❌ CANNOT be used in constant expressions
```

### 3.3 `const` vs. `constexpr` for Variables

| | `const` | `constexpr` |
|---|---|---|
| Value can change after init? | ❌ No | ❌ No |
| Initializer must be const-expr? | No | **Yes** |
| Usable in constant expressions? | Only const integral + const-expr init | **Always** |
| Evaluated at | Runtime (can be compile-time too) | Compile-time or runtime |

Constexpr variables are **implicitly const**. Const variables are **not** implicitly constexpr (except for the integral grandfather clause). Using both `const constexpr` is redundant.

> 💡 **Fun detail**: Unlike `const`, `constexpr` is **not part of the object's type**. `constexpr int x` actually has type `const int`.

### 3.4 Best Practice

> 💡 **Best Practice**:
> - Any constant variable whose initializer is a constant expression → use `constexpr`
> - Any constant variable whose initializer is NOT a constant expression (runtime constant) → use `const`

### 3.5 Caveat: Types Incompatible with `constexpr`

Some types **don't work** with `constexpr`:
- `std::string`
- `std::vector`
- Any type using dynamic memory allocation

For these, either use `const`, or pick a constexpr-compatible alternative:
- `std::string_view` instead of `std::string`
- `std::array` instead of `std::vector`

### 3.6 `const`/`constexpr` Function Parameters

Normal function calls execute at runtime, so parameters initialize at runtime. This has two consequences:

1. **`const` function parameters are runtime constants** — even when the supplied argument is compile-time.
2. **Function parameters CANNOT be `constexpr`** — their initialization value isn't determined until runtime.

```cpp
void foo(const int x) { ... }       // ✅ OK, x is a runtime constant
void bar(constexpr int x) { ... }   // ❌ NOT ALLOWED
```

### 3.7 Brief Intro to Constexpr Functions

A **constexpr function** can be called in a constant expression. The `constexpr` keyword goes before the return type:

```cpp
int max(int x, int y) { return (x > y) ? x : y; }          // regular function
constexpr int cmax(int x, int y) { return (x > y) ? x : y; } // constexpr function

int m1 { max(5, 6) };            // ✅ ok
const int m2 { max(5, 6) };      // ✅ ok
constexpr int m3 { max(5, 6) };  // ❌ error: max(5, 6) is not a constant expression

int m4 { cmax(5, 6) };           // ✅ may evaluate at compile-time or runtime
const int m5 { cmax(5, 6) };     // ✅ may evaluate at compile-time or runtime
constexpr int m6 { cmax(5, 6) }; // ✅ MUST evaluate at compile-time
```

**Key rule**: A constexpr function must evaluate at compile-time when the constant expression it's part of must evaluate at compile-time. Otherwise, it may evaluate at either.

To be eligible for compile-time execution, **all arguments must be constant expressions**.

We'll cover constexpr functions in depth later (LearnCpp F.1).

### 3.8 Terminology Recap

| Term | Definition |
|---|---|
| **Compile-time constant** | A value or non-modifiable object whose value must be known at compile-time (e.g., literals, constexpr variables) |
| **Constexpr** | Keyword declaring objects as compile-time constants (and functions eligible for compile-time evaluation) |
| **Constant expression** | Expression with only compile-time constants and operators/functions supporting compile-time evaluation |
| **Runtime expression** | An expression that is not a constant expression |
| **Runtime constant** | A value or non-modifiable object that is not a compile-time constant |

---

## 4. Magic Numbers

> Corresponds to the "Magic numbers" section of LearnCpp 5.2

### 4.1 What is a Magic Number?

A **magic number** is a literal (usually a number) that either has an **unclear meaning** or may **need to be changed later**.

```cpp
const int maxStudentsPerSchool{ numClassrooms * 30 };  // what's 30?
setMax(30);                                             // what's 30 HERE?
```

You might **guess** the first `30` means students per class. The second `30` — who knows?

### 4.2 Why Magic Numbers Are Bad

**Problem 1: Missing context** — readers have to guess.

**Problem 2: Refactoring nightmare** — suppose the school buys new desks and class size becomes 35:

- The `30` in `maxStudentsPerSchool` needs to change.
- What about the `30` in `setMax(30)`? Same meaning? Different? You'd have to **inspect every occurrence** of literal `30` in the whole codebase and decide individually.
- Global search-and-replace is dangerous (you might update unrelated `30`s).

### 4.3 Fix: Use Symbolic Constants

```cpp
const int maxStudentsPerClass { 30 };
const int totalStudents{ numClassrooms * maxStudentsPerClass };  // clear!

const int maxNameLength{ 30 };
setMax(maxNameLength);  // clearly a different context
```

Benefits:
- **Name provides context** — no more guessing
- **Change in one place** — refactoring becomes trivial and safe

### 4.4 Magic Numbers Aren't Always Numbers

Strings, app names, etc. can be magic too:
```cpp
printAppWelcome("MyCalculator");  // ❌ bad: name may appear elsewhere or change
```

### 4.5 When Literals Are NOT Magic

Not every literal needs a name! Some are clear in context:

**Obvious literals** (`-1`, `0`, `0.0`, `1`):
```cpp
int idGenerator { 0 };          // ✅ obvious: starting from 0
idGenerator = idGenerator + 1;  // ✅ obvious: incrementing
```

**Obvious conversion factors** (when function name makes it clear):
```cpp
int kmToM(int km) {
    return km * 1000;  // ✅ obvious: km → m
}
```

**Sequential IDs**:
```cpp
printPlayerInfo(1);   // ✅ just a player number
printPlayerInfo(2);
```

### 4.6 Best Practice

> 💡 **Best Practice**: Avoid magic numbers in your code. Use `constexpr` variables instead (see §3).

```cpp
constexpr int maxStudentsPerClass { 30 };  // even better than const
```

---

## 5. The Conditional Operator

> Corresponds to LearnCpp 6.6 — The Conditional Operator

### 5.1 Syntax and Meaning

| Operator | Symbol | Form | Meaning |
|---|---|---|---|
| Conditional | `?:` | `c ? x : y` | If `c` is `true`, evaluate `x`; otherwise evaluate `y` |

The **conditional operator** `?:` (also called the **arithmetic if** or **ternary operator**) is C++'s only ternary operator (3 operands). It's a shorthand for certain if-else statements.

```cpp
// Long form
if (x > y)
    max = x;
else
    max = y;

// Conditional operator
max = ((x > y) ? x : y);
```

Unlike `if-else`, **`:` and `expression2` are not optional** — the conditional operator always has both branches.

### 5.2 Input/Output Example

```cpp
int x { getValue() };
int y { getValue() };
int max { (x > y) ? x : y };
std::cout << "The max of " << x << " and " << y << " is " << max << ".\n";
```

If input is `5` and `7`: `(5 > 7) ? 5 : 7` → `false ? 5 : 7` → `7`. Output: `The max of 5 and 7 is 7.`

### 5.3 Conditional Operator Is an Expression

Since it's an **expression** (not a statement), it can be used anywhere expressions are allowed — including in contexts where `if-else` **can't** be used.

**Example: initializing a constexpr variable**:
```cpp
constexpr bool inBigClassroom { false };
constexpr int classSize { inBigClassroom ? 30 : 20 };  // ✅ only the conditional op works here
```

**Why can't you use `if-else`?**

```cpp
if (inBigClassroom)
    constexpr int classSize { 30 };    // classSize scoped to if-block, destroyed at '}'
else
    constexpr int classSize { 20 };    // same — scoped to else-block
std::cout << classSize;                 // ❌ COMPILE ERROR: classSize undefined
```

Variables declared inside `if`/`else` blocks die at the closing `}`. The only way to use `if-else` here is to wrap it in a function, which takes much more code than just using `?:`.

### 5.4 Parenthesizing the Conditional Operator (Critical!)

> ⚠️ **Severe trap**: Most operators have **higher precedence** than `?:`. Without parentheses, expressions don't evaluate as expected.

**Example 1: Arithmetic precedence**
```cpp
int x { 2 };
int y { 1 };
int z { 10 - x > y ? x : y };
// You might expect: 10 - (x > y ? x : y)  → 8
// Actually:         ((10 - x) > y) ? x : y  → 2
std::cout << z;  // prints 2
```

**Example 2: `<<` has higher precedence than `?:`**
```cpp
int x { 2 };
std::cout << (x < 0) ? "negative" : "non-negative";
// You might expect: "non-negative"
// Actually prints:  0
```

**What happened?**
1. `x < 0` → `false`
2. `std::cout << false` is evaluated first (`<<` binds tighter than `?:`), prints `0` and returns `std::cout`
3. Expression becomes `std::cout ? "negative" : "non-negative"`
4. `std::cout` converts to `bool` (it has such a conversion), probably returns `false`
5. `false ? "negative" : "non-negative"` → `"non-negative"`
6. Result is a standalone string literal — no effect

> 💡 **Best Practice**:
> - **Parenthesize the entire conditional operation** (including operands) when used in a compound expression
> - For readability, consider parenthesizing the condition if it contains operators (other than function call `()`)
> - The operands don't need to be parenthesized

**Examples of correct parenthesization**:
```cpp
return isStunned ? 0 : movesLeft;              // ✅ not compound, no operators in condition
int z { (x > y) ? x : y };                     // ✅ not compound, but condition has > → parens help
std::cout << (isAfternoon() ? "PM" : "AM");    // ✅ compound → whole op in parens
std::cout << ((x > y) ? x : y);                // ✅ compound + condition with op → both parens
```

### 5.5 Operand Types Must Match or Be Convertible

To comply with C++'s type checking, one of the following must hold:
- Types of second and third operands **match**, OR
- Compiler can **convert** one or both to matching types

```cpp
std::cout << (true  ? 1 : 2) << '\n';    // ✅ both int
std::cout << (false ? 1 : 2.2) << '\n';  // ✅ int 1 → double 1.0
std::cout << (true  ? -1 : 2u) << '\n';  // ⚠️ surprising! -1 → unsigned int, prints 4294967295
```

> ⚠️ **Trap**: Mixing signed/unsigned in the conditional operator triggers surprising conversion rules. **Avoid**.

**Compile error if no match possible**:
```cpp
constexpr int x{ 5 };
std::cout << ((x != 5) ? x : "x is 5");  // ❌ int vs C-style string → no common type
```

Fix by explicit conversion:
```cpp
std::cout << ((x != 5) ? std::to_string(x) : std::string{"x is 5"}) << '\n';
```

### 5.6 When to Use the Conditional Operator

**Use it for**:
- Initializing an object with one of two values
- Assigning one of two values to an object
- Passing one of two values to a function
- Returning one of two values from a function
- Printing one of two values

**Don't use it for**:
- Complicated expressions (hard to read, error-prone)

> 💡 **Best Practice**: Prefer to avoid the conditional operator in complicated expressions.

---

## 6. C-style String Symbolic Constants

> Corresponds to LearnCpp 17.11 — C-style String Symbolic Constants

### 6.1 Two Ways to Create C-style String Constants

C++ supports **two different ways** to create C-style string symbolic constants:

```cpp
const char name[] { "Alex" };          // Case 1: const C-style array
const char* const color{ "Orange" };   // Case 2: const pointer to string literal

std::cout << name << ' ' << color << '\n';
// Prints: Alex Orange
```

Both produce the same output, but C++ handles **memory allocation differently** for each.

### 6.2 Memory Layout Differences

**Case 1: `const char name[] { "Alex" }`**
- `"Alex"` is placed in (probably read-only) memory somewhere
- Program allocates **a separate C-style array of length 5** (4 chars + null terminator)
- Initializes that array by copying `"Alex"` into it
- Result: **TWO copies** of `"Alex"` — one in global memory, one owned by `name`
- Since `name` is const and will never change, making a copy is wasteful

**Case 2: `const char* const color{ "Orange" }`**
- Implementation-defined, but **usually**:
  - Compiler places `"Orange"` in read-only memory
  - Initializes the pointer with the **address** of that memory
- Result: **ONE copy** of `"Orange"`

### 6.3 String Literal Consolidation

Because string literals are constants, the compiler may save memory by combining identical literals:

```cpp
const char* name1 { "Alex" };
const char* name2 { "Alex" };
// Both pointers may point to the SAME address in read-only memory
```

### 6.4 Type Deduction with C-style Strings

```cpp
auto  s1{ "Alex" };   // type deduced as const char*
auto* s2{ "Alex" };   // type deduced as const char*
auto& s3{ "Alex" };   // type deduced as const char(&)[5]
```

Without `auto&`, you lose array info and get a pointer.

### 6.5 Outputting Pointers and C-style Strings (Critical!)

> ⚠️ **Big trap**: `std::cout` treats `char*`/`const char*` differently from other pointer types!

```cpp
int narr[]{ 9, 7, 5, 3, 1 };
char carr[]{ "Hello!" };
const char* ptr{ "Alex" };

std::cout << narr << '\n';  // narr decays to int* → prints ADDRESS (e.g., 003AF738)
std::cout << carr << '\n';  // carr decays to char* → prints AS STRING ("Hello!")
std::cout << ptr  << '\n';  // already char* → prints AS STRING ("Alex")
```

**Why?** Output streams assume: if you pass `char*`/`const char*`, you want to print a **string**, not an address. For other pointer types, it prints the address.

### 6.6 The Scary Unintended Consequence

```cpp
char c{ 'Q' };
std::cout << &c;  // ❌ DISASTER!
```

What happens:
- `&c` has type `char*`
- `std::cout` thinks it's a C-style string
- Starts printing from `c`... but `c` isn't null-terminated!
- Reads past `c` into garbage memory until it hits a byte that happens to be 0
- Output: something like `Q╠╠╠╠╜╡4;¿■A` — **undefined behavior**

**Fix: cast to `const void*` when you want the address**:
```cpp
const char* ptr{ "Alex" };
std::cout << ptr << '\n';                            // prints as string
std::cout << static_cast<const void*>(ptr) << '\n';  // prints as address
```

### 6.7 Best Practice

> 💡 **Best Practice**: Avoid C-style string symbolic constants in favor of `constexpr std::string_view`.

`std::string_view` is as fast (often faster) and behaves more consistently.

#### Comparison of the Three String Types

| | C-string | `std::string_view` | `std::string` |
|---|---|---|---|
| **Owns data?** | Array owns / pointer borrows | Borrows only, no ownership | Full ownership |
| **Knows length?** | No (must scan to `'\0'`) | Yes (stores size) | Yes |
| **`cout <<` behavior** | Special (prints contents) | Prints contents | Prints contents |
| **`s.size()`** | No, use `strlen(s)` | ✅ `s.size()` O(1) | ✅ `s.size()` O(1) |
| **Slicing** | Manual pointer arithmetic | ✅ `s.substr(...)` | ✅ `s.substr(...)` |
| **Comparison** | `strcmp(a, b) == 0` | ✅ `a == b` | ✅ `a == b` |
| **Pitfalls** | Many (decay, `'\0'`, `cout` quirks) | Mostly none | Mostly none |

> 📌 **How to choose**:
> - **String literal constants** → `constexpr std::string_view`
> - **Function parameter (read-only)** → `std::string_view` (accepts both C-strings and `std::string`, zero copy)
> - **Need to own / concatenate / modify a string** → `std::string`
> - **C-string** only when you must interop with C APIs (`std::string::c_str()` gets you one)

---

## 7. Pointers, References, and Dynamic Memory Fundamentals

> Corresponds to PPT Dyn_Array.pptx pages 2-4 (pointers/references/arrays overview)

### 7.1 Pointers vs. References

Both contain the **address** of an object, allowing access to it:

| Feature | Reference `T&` | Pointer `T*` |
|---|---|---|
| Declaration | `int& j = i;` | `int* p = &i;` |
| Must initialize at declaration? | ✅ Yes | ❌ No (but should) |
| Can be rebound to another object? | ❌ No | ✅ Yes |
| Can be null? | ❌ No | ✅ Yes (`nullptr`) |
| Syntax to access value | Direct: `j` | Dereference: `*p` or `p->` |

```cpp
int i = 10;
int* p = &i;   // & takes the address of i; p is a pointer holding that address
int& j = i;    // j is an alias (reference) for i

i = 50;        // change i directly
*p = 60;       // change i indirectly (via pointer)
j = 70;        // change i indirectly (via reference)
```

### 7.2 Arrays and Pointers

> 💡 **Key insight**: In C++, an array name is a **constant pointer to its first element**.

```cpp
int a[4];
int b[2];
int* p = a;   // or equivalently: p = &a[0]
*p = 10;      // sets a[0] = 10
p[0] = 20;    // also sets a[0] = 20

p = b;        // pointer can be reassigned — but array NAMES can't!
p[1] = 70;
*(p + 1) = 90;   // pointer arithmetic: same as p[1]
```

**Subscripting equivalence**: `p[i]` is just a shorthand for `*(p + i)`.

### 7.3 Character Arrays vs. Character Pointers (Crucial Distinction!)

```cpp
char s1[] = "Hello";     // s1 is an array; "Hello" is copied into s1's memory (on stack/data)
char* s2 = "Hello";      // s2 is a pointer to a read-only string literal!
char* s3 = s1;           // s3 points into s1 (same mutable memory)

s3[0] = 'M';   // ✅ modifies s1 → s1 becomes "Mello"
s2[0] = 'M';   // ❌ Segmentation violation — string literals are read-only
```

> ⚠️ **Trap**: In modern C++, `char* s = "Hello";` produces a warning. You should write `const char* s = "Hello";` to reflect that string literals are read-only.

### 7.4 Limitations of Fixed-Size Arrays

These limitations motivate **dynamic allocation** (next section):

1. Size must be known at **compile time**
2. Once allocated, array **cannot grow or shrink**
3. Actual usage may be less than allocated → waste
4. Guessing max size is error-prone

> 💡 **Klefstad's slogan**: "With great power comes great responsibility" — dynamic allocation gives flexibility but requires manual management.

---

## 8. Dynamic Memory Allocation with `new` and `delete`

> Corresponds to LearnCpp 19.1 + PPT Dyn_Array.pptx pages 5-7

### 8.1 Three Types of Memory Allocation

C++ supports three basic types:

| Type | For what | Lifetime | Manual management? |
|---|---|---|---|
| **Static** | Static and global variables | Entire program | No (automatic) |
| **Automatic** | Function parameters, local variables | Enclosing block | No (automatic) |
| **Dynamic** | Heap-allocated objects | Until `delete`d | **Yes** (manual) |

Static and automatic both require:
- Size must be known at **compile-time**
- Memory management is automatic

### 8.2 Why We Need Dynamic Allocation

**The "guess the max" approach** is terrible:
```cpp
char name[25];             // hope names fit in 25!
Record record[500];        // hope there are < 500 records!
Monster monster[40];       // 40 monsters max
Polygon rendering[30000];  // hope this 3D scene has < 30,000 polys!
```

**Four problems**:
1. **Wasted memory** (if actual usage is less than max)
2. **Tracking valid entries** — is `monster[24]` alive, dead, or uninitialized?
3. **Stack limits** — stack is usually ~1MB (Visual Studio default). Fixed arrays that large cause **stack overflow** and program termination
4. **Artificial limits** — 600 records when you allocated 500 means disaster: either error out, truncate, or overflow (UB)

### 8.3 Stack vs. Heap

When a program runs, its memory is split into a few regions. The two we care about most are the **stack** and the **heap**:

```
high addr  ┌──────────────────┐
           │      stack       │  ← grows downward (function calls push frames)
           │        ↓         │
           │                  │
           │        ↑         │
           │       heap       │  ← grows upward (new allocates here)
           ├──────────────────┤
           │  global / static │
           ├──────────────────┤
           │ code (read-only) │
low addr   └──────────────────┘
```

#### What is the Stack?

- A **LIFO (last-in, first-out)** memory region, managed directly by the CPU (the `SP` register tracks the top).
- Every **function call** pushes a **stack frame** containing: function parameters, local variables, return address.
- When the function **returns**, the entire frame is popped at once — local variables are destroyed automatically.
- **Limited size** (typically ~1 MB; Linux default is 8 MB). Exceeding it causes **stack overflow**.

```cpp
void foo() {
    int x = 10;          // x lives in foo's stack frame
    int arr[1000];       // arr is also on the stack
}                        // foo returns, frame is popped, x and arr are gone
```

#### What is the Heap (a.k.a. free store)?

- A **large pool of free memory**, managed by the **runtime library** (not the CPU) via `malloc` / `new`.
- You **explicitly request** a chunk (`new`) and get a **pointer** back; you **explicitly return** it (`delete`) when done.
- **Lifetime is independent of scope** — heap objects survive after a function returns, as long as some pointer still references them.
- **Can be gigabytes** in size (limited by physical + virtual memory).

```cpp
int* p = new int{ 10 };  // allocate an int on the heap; p points to it
// ... use *p ...
delete p;                // free it manually when done
```

#### Detailed Comparison

| | Stack | Heap |
|---|---|---|
| **Managed by** | Compiler + CPU, automatic | You, manually (`new` / `delete`) |
| **Allocation speed** | Very fast (just move SP) | Slow (find a free block, possibly lock) |
| **Access speed** | Fast (known offset) | Slower (must dereference pointer first) |
| **Size** | Small (~1–8 MB) | Large (gigabytes) |
| **Lifetime** | Tied to scope (enter → exit) | From `new` to `delete` (scope-independent) |
| **Size requirement** | **Known at compile time** (array size must be constant) | Decided at runtime |
| **Fragmentation** | None (contiguous push/pop) | Yes (frequent new/delete creates holes) |
| **Failure mode** | Stack overflow (deep recursion, huge local arrays) | Memory leak, dangling pointer, double free |
| **Typical use** | Local variables, function parameters | Large objects, long-lived objects, runtime-sized objects |

#### When to use which?

| Situation | Choice |
|---|---|
| Small local variables, temporary computation | Stack |
| Small arrays with compile-time-known size | Stack |
| Large arrays / large objects (avoid stack overflow) | Heap |
| Size only known at runtime | Heap |
| Object must outlive the function that created it | Heap |
| Data structure nodes (linked list, tree, graph) | Heap |

> 💡 **Key Insight**:
> - **Stack**: Allocation/deallocation is **automatic**, but lifetime is bound to scope and space is small.
> - **Heap**: Allocation/deallocation is **manual**, lifetime is yours to decide, space is large — at the cost of needing a **pointer** to refer to each heap object, and being responsible for **freeing** it yourself.

> ⚠️ **C++ terminology**: Throughout this note, "stack object" usually means a variable with **automatic storage duration**; "heap object" means an object with **dynamic storage duration** (allocated via `new`). These are the standard's terms — "stack/heap" is the colloquial shorthand.

### 8.4 Allocating a Single Variable with `new`

```cpp
int* ptr{ new int };   // dynamically allocate an int; ptr stores its address
*ptr = 7;              // dereference to assign

int* ptr1{ new int (5) };    // direct initialization
int* ptr2{ new int { 6 } };  // uniform/brace initialization (preferred)
```

**Performance note**: Accessing heap objects is **slower** than stack objects — heap access requires two steps (fetch address from pointer, then fetch value), while stack access goes directly to the known address.

### 8.5 Deleting with `delete`

```cpp
delete ptr;       // return memory to the OS
ptr = nullptr;    // set pointer to null (best practice!)
```

> ⚠️ **`delete` does NOT "delete" the variable!**
> - It returns the **memory** to the OS
> - The pointer variable `ptr` still exists, still has the same scope
> - You can still use `ptr` — though doing so dereferences freed memory (UB!)

**Rule**: Only delete pointers that were allocated with `new`. Deleting non-dynamic pointers = bad things happen.

### 8.6 Dangling Pointers

> ⚠️ **Definition**: A **dangling pointer** points to deallocated memory. Dereferencing or deleting a dangling pointer → **undefined behavior**.

```cpp
int* ptr{ new int };
*ptr = 7;

delete ptr;          // ptr is now dangling
std::cout << *ptr;   // ❌ UB: access freed memory
delete ptr;          // ❌ UB: double-delete
```

**Multiple pointers create multiple dangling pointers**:
```cpp
int* ptr{ new int{} };
int* otherPtr{ ptr };   // both point to same memory

delete ptr;
ptr = nullptr;          // ptr is null — safe

// But otherPtr is still dangling! 💀
```

> 💡 **Best Practice**:
> - Try to avoid multiple pointers to the same dynamic memory
> - If unavoidable, be clear which pointer "owns" the memory (responsible for deletion)
> - **Set deleted pointers to `nullptr`** unless going out of scope immediately

### 8.7 `new` Can Fail (Rare but Important)

In rare cases, the OS may be out of memory. By default, `new` throws a `bad_alloc` exception. If unhandled, the program crashes.

**Alternative**: `new (std::nothrow)` returns `nullptr` instead of throwing:
```cpp
int* value { new (std::nothrow) int };   // nullptr if allocation fails

int* value { new (std::nothrow) int{} };
if (!value) {  // ALWAYS check!
    std::cerr << "Could not allocate memory\n";
    // Handle the error
}
```

> ⚠️ **Easy to forget** — since allocation failure is rare, people often skip the check.

### 8.8 Null Pointers and Dynamic Allocation

A null pointer means "no memory allocated here yet" — useful for conditional allocation:
```cpp
if (!ptr)                  // if not yet allocated
    ptr = new int;
```

> 💡 **Best Practice**: **Deleting a null pointer is okay, and does nothing**. No need to conditionalize.

```cpp
// Don't do this:
if (ptr)
    delete ptr;

// Just do:
delete ptr;   // if ptr is null, nothing happens
```

### 8.9 Memory Leaks

**Dynamic memory stays allocated until `delete`d or until the program ends.** But the **pointers** holding those addresses follow normal scoping rules.

**Classic memory leak**:
```cpp
void doSomething() {
    int* ptr{ new int{} };
    // no delete! when ptr goes out of scope, the address is LOST
    // the int still exists in heap, but we can never reach it again
}
```

**Other ways to leak**:
```cpp
// Reassign before delete:
int value = 5;
int* ptr{ new int{} };
ptr = &value;          // old address lost → LEAK

// Double allocation:
int* ptr{ new int{} };
ptr = new int{};       // first allocation lost → LEAK
```

**Fix**: Always delete before reassignment.

Memory leaks eat free memory while the program runs. Severe leaks can exhaust all memory, slow down or crash the whole machine. Only program termination lets the OS reclaim leaked memory.

### 8.10 Four Common Pointer Errors (PPT Summary)

The PPT groups these as "Pointer Caveats":

| Error | Description | Consequence |
|---|---|---|
| **Uninitialized pointer** | `int* p; *p = 0;` | **Segmentation violation** (SIGSEGV, "seg fault") |
| **Dangling reference** | Pointer to dead object | UB, very hard to debug |
| **Memory leak** | Lost pointer, memory never freed | Growing memory usage |
| **Redundant delete** | `delete ptr; delete ptr;` | UB |

> 💡 **Klefstad's Wisdom (PPT)**: "**Restrict dynamic allocation to class implementations.**"
>
> Don't scatter `new`/`delete` throughout your code. Hide them inside class constructors and destructors (RAII — Resource Acquisition Is Initialization). This is exactly what `std::vector`, `std::string`, etc. do.

---

## 9. Dynamically Allocating Arrays

> Corresponds to LearnCpp 19.2 + PPT Dyn_Array.pptx pages 5-10

### 9.1 `new[]` and `delete[]`

Unlike a fixed array (size fixed at compile-time), a dynamically allocated array can choose its length at **runtime**:

```cpp
#include <cstddef>
#include <iostream>

int main() {
    std::size_t length{};
    std::cin >> length;

    int* array { new int[length]{} };  // array new; length need not be constant!
    array[0] = 5;

    delete[] array;  // array delete
    return 0;
}
```

**Key points**:
- `new int[length]` returns a pointer to the first element — works even if `length` is non-constexpr
- Add `{}` to zero-initialize: `new int[length]{}`
- **`delete[]`** (not `delete`) releases array memory
- Length type should be `std::size_t`

### 9.2 The Critical Rule: Match `new` with `delete`!

> ⚠️ **One of the most common beginner errors**:
>
> Using `delete` instead of `delete[]` on an array → **undefined behavior** (data corruption, leaks, crashes).

| Allocation | Deallocation |
|---|---|
| `new T` | `delete ptr;` |
| `new T[n]` | `delete[] ptr;` |

Mixing is UB. Always match.

**How does `delete[]` know how much to delete?** `new[]` secretly tracks the allocated size. But **this info isn't accessible to the programmer**.

### 9.3 Dynamic Arrays ≈ Decayed Fixed Arrays

A dynamically allocated array:
- Starts its life as a **pointer to the first element**
- Has the **same limitations** as a decayed fixed array (doesn't know its own length, no `sizeof()`)
- **Difference**: you must call `delete[]` yourself

### 9.4 Initializing Dynamic Arrays

```cpp
int* arr1 { new int[length]{} };             // ✅ all zero-initialized
int* arr2 { new int[5]{ 9, 7, 5, 3, 1 } };   // ✅ C++11 initializer list
auto* arr3 { new int[5]{ 9, 7, 5, 3, 1 } };  // ✅ with auto to avoid repeating type
```

> 💡 Note: `new int[5]{ ... }` has **no `=`** between the size `[5]` and the initializer `{...}`.

### 9.5 Cannot Resize Dynamic Arrays

C++ has **no built-in way to resize** an already-allocated dynamic array. You'd have to:
1. Allocate a new (larger) array
2. Copy elements over
3. Delete the old array

This is **error-prone**, especially for class element types (which have special construction/destruction rules).

> 💡 **Best Practice**: For resizable arrays, use `std::vector` (which handles all this automatically).

### 9.6 Quiz Solution Highlights

The Reading's Quiz asks you to write a program that sorts user-entered names. Key techniques:

```cpp
// Allocate array of std::strings
auto* names{ new std::string[length]{} };

// Read in names (using getline for spaces)
std::getline(std::cin >> std::ws, names[i]);

// Sort pointer-based range
std::sort(names, names + length);

// Must use delete[]
delete[] names;
```

### 9.7 PPT Example: A Dynamic `IntList` Class

The PPT walks through a full `IntList` class that wraps a dynamic array. See §17 for the complete integrated example.

---

## 10. Shallow vs. Deep Copying

> Corresponds to LearnCpp 21.13

### 10.1 Shallow Copy (the Default)

The compiler-generated (implicit) copy constructor and assignment operator perform a **memberwise copy**, also called a **shallow copy**.

For simple classes (no dynamic memory), this is perfectly fine:

```cpp
class Fraction {
    int m_numerator { 0 };
    int m_denominator { 1 };
    // Implicit copy: copies m_numerator and m_denominator directly. Works great!
};
```

### 10.2 Shallow Copy Is DEADLY for Classes with Pointers

The problem: **shallow-copying a pointer copies the ADDRESS, not what it points to.** Both the original and the copy now point to the **same memory**.

```cpp
class MyString {
    char* m_data{};
    int m_length{};
public:
    MyString(const char* source = "") {
        m_length = std::strlen(source) + 1;
        m_data = new char[m_length];
        for (int i = 0; i < m_length; ++i)
            m_data[i] = source[i];
    }
    ~MyString() { delete[] m_data; }  // destructor frees the memory
    // NO explicit copy constructor — compiler generates a shallow one
};
```

**The disaster**:
```cpp
int main() {
    MyString hello{ "Hello, world!" };
    {
        MyString copy{ hello };   // shallow copy!
        // Now copy.m_data and hello.m_data point to SAME memory
    }  // copy destroyed → destructor runs → deletes shared memory!

    // hello.m_data now points to FREED memory
    std::cout << hello.getString();   // ❌ UB — access freed memory
}
```

### 10.3 Walkthrough of the Disaster

1. `MyString hello{ "Hello, world!" };` — constructor allocates memory, sets `hello.m_data` to it
2. `MyString copy{ hello };` — **shallow** copy: `copy.m_data = hello.m_data` (same address!)
3. Inner `{}` ends — `copy`'s destructor fires: `delete[] m_data` frees the shared memory
4. `hello.m_data` now **dangles** (points to freed memory)
5. `hello.getString()` dereferences dangling pointer — UB

### 10.4 Deep Copy (The Solution)

A **deep copy** allocates **new** memory for the copy and copies the **contents** over. Source and copy live in distinct memory.

```cpp
// Copy constructor: brand-new object, no old resource to release
MyString::MyString(const MyString& source)
    : m_length{ source.m_length }
{
    if (source.m_data) {
        m_data = new char[m_length];
        for (int i = 0; i < m_length; ++i)
            m_data[i] = source.m_data[i];
    } else {
        m_data = nullptr;
    }
}
```

> 💡 The **copy assignment operator** implementation lives in §12 — it must release old resources first, perform a self-assignment check, and return `*this`, none of which the copy constructor needs.

### 10.5 A Better Solution: Use Standard Library Classes

Instead of writing your own memory management:
- `std::string` handles strings
- `std::vector<T>` handles dynamic arrays
- These have **correctly implemented** copy/assignment/move operations

Less code, fewer bugs, less headache.

### 10.6 Summary

- Default copy constructor and assignment = **shallow copy** → fine for simple classes
- Classes with dynamically allocated memory need **deep copy** via user-defined copy constructor and copy assignment operator
- Favor standard library classes over DIY memory management

---

## 11. The Copy Constructor

> Corresponds to LearnCpp 14.14 — Introduction to the Copy Constructor
> \+ PPT class-and-struct.pptx (Complex class example)

### 11.1 What Is a Copy Constructor?

> 💡 **Definition**: A **copy constructor** is a constructor used to initialize an object with an existing object of the same type. After execution, the new object is a copy of the original.

```cpp
Fraction f { 5, 3 };    // calls Fraction(int, int) — normal constructor
Fraction fCopy { f };   // calls Fraction(const Fraction&) — copy constructor
```

### 11.2 Implicit Copy Constructor

If you don't write a copy constructor, **C++ generates a public implicit copy constructor** automatically. It does **memberwise initialization** — each member of the new object is initialized from the corresponding member of the original.

```cpp
class Fraction {
    int m_numerator{ 0 };
    int m_denominator{ 1 };
public:
    Fraction(int numerator = 0, int denominator = 1)
        : m_numerator{ numerator }, m_denominator{ denominator } {}
    void print() const { /* ... */ }
    // No copy constructor written — C++ generates one implicitly
};

Fraction f { 5, 3 };
Fraction fCopy { f };   // works! Prints Fraction(5, 3) Fraction(5, 3)
```

### 11.3 Writing Your Own Copy Constructor

```cpp
class Fraction {
public:
    // Copy constructor
    Fraction(const Fraction& fraction)
        : m_numerator{ fraction.m_numerator }
        , m_denominator{ fraction.m_denominator }
    {
        std::cout << "Copy constructor called\n";  // just to prove it works
    }
    // ...
};
```

> 💡 **Access Control Reminder**: Access controls are **per-class**, not per-object. A class's member functions can access **any object's** private members of the same type. That's why `fraction.m_numerator` compiles — even though `m_numerator` is private.

### 11.4 Critical Rule: Parameter Must Be a Reference

> ⚠️ **Requirement**: The parameter of a copy constructor **MUST** be an lvalue reference (preferably `const`).

```cpp
Fraction(const Fraction& f) { ... }  // ✅ correct
Fraction(Fraction f) { ... }          // ❌ COMPILE ERROR
```

**Why?** If the parameter were pass-by-value, copying it in would require calling the copy constructor → which would itself need pass-by-value → infinite recursion. This is caught at compile time.

> 💡 **Best Practice**: If you write your own copy constructor, the parameter should be a **const lvalue reference**.

### 11.5 Best Practice Trio

> 💡 **Best Practice 1**: **Copy constructors should have no side effects beyond copying.**
>
> Because the compiler may elide (optimize away) copy constructor calls. If your copy constructor has side effects (like printing, logging, counting), they may or may not execute — observable behavior becomes unpredictable.

> 💡 **Best Practice 2**: **Prefer the implicit copy constructor**, unless you have a specific reason to create your own.
>
> Unlike the implicit default constructor (which does nothing useful), the implicit copy constructor **does** useful work (memberwise copy) that's usually exactly what you want.

### 11.6 When Copy Constructor Is Triggered

**Trigger 1: Pass-by-value**:
```cpp
void printFraction(Fraction f) { f.print(); }  // f is a copy

Fraction f{ 5, 3 };
printFraction(f);   // copy constructor called to copy f into parameter
```

**Trigger 2: Return-by-value**:
```cpp
Fraction generateFraction(int n, int d) {
    Fraction f{ n, d };
    return f;  // copy constructor called to copy f into the temporary return value
}
```

### 11.7 Multiple Copies Can Occur!

```cpp
Fraction generateFraction(int n, int d) {
    Fraction f{ n, d };
    return f;                                          // copy #1
}

int main() {
    Fraction f2 { generateFraction(1, 2) };   // copy #2 from temporary to f2
    printFraction(f2);                         // copy #3 — pass to function
}
```

Output (without optimization):
```
Copy constructor called
Copy constructor called
Copy constructor called
Fraction(1, 2)
```

With **copy elision** (modern compilers), some or all of these copies may be eliminated. See §16.

### 11.8 Using `= default` and `= delete`

**`= default`**: Explicitly request the compiler-generated copy constructor:
```cpp
Fraction(const Fraction& fraction) = default;   // equivalent to implicit
```

**`= delete`**: Prevent copies entirely:
```cpp
Fraction(const Fraction& fraction) = delete;

// Now:
Fraction f { 5, 3 };
Fraction fCopy { f };   // ❌ COMPILE ERROR: copy constructor deleted
```

Useful for classes where copying doesn't make sense (unique resources, file handles, etc.).

### 11.9 Rule of Three (Preview)

> 💡 **Rule of Three**: If a class requires a user-defined copy constructor, destructor, OR copy assignment operator, it **probably requires all three**.
>
> **Rule of Five** (C++11 extension): Add move constructor and move assignment.

This is exactly the situation when your class manages dynamic memory. See §13 for full discussion.

### 11.10 Quiz: Why Can't the Parameter Be Pass-by-Value?

> Q: Why does the copy constructor parameter have to be a reference?
>
> A: If it were pass-by-value, then calling the copy constructor to copy an argument would itself require calling the copy constructor to copy the argument into the parameter of the copy constructor... infinite recursion. Compiler catches this and errors out.

---

## 12. Overloading the Copy Assignment Operator

> Corresponds to LearnCpp 21.12

### 12.1 Copy Assignment vs. Copy Constructor

> 💡 **When each is used**:

| Situation | Which runs? |
|---|---|
| Creating a NEW object from an existing one | **Copy constructor** |
| Passing by value, returning by value | **Copy constructor** (implicit) |
| Assigning to an ALREADY-EXISTING object | **Copy assignment** |

```cpp
Fraction f1 { 5, 3 };     // normal constructor
Fraction f2 { f1 };       // copy constructor (f2 is new)
Fraction f3;              // default constructor
f3 = f1;                  // copy assignment (f3 already exists)
```

### 12.2 Basic Syntax

**Must be a member function** (not a non-member):

```cpp
class Fraction {
public:
    Fraction& operator= (const Fraction& fraction) {
        // Simple version (no dynamic memory)
        m_numerator = fraction.m_numerator;
        m_denominator = fraction.m_denominator;
        return *this;   // return *this to support chaining
    }
};
```

### 12.3 Why Return `*this`?

To support **chained assignment**:
```cpp
Fraction f1, f2, f3;
f1 = f2 = f3;           // = is right-associative: f1 = (f2 = f3)
//         └─ this subexpression must yield a Fraction value to assign to f1
```

Returning `*this` gives a reference to the assigned-to object, allowing the chain.

### 12.4 The Self-Assignment Problem

C++ allows self-assignment:
```cpp
Fraction f1 { 5, 3 };
f1 = f1;   // legal, if silly
```

For **simple classes**: self-assignment wastes cycles but is harmless.

For **dynamic-memory classes**: self-assignment can be a **disaster**:

```cpp
// ❌ DANGEROUS version — no self-assignment check
MyString& MyString::operator=(const MyString& str) {
    if (m_data) delete[] m_data;   // ⚠️ if str IS *this, the SHARED data is freed!
    m_length = str.m_length;
    m_data = new char[m_length];
    std::copy_n(str.m_data, m_length, m_data);  // copying FREED garbage data!
    return *this;
}
```

**What goes wrong with `alex = alex`**:
1. `m_data == str.m_data` (same pointer)
2. `delete[] m_data` frees the data
3. `str.m_data` is now dangling
4. Allocate new memory for `m_data`
5. Copy from `str.m_data` (dangling) — **garbage!**

### 12.5 The Self-Assignment Guard

```cpp
MyString& MyString::operator=(const MyString& str) {
    // Self-assignment check
    if (this == &str)
        return *this;

    // ... rest of implementation safe now
    if (m_data) delete[] m_data;
    m_length = str.m_length;
    m_data = new char[m_length];
    std::copy_n(str.m_data, m_length, m_data);
    return *this;
}
```

> 💡 **Key Insight**: Check via **pointer comparison** (`this == &str`), not value comparison (`*this == str`).
> - Pointer comparison is **fast**
> - Doesn't require `operator==` to be defined

### 12.6 When You Can Skip Self-Assignment Check

- **Copy constructor**: Skip it. A newly-created object can't equal itself (except `someClass c { c };`, which is caught as uninitialized).
- **Classes that naturally handle self-assignment**: Like `Fraction` above — assigning `m_numerator = fraction.m_numerator` to yourself is harmless.

However, some gurus recommend **always** adding the guard defensively. That's a reasonable conservative approach.

### 12.7 The Copy and Swap Idiom

A cleaner pattern that gracefully handles self-assignment (mentioned in Reading, full details in future lessons):

```cpp
class T {
    T& operator=(T source) {    // Note: BY VALUE, not by reference!
        swap(*this, source);     // swap contents with the temporary copy
        return *this;
    }  // source's destructor cleans up our old data
};
```

This relies on making a copy via the parameter (which the compiler may elide), then swapping.

### 12.8 Implicit Copy Assignment

Just like copy constructor, the compiler generates an implicit copy assignment operator if you don't. It does memberwise assignment (shallow copy).

### 12.9 Preventing Assignment

```cpp
Fraction& operator= (const Fraction& fraction) = delete;   // no assignment allowed
```

### 12.10 const Members Disable Implicit Assignment

If your class has const members, the compiler **implicitly deletes** the assignment operator (can't assign to const members). To make a class with const members assignable for the non-const ones, you must explicitly write your own `operator=`.

---

## 13. The Rule of Three (and Five)

> Corresponds to LearnCpp 14.14 + 21.13 + 22.3 + PPT Dyn_Array.pptx page 10

### 13.1 Rule of Three (C++98)

> 💡 **Rule of Three**: If a class requires a user-defined **copy constructor**, **destructor**, or **copy assignment operator**, it probably requires **all three**.

**Why?** If you're defining any of these three, you're almost certainly managing dynamic memory. You need:
- **Destructor** to deallocate the memory (prevent leaks)
- **Copy constructor** to deep-copy on initialization (prevent shared state)
- **Copy assignment** to deep-copy on assignment (prevent shared state + leaks)

### 13.2 Full Rule of Three Example: `Vector`

From the PPT (simplified):

```cpp
class Vector {
    int maxLen;
    int* buf;
public:
    // Normal constructor
    Vector(int newLen)
        : maxLen{ newLen }, buf{ new int[newLen] }
    {}

    // 1. Destructor
    ~Vector() {
        delete[] buf;
    }

    // 2. Copy constructor (deep copy)
    Vector(const Vector& v)
        : maxLen(v.maxLen), buf(new int[v.maxLen])
    {
        for (int i = 0; i < v.maxLen; ++i)
            buf[i] = v.buf[i];
    }

    // 3. Copy assignment (deep copy + self-assignment guard)
    Vector& operator=(const Vector& v) {
        if (this != &v) {
            delete[] buf;
            maxLen = v.maxLen;
            buf = new int[v.maxLen];
            for (int i = 0; i < maxLen; ++i)
                buf[i] = v.buf[i];
        }
        return *this;
    }
};
```

### 13.3 What Happens If You Use Default Versions?

The PPT asks: **"What if I do this?"**

**Case A: Use `= default`**:
```cpp
String::String(const String& s) = default;            // SHALLOW copy
String& String::operator=(const String& s) = default; // SHALLOW copy
```
→ Two `String` objects share the same `buf`. When one destructs, the other dangles. Double-delete coming.

**Case B: Leave them empty**:
```cpp
String::String(const String& s) {}                          // buf uninitialized (garbage)
String& String::operator=(const String& s) { return *this; } // doesn't copy anything
```
→ New object has a garbage `buf`. When destructor runs, `delete[] garbage_address` → crash.

**Moral**: Don't use defaults. Don't leave them empty. Do the Rule of Three correctly.

### 13.4 Rule of Five (C++11)

> 💡 **Rule of Five**: If you define or delete any of the five special member functions, you should define or delete all five:
>
> 1. Destructor
> 2. Copy constructor
> 3. Copy assignment operator
> 4. **Move constructor** (new in C++11)
> 5. **Move assignment operator** (new in C++11)

Move constructors/assignments are covered in §14.

> 💡 **Rule of Zero**: If your class doesn't manage resources directly (uses `std::string`, `std::vector`, etc.), define **none** of the five. Let the compiler generate them all.

### 13.5 Interaction Rules for Special Member Functions

> ⚠️ **Tricky!** Here's how defining one can affect others:

- If you **declare** a destructor, copy constructor, or copy assignment → compiler **does NOT** generate implicit move constructor/assignment
- If you **delete** a copy constructor → compiler **does NOT** generate implicit move constructor/assignment
- If you **delete** a move constructor but leave copy constructor → class becomes **non-returnable-by-value** in some cases!

The safest policy: if you customize one, **be explicit about all five** (either define, `= default`, or `= delete`).

---

## 14. Move Constructors and Move Assignment

> Corresponds to LearnCpp 22.3

### 14.1 The Problem with Copy Semantics

Consider this "smart pointer" class using **deep copy**:

```cpp
template<typename T>
class Auto_ptr3 {
    T* m_ptr{};
public:
    Auto_ptr3(T* ptr = nullptr) : m_ptr{ptr} {}
    ~Auto_ptr3() { delete m_ptr; }

    // Copy constructor: deep copy
    Auto_ptr3(const Auto_ptr3& a) {
        m_ptr = new T;
        *m_ptr = *a.m_ptr;
    }

    // Copy assignment: deep copy
    Auto_ptr3& operator=(const Auto_ptr3& a) {
        if (&a == this) return *this;
        delete m_ptr;
        m_ptr = new T;
        *m_ptr = *a.m_ptr;
        return *this;
    }
    // operator*, operator->, isNull
};

Auto_ptr3<Resource> generateResource() {
    Auto_ptr3<Resource> res{new Resource};
    return res;  // copy constructor
}

int main() {
    Auto_ptr3<Resource> mainres;
    mainres = generateResource();  // copy assignment
}
```

**Output** (without elision):
```
Resource acquired      ← 1. res constructed
Resource acquired      ← 2. copy ctor: deep copy to temporary
Resource destroyed     ← 3. res destroyed
Resource acquired      ← 4. copy assign: deep copy to mainres
Resource destroyed     ← 5. temporary destroyed
Resource destroyed     ← 6. mainres destroyed at end of main
```

**3 allocations + 3 deallocations** for what's essentially "make a resource and give it to `mainres`". **Wasteful!**

### 14.2 Insight: When the Source Is About to Die, Just Steal Its Resources

If we know the source object is a **temporary** that's about to be destroyed anyway, why deep-copy? **Just take its pointer and leave it with nullptr.**

This is the **move semantics** idea.

### 14.3 Move Constructor and Move Assignment

C++11 introduces:
- **Move constructor**: transfers resources from an rvalue to a new object
- **Move assignment**: transfers resources from an rvalue to an existing object

**Key difference from copy**: parameter is `T&&` (rvalue reference, non-const), not `const T&`.

```cpp
template<typename T>
class Auto_ptr4 {
    T* m_ptr{};
public:
    // ... constructors, destructor, copy ctor, copy assign as before ...

    // Move constructor
    Auto_ptr4(Auto_ptr4&& a) noexcept
        : m_ptr{ a.m_ptr }   // steal the pointer
    {
        a.m_ptr = nullptr;   // ⭐ CRUCIAL: source no longer owns anything
    }

    // Move assignment
    Auto_ptr4& operator=(Auto_ptr4&& a) noexcept {
        if (&a == this) return *this;
        delete m_ptr;          // release our own resource
        m_ptr = a.m_ptr;       // steal
        a.m_ptr = nullptr;     // ⭐ CRUCIAL
        return *this;
    }
};
```

### 14.4 Output with Move Semantics

Same test code, now output:
```
Resource acquired
Resource destroyed
```

**Only 1 allocation + 1 deallocation** — the resource was moved (not copied) through the whole chain!

### 14.5 Why Set `a.m_ptr = nullptr`?

> ⚠️ **Critical rule**: When moving, you MUST leave the source in a valid state (typically: nullified).

Remember: the moved-from object **will still be destroyed**. Its destructor will run `delete m_ptr`. If we don't nullify the source:
- Both objects point to the same memory
- Source's destructor deletes it
- New object's destructor tries to delete same memory again → **double-delete** → UB

**The rule in one sentence**: *The moved-from object must be destructible without affecting the new object.*

### 14.6 The Key Insight of Move Semantics

> 💡 **Key Insight** (from Reading):
>
> - **If the argument is an lvalue**, the only safe thing is to **copy** — we don't know when it'll next be used
> - **If the argument is an rvalue** (temporary), it's about to die → we can safely **transfer its resources** (cheap) instead of copying (expensive)
> - Move semantics is **an optimization opportunity**

### 14.7 `noexcept`

Move functions should be marked **`noexcept`** (promise not to throw exceptions). This signals to the compiler and standard library containers (like `std::vector`) that moves are safe — only `noexcept` moves will be used in certain situations (e.g., when `std::vector` reallocates).

### 14.8 When Are Move Constructor / Move Assignment Called?

- **Move functions defined, AND argument is an rvalue** → move
  - Typically: literals, temporaries, `std::move(x)` (future lesson)
- **Otherwise** (lvalue, or move functions not defined) → copy

### 14.9 Implicit Move Constructor/Assignment

Compiler generates implicit move operations **only if** ALL of these are true:
- No user-declared copy constructor
- No user-declared copy assignment
- No user-declared move constructor/assignment
- **No user-declared destructor**

Implicit moves do **memberwise move**:
- Each member with a move constructor/assignment is moved
- Others are **copied**

> ⚠️ **Warning**: Implicit move copies pointers (doesn't null them)! If you want to actually transfer pointer ownership, **you must write the move functions yourself**.

### 14.10 Return by Value Moves lvalues (Special Rule)

In `generateResource()`, the local `res` is an lvalue — but the return statement **moves** it, not copies it:

```cpp
Auto_ptr4<Resource> generateResource() {
    Auto_ptr4<Resource> res{new Resource};
    return res;  // MOVED (even though res is an lvalue)
}
```

> 💡 **Special rule**: The C++ standard allows automatic objects returned by value to be **moved even if they are lvalues**. Logical, since `res` will be destroyed anyway.

In some cases, the compiler may do even better via copy elision — no move or copy at all.

### 14.11 Disabling Copying, Keeping Moves

```cpp
template<typename T>
class Auto_ptr5 {
    // ...
    Auto_ptr5(const Auto_ptr5& a) = delete;             // NO copy
    Auto_ptr5& operator=(const Auto_ptr5& a) = delete;  // NO copy
    Auto_ptr5(Auto_ptr5&& a) noexcept { /* steal */ }   // YES move
    Auto_ptr5& operator=(Auto_ptr5&& a) noexcept { /* steal */ }
    // ...
};
```

This is exactly how `std::unique_ptr` works: **move-only**, can't be copied.

### 14.12 Performance Example (From Reading)

The Reading runs a `DynamicArray<int>` of 1,000,000 elements through a function that allocates, populates, doubles, and reassigns:

| Version | Time | Speedup |
|---|---|---|
| With deep copy | 0.00825559 s | baseline |
| With move | 0.0056 s | **32.1% faster** |

Move semantics = real performance win.

### 14.13 Move Construction vs. Move Assignment (PPT Question)

> **PPT**: "What is the difference between construction and assignment?"

| Move Constructor | Move Assignment |
|---|---|
| Object is brand new — no resources yet | Object exists — may own resources |
| Just steal from source | **First release own resources**, then steal |
| No self-check needed | **Self-check** (else you might delete your own data before stealing it) |

### 14.14 Deleting Move Constructor/Assignment

```cpp
Name(Name&& n) = delete;
Name& operator=(Name&& n) = delete;
```

> ⚠️ **Subtle gotcha**: Deleting the move constructor but leaving the copy constructor **makes the class non-returnable-by-value** in some cases. Why? A deleted move constructor is still a **declared** function — overload resolution picks it over the copy constructor. Since it's deleted, it can't be used.

```cpp
Name getJoe() {
    Name joe{ "Joe" };
    return joe;   // ❌ COMPILE ERROR: move constructor was deleted
}
```

### 14.15 `std::swap` Inside Move Functions — Don't Do It!

A common bad pattern:
```cpp
Name(Name&& n) noexcept {
    std::swap(*this, n);   // BAD!
}
```

**Why?** `std::swap` on move-capable types **calls move constructor/assignment** internally → infinite recursion → stack overflow.

**Fix**: Write your own swap that doesn't use `std::swap` on the whole object — use `std::swap` on individual members:
```cpp
friend void swap(Name& a, Name& b) noexcept {
    std::swap(a.m_name, b.m_name);   // OK: swap the string member directly
}

Name(Name&& n) noexcept {
    swap(*this, n);   // uses our swap, not std::swap
}
```

### 14.16 Rule of Five Reference Template (`String` — aligned with HW4 / Reading Quiz)

All four special members + destructor (the **rule of five**) compressed into a minimal class — **structurally identical to HW4's `String` and the Reading Quiz code**: `char* buf`, `new[]/delete[]`, and a static helper `strdup(const char*)` for deep copy.

```cpp
class String {
    char* buf;
public:
    // Helper: allocate with new[] and strcpy a copy of a C-string
    static char* strdup(const char* s);

    // ━━━━━ Construct from C-string ━━━━━
    String(const char* s) : buf(strdup(s)) {}

    // ━━━━━ Destructor (required by rule of five) ━━━━━
    ~String() { delete[] buf; }

    // ━━━━━ Copy Constructor ━━━━━
    String(const String& s) : buf(strdup(s.buf)) {}
    // build a new object + deep copy. No old resource to free, no return value.

    // ━━━━━ Copy Assignment ━━━━━
    String& operator=(const String& s) {
        delete[] buf;              // free old
        buf = strdup(s.buf);       // deep copy
        return *this;              // chaining
    }

    // ━━━━━ Move Constructor ━━━━━
    String(String&& s) {
        buf = s.buf;               // steal pointer
        s.buf = nullptr;           // ⭐ source must remain destructible
    }

    // ━━━━━ Move Assignment ━━━━━
    String& operator=(String&& s) {
        delete[] buf;              // free old
        buf = s.buf;               // steal pointer
        s.buf = nullptr;           // ⭐
        return *this;
    }
};
```

> 💡 Self-assignment checks are omitted in the HW4 / quiz reference answers (not tested). In real code, add `if (this != &s)`, especially in copy assignment — to guard against `a = a` `delete[]`-ing itself before reading from `s.buf` (which would now be a dangling pointer).

#### Attribute comparison (four axes)

| | Copy Ctor | Copy Assign | Move Ctor | Move Assign |
|---|---|---|---|---|
| **Parameter** | `const String&` | `const String&` | `String&&` | `String&&` |
| **Free old resources** | ❌ No (new object) | ✅ Yes | ❌ No (new object) | ✅ Yes |
| **Resource handling** | New allocation (deep copy) | New allocation (deep copy) | Steal pointer + null source | Steal pointer + null source |
| **Return value** | (ctors don't return) | `String&` (return `*this`) | (ctors don't return) | `String&` (return `*this`) |
| **`noexcept`** | Not required | Not required | ✅ Strongly recommended | ✅ Strongly recommended |

#### Action checklist (Reading Quiz format)

Reading Quiz options look like `{ delete[] buf; buf = strdup(s.buf); return *this; }`. **Each clause in the braces maps to one column below** — scan the correct row and eliminate any option that doesn't match:

| | `delete[] buf` | `buf = strdup(...)` | `return *this` | `s.buf = nullptr` |
|---|:---:|:---:|:---:|:---:|
| **Copy Ctor** | ❌ | ✅ `strdup(s.buf)` | ❌ | ❌ |
| **Move Ctor** | ❌ | ❌ (just `buf = s.buf`) | ❌ | ✅ |
| **Copy Assign** | ✅ | ✅ `strdup(s.buf)` | ✅ | ❌ |
| **Move Assign** | ✅ | ❌ (just `buf = s.buf`) | ✅ | ✅ |

**One-line reading rule**:

> **Constructors: no `delete[]`, no `return`. Assignments: both. Copy: `strdup`. Move: null out source.**

Expanded into four rules:

- **Ctor vs. Assign**: assignments need `delete[]` + `return *this`; constructors need neither (new object has no old resource; ctors have no return)
- **Copy vs. Move**: copy uses `strdup(s.buf)` for a fresh deep copy; move steals the pointer and nulls the source
- **Constructing from `const char* s`** (not from `String`): use `strdup(s)` — **no `.buf`**
- **Self-assignment check** is omitted in the quiz's "minimal correct answer"; memorize it in pure HW4 style

> ⚠️ **In real code**: prefer `std::string` or `std::unique_ptr<char[]>` — then all five members get correct defaults for free, following the **rule of zero**. This `String` is only a HW4 / exam-style "raw pointer" reference.

---

## 15. Class Initialization Forms

> Corresponds to LearnCpp 14.15 — Class Initialization and Copy Elision

### 15.1 Six Initialization Forms (Review)

C++ provides six basic initialization forms for fundamental types — **all work for class types too**:

```cpp
int a;         // default initialization (NO initializer)
int b = 5;     // copy initialization (= after name)
int c( 6 );    // direct initialization (parentheses)

// List initialization (C++11):
int d { 7 };   // direct list initialization (preferred!)
int e = { 8 }; // copy list initialization (= + braces)
int f {};      // value initialization (empty braces)
```

### 15.2 The Same Six Forms for Classes

```cpp
class Foo {
public:
    Foo()                 { std::cout << "Foo()\n"; }
    Foo(int x)            { std::cout << "Foo(int) " << x << '\n'; }
    Foo(const Foo&)       { std::cout << "Foo(const Foo&)\n"; }
};

int main()
{
    // Default constructor (Foo())
    Foo f1;           // default initialization
    Foo f2{};         // value initialization (PREFERRED)

    // Normal constructor (Foo(int))
    Foo f3 = 3;       // copy initialization (non-explicit constructors only)
    Foo f4(4);        // direct initialization
    Foo f5{ 5 };      // direct list initialization (PREFERRED)
    Foo f6 = { 6 };   // copy list initialization (non-explicit only)

    // Copy constructor (Foo(const Foo&))
    Foo f7 = f3;      // copy initialization
    Foo f8(f3);       // direct initialization
    Foo f9{ f3 };     // direct list initialization (PREFERRED)
    Foo f10 = { f3 }; // copy list initialization
}
```

### 15.3 How C++ Chooses a Constructor

For **class types**:
- All matching constructors are examined
- Overload resolution picks the best match (possibly with implicit conversion)

For **non-class types** (e.g., `int`):
- Implicit conversion rules determine if the conversion exists

### 15.4 Three Key Differences Between Forms

> 💡 **Key Insight**: There are three important differences between initialization forms:
>
> 1. **List initialization disallows narrowing conversions** (e.g., `int x{3.5};` is an ERROR)
> 2. **Copy initialization only considers non-explicit constructors/conversions** (see future lesson on `explicit`)
> 3. **List initialization prioritizes matching list constructors** (e.g., `std::vector<int>{5}` creates a vector with one element `5`, not a vector of size 5)

### 15.5 Restrictions on Initialization

In some contexts, only certain initialization forms are allowed:
- **Constructor member initializer lists**: only direct forms (not copy init)
- Some contexts require a specific form

### 15.6 Best Practice

> 💡 **Best Practice**: Use **direct list initialization** (braces) whenever possible.

```cpp
Foo f{ args };      // direct list init
Foo f2{};           // value init (empty braces)
```

This:
- Disallows narrowing (safer)
- Works uniformly for fundamental and class types
- Handles empty-init cleanly

---

## 16. Copy Elision (briefly)

> Corresponds to the "Copy Elision" section of LearnCpp 14.15
> *(Note: your course reading assignment suggests this section is optional — included here briefly for context.)*

### 16.1 Unnecessary Copies

Consider:
```cpp
Something s { Something { 5 } };   // focus on this line
```

Without optimization, this makes **two** constructor calls:
1. `Something{5}` — creates a temporary via `Something(int)`
2. Temporary is copied into `s` via `Something(const Something&)`

Yet the end result is the same as:
```cpp
Something s { 5 };   // only ONE call — directly to Something(int)
```

### 16.2 What Is Copy Elision?

> 💡 **Definition**: **Copy elision** is a compiler optimization that removes unnecessary copying of objects. When the compiler optimizes away a copy constructor call, we say the constructor has been **elided**.

Crucially, **copy elision is exempt from the as-if rule** — it's allowed **even if the copy constructor has side effects** (like printing). This is precisely why copy constructors shouldn't have side effects!

### 16.3 Copy Elision in Pass-by-Value and Return-by-Value

```cpp
Something rvo() {
    return Something{};   // calls Something() — the copy constructor MAY be elided
}

Something nrvo() {
    Something s{};        // calls Something()
    return s;             // copy constructor MAY be elided
}

int main() {
    Something s1 { rvo() };   // copy MAY be elided
    Something s2 { nrvo() };  // copy MAY be elided
}
```

In the worst case (no optimization), 4 copies. With elision, often 0. Compilers vary:
- **Visual Studio 2022** elides 3 of 4
- **GCC** elides all 4

### 16.4 Mandatory Copy Elision in C++17

Prior to C++17, copy elision was **optional**. In C++17, it's **mandatory** in certain cases (e.g., temporary-to-named-object init like `Something s { Something{5} }`).

In mandatory elision cases, the copy constructor **doesn't even need to be accessible** (can be deleted!).
In optional elision cases, the copy constructor must still be declared (though it may be elided).

### 16.5 Takeaway

> 💡 **Memo**: Your copy constructor may or may not be called when you expect. If your copy constructor has side effects and you don't see them, copy elision is probably why. Don't rely on side effects in copy constructors.

---

## 17. Extended Example: IntList (Putting It All Together)

> Corresponds to PPT Dyn_Array.pptx pages 28-39 (IntList extended example)

This section integrates everything: Rule of Three/Five, dynamic arrays, operator overloading, etc. — all in one class.

### 17.1 Class Declaration

```cpp
#define DEFAULT_SIZE 10

class IntList {  // very similar to std::vector
private:
    int maxLen;   // capacity (physical size)
    int curLen;   // actual number of elements (logical size)
    int* buf;     // pointer to base of the dynamic int array
    // ...
};
```

> 💡 **Key distinction**: **physical size** (how much memory is allocated) vs. **logical size** (how much is actually used). This is exactly how `std::vector`'s `capacity()` vs. `size()` work.

### 17.2 Useful Helpers

```cpp
bool in_bounds(int i) { return i >= 0 && i < curLen; }

static void copy(int* to, int* from, int n) {
    for (int i = 0; i < n; ++i)
        to[i] = from[i];
}

void increaseArrayTo(int newSize) {
    int* oldBuf = buf;
    buf = new int[newSize];     // 1. allocate new (bigger) array
    copy(buf, oldBuf, curLen);  // 2. copy old elements over
    maxLen = newSize;            // 3. update capacity
    // curLen unchanged
    delete[] oldBuf;             // 4. free old array
}
```

### 17.3 Constructors

```cpp
IntList(int newLen = DEFAULT_SIZE)
    : maxLen( newLen ), curLen(0), buf( new int[newLen] )
{
    assert(newLen > 0);  // requires #include <cassert>
}

// Copy constructor (Rule of Three #2)
IntList(const IntList& l)
    : maxLen( l.maxLen ), curLen( l.curLen ), buf( new int[l.maxLen] )
{
    copy(buf, l.buf, l.curLen);
}
```

### 17.4 `length()` and `append()`

```cpp
int length() { return curLen; }

void append(int value) {
    if (curLen == maxLen)
        increaseArrayTo(maxLen + DEFAULT_SIZE);  // auto-grow
    buf[curLen++] = value;
}
```

### 17.5 Indexing and Assignment

```cpp
// Subscript: returns reference so it can be used as lvalue
int& operator[](int index) {
    assert(in_bounds(index));
    return buf[index];
}

// Copy assignment (Rule of Three #3)
IntList& operator=(const IntList& l) {
    if (maxLen < l.curLen)
        increaseArrayTo(l.curLen);
    copy(buf, l.buf, l.curLen);
    curLen = l.curLen;
    return *this;
}
```

### 17.6 Equality Operators

```cpp
bool operator==(const IntList& l) {
    if (curLen != l.curLen) return false;
    for (int i = 0; i < curLen; ++i)
        if (buf[i] != l.buf[i]) return false;
    return true;
}

bool operator!=(const IntList& l) {
    return !operator==(l);  // reuse ==
}
```

### 17.7 `indexOf()` and `remove()`

```cpp
int indexOf(int value) {
    for (int i = 0; i < curLen; ++i)
        if (buf[i] == value) return i;
    return -1;
}

void remove(int value) {
    int i = indexOf(value);
    if (i != -1)
        buf[i] = buf[--curLen];   // 🪄 clever: move last element to this position
}
```

> 💡 **Trick**: No need to shift all following elements — just copy the last element over the one being removed. Trade-off: element order is **not preserved**.

### 17.8 `reverse()` and Destructor

```cpp
IntList reverse() {
    IntList result(curLen);
    for (int i = curLen - 1; i >= 0; --i)
        result.append(buf[i]);
    return result;
}

// Destructor (Rule of Three #1)
~IntList() {
    delete[] buf;
}
```

### 17.9 `print()` and the Inserter

```cpp
void print(ostream& out) {
    for (int i = 0; i < curLen; ++i)
        out << buf[i] << ' ';
}

// Non-member operator<< (must be non-member)
ostream& operator<<(ostream& out, const IntList& l) {
    l.print(out);
    return out;
}
```

### 17.10 Move Constructor and Move Assignment (Rule of Five)

```cpp
// Move constructor — note: no const (we modify l!)
IntList(IntList&& l)
    : maxLen( l.maxLen ), curLen( l.curLen ), buf( l.buf )
{
    l.buf = nullptr;   // ⭐ CRUCIAL to avoid redundant delete
}

// Move assignment
IntList& operator=(IntList&& l) {
    delete[] buf;       // release own resource
    curLen = l.curLen;
    maxLen = l.maxLen;
    buf = l.buf;        // steal
    l.buf = nullptr;    // ⭐ source no longer owns the array
    return *this;
}
```

### 17.11 Sample Output

Running the Reading's test main produces:
```
My ints are 1 2 6 24 120 720 5040
Your ints are 1 2 6 24 120 720 5040
and they're equal
otherInts is empty
Other ints are 1 2 6 24 120 720 5040
Other ints are 5040 720 120 24 6 2 1
Other ints are 5040 1 120 24 6 2
```

Notice the last line: `720` was removed from `Other ints`, and `1` (the **last** element) took its place (hence the reorder).

---

## 18. Week 4 Quick Reference & Top Takeaways

### 18.1 Constants Cheatsheet

| Situation | Use |
|---|---|
| Init value is a constant expression | **`constexpr`** |
| Init value is runtime (e.g., `cin >> x`) | **`const`** |
| Integral type, compile-time needed (e.g., array length) | `constexpr` |
| Dynamic-memory types (`std::string`, `std::vector`) | `const` (not `constexpr`) |
| Function parameters | **`const`** only (never `constexpr`) |

### 18.2 Pointer / Reference / Rvalue Reference

| | `T*` Pointer | `T&` Reference | `T&&` Rvalue Reference |
|---|---|---|---|
| Can be null | ✅ | ❌ | ❌ |
| Must init at decl | ❌ (should) | ✅ | ✅ |
| Can rebind | ✅ | ❌ | ❌ |
| Binds to | any | lvalue | rvalue only |
| Syntax | `*p`, `p->` | direct | direct |
| Typical use | Dynamic memory, optional | Efficiency, avoid copy | Move semantics |

### 18.3 `new` / `delete` Combinations

| Allocation | Must deallocate with |
|---|---|
| `new T` | `delete p;` |
| `new T(args)` | `delete p;` |
| `new T[n]` | `delete[] p;` |
| `new T[n]{}` (zero-init) | `delete[] p;` |
| `new T[n]{a, b, c}` (list-init) | `delete[] p;` |

> ⚠️ **Mixing `new`/`delete[]` or `new[]`/`delete` = UB**

### 18.4 Rule of Three / Five / Zero

| Rule | When to apply | What to define |
|---|---|---|
| **Rule of Zero** | Class uses only standard types | **Nothing** — let compiler generate |
| **Rule of Three** | Class manages dynamic memory (pre-C++11) | Destructor, copy constructor, copy assignment |
| **Rule of Five** | Same, but modern C++ | Above + move constructor + move assignment |

### 18.5 Copy vs. Move

| | Copy | Move |
|---|---|---|
| Parameter | `const T&` | `T&&` (non-const) |
| When called | lvalue arg, or move undefined | rvalue arg + move defined |
| Action | Deep copy resources | Steal resources (shallow copy + nullify source) |
| Source after | Unchanged | **Empty / in valid-but-unspecified state** |
| Cost | O(n) | O(1) |

### 18.6 Common Pitfalls to Avoid on Quiz

1. **`new[]` matched with `delete`** (not `delete[]`) — UB
2. **Copy constructor parameter by value** (not reference) — compile error
3. **Copy constructor parameter not `const`** — can't init from const objects
4. **Forgot self-assignment check** — deletes own data before stealing
5. **Forgot `nullptr` on source in move** — double-delete
6. **Returning pointer/reference to local variable** — dangling
7. **`float f { 4.1 };`** — warning (use `4.1f`)
8. **Conditional operator in compound expression without parens** — precedence trap
9. **`const double` treated as constant expression** — it's NOT (only const **integral**)
10. **Memory leak** — lost pointer, no `delete`
11. **`constexpr` on function parameters** — not allowed
12. **Modifying string literal via `char*`** — UB (literals are read-only)
13. **Printing `&c` where `c` is a `char`** — `cout` thinks it's a string → garbage output
14. **Forgot `return *this` in `operator=`** — breaks chained assignment

### 18.7 Python ↔ C++ Comparisons (Week 4 Focus)

| Python | C++ | Note |
|---|---|---|
| `x if cond else y` | `cond ? x : y` | Operand order differs |
| No distinction: copy vs. move | Deep copy vs. move (explicit) | C++ has no GC, must decide |
| `list.append(x)` | `std::vector::push_back(x)` or manual | C array can't grow |
| `copy.deepcopy(obj)` | Write custom deep copy (Rule of Three) | C++ default is shallow |
| `del obj` (frees) | `delete ptr;` (manual) | No GC — manual memory |
| Assignment = bind name | Assignment = copy (or move) value | Totally different semantics |
| All integers are arbitrary precision | `int`, `long`, `long long` with limits | Use suffixes for literals |
| `'abc'` == `"abc"` (same) | `'a'` = char, `"a"` = C-string | ⚠️ different in C++ |
| No `constexpr` equivalent | `constexpr` = guaranteed compile-time | C++ distinguishes |

### 18.8 Klefstad's Key Slogans from Lecture

| Slogan | Meaning |
|---|---|
| "I just want to get it to work" | 🚫 Bad mindset — write clean first |
| "I'll clean it up later" | 🚫 Later often becomes never |
| Functions > 5 lines → refactor | ✅ Keep functions short |
| Test each piece | ✅ Incremental testing |
| "Restrict dynamic allocation to class implementations" | ✅ Hide `new`/`delete` inside classes (RAII) |
| "With great power comes great responsibility" | ✅ Dynamic memory requires discipline |

### 18.9 Week 4's Five Most Important Takeaways

1. **Rule of Three/Five**: Classes managing dynamic memory MUST define destructor + copy ctor + copy assignment (and ideally move ctor + move assignment). Default shallow copy leads to double-delete and dangling pointers.

2. **`new` ↔ `delete`, `new[]` ↔ `delete[]` — never mix**: Mixing causes undefined behavior. This is one of the most common beginner errors.

3. **Copy constructor MUST take `const T&`**: Pass-by-value would cause infinite recursion; missing const blocks const arguments; missing reference is a compile error.

4. **Move semantics is about stealing, not copying**: The critical detail is `a.m_ptr = nullptr;` — without it, the source's destructor will delete the same memory the new object now owns → redundant delete → UB.

5. **`constexpr` requires compile-time evaluability**: It's more strict than `const`. Function parameters can't be `constexpr`. Types with dynamic memory (`std::string`, `std::vector`) aren't `constexpr`-compatible — use `const`, or switch to `std::string_view` / `std::array`.
