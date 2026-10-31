# Information and Computer Science 46 — Lecture 1：随机性、引用与指针

## 目录

- [1. 随机性与随机数生成](#1-随机性与随机数生成)
- [2. C++ 引用](#2-c-引用)
- [3. C++ 指针](#3-c-指针)
- [4. 智能指针与所有权](#4-智能指针与所有权)
- [5. 课堂活动（附解答）](#5-课堂活动附解答)
- [6. 速查与必记的 5 个要点](#6-速查与必记的-5-个要点)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh，Fall 2026，周二 09/29/26
> 本笔记基于 Lecture 1 幻灯片（第 1–31、35 页），并以 Thornton 的 ICS 46 笔记（随机性、智能指针）、Thornton 的 ICS 45C 笔记（指针与堆）以及 W. Brown 的 *Random Number Generation in C++11*（N3551，见总结页链接）作为补充。按概念而非按资料来源组织。

> 📅 **课程安排**
> **Lab 1** 已发布，截止时间 **Mon 10/5**：配置环境，编译一个小测试程序，提交到 **Gradescope**（所有作业、实验和项目都用它提交）。
> **编程环境**：**UCI ICS OpenLab JupyterHub** 上的 VS Code + C++——评分就在这个环境中进行，配置说明见 Lab 1。请关闭 Copilot 和其他任何 AI 辅助工具。
> 习题集的 **Pensive** 链接已发布。**答疑时间**日历已更新：Prof. Yeh 周二/周四 5–6 pm（ICS1 195）；讲课周二/周四 3:30–4:50；Discussion 在周五。
> 为什么学这门课：面试题历来侧重数据结构与算法。
> 今天的目标：随机性、引用、指针、智能指针。

---

## 1. 随机性与随机数生成

### 1.1 “随机”是什么意思

一个序列是**随机的**，是指即使看过之前所有的值，也没有人能比碰运气做得更好地预测下一个值；我们的目标是让程序能够*生成*这样的序列（幻灯片 6）。用途：**机器学习**（权重初始化、训练/测试集划分、SGD）、**安全**（密钥、令牌——可预测的密钥就是可被猜到的密钥）、**模拟**（Monte Carlo，改变种子）、**游戏**（世界生成、NPC 决策）。

### 1.2 真随机与伪随机

幻灯片 7 把随机数生成器（random number generator，RNG）分成两类：

| | 真随机（TRNG / 硬件 RNG） | 伪随机（PRNG） |
|---|---|---|
| 方式 | 测量不断变化的**物理现象** | 根据上一个内部状态**计算**出每个值 |
| 例子 | 骰子、硬币、扑克牌；网络流量、温度、熔岩灯；大气噪声（random.org） | Mersenne Twister、线性同余生成器 |
| 可复现？ | 否 | **是**——种子相同，序列相同 |
| 速度 | 受限（收集熵需要时间） | 非常快 |

标题页的照片是 Cloudflare 的熔岩灯“熵之墙”（Wall of Entropy），是一个真实的 TRNG 来源。

> 📘 **课外补充**（Thornton，随机性）：熵（entropy）很稀缺——操作系统每秒只能观测到有限数量的不可预测事件。所以实际程序会把两者结合：从熵源取**一个**值作为**种子**，再让快速的 PRNG 把它扩展成很长的序列。

### 1.3 给引擎设置种子

在 `<random>` 中，PRNG 叫作**引擎**（engine），创建时要给它一个**种子**（seed）（幻灯片 8）。

**方式 01——固定种子**：每次运行得到相同的序列；最适合测试、模拟和调试。

```cpp
#include <random>
const unsigned int SEED = 123;
std::default_random_engine engine{SEED};
```

**方式 02——熵源**：`std::random_device` 读取操作系统/硬件的熵；要**调用**它才能得到一个种子。每次运行序列都不同；用于正式运行。

```cpp
#include <random>
std::random_device device;
std::default_random_engine engine{device()};   // note the ()
```

> ⚠️ **易错点**：固定种子只在**同一个标准库**上才能复现序列——`default_random_engine` 由各厂商自行选择实现，所以 g++ 和 MSVC 对种子 123 可能打印出不同的数。如果需要在任何地方都得到相同结果，请用 `std::mt19937`。

### 1.4 分布：均匀分布与正态分布

引擎产生的是原始的均匀比特；**分布**（distribution）把它们整形成你想要的值（幻灯片 9）。

- **均匀整数分布**：取 [min, max] 内的整数，**两端都包含**，每个值等可能（平坦）。
- **正态/高斯分布**：以**均值**为中心的钟形曲线；**标准差**决定分散程度（例如考试成绩）。

```cpp
// Equal chance for 1, 2, 3, 4, 5, or 6
std::uniform_int_distribution<int> distribution{1, 6};

double mean = 10.0;
double stddev = 3.0;
std::normal_distribution<double> d(mean, stddev);
```

幻灯片 9 的两张直方图（每个值对应的星号数）：

| value | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| uniform, min 0, max 10 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| normal, mean 5.0, sd 2.0 | 0 | 1 | 3 | 6 | 9 | 9 | 8 | 5 | 3 | 1 | 0 |

（正态直方图还列出了 −2、−1、11、12——全是空的。）

均匀分布是平的；正态分布在均值附近达到峰值，距离均值超过 2 个标准差的地方（小于 1 或大于 9）几乎没有数据。

> ⚠️ **易错点**（N3551 §3）：不要写 `1 + engine() % 6`。引擎的取值范围通常不是 6 的倍数，所以较小的值会略微更常出现——这是一个有偏的骰子。一定要通过分布来取值（并避免使用老式的 C 函数 `rand()`）。

### 1.5 综合起来：掷骰子

幻灯片 10：这三个部分只创建**一次**——（1）熵源 + 引擎，（2）映射到 [1, 6] 的分布，（3）每取一个样本就调用一次 `distribution(engine)`。

```cpp
#include <random>
#include <iostream>

// 1. Source of Entropy & Engine
std::random_device device;
std::default_random_engine engine{device()};   // slide: engine{device}

// 2. Inclusive Uniform Distribution [1, 6]
std::uniform_int_distribution<int> distribution{1, 6};

// 3. Generate Samples
for (int i = 0; i < 1000; ++i) {
    std::cout << distribution(engine) << " ";
}
std::cout << std::endl;
```

**幻灯片错误（p10、p11）**：`engine{device}` 应为 `engine{device()}`。直接传入 device 对象本身无法编译（g++：`no matching function for call to 'std::linear_congruential_engine<...>(<brace-enclosed initializer list>)'`）；必须调用它。

> ⚠️ **易错点**（Thornton）：不要在循环内部创建 device/engine/distribution——否则每次都会访问缓慢的熵源，还会丢掉 PRNG 的状态。创建一次，调用多次。

> 📝 **练习**：[活动 0](#51-活动-0随机数生成幻灯片-11)——用 46 作种子，并改用 `normal(4.0, 0.6)`。

---

## 2. C++ 引用

### 2.1 引用是别名

**引用**（reference）是已有对象的另一个名字（幻灯片 13）。它**必须初始化**，并且**永远不能重新绑定**到另一个对象。它也叫**左值引用**（lvalue reference），在类型上用 `&` 声明：`int& ref = existingVariable;`。与 Python 的名字不同，`r = j;` 不会让 `r` 重新绑定——它是把 `j` 的值复制到 `r` 所引用的对象里。

```cpp
int i = 3;
int& r = i;                       // r now refers to i
std::cout << r << std::endl;      // writes 3
r = 4;                            // a change to r is also a change to i
std::cout << i << std::endl;      // writes 4
i = 5;                            // a change to i is also a change to r
std::cout << r << std::endl;      // writes 5
```

这里只有一个 `int`，有两个名字。

### 2.2 按值传递与按引用传递

按值传递给函数一个**副本**；按引用传递则让形参成为调用者实参的**别名**（幻灯片 14）。为什么用引用：它**允许修改**原对象，并且**避免复制**大数据（性能、内存）。

```cpp
void foo(int& x)
{
    x++;
    std::cout << x << std::endl;   // prints 4
}

int main()
{
    int i = 3;
    foo(i);
    std::cout << i << std::endl;   // prints 4
    return 0;
}

void swap(int& a, int& b)
{
    int temp = a;
    a = b;
    b = temp;
}
```

如果是 `void foo(int x)`，输出会是先 `4` 后 `3`；没有 `&` 的 `swap` 只会交换两个副本，什么也改变不了。

> 💡 **关键洞察**：只读大对象 → `const T&`；要修改调用者的对象 → `T&`；`int` 这类小类型 → 按值。

### 2.3 按值返回与按引用返回

幻灯片 15：**默认按值返回**——它是安全的（没有悬空引用），得益于 RVO / 移动语义 / 复制省略（copy elision，C++17 起有保证）而开销很小，而且更简单。**按引用返回**用于：类的 getter（返回指向大型内部数据的 `const T&`）、运算符重载（`operator[]`、`operator=`、`operator<<`，这样调用可以链式连接），以及生存期超出函数的长寿命对象。

**关键规则：永远不要返回局部栈变量的引用**——函数返回时它就被销毁了。

```cpp
// BAD: Dangling reference to local object
int& getBad() { int local = 42; return local; } // DANGER! Destroyed on exit

// GOOD: Return by value (optimized by RVO/Copy Elision)
int getGood() { int val = 42; return val; } // Safe zero-copy return
```

`getBad()` 实际会发生什么（g++ 13，`-Wall -fsanitize=address,undefined`）：

```text
bad.cpp:2:40: warning: reference to local variable 'local' returned [-Wreturn-local-addr]
bad.cpp:2:40: runtime error: reference binding to null pointer of type 'int'
AddressSanitizer: SEGV on unknown address 0x000000000000
```

> 📘 **课外补充**（Thornton，移动语义）：*移动*一个 `std::vector` 只是偷走它内部的数组指针、大小和容量（O(1)），而不是复制每个元素（O(n)）。这就是幻灯片 15 能说按值返回开销很小的原因。`std::move(x)` 只是把 `x` 标记为“可以安全地被偷走资源”——在 §4.4 中你会看到它与 `unique_ptr` 一起使用。

---

## 3. C++ 指针

### 3.1 指针是什么

**指针**（pointer）保存一个**内存地址**（运行时的值），以及它所指向的**类型**（编译期已知）（幻灯片 17）。用 `*` 声明：`int* x;`。声明要从右往左读：`int** q` 是“指向 int 指针的指针”，`int*& s` 是“指向 int 指针的引用”。

| | 引用 `int&` | 指针 `int*` |
|---|---|---|
| 可以为空？ | 不可以 | 可以（`nullptr`） |
| 必须初始化？ | 是 | 否（但未初始化 = 垃圾值） |
| 可以更换目标？ | 不可以 | 可以 |
| 访问对象 | 直接用名字 | `*p` |

### 3.2 `&`、`*` 与指针赋值

**取地址**运算符 `&`（出现在*表达式*中）给出变量的地址——不同于出现在*类型*中、用来声明引用的 `&`。**解引用**运算符 `*` 与它相反：它访问该地址上的对象（这个名字与引用无关，是 C 语言里更早的术语）。你可以复制指针（`int* q = p;` → 两者指向同一个对象），也可以有指向指针的指针（`int** q = &p;`）（幻灯片 17–18）。

```cpp
int i = 3;
int* p = &i;
std::cout << i << std::endl;   // 3
*p = 4;                        // change i through p
std::cout << i << std::endl;   // 4
int** q = &p;                  // *q is p, **q is i (prints 4)
```

幻灯片 19：指针支持直接操作内存、动态分配，以及构建数据结构（链表、树、图）。与引用不同，指针可以被**重新指向**：

```cpp
int x = 10;
int* p = &x;    // p holds the memory address of x
*p = 20;        // changes x to 20 through the pointer
int y = 30;
p = &y;         // now p points to y instead of x
```

已验证：之后 `x` 是 20，`*p` 是 30。

> ⚠️ **易错点**：地址不是 `int`——`int* p = i;` 是编译错误；应写 `int* p = &i;`。

### 3.3 `nullptr`

`nullptr` 表示“不指向任何东西”（例如链表中最后一个节点的 `next`）。幻灯片 19 问：解引用它会怎样？**未定义行为**（undefined behavior）——实际中就是崩溃。

```cpp
int* p = nullptr;
*p = 3;              // CRASH
```

```text
Segmentation fault            # plain g++, exit code 139
```

对可能为空的指针，解引用之前先检查 `if (p != nullptr)`。

### 3.4 栈与堆；指针和引用一起用

内存有两个区域（幻灯片 20）：**栈**（stack）存放函数调用和局部变量（静态分配，自动释放）；**堆**（heap）存放运行时由 `new` 创建的对象（动态分配，直到 `delete` 才释放）。**引用是对象的隐式同义词；指针存储的是对象的位置。**

```cpp
int* p = new int;     // new int: allocate an int on the heap
*p = 3;

int& q = *p;          // q is another name for the heap int
q = 4;

std::cout << *p << std::endl;   // 4

int* r = &q;          // address of the int q names (same as p)
*r = 5;

std::cout << *p << std::endl;   // 5

int*& s = p;          // s is a reference to an int pointer
*s = 6;

std::cout << *p << std::endl;   // 6
```

幻灯片 20 的程序在内存中的样子——一个堆上的 `int`，四种访问它的方式（虚线箭头表示引用）。在下面的演示中逐步查看（演示获得焦点时可用 ← / → 键）：

```viz memory-trace
{"title": "幻灯片 20：p, q, r, s", "steps": [{"code": "int* p = new int; *p = 3; int& q = *p; q = 4;", "note": "p 指向堆上的一个 int；q 是它的另一个名字（虚线 = 引用），所以 q = 4 写入的就是这个 int", "stack": [{"frame": "main", "vars": [{"name": "p", "value": "->h1"}, {"name": "q", "value": "->h1", "ref": true}]}], "heap": [{"id": "h1", "type": "int", "fields": [{"name": "value", "value": "4", "old": "3"}]}]}, {"code": "int* r = &q; *r = 5; int*& s = p; *s = 6;", "note": "r 保存的地址与 p 相同；s 是指针 p 本身的引用", "add_vars": {"main": [{"name": "r", "value": "->h1"}, {"name": "s", "value": "->main.p", "ref": true}]}, "set": {"h1.value": {"value": "6", "old": "4"}}}]}
```

一个堆上的 `int`，四种访问方式：已验证 `r == p` 和 `&s == &p` 都输出 `true`。

> 📝 **练习**：[活动 1a](#52-活动-1a可视化指针与引用幻灯片-21) 和 [活动 1b](#53-活动-1b指针与引用幻灯片-22)——同一幅图，然后改一行。

### 3.5 `new`、`delete`、内存泄漏与悬空指针

`delete p` 删除的是 **p 所指向的对象**，而不是 `p` 本身。规则：**每个 `new` 都恰好对应一个 `delete`**。违反这条规则会出现：

| Bug | 发生什么 |
|---|---|
| **内存泄漏**（memory leak） | 从未被删除；最后一个指向它的指针消失后，它变得不可达，却仍处于已分配状态 |
| **悬空指针**（dangling pointer） | `delete p` 之后，`p` 仍保存着旧地址；使用它是未定义行为 |
| **重复释放**（double free） | 对同一个地址删除两次——未定义行为（活动 1b） |

> 📘 **课外补充**（Thornton 45C）：每次写下 `new`，都要问一句“谁来 delete 它，什么时候 delete？”Python 用垃圾回收器释放堆对象；C++ 没有，所以这是你的责任——或者交给智能指针。

---

## 4. 智能指针与所有权

### 4.1 裸指针的问题

幻灯片 24 列出的危险：解引用 `nullptr` 是 UB；错误的类型转换可能指向任何地方；**同样的语法**既可以指向单个对象也可以指向数组（`new int` 与 `new int[10]`）；而且指针**仍然指向已释放的对象**（悬空）。所以：**优先使用栈分配**（离开作用域时自动清理，即使发生异常也一样），**只在必要时才动态分配**——大小要到运行时才知道，或者数据必须比函数活得更久。

智能指针（smart pointer，位于 `<memory>`）是现代的解决方案：

| 智能指针 | 所有权 |
|---|---|
| `std::unique_ptr` | 独占 |
| `std::shared_ptr` | 共享（引用计数） |
| `std::weak_ptr` | 不拥有的观察者 |

**幻灯片错误（p24）**：`std::share_ptr` 应为 `std::shared_ptr`。

### 4.2 所有权

**拥有**一个对象的指针必须确保：指针被销毁时，该对象被释放（幻灯片 25）。用所有权的思路来思考，可以避免泄漏（没人 delete）和重复 delete（两个指针都 delete）。

```cpp
class A
{
public:
    A();
    ~A();

private:
    B* b;
    // other member variables would be here
};

A::A()
    : b{new B}, ... // other member variable initializers would be here
{
    // other code to be run after the initializers would be here
}

A::~A()
{
    // necessary cleanup other than deleting the object pointed to by b
    // would be here

    delete b;
}
```

**幻灯片 25 的问题——如果构造函数在 `new B` 之后抛出异常会怎样？** `A` 没有构造完成，所以 `~A()` 永远不会运行。成员 `b` 会被销毁，但销毁一个*裸*指针并不会删除那个 `B` → **泄漏**。（§4.3 中并排验证了这一点。）

### 4.3 `std::unique_ptr`：独占所有权

`unique_ptr` 在**它自己被销毁时，会销毁它所指向的对象**——保证自动删除（幻灯片 26）。被指向的类型写在 `< >` 里。

```cpp
#include <memory>    // We need this if we want to use smart pointers

void foo()
{
    // Creates a unique_ptr called p and points it to a newly-allocated int.
    // p holds unique ownership of that int.
    std::unique_ptr<int> p{new int};

    // We can dereference the pointer with the * operator, just as you'd
    // expect with a raw pointer.
    *p = 3;
    std::cout << *p << std::endl;

    // When p falls out of scope -- either because the function ends normally
    // or because the function threw an exception -- it will destroy the
    // int it points to automatically, so no need for delete!  Similarly, if
    // we re-point p to a new integer later, or we point it to null, a
    // deletion will also be triggered.
}
```

幻灯片 27 把类 A 改写为使用 `std::unique_ptr<B> b;`——`~A()` 不再需要 `delete b`（如果没有别的事要做，甚至可以完全省略）。**幻灯片错误（p27）**：类的后面多了一个重复的 `};` → 只保留一个 `};`。

示例——两个版本，构造函数都会抛出异常（已验证）：

```cpp
struct B {
    B()  { std::cout << "B constructed" << std::endl; }
    ~B() { std::cout << "B destroyed" << std::endl; }
};
class RawA {                     // slide 25 version
public:
    RawA() : b{new B} { throw std::runtime_error("constructor failed"); }
    ~RawA() { delete b; }
private:
    B* b;
};
class A {                        // slide 27 version
public:
    A() : b{new B} { throw std::runtime_error("constructor failed"); }
private:
    std::unique_ptr<B> b;
};
```

```text
B constructed
RawA: constructor failed          <- no "B destroyed": leaked
B constructed
B destroyed
A: constructor failed
==ERROR: LeakSanitizer: detected memory leaks   (1 byte: RawA's B)
```

> 📘 **课外补充**（Thornton，智能指针）：这就是 **RAII**——在构造函数中获取资源，在析构函数中释放；局部对象的析构函数总会运行，无论是正常返回还是异常期间。现代代码通常写 `auto p = std::make_unique<int>(3);`（以及 `std::make_shared`），而不是直接用 `new`。

### 4.4 `unique_ptr` 不能被复制

**复制 `unique_ptr` 是不安全的，所以不允许**（幻灯片 28）。幻灯片 28 问：按值传递会怎样？

```cpp
void foo(std::unique_ptr<int> q)
{
    *q = 4;
}

void bar()
{
    std::unique_ptr<int> p{new int};
    *p = 3;
    foo(p);
    std::cout << *p << std::endl;
}
```

**答案：无法编译**——`error: use of deleted function 'std::unique_ptr<...>::unique_ptr(const std::unique_ptr<...>&)'`。如果允许这样做，`p` 和 `q` 就会都“拥有”这个 int（即幻灯片上的那幅图）；`foo` 返回时，`q` 会删除它，而 `p` 变成悬空指针，还会再删除一次。

正确的写法（已验证）：

```cpp
void borrow(int& x) { x = 4; }                        // just use the int
void borrowOwner(std::unique_ptr<int>& q) { *q = 5; } // use the caller's owner
void take(std::unique_ptr<int> q) { /* ... */ }       // take ownership

borrow(*p);          // p still owns the int
borrowOwner(p);      // p still owns the int
take(std::move(p));  // ownership moves into q; afterwards p == nullptr
```

### 4.5 `std::shared_ptr`：引用计数

在共享所有权下（幻灯片 29），只要**至少还有一个** `shared_ptr` 指向对象，它就一直存活，**最后一个**消失时才被销毁。它靠**计数**指针来实现（“类似于 Python 的垃圾回收”），并且 `shared_ptr` **可以安全地复制**——每复制一次计数加 1。

```cpp
void foo()
{
    std::shared_ptr<int> p1{new int};     // p1 points to a new integer
    std::shared_ptr<int> p2 = p1;         // p2 points to the same integer
    *p1 = 4;                              // 4 is stored in that integer
    std::cout << *p2 << std::endl;        // prints 4
    p1 = nullptr;                         // p1 no longer points to the integer, but p2 still does
}                                         // when the function ends, the integer is destroyed
```

| 执行完这一行后 | `use_count` |
|---|---|
| `p1{new int}` | 1 |
| `p2 = p1` | 2 |
| `p1 = nullptr` | 1 |
| `}`（p2 被销毁） | 0 → int 被删除 |

> ⚠️ **易错点**：“类似于 Python”只说对了一半——Python 还有循环垃圾收集器，而 `shared_ptr` **没有**。见 §4.6。

### 4.6 循环引用问题与 `std::weak_ptr`

幻灯片 30（活动 2）：即使是共享所有权也可能泄漏。

```cpp
#include <iostream>
#include <memory>

struct Child;  // Forward declaration

struct Parent {
    std::shared_ptr<Child> child;
    ~Parent() { std::cout << "Parent destroyed\n"; }
};

struct Child {
    std::shared_ptr<Parent> parent;
    ~Child() { std::cout << "Child destroyed\n"; }
};

int main() {
    std::shared_ptr<Parent> p(new Parent());
    std::shared_ptr<Child>  c(new Child());

    p->child = c;    // Parent owns Child
    c->parent = p;   // Child owns Parent

    // Neither Parent nor Child is destroyed here because
    // they keep each other alive (circular reference).
    return 0;
}
```

循环在内存中的样子。在下面的演示中逐步查看（演示获得焦点时可用 ← / → 键）：

```viz memory-trace
{"title": "活动 2：shared_ptr 循环", "steps": [{"code": "shared_ptr<Parent> p(new Parent()); shared_ptr<Child> c(new Child());", "stack": [{"frame": "main", "vars": [{"name": "p", "value": "->P"}, {"name": "c", "value": "->C"}]}], "heap": [{"id": "P", "type": "Parent", "fields": [{"name": "child", "value": "nullptr"}, {"name": "use_count", "value": "1"}]}, {"id": "C", "type": "Child", "fields": [{"name": "parent", "value": "nullptr"}, {"name": "use_count", "value": "1"}]}]}, {"code": "p->child = c;  c->parent = p;", "note": "现在每个对象都有两个所有者：一个局部变量和另一个对象", "set": {"P.child": {"value": "->C", "old": "nullptr"}, "C.parent": {"value": "->P", "old": "nullptr"}, "P.use_count": {"value": "2", "old": "1"}, "C.use_count": {"value": "2", "old": "1"}}}, {"code": "} // end of scope: p and c destroyed", "note": "计数降到 1，而不是 0——两个对象互相让对方保持存活，外部又无法访问到它们：泄漏，不会运行任何析构函数", "pop_frame": true, "set": {"P.use_count": {"value": "1", "old": "2"}, "C.use_count": {"value": "1", "old": "2"}}}]}
```

两个析构函数的消息都不会打印。（已验证的计数：赋值之后 Parent 为 2，Child 为 2。放在一个辅助函数里运行时，LeakSanitizer 报告 `80 byte(s) leaked in 4 allocation(s)`——两个对象加两个控制块。）

**修复**：让反向指针不拥有对象。`weak_ptr` 指向由 `shared_ptr` 管理的对象，但**不会**增加它的计数。

```cpp
struct Child {
    std::weak_ptr<Parent> parent;          // FIX: observer, not owner
    ~Child() { std::cout << "Child destroyed\n"; }
};
// to use it:  if (std::shared_ptr<Parent> pp = c->parent.lock()) { ... }
```

```text
Parent count 1, Child count 2
child can still reach its parent
Parent destroyed
Child destroyed
```

`p` 消亡 → Parent 的计数降到 0 → Parent 被销毁，从而销毁它的 `child` 成员 → Child 的计数降到 0。

> 📝 **练习**：[活动 2](#54-活动-2共享所有权幻灯片-30)。

### 4.7 准则：借用与拥有

**并非所有指针都意味着拥有**——对象可以被**借用**，而无需承担对它的责任（幻灯片 31）。

| 用法 | 含义 | 何时使用 |
|---|---|---|
| `A&` / `const A&` | 引用：**保证存在**（不会为空）；`const` 禁止修改 | 借用者总是需要一个对象 |
| `A*` | 裸指针：按约定**显式表示不拥有**；**对象可有可无**（可以是 `nullptr`） | 对象可能不存在 |
| `std::weak_ptr<A>` | 智能的非拥有指针；与 `shared_ptr` 配对使用 | 共享结构中的反向引用 |

实际例子：树节点用 `shared_ptr` 指向它的**孩子**，用 `weak_ptr` 指向它的**父节点**——也就是 §4.6 的修复方法。

> ➡️ **续见 [Lecture 2](lec-02.zh-CN.md)**：活动 3（把一棵树的裸指针先转换为 `unique_ptr`，再转换为 `shared_ptr` + `weak_ptr`，然后转换为 `unique_ptr` + 裸指针）、裸指针与智能指针混用（`.get()`、所有者与观察者），以及智能指针总结。

---

## 5. 课堂活动（附解答）

### 5.1 活动 0：随机数生成（幻灯片 11）

修改 `random_test.cpp`（课程 Google 文件夹中）：（1）用**以 46 为种子的 PRNG** 打印随机数，（2）使用均值为 **4.0**、标准差为 **0.6** 的**正态分布**。给出的代码使用 `engine{device}` 和 `uniform_int_distribution<int> distribution{1, 6}`。

**解答**——修改这两行（固定种子不需要 `random_device`）：

```cpp
const unsigned int SEED = 46;
std::default_random_engine engine{SEED};                     // 1) fixed seed
std::normal_distribution<double> distribution{4.0, 0.6};    // 2) normal(4.0, 0.6)
```

前 10 个值（g++ 13 / libstdc++），每次运行都相同：

```text
2.94246 4.7139 3.62995 3.87306 4.78358 4.23905 3.89193 3.93273 4.34897 4.33676
```

1000 个样本的均值为 4.007，约 68% 落在 3.4–4.6 之间（在一个标准差以内）。如果保留 device，请把 `engine{device}` 改成 `engine{device()}`。

### 5.2 活动 1a：可视化指针与引用（幻灯片 21）

为下面的代码画出栈/堆图（虚线 = 引用，实线 = 指针）：

```cpp
int* a = new int;
*a = 2;

int* b = new int;
*b = 3;

*a = *b;

int& c = *b;
c = 6;

std::cout << *a << std::endl;

int*& d = a;
*d = 9;

std::cout << *a << std::endl;

delete a; delete b;
```

**解答**——先打印 **`3`**，再打印 **`9`**；ASan 下没有报错。

- `*a = *b` 复制的是**值** 3；`a` 和 `b` 仍然指向两个不同的 int。
- `c` 是 `b` 所指 int 的名字，所以 `c = 6` 不会改变 `a` 的 int（仍是 3）→ 打印 3。
- `d` 是指针 `a` 的另一个名字，所以 `*d = 9` 写入的是 `a` 的 int → 打印 9。
- 最终的图：`a` → int 9，`b` → int 6，`c` 用虚线指向 6，`d` 用虚线指向 `a`。两个对象，各被删除一次。

### 5.3 活动 1b：指针与引用（幻灯片 22）

代码相同，只是 `*a = *b;` 改成了 `a = b; // change from 1a`。

**解答**——先打印 **`6`**，再打印 **`9`**，然后崩溃：

- `a = b` 复制的是**地址**：两者都指向保存 3 的那个 int。保存 2 的那个 int 没有任何指针指向它了 → **泄漏**。
- `c = 6` 和 `*d = 9` 都是写入这同一个共享的 int → 先 6，再 9。
- `delete a; delete b;` 对同一个地址删除了两次 → **重复释放**：

```text
6
9
==ERROR: AddressSanitizer: attempting double-free on 0x502000000030 in thread T0
```

`*a = *b` 复制的是所指向的内容；`a = b` 复制的是指针——智能指针就是为了防止这种别名问题而存在的。

### 5.4 活动 2：共享所有权（幻灯片 30）

对于 [§4.6](#46-循环引用问题与-stdweak_ptr) 中的 `Parent`/`Child` 程序：（a）`main` 结束时 parent 和 child 会怎样？（b）为什么？（c）如何修复？

**解答。**
（a）两者都不会被销毁——没有任何析构函数输出；两个对象都泄漏了。
（b）每个对象都有两个所有者（一个局部变量 + 另一个对象）。`p` 和 `c` 消亡时，每个计数降到 1，而不是 0：这是**循环引用**，`shared_ptr` 无法检测到。
（c）把 `Child` 的成员改成 `std::weak_ptr<Parent> parent;`。Parent 的计数保持为 1，所以两者都会被销毁（`Parent destroyed`、`Child destroyed`）。用 `lock()` 来访问 parent。

---

## 6. 速查与必记的 5 个要点

| 想要 | 写法 |
|---|---|
| 可复现的引擎 | `std::default_random_engine engine{46u};` |
| 正式运行用的引擎 | `std::random_device device; std::default_random_engine engine{device()};` |
| 掷骰子 / 钟形曲线 | `std::uniform_int_distribution<int> d{1, 6};` / `std::normal_distribution<double> d{4.0, 0.6};` 然后 `d(engine)` |
| 别名，永不为空，永不重新绑定 | `T& r = x;` |
| 取地址 / 跟随地址 | `&x` / `*p` |
| 一个所有者，自动删除 | `std::unique_ptr<T>` — 用 `std::move` 移交 |
| 多个所有者 | `std::shared_ptr<T>` — 复制会使计数加 1 |
| 不拥有的反向指针 | `std::weak_ptr<T>` — 用 `lock()` 来使用 |
| 借用：必须存在 / 可以不存在 | `const T&` 或 `T&` / `T*` |

**必记的 5 个要点**

1. 只设置一次种子（`engine{device()}`，括号不能少；测试时用固定种子），并且一定要通过分布取值。
2. 引用是永久的别名：通过它赋值永远不会让它重新绑定；永远不要返回局部变量的引用。
3. `*a = *b` 复制的是值；`a = b` 复制的是地址——这可能泄漏旧对象，并埋下重复释放的隐患。
4. `unique_ptr` 不能复制（两个所有者会导致重复 delete）；用 `T&`/`T*` 借用，或用 `std::move` 转移所有权。
5. `shared_ptr` 的循环引用会导致泄漏，因为计数永远到不了 0；把孩子 → 父节点的指针改成 `weak_ptr`。