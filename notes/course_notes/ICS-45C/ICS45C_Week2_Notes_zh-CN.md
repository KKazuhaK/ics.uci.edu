# Information and Computer Science 45C — Week 2 整合 Reading 笔记

## 目录

- [1. 代码测试入门](#1-代码测试入门)
- [2. 多文件程序与头文件](#2-多文件程序与头文件)
- [3. 常量变量（Named Constants）](#3-常量变量named-constants)
- [4. 自增自减运算符与副作用](#4-自增自减运算符与副作用)
- [5. auto 类型推导](#5-auto-类型推导)
- [6. 复合数据类型入门](#6-复合数据类型入门)
- [7. 值类别：左值与右值](#7-值类别左值与右值)
- [8. 左值引用（Lvalue References）](#8-左值引用lvalue-references)
- [9. const 左值引用](#9-const-左值引用)
- [10. 引用传参（Pass by Reference）](#10-引用传参pass-by-reference)
- [11. const 引用传参](#11-const-引用传参)
- [12. 面向对象编程入门](#12-面向对象编程入门)
- [13. 类（Class）入门](#13-类class入门)
- [14. 成员函数](#14-成员函数)
- [15. const 对象与 const 成员函数](#15-const-对象与-const-成员函数)
- [16. public 与 private 访问控制](#16-public-与-private-访问控制)
- [17. 构造函数入门](#17-构造函数入门)
- [18. 构造函数成员初始化列表](#18-构造函数成员初始化列表)
- [19. 析构函数](#19-析构函数)
- [20. 类与头文件的分离](#20-类与头文件的分离)
- [21. class vs struct](#21-class-vs-struct)
- [22. 数组（C Arrays）—— 课堂 PPT 补充](#22-数组c-arrays-课堂-ppt-补充)
- [23. C 风格字符串（C-style Strings）](#23-c-风格字符串c-style-strings)
- [24. operator<< 重载与引用参数模式](#24-operator-重载与引用参数模式)
- [25. STL 容器初步：set 与 map](#25-stl-容器初步set-与-map)
- [26. 文件 I/O 初步 → 已迁移至 Week 3 §12](#26-文件-io-初步--已迁移至-week-3-12)
- [27. 综合速查表](#27-综合速查表)

> UCI ICS 45C: Programming in C++ (35770)  
> 本笔记整合了 Week 2 Assigned Reading（LearnCpp 章节）与课堂 PPT 内容，按学习顺序整理。

---

## 1. 代码测试入门

> 对应 LearnCpp 9.1 — Introduction to testing your code

### 1.1 为什么要测试

写完代码并不代表代码是对的。测试就是**系统性地验证代码是否按预期工作**。

测试的目标：

- 找到 bug
- 验证边界情况
- 确保修改代码后没有引入新问题（回归测试）

### 1.2 测试的基本方式

**非正式测试（informal testing）：** 手动运行程序，输入一些值，看输出对不对。简单但不可靠，因为每次改了代码都得重新手动测一遍。

**保留测试（preserving tests）：** 把测试写在代码里（比如单独的测试函数），这样每次都能自动重新运行。

### 1.3 测试方法论

测试代码时，应当覆盖以下几类输入：

- **正常情况**：最常见的输入
- **边界情况**：边缘值（如 0、1、最大值、最小值）
- **错误情况**：无效输入，看程序是否能正确处理

```cpp
// 例：测试一个判断是否为偶数的函数
bool isEven(int x) {
    return (x % 2) == 0;
}

// 测试用例应包括：
// 正常情况：isEven(4) -> true, isEven(7) -> false
// 边界情况：isEven(0) -> true, isEven(1) -> false
// 负数情况：isEven(-2) -> true, isEven(-3) -> false
```

### 1.4 单元测试（Unit Testing）

单独测试一小块代码（一个函数或一个类）来验证它是否正确，叫做**单元测试（unit testing）**。每个 unit test 旨在确保被测单元的某个特定行为是正确的。

LearnCpp 的汽车组装比喻：

- **坏做法（方案B）**：把所有零件装好后才第一次测试整辆车 → 出了问题不知道是哪个零件的错，排查困难
- **好做法（方案A）**：每个零件单独测试通过后再装上去，装上去后再测一遍 → 问题早发现、早解决

程序也一样：写一个函数就测一个，而不是整个程序写完才第一次运行。

### 1.5 测试代码的演进

**第一步：非正式测试** —— 临时写一些测试代码，验证通过后就删掉。

```cpp
int main() {
    std::cout << isLowerVowel('a') << '\n';  // 应输出 1
    std::cout << isLowerVowel('q') << '\n';  // 应输出 0
    return 0;
}
```

**第二步：保留测试** —— 把测试代码移到专门的测试函数中，以便日后重新运行。

```cpp
void testVowel() {
    std::cout << isLowerVowel('a') << '\n';  // 应输出 1
    std::cout << isLowerVowel('q') << '\n';  // 应输出 0
}
```

**第三步：自动化测试** —— 测试函数自动比较实际结果和预期结果，不需要人工检查。

```cpp
int testVowel() {
    if (!isLowerVowel('a')) return 1;  // 测试 1 失败
    if (isLowerVowel('q')) return 2;   // 测试 2 失败
    return 0;                           // 所有测试通过
}
```

**第四步：使用测试框架** —— 如 GoogleTest（Week 1 已介绍过），专门用于管理和运行测试。

### 1.6 集成测试

在单独测试每个模块后，把它们组合在一起再测一遍，叫做**集成测试（integration testing）**。目前阶段，运行整个程序并检查行为即可。

> 💡 关键原则：**写完一个非平凡函数就应该开始测试**。不要等到最后！

---

## 2. 多文件程序与头文件

> 对应 LearnCpp 2.8 — Programs with multiple code files  
> 对应 LearnCpp 2.11 — Header files

### 2.1 为什么要多文件

当程序变大时，所有代码塞在一个 `.cpp` 文件里会非常混乱。拆分成多个文件可以：

- **组织更清晰**：每个文件负责一块功能
- **编译更快**：修改一个文件只需重新编译那一个
- **协作更容易**：不同人可以同时写不同文件

### 2.2 多文件的基本结构

假设我们有一个 `add` 函数要在另一个文件里定义：

```
项目结构：
  main.cpp     —— 主程序
  add.cpp      —— add 函数的定义
  add.h        —— add 函数的声明（头文件）
```

**add.h（头文件）：**

```cpp
#ifndef ADD_H
#define ADD_H

int add(int x, int y);   // 函数声明（前向声明）

#endif
```

**add.cpp（源文件）：**

```cpp
#include "add.h"

int add(int x, int y) {   // 函数定义
    return x + y;
}
```

**main.cpp：**

```cpp
#include <iostream>
#include "add.h"

int main() {
    std::cout << add(3, 4) << '\n';   // 输出: 7
    return 0;
}
```

### 2.3 编译多个文件

```bash
g++ -o myprogram main.cpp add.cpp
```

编译器会：

1. 分别编译 `main.cpp` 和 `add.cpp` 为目标文件（`.o`）
2. 链接器把它们合并成一个可执行文件

> ⚠️ **关键理解**：编译器**独立编译每个文件**，不知道其他文件的内容，也不会记住之前编译过的文件里的东西。这是故意的设计：
> - 源文件可以按任意顺序编译
> - 修改一个文件只需重新编译那个文件
> - 减少不同文件之间的命名冲突

所以，如果 `main.cpp` 想用 `add.cpp` 里定义的函数，必须在 `main.cpp` 里有该函数的**前向声明（forward declaration）**或通过 `#include` 头文件来获得声明。

**标识符如何找到定义（Key Insight）：**

1. 编译器在当前文件里找到了声明或定义 → 直接使用
2. 定义在另一个文件里 → 链接器负责连接
3. 找不到定义 → 链接器报错（`unresolved external symbol`）

### 2.4 头文件的作用

头文件（`.h` 或 `.hpp`）的核心功能：**让多个 `.cpp` 文件共享声明**。

- 头文件包含**声明（declaration）**，不包含定义（definition）
- `.cpp` 文件 `#include` 头文件后，编译器就知道这个函数/类存在
- 定义放在对应的 `.cpp` 文件中

### 2.5 #include 的两种写法

```cpp
#include <iostream>     // 用尖括号：搜索系统/标准库路径
#include "myheader.h"   // 用引号：先搜索当前目录，再搜索系统路径
```

规则：

- 标准库头文件用 `<>`
- 自己写的头文件用 `""`

### 2.6 Header Guards（头文件保护）

如果一个头文件被 `#include` 了两次，就会出现重复声明的错误。**Header guard** 解决这个问题：

```cpp
#ifndef MY_HEADER_H    // 如果还没定义过这个宏
#define MY_HEADER_H    // 定义这个宏

// 头文件内容...
int add(int x, int y);

#endif                 // 结束
```

也可以用更简洁的方式（大多数编译器支持）：

```cpp
#pragma once

int add(int x, int y);
```

`#pragma once` 和 `#ifndef` 效果一样，但 `#pragma once` 不是 C++ 标准的一部分（虽然几乎所有编译器都支持）。

### 2.7 头文件最佳实践

- 头文件里放**声明**，不放**定义**（内联函数和类定义除外）
- 每个 `.cpp` 文件都应该 `#include` 它自己对应的头文件
- 总是使用 header guard
- 不要在头文件里写 `using namespace std;`（会污染所有包含它的文件）

**⚠️ 为什么不能在头文件里放函数定义？** 因为会违反 **One Definition Rule（ODR，单一定义规则）**：

```cpp
// add.h — 错误示范！把定义放在了头文件里
int add(int x, int y) {
    return x + y;
}
```

如果 `main.cpp` 和 `add.cpp` 都 `#include "add.h"`，那 `add()` 的定义就会出现在两个编译单元里。链接器看到两个定义，就会报 ODR 违规错误。

| Python | C++ |
|--------|-----|
| `import math` | `#include <cmath>` |
| `from mymodule import func` | `#include "mymodule.h"` |
| 模块系统自动防重复导入 | 需要 header guard 手动防止 |

---

## 3. 常量变量（Named Constants）

> 对应 LearnCpp 5.1 — Constant variables (named constants)

### 3.1 什么是常量变量

常量变量就是**一旦初始化后就不能再修改的变量**。

Week 1 里已经见过 `constexpr`，这里系统整理一下。

### 3.2 const vs constexpr

```cpp
const int x{5};         // 运行时常量：初始化后不能改
constexpr int y{5};     // 编译时常量：编译时就确定值

const int z{getInput()};     // OK：const 可以用运行时的值初始化
// constexpr int w{getInput()};  // 错误！constexpr 必须在编译时就确定
```

区分：

| 关键字 | 何时确定值 | 能否用运行时值初始化 |
|--------|-----------|-------------------|
| `const` | 运行时 | 可以 |
| `constexpr` | 编译时 | 不可以，必须是编译期可知的值 |

### 3.3 为什么用常量

```cpp
// 坏：magic number
double area = 3.14159 * r * r;

// 好：命名常量
constexpr double pi{3.14159};
double area = pi * r * r;
```

好处：

- **可读性**：看到 `pi` 比看到 `3.14159` 更直观
- **可维护性**：改一处就全部更新
- **安全性**：防止意外修改

### 3.4 const 变量的命名

LearnCpp 推荐：普通 `const` / `constexpr` 变量可以用普通命名风格（如 `maxStudents`），不一定要全大写。

但课堂 PPT 中，教授使用 `STACK_CAPACITY` 这种全大写+下划线的风格（用于 `constexpr`）。**跟着教授的风格来**。

### 3.5 const 修改尝试会怎样

```cpp
const int x{10};
x = 20;   // 编译错误！不能修改 const 变量
```

编译器会在编译阶段直接报错，帮你阻止这种错误。

---

## 4. 自增自减运算符与副作用

> 对应 LearnCpp 6.4 — Increment/decrement operators, and side effects

### 4.1 前缀 vs 后缀

```cpp
int x{5};

int a = ++x;   // 前缀自增：先加再用。x 变成 6，a = 6
int b = x++;   // 后缀自增：先用再加。b = 6（用的是加之前的值），x 变成 7
```

| 操作 | 语法 | 含义 | 返回值 |
|------|------|------|--------|
| 前缀自增 | `++x` | 先加 1，再返回 | 加完之后的值 |
| 后缀自增 | `x++` | 先返回，再加 1 | 加之前的值 |
| 前缀自减 | `--x` | 先减 1，再返回 | 减完之后的值 |
| 后缀自减 | `x--` | 先返回，再减 1 | 减之前的值 |

### 4.2 详细例子

```cpp
int x{5};
std::cout << x << '\n';     // 输出: 5

std::cout << ++x << '\n';   // 输出: 6（先变成6再输出）
std::cout << x << '\n';     // 输出: 6

std::cout << x++ << '\n';   // 输出: 6（先输出6再变成7）
std::cout << x << '\n';     // 输出: 7
```

### 4.3 最佳实践

**优先使用前缀（`++x`），除非你确实需要后缀的行为。**

原因：

- 前缀更高效（后缀需要保存旧值的副本）
- 更容易理解
- 在 `for` 循环中，`++i` 和 `i++` 效果一样，但前缀习惯上更推荐

```cpp
for (int i{0}; i < 10; ++i) {   // 推荐 ++i
    std::cout << i << '\n';
}
```

### 4.4 副作用（Side Effects）

**副作用** 是指表达式除了返回值以外，对程序状态产生的影响。

```cpp
x = 5;    // 副作用：改变了 x 的值
++x;      // 副作用：改变了 x 的值
std::cout << x;   // 副作用：向屏幕输出了内容
```

### 4.5 ⚠️ 警告：不要在同一条语句中多次修改同一变量

```cpp
int x{1};
x = x++;   // undefined behavior!
```

如果同一个变量在同一个表达式里被读和写，且没有明确的顺序，就是 **undefined behavior（UB）**。

规则：**一条语句里，每个变量最多只被修改一次。**

更详细的例子：

```cpp
int x{5};
int value{add(x, ++x)};   // undefined behavior!
// C++ 不规定函数参数的求值顺序
// 如果先算左边：add(5, 6) = 11
// 如果先算右边：add(6, 6) = 12
// 不同编译器可能给出不同结果！
```

```cpp
int x{1};
int y = x + ++x;   // unspecified behavior!
// Visual Studio/GCC 得到 2 + 2 = 4
// Clang 得到 1 + 2 = 3
```

> ⚠️ C++ 故意不定义函数参数和运算符操作数的求值顺序，这样编译器可以选择最优的执行方式。

---

## 5. auto 类型推导

> 对应 LearnCpp 10.8 — Type deduction for objects using the auto keyword  
> ⚠️ 阅读材料说明：了解概念即可，目前不要使用 auto

### 5.1 什么是 auto

`auto` 让编译器根据初始化值**自动推断变量的类型**。

```cpp
auto x{5};        // x 是 int
auto y{3.14};     // y 是 double
auto z{"hello"};  // z 是 const char*（注意！不是 std::string）
```

### 5.2 auto 的好处

- 减少打字
- 当类型名很长时特别有用（后面学模板/迭代器时会体会到）

```cpp
// 没有 auto
std::vector<std::string>::iterator it = names.begin();

// 有 auto
auto it = names.begin();
```

### 5.3 auto 的注意事项

- `auto` 变量**必须初始化**（否则编译器无法推断类型）
- `auto` 推断出的类型可能不是你想要的
- **`auto` 默认会丢弃 `const`**：

```cpp
auto x{5};     // x 是 int
auto y{5.0};   // y 是 double
auto z{5.0f};  // z 是 float

const int a{10};
auto b{a};     // b 是 int（不是 const int！const 被丢弃了）

// 如果想保留 const，必须显式加上：
const auto c{a};     // c 是 const int
constexpr auto d{5}; // d 是 constexpr int
```

### 5.4 range-based for 中的 auto

课堂 PPT 里多次出现这种写法：

```cpp
for (auto s : A) cout << s;     // auto 自动推断元素类型
for (auto E : S) cout << E;     // set 遍历
for (auto E : A) cout << E.first << E.second;  // map 遍历
```

这是目前最常见的 `auto` 使用场景。

### 5.5 课程要求

阅读材料明确说：**了解 auto 的概念，但目前先不要使用它**（除了 range-based for 这种惯用法之外）。

---

## 6. 复合数据类型入门

> 对应 LearnCpp 12.1 — Introduction to compound data types

### 6.1 基本类型 vs 复合类型

Week 1 学的那些类型（`int`、`double`、`char`、`bool`）都是**基本类型（fundamental types）**。

**复合类型（compound types）** 是由基本类型或其他复合类型组合而成的。

### 6.2 C++ 中的复合类型

C++ 有很多复合类型，Week 2 开始接触的有：

| 复合类型 | 说明 | 例子 |
|----------|------|------|
| **引用（reference）** | 已有对象的别名 | `int& ref = x;` |
| **指针（pointer）** | 存储对象地址 | `int* ptr = &x;` |
| **数组（array）** | 同类型元素的连续集合 | `int a[5];` |
| **枚举（enum）** | 用户定义的离散值类型 | `enum Color { Red, Green, Blue };` |
| **类（class）** | 用户定义的复合数据类型 | `class Student { ... };` |
| **结构体（struct）** | 和 class 几乎一样 | `struct Point { int x, y; };` |

Week 2 重点学习：**引用** 和 **类**。

---

## 7. 值类别：左值与右值

> 对应 LearnCpp 12.2 — Value categories (lvalues and rvalues)

### 7.1 什么是值类别

每个 C++ 表达式除了有类型（type）之外，还有一个**值类别（value category）**。

最重要的两个值类别：

- **左值（lvalue）**：有持久身份的表达式，可以取地址
- **右值（rvalue）**：临时的、没有持久身份的表达式

### 7.2 怎么判断

```cpp
int x{5};

// x 是左值：它有名字，有内存地址，一直存在到作用域结束
// 5 是右值：它只是一个临时的字面量

x = 10;    // OK：左值可以出现在 = 的左边
// 10 = x; // 错误：右值不能出现在 = 的左边
```

### 7.3 可修改左值 vs 不可修改左值

左值还分两种子类型：

```cpp
int x{5};           // x 是可修改的左值（modifiable lvalue）
const double d{3.14}; // d 是不可修改的左值（non-modifiable lvalue）

x = 10;    // OK：x 是 modifiable lvalue
// d = 2.0; // 错误：d 是 non-modifiable lvalue（因为是 const）
```

赋值运算符 `=` 的左边必须是**可修改的左值（modifiable lvalue）**，这也解释了为什么 `5 = x` 和 `const` 变量赋值都会报错。

### 7.4 常见的左值和右值

常见的**左值**：

- 变量名：`x`、`myString`
- 函数返回引用：（后面学）
- 数组元素：`a[0]`
- **C 风格字符串字面量**：`"Hello"` 是左值（这是个例外！）

常见的**右值**：

- 字面量（除了 C 风格字符串字面量）：`5`、`3.14`、`'A'`
- 表达式结果：`x + 1`（结果是临时值）
- 函数返回值（非引用）：`add(3, 4)`
- `static_cast` 结果：`static_cast<int>(d)`

### 7.3 为什么要分左值和右值

这在理解**引用**时非常关键：

- 普通引用（`int&`）只能绑定到**左值**
- `const` 引用（`const int&`）可以绑定到**左值和右值**

> 💡 可以这样记：左值（lvalue）= **有名字、有地址、长期存在的**；右值（rvalue）= **临时的、一次性的**。

---

## 8. 左值引用（Lvalue References）

> 对应 LearnCpp 12.3 — Lvalue references

### 8.1 什么是引用

**引用（reference）** 是已有变量的**别名（alias）**。

```cpp
int x{5};
int& ref{x};   // ref 是 x 的引用（别名）

std::cout << x << '\n';     // 输出: 5
std::cout << ref << '\n';   // 输出: 5

ref = 10;                    // 通过引用修改
std::cout << x << '\n';     // 输出: 10（x 也变了！）
```

`ref` 和 `x` 是**同一个东西**，只是两个不同的名字。

### 8.2 引用 vs 指针

| 特性 | 引用 `int&` | 指针 `int*` |
|------|------------|------------|
| 语法 | `int& ref = x;` | `int* ptr = &x;` |
| 是否可以为空 | 不行，必须绑定到对象 | 可以是 `nullptr` |
| 是否可以重新绑定 | 不行，一旦绑定就不能换 | 可以 `ptr = &y;` |
| 使用方式 | 直接用 `ref` | 需要 `*ptr` 解引用 |
| 是否需要声明时初始化 | 必须 | 不必须（但推荐） |

> 💡 引用就像一个人的"昵称"：张三的外号叫"小三"，叫"张三"和叫"小三"找到的是同一个人，而且外号一旦取了就不能转给别人。

### 8.3 引用的规则

```cpp
int x{5};
int& ref{x};      // OK：引用绑定到左值 x

// int& ref2{5};   // 错误！普通引用不能绑定到右值（字面量）
// int& ref3;      // 错误！引用必须在声明时初始化
```

引用的三条铁律：

1. **必须在声明时初始化**（这个过程叫 **reference binding（引用绑定）**，被引用的对象叫 **referent**）
2. **非 const 引用只能绑定到可修改的左值（modifiable lvalue）**（const 引用例外，见下节）
3. **一旦绑定，不能重新绑定到另一个对象（not resealable）**

```cpp
int x{5};
const int y{10};

int& ref1{x};      // OK：x 是 modifiable lvalue
// int& ref2{y};   // 错误！y 是 non-modifiable lvalue（const），普通引用不能绑
// int& ref3{5};   // 错误！5 是 rvalue
```

> ⚠️ 为什么非 const 引用不能绑定到 const 左值？因为如果可以，你就能通过引用修改一个 const 变量，违反了 const 的承诺。

### 8.4 引用的类型必须匹配

```cpp
int x{5};
int& ref{x};       // OK
// double& ref2{x}; // 错误！类型不匹配
```

> 💡 `&` 的位置：`int& ref` 和 `int &ref` 对编译器来说一样，但现代 C++ 推荐把 `&` 靠近类型写（`int& ref`），因为"引用"是**类型信息的一部分**。

### 8.5 引用的生命周期

引用不是独立的对象，它没有自己的存储空间。引用只是它所绑定的对象的另一个名字。

**被引用的对象（referent）** 的生命周期必须至少和引用一样长。如果引用的对象已经销毁，引用就变成了**悬垂引用（dangling reference）**，使用它是 undefined behavior。

---

## 9. const 左值引用

> 对应 LearnCpp 12.4 — Lvalue references to const

### 9.1 什么是 const 引用

```cpp
int x{5};
const int& ref{x};   // ref 是 x 的 const 引用

std::cout << ref << '\n';   // 输出: 5（可以读）
// ref = 10;                // 错误！不能通过 const 引用修改
x = 10;                     // OK：x 本身不是 const，可以直接改
std::cout << ref << '\n';   // 输出: 10（ref 反映最新的 x）
```

`const` 引用意味着：**通过这个引用，你只能读，不能写**。但原变量本身如果不是 `const`，还是可以通过原名修改。

### 9.2 const 引用可以绑定到右值！

这是 `const` 引用的一个特殊能力：

```cpp
const int& ref{5};   // OK！const 引用可以绑定到右值（字面量）
```

普通引用做不到这一点：

```cpp
// int& ref{5};   // 错误！
```

原理：编译器会创建一个临时对象来保存这个右值，然后让 `const` 引用绑定到这个临时对象。

**临时对象的生命周期延长**：通常临时对象在表达式结束时就销毁了。但如果一个 `const` 引用**直接绑定**到临时对象，C++ 规定该临时对象的生命周期会延长到和引用一样长。

```cpp
const int& ref{5};           // 临时对象的生命周期延长到和 ref 一样
std::cout << ref << '\n';    // 安全！输出 5
// ref 和临时对象在作用域结束时一起销毁
```

### 9.3 const 引用可以绑定到不同类型的值

`const` 引用甚至可以绑定到**不同类型**的值（只要能隐式转换）：

```cpp
const double& r1{5};    // 5（int）被转换为临时 double，r1 绑定到该临时对象
char c{'a'};
const int& r2{c};       // c（char）被转换为临时 int，r2 绑定到该临时对象

std::cout << r2 << '\n'; // 输出 97（'a' 的 ASCII 值），因为 r2 是 int 引用
```

> ⚠️ 注意：这种情况下，引用绑定的是**临时对象**而非原变量。修改原变量不会影响引用，反之亦然。

### 9.4 const 引用的绑定规则总结

| 引用类型 | 能绑定 modifiable lvalue？ | 能绑定 non-modifiable lvalue？ | 能绑定右值？ | 能修改？ |
|----------|------------|------------|------------|---------|
| `int&` | 可以 | 不行 | 不行 | 可以 |
| `const int&` | 可以 | 可以 | 可以 | 不行 |

> 💡 `const int&` 是"万能读取器"：什么都能看，但什么都不能改。

---

## 10. 引用传参（Pass by Reference）

> 对应 LearnCpp 12.5 — Pass by lvalue reference

### 10.1 回顾：值传递的问题

Week 1 学过，C++ 默认是**值传递**：

```cpp
void addOne(int x) {
    ++x;   // 只改了副本
}

int a{5};
addOne(a);
std::cout << a << '\n';   // 输出: 5（a 没变）
```

值传递有两个问题：

1. **无法修改原变量**
2. **拷贝大对象很昂贵**（想象复制一个几百 MB 的对象）

### 10.2 引用传参解决问题

```cpp
void addOne(int& x) {   // x 是引用参数
    ++x;   // 修改的是原变量！
}

int a{5};
addOne(a);
std::cout << a << '\n';   // 输出: 6（a 被修改了！）
```

函数参数声明为 `int&` 时，传入的实参不会被复制，而是**直接绑定到原变量**。

### 10.3 引用传参只接受左值

```cpp
void addOne(int& x) { ++x; }

int a{5};
addOne(a);     // OK：a 是左值
// addOne(5);  // 错误！5 是右值，不能绑定到 int&
```

### 10.4 传引用 vs 传值：对比

| 特性 | 值传递 `int x` | 引用传递 `int& x` |
|------|---------------|-------------------|
| 会复制吗 | 会 | 不会 |
| 能修改原变量吗 | 不能 | 能 |
| 接受右值吗 | 能 | 不能 |

> 💡 PPT 中的比喻很精彩：值传递像是"把 PDF 用邮件发给你"（你改了只是改了副本）；引用传递像是"给你一个 Google Doc 链接"（你改了就是改了原文）。

### 10.5 Python 对比

Python 的传参行为类似于"传引用"，但有微妙区别：

```python
def add_one(lst):
    lst.append(1)   # 会影响原 list

# C++ 要达到同样效果，需要显式写 &
void addElement(vector<int>& v) {
    v.push_back(1);
}
```

---

## 11. const 引用传参

> 对应 LearnCpp 12.6 — Pass by const lvalue reference

### 11.1 为什么需要 const 引用传参

有时候我们传引用只是为了**效率**（不想复制），但**不想修改原变量**。这时用 `const` 引用：

```cpp
void printValue(const int& x) {
    std::cout << x << '\n';
    // x = 10;   // 错误！不能通过 const 引用修改
}

int a{5};
printValue(a);    // OK
printValue(5);    // 也OK！const 引用可以接受右值
```

### 11.2 传参方式选择指南

**这是 Week 2 最重要的实践规则之一（LearnCpp 的 Rule of Thumb）：**

> **基本类型和枚举类型用值传递，类类型用 const 引用传递。**  
> 如果不确定用哪种，就用 `const` 引用，出错的可能性更小。

| 情况 | 推荐方式 | 原因 |
|------|---------|------|
| 基本类型（`int`、`double`、`char`、`bool`）和枚举 | 值传递 `int x` | 基本类型很小，复制成本低 |
| 需要修改原变量 | 引用传递 `int& x` | 可以修改 |
| 类类型对象，不需要修改 | const 引用 `const string& s` | 避免拷贝，又不会意外修改 |
| 不可复制的类型（如 `ostream`） | 引用传递 `ostream& out` | 这些类型根本不支持复制 |

```cpp
void process(const std::string& name) {   // string 可能很大，用 const& 避免拷贝
    std::cout << "Hello, " << name << '\n';
}
```

> ⚠️ **跨类型传参警告**：确保实参类型和引用参数类型匹配！如果类型不匹配（比如传 `int` 给 `const double&`），编译器会创建一个临时对象做转换，引用绑定到临时对象而非原变量。这可能导致意外行为和额外拷贝开销。

### 11.3 混合使用不同传参方式

一个函数的多个参数可以各自选择传值或传引用：

```cpp
void foo(int a, int& b, const std::string& c) {
    // a 是值传递，b 是引用传递，c 是 const 引用传递
}
```

### 11.4 三种传参方式完整对比

| 特性 | `int x` | `int& x` | `const int& x` |
|------|---------|----------|----------------|
| 复制 | 是 | 否 | 否 |
| 能改原变量 | 否 | 是 | 否 |
| 接受左值 | 是 | 是 | 是 |
| 接受右值 | 是 | 否 | 是 |

---

## 12. 面向对象编程入门

> 对应 LearnCpp 14.1 — Introduction to object-oriented programming

### 12.1 什么是面向对象

在"过程式编程"中，程序被组织为一系列函数，数据和函数是分开的。

在**面向对象编程（OOP）** 中：

- 数据和操作数据的函数被**打包在一起**，形成**对象**
- 对象是某个**类（class）** 的实例

### 12.2 OOP 的核心概念

- **封装（encapsulation）**：把数据和方法包在一起，隐藏内部细节
- **继承（inheritance）**：一个类可以继承另一个类的属性和方法（后面的周才学）
- **多态（polymorphism）**：同一个接口可以有不同实现（后面的周才学）

Week 2 主要学**封装**。

### 12.3 Python 对比

```python
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def bark(self):
        print(f"{self.name} says Woof!")
```

C++ 的类本质上和 Python 一样：把数据和行为绑定在一起。语法不同而已。

---

## 13. 类（Class）入门

> 对应 LearnCpp 14.2 — Introduction to classes

### 13.1 定义一个类

```cpp
class Complex {
    float re, im;          // 数据成员（默认 private）
public:
    // 成员函数会在后面的节里详细讲
};
```

### 13.2 为什么需要 class（而不是只用 struct）

struct 有一个问题：无法有效地保护**类不变量（class invariant）**。

**类不变量** 是指对象在整个生命周期内必须始终为真的条件。例如：

```cpp
struct Fraction {
    int numerator{0};
    int denominator{1};   // 不变量：denominator 不能为 0
};

Fraction f{5, 0};   // 糟糕！struct 无法阻止用户创建无效对象
```

struct 作为聚合体（aggregate），用户可以直接访问和设置任意值，无法防止创建无效状态的对象。**class** 通过 private 成员 + 构造函数来解决这个问题：构造函数可以验证参数是否合法。

### 13.3 类的基本结构

一个类包含：

- **数据成员（data members / member variables）**：存储数据
- **成员函数（member functions / methods）**：操作数据
- **访问控制**：`public` / `private`

### 13.3 创建对象

```cpp
Complex c1(1.5, 5.3);   // 创建一个 Complex 对象
Complex c2(2.5, 2.7);   // 再创建一个
```

每个对象有**自己的数据成员副本**，但**共享同一套成员函数**。

### 13.4 类 vs Python 类对比

| Python | C++ |
|--------|-----|
| `class Dog:` | `class Dog { };` |
| 成员默认 public | 成员默认 **private** |
| `self.name` | 直接用 `name`（有隐含的 `this`） |
| `__init__` | 构造函数（和类同名） |
| 动态添加属性 | 所有成员必须在类定义里声明 |

---

## 14. 成员函数

> 对应 LearnCpp 14.3 — Member functions  
> 结合课堂 PPT：The Hidden 'this' Parameter

### 14.1 定义成员函数

```cpp
class Complex {
    float re, im;
public:
    Complex add(Complex c) {
        return Complex(re + c.re, im + c.im);
    }
    
    void print(ostream& out) const {
        out << "(" << re << "+" << im << "i)";
    }
};
```

> 💡 **在类定义内部定义的成员函数是隐式 inline 的**，所以即使类定义在头文件中被多个 `.cpp` 文件 `#include`，也不会违反 ODR。这就是为什么简短的 getter/setter 函数通常直接写在类定义里。

### 14.2 隐藏的 this 参数

每个成员函数都有一个**隐藏的额外参数** `this`，它是一个指向调用对象的指针。

```cpp
void print(ostream& out) const {
    out << "(" << re << "+" << im << "i)";
    // re 其实是 this->re
    // im 其实是 this->im
}
```

类比 Python 的 `self`：

| Python | C++ |
|--------|-----|
| `self` 必须显式声明为第一个参数 | `this` 是隐藏的，不需要声明 |
| `self.re` | `re` 或 `this->re` |

### 14.3 调用成员函数

```cpp
Complex c1(1.0, 1.0);
Complex c2(2.0, 1.0);
Complex result = c1.add(c2);   // c1 是 this，c2 是参数 c
result.print(cout);             // result 是 this
```

用 `.` 运算符调用成员函数。点号左边的对象就是 `this`。

### 14.4 成员函数可以访问私有成员

成员函数可以访问**同类任何对象**的私有成员：

```cpp
Complex add(Complex c) {
    return Complex(re + c.re, im + c.im);
    //              ^         ^
    //              this->re  c.re（即使 re 是 private，也能访问 c 的 re）
}
```

这一点可能让人意外：`add` 函数不仅能访问 `this` 的 `re`，也能访问参数 `c` 的 `re`。**同类对象之间没有隐私**。

---

## 15. const 对象与 const 成员函数

> 对应 LearnCpp 14.4 — Const class objects and const member functions

### 15.1 const 对象

```cpp
const Complex c1(1.0, 2.0);   // c1 是 const 对象
// c1 的数据成员不能被修改
```

### 15.2 const 成员函数

如果一个成员函数**不会修改对象的数据成员**，就应该标记为 `const`：

```cpp
void print(ostream& out) const {   // 注意 const 的位置
    out << "(" << re << "+" << im << "i)";
}
```

`const` 写在参数列表后面、函数体前面。

### 15.3 为什么需要 const 成员函数

**const 对象只能调用 const 成员函数：**

```cpp
const Complex c(1.0, 2.0);
c.print(cout);    // OK：print 是 const 成员函数
// c.add(other);  // 如果 add 不是 const，就不能调用
```

规则：

- const 对象 → 只能调用 const 成员函数
- 非 const 对象 → 可以调用 const 和非 const 成员函数

### 15.4 最佳实践

**所有不修改对象状态的成员函数都应该声明为 const。**

这和 `const` 引用传参的思路一样：能加 `const` 就加 `const`，尽可能限制修改权限。

---

## 16. public 与 private 访问控制

> 对应 LearnCpp 14.5 — Public and private members and access specifiers  
> 结合课堂 PPT：Public or Private

### 16.1 三种访问级别

| 访问级别 | 访问修饰符 | 本类成员可访问？ | 派生类可访问？ | 类外可访问？ |
|---------|-----------|--------------|-------------|------------|
| Public | `public:` | 是 | 是 | 是 |
| Protected | `protected:` | 是 | 是 | 否 |
| Private | `private:` | 是 | 否 | 否 |

一个类可以按任意顺序、任意次数使用访问修饰符（例如先写一些 public 成员，再写 private 成员，再写更多 public 成员）。

### 16.2 语法

```cpp
class Complex {
private:              // 以下成员是私有的
    float re, im;
    
public:               // 以下成员是公开的
    Complex(float newRe = 0.0, float newIm = 0.0);
    Complex add(Complex c);
    void print(ostream& out) const;
};
```

### 16.3 class 的默认访问级别是 private

```cpp
class Foo {
    int x;      // 默认是 private
public:
    int y;      // 显式声明为 public
};
```

### 16.4 封装的类比

PPT 中的精彩比喻：

- **public**（接口）= 汽车的方向盘、油门、刹车 → 用户直接使用的部分
- **private**（实现）= 汽车的引擎、齿轮、燃油注入系统 → 内部细节，用户不需要也不应该直接碰

### 16.5 简单规则（Week 2 阶段）

- **数据成员设为 private**
- **大部分成员函数和构造函数/析构函数设为 public**
- **辅助函数（helper functions）可以设为 private**（比如 HW3 可能用到）

```cpp
class Stack {
    int _top;                       // private：数据成员
    char buf[STACK_CAPACITY];       // private：数据成员
public:
    Stack() { }                     // public：构造函数
    void push(char c) { }          // public：用户接口
    bool isFull() { }              // public：用户接口
};
```

---

## 17. 构造函数入门

> 对应 LearnCpp 14.9 — Introduction to constructors  
> 结合课堂 PPT：Defining a Constructor

### 17.1 什么是构造函数

**构造函数（constructor）** 是一种特殊的成员函数，在对象创建时**自动调用**。

用途：初始化对象的数据成员。

```cpp
class Complex {
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0)
        : re(newRe), im(newIm)     // 成员初始化列表
    {
        // 构造函数体（可以做其他事）
    }
};
```

### 17.2 构造函数的特殊性

- 函数名**和类名相同**
- **没有返回类型**（连 `void` 都不写）
- 对象创建时**自动调用**
- 可以有参数，也可以有默认参数
- **构造函数不能声明为 const**（因为它需要修改成员来初始化它们）

> ⚠️ **构造函数不负责创建对象**：编译器先分配内存，然后在这块未初始化的内存上调用构造函数。构造函数负责的是"初始化"，不是"创建"。但如果找不到匹配的构造函数，编译器会报错阻止对象创建。

### 17.3 默认构造函数

**默认构造函数** 是可以不带参数调用的构造函数：

```cpp
Complex();                              // 无参数
Complex(float newRe = 0.0, float newIm = 0.0);  // 所有参数有默认值，也可以无参调用
```

```cpp
Complex c1;              // 调用默认构造函数
Complex c2(1.0, 2.0);   // 调用带参构造函数
Complex c3{};            // 调用默认构造函数（brace initialization）
```

### 17.4 ⚠️ 注意：创建对象时不要加空括号

```cpp
Complex result;       // OK：调用默认构造函数
// Complex result();  // 错误！这会被解析为函数声明，不是创建对象！
Complex result{};     // OK：用花括号更安全
```

这是 C++ 的一个著名坑，叫做 **"most vexing parse"**。

### 17.5 圆括号：变量声明还是函数调用？

变量声明和函数调用都用圆括号，容易混淆。关键看：**前面有没有类型名？**

```cpp
ifstream in("input.txt");  // 前面有类型名 ifstream → 变量声明
in("input.txt");           // 前面没有类型名        → 函数调用
```

**规律：**

```cpp
类型名 变量名(参数);    // 变量声明 + 初始化
       函数名(参数);   // 函数调用
```

更多例子：

```cpp
int x(5);              // int 是类型    → 声明变量 x
square(5);             // 没有类型      → 调用函数 square

Complex c(1.0, 2.0);  // Complex 是类型 → 声明变量 c
c.add(other);          // 没有类型      → 调用成员函数 add
```

| 写法 | 前面有类型名？ | 是什么 |
|------|---------------|--------|
| `int x(5)` | 有 | 变量声明 |
| `square(5)` | 没有 | 函数调用 |
| `ifstream in("a.txt")` | 有 | 变量声明 |
| `in >> word` | 没有 | 使用变量 |

> 💡 前面有类型名 → 声明变量；没有类型名 → 调用函数。

### 17.6 何时调用构造函数

对象的生命周期：

```
1) 分配内存（Allocation）
2) 调用构造函数（Construction）← 这里
3) 对象存活期（使用对象）
4) 调用析构函数（Destruction）
5) 释放内存（Deallocation）
```

构造函数在分配内存之后、对象正式使用之前被调用。

### 17.7 Python 对比

```python
class Complex:
    def __init__(self, re=0.0, im=0.0):
        self.re = re
        self.im = im
```

```cpp
class Complex {
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0)
        : re(newRe), im(newIm) {}
};
```

| Python | C++ |
|--------|-----|
| `__init__(self, ...)` | `ClassName(...)` |
| `self.re = re` | `: re(newRe)` 初始化列表 |
| 始终有 `self` | 隐含 `this` |

---

## 18. 构造函数成员初始化列表

> 对应 LearnCpp 14.10 — Constructor member initializer lists

### 18.1 什么是成员初始化列表

成员初始化列表（member initializer list）是构造函数中，用于**直接初始化数据成员**的语法：

```cpp
Complex(float newRe, float newIm)
    : re(newRe), im(newIm)    // ← 这就是成员初始化列表
{
    // 函数体
}
```

写在 `:` 后面，用逗号分隔，在函数体 `{}` 之前。

### 18.2 初始化列表 vs 函数体内赋值

```cpp
// 方式一：成员初始化列表（推荐）
Complex(float newRe, float newIm)
    : re(newRe), im(newIm)
{ }

// 方式二：函数体内赋值（不推荐）
Complex(float newRe, float newIm)
{
    re = newRe;   // 这是赋值，不是初始化
    im = newIm;
}
```

区别：

- 初始化列表：直接**构造**成员（一步到位）
- 函数体赋值：先用默认值构造成员，然后再**赋值**覆盖（两步操作）

**始终优先使用成员初始化列表。** 有些类型（如 `const` 成员、引用成员）**必须**用初始化列表。

### 18.3 成员初始化的优先级

当构造对象时，每个成员按以下优先级初始化：

1. 如果成员出现在**成员初始化列表**中 → 用初始化列表中的值
2. 否则，如果成员有**默认成员初始化器（default member initializer）** → 用默认值
3. 否则 → 默认初始化（对基本类型意味着**不初始化**，是垃圾值！）

```cpp
class Foo {
    int m_x{};      // 默认成员初始化器：0
    int m_y{2};      // 默认成员初始化器：2
    int m_z;         // 无初始化器
public:
    Foo(int x)
        : m_x{x}    // m_x 用初始化列表的值（优先级 1）
    { }
    // m_y 没出现在列表中，用默认值 2（优先级 2）
    // m_z 没出现在列表中也没有默认值 → 未初始化！（优先级 3，危险！）
};

Foo foo{6};
// m_x = 6, m_y = 2, m_z = 垃圾值（undefined behavior if read）
```

### 18.4 初始化顺序

成员初始化的顺序**取决于声明顺序**，而不是初始化列表中写的顺序：

```cpp
class Foo {
    int a;    // 先声明 → 先初始化
    int b;    // 后声明 → 后初始化
public:
    Foo() : b(1), a(2) {}   // 尽管 b 写在前面，a 还是先初始化
};
```

**⚠️ 这可能导致严重 bug：**

```cpp
class Foo {
    int m_x{};
    int m_y{};
public:
    Foo(int x, int y)
        : m_y{std::max(x, y)}, m_x{m_y}   // 危险！
    { }
};

Foo foo{6, 7};
// m_x 先初始化（因为先声明），但用的是还未初始化的 m_y → m_x 是垃圾值！
// m_y 后初始化为 7
```

最佳实践：让初始化列表的顺序和声明顺序一致，避免用一个成员去初始化另一个成员。

---

## 19. 析构函数

> 结合课堂 PPT：Defining a Destructor

### 19.1 什么是析构函数

**析构函数（destructor）** 在对象销毁时**自动调用**，用于清理资源。

```cpp
class Complex {
    float re, im;
public:
    ~Complex() {   // 析构函数：波浪号 + 类名
        cout << "Complex number ";
        print(cout);
        cout << " is about to die.\n";
    }
};
```

### 19.2 析构函数的特点

- 名字是 `~ClassName`
- 没有参数
- 没有返回类型
- 每个类最多只有一个析构函数
- 对象离开作用域时自动调用

### 19.3 对象生命周期完整例子

```cpp
int main() {
    Complex c1(1.5, 5.3);   // c1 构造
    Complex c2(2.5, 2.7);   // c2 构造
    {
        Complex result;       // result 构造（默认值 0,0）
        result = c1.add(c2);  // 赋值（涉及临时对象的构造和析构）
    }                         // result 析构（离开内层作用域）
    c1 = Complex(2.0, 3.0);  // 创建临时对象，赋值给 c1，临时对象析构
    return 0;
}                             // c2 析构，c1 析构（后构造的先析构）
```

> ⚠️ 记住 Week 1 的重点：是 **Destruction**，不是 ~~Deconstruction~~。

---

## 20. 类与头文件的分离

> 对应 LearnCpp 15.2 — Classes and header files  
> 结合课堂 PPT：Declaring a Class / Defining Member Functions

### 20.1 典型的分离模式

一个类通常分成两个文件：

```
Complex.hpp — 类的声明
Complex.cpp — 成员函数的定义
```

### 20.2 头文件（.hpp）：类的声明

```cpp
// Complex.hpp
#ifndef COMPLEX_HPP
#define COMPLEX_HPP

#include <iostream>

class Complex {
private:
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0);
    Complex add(Complex c);
    void print(std::ostream& out) const;
};

std::ostream& operator<<(std::ostream& out, const Complex& c);

#endif
```

头文件包含：

- 类的**完整定义**（不只是前向声明！编译器需要看到完整定义才能计算对象大小和验证成员使用）
- 非成员函数的声明（如 `operator<<`）
- Header guard
- **简短的访问函数（getter/setter）可以直接在头文件中的类定义内实现**（它们是隐式 inline 的）

### 20.3 源文件（.cpp）：成员函数的定义

```cpp
// Complex.cpp
#include "Complex.hpp"

Complex::Complex(float newRe, float newIm)
    : re(newRe), im(newIm) {
}

Complex Complex::add(Complex c) {
    return Complex(re + c.re, im + c.im);
}

void Complex::print(std::ostream& out) const {
    out << "(" << re << "+" << im << "i)";
}
```

注意 **`::`（作用域解析运算符）** 的使用：

- `Complex::Complex(...)` → Complex 类的构造函数
- `Complex::add(...)` → Complex 类的 add 方法
- `void Complex::print(...)` → Complex 类的 print 方法

> ⚠️ 如果成员函数是 `const` 的，**声明和定义都必须写 `const`**：
> - 头文件中：`void print(std::ostream& out) const;`
> - 源文件中：`void Complex::print(std::ostream& out) const { ... }`

### 20.4 为什么要分离

- **编译效率**：改了 `.cpp` 只需重新编译该文件
- **接口清晰**：看 `.hpp` 就知道类有哪些功能
- **隐藏实现**：发布库时可以只给 `.hpp` 和编译后的 `.o`，不给 `.cpp`

### 20.5 使用该类

```cpp
// main.cpp
#include "Complex.hpp"

int main() {
    Complex one_i(1.0, 1.0);
    Complex two_i(2.0, 1.0);
    Complex result = one_i.add(two_i);
    result.print(cout);
}
```

---

## 21. class vs struct

> 结合课堂 PPT：class vs. struct

### 21.1 唯一的区别

```cpp
struct Complex {
private:             // struct 默认 public，所以要手动写 private
    float re, im;
public:
    // ...
};

class Complex {
    float re, im;    // class 默认 private，不用写
public:
    // ...
};
```

**唯一的区别：默认访问级别**

|   | `class` | `struct` |
|---|---------|----------|
| 默认访问级别 | `private` | `public` |

除此之外，`class` 和 `struct` 完全一样。

### 21.2 使用习惯

- 只有数据、没有复杂行为的简单类型 → 用 `struct`
- 有封装、有复杂行为的类型 → 用 `class`

---

## 22. 数组（C Arrays）—— 课堂 PPT 补充

> 来自 Week 2 课堂 PPT

### 22.1 数组作为函数参数

```cpp
void fill(int a[], int N) {
    for (int i = 0; i < N; ++i) {
        a[i] = i;
    }
}

void print(int a[], int N) {
    for (int i = 0; i < N; ++i) {
        cout << a[i] << ' ';
    }
    cout << endl;
}
```

**重点**：数组传参时实际上传的是指针（首元素的地址），所以在函数内修改数组**会影响原数组**。这相当于**自动按引用传递**。

### 22.2 数组初始化

```cpp
constexpr int len = 5;
int a[len] = {0};   // 所有元素初始化为 0
```

`= {0}` 的意思是：第一个元素设为 0，其余元素也被**零初始化**。

### 22.3 越界访问

```cpp
int a[5] = {0};
a[-1] = 0;     // undefined behavior!
a[5] = 999;    // 也是 undefined behavior!（有效索引是 0~4）
```

C++ 不会像 Python 那样抛异常，越界访问可能：

- 修改了其他变量的内存
- 程序崩溃
- "看起来没问题"但实际已经出错

### 22.4 range-based for 与数组参数

```cpp
int main() {
    constexpr int len = 5;
    string A[len] = {"Mo", "Tu", "We", "Th", "Fr"};
    
    for (auto s : A) cout << s;           // OK：在 main 中，编译器知道数组大小
    for (int i = 0; i < len; ++i) cout << A[i];  // OK
}

void f(string P[], int len) {
    // for (auto s : P) cout << s;        // 不行！数组传参后退化为指针，丢失了大小信息
    for (int i = 0; i < len; ++i) cout << P[i];  // OK：用索引遍历
}
```

**关键区别**：数组作为参数传入函数后，**退化（decay）为指针**，无法使用 range-based for。

### 22.5 char 作为数组索引

```cpp
int counts[26] = {0};   // 26 个字母的计数器

// 错误做法：
// ++counts['A'];  // 'A' 的 ASCII 值是 65，会越界！

// 正确做法：
char letter = 'C';
int index = letter - 'A';   // 'C' - 'A' = 2
++counts[index];             // 正确！
```

`char` 本质上是一个整数（ASCII 码），可以做算术运算。通过减去 `'A'`，将字母映射到 0~25 的范围。

---

## 23. C 风格字符串（C-style Strings）

> 来自 Week 2 课堂 PPT

### 23.1 什么是 C 风格字符串

C 风格字符串就是一个 `char` 数组，以 **空字符 `'\0'`** 结尾。

```cpp
char s[12] = "Hello World";   // 为什么是 12？因为 11 个字符 + 1 个 '\0'
char s2[] = "Hello World";    // 编译器自动计算大小为 12
char s3[12];                  // 未初始化！内容是垃圾值
char* s4 = "Hello World";    // 指向字符串字面量（不应该修改）
char* s5;                     // 未初始化的指针！危险！
```

**总结对比：**

| 声明 | 大小 | 初始化 | 安全？ |
|------|------|--------|--------|
| `char s[12] = "Hello World"` | 手动指定 12 | ✅ 有 | ✅ |
| `char s2[] = "Hello World"` | 自动推断 12 | ✅ 有 | ✅ |
| `char s3[12]` | 12 | ❌ 无 | ⚠️ 垃圾值 |
| `char *s4 = "Hello World"` | — | ✅ 有 | ⚠️ 不可修改 |
| `char *s5` | — | ❌ 无 | ❌ 野指针 |

### 23.2 物理长度 vs 逻辑长度

```
物理长度：数组分配的总大小（比如 128）
逻辑长度：实际有效字符数（到 '\0' 之前的字符数）
```

和 HW1 的 Stack 类似：数组有一个物理容量，但实际使用的部分可能更少。

### 23.3 遍历 C 风格字符串

```cpp
char s[128] = "Hello World";

// 方法 1：s.size() —— 不行！C 数组没有 .size() 方法
// for (int i = 0; i < s.size(); ++i)  // 编译错误

// 方法 2：strlen() —— 可以，但效率低（每次循环都要重新计算长度）
for (int i = 0; i < strlen(s); ++i)
    cout << s[i] << endl;

// 方法 3：range-based for —— 可以，但会遍历整个物理数组（包括 '\0' 之后的）
// for (auto c : s)  // 会遍历全部 128 个元素

// 方法 4：检查 '\0' —— 正确且高效
for (int i = 0; s[i] != '\0'; ++i)
    cout << s[i] << endl;

// 方法 5：用指针遍历 —— 正确且地道的 C 风格
for (char* p = s; *p != '\0'; ++p)
    cout << *p << endl;
```

方法 4 和方法 5 是最推荐的 C 风格字符串遍历方式。

### 23.4 C 数组、指针、vector 三者对比

| 特性 | **C 数组** | **指针** | **vector** |
|------|-----------|---------|-----------|
| 大小固定？ | ✅ 固定 | — | ❌ 可变 |
| 知道自己的长度？ | ❌ | ❌ | ✅ `.size()` |
| 传函数丢长度？ | ❌ 丢 | ❌ 丢 | ✅ 不丢 |
| range-for？ | 仅在定义处 | ❌ | ✅ |
| 安全性 | 低 | 最低 | 高 |

---

## 24. operator<< 重载与引用参数模式

> 结合课堂 PPT：Defining Inserter: operator<<

### 24.1 为什么要重载 operator<<

我们希望能这样输出自定义类型：

```cpp
Complex mySink(3.4, 2.2);
cout << "Sink at location: " << mySink << endl;
```

要实现这个，需要定义 `operator<<`。

### 24.2 operator<< 不能是成员函数

```cpp
// 必须定义为非成员函数！
ostream& operator<<(ostream& out, const Complex& c) {
    c.print(out);   // 调用类的 print 方法
    return out;      // 返回 ostream 引用，支持链式调用
}
```

**为什么不能是成员函数？** 因为 `cout << c` 的语法意味着左操作数是 `cout`（`ostream` 类型），而我们不能修改 `ostream` 类。

**另一种写法：`friend` 声明。** 上面的例子是委托给公有的 `print()` 方法，所以不需要访问私有成员。如果你更喜欢直接访问 `re` / `im` 而不走 `print()` 辅助函数，就在类里把 `operator<<` 声明为 **`friend`** —— 这样既能访问私有成员，又保持它是非成员函数：

```cpp
class Complex {
    float re, im;
public:
    Complex(float r = 0, float i = 0) : re(r), im(i) {}
    friend ostream& operator<<(ostream& out, const Complex& c);  // 授予访问 re/im 的权限
};

ostream& operator<<(ostream& out, const Complex& c) {
    return out << "(" << c.re << "+" << c.im << "i)";  // 直接访问私有成员
}
```

`friend` 方式和 `print()` 委托方式在行为上是等价的 —— 挑对你的类读起来更顺的那个就行。

### 24.3 为什么返回 ostream&

返回引用是为了支持**链式调用**：

```cpp
cout << "value: " << mySink << endl;
// 等价于：
((cout << "value: ") << mySink) << endl;
```

如果不返回引用，链式调用就断了。

### 24.4 参数中的 & 符号解析

```cpp
ostream& operator<<(ostream& out, const Complex& c)
```

- `ostream& out`：引用传递，因为 ostream 不能复制
- `const Complex& c`：const 引用传递，效率高且不修改 c
- 返回 `ostream&`：返回引用以支持链式调用

### 24.5 类似地，operator>> 重载

```cpp
istream& operator>>(istream& in, Complex& c) {
    c.read(in);     // 注意这里 c 不是 const，因为要修改它
    return in;
}
```

---

## 25. STL 容器初步：set 与 map

> 来自 Week 2 课堂 PPT（不在 Week 2 的 Assigned Reading 里，但课堂上讲过）。

### 25.1 set（集合）

```cpp
#include <set>

set<char> S;
for (char c = 'A'; c <= 'Z'; ++c)
    S.insert(c);

for (char c = 'Z'; c >= 'A'; --c)
    S.insert(c);   // 重复插入无效，set 自动去重

for (auto E : S)
    cout << E << endl;   // 输出 A~Z 各一次

if (S.find('A') != S.end())
    cout << "A is in there" << endl;

// C++20: contains() —— 比 find/end 对比更简洁
if (S.contains('A'))
    cout << "A is in there" << endl;
```

特点：

- 自动**去重**
- 元素自动**排序**
- 范围 for 遍历：`for (auto E : S)` —— 按排序顺序遍历
- 查找用 `find()`，返回迭代器
- `contains()`（C++20）：直接返回 `bool`，比 `find() != end()` 更简洁

类比 Python 的 `set`。类似 Python 的 `for x in S`，C++ 范围 for 也会遍历所有元素——但始终按排序顺序。

### 25.2 map（映射/字典）

```cpp
#include <map>
#include <string>

map<string, int> A;
A["Bill"] = 33;
A["George"] = 29;
A["Al"] = 27;

// C++17 之前：通过 .first / .second 访问键值
for (auto E : A)
    cout << E.first << " is " << E.second << " ";
// 输出: Al is 27 Bill is 33 George is 29（按 key 字母序排列）

// C++17：结构化绑定 —— 直接解包为 [key, value]
for (auto [name, age] : A)
    cout << name << " is " << age << " ";
// 输出相同，但可读性更好
```

```cpp
// 按键访问
cout << A["Bill"] << endl;      // 33 —— 键不存在时会自动插入默认值！
cout << A.at("Bill") << endl;   // 33 —— 键不存在时抛 std::out_of_range（更安全）

// C++20: contains()
if (A.contains("Bill"))
    cout << "Bill is in the map" << endl;
```

**各版本 C++ 写法演进：**

| 操作 | C++17 之前 | C++17+ | C++20+ |
|------|-----------|--------|--------|
| 遍历 | `for (auto E : A)` → `E.first`、`E.second` | `for (auto [k, v] : A)` —— 结构化绑定 | 同左 |
| 判断键是否存在 | `A.find(k) != A.end()` 或 `A.count(k)` | 同左 | `A.contains(k)` —— 直接返回 `bool` |
| 安全读取值 | `A.at(k)`（键不存在则抛异常） | 同左 | 同左 |
| 读取/自动插入 | `A[k]`（键不存在则插入默认值） | 同左 | 同左 |

特点：

- 键值对存储
- 按**键排序**
- 遍历：`for (auto [key, value] : A)`（C++17）或 `E.first`/`E.second`（旧写法）
- `operator[]` 在键不存在时会插入默认值；`at()` 则抛异常（只读访问更安全）
- `contains()`（C++20）：直接返回 `bool`，比 `find() != end()` 更简洁

类比 Python 的 `dict`，但 C++ 的 `map` 是有序的。

---

## 26. 文件 I/O 初步 → 已迁移至 Week 3 §12

> 📖 文件 I/O 在 Week 2 课堂 PPT 里只是作为预告提了一下，完整内容在 **Week 3 §12「基础文件 I/O」** —— 包括 6 个文件模式的完整对照表（`app` / `ate` / `binary` / `in` / `out` / `trunc`）、用 `|` 组合多模式、RAII 自动关闭、`>>` vs `getline` 的选用、错误检查、缓冲机制，以及 `std::endl` 的性能陷阱。

---

## 27. 综合速查表

### 引用速查

| 概念 | 语法 | 关键点 |
|------|------|--------|
| 左值引用 | `int& ref = x;` | 必须绑定左值，可修改 |
| const 引用 | `const int& ref = x;` | 可绑定左值/右值，不可修改 |
| 值传参 | `void f(int x)` | 复制，不影响原变量 |
| 引用传参 | `void f(int& x)` | 不复制，可修改原变量 |
| const 引用传参 | `void f(const int& x)` | 不复制，不可修改，最灵活 |

### 类（class）速查

| 概念 | 语法 | 关键点 |
|------|------|--------|
| 声明类 | `class Foo { };` | 默认 private |
| 构造函数 | `Foo(int x) : member(x) { }` | 和类同名，无返回类型 |
| 析构函数 | `~Foo() { }` | 波浪号 + 类名 |
| const 成员函数 | `void f() const { }` | const 对象只能调 const 函数 |
| 初始化列表 | `: a(x), b(y)` | 优先使用，效率更高 |
| 访问成员 | `obj.member` | 用点运算符 |
| 作用域解析 | `Foo::func()` | 在 .cpp 中定义成员函数 |

### 多文件速查

| 元素 | 放在哪里 | 说明 |
|------|---------|------|
| 函数声明 | `.h` / `.hpp` | 加 header guard |
| 函数定义 | `.cpp` | `#include` 对应头文件 |
| 类声明 | `.hpp` | 包含所有成员声明 |
| 成员函数定义 | `.cpp` | 用 `ClassName::` 限定 |

### 传参方式选择速查

```
要修改原变量吗？
├── 是 → void f(Type& x)
└── 否 → 是基本类型（int, double, char, bool）吗？
    ├── 是 → void f(Type x)        // 值传递
    └── 否 → void f(const Type& x) // const 引用
```

### Python vs C++ 对比（Week 2 新增）

| Python | C++ | 说明 |
|--------|-----|------|
| `import module` | `#include "module.h"` | 模块/头文件 |
| 自动防重复导入 | 需要 header guard | `#ifndef` / `#pragma once` |
| `self` | `this`（隐含） | 当前对象引用/指针 |
| `__init__` | `ClassName(...)` | 构造函数 |
| `del obj` 或自动 GC | `~ClassName()` | 析构函数 |
| `class Foo:` | `class Foo { };` | 定义类 |
| 成员默认 public | 成员默认 **private** | 访问控制 |
| `dict` | `map<K,V>` | 映射（C++ 有序） |
| `set` | `set<T>` | 集合（C++ 有序） |
| 没有引用概念 | `int& ref = x;` | 变量别名 |
| 无 const 概念 | `const int x{5};` | 编译器保护不可修改 |

**Week 2 最重要的五条记忆：**

1. **引用是别名，不是副本**：`int& ref = x` 让 `ref` 和 `x` 成为同一个东西
2. **传参优先用 const 引用**：大对象用 `const Type&`，基本类型用值传递
3. **class 默认 private，struct 默认 public**：这是唯一区别
4. **构造函数用成员初始化列表**：`: member(value)` 比函数体内赋值更好
5. **const 成员函数承诺不修改对象**：不修改数据的函数一定要加 `const`
