# Informatics 43 — 第七周课程笔记

> 涵盖 **Lecture 13 与 Lecture 14**:*"我们怎么知道软件真的能工作?(第 1、2 部分)"*

## 目录

1. [我们现在在哪 — 从构建走向验证](#1-我们现在在哪--从构建走向验证)
2. [再看一次失败案例](#2-再看一次失败案例)
3. [失败案例陈列](#3-失败案例陈列)
4. [NASA 的两条安全基本准则](#4-nasa-的两条安全基本准则)
5. [The Power of Ten — 安全攸关代码的十条规则](#5-the-power-of-ten--安全攸关代码的十条规则)
6. [质量保证 — Verification vs. Validation](#6-质量保证--verification-vs-validation)
7. [QA 四类方法 — 一个混合工具箱](#7-qa-四类方法--一个混合工具箱)
8. [基本测试流程](#8-基本测试流程)
9. [一个具体例子:Python `unittest`](#9-一个具体例子python-unittest)
10. [测试的目标与 Dijkstra 名言](#10-测试的目标与-dijkstra-名言)
11. [测试术语(IEEE 610.12-90)](#11-测试术语ieee-61012-90)
12. [谁来做测试?](#12-谁来做测试)
13. [测试的三个层次](#13-测试的三个层次)
14. [三个层次的实战例子 — ToDoList](#14-三个层次的实战例子--todolist)
15. [如何选取测试用例 — 甜蜜点问题](#15-如何选取测试用例--甜蜜点问题)
16. [六种选取测试用例的方法](#16-六种选取测试用例的方法)
17. [测试预言(Test Oracle) — 怎么知道输出对不对](#17-测试预言test-oracle--怎么知道输出对不对)
18. [所有软件都有 bug](#18-所有软件都有-bug)
19. [我们怎么知道测试做完了?](#19-我们怎么知道测试做完了)
20. [Quiz 7 复习要点](#20-quiz-7-复习要点)
21. [总结与记忆框架](#21-总结与记忆框架)

---

## 1. 我们现在在哪 — 从构建走向验证

第六周以**以用户为中心的设计**收尾 —— 访谈、人物画像、场景、故事板、线框图、设计准则、启发式评估、用户测试 —— 八种方法围绕一句话:*"It's all about the user."* UCD 做得好,回报是具体而可衡量的:**销量上升、性能提升、流量增加**、挫败感下降。

第七周再向下游推一步。我们已经围绕用户做了设计,也已经把代码写出来了,那么:

$$\boxed{\textbf{How do we know the software actually } \textit{works}\textbf{?}}$$

到这一步,我们正在搭建的完整演进顺序是:

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture} \;\longrightarrow\; \textbf{Design} \;\longrightarrow\; \textbf{User-Centered Methods} \;\longrightarrow\; \textbf{Code} \;\longrightarrow\; \textbf{QA \& Testing}}$$

两节课覆盖这块内容。**Lecture 13** 解释**为什么** QA 重要(用失败案例再敲一遍警钟),把**质量保证**定义成 verification + validation,列出四大类 QA 方法,然后切进测试本身:基本流程、四个 IEEE 术语(mistake/fault/error/failure)、谁来做、以及测试的三个层次(unit/functional/system)。**Lecture 14** 打开测试工具箱:*怎么选测试用例*、*怎么知道输出对不对*(test oracle)、*所有软件都有 bug*、*什么时候算测试做完了*。

---

## 2. 再看一次失败案例

我们之前已经见过失败案例 —— 第六周的可用性失败、本学期更早时的需求失败。Lecture 13 换一个角度再看一次失败:**大多数大规模软件失败,本质都是 QA 失败**。系统被造出来,发布上线,然后在需求和发布之间的某一步,验证"系统是否真的行为正确"这件事被跳过了、被赶进度压掉了、或者干脆做得很差。

这节课的陈列不是想吓学生,它的目的只是一句话:

> **糟糕的软件不是假设性风险。** 真实的客机坠毁过、真实的航天器坠毁过、真实的汽车把人撞死过、真实的几十亿美元被花在补救本来就该一开始就做对的事 —— 而所有这些事故的共同点都是:没人把软件验证做得足够彻底。

整组案例还想说明:**严重程度和后果有关,和代码大小无关**。一个两位数的年份字段花了全世界 3000 亿美元;一个传感器读数把两架满载客机送上了天。一个 QA 步骤的缺失,代价并不和这个 bug 本身的"聪明程度"成正比。

---

## 3. 失败案例陈列

| 案例 | 出了什么问题 | QA 教训 |
|------|------|------|
| **Boeing 737 Max** | MCAS 飞控软件只信任*单个*迎角传感器,可以在飞行员未授权的情况下压低机头。两次坠机(Lion Air 610、Ethiopian 302),共 346 人死亡 | 安全攸关系统不允许*单一*事件触发危险动作;QA 失败被嵌进了商业优先级 —— "safety doesn't come first, money does" |
| **Toyota 不受控加速** | 司机报告车辆在没指令的情况下自行加速。调查指向节气门控制软件的缺陷 —— 代码错综复杂(没有高内聚/低耦合),虽然*的确*产生过内部错误码,但程序对这些错误码没做任何处理:没有 fail-safe / "安全模式"作为回退 | 软件复杂度没有配上**鲁棒性**就是危险;这正好是 NASA 第二条基本准则(§4)要防的那种失败模式 |
| **Apollo 8 / Margaret Hamilton** | Hamilton 在 MIT 的团队给登月舱写飞行软件时,显式设计了 *priority-display* / 错误恢复机制 —— 计算机过载时,会丢掉低优先级任务而不是崩溃。这个设计救了 Apollo 11 的着陆。(那张著名照片里,Hamilton 站在比她还高的代码打印本旁边) | 良好的 QA 实践 —— 防御性设计、错误处理、优先级管理 —— *防止*了一次灾难 |
| **Mars Polar Lander** | 1999 年这台着陆器撞向了火星表面。主因:着陆腿展开时的杂散信号被解读成了着陆成功,所以发动机在距地面约 40 米处就被切断了 | 软件错误地解读了传感器输入;规格说明没有预料到那种瞬态信号 |
| **Y2K** | 两位数年份字段(`MM/DD/YY`)让 `00` 究竟代表 2000 还是 1900 变成了一个未定义的问题。有些系统回绕,有些把 `1999` 变成了 `19100`。全球修复成本约 **3000 亿美元**;之所以"那一天"真正的影响相对有限,*正是因为*这笔投入 | 一个看起来"小"的数据定义偷懒,乘以数百万个程序、再乘以几十年时间,就会变成文明尺度的 bug |

> Boeing 737 Max 在 IEEE Spectrum 上的那段话值得为了 quiz 记一下:*"The 737 Max saga teaches us not only about the **limits of technology** and the **risks of complexity**, it teaches us about our real priorities. Today, **safety doesn't come first — money comes first**, and safety's only utility in that regard is in helping to keep the money coming."*

Apollo 8 在这组案例里是正面反例。另外四个展示了没有严谨 QA 会发生什么;Apollo 8 展示了"有纪律的工程长什么样" —— 并且说明*即使在原始硬件上,只要你把验证当成一等工程活动,正确的软件就是可能的*。

![黑白 NASA 历史照片:Margaret Hamilton 站在一摞比她还高的 Apollo 制导计算机源代码打印本旁边。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/apollo-8-margaret-hamilton-code-stack.jpg)

![一张 LED 显示屏照片:法国南特中央理工学院(École Centrale de Nantes)火车站的显示屏显示 "BIENVENUE A L'ECOLE CENTRALE DE NANTES — 12 HEURES 09 — 3 JANVIER 1900",这是一个真实发生过的 Y2K 日期翻车 bug。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/y2k-french-station-jan-1900.jpg)

---

## 4. NASA 的两条安全基本准则

NASA 完整的安全攸关软件标准有 388 页。课件从中提取了两条概括了整套哲学的"基本准则":

| 准则 | 大白话 |
|------|------|
| **No single event or action shall be allowed to initiate a potentially hazardous event.** | 危险动作必须由*多个*独立触发条件共同触发。单个传感器故障、单次按键、单条消息绝不能足以造成伤害 |
| **When an unsafe condition or command is detected, the system shall (a) inhibit the potentially hazardous event sequence, and (b) initiate procedures to bring the system to a predetermined "safe" state.** | 仅仅"检测到"不够 —— 系统还必须*中止*危险动作,并*主动*把自己带向预先定义好的安全状态 |

注意 Boeing 737 Max 的失败正好直接违反了第一条:单个迎角传感器就足以触发 MCAS 的压机头动作。如果有多个传感器交叉验证、再加飞行员可以一键覆盖,这条准则就成立了。

> 第二条准则在日常生活中的简单例子是**交通信号灯**。正常状态是红和绿,但绝不能允许信号灯*卡在长亮绿灯*上 —— 那是危险状态。出了问题时,系统会回退到预定的安全状态:**所有方向闪红**,司机默认把这个路口当 stop 标志处理。这就是基本准则的模式:检测 → 中止危险 → 进入安全状态。

> 这种基本准则不是测试技术,而是**设计约束**,它们让"可测试的正确性"成为可能。一个允许"一个坏读数就能害死人"的架构,你是测不出安全的。

---

## 5. The Power of Ten — 安全攸关代码的十条规则

一份互补的清单 ——**"The Power of Ten — Rules for Developing Safety Critical Code"**(Holzmann, IEEE Computer, June 2006)—— 在编码层面给出了安全攸关系统的纪律。Holzmann 写这些规则时人在 **NASA 喷气推进实验室(JPL)**,目标是航天器软件 —— 要在没人盯着的环境下运行多年,而那个环境里**宇宙射线会随机翻转比特位**,并且根本没有"推个补丁"的机会。这是为什么这些规则读起来像苛政:每一条都关掉了 JPL 团队在飞行软件里见过的一类 bug。

| # | 规则 | 为什么 |
|---|------|------|
| 1 | 只用简单的控制流结构 | 不允许 `goto`、`setjmp/longjmp`、递归 —— 让调用图可分析 |
| 2 | 所有循环必须有固定上界 | 才能证明循环会终止 |
| 3 | 初始化结束后不再用动态内存分配 | 在长寿命系统里避免内存泄漏、碎片化、use-after-free |
| 4 | 函数不超过 60 行文本 | 一个函数最好能塞进一屏 —— 让审阅者能完整推理它 |
| 5 | 每个函数平均至少两个断言 | 在运行时记录并检查假设 |
| 6 | 数据对象声明在最小可能的作用域 | 限制单个变量的"爆炸半径" |
| 7 | 检查非 void 函数的返回值,并检查函数参数的合法性 | 不要默默忽略错误或非法输入 |
| 8 | 预处理器只用于 `#include` 和简单宏 | 隐藏控制流的宏会让静态分析失效 |
| 9 | 限制指针使用,每个表达式中解引用不超过两层 | 别名(aliasing)是最严重安全 bug 的来源之一 |
| 10 | 打开所有编译警告,并配合一个或多个源码分析器 | 免费的 QA —— 编译器和工具早就知道大多数常见错误 |

> 这些规则故意苛刻。它们针对的是给飞机和航天器写代码的人,而不是个人项目。但它们底层的逻辑 —— *让代码可分析、让假设显式化、宁可大声出错也不要无声忽略* —— 适用于任何"正确性重要"的项目。

---

## 6. 质量保证 — Verification vs. Validation

课件给 QA 的操作性定义是:

$$\boxed{\textbf{Quality Assurance} = \textbf{all activities designed to measure and improve quality in a product}}$$

QA 可以拆成两个互补的姊妹活动。两个都要做;它们回答的是不同的问题。

| 活动 | 它回答的问题 | 它比较的是 |
|------|------|------|
| **Verification(验证)** | *"Are we building the system **right**?"*("我们是不是把系统*做对了*?") | 系统 vs **Specifications**(规格说明)—— 系统是否符合规格说的它应该做的事? |
| **Validation(确认)** | *"Are we building the **right** system?"*("我们是不是在做*对的*系统?") | 系统(以及规格本身)vs **Requirements**(需求)—— 规格,以及实现规格的系统,是否真的满足了用户的目的? |

![三块方框的对比图:Verification 与 Validation。三个方框 Requirements、Specifications、System,中间有两个箭头 —— "Validation" 箭头连接 Requirements 与 System,"Verification" 箭头连接 Specifications 与 System。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/verification-validation-diagram.png)

课件里的图显示三个方框 —— Requirements、Specifications、System —— 由两个箭头连接:

- **Verification** 箭头:在 Specifications 与 System 之间(造出来的东西是否符合写好的规格?)
- **Validation** 箭头:从 System 回到 Requirements(造出来的东西是否真的满足了实际需要?)

> 一个系统可以是**verified 但 not validated** 的:它完美实现了规格,但规格捕捉错了需求,所以做出来的产品没用。一个系统也可以是 **validated 但 not verified** 的:它恰好让用户满意,但并不符合自己的规格,因此脆弱且难维护。好的 QA 两边都要。

V&V 这个框架也很适合作为"QA 活动**为了什么**"的心智模型。审阅需求文档是 validation(规格是否对应了用户的需要?)。一个函数的单元测试是 verification(函数是否符合它的规格?)。Beta 测试主要是 validation(真实用户跑这套系统能否拿到他们想要的?)。

---

## 7. QA 四类方法 — 一个混合工具箱

Lecture 13 列出 QA 的四类方法。这张幻灯片底部的红字就是结论:**"Use a mixture of techniques!"** 没有任何单一方法能抓到所有缺陷,每一种都有自己的甜蜜点。

| 方法 | 是什么 | 强项 |
|------|------|------|
| **Formal methods(形式化方法)** | 用数学证明程序符合规格 | 保证级别最高;适合小型、关键组件 |
| **Static analysis(静态分析)** | 工具检查源代码(或字节码)而不实际运行它 —— 类型检查器、linter、数据流分析器、安全扫描器 | 便宜、快,抓到一整类 bug(空指针解引用、未用变量、简单的竞争条件) |
| **Reviews and inspections(评审与检查)** | 人对着代码/文档一起读、找缺陷 | 抓到自动化工具抓不到的问题 —— 设计气味、命名混乱、被误解的需求 |
| **Testing(测试)** | 在选定的输入上跑程序,把实际输出与期望输出比较 | 工业界最常用的一种;具体、可重复、能产出"行为如何"的证据 |

测试是本周剩余部分以及下周的主要内容。评审和静态分析只是顺便提到;形式化方法在课上提到主要是让你知道它存在 —— 并且对最关键的安全攸关系统它是必选项。

---

## 8. 基本测试流程

课件把测试流程描述成一个紧凑的循环:

1. **Devise a test case (input)** —— 选定要喂给被测单元的输入
2. **Create the expected output** —— 写下对这个输入而言*正确*的输出应该是什么
3. **Run the test case** —— 让被测单元在选定输入上跑一遍
4. **Capture the actual output** —— 记录单元实际产出了什么
5. **Compare actual output to expected output** —— 比较实际输出与期望输出
6. *Lather, rinse, and repeat* —— 反复

第 5 步是决策规则,只有两种结果:

| 比较 | 结果 |
|------|------|
| 实际输出 **=** 期望输出 | 测试 **SUCCEEDS** / **PASSES** |
| 实际输出 **≠** 期望输出 | 测试 **FAILS**(报告 failure) |

> 这个六步循环里藏了两个微妙点。**(1)** 第 2 步(期望输出)*不是*显而易见的 —— 它要求你*事先就知道*正确答案是什么。"知道正确答案"的那个机制叫做 **test oracle(测试预言)**,Lecture 14 会再回来讲。**(2)** 现代实践中这个循环的大部分都是**自动化**的 —— 测试框架自动跑成千上万个用例,逐个比较实际 vs 期望。人的时间花在*设计*测试用例上,不是*运行*它们。

---

## 9. 一个具体例子:Python `unittest`

课件给了一个用 Python 标准库 `unittest` 的最小例子。它值得过一遍,因为 Lecture 13 里的每个术语都能映射到这段代码里的某一块。

```python
import unittest

class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual('foo'.upper(), 'FOO')

    def test_isupper(self):
        self.assertTrue('FOO'.isupper())
        self.assertFalse('Foo'.isupper())

    def test_split(self):
        s = 'hello world'
        self.assertEqual(s.split(), ['hello', 'world'])
        # check that s.split fails when the separator is not a string
        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main()
```

运行结果:

```
...
----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK
```

| 代码元素 | 对应到术语 |
|------|------|
| `class TestStringMethods(unittest.TestCase)` | 一个 test suite —— 一组 test case 的集合 |
| `def test_upper(self)` | 单个 test case(选定输入、写期望输出、比较) |
| `self.assertEqual('foo'.upper(), 'FOO')` | 比较步骤 —— 实际输出是 `'foo'.upper()`,期望输出是 `'FOO'` |
| `self.assertTrue(...)` / `self.assertFalse(...)` | 针对布尔期望输出的专用比较 |
| `with self.assertRaises(TypeError):` | 反向测试 —— 期望输出是*一个异常*;只要异常被抛出,测试就通过 |
| `Ran 3 tests in 0.000s — OK` | 三个 test case 全部通过;没有 failure |

> 注意这段代码有多短。`unittest` 把循环机制隐藏掉了,工程师只写 (输入,期望输出) 对。"测试流程的大部分都已经自动化了"实际落地下来就是这个样子。

---

## 10. 测试的目标与 Dijkstra 名言

课件把测试目标总结为:

1. **找到并修复 failures/faults/errors。**
2. **提升信心**:系统按*规格*运行(verification),并且*按预期目的*运行(validation)。
3. 以**准确、彻底、可重复、系统化**的方式做到上面两点。

注意幻灯片上把"Complete(完整)"划掉了,换成了"Thorough(彻底)"。这不是笔误 —— 这是核心洞见,被红框里那段著名的 Dijkstra 名言显式化了:

> $$\boxed{\textbf{"Program testing can be used to show the presence of bugs, but never to show their absence."}\;[\text{Dijkstra}]}$$

为什么?因为对任何非平凡程序而言,输入空间都极其庞大(往往是无穷的)。你不可能在所有输入上跑一遍程序 —— 只能在一个样本上跑。任何一个*通过*的测试只能告诉你:在*那个*输入上程序是对的。它对你*没测的*那些输入什么也没说。没测的输入里如果有 bug,它就还在那里,等着。

这就是为什么测试在逻辑意义上永远不能"完整"。测试能做到的最好是**够彻底**,以至于剩下的 bug 稀有到/隐蔽到在实践中无关紧要。"彻底"是工程判断;"完整"是数学上的不可能。

> ⚠️ Dijkstra 名言是这节课的 **attendance-quiz topic**。把原文背下来:*"Program testing can be used to show the presence of bugs, but never to show their absence."*

---

## 11. 测试术语(IEEE 610.12-90)

IEEE 软件工程术语标准词汇表(IEEE 610.12-90)区分了四个术语 —— 而日常说话喜欢把它们一锅端称为 "bug"。在 quiz 上,这几个区别是必考的。

| 术语 | 定义 | 你具体指向什么 |
|------|------|------|
| **Mistake** | 产生不正确结果的*人的动作* | 人(写代码的人,或者使用的人) |
| **Fault / Bug** | 计算机程序中一个不正确的步骤、过程或数据定义 | 代码中的一个**具体位置** |
| **Error** | 计算结果与正确结果之间的差异 | 执行过程中的某个*内部*或*外部*状态 |
| **Failure** | fault 造成的(不正确的)结果 | *外部可见*的非预期行为或输出 |

工业界常用的 **"defect"** 通常指的是 **fault**。

> 因果链是:**Mistake → Fault → Error → Failure。** 程序员犯了 mistake(把 `<` 打成了 `<=`),从而埋下了 fault(代码里那个错误的操作符)。运行时,这个 fault 产生 error(比较得到错误的布尔值),然后传播为 failure(用户看到错误的画面,或者系统崩溃)。

一个有用的例子:开发者把规格读错了,规格说"非负",他写成了 `count > 0`。这就是 **mistake**。那行代码 `if (count > 0)` 是 **fault**。当 `count == 0` 时,比较返回 `false`,应该返回 `true` —— 这个内部错误值就是 **error**。最终,依赖这个值的函数返回了错误的合计,用户在屏幕上看到错误的数字 —— 这个可见的错误输出就是 **failure**。

---

## 12. 谁来做测试?

测试不是某一个角色的工作。不同的测试者会发现不同的 bug。

| 谁 | 什么时候 / 怎么做 |
|------|------|
| **Programmers(程序员)** | 边写代码边写单元测试(常常是:在写代码*之前*写,即测试驱动开发);每次修改都跑一遍。早期就抓到底层 fault |
| **Testers(专职 QA 人员)** | 设计并跑更严谨的测试套件 —— 集成测试、回归测试、脚本化的系统测试。经常是对照规格而*不看代码*来写测试 |
| **Users(用户)** | 在更接近真实条件的场景下测试系统,有几种变体: |
| &nbsp;&nbsp;↳ Acceptance testing(验收测试) | 客户或客户代表在系统被接受前验证它满足合同要求 |
| &nbsp;&nbsp;↳ Alpha testing | 内部使用,通常仍在开发组织内部,在受控环境中 |
| &nbsp;&nbsp;↳ Beta testing | 真实的外部用户用预发布版本,在真实环境中 |
| &nbsp;&nbsp;↳ Crowdsourcing / bug bounties | 按 bug 付费给外部测试者(安全研究人员、公众)。在安全敏感系统中常见 |

> "谁"为什么重要:**每种测试者都有不同的盲区**。程序员知道代码*应该*怎么工作,所以他们下意识会测自己已经想到的那些情况。独立测试者不共享这套假设,会找到不一样的 bug。真实用户撞到的输入组合,工程师压根想都不会想去试。

---

## 13. 测试的三个层次

![Mike Cohn 提出的测试金字塔:Unit Tests 在最宽的底部,Integration Tests 在中间,System Tests 在最窄的顶部。左轴标 "more isolation → more integration",右轴标 "faster → slower"。出处:M. Cohn, Succeeding with Agile, 2009。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/test-pyramid-cohn.png)

测试还按*作用域*分类。课件展示了经典的三个层次,通常可视化为一个**测试金字塔** —— 底部很多测试(便宜、快),顶部很少测试(贵、慢)。

| 层次 | 测的是什么 | 在金字塔上的位置 |
|------|------|------|
| **Unit testing(单元测试)** | 单个代码单元(函数、类、模块),隔离测试 | 底部 —— 测试多、快、高度隔离 |
| **Functional / integration testing(功能 / 集成测试)** | 已集成单元*之间的接口* —— 模块互相调用时会发生什么 | 中部 —— 更少、更慢、更集成 |
| **System / acceptance testing(系统 / 验收测试)** | 整套已组装好的系统对照其需求 | 顶部 —— 测试很少、最慢、完全集成 |

金字塔的两条轴对应两个权衡:

| 轴 | 底部(unit) | 顶部(system) |
|------|------|------|
| **Isolation ↔ Integration** | 更隔离 | 更集成 |
| **Speed(速度)** | 更快 | 更慢 |

> 金字塔不仅是描述,也是规范:你*应该*有*很多*快速的 unit test,*一些*集成测试,*少量*端到端系统测试。把金字塔倒过来的项目 —— 想靠端到端测试抓到底层 bug —— 最终会有一个又慢又抖、谁都不信的测试套件。

---

## 14. 三个层次的实战例子 — ToDoList

课件用一个具体例子把三个层次落地下来:一个 `ToDoList` 应用。

![ToDo list 应用的三栏并排红色面板。左栏:ToDoListItem 类,显示它的字段和方法,标注为 Unit testing(ToDoListItem.setPriority())。中栏:List DB 包含 ToDoList,后者有 List<ToDoListItem>: items 与 addItem/editItem/deleteItem/markDone 方法,标注为 Functional/integration testing(ToDoList.editItem())。右栏:ToDoListApp 包裹 ListDB、UI、Calendar、Settings、Notifications,标注为 System/acceptance testing(Create / Edit / Delete a list)。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/todolist-three-levels-of-testing.png)

```text
Application:  ToDoListApp
              ├── ListDB
              ├── UI
              ├── Calendar
              ├── Settings
              └── Notifications

ListDB:       Stores ToDoList objects
              └── ToDoList
                    ├── items: List<ToDoListItem>
                    ├── addItem(), editItem(), deleteItem(), markDone(), ...

ToDoListItem: ├── description: String
              ├── dateCreated: Date
              ├── priority: int
              ├── done: boolean
              └── editDescription(), setPriority(), markDone()
```

每一层测试都瞄准这个设计中的不同层次:

| 层次 | 课件里的具体例子 |
|------|------|
| **Unit testing** | `ToDoListItem.setPriority()` —— 测试这一个方法是否正确地更新单个 item 的 `priority` 字段 |
| **Functional / integration testing** | `ToDoList.editItem()` —— 测试*通过 `ToDoList` 接口*编辑一个 item 是否正确地更新了底层 `ToDoListItem` 并持久化 |
| **System / acceptance testing** | 高层用户工作流:*Create a new list*、*Edit list info*、*Edit list item*、*Delete list*。把整个 app —— UI、DB、日历、通知 —— 端到端地测一遍 |

> 这个映射是机械的:**一个类方法 → 单元测试;一个类与类之间的接口 → 集成测试;一个面向用户的工作流 → 系统测试**。当你写新功能时,应该顺手想一下每个新测试归属哪一层。

---

## 15. 如何选取测试用例 — 甜蜜点问题

Lecture 14 一开头用一个看起来很简单的函数引入:

```c
int multiplier(int a, int b) {
    return a * b;
}
```

这个函数有多少 test case?32-bit `int` 下,输入空间是 $2^{32} \times 2^{32} = 2^{64} \approx 1.8 \times 10^{19}$ 对。哪怕每秒跑十亿个测试,穷举也要约 **580 年**。

这就是测试的基本张力:输入空间在实际上是无穷的,但测试的时间和预算是非常有限的。

$$\boxed{\textbf{Test design = picking a small sample of inputs that finds as many bugs as possible.}}$$

课件把这件事可视化成一条曲线 —— y 轴是**对被测模块的信心**,x 轴是**给出正确输出的测试用例数量**:

![一条凹形曲线:y 轴 "Confidence in module being tested",x 轴 "Number of test cases with correct outputs"。曲线开始低后陡升、然后趋平。曲线中段一个红色箭头指向拐点,标注 "Sweet spot?"。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/sweet-spot-curve.png)

- 曲线一开始很低,先陡升 —— 每多一个测试用例都能显著提升信心。
- 随着用例增加,曲线趋平 —— 边际收益递减。
- **甜蜜点(sweet spot)**就是曲线已经趋平到"再加测试也买不到多少新信心"的那个位置。

> 甜蜜点是个工程判断,不是一个固定数字。对安全攸关系统而言,曲线趋平得更晚(并且为递减收益砸钱的预算也更高)。对一个内部小工具,甜蜜点来得早得多。

这节课接下来的内容就是讲*怎么选*这些测试用例 —— 让每一个用例都对得起花在它上面的时间,让每多一个测试都能买到尽量多的新信心。

---

## 16. 六种选取测试用例的方法

课件列出六个具体的测试用例选取策略。有些基于规格,有些基于代码,有些基于项目自身的历史。

| # | 策略 | 它用什么 | 课件态度 |
|---|------|------|------|
| 1 | **Intuition(直觉)** | 测试者的经验和对"哪儿可能出错"的直觉 | 提到,但不推荐 —— 有用但不系统 |
| 2 | **Specification(规格)= 黑盒测试** | 程序应该做什么的*规格*,不看代码 | 下面接着两个系统化子策略: |
| 2a | &nbsp;&nbsp;等价类划分(Equivalence-class partitioning) | 把规格视为等价处理的输入归到同一类,每类挑一个代表 | 黑盒、系统化 |
| 2b | &nbsp;&nbsp;边界值分析(Boundary-value analysis) | 在等价类的*边界*上挑输入(零、最大值、off-by-one)—— bug 喜欢聚在边界 | 黑盒、系统化 |
| 3 | **Code(代码)= 白盒测试** | *源代码本身*,确保每一块都被运行到 | 一个子策略: |
| 3a | &nbsp;&nbsp;路径分析(Path analysis) | 确保控制流图中每条路径至少被测一次 | 白盒、系统化 |
| 4 | **Existing test cases = 回归测试(Regression testing)** | 前一版本的测试套件 —— 在新版本上重跑所有旧测试,确保以前工作的东西没被打坏 | 防御性 —— 抓的是*老功能里的新 bug* |
| 5 | **Faults(已知缺陷模式)** | 已知的 fault 模式(常见 bug 分类、这个团队以前犯过的错) | 实践中常被归入"直觉",但可以被系统化 |

为了 quiz,这三个大类要分清楚:

| 大类 | 看的是 | 强项 |
|------|------|------|
| **Black-box(基于规格)** | 程序*应该*做什么 | 与实现解耦;能抓到漏掉的功能、被误读的规格 |
| **White-box(基于代码)** | 程序*实际*做什么 | 能抓到死代码、未测试的分支、实现层面的 bug |
| **Regression(回归)** | 程序*以前*做什么 | 能抓到新代码打坏旧行为 |

> Lecture 14 没有真正深入到各个具体技术 —— 那是下周的内容("Testing, part 3: Black-box testing")。Slide 36 的重点是*词汇*:black-box vs. white-box、equivalence partitioning vs. boundary values vs. path analysis vs. regression。要会叫名字,并且能简短描述每一个。

---

## 17. 测试预言(Test Oracle) — 怎么知道输出对不对

回到基本测试流程的第 5 步:*比较实际输出和期望输出*。这引出了一个听起来很显然、实际上不显然的问题:

$$\boxed{\textbf{How do we know what the } \textit{expected} \textbf{ output should be in the first place?}}$$

回答这个问题的机制叫做 **test oracle(测试预言)**。

> **Test Oracle**:一种判断 test case 运行是 success 还是 failure 的机制 —— 也就是,对给定输入,正确输出究竟是什么。

课件指出 **test oracle 很难自动化**。为什么?看 cosine 的例子:

> 测试运行结果显示 `cos(0.5) = 0.87758256189`。**Oracle?**

我们怎么*判断* `0.87758256189` 是不是对的?有几种 oracle 策略,各有取舍:

| Oracle 策略 | 对 `cos(0.5)` 怎么用 | 权衡 |
|------|------|------|
| **手算** | 用纸笔或心算算出 `cos(0.5)` | 对非平凡情况不可能;不可扩展 |
| **参考实现** | 与可信库(另一种语言的 `math.cos`)比较 | 如果两个实现有同样的 bug 怎么办?参考实现谁来验证? |
| **代数恒等式** | 检查 `cos(x)^2 + sin(x)^2 ≈ 1` | 间接 —— 通过恒等式不代表值是对的,只代表自洽 |
| **领域知识** | 知道 `cos(0) = 1`、`cos(π/2) = 0`,而 `0.5` 在中间,所以答案应该接近 `0.88` | 健全性检查(sanity check),不是真正的 oracle |
| **规格 / 形式定义** | 从 Taylor 级数算出来作核对 | 理论上严谨,实际上往往不切实可行 |
| **人类专家** | 数学家或领域专家直接看一眼 | 不能自动化,不可扩展 |

> cosine 的例子故意挑得简单。它的论点是:**即使对一个有精确数学定义的函数,判断'正确答案是什么'本身就是真活儿**。对大多数软件 —— UI 流程、业务规则、机器学习模型 —— oracle 问题更难,因为"正确"行为可能根本没有闭式定义。

实践中,测试代码里的 oracle 长得就像 §9 `unittest` 例子里的那一堆 `assertEqual`:测试作者把*期望输出硬编码*在测试里。只要作者写下来的是*对*的期望值,这就是个完全合法的 oracle —— 把"正确性"的担子转交给了测试编写者。

⚠️ **Test oracle 也是 attendance-quiz topic**(在课件里叫 "Systematic Testing and Oracles")。

---

## 18. 所有软件都有 bug

Lecture 14 抛出了一个令人清醒的论断,并用一句引言加一个反例佐证:

> *"All nontrivial code has defects, and the probability of nontrivial defects increases with code size. The more code you use to solve a problem, the harder it gets for someone else to understand what you did and to maintain your code when you have moved on to write still larger programs."*
> —— Holzmann, *Code Inflation*, IEEE Software, 2015

反例具体而故意刺眼:

> **问**:**F-35 联合战斗机**在常规起降时所要求的*无故障运行*周期是多长?
> (a) 6,000 年   (b) 600 年   (c) 60 年   (d) **6 小时**

答案是 **(d) 6 小时**。人类历史上最贵的武器项目把它的软件可靠性目标定在两次故障之间*六小时* —— 而最近一份政府报告说**连这个目标都还没达到**。如果一架价值数十亿美元的战斗机都不能指望连续六小时不出软件故障,那"普通软件没 bug"就是一个幻想。

跟消费级目标对比一下就更明显。**Uber** 公布的可用性目标大致是:

| 指标 | 目标 |
|------|------|
| 整体可用性 | **99.99%** |
| 每年累计停机 | 约 **1 小时** |
| 每周停机 | 约 **1 分钟** |
| 失败率 | 约 **每 10,000 次运行 1 次失败** |

这些数字听起来很激进,但你一对照它们*实际允许*的范围 ——"每年一整个小时服务挂掉" —— 再看看连这个都很难达到,就会明白:可靠性永远是一个预算,不是一个保证。

讲到"奇葩 bug"的幻灯片从另一个角度强化同一论点:真实 bug tracker 里就有 *"OpenOffice will not print on Tuesdays"*(Ubuntu bug #248619)这样的条目。这个 bug 是真的、可复现的,最后查出来是一个日期处理问题。生产环境里的 bug 比测试用例所能想到的更离奇。

![Ubuntu Launchpad bug #248619 的网页截图,2008-07-15 由 jgallo 提交,标题为 "file incorrectly labeled as Erlang JAM file (OOo does not print on Tuesdays)"。file (Debian) 与 file (Ubuntu) 两行都显示状态 "Fix Released",重要性 High。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/bug-ubuntu-prints-on-tuesdays.png)

启示不是虚无主义,而是校准期望:

| 错误的信念 | 更好的信念 |
|------|------|
| "只要我测试得够多,我的软件就没 bug。" | "我的软件一定会有 bug。测试是为了减少它们的数量和严重程度。" |
| "出了 bug 说明我是个糟糕的工程师。" | "出了 bug 说明我是个工程师。好的工程师会度量、修复、防止复发。" |
| "缺陷数与代码大小成线性关系。" | "缺陷数比代码大小*增长得更快* —— 小而简单的代码更容易保持正确。" |

这也是 **Power of Ten** 规则(§5)和"高内聚低耦合"之类设计原则的最强论据之一:更少的代码、更简单的代码、更本地化的代码 → 更少的 bug、更容易的验证。

---

## 19. 我们怎么知道测试做完了?

既然我们(根据 Dijkstra)永远不可能*完整*,既然所有软件都有 bug,"完成"就必须用一种可操作的方式定义。课件给了四个真实项目在用的工作型答案,标为 (I) 到 (IV),可以单独用,也可以混用。(幻灯片本身从 II 直接跳到了 IV;(III) 是从课堂讲解里补回来的 **fault seeding**。)

### 19.1 (I) Fixed time / fixed budget(固定时间 / 固定预算)

> *Aim to reveal as many faults as possible in a fixed period of time with a fixed budget.*
> *Target specific areas of the system.*
> *Aim to meet the quality requirements established for the project.*

在这种模型下,测试在分配给它的时间或钱用完时停下来 —— 关键在于这份*有限的*预算花在了*风险最高*的区域(复杂度高、改动频繁、面向用户冲击大、或者以前测试覆盖弱的地方)。

### 19.2 (II) Problem-find rate stabilizes near zero(找 bug 的速率趋近于零)

课件展示了一条曲线 —— y 轴是**每小时找到的问题数**,x 轴是**测试天数**:先快速爬升,达到峰值,再缓慢衰减到接近零。当找 bug 速率趋平到接近零时,说明你已经把容易的 bug 都挖出来了,再测下去也买不到多少新东西。

![一条折线图:y 轴 "Number of problems found per hour",x 轴 "Time"。曲线在第 1 天起步,第 2 天附近到达峰值,然后到第 5 天逐渐衰减至接近零。右侧有一个蓝色箭头指向拐点,标注 "Could stop testing when the problem find rate stabilizes to near zero"。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/bug-find-rate-curve.png)

> 风险:低的 find rate 也可能意味着*你的测试人员根本不擅长找 bug*,而不是系统真的没 bug 了。这个指标必须配合代码覆盖率和其他信号才靠得住。

### 19.3 (III) Fault seeding(缺陷注入 / 变异测试)

(II) 的一个聪明变种,把"测试是否做完了?"变成可度量的事情。思路:

1. 故意往代码里**注入(seed)一批已知的人造 bug** —— 小的变异,比如把 `<` 翻成 `<=`、把 `+` 和 `-` 交换、返回错的变量。
2. 让测试套件**在不告诉测试者哪些 bug 是真、哪些是 seeded 的情况下**跑一遍。
3. 数测试套件抓到了多少 seeded bug。

直觉是统计上的:如果 seeded 的 bug *在种类上*和留在代码里的真实 bug *相似*,那么**被抓到的 seeded bug 占比就是被抓到的真实 bug 占比的估计**。如果测试套件抓到了 90% 的 seeded faults,那它大致也抓到了 90% 的真实 fault,你也能由此估算还剩多少未被发现。

| 强项 | 弱项 |
|------|------|
| 给"我的测试套件到底有多好?"一个*定量*答案 | 准确度完全取决于"seeded bug 类似真实 bug"这个假设 |
| 逼着团队直面盲点 —— 没有任何一个测试能抓到的 bug | 生成够真实的 seeded bug 本身就不平凡 |
| 现代**变异测试**工具(Java 的 PIT、JS 的 Stryker、Python 的 mutmut)的基础 | 自动化变异测试在大型代码库上可能很慢 |

> 从概念上,fault seeding 回答的是和 (I)、(II) 不一样的问题。后者问的是*"我们测得够多了吗?"*,靠时间或趋势。Seeding 问的是*"测试套件本身好不好?"* —— 而这往往是更诚实的问题。

### 19.4 (IV) 业界调查给的退出准则(Kassab et al., 2017)

课件展示了一份 103 个项目的工业界调查(Kassab, DeFranco, Laplante, *Software Testing: The State of the Practice*, IEEE Software 34(5), 2017),内容是各种退出准则在实践中真的被用到了什么程度:

![Kassab et al. (2017) Figure 6 的水平条形图:103 个项目对六种测试退出准则回答了 Yes/No。"Each requirement has been tested at least once" 是最常见的 Yes(~65%);"The planned test budget is depleted" 是最少见的 Yes(~10%)。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-7/exit-criteria-kassab-2017.png)

| 准则 | 实际中用得多吗? |
|------|------|
| **每条需求都至少被测过一次** | ✅ 最常见 —— ~65% 回答 Yes |
| **所有计划好的测试活动都完成了** | ✅ ~60% 回答 Yes |
| 交付时间到了 | 中间 —— ~40% 回答 Yes |
| 找到的缺陷数已经足以让团队对软件有信心 | ❌ ~25% Yes(多数:No) |
| 度量指标达到了规定值 | ❌ ~20% Yes |
| **计划好的测试预算耗尽了** | ❌ ~10% Yes |

调查的头条发现(也是最值得记住的一条):

$$\boxed{\textbf{The most common real-world exit criterion is: "each requirement has been tested at least once."}}$$

这是一个*需求覆盖*准则。它具体、可度量、务实 —— 你不能在每条需求都还没有至少一个测试支撑前就发布。它*并不*保证软件没有 bug(没有任何东西能保证),但它把测试与规格绑回来,把验证闭环关上了。

> 跟"测试预算用光了"(只有 10% Yes)的对比令人欣慰 —— 大多数项目不会单纯因为钱没了就发版。跟"找到的缺陷已经足以信任软件"(只有 25% Yes)的对比则是令人沮丧的一面:大多数团队*并没有*一个对缺陷密度的硬阈值要求。

---

## 20. Quiz 7 复习要点

Quiz 7 被推到了下一周,但 Lecture 13 与 14 的实质内容都在考察范围内。重点:

### 20.1 必须能定义的词汇

| 术语 | 一句话定义 |
|------|------|
| **Quality Assurance (QA)** | 所有用来度量并改进产品质量的活动 |
| **Verification(验证)** | 系统是否符合规格?("把系统做对") |
| **Validation(确认)** | 系统是否完成了它的目的?("做对的系统") |
| **Mistake** | 产生不正确结果的*人的动作* |
| **Fault / Bug / Defect** | 代码中一个不正确的步骤、过程或数据定义 |
| **Error** | 计算结果与正确结果之间的差异(内部的或外部的) |
| **Failure** | fault 造成的外部可见的不正确结果 |
| **Test case(测试用例)** | 用来运行系统的(输入 + 期望输出)对 |
| **Test oracle(测试预言)** | 判断一个 test case 是 success 还是 failure 的机制 |
| **Unit testing** | 对单个代码单元的测试 |
| **Integration / functional testing** | 对已集成单元之间接口的测试 |
| **System / acceptance testing** | 对完整系统对照需求的测试 |
| **Black-box testing** | 基于规格而非代码设计的测试 |
| **White-box testing** | 基于源代码本身设计的测试 |
| **Regression testing** | 在新版本上重跑既有测试,确保老功能没被打坏 |

### 20.2 四类 QA 方法

Formal methods、static analysis、reviews and inspections、testing —— *use a mixture*。

### 20.3 四类 "who"

Programmers、testers、users(acceptance / alpha / beta / crowdsourcing-bug-bounties)。

### 20.4 三个测试层次

Unit → functional/integration → system/acceptance。每个都要能一句话讲清楚定义并给一个具体例子(ToDoList 是教科书例子)。

### 20.5 Dijkstra 名言(attendance-quiz topic)

> *"Program testing can be used to show the presence of bugs, but never to show their absence."*

要能默写下来,并解释*为什么*:输入空间太大无法穷举,所以测试只能采样;采样能发现 bug,但不能证明 bug 不存在。

### 20.6 Test cases 与 oracles(attendance-quiz topic)

怎么选 test cases(intuition、black-box [equivalence partitioning、boundary values]、white-box [path analysis]、regression、faults)。什么是 test oracle、为什么自动化它很难(cosine 例子)。

### 20.7 什么时候算测试做完了?

要能列出主要方法:固定时间/预算、瞄准特定区域、达到质量需求、find-rate 趋平稳、**fault seeding**(注入已知 bug → 度量套件抓到了多少 → 估算真实 bug 还剩多少)、以及实践中最常见的 —— *每条需求至少被测过一次*。

### 20.8 失败案例与安全准则

能认出 Boeing 737 Max、Toyota 不受控加速、Apollo 8 / Margaret Hamilton(正面例子)、Mars Polar Lander、Y2K。知道 **NASA 的两条基本准则**和 **The Power of Ten** 的整体精神(十条不必全背,但要明白:简单的控制流、固定循环上界、不要动态分配、函数要小、断言、最小作用域、检查返回值、节制使用预处理器、节制使用指针、打开所有警告 + 用分析器)。

---

## 21. 总结与记忆框架

```text
Week 7 knowledge structure
|
+-- Where we are
|   +-- Requirements -> Architecture -> Design -> User methods
|       -> Code -> QA & TESTING
|   +-- Question this week: how do we know the software works?
|
+-- Why QA matters (Lecture 13)
|   +-- Failure case studies:
|   |   +-- Boeing 737 Max  -> single sensor; safety vs. money
|   |   +-- Toyota          -> uncommanded acceleration
|   |   +-- Apollo 8        -> Hamilton; defensive design (POSITIVE)
|   |   +-- Mars Polar Lander -> spurious touchdown signal
|   |   +-- Y2K             -> 2-digit year; $300B remediation
|   +-- NASA's Cardinal Rules for Safety:
|   |   +-- No single event triggers a hazard
|   |   +-- On unsafe condition: inhibit + go to safe state
|   +-- The Power of Ten (Holzmann, IEEE 2006):
|       +-- 10 rules for safety-critical code
|       +-- simple control flow, bounded loops, no dynamic alloc,
|           small fns, 2 assertions/fn, smallest scope, check
|           return values, limited preprocessor, limited pointers,
|           all warnings + analyzers
|
+-- Quality Assurance (Lecture 13)
|   +-- QA = all activities to measure & improve quality
|   +-- Verification: build the system right (vs. spec)
|   +-- Validation:   build the right system (vs. requirements)
|   +-- Four QA technique families:
|       +-- Formal methods
|       +-- Static analysis
|       +-- Reviews and inspections
|       +-- Testing                 <-- focus of weeks 7-8
|       (use a mixture!)
|
+-- Testing basics (Lecture 13)
|   +-- Basic process: input -> expected -> run -> actual ->
|       compare -> pass/fail -> repeat (mostly automated)
|   +-- Goals: find faults; improve confidence (verification +
|       validation); be accurate / THOROUGH / repeatable /
|       systematic
|   +-- Dijkstra: "testing shows presence of bugs, never absence"
|   +-- Terminology (IEEE 610.12-90):
|   |   +-- Mistake  = human action
|   |   +-- Fault    = code defect      (= "bug" = "defect")
|   |   +-- Error    = wrong computed value
|   |   +-- Failure  = visible wrong output
|   |   (chain: Mistake -> Fault -> Error -> Failure)
|   +-- Who tests:
|   |   +-- Programmers (unit tests, TDD)
|   |   +-- Testers / QA staff
|   |   +-- Users: acceptance / alpha / beta / bug bounty
|   +-- Three levels (pyramid: many fast unit, few slow system):
|       +-- Unit:        a single function/class
|       +-- Integration: interfaces among units
|       +-- System:      complete system vs. requirements
|       (ToDoList example: setPriority -> editItem -> "create list")
|
+-- Test design (Lecture 14)
|   +-- Problem: input space ~ infinite, budget finite
|   |   -> pick test cases that buy max confidence
|   |   -> "sweet spot" on the confidence-vs-tests curve
|   +-- Six ways to choose test cases:
|   |   +-- 1. Intuition
|   |   +-- 2. Specification = BLACK-BOX:
|   |   |       +-- Equivalence-class partitioning
|   |   |       +-- Boundary-value analysis
|   |   +-- 3. Code = WHITE-BOX:
|   |   |       +-- Path analysis
|   |   +-- 4. Existing tests = REGRESSION TESTING
|   |   +-- 5. Faults
|   +-- Test oracles:
|   |   +-- Mechanism to decide pass/fail
|   |   +-- Hard to automate (cosine example: is 0.87758... right?)
|   |   +-- Strategies: hard-coded expected, reference impl,
|   |       algebraic identity, domain knowledge, spec, expert
|   +-- All software has bugs:
|       +-- Holzmann: "All nontrivial code has defects..."
|       +-- F-35 reliability target: 6 hours (not yet met!)
|       +-- Uber availability target: 99.99% (~1 hr/yr downtime)
|       +-- Bizarre bugs (OOo won't print on Tuesdays)
|
+-- When are we done? (Lecture 14)
|   +-- (I)   Fixed time/budget; target high-risk areas; meet
|   |         quality requirements
|   +-- (II)  Stop when find-rate stabilizes near zero
|   +-- (III) FAULT SEEDING / defect injection:
|   |         inject known artificial bugs -> measure what
|   |         fraction the test suite catches -> estimate what
|   |         fraction of REAL bugs remain. Basis of mutation
|   |         testing (PIT, Stryker, mutmut).
|   +-- (IV)  Kassab industry survey: most common exit criterion
|             in practice = "each requirement tested at least
|             once" (~65% Yes), then "all planned activities done"
|
+-- Quiz 7 prep (postponed one week)
    +-- All four IEEE terms (mistake/fault/error/failure)
    +-- Verification vs. validation
    +-- Four QA techniques
    +-- Three levels of testing + example
    +-- Dijkstra quote (memorize wording)
    +-- Black-box vs. white-box vs. regression
    +-- Test oracles (what & why hard to automate)
    +-- Fault seeding as a way to evaluate the test suite itself
    +-- "Each requirement tested at least once" as the most
        common exit criterion in industry
```

### 一句话总结

> 质量保证回答的是*"我们怎么知道软件真的能工作?"* —— 通过 **formal methods、static analysis、reviews 和 testing** 的混合;其中测试在选定输入上跑程序,把实际输出与期望输出对比,跨三个嵌套层次(**unit、integration、system**)进行,由程序员、专职 QA 和用户(**alpha、beta、bug bounties**)分别承担,并使用系统化的用例设计(**black-box 等价类划分与边界值、white-box 路径分析、regression**)加上 **test oracle** 来判断 pass/fail —— 但正如 **Dijkstra** 所提醒的,*"program testing can be used to show the presence of bugs, but never to show their absence"*,所以工业界对"做完了"的操作性定义大多落在 **"每条需求都至少被测过一次"** 上。
