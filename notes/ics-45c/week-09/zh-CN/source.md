# Information and Computer Science 45C — Week 9 整合学习笔记

## 目录

- [1. 周学习目标](#1-周学习目标)
- [2. 容器类（Container Classes）](#2-容器类container-classes)
- [3. std::initializer_list](#3-stdinitializer_list)
- [4. assert 与 static_assert](#4-assert-与-static_assert)
- [5. 迭代器 — 更深入的视角](#5-迭代器--更深入的视角)
- [6. std::iterator_traits](#6-stditerator_traits)
- [7. 智能指针与移动语义 — 整体图景](#7-智能指针与移动语义--整体图景)
- [8. std::unique_ptr](#8-stdunique_ptr)
- [9. std::shared_ptr](#9-stdshared_ptr)
- [10. 设计使用 STL 的类（Klefstad 的 "Using STL"）](#10-设计使用-stl-的类klefstad-的-using-stl)
- [11. C++20 Ranges 与 Views](#11-c20-ranges-与-views)
- [12. HW9 — 实现 SetList 与 MapArray 容器](#12-hw9--实现-setlist-与-maparray-容器)
- [13. 迭代器 ++/-- 的通用骨架(以及随机访问的额外运算符)](#13-迭代器----的通用骨架以及随机访问的额外运算符)
- [14. SetList 前向迭代器](#14-setlist-前向迭代器)
- [15. MapArray 与它的随机访问迭代器](#15-maparray-与它的随机访问迭代器)
- [16. 保持 vector 有序的工具(lower_bound + vector::insert)](#16-保持-vector-有序的工具lower_bound--vectorinsert)
- [17. Week 9 综合 Cheat Sheet](#17-week-9-综合-cheat-sheet)
- [18. Week 9 最重要的五条记忆](#18-week-9-最重要的五条记忆)

> UCI ICS 45C: Programming in C++ (35770)
> 本笔记整合 Week 9 阅读材料:LearnCpp 23.6(容器类)、23.7(`std::initializer_list`)、9.6(`assert` 与 `static_assert`)、18.2(迭代器入门)、22.1(智能指针与移动语义入门)、22.5(`std::unique_ptr`)、22.6(`std::shared_ptr`);cppreference 上 `std::iterator_traits` 的参考页;以及 Klefstad 的 *Topic 9* PPT — C++20 ranges/views、智能指针、HW9 的 `SetList` + `MapArray` 容器及其迭代器,还有 "Using STL" 设计模式。Klefstad 的 *Topic 8* PPT 末尾引入 ranges 的部分(slide 25)也放在这里,因为 Topic 9 PPT 是在它的基础上展开的。
>
> **跨周 PPT 内容说明:**
> - **Topic 8 PPT slides 26–27**(标准 C++ 异常层次、STL 异常)对应 Week 7 阅读(LearnCpp 27.x)。那些幻灯片已经整合到 Week 7 笔记里,这里不再重复。
> - **Topic 8 PPT slides 11–13**(基础迭代器操作 + "ZZZ Activity:Linked List Iterator")正好对应本周的迭代器阅读(LearnCpp 18.2),因此放在本笔记第 5 节。
> - **Topic 9 PPT slide 10**(Template Class `Array`)和 **HW9 设计**(slides 9、11–15)是 Klefstad 为 Week 9 作业准备的,LearnCpp 不覆盖。放在第 12–16 节。
> - Topic 9 中可能延伸到 Week 10 的幻灯片(cppreference ranges 链接、具体 HW9 细节)在不确定的地方用 ⚠️ 标注,但为了完整性仍保留。

---

## 1. 周学习目标

> Week 9 四个概念板块的鸟瞰

### 1.1 设计你自己的容器类(LearnCpp 23.6、23.7;Topic 9 PPT slides 9–15)

- 理解:**容器类** 是用来装并组织另一种类型的多个实例的类 — 而且它有一套相当标准化的最小接口(构造、插入、删除、size、迭代等等)
- 掌握:从零写一个完整的 `IntArray`:动态存储、析构函数、拷贝语义、`resize`/`reallocate`、`insertBefore`/`remove`
- 掌握:通过给类加一个 `std::initializer_list<T>` 构造函数,让 `MyClass x{1, 2, 3};` 能用
- 区分:花括号 `{}` 初始化(优先匹配 list 构造函数) vs. 圆括号 `()` 初始化(走非 list 构造函数)
- 理解:为什么给一个已有的类加 list 构造函数会悄悄破坏旧代码
- 应用:用同一套模式构建 **HW9 的 `SetList<T>`**(带前向迭代器的链表)和 **`MapArray<K,V>`**(带随机访问迭代器的有序 pair 数组)

### 1.2 防御性编程(LearnCpp 9.6)

- 理解:**前置条件、不变式、后置条件** 作为函数对调用者立下的契约
- 掌握:**bouncer 模式** — 前置条件不满足时立即 early return
- 掌握:`<cassert>` 里的 `assert(condition)` — 运行时调试辅助,在定义 `NDEBUG` 时被编译掉
- 掌握:`static_assert(condition, message)` — 编译期检查,运行时零开销
- 区分:**assert**(程序员错误,永不恢复) vs. **错误处理**(预期内的运行时情况,可恢复)
- 应用:用 `assert(cond && "message")` 写带说明的 assert

### 1.3 迭代器 — 这次认真地讲(LearnCpp 18.2、cppreference iterator_traits;Topic 8 PPT slides 11–13)

- 理解:**迭代器** 是一个遍历容器、并暴露一套统一接口(`*`、`++`、`==`、`!=`)的对象
- 掌握:**`begin()`/`end()` 契约** 与半开区间 `[begin, end)`
- 理解:**指针** *就是* 一种迭代器(最简单的那种) — 这就是为什么有 `std::iterator_traits<T*>`
- 掌握:**迭代器失效** — 修改容器会让已有迭代器变成无效引用,以及救场的 **`it = c.erase(it)` 习惯用法**
- 掌握:让通用算法能反射的 **五个 traits**:`iterator_category`、`value_type`、`pointer`、`reference`、`difference_type`

### 1.4 智能指针 — 堆对象的 RAII(LearnCpp 22.1、22.5、22.6;Topic 9 PPT slides 5–8)

- 理解:为什么裸指针会泄漏(early return、异常),以及智能指针的 **析构函数** 怎么堵上这个洞
- 理解:**拷贝语义**(各自拥有自己的副本) vs. **移动语义**(所有权转移,源对象被清空)的区别
- 掌握:`std::unique_ptr<T>` — 独占所有权,**不可拷贝**,通过 `std::move` 转移
- 掌握:`std::shared_ptr<T>` — 通过引用计数共享所有权,**可拷贝**
- 掌握:工厂函数 `std::make_unique<T>(...)` 和 `std::make_shared<T>(...)`,以及为什么它们比裸 `new` 更好
- 应用:写一个 `next` 是 `unique_ptr<Node>` 或 `shared_ptr<Node>` 的链表 — 以及一个意外结果:`unique_ptr` 版本无法提供迭代器(因为迭代器会和被持有的 `next` 指针起别名)

### 1.5 串联:你这周写的每个 "Week 9" 工具都是 *用户视角* 那一半的 STL

把整个 Week 9 串起来的一个大思想:STL 是 **用户可扩展的**。上周(Week 8)你学会了怎么 *用* `vector`、`set`、`map`、`sort`、`find` 等等。这周你学会怎么 *写* 自己的类,让它遵守同一套规则 — 容器、迭代器、traits — 这样 Week 8 学的所有算法在 *你的* 容器上也都能用。`SetList` 和 `MapArray`(HW9)就是证明。

---

## 2. 容器类(Container Classes)

> 对应 LearnCpp 23.6 + Topic 9 PPT slide 10("Template Class Array — 包装一个 C 数组")

### 2.1 什么是容器类?

**容器类** 是一种被设计成用来装并组织另一种类型(基本类型如 `int`,或别的类)的多个实例的类。现实里的容器 — 箱子、收纳盒、书架 — 整理并保护放在里面的东西;在代码里,容器类做同样的事。

> 💡 **LearnCpp 23.6 的说法**
> "没有容器,处理大量对象会极不方便。想象一本书完全没有装订的样子。"

你已经见过一个容器类很多次了:`std::vector<int>`(Week 8)。C 风格数组也算是一种原始的容器,但 `std::array`/`std::vector` 更受欢迎,因为它们支持 **动态调整大小**、**自己记得自己的长度**(传给函数时不丢信息),以及 **越界检查**(通过 `at()`)。这三点都是裸数组的短板。

### 2.2 最小接口

定义良好的容器一般会提供这些函数:

- 创建一个空容器(通过构造函数)
- 插入新对象
- 删除对象
- 报告当前对象数量(`size()`)
- 清空所有对象
- 访问已存对象
- 排序(可选)

有些容器会省略一部分。比如,数组类的容器经常省略 `insert` 和 `remove`,因为它们是 O(n) 的,设计者想劝退使用者。

> 容器类实现的是一种 **member-of 关系**。数组的元素是数组的 member-of。(LearnCpp 这里说的 "member-of" 是日常英语的意思,不是 "C++ 类成员"。)

### 2.3 值容器 vs. 引用容器

| 类型 | 存什么 | 拥有元素吗? | 类比 |
|---|---|---|---|
| **值容器** | 对象的副本 | 是 — 负责创建和销毁它们 | 组合(Ch. 23.2) |
| **引用容器** | 指针或引用 | 否 — 元素由别处持有 | 聚合(Ch. 23.3) |

日常容器(`std::vector<int>`、`std::list<std::string>`……)大多是 **值容器**。下面要写的 `IntArray` 也是值容器。

### 2.4 容器只装一种类型

不像 Python 的 `list` 可以随便混 `[1, "hello", 3.14, [4, 5]]`,C++ 容器只装一种静态决定的元素类型。如果你需要 "int 和 double 的列表",要么写两个容器,要么用模板(下面就会用)。

这是 **特性**,不是 bug:编译期就知道元素类型让按下标访问能跟指针算术一样快,不需要运行时类型检查,还方便编译器激进优化。

> ⚠️ **Python → C++**
> Python list:`[1, "hi", 3.14]` — 异构,每个元素都是带 tag 的引用。
> C++ vector:`std::vector<int>{1, 2, 3}` — 同构,每个元素都是连续内存里的普通 `int`。

### 2.5 最简单的容器:`IntArray`(LearnCpp 23.6 的完整实现)

我们一步步搭 `IntArray`。这 **正是 HW9 要你写的那种类** — 只是 HW9 还要加上模板和迭代器,见 11–15 节。它也正是 Klefstad *Topic 9 PPT slide 10* 说的那个 "**Template Class Array — 最简单的容器的一个完整例子 — 包装 C 数组 — Array.cpp**"。

#### 第 1 步:数据 + 空类

`IntArray` 要追踪两样东西 — 数组的 **长度** 和 **指向动态分配存储的指针**。

```cpp
#ifndef INTARRAY_H
#define INTARRAY_H

class IntArray
{
private:
    int  m_length{};
    int* m_data{};
};

#endif
```

> ⚠️ **为什么是指针,不是固定大小的 C 数组?** 我们希望长度在构造时才确定,不要烧死在类型里。那就得动态分配 → `m_data` 必须是指针。

#### 第 2 步:构造函数(空 + 指定大小)

```cpp
#include <cassert>  // 为 assert()
#include <cstddef>  // 为 std::size_t

class IntArray
{
private:
    int  m_length{};
    int* m_data{};

public:
    IntArray() = default;

    IntArray(int length) : m_length{ length }
    {
        assert(length >= 0);
        if (length > 0)
            m_data = new int[static_cast<std::size_t>(length)]{};
    }
};
```

两点值得注意:

1. 默认构造函数显式写 `= default`。有它在,`IntArray a;` 就是一个空的(零长度、空指针)数组。
2. 带大小的构造函数用 `assert`(见第 4 节)保证 `length >= 0` — 这是一个 **前置条件**。

#### 第 3 步:析构函数 + `erase()`

```cpp
~IntArray()
{
    delete[] m_data;
    // 不需要把 m_data 置空或把 m_length 清零 — 对象马上就要死了。
}

void erase()
{
    delete[] m_data;
    m_data   = nullptr;  // 必须置空,因为 erase() 在对象活着时也能被调用
    m_length = 0;
}
```

> ⚠️ **为什么 `erase()` 要把 `m_data` 置空,而析构函数不用。**
> 析构函数 *只跑一次*,在对象生命周期末尾。析构后留在 `m_data` 里的东西已经不可达,把它置空是白费功夫。但 `erase()` 调用后对象还活着 — 如果不置空,下一次 `erase()` 就会对一个已经释放过的指针再 `delete[]` 一次(UB)。

#### 第 4 步:元素访问 + 长度

```cpp
int& operator[](int index)
{
    assert(index >= 0 && index < m_length);
    return m_data[index];
}

int getLength() const { return m_length; }
```

`operator[]` 返回 **引用** 就是为了让我们能写 `array[3] = 42;`(下标调用是赋值号的左边)。

`assert` 在调试模式下检查越界。注意 `std::vector<int>::operator[]` **不做** 越界检查;只有 `vector::at()` 做。我们的 `IntArray` 在 debug 构建里比 vector 更友好。

#### 第 5 步:`reallocate`(快、破坏性) 与 `resize`(慢、保留)

LearnCpp 把这两个写成不同的函数,因为它们在开销和保留性上做了不同取舍:

```cpp
#include <algorithm>  // for std::copy_n

// reallocate:销毁已有元素,快。
void reallocate(int newLength)
{
    erase();                                       // 先擦掉旧数据
    if (newLength <= 0) return;
    m_data   = new int[static_cast<std::size_t>(newLength)];
    m_length = newLength;
}

// resize:保留能装下的元素,慢。
void resize(int newLength)
{
    if (newLength == m_length) return;             // 啥都不用做
    if (newLength <= 0) { erase(); return; }       // 缩成空

    // 分配新存储,拷过能装下的部分,swap。
    int* data{ new int[static_cast<std::size_t>(newLength)] };
    if (m_length > 0)
    {
        int elementsToCopy{ (newLength > m_length) ? m_length : newLength };
        std::copy_n(m_data, elementsToCopy, data);
    }
    delete[] m_data;
    m_data   = data;
    m_length = newLength;
}
```

> 💡 **`std::copy_n(src, n, dst)`** — 跟 `std::copy` 一样,但接受一个数量而不是一对 `(src_begin, src_end)`。在你已知源长度时随便用。

#### 第 6 步:拷贝构造函数与拷贝赋值(Rule of Three)

因为我们管着一个裸指针(`m_data`),**隐式生成的拷贝构造函数** 会做浅拷贝 → 两个 `IntArray` 指向同一块缓冲 → 双重 delete UB。我们必须自己写 Rule of Three。

```cpp
// 用委派构造给新数组定大小,然后拷贝元素。
IntArray(const IntArray& a) : IntArray(a.getLength())
{
    std::copy_n(a.m_data, m_length, m_data);
}

IntArray& operator=(const IntArray& a)
{
    if (&a == this) return *this;        // 自赋值检查(Klefstad:基于地址)
    reallocate(a.getLength());           // 把目标缩放到合适大小
    std::copy_n(a.m_data, m_length, m_data);
    return *this;
}
```

> ⚠️ **Klefstad 风格** — 自赋值守卫用 **身份比较**(`&a == this`),不是 **内容比较**(`a == *this`)。身份比较只是一次指针对比;内容比较可能是 O(n),而且某些没定义 `operator==` 的类型还会失败。

#### 第 7 步:`insertBefore`、`remove` 与便捷包装

```cpp
void insertBefore(int value, int index)
{
    assert(index >= 0 && index <= m_length);  // <= 因为允许插在末尾

    int* data{ new int[static_cast<std::size_t>(m_length + 1)] };
    std::copy_n(m_data, index, data);                       // 前半
    data[index] = value;                                    // 新元素
    std::copy_n(m_data + index, m_length - index, data + index + 1);  // 后半,移位
    delete[] m_data;
    m_data = data;
    ++m_length;
}

void remove(int index)
{
    assert(index >= 0 && index < m_length);

    if (m_length == 1) { erase(); return; }   // 删最后一个 → 变空

    int* data{ new int[static_cast<std::size_t>(m_length - 1)] };
    std::copy_n(m_data, index, data);
    std::copy_n(m_data + index + 1, m_length - index - 1, data + index);
    delete[] m_data;
    m_data = data;
    --m_length;
}

// 便捷包装:
void insertAtBeginning(int value) { insertBefore(value, 0); }
void insertAtEnd      (int value) { insertBefore(value, m_length); }
```

> ⚠️ **`insertBefore` 和 `remove` 每次都重新分配。** 每次插/删都是 O(n)(还会带来内存抖动)。`std::vector` 用 `capacity()` 缓解了这一点 — 它预留多余空间,使大多数 `push_back` 都是 O(1)。一个生产级的容器也会这么做。

#### 第 8 步:测试

```cpp
#include <iostream>
#include "IntArray.h"

int main()
{
    IntArray array(10);
    for (int i{0}; i < 10; ++i) array[i] = i + 1;

    array.resize(8);
    array.insertBefore(20, 5);
    array.remove(3);
    array.insertAtEnd(30);
    array.insertAtBeginning(40);

    { // 拷贝/赋值测试
        IntArray b{ array };
        b     = array;
        b     = b;       // 自赋值(被身份检查接住)
        array = array;
    }

    for (int i{0}; i < array.getLength(); ++i)
        std::cout << array[i] << ' ';
    std::cout << '\n';
}
// Output: 40 1 2 3 5 20 6 7 8 30
```

### 2.6 还少了什么

LearnCpp 23.6 末尾列了一串 STL 有但我们的 `IntArray` 还没有的改进:

- 做成 **模板类** 让它能装任何可拷贝的元素类型 — `IntArray` 变成 `Array<T>`。(Topic 9 PPT slide 10 的 "Template Class `Array`" 说的就是这个。)
- 给每个不修改对象的成员函数加 **`const` 重载**,让它在 `const IntArray` 上也能用。
- 加 **移动语义**(移动构造函数、移动赋值 — Week 4 / Rule of Five)。
- `resize`/`insert` 时,移动元素而不是拷贝。

> 💡 **进阶(LearnCpp 的 "For advanced readers")**
> - 只在元素的移动构造是 **`noexcept`** 时才移动;否则拷贝。这就是 `std::move_if_noexcept` 干的事。
> - 提供 **强异常安全保证**:`resize`/`insert` 半路抛异常时,原数据完好。(见 LearnCpp 27.9 / 27.10。)

### 2.7 Klefstad 的总结:"能用 STL 就用 STL"

> 💡 **LearnCpp 23.6 收尾** — "如果标准库里的某个类能满足你的需要,优先用它,而不是自己造。比如,与其用 `IntArray`,你更该用 `std::vector<int>`。它经过实战检验、效率不错,而且和标准库其它类配合得很好。"

*构建* 一个容器的目的是理解契约,不是把它发布出去。写完 `IntArray` 之后,你就从内部理解了 `std::vector`。HW9 检验的就是这种理解。

---
## 3. `std::initializer_list`

> 对应 LearnCpp 23.7

`std::initializer_list` 是让你能给自己的类写 `MyClass x{1, 2, 3};` 的机制 — 就是和 `std::vector<int> v{1, 2, 3};` 一样的花括号初始化语法。

### 3.1 问题:`IntArray` 上的花括号初始化还不能用

内建数组可以直接接受花括号初始化:

```cpp
int array[]{ 5, 4, 3, 2, 1 };           // OK
auto* arr2{ new int[5]{ 5, 4, 3, 2, 1 } }; // OK,动态
delete[] arr2;
```

但第 2 节的 `IntArray` **不行**:

```cpp
IntArray array{ 5, 4, 3, 2, 1 };  // 错误:没有匹配的构造函数
```

不能编译,因为 `IntArray` 没有任何构造函数知道怎么处理这个花括号列表。没有它,只能构造后一个一个填 — 又啰嗦又乏味。

### 3.2 `std::initializer_list` 到底是什么

> 当编译器在某个需要选类型的上下文里看到一个花括号包起来的 `{1, 2, 3, ...}` 时,它会构造一个临时的 **`std::initializer_list<T>`** 对象,作为这些值的一个轻量视图。

几个重要事实(LearnCpp 23.7):

1. 它住在 `<initializer_list>` 头文件里。
2. 你几乎总会看到带显式元素类型的写法:`std::initializer_list<int>`、`std::initializer_list<std::string>` 等。光秃秃的 `std::initializer_list` 很少见。
3. 它暴露 **`size()`** 成员函数(元素个数)和 **`begin()`/`end()`** 迭代器。
4. 它通常是 **按值传** 的,不是 `const&`。它本质上是一对 `(begin, end)` — 一个 *视图* — 类似 `std::string_view`。拷贝它很便宜,且永远不拷贝底下的元素。

> 💡 **心智模型:它是视图,不是容器**
> 跟 `std::string_view` 一样,`std::initializer_list` 不 *拥有* 任何东西;它指向调用者(编译器从 `{...}` 创建的临时数组)保活的存储。除非你确认底下的数组比调用更久,否则不要从函数里返回它。

### 3.3 加上构造函数 — 委派构造模式

```cpp
#include <algorithm>          // std::copy
#include <cassert>
#include <initializer_list>   // std::initializer_list
#include <iostream>

class IntArray
{
private:
    int  m_length {};
    int* m_data   {};

public:
    IntArray() = default;

    IntArray(int length)
        : m_length{ length },
          m_data{ new int[static_cast<std::size_t>(length)]{} }
    {}

    // 新构造函数:
    IntArray(std::initializer_list<int> list)
        : IntArray(static_cast<int>(list.size()))   // ← 委派给 IntArray(int)
    {
        std::copy(list.begin(), list.end(), m_data);
    }

    ~IntArray() { delete[] m_data; }

    IntArray(const IntArray&)            = delete;  // 防止浅拷贝
    IntArray& operator=(const IntArray&) = delete;

    int& operator[](int index)
    {
        assert(index >= 0 && index < m_length);
        return m_data[index];
    }
    int getLength() const { return m_length; }
};

int main()
{
    IntArray array{ 5, 4, 3, 2, 1 };   // 现在走新构造函数
    for (int i{0}; i < array.getLength(); ++i)
        std::cout << array[i] << ' ';  // 打印: 5 4 3 2 1
}
```

值得展开的几点:

- **必须写尖括号。** 参数类型是 `std::initializer_list<int>`,元素类型要拼出来。
- **按值传。** 比间接传更便宜,因为 list 本身就是个视图。
- **`list.size()` 返回 `size_t`**(无符号) — 我们 cast 成 `int` 喂给 `IntArray(int)`。
- **委派构造。** `IntArray(static_cast<int>(list.size()))` 先调 **另一个** `IntArray` 构造函数。那个分配 `new int[size]`。然后函数体用 `std::copy` 把 list 的元素拷进新分配的缓冲区里。

### 3.4 没有 `operator[]`!用 `begin()`

`std::initializer_list` 不提供 `operator[]`,所以你不能直接下标。两种常用替代:

```cpp
// 1. range-for
for (int x : list) { /* x 是一个元素 */ }

// 2. 通过 begin() 下标 — begin() 返回的是随机访问迭代器
for (std::size_t i{}; i < list.size(); ++i)
    m_data[i] = list.begin()[i];
```

> ⚠️ **为什么没有 `operator[]`?** "出于某种莫名其妙的原因,"LearnCpp 说,"`std::initializer_list` 没有通过下标访问元素的能力。这个遗漏多次被反映给标准委员会,但一直没修。"

### 3.5 List 初始化 **优先匹配** list 构造函数

这是 `std::initializer_list` 最大的坑。

```cpp
IntArray a1(5);    // 直接初始化 → IntArray(int)            → 5 个 0 的数组
IntArray a2{ 5 };  // 列表初始化 → IntArray(initializer_list) → 1 个值为 5 的元素
```

`a1` 和 `a2` 之间变了的只是 **怎么** 初始化的 — 圆括号 vs. 花括号 — 编译器据此做了完全不同的选择。

> 💡 **关键洞察(LearnCpp)**
> **列表初始化优先匹配 list 构造函数,而不是非 list 构造函数。**

同样的规则适用于 `std::vector`(以及所有既有 list 构造又有 size 构造的容器):

```cpp
std::vector<int> v1(5);    // 5 个值初始化的 0:0 0 0 0 0
std::vector<int> v2{ 5 };  // 一个值为 5 的元素
```

> ⚠️ **最佳实践(LearnCpp)** — 初始化带 list 构造函数的容器时:
> - 想调 **list 构造函数**(初始化值是元素)用 **花括号** 初始化。
> - 想调 **非 list 构造函数**(初始化值不是元素 — 比如 size 或别的构造参数)用 **直接(圆括号)** 初始化。
>
> 这也是我们上面的委派构造写成 `: IntArray(static_cast<int>(list.size()))` 用圆括号的原因 — 如果用花括号,委派又会去找 list 构造函数,造成无限委派 / 编译错误。

### 3.6 给已有的类加 list 构造函数会破坏旧代码

```cpp
class Foo {
public:
    Foo(int, int) { std::cout << "Foo(int, int)\n"; }
};

Foo f1{ 1, 2 };  // 打印 "Foo(int, int)"
```

现在给类加一个 list 构造函数:

```cpp
class Foo {
public:
    Foo(int, int) { std::cout << "Foo(int, int)\n"; }
    Foo(std::initializer_list<int>) { std::cout << "Foo(initializer_list)\n"; }
};

Foo f1{ 1, 2 };  // 现在打印 "Foo(initializer_list)" — 悄无声息地!
```

> ⚠️ **警告(LearnCpp)** — **给一个原本没有 list 构造函数的已有类加 list 构造函数,可能破坏已有程序。** 所有之前用花括号匹配到非 list 构造的调用点,现在会无声地匹配到新的 list 构造。没有编译错误告诉你这件事。

### 3.7 列表赋值 — 以及悬空指针陷阱

`std::initializer_list` 也能用来实现 *赋值*:

```cpp
IntArray a;
a = { 1, 3, 5, 7, 9, 11 };  // 我们希望这种写法可用
```

但是,如果你只给出了 list **构造函数** 而没有 list **赋值**,编译器会做一件危险的事:

1. 它找不到接受 `initializer_list` 的 `operator=` → 去看其它重载。
2. 它找到隐式生成的拷贝赋值运算符(`IntArray& operator=(const IntArray&)`)。
3. 为了匹配它,编译器用你的 list 构造函数从 `{ 1, 3, 5, ... }` 构造出一个 **临时 `IntArray`**。
4. 调用隐式拷贝赋值,把临时对象的 `m_data` 指针 **浅拷贝** 到 `a`。
5. 赋值语句结束时临时对象销毁,`delete[]` 了那块缓冲。
6. `a.m_data` 现在悬空。下次访问 `a` 就是 UB。

> ⚠️ **最佳实践(LearnCpp)** — 如果你提供了 list 构造,**也提供 list 赋值**(或把拷贝赋值删掉)。
>
> 如果你实现了一个接受 `std::initializer_list` 的构造函数,至少做以下一件:
> 1. 提供一个 list 赋值运算符重载。
> 2. 提供一个正确的深拷贝赋值运算符。
> 3. 删掉拷贝赋值运算符(上面的 `IntArray` 这么做了)。

### 3.8 LearnCpp 23.7 Quiz 的完整答案

```cpp
IntArray& operator=(std::initializer_list<int> list)
{
    int length{ static_cast<int>(list.size()) };
    if (length != m_length)                       // 需要时调整大小
    {
        delete[] m_data;
        m_length = length;
        m_data   = new int[list.size()]{};
    }
    std::copy(list.begin(), list.end(), m_data);  // 覆盖内容
    return *this;
}
```

这就行了,因为我们按需调整大小,然后逐元素深拷贝 — 没有浅指针拷贝,没有悬空。

### 3.9 Python → C++ 快速对照

| | Python | C++ |
|---|---|---|
| 来源 | `x = [1, 2, 3]` 是 **list 字面量** | `auto x = std::initializer_list<int>{1, 2, 3};`(少见) 或更常见的 `MyClass x{1, 2, 3};` |
| 类型 | 一个 `list` 类型,什么都能装 | 静态类型;`initializer_list<int>` 不接受字符串 |
| 所有权 | list 拥有元素(引用计数) | `initializer_list` 是视图;底层数组是编译器管理的临时对象 |
| 可变性 | list 可变 | `initializer_list` 元素是 `const` — 能读不能改 |

---

## 4. `assert` 与 `static_assert`

> 对应 LearnCpp 9.6。PPT 没有专门讲 `assert` 的幻灯片,但 *Topic 9* 的代码里到处都是(比如 `IntArray` 构造里的 `assert(length >= 0)`)。

### 4.1 前置条件、不变式、后置条件

这三个词描述一个函数的契约:

| 术语 | 何时必须成立 | 例子 |
|---|---|---|
| **前置条件** | 一段代码(通常是函数体)开始前 | `x / y` 之前的 `assert(y != 0)` |
| **不变式** | 一段代码执行过程中(常在循环里,或对一个类对象的整个生命周期) | 平衡 BST 在每次插入后仍然平衡 |
| **后置条件** | 一段代码结束之后 | 永不返回负数的函数末尾的 `assert(result >= 0)` |

前置条件最好放在函数 **开头**,用 **early return**("bouncer 模式")在不满足时立即退出:

```cpp
void printDivision(int x, int y)
{
    if (y == 0)
    {
        std::cerr << "Error: Could not divide by zero\n";
        return;                       // 把调用者直接弹出
    }
    // 这之后保证 y != 0。
    std::cout << static_cast<double>(x) / y;
}
```

> 💡 **bouncer 模式(LearnCpp)** 有两个好处:
> 1. 所有测试用例都摆在前面,跟错误处理代码挨在一起。
> 2. 正常路径上嵌套更少。
>
> 反过来的写法 — `if (good) { do work } else { handle error; return; }` — 严格更糟,因为它把错误处理挪离你发现错误的地方,而且增加了嵌套。

> 💡 **类不变式** 是后面的话题(Ch. 14.2):某个对类对象始终成立的条件(比如 `std::set` 的 "元素始终有序")。每个成员函数都必须维护这个不变式。

### 4.2 什么是 assertion?

**断言(assertion)** 是一个除非有 bug 否则应当为 `true` 的表达式。

- 为真 → assert 什么都不做,程序继续。
- 为假 → 打印一条错误信息,然后通过 `std::abort()` 终止程序。

打印的信息一般包括失败的表达式文本、源文件名、行号。这让断言成为极好的调试工具。

> 💡 **关键洞察(LearnCpp)** — **断言用来在开发和调试期间检测错误。** 断言失败时程序立刻停下,给你机会接上调试器查看状态。没有断言,坏值会悄悄传下去,在很远的地方崩溃 — 调试起来痛苦得多。

### 4.3 怎么用 `assert`

```cpp
#include <cassert>   // 为 assert()
#include <cmath>     // 为 std::sqrt
#include <iostream>

double calculateTimeUntilObjectHitsGround(double initialHeight, double gravity)
{
    assert(gravity > 0.0);   // 前置条件

    if (initialHeight <= 0.0)
        return 0.0;          // 已经在(或低于)地面

    return std::sqrt((2.0 * initialHeight) / gravity);
}

int main()
{
    std::cout << "Took "
              << calculateTimeUntilObjectHitsGround(100.0, -9.8)
              << " second(s)\n";
}
```

运行会打印类似:

```
dropsimulator: src/main.cpp:6: double calculateTimeUntilObjectHitsGround(double, double): Assertion 'gravity > 0.0' failed.
```

> 💡 **关键洞察(LearnCpp)** — **断言比注释好**,因为它既 *记录* 又 *强制* 一个条件。注释可能跟代码脱节;一个跟代码不一致的断言本身就是 bug,开发者会去修。

### 4.4 让断言信息自己说话

朴素的 `assert(found);` 给出的信息很神秘:

```
Assertion failed: found, file C:\...Test.cpp, line 34
```

技巧:把条件跟一个字符串字面量 AND 一下。字符串字面量永远是 `true`,所以 `cond && "message"` 的真值跟 `cond` 一致:

```cpp
assert(found && "Car could not be found in database");
```

现在失败信息里也带了说明:

```
Assertion failed: found && "Car could not be found in database", file ..., line 34
```

同样的技巧也能标记没实现的分支:

```cpp
assert(moved && "Need to handle case where student was moved to another classroom");
```

如果有谁跑到这条路径,失败的 assert 就把还没做的事写明白了。

### 4.5 `NDEBUG` — Release 构建里关掉 assert

每个 `assert` 都有一点运行时开销。Release 构建假设代码已经测试过了,assert 就不必要了。C++ 提供了一个内建开关:

> **如果预处理宏 `NDEBUG` 被定义,`assert` 宏就会被禁用。**

大多数 IDE(Visual Studio 等)在 **Release** 配置下自动定义 `NDEBUG`,**Debug** 不定义。结果:断言在开发期捕 bug,然后在生产里悄悄退场。

> 💡 **提示(LearnCpp)** — 为了测试,你可以通过在 **任何 `#include` 之前** 写下面之一来在 **一个翻译单元** 里启用或禁用 assert:
> ```cpp
> #define NDEBUG   // 在这里禁用 assert
> #undef  NDEBUG   // 在这里强制启用 assert
> #include <cassert>
> ```
> 这一行末尾不要写分号。

### 4.6 `static_assert` — 编译期检查

```cpp
static_assert(condition, "diagnostic message");   // C++11
static_assert(condition);                          // C++17,消息可选
```

`static_assert` 由 **编译器** 检查。如果 `condition` 为假,编译器报错并显示你的消息;编译失败。

```cpp
static_assert(sizeof(long) == 8, "long must be 8 bytes");
static_assert(sizeof(int)  >= 4, "int must be at least 4 bytes");

int main() { return 0; }
```

在 `long` 是 4 字节的机器上,编译失败,显示类似:

```
error C2338: long must be 8 bytes
```

重要性质(LearnCpp 9.6):

- 条件必须是 **常量表达式** — 编译器能在编译期求值。`sizeof`、`constexpr` 变量、`consteval` 调用都满足;带运行时数据的函数调用不行。
- `static_assert` 是 **关键字**,不是宏,所以不用任何头文件。
- `static_assert` **不会** 被 `NDEBUG` 关掉 — 它是编译期检查,在两种配置下都没有运行时开销。
- 它可以出现 **任何地方** — 全局作用域、命名空间作用域、类体、函数体。

> ⚠️ **最佳实践(LearnCpp)** — **只要条件能在编译期求值,就优先用 `static_assert` 而不是 `assert()`。** 编译期错误更早被抓,保证被抓到(不会出现 "我忘了测试那条分支"),而且运行时零开销。

### 4.7 `assert` vs. 错误处理 — 何时用哪个

| | `assert` | 错误处理 |
|---|---|---|
| 检测什么 | **编程 bug** — 正确代码下永远不该发生的情况 | **预期内的运行时情况** — 错的用户输入、文件不存在、网络失败 |
| 是谁的错 | 程序员的 | 用户或环境的 |
| 恢复 | 不能 — 立即 `abort` | 通常可以 — 返回错误、抛异常、重试 |
| 运行时开销 | 低;Release 里消失 | 始终存在 |
| 能多用吗? | 能 — release 里没成本 | 只在必要处用;每个都有运行时和开发成本 |

有时你想 **两个都用**:

```cpp
double getInverse(double x)
{
    assert(x != 0.0);          // 在 debug 构建里抓 bug
    if (x == 0.0)
        // 用某种方式处理错误(例如抛异常)
        ;
    return 1.0 / x;
}
```

开发期,有调用者传 0,`assert` 立刻爆 — bug 很快定位。Release 里 `assert` 被编译掉,但 `if (x == 0.0)` 分支仍然在没测试到的路径上把这种情况优雅处理掉。

### 4.8 注意事项(LearnCpp 的 "一些 assert 限制与警告")

- **写得不好的 assert** 可能在不该爆时爆,或该爆时不爆 — 当心条件。
- **assert 表达式里不要有副作用。** 如果定义了 `NDEBUG`,整个 `assert(...)` 调用被预处理掉 — 包括表达式里要做的事。所以 `assert(++counter > 0);` 在 debug 和 release 之间会出现行为差异 bug。坏的写法:
  ```cpp
  assert(loadConfig() == 0);  // ⚠️ release 里 loadConfig() 永远不跑
  ```
  好的写法:
  ```cpp
  int result = loadConfig();
  assert(result == 0);
  ```
- **`abort()` 很粗暴。** 它直接终止进程,没机会跑析构、关文件、刷缓冲。如果你的程序在硬退时可能留下不一致的持久态(比如数据库写了一半),优先用错误处理。

---
## 5. 迭代器 — 更深入的视角

> 对应 LearnCpp 18.2 + Topic 8 PPT slides 11–13(基本迭代器操作 + "ZZZ Activity: Linked List Iterator")

Week 8 把迭代器作为容器和算法之间的连接组织介绍了一下。Week 9 的阅读更深入:**迭代器到底是什么**、**怎么自己写一个**(HW9 的 `SetList` 和 `MapArray` 都需要)、**迭代器失效是怎么回事**。

### 5.1 遍历容器的各种姿势

在认真定义迭代器之前,LearnCpp 18.2 提醒你 *已经* 见过的所有姿势:

```cpp
#include <array>
#include <cstddef>
#include <iostream>

int main()
{
    std::array arr{ 0, 1, 2, 3, 4, 5, 6 };       // C++17 CTAD: std::array<int, 7>
    std::size_t length{ std::size(arr) };

    // 1. 带显式下标的 while 循环
    std::size_t index{ 0 };
    while (index < length)
        std::cout << arr[index++] << ' ';
    std::cout << '\n';

    // 2. 带显式下标的 for 循环
    for (index = 0; index < length; ++index)
        std::cout << arr[index] << ' ';
    std::cout << '\n';

    // 3. 用指针算术的 for 循环
    for (auto ptr{ &arr[0] }; ptr != (&arr[0] + length); ++ptr)
        std::cout << *ptr << ' ';
    std::cout << '\n';

    // 4. range-based for 循环
    for (int i : arr)
        std::cout << i << ' ';
    std::cout << '\n';
}
```

每种形式都有限制:

- **基于下标**(形式 1 和 2) — 只对支持 `[]` 的容器有效(`vector`、`array`、`deque`、`string`);对 `list`、`set`、`map` 没用。
- **指针算术**(形式 3) — 只在元素连续存储时有效(数组、vector)。对节点分散的 `list`、`set`、`map` 没用。
- **range-based for**(形式 4) — 对 **任何有 `begin()` 和 `end()`** 的东西都有效(或 `std::begin`/`std::end` 知道的东西)。背后机制是什么?

> 💡 **背后机制就是迭代器。** range-based for 是 `for (auto it = c.begin(); it != c.end(); ++it) { auto&& x = *it; ... }` 的语法糖。

> 💡 **对非连续结构,指针也能当迭代器**(LearnCpp 的 "For advanced readers"):链表里,每个节点有 `next` 指针;你可以靠跟着这条链遍历。即便没有算术,指针也能扮演迭代器的角色 — `++` 变成 `p = p->next`。Klefstad HW9 的前向迭代器(第 14 节)就是这样。

### 5.2 迭代器是什么

> **迭代器是被设计来遍历容器,并提供逐元素访问的对象。**

容器可能提供多种迭代器(正向、反向、const 等等),但每种迭代器都遵守同一套接口约定:

- `operator*` — 解引用得到当前元素
- `operator++` — 推进到下一个元素
- `operator==` / `operator!=` — 比较两个迭代器(主要用来 "我到 `end()` 了吗")

一旦你认同这套接口,**就能用一致方式迭代任何容器**,不管它内部是什么数据结构。这就是 STL 能 scale 的全部原因:基于迭代器把算法写一次,它就在每个提供迭代器的容器上都能用。

### 5.3 最简单的迭代器:指针

裸指针已经支持 `*`、`++`、`==`、`!=`。所以 `T*` *就是* `T[]` 数组的迭代器:

```cpp
#include <array>
#include <iostream>

int main()
{
    std::array arr{ 0, 1, 2, 3, 4, 5, 6 };

    auto begin{ &arr[0] };
    auto end  { begin + std::size(arr) };   // 末尾的下一个

    for (auto ptr{ begin }; ptr != end; ++ptr)
        std::cout << *ptr << ' ';
    std::cout << '\n';
}
// Output: 0 1 2 3 4 5 6
```

> ⚠️ **微妙的 bug** — 你可能会写
> ```cpp
> int* end{ &arr[std::size(arr)] };   // ⚠️ UB
> ```
> 这是未定义行为,因为 `arr[std::size(arr)]` *解引用* 了一个末尾后的元素(`[]` 等价 `*(arr + n)`)。改用:
> ```cpp
> int* end{ arr.data() + std::size(arr) };  // ✓
> int* end{ &arr[0]   + std::size(arr) };   // ✓
> ```
> 地址算术本身没问题;问题在那次解引用。

### 5.4 标准库迭代器:`begin()` / `end()`

每个标准容器都通过成员函数暴露这对迭代器:

```cpp
#include <array>
#include <iostream>

int main()
{
    std::array array{ 1, 2, 3 };

    auto begin{ array.begin() };
    auto end  { array.end()   };

    for (auto p{ begin }; p != end; ++p)
        std::cout << *p << ' ';
    std::cout << '\n';
}
// Output: 1 2 3
```

也有 **自由函数** `std::begin(c)` 和 `std::end(c)`:

> 💡 **提示(LearnCpp)** — C 风格数组的 `std::begin` / `std::end` 住在 `<iterator>` 里。STL 容器的住在容器自己的头里(`<array>`、`<vector>` 等) — 但你几乎从来不需要显式 `#include <iterator>`,因为容器头已经包过了。

```cpp
auto begin{ std::begin(array) };
auto end  { std::end  (array) };
```

> 💡 **为什么自由函数有用** — 它们对 **C 风格数组** 也能用:`int arr[5]; std::begin(arr); std::end(arr);` — 成员函数版自然不行(C 数组不是对象,没有成员)。

### 5.5 Klefstad PPT slide 11 — 迭代器 "类似数组指针算术"

Topic 8 PPT slide 11 讲得很简洁:

```cpp
vector<int> V = {9, 7, 5, 3, 1, 2, 4, 6, 8, 10};
for ( vector<int>::iterator p = V.begin(); p != V.end(); ++p )
    cout << *p << endl;
```

> 💡 **Klefstad 的说法** —
> - **对每个容器 `C` 都有定义**
> - **`C.begin()`** — 集合的开头
> - **`C.end()`** — 集合 **末尾的下一个**(半开区间约定)

### 5.6 迭代器循环里 `operator!=` vs. `operator<`

在用 `int` 下标的数值 `for` 循环里,LearnCpp 早期的约定(Ch. 8.10)优先用 `<`:

```cpp
for (int index = 0; index < length; ++index) ...
```

但对迭代器,**约定是 `!=`**:

```cpp
for (auto p = begin; p != end; ++p) ...
```

为什么?**有些迭代器类型不支持关系比较。** `std::list<T>::iterator`(节点指针)支持 `==`/`!=` 但不支持 `<`(两个链表节点指针 "小于" 是什么意思?)。`!=` 对所有迭代器类别都有效;`<` 只对随机访问迭代器有效。

> 💡 **为什么 `[begin, end)` 是半开?** 三个好处:
> 1. **长度就是 `end - begin`**,不用 "差一" 修正。
> 2. **空范围就是 `begin == end`** — 跟非空范围统一。
> 3. **`find` 返回 `end()` 表示 "没找到"** — 一个永远可用的哨兵。

### 5.7 range-based for ↔ 迭代器

range-based for 是基于 `begin()` / `end()` 的:

```cpp
for (int i : array) std::cout << i << ' ';
```

编译器在背后生成等价的:

```cpp
{
    auto&& __range = array;
    auto __begin = std::begin(__range);
    auto __end   = std::end  (__range);
    for (; __begin != __end; ++__begin)
    {
        int i = *__begin;
        std::cout << i << ' ';
    }
}
```

这就是为什么 **任何有 `begin()`/`end()` 的类型在 range-based for 里都能用** — 包括你自己写的(比如 HW9 的 `SetList`)。

> 💡 **`std::array` 在 range-based for 里能用,动态 C 数组不行。** 为什么?因为对一个退化为 `T*` 的裸数组,`std::end` 没法知道它的长度。类型信息丢了。

### 5.8 Klefstad PPT slide 12 — 迭代器操作 cheat sheet

来自 Klefstad Topic 8 PPT slide 12 的标准迭代器操作:

| 运算符 | 做什么 |
|---|---|
| `operator*` | 返回当前位置的元素 |
| `operator->` | 允许从当前元素选成员(例如 `it->name`) |
| `operator++` | 移到下一个 |
| `operator--` | 移到上一个 |
| `operator==` / `operator!=` | 比较两个迭代器(位置) |
| `operator=` | 把一个迭代器的位置赋给另一个 |

不是每种迭代器都支持所有运算符 — 这就是 **迭代器类别**(Week 8 已经讲过)。`forward_iterator` 有 `++` 但没 `--`;`random_access_iterator` 在这之上还有 `+`、`-`、`[]`。

### 5.9 Klefstad PPT slide 13 — "ZZZ Activity: Linked List Iterator"

> ⚠️ **"ZZZ Activity"** 是 Klefstad 的讲课信号,意思是 "这是后面会详细回到的东西" — 而 HW9 的 `SetList` 迭代器(第 14 节)正是这个。

slide 13 的设定:

```cpp
struct Node { char data; Node * next; };

struct List {
    Node *head;
    struct iterator { /* ... */ };
    iterator begin();
    iterator end();
    // ...
};

List L;
// 1. 老派:裸指针遍历
for ( Node *p = L.head; p != nullptr; p = p->next )
    cout << p->data;

// 2. STL 风格:迭代器遍历
for ( List::iterator it = L.begin(); it != L.end(); ++it )
    cout << (*it).data;

// 3. range-based for(其实就是 #2 的糖)
for (auto e : L) cout << e;

// 迭代器长这样:
struct List::iterator {
    Node * ptr;
    operator->();
    operator *();
    // ... operator++(), operator==() 等等
};
```

> 💡 **Klefstad 的关键想法** — 你可以写一个 "**自定义指针**"(`struct iterator { Node* ptr; ... }`),它 *行为上* 像指向链表节点的指针,但加了运算符重载,让用户代码能像数组一样迭代这个链表。HW9 用的就是这一招。

> ⚠️ **链表 `end()` 应该返回什么** — 按约定,迭代器的 `ptr` 是 `nullptr`。这样 `it != L.end()` 就等价于 `it.ptr != nullptr`,跟裸指针循环的终止条件一致。

### 5.10 迭代器失效(LearnCpp 18.2 — 关键)

跟裸指针会悬空一样,**迭代器也可能指向已经被移走或销毁的存储**。我们说迭代器 **失效** 了。使用失效的迭代器是 UB。

容器的某些操作可能造成这种副作用。好的参考文档会列出哪些操作可能让迭代器失效(例如 [cppreference 上 `std::vector` 的迭代器失效表](https://en.cppreference.com/w/cpp/container/vector#Iterator_invalidation))。

#### 例 1:range-based for + 容器变动

```cpp
#include <vector>

int main()
{
    std::vector v { 0, 1, 2, 3 };

    for (auto num : v)
    {
        if (num % 2 == 0)
            v.push_back(num + 1);  // ⚠️ push_back 可能重新分配 → 让 range-for
                                   //    内部用的迭代器失效 → UB
    }
}
```

> ⚠️ **经典的 "一边迭代一边改" bug。** range-based for 用了 `v` 的一个隐藏迭代器;`push_back` 可能重新分配 `v` 的缓冲区,让那个迭代器悬空。

#### 例 2:`erase` 让被擦的迭代器(及其后的)失效

```cpp
#include <iostream>
#include <vector>

int main()
{
    std::vector v{ 1, 2, 3, 4, 5, 6, 7 };
    auto it{ v.begin() };
    ++it;                       // 现在指向 2
    std::cout << *it << '\n';   // 2

    v.erase(it);                // 擦掉 2 — `it` 现在失效

    ++it;                       // ⚠️ UB
    std::cout << *it << '\n';   // ⚠️ UB
}
```

#### 修法:`it = c.erase(it)` 习惯用法

`erase()` **返回被擦元素之后那个元素的迭代器**(如果擦的是最后一个就是 `end()`)。把它赋回去:

```cpp
auto it{ v.begin() };
++it;                                // 2
it = v.erase(it);                    // it 现在指向 3
std::cout << *it << '\n';            // 3,没有 UB
```

实际代码里这种模式到处都是 — 任何条件性擦除的循环都用得到。一般写法:

```cpp
for (auto it = c.begin(); it != c.end(); /* 这里不 ++ */)
{
    if (should_erase(*it))
        it = c.erase(it);            // erase 推进了 it
    else
        ++it;                        // 否则手动推进
}
```

> 💡 **C++20 替代** — `std::erase(c, value)` 和 `std::erase_if(c, predicate)` 帮你正确地写这个循环。

---

## 6. `std::iterator_traits`

> 对应 cppreference 上的 `std::iterator_traits` 页面。PPT 里 *Topic 9* slide 12(SetList iterator)和 slide 14(MapArray iterator)里隐式提到 — 两者都定义同样的五个 typedef(`iterator_category`、`value_type`、`pointer`、`reference`、`difference_type`)。

### 6.1 `iterator_traits` 解决什么问题

假设你写一个泛型算法 — 比如 `std::reverse` — 想让它对任何迭代器都能用。在里面你可能需要知道:

- 解引用得到什么类型?(`value_type`)
- 这个迭代器是什么类别?(`random_access`、`bidirectional`……) 这样你能挑最高效的算法
- `iter_end - iter_begin` 是什么类型?(`difference_type`)

如果你直接写 `typename Iter::value_type`,对那些把这些 typedef 暴露成自己嵌套类型的迭代器有效 — 但 **对裸指针无效**,因为 `int*` 没有 `int*::value_type`(指针是内建类型,不是类)。

`std::iterator_traits` 是 **统一接口**:

```cpp
typename std::iterator_traits<Iter>::value_type
```

对 **任何** 迭代器都有效 — 包括裸指针,因为标准库为 `T*` 和 `const T*` 提供了 **偏特化**。

### 6.2 这些 traits — 五(有时六)个 typedef

每个迭代器都必须(或应该)暴露:

| 成员类型 | 含义 |
|---|---|
| `difference_type` | 能表示 `iter1 - iter2` 距离的有符号整数类型 |
| `value_type` | 被迭代元素的类型(`*iter` 返回的类型,去掉引用) |
| `pointer` | 指向元素的指针类型(给 `operator->` 用) |
| `reference` | 元素引用类型(`*iter` 的实际返回类型) |
| `iterator_category` | **迭代器类别 tag** 之一(见下) |

(C++20 添加了可选的 `iterator_concept` 给迭代器 concept 系统用;HW9 不需要。)

### 6.3 迭代器类别 tag

`iterator_category` 必须是 `<iterator>` 里声明的下列 tag 类型之一:

| Tag | 能力 |
|---|---|
| `std::input_iterator_tag` | 单次读、单次遍历、`++` |
| `std::output_iterator_tag` | 单次写、单次遍历、`++` |
| `std::forward_iterator_tag` | 读/写、多次遍历、`++` |
| `std::bidirectional_iterator_tag` | forward + `--` |
| `std::random_access_iterator_tag` | bidirectional + `+`、`-`、`[]`、`<` |
| `std::contiguous_iterator_tag` (C++17) | random access + 内存连续 |

> 💡 **为什么要有类别** — 算法可以在编译期看 category 然后分派到高效实现。比如 `std::sort` 需要随机访问迭代器(它用 `[]` 和有界距离);`std::find` 只需要 input 迭代器。

### 6.4 为什么裸指针能用 — `T*` 偏特化

对任何指针 `T*`,标准库提供:

| 成员 | 对 `T*` 的定义 |
|---|---|
| `difference_type` | `std::ptrdiff_t` |
| `value_type` | `T`(C++20 里是 `std::remove_cv_t<T>`) |
| `pointer` | `T*` |
| `reference` | `T&` |
| `iterator_category` | `std::random_access_iterator_tag` |
| `iterator_concept`(C++20) | `std::contiguous_iterator_tag` |

也有单独的 `const T*` 偏特化(用于只读迭代),`pointer = const T*`、`reference = const T&`。

> 💡 **这能让你做什么** — 你可以写这样的泛型算法
> ```cpp
> template<class Iter>
> void my_reverse(Iter first, Iter last) {
>     typename std::iterator_traits<Iter>::difference_type n = std::distance(first, last);
>     for (--n; n > 0; n -= 2) { /* ... */ }
> }
> ```
> 然后对 `std::vector<int>::iterator`、`std::list<int>::iterator`、**以及** 裸 `int*` 都能调用 — `iterator_traits` 把它们统一起来。

### 6.5 cppreference 的 `my_reverse` 例子,走一遍

```cpp
#include <iostream>
#include <iterator>
#include <list>
#include <vector>

template<class BidirIt>
void my_reverse(BidirIt first, BidirIt last)
{
    typename std::iterator_traits<BidirIt>::difference_type n
        = std::distance(first, last);                            // ① "有多少?"

    for (--n; n > 0; n -= 2)
    {
        typename std::iterator_traits<BidirIt>::value_type tmp   // ② 元素类型
            = *first;
        *first++ = *--last;
        *last    = tmp;
    }
}

int main()
{
    std::vector<int> v{1, 2, 3, 4, 5};
    my_reverse(v.begin(), v.end());            // vector iterator
    for (int n : v) std::cout << n << ' ';
    std::cout << '\n';

    std::list<int> l{1, 2, 3, 4, 5};
    my_reverse(l.begin(), l.end());            // list iterator
    for (int n : l) std::cout << n << ' ';
    std::cout << '\n';

    int a[]{1, 2, 3, 4, 5};
    my_reverse(a, a + std::size(a));           // 裸指针(!) — 靠 T* 偏特化能用
    for (int n : a) std::cout << n << ' ';
    std::cout << '\n';
}
// 5 4 3 2 1
// 5 4 3 2 1
// 5 4 3 2 1
```

同一个 `my_reverse` 模板在三种完全不同的迭代器类型上都能用 — `vector::iterator`、`list::iterator` 和裸 `int*` — 因为 `iterator_traits` 对 "value 类型是什么、difference 类型是什么" 给出了统一答案。

注释掉的一行也很说明问题:

```cpp
// std::istreambuf_iterator<char> i1(std::cin), i2;
// my_reverse(i1, i2);   // 编译错误:input 迭代器只支持 ++,不支持 --
```

那个会失败,因为 input 迭代器不支持 `--`,而 `my_reverse` 调用了 `--last`。模板实例化时编译器抓出这个不匹配。

### 6.6 你自己的迭代器要声明什么(HW9 用)

如果你要自己写迭代器并希望它和 STL 算法配合,必须暴露所有五个 traits。Klefstad *Topic 9 PPT slide 12*(SetList iterator)和 slide 14(MapArray iterator)正是这么做的:

```cpp
struct iterator {
    // 五个必需 traits:
    using iterator_category = std::forward_iterator_tag;   // 或 random_access_iterator_tag
    using value_type        = SetList::value_type;
    using pointer           = value_type*;
    using reference         = value_type&;
    using difference_type   = std::ptrdiff_t;

    // 操作:
    iterator(ListNode* node);
    iterator operator++();
    bool     operator==(const iterator& other) const;
    bool     operator!=(const iterator& other) const;
    reference operator*() const;

private:
    ListNode* current;
};
```

如果你提供了这些 typedef,**`std::iterator_traits<your_iterator>::value_type` 等就会自动可用**,因为主模板会从迭代器类型本身提取 typedef。

> 💡 **`std::ptrdiff_t`** — 足以表示任意指针差的有符号整数类型。住在 `<cstddef>`。在现代系统上几乎总是 64 位。

> ⚠️ **C++17 起被弃用**:继承 `std::iterator<…>` 来 "获得" 这些 typedef。别用。手写 typedef — slide 12 和 14 就是这么做的。

---
## 7. 智能指针与移动语义 — 整体图景

> 对应 LearnCpp 22.1 + Topic 9 PPT slide 5

### 7.1 动机问题:裸指针会泄漏

考虑:

```cpp
void someFunction()
{
    Resource* ptr = new Resource();
    // ... 用 ptr 做点事 ...
    delete ptr;
}
```

看起来没问题 — 直到你加一个 early return 或抛出异常:

```cpp
void someFunction()
{
    Resource* ptr = new Resource();
    int x;
    std::cin >> x;
    if (x == 0)
        return;                  // ⚠️ ptr 永远不被 delete → 泄漏
    // ...
    delete ptr;
}
```

```cpp
void someFunction()
{
    Resource* ptr = new Resource();
    int x;
    std::cin >> x;
    if (x == 0)
        throw 0;                 // ⚠️ ptr 永远不被 delete → 泄漏
    // ...
    delete ptr;
}
```

根本原因:**裸指针变量没有自带清理机制**。如果控制流在 `delete` 之前离开函数,堆内存就漏了。

### 7.2 RAII 洞察

> 类有析构函数,在对象出作用域时自动运行。如果我们把指针包在一个析构里 delete 它的类里,我们就 **免费** 拿到清理。

这是 **RAII**(Resource Acquisition Is Initialization,来自 LearnCpp 19.3)的核心思想。在构造函数里获取的资源 — 堆内存、文件句柄、网络套接字 — 在析构函数里释放。局部对象总会析构,资源就总会释放。

### 7.3 第一稿:手写智能指针

LearnCpp 22.1 展示了一个最小 "拥有式指针" 类长什么样:

```cpp
#include <iostream>

template <typename T>
class Auto_ptr1
{
    T* m_ptr{};
public:
    Auto_ptr1(T* ptr = nullptr) : m_ptr(ptr) {}
    ~Auto_ptr1() { delete m_ptr; }                 // ← 魔法:析构里清理

    T& operator*()  const { return *m_ptr; }
    T* operator->() const { return  m_ptr; }
};

class Resource {
public:
    Resource()  { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource destroyed\n"; }
};

int main()
{
    Auto_ptr1<Resource> res(new Resource());   // ← 不用手动 delete
    return 0;
} // res 出作用域 → ~Auto_ptr1 → delete m_ptr → ~Resource
```

输出:

```
Resource acquired
Resource destroyed
```

> 💡 **定义** — **智能指针** 是一个组合类,管理一个动态分配的资源,并确保智能指针出作用域时资源被删除。(裸指针因此有时被称为 "**笨指针**"。)

如果 7.1 的 `someFunction` 用 `Auto_ptr1` 替代裸指针,即便 early return 或异常,泄漏也消失了:

```cpp
void someFunction()
{
    Auto_ptr1<Resource> ptr(new Resource());
    int x;
    std::cin >> x;
    if (x == 0) return;          // ptr.~Auto_ptr1() 仍然跑,释放 Resource
    ptr->sayHi();
}
```

### 7.4 关键缺陷 — 浅拷贝

`Auto_ptr1` 看起来挺好 — 直到你拷贝它:

```cpp
Auto_ptr1<Resource> res1(new Resource());
Auto_ptr1<Resource> res2(res1);   // 默认拷贝构造:浅拷贝!
// res1 和 res2 都指向同一个 Resource。
// 两者都出作用域时 → delete 在同一个指针上调了两次 → UB。
```

输出:

```
Resource acquired
Resource destroyed
Resource destroyed   ← 第二次 delete 是 UB;通常崩溃
```

按值把 `Auto_ptr1` 传给函数时也会撞到同样的问题。(回忆 Week 4 的 **Rule of Three**:如果你有裸指针 + 做 `delete` 的析构,你必须自己写拷贝构造和拷贝赋值。)

### 7.5 修拷贝问题的三个选项

1. **删掉拷贝。** 让 `Auto_ptr1` 不可拷贝。安全,但这样工厂函数没法返回它。
2. **深拷贝。** 让拷贝构造分配新的 `Resource` 并拷贝内容。安全,但拷贝违背了用指针的初衷(你本来是想 *共享* 对象,不是复制)。
3. **移动所有权。** "拷贝" `res1` 到 `res2` 时,把所有权转过去:`res2` 现在拥有资源,`res1` 留下空的。这就是 **移动语义**。

### 7.6 移动语义 — C++11 思想

> **移动语义**:类把所管理资源的所有权转移,而不是拷贝。

LearnCpp 22.1 的 `Auto_ptr2` 用 **非 const** 拷贝操作演示了这个想法(那时真正的移动构造/移动赋值还不存在)。两行关键代码:

```cpp
Auto_ptr2(Auto_ptr2& a)               // 带移动语义的拷贝构造 — 注意不是 const
{
    m_ptr   = a.m_ptr;                // 偷指针
    a.m_ptr = nullptr;                // ⚠️ 源置空 — 关键!
}

Auto_ptr2& operator=(Auto_ptr2& a)    // 带移动语义的拷贝赋值
{
    if (&a == this) return *this;
    delete m_ptr;                     // 先释放当前资源
    m_ptr   = a.m_ptr;                // 偷
    a.m_ptr = nullptr;                // 源置空
    return *this;
}
```

> ⚠️ **Klefstad 重点** — `a.m_ptr = nullptr` 这行(或 Week 4 String 作业里的 `other.buf = nullptr`)是任何移动实现里 **最容易错的一行**。忘了它,源的析构就会 delete 掉你刚转走的资源。

`Auto_ptr2` 测试程序的输出:

```
Resource acquired
res1 is not null
res2 is null
Ownership transferred
res1 is null
res2 is not null
Resource destroyed   ← 只有一次 Resource 生命周期,没有双重 delete
```

### 7.7 `std::auto_ptr` — 历史性的失败

C++98 发布了一个完全是上面这种设计的智能指针:**`std::auto_ptr`**。C++11 弃用,C++17 移除。失败的三个原因(LearnCpp 22.1):

1. **通过拷贝构造实现移动语义很危险。** 按值传 `std::auto_ptr` 会悄悄把所有权转移给函数;调用者没意识到自己的指针已经空了。然后他们解引用 → 崩溃。
2. **`auto_ptr` 永远用非数组 `delete`。** 用 `new int[10]` 构造一个,析构会调 `delete`(不是 `delete[]`) → UB。
3. **`auto_ptr` 跟 STL 容器/算法不兼容。** 标准库代码假设拷贝真的会做拷贝;`auto_ptr` 不会。

> 💡 **核心问题(LearnCpp)** — "在 C++11 之前,语言根本没有机制区分 **拷贝语义** 和 **移动语义**。用覆盖拷贝语义的方式实现移动语义,会带来奇怪的边界情况和无意 bug。"

C++11 正式加入了 **移动语义**(Week 4 讲过):右值引用、`&&`、`std::move`。现在我们可以同时有拷贝构造 *和* 移动构造,编译器根据源是左值还是右值挑对的。这让正确写 `std::unique_ptr` 和 `std::shared_ptr` 成为可能。

### 7.8 Klefstad PPT slide 5 — 智能指针全景

> Topic 9 PPT slide 5 总结:
> - **`shared_ptr<>`** — 允许多个指针 **共享** 同一对象。最后一个指针死亡或被移走时,堆对象被删除。
>   - 工厂:`auto sp = std::make_shared<int>(42);`,不要 `int* p = new int{42};`
> - **`unique_ptr<>`** — 强制 **不能有别的指针** 指向同一对象。`unique_ptr` 死亡时堆对象被删除。
>   - **删除拷贝构造和拷贝赋值。**
>   - 可以用 **`std::move()`** 转移指针。

C++11 在 `<memory>` 里加了四种智能指针:

| 智能指针 | 所有权模型 |
|---|---|
| `std::auto_ptr` | (C++17 移除) — 别用 |
| `std::unique_ptr` | 独占所有权;不可拷贝、可移动 |
| `std::shared_ptr` | 通过引用计数共享所有权;可拷贝、可移动 |
| `std::weak_ptr` | `shared_ptr` 的非拥有观察者(打破引用环) |

下面两节讲最常用的两种 — `unique_ptr` 和 `shared_ptr`。

---

## 8. `std::unique_ptr`

> 对应 LearnCpp 22.5 + Topic 9 PPT slides 5、6、8

### 8.1 核心思想

> `std::unique_ptr` 应该用来管理任何 **不被多个对象共享** 的动态分配对象。也就是说,`std::unique_ptr` 应该 **完全拥有** 它管理的对象。

性质:

- 住在 `<memory>` 里。
- **拷贝构造和拷贝赋值被删除** — 你不可能不小心复制所有权。
- **提供移动构造和移动赋值** — 用 `std::move` 转移所有权。
- 析构 `delete` 管理的对象(数组形式调 `delete[]`)。

### 8.2 基础例子

```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource()  { std::cout << "Resource acquired\n";  }
    ~Resource() { std::cout << "Resource destroyed\n"; }
};

int main()
{
    std::unique_ptr<Resource> res{ new Resource() };
    return 0;
} // res 出作用域 → Resource 被删除
```

输出:

```
Resource acquired
Resource destroyed
```

> ⚠️ **智能指针放在栈上,永远别放堆上。** 把 `unique_ptr` 放堆上违背了它的初衷 — *你* 还得记得 delete 那个 `unique_ptr` 本身,你本来想解决的泄漏问题就又出现了。智能指针要么是局部变量,要么是类的数据成员。

### 8.3 移动语义 — 拷贝被禁用

```cpp
#include <iostream>
#include <memory>
#include <utility>     // std::move

int main()
{
    std::unique_ptr<Resource> res1{ new Resource{} };
    std::unique_ptr<Resource> res2{};

    std::cout << "res1 is " << (res1 ? "not null\n" : "null\n");
    std::cout << "res2 is " << (res2 ? "not null\n" : "null\n");

    // res2 = res1;                 // ❌ 编译不过:拷贝赋值被删除
    res2 = std::move(res1);          // ✓ 移动赋值 — res2 拿到所有权

    std::cout << "Ownership transferred\n";
    std::cout << "res1 is " << (res1 ? "not null\n" : "null\n");
    std::cout << "res2 is " << (res2 ? "not null\n" : "null\n");
}
```

输出:

```
Resource acquired
res1 is not null
res2 is null
Ownership transferred
res1 is null
res2 is not null
Resource destroyed     ← 只一次,在 res2 死亡时
```

> 💡 **转 bool**:`if (res)` 在 unique_ptr 拥有资源时为 `true`。解引用前一定要检查。

### 8.4 访问 — `*`、`->` 与 `get()`

```cpp
std::unique_ptr<Resource> res{ new Resource{} };

if (res)
    std::cout << *res << '\n';     // operator* → Resource&

if (res)
    res->doSomething();            // operator-> → Resource*
```

如果你要把裸指针传给不懂智能指针的旧代码,用 `.get()`:

```cpp
void useResource(const Resource* p) { if (p) std::cout << *p; }

auto ptr = std::make_unique<Resource>();
useResource(ptr.get());            // ✓ ptr 保留所有权
```

### 8.5 数组 — 支持(跟 `auto_ptr` 不一样)

```cpp
auto p = std::make_unique<int[]>(10);   // 10 个 int 的动态数组
p[0] = 1;
```

`unique_ptr` 的模板特化让它在数组形式下调 `delete[]` 而不是 `delete`。

> ⚠️ **最佳实践(LearnCpp 22.5)** — 比起用智能指针管理固定数组、动态数组或 C 风格字符串,更应该用 `std::array`、`std::vector` 或 `std::string`。容器类抽象更高、更好用。

### 8.6 `std::make_unique`(C++14) — 强烈推荐

```cpp
auto f1 = std::make_unique<Fraction>(3, 5);   // Fraction(3, 5) 在堆上,被 unique_ptr 持有
auto f2 = std::make_unique<Fraction[]>(4);    // 4 个默认构造的 Fraction
```

> ⚠️ **最佳实践(LearnCpp 22.5)** — **用 `std::make_unique()`,而不是自己用 `new` 构造 `std::unique_ptr`。** 更简单,少打字(不用重复类型名),跟 `auto` 配合也对。还能修一个微妙的异常安全 bug……

#### 异常安全问题(C++14 之前)

```cpp
some_function(std::unique_ptr<T>(new T),
              function_that_can_throw_exception());
```

编译器可以把它重排成:

1. `new T`
2. `function_that_can_throw_exception()`   ← 这里抛
3. (永远不到) `std::unique_ptr<T>(...)`

如果第 2 步抛,第 1 步分配的 `T` 因为没有 `unique_ptr` 接管而泄漏。`std::make_unique` 把分配和拥有打包成一个不可分割的操作:

```cpp
some_function(std::make_unique<T>(),
              function_that_can_throw_exception());   // 所有 C++ 版本都安全
```

> 💡 **C++17 修了** — 函数参数求值顺序现在有约束,这个 bug 消失了。但仍然推荐 `make_unique`,因为更清楚。

### 8.7 从函数返回 `unique_ptr`

```cpp
std::unique_ptr<Resource> createResource()
{
    return std::make_unique<Resource>();
}

int main()
{
    auto ptr = createResource();   // OK:移动(或 RVO/NRVO)
}
```

这能用,因为返回局部自动变量要么触发 **返回值优化**(unique_ptr 直接在调用方的存储里构造,不需要拷贝/移动),要么(退一步)触发一次 **移动**(`unique_ptr` 支持)。

> 💡 **最佳实践** — `unique_ptr` 按 **值** 返回,永远不要按指针或引用(引用会悬空;指针破坏初衷)。

### 8.8 把 `unique_ptr` 传给函数

你必须明确:你是在 *转移所有权* 还是只是 *借用对象*?

#### 转移所有权:按值传,搭配 `std::move`

```cpp
void takeOwnership(std::unique_ptr<Resource> res)
{
    if (res) std::cout << *res << '\n';
}   // res 在这里析构 → Resource 在这里释放

int main()
{
    auto ptr = std::make_unique<Resource>();
    takeOwnership(std::move(ptr));         // ✓ 所有权移入函数
    // ptr 现在是空的
}
```

#### 借用对象:传裸指针(通过 `.get()`)

```cpp
void useResource(const Resource* r) { /* 只读使用 */ }

auto ptr = std::make_unique<Resource>();
useResource(ptr.get());                    // 函数完全看不到智能指针
```

> 💡 **为什么传裸指针而不是 `unique_ptr&`?** 因为被调函数可能根本不关心调用者用没用智能指针。耦合低 → 更易复用。

### 8.9 `unique_ptr` 作为类成员

```cpp
class Owner {
    std::unique_ptr<Resource> m_res = std::make_unique<Resource>();
public:
    // 不用写析构!~Owner() 默认析构 m_res,m_res 删除 Resource。
};
```

这是 **RAII 红利**:如果每个拥有式指针成员都是 `unique_ptr`,你的类不需要自定义析构(Rule of Three/Five 缩成 "= default" 或 "= delete")。

### 8.10 常见误用(LearnCpp 22.5)

```cpp
Resource* res = new Resource();
std::unique_ptr<Resource> u1{ res };
std::unique_ptr<Resource> u2{ res };   // ⚠️ 两个都会 delete res → UB
```

```cpp
Resource* res = new Resource();
std::unique_ptr<Resource> u1{ res };
delete res;                            // ⚠️ unique_ptr 还会再删一次 → UB
```

`std::make_unique` 杜绝两种 — 它在内部分配,你根本拿不到那个裸指针去再做一个 `unique_ptr`。

### 8.11 Klefstad PPT slide 6 — `unique_ptr` 链表

这是 PPT 里最有教益的例子之一。每个 `next` 都是 `unique_ptr<Node>` 的链表:

```cpp
struct List {
    struct Node {
        int data;
        std::unique_ptr<Node> next;
    };
    std::unique_ptr<Node> head;

    ~List() {
        // 手动迭代销毁,避免递归 ~Node() 栈溢出
        while (head != nullptr) {
            auto next = std::move(head->next);
            head      = std::move(next);
        }
    }

    void push(int data) {
        // head = std::unique_ptr<Node>( new Node{data, std::move(head)} );
        head = std::make_unique<Node>( data, std::move(head) );
    }
};
// ⚠️ 用了 unique_ptr 的话,迭代器可能指不到我们的 list 上!!
```

需要展开的几点:

1. **`head` 拥有首节点;每个 `next` 拥有其余。** 因为每个 `Node` 恰好被一个 `unique_ptr` 持有,没有共享 — 完美契合 `unique_ptr` 的独占所有权模型。
2. **为什么手写析构?** 如果让默认析构跑,`~List()` 销毁 `head`,`head` 销毁 `head->next`,`head->next` 销毁 `head->next->next`……**递归**。一百万节点的链表会爆栈。手动 `while` 循环节点一个一个转移所有权,析构因此是 **迭代** 的。
3. **`push` 里的 `std::move(head)`** — 创建新 head 节点时,把当前 `head` 转移到新节点的 `next` 字段。移动后那个临时 `unique_ptr` 是空的,然后我们把新节点赋给 `head`。净效果:前插。
4. ⚠️ **Klefstad 在底部的警告**:"**用了 `unique_ptr` 的话,迭代器可能指不到我们的 list 上!!**" 为什么?因为迭代器通常存 `Node*` 或 `unique_ptr<Node>*`。如果存裸 `Node*`,你违反了 `unique_ptr` 的独占所有权不变式(同一个节点现在被多处访问 — `unique_ptr` 负责清理,迭代器负责遍历 — 但迭代器不能 delete)。契约被削弱。

跟用 `shared_ptr` 的同样链表(9.4)对比:没这种限制。

### 8.12 Python → C++ 对照

| 方面 | Python | C++ |
|---|---|---|
| 默认所有权 | 垃圾回收;每个引用都共享所有权 | 手动;裸指针等于没有所有权 |
| `unique_ptr` 等价物 | 没有直接对应;`weakref` 是反过来的(非拥有) | `std::unique_ptr<T>` |
| `shared_ptr` 等价物 | Python 引用大致都是 "共享" 的 | `std::shared_ptr<T>` |
| 清理 | 引用计数 + 环检测 | 析构函数(确定性、RAII) |

---

## 9. `std::shared_ptr`

> 对应 LearnCpp 22.6 + Topic 9 PPT slides 5、7、8

### 9.1 核心思想

`unique_ptr` 解决 **独占** 所有权;`std::shared_ptr` 解决 **多个智能指针共同拥有同一资源** 的情况。

- 内部,`shared_ptr` 维护一个 **引用计数** — 当前有多少 `shared_ptr` 指向这个资源。
- 计数 ≥ 1 时,资源活着。
- **最后一个** `shared_ptr` 被销毁(或重新赋值)时,计数变 0,资源被删除。

`shared_ptr` 住在 `<memory>`(跟 `unique_ptr` 同头)。

### 9.2 基础例子 — 共享有效

```cpp
#include <iostream>
#include <memory>

class Resource {
public:
    Resource()  { std::cout << "Resource acquired\n"; }
    ~Resource() { std::cout << "Resource destroyed\n"; }
};

int main()
{
    Resource* res{ new Resource };
    std::shared_ptr<Resource> ptr1{ res };
    {
        std::shared_ptr<Resource> ptr2{ ptr1 };   // 从 ptr1 拷贝构造
        std::cout << "Killing one shared pointer\n";
    }   // ptr2 死,计数 2→1,Resource 还活着

    std::cout << "Killing another shared pointer\n";
    return 0;
}   // ptr1 死,计数 1→0,Resource 被删除
```

输出:

```
Resource acquired
Killing one shared pointer
Killing another shared pointer
Resource destroyed
```

### 9.3 危险错误 — 独立的 `shared_ptr`

```cpp
Resource* res{ new Resource };
std::shared_ptr<Resource> ptr1{ res };       // ptr1 认为 count = 1
{
    std::shared_ptr<Resource> ptr2{ res };   // ⚠️ ptr2 独立从裸指针造 → 自己的 count = 1
    std::cout << "Killing one shared pointer\n";
}   // ptr2 死,它的 count → 0 → Resource 被删除(!)
std::cout << "Killing another shared pointer\n";
// ptr1 死,它的 count → 0 → Resource 又被删除一次 → UB
```

输出(然后崩溃):

```
Resource acquired
Killing one shared pointer
Resource destroyed
Killing another shared pointer
Resource destroyed       ← 第二次 delete,UB
```

为什么?每个 `shared_ptr` 有 **自己的控制块** — 一个动态分配的小记录,装引用计数等。当你 **独立** 用同一个裸指针构造两个 `shared_ptr` 时,每个都分配了自己的控制块,它们彼此不知道。

> ⚠️ **最佳实践(LearnCpp 22.6)** — 如果你需要不止一个 `shared_ptr` 指向同一资源,总是 **拷贝** 已有的 `shared_ptr`。拷贝正确地共享同一个控制块。

### 9.4 `std::make_shared` — 推荐(且更快)

```cpp
auto ptr1{ std::make_shared<Resource>() };   // 分配 Resource + 控制块(通常一次分配)
{
    auto ptr2{ ptr1 };                       // 拷贝 → 共享同一控制块,count = 2
}                                             // ptr2 死,count = 1
                                              // main 结束 ptr1 死,count = 0 → Resource 被删除
```

`make_shared` 是默认选择有两个原因:

1. **安全。** 你压根没有裸指针在作用域里,所以不可能从同一裸指针造两个独立的 `shared_ptr`。
2. **性能。** 直接构造 `shared_ptr` 会 **分别** 分配被管对象 **和** 控制块。`make_shared` 能把它们 **合成一次分配** — 少一次堆来回,缓存局部性更好。

### 9.5 内部 — 控制块

`shared_ptr` 内部实际上有 **两个** 指针:

| 指针 | 指向 |
|---|---|
| 被管对象指针 | 资源 |
| 控制块指针 | 堆分配的结构体,装:引用计数、弱计数、deleter、allocator |

拷贝 `shared_ptr` 时,**两个指针** 都被拷贝(很便宜),控制块里的 **计数被加 1**。`shared_ptr` 销毁时,计数减 1;到 0 时,控制块通知资源被删除。

> 💡 **为什么 `make_shared` 更快** — 单独 `new Resource` + 单独 `new ControlBlock` = 两次分配。`make_shared` 一次给两者切一块 → 一次分配。在大量创建 `shared_ptr` 的热点路径上,这有影响。

### 9.6 `unique_ptr` → `shared_ptr`(单向)

```cpp
std::unique_ptr<int> u = std::make_unique<int>(42);
std::shared_ptr<int> s = std::move(u);   // OK:特殊构造函数从 unique_ptr 移动
```

你 **不能** 安全地反过来转(一个 `shared_ptr` 可能有其它共有者;你不能单方面把所有权变独占)。

> 💡 **设计经验(LearnCpp 22.6)** — 如果你的工厂函数返回的所有权调用者后面可能想共享,返回 `unique_ptr`。调用者可以从中移动构造 `shared_ptr`。反过来 — 返回 `shared_ptr` — 是强制的:调用者从此被迫接受引用计数,管他想不想。

### 9.7 注意事项(LearnCpp 22.6)

- **任何一个 `shared_ptr` 处理不当都会泄漏资源。** 用 `unique_ptr` 只用担心一个智能指针。用 `shared_ptr`,你必须保证 **每个** 持有者都被正确销毁;哪怕一个被卡在被泄露的容器里,或被遗忘的堆对象持有,计数都到不了 0。
- **C++20 之前的数组支持不完整。** C++20 之前用 `std::shared_ptr<T[]>` 要带自定义 deleter;C++20 修好了标准语法。
- **引用环导致泄漏** — 如果 `A` 持有 `shared_ptr<B>` 而 `B` 持有 `shared_ptr<A>`,两边的计数都到不了 0。补救方法是 `std::weak_ptr`(不在 Week 9 阅读里,但 7.8 提了)。

### 9.8 Klefstad PPT slide 7 — `shared_ptr` 链表

```cpp
struct List {
    struct Node {
        int data;
        std::shared_ptr<Node> next;
    };
    std::shared_ptr<Node> head;

    void push(int data) {
        // head = std::shared_ptr<Node>( new Node{data, head} );
        head = std::make_shared<Node>( data, head );
    }
};
```

跟 `unique_ptr` 版(8.11)对比:

| | `unique_ptr` 版 | `shared_ptr` 版 |
|---|---|---|
| 存储 | `head` 和 `next` 都是 `unique_ptr<Node>` | `head` 和 `next` 都是 `shared_ptr<Node>` |
| 析构 | 需要手写迭代循环(避免递归栈溢出) | **默认** 就行 — 但很长的链表里递归析构仍可能爆栈 |
| `push` | `std::move(head)` 到新节点的 `next` | 直接 `head` — `shared_ptr` 拷贝增加引用计数 |
| 迭代器 | ⚠️ 不能共享节点指针,否则违反独占 | ✓ 迭代器可以持有 `shared_ptr<Node>` 或裸 `Node*` |

> 💡 **取舍**:
> - `unique_ptr` 更 **便宜**(没有原子计数,没有控制块),并且静态强制独占。
> - `shared_ptr` 更 **灵活**(迭代器没问题,你可以有多个 "句柄" 指向链表),但加了运行时开销(每次拷贝/析构都有原子计数操作)。

> ⚠️ **Klefstad 的 "用 unique_ptr 的话迭代器可能指不到我们的 list"** — 这正是为什么 HW9 的 `SetList` 内部用 **裸 `ListNode*`**,不是 `unique_ptr<ListNode>`。容器自己在析构里管清理;迭代器爱指哪指哪。

---

## 10. 设计使用 STL 的类(Klefstad 的 "Using STL")

> 对应 Topic 9 PPT slide 8。LearnCpp 没有直接对应章节;底层思想(Rule of Three/Five、`= default`/`= delete`)来自前面章节并被 22.1 加固。

Klefstad slide 8 对一个数据成员全是 "正经 STL 类型"(`std::string`、`std::vector`、`std::set`、`std::map` 等)的类提出了一系列问题:

### 10.1 如果你的类只用 STL 类型,你需要写什么?

> **构造函数、赋值、析构 — 这些里你需要写哪些?**

如果每个数据成员都是行为良好的值类型(没有裸指针,没有手动管理的资源),答案是:

- **默认构造**:通常可以隐式,除非你要把成员初始化成特定值。
- **析构**:可以隐式。编译器生成的析构按声明逆序调用每个成员的析构 — 而 `std::vector::~vector()`、`std::string::~string()` 等都会正确清理。
- **拷贝构造**:隐式 — 逐成员拷贝。每个成员自己的拷贝构造(`vector`、`string` 等的深拷贝)被调用。
- **拷贝赋值**:隐式 — 逐成员赋值。同样有效。
- **移动构造/赋值**:你不抑制就隐式(没有用户定义的 dtor/copy/move)。编译器生成逐成员移动。

### 10.2 默认是什么 — `= delete` 还是 `= default`?

> Klefstad slide 提了:"默认是什么?`= delete` 还是 `= default`?"

编译器的 "隐式" 生成可以提供默认或 *删除* 这个函数。当成员布局让默认不可能时(例如某个成员没有拷贝构造,或 `const` 成员不能赋值),它会删除。否则生成 `= default`。

你可以显式写 `= default` 或 `= delete` 来掌控。我们见过的例子:

```cpp
class Widget {
public:
    Widget() = default;                         // 显式 "给我隐式默认"
    Widget(const Widget&) = delete;             // 显式禁用拷贝
    Widget& operator=(const Widget&) = delete;
};
```

> ⚠️ **Rule of Zero** — 如果你的成员都是行为良好的值类型,什么特殊成员都不要写,让编译器处理一切。能做到这一点时,这是最干净、最易维护的设计。

### 10.3 指向堆存储的指针呢?(HW 4、5、6、7)

> Klefstad:"那指向堆存储的指针呢(HW4,5,6,7)?能用 shared_ptr 或 unique_ptr 吗?"

HW4(堆 String)、HW5(链表 String)、HW6(`Shape*` 容器 Picture)、HW7(继续扩展)里,数据成员是 **裸指针** — 因此适用 Rule of Three/Five,你手写了 3–5 个特殊成员。

**智能指针的答案**:把每个裸指针换成 `unique_ptr`(独占)或 `shared_ptr`(共享),特殊成员就缩成 `= default`,甚至消失:

```cpp
// 旧(HW6 Picture)
class Picture {
    Shape** shapes;
    int size;
    // Rule of Five: dtor、copy ctor、copy assign、move ctor、move assign
};

// 新(智能指针版)
class Picture {
    std::vector<std::unique_ptr<Shape>> shapes;
    // Rule of Zero!不需要特殊成员。
    // ~Picture() 销毁 vector,vector 销毁每个 unique_ptr,unique_ptr 删除每个 Shape。
};
```

> 💡 **Klefstad 的教学点** — 作业让你手写 Rule of Three 是因为你必须懂这个机制。懂了之后,实际代码里你用智能指针 + STL 容器,让编译器帮你写 Rule of Zero。

---
## 11. C++20 Ranges 与 Views

> 对应 Topic 9 PPT slides 2–4 + Topic 8 PPT slide 25。
> ⚠️ **跨周说明** — Topic 8 PPT slide 25 在 Week 8 "算法接受迭代器对" 思想里简短介绍了 ranges;Topic 9 用 views 和 LeetCode 实例展开。Week 9 阅读 **不显式** 覆盖 ranges(那一条在 Week 8 cheat-sheet 的 "前瞻" 里),但显然这个主题横跨 Week 8–9,为完整起见放在这里。

### 11.1 什么是 range?

> **range 就是一对 `(begin(), end())`**,被当成一个整体看。

每个 STL 容器都已经暴露了 `begin()` 和 `end()`,所以每个容器隐式都是一个 range。C++20 把这件事显式化了,并给算法提供把整个 range 当作一个参数的版本:

```cpp
// C++20 之前(仍然能用):
std::sort(v.begin(), v.end());

// C++20 range 重载:
std::ranges::sort(v);              // 更短、更不易错(不可能把 begin1 / end2 混了)
```

算法的 `std::ranges::*` 版本住在 `<algorithm>` 和 `<ranges>` 里。

### 11.2 什么是 view?

> **view 是轻量、非拥有的 range**,在你迭代它时惰性地转换或过滤另一个 range 的元素。

views 住在 `std::ranges::views` 里(经常缩写为 `std::views`)。它们 **可组合**:你用 `|` 把它们串起来,就像 Unix shell 管道。

> 💡 **两个关键性质**:
> - **惰性**:view 在你迭代之前什么都不算。`views::filter(...)` 不会循环遍历源;只有下一次 `*iter` 才做事。
> - **非拥有**:view 拷贝起来很便宜 — 它最多存一对 begin/end,不是数据本身。跟 `std::string_view` 和 `std::initializer_list` 一样。

### 11.3 Klefstad PPT slide 3 — `views::filter` 和 `views::transform`

```cpp
#include <vector>
#include <ranges>
#include <iostream>

vector<int> v = {1, 2, 3, 4};

// views::filter — 只保留满足谓词的元素
auto x = views::filter(v, [](int i) { return i % 2 == 0; });
for (int i : x)
    cout << i << ' ';        // 打印: 2 4

// views::transform — 对每个元素应用一个函数(惰性)
// 用 | 组合到前一个 view 上
auto y = x | views::transform([](int i) { return 2 * i; });
for (int i : y)
    cout << i << ' ';        // 打印: 4 8
```

发生了什么:

- `x` 是 `v` 上的一个 **view**,只产出偶数。迭代 `x` 时一步步走 `v`,跳过奇数。
- `y` 是 `x` *加* 一个 transform 组成的 view。迭代 `y` 时走 `x`(`x` 走 `v` 跳奇数),对每个幸存者乘 2。
- `v` **从未被修改** 也 **从未被拷贝**。所有工作都是惰性的。

`|` 语法从 "事情发生顺序" 上读是从右到左,但作为一个管道从左到右读很自然。

### 11.4 Klefstad PPT slide 4 — Ranges 例子(LC125 Valid Palindrome)

LeetCode 125 题:给一个字符串,忽略大小写和非字母数字字符,判断是否回文。

```cpp
bool is_palindrome(std::string const& s)
{
    auto v = s
        | views::filter   ([](char c){ return std::isalnum(c); })
        | views::transform([](char c){ return std::tolower(c); });

    return ranges::equal(v, views::reverse(v));
}
```

一步步:

1. **`s | views::filter(...)`** — `s` 上的 view,只产出字母数字字符。
2. **`| views::transform(...)`** — view,对每个幸存者小写化。
3. **`views::reverse(v)`** — view,逆序产出 `v` 的元素。
4. **`ranges::equal(v, views::reverse(v))`** — 当且仅当正序迭代 == 逆序迭代时为真。

> 💡 **为什么这很漂亮**:零分配,没有中间字符串,没有手写循环,没有下标差一。算法读起来跟英文规范一模一样。

> ⚠️ **编译器支持**:ranges 需要 C++20 和较新的编译器版本。确保你的构建用 `-std=c++20`(或 `c++2a`)。

### 11.5 PPT slide 2 — ranges 在 `std::ranges`,views 在 `std::ranges::views`

> Topic 9 PPT slide 2 浓缩:
> - **ranges** 是 `begin() .. end()`
> - 算法定义在 **`std::ranges`**(例如 `std::ranges::sort`、`std::ranges::find`)
> - **views** 是轻量 range
> - view 操作在 **`std::ranges::views`**(常被别名为 `std::views`)
> - views 用 **`|` 组合**
> - 教程链接:[hannes.hauswedell.net/post/2019/11/30/range_intro](https://hannes.hauswedell.net/post/2019/11/30/range_intro/)(PPT 里)

### 11.6 `<ranges>` 里有什么(选粹)

| View | 产出什么 |
|---|---|
| `views::filter(pred)` | `pred` 返回真的元素 |
| `views::transform(fn)` | 每个元素被 `fn` 处理后的结果 |
| `views::take(n)` | 前 n 个元素 |
| `views::drop(n)` | 除前 n 个之外的元素 |
| `views::reverse` | 逆序元素 |
| `views::iota(a, b)` | 整数 a、a+1、…、b-1(生成式,无存储) |
| `views::keys` / `views::values` | 每个 `pair` 的 first/second(例如给 `std::map` 用) |
| `views::split(delim)` | 按分隔符切 range |
| `views::join` | 把 range 的 range 摊平 |

> 💡 **`std::ranges::sort(v)`** 是 *饥饿* 的 — 它会修改 `v`。对比 `views::reverse(v)`,它是 *惰性* 的,创建一个非拥有 view。算法饥饿,view 惰性。

---

## 12. HW9 — 实现 `SetList` 与 `MapArray` 容器

> 对应 Topic 9 PPT slides 9、11。
> ⚠️ **这是 HW9 规范材料 — Klefstad 特有,LearnCpp 没有。**

### 12.1 递进开发计划(PPT slide 9)

Klefstad 给 HW9 立下了一套谨慎的工作流。仔细读 — 严格按顺序走能避免大多数痛苦的调试。

```
1. 从 HW8 能跑的 "mapset" 程序开始(用过 std::set 和 std::map)。
2. 写 SetList 容器 + 前向迭代器(这是你的第一块新代码)。
3. 用简单测试用例(gtest)测 SetList。
4. 改 mapset:把 std::set 换成 SetList。
   • 让编译器告诉你 SetList 还缺哪些方法。
5. 测改完的 mapset,直到完全能跑。
6. 现在把 SetList → std::set 改回去,把 std::map 换成 MapArray。
   • 同思路:对着不完整 MapArray 编译,修缺的部分。
7. 重复测试,直到 mapset 在 MapArray 下也能跑。
8. 最后,同时用 SetList 和 MapArray。再测一次。
9. autograder 还会跑更多 SetList 和 MapArray 的 gtest。
```

> 💡 **Klefstad 的教学法** — 你独立地写每块,一次插一块,让编译器错误指引你缺啥。不要试着把 `SetList` 和 `MapArray` 从零都写完然后 "看能不能编过" — 同时调两个新组件能吃掉好几个小时。

> ⚠️ **"mapset" 是什么** — HW8 那个 `map<key, set<value>>` 风格的小程序的简称(看版本可能叫 "word-frequency" 或 "inverted-index")。重点:你已经有一个 *能跑* 的测试架构,它唯一的工作就是练 `set` 和 `map`。

### 12.2 最简单的容器 — Klefstad 的 `Array.cpp`

PPT slide 10("Template Class Array — 最简单容器的完整例子 — 包装 C 数组 — Array.cpp")指的是 Klefstad 课上展示的一份示例文件。概念上是 LearnCpp `IntArray`(第 2 节)的模板化版本:

```cpp
template <typename T>
class Array {
    T*  data{};
    int length{};
public:
    Array() = default;
    Array(int n) : data{ new T[n]{} }, length{ n } {}
    ~Array() { delete[] data; }

    Array(const Array&)            = delete;
    Array& operator=(const Array&) = delete;

    T&  operator[](int i)         { return data[i]; }
    int size() const              { return length;  }
};
```

这是 *基地*。从这里向两个方向扩展:

- 加迭代器、拷贝构造等 → 得到 `std::vector` 风格的顺序容器。
- 在链表之上加唯一键语义 → 得到 `SetList`。
- 在有序 vector 之上加键值对 → 得到 `MapArray`。

### 12.3 `SetList<T>` — 类结构(PPT slide 11)

```cpp
template <typename T>
struct SetList {
    using value_type = T;
    using pointer    = value_type*;
    using reference  = value_type&;

    struct ListNode {
        value_type data;
        ListNode * next;
    };

    // head = new ListNode{D, head};      // (前插模式;见下面 Notes)

    SetList();
    ~SetList();

    iterator insert(reference val);       // 返回被插入(或已存在)节点的迭代器
    iterator find  (reference val);       // 返回节点的迭代器,或没找到时 end()
    iterator erase (iterator pos);        // 擦 pos 处节点,返回下一个迭代器

    int size() const;

    iterator begin() const;
    iterator end()   const;

private:
    ListNode * head;                      // 裸指针 — SetList 拥有这条链
};
```

> 💡 **为什么是裸 `ListNode*` 而不是 `unique_ptr<ListNode>`?** Klefstad PPT slide 6 脚注:"用了 `unique_ptr` 的话,迭代器可能指不到我们的 list 上!!" 迭代器存 `ListNode*` 指向当前节点。如果链是 `unique_ptr` 串起来的,迭代器就跟那些 `unique_ptr` 起别名,破坏独占所有权。用裸指针,**容器** 拥有一切;迭代器只观察。

### 12.4 `SetList` 逐成员

#### 类型别名 — "我是容器" 的握手

```cpp
using value_type = T;
using pointer    = value_type*;
using reference  = value_type&;
```

这些是 STL 约定。`std::iterator_traits`(以及像 `std::find` 这样的泛型算法)通过问这些 typedef 来反射容器或迭代器。提供它们能让你的容器/迭代器跟 STL 机器互通。

> ⚠️ **Klefstad 命名约定** — 注意 Klefstad 用 `ListNode`,成员叫 `data` 和 `next`。坚持这些名字;autograder 可能依赖它们。

#### `struct ListNode { value_type data; ListNode * next; };`

每个节点存:
- `data`:实际元素值
- `next`:指向下一节点的裸指针,末尾是 `nullptr`

> 💡 **Klefstad autograder 提示** — 链表节点必须叫 `ListNode`(per PPT),成员叫 `data` 和 `next`。别改名。

#### `SetList()` — 空 list

```cpp
SetList() : head{ nullptr } {}
// 或:SetList() = default;   如果你在类体里给 head{} 初始化
```

#### `~SetList()` — 删除每个节点

```cpp
~SetList() {
    while (head != nullptr) {
        ListNode* tmp = head;
        head = head->next;
        delete tmp;
    }
}
```

> ⚠️ **迭代,不是递归。** 一百万节点链表的递归析构会爆栈。迭代。

#### `insert(reference val)` — 唯一键插入

因为 `SetList` 表示 *集合*,不允许重复。标准模式:

```cpp
iterator insert(reference val) {
    // 1. 搜索:遍历链表。找到的话,返回现有节点的迭代器。
    for (ListNode* cur = head; cur != nullptr; cur = cur->next)
        if (cur->data == val) return iterator(cur);

    // 2. 没找到:在 head 前插入新节点。
    head = new ListNode{ val, head };     // Klefstad 的 "head = new ListNode{D, head};"
    return iterator(head);
}
```

> 💡 **为什么前插而不是后插?** O(1) 而不是 O(n)。集合里顺序无关(它是集合,不是序列),前插是自然选择。PPT 的提示 `// head = new ListNode{D, head};` 正是这个。

#### `find(reference val)` — 线性查找

```cpp
iterator find(reference val) {
    for (ListNode* cur = head; cur != nullptr; cur = cur->next)
        if (cur->data == val) return iterator(cur);
    return end();
}
```

> ⚠️ **没找到时 `find` 返回 `end()`**,符合 STL 约定。调用者解引用前要 `if (it != s.end())` 检查。

#### `erase(iterator pos)` — 删节点,返回下一个

```cpp
iterator erase(iterator pos) {
    // 需要在链表里找到 pos 来修前驱的 next。
    // (双向链表存 prev,这就是 O(1)。
    //  单向链 → erase 是 O(n),没办法。)
    if (pos == end()) return end();

    ListNode* target = /* pos 指的那个节点 */;
    if (head == target) {
        head = target->next;
        delete target;
        return iterator(head);
    }
    ListNode* prev = head;
    while (prev->next != target) prev = prev->next;
    prev->next = target->next;
    ListNode* nextNode = target->next;
    delete target;
    return iterator(nextNode);
}
```

> 💡 **STL 约定** — `erase(pos)` 返回被擦元素之后位置的迭代器。这就是让 `it = c.erase(it)` 习惯用法(5.10)有效的原因。

#### `size() const` — 数节点

```cpp
int size() const {
    int n = 0;
    for (ListNode* cur = head; cur != nullptr; cur = cur->next) ++n;
    return n;
}
```

或者在成员 `count` 里缓存大小,让 `size()` O(1) — 自选。

#### `begin() const` / `end() const`

```cpp
iterator begin() const { return iterator(head);    }
iterator end()   const { return iterator(nullptr); }
```

end 迭代器就是包了 null 指针。这样 `it != end()` 等价 `it.current != nullptr` — 跟裸指针循环同样的终止判断。

> ⚠️ **`const` 正确性** — `begin()`/`end()` 是 `const`,因为迭代不修改容器。返回的迭代器是非 const(你可以通过 `*it` 写);想只读迭代要单独写 `const_iterator`。

---

## 13. 迭代器 `++`/`--` 的通用骨架(以及随机访问的额外运算符)

在具体实现 HW9 的两个迭代器之前(`SetList` 的前向迭代器在第 14 节、`MapArray` 的随机访问迭代器在第 15 节),值得先看清它们**共同套用的同一个模式**。在*每一种*迭代器类别里,自增/自减运算符的形状都是一样的 —— 唯一变化的,只是中间那一行"怎么走一步"。

### 13.1 固定的"壳"(与 tag 无关)

无论哪个类别,前置和后置永远长这样:

```cpp
// 前置 ++:走一步,按引用返回 *this
Iter& operator++() {
    /* 走一步 */
    return *this;
}

// 后置 ++:存旧值,复用前置,返回旧值副本
Iter operator++(int) {     // 哑参 `int` 只用来区分两个重载
    Iter temp = *this;     // 1. 先快照当前位置
    ++(*this);             // 2. 复用前置去做真正的移动
    return temp;           // 3. 交回那个"旧"位置(按值)
}
```

`--` 是同一个骨架,把"走一步"换成"往回走一步"。

两条永不改变的规则,跟 tag 无关:
- **前置返回引用**(`Iter&`),指向迭代器自身;**后置返回副本**(`Iter`,按值),是旧位置的拷贝。
- **后置永远是"快照 + 调前置 + 返回快照"。** 你永远不在后置里重写移动逻辑 —— 一律委托给前置。`++` 和 `--` 在每一个类别里都如此。

> 💡 所以一旦写好前置,后置就是机械的复制粘贴。这也是为什么循环里偏好 `++it` 而不是 `it++`:后置会多构造、多返回一个用完即弃的副本。

### 13.2 按 tag 分层:写哪些运算符,"走一步"怎么写

上面的壳是不变的。每个类别变的是 (a) 你*必须*提供*哪些*运算符,以及 (b)"走一步"那一行到底做什么。

#### ① `forward_iterator` —— 只写 `++`,不写 `--`

底层通常是**单链表**(HW9 的 `SetList`)。只能顺着 `next` 往前,回不去,所以**没有 `operator--`**。

```cpp
// 成员:ListNode* current;

Iter& operator++() {                 // "走一步" = 跟着 next 指针
    current = current->next;
    return *this;
}
Iter operator++(int) { Iter t = *this; ++(*this); return t; }

// 没有 operator-- :forward 不要求,单链表也做不到
```

#### ② `bidirectional_iterator` —— `++` 和 `--` 都写,靠节点指针走

底层通常是**双向链表或树**(真正的 `std::list` / `std::set` / `std::map`)。每个节点同时有 `prev` 和 `next`,所以能两头走 —— 但一次仍然只能挪**一个节点**。

```cpp
// 成员:Node* ptr;

Iter& operator++() { ptr = ptr->next; return *this; }   // 前进一步 = 跟着 next
Iter operator++(int) { Iter t = *this; ++(*this); return t; }

Iter& operator--() { ptr = ptr->prev; return *this; }   // 后退一步 = 跟着 prev
Iter operator--(int) { Iter t = *this; --(*this); return t; }
```

> bidirectional 相比 forward **只多了 `--`**。仍然没有 `+ n` 跳跃 —— 想往回走三格,只能 `--` 三次。

#### ③ `random_access_iterator` —— `++`/`--` **外加** `+= -= + -` `[]`,靠指针算术

底层是**连续内存**(HW9 的 `MapArray`,成员是 `pair*`)。这时"走一步"不再是跟指针链,而是**地址算术**,而且同样的算术天然推广到"一次跳 `n` 格":

```cpp
// 成员:std::pair<Key, Value>* current;   // difference_type = std::ptrdiff_t

// ++ / -- :单步(裸指针自增/自减已经自带正确的地址算术)
Iter& operator++() { ++current; return *this; }
Iter operator++(int) { Iter t = *this; ++current; return t; }
Iter& operator--() { --current; return *this; }
Iter operator--(int) { Iter t = *this; --current; return t; }

// 跳 n 格 —— 这才是 random-access 比 bidirectional 多出来的部分
Iter& operator+=(difference_type n) { current += n; return *this; }   // 复合赋值:就地修改,返回引用(像前置 ++)
Iter& operator-=(difference_type n) { current -= n; return *this; }

Iter operator+(difference_type n) const { Iter t = *this; t += n; return t; }  // 拷贝、复用 +=、返回副本(像后置)
Iter operator-(difference_type n) const { Iter t = *this; t -= n; return t; }

// 迭代器 − 迭代器 → 两者之间的距离(O(1),只有 random-access 有)
difference_type operator-(const Iter& o) const { return current - o.current; }

// 下标
reference operator[](difference_type n) const { return current[n]; }
```

注意它们和"壳"在结构上的呼应:
- **`+=` / `-=` 是"复合"运算符 —— 就地修改 `*this` 并返回 `Iter&`**,跟前置 `++` 一模一样。
- **二元 `+` / `-`(迭代器 + n)不就地修改 —— 拷贝一份、委托给 `+=`/`-=`、返回那个副本**,跟后置 `++` 一模一样。
- 有**两个 `operator-`**:*迭代器 − n* → 一个迭代器(往回 `n` 格),*迭代器 − 迭代器* → 一个 `difference_type`(相距多远)。两者都只有 random-access 才有。

### 13.3 一图速览

| 类别 | `++` | `--` | `+= -= + - [] < >` | "走一步"的机制 | HW9 例子 |
|---|:---:|:---:|:---:|---|---|
| `forward_iterator` | ✅ | ❌ | ❌ | `p = p->next` | **`SetList`** |
| `bidirectional_iterator` | ✅ | ✅ | ❌ | `p = p->next` / `p = p->prev` | (真正的 `set` / `map`) |
| `random_access_iterator` | ✅ | ✅ | ✅ | 指针算术:`++p`、`p += n` | **`MapArray`** |

**要点:**前置/后置的**壳永远不变**;后置*总是*"快照 + 调前置 + 返回快照"。沿层级往上走,只是 (a) 多了运算符(先是 `--`,再是 `+= -= + - [] < >`),以及 (b) 换掉那一行"走一步"的机制(`next` → `next`/`prev` → 指针算术)。

> ⚠️ **关于 HW9 实际代码的提醒。** 上面的骨架是 STL 的*规范*写法:前置返回 `Iter&`,跳跃参数类型是 `difference_type`。Klefstad 在第 14–15 节里的 HW9 代码沿用 PPT 风格,前置**按值返回**(`iterator operator++()`),跳跃参数用 `int`。两种都能编译、都能用于 HW9;这里的规范写法是更好的心智模型,也是真正的 STL 迭代器所采用的形式。

---

## 14. `SetList` 前向迭代器

> 对应 Topic 9 PPT slide 12

### 14.1 类结构

```cpp
// 嵌套在模板 SetList<T> 内
struct iterator {
    using iterator_category = std::forward_iterator_tag;   // ← 只前向,没有 --
    using value_type        = SetList::value_type;         // T
    using pointer           = value_type*;
    using reference         = value_type&;
    using difference_type   = std::ptrdiff_t;              // <cstddef>

    iterator(ListNode* node);

    iterator  operator++();                                // 前置自增
    bool      operator==(const iterator& other) const;
    bool      operator!=(const iterator& other) const;
    reference operator* () const;

private:
    ListNode* current;
};
```

### 14.2 为什么是 `forward_iterator_tag`?

单向链表可以:

- 读元素(`*iter`)
- 前进(`++iter`)
- 比较(`==`、`!=`)
- 多次遍历(它是多遍结构)

单向链表 **不能**:

- 后退(`--iter`) — 没有 `prev`
- 跳跃(`iter + 5`) — 那需要走 5 个节点,违背 O(1) 推进

正好匹配 "读/写、多遍、只前向" 的迭代器类别是 **`std::forward_iterator_tag`**。

> 💡 **含义** — 要求随机访问的算法(`std::sort`、`std::nth_element`)对 `SetList::iterator` 编译不过。只要 forward 的算法(`std::find`、`std::for_each`、`std::copy`)能用。

### 14.3 成员实现

```cpp
iterator(ListNode* node) : current{ node } {}

iterator operator++() {
    if (current != nullptr) current = current->next;
    return *this;
}

bool operator==(const iterator& other) const { return current == other.current; }
bool operator!=(const iterator& other) const { return current != other.current; }

reference operator*() const { return current->data; }    // 对 end() 解引用是 UB
```

> ⚠️ **这里 `operator++` 是前置自增。** Klefstad PPT slide 12 只列了 `operator++()`。如果你也想要后置自增(让用户能写 `it++`),还得加一个重载:
> ```cpp
> iterator operator++(int) { auto tmp = *this; ++(*this); return tmp; }
> ```
> 那个 `int` 参数是哑参,用来区分两个重载;从不使用。前置返回引用(或它的 `*this`),后置返回旧值的拷贝。`for` 循环里也偏好前置。

### 14.4 为什么 `difference_type` 是 `std::ptrdiff_t`?

`std::ptrdiff_t`(来自 `<cstddef>`)是足以表示任何有效数组里两个指针距离的有符号整数类型。HW9 用它是约定俗成、安全的选择。问 "这两个迭代器多远?" 的算法 `std::distance(it1, it2)` 返回 `difference_type`。

对前向迭代器,`std::distance` 是 O(n) — 它从 `it1` 走到 `it2`。对随机访问迭代器(下一节)是 O(1)。

### 14.5 拼起来 — 在 `SetList` 上的 `for` 循环

有了上面的迭代器以及 `SetList` 的 `begin()` / `end()`,这个循环能用:

```cpp
SetList<int> s;
s.insert(5); s.insert(3); s.insert(7);

for (auto it = s.begin(); it != s.end(); ++it)
    std::cout << *it << ' ';

// 或者,既然 SetList 有 begin/end:
for (int x : s)
    std::cout << x << ' ';

// 或者,用 STL 算法:
auto it = std::find(s.begin(), s.end(), 3);
if (it != s.end()) std::cout << "found\n";
```

> 💡 **回报** — 一旦你的容器提供了正确打 tag 的 `begin()`/`end()`,**所有只要求那个类别的 STL 算法都能在你的容器上用** — 这是 STL 的深层承诺。

---

## 15. `MapArray` 与它的随机访问迭代器

> 对应 Topic 9 PPT slides 13–14

### 15.1 大思路

`std::map<K,V>` 通常实现为平衡二叉搜索树(红黑)。它的 insert/find/erase 都是 O(log n),但每个节点带很多指针开销。

`MapArray<K,V>` 做不同取舍:把键值对存在 **有序 `std::vector`** 里。于是:

- **find**:O(log n) — 通过 `std::lower_bound` 二分。
- **insert**:O(n) — 需要移动元素保持有序。
- **iteration**:每步 O(1),**对 cache 友好**(连续内存)。
- **memory**:更紧(没有逐节点分配,没有树指针)。

对小到中等的 n,这经常比真正的 `map` 快。(C++ 标准库把这个模式叫 "flat_map",最近也标准化了。)

### 15.2 类结构(PPT slide 13)

```cpp
template <typename K, typename V>
struct MapArray {
    using value_type      = std::pair<K, V>;     // 每个元素是 (键, 值) 对
    using key_type        = K;
    using mapped_type     = V;
    using pointer         = value_type*;
    using reference       = value_type&;
    using const_reference = const reference;

    std::vector<value_type> A;                   // ← 存储

    MapArray();
    ~MapArray();

    V& operator[](K& k);                         // map 风格中括号:不存在则插入

    iterator insert(value_type val);             // 有序插入;返回迭代器
    iterator find  (K& val);                     // 二分查找;返回迭代器或 end()

    iterator begin();
    iterator end();
};
```

> 💡 **为什么用 `std::vector<value_type>` 当存储而不是裸数组?** 因为能 **免费** 拿到扩容、移动语义、拷贝/析构、range 支持。Rule of Zero:`MapArray` 不需要任何特殊成员(默认析构销毁 vector,默认拷贝/移动逐成员有效)。

> ⚠️ **Klefstad 的 API 选择** — `operator[]` 和 `find` 接 `K&`(非 const 引用)。按惯例本该是 `const K&`。HW9 跟着 Klefstad 的签名走才能过 autograder,但知道标准库选的是 `const K&`。

### 15.3 实现 `operator[]` — 不存在则插入

`std::map<K,V>::operator[]` 有个奇怪(但很 Pythonic)的行为:如果键缺失,它 **插入一个默认构造的值** 并返回它的引用。这样 `m["new key"] = 42;` 才有效。

```cpp
V& operator[](K& k) {
    auto it = find(k);
    if (it != end()) return it->second;     // 已有键 → 返回其值

    // 没有键 → 默认构造一个 V 并插入
    value_type p{ k, V{} };
    auto newIt = insert(p);
    return newIt->second;
}
```

### 15.4 实现 `find` — 二分查找

```cpp
iterator find(K& val) {
    auto it = std::lower_bound(A.begin(), A.end(), val,
                               [](const value_type& p, const K& k) {
                                   return p.first < k;
                               });
    if (it != A.end() && it->first == val) return iterator(&*it);
    return end();
}
```

两部分:

1. `std::lower_bound` 用 O(log n) 二分查找,返回 **第一个键不小于 `val`** 的位置 — 要么恰好匹配,要么是第一个更大的。
2. 检查返回位置是否真的是 `val`(`it->first == val`)。是 → 返回迭代器;否 → 返回 `end()`(没找到)。

### 15.5 实现 `insert` — 保持有序(PPT slide 15)

```cpp
iterator insert(value_type val) {
    // 找到 val 该去哪(二分)。
    auto pos = std::lower_bound(A.begin(), A.end(), val.first,
                                [](const value_type& p, const K& k) {
                                    return p.first < k;
                                });

    // 键已存在就不要重复(set/map 语义)。
    if (pos != A.end() && pos->first == val.first)
        return iterator(&*pos);

    // 在 pos 前插入;vector::insert 移动后续元素腾位置。
    auto newPos = A.insert(pos, val);
    return iterator(&*newPos);
}
```

这两个工具是第 16 节的重点:`std::lower_bound` 和 `vector::insert`。

### 15.6 `MapArray::iterator` — 随机访问(PPT slide 14)

```cpp
struct iterator {
    using iterator_category = std::random_access_iterator_tag;   // ← 从 forward 升级
    using value_type        = MapArray::value_type;              // pair<K, V>
    using pointer           = value_type*;
    using reference         = value_type&;
    using difference_type   = std::ptrdiff_t;

    iterator(pointer p);

    iterator operator++();
    iterator operator--();
    iterator operator+(int n);
    iterator operator-(int n);
    iterator operator[](difference_type d);

    bool      operator==(const iterator& other) const;
    bool      operator!=(const iterator& other) const;
    reference operator*();
    pointer   operator->();
    reference operator[](difference_type const d) const;

private:
    pointer current;
};
```

### 15.7 为什么是 `random_access_iterator_tag`?

因为底层存储是 `std::vector`,连续内存:

- `++` / `--` 是指针自增/自减(O(1))。
- `+n` / `-n` 是指针算术(O(1))。
- `it[5]` 是 `*(it + 5)`(O(1))。

这些性质都满足 **随机访问**。(严格来说,因为存储连续,这可以是 C++17 的 `contiguous_iterator_tag`,但 Klefstad PPT 用旧的 `random_access_iterator_tag`,也行。)

> 💡 **含义** — 需要随机访问的算法(`std::sort`、`std::nth_element`、二分)对 `MapArray::iterator` 有效。对比 `SetList::iterator`(只前向),它们用不了。

### 15.8 实现这些运算符

因为 `current` 是 `pointer`(一个 `value_type*`),大多数运算符就是指针算术的薄包装:

```cpp
iterator(pointer p) : current{ p } {}

iterator operator++()                        { ++current; return *this; }
iterator operator--()                        { --current; return *this; }
iterator operator+(int n)                    { return iterator{ current + n }; }
iterator operator-(int n)                    { return iterator{ current - n }; }

bool operator==(const iterator& o) const     { return current == o.current; }
bool operator!=(const iterator& o) const     { return current != o.current; }

reference operator*()                        { return *current; }
pointer   operator->()                       { return  current; }

reference operator[](difference_type d) const { return current[d]; }
```

> ⚠️ **`operator->` 很特别。** 不像 `*` 返回元素,`->` 返回一个指针,编译器随后再次解引用。用户写 `it->first`,编译器重写为 `(it.operator->())->first`,等价 `current->first`。这就是为什么你能写 `it->first` 和 `it->second` 访问 map pair 成员。

### 15.9 迭代器有效性与 `vector::insert` 失效

> ⚠️ **关键提醒** — `vector::insert` 可能 **重新分配** 底层缓冲(超出容量时)。**之后所有现有迭代器(和指针)都失效。** 5.10 的失效表适用。

对 `MapArray::insert`,这有影响:如果你存了一个指向 "我们要插入的位置" 的迭代器,insert 完成后它就过期了。标准模式是用 `A.insert(pos, val)` **返回** 的迭代器,它指向(可能重分配后)缓冲中新插入的元素。

### 15.10 把 `MapArray` 拼起来

```cpp
MapArray<std::string, int> m;
m["apple"]  = 1;
m["banana"] = 2;
m["cherry"] = 3;

for (auto& [key, value] : m)        // 结构化绑定(C++17)
    std::cout << key << "=" << value << '\n';

// 输出:
//   apple=1
//   banana=2
//   cherry=3        ← 按键有序,得益于 lower_bound + insert
```

---

## 16. 保持 vector 有序的工具(`lower_bound` + `vector::insert`)

> 对应 Topic 9 PPT slide 15。两者都住在标准头里,经过测试 — `MapArray` 基于它们,不必重新实现。

### 16.1 `std::lower_bound` — 二分查找插入位置

```cpp
auto it = std::lower_bound(first, last, value);
```

- **前置条件**:范围 `[first, last)` 有序(按 `<`)。
- **返回**:**第一个不小于 `value`**(即 ≥ `value` 的第一个)元素的迭代器。
- **如果 `value` 大于所有元素**:返回 `last`。
- **复杂度**:O(log n) **次比较**,但迭代器推进是该迭代器类别的开销(随机访问总共 O(log n),前向因为 *推进* 本身就是 O(n) 的链表,总共 O(n))。

`lower_bound` 告诉你三件事:

| 结果 | 含义 |
|---|---|
| `it != last && *it == value` | 精确匹配,在位置 `it` |
| `it != last && *it != value` | 不存在,但如果插就插在 `it` 之前 |
| `it == last` | 不存在,且会插在末尾 |

> 💡 **对 map 风格存储**,你提供一个只比较键的自定义比较器:
> ```cpp
> std::lower_bound(A.begin(), A.end(), key,
>     [](const auto& pair, const auto& k) { return pair.first < k; });
> ```
> 第一个参数是范围里的元素,第二个是要搜的值 — 注意不对称。

### 16.2 `std::vector::insert(pos, value)`

```cpp
vector<int> v = {1, 3, 5, 7};
auto it = std::lower_bound(v.begin(), v.end(), 4);
v.insert(it, 4);
// v 现在是 {1, 3, 4, 5, 7} — 仍然有序
```

- **把 `value` 插入到位置 `pos` 之前。**
- **把 `pos` 处及之后的元素整体右移一位** 腾位。O(n)(n 是到末尾的距离)。
- **超出容量时可能重分配** vector 的缓冲。重分配让 **所有** 进入 vector 的迭代器和指针失效。
- **返回** 指向新插入元素的迭代器(重分配后也有效,因为它从新存储里查出来)。

> ⚠️ **迭代器失效查表**(cppreference,见 §5.10)

| 操作 | 失效什么 |
|---|---|
| `insert`(没重分配) | 插入点及之后的迭代器 |
| `insert`(重分配) | **所有** 迭代器(以及指针、引用) |
| `push_back`(没重分配) | 只 `end()` |
| `push_back`(重分配) | 所有 |
| `erase` | 被擦元素及其后所有(包括 `end()`) |

所以 `auto newIt = v.insert(pos, value);` 后,任何之前持有的迭代器(包括你之前算出的 `pos`)都过期。**用 `newIt`。**

### 16.3 `lower_bound` + `insert` 习惯用法 — 两行实现有序插入

这就是 `MapArray::insert` 的全部引擎:

```cpp
auto pos    = std::lower_bound(v.begin(), v.end(), value);
auto newPos = v.insert(pos, value);
// v 仍然有序;newPos 指向 value
```

唯一键容器加上存在检查:

```cpp
auto pos = std::lower_bound(v.begin(), v.end(), value);
if (pos != v.end() && *pos == value)
    return pos;                          // 已存在,不插
return v.insert(pos, value);             // 不存在,插入
```

### 16.4 `MapArray` 性能汇总

| 操作 | 时间 | 原因 |
|---|---|---|
| `find` | O(log n) | 二分查找 |
| `insert` | O(n) | 二分 + O(n) 移动 |
| `erase` | O(n) | 二分 + O(n) 移动 |
| `operator[]`(已有键) | O(log n) | 只 find |
| `operator[]`(新键) | O(n) | find + insert |
| 迭代 | 总 O(n),每步 O(1) | 走连续内存 |
| Range-for | O(n) | 走连续内存 |

小 n 时(比如几千以内),`MapArray` 在真实负载下经常 *打败* `std::map`,因为 cache 效应巨大。临界点跟负载有关。

---
## 17. Week 9 综合 Cheat Sheet

### 17.1 容器类骨架

每个自定义容器 — `IntArray`、`SetList<T>`、`MapArray<K,V>` — 都是同一个形状。把这骨架记下来;HW 评分会查全套。

```cpp
template <typename T>
class MyContainer {
public:
    // ---- 类型别名(让泛型代码能反射) ----
    using value_type      = T;
    using pointer         = value_type*;
    using reference       = value_type&;
    using const_reference = const value_type&;
    using size_type       = std::size_t;

    // ---- 特殊成员函数(Rule of Three / Five / Zero) ----
    MyContainer();                                          // 默认构造
    MyContainer(std::initializer_list<T> list);             // 花括号初始化构造
    MyContainer(const MyContainer& other);                  // 拷贝构造
    MyContainer& operator=(const MyContainer& other);       // 拷贝赋值
    MyContainer(MyContainer&& other) noexcept;              // 移动构造
    MyContainer& operator=(MyContainer&& other) noexcept;   // 移动赋值
    ~MyContainer();                                         // 析构

    // ---- 最小容器接口 ----
    size_type size() const;
    bool      empty() const;
    iterator  begin();
    iterator  end();
    iterator  insert(/* ... */);
    iterator  find(/* ... */);
    iterator  erase(iterator pos);

    // ---- 嵌套迭代器类型(见 17.4) ----
    struct iterator { /* ... */ };

private:
    // 存储
};
```

> 💡 **Rule of Zero 捷径**:如果每个数据成员本身就是 STL 容器或智能指针,你可以把全部六个特殊成员 `= default`(甚至省略)。成员自己会做对。你只在持有 **裸** 拥有指针时手写拷贝/移动/析构。

### 17.2 `std::initializer_list` 速查

```cpp
#include <initializer_list>

class Foo {
public:
    Foo(std::initializer_list<int> list);    // 让 Foo x{1, 2, 3}; 能用
};
```

**写 `Foo x{...}` 时的选择规则:**

1. 如果存在接受 `std::initializer_list<...>` 的构造且花括号匹配,**它赢**(甚至赢过更明确的构造)。
2. 否则退回到匹配的非 list 构造。
3. 圆括号 `Foo x(...)` **永远不** 考虑 list 构造。

**两个陷阱:**

| 陷阱 | 症状 | 修法 |
|---|---|---|
| 给已有类加 list 构造 | `Foo x{5};` 突然变成 1 元素 list,不再是 size-5 容器 | size 风格的调用用 `Foo x(5);`;在改动日志里写明 |
| 存了 list 的指针 | 临时 `initializer_list` 死了之后 `it->begin()` 悬空 | 在构造体内 **拷贝** 内容到自己的存储 |

### 17.3 `assert` vs `static_assert`

| | `assert(cond)` | `static_assert(cond, "msg")` |
|---|---|---|
| 头文件 | `<cassert>` | 不用(内建关键字) |
| 何时检查 | **运行时**,每次调用 | **编译时**,一次 |
| 何时禁用 | include 前 `#define NDEBUG`(Release) | 从不 — 总是检查 |
| 失败 | abort,打印表达式 + 文件 + 行号 | 编译不过 |
| 用于 | 不该发生的程序员错误 | 类型和常量的事实 |
| Release 开销 | **零**(编译掉) | **零**(无 codegen) |

**要记下来的习惯用法:**

```cpp
assert(p != nullptr && "list head is null in pop()");  // 带描述的 assert
static_assert(sizeof(int) >= 4, "32-bit int required");
static_assert(std::is_integral_v<T>, "T must be an integral type");
```

> ⚠️ **永远别用 assert 处理可能合法失败的运行时情况** — 用户输入错、文件不存在、网络错误等等。那些要真正的错误处理(异常或错误码)。assert 抓的是 *bug*,不是 *预期* 失败。

### 17.4 迭代器类别速查

| 类别 | Tag(`std::xxx_iterator_tag`) | 操作 | 例子容器 |
|---|---|---|---|
| input | `input_iterator_tag` | `*it`(单次读)、`++it`、`==`、`!=` | `istream_iterator` |
| output | `output_iterator_tag` | `*it = x`(单次写)、`++it` | `ostream_iterator`、`back_inserter` |
| forward | `forward_iterator_tag` | input + 多遍 | `forward_list`、**HW9 `SetList`** |
| bidirectional | `bidirectional_iterator_tag` | forward + `--it` | `list`、`set`、`map` |
| random-access | `random_access_iterator_tag` | bidirectional + `+`、`-`、`[]`、`<`、`>` | `deque`、**HW9 `MapArray`** |
| contiguous(C++17) | `contiguous_iterator_tag` | random-access + 内存相邻 | `array`、`vector`、`string` |

层级(右边的严格支持左边所有的):

```
input ──→ forward ──→ bidirectional ──→ random-access ──→ contiguous
output(单独层级)
```

### 17.4b STL 提供的具体迭代器类型(适配器与特殊迭代器)

上面 17.4 列的是**类别**(category) — 即"一个迭代器最少要支持什么操作"的抽象规格。这一节列的是 STL 标准库**实际提供**的具体迭代器类型,以及它们各自落在哪个类别上。

**容器自家迭代器**(每个容器都成对提供)

| 类型 | 头文件 | 类别 | 说明 |
|---|---|---|---|
| `C::iterator` | 容器头(`<vector>` 等) | 取决于容器 | 读写;`begin()` / `end()` 返回 |
| `C::const_iterator` | 同上 | 同上 | 只读;`cbegin()` / `cend()` 返回 |
| `C::reverse_iterator` | 同上 | bidirectional 或以上 | 反向遍历;`rbegin()` / `rend()` 返回 |
| `C::const_reverse_iterator` | 同上 | 同上 | 反向 + 只读;`crbegin()` / `crend()` 返回 |

每个标准容器的 `iterator` 的具体类别:

| 容器 | `iterator` 类别 |
|---|---|
| `std::array`、`std::vector`、`std::string` | **contiguous**(C++17;C++17 之前是 random-access) |
| `std::deque` | random-access |
| `std::list` | bidirectional |
| `std::set`、`std::map`、`std::multiset`、`std::multimap` | bidirectional |
| `std::forward_list` | **forward** |
| `std::unordered_set` / `unordered_map` 系列 | forward |
| **HW9 `SetList<T>`** | forward |
| **HW9 `MapArray<K,V>`** | random-access(底层是 `vector`) |

> 💡 在 const 容器上 `begin()` *已经* 返回 `const_iterator`。`cbegin()` 存在的意义是:在非 const 容器上也能**强制**要一个只读迭代器(比如想用 `auto` 但不希望允许修改)。

**反向迭代器适配器** — `<iterator>`

| 类型 | 类别 | 用途 |
|---|---|---|
| `std::reverse_iterator<It>` | 同被包装的 `It`(至少 bidirectional) | 把一个 bidirectional 迭代器反过来 — `++` 实际走 `--`。`rbegin()` 内部就是它 |
| `std::make_reverse_iterator(it)`(C++14) | 同上 | 工厂函数,从普通迭代器造反向迭代器 |

```cpp
std::vector<int> v{1, 2, 3, 4, 5};
for (auto it = v.rbegin(); it != v.rend(); ++it)
    std::cout << *it << ' ';   // 5 4 3 2 1
```

**插入迭代器适配器** — `<iterator>`,全部是 `output_iterator_tag`

| 类型 | 工厂函数 | 行为 | 容器要求 |
|---|---|---|---|
| `std::back_insert_iterator<C>` | `std::back_inserter(c)` | `*it = x` 调用 `c.push_back(x)` | 需要 `push_back` — `vector`、`deque`、`list`、`string` |
| `std::front_insert_iterator<C>` | `std::front_inserter(c)` | `*it = x` 调用 `c.push_front(x)` | 需要 `push_front` — `deque`、`list`、`forward_list` |
| `std::insert_iterator<C>` | `std::inserter(c, pos)` | `*it = x` 调用 `c.insert(pos, x)`,然后 `pos` 自动前进 | 任何带 `insert(pos, val)` 的容器 — `set`、`map`、`vector`…… |

```cpp
std::vector<int> src{1, 2, 3};
std::vector<int> dst;
std::copy(src.begin(), src.end(), std::back_inserter(dst));   // dst: {1,2,3}

std::set<int> s;
std::copy(src.begin(), src.end(), std::inserter(s, s.end())); // s:   {1,2,3}
```

> ⚠️ 没有 `back_inserter`,`std::copy(..., dst.begin())` 会**覆盖** `dst` 已有元素,而不是追加 — output 迭代器不会自己扩容。这是 STL 新手最常见的踩雷之一。

**流迭代器** — `<iterator>`

| 类型 | 类别 | 含义 |
|---|---|---|
| `std::istream_iterator<T>` | input | 把 `cin >> T` 包成 input 迭代器;`++` 读下一个值;**默认构造的实例 = "end" 哨位** |
| `std::ostream_iterator<T>` | output | `*it = x` 调用 `out << x`,可附加分隔符 |
| `std::istreambuf_iterator<char>` | input | 字符级 — 整个文件读到 `string` 的常用招式 |
| `std::ostreambuf_iterator<char>` | output | 字符级输出 |

经典 STL 一行流:

```cpp
// 从 cin 读所有 int,逐个输出到 cout,空格分隔
std::copy(std::istream_iterator<int>(std::cin),
          std::istream_iterator<int>(),                  // 默认构造 = end
          std::ostream_iterator<int>(std::cout, " "));

// 整个文件 → string
std::string contents{std::istreambuf_iterator<char>(file),
                     std::istreambuf_iterator<char>()};
```

**移动迭代器**(C++11) — `<iterator>`

| 类型 | 类别 | 用途 |
|---|---|---|
| `std::move_iterator<It>` | 同 `It` | `*it` 返回**右值引用**(`T&&`),而不是普通 `T&` — 让算法走 *移动* 而非 *复制* |
| `std::make_move_iterator(it)` | 同上 | 工厂 |

```cpp
std::vector<std::string> src{"a", "b", "c"};
std::vector<std::string> dst(std::make_move_iterator(src.begin()),
                             std::make_move_iterator(src.end()));
// src 里的字符串已被移走,src 的元素现在处于"合法但未指定"的状态
```

**C++20 适配器**(只是认识一下,HW9 不要求)

| 类型 | 用途 |
|---|---|
| `std::counted_iterator<It>` | 让一个迭代器"记得还剩多少步" — 配合 ranges 用 |
| `std::common_iterator<It, S>` | 把 `(iterator, sentinel)` 这种 ranges 风格的 pair 适配成"老式" `(iter, iter)` 接口,好喂给 C++17 算法 |

**总结(HW9 视角):** 你这周只会**自己写一种**迭代器类型 — `SetList::iterator`(forward)和 `MapArray::iterator`(random-access),都是**容器内部的嵌套类**,不是适配器。但要记住:STL 已经把上面这一整套适配器都预制好了 — Week 8 学的算法(`copy`、`transform`、`accumulate`……)只要搭配 `back_inserter` / `ostream_iterator` / `make_reverse_iterator` 等,就能直接写到你需要的地方,无需手写循环。

> 💡 **跨周 see also** — Week 8 §11.9(排序范围上的集合算法)和 §11.10(堆算法)都直接适用于本周的 HW9 容器:`MapArray`(排序 vector 后端)能跑 `set_union` / `set_intersection` / `set_difference`,任何 random-access 范围都能跑 `make_heap` / `pop_heap`。这就是 "用户视角的 STL" 的红利 — 一旦你的迭代器满足类别要求,Week 8 整套算法白送。

### 17.5 `iterator_traits` 的五个 typedef

每个迭代器类型 **必须** 暴露全部五个 — 要么作为迭代器类里的嵌套 `using`,要么通过 `iterator_traits` 特化。算法读它们挑策略。

```cpp
struct iterator {
    using iterator_category = std::forward_iterator_tag;   // 能力等级
    using value_type        = T;                           // *it 给你什么
    using pointer           = T*;                          // it->m 给你什么
    using reference         = T&;                          // *it 的类型
    using difference_type   = std::ptrdiff_t;              // it1 - it2 的类型
    // ...
};
```

**为什么五个?** 算法根据 `iterator_category` 分支(例如 `std::distance` 对随机访问 O(1),前向 O(n));它们声明 `value_type` 的临时变量;它们从 `*` 返回 `reference`;它们用 `difference_type` 表示距离;它们可能为 `it->m` 用 `pointer`。少一个,泛型算法就编不过你的迭代器。

**指针特化(cppreference)**:`std::iterator_traits<T*>` 被特化成让 `T*` 自己算作连续迭代器。所以算法在普通 C 数组上能用。

### 17.6 智能指针决策表

| 问题 | 答案 |
|---|---|
| 需要单一所有权,可以转移? | **`std::unique_ptr<T>`** |
| 需要多个所有者共享同一对象? | **`std::shared_ptr<T>`** |
| 需要打破共享环(父 ↔ 子)? | **`std::weak_ptr<T>`**(本周阅读没讲) |
| 想要非拥有的观察者? | **裸指针** 就行 — 在注释里说一下 |
| 要持有数组? | `std::unique_ptr<T[]>` 配 `make_unique<T[]>(n)`;**永远不** 用 `shared_ptr<T[]>`,除非 C++17+ 且确实需要 |
| 直接调用 `new`? | **别。** 用 `make_unique` / `make_shared` |

**并排:**

| | `unique_ptr<T>` | `shared_ptr<T>` |
|---|---|---|
| 所有者数 | 恰好 1 | 1 到多 |
| 可拷贝 | ❌(拷贝构造 `= delete`) | ✅(增加引用计数) |
| 可移动 | ✅(转移所有权) | ✅ |
| 堆开销 | 只 `T` | 控制块(计数 + deleter) |
| 单次操作开销 | 几乎免费 | 拷贝/析构有原子计数 |
| 何时删除 | `unique_ptr` 自己死 | 最后一个 `shared_ptr` 死(计数 → 0) |
| 工厂 | `std::make_unique<T>(args...)` | `std::make_shared<T>(args...)` |
| 拿裸指针 | `.get()` | `.get()` |
| 释放所有权 | `.release()` 返回裸,**不 delete** | 只能通过析构或 `.reset()` |
| 替换持有 | `.reset(new_ptr)` | `.reset(new_ptr)` |

**为什么用 `make_*` 而不是 `new`:**

- **异常安全**:`foo(unique_ptr<A>(new A), unique_ptr<B>(new B))` 如果在两个 `new` 和两个 `unique_ptr` 构造之间 `B` 的 `new` 抛了异常,会泄漏。`foo(make_unique<A>(), make_unique<B>())` 不会。
- **少打字 / 不重复类型名**:`make_shared<Widget>(args)` 而不是 `shared_ptr<Widget>(new Widget(args))`。
- **`make_shared` 一次堆分配** 给对象 + 控制块(vs `new` 形式的两次)。

### 17.7 RAII 替代 Rule of Three

| 旧(Week 5 / Week 6,HW4–HW6) | 新(Week 9,HW9 起) |
|---|---|
| 类持有 `char* buf;` | 类持有 `std::unique_ptr<char[]> buf;`(或 `std::vector<char>`) |
| 必须写析构 | 编译器生成的 `~Class() = default;` 正确 |
| 必须写拷贝构造 | `= delete`(unique_ptr) 或 `= default`(vector 深拷贝) |
| 必须写拷贝赋值 | 同上 |
| 必须写移动构造 | `= default` 有效 |
| 必须写移动赋值 | `= default` 有效 |
| 手动 `delete[] buf;` | 智能指针析构处理 |
| early return / 异常时容易泄漏 | 不可能 — 销毁是自动的 |

> 💡 **Rule of Zero**:如果你能把类完全表达为已经管理自身资源的类型的组合,你可以写 **零个** 特殊成员函数。这是现代 C++ 的理想。**HW9 的 `MapArray` 自然是 Rule of Zero**(它只持有 `std::vector<std::pair<K,V>>`);**HW9 的 `SetList` *不是*** Rule of Zero,因为它用裸 `ListNode*`(slide 6 警告 — 否则迭代器会出问题)。

### 17.8 C++20 Ranges 和 Views 一页纸

```cpp
#include <ranges>
#include <algorithm>

// 1. 算法接受整个 range(不用 begin/end 对)
std::vector<int> v{3, 1, 4, 1, 5, 9, 2, 6};
std::ranges::sort(v);                       // 之前:std::sort(v.begin(), v.end())

// 2. Views 是惰性、可组合的变换
namespace views = std::views;
auto evens_doubled = v | views::filter([](int i){ return i % 2 == 0; })
                       | views::transform([](int i){ return 2 * i; });

for (int x : evens_doubled) std::cout << x << ' ';

// 3. LC125 回文习惯用法
bool is_palindrome(std::string const& s) {
    auto v = s | views::filter([](char c){ return std::isalnum(c); })
               | views::transform([](char c){ return std::tolower(c); });
    return std::ranges::equal(v, v | views::reverse);
}
```

**要记的性质:**

- **Views 什么都不拥有。** 它们持有源 range 的引用;源必须比 view 活得久。
- **Views 惰性。** 迭代前什么都不发生。`| filter | transform | reverse` 在 range-for 真正消费元素之前不做任何工作。
- **算法住在 `std::ranges::`。** Views 住在 `std::views::`(它本身是 `std::ranges::views` 的别名)。

### 17.9 HW9 性能汇总

| 操作 | `SetList<T>`(链) | `MapArray<K,V>`(有序 vec) | `std::set<T>`(RB 树) | `std::map<K,V>`(RB 树) |
|---|---|---|---|---|
| `find` | O(n) | O(log n) | O(log n) | O(log n) |
| `insert` | O(n)(find + O(1) 拼接) | O(n)(find + 移动) | O(log n) | O(log n) |
| `erase(it)` | O(1) | O(n)(移动) | 平摊 O(log n) | 平摊 O(log n) |
| `operator[]` | — | 已有键 O(log n),新键 O(n) | — | O(log n) / 插入时 O(n) |
| 迭代 | O(n),cache 不友好 | O(n),cache 友好 | O(n),cache 不友好 | O(n),cache 不友好 |
| 迭代器类别 | forward | random-access | bidirectional | bidirectional |
| 每元素内存 | 元素 + 1 个指针 | 只元素 | 元素 + 3 个指针 + 颜色位 | 同 |

**这样读:** 对 *小* n(几千以内),`MapArray` 经常打败 `std::map`,虽然 insert 渐进更糟,因为连续内存远比追指针快。临界点取决于负载;教训是 **Big-O 不是全部** — 常数有影响。

### 17.10 HW9 递进开发配方(Klefstad)

这是 Klefstad 教授指定的 HW9 攻克顺序。**不要跳步。**

```
1. 从能跑的 HW8 mapset 开始             (基线已知好)
2. 写 SetList<T> 容器和它的前向迭代器
3. 用简单 gtest 隔离测试 SetList        (早抓 bug)
4. 在 mapset.cpp 里:把 std::set 换成 SetList
   └── 让编译器告诉你 SetList 还缺啥
5. 再测 mapset 直到完全可跑
6. 还原 std::set;把 std::map 换成 MapArray<K,V>
7. 重复编译驱动的调试循环
8. 最后:同时用 SetList 和 MapArray
9. 跑 autograder 额外的 SetList 和 MapArray gtest
```

> ⚠️ **致命反模式**:同时替换 `std::set` *和* `std::map`,然后调试。你不会知道哪个错误信息来自哪个容器。**永远一次换一个。**

### 17.11 `lower_bound` + `vector::insert` 习惯用法(MapArray 的秘密武器)

```cpp
// 在 v 里有序插入 `value`
auto pos = std::lower_bound(v.begin(), v.end(), value);  // O(log n) 二分
v.insert(pos, value);                                     // O(n) 移动

// 对集合(不允许重复),先检查:
auto pos = std::lower_bound(v.begin(), v.end(), value);
if (pos != v.end() && *pos == value)
    return pos;                  // 已存在
return v.insert(pos, value);     // 不存在 — 插入
```

`lower_bound`(返回第一个 ≥ value 的迭代器)和 `vector::insert(pos, value)`(插在 `pos` *之前*)都来自标准库。它们一起让 `MapArray` 用零行手写树代码维持有序不变式。

---

## 18. Week 9 最重要的五条记忆

1. **容器类是一个契约,不只是数据结构。** 想进 STL 沙盒,你的容器必须暴露:类型别名(`value_type`、`pointer`、`reference`……)、一对 `begin()`/`end()` 迭代器,加上 `insert`/`find`/`erase`/`size`/`empty` 中合理的一部分。把 *契约* 写对,`std::ranges::sort(myContainer)`、`for (auto& e : myContainer)`、`std::distance(begin, end)` 全都 *免费* 起飞。写错就什么都不灵。**HW9 的 `SetList` 和 `MapArray` 评分的就是是否兑现了这套契约**,不是聪不聪明。要点:你设计一个装多个东西的类时,先问 *"STL 期望容器是什么样?"* — 然后照着写,再加上你自己的特性。

2. **`std::initializer_list` 是花括号怎么变成构造参数的。** `Foo x{1, 2, 3};` 看着像语法糖,其实是真正的重载决议:编译器造一个临时 `initializer_list<int>`,然后调用接收它的构造。两条后果烧进语言:(a) **用花括号时 list 构造几乎赢过所有其它选择**,所以给已有类加 list 构造会悄悄改变 `Foo x{5};` 的含义(原本的 size-5 容器突然变成 1 元素 list);(b) 底下的数组是 *临时的* — 如果你的构造存了指针而不是拷贝内容,构造一返回就是悬空指针。永远 **把数据拷到自己的存储里**,需要 size 风格构造时永远优先 `()` 而不是 `{}`。

3. **迭代器 + `iterator_traits` 让 STL 对用户可扩展。** `<algorithm>` 里每个算法都是模板化的,那个模板不区分 `vector<int>::iterator`、`list<int>::iterator` 和 *你的* `SetList<T>::iterator` — 只要你的迭代器暴露 **五个必需 traits**(`iterator_category`、`value_type`、`pointer`、`reference`、`difference_type`)。算法读这些 traits 决定 *编译哪一版本*:`std::distance` 在随机访问迭代器上 O(1),在前向迭代器上 O(n),分派在编译期完成,**运行时零开销**。STL 这么一致就靠这一点:每个算法接迭代器,每个迭代器宣告自己的能力,tag 分派挑最优策略。把 `SetList`/`MapArray` 迭代器里的 traits 写对,`std::find`、`std::ranges::equal`、range-for、结构化绑定第一天就能用。

4. **智能指针的 RAII 替代了 Rule of Three。** HW3–HW6 里你在析构里手动 `delete[] buf;`、在拷贝构造里深拷贝、在移动构造里把源指针置零写的每一行,**只要 `buf` 变成 `std::unique_ptr<char[]>` 或 `std::vector<char>` 就消失**。编译器生成的拷贝/移动/析构是正确的、不泄漏的、异常安全的。规则就一条:**用 `std::make_unique<T>(args)` 或 `std::make_shared<T>(args)`,永不要裸 `new`。** 唯一还不能委托给智能指针的地方是 HW9 的 `SetList`:按 Klefstad PPT slide 6 警告,`unique_ptr<Node>` 的 `next` 字段让迭代器不可行,因为裸迭代器会跟被持有的链起别名。**HW9 `SetList` 用裸 `ListNode*` 并手写 Rule of Three;`MapArray` 用 `std::vector` 拥抱 Rule of Zero。** 知道 *什么时候用哪个* 是这周的成熟度门槛。

5. **按 Klefstad 指定的顺序 — 递进地 — 写 HW9,不然你会沉。** 诱惑是把整个 `mapset.cpp` 一口气重写,然后一墙编译错误一起调。别这么干。配方是:(a) 让你能跑的 HW8 `mapset` 一直能跑,(b) 写 `SetList<T>` + 它的迭代器 + 隔离 gtest,直到绿,(c) 在 `mapset.cpp` 里把 `std::set` 换成 `SetList`,让编译器告诉你缺啥,(d) 测整合后的 `mapset` 直到完全工作,(e) **回退**,然后对 `MapArray<K,V>` 替换 `std::map` 重复同样循环,(f) 最后启用两个。**永远一次换一个容器。** 这不只是风格偏好 — 这是你让错误信息保持诊断价值而不是灾难的方式,也是你在 autograder 发现之前先发现自己忘了暴露 `value_type` 的方式。

> ⚠️ **PPT-vs.-阅读 优先级提醒**:当 Klefstad 的 PPT 和 LearnCpp 在术语或实现细节上分歧时,**PPT 赢**(它对本课程是权威的)。不确定某材料属于 Week 9 还是 Week 10 时(比如 Topic 9 slide 2 上 cppreference ranges 链接里更深的内容),材料 **包含进来** 这里 — 宁可过度覆盖。

> 💡 **展望 Week 10** — Topic 9 PPT slides 12–15(`SetList` / `MapArray` 迭代器细节)和 slide 9(HW9 递进开发)会延伸到 Week 10 的 lab 和作业周期。Week 10 阅读可能更深入模板、`<algorithm>` 其余部分,可能还有 `std::function` 和 lambda 的更多细节。Topic 9 PPT 还没有暴露 Week 11+ 的内容;根据课程大纲,期末前可能会看到 `ICS_45c_Week_12_C_Tour.pdf`(C 兼容性巡礼)和更深入的模板。