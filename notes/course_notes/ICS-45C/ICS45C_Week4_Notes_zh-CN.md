# ICS 45C — Week 4 整合 Reading 笔记

## 目录

- [1. Literals（字面量）](#1-literals字面量)
- [2. Constant Expressions（常量表达式）](#2-constant-expressions常量表达式)
- [3. Constexpr Variables（constexpr 变量）](#3-constexpr-variablesconstexpr-变量)
- [4. The Conditional Operator（条件运算符）](#4-the-conditional-operator条件运算符)
- [5. C-style String Symbolic Constants（C 风格字符串符号常量）](#5-c-style-string-symbolic-constantsc-风格字符串符号常量)
- [6. Dynamic Memory Allocation with new and delete](#6-dynamic-memory-allocation-with-new-and-delete)
- [7. Dynamically Allocating Arrays（动态分配数组）](#7-dynamically-allocating-arrays动态分配数组)
- [8. Pointers, References, and Arrays — Lecture Supplement](#8-pointers-references-and-arrays--lecture-supplement)
- [9. Introduction to the Copy Constructor（拷贝构造函数）](#9-introduction-to-the-copy-constructor拷贝构造函数)
- [10. Class Initialization and Copy Elision](#10-class-initialization-and-copy-elision)
- [11. Shallow vs Deep Copying（浅拷贝 vs 深拷贝）](#11-shallow-vs-deep-copying浅拷贝-vs-深拷贝)
- [12. Overloading the Assignment Operator（重载赋值运算符）](#12-overloading-the-assignment-operator重载赋值运算符)
- [13. Move Constructors and Move Assignment（移动构造与移动赋值）](#13-move-constructors-and-move-assignment移动构造与移动赋值)
- [14. The Rule of Three（三之法则）— Lecture Supplement](#14-the-rule-of-three三之法则-lecture-supplement)
- [15. Class Vector / IntList — Lecture Supplement](#15-class-vector--intlist--lecture-supplement)
- [16. Week 4 速查表与易错点总结](#16-week-4-速查表与易错点总结)

> UCI ICS 45C: Programming in C++ (35770)
> 本笔记整合 Week 4 的 Assigned Reading（LearnCpp 章节）与 PPT（Arrays、Brief Tour of C++、class and struct、Strings、Dynamic Allocation of Arrays），按学习顺序组织。
> PPT 涵盖 Week 4–5，本笔记以 Reading 清单为准，标注了可能属于 Week 5 的内容。

---

## 1. Literals（字面量）

> 对应 LearnCpp 5.2 — Literals

### 1.1 什么是 Literal？

**Literal（字面量）** 是直接写在代码里的值，它的含义不可重新定义（`5` 永远表示整数值 5）。字面量也叫做 **literal constants（字面常量）**。

```cpp
return 5;                     // 5 是 integer literal
bool myNameIsAlex { true };   // true 是 boolean literal
double d { 3.4 };             // 3.4 是 double literal
std::cout << "Hello, world!"; // "Hello, world!" 是 C-style string literal
```

### 1.2 字面量的默认类型

和对象一样，字面量也有类型。类型根据字面量的值推导得出：

| 字面量类型 | 示例 | 默认类型 | 备注 |
|---|---|---|---|
| 整数 | `5`, `0`, `-3` | `int` | |
| 布尔 | `true`, `false` | `bool` | |
| 浮点数 | `1.2`, `0.0`, `3.4` | `double`（**不是 float！**） | |
| 字符 | `'a'`, `'\n'` | `char` | 单引号 |
| C 风格字符串 | `"Hello, world!"` | `const char[14]` | 双引号 |

> ⚠️ **易错点**：`float f { 4.1 };` 会产生编译器警告！因为 `4.1` 是 `double` 字面量（默认），赋给 `float` 会丢失精度。

解决方法：
```cpp
float f { 4.1f };   // ✅ 用 f 后缀让字面量变成 float
double d { 4.1 };   // ✅ 或者把变量类型改成 double
```

### 1.3 字面量后缀（Literal Suffixes）

| 数据类型 | 后缀 | 含义 |
|---|---|---|
| 整型 | `u` 或 `U` | unsigned int |
| 整型 | `l` 或 `L` | long |
| 整型 | `ll` 或 `LL` | long long |
| 浮点 | `f` 或 `F` | float |
| 浮点 | `l` 或 `L` | long double |
| 字符串 | `s` | std::string |
| 字符串 | `sv` | std::string_view |

> 💡 **Best Practice**：除 `f` 外，大多数场景不需要后缀。建议用大写 `L` 而不是小写 `l`（小写 l 和数字 1 在某些字体中很像）。

### 1.4 科学记数法

```cpp
double avogadro { 6.02e23 };      // 6.02 × 10^23
double protonCharge { 1.6e-19 };  // 1.6 × 10^-19
```

### 1.5 C 风格字符串字面量的两个特性

1. **隐式 null 终止符**：`"hello"` 实际上有 6 个字符：`'h'`, `'e'`, `'l'`, `'l'`, `'o'`, `'\0'`。
2. **存储位置**：通常放在只读内存区域（后面 17.11 会详细讲）。

---

## 2. Constant Expressions（常量表达式）

> 对应 LearnCpp 5.4（在当前目录下可能是 5.5）— Constant Expressions

### 2.1 为什么要编译期计算？

默认情况下，表达式在**运行时（runtime）**求值。但有些表达式可以在**编译期（compile-time）**求值，这叫 **compile-time programming（编译期编程）**。

编译期计算的好处：

| 好处 | 说明 |
|---|---|
| **性能** | 程序更小更快 |
| **通用性** | 可用于要求编译期值的地方（如数组长度） |
| **可预测性** | 编译器可以强制某段代码必须在编译期求值，否则报错 |
| **质量** | 编译期不允许未定义行为，某些错误能在编译时发现 |

### 2.2 Constant Expression 的定义

**Constant Expression（常量表达式）** 是一个只含字面量、常量变量、运算符和函数调用的非空序列，其中**每一部分都必须能在编译期求值**。

```cpp
// 这些都是 constant expression
3 + 4
2 * sizeof(int)

// 这不是 constant expression（cin >> x 只能运行时）
std::cin >> x;
```

### 2.3 常量表达式可以包含什么？

- **字面量**（literals）
- **大多数运算符与常量表达式操作数**
- **整型 const 变量且初始化值为常量表达式**（历史特例）
- **constexpr 变量**（见下节）
- **constexpr 函数**（调用参数必须是常量表达式）

### 2.4 as-if 规则

编译器可以自由优化程序，只要观察结果一致：

```cpp
const double x { 1.2 };
const double y { 3.4 };
const double z { x + y };  // x + y 可能在编译期算出 4.6，也可能运行时算
```

> ⚠️ **as-if 规则的问题**：我们无法强制编译器在编译期求值，这就是为什么需要 `constexpr`。

---

## 3. Constexpr Variables（constexpr 变量）

> 对应 LearnCpp 5.5 — Constexpr Variables

### 3.1 为什么需要 constexpr？

仅用 `const` 创建"编译期常量"有几个缺陷：

1. 不清楚这个变量到底能不能用作常量表达式
2. 无法告诉编译器"我**必须**要一个编译期常量"
3. `const` 对非整型不适用（历史规则）

### 3.2 constexpr 的语义

`constexpr` 是 "constant expression" 的缩写。**constexpr 变量永远是编译期常量**——如果初始化值不是常量表达式，编译器会报错。

```cpp
#include <iostream>

int five() { return 5; }  // 普通函数，返回值不是 constexpr

int main()
{
    constexpr double gravity { 9.8 };  // ✅ 9.8 是常量表达式
    constexpr int sum { 4 + 5 };       // ✅ 4 + 5 是常量表达式
    constexpr int something { sum };   // ✅ sum 是常量表达式

    std::cin >> age;
    constexpr int myAge { age };  // ❌ 编译错误！age 不是常量表达式
    constexpr int f { five() };   // ❌ 编译错误！普通函数返回值不是 constexpr

    return 0;
}
```

### 3.3 const vs constexpr 对比

| 特性 | `const` | `constexpr` |
|---|---|---|
| 初始化后不可修改 | ✅ | ✅ |
| 初始化值必须编译期已知 | ❌ | ✅ |
| 可用于常量表达式 | 仅整型 + 常量表达式初始化 | 永远可以 |
| 可用作数组长度 | 仅整型特例 | ✅ |

> 💡 **Best Practice**：
> - 如果初始化值是常量表达式 → 用 `constexpr`
> - 如果初始化值是运行时常量 → 用 `const`
> - 注意：`std::string`、`std::vector` 等动态内存类型**不兼容 constexpr**，用 `const` 或换 `constexpr` 友好类型（如 `std::string_view`、`std::array`）

### 3.4 函数参数的 const vs constexpr

函数调用在运行时发生，参数初始化也在运行时。因此：

1. `const` 函数参数被当作运行时常量（即使传入的是编译期常量）
2. **函数参数不能声明为 `constexpr`**（初始化值要到运行时才知道）

```cpp
void foo(const int x) { ... }      // ✅ OK
void bar(constexpr int x) { ... }  // ❌ 不允许
```

### 3.5 术语速查

| 术语 | 定义 |
|---|---|
| **Compile-time constant** | 编译期已知的值或不可修改对象 |
| **Constexpr variable** | 一定是编译期常量的变量 |
| **Constant expression** | 每部分都能在编译期求值的表达式 |
| **Runtime constant** | 运行时才初始化的常量 |
| **Runtime expression** | 运行时求值的表达式 |

---

## 4. The Conditional Operator（条件运算符）

> 对应 LearnCpp 6.6 — The Conditional Operator

### 4.1 基本语法

**条件运算符 `?:`**（也叫"三目运算符"或"ternary operator"）是 C++ 唯一的三元运算符。

```cpp
condition ? expression1 : expression2;
// 如果 condition 为真，求值 expression1；否则求值 expression2
```

| 运算符 | 符号 | 形式 | 含义 |
|---|---|---|---|
| 条件运算符 | `?:` | `c ? x : y` | c 为真则 x，否则 y |

### 4.2 典型用法

```cpp
// 传统 if-else
if (x > y)
    max = x;
else
    max = y;

// 条件运算符等价写法
max = ((x > y) ? x : y);
```

**Python 对比**：Python 的三元表达式是 `max = x if x > y else y`；C++ 的语法顺序不同。

### 4.3 为什么需要它？(可以用于初始化)

某些场合**只能用表达式**，不能用 if-else 语句。例如变量初始化时：

```cpp
constexpr bool inBigClassroom { false };
constexpr int classSize { inBigClassroom ? 30 : 20 };  // 只能用 ?:

// 下面这段代码编译不过！
if (inBigClassroom)
    constexpr int classSize { 30 };     // classSize 在 if 块内，出了块就销毁
else
    constexpr int classSize { 20 };
std::cout << classSize;  // ❌ classSize 未定义
```

### 4.4 括号陷阱（重要！）

> ⚠️ **严重易错点**：大多数运算符优先级高于 `?:`，不加括号容易出错！

**例 1：算术优先级问题**
```cpp
int z { 10 - x > y ? x : y };
// 你以为是：10 - (x > y ? x : y)       → 结果 8
// 实际是：((10 - x) > y) ? x : y       → 结果 2
```

**例 2：`<<` 运算符优先级高于 `?:`**
```cpp
int x { 2 };
std::cout << (x < 0) ? "negative" : "non-negative";
// 实际求值顺序：(std::cout << (x < 0)) ? "negative" : "non-negative"
// 先打印 0（false），然后整个表达式变成字符串被丢弃
// 输出：0 （不是 "non-negative"！）
```

> 💡 **Best Practice**：
> - 在复合表达式中使用条件运算符时，**整个条件操作都加括号**
> - 为可读性，条件部分含有运算符时也加括号
>
> ```cpp
> std::cout << ((x > y) ? x : y);  // ✅ 整个操作加括号
> ```

### 4.5 类型必须匹配或可转换

条件运算符的两个操作数（`expression1` 和 `expression2`）的类型必须匹配，或能被隐式转换为同一类型。否则编译器报错。

---

## 5. C-style String Symbolic Constants（C 风格字符串符号常量）

> 对应 LearnCpp 17.11 — C-style String Symbolic Constants

### 5.1 两种声明方式

C++ 支持两种方式创建 C 风格字符串符号常量：

```cpp
#include <iostream>

int main()
{
    const char name[] { "Alex" };          // 方式 1：const C-style 字符串
    const char* const color{ "Orange" };   // 方式 2：const 指针指向字符串字面量

    std::cout << name << ' ' << color << '\n';
    // 输出：Alex Orange
    return 0;
}
```

### 5.2 两种方式的内存差异

| 方式 | 内存行为 |
|---|---|
| `const char name[] { "Alex" }` | `"Alex"` 先放进（可能是只读的）内存某处，再为 `name` 分配长度 5 的 char 数组并复制过去。**内存中有两份 "Alex"**，对常量来说有点浪费。 |
| `const char* const color { "Orange" }` | 编译器通常把 `"Orange"` 放进只读内存，然后用它的地址初始化指针。**只有一份**。 |

### 5.3 字面量合并优化

因为字符串字面量是常量，编译器可能把值相同的字面量合并成一个共享副本：

```cpp
const char* name1 { "Alex" };
const char* name2 { "Alex" };
// 两个指针可能指向同一个地址
```

### 5.4 C 风格字符串的类型推导

```cpp
auto s1{ "Alex" };    // 推导为 const char*
auto* s2{ "Alex" };   // 推导为 const char*
auto& s3{ "Alex" };   // 推导为 const char(&)[5]
```

### 5.5 输出指针时的陷阱

`std::cout` 对 `char*` 和 `const char*` 有特殊处理：**它会把它当作 C 字符串打印**，而不是地址！

```cpp
int narr[]{ 9, 7, 5, 3, 1 };
char carr[]{ "Hello!" };
const char* ptr{ "Alex" };

std::cout << narr << '\n';  // 打印地址（如 003AF738）
std::cout << carr << '\n';  // 打印 "Hello!"
std::cout << ptr << '\n';   // 打印 "Alex"
```

> ⚠️ **严重陷阱**：想打印 `char` 变量的地址时会出问题！
> ```cpp
> char c{ 'Q' };
> std::cout << &c;  // ❌ &c 是 char*，cout 当字符串打印
>                    // 因为 c 没有 '\0' 结束，会打印后续内存垃圾！
> // 可能输出：Q╠╠╠╠╜╡4;¿■A
> ```
>
> **修复**：强制转换为 `const void*`
> ```cpp
> std::cout << static_cast<const void*>(ptr) << '\n';  // 打印真正的地址
> ```

### 5.6 Best Practice

> 💡 **Best Practice**：避免使用 C 风格字符串符号常量，优先用 `constexpr std::string_view`。

---

## 6. Dynamic Memory Allocation with new and delete

> 对应 LearnCpp 19.1 — Dynamic Memory Allocation with new and delete

### 6.1 C++ 三种内存分配方式

| 类型 | 变量 | 分配时机 | 生命周期 |
|---|---|---|---|
| **Static**（静态） | 全局变量、static 变量 | 程序启动时一次 | 整个程序运行期 |
| **Automatic**（自动） | 函数参数、局部变量 | 进入作用域时 | 离开作用域时销毁 |
| **Dynamic**（动态） | `new` 分配的对象 | 程序运行时显式请求 | 直到 `delete` 才销毁 |

### 6.2 为什么需要动态分配？

Static 和 automatic 分配都有两个共同限制：

1. 大小必须在**编译期已知**
2. 内存分配/释放都是**自动的**

> **例子**：你想存储用户输入的名字，但编译期不知道用户名字多长。
> ```cpp
> char name[25];  // 希望用户的名字不超过 25 个字符...
> ```

这种"猜测最大值"的方法问题很大：
1. 浪费内存
2. 不知道哪部分被实际用了
3. Stack 内存有限（Visual Studio 默认 1MB）
4. 可能溢出（如用户输入 600 条记录但只分配了 500）

### 6.3 Stack vs Heap

普通变量（包括 fixed arrays）存储在 **stack**，空间小但自动管理。
动态分配的内存来自 **heap（又叫 free store）**，大得多（可能几 GB），但需要程序员手动管理。

> 💡 **Key Insight**：
> - Stack 对象：分配/释放**自动**，不需要指针
> - Heap 对象：分配/释放**手动**，必须通过指针（内存地址）来引用对象

### 6.4 动态分配单个变量

```cpp
int* ptr { new int };       // 动态分配一个 int，ptr 存放它的地址
*ptr = 7;                    // 通过解引用修改它

int* ptr1 { new int(5) };    // 直接初始化
int* ptr2 { new int{ 6 } };  // 大括号初始化（推荐）
```

### 6.5 delete 释放内存

```cpp
delete ptr;       // 把内存归还给操作系统
ptr = nullptr;    // 让指针变成空指针，避免误用
```

> ⚠️ **重点澄清**：`delete` **不删除变量！** 它只是把**内存**归还给操作系统。指针变量本身仍然存在，作用域和普通变量一样。

### 6.6 Dangling Pointer（悬空指针）

**Dangling pointer（悬空指针）**：指向已释放内存的指针。解引用或再次 delete 悬空指针 → **未定义行为（UB）**！

```cpp
int* ptr { new int };
*ptr = 7;

delete ptr;          // ptr 现在是悬空指针
std::cout << *ptr;   // ❌ UB！访问已释放的内存
delete ptr;          // ❌ UB！再次释放同一块内存
```

> 💡 **习惯**：`delete` 之后立即 `ptr = nullptr`，这样即使误用也只是 null pointer 而不是悬空。

### 6.7 三种常见指针错误

| 错误类型 | 描述 | 后果 |
|---|---|---|
| **Uninitialized pointer** | 指针未初始化就使用 | Segmentation Violation (SIGSEGV)，俗称 "Seg Fault" |
| **Dangling pointer** | 指向已释放对象 | UB（很难调试） |
| **Memory leak** | 丢失了指针，内存永远无法释放 | 程序内存占用持续增长 |
| **Redundant delete** | 多次 delete 同一块内存 | UB |

> 💡 **Wisdom（PPT 强调）**：**把动态内存分配限制在类的实现中**（后面 `class Vector` 会展示）。

---

## 7. Dynamically Allocating Arrays（动态分配数组）

> 对应 LearnCpp 19.2 — Dynamically Allocating Arrays

### 7.1 new[] 与 delete[]

和 fixed array 不同，动态数组允许**运行时**指定长度：

```cpp
#include <cstddef>
#include <iostream>

int main()
{
    std::size_t length{};
    std::cin >> length;

    int* array { new int[length]{} };  // 用 array new，长度可以是变量
    array[0] = 5;

    delete[] array;  // 用 array delete 释放
    return 0;
}
```

> ⚠️ **关键规则**：**`new[]` 必须配对 `delete[]`；`new` 必须配对 `delete`。混用是 UB！**

### 7.2 Dynamic Array 和 Fixed Array 的关系

动态数组的生命周期从一个"指向第一个元素的指针"开始。**它功能上等同于 decay 后的 fixed array**——也不知道自己的长度。

区别：动态数组必须手动 `delete[]` 释放。

### 7.3 初始化动态数组

```cpp
int* arr1 { new int[length]{} };             // ✅ 全部初始化为 0
int* arr2 { new int[5]{ 9, 7, 5, 3, 1 } };   // ✅ C++11 起可用 initializer list
auto* arr3 { new int[5]{ 9, 7, 5, 3, 1 } };  // 用 auto 简化
```

> ⚠️ **注意语法**：`new int[5]{ ... }`，长度和 `{...}` 之间**没有 `=`**。

### 7.4 为什么能用 delete[] 释放未知长度？

`new[]` 会在内部记录分配的字节数，`delete[]` 就能知道要释放多少。但是**这个长度信息对程序员不可见**！

### 7.5 Resize（调整大小）

C++ **没有内建方式** resize 已分配的数组。只能：
1. 分配新数组
2. 复制元素过去
3. delete 旧数组

很容易出错，特别是元素是类对象时。

> 💡 **Best Practice**：要可变长数组就用 `std::vector`。

---

## 8. Pointers, References, and Arrays — Lecture Supplement

> 对应 PPT《Dynamic Allocation of Arrays》前几页（Klefstad 教授讲义）

### 8.1 Pointers vs References 对比

两者都包含某个对象的**地址**，都允许访问这个对象：

| 特性 | Reference（引用） | Pointer（指针） |
|---|---|---|
| 声明 | `int& j = i;` | `int* p = &i;` |
| 初始化 | **必须在构造时绑定** | 可以后续赋值 |
| 可否重新绑定 | ❌ 不能 | ✅ 可以 |
| 可否为空 | ❌ 不能为 null | ✅ 可以 `nullptr` |
| 语法 | 直接用 `j` | 解引用 `*p`，访问成员 `p->` |

```cpp
int i = 10;
int* p = &i;   // & 给出 i 的地址，p 是指针
int& j = i;    // j 是 i 的引用

i = 50;    // 直接改 i
*p = 60;   // 间接改 i（通过指针）
j = 70;    // 间接改 i（通过引用）
```

### 8.2 Arrays 和 Pointers 的关系

C++ 中，**数组名是一个常量指针，指向第一个元素**。

```cpp
int a[4];
int b[2];
int* p = a;           // 等价于 p = &a[0]
*p = 10;              // 等价于 a[0] = 10
p[0] = 20;            // 也是 a[0] = 20

p = b;                // 可以让 p 指向别的数组
p[1] = 70;
*(p+1) = 90;          // 指针算术：和 p[1] 等价
```

> 💡 **Key Insight**：`p[i]` 等价于 `*(p + i)`。这就是为什么 array 和 pointer 能互相替代。

### 8.3 字符数组 vs 字符指针

```cpp
char s1[] = "Hello";      // 这是一个数组，数据在 stack，可修改
char* s2 = "Hello";       // 这是指向字符串字面量的指针，数据在只读区！
char* s3 = s1;            // s3 指向 s1 的数据

s3[0] = 'M';   // ✅ 改 s1[0]，得到 "Mello"
s2[0] = 'M';   // ❌ Segmentation fault！字符串字面量不可改
```

> ⚠️ **常见错误**：`char* s = "Hello";` 在新版 C++ 会有警告（应该用 `const char*`），因为字符串字面量是只读的。

### 8.4 Fixed Arrays 的局限性

1. 大小必须在**编译期已知**
2. 分配后**不能 grow/shrink**
3. 实际用量可能变化

→ 这就是需要**动态分配数组**的原因。

> "With great power comes great responsibility." （能力越大，责任越大）—— 动态内存必须手动管理。

---

## 9. Introduction to the Copy Constructor（拷贝构造函数）

> 对应 LearnCpp 14.14 — Introduction to the Copy Constructor

### 9.1 什么是 Copy Constructor？

**Copy constructor（拷贝构造函数）** 是一种构造函数，用来**用一个已有对象来初始化另一个新对象**。执行完后，新对象是传入对象的拷贝。

```cpp
class Fraction
{
private:
    int m_numerator{ 0 };
    int m_denominator{ 1 };
public:
    Fraction(int numerator=0, int denominator=1)
        : m_numerator{numerator}, m_denominator{denominator} {}

    void print() const {
        std::cout << "Fraction(" << m_numerator << ", " << m_denominator << ")\n";
    }
};

int main()
{
    Fraction f { 5, 3 };   // 调用 Fraction(int, int)
    Fraction fCopy { f };  // 调用 copy constructor！
    f.print();
    fCopy.print();
}
/* 输出：
Fraction(5, 3)
Fraction(5, 3)
*/
```

### 9.2 Implicit Copy Constructor（隐式拷贝构造）

如果你**没写** copy constructor，编译器自动生成一个 **implicit copy constructor**。它做**memberwise initialization（逐成员初始化）**——每个成员都用传入对象对应的成员来初始化。

### 9.3 自己定义 Copy Constructor

```cpp
class Fraction
{
    ...
public:
    // Copy constructor
    Fraction(const Fraction& fraction)
        : m_numerator{ fraction.m_numerator }
        , m_denominator{ fraction.m_denominator }
    {
        std::cout << "Copy constructor called\n";
    }
};
```

> 💡 **Key Insight**：类的成员函数可以访问**同类其他对象的 private 成员**！访问控制是 per-class 的，不是 per-object 的。这就是为什么 `fraction.m_numerator` 能直接访问。

### 9.4 Copy Constructor 的两条核心规则

> 💡 **Best Practice 1**：Copy constructor **不应该有除拷贝之外的副作用**。因为编译器可能优化掉（copy elision），副作用可能不执行！

> 💡 **Best Practice 2**：**Copy constructor 的参数必须是引用**（最好是 `const` 左值引用）：
> ```cpp
> Fraction(const Fraction& f) { ... }  // ✅
> Fraction(Fraction f) { ... }          // ❌ 编译错误！
> ```
>
> **原因**：如果参数是值传递，调用 copy constructor 本身就要先拷贝参数 → 调用 copy constructor → 无限递归。

> 💡 **Best Practice 3**：**优先使用 implicit copy constructor**，除非有特殊需求（如包含指针时）。

### 9.5 Pass by Value 触发 Copy Constructor

当对象**按值传递**给函数时，参数通过 copy constructor 初始化：

```cpp
void printFraction(Fraction f) {  // 按值传递
    f.print();
}

int main() {
    Fraction f{ 5, 3 };
    printFraction(f);  // 这里调用 copy constructor 把 f 拷进参数
}
```

### 9.6 Return by Value 触发 Copy Constructor

函数按值返回对象时，**临时对象**通过 copy constructor 用返回值初始化：

```cpp
Fraction makeFrac() {
    Fraction local{3, 4};
    return local;  // copy constructor 创建临时对象（但可能被优化掉）
}
```

---

## 10. Class Initialization and Copy Elision

> 对应 LearnCpp 14.15 — Class Initialization and Copy Elision
> （注：按照老师要求，**本节不包含 copy elision 部分**；但为了完整性，这里做简要介绍）

### 10.1 六种初始化方式

C++ 基本类型有 6 种初始化方式，对类对象同样适用：

```cpp
int a;          // default initialization（未初始化）
int b = 5;      // copy initialization
int c( 6 );     // direct initialization

// List initialization（C++11）
int d { 7 };    // direct list initialization（推荐！）
int e = { 8 };  // copy list initialization
int f {};       // value initialization
```

### 10.2 对应的类初始化

```cpp
class Foo {
public:
    Foo() { std::cout << "Foo()\n"; }                          // 默认构造
    Foo(int x) { std::cout << "Foo(int) " << x << '\n'; }      // 普通构造
    Foo(const Foo&) { std::cout << "Foo(const Foo&)\n"; }      // 拷贝构造
};

int main() {
    // 调用默认构造
    Foo f1;          // default initialization
    Foo f2{};        // value initialization（推荐）

    // 调用 Foo(int) 普通构造
    Foo f3 = 3;      // copy initialization（仅 non-explicit 构造函数）
    Foo f4(4);       // direct initialization
    Foo f5{ 5 };     // direct list initialization（推荐！）
    Foo f6 = { 6 };  // copy list initialization

    // 调用 Foo(const Foo&) 拷贝构造
    Foo f7 = f3;     // copy initialization
    Foo f8(f3);      // direct initialization
    Foo f9{ f3 };    // direct list initialization（推荐！）
    Foo f10 = { f3 };// copy list initialization
}
```

### 10.3 三种初始化方式的本质区别

对于类类型，copy、direct、list 三种初始化**本质上做同一件事**——初始化对象。但有 3 个关键区别：

| 区别 | 说明 |
|---|---|
| **List initialization** | **禁止 narrowing conversion（窄化转换）** |
| **Copy initialization** | 仅考虑**非 explicit** 的构造函数/转换 |
| **List initialization** | 优先匹配 **list constructor**（`std::initializer_list`）|

> 💡 **Best Practice**：优先使用 **direct list initialization**（`Foo f{5};`），它防止了窄化转换。

### 10.4 Copy Elision（简介，不是 Week 4 重点）

> 以下内容**可能属于 Week 5**：copy elision

**Copy elision（拷贝消除）** 是编译器优化：在某些本该调用 copy constructor 的地方，**直接省略掉**这次拷贝。

```cpp
Something s { Something{ 5 } };  // 本该：先构造临时对象，再拷贝到 s
// 优化后：相当于 Something s{ 5 }，只调用一次普通构造
```

这就是为什么 copy constructor **不应该有副作用**——如果被优化掉，副作用就不执行了！

---

## 11. Shallow vs Deep Copying（浅拷贝 vs 深拷贝）

> 对应 LearnCpp 21.13 — Shallow vs. Deep Copying

### 11.1 Shallow Copy（浅拷贝）

编译器提供的默认 copy constructor 和 copy assignment 使用 **memberwise copy（逐成员拷贝）**，也叫 **shallow copy（浅拷贝）**。

**对简单类（无动态内存）来说，这工作得很好**：

```cpp
class Fraction {
    int m_numerator, m_denominator;
    // 编译器生成的默认版本大概长这样：
    Fraction(const Fraction& f)
        : m_numerator{ f.m_numerator }
        , m_denominator{ f.m_denominator } {}
};
```

### 11.2 Shallow Copy 对含指针的类是灾难！

**浅拷贝一个指针只是复制地址——没有分配新内存，也没有复制指向的内容！**

```cpp
class MyString {
    char* m_data{};
    int m_length{};
public:
    MyString(const char* source) {
        m_length = std::strlen(source) + 1;
        m_data = new char[m_length];
        for (int i = 0; i < m_length; ++i)
            m_data[i] = source[i];
    }
    ~MyString() { delete[] m_data; }
};
```

**因为没写 copy constructor，编译器提供了一个做浅拷贝的。看这段问题代码**：

```cpp
int main() {
    MyString hello{ "Hello, world!" };
    {
        MyString copy{ hello };  // 浅拷贝：copy.m_data 和 hello.m_data 指向同一块内存！
    }  // copy 析构，delete[] 了它们共享的内存
    // 现在 hello.m_data 是悬空指针！

    std::cout << hello.getString();  // ❌ UB！访问已释放内存
}
```

> 💡 **Key Insight**：对指针成员做浅拷贝**几乎总是在惹麻烦**：
> 1. 两个对象共享同一块内存 → 修改一个影响另一个
> 2. 一个析构时 delete 了共享内存 → 另一个变成悬空指针
> 3. 两个析构时会 double-delete → UB

### 11.3 Deep Copy（深拷贝）

**Deep copy（深拷贝）** 为新对象**分配独立内存**并**复制内容**，让两个对象在内存上完全独立。

```cpp
class MyString {
    ...
    void deepCopy(const MyString& source) {
        // 1. 释放当前持有的内存
        delete[] m_data;

        // 2. 非指针成员直接浅拷贝
        m_length = source.m_length;

        // 3. 指针成员：分配新内存 + 复制内容
        if (source.m_data) {
            m_data = new char[m_length];
            for (int i = 0; i < m_length; ++i)
                m_data[i] = source.m_data[i];
        } else {
            m_data = nullptr;
        }
    }

    // Copy constructor：不需要先删（因为是新对象）
    MyString(const MyString& source) { deepCopy(source); }

    // Copy assignment：需要检查自赋值
    MyString& operator=(const MyString& source) {
        if (this != &source) {  // self-assignment check
            deepCopy(source);
        }
        return *this;
    }
};
```

### 11.4 何时需要自定义 Copy Constructor / Assignment？

> 💡 **黄金规则**：**只要类包含指针（管理动态内存），就必须自定义这三个：**
> 1. **Copy constructor**
> 2. **Copy assignment operator**
> 3. **Destructor**
>
> 这叫 **Rule of Three（三之法则）**，详见第 14 节。

### 11.5 更好的选择

写自己的 copy/assignment 容易出错。**模板类（`std::string`、`std::vector`）已经帮你处理好了**——优先使用它们！

---

## 12. Overloading the Assignment Operator（重载赋值运算符）

> 对应 LearnCpp 21.12 — Overloading the Assignment Operator

### 12.1 Copy Constructor vs Copy Assignment 的区别

| 维度 | Copy Constructor | Copy Assignment |
|---|---|---|
| 目的 | 用已有对象**初始化新对象** | 把一个对象**赋值给已存在的对象** |
| 何时调用 | 对象诞生时（包括 pass/return by value）| 已存在对象之间赋值 `a = b` |
| 语法 | `T(const T&)` | `T& operator=(const T&)` |

> 💡 **记忆**：
> - 如果对象**必须先被创建**才能拷贝 → 用 **copy constructor**
> - 如果对象**已经存在** → 用 **copy assignment**

```cpp
Fraction f1 { 5, 3 };    // 普通构造
Fraction f2 { f1 };       // copy constructor（f2 是新对象）
Fraction f3;              // 默认构造
f3 = f1;                  // copy assignment（f3 已存在）
```

### 12.2 基本结构

**赋值运算符必须是成员函数！** 不能是非成员函数。

```cpp
class Fraction {
public:
    // 重载 operator=
    Fraction& operator=(const Fraction& fraction) {
        m_numerator = fraction.m_numerator;
        m_denominator = fraction.m_denominator;
        return *this;  // 返回 *this 支持链式赋值
    }
};
```

### 12.3 为什么返回 `*this`？

为了支持**链式赋值**：

```cpp
Fraction f1{5, 3}, f2{7, 2}, f3{9, 5};
f1 = f2 = f3;  // 等价于 f1 = (f2 = f3)
//          └─ 这个表达式需要一个 Fraction 值（或引用），所以要返回 *this
```

### 12.4 Self-Assignment（自赋值）问题

C++ 允许自赋值：
```cpp
Fraction f1{5, 3};
f1 = f1;  // 合法，但在某些 operator= 实现下会出问题
```

**对于简单类，自赋值最多浪费时间**。但**对动态内存类，自赋值可能是灾难！**

```cpp
// 危险版本（未处理自赋值）
MyString& operator=(const MyString& str) {
    if (m_data) delete[] m_data;   // ⚠️ 如果 str 就是 *this，这里把共享内存删了！
    m_length = str.m_length;
    m_data = new char[str.m_length];
    std::copy_n(str.m_data, m_length, m_data);  // 从已删除的 str.m_data 复制 → 垃圾
    return *this;
}

int main() {
    MyString alex{ "Alex", 5 };
    alex = alex;  // 垃圾输出！
}
```

### 12.5 Self-Assignment Guard（自赋值检查）

```cpp
MyString& operator=(const MyString& str) {
    // Self-assignment check
    if (this == &str)
        return *this;

    if (m_data) delete[] m_data;
    m_length = str.m_length;
    m_data = new char[str.m_length];
    std::copy_n(str.m_data, m_length, m_data);
    return *this;
}
```

> 💡 **Key Insight**：用 `this == &str` **比较地址**（不是 `*this == str` 比较值），因为：
> 1. 地址比较快（比 `operator==` 便宜）
> 2. 不要求类已经定义了 `operator==`

### 12.6 什么时候不需要 self-assignment check？

1. **Copy constructor 不需要**：新对象刚创建，不可能自己等于自己（除了 `someClass c{c}` 这种诡异写法，编译器会警告未初始化）
2. **简单类（无动态内存）不需要**：自赋值最多浪费几个 CPU 周期

---

## 13. Move Constructors and Move Assignment（移动构造与移动赋值）

> 对应 LearnCpp 22.3 — Move Constructors and Move Assignment

### 13.1 Copy 的问题：效率低

看这段代码（用了深拷贝）：

```cpp
Auto_ptr3<Resource> generateResource() {
    Auto_ptr3<Resource> res{ new Resource };
    return res;  // 调用 copy constructor！
}

int main() {
    Auto_ptr3<Resource> mainres;
    mainres = generateResource();  // 调用 copy assignment！
}
```

**输出可能是（6 次资源操作）**：
```
Resource acquired     // res 构造
Resource acquired     // 临时对象 copy 构造（深拷贝）
Resource destroyed    // res 析构
Resource acquired     // mainres copy assignment（深拷贝）
Resource destroyed    // 临时对象析构
Resource destroyed    // mainres 析构
```

**问题**：`res` 马上就要死了，我们却辛辛苦苦把它的资源**深拷贝**给临时对象，然后销毁 `res`。**为什么不直接把资源"偷"过来呢？**

### 13.2 Move 语义：偷资源！

C++11 引入 **move constructor** 和 **move assignment operator**，它们的目的是**把资源所有权从一个对象转移到另一个对象**，而不是复制。

关键区别：**参数是非 const 的 rvalue reference（`&&`）**，而不是 `const T&`。

```cpp
template<typename T>
class Auto_ptr4 {
    T* m_ptr {};
public:
    // Move constructor
    Auto_ptr4(Auto_ptr4&& a) noexcept
        : m_ptr{ a.m_ptr }
    {
        a.m_ptr = nullptr;  // ⭐ 关键：把源对象的指针清空
    }

    // Move assignment
    Auto_ptr4& operator=(Auto_ptr4&& a) noexcept {
        if (&a == this)
            return *this;

        delete m_ptr;         // 先释放自己的资源
        m_ptr = a.m_ptr;      // 接管 a 的资源
        a.m_ptr = nullptr;    // ⭐ 清空 a
        return *this;
    }
    // ...
};
```

### 13.3 有了 Move 后的输出

同样的 `generateResource() → mainres = ...`，现在输出：

```
Resource acquired
Resource destroyed
```

**只用了一次资源分配！** 大幅提升效率。

### 13.4 为什么源对象的指针要设为 nullptr？

```cpp
a.m_ptr = nullptr;  // 很重要！
```

**原因**：被移动对象（moved-from object）**仍然会被析构**。如果不把 `a.m_ptr` 清空，析构时会 delete 我们刚偷来的内存，造成 **redundant delete 错误**！

> ⚠️ **PPT 中的警告**：
> ```
> Q) What happens if my move leaves s.buf pointing at array?
> A) 源对象析构时会 delete 同一块内存，造成 redundant delete → UB！
> ```

### 13.5 && 是什么：Rvalue Reference

**`&&` 叫做 rvalue reference（右值引用）**。它只能绑定到 rvalue（即将销毁的临时对象）。

| 特性 | Lvalue Reference `T&` | Rvalue Reference `T&&` |
|---|---|---|
| 可以绑定到 lvalue（有名字的对象） | ✅ | ❌ |
| 可以绑定到 rvalue（临时对象） | ❌（除非 const）| ✅ |
| 用途 | 修改已有对象、避免复制 | 表示"对方马上要死了，可以抢它资源" |

### 13.6 Move 构造函数何时被调用？

Move 函数**仅在**以下情况被调用：
1. Move 函数**已被定义**
2. **参数是 rvalue**（临时对象、`std::move()` 的结果）

如果没有 move 函数，编译器回退到 copy 函数。

### 13.7 noexcept 关键字

Move 函数应该标记为 **`noexcept`**，告诉编译器这些函数不会抛异常。这对 `std::vector` 等容器很重要——只有 `noexcept` 的 move 才会被它们使用。

### 13.8 Construction vs Assignment 的区别（PPT 问题）

**PPT 的问题**：「Construction 和 Assignment 有什么区别？」

| 构造（Construction） | 赋值（Assignment） |
|---|---|
| 对象刚诞生，**没有已有资源需要释放** | 对象已经存在，**可能持有旧资源需要先释放** |
| 直接接管源对象的资源 | 先 delete 自己的旧资源，再接管 |
| 不需要 self-check（新对象不可能 == 自己） | 需要 self-check 避免误删 |

### 13.9 Rule of Five（五之法则，简介）

有了 move 后，Rule of Three 扩展为 **Rule of Five**：

1. Destructor
2. Copy constructor
3. Copy assignment
4. **Move constructor**（新）
5. **Move assignment**（新）

如果类管理资源，这 5 个通常都要自己写（或显式 `= default` / `= delete`）。

---

## 14. The Rule of Three（三之法则）— Lecture Supplement

> 对应 PPT《Dynamic Allocation of Arrays》

### 14.1 规则陈述

> **RULE OF THREE**：如果你的类包含任何指针（管理动态内存），你必须自己写三件事：
> 1. **Destructor**（析构函数）
> 2. **Copy Constructor**（拷贝构造）
> 3. **Copy Assignment**（拷贝赋值）

**原因**：编译器提供的默认版本是**浅拷贝**，对指针成员会产生：
- 共享内存
- Double delete
- Dangling pointer

### 14.2 Vector 类示例（PPT）

```cpp
class Vector {
    int maxLen;
    int* buf;

public:
    // 1) 普通构造
    Vector(int newLen)
        : maxLen{ newLen }, buf{ new int[newLen] } {}

    // 2) Destructor
    ~Vector() {
        delete[] buf;
    }

    // 3) Copy constructor（深拷贝）
    Vector(const Vector& v)
        : maxLen( v.maxLen ), buf( new int[v.maxLen] )
    {
        for (int i = 0; i < v.maxLen; ++i)
            buf[i] = v.buf[i];
    }

    // 4) Copy assignment
    Vector& operator=(const Vector& v) {
        if (this != &v) {       // self-assignment check
            maxLen = v.maxLen;
            delete[] buf;
            buf = new int[v.maxLen];
            for (int i = 0; i < maxLen; ++i)
                buf[i] = v.buf[i];
        }
        return *this;           // 支持链式赋值
    }
};
```

### 14.3 默认版本会出什么问题？

**PPT 问题**：「如果我用默认 copy constructor 或 operator=() 会怎样？」

```cpp
String::~String() { delete[] buf; }

// 情况 A：用默认版本
String::String(String& s) = default;                   // 浅拷贝
String& String::operator=(String& s) = default;        // 浅拷贝
// → 两个 String 共享 buf → 一个析构时另一个悬空，还会 double delete

// 情况 B：什么都不做
String::String(String& s) {}                    // buf 未初始化（垃圾）
String& String::operator=(String& s) { return *this; }  // 完全不拷贝
// → 新对象的 buf 是垃圾，析构时 delete 垃圾地址 → 崩溃
```

### 14.4 operator== 的 const & 版本

```cpp
class Vector {
    int maxLen;
    int* buf;
public:
    bool operator==(const Vector& v) {
        if (maxLen != v.maxLen)    // 先比较长度（便宜）
            return false;
        for (int i = 0; i < maxLen; ++i)
            if (buf[i] != v.buf[i])
                return false;
        return true;
    }
};
```

> 💡 **Key Insight**：比较操作用 `const &` 参数（只读 + 高效）。

---

## 15. Class Vector / IntList — Lecture Supplement

> 对应 PPT《Dynamic Allocation of Arrays》完整 `IntList` 示例

### 15.1 IntList 的结构

`IntList` 是模仿 `std::vector` 的灵活整数列表：

```cpp
#define DEFAULT_SIZE 10

class IntList {
private:
    int maxLen;   // 容量（physical size，最多能装多少）
    int curLen;   // 逻辑长度（logical size，当前实际装了多少）
    int* buf;     // 指向动态数组的指针
    // ...
};
```

> 💡 **Physical size vs Logical size**：这是 HW4 `String` 类的核心设计——buffer 分配是一回事，实际存了多少字符是另一回事。

### 15.2 Helper Methods

```cpp
bool in_bounds(int i) { return i >= 0 && i < curLen; }

// 静态工具：从一块内存复制 n 个元素到另一块
static void copy(int* to, int* from, int n) {
    for (int i = 0; i < n; ++i)
        to[i] = from[i];
}

// 核心操作：扩容
void increaseArrayTo(int newSize) {
    int* oldBuf = buf;
    buf = new int[newSize];       // 1. 分配新的更大数组
    copy(buf, oldBuf, curLen);    // 2. 复制元素过去
    maxLen = newSize;             // 3. 更新容量
    // curLen 不变
    delete[] oldBuf;              // 4. 释放旧数组
}
```

### 15.3 构造函数 + append

```cpp
IntList(int newLen = DEFAULT_SIZE)
    : maxLen( newLen ), curLen( 0 ), buf( new int[newLen] )
{
    assert(newLen > 0);  // #include <cassert>
}

void append(int value) {
    if (curLen == maxLen)
        increaseArrayTo(maxLen + DEFAULT_SIZE);  // 满了就扩容
    buf[curLen++] = value;
}
```

### 15.4 操作符重载

```cpp
// 下标（返回引用，可以做左值）
int& operator[](int index) {
    assert(in_bounds(index));
    return buf[index];
}

// 赋值（含扩容）
IntList& operator=(const IntList& l) {
    if (maxLen < l.curLen)
        increaseArrayTo(l.curLen);
    copy(buf, l.buf, l.curLen);
    curLen = l.curLen;
    return *this;
}

// 相等
bool operator==(const IntList& l) {
    if (curLen != l.curLen) return false;
    for (int i = 0; i < curLen; ++i)
        if (buf[i] != l.buf[i]) return false;
    return true;
}

// 不等，复用相等
bool operator!=(const IntList& l) {
    return !operator==(l);
}
```

### 15.5 remove 的巧妙实现

```cpp
int indexOf(int value) {
    for (int i = 0; i < curLen; ++i)
        if (buf[i] == value) return i;
    return -1;
}

void remove(int value) {
    int i = indexOf(value);
    if (i != -1)
        buf[i] = buf[--curLen];  // ⭐ 把最后一个元素移到这里，长度减 1
}
```

> 💡 **技巧**：不需要 shift 后面所有元素，直接用最后一个覆盖就行（但元素顺序会变）。

### 15.6 Move 版本

```cpp
// Move constructor（无 const，因为要修改源对象）
IntList(IntList&& l)
    : maxLen( l.maxLen ), curLen( l.curLen ), buf( l.buf )
{
    l.buf = nullptr;  // ⭐ 非常重要，避免 redundant delete
}

// Move assignment
IntList& operator=(IntList&& l) {
    delete[] buf;              // 释放自己的旧资源
    curLen = l.curLen;
    maxLen = l.maxLen;
    buf = l.buf;
    l.buf = nullptr;           // ⭐ 再次强调，清空源对象指针
    return *this;
}
```

### 15.7 HW4 提示

> 💡 **Lecture 提到 HW4 的几个关键点**：
> 1. **`strdup()` helper**：一次性分配 + 复制，避免重复调用 `new[]` 和 `strcpy()`
> 2. **Private helper constructor `String(int length)`**：只分配指定大小的数组，内容不初始化。用于 `reverse()` 和 `operator+()` 避免多次分配
> 3. **`String::swap`**：交换 `this->buf` 和参数的 `buf`，用于 move 操作。可以用 `<utility>` 的 `std::swap`
> 4. **不要在 `reverse()` 里用 VLA**：`char temp[buf_len + 1]` 在 C++ 里不合法
> 5. **`read()` 不要用 `in >> buf`**：因为 `buf` 的物理大小有限，容易溢出

---

## 16. Week 4 速查表与易错点总结

### 16.1 Constants 速查

| 场景 | 用什么 |
|---|---|
| 初始化值是**字面量**或**常量表达式** | `constexpr` |
| 初始化值**运行时才知道**（如 `cin >> x`） | `const` |
| **整型数组长度**（编译期需要） | `constexpr int size = 10;` |
| **std::string、std::vector 等动态内存类型** | `const`（不能 `constexpr`） |

### 16.2 Pointers vs References 对比

| 特性 | Pointer `T*` | Reference `T&` | Rvalue Ref `T&&` |
|---|---|---|---|
| 可为空 | ✅ | ❌ | ❌ |
| 可重新绑定 | ✅ | ❌ | ❌ |
| 语法 | `*p`, `p->` | 直接用 | 直接用 |
| 绑定对象 | 任何 | Lvalue | Rvalue |
| 典型用途 | 动态内存、可选参数 | 修改参数、避免复制 | Move 语义 |

### 16.3 new/delete 四种组合

| 操作 | 分配 | 释放 |
|---|---|---|
| 单个对象 | `new T` / `new T(x)` | `delete p;` |
| 数组 | `new T[n]` / `new T[n]{}` | `delete[] p;` |

> ⚠️ **混用是 UB**！`new` 配 `delete`，`new[]` 配 `delete[]`。

### 16.4 Rule of Three / Five

| 法则 | 需要写的函数 |
|---|---|
| **Rule of Three**（C++98）| 析构、拷贝构造、拷贝赋值 |
| **Rule of Five**（C++11）| 上述三个 + 移动构造、移动赋值 |
| **Rule of Zero** | 用 `std::string`、`std::vector` 等自动管理资源的类，啥也不用写 |

### 16.5 Copy vs Move 对比

| 特性 | Copy（拷贝） | Move（移动） |
|---|---|---|
| 参数类型 | `const T&` | `T&&`（非 const） |
| 何时调用 | lvalue 传参、返回值（未优化） | rvalue 传参、`std::move` |
| 做什么 | 深复制资源 | 偷资源（shallow 复制 + 清空源） |
| 源对象状态 | 不变 | 被清空（但仍需析构） |
| 成本 | O(n) 复制数据 | O(1) 指针操作 |

### 16.6 Python vs C++ 对比（Week 4 新增）

| Python | C++ | 备注 |
|---|---|---|
| `x if cond else y` | `cond ? x : y` | 三元运算符，参数顺序不同 |
| `list.append(x)` | 自己实现扩容逻辑（或用 `std::vector::push_back`） | C 数组不会自动 grow |
| 垃圾回收 | 手动 `new`/`delete` 或用 RAII | C++ 没有 GC |
| `==` 比较值 | 需要重载 `operator==` | 默认比较指针/地址 |
| `copy.deepcopy()` | 自己实现 deep copy constructor | 需 Rule of Three |
| `list[-1]` | **不支持负索引**！越界是 UB | 必须 `arr[len-1]` |
| 对象赋值 = 改引用 | `a = b` 调用 copy assignment（除非用指针）| 语义本质不同 |

### 16.7 Klefstad 教授的关键警句（PPT）

| 语录 | 意义 |
|---|---|
| "I just want to get it to work" → 错误心态 | 应该先写干净，再写对 |
| "I'll clean it up later" → 错误心态 | Later 常常是 never |
| Functions > 5 lines → refactor it | 保持函数短小 |
| Test each piece | 增量测试 |
| "Wisdom: restrict dynamic allocation to class implementations" | 把 `new`/`delete` 藏到类内部 |
| "With great power comes great responsibility" | 动态内存能力强但需要自律 |

### 16.8 Week 4 易错点清单

> ⚠️ **这些在 quiz 上可能会丢分：**

1. **`new[]` 配 `delete`**（应该是 `delete[]`）
2. **Copy constructor 参数用值传递**（必须是引用，否则无限递归）
3. **Copy constructor/assignment 忘了 const**（无法用 const 对象初始化）
4. **Copy assignment 忘了检查 self-assignment**，直接 `delete` 自己的数据
5. **Move constructor 忘了把源指针清空**（导致 double delete）
6. **对 `char*` 字符串字面量修改**（`char* s = "Hello"; s[0] = 'M';` 是 UB）
7. **返回指向局部变量的指针**（dangling pointer）
8. **动态数组没 `delete[]`**（memory leak）
9. **忘了 `operator=` 返回 `*this`**（链式赋值失效）
10. **`constexpr` 用于函数参数**（不允许）
11. **`float f{4.1};`**（4.1 是 double，会产生警告；应该用 `4.1f`）
12. **条件运算符在复合表达式里没加括号**（优先级陷阱）

### 16.9 Week 4 最重要的五条记忆

1. **Rule of Three**：含指针的类必须自定义 destructor + copy constructor + copy assignment，默认浅拷贝会造成 double delete、dangling pointer
2. **`new[]` / `delete[]` 必须配对**：混用 `new` 和 `delete[]`（或反之）是 UB
3. **Copy constructor 参数必须是 `const T&`**：值传递会无限递归
4. **Move 语义的核心是"偷资源"**：`a.m_ptr = nullptr` 是关键，否则源对象析构时会 redundant delete
5. **`constexpr` 要求编译期可求值**：函数参数不能是 `constexpr`；动态内存类型（如 `std::string`）不兼容 `constexpr`，用 `const`
