# ICS 45C Week 1 — Integrated Reading Notes

## Table of Contents

- [1. Course Overview and Learning Path](#1-course-overview-and-learning-path)
- [2. Your First Program and the Compilation Pipeline](#2-your-first-program-and-the-compilation-pipeline)
- [3. Variables, Types, and Initialization](#3-variables-types-and-initialization)
- [4. Input, Output, and Strings](#4-input-output-and-strings)
- [5. Operators, Expressions, and Basic Data](#5-operators-expressions-and-basic-data)
- [6. Control Structures](#6-control-structures)
- [7. Functions, Parameters, and Scope](#7-functions-parameters-and-scope)
- [8. Arrays, Pointers, and Memory Ideas](#8-arrays-pointers-and-memory-ideas)
- [9. Getting Started with GoogleTest](#9-getting-started-with-googletest)
- [10. Sample Quiz 0](#10-sample-quiz-0)
- [11. Combined Cheat Sheet](#11-combined-cheat-sheet)

> UCI ICS 45C: Programming in C++ (35770)  
> This note merges overlapping Week 1 material from `cpp4python` and `LearnCpp.com` and reorganizes it into one reading order.

---

## 1. Course Overview and Learning Path

The goal of Week 1 is not to memorize a huge amount of syntax. The real goal is to build a complete beginner path into C++:

1. understand how a C++ program becomes an executable
2. learn the basic structure of a program: `main()`, statements, comments, formatting
3. learn variables, types, initialization, input/output, and expressions
4. move into conditionals, loops, functions, arrays, and pointers
5. get a first look at GoogleTest

**Study suggestions**

- type in example code by hand instead of only reading it
- predict the output before running the program
- change one thing at a time and observe what happens
- compile often instead of collecting many errors at once
- when you get stuck, ask which layer is failing: syntax, type system, logic, or compilation

**The five-step development process**

1. **Define the problem**: what are we trying to solve?
2. **Determine a solution**: design something simple, modular, and error-aware
3. **Write the program**
4. **Compile**
5. **Test and debug**

> A good summary of Week 1 is this: first learn how a program exists, then learn how it runs.

---

## 2. Your First Program and the Compilation Pipeline

### 2.1 C++ vs. Python: compiled vs. interpreted

C++ is a **compiled language**. Python is usually treated as an **interpreted language**.

```bash
g++ -o myprogram myprogram.cpp
./myprogram
```

- C++ source code must be compiled before it runs
- many syntax and type errors are caught during compilation
- this is one reason C++ often feels stricter than Python

### 2.2 A minimal C++ program

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!\n";
    return 0;
}
```

Important Week 1 pieces in this program:

- `#include <iostream>`: include the standard I/O library
- `main()`: the entry point of the program
- `{}`: a block of code
- `;`: the end of a statement
- `return 0;`: tell the operating system the program finished successfully

### 2.3 `main()`, statements, and comments

A **statement** is one complete unit of execution in C++. Statements usually end with `;`.

```cpp
int x;
x = 5;
std::cout << x;
return 0;
```

C++ comments come in two forms:

```cpp
// single-line comment
/* multi-line
   comment */
```

Good comments should usually explain **why**, not only **what**.

### 2.4 Headers, namespaces, and source files

```cpp
#include <iostream>
using namespace std;
```

- `#include` is a **preprocessor directive**
- `<iostream>` provides `cout` and `cin`
- `using namespace std;` lets you omit `std::`

Still, it is usually better to write `std::cout` and `std::cin` explicitly because:

- the code is clearer
- it reduces naming conflicts
- it matches modern C++ style more closely

**File organization**

- header files `*.h` or `*.hpp`: declarations
- source files `*.cpp`: definitions

### 2.5 Compiler, linker, and loader

The full process can be pictured like this:

```text
source code (.cpp/.hpp)
  -> preprocessor
  -> compiler
  -> object file
  -> linker
  -> executable
  -> loader
  -> execution begins at main()
```

What each part does:

- **preprocessor**: handles `#include`, `#define`, and related directives
- **compiler**: checks syntax and translates `.cpp` into object code
- **linker**: combines object files and libraries
- **loader**: places the executable into memory when the program runs

A **library** is a reusable package of prewritten code.

- standard library examples: `iostream`, `string`
- third-party example you will soon see: GoogleTest

### 2.6 Formatting and naming

- C++ ignores most whitespace, but humans do not
- keep brace style consistent
- use consistent indentation
- choose descriptive names

**Naming rules**

- names may contain letters, digits, and underscores
- names cannot begin with a digit
- C++ is case-sensitive
- keywords such as `int`, `return`, and `while` cannot be used as identifiers

---

## 3. Variables, Types, and Initialization

### 3.1 Data, objects, variables, and static typing

Important Week 1 terms:

- **data**: information
- **object**: a region of memory that stores a value
- **variable**: a named object
- **identifier**: the variable's name

```cpp
int x;
double price;
bool done;
```

C++ is a **statically typed** language:

- every variable must have a type when it is created
- once the type is fixed, it determines how the value is stored and interpreted

That is different from Python, where the same name can later hold a completely different kind of value.

### 3.2 Definition, assignment, and initialization

```cpp
int x;      // definition
x = 5;      // assignment

int a = 5;  // copy initialization
int b(5);   // direct initialization
int c{5};   // brace initialization
int d{};    // value initialization -> 0
```

The most important Week 1 rules are:

- initialize variables when you define them
- prefer `{}` when possible

```cpp
int x{4.5};   // compile-time error: narrowing conversion blocked
int y = 4.5;  // compiles, but y becomes 4
```

Brace initialization is safer because it prevents narrowing in many cases.

### 3.3 Uninitialized variables and undefined behavior

```cpp
int x;
std::cout << x;   // dangerous
```

If a local variable is not initialized, it usually contains garbage.

This can produce **undefined behavior (UB)**:

- strange output
- crashes
- or code that appears to work by accident

The rule is simple:

**Always initialize a variable when you create it.**

### 3.4 Constants and magic numbers

```cpp
constexpr double pi{3.1415926};
constexpr char newline{'\n'};
```

- `constexpr` creates a compile-time constant
- constants cannot be reassigned
- named constants are clearer than mysterious hard-coded numbers

```cpp
double area(double r) {
    return pi * r * r;
}
```

### 3.5 Common primitive types in Week 1

| Type | Purpose |
|------|------|
| `int` | integer |
| `float` / `double` | floating-point number |
| `bool` | true / false |
| `char` | a single character |
| pointer | an address |

Common modifiers:

- `short`
- `long`
- `unsigned`

These affect range and sometimes memory usage.

---

## 4. Input, Output, and Strings

### 4.1 `cout`, `cin`, and `endl`

```cpp
#include <iostream>

int main() {
    int x{};
    std::cin >> x;
    std::cout << "You entered: " << x << '\n';
    return 0;
}
```

- `std::cout <<` outputs data
- `std::cin >>` reads input
- `std::endl` prints a newline and flushes the buffer
- `'\n'` prints only a newline and is usually more efficient

```cpp
std::cout << "Hello" << std::endl;
std::cout << "Hello\n";
```

In Week 1, prefer `'\n'` unless you specifically need a flush.

### 4.2 Insertion and extraction operators

```cpp
std::cout << "A" << "B" << '\n';
std::cin >> value;
```

- `<<` is the **insertion operator**
- `>>` is the **extraction operator**

They can be chained:

```cpp
std::cout << "x = " << x << '\n';
```

### 4.3 Reading one word vs. a full line

```cpp
std::string name{};
std::cin >> name;
```

This reads only the next word and stops at whitespace.

To read a whole line:

```cpp
#include <string>

std::string line{};
std::getline(std::cin, line);
```

### 4.4 `char` and `string`

```cpp
char letter{'A'};
std::string name{"Hello"};
```

- `'A'` is a `char`
- `"Hello"` is a string literal
- when you see single quotes in Week 1, think "single character"

Unlike Python, `'a'` and `"a"` are not basically the same thing in C++.

### 4.5 Basic string operations

```cpp
#include <string>

std::string s{"Hello"};
std::cout << s[0] << '\n';
std::cout << s.size() << '\n';

for (char c : s) {
    std::cout << c << ' ';
}
```

- `s[i]`: access a character by index
- `s.size()`: length of the string
- a range-based `for` loop can iterate over the characters

---

## 5. Operators, Expressions, and Basic Data

### 5.1 Numeric types and integer division

```cpp
std::cout << 7 / 3 << '\n';     // 2
std::cout << 7.0 / 3 << '\n';   // 2.333...
std::cout << 7 % 3 << '\n';     // 1
```

Important rules:

- `int / int` performs **integer division**
- `%` is remainder and only works with integers

| Python | C++ |
|--------|-----|
| `7 // 3` | `7 / 3` |
| `7 / 3` | `7.0 / 3` |
| `2 ** 10` | `pow(2, 10)` |

### 5.2 Booleans and logical operators

```cpp
bool flag{true};
bool test{false};
```

| Python | C++ |
|--------|-----|
| `and` | `&&` |
| `or` | `||` |
| `not` | `!` |

Relational operators:

- `<`
- `>`
- `<=`
- `>=`
- `==`
- `!=`

### 5.3 Literals and operators

A **literal** is a value written directly in code:

```cpp
5
3.14
'A'
"Hello"
true
```

An **operator** performs an action on values:

- arithmetic: `+ - * / %`
- assignment: `= += -= *= /= %=`
- comparison: `== != < >`
- logic: `&& || !`

### 5.4 Increment, decrement, and precedence

```cpp
int x{10};
x++;
x--;
```

- `x++`: increment
- `x--`: decrement

If you are unsure about precedence, use parentheses.

```cpp
2 + 3 * 4;    // 14
(2 + 3) * 4;  // 20
```

### 5.5 Expressions and expression statements

```cpp
2 + 3
x = 5
x
```

These are all **expressions**.

Once you add a semicolon, an expression becomes an **expression statement**:

```cpp
x = 5;
```

### 5.6 Core conclusions

- values and types are tightly connected in C++
- operators behave differently depending on operand types
- `int / int` is one of the easiest Week 1 mistakes to make

---

## 6. Control Structures

### 6.1 `if / else if / else`

```cpp
if (score >= 90) {
    std::cout << "A\n";
} else if (score >= 80) {
    std::cout << "B\n";
} else {
    std::cout << "F\n";
}
```

- conditions go inside `()`
- code blocks usually go inside `{}`
- Python's `elif` becomes `else if` in C++

### 6.2 `switch`

```cpp
switch (grade) {
    case 'A': std::cout << "Excellent"; break;
    case 'B': std::cout << "Good"; break;
    default:  std::cout << "Other";
}
```

Key properties:

- useful for discrete value selection
- `break` is usually necessary after each `case`
- `default` means "all other cases"

### 6.3 `while`

```cpp
int count{0};
while (count < 5) {
    std::cout << count << '\n';
    ++count;
}
```

### 6.4 `for`

```cpp
for (int i{0}; i < 10; ++i) {
    std::cout << i << '\n';
}
```

Comparison with Python:

| Python | C++ |
|--------|-----|
| `for i in range(10):` | `for (int i = 0; i < 10; ++i)` |

### 6.5 Range-based `for`

```cpp
for (int n : nums) {
    std::cout << n << '\n';
}
```

This is much closer to:

```python
for x in nums:
    print(x)
```

### 6.6 `break` and `continue`

```cpp
for (int i{0}; i < 10; ++i) {
    if (i == 3) {
        continue;
    }
    if (i == 8) {
        break;
    }
    std::cout << i << '\n';
}
```

- `continue`: skip the rest of the current iteration
- `break`: stop the entire loop

---

## 7. Functions, Parameters, and Scope

### 7.1 Why functions matter

Functions are valuable because they:

1. break large problems into smaller ones
2. make code reusable
3. make testing easier
4. make maintenance and extension easier

**A good rule is that one function should do one job.**

### 7.2 Defining functions

```cpp
int add(int a, int b) {
    return a + b;
}

void greet(std::string name) {
    std::cout << "Hello " << name << '\n';
}
```

- every function must declare a return type
- every parameter must declare a type
- `void` means no return value

### 7.3 Declarations and definitions

```cpp
double average(double x, double y);   // declaration

int main() {
    std::cout << average(2.0, 3.0) << '\n';
}

double average(double x, double y) {  // definition
    return (x + y) / 2.0;
}
```

- a **declaration** tells the compiler a function exists
- a **definition** provides the implementation
- before a call happens, the compiler must at least have seen a declaration

### 7.4 Return values and `void`

```cpp
int getValueFromUser() {
    int input{};
    std::cin >> input;
    return input;
}
```

```cpp
void printHello() {
    std::cout << "Hello!\n";
}
```

Rules:

- an `int` function must return an `int`
- a `void` function does not return a value
- forgetting `return` in a non-`void` function can cause undefined behavior

### 7.5 Parameters, arguments, and pass-by-value

```cpp
void print(int x) {
    std::cout << x << '\n';
}

print(5);
```

- `x` is a **parameter**
- `5` is an **argument**

By default, C++ uses **pass by value**:

- the function receives a copy
- changing the copy does not change the original

```cpp
void addOne(int x) {
    ++x;
}
```

### 7.6 Pass by reference

```cpp
void increment(int& x) {
    ++x;
}
```

```cpp
int z{10};
increment(z);
std::cout << z << '\n';   // 11
```

- `int& x` means a reference parameter
- it allows the function to modify the caller's variable directly

### 7.7 Default arguments and overloading

```cpp
double toCentigrade(double fahrenheitTemp = 32.0) {
    return 5.0 * (fahrenheitTemp - 32.0) / 9.0;
}
```

```cpp
double calc(int n)    { return n * n; }
double calc(double x) { return x * x + 0.5; }
```

- **default arguments** let callers omit some values
- **function overloading** means multiple functions share one name but have different parameter lists

### 7.8 Local scope

```cpp
void func() {
    int x{5};
    std::cout << x;
}
```

- local variables are created where they are defined
- they are destroyed at the end of their block
- two different functions can each have a local variable with the same name without conflict

---

## 8. Arrays, Pointers, and Memory Ideas

### 8.1 Arrays

```cpp
int scores[5] = {90, 85, 78, 92, 88};
std::cout << scores[0] << '\n';
```

| Python list | C++ array |
|-------------|----------|
| dynamic size | fixed size |
| mixed types allowed | elements must share one type |
| out-of-range usually raises an error | out-of-range may cause UB |
| `append()` available | no built-in `append()` |

### 8.2 Arrays as parameters

```cpp
double average(int list[], int length) {
    double total{0};
    for (int i{0}; i < length; ++i) {
        total += list[i];
    }
    return total / length;
}
```

When a function receives an array, you usually also pass the length.

### 8.3 Pointers

> A pointer is a variable that stores an address.

```cpp
int value{100};
int* ptr{&value};

std::cout << value << '\n';
std::cout << &value << '\n';
std::cout << *ptr << '\n';
```

You must clearly separate three ideas:

- `&x`: get the address
- `int* ptr`: declare a pointer
- `*ptr`: dereference the pointer to read or write the pointed value

```cpp
*ptr = 2000;
std::cout << value << '\n';   // 2000
```

### 8.4 `nullptr`

```cpp
int* ptr{nullptr};
```

- `nullptr` means the pointer points to nothing
- dereferencing a null pointer is a serious error

### 8.5 File input and output

```cpp
#include <fstream>
#include <string>

std::ifstream in("input.txt");
std::ofstream out("output.txt");
std::string line{};

while (std::getline(in, line)) {
    out << line << '\n';
}
```

- `ifstream`: file input
- `ofstream`: file output
- `while (getline(...))` is the standard pattern for reading a file line by line

### 8.6 Memory regions and lifetime

Common storage regions:

- **static storage**: globals and `static` variables
- **stack**: local variables and function parameters
- **heap / free store**: objects managed with `new` and `delete`

One way to remember an object's lifetime:

1. birth
2. allocation
3. construction
4. life
5. death
6. destruction
7. deallocation

The instructor specifically emphasized:

- the correct term is **destruction**
- not **deconstruction**

---

## 9. Getting Started with GoogleTest

### 9.1 Basic hierarchy

```text
test program
  -> test suite
    -> test
      -> assertion
```

- **assertion**: checks one condition
- **test**: a group of assertions
- **test suite**: a collection of related tests

### 9.2 `EXPECT_*` vs. `ASSERT_*`

| Type | What happens after failure | Good use case |
|------|-----------|---------|
| `EXPECT_*` | non-fatal, execution continues | most situations |
| `ASSERT_*` | fatal, stop the current function immediately | when later code depends on the checked condition |

Common assertions:

- `EXPECT_TRUE(condition)`
- `EXPECT_FALSE(condition)`
- `EXPECT_EQ(a, b)`
- `EXPECT_NE(a, b)`
- `EXPECT_LT(a, b)`
- `EXPECT_LE(a, b)`
- `EXPECT_GT(a, b)`
- `EXPECT_GE(a, b)`
- `EXPECT_STREQ(s1, s2)`

### 9.3 A simple test

```cpp
#include <gtest/gtest.h>

TEST(FactorialTest, HandlesZeroInput) {
    EXPECT_EQ(Factorial(0), 1);
}

TEST(FactorialTest, HandlesPositiveInput) {
    EXPECT_EQ(Factorial(1), 1);
    EXPECT_EQ(Factorial(2), 2);
    EXPECT_EQ(Factorial(3), 6);
}
```

Rules:

- use `TEST(SuiteName, TestName)`
- names cannot contain underscores
- test names inside one suite must be unique

### 9.4 When to use `ASSERT_*`

```cpp
TEST(QueueTest, DequeueWorks) {
    Queue q;
    q.Enqueue(1);
    int* n = q.Dequeue();

    ASSERT_NE(n, nullptr);
    EXPECT_EQ(*n, 1);

    delete n;
}
```

If you do not first check that `n != nullptr`, the later `*n` may crash the test.

---

## 10. Sample Quiz 0

> Assume all necessary `#include`s are present and correct.

### 10.1 Operator precedence

Question:

```cpp
x = +a + b * c - d / -e
y = z = -a - b / c * d
```

With full parentheses:

```cpp
(x = (((+a) + (b * c)) - (d / (-e))))
(y = (z = ((-a) - ((b / c) * d))))
```

### 10.2 Write `square`

```cpp
int square(int i) {
    return i * i;
}
```

### 10.3 Print `1` through `10` and their squares

```cpp
int main() {
    for (int i = 1; i <= 10; ++i) {
        std::cout << i << ' ' << square(i) << '\n';
    }
    return 0;
}
```

### 10.4 What this quiz is testing

This sample quiz is really checking four things at once:

- whether you understand operator precedence
- whether you can write a minimal function
- whether you can write a `for` loop
- whether you remember the basic lifetime and execution ideas from Week 1

---

## 11. Combined Cheat Sheet

| Concept | Python | C++ |
|------|--------|-----|
| Output | `print("hi")` | `cout << "hi" << '\n';` |
| Input | `x = input()` | `cin >> x;` |
| Variable | `x = 5` | `int x{5};` |
| Types | dynamic | static |
| Integer division | `7 // 3` | `7 / 3` |
| Power | `2 ** 10` | `pow(2, 10)` |
| Boolean | `True / False` | `true / false` |
| Logic | `and / or / not` | `&& / || / !` |
| Condition | `if x > 0:` | `if (x > 0) {}` |
| `elif` | `elif` | `else if` |
| Loop | `for i in range(n):` | `for (int i = 0; i < n; ++i)` |
| Function | `def f(x):` | `int f(int x) {}` |
| No return value | `def f():` | `void f() {}` |
| Character | `'a'` | `'a'` is a `char` |
| String | `"abc"` | `std::string{"abc"}` |
| Array | `[1, 2, 3]` | `int a[]{1, 2, 3};` |
| Pointer | no direct equivalent | `int* p = &x;` |
| Null pointer | `None` | `nullptr` |
| Pass by reference | similar effects sometimes happen with mutable objects | `void f(int& x)` |
| Increment | `x += 1` | `++x` or `x++` |
| Testing | `assert` / `unittest` | GoogleTest |

**The five most important Week 1 facts to remember**

1. C++ is statically typed.
2. Initialize variables when you define them, and prefer `{}`.
3. `int / int` performs integer division.
4. `main()` is the program entry point.
5. The default parameter-passing model is pass by value; reference parameters can modify the original variable.
