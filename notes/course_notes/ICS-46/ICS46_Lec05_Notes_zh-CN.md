# Information and Computer Science 46 — Lecture 5：队列、双端队列与递归分析

## 目录

- [1. 基于链表的栈](#1-基于链表的栈)
- [2. 队列 ADT](#2-队列-adt)
- [3. 队列的实现](#3-队列的实现)
- [4. 栈的应用：表达式求值](#4-栈的应用表达式求值)
- [5. 队列的应用](#5-队列的应用)
- [6. 完整实现](#6-完整实现)
- [7. 课堂活动（附解答）](#7-课堂活动附解答)
- [8. 速查与必记的 5 个要点](#8-速查与必记的-5-个要点)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/13/26
> 整理自 Lecture 5 幻灯片（p1–19）以及 Lecture 4 幻灯片 51；补充材料：algs4 §1.3、Thornton 的 "Stacks, Queues, and Deques" 与 "Amortized Analysis"。按概念组织，而不是按资料来源组织。
> 今日目标（幻灯片 3）：讲完栈、队列，以及递归分析。递归分析部分（幻灯片 20–28）在 Lecture 6 开头又重讲了一遍，因此放在 [Lecture 6 笔记](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec06_Notes_zh-CN.md)里。栈 ADT 及其 ArrayList 版本见 [Lecture 4 笔记](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec04_Notes_zh-CN.md)。

> 📅 **课程安排**（幻灯片 2，Lec 06 幻灯片 2 有更新）：
> HW 2 截止 **Fri 10/16/26**（Lec 05 幻灯片写的是 "Fri 10/15/26"；10/15 是周四，而 Lec 06 的更新写的是 10/16）
> Learning Activity 2 在本周 **Fri 10/16/26** —— Quiz 1 的后半部分
> Lab 2 截止 **Mon 10/19**
> Quiz 2 **Fri 10/23** —— 算法分析（Algorithm Analysis）、ArrayList、链表（Linked List）

---

## 1. 基于链表的栈

### 1.1 栈顶即链表头

栈（stack，LIFO）只操作栈顶。在只有 `head` 的单向链表（singly linked list，SLL）里（幻灯片 4 的图：head → item1 → … → item5 → null），唯一能在 O(1) 内修改的一端就是头部。所以把**栈顶放在头部**：push 就是 Lecture 4 的“头部插入”（`add(item)`，幻灯片 25），pop 就是“删除头节点”（`remove()`，幻灯片 31）。三个操作都是 **最坏情况 O(1)**。这与 ArrayList 版本的栈相反，后者的栈顶在数组末尾。

```cpp
// inside LinkedStack<T>: Node* head (top), std::size_t n
void push(const T& item) {
    Node* oldHead = head;              // remember the current first node
    Node* newNode = new Node(item);    // next defaults to nullptr
    newNode->next = oldHead;           // link new node to the old head
    head = newNode;                    // new node becomes the head
    ++n;
}

T pop() {
    if (isEmpty()) throw std::underflow_error("pop from empty stack");
    Node* temp = head;
    head = head->next;                 // move head one to the right
    --n;
    T data = temp->item;               // copy the item out BEFORE deleting
    delete temp;
    return data;
}

const T& peek() const { return head->item; }   // (after the same empty check)
```

依次 push ICS46、ROCKS、!，然后全部 pop（完整的类见 [§6](#6-完整实现)）：

```text
peek: !, size 3
pop: ! ROCKS ICS46
error: pop from empty stack
```

> ⚠️ **易错点**：Lecture 4 幻灯片 31 写的是 `T data = temp->data;`，但幻灯片 17 的 `Node` 里成员叫 `item`，不叫 `data` → 应使用 `temp->item`。另外幻灯片没有做空栈检查，`pop()` 需要加上。

### 1.2 DLL 与反向放置

- **带 head 和 tail 的 DLL**：两端都是 O(1)，所以栈顶放在哪一端都行 —— 但每个节点都带着栈用不到的 `prev`。
- **把栈顶放在 SLL 的尾部**（反向）：只有 `head` 时，push/pop/peek 全是 **O(n)**（要走到末尾）。加上 `tail` 指针后 push 和 peek 变成 O(1)，但 **pop 仍然是 O(n)**：删掉最后一个节点后，需要找到倒数第二个节点，而 SLL 只能从头走过去。

> 📝 **练习**：[活动 0](#71-活动-0实现栈幻灯片-4)。

### 1.3 如何选择？（幻灯片 5）

幻灯片 5 是一个现场投票，答案是空白的；填好的版本在 Lecture 4 幻灯片 51：

| 实现方式 | push / pop / peek | 权衡 | 何时胜出 |
|---|---|---|---|
| ArrayList | 平均 O(1)，平均 O(1)，O(1) | 占用内存更少，整体更快，但性能**时快时慢（lumpy）** | 关注整体性能时 |
| 单向链表 | O(1)，O(1)，O(1) —— **最坏情况** | 链接带来额外的时间和空间开销，但**保证**每个操作都很快 | 飞机进场降落；高速接收数据包的网络交换机 |
| 双向链表 | O(1) | 额外的内存开销，性能与 SLL 相同 | — |

🔑 **最佳选择取决于具体问题。**

> 📘 **课外补充**：Thornton 把 ArrayList 的“平均 O(1)”称为**摊还（amortized）**O(1)：对任意一串真实的 push，总开销除以 push 次数是常数，因为一次 O(n) 的扩容可以“摊”给 n 次便宜的 push。但单次 push 仍可能花 O(n) —— 这就是“lumpy”的含义，也是无法承受某一步变慢的系统选择链表的原因。

---

## 2. 队列 ADT

### 2.1 FIFO

**队列（queue）**（幻灯片 7）是用于存放顺序数据的动态线性结构，它先移除**最早**加入的元素：元素严格按到达的顺序离开（FIFO，First In First Out，先进先出）。比喻：排队买票的人群。

- **入队（Enqueue）**：把新元素加到队伍的**末尾**。
- **出队（Dequeue）**：移除队伍**最前面**的元素。
- 目标：让**两个**操作的时间效率都最大化 —— 队列有两个“业务端”，而栈只有一个。

### 2.2 队列操作示例（幻灯片 8）

一个单词表示入队，`-` 表示出队并打印（输入与 Lecture 4 的栈示例相同）。队列从前到后书写：

| 步骤 | 输入 | 打印 | 操作后的队列 |
|---|---|---|---|
| 1–5 | To be or not to | | To be or not to |
| 6 | `-` | **To** | be or not to |
| 7 | be | | be or not to be |
| 8–9 | `-` `-` | **be**, **or** | not to be |
| 10 | that | | not to be that |
| 11–13 | `-` `-` `-` | **not**, **to**, **be** | that |
| 14 | is | | that is |

在下面逐步演示（演示获得焦点时可用 ← / → 键）：

```viz queue
{"title": "幻灯片 8：To be or not to - be - - that - - - is", "ops": "To be or not to - be - - that - - - is", "interactive": true}
```

输出顺序就是输入顺序 `To be or not to be` —— 队列从不改变顺序。[§6](#6-完整实现) 的程序重现了这个过程：`dequeued: To be or not to be`，然后是 `left in queue (2): front = that`。

---

## 3. 队列的实现

幻灯片 9–11 对 ArrayList、SLL 和 DLL 问了同样的四个问题：在哪里入队/出队、怎么实现、最坏情况（或摊还）运行时间，以及方向反过来会怎样。答案汇总在一张表里：

| 结构与布局 | enqueue | dequeue |
|---|---|---|
| ArrayList，队首 = 下标 0，队尾 = 末端 | 摊还 O(1) | **O(n)**（左移） |
| ArrayList 反向，队尾 = 下标 0，队首 = 末端 | **O(n)**（右移） | O(1) |
| 循环数组（📘 课外补充） | 摊还 O(1) | O(1) |
| SLL，只有 head，队首 = head | **O(n)**（走到末尾） | O(1) |
| SLL，只有 head，反向 | O(1) | **O(n)** |
| ✅ SLL，head + tail，队首 = head，队尾 = tail | O(1) | O(1) |
| ❌ SLL，head + tail，反向 | O(1) | **O(n)** |
| DLL，head + tail，任一方向 | O(1) | O(1) |

### 3.1 ArrayList（幻灯片 9）

ArrayList 把第 0 个元素固定放在 0 号格子里，所以队列中位于下标 0 的那一端操作代价是 O(n) —— 其余所有元素都要移动。常用布局：用 `add(item)` 入队，用 `remove(0)` 出队。

```cpp
template <typename T>
class ArrayListQueue {
private:
    ArrayList<T> list;
public:
    void enqueue(const T& item) { list.add(item); }   // O(1) amortized
    T dequeue() {                                     // O(n): shifts everyone left
        if (list.isEmpty()) throw std::underflow_error("dequeue from empty queue");
        return list.remove(0);
    }
    const T& front() const { return list.at(0); }
};
```

入队 ICS46、ROCKS、!，然后全部取出：`ICS46 ROCKS !`（对照一个实现了 Lecture 3 中 ArrayList 操作的替身类编译运行得到）。

> 📝 **练习**：[活动 1](#72-活动-1用-arraylist-实现队列幻灯片-9)。

### 3.2 循环数组

> 📘 **课外补充**：Thornton 和 algs4 的办法是让队首“移动”来修正数组。保存 `f`（队首元素的下标）和 `n`（元素个数）。入队在 `(f + n) % capacity` 处写入并执行 `++n`；出队读取 `items[f]`，然后 `f = (f + 1) % capacity`，`--n`。两者都是 O(1)（入队在数组翻倍时是摊还的）。要保留计数 `n`：只用队首和队尾两个下标的话，“满”和“空”看起来是一样的。

示例（容量 2 → 翻倍为 4）：入队 1、2、3；出队 1、2；入队 4、5。此时 `f = 2`，5 绕回到了 0 号格子：格子内容为 `[5, _, 3, 4]`，队列顺序是 3 4 5。

同一个例子放在容量为 4 的数组上（这里不需要扩容）。在下面逐步演示（演示获得焦点时可用 ← / → 键）：

```viz circular-queue
{"title": "循环数组：队首移动，无需移位其余元素", "ops": "1 2 3 - - 4 5", "capacity": 4, "interactive": true}
```

### 3.3 SLL：增加 tail 指针（幻灯片 10）

只有 `head` 时，总有一个操作是 O(n)。**解决办法：保留一个 `tail` 指针**，在尾部入队，在头部出队。方向仍然重要：`tail` 能让你在最后一个节点之后 O(1) *添加*，却不能 O(1) *删除*它（删除需要它的前驱节点）。

```cpp
// inside LinkedQueue<T>: Node* head (front), Node* tail (rear), std::size_t n
void enqueue(const T& item) {          // O(1)
    Node* newNode = new Node(item);
    if (isEmpty()) head = newNode;     // first node is both front and rear
    else tail->next = newNode;
    tail = newNode;
    ++n;
}

T dequeue() {                          // O(1)
    if (isEmpty()) throw std::underflow_error("dequeue from empty queue");
    Node* temp = head;
    head = head->next;
    if (head == nullptr) tail = nullptr;   // queue became empty
    --n;
    T data = temp->item;
    delete temp;
    return data;
}
```

向一个非空队列入队，然后把它清空 —— 注意观察最后一次 `dequeue()` 如何重置 `tail`。在下面逐步演示（演示获得焦点时可用 ← / → 键）：

```viz queue
{"title": "带 head 和 tail 的 SLL（幻灯片 10）", "ops": "enqueue(ICS46); enqueue(ROCKS); enqueue(!); dequeue(); dequeue(); dequeue()"}
```

> ⚠️ **易错点**：有两种空队列的情况。向空队列入队时没有 `tail->next` 可设置，所以要同时设置 `head`。出队最后一个元素时必须把 `tail = nullptr`，否则下一次入队会通过已释放的内存写入。

> 📝 **练习**：[活动 2](#73-活动-2用单向链表实现队列幻灯片-10)。

### 3.4 DLL（幻灯片 11）

幻灯片 11 的 DLL 把 Head/Front 标在 ROCKS 上，把 Tail/Back 标在 "!" 上。带 head 和 tail 的 DLL 可以在**两端**都 O(1) 插入和删除（删除后新的 tail 是 `tail->prev`），所以两个方向的入队和出队都是 O(1)。代价是每个节点多一个 `prev`，却没有比带 tail 的 SLL 更快。**双端队列（deque，double-ended queue，本讲标题里提到的）**也需要 DLL：两端都能添加和删除。

> 📝 **练习**：[幻灯片 11 的题目](#74-用双向链表实现队列幻灯片-11)。

### 3.5 哪种最好？（幻灯片 12）

幻灯片 12（“How do we choose between the queue implementations?”）是一个空白的现场投票；下面的答案是我自己的，推理方式与 Lecture 4 幻灯片 51 相同。

- **ArrayList**：直接用的话，dequeue 是 O(n) —— 当队列并不合适。作为循环数组：摊还 O(1)，内存最省，但性能时快时慢。
- **单向链表**：带 tail 指针时，两个操作都是最坏情况 O(1) —— 这是一种保证，代价是每个节点多一个指针。
- **双向链表**：两个方向都是 O(1)，但 `prev` 带来额外内存，性能却一样。
- 最佳选择取决于具体问题（看重整体吞吐量 → 循环数组；要求每个操作都快 → 带 tail 的 SLL）。

---

## 4. 栈的应用：表达式求值

### 4.1 栈出现在哪里（幻灯片 14）

编译器和解释器中的基本机制；浏览器的后退按钮；文字处理器的撤销。本讲余下的部分讲的是编译器/解释器这一类：计算算术表达式。

### 4.2 中缀与后缀（幻灯片 14）

- **中缀（Infix）**：运算符在操作数**之间**；标准数学记法，需要括号来表示优先级。例如 `( ( 2 + 3 ) * ( 4 * 5 ) )`。
- **后缀（Postfix）**：运算符在操作数**之后**，**不需要括号**；用一个栈从左到右求值，没有歧义。

把完全括号化的中缀表达式转换成后缀：由内向外，把每个最内层的 `( a op b )` 改写为 `a b op`：
`( ( 2 + 3 ) * ( 4 * 5 ) )` ⇒ 子表达式求值 `((2 3 +) * (4 5 *))` ⇒ **`2 3 + 4 5 * *`**。操作数顺序不变，只有运算符移动。

### 4.3 Dijkstra 双栈算法（幻灯片 15）

从左到右读取完全括号化的中缀表达式，使用一个**值栈（value stack）**和一个**运算符栈（operator stack）**：

- 值：压入值栈。
- 运算符：压入运算符栈。
- 左括号：忽略。
- 右括号：弹出一个运算符和两个值；把该运算符作用于这两个值的结果压入值栈。

幻灯片 15 是 algs4 演示的一帧，显示值栈为 1, 2，运算符栈为 +, +。表达式本身不在幻灯片上；它与 algs4 演示用的表达式 `( 1 + ( ( 2 + 3 ) * ( 4 * 5 ) ) )` 吻合，所以下面的跟踪过程是根据 algs4 推断的。栈从底到顶：

| 读入的 token | 值栈 | 运算符栈 |
|---|---|---|
| `( 1 + ( ( 2 +` | 1 2 | + + ← *幻灯片 15 的那一帧* |
| `3 )` → 2 + 3 | 1 5 | + |
| `* ( 4 * 5 )` → 4 * 5 | 1 5 20 | + * |
| `)` → 5 * 20 | 1 100 | + |
| `)` → 1 + 100 | **101** | |

每个运算都必须有自己的括号：`)` 就是“现在应用最近的那个运算符”的信号。

在下面逐步演示（演示获得焦点时可用 ← / → 键）：

```viz two-stack-eval
{"title": "Dijkstra 双栈算法（幻灯片 15）", "expression": "( 1 + ( ( 2 + 3 ) * ( 4 * 5 ) ) )", "interactive": true}
```

> 📝 **练习**：[活动 3 (a)](#75-活动-3表达式求值幻灯片-18)。

### 4.4 操作数顺序（幻灯片 16）

幻灯片 16 链接了 algs4 的 “Dijkstra's 2-Stack Demo” 视频（[Google Drive](https://docs.google.com/file/d/1kLs501v5QjCoGAp5lO-58KUpNXyibNCm/preview)），并附注 *"video seems to have the order of the operands flipped."*（视频里的操作数顺序似乎反了）。规则是：**第一个弹出的值是右操作数**（它最后被压入），第二个弹出的是左操作数。幻灯片 17 把它写成 `v1 = pop()`、`v2 = pop()`、`push(v2 op v1)`。

例子：`( 10 - 4 )` 先弹出 4，再弹出 10 → 10 − 4 = **6**。如果反了，就会得到 4 − 10 = −6。对 `+` 和 `*` 来说顺序无所谓，这就是演示里的答案仍然正确的原因。

> ⚠️ **易错点**：考试题会用到 `-` 和 `/`。写下 v1 和 v2，然后计算 `v2 op v1`。

### 4.5 后缀表达式求值（幻灯片 17）

从左到右处理表达式；如果是操作数，就压栈；如果是运算符，就弹出 2 个操作数，并压入应用该运算符的结果。答案是最后剩下的那一个元素（`peek()`）。幻灯片 17 对 `(52 - ((5 + 7) * 4))` ⇒ `52 5 7 + 4 * -` 的跟踪（底 → 顶）：

| Token | 动作 | 栈 |
|---|---|---|
| `52` `5` `7` | push ×3 | 52 5 7 |
| `+` | v1=7, v2=5, push(v2+v1)=12 | 52 12 |
| `4` | push(4) | 52 12 4 |
| `*` | v1=4, v2=12, push(v2*v1)=48 | 52 48 |
| `-` | v1=48, v2=52, push(v2-v1)=4 | 4 → peek()=4 |

在下面逐步演示（演示获得焦点时可用 ← / → 键）：

```viz postfix-eval
{"title": "幻灯片 17：52 5 7 + 4 * -", "expression": "52 5 7 + 4 * -", "interactive": true}
```

```cpp
long evalPostfix(const std::string& expr) {
    LinkedStack<long> s;
    std::istringstream in(expr);
    std::string tok;
    while (in >> tok) {
        if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
            long v1 = s.pop();               // right operand (popped first)
            long v2 = s.pop();               // left operand
            s.push(applyOp(tok, v2, v1));    // v2 op v1
        } else {
            s.push(std::stol(tok));
        }
    }
    long result = s.pop();
    if (!s.isEmpty()) throw std::invalid_argument("malformed postfix expression");
    return result;
}
```

对 `52 5 7 + 4 * -`、`5 1 2 + 4 * + 3 -` 和 `10 4 -` 运行 `evalPostfix`，输出 `4 14 6`（`applyOp(op, left, right)` 返回 `left op right`）。

> 📝 **练习**：[活动 3 (b)–(c)](#75-活动-3表达式求值幻灯片-18)。

---

## 5. 队列的应用

幻灯片 19：Spotify 播放列表（歌曲按加入队列的顺序播放）、数据缓冲（Netflix、Hulu）、异步数据传输（文件 I/O、socket）、共享资源的请求（打印机）、流量分析、呼叫中心的等待时间。

> 💡 **关键洞察**：当**输入速率与输出速率不匹配**时（幻灯片 19）就用队列：元素成批到达、被匀速处理，队列按到达顺序保存积压的元素。

---

## 6. 完整实现

```cpp
#include <cstddef>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>

// Stack on a singly linked list: top = head
template <typename T>
class LinkedStack {
private:
    class Node {
    public:
        T item;
        Node* next;
        Node(const T& it, Node* nx = nullptr) : item(it), next(nx) {}
    };
    Node* head = nullptr;   // top
    std::size_t n = 0;

public:
    LinkedStack() = default;
    ~LinkedStack() { while (!isEmpty()) pop(); }
    LinkedStack(const LinkedStack&) = delete;             // Rule of Five: Lab 2
    LinkedStack& operator=(const LinkedStack&) = delete;

    bool isEmpty() const { return n == 0; }
    std::size_t size() const { return n; }

    void push(const T& item) {                 // O(1)
        head = new Node(item, head);
        ++n;
    }
    T pop() {                                  // O(1)
        if (isEmpty()) throw std::underflow_error("pop from empty stack");
        Node* temp = head;
        head = head->next;
        --n;
        T data = temp->item;                   // copy out before delete
        delete temp;
        return data;
    }
    const T& peek() const {                    // O(1)
        if (isEmpty()) throw std::underflow_error("peek at empty stack");
        return head->item;
    }
};

// Queue on a singly linked list with head AND tail: front = head, rear = tail
template <typename T>
class LinkedQueue {
private:
    class Node {
    public:
        T item;
        Node* next;
        Node(const T& it, Node* nx = nullptr) : item(it), next(nx) {}
    };
    Node* head = nullptr;   // front: dequeue here
    Node* tail = nullptr;   // rear: enqueue here
    std::size_t n = 0;

public:
    LinkedQueue() = default;
    ~LinkedQueue() { while (!isEmpty()) dequeue(); }
    LinkedQueue(const LinkedQueue&) = delete;
    LinkedQueue& operator=(const LinkedQueue&) = delete;

    bool isEmpty() const { return n == 0; }
    std::size_t size() const { return n; }

    void enqueue(const T& item) {              // O(1)
        Node* newNode = new Node(item);
        if (isEmpty()) head = newNode;
        else tail->next = newNode;
        tail = newNode;
        ++n;
    }
    T dequeue() {                              // O(1)
        if (isEmpty()) throw std::underflow_error("dequeue from empty queue");
        Node* temp = head;
        head = head->next;
        if (head == nullptr) tail = nullptr;   // became empty
        --n;
        T data = temp->item;
        delete temp;
        return data;
    }
    const T& front() const {
        if (isEmpty()) throw std::underflow_error("front of empty queue");
        return head->item;
    }
};

int main() {
    LinkedStack<std::string> st;
    st.push("ICS46"); st.push("ROCKS"); st.push("!");
    std::cout << "peek: " << st.peek() << ", size " << st.size() << "\npop:";
    while (!st.isEmpty()) std::cout << ' ' << st.pop();
    try { st.pop(); } catch (const std::underflow_error& e) { std::cout << "\nerror: " << e.what(); }

    LinkedQueue<std::string> q;
    std::istringstream in("To be or not to - be - - that - - - is");
    std::string t;
    std::cout << "\ndequeued:";
    while (in >> t) {
        if (t == "-") std::cout << ' ' << q.dequeue();
        else q.enqueue(t);
    }
    std::cout << "\nleft in queue (" << q.size() << "): front = " << q.front() << '\n';
}
```

```text
peek: !, size 3
pop: ! ROCKS ICS46
error: pop from empty stack
dequeued: To be or not to be
left in queue (2): front = that
```

---

## 7. 课堂活动（附解答）

### 7.1 活动 0：实现栈（幻灯片 4）

用以下结构实现栈：
- **单向链表**
- **双向链表**

(a) 栈顶应该放在哪里？(b) 如何用链表实现 Pop、Push 和 Peek？(c) Pop、Push 和 Peek 的最坏情况 Big-O 运行时间是多少？(d) 如果把栈顶放在相反的方向，最坏情况 Big-O 是多少？

**解答**

- **(a)** SLL：放在**头部**。带 head 和 tail 的 DLL：任一端。
- **(b)** push = 在头部插入；pop = 保存 `head`，把它前移，复制出元素，删除旧节点；peek = `head->item`（pop/peek 要做空检查）。代码见 [§1.1](#11-栈顶即链表头)。
- **(c)** 全部都是**最坏情况 O(1)**。
- **(d)** 栈顶在尾部：只有 head 的 SLL → 全部 O(n)；head + tail 的 SLL → push/peek O(1)，但 **pop O(n)**；DLL → 借助 `tail->prev`，全部 O(1)。

### 7.2 活动 1：用 ArrayList 实现队列（幻灯片 9）

用 **ArrayList** 实现队列：应该在哪里入队和出队？实现 enqueue 和 dequeue 操作。最坏情况（或摊还）运行时间是多少？如果把入队和出队的方向反过来呢？

**解答**

- 用 `list.add(item)` 在末尾入队，用 `list.remove(0)` 在下标 0 处出队。
- 入队**摊还 O(1)**；出队 **O(n)**（所有元素左移）。
- 反向（`add(0, item)` / `remove()`）：入队 **O(n)**，出队 O(1)。
- 不管哪个方向，总有一个操作是 O(n)，因为 ArrayList 把第 0 个元素固定在 0 号格子里（修正办法见 [§3.2](#32-循环数组)）。

### 7.3 活动 2：用单向链表实现队列（幻灯片 10）

用**单向链表**实现队列：应该在哪里入队和出队？实现 enqueue 和 dequeue 操作。最坏情况运行时间是多少？如果把入队和出队的方向反过来呢？做什么改动能让两个操作都达到 O(1)？

**解答**

- 在头部出队，在最后一个节点之后入队。
- 只有 head：dequeue O(1)，enqueue **O(n)**。反向：enqueue O(1)，dequeue **O(n)**。
- 改动：增加一个 **tail 指针**，队首 = head，队尾 = tail → 两者都是 O(1)（[§3.3](#33-sll增加-tail-指针幻灯片-10)）。
- 陷阱：反向放置时，即使有 tail 指针，dequeue 仍然是 O(n)。

### 7.4 用双向链表实现队列（幻灯片 11）

用**双向链表**实现队列：应该在哪里入队和出队？实现 enqueue 和 dequeue 操作。最坏情况运行时间是多少？如果把入队和出队的方向反过来呢？

**解答**

- 在尾部入队（`newNode->prev = tail; tail->next = newNode; tail = newNode;`，若队列为空则同时设置 `head`），在头部出队（`head = head->next; head->prev = nullptr;`，若变空则 `tail = nullptr`）。
- 两者都是**最坏情况 O(1)**，反向后仍然是 O(1)。代价：多出的 `prev` 指针。

### 7.5 活动 3：表达式求值（幻灯片 18）

- 用双栈方法对**中缀**表达式求值：`( ( 2 + 3 ) * ( 4 * 5 ) )`
- 用一个栈对**后缀**表达式求值：`5 1 2 + 4 * + 3 -`
- 把上面的表达式转换回中缀

**解答**

**(a)** = **100**。值栈/运算符栈（底 → 顶）：`( ( 2 + 3 )` 之后 → 5 / 空；`* ( 4 * 5 )` 之后 → 5 20 / `*`；最后一个 `)` → 5 × 20 = 100。

**(b)** = **14**：

| Token | 动作 | 栈 |
|---|---|---|
| `5` `1` `2` | push ×3 | 5 1 2 |
| `+` | v1=2, v2=1 → 3 | 5 3 |
| `4` `*` | v1=4, v2=3 → 12 | 5 12 |
| `+` | v1=12, v2=5 → 17 | 17 |
| `3` `-` | v1=3, v2=17 → 14 | 14 |

逐步检查 (a) 和 (b)：

```viz two-stack-eval
{"title": "活动 3 (a)", "expression": "( ( 2 + 3 ) * ( 4 * 5 ) )"}
```

```viz postfix-eval
{"title": "活动 3 (b)", "expression": "5 1 2 + 4 * + 3 -"}
```

**(c)** 压入表达式而不是数字：`((5 + ((1 + 2) * 4)) - 3)`，即 5 + (1 + 2) × 4 − 3 = 14。操作数顺序 5, 1, 2, 4, 3 保持不变。

---

## 8. 速查与必记的 5 个要点

| ADT | 顺序 | 添加 / 删除 / 查看 | 最佳链表 | 两端的位置 | 代价 |
|---|---|---|---|---|---|
| 栈 | LIFO | push / pop / peek | SLL，只有 head | 栈顶 = head | 最坏情况 O(1) |
| 队列 | FIFO | enqueue / dequeue / front | SLL，head + tail | 队首 = head，队尾 = tail | 最坏情况 O(1) |
| 基于 ArrayList 的栈 | LIFO | push / pop / peek | — | 栈顶 = 末端 | 摊还 O(1)（“lumpy”） |
| 基于 ArrayList 的队列 | FIFO | enqueue / dequeue | — | 队首 = 下标 0 | dequeue O(n) |

**必记的 5 个要点**

1. 链表栈把**栈顶放在头部**：push、pop 和 peek 都是最坏情况 O(1)；ArrayList 栈只是平均 O(1)。
2. SLL 上的队列需要一个 **tail** 指针，并且必须**在尾部入队、在头部出队** —— tail 指针无法让删除最后一个节点变成 O(1)。
3. 普通的 ArrayList 队列总有一个 O(n) 操作；最佳选择取决于具体问题。
4. **第一个弹出的值是右操作数**：计算 `v2 op v1`（对 `-` 和 `/` 很关键）。
5. 后缀表达式只需一个栈，不需要括号；完全括号化的中缀表达式需要 Dijkstra 的双栈。

> ➡️ **续见 [Lecture 6](?kind=course_notes&course=ICS-46&lang=zh-CN&note=ICS46_Lec06_Notes_zh-CN.md)**：递归分析 —— 写出递推式（例如阶乘）、递归树方法、T(n) = 2T(n/2) + n，以及二分查找活动。
