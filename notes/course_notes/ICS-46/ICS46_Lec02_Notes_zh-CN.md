# Information and Computer Science 46 — Lecture 2：智能指针、多维数组、实测分析

## 目录

- [1. 智能指针：所有权（收尾）](#1-智能指针所有权收尾)
- [2. C++ 一维数组（自学复习）](#2-c-一维数组自学复习)
- [3. 多维数组](#3-多维数组)
- [4. 为什么要分析算法？](#4-为什么要分析算法)
- [5. 运行时间的实测分析](#5-运行时间的实测分析)
- [6. 运行时间的数学模型](#6-运行时间的数学模型)
- [7. 课堂活动（附解答）](#7-课堂活动附解答)
- [8. 速查与必记的 5 个要点](#8-速查与必记的-5-个要点)

> UCI ICS 46 — Prof. Tom Yeh，Fall 2026，10/1/26。内容整理自 Lecture 2 的幻灯片；Thornton 的 ICS 46/45C 笔记和 algs4 booksite §1.4 仅作简短补充。按概念组织，而不是按来源组织。

> 📅 **课程安排**
> Lab 1 截止日期为 **Mon 10/5**。HW 1 已发布（无需提交）。
> 带有活动解答的更新版幻灯片会在每周末发布。
> 额外加分（1%）：同意将 AI 活动数据用于研究，或完成替代任务——详情见 Ed。
> 今日目标（幻灯片 3）：讲完智能指针、多维数据、算法分析。

---

## 1. 智能指针：所有权（收尾）

Lecture 1 的时间不够，没来得及做树的活动，所以智能指针复习、这个活动及其解答都放到了这一讲（幻灯片 4–11）。关于裸指针（raw pointer）、引用和 `new`/`delete`，见 [Lecture 1 笔记](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec01_Notes_zh-CN.md)。

### 1.1 智能指针复习

智能指针（smart pointer，`#include <memory>`）会在指针本身销毁时自动 delete 它所指的对象。幻灯片 5 列出了三种（幻灯片把其中一个拼成了“`std::share_ptr`”，正确的名字是 `std::shared_ptr`）：

| Pointer | Ownership | Object destroyed when… | Copyable? |
|---|---|---|---|
| `std::unique_ptr` | 一对一 | 该指针被销毁时 | 否——用 `std::move` 转移 |
| `std::shared_ptr` | 多对一（引用计数） | **最后一个**拥有它的指针被销毁时 | 可以（计数 +1） |
| `std::weak_ptr` | 无所有权——“借出” | 永不：它销毁时不做任何清理 | 可以 |

`weak_ptr` 用于函数参数和**循环数据结构**（cyclic data structure）。**`.get()`** 从智能指针中取出裸地址。

```cpp
std::unique_ptr<int> p(new int);
*p = 3;                  // * and -> work like a raw pointer
// std::unique_ptr<int> q = p;          // error: copy is deleted
std::unique_ptr<int> q = std::move(p);  // OK: q owns it, p is now nullptr
```

> ⚠️ **易错点**：`shared_ptr` 不是垃圾回收——`shared_ptr` 组成的**环**（父节点拥有子节点，子节点又拥有父节点）永远到不了计数 0，会造成内存泄漏。这正是下面树的活动里的陷阱。

### 1.2 裸指针与智能指针配合使用

幻灯片 11 的经验法则：

- **所有者（Owner）**——智能指针控制资源的生命周期。
- **观察者（Observer）**——裸指针可以查看（读、写、检查）对象，但**不负责销毁它**。
- **`.get()`** 交出一个临时的、非拥有的裸指针，**同时不放弃所有权**。

```cpp
root->left->parent = root.get();   // parent observes root; root still owns it
```

| Working design for a tree with parent links | When to use |
|---|---|
| `shared_ptr` 向下 + `weak_ptr` 向上 | 生命周期共享或不可预测、需要打破环；观察者可以检查对象是否已不存在（`lock()`、`expired()`） |
| `unique_ptr` 向下 + 裸 `Node*` 向上（通过 `.get()`） | 更快（无需计数）；**只有在所有者比观察者活得更久时**才安全——树里正是如此，因为父节点的析构函数会销毁它的子节点 |

> 📘 **课外补充**：Thornton 关于“把对象借给函数”的规则：优先用引用（`const Node&`），因为它不可能为空；如果 `nullptr` 是合法实参就用裸指针；只有当借用者可能比所有者活得更久时才用 `weak_ptr`。

### 1.3 树的活动：四种设计

活动（幻灯片 6）从一个裸指针版 `Node` 开始，它有 `left`、`right`、`parent`，用三个 `new Node()` 建立父↔子链接，再手动写三个 `delete`（幻灯片注释：“Manual cleanup is fragile. Deleting out-of-order causes crash”）。四种设计都用 `g++ -std=c++17 -Wall -fsanitize=address,undefined` 编译过：

| Design (slide) | `left` / `right` | `parent` | Compiles? | Result |
|---|---|---|---|---|
| 裸指针（p6） | `Node*` | `Node*` | 能 | 只有每个 `delete` 都手写对才正确；`delete root` 之后有三个指针悬空 |
| (a)/(b) 朴素版（p7–8） | `unique_ptr` | `unique_ptr` | **不能** | `root->left = leftChild;` 复制了一个 `unique_ptr` → “use of deleted function … `operator=`” |
| (c)（p9） | `shared_ptr` | `weak_ptr` | 能 | 3 个析构函数全部运行，无泄漏 |
| (c′) 全用 shared（反例） | `shared_ptr` | `shared_ptr` | 能 | **泄漏**：没有任何析构函数运行（ASan：6 次分配共 216 字节） |
| (d)（p10） | `unique_ptr` | 裸 `Node*` | 能 | 3 个析构函数全部运行，无泄漏，无需计数 |

幻灯片 10 的 (d) 版本：

```cpp
class Node {
public:
    Node() { std::cout << "Node created\n"; }
    ~Node() { std::cout << "Node destroyed\n"; }

    // Downward links hold exclusive ownership
    std::unique_ptr<Node> left;
    std::unique_ptr<Node> right;

    // Upward link is a non-owning observer
    Node* parent = nullptr;
};

int main() {
    {
        // 1. Initialize nodes as unique pointers
        std::unique_ptr<Node> root(new Node());
        std::unique_ptr<Node> leftChild(new Node());
        std::unique_ptr<Node> rightChild(new Node());

        // 2. Transfer ownership downward using std::move
        root->left = std::move(leftChild);
        root->right = std::move(rightChild);

        // 3. Set upward back-pointers using the raw address (.get())
        root->left->parent = root.get();
        root->right->parent = root.get();
    } // <-- All 3 nodes are completely destroyed here automatically!

    std::cout << "End of main.\n";
    return 0;
}
```

设计 (d) 在内存中的样子：拥有所有权的 `unique_ptr` 指向下方，裸 `parent` 指针指向上方，被 move 过的局部变量是 `nullptr`。在下面逐步演示（演示获得焦点时，← / → 键可用）：

```viz memory-trace
{"title": "设计 (d)：unique_ptr 向下，裸指针向上（幻灯片 10）", "steps": [{"code": "root->left = std::move(leftChild); ... root->left->parent = root.get(); ...", "note": "每个 Node 恰好有一个所有者；被 move 过的局部变量是 nullptr；parent 链接只是观察", "stack": [{"frame": "main", "vars": [{"name": "root (unique_ptr)", "value": "->n0"}, {"name": "leftChild (unique_ptr)", "value": "nullptr", "old_target": "n1"}, {"name": "rightChild (unique_ptr)", "value": "nullptr", "old_target": "n2"}]}], "heap": [{"id": "n0", "type": "Node (root)", "fields": [{"name": "left (unique_ptr)", "value": "->n1"}, {"name": "right (unique_ptr)", "value": "->n2"}, {"name": "parent (Node*)", "value": "nullptr"}]}, {"id": "n1", "type": "Node (left child)", "fields": [{"name": "left (unique_ptr)", "value": "nullptr"}, {"name": "right (unique_ptr)", "value": "nullptr"}, {"name": "parent (Node*)", "value": "->n0"}]}, {"id": "n2", "type": "Node (right child)", "fields": [{"name": "left (unique_ptr)", "value": "nullptr"}, {"name": "right (unique_ptr)", "value": "nullptr"}, {"name": "parent (Node*)", "value": "->n0"}]}]}, {"code": "}   // end of block", "note": "root 销毁 -> delete n0 -> n0 的 left/right 销毁 -> delete n1 和 n2。没有泄漏，也没有重复 delete", "free": ["n0", "n1", "n2"], "set": {"main.root (unique_ptr)": {"value": "nullptr", "old_target": "n0"}}}]}
```

输出（第 2 步之后多加了一行，打印 `leftChild` 是否为空）：

```text
Node created
Node created
Node created
leftChild is now nullptr
Node destroyed
Node destroyed
Node destroyed
End of main.
```

> ⚠️ **易错点**：执行 `std::move(leftChild)` 之后，`leftChild` 就是 `nullptr`——所以幻灯片 10 写的是 `root->left->parent`，而不是 `leftChild->parent`（幻灯片 9 的 `shared_ptr` 版本仍然可以这样写）。

> 📝 **练习**：[上一讲的活动 (a)–(d)](#71-上一讲的活动-ad幻灯片-610)

---

## 2. C++ 一维数组（自学复习）

幻灯片 12 把这一部分标为自学复习（ICS 45C 的内容）。

### 2.1 静态分配与动态分配

数组（array）是同一类型的一段连续单元，下标从 0 开始，大小固定，且需要你自己记录（幻灯片 13）：

| | Statically allocated | Dynamically allocated |
|---|---|---|
| Syntax | `int a[10];` | `int* a = new int[size];` |
| Size known | 编译期 | 运行期 |
| Lives on | 运行时栈 | 堆；`new` 返回指向第一个元素的指针 |
| Cleanup | 自动 | `delete[] a;` |

幻灯片里的 `void foo(unsigned int n) { int a[n]; }` 是**变长数组**（variable-length array）：有些编译器接受，但它**不是标准 C++**（g++ `-pedantic`：`warning: ISO C++ forbids variable length array 'a' [-Wvla]`），而且 `n` 很大时会栈溢出。

### 2.2 传递数组与指针运算

幻灯片 14：无论数组是怎么分配的，都可以把它作为参数传递——传入**指向第一个元素的指针**加上**大小**，以便手动做越界检查。

```cpp
void zeroArray(int* a, unsigned int size)
{
    for (unsigned int i = 0; i < size; ++i)
    {
        a[i] = 0;
    }
}
```

```cpp
int x[10];
zeroFill(x, 50);

int* x = new int[10];
zeroFill(x, 50);
```

两个调用都能无警告编译，并且都会越过末尾多写 40 个 int；size 只是一个数字，C++ 对它是完全信任的。ASan 能抓到动态分配的那个：`heap-buffer-overflow … 0 bytes after 40-byte region … in zeroFill(int*, unsigned int)`。

> ⚠️ **幻灯片错误（p14）**：函数定义里叫 `zeroArray`，调用时却写成 `zeroFill`——其实是同一个函数，选一个名字统一即可。

指针运算（幻灯片 14）：

- `p + k` 会让地址增加 `k * sizeof(type)` 字节。
- `(a + 1)` 是 `a[1]` 的地址；`(a - 1)` 是“`a[-1]`”——编译器允许，但行为**未定义**。
- `(a - b)` = `a[0]` 与 `b[0]` 的地址之差，再除以该类型的大小。

> ⚠️ **幻灯片错误（p14）**：幻灯片写的是 `(a + 1) == a[1]`，少了一个 `*`，应为 `*(a + 1) == a[1]`（或 `a + 1 == &a[1]`）。

```cpp
int a[10];
int b[10];
std::cout << a << std::endl;
std::cout << (a + 1) << std::endl;
*(a + 1) = 3;
std::cout << (a - 1) << std::endl;
std::cout << (a - b) << std::endl;
```

已验证：`sizeof(int) = 4`，`(char*)(a + 1) - (char*)a = 4 bytes`，执行 `*(a + 1) = 3` 之后 `a[1] = 3`，且 `&a[7] - a = 7 elements`。

幻灯片 18 总结了 `int x[10];`（`x` 会退化为指向 `&x[0]` 的 `int*`）：

| View | Formula |
|---|---|
| 指针地址 | `&x[i] == x + i`（按类型大小自动缩放） |
| 字节地址 | `Base + (i × sizeof(int))` |
| 值 | `x[i] == *(x + i)` |

一次乘法加一次加法，所以**每个下标的访问代价都是相同的常数时间**。

### 2.3 `std::vector`

幻灯片 15：`std::vector` 是**用 RAII 管理**的动态一维数组（它在析构函数中释放数组，所以不会泄漏），**`at()`** 就是 `[ ]` **加上范围检查**。

```cpp
std::vector<int> v;
for (unsigned int i = 0; i < 10; i++)
{
    v.push_back(i);
}
for (unsigned int i = 0; i < 10; i++)
{
    v.at(i) += 10;
    std::cout << v.at(i) << std::endl;
}
```

输出（合并显示在一行），外加额外的 `v.at(10) = 1;`：

```text
10 11 12 13 14 15 16 17 18 19
v.at(10) threw std::out_of_range
```

`v[10] = 1` 则会悄无声息地触发未定义行为。幻灯片上的复习链接：Thornton 的 [ICS 45C Single-Dimension Arrays](http://www.ics.uci.edu/~thornton/ics45c/Notes/SingleDimensionArrays)。

---

## 3. 多维数组

### 3.1 声明与存储 n 维数组

幻灯片 17：为**每一维声明一个固定的、编译期确定的大小**；每一维*代表*什么（行还是列）由你决定。在内存中，数组会被**压平成一行**，按**行主序**（row-major order）排列：最右边的下标变化最快，所以第一个下标相同的元素在内存中是连续的。

```cpp
int a[4][5];

for (int i = 0; i < 4; ++i)
{
    for (int j = 0; j < 5; ++j)
    {
        a[i][j] = i * j;
    }
}
```

`int a[4][5]` 的布局（幻灯片 17/19）：按内存顺序列出每个元素，再标出 `a[2][3]` 落在哪里。在下面逐步演示（演示获得焦点时，← / → 键可用）：

```viz array-2d
{"title": "int a[4][5] 的行主序布局", "dims": [4, 5], "find": [2, 3]}
```

把整块内存直接当作 `int*` 读出来，就得到幻灯片 17 的那一行数值：

```text
flat: 0 0 0 0 0 0 1 2 3 4 0 2 4 6 8 0 3 6 9 12
```

### 3.2 下标：地址公式

幻灯片 19，`int a[4][5];`——`a` 会退化为指向整行的指针（`int(*)[5]`），所以 `a + i` 会跳过 `i` 行、每行 5 个 int：

| View | Formula |
|---|---|
| 元素地址 | `&a[i][j] == *(a + i) + j == (int*)a + (i × 5 + j)` |
| 字节地址 | `Base + (i × 5 + j) × sizeof(int)` |
| 元素值 | `a[i][j] == *(*(a + i) + j) == *((int*)a + (i × 5 + j))` |

具体例子，`i = 2, j = 3`（真实输出）：

```text
a[2][3] = 6, *(*(a + i) + j) = 6, *((int*)a + (i * 5 + j)) = 6
byte offset of a[2][3] = 52 = (2*5+3)*4
sizeof(a) = 80, sizeof(a[0]) = 20, (char*)(a + 1) - (char*)a = 20
```

**n 维规则**（幻灯片 19）：地址计算需要**所有内层维度**的大小——也就是除最左边一维之外的全部。`i × 5 + j` 里出现了 5，却从未出现 4。

> 📘 **课外补充**：正因为这条规则，二维数组形参必须在类型里带上内层大小——`void fill(int a[][5], int rows)` 能编译，而 `void fill(int* a, int rows, int cols)` 配 `a[i][j]` 则不行（Thornton，*Multidimensional Data*）。

> 📝 **练习**：[活动 1](#72-活动-1幻灯片-20)——`int a[3][2][4]` 的布局与公式。

---

## 4. 为什么要分析算法？

幻灯片 22：你常常同时扮演三个角色——**程序员**（需要一个能用的解法）、**客户**（想要高效的解法）和**理论家**（想要理解原理）。幻灯片 23 给出分析效率的理由：**预测**性能、**比较**算法、**提供**保证、**理解**理论，以及**避免**性能 bug。

**计算复杂度**（computational complexity）= **时间复杂度**（time complexity，运行时间如何随输入规模增长）+ **空间复杂度**（space complexity，内存如何增长）。这一讲只讲时间，用两种方式：测量它（§5）和建模它（§6）。

---

## 5. 运行时间的实测分析

### 5.1 贯穿全讲的例子：3-SUM

幻灯片 24：给定 n 个互不相同的数，有多少个**无序三元组**之和为 0？输入 `30 -40 -20 -10 40 0 10 5` → **4**（`30 -40 10`、`30 -20 -10`、`-40 40 0`、`-10 0 10`）。

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    for (int j = i+1; j < n; j++) {
        for (int k = j+1; k < n; k++) {
            if (a[i] + a[j] + a[k] == 0) {
                count++;
            }
        }
    }
}
```

幻灯片 25 在随机整数文件上给它计时：

| File | n | Triples | Time (s) |
|---|---|---|---|
| 8ints.txt | 8 | 4 | 0 |
| 1Kints.txt | 1000 | 70 | 0.081 |
| 2Kints.txt | 2000 | 528 | 0.38（重跑：0.371） |
| 4Kints.txt | 4000 | 4039 | 2.792 |
| 8Kints.txt | 8000 | 32074 | 21.623 |
| 16Kints.txt | 16000 | 255181 | 177.344 |

同一份输入，两次时间不同（0.38 与 0.371）：测量是有噪声的。

> 📘 **课外补充**：algs4 把这一过程看作科学方法——观察、假设一个模型、预测一个尚未测量的情形、验证、重复。下面的倍增测试正是这个循环。

### 5.2 对数-对数图与幂律

幻灯片 26：先画 T(n) 对 n 的图，再在**对数-对数**（log-log）图上重画。如果得到一条直线，运行时间就服从**幂律**（power law）：

$$T(n) = a\,n^b \quad\Longrightarrow\quad \log T(n) = b \log n + \log a$$

斜率就是 **b**。幻灯片 25/27 中 3-SUM 的测量值，逐个加到对数-对数图上，并标出倍增比（在下面逐步演示，演示获得焦点时 ← / → 键可用）：

```viz doubling-test
{"title": "3-SUM 倍增测试（幻灯片 25、27）", "n": [1000, 2000, 4000, 8000, 16000], "times": [0.081, 0.38, 2.792, 21.623, 177.344]}
```

从 lg n = 11.97 到 13.97，直线上升 7.47 − 1.48 ≈ 6.0，横向跨度 2.0：斜率 **b = 3**。幻灯片的拟合结果：**T(n) ≈ 0.42 × 10⁻¹⁰ n³** 秒。

### 5.3 倍增假设

幻灯片 27：把 n 翻倍并取比值——a 被约掉：

$$\frac{T(n)}{T(n/2)} = \frac{a\,n^b}{a\,(n/2)^b} = 2^b$$

- **b**：8000 → 16000 的比值是 177.344 / 21.623 ≈ **8.2**，所以 b ≈ lg 8.2 ≈ **3**。
- **a**：T(16000) = 177.34 = a × 16000³ → a = 0.42 × 10⁻¹⁰。

> ⚠️ **幻灯片错误（p27）**：177.34 / 16000³ 实际算出来是 **0.43 × 10⁻¹⁰**；幻灯片上的 0.42 来自拟合直线。

p27 表格中的全部比值：

| n | T(n) (s) | T(n)/T(n/2) | lg ratio |
|---|---|---|---|
| 8 | 0 | — | — |
| 1000 | 0.081 | — | — |
| 2000 | 0.38 | 4.7 | 2.2 |
| 4000 | 2.792 | 7.3 | 2.9 |
| 8000 | 21.623 | 7.7 | 2.95 |
| 16000 | 177.344 | 8.2 | 3.04 |

**为什么要选最大的 2 个输入规模？**（幻灯片 27 的问题）n 很小时，时间本身很小，所以计时器分辨率和噪声占比很大（n = 8 甚至读数为 0），而且低阶项和固定开销相对 n³ 还不能忽略。只有 n 足够大时，比值才会稳定在 8 附近。

在我自己的机器上复现（`-O2`，3 次取最小值，随机整数）：n 从 500 到 8000，比值依次为 7.97、7.60、8.25、7.81——**b ≈ 3** 再次得到验证，但 a ≈ 1.7 × 10⁻¹⁰（n = 8000 时为 86.949 s），不同硬件上常数不同。

> 📝 **练习**：[活动 2](#73-活动-2幻灯片-28)——根据计时表选出模型 T(n)。

### 5.4 什么决定了 a 和 b

幻灯片 29，对 T(n) = a·n^b：

| | System-independent factors | System-dependent factors |
|---|---|---|
| Determine | 指数 **b**（也会影响 a） | 只决定常数 **a** |
| Examples | 操作所用的数据结构与算法；算法本身；输入数据 | 硬件（CPU、内存、缓存）；软件（编译器、垃圾回收器）；系统（操作系统、网络等） |

所以 b 是算法及其输入的属性；更快的机器只会改变 a，不会改变 b。

---

## 6. 运行时间的数学模型

### 6.1 总时间 = Σ 代价 × 频率

幻灯片 31（Donald Knuth，1960 年代）：**总运行时间 = 所有操作的 代价 × 频率 之和。**

| Cost | Frequency |
|---|---|
| 与系统和机器相关 | 与算法和数据相关 |
| 确切代价取决于机器和编译器；分析程序以找出其基本操作 | 取决于数据结构、算法设计和输入；原则上可以建立精确的数学模型 |

幻灯片 32，C++ 基本操作的相对代价：`int add < int multiply < int divide < float add < float multiply < float divide`；内存访问的代价不一，但基本模型假定它与一次加法相当。

| Operation | Example | Cost |
|---|---|---|
| 变量声明 | `int a;` | c1 |
| 赋值 | `a = b;` | c2 |
| 整数比较 | `a < b;` | c3 |
| 数组 / vector 访问 | `a[i]`, `v[i]` | c4 |
| 容器大小 | `v.size()` | c5 |
| 动态分配 | `new int[n]`, `std::vector<int> v(n)` | c6·n |

分配是个例外：代价与 n 成正比，而不是常数。（幻灯片该列的表头显示成了原始的 `$c_i$`——这是 LaTeX 渲染失误。）

### 6.2 数操作次数：1-Sum

幻灯片 33：给定 n 个互不相同的数，有多少个数本身等于 0？

```cpp
int count = 0;
for (int i = 0; i < n; i++) {
    if (a[i] == 0) {
        count++;
    }
}
```

| Operation | Frequency | Why |
|---|---|---|
| 变量声明 | 2 | `count`、`i` |
| 赋值 | 2 | `count = 0`、`i = 0` |
| 小于 | **n + 1** | `i < n` 有 n 次为真，再有 1 次为假而退出循环 |
| 等于 | n | `a[i] == 0` |
| 数组访问 | n | `a[i]` |
| 自增 | **n 到 2n** | `i++` 执行 n 次，再加上取决于数据的 0..n 次 `count++` |

在 n = 10 时插桩统计：`less=11 equal=10 access=10`；没有 0 时 `incr=10`，有一个 0 时 `incr=11`。

> ⚠️ **幻灯片错误（p33）**：数是**互不相同**的，所以最多只有一个为 0，自增次数其实是 **n 到 n + 1**（n 到 2n 是不要求“互不相同”时的上界）。

### 6.3 波浪号记法

幻灯片 35：只保留**首项**（leading term）来估计运行时间（或内存）——n 很大时，低阶项可以忽略。

| Expression | Tilde |
|---|---|
| (1/6)n³ + 10n + 100 | ~ n³ |
| (1/6)n³ + 100n² + 47 | ~ n³ |
| (1/6)n³ + 100n^(2/3) + (1/2)/n | ~ n³ |

> 📘 **课外补充**：algs4 把 g(n) ~ f(n) 定义为 g(n)/f(n) → 1，这样会保留系数：第一行严格来说是 ~ (1/6)n³。幻灯片上的“~ n³”是增长阶（order of growth）的简写。Big-O 会在 Lecture 3 讲。

### 6.4 简化：代价模型 + 波浪号

幻灯片 36：(1) **代价模型**（cost model）——用某一种基本操作作为运行时间的代理，例如**数组访问**；(2) 用波浪号记法描述它的频率。套用到 2-Sum 上：

| Operation | Frequency | Tilde |
|---|---|---|
| 变量声明 | n + 2 | ~ n |
| 赋值 | n + 2 | ~ n |
| 小于 | (n + 1)(n + 2)/2 | ~ n² |
| 等于 | n(n − 1)/2 | ~ n² |
| 数组访问 | n(n − 1) | ~ n² |
| 自增 | n(n + 1)/2 到 n² | ~ n² |

结果：**2-SUM 问题约需 ~n² 次数组访问。** 3-SUM 同理：C(n, 3) ~ n³/6 个三元组 × 每个 3 次访问 = **~n³/2 次数组访问**，与实验得到的 b = 3 吻合。

> ➡️ **续见 [Lecture 3](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec03_Notes_zh-CN.md)**：活动 3（2-Sum 操作次数，幻灯片 34）在 Lecture 3 开头讲解并给出解答，随后是增长率与 Big-O/Ω/Θ。

---

## 7. 课堂活动（附解答）

### 7.1 上一讲的活动 a–d（幻灯片 6–10）

起始代码（幻灯片 6）：

```cpp
#include <iostream>

class Node {
public:
    Node() { std::cout << "Node created\n"; }
    ~Node() { std::cout << "Node destroyed\n"; }

    // Member pointers initialized safely to nullptr
    Node* left = nullptr;
    Node* right = nullptr;
    Node* parent = nullptr;
};

int main() {
    {
        std::cout << "--- Initializing Tree Elements ---\n";
        Node* root = new Node();
        Node* leftChild = new Node();
        Node* rightChild = new Node();

        // Linking parent-to-child and child-to-parent
        root->left = leftChild;
        root->right = rightChild;

        root->left->parent = root;
        root->right->parent = root; // Complete relationship mapping

        std::cout << "--- Tearing Down Tree Elements ---\n";
        // ⚠ Manual cleanup is fragile. Deleting out-of-order causes cras[h]
        delete root;
        delete leftChild;
        delete rightChild;
    }

    std::cout << "End of main.\n";
    return 0;
}
```


**(a)** 把裸指针改成 unique pointer。
**(b)** 尝试编译会发生什么？为什么？
**(c)** 修改必要的智能指针类型，保证没有内存泄漏。
**(d)** 为了性能，改成只使用 `unique_ptr` 和裸指针。

**解答。**

**(a)** 把每个 `Node*`（成员和局部变量）都改成 `std::unique_ptr<Node>`，并删掉所有 `delete`。

**(b)** 编译错误：`root->left = leftChild;`、`root->right = rightChild;` 和 `root->left->parent = root;` 都会**复制**一个 `unique_ptr`，而它的拷贝赋值已被删除（两个独占所有者会把同一个 Node delete 两次）。让 parent 成为 `unique_ptr` 在设计上也是错的——子节点不能拥有它的父节点。

**(c)** 所有权向下，观察向上：`left`/`right`（以及局部变量）改成 `std::shared_ptr<Node>`，`parent` 改成 `std::weak_ptr<Node>`。`weak_ptr` 不参与计数，所以在块结束时 root 的计数降到 0，三个 Node 全部被销毁。如果 `parent` 也用 `shared_ptr`，形成的环会让三个 Node 全部泄漏。

**(d)** `unique_ptr` 向下，裸指针向上：

```cpp
root->left = std::move(leftChild);
root->right = std::move(rightChild);
root->left->parent = root.get();
root->right->parent = root.get();
```

更快（没有引用计数），而且因为父节点总是比它的子节点活得更久，所以是安全的。

### 7.2 活动 1（幻灯片 20）

`int a[3][2][4];`
**(a)** 画出这个三维数组在一维连续内存中的布局。
**(b)** 访问 `a[i][j][k]` 的指针运算公式是什么？

**解答。**

**(a)** 24 个 int 在一整块内存里；`k` 变化最快，其次是 `j`，最后是 `i`。每个 `a[i]` 占 8 个 int，每个 `a[i][j]` 占 4 个：

| Flat positions | 0–3 | 4–7 | 8–11 | 12–15 | 16–19 | 20–23 |
|---|---|---|---|---|---|---|
| Elements | `a[0][0][0..3]` | `a[0][1][0..3]` | `a[1][0][0..3]` | `a[1][1][0..3]` | `a[2][0][0..3]` | `a[2][1][0..3]` |

**(b)** `&a[i][j][k] == (int*)a + (i * 2 * 4 + j * 4 + k)`，所以 `a[i][j][k] == *((int*)a + (i * 8 + j * 4 + k))`（也可写成 `*(*(*(a + i) + j) + k)`）；字节地址为 `Base + (i × 8 + j × 4 + k) × sizeof(int)`。公式里只出现内层大小 2 和 4。已对全部 24 个单元验证：`correct for all 24 cells? 1`。

### 7.3 活动 2（幻灯片 28）

假设你给代码计时，得到下面的观察结果。哪个函数最接近 T(n) 的模型？写出你的推导过程。

A. n²  B. 6 × 10⁻⁴ n  C. 5 × 10⁻⁹ n²  D. 7 × 10⁻⁹ n²

| Input size | 1000 | 2000 | 4000 | 8000 | 16000 | 32000 |
|---|---|---|---|---|---|---|
| Time | 0 | 0.0 | 0.1 | 0.3 | 1.3 | 5.1 |

**解答：C。**

1. 用最大的两个规模求 b：5.1 / 1.3 ≈ 3.9 ≈ 2² → **b ≈ 2**。排除 B（线性）。
2. 用 n = 32000 求 a：a = 5.1 / 32000² = 5.1 / (1.024 × 10⁹) ≈ **5 × 10⁻⁹**。
3. 检验：A 预测约 10⁹ s；D 预测 32000 时为 7.2 s。C 预测 32000 时为 5.1 s，16000 时为 1.28 s。✓

忽略小规模的数据：0.3 / 0.1 = 3 主要是舍入造成的。

---

## 8. 速查与必记的 5 个要点

| Topic | Key fact |
|---|---|
| `unique_ptr` | 一个所有者，不能复制；`std::move` 转移所有权，源指针变成 `nullptr` |
| `shared_ptr` | 引用计数；对象随最后一个所有者一起销毁；环会泄漏 |
| `weak_ptr` | 不拥有；用来打破环；`lock()` / `expired()` |
| raw `T*` via `.get()` | 观察者；所有者必须比它活得更久 |
| 1D address | `&x[i] == x + i`, `x[i] == *(x + i)`, byte `Base + i × sizeof(T)` |
| 2D `T a[R][C]` | 行主序；`a[i][j] == *((T*)a + (i × C + j))` |
| 3D `T a[D0][D1][D2]` | `*((T*)a + (i × D1 × D2 + j × D2 + k))` |
| Power law | T(n) = a·n^b；log-log 图上的斜率为 b |
| Doubling | T(n)/T(n/2) = 2^b；b = lg(比值)，然后 a = T(n)/n^b |
| Math model | T = Σ 代价 × 频率；波浪号只保留首项 |
| 1-Sum / 2-Sum / 3-Sum | ~n / ~n² / ~n³/2 次数组访问 |

**必记的 5 个要点**

1. 复制 `unique_ptr` 是编译错误；请用 `std::move`，之后源指针为 `nullptr`。
2. 父 ↔ 子都用 `shared_ptr` 会泄漏；把反向指针改成 `weak_ptr`，或者用 `unique_ptr` 向下 + 裸指针 `.get()` 向上。
3. C++ 数组是行主序，n 维地址计算需要除第一维之外的所有维度大小。
4. n 翻倍会使时间乘以 2^b；用最大的输入来计算 b 和 a。
5. `for` 循环的判断条件会执行 n + 1 次，波浪号记法只保留首项（2-Sum：~n² 次数组访问）。
