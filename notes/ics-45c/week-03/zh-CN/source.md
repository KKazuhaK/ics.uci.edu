# Information and Computer Science 45C — Week 3 整合 Reading 笔记

## 目录

- [1. std::string 入门](#1-stdstring-入门)
- [2. std::string_view 入门](#2-stdstring_view-入门)
- [3. 引用返回与地址返回](#3-引用返回与地址返回)
- [4. 默认构造函数与默认参数](#4-默认构造函数与默认参数)
- [5. C 风格数组入门](#5-c-风格数组入门)
- [6. C 风格数组退化（Array Decay）](#6-c-风格数组退化array-decay)
- [7. 指针运算与下标访问](#7-指针运算与下标访问)
- [8. C 风格字符串](#8-c-风格字符串)
- [9. 运算符重载入门](#9-运算符重载入门)
- [10. I/O 运算符重载](#10-io-运算符重载)
- [11. 用成员函数重载运算符](#11-用成员函数重载运算符)
- [11B. 对象生命周期走查 —— 课堂 PPT 补充](#11b-对象生命周期走查--课堂-ppt-补充)
- [12. 基础文件 I/O](#12-基础文件-io)
- [13. 代码覆盖率（测试）](#13-代码覆盖率测试)
- [14. C++ 中常见的语义错误](#14-c-中常见的语义错误)
- [15. 错误的检测与处理](#15-错误的检测与处理)
- [16. 自定义 String 类 —— 课堂 PPT 补充](#16-自定义-string-类--课堂-ppt-补充)
- [17. static 关键字](#17-static-关键字)
- [18. 综合速查表](#18-综合速查表)

> UCI ICS 45C: Programming in C++ (35770)  
> 本笔记整合了 Week 3 Assigned Reading（LearnCpp 章节）与课堂 PPT（Classes、Strings），按学习顺序整理。

---

## 1. std::string 入门

> 对应 LearnCpp 5.7 — Introduction to std::string

### 1.1 为什么用 std::string 而不是 C 风格字符串？

C 风格字符串变量（`char` 数组）用起来很麻烦：不能用 `=` 重新赋值，复制太长的字符串还会引发未定义行为。`std::string` 帮你自动搞定这一切。

```cpp
#include <string>

std::string name{"Alex"};  // 初始化
name = "John";             // 重新赋值 —— 正常工作！
name = "A much longer name than before";  // 也正常 —— 自动扩容
```

**Python 对比：** `std::string` 行为很像 Python 的 `str`，区别在于 C++ 字符串是**可变的**（你可以修改单个字符）。

### 1.2 字符串输入：>> vs getline()

`std::cin >> str` 只读**一个单词**（遇到空白就停）。想读整行，用 `std::getline()`：

```cpp
std::string name{};
std::getline(std::cin >> std::ws, name);  // 读整行，跳过前导空白
```

> ⚠️ **`std::ws` 陷阱：** 如果你混用 `cin >>` 和 `getline()`，输入缓冲区残留的 `'\n'` 会让 `getline` 读到空字符串。始终把 `std::cin >> std::ws` 作为 `getline` 的第一个参数来吃掉前导空白。

```cpp
int choice{};
std::cin >> choice;             // 在缓冲区留下 '\n'

std::string name{};
std::getline(std::cin >> std::ws, name);  // std::ws 吃掉残留的 '\n'
```

### 1.3 深入：std::ws

`std::ws` 是一个 **I/O 操纵符（manipulator）** —— 和 `std::endl`、`std::setw`、`std::setprecision` 属于同一家族。它定义在 `<istream>` 里（通常通过 `<iostream>` 间接引入）。

**它做什么：** 当被插入到输入流中时，它会消耗**前导**空白字符（空格、制表符、换行符），直到遇到非空白字符或 EOF 为止。仅此而已 —— 它**不会**跳过中间或末尾的空白。

```cpp
std::cin >> std::ws;  // 丢弃缓冲区开头的所有空白字符
```

**为什么偏偏 `getline` 需要它？**

`>>` 运算符有一个叫 `std::skipws` 的 flag，对输入流**默认开启**。这就是为什么下面这段代码不用动脑就能正确工作：

```cpp
int a, b;
std::cin >> a >> b;  // "  42   7  " → a=42, b=7（skipws 自动处理空白）
```

但 `std::getline()` 不同 —— 它**不会**参考 `skipws`。它会一路读到（并包括）第一个 `'\n'`，所以缓冲区里任何残留的 `'\n'` 都会让它立即以空字符串结束：

```cpp
int age;
std::string name;
std::cin >> age;              // 读入 42，'\n' 留在缓冲区
std::getline(std::cin, name); // 读到空字符串（只读到那个游离的 '\n'）！❌
```

把 `std::cin >> std::ws` 作为 `getline` 的第一个参数，可以在读取前吃掉那个残留的 `'\n'`（以及其他任何空白）：

```cpp
std::cin >> age;
std::getline(std::cin >> std::ws, name);  // ✅ 先吃掉 '\n'，再读真正的名字
```

**核心要点：** 只在 `getline`（或其他不会自动跳空白的输入操作）上用 `std::ws`。对于读入基本类型或字符串的 `>>`，它是多余的。

| 输入操作 | 需要 `std::ws`？ | 原因 |
|---------|---------------|------|
| `cin >> int_var` | ❌ | `skipws` flag 默认开启 |
| `cin >> string_var` | ❌ | `operator>>` 自动跳过前导空白 |
| `cin >> char_var` | ❌ | 同上 |
| `getline(cin, str)` | ✅（混用 `>>` 时） | `getline` **不**跳空白 |
| `cin.get()` / `cin.get(ch)` | ✅（如果想跳过） | 这些函数读取原始字符，包括空白 |

> ⚠️ **注意：** `std::ws` 只跳过**前导**空白。如果你想读 `"  hello  "` 并去掉两端空白，`std::ws` 只能处理前面 —— 末尾的空白需要你自己处理（例如读取后再手动擦除尾部空格）。

> 💡 **Python 对比：** `std::cin >> std::ws` 大致相当于对输入流调用 `.lstrip()` —— 只剥掉前导空白，其他内容原样保留。

### 1.4 常用 std::string 操作

```cpp
std::string s{"Hello"};
s.size();       // 5（和 s.length() 等价）
s[0];           // 'H'
s[0] = 'J';     // s 变为 "Jello"
s + " World";   // 拼接 → "Jello World"
s.empty();      // false
```

> 💡 `std::string` 内部使用**动态内存分配**，可以按需增大缩小，但这也让它在某些场景下比定长 C 风格字符串慢一些。

### 1.5 std::string 字面量（`s` 后缀）

`"hello"` 这样的双引号字符串字面量默认是 **C 风格字符串** —— 类型是 `const char*`，而不是 `std::string`。想要真正的 `std::string` 字面量，在字面量后加 `s` 后缀即可（`s` 必须小写）：

```cpp
#include <iostream>
#include <string>

int main() {
    using namespace std::string_literals;  // 引入 `s` 后缀

    std::cout << "goo\n";     // C 风格字面量（const char*）
    std::cout << "foo\n"s;    // std::string 字面量
    std::cout << "moo\n"s;    // std::string 字面量
}
```

`s` 后缀定义在 `std::literals::string_literals` 命名空间中。LearnCpp 的建议：**在需要它的函数内部**写 `using namespace std::string_literals;`，不要写在文件作用域 —— 因为 `using namespace` 写在头文件或顶层会把标识符泄露到你没打算污染的地方。

**它什么时候真的重要？**

大部分情况下你不需要它，因为初始化时会自动转换：

```cpp
std::string name{"Alex"};     // 不需要后缀 —— 构造函数会把 const char* 转成 std::string
void foo(std::string s);
foo("hello");                 // 也没问题 —— 隐式转换
```

但是当编译器需要把类型推导为 `std::string` 而不是 `const char*` 时，`s` 后缀就是**必需**的：

```cpp
auto s1 = "hello";   // ⚠️ 类型是 const char*，不是 std::string
auto s2 = "hello"s;  // ✅ 类型是 std::string
```

在模板代码里，如果模板参数需要在推导发生前就已经是 `std::string`，也会用到。

> 💡 **进阶：** `"hello"s` 大致等价于 `std::string{"hello", 5}` —— 从底层的 C 风格字面量构造一个临时的 `std::string`（长度为 5，不含空终止符）。

> 💡 **std::string_view 的平行写法：** 还有一个 `sv` 后缀，定义在 `std::literals::string_view_literals` 中，用于创建 `std::string_view` 字面量：`auto sv = "hello"sv;`。用法和 `s` 一样，推荐同样的做法 —— 在函数内部写 `using namespace std::string_view_literals;`。

---

## 2. std::string_view 入门

> 对应 LearnCpp 5.8 — Introduction to std::string_view

### 2.1 问题：std::string 拷贝代价高

```cpp
void printString(std::string s) {  // ⚠️ 每次调用都拷贝！
    std::cout << s;
}

std::string name{"A very long name..."};
printString(name);  // 拷贝 #1
printString(name);  // 拷贝 #2 —— 浪费
```

每次调用都会完整拷贝字符串内容。对短字符串开销可以忽略，但对长字符串来说，每次调用都要付出真实的代价。

### 2.2 std::string_view：非拥有型视图

C++17 在 `<string_view>` 中引入了 `std::string_view`。它是对已有字符串的**只读视图** —— 内部只存一个指针和一个长度，不持有任何自己的数据。

```cpp
#include <string_view>

void printString(std::string_view s) {  // 便宜 —— 不拷贝
    std::cout << s;
}

std::string name{"A very long name..."};
printString(name);                      // ✅ 视图指向 name
printString("literal");                 // ✅ 视图指向字符串字面量
printString(std::string{"temporary"});  // ✅ 视图指向临时 std::string
```

`string_view` 很灵活：可以从 `std::string`、C 风格字符串（`const char*`）或字符串字面量构造。

**Python 对比：** `std::string_view` 类似于 Python 的切片 `s[start:end]` —— 它借用已有数据上的一段窗口，而不是拷贝。

### 2.3 关键点：非拥有

`string_view` **不拥有**它所指向的数据。底层字符串必须**比视图存活得更久**：

```cpp
std::string_view getView() {
    std::string s{"Hello"};  // 局部 std::string
    return s;  // ❌ 悬垂视图 —— 函数返回时 s 就销毁了
}
```

```cpp
std::string_view sv;
{
    std::string s{"Hello"};
    sv = s;  // sv 指向 s
}  // s 在这里销毁
std::cout << sv;  // ❌ 悬垂 —— 未定义行为
```

> ⚠️ **经验原则：** 除非你能确信底层数据比视图更长寿，否则永远不要把 `string_view` 作为类成员或函数返回值。

### 2.4 按值传递，不要按引用

`std::string_view` 很小（通常 16 字节：指针 + 长度）。**按值**传，不要按引用传：

```cpp
void good(std::string_view s);          // ✅ 按值传
void bad(const std::string_view& s);    // ❌ 多此一举 —— 本来也不拷贝什么
```

### 2.5 常用操作

```cpp
std::string_view s{"Hello World"};
s.size();           // 11
s.length();         // 11（和 size 等价）
s[0];               // 'H'
s.substr(6, 5);     // "World" —— 仍然是视图，无拷贝
s.remove_prefix(6); // 现在视图是 "World"
s.remove_suffix(1); // 现在视图是 "Worl"
s == "Worl";        // true
```

> 💡 `.remove_prefix()` 和 `.remove_suffix()` 通过推进 / 回缩视图边界来"缩小视图"，并不修改底层数据。

### 2.6 什么时候用哪个

| 使用场景 | 首选类型 |
|---------|---------|
| 函数参数（只读） | `std::string_view` |
| 成员变量（拥有数据） | `std::string` |
| 返回值（字符串是你造出来的） | `std::string` |
| 返回值（视图指向已有数据） | `std::string_view` ⚠️ 注意生命周期 |
| 临时拼接（`s1 + s2`） | `std::string`（string_view 不支持拼接） |

> 💡 **现代 C++ 原则：** 只读的字符串参数优先用 `std::string_view`。只在需要所有权或修改时才用 `std::string`。

### 2.7 陷阱：不保证空终止

`std::string_view` 本质上就是"指针 + 长度" —— 它**不保证**所指向的数据是空终止的。所以你不能安全地把 `sv.data()` 传给期望 `const char*` 的 C 接口：

```cpp
std::string_view sv{"Hello World"};
auto sub = sv.substr(0, 5);    // 视图是 "Hello"
printf("%s\n", sub.data());    // ❌ 会打印 "Hello World" —— 位置 5 处没有 '\0'！
```

如果你需要把空终止字符串传给 C 接口，就转回 `std::string`：

```cpp
std::string s{sub};
printf("%s\n", s.c_str());     // ✅ s.c_str() 保证空终止
```

> ⚠️ **记住：** `std::string::c_str()` 保证空终止；`std::string_view::data()` 不保证。

---

## 3. 引用返回与地址返回

> 对应 LearnCpp 12.12 — Return by reference and return by address

### 3.1 为什么要引用返回？

按值返回类类型会产生拷贝，开销可能很大。引用返回可以避免这次拷贝：

```cpp
const std::string& getProgramName() {
    static const std::string s_programName{"Calculator"};
    return s_programName;  // 返回引用 —— 无拷贝
}
```

### 3.2 悬垂引用的危险

被返回的对象**必须比函数存活得更久**。返回局部变量的引用是未定义行为：

```cpp
const std::string& getProgramName() {
    const std::string name{"Calculator"};  // 局部变量
    return name;  // ❌ 悬垂引用 —— 函数结束时 name 就销毁了
}
```

> ⚠️ **原则：** 永远不要按引用返回非 static 局部变量或临时对象。编译器通常会警告，但复杂情况下不一定能捕获。

### 3.3 生命周期延长不会跨越函数边界

```cpp
const int& returnByConstRef() {
    return 5;  // 临时对象 —— 函数结束时销毁
}

int main() {
    const int& ref{returnByConstRef()};  // 悬垂！
    std::cout << ref;  // 未定义行为
}
```

尽管 `const int&` 通常会延长临时对象的生命周期，这种延长**不会跨越函数边界**。

### 3.4 什么时候该引用返回

| 情况 | 返回方式 | 示例 |
|-----|---------|------|
| 计算出的新值 | 按值 | `int sum(int a, int b)` |
| static 局部 / 成员变量 | const 引用 | `const std::string& getName()` |
| 按引用传入的参数 | 引用（生命周期相同） | `ostream& operator<<(ostream& out, ...)` |
| 局部变量 | ❌ 永远不要按引用返回 | — |

---

## 4. 默认构造函数与默认参数

> 对应 LearnCpp 14.11 — Default constructors and default arguments

### 4.1 什么是默认构造函数？

**默认构造函数**是指可以在不传任何参数的情况下被调用的构造函数。它可以是：

1. 没有参数的构造函数
2. 所有参数都有默认值的构造函数

```cpp
class Complex {
    float re, im;
public:
    Complex(float newRe = 0.0, float newIm = 0.0)  // 默认构造函数（所有参数都有默认值）
        : re(newRe), im(newIm) {}
};

Complex c1{};        // 调用 Complex(0.0, 0.0)
Complex c2{1.0, 2.0}; // 调用 Complex(1.0, 2.0)
```

### 4.2 隐式 vs 显式默认构造函数

如果你**完全不写任何构造函数**，编译器会帮你生成一个**隐式默认构造函数**：零参数、无成员初始化列表、空函数体。它唯一的作用就是让 `Foo foo{};` 能编译过。它**只在类没有任何用户声明的构造函数时**才会被生成。

如果你写了任何非默认构造函数（比如 `Foo(int x)`），编译器就会**停止**生成隐式默认构造函数 —— 此时 `Foo foo{};` 变成编译错误。想要默认构造函数回来但又不想手写空函数体，就用 **`= default`**：

```cpp
class Foo {
public:
    Foo() = default;     // 显式声明的默认构造函数
    Foo(int x, int y);   // 非默认构造函数
};

Foo f1{};           // ✅ 使用 Foo() = default
Foo f2{1, 2};       // ✅ 使用 Foo(int, int)
```

### 4.3 `= default` vs `Foo() {}`：行为差异

这两种写法看起来几乎一样 —— 都能给你一个无参构造函数 —— 但它们的行为有一个可能让你踩坑的差异：

```cpp
class Written {
    int m_a;      // 没有默认初始化器
    int m_b{};    // 有默认初始化器
public:
    Written() {}            // 用户手写的空函数体
};

class Defaulted {
    int m_a;      // 没有默认初始化器
    int m_b{};    // 有默认初始化器
public:
    Defaulted() = default;  // 显式 defaulted
};

Written w{};      // w.m_a 里是什么？
Defaulted d{};    // d.m_a 里是什么？
```

| 成员 | `Written w{}` | `Defaulted d{}` |
|------|---------------|-----------------|
| `m_a`（无初始化器） | **未初始化**（垃圾值！） | **零初始化**为 0 |
| `m_b{}` | 0（来自它自己的初始化器） | 0（来自它自己的初始化器） |

**为什么会有差异？** 对一个默认构造函数是**隐式或 `= default`** 的类做值初始化（`{}`）时，C++ 会**先把所有成员零初始化**，然后再运行构造函数。但当你自己写 `Foo() {}` 时，编译器把它当作**用户定义的**构造函数，**跳过**零初始化那一步 —— 它假设你的函数体里会自己处理好初始化。

> ⚠️ **为什么要在意这个：** 如果你写 `Foo() {}` 以为它和 `= default` 等价，那么没有显式默认初始化器的成员就会是垃圾值。这是一个静默的 bug —— 编译不报错，运行时却在读未初始化的内存。

> ✅ **最佳实践：** 从以下两种安全模式里选一个：
> 1. 用 `Foo() = default;`，让编译器生成它
> 2. 或者给**每个数据成员**都写默认成员初始化器（`int m_b{};`）
>
> 如果你做了 #2，`= default` 和 `{}` 的差异就无害了 —— 但 #1 仍然更推荐，因为它的意图更清晰。

### 4.4 歧义陷阱

一个类只应该有**一个**默认构造函数。有两个会引发歧义：

```cpp
class Foo {
public:
    Foo() {}
    Foo(int x = 1, int y = 2) {}  // 这也是默认构造函数！
};

Foo f{};  // ❌ 编译错误：歧义
```

### 4.5 值初始化 vs 默认初始化

```cpp
Foo foo{};   // 值初始化 —— 推荐 ✅
Foo foo2;    // 默认初始化 —— 对聚合类型不够安全
```

> ⚠️ **最佳实践：** 对类类型始终使用 `{}`（值初始化）。

### 4.6 什么时候**不应该**提供默认构造函数

仅仅因为你**能**提供默认构造函数，并不代表你**应该**提供。只有当类有一个**语义上合理的默认状态**时，默认构造函数才有意义。

**适合的例子 —— `Fraction`：** 零是一个完全合理的默认值。

```cpp
class Fraction {
    int m_num{0};
    int m_den{1};
public:
    Fraction() = default;                                    // ✅ 0/1 有意义
    Fraction(int n, int d) : m_num{n}, m_den{d} {}
};

Fraction f{};  // ✅ 零分数
```

**不适合的例子 —— `Employee`：** 一个没有名字和工号的员工是没有意义的，所以我们**故意不**提供默认构造函数。

```cpp
class Employee {
    std::string m_name;
    int m_id;
public:
    // 没有默认构造函数 —— 是故意省略的
    Employee(std::string name, int id)
        : m_name{std::move(name)}, m_id{id} {}
};

Employee e{};  // ❌ 编译错误 —— 这正是我们想要的！
```

编译错误是你的朋友：它能在编译期就抓到误用，而不是让你在运行时拿到一个半成品对象。

> 💡 **设计原则：** 默认构造函数是一种便利，不是义务。只有当默认构造出的对象对某人真正有用时，才提供它。

---

## 5. C 风格数组入门

> 对应 LearnCpp 17.7 — Introduction to C-style arrays

### 5.1 声明与初始化

C 风格数组是语言核心内置的 —— 不需要 `#include`。长度必须是**常量表达式**（编译期已知），而且**至少为 1**（栈上不允许零长度数组）：

```cpp
int arr1[5]{};                   // 5 个零初始化的 int
int arr2[4]{1, 2};               // 部分初始化 —— 剩余元素被零初始化 → {1, 2, 0, 0}
constexpr int len{5};
int arr3[len]{};                 // 长度可以是 constexpr 命名常量

int bad1[3];                     // ⚠️ 默认初始化 —— 元素是垃圾值（不是零！）
int n{5};
int bad2[n];                     // ❌ 报错 —— n 不是 constexpr（VLA 不是标准 C++）
```

> ⚠️ **默认初始化 vs 值初始化：** `int arr[3];` 让元素保持**未初始化**状态（垃圾值）。`int arr[3]{};` 会**零初始化**。想要零值时**必须**加 `{}`。

**`const` 和 `constexpr` 数组：** 数组可以像其他变量一样加限定符。`const` 数组必须在声明时初始化；`constexpr` 数组可以在常量表达式中使用：

```cpp
const int primes[]{2, 3, 5, 7, 11};          // const —— 元素不可修改
constexpr int squares[5]{1, 4, 9, 16, 25};   // 可在常量表达式中使用
```

**Python 对比：** 类似于定长、单一类型的 Python `list`。没有 `append()` —— 大小在编译期就固定了。

### 5.2 长度推导

当你显式初始化每个元素时，可以**省略长度**让编译器自己数：

```cpp
int a[]{1, 2, 3, 4, 5};   // 推导长度 = 5
int b[] = {10, 20, 30};   // 这种写法也可以
```

> ✅ **最佳实践：** 当你显式初始化每个元素时，优先省略长度。这样加减元素时就不用同步维护长度 —— 不会出现长度和实际内容对不上的情况。

> ⚠️ **陷阱：** 空花括号和省略长度**不能**组合 —— `int arr[]{};` 是零长度数组，不合法。要么提供长度（`int arr[5]{};`），要么提供初始化器。

### 5.3 下标访问

数组从 0 开始编号。下标可以是**任何整数类型** —— 有符号、无符号，或无作用域枚举。和标准库容器不同，这里不会报符号转换警告：

```cpp
int arr[5]{9, 7, 5, 3, 1};
arr[0];      // 9
arr[4];      // 1
arr[5];      // ❌ 未定义行为 —— 没有边界检查！

unsigned u{2};
arr[u];      // ✅ 5 —— 无符号下标也可以
arr[-1];     // ❌ 未定义行为（但能静默编译通过）
```

> ⚠️ C 风格数组**不做**边界检查。任何越界访问 —— 正的或负的 —— 都是未定义行为，编译器不会报错。

> 💡 **声明 vs 下标 —— 同样的符号，完全不同的东西：** `int arr[5]` 里的 `[]` 是**声明语法**的一部分，意思是"这是一个 5 个 int 的数组"。`arr[3]` 里的 `[]` 才是**下标运算符**，用来读写元素。不要混淆这两者。

### 5.4 用 char 当下标

> 📖 **见 Week 2 §16.5** —— `int counts[26]{0}; index = letter - 'A'; ++counts[index];` 这个按字母计数的惯用法，以及"不要直接用字面字符做下标"的警告（`'A'` 的 ASCII 是 65，远远越界）。

### 5.5 获取数组的长度

**`sizeof(arr)`** 返回的是**总字节数**，**不是**元素个数：

```cpp
int arr[5]{};
sizeof(arr);       // 20（在 int 为 4 字节的系统上）
sizeof(arr[0]);    // 4
```

C 风格数组**没有任何额外开销** —— 它的内存正好是 `长度 × sizeof(元素)`。所以 C 时代常见的求元素个数的公式是：

```cpp
// 老写法（只对未退化的数组有效）
size_t n = sizeof(arr) / sizeof(arr[0]);  // 5
```

**从 C++17 开始**引入了 **`std::size(arr)`**，更安全也更清晰：

```cpp
#include <iterator>  // 或者 <array>、<vector>

int arr[5]{};
std::size(arr);   // 5 —— 返回 std::size_t（无符号）
std::ssize(arr);  // 5 —— C++20，返回有符号类型
```

> ✅ **最佳实践：** 优先用 `std::size(arr)` 而不是 `sizeof(arr) / sizeof(arr[0])`。它意图更清晰，而且 —— 关键是 —— 如果"数组"已经退化成指针，它会**编译报错**（而不是像老公式那样静默返回错误答案）。为什么这一点重要见第 6 章。

**`std::size` vs `std::ssize` —— C++20 为什么还要加一个有符号版本？**

两个函数返回的是同一个值，只是**类型不同**。`std::size` 返回 `std::size_t`（**无符号**），`std::ssize` 返回有符号类型（通常是 `std::ptrdiff_t`）。加一个有符号版本的理由是**无符号下溢陷阱**：

```cpp
int empty[0];  // 或者一个恰好是空的 std::vector
for (auto i = std::size(empty) - 1; i >= 0; --i)   // 💥 死循环！
    // size() 是 0，然后 0 - 1 对无符号类型会回绕成 SIZE_MAX（约 40 亿）
```

只要你对一个 `size_t` 做减法让结果跌破零，它就会**回绕成一个巨大的正数**（见第 14 章的"死循环"）。反向迭代和任何 `size - offset` 算术都是常见受害者。有符号版本干净地绕开了这个问题：

```cpp
for (auto i = std::ssize(arr) - 1; i >= 0; --i)   // ✅ 有符号 —— 真的可以是 -1
    std::cout << arr[i];
```

有符号和无符号在比较时混用也是一个常见 bug 源：`int i < std::size(arr)` 会触发 `i` 的隐式符号转换，编译器会报警告。用 `std::ssize` 让所有值都是有符号的，直接消除这类警告。

> ✅ **什么时候用哪个：**
> - **`std::size`** 当你只是需要把个数传给期望 `size_t` 的地方（比如 `arr + std::size(arr)` 用在指针运算里，或者传给 STL API）。
> - **`std::ssize`** 当你要做可能跌破零的算术或比较 —— **反向迭代**、`size - offset`、把 `int i` 和 size 做比较等等。
>
> 一些权威来源的建议（Google 风格指南、Bjarne Stroustrup 的 C++ Core Guidelines）都倾向于**在新代码里优先使用 `std::ssize`**，专门用来避开整个家族的无符号 bug。

### 5.6 数组不支持赋值

和 Python 列表或 `std::vector` 不同，C 风格数组**声明之后不能重新赋值**：

```cpp
int arr[3]{1, 2, 3};
arr = {4, 5, 6};   // ❌ 编译错误 —— 数组不可赋值
int other[3]{7, 8, 9};
arr = other;       // ❌ 同样编译错误
```

如果你要替换内容，必须逐元素拷贝（或者用 `std::copy`）：

```cpp
int src[3]{4, 5, 6};
for (int i = 0; i < 3; ++i)
    arr[i] = src[i];

// 或者：
#include <algorithm>
std::copy(std::begin(src), std::end(src), std::begin(arr));
```

如果你真的需要"可以重新赋值的序列"，用 **`std::vector`**（动态）或 **`std::array`**（定长但可赋值）。

### 5.7 与 std::array / std::vector 的关键区别

| 特性 | C 风格数组 | `std::array` | `std::vector` |
|------|-----------|--------------|---------------|
| 大小 | 定长，编译期 | 定长，编译期 | 动态 |
| 边界检查 | ❌ 无 | 仅 `.at()` | 仅 `.at()` |
| 自己知道长度 | ❌（退化后丢失） | ✅ `.size()` | ✅ `.size()` |
| 可赋值（`arr = ...`） | ❌ | ✅ | ✅ |
| 安全传给函数 | ❌ 退化成指针 | ✅ | ✅ |
| 支持 `auto` / CTAD | ❌ | ✅ | ✅ |

---

## 6. C 风格数组退化（Array Decay）

> 对应 LearnCpp 17.8 — C-style array decay

### 6.1 什么是数组退化？

当 C 风格数组出现在大多数表达式中时，会**隐式转换**成指向首元素的指针。这就叫**数组退化（array decay）**。

```cpp
int arr[5]{9, 7, 5, 3, 1};
auto ptr = arr;  // ptr 是 int*，指向 arr[0]
// arr 的类型是 int[5]，但 ptr 的类型是 int*
```

> 💡 **关键点：** 退化后的指针**丢失了数组的长度信息**。这就是"退化"这个名字的来源 —— 类型信息丢了。

### 6.2 退化为什么存在：把数组传给函数

退化解决了两个问题：
1. **避免昂贵的拷贝** —— 只传一个指针，而不是整个数组
2. **允许不同长度的数组** —— `int[5]` 和 `int[7]` 都退化为 `int*`

```cpp
void printFirst(const int* arr) {  // 收一个指针
    std::cout << arr[0];
}

int a[5]{1, 2, 3, 4, 5};
int b[3]{10, 20, 30};
printFirst(a);  // 正常 —— 传入指向 a[0] 的指针
printFirst(b);  // 正常 —— 传入指向 b[0] 的指针
```

> ⚠️ **关键后果：** 函数内部根本不知道数组有多长。你必须把长度作为单独的参数传进去：

```cpp
void fill(int a[], int N) {       // int a[] 是 int* a 的语法糖
    for (int i = 0; i < N; ++i)
        a[i] = i;
}
```

### 6.3 什么时候数组不会退化

数组在以下场合**不会**退化：`sizeof()`、`typeid()`、`operator&`、按引用传递、作为类成员。

### 6.4 range-based for 与退化

> 📖 **见 Week 2 §16.4** —— range-based for 对未退化的数组（比如 `main()` 里声明的数组）能正常工作，但**一旦数组作为参数退化成指针就会失败**。Week 2 那节还演示了退化后仍然能用的 index-based 替代写法。（和 7.5 节相互呼应：range-for 底层就是指针运算，所以它处理不了裸指针。）

---

## 7. 指针运算与下标访问

> 对应 LearnCpp 17.9 — Pointer arithmetic and subscripting

### 7.1 指针运算基础

指针支持四个整数运算符：**`+`**、**`-`**、**`++`**、**`--`**。每个都按**对象**移动，不是按字节：

```cpp
int arr[5]{9, 7, 5, 3, 1};
int* ptr{arr};        // 指向 arr[0]

ptr + 0;              // arr[0] 的地址
ptr + 1;              // arr[1] 的地址（4 字节后，假设 int 是 4 字节）
ptr + 2;              // arr[2] 的地址
ptr - 1;              // ptr 之前的一个元素（如果越出数组就是 UB！）

++ptr;                // 现在指向 arr[1] —— 等价于 ptr = ptr + 1
--ptr;                // 回到 arr[0]   —— 等价于 ptr = ptr - 1
```

> 💡 **缩放规则：** `ptr + n` 实际前进 `n × sizeof(*ptr)` 个字节。编译器把元素大小烘进去 —— 你只用思考元素个数，不用思考字节数。

> ⚠️ **边界规则：** 指针运算**只在**结果地址落在"有效数组元素"或"最后一个元素之后的那一格"（one-past-end）时才有定义。计算超出这个范围的地址就是未定义行为 —— **即使你从不解引用它**。对一个 5 元素数组计算"元素 100 的地址"是 UB，不只是"运行时可能崩"。

> ⚠️ **one-past-end 可以持有，但不能解引用：** 对一个 5 元素数组来说，`&arr[5]` 是一个**完全合法可以持有、可以比较**的地址 —— 但解引用它就是 UB。这种不对称性正是 7.4 节 `begin` / `end` 模式能工作的前提。

### 7.2 下标 = 指针运算 + 解引用

`ptr[n]` 就是 `*(ptr + n)` 的**语法糖**，精确等价：

```cpp
int arr[]{9, 7, 5, 3, 1};
const int* ptr{arr};

ptr[2];        // 5
*(ptr + 2);    // 5 —— 字面上是同一个东西
&arr[2];       // arr[2] 的地址
arr + 2;       // 同一个地址
```

这就是为什么数组是 **0 起始**的：第 `n` 个元素在距起点偏移 `n` 的位置，编译器的地址计算就是简单的 `base + n × sizeof(元素)` —— 不需要减一调整。

### 7.3 是相对的，不是绝对的

下标访问**始终是相对于指针当前位置**，而不是相对于原数组起点：

```cpp
int arr[]{9, 8, 7, 6, 5};
int* ptr{&arr[3]};    // 指向元素 3（值为 6）
ptr[0];    // 6  （arr 的元素 3 —— "当前"）
ptr[1];    // 5  （arr 的元素 4 —— "下一个"）
ptr[-1];   // 7  （arr 的元素 2 —— "上一个"）
```

> ✅ **最佳实践：** 当你从数组起点开始索引时，用**下标**（`arr[i]`）—— 下标数字直接对应元素编号。当你从某个移动中的位置做相对遍历时，用**指针运算**（`*ptr`、`++ptr`）。两种风格混用只会让代码更难读。

> ⚠️ **负下标**如 `ptr[-1]` 在 `ptr` 不在数组起点时技术上是合法的，但这是个坑。如果你估错了 `ptr` 的位置，就会静默地掉进未定义行为 —— 编译器不会告诉你。

### 7.4 用指针遍历数组 —— `begin` / `end` 模式

用指针**地道地**遍历 C 风格数组的方式是：

1. 让 `begin` 指向第一个元素
2. 让 `end` 指向**最后一个元素之后的那一格**
3. 循环条件 `begin != end`，每次循环递增 `begin`

```cpp
#include <iostream>
#include <iterator>

int main() {
    int arr[]{9, 7, 5, 3, 1};
    const int* begin{arr};                 // 第一个元素
    const int* end{arr + std::size(arr)};  // 最后一个元素之后的那一格

    for (; begin != end; ++begin)
        std::cout << *begin << ' ';        // 9 7 5 3 1
}
```

> 💡 **为什么是"末尾之后一格"？** 两个原因：
> 1. **终止条件干净：** `begin != end` 自然成立 —— 当两个指针相遇时，所有元素都处理完了。
> 2. **空范围直接就 work：** 对于长度为 0 的范围，`begin == end` 在第一次检查时就成立，循环体执行 0 次。不需要特殊处理。
>
> one-past-end 地址可以**持有**和**比较**（来自 7.1 的边界规则）—— 你只是不能解引用它。

**为什么这个模式重要 —— 函数不再被数组退化坑到：**

不用再分开传 `(数组, 长度)`（还要祈祷调用者把长度传对），你可以直接传**一对指针**组成的范围：

```cpp
void print(const int* begin, const int* end) {
    for (; begin != end; ++begin)
        std::cout << *begin << ' ';
}

int arr[]{1, 2, 3, 4, 5};
print(arr, arr + std::size(arr));  // ✅ 长度信息存在这对指针里
```

函数拿到了它需要的一切 —— `end - begin` 就是元素个数，范围正好覆盖调用者指定的内容。没有数组退化带来的意外。

> 💡 **为 STL 迭代器打基础：** `begin` / `end` 这一对指针就是 **STL 迭代器的原型**。每一个标准库容器（`std::vector`、`std::array`、`std::map` ……）都提供 `.begin()` 和 `.end()`，行为和这两个指针**完全一样**。每一个 STL 算法（`std::sort`、`std::find`、`std::copy`）都接受 `(begin, end)` 范围。现在把指针遍历搞懂，以后学迭代器就是零成本的事。

### 7.5 range-based for 底层就是指针运算

当你对一个 C 风格数组写 range-based for 循环时，编译器会把它展开成本质上就是 7.4 节的 `begin` / `end` 循环：

```cpp
// 你写的：
int arr[]{9, 7, 5, 3, 1};
for (int x : arr) {
    std::cout << x << ' ';
}

// 编译器大致生成的：
int arr[]{9, 7, 5, 3, 1};
auto __begin = arr;                    // 指向 arr[0]
auto __end   = arr + std::size(arr);   // one-past-end
for (auto __it = __begin; __it != __end; ++__it) {
    int x = *__it;
    std::cout << x << ' ';
}
```

> 💡 **关键洞察：** range-based for **不是魔法** —— 它就是带更好语法的指针运算。这也正是为什么 range-based for 在**退化后的数组**（裸指针）上**编译失败**：编译器没办法知道范围到哪里结束。第 6 章说过"不能对退化后的数组用 range-for"；现在你知道**原因**了。

---

## 8. C 风格字符串

> 对应 LearnCpp 17.10 — C-style strings  
> 结合课堂 PPT：C-style Strings、Traversing Strings

### 8.1 什么是 C 风格字符串？

> 📖 **见 Week 2 §17.1–17.2** —— C 风格字符串 = 以 `'\0'` 结尾的 `char` 数组；5 种初始化写法（`char s[12] = "..."`、`char s2[] = "..."`、`char s3[12]`、`const char* s4 = "..."`、`char* s5`）及各自的安全性；以及**物理长度**（数组总大小）与**逻辑长度**（`'\0'` 之前的字符数）的区分。

### 8.2 遍历 C 风格字符串

> 📖 **见 Week 2 §17.3** —— 五种遍历方法的对比：
> 1. `s.size()` ❌ C 数组没这个方法
> 2. `strlen()` ⚠️ 能用但每次 O(n)（别放在循环条件里 —— 见下面 8.5）
> 3. range-based for ⚠️ 遍历的是物理长度而不是逻辑长度
> 4. `s[i] != '\0'` 循环 ✅ 正确且高效
> 5. 指针风格 `*p != '\0'` ✅ 地道的 C 写法
>
> 方法 4 和 5 是推荐的惯用写法。

### 8.3 C 字符串的坑

- **不能赋值：** `str = "rope";` 对 char 数组不起作用（要用 `strcpy`）
- **不能用 == 比较：** 比的是指针地址，不是内容（要用 `strcmp`）
- **缓冲区溢出：** 写越数组边界是未定义行为
- **忘记空终止符：** 打印时如果没有 `'\0'`，会读到随机内存

### 8.4 输入安全：`cin >>` 可能把你的缓冲区写爆

经典的不安全代码：

```cpp
char name[10]{};
std::cin >> name;   // ⚠️ 危险
```

问题的本质：**`std::cin >> name` 根本不知道 `name` 有多大。** 当 `name` 被传给 `operator>>` 时，它退化成 `char*`（第 6 章），所有长度信息都丢了。如果用户输入 `"Alexander Hamilton"`（18 个字符），`cin` 会愉快地把这 18 个字符加空终止符全部写进你那个 10 字符的缓冲区，**把后面相邻内存里的东西全覆盖掉**。

这就是**缓冲区溢出（buffer overflow）**—— 一种经典的安全漏洞。写越栈缓冲区可以覆盖函数的返回地址，让攻击者把执行流重定向到他们选的任意代码。现实中许多臭名昭著的漏洞（Morris 蠕虫、无数 CVE）就是基于这一类 bug。这不是理论上的隐患。

**安全写法 —— `std::cin.getline()`：**

```cpp
#include <iostream>
#include <iterator>   // 为了 std::size

char name[10]{};
std::cin.getline(name, std::size(name));  // 最多读 9 个字符 + '\0'
```

`std::cin.getline(buf, max)` 的行为：
- 最多往 `buf` 里读 `max - 1` 个字符
- 遇到换行、EOF 或达到上限就停 —— 哪个先到算哪个
- 总是追加 `'\0'`
- 超出上限的字符留在输入流里（或被丢弃，取决于具体变体）

> ⚠️ **原则：** 对 C 风格字符串**永远不要**用 `std::cin >> str`，除非你能**证明**输入一定装得下。用 `std::cin.getline(str, std::size(str))` 代替。或者 —— 更好的办法 —— 用 `std::string`，它会自动增长。

### 8.5 strlen() vs std::size()

| 函数 | 对退化后的数组有效？ | 返回值 | 是否包含 `'\0'`？ |
|------|-------------------|--------|-----------------|
| `std::size(arr)` | ❌ | 物理数组长度 | 是 |
| `strlen(arr)` | ✅ | 逻辑字符串长度 | 否 |

> ⚠️ `std::strlen` 是 O(n) —— 它要从头走到 `'\0'` 才能数出长度。如果字符串不变就不要把它放在循环条件里，先缓存一次结果。

### 8.6 `<cstring>` 函数家族

所有经典的 C 字符串函数都在 `<cstring>` 头文件里。HW3 里的 `String::strlen` 和 `String::strcpy` 就是照这些函数取的名字：

| 函数 | 作用 | 安全性 |
|------|------|-------|
| `strlen(s)` | 返回字符串长度（不含 `'\0'`） | ✅ 安全，O(n) |
| `strcpy(dest, src)` | 把 `src` 拷贝到 `dest` | ⚠️ **不检查 `dest` 大小** |
| `strncpy(dest, src, n)` | 最多拷 `n` 个字符 | ⚠️ 如果 `strlen(src) ≥ n`，**不会**追加 `'\0'` |
| `strcat(dest, src)` | 把 `src` 追加到 `dest` 末尾 | ⚠️ **不检查 `dest` 大小** |
| `strncat(dest, src, n)` | 最多追加 `n` 个字符 | 比 `strcat` 安全 |
| `strcmp(a, b)` | 相等返回 0，否则返回 <0 或 >0 | ✅ 安全 |
| `strncmp(a, b, n)` | 最多比较 `n` 个字符 | ✅ 安全 |
| `strstr(hay, needle)` | 查找子串；返回指针或 `nullptr` | ✅ 安全 |

**比较 C 字符串 —— 不要用 `==`：**

```cpp
const char* a{"hello"};
const char* b{"hello"};

if (a == b)                  { /* ... */ }  // ❌ 比较的是指针，不是内容
if (std::strcmp(a, b) == 0)  { /* ... */ }  // ✅ 比较的是内容
```

这是初学者最常踩的坑之一。对两个 `char*` 用 `==`，比的是**地址** —— 两个指针是不是恰好指向同一块内存 —— 而不是字符内容。只有 `strcmp` 才真正走一遍字符。

> ⚠️ **`strcpy` / `strcat` 是大坑。** 它们假设目标缓冲区够大，不够大就直接静默溢出。`n` 变体（`strncpy`、`strncat`）给了你一个长度上限，但 `strncpy` 本身也有坑：如果 `strlen(src) ≥ n`，它**不会**追加 `'\0'`，你的目标字符串就没有终止符了。用之前先查文档。HW3 会让你自己写带 `MAXLEN` 边界检查的 `strlen` / `strcpy`。

**"安全的 strcpy" 光谱 —— 四种变体，四种取舍：**

你在第三方 C 代码或文档里会看到四个 `strcpy` 家族的函数。它们代表了工业界几十年来反复尝试（而且只部分成功）修复原版 `strcpy` 不安全问题的过程：

| 变体 | 签名 | 边界检查？ | 保证 `'\0'`？ | 可移植性 |
|-----|------|----------|-------------|---------|
| `strcpy`    | `strcpy(dest, src)`           | ❌ 完全不管                       | ✅ 保证（只要 `src` 本身有）| ✅ 到处都有（C89）|
| `strncpy`   | `strncpy(dest, src, n)`       | ⚠️ 部分 —— 最多写 `n` 个字节        | ❌ 如果 `strlen(src) ≥ n` 就不加 | ✅ 到处都有（C89）|
| `strlcpy`   | `strlcpy(dest, src, n)`       | ✅ 完整（最多写 `n-1` 个字符）      | ✅ 永远保证 | ⚠️ BSD / macOS 原生；POSIX-2024；**glibc 2.38（2023 年）才加**；MSVC 没有 |
| `strcpy_s`  | `strcpy_s(dest, destsz, src)` | ✅ 完整                           | ✅ 永远保证（否则返回运行时错误）| ⚠️ C11 Annex K（可选）；**MSVC 有**；glibc 没有 |

**逐个对比：**

- **`strcpy`** —— 原始版本，完全不管 `dest` 的大小。不安全，新代码里基本不应使用。
- **`strncpy`** —— 后来加的"带上限"版本，但有一个臭名昭著的缺陷：如果源字符串恰好填满缓冲区，它**不会加空终止符**。更糟的是，如果源字符串短于 `n`，它会把剩下的空间全填成 `'\0'`（对大缓冲区来说白白浪费时间）。它比 `strcpy` 安全，但仍然是个雷区。
- **`strlcpy`** —— BSD 对"真正安全的 strcpy"的尝试。最多写 `n - 1` 个字符，**总是**加空终止符，返回它**想**写的长度（所以可以检测截断：`if (strlcpy(dest, src, n) >= n) { /* 被截断了 */ }`）。设计干净，但长期**不在 glibc 里** —— Linux 代码用它就不可移植。直到 POSIX-2024 才标准化，glibc 2.38（2023）才加进来，目前还远未普及。
- **`strcpy_s`** —— Microsoft 的方案，后来作为 C11 Annex K 标准化。把目标缓冲区大小作为显式参数，缓冲区不够大时返回错误码。比 `strlcpy` 更"防御式"，但 **Annex K 是可选标准**，glibc 维护者明确拒绝实现 —— 所以它实际上只在 MSVC 上可用。

> 💡 **2026 年想要一个安全、可移植的 C 风格拷贝怎么办：**
> 1. BSD / macOS / 较新的 glibc：用 **`strlcpy`**
> 2. MSVC：用 **`strcpy_s`** 或 **`strlcpy`**（如果可用）
> 3. **可移植 C++ 的最佳答案：** 直接用 **`std::string`**（下一节），别再和 C 字符串纠缠。HW3 的自定义 `String` 类就是同一个思路 —— 自己写一个带 `MAXLEN` 边界检查的拷贝函数，完全不依赖上面这四个。

> ⚠️ **对 ICS 45C 来说：** 你会在 HW3 里自己实现一个带 `MAXLEN` 边界检查的 `strcpy`，本质上就是一个 mini 版的 `strlcpy`。上面这四个变体是**背景知识** —— 在别的代码库里遇到时能认出来 —— 不是你要直接从 HW3 代码里调用的东西。

### 8.7 最佳实践：优先用 `std::string`

> ✅ **最佳实践：** 除非你有明确的理由（HW3 练习、和 C API 交互、嵌入式内存极度紧张），否则就用 **`std::string`** 处理可变字符串，用 **`std::string_view`** 作只读参数。新代码里应当**避免**非 const 的 C 风格字符串。

为什么：

- **不用手动跟踪长度** —— `std::string` 自己知道大小，O(1)
- **不会缓冲区溢出** —— 拼接和赋值会自动扩容
- **值语义** —— `=`、`==`、`+`、`<` 和各种比较运算符全部开箱即用
- **不会漏掉空终止符** —— 库内部处理
- **不会退化** —— `std::string` 作为参数传递时不会退化成裸指针

**当你确实要用 C 字符串时：**

- HW3 的自定义 `String` 类 —— 学习练习，以 `MAXLEN` 做上限
- 调用 C 库 API（`printf`、`fopen`、`strtol` ……）—— 在边界用 `.c_str()` 转过去
- 嵌入式环境，`std::string` 的堆分配代价太大

这些场景下：**永远显式跟踪缓冲区大小，永远不要相信输入长度，优先用 `n` 变体函数（或你自己写的带边界检查的辅助函数），而不是那些无边界检查的经典 API。**

---

## 9. 运算符重载入门

> 对应 LearnCpp 21.1 — Introduction to operator overloading

### 9.1 运算符就是函数

在 C++ 中，`x + y` 其实是函数调用：`operator+(x, y)`。编译器为基本类型提供了内置版本。对于你自己的类，你可以自定义版本 —— 这就是**运算符重载**。

```cpp
Mystring s1{"Hello, "};
Mystring s2{"World!"};
std::cout << s1 + s2;  // 只要你重载了 operator+ 就能用
```

### 9.2 规则与限制

1. 只能重载**已有的**运算符（不能发明 `operator**` 来做指数运算）
2. 至少一个操作数必须是**用户定义类型**（你自己的类，或标准库类型如 `std::string`）
3. **不能改变**操作数数量、运算符的**优先级**或**结合性**
4. 以下运算符**完全不能重载**：`?:`、`sizeof`、`::`、`.`、`.*`、`typeid`，以及所有类型转换运算符（`static_cast`、`dynamic_cast`、`reinterpret_cast`、`const_cast`）

> 💡 **"用户定义类型"包括标准库类型：** `std::string`、`std::vector` 等都算 —— 因为它们不是基本类型，所以能满足"至少一个操作数是用户定义类型"这条规则。所以 `operator+(double, std::string)` 在技术上是合法的。

> ⚠️ **……但不要只用标准库类型来重载。** 把它们留给库自己。未来的 C++ 标准可能会给这些类型定义你意想不到的含义，一旦升级编译器就会静默地破坏你的代码。**永远保证至少有一个操作数是你自己拥有的类型。**

> 💡 **最佳实践：** 让重载运算符保持直观。如果含义不明显，就用具名函数代替。（下面两个子小节会解释为什么这件事很重要。）

### 9.3 返回值约定

重载运算符应该返回什么，有一条重要的规则：

| 运算符类别 | 例子 | 返回方式 | 原因 |
|----------|------|---------|------|
| **非修改型**（计算出一个新值） | `+`、`-`、`*`、`/`、`==`、`<`、`<<` | **按值**（`String`、`bool` ……） | 创建了全新的结果；没有持久的东西可以引用 |
| **修改左操作数** | `=`、`+=`、`-=`、`++`、`--` | **返回左操作数的引用**（`String&`） | 返回被修改的对象，支持链式调用 |

以 HW3 的 `String` 类为例：

```cpp
class String {
public:
    String  operator+ (const String& other) const;   // ✅ 新结果 → 按值
    String& operator= (const String& other);         // ✅ *this 被修改 → 按引用
    String& operator+=(const String& other);         // ✅ *this 被修改 → 按引用
    bool    operator==(const String& other) const;   // ✅ 新的 bool → 按值
};
```

**为什么 `operator=` 要返回 `String&`，而不是 `void` 或 `String`？** 为了**链式赋值**。

```cpp
String a, b, c;
a = b = c;   // 从右往左解析为 a = (b = c);
             // (b = c) 必须返回一个 a 能接着赋值的东西
```

- 返回 `void` → 链式赋值**根本编译不过**
- 返回按值 → 能工作，但链上每一环都会多一次拷贝
- **返回引用 → 既正确又高效**

同样的逻辑也适用于 `operator<<`：它返回 `std::ostream&`，所以你能链式写 `cout << x << y << z`（完整讲解见 Week 2 §18.3）。

> 💡 **判断规则：** 问自己 —— "**这个运算符会改变 `*this` 吗？**" 如果会 → 返回 `Type&`。如果不会 → 按值返回 `Type`（或 `bool` 等）。

### 9.4 语义一致性：`^` 指数运算陷阱

为什么重载运算符必须保持和内置含义一致？LearnCpp 有一个著名的反例：

> "C++ 没有指数运算符，我来重载 `^` 做指数吧 —— `2 ^ 3` 就是 `8`。"

听起来很合理……直到有人写出这样的代码：

```cpp
int result = 4 + 3 ^ 2;
```

**作者大概想表达的**（按数学的优先级 —— 指数比加法优先级更高）：

$$4 + (3 ^{2}) = 4 + 9 = 13$$

**C++ 实际计算的：** C++ 里的 `^` 是**按位异或**，优先级**低于** `+`。所以这个表达式会被解析成：

```cpp
(4 + 3) ^ 2   // = 7 ^ 2 = 5
```

而你**改变不了这一点** —— 运算符优先级是写死在语言语法里的，不是写在你定义的运算符函数里。即使你自定义的 `^` 做出了正确的数学运算，**整个表达式的解析顺序仍然按 XOR 的优先级来**。你的代码的每个读者都必须在脑子里手动推翻自己对优先级的预期，否则就会写出有 bug 的代码。

> ✅ **最佳实践（重申）：** 只在运算符的**内置自然含义**能迁移到你的类型时才去重载它。
>
> - 用 `+` 拼接两个字符串？**OK** —— 天然的类比（合并两个序列）。
> - 用 `<<` "把对象打印到流里"？**OK** —— 已经是约定俗成的含义。
> - 用 `-` 从字符串里删除字符？**糟糕** —— 没有自然类比，语义不明，应该用具名的 `.erase()` 方法。
> - 用 `^` 做指数运算？**糟糕** —— 和语言的优先级规则打架；用具名的 `pow()` 函数代替。

---

## 10. I/O 运算符重载

> 📖 **已迁移至 Week 2 §18。** `operator<<` 重载的完整内容 —— 为什么**必须是非成员函数**、`ostream& operator<<(ostream& out, const Complex& c)` 的签名含义、为什么要返回 `ostream&` 以支持链式调用、`operator>>` 的对称写法，以及 **`friend` 声明的替代方案** —— 全部在 **Week 2 §18「operator<< 重载与引用参数模式」**。
>
> 本节的核心概念（按引用返回约定）和**上面的 §9.3** 是一致的 —— 同样的 "返回 `Type&` 以支持链式"规则也适用于 `operator=`。

---

## 11. 用成员函数重载运算符

> 对应 LearnCpp 21.5 — Overloading operators using member functions

### 11.1 友元 vs 成员重载

**友元 / 非成员版本：**

```cpp
// 两个显式参数
Cents operator+(const Cents& cents, int value) {
    return Cents(cents.m_cents + value);
}
// 用法：cents1 + 2 → operator+(cents1, 2)
```

**成员函数版本：**

```cpp
class Cents {
public:
    Cents operator+(int value) const {  // 只有一个参数 —— 左操作数是 *this
        return Cents{m_cents + value};
    }
};
// 用法：cents1 + 2 → cents1.operator+(2)
```

### 11.2 什么时候用哪种

| 情况 | 推荐形式 |
|------|---------|
| `=`、`[]`、`()`、`->` | **必须**是成员 |
| 一元运算符（`++`、`--`、`!`） | 成员 |
| 二元且不修改左操作数（`+`、`-`） | 友元 / 非成员 |
| 二元且修改左操作数（`+=`、`-=`） | 成员（推荐） |
| `<<`、`>>` | **必须**是非成员（左操作数是 `ostream`/`istream`） |

---

## 11B. 对象生命周期走查 —— 课堂 PPT 补充

> 来自课堂 PPT：Classes p9 — "What happens here?"  
> ⚠️ 考试常考题，仔细推演。

### 11B.1 代码

```cpp
#include "Complex.hpp"

int main() {
    Complex c1(1.5, 5.3);      /// (1) c1 被构造
    Complex c2(2.5, 2.7);      /// (2) c2 被构造
    c1.print(cout);
    c2.print(cout);
    {
        Complex result;         /// (3) result 被默认构造 (0.0, 0.0)
        result.print(cout);
        result = c1.add(c2);   /// (4) 这里发生了一大堆事情！（见下文）
        result.print(cout);
    }                           /// (5) result 离开作用域 → 调用析构函数
    c1 = Complex(2.0, 3.0);    /// (6) 构造临时对象，赋值给 c1，临时对象销毁
    c1.print(cout);
    return 0;
}                               /// (7) c2 先销毁，然后 c1 销毁（逆序）
```

### 11B.2 第 (4) 行的详细拆解：`result = c1.add(c2)`

这一行触发了**很多**操作：

1. `c2` 被**拷贝**到 `add()` 的参数 `c` 里（按值传递 → 拷贝构造函数）
2. `add()` 内部：`Complex(re + c.re, im + c.im)` —— 构造一个**临时** Complex
3. 临时对象被**返回**（可能涉及拷贝/移动，但编译器通常会通过 RVO 优化掉）
4. 返回值通过 `operator=` **赋值**给 `result`（拷贝赋值）
5. 返回的临时对象被**销毁**（调用析构函数）
6. `c` 的拷贝（参数）被**销毁**（调用析构函数）

> 💡 **关键点：** `result = c1.add(c2)` 这样一行看起来简单的代码，可以触发 2 个以上构造函数、1 次赋值和 2 个以上析构函数。这就是为什么理解对象生命周期至关重要。

### 11B.3 销毁顺序

对象的销毁顺序与构造顺序**相反**：

```
构造顺序：c1, c2, result
销毁顺序：result（内层作用域结束时）、c2、c1（main 结束时）
```

> ⚠️ **考试提示：** 被问到"这里发生了什么？"时，按顺序列出每一次构造函数、析构函数、赋值调用。别忘了临时对象！

### 11B.4 第 (6) 行：`c1 = Complex(2.0, 3.0)`

1. `Complex(2.0, 3.0)` —— 构造**临时**对象（一个"字面量 Complex"）
2. `c1 = ...` —— 对 `c1` 调用拷贝赋值运算符
3. 语句结束后，临时对象立即**销毁**

---

## 12. 基础文件 I/O

> 对应 LearnCpp 28.6 — Basic file I/O  
> 结合课堂 PPT：Process each word in a file、Copy a file

### 12.1 三个文件流类

都在 `<fstream>` 中：

| 类 | 用途 | 默认模式 |
|-----|------|---------|
| `ifstream` | 从文件读 | `ios::in` |
| `ofstream` | 写入文件 | `ios::out` |
| `fstream` | 读写 | `ios::in \| ios::out` |

### 12.2 基本用法

```cpp
#include <fstream>
#include <iostream>
#include <string>

int main() {
    // 写入
    std::ofstream out{"output.txt"};   // 打开写入（默认模式会清空已有内容！）
    out << "Hello\n";
    // 不需要 out.close() —— 析构函数会在作用域结束时自动关闭

    // 按行读（文本文件的首选方式）
    std::ifstream in{"input.txt"};
    std::string line;
    while (std::getline(in, line))
        std::cout << line << '\n';
}
```

> 💡 **RAII 自动关闭：** 严格来说你不需要调用 `.close()`。当 `ifstream` / `ofstream` 变量离开作用域时，它的析构函数会自动关闭文件。这就是 **RAII**（资源获取即初始化）—— 流对象的生命周期管理着文件的打开状态。只有在以下两种场景才需要显式 `close()`：① 想用同一个变量重新打开不同文件或不同模式（见 12.3）；② 在调用 `std::exit()` 之前强制刷新缓冲（见 12.5）。

**`>>` vs `std::getline()` —— 选对读法：**

```cpp
while (in >> word)             { /* ... */ }  // 一次读一个单词（遇到空白就停）
while (std::getline(in, line)) { /* ... */ }  // 一次读一行（遇到 '\n' 就停）
```

`operator>>` 在**任何空白**（空格、tab、换行）处都会断开，所以读一个内容是 `"Hello World\nGoodbye"` 的文件，你会得到三个独立的 token `"Hello"`、`"World"`、`"Goodbye"` —— 不是行。大多数文本文件处理场景下这**不是你想要的**。

- 想要完整的**行**时，用 **`getline`**。
- 想要**分词后的 token**（数字、空格分隔的单词等）时，用 **`>>`**。

### 12.3 文件模式

**文件模式**是控制文件如何打开的 flag。你把它作为构造函数的第二个参数传入（或传给 `open()`）：

```cpp
std::ofstream out{"log.txt", std::ios::app};  // 追加模式 —— 不覆盖已有内容
```

完整的模式 flag 列表（全部在 `std::ios` 命名空间里）：

| 模式 | 含义 |
|------|------|
| `std::ios::app`    | 追加 —— **每一次**写操作都会走到文件末尾；已有内容保留 |
| `std::ios::ate`    | "At end" —— 打开时**只 seek 到末尾一次**；后续写操作可以去任意位置 |
| `std::ios::binary` | 二进制模式 —— 不做文本翻译（比如 Windows 下不会把 `\r\n` ↔ `\n` 互转）|
| `std::ios::in`     | 以读模式打开（**`ifstream` 的默认**）|
| `std::ios::out`    | 以写模式打开（**`ofstream` 的默认**）|
| `std::ios::trunc`  | 如果文件已存在就清空（**`ofstream` 在 `out` 设置时默认隐含**）|

> ⚠️ **`app` vs `ate` —— 别混淆：**
> - **`app`**：强制**每一次**写操作都到文件末尾（即使你先 `seekp` 到别处也没用）
> - **`ate`**：只在打开时 seek 到末尾**一次**；后续写操作可以去任意位置

**用 `|` 组合多个模式：** 按位或运算符可以把多个 flag 叠加成一个参数：

```cpp
std::fstream f{"data.bin", std::ios::in | std::ios::out | std::ios::binary};
// 读 + 写 + 二进制，三个模式一次启用
```

`fstream` 的默认模式 `std::ios::in | std::ios::out` 就是这样指定的。每个 flag 是一个独立的 bit，`|` 把它们组合起来。

**重新打开流 —— `open()` / `close()`：**

同一个流变量可以关闭后重新打开不同的文件或模式：

```cpp
std::ofstream out{"log.txt"};              // 默认写模式（会清空）
out << "First session\n";
out.close();                                // 关闭这次打开

out.open("log.txt", std::ios::app);        // 用追加模式重新打开
out << "Second session\n";                  // 不会覆盖第一次写的内容
// 作用域结束时析构函数自动关闭
```

当你想在程序中途切换模式但又不想声明新的流变量时很有用。

### 12.4 错误检查

```cpp
std::ifstream in{"nonexistent.txt"};
if (!in) {
    std::cerr << "Could not open file!\n";
    return 1;
}
```

流对象在打开失败时会转换为 `false` —— 所以 `if (!in)` 或 `if (!in.is_open())` 都可以。**每次打开文件都要做这个检查**。悄无声息的失败是文件 I/O 代码里最痛苦的一类 bug。

### 12.5 缓冲、刷新、什么时候该关文件

文件输出是**带缓冲的**：`out << "hello";` 通常**不会立即**写到磁盘。字符会先积攒在内存缓冲区里，只有在以下情况才真正写出：

1. **缓冲区写满了**（自动，按大小触发）
2. **流被关闭** —— 显式 `close()`，或者对象析构时隐式关闭
3. **你显式刷新** —— 调用 `out.flush()` 或 `out << std::flush`
4. **你写了 `std::endl`** —— 它会写 `'\n'` **并且**刷新缓冲

> ⚠️ **崩溃 / `exit()` 陷阱：** 如果你的程序在流的析构函数运行之前崩溃，或者调用了 `std::exit()` / `std::abort()`，**缓冲区里的数据会丢失** —— 磁盘上的文件不会包含你最后那几次写入。对于关键写入（日志、checkpoint），每次写完后调用 `out.flush()`，或者在退出前显式 `close()` 流。

> ⚠️ **`std::endl` 很慢 —— 换行请用 `'\n'`：** `std::endl` **每次**都会强制刷新缓冲。在一个写成千上万行的循环里，就是成千上万次磁盘同步 —— 通常比必要的慢 **10–100 倍**。

```cpp
for (int i{0}; i < 1'000'000; ++i)
    out << "line " << i << '\n';        // ✅ 快 —— 只在关闭时刷新一次

for (int i{0}; i < 1'000'000; ++i)
    out << "line " << i << std::endl;   // ❌ 刷新了 1,000,000 次
```

普通换行一律用 `'\n'`。只有在**真的需要立即强制刷新**的罕见场景才用 `std::endl` / `out.flush()`。

---

## 13. 代码覆盖率（测试）

> 对应 LearnCpp 9.2 — Code coverage

### 13.1 什么是代码覆盖率？

**代码覆盖率**描述的是测试过程中你的源代码有多少被执行到了。它有几个有用的度量指标。

### 13.2 语句覆盖率

**语句覆盖率** = 被测试执行到的语句占总语句的百分比。

```cpp
int foo(int x, int y) {
    int z{y};
    if (x > y) {
        z = x;
    }
    return z;
}
```

`foo(1, 0)` 给出 100% 的语句覆盖率 —— 每条语句都执行了。但光靠这个还不够。

### 13.3 分支覆盖率

**分支覆盖率** = 被执行到的分支占总分支的百分比。每个 `if` 都有两个分支（true 和 false），即使没有 `else`。

`foo(1, 0)` 只测了 `x > y` 为真的分支 → 分支覆盖率 50%。你还需要 `foo(0, 1)` 来测试假分支。

对于 `switch` 语句：

```cpp
bool isLowerVowel(char c) {
    switch (c) {
        case 'a': case 'e': case 'i': case 'o': case 'u':
            return true;   // 分支 1
        default:
            return false;  // 分支 2
    }
}
```

需要两次调用：`isLowerVowel('a')` + `isLowerVowel('q')`。多个 case 进入同一函数体不需要单独测试。

对于 if/else 链：

```cpp
void compare(int x, int y) {
    if (x > y)       std::cout << x << " is greater than " << y;
    else if (x < y)  std::cout << x << " is less than " << y;
    else              std::cout << x << " is equal to " << y;
}
```

需要 3 次调用：`compare(1,0)`、`compare(0,1)`、`compare(0,0)`。

> 💡 **最佳实践：** 目标是代码的 100% 分支覆盖率。

### 13.4 循环覆盖率（0、1、2 测试）

如果有循环，用 **0 次、1 次、2 次**迭代来测。如果 2 次能正常工作，那么对 n > 2 也能正常工作。

```cpp
void spam(int timesToPrint) {
    for (int count{0}; count < timesToPrint; ++count)
        std::cout << "Spam! ";
}
// 测试：spam(0)、spam(1)、spam(2)
```

> 💡 **最佳实践：** 用 0、1、2 测试确保循环正确工作。

### 13.5 测试不同类别的输入

不要只测正常值 —— 要从**类别**的角度思考：

| 类型 | 要测的类别 |
|------|-----------|
| 整数 | 负数、零、正数；必要时测溢出 |
| 浮点数 | 有精度问题的值：`0.1`、`-0.1`、`0.7`、`-0.7` |
| 字符串 | 空字符串、字母数字、含空白（前导/末尾/中间）、全空白 |
| 指针 | `nullptr`（后面会讲到） |

> 💡 **最佳实践：** 测试不同类别的输入值，确保你的单元能正确处理它们。

### 13.6 覆盖率是必要条件，不是充分条件

100% 分支覆盖率是一个**底线**，不是终点。即使代码被测试完美覆盖，你的测试套件仍然可能漏掉大量 bug：

- **数据相关的 bug**：`if (x + y > limit)` 的两个分支都执行了，但碰巧用的都是能正常工作的值。上线后某一组特定输入触发整数溢出，你的测试从来没见过。
- **差一错误（off-by-one）**：循环分支确实执行了，但多跑了一次或少跑了一次。覆盖率并不检查循环次数是否正确。
- **你没想到试的边界值**：空输入、最大规模输入、正好卡在阈值上的输入、`0`、`INT_MAX`、`nullptr`、`""`。覆盖率告诉你"什么代码跑了"，不告诉你"你有没有想到所有该试的输入"。
- **分支之间的交互**：两个独立的 `if` 各自在隔离测试里都通过，但组合起来就坏了 —— 尤其是它们共享可变状态时。
- **需求缺失**：如果规格说"要处理负数输入"而你根本忘了写那个分支，那覆盖你**已经写出来**的那些分支没有意义。

**正确的心理模型：**

```
覆盖率（coverage）告诉你  "哪些代码跑了"
正确性（correctness）告诉你 "那些代码对每一个有意义的输入都能给出正确结果吗"
```

这是两件不同的事。覆盖率是**必要**条件 —— 如果某一行在测试时从没跑过，你对它的行为完全两眼一抹黑。但覆盖率**不是充分**条件 —— 一行代码跑过一次并不能证明它对所有相关输入都正确。

> ⚠️ **新手常见陷阱：** "我的测试都通过了，覆盖率 100%，所以代码是对的。" 这是错的，而且是测试学里最普遍的误解之一。把 100% 分支覆盖当作**起点**，然后再问自己："什么样的输入会把它搞垮？"针对那些输入再补测试。13.5 的类别表是一个思考起点，但不是清单的全部。

> 💡 **实战工作流：**
> 1. 写测试直到达到 100% 分支覆盖率（满足 13.3 的最佳实践）
> 2. 加上 13.4 的 0-1-2 循环测试
> 3. 对每个参数遍历 13.5 的输入类别表
> 4. 问自己："规格里说应该发生的事情，我有没有都测到？"
> 5. 问自己："最奇怪、最小、最大、最恶意的输入是什么？真实用户可能怎么折腾这个接口？"
>
> 第 1–3 步是机械的。第 4–5 步才是真正抓 bug 的地方。

---

## 14. C++ 中常见的语义错误

> 对应 LearnCpp 9.3 — Common semantic errors in C++

### 14.1 条件逻辑错误

用错比较运算符：

```cpp
if (x >= 5)   // 哎呀 —— 应该是 x > 5
    std::cout << x << " is greater than 5";
```

或者在循环里：

```cpp
for (int count{1}; count > 5; ++count) { ... }  // 应该是 < 5；循环体永远不会执行
```

### 14.2 死循环

```cpp
int count{1};
while (count <= 10) {
    std::cout << count << ' ';
    // 忘了 ++count; → 死循环！
}
```

**无符号整数陷阱：**

```cpp
for (unsigned int count{5}; count >= 0; --count) { ... }
// unsigned int 永远不可能 < 0 —— 会回绕到 4294967295 → 死循环！
```

> 💡 **老师最爱考这个：** 无符号下溢死循环是经典考题。只要看到 `unsigned` 配 `>= 0`，就是死循环。循环计数器可能跌破零时用有符号 `int`；反向遍历容器时用 `std::ssize`（见 5.5 节）。

### 14.3 差一错误（Off-by-one）

循环边界该用 `<=` 却用了 `<`，反之亦然。极其常见：

```cpp
for (int count{1}; count < 5; ++count)
    std::cout << count << ' ';
// 打印：1 2 3 4      ← 本来想要 1 2 3 4 5
```

经典修复是 `count <= 5`，但根本问题是"端点到底要不要包含进来？"在**写循环之前**就想清楚 —— 事后对着条件瞪眼很容易出错。

### 14.4 运算符优先级陷阱

C++ 的运算符优先级表很长，其中一些会让人大跌眼镜。经典例子：

```cpp
int x{0}, y{3};

if (!x > y)
    std::cout << "A\n";      // 不打印（出人意料！）

if (!(x > y))
    std::cout << "B\n";      // 打印（符合本意）
```

**为什么？** `!`（一元逻辑非）比 `>`（关系运算符）**优先级更高**，所以 `!x > y` 被解析为 `(!x) > y`：

- `!x` 是 `!0`，结果是 `true`（也就是 `1`）
- `1 > 3` 是 `false`
- 第一个 `if` 于是跳过了函数体

第二种写法用显式括号强制了你**原本想要的**分组：`!(x > y)` 就是 `!(0 > 3)` = `!false` = `true` ✓

> ✅ **经验法则：** `!`、`&&`、`||` 和比较运算符混用时，**永远**显式加括号。C++ 的逻辑运算符优先级规则非常反直觉。
>
> 相关陷阱：`&&` 比 `||` 优先级更高，所以 `a || b && c` 会被解析成 `a || (b && c)`，不是 `(a || b) && c`。

### 14.5 浮点数相等比较陷阱

**绝对不要用 `==` 比较浮点数。** 算术运算中积累的微小舍入误差，会让你"显然相等"的两个值实际上不相等：

```cpp
double sum{0.0};
for (int i{0}; i < 10; ++i)
    sum += 0.1;

if (sum == 1.0)
    std::cout << "正好是 1\n";
else
    std::cout << "不是 1 —— 实际是 " << sum << '\n';

// 输出：不是 1 —— 实际是 0.9999999999999999
```

`0.1` 在二进制浮点里**无法精确表示** —— `0.2`、`0.3` 等很多数都是一样。每次 `sum += 0.1` 都会累积一点舍入误差，加 10 次之后误差就显现出来了。

**正确做法** —— 用 epsilon 容差比较：

```cpp
#include <cmath>

if (std::abs(sum - 1.0) < 1e-9)
    std::cout << "近似等于 1\n";
```

对特别大或特别小的数，更稳健的做法是用相对误差。但对大多数 ICS 45C 代码来说，绝对 epsilon 就够用了。

> ⚠️ **规则：** 整数、字符、指针可以用 `==`；`float` / `double` 必须用 epsilon 比较（`std::abs(a - b) < eps`）。**这条规则对 `0.5`、`1.0` 这种"看起来正好"的值也不例外。**

### 14.6 整数除法截断

当 `/` 的两个操作数都是整数时，C++ 做的是**整数除法** —— 小数部分直接丢掉：

```cpp
int x{7}, y{2};
std::cout << x / y << '\n';       // 打印 3，不是 3.5
double result = x / y;             // ⚠️ 还是 3.0 —— 除法在赋值之前已经发生了
```

修复方式是让至少一个操作数变成浮点数，触发浮点除法：

```cpp
double r1 = static_cast<double>(x) / y;     // ✅ 3.5
double r2 = x / static_cast<double>(y);     // ✅ 3.5
double r3 = x * 1.0 / y;                    // ✅ 3.5（老写法）
```

> ⚠️ **常见坑：** `double avg = total / count;`，其中 `total` 和 `count` 都是 `int`。除法先发生、截断先完成，然后结果才被转成 `double`。**一定要在除法之前就把至少一个操作数转成浮点。**

### 14.7 误加分号 & 漏写花括号

**误加分号 —— `if` 后的空语句：**

```cpp
if (c == 'y');         // ⚠️ 这个分号结束了 if —— 空函数体
    blowUpWorld();     // ← 这行永远执行，不在 if 里！
```

`;` 创建了一个空语句，编译器把它当作 if 的函数体。下一行已经不受 if 控制了。`while (...);` 和 `for (...);` 有同样的陷阱。

**漏写花括号 —— 看起来缩进了，其实没在块里：**

```cpp
if (c == 'y')
    std::cout << "Are you sure?\n";
    blowUpWorld();     // ← 也是永远执行！
```

没有花括号的 `if` 只控制**紧跟的下一条语句**。缩进对编译器**没有意义** —— 只对读代码的人有意义。第二行无论 `c` 是什么都会执行。

> ✅ **最佳实践：** **永远给 `if`、`while`、`for` 加花括号**，哪怕函数体只有一行。多打两个字符，避免一整类 bug。Google、LLVM 等主流 C++ 风格指南都强制要求这样做。

### 14.8 把赋值当成相等判断

C++ 最常见的错字：

```cpp
char c;
std::cin >> c;

if (c = 'y')              // ⚠️ 是赋值，不是比较！
    blowUpWorld();
```

`c = 'y'` 是一个**赋值表达式** —— 它把 `'y'` 赋给 `c`，然后**表达式本身的值就是 `'y'`**。if 条件把 `'y'`（非零）转换成 `true`，所以函数体**无论用户输入什么都会执行**。

**修复只需要一个多余的 `=`：** `if (c == 'y')`。

> 💡 **现代编译器大多会警告这个** —— 开启 `-Wall`（GCC / Clang）就能看到 "suggest parentheses around assignment used as truth value" 这样的提示。**认真看编译警告。**

> 💡 **Yoda 条件：** 有些代码库会写成 `if ('y' == c)`。如果你不小心打成 `=`，`'y' = c` 会**直接编译报错**（不能给字面量赋值），在编译期就抓到 bug。这是一个风格偏好问题，但是一个有用的防御模式。

### 14.9 忘了加函数调用的 `()`

一个很隐蔽的陷阱 —— 写了函数名但**忘了调用**：

```cpp
int getValue() { return 5; }

int main() {
    std::cout << getValue << '\n';    // ⚠️ 没有 ()！大概率打印 "1"
    std::cout << getValue() << '\n';  // ✅ 打印 5
}
```

没有 `()`，`getValue` 不是**调用**函数 —— 而是求到函数的**地址**（一个函数指针）。流的 `<<` 把指针转换成 `bool`（地址不为零所以总是 `true`），然后打印成 `1`。

有些编译器会打印十六进制地址。不管哪种，你都**没拿到返回值**，而且编译器不会警告。

> ⚠️ **症状：** 你的程序到处都打印 `1`，但你期望看到函数的返回值。修复方法几乎总是补一个漏掉的 `()`。

### 14.10 其他速记错误

- **未初始化变量** —— `int x;` 里面是垃圾值。一律值初始化：`int x{};`，或者给它一个有意义的值。
- **窄化转换** —— `int x = 3.7;` 会静默截断成 `3`；`int x{3.7};` 会**编译报错**（好事！）。优先用 `{}` 初始化来抓这类问题。
- **遮蔽（shadowing）** —— 局部变量和外层变量同名，编译能过但行为出乎意料。开 `-Wshadow` 能检测到。

---

## 15. 错误的检测与处理

> 对应 LearnCpp 9.4 — Detecting and handling errors

### 15.1 假设失败的三个场合

大多数 bug 都来自**错误的假设**。假设最常见的失效之处：

1. **函数返回值** —— 假设被调用的函数成功了，但其实没有
2. **输入** —— 假设用户输入、文件输入或网络输入的格式和语义都正确
3. **参数** —— 假设你的调用者传进来的参数是合法的

防御式编程 —— 写能在这些假设失效时还能存活的代码 —— 意味着**显式检查每一类**，而不是相信它们。

### 15.2 四种错误处理策略（总览）

当一个函数检测到错误时，它有四种处理方式：

| 策略 | 适用场景 |
|------|---------|
| **1. 在函数内部处理** | 错误可以本地恢复（重试、回退到默认值、取消操作） |
| **2. 把错误返回给调用者** | 调用者更清楚怎么办（返回 `bool`、sentinel 值或 `std::optional`） |
| **3. 终止程序** | 错误是**致命的 / 不可恢复的** —— 继续运行只会产生垃圾数据或破坏状态 |
| **4. 抛出异常** | 需要跨多层调用栈的复杂传播（完整机制见后续课程 / LearnCpp 第 27 章） |

15.3–15.6 节分别展开每种策略。

### 15.3 策略 1：在函数内部处理

如果函数能就地恢复，就在检测到错误的地方立刻处理。两种常见模式：

**A) 重试直到成功** —— 典型的用户输入处理：

```cpp
#include <iostream>
#include <limits>

int readPositiveInt() {
    while (true) {
        int x{};
        std::cin >> x;
        if (std::cin && x > 0) return x;

        std::cin.clear();                                              // 清掉错误标志
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        std::cout << "请输入一个正整数：";
    }
}
```

**B) 忽略或取消，带警告** —— 当"不执行这个坏操作"是可以接受的：

```cpp
void printIntDivision(int x, int y) {
    if (y == 0) {
        std::cerr << "Error: division by zero\n";
        return;                          // 取消操作
    }
    std::cout << x / y;
}
```

> ⚠️ **隐藏的副作用：** 如果调用者依赖返回值或副作用，"静默取消"会让调用者以为操作成功了。这种策略**只在调用者无法区分**时才 work —— 通常是那种返回 `void`、只做副作用的函数。

### 15.4 策略 2：把错误返回给调用者

当函数不能本地决定怎么处理时，把错误往上抛给调用者。三种子方式：

**A) 把返回类型改成 `bool`**（成功/失败）：

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
    // 调用者处理失败
}
```

**B) Sentinel 值（哨兵值）** —— 用一个有特殊含义的返回值表示"出错"：

```cpp
constexpr double no_reciprocal{0.0};      // 0.0 永远不可能是合法的倒数

double reciprocal(double x) {
    if (x == 0.0) return no_reciprocal;   // 错误哨兵
    return 1.0 / x;
}
```

**Sentinel 值**是某个在特定函数语境中被赋予特殊含义的值。这里用 `0.0` 作为错误标记是合理的，因为 `1/x` 对任何实数 `x` 都不可能等于 `0.0` —— 所以调用者可以明确判断"我拿到的是哨兵吗？"

> ⚠️ **Sentinel 值只在返回类型里有"没被用到的值"可选时才 work。** 像 `int square(int x)` 这种，每个 `int` 都是合法返回值 —— 根本**没有哨兵可选**。这种情况要用 C 方式。

**C) `std::optional<T>`**（C++17）—— 显式表达"有值或无值"：

```cpp
#include <optional>

std::optional<int> parseInt(const std::string& s) {
    // ... 解析逻辑 ...
    if (invalid) return std::nullopt;      // "没有值"
    return parsed_value;                    // 实际值
}

auto result = parseInt(input);
if (result)
    std::cout << "got " << *result;         // 解引用访问
else
    std::cout << "parse failed";
```

`std::optional` 是**现代、类型安全**的方式来表达"这个函数可能没有有意义的结果"。即使返回类型里的每个值都可能是合法的，它也能工作 —— 不需要从值空间里偷一个当哨兵。

### 15.5 策略 3：终止程序

有些错误是**不可恢复的**（也叫**致命错误**，fatal error）—— 程序的状态已经坏到继续运行只会产生垃圾数据或破坏状态。这种情况就立刻终止。

```cpp
#include <cstdlib>

double doIntDivision(int x, int y) {
    if (y == 0) {
        std::cerr << "Fatal: divide by zero in doIntDivision\n";
        std::exit(1);                       // 以非零状态码终止
    }
    return static_cast<double>(x) / y;
}
```

**几种终止方式对照：**

| 函数 | 行为 | 什么时候用 |
|------|------|----------|
| `return 1;` from `main()` | 正常退出 + 错误状态码 | 错误是在 `main()` 本身（或一个能 return 回去的直接被调者）检测到的 |
| `std::exit(code)` | 立即终止 —— **会运行**静态对象析构函数和 `atexit` 回调 | 深在调用栈里，但干净关闭仍然可能 |
| `std::abort()` | 立即异常终止 —— **跳过**清理，可能 dump core | bug 暗示内存 / 状态已损坏，运行析构函数本身可能危险 |
| `assert(cond)` | 如果 `cond` 为假就 `abort()` —— 在 release 构建里会被**编译掉**（`NDEBUG`） | 开发期检查不变量；`assert` 失败意味着程序员 bug，不是坏输入 |

> 💡 **经验法则：** 终止是一种粗暴的手段。只在**真正不可恢复**的场景才用 —— 而不是"我懒得写错误路径"。如果调用者本来能合理处理，优先用策略 2。

### 15.6 策略 4：抛出异常

C++ 有完整的异常机制（`throw` / `try` / `catch`），能把错误**自动沿调用栈向上传播**直到有人捕获。这把错误检测和错误处理**解耦**到多个函数层：

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

异常的完整内容见 LearnCpp 第 27 章以及 ICS 45C 后续课程。对 Week 3 来说你只需要知道**它存在**，作为第四种策略 —— 你现在还不需要自己写 `try` / `catch`。

### 15.7 错误往哪里打印 —— `std::cout` vs `std::cerr`

C++ 给了你两个输出流，它们**不能互换**：

- **`std::cout`** —— 标准输出，用于正常的程序输出和面向用户的结果
- **`std::cerr`** —— 标准错误，用于错误信息和诊断

**为什么分开？** 任何 Unix-like 系统（以及 Windows）都允许在 shell 里**分别重定向**它们：

```bash
./myprog > output.log 2> error.log    # cout → output.log，cerr → error.log
./myprog 2>/dev/null                   # 丢弃错误信息，保留正常输出
./myprog | grep something              # 只把 cout 管道出去；cerr 仍然在终端显示
```

如果你把错误送到 `cout`，它们就会和正常输出混在一起，事后没办法过滤掉。送到 `cerr` 能让两个流保持独立 —— 用户可以分别捕获。

**指南：**

| 输出类别 | 去哪里 |
|---------|-------|
| 正常程序结果 | `std::cout` |
| 交互程序里的"请输入一个正整数"之类提示 | `std::cout`（用户在正常流程里能看到）|
| 诊断 / 警告 / 内部错误信息 | `std::cerr` |
| 进度指示器、百分比、日志性输出 | `std::cerr`（这样不会污染管道输出）|
| 非交互工具（命令行 CLI）的错误 | `std::cerr` |

> 💡 **`std::cerr` 默认是不带缓冲的** —— 错误信息会立刻出现，即使程序一瞬间之后崩溃。这是另一个用它输出错误的理由：你不会因为缓冲没刷出去就丢掉最后几条信息（见 12.5 节）。

### 15.8 正常路径与异常路径测试

**防御式编程** = 主动预想代码可能怎么被误用（被用户、被其他开发者、或被未来的你自己）—— 然后写出能在那些情况下存活的代码。

每个函数概念上都有两条执行路径：

- **正常路径（happy path）**：一切合法、没有意外时走的代码路径。容易测；大多数新手只测到这里。
- **异常路径（sad path）**：出问题时走的代码路径 —— 非法输入、坏参数、依赖失败、意外状态。**真正的 bug 都藏在这里。**

```cpp
void printDivision(int x, int y) {
    // 正常路径
    if (y != 0) {
        std::cout << x / y;
        return;
    }
    // 异常路径 —— 别忘了测这里！
    std::cerr << "Error: division by zero\n";
}
```

> ✅ **最佳实践：** 对你写的每个函数，都明确问自己"**异常路径是什么？**" 然后为它补上测试用例。如果你的答案是"这个函数没有异常路径"，那大概率是你漏考虑了 —— 大多数函数都可能被传入非法参数、拿到坏输入，或者它的依赖失败。

这条直接呼应 13.5 节（测试不同类别的输入）和 13.6 节（覆盖率是必要条件、不是充分条件）：**只覆盖 happy path**并不能告诉你 sad path 是不是对的。

---

## 16. 自定义 String 类 —— 课堂 PPT 补充

> 来自课堂 PPT：Strings（String.hpp、辅助函数、TDD 开发流程）

### 16.1 String 类的架构

课程中的自定义 `String` 类内部使用定长 `char` 缓冲区：

```cpp
class String {
    static constexpr int MAXLEN = 256;
    char buf[MAXLEN];
public:
    explicit String(const char* s = "");  // 从 C 字符串构造
    String(const String& s);              // 拷贝构造函数
    String& operator=(const String& s);   // 拷贝赋值
    // ... 其他方法
};
```

### 16.2 拷贝构造函数与拷贝赋值（三法则 / Rule of Three）

`String` 类声明了两个之前我们见过但从没正式定义的特殊成员函数 —— **拷贝构造函数**和**拷贝赋值运算符**。它们加上析构函数合称为 **三法则（Rule of Three）**：如果你的类需要自定义这三个中的任何一个，通常就需要**全部三个**。

| 特殊函数 | 签名 | 什么时候被调用 |
|---------|------|--------------|
| **析构函数** | `~String()` | 对象离开作用域或被显式销毁时 |
| **拷贝构造函数** | `String(const String& other)` | 从一个已有 `String` **初始化**一个新 `String` 时 |
| **拷贝赋值** | `String& operator=(const String& other)` | 一个**已经构造好**的 `String` 被另一个重新赋值时 |

**怎么判断调用哪个？** 关键看 `*this` 是**已经存在**还是**正在被创建**：

```cpp
String a{"Hello"};
String b{a};         // ← 拷贝构造：b 正在从 a 被创建
String c;            // 默认构造：c 现在存在，内容为空
c = a;               // ← 拷贝赋值：c 已经存在，现在被 a 覆盖
```

初学者常见的一个困惑：`String b = a;` **也**是调用拷贝构造函数，不是赋值运算符 —— 因为 `b` 是**正在被初始化**，不是被重新赋值。这里的 `=` 是**初始化语法**，不是赋值。

**拷贝构造函数 —— 从一个源对象构建 `*this`：**

```cpp
String::String(const String& other) {
    strcpy(buf, other.buf);  // 把源的缓冲区拷贝到我们自己的
}
```

注意它的参数是 `const String&`：
- **`&`** 是为了避免无穷递归（如果按值传递，为了构造参数本身又要调用拷贝构造函数……又要调用拷贝构造函数……栈溢出）
- **`const`** 是为了承诺不修改源对象

**拷贝赋值 —— 安全地用源对象的内容替换 `*this` 的现有内容：**

```cpp
String& String::operator=(const String& other) {
    if (this == &other) return *this;   // 防御自赋值（a = a）
    strcpy(buf, other.buf);             // 用 other 的内容覆盖我们的
    return *this;                        // 按引用返回 *this 以支持链式赋值
}
```

三个关键点：

1. **自赋值防御（`this == &other`）：** 防止 `a = a` 出问题。对于 `String` 这种有定长 `char` 缓冲区的简单类，自赋值是无害的，但对于"先释放旧内存、再分配新内存"的类，没有这个防御的话自赋值会先把源数据释放掉，再去拷贝已经消失的数据 —— 灾难。现在就养成习惯。

2. **按引用返回 `*this`：** 让你可以写 `a = b = c;` 这样的链式赋值。如果返回值是 `void` 或按值返回，链式赋值就废了。

3. **已有内容：** 和拷贝构造函数不同，赋值运算符运行时 `*this` **已经持有数据**了。对于管理指针或文件句柄的类，你需要先释放旧资源再接受新资源。`String` 用的是定长缓冲区，`strcpy` 直接覆盖就行，不需要清理。

> 💡 **为什么叫"三法则"？** 如果你的类需要为 {析构函数、拷贝构造函数、拷贝赋值} 中的**任何一个**写自定义行为，那它几乎必然需要为**全部三个**写自定义行为 —— 因为这三个都会触及资源管理逻辑。编译器会给每一个生成平凡的默认实现；只要其中一个变得非平凡，其它两个通常也需要跟着改。

> ⚠️ **对 `String` 这种有定长 `char buf[MAXLEN]` 的类，事实是：** 编译器生成的默认实现其实是能工作的 —— `buf` 就是对象的一部分，默认逐成员拷贝正好得到正确结果。HW3 仍然要求你**显式实现**这三个方法，一方面是为了练习，另一方面是为了让拷贝语义在代码里显式可见，更重要的是为了让你理解这些机制 —— 到了 Week 4 以后你会遇到**真正管理动态内存**的类，那时候这些知识就是刚需了。

### 16.3 静态辅助函数 vs 公有方法

| 静态辅助函数 | 公有方法 |
|------------|---------|
| 通用（如 `strlen`、`strcpy`） | 有 `this` 对象 |
| 不知道 `MAXLEN` | 做错误检查（大小限制） |
| 不做错误检查 | 调用辅助函数完成工作 |
| 包含低层次的循环 | 更高层的接口 |
| 可在 HW3 和 HW4 复用 | 专属于 `String` 类 |

### 16.4 strlen() 与 strcpy() —— 核心辅助函数实现

这些是几乎每个公有方法都会依赖的基础辅助函数。来自课堂 PPT（Strings p6）：

```cpp
// 返回 C 字符串的逻辑长度（不含 '\0'）
int strlen(const char src[]) {
    int len = 0;
    while (src[len] != '\0')
        ++len;
    return len;
}
```

```cpp
// 把 src 拷贝到 dest（包括 '\0'）
// 调用者必须保证 dest 足够大
char* strcpy(char* dest, const char* src) {
    int i = 0;
    while (src[i] != '\0') {
        dest[i] = src[i];
        ++i;
    }
    dest[i] = '\0';  // 别忘了空终止符！
    return dest;
}
```

> ⚠️ **这些辅助函数不做任何错误检查，也不知道 MAXLEN。** 调用它们的公有方法才负责边界检查。这种职责分离是 HW3 的核心设计原则。

> 💡 **Python 对比：** `strlen` ≈ `len(s)`，`strcpy` ≈ `dest = src`（但在 C 里你必须逐字符手动拷贝）。

### 16.5 TDD 开发流程（8 步）

来自课堂 —— 实现每个方法的流程：

1. **挑一个**公有方法（例如 `reverse()`）
2. **写一个**标准测试用例
3. **识别 / 发明**有用的辅助函数（例如 `reverse_cpy()`）
4. **写**公有方法，只用辅助函数
5. **写**辅助函数
6. **独立测试**辅助函数
7. **测试**公有方法
8. **复盘**：能否更高效？命名更好？能否抽出更多辅助函数？

### 16.6 示例：reverse() 实现

```cpp
// 辅助函数：把 src 反转后拷贝到 dest
void reverse_cpy(char* dest, const char* src) {
    int src_len = strlen(src);
    int src_index = src_len - 1;
    int dest_index = 0;
    for (; dest_index < src_len; ++dest_index, --src_index)
        dest[dest_index] = src[src_index];
    dest[dest_index] = '\0';  // 别忘了空终止符！
}

// 公有方法
String String::reverse() {
    String temp;
    reverse_cpy(temp.buf, this->buf);
    return temp;
}
```

### 16.7 测试私有辅助函数 —— "改成 public" 小技巧

来自课堂 PPT（Strings p14）：像 `reverse_cpy` 这样的辅助函数通常是 `private`（或 `static private`）。那怎么直接测它们呢？

**小技巧：** 临时把类定义中的 `private:` 改成 `public:`，写完测试之后再改回来。

```cpp
// 在 student_gtests.cpp（或 standard_main.cpp）中：
void test_reverse_cpy() {
    cout << "Testing reverse_cpy()" << endl;
    char A[100] = "Hello World";
    char R[100];
    String::reverse_cpy(R, A);   // 只有把 reverse_cpy 改成 public 才能用！
    cout << "|" << A << "| reversed is |" << R << "|" << endl;
    cout << "strlen(" << A << ") is " << strlen(A) << endl;
    cout << "strlen(" << R << ") is " << strlen(R) << endl;
}
```

**测试循环（来自课堂 p15-16）：**

```
测试辅助函数 → 能用吗？ ─── 否 → 修辅助函数，重新测
                       └── 是 → 加更多边界情况
                                 └── 想不出更多了 → 去测公有方法

测试公有方法 → 能用吗？ ─── 否 → 修公有方法，重新测
                       └── 是 → 加边界测试
                                 └── 想不出更多了 → 第 8 步（复盘 & 优化）
```

> 💡 **课堂口诀：** "How NOT to write correct code" —— 别说"回头再整理"。**现在**就整理。函数超过 5 行就重构。每一块都要测试。

### 16.8 示例：operator+() 实现

```cpp
String String::operator+(const String s) {
    String R;
    strcpy(R.buf, buf);
    strncat(R.buf, s.buf, MAXLEN - 1);  // 防止溢出
    return R;
}
```

> ⚠️ **错误检查：** 只要字符串可能变长，就必须检查结果不超过 `MAXLEN`。

### 16.9 indexOf() 与 strstr()

```cpp
int String::indexOf(const String& s) {
    char* p = strstr(buf, s.buf);  // 查找子串
    if (p != nullptr)
        return p - buf;  // 指针运算得出索引
    else
        return -1;
}
```

> 💡 `p - buf` 之所以能用，是因为两个指针指向同一个数组。结果是它们之间元素的数量。

---

## 17. static 关键字

> 对应 LearnCpp 7.11 — Static local variables  
> 结合 LearnCpp 15.6 / 15.7 — Static member variables / functions

在 C++ 里，`static` 是一个**身兼数职**的关键字 —— 它出现在不同位置就有完全不同的含义。本节梳理它的所有主要用法，因为这几种用法你在本课程里（以及本笔记前面的章节里）都会见到。

> ⚠️ **不要混淆：**
> - `static`（存储类 / 存储期）—— 本节主题
> - `static_cast<T>(x)` —— **类型转换运算符**，和 `static` 关键字完全无关
> - "静态类型语言"（statically typed language）—— 描述 C++ 在编译期做类型检查的特性，也无关

### 17.1 静态局部变量（Static Local Variables）

在函数内部，**普通**的局部变量每次调用函数时都会新建，函数返回时销毁。而 **`static` 局部变量**不同：它**只初始化一次**（第一次控制流到达声明处时），**在整个程序运行期间都存活**。

```cpp
void counter() {
    static int count{0};  // 只初始化一次，不是每次调用都初始化
    ++count;
    std::cout << count << '\n';
}

counter();  // 打印 1
counter();  // 打印 2
counter();  // 打印 3
```

**这为什么重要？** 它让你可以**安全地按引用返回**一个看起来像局部变量的东西 —— 就是本笔记前面 `getProgramName()` 例子里的那个技巧：

```cpp
const std::string& getProgramName() {
    static const std::string s_programName{"Calculator"};  // 只构造一次，永久存活
    return s_programName;  // ✅ 不是悬垂引用
}
```

如果去掉 `static`，`s_programName` 会在函数返回时被销毁，返回的引用就悬垂了。加上 `static` 之后，对象一直活到程序结束。

> 💡 **初始化时机：** 静态局部变量在**运行时第一次**到达其声明处时才初始化 —— 不是在程序启动时。在那之前它被零初始化。

> 💡 **命名习惯：** 很多代码库给静态局部变量加 `s_` 前缀，让它在视觉上和普通局部变量区分开。

**Python 对比：** Python 里没有完全对应的概念。最接近的类比是函数里用可变对象作默认参数（`def f(cache=[]):`）—— 跨调用保持状态，但机制完全不同。

### 17.2 静态成员变量（Static Member Variables）

在类里，`static` 表示这个成员**属于类本身**，不属于任何特定实例。所有实例共享同一份存储：

```cpp
class Counter {
public:
    static int count;         // 在类中声明
    Counter() { ++count; }
};

int Counter::count = 0;       // 在类外定义（非 inline 静态成员必须这样做）

Counter a, b, c;
std::cout << Counter::count;  // 3 —— 所有实例共享
```

**访问语法：** 地道写法是 `ClassName::member`（虽然 `instance.member` 也能编译）。

**C++17 inline 变量**让你可以直接在类内部初始化静态成员，不需要再在类外写一次定义：

```cpp
class Counter {
public:
    inline static int count = 0;  // 直接在这里定义
};
```

**`constexpr` 静态成员**隐式就是 `inline`，所以不需要加 `inline` 就能直接在类里初始化：

```cpp
class String {
    static constexpr int MAXLEN = 256;  // ✅ 直接写 —— constexpr 隐式 inline
    char buf[MAXLEN];
};
```

这正是本笔记前面"自定义 String 类"章节里的用法 —— `MAXLEN` 被所有 `String` 实例共享，并且在编译期就固定下来。

### 17.3 静态成员函数（Static Member Functions）

在类里，给函数加 `static` 意味着**没有 `this` 指针** —— 这个函数不针对任何特定实例。它本质上就是一个带命名空间的自由函数。

```cpp
class Math {
public:
    static int square(int x) { return x * x; }
};

int r = Math::square(5);  // 不需要实例即可调用
```

**关键限制：**
- 不能访问非静态成员（没有 `this`）
- 不能声明为 `const`（没有对象让它 const）
- 用 `ClassName::` 语法调用（虽然 `instance.staticFn()` 也能编译）

**什么时候用：**
- 和类相关但不操作实例的工具 / 辅助函数
- 返回类新实例的工厂函数
- 前面"自定义 String 类"章节里的 TDD 辅助函数模式 —— 像 `strlen`、`strcpy` 这种"不知道 `MAXLEN`"的辅助函数通常写成 `static private`

```cpp
class String {
private:
    static int strlen(const char src[]);            // 辅助函数，没有 `this`
    static char* strcpy(char* dest, const char* src);
public:
    int length() const { return strlen(buf); }     // 公有方法委托给静态辅助
};
```

### 17.4 第四种含义（完整性补充）

在**文件作用域**（任何函数和类之外）写 `static`，会赋予名字**内部链接性** —— 它只在当前翻译单元（`.cpp` 文件）中可见：

```cpp
// util.cpp
static int counter = 0;  // 只在 util.cpp 中可见，其他文件看不到
```

这是从 C 继承来的用法。**现代 C++ 更推荐无名命名空间**来达到同样效果：

```cpp
namespace {
    int counter = 0;  // 和文件作用域 `static` 效果相同，更符合现代习惯
}
```

在 ICS 45C 里你大概率不会自己写这种用法，但它解释了为什么 `static` 有这么多层含义 —— 每一层都来自 C / C++ 设计史上不同的阶段。

### 17.5 速查表

| `static` 出现位置 | 含义 |
|------------------|------|
| 函数内部的局部变量 | 只初始化一次；存活到程序结束 |
| 类成员变量 | 所有实例共享；用 `Class::member` 访问 |
| 类成员函数 | 没有 `this`；用 `Class::function()` 调用 |
| 文件作用域变量 / 函数 | 内部链接性（只在当前 `.cpp` 可见） |

> 💡 **口诀：** 看见 `static`，就想**"一份，持久"** —— 要么每个程序一份（局部 / 文件作用域），要么每个类一份（成员）。

---

## 18. 综合速查表

### C 风格数组 / 指针速查

| 表达式 | 等价写法 | 结果 |
|-------|---------|------|
| `arr[i]` | `*(arr + i)` | 索引 i 处的元素 |
| `&arr[0]` | `arr`（退化后） | 首元素的地址 |
| `arr + n` | — | 元素 n 的地址 |
| `sizeof(arr)` | — | 总字节数（不退化） |
| `strlen(s)` | — | C 字符串逻辑长度（不含 `'\0'`） |

### 字符串类型对比

| 特性 | `char[]`（C 字符串） | `std::string` | 自定义 `String` 类 |
|------|--------------------|---------------|-------------------|
| 动态大小 | ❌ 定长 | ✅ | ❌ 定长（MAXLEN） |
| 用 `=` 赋值 | ❌ | ✅ | ✅（已重载） |
| 用 `==` 比较 | ❌（比的是指针） | ✅ | ✅（如果已重载） |
| 空字符结尾 | ✅ 必须 | ✅（内部） | ✅（内部） |
| 知道自己的长度 | `strlen()` —— O(n) | `.size()` —— O(1) | `strlen(buf)` —— O(n) |

### 运算符重载决策指南

```
你要重载哪个运算符？
├── =、[]、()、-> → 必须是成员函数
├── <<、>>（I/O）→ 必须是非成员（友元或普通函数）
├── 一元（+、-、!、++、--）→ 优先用成员
├── 二元且不修改左操作数（+、-、*、/）→ 优先用非成员
└── 二元且修改左操作数（+=、-=、*=）→ 优先用成员
```

### 文件 I/O 速查

```cpp
#include <fstream>

// 逐行读完整个文件
std::ifstream in("file.txt");
std::string line;
while (std::getline(in, line)) { /* 处理 line */ }

// 写入文件
std::ofstream out("file.txt");
out << "content" << '\n';

// 追加到文件
std::ofstream out("file.txt", std::ios::app);
```

### Python vs C++ 对比（Week 3 新增）

| Python | C++ | 备注 |
|--------|-----|------|
| `str`（不可变） | `std::string`（可变） | C++ 字符串可以原地修改 |
| `input()` | `std::getline(std::cin >> std::ws, s)` | 读整行 |
| `s.find(sub)` | `s.find(sub)` 或自定义 `indexOf()` | 返回索引或 `npos`/`-1` |
| `s[::-1]` | 自定义 `reverse()` | C 字符串没有内置的一行写法 |
| `open("file")` | `ifstream in("file")` | 文件 I/O 类 |
| `with open(...) as f:` | RAII —— 析构函数关闭文件 | 基于作用域的清理 |
| `list[i]` | `arr[i]` 或 `*(ptr + i)` | 指针运算是下标访问的底层 |
| 动态 list | 定长 C 数组 + 长度参数 | 必须单独传长度 |
| `**`（幂） | 没有对应运算符 | 不能创建 `operator**` |

**Week 3 的 5 个最重要结论：**

1. **数组退化会丢失长度信息**：传给函数时，C 数组变成指针 —— 必须单独传长度
2. **C 字符串是以空字符结尾的 char 数组**：`'\0'` 标记逻辑结尾；用 `s[i] != '\0'` 遍历
3. **operator<< 必须是非成员函数**：因为左操作数是 `ostream`，不是你的类
4. **永远不要按引用返回局部变量**：函数结束时它就被销毁了 → 悬垂引用
5. **String 类的 TDD**：写测试 → 写辅助函数 → 测辅助函数 → 写公有方法 → 测方法 → 优化