# Information and Computer Science 45C — Week 8 整合学习笔记

## 目录

- [1. 周学习目标](#1-周学习目标)
- [2. C++ 标准库](#2-c-标准库)
- [3. STL 框架 — 总体概念](#3-stl-框架--总体概念)
- [4. 容器：分类总览](#4-容器分类总览)
- [5. 序列容器（Sequence Containers）](#5-序列容器sequence-containers)
- [6. 关联容器（Associative Containers）](#6-关联容器associative-containers)
- [7. 容器适配器（Container Adapters）](#7-容器适配器container-adapters)
- [8. 把任务匹配到容器（Klefstad 练习）](#8-把任务匹配到容器klefstad-练习)
- [9. STL Iterators](#9-stl-iterators)
- [10. Iterator 分类](#10-iterator-分类)
- [11. STL Algorithms](#11-stl-algorithms)
- [12. Iterator Adapters](#12-iterator-adapters)
- [13. 算法中的函数对象（Function Objects）](#13-算法中的函数对象function-objects)
- [14. Ranges（C++20）](#14-rangesc20)
- [15. I/O 流 — iostream 库](#15-io-流--iostream-库)
- [16. 用 istream 做输入](#16-用-istream-做输入)
- [17. 用 ostream 与 ios 做输出](#17-用-ostream-与-ios-做输出)
- [18. 容器横向对比速查表](#18-容器横向对比速查表)
- [19. Week 8 综合 Cheat Sheet](#19-week-8-综合-cheat-sheet)
- [20. Week 8 最重要的五条记忆](#20-week-8-最重要的五条记忆)

> UCI ICS 45C: Programming in C++ (35770)
> 本笔记整合 Week 8 阅读材料：LearnCpp 21.1（标准库）、21.2（STL 容器总览）、21.3（STL iterator 总览）、21.4（STL 算法总览）、28.1（输入输出流）、28.2（用 istream 做输入）、28.3（用 ostream 与 ios 做输出）；cppreference 上 `std::vector`、`std::set` 与 `std::map` 的参考页；以及 Klefstad 教授的 *Topic 8* PPT —— STL 容器、iterator、算法、insert/stream/reverse iterator adapter、容器适配器、函数对象与 ranges。内容按 **主题** 组织，而不是按出处。
> 关于跨周 PPT 内容的说明：Topic 8 PPT 的第 26–27 张幻灯片讲的是 **标准 C++ 异常层次结构**（`std::bad_alloc`、`std::logic_error`、`std::runtime_error` 等）。异常处理这部分属于 Week 7 阅读列表（LearnCpp 27.x），所以这里不再重复 —— 它们已经整合在 Week 7 笔记的 9–14 节里。如果想看一行版的标准异常层次回顾，参考 Week 7 cheat sheet 的 19.5 节。

---

## 1. 周学习目标

> Week 8 三个概念板块的鸟瞰

### 1.1 标准模板库 — STL（chapters 21.1–21.4）

- 理解：什么是 **C++ 标准库**，以及它为什么存在
- 掌握：STL 的三方分解 —— **containers、iterators、algorithms** —— 以及它们如何组合在一起
- 区分：**sequence containers**（vector、deque、list、array、forward_list、string）vs. **associative containers**（set、map、multiset、multimap、unordered 各种版本）vs. **container adapters**（stack、queue、priority_queue）
- 掌握：为一项任务挑选合适的容器（sequence vs. associative；有序 vs. 无序;只存元素 vs. 键/值对）
- 掌握:**iterator 抽象** —— `begin()`、`end()`、`*`、`++`、`==`，以及半开区间 `[begin, end)`
- 理解：**iterator categories**（input、output、forward、bidirectional、random-access、contiguous），以及它们为什么存在
- 掌握：常见 **algorithms** —— `sort`、`find`、`min_element`、`max_element`、`reverse`、`accumulate`、`transform`、`for_each`、`copy`
- 掌握：**iterator adapters** —— `back_inserter`、`front_inserter`、`inserter`、`istream_iterator`、`ostream_iterator`、reverse iterator
- 理解：作为算法实参的 **function objects**（普通函数、函数指针、lambda）
- 了解：**C++20 ranges** 作为传 `begin/end` 这一对的更高层替代

### 1.2 I/O 流（chapters 28.1–28.3）

- 理解：**流（stream）** 就是一段可以顺序读或写的字节序列
- 掌握：类层次 —— `ios`、`istream`、`ostream`、`iostream`，以及预定义的 `cin`/`cout`/`cerr`/`clog`
- 掌握：输入用的 **提取运算符（`>>`）**、输出用的 **插入运算符（`<<`）**，包括跳过空白的行为
- 掌握：输入技巧 —— `setw()` 限制读取长度、`get()` / `getline()`（成员和自由函数两种）、`gcount()`、`peek()`、`unget()`、`putback()`、`ignore()`
- 掌握：输出格式化 —— 通过 **flags**（`setf`/`unsetf`）和 **manipulators**（`std::hex`、`std::fixed`、`std::setprecision`、`std::setw`、`std::setfill`、`std::left`/`std::right`）
- 区分：属于 **format groups** 的 flag（一组之内同一时刻只能有一个生效）

### 1.3 串联：Iterator 把一切串起来

- STL 的最大思想：**算法操作的是 iterator range，不是 container。** 一旦容器提供一对 iterator，`<algorithm>` 里的每个算法都能在它上面工作。
- Stream iterator 把 `cin`/`cout`/`ifstream`/`ofstream` 也变成了 iterator range —— 同一套算法因此可以同时跑在文件和键盘上。

---

## 2. C++ 标准库

> 对应 LearnCpp 21.1

### 2.1 什么是标准库？

**C++ 标准库** 是一组模板化类的集合，提供了可复用的 **container、algorithm 和 iterator**。绝大多数典型程序里需要的东西 —— 循环、字符串、数组、排序、查找 —— 都可以用它的组件搭出来，不必从头实现。

**为什么要用它：**

- 代码已经写好、调过、效率也基本过得去
- 它是 **标准化的**：同一个 `std::vector` 在不同编译器和平台上行为完全一致
- 它消除了一整类手写非类容器版本里常见的 bug

**为什么有人怕它：**

- 体量大，而且全是模板，错误信息很吓人
- 最好按小块学 —— 用到什么学什么，剩下的先放一边

> 💡 **核心洞察（LearnCpp 21.1）**
> 标准库 **不是** C++ 语言的扩展 —— 它住在 `std` 命名空间里。从 C++ 的视角看，你和 `std::vector` 是 **平等的**：只要遵循约定，任何人都能写出一个让算法可以操作的容器。这就是 STL **对用户可扩展** 的本质原因。

### 2.2 STL：标准库的一个子集

**STL**（Standard Template Library，标准模板库）这个名字有时被当作 "标准库" 的同义词，但从历史上看，STL 特指那套 **container/iterator/algorithm 框架**，主要由 **Alexander Stepanov** 设计。标准库的其他部分 —— `<iostream>`、`<chrono>`、`<filesystem>`、`<regex>` 等 —— 严格来说不属于 STL。

在本课中,"STL" 几乎总是指 container/iterator/algorithm 这一部分。

---

## 3. STL 框架 — 总体概念

> 对应 Topic 8 PPT slides 1–2

### 3.1 三大支柱

Klefstad 的幻灯片把设计哲学讲得很简洁：

> STL 是 **一个用来定义可组合库组件的框架**：
> - **containers** —— 装东西（stack、list、map 等等）
> - **iterators** —— 把每个算法连到每个容器上
> - **algorithms** —— 做事情（min、sort 等等）

想象一张 M×N 的表格：

- M 行 = M 种算法
- N 列 = N 种容器
- 没有 iterator 的话，每个格子都要写一份实现 → 总共 **M × N** 份
- 有了 iterator，每个算法只用 iterator **写一次**，每个容器也只暴露一次 iterator → 总共只剩 **M + N** 份

这就是为什么 STL 能 scale。

### 3.2 配套组件

还有两块拼图把这个框架补完：

- **Function objects（函数对象）** —— 任何可调用的东西，都可以作为参数传给算法。这包括普通函数、函数指针、像函数指针一样行为的类（带 `operator()` 的 `struct`），以及 lambda（Week 7）。它们让算法 **灵活**，不必为每种调用方式写上千个重载。
- **Standard exceptions（标准异常）** —— 用于 STL 的错误处理（Week 7 已经讲过）。它们给 STL 操作提供了一套统一的报错方式（`std::out_of_range`、`std::bad_alloc` 等）。

### 3.3 扩展 STL

STL **对遵守约定的用户是可扩展的**：

- 写一个暴露 `begin()` / `end()` 的容器，再写一个带相应运算符的 iterator 类 → 所有 STL 算法立即对你的容器有效。
- 写一个签名符合算法预期的 function object → 它就能被传给任何接受可调用对象的算法。

你已经在 HW6 里练过这个思想（`Picture` 链表配一个 iterator 风格的自定义遍历）。

---

## 4. 容器：分类总览

> 对应 LearnCpp 21.2 + Topic 8 PPT slide 3

### 4.1 三大容器家族

| 家族 | 它做什么 | 例子 |
|---|---|---|
| **Sequence containers** | 保留 **插入顺序**；元素往哪儿放由你决定 | `vector`、`deque`、`array`、`list`、`forward_list`、`string` |
| **Associative containers** | 插入时自动 **排序**（或哈希）；你不能决定顺序 | `set`、`multiset`、`map`、`multimap`、`unordered_*` 各版本 |
| **Container adapters** | 包装一个已有的 sequence container,暴露一套 **受限** 的接口（LIFO/FIFO/优先级） | `stack`、`queue`、`priority_queue` |

### 4.2 Klefstad 的实现策略区分（PPT slide 3）

> Klefstad 重点强调容器背后的两种 **实现策略**：
> - **基于数组的（Array-based）** —— 连续内存,随机访问快（HW1 `Stack`、HW4 `String`）
> - **基于链式结构的（Linked-structure-based）** —— 节点 + 指针，中间插入快（HW5 `String`、HW6 `Picture`）

这件事很重要：挑容器时，底层数据结构决定了每个操作的 **复杂度**。`vector` 和 `list` 都装一串元素，但 `vector[i]` 是 O(1)，而 `list[i]` 根本不存在（只能一个节点一个节点走 —— O(n)）。

### 4.3 与 Python 的对比

| | Python | C++ STL |
|---|---|---|
| "List" | `list`（动态数组） | `std::vector`（最贴近）或 `std::list`（链表，**不一样**） |
| "Dict" | `dict`（哈希表） | `std::unordered_map`（哈希）或 `std::map`（平衡 BST，**有序**） |
| "Set" | `set`（哈希表） | `std::unordered_set`（哈希）或 `std::set`（平衡 BST，**有序**） |
| 保留插入顺序 | 3.7 起 `dict` 是 | 只有 sequence container 保留；associative container 是排序的，不是按插入顺序的 |
| 元素类型可以混 | 可以 | 不行 —— 一个容器只能装一种特定类型的元素 |

> ⚠️ **陷阱**
> Python 的 `list` 对应 C++ 的 `std::vector`，**不是** C++ 的 `std::list`。名字误导人 —— C++ `std::list` 是双向链表，没有随机访问的 `[]`。

---

## 5. 序列容器（Sequence Containers）

> 对应 LearnCpp 21.2（sequence containers 部分）+ Topic 8 PPT slide 6

Sequence container 都会保留 **你插入的顺序**。它们之间怎么挑，看你需要哪些操作快、哪些可以慢。

### 5.1 `std::vector`

一个 **动态可变大小的数组**，存在连续内存里。现代 C++ 里使用最多的容器。

**典型特征：**

- 连续内存布局（所以 `&v[0]` 指向一段真正的 C 风格数组）
- **随机访问** O(1)，通过 `operator[]` 和 `at()`
- **尾部追加/弹出** O(1) 摊销：`push_back()`、`pop_back()`、`back()`
- 中间插入或删除是 O(n)（后面所有元素都要往前/后挪）
- 满了会自动扩容（通常容量翻倍）

**LearnCpp 21.2 示例：**

```cpp
#include <vector>
#include <iostream>

int main()
{
    std::vector<int> vect;
    for (int count=0; count < 6; ++count)
        vect.push_back(10 - count);   // insert at end

    for (int index=0; index < vect.size(); ++index)
        std::cout << vect[index] << ' ';
    std::cout << '\n';
}
// Output: 10 9 8 7 6 5
```

**Klefstad PPT slide 6（明确强调 O(1)）：**

```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v;   // or vector<int> v2(100, 0);  with 100 elements init to zero
    for (int i = 0; i < 100; ++i)  // fill v
        v.push_back(i);            // appends to end of v
    for (int i = 0; i < v.size(); ++i)   // print v
        cout << v[i] << endl;
    for (; v.size() > 0; v.pop_back())   // drain v from the back
        cout << v.back() << endl;
}
```

> 💡 **PPT 备注** —— "元素存在动态数组里 —— 像 Python list"
> - `push_back()`、`pop_back()`、`back()` 都是 O(1)
> - `v[i]` 也很快（随机访问）

**值得记的构造函数：**

```cpp
std::vector<int> v1;                  // empty
std::vector<int> v2(100);             // 100 default-initialized ints (= 0)
std::vector<int> v3(100, 7);          // 100 copies of 7
std::vector<int> v4{1, 2, 3, 4};      // initializer-list: exactly these 4 elements
std::vector<int> v5(v1.begin(), v1.end()); // copy from a range
```

> ⚠️ **容易搞混** —— `std::vector<int> v(100)` 造的是一个 **100 个 0** 的 vector，而 `std::vector<int> v{100}` 造的是一个 **只有一个元素、值为 100** 的 vector。花括号 initializer-list 构造函数能匹配上时总是胜出。

#### 5.1.1 `size` vs `capacity`（cppreference）

vector 跟踪 **两个不同的量**：

| 量 | 含义 | 成员 |
|---|---|---|
| **size** | 当前 vector 里 *实际有* 多少元素 | `v.size()` |
| **capacity** | 当前已分配的存储空间 *不重新分配* 能放下多少元素 | `v.capacity()` |

永远 `size <= capacity`。这个差距是因为增长是 **摊销 O(1)**：vector 容量用尽时，会分配一块更大的缓冲区（通常翻倍），把已有元素拷贝/移动过去，然后释放旧缓冲区。重分配开销大，所以 vector 会多分配一些 —— 提前留出余地，让后续 `push_back` 几乎是免费的。

> 💡 **cppreference 原文（意译）** —— "vector 通常会比静态数组占更多空间，因为为了应付后续增长会多分配一些内存。这样一来，vector 不需要每次插入元素都重分配，只在那块多分配的内存用完时才重分配。"

两个与性能相关的成员函数：

```cpp
v.reserve(1000);     // bumps capacity to ≥ 1000 without changing size
                     // — use when you know roughly how many push_backs are coming
v.shrink_to_fit();   // requests that capacity shrink to size
                     // — non-binding; implementation may ignore it
```

> ⚠️ **最佳实践** —— 如果你知道（或能估算出）最终大小，在 `push_back` 的大循环前先用 `reserve()`。这能消掉 **所有** 重分配，以及连带的 iterator/指针失效。

#### 5.1.2 复杂度小结（cppreference）

| 操作 | 复杂度 |
|---|---|
| 随机访问（`v[i]`、`v.at(i)`） | O(1) |
| 尾部插入/删除（`push_back`、`pop_back`） | 摊销 O(1) |
| 中间插入/删除（`insert`、`erase`） | O(n) —— 离 vector 尾部的距离 |

#### 5.1.3 成员函数地图（cppreference）

| 类别 | 函数 |
|---|---|
| **元素访问** | `at(i)`（带边界检查，会抛异常）、`operator[](i)`（不检查，最快）、`front()`、`back()`、`data()`（裸指针） |
| **Iterators** | `begin`/`end`、`cbegin`/`cend`、`rbegin`/`rend`、`crbegin`/`crend` |
| **容量** | `empty`、`size`、`max_size`、`reserve`、`capacity`、`shrink_to_fit` |
| **修改器（尾部）** | `push_back`、`emplace_back`（C++11）、`pop_back` |
| **修改器（任意位置）** | `insert`、`emplace`（C++11）、`erase`、`clear`、`resize`、`swap`、`assign` |

> 💡 **`at()` vs `operator[]`** —— 都是用下标访问 vector。区别是：`v.at(i)` 在 `i` 非法时抛 `std::out_of_range`；`v[i]` 在 `i` 非法时是 **未定义行为**。无法保证下标合法时用 `at()`；性能敏感的内循环里用 `[]`。

> 💡 **`push_back` vs `emplace_back`** —— `push_back(x)` 接收一个已经构造好的对象，把它 *拷贝*（或移动）进容器。`emplace_back(args...)` 把参数转发给元素的构造函数，**就地构造**，不产生临时对象。对于 `int` 这种平凡可拷贝类型没有区别。对于昂贵类型（`std::string` 或你自己写的类），`emplace_back` 能省一次移动。

#### 5.1.4 Iterator 失效（cppreference —— 关键知识）

这是关于 `std::vector` 最重要的一张表，必须背下来。**对 vector 的修改可能让指向它的 iterator（以及指针/引用）失效** —— 失效之后再用就是未定义行为。

| 操作 | 让什么失效 |
|---|---|
| 所有只读操作 | 什么都不失效 |
| `swap`、`std::swap` | 只让 `end()` 失效 |
| `clear`、`operator=`、`assign` | **永远 —— 所有 iterator** |
| `reserve`、`shrink_to_fit` | 容量变了 → 全部。没变 → 无。 |
| `erase` | 被删除的元素以及 **它后面的所有元素**（包括 `end()`） |
| `push_back`、`emplace_back` | 容量增长了 → 全部。没增长 → 只让 `end()` 失效。 |
| `insert`、`emplace` | 容量增长了 → 全部。没增长 → 只让插入点及其之后的失效。 |
| `resize` | 容量增长了 → 全部。没增长 → 只让 `end()` 和被删除的位置失效。 |
| `pop_back` | 被删除的那个元素和 `end()`。 |

> ⚠️ **经典 bug**
> ```cpp
> for (auto it = v.begin(); it != v.end(); ++it)
>     if (*it == bad)
>         v.erase(it);    // ⚠️ it is invalidated after erase!
> ```
> 修法是用 **erase-return 惯用法**：`it = v.erase(it);`（而且在那次循环里别再 `++it`）。或者直接用 C++20 的 `std::erase` / `std::erase_if`。

#### 5.1.5 `vector<bool>` 特化（cppreference）

> ⚠️ **标准库为 `bool` 提供了 `std::vector` 的特化版本，可能针对空间效率做了优化。** 这 *并不是* 一个真正的 `vector<bool>` —— 它打包成位，`v[i]` 返回的是一个 **代理对象**，不是真正的 `bool&`。许多在 `vector<int>` 上能跑的东西在 `vector<bool>` 上编不过（你拿不到指向元素的 `bool*`,某些泛型算法也用不了）。

如果你需要一段行为像普通 vector 的布尔序列，用 `std::vector<char>` 或 `std::deque<bool>`。需要 bitset 的话，`std::bitset<N>`（固定大小）或者 `std::vector<bool>`（动态）都可以 —— 只要清楚你拿到的是什么就行。

#### 5.1.6 cppreference 示例

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector<int> v = {8, 4, 5, 9};
    v.push_back(6);
    v.push_back(9);
    v[2] = -1;              // overwrite element at position 2

    for (int n : v)
        std::cout << n << ' ';
    std::cout << '\n';
}
// Output: 8 4 -1 9 6 9
```


### 5.2 `std::deque`（双端队列，发音 "deck"）

一种类似动态数组的容器，但 **两端** 都支持快速 push/pop。

**典型特征：**

- 前端和后端的 push/pop 都是 O(1)
- 通过 `operator[]` 的随机访问也是 O(1)，但比 `vector` 慢（它的存储通常是一串固定大小的块，不是一整段连续内存）
- 中间插入/删除是 O(n)

```cpp
#include <iostream>
#include <deque>

int main()
{
    std::deque<int> deq;
    for (int count=0; count < 3; ++count)
    {
        deq.push_back(count);       // insert at back
        deq.push_front(10 - count); // insert at front
    }

    for (int index=0; index < deq.size(); ++index)
        std::cout << deq[index] << ' ';
    std::cout << '\n';
}
// Output: 8 9 10 0 1 2
```

### 5.3 `std::list`（双向链表）与 `std::forward_list`（单向链表）

`std::list` 是 **双向链表**，每个节点保存 `prev`、`next` 和元素值。`std::forward_list` 是 C++11 引入的单向变体（只有 `next`，更省内存，只能往前走）。

**典型特征：**

- **没有随机访问** —— 没有 `operator[]`、没有 `at()`。要访问第 *i* 个元素必须 walk the list（O(n)）。
- 在 **任意位置** 插入或删除是 O(1)，**前提是手里已有一个指向那个位置的 iterator**
- 其他地方插入/删除后，iterator 仍然有效（vector 的 iterator 不能这么保证）

> LearnCpp 21.2: "List 只提供对头和尾的访问 —— 不提供随机访问。如果你想找中间某个值，必须从一端开始 'walk the list' 直到找到目标元素。"

`list` 适合那种 *经常在中间插入/删除、不需要随机访问* 的场景。

### 5.4 `std::array`（C++11，简单的 C 数组包装）

**固定大小** 的数组,大小是类型的一部分。本质上是 C 风格数组的一个更安全、与 STL 兼容的替代品。

```cpp
std::array<int, 5> a{1, 2, 3, 4, 5};  // size 5 is part of the type
```

**典型特征：**

- 大小在编译期就已知，不动态分配
- 随机访问 O(1)
- 有 STL iterator（`begin()`、`end()`），所以能跟 `std::sort`、`std::find` 等配合
- 不能变大或变小

### 5.5 `std::string` 作为 sequence container

虽然 LearnCpp 提到 `string` *一般* 不被归到 sequence container 里，但 **它本质上就是一种 sequence container**：行为像一个 `vector<char>`，外加一些字符串专属的辅助函数（`+`、`substr`、`find` 等）。它暴露同样的 iterator 接口，所以 STL 算法在字符串上原封不动就能跑。

```cpp
std::string s = "world";
std::reverse(s.begin(), s.end());  // s == "dlrow"
```

---

## 6. 关联容器（Associative Containers）

> 对应 LearnCpp 21.2（associative containers 部分）+ Topic 8 PPT slides 7–10

关联容器在插入时 **自动排序**（或哈希）。位置不由你决定 —— 容器决定。

**默认比较**：`operator<`。你也可以传一个自定义比较器。

### 6.1 `std::set` 与 `std::multiset`

**`set`** —— 一个按值排序的 **唯一** 元素集合。
**`multiset`** —— 同上，但允许重复。

**操作及复杂度**（平衡 BST 版本都是 O(log n)）：

- `insert(x)` —— 加入 x；`set` 上若已存在则什么都不做
- `find(x)` —— 返回指向 x 的 iterator，找不到返回 `end()`
- `erase(x)` 或 `erase(iter)` —— 删除
- 遍历会按 **排序顺序** 输出元素

**Klefstad PPT slide 8 示例：**

```cpp
#include <iostream>
#include <set>
using namespace std;

int main() {
    set<char> S;
    for (char c = 'A'; c <= 'Z'; ++c)   // fill S
        S.insert(c);
    for (char c = 'Z'; c >= 'A'; --c)   // fill S again
        S.insert(c);                    // duplicates are silently rejected
    for (auto E : S)
        cout << E << endl;              // each letter appears exactly once

    if (S.find('A') != S.end())
        cout << "A is in there" << endl;
}
```

如果把 `S` 换成 `multiset`，因为每个字母都被插了两次，你会看到 `A A B B C C ... Z Z`。

> 💡 **概念提醒**
> `std::set` **不是** Python 的 set。Python 的 `set` 是哈希表（无序，O(1) 查找）。C++ 的 `std::set` 是 **平衡二叉搜索树**（有序，O(log n) 查找）。哈希版本叫 `std::unordered_set`。

#### 6.1.1 实现与唯一性规则（cppreference）

> 💡 **cppreference（意译）** —— `std::set` 是 *一组按类型 Key 排序的、唯一的对象*。查找、删除、插入都是 **对数时间**。Set **通常实现为红黑树** —— 一种自平衡的二叉搜索树。

**唯一性是按等价（equivalence）定义的，不是相等（equality）：**

当满足下式时，两个元素 `a` 与 `b` 被认为 "相同"（set 里只留一份）：

```
!comp(a, b) && !comp(b, a)
```

通俗讲：在比较函数下，谁都不严格 *小于* 谁。默认 `comp` 是 `std::less<Key>`，它用的就是 `operator<`。

> ⚠️ **微妙的推论** —— `std::set` *永远不调用* `operator==`。它只调用 `operator<`。所以一个 `<` 行为怪、`==` 行为正常的类型，可能在 set 里出现意外的 "重复" 或 "不重复"。

> ⚠️ **通过 iterator 访问的元素是 `const` 的。** 对 `set<Key>` 的 iterator 解引用得到的是 `const Key&`，不是 `Key&`。你 **不能** 原地修改元素 —— 改了可能破坏排序不变量、悄悄地把树搞坏。要 "改" 一个元素就：`erase` 旧的，再 `insert` 新的。（这就是为什么 `std::map` 的 `value_type` 是 `pair<const Key, T>` —— *key* 部分是 const，也是同一个不变量的要求。）

#### 6.1.2 成员函数地图（cppreference）

| 类别 | 函数 |
|---|---|
| **Iterators** | `begin`/`end`、`cbegin`/`cend`、`rbegin`/`rend`、`crbegin`/`crend` |
| **容量** | `empty`、`size`、`max_size` |
| **修改器** | `clear`、`insert`、`emplace`（C++11）、`emplace_hint`（C++11）、`erase`、`swap`、`extract`（C++17）、`merge`（C++17） |
| **查找** | `count`、`find`、`contains`（C++20）、`equal_range`、`lower_bound`、`upper_bound` |
| **Observers** | `key_comp`、`value_comp`（返回比较函数本身） |

> 💡 **`contains`（C++20）** 是现代版本里检查成员关系的惯用写法：
> ```cpp
> if (s.contains(x))  { /* ... */ }   // C++20
> if (s.find(x) != s.end()) { /* ... */ }   // pre-C++20 equivalent
> ```

> 💡 **`set` 上的 `count` 只会返回 0 或 1**（因为 key 唯一）。在 `multiset` 上可能更大。无论哪种情况，用 `count(x) > 0` 检查成员关系都不如 `contains(x)` 高效 —— 后者在第一次匹配上就可以短路。

#### 6.1.3 范围查询 —— `lower_bound`、`upper_bound`、`equal_range`

这三个函数在 *已排序* 的 set 上返回 iterator，适合做范围查询：

| 函数 | 返回的 iterator 指向…… |
|---|---|
| `s.lower_bound(k)` | 第一个 **不小于** `k` 的元素（即 ≥ k） |
| `s.upper_bound(k)` | 第一个 **严格大于** `k` 的元素（即 > k） |
| `s.equal_range(k)` | 一个 `pair<iterator, iterator>`，等价于 `{lower_bound(k), upper_bound(k)}` |

在 `multiset` `[1, 2, 2, 2, 3]` 中：
- `lower_bound(2)` → 指向第一个 `2` 的 iterator
- `upper_bound(2)` → 指向 `3` 的 iterator
- 在这两者之间遍历，会访问到所有的 `2`。

#### 6.1.4 cppreference 示例

```cpp
#include <iostream>
#include <set>
#include <string_view>

int main() {
    std::set<int> set{1, 5, 3};
    // set: { 1, 3, 5 }  — automatically sorted on construction

    set.insert(2);
    // set: { 1, 2, 3, 5 }

    set.erase(1);
    // set: { 2, 3, 5 }

    // C++20 contains
    if (set.contains(3))
        std::cout << "set contains 3\n";

    // Range-constructor from any iterable
    std::string_view word = "element";
    std::set<char> characters(word.begin(), word.end());
    // characters: { e, l, m, n, t }   — 5 unique characters
}
```

> 💡 **Range 构造惯用法** —— 每个 STL 容器都接受一对 `(begin, end)` iterator，所以你可以用 `string` 造 `set<char>`、用 `vector<int>` 造 `set<int>`，等等。

### 6.2 `std::map` 与 `std::multimap`

**`map`** —— 一组 **键/值对**，按 key 排序，key **唯一**。
**`multimap`** —— 同上，但允许同一个 key 对应多个 value。

每个元素是 `std::pair<const Key, Value>`，通过 `.first`（key）和 `.second`（value）访问。

> **Klefstad PPT slide 9** —— "元素是 `pair<first, second>`，可看作 `pair<key, value>` —— 行为像数组，但可以用任意类型当下标（像 Python 字典）。元素按 `first` 排序（不按 `second`）。"

**Multimap 当作真正的字典：** 现实世界中的字典是一个单词（key）对应一个或多个释义（value）—— 这恰好是 `multimap`，不是 `map`。

**LearnCpp 21.3 示例：**

```cpp
#include <map>
#include <string>
#include <iostream>

int main() {
    std::map<int, std::string> mymap;
    mymap.insert(std::make_pair(4, "apple"));
    mymap.insert(std::make_pair(2, "orange"));
    mymap.insert(std::make_pair(1, "banana"));
    mymap.insert(std::make_pair(3, "grapes"));
    mymap.insert(std::make_pair(6, "mango"));
    mymap.insert(std::make_pair(5, "peach"));

    auto it{ mymap.cbegin() };
    while (it != mymap.cend()) {
        std::cout << it->first << '=' << it->second << ' ';
        ++it;
    }
    std::cout << '\n';
}
// Output: 1=banana 2=orange 3=grapes 4=apple 5=peach 6=mango
```

**Klefstad PPT slide 10 —— 三种遍历方式：**

```cpp
#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> A;
    A["Bill"]   = 33;
    A["George"] = 29;
    A["Al"]     = 27;

    // Way 1: classic for-each, E is a pair<string,int>
    for (auto E : A)
        cout << E.first << " is " << E.second << " ";

    // Way 2: C++17 "destructuring for loop" — by const reference (no copy)
    for (const auto& [name, age] : A)
        cout << name << " is " << age << " ";

    // Both print: Al is 27 Bill is 33 George is 29
}
```

> 💡 **核心洞察** —— `map` 按 **first** 字段排序，所以遍历时 key 按升序输出：`Al`、`Bill`、`George`。

**`map` 的中括号运算符：**

```cpp
A["Bill"] = 33;   // insert or overwrite key "Bill" with value 33
int x = A["Al"];  // read the value at key "Al"
```

> ⚠️ **陷阱** —— 在不存在的 key 上 `A["NewKey"]` 会 **插入** 一个 默认构造值（`int` 是 0，`string` 是 `""`）的新条目，并返回它的引用。要 *只判断是否存在、不插入*，用 `A.find(key) != A.end()` 或（C++20）`A.contains(key)`。

#### 6.2.1 实现与排序顺序（cppreference）

> 💡 **cppreference（意译）** —— `std::map` 是 *一个有序的关联容器，存放唯一 key 的 key-value 对*。查找、删除、插入都是 **对数时间**。Map **通常实现为红黑树**。

Iterator 会按 **key 升序** 访问元素（用比较函数 —— 默认是 `std::less<Key>`）。

唯一性规则跟 `set` 一样基于 **等价**：key `a` 与 `b` 在 `!comp(a, b) && !comp(b, a)` 时被认为相同。

#### 6.2.2 `value_type = std::pair<const Key, T>`（cppreference）

一个微妙但关键的细节：`map<Key, T>` 的每个元素是

```
std::pair<const Key, T>
```

—— 注意 `Key` 上的 `const`。你不能在元素插入之后原地改 key（改了会破坏排序顺序）。要 "改" key,只能 `erase` 旧条目再 `insert` 新的。

你会见到的三个类型别名：

| 别名 | 类型 |
|---|---|
| `key_type` | `Key` |
| `mapped_type` | `T` |
| `value_type` | `std::pair<const Key, T>` |

#### 6.2.3 元素访问：`at()` vs `operator[]`

| 操作 | key 存在时的行为 | key 不存在时的行为 |
|---|---|---|
| `m.at(k)` | 返回 value 的引用 | **抛 `std::out_of_range`** |
| `m[k]` | 返回 value 的引用 | **插入** `{k, T{}}` 并返回新 value 的引用 |

> ⚠️ **三个含义：**
> - 你 **不能** 在 `const map` 上用 `operator[]` —— 它可能会插入！
> - 你 **不能** 在 `T` 没有默认构造函数时用 `operator[]`。
> - `m[k]` 即使你写成 `int x = m[k];` 也是一次 *写* —— 它会创建一条新条目。要做只读访问，用 `m.find(k)`、`m.contains(k)`（C++20）或 `m.at(k)`。

#### 6.2.4 成员函数地图（cppreference）

| 类别 | 函数 |
|---|---|
| **元素访问** | `at(k)`（会抛）、`operator[](k)`（缺失时插入） |
| **Iterators** | `begin`/`end`、`cbegin`/`cend`、`rbegin`/`rend`、`crbegin`/`crend` |
| **容量** | `empty`、`size`、`max_size` |
| **修改器** | `clear`、`insert`、`insert_or_assign`（C++17）、`emplace`（C++11）、`emplace_hint`、`try_emplace`（C++17）、`erase`、`swap`、`extract`（C++17）、`merge`（C++17） |
| **查找** | `count`、`find`、`contains`（C++20）、`equal_range`、`lower_bound`、`upper_bound` |
| **Observers** | `key_comp`、`value_comp` |

**值得记的三种 insert 变体（C++17）：**

| 方法 | key 已存在时 | key 缺失时 |
|---|---|---|
| `insert({k, v})` | 什么都不做（返回 iterator + `false`） | 插入 |
| `insert_or_assign(k, v)` | **覆盖** value | 插入 |
| `try_emplace(k, args...)` | 什么都不做（返回 iterator + `false`）;**甚至不会构造 value** | 就地构造 value |

> 💡 **为什么需要 `try_emplace`？** 假设 `T` 构造起来很贵（比如要靠函数调用造一个大 `std::string`）。`insert({k, expensive_construct()})` 总是会构造 value，即使 `k` 已存在、然后又把它丢掉。`try_emplace(k, args_for_construct...)` 只在需要时才构造。

**`emplace_hint(hint, args...)` —— 跳过 O(log n) 的搜索：**

`insert` 和 `emplace` 通常会做一次 O(log n) 的树搜索来定位新元素该放哪里。`emplace_hint` 让你传一个 iterator 来告诉它 *"从这里开始找"*：

```cpp
std::map<int, std::string> m;
auto it = m.end();
for (int i = 0; i < 1000; ++i)
    it = m.emplace_hint(it, i, "v");   // 摊还 O(1) 一次，而不是 O(log n)
```

- 如果 hint 指向 *紧挨着* 新元素应该放的位置，插入会是 **摊还 O(1)** 而不是 O(log n)。
- 如果 hint 给错了，实现会退回到普通的 O(log n) 搜索 —— 所以乱给的 hint 没额外代价，但也帮不上忙。
- 经典用法：**批量插入已经排好序的数据**（上面的写法，或者键单调递增时反复传 `m.end()`）。`set` / `multiset` / `multimap` 上也有同样的技巧。

#### 6.2.5 cppreference 示例

```cpp
#include <iostream>
#include <map>
#include <string>

void print_map(std::string_view label, const std::map<std::string, int>& m) {
    std::cout << label;
    for (const auto& [key, value] : m)        // C++17 structured binding
        std::cout << '[' << key << "] = " << value << "; ";
    std::cout << '\n';
}

int main() {
    // List-initialization with brace-pair entries
    std::map<std::string, int> m{{"CPU", 10}, {"GPU", 15}, {"RAM", 20}};
    print_map("1) Initial:  ", m);
    // 1) Initial:  [CPU] = 10; [GPU] = 15; [RAM] = 20;

    m["CPU"] = 25;   // update existing
    m["SSD"] = 30;   // insert new
    print_map("2) Updated:  ", m);
    // 2) Updated:  [CPU] = 25; [GPU] = 15; [RAM] = 20; [SSD] = 30;

    // ⚠️ operator[] on a NON-EXISTENT key inserts default value (0 for int)
    std::cout << "3) m[UPS] = " << m["UPS"] << '\n';
    // 3) m[UPS] = 0
    // m now contains UPS=0 even though we only "read" it!

    m.erase("GPU");
    print_map("4) After erase: ", m);

    // C++20: erase_if free function
    std::erase_if(m, [](const auto& pair){ return pair.second > 25; });
    print_map("5) After erase_if (>25): ", m);

    std::cout << "size = " << m.size() << '\n';
    m.clear();
    std::cout << std::boolalpha << "empty? " << m.empty() << '\n';
}
```

> 💡 **List-initialization 语法** —— `{{"CPU", 10}, {"GPU", 15}}` 是两个 brace-init-list，每个构造一个 `pair<string, int>`，最外层再包成一个 `initializer_list<pair>` 传给 map 的构造函数。你会一直看到这个写法。

#### 6.2.6 迭代器失效（set / multiset / map / multimap）

有序关联容器底层是树，所以失效规则比 `vector` **友好得多** —— 这是它们在实践中最大的优势之一。

| 操作 | 谁会失效 |
|---|---|
| `insert` / `emplace` / `emplace_hint` | **没有任何失效。** 所有现存的 iterator、指针、引用都依然有效。 |
| `erase(it)` | **只有被删元素的那个 iterator 失效。** 其他所有 iterator、指针、引用都还有效。 |
| `erase(key)` | 同上，只有指向被删元素的 iterator 失效。 |
| `clear()` | 所有 iterator（容器变空）。 |
| `swap(other)` | end iterator 可能失效；其他 iterator 都保持有效（按 cppreference 说法，它们 "跟着" 元素移动到新容器）。 |
| 容器析构 / 重新赋值 | 所有 iterator。 |

> 💡 **和 `vector` 对比** —— `vector::insert` 可能让插入点之后的 **所有** iterator 失效（reallocation 时则全部失效）。set/map 这边即使在 iteration 过程中插入，已经持有的 iterator 也还是安全的。

**iteration 中安全 erase 的写法**（因为 erase 只会让 *被删的* iterator 失效，你必须接住返回值）：

```cpp
for (auto it = m.begin(); it != m.end(); ) {
    if (should_remove(*it))
        it = m.erase(it);     // erase 返回指向 **下一个** 元素的 iterator
    else
        ++it;
}
```

或者 C++20 直接用：`std::erase_if(m, predicate)` 帮你做（参见 §6.2.5 的示例）。

### 6.3 `std::unordered_set` 与 `std::unordered_map`

C++11 加入的 **哈希表** 版本。

- 平均 O(1) 的 `insert`、`find`、`erase`（有序版本是 O(log n)）
- 元素 **没有** 任何有意义的顺序
- 不需要排序遍历、追求速度时用这一组

### 6.4 速查对比表

| 容器 | 排序 | key 唯一 | 查找 |
|---|---|---|---|
| `set` | 已排序 | 是 | O(log n) |
| `multiset` | 已排序 | 允许重复 | O(log n) |
| `unordered_set` | 哈希（无序） | 是 | 平均 O(1) |
| `map` | 按 key 排序 | 是 | O(log n) |
| `multimap` | 按 key 排序 | 允许重复 | O(log n) |
| `unordered_map` | 哈希（无序） | 是 | 平均 O(1) |

---

## 7. 容器适配器（Container Adapters）

> 对应 LearnCpp 21.2（container adapters 部分）+ Topic 8 PPT slide 23

容器适配器是 **包在已有 sequence container 外面的壳**；它对外暴露一套 **受限** 的接口，对应到某个特定的抽象数据类型。底层用哪个容器你可以自己选（也有合理的默认值）。

### 7.1 `std::stack` —— LIFO

**栈** 是 后进先出（Last-In, First-Out）的容器。

```cpp
#include <stack>
std::stack<int> s;
s.push(1);
s.push(2);
s.push(3);
int top = s.top();   // 3
s.pop();             // removes 3
```

**Klefstad PPT slide 23 —— 对底层容器的要求：**

> 可以用任何支持 `empty`、`size`、`back`、`push_back`、`pop_back` 的容器。
> 兼容的底层：`vector`、`deque`、`list`。**默认：`deque`。**

> 💡 **PPT 备注** —— "默认是 `deque`（看上去有点奇怪，毕竟 vector 似乎更自然）。" 这是历史/效率上的选择 —— `deque` 避开了 `vector::push_back` 在容量超出时周期性重分配的开销。

### 7.2 `std::queue` —— FIFO

**队列** 是先进先出（First-In, First-Out）：尾部插入,头部删除。

```cpp
#include <queue>
std::queue<int> q;
q.push(1);
q.push(2);
int front = q.front();   // 1
q.pop();                 // removes 1
```

**对底层容器的要求**：支持 `empty`、`size`、`front`、`back`、`push_back`、`pop_front`。
兼容的底层：`deque`、`list`。**默认：`deque`。**

> ⚠️ **`queue` 为什么不用 `vector`？** 因为 `vector` 没有 `pop_front` —— 从前面删元素得 O(n)。

### 7.3 `std::priority_queue` —— 有序队列

队列里的元素被维护成有序的（默认按 `operator<`）。pop 始终返回 **优先级最高** 的那一个。

```cpp
#include <queue>
std::priority_queue<int> pq;
pq.push(3); pq.push(1); pq.push(7); pq.push(4);
int big = pq.top();   // 7
pq.pop();
```

**兼容的底层**：`vector`、`deque`。**默认：`vector`。**

它内部用 **二叉堆（binary heap）** 实现，所以：

- `push` —— O(log n)
- `pop` —— O(log n)
- `top` —— O(1)

---

## 8. 把任务匹配到容器（Klefstad 练习）

> 对应 Topic 8 PPT slide 5（练习）

Klefstad 的幻灯片提了一个小练习：给每项任务挑出合适的 STL 容器家族（`Set`、`Map`、`Vector`）。下面是一种合理的匹配方案 + 理由 —— 这就是这门课希望你能快速做出的取舍：

| # | 任务 | 最合适的容器 | 理由 |
|---|---|---|---|
| 1 | 通讯录/地址簿（每个人 → 他/她的资料） | **Map**（`map<Name, Address>`） | 用唯一 key 索引，value 是结构化数据 |
| 2 | 一串 HW 分数 | **Vector** | 顺序重要（HW1、HW2 ...）;经常追加 |
| 3 | 学生名册（唯一姓名,没别的数据） | **Set** | 只关心成员关系，必须唯一 |
| 4 | 停用词（一组固定的、要忽略的词） | **Set** | `find()` 快,无重复,没 value 要附加 |
| 5 | 统计词频 | **Map**（`map<string, int>`） | word → count |
| 6 | 一个 char 字符串 | **Vector**（或 `string`） | 连续存储,按位置索引 |
| 7 | 小于 1000 的素数 | **Vector**（如果以 `find` 为主则 **Set**） | 要遍历的话 vector 在 cache 上胜出；要测成员关系的话 set 胜出 |

> ⚠️ **通用经验法则**
> - 主要做 *遍历*、*追加* 或 *按位置索引* —— 用 **Vector**
> - 按 *key 查找* 并要关联一个 *value* —— 用 **Map**
> - 只关心 *成员关系*（或要排序的唯一元素）—— 用 **Set**
> - 不需要排序遍历的话,用 **Unordered\_** 版本

---

## 9. STL Iterators

> 对应 LearnCpp 21.3 + Topic 8 PPT slides 11–13

### 9.1 什么是 Iterator？

**Iterator** 是一个不暴露容器实现细节、就能在容器上遍历的对象。可以把它想成 **智能指针**，它知道在自己所在的数据结构里 "如何走到下一个元素"。

为什么 iterator 重要 —— 引 LearnCpp 21.3、加上课程相关的强调：

> 在很多类（特别是 list 和 associative class）里，iterator 是访问元素的 **主要方式**。

你不能在 `std::list` 上写 `myList[5]`。但你可以在指向 list 的 iterator 上写 `*it`。同样的表达式对 vector iterator、set iterator、map iterator 也都成立。

> 💡 **核心洞察**
> Iterator 最好被想象成 **指向容器里某个元素的指针**，它重载了若干运算符，看上去像指针算术，实际上做的是 *对那个容器来说合适的遍历*。

### 9.2 Iterator 的运算（五大件）

来自 Topic 8 PPT slide 12 + LearnCpp 21.3：

| 运算符 | 含义 |
|---|---|
| `*it` | **解引用** —— 返回 iterator 所指的元素 |
| `it->member` | 成员选择 —— 等价于 `(*it).member`。访问 map 里 `pair` 的成员（`it->first`、`it->second`）时很常用 |
| `++it` | **前进** 到下一个元素 |
| `--it` | 后退到上一个元素（仅 bidirectional 及以上 iterator 支持） |
| `it1 == it2` / `it1 != it2` | 比较两个 iterator 的 **位置**（不是值！）是否相同 |
| `it = other` | **赋值** —— 让 iterator 指向新位置 |

> ⚠️ **微妙但关键** —— `==` 比较两个 iterator 时检查的是 **它们是否指向同一个位置**，不是元素值是否相等。要比较值，先解引用：`*it1 == *it2`。

### 9.3 `begin()`、`end()`、`cbegin()`、`cend()`

每个容器都暴露四个基本的成员函数用来拿 iterator：

| 函数 | 返回 |
|---|---|
| `c.begin()` | 指向 **第一个** 元素的 iterator |
| `c.end()`   | 指向 **最后一个元素之后一个位置** 的 iterator（"哨兵"） |
| `c.cbegin()`| 指向第一个元素的 **const** iterator（只读） |
| `c.cend()`  | 指向最后一个元素之后一个位置的 **const** iterator |

> 💡 **核心洞察 —— 半开区间 `[begin, end)`**
> `end()` **不** 指向最后一个元素;它指向最后一个元素之后一个位置。这是故意的：
> ```cpp
> for (auto it = c.begin(); it != c.end(); ++it) { ... }
> ```
> 当终止条件是 `it != end()` 时,循环写起来最干净。如果 `end()` 指最后一个元素，你就得用 `<=`（iterator 通常不支持），还要为空容器做特判。

### 9.4 不同容器上的遍历

LearnCpp 21.3 的四个示例展示了 iterator 接口的 **统一性**：

**Vector：**

```cpp
#include <iostream>
#include <vector>

int main() {
    std::vector<int> vect;
    for (int count = 0; count < 6; ++count)
        vect.push_back(count);

    std::vector<int>::const_iterator it;
    it = vect.cbegin();
    while (it != vect.cend()) {
        std::cout << *it << ' ';
        ++it;
    }
    std::cout << '\n';
}
// 0 1 2 3 4 5
```

**List** —— *循环写法一模一样，只是容器换了：*

```cpp
#include <list>
std::list<int> li;
for (int count = 0; count < 6; ++count)
    li.push_back(count);

std::list<int>::const_iterator it;
it = li.cbegin();
while (it != li.cend()) {
    std::cout << *it << ' ';
    ++it;
}
// 0 1 2 3 4 5
```

> 💡 **这就是 iterator 的全部意义** —— "注意代码跟 vector 那个几乎完全一样,虽然 vector 和 list 的内部实现几乎完全不同！"（LearnCpp 21.3）

**Set** —— 还是同样的循环，但 **输出是有序的**，因为 set 在插入时就排好序：

```cpp
#include <set>
std::set<int> myset;
myset.insert(7); myset.insert(2); myset.insert(-6);
myset.insert(8); myset.insert(1); myset.insert(-4);

auto it = myset.cbegin();
while (it != myset.cend()) {
    std::cout << *it << ' ';
    ++it;
}
// -6 -4 1 2 7 8   (sorted!)
```

**Map** —— 一个小拐弯：每个 `*it` 是一个 `std::pair`，所以用 `it->first` 和 `it->second`：

```cpp
std::map<int, std::string> mymap;
mymap.insert(std::make_pair(4, "apple"));
// ...etc

auto it{ mymap.cbegin() };
while (it != mymap.cend()) {
    std::cout << it->first << '=' << it->second << ' ';
    ++it;
}
// 1=banana 2=orange 3=grapes 4=apple 5=peach 6=mango
```

### 9.5 范围 for 循环（现代惯用法）

上面四个循环都可以用范围 `for` 重写,它本质上 **底层就是 iterator 驱动** 的：

```cpp
for (auto e : V)           // copy each element
    std::cout << e;

for (const auto& E : V)    // reference (no copy) to each element
    std::cout << E;
```

Topic 8 PPT slide 12：
- `auto e : V` —— `e` 是每个元素的 **拷贝**
- `auto const& E : V` —— `E` 是 **const 引用**（无拷贝，不能改）
- `auto& E : V` —— 非 const 引用（可以改）

> ⚠️ **最佳实践** —— 元素类型不平凡时（string、struct 等），优先用 `const auto&`，避免不知不觉地把整个容器的每个元素都拷一遍。

### 9.6 自定义 Iterator：链表 iterator（PPT slide 13）

Klefstad 走了一遍链表上 iterator 的样子。这是写自己的 iterator 时的 **概念蓝图**（如果 HW7+ 涉及让自己的容器可遍历，会用到）。

PPT 的设定：

```cpp
struct Node { char data; Node * next; };

struct List {
    Node *head;
    struct iterator { /* see below */ };
    iterator begin();
    iterator end();
    // ...
};
```

**三种等价的遍历写法：**

```cpp
List L;

// 1. Manual pointer walk (no STL)
for (Node *p = L.head; p != nullptr; p = p->next)
    std::cout << p->data;

// 2. STL iterator style
for (List::iterator it = L.begin(); it != L.end(); ++it)
    std::cout << (*it).data;

// 3. Range-based for (requires begin/end + iterator operators)
for (auto e : L)
    std::cout << e;
```

**iterator 类本身** 持有一个 node 指针，并重载相应的运算符：

```cpp
struct List::iterator {
    Node * ptr;
    auto operator*()  -> char&  { return ptr->data; }
    auto operator->() -> Node*  { return ptr; }
    auto operator++() -> iterator& { ptr = ptr->next; return *this; }
    bool operator==(const iterator& other) const { return ptr == other.ptr; }
    bool operator!=(const iterator& other) const { return ptr != other.ptr; }
};
```

`List::begin()` 返回 `iterator{head}`；`List::end()` 返回 `iterator{nullptr}`。

> 💡 **核心洞察**
> Iterator 是 **每个类自己写的** —— 每个容器都得写自己的 iterator，因为 iterator 必须懂这个数据结构怎么遍历。STL 的精妙之处在于 **algorithm 不必懂这件事**；algorithm 只看到 iterator 接口。

---

## 10. Iterator 分类

> 对应 Topic 8 PPT slide 21

STL iterator 是一组 **按能力分级的层次**。每一类支持的操作严格包含前一类。algorithm 声明自己需要的 **最低** iterator 等级，这就决定了它能在哪些容器上用。

| 类别 | 能力 | 例子容器 |
|---|---|---|
| **Input iterator** | 只读一次,只前进（`*it`、`++it`）;只能 single-pass | `istream_iterator` |
| **Output iterator** | 只写一次,只前进；single-pass | `ostream_iterator`、`back_inserter` |
| **Forward iterator** | input + output，可前向多次 pass | `forward_list` |
| **Bidirectional iterator** | forward + `--it` | `list`、`set`、`multiset`、`map`、`multimap` |
| **Random-access iterator** | bidirectional + `it + n`、`it[n]`、`it1 - it2`、`<`/`>` 排序比较 | `vector`、`deque`、`string` |
| **Contiguous iterator**（C++17） | random-access + **逻辑相邻 = 物理相邻** | `array`、`string`、`vector` |

> 💡 **PPT 备注（slide 21）** —— "在现代架构的 cache 上表现很好。" Contiguous iterator 正是 `vector` 在实践中常常比 `list` 快得多的根本原因，哪怕复杂度分析说它们应该一样：cache 预取让连续遍历几乎是零开销的。

> ⚠️ **实战含义**
> - `std::sort` 要求 **random-access iterator** → 能跑在 `vector`、`deque`、`array`、`string` 上,但 **不能** 跑在 `list` 或 `set` 上。`std::list` 自带一个成员 `.sort()`。
> - `std::binary_search` 要求 **forward iterator**（且范围已排序）
> - 只需要 walk 一遍的算法（`std::find`、`std::accumulate`、`std::copy`）用 **input iterator** 就够 —— 所以它们也能跑在流上

---

## 11. STL Algorithms

> 对应 LearnCpp 21.4 + Topic 8 PPT slides 14–15

### 11.1 总览

> 💡 **大思路（LearnCpp 21.4）**
> Algorithm 实现为 **基于 iterator 工作的函数**。每个 algorithm **只写一次**,就对所有提供匹配 iterator 的容器都有效 —— 包括你自己写的容器。这就是 STL 可组合的关键。

要用任何 STL algorithm，`#include <algorithm>`。数值算法（`std::accumulate`、`std::iota`）住在 `<numeric>` 里。

> ⚠️ **警告（LearnCpp 21.4）** —— 某些 algorithm 与 container 的组合可能根本不工作、可能死循环、或者效率极差。最典型的几个：
> - 对 `std::list` 调 `std::sort` 是 **编译错误**（list 的 iterator 不是 random-access）
> - 但 `list.sort()`（成员函数）存在且高效
> - 别传非法 iterator 对（`end` 在 `begin` 前面）—— 未定义行为

### 11.2 查找与 Min/Max

**`min_element` / `max_element` / `iota`（PPT slide 15 + LearnCpp 21.4）：**

```cpp
#include <algorithm>   // min_element, max_element
#include <iostream>
#include <list>
#include <numeric>     // iota

int main() {
    std::list<int> li(6);
    std::iota(li.begin(), li.end(), 0);   // fills with 0,1,2,3,4,5

    std::cout << *std::min_element(li.begin(), li.end()) << ' '
              << *std::max_element(li.begin(), li.end()) << '\n';
    return 0;
}
// Output: 0 5
```

> 💡 **`iota` 做什么**
> `iota(begin, end, start)` 把一个范围填成从 `start` 开始的连续值：`start, start+1, start+2, ...`。名字来自希腊字母 ι（APL 里用同一个符号做同样的操作）。

**`find`（LearnCpp 21.4 + PPT slide 15）：**

```cpp
std::list<int> li(6);
std::iota(li.begin(), li.end(), 0);
auto it = std::find(li.begin(), li.end(), 3);   // returns iterator to 3
li.insert(it, 8);                               // insert 8 just before 3
for (int i : li) std::cout << i << ' ';
// Output: 0 1 2 8 3 4 5
```

> ⚠️ **关键惯用法 —— 检查 find 的返回值：**
> 找不到时,`find` 返回 `end` iterator。解引用之前一定要先判：
> ```cpp
> if (it == li.end()) { std::cout << "not found\n"; }
> else                { /* safe to use *it or it */ }
> ```

### 11.3 排序与反转

```cpp
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> vect{ 7, -3, 6, 2, -5, 0, 4 };

    std::sort(vect.begin(), vect.end());
    // vect: -5 -3 0 2 4 6 7

    std::reverse(vect.begin(), vect.end());
    // vect: 7 6 4 2 0 -3 -5
}
```

**用比较器做反序排序：**

```cpp
#include <functional>
std::sort(vect.begin(), vect.end(), std::greater<int>{});
// Or with a lambda:
std::sort(vect.begin(), vect.end(), [](int a, int b){ return a > b; });
```

> ⚠️ **Klefstad 的警告** —— `std::sort` 在 `std::list` 上 **不能用**。list iterator 是 bidirectional,不是 random-access。用 `myList.sort()`（成员函数）来代替 —— 它在渐进意义上对 list 也更快，因为它可以重排链接而不必移动元素。

### 11.4 中间反转、accumulate、transform（PPT slide 15）

Topic 8 PPT slide 15 展示了一个比 LearnCpp 21.4 更丰富的 algorithm demo。值得记下来：

```cpp
#include <algorithm>
#include <numeric>
#include <vector>
#include <iostream>
using namespace std;

int main() {
    vector<int> V{2, 5, 4, 1, 6, 3};

    auto pos = min_element(V.begin(), V.end());
    cout << "Min = " << *pos << endl;        // returns iterator to V[3] (= 1)

    sort(V.begin(), V.end());                // V is {1, 2, 3, 4, 5, 6}

    pos = find(V.begin(), V.end(), 3);       // iterator to V[2]
    reverse(pos, V.end());                   // V is {1, 2, 6, 5, 4, 3}

    cout << "Total = " << accumulate(V.begin(), V.end(), 0) << endl;
    // prints Total = 21

    transform(V.begin(), V.end(), V.begin(),
              [](int i){ return i + 1; });
    // V is now {2, 3, 7, 6, 5, 4}
}
```

**这里出场了三个新算法：**

- **`accumulate(first, last, init)`** —— 把范围里的元素以 `init` 起始累加（在 `<numeric>` 里）。初值的类型决定了结果类型：`accumulate(v.begin(), v.end(), 0)` 返回 `int`；想要 `double` 就传 `0.0`。
- **`reverse(first, last)`** —— 原地反转范围；传中间的 iterator 即可只反转 **子范围**。
- **`transform(in_begin, in_end, out_begin, fn)`** —— 把 `fn` 应用到输入范围的每个元素上,结果写到 `out_begin` 开始的位置。当 `out_begin == in_begin` 时变成原地变换。

### 11.5 其他常见算法（参考）

| 算法 | 用途 |
|---|---|
| `for_each(b, e, fn)` | 对 `[b, e)` 里的每个元素调用 `fn(x)` |
| `count(b, e, val)` | 返回 `val` 出现了多少次 |
| `count_if(b, e, pred)` | 统计满足谓词的元素数 |
| `copy(b, e, dest)` | 把范围拷到 `dest` 里 |
| `unique(b, e)` | 删掉相邻重复元素（要彻底去重得先排序） |
| `unique_copy(b, e, dest)` | 拷范围,跳过相邻重复元素 |
| `remove(b, e, val)` | "删除" `val`（实际是搬移；容器大小不变 —— 见 §11.7 erase-remove 惯用法） |
| `binary_search(b, e, val)` | 在已排序范围里返回 `val` 是否存在 |
| `lower_bound(b, e, val)` | 指向第一个 ≥ val 的 iterator |
| `upper_bound(b, e, val)` | 指向第一个 > val 的 iterator |

### 11.6 谓词算法 — `all_of` / `any_of` / `none_of`（C++11）

这三个返回 `bool` —— 用谓词扫一遍范围,回答 "全部?有一个吗?都没有?":

```cpp
#include <algorithm>
#include <vector>

std::vector<int> v{2, 4, 6, 8};

bool all_even  = std::all_of (v.begin(), v.end(), [](int x){ return x % 2 == 0; });   // true
bool any_neg   = std::any_of (v.begin(), v.end(), [](int x){ return x  <  0; });      // false
bool none_zero = std::none_of(v.begin(), v.end(), [](int x){ return x ==  0; });      // true
```

| 算法 | 语义 | 空范围时 |
|---|---|---|
| `all_of(b, e, p)` | 全部满足 `p`? | `true`（空集对所有谓词成立 —— *vacuous truth*） |
| `any_of(b, e, p)` | 至少一个满足? | `false` |
| `none_of(b, e, p)` | 没有一个满足? | `true` |

> 💡 **短路求值** —— 都在第一个反例（`all_of` / `none_of`）或第一个命中（`any_of`）时停止,不会扫完范围。

### 11.7 Erase-Remove 惯用法

§11.5 提了 `remove(b, e, val)` 不真删 —— 它只是**把不等于 `val` 的元素往前移**,然后返回一个 iterator 指向 "新的逻辑末尾"。容器大小不变,后面那段是 "残留":

```cpp
std::vector<int> v{1, 2, 3, 2, 4, 2, 5};
auto new_end = std::remove(v.begin(), v.end(), 2);
// v 现在是 {1, 3, 4, 5, ?, ?, ?}      ← 后三个是 unspecified
// new_end 指向第 5 个位置（? 开始那里）
// v.size() 还是 7 — 没删!
```

**Erase-remove 惯用法** —— 用 `erase(new_end, v.end())` 把残留段切掉:

```cpp
v.erase(std::remove(v.begin(), v.end(), 2), v.end());
// 现在 v 是 {1, 3, 4, 5},size() == 4
```

带谓词的版本 —— `remove_if`:

```cpp
v.erase(std::remove_if(v.begin(), v.end(),
                       [](int x){ return x % 2 == 0; }),
        v.end());
// 移除所有偶数
```

**C++20 的现代写法** —— `std::erase` / `std::erase_if` 是上面这套的内置版本,一行搞定:

```cpp
std::erase(v, 2);                                  // ≡ erase-remove(v, 2)
std::erase_if(v, [](int x){ return x % 2 == 0; }); // ≡ erase-remove_if
```

> ⚠️ **`std::list` 不要用这套** —— `list` 有自己的成员函数 `myList.remove(val)` 和 `myList.remove_if(pred)`,真删而且 O(n) —— 别套 `erase-remove`（对链表没必要,链表删除是 O(1) 节点重连）。

| 容器 | 推荐删除惯用法 |
|---|---|
| `vector` / `deque` / `string` | `c.erase(std::remove[_if](...), c.end())` 或 C++20 `std::erase[_if]` |
| `list` / `forward_list` | `c.remove(val)` / `c.remove_if(pred)`（成员函数） |
| `set` / `map`（关联） | `c.erase(val)`（直接删 key）或 `c.erase(it)`（按位置） |

### 11.8 容器比较 —— `equal` / `mismatch` / `lexicographical_compare`

```cpp
std::vector<int> a{1, 2, 3, 4};
std::vector<int> b{1, 2, 3, 4};
std::vector<int> c{1, 2, 9, 4};

bool eq = std::equal(a.begin(), a.end(), b.begin());   // true（元素逐个 ==）

auto [ita, itb] = std::mismatch(a.begin(), a.end(), c.begin());
// ita -> a[2] (= 3), itb -> c[2] (= 9) — 第一处不同
```

| 算法 | 含义 |
|---|---|
| `equal(b1, e1, b2)` | 两序列**元素逐个相等**?（C++14+ 推荐用四参重载 `equal(b1, e1, b2, e2)`,先比长度） |
| `mismatch(b1, e1, b2)` | 找第一处不同,返回两个 iterator 组成的 pair |
| `lexicographical_compare(b1, e1, b2, e2)` | 字典序 `<`（像 `string` 的 `<` 那样） |

> 💡 **直接用容器的 `==`** —— 对相同类型的两个标准容器,`a == b` 已经做了 size 检查 + 逐元素比较,通常更简洁。`std::equal` 用在**类型不同但内容应该等价**的场景（比如 `vector<int>` 和 `int[]`,或者比 `vector<int>` 的子区段）。

### 11.9 排序范围上的集合算法

> ⚠️ **前提:两个输入范围都必须是已排序的!** 跟 `binary_search`、`lower_bound` 一样。这些算法**不是**给 `std::set` 用的,而是给任意排序范围（包括 `vector`、`MapArray::keys()`、`std::set`）用的。

```cpp
#include <algorithm>
#include <vector>
#include <iterator>

std::vector<int> a{1, 2, 3, 4, 5};
std::vector<int> b{3, 4, 5, 6, 7};

std::vector<int> out;
std::set_union       (a.begin(), a.end(), b.begin(), b.end(),
                      std::back_inserter(out));   // {1,2,3,4,5,6,7}

out.clear();
std::set_intersection(a.begin(), a.end(), b.begin(), b.end(),
                      std::back_inserter(out));   // {3,4,5}

out.clear();
std::set_difference  (a.begin(), a.end(), b.begin(), b.end(),
                      std::back_inserter(out));   // {1,2}   （在 a 但不在 b）
```

| 算法 | 输出 |
|---|---|
| `set_union(a, b, out)` | `a ∪ b`（并集） |
| `set_intersection(a, b, out)` | `a ∩ b`（交集） |
| `set_difference(a, b, out)` | `a \ b`（差集） |
| `set_symmetric_difference(a, b, out)` | `(a∪b)\(a∩b)`（对称差） |
| `includes(a_first, a_last, b_first, b_last)` | 返回 `bool` —— `b ⊆ a`? |

> 💡 **跨周链接:HW9 的 `MapArray`** —— 它内部是排序的 `vector<pair<K,V>>`,所以这些算法直接能用 —— 只要你的比较器只看 `pair::first` 就行。Week 9 §14 见。

### 11.10 堆算法 —— `<algorithm>`

`<algorithm>` 直接提供操作**任意 random-access 范围**的堆操作 —— 这正是 `std::priority_queue`（§7.3）内部用的东西,但你也可以拿来在自己的 `vector` 上手动维护堆:

```cpp
#include <algorithm>
#include <vector>

std::vector<int> v{3, 1, 4, 1, 5, 9, 2, 6};

std::make_heap(v.begin(), v.end());          // 重排成 max-heap, v.front() 是最大
// v: 9 6 4 3 5 1 2 1   （具体顺序由实现决定,但根永远是最大）

std::cout << v.front() << '\n';              // 9 — 堆顶

v.push_back(10);                             // 先 push_back
std::push_heap(v.begin(), v.end());          // 然后让新元素 sift-up

std::pop_heap(v.begin(), v.end());           // 把堆顶搬到末尾,然后修复堆
int top = v.back();
v.pop_back();                                // 真删

std::sort_heap(v.begin(), v.end());          // 把堆变成有序范围（O(n log n)）
```

| 算法 | 用途 | 前置条件 |
|---|---|---|
| `make_heap(b, e)` | 把范围重排成 max-heap | —— |
| `push_heap(b, e)` | 让 `*(e-1)` sift-up | `[b, e-1)` 已经是堆 |
| `pop_heap(b, e)` | 把 `*b` 换到 `*(e-1)`,然后修 `[b, e-1)` | `[b, e)` 是堆 |
| `sort_heap(b, e)` | 反复 `pop_heap` 直到有序 | `[b, e)` 是堆 |
| `is_heap(b, e)` | 是堆? | —— |
| `is_heap_until(b, e)` | 返回最长堆前缀的末尾 | —— |

默认是 **max-heap**（用 `<`）,想 min-heap 传 `std::greater<>{}`:

```cpp
std::make_heap(v.begin(), v.end(), std::greater<>{});
```

> 💡 **vs. `priority_queue`** —— 适配器 `priority_queue`（§7.3）就是用 `make_heap`/`push_heap`/`pop_heap` 实现的,只是把 `vector` + 这些函数封装起来。**直接用这些函数的好处**:你能同时访问范围内所有元素（适配器只能看 `top()`）,还能用 `sort_heap` 一键把堆转成排好序的范围。

### 11.11 `<numeric>` 数值算法全家桶

§11.2 已经见过 `iota`,§11.4 见过 `accumulate`。`<numeric>` 里还有几个常用的:

```cpp
#include <numeric>
#include <vector>
#include <functional>

std::vector<int> v{1, 2, 3, 4, 5};

// 1. iota — 填充连续递增值（§11.2）
std::iota(v.begin(), v.end(), 0);                                   // {0, 1, 2, 3, 4}

// 2. accumulate — 累加（§11.4）,也能用自定义二元运算
int sum  = std::accumulate(v.begin(), v.end(), 0);                  // 0+0+1+2+3+4 = 10
int prod = std::accumulate(v.begin(), v.end(), 1, std::multiplies<>{}); // 1*0*1*2*3*4 = 0

// 3. inner_product — 两个范围的点积
std::vector<int> a{1, 2, 3}, b{4, 5, 6};
int dot = std::inner_product(a.begin(), a.end(), b.begin(), 0);     // 1*4+2*5+3*6 = 32

// 4. partial_sum — 前缀和
std::vector<int> ps(v.size());
std::partial_sum(v.begin(), v.end(), ps.begin());                   // {0, 1, 3, 6, 10}

// 5. adjacent_difference — 相邻差（partial_sum 的反向）
std::vector<int> diff(v.size());
std::adjacent_difference(v.begin(), v.end(), diff.begin());         // {0, 1, 1, 1, 1}
```

| 算法 | 用途 |
|---|---|
| `accumulate(b, e, init[, op])` | 用 `op` 折叠范围（默认 `+`）—— **顺序保证从左到右** |
| `inner_product(b1, e1, b2, init[, op1, op2])` | 默认是点积 `Σ a[i]*b[i]` |
| `partial_sum(b, e, out[, op])` | 前缀累计写到 `out` |
| `adjacent_difference(b, e, out[, op])` | `out[i] = b[i] - b[i-1]`,`out[0] = b[0]` |
| `iota(b, e, start)` | 填 `start, start+1, ...` |

**C++17 并行友好版**（只是认识一下）:

| 算法 | 与传统版区别 |
|---|---|
| `reduce(b, e, init[, op])` | 像 `accumulate` 但**不保证顺序** —— 编译器可以并行折叠,要求 `op` 满足结合律 |
| `transform_reduce(b1, e1, b2, init, op1, op2)` | `inner_product` 的并行版 |
| `inclusive_scan` / `exclusive_scan` | `partial_sum` 的并行版 |

> ⚠️ **`accumulate` 初值类型决定结果类型** —— `accumulate(v.begin(), v.end(), 0)` 即使 `v` 是 `vector<double>` 也会全部截断成 `int`。要 `double` 结果就传 `0.0`。

---

## 12. Iterator Adapters

> 对应 Topic 8 PPT slides 16–18、22

**Iterator adapter** 是一种 iterator，它把别的东西（一种容器插入操作、一个流，或一个前向 iterator）包起来，对外暴露 iterator 接口 —— 这样被包的东西就能用在任何期望 iterator 的地方。

### 12.1 Insert Iterators —— `back_inserter`、`front_inserter`、`inserter`

普通 iterator 会覆盖元素。**Insert iterator** 在每次赋值时调用容器的 `push_back`、`push_front` 或 `insert`,从而 *把容器撑大*。

没有 insert iterator 的话，`copy` 会写到空目标 **后面**（未定义行为）。有了它，目标会自动扩大。

**PPT slide 16 —— 完整示例：**

```cpp
int main() {
    list<int> L;
    for (int i = 1; i <= 10; ++i)
        L.push_back(i);

    // back_inserter: each assignment calls V.push_back(...)
    vector<int> V;
    copy(L.begin(), L.end(),     // source
         back_inserter(V));       // destination

    // front_inserter: each assignment calls D.push_front(...)
    deque<int> D;
    copy(L.begin(), L.end(),
         front_inserter(D));

    // inserter: each assignment calls S.insert(hint, ...)
    // inserter works on associative containers too
    set<int> S;
    copy(begin(L), end(L),
         inserter(S, std::next(begin(S))));
}
```

| Adapter | 调用 | 适用于 |
|---|---|---|
| `back_inserter(c)` | `c.push_back(x)` | 带 `push_back` 的容器（`vector`、`deque`、`list`、`string`） |
| `front_inserter(c)` | `c.push_front(x)` | 带 `push_front` 的容器（`deque`、`list`） |
| `inserter(c, pos)` | `c.insert(pos, x)` | 任何带 `insert` 的容器，包括关联容器 |

> ⚠️ **陷阱** —— `set` 或 `map` 没有 `back_inserter`，因为关联容器自己决定位置。用 `inserter(s, s.end())`，或者干脆 `s.insert(x)`。

### 12.2 Stream Iterators —— `istream_iterator` 与 `ostream_iterator`

Stream iterator 把 `cin`、`cout`、`ifstream`、`ofstream` 变成一个 STL iterator range。这就是让你能直接从文件 `copy` 到容器，或者从输入 `transform` 到输出的关键。

**PPT slide 17 —— 从 cin 读所有单词到 vector,排序,打印去重后的单词：**

```cpp
#include <iostream>
#include <iterator>
#include <algorithm>
#include <vector>
#include <string>
using namespace std;

int main() {
    vector<string> V;
    copy(istream_iterator<string>(cin),   // start of source
         istream_iterator<string>(),       // end of source: default-ctor = EOF
         back_inserter(V));                // destination

    sort(begin(V), end(V));

    unique_copy(begin(V), end(V),
                ostream_iterator<string>(cout, "\n"));   // delimiter "\n" between writes
}
```

**关键惯用法：**

- `istream_iterator<T>(stream)` —— 通过 `>>` 从 `stream` 读 `T` 类型的值
- `istream_iterator<T>()`（默认构造）—— 代表 **流尾**（EOF）
- `ostream_iterator<T>(stream, "delim")` —— 通过 `<<` 输出，然后在每个值后再写一次 `"delim"`

**PPT slide 18 —— 同样思路,但读写文件：**

```cpp
#include <iostream>
#include <fstream>
#include <iterator>

int main() {
    ifstream in {"input.data"};
    ofstream out{"output.data"};

    vector<string> V;
    copy(istream_iterator<string>(in),
         istream_iterator<string>(),
         back_inserter(V));

    sort(V.begin(), V.end());

    unique_copy(V.begin(), V.end(),
                ostream_iterator<string>(out, "\n"));
}
```

> 💡 **Klefstad 的教学点**
> 同一组算法（`copy`、`sort`、`unique_copy`）根本不在乎它们的 iterator 来自 `cin`/`cout`、`ifstream`/`ofstream` 还是 `vector`。**这就是 STL 设计的全部回报。**

**PPT slides 19–20 的小活动：**

把整数从 `cin` 填到一个 vector 里：

```cpp
int main() {
    vector<int> V;
    copy(istream_iterator<int>(cin), istream_iterator<int>(),
         back_inserter(V));
}
```

把 vector 里的整数一行一个写到 `"out.txt"`：

```cpp
int main() {
    vector<int> V = {0, 2, 4, 6, 8, 10};
    ofstream out{"out.txt"};
    copy(V.begin(), V.end(),
         ostream_iterator<int>(out, "\n"));
}
```

### 12.3 Reverse Iterators（PPT slide 22）

**Reverse iterator** 把 `++` 和 `--` 的含义互换了：自增其实是 *沿容器往后走*。每个容器都提供 `rbegin()` 和 `rend()`。

```cpp
int main() {
    vector<int> V;
    for (int i = 1; i <= 10; ++i)
        V.push_back(i);

    // Print 10 9 8 ... 1
    copy(V.rbegin(), V.rend(),
         ostream_iterator<int>(cout, " "));
}
```

| 方法 | 返回 | 方向 |
|---|---|---|
| `begin()` | 指向第一个元素的 iterator | 正向 |
| `end()` | 指向最后一个元素之后一个位置的 iterator | 正向 |
| `rbegin()` | 指向最后一个元素的 reverse iterator | 反向 |
| `rend()` | 指向第一个元素之前一个位置的 reverse iterator | 反向 |

> ⚠️ **概念陷阱** —— `rbegin()` 指 **最后一个** 元素（反向遍历的起点），并不是 `end() - 1`。它是 *另一种* iterator。要拿到底层的正向 iterator,调 `.base()`。

---

## 13. 算法中的函数对象（Function Objects）

> 对应 Topic 8 PPT slide 24

任何需要"可调用对象"的 STL algorithm —— `for_each`、`transform`、`sort`、`find_if` 等等 —— 都能接受 **任意** 一种：

- 自由函数（传名字时会退化为函数指针）
- 显式传一个函数指针
- 带 `operator()` 的类（**functor**）
- lambda（Week 7）

algorithm 不在乎是哪一种，它只是调 `fn(x)` 或 `fn(a, b)`。这就是 **function object** 抽象。

**PPT slide 24 —— 两个例子：**

```cpp
#include <iostream>
#include <list>
#include <algorithm>
using namespace std;

void print(int i) {
    cout << i << ' ';
}

int main() {
    list<int> L;
    for (int i = 1; i <= 5; ++i)
        L.push_back(i);

    // print all ints in the list
    for_each(begin(L), end(L), print);   // 'print' is passed as a function pointer
}
```

```cpp
int square(int i) {
    return i * i;
}

int main() {
    list<int> L1, L2;
    for (int i = 1; i <= 9; ++i)
        L1.push_back(i);

    // put squares of L1 into L2
    transform(begin(L1), end(L1),
              back_inserter(L2), square);
}
```

**同样的例子换成 lambda（现代 C++ 里更地道）：**

```cpp
for_each(begin(L), end(L), [](int i){ cout << i << ' '; });

transform(begin(L1), end(L1), back_inserter(L2),
          [](int i){ return i * i; });
```

> 💡 **function object 为什么重要**
> 没有可调用参数的话,algorithm 就得有海量重载。`sort(v.begin(), v.end())` 用 `<`；`sort(v.begin(), v.end(), greater<int>{})` 用 `>`；`sort(v.begin(), v.end(), [](X a, X b){ return a.name < b.name; })` 用任意自定义规则。同一个 algorithm,不同 **策略** —— 由调用方挑。

---

## 14. Ranges（C++20）

> 对应 Topic 8 PPT slide 25

到目前为止的所有例子里，我们都在传一对 iterator：`sort(v.begin(), v.end())`。这写起来啰嗦，而且容易出错 —— 传错 begin/end 就是 UB。

**C++20 ranges** 让你直接传一个 **range**（通常就是容器本身）：

```cpp
// Range-based for loop (works since C++11)
for (auto e : v)
    cout << e;

// Algorithm calls (the new C++20 way)
sort(v.begin(), v.end());   // old: still works
sort(v);                    // C++20 ranges: uses v's range = v.begin()..v.end()
```

C++20 的 `<ranges>` 库定义了 `std::ranges::sort`、`std::ranges::find` 等等，它们都接受 range。除了方便,ranges 还启用了 **views** —— 惰性、可组合的变换：

```cpp
auto evens_squared = v
                   | std::views::filter([](int x){ return x % 2 == 0; })
                   | std::views::transform([](int x){ return x * x; });
```

> 💡 **PPT 指路**
> 更多内容看 [`https://en.cppreference.com/w/cpp/ranges`](https://en.cppreference.com/w/cpp/ranges)。在 ICS 45C 里，你基本上只要知道 ranges **存在**、它们能直接接受容器即可；经典的两 iterator 写法仍然到处都是、也完全正确。

---

## 15. I/O 流 — iostream 库

> 对应 LearnCpp 28.1

### 15.1 为什么 I/O 在库里（而不是语言里）

I/O 功能 **不是** C++ 核心语言的一部分。它由标准库提供,住在 `std` 命名空间里。这也是为什么每个程序都要 `#include <iostream>` 才能用 `cin`/`cout`。

`#include <iostream>` 之后，你会得到一组 I/O 的 **类层次**。值得注意的是，这套层次用了 **多继承**（Week 7 / Week 6 提过不建议）—— 但库本身被精心设计和测试过，回避了多继承的典型坑，所以你用起来不用担心。

### 15.2 什么是流（Stream）？

> 💡 **核心洞察（LearnCpp 28.1）**
> **流** 就是一段可以顺序访问的字节序列。随着时间推移，一个流可能生产或消费任意多的数据。

两种口味：

- **输入流** 来自生产者（键盘、文件、网络）。你按下一个键，那个字节就进入输入流，停在那里等程序去取。
- **输出流** 通向消费者（显示器、文件、打印机）。你写入时,数据先在输出流里,等消费者准备好再消费。

有些设备（文件、网络）同时是生产者和消费者。

> 💡 **回报** —— 你一旦学会流操作，同一套操作就对键盘、文件、网络套接字、字符串缓冲区都成立。差异被操作系统藏起来了。

### 15.3 类层次

你应该能叫得出名字的几个关键类：

| 类 | 用途 |
|---|---|
| `std::ios`（= `std::basic_ios<char>`） | 公共基类 —— 持有输入流和输出流共享的 flag |
| `std::istream` | 输入流 —— 用 **`>>`**（提取） |
| `std::ostream` | 输出流 —— 用 **`<<`**（插入） |
| `std::iostream` | 双向 —— 既输入也输出 |

一张简化图：

```
            ios
           /   \
     istream   ostream
           \   /
          iostream
```

（没错，这是多继承 —— 那个让人头大的菱形。但还是那句话，库本身处理得很好。）

### 15.4 标准流

C++ 自带四个预连接的 **标准流对象**，可以直接拿来用：

| 对象 | 类 | 连接到 | 缓冲 |
|---|---|---|---|
| `std::cin`  | `istream` | 标准输入  （键盘） | 有缓冲 |
| `std::cout` | `ostream` | 标准输出  （显示器）  | 有缓冲 |
| `std::cerr` | `ostream` | 标准错误  （显示器）  | **无缓冲** —— 立即出现 |
| `std::clog` | `ostream` | 标准错误  （显示器）  | 有缓冲 |

> 💡 **`cerr` vs. `clog`** —— 两个都走标准错误，但 `cerr` 无缓冲（适合那种程序崩溃前必须看到的消息），`clog` 有缓冲（适合那种以批量效率为重的诊断日志）。实践中 `clog` 很少见。

> 💡 **缓冲是什么**
> 有缓冲的输出会先把字节攒在内存里，攒一批再一次性写（更快）。无缓冲的输出每个字节都立刻写（更慢，但你能立刻看到结果 —— 而且程序在缓冲区写完前崩溃时也不会丢东西）。

---

## 16. 用 istream 做输入

> 对应 LearnCpp 28.2

### 16.1 提取运算符 `>>`

提取运算符（`>>`）从输入流读一个值。C++ 对所有基本类型内置了 `>>`。你也可以为自己的类重载 `>>`。

```cpp
int n;
std::cin >> n;            // read an int

double d;
std::cin >> d;            // read a double

char c;
std::cin >> c;            // read a single non-whitespace char

std::string s;
std::cin >> s;            // read a non-whitespace word
```

### 16.2 用 C 风格字符串时的缓冲区溢出

```cpp
char buf[10] {};
std::cin >> buf;          // ⚠ user could enter 18 characters → buffer overflow → UB
```

> ⚠️ **最佳实践（LearnCpp 28.2）**
> 一般来说，对用户会输入多少个字符做 **任何** 假设都是糟糕的。

**修法：`setw()`** 在 `<iomanip>` 里,可以限制读入字符数：

```cpp
#include <iomanip>
char buf[10] {};
std::cin >> std::setw(10) >> buf;   // reads at most 9 chars (room for '\0' terminator)
```

### 16.3 提取会跳过空白

> **提醒（LearnCpp 28.2）** —— 提取运算符 **跳过空白**（空格、tab、换行）。

```cpp
int main() {
    char ch{};
    while (std::cin >> ch)
        std::cout << ch;
}
// Input:  Hello my name is Alex
// Output: HellomynameisAlex      ← all spaces and newlines eaten
```

要保留空白，用 `get()`。

### 16.4 `get()`

`std::cin.get(ch)` 读 **一个字符**，包括空白。

```cpp
char ch{};
while (std::cin.get(ch))
    std::cout << ch;
// Input:  Hello my name is Alex
// Output: Hello my name is Alex   ← spaces preserved
```

还有一个字符串缓冲区重载：`cin.get(buf, n)` 最多读 `n-1` 个字符到 `buf`，再加上终止符。

```cpp
char strBuf[11] {};
std::cin.get(strBuf, 11);     // reads up to 10 chars
std::cout << strBuf << '\n';
// Input:  Hello my name is Alex
// Output: Hello my n             ← only the first 10 chars
```

> ⚠️ **`get()` 不会吃掉分隔符** —— 通常就是换行符。
> 所以第二次调 `get()` 立刻碰到留下的 `\n`，什么都没读就停下。

```cpp
char strBuf[11]{};
std::cin.get(strBuf, 11);   // reads "Hello!"
std::cout << strBuf << '\n';

std::cin.get(strBuf, 11);   // sees leftover '\n', stops immediately!
std::cout << strBuf << '\n';
// Output:
// Hello!
//                          ← (empty)
```

### 16.5 `getline()` —— 读取并丢掉分隔符

`std::cin.getline(buf, n)` 行为像 `get`，但 **会吃掉并丢弃** 尾部的换行。读整行的时候,这通常才是你想要的。

```cpp
char strBuf[11]{};
std::cin.getline(strBuf, 11);
std::cout << strBuf << '\n';

std::cin.getline(strBuf, 11);   // works correctly this time
std::cout << strBuf << '\n';
```

### 16.6 `gcount()` —— 读了多少个

一次 `getline()`（或带缓冲区的 `get()`）之后,`cin.gcount()` 返回提取的字符数（包括被丢弃的分隔符）。

```cpp
char strBuf[100]{};
std::cin.getline(strBuf, 100);
std::cout << strBuf << '\n';
std::cout << std::cin.gcount() << " characters were read\n";
```

### 16.7 给 `std::string` 用的 `std::getline`（自由函数）

`<string>` 里有一个非成员 `getline`，把一整行读到 `std::string` 里。**现代 C++ 用这个 —— 能避开 `char[]` 缓冲区就尽量避开。**

```cpp
#include <string>
#include <iostream>

int main() {
    std::string strBuf;
    std::getline(std::cin, strBuf);
    std::cout << strBuf << '\n';
}
```

> ⚠️ **经典混用 bug**
> ```cpp
> int n;
> std::cin >> n;                    // reads number, leaves '\n' in buffer
> std::string line;
> std::getline(std::cin, line);     // reads empty line — eats the leftover '\n'
> ```
> 修法：在两者之间调 `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');`。

### 16.8 其他有用的 istream 函数

来自 LearnCpp 28.2：

| 函数 | 作用 |
|---|---|
| `ignore()` | 丢弃流里的第一个字符 |
| `ignore(int n)` | 丢弃前 n 个字符 |
| `ignore(n, delim)` | 丢弃 n 个字符或者直到看到 `delim` 为止 |
| `peek()` | 返回下一个字符，**但不取出** |
| `unget()` | 把上一次读出来的字符塞回流里 |
| `putback(ch)` | 把你指定的字符塞回流里 |

写手工 parser（用 `peek()` 做前瞻、用 `putback()` 做错误恢复）时这些很有用。

其余内容参考 `https://en.cppreference.com/w/cpp/io/basic_istream`。

### 16.9 流状态 —— 为什么 `while (std::cin >> x)` 会终止

每个流都带着一组 **状态位（state bits）**，记录这个流目前是不是还能用。每次操作（`>>`、`getline()`、`read()`）之后这些位都会更新。从 `std::cin` 读到坏输入时它不会抛异常 —— 它会默默地把某个状态位设上，然后继续往下走。你必须自己检查。

#### 四个状态位

| 位（`std::ios_base::iostate`） | 含义 |
|---|---|
| `goodbit` | 一切正常，没有任何错误位（值为 `0`）。 |
| `eofbit`  | 上次读取时已经到文件末尾（例如 stdin 上按了 `Ctrl+D`、或者文件流读完了）。 |
| `failbit` | 上次操作 **失败** —— 通常是格式错误（比如想读 `int` 但流里是 `"abc"`）。流还活着，**可以恢复**。 |
| `badbit`  | 严重的底层错误（例如底层设备崩了）。通常不可恢复。 |

#### 怎么检查

| 调用 | 返回 `true` 的条件 |
|---|---|
| `stream.good()`  | 一个位都没设 —— 流是健康的。 |
| `stream.eof()`   | `eofbit` 被设了。 |
| `stream.fail()`  | `failbit` **或** `badbit` 被设了（这是常用的"出错没"判断）。 |
| `stream.bad()`   | `badbit` 被设了。 |
| `stream` *（在 boolean 上下文里）* | `!fail()` —— 也就是流还能用。`while (std::cin >> x)` 测的就是这个。 |
| `stream.rdstate()` | 返回原始 bitset，需要查特定位时用。 |

#### 读取循环为什么能工作

```cpp
int x;
while (std::cin >> x) {           // 测的是流的 bool 转换 → !fail()
    std::cout << x << '\n';
}
// 当 extraction 失败（坏输入）或者到流末尾时，循环退出。
```

`std::cin >> x` 返回 `std::cin`（按引用）。把它转 `bool` 实际就是调 `!fail()`。所以只要上次 extraction 成功，循环就继续。当你输入 `done` 而不是数字时，`failbit` 被设上，循环结束。

#### 从失败的 extraction 中恢复

读失败之后，流就 "卡住" 了 —— `failbit` 被设上，之后每次读都会立刻失败，而且坏输入还留在缓冲区里。需要两步：

```cpp
int n;
while (!(std::cin >> n)) {
    std::cin.clear();                                                       // 1. 把状态位复位回 goodbit
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');     // 2. 把坏输入扔掉
    std::cout << "Please enter a number: ";
}
```

- `clear()` 把所有错误位清零（也有可选参数允许设置特定的位）。
- `ignore(...)` 把违规字符丢掉，这样下次读才能读到新输入。

> **口诀：** **先 `clear` 再 `ignore`** —— 先清状态，再清缓冲。漏掉一步输入循环就会无限转。

---

## 17. 用 ostream 与 ios 做输出

> 对应 LearnCpp 28.3

### 17.1 插入运算符 `<<`

插入运算符把数据放进输出流。所有内置类型都已预定义；你也可以为自己的类重载它。

```cpp
std::cout << "Hello, " << name << ", age " << age << '\n';
```

Week 8 这部分有意思的内容是 **格式化**：控制数据 *怎么* 写出来（进制、精度、宽度等等）。

### 17.2 两种格式化方式：Flags vs. Manipulators

`istream` 与 `ostream` 都从 `std::ios` 派生,`ios` 持有格式化状态。改这个状态有两种方式：

- **Flags** —— 布尔状态变量，用 `setf()` 打开,`unsetf()` 关闭
- **Manipulators** —— 你流式发送给输出的对象（如 `std::hex`、`std::setw(10)`）；它们替你操作相应的 flag

### 17.3 用 `setf` / `unsetf` 操作 flag

```cpp
std::cout.setf(std::ios::showpos);   // turn on the "show + before positive nums" flag
std::cout << 27 << '\n';             // prints +27
std::cout.unsetf(std::ios::showpos); // turn it off
std::cout << 28 << '\n';             // prints 28
```

**用按位或 `|` 一次打开多个 flag：**

```cpp
std::cout.setf(std::ios::showpos | std::ios::uppercase);
std::cout << 1234567.89f << '\n';    // prints +1.23457E+06
```

### 17.4 Format Groups（关键陷阱）

有些 flag 属于 **format group** —— 一组互斥的选项。例子：`basefield` 组（`dec`/`hex`/`oct`）;`floatfield` 组（`fixed`/`scientific`）；`adjustfield` 组（`left`/`right`/`internal`）。

> ⚠️ **陷阱**
> `setf(std::ios::hex)` **不会** 把 `std::ios::dec` 关掉。`dec` 是默认就被打开的、显然有优先级,所以即使你设了 `hex`,还是会按十进制打印。

**两种修法：**

```cpp
// Fix 1: explicitly unset the conflicting flag first
std::cout.unsetf(std::ios::dec);
std::cout.setf(std::ios::hex);
std::cout << 27 << '\n';            // 1b

// Fix 2: use the two-arg form of setf() that takes (flag, group)
//        — this turns OFF all flags in the group, then turns ON the one you want
std::cout.setf(std::ios::hex, std::ios::basefield);
std::cout << 27 << '\n';            // 1b
```

### 17.5 Manipulator —— 省事的写法

Manipulator 帮你把 group/flag 的逻辑处理掉：

```cpp
std::cout << std::hex << 27 << '\n';   // 1b
std::cout << 28 << '\n';               // 1c — still hex
std::cout << std::dec << 29 << '\n';   // 29 — back to decimal
```

总体原则：**优先用 manipulator**，可读性更好;只有 manipulator 不存在时才退回 flag。

### 17.6 常用 Manipulator / Flag 速查 —— 按类别

#### Booleans

| Manipulator | 效果 |
|---|---|
| `std::boolalpha` | 把 bool 输出为 `"true"`/`"false"` |
| `std::noboolalpha` | 输出为 `1`/`0`（默认） |

```cpp
std::cout << true << ' ' << false << '\n';
// 1 0
std::cout << std::boolalpha << true << ' ' << false << '\n';
// true false
```

#### 正号

| Manipulator | 效果 |
|---|---|
| `std::showpos`   | 在正数前面加 `+` |
| `std::noshowpos` | 不加 |

#### 大小写（用于 hex 与 scientific）

| Manipulator | 效果 |
|---|---|
| `std::uppercase`   | 用大写字母（`E+007`、`1B`） |
| `std::nouppercase` | 用小写（`e+007`、`1b`） |

#### 进制

| Manipulator | 效果 | 对应的 flag |
|---|---|---|
| `std::dec` | 十进制（默认） | `std::ios::dec` |
| `std::hex` | 十六进制 | `std::ios::hex` |
| `std::oct` | 八进制 | `std::ios::oct` |

> **"Flag"那一列是什么？** 是这个 manipulator 在底层实际拨动的开关位。`std::cout << std::hex` 等价于 `std::cout.setf(std::ios::hex, std::ios::basefield)` —— manipulator 是上层的便捷写法，flag 是它真正在操作的状态位。这两栏不是两种不同的东西，而是**同一件事的两种写法**：左边是你日常写代码用的，右边是它背后操作的位（写 `setf`/`unsetf` 时才会直接打到右边那个名字）。

（这三个 flag 都属于 `std::ios::basefield` 这一组 —— 互斥的进制选项。）

#### `showbase` —— 打印 `0x` / `0` 前缀

默认情况下，hex 和 oct 输出不会带语言里的字面量前缀。`std::showbase` 把它打开：

```cpp
std::cout << std::hex << 27 << '\n';                    // 1b
std::cout << std::hex << std::showbase << 27 << '\n';   // 0x1b
std::cout << std::oct << std::showbase << 27 << '\n';   // 033
```

Sticky —— 一旦打开，之后每次 hex/oct 输出都会带前缀，直到你 `std::noshowbase`。和 `std::uppercase` 配合很搭（`0X1B` 而不是 `0x1b`）。

### 17.7 精度、记法、小数点（浮点）

| Manipulator | 效果 |
|---|---|
| `std::fixed`        | 十进制记法：`123.456`，无指数 |
| `std::scientific`   | 科学记法：`1.23456e+02` |
| `std::showpoint`    | 始终显示小数点和尾随的 0 |
| `std::noshowpoint`  | 隐藏多余的尾随 0（默认） |
| `std::setprecision(int)` | 设置位数（在 `<iomanip>` 里） |

**关于 `precision` 的大原则：**

- 在 **fixed** 或 **scientific** 模式下 → precision = **小数点后的位数**
- 在 **default** 模式下 → precision = **有效数字总数**

LearnCpp 的示例：

```cpp
std::cout << std::fixed << '\n';
std::cout << std::setprecision(3) << 123.456 << '\n';  // 123.456
std::cout << std::setprecision(4) << 123.456 << '\n';  // 123.4560
std::cout << std::setprecision(5) << 123.456 << '\n';  // 123.45600
std::cout << std::setprecision(6) << 123.456 << '\n';  // 123.456000
std::cout << std::setprecision(7) << 123.456 << '\n';  // 123.4560000

std::cout << std::scientific << '\n';
std::cout << std::setprecision(3) << 123.456 << '\n';  // 1.235e+002
std::cout << std::setprecision(4) << 123.456 << '\n';  // 1.2346e+002
// ... and so on
```

**default（非 fixed、非 scientific）模式下：**

```cpp
std::cout << std::setprecision(3) << 123.456 << '\n';  // 123
std::cout << std::setprecision(4) << 123.456 << '\n';  // 123.5
std::cout << std::setprecision(5) << 123.456 << '\n';  // 123.46
std::cout << std::setprecision(6) << 123.456 << '\n';  // 123.456
std::cout << std::setprecision(7) << 123.456 << '\n';  // 123.456
```

**总结表（来自 LearnCpp 28.3）：**

| 选项 | 精度 | 12345.0 | 0.12345 |
|---|---|---|---|
| Normal | 3 | 1.23e+004 | 0.123 |
| Normal | 5 | 12345 | 0.12345 |
| Showpoint | 5 | 12345. | 0.12345 |
| Showpoint | 6 | 12345.0 | 0.123450 |
| Fixed | 3 | 12345.000 | 0.123 |
| Fixed | 6 | 12345.000000 | 0.123450 |
| Scientific | 3 | 1.235e+004 | 1.235e-001 |
| Scientific | 6 | 1.234500e+004 | 1.234500e-001 |

#### `showpoint` 的实际效果

直觉上：不开 `showpoint` 的话，像 `12345.0` 这种值会打成 `12345`，`123.0` 会打成 `123` —— 小数点和尾随的 0 在 "不开就藏" 的情况下会被隐藏。打开它就强制显示：

```cpp
std::cout << std::setprecision(3) << 123.456 << '\n';                  // 123    （默认模式）
std::cout << std::showpoint << std::setprecision(3) << 123.456 << '\n';// 123.
std::cout << std::showpoint << std::setprecision(6) << 123.456 << '\n';// 123.456
std::cout << std::showpoint << std::setprecision(6) << 12345.0 << '\n';// 12345.0
```

所以 `showpoint` 不改变 *打多少位*，它只是保证小数点以及 precision 预算之内的尾随 0 永远都显示。

### 17.8 宽度、填充与对齐

不设 **字段宽度** 时，数字打印不带任何 padding。设了之后，数字会被填充（如果数字本身比字段更宽,字段被忽略 —— 永远不会截断）。

| Manipulator | 效果 | 对应的 flag / 成员函数 |
|---|---|---|
| `std::setw(int)`    | 设置 **下一个** 输出的字段宽度（在 `<iomanip>` 里） | 调用 `stream.width(int)` |
| `std::setfill(char)`| 设置填充字符（在 `<iomanip>` 里） | 调用 `stream.fill(char)` |
| `std::left`         | 在字段内左对齐 | flag `std::ios::left` |
| `std::right`        | 右对齐（默认） | flag `std::ios::right` |
| `std::internal`     | 符号左对齐、数字右对齐 | flag `std::ios::internal` |

> **关于右边那一列。** 和前面 `basefield` 那张表是一样的思路 —— `std::left` / `std::right` / `std::internal` 是 manipulator，背后拨的是 `std::ios::adjustfield` 这一组里的 flag 位（互斥：设了一个会自动把另外两个清掉）。而 `std::setw` / `std::setfill` 不一样，它们不对应任何 flag 位，而是直接调流对象的 `width()` / `fill()` 成员函数来保存"宽度"和"填充字符"这两份状态。所以这张表里有些 manipulator 映射到 **flag**，有些映射到 **成员函数** —— 两边都只是改同一份底层流状态的不同入口而已。

#### 成员函数形式（manipulator 的等价写法）

上面这几个 iomanip manipulator（以及 §17.7 的 `std::setprecision`）在流对象上都有对应的成员函数版本：

| 成员函数 | 等价 manipulator | 备注 |
|---|---|---|
| `stream.fill()`        | — （getter） | 返回当前填充字符。 |
| `stream.fill(char)`    | `std::setfill(char)` | 设置填充字符，返回旧的填充字符。 |
| `stream.width()`       | — （getter） | 返回当前字段宽度。 |
| `stream.width(int)`    | `std::setw(int)` | 设置宽度（同样 **one-shot**，跟 `setw` 一样），返回旧宽度。 |
| `stream.precision()`   | — （getter） | 返回当前精度（默认 `6`）。 |
| `stream.precision(int)`| `std::setprecision(int)` | 设置精度，返回旧精度（和 manipulator 一样是 sticky 的）。 |

所以下面例子里写的 `std::cout.fill('*')` 其实就是 `std::cout << std::setfill('*')` 的另一种写法。哪种好读就用哪种 —— iomanip manipulator 适合写在 `<<` 表达式链里，成员函数适合作为一次性的"配置语句"单独写一行。

默认是右对齐：

```cpp
std::cout << -12345 << '\n';                       // -12345
std::cout << std::setw(10) << -12345 << '\n';      //     -12345
std::cout << std::setw(10) << std::left  << -12345 << '\n'; // -12345
std::cout << std::setw(10) << std::right << -12345 << '\n'; //     -12345
std::cout << std::setw(10) << std::internal << -12345 << '\n'; // -    12345
```

填充字符设成 `*`：

```cpp
std::cout.fill('*');
std::cout << std::setw(10) << -12345 << '\n';                 // ****-12345
std::cout << std::setw(10) << std::left  << -12345 << '\n';   // -12345****
std::cout << std::setw(10) << std::internal << -12345 << '\n';// -****12345
```

> ⚠️ **小心** —— `setw()`（以及 `width()`）只影响 **下一次** 输出。它们 **不是 sticky 的**。绝大多数其他 flag/manipulator *是* sticky 的，设了之后会一直保留直到你再次修改。

> ⚠️ **字段宽度是 *下限*，不是上限。** 如果数值本身比字段更宽，字段会被悄悄忽略 —— 数值会完整打印，**永远不会截断**：
> ```cpp
> std::cout << std::setw(3) << 12345 << '|' << '\n';   // 12345|   （字段被忽略）
> std::cout << std::setw(8) << 12345 << '|' << '\n';   //    12345|  （字段填充）
> ```
> 所以 `setw(3)` 救不了你的表格 —— 一个超长数字会把版面冲破。要真正截断得自己做（比如用 `std::ostringstream` + 手动截断）。

#### Sticky vs one-shot —— 完整对照

**Sticky（持久）** = 一旦设置，之后这个流上的 **每一次** 输出都会用，直到你显式改掉它。
**One-shot（一次性）** = 只对 **下一次** 输出生效，用完就自动复位。

| Manipulator / flag | 持久？ | 备注 |
|---|---|---|
| `std::setw(n)` / `width(n)` | ❌ **one-shot** | 常用 manipulator 里唯一不持久的。每次输出后会被重置回 `0`。 |
| `std::hex` / `std::dec` / `std::oct` | ✅ 持久 | 整数进制；默认是 `dec`。 |
| `std::fixed` / `std::scientific` | ✅ 持久 | 浮点记法。 |
| `std::setprecision(n)` | ✅ 持久 | 位数（在 `fixed`/`scientific` 模式下含义不同）。 |
| `std::setfill(c)` | ✅ 持久 | 填充字符；默认是空格。 |
| `std::left` / `std::right` / `std::internal` | ✅ 持久 | 在字段宽度内的对齐方式。 |
| `std::boolalpha` / `std::noboolalpha` | ✅ 持久 | bool 打印成 `true`/`false` 还是 `1`/`0`。 |
| `std::showpoint` / `std::noshowpoint` | ✅ 持久 | 是否始终显示小数点和尾随 0。 |
| `std::showpos` / `std::noshowpos` | ✅ 持久 | 正数是否显示 `+`。 |
| `std::uppercase` / `std::nouppercase` | ✅ 持久 | 影响 hex 数字以及科学记法里的 `e`/`E` 大小写。 |
| `std::showbase` / `std::noshowbase` | ✅ 持久 | 十六进制/八进制输出是否带 `0x` / `0` 前缀。 |

**实际后果：**

```cpp
std::cout << std::hex << std::setw(6) << 27 << '\n';   // "    1b"  （宽度生效）
std::cout << 42 << '\n';                                // "2a"      （还是 hex！但宽度没了）
```

第一行之后，`hex` **还开着**（sticky），但宽度 **没了**（one-shot）。如果想每行都有字段宽度，就得每次都重新写 `std::setw(6)`。

---

## 18. 容器横向对比速查表

> 把第 5–7 节里所有容器揉在一起的一站式对照表 —— 复习时只要看这一节，就能在 *用法 / 原理 / 差别* 三个维度上把所有容器盘清楚

### 18.1 三大家族总览

| 家族 | 你能控制顺序吗？ | 典型成员 | 共同特征 |
|---|---|---|---|
| **Sequence Containers**（序列容器） | ✅ 自己决定元素位置 | `vector` / `deque` / `list` / `forward_list` / `array` / `string` | 保留 **插入顺序** |
| **Associative Containers**（关联容器） | ❌ 容器决定（按排序或哈希） | `set` / `multiset` / `map` / `multimap` / `unordered_*` | 自动按 key 组织 |
| **Container Adapters**（容器适配器） | 受限接口 | `stack` / `queue` / `priority_queue` | 包在 sequence container 外面，暴露 LIFO/FIFO/优先级语义 |

### 18.2 Sequence Containers —— 用法 vs 原理 vs 差别

| 容器 | 底层结构 | 随机访问 `v[i]` | 尾部 push/pop | 头部 push/pop | 中间插/删 | iterator 类别 | 关键特点 |
|---|---|---|---|---|---|---|---|
| **`vector`** | 动态数组（连续内存） | **O(1)** ⚡ | 摊销 O(1) | **O(n)** | O(n) | random-access / contiguous | 现代 C++ 默认选择；cache 友好；扩容时所有 iterator 失效 |
| **`deque`** | 分段数组（多段固定块） | O(1)（比 vector 慢） | O(1) | **O(1)** ⚡ | O(n) | random-access | 两端都快；`stack`/`queue` 的默认底层 |
| **`list`** | **双向链表** | ❌ 不支持 | O(1) | O(1) | **O(1)**（要有 iterator）⚡ | bidirectional | 中间插/删快；不支持 `std::sort`（要用 `.sort()` 成员） |
| **`forward_list`** | **单向链表** | ❌ | ❌（没 `push_back`） | O(1)（`push_front`） | O(1)（要有前驱 iterator） | forward | 比 list 更省内存；只能向前走 |
| **`array<T,N>`** | 静态数组（栈上） | O(1) | ❌ 大小固定 | ❌ | ❌ | random-access / contiguous | 编译期固定大小；零开销 STL 兼容 |
| **`string`** | 动态数组（连续，char 专用） | O(1) | O(1) | O(n) | O(n) | random-access / contiguous | 本质上是 `vector<char>` + 字符串辅助 |

> 💡 **底层原理对比** ——
> - **数组型**（vector / deque / array / string）：元素 **连续** 或 **近似连续** 存储 → 随机访问快、cache 命中高，但中间增删要移动大量元素
> - **链表型**（list / forward_list）：节点 + 指针 → 中间增删只动指针 = O(1)，但走到第 *i* 个元素必须遍历 = O(n)
>
> 复杂度看上去相同的两个容器，**实际跑起来可能差几个数量级**：链表节点散落在堆上，每跳一次都是一次 cache miss。这就是为什么"理论上 `list` 中间插入比 `vector` 快"在实际 workload 上 **几乎从不成立**，除非元素特别大且确实只在中间动。

### 18.3 Associative Containers —— 用法 vs 原理 vs 差别

| 容器 | 底层结构 | 排序？ | key 唯一？ | 有 value？ | 查找 | 插入/删除 | iterator 类别 |
|---|---|---|---|---|---|---|---|
| **`set`** | 红黑树（自平衡 BST） | ✅ 按 key | ✅ | ❌ 只有 key | O(log n) | O(log n) | bidirectional |
| **`multiset`** | 红黑树 | ✅ | ❌ 允许重复 | ❌ | O(log n) | O(log n) | bidirectional |
| **`map`** | 红黑树 | ✅ 按 key | ✅ | ✅ `pair<const Key, T>` | O(log n) | O(log n) | bidirectional |
| **`multimap`** | 红黑树 | ✅ | ❌ 允许重复 | ✅ | O(log n) | O(log n) | bidirectional |
| **`unordered_set`** | 哈希表 | ❌ | ✅ | ❌ | **平均 O(1)** ⚡ | 平均 O(1) | forward |
| **`unordered_map`** | 哈希表 | ❌ | ✅ | ✅ | **平均 O(1)** ⚡ | 平均 O(1) | forward |

> 💡 **底层原理对比** ——
> - **有序版**（无 `unordered_` 前缀）：**红黑树**；自动按 key 排序；范围查询（`lower_bound`、`upper_bound`、`equal_range`）便宜；iteration 顺序确定
> - **无序版**（`unordered_*`）：**哈希表**；只在乎单点查找速度，不在乎顺序；iteration 顺序 **不可预测**；最坏情况退化到 O(n)
>
> ⚠️ **三个最容易被坑的差别：**
> - `std::set` ≠ Python `set`。Python 的 `set` 是哈希 → 对应 `unordered_set`；`std::set` 是 BST
> - 唯一性判定靠 `!comp(a,b) && !comp(b,a)`，**只调用 `<`，从不调用 `==`**
> - `map[k]` 在 key 不存在时 **会悄悄插入一个默认值**！只读访问要用 `find` / `at` / `contains`

### 18.4 Container Adapters —— 用法 vs 原理 vs 差别

| 适配器 | 抽象语义 | 默认底层 | 可选底层 | 主要操作 | 内部实现要点 |
|---|---|---|---|---|---|
| **`stack`** | LIFO（后进先出） | `deque` | `vector` / `deque` / `list` | `push` / `pop` / `top` | 直接转发到底层的 `push_back` / `pop_back` |
| **`queue`** | FIFO（先进先出） | `deque` | `deque` / `list` | `push` / `pop` / `front` / `back` | 用 `push_back` + `pop_front` —— **所以不能用 vector**（没 `pop_front`） |
| **`priority_queue`** | 最大堆 / 优先队列 | `vector` | `vector` / `deque` | `push` / `pop` / `top` | **二叉堆**：push/pop 都是 O(log n)，top 是 O(1) |

> 💡 **适配器的本质** —— 它们 *本身* 不实现任何数据结构，只是 *把已有 sequence container 的一组成员函数重新命名/限制*，以匹配抽象数据类型（ADT）。换句话说：`std::stack<int>` 大致等于"只允许调用 `push_back`/`pop_back`/`back` 的 `std::deque<int>`"。

### 18.5 复杂度大总表（最适合背的一张）

| 操作 | `vector` | `deque` | `list` | `set` / `map` | `unordered_set` / `unordered_map` |
|---|---|---|---|---|---|
| 随机访问 `[i]` | **O(1)** | O(1) | ❌ | ❌（map 的 `[key]` 是 O(log n)） | ❌（map 的 `[key]` 平均 O(1)） |
| 尾部插入 | 摊销 O(1) | O(1) | O(1) | — | — |
| 头部插入 | O(n) | **O(1)** | O(1) | — | — |
| 中间插入（已有 iterator） | O(n) | O(n) | **O(1)** | — | — |
| 按值查找 | O(n) | O(n) | O(n) | O(log n) | **平均 O(1)** |
| 按 key 查找 | — | — | — | O(log n) | **平均 O(1)** |
| 有序遍历 | 插入顺序 | 插入顺序 | 插入顺序 | **按 key 升序** | 无序 |

### 18.6 Iterator 失效规则横向对比（极易考）

| 容器 | `insert` / `emplace` | `erase` |
|---|---|---|
| **`vector`** | 扩容了 → **全部失效**；没扩容 → 插入点之后全部失效 | 被删及其后所有 iterator 全部失效 |
| **`deque`** | 通常让所有 iterator 失效（但指针/引用可能保留） | 通常让所有 iterator 失效 |
| **`list` / `forward_list`** | **完全不失效** ✅ | **只有被删的 iterator 失效** |
| **`set` / `map`**（有序） | **完全不失效** ✅ | **只有被删的 iterator 失效** |
| **`unordered_*`** | rehash 了 → 所有 iterator 失效；指针/引用不失效 | 只有被删的 iterator 失效 |

> 💡 **背诵口诀** —— **数组型扩容会全失效；树/链表只失效被删的那一个；哈希表 rehash 会失效。**

### 18.7 选用决策树

```
你需要……
├─ 按位置索引 + 主要在尾部增删？        → vector ⭐
├─ 两端都频繁增删？                      → deque
├─ 大小编译期固定？                      → array
├─ 大量中间插/删，不要随机访问？        → list
├─ 字符序列？                            → string
│
├─ 只关心成员关系（在不在）？
│   ├─ 要排序遍历 / 范围查询？           → set
│   └─ 只要最快查找？                    → unordered_set
│
├─ key → value 映射？
│   ├─ 要按 key 排序遍历？               → map
│   └─ 只要最快查找？                    → unordered_map ⭐（最常用）
│
└─ 受限接口（教科书数据结构）？
    ├─ 栈（LIFO）？                      → stack
    ├─ 队列（FIFO）？                    → queue
    └─ 优先级（最大堆）？                → priority_queue
```

### 18.8 最高频陷阱速览

| 陷阱 | 现象 | 正解 |
|---|---|---|
| `vector<int> v(100)` vs `v{100}` | 前者是 100 个 0，后者是 1 个值为 100 的元素 | 想要 N 个 0 就用 **圆括号** |
| `map[k]` 在不存在 key 上 | **悄悄插入** 默认值；甚至会让 `const map` 编不过 | 用 `find` / `contains` / `at` |
| `vector::erase` 后还 `++it` | UB | `it = v.erase(it);` 接住返回值 |
| 想 `std::sort(list)` | 编译错（list 不是 random-access） | 用 `list.sort()` 成员函数 |
| 改 `set` / `map` 里的 key | UB（破坏排序不变量） | 先 `erase` 旧的再 `insert` 新的 |
| `vector<bool>` 当普通容器用 | 拿不到 `bool&` / `bool*`（其实是位打包） | 用 `vector<char>` 或 `bitset` |
| 用 `==` 比 iterator | 比的是 **位置** 不是值 | 想比值要先 `*it1 == *it2` |
| `queue` 用 `vector` 当底层 | 编译错 —— `vector` 没 `pop_front` | 用默认 `deque` 或 `list` |

---

## 19. Week 8 综合 Cheat Sheet

### 19.1 容器选择决策树

```
Do you need to associate values with keys?
├── Yes ── Need ordered iteration? ── Yes → std::map (or multimap)
│                                  └─ No → std::unordered_map
└── No ── Need uniqueness?
         ├── Yes ── Need ordered iteration? ── Yes → std::set (or multiset)
         │                                  └─ No → std::unordered_set
         └── No ── Operations on?
                  ├── Both ends → std::deque
                  ├── Back only, need [] → std::vector
                  ├── Anywhere by iterator → std::list (or forward_list)
                  ├── Fixed size, no allocation → std::array
                  └── Restricted (LIFO/FIFO/priority) → stack, queue, priority_queue
```

### 19.2 容器复杂度速查

| 容器 | `op[i]` | `push_back` | `push_front` | `insert(it,x)` | `find(x)` |
|---|---|---|---|---|---|
| `vector` | O(1) | 摊销 O(1) | —（用 `insert(begin)`，O(n)） | O(n) | O(n)（线性，除非已排序 + `binary_search`） |
| `deque` | O(1) | O(1) | O(1) | O(n) | O(n) |
| `list` | — | O(1) | O(1) | O(1) | O(n) |
| `set` / `map` | — / O(log n)（仅 map） | — | — | O(log n) | O(log n) |
| `unordered_set` / `unordered_map` | — / O(1)（平均） | — | — | 平均 O(1) | 平均 O(1) |

**`std::vector` 的 size vs capacity：**

```cpp
v.size();          // current element count
v.capacity();      // currently allocated storage (≥ size)
v.reserve(n);      // pre-allocate to avoid push_back reallocations
v.shrink_to_fit(); // non-binding request to shrink capacity to size
```

**`std::vector` iterator 失效规则（背下来）：**

- `push_back`、`emplace_back`、`insert`、`emplace`、`resize` → 容量增长则 **全部** iterator 失效；否则只让 `end()`（或插入点及其之后的）失效。
- `erase` → 被删元素以及 **它后面的所有**。
- `clear`、`operator=`、`assign` → **永远全部**。
- `reserve`、`shrink_to_fit` → 容量变了则全部，否则无。

**map/set 补充（cppreference）：**

| 操作 | 效果 |
|---|---|
| `m.at(k)` | 带边界检查的元素访问；key 不存在时 **抛** `out_of_range` |
| `m[k]` | 访问，或 key 不存在时 **插入默认值** —— 千万别在 `const map` 上用 |
| `m.contains(k)`（C++20） | 返回 `bool` 的成员检查（无插入副作用） |
| `m.find(k)` | 指向元素的 iterator,或 `m.end()` |
| `m.insert({k, v})` | `k` 已存在时什么都不做 |
| `m.insert_or_assign(k, v)`（C++17） | `k` 存在则覆盖,否则插入 |
| `m.try_emplace(k, args...)`（C++17） | 只有在 `k` 缺失时才就地构造 |
| `s.lower_bound(k)` | 指向第一个 ≥ k 的元素的 iterator（仅排序容器） |
| `s.upper_bound(k)` | 指向第一个 > k 的元素的 iterator |
| `s.equal_range(k)` | `{lower_bound(k), upper_bound(k)}` |

### 19.3 Iterator 速查

| 操作 | 含义 |
|---|---|
| `c.begin()`、`c.end()` | 正向 iterator 对 `[begin, end)` |
| `c.cbegin()`、`c.cend()` | const（只读）版本 |
| `c.rbegin()`、`c.rend()` | 反向 iterator 对 |
| `*it` | 元素（或 `it->m` 访问成员） |
| `++it` / `--it` | 前进 / 后退 |
| `it1 == it2` | 同一个位置（不是同值） |
| `std::next(it)`、`std::prev(it)` | 不修改原 iterator 的前后移动 |
| `std::distance(b, e)` | `b` 到 `e` 之间的步数 |

**Iterator 分类（从弱到强）：**

`input` → `forward` → `bidirectional` → `random-access` → `contiguous`
`output`（独立的另一条层次）

### 19.4 Algorithm 速查

```cpp
#include <algorithm>
#include <numeric>

// Searching
auto it1 = std::find(b, e, val);            // linear
auto it2 = std::find_if(b, e, pred);        // linear, takes a predicate
bool ok  = std::binary_search(b, e, val);   // requires sorted range
auto lb  = std::lower_bound(b, e, val);     // first >= val (sorted range)
auto ub  = std::upper_bound(b, e, val);     // first > val  (sorted range)

// Min/max
auto mn = std::min_element(b, e);
auto mx = std::max_element(b, e);

// Reordering
std::sort(b, e);                  // requires random-access iterators
std::sort(b, e, comp);            // with custom comparator
std::reverse(b, e);

// Numeric
int total = std::accumulate(b, e, 0);          // sum (in <numeric>)
std::iota(b, e, start);                        // fills b..e with start, start+1, ...
std::transform(b, e, out, fn);                 // apply fn to each, write to out

// Counting
int n  = std::count(b, e, val);
int n2 = std::count_if(b, e, pred);

// Bulk
std::copy(b, e, out);
std::for_each(b, e, fn);

// Predicate logic (§11.6)
bool all  = std::all_of (b, e, pred);
bool any  = std::any_of (b, e, pred);
bool none = std::none_of(b, e, pred);

// Erase-remove idiom (§11.7) — vector / deque / string
v.erase(std::remove   (v.begin(), v.end(), val),  v.end());
v.erase(std::remove_if(v.begin(), v.end(), pred), v.end());
// C++20 一行版:
std::erase   (v, val);
std::erase_if(v, pred);

// Range comparison (§11.8)
bool eq = std::equal(b1, e1, b2);                       // 逐元素 ==
auto [pa, pb] = std::mismatch(b1, e1, b2);              // 第一处不同
bool lt = std::lexicographical_compare(b1, e1, b2, e2); // 字典序 <

// Set algorithms on SORTED ranges (§11.9)
std::set_union              (a_b, a_e, b_b, b_e, out);
std::set_intersection       (a_b, a_e, b_b, b_e, out);
std::set_difference         (a_b, a_e, b_b, b_e, out);  // a \ b
std::set_symmetric_difference(a_b, a_e, b_b, b_e, out);
bool sub = std::includes(a_b, a_e, b_b, b_e);           // b ⊆ a?

// Heap algorithms — random-access range (§11.10)
std::make_heap (b, e);              // 重排成 max-heap
std::push_heap (b, e);              // 让 *(e-1) sift-up
std::pop_heap  (b, e);              // 把 *b 换到 *(e-1)
std::sort_heap (b, e);              // 堆 → 排好序
bool h = std::is_heap(b, e);

// <numeric> family (§11.11)
std::inner_product       (a_b, a_e, b_b, init);   // 点积
std::partial_sum         (b, e, out);             // 前缀和
std::adjacent_difference (b, e, out);             // 相邻差
// C++17 并行友好:
std::reduce              (b, e, init);            // 无序版 accumulate
std::transform_reduce    (a_b, a_e, b_b, init, op1, op2);
```

### 19.5 Iterator Adapter 速查

| Adapter | 要求 | 适用容器 / 流 | 每次 `*it = x;` 调用 |
|---|---|---|---|
| `back_inserter(c)`  | 容器有 `push_back` | `vector`、`deque`、`list`、`string` | `c.push_back(x)` |
| `front_inserter(c)` | 容器有 `push_front` | `deque`、`list`、`forward_list`（**没有** `vector`、`string`） | `c.push_front(x)` |
| `inserter(c, pos)`  | 容器有 `insert` | 几乎所有 STL 容器：`vector`、`deque`、`list`、`forward_list`、`set` / `multiset`、`map` / `multimap`、`unordered_*` | `c.insert(pos, x)` |
| `ostream_iterator<T>(s, "delim")` | 输出流对象 | `std::cout`、`std::cerr`、`std::clog`、`std::ofstream`、`std::ostringstream` | `s << x; s << "delim";` |
| `istream_iterator<T>(s)` | 输入流对象 | `std::cin`、`std::ifstream`、`std::istringstream` | 通过 `>>` 读取 |
| `istream_iterator<T>()` | （默认构造）| — | 代表 EOF（流尾 sentinel） |

> ⚠️ **关联容器（`set` / `map` 等）只能用 `inserter`**，不能用 `back_inserter` / `front_inserter` —— 它们自己决定元素位置，没有"前"/"后"的概念。对 `set` 来说 `inserter(s, s.end())` 是惯用写法（或者干脆直接 `s.insert(x)`，跳过 iterator adapter）。
>
> ⚠️ **`array` 和 `forward_list` 都不能用 `back_inserter`** —— `array` 是定长，`forward_list` 只有 `push_front` 没有 `push_back`。

### 19.6 I/O 流速查

**预定义的流：**

| 对象 | 类 | 连接到 | 缓冲？ |
|---|---|---|---|
| `std::cin`  | `istream` | stdin（键盘） | 是 |
| `std::cout` | `ostream` | stdout（显示器） | 是 |
| `std::cerr` | `ostream` | stderr（显示器） | **否** |
| `std::clog` | `ostream` | stderr（显示器） | 是 |

**输入惯用法：**

```cpp
std::cin >> x;                  // skip ws, read x (any built-in or overloaded type)
std::cin.get(ch);               // read a single char including ws
std::cin.get(buf, n);           // up to n-1 chars, leaves delimiter in stream
std::cin.getline(buf, n);       // up to n-1 chars, consumes & discards delimiter
std::getline(std::cin, str);    // free function — reads a line into std::string
std::cin.ignore(N, '\n');       // skip up to N chars or to '\n', inclusive
std::cin.peek();                // look at next char without consuming
std::cin.unget(); / putback(c); // push a char back into the stream

// Limit C-string extraction to avoid overflow:
#include <iomanip>
std::cin >> std::setw(N) >> buf;
```

**输出格式化 manipulator：**

```cpp
#include <iomanip>

std::cout << std::boolalpha << b;          // print "true"/"false"
std::cout << std::hex      << 27;          // 1b
std::cout << std::dec      << 27;          // 27
std::cout << std::oct      << 27;          // 33
std::cout << std::showpos  << 27;          // +27
std::cout << std::uppercase<< 0xab;        // AB
std::cout << std::fixed       << std::setprecision(2) << 3.14159;  // 3.14
std::cout << std::scientific  << std::setprecision(3) << 1234.5;   // 1.234e+003
std::cout << std::setw(8)     << std::setfill('*') << std::left  << "hi";  // hi******
std::cout << std::setw(8)     << std::setfill('*') << std::right << "hi";  // ******hi
```

> ⚠️ **Sticky vs. 一次性**
> - **Sticky**（一直保留直到再次修改）：`boolalpha`、`hex`、`fixed`、`setprecision`、`setfill`、`left`/`right`
> - **一次性**（仅影响下一个输出）：`setw`（以及 `width()`）

### 19.7 Function Object 的几种形态

```cpp
// 1. Free function
void print(int i) { std::cout << i; }
std::for_each(b, e, print);

// 2. Function pointer (the above already decays to one)
void (*p)(int) = print;
std::for_each(b, e, p);

// 3. Functor (class with operator())
struct Print {
    void operator()(int i) const { std::cout << i; }
};
std::for_each(b, e, Print{});

// 4. Lambda (Week 7)
std::for_each(b, e, [](int i){ std::cout << i; });
```

---

## 20. Week 8 最重要的五条记忆

1. **STL 是一个三角：containers、iterators、algorithms。** 每个 algorithm 都用 iterator **写一次**，每个 container 也只暴露一次 iterator。"每个算法 × 每个容器" 的组合爆炸于是塌缩成 *M + N* 块，而不是 *M × N* 块。这一刻你想明白了，这个库就从"一本琐碎条目的电话簿"变成了"一套自洽的设计"。你必须背下来的推论是：**algorithm 不接受 container —— 它接受一对 iterator**。

2. **挑容器看的是哪种操作必须快。** 默认用 **`vector`**（随机访问、尾部追加、缓存友好、最少惊喜）。要按 key 查找或需要自动排序时用 **`map`/`set`**。不需要排序、想要平均 O(1) 查找时用 **`unordered_map`/`unordered_set`**。**只在** 你确实大量地在序列中间插入/删除时才用 **`list`** —— 它没有随机访问、缓存表现也差，绝大多数 workload 上比 vector 慢很多。需要限制接口时用 **容器适配器**（`stack`、`queue`、`priority_queue`）。

3. **半开区间 `[begin, end)` 是 iterator 的契约。** `end()` **不** 指向最后一个元素 —— 它指最后一个元素之后一个位置。每个循环都长这样：`for (auto it = c.begin(); it != c.end(); ++it)`。这个约定让所有循环写法统一，让空容器自然工作（`begin() == end()`），也让 `std::find` 用 `end()` 当 "找不到" 哨兵成为可能。搜索结果解引用之前，**永远先判** `if (it == c.end())`。

4. **Iterator adapter 把"任何顺序结构"都变成 iterator。** `back_inserter(v)` 让 `std::copy` 不再覆盖、而是把 `v` 撑大；`istream_iterator<int>(cin)` 与 `ostream_iterator<int>(cout, "\n")` 让 **同一组** 算法在键盘、文件、字符串缓冲区上都成立。这就是 *"从 stdin 读所有单词、排序、打印去重后的"* 那种一行解决问题的程序背后的秘密 —— 三个算法用 stream iterator 串起来。教训是：当你要喂给算法的东西不是现成的容器范围时，先去找一个合适的 adapter。

5. **C++ I/O 格式化是一台状态机。** `std::cout` 在多次调用之间会持续保留格式化设置；一旦设了 `std::hex`，*之后每一个* int 都会按十六进制输出，直到你设 `std::dec`。唯一不 sticky 的例外是 `std::setw()` —— 它只影响 **下一次** 输出。Manipulator（`std::fixed`、`std::setprecision`、`std::setfill`、`std::left`、`std::hex`）是驱动这台状态机的可读写法；flag（`setf`/`unsetf`）是底层写法，并且有 **format-group 陷阱** —— 单独的 `setf(std::ios::hex)` *不会* 关掉 `dec`。用两参数版本 `setf(std::ios::hex, std::ios::basefield)`，或者干脆用 manipulator。

> ⚠️ **PPT-vs.-阅读 优先级提醒**：当 Klefstad PPT 与 LearnCpp 在术语或例子上有冲突时，**以 PPT 为准**（它对这门课是权威）。在 Week 7、Week 8、Week 9 内容归属上拿不定主意时，宁可多覆盖一点 —— 多写一点比漏写一点强。

> 💡 **展望 Week 9** —— Topic 8 PPT 的第 26–27 张幻灯片介绍 **标准异常层次结构**（`std::bad_alloc`、`std::logic_error`、`std::out_of_range`、`std::runtime_error` 等）作为 STL 操作推荐的报错方式。这些幻灯片本质上是 Week 7 异常话题的延续；该层次已经整合在 Week 7 笔记的 13 节和 19.5 节里。预计 Week 9 会开始进入这门课考试范围的后半段 —— 可能是 C 兼容性（`ICS_45c_Week_12_C_Tour.pdf`），也可能是其他 Topic 9 内容。