# Information and Computer Science 45C — Week 4 整合 Reading 笔记

## 目录

- [1. 字面量（Literals）](#1-字面量literals)
- [2. 常量表达式与编译期编程](#2-常量表达式与编译期编程)
- [3. Constexpr 变量](#3-constexpr-变量)
- [4. 魔法数字（Magic Numbers）](#4-魔法数字magic-numbers)
- [5. 条件运算符](#5-条件运算符)
- [6. C 风格字符串符号常量](#6-c-风格字符串符号常量)
- [7. 指针、引用与动态内存基础](#7-指针引用与动态内存基础)
- [8. 用 new 和 delete 进行动态内存分配](#8-用-new-和-delete-进行动态内存分配)
- [9. 动态分配数组](#9-动态分配数组)
- [10. 浅拷贝 vs. 深拷贝](#10-浅拷贝-vs-深拷贝)
- [11. 拷贝构造函数](#11-拷贝构造函数)
- [12. 重载拷贝赋值运算符](#12-重载拷贝赋值运算符)
- [13. 三/五法则](#13-三五法则)
- [14. 移动构造函数与移动赋值](#14-移动构造函数与移动赋值)
- [15. 类的初始化形式](#15-类的初始化形式)
- [16. 拷贝省略（Copy Elision，简介）](#16-拷贝省略copy-elision简介)
- [17. 扩展案例：IntList（融会贯通）](#17-扩展案例intlist融会贯通)
- [18. Week 4 速查与核心要点](#18-week-4-速查与核心要点)

> UCI ICS 45C: Programming in C++ (35770)
> 本笔记整合了 Week 4 Assigned Reading（LearnCpp 5.2、5.4/5.5、5.6、6.6、17.11、19.1、19.2、14.14、14.15、21.12、21.13、22.3 章节）与课堂 PPT（Dyn_Array.pptx 及相关 PPT）。主题按概念而非来源组织 —— 同一主题下 Reading 内容与 PPT 内容融合呈现。

---

## 1. 字面量（Literals）

> 对应 LearnCpp 5.2 — Literals

### 1.1 什么是字面量？

**字面量（literal）** 是直接写在代码中的值。字面量有时也叫 **字面常量（literal constants）**，因为它们的含义无法被重新定义 —— `5` 永远表示整数值 5。

```cpp
return 5;                     // 5 是整数字面量
bool myNameIsAlex { true };   // true 是布尔字面量
double d { 3.4 };             // 3.4 是 double 字面量
std::cout << "Hello, world!"; // "Hello, world!" 是 C 风格字符串字面量
```

### 1.2 字面量的默认类型

每个字面量都有一个从它的值推导出来的类型。

| 字面量 | 例子 | 默认类型 | 备注 |
|---|---|---|---|
| 整数 | `5`, `0`, `-3` | `int` | |
| 布尔 | `true`, `false` | `bool` | |
| 浮点数 | `1.2`, `0.0`, `3.4` | **`double`**（不是 `float`！） | |
| 字符 | `'a'`, `'\n'` | `char` | 单引号 |
| C 风格字符串 | `"Hello, world!"` | `const char[14]` | 双引号；包含空终止符 |

> ⚠️ **常见陷阱**：浮点字面量默认是 `double`，不是 `float`。这就是经典的 `float f { 4.1 };` 警告的来源 —— 见 §1.6。

### 1.3 字面量后缀

如果默认类型不是你想要的，可以通过加后缀改变字面量的类型：

| 数据类型 | 后缀 | 含义 |
|---|---|---|
| 整型 | `u` 或 `U` | `unsigned int` |
| 整型 | `l` 或 `L` | `long` |
| 整型 | `ul`、`uL`、`Ul`、`UL`、`lu`、`lU`、`Lu`、`LU` | `unsigned long` |
| 整型 | `ll` 或 `LL` | `long long` |
| 整型 | `ull`、`uLL`、`Ull`、`ULL`、`llu`、`llU`、`LLu`、`LLU` | `unsigned long long` |
| 整型 | `z` 或 `Z` | 有符号 `std::size_t`（C++23） |
| 整型 | `uz`、`uZ`、`Uz`、`UZ`、`zu`、`zU`、`Zu`、`ZU` | `std::size_t`（C++23） |
| 浮点 | `f` 或 `F` | `float` |
| 浮点 | `l` 或 `L` | `long double` |
| 字符串 | `s` | `std::string` |
| 字符串 | `sv` | `std::string_view` |

**大多数情况下不需要后缀（除了 `f`）。**

### 1.4 后缀大小写规则

大多数后缀 **不区分大小写**，但有两个例外：

- **`s` 和 `sv` 必须小写**
- **连续两个 `l` 或 `L` 的大小写必须一致**（`lL` 和 `Ll` 都不合法；`ll` 和 `LL` 都可以）

> 💡 **最佳实践**：优先用大写的 `L` 而不是小写的 `l`。
> 某些字体下小写 `l` 和数字 `1` 看起来一模一样。`5L` 一眼就看懂；`5l` 可能被误读成 `51`。

### 1.5 整型字面量（通常不需要后缀）

```cpp
std::cout << 5  << '\n';  // 5（无后缀）是 int
std::cout << 5L << '\n';  // 5L 是 long
std::cout << 5u << '\n';  // 5u 是 unsigned int
```

即使初始化非 `int` 类型，不带后缀的 `int` 字面量通常也能用：

```cpp
int a { 5 };          // 类型匹配
unsigned int b { 6 }; // 编译器把 int 6 转成 unsigned int 6
long c { 7 };         // 编译器把 int 7 转成 long 7
```

编译器会把 `int` 字面量转换成目标类型。因为这些都是 **扩展（widening）** 转换，不会丢失数据。

### 1.6 浮点字面量（`f` 后缀很重要！）

默认情况下，浮点字面量是 `double`。要让它是 `float`，用 `f`（或 `F`）后缀：

```cpp
std::cout << 5.0  << '\n';  // 5.0（无后缀）是 double
std::cout << 5.0f << '\n';  // 5.0f 是 float
```

**经典新手陷阱**：

```cpp
float f { 4.1 };  // ⚠️ 警告：4.1 是 double 字面量，不是 float
```

**为什么会警告？** 编译器判断字面量的类型时 **不看它怎么被使用**。`4.1` 没有后缀，所以是 `double`。`double` → `float` 可能损失精度，因此警告。

**两种修复方式**：

```cpp
float f { 4.1f };   // ✅ 用 'f' 后缀让字面量是 float
double d { 4.1 };   // ✅ 或者把变量改成 double 去匹配
```

### 1.7 浮点数的科学记数法

两种写浮点字面量的方式：

**标准记法**（小数点）：
```cpp
double pi { 3.14159 };  // 标准记法
double d { -1.23 };     // 可以是负数
double why { 0. };      // 语法合法但要避免 —— 点太难看清（建议写 0.0）
```

**科学记数法**（带 `e`）：
```cpp
double avogadro { 6.02e23 };       // 6.02 × 10^23
double protonCharge { 1.6e-19 };   // 1.6 × 10^-19（允许负指数）
```

### 1.8 字符串字面量：两个不太明显的事实

字符串字面量放在 **双引号** 中（对比 `char` 字面量用单引号）。它们被称为 **C 风格字符串**，因为这是从 C 继承来的。

出于历史原因，字符串 **不是** C++ 的基础类型 —— 它的类型很奇怪、很复杂、很难用。

**事实 #1：所有 C 风格字符串字面量都隐式带一个空终止符（null terminator）。**

`"hello"` 看起来有 5 个字符，实际上有 6 个：`'h'`、`'e'`、`'l'`、`'l'`、`'o'` 和 `'\0'`（ASCII 码 0）。末尾这个 `'\0'` 叫 **空终止符**，以它结尾的字符串称为 **空终止字符串**。

所以 `"Hello, world!"` 的类型是 `const char[14]` 而不是 `const char[13]` —— 空终止符也算一个字符。

> 💡 **为什么要有空终止符？** 历史原因；它让 `strlen` 这样的函数能通过扫描到 `'\0'` 来判断字符串结束位置。

**事实 #2：C 风格字符串字面量是在整个程序运行期间存在的 const 对象。**

> 💡 **核心洞察**：C 风格字符串字面量是在程序启动时创建的 const 对象，保证在整个程序运行期间都存在。

不像其他大多数字面量（是值而不是对象），C 风格字符串字面量是有真实地址的真实对象。所以你可以放心地从函数返回字符串字面量：

```cpp
const char* getGreeting() {
    return "Hello";  // ✅ 安全 —— "Hello" 在整个程序期间都存在
}
```

> ⚠️ **对比**：带 `s` / `sv` 后缀的 `std::string` 和 `std::string_view` 字面量产生 **临时对象**，它们会在所在完整表达式结束时被销毁。必须立即使用。

---

## 2. 常量表达式与编译期编程

> 对应 LearnCpp 5.4/5.5 — Constant Expressions
> （注意：课程阅读列出的是 LearnCpp 5.4，当前站点把它拆成了 5.4 "as-if 规则" 和 5.5 "常量表达式"。这里两部分都覆盖。）

### 2.1 编译期 vs. 运行时

C++ 中的表达式在以下两种时机之一被求值：

| 阶段 | 何时 | 由谁完成 |
|---|---|---|
| **编译期（Compile-time）** | 你编译程序时 | 编译器 |
| **运行时（Runtime）** | 程序实际运行时 | 编译好的可执行文件 |

有些表达式 **必须** 在运行时求值：
```cpp
std::cin >> x;         // 需要用户输入 —— 只有运行时才知道
std::cout << 5 << '\n'; // 需要终端存在 —— 只有运行时才存在
```

### 2.2 as-if 规则（出自 5.4）

在 **as-if 规则** 下，编译器可以自由地优化：只要可观察行为不变，就可以把工作从运行时转移到编译期：

```cpp
const double x { 1.2 };
const double y { 3.4 };
const double z { x + y };  // x + y 可能在运行时，也可能在编译期计算
```

因为 `x` 和 `y` 在编译期就已知，编译器可以在编译时算出 `4.6` 并直接使用。

### 2.3 as-if 规则的问题

虽然好用，但 as-if 规则有几个问题：

- 我们无法 **强制** 编译期求值 —— 完全取决于编译器的聪明程度
- 不同编译器 / 平台 / 编译选项可能给出不同结果
- **静默失败**：本想在编译期运行的代码，如果不符合条件（拼错、理解错），可能悄悄退化到运行时，而我们无从知晓
- 编译器不会反馈它到底做了什么选择

**编译期编程** = 显式地使用 C++ 特性，**保证** 在编译期求值。

### 2.4 编译期编程的好处

Reading 中列出了 **五大好处**：

| 好处 | 说明 |
|---|---|
| **性能** | 编译期求值 → 更小、更快的程序 |
| **通用性** | 只有编译期值能用在要求编译期值的地方（数组大小、模板参数等） |
| **可预测性** | 代码如果无法在编译期运行，编译器会报错（不会静默回退） |
| **质量 —— 错误检测** | 很多错误能在编译期被发现，而不是运行时 |
| **质量 —— 编译期不容许 UB** | 如果编译期求值会触发未定义行为，编译器会中止编译。UB **不允许** 在编译期出现 |

### 2.5 编译期编程的关键 C++ 特性

这些特性最终都依赖 **常量表达式**：

- **Constexpr 变量**（§3）
- **Constexpr 函数**（§3.7 简介）
- **模板**（未来章节）
- **`static_assert`**（未来章节）

### 2.6 常量表达式的定义

C++ 标准几乎不提"编译期"，而是定义了 **常量表达式**：

> 💡 **核心洞察**：**常量表达式** 是由字面量、常量变量、运算符和函数调用构成的非空序列，**其中每一部分都必须能在编译期求值**。

不是常量表达式的表达式叫 **非常量表达式**，或者非正式地叫 **运行时表达式**。

### 2.7 什么可以出现在常量表达式中？

最常见的：

- **字面量**（如 `5`、`1.2`）
- **所有操作数都是常量表达式的大多数运算符**（如 `3 + 4`、`2 * sizeof(int)`）
- **以常量表达式初始化的 const 整型变量** —— 历史遗留。现代 C++ 更推荐 `constexpr`
- **Constexpr 变量**
- **参数都是常量表达式的 constexpr 函数调用**

### 2.8 什么不能出现在常量表达式中？

> ⚠️ **这是常见的小测 / 考试陷阱**：

- **非 const 变量**（值随时可能变）
- **const 非整型变量** —— 即使初始化器是常量表达式！（例如 `const double d { 1.2 };` **不能** 用在常量表达式中 —— 要用它就改成 `constexpr`）
- **非 constexpr 函数的返回值** —— 即使返回表达式是常量表达式（例如 `int five() { return 5; }` —— `five()` 依然是运行时表达式）
- **函数参数** —— 即使是 constexpr 函数的参数
- **操作数不是常量表达式的运算符**（例如 `std::cout << 5` —— `std::cout` 不是常量表达式）
- **`new`、`delete`、`throw`、`typeid`、`operator,` 运算符**（逗号）

### 2.9 典型例子（出自 Reading）

**常量表达式**：
```cpp
5;                  // 常量表达式（字面量）
1.2;                // 常量表达式（字面量）
"Hello world!";     // 常量表达式（字面量）
5 + 6;              // 常量表达式（两个操作数都是字面量）
1.2 * 3.4;          // 常量表达式
8 - 5.6;            // 常量表达式（即便操作数类型不同！）
sizeof(int) + 1;    // 常量表达式（sizeof 在编译期就已知）
```

**运行时表达式**：
```cpp
getNumber();        // 运行时（函数内部有用户输入）
five();             // 运行时（非 constexpr 函数；虽然返回的是常量，但调用本身不是）
std::cout << 5;     // 运行时（std::cout 不是常量表达式）
```

**变量**：
```cpp
const int a { 5 };         // ✅ 可用于常量表达式（const int + const-expr 初始化器）
const int b { a };         // ✅ a 是常量表达式
const long c { a + 2 };    // ✅ a + 2 是常量表达式

int d { 5 };               // ❌ 非 const
const int e { d };         // ❌ 初始化器非 const
const double f { 1.2 };    // ❌ const 但不是整型！
```

### 2.10 术语小结

同一件事有两种说法：

- **"X 可用于常量表达式"** —— 强调 X
- **"X 是一个常量表达式"** —— 强调包含 X 的表达式

两者含义相同。

### 2.11 常量表达式并不 **总是** 在编译期求值（反直觉！）

> 💡 **核心洞察**：编译器 **只在需要常量表达式的上下文** 中必须在编译期求值。其他情况下可以求、也可以不求。

```cpp
const int x { 3 + 4 };  // 3 + 4 必须在编译期求值（x 可用于常量表达式）
int y { 3 + 4 };        // 3 + 4 可能在编译期，也可能在运行时求值（y 不能用于常量表达式）
```

**编译期求值概率的四个等级**：

| 概率 | 条件 |
|---|---|
| **绝不** | 非常量表达式，且编译器无法确定所有值 |
| **可能** | 非常量表达式，但编译器能确定所有值（as-if 下可被优化） |
| **大概率** | 常量表达式，用在不要求常量表达式的上下文中 |
| **总是** | 常量表达式，用在要求常量表达式的上下文中 |

"必须在编译期求值"的术语是 **明显常量求值表达式（manifestly constant-evaluated expression）**。

### 2.12 为什么编译期表达式必须是常量？

想象一下另一种方案 —— 跟踪每个变量当前是否编译期已知：

```cpp
int x { 5 };       // x 对编译器已知
std::cin >> x;     // x 不再已知！
```

如果允许在编译期表达式中使用非 const 变量，编译器就必须在每个程序点跟踪哪些值已知。多加一行 `std::cin >> x;` 就可能隐式破坏别处的编译期表达式。

**解决办法**：要求常量表达式中使用的变量都是 `const`（或 `constexpr`）。值永远不变 —— 简单、可靠。

### 2.13 测验要点（出自 Reading）

```cpp
char a { 'q' };              // 'q' 是 const-expr；a 不是（非 const）
const int b { 0 };           // 0 是 const-expr；b 是（const int + const-expr 初始化）
const double c { 5.0 };      // 5.0 是 const-expr；c 不是（const 但不是整型）
const int d { a * 2 };       // a 不是 const-expr → a*2 不是 → d 不是
int e { c + 1.0 };           // c 不是 const-expr → e 不是
const int f { d * 2 };       // d 不是 const-expr → f 不是（即便 f 是 const int）
const int g { getNumber() }; // 函数调用不是 const-expr → g 不是
const int h{};               // 值初始化为 0；h 是 const-expr
```

> ⚠️ **陷阱**：很多人在 (c) 中会错认为 `c` 是常量表达式，因为它是 `const` 且被字面量初始化。**它不是** —— `double` 不是整型，所以那条历史"const 整型"例外不适用。要用的话写成 `constexpr double c { 5.0 };`。

---

## 3. Constexpr 变量

> 对应 LearnCpp 5.5/5.6 — Constexpr Variables

### 3.1 用 `const` 做编译期常量的问题

用 `const` 来创建编译期常量有三个问题：

1. **歧义** —— 你不容易分辨一个 `const` 变量是否能用于常量表达式：
   ```cpp
   int a { 5 };        // 显然不能
   const int b { a };  // 显然不能（初始化器不是 const-expr）
   const int c { 5 };  // 显然可以
   
   const int d { someVar };     // 🤔 取决于 someVar 的定义
   const int e { getValue() };  // 🤔 取决于 getValue() 的定义
   ```
   你得递归地检查每个初始化器。

2. **无法强制要求** —— 你无法告诉编译器"这个 **必须** 能用在常量表达式中，否则报错"。`const` 会默默退化成运行时常量。

3. **只限整型** —— "const 可用于常量表达式"这条规则只适用于整型。`const double` 不够格。

### 3.2 `constexpr` 关键字

`constexpr`（"constant expression" 的缩写）解决了这三个问题。

> 💡 **核心洞察**：**constexpr 变量永远是编译期常量**。它必须用常量表达式初始化，否则 **编译报错**。

```cpp
int five() { return 5; }  // 非 constexpr 函数

int main()
{
    constexpr double gravity { 9.8 };  // ✅ 9.8 是常量表达式
    constexpr int sum { 4 + 5 };       // ✅ 4 + 5 是常量表达式
    constexpr int something { sum };   // ✅ sum 是常量表达式

    std::cin >> age;
    constexpr int myAge { age };  // ❌ 编译错误：age 不是常量表达式
    constexpr int f { five() };   // ❌ 编译错误：five() 的返回值不是 constexpr
}
```

**关键：`constexpr` 对非整型类型也管用**：
```cpp
constexpr double d { 1.2 };  // ✅ d 能用于常量表达式！
// 对比：const double d { 1.2 };  // ❌ 不能用于常量表达式
```

### 3.3 变量的 `const` vs. `constexpr`

| | `const` | `constexpr` |
|---|---|---|
| 初始化后能改？ | ❌ 不能 | ❌ 不能 |
| 初始化器必须是 const-expr？ | 否 | **是** |
| 可用于常量表达式？ | 仅 const 整型 + const-expr 初始化 | **总是** |
| 求值时机 | 运行时（也可能编译期） | 编译期或运行时 |

Constexpr 变量 **隐式是 const**。Const 变量 **不是** 隐式 constexpr（除了那条整型例外）。写成 `const constexpr` 是冗余。

> 💡 **有趣的细节**：和 `const` 不同，`constexpr` **不是类型的一部分**。`constexpr int x` 实际的类型是 `const int`。

### 3.4 最佳实践

> 💡 **最佳实践**：
> - 任何初始化器是常量表达式的 const 变量 → 用 `constexpr`
> - 初始化器不是常量表达式（运行时常量）的 const 变量 → 用 `const`

### 3.5 注意：不兼容 `constexpr` 的类型

有些类型 **不能** 用 `constexpr`：
- `std::string`
- `std::vector`
- 任何使用动态内存分配的类型

这些要么用 `const`，要么换一个 constexpr 友好的替代：
- 用 `std::string_view` 代替 `std::string`
- 用 `std::array` 代替 `std::vector`

### 3.6 `const`/`constexpr` 函数参数

正常函数调用在运行时执行，所以参数在运行时初始化。这带来两个结果：

1. **`const` 函数参数是运行时常量** —— 即使传入的实参是编译期值。
2. **函数参数不能是 `constexpr`** —— 它的初始值要到运行时才确定。

```cpp
void foo(const int x) { ... }       // ✅ OK，x 是运行时常量
void bar(constexpr int x) { ... }   // ❌ 不允许
```

### 3.7 Constexpr 函数简介

**constexpr 函数** 可以在常量表达式中调用。`constexpr` 关键字放在返回类型前：

```cpp
int max(int x, int y) { return (x > y) ? x : y; }          // 普通函数
constexpr int cmax(int x, int y) { return (x > y) ? x : y; } // constexpr 函数

int m1 { max(5, 6) };            // ✅ ok
const int m2 { max(5, 6) };      // ✅ ok
constexpr int m3 { max(5, 6) };  // ❌ 错误：max(5, 6) 不是常量表达式

int m4 { cmax(5, 6) };           // ✅ 可能在编译期或运行时求值
const int m5 { cmax(5, 6) };     // ✅ 可能在编译期或运行时求值
constexpr int m6 { cmax(5, 6) }; // ✅ 必须在编译期求值
```

**关键规则**：如果 constexpr 函数所在的常量表达式必须在编译期求值，那么它也必须在编译期求值。否则二者皆可。

要有资格在编译期执行，**所有参数都必须是常量表达式**。

constexpr 函数会在后面（LearnCpp F.1）深入讲。

### 3.8 术语小结

| 术语 | 定义 |
|---|---|
| **编译期常量** | 其值必须在编译期已知的值或不可修改对象（如字面量、constexpr 变量） |
| **Constexpr** | 声明对象为编译期常量（以及函数有资格在编译期求值）的关键字 |
| **常量表达式** | 只包含编译期常量和支持编译期求值的运算符/函数的表达式 |
| **运行时表达式** | 不是常量表达式的表达式 |
| **运行时常量** | 不是编译期常量的值或不可修改对象 |

---

## 4. 魔法数字（Magic Numbers）

> 对应 LearnCpp 5.2 的 "Magic numbers" 小节

### 4.1 什么是魔法数字？

**魔法数字** 是一个字面量（通常是数字），要么 **含义不清**，要么 **以后可能需要修改**。

```cpp
const int maxStudentsPerSchool{ numClassrooms * 30 };  // 30 是啥？
setMax(30);                                             // 这里的 30 又是啥？
```

你可能 **猜** 第一个 `30` 是每班学生数。第二个 `30` —— 谁知道呢？

### 4.2 为什么魔法数字糟糕

**问题 1：缺少上下文** —— 读者只能猜。

**问题 2：重构噩梦** —— 假设学校买了新桌椅，班级规模变成 35：

- `maxStudentsPerSchool` 里的 `30` 要改。
- `setMax(30)` 里的 `30` 呢？同样的含义吗？不一样？你得 **检查整个代码库中每处字面量 `30`**，逐一决定。
- 全局查找替换很危险（可能改到无关的 `30`）。

### 4.3 修复：使用符号常量

```cpp
const int maxStudentsPerClass { 30 };
const int totalStudents{ numClassrooms * maxStudentsPerClass };  // 一目了然！

const int maxNameLength{ 30 };
setMax(maxNameLength);  // 显然是另一种上下文
```

好处：
- **名字给出上下文** —— 不用再猜
- **单点修改** —— 重构变得简单又安全

### 4.4 魔法数字不一定是数字

字符串、应用名等也可能是魔法的：
```cpp
printAppWelcome("MyCalculator");  // ❌ 差：名字可能别处也有，或以后会改
```

### 4.5 什么时候字面量不是魔法？

不是每个字面量都需要名字！有些在上下文中一目了然：

**显而易见的字面量**（`-1`、`0`、`0.0`、`1`）：
```cpp
int idGenerator { 0 };          // ✅ 明显：从 0 开始
idGenerator = idGenerator + 1;  // ✅ 明显：自增
```

**显而易见的换算因子**（函数名清楚表达）：
```cpp
int kmToM(int km) {
    return km * 1000;  // ✅ 明显：km → m
}
```

**顺序 ID**：
```cpp
printPlayerInfo(1);   // ✅ 只是玩家编号
printPlayerInfo(2);
```

### 4.6 最佳实践

> 💡 **最佳实践**：避免在代码中使用魔法数字。用 `constexpr` 变量代替（见 §3）。

```cpp
constexpr int maxStudentsPerClass { 30 };  // 比 const 更好
```

---

## 5. 条件运算符

> 对应 LearnCpp 6.6 — The Conditional Operator

### 5.1 语法和含义

| 运算符 | 符号 | 形式 | 含义 |
|---|---|---|---|
| 条件 | `?:` | `c ? x : y` | 如果 `c` 为 `true`，求 `x`；否则求 `y` |

**条件运算符** `?:`（也叫 **算术 if** 或 **三元运算符**）是 C++ 里唯一的三元运算符（3 个操作数）。它是某些 if-else 语句的简写。

```cpp
// 长写法
if (x > y)
    max = x;
else
    max = y;

// 条件运算符
max = ((x > y) ? x : y);
```

和 `if-else` 不同，**`:` 和 `expression2` 不是可选的** —— 条件运算符总是两个分支都要有。

### 5.2 输入输出示例

```cpp
int x { getValue() };
int y { getValue() };
int max { (x > y) ? x : y };
std::cout << "The max of " << x << " and " << y << " is " << max << ".\n";
```

输入 `5` 和 `7`：`(5 > 7) ? 5 : 7` → `false ? 5 : 7` → `7`。输出：`The max of 5 and 7 is 7.`

### 5.3 条件运算符是一个表达式

因为它是 **表达式**（不是语句），所以可以用在任何允许表达式的地方 —— 包括 `if-else` **不能** 用的地方。

**例子：初始化一个 constexpr 变量**：
```cpp
constexpr bool inBigClassroom { false };
constexpr int classSize { inBigClassroom ? 30 : 20 };  // ✅ 这里只有条件运算符能用
```

**为什么不能用 `if-else`？**

```cpp
if (inBigClassroom)
    constexpr int classSize { 30 };    // classSize 作用域在 if 块内，'}' 时销毁
else
    constexpr int classSize { 20 };    // 同样 —— 作用域在 else 块内
std::cout << classSize;                 // ❌ 编译错误：classSize 未定义
```

`if`/`else` 块内声明的变量在 `}` 处消失。唯一用 `if-else` 的方法是包装成函数，那比直接用 `?:` 多很多代码。

### 5.4 给条件运算符加括号（关键！）

> ⚠️ **严重陷阱**：大多数运算符的 **优先级高于** `?:`。不加括号的话，表达式不会按预期求值。

**例 1：算术优先级**
```cpp
int x { 2 };
int y { 1 };
int z { 10 - x > y ? x : y };
// 你可能期望：10 - (x > y ? x : y)  → 8
// 实际上：   ((10 - x) > y) ? x : y  → 2
std::cout << z;  // 输出 2
```

**例 2：`<<` 的优先级高于 `?:`**
```cpp
int x { 2 };
std::cout << (x < 0) ? "negative" : "non-negative";
// 你可能期望："non-negative"
// 实际输出：  0
```

**发生了什么？**
1. `x < 0` → `false`
2. `std::cout << false` 先被计算（`<<` 比 `?:` 绑得紧），输出 `0` 并返回 `std::cout`
3. 表达式变成 `std::cout ? "negative" : "non-negative"`
4. `std::cout` 转成 `bool`（它有这个转换），大概返回 `false`
5. `false ? "negative" : "non-negative"` → `"non-negative"`
6. 结果是一个孤零零的字符串字面量 —— 无副作用

> 💡 **最佳实践**：
> - 用在复合表达式中时，**给整个条件运算（包括操作数）加括号**
> - 为了可读性，如果条件中有运算符（除了函数调用 `()`），考虑给条件也加括号
> - 操作数本身不需要括号

**正确加括号的示例**：
```cpp
return isStunned ? 0 : movesLeft;              // ✅ 非复合，条件里没运算符
int z { (x > y) ? x : y };                     // ✅ 非复合，但条件有 > → 加括号更清晰
std::cout << (isAfternoon() ? "PM" : "AM");    // ✅ 复合 → 整个运算加括号
std::cout << ((x > y) ? x : y);                // ✅ 复合 + 条件有运算符 → 都加
```

### 5.5 操作数类型必须匹配或可转换

为符合 C++ 的类型检查，以下之一必须成立：
- 第二、第三个操作数类型 **匹配**，或
- 编译器能把一个或两个 **转换** 成匹配类型

```cpp
std::cout << (true  ? 1 : 2) << '\n';    // ✅ 都是 int
std::cout << (false ? 1 : 2.2) << '\n';  // ✅ int 1 → double 1.0
std::cout << (true  ? -1 : 2u) << '\n';  // ⚠️ 意外！-1 → unsigned int，输出 4294967295
```

> ⚠️ **陷阱**：在条件运算符中混用有符号 / 无符号会触发意想不到的转换规则。**避免**。

**没有共同类型时编译错误**：
```cpp
constexpr int x{ 5 };
std::cout << ((x != 5) ? x : "x is 5");  // ❌ int vs C 风格字符串 → 没有共同类型
```

显式转换修复：
```cpp
std::cout << ((x != 5) ? std::to_string(x) : std::string{"x is 5"}) << '\n';
```

### 5.6 何时使用条件运算符

**适合的场景**：
- 用两个值之一初始化对象
- 把两个值之一赋给对象
- 把两个值之一传给函数
- 从函数返回两个值之一
- 打印两个值之一

**不适合**：
- 复杂表达式（难读、易错）

> 💡 **最佳实践**：避免在复杂表达式中使用条件运算符。

---

## 6. C 风格字符串符号常量

> 对应 LearnCpp 17.11 — C-style String Symbolic Constants

### 6.1 两种创建 C 风格字符串常量的方式

C++ 支持 **两种不同的** 方式创建 C 风格字符串符号常量：

```cpp
const char name[] { "Alex" };          // 方式 1：const C 风格数组
const char* const color{ "Orange" };   // 方式 2：指向字符串字面量的 const 指针

std::cout << name << ' ' << color << '\n';
// 输出：Alex Orange
```

两者输出相同，但 C++ 对它们的 **内存分配方式不同**。

### 6.2 内存布局差异

**方式 1：`const char name[] { "Alex" }`**
- `"Alex"` 被放在（大概率只读的）内存某处
- 程序另外分配 **一个长度为 5 的 C 风格数组**（4 个字符 + 空终止符）
- 通过把 `"Alex"` 复制进去来初始化这个数组
- 结果：`"Alex"` 有 **两份拷贝** —— 一份在全局内存，一份归 `name` 所有
- 因为 `name` 是 const 永远不会变，复制一份是浪费

**方式 2：`const char* const color{ "Orange" }`**
- 实现自定，但 **通常**：
  - 编译器把 `"Orange"` 放在只读内存
  - 用这块内存的 **地址** 初始化指针
- 结果：`"Orange"` 只有 **一份拷贝**

### 6.3 字符串字面量合并

因为字符串字面量是常量，编译器可以通过合并相同字面量来节省内存：

```cpp
const char* name1 { "Alex" };
const char* name2 { "Alex" };
// 两个指针可能指向只读内存中的同一地址
```

### 6.4 C 风格字符串的类型推导

```cpp
auto  s1{ "Alex" };   // 类型推导为 const char*
auto* s2{ "Alex" };   // 类型推导为 const char*
auto& s3{ "Alex" };   // 类型推导为 const char(&)[5]
```

不加 `auto&` 的话，你会丢失数组信息，只拿到指针。

### 6.5 输出指针和 C 风格字符串（关键！）

> ⚠️ **大坑**：`std::cout` 对 `char*`/`const char*` 的处理和其他指针类型不同！

```cpp
int narr[]{ 9, 7, 5, 3, 1 };
char carr[]{ "Hello!" };
const char* ptr{ "Alex" };

std::cout << narr << '\n';  // narr 退化为 int* → 打印地址（如 003AF738）
std::cout << carr << '\n';  // carr 退化为 char* → 按字符串打印（"Hello!"）
std::cout << ptr  << '\n';  // 本就是 char* → 按字符串打印（"Alex"）
```

**为什么？** 输出流假定：如果你传 `char*`/`const char*`，你想打印一个 **字符串**，而不是地址。其他指针类型就打印地址。

### 6.6 令人惊悚的副作用

```cpp
char c{ 'Q' };
std::cout << &c;  // ❌ 灾难！
```

发生了什么：
- `&c` 的类型是 `char*`
- `std::cout` 以为是 C 风格字符串
- 从 `c` 开始打印……但 `c` 没有空终止符！
- 读过 `c` 后继续读内存里的垃圾，直到碰到一个恰好是 0 的字节
- 输出类似 `Q╠╠╠╠╜╡4;¿■A` —— **未定义行为**

**修复：要地址时转成 `const void*`**：
```cpp
const char* ptr{ "Alex" };
std::cout << ptr << '\n';                            // 按字符串打印
std::cout << static_cast<const void*>(ptr) << '\n';  // 按地址打印
```

### 6.7 最佳实践

> 💡 **最佳实践**：避免 C 风格字符串符号常量，改用 `constexpr std::string_view`。

`std::string_view` 一样快（往往更快），行为更一致。

#### 三种字符串类型对比

| | C-string | `std::string_view` | `std::string` |
|---|---|---|---|
| **持有数据？** | 数组持有 / 指针借用 | 只借用，不持有 | 完整持有 |
| **知道长度？** | 不知道（每次要数到 `'\0'`） | 知道（存了 size） | 知道 |
| **`cout <<` 行为** | 特殊（打印内容） | 打印内容 | 打印内容 |
| **`s.size()`** | 不行，要 `strlen(s)` | ✅ `s.size()` O(1) | ✅ `s.size()` O(1) |
| **切片** | 手动指针算术 | ✅ `s.substr(...)` | ✅ `s.substr(...)` |
| **比较** | `strcmp(a, b) == 0` | ✅ `a == b` | ✅ `a == b` |
| **有无坑** | 一堆（decay、`'\0'`、`cout` 特殊对待） | 基本没坑 | 基本没坑 |

> 📌 **怎么选**：
> - **常量字符串字面量** → `constexpr std::string_view`
> - **函数参数（只读）** → `std::string_view`（兼容 C-string、`std::string` 两种实参，零拷贝）
> - **需要持有/拼接/修改字符串** → `std::string`
> - **C-string** 只在不得不与 C API 交互时用（`std::string::c_str()` 可以拿到）

---

## 7. 指针、引用与动态内存基础

> 对应 PPT Dyn_Array.pptx 第 2-4 页（指针 / 引用 / 数组概览）

### 7.1 指针 vs. 引用

两者都持有某个对象的 **地址**，用于访问它：

| 特性 | 引用 `T&` | 指针 `T*` |
|---|---|---|
| 声明 | `int& j = i;` | `int* p = &i;` |
| 声明时必须初始化？ | ✅ 是 | ❌ 否（但应当） |
| 可以重新绑定到别的对象？ | ❌ 不行 | ✅ 可以 |
| 可以为空？ | ❌ 不行 | ✅ 可以（`nullptr`） |
| 访问值的语法 | 直接：`j` | 解引用：`*p` 或 `p->` |

```cpp
int i = 10;
int* p = &i;   // & 取 i 的地址；p 是持有该地址的指针
int& j = i;    // j 是 i 的别名（引用）

i = 50;        // 直接改 i
*p = 60;       // 通过指针间接改 i
j = 70;        // 通过引用间接改 i
```

### 7.2 数组和指针

> 💡 **核心洞察**：在 C++ 中，数组名是 **指向其首元素的常量指针**。

```cpp
int a[4];
int b[2];
int* p = a;   // 或者等价地：p = &a[0]
*p = 10;      // 让 a[0] = 10
p[0] = 20;    // 也让 a[0] = 20

p = b;        // 指针可以重赋值 —— 但数组名不行！
p[1] = 70;
*(p + 1) = 90;   // 指针算术：等价于 p[1]
```

**下标等价**：`p[i]` 只是 `*(p + i)` 的简写。

### 7.3 字符数组 vs. 字符指针（关键区分！）

```cpp
char s1[] = "Hello";     // s1 是数组；"Hello" 被复制进 s1 的内存（栈/数据段）
char* s2 = "Hello";      // s2 是指向只读字符串字面量的指针！
char* s3 = s1;           // s3 指向 s1（同一块可写内存）

s3[0] = 'M';   // ✅ 修改 s1 → s1 变成 "Mello"
s2[0] = 'M';   // ❌ 段错误 —— 字符串字面量是只读的
```

> ⚠️ **陷阱**：现代 C++ 中 `char* s = "Hello";` 会发出警告。应该写 `const char* s = "Hello";`，以反映字符串字面量是只读的。

### 7.4 定长数组的局限

这些局限促使我们使用 **动态分配**（下一节）：

1. 大小必须在 **编译期** 已知
2. 分配之后 **不能增长或缩减**
3. 实际使用量可能小于分配量 → 浪费
4. 猜测最大大小容易出错

> 💡 **Klefstad 的口号**："With great power comes great responsibility"（能力越大责任越大）—— 动态分配带来灵活性，但需要手动管理。

---

## 8. 用 `new` 和 `delete` 进行动态内存分配

> 对应 LearnCpp 19.1 + PPT Dyn_Array.pptx 第 5-7 页

### 8.1 三种内存分配

C++ 支持三种基本分配方式：

| 类型 | 用于 | 生命周期 | 手动管理？ |
|---|---|---|---|
| **静态（Static）** | 静态变量和全局变量 | 整个程序 | 否（自动） |
| **自动（Automatic）** | 函数参数、局部变量 | 所在块 | 否（自动） |
| **动态（Dynamic）** | 堆上分配的对象 | 直到 `delete` | **是**（手动） |

静态和自动都要求：
- 大小必须在 **编译期** 已知
- 内存管理自动

### 8.2 为什么需要动态分配

**"猜测最大值"方法** 很糟：
```cpp
char name[25];             // 但愿名字装得下 25 个字符！
Record record[500];        // 但愿记录少于 500 条！
Monster monster[40];       // 最多 40 个怪物
Polygon rendering[30000];  // 但愿这个 3D 场景多边形少于 30000！
```

**四大问题**：
1. **内存浪费**（实际使用量小于最大值时）
2. **追踪有效条目** —— `monster[24]` 是活着的、死了的，还是未初始化的？
3. **栈限制** —— 栈通常 ~1MB（Visual Studio 默认）。这么大的定长数组会导致 **栈溢出** 终止程序
4. **人为上限** —— 分配了 500 但来了 600 条记录就是灾难：要么出错，要么截断，要么溢出（UB）

### 8.3 栈 vs. 堆

程序运行时，进程内存大致被分成几块区域。我们最关心的两块是 **栈（stack）** 和 **堆（heap）**：

```
高地址  ┌──────────────────┐
        │      栈 stack    │  ← 向下生长（函数调用就压栈）
        │        ↓         │
        │                  │
        │        ↑         │
        │     堆 heap      │  ← 向上生长（new 在这里分配）
        ├──────────────────┤
        │  全局 / 静态区    │
        ├──────────────────┤
        │   代码段（只读）  │
低地址  └──────────────────┘
```

#### 栈（Stack）是什么？

- **后进先出（LIFO）的内存区**，由 CPU 直接管理（`SP` 寄存器追踪栈顶）。
- 每次 **函数调用** 都会压入一个 **栈帧（stack frame）**，包含：函数参数、局部变量、返回地址。
- 函数 **return** 时，整个栈帧一次性弹出 —— 局部变量自动销毁。
- **大小有限**（典型 ~1 MB；Linux 默认 8 MB），超过就 **栈溢出（stack overflow）**。

```cpp
void foo() {
    int x = 10;          // x 在 foo 的栈帧里
    int arr[1000];       // arr 也在栈上
}                        // foo 返回，栈帧弹出，x 和 arr 都没了
```

#### 堆（Heap，也叫 free store）是什么？

- **自由分配的大块内存**，由 **运行时库**（不是 CPU）通过 `malloc` / `new` 管理。
- 你 **主动申请**（`new`）一块内存，得到指向它的 **指针**；不用了 **主动归还**（`delete`）。
- **生命周期与作用域无关** —— 函数返回后，堆对象依旧存活，只要还有指针指着它。
- **大小可达数 GB**（受物理内存 + 虚拟内存限制）。

```cpp
int* p = new int{ 10 };  // 在堆上分配一个 int，p 是指向它的指针
// ... 用 *p ...
delete p;                // 用完手动释放
```

#### 详细对比

| | 栈（Stack） | 堆（Heap） |
|---|---|---|
| **谁管理** | 编译器 + CPU 自动 | 程序员手动 (`new` / `delete`) |
| **分配速度** | 极快（移动 SP 即可） | 慢（要找空闲块、可能加锁） |
| **访问速度** | 快（直接已知偏移） | 慢（要先解引用指针拿地址） |
| **大小** | 小（~1–8 MB） | 大（GB 级） |
| **生命周期** | 进入作用域开始，离开作用域结束 | `new` 开始，`delete` 结束（与作用域无关） |
| **大小要求** | **编译期已知**（数组大小要常量） | 运行期决定 |
| **内存碎片** | 无（连续压栈/弹栈） | 有（频繁 new/delete 后产生空洞） |
| **错误形式** | 栈溢出（递归太深、局部数组太大） | 内存泄漏、悬垂指针、double free |
| **典型用法** | 局部变量、函数参数 | 大对象、长生命周期对象、运行期才知道大小的对象 |

#### 什么时候用哪个？

| 场景 | 选择 |
|---|---|
| 小的局部变量、临时计算 | 栈 |
| 编译期就知道大小的小数组 | 栈 |
| 大数组 / 大对象（避免栈溢出） | 堆 |
| 大小要等到运行时才能确定 | 堆 |
| 需要在函数返回后依然存活的对象 | 堆 |
| 数据结构节点（链表、树、图） | 堆 |

> 💡 **核心洞察**：
> - **栈**：分配 / 释放 **自动**，但寿命被作用域绑死，空间小。
> - **堆**：分配 / 释放 **手动**，寿命你说了算，空间大 —— 代价是必须用 **指针** 指代每个堆对象，且必须 **自己负责** 释放。

> ⚠️ **C++ 的语境**：本笔记后续讲到的 "栈对象" 通常指 **自动存储期（automatic storage）** 的变量；"堆对象" 指 **动态存储期（dynamic storage）** 的对象（`new` 出来的）。这是 C++ 标准用的术语，"栈/堆" 是更口语的说法。

### 8.4 用 `new` 分配单个变量

```cpp
int* ptr{ new int };   // 动态分配一个 int；ptr 存其地址
*ptr = 7;              // 解引用赋值

int* ptr1{ new int (5) };    // 直接初始化
int* ptr2{ new int { 6 } };  // 统一 / 花括号初始化（推荐）
```

**性能提示**：访问堆对象 **比栈对象慢** —— 堆访问需要两步（从指针取地址，再从地址取值），而栈访问直接到已知地址。

### 8.5 用 `delete` 释放

```cpp
delete ptr;       // 把内存归还给 OS
ptr = nullptr;    // 把指针置空（最佳实践！）
```

> ⚠️ **`delete` 不"删除"变量！**
> - 它把 **内存** 归还给 OS
> - 指针变量 `ptr` 依然存在，作用域不变
> - 你依然可以用 `ptr` —— 但这会解引用已释放的内存（UB！）

**规则**：只 delete 由 `new` 分配过的指针。delete 非动态指针 = 出大问题。

### 8.6 悬垂指针

> ⚠️ **定义**：**悬垂指针（dangling pointer）** 指向已释放的内存。对悬垂指针解引用或 delete → **未定义行为**。

```cpp
int* ptr{ new int };
*ptr = 7;

delete ptr;          // ptr 现在悬垂
std::cout << *ptr;   // ❌ UB：访问已释放的内存
delete ptr;          // ❌ UB：重复 delete
```

**多个指针导致多个悬垂指针**：
```cpp
int* ptr{ new int{} };
int* otherPtr{ ptr };   // 两者指向同一块内存

delete ptr;
ptr = nullptr;          // ptr 为空 —— 安全

// 但 otherPtr 依然悬垂！💀
```

> 💡 **最佳实践**：
> - 尽量避免多个指针指向同一块动态内存
> - 如无可避免，明确哪个指针"拥有"内存（负责 delete）
> - **把 delete 后的指针设为 `nullptr`**，除非它马上就出作用域

### 8.7 `new` 可能失败（罕见但重要）

极少数情况下，OS 可能没有内存可用。默认情况下，`new` 会抛 `bad_alloc` 异常。未处理则程序崩溃。

**替代方案**：`new (std::nothrow)` 返回 `nullptr` 而不是抛异常：
```cpp
int* value { new (std::nothrow) int };   // 分配失败时为 nullptr

int* value { new (std::nothrow) int{} };
if (!value) {  // 一定要检查！
    std::cerr << "Could not allocate memory\n";
    // 处理错误
}
```

> ⚠️ **容易忘** —— 因为分配失败罕见，人们常常跳过检查。

### 8.8 空指针与动态分配

空指针意味着"这里还没分配内存" —— 适合条件分配：
```cpp
if (!ptr)                  // 如果还没分配
    ptr = new int;
```

> 💡 **最佳实践**：**delete 空指针是安全的，什么也不做**。不需要条件判断。

```cpp
// 别这样：
if (ptr)
    delete ptr;

// 直接：
delete ptr;   // ptr 为空时什么也不会发生
```

### 8.9 内存泄漏

**动态内存在 `delete` 或程序结束之前一直占着。** 但持有这些地址的 **指针** 遵循普通作用域规则。

**经典内存泄漏**：
```cpp
void doSomething() {
    int* ptr{ new int{} };
    // 没有 delete！ptr 出作用域时，地址就 丢失了
    // int 还在堆里，但我们再也找不到它
}
```

**其他泄漏方式**：
```cpp
// 未 delete 就重新赋值：
int value = 5;
int* ptr{ new int{} };
ptr = &value;          // 原地址丢失 → 泄漏

// 两次分配：
int* ptr{ new int{} };
ptr = new int{};       // 第一次分配丢失 → 泄漏
```

**修复**：重新赋值前先 delete。

内存泄漏在程序运行中不断吞噬空闲内存。严重的泄漏可能耗尽所有内存，拖慢甚至搞崩整台机器。只有程序终止时 OS 才会回收泄漏的内存。

### 8.10 四种常见指针错误（PPT 总结）

PPT 把它们归为"指针使用的注意事项（Pointer Caveats）"：

| 错误 | 描述 | 后果 |
|---|---|---|
| **未初始化指针** | `int* p; *p = 0;` | **段错误**（SIGSEGV，"seg fault"） |
| **悬垂引用** | 指向已死对象的指针 | UB，极难调试 |
| **内存泄漏** | 指针丢失，内存从不释放 | 内存占用越来越大 |
| **重复 delete** | `delete ptr; delete ptr;` | UB |

> 💡 **Klefstad 的智慧（PPT）**："**把动态分配限制在类实现内部。**"
>
> 不要让 `new`/`delete` 散落在代码里。把它们藏在类的构造函数和析构函数中（RAII —— Resource Acquisition Is Initialization）。这正是 `std::vector`、`std::string` 等所做的。

---

## 9. 动态分配数组

> 对应 LearnCpp 19.2 + PPT Dyn_Array.pptx 第 5-10 页

### 9.1 `new[]` 和 `delete[]`

和定长数组（编译期定大小）不同，动态分配数组可以在 **运行时** 选择长度：

```cpp
#include <cstddef>
#include <iostream>

int main() {
    std::size_t length{};
    std::cin >> length;

    int* array { new int[length]{} };  // 数组 new；length 可以不是常量！
    array[0] = 5;

    delete[] array;  // 数组 delete
    return 0;
}
```

**要点**：
- `new int[length]` 返回指向首元素的指针 —— 即便 `length` 不是 constexpr 也行
- 加 `{}` 零初始化：`new int[length]{}`
- **`delete[]`**（不是 `delete`）释放数组内存
- 长度类型用 `std::size_t`

### 9.2 关键规则：`new` 要和 `delete` 匹配！

> ⚠️ **最常见的新手错误之一**：
>
> 对数组用 `delete` 而不是 `delete[]` → **未定义行为**（数据损坏、泄漏、崩溃）。

| 分配 | 释放 |
|---|---|
| `new T` | `delete ptr;` |
| `new T[n]` | `delete[] ptr;` |

混用就是 UB。必须匹配。

**`delete[]` 怎么知道要 delete 多少？** `new[]` 会偷偷记录分配的大小。但 **程序员访问不到这个信息**。

### 9.3 动态数组 ≈ 退化的定长数组

一个动态分配的数组：
- 一出生就是 **指向首元素的指针**
- 和退化的定长数组有 **同样的局限**（不知道自己的长度，没有 `sizeof()`）
- **区别**：必须自己调用 `delete[]`

### 9.4 初始化动态数组

```cpp
int* arr1 { new int[length]{} };             // ✅ 全零初始化
int* arr2 { new int[5]{ 9, 7, 5, 3, 1 } };   // ✅ C++11 初始化列表
auto* arr3 { new int[5]{ 9, 7, 5, 3, 1 } };  // ✅ 用 auto 避免重复类型名
```

> 💡 注意：`new int[5]{ ... }` 中大小 `[5]` 和初始化器 `{...}` 之间 **没有 `=`**。

### 9.5 动态数组不能 resize

C++ 没有 **内置的** resize 已分配动态数组的方式。你得：
1. 分配新（更大）数组
2. 复制元素过去
3. delete 旧数组

这 **容易出错**，对类类型的元素尤其如此（它们有特殊的构造 / 析构规则）。

> 💡 **最佳实践**：需要可变长数组时，用 `std::vector`（它自动处理这些）。

### 9.6 测验要点

Reading 的测验让你写一个程序排序用户输入的名字。关键技巧：

```cpp
// 分配 std::string 数组
auto* names{ new std::string[length]{} };

// 读入名字（用 getline 处理空格）
std::getline(std::cin >> std::ws, names[i]);

// 按指针范围排序
std::sort(names, names + length);

// 必须用 delete[]
delete[] names;
```

### 9.7 PPT 示例：动态 `IntList` 类

PPT 完整讲解了一个包装动态数组的 `IntList` 类。完整整合版见 §17。

---

## 10. 浅拷贝 vs. 深拷贝

> 对应 LearnCpp 21.13

### 10.1 浅拷贝（默认）

编译器生成的（隐式）拷贝构造函数和赋值运算符执行 **按成员拷贝**，也叫 **浅拷贝（shallow copy）**。

对简单类（没有动态内存），这完全没问题：

```cpp
class Fraction {
    int m_numerator { 0 };
    int m_denominator { 1 };
    // 隐式拷贝：直接拷贝 m_numerator 和 m_denominator。完美！
};
```

### 10.2 对带指针的类，浅拷贝是 **致命的**

问题：**浅拷贝一个指针拷贝的是地址，不是指向的东西。** 原对象和拷贝对象现在指向 **同一块内存**。

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
    ~MyString() { delete[] m_data; }  // 析构函数释放内存
    // 没有显式拷贝构造函数 —— 编译器生成浅拷贝的
};
```

**灾难**：
```cpp
int main() {
    MyString hello{ "Hello, world!" };
    {
        MyString copy{ hello };   // 浅拷贝！
        // 现在 copy.m_data 和 hello.m_data 指向同一块内存
    }  // copy 被销毁 → 析构函数运行 → 删除共享内存！

    // hello.m_data 现在指向已释放的内存
    std::cout << hello.getString();   // ❌ UB —— 访问已释放的内存
}
```

### 10.3 灾难分步走

1. `MyString hello{ "Hello, world!" };` —— 构造函数分配内存，设置 `hello.m_data` 指向它
2. `MyString copy{ hello };` —— **浅** 拷贝：`copy.m_data = hello.m_data`（同一地址！）
3. 内部 `{}` 结束 —— `copy` 的析构函数触发：`delete[] m_data` 释放共享内存
4. `hello.m_data` 现在 **悬垂**（指向已释放内存）
5. `hello.getString()` 解引用悬垂指针 —— UB

### 10.4 深拷贝（解决方案）

**深拷贝（deep copy）** 为拷贝对象分配 **新** 内存，并把 **内容** 复制过去。源对象和拷贝对象居住在不同的内存中。

```cpp
// 拷贝构造函数：新对象，没有旧资源要释放
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

> 💡 **拷贝赋值运算符** 的实现见 §12 —— 它需要先释放旧资源、做自赋值检查、返回 `*this`，三件事拷贝构造都不用做。

### 10.5 更好的方案：用标准库类

与其自己写内存管理：
- `std::string` 处理字符串
- `std::vector<T>` 处理动态数组
- 它们有 **正确实现** 的拷贝 / 赋值 / 移动操作

代码更少，bug 更少，头痛更少。

### 10.6 小结

- 默认拷贝构造和赋值 = **浅拷贝** → 简单类足够
- 有动态分配内存的类需要通过用户自定义拷贝构造和拷贝赋值做 **深拷贝**
- 优先选标准库类，而不是自己搞内存管理

---

## 11. 拷贝构造函数

> 对应 LearnCpp 14.14 — Introduction to the Copy Constructor
> \+ PPT class-and-struct.pptx（Complex 类示例）

### 11.1 什么是拷贝构造函数？

> 💡 **定义**：**拷贝构造函数** 是一种用同类型已有对象来初始化对象的构造函数。执行后，新对象是原对象的拷贝。

```cpp
Fraction f { 5, 3 };    // 调用 Fraction(int, int) —— 普通构造函数
Fraction fCopy { f };   // 调用 Fraction(const Fraction&) —— 拷贝构造函数
```

### 11.2 隐式拷贝构造函数

如果你不写拷贝构造函数，**C++ 会自动生成一个 public 的隐式拷贝构造函数**。它做 **按成员初始化** —— 新对象的每个成员从原对象对应成员初始化。

```cpp
class Fraction {
    int m_numerator{ 0 };
    int m_denominator{ 1 };
public:
    Fraction(int numerator = 0, int denominator = 1)
        : m_numerator{ numerator }, m_denominator{ denominator } {}
    void print() const { /* ... */ }
    // 没写拷贝构造函数 —— 编译器隐式生成
};

Fraction f { 5, 3 };
Fraction fCopy { f };   // 正常工作！打印 Fraction(5, 3) Fraction(5, 3)
```

### 11.3 写自己的拷贝构造函数

```cpp
class Fraction {
public:
    // 拷贝构造函数
    Fraction(const Fraction& fraction)
        : m_numerator{ fraction.m_numerator }
        , m_denominator{ fraction.m_denominator }
    {
        std::cout << "Copy constructor called\n";  // 仅为了证明它被调用
    }
    // ...
};
```

> 💡 **访问控制提醒**：访问控制是 **按类** 而不是按对象。一个类的成员函数可以访问 **任何** 同类型对象的私有成员。这就是 `fraction.m_numerator` 能编译通过的原因 —— 尽管 `m_numerator` 是 private。

### 11.4 关键规则：参数必须是引用

> ⚠️ **要求**：拷贝构造函数的参数 **必须** 是 lvalue 引用（最好是 `const`）。

```cpp
Fraction(const Fraction& f) { ... }  // ✅ 正确
Fraction(Fraction f) { ... }          // ❌ 编译错误
```

**为什么？** 如果参数是值传递，把实参拷进形参就需要调用拷贝构造函数 → 它自己又需要值传递 → 无穷递归。编译期就会抓到。

> 💡 **最佳实践**：如果自己写拷贝构造函数，参数应是 **const lvalue 引用**。

### 11.5 三条最佳实践

> 💡 **最佳实践 1**：**拷贝构造函数除了拷贝之外，不应有任何副作用。**
>
> 因为编译器可以省略（elide）拷贝构造函数调用。如果你的拷贝构造函数有副作用（打印、日志、计数），它们可能执行，也可能不执行 —— 可观察行为变得不可预测。

> 💡 **最佳实践 2**：**优先使用隐式拷贝构造函数**，除非你有明确理由自己写。
>
> 和隐式默认构造函数（啥有用的都不做）不同，隐式拷贝构造函数 **确实** 做有用的事（按成员拷贝），而且往往正是你想要的。

### 11.6 何时触发拷贝构造函数

**触发 1：值传递**：
```cpp
void printFraction(Fraction f) { f.print(); }  // f 是拷贝

Fraction f{ 5, 3 };
printFraction(f);   // 调用拷贝构造函数把 f 拷到参数
```

**触发 2：值返回**：
```cpp
Fraction generateFraction(int n, int d) {
    Fraction f{ n, d };
    return f;  // 调用拷贝构造函数把 f 拷到临时返回值
}
```

### 11.7 可能发生多次拷贝！

```cpp
Fraction generateFraction(int n, int d) {
    Fraction f{ n, d };
    return f;                                          // 拷贝 #1
}

int main() {
    Fraction f2 { generateFraction(1, 2) };   // 拷贝 #2，从临时对象到 f2
    printFraction(f2);                         // 拷贝 #3 —— 传给函数
}
```

输出（无优化时）：
```
Copy constructor called
Copy constructor called
Copy constructor called
Fraction(1, 2)
```

在 **拷贝省略（copy elision）**（现代编译器）下，这些拷贝中的一些或全部可能被消除。见 §16。

### 11.8 使用 `= default` 和 `= delete`

**`= default`**：显式请求编译器生成的拷贝构造函数：
```cpp
Fraction(const Fraction& fraction) = default;   // 等同于隐式版
```

**`= delete`**：禁止拷贝：
```cpp
Fraction(const Fraction& fraction) = delete;

// 现在：
Fraction f { 5, 3 };
Fraction fCopy { f };   // ❌ 编译错误：拷贝构造函数被 delete
```

对拷贝没意义的类（独占资源、文件句柄等）非常有用。

### 11.9 三法则（预告）

> 💡 **三法则**：如果一个类需要用户自定义的拷贝构造函数、析构函数或拷贝赋值运算符之一，那它 **很可能三个都需要**。
>
> **五法则**（C++11 扩展）：再加上移动构造函数和移动赋值。

这正是类管理动态内存时的情况。完整讨论见 §13。

### 11.10 测验：为什么参数不能按值传递？

> Q：为什么拷贝构造函数的参数必须是引用？
>
> A：如果是按值传递，那调用拷贝构造函数来拷贝实参本身就需要调用拷贝构造函数把实参拷进参数……无穷递归。编译器会抓到并报错。

---

## 12. 重载拷贝赋值运算符

> 对应 LearnCpp 21.12

### 12.1 拷贝赋值 vs. 拷贝构造

> 💡 **各自触发时机**：

| 情况 | 调用哪个？ |
|---|---|
| 从已有对象创建 **新** 对象 | **拷贝构造函数** |
| 值传递、值返回 | **拷贝构造函数**（隐式） |
| 赋值给 **已存在** 的对象 | **拷贝赋值** |

```cpp
Fraction f1 { 5, 3 };     // 普通构造函数
Fraction f2 { f1 };       // 拷贝构造函数（f2 是新的）
Fraction f3;              // 默认构造函数
f3 = f1;                  // 拷贝赋值（f3 已存在）
```

### 12.2 基本语法

**必须是成员函数**（不是非成员）：

```cpp
class Fraction {
public:
    Fraction& operator= (const Fraction& fraction) {
        // 简单版（无动态内存）
        m_numerator = fraction.m_numerator;
        m_denominator = fraction.m_denominator;
        return *this;   // 返回 *this 支持链式
    }
};
```

### 12.3 为什么返回 `*this`？

为了支持 **链式赋值**：
```cpp
Fraction f1, f2, f3;
f1 = f2 = f3;           // = 是右结合：f1 = (f2 = f3)
//         └─ 这个子表达式必须产生一个 Fraction 值以赋给 f1
```

返回 `*this` 得到被赋值对象的引用，使链式成为可能。

### 12.4 自赋值问题

C++ 允许自赋值：
```cpp
Fraction f1 { 5, 3 };
f1 = f1;   // 合法，虽然很傻
```

对 **简单类**：自赋值浪费点 CPU 但无害。

对 **带动态内存的类**：自赋值可能是 **灾难**：

```cpp
// ❌ 危险版本 —— 没有自赋值检查
MyString& MyString::operator=(const MyString& str) {
    if (m_data) delete[] m_data;   // ⚠️ 若 str 就是 *this，共享数据被释放！
    m_length = str.m_length;
    m_data = new char[m_length];
    std::copy_n(str.m_data, m_length, m_data);  // 从已释放的垃圾数据拷贝！
    return *this;
}
```

**`alex = alex` 会出什么问题**：
1. `m_data == str.m_data`（同一指针）
2. `delete[] m_data` 释放数据
3. `str.m_data` 现在悬垂
4. 为 `m_data` 分配新内存
5. 从 `str.m_data`（悬垂）拷贝 —— **垃圾！**

### 12.5 自赋值守卫

```cpp
MyString& MyString::operator=(const MyString& str) {
    // 自赋值检查
    if (this == &str)
        return *this;

    // ... 后续代码现在安全
    if (m_data) delete[] m_data;
    m_length = str.m_length;
    m_data = new char[m_length];
    std::copy_n(str.m_data, m_length, m_data);
    return *this;
}
```

> 💡 **核心洞察**：通过 **指针比较**（`this == &str`）检查，而不是值比较（`*this == str`）。
> - 指针比较 **快**
> - 不需要定义 `operator==`

### 12.6 何时可以省略自赋值检查

- **拷贝构造函数**：可以省略。新建对象不可能等于它自己（除了 `someClass c { c };`，这种会被作为未初始化抓住）。
- **天然能处理自赋值的类**：像上面的 `Fraction` —— 给自己的 `m_numerator = fraction.m_numerator` 是无害的。

不过一些大师建议 **永远** 出于防御性添加守卫。这是一种合理保守的做法。

### 12.7 Copy and Swap 惯用法

一个能优雅处理自赋值的更干净模式（Reading 提到，后续课详讲）：

```cpp
class T {
    T& operator=(T source) {    // 注意：按值传递，不是按引用！
        swap(*this, source);     // 与临时拷贝交换内容
        return *this;
    }  // source 的析构函数清理我们的旧数据
};
```

它依赖参数那里的拷贝（可能被编译器省略），再交换。

### 12.8 隐式拷贝赋值

和拷贝构造函数一样，如果你不写，编译器会生成一个隐式拷贝赋值运算符。它做按成员赋值（浅拷贝）。

### 12.9 禁止赋值

```cpp
Fraction& operator= (const Fraction& fraction) = delete;   // 不允许赋值
```

### 12.10 const 成员禁用隐式赋值

如果你的类有 const 成员，编译器 **隐式把赋值运算符 delete**（不能给 const 成员赋值）。要让带 const 成员的类可以赋值（只对非 const 成员），你必须显式写自己的 `operator=`。

---

## 13. 三/五法则

> 对应 LearnCpp 14.14 + 21.13 + 22.3 + PPT Dyn_Array.pptx 第 10 页

### 13.1 三法则（C++98）

> 💡 **三法则**：如果一个类需要用户自定义的 **拷贝构造函数**、**析构函数** 或 **拷贝赋值运算符** 之一，它很可能 **三个都需要**。

**为什么？** 如果你定义了其中任何一个，几乎可以肯定你在管理动态内存。你需要：
- **析构函数** 释放内存（防止泄漏）
- **拷贝构造函数** 初始化时深拷贝（防止共享状态）
- **拷贝赋值** 赋值时深拷贝（防止共享状态 + 泄漏）

### 13.2 完整三法则示例：`Vector`

出自 PPT（简化版）：

```cpp
class Vector {
    int maxLen;
    int* buf;
public:
    // 普通构造函数
    Vector(int newLen)
        : maxLen{ newLen }, buf{ new int[newLen] }
    {}

    // 1. 析构函数
    ~Vector() {
        delete[] buf;
    }

    // 2. 拷贝构造函数（深拷贝）
    Vector(const Vector& v)
        : maxLen(v.maxLen), buf(new int[v.maxLen])
    {
        for (int i = 0; i < v.maxLen; ++i)
            buf[i] = v.buf[i];
    }

    // 3. 拷贝赋值（深拷贝 + 自赋值守卫）
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

### 13.3 如果用默认版本会怎样？

PPT 问：**"如果这样做会怎样？"**

**情况 A：使用 `= default`**：
```cpp
String::String(const String& s) = default;            // 浅拷贝
String& String::operator=(const String& s) = default; // 浅拷贝
```
→ 两个 `String` 对象共享同一个 `buf`。一个析构时，另一个悬垂。随之而来的是重复 delete。

**情况 B：留空**：
```cpp
String::String(const String& s) {}                          // buf 未初始化（垃圾）
String& String::operator=(const String& s) { return *this; } // 什么也没拷贝
```
→ 新对象的 `buf` 是垃圾。析构函数运行时，`delete[] 垃圾地址` → 崩溃。

**结论**：别用默认版。别留空。正确实现三法则。

### 13.4 五法则（C++11）

> 💡 **五法则**：如果你定义或 delete 了五个特殊成员函数中的任何一个，你应该定义或 delete 全部五个：
>
> 1. 析构函数
> 2. 拷贝构造函数
> 3. 拷贝赋值运算符
> 4. **移动构造函数**（C++11 新增）
> 5. **移动赋值运算符**（C++11 新增）

移动构造函数 / 赋值在 §14 讲。

> 💡 **零法则**：如果你的类不直接管理资源（使用 `std::string`、`std::vector` 等），就 **一个也不** 定义。让编译器全都生成。

### 13.5 特殊成员函数间的互动规则

> ⚠️ **棘手！** 定义一个会影响其他：

- 如果你 **声明** 了析构函数、拷贝构造或拷贝赋值 → 编译器 **不会** 生成隐式的移动构造 / 赋值
- 如果你 **delete** 了拷贝构造 → 编译器 **不会** 生成隐式的移动构造 / 赋值
- 如果你 **delete** 了移动构造但保留了拷贝构造 → 类在某些情况下变得 **不可值返回**！

最安全的做法：如果你自定义其中一个，**五个都明确写出来**（定义、`= default` 或 `= delete`）。

---

## 14. 移动构造函数与移动赋值

> 对应 LearnCpp 22.3

### 14.1 拷贝语义的问题

考虑这个使用 **深拷贝** 的"智能指针"类：

```cpp
template<typename T>
class Auto_ptr3 {
    T* m_ptr{};
public:
    Auto_ptr3(T* ptr = nullptr) : m_ptr{ptr} {}
    ~Auto_ptr3() { delete m_ptr; }

    // 拷贝构造函数：深拷贝
    Auto_ptr3(const Auto_ptr3& a) {
        m_ptr = new T;
        *m_ptr = *a.m_ptr;
    }

    // 拷贝赋值：深拷贝
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
    return res;  // 拷贝构造函数
}

int main() {
    Auto_ptr3<Resource> mainres;
    mainres = generateResource();  // 拷贝赋值
}
```

**输出**（无 elision）：
```
Resource acquired      ← 1. res 构造
Resource acquired      ← 2. 拷贝构造：深拷贝到临时对象
Resource destroyed     ← 3. res 析构
Resource acquired      ← 4. 拷贝赋值：深拷贝到 mainres
Resource destroyed     ← 5. 临时对象析构
Resource destroyed     ← 6. main 结束时 mainres 析构
```

**3 次分配 + 3 次释放**，就为了"造一个资源给 `mainres`"。**浪费！**

### 14.2 洞察：源对象快死了，直接偷它的资源

如果我们知道源对象是个 **即将被销毁的临时** 对象，何必深拷贝？**直接拿走它的指针，留给它一个 nullptr。**

这就是 **移动语义（move semantics）** 的思想。

### 14.3 移动构造函数和移动赋值

C++11 引入：
- **移动构造函数**：把资源从右值（rvalue）转移到新对象
- **移动赋值**：把资源从右值转移到已存在的对象

**与拷贝的关键区别**：参数是 `T&&`（右值引用，非 const），不是 `const T&`。

```cpp
template<typename T>
class Auto_ptr4 {
    T* m_ptr{};
public:
    // ... 构造函数、析构函数、拷贝构造、拷贝赋值照旧 ...

    // 移动构造函数
    Auto_ptr4(Auto_ptr4&& a) noexcept
        : m_ptr{ a.m_ptr }   // 偷走指针
    {
        a.m_ptr = nullptr;   // ⭐ 关键：源不再拥有任何东西
    }

    // 移动赋值
    Auto_ptr4& operator=(Auto_ptr4&& a) noexcept {
        if (&a == this) return *this;
        delete m_ptr;          // 释放自己的资源
        m_ptr = a.m_ptr;       // 偷
        a.m_ptr = nullptr;     // ⭐ 关键
        return *this;
    }
};
```

### 14.4 移动语义的输出

同样的测试代码，输出现在：
```
Resource acquired
Resource destroyed
```

**只有 1 次分配 + 1 次释放** —— 资源在整个链条中被移动（而不是拷贝）！

### 14.5 为什么要 `a.m_ptr = nullptr`？

> ⚠️ **关键规则**：移动时你 **必须** 把源对象留在一个有效状态（通常是：清空）。

记住：被移动后的对象 **依然会被销毁**。它的析构函数会执行 `delete m_ptr`。如果我们不把源置空：
- 两个对象都指向同一块内存
- 源的析构函数释放它
- 新对象的析构函数尝试再次释放同一块内存 → **重复 delete** → UB

**一句话规则**：*被移动对象必须能安全析构，不影响新对象。*

### 14.6 移动语义的核心洞察

> 💡 **核心洞察**（出自 Reading）：
>
> - **如果实参是 lvalue**，唯一安全的做法是 **拷贝** —— 不知道它下次什么时候还会被用
> - **如果实参是 rvalue**（临时对象），它就要死了 → 我们可以安全地 **转移它的资源**（便宜），而不是拷贝（昂贵）
> - 移动语义是 **一种优化机会**

### 14.7 `noexcept`

移动函数应该标记为 **`noexcept`**（承诺不抛异常）。这告诉编译器和标准库容器（如 `std::vector`）移动是安全的 —— 在某些情况下（例如 `std::vector` 重新分配时）只会使用 `noexcept` 的移动。

### 14.8 移动构造 / 赋值何时被调用？

- **定义了移动函数，且实参是 rvalue** → 移动
  - 通常：字面量、临时对象、`std::move(x)`（后续课程）
- **否则**（lvalue，或移动函数未定义）→ 拷贝

### 14.9 隐式移动构造 / 赋值

编译器生成隐式移动操作 **仅当** 以下全部满足：
- 没有用户声明的拷贝构造函数
- 没有用户声明的拷贝赋值
- 没有用户声明的移动构造 / 赋值
- **没有用户声明的析构函数**

隐式移动做 **按成员移动**：
- 每个有移动构造 / 赋值的成员被移动
- 其他成员被 **拷贝**

> ⚠️ **注意**：隐式移动对指针是拷贝（不会置空）！如果你想真正转移指针所有权，**必须自己写移动函数**。

### 14.10 值返回会移动 lvalue（特殊规则）

在 `generateResource()` 中，局部的 `res` 是 lvalue —— 但 return 语句会 **移动** 它，而不是拷贝：

```cpp
Auto_ptr4<Resource> generateResource() {
    Auto_ptr4<Resource> res{new Resource};
    return res;  // 被移动（即便 res 是 lvalue）
}
```

> 💡 **特殊规则**：C++ 标准允许值返回的自动对象 **即便是 lvalue 也可以被移动**。逻辑上通，因为 `res` 反正要销毁。

某些情况下，编译器可能做得更好 —— 通过拷贝省略完全不做移动或拷贝。

### 14.11 禁止拷贝，保留移动

```cpp
template<typename T>
class Auto_ptr5 {
    // ...
    Auto_ptr5(const Auto_ptr5& a) = delete;             // 不能拷贝
    Auto_ptr5& operator=(const Auto_ptr5& a) = delete;  // 不能拷贝
    Auto_ptr5(Auto_ptr5&& a) noexcept { /* 偷 */ }      // 可以移动
    Auto_ptr5& operator=(Auto_ptr5&& a) noexcept { /* 偷 */ }
    // ...
};
```

这正是 `std::unique_ptr` 的工作方式：**仅移动**，不能拷贝。

### 14.12 性能示例（出自 Reading）

Reading 把一个 100 万元素的 `DynamicArray<int>` 跑了一个分配、填充、加倍、重新赋值的函数：

| 版本 | 时间 | 提速 |
|---|---|---|
| 深拷贝 | 0.00825559 s | 基线 |
| 移动 | 0.0056 s | **快 32.1%** |

移动语义 = 实实在在的性能收益。

### 14.13 移动构造 vs. 移动赋值（PPT 题）

> **PPT**："构造和赋值有什么区别？"

| 移动构造函数 | 移动赋值 |
|---|---|
| 对象是全新的 —— 还没有资源 | 对象已存在 —— 可能持有资源 |
| 直接从源偷 | **先释放自己的资源**，再偷 |
| 不需要自检 | **需要自检**（否则可能在偷之前就 delete 了自己的数据） |

### 14.14 Delete 移动构造 / 赋值

```cpp
Name(Name&& n) = delete;
Name& operator=(Name&& n) = delete;
```

> ⚠️ **微妙的坑**：delete 了移动构造但保留拷贝构造，在某些情况下 **会让类不能值返回**。为什么？被 delete 的移动构造依然是一个 **已声明** 的函数 —— 重载决议会优先选它而不是拷贝构造。因为它被 delete 了，所以用不了。

```cpp
Name getJoe() {
    Name joe{ "Joe" };
    return joe;   // ❌ 编译错误：移动构造函数被 delete
}
```

### 14.15 在移动函数里用 `std::swap` —— 别这么做！

常见的错误模式：
```cpp
Name(Name&& n) noexcept {
    std::swap(*this, n);   // 糟！
}
```

**为什么？** 对支持移动的类型，`std::swap` 内部 **会调用移动构造 / 赋值** → 无穷递归 → 栈溢出。

**修复**：写你自己的 swap，不要对整个对象用 `std::swap` —— 对各个成员单独用 `std::swap`：
```cpp
friend void swap(Name& a, Name& b) noexcept {
    std::swap(a.m_name, b.m_name);   // OK：直接交换 string 成员
}

Name(Name&& n) noexcept {
    swap(*this, n);   // 用我们自己的 swap，不是 std::swap
}
```

### 14.16 五件套速查范本（`String` 版 —— 对齐 HW4 / Reading Quiz）

把四个特殊成员函数 + 析构（**五法则**）压缩在一个最小类里 —— **和 HW4 的 `String`、Reading Quiz 的代码完全同构**：`char* buf`、`new[]/delete[]`、用静态辅助函数 `strdup(const char*)` 做深拷贝。

```cpp
class String {
    char* buf;
public:
    // 辅助函数:用 new[] 分配并 strcpy 出一份 C-string 的副本
    static char* strdup(const char* s);

    // ━━━━━ 从 C-string 构造 ━━━━━
    String(const char* s) : buf(strdup(s)) {}

    // ━━━━━ 析构（五法则要求） ━━━━━
    ~String() { delete[] buf; }

    // ━━━━━ 拷贝构造（Copy Constructor） ━━━━━
    String(const String& s) : buf(strdup(s.buf)) {}
    // 造新对象 + 深拷贝。没有旧资源要释放，不返回值。

    // ━━━━━ 拷贝赋值（Copy Assignment） ━━━━━
    String& operator=(const String& s) {
        delete[] buf;              // 释放旧
        buf = strdup(s.buf);       // 深拷贝
        return *this;              // 链式赋值
    }

    // ━━━━━ 移动构造（Move Constructor） ━━━━━
    String(String&& s) {
        buf = s.buf;               // 偷指针
        s.buf = nullptr;           // ⭐ 源必须留在可析构状态
    }

    // ━━━━━ 移动赋值（Move Assignment） ━━━━━
    String& operator=(String&& s) {
        delete[] buf;              // 释放旧
        buf = s.buf;               // 偷指针
        s.buf = nullptr;           // ⭐
        return *this;
    }
};
```

> 💡 自赋值检查在 HW4 / quiz 的参考答案里省略了（测试不考）。真实代码建议加上 `if (this != &s)`，尤其是拷贝赋值 —— 防止 `a = a` 时先 `delete[]` 掉自己再拿 `s.buf` 读到悬垂指针。

#### 属性对照表（四个维度）

| | 拷贝构造 | 拷贝赋值 | 移动构造 | 移动赋值 |
|---|---|---|---|---|
| **参数** | `const String&` | `const String&` | `String&&` | `String&&` |
| **释放旧资源** | ❌ 不需要（新对象） | ✅ 需要 | ❌ 不需要（新对象） | ✅ 需要 |
| **资源处理** | 新分配（深拷贝） | 新分配（深拷贝） | 偷指针 + 置空源 | 偷指针 + 置空源 |
| **返回值** | （构造函数无） | `String&`（返回 `*this`） | （构造函数无） | `String&`（返回 `*this`） |
| **`noexcept`** | 不强制 | 不强制 | ✅ 强烈建议 | ✅ 强烈建议 |

#### 操作勾选表（Reading Quiz 同构）

Reading Quiz 里的选项长这样：`{ delete[] buf; buf = strdup(s.buf); return *this; }`。**每一个花括号里的操作都对应下表一列** —— 做题时横着查这一行需要哪些操作，就能直接排除错误选项：

| | `delete[] buf` | `buf = strdup(...)` | `return *this` | `s.buf = nullptr` |
|---|:---:|:---:|:---:|:---:|
| **拷贝构造** | ❌ | ✅ `strdup(s.buf)` | ❌ | ❌ |
| **移动构造** | ❌ | ❌（直接 `buf = s.buf`） | ❌ | ✅ |
| **拷贝赋值** | ✅ | ✅ `strdup(s.buf)` | ✅ | ❌ |
| **移动赋值** | ✅ | ❌（直接 `buf = s.buf`） | ✅ | ✅ |

**读表法（一句话背下来）**：

> **构造无 `delete[]`、无 `return`；赋值全有。拷贝用 `strdup`；移动置 `nullptr`。**

展开就是四条规则：

- **构造 vs. 赋值**：赋值要 `delete[]` + `return *this`，构造都不要（新对象无旧资源、构造函数不返回）
- **拷贝 vs. 移动**：拷贝用 `strdup(s.buf)` 新分配深拷贝；移动直接偷指针并把源置 `nullptr`
- **从 `const char* s` 构造**（不是从 `String`）：用 `strdup(s)`，**注意没有 `.buf`**
- **自赋值检查** 在 quiz 的"最简正确答案"里一律省略，按纯 HW4 风格背即可

> ⚠️ **真实代码里**：能用 `std::string` / `std::unique_ptr<char[]>` 就用 —— 五个成员全部默认实现就对了，符合 **零法则**。这里的 `String` 只是 HW4 / 考试用的"赤裸指针"对照。

---

## 15. 类的初始化形式

> 对应 LearnCpp 14.15 — Class Initialization and Copy Elision

### 15.1 六种初始化形式（复习）

C++ 为基础类型提供了六种基本初始化形式 —— **对类类型同样适用**：

```cpp
int a;         // 默认初始化（无初始化器）
int b = 5;     // 拷贝初始化（名字后加 =）
int c( 6 );    // 直接初始化（圆括号）

// 列表初始化（C++11）：
int d { 7 };   // 直接列表初始化（首选！）
int e = { 8 }; // 拷贝列表初始化（= + 花括号）
int f {};      // 值初始化（空花括号）
```

### 15.2 类的同样六种形式

```cpp
class Foo {
public:
    Foo()                 { std::cout << "Foo()\n"; }
    Foo(int x)            { std::cout << "Foo(int) " << x << '\n'; }
    Foo(const Foo&)       { std::cout << "Foo(const Foo&)\n"; }
};

int main()
{
    // 默认构造函数（Foo()）
    Foo f1;           // 默认初始化
    Foo f2{};         // 值初始化（首选）

    // 普通构造函数（Foo(int)）
    Foo f3 = 3;       // 拷贝初始化（仅非 explicit 构造函数）
    Foo f4(4);        // 直接初始化
    Foo f5{ 5 };      // 直接列表初始化（首选）
    Foo f6 = { 6 };   // 拷贝列表初始化（仅非 explicit）

    // 拷贝构造函数（Foo(const Foo&)）
    Foo f7 = f3;      // 拷贝初始化
    Foo f8(f3);       // 直接初始化
    Foo f9{ f3 };     // 直接列表初始化（首选）
    Foo f10 = { f3 }; // 拷贝列表初始化
}
```

### 15.3 C++ 如何选择构造函数

对 **类类型**：
- 检查所有匹配的构造函数
- 重载决议选出最佳匹配（可能带隐式转换）

对 **非类类型**（如 `int`）：
- 由隐式转换规则决定是否可转换

### 15.4 各形式间的三个关键差别

> 💡 **核心洞察**：不同初始化形式间有三个重要差别：
>
> 1. **列表初始化不允许窄化转换**（如 `int x{3.5};` 是错误）
> 2. **拷贝初始化只考虑非 explicit 构造函数 / 转换**（见后续关于 `explicit` 的课程）
> 3. **列表初始化优先匹配 list 构造函数**（例如 `std::vector<int>{5}` 创建一个只含元素 `5` 的 vector，而不是大小为 5 的 vector）

### 15.5 初始化限制

在某些上下文中，只允许特定的初始化形式：
- **构造函数成员初始化列表**：只允许直接形式（不允许拷贝初始化）
- 某些上下文要求特定形式

### 15.6 最佳实践

> 💡 **最佳实践**：只要可能就用 **直接列表初始化**（花括号）。

```cpp
Foo f{ args };      // 直接列表初始化
Foo f2{};           // 值初始化（空花括号）
```

它：
- 禁止窄化（更安全）
- 对基础类型和类类型通用
- 干净地处理空初始化

---

## 16. 拷贝省略（Copy Elision，简介）

> 对应 LearnCpp 14.15 的 "Copy Elision" 小节
> *（注：你的课程阅读说明此节为可选 —— 这里简要列出作为上下文。）*

### 16.1 不必要的拷贝

考虑：
```cpp
Something s { Something { 5 } };   // 关注这一行
```

无优化时，这会 **两次** 构造函数调用：
1. `Something{5}` —— 通过 `Something(int)` 创建临时对象
2. 通过 `Something(const Something&)` 把临时对象拷到 `s`

然而最终结果和下面完全相同：
```cpp
Something s { 5 };   // 只有 一次调用 —— 直接调用 Something(int)
```

### 16.2 什么是拷贝省略？

> 💡 **定义**：**拷贝省略（copy elision）** 是一种编译器优化，消除对对象的不必要拷贝。当编译器把拷贝构造函数调用优化掉时，我们说该构造函数被 **省略了（elided）**。

关键在于，**拷贝省略不受 as-if 规则限制** —— 即使 **拷贝构造函数有副作用**（如打印），也可以被省略。这正是拷贝构造函数不应有副作用的原因！

### 16.3 值传递和值返回中的拷贝省略

```cpp
Something rvo() {
    return Something{};   // 调用 Something() —— 拷贝构造函数可能被省略
}

Something nrvo() {
    Something s{};        // 调用 Something()
    return s;             // 拷贝构造函数可能被省略
}

int main() {
    Something s1 { rvo() };   // 拷贝可能被省略
    Something s2 { nrvo() };  // 拷贝可能被省略
}
```

最坏情况下（无优化）4 次拷贝。有 elision 时，常常 0 次。编译器各异：
- **Visual Studio 2022** 省略 4 次中的 3 次
- **GCC** 4 次都省略

### 16.4 C++17 的强制拷贝省略

C++17 之前，拷贝省略是 **可选** 的。C++17 起，在某些情况下是 **强制** 的（如从临时对象初始化命名对象，像 `Something s { Something{5} }`）。

在强制省略的情况下，拷贝构造函数 **甚至不需要可访问**（可以是 delete 的！）。
在可选省略的情况下，拷贝构造函数依然必须被声明（只是可能被省略）。

### 16.5 要点

> 💡 **备忘**：你的拷贝构造函数不一定会按你预期调用。如果你的拷贝构造函数有副作用而你没看到它们，很可能是拷贝省略导致的。别依赖拷贝构造函数中的副作用。

---

## 17. 扩展案例：IntList（融会贯通）

> 对应 PPT Dyn_Array.pptx 第 28-39 页（IntList 扩展示例）

这一节整合了所有内容：三/五法则、动态数组、运算符重载等 —— 都在一个类里。

### 17.1 类声明

```cpp
#define DEFAULT_SIZE 10

class IntList {  // 和 std::vector 很像
private:
    int maxLen;   // 容量（物理大小）
    int curLen;   // 实际元素数（逻辑大小）
    int* buf;     // 指向动态 int 数组的起始
    // ...
};
```

> 💡 **关键区分**：**物理大小**（分配了多少内存）vs. **逻辑大小**（实际用了多少）。这正是 `std::vector` 的 `capacity()` vs. `size()` 的工作方式。

### 17.2 有用的辅助函数

```cpp
bool in_bounds(int i) { return i >= 0 && i < curLen; }

static void copy(int* to, int* from, int n) {
    for (int i = 0; i < n; ++i)
        to[i] = from[i];
}

void increaseArrayTo(int newSize) {
    int* oldBuf = buf;
    buf = new int[newSize];     // 1. 分配新（更大）数组
    copy(buf, oldBuf, curLen);  // 2. 复制旧元素
    maxLen = newSize;            // 3. 更新容量
    // curLen 不变
    delete[] oldBuf;             // 4. 释放旧数组
}
```

### 17.3 构造函数

```cpp
IntList(int newLen = DEFAULT_SIZE)
    : maxLen( newLen ), curLen(0), buf( new int[newLen] )
{
    assert(newLen > 0);  // 需要 #include <cassert>
}

// 拷贝构造函数（三法则 #2）
IntList(const IntList& l)
    : maxLen( l.maxLen ), curLen( l.curLen ), buf( new int[l.maxLen] )
{
    copy(buf, l.buf, l.curLen);
}
```

### 17.4 `length()` 和 `append()`

```cpp
int length() { return curLen; }

void append(int value) {
    if (curLen == maxLen)
        increaseArrayTo(maxLen + DEFAULT_SIZE);  // 自动扩容
    buf[curLen++] = value;
}
```

### 17.5 下标和赋值

```cpp
// 下标：返回引用，以便作为 lvalue 使用
int& operator[](int index) {
    assert(in_bounds(index));
    return buf[index];
}

// 拷贝赋值（三法则 #3）
IntList& operator=(const IntList& l) {
    if (maxLen < l.curLen)
        increaseArrayTo(l.curLen);
    copy(buf, l.buf, l.curLen);
    curLen = l.curLen;
    return *this;
}
```

### 17.6 相等运算符

```cpp
bool operator==(const IntList& l) {
    if (curLen != l.curLen) return false;
    for (int i = 0; i < curLen; ++i)
        if (buf[i] != l.buf[i]) return false;
    return true;
}

bool operator!=(const IntList& l) {
    return !operator==(l);  // 复用 ==
}
```

### 17.7 `indexOf()` 和 `remove()`

```cpp
int indexOf(int value) {
    for (int i = 0; i < curLen; ++i)
        if (buf[i] == value) return i;
    return -1;
}

void remove(int value) {
    int i = indexOf(value);
    if (i != -1)
        buf[i] = buf[--curLen];   // 🪄 巧妙：把最后一个元素挪到此位置
}
```

> 💡 **技巧**：不需要把后面所有元素都前移 —— 直接用最后一个元素覆盖被删的那个。代价：元素顺序 **不再保留**。

### 17.8 `reverse()` 和析构函数

```cpp
IntList reverse() {
    IntList result(curLen);
    for (int i = curLen - 1; i >= 0; --i)
        result.append(buf[i]);
    return result;
}

// 析构函数（三法则 #1）
~IntList() {
    delete[] buf;
}
```

### 17.9 `print()` 和插入运算符

```cpp
void print(ostream& out) {
    for (int i = 0; i < curLen; ++i)
        out << buf[i] << ' ';
}

// 非成员 operator<<（必须是非成员）
ostream& operator<<(ostream& out, const IntList& l) {
    l.print(out);
    return out;
}
```

### 17.10 移动构造函数和移动赋值（五法则）

```cpp
// 移动构造 —— 注意：没有 const（我们要改 l！）
IntList(IntList&& l)
    : maxLen( l.maxLen ), curLen( l.curLen ), buf( l.buf )
{
    l.buf = nullptr;   // ⭐ 关键：避免重复 delete
}

// 移动赋值
IntList& operator=(IntList&& l) {
    delete[] buf;       // 释放自己的资源
    curLen = l.curLen;
    maxLen = l.maxLen;
    buf = l.buf;        // 偷
    l.buf = nullptr;    // ⭐ 源不再拥有数组
    return *this;
}
```

### 17.11 示例输出

运行 Reading 的测试 main 产生：
```
My ints are 1 2 6 24 120 720 5040
Your ints are 1 2 6 24 120 720 5040
and they're equal
otherInts is empty
Other ints are 1 2 6 24 120 720 5040
Other ints are 5040 720 120 24 6 2 1
Other ints are 5040 1 120 24 6 2
```

注意最后一行：`720` 从 `Other ints` 中被移除，`1`（最后一个元素）代替了它的位置（因此顺序变了）。

---

## 18. Week 4 速查与核心要点

### 18.1 常量速查

| 情况 | 用什么 |
|---|---|
| 初始化值是常量表达式 | **`constexpr`** |
| 初始化值在运行时才知道（如 `cin >> x`） | **`const`** |
| 整型，需要编译期（如数组长度） | `constexpr` |
| 动态内存类型（`std::string`、`std::vector`） | `const`（不能 `constexpr`） |
| 函数参数 | **只能 `const`**（永远不能 `constexpr`） |

### 18.2 指针 / 引用 / 右值引用

| | `T*` 指针 | `T&` 引用 | `T&&` 右值引用 |
|---|---|---|---|
| 可以为空 | ✅ | ❌ | ❌ |
| 声明时必须初始化 | ❌（但应该） | ✅ | ✅ |
| 可以重新绑定 | ✅ | ❌ | ❌ |
| 绑定到 | 任意 | lvalue | 仅 rvalue |
| 语法 | `*p`、`p->` | 直接 | 直接 |
| 典型用途 | 动态内存、可选值 | 高效、避免拷贝 | 移动语义 |

### 18.3 `new` / `delete` 配对

| 分配 | 必须用什么释放 |
|---|---|
| `new T` | `delete p;` |
| `new T(args)` | `delete p;` |
| `new T[n]` | `delete[] p;` |
| `new T[n]{}`（零初始化） | `delete[] p;` |
| `new T[n]{a, b, c}`（列表初始化） | `delete[] p;` |

> ⚠️ **混用 `new`/`delete[]` 或 `new[]`/`delete` = UB**

### 18.4 三 / 五 / 零法则

| 法则 | 何时适用 | 要定义什么 |
|---|---|---|
| **零法则** | 类只用标准类型 | **什么也不写** —— 让编译器生成 |
| **三法则** | 类管理动态内存（C++11 之前） | 析构、拷贝构造、拷贝赋值 |
| **五法则** | 同上，现代 C++ | 上面三者 + 移动构造 + 移动赋值 |

### 18.5 拷贝 vs. 移动

| | 拷贝 | 移动 |
|---|---|---|
| 参数 | `const T&` | `T&&`（非 const） |
| 何时调用 | lvalue 实参，或未定义移动 | rvalue 实参 + 定义了移动 |
| 行为 | 深拷贝资源 | 偷走资源（浅拷贝 + 置空源） |
| 源对象之后 | 不变 | **空 / 有效但未指定状态** |
| 代价 | O(n) | O(1) |

### 18.6 考试常见陷阱

1. **`new[]` 配 `delete`**（没用 `delete[]`）—— UB
2. **拷贝构造参数按值**（没用引用）—— 编译错误
3. **拷贝构造参数没有 `const`** —— 不能从 const 对象初始化
4. **忘了自赋值检查** —— 在偷之前就删了自己的数据
5. **移动时忘了置源为 `nullptr`** —— 重复 delete
6. **返回指向局部变量的指针 / 引用** —— 悬垂
7. **`float f { 4.1 };`** —— 警告（用 `4.1f`）
8. **复合表达式中的条件运算符不加括号** —— 优先级陷阱
9. **把 `const double` 当成常量表达式** —— **不是**（只有 const **整型** 才是）
10. **内存泄漏** —— 指针丢失，没 `delete`
11. **`constexpr` 用在函数参数上** —— 不允许
12. **通过 `char*` 修改字符串字面量** —— UB（字面量只读）
13. **打印 `&c`（`c` 是 `char`）** —— `cout` 以为是字符串 → 垃圾输出
14. **`operator=` 忘了 `return *this`** —— 破坏链式赋值

### 18.7 Python ↔ C++ 对照（Week 4 重点）

| Python | C++ | 注释 |
|---|---|---|
| `x if cond else y` | `cond ? x : y` | 操作数顺序不同 |
| 不区分拷贝 vs. 移动 | 深拷贝 vs. 移动（显式） | C++ 无 GC，必须决定 |
| `list.append(x)` | `std::vector::push_back(x)` 或手动 | C 数组不能增长 |
| `copy.deepcopy(obj)` | 自己写深拷贝（三法则） | C++ 默认浅拷贝 |
| `del obj`（释放） | `delete ptr;`（手动） | 无 GC —— 手动内存 |
| 赋值 = 绑定名字 | 赋值 = 拷贝（或移动）值 | 语义完全不同 |
| 所有整数任意精度 | `int`、`long`、`long long` 有范围 | 字面量用后缀 |
| `'abc'` == `"abc"`（一样） | `'a'` = char，`"a"` = C 字符串 | ⚠️ C++ 中不同 |
| 没有 `constexpr` 等价物 | `constexpr` = 保证编译期 | C++ 区分 |

### 18.8 Klefstad 课上的金句

| 口号 | 含义 |
|---|---|
| "I just want to get it to work" | 🚫 糟糕心态 —— 先写干净 |
| "I'll clean it up later" | 🚫 "以后"常常变成永远不会 |
| 函数 > 5 行 → 重构 | ✅ 保持函数短小 |
| 每一块都测试 | ✅ 增量测试 |
| "把动态分配限制在类实现内部" | ✅ 把 `new`/`delete` 藏在类里（RAII） |
| "能力越大责任越大" | ✅ 动态内存需要自律 |

### 18.9 Week 4 的五大核心要点

1. **三 / 五法则**：管理动态内存的类 **必须** 定义析构、拷贝构造、拷贝赋值（最好再加上移动构造、移动赋值）。默认浅拷贝会导致重复 delete 和悬垂指针。

2. **`new` ↔ `delete`，`new[]` ↔ `delete[]` —— 决不混用**：混用导致未定义行为。这是最常见的新手错误之一。

3. **拷贝构造函数必须接受 `const T&`**：按值传递会无穷递归；缺 const 无法接受 const 实参；缺引用直接编译错误。

4. **移动语义是关于"偷"，不是"拷"**：关键细节是 `a.m_ptr = nullptr;` —— 没有这一步，源对象的析构函数会 delete 新对象现在拥有的同一块内存 → 重复 delete → UB。

5. **`constexpr` 要求编译期可求值**：它比 `const` 更严格。函数参数不能是 `constexpr`。动态内存类型（`std::string`、`std::vector`）不兼容 `constexpr` —— 用 `const`，或改用 `std::string_view` / `std::array`。
