# Information and Computer Science 45C — Week 6 整合学习笔记

## 目录

- [1. 周学习目标](#1-周学习目标)
- [2. 继承的概念：is-a 关系](#2-继承的概念is-a-关系)
- [3. C++ 中的基本继承语法](#3-c-中的基本继承语法)
- [4. 派生类的构造顺序](#4-派生类的构造顺序)
- [5. 派生类的构造函数与初始化](#5-派生类的构造函数与初始化)
- [6. 继承与访问控制（public / protected / private）](#6-继承与访问控制public--protected--private)
- [7. 三种继承方式（public / protected / private inheritance）](#7-三种继承方式public--protected--private-inheritance)
- [8. 在派生类中添加新功能](#8-在派生类中添加新功能)
- [9. 调用继承函数与覆盖（重定义）行为](#9-调用继承函数与覆盖重定义行为)
- [10. 基类指针/引用指向派生对象](#10-基类指针引用指向派生对象)
- [11. 虚函数（virtual）与运行时多态](#11-虚函数virtual与运行时多态)
- [12. 静态绑定 vs 动态绑定](#12-静态绑定-vs-动态绑定)
- [13. 纯虚函数、抽象基类与接口类](#13-纯虚函数抽象基类与接口类)
- [14. dynamic_cast 与向下转换](#14-dynamic_cast-与向下转换)
- [15. 用 operator<< 打印继承类对象](#15-用-operator-打印继承类对象)
- [16. Klefstad 扩展示例：Vector 与 CheckedVector](#16-klefstad-扩展示例vector-与-checkedvector)
- [17. Klefstad 扩展示例：Picture/Shape 框架（HW6）](#17-klefstad-扩展示例pictureshape-框架hw6)
- [18. Klefstad PPT 中的"看学生提交"片段](#18-klefstad-ppt-中的看学生提交片段)
- [19. Week 6 综合 Cheat Sheet](#19-week-6-综合-cheat-sheet)
- [20. Week 6 最重要的五条记忆](#20-week-6-最重要的五条记忆)

> UCI ICS 45C: Programming in C++ (35770)
> 本笔记整合 Week 6 阅读材料 LearnCpp 24.1–24.7（继承基础）+ 25.1, 25.2, 25.7, 25.10, 25.11（指针/引用指向基类、虚函数、纯虚函数与抽象类、dynamic_cast、用 operator<< 打印），与 Klefstad 教授的 PPT *Topic 6: Inheritance & Polymorphism*。内容按概念主题组织，每节融合阅读原文 + PPT 代码例子 + Klefstad 警句 + 易错点。
> PPT 中关于**多继承与虚基类**的内容（pages 27、29–31、33）不在 Week 6 阅读清单内，现已正式收录在 **Week 7 §17**。

---

## 1. 周学习目标

> 对应 LearnCpp 24.1 + 25.1 章节引言

### 1.1 继承（Inheritance）部分（chapter 24）

- 理解：继承表达 **"is-a"（是一种）** 关系，与组合（composition，has-a）相对
- 学会：如何写 `class Derived : public Base` 语法
- 掌握：派生对象构造时**先构造基类部分**，再构造派生部分
- 掌握：派生类构造函数如何**显式调用基类构造函数**
- 理解：**protected** 访问修饰符的作用，与 public/private 的区别
- 理解：public/protected/private **三种继承方式**对成员可见性的影响
- 学会：在派生类中**添加新功能、重定义函数、调用基类函数**

### 1.2 多态（Polymorphism）部分（chapter 25）

- 理解：基类指针/引用可以指向派生类对象（**upcasting**）
- 掌握：`virtual` 关键字，以及它如何让函数调用解析到**最派生**的版本
- 区分：**静态多态**（重载、模板）vs **动态多态**（虚函数）
- 掌握：**纯虚函数**（`= 0`）与**抽象基类**的概念
- 理解：**接口类**（interface class）的设计哲学
- 学会：用 `dynamic_cast` 做安全的**向下转换**（downcasting）
- 学会：通过虚成员函数 `print()` 实现**继承类的 operator<<**

---

## 2. 继承的概念：is-a 关系

> 对应 LearnCpp 24.1 + PPT page 5

### 2.1 两种构建复杂类的方式

C++ 让我们用两种主要方式构建复杂类：

| 方式 | 关系 | 关键词 | 实现方式 |
|---|---|---|---|
| **组合（Composition）** | "has-a" / "is a part of" | 一个 Engine **是** Car 的**一部分** | 数据成员 |
| **继承（Inheritance）** | "is-a" / "is a kind of" | 一个 Car **是一种** Vehicle | 派生类语法 |

> 💡 **Klefstad 警句对比**：
> - 组合：`class Car : public Vehicle { Engine e; ... };` —— Car **包含** Engine
> - 继承：`class Car : public Vehicle { ... };` —— Car **是一种** Vehicle
>
> 注意：上面第一行既有继承（: public Vehicle）又有组合（Engine e）—— 一个类可以同时使用两种关系。

### 2.2 类比：苹果和香蕉

> LearnCpp 用到的核心比喻

苹果和香蕉是不同的水果，但都是**水果**。所以凡是水果具有的属性（颜色、名称、大小、会成熟），苹果和香蕉都具有。我们说苹果和香蕉**继承**了水果的所有属性——因为它们**就是**水果。

### 2.3 层级（Hierarchy）

层级图展示对象之间的关系，通常从**通用到特定**：

```
        水果 (Fruit)
       /        \
    苹果        香蕉
   (Apple)    (Banana)
```

或随时间演进的层级（386 → 486 → Pentium），或生物分类（域 → 界 → 门 → 纲 → 目 → 科 → 属 → 种）。

形状层级：

```
              Shape（形状）
             /          \
       Quadrilateral    Triangle
        (四边形)         (三角形)
        /     \           |
   Rectangle  ...      RightTriangle
   (矩形)
       |
    Square
   (正方形)
```

### 2.4 继承的现实例子（Klefstad 强调）

- **生物**：你从父母继承基因，再加上自己的个性
- **科技产品**：手机、电脑继承前代产品的特性（向后兼容）
- **编程语言**：C++ 从 C 继承了大量特性，C 又从更早语言继承

### 2.5 HW6 类层级（PPT 给出）

```
                  {Shape}                   Picture
                /   |    \                  +ListNode
            Circle Triangle  Rectangle
                              |
                            Square
```

> ⚠️ `{Shape}` 用花括号表示**抽象类**（不能实例化）。Picture 通过 ListNode 链表保存多个 Shape 指针，组成一幅"图"。

### 2.6 Python ↔ C++ 类比

| Python | C++ | 备注 |
|---|---|---|
| `class Apple(Fruit):` | `class Apple : public Fruit` | Python 默认就是公有继承 |
| 多重继承很常见 | 单继承为主，多继承罕见且复杂 | C++ 多继承有歧义问题 |
| `super().__init__()` 显式调用 | 用初始化列表 `: Fruit{...}` | 两种语言都需要显式调用基类构造 |

---

## 3. C++ 中的基本继承语法

> 对应 LearnCpp 24.2 + PPT pages 6-7

### 3.1 术语

| 中文 | 英文同义词 |
|---|---|
| **基类**（被继承的类） | base class / parent class / superclass |
| **派生类**（继承别人的类） | derived class / child class / subclass |

### 3.2 简单的 Person 基类

```cpp
#include <string>
#include <string_view>

class Person
{
// 在这个例子里我们暂时把成员设为 public 以保持简单
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

每个 Person 都有名字和年龄——这些是**所有人**通用的属性，所以放在基类里。

### 3.3 三种添加 BaseballPlayer 的"姓名 + 年龄"方法

> LearnCpp 给出的关键决策对比

设我们想写一个 BaseballPlayer 类来追踪打者的击球率和本垒打数。BaseballPlayer 也需要姓名和年龄。我们有三种选择：

| 方案 | 评价 |
|---|---|
| 1. 在 BaseballPlayer 里**直接复制**这些字段 | ❌ 重复代码；Person 改了，BaseballPlayer 也得改 |
| 2. **组合**：让 BaseballPlayer 包含 Person 成员 | ❌ "BaseballPlayer **有一个** Person"——不对，**BaseballPlayer 就是一个** Person |
| 3. **继承**：BaseballPlayer 从 Person 继承 | ✅ 正确，"is-a" 关系完美匹配 |

### 3.4 派生语法

```cpp
// BaseballPlayer 公有继承 Person
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

继承语法格式：`class 派生类 : public 基类`

### 3.5 BaseballPlayer 实际拥有的成员

继承之后，BaseballPlayer 对象**总共有 4 个成员变量**：

- 来自 Person：`m_name`、`m_age`
- BaseballPlayer 自己的：`m_battingAverage`、`m_homeRuns`

```cpp
int main()
{
    BaseballPlayer joe{};
    joe.m_name = "Joe";              // m_name 是从 Person 继承来的
    std::cout << joe.getName() << '\n';   // getName() 也是继承来的
    return 0;
}
// 输出：Joe
```

### 3.6 多个类共享同一基类

```cpp
// Employee 也公有继承 Person
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
        // m_name 来自 Person，m_hourlySalary 来自自己——两者都能访问
    }
};
```

> 💡 **Key Insight**：BaseballPlayer 和 Employee 之间**没有任何直接关系**，尽管它们都继承自 Person。这就像兄弟姐妹一样——有共同父母但相互独立。

### 3.7 继承链（Inheritance Chain）

派生类**自己也可以**作为别人的基类，形成多级继承：

```cpp
class Supervisor: public Employee   // Employee 又继承自 Person
{
public:
    long m_overseesIDs[5]{};   // Supervisor 监管的 5 个员工 ID
};
```

层级关系：

```
Person → Employee → Supervisor
```

Supervisor **同时**继承了 Employee 和 Person 的所有成员，并加上自己的 `m_overseesIDs`。

### 3.8 继承的好处（LearnCpp 总结）

> 这是教授和考试都会强调的重点

1. **代码复用**：不需要在派生类里重新写基类的代码
2. **维护方便**：基类改一处，所有派生类自动受益
3. **构建通用 → 特定的层级**：顶层最通用，越往下越具体

### 3.9 PPT 警句

> Klefstad 的版本（Topic 6 page 6）：
> ```cpp
> class Window : public Screen { ... };
> class Menu : public Window { ... };
> ```
> "Screen is a public base class of Window. Window is derived from Screen. Window inherits data and member functions from Screen. Menu inherits from both Window and Screen."

---

## 4. 派生类的构造顺序

> 对应 LearnCpp 24.3

### 4.1 派生对象的内存模型

虽然继承让 BaseballPlayer "拥有" Person 的成员，但**派生对象不是把基类成员复制过来**，而是 **由两部分组成**：

```
+----------------------+
|   Base part          |   ← Person 的 m_name, m_age
+----------------------+
|   Derived part       |   ← BaseballPlayer 的 m_battingAverage, m_homeRuns
+----------------------+
```

派生对象 = Base 部分 + Derived 部分

### 4.2 构造顺序：从最基类到最派生类（top-down）

> ⚠️ **核心规则**：当 C++ 构造派生对象时，**总是先构造最基类（继承树最顶端），然后逐层向下构造**。

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

输出：

```
Instantiating Base
Base
Instantiating Derived
Base
Derived              ← 注意：构造 Derived 时，Base 也被构造了
```

### 4.3 为什么先构造基类？

> 💡 **Key Insight**：逻辑上，**孩子不能先于父母存在**。同时，派生类经常使用基类的成员变量；先构造基类能保证当派生类构造时，基类的成员已经初始化好。

### 4.4 多级继承链的构造顺序

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

输出：

```
Constructing D:
A
B
C
D
```

构造顺序：**A → B → C → D**（最基类先，最派生类后）

### 4.5 析构顺序：与构造顺序**完全相反**

> ⚠️ **重要规则**：派生对象销毁时，**先析构最派生类，再向上逐层析构基类**。

```
构造：A → B → C → D
析构：D → C → B → A
```

> 💡 用 RAII 类比：每层的"资源获取在初始化时"——先进后出，像栈一样。

### 4.6 Python ↔ C++ 对比

| Python | C++ |
|---|---|
| 子类 `__init__` **必须显式调用** `super().__init__()`，否则父类构造不会执行 | 派生类构造**自动调用**基类默认构造（如果不显式指定） |
| 没有"内存中的 Base 部分"概念 | 派生对象**物理上**包含基类部分 |

---

## 5. 派生类的构造函数与初始化

> 对应 LearnCpp 24.4 + PPT page 25

### 5.1 派生类对象创建的完整流程

非派生类 `Base base{ 5 };` 的流程：

1. 为 base 分配内存
2. 调用对应的 Base 构造函数
3. 成员初始化列表初始化变量
4. 构造函数函数体执行
5. 控制权返回调用方

派生类 `Derived derived{ 1.3 };` 的流程：

1. 为 derived 分配内存（足够装下 Base 部分 + Derived 部分）
2. 调用对应的 Derived 构造函数
3. **Base 对象先用合适的 Base 构造函数构造好**——若未指定，调用默认构造函数
4. Derived 的成员初始化列表初始化它自己的变量
5. Derived 构造函数函数体执行
6. 控制权返回调用方

> 💡 **Key Insight**：唯一的差别就是第 3 步——**在 Derived 构造的"实质内容"开始前，必须先构造 Base 部分**。

### 5.2 ❌ 错误尝试 1：在派生类初始化列表中初始化继承成员

新手常见错误：

```cpp
class Derived: public Base
{
public:
    double m_cost {};

    Derived(double cost = 0.0, int id = 0)
        : m_cost{ cost }
        , m_id{ id }     // ❌ 编译错误！m_id 是继承来的，不能在这里初始化
    {
    }
};
```

> ⚠️ **C++ 规则**：成员变量**只能在它所属类的**构造函数初始化列表中初始化。继承的变量必须由基类来初始化。

**为什么这条规则存在？** 考虑 const 或引用变量。const 变量**必须在创建时**初始化。如果允许派生类在自己的初始化列表里初始化继承的 const 成员，就会有两次初始化机会——这会破坏 const 语义。所以 C++ 限制每个变量**只能初始化一次**，且必须在它所属类的构造函数中。

### 5.3 ❌ 错误尝试 2：在构造函数体里赋值

```cpp
Derived(double cost = 0.0, int id = 0)
    : m_cost{ cost }
{
    m_id = id;       // 能编译，但有问题
}
```

虽然这"能跑"，但有三个问题：

1. **不能用于 const 或引用成员**——它们必须在初始化时确定值
2. **效率低**：m_id 被赋值两次（先在 Base 构造里默认初始化，再在这里赋值）
3. **基类构造时拿不到这个值**：如果 Base 构造函数中需要用 m_id，它在那一刻还没被设置

### 5.4 ✅ 正确方式：在派生类初始化列表里**调用基类构造函数**

```cpp
class Derived: public Base
{
public:
    double m_cost {};

    Derived(double cost = 0.0, int id = 0)
        : Base{ id }       // ✅ 调用 Base(int) 构造函数，传入 id
        , m_cost{ cost }
    {
    }
};
```

完整执行流程（详细版）：

```cpp
Derived derived{ 1.3, 5 };
```

1. 为 derived 分配内存
2. 调用 `Derived(double, int)`，cost = 1.3, id = 5
3. 编译器检查到我们指定了 `Base{ id }`——调用 `Base(int)`，传入 id = 5
4. Base 的初始化列表把 m_id 设为 5
5. Base 构造函数体执行（这里什么都没做）
6. Base 构造函数返回
7. Derived 的初始化列表把 m_cost 设为 1.3
8. Derived 构造函数体执行（这里什么都没做）
9. Derived 构造函数返回

> 💡 **Key Insight**：**无论 Base 构造调用写在 Derived 初始化列表的哪个位置**，它**总是最先**执行（基类必须先构造）。

### 5.5 现在可以把成员设回 private 了

之前为简单起见把成员设为 public。但既然有了正确的构造方式，应该恢复 private：

```cpp
class Base
{
private:                  // ✅ 改回 private
    int m_id {};
public:
    Base(int id = 0) : m_id{ id } { }
    int getId() const { return m_id; }
};

class Derived: public Base
{
private:                  // ✅ 改回 private
    double m_cost {};
public:
    Derived(double cost = 0.0, int id = 0)
        : Base{ id }      // 通过 Base 构造函数初始化继承成员
        , m_cost{ cost }
    {
    }
    double getCost() const { return m_cost; }
};
```

> ⚠️ **核心规则（暂时）**：派生类**不能直接访问**基类的 private 成员，只能通过基类的公有访问函数（如 getId()）。下一节学完 protected 后这条规则会扩展。

### 5.6 多级继承链中的构造调用

> 对应 LearnCpp 24.4 的"Inheritance chains"小节

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

输出：

```
A: 5
B: 4.3
C: R
```

> ⚠️ **重要限制**：**派生类的构造函数只能调用直接父类的构造函数**。C 不能直接调用 A 的构造函数；C 调用 B，B 调用 A。

### 5.7 析构函数

派生类销毁时，析构函数调用**与构造顺序相反**：

```
构造：A → B → C
析构：C → B → A
```

### 5.8 ⚠️ 警告：基类有虚函数时，析构函数也必须 virtual

> 来自 LearnCpp 24.4 的警告（与 25.7 呼应）：

> ⚠️ 如果基类有虚函数，**析构函数也必须是 virtual**，否则在某些情况下会导致**未定义行为**。详见 LearnCpp 25.4。

PPT page 25 同样强调："**virtual destructor is required for hierarchy with virtual functions**"。

简短理由：当用 `Base*` 指向 Derived 对象，然后 `delete` 这个指针时，如果析构函数不是 virtual，**只会调用 Base 的析构函数**，Derived 部分泄漏。

### 5.9 LearnCpp Quiz：水果继承

> 这是 LearnCpp 24.4 的练习题，答案完整给出，作为综合练习

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

输出：

```
Apple(Red delicious, red, 4.2)
Banana(Cavendish, yellow)
```

> 💡 注意：因为 a, b 是 const，所有访问函数（`getName()`、`getColor()`、`getFiber()`）必须是 const 方法。

---

## 6. 继承与访问控制（public / protected / private）

> 对应 LearnCpp 24.5 + PPT page 10-11

### 6.1 复习：private vs public

| 修饰符 | 谁能访问 |
|---|---|
| `public` | **所有人**（类外、派生类、内部都行） |
| `private` | **只有**该类的成员函数和友元能访问 |

**关键问题**：派生类**能访问基类的 private 成员吗？** ❌ **不能**！

```cpp
class Base
{
private:
    int m_private {};   // 只有 Base 的成员/友元能访问
public:
    int m_public {};    // 所有人都能访问
};
```

### 6.2 第三种访问修饰符：protected

> ⚠️ **新概念**：之前只学过 public 和 private，现在加入 **protected**。

`protected` 允许：
- 类自身的成员函数访问 ✅
- 类的友元访问 ✅
- **派生类的成员函数访问** ✅
- 类外的代码访问 ❌

```cpp
class Base
{
public:
    int m_public {};       // 所有人能访问
protected:
    int m_protected {};    // 自己 + 友元 + 派生类能访问
private:
    int m_private {};      // 仅自己 + 友元能访问（派生类也不能）
};

class Derived: public Base
{
public:
    Derived()
    {
        m_public = 1;     // ✅ 允许：派生类可以访问继承的 public 成员
        m_protected = 2;  // ✅ 允许：派生类可以访问继承的 protected 成员
        m_private = 3;    // ❌ 不允许：派生类不能访问继承的 private 成员
    }
};

int main()
{
    Base base;
    base.m_public = 1;     // ✅ 允许：外部可访问 public
    base.m_protected = 2;  // ❌ 不允许：外部不能访问 protected
    base.m_private = 3;    // ❌ 不允许：外部不能访问 private
}
```

### 6.3 何时使用 protected？

protected 能让派生类**直接访问**基类成员。但这意味着：**如果以后改变这个属性的类型或意义，所有派生类都得跟着改**。

| 场景 | 推荐 |
|---|---|
| 你（或团队）会大量派生这个类，且派生类数量可控 | ✅ 用 protected |
| 这个类要给外部使用，派生类不归你管 | ❌ 用 private，对外暴露 setter/getter |

> 💡 **Best Practice**（LearnCpp）：
> **优先使用 private，不要轻易用 protected**。
> private 让基类的内部实现可以自由更改，不会影响派生类。
> 但代价是基类需要更大的 public/protected 接口。

### 6.4 PPT Klefstad 版本：Vector v2

> Klefstad PPT page 11，演示了 protected 的实际用途：

```cpp
class Vector
{
private:
    int *buf;
    int sz;
protected:
    // 让派生类直接访问内部表示
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

> 💡 这种设计让派生类（如 CheckedVector）能高效访问内部数组，不用走 public 的 `operator[]`（那会有边界检查开销）。

### 6.5 Python ↔ C++ 对比

| 概念 | Python | C++ |
|---|---|---|
| 公有 | `attr` | `public:` |
| "私有"约定 | `_attr` (单下划线，约定俗成的"内部使用") | `private:` (强制隔离) |
| "强私有" | `__attr` (双下划线，name mangling) | （无对应） |
| protected（派生类可访问） | （无强制概念，靠约定 `_attr`） | `protected:` |

> ⚠️ Python 没有真正的访问控制——`__attr` 也只是 name mangling，仍可绕过。C++ 是**编译期强制**的。

---

## 7. 三种继承方式（public / protected / private inheritance）

> 对应 LearnCpp 24.5 后半 + PPT page 27

### 7.1 三种继承方式

```cpp
class Pub : public Base    {};   // 公有继承
class Pro : protected Base {};   // 保护继承
class Pri : private Base   {};   // 私有继承
class Def : Base           {};   // 不写默认是 private 继承（class 默认）
```

> ⚠️ **特殊规则**：
> - `class` 默认 private 继承
> - `struct` 默认 public 继承
> （和成员默认访问性的规则一致）

### 7.2 核心概念：继承方式如何改变继承成员的可见性

> 💡 **Key Insight**：继承方式**只影响外界（和后续派生类）如何访问**这些继承的成员；
> 它**不影响派生类自身**对这些成员的访问能力（这只取决于成员原本的访问修饰符）。

### 7.3 完整对照表（必背）

| 基类中的修饰符 | public 继承后 | protected 继承后 | private 继承后 |
|:---:|:---:|:---:|:---:|
| `public` | `public` | `protected` | `private` |
| `protected` | `protected` | `protected` | `private` |
| `private` | **不可访问** | **不可访问** | **不可访问** |

> 📌 **记忆口诀**：
> - **public 继承**：保持原样
> - **protected 继承**：public 降级为 protected，其他不变
> - **private 继承**：所有可访问的都降为 private
> - **private 永远不可访问**（无论哪种继承方式）

### 7.4 公有继承（最常用）

```cpp
class Pub: public Base
{
    // public 继承下：
    // - 继承的 public 成员仍是 public
    // - 继承的 protected 成员仍是 protected
    // - 继承的 private 成员不可访问
};
```

> 💡 **Best Practice**：**除非有特殊原因，否则就用 public 继承**。

### 7.5 私有继承（罕见）

```cpp
class Pri: private Base
{
    // private 继承下：
    // - 继承的 public 成员变成 private
    // - 继承的 protected 成员变成 private
    // - 继承的 private 成员仍不可访问
public:
    Pri()
    {
        m_public = 1;     // ✅ 派生类内部能访问（在 Pri 里现在是 private）
        m_protected = 2;  // ✅ 派生类内部能访问
        m_private = 3;    // ❌ 仍不能访问
    }
};

int main()
{
    Pri pri;
    pri.m_public = 1;    // ❌ 在 Pri 里它现在是 private，外部不可访问！
}
```

私有继承的应用：派生类**用基类做内部实现**，但不想让外界把它当"基类的子类型"用。例如用 Vector 实现 Stack（Stack 内部用 Vector，但不希望对 Stack 调用 `operator[]`）。

### 7.6 保护继承（更罕见）

几乎不用。表中可见，public 和 protected 都变成 protected，所以**外界完全无法访问继承的成员**，但派生类可以。

### 7.7 PPT Klefstad 警句

> Klefstad PPT page 27 强调：
>
> "**implementation is a misuse of public inheritance**"
> （用继承做"实现复用"是 **滥用** 公有继承——因为没有真正的 is-a 关系）
>
> "数组下标用在栈上——不行！" (operations on base class may not apply to derived)

### 7.8 综合示例（LearnCpp 24.5 末尾）

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
    // private 继承：
    // m_public  → private
    // m_protected → private
    // m_private 不可访问
public:
    int m_public2 {};
protected:
    int m_protected2 {};
private:
    int m_private2 {};
};

class D3 : public D2
{
    // public 继承 D2：
    // m_public2 仍是 public（在 D3 中）
    // m_protected2 仍是 protected
    // m_private2 不可访问
    // Base 的 m_public 和 m_protected 在 D2 里变成 private 了，
    // 所以 D3 完全访问不到它们！
};
```

> ⚠️ D3 通过 D2 间接继承 Base，但因为 D2 是私有继承 Base，**Base 的所有成员对 D3 都不可访问**——即使是原本的 public 成员也不行。

---

## 8. 在派生类中添加新功能

> 对应 LearnCpp 24.6

### 8.1 派生类的核心好处

继承带来的最大好处之一：**复用代码** + **扩展功能**。在派生类中可以：

1. ✅ 添加新功能
2. ✅ 修改/重定义已有功能
3. ✅ 隐藏不想要的功能（24.8 内容，未必属于 Week 6）

### 8.2 基本场景

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

### 8.3 为什么需要"在派生类中添加新功能"？

LearnCpp 给出三个常见场景：

1. **基类是第三方库**：你刚买了一个第三方代码库，想加点东西。直接改源码不行——下一次升级你的修改会丢失或合并困难。
2. **基类来自标准库**：标准库（如 `std::vector`）你根本没法改源码。
3. **基类来自预编译库**：只有 `.h` 头文件，没源码。

**最佳方案**：派生一个新类，往里面加你需要的功能。

### 8.4 实际写法

```cpp
class Derived: public Base
{
public:
    Derived(int value) : Base{ value } { }

    int getValue() const { return m_value; }   // ← 新功能
};
```

> 💡 **Key Insight**：因为 `m_value` 在 Base 里是 **protected**，Derived 可以**直接访问**它。如果是 private，得通过 public 接口绕弯。

```cpp
int main()
{
    Derived derived { 5 };
    std::cout << "derived has value " << derived.getValue() << '\n';
    return 0;
}
// 输出：derived has value 5
```

### 8.5 ⚠️ 反方向不行：基类不能访问派生类的成员

```cpp
int main()
{
    Base base { 5 };
    std::cout << base.getValue() << '\n';  // ❌ 编译错误！Base 没有 getValue()
}
```

> 💡 **核心规则**：
> - **Derived is-a Base** → Derived 可以访问 Base 中可见的成员
> - **Base is NOT-a Derived** → Base 完全不知道 Derived 的存在
>
> 类比：你知道你的祖先是谁（家谱），但祖先并不知道你将来会出生。

---

## 9. 调用继承函数与覆盖（重定义）行为

> 对应 LearnCpp 24.7

### 9.1 函数解析的核心规则

> 💡 **Key Rule**：当对派生对象调用一个成员函数时，编译器：
> 1. **先在派生类**里查找同名函数
> 2. 如果找到任何一个同名函数（即使签名不匹配），**就在这个类里做重载解析**——**不会**再去基类查找
> 3. 如果派生类**完全没有**同名函数，才向上走，到基类找

### 9.2 派生类没有同名函数 → 调用基类版本

```cpp
class Base
{
public:
    void identify() const { std::cout << "Base::identify()\n"; }
};

class Derived: public Base
{
    // 没有定义 identify()
};

int main()
{
    Derived derived {};
    derived.identify();   // 编译器在 Derived 找不到，向上找到 Base::identify()
}
// 输出：Base::identify()
```

### 9.3 重定义函数（"覆盖"，但不是 virtual override）

```cpp
class Derived: public Base
{
public:
    void identify() const { std::cout << "Derived::identify()\n"; }   // 重定义
};

int main()
{
    Derived derived {};
    derived.identify();   // 调用 Derived::identify()
}
// 输出：Derived::identify()
```

### 9.4 ⚠️ 重定义 ≠ override（虚函数覆盖）

> 💡 重要区分：**这一节讲的"重定义"（redefining）与第 11 节的虚函数 override 是两个概念**。
> - **重定义**（无 virtual）：通过对象本身或对象的派生类引用调用时才生效——编译时绑定
> - **override**（有 virtual）：可以通过基类指针/引用调用派生版本——运行时绑定
>
> 我们在第 11 节会详细讲虚函数。

### 9.5 重定义函数可以改变访问修饰符

> ⚠️ 这点很有意思：派生类重定义的函数**不继承**基类同名函数的访问修饰符；它使用**自己声明时的修饰符**。

```cpp
class Base
{
private:                        // 注意：private
    void print() const { std::cout << "Base"; }
};

class Derived : public Base
{
public:                         // 注意：public
    void print() const { std::cout << "Derived "; }
};

int main()
{
    Derived derived {};
    derived.print();    // ✅ 调用 Derived::print()，是 public，可以从外部调用
}
```

### 9.6 在派生函数中**调用基类版本**（"基础上扩展"）

有时不想完全替换基类函数，而是想"加点东西"。

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
        Base::identify();   // ← 显式调用基类版本
    }
};

int main()
{
    Derived derived {};
    derived.identify();
}
```

输出：

```
Derived::identify()
Base::identify()
```

### 9.7 ⚠️ 千万不要忘记 `Base::` 前缀，否则无限递归！

```cpp
class Derived: public Base
{
public:
    void identify() const
    {
        std::cout << "Derived::identify()\n";
        identify();   // ❌ 无限递归！这调用的是当前类（Derived）的 identify()
    }
};
```

> 💡 **Key Insight**：在成员函数内部，不带前缀的函数调用**默认指向当前类**。要调用基类版本，必须写 `Base::identify()`，**作用域解析操作符 `::` 不能省略**。

### 9.8 调用基类的友元函数：用 static_cast 转成基类引用

> 这是 LearnCpp 24.7 的进阶部分

友元函数（如 `operator<<`）**不是基类的成员函数**，所以不能用 `Base::operator<<` 调用。解决方案：用 `static_cast` 临时把派生对象当成基类对象：

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
        // 把 Derived 转成 const Base& 以调用基类的 operator<<
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

输出：

```
In Derived
In Base
```

### 9.9 ⚠️ 派生类有同名函数 → 基类的所有同名函数都被"屏蔽"

> 这是个大陷阱（LearnCpp 24.7 后半的核心）：

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
    // 没定义 print(int)
};

int main()
{
    Derived d{};
    d.print(5);   // 调用什么？
}
```

直觉：5 是 int，应该匹配 `Base::print(int)` 才对吧？

**实际**：调用的是 **`Derived::print(double)`**！

**为什么？** 编译器在 Derived 里**找到了一个**叫 print 的函数，于是**只在 Derived 里做重载解析**。Base 的 `print(int)` 根本不会被考虑，即使它是更好的匹配。

### 9.10 解决方案：using-declaration

```cpp
class Derived: public Base
{
public:
    using Base::print;   // ← 让 Base 的所有 print 都进入 Derived 的重载集
    void print(double) { std::cout << "Derived::print(double)\n"; }
};

int main()
{
    Derived d{};
    d.print(5);   // 现在调用 Base::print(int)（更优匹配）
}
```

> 💡 `using Base::print;` 告诉编译器把 Base 中所有名为 print 的函数也算进来一起做重载解析。

### 9.11 PPT Klefstad 没有专门讲这一节，但与第 11 节虚函数密切相关

LearnCpp 24.7 讲的是**普通函数**的重定义。Klefstad 的 PPT 几乎跳过这一节，**直接进入虚函数**。这是因为：在实际项目里，你几乎不会用普通的"重定义"（除非是为了某种 mixin 设计），实际工作中都是**虚函数**。

但考试可能考非虚函数的重定义，所以这一节内容仍要掌握。


---

## 10. 基类指针/引用指向派生对象

> 对应 LearnCpp 25.1 + PPT page 12-13

### 10.1 派生对象的"两部分"内存模型（再回顾）

```
Derived object:
+---------------+
|  Base part    |  ← Base 构造函数初始化
+---------------+
|  Derived part |  ← Derived 构造函数初始化
+---------------+
```

### 10.2 用派生类指针/引用指向派生对象（直觉）

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
    Derived& rDerived{ derived };    // 派生类引用
    Derived* pDerived{ &derived };   // 派生类指针

    std::cout << derived.getName() << '\n';     // "Derived"
    std::cout << rDerived.getName() << '\n';    // "Derived"
    std::cout << pDerived->getName() << '\n';   // "Derived"
}
```

输出：

```
Derived
Derived
Derived
```

### 10.3 ⚡ 关键能力：用**基类指针/引用指向派生对象**

```cpp
int main()
{
    Derived derived{ 5 };

    Base& rBase{ derived };      // ✅ 合法！基类引用指向派生对象
    Base* pBase{ &derived };     // ✅ 合法！基类指针指向派生对象

    std::cout << derived.getName() << '\n';   // "Derived"
    std::cout << rBase.getName() << '\n';     // "Base"   ← 注意！
    std::cout << pBase->getName() << '\n';    // "Base"   ← 注意！
}
```

输出：

```
Derived
Base
Base
```

### 10.4 ⚠️ 为什么是 "Base"？

> 💡 **核心原理**：因为 rBase 和 pBase 是 **Base 的引用/指针**，它们**只能看到** Base 部分的成员（包括 Base 继承的祖先）。即使 Derived 重新定义了 `getName()`，Base 引用看不到 Derived 的部分——所以调用的是 `Base::getName()`。

类似地：通过 pBase 也无法调用 Derived 特有的 `getValueDoubled()`，编译错误。

> 这正是**虚函数（virtual）要解决的问题**——下一节讲。

### 10.5 PPT Klefstad 版本（page 12-13）

```cpp
Menu m;
Window & w = m;        // OK: Menu is a kind of Window
Screen * ps = & w;     // OK: Window is a kind of Screen
```

PPT 用"Animal & rA = c;" 这类表达强调"derived classes introduce a subtype of base class"——派生类是基类的**子类型**。

### 10.6 为什么需要"基类指针/引用指向派生对象"？

LearnCpp 25.1 给出两个核心场景：

#### 场景 1：写一个能处理所有派生类的函数

不用基类指针时，需要为每种派生类写一个重载：

```cpp
void report(const Cat& cat) { ... }
void report(const Dog& dog) { ... }
// ... 30 种动物 → 30 个 report 函数？
```

用基类引用：

```cpp
void report(const Animal& rAnimal)
{
    std::cout << rAnimal.getName() << " says " << rAnimal.speak() << '\n';
}
```

只需**一个**函数就能处理所有 Animal 的派生类！这就是 **多态（polymorphism）** 的基础。

> 💡 **Klefstad 警句（PPT page 12）**：
> "**polymorphic programming** —— new subtypes can be added to a system without changing framework"
> （新增派生类不用改框架代码）

#### 场景 2：异构对象的数组

数组只能装一种类型。如果要混合 Cat 和 Dog：

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

这样可以把不同种类的动物**混进一个数组**，统一处理。

### 10.7 ⚠️ 当前问题：还是只能调用基类版本！

不加 virtual 时，上面所有的 `speak()` 都会调用 `Animal::speak()`：

```
Fred says ???       ← 不是 "Meow"
Garbo says ???      ← 不是 "Woof"
Misty says ???
Pooky says ???
Truffle says ???
Zeke says ???
```

> 💡 这正是 **virtual 函数要解决的核心问题**——下一节揭晓答案。

### 10.8 PPT Klefstad 经典 polymorphic 例子

```cpp
void rotate_all(Shape * vec[], int size, int angle)
{
    for (int i = 0; i < size; i++)
        vec[i]->rotate(angle);   // 调用哪个 rotate？依赖于 vec[i] 的真实类型
}
```

PPT 强调：
- **静态类型（static type）**：声明的类型，比如 `Shape *`
- **动态类型（dynamic type）**：实际指向的类型，比如 `Circle`、`Triangle`

只有**虚函数**才让 `vec[i]->rotate()` 解析到动态类型对应的方法。

---

## 11. 虚函数（virtual）与运行时多态

> 对应 LearnCpp 25.2 + PPT pages 17-22

### 11.1 虚函数的定义

> 💡 **核心定义**：**虚函数（virtual function）** 是一种特殊的成员函数，被调用时会解析到**对象的实际类型**所对应的最派生（most-derived）版本。

简单说：**virtual 让基类指针/引用调用派生类的版本成为可能**。

### 11.2 怎么声明虚函数

在函数声明前加 `virtual` 关键字：

```cpp
class Base
{
public:
    virtual std::string_view getName() const { return "Base"; }
};

class Derived: public Base
{
public:
    virtual std::string_view getName() const { return "Derived"; }   // virtual 可写可不写
};

int main()
{
    Derived derived {};
    Base& rBase{ derived };
    std::cout << "rBase is a " << rBase.getName() << '\n';
}
```

输出：

```
rBase is a Derived       ← 现在调用了 Derived::getName()！
```

### 11.3 什么算"override"（覆盖/重写）？

派生类的函数被认为是基类虚函数的 **override**，必须满足：

| 要求 | 说明 |
|---|---|
| **同名** | 函数名一致 |
| **同参数列表** | 参数类型、个数完全一致 |
| **同 const 性** | 都是 const 或都不是 |
| **同返回类型**（一般） | 返回类型必须匹配（covariant return type 是例外，下节讲） |

> ⚠️ **签名只要差一点点**就不算 override。例如：
> - 基类是 const，派生类不是 → ❌ 不是 override（参见 25.2 Quiz 1e）
> - 参数类型不同 → ❌ 不是 override

### 11.4 PPT Klefstad 版本

```cpp
struct Base {
    virtual int virtual_fn();
    int non_virtual_fn();
};

struct Derived : public Base {
    int virtual_fn() override;       // 重写时 virtual 可省略，但 override 强烈推荐
    int non_virtual_fn();             // 不是虚函数的重定义（隐藏基类版本）
};
```

> 💡 **Klefstad 警句**：
> "**preferred style is to include virtual when overriding**"
> （重写虚函数时**最好仍然加上 virtual 关键字**——增强可读性）
>
> "**once virtual, always virtual**"
> （一旦基类某函数是 virtual，所有派生类的对应 override 自动也是 virtual——即使你不写 virtual）

### 11.5 多级继承中的虚函数解析

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

> 💡 解析逻辑：rBase 是 A 引用，但实际指向 C 对象。从 A 到 C 之间有 A、B、C 三个层级。编译器找**A 到 C 之间**最派生的 getName()——是 `C::getName()`。**不会调用 D::getName()**，因为 c 实际只是 C 对象，**没有 D 部分**。

### 11.6 ⚠️ 虚函数解析**只对指针/引用有效**

> 💡 **Key Insight**：虚函数解析**只在通过指针或引用调用时**起作用。**直接通过对象调用，永远调用对象本身类型的版本**。

```cpp
C c {};
std::cout << c.getName();      // 总是调用 C::getName()

A a { c };                      // 把 c 的 A 部分**拷贝**给 a（叫做 object slicing，谨慎用！）
std::cout << a.getName();      // 总是调用 A::getName()
```

**为什么？** 编译器在通过指针/引用调用时**无法在编译期确定**实际类型，必须在运行期判断。但通过对象直接调用时，编译期就知道类型了。

### 11.7 多态（Polymorphism）的两种形式

> 多态字面意思："多种形态"

| 类型 | 解析时机 | 例子 |
|---|---|---|
| **编译时多态**（compile-time / static polymorphism） | 编译时由编译器决定 | 函数重载、模板 |
| **运行时多态**（runtime / dynamic polymorphism） | 运行时根据对象实际类型决定 | **虚函数** |

### 11.8 完整 Animal/Cat/Dog 示例（带 virtual）

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

输出：

```
Fred says Meow
Garbo says Woof
```

🎉 **正确了！** 通过 Animal 引用调用 `speak()` 时，运行时解析到了正确的派生版本。

> 💡 注意：`getName()` **没有声明为 virtual**——因为派生类没有重写它。**只有需要被派生类重写的函数才需要 virtual**。

### 11.9 ⚠️ 隐式 virtual 规则

> 一旦基类某函数是 virtual，**所有派生类中匹配的 override 都自动是 virtual，即使没写 virtual 关键字**。

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: std::string_view getName() const { return "B"; } };  // 没写 virtual，但仍是 virtual
class C: public B { public: std::string_view getName() const { return "C"; } };  // 同上

int main()
{
    C c {};
    B& rBase{ c };
    std::cout << rBase.getName();   // "C"——B::getName() 被隐式 virtualize
}
```

> ⚠️ **反过来不成立**：派生类标 virtual 但基类没标，**不会让基类函数变 virtual**。所以**总是从基类开始声明 virtual**。

### 11.10 LearnCpp 25.2 经典 Quiz（高频考点）

#### Quiz 1a

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: virtual std::string_view getName() const { return "B"; } };
class C: public B { public: /* 没有 getName() */ };
class D: public C { public: virtual std::string_view getName() const { return "D"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**答案：B**

> 💡 解析：rBase 是 A 引用指向 C 对象。从 A 到 C 之间最派生的 getName 是 `B::getName()`（因为 C 没定义）。**不会调用 D**，因为对象是 C 不是 D。

#### Quiz 1c（最常忘的陷阱）

```cpp
class A { public: std::string_view getName() const { return "A"; } };  // ⚠️ 没 virtual
class B: public A { public: virtual std::string_view getName() const { return "B"; } };
class C: public B { public: virtual std::string_view getName() const { return "C"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**答案：A**

> ⚠️ **陷阱**：A 不是 virtual，**B、C 标 virtual 也救不了**。基类必须先标 virtual。

#### Quiz 1d（隐式 virtual）

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: std::string_view getName() const { return "B"; } };  // 没标 virtual
class C: public B { public: std::string_view getName() const { return "C"; } };  // 没标 virtual

int main()
{
    C c {};
    B& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**答案：C**

> 💡 A 是 virtual → B、C 隐式也是 virtual。rBase 是 B 引用，B 到 C 之间最派生的是 C::getName() → "C"。

#### Quiz 1e（const 不一致）

```cpp
class A { public: virtual std::string_view getName() const { return "A"; } };
class B: public A { public: virtual std::string_view getName() { return "B"; } };  // ⚠️ 不是 const
class C: public B { public: virtual std::string_view getName() { return "C"; } };
class D: public C { public: virtual std::string_view getName() { return "D"; } };

int main()
{
    C c {};
    A& rBase{ c };
    std::cout << rBase.getName();   // ???
}
```

**答案：A**

> ⚠️ **陷阱**：B、C、D 的 getName() **都不是 const**——所以**不算 override**！它们是新的"虚函数"，但与 A 的 getName 不匹配。所以 rBase.getName() 找的是 A 到 C 之间和 A::getName() 签名匹配的最派生版本——只有 A 自己。

#### Quiz 1f（构造函数中调用虚函数）

```cpp
class A {
public:
    A() { std::cout << getName(); }    // ⚠️ 在构造函数里调用虚函数！
    virtual std::string_view getName() const { return "A"; }
};

class B : public A { public: virtual std::string_view getName() const { return "B"; } };
class C : public B { public: virtual std::string_view getName() const { return "C"; } };

int main()
{
    C c {};
}
```

**答案：A**

> ⚠️ **极其重要的陷阱**：构造 C 时，先构造 A 部分。在 A 构造函数内调用虚函数 getName()，此时 **B 和 C 部分还没有被构造**——所以解析到 `A::getName()`。
>
> 这就是为什么 LearnCpp 提出 **Best Practice：永远不要在构造函数或析构函数里调用虚函数！**

### 11.11 ⚠️ Best Practice：不要在构造/析构函数中调用虚函数

> 💡 **关键原则**：
> - **构造函数中**：派生部分还没构造，调用虚函数会解析到当前正在构造的类——而不是最派生类
> - **析构函数中**：派生部分已经销毁，调用虚函数解析到当前类
>
> 都达不到"动态多态"的效果，反而误导新手。

### 11.12 虚函数的开销

> 来自 LearnCpp 25.2 末尾

为什么不把所有函数都标 virtual？

1. **效率开销**：解析虚函数比普通函数慢（要查虚函数表 vtable）
2. **内存开销**：每个含虚函数的类，每个对象需要一个额外指针（vptr）

所以：**只对真正需要被派生类重写的函数标 virtual**。

### 11.13 返回类型必须匹配（一般规则）

```cpp
class Base {
public:
    virtual int getValue() const { return 5; }
};

class Derived: public Base {
public:
    virtual double getValue() const { return 6.78; }  // ❌ 编译错误！返回类型不同
};
```

> ⚠️ Derived::getValue 不被认为是 Base::getValue 的有效 override，编译失败。

例外：**covariant return type**（协变返回类型）—— Derived 版本可以返回 Base 版本返回类型的派生类指针/引用。这在 25.3 详细讲（可能 Week 7）。

### 11.14 PPT Klefstad 关于 virtual 的设计建议

> PPT page 18 给出 Shape 体系的 virtual 用法：

```cpp
class Shape {
public:
    virtual void rotate(int degrees);   // 基类提供默认实现
};

class Circle : public Shape {
public:
    virtual void rotate(int degree) override { /* nothing - no-op */ }   // 圆旋转后还是圆
};

class Rectangle : public Shape {
public:
    virtual void rotate(int degree) override;   // 矩形需要专门实现
};
```

> 💡 **Klefstad 设计哲学**：
> "static binding：**homogeneous** set of similar objects"（静态绑定用于"同质"对象集合）
> "dynamic binding：**heterogeneous** mix of objects"（动态绑定用于"异质"对象集合）

举例：
- `Vector`、`CheckedVector`、`InitVector` —— 都是 vector 的变种，**用静态绑定**（继承复用代码即可）
- `Shape`、`Circle`、`Triangle`、`Rectangle` —— 形状不同，**用动态绑定**（需要不同的 draw、rotate 实现）

---

## 12. 静态绑定 vs 动态绑定

> 对应 PPT page 14-15（Reading 没有专节，但贯穿在 25.1, 25.2 中）

### 12.1 概念定义

| 绑定类型 | 何时决定调用哪个函数 | 触发条件 |
|---|---|---|
| **静态绑定**（static binding / early binding） | **编译时** | 普通函数调用、非虚成员函数 |
| **动态绑定**（dynamic binding / late binding） | **运行时** | 通过指针/引用调用**虚函数** |

### 12.2 PPT 经典对比例子

```cpp
CheckedVector cv(20);
Vector & vp = cv;
do_something_with(vp[0]);
```

`vp[0]` 调用哪个版本的 `operator[]`？

| 假设 | 调用的是 |
|---|---|
| 静态绑定（`operator[]` 没有 virtual） | `Vector::operator[]` ——基于 vp 的**声明类型** |
| 动态绑定（`operator[]` 是 virtual） | `CheckedVector::operator[]` ——基于 vp 实际指向的**对象类型** |

### 12.3 何时用静态绑定？

> Klefstad PPT page 15 总结：

**静态绑定适用场景**：
- 处理"**同质**"对象集合（一组类似的对象）
- 继承用于**复用**基类的实现，不需要"变形"
- 例：`Vector`、`CheckedVector`、`InitVector`、`InitCheckedVector` 都基本一样，只是部分行为差异

### 12.4 何时用动态绑定？

**动态绑定适用场景**：
- 处理"**异质**"对象集合（共享接口但实现完全不同）
- 每个派生类的实现有显著差别
- 例：`Shape`、`Circle`、`Triangle`、`Rectangle`、`Square` —— 都是 Shape，但 draw、rotate 实现完全不同

### 12.5 PPT Klefstad 警句

> Topic 6 page 19：
> "**polymorphism**: when the specific operation invoked by a call depends on the type of an object"
>
> "**static polymorphism**: via overloading"
>
> "**dynamic polymorphism**: via virtual functions
>   - allow defining **plugin frameworks**
>   - browser plugins, Vehicles, Shapes, GUI Widgets"

### 12.6 动态绑定的延伸：可扩展框架

> PPT page 22

虚函数的最大好处：**框架代码不变，新增派生类自动适配**。

```cpp
// 新增一个 Square 类
class Square : public Rectangle {
public:
    virtual void rotate(int degree) override {
        if (degree % 90 != 0)
            Rectangle::rotate(degree);
    }
};

// 框架代码完全不需要改：
void rotate_all(Shape * vec[], int size, int angle)
{
    for (int i = 0; i < size; i++)
        vec[i]->rotate(angle);   // 自动调用 Square::rotate（如有）
}
```

> 💡 这是面向对象设计的核心威力之一：**Open-Closed Principle（开闭原则）**——对扩展开放，对修改封闭。

### 12.7 通过指针/引用 vs 通过值传递

> PPT page 20 强调

```cpp
void rotate_shape(Shape * sp, int degrees) { sp->rotate(degrees); }   // ✅ 多态
void rotate_shape(Shape & sr, int degrees) { sr.rotate(degrees); }    // ✅ 多态
void rotate_shape(Shape s, int degrees)    { s.rotate(degrees); }     // ❌ object slicing！
```

> ⚠️ **千万不要按值传递基类对象**！如果传一个 Circle 进去，**Circle 部分会被切掉**，只剩 Shape 部分——这叫 **object slicing**，详见 25.9（Week 7）。

---

## 13. 纯虚函数、抽象基类与接口类

> 对应 LearnCpp 25.7 + PPT pages 23-24

### 13.1 纯虚函数（Pure Virtual Function）

> 💡 **核心定义**：**纯虚函数（pure virtual function）** 又叫 **抽象函数（abstract function）**——是没有函数体的虚函数，用 `= 0` 标记。它只是个**占位符**，必须由派生类提供实现。

语法：

```cpp
class Base
{
public:
    std::string_view sayHi() const { return "Hi"; }            // 普通成员函数

    virtual std::string_view getName() const { return "Base"; }   // 普通虚函数

    virtual int getValue() const = 0;                              // 纯虚函数

    int doSomething() = 0;   // ❌ 编译错误：非 virtual 函数不能 = 0
};
```

> ⚠️ **只有 virtual 函数才能 `= 0`**。

### 13.2 纯虚函数的两个后果

> 这是必须记住的核心规则：

#### 后果 1：含纯虚函数的类是**抽象基类**，**不能被实例化**

```cpp
class Base
{
public:
    virtual int getValue() const = 0;
};

int main()
{
    Base base{};   // ❌ 编译错误：不能实例化抽象类
}
```

**为什么？** 因为 `getValue()` 没有定义，调用 `base.getValue()` 没有意义。

#### 后果 2：派生类必须提供**所有**纯虚函数的实现，否则它**也变成抽象类**

```cpp
class Cow : public Animal   // Animal 有纯虚 speak()
{
public:
    Cow(std::string_view name) : Animal{ name } { }
    // ❌ 忘了写 speak()
};

int main()
{
    Cow cow{"Betsy"};   // ❌ 编译错误：Cow 还是抽象类
}
```

编译器会明确报错：

```
error: variable type 'Cow' is an abstract class
note: unimplemented pure virtual method 'speak' in 'Cow'
```

### 13.3 完整 Animal 示例（用纯虚函数版本）

```cpp
#include <string>
#include <string_view>

class Animal   // 抽象基类
{
protected:
    std::string m_name {};

public:
    Animal(std::string_view name) : m_name{ name } { }

    const std::string& getName() const { return m_name; }
    virtual std::string_view speak() const = 0;   // ← 纯虚

    virtual ~Animal() = default;   // ← 必须有虚析构函数
};

class Cow : public Animal
{
public:
    Cow(std::string_view name) : Animal(name) { }

    std::string_view speak() const override { return "Moo"; }  // ✅ 必须实现
};

int main()
{
    Cow cow{ "Betsy" };
    std::cout << cow.getName() << " says " << cow.speak() << '\n';
}
// 输出：Betsy says Moo
```

### 13.4 纯虚函数 vs 普通虚函数（带默认实现）

> 这是个常见疑问

| 比较 | 普通虚函数 + 默认实现 | 纯虚函数 |
|---|---|---|
| 基类是否能实例化 | ✅ 能 | ❌ 不能 |
| 派生类**必须**实现 | ❌ 否（可继承默认实现） | ✅ 是（不实现就也是抽象类） |
| 适用场景 | 基类可单独使用，派生类**可选**重写 | 基类只是**接口**，派生类**强制**实现 |

> 💡 **设计哲学**：用纯虚函数的目的是**强制**派生类实现，避免它们"忘记"重写。

### 13.5 纯虚函数也可以**有定义**（罕见，但需要知道）

```cpp
class Animal   // 抽象基类
{
public:
    Animal(std::string_view name) : m_name{ name } { }

    virtual std::string_view speak() const = 0;   // ← 纯虚但有默认实现
    virtual ~Animal() = default;
};

// 注意：定义在类外
std::string_view Animal::speak() const
{
    return "buzz";   // 默认实现
}

class Dragonfly : public Animal
{
public:
    Dragonfly(std::string_view name) : Animal{name} { }

    std::string_view speak() const override
    {
        return Animal::speak();   // 显式调用基类的默认实现
    }
};

int main()
{
    Dragonfly dfly{"Sally"};
    std::cout << dfly.getName() << " says " << dfly.speak() << '\n';
}
// 输出：Sally says buzz
```

> ⚠️ 派生类**仍然必须实现** `speak()`（即使只是调用 `Animal::speak()`），否则也是抽象类。
>
> 💡 **使用场景**（罕见）：基类提供"参考实现"，派生类可以选择直接调用或自己写。
>
> 此外，**纯虚析构函数必须有定义**——否则销毁派生对象时会无法析构基类部分。

### 13.6 接口类（Interface Class）

> 💡 **定义**：**接口类（interface class）** 是一种特殊的抽象基类，满足：
> - **没有任何成员变量**
> - **所有函数都是纯虚函数**
>
> 命名约定：以大写 **I** 开头（如 IErrorLog, IRunnable, IComparable）。

例子：

```cpp
class IErrorLog
{
public:
    virtual bool openLog(std::string_view filename) = 0;
    virtual bool closeLog() = 0;
    virtual bool writeError(std::string_view errorMessage) = 0;

    virtual ~IErrorLog() {}   // 必须有虚析构
};
```

任何继承 IErrorLog 的类都**必须**实现这三个函数，才能被实例化。

### 13.7 接口类的实际使用

设我们要写一个 `mySqrt()` 函数，发生错误时要写日志。

❌ **不灵活的写法**：直接耦合到 `FileErrorLog`：

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

调用者**只能**传 FileErrorLog，扩展性差。

✅ **更好的写法**：依赖接口：

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

调用者可以传任何实现 IErrorLog 的类：
- `FileErrorLog`：写文件
- `ScreenErrorLog`：弹窗显示
- `EmailErrorLog`：发邮件
- 还可以自定义新的子类，**不用改 mySqrt**！

> 💡 这是**依赖反转原则（Dependency Inversion）** 的体现：**依赖抽象，不依赖具体实现**。

### 13.8 接口类与多继承

> LearnCpp 25.7 的延伸

C++ 中接口类极其流行的一个原因：**多继承接口类是安全的**。

普通的多继承（继承多个非接口类）容易引起钻石问题、二义性等麻烦，但**多继承接口类**：
- 接口没有数据成员 → 不会有内存重复
- 接口没有函数实现 → 不会有冲突的实现

> 💡 这就是为什么 Java、C# 等现代语言**禁止**普通多继承，**只允许**多继承接口。C++ 不强制，但多继承时**最好都是接口**。

### 13.9 ⚠️ 必须有虚析构函数

> 这是 LearnCpp 25.7 反复强调的点

**任何含虚函数的类（尤其是抽象基类、接口类），析构函数也必须是 virtual**。

```cpp
class IErrorLog
{
public:
    virtual ~IErrorLog() {}   // ← 必须！
    virtual bool writeError(std::string_view) = 0;
    // ...
};
```

**为什么？** 当通过基类指针删除派生对象时：

```cpp
IErrorLog* log = new FileErrorLog{};
// ... 用一通 ...
delete log;   // 如果析构函数不是 virtual，只调用 IErrorLog 的析构，FileErrorLog 部分泄漏！
```

### 13.10 PPT Klefstad 抽象类示例（page 23-24）

```cpp
class Shape {
public:
    Shape(int x = 0, int y = 0);
    void move(Point to);                       // 非虚，必须有定义
    virtual void draw() = 0;                   // 纯虚
    virtual void rotate(int degrees) = 0;      // 纯虚
};
```

> ⚠️ **Klefstad 警句**：
> "draw() and rotate() can't be written yet, but move() can"
> "**can declare only references or pointers to abstract class**"
> （只能声明指向抽象类的引用或指针，不能创建抽象类对象）

```cpp
class Circle : public Shape {
protected:
    int radius;
public:
    void draw();   // 实现：画圆的代码
    void rotate(int degrees) { /* 圆旋转后还是圆 */ }   // no-op
};

class Rectangle : public Shape {
protected:
    int width, length;
public:
    void draw();
    void rotate(int degrees);   // 矩形旋转代码
};
```

### 13.11 抽象类的虚函数表

> LearnCpp 25.7 末尾的小知识点

为了一致性，**抽象类也有虚函数表（vtable）**。抽象基类的构造/析构函数可以调用虚函数（解析到当前类的版本，因为派生部分还没构造或已经销毁）。

抽象类纯虚函数对应的 vtable 条目：通常是空指针，或指向一个打印错误的"占位"函数（如 `__purecall`）。

### 13.12 Python ↔ C++ 对比

| 概念 | Python | C++ |
|---|---|---|
| 抽象类 | `from abc import ABC` + `@abstractmethod` | `virtual ... = 0;` |
| 接口 | 鸭子类型（duck typing），无强制 | 接口类 = 全纯虚 + 无成员变量 |
| 强制实现 | abstractmethod 有，鸭子类型没有 | 纯虚函数：编译期强制 |

**Python 等价代码：**

```python
from abc import ABC, abstractmethod

class IErrorLog(ABC):
    @abstractmethod
    def writeError(self, msg): pass

    @abstractmethod
    def openLog(self, filename): pass
```

C++ 比 Python 更**严格**：编译期就检查派生类是否实现了所有纯虚函数。


---

## 14. dynamic_cast 与向下转换

> 对应 LearnCpp 25.10 + PPT page 28

### 14.1 上行转换（Upcasting）vs 下行转换（Downcasting）

| 转换方向 | 名称 | 安全性 |
|---|---|---|
| Derived → Base（派生类指针/引用 → 基类指针/引用） | **upcasting** | ✅ 隐式自动安全 |
| Base → Derived（基类指针/引用 → 派生类指针/引用） | **downcasting** | ⚠️ 需要显式转换，可能失败 |

**上行转换**到处都有：

```cpp
Cat cat{"Fred"};
Animal* pAnimal = &cat;   // upcasting，C++ 自动允许
```

但反过来不行：

```cpp
Animal* pAnimal = ...;
Cat* pCat = pAnimal;   // ❌ 编译错误
Cat* pCat = (Cat*)pAnimal;   // C 风格强转：❌ 危险，没有运行时检查
```

### 14.2 `dynamic_cast` 的用途

> 💡 **核心用途**：**安全地把基类指针/引用转换为派生类指针/引用**——并在运行时检查是否真的指向那个派生类。

### 14.3 基本用法

```cpp
class Base
{
protected:
    int m_value{};
public:
    Base(int value) : m_value{value} { }
    virtual ~Base() = default;   // ⚠️ 必须有虚函数（含虚析构），dynamic_cast 才能工作
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

    Derived* d{ dynamic_cast<Derived*>(b) };   // 把 Base* 转为 Derived*

    std::cout << "The name of the Derived is: " << d->getName() << '\n';

    delete b;
}
// 输出：The name of the Derived is: Apple
```

### 14.4 ⚠️ 失败时的行为

如果 `dynamic_cast` 失败（即 `b` 实际**不是** Derived 对象），返回 **空指针 nullptr**。

```cpp
Base* b{ getObject(false) };   // 实际是 Base 对象
Derived* d{ dynamic_cast<Derived*>(b) };   // d == nullptr
d->getName();   // ❌ 解引用 nullptr → 未定义行为（可能崩溃）
```

> 🚨 **Rule（LearnCpp 强调）**：
> **务必检查 dynamic_cast 的结果是否为 nullptr**！

正确写法：

```cpp
Base* b{ getObject(true) };
Derived* d{ dynamic_cast<Derived*>(b) };

if (d)   // ← 必须检查
    std::cout << "The name of the Derived is: " << d->getName() << '\n';

delete b;
```

### 14.5 dynamic_cast 与引用

```cpp
Derived apple{1, "Apple"};
Base& b{ apple };
Derived& d{ dynamic_cast<Derived&>(b) };   // 引用版本
std::cout << d.getName() << '\n';
```

> ⚠️ **不同点**：因为**没有"空引用"**，`dynamic_cast` 用于引用时**失败会抛 `std::bad_cast` 异常**。

### 14.6 dynamic_cast vs static_cast 用于下行转换

| 比较 | static_cast | dynamic_cast |
|---|---|---|
| 运行时检查 | ❌ 无 | ✅ 有 |
| 速度 | ✅ 快 | ⚠️ 慢（要查 RTTI） |
| 失败行为 | **未定义行为**（成功"转换"但实际指错对象） | 返回 nullptr 或抛 bad_cast |
| 何时用 | **绝对确定**指向派生对象时 | 不确定，需要安全检查时 |

> 💡 **简单原则**：
> - **上行转换**：用 static_cast 或自动转换
> - **下行转换**：用 dynamic_cast（除非 100% 确定）

### 14.7 ⚠️ dynamic_cast 失效的场景

LearnCpp 25.10 列出几种 dynamic_cast 不能下行转换的情况：

1. **保护或私有继承**（protected/private inheritance）
2. **类没有声明或继承任何虚函数**——没有虚函数表，dynamic_cast 找不到 RTTI 信息
3. **某些涉及虚基类的复杂情形**

### 14.8 PPT Klefstad 版本（page 28）

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
    Base *bp = &d;       // ✅ OK，a Derived is a Base
    Derived *dp = &b;    // ❌ 错误，b is NOT a Derived
}
```

> 💡 **Klefstad 警句（PPT page 28）**：
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

### 14.9 应该尽量用虚函数代替 dynamic_cast

> LearnCpp 25.10 末尾的设计建议

> 💡 **首选虚函数**：能用虚函数解决的就别用 dynamic_cast。一些开发者甚至认为 "dynamic_cast 是邪恶的，是糟糕设计的迹象"。

但有几种**合理使用 dynamic_cast** 的场景：

1. **基类不能修改**（如标准库的类，没法加虚函数）
2. **派生类有特定功能**，且这功能在基类里没意义（比如基类没法返回有意义的默认值）
3. **强行加虚函数会破坏基类设计**

### 14.10 dynamic_cast 与 RTTI

> 小知识：来自 LearnCpp 25.10 末尾

**RTTI（Run-Time Type Information，运行时类型信息）** 是 C++ 的一个特性，让程序在运行时获取对象的实际类型信息。`dynamic_cast` 依赖 RTTI 工作。

⚠️ 一些编译器允许关闭 RTTI 来优化性能（节省虚函数表的额外信息）——**关 RTTI 后 dynamic_cast 会失效**。

### 14.11 Python ↔ C++ 对比

| 概念 | Python | C++ |
|---|---|---|
| 类型检查 | `isinstance(obj, Derived)` | `if (auto* p = dynamic_cast<Derived*>(b))` |
| 强转失败 | `TypeError` 异常 | dynamic_cast 返回 nullptr 或抛 bad_cast |
| 鸭子类型 | 不需要 isinstance（看能否调用方法） | 严格类型，必须显式转换 |

---

## 15. 用 operator<< 打印继承类对象

> 对应 LearnCpp 25.11

### 15.1 问题：直接重载 operator<< 不能多态

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
    std::cout << bref << '\n';   // 输出什么？
}
```

输出：

```
Base
```

> ⚠️ **不是我们想要的**！通过 Base 引用调用 `<<`，调用的是 `operator<<(std::ostream&, const Base&)`，没有动态分发到 Derived 的版本。

### 15.2 为什么 operator<< 不能直接做成 virtual？

LearnCpp 25.11 给出两个原因：

#### 原因 1：只有成员函数能 virtual

> 💡 友元函数**不是**类的成员，所以**不能** virtual。

但我们一般把 operator<< 写成友元（因为左操作数是 ostream，不能写成成员）。

#### 原因 2：参数类型不匹配，不算 override

即使能让友元 virtual，Base 的版本接 `const Base&`，Derived 的版本接 `const Derived&`——参数类型**不一样**，不构成 override。

### 15.3 ✅ 解决方案：把"打印逻辑"委托给虚成员函数

> 🌟 **核心模式**：operator<< 是友元（不能 virtual），但**它内部调用的成员函数**可以是 virtual。

#### 方案 1：返回字符串

```cpp
#include <iostream>

class Base
{
public:
    // 友元 operator<<（不能 virtual）
    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        out << b.identify();   // ← 调用虚成员函数
        return out;
    }

    // 虚成员函数（能 virtual）
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
    std::cout << b << '\n';      // 调用 Base::identify() → "Base"

    Derived d{};
    std::cout << d << '\n';      // 自动 upcast 到 Base&，b.identify() 解析到 Derived → "Derived"

    Base& bref{ d };
    std::cout << bref << '\n';   // 同上 → "Derived"
}
```

输出：

```
Base
Derived
Derived
```

✅ 完美工作！而且**不需要给每个派生类都写 operator<<**——一个就够。

### 15.4 解析过程（重要！）

这段代码每行都做了什么：

| 代码 | 解析 |
|---|---|
| `std::cout << b;` | 匹配 `operator<<(ostream&, const Base&)`，b 是 Base，b.identify() → `Base::identify()` → "Base" |
| `std::cout << d;` | 编译器先找 `operator<<(ostream&, const Derived&)`——没找到。再找接 Base 的版本——找到，d 自动 upcast 为 Base&。`b.identify()` 是虚函数，解析到 `Derived::identify()` → "Derived" |
| `std::cout << bref;` | 直接匹配接 Base 的版本，bref 实际指向 Derived，虚函数解析到 `Derived::identify()` → "Derived" |

### 15.5 方案 2：更灵活——把 stream 传给虚函数

方案 1 的局限：

1. 假设输出都能用一个字符串表示
2. 虚成员函数没法访问 stream 对象（如果要打印的内容是另一个有 operator<< 的对象，不方便）

更好的设计：让虚函数**直接接收 stream**，自己负责打印。

```cpp
#include <iostream>

class Base
{
public:
    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        return b.print(out);   // ← 把 stream 传给虚函数
    }

    virtual std::ostream& print(std::ostream& out) const
    {
        out << "Base";
        return out;
    }
};

// 一个有自己 operator<< 的类（举例）
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
        out << m_e;   // ← 现在能直接用 stream，调用 Employee 的 operator<<
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

输出：

```
Base
Derived: Employee(Jim, 4)
Derived: Employee(Jim, 4)
```

> 💡 **设计模式名**：这是 **Template Method（模板方法）模式** 的简化版——基类定义算法骨架（operator<<），可变部分（print）由派生类实现。

### 15.6 ⚠️ 这个模式贯穿继承体系的核心思想

> 同样的思路也用于：
> - 析构函数：基类的虚析构函数被自动调用，派生类不需要"调用基类析构"
> - 复制构造、赋值操作符：通常通过 `clone()` 虚成员函数实现深拷贝（HW6 用得到）

PPT page 36（Klefstad）就提到了 `clone()` 模式：

> "We add **clone() method** to each Shape. Picture::add() will clone the object passed in."

这里思路一致：基类提供一个虚的 clone()，派生类各自重写，返回自己的副本。

---

## 16. Klefstad 扩展示例：Vector 与 CheckedVector

> 对应 PPT pages 7-13（Reading 没专节，但用作演示继承用例）

### 16.1 基类 Vector

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
    v[6] = v[5] + 4;   // oops, no init values（使用未初始化的内存）
    int i = v[10];      // oops, out of range!（越界访问）
}
```

> ⚠️ Klefstad 用这个例子演示了 Vector 的**两个常见问题**：
> 1. 元素没初始化就用
> 2. 下标越界

### 16.2 通过继承定制 Vector：CheckedVector

> 不修改 Vector 源码，**通过继承**加上越界检查：

```cpp
class CheckedVector : public Vector {
public:
    CheckedVector(int s) : Vector{s} { }

    int & operator[](int i) {
        if (i < 0 || i >= size())
            throw range_error();
        else
            return (*(Vector *)this)[i];   // 转成 Vector* 调用基类 operator[]
    }
    // size() 和 ~Vector 从 Vector 继承
};

int main()
{
    CheckedVector v{10};
    int i = v[10];   // ✅ 现在能检测到越界！
}
```

> 💡 这是 Klefstad PPT page 8 强调的"**Tailoring Library**"思想：
>
> "inheritance allows extending a type hierarchy
>   - **need not copy/modify existing source code**
>   - e.g., derive a new class CheckedVector
>     - it inherits characteristics of Vector
>     - can modify operator[]()
>   - e.g., derive a new class InitVector
>     - define constructor to initialize elements"

### 16.3 派生类访问基类的内部表示

如前面 6.4 看到的，Klefstad 在 PPT page 11 给出了 Vector 的"v2"版本：

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

> 💡 通过 protected 提供"内部接口"，派生类可以高效访问数据，而不必走 public 接口的开销（如重复检查）。

### 16.4 静态绑定的典型场景

PPT page 15 强调：Vector / CheckedVector / InitVector 这种"同质的派生家族"，最适合用**静态绑定**——继承用于复用代码，operator[] 用普通成员函数（**不需要 virtual**）。

```cpp
CheckedVector cv(20);
Vector & vp = cv;
do_something_with(vp[0]);   // 静态绑定：调用 Vector::operator[]
```

> ⚠️ 所以 PPT 这里的 operator[] **故意不是 virtual**——因为这是静态绑定的应用场景。

---

## 17. Klefstad 扩展示例：Picture/Shape 框架（HW6）

> 对应 PPT pages 36-41（HW6 题目背景）

### 17.1 框架设计目标

PPT page 36 说：
> "Memory Management
>   - Who owns the heap memory? Our decision!
>     - Shape? No
>     - Picture? Yes
>   - Shapes are allocated with `new`, then added to our Picture
>     - Picture **now owns** those shapes
>     - **Who must delete them?**
>   - We add **clone()** method to each Shape
>     - Picture::add() will **clone** the object passed in"

> 💡 **Klefstad 警句**：
> 与 Week 4-5 的 RAII 一脉相承——**资源必须有明确的所有者，且由所有者负责清理**。

### 17.2 Shape 基类（抽象）

```cpp
class Shape
{
public:
    Shape() { /* 所有 Shape 共有的构造逻辑 */ }
    virtual double perimeter() = 0;     // 纯虚函数
    virtual ~Shape() = default;          // 必须有虚析构！
};
```

> ⚠️ 因为有纯虚函数，Shape **不能被实例化**——它只是个"接口"。

### 17.3 Picture 类（容器）

```cpp
class Picture
{
    // 内部可以用数组或单链表实现
public:
    Picture();                          // 构造为空 picture
    void add(Shape * sp);               // 添加一个 Shape（指针所有权转移到 Picture）
    double total_perimeter();           // 所有 Shape 的周长之和
    ~Picture();                         // 必须释放所有持有的 Shape
};
```

> 💡 注意：Picture 的成员函数**全都不是 virtual**——因为我们不需要派生 Picture 类。

### 17.4 添加具体派生类：Triangle

```cpp
// Picture 完全不知道 Triangle 的存在，只知道 Shape！
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

> 💡 **设计精髓**：Triangle 实现了 perimeter()，所以它是**具体类**（concrete class），可以实例化。
>
> **Picture 不需要知道 Triangle 是什么**——它只通过 Shape* 操作。这就是多态的强大之处。

### 17.5 添加具体派生类：Square

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

### 17.6 主程序

```cpp
int main()
{
    Picture p;
    p.add(new Triangle(10.4, 10.5, 20.6));   // 在堆上创建，指针交给 Picture
    p.add(new Square(10.5));

    cout << "Total perimeter = " << p.total_perimeter() << endl;

    // p 离开作用域时自动析构，删除所有 Shape
}
```

> 💡 **Klefstad 警句**：
> "We can write the entire framework with **only Picture and Shape**
>   - but to test, we must define at least one concrete shape
>   - e.g., Triangle"

### 17.7 关键点总结

| 设计点 | 说明 |
|---|---|
| Shape 用纯虚函数 | 强制派生类实现 perimeter() |
| Shape 有虚析构 | 通过 Shape* 删除时正确析构派生部分 |
| Picture 持有 Shape* | 通过基类指针实现异构容器 |
| Picture 拥有 Shape | Picture 析构时必须 delete 所有 Shape* |
| add() 接受 Shape* | 任何派生类都能加入，不用改 Picture 代码 |
| total_perimeter 用虚函数 | 自动调用各派生类的 perimeter() |

### 17.8 PPT page 35：Picture 析构函数（链表版）

```cpp
~Picture()
{
    ListNode *tmp = nullptr;

    for (ListNode * p = head; p != nullptr; p = tmp)
    {
        tmp = p -> next;
        delete p;          // 注意：链表节点中存的是 Shape* 指针，
                           // 删除节点时也要 delete 对应的 Shape！
    }
}
```

> ⚠️ **完整的 Picture 析构应该 delete 两层**：
> 1. delete 链表节点（ListNode）
> 2. **同时** delete 节点指向的 Shape 对象（Shape *）
>
> 这是 Week 5 学的链表析构模式（先存指针、再前进、再 delete）的扩展。

---

## 18. Klefstad PPT 中的"看学生提交"片段

> 对应 PPT pages 32-35（"Look at some submissions"）

PPT 用学生作业中的代码片段作为反例和考察点。这些是 Klefstad 特有的考点。

### 18.1 片段 1：错误的 Square 多继承

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

> ⚠️ 这里涉及**虚继承（virtual public）**——多继承时避免菱形继承的钻石问题。
>
> Klefstad 在 Week 6 PPT 里把它当成预告展示；详细规则在 **Week 7 §17** 里讲。

### 18.2 片段 2：空 print() 与析构里 delete this（极坏例子）

```cpp
class Triangle : public Shape
{
    void print();   // ⚠️ 没有定义！为什么没运行时错误？

    ~Triangle()
    {
        delete this;   // ⚠️ is this ever right?（这样真的对吗？）
    }
};
```

> 💡 **两个陷阱**：
>
> **(1) `void print();` 没有定义**：
> - **链接器**报错（链接时找不到符号），不是运行时错误。
> - 但只有真的调用 print() 时才会触发链接错误——如果代码里完全没调用过，可能不报错。
>
> **(2) `delete this;` 在析构函数里**：
> - **极其错误**！析构函数本身已经被调用，再 delete this 会**再次调用析构函数**——无限递归！
> - 这是 PPT 故意展示的反例。

### 18.3 片段 3：Picture 析构函数（已经在 17.8 节展示）

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

> 这个写法**正确**：用 tmp 暂存 next，再 delete p——避免 dangling pointer。
> 但它**只删了 ListNode**，**没删 Shape**——如果 ListNode 里也存了 Shape*，那就有泄漏。

---

## 19. Week 6 综合 Cheat Sheet

### 19.1 继承的语法快速参考

```cpp
// 基本继承
class Derived : public Base { ... };

// 派生类构造函数显式调用基类构造
class Derived : public Base {
public:
    Derived(int cost, int id)
        : Base{ id }    // 必须！否则用基类默认构造
        , m_cost{ cost }
    { }
};

// 重写虚函数（推荐写法）
class Derived : public Base {
public:
    virtual void foo() override { ... }   // virtual 可省略，但 override 推荐
};

// 抽象基类（含纯虚函数）
class Shape {
public:
    virtual double area() = 0;   // 纯虚
    virtual ~Shape() = default;   // 必须有虚析构！
};
```

### 19.2 访问修饰符 × 继承方式 总表（必背）

| 基类成员 | public 继承 | protected 继承 | private 继承 |
|:---:|:---:|:---:|:---:|
| public | public | protected | private |
| protected | protected | protected | private |
| private | 不可访问 | 不可访问 | 不可访问 |

### 19.3 类成员谁能访问？

| 修饰符 | 类自身 + 友元 | 派生类 | 外部代码 |
|:---:|:---:|:---:|:---:|
| public | ✅ | ✅ | ✅ |
| protected | ✅ | ✅ | ❌ |
| private | ✅ | ❌ | ❌ |

### 19.4 函数解析顺序

| 调用方式 | 解析规则 |
|---|---|
| `obj.func()` | 先在 obj 的类型里找；找到任何 func（即使签名不匹配）就在该类做重载解析；找不到才向上 |
| `pBase->func()` 或 `rBase.func()`（func 不是 virtual） | **静态绑定**：根据 pBase/rBase 的**声明类型**调用 |
| `pBase->func()` 或 `rBase.func()`（func 是 virtual） | **动态绑定**：根据**实际指向的对象类型**调用最派生版本 |

### 19.5 虚函数的关键规则

| 规则 | 备注 |
|---|---|
| 只有成员函数能 virtual | 友元函数不能 virtual |
| override 要求**完全相同的签名 + const 性 + 返回类型** | 一个字不能差 |
| 一旦 virtual，所有 override 隐式 virtual | "once virtual, always virtual" |
| 派生类 virtual 不能让基类 virtual | 必须从基类开始 |
| **虚函数解析只对指针/引用有效** | 直接对象调用永远是该类型版本 |
| 不要在构造/析构里调用虚函数 | 派生部分还没构造或已销毁 |
| 含虚函数的类必须有**虚析构函数** | 否则通过 Base* 删除会泄漏 |

### 19.6 纯虚函数 vs 普通虚函数

| 特性 | 普通虚 + 默认实现 | 纯虚（= 0） |
|---|---|---|
| 基类能否实例化 | ✅ | ❌（抽象类） |
| 派生类必须实现 | ❌ | ✅（否则也是抽象类） |
| 函数是否可有定义 | 当然有 | 可有可无（罕见有定义） |
| 适用场景 | 派生类**可选**重写 | 派生类**强制**实现 |

### 19.7 dynamic_cast vs static_cast

| 比较 | static_cast | dynamic_cast |
|---|---|---|
| 检查时机 | 编译时 | 运行时 |
| 失败行为（指针） | 返回但是无效（UB 风险） | nullptr |
| 失败行为（引用） | 同上 | 抛 `std::bad_cast` |
| 速度 | 快 | 慢（查 RTTI） |
| 用于上行转换 | ✅ 推荐（或自动转） | ✅ 也可，但浪费 |
| 用于下行转换 | ⚠️ 仅当 100% 确定时 | ✅ 推荐 |
| 要求基类有虚函数 | ❌ 不需要 | ✅ 必须 |

### 19.8 多态分类

| 多态类型 | C++ 实现方式 | 解析时机 |
|---|---|---|
| 静态多态 | 函数重载、运算符重载、模板 | 编译时 |
| 动态多态 | **虚函数 + 指针/引用** | 运行时 |

### 19.9 静态绑定 vs 动态绑定的应用场景

| 场景 | 用什么 |
|---|---|
| 同质对象集合（Vector 系列） | 静态绑定，普通继承 |
| 异质对象集合（Shape 系列） | 动态绑定，虚函数 |
| 框架 + 插件 | 动态绑定，虚函数 |

### 19.10 用 operator<< 打印继承类的标准模板

```cpp
class Base
{
public:
    friend std::ostream& operator<<(std::ostream& out, const Base& b)
    {
        return b.print(out);   // 委托给虚成员函数
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

### 19.11 Python ↔ C++ 综合对比（Week 6 重点）

| 概念 | Python | C++ |
|---|---|---|
| 继承语法 | `class Sub(Sup):` | `class Sub : public Sup` |
| 调用基类构造 | `super().__init__(...)` | 初始化列表 `: Sup{...}` |
| 抽象类 | `from abc import ABC` + `@abstractmethod` | 含纯虚函数（`= 0`） |
| 接口 | 鸭子类型（无强制） | 全纯虚函数 + 无成员变量 |
| 多态 | 默认所有方法都是"虚的" | 默认非虚，需显式 `virtual` |
| 类型检查 | `isinstance(x, T)` | `dynamic_cast<T*>(p)` |
| 多继承 | 直接支持，常见 | 支持但复杂，慎用 |
| 钻石继承解决 | MRO（C3 算法） | 虚基类（virtual） |
| 访问修饰符 | 约定 `_attr`、`__attr` | 强制 `public/protected/private` |

### 19.12 易错点清单（必看）

| # | 错误 | 后果 | 预防 |
|---|---|---|---|
| 1 | 在派生类初始化列表里初始化继承的成员 | 编译错误 | 用 `: Base{...}` 调用基类构造 |
| 2 | 派生类签名差一点（const 不一致、参数差等） | 不算 override，仍调用基类版本 | 加 `override` 关键字让编译器检查 |
| 3 | 基类 virtual，派生类没 virtual | 实际上是 override（隐式 virtual） | 仍推荐写 virtual + override |
| 4 | 派生类 virtual，基类没 virtual | **不会** override！ | 必须从基类开始声明 virtual |
| 5 | 在构造/析构函数里调用虚函数 | 解析到当前类，不是最派生类 | 永远不要这样做 |
| 6 | 含虚函数但析构不是 virtual | 通过 Base* delete 时派生部分泄漏 | 任何虚类都加虚析构 |
| 7 | 通过基类对象（不是引用/指针）调用 | 不会动态分发；可能 object slicing | 用引用或指针 |
| 8 | dynamic_cast 不检查 nullptr | 解引用空指针，UB | 总是检查 `if (p) ...` |
| 9 | 派生类有同名函数，但签名不匹配 | 基类同名函数被屏蔽 | 用 `using Base::func;` |
| 10 | 友元 operator<< 想做 virtual | 编译错误 | 委托给虚成员函数 print() |
| 11 | 派生类调用基类同名函数没加 `Base::` | 无限递归 | 总是写 `Base::func()` |
| 12 | 多继承钻石问题 | 数据重复或歧义 | 用 virtual 继承，或避免多继承 |
| 13 | 派生类没实现纯虚函数 | 派生类也变成抽象类，无法实例化 | 检查所有纯虚都被实现 |
| 14 | 抽象类构造里调用纯虚函数 | UB | 永远不要这样做 |
| 15 | 用 `delete this;` 在析构函数中 | 无限递归 | 别这样写 |

### 19.13 Klefstad 警句汇总

| 警句 | 含义 |
|---|---|
| "implementation is a misuse of public inheritance" | 用 public 继承做"实现复用"是滥用——除非真的 is-a |
| "preferred style is to include virtual when overriding" | 重写时也写 virtual，可读性好 |
| "once virtual, always virtual" | 基类虚则子类隐式虚 |
| "polymorphism: when the specific operation invoked by a call depends on the type of an object" | 多态的本质 |
| "dynamic binding allows defining plugin frameworks" | 动态绑定的最大用途：可扩展框架 |
| "Who owns the heap memory? Our decision!" | 设计层面明确所有权 |
| "Can declare only references or pointers to abstract class" | 抽象类不能实例化，但可以引用 |
| "static binding: homogeneous; dynamic binding: heterogeneous" | 同质用静态，异质用动态 |
| "delete this; // is this ever right?" | 反例——基本上永远不要这样做 |

---

## 20. Week 6 最重要的五条记忆

### 1. **派生类构造函数必须**用初始化列表**调用**基类构造函数

```cpp
class Derived : public Base {
    Derived(int cost, int id)
        : Base{ id }      // ← 必须！不写就调用 Base 的默认构造（可能不存在）
        , m_cost{ cost }
    { }
};
```

**原因**：继承的成员**不能**在派生类的初始化列表里初始化（这是 C++ 强制的）；只有基类的构造函数才能初始化基类的成员。

**类比**：派生对象 = Base 部分 + Derived 部分。Base 部分**先构造**，Derived 部分**后构造**；析构顺序相反。

### 2. **virtual 函数解析只对指针/引用有效**——这是动态绑定的唯一形式

```cpp
Cat cat{"Fred"};
Animal& a = cat;       // 引用
a.speak();             // 调用 Cat::speak()——动态绑定 ✅

Cat cat2{"Misty"};
Animal a2 = cat2;      // ⚠️ 拷贝！只拷贝 Animal 部分（object slicing）
a2.speak();            // 调用 Animal::speak()——丢失 Cat 信息 ❌
```

**核心原则**：
- 通过指针/引用调用虚函数 → 解析到对象的**实际类型**
- 通过对象本身调用 → 解析到对象的**声明类型**
- 不要按值传递可能被多态使用的基类对象——会 object slicing

**对应规则**：基类用 `virtual`，派生类**应该写**`override`（让编译器检查签名匹配）。**没标 virtual 的基类函数**，派生类怎么写都不是 override。

### 3. **抽象类（含纯虚函数）不能实例化**——这是接口设计的核心机制

```cpp
class Shape {
public:
    virtual double area() = 0;     // 纯虚
    virtual ~Shape() = default;    // 必须！
};

Shape s;          // ❌ 编译错误：抽象类不能实例化
Shape* sp = new Triangle{...};   // ✅ 但能用基类指针指向派生对象
```

**两个用途**：
- **强制派生类实现**关键函数（避免"忘记重写"）
- **接口类**（无成员变量 + 全纯虚）实现"依赖抽象不依赖具体"

**必须有虚析构**！否则 `delete sp;` 时派生类部分泄漏。

### 4. **public/protected/private 三种继承方式 × 三种成员修饰符 = 9 种组合**

最常用：**public 继承 + 各种成员修饰符**——保持原样：

| 基类 | public 继承后 |
|:---:|:---:|
| public | public |
| protected | protected |
| private | 不可访问 |

> **Best Practice**（LearnCpp + Klefstad 共识）：
> - 默认用 **public 继承**——99% 的情况
> - 默认成员用 **private**——只有派生类需要直接访问时才用 protected
> - "private inheritance" 罕见；"protected inheritance" 几乎不用

### 5. **动态多态的核心模式**：基类指针/引用 + 虚函数 = 框架可扩展

```cpp
// 框架代码
void rotate_all(Shape* vec[], int size, int angle) {
    for (int i = 0; i < size; i++)
        vec[i]->rotate(angle);   // 动态分发
}

// 添加新派生类完全不需要改框架！
class Hexagon : public Shape {   // 新加一个
public:
    virtual void rotate(int degrees) override { /* 新逻辑 */ }
};
```

**Klefstad 哲学**：
- 静态绑定 → 处理同质集合（Vector / CheckedVector）
- 动态绑定 → 处理异质集合（Shape / Circle / Triangle）

**`dynamic_cast` 是逃生舱**——用于必须从基类指针获取派生类信息的场景。**首选虚函数**，不到万不得已不用 dynamic_cast。

**`operator<< + virtual print()` 是常用 idiom**——把不能 virtual 的友元变相做成多态。

---

> **本周阅读覆盖**：
> - LearnCpp 24.1 (Introduction to inheritance) — 完整覆盖
> - LearnCpp 24.2 (Basic inheritance in C++) — 完整覆盖
> - LearnCpp 24.3 (Order of construction of derived classes) — 完整覆盖
> - LearnCpp 24.4 (Constructors and initialization of derived classes) — 完整覆盖（含完整 Quiz 题解）
> - LearnCpp 24.5 (Inheritance and access specifiers) — 完整覆盖
> - LearnCpp 24.6 (Adding new functionality to a derived class) — 完整覆盖
> - LearnCpp 24.7 (Calling inherited functions and overriding behavior) — 完整覆盖（含 using-declaration 与 friend operator<<）
> - LearnCpp 25.1 (Pointers and references to the base class) — 完整覆盖
> - LearnCpp 25.2 (Virtual functions and polymorphism) — 完整覆盖（含全部 Quiz 1a–1f 解析）
> - LearnCpp 25.7 (Pure virtual functions, abstract base classes, interface classes) — 完整覆盖
> - LearnCpp 25.10 (Dynamic casting) — 完整覆盖
> - LearnCpp 25.11 (Printing inherited classes using operator<<) — 完整覆盖
>
> **PPT 整合情况**：
> - Klefstad *Topic 6: Inheritance & Polymorphism* PPT 几乎完全融入各章节：
>   - 继承基础（pages 2-7）→ 第 2、3 节
>   - HW6 类层级（page 4）→ 第 2.5 节
>   - Vector / CheckedVector 例子（pages 7-13）→ 第 16 节
>   - Static vs Dynamic Binding（pages 14-15）→ 第 12 节
>   - Virtual 方法与多态（pages 17-22）→ 第 11、12 节
>   - 抽象基类（pages 23-25）→ 第 13 节
>   - 创建/销毁派生类（page 25）→ 第 5 节
>   - public/protected/private 继承（page 27）→ 第 7 节
>   - dynamic_cast（page 28）→ 第 14 节
>   - 看学生提交（pages 32-35）→ 第 18 节
>   - Picture/Shape 框架（pages 36-41）→ 第 17 节
>
> **PPT 中已移至 Week 7 的内容**（见 Week 7 §17）：
> - 多继承（pages 29-31）
> - 虚基类（pages 30、33）
>
> **本周 PPT 顺带提到、由 LearnCpp 后续讲解的内容**：
> - PPT 中提到的 Slicing（page 20，"What about this? `void rotate_shape(Shape s, ...)`"）—— 简要在第 11.6 节带过，详见 LearnCpp 25.9（应属 Week 7）