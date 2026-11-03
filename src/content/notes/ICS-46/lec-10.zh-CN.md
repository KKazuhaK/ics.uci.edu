---
title: "树"
summary: "树的术语（深度、高度、度）、满二叉树与完全二叉树、节点数与高度界、BinaryTree 骨架、层序/前序/中序/后序遍历，以及二叉堆：堆序、数组表示、swim、insert 与 sink。"
---

# Information and Computer Science 46 — Lecture 10：树

## 目录

- [1. 树：层次化数据](#1-树层次化数据)
- [2. 树的术语](#2-树的术语)
- [3. 深度、层与高度](#3-深度层与高度)
- [4. 满二叉树与完全二叉树](#4-满二叉树与完全二叉树)
- [5. 节点计数与高度界](#5-节点计数与高度界)
- [6. 骨架实现](#6-骨架实现)
- [7. 广度优先：层序遍历](#7-广度优先层序遍历)
- [8. 深度优先：前序、中序与后序](#8-深度优先前序中序与后序)
- [9. 堆有序的二叉树](#9-堆有序的二叉树)
- [10. 二叉堆的数组表示](#10-二叉堆的数组表示)
- [11. 上浮（swim）](#11-上浮swim)
- [12. 堆的插入](#12-堆的插入)
- [13. 下沉（sink）](#13-下沉sink)
- [14. 完整实现](#14-完整实现)
- [15. 课堂活动（附解答）](#15-课堂活动附解答)
- [16. 速查与必记的 5 个要点](#16-速查与必记的-5-个要点)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/29/26
> 整理自 Lecture 10 幻灯片（其中也包含首次出现在 Lecture 9 讲义末尾的 Trees 部分）；补充材料：algs4 §2.4 Priority Queues 与 §3.1 Symbol Tables。按概念组织，而不是按资料来源组织。

> 📅 **课程安排**：Quiz 3 本周五（Stacks、Queues、Deques）· HW 5 周五截止 · Lab 4 下周一截止
> Quiz 2 已批改（平均 79.5，最高 100）；HW 3 已批改；Lab 2 在人工批改后公布成绩
> AI 工具访问需要提交两部分同意书（数据存储不用于学术诚信审查；研究同意可获 1% 额外学分，之后还会提供另一种额外学分方式）

---

## 1. 树：层次化数据

列表、栈和队列都是**线性**结构：每个元素至多有一个前驱和一个后继。**树**是一种以**层次化**方式存储元素的抽象数据类型：每个元素有**唯一一个父节点**（直接祖先）和**零个或多个子节点**（直接后代）。幻灯片中的例子包括：组织结构图（CEO → CFO、CMO、COO、CTO → ……）、网站站点地图（Home → About、Products，……），以及文件系统（`/` → Documents、Downloads、Music → ……）。

在计算机科学中，我们把树画成倒置的：**根**在顶部，**叶子**在底部。

**定义（幻灯片 7）。** 树 $T$ 是一组节点的集合，这些节点以父子关系存储元素，满足：

- 若 $T$ 非空，则它有一个特殊节点——**根**，根没有父节点；
- 除根以外的每个节点 $v$ 都有**唯一的父节点**。

例：根为 A；A 的子节点为 B 和 C；B 的子节点为 D 和 E；C 的子节点为 F；E 的子节点为 G；F 的子节点为 H 和 I。

## 2. 树的术语

所有例子都使用幻灯片中的**示例树**（幻灯片 8–9、13–14、18、21–25）：

| 节点 | K | C | N | A | F | M | V | B | D | H | U |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 左子节点 | C | A | M | — | D | — | U | — | — | — | — |
| 右子节点 | N | F | V | B | H | — | — | — | — | — | — |

| 术语 | 含义 | 示例 |
|---|---|---|
| 边 | 一对相连的节点 | (K, C) |
| 父节点 / 子节点 | 直接在上方 / 直接在下方的节点 | K 是 C 和 N 的父节点 |
| 兄弟节点 | 具有相同父节点的节点 | A 和 F |
| 祖先 / 后代 | 沿着通往根的路径，位于上方 / 下方的任意节点 | K 是 B 的祖先；B 是 K 的后代 |
| 子树 | 一个节点及其所有后代 | 以 N 为根的子树 = {N, M, V, U} |
| 叶子（外部节点） | 没有子节点 | {B, D, H, M, U} |
| 内部节点 | 至少有一个子节点 | {K, C, N, A, F, V} |
| 森林 | 一组互不相交的树 | |
| 简单路径 | 节点互不相同，且相邻两个节点之间有边 | K-N-V-U |
| 路径长度 | 路径上**边**的数量 | K-C-A 的长度为 2 |
| 节点的高度 | 从该节点向下到叶子的最长路径的长度 | height(C) = 2（C-F-D） |
| 树的高度 | 根到叶子的最长路径 = 根的高度 | 3（例如 K-C-A-B） |
| 节点的度 | 子节点的数量 | degree(C) = 2 |
| 树的度（arity） | 任一节点的度的最大值 | 2 |
| 二叉树 | 度为 2 的树：每个节点至多有 2 个子节点，分别位于**左**或**右**位置 | |

> ⚠️ **幻灯片错误**：幻灯片 9 的"快速检查"答案把叶子列为 {B, D, H, M, U, V}，内部节点列为 {K, C, N, A, F}。V 有子节点 U，因此 V 是**内部节点**：叶子为 {B, D, H, M, U}，内部节点为 {K, C, N, A, F, V}。

## 3. 深度、层与高度

**深度（= 层）**：节点到根的距离（边的数量）。根的深度/层为 0。**二叉树的深度**是其所有节点的层的最大值，且深度最大的节点一定是叶子。

**高度**是从底部反向度量的：

- 叶子的高度为 0；
- 其他任一节点的高度为 1 + 其非空子节点的最大高度。

**树的高度**就是其根的高度。因此深度从根向下计数，高度从叶子向上计数；对于整棵树，两者一致（最大深度 = 根的高度）。

例（幻灯片 11–12）：幻灯片中的 10 节点树中，叶子标为 0，其父节点标为 1 和 2，根标为 3；最深的叶子位于深度 3，因此树的深度 = 树的高度 = 3。在 §2 的示例树中：depth(F) = 2，height(F) = 1，height(K) = 3。

> ⚠️ **易错点**：深度和高度按**边**计算，而不是按节点计算。单节点树的高度为 0；在递归公式中，空树的高度记为 −1，这样叶子的高度为 1 + max(−1, −1) = 0（见 §14 中的 `height()`）。

## 4. 满二叉树与完全二叉树

- **满二叉树（full/proper）**：每个节点都有 **0 或 2** 个子节点——不能恰好只有一个。
- **完全二叉树（complete）**：高度最小——每一层都是满的，除了最后一层可能不满；且最后一层的节点**尽可能靠左**（按层序无空洞）。

这两个性质相互独立（幻灯片 15 给出了每种性质的一棵树）：

| | 满 | 不满 |
|---|---|---|
| **完全** | 每层都满，或最后一层从左侧连续排列且成对出现 | 最后一层以一个孤立的左子节点结束 |
| **不完全** | 较高层有叶子缺失，或最后一层有空隙，但没有只有一个子节点的节点 | 例如某节点只有一个子节点**且**存在空隙 |

§2 中的示例树**两者都不是**：A 和 V 各只有一个子节点（不满），且其最后一层在 A 左子节点应在的位置有空洞（不完全）。

> 📝 **练习**：[练习时间](#152-练习满还是完全幻灯片-1617) — 两棵树需要分类。

## 5. 节点计数与高度界

**引理。** 二叉树第 $k$ 层最多有 $2^k$ 个节点（每一层最多翻倍）。示例树第 2 层达到最大值 $2^2 = 4$：A、F、M、V。

**定理。** 高度为 $h$、节点数为 $n$ 的二叉树满足

$$h + 1 \le n \le 2^{h+1} - 1 \qquad\Longleftrightarrow\qquad \log_2(n+1) - 1 \le h \le n - 1$$

- **最小值** $n = h + 1$：一根"棍子"——除叶子外每个节点都只有一个子节点，树退化为链表。因此**最坏情况下的高度为 $n - 1 = O(n)$**。
- **最大值** $n = 1 + 2 + 4 + \dots + 2^h = 2^{h+1} - 1$：每层都满。因此**最好情况下的高度为 $O(\log n)$**，由紧凑（完全）树达到。

例：7 个节点的树，高度可以是 2（三层全满）到 6（棍子）之间的任意值。

> 💡 **关键洞见**：每个沿着一条根到叶子路径执行的树操作，代价为 O(height)——介于 O(log n) 与 O(n) 之间。让树保持较矮，正是平衡树（第 13 讲）和堆（§9）所关注的。

> ⚠️ **幻灯片错误**：幻灯片 18 把上界标为 "MAX (complete)"。$2^{h+1} - 1$ 个节点需要**每一层**都满（即*完美*树）；高度为 $h$ 的完全树，其节点数可以在 $2^h$ 到 $2^{h+1} - 1$ 之间。

## 6. 骨架实现

与链表一样，二叉树是由通过指针相互链接的 `Node` 对象组成的集合，但每个节点有**两个**链接：

```cpp
template <typename Item>
class BinaryTree {
private:
    // Nested Node class
    class Node {
    public:
        Item item;      // Payload
        Node* left;     // Pointer to left child
        Node* right;    // Pointer to right child

        // Node constructor
        Node(Node* leftNode, Node* rightNode, const Item& value)
            : item(value), left(leftNode), right(rightNode) {}
    };

    Node* root; // Pointer to the root node of the tree
};
```

幻灯片 19 的图标明了各部分：`root` 指向顶部节点；每个 `left`/`right` 指针都是一条**链接**；任一节点及其下方的全部内容构成一棵**子树**（因此每条链接都指向一棵子树——这正是树的代码天然是递归的原因）；**叶子**是两个链接都是**空链接**（`nullptr`）的节点。

例：一棵 3 节点的树写作 `new Node(new Node(nullptr, nullptr, "A"), new Node(nullptr, nullptr, "C"), "B")` —— 注意构造函数**先**接收子节点，最后接收值。

## 7. 广度优先：层序遍历

线性结构只有一种自然顺序；树可以按多种顺序遍历（幻灯片 20）：

- **广度优先**：层序；
- **深度优先**：前序、中序、后序（§8）。

**层序**：从第 0 层开始，在访问第 $i+1$ 层任何节点之前，先从左到右访问第 $i$ 层的所有节点。在示例树上：**K C N A F M V B D H U**。

幻灯片只给出顺序，没有代码；标准实现（我的版本）使用第 5 讲中的 FIFO 队列：弹出一个节点，访问它，然后把它的子节点入队。

```cpp
void levelorder() const {
    std::queue<Node*> q;
    if (root) q.push(root);
    while (!q.empty()) {
        Node* t = q.front(); q.pop();
        visit(t->item);
        if (t->left)  q.push(t->left);
        if (t->right) q.push(t->right);
    }
}
```

下面可以逐步演示（演示获得焦点时，← / → 键可用）：

```viz tree-traversal
{"title": "幻灯片 21：示例树的层序遍历", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "order": "level", "interactive": true}
```

每个节点只进入和离开队列一次，因此遍历的复杂度为 O(n)。

> ⚠️ **幻灯片错误**：幻灯片 21（层序）中有一条注释 "provides sorted order for Binary Search Trees"（为二叉搜索树提供有序顺序）。那指的是**中序**（幻灯片 24，§8）；二叉搜索树的层序遍历并不有序。

## 8. 深度优先：前序、中序与后序

三种遍历都会访问根，并递归地先遍历左子树、再遍历右子树。前缀表示根**何时**被标记为已访问：**前序**（pre）= 在两棵子树之前；**中序**（in）= 在两者之间；**后序**（post）= 在两棵子树之后。

| 遍历 | 递归 | 示例树 | 典型用途（幻灯片） |
|---|---|---|---|
| 前序 | 根，Preorder(左)，Preorder(右) | K C A B F D H N M V U | 先处理父节点再处理其子节点，例如**复制**一棵树 |
| 中序 | Inorder(左)，根，Inorder(右) | A B C D F H K M N U V | 在二叉搜索树上得到**有序序列**（例如查找第 k 小的元素） |
| 后序 | Postorder(左)，Postorder(右)，根 | B A D H F C M U V N K | 先处理两棵子树再处理父节点，例如**删除** |

下面的代码（我的版本——幻灯片只用文字给出递归过程）中，只有 `visit` 的位置发生变化：

```cpp
void preorder(Node* t) {
    if (t == nullptr) return;
    visit(t->item);          // root first
    preorder(t->left);
    preorder(t->right);
}
// inorder:   inorder(t->left);  visit(t->item);  inorder(t->right);
// postorder: postorder(t->left); postorder(t->right); visit(t->item);
```

下面逐步演示中序遍历（调用栈以橙色显示）：

```viz tree-traversal
{"title": "幻灯片 24：示例树的中序遍历", "tree": "K, C, N, A, F, M, V, -, B, D, H, -, -, U", "order": "in", "interactive": true}
```

每个节点恰好有一次调用（外加每个空链接一次调用），因此每种遍历的时间复杂度为 O(n)；调用栈中树的每一层最多对应一个栈帧，额外空间为 O(height)。

> 💡 **关键洞见**：手工检查的快速方法：前序中**根排在第一位**，后序中**根排在最后**，中序中根把左子树的节点与右子树的节点**分隔**开（A B C D F H | K | M N U V）。

> 📝 **练习**：[活动 1](#151-活动-1按四种顺序列出节点幻灯片-26) — 给一棵新树列出四种顺序。

## 9. 堆有序的二叉树

**定义。** 若二叉树中每个节点的键**大于或等于其两个子节点的键**（若存在），则称该二叉树为**堆有序**的。等价地，每个节点的键小于或等于其父节点的键。由此推出（幻灯片 27）：

- **不对子节点作假设**：并不规定左子节点和右子节点哪个更小。
- 从任一节点**向上**移动时，键构成**非递减**序列；**向下**移动时，构成非递增序列。
- 因此**最大键位于根**。

这就是**最大堆**。把所有比较反过来，就得到**最小堆**（父节点 ≤ 子节点，最小键位于根）。幻灯片 28 的例子：

| | 根 | 第 1 层 | 第 2 层 | 第 3 层 |
|---|---|---|---|---|
| 最大堆 | 100 | 19, 28 | 17, 3（位于 19 之下）· 25, 1（位于 28 之下） | 2, 7（位于 17 之下） |
| 最小堆 | 1 | 3, 2 | 7, 19（位于 3 之下）· 25, 28（位于 2 之下） | 17, 100（位于 7 之下） |

堆序只约束每一对父子节点，不约束不同路径上的节点：在最大堆中，3（第 2 层）比 7（第 3 层）小，这没有问题，因为 7 位于 17 之下，而不是位于 3 之下。

> 📘 **课外补充**：在一个含 n 个键的堆中，大约一半节点（⌈n/2⌉ 个）是叶子，而且**最大堆的最小值可以是其中任意一个叶子**——找到它需要 O(n)。堆只在每条根到叶子的路径上是"有序"的。（algs4 §2.4 网上练习）

## 10. 二叉堆的数组表示

**二叉堆**是一棵堆有序的**完全**二叉树，以**层序**存储在数组中：

- 下标 0 不使用；根位于下标 1；
- 其余节点按层从左到右依次排列；
- 由于树是完全的，没有空洞，因此**没有空间浪费**，也**不需要指针**（基于指针的树每个节点要用三个指针——父、左、右）。

**下标计算（从 1 开始）：** 对于下标为 $k$ 的节点

$$\text{parent} = \lfloor k/2 \rfloor, \qquad \text{children} = 2k \text{ and } 2k + 1$$

在树中上下移动只是对下标做算术运算——直接按下标访问远比沿指针访问快，这与 ArrayList 相对于链表的优势相同。

例（幻灯片 29），最大堆 100 / 19, 36 / 17, 3, 25, 1 / 2, 7：

| 下标 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|
| pq[i] | – | 100 | 19 | 36 | 17 | 3 | 25 | 1 | 2 | 7 |

检验：下标 4 处是 17 → 父节点下标 ⌊4/2⌋ = 2（19），子节点下标 8 和 9（2 和 7）。幻灯片 30 的字母堆为 `– T S R P N O A E I H G`（根为 T；S、R；P、N、O、A；E、I、H、G）。

> 📘 **课外补充**：按**降序**排列的数组总是合法的最大堆：每个父节点的下标 k 都小于其子节点的下标 2k 和 2k+1，因此它的键至少与子节点的一样大。（algs4 §2.4 练习）

## 11. 上浮（swim）

**场景**：某个键变得**大于其父节点**，破坏了堆序。**修复**：将它与父节点交换，并重复此过程，直到恢复堆序（它到达一个更大的父节点，或到达根）。也称为 promote 或 percolate up，即*自底向上堆化（reheapify bottom-up）*。

```cpp
void swim(size_t k) {
    while (k > 1 && less(k/2, k)) {
        exch(k, k/2);
        k = k/2;
    }
}
```

`less(i, j)` 比较 `pq[i] < pq[j]`，`exch(i, j)` 交换二者（与排序讲座中的辅助函数相同）。幻灯片 32–33 的例子：在 `– S P R G T O A E I H G` 中，下标 5 处的键为 T；T 先与 P（下标 2）交换，再与 S（下标 1）交换：

```viz binary-heap
{"title": "幻灯片 32–33：swim(5)", "heap": "S, P, R, G, T, O, A, E, I, H, G", "ops": "swim(5)"}
```

结果为 `– T S R G P O A E I H G`。每次迭代上升一层，因此 swim 的复杂度为 O(log n)（完全树的高度）。

> 📘 **课外补充**：为什么一次交换不会破坏*下方*的堆序：交换后，上升的键大于它原来的父节点（这正是它上升的原因），因此也大于原父节点的另一个子节点。唯一可能产生的新违反是与再上一层的父节点之间——这正是循环所检查的。（algs4 §2.4）

## 12. 堆的插入

**插入：** 将新键**加到最底层的末尾**（即下一个空闲的数组位置，这样能保持树的完全性），然后将它**上浮**。

```cpp
void insert(const Key& x) {
    pq[++n] = x;
    swim(n);
}
```

**代价：** 最多 $\log n + 1$ 次比较——路径上每一层一次。

例（幻灯片 34）：将 S 插入 `– T P R N H O A E I G`。S 落在下标 11（H 的子节点）处；S > H → 交换；S > P → 交换；S < T → 停止。结果为 `– T S R N P O A E I G H`。

```viz binary-heap
{"title": "幻灯片 34：insert(S)", "heap": "T, P, R, N, H, O, A, E, I, G", "ops": "insert(S)", "interactive": true}
```

> ⚠️ **易错点**：`pq[++n]` 是**前置**自增：n 先变为新的大小，然后键放入 `pq[n]`。若写成 `pq[n++] = x`，键会放入旧的 `pq[n]`，并**覆盖最后一个键**，因为堆存放在 `pq[1..n]` 中（下标 0 不使用）。

## 13. 下沉（sink）

**场景**：某个键变得**小于其一个（或两个）子节点**。**修复**：将它与其**较大**的子节点交换，并重复此过程，直到恢复堆序（两个子节点都更小，或它到达底部）。也称为 demote 或自顶向下堆化（top-down heapify）。

```cpp
void sink(int k) {
    while (2*k <= n) {
        int j = 2*k;
        if (j < n && less(j, j+1))
            j++;
        if (!less(k, j))
            break;
        exch(k, j);
        k = j;
    }
}
```

逐行解释：`2*k <= n` —— k 仍有左子节点；`j = 2*k` —— 从左子节点开始；`j < n && less(j, j+1)` —— 若存在右子节点且更大，则改用右子节点；`!less(k, j)` —— k 不小于其较大的子节点，结束；否则交换并从 j 继续。

例（幻灯片 36）：在 `– T H R P S O A E I N G` 中，下标 2 处的键 H 小于其子节点 P 和 S。H 先与 S（下标 5）交换，再与 N（下标 10）交换，并在底部停止。结果为 `– T S R P N O A E I H G`。

```viz binary-heap
{"title": "幻灯片 36：sink(2)", "heap": "T, H, R, P, S, O, A, E, I, N, G", "ops": "sink(2)"}
```

Sink 同样只沿一条根到叶子的路径运行：O(log n)，每层**2 次比较**（先选出较大的子节点，再与其比较）。

> ⚠️ **易错点**：应与**较大**的子节点交换，而不是左子节点。若 H 与 P 交换而不是与 S 交换，P 就会跑到 S 之上——产生新的违反。

> ➡️ **接续见 [第 11 讲](lec-11.zh-CN.md)**：堆的活动（插入 47、下沉 7、删除最大值）、`delMax()`、运行时间汇总，以及 algs4 二叉堆演示——第 11 讲的讲义会重复这些内容。

## 14. 完整实现

```cpp
#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>

template <typename Item>
class BinaryTree {
private:
    class Node {
    public:
        Item item;
        Node* left;
        Node* right;
        Node(Node* leftNode, Node* rightNode, const Item& value)
            : item(value), left(leftNode), right(rightNode) {}
    };
    Node* root;

    // pos[1] = root, children of p at 2p, 2p+1, "-" = empty
    static Node* build(const std::vector<std::string>& pos, size_t p) {
        if (p >= pos.size() || pos[p] == "-") return nullptr;
        return new Node(build(pos, 2 * p), build(pos, 2 * p + 1), pos[p]);
    }
    static void destroy(Node* t) {          // post-order
        if (t == nullptr) return;
        destroy(t->left);
        destroy(t->right);
        delete t;
    }
    static void preorder(Node* t) {
        if (t == nullptr) return;
        std::cout << t->item << ' ';
        preorder(t->left);
        preorder(t->right);
    }
    static void inorder(Node* t) {
        if (t == nullptr) return;
        inorder(t->left);
        std::cout << t->item << ' ';
        inorder(t->right);
    }
    static void postorder(Node* t) {
        if (t == nullptr) return;
        postorder(t->left);
        postorder(t->right);
        std::cout << t->item << ' ';
    }
    static int height(Node* t) {             // empty = -1, leaf = 0
        if (t == nullptr) return -1;
        return 1 + std::max(height(t->left), height(t->right));
    }
    static int size(Node* t) {
        return t == nullptr ? 0 : 1 + size(t->left) + size(t->right);
    }

public:
    explicit BinaryTree(const std::vector<std::string>& pos) : root(build(pos, 1)) {}
    ~BinaryTree() { destroy(root); }
    BinaryTree(const BinaryTree&) = delete;
    BinaryTree& operator=(const BinaryTree&) = delete;

    void preorder() const { preorder(root); std::cout << '\n'; }
    void inorder() const { inorder(root); std::cout << '\n'; }
    void postorder() const { postorder(root); std::cout << '\n'; }
    void levelorder() const {
        std::queue<Node*> q;
        if (root) q.push(root);
        while (!q.empty()) {
            Node* t = q.front(); q.pop();
            std::cout << t->item << ' ';
            if (t->left)  q.push(t->left);
            if (t->right) q.push(t->right);
        }
        std::cout << '\n';
    }
    int height() const { return height(root); }
    int size() const { return size(root); }
};

template <typename Key>
class MaxHeap {
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
    void insert(const Key& x) {
        pq.push_back(x);              // slide: pq[++n] = x;
        ++n;
        swim(n);
    }
    void print() const {
        for (size_t i = 1; i <= n; i++) std::cout << pq[i] << ' ';
        std::cout << '\n';
    }
    void load(const std::vector<Key>& keys) {   // as-is, for the sink demo
        pq.assign(1, Key{});
        pq.insert(pq.end(), keys.begin(), keys.end());
        n = keys.size();
    }
    void sinkAt(size_t k) { sink(k); }
};

int main() {
    BinaryTree<std::string> t({"", "K", "C", "N", "A", "F", "M", "V",
                               "-", "B", "D", "H", "-", "-", "U"});
    std::cout << "pre:   "; t.preorder();
    std::cout << "in:    "; t.inorder();
    std::cout << "post:  "; t.postorder();
    std::cout << "level: "; t.levelorder();
    std::cout << "size " << t.size() << ", height " << t.height() << '\n';

    MaxHeap<char> h;
    for (char c : std::string("TPRNHOAEIG")) h.insert(c);
    std::cout << "heap:  "; h.print();
    h.insert('S');
    std::cout << "+S:    "; h.print();

    MaxHeap<char> s;
    s.load({'T','H','R','P','S','O','A','E','I','N','G'});
    s.sinkAt(2);
    std::cout << "sink2: "; s.print();
}
```

输出（`g++ -std=c++17 -Wall -fsanitize=address,undefined`）：

```text
pre:   K C A B F D H N M V U
in:    A B C D F H K M N U V
post:  B A D H F C M U V N K
level: K C N A F M V B D H U
size 11, height 3
heap:  T P R N H O A E I G
+S:    T S R N P O A E I G H
sink2: T S R P N O A E I H G
```

这里的堆使用可增长的 `std::vector` 而不是固定数组，并且 `swim` 和 `sink` 都使用 `size_t`（幻灯片中 `swim` 使用 `size_t`，但 `sink` 使用 `int`；将 `int k` 与 `size_t n` 混用会产生有符号/无符号比较的警告）。

## 15. 课堂活动（附解答）

### 15.1 活动 1：按四种顺序列出节点（幻灯片 26）

按前序、中序、后序和层序列出节点：

| 节点 | 8 | 5 | 4 | 9 | 7 | 11 | 1 | 12 | 3 | 2 |
|---|---|---|---|---|---|---|---|---|---|---|
| 左子节点 | 5 | 9 | — | — | 1 | 3 | — | 2 | — | — |
| 右子节点 | 4 | 7 | 11 | — | 12 | — | — | — | — | — |

（根为 8；5 的子节点为 9 和 7；7 的子节点为 1 和 12；12 有左子节点 2；4 只有右子节点 11；11 有左子节点 3。）

> ✍️ **先自己试一试。** 提示：4 没有左子节点，11 没有右子节点——递归走到它们时，缺失的一侧会立即返回。

**解答**

| 顺序 | 序列 |
|---|---|
| 前序 | 8 5 9 7 1 12 2 4 11 3 |
| 中序 | 9 5 1 7 2 12 8 4 3 11 |
| 后序 | 9 1 2 12 7 5 3 11 4 8 |
| 层序 | 8 5 4 9 7 11 1 12 3 2 |

检验：前序以根 8 开始，后序以它结束；中序将 8 置于左子树（9 5 1 7 2 12）与右子树（4 3 11）之间。在中序中，4 排在 3 和 11 **之前**，因为它没有左子树；在层序中，3（第 3 层，位于 11 之下）排在 1 和 12 **之后**，而 2 最后（第 4 层）。检查这里的后序：

```viz tree-traversal
{"title": "活动 1 检查：后序", "tree": "8, 5, 4, 9, 7, -, 11, -, -, 1, 12, -, -, 3, -, -, -, -, -, -, -, 2", "order": "post"}
```

返回 [§8 深度优先遍历](#8-深度优先前序中序与后序)。

### 15.2 练习：满还是完全？（幻灯片 16–17）

**(a)** 根有两个子节点；左子节点有两个子节点（叶子）；右子节点只有一个子节点，且是左子节点。这棵树是 A：满，B：完全，C：既满又完全，D：既不满也不完全？

**(b)** 根只有一个子节点，且是**右**子节点。选项同上。

> ✍️ **先自己试一试。**

**解答**

**(a) B：完全。** 第 0 层和第 1 层都是满的，最后一层（三个叶子）从左侧连续排列。不满：根的右子节点恰好只有一个子节点。

**(b) D：既不满也不完全。** 根恰好只有一个子节点（不满），且最后一层唯一的节点位于右侧，左侧留有空洞（不完全）。如果根唯一的子节点位于**左侧**，那么这棵树就是完全的。

返回 [§4 满与完全](#4-满二叉树与完全二叉树)。

## 16. 速查与必记的 5 个要点

| 操作 | 代价 | 原因 |
|---|---|---|
| 前序/中序/后序/层序遍历 | O(n) | 每个节点访问一次 |
| 含 n 个节点的二叉树高度 | 在 ⌈log₂(n+1)⌉ − 1 与 n − 1 之间 | 完全树与棍子 |
| 第 k 层的最大节点数 / 高度为 h 的树的最大节点数 | 2^k / 2^(h+1) − 1 | 每层翻倍 |
| 堆：查找最大值 | O(1) | 它是 `pq[1]` |
| 堆：swim、sink | O(log n) | 完全树中的一条根到叶子路径 |
| 堆：insert | O(log n)，≤ log n + 1 次比较 | 追加 + swim |

| 堆的下标计算（从 1 开始） | |
|---|---|
| k 的父节点 | ⌊k/2⌋ |
| k 的子节点 | 2k, 2k + 1 |
| 根 / 不使用的位置 | 1 / 0 |

**必记的 5 个要点**

1. 深度从根向下数边（根 = 0）；高度从最深的叶子向上数边（叶子 = 0）；树的高度 = 根的高度。
2. 满 = 每个节点有 0 或 2 个子节点；完全 = 除最后一层外所有层都满，且最后一层从左侧填充——二者相互独立。
3. 前序 = 根最先，中序 = 根在中间，后序 = 根最后；二叉搜索树的中序遍历有序，层序遍历使用队列。
4. 二叉堆是存放在数组中（从下标 1 开始）的完全、堆有序的树：父节点 k/2，子节点 2k 和 2k+1。
5. 上浮：只要比父节点大就与父节点交换（insert 使用）；下沉：只要比较大的子节点小，就与**较大**的子节点交换——两者都是 O(log n)。
