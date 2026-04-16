# Informatics 43 — 第三周课程笔记

## 目录

1. [用例（Use Case）— 是什么和为什么](#1-用例use-case--是什么和为什么)
2. [流程（Flow）的三种类型](#2-流程flow的三种类型)
3. [为什么用 Use Case（以及为什么不用）](#3-为什么用-use-case以及为什么不用)
4. [参与者（Actor）](#4-参与者actor)
5. [识别用例](#5-识别用例)
6. [构建一个用例](#6-构建一个用例)
7. [用例示例](#7-用例示例)
8. [用例模板](#8-用例模板)
9. [用例图（Use Case Diagram）](#9-用例图use-case-diagram)
10. [用例模型 — 全部整合在一起](#10-用例模型--全部整合在一起)
11. [社会影响与伦理](#11-社会影响与伦理)
12. [ACM/IEEE 软件工程伦理准则](#12-acmieee-软件工程伦理准则)
13. [Quiz 3 复习要点](#13-quiz-3-复习要点)
14. [总结与记忆框架](#14-总结与记忆框架)

---

## 1. 用例（Use Case）— 是什么和为什么

### 1.1 定义

$$\boxed{\textbf{Use Case} = \text{一段文本描述,刻画 actor 与系统之间为达成某个目标所发生的一系列交互}}$$

用例用平实的文本描述用户(或其他外部实体)如何与系统一步步交互、最终完成某件有意义的事。它不是代码、不是界面设计稿、也不是架构图 —— 它是一个从外部视角讲述系统行为的"故事"。

### 1.2 用例必须包含的内容

每一个用例应当描述:

| 要素 | 含义 |
|------|------|
| **Basic functionality / goal**(基本功能/目标) | actor 想要达成的事情 |
| **Precondition**(前置条件) | 用例开始之前必须为真的条件 |
| **Flow of events**(事件流) | 发生的步骤序列 |
| **Postcondition**(后置条件) | 用例成功完成之后为真的条件 |
| **Error condition / alternative flow** | 偏离正常路径时会发生什么 |

### 1.3 与需求的关系

> 用例与需求是 **hand-in-hand**(手牵手)的关系。它**不是**取代第二周学的需求规约文档(SRS),而是一种**互补**的技术 —— 它以一种顾客和开发者都容易阅读和验证的形式,来捕捉系统的行为。

---

## 2. 流程(Flow)的三种类型

### 2.1 什么是 Flow

**Flow** = 描述"用户"与"系统"之间交互的一段步骤序列。一个用例本质上是**一组 flow 的集合** —— 这些 flow 合在一起共同完成某个特定的用户目标(goal)。

### 2.2 三种 Flow

| Flow 类型 | 含义 |
|------|------|
| **Basic Flow**(基本流) | "Happy day" 顺利场景 —— 一切按预期发生,目标达成 |
| **Alternative Flow**(替代流) | 目标依然达成,但走的是另一条路径(例如快捷方式、不同的起点、可选路径) |
| **Exception Flow**(异常流) | 目标**没有**达成 —— 出错了(无效输入、系统错误、数据缺失) |

> 一个用例必须捕捉**所有可能的 flow** —— 既包括成功的也包括失败的。**只写 happy path 是写用例时最常见的错误之一。**

---

## 3. 为什么用 Use Case(以及为什么不用)

### 3.1 用例的优势 —— 相比其他需求工程方法

| 其他需求工程方法 | Use Case |
|------|------|
| 可能难以映射到设计/代码 | **能很好地映射到**设计与实现 |
| 可能难以转化为验收测试 | 让验证设计与实现**变得容易** —— 直接对照用户目标 |
| 非专家可能难以理解 | **以用户目标和事件流为框架**,非技术人员也能读懂 |

### 3.2 用例**不擅长**什么

用例**不适合**用来描述:

- **用户界面(UI)** —— 用例说"发生了什么",而不是屏幕长什么样
- **数据格式** —— 用例不定义 schema、文件类型或消息结构
- **业务规则(Business rules)** —— 复杂的政策与约束应放在别处
- **非功能需求(Non-functional requirements)** —— 第二周学的"-ility"(性能、安全、可扩展性等)无法用用例来捕捉

> **最佳实践:** 用例应当与其他需求工程方法**配合使用**。它只是工具箱里的一件工具,不是工具箱本身。

---

## 4. 参与者(Actor)

### 4.1 什么是 Actor

**Actor** 代表与系统交互的**外部(external)** 实体。"外部"这一点很重要 —— actor 存在于**系统边界(system boundary)之外**。

Actor 可以是:

- **人类**(顾客、管理员、技术员)
- **硬件**(传感器、打印机、读卡器)
- **另一个软件系统**(支付网关、第三方 API、遗留数据库)

### 4.2 主要参与者(Primary Actor)与对话(Dialogue)

用例由某个 actor 发起,具体来说是 **primary actor**(主要参与者),用于触发系统的某项功能。用例本身本质上是 actor 与系统之间的一段**对话(dialogue)**。

在用例图中,actor 用一个**简笔小人(stick figure)** 表示。

### 4.3 识别 Actor —— 实用问题(第一组)

通过阅读系统文档、与客户和领域专家交流来发现 actor。入门问题:

- 谁**使用**这个系统?
- 谁**安装**这个系统?
- 谁**启动**这个系统?
- 谁**关闭**这个系统?
- 还有哪些**设备和外部系统**直接与这个系统协作?

### 4.4 识别 Actor —— 实用问题(第二组)

除了基础问题,还可以问:

- 谁**从这个系统获取信息**?
- 谁**向系统提供信息**?
- 是否有事情会在**预设时间自动发生**?(调度器也算 actor)
- 谁**对某个特定需求感兴趣**?
- 系统在组织内的**哪个位置**被使用?
- 谁会从系统的使用中**受益**?
- 谁会**支持和维护**系统?
- 系统是否使用了**外部资源**?
- 是否有**一个人扮演多个角色**?(一人对多 actor)
- 是否有**多个人扮演同一角色**?(多人对一 actor)
- 系统是否与**遗留系统(legacy system)** 交互?

### 4.5 练习 —— ToDo List App 的 Actor

为 ToDo List App 头脑风暴 actor:终端用户(管理任务的人)、管理员、日历服务(外部软件系统)、通知服务、备份/云同步服务,以及在共享任务时可能涉及的其他用户。

---

## 5. 识别用例

确定了 actor 之后,通过以下问题来推导用例:

- actor 想要从系统中获得哪些**功能**?
- 每个 actor 的**任务**是什么?
- 系统是否**存储信息**?哪些 actor 会对信息执行 **CRUD**(create/read/update/delete)?
- 哪些用例会用于**支持和维护**系统?
- **所有功能需求**是否都能被用例所执行?*(这是覆盖率检查 —— 每个功能需求都应至少映射到一个用例。)*

---

## 6. 构建一个用例

### 6.1 范围指引

定义单个用例的范围时:

- 描述 ***what*(做什么),而不是 *how*(怎么做)**
- 使用**面向目标读者的术语**,不要用客户听不懂的行话
- 必须包括:
  - 用例**如何开始和结束**
  - 用例与 actor 之间的**交互序列**
  - 用例期间需要/交换的**数据**
  - **Basic flow**
  - **Alternative / exception flow**(如适用)

### 6.2 构建步骤

1. **命名**用例(一个简短的动词短语,例如 "Buy a Product"、"Add Item Deadline")
2. **描述 Basic Flow**,作为编号的步骤序列
3. **添加变体**(如适用):
   - Alternative Flow(其他成功路径)
   - Exception Flow(失败路径)

---

## 7. 用例示例

### 7.1 示例:Buy a Product(购买商品)

**Basic Flow**

1. Customer browses catalog and selects items to buy
2. Customer goes to check out
3. Customer fills in shipping information
4. System presents full pricing information, including shipping
5. Customer fills in credit card information
6. System authorizes purchase
7. System confirms sale immediately
8. System sends confirmation email to customer

**Alternative Flow** —— *3a. Customer is regular (repeat) customer*

1. System displays current shipping, pricing, and billing information
2. Customer may accept or override defaults, returns to BF at step 6

> 注意编号约定:`3a` 表示"从 Basic Flow 第 3 步分支出去的一个替代路径"。Alternative flow 通常以"return to BF at step N"作为结束。**BF = Basic Flow**。

### 7.2 示例:Add Item Deadline(添加任务截止日期)

**Basic Flow**

1. User selects list item to which they want to add a deadline
2. System presents detailed view of list item (name, completed/not completed, description)
3. User selects the deadline field
4. System presents user with a way to enter a date and time
5. User enters date and time for deadline
6. System shows item with new deadline

**Alternative Flow** —— *5a. User wants to add deadline to calendar*

1. After adding deadline, user selects an option to post to calendar
2. System posts deadline to calendar, displays a confirmation to user
3. Return to BF at step 6

**Exception Flow** —— *5a. Date/time is invalid*

1. System notifies user that date/time is invalid, deadline not added to item

> 这个例子在一个用例中同时展示了三种 flow 类型。注意:Alternative flow 和 Exception flow 可以从**同一个步骤号**分支出去 —— 标签(`5a`)在每种 flow 类别内是独立的。

### 7.3 示例:Toggle Completed State(切换完成状态)

**Basic Flow**

1. User selects list item they wish to toggle
2. System presents detailed view of list item (name, completed/not completed, description)
3. User toggles completed state
4. System shows item with new completed state

**Alternative Flow** —— *1a. User swipes left on list item*

1. System displays the option to toggle completed state
2. User confirms selection
3. Return to BF at step 4

> 这里的 alternative 是一个**基于手势的快捷方式** —— 完全跳过了详细视图,并在最后一步重新汇入 basic flow。

---

## 8. 用例模板

正式书写用例描述时,远不止"flow"这么简单。完整模板:

| 部分 | 内容 |
|------|------|
| **Name / title**(名称) | 标识此用例的简短动词短语 |
| **Description**(描述) | 一两句话总结此用例做什么 |
| **Revision History**(修订历史) | 谁在什么时候改了什么 |
| **Actors** | 所有涉及的 actor(primary 和 secondary) |
| **System Scope**(系统范围) | 此用例属于哪个系统 |
| **Goal**(目标) | primary actor 想达成什么 |
| **Level**(层级) | 粒度(如 user-goal level、sub-function level) |
| **Assumptions**(假设) | 假定为真的条件 |
| **Relationships**(关系) | 与其他用例的关系 —— `Includes`(总是调用另一个)、`Extends`(可选地被另一个扩展)、`Extension Points`(扩展挂载点) |
| **Precondition**(前置条件) | 用例开始前必须为真的条件 |
| **Trigger Events**(触发事件) | 是什么启动了此用例 |
| **Basic Flow** | 编号的 happy day 步骤,带标题 |
| **Postconditions**(后置条件) | basic flow 完成后为真的条件 |
| **Alternative Flows**(替代流) | 每个都有标题和步骤描述 |
| **Exception Flows**(异常流) | 每个都有标题和步骤描述 |
| **Activity Diagram**(活动图) | 可选的图形化流程视图 |
| **User Interface** | 可选的 UI 草图 |
| **Special Requirements**(特殊需求) | 性能需求、报表、数据需求 |
| **Outstanding Issues**(遗留问题) | 尚未解决的开放问题 |

> 不是每个用例都需要每一节。这个模板是一个**清单(checklist)**,项目相关的部分用上即可。

---

## 9. 用例图(Use Case Diagram)

### 9.1 什么是用例图

**Use case diagram** 是参与者、用例及其交互关系的**图形化视图**。它**补充**(而**不是**取代)文本描述。

### 9.2 四个视觉元素

| 元素 | 表示法 |
|------|------|
| **Actor**(参与者) | 系统边界外的简笔小人 |
| **Use case**(用例) | 系统边界内的椭圆,标注用例名称 |
| **System boundary**(系统边界) | 包围所有用例的矩形(通常标注系统名称) |
| **Association**(关联) | 连接 actor 与其参与的用例的直线 |

### 9.3 示例:ATM 用例图

ATM 例子展示了:

- **System boundary:** 标注为 "ATM" 的矩形
- **两个 actor:** `ATM User`(左侧)和 `Bank Back-end System`(右侧) —— 注意第二个 actor 是**另一个软件系统**,而不是人类
- **三个用例(在边界内):** `Withdraw money`、`Deposit money`、`Transfer money`
- **连线**把两个 actor 都连接到所有三个用例 —— 用户和后台系统都参与每一笔交易

### 9.4 示例:航空旅行用例图

Passenger Service 系统展示了多个 actor(Check-In Representative、Passenger、Customs of Destination Airport、Baggage Transportation)与多个用例(Check-In、Automated Check-In、Express Check-In、Boarding、Requesting Passenger List)之间的交互。Passenger 参与大多数用例;而像 Customs 和 Baggage Transportation 这样的专门 actor 只连接到与其角色相关的用例。

### 9.5 示例:事件管理用例图

一个更简单的例子,包含两个 actor(`FieldOfficer` 和 `Dispatcher`)和三个用例(`OpenIncident`、`ReportEmergency`、`AllocateResources`)。该图直观地展现了哪个 actor 参与哪些场景 —— 例如,FieldOfficer 报告紧急情况,而 Dispatcher 打开事件并分配资源。

### 9.6 示例:图书馆软件用例图

一个更丰富的例子,包含三个 actor(`Patron`、`Browser`、`Staff`)和多个用例(`ReserveBookCopy`、`BorrowBookCopy`、`ExtendLoan`、`ReturnBookCopy`、`WhichBooksOnTopic?`、`CheckForReservation`、`AddBookCopy`、`RemoveBookCopy`、`UpdateCatalog`、`WhoBorrowedWhat?`)。这展示了:

- 不同 actor 拥有不同权限(Browser 只能搜索;Patron 可以借/还/预约;Staff 拥有管理类用例)
- 某些用例(如 `WhichBooksOnTopic?`)被多种 actor 类型共享

---

## 10. 用例模型 — 全部整合在一起

通常**每个系统对应一个 use case model**(用例模型),由以下两部分组成:

1. **Use case diagram**(一个或多个) —— 图形视图
2. **用例的文本描述** —— 详细的逐步内容

二者合在一起,构成了从用户视角观察系统行为的完整图景。

### 10.1 多种类型的读者

用例模型的读者范围异常广泛:

- 市场人员、人因工程师、专业领域工程师
- 系统工程师
- 评审人员
- 软件开发人员
- 系统/软件测试人员
- 项目经理
- 技术写作人员

### 10.2 用例的两个核心作用

> 1. **Use cases serve as a unifying thread throughout development** —— 用例作为贯穿开发全程的**统一主线**。同一个用例在设计、实现、测试、文档化阶段都会被引用,将各阶段串联起来。
> 2. **Use cases serve as a communication tool among diverse stakeholders** —— 用例作为不同利益相关者(stakeholder)之间的**沟通工具**。因为它用平实的语言、围绕用户目标来书写,从市场到 QA 到工程,每个角色都能阅读和讨论。

### 10.3 与第一周基本原则的联系

第一周学的 fundamental principles 同样适用于用例建模:

- **Rigor and formality**(严谨与形式化)
- **Separation of concerns**(关注点分离) —— 模块化、抽象
- **Anticipation of change**(预期变化)
- **Generality**(通用性)
- **Incrementality**(增量性)

> 这些原则适用于**软件工程的所有方面** —— 不只是代码、不只是需求文档,也包括用例模型。

---

## 11. 社会影响与伦理

### 11.1 "Do Cool Things that Matter / Don't Do Bad Things"

软件工程师有责任**思考与学习**自己工作的**社会责任**。软件不是中立的 —— 我们构建的系统会影响真实的人,而关于"做什么"和"怎么做"的决定都承载着伦理重量。

伦理问题不可回避的软件领域示例:

- **社交媒体**(心理健康、错误信息、上瘾式设计)
- **汽车软件**(安全性、自动驾驶责任)
- **电子游戏**(开箱机制、屏幕时间、群体表征)
- **婚恋网站**(匹配算法、用户安全)
- **招聘网站**(招聘中的算法偏见)
- **博彩网站**(成瘾、掠夺性机制)

### 11.2 为什么伦理重要

三个核心原因:

1. **软件影响社会** —— 影响范围广泛,且常以设计者未预料到的方式发生
2. **失败造成伤害** —— 有时是经济上的、有时是身体上的、有时是心理上的
3. **工程师负有责任** —— 作为构建者,我们无法完全把责任推给"公司"或"用户"

---

## 12. ACM/IEEE 软件工程伦理准则

完整名称:**Software Engineering Code of Ethics and Professional Practices**

### 12.1 背景

- 由 **ACM 和 IEEE** 联合开发
- 由**跨国工作组**制定
- 是软件工程领域**经认可的专业标准**

### 12.2 目的

该准则的存在是为了:

- 在出现棘手取舍时**指导伦理决策**
- **定义责任** —— 作为软件工程师所应承担的责任
- **教育从业者** —— 什么是合乎伦理的实践

### 12.3 八大原则总览

该准则围绕八个面向利益相关者的原则组织:

| # | Principle | 关注对象 |
|---|------|------|
| 1 | **Public**(公众) | 整个社会 |
| 2 | **Client & Employer**(客户与雇主) | 付费方 |
| 3 | **Product**(产品) | 软件本身 |
| 4 | **Judgment**(判断) | 个人专业操守 |
| 5 | **Management**(管理) | 领导职责 |
| 6 | **Profession**(行业) | 软件工程行业 |
| 7 | **Colleagues**(同事) | 同行工程师 |
| 8 | **Self**(自我) | 个人成长与发展 |

### 12.4 Principle 1 — Public(公众)

行为应符合公共利益:

- 以公共利益为先行事
- 向用户/公众披露危险
- 只在确认安全的情况下批准软件发布
- 考虑隐私与公平
- 报告重大风险

### 12.5 Principle 2 — Client & Employer(客户与雇主)

在符合公共利益的前提下,按照客户与雇主的最大利益行事:

- 维护客户/雇主的最大利益
- 保守机密
- 对自身能力局限保持诚实
- 避免利益冲突
- 不滥用雇主资源

### 12.6 Principle 3 — Product(产品)

确保产品及相关修改达到最高的专业标准:

- 追求高质量和高可靠性
- 使用恰当的测试与验证
- 妥善地撰写文档
- 确保可维护性(maintainability)
- 发布前修复已知缺陷(defects)

### 12.7 Principle 4 — Judgment(判断)

在专业判断中保持正直(integrity)与独立(independence):

- 维护正直与独立性
- 避免欺骗性做法
- 披露利益冲突
- 基于证据做决策
- 拒绝贿赂或不当影响

### 12.8 Principle 5 — Management(管理)

(针对软件工程管理者与领导者。)秉持并推广合乎伦理的软件开发与维护管理方法:

- 推广合乎伦理的开发实践
- 确保排期合理
- 提供充足资源
- 支持质量保证(QA)
- 鼓励上报担忧

### 12.9 Principle 6 — Profession(行业)

在符合公共利益的前提下,提升行业的诚信度和声誉:

- 提升行业的诚信度
- 遵循标准与最佳实践
- 推动公众理解
- 避免给行业抹黑
- 支持合乎伦理的政策

### 12.10 Principle 7 — Colleagues(同事)

对同事公平且给予支持:

- 公平且给予支持
- 给予他人应有的功劳
- 进行建设性的代码评审
- 避免歧视
- 帮助同事发展技能

### 12.11 Principle 8 — Self(自我)

在职业实践中持续学习,并推广合乎伦理的方法:

- 投身终身学习
- 提升技术能力
- 了解自己专业能力的边界
- 寻求反馈与改进
- 以个人正直行事

### 12.12 八大原则一句话总结

| 原则 | 一句话要点 |
|------|------|
| **Public First** | 把安全、健康、隐私和社会福祉置于一切之上 |
| **Client & Employer** | 在伦理边界和公共利益的框架内,维护其最大利益 |
| **Product Quality** | 交付安全、可靠、经过良好测试且可维护的软件 |
| **Professional Judgment** | 保持正直、独立、基于证据的决策 |
| **Ethical Management** | 营造支持质量、透明度与问责制的环境 |
| **Advance the Profession** | 维护标准、贡献知识、保持公众信任 |
| **Respect Colleagues** | 公平、给予功劳、支持他人、避免伤害与歧视 |
| **Commit to Self-Improvement** | 持续发展技能、认清局限、以正直行事 |

---

## 13. Quiz 3 复习要点

需要熟悉并理解:

- **Use cases**(用例)
  - **Actors**(是什么、如何识别、人类/硬件/软件 actor 的例子)
  - **三种 Flow:Basic / Alternative / Exception**(定义和何时使用)
- **Use case descriptions**(用例描述) —— 文本格式(name、flows、preconditions、postconditions)
- **Use case diagrams**(用例图) —— system boundary、actors、use cases、associations
- **用例的目的/用途** —— unifying thread;沟通工具;与其他需求工程方法互补
- 能够基于 **ACM Code of Ethics** 文章评估基本的伦理问题

---

## 14. 总结与记忆框架

```text
Week 3 知识结构
|
+-- Use Cases(用例)
|   +-- 定义:描述 actor-系统交互以达成目标的文本描述
|   +-- 包含:goal, precondition, flow, postcondition, error/alternative
|   +-- 与 requirements 互补(不取代)
|
+-- Flow(三种类型)
|   +-- Basic Flow:happy day 顺利场景
|   +-- Alternative Flow:目标达成,路径不同
|   +-- Exception Flow:目标未达成
|   +-- 用例必须捕捉所有 flow(成功 + 失败)
|
+-- 为什么用 Use Case
|   +-- 与设计/代码良好映射
|   +-- 与验收测试良好映射
|   +-- 非专家也能理解
|   +-- 但不擅长:UI、数据格式、business rules、non-functional requirements
|   +-- 与其他需求工程方法配合使用
|
+-- Actor(参与者)
|   +-- 外部(external)实体:人、硬件、其他软件
|   +-- primary actor 发起用例
|   +-- 通过提问识别:谁使用/安装/启动/关闭、谁给/取信息、
|   |   定时事件、legacy system 等
|
+-- 构建用例
|   +-- what(不是 how)、面向读者的术语
|   +-- 命名 → Basic Flow → 添加 Alternative/Exception Flow
|   +-- 示例:Buy a Product、Add Item Deadline、Toggle Completed State
|   +-- 编号约定:3a = 从基本流第 3 步分支
|
+-- 用例模板(正式版)
|   +-- Name, Description, Revision History, Actors, Scope, Goal, Level
|   +-- Assumptions, Relationships(Includes/Extends), Precondition, Triggers
|   +-- Basic Flow + Postconditions, Alternative Flows, Exception Flows
|   +-- Activity Diagram, UI, Special Requirements, Outstanding Issues
|
+-- Use Case Diagram(用例图)
|   +-- 4 个元素:Actor(小人)、Use case(椭圆)、
|   |   System boundary(矩形)、Association(线)
|   +-- 示例:ATM、航空旅行、事件管理、图书馆软件
|
+-- Use Case Model = 图 + 文本描述
|   +-- 每个系统一个模型
|   +-- unifying thread 贯穿开发全程
|   +-- 不同 stakeholder 间的沟通工具
|   +-- 仍然体现 7 大基本 SE 原则
|
+-- 社会影响与伦理
|   +-- 软件影响社会、失败造成伤害、工程师有责任
|   +-- "Do Cool Things that Matter / Don't Do Bad Things"
|
+-- ACM/IEEE Code of Ethics(8 大原则)
    +-- Public         -> 安全、隐私、公平、披露风险
    +-- Client/Employer-> 最大利益、保密、无利益冲突
    +-- Product        -> 质量、测试、文档、可维护性
    +-- Judgment       -> 正直、基于证据、拒绝贿赂
    +-- Management     -> 合理排期、资源、QA、鼓励上报
    +-- Profession     -> 标准、公众理解、行业声誉
    +-- Colleagues     -> 公平、给予功劳、不歧视
    +-- Self           -> 终身学习、了解能力边界、正直
```

### 一句话总结

> 用例(Use Case)是以"actor + Basic/Alternative/Exception Flow"为骨架的文本叙述,并通过用例图加以可视化;它既是贯穿开发全程的 **unifying thread**,又是连接不同 stakeholder 的共同语言。与此同时,**ACM/IEEE Software Engineering Code of Ethics** 提醒我们:软件工程是一项肩负利益相关者义务的职业 —— 涵盖八个维度(Public、Client、Product、Judgment、Management、Profession、Colleagues、Self),其中**公众利益永远排在第一位**。
