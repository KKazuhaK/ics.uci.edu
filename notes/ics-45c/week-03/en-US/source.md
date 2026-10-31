# Information and Computer Science 45C — Week 3 Reading Notes

## Table of Contents

- [1. Introduction to std::string](#1-introduction-to-stdstring)
- [2. Introduction to std::string_view](#2-introduction-to-stdstring_view)
- [3. Return by Reference and Return by Address](#3-return-by-reference-and-return-by-address)
- [4. Default Constructors and Default Arguments](#4-default-constructors-and-default-arguments)
- [5. Introduction to C-style Arrays](#5-introduction-to-c-style-arrays)
- [6. C-style Array Decay](#6-c-style-array-decay)
- [7. Pointer Arithmetic and Subscripting](#7-pointer-arithmetic-and-subscripting)
- [8. C-style Strings](#8-c-style-strings)
- [9. Introduction to Operator Overloading](#9-introduction-to-operator-overloading)
- [10. Overloading the I/O Operators](#10-overloading-the-io-operators)
- [11. Overloading Operators Using Member Functions](#11-overloading-operators-using-member-functions)
- [11B. Object Lifetime Walkthrough — Lecture Supplement](#11b-object-lifetime-walkthrough--lecture-supplement)
- [12. Basic File I/O](#12-basic-file-io)
- [13. Code Coverage (Testing)](#13-code-coverage-testing)
- [14. Common Semantic Errors in C++](#14-common-semantic-errors-in-c)
- [15. Detecting and Handling Errors](#15-detecting-and-handling-errors)
- [16. Custom String Class — Lecture Supplement](#16-custom-string-class--lecture-supplement)
- [17. The static Keyword](#17-the-static-keyword)
- [18. Quick Reference Summary](#18-quick-reference-summary)

> UCI ICS 45C: Programming in C++ (35770)  
> These notes integrate Week 3 Assigned Reading (LearnCpp chapters) with lecture slides (Classes, Strings), organized in study order.

---

## 1. Introduction to std::string

> Corresponds to LearnCpp 5.7 — Introduction to std::string

### 1.1 Why std::string Over C-style Strings?

C-style string variables (char arrays) are hard to work with: you can't use `=` to assign a new value, and copying a string that's too long causes undefined behavior. `std::string` handles all of this automatically.

```cpp
#include <string>

std::string name{"Alex"};  // initialize
name = "John";             // reassign — works fine!
name = "A much longer name than before";  // also fine — auto-resizes
```

**Python comparison:** `std::string` behaves much like Python's `str`, except that C++ strings are mutable (you can change individual characters).

### 1.2 String Input: >> vs getline()

`std::cin >> str` reads only **one word** (stops at whitespace). To read an entire line, use `std::getline()`:

```cpp
std::string name{};
std::getline(std::cin >> std::ws, name);  // reads full line, skips leading whitespace
```

> ⚠️ **The `std::ws` trap:** If you mix `cin >>` and `getline()`, a leftover `'\n'` in the input buffer will cause `getline` to read an empty string. Always use `std::cin >> std::ws` as the first argument to `getline` to consume leading whitespace.

```cpp
int choice{};
std::cin >> choice;             // leaves '\n' in buffer

std::string name{};
std::getline(std::cin >> std::ws, name);  // std::ws eats the leftover '\n'
```

### 1.3 Deep Dive: std::ws

`std::ws` is an **I/O manipulator** — same family as `std::endl`, `std::setw`, and `std::setprecision`. It lives in `<istream>` (usually pulled in via `<iostream>`).

**What it does:** When inserted into an input stream, it consumes **leading** whitespace characters (spaces, tabs, newlines) until it hits a non-whitespace character or EOF. That's it — it does **not** skip middle or trailing whitespace.

```cpp
std::cin >> std::ws;  // discard whatever whitespace is at the front of the buffer
```

**Why do we need it specifically for `getline`?**

The `>>` operator has a flag called `std::skipws` that's **on by default** for input streams. That's why this just works without thinking:

```cpp
int a, b;
std::cin >> a >> b;  // "  42   7  " → a=42, b=7 (skipws auto-handles whitespace)
```

But `std::getline()` is different — it does **not** consult `skipws`. It reads everything up to (and including) the first `'\n'`, so any leftover `'\n'` in the buffer immediately terminates it with an empty string:

```cpp
int age;
std::string name;
std::cin >> age;              // reads 42, leaves '\n' in buffer
std::getline(std::cin, name); // reads empty string (just the stray '\n')! ❌
```

Putting `std::cin >> std::ws` as the first argument to `getline` eats that leftover `'\n'` (and any other whitespace) before reading:

```cpp
std::cin >> age;
std::getline(std::cin >> std::ws, name);  // ✅ eats '\n' first, then reads the real name
```

**Key takeaway:** Only use `std::ws` with `getline` (or other input operations that don't auto-skip whitespace). For `>>` reading into primitives or strings, it's redundant.

| Input operation | Needs `std::ws`? | Why |
|----------------|-----------------|-----|
| `cin >> int_var` | ❌ | `skipws` flag is on by default |
| `cin >> string_var` | ❌ | `operator>>` skips leading whitespace automatically |
| `cin >> char_var` | ❌ | Same |
| `getline(cin, str)` | ✅ (when mixed with `>>`) | `getline` does NOT skip whitespace |
| `cin.get()` / `cin.get(ch)` | ✅ (if you want to skip) | These read raw characters, including whitespace |

> ⚠️ **Caveat:** `std::ws` only skips **leading** whitespace. If you want to read `"  hello  "` and trim both ends, `std::ws` only handles the front — you'd need to trim the back yourself (e.g., erase trailing spaces after reading).

> 💡 **Python comparison:** `std::cin >> std::ws` is roughly analogous to calling `.lstrip()` on the input stream — it strips leading whitespace but leaves everything else alone.

### 1.4 Useful std::string Operations

```cpp
std::string s{"Hello"};
s.size();       // 5 (same as s.length())
s[0];           // 'H'
s[0] = 'J';     // s is now "Jello"
s + " World";   // concatenation → "Jello World"
s.empty();      // false
```

> 💡 `std::string` uses **dynamic memory allocation** internally. It can grow and shrink as needed, but this makes it slower than fixed-size C-style strings for some use cases.

### 1.5 std::string Literals (the `s` Suffix)

Double-quoted string literals like `"hello"` are **C-style strings** by default — their type is `const char*`, not `std::string`. To create an actual `std::string` literal, append an `s` suffix (the `s` must be lowercase):

```cpp
#include <iostream>
#include <string>

int main() {
    using namespace std::string_literals;  // bring in the `s` suffix

    std::cout << "goo\n";     // C-style literal (const char*)
    std::cout << "foo\n"s;    // std::string literal
    std::cout << "moo\n"s;    // std::string literal
}
```

The `s` suffix lives in the namespace `std::literals::string_literals`. LearnCpp's recommendation: bring it in with `using namespace std::string_literals;` **inside the function** where you need it, not at file scope — since `using namespace` in a header or at top-level can leak identifiers into places you didn't intend.

**When does this actually matter?**

Most of the time you don't need it, because initialization converts automatically:

```cpp
std::string name{"Alex"};     // no suffix needed — constructor converts const char* → std::string
void foo(std::string s);
foo("hello");                 // also fine — implicit conversion
```

But the `s` suffix is **required** when the compiler needs to deduce `std::string` rather than `const char*`:

```cpp
auto s1 = "hello";   // ⚠️ type is const char*, NOT std::string
auto s2 = "hello"s;  // ✅ type is std::string
```

It also comes up in templated code where the template argument must already be `std::string` before deduction happens.

> 💡 **For advanced readers:** `"hello"s` is implemented roughly as `std::string{"hello", 5}` — it constructs a temporary `std::string` from the underlying C-style literal (length 5, excluding the null terminator).

> 💡 **Parallel for std::string_view:** There's also a `sv` suffix in `std::literals::string_view_literals` that creates a `std::string_view` literal: `auto sv = "hello"sv;`. Same idea as `s`, same recommendation — prefer function-scoped `using namespace std::string_view_literals;`.

---

## 2. Introduction to std::string_view

> Corresponds to LearnCpp 5.8 — Introduction to std::string_view

### 2.1 The Problem: std::string Copies Are Expensive

```cpp
void printString(std::string s) {  // ⚠️ makes a copy every call!
    std::cout << s;
}

std::string name{"A very long name..."};
printString(name);  // copy #1
printString(name);  // copy #2 — wasted work
```

Every call copies the entire string's contents. For short strings this is cheap; for long ones it's a real cost you pay on every call.

### 2.2 std::string_view: A Non-owning View

C++17 introduced `std::string_view` in `<string_view>`. It's a **read-only view** into an existing string — internally it stores just a pointer and a length, with no data of its own.

```cpp
#include <string_view>

void printString(std::string_view s) {  // cheap — no copy
    std::cout << s;
}

std::string name{"A very long name..."};
printString(name);                      // ✅ view into name
printString("literal");                 // ✅ view into string literal
printString(std::string{"temporary"});  // ✅ view into temporary std::string
```

A `string_view` is flexible: it can be initialized from a `std::string`, a C-style string (`const char*`), or a string literal.

**Python comparison:** `std::string_view` is like a Python slice `s[start:end]` — it borrows a window into existing data rather than copying.

### 2.3 Key Point: Non-owning

`string_view` does **NOT own** the data it points to. The underlying string must **outlive** the view:

```cpp
std::string_view getView() {
    std::string s{"Hello"};  // local std::string
    return s;  // ❌ DANGLING VIEW — s is destroyed when function returns
}
```

```cpp
std::string_view sv;
{
    std::string s{"Hello"};
    sv = s;  // sv views s
}  // s is destroyed here
std::cout << sv;  // ❌ dangling — undefined behavior
```

> ⚠️ **Rule of thumb:** Never store a `string_view` as a class member or return one from a function unless you're certain the underlying data outlives the view.

### 2.4 Pass by Value, Not by Reference

`std::string_view` is tiny (typically 16 bytes: a pointer + a length). Pass it **by value**, not by reference:

```cpp
void good(std::string_view s);          // ✅ pass by value
void bad(const std::string_view& s);    // ❌ unnecessary — nothing to avoid copying
```

### 2.5 Common Operations

```cpp
std::string_view s{"Hello World"};
s.size();           // 11
s.length();         // 11 (same as size)
s[0];               // 'H'
s.substr(6, 5);     // "World" — still a view, no copy
s.remove_prefix(6); // now views "World"
s.remove_suffix(1); // now views "Worl"
s == "Worl";        // true
```

> 💡 `.remove_prefix()` and `.remove_suffix()` shrink the view by advancing/retracting its bounds. They don't modify the underlying data.

### 2.6 When to Use What

| Use case | Preferred type |
|----------|----------------|
| Function parameter (read-only) | `std::string_view` |
| Member variable (owns data) | `std::string` |
| Return value (you created the string) | `std::string` |
| Return value (view into existing data) | `std::string_view` ⚠️ careful about lifetime |
| Temporary concatenation (`s1 + s2`) | `std::string` (string_view can't concatenate) |

> 💡 **Modern C++ rule:** Prefer `std::string_view` for read-only string parameters. Use `std::string` only when you need ownership or mutation.

### 2.7 Gotcha: No Guaranteed Null Termination

A `std::string_view` is just "pointer + length" — it does **not** guarantee the viewed data is null-terminated. So you cannot safely pass `sv.data()` to C APIs that expect a `const char*`:

```cpp
std::string_view sv{"Hello World"};
auto sub = sv.substr(0, 5);    // views "Hello"
printf("%s\n", sub.data());    // ❌ prints "Hello World" — no '\0' at position 5!
```

If you need a null-terminated string for a C API, convert back to `std::string`:

```cpp
std::string s{sub};
printf("%s\n", s.c_str());     // ✅ s.c_str() is guaranteed null-terminated
```

> ⚠️ **Remember:** `std::string::c_str()` is null-terminated; `std::string_view::data()` is not.

---

## 3. Return by Reference and Return by Address

> Corresponds to LearnCpp 12.12 — Return by reference and return by address

### 3.1 Why Return by Reference?

Returning a class type by value makes a copy, which can be expensive. Return by reference avoids the copy:

```cpp
const std::string& getProgramName() {
    static const std::string s_programName{"Calculator"};
    return s_programName;  // returns a reference — no copy
}
```

### 3.2 The Dangling Reference Danger

The object being returned **must outlive the function**. Returning a reference to a local variable is undefined behavior:

```cpp
const std::string& getProgramName() {
    const std::string name{"Calculator"};  // local variable
    return name;  // ❌ DANGLING REFERENCE — name is destroyed when function ends
}
```

> ⚠️ **Rule:** Never return a non-static local variable or temporary by reference. The compiler usually warns about this, but not always in complex cases.

### 3.3 Lifetime Extension Doesn't Cross Function Boundaries

```cpp
const int& returnByConstRef() {
    return 5;  // temporary object — destroyed at end of function
}

int main() {
    const int& ref{returnByConstRef()};  // dangling!
    std::cout << ref;  // undefined behavior
}
```

Even though `const int&` normally extends the lifetime of a temporary, this extension **does not work across function boundaries**.

### 3.4 When to Return by Reference

| Situation | Return by... | Example |
|-----------|-------------|---------|
| Calculated new value | Value | `int sum(int a, int b)` |
| Static local / member variable | const reference | `const std::string& getName()` |
| Parameter passed by reference | Reference (same lifetime) | `ostream& operator<<(ostream& out, ...)` |
| Local variable | ❌ Never by reference | — |

---

## 4. Default Constructors and Default Arguments

> Corresponds to LearnCpp 14.11 — Default constructors and default arguments

### 4.1 What Is a Default Constructor?

A **default constructor** is one that can be called with no arguments. It can be:

1. A constructor with no parameters
2. A constructor where all parameters have default values

```cpp
class Complex {
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0)  // default constructor (all params have defaults)
        : re(newRe), im(newIm) {}
};

Complex c1{};        // calls Complex(0.0, 0.0)
Complex c2{1.0, 2.0}; // calls Complex(1.0, 2.0)
```

### 4.2 Implicit vs Explicit Default Constructor

If you write **no constructors at all**, the compiler generates an **implicit default constructor** for you: zero parameters, no member initializer list, empty body. Its only job is to let `Foo foo{};` compile. It's generated **only when** the class has **zero user-declared constructors**.

If you write any non-default constructor (e.g., `Foo(int x)`), the compiler **stops** generating the implicit default constructor — now `Foo foo{};` becomes a compile error. To get the default constructor back without writing an empty function body, use **`= default`**:

```cpp
class Foo {
public:
    Foo() = default;     // explicitly defaulted default constructor
    Foo(int x, int y);   // non-default constructor
};

Foo f1{};           // ✅ uses Foo() = default
Foo f2{1, 2};       // ✅ uses Foo(int, int)
```

### 4.3 `= default` vs `Foo() {}`: The Behavioral Difference

These two look almost identical — both give you a no-argument constructor — but they behave differently in a way that can bite you:

```cpp
class Written {
    int m_a;      // no default initializer
    int m_b{};    // has default initializer
public:
    Written() {}            // user-written empty body
};

class Defaulted {
    int m_a;      // no default initializer
    int m_b{};    // has default initializer
public:
    Defaulted() = default;  // explicitly defaulted
};

Written w{};      // what's in w.m_a ?
Defaulted d{};    // what's in d.m_a ?
```

| Member | `Written w{}` | `Defaulted d{}` |
|--------|---------------|-----------------|
| `m_a` (no initializer) | **uninitialized** (garbage!) | **zero-initialized** to 0 |
| `m_b{}` | 0 (from its initializer) | 0 (from its initializer) |

**Why the difference?** Value initialization (`{}`) of a class whose default constructor is **implicit or `= default`** first **zero-initializes** all members, then runs the constructor. But when you write `Foo() {}` yourself, the compiler treats it as a **user-defined** constructor and **skips** the zero-initialization step — it assumes your constructor body takes care of initialization.

> ⚠️ **Why this matters:** If you write `Foo() {}` thinking it's equivalent to `= default`, any member without an explicit default initializer ends up holding garbage. This is a silent bug that compiles cleanly and reads uninitialized memory at runtime.

> ✅ **Best practice:** Pick ONE of the two safe patterns:
> 1. Use `Foo() = default;` and let the compiler generate it
> 2. Or give **every data member** a default member initializer (`int m_b{};`)
>
> If you do #2, the `= default` vs `{}` difference becomes harmless — but #1 is still preferred as the clearer intent.

### 4.4 The Ambiguity Trap

A class should only have **one** default constructor. Having two causes ambiguity:

```cpp
class Foo {
public:
    Foo() {}
    Foo(int x = 1, int y = 2) {}  // also a default constructor!
};

Foo f{};  // ❌ compile error: ambiguous
```

### 4.5 Value Initialization vs Default Initialization

```cpp
Foo foo{};   // value initialization — preferred ✅
Foo foo2;    // default initialization — less safe for aggregates
```

> ⚠️ **Best practice:** Always use `{}` (value initialization) for class types.

### 4.6 When NOT to Provide a Default Constructor

Just because you **can** provide a default constructor doesn't mean you **should**. A default constructor only makes sense when the class has a **semantically meaningful default state**.

**Good candidate — `Fraction`:** zero is a perfectly sensible default value.

```cpp
class Fraction {
    int m_num{0};
    int m_den{1};
public:
    Fraction() = default;                                    // ✅ 0/1 makes sense
    Fraction(int n, int d) : m_num{n}, m_den{d} {}
};

Fraction f{};  // ✅ zero fraction
```

**Bad candidate — `Employee`:** an employee with no name or ID is meaningless, so we **intentionally** don't provide a default constructor.

```cpp
class Employee {
    std::string m_name;
    int m_id;
public:
    // NO default constructor — omitted on purpose
    Employee(std::string name, int id)
        : m_name{std::move(name)}, m_id{id} {}
};

Employee e{};  // ❌ compile error — and that's exactly what we want!
```

The compile error is your friend: it catches misuse at compile time instead of leaving you with a half-constructed object at runtime.

> 💡 **Design principle:** Default constructors are a convenience, not an obligation. Only provide one when a default-constructed object would actually be useful to someone.

---

## 5. Introduction to C-style Arrays

> Corresponds to LearnCpp 17.7 — Introduction to C-style arrays

### 5.1 Declaration and Initialization

C-style arrays are built into the core language — no `#include` needed. The length must be a **constant expression** (known at compile time) and must be **at least 1** (zero-length stack arrays are illegal):

```cpp
int arr1[5]{};                   // 5 zero-initialized ints
int arr2[4]{1, 2};               // partial init — tail elements zero-initialized → {1, 2, 0, 0}
constexpr int len{5};
int arr3[len]{};                 // length can be a constexpr name

int bad1[3];                     // ⚠️ default-initialized — elements hold garbage (NOT zero!)
int n{5};
int bad2[n];                     // ❌ error — n isn't constexpr (VLAs are non-standard C++)
```

> ⚠️ **Default vs value init:** `int arr[3];` leaves elements **uninitialized** (garbage). `int arr[3]{};` **zero-initializes** them. **Always** use `{}` when you want zeros.

**`const` and `constexpr` arrays:** Arrays can be qualified like other variables. A `const` array must be initialized at declaration; a `constexpr` array is usable in constant expressions:

```cpp
const int primes[]{2, 3, 5, 7, 11};          // const — elements can't be modified
constexpr int squares[5]{1, 4, 9, 16, 25};   // usable in constant expressions
```

**Python comparison:** Like a Python `list` with a fixed size and a single element type. No `append()` — size is baked in at compile time.

### 5.2 Length Deduction

When you explicitly initialize every element, you can **omit the length** and let the compiler count:

```cpp
int a[]{1, 2, 3, 4, 5};   // length deduced = 5
int b[] = {10, 20, 30};   // also works (copy-list form)
```

> ✅ **Best practice:** Prefer length deduction when you're initializing every element explicitly. That way, adding or removing elements doesn't require also updating the length — no risk of them drifting out of sync.

> ⚠️ **Gotcha:** You **cannot** combine empty braces with omitted length — `int arr[]{};` would be a zero-length array, which is invalid. Either give it a length (`int arr[5]{};`) or provide initializers.

### 5.3 Subscripting

Arrays are 0-indexed. The index can be **any integral type** — signed, unsigned, or an unscoped enum. Unlike standard library containers, there are no sign-conversion warnings:

```cpp
int arr[5]{9, 7, 5, 3, 1};
arr[0];      // 9
arr[4];      // 1
arr[5];      // ❌ undefined behavior — no bounds checking!

unsigned u{2};
arr[u];      // ✅ 5 — unsigned index is fine
arr[-1];     // ❌ undefined behavior (but compiles silently)
```

> ⚠️ C-style arrays do **no bounds checking**. Any out-of-range access — positive or negative — is undefined behavior that compiles clean.

> 💡 **Declaration vs subscript — same punctuation, different things:** The `[]` in `int arr[5]` is **declaration syntax** saying "this is an array of 5 ints". The `[]` in `arr[3]` is the **subscript operator** that reads / writes an element. Don't confuse them.

### 5.4 Using char as an Index

> 📖 **Covered in Week 2 §16.5** — the `int counts[26]{0}; index = letter - 'A'; ++counts[index];` idiom for per-letter bookkeeping, with the warning about not using a literal character as the index (`'A'` is 65, way out of bounds).

### 5.5 Getting the Length of an Array

**`sizeof(arr)`** returns the total size **in bytes**, NOT the number of elements:

```cpp
int arr[5]{};
sizeof(arr);       // 20  (on a system with 4-byte int)
sizeof(arr[0]);    // 4
```

A C-style array has **zero overhead** — its memory is exactly `length × sizeof(element)`. So the legacy C-era formula for the element count is:

```cpp
// Legacy approach (still works on non-decayed arrays)
size_t n = sizeof(arr) / sizeof(arr[0]);  // 5
```

**C++17 onward** introduced **`std::size(arr)`**, which is safer and clearer:

```cpp
#include <iterator>  // or <array>, <vector>

int arr[5]{};
std::size(arr);   // 5 — returns std::size_t (unsigned)
std::ssize(arr);  // 5 — C++20, returns a signed type
```

> ✅ **Best practice:** Use `std::size(arr)` over `sizeof(arr) / sizeof(arr[0])`. It's clearer in intent, and — critically — it **fails with a compile error** (rather than silently returning the wrong answer) if the "array" has already decayed to a pointer. See section 6 for why this matters.

**`std::size` vs `std::ssize` — why does C++20 bother adding a signed version?**

Both return the same value; they differ only in return type. `std::size` returns `std::size_t` (**unsigned**), `std::ssize` returns a signed type (typically `std::ptrdiff_t`). The reason for having two is the **unsigned underflow trap**:

```cpp
int empty[0];  // or a std::vector that happens to be empty
for (auto i = std::size(empty) - 1; i >= 0; --i)   // 💥 infinite loop!
    // size() is 0, then 0 - 1 on an unsigned type wraps to SIZE_MAX (~4 billion)
```

The moment you subtract from a `size_t` and the result would go below zero, it **wraps to a huge positive number** instead (see section 14.2 — "Infinite Loops"). Reverse-iteration and any `size - offset` arithmetic are the usual victims. The signed version dodges it cleanly:

```cpp
for (auto i = std::ssize(arr) - 1; i >= 0; --i)    // ✅ signed — can actually be -1
    std::cout << arr[i];
```

Mixing signed and unsigned in comparisons is also a source of subtle bugs: `int i < std::size(arr)` triggers an implicit sign conversion of `i` that compilers will warn about. Using `std::ssize` keeps everything signed and sidesteps the warnings entirely.

> ✅ **When to use which:**
> - **`std::size`** when you just need to hand the count to something that expects `size_t` (e.g., `arr + std::size(arr)` for pointer arithmetic, or STL API arguments).
> - **`std::ssize`** when you'll do arithmetic or comparisons that could cross zero — **reverse iteration**, `size - offset`, comparing an `int i` against the size, etc.
>
> Guidance from respected sources (Google style guide, Bjarne Stroustrup's C++ Core Guidelines) leans toward **preferring `std::ssize` in new code** specifically to avoid the entire family of unsigned bugs.

### 5.6 Arrays Don't Support Assignment

Unlike Python lists or `std::vector`, you **cannot** reassign a C-style array after declaration:

```cpp
int arr[3]{1, 2, 3};
arr = {4, 5, 6};   // ❌ compile error — arrays are not assignable
int other[3]{7, 8, 9};
arr = other;       // ❌ also a compile error
```

If you need to replace the contents, you have to copy element by element (or use `std::copy`):

```cpp
int src[3]{4, 5, 6};
for (int i = 0; i < 3; ++i)
    arr[i] = src[i];

// or:
#include <algorithm>
std::copy(std::begin(src), std::end(src), std::begin(arr));
```

If you genuinely need "a sequence I can reassign", use **`std::vector`** (dynamic) or **`std::array`** (fixed size, but assignable) instead.

### 5.7 Key Differences from std::array / std::vector

| Feature | C-style array | `std::array` | `std::vector` |
|---------|---------------|--------------|---------------|
| Size | Fixed, compile-time | Fixed, compile-time | Dynamic |
| Bounds checking | ❌ None | `.at()` only | `.at()` only |
| Knows its own length | ❌ (lost on decay) | ✅ `.size()` | ✅ `.size()` |
| Assignable (`arr = ...`) | ❌ | ✅ | ✅ |
| Can be passed to function safely | ❌ Decays to pointer | ✅ | ✅ |
| `auto` / CTAD supported | ❌ | ✅ | ✅ |

---

## 6. C-style Array Decay

> Corresponds to LearnCpp 17.8 — C-style array decay

### 6.1 What Is Array Decay?

When a C-style array is used in most expressions, it **implicitly converts** to a pointer to its first element. This is called **array decay**.

```cpp
int arr[5]{9, 7, 5, 3, 1};
auto ptr = arr;  // ptr is int*, pointing to arr[0]
// arr has type int[5], but ptr has type int*
```

> 💡 **Key insight:** The decayed pointer **loses the array's length information**. This is why it's called "decay" — type information is lost.

### 6.2 Why Decay Exists: Passing Arrays to Functions

Decay solves two problems:
1. **Avoids expensive copies** — only a pointer is passed, not the entire array
2. **Allows different-length arrays** — `int[5]` and `int[7]` both decay to `int*`

```cpp
void printFirst(const int* arr) {  // receives a pointer
    std::cout << arr[0];
}

int a[5]{1, 2, 3, 4, 5};
int b[3]{10, 20, 30};
printFirst(a);  // works — passes pointer to a[0]
printFirst(b);  // works — passes pointer to b[0]
```

> ⚠️ **Critical consequence:** Inside the function, you have no idea how long the array is. You must pass the length separately:

```cpp
void fill(int a[], int N) {       // int a[] is syntactic sugar for int* a
    for (int i = 0; i < N; ++i)
        a[i] = i;
}
```

### 6.3 When Arrays Don't Decay

Arrays do NOT decay when used with: `sizeof()`, `typeid()`, `operator&`, passed by reference, or as a class member.

### 6.4 Range-based for and Decay

> 📖 **Covered in Week 2 §16.4** — range-based for works on a non-decayed array (e.g., inside `main()`), but **fails** once the array has decayed to a pointer parameter. The Week 2 section also shows the index-based alternative that still works after decay. (Connection to section 7.5: range-for is just pointer arithmetic underneath — that's why it can't handle a bare pointer.)

---

## 7. Pointer Arithmetic and Subscripting

> Corresponds to LearnCpp 17.9 — Pointer arithmetic and subscripting

### 7.1 Pointer Arithmetic Basics

Pointers support four integer operators: **`+`**, **`-`**, **`++`**, **`--`**. Each moves the pointer by **objects** — not bytes:

```cpp
int arr[5]{9, 7, 5, 3, 1};
int* ptr{arr};        // points to arr[0]

ptr + 0;              // address of arr[0]
ptr + 1;              // address of arr[1] (4 bytes later, assuming 4-byte int)
ptr + 2;              // address of arr[2]
ptr - 1;              // one element BEFORE ptr (UB if outside the array!)

++ptr;                // now points to arr[1] — same as ptr = ptr + 1
--ptr;                // back to arr[0]        — same as ptr = ptr - 1
```

> 💡 **Scaling rule:** `ptr + n` advances by `n × sizeof(*ptr)` bytes. The compiler bakes the element size in — you think in elements, not bytes.

> ⚠️ **Bounds rule:** Pointer arithmetic is **only defined** when the resulting address points to a valid array element OR to the position **one past the last element** (the "one-past-end" address). Computing any address outside this range is undefined behavior — **even if you never dereference it**. "Reaching for element 100" in a 5-element array is UB, not just "something that might crash at runtime".

> ⚠️ **One-past-end is addressable, but not dereferenceable:** For a 5-element array, `&arr[5]` is a perfectly legal address to **hold** and **compare against** — but dereferencing it is UB. This asymmetry is what makes the `begin` / `end` pattern in 7.4 work.

### 7.2 Subscript = Pointer Arithmetic + Dereference

`ptr[n]` is exact **syntactic sugar** for `*(ptr + n)`:

```cpp
int arr[]{9, 7, 5, 3, 1};
const int* ptr{arr};

ptr[2];        // 5
*(ptr + 2);    // 5 — literally the same thing
&arr[2];       // address of arr[2]
arr + 2;       // same address
```

This is why arrays are **0-based**: element `n` lives at offset `n` from the start, so the compiler's address computation is simply `base + n × sizeof(element)` — no `-1` adjustment needed.

### 7.3 Relative, Not Absolute

Subscripting is **always relative to the pointer's current position**, not to the original array's start:

```cpp
int arr[]{9, 8, 7, 6, 5};
int* ptr{&arr[3]};    // points to element 3 (value 6)
ptr[0];    // 6  (arr's element 3 — "current")
ptr[1];    // 5  (arr's element 4 — "next")
ptr[-1];   // 7  (arr's element 2 — "previous")
```

> ✅ **Best practice:** Use **subscripting** (`arr[i]`) when you're indexing from the start of the array — the index lines up with the element number. Use **pointer arithmetic** (`*ptr`, `++ptr`) when you're doing relative traversal from a moving position. Mixing the two styles is a recipe for confusion.

> ⚠️ **Negative indices** like `ptr[-1]` are technically valid when `ptr` isn't at the start, but they're a footgun. Misjudge where `ptr` is and you fall straight into undefined behavior — silently.

### 7.4 Array Traversal with Pointers — The `begin` / `end` Pattern

The **idiomatic** way to walk a C-style array with pointers:

1. Point `begin` at the first element
2. Point `end` at **one past the last element**
3. Loop while `begin != end`, advancing `begin` each iteration

```cpp
#include <iostream>
#include <iterator>

int main() {
    int arr[]{9, 7, 5, 3, 1};
    const int* begin{arr};                 // first element
    const int* end{arr + std::size(arr)};  // ONE PAST the last element

    for (; begin != end; ++begin)
        std::cout << *begin << ' ';        // 9 7 5 3 1
}
```

> 💡 **Why "one past" end?** Two reasons:
> 1. **Clean loop termination:** `begin != end` works naturally — when the two pointers meet, every element has been processed.
> 2. **Empty ranges just work:** For a zero-length range, `begin == end` on the very first check, so the loop body runs zero times. No special-casing.
>
> The one-past-end address is safe to **hold** and **compare** (from 7.1's bounds rule) — you just can't dereference it.

**Why this pattern matters — functions become immune to decay:**

Instead of passing `(array, length)` separately (and hoping the caller gets the length right), you can pass a **range** of two pointers:

```cpp
void print(const int* begin, const int* end) {
    for (; begin != end; ++begin)
        std::cout << *begin << ' ';
}

int arr[]{1, 2, 3, 4, 5};
print(arr, arr + std::size(arr));  // ✅ length info lives in the pointer pair
```

The function has everything it needs — `end - begin` is the element count, and the range covers exactly what the caller specified. No array-to-pointer decay surprises.

> 💡 **Foreshadowing iterators:** The `begin` / `end` pair is the **prototype for STL iterators**. Every standard library container (`std::vector`, `std::array`, `std::map`, ...) exposes `.begin()` and `.end()` that behave just like these pointers. Every STL algorithm (`std::sort`, `std::find`, `std::copy`) takes a `(begin, end)` range. Understanding pointer traversal now makes iterators trivial to learn later.

### 7.5 Range-Based for Is Pointer Arithmetic Underneath

When you write a range-based for loop over a C-style array, the compiler expands it into essentially the `begin` / `end` loop from 7.4:

```cpp
// What you write:
int arr[]{9, 7, 5, 3, 1};
for (int x : arr) {
    std::cout << x << ' ';
}

// Roughly what the compiler generates:
int arr[]{9, 7, 5, 3, 1};
auto __begin = arr;                    // points to arr[0]
auto __end   = arr + std::size(arr);   // one-past-end
for (auto __it = __begin; __it != __end; ++__it) {
    int x = *__it;
    std::cout << x << ' ';
}
```

> 💡 **Key insight:** Range-based for is **not magic** — it's pointer arithmetic with nicer syntax. This is also the concrete reason range-based for **fails** on a decayed array (a bare pointer): the compiler can't figure out where the range ends. Section 6 told you "you can't range-for a decayed array"; now you know *why*.

---

## 8. C-style Strings

> Corresponds to LearnCpp 17.10 — C-style strings  
> Combined with lecture slides: C-style Strings, Traversing Strings

### 8.1 What Is a C-style String?

> 📖 **Covered in Week 2 §17.1–17.2** — a C-style string is a `char` array terminated by `'\0'`; the five forms of initialization (`char s[12] = "..."`, `char s2[] = "..."`, `char s3[12]`, `const char* s4 = "..."`, `char* s5`) with their safety tradeoffs; and the **physical length** (total array size) vs **logical length** (characters before `'\0'`) distinction.

### 8.2 Traversing C-style Strings

> 📖 **Covered in Week 2 §17.3** — the five iteration methods compared:
> 1. `s.size()` ❌ doesn't exist on C arrays
> 2. `strlen()` ⚠️ works but O(n) per call (avoid in loop conditions — see 8.5 below)
> 3. range-based for ⚠️ iterates the physical length, not the logical length
> 4. `s[i] != '\0'` loop ✅ correct and efficient
> 5. pointer-style `*p != '\0'` ✅ idiomatic C
>
> Methods 4 and 5 are the recommended idioms.

### 8.3 C-string Pitfalls

- **No assignment:** `str = "rope";` doesn't work on char arrays (use `strcpy`)
- **No comparison with ==:** Compares pointer addresses, not content (use `strcmp`)
- **Buffer overflow:** Writing past the array boundary is undefined behavior
- **Forgotten null terminator:** Printing without `'\0'` reads random memory

### 8.4 Input Safety: `cin >>` Can Overflow Your Buffer

Classic naive code:

```cpp
char name[10]{};
std::cin >> name;   // ⚠️ DANGEROUS
```

The problem: **`std::cin >> name` has no idea how big `name` actually is.** When `name` is passed to `operator>>`, it decays to `char*` (section 6) and all length information is lost. If the user types `"Alexander Hamilton"` (18 characters), `cin` happily writes all 18 characters plus the null terminator past the end of your 10-char buffer, **corrupting whatever happens to live in adjacent memory**.

This is a **buffer overflow** — a classic security vulnerability. Writing past a stack buffer can clobber the function's return address, letting an attacker redirect execution to code of their choice. Entire classes of real-world exploits (Morris Worm, countless CVEs) are built on exactly this bug. It is not a theoretical concern.

**The safe way — `std::cin.getline()`:**

```cpp
#include <iostream>
#include <iterator>   // for std::size

char name[10]{};
std::cin.getline(name, std::size(name));  // reads at most 9 chars + '\0'
```

`std::cin.getline(buf, max)`:
- reads up to `max - 1` characters into `buf`
- stops at newline, EOF, or when the limit is hit — whichever comes first
- always appends `'\0'`
- any excess characters are left in (or dropped from) the input stream

> ⚠️ **Rule:** Never use `std::cin >> str` with a C-style string unless you can **prove** the input will fit. Use `std::cin.getline(str, std::size(str))` instead. Or — far better — use `std::string`, which grows automatically.

### 8.5 strlen() vs std::size()

| Function | Works on decayed arrays? | Returns | Includes `'\0'`? |
|----------|------------------------|---------|-----------------|
| `std::size(arr)` | ❌ | Physical array length | Yes |
| `strlen(arr)` | ✅ | Logical string length | No |

> ⚠️ `std::strlen` is O(n) — it walks the string counting characters until it hits `'\0'`. Don't put it in a loop condition when the string doesn't change: cache the result first.

### 8.6 The `<cstring>` Function Family

All the classic C string functions live in `<cstring>`. These are what HW3's `String::strlen` and `String::strcpy` are named after:

| Function | What it does | Safety |
|----------|--------------|--------|
| `strlen(s)` | Returns length (excluding `'\0'`) | ✅ Safe, O(n) |
| `strcpy(dest, src)` | Copies `src` into `dest` | ⚠️ **No size check on `dest`** |
| `strncpy(dest, src, n)` | Copy up to `n` chars | ⚠️ **May not null-terminate** if `strlen(src) ≥ n` |
| `strcat(dest, src)` | Appends `src` to end of `dest` | ⚠️ **No size check on `dest`** |
| `strncat(dest, src, n)` | Append up to `n` chars | Safer than `strcat` |
| `strcmp(a, b)` | Returns 0 if equal; <0 or >0 otherwise | ✅ Safe |
| `strncmp(a, b, n)` | Compare at most `n` chars | ✅ Safe |
| `strstr(hay, needle)` | Find substring; returns pointer or `nullptr` | ✅ Safe |

**Comparing C-strings — don't use `==`:**

```cpp
const char* a{"hello"};
const char* b{"hello"};

if (a == b)                  { /* ... */ }  // ❌ compares POINTERS, not content
if (std::strcmp(a, b) == 0)  { /* ... */ }  // ✅ compares content
```

This is one of the most common beginner mistakes. `==` on two `char*` compares **addresses** — whether the two pointers happen to point to the same memory — not whether the characters match. Only `strcmp` walks the characters.

> ⚠️ **`strcpy` / `strcat` are footguns.** They assume the destination buffer is large enough and will silently overflow it otherwise. The `n`-variants (`strncpy`, `strncat`) give you a length cap — but `strncpy` has its own quirk: if `strlen(src) ≥ n`, it **does not** append `'\0'`, leaving your destination un-terminated. Read the docs before using. In HW3 you'll write your own `strlen` / `strcpy` that respect `MAXLEN` explicitly.

**The "safer strcpy" spectrum — four variants, four tradeoffs:**

If you look at third-party C code or documentation, you'll see four `strcpy`-family functions. They represent decades of the industry trying (and partly failing) to fix the original `strcpy`'s unsafety:

| Variant | Signature | Bounds-checked? | Guarantees `'\0'`? | Portable? |
|---------|-----------|-----------------|--------------------|-----------|
| `strcpy`    | `strcpy(dest, src)`           | ❌ No                         | ✅ Yes (if `src` is) | ✅ Everywhere (C89) |
| `strncpy`   | `strncpy(dest, src, n)`       | ⚠️ Partial — caps at `n`      | ❌ Not if `strlen(src) ≥ n` | ✅ Everywhere (C89) |
| `strlcpy`   | `strlcpy(dest, src, n)`       | ✅ Yes (writes at most `n-1` chars) | ✅ Always | ⚠️ BSD / macOS native; POSIX-2024; **glibc added it in 2.38 (2023)**; MSVC doesn't have it |
| `strcpy_s`  | `strcpy_s(dest, destsz, src)` | ✅ Yes                        | ✅ Always (or runtime error) | ⚠️ C11 Annex K (optional); **MSVC has it**; glibc does NOT |

**Quick comparison:**

- **`strcpy`** — the original. Completely ignores `dest`'s size. Unsafe; basically don't use in new code.
- **`strncpy`** — added later to provide a size cap, but with a famous flaw: if the source fills the buffer exactly, it **won't null-terminate**. Worse, if the source is shorter than `n`, it fills the remaining space with `'\0'` (pointlessly wasting time on large buffers). It's "safer than strcpy" but still a minefield.
- **`strlcpy`** — BSD's attempt at a truly safe `strcpy`. Writes at most `n - 1` characters, **always** null-terminates, and returns the length it *tried* to write (so you can detect truncation: `if (strlcpy(dest, src, n) >= n) { /* truncated */ }`). Clean design, but historically **not in glibc** — so Linux code using it was non-portable. Now finally standardized in POSIX-2024 and added to glibc 2.38 (2023), but still not universal.
- **`strcpy_s`** — Microsoft's solution, later standardized as C11 Annex K. Takes the destination buffer size as an explicit parameter and returns an error code if the buffer is too small. More "defensive" than `strlcpy`, but **Annex K is optional** and glibc's maintainers have explicitly declined to implement it — so it's effectively MSVC-only.

> 💡 **If you want a safe, portable C copy in 2026:**
> 1. On BSD / macOS / recent glibc: use **`strlcpy`**
> 2. On MSVC: use **`strcpy_s`** or **`strlcpy`** (if available)
> 3. **Best answer for portable C++:** just use **`std::string`** (next section) and stop fighting with C-strings entirely. HW3's custom `String` class is the same idea — write your own bounded copy that respects `MAXLEN`, and don't rely on any of the four above directly.

> ⚠️ **For ICS 45C specifically:** You'll be implementing your own `strcpy` in HW3 with explicit `MAXLEN` bounds-checking, which is effectively a mini `strlcpy`. The four variants above are background knowledge so you recognize them in other codebases — not something you'll call from your HW3 code.

### 8.7 Best Practice: Prefer `std::string`

> ✅ **Best practice:** Unless you have a specific reason (HW3, interop with C APIs, tight embedded systems), use **`std::string`** for mutable strings and **`std::string_view`** for read-only parameters. Avoid non-const C-style strings in new code.

Why:

- **No manual length tracking** — `std::string` knows its own size in O(1)
- **No buffer overflow** — concatenation and assignment grow the buffer automatically
- **Value semantics** — `=`, `==`, `+`, `<`, and comparison operators all just work
- **No null-terminator accidents** — the library handles termination internally
- **No decay problem** — `std::string` doesn't turn into a bare pointer when passed around

**When you *do* use C-strings:**

- HW3's custom `String` class — this is a learning exercise; use `MAXLEN` as your cap
- Calling C library APIs (`printf`, `fopen`, `strtol`, ...) — convert via `.c_str()` at the boundary
- Memory-constrained embedded devices where `std::string`'s heap allocation is too expensive

In all those cases: **always track buffer size explicitly, never trust input length, and prefer `n`-variant functions (or your own bounds-checked helpers) over the unchecked classics.**

---

## 9. Introduction to Operator Overloading

> Corresponds to LearnCpp 21.1 — Introduction to operator overloading

### 9.1 Operators Are Functions

In C++, `x + y` is really a function call: `operator+(x, y)`. The compiler has built-in versions for fundamental types. For your own classes, you can define custom versions — this is **operator overloading**.

```cpp
Mystring s1{"Hello, "};
Mystring s2{"World!"};
std::cout << s1 + s2;  // works if you overload operator+
```

### 9.2 Rules and Limitations

1. You can only overload **existing** operators (no inventing `operator**` for exponentiation)
2. At least one operand must be a **user-defined type** (your class, or a standard library class like `std::string`)
3. You **cannot change** the number of operands, the operator's **precedence**, or its **associativity**
4. These operators **cannot be overloaded at all**: `?:`, `sizeof`, `::`, `.`, `.*`, `typeid`, and the casting operators (`static_cast`, `dynamic_cast`, `reinterpret_cast`, `const_cast`)

> 💡 **"User-defined" includes standard library types:** `std::string`, `std::vector`, etc. all count — because they're not fundamental types, they satisfy the "at least one user-defined operand" rule. So `operator+(double, std::string)` would technically be legal.

> ⚠️ **…but don't overload with only standard library types.** Leave those to the library itself. Future C++ standards might define meanings for them that conflict with yours, silently breaking your code on compiler upgrade. **Always make at least one operand a type you own.**

> 💡 **Best practice:** Keep overloaded operators intuitive. If the meaning isn't obvious, use a named function instead. (The next two subsections explain why this matters.)

### 9.3 Return Value Conventions

There's an important rule that governs what your overloaded operator should return:

| Operator category | Examples | Return by | Why |
|-------------------|----------|-----------|-----|
| **Non-mutating** (computes a fresh value) | `+`, `-`, `*`, `/`, `==`, `<`, `<<` | **Value** (`String`, `bool`, ...) | Creates a brand-new result; nothing persistent to reference |
| **Mutating the left operand** | `=`, `+=`, `-=`, `++`, `--` | **Reference to the left operand** (`String&`) | Returns the object that was modified, enabling chaining |

Concrete example from HW3's `String` class:

```cpp
class String {
public:
    String  operator+ (const String& other) const;   // ✅ new result → by value
    String& operator= (const String& other);         // ✅ *this was modified → by reference
    String& operator+=(const String& other);         // ✅ *this was modified → by reference
    bool    operator==(const String& other) const;   // ✅ fresh bool → by value
};
```

**Why `operator=` returns `String&` instead of `void` or `String`:** to enable **chaining**.

```cpp
String a, b, c;
a = b = c;   // parses right-to-left as a = (b = c);
             // (b = c) must return something that a can then be assigned from
```

- Return `void` → chained assignment doesn't compile at all
- Return by value → works, but every link in the chain costs an extra copy
- **Return by reference → correct AND efficient**

The same logic applies to `operator<<`: it returns `std::ostream&` so you can chain `cout << x << y << z` (see Week 2 §18.3 for the full treatment).

> 💡 **Rule of thumb:** Ask yourself — "**Does this operator change `*this`?**" If yes → return `Type&`. If no → return `Type` (or `bool`, etc.) by value.

### 9.4 Semantic Intent: The `^` Exponentiation Trap

Why must overloaded operators feel like their natural built-in meaning? Here's a famous cautionary example from LearnCpp:

> "C++ doesn't have an exponentiation operator. I'll overload `^` for it — `2 ^ 3` will mean `8`."

Sounds reasonable… until someone writes this:

```cpp
int result = 4 + 3 ^ 2;
```

**What the author probably meant** (assuming math precedence — exponentiation binds tighter than addition):

$$4 + (3 ^{2}) = 4 + 9 = 13$$

**What C++ actually computes:** `^` in C++ is **bitwise XOR**, which has **lower** precedence than `+`. So the expression parses as:

```cpp
(4 + 3) ^ 2   // = 7 ^ 2 = 5
```

And you **cannot change this** — operator precedence is baked into the language grammar, not into the operator function you define. Even after your custom `^` does the right math, the **surrounding expression still parses with XOR's precedence**. Every reader of your code has to mentally override their precedence expectations or write bug-ridden code.

> ✅ **Best practice (restated):** Overload an operator only when its **natural built-in meaning** carries over to your type.
>
> - `+` for concatenating two strings? **Fine** — natural analog (merge two sequences).
> - `<<` for "print this object to a stream"? **Fine** — already the conventional meaning.
> - `-` for removing characters from a string? **Terrible** — no natural analog, no obvious semantics; use a named `.erase()` method instead.
> - `^` for exponentiation? **Terrible** — fights the language's precedence rules; use a named `pow()` function.

---

## 10. Overloading the I/O Operators

> 📖 **Moved to Week 2 §18.** The full treatment of `operator<<` overloading — why it **must be a non-member function**, the `ostream& operator<<(ostream& out, const Complex& c)` signature, why you return `ostream&` for chaining, the parallel `operator>>`, and the **`friend` declaration alternative** — all lives in **Week 2 §18 "Overloading `operator<<` and the Reference Parameter Pattern"**.
>
> This section's concepts (return-by-reference conventions) connect back to **§9.3 above** — the same "return `Type&` for chaining" rule that `operator=` follows.

---

## 11. Overloading Operators Using Member Functions

> Corresponds to LearnCpp 21.5 — Overloading operators using member functions

### 11.1 Friend vs Member Overload

**Friend/non-member version:**

```cpp
// Two explicit parameters
Cents operator+(const Cents& cents, int value) {
    return Cents(cents.m_cents + value);
}
// Usage: cents1 + 2 → operator+(cents1, 2)
```

**Member function version:**

```cpp
class Cents {
public:
    Cents operator+(int value) const {  // only one parameter — left operand is *this
        return Cents{m_cents + value};
    }
};
// Usage: cents1 + 2 → cents1.operator+(2)
```

### 11.2 When to Use Which

| Situation | Preferred form |
|-----------|---------------|
| `=`, `[]`, `()`, `->` | **Must** be member |
| Unary operators (`++`, `--`, `!`) | Member |
| Binary, doesn't modify left operand (`+`, `-`) | Friend/non-member |
| Binary, modifies left operand (`+=`, `-=`) | Member (preferred) |
| `<<`, `>>` | **Must** be non-member (left operand is `ostream`/`istream`) |

---

## 11B. Object Lifetime Walkthrough — Lecture Supplement

> From lecture slides: Classes p9 — "What happens here?"  
> ⚠️ This is an exam favorite. Trace through carefully.

### 11B.1 The Code

```cpp
#include "Complex.hpp"

int main() {
    Complex c1(1.5, 5.3);      /// (1) c1 is constructed
    Complex c2(2.5, 2.7);      /// (2) c2 is constructed
    c1.print(cout);
    c2.print(cout);
    {
        Complex result;         /// (3) result is default-constructed (0.0, 0.0)
        result.print(cout);
        result = c1.add(c2);   /// (4) A LOT happens here! (see below)
        result.print(cout);
    }                           /// (5) result goes out of scope → destructor called
    c1 = Complex(2.0, 3.0);    /// (6) temporary constructed, assigned to c1, temporary destroyed
    c1.print(cout);
    return 0;
}                               /// (7) c2 destroyed, then c1 destroyed (reverse order)
```

### 11B.2 Detailed Breakdown of Line (4): `result = c1.add(c2)`

This single line triggers **many** operations:

1. `c2` is **copied** into parameter `c` of `add()` (pass by value → copy constructor)
2. Inside `add()`: `Complex(re + c.re, im + c.im)` — a **temporary** Complex is constructed
3. The temporary is **returned** (may involve copy/move, though compiler often optimizes this away via RVO)
4. The returned value is **assigned** to `result` via `operator=` (copy assignment)
5. The temporary from the return is **destroyed** (destructor called)
6. The copy of `c` (parameter) is **destroyed** (destructor called)

> 💡 **Key insight:** A simple-looking line like `result = c1.add(c2)` can trigger 2+ constructors, 1 assignment, and 2+ destructors. This is why understanding object lifetime is critical.

### 11B.3 Destruction Order

Objects are destroyed in **reverse order** of construction:

```
Construction order: c1, c2, result
Destruction order:  result (end of inner scope), c2, c1 (end of main)
```

> ⚠️ **Exam tip:** When asked "what happens here?", list every constructor, destructor, and assignment call in order. Don't forget temporaries!

### 11B.4 Line (6): `c1 = Complex(2.0, 3.0)`

1. `Complex(2.0, 3.0)` — **temporary** object constructed (a "literal Complex")
2. `c1 = ...` — copy assignment operator called on `c1`
3. Temporary is **destroyed** immediately after the statement

---

## 12. Basic File I/O

> Corresponds to LearnCpp 28.6 — Basic file I/O  
> Combined with lecture slides: Process each word in a file, Copy a file

### 12.1 The Three File Stream Classes

All live in `<fstream>`:

| Class | Purpose | Default mode |
|-------|---------|-------------|
| `ifstream` | Read from file | `ios::in` |
| `ofstream` | Write to file | `ios::out` |
| `fstream` | Read and write | `ios::in \| ios::out` |

### 12.2 Basic Usage

```cpp
#include <fstream>
#include <iostream>
#include <string>

int main() {
    // Writing
    std::ofstream out{"output.txt"};   // opens for writing (default mode — erases existing content!)
    out << "Hello\n";
    // no out.close() needed — destructor closes automatically at end of scope

    // Reading line by line (preferred for text files)
    std::ifstream in{"input.txt"};
    std::string line;
    while (std::getline(in, line))
        std::cout << line << '\n';
}
```

> 💡 **RAII auto-close:** You don't strictly need to call `.close()`. When the `ifstream` / `ofstream` variable goes out of scope, its destructor closes the file automatically. This is **RAII** (Resource Acquisition Is Initialization) — the lifetime of the stream object manages the lifetime of the open file. Explicit `close()` is only needed when you want to reopen the variable with a different file or mode (see 12.3), or when you need to force-flush before calling `std::exit()` (see 12.5).

**`>>` vs `std::getline()` — pick the right reader:**

```cpp
while (in >> word)             { /* ... */ }  // reads ONE WORD at a time (stops at whitespace)
while (std::getline(in, line)) { /* ... */ }  // reads ONE LINE at a time (stops at '\n')
```

`operator>>` breaks on **any whitespace** (spaces, tabs, newlines), so reading a file containing `"Hello World\nGoodbye"` gives you three separate tokens `"Hello"`, `"World"`, `"Goodbye"` — not lines. For most text-file work, that's not what you want.

- Use **`getline`** when you want whole lines.
- Use **`>>`** when you want tokenized input (numbers, space-separated words, etc.) and you're OK with losing the line structure.

### 12.3 File Modes

A **file mode** is a flag that controls how a file is opened. You pass it as the second argument to the constructor (or to `open()`):

```cpp
std::ofstream out{"log.txt", std::ios::app};  // append mode — don't overwrite existing content
```

The full list of mode flags (all live in the `std::ios` namespace):

| Mode | Meaning |
|------|---------|
| `std::ios::app`    | Append — every write goes to the end of the file; existing content preserved |
| `std::ios::ate`    | "At end" — seek to end of file **once** on open; subsequent writes can go anywhere |
| `std::ios::binary` | Binary mode — no text translation (e.g., no `\r\n` ↔ `\n` conversion on Windows) |
| `std::ios::in`     | Open for reading (**default for `ifstream`**) |
| `std::ios::out`    | Open for writing (**default for `ofstream`**) |
| `std::ios::trunc`  | Erase the file if it already exists (**implied by `ofstream`** when `out` is set) |

> ⚠️ **`app` vs `ate` — don't confuse them:**
> - **`app`** forces **every** write to go to the end of the file (even if you `seekp` elsewhere first).
> - **`ate`** seeks to the end **once**, when the file is opened — subsequent writes can go anywhere.

**Combining modes with `|`:** The bitwise OR operator stacks multiple flags into one argument:

```cpp
std::fstream f{"data.bin", std::ios::in | std::ios::out | std::ios::binary};
// read + write + binary mode, all at once
```

This is exactly how `fstream`'s default (`std::ios::in | std::ios::out`) is specified under the hood. Each flag is a separate bit; `|` combines them.

**Reopening a stream — `open()` / `close()`:**

A single stream variable can be closed and reopened with a different file or mode:

```cpp
std::ofstream out{"log.txt"};              // opens in default write mode (truncates)
out << "First session\n";
out.close();                                // close this file

out.open("log.txt", std::ios::app);        // reopen in append mode
out << "Second session\n";                  // doesn't overwrite the first session
// destructor closes automatically at scope end
```

Useful when you want to change the mode mid-program without declaring a new stream variable.

### 12.4 Error Checking

```cpp
std::ifstream in{"nonexistent.txt"};
if (!in) {
    std::cerr << "Could not open file!\n";
    return 1;
}
```

The stream object converts to `false` if opening failed — so `if (!in)` or `if (!in.is_open())` both work. Do this **every time** you open a file; silent failures are one of the most painful debugging experiences in file I/O code.

### 12.5 Buffering, Flushing, and When to Close

File output is **buffered**: `out << "hello";` typically doesn't hit the disk immediately. Characters accumulate in a memory buffer, and the buffer is written out only when one of the following happens:

1. **The buffer fills up** (automatic, size-driven)
2. **The stream is closed** — explicitly via `close()`, or implicitly when the object is destroyed
3. **You explicitly flush** via `out.flush()` or `out << std::flush`
4. **You write `std::endl`** — which writes `'\n'` **AND** flushes

> ⚠️ **The crash / `exit()` trap:** If your program crashes or calls `std::exit()` (or `std::abort()`) **before** the stream's destructor runs, **buffered data is lost** — the file on disk won't contain your last few writes. For critical writes (logs, checkpoints), call `out.flush()` after each write, or explicitly `close()` the stream before exiting.

> ⚠️ **`std::endl` is slow — prefer `'\n'` for newlines:** `std::endl` forces a buffer flush **every time**. In a loop that writes thousands of lines, that's thousands of disk syncs — often **10–100× slower** than necessary.

```cpp
for (int i{0}; i < 1'000'000; ++i)
    out << "line " << i << '\n';        // ✅ fast — one flush at close

for (int i{0}; i < 1'000'000; ++i)
    out << "line " << i << std::endl;   // ❌ flushes 1,000,000 times
```

Use `'\n'` for normal line endings. Reserve `std::endl` / `out.flush()` for the rare case you genuinely need to force a flush right now.

---

## 13. Code Coverage (Testing)

> Corresponds to LearnCpp 9.2 — Code coverage

### 13.1 What Is Code Coverage?

**Code coverage** describes how much of your source code is executed while testing. There are several useful metrics.

### 13.2 Statement Coverage

**Statement coverage** = percentage of statements exercised by tests.

```cpp
int foo(int x, int y) {
    int z{y};
    if (x > y) {
        z = x;
    }
    return z;
}
```

`foo(1, 0)` gives 100% statement coverage — every statement executes. But this alone isn't enough.

### 13.3 Branch Coverage

**Branch coverage** = percentage of branches executed. Every `if` has two branches (true and false), even without an `else`.

`foo(1, 0)` only tests the `x > y` true branch → 50% branch coverage. You also need `foo(0, 1)` to test the false branch.

For a `switch` statement:

```cpp
bool isLowerVowel(char c) {
    switch (c) {
        case 'a': case 'e': case 'i': case 'o': case 'u':
            return true;   // branch 1
        default:
            return false;  // branch 2
    }
}
```

Two calls needed: `isLowerVowel('a')` + `isLowerVowel('q')`. Multiple cases feeding into the same body don't need separate tests.

For chained if/else:

```cpp
void compare(int x, int y) {
    if (x > y)       std::cout << x << " is greater than " << y;
    else if (x < y)  std::cout << x << " is less than " << y;
    else              std::cout << x << " is equal to " << y;
}
```

3 calls needed: `compare(1,0)`, `compare(0,1)`, `compare(0,0)`.

> 💡 **Best practice:** Aim for 100% branch coverage of your code.

### 13.4 Loop Coverage (0, 1, 2 Test)

If you have a loop, test with **0 iterations, 1 iteration, and 2 iterations**. If it works for 2, it should work for all n > 2.

```cpp
void spam(int timesToPrint) {
    for (int count{0}; count < timesToPrint; ++count)
        std::cout << "Spam! ";
}
// Test: spam(0), spam(1), spam(2)
```

> 💡 **Best practice:** Use the 0, 1, 2 test to ensure your loops work correctly.

### 13.5 Testing Different Categories of Input

Don't just test normal values — think about **categories**:

| Type | Categories to test |
|------|-------------------|
| Integers | Negative, zero, positive; overflow if relevant |
| Floating point | Values with precision issues: `0.1`, `-0.1`, `0.7`, `-0.7` |
| Strings | Empty, alphanumeric, whitespace (leading/trailing/inner), all whitespace |
| Pointers | `nullptr` (covered later) |

> 💡 **Best practice:** Test different categories of input values to make sure your unit handles them properly.

### 13.6 Coverage Is Necessary, Not Sufficient

100% branch coverage is a **floor**, not a ceiling. Even perfectly-covered code can still have bugs your test suite never catches:

- **Data-dependent bugs:** Both branches of `if (x + y > limit)` execute, but only with values that happen to work. In production, a specific combination triggers integer overflow and your tests never saw it.
- **Off-by-one errors:** The loop branch executes, but it iterates once too many or once too few. Coverage doesn't check loop counts.
- **Boundary values you forgot to try:** Empty input, maximum-size input, exactly-at-the-threshold input, `0`, `INT_MAX`, `nullptr`, `""`. Coverage tells you what ran, not which inputs you considered.
- **Interactions between branches:** Two separate `if` statements each tested in isolation can combine in ways that break — especially when they share mutable state.
- **Missing requirements:** If the spec says "handle negative input" and you forgot to write that branch, covering the branches you *did* write is irrelevant.

**The correct mental model:**

```
coverage tells you "what code ran"
correctness tells you "whether that code produced the right answer for every meaningful input"
```

These are different things. Coverage is a **necessary** condition — if a line never runs during testing, you're flying blind about it. But coverage is not **sufficient** — running a line once doesn't prove it works for every input that matters.

> ⚠️ **Common beginner trap:** "My tests pass and I have 100% coverage, therefore the code is correct." This is false, and it's one of the most widespread testing misconceptions. Reach 100% branch coverage as a **starting point**, then ask "What input would break this?" and add tests for those cases specifically. The input-category table in 13.5 is a good prompt list, but it's not exhaustive.

> 💡 **Practical workflow:**
> 1. Write tests until you hit 100% branch coverage (satisfies 13.3's best practice)
> 2. Add the 0-1-2 loop tests from 13.4
> 3. Walk through the input categories from 13.5 for every parameter
> 4. Ask yourself: "What does the *specification* say should happen that I haven't tested?"
> 5. Ask yourself: "What's the weirdest / smallest / largest / most-adversarial input a real user might give?"
>
> Steps 1–3 are mechanical. Steps 4–5 are where the real bugs get caught.

---

## 14. Common Semantic Errors in C++

> Corresponds to LearnCpp 9.3 — Common semantic errors in C++

### 14.1 Conditional Logic Errors

Using the wrong comparison operator:

```cpp
if (x >= 5)   // oops — should be x > 5
    std::cout << x << " is greater than 5";
```

Or in a loop:

```cpp
for (int count{1}; count > 5; ++count) { ... }  // should be < 5; body never runs
```

### 14.2 Infinite Loops

```cpp
int count{1};
while (count <= 10) {
    std::cout << count << ' ';
    // forgot ++count; → infinite loop!
}
```

**Unsigned integer trap:**

```cpp
for (unsigned int count{5}; count >= 0; --count) { ... }
// unsigned int can never be < 0 — wraps to 4294967295 → infinite loop!
```

> 💡 **Teachers love this one:** The unsigned-underflow infinite loop is a classic quiz question. Any time you see `unsigned` combined with `>= 0`, you have an infinite loop. Use a signed `int` for loop counters that might go negative, or use `std::ssize` (see section 5.5) when iterating backwards through a container.

### 14.3 Off-by-One Errors

Using `<` when you need `<=`, or vice versa. Extremely common in loop bounds:

```cpp
for (int count{1}; count < 5; ++count)
    std::cout << count << ' ';
// prints: 1 2 3 4      ← wanted 1 2 3 4 5
```

The classic fix is `count <= 5`, but the underlying question is always "do I want the endpoint included or excluded?" Figure this out **before** writing the loop — squinting at the condition afterwards is error-prone.

### 14.4 Operator Precedence Traps

C++ has a long operator precedence table, and some of its entries surprise people. The classic example:

```cpp
int x{0}, y{3};

if (!x > y)
    std::cout << "A\n";      // does NOT print (surprising!)

if (!(x > y))
    std::cout << "B\n";      // prints (as intended)
```

**Why?** `!` (unary logical NOT) has **higher precedence** than `>` (relational), so `!x > y` parses as `(!x) > y`:

- `!x` is `!0` which is `true` (i.e., `1`)
- `1 > 3` is `false`
- So the first `if` skips its body

The second form uses explicit parentheses to force the grouping you actually meant: `!(x > y)` is `!(0 > 3)` = `!false` = `true` ✓

> ✅ **Rule of thumb:** When mixing `!`, `&&`, `||` with comparison operators, **always parenthesize explicitly**. C++'s logical-operator precedence rules are notoriously counterintuitive.
>
> Related trap: `&&` binds tighter than `||`, so `a || b && c` parses as `a || (b && c)`, not `(a || b) && c`.

### 14.5 Floating-Point Equality Traps

**Never use `==` to compare floating-point values.** Tiny rounding errors accumulate during arithmetic, so two values you'd swear are "obviously equal" often aren't:

```cpp
double sum{0.0};
for (int i{0}; i < 10; ++i)
    sum += 0.1;

if (sum == 1.0)
    std::cout << "exactly 1\n";
else
    std::cout << "NOT exactly 1 — got " << sum << '\n';

// Output: NOT exactly 1 — got 0.9999999999999999
```

`0.1` **cannot be represented exactly** in binary floating-point — and neither can `0.2`, `0.3`, and many others. Every `sum += 0.1` picks up a tiny rounding error, and after ten additions the accumulated error is visible.

**The correct approach** — compare against an epsilon tolerance:

```cpp
#include <cmath>

if (std::abs(sum - 1.0) < 1e-9)
    std::cout << "approximately 1\n";
```

For extremely large or small values, relative error is more robust. But for typical ICS 45C code, absolute epsilon is enough.

> ⚠️ **Rule:** Use `==` for integers, characters, and pointers. Use epsilon comparison (`std::abs(a - b) < eps`) for `float` / `double`. **No exceptions — this rule applies even for "obviously exact" values like `0.5` or `1.0`.**

### 14.6 Integer Division Truncation

When both operands of `/` are integers, C++ performs **integer division** — the fractional part is thrown away:

```cpp
int x{7}, y{2};
std::cout << x / y << '\n';       // prints 3, not 3.5
double result = x / y;             // ⚠️ still 3.0 — the division happened BEFORE the assignment
```

The fix is to make at least one operand floating-point, which triggers floating-point division:

```cpp
double r1 = static_cast<double>(x) / y;     // ✅ 3.5
double r2 = x / static_cast<double>(y);     // ✅ 3.5
double r3 = x * 1.0 / y;                    // ✅ 3.5 (older idiom)
```

> ⚠️ **Common trap:** `double avg = total / count;` where `total` and `count` are both `int`. The division truncates **before** the `double` conversion happens — cast at least one operand first.

### 14.7 Accidental Semicolons and Missing Braces

**Stray semicolon — null statement after `if`:**

```cpp
if (c == 'y');         // ⚠️ the ; ends the if — empty body
    blowUpWorld();     // ← runs UNCONDITIONALLY, not inside the if
```

The `;` creates an empty statement, which the compiler treats as the if's body. The next line is no longer controlled by the condition. Same trap applies to `while (...);` and `for (...);`.

**Missing braces — what looks indented isn't actually inside:**

```cpp
if (c == 'y')
    std::cout << "Are you sure?\n";
    blowUpWorld();     // ← ALSO runs unconditionally!
```

An `if` without braces only controls the **single next statement**. Indentation has **no meaning to the compiler** — only to the reader. The second line runs regardless of `c`.

> ✅ **Best practice:** **Always use braces** for `if`, `while`, `for` bodies, even for a single statement. Two characters of typing prevents this entire class of bug. Google's, LLVM's, and most other major C++ style guides mandate this.

### 14.8 Assignment vs Equality in Conditions

C++'s single most common typo:

```cpp
char c;
std::cin >> c;

if (c = 'y')              // ⚠️ assignment, not comparison!
    blowUpWorld();
```

`c = 'y'` is an **assignment expression** — it assigns `'y'` to `c` and then **evaluates to the assigned value `'y'`**. The if condition converts `'y'` (non-zero) to `true`, so the body runs **no matter what the user typed**.

**The fix is one extra `=`:** `if (c == 'y')`.

> 💡 **Most modern compilers warn about this** — enable `-Wall` (GCC / Clang) and you'll get "suggest parentheses around assignment used as truth value". **Read your warnings.**

> 💡 **Yoda conditions** — some codebases write `if ('y' == c)`. If you accidentally type only one `=`, then `'y' = c` is a **compile error** (can't assign to a literal), catching the bug immediately. It's a stylistic choice, but a useful defensive pattern.

### 14.9 Forgetting the Function Call `()`

A subtle trap — writing a function name **without calling it**:

```cpp
int getValue() { return 5; }

int main() {
    std::cout << getValue << '\n';    // ⚠️ no ()! probably prints "1"
    std::cout << getValue() << '\n';  // ✅ prints 5
}
```

Without `()`, `getValue` isn't **called** — instead, it evaluates to the function's **address** (a function pointer). The stream's `<<` converts the pointer to `bool` (always `true`, because a valid function's address isn't zero) and prints it as `1`.

On some compilers you'll see the hex address printed instead. Either way, you're not getting the return value, and nothing warns you.

> ⚠️ **Symptom:** Your program prints `1` everywhere you expected to see a function's output. The fix is almost always a missing `()`.

### 14.10 Other Quick-Hit Errors

- **Uninitialized variables** — `int x;` contains garbage. Always value-initialize: `int x{};`, or give it a meaningful value.
- **Narrowing conversions** — `int x = 3.7;` silently truncates to `3`; `int x{3.7};` is a compile error (good!). Prefer `{}` initialization to catch these.
- **Shadowing** — declaring a local variable with the same name as an outer one. Compiles fine, behaves surprisingly. Enable `-Wshadow` to catch it.

---

## 15. Detecting and Handling Errors

> Corresponds to LearnCpp 9.4 — Detecting and handling errors

### 15.1 Three Places Assumptions Fail

Most bugs come from **faulty assumptions**. The three most common places assumptions break:

1. **Function return values** — assuming a called function succeeded when it didn't
2. **Input** — assuming user input, file input, or network input has the correct format and semantics
3. **Arguments** — assuming your caller passed valid arguments to your function

Defensive programming — writing code that survives these assumption failures — means **checking each category explicitly** rather than trusting it.

### 15.2 Four Error-Handling Strategies (Overview)

When a function detects an error, it has four choices for what to do next:

| Strategy | When to use |
|----------|------------|
| **1. Handle within the function** | Error is recoverable locally (retry, fall back to a default, cancel operation) |
| **2. Pass the error back to the caller** | Caller is in a better position to decide (return `bool`, sentinel, or `std::optional`) |
| **3. Halt the program** | Error is **fatal / non-recoverable** — continuing would produce garbage or corrupt data |
| **4. Throw an exception** | Complex propagation across many call-stack levels (full mechanism in later course / LearnCpp ch. 27) |

Sections 15.3–15.6 expand each strategy.

### 15.3 Strategy 1: Handle Within the Function

If the function can recover locally, handle the error right where it's detected. Two common patterns:

**A) Retry until successful** — typical for user input:

```cpp
#include <iostream>
#include <limits>

int readPositiveInt() {
    while (true) {
        int x{};
        std::cin >> x;
        if (std::cin && x > 0) return x;

        std::cin.clear();                                              // clear the error flags
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "Please enter a positive integer: ";
    }
}
```

**B) Ignore or cancel, with a warning** — when "don't do the bad thing" is acceptable:

```cpp
void printIntDivision(int x, int y) {
    if (y == 0) {
        std::cerr << "Error: division by zero\n";
        return;                          // cancel the operation
    }
    std::cout << x / y;
}
```

> ⚠️ **The hidden downside:** If the caller depends on a return value or side effect, "silently cancelling" leaves the caller thinking the operation succeeded. This strategy only works when the caller **can't tell the difference** — typically `void`-returning functions whose job is a side effect.

### 15.4 Strategy 2: Return the Error to the Caller

When the function can't decide what to do about the error locally, push it up to the caller. Three sub-approaches:

**A) Change the return type to `bool`** (success/fail):

```cpp
bool printIntDivision(int x, int y) {
    if (y == 0) {
        std::cerr << "Error: could not divide by zero\n";
        return false;
    }
    std::cout << x / y;
    return true;
}

if (!printIntDivision(a, b)) {
    // handle the failure in the caller
}
```

**B) Sentinel value** — a special return value that means "error":

```cpp
constexpr double no_reciprocal{0.0};      // 0.0 can never be a legitimate reciprocal

double reciprocal(double x) {
    if (x == 0.0) return no_reciprocal;   // error sentinel
    return 1.0 / x;
}
```

A **sentinel value** is a value with special meaning in the context of a particular function. Here, `0.0` works as the error marker because `1/x` can never equal `0.0` for any real `x` — so the caller can unambiguously check "did I get the sentinel back?"

> ⚠️ **Sentinel values only work when you have an "unused" value in the return type.** For a function like `int square(int x)`, every `int` is a valid return value — there's **no sentinel available**. In those cases, use approach C.

**C) `std::optional<T>`** (C++17) — explicit "value or nothing":

```cpp
#include <optional>

std::optional<int> parseInt(const std::string& s) {
    // ... parsing logic ...
    if (invalid) return std::nullopt;      // "no value"
    return parsed_value;                    // actual value
}

auto result = parseInt(input);
if (result)
    std::cout << "got " << *result;         // dereference to access
else
    std::cout << "parse failed";
```

`std::optional` is the **modern, type-safe** way to say "this function might have no meaningful result". It works even when every value of the return type is potentially valid — no need to steal a sentinel out of the value space.

### 15.5 Strategy 3: Halt the Program

Some errors are **non-recoverable** (a.k.a. **fatal errors**) — the program's state is so broken that continuing would produce garbage or corrupt data. In those cases, halt immediately.

```cpp
#include <cstdlib>

double doIntDivision(int x, int y) {
    if (y == 0) {
        std::cerr << "Fatal: divide by zero in doIntDivision\n";
        std::exit(1);                       // terminate with non-zero status
    }
    return static_cast<double>(x) / y;
}
```

**The halt options:**

| Function | Behavior | When to use |
|----------|----------|-------------|
| `return 1;` from `main()` | Normal exit with error status | Error detected in `main()` itself (or a direct callee you can return to) |
| `std::exit(code)` | Immediate termination — **runs** static destructors and `atexit` handlers | Deep inside the call stack, but a clean shutdown is still possible |
| `std::abort()` | Immediate abnormal termination — **skips** cleanup, may dump core | The bug implies memory / state is corrupted; running destructors might itself be dangerous |
| `assert(cond)` | `abort()` if `cond` is false — **compiled out** in release builds (`NDEBUG`) | Sanity-check invariants during development; a failed `assert` indicates a programmer bug, not bad input |

> 💡 **Rule of thumb:** Halting is a blunt instrument. Use it only for **truly non-recoverable** situations — not "I don't feel like writing the error path". If the caller could reasonably handle the error, prefer Strategy 2.

### 15.6 Strategy 4: Throw an Exception

C++ has a full exception mechanism (`throw` / `try` / `catch`) that propagates errors **up the call stack automatically** until someone catches them. This decouples error detection from error handling across many function layers:

```cpp
#include <stdexcept>

double divide(int x, int y) {
    if (y == 0)
        throw std::runtime_error{"divide by zero"};
    return static_cast<double>(x) / y;
}

try {
    auto r = divide(a, b);
    std::cout << r;
} catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << '\n';
}
```

Exceptions are covered in detail in LearnCpp chapter 27 and later in the ICS 45C sequence. For Week 3, you just need to know they exist as the fourth strategy — you won't be asked to write `try` / `catch` yet.

### 15.7 Where to Print Errors — `std::cout` vs `std::cerr`

C++ gives you two output streams, and **they're not interchangeable**:

- **`std::cout`** — standard output, for normal program output and user-facing results
- **`std::cerr`** — standard error, for error messages and diagnostics

**Why the split?** On any Unix-like OS (and Windows), you can **redirect them separately** at the shell:

```bash
./myprog > output.log 2> error.log    # cout → output.log, cerr → error.log
./myprog 2>/dev/null                   # discard errors, keep normal output
./myprog | grep something              # pipe only cout; cerr still reaches the terminal
```

If you send errors to `cout`, they get mixed in with your normal output and can't be filtered out afterwards. Sending them to `cerr` keeps the streams separate — the user can capture them independently.

**Guidelines:**

| Kind of output | Where it goes |
|---------------|---------------|
| Normal program results | `std::cout` |
| "Please enter a positive integer" in an interactive program | `std::cout` (users see it in the normal flow) |
| Diagnostic / warning / internal error messages | `std::cerr` |
| Progress indicators, percent-complete, log-like output | `std::cerr` (so they don't pollute piped output) |
| Errors from non-interactive tools (CLI utilities) | `std::cerr` |

> 💡 **`std::cerr` is unbuffered by default** — error messages appear immediately, even if the program crashes a moment later. That's another reason to use it for errors: you won't lose the last few messages to a buffer that never flushed (see section 12.5).

### 15.8 Happy Path and Sad Path Testing

**Defensive programming** = the practice of anticipating how code can be misused — by users, by other developers, or by your future self — and writing it to survive.

Every function has two conceptual execution paths:

- **Happy path**: the code path when everything is valid and nothing unusual happens. Easy to test; most new programmers stop here.
- **Sad path**: the code path when something goes wrong — invalid input, bad arguments, a failed call, unexpected state. **This is where the real bugs hide.**

```cpp
void printDivision(int x, int y) {
    // happy path
    if (y != 0) {
        std::cout << x / y;
        return;
    }
    // sad path — don't forget to test this!
    std::cerr << "Error: division by zero\n";
}
```

> ✅ **Best practice:** For every function you write, explicitly ask "**what's the sad path?**" and add a test case for it. If the answer is "this function has no sad path", you're probably missing something — most functions can be called with invalid arguments, receive bad input, or have their dependencies fail.

This ties directly back to section 13.5 (test different categories of input) and 13.6 (coverage is necessary, not sufficient): coverage of the happy path alone **does not** tell you whether the sad path is correct.

---

## 16. Custom String Class — Lecture Supplement

> From lecture slides: Strings (String.hpp, helper functions, TDD development process)

### 16.1 Class String Architecture

The course's custom `String` class uses a fixed-size `char` buffer internally:

```cpp
class String {
    static constexpr int MAXLEN = 256;
    char buf[MAXLEN];
public:
    explicit String(const char* s = "");  // constructor from C-string
    String(const String& s);              // copy constructor
    String& operator=(const String& s);   // copy assignment
    // ... other methods
};
```

### 16.2 Copy Constructor and Copy Assignment (The Rule of Three)

The `String` class declares two special member functions that we've seen referenced but never defined — the **copy constructor** and the **copy assignment operator**. Together with the destructor, they're called the **Rule of Three**: if your class needs to customize any one of them, it almost always needs all three.

| Special function | Signature | Called when... |
|------------------|-----------|----------------|
| **Destructor** | `~String()` | object goes out of scope or is explicitly destroyed |
| **Copy constructor** | `String(const String& other)` | a **new** `String` is being initialized from an existing one |
| **Copy assignment** | `String& operator=(const String& other)` | an **already-constructed** `String` is reassigned from another |

**Which one runs?** The distinction is whether `*this` already exists or is being created right now:

```cpp
String a{"Hello"};
String b{a};         // ← copy constructor:  b is BEING CREATED from a
String c;            // default constructor: c now exists, empty
c = a;               // ← copy assignment:   c already exists, now overwritten from a
```

A common beginner confusion: `String b = a;` **also** calls the copy constructor, not the assignment operator — because `b` is being initialized, not reassigned. The `=` here is **initialization syntax**, not assignment.

**Copy constructor — builds `*this` from a source:**

```cpp
String::String(const String& other) {
    strcpy(buf, other.buf);  // copy source's buffer into our own
}
```

Notice it takes `const String&`:
- **`&`** so we don't infinitely recurse (passing by value would itself need a copy constructor to construct the parameter... which needs another copy constructor... stack overflow)
- **`const`** so we promise not to modify the source

**Copy assignment — replaces `*this`'s contents from a source, safely:**

```cpp
String& String::operator=(const String& other) {
    if (this == &other) return *this;   // guard against self-assignment (a = a)
    strcpy(buf, other.buf);             // replace our contents with other's
    return *this;                        // return *this by reference for chaining
}
```

Three key points:

1. **Self-assignment guard (`this == &other`):** Protects against `a = a`. For a simple class with a fixed `char` buffer this is harmless, but for classes that free old memory before assigning new memory, self-assignment without the guard would free the source data before copying it — a disaster. Build the habit now.

2. **Return `*this` by reference:** Lets you chain assignments like `a = b = c;`. If you returned by value or `void`, chaining breaks.

3. **Existing contents:** Unlike the copy constructor, `*this` **already holds data** when assignment runs. In a class that manages pointers or file handles, you'd need to release the old resource before taking on the new one. For `String` with a fixed buffer, `strcpy` just overwrites — no cleanup needed.

> 💡 **Why "Rule of Three"?** If your class needs custom behavior for **any** of {destructor, copy constructor, copy assignment}, it almost always needs custom behavior for **all three** — because all three touch the resource-management logic. The compiler generates trivial defaults for each; the moment one of them becomes non-trivial, the others usually do too.

> ⚠️ **Reality check for `String` with fixed `char buf[MAXLEN]`:** The compiler-generated defaults would actually work for this class — `buf` is part of the object, so default member-wise copy produces the right result. HW3 asks you to implement them **explicitly anyway** — partly for practice, partly to make copy semantics visible in code, and partly so that you understand what's happening when you later work with classes that *do* manage dynamic memory (Week 4 and beyond).

### 16.3 Static Helper Functions vs Public Methods

| Static helpers | Public methods |
|---------------|---------------|
| General-purpose (e.g., `strlen`, `strcpy`) | Have a `this` object |
| Know nothing about `MAXLEN` | Do error checking (size limits) |
| No error checking | Call helpers to do their work |
| Contain lower-level loops | Higher-level interface |
| Reusable across HW3 and HW4 | Specific to `String` class |

### 16.4 strlen() and strcpy() — Core Helper Implementations

These are the foundational helpers that almost every public method depends on. From lecture slides (Strings p6):

```cpp
// Returns the logical length of a C-string (excludes '\0')
int strlen(const char src[]) {
    int len = 0;
    while (src[len] != '\0')
        ++len;
    return len;
}
```

```cpp
// Copies src into dest (including '\0')
// Caller must ensure dest is large enough
char* strcpy(char* dest, const char* src) {
    int i = 0;
    while (src[i] != '\0') {
        dest[i] = src[i];
        ++i;
    }
    dest[i] = '\0';  // don't forget the null terminator!
    return dest;
}
```

> ⚠️ **These helpers do NO error checking and know nothing about MAXLEN.** The public methods that call them are responsible for bounds checking. This separation of concerns is a key design principle of HW3.

> 💡 **Python comparison:** `strlen` ≈ `len(s)`, `strcpy` ≈ `dest = src` (but in C you must manually copy character by character).

### 16.5 TDD Development Process (8 Steps)

From lecture — the process for implementing each method:

1. **Pick** a public method (e.g., `reverse()`)
2. **Write** a nominal test case
3. **Identify/invent** useful helper function (e.g., `reverse_cpy()`)
4. **Write** public method using only helpers
5. **Write** helper functions
6. **Test** helpers independently
7. **Test** the public method
8. **Review**: Can it be more efficient? Better names? Extract another helper?

### 16.6 Example: reverse() Implementation

```cpp
// Helper: copies src reversed into dest
void reverse_cpy(char* dest, const char* src) {
    int src_len = strlen(src);
    int src_index = src_len - 1;
    int dest_index = 0;
    for (; dest_index < src_len; ++dest_index, --src_index)
        dest[dest_index] = src[src_index];
    dest[dest_index] = '\0';  // don't forget the null terminator!
}

// Public method
String String::reverse() {
    String temp;
    reverse_cpy(temp.buf, this->buf);
    return temp;
}
```

### 16.7 Testing Private Helpers — The "Make Public" Trick

From lecture (Strings p14): Helper functions like `reverse_cpy` are normally `private` (or `static private`). But how do you test them directly?

**The trick:** Temporarily change `private:` to `public:` in the class definition, write your tests, then change it back.

```cpp
// In student_gtests.cpp (or standard_main.cpp):
void test_reverse_cpy() {
    cout << "Testing reverse_cpy()" << endl;
    char A[100] = "Hello World";
    char R[100];
    String::reverse_cpy(R, A);   // only works when reverse_cpy is made public!
    cout << "|" << A << "| reversed is |" << R << "|" << endl;
    cout << "strlen(" << A << ") is " << strlen(A) << endl;
    cout << "strlen(" << R << ") is " << strlen(R) << endl;
}
```

**The testing loop (from lecture p15-16):**

```
Test helper → works? ─── No  → fix helper, re-test
                    └── Yes → add more edge cases
                              └── can't think of more → move on to test public method

Test public method → works? ─── No  → fix public method, re-test
                            └── Yes → add boundary tests
                                      └── can't think of more → Step 8 (review & refine)
```

> 💡 **Lecture mantra:** "How NOT to write correct code" — Don't say "I'll clean it up later." Clean it up NOW. If your function is more than 5 lines, re-factor it. Test each piece.

### 16.8 Example: operator+() Implementation

```cpp
String String::operator+(const String s) {
    String R;
    strcpy(R.buf, buf);
    strncat(R.buf, s.buf, MAXLEN - 1);  // prevent overflow
    return R;
}
```

> ⚠️ **Error checking:** Any time a string can grow, you must check that the result doesn't exceed `MAXLEN`.

### 16.9 indexOf() and strstr()

```cpp
int String::indexOf(const String& s) {
    char* p = strstr(buf, s.buf);  // find substring
    if (p != nullptr)
        return p - buf;  // pointer arithmetic gives index
    else
        return -1;
}
```

> 💡 `p - buf` works because both point into the same array. The result is the number of elements between them.

---

## 17. The static Keyword

> Corresponds to LearnCpp 7.11 — Static local variables  
> Combined with LearnCpp 15.6 / 15.7 — Static member variables / functions

In C++, `static` is an **overloaded keyword** — it means completely different things depending on where it appears. This section walks through all its meanings, because you'll see every one of them in this course (and in the earlier sections of these notes).

> ⚠️ **Don't confuse these:**
> - `static` (storage class / storage duration) — this section
> - `static_cast<T>(x)` — a **type cast operator**, completely unrelated
> - "statically typed language" — describes C++'s compile-time type checking, also unrelated

### 17.1 Static Local Variables

Inside a function, a **normal** local variable is created each time the function is called and destroyed when the function returns. A **`static` local** variable is different: it's **initialized only once** (the first time control reaches the declaration) and **persists for the lifetime of the program**.

```cpp
void counter() {
    static int count{0};  // initialized ONCE, not every call
    ++count;
    std::cout << count << '\n';
}

counter();  // prints 1
counter();  // prints 2
counter();  // prints 3
```

**Why does this matter?** It lets you safely **return a reference** to a function-local-looking variable — the trick from the `getProgramName()` example earlier in these notes:

```cpp
const std::string& getProgramName() {
    static const std::string s_programName{"Calculator"};  // constructed once, lives forever
    return s_programName;  // ✅ not a dangling reference
}
```

Without `static`, `s_programName` would be destroyed when the function returns, and the returned reference would dangle. With `static`, the object lives until program exit.

> 💡 **Initialization timing:** A static local is initialized the **first time** control reaches its declaration at runtime — not at program start. Before that moment it's zero-initialized.

> 💡 **Naming convention:** Many codebases prefix static locals with `s_` to visually distinguish them from regular locals.

**Python comparison:** There's no direct equivalent. The closest analogy is a function-level mutable default argument (`def f(cache=[]):`) — it persists across calls, but the mechanism is very different.

### 17.2 Static Member Variables

Inside a class, `static` means the member **belongs to the class itself**, not to any particular instance. All instances share the same storage:

```cpp
class Counter {
public:
    static int count;         // declared inside class
    Counter() { ++count; }
};

int Counter::count = 0;       // defined outside class (required for non-inline statics)

Counter a, b, c;
std::cout << Counter::count;  // 3 — shared across all instances
```

**Access syntax:** `ClassName::member` is the idiomatic form (though `instance.member` also compiles).

**C++17 inline variables** let you initialize the static inside the class, no separate definition needed:

```cpp
class Counter {
public:
    inline static int count = 0;  // defined right here
};
```

**`constexpr` static members** are implicitly `inline`, so they can be initialized directly in the class without `inline`:

```cpp
class String {
    static constexpr int MAXLEN = 256;  // ✅ works directly — constexpr is implicitly inline
    char buf[MAXLEN];
};
```

This is exactly the pattern used in the Custom String Class section above — `MAXLEN` is shared across all `String` instances and baked in at compile time.

### 17.3 Static Member Functions

Inside a class, `static` on a function means **no `this` pointer** — the function doesn't operate on any particular instance. It's essentially a namespaced free function.

```cpp
class Math {
public:
    static int square(int x) { return x * x; }
};

int r = Math::square(5);  // called without an instance
```

**Key restrictions:**
- Cannot access non-static members (there's no `this`)
- Cannot be declared `const` (there's no object for `const` to apply to)
- Called with `ClassName::` syntax (though `instance.staticFn()` also compiles)

**When to use them:**
- Utility / helper functions logically grouped with a class but not operating on instances
- Factory functions that return new instances of the class
- The TDD helper pattern used in the Custom String Class section above — helpers like `strlen`, `strcpy` that "know nothing about `MAXLEN`" are often `static private`

```cpp
class String {
private:
    static int strlen(const char src[]);            // helper, no `this`
    static char* strcpy(char* dest, const char* src);
public:
    int length() const { return strlen(buf); }     // public method delegates to static helper
};
```

### 17.4 The Fourth Meaning (For Completeness)

There's also `static` at **file scope** (outside any function or class), which gives a name **internal linkage** — meaning it's only visible in that translation unit (`.cpp` file):

```cpp
// util.cpp
static int counter = 0;  // visible only in util.cpp, not in other files
```

This is a C holdover. **Modern C++ prefers unnamed namespaces** for the same purpose:

```cpp
namespace {
    int counter = 0;  // same effect as file-scope `static`, more idiomatic
}
```

You're unlikely to write this yourself in ICS 45C, but it explains why `static` has so many meanings — each meaning comes from a different era of C/C++ design.

### 17.5 Summary

| Where `static` appears | Meaning |
|-----------------------|---------|
| Local variable inside a function | Initialized once; persists for program lifetime |
| Class member variable | Shared across all instances; accessed as `Class::member` |
| Class member function | No `this`; called as `Class::function()` |
| File-scope variable / function | Internal linkage (visible only in this `.cpp`) |

> 💡 **Mnemonic:** Wherever you see `static`, think **"one copy, persistent"** — either one copy per program (local / file-scope) or one copy per class (member).

---

## 18. Quick Reference Summary

### C-style Array / Pointer Cheat Sheet

| Expression | Equivalent | Result |
|-----------|-----------|--------|
| `arr[i]` | `*(arr + i)` | Element at index i |
| `&arr[0]` | `arr` (decayed) | Address of first element |
| `arr + n` | — | Address of element n |
| `sizeof(arr)` | — | Total bytes (NO decay) |
| `strlen(s)` | — | Logical length of C-string (excludes `'\0'`) |

### String Types Comparison

| Feature | `char[]` (C-string) | `std::string` | Custom `String` class |
|---------|-------------------|--------------|-----------------------|
| Dynamic size | ❌ Fixed | ✅ | ❌ Fixed (MAXLEN) |
| Assignment with `=` | ❌ | ✅ | ✅ (overloaded) |
| Comparison with `==` | ❌ (compares pointers) | ✅ | ✅ (if overloaded) |
| Null terminated | ✅ Required | ✅ (internally) | ✅ (internally) |
| Knows length | `strlen()` — O(n) | `.size()` — O(1) | `strlen(buf)` — O(n) |

### Operator Overloading Decision Guide

```
Which operator are you overloading?
├── =, [], (), -> → MUST be member function
├── <<, >> (I/O) → MUST be non-member (friend or normal)
├── Unary (+, -, !, ++, --) → Prefer member
├── Binary, doesn't modify left (+, -, *, /) → Prefer non-member
└── Binary, modifies left (+=, -=, *=) → Prefer member
```

### File I/O Quick Reference

```cpp
#include <fstream>

// Read entire file, line by line
std::ifstream in("file.txt");
std::string line;
while (std::getline(in, line)) { /* process line */ }

// Write to file
std::ofstream out("file.txt");
out << "content" << '\n';

// Append to file
std::ofstream out("file.txt", std::ios::app);
```

### Python vs C++ Comparison (Week 3 Additions)

| Python | C++ | Notes |
|--------|-----|-------|
| `str` (immutable) | `std::string` (mutable) | C++ strings can be modified in place |
| `input()` | `std::getline(std::cin >> std::ws, s)` | Read full line |
| `s.find(sub)` | `s.find(sub)` or custom `indexOf()` | Returns index or `npos`/`-1` |
| `s[::-1]` | Custom `reverse()` | No built-in one-liner for C-strings |
| `open("file")` | `ifstream in("file")` | File I/O classes |
| `with open(...) as f:` | RAII — destructor closes file | Scope-based cleanup |
| `list[i]` | `arr[i]` or `*(ptr + i)` | Pointer arithmetic underlies subscripting |
| Dynamic list | Fixed C-array + length param | Must pass length separately |
| `**` (power) | No equivalent operator | Cannot create `operator**` |

**The 5 most important takeaways from Week 3:**

1. **Array decay loses length info**: When passed to a function, C-arrays become pointers — always pass the length separately
2. **C-strings are null-terminated char arrays**: The `'\0'` marks the logical end; iterate with `s[i] != '\0'`
3. **operator<< must be a non-member function**: Because the left operand is `ostream`, not your class
4. **Never return a local variable by reference**: It's destroyed when the function ends → dangling reference
5. **TDD for the String class**: Write test → write helper → test helper → write public method → test method → refine