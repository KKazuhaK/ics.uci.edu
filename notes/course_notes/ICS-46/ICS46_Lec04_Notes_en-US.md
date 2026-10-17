# Information and Computer Science 46 — Lecture 4: Linked Lists & Stacks

## Table of Contents

- [1. Linked Lists: The Idea](#1-linked-lists-the-idea)
- [2. Singly Linked List: Implementation](#2-singly-linked-list-implementation)
- [3. Singly Linked List: Analysis](#3-singly-linked-list-analysis)
- [4. Doubly Linked List](#4-doubly-linked-list)
- [5. ArrayList vs. Linked Lists](#5-arraylist-vs-linked-lists)
- [6. Stacks](#6-stacks)
- [7. Complete Implementation](#7-complete-implementation)
- [8. In-class Activities (with Solutions)](#8-in-class-activities-with-solutions)
- [9. Quick Reference & Top 5 Things to Remember](#9-quick-reference--top-5-things-to-remember)

> UCI ICS 46, Prof. Tom Yeh, Fall 2026, 10/08/26. Built from the Lecture 4 slides (pp. 1–49); supplements: algs4 §1.3, Thornton's ICS 46 notes. Organized by concept, not by source.
> Slides 50–51 (stacks on a linked list, "How do we choose?") are repeated at the start of Lecture 5, so they live in the Lecture 5 notes.

> 📅 **Class logistics** (slides 2–3):
> Lab 2 (includes building the SLL below) due **Mon 10/19/26**; HW 2 due **Fri 10/16/26**.
> Learning Activity A in Friday's discussion + Activity B the Friday after = Quiz 1. Consent form: 1% extra credit (alternative reflection prompts if you don't consent).
> Install the MetaCog Chrome extension (bit.ly/MetaCogExt → unzip → `chrome://extensions` → developer mode → "Load unpacked" → `dist` folder → click its reload button → save your 5-digit student ID).
> Lecture activities count for credit starting next week.

---

## 1. Linked Lists: The Idea

Today's goals (slide 4): linked lists, then stacks.

### 1.1 Nodes connected by pointers (slides 5–7)

An ArrayList keeps items in one contiguous block. A **linked list** is still a dynamic linear structure, but each item lives in its own heap **node**, and the order is stored in **pointers** from node to node — the nodes can be anywhere in memory. Slide 6 shows this on memory cells 0–7: the list "CS ? !" starts at cell 3 (the **head**), cell 3 links to cell 1, cell 1 links to cell 6; the other cells aren't part of the list.

Slide 7's recursive definition: a singly linked list is **either empty (`nullptr`) or a node holding an item and a pointer to a singly linked list**. `Node<T>` holds one item of type `T` and a link to the next node. The last node's `next` is `nullptr` (the slash in the slide's box).

```viz linked-list
{"title": "Slide 6's list: reaching the last node means walking", "items": "CS, ?, !", "ops": "get(2)", "start": 1}
```

> 📘 **Beyond the lecture** (algs4 §1.3): the recursive definition gives the standard traversal loop, `for (Node* x = head; x != nullptr; x = x->next)`, which you'll use for printing, the destructor and copying.

### 1.2 The API and a worked sequence (slides 8–15)

Slide 8's `SinglyLinkedList<T>` API: `SinglyLinkedList()`, `bool isEmpty() const`, `size_t size() const`, `T get(size_t index) const`, `void add(const T& item)` (**at the head**), `void add(size_t index, const T& item)`, `T remove()` (**the head**), `T remove(size_t index)`. Note that the no-index `add`/`remove` work at the **head**, the opposite of Lecture 3's ArrayList.

Slides 9–15 animate it (indices count from the head, starting at 0):

| Slide | Call | List afterwards | `n` |
|---|---|---|---|
| 9 | `SinglyLinkedList<std::string> sll;` | empty | 0 |
| 10–12 | `add("ICS 46")`, `add("ROCKS")`, `add("!")` | ! → ROCKS → ICS 46 | 3 |
| 13 | `add(1, "?")` | ! → ? → ROCKS → ICS 46 | 4 |
| 14 | `remove()` returns "!" | ? → ROCKS → ICS 46 | 3 |
| 15 | `remove(1)` returns "ROCKS" | ? → ICS 46 | 2 |

Step through it below (← / → keys work when the demo is focused):

```viz linked-list
{"title": "Slides 9–15", "ops": "add(ICS 46); add(ROCKS); add(!); add(1, ?); remove(); remove(1)", "interactive": true}
```

Head-insertion means items come out in **reverse order** of insertion — that's LIFO, the stack behaviour of section 6.

---

## 2. Singly Linked List: Implementation

### 2.1 The class: nested `Node`, `head`, `n` (slides 16–18)

Slide 16's plan: our own list (part of Lab 2), a **template**, a **nested class `Node`**, and a **count of elements**. Slide 17:

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

Storing `n` makes `size()` O(1), at the price that every mutator must update it. `Node` has **no default constructor** — that matters for two slide bugs below. Slide 18:

```cpp
bool isEmpty() const {
    return head == nullptr; // return size() == 0;
}

size_t size() const {
    return n;
}
```

The two `isEmpty` versions agree as long as the invariant **`head == nullptr` exactly when `n == 0`** holds. The destructor (declared on slide 17) frees every node by removing the head until the list is empty; the copy/move operations are Lab 2's job — the compiler's default copy would share one chain and double-free it.

### 2.2 `rangeCheck` (slide 19)

```cpp
void rangeCheck(size_t index) const {
    if (index > n || index < 0)
        throw std::out_of_range("Index " + std::to_string(index) + " out of bounds");
}
```

> ⚠️ **Pitfall** (slide 19): `index < 0` on a `size_t` is always false, and `index > n` lets `index == n` through, so `get(n)` dereferences `nullptr` → use `if (index >= n)` for `get`/`remove`; `add(index, item)` allows `index == n` (append) and checks `index > n` itself.

Example (compiled): on a 2-item list, `get(2)` prints `get(2): Index 2 out of bounds`.

### 2.3 `get(index)`: walk with a finger (slides 20–22)

The only node you can reach directly is the head, so put a temporary pointer — the **finger** — on it and move forward `index` times (slide 22):

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

Example: `get(2)` on ! → ? → ROCKS → ICS46 moves finger "!" → "?" → "ROCKS" and returns "ROCKS". Up to `n - 1` steps, so **O(n)**.

> ⚠️ **Pitfall** (slides 22, 38): `get` is missing `const` (slide 8 says `T get(size_t index) const`) → add it, or you can't call `get` on a `const` list.

### 2.4 `add(item)`: insert at the head (slides 23–25)

Make the new node point at the current first node, then make `head` point at the new node (slide 25):

```cpp
void add(const T& item) {
    Node* oldHead = head;                 // remember the current first node
    Node* newNode = new Node(item);       // allocate node (next defaults to nullptr)
    newNode->next = oldHead;              // link new node to the old head
    head = newNode;                       // new node becomes the head
    ++n;                                  // increase number of nodes
}
```

Example: `add("UCI")` on ! → ? → ROCKS → ICS46 gives `[UCI, !, ?, ROCKS, ICS46] n=5`. No loop → **O(1)**, and it works on an empty list too (`oldHead` is `nullptr`).

> ⚠️ **Pitfall**: link before you move `head`. Writing `head = newNode;` first loses the only pointer to the old list. `head = new Node(item, head);` does both in one line.

### 2.5 `add(index, item)`: insert at an index (slides 26–30)

To insert "UCI" at index 2 of ! → ? → ROCKS → ICS46, the pointer that must change is **"?"'s `next`** — the node *before* the spot. So walk two pointers: `finger` lands on the node now at `index`, `previous` stays one behind. Slides 27–29 animate the walk for `add(2, …)`: (`previous`, `finger`) goes (nullptr, "!") → ("!", "?") → ("?", "ROCKS"), then stop. Slide 30:

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

> ⚠️ **Pitfall** (slide 30): `new Node()` doesn't compile (`Node` has no default constructor) → `Node* current = new Node(item, finger);`. Also `int index` → `size_t`, and the range check must allow `index == n`.

Index 0 is a special case because `previous` would stay `nullptr`, and inserting at the front changes `head`, not some node's `next`. The two-step picture after the walk, using the fixed line:

`add(2, "UCI")` on ! → ? → ROCKS → ICS46, from the walk to the splice. Step through it below (← / → keys work when the demo is focused):

```viz linked-list
{"title": "add(2, \"UCI\") (slides 26–30)", "items": "!, ?, ROCKS, ICS46", "ops": "add(2, UCI)"}
```

Example (compiled): `add(2, "UCI")` → `[!, ?, UCI, ROCKS, ICS46] n=5`; `add(4, "end")` on a 4-item list appends → `[!, ?, ROCKS, ICS46, end] n=5`. Walk up to `n` steps → **O(n)**.

### 2.6 `remove()`: remove the head (slides 31–32)

Move `head` one node right, then delete the old first node (slide 32):

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

> ⚠️ **Pitfall** (slides 32, 40, 41): `temp->data` / `finger->data` — the field is called `item` → `T data = temp->item;`.

Copy the item out, **then** `delete`, then return the copy — after `delete`, `temp` dangles. Example: `remove()` on ! → ? → ROCKS → ICS 46 returns "!". **O(1)**. (On an empty list it would dereference `nullptr`; the complete implementation throws first.)

### 2.7 `remove(index)`: remove at an index (slides 33–34, 41)

Same walk as `add(index, item)`; once `finger` is on the victim, make `previous` skip over it. Slide 34 leaves the `else` branch as Activity 1; slide 41 shows the finished method (code: [Activity 1 solution](#81-activity-1-implement-remove-at-an-index-slide-34), with `item` for the slide's `finger->data`):


`remove(2)` on ! → ? → ROCKS → ICS46: walk, bypass, delete. Step through it below (← / → keys work when the demo is focused):

```viz linked-list
{"title": "remove(2) (Activity 1)", "items": "!, ?, ROCKS, ICS46", "ops": "remove(2)"}
```

Example (compiled): `remove(2)` on ! → ? → UCI → ROCKS → ICS46 returns "UCI". Walk → **O(n)**.

> 📝 **Practice**: [Activity 1](#81-activity-1-implement-remove-at-an-index-slide-34).

---

## 3. Singly Linked List: Analysis

### 3.1 Cost of each operation (slides 35–41)

Slides 35–41 ask for each operation's worst case. The question is always: *how many nodes must we walk past before the constant-time pointer work?*

| Operation | Worst case | Why |
|---|---|---|
| `add(item)` at head (slides 35–36) | **O(1)** | no loop |
| `get(index)` (slide 38) | **O(n)** | walk up to `n - 1` steps |
| `add(index, item)` (slide 39) | **O(n)** | walk, then O(1) splice |
| `remove()` at head (slide 40) | **O(1)** | move `head`, delete one node |
| `remove(index)` (slide 41) | **O(n)** | walk, then O(1) bypass |
| add / remove at tail (head only) | **O(n)** | walk to the end (removal needs the second-to-last node) |

Slides 35–36 analyse an older `add` that assigns to `first = new Node();` and sets `first->item`, `first->next = oldHead`.

> ⚠️ **Pitfall** (slides 35–36): leftover `first` (no such member; `head` never updated) and `new Node()` → use slide 25's version; the answer is still O(1).
> ⚠️ **Pitfall** (slide 38): `public T get(int index)` is a Java leftover → in C++, access comes from the `public:` label.

> 📘 **Beyond the lecture** (Thornton, Linked List Variations): `get(i)` is really **Θ(i)** — `get(0)` is fast on any list. "O(n)" is the worst case over all `i`.

> 📝 **Practice**: [Activity 2](#82-activity-2-time-complexity-of-singly-linked-list-operations-slide-37).

### 3.2 Would a tail pointer help?

Add a `Node* tail` member pointing at the last node:

- **Add at tail → O(1)**: `tail->next = newNode; tail = newNode;` (empty list: set `head` too).
- **Remove at tail → still O(n)**: you need the *second-to-last* node to set its `next` to `nullptr`, and an SLL can't step backwards from `tail`.

> 💡 **Key Insight**: in an SLL, a pointer to a node lets you change what comes **after** it, never what comes **before** it.

---

## 4. Doubly Linked List

### 4.1 Node with `prev`, head and tail (slides 42–44)

A **doubly linked list (DLL)** gives every node a second pointer to the node before it (slide 42):

```cpp
class Node {
    T item;
    Node* next;
    Node* prev;
};
```

Slide 43's operations name the end they work on: `DoublyLinkedList()`, `isEmpty()`, `size()`, `get(int index)`, `addFirst(Item item)`, `addLast(Item item)`, `add(int index, Item item)`, `Item removeFirst()`, `Item removeLast()`, `Item remove(int index)` (`Item`/`int` are slide naming; in our C++ it's `T`/`size_t`). The list keeps a **head** (Head/Beginning/Front/First) and a **tail** (Tail/End/Back/Last).

Slide 44 shows five small diagrams with no arrows between them; read in order they are the list growing and then shrinking:

| Diagram | Nodes | head | tail |
|---|---|---|---|
| 1 | ICS 46 (`prev` and `next` both null) | ICS 46 | ICS 46 (same node) |
| 2 | ROCKS ⇄ ICS 46 | ROCKS | ICS 46 |
| 3 | ROCKS ⇄ ICS 46 ⇄ ! | ROCKS | ! |
| 4 | ROCKS ⇄ ICS 46 | ROCKS | ICS 46 |
| 5 | ICS 46 | ICS 46 | ICS 46 |

One sequence that produces slide 44's five states in order. Step through it below (← / → keys work when the demo is focused):

```viz doubly-linked-list
{"title": "Slide 44's states", "ops": "addLast(ICS 46); addFirst(ROCKS); addLast(!); removeLast(); removeFirst()", "interactive": true}
```

The one-node state is the edge case: `head == tail`, so adding to an empty list or removing the last node must update **both**.

### 4.2 Both ends in O(1) (my completion)

The slides give the API and pictures, not DLL code; this is my completion (compiled; `addLast`/`addFirst`/`removeFirst` are in section 7):

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

Inserting in the middle changes **four** links (new node's `prev` and `next`, `before->next`, `after->prev`); removing a middle node `x` is `x->prev->next = x->next; x->next->prev = x->prev;`. Example (compiled): `addLast("ICS 46"); addFirst("ROCKS"); addLast("!")` → `[ROCKS, ICS 46, !] backwards [!, ICS 46, ROCKS]`; then `removeLast()` returns "!".

> 📘 **Beyond the lecture** (Thornton, Linked List Variations): a DLL can walk from whichever end is closer, Θ(min(i, n − i)) ≤ n/2 steps — faster, but **still O(n)**.

### 4.3 DLL analysis (slide 45)

| Operation (head + tail) | Worst case |
|---|---|
| insert at head / at tail | **O(1)** / **O(1)** |
| `get(index)`, `add(index, item)`, `remove(index)` | **O(n)** (walk) |
| remove from head / from tail | **O(1)** / **O(1)** (`tail->prev`) |

> 📝 **Practice**: [Activity 3](#83-activity-3-time-complexity-analysis-for-dll-slide-45).

---

## 5. ArrayList vs. Linked Lists

Worst case unless marked; the ArrayList column is from [Lecture 3](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec03_Notes_en-US.md).

| Operation | ArrayList | SLL | SLL + tail | DLL (head + tail) |
|---|---|---|---|---|
| get at index | **O(1)** | O(n) | O(n) | O(n) |
| add at front | O(n) shift | **O(1)** | **O(1)** | **O(1)** |
| add at end | **O(1) amortized** | O(n) | **O(1)** | **O(1)** |
| remove front | O(n) shift | **O(1)** | **O(1)** | **O(1)** |
| remove end | **O(1) amortized** | O(n) | O(n) | **O(1)** |
| add / remove at index | O(n) shift | O(n) walk | O(n) walk | O(n) walk |

In an ArrayList, O(n) comes from **shifting**; in a linked list, from **walking** — the splice itself is O(1). Each node also costs extra memory for its pointers (measured on this g++ build: an SLL `Node<int>` is 16 bytes, a DLL `Node<int>` 24, vs. 4 bytes per ArrayList slot).

> 💡 **Key Insight** (Thornton): more links buy faster operations at the cost of memory and more edge cases — pick the simplest variation that's fast enough for the operations you need.

---

## 6. Stacks

### 6.1 The stack ADT (slides 46–47)

A **stack** is a dynamic linear structure where items are inserted and removed **LIFO (Last In, First Out)**: you only touch one end, the **top**. Pancakes (slide 47): add one = **push** onto the top; take one = **pop** the top; look at the top without taking it = **peek**. Goal: push and pop as efficient as possible. (Slide 47's picture: a stack of coloured discs with push/pop arrows at the top.)

### 6.2 Tracing push and pop (slide 48)

Input `To be or not to - be - - that - - - is` — a word is a push, `-` is a pop:

| After | Popped | Stack (bottom → top) |
|---|---|---|
| To be or not to | | To be or not to |
| `-` | to | To be or not |
| be, `-`, `-` | be, not | To be or |
| that, `-`, `-`, `-` | that, or, be | To |
| is | | To is |

Compiled output:

```text
popped: to be not that or be
left on stack (top first): is To
```

Step through it below (← / → keys work when the demo is focused):

```viz stack
{"title": "Slide 48: To be or not to - be - - that - - - is", "ops": "To be or not to - be - - that - - - is", "interactive": true}
```

### 6.3 Stack on an ArrayList (slide 49)

Slide 49 draws "ICS46 ROCKS !" in slots 0–2, index 0 = **Front**, the last item = **End/Rear**. Put the **top at the end**: push = `add(item)`, pop = `remove()`, peek = `at(size() - 1)` — nothing else moves.

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

Example (compiled, counting element copies + shifts for n pushes):

```text
n=1000  top-at-back moves=2022 (2.022 per push)  top-at-front moves=501522 (501.522 per push)
n=8000  top-at-back moves=16190 (2.02375 per push)  top-at-front moves=32012190 (4001.52 per push)
```

Top at the back stays at ~2 moves per push (amortized O(1)); top at the front costs ~n/2 per push (O(n)).

> 📘 **Beyond the lecture** (Thornton, Amortized Analysis): amortized O(1) is a bound on the **total** over any sequence (n pushes ≤ 3n work), not on each call — one push that doubles the array is O(n). Peek's O(1) is a true worst case.

> 📝 **Practice**: [Activity 4](#84-activity-4-implementing-stacks-slide-49).

---

## 7. Complete Implementation

SLL (slides 17–41, bugs fixed) and DLL (my completion of slides 42–45). Built with `g++ -std=c++17 -Wall -Wextra -fsanitize=address,undefined`: no warnings, no sanitizer reports.

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

Output:

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

## 8. In-class Activities (with Solutions)

### 8.1 Activity 1: implement remove at an index (slide 34)

Complete the `else` branch (the slide shows ! ? ROCKS ICS46 with `previous` and `finger` under it):

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

**Solution:**

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

Only the `next` of the node *before* the victim changes, so you need `previous`; index 0 is separate because there the pointer to change is `head`.

### 8.2 Activity 2: Time Complexity of Singly Linked List operations (slide 37)

Fill in the worst case: `add(E item)` — O(1) insert at head, O( ) insert at tail; `get(int index)` — O( ); `add(int index, T item)` — O( ); `remove()` — O( ) from the head, O( ) from the tail; `remove(int index)` — O( ).

**Solution:** add at tail **O(n)** (O(1) with a tail pointer); `get` **O(n)**; `add(index)` **O(n)**; remove from head **O(1)**, from tail **O(n)** (even with a tail pointer — no way back to the second-to-last node); `remove(index)` **O(n)**.

### 8.3 Activity 3: Time Complexity Analysis for DLL (slide 45)

Same table for a doubly linked list.

**Solution:** insert at head **O(1)**, at tail **O(1)**; `get` **O(n)**; `add(index)` **O(n)**; remove from head **O(1)**, from tail **O(1)**; `remove(index)` **O(n)**. Only the tail rows change: `tail->prev` reaches the second-to-last node in one step.

### 8.4 Activity 4: Implementing Stacks (slide 49)

Implement a stack using an **ArrayList** (operations `add(Item item)`, `add(int index, Item item)`, `remove()`). (a) Where should the top be (front or back)? (b) How do we implement Pop, Push and Peek? (c) **Amortized** big-O for Pop and Push? (d) **Worst-case** big-O for Peek? (e) **Worst-case** big-O if the top is in the reverse direction?

**Solution:**
(a) The **back** (End/Rear) — adding/removing there shifts nothing.
(b) push = `add(item)`, pop = `remove()`, peek = `at(size() - 1)`.
(c) Both **O(1) amortized** (occasionally O(n) when the array doubles or shrinks at ¼ full).
(d) **O(1)**.
(e) Top at the front: push = `add(0, item)`, pop = `remove(0)` shift everything → **O(n)**; peek = `at(0)` stays O(1).

---

## 9. Quick Reference & Top 5 Things to Remember

| Operation | ArrayList | SLL | SLL + tail | DLL | Stack on ArrayList (top at end) |
|---|---|---|---|---|---|
| index access | O(1) | O(n) | O(n) | O(n) | — |
| add / remove front | O(n) | O(1) | O(1) | O(1) | — |
| add end | O(1) amort. | O(n) | O(1) | O(1) | push: O(1) amort. |
| remove end | O(1) amort. | O(n) | O(n) | O(1) | pop: O(1) amort. |
| add / remove at index | O(n) | O(n) | O(n) | O(n) | — |
| peek | — | — | — | — | O(1) |

**Top 5 things to remember:**

1. Every indexed linked-list operation is O(n) because of the **walk**; the splice itself is O(1).
2. Inserting/removing inside an SLL needs the **previous** node; index 0 is special because it changes `head`.
3. Removing an SLL's tail is O(n) even with a tail pointer; a DLL's `prev` makes it O(1).
4. Copy the item out **before** `delete`, update `n` in every mutator, and handle the empty / one-node cases.
5. Stack on an ArrayList: top at the **end** → push/pop O(1) amortized, peek O(1); top at the front → O(n).

> ➡️ **Continued in [Lecture 5](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec05_Notes_en-US.md)**: stacks on an SLL/DLL (Activities 5 & 6, slide 50) and "How do we choose?" (slide 51).
