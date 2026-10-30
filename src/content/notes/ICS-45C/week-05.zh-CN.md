---
title: "阅读笔记"
summary: "链表(Node、UnorderedList、CharList)、namespace list 设计模式、链式结构的 RAII,以及递归三大法则(汉诺塔、走迷宫、Sierpinski)。"
---

# Information and Computer Science 45C — Week 5 整合 Reading 笔记

## 目录

- [1. 本周学习目标](#1-本周学习目标)
- [2. 什么是 Linked Structures（链式数据结构）](#2-什么是-linked-structures链式数据结构)
- [3. Linked List 的核心思想](#3-linked-list-的核心思想)
- [4. Node 类（链表的基本构件）](#4-node-类链表的基本构件)
- [5. UnorderedList 类的完整实现](#5-unorderedlist-类的完整实现)
- [6. Klefstad 风格的 CharList 实现](#6-klefstad-风格的-charlist-实现)
- [7. SLL 修改操作大全（增删改）](#7-sll-修改操作大全增删改)
- [8. namespace list 设计模式（PPT 独有）](#8-namespace-list-设计模式ppt-独有)
- [9. Shallow Clone vs Deep Clone](#9-shallow-clone-vs-deep-clone)
- [10. Linked List 的内存管理与 RAII](#10-linked-list-的内存管理与-raii)
- [11. 递归章节学习目标](#11-递归章节学习目标)
- [12. 什么是递归（Recursion）](#12-什么是递归recursion)
- [13. 用递归求 vector 之和](#13-用递归求-vector-之和)
- [14. 递归的三大法则（重点）](#14-递归的三大法则重点)
- [15. 把整数转换为任意进制字符串](#15-把整数转换为任意进制字符串)
- [16. Stack Frames：递归在底层的实现](#16-stack-frames递归在底层的实现)
- [17. 可视化递归：Turtle 图形](#17-可视化递归turtle-图形)
- [18. Sierpinski 三角形](#18-sierpinski-三角形)
- [19. 汉诺塔（Tower of Hanoi）](#19-汉诺塔tower-of-hanoi)
- [20. 走出迷宫（Exploring a Maze）](#20-走出迷宫exploring-a-maze)
- [21. 链表与递归的天然结合](#21-链表与递归的天然结合)
- [22. SLL 之外的链式数据结构（前瞻）](#22-sll-之外的链式数据结构前瞻)
- [23. typedef 简介](#23-typedef-简介)
- [24. Week 5 综合速查表](#24-week-5-综合速查表)
- [25. Week 5 最重要的五条记忆](#25-week-5-最重要的五条记忆)

> UCI ICS 45C: Programming in C++（35770）
> 本笔记整合了 Week 5 的指定阅读 cppds 4.1–4.5（Linked Lists）和 cppds 5.1–5.11（Recursion，重点 5.1–5.4），以及 Klefstad 教授的 PPT 讲义 *Linked List & Recursion*。所有内容按概念主题组织，每节融合 Reading 原文 + PPT 代码例子 + Klefstad 警句 + 易错点提示。
> PPT 中部分内容可能跨到 Week 6，凡是阅读清单未明确覆盖的会以 ⚠️ 标注。

---

## 1. 本周学习目标

> 对应 cppds 4.1（Linked Structures）+ cppds 5.1（Recursion）

### 1.1 链表部分（来自 cppds 4.1）

- 理解：像数组、vector 这种依赖**连续内存**存储的列表只是诸多列表结构中的一种
- 学习：链表是另一种类列表数据结构，但**不要求连续内存**
- 能写：能用 C++ 操作链表的代码
- 看图：能用 node + pointer 图示来描述链表
- 实现：知道单向链表（singly）和双向链表（doubly）在 C++ 中如何实现
- 理解抽象数据类型：**Node** 与 **Linked List**（包含 Unordered 与 Ordered 两种）

### 1.2 递归部分（来自 cppds 5.1）

- 理解：复杂问题也许有简单的递归解法
- 学会：用递归方式表达程序
- 掌握：**递归的三大法则**并能应用
- 视角：把递归视为一种特殊的迭代
- 实现：把问题的递归形式落到代码上
- 底层：理解计算机系统是如何实现递归的（栈帧）

---

## 2. 什么是 Linked Structures（链式数据结构）

> 对应 cppds 4.2

### 2.1 定义

**Linked data structure（链式数据结构）** = 由一组叫做 **node（节点）** 的数据结构组成，节点之间通过 **references（引用）或 pointers（指针）** 连接起来。

链式数据结构包含：
- **线性链式结构**：链表（Linked List），分 ordered 和 unordered
- **树形结构**：各种树（trees）

本周（以及 ICS 45C 的剩余部分）主要研究**线性链式结构**。

### 2.2 类比：操作系统的时间分片

把链式结构想象成操作系统的**多任务处理**（timesharing）：

> 计算机其实并不"同时"完成所有任务——它在不同任务之间高速切换，让人感觉无缝。这就好比你尝试一边听 3 个人讲话，一边读书，一边唱歌，你只能捕捉到每个任务的零碎片段。

操作系统通过**循环链表（circular linked list）** 来实现这种调度。每个任务是一个节点，操作系统沿着链表轮流给每个任务一些 CPU 时间。这就解释了为什么浏览器开很多 tab 时电脑会变慢——切换的开销变大了。

> 💡 **抽象理解**：链表节点不必在内存中相邻，但通过指针组织起一种**逻辑顺序**。这是数据结构与物理存储分离的最早例子之一。

---

## 3. Linked List 的核心思想

> 对应 cppds 4.3 + PPT slide 2-4

### 3.1 定义

> 💡 **Key Definition**：A **linked list** is a linear collection of data elements whose order is not determined by the placement in memory. Instead, each element is stored in a node which points to the next node.

链表是一种线性数据集合，**元素的顺序不由它们在内存中的位置决定**，而是每个元素都存储在一个 node 里，由这个 node 指向 next node。

### 3.2 与数组的根本对比

| 特性 | 数组 / vector | 链表 |
|---|---|---|
| 内存布局 | 连续 | 分散，由指针串联 |
| 随机访问 `A[i]` | O(1) — 2~3 条机器指令 | O(n) — 必须 traverse |
| 增长 | 必须重新分配 + 拷贝 | 直接挂一个新 node 即可 |
| 中间插入 | O(n) — 移动后续元素 | O(1) — 改两个指针 |
| 大小 | 编译时已知（栈数组）或显式 `new[]` | 完全动态 |
| 内存浪费 | 预留空间过大时浪费 | 无（按需分配，但每个节点多一个指针字段） |

### 3.3 为什么要学链表？

- **它能动态增长 / 收缩**——这是连续内存数组做不到的
- **可以在中间任何位置插入元素**
- 它是**更复杂数据结构（树、图、哈希表的 separate chaining）** 的基石

> ⚠️ **Klefstad 提示**：链表只应当**作为类的内部实现**使用（"should only be used as implementation of classes"），而不是裸露在用户代码里。这样可以隐藏指针细节，避免 dangling、leak、redundant delete。

### 3.4 链表的图示

```
head ──► [H | next] ──► [E | next] ──► [A | next] ──► [P | next] ──► null
```

- `head` 是外部入口指针，必须显式记录第一个节点的位置
- 每个节点存 **data + next 指针**
- 最后一个节点的 next 指向 `nullptr`，表示链表结束
- 空链表的 `head == nullptr`

---

## 4. Node 类（链表的基本构件）

> 对应 cppds 4.4 + PPT slide 5

### 4.1 Node 必须存什么？

每个 node 至少存两样东西：

1. **data field（数据字段）**：列表元素本身
2. **next pointer（下一个节点的引用）**：指向后继节点

### 4.2 cppds 教材的 Node 类（int 数据）

```cpp
#include <iostream>
using namespace std;

class Node {
private:
    int data;       // node 中存放的数据
    Node *next;     // 指向下一个节点的指针

public:
    Node(int initdata) {
        data = initdata;
        next = nullptr;     // 初始化为 nullptr ——很重要！
    }

    int getData() {
        return data;
    }

    Node *getNext() {
        return next;
    }

    void setData(int newData) {
        data = newData;
    }

    void setNext(Node *newnext) {
        next = newnext;
    }
};
```

构造一个 node 的用法：

```cpp
Node *temp = new Node(93);
// 现在 temp 指向一个 data=93、next=nullptr 的节点
```

> 💡 **Key Insight**：构造函数把 `next` 初始化成 `nullptr` 这一步至关重要——这就是所谓的 **"grounding the node"**（接地节点）。如果忘了，next 是未初始化的野指针，访问就是 UB。

### 4.3 PPT 风格的 Node（更精简）

Klefstad PPT 给的版本是 `struct`，且数据是 `char`：

```cpp
struct Node {
    char data;
    Node * next;
    /*
    Node( char new_data, Node * new_next )
        : data( new_data ), next( new_next )
    { }
    */
};
```

> ⚠️ Klefstad 提到：data 和 next 这两个名字是**约定俗成的标准名**——大家都用同样的名字才能"说同一种语言"，不要用 info 或 link 之类。

### 4.4 struct vs class 选择

回顾 Week 3 学过的内容（struct vs class）：

| 方面 | struct | class |
|---|---|---|
| 默认访问权限 | public | private |
| 适用场景 | 简单数据集合，所有字段都对外可见 | 有封装、不变量需要维护 |

PPT 里用 `struct Node`，是因为 Node 只是一个简单的 data + next 容器，不需要做封装。data 字段被外部直接访问也没问题（毕竟在链表实现内部使用）。cppds 用 `class Node` 多了 getter/setter，更面向对象一点。

### 4.5 节点的图示约定

```
[93 |·]──►   (含数据 93，next 是箭头)
```

或者简化成：

```
[93]──►
```

---

## 5. UnorderedList 类的完整实现

> 对应 cppds 4.5

这一节是 Week 5 链表部分**最核心**的内容。Reading 用 cppds 的 `UnorderedList`（int 数据，方法用英文 add/size/search/remove），PPT 用 Klefstad 的 `CharList`（char 数据，方法用 push/find）——这是同一种东西的不同命名。我们以 cppds 为主，对照 PPT。

### 5.1 类的结构（仅 head 一个成员）

```cpp
class UnorderedList {
public:
    Node *head;

    UnorderedList() {
        head = nullptr;
    }
};
```

> 💡 **Key Insight**：链表对象本身**只持有一个指针**——`head`，指向第一个 node。所有其他 node 都是通过这个 head 沿着 next 链找到的。

> ⚠️ **重要**：UnorderedList 类**本身不包含任何 node 对象**。它只持有指向第一个 node 的指针。这与"数组类持有数组"的直觉非常不同。

### 5.2 isEmpty 方法

```cpp
bool isEmpty() {
    return head == nullptr;
}
```

非常简单——head 是 nullptr 就空。

> 💡 这就是为什么 nullptr 这么有用：它是"链表结束"的统一标记，让构造函数（创建空列表）和 isEmpty 检查保持一致。

### 5.3 add 方法（头插法）

由于是无序的，新元素加在哪都可以。**最容易加的位置就是 head**——因为 head 是唯一的入口。

```cpp
void add(int item) {
    Node *temp = new Node(item);
    temp->setNext(head);    // Step 1: 新节点的 next 指向旧 head
    head = temp;            // Step 2: 更新 head 指向新节点
}
```

#### 关键：两步操作的顺序

> ⚠️ **顺序错了就完了**：必须先 `temp->setNext(head)`，**再** `head = temp`。

如果反了：

```cpp
// ❌ 错误顺序
head = temp;            // 此时 head 指向新节点，但旧链表丢失了！
temp->setNext(head);    // 现在 next 指向自己 → 自循环
```

如果先改 head，那么旧的链表就没有任何外部引用能找到了——**整个链表泄漏**！

#### add 的等价图示（PPT slide 8）

```
原状态：head ──► [H]──►[E]──►[A]──►[P]──►null

执行 head = new Node('C', head)：
                  ┌──► [H]──►[E]──►[A]──►[P]──►null
        head ──► [C]┘

简洁形式：head = new Node{'C', head};
```

> 💡 **Klefstad PPT 写法**：用 brace-initialization 把两步合并为一步：
> ```cpp
> head = new Node{c, head};   // 注意：head 在右侧表达式里被读，再赋给左侧
> ```
> 这要求 Node 有一个 `Node(char, Node*)` 构造器，或者是 struct 的 aggregate init。

#### 顺序的注意事项

PPT slide 6 提到：

```cpp
push(c) ── 调用 6 次：'A', 'B', ..., 'F'
```

由于是头插法，**最先插入的元素反而排在链表最末尾**。例如 cppds 例子里：

```cpp
mylist.add(31);  // 31 是第一个加入的，最终在最末尾
mylist.add(77);
mylist.add(17);
mylist.add(93);
mylist.add(26);
mylist.add(54);  // 54 是最后加入的，最终在最前面
// 链表顺序: 54 → 26 → 93 → 17 → 77 → 31
```

### 5.4 size 方法（Linked List Traversal 模式）

`size`、`search`、`remove` 都基于一种叫 **linked list traversal（链表遍历）** 的技术。

```cpp
int size() {
    Node *current = head;       // 起点：head
    int count = 0;
    while (current != nullptr) {  // 终点：nullptr
        count++;
        current = current->getNext();   // 沿 next 指针前进
    }
    return count;
}
```

#### 经典遍历模板（必背）

```cpp
for (Node *p = head; p != nullptr; p = p->next)
    // 用 p->data 或 p->next 做事
```

> ⚠️ **Klefstad 警告（PPT slide 6）**：traversal 时**不要直接用 head 做计数器**！否则你修改了 head，就丢失了链表的入口。一定要用一个**临时指针 `p` 或 `current`** 从 head 开始走。

```cpp
// ❌ 错误：用 head 直接遍历
for ( ; head != nullptr; head = head->next)
    cout << head->data;
// 遍历结束后 head 已经变成 nullptr，链表"丢失"了
```

### 5.5 search 方法（在链表中查找）

```cpp
bool search(int item) {
    Node *current = head;
    while (current != nullptr) {
        if (current->getData() == item) {
            return true;            // 找到立刻返回
        } else {
            current = current->getNext();
        }
    }
    return false;                   // 走到末尾还没找到
}
```

复杂度：**O(n)**——最坏情况要看完整个链表。

#### Klefstad PPT 风格的 find（搜索 char）

```cpp
bool find(char c) {
    for (Node *p = head; p != nullptr; p = p->next)
        if (p->data == c)
            return true;
    return false;
}
```

只是把 while + getter 形式换成了直接的 for 循环 + 字段访问。

### 5.6 remove 方法（重点 + 易错）

remove 是链表 4 个核心方法里最难的。它需要**两个指针**：`current` 和 `previous`。

#### 为什么需要 previous？

链表是**单向**的——只能从 head 沿 next 往后走，**不能往回走**。但删除节点时，必须修改**前一个节点的 next 指针**（让它跳过要删除的节点）。

如果只有 `current`，当 `current` 停在要删除的节点时，已经晚了：你没有办法从 `current` 回到它的前一个节点。

**解决方案**：让 `previous` 永远在 `current` 后面**慢一拍**地跟进，像虫子一样"inch-worming"。

#### 完整代码

```cpp
void remove(int item) {
    Node *current = head;
    Node *previous = nullptr;        // ⚠️ 注意：previous 初始化为 nullptr
    bool found = false;

    while (!found) {
        if (current->getData() == item) {
            found = true;
        } else {
            previous = current;          // previous 先跟上
            current = current->getNext(); // current 再前进
        }
    }

    if (previous == nullptr) {
        // 特殊情况：要删除的就是 head
        head = current->getNext();
    } else {
        // 一般情况：previous 跨过 current
        previous->setNext(current->getNext());
    }
    delete current;                  // ✅ 释放被摘下的节点(cppds 教材漏写,详见关键点 4)
}
```

#### 关键点 1：inch-worming 的顺序

```cpp
previous = current;           // 先把 previous 推到 current 的位置
current = current->getNext(); // 再把 current 往后挪一格
```

顺序**反了的话**，previous 会跳两格而不是一格。

#### 关键点 2：previous == nullptr 的特殊情况

如果要删除的是 head 节点本身，循环开始 found 立刻为 true，previous 始终是 nullptr。这时不能调用 `previous->setNext(...)`（segfault），必须直接改 head：

```cpp
if (previous == nullptr) {
    head = current->getNext();   // 这一步把链表的入口改成第二个节点
}
```

#### 关键点 3：cppds 的代码假设元素一定存在

cppds 给的代码有一个隐含假设：**要删除的元素一定在链表中**。如果不在，那么循环里 `current` 会变成 `nullptr`，再去访问 `current->getData()` 就 segfault。

这是 cppds 5.4.4 教材中专门留作"自查练习"的一个 bug：

> ⚠️ **思考**：how does this code behave if the item is **not** in the list? 它会崩溃。一个**更鲁棒**的版本应该把 `current != nullptr` 也加进 while 条件：
> ```cpp
> while (!found && current != nullptr) { ... }
> ```

#### 关键点 4：cppds 漏写了 `delete current`(内存泄漏!)

仔细看 cppds 教材原版的 remove 代码——它只是把节点从链表里**摘下来**(让 previous->next 跨过 current,或者把 head 指向 current->next),但是**从来没有 `delete current`**。被摘下的节点变成了**孤儿堆内存**——没有任何指针引用它,也没有被释放,**永久泄漏**。

上面"完整代码"末尾那行 `delete current;` 就是这个补丁——教材原版没有,工程里必须补上。

> 💡 **对比 §6.3 的 pop()**:Klefstad PPT 的 `pop()` 正确地写了 `delete tmp;`。同样是"从链表里拿掉一个节点",pop 释放了内存,cppds 的 remove 却没有——这是 cppds 教材的一个遗漏(可能是为了"教学简化"而省略,但严重违背 RAII)。

> ⚠️ **delete 的位置很关键**:必须在 `previous->setNext(current->getNext())` 之后,而不是之前——因为 `current->getNext()` 必须在 current 还有效时被读出来。先 delete 再 getNext = dangling reference。

> 🛡️ **顺便加上"找不到也安全"**:把关键点 3 的 `current != nullptr` 检查和这里的 `delete current` 一起加上,就是真正鲁棒的版本——只需在上面"完整代码"基础上改两处:
> ```cpp
> while (!found && current != nullptr) { ... }   // ← 改 1:防越界
> if (!found) return;                            // ← 改 2:跳过 delete
> ```

#### Klefstad PPT 中的 pop（移除头节点）

PPT slide 13 给了一个简化版本——只移除 head：

```cpp
char pop() {
    Node *tmp = head;
    char ret = tmp->data;
    head = head->next;
    delete tmp;            // ⚠️ 重点：必须 delete 否则内存泄漏
    return ret;
}
```

> ⚠️ **常见错误**（PPT slide 13）：
> ```cpp
> // ❌ 这样写的话 head 已经被释放，再 head->next 就是 dangling reference
> delete head;
> head = head->next;
> ```
> 必须先把 head 的地址保存到 tmp，更新 head 后再 delete tmp。

### 5.7 完整 ActiveCode

cppds 给了一个完整可运行的程序（这是 PPT slide 7 演示的也是 HW5 起点的形式）：

```cpp
#include <iostream>
using namespace std;

class Node {
private:
    int data;
    Node *next;
public:
    Node(int initdata) { data = initdata; next = nullptr; }
    int getData() { return data; }
    Node *getNext() { return next; }
    void setData(int newData) { data = newData; }
    void setNext(Node *newnext) { next = newnext; }
};

class UnorderedList {
public:
    Node *head;
    UnorderedList() { head = nullptr; }

    bool isEmpty() { return head == nullptr; }

    void add(int item) {
        Node *temp = new Node(item);
        temp->setNext(head);
        head = temp;
    }

    int size() {
        Node *current = head;
        int count = 0;
        while (current != nullptr) {
            count++;
            current = current->getNext();
        }
        return count;
    }

    bool search(int item) {
        Node *current = head;
        while (current != nullptr) {
            if (current->getData() == item) return true;
            else current = current->getNext();
        }
        return false;
    }

    void remove(int item) {
        Node *current = head;
        Node *previous = nullptr;
        bool found = false;
        while (!found) {
            if (current->getData() == item) found = true;
            else {
                previous = current;
                current = current->getNext();
            }
        }
        if (previous == nullptr) head = current->getNext();
        else previous->setNext(current->getNext());
        delete current;     // ✅ 释放被摘下的节点(cppds 教材漏写)
    }

    friend ostream& operator<<(ostream& os, const UnorderedList& ol);
};

ostream& operator<<(ostream& os, const UnorderedList& ol) {
    Node *current = ol.head;
    while (current != nullptr) {
        os << current->getData() << endl;
        current = current->getNext();
    }
    return os;
}

int main() {
    UnorderedList mylist;
    mylist.add(31); mylist.add(77); mylist.add(17);
    mylist.add(93); mylist.add(26); mylist.add(54);
    cout << "SIZE: " << mylist.size() << endl;             // 6
    cout << "contains 93?\t" << mylist.search(93) << endl; // 1
    cout << "contains 100?\t" << mylist.search(100) << endl;  // 0
    mylist.add(100);
    cout << "contains 100?\t" << mylist.search(100) << endl;  // 1
    mylist.remove(54);
    cout << "SIZE: " << mylist.size() << endl;     // 6
    return 0;
}
```

### 5.8 Self Check 与待实现的方法

cppds 留了几个练习题：

**Q1：append、insert、index、pop 这四个方法没实现，留作练习。**

**Q2 (Self Check Part I)：**实现 append（添加到末尾）。复杂度是多少？

答：朴素实现 = O(n)，因为必须 traverse 到末尾。

**Q3 (Self Check Part II)：**如何让 append 变成 O(1)？

答：在 UnorderedList 类里**额外保存一个 `tail` 指针**，每次 append 直接挂到 tail 后面。但这样要小心：add（头插）也要相应修改，因为初始空表插入第一个元素时 head 和 tail 都要更新。

**Q4：UnorderedList 对象包含什么？**

✅ **正确答案**：UnorderedList 对象**只持有一个指向第一个 Node 的指针**。Node 本身在堆上各自分配，可以散落在内存任何位置。

### 5.9 复杂度小结

7 个方法的复杂度速查表见 [§24.2](#242-sll-操作复杂度cppds-unorderedlist)（`isEmpty` / `add` 头插是 O(1)，其他都是 O(n)）。

---

## 6. Klefstad 风格的 CharList 实现

> 对应 PPT slide 7-13

PPT 用一个叫 `CharList` 的例子来讲链表，本质上和 cppds 的 UnorderedList 是一回事，只是：
- 数据类型从 `int` 变成 `char`
- 方法名 add → push, search → find
- 用 struct Node（aggregate init）
- 析构函数 / pop 演示了内存管理细节

### 6.1 CharList 的使用

```cpp
ostream & operator <<(ostream & out, const CharList & L) {
    L.print(out);
    return out;
}

int main() {
    CharList L;
    for (char c = 'A'; c <= 'Z'; ++c)
        L.push(c);

    if (L.find('K'))
        cout << "char 'K' is in the list" << endl;

    cout << L << endl;
}
```

push 26 次后，由于是头插，链表会是 `Z → Y → X → ... → B → A`。

### 6.2 CharList 类定义

```cpp
class CharList {
    Node * head;    // 唯一成员
public:
    CharList() : head(nullptr) { }

    void push(char c) {
        head = new Node{c, head};   // 一行搞定
    }

    bool find(char c) {
        for (Node *p = head; p != nullptr; p = p->next)
            if (p->data == c)
                return true;
        return false;
    }

    void print(ostream &out) const {
        for (Node *p = head; p != nullptr; p = p->next)
            out << p->data << ' ';
    }

    ~CharList();        // 见下面
};
```

### 6.3 CharList 的析构函数（两个版本，version 1 有 bug！）

PPT slide 11 给了两个版本：

```cpp
~CharList() {
    for (Node *p = head; p != nullptr; p = p->next) {
        delete p;             // version 1 — 有 bug！
        Node *temp = p;       // version 2 — 正确
        p = p->next;
        delete temp;
    }
}
```

> ⚠️ **Bug 分析**（version 1）：
> - 在 `for` 的 `p = p->next` 之前已经 `delete p`
> - 此时 `p` 指向的是已释放的内存（dangling pointer）
> - 再访问 `p->next` 是 **undefined behavior**

> ✅ **正确做法**（version 2）：
> - 先把 `p` 保存到 `temp`
> - 让 `p` 走到下一个节点（**这一步在 delete 之前**）
> - 然后才 `delete temp`

更清晰的写法：

```cpp
~CharList() {
    Node *p = head;
    while (p != nullptr) {
        Node *temp = p;
        p = p->next;        // 先前进
        delete temp;        // 再释放
    }
}
```

> 💡 **Key Insight**：只要涉及"删除 + 移动"的循环，就必须**先保存指针，再前进，最后释放**。这是链表内存管理的最基础模式。

### 6.4 print 的 const 修饰

PPT 中 `print(ostream &out) const`：

- `const` 表示这个方法不修改 `*this`
- 这样 `const CharList &` 才能调用它
- `operator<<` 重载里用了 `const CharList &`，这是 Week 4 学过的 const correctness

### 6.5 cppds vs Klefstad 风格命名对照表

| cppds 命名 | Klefstad PPT 命名 | 含义 |
|---|---|---|
| `add(int)` | `push(char)` | 在链表头部插入 |
| `search(int)` | `find(char)` | 查找元素 |
| `size()` | `length()` | 长度 |
| `print(out)` | `print(out)` | 打印 |
| `pop()` (cppds 课后题) | `pop()` | 移除并返回头部 |
| `getData() / getNext()` | 直接用 `p->data / p->next` | 访问字段 |

> ⚠️ HW 中可能两套命名混用——根据作业要求来。

---

## 7. SLL 修改操作大全（增删改）

> 对应 PPT slide 8, 12, 43-49

PPT 中给了一些 cppds 没明确讲的修改操作。这些是基础操作，写链表代码时常用。

### 7.1 添加到头部（前面已讲）

```cpp
head = new Node{'C', head};
```

### 7.2 添加到末尾（Adding to End）

需要先用 helper 找到最后一个节点：

```cpp
Node *tmp = list::last(head);   // 见 §8.5
if (tmp != nullptr)
    tmp->next = new Node('S', nullptr);
```

边界：如果 head 本身是 nullptr（空表），last 返回 nullptr——这个 if 检查保护了不会 segfault。但这种情况下其实应该直接修改 head：

```cpp
if (head == nullptr)
    head = new Node('S', nullptr);
else
    list::last(head)->next = new Node('S', nullptr);
```

### 7.3 在某节点之后插入（Insert After）

```cpp
Node *tmp = list::find_char(head, 'E');
if (tmp != nullptr)
    tmp->next = new Node('X', tmp->next);   // 注意：next 字段是 tmp->next（旧的）
```

图示：
```
之前：head ──► [H]──►[E]──►[A]──►[P]──►null
                       │
                       tmp
之后：head ──► [H]──►[E]──►[X]──►[A]──►[P]──►null
                       │
                       tmp
```

### 7.4 在某节点之前插入（Insert Before）

由于 SLL 不能后退，必须找**前一个**节点：

```cpp
Node *prev = list::find_prev(head, 'A');    // 找到 A 的前一个节点
Node *cur = prev->next;
prev->next = new Node('X', cur);
```

### 7.5 删除某节点（Deletion）

```cpp
Node *prev = list::find_prev(head, 'A');
Node *cur = prev->next;
prev->next = cur->next;     // 跳过 cur
delete cur;                 // 必须 delete，不然泄漏
```

### 7.6 反模式：链式 next（Anti-patterns）

PPT slide 14 + 46-47 列出了几个**绝对不要写**的代码：

#### ❌ 反模式 1：多 next 链

```cpp
head->next = head->next->next;
// PPT 原话：BTW, don't do this!!!
```

虽然语义上是"跳过第二个节点"，但：
- 代码可读性差
- 跳过的节点没 delete → 内存泄漏
- 一旦 head 或 head->next 是 nullptr 就崩

#### ❌ 反模式 2：制造循环

```cpp
head->next->next->next->next->next = head;
// PPT 原话：Really!!! don't do this!!!
```

把链表的最后一个节点的 next 指回 head，形成**环**。

后果：任何遍历都会**死循环**。析构函数 `for (p; p != nullptr; ...)` 永远不会终止。

#### ❌ 反模式 3：扫两遍

PPT slide 14 提示：
> Beware making two (or more) passes down list. Always make only one pass, unless you must do more.

如果要同时找元素和它的位置，应该一次遍历完成，不要先 search 再 indexOf。

#### ❌ 反模式 4：制造副本

> Beware making extra list copies.

链表 deep copy 很贵（O(n) 时间 + O(n) 空间），尽量传引用。

---

## 8. namespace list 设计模式（PPT 独有）

> 对应 PPT slide 15-25, 31-32, 49

这一节是 Klefstad PPT **独有**、cppds 没有的内容，但是 HW5 的核心设计模式。

### 8.1 为什么要 namespace？

Klefstad 计划 **HW5 用 SLL 实现 String 类**。在这种设计下：
- String 类负责**封装**和**资源所有权**（RAII）
- 链表的**底层操作**（length、reverse、copy、free 等）放在一个独立的 `namespace list` 里，作为**通用 helper**

### 8.2 设计原则

| 角色 | 责任 |
|---|---|
| **String 类**（接口方法） | 有 this 对象、做错误检查、调用 list helper |
| **namespace list**（静态 helper） | 通用、不知道 MAXLEN、不做错误检查、含底层 for 循环 |

### 8.3 namespace 定义

```cpp
namespace list {
    struct Node {
        char data;
        Node * next;
    };

    // 返回 L 的精确副本
    Node * copy(Node * L);
}

// 使用方式：
list::Node *n;
list::Node *clone = list::copy(n);
```

### 8.4 list::length()

cppds 教 size 时用 while 循环。namespace list 里也是同样模式：

```cpp
int length(Node *L) {
    int count = 0;
    for (Node *p = L; p != nullptr; p = p->next)
        ++count;
    return count;
}
```

边界：L == nullptr 时直接返回 0。

### 8.5 list::nth()

```cpp
Node * nth(Node *L, int n) {
    Node *p = L;
    for (int i = 0; i < n && p != nullptr; ++i)
        p = p->next;
    return p;       // 可能是 nullptr（n 越界）
}
```

边界：
- `n == 0` → 返回 L 本身（第 0 个就是 head）
- `n` 越界 → 返回 nullptr

### 8.6 list::free()

释放整个链表的所有节点。第一版（错误！）：

```cpp
void free(Node *L) {       // ⚠️ first draft, does not work
    for (Node *p = L; p != nullptr; p = p->next)
        delete p;
}
```

这是 §6.3 提到的同类 bug——`p` 被 delete 后 `p->next` 是 dangling。

正确版本：

```cpp
void free(Node *L) {
    while (L != nullptr) {
        Node *temp = L;
        L = L->next;
        delete temp;
    }
}
```

### 8.7 list::last()

返回指向最后一个节点的指针：

```cpp
Node * last(Node *L) {
    if (L == nullptr) return nullptr;
    while (L->next != nullptr)
        L = L->next;
    return L;
}
```

边界：空表返回 nullptr。

### 8.8 list::reverse()

反转链表。这有几种思路：

#### 思路 A：递归（PPT slide 24）

```cpp
Node * rev2(Node *L, Node *R) {  // tail-recursion
    if (L == nullptr) return R;
    Node *next = L->next;
    L->next = R;          // 反向
    return rev2(next, L);
}

Node * reverse(Node *L) {
    return rev2(L, nullptr);
}
```

⚠️ **注意**：这种写法**直接修改原链表**，不是 deep copy。如果还要保留原链表，需要先 copy 再 reverse。

#### 思路 B：构建新链表（与 HW4 String::reverse 类似）

```cpp
Node * reverse(Node *L) {
    Node *result = nullptr;
    for (Node *p = L; p != nullptr; p = p->next)
        result = new Node{p->data, result};   // 头插构造逆序
    return result;
}
```

### 8.9 list::copy()（重要 - deep copy）

```cpp
Node * copy(Node *L) {
    if (L == nullptr) return nullptr;
    Node *new_head = new Node{L->data, nullptr};
    Node *new_tail = new_head;
    for (Node *p = L->next; p != nullptr; p = p->next) {
        new_tail->next = new Node{p->data, nullptr};
        new_tail = new_tail->next;
    }
    return new_head;
}
```

这是 **deep copy**——新链表的每个节点都是新分配的，与原链表完全独立。

### 8.10 list::append()（拼接两个链表）

```cpp
Node * append(Node *L1, Node *L2) {
    Node *result = copy(L1);    // 先深拷贝 L1
    if (result == nullptr) return copy(L2);  // L1 空，返回 L2 的拷贝
    Node *tail = last(result);
    tail->next = copy(L2);      // 把 L2 的拷贝接到尾巴
    return result;
}
```

⚠️ 这里两次 copy 是**有意的**——append 应当返回一个完全独立的新链表，不破坏 L1 或 L2。

### 8.11 list::attach()（注意：与 append 不同）

```cpp
Node * attach(Node *L1, Node *L2) {
    if (L1 == nullptr) return L2;
    last(L1)->next = L2;        // ⚠️ 直接修改！没有 copy
    return L1;
}
```

> ⚠️ **attach 与 append 的区别**：
> - `attach` 直接修改 L1，让它的尾巴指向 L2 ——**没有 copy**
> - `append` 返回一个新链表，原 L1 和 L2 都不变
> 
> attach 更高效（O(n) 而非 O(n+m)），但要注意所有权——如果 L1 和 L2 各自被 String 拥有，attach 会造成两个 String 共享部分内存，析构时 double-free。**HW5 中**主要用 append（带 copy 的版本）。

### 8.12 helper 设计原则总结

PPT slide 5 (Strings 那个 PPT)：

| static helpers（list::xxx） | String interface methods |
|---|---|
| 通用，不知道 MAXLEN | 有 this 对象 |
| 不做错误检查 | **做**错误检查 |
| 含底层 for 循环 | 调用 helpers 完成工作 |
| 之间互相调用 | |

---

## 9. Shallow Clone vs Deep Clone

> 对应 PPT slide 29-30

这是 Week 4 已讲过的概念在链表上的具体体现。

### 9.1 Shallow Clone（浅拷贝）

```
LIST ──► [H]──►[E]──►[A]──►[P]──►null
              ▲
TWIN ─────────┘  (TWIN 自己有一个新 head 节点，但 next 指向 LIST 的内部节点)
```

> ⚠️ **浅拷贝的问题**：
> - 如果 LIST 被销毁（析构释放所有节点），TWIN 的内部指针会变成 dangling
> - 如果 LIST 和 TWIN 都析构 → 同样的节点被 delete 两次 → **redundant delete**（UB）

> 💡 **Klefstad 警句**："How will you delete such a monster?"

### 9.2 Deep Clone（深拷贝）

```
LIST ──► [H]──►[E]──►[A]──►[P]──►null

TWIN ──► [H]──►[E]──►[A]──►[P]──►null
         (完全独立的新节点)
```

每个节点都是 `new` 出来的全新拷贝。LIST 和 TWIN 完全独立——任何一个被销毁都不影响另一个。

### 9.3 为什么 Linked List 的 copy constructor 必须写 deep copy？

回到 Week 4 的 **Rule of Three / Rule of Five**：

如果一个类持有指针（比如 `Node *head`），编译器自动生成的 copy constructor 是 **memberwise init**，也就是直接复制 `head` 指针——这就是 shallow copy。

> 💡 **Klefstad 警句**：> "RULE OF THREE if your class contains any pointers, must write all three: copy constructor, copy assignment, destructor"

对 String/CharList 这样的链表类，必须自定义：

```cpp
CharList(const CharList &other)
    : head(list::copy(other.head))      // deep copy！
{ }

CharList & operator=(const CharList &other) {
    if (this != &other) {
        list::free(head);               // 先释放旧的
        head = list::copy(other.head);  // 再深拷贝新的
    }
    return *this;
}

~CharList() {
    list::free(head);
}
```

---

## 10. Linked List 的内存管理与 RAII

> 对应 PPT slide 17-18

### 10.1 谁拥有 heap memory？

PPT slide 17 提了一个**关键设计问题**：

> Who owns the heap memory? Our decision!
> - ListNode? **No**
> - String? **Yes**

也就是说，节点 `Node` 本身**不**为自己释放内存——它只是被动持有 data + next。**真正负责释放的是上层的 String/CharList 类**。

#### 为什么不让 Node 自己管自己？

> 💡 **Key Insight**：如果让 Node 的析构器递归 delete 它的 next，会带来：
> 1. 一旦多个链表共享节点（即便临时性的），就会 double-free
> 2. 销毁顺序难以推理
> 3. 对很长的链表，递归析构会爆栈

**正确的责任分配**：
- **Node**：只持有 data + next，不管析构
- **String / CharList**：拥有整条链表，析构时调用 `list::free(head)` 释放所有节点

### 10.2 String 对象之间能共享内存吗？

> Can String objects share memory? **No!** Becomes a nightmare to manage.

每个 String 必须**独占**自己的链表（deep copy 的体现）。

### 10.3 RAII（Resource Acquisition Is Initialization）

> 💡 **核心原则**（PPT slide 17）：
> Resource Acquisition Is Initialization (RAII)
> - encapsulate each resource (e.g., heap memory) into a class
>     - constructor acquires the resource
>     - destructor releases the resource
>     - copy makes a deep copy
>     - move safely transfers resource ownership between objects
> - simple, systematic way to prevent memory leaks

这不是 Week 5 才出现的——Week 4 学习 Rule of Three 时就提过。在 Linked List 实现中 RAII 体现得**最彻底**：

| 阶段 | 责任 |
|---|---|
| **构造**（默认 / from C-string） | acquire：分配 head（默认 nullptr）或递归构造节点 |
| **拷贝构造** | deep copy 整个链表 |
| **拷贝赋值** | 先释放旧资源，再 deep copy 新资源 |
| **移动构造 / 赋值** | shallow 复制指针 + 把对方指针置 nullptr |
| **析构** | release：递归释放所有节点（list::free） |

### 10.4 explicit String(list::Node * L) 私有构造器（HW5 关键）

PPT slide 18 介绍一个**私有构造器**：

```cpp
class String {
    list::Node *head;
public:
    String();                       // 默认
    String(const char *s);          // 从 C-string
    String(const String &);         // copy
    // ...

private:
    explicit String(list::Node *L) : head(L) { }   // ⚠️ 关键
};
```

**用途**：让 String 的方法（比如 `operator+`、`reverse`）能直接构造一个**已经有链表的** String，而不必先创建空 String 再赋值。

```cpp
String operator+(const String &s) {
    // 把 head 和 s.head 拼接成一条新链表
    return String( list::append(head, s.head) );
    //      ↑ 调用私有构造器，head 直接接管返回的链表
}
```

> 💡 **设计意图**：避免不必要的 copy。如果用 public 接口，写法可能是：
> ```cpp
> String result;
> result.head = list::append(head, s.head);  // ❌ 但 head 是 private 的
> // 或
> String result(list::node_to_cstring(...)); // ❌ 又要先转 C-string
> ```
> 私有构造器允许"接管所有权"，零 copy。

> ⚠️ `explicit` 防止隐式转换（`Node *` 不能隐式转 `String`），避免误用。
> ⚠️ `private` 防止外部代码直接传链表进来——只有 String 内部方法能用。

### 10.5 与 HW4 的对应关系

PPT slide 18 提到：

> Same idea was useful for HW4 to prevent copy when we declare local String in reverse() or operator +()

也就是 Week 4 笔记里讲过的 `String::String(int length)` 私有构造器（HW4）——预先分配 buf 但不初始化内容，后续直接填充。HW5 是同样的设计在链表版本上的体现。

---

## 11. 递归章节学习目标

> 对应 cppds 5.1

本章的目标：

- 理解：复杂问题也许有**简单的**递归解法
- 学会：用递归方式表达程序
- 理解并应用：**递归的三大法则**
- 视角：把递归视为一种特殊的迭代
- 实现：把问题的递归形式落到代码上
- 底层：理解计算机系统是如何实现递归的

---

## 12. 什么是递归（Recursion）

> 对应 cppds 5.2 + PPT slide 26-27

### 12.1 定义

> 💡 **Key Definition**：**Recursion** is a method of solving problems that involves breaking a problem down into smaller and smaller subproblems until you get to a small enough problem that it can be solved trivially. Usually recursion involves a function calling itself.

递归是一种问题求解方法，**把问题分解成越来越小的子问题，直到小到可以平凡解决**。通常递归涉及**函数调用自身**。

> 它表面看上去也许平平无奇，但递归让我们能够给那些"用迭代风格难以表达"的问题写出非常优雅的解。

### 12.2 类比：归纳证明

PPT slide 26：
> recursion is similar to an inductive proof
> - must handle base cases (terminal cases)
> - then handle inductive case (recursive case)

| 数学归纳法 | 递归算法 |
|---|---|
| Base case：证明 P(0) 成立 | 处理小到不能再小的情况，直接返回 |
| Inductive step：假设 P(k) 成立，证 P(k+1) | 用更小问题的解（递归调用）来构造当前问题的解 |

### 12.3 PPT 例子 1：sumN

求前 N 个整数之和：

```cpp
int sumN(int n) {        // with if/else
    if (n == 0)
        return 0;
    else
        return n + sumN(n - 1);
}

int sumN(int n) {        // with conditional operator (Week 4 学过)
    return n == 0 ? 0 : n + sumN(n - 1);
}
```

- Base case：`n == 0` 时返回 0
- Recursive case：`n + sumN(n-1)`

### 12.4 PPT 例子 2：Factorial（阶乘）

> ```text
> N! = 1 * 2 * 3 * … * (N-1) * N
> 0! = 1
> ```

```cpp
int factorial(int n) {
    return n == 0 ? 1 : n * factorial(n - 1);
}
```

- Base case：`n == 0` 时返回 1（数学约定）
- Recursive case：`n * factorial(n-1)`

调用 trace（`factorial(4)`）：

```
factorial(4) = 4 * factorial(3)
             = 4 * 3 * factorial(2)
             = 4 * 3 * 2 * factorial(1)
             = 4 * 3 * 2 * 1 * factorial(0)
             = 4 * 3 * 2 * 1 * 1
             = 24
```

> ⚠️ **常见错误**：base case 选错（详见 §14）

---

## 13. 用递归求 vector 之和

> 对应 cppds 5.3

### 13.1 迭代版本（已知）

```cpp
#include <iostream>
using namespace std;

int vectsum(int numVect[]) {
    int theSum = 0;
    for (int i = 0; i < 5; i++) {
        theSum += numVect[i];
    }
    return theSum;
}

int main() {
    int numVect[5] = {1,3,5,7,9};
    cout << vectsum(numVect) << endl;   // 25
    return 0;
}
```

用一个 **accumulator 变量** `theSum` 累加。

### 13.2 数学家视角：完全括号化

假装我们没有 while/for 循环。如何求 `[1, 3, 5, 7, 9]` 之和？

加法是定义在**两个数**上的运算。我们可以把列表写成完全括号化的表达式：

$$total = ((((1 + 3) + 5) + 7) + 9)$$

或者反过来：

$$total = (1 + (3 + (5 + (7 + 9))))$$

最内层的括号 `(7 + 9)` 是一个**不需要循环就能解的小问题**。一步步化简：

$$
\begin{aligned}
total = &\ (1 + (3 + (5 + (7 + 9)))) \\
total = &\ (1 + (3 + (5 + 16))) \\
total = &\ (1 + (3 + 21)) \\
total = &\ (1 + 24) \\
total = &\ 25
\end{aligned}
$$

### 13.3 转化为代码

> "vector `numVect` 的总和 = 第一个元素 + 剩下元素的总和"

```cpp
#include <iostream>
#include <vector>
using namespace std;

int vectsum(vector<int> numVect) {
    if (numVect.size() <= 1) {
        return numVect[0];
    }
    else {
        // 取从下标 1 到末尾的子 vector
        vector<int> slice(numVect.begin() + 1, numVect.begin() + numVect.size());
        return numVect[0] + vectsum(slice);
    }
}

int main() {
    int arr2[] = {1, 3, 5, 7, 9};
    vector<int> numVect(arr2, arr2 + (sizeof(arr2)/sizeof(arr2[0])));
    cout << vectsum(numVect) << endl;   // 25
    return 0;
}
```

### 13.4 关键代码点

> 💡 **Key Insight**（cppds 原文）：
> - **Line 6**：检查 vector 是否长度为 1。这是我们的"逃生门"（escape clause），递归终止条件。长度为 1 的 vector 之和 trivially = 它唯一的元素。
> - **Line 11**：函数**调用自己**！这就是 vectsum 算法的递归之处。

### 13.5 调用过程图示

```
vectsum([1, 3, 5, 7, 9])
    = 1 + vectsum([3, 5, 7, 9])
            = 3 + vectsum([5, 7, 9])
                    = 5 + vectsum([7, 9])
                            = 7 + vectsum([9])
                                    = 9          (base case)
                            = 7 + 9 = 16
                    = 5 + 16 = 21
            = 3 + 21 = 24
    = 1 + 24 = 25
```

每次递归调用都在**解一个更小的问题**。当问题小到不能再小（base case），开始向上"组装"答案。

### 13.6 Python 对比

```python
def listsum(numList):
    if len(numList) == 1:
        return numList[0]
    else:
        return numList[0] + listsum(numList[1:])

print(listsum([1,3,5,7,9]))  # 25
```

| Python | C++ |
|---|---|
| `numList[1:]` 切片 | 必须用 vector + iterator constructor 手动切 |
| 任意精度 int | 注意 int 溢出 |
| `len(...)` | `numVect.size()` |

---

## 14. 递归的三大法则（重点）

> 对应 cppds 5.4 — Week 5 的**核心知识点**之一

### 14.1 三大法则

> Like the robots of Asimov, all recursive algorithms must obey three important laws:
> 1. A recursive algorithm must have a **base case**.
> 2. A recursive algorithm must change its state and move toward the base case.
> 3. A recursive algorithm must call itself, recursively.

```
┌───────────────────────────────────────────┐
│  Law 1：必须有 base case                  │
│  Law 2：必须改变状态、向 base case 靠近   │
│  Law 3：必须调用自己                      │
└───────────────────────────────────────────┘
```

### 14.2 法则详解

#### Law 1: Base Case（基础情况）

base case 是**让递归停下来**的条件，通常是问题小到可以**直接解决**的情况。

> 在 listsum 算法中，base case 是 list 长度为 1。

如果没有 base case → **无限递归 → 栈溢出**（StackOverflow / SIGSEGV）。

#### Law 2: 改变状态、向 base case 靠近

每次递归调用必须把**问题的输入**变得"更接近" base case。"改变状态"意思是：算法使用的数据被修改了。通常我们的问题数据会**变小**。

> 在 listsum 中，主数据结构是一个 vector，所以状态改变要在 vector 上做。Base case 是长度 1 的 vector，自然的"靠近 base case"就是让 vector 变短。这正是 line 5 的 `listsum` 用更短的 list 调用自己。

> ⚠️ **常见错误**：忘了让问题变小：
> ```cpp
> int bad(int n) {
>     return n == 0 ? 0 : n + bad(n);   // ❌ 永远 bad(n)，从未变小
> }
> ```

#### Law 3: 调用自己

这是递归的**定义**。听起来好像在打圈圈："我要写函数解决问题，但这个函数要靠调用自己来解决问题？"

> 但其实逻辑并不是循环的——递归是把大问题**分解为更小、更易解的子问题**的优雅表达。

### 14.3 Self Check 答疑

#### Q1：计算 vector `{2, 4, 6, 8, 10}` 之和需要多少次**递归**调用？

✅ **正确答案：4 次**

详细解释：
```
vectsum({2,4,6,8,10})       ← 初始调用，不计入递归
  → vectsum({4,6,8,10})     ← 递归 1
    → vectsum({6,8,10})     ← 递归 2
      → vectsum({8,10})     ← 递归 3
        → vectsum({10})     ← 递归 4，命中 base case
```

错误选项分析：
- **5**：把"初始调用"也算成递归调用了——初始调用不是递归
- **6**：递归调用数不可能超过 vector 大小
- **3**：少算了一次——base case 那次也是一次调用

> 💡 **要点**：递归调用数 = vector 大小 - 1（即 5 - 1 = 4）

#### Q2：写一个递归求阶乘的函数 `fact(n)`，返回 n × (n-1) × ... × 1，且 fact(0) = 1。**最合适的 base case** 是哪个？

| 选项 | 评价 |
|---|---|
| `n == 0` | ✅ 能工作，但稍微低效——多一次递归 |
| `n == 1` | ⚠️ 看起来不错，但 fact(0) 怎么办？会无限递归到 fact(-1) |
| `n >= 0` | ❌ 所有正数都返回 1，错得离谱 |
| `n <= 1` | ✅ **最高效**，并且能防御负数（避免崩溃） |

> 💡 **Best practice**：base case 检查 `n <= 1` 让 fact(0) 和 fact(1) 都直接返回 1，最高效，还能防御传入负数（不会无限递归）。

```cpp
int fact(int n) {
    return n <= 1 ? 1 : n * fact(n - 1);
}
```

### 14.4 用三大法则检查自己的代码

写完一个递归函数，用三个问题自检：

```
□ 1. 我有 base case 吗？什么条件下会停下来？
□ 2. 每次递归调用的输入是不是变得更接近 base case？
□ 3. 我是不是在调用自己？
```

任何一条没满足 → 这不是正确的递归。

---

## 15. 把整数转换为任意进制字符串

> 对应 cppds 5.5

### 15.1 问题

把一个整数转换成它在某个进制（2 到 16 之间）下的字符串表示。例如：
- 10 (base 10) → `"10"`
- 10 (base 2) → `"1010"`
- 1453 (base 16) → `"5AD"`

### 15.2 思路：除法 + 余数

设有查找字符串 `convString = "0123456789ABCDEF"`。如果数字小于 base，直接查表（base case）。

否则用整数除法 + 余数：
- 769 ÷ 10 = 76 余 9 → 余数 9 是最后一位
- 76 ÷ 10 = 7 余 6 → 余数 6 是倒数第二位
- 7 < 10 → base case，结果是 "7"
- 倒着拼接：`"7" + "6" + "9" = "769"`

### 15.3 算法三步

1. 把原数字化简为一系列单数字
2. 用查表把单数字转字符串
3. 把单数字字符串拼起来

### 15.4 代码

```cpp
#include <iostream>
#include <string>
using namespace std;

string toStr(int n, int base) {
    string convertString = "0123456789ABCDEF";
    if (n < base) {
        return string(1, convertString[n]);   // base case: char → string
    } else {
        return toStr(n/base, base) + convertString[n%base];
    }
}

int main() {
    cout << toStr(1453, 16);     // 5AD
}
```

### 15.5 关键点：**先递归调用，后拼接**

> 💡 **Key Insight**（cppds 原文）：
> The algorithm works correctly because we make the recursive call **first** on line 6, **then** we add the string representation of the remainder. If we reversed returning the convertString lookup and returning the toStr call, the resulting string would be **backward**!

为什么？因为递归是从**最内层**开始返回的。最先返回的是**最高位**（最高位字符在字符串拼接的最前面）。

模拟 `toStr(10, 2)` → 期望 `"1010"`：

```
toStr(10, 2)
  → toStr(5, 2) + "0"        ← 10 % 2 = 0
    → toStr(2, 2) + "1"      ← 5 % 2 = 1
      → toStr(1, 2) + "0"    ← 2 % 2 = 0
        → "1"                ← 1 < 2，base case
      → "1" + "0" = "10"
    → "10" + "1" = "101"
  → "101" + "0" = "1010"
```

✅ 顺序对了。

如果反过来写：

```cpp
return convertString[n%base] + toStr(n/base, base);   // ❌ 倒了
```

会得到 `"0101"` ——位反了。

### 15.6 与栈的联系

> This should remind you of our discussion of stacks back in the previous chapter.

延迟拼接 = 等递归调用栈"展开"时再合并 = 隐式使用了**调用栈作为反序的容器**。这是 §16 的过渡。

### 15.7 Self Check（练习）

cppds 给了两个练习题（自己实现）：

1. **reverse string**：写一个函数把字符串倒序
2. **palindrome**：写一个函数判断字符串是否回文（"radar"、"madam i'm adam" 等）

提示：都可以用递归——base case 是空串或单字符。

---

## 16. Stack Frames：递归在底层的实现

> 对应 cppds 5.6 + PPT slide 26-27

### 16.1 想法：用显式栈代替递归

把上一节的 toStr 改写：不用递归，而是**手动维护一个栈**：

```cpp
#include <iostream>
#include <string>
#include <stack>
using namespace std;

stack<char> rStack;

string toStr(int n, int base) {
    string convertString = "0123456789ABCDEF";
    while (n > 0) {
        if (n < base) {
            rStack.push(convertString[n]);
        } else {
            rStack.push(convertString[n % base]);
        }
        n = n / base;
    }
    string res;
    while (!rStack.empty()) {
        res = res + (string(1, rStack.top()));
        rStack.pop();
    }
    return res;
}

int main() {
    cout << toStr(1453, 16);    // 5AD
}
```

关键步骤：
- 每次产生一个余数字符 → push 到栈
- 数字处理完后，循环 pop → 自然是倒序（后进先出 = 反转）

### 16.2 启示：递归 = 隐式使用调用栈

> 💡 **Key Insight**（cppds 原文）：
> 当函数被调用时，C++ 会分配一个 **stack frame** 来处理函数的局部变量。函数返回时，**返回值留在栈顶**，让调用方使用。

| 显式栈版本 | 递归版本 |
|---|---|
| `rStack.push(...)` | 函数调用 → 新 frame 入栈 |
| `rStack.pop()` | 函数 return → frame 出栈 |
| 你手动管理栈 | 编译器/运行时管理调用栈 |

### 16.3 Stack Frame 是什么

每个**stack frame**包含：
- 函数的**局部变量**
- **参数**（实参的副本，对于值传递）
- **返回地址**（return 时跳到哪里）
- **返回值的存储位置**

调用 `toStr(10, 2)` 时的调用栈状态（简化）：

```
┌───────────────────────────┐
│  toStr(1, 2)              │  栈顶 = 当前活动帧
│  n = 1, base = 2          │
│  return "1"               │
├───────────────────────────┤
│  toStr(2, 2)              │
│  n = 2, base = 2          │
│  待计算: toStr(1,2) + "0" │
├───────────────────────────┤
│  toStr(5, 2)              │
│  n = 5, base = 2          │
│  待计算: toStr(2,2) + "1" │
├───────────────────────────┤
│  toStr(10, 2)             │
│  n = 10, base = 2         │
│  待计算: toStr(5,2) + "0" │
├───────────────────────────┤
│  main()                   │
└───────────────────────────┘
```

每个 frame 提供一个**独立的 scope**——尽管递归调用的是同一个函数，每次调用的 `n`、`base` 都是各自帧里的局部变量。

### 16.4 与 Python 的对比

```
Python    : "stack frame" / 调用栈完全隐式管理
C++       : 同上，但栈空间有限（典型 1-8 MB）
            → 太深的递归会 stack overflow（如 factorial(100000)）
```

> ⚠️ **C++ 中递归深度不能太深**——栈空间通常只有几 MB，几千层递归就可能爆栈。Python 默认递归深度 1000（可以调）。

---

## 17. 可视化递归：Turtle 图形

> 对应 cppds 5.7

### 17.1 为什么用 turtle？

递归的"心智模型"难以建立——画图可能比读代码更直观。

Python 标准库自带 `turtle` 模块，C++ 没有原生 turtle，但可以用 `Turtle.cpp`（GitHub 上有提供：`https://github.com/CodyWMitchell/visual-recursion`）。

### 17.2 例子 1：drawSpiral（画螺旋）

Python 版：

```python
import turtle
def drawSpiral(myTurtle, lineLen):
    if lineLen > 0:
        myTurtle.forward(lineLen)
        myTurtle.right(90)
        drawSpiral(myTurtle, lineLen - 5)

def main():
    myTurtle = turtle.Turtle()
    myWin = turtle.Screen()
    drawSpiral(myTurtle, 100)
    myWin.exitonclick()
main()
```

C++ 等价：

```cpp
void drawSpiral(Turtle myTurtle, int lineLen) {
    if (lineLen > 0) {
        myTurtle.forward(lineLen);
        myTurtle.right(90);
        drawSpiral(myTurtle, lineLen - 5);
    }
}
```

- Base case：`lineLen <= 0`（直接返回）
- Recursive case：画一条线、转 90 度、继续画一条更短的螺旋

### 17.3 例子 2：分形树（Fractal Tree）

> 一棵树 = 一根树干 + 一棵更小的右子树 + 一棵更小的左子树

```python
def tree(branchLen, t):
    if branchLen > 5:
        t.forward(branchLen)
        t.right(20)
        tree(branchLen - 15, t)
        t.left(40)
        tree(branchLen - 15, t)
        t.right(20)
        t.backward(branchLen)
```

C++ 版（在 Turtle.cpp 中提供）：

```cpp
void tree(double branchLen, Turtle t) {
    if (branchLen > 5) {
        t.forward(branchLen);
        t.right(20);
        tree(branchLen - 15, t);
        t.left(40);
        tree(branchLen - 15, t);
        t.right(20);
        t.forward(-branchLen);
    }
}
```

绘制顺序：
- 先画完整个**右子树**（一直深入到最右下的 twig）
- 然后画**左子树**（同样的递归过程）
- 这是因为递归调用顺序：右先于左

> 💡 **Key Insight**：**每个分叉点**对应一次**递归调用**。fractal tree 显示了递归如何在视觉上"展开"。

### 17.4 自查练习

cppds 提示几个改进方向：
- 让线条粗细随 branchLen 变化
- 让颜色随 branchLen 变化（短的画成绿色 = 叶子）
- 让转角度随机化（更自然）
- 让 branchLen 减少量随机化

---

## 18. Sierpinski 三角形

> 对应 cppds 5.8

### 18.1 问题

Sierpinski 三角形是**自相似**的分形——每一部分看起来都和整体一样。

绘制方法：
1. 画一个大三角形
2. 把它分成 4 个小三角形（连接每条边的中点）
3. 忽略中间那个倒三角，对剩下 3 个角的小三角形**递归**应用同样的过程

### 18.2 三路递归

每次有**三个递归调用**——这是和之前所有例子的不同点（之前都是一路或两路）。

```python
def sierpinski(points, degree, myTurtle):
    drawTriangle(points, colormap[degree], myTurtle)
    if degree > 0:
        sierpinski([points[0],
                    getMid(points[0], points[1]),
                    getMid(points[0], points[2])],
                   degree-1, myTurtle)            # 左下角
        sierpinski([points[1],
                    getMid(points[0], points[1]),
                    getMid(points[1], points[2])],
                   degree-1, myTurtle)            # 顶部
        sierpinski([points[2],
                    getMid(points[2], points[1]),
                    getMid(points[0], points[2])],
                   degree-1, myTurtle)            # 右下角
```

### 18.3 base case：degree

> 既然可以无限递归下去，base case 是什么？
> 答：**degree** —— 我们要分割多少层，作为人为设定的截止。

每次递归把 degree -1，到 0 就停止。

### 18.4 绘制顺序

调用图是一棵**三叉树**：
- 总是先递归到**左下**最深处
- 然后回溯，处理**顶部**
- 最后处理**右下**

> 💡 这种 "depth-first, leftmost-first" 顺序是函数式风格递归的标志。

### 18.5 helper 函数

- `getMid(p1, p2)`：返回两点的中点（坐标平均）
- `drawTriangle(points, color, turtle)`：用 `begin_fill` / `end_fill` 画填充三角形

---

## 19. 汉诺塔（Tower of Hanoi）

> 对应 cppds 5.10

汉诺塔（§19）和走迷宫（§20）是 cppds 5.10–5.11 给的两个经典例子——它们用迭代非常难写，用递归却**优雅而易懂**。本节先看汉诺塔。

> 后续 cppds 5.12 是 dynamic programming，不在 Week 5 阅读范围。

### 19.1 问题

法国数学家 Édouard Lucas 1883 年发明的谜题。传说印度寺庙里给年轻僧侣这道题：

> 三根柱子，64 个金盘（一个比一个小）。把所有 64 个盘从一根柱子转移到另一根，规则：
> 1. 一次只能移动一个盘
> 2. 大盘**不能**放在小盘上

僧侣们以"每秒移一次"的速度工作。他们完成时世界就毁灭。

> 别担心，移动 64 个盘需要 $2^{64} - 1 = 18,446,744,073,709,551,615$ 次。每秒一次也要 **5849 亿年**！

### 19.2 递归思路（关键）

如果你已经知道怎么把 4 个盘的塔从 A 移到 B，那 5 个盘的就简单了：
1. 把上面 4 个盘移到 B（用 C 作中转）
2. 把最底下的盘从 A 移到 C
3. 把那 4 个盘从 B 移到 C（用 A 作中转）

但你怎么知道怎么移 4 个盘的塔？同样的逻辑：先移 3 个盘的塔……

最终归到：**移 1 个盘的塔**——这是 **base case**。

### 19.3 高层算法

> 把高度 N 的塔从 source 移到 destination（用 intermediate 作中转）：
> 1. 把高度 N-1 的塔从 source 移到 intermediate（用 destination 作中转）
> 2. 把剩下的那个盘从 source 移到 destination
> 3. 把高度 N-1 的塔从 intermediate 移到 destination（用 source 作中转）

### 19.4 代码

```cpp
#include <iostream>
using namespace std;

void moveDisk(char fp, char tp) {
    cout << "moving disk from " << fp << " to " << tp << endl;
}

void moveTower(int height, char fromPole, char toPole, char withPole) {
    if (height >= 1) {
        moveTower(height-1, fromPole, withPole, toPole);
        moveDisk(fromPole, toPole);
        moveTower(height-1, withPole, toPole, fromPole);
    }
}

int main() {
    moveTower(3, 'A', 'B', 'C');
}
```

### 19.5 关键点

- **base case**：`height < 1` 时函数直接返回，什么都不做
- 注意 **withPole 和 toPole 的角色**在两次递归中**互换**（这是关键）：
  - 第一次递归：要把 height-1 移到 withPole，所以 withPole 是目的地
  - 第二次递归：要从 withPole 移走，所以 fromPole 是 withPole

### 19.6 为什么不用显式 Stack？

> Now that you have seen the code for both moveTower and moveDisk, you may be wondering why we do not have a data structure that explicitly keeps track of what disks are on what poles. ... The answer is that **C++ provides the stacks that we need implicitly through the call stack**.

也就是说：
- 我们在概念上需要 3 个栈（每根柱子一个），分别记录哪些盘在上面
- 但代码里**完全没有显式 stack**——递归调用栈隐式地完成了这件事

### 19.7 复杂度分析

`moveTower(n, ...)` 的次数 $T(n)$ 满足：

$$T(n) = 2 T(n-1) + 1$$

解：$T(n) = 2^n - 1$

这就是为什么 64 个盘需要 $2^{64} - 1$ 步。

### 19.8 输出（n=3 的运行结果）

```
moving disk from A to B
moving disk from A to C
moving disk from B to C
moving disk from A to B
moving disk from C to A
moving disk from C to B
moving disk from A to B
```

7 步 = $2^3 - 1$。

---

## 20. 走出迷宫（Exploring a Maze）

> 对应 cppds 5.11

### 20.1 问题

让一只 turtle 找到迷宫的出口。迷宫由格子组成，每格要么开放要么是墙。Turtle 只能走开放的格子。

### 20.2 算法：递归回溯

从当前位置开始，按顺序尝试 4 个方向：

> - 先试**北方**一步，从那里递归继续
> - 北方失败，试**南方**
> - 南方失败，试**西方**
> - 西方失败，试**东方**
> - 都失败 → 此路不通

### 20.3 关键：避免无限循环

> 麻烦在于：如果北方走不通试南方，南方就回到了原位置——再递归就会无限来回走。

**解决**：**面包屑**（breadcrumb）。每走过一格就标记，下次再来到这格就直接回退。

### 20.4 四个 base case

```
1. Turtle 撞墙 (OBSTACLE)         → return False
2. Turtle 走到已经探索过的格子   → return False
3. Turtle 找到外边沿（出口）     → return True
4. Turtle 四个方向都试过都失败   → 死胡同，return False
```

### 20.5 代码（Python，C++ 自己实现）

```python
def searchFrom(maze, startRow, startColumn):
    maze.updatePosition(startRow, startColumn)

    # base case 1: 撞墙
    if maze[startRow][startColumn] == OBSTACLE:
        return False

    # base case 2: 已探索过
    if maze[startRow][startColumn] == TRIED:
        return False

    # base case 3: 找到出口
    if maze.isExit(startRow, startColumn):
        maze.updatePosition(startRow, startColumn, PART_OF_PATH)
        return True

    # 标记已探索
    maze.updatePosition(startRow, startColumn, TRIED)

    # 递归尝试 4 个方向（短路求值）
    found = searchFrom(maze, startRow-1, startColumn) or \
            searchFrom(maze, startRow+1, startColumn) or \
            searchFrom(maze, startRow, startColumn-1) or \
            searchFrom(maze, startRow, startColumn+1)

    if found:
        maze.updatePosition(startRow, startColumn, PART_OF_PATH)
    else:
        maze.updatePosition(startRow, startColumn, DEAD_END)
    return found
```

### 20.6 关键点：短路求值（short-circuit evaluation）

```python
found = searchFrom(...) or searchFrom(...) or searchFrom(...) or searchFrom(...)
```

`or` 运算符是**短路**的：第一个返回 True 就不会执行后面的。这意味着：
- 如果北方走得通，南西东**根本不会**被探索
- 如果北方失败，再试南方，依此类推
- 4 个递归调用全部 False → 死胡同

### 20.7 self check（C++ 实现）

cppds 把整个迷宫程序的 C++ 实现作为练习留给学生。需要：
- 文件 IO（读迷宫文件）
- 类（Maze）
- ASCII 输出（用 cout 替代 turtle）

格式示例：
```
7 5

+++++++
+--+-S+
+--+--+
-----++
+++++++
```
（"+" 是墙，"-" 是路径，"S" 是起点）

---

## 21. 链表与递归的天然结合

> 对应 PPT slide 28，是 Reading 和 PPT 之间的桥梁

### 21.1 链表本身就是递归定义的

链表的定义是**递归的**：

> A list is either:
> - empty (nullptr), OR
> - a node followed by a list

这就是一个**递归数据结构**。处理它最自然的方式就是**递归**。

### 21.2 length 的递归实现

```cpp
int length(Node *L) {
    if (L == nullptr)
        return 0;
    return 1 + length(L->next);
}
```

- Base case：空链表长度 0
- Recursive case：1 + 剩下的长度

### 21.3 print 的递归实现

```cpp
void print(Node *L, ostream &out) {
    if (L != nullptr) {
        out << L->data << ' ';
        print(L->next, out);
    }
}
```

或者倒序打印（先递归再打印）：

```cpp
void printReverse(Node *L, ostream &out) {
    if (L != nullptr) {
        printReverse(L->next, out);
        out << L->data << ' ';
    }
}
```

> 💡 这里和 §15.5 的 toStr 同源——**先递归再操作**就得到逆序输出。

### 21.4 copy 的递归实现

```cpp
Node * copy(Node *L) {
    if (L == nullptr) return nullptr;
    return new Node{L->data, copy(L->next)};
}
```

非常简洁——但要小心：长链表会爆栈。

### 21.5 列表递归 vs 列表迭代：什么时候用哪个？

| 用递归 | 用迭代 |
|---|---|
| 代码更简洁、更接近问题本质 | 数据规模大、栈受限 |
| 函数式风格（不修改原结构） | 性能敏感 |
| 自然递归的算法（reverse、copy） | 单次遍历的简单操作 |

> ⚠️ HW5 的 String 实现里两种风格都会用到——根据每个 helper 的需求选择。

---

## 22. SLL 之外的链式数据结构（前瞻）

> 对应 PPT slide 38-41 — ⚠️ **超出本课程主线**：DLL / BST / Graph 属于 ICS 46（Data Structures）范围（已与 Week 6 核对，Week 6 是继承与多态，不覆盖这些）。PPT 在这里提了，作为 "SLL 是基础" 的扩展

阅读清单**没有**这部分，但 Klefstad 的 PPT slide 38 明确说：

> SLL is the foundation for data structures. Master SLL BEFORE class in data structures.
> Here are some linked structures you will see…

### 22.1 双向链表（Doubly Linked Lists, DLL）

```
null ◄── [prev | H | next] ◄──► [prev | E | next] ◄──► ... ──► null
                ↑
              head
```

- 每个节点有 **prev、data、next** 三个字段
- 优点：可以前后双向遍历；任意位置的插入/删除都是 O(1)
- 缺点：每个节点多一个指针字段；操作时要同时维护两个方向的指针

### 22.2 二叉搜索树（Binary Search Tree, BST）

```
           [A]
          /   \
        [B]   [C]
        / \   / \
      [D] [E][F][G]
       / \
     [H] [I]
```

每个节点有 left 和 right 两个 child。BST 的性质：左 < 根 < 右。是 ICS 46 的核心内容。

### 22.3 图（Graph）

一组节点 + 它们之间的边（可能有权重、有方向）。
PPT slide 41 给的例子是城市之间的航线图（Dallas、Austin、Atlanta...）。是 ICS 46 / 162 的内容。

> ⚠️ Week 5 不会考这些，但 PPT 在这里提是为了强调：**SLL 是所有这些复杂结构的基础**。

---

## 23. typedef 简介

> 对应 PPT slide 50 — ⚠️ **基础 C++ 特性，不在 Week 5/6 阅读清单**（Week 6 是继承与多态，未涉及 typedef）。这里作为 PPT 提到的延伸概念保留

`typedef` 是 C++ 的特性，给类型起一个新名字：

```cpp
typedef int * IntPointer;
IntPointer p = nullptr;        // p 是 int*

typedef char Buffer[20];
Buffer buf;                    // buf 是 char[20]

typedef Node * List;           // List 是 Node* 的别名
```

> 💡 现代 C++（C++11+）推荐用 `using` 替代 typedef：
> ```cpp
> using IntPointer = int *;
> using List = Node *;
> ```
> 二者等价，但 `using` 语法更清晰，且支持模板别名。

---

## 24. Week 5 综合速查表

### 24.1 链表 vs 数组 vs Vector

| | C 数组 | std::vector | 链表（SLL） |
|---|---|---|---|
| 内存 | 连续 | 连续（堆） | 分散 |
| 大小 | 编译时已知 | 动态 | 动态 |
| 索引 | O(1) | O(1) | O(n) |
| 头部插入 | 不可（必须扩容+移） | O(n) | **O(1)** |
| 末尾插入 | 不可 | 摊销 O(1) | O(n)（朴素）/ O(1)（有 tail） |
| 中间插入 | 不可 | O(n) | O(1)（已知位置） |
| 删除 | 不可 | O(n) | O(1)（已知位置） |
| 内存开销 | 0 | 0~增长因子 | 每节点多一指针 |

### 24.2 SLL 操作复杂度（cppds UnorderedList）

| 方法 | 复杂度 | 备注 |
|---|---|---|
| `isEmpty` | O(1) | 只查 head |
| `add`（头插） | O(1) | 改两个指针 |
| `size` | O(n) | 必须遍历 |
| `search` | O(n) | 最坏遍历到末尾 |
| `remove` | O(n) | 必须先 search 再删 |
| `append`（朴素） | O(n) | 必须遍历到末尾 |
| `append`（带 tail） | O(1) | 但需维护 tail |

### 24.3 Klefstad 命名 vs cppds 命名对照

| Klefstad | cppds |
|---|---|
| `push(c)` | `add(item)` |
| `pop()` | (留作练习) |
| `find(c)` | `search(item)` |
| `length()` | `size()` |
| `last(L)` | (留作练习) |
| `copy(L)` | (deep copy 需自实现) |
| `free(L)` | 析构函数 |

### 24.4 递归三大法则速记

```
┌──────────────────────────────────────┐
│  1. 必须有 Base Case                 │
│  2. 必须改变状态、向 Base Case 靠近  │
│  3. 必须调用自己                     │
└──────────────────────────────────────┘
```

### 24.5 递归常见模式

| 模式 | 例子 | 关键 |
|---|---|---|
| 累积型 | sumN, factorial | base case + n * f(n-1) |
| 列表型 | listsum, length | base case (空 list) + first + f(rest) |
| 分治型 | Tower of Hanoi, Sierpinski | base case + 多次 self call |
| 回溯型 | maze | 4 个 base case + 多方向尝试 + 标记已访问 |
| 转换型 | toStr | 先递归再拼接 → 自动反转 |

### 24.6 Python ↔ C++ 对比（Week 5 重点）

| Python | C++ | 说明 |
|---|---|---|
| `class Node:` 自动有 `__init__`、属性可加 | `class Node { ... };` 必须显式声明字段 | C++ 字段类型固定，需要构造器 |
| `list[1:]` 切片 | `vector(it+1, end)` 手动构造 | C++ 没切片语法 |
| `None` | `nullptr`（C++11+）/ `NULL`（旧）/ `0` | nullptr 类型安全 |
| `del obj` | `delete ptr;` | 手动管理 |
| `__del__` 不可靠 | `~ClassName()` 自动调用，时机确定 | RAII 的基础 |
| 递归深度默认 1000 | 系统栈 ~MB 级，深度有限 | 大递归小心爆栈 |
| `sys.setrecursionlimit(...)` | 没有简单方法调整 | 需要切换迭代 |

### 24.7 Klefstad 警句（PPT 摘录）

| 警句 | 含义 |
|---|---|
| "Singly Linked List is the foundation for data structures" | SLL 是所有复杂数据结构的基础 |
| "Master SLL BEFORE class in data structures" | 学好 SLL 再学 ICS 46 / 数据结构 |
| "linked list should only be used as implementation of classes" | 链表只用作类的内部实现，不暴露给外部 |
| "Resource Acquisition Is Initialization (RAII)" | 用类封装资源，构造获得、析构释放 |
| "Who owns the heap memory? Our decision!" | 显式设计内存所有权 |
| "delete head; head = head->next" | ❌ 经典 dangling reference 例子 |
| "head->next = head->next->next" | ❌ 反模式：链式 next |
| "head->next->next->next->next->next = head" | ❌ 反模式：制造环 |

### 24.8 易错点清单

| # | 错误 | 后果 | 防范 |
|---|---|---|---|
| 1 | add 时颠倒了两步顺序 | 整个链表丢失（泄漏） | 先 setNext，再改 head |
| 2 | 析构 / free 时先 delete 再访问 next | dangling pointer，UB | 先保存 temp，前进，再 delete |
| 3 | remove 假设元素一定存在 | 不存在时 segfault | 加入 `current != nullptr` 检查 |
| 4 | copy constructor 依赖默认（memberwise） | shallow copy → double-free | 写 deep copy（Rule of Three） |
| 5 | 多个 String 共享链表内存 | 双重释放 | RAII：每个对象独占资源 |
| 6 | 用 head 直接当遍历变量 | 链表"丢失"入口 | 用临时指针 p 或 current |
| 7 | 链式 next 太长 | 不可读、易 NPE | 拆成多步 |
| 8 | 制造环（cycle） | 遍历死循环 | 永远不要让节点的 next 指回前面 |
| 9 | 递归忘了 base case | 栈溢出 | 三大法则自查 |
| 10 | factorial 的 base case 选 `n == 1` | fact(0) 无限递归 | 用 `n <= 1` |
| 11 | toStr 反向写：`convString[n%base] + toStr(...)` | 结果位反 | 先递归调用，后拼接 |
| 12 | C++ 递归太深 | stack overflow | 大数据量用迭代 |
| 13 | 改写链表时忘了考虑空表 | NPE | 每个 helper 第一行检查 nullptr |
| 14 | attach 当成 append 用 | 共享内存 → 双重释放 | append 带 copy；attach 用于明确所有权转移 |

---

## 25. Week 5 最重要的五条记忆

1. **链表的两步插入顺序绝不能反**：`temp->setNext(head); head = temp;`。先连 next，再改 head。反了就丢失整个链表（或自循环）。这是 add 的核心，也是所有链表操作的基础顺序原则。

2. **链表内存管理：先保存指针，再前进，最后 delete**。无论是析构、free、还是 pop，凡是涉及"删除节点 + 移动指针"的循环，都必须遵守这个顺序。`delete p; p = p->next;` 永远是 dangling reference，永远是 UB。

3. **RAII + Rule of Three 是链表类的灵魂**：任何持有 `Node *head` 的类，必须自定义**析构、copy 构造、copy 赋值**（C++11 后再加移动构造、移动赋值），且 copy 必须是 **deep copy**。默认的 memberwise init 给的是 shallow copy，会导致 double-free。

4. **递归三大法则**——**Base Case、改变状态向 Base Case 靠近、调用自己**。每写一个递归函数都要用这三条自查。最常见的 bug 是 base case 选错（如 fact 用 `n == 1` 而不是 `n <= 1`），或者递归调用时输入没变小（如 `f(n) = f(n)`）。

5. **递归的"延迟拼接"模式**：先 recursive call，再用返回值做计算。这种顺序让递归**自动反转**——这是 toStr、链表反向打印、汉诺塔思路的共同核心。如果反过来"先操作再递归"，结果通常是错的。等价说法：递归调用栈本身就是一个隐式的 stack。

---

> **本笔记覆盖**：
> - cppds 4.1（Objectives）+ 4.2（What Are Linked Structures）+ 4.3（Implementing Unordered Linked List）+ 4.4（Node Class）+ 4.5（Unordered Linked List Class） — 完整覆盖
> - cppds 5.1（Objectives）+ 5.2（What Is Recursion）+ 5.3（Sum of Vector）+ 5.4（Three Laws） — 详细覆盖（重点章节）
> - cppds 5.5（Convert Integer to String）+ 5.6（Stack Frames）+ 5.7（Visualizing Recursion）+ 5.8（Sierpinski）+ 5.9（Complex Recursive Problems）+ 5.10（Tower of Hanoi）+ 5.11（Maze） — 标准覆盖
> - PPT *Linked List & Recursion*（Klefstad）— 几乎全部融合（CharList、namespace list 设计、Insert/Delete 操作、RAII、内存所有权、Shallow vs Deep Clone、List Recursion）
>
> **PPT 中超出本周阅读清单的内容**（DLL、BST、Graph、typedef）已在第 22 节和第 23 节标注。经与 Week 6（继承与多态）核对，这些主题均不在 Week 6 范围内：DLL / BST / Graph 属于 ICS 46（Data Structures），typedef 是通用 C++ 特性。两节内容保留作为 PPT 延伸阅读。
>
> **未覆盖**：CppCon 2021 视频 *Back to Basics: Pointers* — 阅读清单标为"if needed"，本笔记未深入。
