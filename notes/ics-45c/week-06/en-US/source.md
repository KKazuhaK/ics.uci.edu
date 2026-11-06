# Information and Computer Science 45C — Week 6 Integrated Reading Notes

## Table of Contents

- [1. Weekly Learning Objectives](#1-weekly-learning-objectives)
- [2. The Concept of Inheritance: the is-a Relationship](#2-the-concept-of-inheritance-the-is-a-relationship)
- [3. Basic Inheritance Syntax in C++](#3-basic-inheritance-syntax-in-c)
- [4. Order of Construction of Derived Classes](#4-order-of-construction-of-derived-classes)
- [5. Constructors and Initialization of Derived Classes](#5-constructors-and-initialization-of-derived-classes)
- [6. Inheritance and Access Control (public / protected / private)](#6-inheritance-and-access-control-public--protected--private)
- [7. Three Inheritance Modes (public / protected / private inheritance)](#7-three-inheritance-modes-public--protected--private-inheritance)
- [8. Adding New Functionality to a Derived Class](#8-adding-new-functionality-to-a-derived-class)
- [9. Calling Inherited Functions and Overriding (Redefining) Behavior](#9-calling-inherited-functions-and-overriding-redefining-behavior)
- [10. Base-Class Pointers/References Pointing to Derived Objects](#10-base-class-pointersreferences-pointing-to-derived-objects)
- [11. Virtual Functions and Runtime Polymorphism](#11-virtual-functions-and-runtime-polymorphism)
- [12. Static Binding vs. Dynamic Binding](#12-static-binding-vs-dynamic-binding)
- [13. Pure Virtual Functions, Abstract Base Classes, and Interface Classes](#13-pure-virtual-functions-abstract-base-classes-and-interface-classes)
- [14. dynamic_cast and Downcasting](#14-dynamic_cast-and-downcasting)
- [15. Printing Inherited Class Objects with operator<<](#15-printing-inherited-class-objects-with-operator)
- [16. Klefstad Extended Example: Vector and CheckedVector](#16-klefstad-extended-example-vector-and-checkedvector)
- [17. Klefstad Extended Example: Picture/Shape Framework (HW6)](#17-klefstad-extended-example-pictureshape-framework-hw6)
- [18. "Look at Some Submissions" Snippets in Klefstad's PPT](#18-look-at-some-submissions-snippets-in-klefstads-ppt)
- [19. Week 6 Comprehensive Cheat Sheet](#19-week-6-comprehensive-cheat-sheet)
- [20. Top Five Takeaways for Week 6](#20-top-five-takeaways-for-week-6)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate Week 6 reading material LearnCpp 24.1–24.7 (inheritance basics) + 25.1, 25.2, 25.7, 25.10, 25.11 (pointers/references to base, virtual functions, pure virtual & abstract classes, dynamic_cast, printing with operator<<), together with Professor Klefstad's PPT *Topic 6: Inheritance & Polymorphism*. Content is organized by concept, with each section fusing the original reading + PPT code examples + Klefstad's aphorisms + common-pitfall callouts.
> The PPT content on **multiple inheritance and virtual base classes** (pages 27, 29–31, 33) is outside the Week 6 reading list and is now covered in **Week 7 §17**.

---

## 1. Weekly Learning Objectives

> Corresponds to LearnCpp 24.1 + 25.1 chapter introductions

### 1.1 Inheritance Portion (chapter 24)

- Understand: inheritance expresses an **"is-a" (is a kind of)** relationship, in contrast with composition (has-a)
- Learn: how to write the `class Derived : public Base` syntax
- Master: when constructing a derived object, **the base part is constructed first**, then the derived part
- Master: how a derived constructor **explicitly calls the base constructor**
- Understand: the **protected** access specifier and how it differs from public/private
- Understand: how the three inheritance modes — public/protected/private — affect member visibility
- Learn: how to **add new functionality, redefine functions, and call base functions** in a derived class

### 1.2 Polymorphism Portion (chapter 25)

- Understand: a base-class pointer/reference can point to a derived-class object (**upcasting**)
- Master: the `virtual` keyword and how it makes a function call resolve to the **most-derived** version
- Distinguish: **static polymorphism** (overloading, templates) vs. **dynamic polymorphism** (virtual functions)
- Master: the concepts of **pure virtual functions** (`= 0`) and **abstract base classes**
- Understand: the design philosophy of an **interface class**
- Learn: use `dynamic_cast` for safe **downcasting**
- Learn: implement **operator<< for inherited classes** via a virtual `print()` member function

---

## 2. The Concept of Inheritance: the is-a Relationship

> Corresponds to LearnCpp 24.1 + PPT page 5

### 2.1 Two Ways to Build Complex Classes

C++ lets us build complex classes in two main ways:

| Approach | Relationship | Keyword | Implementation |
|---|---|---|---|
| **Composition** | "has-a" / "is a part of" | An Engine **is part of** a Car | Data members |
| **Inheritance** | "is-a" / "is a kind of" | A Car **is a kind of** Vehicle | Derived-class syntax |

> 💡 **Klefstad aphorism contrast**:
> - Composition: `class Car : public Vehicle { Engine e; ... };` — Car **contains** an Engine
> - Inheritance: `class Car : public Vehicle { ... };` — Car **is a kind of** Vehicle
>
> Note: the first line above uses both inheritance (: public Vehicle) and composition (Engine e) — a class can use both relationships at once.

### 2.2 Analogy: Apples and Bananas

> The core metaphor used by LearnCpp

Apples and bananas are different fruits, but both are **fruits**. So everything that fruits possess (color, name, size, the ability to ripen), apples and bananas possess too. We say apples and bananas **inherit** all the properties of fruit — because they **are** fruits.

### 2.3 Hierarchy

A hierarchy diagram shows relationships between objects, usually from **general to specific**:

```
        Fruit
       /      \
    Apple    Banana
```

Or a hierarchy that evolves over time (386 → 486 → Pentium), or biological taxonomy (Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species).

Shape hierarchy:

```
              Shape
             /      \
       Quadrilateral   Triangle
        /     \           |
   Rectangle  ...      RightTriangle
       |
    Square
```

### 2.4 Real-World Examples of Inheritance (Klefstad emphasizes)

- **Biology**: you inherit genes from your parents, plus your own personality
- **Tech products**: phones and computers inherit features from prior generations (backward compatibility)
- **Programming languages**: C++ inherits a great deal from C, which inherited from earlier languages

### 2.5 HW6 Class Hierarchy (given in PPT)

```
                  {Shape}                   Picture
                /   |    \                  +ListNode
            Circle Triangle  Rectangle
                              |
                            Square
```

> ⚠️ `{Shape}` in braces denotes an **abstract class** (cannot be instantiated). Picture stores multiple Shape pointers via a ListNode-based linked list, composing one "picture."

### 2.6 Python ↔ C++ Analogy

| Python | C++ | Notes |
|---|---|---|
| `class Apple(Fruit):` | `class Apple : public Fruit` | Python inheritance defaults to public |
| Multiple inheritance is common | Single inheritance dominates; multiple is rare and complex | C++ multiple inheritance has ambiguity issues |
| `super().__init__()` explicit call | Use member init list `: Fruit{...}` | Both languages need an explicit base-constructor call |

---

## 3. Basic Inheritance Syntax in C++

> Corresponds to LearnCpp 24.2 + PPT pages 6-7

### 3.1 Terminology

| Term | English synonyms |
|---|---|
| **Base class** (the one being inherited from) | base class / parent class / superclass |
| **Derived class** (the one inheriting from someone) | derived class / child class / subclass |

### 3.2 A Simple Person Base Class

```cpp
#include <string>
#include <string_view>

class Person
{
// In this example we leave members public for simplicity
public: 
    std::string m_name{};
    int m_age{};

    Person(std::string_view name = "", int age = 0)
        : m_name{ name }, m_age{ age }
    {
    }

    const std::string& getName() const { return m_name; }
    int getAge() const { return m_age; }
};
```

Every Person has a name and an age — these are properties shared by **all people**, so they belong in the base class.

### 3.3 Three Ways to Add "Name + Age" to BaseballPlayer

> The key design comparison from LearnCpp

Suppose we want to write a BaseballPlayer class that tracks batting average and home runs. BaseballPlayer also needs a name and age. We have three options:

| Option | Verdict |
|---|---|
| 1. **Copy** these fields directly into BaseballPlayer | ❌ Duplicate code; if Person changes, BaseballPlayer must change too |
| 2. **Composition**: have BaseballPlayer contain a Person member | ❌ "BaseballPlayer **has a** Person" — wrong; **BaseballPlayer is** a Person |
| 3. **Inheritance**: BaseballPlayer inherits from Person | ✅ Correct, the "is-a" relationship matches perfectly |

### 3.4 Derivation Syntax

```cpp
// BaseballPlayer publicly inherits from Person
class BaseballPlayer : public Person
{
public:
    double m_battingAverage{};
    int m_homeRuns{};

    BaseballPlayer(double battingAverage = 0.0, int homeRuns = 0)
       : m_battingAverage{battingAverage}, m_homeRuns{homeRuns}
    {
    }
};
```

Inheritance syntax format: `class DerivedClass : public BaseClass`

### 3.5 What Members BaseballPlayer Actually Has

After inheritance, a BaseballPlayer object **has 4 member variables in total**:

- From Person: `m_name`, `m_age`
- BaseballPlayer's own: `m_battingAverage`, `m_homeRuns`

```cpp
int main()
{
    BaseballPlayer joe{};
    joe.m_name = "Joe";              // m_name was inherited from Person
    std::cout << joe.getName() << '\n';   // getName() was also inherited
    return 0;
}
// Output: Joe
```

### 3.6 Multiple Classes Sharing the Same Base

```cpp
// Employee also inherits publicly from Person
class Employee: public Person
{
public:
    double m_hourlySalary{};
    long m_employeeID{};

    Employee(double hourlySalary = 0.0, long employeeID = 0)
        : m_hourlySalary{hourlySalary}, m_employeeID{employeeID}
    {
    }

    void printNameAndSalary() const
    {
        std::cout << m_name << ": " << m_hourlySalary << '\n';
        // m_name comes from Person, m_hourlySalary is its own — both accessible
    }
};
```

> 💡 **Key Insight**: BaseballPlayer and Employee have **no direct relationship** to each other, even though both inherit from Person. They are like siblings — sharing common parents but mutually independent.

### 3.7 Inheritance Chains

A derived class can **itself** be a base class to another, forming multi-level inheritance:

```cpp
class Supervisor: public Employee   // Employee in turn inherits from Person
{
public:
    long m_overseesIDs[5]{};   // The 5 employee IDs the Supervisor manages
};
```

Hierarchy:

```
Person → Employee → Supervisor
```

Supervisor inherits all members of **both** Employee and Person, plus its own `m_overseesIDs`.

### 3.8 Benefits of Inheritance (LearnCpp summary)

> Highlights stressed by both the professor and the exams

1. **Code reuse**: no need to rewrite base-class code in the derived class
2. **Easier maintenance**: change the base class once and all derivatives benefit
3. **Build a general → specific hierarchy**: most general at the top, increasingly specific going down

### 3.9 Klefstad Aphorism

> Klefstad's version (Topic 6 page 6):
> ```cpp
> class Window : public Screen { ... };
> class Menu : public Window { ... };
> ```
> "Screen is a public base class of Window. Window is derived from Screen. Window inherits data and member functions from Screen. Menu inherits from both Window and Screen."

---

## 4. Order of Construction of Derived Classes

> Corresponds to LearnCpp 24.3

### 4.1 Memory Model of a Derived Object

Although inheritance lets BaseballPlayer "have" Person's members, **a derived object is not a copy of base-class members** — it is **composed of two parts**:

```
+----------------------+
|   Base part          |   ← Person's m_name, m_age
+----------------------+
|   Derived part       |   ← BaseballPlayer's m_battingAverage, m_homeRuns
+----------------------+
```

Derived object = Base part + Derived part

### 4.2 Construction Order: From Most-Base to Most-Derived (top-down)

> ⚠️ **Core rule**: when C++ constructs a derived object, **it always constructs the most-base class (top of the inheritance tree) first, and works downward**.

```cpp
#include <iostream>

class Base
{
public:
    int m_id {};

    Base(int id = 0) : m_id{ id }
    {
        std::cout << "Base\n";
    }
};

class Derived : public Base
{
public:
    double m_cost {};

    Derived(double cost = 0.0) : m_cost{ cost }
    {
        std::cout << "Derived\n";
    }
};

int main()
{
    std::cout << "Instantiating Base\n";
    Base base;

    std::cout << "Instantiating Derived\n";
    Derived derived;

    return 0;
}
```

Output:

```
Instantiating Base
Base
Instantiating Derived
Base
Derived              ← Note: when Derived is constructed, Base is constructed too
```

### 4.3 Why Construct the Base First?

> 💡 **Key Insight**: logically, **a child cannot exist before its parents**. Also, derived classes often use base-class member variables; constructing the base first guarantees that those members are already initialized when the derived constructor runs.

### 4.4 Construction Order in a Multi-Level Chain

```cpp
class A { public: A() { std::cout << "A\n"; } };
class B: public A { public: B() { std::cout << "B\n"; } };
class C: public B { public: C() { std::cout << "C\n"; } };
class D: public C { public: D() { std::cout << "D\n"; } };

int main()
{
    std::cout << "Constructing D: \n";
    D d;
}
```

Output:

```
Constructing D:
A
B
C
D
```

Construction order: **A → B → C → D** (most-base first, most-derived last).

### 4.5 Destruction Order: **Exactly the Reverse** of Construction

> ⚠️ **Important rule**: when a derived object is destroyed, **the most-derived class is destroyed first, then we work upward through the bases**.

```
Construction: A → B → C → D
Destruction:  D → C → B → A
```

> 💡 RAII analogy: each layer's "resource acquisition is initialization" — last in, first out, like a stack.

### 4.6 Python ↔ C++ Comparison

| Python | C++ |
|---|---|
| The subclass `__init__` **must explicitly call** `super().__init__()`, otherwise the parent constructor isn't run | A derived constructor **automatically calls** the base default constructor (if not explicitly specified) |
| No notion of a "Base part in memory" | A derived object **physically contains** the base part |

---

## 5. Constructors and Initialization of Derived Classes

> Corresponds to LearnCpp 24.4 + PPT page 25

### 5.1 Full Process of Creating a Derived Object

For a non-derived class, `Base base{ 5 };` proceeds as:

1. Memory is allocated for base
2. The matching Base constructor is called
3. The member-initializer list initializes the variables
4. The constructor body runs
5. Control returns to the caller

For a derived class, `Derived derived{ 1.3 };` proceeds as:

1. Memory is allocated for derived (enough to hold both the Base part and the Derived part)
2. The matching Derived constructor is called
3. **The Base subobject is first constructed using an appropriate Base constructor** — if not specified, the default constructor is used
4. The Derived member-initializer list initializes its own variables
5. The Derived constructor body runs
6. Control returns to the caller

> 💡 **Key Insight**: the only difference is step 3 — **before any of Derived's "real work" begins, the Base subobject must be constructed**.

### 5.2 ❌ Wrong Attempt 1: Initialize Inherited Members in the Derived Init List

A common beginner mistake:

```cpp
class Derived: public Base
{
public:
    double m_cost {};

    Derived(double cost = 0.0, int id = 0)
        : m_cost{ cost }
        , m_id{ id }     // ❌ Compile error! m_id is inherited and can't be initialized here
    {
    }
};
```

> ⚠️ **C++ rule**: a member variable can **only be initialized in the member-initializer list of the class to which it belongs**. Inherited variables must be initialized by the base.

**Why does this rule exist?** Consider a `const` or reference variable. A `const` variable **must be initialized at creation time**. If we let a derived class initialize an inherited const member in its own init list, there would be two initialization opportunities — breaking const semantics. So C++ restricts each variable to **one initialization**, and that must happen in the constructor of the class it belongs to.

### 5.3 ❌ Wrong Attempt 2: Assign in the Constructor Body

```cpp
Derived(double cost = 0.0, int id = 0)
    : m_cost{ cost }
{
    m_id = id;       // Compiles, but problematic
}
```

This "works" but has three problems:

1. **Doesn't work for const or reference members** — they must have their value at initialization
2. **Inefficient**: m_id is assigned twice (first default-initialized in the Base constructor, then assigned here)
3. **The Base constructor can't use this value**: if the Base constructor needs m_id, it hasn't been set at that moment

### 5.4 ✅ The Correct Way: Call the Base Constructor in the Derived Init List

```cpp
class Derived: public Base
{
public:
    double m_cost {};

    Derived(double cost = 0.0, int id = 0)
        : Base{ id }       // ✅ Calls Base(int), passing id
        , m_cost{ cost }
    {
    }
};
```

Full execution flow (detailed version):

```cpp
Derived derived{ 1.3, 5 };
```

1. Memory is allocated for derived
2. `Derived(double, int)` is called with cost = 1.3, id = 5
3. The compiler sees we specified `Base{ id }` — calls `Base(int)`, passing id = 5
4. Base's init list sets m_id to 5
5. Base's constructor body runs (does nothing here)
6. Base's constructor returns
7. Derived's init list sets m_cost to 1.3
8. Derived's constructor body runs (does nothing here)
9. Derived's constructor returns

> 💡 **Key Insight**: **regardless of where the Base call is placed in the Derived init list**, it **always runs first** (the base must be constructed first).

### 5.5 Now We Can Set Members Back to private

We made members public earlier for simplicity. Now that we have proper construction, restore private:

```cpp
class Base
{
private:                  // ✅ back to private
    int m_id {};
public:
    Base(int id = 0) : m_id{ id } { }
    int getId() const { return m_id; }
};

class Derived: public Base
{
private:                  // ✅ back to private
    double m_cost {};
public:
    Derived(double cost = 0.0, int id = 0)
        : Base{ id }      // Initialize the inherited member through the Base constructor
        , m_cost{ cost }
    {
    }
    double getCost() const { return m_cost; }
};
```

> ⚠️ **Core rule (for now)**: a derived class **cannot directly access** the private members of its base — only through the base's public accessors (such as getId()). The next section on protected will extend this rule.

### 5.6 Constructor Calls in a Multi-Level Chain

> Corresponds to the "Inheritance chains" subsection of LearnCpp 24.4

```cpp
class A {
public:
    A(int a) { std::cout << "A: " << a << '\n'; }
};

class B : public A {
public:
    B(int a, double b) : A{ a }
    {
        std::cout << "B: " << b << '\n';
    }
};

class C : public B {
public:
    C(int a, double b, char c) : B{ a, b }
    {
        std::cout << "C: " << c << '\n';
    }
};

int main()
{
    C c{ 5, 4.3, 'R' };
    return 0;
}
```

Output:

```
A: 5
B: 4.3
C: R
```

> ⚠️ **Important restriction**: **a derived class's constructor can only call its direct parent's constructor**. C cannot call A's constructor directly; C calls B, B calls A.

### 5.7 Destructors

When a derived class is destroyed, its destructors are called **in reverse of construction order**:

```
Construction: A → B → C
Destruction:  C → B → A
```

### 5.8 ⚠️ Warning: When a Base Has Virtual Functions, the Destructor Must Also Be virtual

> The warning from LearnCpp 24.4 (and echoed in 25.7):

> ⚠️ If a base class has virtual functions, **the destructor must also be virtual**, otherwise certain situations lead to **undefined behavior**. See LearnCpp 25.4 for details.

PPT page 25 also stresses: "**virtual destructor is required for hierarchy with virtual functions**".

Short reason: when you point to a Derived object via `Base*` and `delete` that pointer, if the destructor is not virtual, **only Base's destructor is called** and the Derived part leaks.

### 5.9 LearnCpp Quiz: Fruit Inheritance

> This is the LearnCpp 24.4 exercise; the full answer is given as an integrated drill

```cpp
#include <iostream>
#include <string>
#include <string_view>

class Fruit
{
private:
    std::string m_name;
    std::string m_color;

public:
    Fruit(std::string_view name, std::string_view color)
        : m_name{ name }, m_color{ color }
    {
    }

    const std::string& getName() const { return m_name; }
    const std::string& getColor() const { return m_color; }
};

class Apple : public Fruit
{
private:
    double m_fiber;

public:
    Apple(std::string_view name, std::string_view color, double fiber)
        : Fruit{ name, color },
          m_fiber{ fiber }
    {
    }

    double getFiber() const { return m_fiber; }
};

std::ostream& operator<<(std::ostream& out, const Apple& a)
{
    out << "Apple(" << a.getName() << ", " << a.getColor() << ", " << a.getFiber() << ')';
    return out;
}

class Banana : public Fruit
{
public:
    Banana(std::string_view name, std::string_view color)
        : Fruit{ name, color }
    {
    }
};

std::ostream& operator<<(std::ostream& out, const Banana& b)
{
    out << "Banana(" << b.getName() << ", " << b.getColor() << ')';
    return out;
}

int main()
{
    const Apple a{ "Red delicious", "red", 4.2 };
    std::cout << a << '\n';

    const Banana b{ "Cavendish", "yellow" };
    std::cout << b << '\n';

    return 0;
}
```

Output:

```
Apple(Red delicious, red, 4.2)
Banana(Cavendish, yellow)
```

> 💡 Note: because a, b are const, all accessors (`getName()`, `getColor()`, `getFiber()`) must be const methods.

---

## 6. Inheritance and Access Control (public / protected / private)

> Corresponds to LearnCpp 24.5 + PPT pages 10-11

### 6.1 Review: private vs public

| Specifier | Who can access |
|---|---|
| `public` | **Everyone** (outside the class, derived classes, internal — all OK) |
| `private` | **Only** the class's own member functions and friends |

**Key question**: can a derived class access the base's private members? ❌ **No**!

```cpp
class Base
{
private:
    int m_private {};   // Only Base's members/friends can access
public:
    int m_public {};    // Anyone can access
};
```

### 6.2 The Third Access Specifier: protected

> ⚠️ **New concept**: we've only seen public and private; now we add **protected**.

`protected` allows:
- The class's own member functions ✅
- The class's friends ✅
- **Derived classes' member functions** ✅
- Code outside the class ❌

```cpp
class Base
{
public:
    int m_public {};       // Everyone can access
protected:
    int m_protected {};    // Self + friends + derived classes can access
private:
    int m_private {};      // Only self + friends (not derived classes either)
};

class Derived: public Base
{
public:
    Derived()
    {
        m_public = 1;     // ✅ Allowed: derived can access inherited public
        m_protected = 2;  // ✅ Allowed: derived can access inherited protected
        m_private = 3;    // ❌ Not allowed: derived cannot access inherited private
    }
};

int main()
{
    Base base;
    base.m_public = 1;     // ✅ Allowed: external access to public
    base.m_protected = 2;  // ❌ Not allowed: external can't access protected
    base.m_private = 3;    // ❌ Not allowed: external can't access private
}
```

### 6.3 When Should You Use protected?

protected lets derived classes access base members **directly**. But that means: **if you later change the type or meaning of this attribute, every derived class must follow**.

| Scenario | Recommendation |
|---|---|
| You (or the team) will derive this class extensively, and the count of derived classes is manageable | ✅ Use protected |
| This class will be used externally, derived classes are not yours to manage | ❌ Use private and expose setters/getters |

> 💡 **Best Practice** (LearnCpp):
> **Prefer private; do not casually use protected.**
> Private allows the base's internal implementation to change freely without affecting derived classes.
> The cost is a larger public/protected interface in the base.

### 6.4 PPT Klefstad Version: Vector v2

> Klefstad PPT page 11 demonstrates protected's practical use:

```cpp
class Vector
{
private:
    int *buf;
    int sz;
protected:
    // Let derived classes access internal representation directly
    int & element(int i)         { return buf[i]; }
    int   in_range(int i)        { return i >= 0 && i < sz; }
    int & vector_size()          { return sz; }
public:
    int & operator[](int index)
    {
        if (in_range(index))
            return element(index);
        // error(...);
    }
    // ...
};
```

> 💡 This design lets derived classes (like CheckedVector) access the internal array efficiently, without going through public `operator[]` (which would have bounds-check overhead).

### 6.5 Python ↔ C++ Comparison

| Concept | Python | C++ |
|---|---|---|
| Public | `attr` | `public:` |
| "Private" convention | `_attr` (single underscore, "internal use" by convention) | `private:` (enforced) |
| "Strong private" | `__attr` (double underscore, name mangling) | (no equivalent) |
| protected (derivable access) | (no enforcement, by `_attr` convention) | `protected:` |

> ⚠️ Python has no real access control — even `__attr` is just name mangling and can be bypassed. C++ is **enforced at compile time**.

---

## 7. Three Inheritance Modes (public / protected / private inheritance)

> Corresponds to the second half of LearnCpp 24.5 + PPT page 27

### 7.1 The Three Inheritance Modes

```cpp
class Pub : public Base    {};   // public inheritance
class Pro : protected Base {};   // protected inheritance
class Pri : private Base   {};   // private inheritance
class Def : Base           {};   // unspecified defaults to private (for class)
```

> ⚠️ **Special rule**:
> - `class` defaults to private inheritance
> - `struct` defaults to public inheritance
> (consistent with the rules for default member access)

### 7.2 Core Concept: How the Inheritance Mode Changes Inherited Member Visibility

> 💡 **Key Insight**: the inheritance mode **only affects how outsiders (and subsequent derived classes) see** these inherited members;
> it **does not affect the derived class's own access** to those members (that depends only on the original access specifier).

### 7.3 Full Lookup Table (memorize)

| Specifier in base | After public inheritance | After protected inheritance | After private inheritance |
|:---:|:---:|:---:|:---:|
| `public` | `public` | `protected` | `private` |
| `protected` | `protected` | `protected` | `private` |
| `private` | **inaccessible** | **inaccessible** | **inaccessible** |

> 📌 **Mnemonic**:
> - **public inheritance**: leaves things as-is
> - **protected inheritance**: public is downgraded to protected, others unchanged
> - **private inheritance**: every accessible member is downgraded to private
> - **private is never accessible** (regardless of inheritance mode)

### 7.4 Public Inheritance (most common)

```cpp
class Pub: public Base
{
    // Under public inheritance:
    // - inherited public members stay public
    // - inherited protected members stay protected
    // - inherited private members are inaccessible
};
```

> 💡 **Best Practice**: **unless there is a special reason, use public inheritance**.

### 7.5 Private Inheritance (rare)

```cpp
class Pri: private Base
{
    // Under private inheritance:
    // - inherited public members become private
    // - inherited protected members become private
    // - inherited private members remain inaccessible
public:
    Pri()
    {
        m_public = 1;     // ✅ Derived class internals can access (now private in Pri)
        m_protected = 2;  // ✅ Derived class internals can access
        m_private = 3;    // ❌ Still inaccessible
    }
};

int main()
{
    Pri pri;
    pri.m_public = 1;    // ❌ Now private inside Pri, external code cannot access!
}
```

Application of private inheritance: a derived class **uses the base as an internal implementation**, but doesn't want outsiders to use it as "a subtype of the base." For instance, implementing Stack from Vector (Stack uses Vector internally but doesn't want users calling `operator[]` on it).

### 7.6 Protected Inheritance (even rarer)

Almost never used. From the table, both public and protected become protected, so **outsiders cannot access any inherited members**, but derived classes can.

### 7.7 PPT Klefstad Aphorism

> Klefstad PPT page 27 stresses:
>
> "**implementation is a misuse of public inheritance**"
> (using inheritance for "implementation reuse" is a **misuse** of public inheritance — there is no real is-a relationship)
>
> "Subscript on a stack — not allowed!" (operations on the base class may not apply to the derived class)

### 7.8 Comprehensive Example (end of LearnCpp 24.5)

```cpp
class Base
{
public:
    int m_public {};
protected:
    int m_protected {};
private:
    int m_private {};
};

class D2 : private Base
{
    // private inheritance:
    // m_public  → private
    // m_protected → private
    // m_private inaccessible
public:
    int m_public2 {};
protected:
    int m_protected2 {};
private:
    int m_private2 {};
};

class D3 : public D2
{
    // public inheritance from D2:
    // m_public2 stays public (in D3)
    // m_protected2 stays protected
    // m_private2 inaccessible
    // Base's m_public and m_protected became private inside D2,
    // so D3 has no access to them at all!
};
```

> ⚠️ D3 inherits Base indirectly through D2, but because D2 used private inheritance from Base, **none of Base's members are accessible to D3** — even those originally public.

---

## 8. Adding New Functionality to a Derived Class

> Corresponds to LearnCpp 24.6

### 8.1 The Core Benefit of a Derived Class

One of the biggest benefits of inheritance: **code reuse** + **extending functionality**. In a derived class you can:

1. ✅ Add new functionality
2. ✅ Modify/redefine existing functionality
3. ✅ Hide unwanted functionality (24.8 content, may not belong to Week 6)

### 8.2 Basic Scenario

```cpp
class Base
{
protected:
    int m_value {};

public:
    Base(int value) : m_value{ value } { }
    void identify() const { std::cout << "I am a Base\n"; }
};

class Derived: public Base
{
public:
    Derived(int value) : Base{ value } { }
};
```

### 8.3 Why "Add New Functionality in a Derived Class"?

LearnCpp lists three common scenarios:

1. **Base class is third-party**: you just bought a third-party code library and want to extend it. Modifying the source directly doesn't work — your changes will be lost or hard to merge in the next upgrade.
2. **Base class is from the standard library**: standard-library classes (like `std::vector`) — you can't modify the source at all.
3. **Base class is from a precompiled library**: only the `.h` header, no source.

**Best solution**: derive a new class and add the functionality you need.

### 8.4 In Practice

```cpp
class Derived: public Base
{
public:
    Derived(int value) : Base{ value } { }

    int getValue() const { return m_value; }   // ← new functionality
};
```

> 💡 **Key Insight**: because `m_value` is **protected** in Base, Derived can **access it directly**. If it were private, you'd have to go through a public interface.

```cpp
int main()
{
    Derived derived { 5 };
    std::cout << "derived has value " << derived.getValue() << '\n';
    return 0;
}
// Output: derived has value 5
```

### 8.5 ⚠️ The Reverse Doesn't Work: A Base Cannot Access Derived Members

```cpp
int main()
{
    Base base { 5 };
    std::cout << base.getValue() << '\n';  // ❌ Compile error! Base has no getValue()
}
```

> 💡 **Core rule**:
> - **Derived is-a Base** → Derived can access members visible in Base
> - **Base is NOT-a Derived** → Base has no knowledge of Derived's existence
>
> Analogy: you know who your ancestors are (family tree), but ancestors didn't know you would later be born.

---

## 9. Calling Inherited Functions and Overriding (Redefining) Behavior

> Corresponds to LearnCpp 24.7

### 9.1 Core Rule of Function Resolution

> 💡 **Key Rule**: when a member function is called on a derived object, the compiler:
> 1. **First looks in the derived class** for a function of that name
> 2. If it finds **any** function with that name (even with a non-matching signature), **overload resolution happens within that class** — it **does not** then search the base
> 3. Only if the derived class has **no** function of that name does it walk up to the base

### 9.2 Derived Has No Same-Name Function → Calls the Base Version

```cpp
class Base
{
public:
    void identify() const { std::cout << "Base::identify()\n"; }
};

class Derived: public Base
{
    // Doesn't define identify()
};

int main()
{
    Derived derived {};
    derived.identify();   // The compiler doesn't find one in Derived, walks up to Base::identify()
}
// Output: Base::identify()
```

### 9.3 Redefining a Function ("override" in the loose sense, but not virtual override)

```cpp
class Derived: public Base
{
public:
    void identify() const { std::cout << "Derived::identify()\n"; }   // redefinition
};

int main()
{
    Derived derived {};
    derived.identify();   // calls Derived::identify()
}
// Output: Derived::identify()
```

### 9.4 ⚠️ Redefinition ≠ override (virtual function override)

> 💡 Important distinction: **the "redefinition" in this section is conceptually different from the virtual override of section 11**.
> - **Redefinition** (no virtual): only takes effect when called via the object itself or a derived-class reference — compile-time binding
> - **override** (with virtual): can call the derived version through a base pointer/reference — runtime binding
>
> We'll discuss virtual functions in detail in section 11.

### 9.5 A Redefined Function Can Change the Access Specifier

> ⚠️ Interestingly: a redefined function in a derived class **does not inherit** the access specifier of the same-name base function; it uses **the specifier under which it is declared**.

```cpp
class Base
{
private:                        // Note: private
    void print() const { std::cout << "Base"; }
};

class Derived : public Base
{
public:                         // Note: public
    void print() const { std::cout << "Derived "; }
};

int main()
{
    Derived derived {};
    derived.print();    // ✅ Calls Derived::print(), which is public — accessible from outside
}
```

### 9.6 Calling the Base Version from the Derived Function ("extend on top of base")

Sometimes you don't want to fully replace the base function — you want to "add a little."

```cpp
class Base
{
public:
    void identify() const { std::cout << "Base::identify()\n"; }
};

class Derived: public Base
{
public:
    void identify() const
    {
        std::cout << "Derived::identify()\n";
        Base::identify();   // ← explicitly call the base version
    }
};

int main()
{
    Derived derived {};
    derived.identify();
}
```

Output:

```
Derived::identify()
Base::identify()
```

### 9.7 ⚠️ Never Forget the `Base::` Prefix — Otherwise Infinite Recursion!

```cpp
class Derived: public Base
{
public:
    void identify() const
    {
        std::cout << "Derived::identify()\n";
        identify();   // ❌ Infinite recursion! This calls the current class (Derived)'s identify()
    }
};
```

> 💡 **Key Insight**: inside a member function, a function call without a prefix **defaults to the current class**. To call the base version, you must write `Base::identify()` — **the scope-resolution operator `::` is not optional**.

### 9.8 Calling a Base's Friend Function: Use static_cast to a Base Reference

> This is the advanced part of LearnCpp 24.7

A friend function (like `operator<<`) **is not a member of the base**, so it can't be called as `Base::operator<<`. The solution: use `static_cast` to temporarily treat the derived object as a base object:

```cpp
class Base
{
public:
    friend std::ostream& operator<< (std::ostream& out, const Base&)
    {
        out << "In Base\n";
        return out;
    }
};

class Derived: public Base
{
public:
    friend std::ostream& operator<< (std::ostream& out, const Derived& d)
    {
        out << "In Derived\n";
        // Cast Derived to const Base& to call the base's operator<<
        out << static_cast<const Base&>(d);
        return out;
    }
};

int main()
{
    Derived derived {};
    std::cout << derived << '\n';
}
```

Output:

```
In Derived
In Base
```

### 9.9 ⚠️ Same-Name Function in Derived → All Same-Name Functions in Base Are "Hidden"

> A big trap (the core of the second half of LearnCpp 24.7):

```cpp
class Base
{
public:
    void print(int)    { std::cout << "Base::print(int)\n"; }
    void print(double) { std::cout << "Base::print(double)\n"; }
};

class Derived: public Base
{
public:
    void print(double) { std::cout << "Derived::print(double)\n"; }
    // No print(int) defined
};

int main()
{
    Derived d{};
    d.print(5);   // What's called?
}
```

Intuition: 5 is an int, should match `Base::print(int)`, right?

**Actual**: it calls **`Derived::print(double)`**!

**Why?** The compiler **finds a** function named print in Derived, so **overload resolution happens only in Derived**. Base's `print(int)` is not considered at all, even though it would be the better match.

### 9.10 Solution: using-declaration

```cpp
class Derived: public Base
{
public:
    using Base::print;   // ← bring all of Base's print overloads into Derived's overload set
    void print(double) { std::cout << "Derived::print(double)\n"; }
};

int main()
{
    Derived d{};
    d.print(5);   // Now calls Base::print(int) (the better match)
}
```

> 💡 `using Base::print;` tells the compiler to also include all functions named print in Base when doing overload resolution.

### 9.11 PPT Klefstad Doesn't Cover This Section Specifically, But It Connects with Section 11

LearnCpp 24.7 talks about **plain functions** being redefined. Klefstad's PPT mostly skips this section and **goes straight into virtual functions**. Reason: in real projects you almost never use plain "redefinition" (unless for certain mixin designs); in practice it's always **virtual functions**.

But exams may test non-virtual redefinition, so this section is still worth mastering.


---

## 10. Base-Class Pointers/References Pointing to Derived Objects

> Corresponds to LearnCpp 25.1 + PPT pages 12-13

### 10.1 Recap: The "Two-Part" Memory Model of a Derived Object

```
Derived object:
+---------------+
|  Base part    |  ← initialized by the Base constructor
+---------------+
|  Derived part |  ← initialized by the Derived constructor
+---------------+
```

### 10.2 Pointing to a Derived Object Through a Derived Pointer/Reference (intuitive)

```cpp
class Base
{
protected:
    int m_value {};
public:
    Base(int value) : m_value{ value } { }
    std::string_view getName() const { return "Base"; }
    int getValue() const { return m_value; }
};

class Derived: public Base
{
public:
    Derived(int value) : Base{ value } { }
    std::string_view getName() const { return "Derived"; }
    int getValueDoubled() const { return m_value * 2; }
};

int main()
{
    Derived derived{ 5 };
    Derived& rDerived{ derived };    // derived reference
    Derived* pDerived{ &derived };   // derived pointer

    std::cout << derived.getName() << '\n';     // "Derived"
    std::cout << rDerived.getName() << '\n';    // "Derived"
    std::cout << pDerived->getName() << '\n';   // "Derived"
}
```

Output:

```
Derived
Derived
Derived
```

### 10.3 ⚡ The Key Capability: Pointing to a Derived Object Through a **Base Pointer/Reference**

```cpp
int main()
{
    Derived derived{ 5 };

    Base& rBase{ derived };      // ✅ Legal! Base reference points to derived object
    Base* pBase{ &derived };     // ✅ Legal! Base pointer points to derived object

    std::cout << derived.getName() << '\n';   // "Derived"
    std::cout << rBase.getName() << '\n';     // "Base"   ← Note!
    std::cout << pBase->getName() << '\n';    // "Base"   ← Note!
}
```

Output:

```
Derived
Base
Base
```

### 10.4 ⚠️ Why "Base"?

> 💡 **Core principle**: because rBase and pBase are **Base references/pointers**, they **can only see** members in the Base part (including everything Base inherited from above). Even though Derived redefined `getName()`, the Base reference can't see the Derived part — so it calls `Base::getName()`.

Similarly: through pBase you also can't call Derived's `getValueDoubled()` — compile error.

> This is exactly **what virtual functions are designed to solve** — see the next section.

### 10.5 PPT Klefstad Version (pages 12-13)

```cpp
Menu m;
Window & w = m;        // OK: Menu is a kind of Window
Screen * ps = & w;     // OK: Window is a kind of Screen
```

The PPT uses expressions like "Animal & rA = c;" to stress "derived classes introduce a subtype of base class" — derived classes are **subtypes** of the base.

### 10.6 Why Do We Need "Base Pointers/References to Derived Objects"?

LearnCpp 25.1 gives two core scenarios:

#### Scenario 1: Write a Function That Handles All Derived Classes

Without a base pointer, you'd need an overload for each derived class:

```cpp
void report(const Cat& cat) { ... }
void report(const Dog& dog) { ... }
// ... 30 kinds of animals → 30 report functions?
```

With a base reference:

```cpp
void report(const Animal& rAnimal)
{
    std::cout << rAnimal.getName() << " says " << rAnimal.speak() << '\n';
}
```

A **single** function can handle all of Animal's derived classes! This is the foundation of **polymorphism**.

> 💡 **Klefstad aphorism (PPT page 12)**:
> "**polymorphic programming** — new subtypes can be added to a system without changing framework"
> (new derived classes don't require changes to framework code)

#### Scenario 2: Heterogeneous Object Arrays

Arrays can hold only one type. To mix Cat and Dog:

```cpp
const Cat fred{ "Fred" };
const Dog garbo{ "Garbo" };
// ...

const auto animals{ std::to_array<const Animal*>(
    { &fred, &garbo, &misty, &pooky, &truffle, &zeke }
) };

for (const auto animal : animals)
    std::cout << animal->getName() << " says " << animal->speak() << '\n';
```

This way you can **mix different kinds of animals into one array** and process them uniformly.

### 10.7 ⚠️ Current Problem: Still Calling the Base Version Only!

Without virtual, all the `speak()` calls above resolve to `Animal::speak()`:

```
Fred says ???       ← not "Meow"
Garbo says ???      ← not "Woof"
Misty says ???
Pooky says ???
Truffle says ???
Zeke says ???
```

> 💡 This is exactly **the core problem virtual functions solve** — answer in the next section.

### 10.8 Klefstad's Classic Polymorphic Example in PPT

```cpp
void rotate_all(Shape * vec[], int size, int angle)
{
    for (int i = 0; i < size; i++)
        vec[i]->rotate(angle);   // Which rotate is called? Depends on vec[i]'s actual type
}
```

The PPT stresses:
- **Static type**: the declared type, e.g. `Shape *`
- **Dynamic type**: the actual referenced type, e.g. `Circle`, `Triangle`

Only **virtual functions** make `vec[i]->rotate()` resolve to the dynamic type's method.

---

## 11. Virtual Functions and Runtime Polymorphism

> Corresponds to LearnCpp 25.2 + PPT pages 17-22

### 11.1 Definition of a Virtual Function

> 💡 **Core definition**: a **virtual function** is a special member function which, when called, resolves to the most-derived version corresponding to the **actual type** of the object.

In short: **virtual makes it possible for a base pointer/reference to call the derived version**.

### 11.2 Declaring a Virtual Function

Add the `virtual` keyword before the function declaration:

```cpp
class Base
{
public:
    virtual std::string_view getName() const { return "Base"; }
};

class Derived: public Base
{
public:
    virtual std::string_view getName() const { return "Derived"; }   // virtual is optional but recommended
};

int main()
{
    Derived derived {};
    Base& rBase{ derived };
    std::cout << "rBase is a " << rBase.getName() << '\n';
}
```

Output:

```
rBase is a Derived       ← Now it calls Derived::getName()!
```

### 11.3 What Counts as an "override"?

For a derived function to be considered an **override** of a base virtual function, it must satisfy:

| Requirement | Notes |
|---|---|
| **Same name** | Function names must be identical |
| **Same parameter list** | Parameter types and count must match exactly |
| **Same const-ness** | Both must be const, or neither |
| **Same return type** (generally) | Return types must match (covariant return type is the exception, next section) |

> ⚠️ **A signature off by even a little** does not count as an override. For example:
> - Base is const, derived isn't → ❌ not an override (see 25.2 Quiz 1e)
> - Different parameter type → ❌ not an override

### 11.4 PPT Klefstad Version

```cpp
struct Base {
    virtual int virtual_fn();
    int non_virtual_fn();
};

struct Derived : public Base {
    int virtual_fn() override;       // virtual can be omitted on override, but override is strongly recommended
    int non_virtual_fn();             // not a virtual override (hides the base version)
};
```

> 💡 **Klefstad aphorism**:
> "**preferred style is to include virtual when overriding**"
> (When overriding a virtual function, **it's best to still include the virtual keyword** for readability)
>
> "**once virtual, always virtual**"
> (Once a base function is virtual, all matching overrides in derived classes are automatically virtual — even if you don't write virtual)

### 11.5 Virtual Function Resolution in Multi-Level Inheritance

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: virtual std::string_view getName() const { return "B"; } };
class C: public B { public: virtual std::string_view getName() const { return "C"; } };
class D: public C { public: virtual std::string_view getName() const { return "D"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // "C"
}
```

> 💡 Resolution logic: rBase is an A reference, but actually points to a C object. Between A and C there are three levels: A, B, C. The compiler finds the most-derived getName() **between A and C** — `C::getName()`. **It will not call D::getName()**, because c is only a C object — **there is no D part**.

### 11.6 ⚠️ Virtual Function Resolution Only Applies to Pointers/References

> 💡 **Key Insight**: virtual function resolution **only happens when called through a pointer or reference**. **Calling directly on an object always calls the version of the object's own type**.

```cpp
C c {};
std::cout << c.getName();      // Always calls C::getName()

A a { c };                      // Copies the A part of c into a (this is called object slicing — use carefully!)
std::cout << a.getName();      // Always calls A::getName()
```

**Why?** When called through a pointer/reference, the compiler **cannot determine the actual type at compile time** and must decide at runtime. But when called directly through an object, the type is known at compile time.

### 11.7 Two Forms of Polymorphism

> Polymorphism literally means "many forms"

| Type | When resolved | Example |
|---|---|---|
| **Compile-time / static polymorphism** | At compile time | Function overloading, templates |
| **Runtime / dynamic polymorphism** | At runtime, based on actual object type | **Virtual functions** |

### 11.8 Full Animal/Cat/Dog Example (with virtual)

```cpp
#include <iostream>
#include <string>
#include <string_view>

class Animal
{
protected:
    std::string m_name {};

    Animal(std::string_view name) : m_name{ name } { }

public:
    const std::string& getName() const { return m_name; }
    virtual std::string_view speak() const { return "???"; }   // ← virtual
};

class Cat: public Animal
{
public:
    Cat(std::string_view name) : Animal{ name } { }
    virtual std::string_view speak() const { return "Meow"; }
};

class Dog: public Animal
{
public:
    Dog(std::string_view name) : Animal{ name } { }
    virtual std::string_view speak() const { return "Woof"; }
};

void report(const Animal& animal)
{
    std::cout << animal.getName() << " says " << animal.speak() << '\n';
}

int main()
{
    Cat cat{ "Fred" };
    Dog dog{ "Garbo" };

    report(cat);
    report(dog);
}
```

Output:

```
Fred says Meow
Garbo says Woof
```

🎉 **Correct!** When `speak()` is called through an Animal reference, it resolves at runtime to the right derived version.

> 💡 Note: `getName()` is **not declared virtual** — because no derived class overrides it. **Only functions that need to be overridable should be virtual**.

### 11.9 ⚠️ Implicit virtual Rule

> Once a base function is virtual, **all matching overrides in derived classes are implicitly virtual, even without the virtual keyword**.

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: std::string_view getName() const { return "B"; } };  // No virtual written, but still virtual
class C: public B { public: std::string_view getName() const { return "C"; } };  // Same

int main()
{
    C c {};
    B& rBase{ c };
    std::cout << rBase.getName();   // "C" — B::getName() is implicitly virtualized
}
```

> ⚠️ **The reverse does not hold**: marking the derived virtual but not the base **does not make the base function virtual**. So **always start declaring virtual at the base**.

### 11.10 Classic LearnCpp 25.2 Quizzes (frequently tested)

#### Quiz 1a

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: virtual std::string_view getName() const { return "B"; } };
class C: public B { public: /* no getName() */ };
class D: public C { public: virtual std::string_view getName() const { return "D"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**Answer: B**

> 💡 Resolution: rBase is an A reference pointing to a C object. The most-derived getName between A and C is `B::getName()` (because C doesn't define one). **D won't be called**, because the object is C, not D.

#### Quiz 1c (the most commonly forgotten trap)

```cpp
class A { public: std::string_view getName() const { return "A"; } };  // ⚠️ no virtual
class B: public A { public: virtual std::string_view getName() const { return "B"; } };
class C: public B { public: virtual std::string_view getName() const { return "C"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**Answer: A**

> ⚠️ **Trap**: A isn't virtual, **and B and C declaring virtual won't save it**. The base must be marked virtual first.

#### Quiz 1d (implicit virtual)

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: std::string_view getName() const { return "B"; } };  // virtual not written
class C: public B { public: std::string_view getName() const { return "C"; } };  // virtual not written

int main()
{
    C c {};
    B& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**Answer: C**

> 💡 A is virtual → B, C are implicitly virtual too. rBase is a B reference; the most-derived between B and C is C::getName() → "C".

#### Quiz 1e (const inconsistency)

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: virtual std::string_view getName() { return "B"; } };  // ⚠️ not const
class C: public B { public: virtual std::string_view getName() { return "C"; } };
class D: public C { public: virtual std::string_view getName() { return "D"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**Answer: A**

> ⚠️ **Trap**: B, C, D's getName() **are not const** — so they **don't count as overrides**! They are new "virtual functions" that don't match A's getName. So rBase.getName() looks for the most-derived version between A and C with A::getName()'s signature — only A itself.

#### Quiz 1f (calling virtual functions in constructors)

```cpp
class A {
public:
    A() { std::cout << getName(); }    // ⚠️ Calling a virtual function in the constructor!
    virtual std::string_view getName() const { return "A"; }
};

class B : public A { public: virtual std::string_view getName() const { return "B"; } };
class C : public B { public: virtual std::string_view getName() const { return "C"; } };

int main()
{
    C c {};
}
```

**Answer: A**

> ⚠️ **Critically important trap**: when constructing C, the A part is built first. Inside A's constructor, calling the virtual getName() — at this moment **the B and C parts have not yet been constructed** — so it resolves to `A::getName()`.
>
> This is why LearnCpp introduces the **Best Practice: never call virtual functions from constructors or destructors!**

### 11.11 ⚠️ Best Practice: Don't Call Virtual Functions in Constructors/Destructors

> 💡 **Key principle**:
> - **In constructors**: derived parts haven't been constructed yet, so a virtual call resolves to the class currently being constructed — not the most-derived class
> - **In destructors**: derived parts have already been destroyed, so a virtual call resolves to the current class
>
> Neither achieves "dynamic polymorphism" and instead misleads beginners.

### 11.12 Cost of Virtual Functions

> From the end of LearnCpp 25.2

Why not mark every function virtual?

1. **Performance overhead**: virtual function resolution is slower than a normal function (vtable lookup)
2. **Memory overhead**: every class with virtual functions needs an extra pointer (vptr) per object

So: **only mark functions virtual that genuinely need to be overridden by derived classes**.

### 11.13 Return Types Must Match (general rule)

```cpp
class Base {
public:
    virtual int getValue() const { return 5; }
};

class Derived: public Base {
public:
    virtual double getValue() const { return 6.78; }  // ❌ Compile error! Different return types
};
```

> ⚠️ Derived::getValue is not considered a valid override of Base::getValue, fails to compile.

Exception: **covariant return type** — the Derived version may return a pointer/reference to a derived class of what the Base version returns. Discussed in detail in 25.3 (probably Week 7).

### 11.14 Klefstad's PPT Design Advice on virtual

> PPT page 18 gives the Shape hierarchy's virtual usage:

```cpp
class Shape {
public:
    virtual void rotate(int degrees);   // Base provides default implementation
};

class Circle : public Shape {
public:
    virtual void rotate(int degree) override { /* nothing - no-op */ }   // A circle rotated is still a circle
};

class Rectangle : public Shape {
public:
    virtual void rotate(int degree) override;   // Rectangle needs a specific implementation
};
```

> 💡 **Klefstad's design philosophy**:
> "static binding: **homogeneous** set of similar objects" (use static binding for "homogeneous" object collections)
> "dynamic binding: **heterogeneous** mix of objects" (use dynamic binding for "heterogeneous" object collections)

Examples:
- `Vector`, `CheckedVector`, `InitVector` — all variants of vector, **use static binding** (just inherit to reuse code)
- `Shape`, `Circle`, `Triangle`, `Rectangle` — different shapes, **use dynamic binding** (need different draw, rotate implementations)

---

## 12. Static Binding vs. Dynamic Binding

> Corresponds to PPT pages 14-15 (no dedicated reading section, but pervasive in 25.1, 25.2)

### 12.1 Definitions

| Binding type | When the function call is decided | Trigger |
|---|---|---|
| **Static binding / early binding** | **At compile time** | Plain function calls, non-virtual member functions |
| **Dynamic binding / late binding** | **At runtime** | Calling a **virtual function** through a pointer/reference |

### 12.2 PPT Classic Comparison Example

```cpp
CheckedVector cv(20);
Vector & vp = cv;
do_something_with(vp[0]);
```

Which version of `operator[]` is called by `vp[0]`?

| Assumption | What's called |
|---|---|
| Static binding (`operator[]` is not virtual) | `Vector::operator[]` — based on vp's **declared type** |
| Dynamic binding (`operator[]` is virtual) | `CheckedVector::operator[]` — based on the **object type** vp actually points to |

### 12.3 When to Use Static Binding?

> Klefstad PPT page 15 summary:

**Static binding fits**:
- Processing "**homogeneous**" object collections (a group of similar objects)
- Inheritance is used to **reuse** the base implementation, no "shape-shifting" needed
- E.g.: `Vector`, `CheckedVector`, `InitVector`, `InitCheckedVector` — basically the same with minor behavior differences

### 12.4 When to Use Dynamic Binding?

**Dynamic binding fits**:
- Processing "**heterogeneous**" object collections (sharing an interface but with very different implementations)
- Each derived class implementation differs significantly
- E.g.: `Shape`, `Circle`, `Triangle`, `Rectangle`, `Square` — all Shape, but draw, rotate are entirely different implementations

### 12.5 PPT Klefstad Aphorism

> Topic 6 page 19:
> "**polymorphism**: when the specific operation invoked by a call depends on the type of an object"
>
> "**static polymorphism**: via overloading"
>
> "**dynamic polymorphism**: via virtual functions
>   - allow defining **plugin frameworks**
>   - browser plugins, Vehicles, Shapes, GUI Widgets"

### 12.6 An Extension of Dynamic Binding: Extensible Frameworks

> PPT page 22

The biggest benefit of virtual functions: **framework code stays unchanged, new derived classes adapt automatically**.

```cpp
// Add a new Square class
class Square : public Rectangle {
public:
    virtual void rotate(int degree) override {
        if (degree % 90 != 0)
            Rectangle::rotate(degree);
    }
};

// Framework code does not need to change at all:
void rotate_all(Shape * vec[], int size, int angle)
{
    for (int i = 0; i < size; i++)
        vec[i]->rotate(angle);   // Automatically calls Square::rotate (if any)
}
```

> 💡 This is one of the core powers of object-oriented design: **the Open-Closed Principle** — open to extension, closed to modification.

### 12.7 By Pointer/Reference vs. By Value

> Stressed in PPT page 20

```cpp
void rotate_shape(Shape * sp, int degrees) { sp->rotate(degrees); }   // ✅ polymorphic
void rotate_shape(Shape & sr, int degrees) { sr.rotate(degrees); }    // ✅ polymorphic
void rotate_shape(Shape s, int degrees)    { s.rotate(degrees); }     // ❌ object slicing!
```

> ⚠️ **Never pass a base object by value**! If you pass in a Circle, **the Circle part is sliced off**, leaving only the Shape part — this is **object slicing**, see 25.9 (Week 7).

---

## 13. Pure Virtual Functions, Abstract Base Classes, and Interface Classes

> Corresponds to LearnCpp 25.7 + PPT pages 23-24

### 13.1 Pure Virtual Function

> 💡 **Core definition**: a **pure virtual function** (a.k.a. **abstract function**) is a virtual function with no body, marked with `= 0`. It is just a **placeholder** that derived classes must implement.

Syntax:

```cpp
class Base
{
public:
    std::string_view sayHi() const { return "Hi"; }            // Plain member function

    virtual std::string_view getName() const { return "Base"; }   // Plain virtual function

    virtual int getValue() const = 0;                              // Pure virtual function

    int doSomething() = 0;   // ❌ Compile error: a non-virtual function cannot be = 0
};
```

> ⚠️ **Only virtual functions can be `= 0`**.

### 13.2 The Two Consequences of a Pure Virtual Function

> Core rules to remember:

#### Consequence 1: A Class with a Pure Virtual Function Is an **Abstract Base Class** and **Cannot Be Instantiated**

```cpp
class Base
{
public:
    virtual int getValue() const = 0;
};

int main()
{
    Base base{};   // ❌ Compile error: cannot instantiate an abstract class
}
```

**Why?** Because `getValue()` has no definition, calling `base.getValue()` would be meaningless.

#### Consequence 2: A Derived Class Must Implement **All** Pure Virtual Functions, or **It Becomes Abstract Too**

```cpp
class Cow : public Animal   // Animal has pure virtual speak()
{
public:
    Cow(std::string_view name) : Animal{ name } { }
    // ❌ Forgot to write speak()
};

int main()
{
    Cow cow{"Betsy"};   // ❌ Compile error: Cow is still abstract
}
```

The compiler reports clearly:

```
error: variable type 'Cow' is an abstract class
note: unimplemented pure virtual method 'speak' in 'Cow'
```

### 13.3 Full Animal Example (Pure Virtual Version)

```cpp
#include <string>
#include <string_view>

class Animal   // Abstract base class
{
protected:
    std::string m_name {};

public:
    Animal(std::string_view name) : m_name{ name } { }

    const std::string& getName() const { return m_name; }
    virtual std::string_view speak() const = 0;   // ← pure virtual

    virtual ~Animal() = default;   // ← Must have virtual destructor
};

class Cow : public Animal
{
public:
    Cow(std::string_view name) : Animal(name) { }

    std::string_view speak() const override { return "Moo"; }  // ✅ Must implement
};

int main()
{
    Cow cow{ "Betsy" };
    std::cout << cow.getName() << " says " << cow.speak() << '\n';
}
// Output: Betsy says Moo
```

### 13.4 Pure Virtual Function vs. Plain Virtual Function (with default implementation)

> A common confusion

| Comparison | Plain virtual + default impl | Pure virtual |
|---|---|---|
| Can the base be instantiated | ✅ Yes | ❌ No |
| Derived class **must** implement | ❌ No (can inherit default) | ✅ Yes (otherwise also abstract) |
| Use case | Base usable on its own; derived **may** override | Base is just an **interface**; derived is **forced** to implement |

> 💡 **Design philosophy**: the purpose of a pure virtual function is to **force** derived classes to implement it, preventing them from "forgetting to override."

### 13.5 A Pure Virtual Function Can Also **Have a Definition** (rare, but worth knowing)

```cpp
class Animal   // Abstract base class
{
public:
    Animal(std::string_view name) : m_name{ name } { }

    virtual std::string_view speak() const = 0;   // ← pure virtual but with default impl
    virtual ~Animal() = default;
};

// Note: defined outside the class
std::string_view Animal::speak() const
{
    return "buzz";   // Default implementation
}

class Dragonfly : public Animal
{
public:
    Dragonfly(std::string_view name) : Animal{name} { }

    std::string_view speak() const override
    {
        return Animal::speak();   // Explicitly call the base's default implementation
    }
};

int main()
{
    Dragonfly dfly{"Sally"};
    std::cout << dfly.getName() << " says " << dfly.speak() << '\n';
}
// Output: Sally says buzz
```

> ⚠️ The derived class **still must implement** `speak()` (even if just calling `Animal::speak()`), otherwise it is also abstract.
>
> 💡 **Use case** (rare): the base provides a "reference implementation," and derived classes can choose to call it or write their own.
>
> Also: **a pure virtual destructor must have a definition** — otherwise the base part can't be destructed when destroying a derived object.

### 13.6 Interface Class

> 💡 **Definition**: an **interface class** is a special kind of abstract base class that satisfies:
> - **No member variables**
> - **All functions are pure virtual**
>
> Naming convention: starts with capital **I** (e.g. IErrorLog, IRunnable, IComparable).

Example:

```cpp
class IErrorLog
{
public:
    virtual bool openLog(std::string_view filename) = 0;
    virtual bool closeLog() = 0;
    virtual bool writeError(std::string_view errorMessage) = 0;

    virtual ~IErrorLog() {}   // Must have virtual destructor
};
```

Any class inheriting IErrorLog **must** implement these three functions to be instantiable.

### 13.7 Practical Use of an Interface Class

Suppose we want to write a `mySqrt()` function that logs an error on failure.

❌ **Inflexible**: directly coupled to `FileErrorLog`:

```cpp
double mySqrt(double value, FileErrorLog& log)
{
    if (value < 0.0)
    {
        log.writeError("Tried to take square root of value less than 0");
        return 0.0;
    }
    return std::sqrt(value);
}
```

The caller can **only** pass a FileErrorLog — poor extensibility.

✅ **Better**: depend on the interface:

```cpp
double mySqrt(double value, IErrorLog& log)
{
    if (value < 0.0)
    {
        log.writeError("Tried to take square root of value less than 0");
        return 0.0;
    }
    return std::sqrt(value);
}
```

The caller can pass any class implementing IErrorLog:
- `FileErrorLog`: writes a file
- `ScreenErrorLog`: shows a popup
- `EmailErrorLog`: sends an email
- Or define a new subclass — **without changing mySqrt**!

> 💡 This embodies the **Dependency Inversion Principle**: **depend on abstractions, not concrete implementations**.

### 13.8 Interface Classes and Multiple Inheritance

> An extension of LearnCpp 25.7

A reason interface classes are extremely popular in C++: **multiple inheritance of interfaces is safe**.

Plain multiple inheritance (inheriting multiple non-interface classes) easily causes diamond problems and ambiguities, but **multiple inheritance of interfaces**:
- Interfaces have no data members → no memory duplication
- Interfaces have no function implementations → no implementation conflicts

> 💡 This is why modern languages such as Java and C# **forbid** plain multiple inheritance and **only allow** interface multiple inheritance. C++ doesn't enforce this, but with multiple inheritance **prefer all interfaces**.

### 13.9 ⚠️ Must Have a Virtual Destructor

> Repeatedly stressed in LearnCpp 25.7

**Any class with virtual functions (especially abstract base classes and interface classes) must also have a virtual destructor**.

```cpp
class IErrorLog
{
public:
    virtual ~IErrorLog() {}   // ← Required!
    virtual bool writeError(std::string_view) = 0;
    // ...
};
```

**Why?** When deleting a derived object through a base pointer:

```cpp
IErrorLog* log = new FileErrorLog{};
// ... use it ...
delete log;   // If destructor is not virtual, only IErrorLog's is called and FileErrorLog's part leaks!
```

### 13.10 Klefstad PPT Abstract Class Example (pages 23-24)

```cpp
class Shape {
public:
    Shape(int x = 0, int y = 0);
    void move(Point to);                       // Non-virtual, must have a definition
    virtual void draw() = 0;                   // Pure virtual
    virtual void rotate(int degrees) = 0;      // Pure virtual
};
```

> ⚠️ **Klefstad aphorism**:
> "draw() and rotate() can't be written yet, but move() can"
> "**can declare only references or pointers to abstract class**"
> (Can only declare references or pointers to an abstract class, cannot create objects of it)

```cpp
class Circle : public Shape {
protected:
    int radius;
public:
    void draw();   // implementation: code that draws a circle
    void rotate(int degrees) { /* rotated circle is still a circle */ }   // no-op
};

class Rectangle : public Shape {
protected:
    int width, length;
public:
    void draw();
    void rotate(int degrees);   // rectangle rotation code
};
```

### 13.11 Vtable for Abstract Classes

> Trivia from the end of LearnCpp 25.7

For consistency, **abstract classes also have a vtable**. An abstract base class's constructor/destructor can call virtual functions (resolved to the current class's version, because derived parts haven't been constructed or have already been destroyed).

The vtable entry for an abstract class's pure virtual functions is typically a null pointer or points to a "placeholder" function that prints an error (e.g. `__purecall`).

### 13.12 Python ↔ C++ Comparison

| Concept | Python | C++ |
|---|---|---|
| Abstract class | `from abc import ABC` + `@abstractmethod` | `virtual ... = 0;` |
| Interface | Duck typing, no enforcement | Interface class = all pure virtual + no member variables |
| Forced implementation | abstractmethod has it; duck typing doesn't | Pure virtual: enforced at compile time |

**Python equivalent:**

```python
from abc import ABC, abstractmethod

class IErrorLog(ABC):
    @abstractmethod
    def writeError(self, msg): pass

    @abstractmethod
    def openLog(self, filename): pass
```

C++ is **stricter** than Python: at compile time it checks that derived classes implement all pure virtual functions.


---

## 14. dynamic_cast and Downcasting

> Corresponds to LearnCpp 25.10 + PPT page 28

### 14.1 Upcasting vs. Downcasting

| Direction | Name | Safety |
|---|---|---|
| Derived → Base (derived ptr/ref → base ptr/ref) | **upcasting** | ✅ Implicit and safe |
| Base → Derived (base ptr/ref → derived ptr/ref) | **downcasting** | ⚠️ Requires explicit cast, may fail |

**Upcasting** is everywhere:

```cpp
Cat cat{"Fred"};
Animal* pAnimal = &cat;   // upcasting, automatically allowed by C++
```

But the reverse doesn't work:

```cpp
Animal* pAnimal = ...;
Cat* pCat = pAnimal;   // ❌ Compile error
Cat* pCat = (Cat*)pAnimal;   // C-style cast: ❌ Dangerous, no runtime check
```

### 14.2 The Purpose of `dynamic_cast`

> 💡 **Core purpose**: **safely convert a base pointer/reference to a derived pointer/reference** — and check at runtime that it actually points to that derived class.

### 14.3 Basic Usage

```cpp
class Base
{
protected:
    int m_value{};
public:
    Base(int value) : m_value{value} { }
    virtual ~Base() = default;   // ⚠️ Must have a virtual function (virtual destructor) for dynamic_cast to work
};

class Derived : public Base
{
protected:
    std::string m_name{};
public:
    Derived(int value, std::string_view name) : Base{value}, m_name{name} { }
    const std::string& getName() const { return m_name; }
};

Base* getObject(bool returnDerived)
{
    if (returnDerived)
        return new Derived{1, "Apple"};
    else
        return new Base{2};
}

int main()
{
    Base* b{ getObject(true) };

    Derived* d{ dynamic_cast<Derived*>(b) };   // Convert Base* to Derived*

    std::cout << "The name of the Derived is: " << d->getName() << '\n';

    delete b;
}
// Output: The name of the Derived is: Apple
```

### 14.4 ⚠️ Behavior on Failure

If `dynamic_cast` fails (i.e., `b` is not actually a Derived object), it returns **nullptr**.

```cpp
Base* b{ getObject(false) };   // Actually a Base object
Derived* d{ dynamic_cast<Derived*>(b) };   // d == nullptr
d->getName();   // ❌ Dereferencing nullptr → undefined behavior (likely crash)
```

> 🚨 **Rule (LearnCpp emphasizes)**:
> **Always check whether the dynamic_cast result is nullptr**!

Correct version:

```cpp
Base* b{ getObject(true) };
Derived* d{ dynamic_cast<Derived*>(b) };

if (d)   // ← Must check
    std::cout << "The name of the Derived is: " << d->getName() << '\n';

delete b;
```

### 14.5 dynamic_cast with References

```cpp
Derived apple{1, "Apple"};
Base& b{ apple };
Derived& d{ dynamic_cast<Derived&>(b) };   // Reference version
std::cout << d.getName() << '\n';
```

> ⚠️ **Difference**: because **there is no "null reference"**, `dynamic_cast` on a reference **throws `std::bad_cast` on failure**.

### 14.6 dynamic_cast vs. static_cast for Downcasting

| Comparison | static_cast | dynamic_cast |
|---|---|---|
| Runtime check | ❌ None | ✅ Yes |
| Speed | ✅ Fast | ⚠️ Slower (RTTI lookup) |
| Failure behavior | **Undefined behavior** ("succeeds" but actually wrong object) | Returns nullptr or throws bad_cast |
| When to use | When **absolutely sure** you point to a derived object | When uncertain and need a safety check |

> 💡 **Simple rule**:
> - **Upcasting**: use static_cast or implicit conversion
> - **Downcasting**: use dynamic_cast (unless 100% certain)

### 14.7 ⚠️ When dynamic_cast Doesn't Work

LearnCpp 25.10 lists situations where dynamic_cast can't downcast:

1. **Protected or private inheritance**
2. **The class has no virtual functions declared or inherited** — no vtable, dynamic_cast can't find RTTI info
3. **Some complex situations involving virtual base classes**

### 14.8 PPT Klefstad Version (page 28)

```cpp
struct Base {
    int i;
    virtual int foo() { return i; }
};
struct Derived : public Base {
    int j;
    int foo() override { return j; }
};

void f() {
    Base b;
    Derived d;
    Base *bp = &d;       // ✅ OK, a Derived is a Base
    Derived *dp = &b;    // ❌ Wrong, b is NOT a Derived
}
```

> 💡 **Klefstad aphorism (PPT page 28)**:
>
> "**Derived contains a Base** and operations are well defined: `bp->i = 10; bp->foo();`"
>
> "**Base does not contain a Derived** and operations aren't defined: `bp->j = 20;` // not allowed"
>
> "C++ permits conversion from Base to Derived: `bp = static_cast<Base *>(&dp);`"
>
> "**programmer must insure dp operations don't access undefined members**"
>
> "`bp = dynamic_cast<Base *>(&dp);` // **throws bad_cast exception if wrong**"

### 14.9 Prefer Virtual Functions over dynamic_cast When Possible

> Design advice from the end of LearnCpp 25.10

> 💡 **Prefer virtual functions**: don't use dynamic_cast when a virtual function will do. Some developers even argue "dynamic_cast is evil, a sign of bad design."

But there are a few **legitimate uses of dynamic_cast**:

1. **The base class can't be modified** (e.g. standard-library classes — you can't add virtual functions)
2. **The derived class has a specific feature** that doesn't make sense in the base (e.g. the base has no meaningful default to return)
3. **Forcing a virtual function would break the base's design**

### 14.10 dynamic_cast and RTTI

> Bit of trivia from the end of LearnCpp 25.10

**RTTI (Run-Time Type Information)** is a C++ feature that lets a program obtain an object's actual type information at runtime. `dynamic_cast` depends on RTTI to work.

⚠️ Some compilers allow disabling RTTI for performance (saving the extra info in the vtable) — **with RTTI off, dynamic_cast won't work**.

### 14.11 Python ↔ C++ Comparison

| Concept | Python | C++ |
|---|---|---|
| Type check | `isinstance(obj, Derived)` | `if (auto* p = dynamic_cast<Derived*>(b))` |
| Failed cast | `TypeError` exception | dynamic_cast returns nullptr or throws bad_cast |
| Duck typing | No isinstance needed (just see if you can call the method) | Strict typing, requires explicit cast |

---

## 15. Printing Inherited Class Objects with operator<<

> Corresponds to LearnCpp 25.11

### 15.1 Problem: Overloading operator<< Directly Doesn't Polymorph

```cpp
class Base
{
public:
    virtual void print() const { std::cout << "Base"; }

    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        out << "Base";
        return out;
    }
};

class Derived : public Base
{
public:
    void print() const override { std::cout << "Derived"; }

    friend std::ostream& operator<<(std::ostream& out, const Derived& d)
    {
        out << "Derived";
        return out;
    }
};

int main()
{
    Derived d{};
    Base& bref{ d };
    std::cout << bref << '\n';   // What's the output?
}
```

Output:

```
Base
```

> ⚠️ **Not what we wanted**! Calling `<<` through a Base reference invokes `operator<<(std::ostream&, const Base&)`; there is no dynamic dispatch to Derived's version.

### 15.2 Why Can't operator<< Be Made virtual Directly?

LearnCpp 25.11 gives two reasons:

#### Reason 1: Only Member Functions Can Be virtual

> 💡 A friend function **is not** a member of the class, so it **cannot** be virtual.

But we typically write operator<< as a friend (because the left operand is an ostream and can't be a member).

#### Reason 2: Parameter Types Don't Match — Doesn't Count as override

Even if a friend could be virtual, Base's version takes `const Base&` and Derived's takes `const Derived&` — **different parameter types**, so it's not an override.

### 15.3 ✅ The Solution: Delegate "Print Logic" to a Virtual Member Function

> 🌟 **Core pattern**: operator<< is a friend (cannot be virtual), but **the member function it calls** can be virtual.

#### Approach 1: Return a String

```cpp
#include <iostream>

class Base
{
public:
    // friend operator<< (cannot be virtual)
    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        out << b.identify();   // ← Calls a virtual member function
        return out;
    }

    // Virtual member function (can be virtual)
    virtual std::string identify() const
    {
        return "Base";
    }
};

class Derived : public Base
{
public:
    std::string identify() const override
    {
        return "Derived";
    }
};

int main()
{
    Base b{};
    std::cout << b << '\n';      // Calls Base::identify() → "Base"

    Derived d{};
    std::cout << d << '\n';      // Auto-upcast to Base&, b.identify() resolves to Derived → "Derived"

    Base& bref{ d };
    std::cout << bref << '\n';   // Same as above → "Derived"
}
```

Output:

```
Base
Derived
Derived
```

✅ Works perfectly! And **you don't need to write a separate operator<< for every derived class** — one is enough.

### 15.4 Resolution Process (important!)

What each line does:

| Code | Resolution |
|---|---|
| `std::cout << b;` | Matches `operator<<(ostream&, const Base&)`; b is Base; b.identify() → `Base::identify()` → "Base" |
| `std::cout << d;` | Compiler first looks for `operator<<(ostream&, const Derived&)` — not found. Then looks for the version taking Base — found, d is auto-upcast to Base&. `b.identify()` is virtual, resolves to `Derived::identify()` → "Derived" |
| `std::cout << bref;` | Directly matches the version taking Base; bref actually points to a Derived; the virtual call resolves to `Derived::identify()` → "Derived" |

### 15.5 Approach 2: More Flexible — Pass the Stream to the Virtual Function

Limitations of Approach 1:

1. Assumes the output can be expressed as a single string
2. The virtual member function can't access the stream (inconvenient if what's being printed is another object that has its own operator<<)

Better design: have the virtual function **receive the stream** and handle printing itself.

```cpp
#include <iostream>

class Base
{
public:
    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        return b.print(out);   // ← Pass the stream to the virtual function
    }

    virtual std::ostream& print(std::ostream& out) const
    {
        out << "Base";
        return out;
    }
};

// A class with its own operator<< (for example)
struct Employee
{
    std::string name{};
    int id{};

    friend std::ostream& operator<<(std::ostream& out, const Employee& e)
    {
        out << "Employee(" << e.name << ", " << e.id << ")";
        return out;
    }
};

class Derived : public Base
{
private:
    Employee m_e{};

public:
    Derived(const Employee& e) : m_e{ e } { }

    std::ostream& print(std::ostream& out) const override
    {
        out << "Derived: ";
        out << m_e;   // ← Now we can use the stream directly to call Employee's operator<<
        return out;
    }
};

int main()
{
    Base b{};
    std::cout << b << '\n';

    Derived d{ Employee{"Jim", 4} };
    std::cout << d << '\n';

    Base& bref{ d };
    std::cout << bref << '\n';
}
```

Output:

```
Base
Derived: Employee(Jim, 4)
Derived: Employee(Jim, 4)
```

> 💡 **Design pattern name**: this is a simplified **Template Method pattern** — the base defines the skeleton of the algorithm (operator<<), and the variable parts (print) are implemented by derived classes.

### 15.6 ⚠️ This Pattern Pervades the Inheritance Hierarchy

> The same idea is used for:
> - Destructors: the base's virtual destructor is called automatically; derived classes don't need to "call the base destructor"
> - Copy construction, assignment: typically implemented through a `clone()` virtual member function for deep copy (used in HW6)

PPT page 36 (Klefstad) mentions the `clone()` pattern:

> "We add **clone() method** to each Shape. Picture::add() will clone the object passed in."

The idea is the same: the base provides a virtual clone(), each derived class overrides it to return its own copy.

---

## 16. Klefstad Extended Example: Vector and CheckedVector

> Corresponds to PPT pages 7-13 (no dedicated reading section, but used as an inheritance demo)

### 16.1 Base Class Vector

```cpp
class Vector {
    int * buf;
    int sz;
public:
    Vector(int s)
        : sz{s}, buf{new int[s]} { }
    ~Vector() { delete[] buf; }
    int size() { return sz; }
    int & operator[](int i) {
        return buf[i];
    }
};

int main()
{
    Vector v{10};
    v[6] = v[5] + 4;   // oops, no init values (using uninitialized memory)
    int i = v[10];      // oops, out of range! (out-of-bounds access)
}
```

> ⚠️ Klefstad uses this example to demonstrate Vector's **two common issues**:
> 1. Using elements without initialization
> 2. Subscript out of bounds

### 16.2 Customizing Vector via Inheritance: CheckedVector

> Without modifying Vector's source, **add bounds checking via inheritance**:

```cpp
class CheckedVector : public Vector {
public:
    CheckedVector(int s) : Vector{s} { }

    int & operator[](int i) {
        if (i < 0 || i >= size())
            throw range_error();
        else
            return (*(Vector *)this)[i];   // Cast to Vector* to call the base operator[]
    }
    // size() and ~Vector are inherited from Vector
};

int main()
{
    CheckedVector v{10};
    int i = v[10];   // ✅ Now we can detect the out-of-bounds!
}
```

> 💡 This is the "**Tailoring Library**" idea Klefstad emphasizes on PPT page 8:
>
> "inheritance allows extending a type hierarchy
>   - **need not copy/modify existing source code**
>   - e.g., derive a new class CheckedVector
>     - it inherits characteristics of Vector
>     - can modify operator[]()
>   - e.g., derive a new class InitVector
>     - define constructor to initialize elements"

### 16.3 Derived Classes Accessing the Base's Internal Representation

As seen in section 6.4, Klefstad gives Vector "v2" on PPT page 11:

```cpp
class Vector
{
private:
    int *buf;
    int sz;
protected:
    int & element(int i)         { return buf[i]; }
    int   in_range(int i)        { return i >= 0 && i < sz; }
    int & vector_size()          { return sz; }
public:
    int & operator[](int index)
    {
        if (in_range(index))
            return element(index);
        // error(...);
    }
};
```

> 💡 By providing a protected "internal interface," derived classes can access the data efficiently without going through the public interface's overhead (such as repeated checks).

### 16.4 A Typical Static Binding Scenario

PPT page 15 stresses: a "homogeneous derived family" like Vector / CheckedVector / InitVector is a perfect fit for **static binding** — inheritance is used for code reuse, and operator[] is a regular member function (**not virtual**).

```cpp
CheckedVector cv(20);
Vector & vp = cv;
do_something_with(vp[0]);   // Static binding: calls Vector::operator[]
```

> ⚠️ So the operator[] in this PPT example is **deliberately not virtual** — because this is the static-binding use case.

---

## 17. Klefstad Extended Example: Picture/Shape Framework (HW6)

> Corresponds to PPT pages 36-41 (HW6 background)

### 17.1 Framework Design Goals

PPT page 36 says:
> "Memory Management
>   - Who owns the heap memory? Our decision!
>     - Shape? No
>     - Picture? Yes
>   - Shapes are allocated with `new`, then added to our Picture
>     - Picture **now owns** those shapes
>     - **Who must delete them?**
>   - We add **clone()** method to each Shape
>     - Picture::add() will **clone** the object passed in"

> 💡 **Klefstad aphorism**:
> Continuous with RAII from Weeks 4-5 — **resources must have a clear owner, and the owner is responsible for cleanup**.

### 17.2 Shape Base Class (abstract)

```cpp
class Shape
{
public:
    Shape() { /* construction logic shared by all Shapes */ }
    virtual double perimeter() = 0;     // Pure virtual
    virtual ~Shape() = default;          // Must have virtual destructor!
};
```

> ⚠️ Because of the pure virtual function, Shape **cannot be instantiated** — it is just an "interface."

### 17.3 Picture Class (container)

```cpp
class Picture
{
    // Internally implementable with array or singly linked list
public:
    Picture();                          // Construct an empty picture
    void add(Shape * sp);               // Add a Shape (pointer ownership transfers to Picture)
    double total_perimeter();           // Sum of all Shapes' perimeters
    ~Picture();                         // Must release all held Shapes
};
```

> 💡 Note: none of Picture's member functions are virtual — because we don't need to derive from Picture.

### 17.4 Add a Concrete Derived Class: Triangle

```cpp
// Picture has no idea Triangle exists — it only knows Shape!
class Triangle : public Shape
{
protected:
    double A, B, C;
public:
    Triangle(double new_A, double new_B, double new_C)
        : Shape(), A(new_A), B(new_B), C(new_C) { }

    virtual double perimeter() override
    {
        return A + B + C;
    }
};
```

> 💡 **Design essence**: Triangle implements perimeter(), so it is a **concrete class** that can be instantiated.
>
> **Picture doesn't need to know what Triangle is** — it only operates through Shape*. This is the power of polymorphism.

### 17.5 Add a Concrete Derived Class: Square

```cpp
class Square : public Shape
{
protected:
    double side;
public:
    Square(double newSide) : Shape(), side(newSide) { }

    virtual double perimeter() override
    {
        return 4 * side;
    }
};
```

### 17.6 Main Program

```cpp
int main()
{
    Picture p;
    p.add(new Triangle(10.4, 10.5, 20.6));   // Allocate on the heap, hand the pointer to Picture
    p.add(new Square(10.5));

    cout << "Total perimeter = " << p.total_perimeter() << endl;

    // When p goes out of scope, the destructor deletes all Shapes
}
```

> 💡 **Klefstad aphorism**:
> "We can write the entire framework with **only Picture and Shape**
>   - but to test, we must define at least one concrete shape
>   - e.g., Triangle"

### 17.7 Key Points Summary

| Design point | Notes |
|---|---|
| Shape uses pure virtual functions | Forces derived classes to implement perimeter() |
| Shape has a virtual destructor | Correct destruction of derived parts when deleting through Shape* |
| Picture holds Shape* | Heterogeneous container via base pointer |
| Picture owns the Shapes | Picture's destructor must delete every Shape* |
| add() takes Shape* | Any derived class can be added; no need to change Picture's code |
| total_perimeter uses virtual functions | Automatically calls each derived class's perimeter() |

### 17.8 PPT Page 35: Picture Destructor (linked-list version)

```cpp
~Picture()
{
    ListNode *tmp = nullptr;

    for (ListNode * p = head; p != nullptr; p = tmp)
    {
        tmp = p -> next;
        delete p;          // Note: linked-list nodes store Shape* pointers,
                           // when deleting a node we must also delete the corresponding Shape!
    }
}
```

> ⚠️ **A complete Picture destructor should delete two layers**:
> 1. delete the linked-list node (ListNode)
> 2. **and also** delete the Shape object the node points to (Shape *)
>
> This extends the linked-list destruction pattern from Week 5 (save the next pointer, advance, then delete).

---

## 18. "Look at Some Submissions" Snippets in Klefstad's PPT

> Corresponds to PPT pages 32-35 ("Look at some submissions")

The PPT uses code snippets from student work as counter-examples and discussion points. These are Klefstad-specific exam topics.

### 18.1 Snippet 1: Wrong Square Multiple Inheritance

```cpp
class Square
    : virtual public Shape, virtual public Rectangle
{
    int side;
public:
    Square(int cx, int cy, string nm, int my_side)
        :
        Shape(cx, cy, nm),
        Rectangle(cx, cy, nm, my_side, my_side),
        side(my_side)
    { }
};
```

> ⚠️ This involves **virtual inheritance (virtual public)** — a way to avoid the diamond problem in multiple inheritance.
>
> Klefstad shows it in the Week 6 PPT as a teaser; the detailed rules are covered in **Week 7§17**.

### 18.2 Snippet 2: Empty print() and delete this in Destructor (very bad example)

```cpp
class Triangle : public Shape
{
    void print();   // ⚠️ No definition! Why is there no runtime error?

    ~Triangle()
    {
        delete this;   // ⚠️ Is this ever right?
    }
};
```

> 💡 **Two traps**:
>
> **(1) `void print();` has no definition**:
> - The **linker** errors out (symbol not found at link time), not a runtime error.
> - But the link error only triggers if print() is actually called — if the code never calls it, it might not error.
>
> **(2) `delete this;` in a destructor**:
> - **Extremely wrong**! The destructor itself is already being called; calling delete this re-invokes the destructor — **infinite recursion**!
> - This is intentionally shown as a counter-example.

### 18.3 Snippet 3: Picture Destructor (already shown in 17.8)

```cpp
~Picture()
{
    ListNode *tmp = nullptr;
    for (ListNode * p = head; p != nullptr; p = tmp)
    {
        tmp = p -> next;
        delete p;
    }
}
```

> This pattern is **correct**: tmp holds next, then delete p — avoids dangling pointer.
> But it **only deletes ListNode** and **does not delete Shape** — if ListNode also stores a Shape*, that leaks.

---

## 19. Week 6 Comprehensive Cheat Sheet

### 19.1 Quick Inheritance Syntax Reference

```cpp
// Basic inheritance
class Derived : public Base { ... };

// Derived constructor explicitly calls base constructor
class Derived : public Base {
public:
    Derived(int cost, int id)
        : Base{ id }    // Required! Otherwise base default constructor is used
        , m_cost{ cost }
    { }
};

// Override a virtual function (recommended style)
class Derived : public Base {
public:
    virtual void foo() override { ... }   // virtual is optional but override is recommended
};

// Abstract base class (with pure virtual)
class Shape {
public:
    virtual double area() = 0;   // Pure virtual
    virtual ~Shape() = default;   // Must have virtual destructor!
};
```

### 19.2 Access Specifier × Inheritance Mode Master Table (memorize)

| Base member | public inheritance | protected inheritance | private inheritance |
|:---:|:---:|:---:|:---:|
| public | public | protected | private |
| protected | protected | protected | private |
| private | inaccessible | inaccessible | inaccessible |

### 19.3 Who Can Access Class Members?

| Specifier | Self + friends | Derived class | External code |
|:---:|:---:|:---:|:---:|
| public | ✅ | ✅ | ✅ |
| protected | ✅ | ✅ | ❌ |
| private | ✅ | ❌ | ❌ |

### 19.4 Function Resolution Order

| Call form | Resolution rule |
|---|---|
| `obj.func()` | First look in obj's type; if any func is found (even with non-matching signature), do overload resolution there; only if not found go up |
| `pBase->func()` or `rBase.func()` (func is not virtual) | **Static binding**: based on pBase/rBase's **declared type** |
| `pBase->func()` or `rBase.func()` (func is virtual) | **Dynamic binding**: based on the actual object type, calling the most-derived version |

### 19.5 Key Rules of Virtual Functions

| Rule | Notes |
|---|---|
| Only member functions can be virtual | Friend functions can't |
| override requires **identical signature + const-ness + return type** | Cannot differ at all |
| Once virtual, all overrides are implicitly virtual | "once virtual, always virtual" |
| Derived virtual cannot make base virtual | Must start at the base |
| **Virtual function resolution only applies to pointers/references** | Direct object call always uses the object's own type version |
| Don't call virtual functions in constructors/destructors | Derived parts haven't been constructed or have already been destroyed |
| A class with virtual functions must have a **virtual destructor** | Otherwise deletion through Base* leaks |

### 19.6 Pure Virtual vs. Plain Virtual

| Feature | Plain virtual + default impl | Pure virtual (= 0) |
|---|---|---|
| Can the base be instantiated | ✅ | ❌ (abstract) |
| Derived must implement | ❌ | ✅ (otherwise also abstract) |
| Function may have a definition | Of course | Optional (rarely has one) |
| Use case | Derived class **may** override | Derived class **must** implement |

### 19.7 dynamic_cast vs. static_cast

| Comparison | static_cast | dynamic_cast |
|---|---|---|
| Check time | Compile time | Runtime |
| Failure (pointer) | Returns but invalid (UB risk) | nullptr |
| Failure (reference) | Same as above | Throws `std::bad_cast` |
| Speed | Fast | Slow (RTTI lookup) |
| For upcasting | ✅ Recommended (or implicit) | ✅ Also OK, but wasteful |
| For downcasting | ⚠️ Only when 100% sure | ✅ Recommended |
| Requires virtual functions in base | ❌ No | ✅ Yes |

### 19.8 Polymorphism Categories

| Polymorphism type | C++ implementation | Resolution time |
|---|---|---|
| Static polymorphism | Function overloading, operator overloading, templates | Compile time |
| Dynamic polymorphism | **Virtual functions + pointers/references** | Runtime |

### 19.9 Static vs. Dynamic Binding Use Cases

| Scenario | Use what |
|---|---|
| Homogeneous object collection (Vector family) | Static binding, plain inheritance |
| Heterogeneous object collection (Shape family) | Dynamic binding, virtual functions |
| Framework + plugin | Dynamic binding, virtual functions |

### 19.10 Standard Template for Printing Inherited Classes via operator<<

```cpp
class Base
{
public:
    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        return b.print(out);   // Delegate to a virtual member function
    }
    virtual std::ostream& print(std::ostream& out) const
    {
        out << "Base";
        return out;
    }
    virtual ~Base() = default;
};

class Derived : public Base
{
public:
    std::ostream& print(std::ostream& out) const override
    {
        out << "Derived";
        return out;
    }
};
```

### 19.11 Python ↔ C++ Comprehensive Comparison (Week 6 highlights)

| Concept | Python | C++ |
|---|---|---|
| Inheritance syntax | `class Sub(Sup):` | `class Sub : public Sup` |
| Calling base constructor | `super().__init__(...)` | Member init list `: Sup{...}` |
| Abstract class | `from abc import ABC` + `@abstractmethod` | Class with pure virtual function (`= 0`) |
| Interface | Duck typing (no enforcement) | All pure virtual + no member variables |
| Polymorphism | All methods are "virtual" by default | Non-virtual by default; need explicit `virtual` |
| Type check | `isinstance(x, T)` | `dynamic_cast<T*>(p)` |
| Multiple inheritance | Supported directly, common | Supported but complex, use carefully |
| Diamond inheritance resolution | MRO (C3 algorithm) | Virtual base classes (virtual) |
| Access specifiers | Convention `_attr`, `__attr` | Enforced `public/protected/private` |

### 19.12 Pitfall Checklist (must-read)

| # | Mistake | Consequence | Prevention |
|---|---|---|---|
| 1 | Initializing inherited members in derived init list | Compile error | Use `: Base{...}` to call base constructor |
| 2 | Derived signature off slightly (const mismatch, parameter difference, etc.) | Doesn't count as override; still calls base | Add `override` keyword to let compiler check |
| 3 | Base virtual, derived missing virtual | Actually still an override (implicit virtual) | Still recommend writing virtual + override |
| 4 | Derived virtual, base no virtual | **Not** an override! | Must declare virtual starting at the base |
| 5 | Calling a virtual function in constructor/destructor | Resolves to the current class, not the most-derived | Never do this |
| 6 | Has virtual functions but destructor is not virtual | Deletion via Base* leaks the derived part | Any virtual class needs a virtual destructor |
| 7 | Calling through a base object (not reference/pointer) | No dynamic dispatch; possible object slicing | Use reference or pointer |
| 8 | Not checking dynamic_cast for nullptr | Dereference null pointer, UB | Always check `if (p) ...` |
| 9 | Derived has a same-name function with different signature | Base same-name functions are hidden | Use `using Base::func;` |
| 10 | Trying to make friend operator<< virtual | Compile error | Delegate to virtual member function print() |
| 11 | Derived calls base's same-name function without `Base::` | Infinite recursion | Always write `Base::func()` |
| 12 | Multiple inheritance diamond problem | Data duplication or ambiguity | Use virtual inheritance, or avoid multiple inheritance |
| 13 | Derived doesn't implement a pure virtual function | Derived also becomes abstract; cannot instantiate | Verify all pure virtuals are implemented |
| 14 | Calling pure virtual function in abstract class constructor | UB | Never do this |
| 15 | `delete this;` in a destructor | Infinite recursion | Don't write this |

### 19.13 Klefstad Aphorism Summary

| Aphorism | Meaning |
|---|---|
| "implementation is a misuse of public inheritance" | Using public inheritance for "implementation reuse" is a misuse — unless it's truly is-a |
| "preferred style is to include virtual when overriding" | Write virtual on overrides for readability |
| "once virtual, always virtual" | Base virtual → child implicitly virtual |
| "polymorphism: when the specific operation invoked by a call depends on the type of an object" | The essence of polymorphism |
| "dynamic binding allows defining plugin frameworks" | Dynamic binding's biggest use: extensible frameworks |
| "Who owns the heap memory? Our decision!" | Decide ownership at the design level |
| "Can declare only references or pointers to abstract class" | Abstract class can't be instantiated, but references/pointers can |
| "static binding: homogeneous; dynamic binding: heterogeneous" | Homogeneous → static; heterogeneous → dynamic |
| "delete this; // is this ever right?" | Counter-example — basically never do this |

---

## 20. Top Five Takeaways for Week 6

### 1. **A Derived Constructor Must Call the Base Constructor in the Init List**

```cpp
class Derived : public Base {
    Derived(int cost, int id)
        : Base{ id }      // ← Required! Otherwise calls Base's default constructor (which may not exist)
        , m_cost{ cost }
    { }
};
```

**Reason**: inherited members **cannot** be initialized in the derived class's init list (this is enforced by C++); only the base's constructor can initialize the base's members.

**Analogy**: a derived object = Base part + Derived part. The Base part is **constructed first**, the Derived part **after**; destruction order is reversed.

### 2. **Virtual Function Resolution Only Applies to Pointers/References** — This Is the Only Form of Dynamic Binding

```cpp
Cat cat{"Fred"};
Animal& a = cat;       // reference
a.speak();             // calls Cat::speak() — dynamic binding ✅

Cat cat2{"Misty"};
Animal a2 = cat2;      // ⚠️ Copy! Only the Animal part is copied (object slicing)
a2.speak();            // Calls Animal::speak() — Cat info lost ❌
```

**Core principles**:
- Calling a virtual function through a pointer/reference → resolves to the **actual type** of the object
- Calling through the object itself → resolves to the **declared type** of the object
- Don't pass a base object by value if it might be used polymorphically — that causes object slicing

**Corresponding rule**: base uses `virtual`; derived **should write** `override` (let the compiler check signature match). **A base function not marked virtual** can never be overridden, no matter what derived classes do.

### 3. **Abstract Class (with Pure Virtual) Cannot Be Instantiated** — This Is the Core Mechanism of Interface Design

```cpp
class Shape {
public:
    virtual double area() = 0;     // Pure virtual
    virtual ~Shape() = default;    // Required!
};

Shape s;          // ❌ Compile error: cannot instantiate abstract class
Shape* sp = new Triangle{...};   // ✅ But you can use a base pointer to a derived object
```

**Two purposes**:
- **Force derived classes to implement** key functions (avoid "forgetting to override")
- **Interface class** (no member variables + all pure virtual) implements "depend on abstractions, not concrete implementations"

**Must have a virtual destructor**! Otherwise `delete sp;` leaks the derived part.

### 4. **public/protected/private Inheritance Modes × 3 Member Specifiers = 9 Combinations**

Most common: **public inheritance + various member specifiers** — leaves things as-is:

| Base | After public inheritance |
|:---:|:---:|
| public | public |
| protected | protected |
| private | inaccessible |

> **Best Practice** (consensus of LearnCpp + Klefstad):
> - Default to **public inheritance** — 99% of cases
> - Default members to **private** — only use protected when derived classes need direct access
> - "private inheritance" is rare; "protected inheritance" is almost never used

### 5. **The Core Pattern of Dynamic Polymorphism**: Base Pointer/Reference + Virtual Function = Extensible Framework

```cpp
// Framework code
void rotate_all(Shape* vec[], int size, int angle) {
    for (int i = 0; i < size; i++)
        vec[i]->rotate(angle);   // Dynamic dispatch
}

// Adding a new derived class requires no framework changes!
class Hexagon : public Shape {   // Newly added
public:
    virtual void rotate(int degrees) override { /* new logic */ }
};
```

**Klefstad philosophy**:
- Static binding → handle homogeneous collections (Vector / CheckedVector)
- Dynamic binding → handle heterogeneous collections (Shape / Circle / Triangle)

**`dynamic_cast` is the escape hatch** — used when you must extract derived info from a base pointer. **Prefer virtual functions**; don't use dynamic_cast unless you have to.

**`operator<< + virtual print()` is a common idiom** — turn a non-virtual friend into something polymorphic by delegation.

---

> **This week's reading coverage**:
> - LearnCpp 24.1 (Introduction to inheritance) — fully covered
> - LearnCpp 24.2 (Basic inheritance in C++) — fully covered
> - LearnCpp 24.3 (Order of construction of derived classes) — fully covered
> - LearnCpp 24.4 (Constructors and initialization of derived classes) — fully covered (with full Quiz solution)
> - LearnCpp 24.5 (Inheritance and access specifiers) — fully covered
> - LearnCpp 24.6 (Adding new functionality to a derived class) — fully covered
> - LearnCpp 24.7 (Calling inherited functions and overriding behavior) — fully covered (with using-declaration and friend operator<<)
> - LearnCpp 25.1 (Pointers and references to the base class) — fully covered
> - LearnCpp 25.2 (Virtual functions and polymorphism) — fully covered (with all of Quiz 1a–1f)
> - LearnCpp 25.7 (Pure virtual functions, abstract base classes, interface classes) — fully covered
> - LearnCpp 25.10 (Dynamic casting) — fully covered
> - LearnCpp 25.11 (Printing inherited classes using operator<<) — fully covered
>
> **PPT integration**:
> - Klefstad *Topic 6: Inheritance & Polymorphism* PPT is almost fully fused into each section:
>   - Inheritance basics (pages 2-7) → sections 2, 3
>   - HW6 class hierarchy (page 4) → section 2.5
>   - Vector / CheckedVector example (pages 7-13) → section 16
>   - Static vs. Dynamic Binding (pages 14-15) → section 12
>   - Virtual methods and polymorphism (pages 17-22) → sections 11, 12
>   - Abstract base classes (pages 23-25) → section 13
>   - Constructing/destroying derived classes (page 25) → section 5
>   - public/protected/private inheritance (page 27) → section 7
>   - dynamic_cast (page 28) → section 14
>   - Look at some submissions (pages 32-35) → section 18
>   - Picture/Shape framework (pages 36-41) → section 17
>
> **PPT content moved to Week 7** (see Week 7 §17):
> - Multiple inheritance (pages 29-31)
> - Virtual base classes (pages 30, 33)
>
> **Briefly mentioned in this week's PPT, treated later by LearnCpp**:
> - Slicing mentioned in PPT (page 20, "What about this? `void rotate_shape(Shape s, ...)`") — briefly noted in section 11.6, see LearnCpp 25.9 for details (likely Week 7)