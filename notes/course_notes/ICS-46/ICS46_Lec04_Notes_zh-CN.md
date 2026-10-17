# Information and Computer Science 46 — Lecture 4：链表与栈

## 目录

- [1. 链表：基本思想](#1-链表基本思想)
- [2. 单向链表：实现](#2-单向链表实现)
- [3. 单向链表：分析](#3-单向链表分析)
- [4. 双向链表](#4-双向链表)
- [5. ArrayList 与链表对比](#5-arraylist-与链表对比)
- [6. 栈](#6-栈)
- [7. 完整实现](#7-完整实现)
- [8. 课堂活动（附解答）](#8-课堂活动附解答)
- [9. 速查与必记的 5 个要点](#9-速查与必记的-5-个要点)

> UCI ICS 46，Prof. Tom Yeh，Fall 2026，10/08/26。依据 Lecture 4 幻灯片（第 1–49 页）整理；补充材料：algs4 §1.3、Thornton 的 ICS 46 讲义。按概念组织，而非按来源顺序。
> 幻灯片 50–51（基于链表的栈、"How do we choose?"）在 Lecture 5 开头重复出现，因此放在 Lecture 5 的笔记里。

> 📅 **课程安排**（幻灯片 2–3）：
> Lab 2（包含实现下文的 SLL）截止 **Mon 10/19/26**；HW 2 截止 **Fri 10/16/26**。
> 周五 discussion 的 Learning Activity A + 下周五的 Activity B = Quiz 1。同意书（Consent form）：1% 额外加分（不同意的话有替代的反思题）。
> 安装 MetaCog Chrome 扩展（bit.ly/MetaCogExt → 解压 → `chrome://extensions` → 开发者模式 → "Load unpacked" → `dist` 文件夹 → 点击其 reload 按钮 → 保存你的 5 位学号）。
> 从下周起，课堂活动（lecture activities）计入成绩。

---

## 1. 链表：基本思想

今天的目标（幻灯片 4）：先讲链表，再讲栈。

### 1.1 用指针连接的节点（幻灯片 5–7）

ArrayList 把元素存放在一块连续的内存中。**链表（linked list）**仍然是动态线性结构，但每个元素都存放在堆上各自独立的**节点（node）**里，顺序则由节点之间的**指针（pointer）**记录——节点可以位于内存中的任何位置。幻灯片 6 在 0–7 号内存单元上演示了这一点：列表 "CS ? !" 从 3 号单元开始（即**头（head）**），3 号单元链接到 1 号，1 号链接到 6 号；其余单元不属于该列表。

幻灯片 7 的递归定义：单向链表**要么是空的（`nullptr`），要么是一个节点，其中包含一个元素和一个指向单向链表的指针**。`Node<T>` 存放一个 `T` 类型的元素和指向下一个节点的链接。最后一个节点的 `next` 是 `nullptr`（即幻灯片方框里的那条斜线）。

```viz linked-list
{"title": "幻灯片 6 的列表：要到达最后一个节点就得一路走过去", "items": "CS, ?, !", "ops": "get(2)", "start": 1}
```

> 📘 **课外补充**（algs4 §1.3）：递归定义直接给出了标准的遍历循环 `for (Node* x = head; x != nullptr; x = x->next)`，打印、析构函数和拷贝都会用到它。

### 1.2 API 与一个完整的操作序列（幻灯片 8–15）

幻灯片 8 中 `SinglyLinkedList<T>` 的 API：`SinglyLinkedList()`、`bool isEmpty() const`、`size_t size() const`、`T get(size_t index) const`、`void add(const T& item)`（**加在头部**）、`void add(size_t index, const T& item)`、`T remove()`（**移除头部**）、`T remove(size_t index)`。注意：不带索引的 `add`/`remove` 作用在**头部**，与 Lecture 3 的 ArrayList 正好相反。

幻灯片 9–15 逐步演示（索引从头部开始，从 0 计数）：

| 幻灯片 | 调用 | 之后的列表 | `n` |
|---|---|---|---|
| 9 | `SinglyLinkedList<std::string> sll;` | 空 | 0 |
| 10–12 | `add("ICS 46")`、`add("ROCKS")`、`add("!")` | ! → ROCKS → ICS 46 | 3 |
| 13 | `add(1, "?")` | ! → ? → ROCKS → ICS 46 | 4 |
| 14 | `remove()` 返回 "!" | ? → ROCKS → ICS 46 | 3 |
| 15 | `remove(1)` 返回 "ROCKS" | ? → ICS 46 | 2 |

在下方逐步查看（演示获得焦点时可用 ← / → 键）：

```viz linked-list
{"title": "幻灯片 9–15", "ops": "add(ICS 46); add(ROCKS); add(!); add(1, ?); remove(); remove(1)", "interactive": true}
```

头部插入意味着元素**以插入的相反顺序**取出——这就是 LIFO，即第 6 节的栈行为。

---

## 2. 单向链表：实现

### 2.1 类：嵌套的 `Node`、`head`、`n`（幻灯片 16–18）

幻灯片 16 的计划：自己实现链表（Lab 2 的一部分），它是一个**模板（template）**，包含**嵌套类 `Node`**，并维护**元素个数**。幻灯片 17：

```cpp
template <typename T>
class SinglyLinkedList {
private:
    /**
     * Defines the nodes of the singly linked list. Each node holds
     * a value and a pointer to the next node.
     */
    class Node {
    public:
        T item;
        Node* next;
        Node(const T& it, Node* nx = nullptr) : item(it), next(nx) {}
    };

    Node* head;         // Pointer to the first node
    std::size_t n;      // Number of elements in the list

public:
    SinglyLinkedList() : head(nullptr), n(0) {}
    ~SinglyLinkedList();

    // Rule of Five: also define copy ctor, copy assign,
    // move ctor, move assign  (see Lab 2 spec)

    // isEmpty, size, get, add, remove ...
};
```

存储 `n` 使 `size()` 为 O(1)，代价是每个修改操作（mutator）都必须更新它。`Node` **没有默认构造函数**——这与下面两处幻灯片中的 bug 有关。幻灯片 18：

```cpp
bool isEmpty() const {
    return head == nullptr; // return size() == 0;
}

size_t size() const {
    return n;
}
```

只要不变式 **`head == nullptr` 当且仅当 `n == 0`** 成立，两种 `isEmpty` 写法就等价。析构函数（在幻灯片 17 中声明）通过不断移除头节点来释放所有节点，直到列表为空；拷贝/移动操作是 Lab 2 的任务——编译器默认生成的拷贝会让两个列表共享同一条链，从而导致重复释放（double free）。

### 2.2 `rangeCheck`（幻灯片 19）

```cpp
void rangeCheck(size_t index) const {
    if (index > n || index < 0)
        throw std::out_of_range("Index " + std::to_string(index) + " out of bounds");
}
```

> ⚠️ **易错点**（幻灯片 19）：对 `size_t` 来说 `index < 0` 永远为假，而且 `index > n` 会放过 `index == n`，于是 `get(n)` 会解引用 `nullptr` → `get`/`remove` 应使用 `if (index >= n)`；`add(index, item)` 允许 `index == n`（即追加），并自行检查 `index > n`。

示例（已编译运行）：在 2 个元素的列表上，`get(2)` 输出 `get(2): Index 2 out of bounds`。

### 2.3 `get(index)`：用"手指"逐个走（幻灯片 20–22）

唯一能直接到达的节点是头节点，所以放一个临时指针——**finger（手指）**——指向它，然后向前移动 `index` 次（幻灯片 22）：

```cpp
T get(size_t index) {
    // Check whether index is valid
    rangeCheck(index);

    // Start from head of list
    Node* finger = head;

    // Move forward 'index' times
    while (index > 0) {
        finger = finger->next;
        index--;
    }

    // return the item in the node at position 'index'
    return finger->item;
}
```

示例：在 ! → ? → ROCKS → ICS46 上执行 `get(2)`，finger 依次经过 "!" → "?" → "ROCKS"，返回 "ROCKS"。最多走 `n - 1` 步，所以是 **O(n)**。

> ⚠️ **易错点**（幻灯片 22、38）：`get` 缺少 `const`（幻灯片 8 写的是 `T get(size_t index) const`）→ 加上它，否则无法在 `const` 列表上调用 `get`。

### 2.4 `add(item)`：在头部插入（幻灯片 23–25）

让新节点指向当前的第一个节点，再让 `head` 指向新节点（幻灯片 25）：

```cpp
void add(const T& item) {
    Node* oldHead = head;                 // remember the current first node
    Node* newNode = new Node(item);       // allocate node (next defaults to nullptr)
    newNode->next = oldHead;              // link new node to the old head
    head = newNode;                       // new node becomes the head
    ++n;                                  // increase number of nodes
}
```

示例：在 ! → ? → ROCKS → ICS46 上执行 `add("UCI")`，得到 `[UCI, !, ?, ROCKS, ICS46] n=5`。没有循环 → **O(1)**，并且对空列表同样适用（`oldHead` 为 `nullptr`）。

> ⚠️ **易错点**：先连接，再移动 `head`。如果先写 `head = newNode;`，就会丢失指向旧列表的唯一指针。`head = new Node(item, head);` 一行就能完成这两步。

### 2.5 `add(index, item)`：在指定索引处插入（幻灯片 26–30）

要在 ! → ? → ROCKS → ICS46 的索引 2 处插入 "UCI"，需要修改的指针是 **"?" 的 `next`**——即插入位置*之前*的那个节点。所以要用两个指针一起走：`finger` 停在当前位于 `index` 的节点上，`previous` 始终落后一步。幻灯片 27–29 演示 `add(2, …)` 的移动过程：(`previous`, `finger`) 依次为 (nullptr, "!") → ("!", "?") → ("?", "ROCKS")，然后停止。幻灯片 30：

```cpp
void add(int index, const T& item) {
        // check that index is within range
    rangeCheck(index);
        // if index is 0, then call one-argument add
    if (index == 0) {
        add(item);
        // else
    } else {
        // make two pointers, previous and finger. Point previous to null and finger to head
        Node* previous = nullptr;
        Node* finger = head;
        // search for index-th position by pointing previous to finger and advancing finger
        while (index > 0 && finger != nullptr) {
            previous = finger;
            finger = finger->next;
            index--;
        }
        // create new node to insert in correct position. Set its pointers and contents
        Node* current = new Node();
        current->next = finger;
        current->item = item;
        // make previous point to newly created node.
        previous->next = current;
        // increase number of nodes
        n++;
    }
}
```

> ⚠️ **易错点**（幻灯片 30）：`new Node()` 无法编译（`Node` 没有默认构造函数）→ `Node* current = new Node(item, finger);`。另外 `int index` 应改为 `size_t`，范围检查必须允许 `index == n`。

索引 0 是特殊情况，因为此时 `previous` 仍是 `nullptr`，而且在最前面插入改变的是 `head`，而不是某个节点的 `next`。下面用修正后的那一行，展示走完之后的两步图示：

在 ! → ? → ROCKS → ICS46 上执行 `add(2, "UCI")`，从遍历到拼接的全过程。在下方逐步查看（演示获得焦点时可用 ← / → 键）：

```viz linked-list
{"title": "add(2, \"UCI\")（幻灯片 26–30）", "items": "!, ?, ROCKS, ICS46", "ops": "add(2, UCI)"}
```

示例（已编译运行）：`add(2, "UCI")` → `[!, ?, UCI, ROCKS, ICS46] n=5`；在 4 个元素的列表上 `add(4, "end")` 即追加 → `[!, ?, ROCKS, ICS46, end] n=5`。最多走 `n` 步 → **O(n)**。

### 2.6 `remove()`：移除头节点（幻灯片 31–32）

把 `head` 向右移动一个节点，再删除原来的第一个节点（幻灯片 32）：

```cpp
T remove() {
    // Make a temporary pointer to head
    Node* temp = head;
    // Move head one to the right
    head = head->next;
    // Decrease number of nodes
    n--;

    // Delete old head node
    T data = temp->data;
    delete temp;
    return data;
}
```

> ⚠️ **易错点**（幻灯片 32、40、41）：`temp->data` / `finger->data`——字段名叫 `item` → `T data = temp->item;`。

先把元素拷贝出来，**然后** `delete`，最后返回拷贝——`delete` 之后 `temp` 就成了悬空指针。示例：在 ! → ? → ROCKS → ICS 46 上执行 `remove()` 返回 "!"。**O(1)**。（对空列表它会解引用 `nullptr`；完整实现会先抛出异常。）

### 2.7 `remove(index)`：移除指定索引处的元素（幻灯片 33–34、41）

走法与 `add(index, item)` 相同；等 `finger` 到达要删除的节点后，让 `previous` 跳过它。幻灯片 34 把 `else` 分支留作活动 1；幻灯片 41 给出了完成后的方法（代码：[活动 1 解答](#81-活动-1实现按索引删除幻灯片-34)，其中用 `item` 代替幻灯片里的 `finger->data`）：


在 ! → ? → ROCKS → ICS46 上执行 `remove(2)`：遍历、绕过、删除。在下方逐步查看（演示获得焦点时可用 ← / → 键）：

```viz linked-list
{"title": "remove(2)（活动 1）", "items": "!, ?, ROCKS, ICS46", "ops": "remove(2)"}
```

示例（已编译运行）：在 ! → ? → UCI → ROCKS → ICS46 上执行 `remove(2)` 返回 "UCI"。遍历 → **O(n)**。

> 📝 **练习**：[活动 1](#81-活动-1实现按索引删除幻灯片-34)。

---

## 3. 单向链表：分析

### 3.1 各操作的代价（幻灯片 35–41）

幻灯片 35–41 要求分析每个操作的最坏情况。问题始终是：*在做常数时间的指针操作之前，必须先走过多少个节点？*

| 操作 | 最坏情况 | 原因 |
|---|---|---|
| 在头部 `add(item)`（幻灯片 35–36） | **O(1)** | 没有循环 |
| `get(index)`（幻灯片 38） | **O(n)** | 最多走 `n - 1` 步 |
| `add(index, item)`（幻灯片 39） | **O(n)** | 先遍历，再 O(1) 拼接 |
| 在头部 `remove()`（幻灯片 40） | **O(1)** | 移动 `head`，删除一个节点 |
| `remove(index)`（幻灯片 41） | **O(n)** | 先遍历，再 O(1) 绕过 |
| 在尾部 add / remove（只有 head） | **O(n)** | 要走到末尾（删除时需要倒数第二个节点） |

幻灯片 35–36 分析的是一个较早版本的 `add`，它给 `first = new Node();` 赋值，并设置 `first->item` 和 `first->next = oldHead`。

> ⚠️ **易错点**（幻灯片 35–36）：遗留的 `first`（没有这个成员，`head` 也从未更新）和 `new Node()` → 请使用幻灯片 25 的版本；答案仍是 O(1)。
> ⚠️ **易错点**（幻灯片 38）：`public T get(int index)` 是 Java 的遗留写法 → 在 C++ 中，访问权限来自 `public:` 标签。

> 📘 **课外补充**（Thornton，Linked List Variations）：`get(i)` 实际上是 **Θ(i)**——任何列表上 `get(0)` 都很快。"O(n)" 是对所有 `i` 取的最坏情况。

> 📝 **练习**：[活动 2](#82-活动-2单向链表操作的时间复杂度幻灯片-37)。

### 3.2 加一个尾指针有帮助吗？

增加一个指向最后一个节点的 `Node* tail` 成员：

- **在尾部添加 → O(1)**：`tail->next = newNode; tail = newNode;`（空列表时还要设置 `head`）。
- **从尾部删除 → 仍是 O(n)**：需要*倒数第二个*节点，才能把它的 `next` 设为 `nullptr`，而 SLL 无法从 `tail` 往回走。

> 💡 **关键洞察**：在 SLL 中，指向某个节点的指针只能改变它**之后**的内容，永远无法改变它**之前**的内容。

---

## 4. 双向链表

### 4.1 带 `prev` 的节点，以及 head 和 tail（幻灯片 42–44）

**双向链表（doubly linked list，DLL）**给每个节点增加第二个指针，指向它前面的节点（幻灯片 42）：

```cpp
class Node {
    T item;
    Node* next;
    Node* prev;
};
```

幻灯片 43 中的操作以所作用的一端命名：`DoublyLinkedList()`、`isEmpty()`、`size()`、`get(int index)`、`addFirst(Item item)`、`addLast(Item item)`、`add(int index, Item item)`、`Item removeFirst()`、`Item removeLast()`、`Item remove(int index)`（`Item`/`int` 是幻灯片的命名；在我们的 C++ 里是 `T`/`size_t`）。列表同时维护一个 **head**（Head/Beginning/Front/First）和一个 **tail**（Tail/End/Back/Last）。

幻灯片 44 画了五个小图，图之间没有箭头；按顺序读，就是列表先增长、再缩小：

| 图 | 节点 | head | tail |
|---|---|---|---|
| 1 | ICS 46（`prev` 和 `next` 都为空） | ICS 46 | ICS 46（同一个节点） |
| 2 | ROCKS ⇄ ICS 46 | ROCKS | ICS 46 |
| 3 | ROCKS ⇄ ICS 46 ⇄ ! | ROCKS | ! |
| 4 | ROCKS ⇄ ICS 46 | ROCKS | ICS 46 |
| 5 | ICS 46 | ICS 46 | ICS 46 |

下面这个操作序列可以依次产生幻灯片 44 的五个状态。在下方逐步查看（演示获得焦点时可用 ← / → 键）：

```viz doubly-linked-list
{"title": "幻灯片 44 的各个状态", "ops": "addLast(ICS 46); addFirst(ROCKS); addLast(!); removeLast(); removeFirst()", "interactive": true}
```

只有一个节点的状态是边界情况：`head == tail`，所以向空列表添加或移除最后一个节点时，必须**同时**更新两者。

### 4.2 两端都是 O(1)（我自己补全的实现）

幻灯片只给出了 API 和图示，没有 DLL 的代码；这是我自己的补全（已编译；`addLast`/`addFirst`/`removeFirst` 在第 7 节）：

```cpp
T removeLast() {                               // O(1) thanks to prev
    if (isEmpty()) throw std::out_of_range("removeLast() on empty list");
    Node* old = tail;
    tail = tail->prev;                          // second-to-last, one step away
    if (tail != nullptr) tail->next = nullptr; else head = nullptr;
    T data = old->item;
    delete old;
    --n;
    return data;
}
```

在中间插入会修改**四个**链接（新节点的 `prev` 和 `next`、`before->next`、`after->prev`）；删除中间节点 `x` 则是 `x->prev->next = x->next; x->next->prev = x->prev;`。示例（已编译运行）：`addLast("ICS 46"); addFirst("ROCKS"); addLast("!")` → `[ROCKS, ICS 46, !] backwards [!, ICS 46, ROCKS]`；然后 `removeLast()` 返回 "!"。

> 📘 **课外补充**（Thornton，Linked List Variations）：DLL 可以从离目标更近的一端开始走，需要 Θ(min(i, n − i)) ≤ n/2 步——更快，但**仍然是 O(n)**。

### 4.3 DLL 分析（幻灯片 45）

| 操作（head + tail） | 最坏情况 |
|---|---|
| 在头部 / 在尾部插入 | **O(1)** / **O(1)** |
| `get(index)`、`add(index, item)`、`remove(index)` | **O(n)**（遍历） |
| 从头部 / 从尾部删除 | **O(1)** / **O(1)**（`tail->prev`） |

> 📝 **练习**：[活动 3](#83-活动-3双向链表的时间复杂度分析幻灯片-45)。

---

## 5. ArrayList 与链表对比

除非另有标注，均为最坏情况；ArrayList 一列来自 [Lecture 3](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec03_Notes_zh-CN.md)。

| 操作 | ArrayList | SLL | SLL + tail | DLL (head + tail) |
|---|---|---|---|---|
| 按索引 get | **O(1)** | O(n) | O(n) | O(n) |
| 在头部添加 | O(n) 移位 | **O(1)** | **O(1)** | **O(1)** |
| 在尾部添加 | **O(1) 摊还** | O(n) | **O(1)** | **O(1)** |
| 删除头部 | O(n) 移位 | **O(1)** | **O(1)** | **O(1)** |
| 删除尾部 | **O(1) 摊还** | O(n) | O(n) | **O(1)** |
| 在索引处添加 / 删除 | O(n) 移位 | O(n) 遍历 | O(n) 遍历 | O(n) 遍历 |

在 ArrayList 中，O(n) 来自**移位（shifting）**；在链表中，则来自**遍历（walking）**——拼接本身是 O(1)。此外每个节点还要为指针付出额外内存（在这个 g++ 版本上实测：SLL 的 `Node<int>` 是 16 字节，DLL 的 `Node<int>` 是 24 字节，而 ArrayList 每个槽位只要 4 字节）。

> 💡 **关键洞察**（Thornton）：链接越多，操作越快，但代价是更多内存和更多边界情况——选择能满足所需操作速度的最简单的变体。

---

## 6. 栈

### 6.1 栈 ADT（幻灯片 46–47）

**栈（stack）**是一种动态线性结构，元素按 **LIFO（Last In, First Out，后进先出）**插入和移除：只操作一端，即**栈顶（top）**。煎饼的比喻（幻灯片 47）：加一张 = 在顶部 **push**；拿走一张 = **pop** 顶部；只看顶部而不拿走 = **peek**。目标：让 push 和 pop 尽可能高效。（幻灯片 47 的图：一摞彩色圆盘，顶部有 push/pop 箭头。）

### 6.2 追踪 push 和 pop（幻灯片 48）

输入 `To be or not to - be - - that - - - is`——单词表示 push，`-` 表示 pop：

| 之后 | 弹出 | 栈（栈底 → 栈顶） |
|---|---|---|
| To be or not to | | To be or not to |
| `-` | to | To be or not |
| be, `-`, `-` | be, not | To be or |
| that, `-`, `-`, `-` | that, or, be | To |
| is | | To is |

编译运行的输出：

```text
popped: to be not that or be
left on stack (top first): is To
```

在下方逐步查看（演示获得焦点时可用 ← / → 键）：

```viz stack
{"title": "幻灯片 48：To be or not to - be - - that - - - is", "ops": "To be or not to - be - - that - - - is", "interactive": true}
```

### 6.3 基于 ArrayList 的栈（幻灯片 49）

幻灯片 49 在槽位 0–2 画出了 "ICS46 ROCKS !"，索引 0 是 **Front**，最后一个元素是 **End/Rear**。把**栈顶放在末尾**：push = `add(item)`，pop = `remove()`，peek = `at(size() - 1)`——其他元素都不用动。

```cpp
template <typename T>
class ArrayStack {
private:
    ArrayList<T> list;
public:
    bool isEmpty() const { return list.isEmpty(); }
    std::size_t size() const { return list.size(); }
    void push(const T& item) { list.add(item); }              // append at the end
    T pop() { return list.remove(); }                          // remove from the end
    const T& peek() const { return list.at(list.size() - 1); } // read the last item
};
```

示例（已编译运行，统计 n 次 push 的元素拷贝 + 移位次数）：

```text
n=1000  top-at-back moves=2022 (2.022 per push)  top-at-front moves=501522 (501.522 per push)
n=8000  top-at-back moves=16190 (2.02375 per push)  top-at-front moves=32012190 (4001.52 per push)
```

栈顶在后端时，每次 push 稳定在约 2 次移动（摊还 O(1)）；栈顶在前端时，每次 push 约需 n/2 次移动（O(n)）。

> 📘 **课外补充**（Thornton，Amortized Analysis）：摊还 O(1) 是对任意操作序列**总代价**的上界（n 次 push ≤ 3n 的工作量），而不是每次调用的上界——某次让数组翻倍的 push 就是 O(n)。peek 的 O(1) 则是真正的最坏情况。

> 📝 **练习**：[活动 4](#84-活动-4实现栈幻灯片-49)。

---

## 7. 完整实现

SLL（幻灯片 17–41，已修正 bug）和 DLL（我对幻灯片 42–45 的补全）。使用 `g++ -std=c++17 -Wall -Wextra -fsanitize=address,undefined` 编译：无警告，无 sanitizer 报告。

```cpp
#include <cstddef>
#include <iostream>
#include <stdexcept>
#include <string>

// Singly linked list (slides 17-41, slide bugs fixed)
template <typename T>
class SinglyLinkedList {
private:
    class Node {
    public:
        T item;
        Node* next;
        Node(const T& it, Node* nx = nullptr) : item(it), next(nx) {}
    };
    Node* head;      // first node
    std::size_t n;   // number of items

    void rangeCheck(std::size_t index) const {   // 0 <= index < n
        if (index >= n)
            throw std::out_of_range("Index " + std::to_string(index) + " out of bounds");
    }

public:
    SinglyLinkedList() : head(nullptr), n(0) {}
    ~SinglyLinkedList() { while (head != nullptr) remove(); }
    SinglyLinkedList(const SinglyLinkedList&) = delete;            // Rule of Five: Lab 2
    SinglyLinkedList& operator=(const SinglyLinkedList&) = delete;

    bool isEmpty() const { return head == nullptr; }
    std::size_t size() const { return n; }

    T get(std::size_t index) const {
        rangeCheck(index);
        Node* finger = head;
        while (index > 0) { finger = finger->next; index--; }
        return finger->item;
    }
    void add(const T& item) {                          // at head
        head = new Node(item, head);
        ++n;
    }
    void add(std::size_t index, const T& item) {       // 0 <= index <= n
        if (index > n)
            throw std::out_of_range("Index " + std::to_string(index) + " out of bounds");
        if (index == 0) { add(item); return; }
        Node* previous = nullptr;
        Node* finger = head;
        while (index > 0) { previous = finger; finger = finger->next; index--; }
        previous->next = new Node(item, finger);
        n++;
    }
    T remove() {                                       // at head
        if (head == nullptr) throw std::out_of_range("remove() on empty list");
        Node* temp = head;
        head = head->next;
        n--;
        T data = temp->item;
        delete temp;
        return data;
    }
    T remove(std::size_t index) {                      // Activity 1
        rangeCheck(index);
        if (index == 0) return remove();
        Node* previous = nullptr;
        Node* finger = head;
        while (index > 0) { previous = finger; finger = finger->next; index--; }
        previous->next = finger->next;
        n--;
        T data = finger->item;
        delete finger;
        return data;
    }
    void print() const {
        std::cout << "[";
        for (Node* p = head; p != nullptr; p = p->next) std::cout << p->item << (p->next ? ", " : "");
        std::cout << "] n=" << n << '\n';
    }
};

// Doubly linked list with head and tail (my completion of slides 42-45)
template <typename T>
class DoublyLinkedList {
private:
    class Node {
    public:
        T item;
        Node* next;
        Node* prev;
        Node(const T& it, Node* pv = nullptr, Node* nx = nullptr) : item(it), next(nx), prev(pv) {}
    };
    Node* head;
    Node* tail;
    std::size_t n;

    Node* nodeAt(std::size_t index) const {        // walk from the nearer end
        if (index < n / 2) {
            Node* p = head;
            for (std::size_t i = 0; i < index; ++i) p = p->next;
            return p;
        }
        Node* p = tail;
        for (std::size_t i = n - 1; i > index; --i) p = p->prev;
        return p;
    }

public:
    DoublyLinkedList() : head(nullptr), tail(nullptr), n(0) {}
    ~DoublyLinkedList() { while (!isEmpty()) removeFirst(); }
    DoublyLinkedList(const DoublyLinkedList&) = delete;
    DoublyLinkedList& operator=(const DoublyLinkedList&) = delete;

    bool isEmpty() const { return n == 0; }
    std::size_t size() const { return n; }

    void addFirst(const T& item) {
        Node* node = new Node(item, nullptr, head);
        if (head != nullptr) head->prev = node; else tail = node;
        head = node;
        ++n;
    }
    void addLast(const T& item) {
        Node* node = new Node(item, tail, nullptr);
        if (tail != nullptr) tail->next = node; else head = node;
        tail = node;
        ++n;
    }
    T removeFirst() {
        if (isEmpty()) throw std::out_of_range("removeFirst() on empty list");
        Node* old = head;
        head = head->next;
        if (head != nullptr) head->prev = nullptr; else tail = nullptr;
        T data = old->item;
        delete old;
        --n;
        return data;
    }
    T removeLast() {
        if (isEmpty()) throw std::out_of_range("removeLast() on empty list");
        Node* old = tail;
        tail = tail->prev;
        if (tail != nullptr) tail->next = nullptr; else head = nullptr;
        T data = old->item;
        delete old;
        --n;
        return data;
    }
    T get(std::size_t index) const {
        if (index >= n) throw std::out_of_range("bad index");
        return nodeAt(index)->item;
    }
    void add(std::size_t index, const T& item) {
        if (index > n) throw std::out_of_range("bad index");
        if (index == 0) { addFirst(item); return; }
        if (index == n) { addLast(item); return; }
        Node* after = nodeAt(index);
        Node* before = after->prev;
        Node* node = new Node(item, before, after);
        before->next = node;
        after->prev = node;
        ++n;
    }
    T remove(std::size_t index) {
        if (index >= n) throw std::out_of_range("bad index");
        if (index == 0) return removeFirst();
        if (index == n - 1) return removeLast();
        Node* victim = nodeAt(index);
        victim->prev->next = victim->next;
        victim->next->prev = victim->prev;
        T data = victim->item;
        delete victim;
        --n;
        return data;
    }
    void print() const {
        std::cout << "[";
        for (Node* p = head; p != nullptr; p = p->next) std::cout << p->item << (p->next ? ", " : "");
        std::cout << "] backwards [";
        for (Node* p = tail; p != nullptr; p = p->prev) std::cout << p->item << (p->prev ? ", " : "");
        std::cout << "] n=" << n << '\n';
    }
};

int main() {
    SinglyLinkedList<std::string> sll;                 // slides 9-15
    sll.add("ICS 46"); sll.add("ROCKS"); sll.add("!");
    sll.add(1, "?");                 sll.print();
    std::cout << "remove() -> " << sll.remove() << '\n';
    std::cout << "remove(1) -> " << sll.remove(1) << '\n';
    sll.print();
    try { sll.get(2); } catch (const std::out_of_range& e) { std::cout << "get(2): " << e.what() << '\n'; }

    DoublyLinkedList<std::string> dll;                 // slide 44
    dll.addLast("ICS 46"); dll.addFirst("ROCKS"); dll.addLast("!");
    dll.print();
    std::cout << "removeLast() -> " << dll.removeLast() << '\n';
    dll.add(1, "UCI");               dll.print();
    std::cout << "get(1) -> " << dll.get(1) << ", remove(1) -> " << dll.remove(1) << '\n';
    dll.print();
}
```

输出：

```text
[!, ?, ROCKS, ICS 46] n=4
remove() -> !
remove(1) -> ROCKS
[?, ICS 46] n=2
get(2): Index 2 out of bounds
[ROCKS, ICS 46, !] backwards [!, ICS 46, ROCKS] n=3
removeLast() -> !
[ROCKS, UCI, ICS 46] backwards [ICS 46, UCI, ROCKS] n=3
get(1) -> UCI, remove(1) -> UCI
[ROCKS, ICS 46] backwards [ICS 46, ROCKS] n=2
```

---

## 8. 课堂活动（附解答）

### 8.1 活动 1：实现按索引删除（幻灯片 34）

补全 `else` 分支（幻灯片上显示 ! ? ROCKS ICS46，下面标着 `previous` 和 `finger`）：

```cpp
//Retrieves and removes the item at the specified index.
T remove(int index) {
        // check that index is within range
    rangeCheck(index);
        // if index is 0, then call remove
    if (index == 0) {
        return remove();
        // else
    } else {
        // TODO
    }
}
```

**解答：**

```cpp
        Node* previous = nullptr;
        Node* finger = head;
        while (index > 0) { previous = finger; finger = finger->next; index--; }
        previous->next = finger->next;    // bypass the node
        n--;
        T data = finger->item;            // copy out BEFORE delete
        delete finger;
        return data;
```

只有要删除节点*之前*那个节点的 `next` 会改变，所以需要 `previous`；索引 0 单独处理，因为此时要改的指针是 `head`。

### 8.2 活动 2：单向链表操作的时间复杂度（幻灯片 37）

填写最坏情况：`add(E item)`——在头部插入 O(1)，在尾部插入 O( )；`get(int index)`——O( )；`add(int index, T item)`——O( )；`remove()`——从头部 O( )，从尾部 O( )；`remove(int index)`——O( )。

**解答：**在尾部 add 为 **O(n)**（有尾指针时为 O(1)）；`get` 为 **O(n)**；`add(index)` 为 **O(n)**；从头部 remove 为 **O(1)**，从尾部为 **O(n)**（即使有尾指针——也无法回到倒数第二个节点）；`remove(index)` 为 **O(n)**。

### 8.3 活动 3：双向链表的时间复杂度分析（幻灯片 45）

对双向链表填同样的表。

**解答：**在头部插入 **O(1)**，在尾部插入 **O(1)**；`get` 为 **O(n)**；`add(index)` 为 **O(n)**；从头部删除 **O(1)**，从尾部删除 **O(1)**；`remove(index)` 为 **O(n)**。只有与尾部相关的行发生变化：`tail->prev` 一步就能到达倒数第二个节点。

### 8.4 活动 4：实现栈（幻灯片 49）

用 **ArrayList**（操作 `add(Item item)`、`add(int index, Item item)`、`remove()`）实现一个栈。(a) 栈顶应该放在哪一端（前端还是后端）？(b) 如何实现 Pop、Push 和 Peek？(c) Pop 和 Push 的**摊还（amortized）**大 O 是多少？(d) Peek 的**最坏情况**大 O 是多少？(e) 如果栈顶放在相反的方向，**最坏情况**大 O 是多少？

**解答：**
(a) **后端**（End/Rear）——在那里添加/删除不需要移动任何元素。
(b) push = `add(item)`，pop = `remove()`，peek = `at(size() - 1)`。
(c) 两者都是 **O(1) 摊还**（数组翻倍或在 ¼ 满时缩小，偶尔会是 O(n)）。
(d) **O(1)**。
(e) 栈顶在前端：push = `add(0, item)`、pop = `remove(0)` 要移动所有元素 → **O(n)**；peek = `at(0)` 仍是 O(1)。

---

## 9. 速查与必记的 5 个要点

| 操作 | ArrayList | SLL | SLL + tail | DLL | 基于 ArrayList 的栈（栈顶在末尾） |
|---|---|---|---|---|---|
| 按索引访问 | O(1) | O(n) | O(n) | O(n) | — |
| 在头部 add / remove | O(n) | O(1) | O(1) | O(1) | — |
| 在尾部 add | O(1) 摊还 | O(n) | O(1) | O(1) | push：O(1) 摊还 |
| 在尾部 remove | O(1) 摊还 | O(n) | O(n) | O(1) | pop：O(1) 摊还 |
| 在索引处 add / remove | O(n) | O(n) | O(n) | O(n) | — |
| peek | — | — | — | — | O(1) |

**必记的 5 个要点：**

1. 链表中每个按索引的操作都是 O(n)，原因在于**遍历**；拼接本身是 O(1)。
2. 在 SLL 内部插入/删除需要**前一个**节点；索引 0 是特例，因为它改变的是 `head`。
3. 即使有尾指针，删除 SLL 的尾节点也是 O(n)；DLL 的 `prev` 让它变成 O(1)。
4. 先把元素拷贝出来，**再** `delete`；每个修改操作都要更新 `n`；并处理好空列表 / 单节点的情况。
5. 基于 ArrayList 的栈：栈顶放在**末尾** → push/pop 为 O(1) 摊还，peek 为 O(1)；栈顶放在前端 → O(n)。

> ➡️ **续见 [Lecture 5](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec05_Notes_zh-CN.md)**：基于 SLL/DLL 的栈（活动 5 和 6，幻灯片 50）以及 "How do we choose?"（幻灯片 51）。
