# Information and Computer Science 46 — Lecture 8：归并排序与快速排序

## 目录

- [1. 归并排序：思路](#1-归并排序思路)
- [2. 合并两个已排序的半段](#2-合并两个已排序的半段)
- [3. 递归的 sort 与包装函数](#3-递归的-sort-与包装函数)
- [4. 在 M E R G E S R T 上追踪归并排序](#4-在-m-e-r-g-e-s-r-t-上追踪归并排序)
- [5. 归并排序的分析](#5-归并排序的分析)
- [6. 归并排序的性质与改进](#6-归并排序的性质与改进)
- [7. 快速排序：思路](#7-快速排序思路)
- [8. 快速排序代码与随机洗牌](#8-快速排序代码与随机洗牌)
- [9. 划分](#9-划分)
- [10. 追踪快速排序](#10-追踪快速排序)
- [11. 完整实现](#11-完整实现)
- [12. 课堂活动（附解答）](#12-课堂活动附解答)
- [13. 速查与必记的 5 个要点](#13-速查与必记的-5-个要点)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/22/26
> 整理自 Lecture 8 幻灯片（p1–84）；补充材料：algs4 §2.2 Mergesort 与 §2.3 Quicksort，Thornton 的 "Comparison-Based Sorting"。按概念组织，而不是按资料来源组织。
> 本讲目标（幻灯片 p3）：归并排序及其分析，快速排序。归并部分（幻灯片 p4–20）同时也出现在 Lecture 7 的末尾，这里一并讲解。选择排序与插入排序见 [Lecture 7 笔记](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec07_Notes_zh-CN.md)；递推式与主定理见 [Lecture 6 笔记](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec06_Notes_zh-CN.md)。

> 📅 **课程安排**（幻灯片 p2）：
> Quiz 2 本周**五**进行
> HW 3 **周五**截止
> Lab 3 **下周一**截止
> 课程批准的 AI 工具很快将发布

---

## 1. 归并排序：思路

归并排序（merge sort）由约翰·冯·诺依曼（John von Neumann）于 1945 年发明，是“分治法（divide and conquer）的典型范例”（幻灯片 p22）。算法如下（幻灯片 p21）：

1. **划分**：把数组分成两半。
2. **递归排序**：分别对两半进行排序。
3. **归并**：把两个已排序的半段合并起来。

幻灯片 p5 对 `M E R G E S O R T E X A M P L E` 的概览：

| 步骤 | 数组 |
| --- | --- |
| 输入 | M E R G E S O R T E X A M P L E |
| 对左半部分排序 | E E G M O R R S \| T E X A M P L E |
| 对右半部分排序 | E E G M O R R S \| A E E L M P T X |
| 合并结果 | A E E E E G L M M O P R R S T X |

> 💡 **关键洞见**：划分非常简单（在中间下标处切开）。所有实际工作，即每一次比较，都发生在 `merge()` 中。

## 2. 合并两个已排序的半段

`merge` 接收 `a[lo..mid]` 和 `a[mid+1..hi]`，两段**各自已经有序**，并使 `a[lo..hi]` 变为有序（幻灯片 p6）。它先把这一区间复制到辅助数组 `aux` 中，然后逐个位置 `k` 写回到 `a`：

```cpp
template <typename T>
void merge(T* a, T* aux, int lo, int mid, int hi)
{
    for (int k = lo; k <= hi; k++)       // Copy from a to aux
        aux[k] = a[k];

    int i = lo, j = mid + 1;

    for (int k = lo; k <= hi; k++) {     // Merge back into a
        if (i > mid)                     // Left subarray is exhausted
            a[k] = aux[j++];
        else if (j > hi)                 // Right subarray is exhausted
            a[k] = aux[i++];
        else if (aux[j] < aux[i])        // Select from right subarray
            a[k] = aux[j++];
        else                             // Select from left subarray
            a[k] = aux[i++];
    }
}
```

各个下标的含义（幻灯片 p8–9）：

- `i` = `aux` 中**左**半段下一个未使用的元素（当 `i <= mid` 时有效）
- `j` = `aux` 中**右**半段下一个未使用的元素（当 `j <= hi` 时有效）
- `k` = `a` 中下一个待填充的位置

`i > mid` 表示左半段已用完，`j > hi` 表示右半段已用完；此时剩余元素直接复制，无需比较。只有两段都还有元素时，第三个分支才比较 `aux[j] < aux[i]`，较小者胜出。幻灯片中的“扑克牌演示”：两叠已排序的牌正面朝上，每次总是取较小的顶牌。

幻灯片 p7–18 归并 `aux = A G L O R | H I M S T`（lo = 0，mid = 4，hi = 9）：

| k | 情形 | 赋值 | 之后的 a |
| --- | --- | --- | --- |
| 0 | aux[i] < aux[j]（A vs H） | a[0] = aux[0] | **A** |
| 1 | G vs H | a[1] = aux[1] | A **G** |
| 2 | aux[i] > aux[j]（L vs H） | a[2] = aux[5] | A G **H** |
| 3 | L vs I | a[3] = aux[6] | A G H **I** |
| 4 | L vs M | a[4] = aux[2] | … **L** |
| 5 | O vs M | a[5] = aux[7] | … **M** |
| 6 | O vs S | a[6] = aux[3] | … **O** |
| 7 | R vs S | a[7] = aux[4] | … **R** |
| 8 | i > mid | a[8] = aux[8] | … **S** |
| 9 | i > mid | a[9] = aux[9] | A G H I L M O R S T |

下面可逐步演示（演示获得焦点时可用 ← / → 键）：

```viz merge-sort
{"title": "幻灯片 7–18：合并 A G L O R | H I M S T", "items": "A, G, L, O, R, H, I, M, S, T", "mode": "merge", "mid": 4}
```

幻灯片 p19 链接到 Algorithms 2.2 的 "Merging Demo" 视频，展示的是同一过程。

> ⚠️ **易错点**：`merge` 只有在两半都已排序时才正确。它从不回头检查，因此未排序的半段会以原来的顺序与另一半混合输出。

> 📝 **练习**：[活动 1](#121-活动-1merge-中的比较次数幻灯片-20) 统计 `merge` 所做的比较次数。

## 3. 递归的 sort 与包装函数

幻灯片 p22–23：

```cpp
template <typename T>
void sort(T* a, T* aux, int lo, int hi)
{
    if (hi <= lo)                        // Base case for recursion
        return;

    int mid = lo + (hi - lo) / 2;        // calculate midpoint, split in half
    sort(a, aux, lo, mid);               // recursively sort left subarray
    sort(a, aux, mid+1, hi);             // recursively sort right subarray
    merge(a, aux, lo, mid, hi);          // merge left and right
}

template <typename T>
void sort(T* a, int length)
{
    T* aux = new T[length];              // Dynamically allocate aux array
    sort(a, aux, 0, length - 1);
    delete[] aux;
}
```

- `lo` 与 `hi` 都是**闭区间**，因此包装函数传入的是 `length - 1`。
- 基本情形 `hi <= lo`：只有 0 或 1 个元素的区间本身已经有序。
- `mid = lo + (hi - lo) / 2` 与 `(lo + hi) / 2` 等价，但不会导致 `int` 溢出。长度为奇数时，左半段 `lo..mid` 多一个元素。
- 两个 `sort` 函数是**重载**。用户调用 `sort(a, length)`；包装函数只分配一次 `aux` 并向下传递，而不是在每次 `merge` 中都分配。
- `new T[length]` 与 `delete[]` 配对使用。

幻灯片 p23 的说明：`std::sort` 和 `std::merge` 已经在 `<algorithm>` 中提供；我们自己实现它们是为了理解其原理。

## 4. 在 M E R G E S R T 上追踪归并排序

幻灯片 p24–41 跟踪 `sort([M,E,R,G,E,S,R,T])`。调用顺序是**深度优先**的：一直向左递归直到基本情形（幻灯片用一面砖墙来表示），然后处理右侧，最后在回溯时逐层归并。

| 调用 | 发生了什么 | 之后的 a |
| --- | --- | --- |
| sort(0,7) | mid = 3，向左递归 | M E R G E S R T |
| sort(0,3) | mid = 1，向左递归 | |
| sort(0,1) | mid = 0；sort(0,0) 和 sort(1,1) 触发基本情形；merge(0,0,1) | **E M** R G E S R T |
| sort(2,3) | sort(2,2)、sort(3,3) 返回；merge(2,2,3) | E M **G R** E S R T |
| 回到 sort(0,3) | merge(0,1,3) | **E G M R** E S R T |
| sort(4,7) | 对 E S R T 重复相同模式 | E G M R **E R S T** |
| 回到 sort(0,7) | merge(0,3,7) | **E E G M R R S T** |

幻灯片 p41 给出了完整的递归树：`MERG | ESRT` → `ME RG ES RT` → 单个字母 → `EM GR ES RT` → `EGMR ERST` → `EEGMRRST`。`aux` 数组会在两次归并之间保留旧副本（例如 `[M, E, R, G, , , , ]`）；这无害，因为每次 `merge` 都会先重新复制自己的区间。

逐步演示整个递归过程（可编辑 items 以尝试自己的输入）：

```viz merge-sort
{"title": "幻灯片 24–41：sort M E R G E S R T", "items": "M, E, R, G, E, S, R, T", "interactive": true}
```

> 📝 **练习**：[活动 2](#122-活动-2子数组长度幻灯片-42) 询问当 n = 10 时会出现哪些子数组长度。

## 5. 归并排序的分析

**为什么重要**（幻灯片 p43）：以每秒 10¹⁰ 次比较（笔记本电脑）与 10¹⁷ 次（超级计算机）计算：

| 计算机 | 插入排序：千 | 百万 | 十亿 | 归并排序：千 | 百万 | 十亿 |
| --- | --- | --- | --- | --- | --- | --- |
| 笔记本电脑 | 瞬间 | 2 小时 | 300 年 | 瞬间 | 1 秒 | 15 分钟 |
| 超级计算机 | 瞬间 | 1 秒 | 1 周 | 瞬间 | 瞬间 | 瞬间 |

运行归并排序的笔记本电脑快过运行插入排序的超级计算机：好的算法胜过超级计算机。

**比较次数的计数**（活动 3，幻灯片 p44）。对 n 个元素的一次 `merge` 最多进行 **n − 1** 次比较：每次比较放置一个元素，而最后一个元素总是无需比较即可放置（另一半已经为空）。因此最坏情况下的次数满足

$$C(n) = 2\,C(n/2) + (n - 1), \qquad C(1) = 0$$

（两次递归排序，加上最后的一次归并；计算 `mid` 不需要比较）。若只关注增长阶，可写为 $T(n) = 2T(n/2) + n$。

- **递归树**：第 k 层有 2ᵏ 个子问题，每个规模为 n/2ᵏ，因此每一层总共归并 n 个元素。将 n 不断减半直到 1 需要 log₂ n 层。总计约为 n · log₂ n。精确地，当 n 为 2 的幂时 $C(n) = n\log_2 n - n + 1$（n = 8 时为 17）。
- **主定理**（$T(n) = aT(n/b) + n^d$）：a = 2，b = 2，d = 1，且 a = bᵈ，因此 $T(n) = \Theta(n^d \log n) = \Theta(n \log n)$。

若计算所有工作量（复制到 `aux`、更新下标），而不只是比较次数，只会改变常数：每次 `merge` 仍是 Θ(n)，因此结论相同，即最好、平均与最坏情况都是 **Θ(n log n)**。

> 📘 **课外补充**（algs4 §2.2）：algs4 §2.2 给出了完整范围：对于任意规模为 n 的输入，归并排序使用的比较次数介于 ½ n lg n 与 n lg n 之间。最好情况恰好是最坏情况的一半，因为一次归并至少需要 n/2 次比较（一半会先用完）。

> 📝 **练习**：[活动 3](#123-活动-3最坏情况分析幻灯片-44) 就是这一推导。

## 6. 归并排序的性质与改进

幻灯片 p45：

- **额外内存与 n 成正比**：最后一次归并需要 `aux` 容纳 n 个元素。
- **最简单形式下不是原地的**。有一些改进可以把辅助数组减半（幻灯片写的是 "halting"，是 "halving"（减半）的笔误），但真正原地的归并非常困难。
- **稳定**：相等的键保持原始的相对顺序。在 `merge` 中，只有当 `aux[j] < aux[i]` 时才取右侧元素；相等时 `else` 分支取的是**左侧**元素，而它本来就排在前面。

改进措施（幻灯片 p46）：

1. 对小数组使用**插入排序**。
2. 若已经有序则**停止**。
3. **消除**到辅助数组的复制，以节省时间。

> 📘 **课外补充**（algs4 §2.2）：三种改进的具体含义：(1) 在元素少于约 10–15 个时切换为插入排序，可使典型归并排序加快 10–15%；(2) 当 `a[mid] <= a[mid+1]` 时跳过 `merge`，这使得已排序的输入只需线性时间；(3) 在每一层递归中交替使用 `a` 与 `aux` 的角色，节省复制的时间（而非空间）。

截至目前的排序算法比较（幻灯片 p47）：

| | 原地 | 稳定 | 最好 | 平均 | 最坏 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| 选择排序 | ✓ | | O(n²) | O(n²) | O(n²) | n 次交换 |
| 插入排序 | ✓ | ✓ | O(n) | O(n²) | O(n²) | 适用于小数组或部分有序的数组 |
| 归并排序 | | ✓ | O(n log n) | O(n log n) | O(n log n) | 性能有保证；稳定 |

> ⚠️ **易错点**：如果把平局判断改为 `aux[j] <= aux[i]`，归并排序就不再稳定了（来自右侧的相等元素会跑到前面）。

## 7. 快速排序：思路

快速排序（quick sort，幻灯片 p49）同样是分治法，由 Tony Hoare（托尼·霍尔）于 1959 年发明。他想在字典中查单词之前先对单词排序，想出了快速排序，但当时不知道如何实现它；后来他学习了 Algol 60 和递归，才把它实现出来。他因此获得 1980 年的图灵奖（他还发明了 null，并对此深感后悔）。

算法（幻灯片 p50）：

1. **洗牌**：打乱数组。
2. **划分**：使得对于某个枢轴下标 `j`：
   - 元素 `a[j]` 已经就位（其最终排序位置），
   - `j` 左侧不存在更大的元素，
   - `j` 右侧不存在更小的元素。
3. **递归排序**每个子数组。

幻灯片 p50 的概览（枢轴为 K）：

| 步骤 | 数组 |
| --- | --- |
| 输入 | Q U I C K S O R T E X A M P L E |
| 洗牌 | K R A T E L E P U I M Q C X O S |
| 划分 | E C A I E **K** L P U T M Q R X O S |
| 排序左侧 | A C E E I **K** L P U T M Q R X O S |
| 排序右侧 | A C E E I **K** L M O P Q R S T U X |

（幻灯片中的视频片段来自《老友记》（*Friends*）的“Pivot!”场景。）

> 💡 **关键洞见**：归并排序的划分非常简单，它的工作在递归调用**之后**完成（merge）。快速排序的工作则在递归调用**之前**完成（partition），并且不需要合并步骤：两侧都排好后，整个数组就已经有序了。

## 8. 快速排序代码与随机洗牌

幻灯片 p51：

```cpp
#include <random>
#include <utility>

// quicksort
template <typename T>
void sort(T* a, int lo, int hi)
{
    if (hi <= lo) return;
    int j = partition(a, lo, hi);
    sort(a, lo, j-1);
    sort(a, j+1, hi);
}

template <typename T>
void sort(T* a, int length) {
    std::random_device device;                        // Random shuffle
    std::default_random_engine engine{device()};
    std::shuffle(std::begin(a), std::end(a), engine);

    sort(a, 0, length-1);
}
```

- 递归调用**跳过下标 `j`**：枢轴已经是最终位置。
- 一侧可以是**空的**（例如枢轴恰好是最小值时的 `sort(a, 0, -1)`）。这就是基本情形写作 `hi <= lo` 而不是 `hi == lo` 的原因。
- 包装函数用 `std::random_device` 生成种子，并用 `std::default_random_engine`（Lecture 1 中讲过的随机性）进行洗牌，然后对整个区间排序。

幻灯片的错误（按原样无法编译）：`std::begin(a)` / `std::end(a)` 需要真正的数组，而 `a` 是 `T*`，应改用 `std::shuffle(a, a + length, engine);`。另外，`std::shuffle` 位于 `<algorithm>` 中，而幻灯片没有包含该头文件。

> 📘 **课外补充**（algs4 §2.3）：为什么要洗牌。若枢轴取 `a[lo]`，已排序的输入会使每次划分都得到 0 | n − 1 的切分，需要约 n²/2 次比较。经过随机洗牌后，平均次数约为 2 n ln n ≈ 1.39 n lg n，而退化为二次方的情形几乎不会发生。

## 9. 划分

Yeh 使用的是 "Sedgewick's partition scheme"，它结合了 Hoare 与 Lomuto 两种划分方案（幻灯片中拼写为 "Sedgwick" 与 "Lumoto"）。目标（幻灯片 p52）：重新排列 `a[lo..hi]`，使得 `a[lo..j-1] <= a[j] <= a[j+1..hi]`。

1. 枢轴 `v = a[lo]`，指针 `i` 位于 `lo`，指针 `j` 位于 `hi + 1`。
2. 重复直到 `i` 与 `j` 交错：
   - `i` 从左向右扫描，当 `a[i] < v` 时继续（停在一个 **≥ v** 的元素上），
   - `j` 从右向左扫描，当 `v < a[j]` 时继续（停在一个 **≤ v** 的元素上），
   - 交换 `a[i]` 与 `a[j]`（两者都在错误的一侧）。
3. 交换 `a[lo]` 与 `a[j]`，返回 `j`。

幻灯片 p53 的示意图：**划分前** `v | (unknown)`；**划分中** `v | ≤ v | (unknown) | ≥ v`，其中 `i` 与 `j` 位于未知部分的两端；**划分后** `≤ v | v | ≥ v`，`v` 位于下标 `j`。

```cpp
template <typename T>
int partition(T* a, int lo, int hi) {
    int i = lo;
    int j = hi + 1;
    T v = a[lo];
    while (true) {
        // Move i to the right for elements < v
        while (i < hi && a[++i] < v) {
            if (i == hi) break;
        }
        // Move j to the left for elements > v
        while (v < a[--j]) {
            if (j == lo) break;
        }
        if (i >= j) break;               // If pointers cross, stop
        std::swap(a[i], a[j]);           // Swap elements at i and j
    }
    // Place the partitioning item in its correct position
    std::swap(a[lo], a[j]);
    return j;
}
```

- `a[++i]` / `a[--j]` 是**先移动，再查看**。这就是 `j` 从 `hi + 1` 开始的原因：它第一次查看的是 `a[hi]`。`i` 第一次查看的是 `a[lo + 1]`，从而跳过枢轴。
- `i < hi`、`i == hi` 与 `j == lo` 使扫描保持在区间之内，即使枢轴是最大或最小元素时也是如此。（`j` 的循环本身也会在 `a[lo] = v` 处停止，因为 `v < v` 为假。）
- 为什么是把枢轴与 `a[j]` 交换，而不是与 `a[i]` 交换？循环结束时，`j` 位于“≤ v”一侧的**最后一个元素**上，把它移到前面可以保持左侧的正确性。`a[i]` 大于等于 v，交换它会破坏左侧。

> 📘 **课外补充**（algs4 §2.3）：两个扫描都在与 v **相等**的键上停止（两个循环都使用严格的 `<`）。这会带来一些额外的交换，但当存在大量重复元素时，它能让切分保持在中间附近；如果不在相等处停止，全部相等的数组每次都会切分成 0 | n − 1，从而退化为二次方。

## 10. 追踪快速排序

**一次划分**（幻灯片 p54–80），对已洗牌的 `K R A T E L E P U I M Q C X O S` 执行 `partition(a, 0, 15)`，v = K：

| 轮次 | i 停在 | j 停在 | 操作 | 数组 |
| --- | --- | --- | --- | --- |
| 1 | 1（R） | 12（C） | 交换 | K **C** A T E L E P U I M Q **R** X O S |
| 2 | 3（T） | 9（I） | 交换 | K C A **I** E L E P U **T** M Q R X O S |
| 3 | 5（L） | 6（E） | 交换 | K C A I E **E** **L** P U T M Q R X O S |
| 4 | 6（L） | 5（E） | 交叉，跳出 | |
| 结束 | | | 交换 a[0]、a[5] | E C A I E **K** L P U T M Q R X O S，返回 **5** |

```viz quick-sort
{"title": "幻灯片 54–80：partition(a, 0, 15)", "items": "K, R, A, T, E, L, E, P, U, I, M, Q, C, X, O, S", "mode": "partition"}
```

**整个排序过程**（幻灯片 p81；粉色为 `sort(a, lo, j-1)`，蓝色为 `sort(a, j+1, hi)`，红色为枢轴）。每一行是一次 `partition` 调用；大小为 1 的子数组无需划分（lo = hi 的行）：

| lo | j | hi | 划分后的数组 |
| --- | --- | --- | --- |
| 0 | 5 | 15 | E C A I E **K** L P U T M Q R X O S |
| 0 | 3 | 4 | E C A **E** I K … |
| 0 | 2 | 2 | A C **E** E I K … |
| 0 | 0 | 1 | **A** C E E I K … |
| 6 | 6 | 15 | … K **L** P U T M Q R X O S |
| 7 | 9 | 15 | … L M O **P** T Q R X U S |
| 7 | 7 | 8 | … L **M** O P … |
| 10 | 13 | 15 | … P S Q R **T** U X |
| 10 | 12 | 12 | … P R Q **S** T U X |
| 10 | 11 | 11 | … P Q **R** S T U X |
| 14 | 14 | 15 | … T **U** X |
| 结果 | | | A C E E I K L M O P Q R S T U X |

第一次划分之后，幻灯片对 `E C A I E` 调用 `sort(a, 0, 4)`（幻灯片 p82）。逐步演示整个递归过程（调用栈位于变量面板中）：

```viz quick-sort
{"title": "幻灯片 81–82：快速排序 K R A T E L E P U I M Q C X O S", "items": "K, R, A, T, E, L, E, P, U, I, M, Q, C, X, O, S", "interactive": true}
```

> ⚠️ **易错点**：Visualgo 的快速排序（幻灯片 p83 的注释）是另一种实现。考试时，请按**本讲**的划分方式追踪：枢轴 `a[lo]`，i 停在 ≥ v 的元素上，j 停在 ≤ v 的元素上，最后与 `a[j]` 交换。

> 📝 **练习**：[活动 4](#124-活动-4手工执行快速排序幻灯片-83) 手工对 `3 7 8 5 2 1 9 5 4` 排序。

## 11. 完整实现

```cpp
#include <algorithm>   // std::shuffle (missing on slide 51)
#include <random>
#include <utility>

namespace mergesort {
template <typename T>
void merge(T* a, T* aux, int lo, int mid, int hi) {
    for (int k = lo; k <= hi; k++) aux[k] = a[k];
    int i = lo, j = mid + 1;
    for (int k = lo; k <= hi; k++) {
        if (i > mid)              a[k] = aux[j++];
        else if (j > hi)          a[k] = aux[i++];
        else if (aux[j] < aux[i]) a[k] = aux[j++];
        else                      a[k] = aux[i++];
    }
}
template <typename T>
void sort(T* a, T* aux, int lo, int hi) {
    if (hi <= lo) return;
    int mid = lo + (hi - lo) / 2;
    sort(a, aux, lo, mid);
    sort(a, aux, mid+1, hi);
    merge(a, aux, lo, mid, hi);
}
template <typename T>
void sort(T* a, int length) {
    T* aux = new T[length];
    sort(a, aux, 0, length - 1);
    delete[] aux;
}
}

namespace quicksort {
template <typename T>
int partition(T* a, int lo, int hi) {
    int i = lo;
    int j = hi + 1;
    T v = a[lo];
    while (true) {
        while (i < hi && a[++i] < v) { if (i == hi) break; }
        while (v < a[--j])           { if (j == lo) break; }
        if (i >= j) break;
        std::swap(a[i], a[j]);
    }
    std::swap(a[lo], a[j]);
    return j;
}
template <typename T>
void sort(T* a, int lo, int hi) {
    if (hi <= lo) return;
    int j = partition(a, lo, hi);
    sort(a, lo, j-1);
    sort(a, j+1, hi);
}
template <typename T>
void sort(T* a, int length) {
    std::random_device device;
    std::default_random_engine engine{device()};
    std::shuffle(a, a + length, engine);   // fixed: slide has std::begin(a), std::end(a)
    sort(a, 0, length-1);
}
}
```

使用 `g++ -std=c++17 -Wall -fsanitize=address,undefined` 测试（比较次数通过带计数功能的 `operator<` 统计）：

```text
merge example: AGHILMORST  compares=8
best 123|456 compares=3
worst 135|246 compares=5
MERGESRT -> EEGMRRST  compares=15
worst n=8 compares=17 (n lg n - n + 1 = 17)
partition: ECAIEKLPUTMQRXOS  j=5
quicksort (no shuffle): ACEEIKLMOPQRSTUX
Activity 4 first partition: 2 1 3 5 8 7 9 5 4
j=2
Activity 4 sorted: 1 2 3 4 5 5 7 8 9
quicksort wrapper: 1 2 3 5 8 9
mergesort wrapper: 1 2 3 5 8 9
```

## 12. 课堂活动（附解答）

### 12.1 活动 1：merge 中的比较次数（幻灯片 20）

要把两个已排序的子数组（各长 n/2）合并为一个长度为 n 的有序数组，`merge()` 需要调用多少次 `<`？

A. 约 n/4 到约 n/2
B. 约 n/2
C. 约 n/2 到 n
D. 约 n
E. 约 n 到 2n

给出一个最好情况的例子和一个最坏情况的例子（每个有序子数组使用 3 个元素）。

> ✍️ **先自己试一试。** 提示：每次比较恰好放置一个元素；一旦某一半用完，就不再进行比较。

**解答：C。** 最好情况：一半在 n/2 次比较后就用完了，例如 `1 2 3 | 4 5 6` → 3 次比较（1、2、3 各自都小于 4；然后 4 5 6 直接复制）。最坏情况：两半交错排列，直到最后两半都还没用完，例如 `1 3 5 | 2 4 6` → 5 = n − 1 次比较。因此次数介于约 n/2 与约 n 之间。验证最坏情况：

```viz merge-sort
{"title": "活动 1 最坏情况：1 3 5 | 2 4 6", "items": "1, 3, 5, 2, 4, 6", "mode": "merge", "mid": 2}
```

返回 [合并两个已排序的半段](#2-合并两个已排序的半段)。

### 12.2 活动 2：子数组长度（幻灯片 42）

对长度为 10 的数组运行归并排序时，下列哪些子数组长度会出现？

A. { 1, 2, 3, 5, 7, 10 }
B. { 2, 4, 6, 8, 10 }
C. { 1, 2, 5, 10 }
D. { 1, 2, 3, 4, 5, 10 }
E. { 1, 2, 3, 5, 10 }

> ✍️ **先自己试一试。**

**解答：E。** 长度为 n 的区间会被分成 ⌈n/2⌉（左侧，包含 `mid`）与 ⌊n/2⌋：10 → 5 + 5，5 → 3 + 2，3 → 2 + 1，2 → 1 + 1。出现的长度为：10、5、3、2、1。A 多了 7；B 与 D 含有从不出现的偶数长度（B 还缺少 1，而每次递归都会到达 1）；C 缺少 3。返回 [追踪归并排序的过程](#4-在-m-e-r-g-e-s-r-t-上追踪归并排序)。

### 12.3 活动 3：最坏情况分析（幻灯片 44）

**(a)** 分析归并排序的最坏情况时间复杂度（比较次数）。
**(b)** 写出描述最坏情况时间复杂度的递推式。
**(c)** 使用递归树或主定理求解该递推式。

> ✍️ **先自己试一试。**

**解答。** **(a)** 所有比较都发生在 `merge` 中；归并 n 个元素最多需要 n − 1 次比较。**(b)** $C(n) = 2C(n/2) + (n - 1)$，$C(1) = 0$；若只关注增长阶，则为 $T(n) = 2T(n/2) + n$。**(c)** 递归树：log₂ n 层 × 每层 n = n log₂ n（精确值为 n log₂ n − n + 1）。主定理：a = 2，b = 2，d = 1，a = bᵈ → Θ(n log n)。返回 [归并排序的分析](#5-归并排序的分析)。

### 12.4 活动 4：手工执行快速排序（幻灯片 83）

用快速排序对下列数组排序（假设枢轴取 lo）：

`3 7 8 5 2 1 9 5 4`

注意：Visualgo 的快速排序实现与本讲介绍的不同。

> ✍️ **先自己试一试。** 提示：忽略洗牌；严格按照 §9 中的 `partition` 追踪。

**解答。**

| 调用 | 划分步骤 | 之后的数组 | j |
| --- | --- | --- | --- |
| sort(0,8)，v = 3 | i→7 (1)，j→1 (5)：交换；i→8 (2)，j→2 (4)：交换；i→5 (3)，j→2 (2)：交错；交换 a[0]、a[2] | 2 1 **3** 5 8 7 9 5 4 | 2 |
| sort(0,1)，v = 2 | i 扫到 hi (1)；j→1：交错；交换 a[0]、a[1] | **1 2** 3 … | 1 |
| sort(3,8)，v = 5 | i→8，j→4：交换；i→7，j→5（另一个 5）：交换；i→9，j→5：交错；交换 a[3]、a[5]（5 与 5） | 1 2 3 5 4 **5** 9 7 8 | 5 |
| sort(3,4)，v = 5 | i 扫到 hi；j→4：交错；交换 | 1 2 3 **4 5** 5 9 7 8 | 4 |
| sort(6,8)，v = 9 | i 扫到 hi (8)；j→8：交错；交换 a[6]、a[8] | … 8 7 **9** | 8 |
| sort(6,7)，v = 8 | i 扫到 hi；j→7：交错；交换 | … **7 8** 9 | 7 |

结果：**1 2 3 4 5 5 7 8 9**。注意 `sort(3,8)`：由于比较是严格的，两个扫描都停在第二个 5 上，因此相等的键被交换了。验证：

```viz quick-sort
{"title": "活动 4 检查", "items": "3, 7, 8, 5, 2, 1, 9, 5, 4"}
```

返回 [追踪快速排序](#10-追踪快速排序)。

## 13. 速查与必记的 5 个要点

| | 归并排序 | 快速排序（本讲版本） |
| --- | --- | --- |
| 切分 | 在中间下标（`mid`）处 | 在枢轴的最终下标（`j`）处 |
| 工作何时完成 | 递归调用之后（`merge`） | 递归调用之前（`partition`） |
| 比较发生在 | merge 中的 `aux[j] < aux[i]` | partition 中的 `a[++i] < v`、`v < a[--j]` |
| 额外内存 | 大小为 n 的 `aux` | 除递归栈外没有 |
| 稳定 | 是（平局时取左侧） | 否（长距离交换） |
| 时间 | 最好/平均/最坏均为 Θ(n log n) | 见第 8 节中的 📘（随机洗牌保护平均情况） |

**必记的 5 个要点**

1. `merge` 只在两半都还有元素时比较 `aux[j] < aux[i]`；`i > mid` / `j > hi` 表示某一半已用完，平局时取左侧元素，这使归并排序保持稳定。
2. 归并排序的递推式为 $C(n) = 2C(n/2) + (n - 1)$：log₂ n 层 × 每层 n = 在所有情况下都是 Θ(n log n)，代价是 O(n) 的 `aux` 数组（非原地）。
3. 子数组长度来自于反复切分为 ⌈n/2⌉ 与 ⌊n/2⌋（n = 10 → 10、5、3、2、1）。
4. 划分：i 停在 ≥ v 的元素上，j 停在 ≤ v 的元素上，若 `i < j` 则交换，两者交错时停止，然后将枢轴与 `a[j]` 交换（绝不与 `a[i]` 交换）。
5. 划分之后，`a[j]` 已是最终位置；对 `lo..j-1` 与 `j+1..hi` 递归，这两段可能为空，因此基本情形必须写作 `hi <= lo`。
