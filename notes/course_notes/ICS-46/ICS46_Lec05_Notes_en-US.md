# Information and Computer Science 46 — Lecture 5: Queues, Deques, Analysis of Recursion

## Table of Contents

- [1. Stacks on Linked Lists](#1-stacks-on-linked-lists)
- [2. The Queue ADT](#2-the-queue-adt)
- [3. Implementing Queues](#3-implementing-queues)
- [4. Stack Applications: Expression Evaluation](#4-stack-applications-expression-evaluation)
- [5. Queue Applications](#5-queue-applications)
- [6. Complete Implementation](#6-complete-implementation)
- [7. In-class Activities (with Solutions)](#7-in-class-activities-with-solutions)
- [8. Quick Reference & Top 5 Things to Remember](#8-quick-reference--top-5-things-to-remember)

> UCI ICS 46: Data Structure Implementation and Analysis — Prof. Tom Yeh, Fall 2026, 10/13/26
> Built from the Lecture 5 slides (p1–19) plus Lecture 4 slide 51; supplements: algs4 §1.3, Thornton's "Stacks, Queues, and Deques" and "Amortized Analysis". Organized by concept, not by source.
> Today's goals (slide 3): finish stacks, queues, analysis of recursion. The analysis-of-recursion part (slides 20–28) was repeated at the start of Lecture 6, so it lives in the [Lecture 6 notes](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec06_Notes_en-US.md). The stack ADT and its ArrayList version come from the [Lecture 4 notes](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec04_Notes_en-US.md).

> 📅 **Class logistics** (slide 2, updated on Lec 06 slide 2):
> HW 2 due **Fri 10/16/26** (Lec 05 slide said "Fri 10/15/26"; 10/15 is a Thursday and the Lec 06 update says 10/16)
> Learning Activity 2 this **Fri 10/16/26** — the 2nd half of Quiz 1
> Lab 2 due **Mon 10/19**
> Quiz 2 **Fri 10/23** — Algorithm Analysis, ArrayList, Linked List

---

## 1. Stacks on Linked Lists

### 1.1 Top of the stack = head of the list

A stack (LIFO) only touches its top. In a singly linked list (SLL) with only `head` (slide 4's picture: head → item1 → … → item5 → null), the only end you can change in O(1) is the head. So put the **top at the head**: push = Lecture 4's "insert at head" (`add(item)`, slide 25), pop = "remove head" (`remove()`, slide 31). All three operations are **O(1) worst case**. This is the opposite end from the ArrayList stack, whose top is at the back.

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

Push ICS46, ROCKS, ! and pop everything (full class in [§6](#6-complete-implementation)):

```text
peek: !, size 3
pop: ! ROCKS ICS46
error: pop from empty stack
```

> ⚠️ **Pitfall**: Lecture 4 slide 31 writes `T data = temp->data;` but the slide-17 `Node` has `item`, not `data` → use `temp->item`. The slide also has no empty check; `pop()` needs one.

### 1.2 DLL, and the reversed direction

- **DLL with head and tail**: O(1) at both ends, so the top can go at either end — but every node carries a `prev` the stack never uses.
- **Top at the tail of an SLL** (reversed): with only `head`, push/pop/peek are all **O(n)** (walk to the end). Adding a `tail` pointer makes push and peek O(1), but **pop stays O(n)**: after removing the last node you need the second-to-last node, which an SLL can only find by walking from the head.

> 📝 **Practice**: [Activity 0](#71-activity-0-implementing-stacks-slide-4).

### 1.3 How do we choose? (slide 5)

Slide 5 was a live poll with blank answers; the filled-in version is Lecture 4 slide 51:

| Implementation | push / pop / peek | Trade-off | When it wins |
|---|---|---|---|
| ArrayList | O(1) on average, O(1) on average, O(1) | less memory, faster overall, **lumpy** performance | the focus is on overall performance |
| Singly linked list | O(1), O(1), O(1) — **worst case** | extra time and space for links, but a **guarantee** every operation is fast | planes coming in for landing; an internet switch with packets arriving at a high rate |
| Doubly linked list | O(1) | extra memory overhead, same performance as SLL | — |

🔑 **Best choice depends on the problem.**

> 📘 **Beyond the lecture**: Thornton calls the ArrayList's "O(1) on average" **amortized** O(1): over any real sequence of pushes, the total cost divided by the number of pushes is constant, because one O(n) resize pays for n cheap pushes. A single push can still take O(n) — that's the "lumpy" part, and why a system that can't afford one slow step picks the linked list.

---

## 2. The Queue ADT

### 2.1 FIFO

A **queue** (slide 7) is a dynamic linear structure for sequential data that removes the **least recent** item first: items leave in the exact order they arrived (FIFO, First In First Out). Metaphor: a line of people waiting to buy tickets.

- **Enqueue**: add a new item to the **end** of the line.
- **Dequeue**: remove the item at the **front** of the line.
- Goal: maximize time efficiency for **both** operations — a queue has two "business ends", a stack only one.

### 2.2 Example of queue operations (slide 8)

A word means enqueue it, `-` means dequeue and print (same input as Lecture 4's stack example). Queue written front → back:

| Step | Input | Printed | Queue after |
|---|---|---|---|
| 1–5 | To be or not to | | To be or not to |
| 6 | `-` | **To** | be or not to |
| 7 | be | | be or not to be |
| 8–9 | `-` `-` | **be**, **or** | not to be |
| 10 | that | | not to be that |
| 11–13 | `-` `-` `-` | **not**, **to**, **be** | that |
| 14 | is | | that is |

Step through it below (← / → keys work when the demo is focused):

```viz queue
{"title": "Slide 8: To be or not to - be - - that - - - is", "ops": "To be or not to - be - - that - - - is", "interactive": true}
```

The output is the input order, `To be or not to be` — a queue never reorders. The [§6](#6-complete-implementation) program replays it: `dequeued: To be or not to be`, then `left in queue (2): front = that`.

---

## 3. Implementing Queues

Slides 9–11 ask the same four questions for ArrayList, SLL and DLL: where to enqueue/dequeue, how to implement it, the worst-case (or amortized) run times, and what happens if you reverse the direction. The answers in one table:

| Structure & layout | enqueue | dequeue |
|---|---|---|
| ArrayList, front = index 0, rear = end | O(1) amortized | **O(n)** (shift left) |
| ArrayList reversed, rear = index 0, front = end | **O(n)** (shift right) | O(1) |
| Circular array (📘 beyond the lecture) | O(1) amortized | O(1) |
| SLL, head only, front = head | **O(n)** (walk to end) | O(1) |
| SLL, head only, reversed | O(1) | **O(n)** |
| ✅ SLL, head + tail, front = head, rear = tail | O(1) | O(1) |
| ❌ SLL, head + tail, reversed | O(1) | **O(n)** |
| DLL, head + tail, either direction | O(1) | O(1) |

### 3.1 ArrayList (slide 9)

An ArrayList keeps item 0 in cell 0, so whichever end of the queue sits at index 0 costs O(n) — every other item shifts. Usual layout: enqueue with `add(item)`, dequeue with `remove(0)`.

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

Enqueue ICS46, ROCKS, ! and drain: `ICS46 ROCKS !` (compiled against a stand-in with Lecture 3's ArrayList operations).

> 📝 **Practice**: [Activity 1](#72-activity-1-implementing-queues-with-an-arraylist-slide-9).

### 3.2 Circular array

> 📘 **Beyond the lecture**: Thornton and algs4 fix the array by letting the front move. Keep `f` (index of the front item) and `n` (count). Enqueue writes at `(f + n) % capacity` and does `++n`; dequeue reads `items[f]`, then `f = (f + 1) % capacity`, `--n`. Both O(1) (enqueue amortized when the array doubles). Keep the count `n`: with only front and back indices, "full" and "empty" look the same.

Example (capacity 2 → doubled to 4): enqueue 1, 2, 3; dequeue 1, 2; enqueue 4, 5. Now `f = 2` and 5 has wrapped to cell 0: cells are `[5, _, 3, 4]`, queue order 3 4 5.

The same example on a capacity-4 array (no resize needed here). Step through it below (← / → keys work when the demo is focused):

```viz circular-queue
{"title": "Circular array: the front moves, nothing shifts", "ops": "1 2 3 - - 4 5", "capacity": 4, "interactive": true}
```

### 3.3 SLL: add a tail pointer (slide 10)

With only `head`, one operation is always O(n). **The fix: keep a `tail` pointer**, and enqueue at the tail, dequeue at the head. Direction still matters: `tail` lets you *add* after the last node in O(1), not *remove* it (removing needs its predecessor).

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

Enqueue onto a non-empty queue, then drain it — watch the last `dequeue()` reset `tail`. Step through it below (← / → keys work when the demo is focused):

```viz queue
{"title": "SLL with head and tail (slide 10)", "ops": "enqueue(ICS46); enqueue(ROCKS); enqueue(!); dequeue(); dequeue(); dequeue()"}
```

> ⚠️ **Pitfall**: Two empty-queue cases. Enqueue into an empty queue has no `tail->next` to set, so set `head` too. Dequeue of the last item must reset `tail = nullptr`, or the next enqueue writes through freed memory.

> 📝 **Practice**: [Activity 2](#73-activity-2-implementing-queues-with-a-singly-linked-list-slide-10).

### 3.4 DLL (slide 11)

Slide 11's DLL has Head/Front on ROCKS and Tail/Back on "!". A DLL with head and tail can insert and remove at **both** ends in O(1) (the new tail after a removal is `tail->prev`), so both directions give O(1) enqueue and dequeue. The cost is an extra `prev` per node with no speed gain over the SLL with tail. A DLL is also what a **deque** (double-ended queue, in the lecture title) needs: add and remove at both ends.

> 📝 **Practice**: [Slide 11 prompt](#74-implementing-queues-with-a-doubly-linked-list-slide-11).

### 3.5 What is the best choice? (slide 12)

Slide 12 ("How do we choose between the queue implementations?") is a blank live poll; the answers below are mine, by the same reasoning as Lecture 4 slide 51.

- **ArrayList**: as-is, dequeue is O(n) — a poor queue. As a circular array: O(1) amortized, least memory, but lumpy.
- **Singly linked list**: with a tail pointer, O(1) worst case for both — the guarantee, at one pointer per node.
- **Doubly linked list**: O(1) either way, but extra memory for `prev` with the same performance.
- Best choice depends on the problem (overall throughput → circular array; every operation fast → SLL with tail).

---

## 4. Stack Applications: Expression Evaluation

### 4.1 Where stacks show up (slide 14)

Basic mechanisms in compilers and interpreters; the back button in a browser; undo in a word processor. The rest of the lecture is the compiler/interpreter case: evaluating arithmetic.

### 4.2 Infix vs postfix (slide 14)

- **Infix**: operator **between** operands; standard math notation, needs parentheses for precedence. Example `( ( 2 + 3 ) * ( 4 * 5 ) )`.
- **Postfix**: operator **after** its operands, **no parentheses**; evaluated with one stack left to right, no ambiguity.

To convert a fully parenthesized infix expression, rewrite each innermost `( a op b )` as `a b op`, working outward:
`( ( 2 + 3 ) * ( 4 * 5 ) )` ⇒ sub-eval `((2 3 +) * (4 5 *))` ⇒ **`2 3 + 4 5 * *`**. Operands keep their order; only operators move.

### 4.3 Dijkstra's two-stack algorithm (slide 15)

Read the fully parenthesized infix expression left to right with a **value stack** and an **operator stack**:

- Value: push onto the value stack.
- Operator: push onto the operator stack.
- Left parenthesis: ignore.
- Right parenthesis: pop an operator and two values; push the result of applying that operator to those values onto the value stack.

Slide 15 is a frame of the algs4 demo showing value stack 1, 2 and operator stack +, +. The expression isn't on the slide; it is consistent with algs4's demo expression `( 1 + ( ( 2 + 3 ) * ( 4 * 5 ) ) )`, so the trace below is inferred from algs4. Stacks bottom → top:

| Token(s) | Value stack | Operator stack |
|---|---|---|
| `( 1 + ( ( 2 +` | 1 2 | + + ← *slide 15's frame* |
| `3 )` → 2 + 3 | 1 5 | + |
| `* ( 4 * 5 )` → 4 * 5 | 1 5 20 | + * |
| `)` → 5 * 20 | 1 100 | + |
| `)` → 1 + 100 | **101** | |

Every operation must be wrapped in its own parentheses: the `)` is the signal "apply the most recent operator now".

Step through it below (← / → keys work when the demo is focused):

```viz two-stack-eval
{"title": "Dijkstra's two-stack algorithm (slide 15)", "expression": "( 1 + ( ( 2 + 3 ) * ( 4 * 5 ) ) )", "interactive": true}
```

> 📝 **Practice**: [Activity 3 (a)](#75-activity-3-expression-evaluation-slide-18).

### 4.4 Operand order (slide 16)

Slide 16 links the algs4 "Dijkstra's 2-Stack Demo" video ([Google Drive](https://docs.google.com/file/d/1kLs501v5QjCoGAp5lO-58KUpNXyibNCm/preview)) with the note *"video seems to have the order of the operands flipped."* The rule: the **first value popped is the right operand** (it was pushed last), the second popped is the left one. Slide 17 writes it as `v1 = pop()`, `v2 = pop()`, `push(v2 op v1)`.

Example: `( 10 - 4 )` pops 4, then 10 → 10 − 4 = **6**. Flipped, you'd get 4 − 10 = −6. For `+` and `*` the order doesn't matter, which is why the demo's answer still comes out right.

> ⚠️ **Pitfall**: Exam questions use `-` and `/`. Write down v1 and v2 and compute `v2 op v1`.

### 4.5 Postfix evaluation (slide 17)

Process the expression left to right; if it's an operand, push it; if it's an operation, pop 2 operands and push the result of applying it. The answer is the one item left (`peek()`). Slide 17's trace of `(52 - ((5 + 7) * 4))` ⇒ `52 5 7 + 4 * -` (bottom → top):

| Token | Action | Stack |
|---|---|---|
| `52` `5` `7` | push ×3 | 52 5 7 |
| `+` | v1=7, v2=5, push(v2+v1)=12 | 52 12 |
| `4` | push(4) | 52 12 4 |
| `*` | v1=4, v2=12, push(v2*v1)=48 | 52 48 |
| `-` | v1=48, v2=52, push(v2-v1)=4 | 4 → peek()=4 |

Step through it below (← / → keys work when the demo is focused):

```viz postfix-eval
{"title": "Slide 17: 52 5 7 + 4 * -", "expression": "52 5 7 + 4 * -", "interactive": true}
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

`evalPostfix` on `52 5 7 + 4 * -`, `5 1 2 + 4 * + 3 -` and `10 4 -` prints `4 14 6` (`applyOp(op, left, right)` returns `left op right`).

> 📝 **Practice**: [Activity 3 (b)–(c)](#75-activity-3-expression-evaluation-slide-18).

---

## 5. Queue Applications

Slide 19: a Spotify playlist (songs play in the order queued), data buffers (Netflix, Hulu), asynchronous data transfer (file I/O, sockets), requests for shared resources (printers), traffic analysis, waiting times at a call center.

> 💡 **Key Insight**: Use a queue when there is a **mismatch between input and output rate** (slide 19): items arrive in bursts and are served steadily, and the queue holds the backlog in arrival order.

---

## 6. Complete Implementation

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

## 7. In-class Activities (with Solutions)

### 7.1 Activity 0: Implementing Stacks (slide 4)

Implementing Stacks using
- **singly linked list**
- **doubly linked list**

(a) Where should the top of the stack be? (b) How do we implement Pop, Push, and Peek with the linked list? (c) What is the worst-case big-O runtime for Pop, Push, and Peek? (d) What is the worst-case big-O if you implement the top of stack in the reverse direction?

**Solution**

- **(a)** SLL: at the **head**. DLL with head and tail: either end.
- **(b)** push = insert at head; pop = save `head`, advance it, copy the item, delete the old node; peek = `head->item` (empty checks on pop/peek). Code in [§1.1](#11-top-of-the-stack--head-of-the-list).
- **(c)** All **O(1) worst case**.
- **(d)** Top at the tail: SLL head-only → all O(n); SLL head + tail → push/peek O(1) but **pop O(n)**; DLL → all O(1) via `tail->prev`.

### 7.2 Activity 1: Implementing Queues with an ArrayList (slide 9)

Implementing queue with **ArrayList**: Where should we enqueue and dequeue items? Implement enqueue and dequeue operations. What are the worst-case (or amortized) run-times? What if we reverse the direction of enqueue and dequeue?

**Solution**

- Enqueue at the end with `list.add(item)`, dequeue at index 0 with `list.remove(0)`.
- Enqueue **O(1) amortized**; dequeue **O(n)** (everything shifts left).
- Reversed (`add(0, item)` / `remove()`): enqueue **O(n)**, dequeue O(1).
- Either way one operation is O(n), because the ArrayList pins item 0 to cell 0 ([§3.2](#32-circular-array) for the fix).

### 7.3 Activity 2: Implementing Queues with a Singly Linked List (slide 10)

Implementing queue with **singly linked list**: Where should we enqueue and dequeue items? Implement enqueue and dequeue operations. What are the worst-case run-times? What if we reverse the direction of enqueue and dequeue? What modification allows us to get O(1) for both ops?

**Solution**

- Dequeue at the head, enqueue at the last node.
- Head only: dequeue O(1), enqueue **O(n)**. Reversed: enqueue O(1), dequeue **O(n)**.
- Modification: a **tail pointer**, with front = head and rear = tail → both O(1) ([§3.3](#33-sll-add-a-tail-pointer-slide-10)).
- Trap: the reversed direction with a tail pointer is still O(n) for dequeue.

### 7.4 Implementing Queues with a Doubly Linked List (slide 11)

Implementing queue with **doubly linked list**: Where should we enqueue and dequeue items? Implement enqueue and dequeue operations. What are the worst-case run-times? What if we reverse the direction of enqueue and dequeue?

**Solution**

- Enqueue at the tail (`newNode->prev = tail; tail->next = newNode; tail = newNode;`, or set `head` if empty), dequeue at the head (`head = head->next; head->prev = nullptr;`, or `tail = nullptr` if it becomes empty).
- Both **O(1)** worst case, and still O(1) reversed. Price: the extra `prev` pointer.

### 7.5 Activity 3: expression evaluation (slide 18)

- Use 2-stack method for **infix** expression evaluation: `( ( 2 + 3 ) * ( 4 * 5 ) )`
- Use a stack to evaluate **postfix** expression: `5 1 2 + 4 * + 3 -`
- Convert the above expression back to infix

**Solution**

**(a)** = **100**. Values/operators (bottom → top): after `( ( 2 + 3 )` → 5 / empty; after `* ( 4 * 5 )` → 5 20 / `*`; final `)` → 5 × 20 = 100.

**(b)** = **14**:

| Token | Action | Stack |
|---|---|---|
| `5` `1` `2` | push ×3 | 5 1 2 |
| `+` | v1=2, v2=1 → 3 | 5 3 |
| `4` `*` | v1=4, v2=3 → 12 | 5 12 |
| `+` | v1=12, v2=5 → 17 | 17 |
| `3` `-` | v1=3, v2=17 → 14 | 14 |

Check (a) and (b) step by step:

```viz two-stack-eval
{"title": "Activity 3 (a)", "expression": "( ( 2 + 3 ) * ( 4 * 5 ) )"}
```

```viz postfix-eval
{"title": "Activity 3 (b)", "expression": "5 1 2 + 4 * + 3 -"}
```

**(c)** Push expressions instead of numbers: `((5 + ((1 + 2) * 4)) - 3)`, i.e. 5 + (1 + 2) × 4 − 3 = 14. Operand order 5, 1, 2, 4, 3 is unchanged.

---

## 8. Quick Reference & Top 5 Things to Remember

| ADT | Order | Add / remove / look | Best linked list | Where the ends go | Cost |
|---|---|---|---|---|---|
| Stack | LIFO | push / pop / peek | SLL, head only | top = head | O(1) worst case |
| Queue | FIFO | enqueue / dequeue / front | SLL, head + tail | front = head, rear = tail | O(1) worst case |
| Stack on ArrayList | LIFO | push / pop / peek | — | top = end | O(1) amortized ("lumpy") |
| Queue on ArrayList | FIFO | enqueue / dequeue | — | front = index 0 | dequeue O(n) |

**Top 5 things to remember**

1. A linked-list stack puts the **top at the head**: push, pop and peek are O(1) worst case; the ArrayList stack is only O(1) on average.
2. A queue on an SLL needs a **tail** pointer and must **enqueue at the tail, dequeue at the head** — a tail pointer can't make removing the last node O(1).
3. A plain ArrayList queue always has one O(n) operation; best choice depends on the problem.
4. The **first value popped is the right operand**: compute `v2 op v1` (it matters for `-` and `/`).
5. Postfix needs one stack and no parentheses; fully parenthesized infix needs Dijkstra's two stacks.

> ➡️ **Continued in [Lecture 6](?kind=course_notes&course=ICS-46&lang=en-US&note=ICS46_Lec06_Notes_en-US.md)**: analysis of recursion — writing recurrences (e.g. for factorial), the recursion-tree method, T(n) = 2T(n/2) + n, and the binary-search activity.
