# Information and Computer Science 46 — Lecture 3：算法分析 + ArrayList

## 目录

- [1. 2-Sum 问题：统计操作次数](#1-2-sum-问题统计操作次数)
- [2. 渐近分析：Big-O、Big-Ω、Big-Θ](#2-渐近分析big-obig-ωbig-θ)
- [3. 常见的增长阶](#3-常见的增长阶)
- [4. 空间复杂度](#4-空间复杂度)
- [5. 为什么需要数据结构？](#5-为什么需要数据结构)
- [6. ArrayList（动态数组）](#6-arraylist动态数组)
- [7. 扩容与摊还分析](#7-扩容与摊还分析)
- [8. 完整实现](#8-完整实现)
- [9. 课堂活动（附解答）](#9-课堂活动附解答)
- [10. 速查与必记的 5 个要点](#10-速查与必记的-5-个要点)

> UCI ICS 46 — Prof. Tom Yeh，2026 年秋季学期，10/6/26。内容整理自 Lecture 3 的幻灯片（并补入 Lecture 2 幻灯片 34 的 2-Sum 题目），以 Thornton 的 *Asymptotic Analysis* / *Amortized Analysis* 笔记和 algs4 §1.4 作为补充。按概念组织，而不是按来源组织。

> 📅 **课程安排**（幻灯片 2）：
> HW 1 和 HW 2 已发布；**HW 2 截止时间为 10/16（周五）**。**Lab 2** 最晚 10/7 发布，**截止时间为 10/19（周一）**——可以去找 TA 的 office hours。
> **10/9 和 10/16（周五）的 Learning Activities** 合并计入 Quiz 1；无需提前准备，评分会宽松地调分（curve）。
> Metacog 研究同意书（无论是否同意）：可获得 **1% 额外加分**（另有替代方案）；数据会匿名化，不会用于学术诚信（academic integrity）调查。

今天的目标（幻灯片 3）：学完算法分析（数学模型 → Big-O/Ω/Θ），然后学第一个数据结构——**ArrayList**。

---

## 1. 2-Sum 问题：统计操作次数

> ⬅️ **承接 Lecture 2**：2-Sum 活动在 [Lecture 2](lec-02.zh-CN.md) 末尾提出（幻灯片 34，同时介绍了数学模型和波浪号（tilde）记法）；本讲的幻灯片 4 给出了解答。

**问题：**给定 n 个互不相同的数，有多少个*无序*数对（“duplet”）的和为 0？暴力解法对每个满足 `i < j` 的数对恰好检查一次：

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = i+1; j < n; j++) {
        if (a[i] + a[j] == 0) {
            count++;
        }
    }
}
```

对于固定的 `i`，内层循环体执行 `n - i - 1` 次，所以总共执行 $(n-1) + \dots + 1 + 0 = n(n-1)/2$ 次（每个数对一次）。每个循环的*判断条件*比循环体多执行一次。幻灯片 4 的统计结果：

| 操作 | 次数（幻灯片 4） | 来源 |
|---|---|---|
| 变量声明 | $n + 2$ | `count`、`i`，以及每次外层迭代各声明一次 `j` |
| 赋值 | $n + 2$ | `count = 0`、`i = 0`、`j = i+1` ×n |
| 小于比较 | $(n+1)(n+2)/2$ | 外层：$n+1$；内层：$n + (n-1) + \dots + 1 = n(n+1)/2$ |
| 等于比较 | $n(n-1)/2$ | 每个内层循环体一次 |
| 数组访问 | $n(n-1)$ | `a[i]`、`a[j]`：每个内层循环体 2 次 |
| 自增 | $n(n+1)/2$ 到 $n^2$ | `i++` ×n + `j++` ×n(n−1)/2，再加上 0 次或多次 `count++` |

幻灯片的结论是：**“Already becoming too tedious to calculate!”**（已经繁琐到算不下去了！）——所以只选一种成本模型（数组访问），并只保留最高次项：暴力 2-Sum 进行 **$\sim n^2$** 次数组访问。本讲后面连常数也一并忽略。

插桩运行的结果（每一行都吻合）：

```text
n=10 (no pairs)  pairs=0 decl=12 assign=12 less=66 eq=45 access=90 incr=55
   formulas: n+2=12 (n+1)(n+2)/2=66 n(n-1)/2=45 n(n-1)=90 n(n+1)/2=55 n^2=100
```

> ⚠️ **易错点**：循环判断条件会比循环体**多执行一次**（最后那次失败的判断）——外层的 `<` 是 $n+1$ 次，而不是 $n$ 次。

> 📝 **练习**：[活动 3：2-Sum](#91-活动-32-sumlec-02-幻灯片-34解答见幻灯片-4)

---

## 2. 渐近分析：Big-O、Big-Ω、Big-Θ

### 2.1 为什么要“往大处想”（幻灯片 5–7）

幻灯片 6 比较了 $f(n) = n$、$g(n) = 4n$、$h(n) = n^2$。当 n 很小时，$f$ 和 $g$ 看起来差别很大，$h$ 甚至比它们*更低*（$n < 4$ 时 $n^2 < 4n$）。当 n 很大时，$f$ 和 $g$ 相对于 $h$ 看起来很相似，而 $h$ 的增长速度明显不同。

**渐近分析（asymptotic analysis）**（幻灯片 7）把运行时间描述为输入规模 n 的函数，并且只关注 n 变大时的增长情况：**忽略小的 n（“THINK BIG”）**；**增长率越慢 = 算法越好**。

| n | $f = n$ | $g = 4n$ | $h = n^2$ |
|---|---|---|---|
| 2 | 2 | 8 | 4 |
| 4 | 4 | 16 | 16 |
| 100 | 100 | 400 | 10,000 |

### 2.2 Big-O：上界（幻灯片 8–10）

如果存在正常数 $c$ 和 $n_0$，使得

$$f(n) \le c \cdot g(n) \quad \text{for all } n \ge n_0,$$

则称 $f(n)$ 是 $O(g(n))$。

$f$ 是实际的运行时间，$g$ 是形状相同但更简单的函数；$c$ 吸收常数因子，$n_0$ 忽略小的 n。通俗地说：“我的代码**至多**花这么长时间。”幻灯片 9 的例子：$3n^3 + 2n + 7 = O(n^3)$；$2^n + n^2 = O(2^n)$；$1000 = O(1)$；而 $3n^3 + 2n + 7 = O(n^6)$ 虽然成立，但**是个没用的界**——要给出最紧的界。Big-O（幻灯片 10）让我们能在 n 增大时做高层次的比较，并忽略底层细节：它**不是**精确的运行时间。

**求 $c$、$n_0$ 的例子：**当 $n \ge 1$ 时，$2n \le 2n^3$ 且 $7 \le 7n^3$，所以 $3n^3 + 2n + 7 \le 12n^3$。因此取 $c = 12$、$n_0 = 1$ 即可，$3n^3 + 2n + 7 = O(n^3)$。捷径：**保留增长最快的项，去掉它的系数。**

> 📝 **练习**：[幻灯片 8 的题目](#92-幻灯片题目从图中读出界幻灯片-81112)——n、4n、n² 中哪一个是这条曲线的上界？答案：只有 n²。

### 2.3 Big-Ω：下界（幻灯片 11）

如果存在正的 $c$、$n_0$，使得对所有 $n \ge n_0$ 都有 $f(n) \ge c \cdot g(n)$，则称 $f(n)$ 是 $\Omega(g(n))$——“**至少**花这么长时间”。Ω 可以描述整类算法：每一种基于比较的排序都是 $\Omega(n \log n)$。

幻灯片 11 的图：$f_1(n)$ 大部分时候处于很小的值，偶尔冲高到约 n → $\Omega(1)$；$f_2(n)$ 是一条斜率约为 1 的直线 ≈ n → $\Omega(n)$。

> 📘 **课外补充**：$f_1$ 的尖峰出现在素数处，其较低的值看起来像是每个 n 的最小因子——也就是试除法判断素数时的步数：对大多数 n 很便宜，对素数则是线性的。

### 2.4 Big-Θ：紧界（幻灯片 12–13）

如果 $f(n)$ 既是 $O(g(n))$ 又是 $\Omega(g(n))$，则称它是 $\Theta(g(n))$——“恰好花这么长时间，忽略常数和低阶项。”**如果 Big-O 和 Big-Ω 不一致，Big-Θ 就不存在（undefined）。**所以 $f_2(n) = \Theta(n)$，而 $f_1$（$O(n)$、$\Omega(1)$）没有 Θ。

| 记号 | 界 | 定义（∃ $c, n_0 > 0$，∀ $n \ge n_0$） | 通俗说法 |
|---|---|---|---|
| $O(g)$ | 上界 | $f(n) \le c \cdot g(n)$ | 至多 |
| $\Omega(g)$ | 下界 | $f(n) \ge c \cdot g(n)$ | 至少 |
| $\Theta(g)$ | 紧界 | 两者同时成立 | “恰好”，忽略常数 |

同样的记号既可以描述时间，**也**可以描述空间。

> 📝 **练习**：[活动 1](#93-活动-1big-obig-omegabig-theta幻灯片-14)、[幻灯片 11/12 的题目](#92-幻灯片题目从图中读出界幻灯片-81112)

### 2.5 情形与增长率（幻灯片 15）

这是两个独立的问题：**哪种情形？**（最好 / 平均 / 最坏输入）以及**增长得多快？**（O(1)、O(log n)、O(n)、O(n²)……）。在长度为 n 的数组中做线性查找：

| 情形 | 何时发生 | 比较次数 | 增长率 |
|---|---|---|---|
| 最好 | 目标在第一个位置 | 1 | O(1) |
| 平均 | 目标在中间 | n/2 | O(n) |
| 最坏 | 目标在最后或不存在 | n | O(n) |

> ⚠️ **易错点**：“Big-O = 最坏情形，Big-Ω = 最好情形”是**错的**。要先确定情形，再给它求界：线性查找的最坏情形是 Θ(n)，最好情形是 Θ(1)。如果不指明情形，它是 O(n) 且 Ω(1)，但没有 Θ。

---

## 3. 常见的增长阶

幻灯片 16：少数几个函数就涵盖了几乎所有算法（图来自 bigocheatsheet.com——绿色为 O(1)/O(log n)，黄色为 O(n)，橙色为 O(n log n)，红色为 O(n²)、O(2ⁿ)、O(n!)）。

| 阶 | 名称 | 典型形态 | 例子 | n = 1,000 时 |
|---|---|---|---|---|
| $1$ | 常数 | 固定的几条语句 | `a[i]` | 1 |
| $\log n$ | 对数 | 每步把范围减半 | 二分查找（binary search） | ≈10 |
| $n$ | 线性 | 一层循环 | 线性查找（linear search） | 1,000 |
| $n \log n$ | 线性对数 | 对半分治 + 线性工作量 | 归并排序（mergesort） | ≈10⁴ |
| $n^2$ | 平方 | 两层嵌套循环 | 2-Sum | 10⁶ |
| $n^3$ | 立方 | 三层嵌套循环 | 3-Sum | 10⁹ |
| $2^n$ | 指数 | 枚举每个子集 | 子集和（subset sum） | ≈10³⁰¹ |
| $n!$ | 阶乘 | 枚举每种排列 | 暴力求解 TSP | 大到难以想象 |

---

## 4. 空间复杂度

幻灯片 17：**比特（bit）**是 0/1，**字节（byte）**是 8 比特。传统的 KB/MB/GB/TB 分别是 $2^{10}/2^{20}/2^{30}/2^{40}$ 字节（是 1,024，而不是 1,000）；这些二的幂对应的 IEC 名称是 KiB/MiB/GiB/TiB。

幻灯片 18——C++ 的典型大小，下表“实测”列是在 x86-64 Linux（g++ 13）上用 `sizeof` 测得的：

| 类型 | 幻灯片 | 实测 |
|---|---|---|
| `bool`, `char` | 1 字节 | 1 |
| `short` | 2 | 2 |
| `int`, `float` | 4 | 4 |
| `long` | 4 或 8 | 8 |
| `long long`, `double` | 8 | 8 |
| 指针（`int*`） | 64 位下 8，32 位下 4 | 8 |

- **静态数组（static array）**：只有元素本身的存储，没有额外开销。**动态数组**和**对象**：存储 + 数量不定的额外开销。
- **指针**：64 位下为 8 字节。**引用**：没有保证的大小（取决于具体实现）。

> ⚠️ **易错点**：在 64 位 Windows 上 `long` 是 4 字节；如果需要精确的位宽，请用 `std::int64_t`。

> 📘 **课外补充**（algs4）：对象会为了对齐而填充（padding）——实测 `struct { char c; double d; }` 是 **16** 字节，而不是 9。

---

## 5. 为什么需要数据结构？

幻灯片 20：数据结构（data structure）**组织并存储数据**，使所需的操作足够高效（好比杂乱无章的图书馆与分类整齐的图书馆）。评判它的标准是**时间**和**空间**复杂度，而且**没有放之四海而皆准的结构**——所以才有这么多种结构。

幻灯片 21 列出的典型操作：**插入、删除、查找、替换**，以及**遍历、排序、判空**。没有哪一种结构能把它们全部做得高效；选择取决于你的数据、你需要哪些操作（以及多频繁），还有技术限制（内存、实时性）。

幻灯片 22，**线性与非线性**：

| 线性（序列；每个元素有前驱/后继） | 非线性（层次化 / 相互连接） |
|---|---|
| 连续存储：数组、ArrayList（今天） | 树：二叉树、BST |
| 基于指针：单向/双向链表（Lec 4） | 图：结点和边 |
| 顺序访问：栈、队列 | 内存不连续，非顺序遍历 |

---

## 6. ArrayList（动态数组）

### 6.1 状态（幻灯片 24–25）

ArrayList（可变长 / 动态数组）是一种**从 0 开始编号的线性结构**，存放在**连续内存**中，由一个**具有某个容量的底层数组**支撑。和数组一样，它支持 **O(1) 的按下标访问**。它包含三样东西：**elements** 数组、**size**（元素个数）和 **capacity**（已分配的长度）。它会自动分配/释放内存，使用前 `size` 个格子，满了之后就分配一个更大的数组并把所有元素复制过去。它与 `std::vector` 相对应。

幻灯片 24 的图——capacity 为 8，size 为 3，虚线格子是已分配但未使用的：

```viz arraylist
{"title": "幻灯片 24：capacity 8，size 3", "ops": "add(ICS46); add(ROCKS); add(!)", "capacity": 8, "start": 7, "code": "none"}
```

不变式：**size ≤ capacity**；格子 `[size, capacity)` 中没有有意义的内容。

### 6.2 API（幻灯片 26）

| 分组 | 操作 | 含义 |
|---|---|---|
| 构造函数 | `ArrayList()` | 空表，**初始容量为 2** |
| | `ArrayList(int capacity)` | 空表，指定容量 |
| 查询 | `isEmpty()`, `size()`, `at(int index)` | 是否为空、元素个数、下标处的元素 |
| 修改 | `add(Item item)` | 追加到末尾 |
| | `add(int index, Item item)` | 插入，后面的元素右移 |
| | `Item remove()` | 删除并返回最后一个元素 |
| | `Item remove(int index)` | 删除指定下标处的元素，后面的元素左移 |
| | `set(int index, Item item)` | 替换指定下标处的元素 |

跟踪（trace）用的幻灯片使用 `std::string` 版本（`void add(const std::string& s)`）。

### 6.3 跟踪（幻灯片 27–35）

每张幻灯片多加一行代码，并问“应该发生什么？”：

| 幻灯片 | 调用 | 内容 | Size | Cap | 发生了什么 |
|---|---|---|---|---|---|
| 27 | `ArrayList a1;` | — | 0 | 2 | 默认容量为 2 |
| 28 | `a1.add("ICS46");` | ICS46 | 1 | 2 | 存到下标 size 处 |
| 29 | `a1.add("Rocks");` | ICS46, Rocks | 2 | 2 | 现在满了 |
| 30 | `a1.add("!");` | ICS46, Rocks, ! | 3 | **4** | 已满 → 翻倍、复制，然后添加 |
| 31 | `a1.add(1, "Throws");` | ICS46, Throws, Rocks, ! | 4 | 4 | Rocks、! 右移 |
| 32 | `a1.add(3, "?");` | ICS46, Throws, Rocks, ?, ! | 5 | **8** | 已满 → 翻倍、右移，然后添加 |
| 33 | `a1.remove();` | ICS46, Throws, Rocks, ? | 4 | 8 | 返回 `!` |
| 34 | `a1.remove();` | ICS46, Throws, Rocks | 3 | 8 | 返回 `?` |
| 35 | `a1.remove();` | ICS46, Throws | 2 | **4** | 返回 `Rocks`；2/8 = ¼ 满 → 减半 |

把幻灯片上的程序放到 [§8](#8-完整实现) 的实现上运行，得到相同的状态（之后调用 `a1.at(5)` 会抛出 `out_of_range: index 5`）。

整个跟踪过程，一次移动一个元素——你也可以在下方输入框里试自己的调用。在下面一步步演示（演示获得焦点时，可用 ← / → 键）：

```viz arraylist
{"title": "幻灯片 27–35", "ops": "add(ICS46); add(Rocks); add(!); add(1, Throws); add(3, ?); remove(); remove(); remove()", "interactive": true}
```

> ⚠️ **幻灯片错误**：p32 的标题写的是 `remove()`，但所展示的步骤却是 `a1.add(3, "?")`（标题是从 p33 沿用过来的）。

> 📝 **练习**：[ArrayList 跟踪](#94-arraylist-跟踪应该发生什么幻灯片-2735)

### 6.4 扩容时发生了什么（幻灯片 30）

数组已满时，`add` 会分配两倍容量的新数组，复制全部 n 个元素（**这就是 Θ(n) 的部分**），释放旧数组，让 `data_` 重新指向新数组，然后再存入新元素。指针的变化才是关键，所以这里演示一次：

幻灯片 30 中，对已满的容量为 2 的数组执行 `a1.add("!")`（演示从扩容那一步开始）。在下面一步步演示（演示获得焦点时，可用 ← / → 键）：

```viz arraylist
{"title": "幻灯片 30：对已满的 ArrayList 执行 add", "ops": "add(ICS46); add(Rocks); add(!)", "start": 7}
```

`add(index, item)` 则是把 `data_[index..n-1]` 向右移动一格，并且是**从后往前**（`for (size_t i = n_; i > index; --i) data_[i] = data_[i-1];`），这样没有任何元素在被移走之前就被覆盖；`remove(index)` 向左移动，从前往后。

> ⚠️ **易错点**：**先**复制，**再** `delete[]`，最后再重新赋值——先删除会丢失数据，先重新赋值会泄漏旧缓冲区。

### 6.5 运行时间

| 操作 | 最坏情况 | 摊还（amortized） |
|---|---|---|
| `isEmpty`, `size`, `at`, `set` | O(1) | — |
| `add(x)`（末尾） | O(n) | **O(1)** |
| `remove()`（末尾） | 带缩容时为 O(n) | O(1) |
| `add(i, x)`, `remove(i)` | O(n)（移动元素） | O(n) |

在末尾操作和随机访问上表现很好，在头部/中间则很差——Lecture 4 的链表恰好做出了相反的取舍。

---

## 7. 扩容与摊还分析

### 7.1 策略与最坏情况（幻灯片 36–38）

| | 扩容 | 缩容 |
|---|---|---|
| 触发条件 | 向**已满**的表添加元素 | 表变为 **¼ 满** |
| 动作 | 容量 × 2 | 容量 × ½ |
| 代价 | 复制所有元素 | 复制所有元素 |

**关键问题（幻灯片 38）：**`add()` 的最坏情况是什么？**成本模型：**插入记 1，复制 n 个元素记 n。所以一次 `add` 平时的成本是 1，触发扩容时是 n + 1：**最坏情况 O(n)**。对一连串的 add 来说，这个估计过于悲观——于是引出摊还分析（amortized analysis）。

> 📘 **课外补充**：在 ¼ 处（而不是 ½ 处）缩容可以避免抖动（thrashing）——如果在 ½ 处缩容，在边界上交替执行 add/remove 会导致每次调用都要扩容/缩容，每次代价 Θ(n)。

### 7.2 摊还成本（幻灯片 39）

**每次操作的摊还成本（amortized cost）** = 一连串 n 次操作的总成本 ÷ n。方法有：**聚合法（aggregate）**（给总成本 T(n) 求界再除以 n——这里使用的方法）、**记账法（accounting）**（收取固定价格，存入信用）、**势能法（potential）**（用势函数存储“能量”）。

> 💡 **关键洞察**：摊还 ≠ 平均情形。这里不涉及概率：它是对任意操作序列*总成本*的最坏情形保证。

### 7.3 翻倍与每次只增加 1（幻灯片 40–44）

从容量 1 开始，调用 n 次 `add`。当数组已满时，第 (k+1) 次 add 要复制 k 个元素：

| k | 0 | 1 | 2 | 3 | 4 | 5–7 | 8 | 9–15 | 16 |
|---|---|---|---|---|---|---|---|---|---|
| 复制成本，×2（幻灯片 40–43） | 0 | 1 | 2 | 0 | 4 | 0 | 8 | 0 | 16 |
| 复制成本，+1（幻灯片 44） | 0 | 1 | 2 | 3 | 4 | 5–7 | 8 | 9–15 | 16 |

（每一列的插入成本都是 1；总成本 = 插入 + 复制。）

观察 +1 增长时复制的次数是如何不断累积的——在脑中把 `growth` 换成翻倍，再与表格对照。在下面一步步演示（演示获得焦点时，可用 ← / → 键）：

```viz arraylist
{"title": "每次只增加 1：除第一次外，每次 add 都要复制全部元素", "ops": "add(A); add(B); add(C); add(D); add(E); add(F)", "capacity": 1, "growth": "plus1"}
```

- **翻倍：**复制次数 $= 1 + 2 + 4 + \dots + 2^{\lfloor \log_2 n \rfloor} \le 2n$（等比数列，公比为 2），插入 $= n$，总计 $\le 3n$ → **摊还 O(1)**，但是“不均匀”（lumpy）：扩容发生的间隔变为两倍，每次的代价也变为两倍。
- **+1：**总计 $= n + (0 + 1 + \dots + (n-1)) = n + n(n-1)/2 = \Theta(n^2)$ → **摊还 Θ(n)**。

实测的元素复制次数（初始容量为 1）：

```text
n=17  doubling: 31 copies (2.82353 per add)   +1: 136 copies (9 per add)
n=1000000  doubling: 1048575 copies (2.04858 per add)   +1: 499999500000 copies (500000 per add)
```

> ⚠️ **易错点**：要说“`add` 是**摊还** O(1)，**最坏情况** O(n)”——漏掉“摊还”二字就是错的。

> 📘 **课外补充**（Thornton）：摊还 O(1) 对总时间来说没问题，但如果*每一次*操作都有截止时间（实时控制、60 fps 的游戏），就不行了——一次 O(n) 的扩容就意味着掉一帧。

> 📝 **练习**：[活动 2](#95-活动-2摊还分析每次增加-1幻灯片-44)

---

## 8. 完整实现

```cpp
#include <cstddef>
#include <stdexcept>
#include <string>
#include <utility>

template <typename T>
class ArrayList {
public:
    ArrayList() : ArrayList(2) {}                       // slide 26: initial capacity 2
    explicit ArrayList(size_t capacity)
        : data_{new T[capacity > 0 ? capacity : 1]},
          capacity_{capacity > 0 ? capacity : 1}, n_{0} {}

    // Rule of three: we own data_, so copying must copy the buffer.
    ~ArrayList() { delete[] data_; }
    ArrayList(const ArrayList& other)
        : data_{new T[other.capacity_]}, capacity_{other.capacity_}, n_{other.n_} {
        for (size_t i = 0; i < n_; ++i) data_[i] = other.data_[i];
    }
    ArrayList& operator=(ArrayList other) {             // copy-and-swap
        std::swap(data_, other.data_);
        std::swap(capacity_, other.capacity_);
        std::swap(n_, other.n_);
        return *this;
    }

    bool isEmpty() const { return n_ == 0; }
    size_t size() const { return n_; }
    size_t capacity() const { return capacity_; }

    const T& at(size_t index) const { rangeCheck(index); return data_[index]; }

    void set(size_t index, const T& item) { rangeCheck(index); data_[index] = item; }

    void add(const T& item) {                          // append at the end
        if (n_ == capacity_) resize(2 * capacity_);
        data_[n_++] = item;
    }

    void add(size_t index, const T& item) {            // insert, shift right
        if (index > n_) throw std::out_of_range("add: index " + std::to_string(index));
        if (n_ == capacity_) resize(2 * capacity_);
        for (size_t i = n_; i > index; --i) data_[i] = data_[i - 1];
        data_[index] = item;
        ++n_;
    }

    T remove() {                                       // remove from the end
        if (n_ == 0) throw std::out_of_range("remove from empty ArrayList");
        T item = data_[--n_];
        shrinkIfSparse();
        return item;
    }

    T remove(size_t index) {                           // remove at index, shift left
        rangeCheck(index);
        T item = data_[index];
        for (size_t i = index; i + 1 < n_; ++i) data_[i] = data_[i + 1];
        --n_;
        shrinkIfSparse();
        return item;
    }

private:
    T* data_;
    size_t capacity_;
    size_t n_;

    void rangeCheck(size_t index) const {
        if (index >= n_) throw std::out_of_range("index " + std::to_string(index));
    }
    void shrinkIfSparse() {                            // slide 36: halve when 1/4 full
        if (capacity_ > 1 && n_ <= capacity_ / 4) resize(capacity_ / 2);
    }
    void resize(size_t newCapacity) {
        T* bigger = new T[newCapacity];
        for (size_t i = 0; i < n_; ++i) bigger[i] = data_[i];
        delete[] data_;
        data_ = bigger;
        capacity_ = newCapacity;
    }
};
```

---

## 9. 课堂活动（附解答）

### 9.1 活动 3：2-Sum（Lec 02 幻灯片 34；解答见幻灯片 4）

给定 n 个互不相同的数，有多少个无序 duplet 的和为 0？每种操作（变量声明、赋值、小于比较、等于比较、数组访问、自增）各执行多少次，写成关于 **n** 的函数？（代码见 [§1](#1-2-sum-问题统计操作次数)。）

**解答。**声明 $n+2$ 次，赋值 $n+2$ 次，`<` $(n+1)(n+2)/2$ 次，`==` $n(n-1)/2$ 次，数组访问 $n(n-1)$ 次，自增 $n(n+1)/2$ 到 $n^2$ 次。关键原因：内层循环体每个数对执行一次，共 $n(n-1)/2$ 次，而每个循环的判断条件比循环体多执行一次。波浪号记法：$\sim n^2$ 次数组访问。

### 9.2 幻灯片题目：从图中读出界（幻灯片 8、11、12）

**(a)**（幻灯片 8）f(n) 是一条比直线上升更快的曲线，g(n) 取 $n$、$4n$、$n^2$ 中的哪一个可以作为 f(n) 的 Big-O？
**(b)**（幻灯片 11）$f_1(n)$ 和 $f_2(n)$ 的 Big-Omega 分别是什么？
**(c)**（幻灯片 12）$f_1(n)$ 和 $f_2(n)$ 的 Big-Theta 分别是什么？

**解答。**(a) 只有 $n^2$——直线乘以任何常数，都无法一直位于增长更快的曲线之上；而且 $n$ 和 $4n$ 本来就属于同一类。(b) $f_1 = \Omega(1)$（有无穷多个很小的值），$f_2 = \Omega(n)$。(c) $f_1$：O(n) 但 Ω(1)，所以 **Θ 不存在**；$f_2 = \Theta(n)$。

### 9.3 活动 1：Big-O、Big-Omega、Big-Theta（幻灯片 14）

给定一个由 n 个三位整数组成、顺序随机的数组，分别用 Big-O、Big-Omega、Big-Theta 描述下列操作的时间复杂度：(a) 1. 把所有元素打印到 std::out；2. 在（未排序的）数组中查找某个数。(b) 求下列各式的 Big-O：1. T(n) = 7n − 2000；2. T(n) = n³ + 46n² + 10000；3. T(n) = 3 log n + 5n。

**解答。**

| 任务 | O | Ω | Θ |
|---|---|---|---|
| 全部打印 | O(n) | Ω(n) | Θ(n)——任何输入都要访问全部 n 个元素 |
| 在未排序数组中查找 | O(n) | Ω(1) | 不指明情形就没有（最好 Θ(1)，最坏 Θ(n)） |

(b) 1. O(n)（−2000 只在 n 较小时才有影响）。2. O(n³)。3. O(n)（log n 比 n 增长得慢）。

### 9.4 ArrayList 跟踪：“应该发生什么？”（幻灯片 27–35）

从 `ArrayList a1;` 开始，预测依次执行下列操作后的内容、size 和 capacity：`add("ICS46")`、`add("Rocks")`、`add("!")`、`add(1, "Throws")`、`add(3, "?")`，然后三次 `remove()`。

**解答。**1/2 → 2/2（已满）→ `!` 触发翻倍：3/4 → Throws 使 Rocks、! 右移：4/4 → `?` 触发翻倍到 8，`!` 右移：[ICS46, Throws, Rocks, ?, !] 5/8 → 三次 remove 依次返回 `!`、`?`、`Rocks`；到 2/8 = ¼ 容量时减半：[ICS46, Throws] 2/4。表格见：[§6.3](#63-跟踪幻灯片-2735)。

### 9.5 活动 2：摊还分析——每次增加 1（幻灯片 44）

如果 ArrayList 在已满时只多增加 1 个位置，那么它的 `add()` 的摊还时间复杂度是多少？

**解答。** **每次 add 摊还 Θ(n)。** 每次 add 之前数组都是满的，所以第 (k+1) 次 add 要复制 k 个元素：总计 $n + n(n-1)/2 = \Theta(n^2)$，再除以 n。翻倍策略的总成本 ≤ 3n，摊还 O(1)。

---

## 10. 速查与必记的 5 个要点

| 主题 | 要点 |
|---|---|
| $O / \Omega / \Theta$ | ≤ / ≥ / 两者兼具，对某些 $c, n_0$ 以及所有 $n \ge n_0$ |
| 增长阶顺序 | $1 < \log n < n < n\log n < n^2 < n^3 < 2^n < n!$ |
| 2-Sum 暴力解法 | $\sim n^2$ 次数组访问，$\Theta(n^2)$ |
| ArrayList `at` / `set` / `size` | O(1) |
| ArrayList 末尾的 `add(x)`、`remove()` | 摊还 O(1)，最坏 O(n) |
| ArrayList `add(i,x)` / `remove(i)` | O(n) |
| 扩缩容策略 | 默认容量 2；满了 ×2；¼ 满时 ×½ |
| 每次增长 +1 | 每次 `add` 摊还 Θ(n) |

### 必记的 5 个要点

1. Big-O 是上界，Big-Ω 是下界，Big-Θ 两者兼具——当两者不一致时 Θ 不存在。
2. 情形（最好/平均/最坏）和界（O/Ω/Θ）是两个独立的问题：先确定情形，再给它求界。
3. 要从公式中读出 Big-O，保留增长最快的项并去掉它的常数（$7n - 2000 = O(n)$）。
4. ArrayList 的 `add` 是摊还 O(1)、最坏 O(n)，因为翻倍使复制次数构成一个和 ≤ 2n 的等比数列。
5. 每次只增加一个常数、而不是乘以一个倍数来扩容，会让 `add` 摊还 Θ(n)（n 次 add 的成本为 Θ(n²)）。