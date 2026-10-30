---
title: "软件设计与 UML"
summary: "从架构走向详细设计、六种设计方法、抽象、UML 类图(关联、多重性、聚合与组合)、内聚、耦合,以及信息隐藏。"
---

# Informatics 43 — 第五周课程笔记

> 涵盖 **Lecture 9 与 Lecture 10**：*"如何在细节层面构建软件结构？（第 1、2 部分）"*

## 目录

1. [从架构走向设计 — Lecture 9 的起点](#1-从架构走向设计--lecture-9-的起点)
2. [什么是软件设计](#2-什么是软件设计)
3. [软件工程中的设计阶段](#3-软件工程中的设计阶段)
4. [软件设计的目标与活动](#4-软件设计的目标与活动)
5. [软件设计的六种方法](#5-软件设计的六种方法)
6. [设计与模型 — 它们长什么样](#6-设计与模型--它们长什么样)
7. [设计的目的：思考、交流、规约](#7-设计的目的思考交流规约)
8. [抽象 — 软件工程的核心动作](#8-抽象--软件工程的核心动作)
9. [设计记号与语言（Lecture 10）](#9-设计记号与语言lecture-10)
10. [UML 类图](#10-uml-类图)
11. [类与类之间的关系](#11-类与类之间的关系)
12. [其他 UML 图](#12-其他-uml-图)
13. [其他（非 UML）图](#13-其他非-uml图)
14. [什么是软件工程？（再次定义）](#14-什么是软件工程再次定义)
15. [设计原则 — 内聚、耦合、信息隐藏](#15-设计原则--内聚耦合信息隐藏)
16. [Quiz 5 复习要点](#16-quiz-5-复习要点)
17. [总结与记忆框架](#17-总结与记忆框架)

---

## 1. 从架构走向设计 — Lecture 9 的起点

第四周以**架构（architecture）**收尾：那些**主要的（principal）**、塑造系统整体形态的决策，被打包成一组有名字的**架构风格**（MVC、客户端-服务器、分层、点对点、管道-过滤器、发布-订阅）。同时也强调了一个事实：**所有成功的软件都会演化**，而架构正是我们用来为这种演化提前规划的主要工具。

第五周把镜头**再向下**推一层。一旦主要决策已经定下，*我们如何在细节层面把软件组织起来？* 这就是设计阶段，它涵盖从系统级决策（用什么语言、什么库、什么协议）一路下沉到具体的类、方法、屏幕布局。

我们到目前为止建立起来的演进顺序是：

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture} \;\longrightarrow\; \textbf{Design (in detail)} \;\longrightarrow\; \textbf{Code}}$$

---

## 2. 什么是软件设计

### 2.1 设计 = 所有创造性决策；架构是它的子集

一个有用的心理图像：**设计决策（design decisions）**构成一个大集合，而**架构决策（architectural decisions）**是其中的*子集* —— 具体来说，是那些重要到足以被称为*主要（principal）*的决策。

| 层次 | 范围 | 例子 |
|------|------|------|
| **架构决策** | "主要"那一部分子集 | 风格、组件、连接器、配置 |
| **设计决策（整体）** | 关于系统如何被构建的全部创造性决策 | 架构*加上*所有更小的决策 |

两个层次都覆盖系统的同样四个方面：

| 方面 | 它捕捉什么 |
|------|------|
| **结构（Structure）** | 系统如何被划分成各部分 |
| **行为（Behavior）** | 这些部分随时间如何动作 |
| **交互（Interaction）** | 各部分如何相互通信 |
| **非功能属性（Non-functional properties）** | 性能、可扩展性、安全性、可靠性等 |

> **"principal"（主要）** 这个词正是把架构和设计区分开来的关键。架构是塑造其他一切的那一小核心决策；设计是整座冰山，包括那些核心决策以及它们下面所有更小的决策。

---

## 3. 软件工程中的设计阶段

设计在经典瀑布图中处于需求与实现之间：

```
Requirements (what)  →  Design (how)  →  Implementation  →  Verification  →  Maintenance
```

值得记住的心理速记是：

$$\boxed{\textbf{Requirements} = \textit{what} \quad\quad \textbf{Design} = \textit{how}}$$

设计就是我们承诺一种*实现需求的方式* —— 它是从"系统应当做 X"到"真正实现 X 的代码"之间的桥梁。

---

## 4. 软件设计的目标与活动

设计**不是单一动作**。它由两类工作混合而成：一类大而靠前，一类小而迭代。

### 4.1 系统级决策

这些决策作用于整个系统，通常在早期一次性确定：

- 架构（风格、组件、连接器）
- 编程语言
- 库与框架
- 平台（Web、移动、桌面、嵌入式）
- 通信协议（HTTP、gRPC、MQTT、……）

### 4.2 较低层级的*迭代式*决策

设计工作的大部分是小规模、不断重复的循环：

1. **研究问题** — 理解眼前的需求或子问题
2. **识别解法** — 草拟候选设计
3. **创建抽象** — 选定结构、类、屏幕或数据格式
4. **评估** — 检验候选方案，再次迭代

> 设计不是"决定一次，永远写代码"。它是嵌套在循环里的循环：高层有一个面向系统级决策的大循环，模块、类、UI 层面则有许多小循环。**迭代（iterative）**这个词在这一讲里出现的次数和架构那一讲一样多。

---

## 5. 软件设计的六种方法

课程列出**六种设计方法**（也是 Quiz 5 会考的那六种）。每一种都是一个不同的*视角* —— 一种把系统拆解开来、让设计问题变得可处理的方式。

| # | 方法 | 它按什么对系统进行分解 |
|---|------|------|
| 1 | **软件架构（Software architecture）** | 主要的/结构性的决策（第四周） |
| 2 | **功能分解（Functional decomposition）** | 功能 |
| 3 | **关系数据库设计（Relational database design）** | 数据 |
| 4 | **面向对象设计与 UML（Object-oriented design and UML）** | 领域中的实体 + 每个实体的功能 |
| 5 | **用户界面设计（User interface design）** | 面向用户的屏幕，反复迭代 |
| 6 | **草图（Sketching）** | 自由形式的画图（Lecture 10 中详细介绍） |

### 5.1 功能分解

构建一棵从根到叶的功能树。讲义示例 —— 一个名为 "Achieve" 的目标追踪 app：

```
0. Achieve
├── 1. Authenticate
│   ├── 1.1 Login
│   └── 1.2 Logout
├── 2. Goal Setting
│   ├── 2.1 Create goal
│   ├── 2.2 Edit goal
│   ├── 2.3 Delete goal
│   └── 2.4 Mark goal complete
└── 3. Messaging
    ├── 3.1 View message
    ├── 3.2 Send message
    └── 3.3 Delete message
```

> 通过*分解功能*来驱动设计过程。当系统的本质最适合被表述为"它能做的一组事情"时，这种方法很有用。

### 5.2 关系数据库设计

通过*分解数据*来驱动设计过程。系统被描述为**表（tables）**、表中的**列（columns）**，以及把它们连接在一起的**键（keys）**（例如 `Publishers` 表、`Authors` 表与 `Books` 表通过 `PubID` 和 `AuthorID` 关联）。

> 当系统的本质最适合被表述为"它存储的数据以及数据之间的关系"时，这种方法很有用。

### 5.3 面向对象设计与 UML

- **对象（object）**同时包含**数据**和**方法**。
- **类（class）**是**用来制造对象的蓝图**。

通过*分解领域中的实体以及伴随每个实体的功能*来驱动设计过程。讲义中的 **Student / Enrollment / Seminar / Professor** UML 图就是经典示例 —— 每一个现实世界的事物都成为一个类，带有自己的属性（数据）和操作（方法），并通过关系与其他类相连。

> 当系统的本质最适合被表述为"一组相互交互的事物"时，这种方法很有用。

### 5.4 用户界面设计

通过*设想用户界面并不断迭代*来驱动设计过程。Mockup（线框稿）和 wireframe（有时手绘，有时使用 **InVision**、**Balsamiq** 这样的工具完成）就是设计产物，每一轮迭代都让 UI 更精确。

> 当系统的本质最适合被表述为"用户看到什么、做什么"时，这种方法很有用。

### 5.5 草图（Sketching）

最非正式的方法 —— 用铅笔/白板的画作快速探索想法。在 Lecture 10 中作为"其他图示"之一更深入展开。

---

## 6. 设计与模型 — 它们长什么样

Lecture 9 用了好几张幻灯片展示*设计*在实际中究竟长什么样。这部分的目的是**拓宽**学生对"设计"的心理图像，让它不再局限于类似代码的产物：

| 类型 | 讲义中展示的例子 |
|------|------|
| **草图（Sketches）** | 餐巾纸上手绘的草稿、笔记本上潦草的形状与箭头 |
| **物理模型（Physical models）** | 建筑物、街区的 3D 实物模型 |
| **蓝图（Blueprints）** | 建筑的平面图（标注房间名称、尺寸） |
| **白板模型（Whiteboard models）** | 一整面墙的多色白板涂鸦 —— 方框、箭头、公式，全景照拍下 |
| **UML 类图（UML class diagrams）** | 正式的"三段式带箭头的方框" |

> 共同模式：设计是**任何对未来系统的结构或行为的外部表示**。它可以是涂鸦，也可以是精确的 UML 图，它们都处在同一个连续谱上。

---

## 7. 设计的目的：思考、交流、规约

设计师生产设计有**三个**理由，再加一个所有设计共有的元属性。

| 目的 | 设计是为了什么 |
|------|------|
| **Designs to think（用于思考的设计）** | 辅助设计师本人的推理 —— 把系统画到纸上，让大脑可以操控它 |
| **Designs to talk（用于交流的设计）** | 一份共享产物，用来与队友、客户或其他利益相关者讨论系统 |
| **Designs to prescribe（用于规约的设计）** | 一份规格说明，*明确*告诉实现者要构建什么 |

而那个元属性是：

$$\boxed{\textbf{Designs are developed iteratively.}}$$

设计很少是一次写就的 —— 它会经过多次迭代被草拟、讨论、修订、收紧，最终才足够规约性以交给实现者。同一份设计可能*开始*是一张"用于思考"的涂鸦，*在会议中*变成"用于交流"的图，*最后*在设计文档里变成"用于规约"的 UML 类图。

> Quiz 5 提示：讲义里写的是 *think, talk, prescribe*，而 Quiz 复习页用的是 *think, communicate, prescribe* —— 它们意思相同。这里的 "talk" 与 "communicate" 可以互换。

---

## 8. 抽象 — 软件工程的核心动作

### 8.1 什么是抽象

$$\boxed{\textbf{Abstraction} = \text{removing irrelevant information and retaining/highlighting the relevant information}}$$

我们使用的每一种设计记号 —— UML 类图、ER 图、Mockup、伪代码、架构图 —— 都是一种**抽象**的方式。每种记号都丢弃了某些东西，强调了另一些东西。

### 8.2 每种记号都有自己专属的抽象

| 记号 | 它强调什么 | 它抽象掉了什么 |
|------|------|------|
| 功能分解树 | 系统**做什么** | 数据、类、屏幕 |
| 关系模式 | **数据**及其关系 | 行为、屏幕 |
| UML 类图 | **实体**及其静态关系 | 时间、动态行为、UI |
| UI Mockup | 用户**看到什么** | 内部逻辑、数据布局 |
| 架构图 | 高层**组件与连接器** | 内部类结构、代码 |
| 代码 | 每一个可执行细节 | 没有抽象 —— 但你也再看不见整片森林 |

> 没有任何单一的记号能捕捉一切。不同的设计问题需要不同的记号，这也是设计师为什么要学很多种记号的原因。

### 8.3 那个核心论断

> **软件工程的本质是构建并精化抽象/模型（abstractions/models）。**

这是 Lecture 9 的总结性命题，并在 Lecture 10 中再次出现，措辞稍变：*"软件工程是构建一组相互关联的模型，用以表示未来系统的过程。"* 当课程说软件工程是关于"模型"的，它指的是**一组相互关联的模型** —— 不是一张总图，而是好几张，每一张都从不同角度抽象出系统的某一面。

---

## 9. 设计记号与语言（Lecture 10）

Lecture 10 重新框定设计阶段，先后退一步问：*在软件开发的每个阶段，我们使用的是什么语言？*

### 9.1 不同阶段使用不同语言

| 阶段 | 语言 |
|------|------|
| **需求（Requirements）** | 英语（或其他自然语言） |
| **设计（Design）** | **图示 / UML** |
| **编码 / 测试（Coding / Testing）** | Java、Python 等 |

> 设计记号是*设计阶段的语言* —— 它们在精确度的连续谱上处于英语与代码之间。图示足够精确，可以支持推理；又足够宽松，可以与非程序员讨论。

### 9.2 记号为什么重要

讲义引用了 A.N. Whitehead 在 1911 年的话：

> *A good notation relieves the brain of unnecessary work and frees it to concentrate on more advanced problems.*
> （好的记号能减轻大脑的不必要负担，让它专注于更高级的问题。）

要点：**好的记号不是装饰性的选择** —— 它就是设计师思考方式的一部分。UML、ER 图、Mockup、伪代码，都是为了提供一种能让设计师在合适抽象层级上推理的记号。

---

## 10. UML 类图

### 10.1 什么是 UML

**UML（Unified Modeling Language，统一建模语言）**是软件设计与建模的**行业标准**。它是一*族*图示类型，每一种捕捉系统的不同方面：

- **类图（Class diagrams）** — 结构（Lecture 10 的重点）
- **活动图（Activity diagrams）** — 工作流 / 控制流
- **顺序图（Sequence diagrams）** — 随时间的交互
- **用例图（Use case diagrams）** — 参与者与系统的交互
- ……以及更多

### 10.2 类图是用来做什么的

UML 类图用于**把系统分解成称为 "类（classes）" 的模块**。典型用途：

- **建模领域概念**（问题空间中的实体）
- **创建详细的、面向对象的代码设计**

### 10.3 类的方框

一个类被画成带有**三个分区**的方框：

| 分区 | 包含什么 |
|------|------|
| 上 | 类名 |
| 中 | 属性（数据字段），带类型 |
| 下 | 操作（方法），带参数和返回类型 |

**可见性标记：**

| 符号 | 含义 |
|------|------|
| `+` | **public（公有）** |
| `−` | **private（私有）** |

> **可见性标记（`+` / `−`）和返回类型在 UML 记号里都是*可选的*。** 在类图中省略其中部分或全部是很常见的 —— 尤其是在早期/非正式的设计中，目标只是传达结构。它们会随着图变得更*规约性*而被逐渐填上。

通用模板：

```
+-----------------------------------------+
|              Class Name                 |
+-----------------------------------------+
| -attribute : Type                       |
| -attribute : Type                       |
+-----------------------------------------+
| +operation(parameter) : ReturnType      |
| +operation(parameter) : ReturnType      |
+-----------------------------------------+
```

![UML 类图的标准三段式方框结构：上方写类名，中间列属性（带类型），下方列操作（带参数和返回类型）。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/uml-class-box-template.png)

### 10.4 翻译为代码 — `Airplane` 示例

UML 类：

```
+--------------------------+
|        Airplane          |
+--------------------------+
| - speed : int            |
+--------------------------+
| + getSpeed() : int       |
| + setSpeed(int) : void   |
+--------------------------+
```

等价的 Java 代码：

```java
public class Airplane {
    private int speed;

    public Airplane(int speed) {
        this.speed = speed;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }
}
```

使用：

```java
Airplane a = new Airplane(5);
a.setSpeed(10);
System.out.println("" + a.getSpeed());
```

![Airplane 类图与 Java 代码的对应关系：UML 中的属性 -speed:int 翻译为 private int speed，操作 +getSpeed():int / +setSpeed(int):void 直接对应 public 方法。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/airplane-class-to-code.png)

> 注意这种直接对应：`−` 变成 `private`，`+` 变成 `public`，属性变成字段，操作变成方法，参数与返回类型一一对照。这正是 UML 类图在面向对象设计中如此常用的原因 —— 它几乎可以机械地翻译成代码。

### 10.5 规范性 vs. 描述性 UML — 与第四周的呼应

第四周讲架构时讨论的**规范性（prescriptive）vs. 描述性（descriptive）**区分，同样适用于 UML 类图：

| 视角 | 这张图从何而来 |
|------|------|
| **规范性 UML** | 由*设计师*在写代码之前画出 —— *预期的*类结构 |
| **描述性 UML** | 由工具**从已有代码中自动生成** —— *实际的*类结构 |

读取源码并产出 UML 类图的工具（"逆向工程 / reverse engineering"）让团队可以**比较规范性与描述性**，从而检测**设计侵蚀（design erosion）** —— 与架构侵蚀完全类比。如果描述性图中包含规范性图所没有的类、字段或关系（或反之），就说明实现已经偏离了设计。

> 规范性/描述性这一视角，从架构层级再向下推一层就到了类设计层级。侵蚀不是只在第四周出现的现象 —— 凡是有"计划好的模型"必须跟上"不断演化的代码"的地方，它都会出现。

---

## 11. 类与类之间的关系

类从不孤立存在。UML 定义了多种关系类型；本讲覆盖的四种是**继承、关联（带多重性）、聚合、组合**。

### 11.1 继承（Inheritance）

画作一支**空心三角箭头**，从子类指向父类。子类继承父类的属性和方法，并可以自己增加新的。

例子：`Hippo` 继承自 `Animal`。`Animal` 拥有 `food type`、`location`、`makeNoise()`、`eat()`、`roam()`。`Hippo` 添加 `submerged: boolean` 和 `submerge()`，并覆盖 `makeNoise()` 与 `eat()`。

```
        Animal
        ▲
        │  (inheritance)
        │
        Hippo
```

![UML 继承关系：Hippo 通过空心三角箭头指向 Animal，表示 Hippo 是一种 Animal，继承父类的属性与方法，并可以覆盖（如 makeNoise/eat）或新增（如 submerged/submerge()）。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/inheritance-hippo-animal.png)

### 11.2 关联（Association）

两个类之间的一条普通连线表示这两个类**以某种方式连接在一起**。关联可以通过三种方式被丰富：

| 丰富方式 | 它增加了什么 |
|------|------|
| **标签**（例如 `takes class from`） | 描述这个关系的名字 |
| **方向**（箭头） | 哪个类"知道"另一个类 |
| **多重性**（两端的数字） | 每个类各有多少个参与其中 |

讲义中持续使用的例子是 **Student** 和 **Instructor**：

- 普通连线 = "Student 与 Instructor 关联"
- Student 端 `1...*` 与 Instructor 端 `1` = "一个 Instructor 对多个 Student"
- 两个标签（`listens to` / `teaches`）= 这个关系有方向性的读法
- 从 Router 指向 DomainNameServer 的箭头 = "Router 知道 DNS，但 DNS 不知道 Router"

**当注解缺失时的默认约定：**

| 当你看到…… | 默认含义 |
|------|------|
| **没有箭头**（普通连线） | **双向** —— 两个类都互相知道对方 |
| **只有一端有箭头** | **单向** —— 只有源类知道目标类 |
| **没有多重性数字** | 默认是 **1 对 1** |
| **没有标签** | 关联存在，但没有名字 |

> 这些默认值在小测中很重要：两个类之间一条无装饰的连线*不是*"未提供信息"，它**明确表示双向 1 对 1**。加上箭头或多重性正是用来从这个默认值*收紧*关系的方式。

![Student / Instructor 关联示例：从最朴素的"takes class from"标签连线，到带 1...* 与 1 多重性的"一个 Instructor 对应多个 Student"，再到带方向标签 listens to / teaches 的双向描述，最后是 Router → DomainNameServer 的"只能单向导航"箭头。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/association-student-instructor.png)

### 11.3 多重性（Multiplicity）

多重性标注在关联线的**端点**：

| 记号 | 含义 |
|------|------|
| `1` | 恰好一个 |
| `0..1` | 零个或一个（可选） |
| `*` 或 `0..*` | 零个或多个 |
| `1..*` | 一个或多个（至少一个） |
| `2..5` | 二到五（含两端） |

讲义中的六行表：

| A — B | 读法 |
|------|------|
| `A —— B`（无数字） | 每个 A 对应一个 B；每个 B 对应一个 A |
| `A 1 ←→ 1 B` | 同上 |
| `A 1 —— * B` | 每个 A 对应零或多个 B；每个 B 对应一个 A |
| `A * —— * B` | 每个 A 对应零或多个 B；反之亦然 |
| `A 1 —— 2..5 B` | 每个 A 对应二到五个 B；每个 B 对应一个 A |
| `A —→ * B` | 每个 A 对应零或多个 B；**B 对 A 一无所知** |

> 最后一行里箭头承担了额外的工作：这个关系**只能在一个方向上导航（navigable）**。A 持有指向若干 B 的引用，但 B 不持有指回 A 的引用。

![多重性记号六例：1↔1（双向单数）、1↔1（带数字版）、1—*（一对多）、*—*（多对多）、1—2..5（一对二到五）、—→*（单向多对一无所知）。每一行都用一对 A、B 类方框 + 端点数字 + 连线/箭头 表达。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/multiplicity-examples.png)

### 11.4 整体-部分：聚合（Aggregation）

**聚合** = "一个对象**包含**（或由）一组其他对象**组成**"。在*整体*那一端画**空心菱形**。

- 聚合关系是**可传递的**（如果 A 聚合 B，B 聚合 C，那么 A 聚合 C）
- 聚合关系是**非对称的**（如果 A 聚合 B，那么 B 不聚合 A）

例子：一个 `Crate`（板条箱）包含若干 `Bottle`（瓶子）。瓶子可以独立于板条箱存在；板条箱只是*装着*它们。

![聚合（Aggregation）：在整体一端画空心菱形。Crate 聚合 Bottle —— 板条箱"装着"瓶子，但瓶子可以独立于板条箱存在。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/aggregation-crate-bottle.png)

### 11.5 整体-部分：组合（Composition）

**组合** = 聚合的*更强*变体，**额外引入存在依赖（existence dependency）**。在整体那一端画**实心菱形**。

定义性的属性：**如果整体被销毁，部分也随之被销毁**。部分不能独立存在。

例子：一个 `House` 由若干 `Room` 组成。如果 House 被拆除，它的 Room 也就不再作为存在物存续了。

| 属性 | 聚合（◇） | 组合（◆） |
|------|------|------|
| 整体"包含"部分 | 是 | 是 |
| 部分可以独立存在 | 是 | **否** |
| 符号 | 空心菱形 | 实心菱形 |

> "板条箱/瓶子"对比"房屋/房间"是记忆这两者差别的标准方式：瓶子能离开板条箱，房间不能离开房屋。

![组合（Composition）：在整体一端画实心菱形。House 组合 Room —— 房间不能独立于房屋而存在；房屋被拆除时房间也随之消亡。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/composition-house-room.png)

---

## 12. 其他 UML 图

除了类图之外，讲义简要预览了另外三种 UML 图。这些不是 Quiz 5 的重点，但能展现 UML 的广度。

### 12.1 活动图（Activity diagram）

像是一张活动流程图。讲义示例是一台 ATM：

```
Insert Card → Enter PIN → ◇ decision
                          │
                  [Invalid PIN] → Confiscate PIN
                  [Valid PIN]   → Display Menu → ●
```

捕捉**控制流（control flow）**：哪个活动接哪个，决策在哪里分支。

![ATM 取款的 UML 活动图：从 Insert Card 流向 Enter PIN，再到决策菱形 —— 无效 PIN 流向 Confiscate Card，有效 PIN 流向 Display Menu，最终走到结束节点（实心圆）。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/activity-diagram-atm.png)

### 12.2 顺序图（Sequence diagram）

由若干**生命线（lifeline）**（垂直的虚线，每条对应一个参与者或系统）构成的网格，**横向箭头**表示它们之间按*时间顺序*（自上而下）交换的消息。

捕捉**随时间发生的交互**：谁调用谁，按什么顺序。

![UML 顺序图示例：每个参与者一条垂直生命线（虚线），横向箭头表示按时间顺序（自上而下）发出的消息，捕捉"谁调用谁，按什么顺序"。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/sequence-diagram-example.png)

### 12.3 用例图（Use case diagram）

外部画**简笔人形（stick figure）**作为参与者（actor），系统边界内画**带标签的椭圆**（use case）。线条表示哪个 actor 参与哪个 use case。

捕捉**用户能用系统做什么**：例如对一家航空公司，*Passenger* 参与 *Check-In, Automated Check-In, Express Check-In, Boarding*；*Check-In Representative* 参与 *Check-In*；等等。

![航空公司用例图：Passenger 简笔人形位于系统边界之外，参与 Check-In、Automated Check-In、Express Check-In、Boarding 这些椭圆 use case；Check-In Representative 参与 Check-In。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/use-case-airline.png)

---

## 13. 其他（非 UML）图

UML 只是众多设计记号中的一种。讲义专门走过几种**非 UML** 记号，强调一个观点：设计师会使用任何最适合问题的记号。

| 记号 | 捕捉什么 | 典型工具/媒介 |
|------|------|------|
| **UI Mockup** | 用户看到什么 | 手绘草图、**Balsamiq**、Figma |
| **伪代码（Pseudo code）** | 算法逻辑 | 含 `Begin / Until / If / End` 等关键字的纯文本 |
| **实体-关系图（ER 图）** | 数据实体及其关系 | ER 记号（实体用矩形，关系用菱形，属性用椭圆） |
| **架构图** | 高层组件与连接器 | 方框-箭头（例如 Mail Server ↔ Mail Server，使用 SMTP、POP/IMAP） |
| **故事板（Storyboards）** | UI/使用过程的*序列*片段，连环画风 | 手绘草图或漫画分镜 |
| **草图** | 任何东西，非常松散 | 白板、餐巾纸 |

> 这些 —— 包括 UML 与非 UML —— 全都是*某种带语法的语言中的语句*。每种记号都是这门语言；每张图都是这门语言中的一句话。

---

## 14. 什么是软件工程？（再次定义）

走过所有这些记号之后，Lecture 10 重新陈述了软件工程的定义：

$$\boxed{\textbf{Software engineering} = \text{the process of building a set of \textit{related models} that represent the system-to-be.}}$$

关键词是 **related（相互关联）**。一个真实项目会产出**许多**模型 —— UML 类图、顺序图、ER 图、架构图、UI Mockup、伪代码 —— 工程师的工作就是让它们彼此**保持一致**，并与最终代码一致。

---

## 15. 设计原则 — 内聚、耦合、信息隐藏

讨论*好的*设计时，主导的两条原则是：

### 15.1 高内聚 / 低耦合

| 术语 | 定义 |
|------|------|
| **内聚（Cohesion）** | 一个模块*内部*的元素之间彼此关联得有多紧 |
| **耦合（Coupling）** | *不同*模块之间彼此依赖得有多强 |

原则：

$$\boxed{\textbf{Aim for HIGH cohesion } (\text{group related things together})\textbf{ and LOW coupling } (\text{keep unrelated things apart}).}$$

把这一条做对的好处：

- **变更不会扩散**。一个模块内部的修改就停留在那个模块里，不会沿系统级联蔓延。
- **复用更容易**。一个高内聚的模块只把一件事做好，因而更容易被插入其他系统使用。

讲义里的经典图示：编号 1–10 的十个节点，被划分到模块 A、B、C 中。

| 糟糕的设计 ☹ | 好的设计 ☺ |
|------|------|
| **低内聚** —— 相关节点散落在多个模块 | **高内聚** —— 相关节点被聚到同一个模块 |
| **高耦合** —— 跨越模块边界的连线很多 | **低耦合** —— 跨越模块边界的连线很少 |

![内聚与耦合的对照视觉：左图低内聚 / 高耦合 —— 编号 1–10 散落在模块 A、B、C，跨模块连线密集；右图高内聚 / 低耦合 —— 相关节点聚到同一模块，跨模块连线稀疏。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-5/cohesion-coupling.png)

### 15.2 信息隐藏（Information Hiding）

**信息隐藏** = 把那些最有可能变化的设计决策藏起来，从而保护程序的其他部分免受这些变化影响。

讲义中引用的定义值得记住：

> *Showing only those details to the outside world which are necessary for the outside world, and hiding all other details from the outside world.*
> （只向外界展示外界必须知道的细节，把其他细节都藏起来。）

它与耦合的关系是直接的：信息隐藏是降低耦合的一种*技术手段*。如果模块 A 只暴露一个小小的公共接口，模块 B 就只能依赖这个接口 —— 而不是 A 的内部 —— 因此 A 的内部可以自由变化而不破坏 B。

### 15.3 这些原则为什么重要

两条原则都服务于第一周提出的**预期变化（anticipation of change）**原则：

| 原则（第五周） | 服务于（第一周） |
|------|------|
| 高内聚 / 低耦合 | 预期变化、复用、关注点分离 |
| 信息隐藏 | 预期变化、抽象 |

---

## 16. Quiz 5 复习要点

需要掌握并理解：

- **软件设计的六种方法**
  - 软件架构（Software architecture）
  - 功能分解（Functional decomposition）
  - 关系数据库设计（Relational database design）
  - 面向对象设计（Object-oriented design，含 UML）
  - 用户界面设计（User interface design）
  - 草图（Sketching）
  - 对每一种：要知道它按什么对系统进行分解

- **设计的目的**
  - **Think（思考）** —— 辅助设计师本人推理
  - **Communicate（交流）**（也叫 *talk*） —— 与利益相关者/队友共享
  - **Prescribe（规约）** —— 明确告诉实现者要构建什么
  - 还有：设计是*迭代*开发出来的

- **抽象**
  - 移除无关信息，保留/突出相关信息
  - 每种设计记号都支持一种特定的抽象
  - 软件工程 = 构建并精化抽象/模型

- **图示**
  - **UML 类图**：类方框（名字 / 属性 / 操作），`+` 公有，`−` 私有，向代码的对应映射
  - **关联**：连线、标签、方向（箭头）、多重性
  - **多重性**：`1`、`0..1`、`*`、`0..*`、`1..*`、`2..5`
  - **聚合**（空心菱形）vs **组合**（实心菱形，多了*存在依赖*）

- **设计原则**
  - **高内聚 / 低耦合** —— 各自含义，以及为什么两者都重要（变更不扩散、便于复用）
  - **信息隐藏** —— 藏起最有可能变的；只暴露外界必须知道的

---

## 17. 总结与记忆框架

```text
Week 5 knowledge structure
|
+-- Where we are
|   +-- Requirements (what)  -> Architecture  -> Design (how)  -> Code
|   +-- Design = ALL creative decisions; architecture is the
|       "principal" subset
|   +-- Design covers: structure, behavior, interaction,
|       non-functional properties
|
+-- Goals/activities of design
|   +-- system-wide decisions (architecture, language, libraries,
|   |                          platforms, protocols)
|   +-- iterative lower-level loop:
|       study problem -> identify solutions -> create abstractions
|       -> evaluate -> repeat
|
+-- Six approaches to software design
|   +-- 1. Software architecture            (Week 4)
|   +-- 2. Functional decomposition         -> break down FUNCTIONALITY
|   +-- 3. Relational database design       -> break down DATA
|   +-- 4. Object-oriented design + UML     -> break down ENTITIES + their FUNCTIONALITY
|   +-- 5. User interface design            -> envision UI, iterate
|   +-- 6. Sketching                        -> free-form, fast, informal
|
+-- Designs / Models
|   +-- can be: sketches, physical models, blueprints,
|   |           whiteboard scribbles, UML diagrams
|   +-- purposes: think | talk (communicate) | prescribe
|   +-- always developed ITERATIVELY
|
+-- Abstraction
|   +-- = remove irrelevant info, retain relevant info
|   +-- every design notation supports a kind of abstraction
|   +-- SE = constructing & elaborating abstractions/models
|
+-- Design notations / languages
|   +-- Requirements -> English
|   +-- Design       -> Diagrams / UML
|   +-- Coding       -> Java, Python, ...
|   +-- Whitehead: good notation frees the brain
|
+-- UML
|   +-- industry standard
|   +-- class diagrams, activity diagrams, sequence diagrams,
|       use case diagrams, ...
|
+-- UML class diagrams
|   +-- 3-compartment box: name | attributes | operations
|   +-- visibility: + public, - private
|   +-- mechanical mapping to code (Airplane example)
|
+-- Relationships between classes
|   +-- Inheritance     (hollow triangle: child -> parent)
|   +-- Association     (line; can have label, direction, multiplicity)
|   |   +-- multiplicity: 1, 0..1, *, 0..*, 1..*, 2..5
|   +-- Aggregation     (hollow diamond on the whole)
|   |   +-- transitive + asymmetric
|   |   +-- parts can exist independently  (crate / bottle)
|   +-- Composition     (filled diamond on the whole)
|       +-- variant of aggregation
|       +-- adds EXISTENCE DEPENDENCY  (house / room)
|
+-- Other UML diagrams
|   +-- Activity   (control flow)
|   +-- Sequence   (interaction over time)
|   +-- Use case   (actors x system functions)
|
+-- Other (non-UML) diagrams
|   +-- UI mockups (Balsamiq)
|   +-- Pseudo code
|   +-- ER diagrams
|   +-- Architecture diagrams
|   +-- Storyboards
|   +-- Sketches
|
+-- "What is SE?" (restated)
|   +-- the process of building a set of RELATED MODELS
|       that represent the system-to-be
|
+-- Design principles
|   +-- High cohesion (group related)
|   |   /  Low coupling (separate unrelated)
|   |   -> changes don't propagate
|   |   -> reuse is facilitated
|   +-- Information hiding
|       -> hide decisions most likely to change
|       -> expose only what the outside world needs
|       -> serves anticipation of change
```

### 一句话总结

> 设计是回答需求"做什么（what）"之后的"怎么做（how）"—— 它是迭代地产出一组相互关联的模型（UML 类图/活动图/顺序图/用例图、ER 图、UI Mockup、伪代码、草图、架构图），这些模型从不同角度抽象出未来的系统，每种记号都支持不同的抽象；UML 类图（带 `+` / `−` 可见性、带多重性的关联、继承、以及聚合 vs. 组合）是面向对象结构的主力工具，而整项工作的好坏由它在多大程度上做到 **高内聚 / 低耦合** 与 **信息隐藏**、从而让变化能被吸收而不级联，来评判。
