---
title: "堆与优先队列"
summary: "堆的插入与下沉练习、删除最大值（2 log n 次比较）、堆操作的运行时间、优先队列 ADT 及其数组与堆实现、最小堆、堆排序计划，以及最优的自底向上建堆。"
---

# Information and Computer Science 46 — Lecture 11：堆、优先队列

## 目录

- [1. 回顾：插入与下沉](#1-回顾插入与下沉)
- [2. 删除最大值](#2-删除最大值)
- [3. 堆操作的运行时间](#3-堆操作的运行时间)
- [4. 优先队列 ADT](#4-优先队列-adt)
- [5. 优先队列的实现](#5-优先队列的实现)
- [6. 最小堆与 delMin](#6-最小堆与-delmin)
- [7. 堆排序：计划](#7-堆排序计划)
- [8. 最优（自底向上）建堆](#8-最优自底向上建堆)
- [9. 完整实现](#9-完整实现)
- [10. 课堂活动（附解答）](#10-课堂活动附解答)
- [11. 速查与必记的 5 个要点](#11-速查与必记的-5-个要点)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 11/03/26
> 整理自 Lecture 11 幻灯片（其中也包含 Lecture 10 讲义末尾的堆活动与删除最大值幻灯片；堆运行时间汇总幻灯片取自 Lecture 10 讲义）；补充材料：algs4 §2.4 Priority Queues。按概念组织，而不是按资料来源组织。

> 📅 **课程安排**：Quiz 4 本周五 11/6（Sorting、Trees、Heaps）· 期中考试下周四 11/12 · 期中考试之前没有 HW 或 Lab
> 期中考试范围：模板、随机性、指针、引用、智能指针、多维数据；算法分析、ArrayList、链表；栈、队列、双端队列；均摊分析、递归分析；基于比较的排序
> 期中复习：样题、测验、课堂活动、作业、实验——实验中的实现也在考试范围内
> 已批改完成：HW 2、3，Lab 2，Quiz 2，课堂活动 5–10 · AI 工具访问需要提交两部分同意书（存储的数据不会用于学术诚信调查；研究同意可获 1% 额外学分，之后会提供其他获得额外学分的方式）

---

## 1. 回顾：插入与下沉

Insert 和 sink 都已在 [第 10 讲](lec-10.zh-CN.md#12-堆的插入) 中介绍过；本讲先用最大堆 `– 100 19 36 17 3 25 1 2 7`（下标 0 不使用）练习这两个操作。

- **插入（insert）**：把键放入 `pq[++n]`（最底层末尾），然后**上浮（swim）**，直到它不大于其父节点。最坏情况：每层一次比较，**O(log n)**。
- **下沉（sink）**：只要某键小于某个子节点，就与**较大**的子节点交换。最坏情况：每层两次比较，**O(log n)**。

例：插入 47 会落在下标 10（3 的子节点）处。47 > 3 → 交换；47 > 19 → 交换；47 < 100 → 停止。数组变为 `– 100 47 36 17 19 25 1 2 7 3`。

> 📝 **练习**：[练习：堆插入](#101-练习堆插入幻灯片-5) 和 [练习：堆下沉](#102-练习堆下沉幻灯片-6)。

## 2. 删除最大值

**删除最大值（delete max）**：交换根与末尾节点，把换到末尾的原根从堆中移除（并返回它），然后对新根执行**下沉（sink）**。对于最小堆，同样的代码返回（并删除）最小值。

```cpp
Key delMax() {
    Key max = pq[1];
    exch(1, n--);
    sink(1);
    return max;
}
```

`exch(1, n--)` 先交换 `pq[1]` 与 `pq[n]`，然后才让 n 减一，因此旧的最大值正好位于堆末尾之后，不再属于堆的一部分。

**代价：最多 2 log n 次比较。** 幻灯片问：为什么是 2 log n 而不是 log n？下沉每层需要**两次比较**——一次选出较大的子节点（`less(j, j+1)`），一次将键与该子节点比较（`less(k, j)`）——并且最多经过 log n 层。上浮（插入）每层只需一次比较，因为一个节点只有一个父节点：最多 log n + 1 次。

幻灯片 8 的例子：删除 `– T S R N P O A E I G H` 的最大值。交换 T 与 H，T 离开堆，然后 H 下沉：H < S → 交换；H < P → 交换；H > G → 停止。结果为 `– S P R N H O A E I G`。

```viz binary-heap
{"title": "幻灯片 8：delMax() 作用于 T S R N P O A E I G H", "heap": "T, S, R, N, P, O, A, E, I, G, H", "ops": "delMax()", "interactive": true}
```

> ⚠️ **易错点**：执行 `exch(1, n--)` 之后，新的根是原来的*最后一个键*，它通常是最小的之一——因此几乎总会下沉到接近底部。不要从下标 n 下沉，也不要从根上浮；delMax 只会调用 `sink(1)`。

> 📝 **练习**：[活动 1](#103-活动-1删除最大值幻灯片-9) —— 删除一次最大值、分析其复杂度，以及连续删除九次。

## 3. 堆操作的运行时间

以下是取自第 10 讲讲义末尾的运行时间汇总幻灯片：

| 操作 | 最坏情况 | 原因 |
|---|---|---|
| 插入 | O(log n) | 追加 + 沿一条叶到根路径上浮 |
| 删除最大值 | O(log n) | exch + 沿一条根到叶路径下沉（≤ 2 log n 次比较） |
| 查找最大值 | O(1) | 它就是 `pq[1]` |
| 空间 | O(n) | 每个键占一个数组位置（另加未使用的 `pq[0]`） |

幻灯片以 algs4 *2.4 Binary Heap Demo*（字母堆上插入与删除最大值的动画）结束堆的部分。

> 📘 **课外补充**：若使用固定大小的数组，log n 界是最坏情况。若数组像 ArrayList 一样在插入时倍增扩容（删除时收缩），界就变为**均摊** O(log n)——偶尔一次插入还要付出 O(n) 的复制代价。（algs4 §2.4，实践中的考虑）

## 4. 优先队列 ADT

**优先队列**总是先服务**优先级最高**的元素，与 FIFO 队列（先进先出，最早的先出）或 LIFO 栈（后进先出，最新的先出）不同。它有两个关键操作：

1. **删除（并返回）最大值**——取出优先级最高的元素；
2. **插入**——加入一个带有优先级的新元素。

幻灯片列出的应用：操作系统（负载均衡、中断处理）、压缩（Huffman 编码）、AI（A\* 搜索）、图搜索（Dijkstra 算法和 Prim 算法）。关键问题是：*如何高效地实现优先队列？*

例：依次插入 5、1、9，然后删除最大值 → 9；再插入 7，删除最大值 → 7。若是 FIFO 队列，则会先返回 5，再返回 1。

## 5. 优先队列的实现

| 实现 | 插入 | 删除最大值 | 思路 |
|---|---|---|---|
| 方案 1：无序数组（"惰性"） | O(1) | O(n) | 直接追加；删除时扫描整个数组找最大值 |
| 方案 2：有序数组（"急切"） | O(n) | O(1) | 保持有序，使最大值位于末尾；插入时需要移动元素 |
| 方案 3：二叉堆（"最优平衡"） | O(log n) | O(log n) | 树结构使两种操作都是对数时间 |

数组迫使我们在 O(1) 与 O(n) 之间做极端取舍；二叉堆把两种操作都降到对数时间，这就是它成为优先队列 ADT 标准选择的原因。若各进行 m 次操作，数组的最坏代价为 O(mn)，堆为 O(m log n)。

> 📘 **课外补充**："最佳"选择取决于操作的组合。若插入次数极多而删除最大值很少，无序数组更好（插入为 O(1)）。若查找最大值很频繁而更新很少，有序数组更好（最大值总在末尾）。当两种操作都频繁时，堆是首选。（algs4 §2.4 练习）

## 6. 最小堆与 delMin

**最小堆**使每个键 **≤** 其子节点，因此最小值位于根。代码就是最大堆代码把每个比较反过来（`less(a, b)` 变为"a 大于 b"），删除最大值变为 **delMin**：交换根与最后一个键，移除换到末尾的原根，然后把新根向*较小*的子节点下沉。

幻灯片 14 的优先队列使用最小堆。依次执行它的 12 个操作（插入 P、Q、E，删除最小值，插入 X、A、M，删除最小值，插入 P、L、E，删除最小值），返回 **E、A、E**，并留下 `– L P M Q P X`。可在下方逐步演示（演示获得焦点时，← / → 键可用）：

```viz binary-heap
{"title": "幻灯片 14：最小堆上的活动 2", "ops": "insert(P); insert(Q); insert(E); delMin(); insert(X); insert(A); insert(M); delMin(); insert(P); insert(L); insert(E); delMin()", "order": "min", "interactive": true}
```

> ⚠️ **易错点**：允许重复键。在第 9 步中插入第二个 P 时，堆中已有一个 P；`less` 是严格的，因此相等的键遇到相等的父节点时会立即停止上浮，不会与之交换。

> 📝 **练习**：[活动 2](#104-活动-2假设为最小堆幻灯片-14) —— 每一步之后画出堆的状态。

## 7. 堆排序：计划

用堆来排序，分两步：

1. **建堆（heap construction）**——用待排序的全部 n 个键构建一个二叉堆；
2. **Sortdown（下沉排序）**——反复删除并返回最大值。

例：活动 1 堆的 9 个键经过九次删除最大值后依次输出 `100 36 25 19 17 7 3 2 1`——降序排列。由于 `exch(1, n--)` 把每次删除的最大值放在不断缩小的堆之后，数组本身最终变为升序：`– 1 2 3 7 17 19 25 36 100`。这种原地技巧就是 sortdown，将在第 12 讲中介绍。

## 8. 最优（自底向上）建堆

把任意数组转换为堆：

1. 把数组视为一棵完全二叉树（按层序排列，它本来就是）；
2. **忽略所有叶子**（下标 n/2 + 1，…，n）——单个节点本身就是堆；
3. 从最后一个内部节点到根，逐个下沉其余每个节点：

```cpp
for ( int k = n/2; k >= 1; k-- )
    sink(a, k, n);
```

**关键洞见：** 执行 `sink(a, k, n)` 之后，以 k 为根的子树就是堆。从右到左下沉，意味着处理 k 时它的两个子节点都已经是堆，因此一次下沉即可修复整棵子树；执行完 `sink(a, 1, n)` 之后，整个数组就是堆。

**为什么从 n/2 开始？** 节点 k 有左子节点当且仅当 2k ≤ n，即 k ≤ n/2。最后一个节点 n 的父节点是 ⌊n/2⌋，因此 ⌊n/2⌋ 是最后一个拥有子节点的节点；比它大的下标都是叶子。当 n = 11 时，循环从 k = 5 开始。

`sink(a, k, n)` 是把数组及其大小作为参数的堆 `sink`（这样堆排序可以作用于任意数组）；其函数体与[第 10 讲](lec-10.zh-CN.md#13-下沉sink)中的 `sink(k)` 相同。

幻灯片 17–18 对 `S O R T E X A M P L E`（n = 11）的追踪：

| 步骤 | 调用 | 移动的内容 | 之后的数组 |
|---|---|---|---|
| a) | 开始（任意顺序） | — | S O R T E X A M P L E |
| b) | sink(5, 11) | E 与其较大的子节点 L 交换 | S O R T L X A M P E E |
| c) | sink(4, 11) | T ≥ M、P：不移动 | S O R T L X A M P E E |
| d) | sink(3, 11) | R 与 X 交换 | S O X T L R A M P E E |
| e) | sink(2, 11) | O 先与 T 交换，再与 P 交换 | S T X P L R A M O E E |
| f) | sink(1, 11) | S 与 X 交换，停在 R 和 A 之上 | X T S P L R A M O E E |

```viz binary-heap
{"title": "幻灯片 17–18：自底向上建堆", "heap": "S, O, R, T, E, X, A, M, P, L, E", "ops": "sink(5); sink(4); sink(3); sink(2); sink(1)", "interactive": true}
```

> ➡️ **接续见 [第 12 讲](lec-12.zh-CN.md)**：建堆活动（朴素与优化的代价对比）、O(n) 建堆分析、sortdown、堆排序分析、排序总结和二叉搜索树——第 12 讲的讲义会重复这些内容。

## 9. 完整实现

```cpp
#include <iostream>
#include <string>
#include <utility>
#include <vector>

// Max-oriented priority queue on a binary heap, pq[0] unused.
template <typename Key>
class MaxPQ {
private:
    std::vector<Key> pq{Key{}};   // pq[0] unused
    size_t n = 0;

    bool less(size_t i, size_t j) const { return pq[i] < pq[j]; }
    void exch(size_t i, size_t j) { std::swap(pq[i], pq[j]); }
    void swim(size_t k) {
        while (k > 1 && less(k/2, k)) {
            exch(k, k/2);
            k = k/2;
        }
    }
    void sink(size_t k) {
        while (2*k <= n) {
            size_t j = 2*k;
            if (j < n && less(j, j+1)) j++;
            if (!less(k, j)) break;
            exch(k, j);
            k = j;
        }
    }

public:
    bool isEmpty() const { return n == 0; }
    size_t size() const { return n; }
    void insert(const Key& x) {
        pq.push_back(x);              // slide: pq[++n] = x;
        ++n;
        swim(n);
    }
    Key delMax() {
        Key max = pq[1];
        exch(1, n--);
        sink(1);
        pq.pop_back();                // drop the old maximum from the vector
        return max;
    }
    void load(const std::vector<Key>& keys) {   // as-is, for the activities
        pq.assign(1, Key{});
        pq.insert(pq.end(), keys.begin(), keys.end());
        n = keys.size();
    }
    void sinkAt(size_t k) { sink(k); }
    void print() const {
        for (size_t i = 1; i <= n; i++) std::cout << pq[i] << ' ';
        std::cout << '\n';
    }
};

// Min-oriented version: same code with less() flipped.
template <typename Key>
class MinPQ {
private:
    std::vector<Key> pq{Key{}};
    size_t n = 0;
    bool greater(size_t i, size_t j) const { return pq[j] < pq[i]; }
    void exch(size_t i, size_t j) { std::swap(pq[i], pq[j]); }
    void swim(size_t k) {
        while (k > 1 && greater(k/2, k)) { exch(k, k/2); k = k/2; }
    }
    void sink(size_t k) {
        while (2*k <= n) {
            size_t j = 2*k;
            if (j < n && greater(j, j+1)) j++;
            if (!greater(k, j)) break;
            exch(k, j);
            k = j;
        }
    }
public:
    void insert(const Key& x) { pq.push_back(x); ++n; swim(n); }
    Key delMin() {
        Key min = pq[1];
        exch(1, n--);
        sink(1);
        pq.pop_back();
        return min;
    }
    void print() const {
        for (size_t i = 1; i <= n; i++) std::cout << pq[i] << ' ';
        std::cout << '\n';
    }
};

// Heap construction on a 1-based array a[1..n] (slide p17).
template <typename Key>
void sink(std::vector<Key>& a, size_t k, size_t n) {
    while (2*k <= n) {
        size_t j = 2*k;
        if (j < n && a[j] < a[j+1]) j++;
        if (!(a[k] < a[j])) break;
        std::swap(a[k], a[j]);
        k = j;
    }
}
template <typename Key>
void heapify(std::vector<Key>& a) {           // a[0] unused
    size_t n = a.size() - 1;
    for (size_t k = n/2; k >= 1; k--) {
        sink(a, k, n);
        std::cout << "  after sink(" << k << ", " << n << "): ";
        for (size_t i = 1; i <= n; i++) std::cout << a[i] << ' ';
        std::cout << '\n';
    }
}

int main() {
    std::vector<int> h = {100, 19, 36, 17, 3, 25, 1, 2, 7};

    MaxPQ<int> a; a.load(h); a.insert(47);
    std::cout << "insert 47: "; a.print();

    MaxPQ<int> b; b.load({19, 7, 36, 17, 3, 25, 1, 2}); b.sinkAt(2);
    std::cout << "sink 7:    "; b.print();

    MaxPQ<int> c; c.load(h);
    std::cout << "delMax -> " << c.delMax() << ", heap: "; c.print();

    MaxPQ<int> d; d.load(h);
    std::cout << "9 x delMax:";
    while (!d.isEmpty()) std::cout << ' ' << d.delMax();
    std::cout << '\n';

    MinPQ<char> m;
    std::cout << "Activity 2 (min-heap):\n";
    std::string ops[] = {"P","Q","E","-","X","A","M","-","P","L","E","-"};
    int step = 1;
    for (const std::string& op : ops) {
        std::cout << "  " << step++ << ". ";
        if (op == "-") std::cout << "delMin -> " << m.delMin() << " | ";
        else { m.insert(op[0]); std::cout << "insert " << op << " | "; }
        m.print();
    }

    std::vector<char> s = {' ', 'S','O','R','T','E','X','A','M','P','L','E'};
    std::cout << "heap construction:\n";
    heapify(s);
}
```

输出（`g++ -std=c++17 -Wall -fsanitize=address,undefined`）：

```text
insert 47: 100 47 36 17 19 25 1 2 7 3 
sink 7:    19 17 36 7 3 25 1 2 
delMax -> 100, heap: 36 19 25 17 3 7 1 2 
9 x delMax: 100 36 25 19 17 7 3 2 1
Activity 2 (min-heap):
  1. insert P | P 
  2. insert Q | P Q 
  3. insert E | E Q P 
  4. delMin -> E | P Q 
  5. insert X | P Q X 
  6. insert A | A P X Q 
  7. insert M | A M X Q P 
  8. delMin -> A | M P X Q 
  9. insert P | M P X Q P 
  10. insert L | L P M Q P X 
  11. insert E | E P L Q P X M 
  12. delMin -> E | L P M Q P X 
heap construction:
  after sink(5, 11): S O R T L X A M P E E 
  after sink(4, 11): S O R T L X A M P E E 
  after sink(3, 11): S O X T L R A M P E E 
  after sink(2, 11): S T X P L R A M O E E 
  after sink(1, 11): X T S P L R A M O E E 
```

幻灯片 p17 的循环使用 `int k`；这里 `k` 为 `size_t`，以匹配 `n`。这样做之所以安全，只是因为循环条件是 `k >= 1`（到 1 就停）——若 `size_t` 的循环一直递减到 0，它会回绕而不是变为负数。

## 10. 课堂活动（附解答）

三道堆练习都从下面这个最大堆开始（下标：键）：

| 下标 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| 键 | 100 | 19 | 36 | 17 | 3 | 25 | 1 | 2 | 7 |

### 10.1 练习：堆插入（幻灯片 5）

在此二叉堆中插入 47。

- **任务 1：** 展示插入的每一步
- **任务 2：** 给出结果二叉堆的数组表示
- **任务 3：** 插入的最坏情况时间复杂度是多少？

> ✍️ **先自己试一试。** 提示：新键进入下标 10——那个位置是哪个节点的子节点？

**解答**

**任务 1：** 47 放入 `pq[10]`，它是下标 5（键为 3）的**左**子节点，因为 2·5 = 10。上浮：47 > 3 → 交换（47 到达下标 5）；47 > 19 → 交换（47 到达下标 2）；47 < 100 → 停止。

**任务 2：** `– 100 47 36 17 19 25 1 2 7 3`

**任务 3：** O(log n)——沿通往根的路径每层至多一次交换（≤ log n + 1 次比较）。

```viz binary-heap
{"title": "练习验证：insert(47)", "heap": "100, 19, 36, 17, 3, 25, 1, 2, 7", "ops": "insert(47)"}
```

返回 [§1 回顾](#1-回顾插入与下沉)。

### 10.2 练习：堆下沉（幻灯片 6）

将 7 下沉到此二叉堆中的适当位置：`– 19 7 36 17 3 25 1 2`（7 位于下标 2）。

- **任务 1：** 展示下沉的每一步
- **任务 2：** 给出结果二叉堆的数组表示
- **任务 3：** 下沉的最坏情况时间复杂度是多少？

> ✍️ **先自己试一试。**

**解答**

**任务 1：** 7 的子节点是 17（下标 4）和 3（下标 5）；较大的是 17，而 7 < 17 → 交换（7 到达下标 4）。它唯一的子节点是 2（下标 8）；7 > 2 → 停止。

**任务 2：** `– 19 17 36 7 3 25 1 2`

**任务 3：** O(log n)——每层一次交换，每层两次比较（≤ 2 log n 次比较）。

```viz binary-heap
{"title": "练习验证：sink(2)", "heap": "19, 7, 36, 17, 3, 25, 1, 2", "ops": "sink(2)"}
```

返回 [§1 回顾](#1-回顾插入与下沉)。

### 10.3 活动 1：删除最大值（幻灯片 9）

初始最大堆：见上表。

**(01) 单次删除** —— 调用删除最大值，并展示堆的状态。

**(02) 复杂度** —— deleteMax 的最坏情况时间复杂度是多少？

**(03) 数组追踪** —— 对原始堆连续调用九次删除最大值，并展示数组中的值。

> ✍️ **先自己试一试。** 提示：交换之后，下沉总是朝*较大*的子节点方向进行。

**解答**

**(01)** 交换 100 与最后一个键 7，并删除 100。下沉 7：子节点为 19 和 36 → 与 36 交换（7 到达下标 3）；子节点为 25 和 1 → 与 25 交换（7 到达下标 6）；下标 6 没有子节点 → 停止。堆变为 `– 36 19 25 17 3 7 1 2`，返回 100。

**(02)** O(log n)：沿一条根到叶的路径，最多 2 log n 次比较。

**(03)** 九次调用依次返回 `100 36 25 19 17 7 3 2 1`（降序）。由于每次调用都把删除的最大值放在不断缩小的堆之后，数组本身变为 `– 1 2 3 7 17 19 25 36 100`——升序（这正是堆排序的思想，见 [§7](#7-堆排序计划)）。

每次调用后的数组（`|` 标出堆的末尾；它右边的键已被删除，由 `exch(1, n--)` 放在那里）：

| 调用 | 返回 | `pq[1..9]` |
|---|---|---|
| 1 | 100 | 36 19 25 17 3 7 1 2 \| 100 |
| 2 | 36 | 25 19 7 17 3 2 1 \| 36 100 |
| 3 | 25 | 19 17 7 1 3 2 \| 25 36 100 |
| 4 | 19 | 17 3 7 1 2 \| 19 25 36 100 |
| 5 | 17 | 7 3 2 1 \| 17 19 25 36 100 |
| 6 | 7 | 3 1 2 \| 7 17 19 25 36 100 |
| 7 | 3 | 2 1 \| 3 7 17 19 25 36 100 |
| 8 | 2 | 1 \| 2 3 7 17 19 25 36 100 |
| 9 | 1 | \| 1 2 3 7 17 19 25 36 100 |

下面的演示把每次删除的键直接从图中去掉，而不是放到堆末尾之后，所以最后显示的是一个空堆；上表才是幻灯片中原地操作的数组。

```viz binary-heap
{"title": "活动 1 验证：九次 delMax() 调用", "heap": "100, 19, 36, 17, 3, 25, 1, 2, 7", "ops": "delMax(); delMax(); delMax(); delMax(); delMax(); delMax(); delMax(); delMax(); delMax()"}
```

返回 [§2 删除最大值](#2-删除最大值)。

### 10.4 活动 2：假设为最小堆（幻灯片 14）

在基于堆的优先队列中执行以下操作（注意：每一步结束时画出堆的内容）：

| | | | |
|---|---|---|---|
| 1. 插入 P | 4. 删除最小值 | 7. 插入 M | 10. 插入 L |
| 2. 插入 Q | 5. 插入 X | 8. 删除最小值 | 11. 插入 E |
| 3. 插入 E | 6. 插入 A | 9. 插入 P | 12. 删除最小值 |

> ✍️ **先自己试一试。** 提示：在最小堆中，键在比父节点*更小*时会上浮。

**解答**（每一步之后的堆数组，按层序列出）

| 步骤 | 操作 | 返回值 | 堆 |
|---|---|---|---|
| 1 | 插入 P | | P |
| 2 | 插入 Q | | P Q |
| 3 | 插入 E | | E Q P |
| 4 | 删除最小值 | E | P Q |
| 5 | 插入 X | | P Q X |
| 6 | 插入 A | | A P X Q |
| 7 | 插入 M | | A M X Q P |
| 8 | 删除最小值 | A | M P X Q |
| 9 | 插入 P | | M P X Q P |
| 10 | 插入 L | | L P M Q P X |
| 11 | 插入 E | | E P L Q P X M |
| 12 | 删除最小值 | E | L P M Q P X |

关键步骤：第 6 步中，A 从下标 4 出发，越过 Q 和 P，上浮到根；第 10 步中，L 越过 X 和 M，上浮到根；第 12 步中，最后一个键 M 移到根并下沉到下标 3。[§6](#6-最小堆与-delmin) 中的演示会逐步展示全部十二个操作。

## 11. 速查与必记的 5 个要点

| 操作（二叉堆，n 个键） | 最坏情况 | 比较次数 |
|---|---|---|
| 插入（追加 + 上浮） | O(log n) | ≤ log n + 1 |
| 删除最大值 / 删除最小值（exch + sink） | O(log n) | ≤ 2 log n |
| 查找最大值 / 最小值 | O(1) | 0 |
| 自底向上建堆 | 见第 12 讲 | k 从 n/2 递减到 1，逐个下沉 |
| 空间 | O(n) | |

| 优先队列 | 插入 | 删除最大值 |
|---|---|---|
| 无序数组 | O(1) | O(n) |
| 有序数组 | O(n) | O(1) |
| 二叉堆 | O(log n) | O(log n) |

**必记的 5 个要点**

1. delMax：保存 `pq[1]`，`exch(1, n--)`，`sink(1)`，然后返回——旧的最后一个键被放到根上并下沉。
2. 下沉每层 2 次比较（先选出较大的子节点，再比较），上浮每层 1 次——因此分别为 2 log n 与 log n + 1。
3. 优先队列总是先服务优先级最高的元素；堆使插入与删除最大值都达到 O(log n)，而数组是在 O(1) 与 O(n) 之间取舍。
4. 最小堆就是把比较全部反过来的同一段代码：最小值在根，向较小的子节点下沉。
5. 自底向上建堆跳过叶子，从 k = n/2 递减到 1 进行下沉，因为 ⌊n/2⌋ 是最后一个有子节点的节点。
