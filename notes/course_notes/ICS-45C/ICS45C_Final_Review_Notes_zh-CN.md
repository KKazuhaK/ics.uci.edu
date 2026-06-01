# ICS 45C — C++ 编程 · 期末复习笔记

**课程：** ICS 45C（课程编号 35770），Prof. Raymond Klefstad · **覆盖范围：** 第 1–10 周（整门课程）
**编写依据：** 109 道题的 *《学习指南》*（即覆盖范围清单）+ 全部每周课件（C Tour、Arrays、Classes、Strings、Dynamic Arrays、Linked Lists、Topics 6–9）+ Topic 10 期末复习课件。

> **使用说明：** 下面各节按官方《学习指南》的 13 个主题组依次排列。每个答案都写成可直接应试的形式：一个精炼的定义、关键要点、Klefstad 幻灯片中他本人的代码、常见陷阱（⚠️）以及有助于理解之处的 Python 对比（🐍）。《学习指南》的题号会以 **(Q34)** 这样的形式标出，方便你回查对照。最有可能出现在考试中的内容用 💡 标记。

---

## 考试须知与策略（出自 Topic 10 课件）

- **在考试开始*之前*仔细阅读题目说明。** 知道你的**指定座位**（考前不久会发布到 EdStem）。携带**带照片的证件**（也会使用带照片的点名册）。
- **手机完全收起来**——把手机拿出来 = 零分 / “重罪级作弊”。不要佩戴遮挡眼睛的帽檐、连帽衫或太阳镜。
- **在答题卡上涂黑你的考试版本（Exam Version）**，并写上你的**姓名 + UCI NetID**。
- **应试策略：** 仔细阅读每道题 → *再*读一遍 → 把试卷册当作草稿纸用 → 作答 → 立刻把答案涂到答题卡上 → **相信你学过的东西，别把自己反复猜成错误答案** → 如果还有时间，最后再检查一遍。
- **期末考试中可能会有代码评审（Code Review）。** 教授明确说明了这一点（见文末的代码评审附录）。

---

## 目录

1. [C++ 程序与编程](#1-c-程序与编程-q18)
2. [变量与表达式](#2-变量与表达式-q923)
3. [内存区域、对象生命周期与作用域](#3-内存区域对象生命周期与作用域-q2432)
4. [数组、字符串与链表](#4-数组字符串与链表-q3338)
5. [函数与参数](#5-函数与参数-q3948)
6. [类与对象](#6-类与对象-q4965)
7. [继承与多态](#7-继承与多态-q6673)
8. [模板](#8-模板templatesq7477)
9. [lambda](#9-lambda-q7880)
10. [异常](#10-异常exceptionsq8185)
11. [命名空间](#11-命名空间namespacesq8690)
12. [I/O 流、文件与 stringstream](#12-io-流文件与-stringstream-q9194)
13. [STL 容器、迭代器与算法](#13-stl-容器迭代器与算法-q95109)
- [附录 A —— Klefstad 的格言](#附录-a--klefstad-的格言请牢记于心)
- [附录 B —— 快速对照表](#附录-b--快速对照表)
- [附录 C —— 代码评审（可能出现在期末考试中）](#附录-c--代码评审可能出现在期末考试中)
- [附录 D —— 重点主题](#附录-d--期末考试的优先复习主题)
- [走进考场前必须掌握的 12 件最重要的事](#走进考场前最重要的-12-件事)

---

# 1. C++ 程序与编程 (Q1–8)

### 头文件（header file，.hpp）与源文件（source file，.cpp） — (Q1)
- **`.hpp`（头文件）= 接口。** 它*声明*一个模块提供了什么：类声明、函数原型（prototype）、`constexpr` 常量。头文件被其他文件 `#include`。
- **`.cpp`（源文件）= 实现。** 它*定义*每个函数/方法如何工作。`.cpp` 文件会被编译；它们 `#include` 自己所实现的 `.hpp`。
- 把一个模块拆分成 `.hpp` + `.cpp`，可以让你把 `#include` 依赖下沉到 `.cpp` 中，这样**能减少每次构建时需要重新编译的量**（构建工具——make/cmake——会跟踪依赖关系）。

> ⚠️ **课程规则：** 绝不要在 `.hpp` 头文件里写 `using namespace std;`。它会泄漏到每个包含该头文件的文件里。（在 `.cpp` 内部，本课程的幻灯片可以容忍它，但头文件必须保持干净。）

### 预处理器指令（preprocessor directives） — (Q2)
以 `#` 开头的行，由**预处理器（preprocessor）**处理（编译的第一步，在编译器之前）：
- `#include <file>` — 以文本方式粘贴进声明（例如，`#include <iostream>` 引入 I/O 声明）。
- `#define NAME value` — 定义一个**宏（macro）**（文本替换）。
- `#ifdef` / `#ifndef` … `#endif` — 条件编译（仅当某个名字被定义/未被定义时才编译这个代码块）。

### 宏，以及该用什么来代替它 — (Q3)
**宏（macro）**是一种预处理器文本替换（`#define MAX 1024`）。预处理器会在编译器运行*之前*盲目地替换文本，所以宏**没有类型检查、也没有作用域（scope）**。
- 💡 **在现代 C++ 中，用以下两样东西来代替宏：**
  1. 用 **`constexpr`（或 `const`）变量**代替 `#define` 常量 → 有类型、有作用域、可调试。
  2. 用 **`inline` 函数 / 函数模板（function template）**代替类函数式的宏 → 经过类型检查，不会出现参数被意外重复求值的情况。

### 包含守卫（include guards） — (Q4)
防止同一个翻译单元中重复多次包含某个头文件（那会导致 “redefinition”（重复定义）错误）。
```cpp
// Complex.hpp
#ifndef COMPLEX_HPP        // 如果尚未定义……
#define COMPLEX_HPP        // ……就定义它，然后……
class Complex { /* ... */ };   // ……只包含这个类体一次
#endif
```
（现代替代方案：在头文件顶部写 `#pragma once`。）

### 增量式开发与一次性（大爆炸式）开发 — (Q5)
**增量式开发（incremental development）** = 写一小块，**测试它**，然后再添加下一块。**一次性（大爆炸式）开发（big-bang）** = 把所有东西全部写完，然后再试着运行。
- 增量式更胜一筹，因为 bug 被隔离在你刚添加的那一小块里，所以很容易找到。而用一次性开发时，来自许多地方的 bug 互相纠缠，“太难找了”。
- > Klefstad：*“我只想先让它能跑起来” / “我之后再清理”* 会导致那些太难找的错误。**现在就清理干净。** *如果一个函数超过 5 行，就重构它。测试每一小块。*

### 编写与处理测试用例 — (Q6)
在你**编写每个函数的同时**就编写测试（测试驱动开发，Test-Driven Development），而不是事后再写。本课程针对一个方法的 TDD 循环（出自 String 那套幻灯片）：
1. 挑选一个公有方法。2. 写一个**常规测试用例（nominal test case）**。3. 识别/构想出一个辅助函数（helper）。4. 只使用辅助函数来编写该方法。5. 编写这些辅助函数。6. 编写并运行一个**辅助函数测试器（helper tester）**（在 `student_gtests.cpp` 中）。7. 为该方法运行常规测试器。8. 复查：它能不能更干净、命名更好、或者使用另一个辅助函数？然后再添加**边界条件（boundary-condition）**测试。
- 使用 Google Test：`EXPECT_EQ`、`EXPECT_NE`。*测试往往占了一半以上的工作量。*

### 面向对象与过程式/函数式 — (Q7)
- **过程式/函数式：** 程序围绕**函数**来组织，这些函数对被动的数据进行操作。
- **面向对象：** 程序围绕**对象**来组织，这些对象把**数据 + 作用于这些数据的函数（方法）**捆绑在一起，并对构造、拷贝和析构加以控制，还能够使用**继承（inheritance）**和**多态（polymorphism）**。只有对象自己的方法才能触碰它的 `private` 部分。

### 魔法数字（magic numbers） — (Q8)
**魔法数字（magic number）**是代码中未加解释的字面量（`1024`、`0.40`）。它们损害可读性，而且修改起来容易出错。
- 💡 **修正方法：** 用 `constexpr` 常量给它们起个名字。
```cpp
constexpr int BUF_SIZE = 1024;          // 而不是  char buf[1024];
constexpr double QUIZ_WEIGHT = 0.40;    // 而不是  grade = quiz * 0.40;
return PI * r * r;                      // 而不是  return 3.14159 * r * r;
```

---

# 2. 变量与表达式 (Q9–23)

### 声明与定义（变量） — (Q9)
- **声明（declaration）**引入一个名字及其类型（“这个名字存在，这是它的类型”）。
- **定义（definition）**还会分配存储空间／提供函数体。
- 对于一个普通的局部变量，`int x;` *既是*声明也是定义。一个**不是**定义的声明要用 `extern`：
```cpp
extern int g;   // 仅声明（g 在某个其它文件中定义）
int g = 5;      // 定义（分配存储空间，这里是在本文件中）
```

### 运算符优先级与加括号 — (Q10)
运算符按照固定的优先级顺序结合；括号可以覆盖它。从高到低（取自幻灯片的子集）：`++ -- (unary) + - (unary)` → `* / %` → `+ - (binary)` → `= += -= *= /= %=`。关键的**访问**运算符：解引用 `*`、下标 `[]`、取地址 `&`、成员箭头 `->`。
```cpp
int j = 8 - k * i / 2 + k * 2;   // == 8 - ((k*i)/2) + (k*2)
*p->next      // 表示 *(p->next)   ( -> 比 * 结合得更紧 )
*a[i]         // 表示 *(a[i])      ( [] 比 * 结合得更紧 )
&a[0]         // 表示 &(a[0])
```
> ⚠️ 考试时如果拿不准，就**显式地加上括号**并逐步追踪。

### 左值与右值 — (Q11)
- **左值（l-value）** = 具有身份／地址、可以出现在 `=` **左边**的东西（一个有名字、可寻址的对象）。例如：变量 `x`、数组元素 `v[i]`、`*p`。
- **右值（r-value）** = 没有持久地址的临时值／值（只能在右边）。例如：字面量 `10`、`a + b` 的结果、按值返回的临时对象。
```cpp
int x = 10;   // x 是左值，10 是右值
x = 5;        // OK：左值在左边
5 = x;        // ERROR：5 是右值
v[i] = v[i-1]*2;   // v[i] 是左值；v[i-1]*2 是右值
```
这一点对于返回 `int&`（一个左值，因此 `v[0]=1` 才能工作）的 `operator[]`，以及移动语义所使用的**右值引用 `&&`**（第 6 节）都很重要。

### 引用参数 — (Q12)
用 `&` 声明的参数。函数接收的是**实际对象本身**（一个别名），而不是副本，因此它可以**修改调用方的变量**。
```cpp
void increment(int & x) { x = x + 1; }
int z = 10; increment(z); increment(z);   // z 现在是 12
```

### 引用返回类型 — (Q13)
函数返回 `T&`——一个对已存在对象的引用，因此**该调用可以被当作左值使用**（你可以向它赋值）。经典用法：`operator[]`。
```cpp
int & operator[](int index) { return buf[index]; }  // 返回对该元素的引用
v[0] = 1;   // 可行：v[0] 是一个左值
```
> ⚠️ 永远不要返回对**局部**变量的引用——它会在函数返回时消亡（悬空引用）。

### 引用变量 — (Q14)
对一个已存在对象的局部别名，在构造时就固定下来（它永远无法被“重新绑定”去引用别的东西）。
```cpp
int i = 10;
int & r = i;   // r 是 i 的另一个名字
r = 70;        // 把 i 改为 70
```

### 引用与指针 — (Q15) 💡
| | 引用 `int& r` | 指针 `int* p` |
|---|---|---|
| 持有 | 对某个对象的别名 | 一个地址 |
| 必须初始化吗？ | **是**，在声明处 | 否（但未初始化 = 危险） |
| 能重新绑定吗？ | **否** | 能（`p = &other;`） |
| 能为空吗？ | 否 | 能（`nullptr`） |
| 使用目标的语法 | 直接用 `r` | `*p`（解引用）、`p->m` |
```cpp
int i = 10;
int * p = &i;   // 指针：& 给出 i 的地址
*p = 60;        // 间接修改 i
int & j = i;    // 引用：只设置一次，是 i 的别名
j = 70;         // 间接修改 i
```
🐍 Python 中的名字是指向对象的*引用*（最接近 C++ 的引用），但 Python 中没有任何类似裸指针或 `*`／`&` 区分的东西。

### `const` 关键字 — (Q16)
`const` 意味着“不能被修改”。用于变量、参数（防止意外修改 + 启用 `const&` 的效率优势），以及成员函数（承诺不修改 `*this`）。
```cpp
const int i = 10;            // i 不能被重新赋值
void print(const Coins & c)  // c 在 print 内部不能被修改；const& 避免了一次拷贝
{ c.quarters = 0; }          // ERROR 被编译器捕获
```

### `constexpr` — (Q17)
`constexpr` = 一个可在**编译期**计算出来的值（或函数）。用它来表示真正的编译期常量和数组大小。
```cpp
constexpr double PI = 3.1415926536;
constexpr int len = 5;
int a[len] = {0};   // OK：len 是一个编译期常量
```
**`constexpr` 与 `const` (Q17 / 期末复习幻灯片)：** `const` = “初始化之后不会改变”（可能是一个运行期的值）；`constexpr` = “在编译期就已知”（更强；可用于要求编译期常量的地方，比如栈上数组的边界）。

### 常量指针与指向常量的指针 — (Q18) 💡（非常常见的陷阱）
围绕 `*` 从右往左读：
```cpp
int * const p = &i;        // 常量指针：p 不能改变，*p 可以
                           //   p = &j;   ERROR     *p = 5;  OK
const int * p = &i;        // 指向常量的指针：p 可以改变，*p 不能
                           //   p = &j;   OK        *p = 5;  ERROR
const int * const p = &i;  // 两者都固定：p 不能改变，*p 也不能改变
```

### `const_cast` — (Q19)
从某个类型上移除（或添加）`const`／`volatile`。仅当你必须把一个逻辑上可修改的对象，通过一个错误地接受／返回 `const` 的 API 传递时才需要它。**罕见，而且是一种代码坏味道**——修改一个真正为 `const` 的对象属于未定义行为。
```cpp
const int * cp = &x;
int * p = const_cast<int*>(cp);   // 去掉 const（仅当你知道 x 其实并非真正 const 时使用）
```

### `static_cast` — (Q20) 💡
在相关类型之间进行的、正常的、在编译期检查的转换（数值转换、`void*`→`T*`、在继承层次中向上／向下转换而不做运行期检查）。
```cpp
int i = c;                                // char -> int（隐式，扩宽）
char c = static_cast<char>(i);            // int -> char（收窄，必须显式）
int x = static_cast<int>(std::round(d));  // double -> int 并四舍五入
```
> ⚠️ **课程的构建使用 `-Werror`。** 隐式的*收窄*转换（例如 `double → int`、`int → char`）会变成错误，因此你必须用 `static_cast` 把它们显式化。

### `auto` — (Q21)
`auto` 让编译器从变量的初始化表达式中**推导**出它的类型。对于冗长的迭代器类型和 lambda 非常好用。
```cpp
auto fn = [](int i){ return i*i; };                 // 一个 lambda
for (auto x : {1,2,3,4,5}) cout << x << endl;        // x 被推导为 int
for (auto it = V.begin(); it != V.end(); ++it) ...   // 无需写出迭代器类型的全称
```

### 有符号整数与无符号整数 — (Q22)
- **有符号（signed）**可以保存负值和正值（实际上有一个比特用来编码符号）。
- **无符号（unsigned）**只保存非负值，使正值范围翻倍；它在下溢／上溢时会**回绕（wrap around）**。
- > ⚠️ 经典 bug：`v.size()` 是**无符号**的。`for (int i = 0; i < v.size(); ++i)` 混用了有符号／无符号；当 `size()==0` 时 `v.size() - 1` 会回绕成一个巨大的数。

### 条件运算符（三元运算符）`?:` — (Q23)
`condition ? valueIfTrue : valueIfFalse`——一个产生值的**表达式**（不像 `if`，`if` 是一条语句）。
```cpp
int factorial(int n) { return n == 0 ? 1 : n * factorial(n - 1); }
int max = a > b ? a : b;
```
🐍 Python 的 `x if cond else y` 是同样的思路（注意词序不同）。

---

# 3. 内存区域、对象生命周期与作用域 (Q24–32)

### 对象的生命周期 (Lifetime of an object) —— (Q24) 💡
> Klefstad：*“每个对象都有生命周期：出生、存活、死亡。”*（"Every object has a life-time: born, lives, dies."）
- **出生 = 分配 + 构造**（先预留内存，然后运行构造函数）。
- **存活** = 对象可以使用。
- **死亡 = 析构 + 释放**（先运行析构函数，然后回收内存）。
> ⚠️ **术语：** 应该说**析构（destruction）**，*而不是* “deconstruction”。教授专门强调了这一点。

具体**何时**发生取决于内存区域：**栈（stack）**对象从其声明处一直存活到所在 `{ }` 块的末尾；**堆（heap）**对象从 `new` 一直存活到 `delete`；**静态/全局（static/global）**对象在整个程序运行期间都存活。

### 未初始化基本类型的默认值 —— (Q25)
- 你没有初始化的**局部（栈）**基本类型变量持有的是**垃圾值**（无论那里原本是什么比特）。`int foo;  // what happens here? — undefined value`
- **静态/全局**基本类型变量默认会被**零初始化**。

### 按值传递 vs 按引用传递 (Pass-by-value vs pass-by-reference) —— (Q26，另见 Q40)
- **按值传递（pass by value，又称 copy/value）：** 函数得到它**自己的副本**（对类类型使用拷贝构造函数构建）；修改不会影响调用者。*Klefstad 的类比：把 HW1 的 PDF 邮件发给你 —— 你拥有自己的一份副本。*
- **按引用传递（`&`）：** 函数得到调用者对象的**别名**；修改对调用者可见，且不会产生副本。*类比：分享一个 Google Doc 的链接。*
- **按引用传递的两个理由：** (1) 为了**修改**实际参数，以及 (2) **效率** —— 避免拷贝一个大对象。`const &` 是“既要效率又不修改”的惯用写法。

### 静态变量 vs 栈变量（都是函数的局部变量） —— (Q27)
两者都声明在函数内部，但是：
- **栈**局部变量在每次进入函数时创建，在函数返回时销毁（每次调用都是全新的）。
- `static` 局部变量位于**静态存储区**：它只创建**一次**，**在多次调用之间保留其值**，并在整个程序运行期间都存活。
```cpp
void f() {
    int s = 0;          // 每次调用都重置为 0
    static int t = 0;   // 只初始化一次；跨调用记住其值
    ++s; ++t;
}
```

### 栈变量 vs 堆变量 —— (Q28)
- **栈：** 自动管理（在声明处创建，在块末尾销毁）。大小必须是固定的；速度快。
- **堆（自由存储区，free store）：** 用 `new`/`delete` 显式管理；一直存活到你 `delete` 它为止；大小可以在运行时决定。**你**负责释放它（否则就会泄漏）。

### 用于动态内存的 `new` / `delete` —— (Q29)
```cpp
int * p = new int{42};   // 在堆上分配一个 int，用 42 构造
delete p;                // 析构 + 释放那一个对象
```
`new` 预留堆内存**并**构造对象；`delete` 析构**并**释放它。

### `new[]` vs `new`（以及与之匹配的 `delete`） —— (Q30) 💡
```cpp
int * a = new int[size];   // 分配一个由 'size' 个 int 组成的数组（size 可以是运行时的值）
delete[] a;                // 对数组必须使用 delete[]

int * p = new int{42};     // 分配单个 int
delete p;                  // 对单个对象必须使用普通的 delete
```
> ⚠️ **`new[]` 与 `delete[]` 配对；`new` 与 `delete` 配对。** 把它们混用是**未定义行为**。原因在于：数组分配会记录存在多少个元素，以便能为每个元素都运行析构函数；而 `delete`（不带方括号）只处理一个对象。

### 局部变量 vs 全局变量 —— (Q31)
- **局部变量：** 声明在某个块/函数内部；只在那里可见；位于栈上（如果标记为 `static` 则位于静态存储区）。
- **全局变量：** 声明在所有函数之外；在整个文件内可见（通过 `extern` 也可被其他文件可见）；位于静态存储区，在整个程序运行期间都存活。不鼓励使用全局变量（隐式耦合）。

### 内存泄漏 (Memory leak) —— (Q32)
**从未被 `delete`** 且你已经丢失了指向它的最后一个指针的堆存储 —— “由于缺少 `delete` 而永远丢失的存储”。原因：
- 忘记 `delete`/`delete[]`。
- 在删除堆对象之前覆盖了指向它的唯一指针。
- 一个在构造函数中分配内存、但**没有（或有错误的）析构函数**的类 → 每个对象都会泄漏（三法则，第 6 节）。

> ⚠️ **必须记住的指针陷阱（Klefstad 的 “Pointer Caveats”）：**
> - **未初始化指针** → `int *p; *p = 0;` ⇒ 段违例（Segmentation Violation / SIGSEGV / “seg fault”，段错误）。
> - **悬空引用（dangling reference）** → 指向一个*已死*对象的指针；使用它是一个致命的、极难调试的错误。
> - **内存泄漏** → 缺少 `delete`。
> - **重复删除（redundant delete）** → 把同一块存储删除了两次。
> - 💡 **箴言：把动态分配限制在类的实现里**（让类的构造函数/析构函数来管理堆 —— RAII）。

---

# 4. 数组、字符串与链表 (Q33–38)

### 链表 vs 数组——权衡取舍 (Q33) 💡
| | **数组（Array）** | **链表（Linked list）** |
|---|---|---|
| 存储 | 一整块连续的内存 | 用指针串起来的独立节点对象 |
| 索引 `A[i]` | **O(1)**（2–3 条指令） | **O(n)**——必须沿着链表逐个走 |
| 大小 | 分配时固定；扩容 = 分配更大的块 + 拷贝（开销大） | 可自由增长/收缩 |
| 在中间插入/删除 | 开销大（需要移动元素） | **在你已经持有指针的位置**很廉价 |
| 额外开销 | 每个元素没有额外开销 | 每个节点多一个 `next` 指针 |
- 两者“都应当只作为类的*实现*来使用”。链表的节点用指针串接；`nullptr` 标记末尾；空链表满足 `head == nullptr`。

### 浅拷贝 vs 深拷贝——(Q34) 💡（重点考查；你在期中考试上栽过这里——见附录 D）
- **浅拷贝（shallow copy）：** 只拷贝指针值 → 两个对象指向**同一块**堆数组。灾难：两个析构函数都会对同一块内存执行 `delete[]`（**双重释放（double-free）**），而且通过其中一个所做的改动会影响另一个。
- **深拷贝（deep copy）：** 分配一块**新的**堆数组并拷贝各元素 → 两个对象彼此独立。
```cpp
// 为持有 'int* buf' 的类编写的深拷贝构造函数：
Vector(const Vector & v) : maxLen(v.maxLen), buf(new int[v.maxLen]) {
    for (int i = 0; i < v.maxLen; ++i) buf[i] = v.buf[i];   // 逐个拷贝每个元素
}
```
🐍 浅拷贝 ≈ `b = a`（两个名字 → 同一个 list 对象）；深拷贝 ≈ `copy.deepcopy(a)`。在 C++ 中，**默认**（编译器生成）的拷贝是*逐成员的*，对指针成员而言就是浅拷贝，这正是你必须自己编写拷贝的原因（三法则）。

### C 风格字符串 vs `std::string`——(Q35) 💡
| | **C 风格字符串（C-string）** | **`std::string`** |
|---|---|---|
| 它是什么 | 一个原始的 `char` 数组，**以空字符结尾**的 `'\0'` | 一个自行管理缓冲区的类 |
| 长度 | `strlen()` 扫描到 `'\0'`（O(n)）；`'\0'` 之后的字符是垃圾值 | `.size()` 已被存储（O(1)） |
| 操作 | `strcpy`、`strcat`、`strlen`、`strcmp`、手写循环 | `=`、`+`、`+=`、`==`、`[]`、`.size()`、迭代器 |
| 安全性 | 不做边界检查；内存由你管理 | 替你管理内存/增长 |
```cpp
char s[12] = "Hello World";   // 11 个字符 + 1 个 '\0' = 12
char s2[]  = "Hello World";   // 大小被推导出来（12）
char *s4   = "Hello World";   // 指向字符串字面量的指针（只读！）
std::string t = "hello";      // 类；t.size() 是 O(1)
```
> ⚠️ 通过 `char*` 写入字符串**字面量**（`s4[0]='M';`）会导致段错误——字面量是只读的。

### 声明 `buf`，让它指向一个 `2*N` 大小的 int 数组，存入 `N`，然后删除——(Q36)
这个确切的模式在考试中会出现：
```cpp
int * buf = new int[2 * N];   // 栈上的局部指针 -> 堆上 2*N 个 int 的数组
buf[2*N - 1] = N;             // 把 N 存入最后一个元素（下标 2*N - 1）
delete[] buf;                 // 数组分配 -> delete[]
```

### 对 C 数组的 `A[i]` 会做边界检查吗？——(Q37) 💡
**不会。** 低层次的 C 数组只是一个基地址；`A[i]` 计算的是 `*(A + i)`，**不会**检查 `i` 是否在范围内。如果 `i` 越界，你就会读/写数组之外的内存 → 未定义行为：垃圾值、损坏的数据，或者段错误。（这*正是*我们要把数组封装进一个带有受检 `operator[]` 的类里的原因。）
```cpp
int a[5] = {0};
a[-1] = 0;     // “会发生什么？”——写到了数组之外；未定义行为
a[5] = 99;     // 同样越界
```

### C 数组元素的默认值——(Q38)
与 Q25 同样的规则：一个**未初始化**的局部 C 数组里装的是**垃圾值**。要清零，就显式初始化：
```cpp
int counts[26] = {0};   // 全部 26 个元素都置为 0
int a[len] = {0};       // 零初始化
```

#### 链表要点（你为 String/Picture 作业实现的那个单链表 SLL）
> 💡 **本课程中强制规定的成员名：`data` 和 `next`。**（“我们都必须使用 `data` 和 `next`，这样我们说的才是同一种语言。”）
```cpp
struct Node { char data; Node * next; };   // 节点

// 遍历（一趟走完！）：
for (Node * p = head; p != nullptr; p = p->next)
    cout << p->data << ' ';

// 加到表头（push）：  head = new Node{ c, head };
// 删除表头（pop）——必须回收被删除的节点：
char pop() {
    Node * tmp = head;        // 保存要删除的节点
    char ret = tmp->data;
    head = head->next;        // 解除链接
    delete tmp;               // 回收  （不要写成：delete head; head = head->next;  -> 悬空！）
    return ret;
}
// 析构函数——用一个临时指针释放整条链：
~CharList() {
    for (Node * p = head; p != nullptr; ) {
        Node * tmp = p; p = p->next; delete tmp;
    }
}
```
> ⚠️ **只走一趟。** 除非必须，否则不要把链表走两遍。不要做多余的拷贝。也绝不要先 `delete p;` *然后再* `p = p->next;`——那会读取已被释放的内存（悬空引用）。

**RAII（Resource Acquisition Is Initialization，资源获取即初始化）**——这一切背后的设计原则：把每一项资源（堆内存）封装进一个类，让它的**构造函数获取**资源，**析构函数释放**资源，**拷贝**做深拷贝，**移动**转移所有权。这是一种简单、系统的防止泄漏的方法。要始终自问的内存所有权问题：*谁拥有这块堆内存？*（例如，`String`/`Picture` 拥有它，**而不是**单个的 `Node`/`Shape`。）

#### 递归（链表那套幻灯片把它和链表配在一起讲）💡
**递归（Recursion）**是一个调用自身的函数——在结构上类似归纳证明。Klefstad 的**递归三定律**：（1）必须有一个**基准情形**（一个无需递归即可解答的终止情形）；（2）每次调用必须**改变状态并朝基准情形靠近**；（3）函数必须**调用自身**（即递归情形）。
```cpp
int sumN(int n)     { return n == 0 ? 0 : n + sumN(n - 1); }       // 基准：n == 0 -> 0
int factorial(int n){ return n == 0 ? 1 : n * factorial(n - 1); }  // 基准：0! == 1
```
链表天然契合递归——处理一个节点，再对 `next` 递归；基准情形是 `nullptr`：
```cpp
int length(Node * L) { return L == nullptr ? 0 : 1 + length(L->next); }   // 基准：空链表
```
> ⚠️ 漏掉基准情形（或未能朝它靠近）→ **无限递归** → 调用栈溢出。每一次递归调用都会得到它**自己的栈帧**，带有它自己的参数/局部变量（调用栈正是这样实现递归的）。
🐍 和 Python 的递归是同一个思路，但 C++ 的默认递归深度要小得多，而且**没有自动的大整数**，所以深度递归可能让栈溢出，而很大的结果可能让 `int` 溢出。

#### C 风格数组退化 ⚠️（一个经典陷阱；与 Q33/Q37 相关联）
当一个 C 数组被传入函数时，它会**退化**成一个指向其首元素的普通指针——**大小信息丢失了**。这就是为什么写成 `int a[]` 的参数实际上是 `int* a`，以及为什么你必须单独传入长度。
```cpp
void f(int a[], int n) {            // 'a' 实际上是 int* ——大小信息没了
    // sizeof(a) == 一个指针的大小（例如 8），而不是数组的字节数
    for (int i = 0; i < n; ++i) {}  // 必须使用传入的长度 n
    // for (auto x : a) {}          // 这里会出错：a 现在是指针，不是数组
}
int main() {
    int A[5] = {0};
    for (auto x : A) {}             // 这里没问题：在这个作用域里 A 仍是真正的数组
    f(A, 5);                        // A 在传入时退化为 int*
}
```
> 💡 这是 `std::vector` / `std::array` 更安全的一大原因——它们随身携带自己的大小，**不会退化**。

---

# 5. 函数与参数 (Q39–48)

### 函数声明 vs 定义 —— (Q39)
- **声明（原型，prototype）：** 只有签名，以 `;` 结尾。它告诉编译器函数的名字、参数类型和返回类型，以便对调用进行检查。`double average(double x, double y);`
- **定义：** 声明**加上函数体** `{ ... }` —— 即实际的实现。
> 💡 函数必须**在被调用之前声明**（否则编译器会报“undeclared”错误），并且**在链接之前定义**（否则链接器会报“undefined”错误）。参见下面 Q42–Q44 的逻辑。

### 按值传递 vs 按引用传递 —— (Q40)
（与 Q26 相同。）值 = 一份你可以在本地修改的拷贝；引用（`&`）= 一个别名，让你能够修改调用方的对象，并避免拷贝。`const&` = 高效 + 只读。

### `std::swap` 及其所需的参数方式 —— (Q41) 💡
交换两个值。它**必须按引用接收参数**——否则它交换的是*拷贝*，调用方的变量不会发生变化。
```cpp
template <typename T>
void swap(T & a, T & b) { T tmp = a; a = b; b = tmp; }   // & 是必需的！
int x = 1, y = 2;  std::swap(x, y);   // 现在 x==2, y==1
```
在移动操作中被大量使用（交换 `buf` 指针，而不是拷贝整个数组）。`std::swap` 位于 `<utility>` 中。

### 函数重载 vs 覆盖 —— (Q43) 💡
- **重载（overloading）：** 多个**同名但参数列表不同**的函数，在**编译期**根据实参来解析。（一种*静态*多态。）
- **覆盖（overriding）：** **派生类**重新定义它所继承的一个 **`virtual`** 函数，使用**相同的签名**，在**运行期**根据对象的实际类型来解析。（*动态*多态——见第 7 节。）
```cpp
int  min(int a, int b);        // 重载 1
double min(double a, double b); // 重载 2 （同名，参数不同）

struct Base    { virtual void draw(); };
struct Derived : Base { void draw() override; };  // 覆盖（相同签名，virtual）
```

### 重载运算符：顶层 vs 成员 —— (Q44) 💡（期末复习“operators”幻灯片）
- **作为成员函数：** **左操作数就是 `this`**（隐式），所以你少声明**一个**参数。
- **作为顶层（普通）函数：** 你要**显式声明所有**操作数。
```cpp
// 成员：左操作数是 *this
bool operator==(const Vector & v) { /* 将 this 与 v 进行比较 */ }

// 顶层：两个操作数都显式声明。operator<< 必须是顶层函数（左操作数是流）：
ostream & operator<<(ostream & out, const Complex & c) { c.print(out); return out; }
istream & operator>>(istream & in, Complex & c)        { c.read(in);  return in;  }
```
**哪些必须是成员：** `=`、`[]`、`()`、`->` 以及类型转换运算符**必须是成员函数**。`<<` 和 `>>` **不能**是成员（它们的左操作数是流）——把它们做成顶层函数（通常是 `friend`）。像 `== != < > + -` 这样的对称运算符既可以是成员（带一个参数），也可以是顶层（带两个参数）。

### 内联函数 —— (Q45)
被标记为 `inline` 的函数是一个*请求*，希望编译器**在调用处替换函数体**，而不是进行真正的函数调用。好处：消除微小函数的调用开销（并且它是类函数宏（function-like macros）的现代、类型安全替代品）。在类体**内部**定义一个函数会使它隐式成为内联函数。

### 默认实参 —— (Q46)
在**声明**中给参数一个默认值；如果调用方省略了那个实参，就使用默认值。只需提供一个值即可**覆盖**它。
```cpp
double toCentigrade(double f = 32.0) { return 5.0*(f-32.0)/9.0; }
toCentigrade();      // 使用 32.0
toCentigrade(6.0);   // 用 6.0 覆盖默认值
```
> ⚠️ 默认值写在声明上（在 `.hpp` 中），不要在 `.cpp` 的定义里重复写；并且只有**尾部**的参数才可以有默认值。

### 友元函数 —— (Q47) 💡
一个非成员函数（或另一个类），被某个类**授予访问其 `private`/`protected` 成员的权限**，在类的*内部*用 `friend` 声明。
> Klefstad 的说法：*“谁说我是你的朋友？——是我（授予友元关系的那个类），而不是你。”* 友元获得读取该类私有部分的特权。
- 为什么使用它：例如，`operator<<` 必须是顶层函数，但它需要读取私有数据 → 把它做成 `friend`。

### `constexpr` 变量 / `constexpr` 函数 —— (Q48)
- 一个 **`constexpr` 变量**是一个编译期常量 (Q17)。
- 一个 **`constexpr` 函数**在给定编译期实参时*可以*在编译期求值（否则在运行期求值）。用它们来计算常量，而无需使用宏。

#### C++ 程序是如何构建的 ——（哪个错误来自哪个工具？）💡（期末复习“declarations vs definitions”幻灯片；你在期中考试中漏掉了链接/重复定义的题目）
| 阶段 | 处理内容 | 典型错误 |
|---|---|---|
| **预处理器（Preprocessor）** | `#include`、`#define`、`#ifdef` | （文本错误） |
| **编译器（Compiler）** | 每个源文件一遍；必须**在调用前声明** | **“undeclared”** 标识符；类型错误；**编译错误** |
| **链接器（Linker）** | 合并 `.o` 文件；被调用的函数必须**已定义** | **“undefined reference”**；**“multiply defined”**（同一符号在 2 个文件中被定义） |
| **加载器（Loader）** | 将可执行文件加载到 RAM 中，调用 `main()` | — |
| （运行期） | — | **segmentation fault**（坏指针/越界索引） |

---

# 6. 类与对象 (Q49–65)

> 这是本课程的核心。锚定示例：Klefstad 的 `Vector`/`IntList`/`String` 类，它们拥有一个堆数组 `int* buf`。

### 类声明与类定义 — (Q49)
- **类声明（class declaration）**（在 `.hpp` 中）类似于函数原型（prototype）：它列出成员以及方法签名。
- **类定义（class definition）**提供函数体。（成员函数通常在 `.cpp` 中用 `ClassName::method` 的形式*定义*。）
```cpp
// Complex.hpp —— 声明
class Complex { float re, im; public:
    Complex(float r = 0, float i = 0);
    void print(ostream & out) const;
};
// Complex.cpp —— 定义
Complex::Complex(float r, float i) : re(r), im(i) {}
void Complex::print(ostream & out) const { out << "(" << re << "+" << im << "i)"; }
```

### 类与对象 — (Q50)
**类（class）**是蓝图（定义该类型的对象长什么样以及它们的行为）。**对象（object）**是从类创建出来的一个实际实例（instance），它拥有**自己的一份数据成员副本**以及自己的生命周期（lifetime）。

### 私有成员与公有成员 — (Q51)
- **`public:`** = **接口**——所有人都可以访问（“控制部件”：方向盘、踏板）。
- **`private:`** = **实现**——**只有该类自己的成员函数**（以及友元（friend））可以访问（“内部部件”：发动机、燃油喷射系统）。
- 简单规则：**数据成员设为私有（private）；大多数方法（以及构造函数/析构函数）设为公有（public）；**辅助方法通常设为私有。

### 私有成员与保护成员 — (Q52)
两者对外部代码都不可访问。区别在于继承（inheritance）：
- **`private`** 成员对派生类（derived class）**不**可访问。
- **`protected`** 成员对派生类**是**可访问的（但对外部代码仍然不可访问）。
> 经验法则：把表示（representation）保持为**私有（private）**，这样派生类就不会依赖它（你以后还能修改它）。只有当派生类确实需要直接访问时，才使用 `protected`。

| 成员是… | 类自身 + 友元 | 派生类 | 外部代码 |
|:---|:---:|:---:|:---:|
| `public` | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ❌ |
| `private` | ✅ | ❌ | ❌ |

（所以 **`protected` = `private` 再加上“对派生类也可见”。**）

### 构造函数及其作用 — (Q53)
一个特殊的成员函数（与类同名，没有返回类型），它**构建并初始化 `this` 对象**；在**分配内存之后立即自动**被调用。使用**成员初始化列表（member initializer list）**来构造数据成员：
```cpp
Vector(int newLen) : maxLen{newLen}, buf{ new int[newLen] } { }   // 初始化列表构建各成员
```

### 拷贝构造函数及其三种用途 — (Q54) 💡
将一个**新**对象构造为**某个已有对象的副本**；其签名接受**一个参数：对同一类类型的（`const`）引用**。
```cpp
Vector(const Vector & v) : maxLen(v.maxLen), buf(new int[v.maxLen]) {
    for (int i = 0; i < v.maxLen; ++i) buf[i] = v.buf[i];   // 深拷贝
}
```
**会调用它的三种情形：**
1. **用一个已有对象进行初始化：** `Vector v1{v};`
2. **按值传递（pass by value）：** `Vector foo(Vector v)` —— 实参会被拷贝构造。
3. **按值返回：** `return v;` —— 返回值会被拷贝构造。
> ⚠️ 最佳实践：参数必须是 **`const&`**（这样你才能拷贝临时对象，并且不会意外修改源对象）；拷贝构造函数应当**没有副作用**。

### 析构函数 — (Q55)
一个特殊成员（`~ClassName()`，没有参数、没有返回值），它在内存释放之前进行**清理**；当对象消亡时（栈对象在块结束时、堆对象在 `delete` 时）**自动**被调用。对于一个拥有堆内存的类，它会**释放**该内存：
```cpp
~Vector() { delete[] buf; }
```

### `this` 指针 — (Q56)
每个（非静态的）成员函数都有一个隐藏的指针参数 **`this`**，指向调用该方法的那个对象——就像 Python 中显式的 `self`。`this` 的成员可以直接访问（你既可以写 `re`，也可以写 `this->re`）。你还会在赋值运算符中写 `return *this;`。
```cpp
void print(ostream & out) const { out << re; /* this 的 re */ }
Vector & operator=(const Vector & v) { /* ... */ return *this; }
```

### struct 与 class — (Q57) 💡
**唯一的区别是默认访问级别：** `struct` 的成员**默认为 `public`**；`class` 的成员**默认为 `private`**。（默认的*继承*同样如此：struct 默认公有继承，class 默认私有继承。）其余一切都完全相同——两者都可以有构造函数、方法、访问说明符等等。

### 构造函数与析构函数（何时被调用）— (Q58)
- **构造函数**在**诞生时**运行，紧接在分配内存之后，用来建立对象。
- **析构函数**在**消亡时**运行，紧接在释放内存之前，用来清理。
- 在一个块的范围内，对象按其构造的**相反**顺序被销毁。

### const 成员函数与非 const 成员函数 — (Q59) 💡
一个声明为 `const` 的方法（该关键字放在参数列表**之后**）承诺**不修改 `this`**；在它内部，`this` 被当作 const，因此它不能改变数据成员，并且只能调用其他 `const` 方法。你可以在一个 `const` 对象上调用 `const` 方法；而非 `const` 方法**不能**在 `const` 对象上调用。
```cpp
void print(ostream & out) const;   // const：不修改该对象
void append(int value);            // 非 const：修改该对象
```
> ⚠️ `operator<<` 接受 `const T&`，所以它所调用的 `print` **必须是 `const` 的**。

### 构造函数与赋值运算符 — (Q60) 💡
- **构造函数**从原始内存中构建一个**全新的**对象（目标对象此前并不存在）。
- **赋值运算符 `=`** 用另一个对象去更新一个**已经构造好的**对象 → 它必须**先清理掉自己原有的资源**，然后拷贝，最后 `return *this;`。
```cpp
Vector & operator=(const Vector & v) {
    if (this != &v) {              // 自赋值检查（用 IDENTITY 标识——见下文）
        maxLen = v.maxLen;
        delete[] buf;              // 释放旧数组（我们自身已经存在）
        buf = new int[v.maxLen];
        for (int i = 0; i < maxLen; ++i) buf[i] = v.buf[i];
    }
    return *this;                  // 使链式赋值 a = b = c; 成为可能
}
```
> 💡 **自赋值（self-assignment）检查用的是标识（IDENTITY），即 `this != &v`，而不是值比较。** Klefstad 的幻灯片指出 `if (*this != v)` 是**错误**的——自赋值关乎是否为*同一个对象*（同一地址），而不是是否具有相等的*值*。比较值（`operator!=`）是错误的检查方式（而且可能是未定义的或代价高昂的）。它所要防范的危险是：在 `a = a` 时，`delete[] buf` 会把你正打算从中拷贝的那个数组给释放掉。

### 移动赋值与拷贝赋值 — (Q61) 💡
**拷贝赋值（copy assignment）**复制源对象（深拷贝）并保持其完好无损。**移动赋值（move assignment）**则**窃取源对象的堆资源**（它是一个即将消亡的临时对象），从而避免分配/拷贝。当右侧是一个**右值（R-value）**（一个临时对象，或者你用 `std::move` 包裹的东西）时，就会选择移动。
```cpp
Vector & operator=(Vector && v) {          // && = 右值引用；注意：没有 const
    delete[] buf;                          // 释放我们的旧数组
    buf = v.buf;  maxLen = v.maxLen;        // 窃取 v 的数组
    v.buf = nullptr;                       // 关键：让 v 可以安全地被析构
    return *this;
}
```

### 移动构造函数与拷贝构造函数 — (Q62) 💡💡 （考试常考）
**移动构造函数（move constructor）**通过**接管一个即将消亡的对象的资源**而非拷贝它们来构建一个新对象。参数是一个**右值引用 `T&&`**（没有 `const`）。当从一个临时对象 / 一个被 `std::move` 的对象进行初始化时被调用。
```cpp
Vector(Vector && v) : maxLen(v.maxLen), buf(v.buf) {   // 窃取该指针
    v.buf = nullptr;   // ***极其重要***，以避免重复删除（double-free，双重释放）错误！！！
}
```
> 💡 **牢记：移动构造函数（以及移动赋值）必须设置 `v.buf = nullptr`。** 被移动后的对象**仍然会被调用其析构函数**，而 `delete[] nullptr` 是安全的——但如果你让 `v.buf` 仍然指向你刚刚窃取的那个数组，那么*两个*析构函数都会去释放它 → 双重释放 / 崩溃。

**拷贝与移动一览：**
| | 拷贝 | 移动 |
|---|---|---|
| 参数 | `const T&` | `T&&`（无 const） |
| 源对象之后 | 保持不变 | 被清空（`buf = nullptr`） |
| 工作量 | 分配 + 拷贝元素 | 窃取指针（开销小） |
| 触发条件 | 左值（L-value）源 | 右值（R-value）/ `std::move` 源 |

### 静态与非静态**数据**成员 — (Q63)
- 一个**非静态**数据成员是**每个对象各有一份**的（每个实例都有自己的一份）。
- 一个 **`static`** 数据成员被该类的**所有对象共享**（总共只有一份）；通过 `ClassName::member` 访问。

### 静态与非静态**成员函数** — (Q64)
- 一个**非静态**方法拥有一个 `this` 指针，并作用于某个特定的对象。
- 一个 **`static`** 方法**没有 `this`**——它属于类，而不属于某个实例，并且只能接触静态成员 / 它自己的参数。在本课程中，**String 的辅助函数都是 `static` 的**（通用、不了解任何特定对象），通过 `String::strcpy(...)` 来调用。

### 默认构造函数 — (Q65) 💡
一个可以**不带参数**调用的构造函数（要么不接受任何参数，要么所有参数都有默认实参（default argument））。当你声明一个不带初始化器的对象时会用到它：
```cpp
Vector v;       // 默认构造
Vector arr[10]; // 每个元素都被默认构造
```
> ⚠️ **两个陷阱：** (1) `Vector result;` 会调用默认构造函数，但 `Vector result();` 声明的是一个**函数**（“最令人头疼的解析”，most vexing parse）——Klefstad 的幻灯片标注了*“注意没有括号！！！”*。(2) 如果你声明了**任何**自己的构造函数，编译器就会**停止**生成隐式的默认构造函数——如果你仍然需要无参构造，就必须把它加回来（`Vector() = default;` 或者自己写一个）。

#### 三法则 / 五法则 / 零法则——（把 Q54–Q62 串联起来）💡💡💡
> **三法则：如果你的类包含任何（裸）指针 / 拥有某种资源，你必须把这三个全部写出来：**
> 1. **拷贝构造函数**（深拷贝）
> 2. **拷贝赋值 `operator=`**（释放旧资源、深拷贝、自赋值检查）
> 3. **析构函数**（释放资源）
>
> **五法则：** 为了效率，再加上两个**移动**操作（移动构造函数 + 移动赋值）。
>
> **零法则**（主题 7）：*如果你能避免定义这些特殊操作，就避免。* 如果你的成员全都是行为良好的类型（`std::string`、`std::vector`、`std::map`、智能指针……），它们会自己管理自己 → **五个一个都不要写**；编译器生成的默认版本就是正确的。

**那些*默认*版本做了什么，以及为什么它们对裸指针是错的：** 编译器生成的拷贝构造函数 / 拷贝赋值做的是**逐成员（浅）拷贝**，而默认析构函数不做任何特殊处理。对于一个 `char* buf`：
```cpp
String::~String() { delete[] buf; }
String(const String & s) = default;   // 浅拷贝 -> 两个对象共享同一个 buf -> 双重释放（double free）！
String & operator=(const String & s) = default;   // 同样的灾难
// 而一个空的手写版本同样糟糕：
String(const String & s) { }          // buf 未初始化（垃圾值）-> 崩溃
```
- `= default` 是请求编译器的版本；**`= delete`** 则完全移除一个函数（例如，`unique_ptr` 删除了它的拷贝操作，因此它不能被拷贝）。

---

# 7. 继承与多态 (Q66–73)

> 锚点示例：收集在一个 `Picture` 中的 `Shape` 层次结构（`Circle`、`Rectangle`、`Square`）（HW6）。

### 继承，以及它如何简化设计 —— (Q66)
**派生（derived）**类**继承基类的全部成员**，并且可以**添加**成员或**覆盖（override）**方法。这让你能够通过*扩展*一个已有类型来构建一个新类型，**而无需复制/修改它的源代码**，并且让同一套框架能够操作一整族类型。
```cpp
class Shape { /* ... */ };
class Triangle : public Shape { /* ... */ };   // “Triangle 是一种 Shape”
```
> 要区分**继承（“是一种”，is-a）**与**组合（“拥有/包含”，containment / “是……的一部分”）**。一个 `Engine` 是 `Car` 的*一部分* → 把它作为**数据成员**。一个 `Car` *是一种* `Vehicle` → 使用**公有继承**。

### 基类与派生类 —— (Q67)
- **基类（base，超类/父类）**：定义共有的数据与方法。
- **派生类（derived，子类/孩子类）**：继承这些成员，可以添加更多成员，可以覆盖。一个派生类自身又可以作为更进一步的类的基类（`Menu : public Window : public Screen`）。

#### `public` 与 `protected` 与 `private` 继承（Topic 6 PPT 第 27 页）💡
**继承模式**控制基类的成员在派生类内部*变成*什么。**`public` 继承是唯一能建模“is-a”的方式**（也是多态层次结构唯一可用的方式）；`protected`/`private` 继承表示“以……来实现”，而不是“is-a”。

| 基类成员 | `public` 继承 | `protected` 继承 | `private` 继承 |
|:---:|:---:|:---:|:---:|
| `public` | public | protected | private |
| `protected` | protected | protected | private |
| `private` | 不可访问 | 不可访问 | 不可访问 |

> 把继承模式理解为一个**上限（天花板）**：成员透过来时*至多*与该模式所允许的一样可访问，而无论何种模式，基类的 `private` 成员**永远**不能被派生类直接访问。在 `Vector` 之上通过 `private` 继承来构建一个 `Stack` 属于“复用”，而不是“is-a”—— 这种情况下不要使用*公有*继承（对一个栈做数组下标访问毫无意义）。

### 虚函数 —— (Q68) 💡
一个被标记为 `virtual` 的成员函数使用**动态绑定（dynamic binding）**：调用哪个版本是在**运行时**由对象的**实际（动态）类型**决定的，而不是由它声明的（静态）类型决定。正是这一点让多态能够通过基类指针/引用工作。
```cpp
struct Base    { virtual int f(); int g(); };   // f 是虚函数，g 不是
struct Derived : Base { int f() override; };     // “一旦虚函数，永远虚函数”
```
> 风格：覆盖时写上 `override`（这样编译器会验证函数签名是否匹配）。在派生类中 `virtual` 是可选的，但为了清晰仍建议写上。

### 静态绑定与动态绑定 ——（运行的是哪个版本？）💡
```cpp
CheckedVector cv(20);
Vector & vp = cv;          // 声明（静态）类型是 Vector；实际（动态）类型是 CheckedVector
vp[0];   // 如果 operator[] 是虚函数 -> CheckedVector::operator[]（动态绑定）
         // 如果不是虚函数          -> Vector::operator[]        （静态绑定，按声明类型）
```
- **静态绑定（static binding）**（非虚）：在编译时按**声明**类型选择。适合*同质*集合 / 纯复用。
- **动态绑定（dynamic binding）**（虚）：推迟到运行时，按**实际**类型选择。对于*异质*混合体（一个 Picture 中的多种 Shape）是必需的。

### 虚析构函数，以及为什么它重要 —— (Q69) 💡💡
当你**通过基类指针** `delete` 一个派生对象时，**除非基类的析构函数是 `virtual`**，否则只会运行基类的析构函数 —— 于是派生部分会泄漏/析构不完全。**规则：** 任何含有虚函数的类（多态层次结构中的任何基类）都需要一个**虚析构函数**，并在层次结构的**根部**引入它。
```cpp
class Shape {
public:
    virtual double perimeter() = 0;
    virtual ~Shape() = default;    // 必需，这样 'delete shapePtr' 才会按真实类型析构
};
```
（只有在永远不会有对象通过基类指针被销毁时，才可以省略它。）

### 虚函数与纯虚函数 —— (Q70) 💡
- 一个**虚函数（virtual）**函数**有定义**；派生类*可以*覆盖它。
- 一个**纯虚函数（pure virtual）**函数**没有定义**，并以 `= 0` 声明；派生类**必须**覆盖它才能成为具体（可实例化的）类。
```cpp
virtual void rotate(int d);       // 虚函数：有（或将有）函数体
virtual void draw() = 0;          // 纯虚函数：没有函数体，必须被覆盖
```

### 抽象类 —— (Q71) 💡
一个含有**一个或多个纯虚函数**的类是**抽象类（abstract class）**。你**不能实例化**一个抽象类（`Shape s;` 是错误的）—— 你只能声明指向它的**指针或引用**（`Shape* sp; Shape& sr;`）。它定义了一个由具体派生类去实现的接口。像 `move()` 这样的非纯方法*可以*在抽象基类中定义。

### 纯虚析构函数 —— (Q72)
当一个类没有其他纯虚函数时，你可以把它的析构函数声明为纯虚的（`virtual ~Shape() = 0;`）来**强制该类成为抽象类**。注意：纯虚析构函数**仍然需要一个定义**（函数体），因为每个派生类的析构函数都会调用基类的析构函数。
```cpp
class Base { public: virtual ~Base() = 0; };
Base::~Base() {}   // 仍然必须提供一个函数体
```

### 多态如何工作及其好处 —— (Q73) 💡
**多态（polymorphism）** = 一次调用实际触发的操作取决于对象的类型。
- **静态多态**通过**重载（overloading）**实现（编译时）。
- **动态多态**通过**虚函数**实现（运行时）：一个基类指针/引用可以引用任何派生对象，而一次虚调用会分派到正确的覆盖版本。
```cpp
void rotate_all(Shape* vec[], int size, int angle) {
    for (int i = 0; i < size; ++i)
        vec[i]->rotate(angle);   // 在运行时分派到 Circle::/Rectangle::/Square::rotate
}
```
**好处 —— 可扩展的框架：** 你可以添加一个**新的** `Shape` 子类型（例如 `Square`），而**无需修改** `rotate_all` 或 `Picture`。*“Picture 对 Triangle 一无所知，它只知道 Shape。”*
> 构造/析构顺序：**先构造基类，再构造派生类的成员**；析构则相反。派生类的构造函数会先调用基类的构造函数（如果你不指明某个构造函数，就调用默认的那个）。

---

# 8. 模板（Templates）(Q74–77)

### 模板参数的种类 + 默认值 —— (Q74) 💡
模板参数列表用逗号分隔；其种类有：
- **`typename T`**（类型参数，type parameter）—— 用于元素类型任意的容器。（`class T` 含义相同，只是更早的写法。）
- **非类型参数（non-type parameter）**，例如 **`int N`** —— 用于数组大小或默认计数之类的场合。

它们**可以带默认值**，就像默认实参（default argument）一样：
```cpp
template <typename charType = char, int capacity = 100>
class basic_string { /* ... */ };   // std::wstring 就是 charType = wchar_t 的 basic_string
```

### 模板函数（Template function）—— (Q75)
一个函数只写一次，却能用于**任意类型**；编译器会为每个用到的类型生成一个具体版本。
```cpp
template <typename Type>
Type min(Type a, Type b) { return a < b ? a : b; }
```
模板类型 `T` 必须支持函数体中所用到的一切操作（这里是 `operator<`）。当泛型版本对某个类型而言不正确或效率低下时，你可以为该类型进行**特化（specialize）**：
```cpp
char * min(char * a, char * b) { return strcmp(a,b) < 0 ? a : b; }  // 对 C 风格字符串做特殊处理
```

### 实例化模板**函数** —— (Q76)
只需**调用它**——编译器会从实参中**推导（deduce）**出类型，并实例化（instantiate）对应的版本：
```cpp
int    x = min(10, 20);       // Type = int
double y = min(10.5, 20.8);   // Type = double
```
（你也可以显式强制指定：`min<double>(10, 20.8);`。）

### 实例化模板**类** —— (Q77) 💡
在尖括号中提供类型实参；这就创建出了一个真正可用的类型：
```cpp
Stack<double> dstack;          // 一个存放 double 的 Stack
using intStack = Stack<int>;   // 类型别名（优于旧式的 'typedef Stack<char> charStack;'）
```
> ⚠️ **在类外定义模板方法：** 每个类外方法都必须加上模板参数列表前缀，**并且**用 `ClassName<T>::` 进行限定。正因如此，模板的定义通常**完全放在 `.hpp` 中**（编译器需要完整的定义才能针对每个类型进行实例化）。
```cpp
template <typename T>
void Stack<T>::push(T x) { buf[len++] = x; }
```

**函数解析顺序**（重载 + 模板，简化版）：先匹配非模板函数；若恰好有一个，就用它；否则尝试模板实例化；若仍没有，则再次尝试非模板函数并允许类型转换。（`const` 匹配：非 `const` 形参不能绑定 `const` 实参；`const&` 形参两者皆可绑定，对字面量会创建一个临时对象；普通的 `&` 形参需要一个有效的左值（l-value）——`swap(10,20)` 是错误的。）

---

# 9. lambda (Q78–80)

### 什么是 lambda —— (Q78) 💡
一种**匿名的局部函数对象（anonymous local function object）**，你可以内联定义它并传给 STL 算法。形式：`[capture](params){ body }`（或者没有参数时写 `[]{}`）。
```cpp
auto fn = [](int i){ return i * i; };   // 存到 'auto' 里
cout << fn(4) << endl;                  // 16
([](string s){ cout << "hello " << s << endl; })("world");   // 定义后立即调用：(fn)(arg)
```
lambda 在作为算法实参时最为出彩：
```cpp
transform(V.begin(), V.end(), V.begin(), [](int i){ return i+1; });   // 给每个元素加 1
for_each(istream_iterator<string>(in), istream_iterator<string>(),
         [&](string & s){ ++M[s]; });   // 单词计数：按引用捕获 M
```

### lambda 捕获（capture）—— (Q79)
**`[ ]`** 列出 lambda 函数体内部可以使用的、来自**外围作用域（enclosing scope）**的变量，以及它**如何**抓取这些变量（按引用还是按拷贝）。如果不进行捕获，lambda 就看不到局部变量。

### 捕获模式 —— (Q80) 💡
| 捕获写法 | 含义 |
|---|---|
| `[]` | **不捕获**任何东西 |
| `[&]` | **按引用**捕获所有用到的变量 |
| `[=]` | **按拷贝**捕获所有用到的变量 |
| `[M]` | 只**按拷贝**捕获 `M`（其它都不捕获） |
| `[=, &M]` | `M` **按引用**，其余一切**按拷贝** |
| `[&, M]` | `M` **按拷贝**，其余一切**按引用** |
> ⚠️ **按引用（`&`）**会看到/影响那个活着的变量（例如 `++M[s]` 会更新真正的 map）。**按拷贝（`=`）**则在一份私有快照上操作——改动不会传播到外部，而且按拷贝捕获一个大对象代价很高。如果 lambda 的存活时间超过被捕获的变量，按引用捕获就很危险。

> 注（主题 7 “零法则”）：lambda + 标准容器正是你为什么常常**一个**特殊成员函数都不需要写的原因。

---

# 10. 异常（Exceptions）(Q81–85)

### 用 `try`-`catch` 处理异常 — (Q81) 💡
把有风险的代码放进 **`try`** 块中；在一个或多个 **`catch`** 块中处理问题。如果 `try` 内部（或它调用的某个函数）`throw`（抛出）了异常，控制流会跳转到一个匹配的 `catch`，跳过 `try` 中剩余的部分。
```cpp
try {
    int i = v[10];          // 可能抛出 out_of_range
} catch (const std::out_of_range & e) {
    cerr << "bad index: " << e.what() << endl;
} catch (...) {             // 捕获一切
    cerr << "some other error" << endl;
}
```

### 异常是什么，以及为什么 — (Q82)
**异常（exception）** 是一种信号，表示发生了**运行时错误（run-time error）**（例如，索引越界，或对空栈调用 `pop()`）。它是 **`return` 的一种非局部替代方案**：它让你能够从调用链深处把错误报告给栈上很远处的处理程序，*“但应当谨慎使用。”*（仅用于**同步（synchronous）**错误——而不是 GUI 事件／中断／信号。）

### 实际被抛出的是什么 — (Q83) 💡
**一个对象。** 你可以抛出任何值，但惯用做法是抛出一个**异常类（exception class）**的对象（通常来自标准层次结构），用于携带关于该错误的信息。
```cpp
char & operator[](int index) {
    if (!in_bounds(index)) throw std::string("index out of bounds");  // 抛出一个对象
    return buf[index];
}
```

### C++ 如何把 `catch` 与 `throw` 匹配起来 — (Q84) 💡
被抛出对象的**类型**会**按顺序，自上而下**地与每个 `catch` 子句进行匹配；**第一个兼容的**处理程序会被执行。针对**基类（base）**类型的 `catch` 也会捕获**派生类（derived）**的异常（因此顺序应为：具体 → 通用；`catch(...)` 放在最后）。匹配是按类型进行的——这里**没有**像函数实参匹配那样的隐式数值转换。

### 追踪一段 throw/catch 程序 — (Q85)
要能够预测输出。要点：`try` 内部 throw **之后**的代码会被**跳过**；随着栈展开到处理程序，**局部栈对象会被展开**（它们的析构函数会运行）；在匹配的 `catch` 执行完毕之后，执行会从整个 try/catch **之后**继续。

#### 标准异常层次结构（根：`std::exception`）💡
- 由语言／运行时抛出：**`bad_alloc`**（`new` 失败）、**`bad_cast`**（向引用进行的 `dynamic_cast` 失败）、**`bad_typeid`**、`ios::failure`（I/O 错误）。
- **`logic_error`**（可由程序员预防）：`domain_error`、`invalid_argument`、`length_error`（例如，向一个字符串追加过多字符）、**`out_of_range`**（错误的 `operator[]` 索引）。
- **`runtime_error`**（只在运行时才能检测到）：`range_error`、`overflow_error`、`underflow_error`。

---

# 11. 命名空间（Namespaces）(Q86–90)

### 命名空间是什么 + 为什么 —— (Q86) 💡
一个用于将相关标识符分组的**命名作用域（named scope）**，使得不同库中的名字不会发生冲突。*所有* C++ 标准库的名字都位于命名空间 **`std`** 中。（在本课程里，你把自己的链表辅助代码放进 `namespace list`，并以 `list::Node`、`list::copy()` 的形式使用。）

### 创建并使用命名空间 —— (Q87)
```cpp
namespace mySpace {
    class Stack;
    void myStackFunction(Stack s);
}
mySpace::Stack stk;          // 限定名用法
mySpace::myStackFunction(stk);
```
> 命名空间是**累积的/开放的（cumulative / open）**：你可以在另一个文件里重新打开它并添加更多内容——这些片段会合并到一起。
```cpp
namespace mySpace { void another(); }   // 把 'another' 添加到 mySpace
```

### 打开命名空间使其名字直接可见 —— (Q88)
三种“引入名字”的层级：
```cpp
mySpace::Stack stk;          // 1) 完全限定（不导入）
using mySpace::Stack;        // 2) using 声明：只导入一个名字
Stack stk;
using namespace mySpace;     // 3) using 指令：打开整个命名空间
using namespace std;         //    （所有名字都直接可见）
```

### 命名空间别名 —— (Q89)
为一个很长的命名空间起一个简短的本地名字：
```cpp
namespace fs = std::filesystem;   // 现在可以写 fs::path 而不必写 std::filesystem::path
```

### 取舍：使用命名空间 vs 不使用 —— (Q90) 💡
- **优点：** 避免名字冲突；组织大型库；让两个库可以复用同样简单的名字。
- **打开一个命名空间（`using namespace std;`）的缺点：** 会拉入*每一个*名字，这可能重新引入歧义并掩盖 bug。
> ⚠️ **课程规则：** 永远不要在 **`.hpp`** 中写 `using namespace std;`（它会强制每个包含该头文件的文件都打开这个命名空间）。在 `.cpp` 文件中优先使用限定名（`std::cout`）或者窄范围的 `using std::cout;` 声明。

---

# 12. I/O 流、文件与 stringstream (Q91–94)

### 流上的插入器与提取器 —— (Q91) 💡
- **`<<` 是*插入器*（inserter）** —— 把数据**发送到**输出流。它是一个**左结合的二元**运算符，所以可以链式调用：`cout << a << b << endl;` 会被解析为 `((cout << a) << b) << endl`。
- **`>>` 是*提取器*（extractor）** —— 从输入流**读取**数据；对字符串而言，它一次读取**一个以空白分隔的单词**，并**返回该流**，而流在到达文件末尾时为 *false*。这正是读取循环这一惯用法能奏效的原因：
```cpp
string word;
while (in >> word) { out << word << endl; }   // 在 EOF 处停止
```
- `getline(in, line)` 读取**一整行**（直到 `'\n'`）。

### C++ 流的两个例子 —— (Q92)
以下任选其二：**`cin`/`cout`/`cerr`**（终端）、**`ifstream`/`ofstream`**（文件）、**`istringstream`/`ostringstream`/`stringstream`**（内存中的字符串）。流可以是终端、文件、字符串、套接字……并且共享同一套 `<<`/`>>` 接口。
```cpp
#include <fstream>
ifstream in("input.txt");
ofstream out("output.txt");
string line;
while (getline(in, line)) out << line << endl;
in.close(); out.close();
```

### `iomanip` 格式化（附示例）—— (Q93) 💡
`<iomanip>` 操纵符（manipulator）控制字段宽度、对齐方式、精度等。摘自期末复习幻灯片：`endl`、`ends`、`left`、`right`、`setw(n)`。
```cpp
#include <iomanip>
cout << setw(8) << right << 42  << '\n';   // 宽度 8，右对齐："      42"
cout << setw(8) << left  << "hi" << "|\n"; // 在宽度 8 内左对齐："hi      |"
cout << fixed << setprecision(2) << 3.14159 << '\n';   // "3.14"
```
> ⚠️ `setw(n)` **仅作用于下一个项**；对齐/精度标志是**粘性的**（保持设置直到被改变）。

### `stringstream`（把一行解析成带类型的各个部分）—— (Q94) 💡💡（你在 HW8 的 `compute_grades` 中用到了它）
**`stringstream`** 是一个以字符串为底层支撑的流 —— 你可以用 `>>` 从中提取带类型的值，就像从 `cin` 中提取一样。标准的模式是**先 `getline` 一整行，然后把它包进一个 `stringstream`** 来解析各个字段。这样会把解析**限定**在那一行内（它不会意外读到下一行去）。
```cpp
#include <sstream>
string line = "Alice 95 88 77";
istringstream ss(line);
string name; int q1, q2, q3;
ss >> name >> q1 >> q2 >> q3;   // name="Alice", q1=95, q2=88, q3=77
```
🐍 类似于 Python 中的 `line.split()`，但它能感知类型（它会把 `"95"` 直接转换成 `int`）。

---

# 13. STL 容器、迭代器与算法 (Q95–109)

> STL 由**三个可组合的部件**构成（很大程度上源自 Alexander Stepanov 的设计）：**容器（container）**负责存放东西，**算法（algorithm）**负责处理东西，而**迭代器（iterator）**把任意算法连接到任意容器。此外还有**函数对象/lambda**（让算法更灵活）以及**标准异常**。

### STL 容器（STL container）— (Q95)
一个**存放一组对象集合**的类模板（class template）。两大家族：
- **序列容器（sequence containers）**（有序）：`array`、**`vector`**（动态数组）、`list`（双向链表）、`forward_list`（单向链表）、`deque`（两端都能 push/pop）。
- **关联容器（associative containers）**（有序排序）：**`set`**、`multiset`、**`map`**、`multimap`，以及对应的 `unordered_`（哈希）版本。
```cpp
vector<int> v;  for (int i=0;i<100;++i) v.push_back(i);   // 动态数组
```

### STL 算法（STL algorithm）— (Q96)
一个**处理某个区间（range）**的函数模板（function template）（复制、查找、排序、变换、累加……）。它能作用于**任意**容器，因为它面向的是**迭代器**，而非直接面向容器。
```cpp
#include <algorithm>
sort(V.begin(), V.end());
auto pos = find(V.begin(), V.end(), 3);   // 指向那个 3 的、类似指针的迭代器
```

### 容器迭代器（container iterator）— (Q97)
一个**指向容器内部**的对象（就像数组指针），让你能读取并向前推进遍历元素。每个容器都提供 `C.begin()`（第一个）和 `C.end()`（最后一个的**后一个**）。
```cpp
for (vector<int>::iterator p = V.begin(); p != V.end(); ++p)
    cout << *p << endl;   // *p 读取当前元素
```
**迭代器操作：** `*`（当前元素）、`->`（当前元素的成员）、`++`（下一个）、`--`（上一个，若支持）、`==`/`!=`、`=`。

### 容器、算法与迭代器之间的关系 — (Q98) 💡
迭代器是**粘合剂**：算法是针对迭代器接口编写的，因此*同一个*算法可以运行在 `vector`、`list`、`set` 等容器上。这正是 STL 之所以“可组合”的原因——N 个容器 + M 个算法，通过同一套迭代器抽象，就能在全部 N×M 种组合中工作。

### 基于范围的 for 循环（range-based `for` loop）— (Q99) 💡
无需显式迭代器即可遍历容器的每一个元素：
```cpp
for (auto e : V)        cout << e;       // e 是每个元素的一份拷贝（COPY）
for (auto const & E : V) cout << E;       // E 是 const 引用（不拷贝）——读取时首选
for (auto & E : V)       E += 1;          // 引用——让你能修改元素
for (auto x : {1,2,3,4,5}) cout << x;     // 对初始化列表同样有效
```
🐍 这就是 C++ 版的 `for x in V:`。

### `std::string` 容器（含示例）— (Q100)
一个字符序列，支持随机访问与丰富的操作（`=`、`+`、`+=`、`==`、`[]`、`.size()`、迭代器）：
```cpp
string s = "hello";
s[0] = 'H';
for (char c : s) cout << c;   // Hello
```

### `std::vector`（含示例）— (Q101) 💡
一个**动态数组**——通过 `operator[]` 实现快速随机访问，在**尾部**（`push_back`、`pop_back`、`back`）以摊还 O(1) 的复杂度快速追加/删除。
```cpp
vector<int> v(100, 0);   // 100 个元素，全部为 0
v.push_back(7);
cout << v[0] << " " << v.back() << " " << v.size();
```
🐍 相当于 C++ 里的 Python `list`。

### `std::map`（含示例）— (Q102) 💡
一个**有序排序**的关联容器，存放 **`pair<key, value>`**，可用**任意**键类型索引；**键唯一**；`insert`/`find`/`erase` 都是 **O(log N)**；按**键的顺序**迭代。
```cpp
map<string,int> A;
A["Bill"] = 33; A["George"] = 29; A["Al"] = 27;
for (auto const & [name, age] : A)        // C++17 结构化绑定（“解构式 for”）
    cout << name << " is " << age << " "; // Al is 27 Bill is 33 George is 29 （按键排序）
```
> ⚠️ **对 map 使用 `operator[]` 时，如果键不存在，会悄悄插入一个默认值的条目**——这是个经典陷阱。如果你只是想查找，请使用 `.find()`。
🐍 像 Python 的 `dict`，但**始终按键保持排序**。

### `std::set`（含示例）— (Q103)
一个由**唯一**值构成的**有序排序**集合（元素*本身就是*它自己的键）；`insert`/`find`/`erase` 为 O(log N)。`multiset` 允许重复值。
```cpp
set<char> S;
for (char c='A'; c<='Z'; ++c) S.insert(c);
for (char c='Z'; c>='A'; --c) S.insert(c);   // 重复值被忽略
for (auto E : S) cout << E;                  // ABC...Z，每个仅一次
if (S.find('A') != S.end()) cout << "A is in there";
```
🐍 像 Python 的 `set`，但**有序排序**。

### `std::pair`（含示例）— (Q104)
存放**两个值**，类型可以不同，通过 `.first` 和 `.second` 访问。`map` 的元素就是 pair。
```cpp
pair<string,int> p{"Al", 27};
cout << p.first << " " << p.second;   // Al 27
```

### Map 与 set 的对比 — (Q105) 💡
两者都是**有序排序、键唯一**的关联容器。区别在于：**set** 只存储**键**（值就是键）；**map** 存储**键→值的 pair**，按**键（`.first`）排序**，而值（`.second`）随之一同携带。

#### 容器复杂度一览 💡（值得记忆）
| 操作 | `vector` | `deque` | `list` | `set` / `map` | `unordered_set/map` |
|---|:---:|:---:|:---:|:---:|:---:|
| 随机访问 `[i]` | **O(1)** | O(1) | ❌ | ❌（`map[key]` O(log n)） | ❌（`map[key]` 平均 O(1)） |
| 在**尾部**插入/删除 | 摊还 O(1) | O(1) | O(1) | — | — |
| 在**头部**插入/删除 | O(n) | **O(1)** | O(1) | — | — |
| 在**中间**插入/删除（已持有迭代器） | O(n) | O(n) | **O(1)** | — | — |
| 按值/键**查找** | O(n) | O(n) | O(n) | **O(log n)** | **平均 O(1)** |
| 迭代顺序 | 插入顺序 | 插入顺序 | 插入顺序 | **按键排序** | 未指定 |

> 💡 根据“什么必须快”来选择：需要随机访问 → `vector`；大量头部操作 → `deque`；**在已持有迭代器时**廉价地在中间插入/删除 → `list`；**有序**的键查找 → `set`/`map`；最快的**无序**查找 → `unordered_*`。

### `std::transform`（含示例）— (Q106) 💡
对源区间的每个元素应用一个函数，并把结果写入目的地。
```cpp
transform(V.begin(), V.end(), V.begin(), [](int i){ return i+1; });   // 原地：每个 +1
transform(begin(L1), end(L1), back_inserter(L2), square);             // L2 = L1 的各元素平方
```

### `std::accumulate`（含示例）— (Q107) 💡
把一个区间归约为单个值（默认为求和），从一个初始值开始。位于 **`<numeric>`** 中。
```cpp
int total = accumulate(V.begin(), V.end(), 0);   // 求和；这个 0 是起始值
```
> ⚠️ **课程提示（HW8）：** `accumulate` **没有 `ranges::` 版本**——即使你对其它算法使用了 `ranges::` 版本，也要用经典的迭代器对语法（`accumulate(begin, end, init)`）来调用它。

### `std::copy` 与 `std::move` — (Q108) 💡
- **`copy(first, last, dest)`** 把一个区间复制到目的迭代器。把它和**插入迭代器（insert iterator）**搭配使用，目的地就能随之增长：
```cpp
copy(L.begin(), L.end(), back_inserter(V));   // 为每个元素调用 V.push_back()
copy(istream_iterator<string>(in), istream_iterator<string>(),   // 读取单词直到 EOF……
     back_inserter(V));                                          // ……存入 V
unique_copy(V.begin(), V.end(), ostream_iterator<string>(out, "\n"));  // 写出，跳过相邻的重复项
```
- **`std::move`（这个函数）** 把一个左值（L-value）转换成右值引用（R-value reference），从而发生**移动（move）**（窃取资源）而非拷贝：`b = std::move(a);`——此后 `a` 处于一个有效但空的状态。（还有一个 `std::move` *算法*，它对一个区间进行移动赋值。）不要把这个移动*转换（cast）*与 `memmove`/复制混淆。

### iterator 与 `const_iterator` 的对比 — (Q109)
- 普通的 **`iterator`** 让你能读取**并修改**它所指向的元素（`*it = x;`）。
- **`const_iterator`** 让你**只能读取**（`*it` 是 const）——在迭代 `const` 容器时、或当你不打算改动元素时使用（`cbegin()`/`cend()` 给出 const 迭代器）。

#### 迭代器类别（哪种容器提供哪种）💡
| 类别 | 能…… | 容器 |
|---|---|---|
| 输入/输出（input / output） | 对序列读**或**写一次，向前 | 流迭代器 |
| 前向（forward） | 读+写，用 `++` 移动 | `forward_list`；你 HW9 的 `SetList` 迭代器 |
| 双向（bidirectional） | `++` **以及** `--` | `list`、`set`、`map`、`multiset`、`multimap` |
| 随机访问（random access） | 双向 **+ `[]`、`+n`** | `vector`、`deque`、`string`；你 HW9 的 `MapArray` 迭代器 |
| 连续（contiguous，C++17） | 随机访问 + 物理上相邻 | `array`、`vector`、`string` |

#### 按迭代器类别编写 `operator++` / `operator--` 💡 (HW9)
**前置/后置的“外壳”对每种类别都是固定的——只有“步进”（那一行带注释的代码）会变化：**
```cpp
// 前置自增（PRE-increment）：执行一步，按引用返回 *this
Iter& operator++() { /* 向前一步 */ return *this; }

// 后置自增（POST-increment）：保存旧值，复用前置自增，返回那份旧的拷贝
Iter  operator++(int) { Iter tmp = *this; ++(*this); return tmp; }
```
- 那个 `int` 参数是一个**未使用的哑元（dummy）**，只用来区分后置与前置。
- **后置自增*永远*都是“保存一份拷贝 + 调用前置自增”**——这一点跨所有类别都不会变。各类别之间不同的，是前置自增内部的那个*步进*。
- `--` 形状完全相同；它的步进是“向**后**走一步”。在循环中优先用 `++it` 而不是 `it++`（后置会多产生一份拷贝）。

**① 前向（forward）**——单链表（你的 `SetList`）。只有 `++`；**没有 `--`**（无法往回走）。
```cpp
// 成员：ListNode* current;
Iter& operator++()    { current = current->next; return *this; }   // 步进 = 跟随 `next`
Iter  operator++(int) { Iter tmp = *this; ++(*this); return tmp; }
// 没有 operator-- ：前向不需要它，而且单链表也做不到
```

**② 双向（bidirectional）**——双向链表/树（*真正的* `std::set` / `std::map`）。`++` 和 `--` 都有，一次走一个节点。
```cpp
// 成员：Node* current;   （每个节点同时拥有 prev 和 next）
Iter& operator++()    { current = current->next; return *this; }   // 向前步进 = `next`
Iter  operator++(int) { Iter t = *this; ++(*this); return t; }
Iter& operator--()    { current = current->prev; return *this; }   // 向后步进 = `prev`  ← 这是双向相比前向多出来的部分
Iter  operator--(int) { Iter t = *this; --(*this); return t; }
// 仍然没有 +n ：要往回走 3 步，就调用 -- 三次
```

**③ 随机访问（random-access）**——连续内存（你的 `MapArray`；成员是一个裸指针）。`++`/`--` 是指针算术，并且你还能进行跳跃。
```cpp
// 成员：value_type* current;   （value_type = std::pair<const Key, Value>）
Iter& operator++()    { ++current; return *this; }   // 步进 = 指针 ++（地址 + sizeof(elem)）
Iter  operator++(int) { Iter t = *this; ++current; return t; }
Iter& operator--()    { --current; return *this; }
Iter  operator--(int) { Iter t = *this; --current; return t; }
```

**随机访问额外多出的部分——`+= -= + -` 这一族（外加 `[]`、各种比较、以及迭代器距离）——这正是让它成为“随机访问”的原因：**
```cpp
using difference_type = std::ptrdiff_t;

// 原地跳跃（按引用返回 *this）
Iter& operator+=(difference_type n) { current += n; return *this; }
Iter& operator-=(difference_type n) { current -= n; return *this; }

// 跳跃并产生一个新的迭代器（按值返回）
Iter  operator+(difference_type n) const { return Iter{ current + n }; }   // it + n
Iter  operator-(difference_type n) const { return Iter{ current - n }; }   // it - n

// 两个迭代器之间的距离（DISTANCE）——返回一个数字，而不是一个迭代器
difference_type operator-(const Iter& o) const { return current - o.current; }   // it2 - it1

// 下标：  it[k]  ==  *(it + k)
reference operator[](difference_type k) const { return current[k]; }

// 排序比较——前向/双向只有 == 和 != ；随机访问追加了这些：
bool operator<(const Iter& o) const  { return current <  o.current; }
bool operator>(const Iter& o) const  { return current >  o.current; }
bool operator<=(const Iter& o) const { return current <= o.current; }
bool operator>=(const Iter& o) const { return current >= o.current; }
```
> 💡 **能力按类别层层累加。** 前向提供 `++ == != * ->`；双向**追加** `--`；随机访问**追加** `+= -= + -`、`it2 - it1`、`[]` 以及 `< > <= >=`。所有这些在 `MapArray` 中几乎是免费的，恰恰因为 `current` 是一个**裸指针**，所以 `current += n` 已经完成了正确的地址算术。（为了完整的对称性，`n + it` 以自由函数 `Iter operator+(difference_type n, const Iter& it)` 的形式提供，因为成员形式只处理 `it + n`。）
> ⚠️ **与第 9 周代码的对比：** Klefstad 的 HW9 `SetList`/`MapArray` 把前置自增**按值返回**（`iterator operator++()`，与他幻灯片第 12 页一致）。上面的 `Iter&` 形式是真正的 `std::` 迭代器所采用的标准形式——两者都能编译，因为两者都 `return *this`，但 `Iter&` 才是规范的、无拷贝的形式。

#### 迭代器**适配器（adapters）**（在算法示例中频繁使用）💡
- **插入迭代器（Insert iterators）：** `back_inserter(c)` → `c.push_back`；`front_inserter(c)` → `c.push_front`；`inserter(c, pos)` → `c.insert`（唯一一个能用于 `set`/`map` 的）。
- **流迭代器（Stream iterators）：** `istream_iterator<T>(in)` 用 `>>` 读取 `T`（默认构造的 `istream_iterator<T>()` = EOF 末尾标记）；`ostream_iterator<T>(out, "sep")` 用 `<<` 写出，**在*每一个*元素之后都追加分隔符**（包括最后一个）。
- **反向迭代器（Reverse iterators）：** `c.rbegin()`/`c.rend()` 向后遍历。

#### C++20 Ranges 与视图（view）（主题 9）💡
- 一个**范围（range）**就是 `begin()..end()`，因此在 **`std::ranges`** 中算法获得了单参数形式：`ranges::sort(v);` 而不是 `sort(v.begin(), v.end())`。
- **视图（views）**（位于 `std::ranges::views` 中）是你用 `|` 组合起来的**轻量、惰性（lazy）**的范围。**惰性 = 在你迭代之前什么都不会计算。**
```cpp
namespace rv = std::ranges::views;
for (int x : v | rv::filter([](int n){ return n%2==0; }) | rv::transform([](int n){ return n*n; }))
    cout << x << ' ';   // 各个偶数元素的平方，按需计算
```

#### 智能指针（smart pointer）（主题 9）——针对单个对象的 RAII 💡
- **`unique_ptr<T>`**——唯一所有者；当它消亡时删除对象；**拷贝被删除**（只能移动，通过 `std::move`）。`auto p = std::make_unique<T>(args);`
- **`shared_ptr<T>`**——共享所有权；当**最后一个** `shared_ptr` 消亡时对象被删除（引用计数）。`auto sp = std::make_shared<T>(args);`
> ⚠️ **HW9 陷阱（来自主题 9 的幻灯片）：** 如果一个链表节点的 `next` 是一个 `unique_ptr`，那么**迭代器无法别名（alias）这个链表**——所以对于 `SetList`，你的 `next` 必须使用一个**裸 `ListNode*`**，而不是 `unique_ptr`。

| | `unique_ptr<T>` | `shared_ptr<T>` |
|---|:---:|:---:|
| 所有者 | 恰好 **1** 个 | **1 到多个**（引用计数） |
| 可拷贝？ | ❌（拷贝 `= delete`） | ✅（增加计数） |
| 可移动？ | ✅（转移所有权） | ✅ |
| 开销 | 除 `T` 外没有额外开销 | 一个控制块（计数 + 删除器） |
| 何时释放对象 | 当 `unique_ptr` 消亡时 | 当**最后一个** `shared_ptr` 消亡时（计数 → 0） |
| 用什么创建 | `std::make_unique<T>(args)` | `std::make_shared<T>(args)` |

> 💡 默认使用 **`unique_ptr`**（更便宜、所有权明确）；只有在所有权确实是共享的时候才用 `shared_ptr`。优先使用 `make_unique`/`make_shared` 而不是裸 `new`（异常安全，无需重复书写类型名）。这就是 RAII 的现代面貌：当成员是智能指针（或 `std::vector`/`std::string`）时，**三法则坍缩成了零法则**——你*一个*特殊函数都不用写。

---

# 附录 A —— Klefstad 的格言（请牢记于心）

下面这些是教授在课件里反复讲到的"金句"——正是那类会出现在概念题里的"智慧"：

- *"能力越大，责任越大。"（"With great power comes great responsibility."）* —— 谈的是动态分配：`new`/`delete` 赋予你能力，但你必须自己管理它。
- *"智慧之言：把动态分配限制在类的实现内部。"（"Wisdom: restrict dynamic allocation to class implementations."）* —— 把裸 `new`/`delete` 包进一个类里（RAII）；不要让它们散落在 `main` 各处。
- *"我只想先让它跑起来" / "我之后再来收拾"（"I just want to get it to work" / "I'll clean it up later"）* → 会导致那种极难找出的 bug。**现在就把它收拾干净。** *如果一个函数超过 5 行，就重构它。逐块测试。*
- *"所有代码都有 bug，但只有可读的代码才能被修复。"（"All code has bugs, but only readable code can be fixed."）*（Code Review 课件）—— 可读性就是正确性的保险。
- 代码评审（code review）最初的目的：*"逼迫开发者写出其他开发者能看懂的代码。"（"force developers to write code that other developers understand."）*
- **命名：** *"我们都必须使用 `data` 和 `next`，这样我们才是在讲同一种语言。"（"We all must use `data` and `next` so we are speaking the same language."）*（链表节点的成员）
- **友元：** *"谁说我是你的朋友？—— 是我说的，不是你说的。"（"Who says I am your friend? — me, not you."）*（是类来授予 `friend` 身份）
- **那张"Remember"幻灯片（期末总结）：**
  - **三块内存区域：** 静态存储区（data segment）、栈（stack）、自由存储区（堆，free store / heap）。
  - **每个对象都有生命周期**（出生 → 存活 → 死亡；是 **destruction**（析构），不是 "deconstruction"）。
  - **按引用传递有两个用途：**（1）修改实际的实参，（2）效率（避免一次拷贝）。
  - **"如果你不会用它，……"（"If you don't use it, …"）** —— 这是一个开放式提示，关于不要声明/分配你并不需要的东西（零法则的精神）：不会 `delete` 的东西就别 `new`；本可以用 `const&` 传递的东西就别按值传递。

---

# 附录 B —— 快速对照表

### 指针与引用对比
| | 指针（pointer）`T*` | 引用（reference）`T&` |
|---|---|---|
| 可重新绑定 | 是 | 否（初始化时即固定） |
| 可为空 | 是（`nullptr`） | 否 |
| 必须初始化 | 否 | 是 |
| 使用目标 | `*p`、`p->m` | 直接用 `r` |

### `struct` 与 `class` 对比
唯一的区别在于**默认访问权限**：`struct` → 公有（public）；`class` → 私有（private）。（默认继承方式也是如此。）

### 拷贝与移动对比（特殊成员函数）
| | 拷贝构造函数 / 拷贝 `=` | 移动构造函数 / 移动 `=` |
|---|---|---|
| 参数 | `const T&` | `T&&` |
| 效果 | 深拷贝（deep copy）；源对象不变 | 窃取资源；源对象被清空 |
| 操作后源对象 | 完好无损 | `buf = nullptr`（**必需**） |
| 触发条件 | 左值（L-value）源 | 右值（R-value）/ `std::move` |

### 三法则 / 五法则 / 零法则
- **三法则：** 拥有一个裸指针（raw pointer）→ 编写拷贝构造函数 + 拷贝 `=` + 析构函数。
- **五法则：** 此外还要编写移动构造函数 + 移动 `=`。
- **零法则：** 使用 `std::vector`/`string`/`map`/智能指针（smart pointer）→ 这些**一个都不用写**。

### 指针周围的 `const` 摆放位置（从右往左读）
| 声明 | `p` 可重新绑定？ | `*p` 可写？ |
|---|---|---|
| `int * p` | 是 | 是 |
| `int * const p` | **否** | 是 |
| `const int * p` | 是 | **否** |
| `const int * const p` | **否** | **否** |

### 容器速查表
| 容器 | 顺序 | 查找 | 备注 |
|---|---|---|---|
| `vector` | 插入顺序 | `[]` O(1) | 动态数组；尾部操作快（≈ Python list） |
| `set` | 已排序 | O(log N) | 值唯一（≈ 已排序的 Python set） |
| `map` | 按键排序 | O(log N) | 键唯一，`pair<K,V>`（≈ 已排序的 dict）；`[]` 会插入元素！ |
| `list` | 插入顺序 | O(n) | 双向链表；双向迭代器 |

### 错误由哪个编译阶段报告？
`undeclared` → **编译器（compiler）**。`undefined reference` / `multiply defined` → **链接器（linker）**。`segmentation fault` → **运行时**。

### 指针/引用追踪实例（期末复习的热门题——请手动追踪这些）
```cpp
int i = 10;
int * p = &i;       // p -> i
int ** pp = &p;     // pp -> p
int * & rp = p;     // rp 是 p 的别名（一个指向指针的引用）
i  = 20;            // i = 20
*p = 30;            // i = 30  （通过指针修改）
*rp = 50;           // *rp == *p，所以 i = 50
// 最终：i == 50

// const 版本——哪些操作是允许的？
const int i = 10;
const int * const p = &i;   // 不能重新绑定 p，也不能写 *p
const int & r = i;          // i 的只读别名
// p = &j;  错误    *p = 5;  错误    r = 5;  错误
```
```cpp
// 向链表头部插入元素（仅需一行！）：
head = new Node{'C', head};   // 新节点的 next = 旧的 head，然后 head 指向新节点
```

---

# 附录 C —— 代码评审（可能出现在期末考试中）

教授指出，**关于代码评审（Code Reviews）的题目可能会出现在期末考试中。** 所考查的能力是**阅读并在脑中执行代码**，从而（1）找出 **bug**，以及（2）改善**可读性（readability）**。

**如何写出一篇好的评审（要求的格式）：**
```
line X [bug]: The buggy code does {outcome} because {specific wrong code}.
              Instead it should {desired outcome}, so use {correct code}.
line Y [readability]: {unclear code}. Instead, {clearer code}.
```
- 要**具体且有实质内容**，写明行号与确切的修改方案；“这段代码看起来很复杂”不会得到任何分数。
- 把关于**同一个**问题的所有句子归在一起；以行号开头。
- 先在脑中追踪执行（用纸，而不是 PythonTutor）；*之后*你才可以在编译器/PythonTutor 中验证。
- 态度要友好、尊重；避免用含糊的“This will……”作为句子开头——要明确指出代码做了什么。

**反复出现的例子**是一个链表（linked list）的 `remove()`，其中带有诸如 `return temp;` 这样的 bug（它只返回了第一个节点，因此删除头节点会失败——应该写成 `return L;`），以及令人困惑的命名（`temp2`→`new_next`，`temp3`→`node_to_delete`）。要做好准备去阅读 SLL 指针代码，并找出悬空指针（dangling pointer）、错误的返回值以及内存泄漏（memory leak）。

---

# 附录 D —— 期末考试的优先复习主题

你的**期中反馈**（在项目里）是判断该把复习时间花在哪里的最佳信号。你失分的那些题目簇恰好能整齐地对应到上面的各个章节——优先复习这些：

1. **追踪控制流** *（最大的一簇：循环、`if`/嵌套 `if`、条件表达式、`switch`、布尔条件）。* Topic 10 的讲义明确列出了迭代（带 3 个字段的 `for` / 基于范围的 `for` / `while` / `do-while`）、`switch`/`case`/`default`/`break` 结构，以及混合算术运算与 `i++` 对比 `++i`。**练习手工追踪**小程序，并写出精确的输出。→ 关联第 2 节。
2. **三法则与默认拷贝语义** *（深拷贝、默认拷贝构造函数、默认拷贝赋值）。* 要准确理解为什么编译器生成的拷贝是**浅**拷贝，以及它如何导致 double-free（双重释放）。→ 第 6 节（三法则）、第 4 节（浅拷贝对比深拷贝）。
3. **代码审查式追踪** *（深拷贝、动态数组扩容、构造函数初始化、数组查找）。* 重新阅读第 6 节中的 `IntList::increaseArrayTo`、拷贝构造函数和 `indexOf` 代码，并能在其中找出 bug。→ 附录 C + 第 6 节。
4. **数组与 C 风格字符串的追踪** *（数组边界、栈数组初始化、C 风格字符串遍历）。* 没有边界检查（第 4 节 Q37）；未初始化 → 垃圾值 (Q25/Q38)；五种 C 风格字符串遍历惯用法（哪些能用、哪些不能用）。→ 第 4 节。
5. **下标运算符 `[]`** *（重载下标运算）。* 它返回 `int&`（一个左值），以及哪个类做边界检查。→ 第 6 节 Q44/Q59、第 2 节 Q13。
6. **构建流水线与声明** *（函数声明、编译错误对比链接错误、重复定义）。* 哪个阶段捕获哪种错误；包含守卫能防止“重复定义”。→ 第 5 节表格 + 第 1 节 Q4。

> 这六个题目簇是你最容易拿分的地方。如果你手工追踪大约 10 个短程序，并能从零写出一个正确的三法则类，你就已经覆盖了价值最高的内容。

---

# 🎯 走进考场前最重要的 12 件事

1. **对象生命周期（object lifetime）：** 出生（分配 + 构造）→ 存活 →死亡（**析构**+ 释放）。栈（stack）= 块作用域；堆（heap）= `new`……`delete`；静态（static）= 整个程序。
2. **三大内存区域（memory area）：** 静态/数据段、栈、自由存储区（堆）。
3. **`new`↔`delete`、`new[]`↔`delete[]`**——绝不要把它们配错。
4. **三法则（Rule of Three）：** 只要有裸指针成员 ⇒ 就要写**拷贝构造函数 + 拷贝 `=` + 析构函数**；默认的拷贝是**浅拷贝（shallow copy）**→ 双重释放（double-free）。
5. **移动构造函数 / 移动 `=` 必须把源对象的指针置为 `nullptr`**（被移动的对象仍会被析构 →否则就会双重释放）。
6. **自赋值（self-assignment）检查的是同一性（IDENTITY）：** `if (this != &v)`，绝不要写成 `if (*this != v)`。
7. **浅拷贝 vs 深拷贝（shallow vs deep copy）**——以及为什么深拷贝和析构函数密不可分。
8. **引用 vs 指针（reference vs pointer）**，以及 **`const` 的摆放位置**（常量指针 vs 指向常量的指针）。
9. **对庞大的只读对象用 `const&` 传递**（讲求效率）；用 `&` 传递以便修改；按值传递以获得一份独立的拷贝。
10. **虚函数（virtual function）+ 虚析构函数（virtual destructor）** 提供运行期分派；带有纯虚函数（pure virtual function）的类是**抽象类（abstract class）**（无法实例化）。通过基类指针 `delete` 需要一个**虚析构函数**。
11. **STL = 容器 + 迭代器 + 算法**；`vector`/`set`/`map`/`pair`；基于范围的 `for` 循环；`transform`/`accumulate`/`copy`/`find`/`sort`；`map::operator[]` 会悄悄插入元素。
12. **构建流水线（build pipeline）：** 编译器（compiler）捕获*未声明（undeclared）*+ 类型错误；链接器（linker）捕获*未定义（undefined）*/*重复定义（multiply defined）*；糟糕的指针/索引会在运行期触发段错误（seg-fault）。**包含守卫（include guard）** 可防止重复定义。

> 在代码题上要遵守的课程约定：成员名用 **`data`/`next`**；**`.hpp` 里不要写 `using namespace std;`**；窄化转换要用 **`static_cast`**（构建使用了 `-Werror`）；它叫**析构（destruction）**，而不是 “deconstruction”。

**保持自信，保持专注，全力以赴。期末考试好运！🍀**
