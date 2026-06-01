# Information and Computer Science 45C — Week 7 整合学习笔记

## 目录

- [1. 周学习目标](#1-周学习目标)
- [2. 泛型编程的动机](#2-泛型编程的动机)
- [3. 函数模板：语法与语义](#3-函数模板语法与语义)
- [4. 函数模板的实例化](#4-函数模板的实例化)
- [5. 类模板（Template Classes）](#5-类模板template-classes)
- [6. 非类型模板参数](#6-非类型模板参数)
- [7. Lambda — 匿名函数](#7-lambda--匿名函数)
- [8. Lambda 捕获](#8-lambda-捕获)
- [9. 为什么需要异常](#9-为什么需要异常)
- [10. 异常处理基础 — throw、try、catch](#10-异常处理基础--throwtrycatch)
- [11. 异常、函数与栈展开](#11-异常函数与栈展开)
- [12. 未捕获的异常与 catch-all 处理器](#12-未捕获的异常与-catch-all-处理器)
- [13. 异常类与继承](#13-异常类与继承)
- [14. 异常规范与 noexcept](#14-异常规范与-noexcept)
- [15. Friend 非成员函数](#15-friend-非成员函数)
- [16. 字符串流（stringstream）](#16-字符串流stringstream)
- [17. 来自 Topic 6 PPT 的遗留主题：多继承、虚基类与零规则](#17-来自-topic-6-ppt-的遗留主题多继承虚基类与零规则)
- [18. Namespaces（命名空间）](#18-namespaces命名空间)
- [19. Week 7 综合 Cheat Sheet](#19-week-7-综合-cheat-sheet)
- [20. Week 7 最重要的五条记忆](#20-week-7-最重要的五条记忆)

> UCI ICS 45C: Programming in C++ (35770)
> 本笔记整合 Week 7 阅读材料：LearnCpp 11.6、11.7（函数模板）+ 26.1、26.2（类模板与非类型参数）+ 20.6、20.7（lambda 与捕获）+ 27.1–27.5、27.9（异常处理与 `noexcept`）+ 15.8（friend 非成员函数）+ 28.4（字符串流）。内容按概念主题组织。
> Klefstad 教授本周只布置了一份 PPT *Topic 6*；其中大部分内容（继承、虚函数、抽象类、虚析构函数、Shape/Picture 框架）已经在 Week 6 笔记里整合过。剩下涉及 **多继承与虚基类** 的几张幻灯片（27、29–31、33）由于在 Week 6 笔记里被标注为"可能属于 Week 7"，在本笔记的第 17 节再回头处理。
> 来自 Klefstad *Topic 7* PPT 的额外内容 —— **零规则**（§17.8）、**用非模板重载来"特化"模板**（§4.13）、**修订后的函数决议算法**（§4.14）、**形参匹配规则**（§4.15）、**模板参数默认值**（§5.8）、**成员模板**（§5.9）、**命名空间**（§18）—— 也已经和 LearnCpp 的内容整合在一起。

---

## 1. 周学习目标

> Week 7 五个概念板块的鸟瞰

### 1.1 模板（chapters 11.6–11.7 + 26.1–26.2）

- 理解：**为什么需要模板** —— 避免为每种类型手工写一份重载
- 掌握：**函数模板** 的 `template <typename T>` 语法
- 掌握：编译器如何在调用点 **实例化（instantiate）** 模板（以及生成出来的函数被放在哪里）
- 理解：**模板实参推导** vs 显式指定 `<T>`
- 掌握：写 **类模板**（例如 `Array<T>`）
- 理解：为什么模板定义通常放在 **头文件** 里（拆分时的链接器问题）
- 学会：**非类型模板参数** —— 把 `constexpr` 值（比如数组大小）作为模板参数传入

### 1.2 Lambda（chapters 20.6–20.7）

- 理解：lambda 就是一个 **就地定义的匿名函数**
- 掌握：`[ captures ] ( params ) -> ret { body }` 语法
- 区分：**按值捕获** vs **按引用捕获**；`mutable` 的作用
- 掌握：**默认捕获** `[=]`、`[&]` 以及它们的组合
- 理解：**悬挂的捕获引用**（生命周期陷阱）
- 留意：可变 lambda 被意外拷贝的问题（`std::function`、`std::ref`）

### 1.3 异常（chapters 27.1–27.5、27.9）

- 理解：**为什么需要异常** —— 把错误处理与正常控制流解耦
- 掌握：**`throw` / `try` / `catch`** 三元组以及 catch 块匹配规则
- 掌握：**栈展开（stack unwinding）** —— 异常如何沿调用栈向上传播
- 理解：**未捕获异常** 会发生什么（`std::terminate`）
- 掌握：**catch-all 处理器** `catch(...)`
- 掌握：写 **异常类**，使用 **`std::exception` / `std::runtime_error`**
- 理解：以 **`const` 引用** 捕获异常类对象可以防止对象切片（slicing）
- 理解：派生类 catch 必须排在基类 catch **之前**
- 掌握：**`noexcept`** 修饰符 + 四级异常安全保证

### 1.4 Friend 函数（chapter 15.8）

- 理解：`friend` 声明 **选择性地授予** 对私有/受保护成员的访问权
- 掌握：在类内声明 **friend 非成员函数**
- 最佳实践：当公共接口能满足需要时，**优先用非 friend 非成员函数**

### 1.5 字符串流（chapter 28.4）

- 理解：`std::stringstream` 是一个 **以 `std::string` 为缓冲区的流**
- 掌握：`<<` 插入、`>>` 提取、`str()` 读写整个缓冲区
- 掌握：用 stringstream 在 **字符串与数字之间互转**
- 掌握：如何 **清空** stringstream 以便复用（`str("")` + `clear()`）

---

## 2. 泛型编程的动机

> 对应 LearnCpp 11.6 —— 开篇

### 2.1 问题：被类型绑住的重载

假设你想写一个返回两个数中较大者的函数 `max`。给 `int` 写一个：

```cpp
int max(int x, int y)
{
    return (x < y) ? y : x;
    // Note: we use < instead of > because std::max uses <
}
```

这只对 `int` 有用。要支持 `double`，你必须再写一份几乎一模一样的重载：

```cpp
double max(double x, double y)
{
    return (x < y) ? y : x;
}
```

再为 `long`、`long double`、以及每一种用户自定义类型重复一遍，结果是：

- 维护噩梦（违反 DRY 原则）
- 滋生 bug 的温床（复制粘贴必出错）
- **天然不完备** —— 你永远没法预料到所有用户类型

> 💡 **核心洞察**
> 编译器可以用一份模板自动生成一组相关的函数或类，每一份用不同的实际类型。

### 2.2 模板的"喷漆模板"类比

LearnCpp 给的心智模型：把模板想象成 **喷漆用的镂空模板（stencil）**。

stencil 是一张薄薄的塑料或纸板，上面刻了一个形状的镂空。你把它压在表面上，对着洞喷漆 —— 同一个 stencil 可以喷出红色、蓝色、绿色的同一个形状。**颜色不是在做 stencil 的时候定下来的，而是在用它的时候才定**。

C++ 模板就是同一个思路。模板作者只写一次"图样"。用户调用 `<int>` 时编译器喷一个 `int` 版本；调用 `<double>` 时喷一个 `double` 版本。作者不需要事先知道会传进来什么类型。

> 💡 **核心洞察**
> 模板可以用在 **写它的时候根本还不存在** 的类型上。这让模板代码既灵活又面向未来。

### 2.3 与 Python 的对比

| | Python | C++ |
|---|---|---|
| 默认就泛型 | 是 —— `def max(x, y)` 对任何可比较的类型都能用，因为 Python 是动态类型 | 否 —— 每个参数类型都要被静态检查 |
| 怎么获得泛型 | 内建（duck typing） | 用模板 |
| 类型检查何时发生 | 运行时（或像 mypy 那样的额外静态检查器） | 编译时（在模板被实例化时） |
| 失败模式 | 运行时抛 `TypeError` | 实例化时编译报错 |

在 Python 里 `def my_max(x, y): return x if x > y else y` 对任何一对可比较的值都"开箱即用"。C++ 有更强的编译期类型检查，所以我们需要 **模板** 来找回这种灵活性。

### 2.4 模板参数的三种类型

> 对应 LearnCpp 11.6 "For advanced readers"

C++ 支持三种模板参数：

1. **类型模板参数（type template parameter）** —— 一个类型的占位符（最常见，就是 `typename T` 这种）
2. **非类型模板参数（non-type template parameter）** —— 一个 `constexpr` 值的占位符（比如数组大小用的整数）；第 6 节细讲
3. **模板模板参数（template template parameter）** —— 一个模板本身的占位符（非常高阶，本课不涉及）

---

## 3. 函数模板：语法与语义

> 对应 LearnCpp 11.6（整章）

### 3.1 函数模板的解剖

**函数模板** 是一份 *类似函数的定义*，编译器用它按需生成具体函数。**模板本身不会被编译进可执行代码** —— 只有它的实例化才会。

把整数版 `max` 改成函数模板：

```cpp
template <typename T>             // template parameter declaration
T max(T x, T y)                   // function template definition
{
    return (x < y) ? y : x;
}
```

两个组成部分：

1. **模板参数声明** `template <typename T>` 引入一个占位类型 `T`。它的作用域严格限定在紧跟其后的那个函数（或类）定义里。
2. 凡是希望被泛化的具体类型出现的地方（这里是参数类型和返回类型），全部换成 `T`。

### 3.2 `typename` vs `class`

你会看到两种写法：

```cpp
template <typename T> void foo(T x);
template <class T>    void foo(T x);   // same thing
```

在这个语境里 **语义上没有区别**。`typename` 是后来加入的，是更推荐的写法，因为它清楚表明 `T` 可以是任意类型（包括 `int` 这种基本类型，不仅仅是类类型）。

### 3.3 给类型模板参数起名字

> 对应 LearnCpp 11.6 —— Best practice

对于 **平凡的** 使用场景，`T` 可以代表任意合理类型时：

```cpp
template <typename T>     // T, U, V, ...
T max(T x, T y);
```

> ⚠️ **最佳实践**
> 用单个大写字母（从 `T` 开始，如 `T`、`U`、`V`）命名"以平凡或显而易见的方式使用、可代表任意合理类型"的类型模板参数。
>
> 如果类型模板参数有不显然的用途或特殊要求，用更有描述性的名字（如 `Allocator` 或 `TAllocator`）。

### 3.4 用一个用户自定义类型走一遍

函数模板 `max<T>` 能与 **任何支持 `operator<` 的类型** 配合工作，包括写 `max` 时根本还不存在的类型。例如，给定一个定义了 `operator<` 的 `Fraction` 类，你可以调用 `max<Fraction>(a, b)`，编译器会自动喷出一份合适的版本。

> 💡 **核心洞察**
> 类型模板参数的"要求"是 **隐式的**：模板体里用到的任何操作，必须对你实例化用的那个类型有效。如果你用一个没有 `operator<` 的类型去实例化 `max<T>`，编译错误会出现在 *被实例化出来的那份函数内部*，而不是模板定义本身。

这也是为什么模板的错误信息常常很吓人 —— 编译器指给你看的那一行是喷出来的副本里的某一行，而不是你代码里触发错误的那一行。

---

## 4. 函数模板的实例化

> 对应 LearnCpp 11.7（整章）

### 4.1 调用一个函数模板

三种调用语法：

```cpp
template <typename T>
T max(T x, T y) { return (x < y) ? y : x; }

int main()
{
    std::cout << max<int>(1, 2) << '\n';  // explicit: stencil for int
    std::cout << max<>(1, 2)    << '\n';  // empty: deduce T from arguments, prefer template
    std::cout << max(1, 2)      << '\n';  // bare: deduce T, may prefer non-template overload
    return 0;
}
```

### 4.2 术语表

| 术语 | 含义 |
|---|---|
| **主模板（primary template）** | 模板定义本身，带类型参数 |
| **实例化（instantiation）** | 编译器从模板生成具体函数的过程 |
| **隐式实例化（implicit instantiation）** | 由函数调用触发的实例化 |
| **特化 / 函数实例（specialization / function instance）** | 被生成出来的那个具体函数 |

> 💡 **来自 LearnCpp 的命名说明**
> "Specialization"（特化）最常指的是 **显式特化**（26.3 章主题）—— 为某个特定类型手工定义模板的一个特殊版本。编译器自动生成的那份实例严格说也是 specialization，但通常叫 *函数实例（function instance）*。

### 4.3 编译器实际编译的是什么

给定：

```cpp
template <typename T>
T max(T x, T y) { return (x < y) ? y : x; }

int main() {
    std::cout << max<int>(1, 2)    << '\n';
    std::cout << max<int>(4, 3)    << '\n';
    std::cout << max<double>(1, 2) << '\n';
}
```

编译器实际等价地把它改写成：

```cpp
template <typename T>
T max(T x, T y);   // declaration only

template<>
int max<int>(int x, int y) { return (x < y) ? y : x; }       // stenciled

template<>
double max<double>(double x, double y) { return (x < y) ? y : x; }  // stenciled

int main() {
    std::cout << max<int>(1, 2)    << '\n';
    std::cout << max<int>(4, 3)    << '\n';   // reuses instance
    std::cout << max<double>(1, 2) << '\n';
}
```

两条重要规则：

1. 函数模板在每个翻译单元里 **第一次使用时才被实例化**。后续调用复用已有实例。
2. 如果一个函数模板从未被调用，它 **永远不会被实例化**，因此不会被编译进目标文件。

### 4.4 模板实参推导

当调用点的实参类型已经匹配你要的类型时，可以省略显式的 `<T>`：

```cpp
std::cout << max<int>(1, 2) << '\n';   // explicit
std::cout << max<>(1, 2)    << '\n';   // deduced
std::cout << max(1, 2)      << '\n';   // deduced, plus considers non-template overloads
```

`max<>` 与 `max` 的区别：

- `max<>(1, 2)` —— 空尖括号告诉编译器在解析这个调用时 **只考虑模板重载**。
- `max(1, 2)` —— 裸语法 **既考虑模板也考虑非模板** 重载。若有一个非模板的 `max(int, int)` 同样匹配，**非模板版本胜出**。

> 💡 **核心洞察**
> 普通函数调用语法在两者同等可行时，**优先选择非模板函数**而非模板实例。

为什么优先？非模板函数是 **特化** 的：它可以针对自己的具体类型做手工优化。模板实例必须是 *通用的*，可能不如手工版高效。例子：

```cpp
template <typename T>
void print(T x) { std::cout << x; }

void print(bool x) { std::cout << std::boolalpha << x; }  // prints "true"/"false"

print<bool>(true);  // prints 1   — template version forced
print<>(true);      // prints 1   — template-only consideration
print(true);        // prints true — non-template wins
```

> ⚠️ **最佳实践**
> 调用模板实例化函数时优先用裸调用 `max(1, 2)`，除非你确实需要让模板版本压过匹配的非模板版本。

### 4.5 模板参数与非模板参数混用

你可以把模板参数和非模板参数混在一起：

```cpp
template <typename T>
int someFcn(T, double)  // T is generic; double is fixed; int is the return type
{
    return 5;
}

someFcn(1, 3.4);      // matches someFcn<int>(int, double)
someFcn(1, 3.4f);     // float promoted to double — matches someFcn<int>(int, double)
someFcn(1.2, 3.4);    // matches someFcn<double>(double, double)
someFcn(1.2f, 3.4);   // matches someFcn<float>(float, double)
```

### 4.6 实例化出来的函数可能编不过（语法失败）

```cpp
template <typename T>
T addOne(T x) { return x + 1; }

int main() {
    std::string hello { "Hello, world!" };
    std::cout << addOne(hello) << '\n';   // ERROR: std::string + int is ill-formed
}
```

编译器看到没有非模板的 `addOne(std::string)`，找到模板，尝试喷出 `addOne<std::string>`。但 `std::string + 1` 不是合法语法，所以失败。解决办法很简单：别用 `std::string` 去调它。

### 4.7 实例化出来的函数可能在语义上没意义（语法却成功了！）

```cpp
template <typename T>
T addOne(T x) { return x + 1; }

int main() {
    std::cout << addOne("Hello, world!") << '\n';   // surprise: this compiles!
}
```

输出：

```
ello, world!
```

`addOne("Hello, world!")` 推导出 `T = const char*`（一个指针）。指针算术是合法 C++，所以 `"Hello, world!" + 1` 变成了指向首字符之后那个位置的指针 —— 结果就是 `"ello, world!"`。编译器不知道这在 *语义上* 是胡扯。

> ⚠️ **警告**
> 只要语法合法，编译器就会把语义上无意义的函数模板实例化并编译通过。用 *合理* 的实参去调用模板，是 *你* 的责任。

> 🔧 **进阶读者** —— 禁用某些实例化
> 通过模板特化加 `= delete`，可以禁止特定实参类型：
> ```cpp
> template <>
> const char* addOne(const char* x) = delete;   // emits a compile error if called
> ```

### 4.8 给非模板参数指定默认实参

跟普通函数一样，函数模板可以给它的非模板参数指定默认实参：

```cpp
template <typename T>
void print(T val, int times = 1)
{
    while (times--)
        std::cout << val;
}

print(5);        // prints "5"
print('a', 3);   // prints "aaa"
```

### 4.9 ⚠️ 函数模板里的静态局部变量

每一份实例都拥有它 **独立的一份** 静态局部变量副本：

```cpp
template <typename T>
void printIDAndValue(T value)
{
    static int id { 0 };           // each instance has its OWN id
    std::cout << ++id << ") " << value << '\n';
}

int main() {
    printIDAndValue(12);    // 1) 12      — printIDAndValue<int> instance
    printIDAndValue(13);    // 2) 13      — same instance, id is now 2
    printIDAndValue(14.5);  // 1) 14.5    — printIDAndValue<double> instance with its OWN id
}
```

`<int>` 版本和 `<double>` 版本各自有一份自己的 `id` 计数器。

> ⚠️ **警告**
> 如果一个函数模板含有 *可修改* 的静态局部变量，每个实例都会独立各拥有一份。这通常不是你想要的。

### 4.10 泛型编程（Generic Programming）

当模板类型参数可以被换成任意东西时，它们有时也叫做 **泛型类型（generic types）**，写模板这件事也叫做 **泛型编程**。心智的切换是：不再把焦点放在类型信息上，而是放在 **算法逻辑和数据结构设计** 上。

### 4.11 模板的代价

LearnCpp 在章末坦白列出了模板的缺点：

1. **代码膨胀（code bloat）**：每一份实例都会产生一份代码副本，可能拖慢编译和链接。
2. **错误信息晦涩**：实例化失败的错误以难读著称，常常一连几十行。

> ⚠️ **最佳实践**
> 在需要时用函数模板写泛型代码，让它能跟广泛的类型协作。从普通函数起步，等到需要为另一个类型加第二份重载时，再重构成模板。

### 4.12 与 Python 的对比

| | Python | C++ 函数模板 |
|---|---|---|
| 类型泛型 | 通过 duck typing 内建 | 通过 `template <typename T>` 显式开启 |
| 代价 | 无（解释器搞定） | 编译期为每个类型生成一份代码 |
| 错误何时报 | 运行时（尝试不支持的操作时） | 编译时（模板被实例化时） |
| 错误清晰度 | 通常清楚（`TypeError: '<' not supported between …`） | 通常晦涩（数页模板栈展开） |

### 4.13 用非模板重载来"特化"模板

> 对应 Klefstad 的 Topic 7 PPT —— "Specializing a Template Function"

模板生成的是**通用**实现。对某些类型来说，这套通用实现**不对**或者**效率低**。PPT 的经典例子是把 `min` 用在 C 风格字符串上：

```cpp
template <typename T>
T min(T a, T b) {
    return a < b ? a : b;
}

int   x = min(10, 20);       // OK：T 是 int
double y = min(10.5, 20.8);  // OK：T 是 double

// 但是对 C 字符串……
const char* p = min("apple", "banana");
// 实例化的是 min<const char*>(const char*, const char*)
// 它比较的是**指针的地址**，不是字符串内容。几乎肯定不是你要的。
```

修法：另外写一个**非模板重载**来专门处理这个特殊类型：

```cpp
char* min(char* a, char* b) {
    return strcmp(a, b) < 0 ? a : b;     // 比较的是字符串**内容**
}
```

之后：
- 实参是 `char*` 时，调用挑中非模板版本 `min(char*, char*)`。
- 其他类型继续走模板。

> 💡 **关键洞见**
> Klefstad 的 PPT 把这种做法叫做"特化模板"，但严格来说 C++ 还有另一种**显式模板特化**写法（`template <> char* min(char*, char*) { … }`）。用非模板重载这条路更简单，跟重载决议天然兼容，也是 PPT 上展示的写法。

### 4.14 修订后的函数决议算法

> 对应 Klefstad 的 Topic 7 PPT —— "Revised Function Resolution Algorithm"

当一个调用点既有非模板重载、又有函数模板可用时，编译器按下面的顺序解析：

1. **收集所有非模板函数**中能精确匹配这次调用的（实参类型与形参类型一致）。
2. 如果不止一个匹配 → **歧义错误**。
3. 如果恰好一个匹配 → **选它**。
4. 如果一个都没匹配上，**检查所有能为此调用生成的模板实例**。
5. 如果不止一个模板能匹配 → **歧义错误**。
6. 如果恰好一个模板匹配 → **实例化（若尚未实例化）并选它**。
7. 还是没有，再回头**让非模板允许隐式类型转换**，看看能不能凑上一个。

> 💡 **关键洞见**
> **精确匹配的非模板重载**最先胜出。模板比"必须做类型转换才能匹配的非模板"更优先。这就是为什么手写的 `min(char*, char*)` 能赢过 `min<const char*>`。

§4.4 里那个 `print(true)` 之所以打印 `true` 而不是 `1`，也是这个原因：非模板 `print(bool)` 直接精确匹配，比模板优先。

### 4.15 形参匹配规则（const 与引用正确性）

> 对应 Klefstad 的 Topic 7 PPT —— "Parameter Matching"

下面这套规则对**所有**函数调用都成立（无论是不是模板），但当模板需要推导出引用 / const 限定的类型时尤其重要。

| 形参 | 能匹配非 const 实参吗？ | 能匹配 const 实参吗？ | 能匹配字面量吗？ |
|------|:--:|:--:|:--:|
| `T`（按值）        | ✓ | ✓ | ✓ |
| `T&`（非 const 引用） | ✓（必须是左值） | ✗ | ✗ |
| `const T&`         | ✓ | ✓ | ✓（会创建匿名临时对象） |
| `T*`               | ✓ | ✗ | 视情况 |
| `const T*`         | ✓ | ✓ | ✓ |

**走几个例子：**

```cpp
// 1. 非 const 形参不能绑 const 实参
strcat("Hello", "World");        // ERROR：字面量类型是 const char[]，strcat 要求 char*

// 2. const 形参 const / 非 const 都能接
int len1 = strlen("Hello");      // OK：字面量是 const
char s[] = "Hello";
int len2 = strlen(s);            // OK：数组退化为 char*，再转 const char* 也合法

// 3. const T& 会为字面量创建匿名临时对象
template <typename T>
void print(const T& x) { std::cout << x; }
print(10);                       // OK：临时 int(10) 绑到 const int&

// 4. 普通 T& 必须接到真实的左值
template <typename T>
void swap(T& a, T& b) { /* ... */ }
int x = 10, y = 20;
swap(x, y);                      // OK：x、y 都是左值
swap(10, 20);                    // ERROR：字面量是右值
```

> ⚠️ **最佳实践**
> 如果模板参数只是想"读"传进来的对象，优先用 `const T&` —— 它什么都能接（左值、右值、const、非 const），还能避免大对象的拷贝。只有当函数需要**修改**调用方的对象时才用普通 `T&`。

---

## 5. 类模板（Template Classes）

> 对应 LearnCpp 26.1（整章）

### 5.1 动机例子：从 IntArray 到 Array&lt;T&gt;

假设你有一个 `IntArray` 类用来管理一个动态 `int` 数组：

```cpp
class IntArray
{
private:
    int  m_length{};
    int* m_data{};

public:
    IntArray(int length)
    {
        assert(length > 0);
        m_data   = new int[length]{};
        m_length = length;
    }

    IntArray(const IntArray&)            = delete;
    IntArray& operator=(const IntArray&) = delete;

    ~IntArray() { delete[] m_data; }

    void erase()
    {
        delete[] m_data;
        m_data   = nullptr;        // important — see Rule of Three discussion
        m_length = 0;
    }

    int& operator[](int index)
    {
        assert(index >= 0 && index < m_length);
        return m_data[index];
    }

    int getLength() const { return m_length; }
};
```

要是我们还要一个 `DoubleArray` 怎么办？复制粘贴、把 `int` 换成 `double` —— 维护噩梦。模板来救场：

```cpp
#ifndef ARRAY_H
#define ARRAY_H

#include <cassert>

template <typename T>                   // added
class Array
{
private:
    int m_length{};
    T*  m_data{};                       // type T instead of int

public:
    Array(int length)
    {
        assert(length > 0);
        m_data   = new T[length]{};     // allocate T objects
        m_length = length;
    }

    Array(const Array&)            = delete;
    Array& operator=(const Array&) = delete;

    ~Array() { delete[] m_data; }

    void erase()
    {
        delete[] m_data;
        m_data   = nullptr;
        m_length = 0;
    }

    // member function declared here, defined outside
    T& operator[](int index);

    int getLength() const { return m_length; }
};

// Member functions defined outside the class need their own template declaration
template <typename T>
T& Array<T>::operator[](int index)
{
    assert(index >= 0 && index < m_length);
    return m_data[index];
}

#endif
```

用法：

```cpp
Array<int>    intArray { 12 };
Array<double> doubleArray { 12 };
```

### 5.2 两条关键语法规则

1. 每个定义在类体 **外面** 的成员函数，都需要 **自己的** `template <typename T>` 声明。
2. **带模板实参的类名** 是 `Array<T>`（出现在 `T& Array<T>::operator[](…)` 这种位置）；在类体 **内部**，单写一个 `Array` 指代的是当前实例化（比如拷贝构造函数签名里）。

### 5.3 实例化规则（与函数模板相同）

- 类模板对每一组模板实参都是 **第一次使用时才实例化**。
- 如果你从未在任何地方用过 `Array<float>`，那就不会生成任何 `Array<float>` 的代码。
- 每一份实例都是一个独立的类型：`Array<int>` 和 `Array<double>` **互不可换**，彼此之间没有任何特殊关系。

### 5.4 为什么容器类那么爱用模板

`std::vector`、`std::array`、`std::map`、`std::set`、……整个标准容器库都是由类模板构成的。这是模板的典型用例：容器算法只写一次，就能为用户需要的任何元素类型实例化。

### 5.5 把类模板拆分到头/源文件里 —— 链接器陷阱

> 对应 LearnCpp 26.1 —— "Splitting up template classes"

对非模板类来说，常规布局是：

- **`.h`** 文件：类定义 + 成员函数声明
- **`.cpp`** 文件：成员函数定义

如果你对模板类也照搬这个布局：

**Array.h**（类模板 + 声明）：
```cpp
template <typename T>
class Array {
    /* ... */
    T& operator[](int index);   // declaration only
};
```

**Array.cpp**（成员函数定义）：
```cpp
#include "Array.h"

template <typename T>
T& Array<T>::operator[](int index) { /* ... */ }
```

**main.cpp**（用户代码）：
```cpp
#include "Array.h"

int main() {
    Array<int> a{10};
    a[0] = 5;       // uses Array<int>::operator[]
}
```

你会得到一个 **链接错误**：

```
undefined reference to `Array<int>::operator[](int)'
```

### 5.6 为什么链接器会失败

C++ 是 **独立地** 编译每个翻译单元：

1. **`main.cpp`** 编译时，`Array.h` 的内容被文本式地包含进来。编译器看到 `Array<int> a{10}`，需要实例化 `Array<int>` —— 但它只有 `operator[]` 的 **声明**，没有定义。于是它生成一个对 `Array<int>::operator[]` 的 **调用**，把找函数体的活儿交给链接器。
2. **`Array.cpp`** 编译时，`Array.h` 的内容也被包含，再加上 `operator[]` 的模板定义。但编译器 **没有理由** 在这里实例化 `Array<int>` —— `Array.cpp` 里没有任何东西真的用了 `Array<int>`。所以没有 `Array<int>::operator[]` 的函数体被生成。
3. 链接时，`main.o` 调用了 `Array<int>::operator[]`，但没有任何 `.o` 文件包含它的函数体。**链接错误。**

> 💡 **核心洞察**
> 要实例化一个模板，编译器必须 **同时** 看到完整的模板定义（不仅仅是声明）**和** 所需的具体模板类型，**在同一个翻译单元里**。

### 5.7 三种绕过办法

**方案 1（首选）**：把 **所有** 模板代码放进头文件。

```cpp
// Array.h
template <typename T>
class Array { /* ... */ };

template <typename T>
T& Array<T>::operator[](int index) { /* ... */ }   // definition in the header too
```

代价是：如果许多翻译单元都用同一份模板，每一个都会实例化自己的一份 —— 但链接器通常会把这些副本合并，最终可执行体不会膨胀。

**方案 2**：把实现挪到 `.inl` 文件（`.inl` = "inline"），在头文件末尾 include 它。

```cpp
// Array.h
template <typename T>
class Array { /* ... */ };

#include "Array.inl"   // included inside the header guard, at the bottom
```

> 🛠️ **小贴士**
> 如果你的构建系统不小心把 `.inl` 当 `.cpp` 编译了，会出现"重复定义"错误。把 `.inl` 文件排除出构建：Visual Studio 里设置 *Exclude From Build → Yes*；Code::Blocks 里取消勾选 *Compile file* 和 *Link file*。

**方案 3**：在一个单独的文件里做 **显式实例化（explicit instantiation）**：

```cpp
// templates.cpp
#include "Array.h"
#include "Array.cpp"   // breaking best practice, but only here

template class Array<int>;     // force instantiation of Array<int>
template class Array<double>;  // force instantiation of Array<double>
```

`template class Array<int>;` 这条指令强迫编译器在 `templates.cpp` 里把 `Array<int>` 的每个成员都喷出来。其他翻译单元只 include `Array.h`，链接器就能从 `templates.o` 解析它们的调用。

这种方法在大型项目里更省编译时间，但你必须手工把所有需要的实例化罗列出来。

### 5.8 模板参数默认值

> 对应 Klefstad 的 Topic 7 PPT —— "Template Parameter Defaults"

像普通函数能有默认实参一样，模板参数也可以有**默认值**：

```cpp
template <typename CharType = char, int Capacity = 100>
class basic_string {
    // 也可以是 wchar_t 字符串，但默认是 char 字符串
};

basic_string<>          s;       // CharType = char,    Capacity = 100
basic_string<wchar_t>   ws;      // CharType = wchar_t, Capacity = 100  （默认容量）
basic_string<char, 256> big;     // 两个都显式给出
```

标准库到处都是这种写法：

- `std::basic_string<CharT, Traits = char_traits<CharT>, Alloc = allocator<CharT>>`
  - `std::string`  = `std::basic_string<char>`
  - `std::wstring` = `std::basic_string<wchar_t>`
- `std::vector<T, Allocator = std::allocator<T>>`
- `std::set<Key, Compare = std::less<Key>, Allocator = std::allocator<Key>>`

> 💡 **关键洞见**
> 默认值让库作者既能给用户一个简单的 `Foo<MyType>` 接口，又允许高级用户替换分配器、比较器、traits 等。

> ⚠️ **最佳实践**
> 一旦提供了默认值，**最后**那个模板参数必须是最有"换的余地"的那个（和默认函数实参同样的规则 —— 默认值只能放末尾）。

### 5.9 成员模板

> 对应 Klefstad 的 Topic 7 PPT —— "Member Templates"

一个类**自己**不必是模板，它的**成员函数**也可以是模板。普通类也能拥有**模板成员函数**——常用来写"接受任何类型"的方法，或者类型转换运算符。

PPT 举的引子：如果 `std::ostream::operator<<` 是按下面这样定义的，岂不是很爽？

```cpp
class ostream {
public:
    ostream& operator<<(const int& item) {       // 给 int 的普通重载
        // ...
        return *this;
    }

    template <typename T>                         // 给"其他一切"的成员模板
    ostream& operator<<(const T& item) {
        item.print(*this);   // 要求 T 拥有一个 print(ostream&) 方法
        return *this;
    }
};
```

那么用户只要给自己的类写一个 `print(ostream&)` 方法，`cout << myObj` 就能直接工作——再也不用为每个新类型在全局加 `operator<<` 重载了。

真实世界的例子 —— `std::shared_ptr` 有一个成员模板构造函数，能让 `shared_ptr<Derived>` 转成 `shared_ptr<Base>`：

```cpp
template <typename T>
class shared_ptr {
public:
    template <typename U>           // 成员模板 —— U 和外面的 T 各自独立
    shared_ptr(const shared_ptr<U>& other) { /* ... 只要 U* 能转 T* 就行 ... */ }
};

std::shared_ptr<Derived> dp = std::make_shared<Derived>();
std::shared_ptr<Base>    bp = dp;   // 用的就是上面这个成员模板构造函数
```

> 💡 **关键洞见**
> 成员模板的参数和**外层类**（哪怕外层也是模板）的参数是**独立**的。非模板类有模板成员、模板类有**非模板**成员、模板类**再**带模板成员——所有组合都合法。

---

## 6. 非类型模板参数

> 对应 LearnCpp 26.2（整章）

### 6.1 什么是非类型参数

**非类型模板参数（non-type template parameter）** 是一个模板参数：它的 *类型* 在声明点就被固定下来，而它的 *值* 由调用者作为 `constexpr` 模板实参提供。

它可以是下列任一类型：

- 整数类型（如 `int`、`std::size_t`）
- 枚举类型
- 指向类对象的指针或引用
- 指向函数的指针或引用
- 指向类成员函数的指针或引用
- `std::nullptr_t`
- 浮点类型（C++20 起）

### 6.2 走一遍：StaticArray

```cpp
template <typename T, int size>     // size is a non-type parameter
class StaticArray
{
private:
    T m_array[size] {};             // uses size as the array bound — no new[] needed!

public:
    T* getArray();
    T& operator[](int index) { return m_array[index]; }
};

// Member function defined outside also lists the non-type parameter
template <typename T, int size>
T* StaticArray<T, size>::getArray() { return m_array; }

int main() {
    StaticArray<int, 12>   intArray;       // m_array is int[12]
    StaticArray<double, 4> doubleArray;    // m_array is double[4]

    for (int i = 0; i < 12; ++i) intArray[i] = i;
    for (int i = 0; i < 4;  ++i) doubleArray[i] = 4.4 + 0.1 * i;
}
```

> 💡 **核心洞察**
> 因为 `size` 是一个编译期就可见的 `constexpr` 值，编译器可以把 `m_array` 排布成一个 **固定大小的内置数组** —— 不需要动态分配，也不需要额外的长度字段。`std::array<int, 5>` 正是这么实现的：`int` 是类型参数，`5` 是非类型参数。

### 6.3 非类型实参必须是 constexpr

```cpp
template <int size>
class Foo { };

int main() {
    int x { 4 };       // not constexpr
    Foo<x> f;          // ERROR: template non-type argument must be constexpr

    constexpr int y { 4 };
    Foo<y> g;          // OK
}
```

编译器必须在编译期就知道确切的值，才能喷出这个类。

### 6.4 与 Python 的对比

Python 没有直接对应物。Python list 没有编译期固定大小；numpy 数组接近一点，但形状是运行时决定的。C++ 的 `std::array<T, N>` 加非类型参数模式本质上是一种 **把大小编码进类型** 的手段，让数组边界成为类型的一部分。

```python
# Python: size is a runtime value
arr = [0] * 12

# numpy: size is a runtime value, though shape can be checked
import numpy as np
arr = np.zeros(12, dtype=int)
```

```cpp
// C++: size is part of the type
StaticArray<int, 12> arr;
// StaticArray<int, 12> and StaticArray<int, 13> are DIFFERENT TYPES
```

---

## 7. Lambda —— 匿名函数

> 对应 LearnCpp 20.6（整章）

### 7.1 它解决了什么问题

标准库的算法（如 `std::find_if`、`std::sort`、`std::count_if`）接受一个函数作为参数。没有 lambda 时，你不得不为每一个一次性谓词写一个自由函数、起个名字，扔到全局作用域：

```cpp
bool containsNut(std::string_view str)
{
    return str.find("nut") != std::string_view::npos;
}

auto found = std::find_if(arr.begin(), arr.end(), containsNut);
```

这有两点浪费：

- 这个函数 **只用一次**，却永远占着全局作用域。
- 这个函数 **比它的名字还短** —— 你读完 "containsNut" 时已经能读完函数体。

### 7.2 Lambda 语法

```
[ captureClause ] ( parameters ) -> returnType
{
    statements;
}
```

- **捕获列表** 可以为空：`[]`。
- 如果你 *既没有* 参数 *也没有* 返回类型说明，可以把整个 **参数列表** 都省略：`[]{}`。
- **返回类型** 是可选的；省略时由 `auto`（返回类型推导）接管。

> 🧪 **顺带一提**
> 最平凡的 lambda：`[] {};` —— 空捕获、无参数、省略返回类型。什么也不做。

Lambda 也叫 **闭包（closure）**，或者当它直接作为实参传给函数时叫 **函数字面量（function literal）**。

### 7.3 把 find 例子改写一下

```cpp
auto found = std::find_if(arr.begin(), arr.end(),
                          [](std::string_view str) {
                              return str.find("nut") != std::string_view::npos;
                          });
```

> ⚠️ **最佳实践**
> 遵循"在最小作用域、最接近首次使用处定义"的原则，当你需要一个平凡的一次性函数作为实参传出去时，lambda 优于普通函数。

### 7.4 把 lambda 存进变量

> 💡 **关于 `std::all_of`** —— 当范围里**所有**元素都满足谓词时返回 `true`。完整算法目录在 Week 8 §11.6(谓词算法)。

```cpp
// Inline (function literal):  hard to read
return std::all_of(array.begin(), array.end(),
                   [](int i){ return (i % 2) == 0; });

// Named:  clearer intent
auto isEven {
    [](int i) {
        return (i % 2) == 0;
    }
};
return std::all_of(array.begin(), array.end(), isEven);
```

命名版读起来更自然：「返回 *array* 里所有元素 *是否全都* *偶数*」。

> 💡 **核心洞察**
> 把 lambda 存进变量能给它一个有用的名字（可读性更好），还可以复用。

### 7.5 Lambda 的类型

Lambda 的类型是 **编译器生成的、唯一且无名的类型**。你没办法手写出这个类型。

> 🔧 **进阶读者**
> Lambda 其实不是函数 —— 它是 **functor**（重载了 `operator()` 的对象）。当编译器遇到一个 lambda 定义时，它生成一个隐藏的类类型，把捕获的变量当成成员，把 lambda 体当成 `operator()`。这就是 lambda 是怎么绕开 C++ 没有嵌套函数这一缺陷的。

存储 lambda 以备后用的三种方式：

```cpp
#include <functional>

int main() {
    // (1) Plain function pointer — only works when the lambda has an empty capture
    double (*addNumbers1)(double, double) {
        [](double a, double b) { return a + b; }
    };

    // (2) std::function<Sig> — works even with captures, but adds overhead
    std::function addNumbers2 {     // pre-C++17: std::function<double(double, double)>
        [](double a, double b) { return a + b; }
    };

    // (3) auto — stores the lambda with its real type; zero overhead
    auto addNumbers3 {
        [](double a, double b) { return a + b; }
    };
}
```

只有 `auto` 既保留 lambda 的 **真实** 类型，又零开销。`std::function` 更灵活（能装下任何签名匹配的可调用对象），但要付一点间接调用的代价。

### 7.6 把 lambda 传进函数 —— 四种方式

```cpp
// (1) std::function — flexible, but the implicit conversion adds overhead
void repeat1(int n, const std::function<void(int)>& fn) {
    for (int i = 0; i < n; ++i) fn(i);
}

// (2) Function template with type template parameter
template <typename T>
void repeat2(int n, const T& fn) {
    for (int i = 0; i < n; ++i) fn(i);
}

// (3) Abbreviated function template (C++20) — same as (2), cleaner syntax
void repeat3(int n, const auto& fn) {
    for (int i = 0; i < n; ++i) fn(i);
}

// (4) Plain function pointer — only for lambdas with NO captures
void repeat4(int n, void (*fn)(int)) {
    for (int i = 0; i < n; ++i) fn(i);
}
```

> ⚠️ **最佳实践**
> - **存储** lambda 进变量：用 `auto`。
> - **传递** lambda 给函数：
>   - 用 C++20 的话用 `auto` 当参数类型。
>   - 否则用类型模板参数或 `std::function`。
>   - 只有 lambda 没有捕获时才用函数指针。

### 7.7 泛型 Lambda

C++14 起，lambda 参数可以用 `auto`：

```cpp
const auto sameLetter {
    std::adjacent_find(months.begin(), months.end(),
                       [](const auto& a, const auto& b) {
                           return a[0] == b[0];
                       })
};
```

编译器把每个 `auto` 参数当成一个隐式的模板参数 —— 这就叫 **泛型 lambda**。

> 🔧 **进阶读者**
> 在 lambda 里，`auto` 就是模板参数的简写。

**`auto` 什么时候是好选择、什么时候不是：**

```cpp
// Good: auto deduces std::string_view, etc., and we only need operator[]
[](const auto& a, const auto& b) { return a[0] == b[0]; }

// Less good: auto deduces const char*, which is awkward to work with
// Better to be explicit:
[](std::string_view str) { return str.length() == 5; }
```

### 7.8 Constexpr Lambda

> C++17 起

如果 lambda 的结果满足常量表达式的要求，它就 **隐式 `constexpr`**。两个条件：

- 无捕获，或所有捕获本身就是 `constexpr`。
- 它调用的每一个函数都是 `constexpr`。

许多标准库算法直到 C++20/C++23 才变成 `constexpr`，所以老代码很少用到这点。

### 7.9 泛型 Lambda 与静态局部变量 —— 似曾相识的陷阱

跟函数模板一样的警告：泛型 lambda 的每一份实例都有 **自己的** 静态局部变量。

```cpp
auto print {
    [](auto value) {
        static int callCount { 0 };          // not shared across types!
        std::cout << callCount++ << ": " << value << '\n';
    }
};

print("hello");      // 0: hello   — <const char*> instance
print("world");      // 1: world   — same instance
print(1);            // 0: 1       — <int> instance (different callCount!)
print(2);            // 1: 2
print("ding dong");  // 2: ding dong
```

如果你希望计数器在不同类型之间共享，就在 lambda **外面** 定义全局或静态变量 —— 或者更好，**按引用捕获** 一个共享计数器（见第 8 节）。

### 7.10 返回类型推导与尾置返回类型

如果你省略返回类型，编译器从 `return` 语句中推导 —— 而 **所有** `return` 语句必须返回相同类型：

```cpp
auto divide { [](int x, int y, bool intDivision) {
    if (intDivision)
        return x / y;                        // returns int
    else
        return static_cast<double>(x) / y;   // ERROR: returns double, mismatch with int
} };
```

两种修法：

```cpp
// Fix 1: explicit casts so all branches return the same type
auto divide { [](int x, int y, bool intDiv) {
    if (intDiv) return static_cast<double>(x / y);
    else        return static_cast<double>(x) / y;
} };

// Fix 2 (usually better): explicit trailing return type, let the compiler convert
auto divide { [](int x, int y, bool intDiv) -> double {
    if (intDiv) return x / y;           // implicitly converted to double
    else        return static_cast<double>(x) / y;
} };
```

### 7.11 标准库函数对象

对于常见的操作，你其实根本不需要写 lambda —— `<functional>` 头里有现成的函数对象：

```cpp
#include <functional>
std::sort(arr.begin(), arr.end(), std::greater{});   // sort in descending order
```

其他常见的还有：`std::less`、`std::equal_to`、`std::plus`、`std::minus`、……

### 7.12 小结

Lambda 配合算法库，能把原本要手写循环的逻辑压缩成几行。但它不是通杀解 —— 对于复杂或可复用的逻辑，仍然更推荐用一个有名字的普通函数。

### 7.13 与 Python 的对比

| | Python | C++ Lambda |
|---|---|---|
| 语法 | `lambda x, y: x + y` | `[](int x, int y) { return x + y; }` |
| 函数体 | 只能写单个表达式 | 可以写完整的语句块 |
| 捕获 | 隐式（对周围名字闭包） | 通过捕获列表 `[]` 显式声明 |
| 类型 | 所有可调用对象共享 duck-typed 接口 | 每个 lambda 有编译器生成的唯一类型 |

C++ lambda **比 Python lambda 严格更强**（Python 限制在单表达式），但在调用点 **没那么便利**，因为捕获必须明确列出来。


---

## 8. Lambda 捕获

> 对应 LearnCpp 20.7（整章）

### 8.1 为什么需要捕获

默认情况下，lambda **看不见** 它所在函数的局部变量：

```cpp
std::string search{};
std::cin >> search;

auto found = std::find_if(arr.begin(), arr.end(),
                          [](std::string_view str) {
                              return str.find(search) != std::string_view::npos;
                              // ERROR: 'search' not accessible in this scope
                          });
```

Lambda **不是** 一个嵌套块 —— 它是编译器生成的一个独立对象。它能自由访问的东西只有：

- 具有 **静态（static）**（或 **thread_local**）存储期的对象 —— 全局变量、static 局部变量
- 是 **`constexpr`** 的对象（显式或隐式都行）

其他都必须明确 **捕获**。

> 🛠️ **小贴士**
> Lambda 只能访问 lambda 外面定义的某些类型的对象，包括静态存储期对象（如全局变量和 static 局部变量）以及 `constexpr` 对象。

### 8.2 捕获列表

要让 lambda 能访问 `search`，把它列在 `[]` 里：

```cpp
auto found = std::find_if(arr.begin(), arr.end(),
                          [search](std::string_view str) {
                              return str.find(search) != std::string_view::npos;
                          });
```

### 8.3 捕获是怎么工作的 —— 它们是拷贝

当 lambda 定义被执行时，**对每个被捕获的变量，lambda 都会克隆一份** 同名的变量，用当时外层作用域的值初始化它。

> 💡 **核心洞察**
> Lambda 捕获的变量是外层作用域变量的 **拷贝**，不是变量本身。

这些克隆出来的变量住在 **lambda 对象** 内部（作为编译器生成的 functor 的成员）。它们跟原变量同名，但可能不是同一个类型。

> 🔧 **进阶读者**
> 编译器看到 `[search]` 时会生成一个隐藏类，里面有一个成员 `search`。运行时执行到 lambda 定义这一行时，会构造该隐藏类的一个对象，用 `main` 的 `search` 初始化它的 `search` 成员。lambda 的函数体就是这个对象的 `operator()`。

### 8.4 捕获默认是 const

默认生成的 `operator()` 是 `const`，所以你不能修改按值捕获的变量：

```cpp
int ammo { 10 };

auto shoot {
    [ammo]() {        // captured by value
        --ammo;       // ERROR: ammo is const inside the lambda
        std::cout << "Pew! " << ammo << " shot(s) left.\n";
    }
};
```

### 8.5 Mutable 捕获

`mutable` 关键字去掉 lambda 的 `operator()` 上的 `const`：

```cpp
auto shoot {
    [ammo]() mutable {   // mutable allows modification of captured value
        --ammo;
        std::cout << "Pew! " << ammo << " shot(s) left.\n";
    }
};

shoot();   // Pew! 9 shot(s) left.
shoot();   // Pew! 8 shot(s) left.

std::cout << ammo << " shot(s) left\n";   // 10 — main's ammo is untouched!
```

两个重要观察：

1. Lambda 减的是 **自己内部那份 `ammo` 拷贝**，不是 `main` 的 `ammo`。
2. 这份内部拷贝的状态 **在多次调用之间持续保留**（因为 lambda 就是一个对象，把它作为成员存着）。

> ⚠️ **警告**
> 因为捕获变量是 lambda 对象的成员，它们的值在多次调用之间保留！

### 8.6 按引用捕获

在变量前加 `&` 表示按引用捕获：

```cpp
int ammo { 10 };

auto shoot {
    [&ammo]() {        // no need for mutable
        --ammo;        // affects main's ammo directly
        std::cout << "Pew! " << ammo << " shot(s) left.\n";
    }
};

shoot();
std::cout << ammo << " shot(s) left\n";   // 9 shot(s) left — main's ammo changed
```

按引用捕获的变量 **默认是非 const 的**（除非原变量本来就 const），所以不需要 `mutable`。

**给 `std::sort` 数比较次数** 是教科书级的用例：

```cpp
int comparisons { 0 };

std::sort(cars.begin(), cars.end(),
          [&comparisons](const auto& a, const auto& b) {
              ++comparisons;       // no mutable needed!
              return a.make < b.make;
          });

std::cout << "Comparisons: " << comparisons << '\n';   // possible output: 2
```

### 8.7 捕获多个变量

用逗号分隔，按需混搭：

```cpp
int health { 33 };
int armor  { 100 };
std::vector<CEnemy> enemies;

// Capture health and armor by value, enemies by reference
[health, armor, &enemies] () { /* ... */ };
```

### 8.8 默认捕获

> 对应 LearnCpp 20.7 —— "Default captures"

**默认捕获（default capture）** 会自动捕获 lambda 体内提到的每个变量。两种形式：

- **`[=]`** —— 按值默认捕获
- **`[&]`** —— 按引用默认捕获

默认捕获只捕获 lambda **实际用到** 的变量，不是作用域里所有变量。

```cpp
auto found = std::find_if(areas.begin(), areas.end(),
                          [=](int knownArea) {
                              return width * height == knownArea;
                              // width and height are auto-captured by value
                          });
```

你可以把默认捕获和显式捕获混合使用：

```cpp
int health { 33 };
int armor  { 100 };
std::vector<CEnemy> enemies;

[health, armor, &enemies]() { /* ... */ };   // explicit
[=, &enemies]()             { /* ... */ };   // enemies by ref, everything else by value
[&, armor]()                { /* ... */ };   // armor by value, everything else by ref

// ILLEGAL forms:
[&, &armor]() { };    // can't say "& by default" and then "& for armor" too
[=, armor]()  { };    // can't say "= by default" and then "= for armor" too
[armor, &health, &armor]() { };   // can't capture armor twice
[armor, &]()  { };    // the default capture must come FIRST
```

### 8.9 在捕获列表里定义新变量

你可以在捕获列表里声明一个只在 lambda 内可见的新变量，初值只在 lambda 定义时计算一次：

```cpp
auto found = std::find_if(areas.begin(), areas.end(),
                          // userArea is computed once when the lambda is defined
                          [userArea { width * height }](int knownArea) {
                              return userArea == knownArea;
                          });
```

> ⚠️ **最佳实践**
> 只有当变量的初值很短、类型显然时，才在捕获列表里初始化它。否则就在 lambda 外面定义变量，再正常捕获。

### 8.10 ⚠️ 悬挂的捕获引用

这是 lambda 最危险的陷阱：

```cpp
auto makeWalrus(const std::string& name)
{
    return [&]() {                              // captures 'name' by reference
        std::cout << "I am a walrus, my name is " << name << '\n';
    };
}                                               // 'name' is destroyed here!

int main() {
    auto sayName { makeWalrus("Roofus") };
    sayName();                                  // UB — uses dangling reference
}
```

发生了什么：

1. `makeWalrus("Roofus")` 从字面量创建一个临时 `std::string`。
2. Lambda 按 **引用** 捕获了 `name`。
3. `makeWalrus` 返回时，`name` 被销毁。
4. 返回的 lambda 仍然持有一个悬挂引用。调用它是未定义行为。

> ⚠️ **警告**
> 按引用捕获时务必小心，尤其是用默认引用捕获 `[&]`。被捕获的变量 **必须比 lambda 活得久**。

修法很简单：按值捕获（`[=]` 或 `[name]`）。

### 8.11 ⚠️ Mutable Lambda 的意外拷贝

Lambda 是一个对象，所以可以被拷贝 —— 而拷贝带着它 **自己** 的状态。

```cpp
int i { 0 };
auto count { [i]() mutable { std::cout << ++i << '\n'; } };

count();                     // 1
auto otherCount { count };   // copy taken when count's i == 1
count();                     // 2 (count's i becomes 2)
otherCount();                // 2 (otherCount's i was 1, becomes 2)
```

当标准库函数替你拷贝 lambda 时，这个陷阱更隐蔽：

```cpp
void myInvoke(const std::function<void()>& fn) { fn(); }

int i { 0 };
auto count { [i]() mutable { std::cout << ++i << '\n'; } };

myInvoke(count);   // 1
myInvoke(count);   // 1
myInvoke(count);   // 1
```

Lambda 的类型是编译器生成的、跟 `std::function<void()>` 不同的独特类型。为了绑定到引用形参，编译器创建一个 **临时 `std::function`**，把 lambda **拷贝** 进去。每次 `myInvoke(count)` 都会新生成一份拷贝，所以计数器永远停在 `1`。

**修法 1** —— 直接把 lambda 存进 `std::function`：

```cpp
std::function count { [i]() mutable { std::cout << ++i << '\n'; } };
myInvoke(count);   // 1
myInvoke(count);   // 2  — no temporary copy is made
myInvoke(count);   // 3
```

**修法 2** —— 用 `std::ref` 包一下：

```cpp
auto count { [i]() mutable { std::cout << ++i << '\n'; } };
myInvoke(std::ref(count));   // 1
myInvoke(std::ref(count));   // 2
myInvoke(std::ref(count));   // 3
```

`std::reference_wrapper`（由 `std::ref` 创建）会被当成引用对待，所以对该包装器的拷贝仍指向原 lambda。更妙的是：即便 `myInvoke` 是 **按值** 接收 `fn`，这招也照样有效。

> 📜 **法则**
> 标准库函数可能会拷贝函数对象（再提醒一次：lambda 是函数对象）。如果你要传一个带可变捕获变量的 lambda，请用 `std::ref` 按引用传递。

> ⚠️ **最佳实践**
> 尽量避免 mutable lambda。非 mutable lambda 更易懂，而且不会触发上面这些问题 —— 在并行执行场景里它们更稳。

### 8.12 与 Python 的对比

| | Python | C++ |
|---|---|---|
| 捕获语义 | 闭包按 **引用** 捕获（捕获的是变量绑定本身，不是值） | 显式选择：按值 `[x]` 或按引用 `[&x]` |
| 改写外层变量 | 需要 `nonlocal` 关键字 | 按引用捕获，或者按值捕获 + `mutable` |
| 生命周期安全 | GC 保证被捕获的变量一直活着 | 程序员负责 —— 引用捕获了已销毁的对象就是 UB |

```python
# Python — captures 'x' by reference (the name x), late binding
funcs = []
for x in range(3):
    funcs.append(lambda: x)
print([f() for f in funcs])   # [2, 2, 2]  — all see the final x

# To capture by value, force evaluation at definition time:
funcs = [(lambda v: lambda: v)(x) for x in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```

```cpp
// C++ — explicit choice
for (int x = 0; x < 3; ++x) {
    auto f1 = [x] () { return x; };    // capture by value, snapshot of x
    auto f2 = [&x]() { return x; };    // capture by reference, sees x change
}
```

C++ 牺牲了一点便利换来明确：每一次捕获都是显式的，不会出现 Python 那种 late-binding 的意外。

---

## 9. 为什么需要异常

> 对应 LearnCpp 27.1（整章）

### 9.1 返回码：旧式做法

在异常出现之前，最常见的错误处理方式是 **返回码（return code）** —— 用一个特殊值（往往是 `-1`、`nullptr` 或某个枚举）告诉调用者"出错了"：

```cpp
int findFirstChar(std::string_view s, char ch)
{
    for (std::size_t i = 0; i < s.length(); ++i)
        if (s[i] == ch)
            return static_cast<int>(i);
    return -1;     // not found
}
```

这种方式 **简单**，但在稍复杂一点的代码里会很快累积出问题。

### 9.2 返回码的五个问题

**(1) 晦涩的值。**
如果一个函数返回 `-1`，那到底是错误还是合法结果？不看文档你根本判断不了。

**(2) "两个值"问题。**
如果你 *既* 想返回结果 *又* 想返回错误码怎么办？你只能：

- 用一个输出参数（丑）：

```cpp
double divide(int x, int y, bool& outSuccess)
{
    if (y == 0) { outSuccess = false; return 0.0; }
    outSuccess = true;
    return static_cast<double>(x) / y;
}

bool ok{};
double r = divide(5, 3, ok);
if (!ok) std::cerr << "error";
else     std::cout << r;
```

- 或者自定义一个 `{value, error}` 结构体，又是一堆样板代码。

**(3) 每个调用点都得检查错误。**
每个调用都需要显式检查，把真正的逻辑淹没掉：

```cpp
std::ifstream setupIni { "setup.ini" };
if (!setupIni)                                 return ERROR_OPENING_FILE;
if (!readIntegerFromFile(setupIni, p1))         return ERROR_READING_VALUE;
if (!readDoubleFromFile (setupIni, p2))         return ERROR_READING_VALUE;
if (!readFloatFromFile  (setupIni, p3))         return ERROR_READING_VALUE;
// imagine 20 more lines of this …
```

**(4) 构造函数没有返回值。**
如果构造失败，你没有一条干净的途径把这件事告诉调用者。各种变通（init 函数、空对象）很乱，而且容易被忘掉。

**(5) 调用者不一定是处理错误的合适人选。**
紧挨着的那一层调用者可能根本不知道该拿这个错误怎么办 —— 但用返回码的话，它要么硬着头皮处理（处理得很糟），要么手动把错误一层层往上传。

### 9.3 异常的解法

> 对应 LearnCpp 27.1 —— "Exceptions"

异常处理把错误处理 **从正常控制流里解耦** 出来：

- 发现问题的函数 **抛出（throw）** 一个异常。
- 异常自动沿着调用栈向上传播，直到 **有人** 捕获它。
- 那些不关心这个错误的代码路径就不用被 `if (error) return` 这样的检查搞乱了。

接下来几节展示这套机制具体是怎么工作的。

---

## 10. 异常处理基础 —— throw、try、catch

> 对应 LearnCpp 27.2（整章）

### 10.1 三个关键字

C++ 异常处理由三个关键字搭起：

| 关键字 | 作用 |
|---|---|
| `throw expr;` | 抛出一个异常。`expr` 的值就是异常对象。 |
| `try { … }` | 监视块内代码是否抛异常。 |
| `catch (T x) { … }` | 捕获匹配 `try` 抛出的 `T` 类型异常。 |

### 10.2 抛出异常

任何值都能被抛出来：

```cpp
throw -1;                                          // int
throw ENUM_INVALID_INDEX;                          // enum
throw "Can not take square root of negative";      // const char*
throw dX;                                          // a double variable
throw MyException("Fatal Error");                  // a class object
```

抛出的那个 **值** 就是异常。这件事也常常叫 "**raising**" 异常。

### 10.3 try 块

`try` 块是一段被监视的代码区域：

```cpp
try {
    // statements that might throw
    throw -1;
}
```

`try` 块本身不说明 *怎样* 处理异常 —— 它只是建立了一个观测点。它 **必须** 后面跟至少一个 `catch`。

### 10.4 catch 块

```cpp
catch (int x) {
    std::cerr << "Caught int with value " << x << '\n';
}
```

规则：

- `try` 后面必须紧跟一个或多个 `catch` 块。
- 每个 `catch` 处理 **一种类型**。
- catch 形参的行为跟函数形参一样：如果你不用这个值，可以省略名字。

```cpp
catch (double) {              // no name needed
    std::cerr << "Caught a double\n";
}
```

> ⚠️ **最佳实践**
> 异常匹配 `catch` 时 **不做隐式转换**。`int` 异常不会匹配 `catch(double)`，`char` 不会匹配 `catch(int)`。**例外**：派生类异常会匹配它基类的 `catch`（第 13 节再讲）。

### 10.5 按值 vs 按引用捕获

- **基本类型**（int、double 等）：**按值** 捕获（拷贝便宜）。
- **类类型**：**按 `const` 引用** 捕获 —— 避免不必要的拷贝，并且能防止 **slicing**。

```cpp
catch (const std::string& msg) { … }       // class — by const reference
catch (int x)                  { … }       // fundamental — by value
```

### 10.6 一个完整例子

```cpp
#include <iostream>
#include <string>

int main()
{
    try
    {
        throw -1;
    }
    catch (double)              { std::cerr << "type double\n"; }
    catch (int x)               { std::cerr << "int with value: " << x << '\n'; }
    catch (const std::string&)  { std::cerr << "type std::string\n"; }

    std::cout << "Continuing on our merry way\n";
}
```

输出：

```
int with value: -1
Continuing on our merry way
```

### 10.7 匹配是怎么发生的

当 `throw -1;` 执行时：

1. 执行在 throw 处停下。
2. 运行时找到 **最近的、外围的** 含匹配 `catch` 处理器的 `try` 块。
3. 处理器按 **声明顺序** 检查。**第一个匹配** 的处理器执行。
4. 处理器执行完后，控制流跳到那组 `catch` 中 **最后一个 `catch` 之后** 的第一条语句。**其余处理器不会执行**。

### 10.8 异常立即处理

下面这个例子说明 `throw` 之后的代码 **不会** 执行：

```cpp
try {
    throw 4.5;
    std::cout << "This never prints\n";    // skipped — throw transferred control out
}
catch (double x) {
    std::cerr << "We caught a double of value: " << x << '\n';
}
```

输出：

```
We caught a double of value: 4.5
```

### 10.9 一个比较实际的例子

```cpp
#include <cmath>
#include <iostream>

int main()
{
    std::cout << "Enter a number: ";
    double x{};
    std::cin >> x;

    try {
        if (x < 0.0)
            throw "Cannot take sqrt of negative number";
        std::cout << "The sqrt of " << x << " is " << std::sqrt(x) << '\n';
    }
    catch (const char* msg) {
        std::cerr << "Error: " << msg << '\n';
    }
}
```

输入 `-4` 时：

```
Enter a number: -4
Error: Cannot take sqrt of negative number
```

### 10.10 catch 块通常做什么

四种常见模式：

1. **记录错误**（到 console 或文件），然后让函数继续。
2. **向调用者返回错误码**。
3. **抛一个不同的异常** —— 新抛的异常 *不会* 被同一个 `try` 捕获，而会被外层下一个 `try` 捕获。
4. （在 `main()` 里）**捕获致命错误** 并干净地终止程序。

### 10.11 与 Python 的对比

| | Python | C++ |
|---|---|---|
| 关键字 | `raise`、`try`、`except` | `throw`、`try`、`catch` |
| 异常类型 | 对象（通常派生自 `BaseException`） | 任何类型（对象、基本类型，甚至 C 风格字符串） |
| 多个处理器 | `except T1: … except T2: …` | `catch (T1) { … } catch (T2) { … }` |
| 捕获所有 | `except:` 或 `except Exception:` | `catch (...)`（见第 12 节） |
| 类型转换 | 子类通过 `isinstance` 匹配基类 | 只有"派生→基类"匹配；基本类型不做晋升 |
| `finally` 子句 | 有 | **没有** —— 改用 RAII（析构函数） |

C++ 没有 `finally`，但 RAII 模式（在局部对象的析构函数里清理资源）能更稳健地实现同样的目标 —— 见第 13 节。

---

## 11. 异常、函数与栈展开

> 对应 LearnCpp 27.3（整章）

### 11.1 throw 不必非要在 try 里

异常机制的杀手特性：函数可以在任意位置 `throw`，异常会 **沿调用栈向上传播**，直到找到匹配的 `catch`。

```cpp
double mySqrt(double x)
{
    if (x < 0.0)
        throw "Cannot take sqrt of negative";   // no try block here!
    return std::sqrt(x);
}

int main()
{
    double x{};
    std::cin >> x;

    try {
        double d = mySqrt(x);            // throw propagates from mySqrt to here
        std::cout << "sqrt is " << d << '\n';
    }
    catch (const char* msg) {
        std::cerr << "Error: " << msg << '\n';
    }
}
```

> 💡 **核心洞察**
> Try 块不仅捕获块内语句抛出的异常，也捕获块内调用的函数（直接或递归调用）抛出的异常。

这让我们能写出 *模块化* 的函数，比如 `mySqrt`：它检测问题，但 **把"具体该怎么办"的策略决策延后到调用者**。控制台程序可能打印到 `cerr`；GUI 程序可能弹个对话框。同一份 `mySqrt` 两边都能用。

### 11.2 栈展开 —— 机制

异常抛出时：

1. 检查 **当前函数** 是否能处理它（即：throw 是否在一个含匹配 `catch` 的 `try` 里）。
2. 如果不能，检查 **调用者**：调用当前函数的那条语句是否在一个含匹配 `catch` 的 `try` 块里？如果是，由调用者处理。
3. 如果不是，再检查调用者的调用者。沿调用栈一直往上。
4. 若找到处理器，则把栈 **展开** 到那一层（沿途的每个函数的局部变量都被销毁），然后执行处理器。
5. 若一直找不到处理器，程序调用 `std::terminate`（第 12 节细讲）。

> 💡 **核心洞察**
> 展开栈会销毁被展开的那些函数里的局部变量 —— 也就是说 **它们的析构函数会执行**。这就是为什么 RAII 在异常控制流下仍然有效。

### 11.3 走一遍 —— 五层函数链

```cpp
#include <iostream>

void D() {
    std::cout << "Start D\n";
    std::cout << "D throwing int exception\n";
    throw -1;
    std::cout << "End D\n";                     // skipped
}

void C() {
    std::cout << "Start C\n";
    D();
    std::cout << "End C\n";                     // skipped — unwound
}

void B() {
    std::cout << "Start B\n";

    try { C(); }
    catch (double) {                            // type mismatch: int can't match double
        std::cerr << "B caught double\n";
    }

    try { }                                     // empty try block
    catch (int) {                               // would match int — but the throw was NOT inside this try
        std::cerr << "B caught int\n";
    }

    std::cout << "End B\n";                     // skipped — unwound
}

void A() {
    std::cout << "Start A\n";

    try { B(); }
    catch (int)    { std::cerr << "A caught int exception\n"; }      // MATCH!
    catch (double) { std::cerr << "A caught double exception\n"; }   // not reached

    std::cout << "End A\n";
}

int main() {
    std::cout << "Start main\n";

    try { A(); }
    catch (int) { std::cerr << "main caught int exception\n"; }   // not reached — A handled it

    std::cout << "End main\n";
}
```

输出：

```
Start main
Start A
Start B
Start C
Start D
D throwing int exception
A caught int exception
End A
End main
```

### 11.4 例子里的教训

- **C 不必处理它。** C 里压根没有 `try`，异常从它身上干净地穿过。
- **B 里有两个 `try` 但都没接住。** 第一个的 `catch(double)` 类型不对。第二个的 `catch(int)` 倒是匹配类型，但 **对 C 的那次调用不在这个 `try` 内**，所以 throw 绕过了它。无论如何 B 被展开。
- **A 接住了。** A 里对 B 的调用在一个 `try` 中，并有匹配的 `catch(int)`，所以 A 捕获了它。
- **A 的 catch 之后控制流正常继续。** `"End A"` 被打印；A 正常返回 `main`，没有再抛出去。
- **main 自己也有一个 `catch(int)`** —— 但它永远到不了，因为控制流回到 `main` 时异常早就被 A 处理过了。

### 11.5 四条原则

1. 抛异常函数的直接调用者不必处理这个异常。（C 就没处理。）
2. 如果一个 `try` 没有匹配的 `catch`，**展开过程把它当作不存在那个 `try`**。
3. 一个函数可以同时拥有匹配的 `catch` *却仍然没接到异常* —— 只要 throw 不是从那个 `try` 的内部发起的。
4. 一旦匹配的 `catch` 执行完，控制流正常从整组 `catch` 之后的第一条语句继续。

---

## 12. 未捕获的异常与 catch-all 处理器

> 对应 LearnCpp 27.4（整章）

### 12.1 没人接住会发生什么

把上面的 sqrt 例子改成 `main` 不写 `try`：

```cpp
int main() {
    double x{};
    std::cin >> x;
    std::cout << "sqrt is " << mySqrt(x) << '\n';  // no try!
}
```

如果 `mySqrt(-4)` 抛了异常，运行时一路沿调用栈走到顶，仍然找不到处理器。结果：**调用 `std::terminate()`，程序被中止**。

> ⚠️ **警告**
> 如果一个抛出的异常找不到处理器，`std::terminate()` 会被调用。这种情况下调用栈 **不一定会被展开**。若没有展开，局部变量 **不会被销毁**，它们析构函数本该做的清理工作 **也都不会发生**。

> 🧪 **顺带一提**
> 为什么栈可能不展开？因为保留未展开的栈能让调试器准确告诉你未处理异常是从哪里抛出的。如果栈已经被清干净，那些诊断信息就全没了。

### 12.2 catch-all 处理器

> 对应 LearnCpp 27.4 —— "Catch-all handlers"

要捕获 **任意** 类型的异常，用 **省略号 catch 处理器**：

```cpp
try {
    throw 5;                  // an int
}
catch (double x) {
    std::cout << "Caught double: " << x << '\n';
}
catch (...) {                 // catch-all
    std::cout << "Caught an exception of an undetermined type\n";
}
```

规则：

- `catch(...)` 必须是 **最后一个** 处理器 —— 否则它后面的更具体的处理器永远跑不到。
- catch-all 没办法访问异常的值（因为它不知道类型）。
- 一个空的 `catch(...) { }` 有时被用来 **静默地吞掉** 所有异常 —— 在程序退出前确保栈展开发生。

### 12.3 用 catch-all 包住 main

一种常见模式是把 `main` 的整体放进 `try` + `catch(...)`，让任何未处理异常导致 **有序终止** 而非粗暴 abort：

```cpp
int main()
{
    GameSession session{};

    try {
        runGame(session);
    }
    catch (...) {
        std::cerr << "Abnormal termination\n";
    }

    saveGame(session);          // give the user a chance to save state
}
```

> 🛠️ **小贴士**
> 如果你的程序使用异常，考虑在 `main()` 里加一个 catch-all 处理器，确保未处理异常逃逸时程序的行为有序。
> 真的进了 catch-all 时，假设程序处于不确定状态，立即清理并终止。

### 12.4 调试未处理异常

catch-all 会把有用的调试信息盖住。大多数调试器会在未捕获异常时停下，给你看抛点处的调用栈 —— 但如果存在 `catch(...)`，异常严格说就不算"未捕获"，调试器也就不会停。

标准变通办法：**条件编译** 让 catch-all 在 debug 构建下被替换。

```cpp
class DummyException {            // can never be instantiated
    DummyException() = delete;
};

int main() {
    GameSession session {};

    try {
        runGame(session);
    }
#ifndef NDEBUG                     // RELEASE: catch all
    catch (...) {
        std::cerr << "Abnormal termination\n";
    }
#else                              // DEBUG: a catch that can never fire
    catch (DummyException) { }
#endif

    saveGame(session);
}
```

因为每个 `try` 都必须有至少一个 `catch`，所以在 debug 模式下也得放 *一个* catch。`DummyException` 没法被构造（默认构造函数被 `= delete`），所以这个处理器语法上合法但永远不会触发 —— 任何抛出的异常都会穿过它去触发调试器。

---

## 13. 异常类与继承

> 对应 LearnCpp 27.5（整章）

### 13.1 成员函数里的异常

像 `operator[]` 这样的运算符有固定签名 —— 没办法在不破坏运算符约定的情况下返回错误码。抛异常正好合适：

```cpp
int& IntArray::operator[](int index)
{
    if (index < 0 || index >= getLength())
        throw index;                  // signal an error
    return m_data[index];
}
```

函数签名保持不变；调用者用 `try`/`catch` 把调用包起来即可。

### 13.2 构造函数失败时

> 对应 LearnCpp 27.5 —— "When constructors fail"

构造函数没有返回值，所以报告失败本身就别扭 —— **除了** 用异常。从构造函数里抛出异常能干净地终止对象的创建。

**重要规则：**

> 当一个构造函数抛异常时，对象的类成员在抛出时 **已经被构造**，所以 **它们的析构函数会运行**。但 **这个类自己的析构函数不会运行**，因为对象从未完成构造。

```cpp
#include <iostream>

class Member {
public:
    Member()  { std::cerr << "Member allocated some resources\n"; }
    ~Member() { std::cerr << "Member cleaned up\n"; }
};

class A {
private:
    int    m_x{};
    Member m_member;
public:
    A(int x) : m_x{x} {
        if (x <= 0)
            throw 1;                  // throw before A is fully constructed
    }
    ~A() { std::cerr << "~A\n"; }     // NEVER called when constructor throws
};

int main() {
    try { A a { 0 }; }
    catch (int) { std::cerr << "Oops\n"; }
}
```

输出：

```
Member allocated some resources
Member cleaned up
Oops
```

`m_member` 被构造；然后 `A` 的函数体执行并抛异常。编译器自动销毁 `m_member`（执行 `~Member`）。`~A` **没有** 被调用。

### 13.3 RAII 来救场

构造函数中安全分配资源的诀窍：**把每个资源都做成 RAII 类的成员**。这样万一构造函数抛了，资源成员的析构函数会自动清理。

```cpp
class Foo {
private:
    int* ptr;                                // Foo must clean up
};

class Foo {
private:
    std::unique_ptr<int> ptr;                // unique_ptr cleans up itself
};
```

如果 `Foo` 的构造函数在裸 `int*` 版本里分配完内存 **之后** 抛了异常，`Foo` 必须自己负责跟踪并释放这块内存 —— 容易出错也容易忘。改用 `std::unique_ptr`，智能指针的析构函数会自动跑，不管构造函数是怎么退出的，内存都会被释放。

> 💡 **核心洞察**
> RAII 让异常安全的代码很好写。资源归属住在带正确析构函数的成员对象里，构造函数无论成功还是抛异常，清理都会发生。

### 13.4 为什么普通类型不适合做异常

```cpp
try {
    int* value = new int{ array[index1] + array[index2] };
}
catch (int value) {
    // What are we catching here?
    //   - operator[] out-of-range index?
    //   - operator+ overflow?
    //   - new failed?
    // No way to tell!
}
```

抛一个 `int`（或 `const char*`）让调用者根本没办法分辨 *是哪种* 问题。

### 13.5 异常类

解决办法是专门定义一个用来抛出的类：

```cpp
#include <string>
#include <string_view>

class ArrayException
{
private:
    std::string m_error;

public:
    ArrayException(std::string_view error) : m_error{error} {}
    const std::string& getError() const { return m_error; }
};
```

完整程序：

```cpp
class IntArray {
    int m_data[3] {};
public:
    int getLength() const { return 3; }
    int& operator[](int index) {
        if (index < 0 || index >= getLength())
            throw ArrayException{ "Invalid index" };
        return m_data[index];
    }
};

int main() {
    IntArray array;
    try {
        int value { array[5] };
    }
    catch (const ArrayException& exception) {              // by const ref!
        std::cerr << "Array exception (" << exception.getError() << ")\n";
    }
}
```

> ⚠️ **最佳实践**
> - 捕获 **基本类型** 异常时按 **值** 捕（拷贝便宜）。
> - 捕获 **类类型** 异常时按 **`const` 引用** 捕 —— 既避免不必要的拷贝，又防止派生异常类被 **对象切片**（见下一节）。

### 13.6 异常与继承

派生类异常 **会匹配** 它基类的处理器：

```cpp
class Base    { };
class Derived : public Base { };

int main() {
    try { throw Derived{}; }
    catch (const Base&)    { std::cerr << "caught Base\n"; }      // matches Derived!
    catch (const Derived&) { std::cerr << "caught Derived\n"; }   // never reached
}
```

输出：`caught Base`

运行时是 **按顺序** 检查 `catch` 处理器的。因为 `Derived` is-a `Base`，第一个处理器就匹配上了，专门的 `Derived` 处理器永远到不了。

**修法：** 把更派生的处理器放在前面：

```cpp
catch (const Derived&) { std::cerr << "caught Derived\n"; }
catch (const Base&)    { std::cerr << "caught Base\n"; }
```

这样 `Derived` 异常匹配第一个处理器；`Base` 异常落到第二个。

> 📜 **规则**
> 派生异常类的处理器应当排在它基类的处理器 **之前**。

### 13.7 std::exception —— 标准库的异常体系

> 对应 LearnCpp 27.5 —— "std::exception"

标准库抛出许多异常类：

- `std::bad_alloc` —— `new` 在内存耗尽时抛
- `std::bad_cast` —— 失败的 `dynamic_cast`（到引用）抛
- `std::length_error` —— 构造过大的 `std::string` 抛
- `std::out_of_range` —— `std::vector::at()` 越界时抛
- ……还有许多

**它们全部派生自 `std::exception`**（定义在 `<exception>`）。所以你能用一个处理器接住整个体系：

```cpp
#include <exception>
#include <iostream>
#include <string>
#include <limits>

int main()
{
    try {
        std::string s;
        s.resize(std::numeric_limits<std::size_t>::max());   // triggers std::length_error
    }
    catch (const std::exception& e) {
        std::cerr << "Standard exception: " << e.what() << '\n';
    }
}
```

典型输出：

```
Standard exception: string too long
```

> 💡 **核心洞察**
> `std::exception` 提供一个 `virtual const char* what() const noexcept;` 成员，返回异常的描述。大多数派生类会覆盖 `what()` 给出更具体的消息。
>
> `what()` 返回的字符串仅用于 **描述性显示**。不要把它用作程序化比较 —— 不同编译器或库版本之间不保证一致。

你可以混合具体处理器和通用处理器：

```cpp
try { /* … */ }
catch (const std::length_error& e) {                  // specific (and any derived)
    std::cerr << "Out of memory!\n";
}
catch (const std::exception& e) {                     // everything else from std
    std::cerr << "Standard exception: " << e.what() << '\n';
}
```

### 13.8 直接使用标准异常

没有谁直接抛 `std::exception`，你也别这么干 —— 它是一个接口基类。但你可以放心抛其他符合你需要的标准异常类。

`std::runtime_error`（在 `<stdexcept>`）是个流行选择，因为它的构造函数接受自定义消息：

```cpp
#include <stdexcept>

throw std::runtime_error("Bad things happened");
```

捕获它：

```cpp
catch (const std::exception& e) {
    std::cerr << "Standard exception: " << e.what() << '\n';
    // "Standard exception: Bad things happened"
}
```

### 13.9 自己派生 —— 从 std::exception 派生

```cpp
class ArrayException : public std::exception
{
    std::string m_error;
public:
    ArrayException(std::string_view err) : m_error{err} {}

    // override what() — return type must be const char*, and noexcept must match
    const char* what() const noexcept override { return m_error.c_str(); }
};
```

> ⚠️ **最佳实践**
> 覆盖 `std::exception::what()` 时，**override 也必须是 `noexcept`**，因为基类函数被声明为 `noexcept`。忘了写 `noexcept` 会编译错误。

或者派生自 `std::runtime_error`，把消息处理白拿过来：

```cpp
class ArrayException : public std::runtime_error
{
public:
    ArrayException(const std::string& err) : std::runtime_error{err} {}
    // no need to override what() — std::runtime_error::what() already works
};
```

### 13.10 异常对象的生命周期

> 对应 LearnCpp 27.5 —— "The lifetime of exceptions"

异常对象通常是一个临时对象或局部变量。但栈展开会销毁局部变量 —— 那异常对象怎么活下来？

**答案：** `throw` 时，编译器把异常对象 **拷贝**（有时是移动）到一块专门留给异常处理的、栈之外的内存区域。这份拷贝一直留到异常被处理为止。

后果：**异常对象必须可拷贝**。

```cpp
class Derived : public Base {
public:
    Derived(const Derived&) = delete;    // not copyable
};

throw Derived{};                          // compile error
```

> 🛠️ **小贴士**
> 异常对象需要可拷贝。聪明的编译器在特定情况下可能会移动或省略拷贝，但类型在原则上必须支持拷贝。

**另一条重要规则：** 异常对象 **不应** 持有指针或引用指向栈上分配的变量，因为这些变量可能在 throw 所触发的栈展开中被销毁。结果就是异常对象里出现一个悬挂指针/引用 —— 访问时是 UB。

---

## 14. 异常规范与 noexcept

> 对应 LearnCpp 27.9（整章）

### 14.1 为什么这事重要

看一个声明：

```cpp
int doSomething();
```

……你没办法判断这个函数会不会抛异常。靠注释回答不靠谱（注释会过时，编译器不会强制）。C++ 提供了 **`noexcept`** 作为编译器可检查的标注。

### 14.2 noexcept 修饰符

每个 C++ 函数要么是：

- **非抛异常（non-throwing）** —— 承诺不向调用者暴露任何被抛出的异常，或
- **潜在抛异常（potentially throwing）** —— 可能让异常逃出去。

要把函数声明为非抛异常，在参数列表后面写 `noexcept`：

```cpp
void doSomething() noexcept;     // non-throwing
```

**重要细节：** `noexcept` **不会** 阻止函数内部抛出异常或调用其他潜在抛异常的函数。它禁止的是 **让异常逃出**。只要函数把所有内部异常都在它离开之前接住，就没事。

如果一个未处理的异常 **真的** 试图从 `noexcept` 函数里跑出来，**`std::terminate()` 会立即被调用**，不管栈上更外层是否有匹配的处理器。

> 💡 **核心洞察**
> `noexcept` 函数做出的承诺是 **契约性的**，编译器并不强制检查函数体。编译器不会阻止你在 noexcept 函数里调用会抛异常的代码。一旦异常逃出去，你的程序 **死掉**。
>
> 所以：最稳妥的做法是确保 noexcept 函数不做 *任何* 有可能抛异常的事。一根不冒火的引线不会出问题。

### 14.3 走一遍 —— noexcept 行为

下面这个程序演示两种情形：

```cpp
#include <iostream>

class Doomed { public: ~Doomed() { std::cout << "Doomed destructed\n"; } };

void thrower() {
    std::cout << "Throwing exception\n";
    throw 1;
}

void pt() {                              // potentially throwing
    std::cout << "pt called\n";
    Doomed doomed{};                     // would be destroyed if stack unwinds
    thrower();
    std::cout << "this never prints\n";
}

void nt() noexcept {                     // non-throwing
    std::cout << "nt called\n";
    Doomed doomed{};
    thrower();
    std::cout << "this never prints\n";
}

void tester(int c) noexcept {            // also noexcept!
    std::cout << "tester case " << c << " called\n";
    try {
        (c == 1) ? pt() : nt();
    }
    catch (...) {
        std::cout << "tester caught exception\n";
    }
}

int main() {
    tester(1);
    std::cout << "Test successful\n\n";
    tester(2);
    std::cout << "Test successful\n";
}
```

输出：

```
tester case 1 called
pt called
Throwing exception
Doomed destructed
tester caught exception
Test successful

tester case 2 called
nt called
Throwing exception
terminate called after throwing an instance of 'int'
```

**情形 1**（`pt`，潜在抛异常）：

- `pt` 调用 `thrower`，后者抛异常。
- 第一个处理器在 `tester` 里，而 `tester` 是 `noexcept` 的。但没问题 —— 异常在 `tester` **内部就被接住了**，从未逃出去。`noexcept` 的契约被遵守。
- 栈从 `thrower` 经过 `pt` 一路展开回 `tester`，沿途销毁 `doomed`。✅

**情形 2**（`nt`，noexcept）：

- `nt` 调用 `thrower`，后者抛异常。
- 要到达 `tester` 的处理器，异常必须穿过 `nt`。但 `nt` 是 `noexcept` 的！
- 这违反了 **`nt` 的契约**，所以 `std::terminate()` 被立即调用。
- 在作者的机器上，栈 **没有** 被展开 —— `doomed` 的析构函数没跑。⚠️

### 14.4 noexcept(condition)

`noexcept` 接受一个可选的布尔参数：

```cpp
void f() noexcept(true);    // non-throwing (same as `noexcept`)
void g() noexcept(false);   // potentially throwing
```

在普通代码里 `noexcept(false)` 用处不大 —— 但在 **模板** 代码里它让你写出一个 throw-ness 取决于模板参数的函数：

```cpp
template <typename T>
void wrap(T t) noexcept(noexcept(t()))   // noexcept iff t() is noexcept
{
    t();
}
```

### 14.5 哪些函数默认是非抛异常的

**隐式非抛异常：**

- 析构函数

**当被隐式声明或 `= default` 时，默认非抛异常：**

- 默认构造函数、拷贝构造函数、移动构造函数
- 拷贝赋值、移动赋值
- 比较运算符（C++20）

> ⚠️ 注意：如果这些函数中的任何一个调用了潜在抛异常的函数（例如某个数据成员的构造函数是潜在抛异常的），它们就也变成了潜在抛异常。

**用户自定义时默认潜在抛异常：**

- 普通函数
- 用户自定义的构造函数
- 用户自定义的运算符

### 14.6 noexcept 运算符

`noexcept(expr)`（用作运算符时）返回 `bool`：如果编译器认为 `expr` 不会抛异常就是 `true`，否则 `false`。表达式 **不被求值** —— 这是个编译期检查。

```cpp
void foo()          { throw -1; }
void boo()          { }
void goo() noexcept { }
struct S { };

constexpr bool b1 = noexcept(5 + 3);    // true  — ints don't throw
constexpr bool b2 = noexcept(foo());    // false — foo() is not noexcept (even though declared without noexcept(false) it's the default)
constexpr bool b3 = noexcept(boo());    // false — boo() is potentially throwing by default
constexpr bool b4 = noexcept(goo());    // true  — goo() is noexcept
constexpr bool b5 = noexcept(S{});      // true  — default constructor is implicitly noexcept
```

### 14.7 异常安全保证

> 对应 LearnCpp 27.9 —— "Exception safety guarantees"

一个函数可以做出 **四级在契约上有意义** 的安全保证：

| 等级 | 含义 |
|---|---|
| **无保证（No guarantee）** | 抛异常时啥事都可能发生 —— 对象可能不可用、内存可能泄漏。 |
| **基本保证（Basic guarantee）** | 抛异常时不漏内存，对象仍可用，但状态可能已被改变。 |
| **强保证（Strong guarantee）** | 抛异常时不漏内存，**且** 程序状态保持不变。操作要么完整成功、要么没有可观察的副作用（事务性）。 |
| **不抛 / 不失败（No-throw / No-fail）** | 函数要么总是成功（no-fail），要么从不让异常逃出（no-throw）。`noexcept` 对应这一级。 |

**No-throw** 是以下情形的硬性要求：

- **析构函数**（以及析构函数调用的任何东西）—— 因为它们在栈展开时执行，而展开过程中再抛会杀掉整个程序。

**No-fail** 是以下情形的硬性要求：

- **移动构造函数** 和 **移动赋值运算符**（这样标准库能在 noexcept 感知的容器里放心地使用 move）
- **swap** 函数
- 容器的 clear / erase / reset
- `std::unique_ptr` 上的操作

### 14.8 何时使用 noexcept

**标 `noexcept` 的理由：**

1. 允许它被安全地从析构函数和其他 no-throw 上下文里调用。
2. 让编译器有机会优化（不用保留可展开的栈）。
3. 一些标准库容器（特别是 `std::vector`）通过 `std::move_if_noexcept` 检查 `noexcept`，决定走快的 move 路径还是慢的 copy 路径。详见 LearnCpp 27.10。

**标准库的策略：** 只对真正 **必须不能** 抛异常的函数标 `noexcept`。对于只是"恰好不抛"的函数，通常不标。

> ⚠️ **最佳实践 —— 永远 `noexcept`：**
> - **移动构造函数**
> - **移动赋值运算符**
> - **swap 函数**

> ⚠️ **最佳实践 —— 能标就标 `noexcept`：**
> - 拷贝构造函数和拷贝赋值运算符（如果它们不抛）
> - 析构函数（通常已经隐式 noexcept）

> ⚠️ **最佳实践 —— 拿不准时：**
> **宁可不标 `noexcept`。** 之后再去掉一个 `noexcept` 标注对那些依赖此承诺的用户来说是个 breaking change。*加上* `noexcept` 总是安全的。

### 14.9 动态异常规范（已废弃）

> 选读

在 C++11 之前直到 C++17，有一种不同的语法 —— **动态异常规范**：

```cpp
int doSomething() throw();                          // does not throw
int doSomething() throw(std::out_of_range, int*);   // may throw these specific types
int doSomething() throw(...);                       // may throw anything
```

这套机制 **在 C++11 中被弃用，在 C++17/C++20 中被移除**，因为它实现上有漏洞、跟模板配合不好，还容易引起误解。**`noexcept` 完全取代了它**。

如果你在老代码里看到 `throw()`，那是过时的 `noexcept` 写法。

---

## 15. Friend 非成员函数

> 对应 LearnCpp 15.8（整章）

### 15.1 为什么需要 friend

到目前为止访问控制的规则都是黑白分明的：

- 私有成员：只对类的其他成员可见。
- 公有成员：对所有人可见。

但真实设计有时需要一片 *中间地带*：

- 一个 **专门的显示类** 想读取存储类的私有字段，但你不愿把这些字段暴露给世界其他地方。
- 一个 **非成员函数** 在语法上应当像类成员一样行事（典型场景是二元运算符重载，希望两个操作数被对称处理）。

公有 getter 是一个办法，但它会暴露实现细节。**Friend** 提供了一个有针对性的替代方案。

### 15.2 friend 机制

在类体内部，`friend` 声明告诉编译器"这另一个类或函数可以完整访问我的私有和受保护成员"。**friend** 可以是：

- 一个非成员函数（本节）
- 一个类
- 另一个类的成员函数（LearnCpp 下一章；不在本周阅读里）

> 💡 **核心洞察**
> friend 关系是 **由成员将被访问的那一方主动授予** 的 —— 而不是被外部请求的。类始终掌控着谁能拿到访问权。在访问控制 + friend 声明的双重保护下，封装在设计层面是被保留下来的。

`friend` 声明放在类体的哪里都没关系 —— 它不受 `public:` / `private:` 标签的影响。

### 15.3 Friend 非成员函数 —— 基本例子

```cpp
#include <iostream>

class Accumulator
{
private:
    int m_value { 0 };

public:
    void add(int value) { m_value += value; }

    // Grant friendship to the non-member function print(const Accumulator&)
    friend void print(const Accumulator& accumulator);
};

void print(const Accumulator& accumulator)
{
    // Because print is a friend, it can touch m_value directly
    std::cout << accumulator.m_value;
}

int main() {
    Accumulator acc{};
    acc.add(5);
    print(acc);                              // 5
}
```

要点：

- `print` **不是** 成员函数。它没有 `this`。要操作的 `Accumulator` 必须显式传入。
- `friend` 声明只是一份 **承诺**：这个函数（稍后定义时）会拥有访问权。它本身并不定义 `print`。

### 15.4 在类体内定义 friend

你也可以把 friend 的定义直接写进类体里：

```cpp
class Accumulator
{
private:
    int m_value { 0 };

public:
    void add(int value) { m_value += value; }

    // Friend defined right here — still a NON-MEMBER function
    friend void print(const Accumulator& accumulator)
    {
        std::cout << accumulator.m_value;
    }
};
```

> ⚠️ **常见坑**
> 尽管 `print` 写在类的花括号里，它 **不是** `Accumulator` 的成员。它仍然是个非成员函数 —— 唯一的区别是编译器把它当成"好像在类外定义"那样处理。

### 15.5 对称性：为什么有时非成员更好

对比一下成员版本和非成员版本的相等性判断：

```cpp
class Value {
    int m_value{};
public:
    explicit Value(int v) : m_value{v} { }

    bool isEqualToMember(const Value& v) const;
    friend bool isEqualToNonmember(const Value& v1, const Value& v2);
};

bool Value::isEqualToMember(const Value& v) const {
    return m_value == v.m_value;             // one implicit (this), one explicit (v)
}

bool isEqualToNonmember(const Value& v1, const Value& v2) {
    return v1.m_value == v2.m_value;         // both explicit — symmetric
}
```

非成员版本读起来更自然，因为两个操作数被一致地对待。重载 `operator+` 或 `operator==` 这种二元运算符时这模式尤其有价值 —— 你不想让某一个操作数变得"特殊"。

### 15.6 多重 friend 与前向声明

一个函数可以同时是多个类的 friend。当两个类都要把同一个函数 befriend 时，你需要 **前向声明**：

```cpp
#include <iostream>

class Humidity;            // forward declaration so Temperature can mention it

class Temperature {
    int m_temp { 0 };
public:
    explicit Temperature(int t) : m_temp{t} { }
    friend void printWeather(const Temperature& temp, const Humidity& humidity);
};

class Humidity {
    int m_humidity { 0 };
public:
    explicit Humidity(int h) : m_humidity{h} { }
    friend void printWeather(const Temperature& temp, const Humidity& humidity);
};

void printWeather(const Temperature& temp, const Humidity& humidity) {
    std::cout << "Temperature: " << temp.m_temp
              << ", Humidity: " << humidity.m_humidity << '\n';
}
```

为什么 `printWeather` 做成非成员更好？

- 它 **平等地** 使用两个类 —— 把它做成其中任一个类的成员都会引入人为的不对称。
- 作为两边的 friend，它对两个类的私有数据都有访问权。

**前向声明的语法** 就是 `class Humidity;` —— 不带返回类型、不带参数、只有名字。（模板要稍多一点：`template <typename T> class Foo;`。）前向声明的工作方式跟函数前向声明一样：告诉编译器"这个标识符存在，完整细节晚点给你"。

### 15.7 Friend 破坏封装吗？

经典反对意见：「friend 能看到私有成员，封装不就破了吗？」

LearnCpp 的回答：**不破坏，因为是类本身授予了这个访问权**。把 friend 想成类的 **延伸** 最合适 —— 它跟类有同等的访问权，逻辑上属于同一个模块，只是语法上不在类体里。

不过 friend 确实引入了 **耦合**：你改类的实现时，所有的 friend 都可能要跟着改。要缓解这点：

> ⚠️ **最佳实践**
> friend 函数能用公有接口就尽量用公有接口，少用直接访问。这能让 friend 免受未来实现变更的影响。

### 15.8 优先非 friend 而非 friend

延续"工具操作通常做成非成员函数比成员函数好"这条更宏观的原则：

> ⚠️ **最佳实践**
> 能做成 **非 friend** 时优先做成非 friend。

对比一下：

```cpp
// VERSION 1 — friend, directly accesses m_value
class Accumulator {
    int m_value { 0 };
public:
    void add(int v) { m_value += v; }
    friend void print(const Accumulator& a);
};
void print(const Accumulator& a) { std::cout << a.m_value; }

// VERSION 2 — non-friend, uses public accessor
class Accumulator {
    int m_value { 0 };
public:
    void add(int v) { m_value += v; }
    int  value() const { return m_value; }    // reasonable public accessor
};
void print(const Accumulator& a) { std::cout << a.value(); }
```

版本 2 里，如果你之后把 `m_value` 改名成 `m_total`，只需要改 `Accumulator` 本身 —— `print` 不受影响。

但要小心：每多一个公有 accessor 就给类接口添一点 **杂乱**。对小类（比如 `Accumulator`）来说，加个 accessor 没问题。对更大更复杂的类，把 friend 用对反而比堆十个一行 accessor 更整洁。

### 15.9 与 Python 的对比

| | Python | C++ |
|---|---|---|
| 封装的强制力 | 仅仅是约定（`_name`、`__name`） | 编译器强制（`private`、`protected`） |
| "friend" 机制 | 不需要 —— 任何人都可以戳 `obj._private` | 显式的 `friend` 声明 |
| 常见模式 | 直接访问"私有"属性 | 要么加公有 accessor、要么授予 friend |

Python 的"我们都是有自制力的成年人"哲学让 friend 显得多余；C++ 严格的强制让 friend 在你想 *有选择地* 绕过它时变得必要。

---

## 16. 字符串流（stringstream）

> 对应 LearnCpp 28.4（整章）

### 16.1 什么是 stringstream

`std::stringstream` 及其同族流对象用一个 `std::string` 作为 **缓冲区**，而不是文件或控制台。你可以：

- 用 `<<` 把值 **插入** 缓冲区。
- 用 `>>` 从缓冲区 **提取** 值。
- 在任何接受流的地方使用它。

它们常用于：

- **缓冲** 输出，留待之后显示。
- 在字符串和其他类型（数字、自定义类等）之间 **转换**。
- 按行读 **输入**，然后在行内做 token 拆分。

### 16.2 六个流类

要用其中任何一个，需要 `#include <sstream>`。

| 类 | 继承自 | 用途 |
|---|---|---|
| `istringstream` | `istream` | 从字符串读（只提取） |
| `ostringstream` | `ostream` | 写入字符串（只插入） |
| `stringstream`  | `iostream` | 两个方向都行 |
| `wistringstream`、`wostringstream`、`wstringstream` | 宽字符版本 | 同上，但服务于 `wchar_t` 字符串 |

### 16.3 把数据放进去

**方法 1 —— 插入运算符：**

```cpp
std::stringstream os;
os << "en garde!\n";        // appends to the buffer
```

**方法 2 —— `str(string)` 成员函数：**

```cpp
std::stringstream os;
os.str("en garde!");        // replaces the entire buffer
```

`<<` *追加*；`str(s)` *替换*。

### 16.4 把数据取出来

**方法 1 —— `str()` 返回整个缓冲区：**

```cpp
std::stringstream os;
os << "12345 67.89\n";
std::cout << os.str();      // prints: 12345 67.89
```

**方法 2 —— 提取运算符 `>>` 一次读一个值：**

```cpp
std::stringstream os;
os << "12345 67.89";

std::string a, b;
os >> a;                    // a = "12345"
os >> b;                    // b = "67.89"
std::cout << a << " - " << b << '\n';   // 12345 - 67.89
```

> 💡 **核心洞察**
> `>>` 和 `str()` 工作在 **不同层面**：
> - 每次 `>>` 都从流的"读指针"位置读 **下一个 token**。多次 `>>` 在缓冲区里前进。
> - `str()` 返回 **整个缓冲区**，不管已经 `>>` 多少次。

### 16.5 字符串与数字互转

这是 C++ 里最常见的惯用法之一。插入/提取运算符已经知道怎么格式化每种基本类型，所以一个 stringstream 就成了通用转换器。

**数字 → 字符串：**

```cpp
std::stringstream os;
constexpr int    n = 12345;
constexpr double d = 67.89;
os << n << ' ' << d;

std::string s1, s2;
os >> s1 >> s2;
std::cout << s1 << ' ' << s2 << '\n';     // 12345 67.89
```

（真实代码里通常直接 `os.str()` 拿到 `"12345 67.89"` 这一整个字符串。）

**数字字符串 → 数字：**

```cpp
std::stringstream os;
os << "12345 67.89";

int    n {};
double d {};
os >> n >> d;
std::cout << n << ' ' << d << '\n';       // 12345 67.89
```

提取运算符会自动把文本表示转换为目标类型。

> ⚠️ **小贴士**
> 单次转换时，现代替代品 `std::to_string(x)`（数字 → 字符串）和 `std::stoi(s)` / `std::stod(s)`（字符串 → 数字）更简单。当你需要 **一连串** 转换、或需要流的格式化特性（精度、十六进制等）时，stringstream 才真正发光。

### 16.6 重置 stringstream 以便复用

两件相关但不同的事可能都要清：

- **缓冲区** 本身（内容）。
- **错误标志位**（例如 `eofbit`、上次提取失败留下的 `failbit`）。

**用 `str("")` 清缓冲区：**

```cpp
std::stringstream os;
os << "Hello ";
os.str("");                  // erase the buffer
os << "World!";
std::cout << os.str();       // prints: World!
```

`std::string{}` 也一样有效：

```cpp
os.str(std::string{});       // same effect
```

**用 `clear()` 清错误标志位：**

```cpp
os.clear();                  // reset stream state to "good"
```

> ⚠️ **最佳实践**
> 复用 stringstream 时，**两件事都做**：调 `str("")`（清缓冲区） **和** `clear()`（清标志位）。只清其中一个会出意外 —— 例如提取静默地什么也不做，因为 `failbit` 还没清。

```cpp
std::stringstream os;
os << "Hello ";
os.str("");                  // clear contents
os.clear();                  // clear flags
os << "World!";              // safe to reuse
std::cout << os.str();
```

### 16.7 与 Python 的对比

| | Python | C++ |
|---|---|---|
| 字符串"流"类型 | `io.StringIO` | `std::stringstream` |
| 数字 → 字符串 | `str(x)` 或 `f"{x}"` | `std::to_string(x)` 或 `ss << x; ss.str()` |
| 字符串 → int | `int(s)` | `std::stoi(s)` 或 `ss >> n` |
| 字符串 → float | `float(s)` | `std::stod(s)` 或 `ss >> d` |
| 多值解析 | `s.split()` 后遍历 | `ss >> a >> b >> c` |

```python
# Python
import io
ss = io.StringIO()
ss.write("hello ")
ss.write("world")
print(ss.getvalue())          # "hello world"

# Parsing tokens
parts = "12345 67.89".split()
n = int(parts[0])
d = float(parts[1])
```

```cpp
// C++
std::stringstream ss;
ss << "hello " << "world";
std::cout << ss.str();        // "hello world"

// Parsing tokens
std::stringstream parser{"12345 67.89"};
int    n;
double d;
parser >> n >> d;
```

---

## 17. 来自 Topic 6 PPT 的遗留主题：多继承、虚基类与零规则

> 对应 PPT *Topic 6: Inheritance & Polymorphism*，幻灯片 27、29–31、33
>
> ⚠️ **关于范围**：这个主题 **不在** Week 7 的 LearnCpp 阅读清单里。它在 Week 6 笔记里被标记为"可能属于 Week 7"，因为它出现在 Topic 6 PPT 的末尾（这份 PPT 横跨 Week 6 和 Week 7 两周课）。遵循"拿不准就先放进来"的原则，这里重述并展开。如果你的 Week 7 课跳过它，可以放心略读本节。

### 17.1 public、private、protected 继承（PPT page 27）

到目前为止我们只用过 `public` 继承，它建模"is-a"关系。C++ 还允许 `private` 和 `protected` 继承，但它们的含义大不相同。

| 继承方式 | Base 的 public 成员变成 …… | Base 的 protected 成员变成 …… | 建模什么 |
|---|---|---|---|
| `public` | Derived 中的 `public` | Derived 中的 `protected` | **is-a** 关系（子类型） |
| `protected` | Derived 中的 `protected` | Derived 中的 `protected` | 复用实现，并允许进一步派生时仍可访问 |
| `private` | Derived 中的 `private` | Derived 中的 `private` | 纯复用实现（不构成 kind-of 关系） |

**Klefstad 的经验法则：**

- 当 Derived **是 Base 的一种** 时，用 `public` 继承。
- 当 Derived 只想 **复用** Base 的实现、概念上并不属于 Base 时，用 `private` 继承。

> ⚠️ **Klefstad 注**：为了纯实现复用而使用 `public` 继承是误用 —— 它错误地暗示 Base 上所有操作对 Derived 都成立。（例如 `Stack` 公有继承自 `Vector` 会让用户能写 `stack[5]`，违反栈语义。）

三种继承形式下，派生类都能访问基类的 **protected** 成员。

### 17.2 多继承 —— 基础

C++ 允许一个类同时继承 **多个** 基类：

```cpp
class Foo : public Base1, public Base2 { /* ... */ };
```

一个 `Foo` 对象现在包含一份 `Base1` 子对象和一份 `Base2` 子对象。它能用在任何接受 `Base1` 引用/指针的地方，也能用在任何接受 `Base2` 引用/指针的地方。

> 💡 **跟 Java/C# 的对比**：Java 和 C# 不允许 *类* 的普通多继承 —— 只允许 *接口* 的多继承。这是一种有意的简化，避免 C++ 多继承带来的麻烦。

### 17.3 名字冲突问题（PPT page 31）

如果两个基类都有同名成员，派生类把 **两份都继承下来**，编译器分不清你指的是哪一个：

```cpp
struct Base1 { int foo(); /* ... */ };
struct Base2 { int foo(); /* ... */ };
struct Derived : Base1, Base2 { /* ... */ };

int main() {
    Derived d;
    d.foo();        // ERROR: ambiguous — which foo()?
}
```

**修法 1 —— 用作用域运算符限定：**

```cpp
d.Base1::foo();         // explicitly want Base1's version
```

**修法 2 —— 在 Derived 中定义 `foo` 覆盖或合并：**

```cpp
struct Derived : Base1, Base2 {
    int foo() { Base1::foo(); Base2::foo(); return 0; }
};
```

### 17.4 钻石问题（PPT pages 29–30）

假设 `Base` 同时被 `Mid1` 和 `Mid2` 继承，再有一个 `Bottom` 同时继承自 `Mid1` 和 `Mid2`：

```
        Base
       /    \
    Mid1    Mid2
       \    /
       Bottom
```

这就是 **钻石继承（diamond inheritance）**。两个问题：

1. **存储重复** —— `Bottom` 包含 **两份** `Base` 的成员（一份经 `Mid1`、一份经 `Mid2`）。
2. **歧义** —— 对 `Base` 数据成员的引用有歧义：你指的是哪一份？

```cpp
class Vector { /* ... */ };
class CheckedVector : public Vector { /* ... */ };       // standard inheritance
class InitVector    : public Vector { /* ... */ };       // standard inheritance
class InitCheckedVector : public CheckedVector, public InitVector { /* ... */ };
// !! InitCheckedVector contains TWO Vector subobjects: one via CheckedVector, one via InitVector
```

### 17.5 虚基类 —— 解决方案

> 对应 PPT pages 29–30

在继承声明里加 `virtual` 关键字告诉编译器：「即使这个基类在继承层次里出现多次，在最终对象里 **只放一份**。」

```cpp
class Vector { /* ... */ };
class CheckedVector : public virtual Vector { /* ... */ };
class InitVector    : public virtual Vector { /* ... */ };
class InitCheckedVector : public CheckedVector, public InitVector { /* ... */ };
// Now InitCheckedVector contains exactly ONE Vector subobject, shared between CheckedVector and InitVector.
```

> ⚠️ **Klefstad 警告**
> 虚基类有一个关键限制：它 **必须有无参构造函数**。因为最派生类要直接负责构造每一个虚基类（不经过中间类），而编译器生成的那条路径走的是默认构造函数。

> ⚠️ **Klefstad 警告（PPT page 30）**
> "理解和使用虚基类很难。" 这被广泛认为是 C++ 的黑暗角落之一。只有真的需要钻石模式时才用它。

### 17.6 Square：virtual public Shape、virtual public Rectangle（PPT page 33）

PPT 用这个例子初步演示虚继承如何与构造函数配合：

```cpp
class Square
    : virtual public Shape,
      virtual public Rectangle
{
    int side;
public:
    Square(int cx, int cy, std::string nm, int my_side)
        : Shape(cx, cy, nm),                                   // direct call!
          Rectangle(cx, cy, nm, my_side, my_side),
          side(my_side)
    {
    }
};
```

两件不显然的事：

1. **最派生类（`Square`）显式调用虚基类的构造函数 `Shape(...)`。** 正常情况下，一个类只调用 *直接基类* 的构造函数，由直接基类再调用它们的基类构造函数。但对 **虚基类** 来说，是最派生类负责直接构造它 —— 当 `Rectangle` 通过 `Square` 被调用时，`Rectangle` 构造函数里对 `Shape(...)` 的调用会被忽略。
2. **Shape 和 Rectangle 都用 `virtual public` 继承。** 这样即便 `Rectangle` 也继承自 `Shape`，`Square` 里也只有一份 `Shape` 子对象。

> 💡 **Klefstad 的总结**：这能用，但很别扭。大多数生产代码完全避免多继承具体类。接口继承（多继承中除一个之外全部都是纯抽象接口）干净得多 —— Java/C# 就只允许这种。

### 17.7 与 Python 的对比

Python 原生支持多继承，并用 C3 线性化算法计算 **MRO（Method Resolution Order）** 来解决歧义：

```python
class Base:    
    def foo(self): return "Base"

class Mid1(Base):
    def foo(self): return "Mid1"

class Mid2(Base):
    def foo(self): return "Mid2"

class Bottom(Mid1, Mid2):
    pass

b = Bottom()
print(b.foo())              # "Mid1" — leftmost base wins
print(Bottom.__mro__)       # (Bottom, Mid1, Mid2, Base, object)
```

C++ 不自动算 MRO —— 你必须显式限定有歧义的调用、或者覆盖它们。这就是为什么 C++ 的多继承棱角更锋利。

### 17.8 零规则（Rule of Zero）

> 对应 Klefstad 的 Topic 7 PPT 第 2 页 —— 在 Week 6"三/五规则"的基础上再往前一步

Week 6 介绍了六个特殊成员函数（默认构造、析构、拷贝构造、拷贝赋值、移动构造、移动赋值），以及**三规则 / 五规则**：如果你的类需要一个自定义析构，那它八成也需要自定义拷贝/移动。

CppCoreGuidelines 的 C.20 把这个问题反过来问。在你打算写这些操作之前，先问自己：**能不能干脆一个都不写？**

> **C.20: If you can avoid defining default operations, do.**
> 理由：这是最简单的方式，语义也最干净。

**例子：**

```cpp
struct Named_map {
    // …… 没有声明任何默认操作 ……
    std::string name;
    std::map<int, int> rep;
};

Named_map nm;                       // 默认构造 —— 工作
Named_map nm2 { nm };               // 默认拷贝构造 —— 工作
Named_map nm3 = std::move(nm2);     // 默认移动构造 —— 工作
```

因为 `std::string` 和 `std::map` 自己都正确定义了全部六个特殊函数，所以编译器为 `Named_map` 生成的默认版本就**自动正确**——拷贝时深拷贝、移动时移动、析构时正确析构。

> 💡 **关键洞见**
> 这就叫**零规则（Rule of Zero）**：设计良好的类**一个**自己的特殊成员函数都不声明，因为每个成员都已经用 RAII 管好了自己的资源。

> ⚠️ **最佳实践**
> 默认按 Rule of Zero 来。只有当你的类亲自管理某个**原始资源**——通常是裸指针指向的动态内存、操作系统文件句柄、socket、mutex —— 编译器生成的默认操作会出错时，才需要升级到 Rule of Three / Rule of Five。

| 规则 | 何时适用 | 需要声明 |
|------|---------|---------|
| 零规则 | 默认情况 —— 所有成员都是 RAII 类型 | 什么都不写 |
| 三规则 | 类管理一个原始资源（C++11 之前） | 析构、拷贝构造、拷贝赋值 |
| 五规则 | 类管理一个原始资源（C++11 及之后） | 析构 + 两个拷贝 + 两个移动 |

---

## 18. Namespaces（命名空间）

> 对应 Klefstad 的 Topic 7 PPT 第 28–29 页

### 18.1 为什么需要命名空间

在没有命名空间的年代，C++（和 C）只有一个扁平的**全局作用域**。两个库都定义了一个叫 `print()` 的自由函数、或者都叫 `List` 的类，链接时就会**冲突**。命名空间的存在就是为了给每个库一片自己的有名字的作用域。

> 💡 **关键洞见**
> 命名空间是一片**有名字**的作用域，你把声明放进去。两个相同名字处在两个不同命名空间里，就是**两个不同的实体**，互不冲突。

C++ 标准库的所有标识符都在 **`std`** 这个命名空间里。

### 18.2 定义命名空间

```cpp
namespace mySpace {
    class Stack;
    std::ostream& operator<<(std::ostream& out, const Stack& stk);
    void myStackFunction(Stack s);
}
```

命名空间是**开放**的 —— 它可以跨多个文件，多次"打开"往里加东西：

```cpp
// stack.h
namespace mySpace {
    class Stack { /* ... */ };
}

// helpers.h
namespace mySpace {
    void myTopLevelFunction();    // 加进**同一个** mySpace
}
```

`mySpace { … }` 里面的一切都变成 `mySpace::name`。

### 18.3 使用命名空间名字的三种方式

**1. 限定访问 —— 每次都写 `命名空间::名字`**

```cpp
mySpace::Stack stk;
mySpace::myTopLevelFunction();
myStackFunction(stk);         // OK：ADL 找到 mySpace::myStackFunction
                              //     （实参依赖查找，见 §18.4）
std::cout << stk;             // OK：std::cout，ADL 找到 mySpace::operator<<
```

最显式的写法 —— 没有歧义，也没意外。

**2. `using` 声明 —— 把一个名字引入当前作用域**

```cpp
using mySpace::Stack;
using std::cout;

Stack stk;                    // 这里不加限定的 Stack 就指 mySpace::Stack
myStackFunction(stk);
cout << stk;                  // 不加限定的 cout 就指 std::cout
```

折中方案 —— 一个一个名字按需引入。

**3. `using namespace` 指令 —— 把整个命名空间打开**

```cpp
using namespace std;
using namespace mySpace;

Stack stk;
myTopLevelFunction();
myStackFunction(stk);
cout << stk;
```

> ⚠️ **最佳实践**
> 永远不要在**头文件**的文件作用域写 `using namespace std;` —— 它会泄露到每个 include 这个头的翻译单元，把命名空间存在的意义彻底毁掉。`.cpp` 文件里可以容忍，函数内的小作用域里完全没问题。专业默认做法是**限定写 `std::`**，或者写小范围的 `using std::cout;` 声明。

### 18.4 实参依赖查找（ADL / Koenig Lookup）

当你写 `myStackFunction(stk)`，而 `stk` 的类型在 `mySpace` 里时，编译器会**自动**到 `mySpace` 里找匹配的函数 —— 你不需要写 `mySpace::`。这就是**实参依赖查找**（也叫 Koenig 查找）。

`std::cout << x` 能不写 `std::operator<<(std::cout, x)` 直接工作，就是靠它：编译器发现 `std::cout` 的类型在 `std` 里，于是去 `std` 里找 `operator<<`。

### 18.5 嵌套命名空间与别名

命名空间可以嵌套，C++17 还提供了一行短写法：

```cpp
namespace outer::inner {       // C++17 —— 等同于 namespace outer { namespace inner { …
    void f();
}

outer::inner::f();
```

太长的命名空间名可以起个别名：

```cpp
namespace fs = std::filesystem;
fs::path p { "data.txt" };
```

### 18.6 匿名命名空间（文件级私有作用域）

没有名字的命名空间，里面的内容是**内部链接**——只在当前翻译单元可见（相当于文件作用域的 `static`）：

```cpp
namespace {
    int helper(int x) { return x * 2; }   // 只有这个 .cpp 文件能看到
}
```

### 18.7 与 Python 的对比

Python 的**模块**大致就是 C++ 的命名空间：

| C++ | Python |
|------|--------|
| `mySpace::Stack` | `mySpace.Stack` |
| `using mySpace::Stack;` | `from mySpace import Stack` |
| `using namespace mySpace;` | `from mySpace import *`（Python 里也不推荐） |
| 匿名命名空间 | 名字前加下划线"约定私有" |

同样的取舍：限定访问显式但啰嗦，通配导入方便但容易撞名。

---

## 19. Week 7 综合 Cheat Sheet

> 一页纸总结，方便快速复习

### 19.1 函数模板

```cpp
template <typename T>
T myMax(T a, T b) { return (a < b) ? b : a; }

myMax<int>(1, 2);     // explicit
myMax<>(1, 2);        // deduce, template-only
myMax(1, 2);          // deduce, non-template preferred if any
```

- 模板 = 喷漆样板；实例按需生成。
- 每个翻译单元里、每种独特类型 **只生成一次** 实例。
- 静态局部变量是 **每实例独立** 的，不共享。

### 19.2 类模板

```cpp
template <typename T>
class Array {
    T* m_data{};
public:
    Array(int n) : m_data{ new T[n]{} } { /* ... */ }
    T& operator[](int i);
};

template <typename T>
T& Array<T>::operator[](int i) { return m_data[i]; }
```

- 类外定义的每个成员函数都需要 **自己的** `template <typename T>`。
- **模板的实现总是放在头文件里**（或用 `.inl` / 显式实例化），否则会有链接错误。

### 19.3 非类型模板参数

```cpp
template <typename T, int N>
class StaticArray { T arr[N] {}; };

StaticArray<int, 12> a;   // size is part of the type
```

- 调用点的值必须是 `constexpr`。

### 19.4 Lambda 速查

```cpp
auto f = [captures](params) -> ret { body };

[]      // no captures
[=]     // default capture by value
[&]     // default capture by reference
[x]     // capture x by value
[&x]    // capture x by reference
[=, &x] // x by ref, everything else by value
[&, x]  // x by value, everything else by ref
[y{expr}]  // declare new variable y inside the lambda
```

| 维度 | 规则 |
|---|---|
| 按值捕获 | 默认只读；加 `mutable` 才能改（改的是内部副本） |
| 按引用捕获 | 可改；**生命周期要小心** |
| 存进变量 | `auto`、`std::function`、函数指针（仅限无捕获） |
| 传给函数 | `auto&`（C++20）> 模板 `T&` > `std::function<…>` > 函数指针 |

### 19.5 异常速查

| 结构 | 语法 |
|---|---|
| 抛出 | `throw expr;` |
| Try/catch | `try { … } catch (T x) { … }` |
| Catch all | `catch (...) { … }`（必须放最后） |
| std::exception | `catch (const std::exception& e) { e.what(); }` |
| noexcept | `void f() noexcept;`（不让异常逃出） |

**匹配规则：**
- catch 类型之间不做隐式转换（`int` ≠ `double`）。
- 派生类 **能匹配** 基类处理器；派生类要放 **前面**。
- 类异常：用 **`const T&`** 捕（避免拷贝 + slicing）。
- 基本类型：按 **值** 捕。

**永远 `noexcept`：** 移动构造、移动赋值、swap。
**永远非抛异常：** 析构函数（隐式）。

**栈展开规则：** 被展开的函数里的局部变量 **会被销毁**。未捕获异常 ⟹ `std::terminate`，**栈不一定会展开**。

### 19.6 Friend 函数

```cpp
class Foo {
    int m_value{};
    friend void print(const Foo& f);   // grant friendship
};
void print(const Foo& f) { std::cout << f.m_value; }
```

- friend 关系由类授予。
- friend **不是** 成员 —— 没有 `this`，必须把类作为显式形参传入。
- 另一个类的 friend 声明里要引用本类时，用 `class Foo;` 前向声明。
- 公有 accessor 能满足需要时 **优先非 friend**。

### 19.7 Stringstream 食谱

```cpp
#include <sstream>

std::stringstream ss;
ss << 42 << ' ' << 3.14;          // write
std::string all = ss.str();       // get full buffer

int n; double d;
ss >> n >> d;                     // read tokens

ss.str("");                       // clear buffer
ss.clear();                       // clear error flags
```

### 19.8 多继承与虚基类（Topic 6 PPT 遗留）

```cpp
class A : public virtual Base { /* ... */ };
class B : public virtual Base { /* ... */ };
class C : public A, public B { /* ... */ };   // only ONE Base subobject in C
```

- 不写 `virtual`，钻石继承让你得到 **两份** `Base`。
- 写 `virtual` 就只有一份 —— 但最派生类必须直接调用 `Base()` 构造函数。
- 虚基类必须有 **无参构造函数**。
- 成员名歧义时：`obj.Base1::name`。

---

## 20. Week 7 最重要的五条记忆

1. **模板按需实例化，每种独特类型在每个翻译单元里只实例化一次。** 模板 **定义必须在实例化点可见** —— 这就是为什么类模板的实现住在头文件（或 `.inl` 文件）里、不住在 `.cpp` 里。链接错误 "undefined reference to `Array<int>::operator[]`" 是忘了这条规则的经典症状。

2. **捕获是外层变量在 lambda 创建那一刻的拷贝（按值）或别名（按引用）。** 按值捕获给你一份 **私有快照**，在多次调用之间保留；`mutable` 才允许修改这份快照。按引用捕获共享外层变量 —— **但被捕获的对象必须比 lambda 活得久**，否则你拿到一个悬挂引用。最常见的 bug：按引用捕获了一个局部变量，又把 lambda 从函数里返回出去。

3. **`throw` / `try` / `catch` 规则 —— 背下来：**
   - catch 匹配 **不做隐式转换**（`int` ≠ `double`、`char` ≠ `int`）。
   - 派生类异常会匹配基类处理器，所以 **派生处理器要放前面**。
   - 类异常用 **`const T&`** 捕，避免拷贝、防止 **slicing**。
   - **Catch-all `catch(...)`** 必须放最后。
   - **栈展开** 销毁被展开帧中的局部变量（它们的析构函数会跑）—— 这就是 RAII 在异常下仍然奏效的原因。

4. **`noexcept` 是契约，不是编译器强制的不变量。** 编译器接受函数体里有 throw 的 noexcept 函数 —— 但一旦异常从 noexcept 函数里逃出去，`std::terminate()` 立即被触发，往往 **不展开** 栈。永远把 **移动构造、移动赋值、swap** 标 `noexcept`，这样 STL 容器（特别是 `std::vector`）才能通过 `std::move_if_noexcept` 走"resize 时移动"的快速路径。

5. **friend 关系由类授予，不是由外人请求的。** `friend` 声明让指定的函数或类能看到私有/受保护成员，但它不破坏封装 —— 它精准、显式、明确写在类定义里。能用一个小的公有 accessor 解决时 **优先用非 friend 非成员函数**。把 friend 留给那种"用 accessor 会让公共接口堆出十个一行小函数"的场景。

> ⚠️ **PPT vs 阅读材料的优先级提醒**：当 Klefstad 的 PPT 与 LearnCpp 不一致时，**以 PPT 为准**（PPT 在本课是权威）。Week 6 vs Week 7 边界拿不准时，把内容收进来 —— 多覆盖好过少覆盖。
