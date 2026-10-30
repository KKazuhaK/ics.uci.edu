---
title: "Reading Notes"
summary: "Linked lists (Node, UnorderedList, CharList), namespace list helpers, RAII for linked structures, and the Three Laws of Recursion (Tower of Hanoi, maze, Sierpinski)."
---

# Information and Computer Science 45C — Week 5 Integrated Reading Notes

## Table of Contents

- [1. Weekly Learning Objectives](#1-weekly-learning-objectives)
- [2. What Are Linked Structures](#2-what-are-linked-structures)
- [3. Core Idea of a Linked List](#3-core-idea-of-a-linked-list)
- [4. The Node Class (Building Block of Linked Lists)](#4-the-node-class-building-block-of-linked-lists)
- [5. The Full UnorderedList Class Implementation](#5-the-full-unorderedlist-class-implementation)
- [6. Klefstad-style CharList Implementation](#6-klefstad-style-charlist-implementation)
- [7. SLL Modification Operations (Add / Insert / Delete)](#7-sll-modification-operations-add--insert--delete)
- [8. The `namespace list` Design Pattern (PPT-only)](#8-the-namespace-list-design-pattern-ppt-only)
- [9. Shallow Clone vs. Deep Clone](#9-shallow-clone-vs-deep-clone)
- [10. Linked List Memory Management & RAII](#10-linked-list-memory-management--raii)
- [11. Recursion Chapter Objectives](#11-recursion-chapter-objectives)
- [12. What Is Recursion](#12-what-is-recursion)
- [13. Summing a Vector Recursively](#13-summing-a-vector-recursively)
- [14. The Three Laws of Recursion (Key)](#14-the-three-laws-of-recursion-key)
- [15. Converting an Integer to a String in Any Base](#15-converting-an-integer-to-a-string-in-any-base)
- [16. Stack Frames: How Recursion Is Implemented](#16-stack-frames-how-recursion-is-implemented)
- [17. Visualizing Recursion: Turtle Graphics](#17-visualizing-recursion-turtle-graphics)
- [18. The Sierpinski Triangle](#18-the-sierpinski-triangle)
- [19. Tower of Hanoi](#19-tower-of-hanoi)
- [20. Exploring a Maze](#20-exploring-a-maze)
- [21. Linked Lists and Recursion: A Natural Fit](#21-linked-lists-and-recursion-a-natural-fit)
- [22. Linked Structures Beyond SLL (Look-Ahead)](#22-linked-structures-beyond-sll-look-ahead)
- [23. typedef Brief Intro](#23-typedef-brief-intro)
- [24. Week 5 Comprehensive Cheat Sheet](#24-week-5-comprehensive-cheat-sheet)
- [25. Top Five Takeaways for Week 5](#25-top-five-takeaways-for-week-5)

> UCI ICS 45C: Programming in C++ (35770)
> These notes integrate Week 5 assigned reading cppds 4.1–4.5 (Linked Lists) and cppds 5.1–5.11 (Recursion, with focus on 5.1–5.4), together with Professor Klefstad's PPT lecture *Linked List & Recursion*. Content is organized by concept, with each section fusing the original reading + PPT code examples + Klefstad's aphorisms + common-pitfall callouts.
> Some PPT content may extend into Week 6; anything outside the explicit reading list is marked with ⚠️.

---

## 1. Weekly Learning Objectives

> Corresponds to cppds 4.1 (Linked Structures) + cppds 5.1 (Recursion)

### 1.1 Linked Lists Portion (from cppds 4.1)

- Understand: lists that depend on **contiguous memory** (arrays, vectors) are only one of many list structures
- Learn: a linked list is another list-like data structure that **does not require contiguous memory**
- Code: write C++ that manipulates linked lists
- Visualize: describe linked lists with node + pointer diagrams
- Implement: know how singly and doubly linked lists are implemented in C++
- Understand the abstract data types: **Node** and **Linked List** (both Unordered and Ordered variants)

### 1.2 Recursion Portion (from cppds 5.1)

- Understand: complex problems may have simple recursive solutions
- Learn: how to express programs recursively
- Master: the **Three Laws of Recursion** and apply them
- Perspective: view recursion as a special form of iteration
- Implement: turn a problem's recursive form into code
- Under the hood: understand how computer systems implement recursion (stack frames)

---

## 2. What Are Linked Structures

> Corresponds to cppds 4.2

### 2.1 Definition

A **linked data structure** = a collection of data structures called **nodes**, connected to each other by **references or pointers**.

Linked structures include:
- **Linear linked structures**: linked lists (Linked Lists), divided into ordered and unordered variants
- **Tree structures**: various trees

This week (and the rest of ICS 45C) focuses on **linear linked structures**.

### 2.2 Analogy: OS Time-Slicing

Think of a linked structure like an operating system's **multitasking** (timesharing):

> Computers don't actually do everything at once — they switch quickly between tasks, giving the illusion of seamlessness. It's like trying to listen to three people talking, read a book, and sing all at once: you only catch fragments of each.

Operating systems implement this scheduling with a **circular linked list**. Each task is a node; the OS walks the list and gives each task a small slice of CPU time. That's why your computer slows down when you have many browser tabs open — switching overhead grows.

> 💡 **Abstract idea**: linked-list nodes don't have to be adjacent in memory, but pointers organize them into a **logical order**. This is one of the earliest examples of separating data structure from physical storage.

---

## 3. Core Idea of a Linked List

> Corresponds to cppds 4.3 + PPT slides 2-4

### 3.1 Definition

> 💡 **Key Definition**: A **linked list** is a linear collection of data elements whose order is not determined by the placement in memory. Instead, each element is stored in a node which points to the next node.

### 3.2 Fundamental Comparison vs. Arrays

| Property | Array / vector | Linked List |
|---|---|---|
| Memory layout | Contiguous | Scattered, threaded by pointers |
| Random access `A[i]` | O(1) — 2~3 machine instructions | O(n) — must traverse |
| Growth | Reallocate + copy | Just attach a new node |
| Mid-insertion | O(n) — shift later elements | O(1) — change two pointers |
| Size | Known at compile time (stack array) or via explicit `new[]` | Fully dynamic |
| Memory waste | Wasted when overprovisioned | None (allocate on demand, but each node carries a pointer field) |

### 3.3 Why Learn Linked Lists?

- They can **grow / shrink dynamically** — something contiguous arrays can't do
- You can **insert at any middle position**
- They are the **foundation for more complex data structures** (trees, graphs, separate-chaining hash tables)

> ⚠️ **Klefstad tip**: linked lists should only be **used as the implementation of classes** ("should only be used as implementation of classes"), not exposed in user code. This hides pointer details and avoids dangling, leak, and redundant-delete.

### 3.4 Visualizing a Linked List

```
head ──► [H | next] ──► [E | next] ──► [A | next] ──► [P | next] ──► null
```

- `head` is the external entry pointer; you must explicitly record the location of the first node
- Each node stores **data + a next pointer**
- The last node's next points to `nullptr`, marking end-of-list
- An empty list has `head == nullptr`

---

## 4. The Node Class (Building Block of Linked Lists)

> Corresponds to cppds 4.4 + PPT slide 5

### 4.1 What Must a Node Store?

Every node stores at least two things:

1. **Data field**: the list element itself
2. **Next pointer**: a reference to the successor node

### 4.2 The cppds Textbook Node Class (int data)

```cpp
#include <iostream>
using namespace std;

class Node {
private:
    int data;       // the data inside the node
    Node *next;     // pointer to the next node

public:
    Node(int initdata) {
        data = initdata;
        next = nullptr;     // initialize to nullptr — important!
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

Constructing a node:

```cpp
Node *temp = new Node(93);
// temp now points to a node with data=93, next=nullptr
```

> 💡 **Key Insight**: initializing `next` to `nullptr` in the constructor is critical — this is called **"grounding the node"**. If you forget, `next` is an uninitialized wild pointer, and accessing it is UB.

### 4.3 PPT-style Node (More Compact)

The Klefstad PPT version uses a `struct` with `char` data:

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

> ⚠️ Klefstad notes: the names `data` and `next` are **standard conventions** — everyone uses the same names so we all "speak the same language." Don't use `info` or `link`.

### 4.4 struct vs class Choice

Recap of Week 3 (struct vs class):

| Aspect | struct | class |
|---|---|---|
| Default access | public | private |
| Use when | Simple data aggregate, all fields exposed | Encapsulation needed, invariants to maintain |

The PPT uses `struct Node` because Node is just a simple data + next container — no encapsulation needed. Letting the data field be accessed directly is fine (used internally inside the list implementation). cppds uses `class Node` with getter/setter, leaning more OO.

### 4.5 Diagram Convention

```
[93 |·]──►   (contains data 93, next is an arrow)
```

Or simplified:

```
[93]──►
```

---

## 5. The Full UnorderedList Class Implementation

> Corresponds to cppds 4.5

This section is the **most central** part of the linked-list portion of Week 5. The Reading uses cppds's `UnorderedList` (int data, methods named `add` / `size` / `search` / `remove` in English), the PPT uses Klefstad's `CharList` (char data, methods named `push` / `find`) — the same thing under different names. We'll follow cppds primarily and cross-reference the PPT.

### 5.1 Class Structure (Only `head` as a Member)

```cpp
class UnorderedList {
public:
    Node *head;

    UnorderedList() {
        head = nullptr;
    }
};
```

> 💡 **Key Insight**: a linked-list object **holds only one pointer** — `head`, pointing to the first node. All other nodes are reached by walking next from head.

> ⚠️ **Important**: the UnorderedList class **does not contain any node objects itself**. It only holds a pointer to the first node. This is very different from the intuition that "an array class contains an array."

### 5.2 isEmpty Method

```cpp
bool isEmpty() {
    return head == nullptr;
}
```

Very simple — head is nullptr means empty.

> 💡 This is why nullptr is so useful: it's the unified "end of list" sentinel, keeping the constructor (creating an empty list) and the isEmpty check consistent.

### 5.3 add Method (Head Insertion)

Since the list is unordered, you can add new elements anywhere. **The easiest position is at the head** — head is the only entry point.

```cpp
void add(int item) {
    Node *temp = new Node(item);
    temp->setNext(head);    // Step 1: new node's next points to old head
    head = temp;            // Step 2: update head to point to the new node
}
```

#### Critical: Order of the Two Steps

> ⚠️ **Wrong order = disaster**: you must first call `temp->setNext(head)`, **then** `head = temp`.

If reversed:

```cpp
// ❌ Wrong order
head = temp;            // head now points to the new node, but old list is lost!
temp->setNext(head);    // next points to itself → self-loop
```

If you change head first, the old list has no external reference left to find — **the entire list leaks**!

#### Equivalent Diagram (PPT slide 8)

```
Original: head ──► [H]──►[E]──►[A]──►[P]──►null

Execute head = new Node('C', head):
                  ┌──► [H]──►[E]──►[A]──►[P]──►null
        head ──► [C]┘

Concise form: head = new Node{'C', head};
```

> 💡 **Klefstad PPT style**: brace-initialization combines the two steps into one:
> ```cpp
> head = new Node{c, head};   // note: head on the RHS is read first, then assigned to the LHS
> ```
> This requires Node to have a `Node(char, Node*)` constructor, or to be a struct supporting aggregate init.

#### Note on Order

PPT slide 6 mentions:

```cpp
push(c) ── called 6 times: 'A', 'B', ..., 'F'
```

Because we head-insert, **the first element added ends up at the tail**. For example in the cppds case:

```cpp
mylist.add(31);  // 31 is inserted first, ends up last
mylist.add(77);
mylist.add(17);
mylist.add(93);
mylist.add(26);
mylist.add(54);  // 54 is added last, ends up first
// List order: 54 → 26 → 93 → 17 → 77 → 31
```

### 5.4 size Method (Linked List Traversal Pattern)

`size`, `search`, and `remove` all rely on a technique called **linked list traversal**.

```cpp
int size() {
    Node *current = head;       // start: head
    int count = 0;
    while (current != nullptr) {  // end: nullptr
        count++;
        current = current->getNext();   // advance along next pointer
    }
    return count;
}
```

#### Classic Traversal Template (Memorize)

```cpp
for (Node *p = head; p != nullptr; p = p->next)
    // do something with p->data or p->next
```

> ⚠️ **Klefstad warning (PPT slide 6)**: when traversing, **don't use head directly as the counter**! Modifying head loses the list's entry point. Always use a **temporary pointer `p` or `current`** starting at head.

```cpp
// ❌ Wrong: traverse using head directly
for ( ; head != nullptr; head = head->next)
    cout << head->data;
// After traversal head is nullptr — the list is "lost"
```

### 5.5 search Method (Find in Linked List)

```cpp
bool search(int item) {
    Node *current = head;
    while (current != nullptr) {
        if (current->getData() == item) {
            return true;            // return immediately on hit
        } else {
            current = current->getNext();
        }
    }
    return false;                   // walked to end, not found
}
```

Complexity: **O(n)** — worst case scans the entire list.

#### Klefstad PPT-style find (search for char)

```cpp
bool find(char c) {
    for (Node *p = head; p != nullptr; p = p->next)
        if (p->data == c)
            return true;
    return false;
}
```

Just swaps the while + getter form for direct for + field access.

### 5.6 remove Method (Critical + Error-prone)

`remove` is the hardest of the four core methods. It needs **two pointers**: `current` and `previous`.

#### Why Do We Need previous?

A linked list is **single-direction** — you can only walk forward from head along next, **you cannot go back**. But to delete a node, you must change the **previous node's next pointer** (so it skips the node being deleted).

If you only have `current`, by the time `current` lands on the doomed node, it's too late: there's no way to get from `current` back to its predecessor.

**Solution**: keep `previous` always **one step behind** `current`, "inch-worming" along like a caterpillar.

#### Full Code

```cpp
void remove(int item) {
    Node *current = head;
    Node *previous = nullptr;        // ⚠️ note: previous starts as nullptr
    bool found = false;

    while (!found) {
        if (current->getData() == item) {
            found = true;
        } else {
            previous = current;          // previous catches up first
            current = current->getNext(); // current advances after
        }
    }

    if (previous == nullptr) {
        // Special case: the doomed node IS head
        head = current->getNext();
    } else {
        // General case: previous skips over current
        previous->setNext(current->getNext());
    }
    delete current;                  // ✅ release the unlinked node (cppds omits this — see Key Point 4)
}
```

#### Key Point 1: Inch-worming Order

```cpp
previous = current;           // first push previous to where current is
current = current->getNext(); // then move current forward by one
```

If **reversed**, previous will jump two steps instead of one.

#### Key Point 2: previous == nullptr Special Case

If the node to remove is head itself, the loop finds it immediately and previous never moves off nullptr. You can't call `previous->setNext(...)` (segfault) — you must change head directly:

```cpp
if (previous == nullptr) {
    head = current->getNext();   // make the list's entry point the second node
}
```

#### Key Point 3: cppds Code Assumes Element Exists

The cppds code has a hidden assumption: **the element being removed must be in the list**. If it isn't, `current` becomes `nullptr` in the loop, and the next `current->getData()` will segfault.

This is a bug cppds 5.4.4 explicitly leaves as a "self-check exercise":

> ⚠️ **Think**: how does this code behave if the item is **not** in the list? It crashes. A **more robust** version should also include `current != nullptr` in the while condition:
> ```cpp
> while (!found && current != nullptr) { ... }
> ```

#### Key Point 4: cppds Forgets `delete current` (Memory Leak!)

Look closely at the **original** cppds `remove` code — it **unlinks** the node from the list (by routing previous->next around current, or pointing head at current->next), but it **never calls `delete current`**. The unlinked node becomes **orphaned heap memory** — nothing references it, nothing frees it, and it **leaks permanently**.

That `delete current;` line at the end of "Full Code" above is exactly this fix — the textbook's original omits it, real engineering must add it.

> 💡 **Compare with `pop()` in §6.3**: Klefstad PPT's `pop()` correctly writes `delete tmp;`. Both are "take a node out of the list," but `pop` releases the memory while cppds's `remove` doesn't — this is an omission in the cppds textbook (likely simplified for pedagogy, but it badly violates RAII).

> ⚠️ **The position of delete matters**: it must come **after** `previous->setNext(current->getNext())`, not before — because `current->getNext()` has to be read while `current` is still valid. Delete-then-getNext = dangling reference.

> 🛡️ **Bonus: make it safe when not found**: combine Key Point 3's `current != nullptr` check with this `delete current`, and you get the truly robust version — just two tweaks on top of the "Full Code" above:
> ```cpp
> while (!found && current != nullptr) { ... }   // ← change 1: guard against off-the-end
> if (!found) return;                            // ← change 2: skip the delete
> ```

#### Klefstad PPT pop (Remove Head Node)

PPT slide 13 gives a simplified version — only removes head:

```cpp
char pop() {
    Node *tmp = head;
    char ret = tmp->data;
    head = head->next;
    delete tmp;            // ⚠️ critical: must delete or memory leaks
    return ret;
}
```

> ⚠️ **Common mistake** (PPT slide 13):
> ```cpp
> // ❌ This way head is freed first, then head->next is a dangling reference
> delete head;
> head = head->next;
> ```
> You must save head's address into tmp, update head, then delete tmp.

### 5.7 Complete ActiveCode

cppds gives a complete runnable program (this is what PPT slide 7 demonstrates and the starting point for HW5):

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
        delete current;     // ✅ release the unlinked node (cppds omits this)
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

### 5.8 Self Check & Methods Left to Implement

cppds leaves several exercises:

**Q1: append, insert, index, pop are not implemented — left as exercises.**

**Q2 (Self Check Part I):** implement append (add to end). What's the complexity?

A: naive implementation = O(n) — must traverse to the end.

**Q3 (Self Check Part II):** how do you make append O(1)?

A: keep an extra `tail` pointer in the UnorderedList class; each append simply attaches after tail. But be careful: add (head insertion) must also be modified, because when inserting the first element into an empty list, both head and tail need to be updated.

**Q4: what does an UnorderedList object contain?**

✅ **Correct answer**: an UnorderedList object **holds only one pointer to the first Node**. The Nodes themselves are individually allocated on the heap and can be scattered anywhere in memory.

### 5.9 Complexity Summary

For the 7-method complexity reference, see [§24.2](#242-sll-operation-complexity-cppds-unorderedlist) (`isEmpty` and `add` are O(1) head-insert; the rest are O(n)).

---

## 6. Klefstad-style CharList Implementation

> Corresponds to PPT slides 7-13

The PPT uses an example called `CharList` to teach linked lists. It's essentially the same as cppds's UnorderedList but:
- Data type changes from `int` to `char`
- Method names: add → push, search → find
- Uses struct Node (aggregate init)
- Destructor / pop demonstrates memory-management details

### 6.1 Using CharList

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

After 26 pushes, since each is a head insert, the list will be `Z → Y → X → ... → B → A`.

### 6.2 CharList Class Definition

```cpp
class CharList {
    Node * head;    // sole member
public:
    CharList() : head(nullptr) { }

    void push(char c) {
        head = new Node{c, head};   // one-liner
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

    ~CharList();        // see below
};
```

### 6.3 CharList's Destructor (Two Versions, Version 1 Has a Bug!)

PPT slide 11 gives two versions:

```cpp
~CharList() {
    for (Node *p = head; p != nullptr; p = p->next) {
        delete p;             // version 1 — buggy!
        Node *temp = p;       // version 2 — correct
        p = p->next;
        delete temp;
    }
}
```

> ⚠️ **Bug analysis** (version 1):
> - In the `for`'s `p = p->next`, `delete p` happens *before* the advance
> - At that point `p` points to freed memory (dangling pointer)
> - Accessing `p->next` is **undefined behavior**

> ✅ **Correct approach** (version 2):
> - First save `p` into `temp`
> - Move `p` to the next node (**this happens before delete**)
> - Then `delete temp`

A clearer version:

```cpp
~CharList() {
    Node *p = head;
    while (p != nullptr) {
        Node *temp = p;
        p = p->next;        // advance first
        delete temp;        // then free
    }
}
```

> 💡 **Key Insight**: any "delete + advance" loop **must save the pointer first, advance, then free**. This is the most basic pattern in linked-list memory management.

### 6.4 The const on print

In the PPT, `print(ostream &out) const`:

- `const` means this method does not modify `*this`
- Therefore a `const CharList &` can call it
- The `operator<<` overload uses `const CharList &` — that's the const-correctness from Week 4

### 6.5 cppds vs Klefstad Naming Cheat Sheet

| cppds name | Klefstad PPT name | Meaning |
|---|---|---|
| `add(int)` | `push(char)` | Insert at head |
| `search(int)` | `find(char)` | Search element |
| `size()` | `length()` | Length |
| `print(out)` | `print(out)` | Print |
| `pop()` (cppds exercise) | `pop()` | Remove and return head |
| `getData() / getNext()` | direct `p->data / p->next` | Access fields |

> ⚠️ HW may mix both naming conventions — follow what the assignment specifies.

---

## 7. SLL Modification Operations (Add / Insert / Delete)

> Corresponds to PPT slides 8, 12, 43-49

The PPT covers some modification operations not explicitly in cppds. These are basic operations frequently used when writing linked-list code.

### 7.1 Add to Head (Already Covered)

```cpp
head = new Node{'C', head};
```

### 7.2 Add to End (Adding to End)

You first need a helper to find the last node:

```cpp
Node *tmp = list::last(head);   // see §8.5
if (tmp != nullptr)
    tmp->next = new Node('S', nullptr);
```

Boundary case: if head is nullptr (empty list), `last` returns nullptr — the if guards against segfault. But then you should modify head directly:

```cpp
if (head == nullptr)
    head = new Node('S', nullptr);
else
    list::last(head)->next = new Node('S', nullptr);
```

### 7.3 Insert After a Given Node (Insert After)

```cpp
Node *tmp = list::find_char(head, 'E');
if (tmp != nullptr)
    tmp->next = new Node('X', tmp->next);   // note: next field is tmp->next (the old one)
```

Diagram:
```
Before: head ──► [H]──►[E]──►[A]──►[P]──►null
                       │
                       tmp
After:  head ──► [H]──►[E]──►[X]──►[A]──►[P]──►null
                       │
                       tmp
```

### 7.4 Insert Before a Given Node (Insert Before)

Since SLL can't go backward, you must find the **previous** node:

```cpp
Node *prev = list::find_prev(head, 'A');    // find the node before A
Node *cur = prev->next;
prev->next = new Node('X', cur);
```

### 7.5 Delete a Given Node (Deletion)

```cpp
Node *prev = list::find_prev(head, 'A');
Node *cur = prev->next;
prev->next = cur->next;     // skip cur
delete cur;                 // must delete or you leak
```

### 7.6 Anti-patterns: Chained next

PPT slide 14 + 46-47 list a few **never-write-this** code samples:

#### ❌ Anti-pattern 1: Multi-next Chain

```cpp
head->next = head->next->next;
// PPT verbatim: BTW, don't do this!!!
```

Although semantically this "skips the second node," it is:
- Hard to read
- The skipped node is not deleted → memory leak
- Crashes the moment head or head->next is nullptr

#### ❌ Anti-pattern 2: Creating a Cycle

```cpp
head->next->next->next->next->next = head;
// PPT verbatim: Really!!! don't do this!!!
```

Pointing the last node's next back to head creates a **cycle**.

Consequence: any traversal becomes an **infinite loop**. The destructor's `for (p; p != nullptr; ...)` never terminates.

#### ❌ Anti-pattern 3: Multiple Passes

PPT slide 14 hints:
> Beware making two (or more) passes down list. Always make only one pass, unless you must do more.

If you need to find both an element and its position, do it in one traversal — don't search then indexOf.

#### ❌ Anti-pattern 4: Making Copies

> Beware making extra list copies.

Linked-list deep copy is expensive (O(n) time + O(n) space) — pass by reference whenever possible.

---

## 8. The `namespace list` Design Pattern (PPT-only)

> Corresponds to PPT slides 15-25, 31-32, 49

This section is **unique to Klefstad's PPT** — not in cppds — but it's the core design pattern of HW5.

### 8.1 Why namespace?

Klefstad plans for **HW5 to implement a String class using SLL**. In this design:
- The String class handles **encapsulation** and **resource ownership** (RAII)
- The **low-level operations** of the linked list (length, reverse, copy, free, etc.) live in a separate `namespace list` as **generic helpers**

### 8.2 Design Principle

| Role | Responsibility |
|---|---|
| **String class** (interface methods) | Has a `this` object, does error checking, calls list helpers |
| **namespace list** (static helpers) | Generic, doesn't know about MAXLEN, no error checking, contains low-level for loops |

### 8.3 namespace Definition

```cpp
namespace list {
    struct Node {
        char data;
        Node * next;
    };

    // returns an exact copy of L
    Node * copy(Node * L);
}

// Usage:
list::Node *n;
list::Node *clone = list::copy(n);
```

### 8.4 list::length()

cppds teaches size with a while loop. namespace list follows the same pattern:

```cpp
int length(Node *L) {
    int count = 0;
    for (Node *p = L; p != nullptr; p = p->next)
        ++count;
    return count;
}
```

Boundary: when `L == nullptr`, returns 0 directly.

### 8.5 list::nth()

```cpp
Node * nth(Node *L, int n) {
    Node *p = L;
    for (int i = 0; i < n && p != nullptr; ++i)
        p = p->next;
    return p;       // may be nullptr (n out of range)
}
```

Boundaries:
- `n == 0` → returns L itself (the 0th is the head)
- `n` out of range → returns nullptr

### 8.6 list::free()

Frees all nodes in the entire list. First version (wrong!):

```cpp
void free(Node *L) {       // ⚠️ first draft, does not work
    for (Node *p = L; p != nullptr; p = p->next)
        delete p;
}
```

Same kind of bug as in §6.3 — `p` is deleted, then `p->next` is dangling.

Correct version:

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

Returns a pointer to the last node:

```cpp
Node * last(Node *L) {
    if (L == nullptr) return nullptr;
    while (L->next != nullptr)
        L = L->next;
    return L;
}
```

Boundary: empty list returns nullptr.

### 8.8 list::reverse()

Reverse the list. A few approaches:

#### Approach A: Recursion (PPT slide 24)

```cpp
Node * rev2(Node *L, Node *R) {  // tail-recursion
    if (L == nullptr) return R;
    Node *next = L->next;
    L->next = R;          // reverse
    return rev2(next, L);
}

Node * reverse(Node *L) {
    return rev2(L, nullptr);
}
```

⚠️ **Note**: this approach **modifies the original list in place** — it's not a deep copy. If you need to keep the original, copy first then reverse.

#### Approach B: Build a New List (Similar to HW4 String::reverse)

```cpp
Node * reverse(Node *L) {
    Node *result = nullptr;
    for (Node *p = L; p != nullptr; p = p->next)
        result = new Node{p->data, result};   // head-insert builds reverse order
    return result;
}
```

### 8.9 list::copy() (Important — Deep Copy)

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

This is a **deep copy** — every node in the new list is freshly allocated, fully independent of the original.

### 8.10 list::append() (Concatenate Two Lists)

```cpp
Node * append(Node *L1, Node *L2) {
    Node *result = copy(L1);    // deep-copy L1 first
    if (result == nullptr) return copy(L2);  // L1 empty, return a copy of L2
    Node *tail = last(result);
    tail->next = copy(L2);      // attach a copy of L2 to the tail
    return result;
}
```

⚠️ The two copies here are **intentional** — append should return a fully independent new list, leaving L1 and L2 untouched.

### 8.11 list::attach() (Note: Different from append)

```cpp
Node * attach(Node *L1, Node *L2) {
    if (L1 == nullptr) return L2;
    last(L1)->next = L2;        // ⚠️ direct mutation! No copy
    return L1;
}
```

> ⚠️ **attach vs append**:
> - `attach` mutates L1 in place, pointing its tail at L2 — **no copy**
> - `append` returns a new list; both L1 and L2 are unchanged
>
> attach is more efficient (O(n) vs O(n+m)) but ownership matters — if L1 and L2 are each owned by a String, attach causes two Strings to share part of their memory, leading to double-free at destruction. **In HW5** we mainly use append (the copying version).

### 8.12 Helper Design Principle Summary

PPT slide 5 (the Strings PPT):

| static helpers (list::xxx) | String interface methods |
|---|---|
| Generic, doesn't know MAXLEN | Has a this object |
| No error checking | **Does** error checking |
| Contains low-level for loops | Calls helpers to do the work |
| Call each other | |

---

## 9. Shallow Clone vs. Deep Clone

> Corresponds to PPT slides 29-30

This is the Week 4 concept made concrete on linked lists.

### 9.1 Shallow Clone

```
LIST ──► [H]──►[E]──►[A]──►[P]──►null
              ▲
TWIN ─────────┘  (TWIN has its own new head node, but next points into LIST's internal nodes)
```

> ⚠️ **The shallow-copy problem**:
> - If LIST is destroyed (destructor frees all nodes), TWIN's internal pointers become dangling
> - If both LIST and TWIN destruct → the same nodes are deleted twice → **redundant delete** (UB)

> 💡 **Klefstad aphorism**: "How will you delete such a monster?"

### 9.2 Deep Clone

```
LIST ──► [H]──►[E]──►[A]──►[P]──►null

TWIN ──► [H]──►[E]──►[A]──►[P]──►null
         (fully independent new nodes)
```

Every node is freshly `new`-ed. LIST and TWIN are completely independent — destroying either does not affect the other.

### 9.3 Why a Linked List's copy constructor MUST Be a Deep Copy

Recall the **Rule of Three / Rule of Five** from Week 4:

If a class holds a pointer (e.g., `Node *head`), the compiler-generated copy constructor is a **memberwise copy**, meaning it just copies `head` — that's a shallow copy.

> 💡 **Klefstad aphorism**: "RULE OF THREE if your class contains any pointers, must write all three: copy constructor, copy assignment, destructor"

For String/CharList-style classes you must define:

```cpp
CharList(const CharList &other)
    : head(list::copy(other.head))      // deep copy!
{ }

CharList & operator=(const CharList &other) {
    if (this != &other) {
        list::free(head);               // free old first
        head = list::copy(other.head);  // then deep-copy new
    }
    return *this;
}

~CharList() {
    list::free(head);
}
```

---

## 10. Linked List Memory Management & RAII

> Corresponds to PPT slides 17-18

### 10.1 Who Owns the Heap Memory?

PPT slide 17 raises a **key design question**:

> Who owns the heap memory? Our decision!
> - ListNode? **No**
> - String? **Yes**

In other words, the `Node` itself does **not** free its own memory — it just passively holds data + next. **The class that's truly responsible for freeing is the upper-level String/CharList class**.

#### Why Don't We Let Node Manage Itself?

> 💡 **Key Insight**: if Node's destructor recursively deleted its next, you would get:
> 1. As soon as multiple lists share nodes (even temporarily), you double-free
> 2. Destruction order becomes hard to reason about
> 3. Recursive destruction blows the stack on long lists

**Correct allocation of responsibility**:
- **Node**: only holds data + next, no destructor responsibilities
- **String / CharList**: owns the entire chain; in its destructor calls `list::free(head)` to release all nodes

### 10.2 Can String Objects Share Memory?

> Can String objects share memory? **No!** Becomes a nightmare to manage.

Each String must **own** its own list independently (the embodiment of deep copy).

### 10.3 RAII (Resource Acquisition Is Initialization)

> 💡 **Core principle** (PPT slide 17):
> Resource Acquisition Is Initialization (RAII)
> - encapsulate each resource (e.g., heap memory) into a class
>     - constructor acquires the resource
>     - destructor releases the resource
>     - copy makes a deep copy
>     - move safely transfers resource ownership between objects
> - simple, systematic way to prevent memory leaks

This isn't new to Week 5 — Week 4's Rule of Three covered it. But linked-list implementations show RAII at its most thorough:

| Stage | Responsibility |
|---|---|
| **Construction** (default / from C-string) | acquire: allocate head (default nullptr) or recursively construct nodes |
| **Copy construction** | deep copy the entire list |
| **Copy assignment** | release old resource first, then deep-copy new |
| **Move construction / assignment** | shallow-copy the pointer + null out the source's pointer |
| **Destruction** | release: recursively free all nodes (list::free) |

### 10.4 explicit String(list::Node * L) Private Constructor (HW5 Key)

PPT slide 18 introduces a **private constructor**:

```cpp
class String {
    list::Node *head;
public:
    String();                       // default
    String(const char *s);          // from C-string
    String(const String &);         // copy
    // ...

private:
    explicit String(list::Node *L) : head(L) { }   // ⚠️ key
};
```

**Purpose**: lets String methods (e.g., `operator+`, `reverse`) directly construct a String **that already has a list**, instead of creating an empty String and then assigning.

```cpp
String operator+(const String &s) {
    // splice head and s.head into a new list
    return String( list::append(head, s.head) );
    //      ↑ private constructor; head directly takes ownership of the returned list
}
```

> 💡 **Design intent**: avoid unnecessary copies. With a public interface the alternative would be:
> ```cpp
> String result;
> result.head = list::append(head, s.head);  // ❌ but head is private
> // or
> String result(list::node_to_cstring(...)); // ❌ another C-string conversion
> ```
> The private constructor allows "ownership transfer" — zero copies.

> ⚠️ `explicit` prevents implicit conversion (a `Node *` cannot implicitly become a `String`), avoiding misuse.
> ⚠️ `private` prevents external code from passing a list in directly — only String's own methods can use it.

### 10.5 Connection to HW4

PPT slide 18 mentions:

> Same idea was useful for HW4 to prevent copy when we declare local String in reverse() or operator +()

That is, the `String::String(int length)` private constructor in Week 4's HW4 — pre-allocate buf without initializing content, then fill later. HW5 is the same design embodied on a linked list.

---

## 11. Recursion Chapter Objectives

> Corresponds to cppds 5.1

Goals of this chapter:

- Understand: complex problems may have **simple** recursive solutions
- Learn: how to express programs recursively
- Understand and apply: the **Three Laws of Recursion**
- Perspective: view recursion as a special form of iteration
- Implement: turn a problem's recursive form into code
- Under the hood: understand how computer systems implement recursion

---

## 12. What Is Recursion

> Corresponds to cppds 5.2 + PPT slides 26-27

### 12.1 Definition

> 💡 **Key Definition**: **Recursion** is a method of solving problems that involves breaking a problem down into smaller and smaller subproblems until you get to a small enough problem that it can be solved trivially. Usually recursion involves a function calling itself.

> It may sound mundane, but recursion lets us write very elegant solutions to problems that are hard to express iteratively.

### 12.2 Analogy: Inductive Proof

PPT slide 26:
> recursion is similar to an inductive proof
> - must handle base cases (terminal cases)
> - then handle inductive case (recursive case)

| Mathematical Induction | Recursive Algorithm |
|---|---|
| Base case: prove P(0) | Handle the smallest problem and return directly |
| Inductive step: assume P(k), prove P(k+1) | Use the solution to a smaller problem (recursive call) to construct the current solution |

### 12.3 PPT Example 1: sumN

Sum of the first N integers:

```cpp
int sumN(int n) {        // with if/else
    if (n == 0)
        return 0;
    else
        return n + sumN(n - 1);
}

int sumN(int n) {        // with conditional operator (Week 4)
    return n == 0 ? 0 : n + sumN(n - 1);
}
```

- Base case: returns 0 when `n == 0`
- Recursive case: `n + sumN(n-1)`

### 12.4 PPT Example 2: Factorial

> ```text
> N! = 1 * 2 * 3 * … * (N-1) * N
> 0! = 1
> ```

```cpp
int factorial(int n) {
    return n == 0 ? 1 : n * factorial(n - 1);
}
```

- Base case: returns 1 when `n == 0` (mathematical convention)
- Recursive case: `n * factorial(n-1)`

Call trace (`factorial(4)`):

```
factorial(4) = 4 * factorial(3)
             = 4 * 3 * factorial(2)
             = 4 * 3 * 2 * factorial(1)
             = 4 * 3 * 2 * 1 * factorial(0)
             = 4 * 3 * 2 * 1 * 1
             = 24
```

> ⚠️ **Common mistake**: wrong base case (see §14)

---

## 13. Summing a Vector Recursively

> Corresponds to cppds 5.3

### 13.1 Iterative Version (Familiar)

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

Uses an **accumulator variable** `theSum`.

### 13.2 The Mathematician's View: Fully Parenthesized

Pretend we don't have while/for loops. How do we sum `[1, 3, 5, 7, 9]`?

Addition is defined on **two numbers**. We can write the list as a fully parenthesized expression:

$$total = ((((1 + 3) + 5) + 7) + 9)$$

Or the other way:

$$total = (1 + (3 + (5 + (7 + 9))))$$

The innermost `(7 + 9)` is a **trivially solvable subproblem** — no loop needed. Step by step:

$$
\begin{aligned}
total = &\ (1 + (3 + (5 + (7 + 9)))) \\
total = &\ (1 + (3 + (5 + 16))) \\
total = &\ (1 + (3 + 21)) \\
total = &\ (1 + 24) \\
total = &\ 25
\end{aligned}
$$

### 13.3 Translating to Code

> "the sum of vector `numVect` = the first element + the sum of the rest"

```cpp
#include <iostream>
#include <vector>
using namespace std;

int vectsum(vector<int> numVect) {
    if (numVect.size() <= 1) {
        return numVect[0];
    }
    else {
        // sub-vector from index 1 to end
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

### 13.4 Key Code Points

> 💡 **Key Insight** (cppds verbatim):
> - **Line 6**: check whether the vector has length 1. This is our "escape clause," the recursion's terminating condition. The sum of a length-1 vector is trivially its only element.
> - **Line 11**: the function **calls itself**! That's the recursive nature of the vectsum algorithm.

### 13.5 Call Trace Diagram

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

Each recursive call solves a **smaller problem**. When the problem can't shrink further (base case), the answers "assemble" back upward.

### 13.6 Python Comparison

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
| `numList[1:]` slicing | Must use vector + iterator constructor manually |
| Arbitrary-precision int | Watch out for int overflow |
| `len(...)` | `numVect.size()` |

---

## 14. The Three Laws of Recursion (Key)

> Corresponds to cppds 5.4 — one of Week 5's **central topics**

### 14.1 The Three Laws

> Like the robots of Asimov, all recursive algorithms must obey three important laws:
> 1. A recursive algorithm must have a **base case**.
> 2. A recursive algorithm must change its state and move toward the base case.
> 3. A recursive algorithm must call itself, recursively.

```
┌───────────────────────────────────────────┐
│  Law 1: must have a base case             │
│  Law 2: must change state, move toward it │
│  Law 3: must call itself                  │
└───────────────────────────────────────────┘
```

### 14.2 Laws Explained

#### Law 1: Base Case

The base case is the condition that **stops the recursion**, usually when the problem is small enough to be **solved directly**.

> In the listsum algorithm, the base case is a list of length 1.

Without a base case → **infinite recursion → stack overflow** (StackOverflow / SIGSEGV).

#### Law 2: Change State, Move Toward Base Case

Each recursive call must make the **input** "closer" to the base case. "Change state" means: the data the algorithm uses is modified. Usually our problem data **shrinks**.

> In listsum, the main data structure is a vector, so state changes happen on the vector. The base case is a length-1 vector, so the natural way to "approach" it is to shrink the vector. That's exactly what line 5 does — calls listsum with a shorter list.

> ⚠️ **Common mistake**: forgetting to make the problem smaller:
> ```cpp
> int bad(int n) {
>     return n == 0 ? 0 : n + bad(n);   // ❌ always bad(n), never shrinks
> }
> ```

#### Law 3: Call Itself

This is the **definition** of recursion. It sounds circular: "I want to write a function to solve a problem, but the function relies on calling itself to solve the problem?"

> But the logic isn't actually circular — recursion is an elegant expression of decomposing a big problem into **smaller, easier subproblems**.

### 14.3 Self Check Q&A

#### Q1: How many **recursive** calls are needed to sum vector `{2, 4, 6, 8, 10}`?

✅ **Correct answer: 4**

Detailed explanation:
```
vectsum({2,4,6,8,10})       ← initial call, not counted as recursive
  → vectsum({4,6,8,10})     ← recursion 1
    → vectsum({6,8,10})     ← recursion 2
      → vectsum({8,10})     ← recursion 3
        → vectsum({10})     ← recursion 4, hits base case
```

Wrong-option analysis:
- **5**: counts the initial call as a recursive call — but the initial call isn't recursive
- **6**: there cannot be more recursive calls than the vector size
- **3**: misses one — the base-case call is also a call

> 💡 **Key**: number of recursive calls = vector size − 1 (i.e., 5 − 1 = 4)

#### Q2: Write a recursive factorial function `fact(n)` returning n × (n−1) × ... × 1, with fact(0) = 1. **Which is the most appropriate base case**?

| Option | Evaluation |
|---|---|
| `n == 0` | ✅ Works, but slightly inefficient — one extra recursion |
| `n == 1` | ⚠️ Looks fine, but what about fact(0)? Will infinitely recurse to fact(-1) |
| `n >= 0` | ❌ All non-negative numbers return 1, wildly wrong |
| `n <= 1` | ✅ **Most efficient**, and defends against negative numbers (no crash) |

> 💡 **Best practice**: a base case checking `n <= 1` makes both fact(0) and fact(1) return 1 directly — most efficient, and defends against accidental negatives (no infinite recursion).

```cpp
int fact(int n) {
    return n <= 1 ? 1 : n * fact(n - 1);
}
```

### 14.4 Self-Check Your Recursive Code with the Three Laws

After writing a recursive function, ask yourself three questions:

```
□ 1. Do I have a base case? Under what condition does it stop?
□ 2. Does each recursive call's input get closer to the base case?
□ 3. Am I actually calling myself?
```

If any law isn't satisfied → it's not correct recursion.

---

## 15. Converting an Integer to a String in Any Base

> Corresponds to cppds 5.5

### 15.1 Problem

Convert an integer to its string representation in some base (between 2 and 16). For example:
- 10 (base 10) → `"10"`
- 10 (base 2) → `"1010"`
- 1453 (base 16) → `"5AD"`

### 15.2 Idea: Division + Remainder

Let `convString = "0123456789ABCDEF"`. If the number is less than the base, look it up directly (base case).

Otherwise use integer division + remainder:
- 769 ÷ 10 = 76 remainder 9 → 9 is the last digit
- 76 ÷ 10 = 7 remainder 6 → 6 is the second-to-last digit
- 7 < 10 → base case, result is "7"
- Concatenate in reverse: `"7" + "6" + "9" = "769"`

### 15.3 Three Steps

1. Reduce the original number to a series of single digits
2. Convert each single digit to a string via lookup
3. Concatenate the single-digit strings

### 15.4 Code

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

### 15.5 Key Point: **Recursive Call First, Concatenation Second**

> 💡 **Key Insight** (cppds verbatim):
> The algorithm works correctly because we make the recursive call **first** on line 6, **then** we add the string representation of the remainder. If we reversed returning the convertString lookup and returning the toStr call, the resulting string would be **backward**!

Why? Because recursion returns from the **innermost** call outward. The first to return is the **most significant digit** (which appears at the front of the concatenated string).

Trace `toStr(10, 2)` → expected `"1010"`:

```
toStr(10, 2)
  → toStr(5, 2) + "0"        ← 10 % 2 = 0
    → toStr(2, 2) + "1"      ← 5 % 2 = 1
      → toStr(1, 2) + "0"    ← 2 % 2 = 0
        → "1"                ← 1 < 2, base case
      → "1" + "0" = "10"
    → "10" + "1" = "101"
  → "101" + "0" = "1010"
```

✅ Order is correct.

If you wrote it the other way:

```cpp
return convertString[n%base] + toStr(n/base, base);   // ❌ reversed
```

You'd get `"0101"` — bits reversed.

### 15.6 Connection to Stacks

> This should remind you of our discussion of stacks back in the previous chapter.

Deferred concatenation = waiting for the call stack to "unwind" before merging = implicitly using the **call stack as a reversal container**. This sets up §16.

### 15.7 Self Check (Exercises)

cppds gives two practice problems (implement yourself):

1. **reverse string**: write a function to reverse a string
2. **palindrome**: write a function to check whether a string is a palindrome ("radar," "madam i'm adam," etc.)

Hint: both can be done recursively — base case is empty or single-character string.

---

## 16. Stack Frames: How Recursion Is Implemented

> Corresponds to cppds 5.6 + PPT slides 26-27

### 16.1 Idea: Replace Recursion with an Explicit Stack

Rewrite the previous toStr without recursion — manually maintain a stack:

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

Key steps:
- Each digit/remainder produced → push to stack
- After the number is processed, loop popping → naturally reversed (LIFO = reversed)

### 16.2 Insight: Recursion = Implicitly Using the Call Stack

> 💡 **Key Insight** (cppds verbatim):
> When a function is called, C++ allocates a **stack frame** to handle the function's local variables. When the function returns, the **return value is left on top of the stack** for the caller to use.

| Explicit-stack version | Recursive version |
|---|---|
| `rStack.push(...)` | Function call → new frame pushed |
| `rStack.pop()` | Function return → frame popped |
| You manage the stack | Compiler/runtime manages the call stack |

### 16.3 What Is a Stack Frame

Each **stack frame** contains:
- The function's **local variables**
- **Parameters** (copies of the actual arguments, for pass-by-value)
- **Return address** (where to jump on return)
- **Return value's storage location**

State of the call stack while running `toStr(10, 2)` (simplified):

```
┌───────────────────────────┐
│  toStr(1, 2)              │  top of stack = active frame
│  n = 1, base = 2          │
│  return "1"               │
├───────────────────────────┤
│  toStr(2, 2)              │
│  n = 2, base = 2          │
│  pending: toStr(1,2) + "0"│
├───────────────────────────┤
│  toStr(5, 2)              │
│  n = 5, base = 2          │
│  pending: toStr(2,2) + "1"│
├───────────────────────────┤
│  toStr(10, 2)             │
│  n = 10, base = 2         │
│  pending: toStr(5,2) + "0"│
├───────────────────────────┤
│  main()                   │
└───────────────────────────┘
```

Each frame provides an **independent scope** — even though recursion calls the same function, each call's `n` and `base` are local variables in its own frame.

### 16.4 Comparison to Python

```
Python    : "stack frame" / call stack managed entirely implicitly
C++       : same, but stack space is limited (typically 1-8 MB)
            → too-deep recursion → stack overflow (e.g., factorial(100000))
```

> ⚠️ **C++ recursion can't be too deep** — stack space is usually only a few MB; thousands of levels can blow the stack. Python's default recursion limit is 1000 (adjustable).

---

## 17. Visualizing Recursion: Turtle Graphics

> Corresponds to cppds 5.7

### 17.1 Why Use turtle?

The "mental model" of recursion is hard to build — pictures may be more intuitive than code.

Python's standard library includes the `turtle` module. C++ doesn't have a native turtle, but you can use `Turtle.cpp` (provided on GitHub: `https://github.com/CodyWMitchell/visual-recursion`).

### 17.2 Example 1: drawSpiral

Python version:

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

C++ equivalent:

```cpp
void drawSpiral(Turtle myTurtle, int lineLen) {
    if (lineLen > 0) {
        myTurtle.forward(lineLen);
        myTurtle.right(90);
        drawSpiral(myTurtle, lineLen - 5);
    }
}
```

- Base case: `lineLen <= 0` (return directly)
- Recursive case: draw one line, turn 90°, continue with a shorter spiral

### 17.3 Example 2: Fractal Tree

> A tree = a trunk + a smaller right subtree + a smaller left subtree

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

C++ version (in Turtle.cpp):

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

Drawing order:
- Draw the entire **right subtree** first (deepest down to the rightmost twig)
- Then the **left subtree** (same recursive process)
- This is because of the recursive call order: right before left

> 💡 **Key Insight**: **each branch point** corresponds to one **recursive call**. The fractal tree visually shows how recursion "unfolds."

### 17.4 Self-check Practice

cppds suggests several improvements:
- Vary line thickness with branchLen
- Vary color with branchLen (paint short ones green = leaves)
- Randomize the turn angle (more natural)
- Randomize branchLen reduction

---

## 18. The Sierpinski Triangle

> Corresponds to cppds 5.8

### 18.1 Problem

The Sierpinski triangle is a **self-similar** fractal — every part looks like the whole.

How to draw:
1. Draw a large triangle
2. Divide it into 4 smaller triangles (connect the midpoints of each side)
3. Ignore the central inverted triangle and **recursively** apply the same process to the remaining 3 corners

### 18.2 Three-way Recursion

Each call has **three recursive sub-calls** — different from earlier examples (which had one or two).

```python
def sierpinski(points, degree, myTurtle):
    drawTriangle(points, colormap[degree], myTurtle)
    if degree > 0:
        sierpinski([points[0],
                    getMid(points[0], points[1]),
                    getMid(points[0], points[2])],
                   degree-1, myTurtle)            # bottom-left
        sierpinski([points[1],
                    getMid(points[0], points[1]),
                    getMid(points[1], points[2])],
                   degree-1, myTurtle)            # top
        sierpinski([points[2],
                    getMid(points[2], points[1]),
                    getMid(points[0], points[2])],
                   degree-1, myTurtle)            # bottom-right
```

### 18.3 Base Case: degree

> Since recursion could go forever, what's the base case?
> Answer: **degree** — how many levels of subdivision, set as a manual cutoff.

Each recursion subtracts 1 from degree, stopping at 0.

### 18.4 Drawing Order

The call graph is a **ternary tree**:
- Always recurse to the **bottom-left** deepest first
- Then backtrack to handle the **top**
- Finally handle the **bottom-right**

> 💡 This "depth-first, leftmost-first" order is the hallmark of functional-style recursion.

### 18.5 Helper Functions

- `getMid(p1, p2)`: returns the midpoint of two points (coordinate average)
- `drawTriangle(points, color, turtle)`: draws a filled triangle with `begin_fill` / `end_fill`

---

## 19. Tower of Hanoi

> Corresponds to cppds 5.10

Tower of Hanoi (§19) and Maze exploration (§20) are the two classic examples from cppds 5.10–5.11 — both **awkward iteratively but elegant recursively**. We start with Hanoi.

> cppds 5.12 (dynamic programming) is out of scope for Week 5.

### 19.1 Problem

A puzzle invented by French mathematician Édouard Lucas in 1883. Legend: an Indian temple gives this puzzle to young monks:

> Three poles, 64 gold disks (each smaller than the last). Move all 64 disks from one pole to another, with rules:
> 1. Only one disk may be moved at a time
> 2. A larger disk may **never** be placed on top of a smaller one

The monks work at "one move per second." When they finish, the world ends.

> Don't worry — moving 64 disks requires $2^{64} - 1 = 18{,}446{,}744{,}073{,}709{,}551{,}615$ moves. At one per second, that's **584.9 billion years**!

### 19.2 Recursive Idea (Key)

If you already know how to move a 4-disk tower from A to B, then a 5-disk tower is easy:
1. Move the top 4 disks to B (using C as intermediate)
2. Move the bottom disk from A to C
3. Move those 4 disks from B to C (using A as intermediate)

But how do you know how to move 4 disks? Same logic: first move 3 disks…

Eventually it reduces to: **moving a 1-disk tower** — that's the **base case**.

### 19.3 High-Level Algorithm

> Move a height-N tower from source to destination (using intermediate as transit):
> 1. Move the height-(N−1) tower from source to intermediate (using destination as transit)
> 2. Move the remaining disk from source to destination
> 3. Move the height-(N−1) tower from intermediate to destination (using source as transit)

### 19.4 Code

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

### 19.5 Key Points

- **Base case**: when `height < 1` the function returns immediately, doing nothing
- Note that the **roles of withPole and toPole swap** between the two recursive calls (this is key):
  - First recursion: we need to move height−1 onto withPole, so withPole is the destination
  - Second recursion: we move from withPole, so fromPole is withPole

### 19.6 Why No Explicit Stack?

> Now that you have seen the code for both moveTower and moveDisk, you may be wondering why we do not have a data structure that explicitly keeps track of what disks are on what poles. ... The answer is that **C++ provides the stacks that we need implicitly through the call stack**.

In other words:
- Conceptually we'd need 3 stacks (one per pole) to record which disks are on each
- But the code has **no explicit stack** at all — the recursive call stack does this implicitly

### 19.7 Complexity Analysis

The number of `moveTower(n, ...)` calls $T(n)$ satisfies:

$$T(n) = 2 T(n-1) + 1$$

Solution: $T(n) = 2^n - 1$

That's why 64 disks need $2^{64} - 1$ moves.

### 19.8 Output (n = 3 Run)

```
moving disk from A to B
moving disk from A to C
moving disk from B to C
moving disk from A to B
moving disk from C to A
moving disk from C to B
moving disk from A to B
```

7 moves = $2^3 - 1$.

---

## 20. Exploring a Maze

> Corresponds to cppds 5.11

### 20.1 Problem

Have a turtle find the exit of a maze. The maze consists of cells; each is open or a wall. The turtle can only walk on open cells.

### 20.2 Algorithm: Recursive Backtracking

From the current position, try the 4 directions in order:

> - First try **north**, recurse from there
> - If north fails, try **south**
> - If south fails, try **west**
> - If west fails, try **east**
> - All fail → dead end

### 20.3 Key: Avoid Infinite Loops

> The trouble: if north fails and we try south, south leads back to where we started — recurse again and we'd bounce back and forth forever.

**Solution**: **breadcrumbs**. Mark every cell after walking through it; if we ever return, retreat immediately.

### 20.4 Four Base Cases

```
1. Turtle hits a wall (OBSTACLE)         → return False
2. Turtle steps on an already-explored cell → return False
3. Turtle reaches the outer edge (exit)  → return True
4. All four directions tried, all failed → dead end, return False
```

### 20.5 Code (Python — implement in C++ yourself)

```python
def searchFrom(maze, startRow, startColumn):
    maze.updatePosition(startRow, startColumn)

    # base case 1: wall
    if maze[startRow][startColumn] == OBSTACLE:
        return False

    # base case 2: already explored
    if maze[startRow][startColumn] == TRIED:
        return False

    # base case 3: exit found
    if maze.isExit(startRow, startColumn):
        maze.updatePosition(startRow, startColumn, PART_OF_PATH)
        return True

    # mark as explored
    maze.updatePosition(startRow, startColumn, TRIED)

    # recursively try 4 directions (short-circuit eval)
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

### 20.6 Key Point: Short-Circuit Evaluation

```python
found = searchFrom(...) or searchFrom(...) or searchFrom(...) or searchFrom(...)
```

The `or` operator is **short-circuiting**: as soon as one returns True, the rest are skipped. So:
- If north works, south/west/east are **not** explored
- If north fails, try south, and so on
- All four False → dead end

### 20.7 Self Check (C++ Implementation)

cppds leaves the entire maze program's C++ implementation as an exercise. You'll need:
- File I/O (read maze file)
- A class (Maze)
- ASCII output (use cout instead of turtle)

Format example:
```
7 5

+++++++
+--+-S+
+--+--+
-----++
+++++++
```
("+" is wall, "-" is path, "S" is start)

---

## 21. Linked Lists and Recursion: A Natural Fit

> Corresponds to PPT slide 28 — the bridge between Reading and PPT

### 21.1 Linked Lists Are Themselves Recursively Defined

A linked list is **defined recursively**:

> A list is either:
> - empty (nullptr), OR
> - a node followed by a list

That's a **recursive data structure**. The most natural way to process it is **recursively**.

### 21.2 length, Recursively

```cpp
int length(Node *L) {
    if (L == nullptr)
        return 0;
    return 1 + length(L->next);
}
```

- Base case: empty list, length 0
- Recursive case: 1 + length of the rest

### 21.3 print, Recursively

```cpp
void print(Node *L, ostream &out) {
    if (L != nullptr) {
        out << L->data << ' ';
        print(L->next, out);
    }
}
```

Or print in reverse (recurse first, then print):

```cpp
void printReverse(Node *L, ostream &out) {
    if (L != nullptr) {
        printReverse(L->next, out);
        out << L->data << ' ';
    }
}
```

> 💡 Same source as §15.5's toStr — **recurse first, then act** gives you reverse output.

### 21.4 copy, Recursively

```cpp
Node * copy(Node *L) {
    if (L == nullptr) return nullptr;
    return new Node{L->data, copy(L->next)};
}
```

Very concise — but careful: long lists blow the stack.

### 21.5 List Recursion vs. List Iteration: When to Use Which?

| Use Recursion | Use Iteration |
|---|---|
| Code is more concise, closer to the problem essence | Large data, limited stack |
| Functional style (don't mutate the original) | Performance-sensitive |
| Naturally recursive algorithms (reverse, copy) | Single-pass simple operations |

> ⚠️ HW5's String implementation uses both styles — choose based on each helper's needs.

---

## 22. Linked Structures Beyond SLL (Look-Ahead)

> Corresponds to PPT slides 38-41 — ⚠️ **outside this course's main path**: DLL / BST / Graph belong to ICS 46 (Data Structures) (cross-checked against Week 6 — Week 6 covers inheritance and polymorphism, none of these). The PPT mentions them here as an extension of "SLL is the foundation"

The reading list does **not** include this, but Klefstad's PPT slide 38 explicitly says:

> SLL is the foundation for data structures. Master SLL BEFORE class in data structures.
> Here are some linked structures you will see…

### 22.1 Doubly Linked Lists (DLL)

```
null ◄── [prev | H | next] ◄──► [prev | E | next] ◄──► ... ──► null
                ↑
              head
```

- Each node has **prev, data, next** fields
- Pros: bidirectional traversal; insert/delete at any known position is O(1)
- Cons: each node carries an extra pointer; operations must maintain pointers in both directions

### 22.2 Binary Search Tree (BST)

```
           [A]
          /   \
        [B]   [C]
        / \   / \
      [D] [E][F][G]
       / \
     [H] [I]
```

Each node has left and right children. BST property: left < root < right. Core content of ICS 46.

### 22.3 Graph

A set of nodes + edges (possibly weighted, directed) between them.
PPT slide 41's example is a city flight graph (Dallas, Austin, Atlanta...). Content of ICS 46 / 162.

> ⚠️ Week 5 won't test these, but the PPT mentions them to emphasize: **SLL is the foundation of all these complex structures**.

---

## 23. typedef Brief Intro

> Corresponds to PPT slide 50 — ⚠️ **basic C++ feature, not in the Week 5/6 reading list** (Week 6 covers inheritance and polymorphism, no typedef). Kept here as the extension concept the PPT brings up

`typedef` is a C++ feature that gives a type a new name:

```cpp
typedef int * IntPointer;
IntPointer p = nullptr;        // p is int*

typedef char Buffer[20];
Buffer buf;                    // buf is char[20]

typedef Node * List;           // List is an alias for Node*
```

> 💡 Modern C++ (C++11+) recommends `using` instead of typedef:
> ```cpp
> using IntPointer = int *;
> using List = Node *;
> ```
> Equivalent, but `using` syntax is clearer and supports template aliases.

---

## 24. Week 5 Comprehensive Cheat Sheet

### 24.1 Linked List vs. Array vs. Vector

| | C array | std::vector | Linked List (SLL) |
|---|---|---|---|
| Memory | Contiguous | Contiguous (heap) | Scattered |
| Size | Compile-time | Dynamic | Dynamic |
| Indexing | O(1) | O(1) | O(n) |
| Head insert | Not possible (must grow + shift) | O(n) | **O(1)** |
| Tail insert | Not possible | Amortized O(1) | O(n) (naive) / O(1) (with tail) |
| Mid-insert | Not possible | O(n) | O(1) (known position) |
| Delete | Not possible | O(n) | O(1) (known position) |
| Memory overhead | 0 | 0 ~ growth factor | One pointer per node |

### 24.2 SLL Operation Complexity (cppds UnorderedList)

| Method | Complexity | Note |
|---|---|---|
| `isEmpty` | O(1) | Just checks head |
| `add` (head insert) | O(1) | Two pointer changes |
| `size` | O(n) | Must traverse |
| `search` | O(n) | Worst case to end |
| `remove` | O(n) | Search + delete |
| `append` (naive) | O(n) | Must traverse to end |
| `append` (with tail) | O(1) | But must maintain tail |

### 24.3 Klefstad Naming vs cppds Naming

| Klefstad | cppds |
|---|---|
| `push(c)` | `add(item)` |
| `pop()` | (left as exercise) |
| `find(c)` | `search(item)` |
| `length()` | `size()` |
| `last(L)` | (left as exercise) |
| `copy(L)` | (deep copy must be self-implemented) |
| `free(L)` | destructor |

### 24.4 Three Laws of Recursion (Mnemonic)

```
┌──────────────────────────────────────┐
│  1. Must have a Base Case            │
│  2. Must change state, move toward it│
│  3. Must call itself                 │
└──────────────────────────────────────┘
```

### 24.5 Common Recursion Patterns

| Pattern | Example | Key |
|---|---|---|
| Accumulator | sumN, factorial | base case + n * f(n-1) |
| List | listsum, length | base case (empty list) + first + f(rest) |
| Divide-and-conquer | Tower of Hanoi, Sierpinski | base case + multiple self calls |
| Backtracking | maze | 4 base cases + multi-direction tries + mark visited |
| Conversion | toStr | recurse first, then concat → automatic reversal |

### 24.6 Python ↔ C++ Comparison (Week 5 Highlights)

| Python | C++ | Note |
|---|---|---|
| `class Node:` auto `__init__`, fields can be added | `class Node { ... };` must declare fields explicitly | C++ field types fixed, constructor needed |
| `list[1:]` slice | `vector(it+1, end)` manual construction | C++ has no slice syntax |
| `None` | `nullptr` (C++11+) / `NULL` (legacy) / `0` | nullptr is type-safe |
| `del obj` | `delete ptr;` | manual management |
| `__del__` is unreliable | `~ClassName()` called automatically, deterministic | basis of RAII |
| Default recursion depth 1000 | System stack ~MB-scale, depth limited | Big recursion → watch out for overflow |
| `sys.setrecursionlimit(...)` | No simple knob | Need to switch to iteration |

### 24.7 Klefstad Aphorisms (PPT Excerpts)

| Aphorism | Meaning |
|---|---|
| "Singly Linked List is the foundation for data structures" | SLL is the basis of all complex data structures |
| "Master SLL BEFORE class in data structures" | Master SLL before ICS 46 / data structures |
| "linked list should only be used as implementation of classes" | Linked lists are only for internal implementation; don't expose externally |
| "Resource Acquisition Is Initialization (RAII)" | Encapsulate resources in classes; constructor acquires, destructor releases |
| "Who owns the heap memory? Our decision!" | Explicitly design memory ownership |
| "delete head; head = head->next" | ❌ classic dangling-reference example |
| "head->next = head->next->next" | ❌ anti-pattern: chained next |
| "head->next->next->next->next->next = head" | ❌ anti-pattern: creating a cycle |

### 24.8 Common Pitfalls Checklist

| # | Mistake | Consequence | Prevention |
|---|---|---|---|
| 1 | add reverses the two steps | Whole list lost (leak) | setNext first, then change head |
| 2 | Destructor / free deletes then accesses next | Dangling pointer, UB | Save temp first, advance, then delete |
| 3 | remove assumes element exists | Segfault when missing | Add `current != nullptr` check |
| 4 | Copy constructor relies on default (memberwise) | Shallow copy → double-free | Write deep copy (Rule of Three) |
| 5 | Multiple Strings sharing list memory | Double release | RAII: each object owns its resource |
| 6 | Use head directly as the traversal variable | List loses entry point | Use a temp pointer p or current |
| 7 | next chain too long | Unreadable, NPE-prone | Break into steps |
| 8 | Creating a cycle | Infinite traversal | Never let a node's next point back |
| 9 | Forgetting base case in recursion | Stack overflow | Self-check with three laws |
| 10 | factorial base case `n == 1` | fact(0) infinite recursion | Use `n <= 1` |
| 11 | toStr written backward: `convString[n%base] + toStr(...)` | Result digits reversed | Recurse first, then concatenate |
| 12 | C++ recursion too deep | Stack overflow | Use iteration for large data |
| 13 | Forget to consider empty list when modifying | NPE | Check nullptr at start of every helper |
| 14 | Using attach when you need append | Shared memory → double-free | Use copying append; reserve attach for explicit ownership transfer |

---

## 25. Top Five Takeaways for Week 5

1. **The two-step insertion order in linked lists must never be reversed**: `temp->setNext(head); head = temp;`. Connect next first, then change head. Reversed = whole list lost (or self-loop). This is the core of `add`, and the foundational order principle of all linked-list operations.

2. **Linked-list memory management: save the pointer first, advance, then delete.** Whether destructor, free, or pop — any "delete node + advance pointer" loop must follow this order. `delete p; p = p->next;` is always a dangling reference, always UB.

3. **RAII + Rule of Three is the soul of a linked-list class**: any class holding `Node *head` must define **destructor, copy constructor, copy assignment** (plus move construction/assignment in C++11+), and copy must be a **deep copy**. The default memberwise init gives a shallow copy, leading to double-free.

4. **Three Laws of Recursion** — **Base Case, change state toward Base Case, call yourself**. Self-check every recursive function with these three. The most common bugs: wrong base case (e.g., `n == 1` instead of `n <= 1` for factorial), or recursive call where input doesn't shrink (e.g., `f(n) = f(n)`).

5. **The "deferred concatenation" pattern in recursion**: recurse first, then compute on the return value. This order makes recursion **automatically reverse** — that's the shared core of toStr, reverse-printing a list, and Tower of Hanoi. Reversing it (act first, then recurse) usually gives a wrong result. Equivalent statement: the recursive call stack is itself an implicit stack.

---

> **Reading covered**:
> - cppds 4.1 (Objectives) + 4.2 (What Are Linked Structures) + 4.3 (Implementing Unordered Linked List) + 4.4 (Node Class) + 4.5 (Unordered Linked List Class) — fully covered
> - cppds 5.1 (Objectives) + 5.2 (What Is Recursion) + 5.3 (Sum of Vector) + 5.4 (Three Laws) — covered in detail (focus chapters)
> - cppds 5.5 (Convert Integer to String) + 5.6 (Stack Frames) + 5.7 (Visualizing Recursion) + 5.8 (Sierpinski) + 5.9 (Complex Recursive Problems) + 5.10 (Tower of Hanoi) + 5.11 (Maze) — standard coverage
> - PPT *Linked List & Recursion* (Klefstad) — almost fully integrated (CharList, namespace list design, Insert/Delete operations, RAII, memory ownership, Shallow vs Deep Clone, List Recursion)
>
> **PPT content beyond this week's reading list** (DLL, BST, Graph, typedef) is flagged in §22 and §23. Cross-checked against Week 6 (inheritance and polymorphism): none of these topics appear in Week 6 — DLL / BST / Graph belong to ICS 46 (Data Structures), and typedef is a general C++ feature. Both sections are kept as PPT-driven extension reading.
>
> **Not covered**: CppCon 2021 video *Back to Basics: Pointers* — reading list marks it as "if needed"; not deeply covered here.
