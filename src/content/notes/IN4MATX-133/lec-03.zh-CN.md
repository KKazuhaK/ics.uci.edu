---
title: "CSS"
summary: "CSS 语法与引入方式、元素/类/ID 选择器、层叠与优先级、块级与行内元素及盒模型、定位、单位、伪类、字体，以及调试工具。"
---

# IN4MATX 133: User Interface Software — Lecture 3：CSS

## 目录

- [1. CSS 是什么，为什么要与 HTML 分开](#1-css-是什么为什么要与-html-分开)
- [2. CSS 语法、引入样式表与默认样式](#2-css-语法引入样式表与默认样式)
- [3. 元素、类与 ID 选择器](#3-元素类与-id-选择器)
- [4. 常用属性：给课程表设置样式](#4-常用属性给课程表设置样式)
- [5. 层叠：多条规则、继承、顺序与优先级](#5-层叠多条规则继承顺序与优先级)
- [6. Block 与 inline，以及盒模型](#6-block-与-inline以及盒模型)
- [7. Position 类型](#7-position-类型)
- [8. 单位](#8-单位)
- [9. 高级选择器与伪类](#9-高级选择器与伪类)
- [10. 字体与备选方案（fallback）](#10-字体与备选方案fallback)
- [11. 工具：参考资料、调试、兼容性、验证](#11-工具参考资料调试兼容性验证)
- [12. 课堂问题与 Demo（附解答）](#12-课堂问题与-demo附解答)
- [13. 速查与必记的 5 个要点](#13-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，10 月 1 日（周四）
> 内容整理自 Lecture 3 的幻灯片（共 65 页，包括 p57–65 的“Additional slides”）以及 demo 仓库文件夹 `W1_L2_Oct1_CSS`。按概念组织，而不是按来源组织。

> 📅 **课程安排**：Office hours 本周开始。周五的 Discussion section 是**线上**的（Zoom 链接在 Canvas 上）。
> **A1** 的截止时间改为 **10 月 12 日（周一）午夜**——听完这节课，你已经掌握了完成它所需的内容。
> 之后所有作业都是每隔一周的周一午夜截止：A1 – 第 3 周，A2 – 第 5 周，A3 – 第 7 周，A4 – 第 9 周，A5 – Finals 周。

---

## 1. CSS 是什么，为什么要与 HTML 分开

**CSS（Cascading Style Sheets，层叠样式表）**定义页面的*样式*规则。这与 HTML 不同，HTML 提供的是文档的*结构*。开场的例子（幻灯片 4）是同一个 HTML 页面配上三套不同的样式表：朴素的白底页面、黑色“终端”风格，以及带按钮侧边栏的红色页面——内容相同，外观完全不同。幻灯片 7–8 在浏览器 DevTools 里展示了同一个页面：左侧的元素树（`div.container`、`#sidebar` 等）在两种情况下完全一致，只有 `#sidebar` 上的 CSS 规则（颜色、position、padding）不同。

为什么要把样式放在单独的文件里（幻灯片 9）：

| 好处 | 含义 |
|---|---|
| 可复用（Reusability） | 同一套样式可以应用到多个网页 |
| 模块化（Modularity） | 一个页面可以引入多个样式表 |
| 管理清晰（Sane management） | 样式表可以与 HTML 的结构内容分开做版本控制 |
| 易维护（Maintainability） | 更容易找到页面样式所在的位置 |

**HTML 规定语义，CSS 规定外观**（幻灯片 20–21）。比较两种写“强调”的方式：

```html
<!--HTML-->
<p> This text is
<i>emphasized!</i></p>

<!--HTML-->
<p> This text is
<em>emphasized!</em></p>
```

`<i>` 把外观和语义混在了一起（它的意思就是“斜体”）。`<em>` 对外观只字不提——它表示“这里需要强调”，浏览器的默认样式恰好把它画成斜体。如果想让强调看起来不一样，应该改 CSS，而不是改标签。

> 🔗 **延伸阅读**：[W3Schools：同一页面，不同样式表（demo）](https://www.w3schools.com/css/demo_default.htm)

## 2. CSS 语法、引入样式表与默认样式

### 2.1 规则：选择器 + 属性

一条 CSS **规则（rule）**由一个**选择器（selector）**（规则作用于哪些元素）加上一个由 **property: value** 声明组成的代码块（要设置什么格式）构成。一条规则可以包含多个属性：

```css
/* CSS Pseudocode */
selector {
    property: value;
    property: value;
    ...
}
```

课上的第一个例子（来自 `cssBasics.css`）给所有 `h1` 设置样式：

```css
h1 {
	font-family: 'Arial';
	color: blue;
	background-color: #ff0000; /*red*/
}
```

`h1` 是选择器（“应用于所有 h1 标签”）；`font-family` 就是大多数人说的“字体”；`/* … */` 是 CSS 中唯一的注释语法。

### 2.2 在 HTML 中引入样式表

在 HTML 的 `<head>` 中链接样式表：

```html
<head>
    <link rel="stylesheet" href="my-style.css">
</head>
```

`rel` 表示当前页面与被引用文件之间的关系（**rel**ation）。`<link>` 没有内容，所以没有结束标签。`cssBasics.html` 就是这样引入 `cssBasics.css` 的；只有标题应用了样式——段落不受影响，因为规则的选择器是 `h1`。

在下面试一试——修改 CSS 然后点击 Run：

```viz web-demo
{"title": "Slide 12 · cssBasics.html + cssBasics.css", "html": "    <h1>This is a header!</h1>\n    <p>This is a paragraph. Notice how it doesn't have the header styles applied.</p>", "css": "h1 {\n\tfont-family: 'Arial';\n\tcolor: blue;\n\tbackground-color: #ff0000; /*red*/\n}", "height": 150, "tab": "css", "interactive": true}
```

> 🧪 **Demo 文件**：[cssBasics.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/cssBasics.html) · [cssBasics.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/cssBasics.css)

### 2.3 为什么 h1 这么大？默认值

我们从没设置过大小，标题却很大：**CSS 有默认值**。浏览器的默认样式给 `h1` 设置了 `font-size: 2em`——默认 16px 的两倍，所以标题渲染为 32px。

### 2.4 放置 CSS 的三个位置（Additional slides，课上未讲）

| 位置 | 示例 | 评价 |
|---|---|---|
| 行内（inline，`style` 属性） | `<p style="...">Red text</p>` | 支持，但通常是不好的做法：在每个元素上重复同样的样式违背 DRY（Don't Repeat Yourself）原则 |
| 内部（internal，`<head>` 中的 `<style>`） | `<style type="text/css"> p {font-family:'Arial'; color:red;} </style>` | 直接把 CSS 写进 HTML 的 `<head>` |
| 外部（external，用 `<link>` 链接 `.css` 文件） | `<link rel="stylesheet" href="./css/style.css">` | 通常是最佳实践——把结构和样式分开 |

幻灯片 58 上的行内示例写成了 `style="font-family='Arial'; color=red;"`。这是幻灯片上的错误：在 `style` 里面写的仍然是 CSS，要用冒号，所以应该是 `style="font-family:'Arial'; color:red;"`。写成 `=` 的版本会被忽略，文字仍然是黑色的 Times 字体。

> 🔗 **延伸阅读**：[W3Schools：CSS 默认值](https://www.w3schools.com/cssref/css_default_values.php)

## 3. 元素、类与 ID 选择器

三种基本选择器（幻灯片 14），这里它们的声明完全相同：

```css
p {                 /* element：要设置样式的标签 */
    font-family: 'Arial';
    color: red;
}
.emphasize {        /* class：一类元素 */
    font-family: 'Arial';
    color: red;
}
#redtext {          /* id：某一个特定元素 */
    font-family: 'Arial';
    color: red;
}
```

**`.`** 表示 class，**`#`** 表示 id，没有前缀表示标签名。class 和 id 就是带值的普通 HTML 属性，和 `href`、`src` 一样（幻灯片 15）：

```html
<div class="widget foo" id="baz"></div>
```

- 一个元素可以有**多个 class**（用空格分隔），但**只能有一个 ID**。
- 每个页面中，**同一个 ID 只能出现在一个元素上**——这是通过验证的要求。
- 同一个 class 可以（也应该）用在很多元素上；这就是一次给很多东西设置样式的方法。

选择器可以**链式连接**（中间不加空格），要求同时满足所有条件（幻灯片 16）：

```css
div.widget.foo#baz {
    /*can chain selectors together!*/
}
```

这会匹配同时具有 class `widget`、class `foo` **并且** id 为 `baz` 的 `div`。（加上空格则含义不同——见[后代选择器](#9-高级选择器与伪类)。）

小技巧（幻灯片 17）：ID 可以用于页面内导航。`http://example.com/#id` 会直接滚动到具有该 id 的元素——幻灯片展示了一份课程大纲跳转到它的“Electronics”部分。

一步步看这些选择器（颜色是我自己加的，方便看清每条规则）：

```viz web-demo
{"title": "Slides 14–16 · element, class, ID and chained selectors (colours are mine, to tell the rules apart)", "html": "<p>A plain paragraph</p>\n<p class=\"emphasize\">A paragraph with class=\"emphasize\"</p>\n<p id=\"redtext\">A paragraph with id=\"redtext\"</p>\n<div class=\"widget foo\" id=\"baz\">div class=\"widget foo\" id=\"baz\"</div>\n<div class=\"widget\">div class=\"widget\" only</div>", "css": "body { font-family: 'Arial'; }", "steps": [{"note": "Element selector p: every <p> on the page.", "css": "p {\n  color: red;\n}"}, {"note": "Class selector .emphasize: only elements with that class.", "css": ".emphasize {\n  background-color: #fde68a;\n}"}, {"note": "ID selector #redtext: the one element with that id.", "css": "#redtext {\n  border: 2px solid red;\n}"}, {"note": "Chained div.widget.foo#baz: a div with BOTH classes AND that id, so the plain .widget div is not matched.", "css": "div.widget.foo#baz {\n  background-color: #bfdbfe;\n}"}], "height": 200, "interactive": true}
```

> ⚠️ **易错点**：`#name` 匹配 `id`，`.name` 匹配 `class`，而单独的 `name` 匹配的是*标签*。本来想选 `<em>` 标签却写成 `#em` 或 `.em`，或者本来想选 `id="zot"` 却写成 `zot`，都不会匹配到任何东西——这正是 Question 1 里的陷阱。

> 📝 **练习**：[Question 1：哪段 CSS 能渲染出 ZOT! 段落？](#121-question-1哪段-css-能渲染出图中的-zot-zot-zot幻灯片-2227)

> 🔗 **延伸阅读**：[CSS-Tricks：ID 与 class 的区别](https://css-tricks.com/the-difference-between-id-and-class/)

## 4. 常用属性：给课程表设置样式

你会经常用到的属性（幻灯片 18）：

| 属性 | 控制什么 |
|---|---|
| `font-family` | “字体”（备选字体用逗号分隔——见 [§10](#10-字体与备选方案fallback)） |
| `font-size` | 文字大小 |
| `font-weight` | 粗细（`bold`，或 `700` 这样的数字） |
| `color` | 文字颜色 |
| `background-color` | 元素的背景 |
| `opacity` | 透明度 |

……还有很多很多（见参考链接）。

**Demo 1**（幻灯片 19，“Let's style a class schedule”）正是把这些属性应用到一张表格上。`setup1.html` 是一张 5 天的表格，单元格里放着 `<div class="discussion">`、`<div class="lecture">`，以及一个 `<div id="a1">Assignment due</div>`；`setup1.css` 里只有 TODO 清单。解答用到了一个标签选择器、两个类选择器和一个 ID 选择器：

```css
th {
	font-size: 150%;
}

.discussion {
	background-color: limegreen;
}

.lecture {
	background-color: royalblue;
	color: white;
}

#a1 {
	background-color: saddlebrown;
	color: white;
}
```

一条规则一步地看解答：

```viz web-demo
{"title": "Slide 19 · Demo 1: setup1.html → solution1.css, one rule per step", "html": "   <h1>My 133 Schedule</h1>\n   <table>\n   \t<tr>\n   \t\t<th>Monday</th>\n   \t\t<th>Tuesday</th>\n   \t\t<th>Wednesday</th>\n   \t\t<th>Thursday</th>\n   \t\t<th>Friday</th>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t\t<div id=\"a1\">Assignment due</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   </table>", "css": "", "steps": [{"note": "th { font-size: 150%; } — header row bigger.", "css": "th {\n\tfont-size: 150%;\n}"}, {"note": ".discussion — limegreen background.", "css": ".discussion {\n\tbackground-color: limegreen;\n}"}, {"note": ".lecture — royalblue background, white text.", "css": ".lecture {\n\tbackground-color: royalblue;\n\tcolor: white;\n}"}, {"note": "#a1 — saddlebrown background, white text.", "css": "#a1 {\n\tbackground-color: saddlebrown;\n\tcolor: white;\n}"}], "height": 230}
```

> 🧪 **Demo 文件**：[setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup1.html) · [setup1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup1.css) · [solution1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/solution1.css)

> 📝 **练习**：[Demo 1：给课程表上色](#122-demo-1给课程表上色幻灯片-19--setup1--solution1)

> 🔗 **延伸阅读**：[W3Schools：CSS 参考](http://www.w3schools.com/cssref/default.asp)

## 5. 层叠：多条规则、继承、顺序与优先级

“Cascading（层叠）”就是 CSS 里的 C：**多条规则可以同时作用于同一个元素**，浏览器会把它们合并起来。

**多条规则**（幻灯片 28）。一个带有两个 class 的元素会同时获得标签规则和两个 class 的规则：

```html
<!--HTML-->
<p class="big blue">
This tag has two classes: "big" and "blue"
(classes are separated by spaces)
</p>
```

```css
/* CSS */
p { font-family: 'Verdana'; }   /* apply to all <p> tags */
.big { font-size: larger; }     /* apply to all with class="big" */
.blue { color: blue; }          /* apply to all with class="blue" */
```

结果：Verdana 字体、更大（19.2px，而不是 16px）、蓝色。

**继承（Inheritance）**（幻灯片 29）。许多 CSS 属性（字体、颜色）还会从父标签继承，所以深层嵌套的元素会从它所有的祖先那里收集样式：

```html
<div class="content"> <!-- has own styling -->
  <div class="sub-div"> <!-- has own styling + .content styling -->
    <ol class="my-list"> <!-- own styling + .sub-div + .content -->
                         <!-- own style is ol AND .my-list rules-->
      <!-- li styling + .my-list + .sub-div + .content -->
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ol>
  </div>
</div>
```

**顺序（Order）**（幻灯片 30）。规则按顺序应用：**在同级（peer）选择器之间，后面的规则获胜**。

```html
<!--HTML-->
<p class="red green">
<em class="blue">Text is blue!</em>
</p>
```

```css
/* CSS */
p { font-family: 'Verdana'; }
.red { color: red; }
.green { color: green; }
.blue { color: blue; }
```

`.red` 和 `.green` 都是匹配该 `<p>` 的类选择器，所以 CSS 中写在后面的（`.green`）获胜——`<p>` 是绿色的。*class 属性*里的顺序无关紧要：`class="green red"` 仍然是绿色。`<em>` 是蓝色，因为直接作用于该元素本身的规则（`.blue`）胜过它只是从父元素继承来的颜色。

**外部样式表同样按顺序应用**（additional slide 61）。对于

```html
<head>
  <link rel="stylesheet" href="./css/bootstrap.css">
  <link rel="stylesheet" href="./css/style.css">
</head>
```

`style.css` 在 `bootstrap.css` 之后加载，所以两者冲突时你的规则会覆盖 Bootstrap 的。把自己的样式表放在最后链接。

**优先级（Specificity）**（幻灯片 31）。当选择器*不是*同级时，CSS 会根据选择器的类型计算**优先级**。一般规则是：“离 HTML 元素更近”的规则生效。从最具体到最不具体：

| 更具体 → 更不具体 | | | |
|---|---|---|---|
| 行内 `style` 属性 | ID 选择器（`#banner`） | 类、伪类、其他属性（`.sidebar1`） | 元素、伪元素（`ul`、`h1`） |

幻灯片也承认这部分很难——通常靠反复试验（以及 DevTools，见 [§11](#11-工具参考资料调试兼容性验证)）就能解决大多数问题。

```viz web-demo
{"title": "Slides 28 & 30 · several rules on one element, last peer rule wins", "html": "<p class=\"big blue\">\nThis tag has two classes: \"big\" and \"blue\"\n(classes are separated by spaces)\n</p>\n<p class=\"red green\">\n<em class=\"blue\">Text is blue!</em> (and this part of the p?)\n</p>", "css": "p { font-family: 'Verdana'; }\n.big { font-size: larger; }\n.blue { color: blue; }", "js": "for (const el of document.querySelectorAll('p, em')) {\n  const c = getComputedStyle(el);\n  console.log(el.tagName, '\"' + el.className + '\"', c.color, c.fontSize);\n}", "steps": [{"note": "Add .red then .green (slide 30): both match the second <p>; .green comes later, so green wins. The <em> has its own .blue rule, which beats the colour it would inherit.", "css": ".red { color: red; }\n.green { color: green; }"}], "height": 150, "interactive": true}
```

> ⚠️ **易错点**：“后面的规则获胜”只能在**相同**优先级的选择器之间分出胜负。先写的 `#id` 规则仍然胜过后写的 `.class` 规则。

## 6. Block 与 inline，以及盒模型

到目前为止，页面就是“一长串列表”（幻灯片 32）：文字一行接一行，就像用不同字体的打字机。要缩进、分栏、让各部分重叠或加边框，我们就需要对元素进行定位。

### 6.1 Block 与 inline 元素

HTML 标签（几乎）都属于以下两类之一：

- **Block（块级）**元素——另起一行，后面有换行（`<p>`、`<div>`、`<h1>`–`<h6>`、`<ul>`、`<ol>`、`<li>`、`<table>`、`<form>`、`<header>`、`<footer>`、`<nav>`、`<section>`、`<article>` 等）
- **Inline（行内）**元素——没有换行，在文字中顺流排布（`<a>`、`<em>`、`<strong>`、`<span>`、`<img>`、`<b>`、`<i>`、`<code>`、`<input>`、`<button>`、`<label>` 等）

```html
<p>
This is on a line.
<em>This is on the same line.</em>
</p>
<p>This will be on a new line.</p>
```

`<p>` 是 block，`<em>` 是 inline。**不要把 block 元素放进 inline 元素里面！**（幻灯片 34 列出了 W3Schools 上的全部元素。）

### 6.2 盒模型（box model）

每个元素都是一个由四层构成的盒子，从内到外依次是：

| 层 | 作用 |
|---|---|
| **Content（内容）** | “真正的”内容；其大小由 `width` 和 `height` 决定 |
| **Padding（内边距）** | 扩展内容区域；背景色会延伸到这一层 |
| **Border（边框）** | 类似，绘制在 padding 外围；有 `border-color`、`border-width`、`border-style` |
| **Margin（外边距）** | 透明的空白，把元素与相邻元素隔开 |

`padding`、`border` 和 `margin` 都有按方向的属性：`padding-top`、`margin-right`、`border-left` 等。

所有定位都是**相对于父元素**的：如果标签嵌套，子元素的 margin 等是在父元素的盒子内部测量的。

**Demo 2**（幻灯片 38）接着做课程表。`setup2.css` 中的 TODO：给所有单元格加 1 像素的实线边框，给表头单元格加 5px 的 padding，给每个 discussion、lecture 和 assignment 加 5px 的 margin。解答：

```css
td, th {
	border-width: 1px;
	border-style: solid;
}

th {
	font-size: 150%;
	padding: 5px;
}

.discussion {
	background-color: limegreen;
	margin: 5px;
}

.lecture {
	background-color: royalblue;
	color: white;
	margin: 5px;
}

#a1 {
	background-color: saddlebrown;
	color: white;
	margin: 5px;
}
```

带逗号的 `td, th` 是**选择器列表（selector list）**：规则同时应用于两者。现在每个单元格都有自己的盒子；彩色方块与单元格边缘之间有 5px 的距离，表头文字在边框内有 5px 的 padding。

```viz web-demo
{"title": "Slide 38 · Demo 2: setup2.css → solution2.css (border, padding, margin)", "html": "   <h1>My 133 Schedule</h1>\n   <table>\n   \t<tr>\n   \t\t<th>Monday</th>\n   \t\t<th>Tuesday</th>\n   \t\t<th>Wednesday</th>\n   \t\t<th>Thursday</th>\n   \t\t<th>Friday</th>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   \t<tr>\n   \t\t<td>\n   \t\t\t<div class=\"discussion\">Discussion</div>\n   \t\t\t<div id=\"a1\">Assignment due</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t\t<td>\n   \t\t\t<div class=\"lecture\">Lecture</div>\n   \t\t</td>\n   \t\t<td>\n   \t\t</td>\n   \t</tr>\n   </table>", "css": "th {\n\tfont-size: 150%;\n}\n\n.discussion {\n\tbackground-color: limegreen;\n}\n\n.lecture {\n\tbackground-color: royalblue;\n\tcolor: white;\n}\n\n#a1 {\n\tbackground-color: saddlebrown;\n\tcolor: white;\n}", "steps": [{"note": "1-pixel solid border on all cells.", "css": "td, th {\n\tborder-width: 1px;\n\tborder-style: solid;\n}"}, {"note": "5px padding inside the header cells.", "css": "th {\n\tpadding: 5px;\n}"}, {"note": "5px margin around every discussion, lecture and assignment box.", "css": ".discussion, .lecture, #a1 {\n\tmargin: 5px;\n}"}], "height": 240, "interactive": true}
```

> 🧪 **Demo 文件**：[setup2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup2.html) · [setup2.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/setup2.css) · [solution2.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/solution2.css)

> 📝 **练习**：[Demo 2：边框、padding 与 margin](#123-demo-2边框padding-与-margin幻灯片-38--setup2--solution2)

### 6.3 简写（Additional slides，课上未讲）

`padding`/`margin` 可以在一行里写 1–4 个值，从顶部开始顺时针方向（“TRouBLe”：Top、Right、Bottom、Left）：

| 写法 | 含义 |
|---|---|
| `padding: 10px 5px 5px 10px;` | 上 10，右 5，下 5，左 10 |
| `padding: 10px 5px 10px;` | 上 10，左**和**右 5，下 10 |
| `padding: 8px 12px;` | 上**和**下 8，左**和**右 12 |

很难记住；写得明确一些会以牺牲简洁为代价提高可读性。border 的简写更容易——下面两种写法是等价的：

```css
div {
    border-bottom-width: 3px;
    border-bottom-style: solid;
    border-bottom-color: red;
}

div.equivalent {
    border-bottom: 3px solid red;
}
```

> ⚠️ **易错点**：边框需要 `border-style`。只写 `border-width: 1px` 什么也画不出来——这就是 `solution2.css` 两个都设置的原因。

> 🔗 **延伸阅读**：[W3Schools：HTML block 与 inline 元素](https://www.w3schools.com/html/html_blocks.asp) · [MDN：CSS 盒模型简介](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Box_Model/Introduction_to_the_CSS_box_model) · [W3Schools：CSS 盒模型](https://www.w3schools.com/css/css_boxmodel.asp) · [CSS-Tricks：用 “TRouBLe” 记住 margin/padding 简写顺序](https://css-tricks.com/remember-the-order-of-marginpadding-shorthand-with-trouble/) · [W3Schools：CSS 边框](https://www.w3schools.com/css/css_border.asp)

## 7. Position 类型

`position` 属性有四个值（幻灯片 39）：

| 值 | 行为 | 遵循页面流（flow）？ |
|---|---|---|
| `static` | 默认值 | 是 |
| `relative` | 相对于它原本所在位置偏移 | 是——有助于对页面流做调整 |
| `absolute` | 从（最近的已定位祖先元素的）左上角开始放置 | 否——完全忽略页面流 |
| `fixed` | 类似 absolute，但是浮动的：页面滚动时位置不变 | 否 |

`absolute` 和 `fixed` 会忽略页面流，但在某些情况下很有用（幻灯片 40）：用 **relative** 定位把一个“member? SIGN IN ABOVE”徽章挪到表单的角落，以及用 **absolute** 定位放置一个**悬浮操作按钮（floating action button，FAB）**——邮件 app 角落里那个圆形的“+”。

下面的例子是我自己写的（仓库里没有这些幻灯片对应的文件）：一个用 `relative` 挪动的盒子，以及一个在 `relative` 卡片内部用 `absolute` 放置的“+”按钮，也就是幻灯片中 CSS-Tricks 链接里的模式。

```viz web-demo
{"title": "Slides 39–40 · static, relative, and absolute inside relative (my example)", "html": "<div class=\"card\">\n  <div class=\"box\">static</div>\n  <div class=\"box rel\">relative</div>\n  <div class=\"box\">static</div>\n  <button class=\"fab\">+</button>\n</div>", "css": ".card { border: 2px solid #444; padding: 10px; height: 150px; }\n.box { display: inline-block; width: 80px; padding: 8px; background: #bfdbfe; }\n.fab { width: 40px; height: 40px; border-radius: 50%; }", "steps": [{"note": "position: relative with top/left nudges the box from where it would be; its old spot stays reserved.", "css": ".rel { position: relative; top: 20px; left: 10px; background: #fca5a5; }"}, {"note": "position: absolute on the button takes it out of the flow; with a relative parent, bottom/right are measured from the card's corner (a floating action button).", "css": ".card { position: relative; }\n.fab { position: absolute; bottom: 10px; right: 10px; }"}], "height": 200, "interactive": true}
```

> 🔗 **延伸阅读**：[Interneting Is Hard：高级定位](https://internetingishard.com/html-and-css/advanced-positioning/) · [CSS-Tricks：relative 内部的 absolute（示例）](https://css-tricks.com/examples/AbsoluteInsideRelative/)

## 8. 单位

CSS 长度单位有像素（`px`）、元素单位（`em`）、百分比（`%`）和现实世界单位（`in`、`cm`）。

- **尽可能使用相对单位（`em`、`%`）。**这有助于无障碍访问：低视力的人会修改浏览器的默认文字大小（通常是 16px）。`em` 的大小会基于这个默认值缩放；而固定为 30px 的标题无论用户怎么设置都还是 30px。
- 相对单位还可以根据屏幕大小改变布局——下一讲会详细介绍（[Lecture 4](lec-04.zh-CN.md)）。

幻灯片上关于在什么场景用哪些单位的表：

| | 推荐 | 偶尔使用 | 不推荐 |
|---|---|---|---|
| 屏幕 | `em`、`px`、`%` | `ex` | `pt`、`cm`、`mm`、`in`、`pc` |
| 打印 | `em`、`cm`、`mm`、`in`、`pt`、`pc`、`%` | `px`、`ex` | |

本讲中的例子：Demo 1 里的 `th { font-size: 150%; }` 是相对的——继承大小的 1.5 倍——而默认的 `h1` 是 `2em`。

> 🔗 **延伸阅读**：[Engage Interactive：em、rem 与 px 的对比](https://engageinteractive.co.uk/blog/em-vs-rem-vs-px)

## 9. 高级选择器与伪类

组合器（combinator）根据元素在树中的位置来选择元素。它们“对写出整洁的样式表极其有用”——你按结构来设置样式，而不必给每个东西都加一个 class。

| 选择器 | 名称 | 选中 |
|---|---|---|
| `ul li`（空格） | 后代（Descendant） | `ul` 里的**所有** `li`——子元素和孙元素 |
| `ul > li` | 子（Child） | 只选 `ul` 的**直接**子元素 `li`（不含孙元素） |
| `p + h2` | 相邻兄弟（Adjacent sibling） | **紧跟**在 `p` 兄弟元素之后的 `h2` |
| `p ~ h2` | 通用兄弟（General sibling） | `p` 兄弟元素之后**任意位置**的 `h2`（同一个父元素） |

幻灯片 42 的例子：给所有跟在段落后面的 `h2` 加上外边距顶部，或者只对某个特定 `div` 里的这类 `h2` 加：

```css
p + h2 {
    margin-top: 10px;
}

div.post p + h2 {
    margin-top: 10px;
}
```

第二条把所有东西组合了起来：一对 `p + h2`，并且它是 class 为 `post` 的 `div` 的后代。

幻灯片 43–45 用小型的树来说明。在 `<ul><li>one</li><li>two<ol><li>nested one</li><li>nested two</li></ol></li><li>three</li></ul>` 中，`ul li` 命中全部五个 `li`，`ul > li` 只命中 one、two、three。在 `<div><p>Line One</p><p>Line Two</p><div>Box</div><p>Line Three</p></div>` 中：`p + p` 只命中 Line Two；`div + p` 命中 Line Three；`p ~ p` 命中 Line Two 和 Line Three；`div ~ p` 命中 Line Three。

`advancedSelectors.css`（来自仓库），应用于一个包含标题、段落和 Reid 教授家猫的药物清单的页面：

```css
h1 {
    margin-top: 0px;
}

h2 {
    margin-top: 0px;
}

p ~ h2 {
    color: blue;
}

p + h1 {
	margin-top: 10px;
}

p + h2 {
	margin-top: 10px;
}

ul > li {
    font-weight: bold;
}
```

你会看到：紧跟在段落后面的两个 `h1` 重新获得了 10px 的上外边距；紧跟在另一个 `h1` 后面的 `h1` 以及第一个 `h1` 保持为 0。唯一的 `h2` 前面（同一个 `<body>` 中更早的位置）有 `p` 兄弟元素，所以 `p ~ h2` 让它变成蓝色——即使它紧跟在 `h1` 后面而不是 `p`。Momo、Nemo、Willow、Leo 是粗体（`ul > li`）；而嵌套在 `<ol>` 里的 Prozac、Antibiotic、Churu 不是。HTML 里提出的问题是：*如果把嵌套列表改成 `ul` 会怎样？为什么？*——它们会变成粗体，因为现在它们也是 `ul` 的直接子元素了（demo 的最后一步）。

```viz web-demo
{"title": "Slides 42–45 · advancedSelectors.html + advancedSelectors.css (lorem ipsum shortened)", "html": "    <h1>This is a header!</h1>\n    <p>This is a paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <h2>This is a header following a header</h2>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <p>Prof Reid's cat's medications</p>\n    <ul>\n        <li>Momo</li>\n        <li>Nemo</li>\n        <li>Willow</li>\n        <li>Leo</li>\n            <!-- What happens if I change the nested list to ul...? why? -->\n            <ol>\n                <li>Prozac</li>\n                <li>Antibiotic</li>\n                <li>Churu (very important)</li>\n            </ol>\n    </ul>", "css": "", "steps": [{"note": "Remove the default top margin on h1 and h2.", "css": "h1 {\n    margin-top: 0px;\n}\n\nh2 {\n    margin-top: 0px;\n}"}, {"note": "p + h1 / p + h2: a heading IMMEDIATELY after a paragraph gets 10px back; the h1 right after another h1 doesn't.", "css": "p + h1 {\n\tmargin-top: 10px;\n}\n\np + h2 {\n\tmargin-top: 10px;\n}"}, {"note": "p ~ h2: any h2 that comes after a p sibling (not necessarily right after) turns blue.", "css": "p ~ h2 {\n    color: blue;\n}"}, {"note": "ul > li: only the direct <li> children of the <ul> are bold; the <li>s inside the nested <ol> are not.", "css": "ul > li {\n    font-weight: bold;\n}"}, {"note": "The comment's question: change the nested <ol> to <ul> — now those <li>s are direct children of a ul too, so they turn bold.", "html": "    <h1>This is a header!</h1>\n    <p>This is a paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <h1>This is a header following a paragraph!</h1>\n    <h2>This is a header following a header</h2>\n    <p>Yet another paragraph. Lorem ipsum dolor sit amet…</p>\n    <p>Prof Reid's cat's medications</p>\n    <ul>\n        <li>Momo</li>\n        <li>Nemo</li>\n        <li>Willow</li>\n        <li>Leo</li>\n            <!-- What happens if I change the nested list to ul...? why? -->\n            <ul>\n                <li>Prozac</li>\n                <li>Antibiotic</li>\n                <li>Churu (very important)</li>\n            </ul>\n    </ul>"}], "height": 420, "interactive": true}
```

> 🧪 **Demo 文件**：[advancedSelectors.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/advancedSelectors.html) · [advancedSelectors.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/advancedSelectors.css)

> ⚠️ **易错点**：`advancedSelectors.html` 里嵌套的 `<ol>` 直接位于 `<ul>` 内部，而不是在 Leo 的 `<li>` 里面。浏览器能渲染它，但合法的 HTML 要求把嵌套列表放在 `<li>` 内部（幻灯片 43 的树就是这样做的）。

### 9.1 伪类（Additional slides，课上未讲）

伪类（pseudo-class）选择处于特殊**状态**的元素：`selector:pseudo-class { … }`。经典的例子是链接：

```css
a:link { /* 未访问的链接 */
    color: #FF0000;
}
a:visited { /* 已访问的链接 */
    color: #00FF00;
}
a:hover { /* 鼠标悬停在链接上 */
    color: #FF00FF;
}
a:active { /* 被选中的链接 */
    color: #0000FF;
}
```

这里顺序很重要，因为“后面的规则获胜”：`:hover` 必须写在 `:link` 和 `:visited` 之后，`:active` 必须写在 `:hover` 之后。

> 🔗 **延伸阅读**：[Smashing Magazine：驯服高级 CSS 选择器](https://www.smashingmagazine.com/2009/08/taming-advanced-css-selectors/) · [CSS-Tricks：子选择器与兄弟选择器](https://css-tricks.com/child-and-sibling-selectors/) · [W3Schools：CSS 伪类](https://www.w3schools.com/Css/css_pseudo_classes.asp)

## 10. 字体与备选方案（fallback）

**字体栈（Font stacks）。**`font-family` 接受一个列表；浏览器按顺序尝试这些字体，使用第一个可用的。最后以一个通用字体族（`serif`、`sans-serif`）结尾，这样总能得到一个合理的结果：

```css
p {
    font-family: "Times New Roman", Times, serif;
}
```

**Web 字体。**Google Fonts 是个很好的资源：在 HTML 中链接它的样式表，然后在 CSS 中使用该字体名并附上备选字体：

```html
<!--HTML-->
<link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
```

```css
/* CSS */
font-family: 'Roboto', sans-serif;
```

幻灯片上把它写成了 `rel=“stylesheet">`，开头是弯引号；原样粘贴的话，属性值会变成 `“stylesheet`，字体样式表就永远加载不出来。请使用直引号。

dafont.com（“互联网上最酷的网站，客观地说……？”）有无数开源字体——有些花哨到远超过你在无障碍、易读的网页设计中的需要。

**HTML 中的备选方案**道理相同：浏览器会选择第一个它能使用的来源。

```html
<video autoplay>
    <!--webm not supported in IE or Safari-->
    <source src="lecture3.webm" type="video/webm" />
    <!--mp4 supported in modern browsers, but lower quality-->
    <source src="lecture3.mp4" type="video/mp4" />
    <!--backup important for some old browsers-->
    <img src="lecture3.jpg" title="Your browser does not support the <video> tag">
</video>
```

**为什么需要备选方案**（幻灯片 49）：某种格式不被支持（webm、ogg、flac）；某个字体可能不支持某些字符；某个字体可能需要时间加载（“flash of unstyled text”，无样式文字闪烁）——所以要选一个相似的默认字体，这样 Web 字体到达时页面不会跳动。

> 🔗 **延伸阅读**：[Google Fonts](https://fonts.google.com/) · [dafont.com](http://dafont.com) · [CSS-Tricks：用于稳健网页排版的备选字体栈](https://css-tricks.com/css-basics-fallback-font-stacks-robust-web-typography/)

## 11. 工具：参考资料、调试、兼容性、验证

“CSS 的内容太多了。光凭记忆我写不出多少东西。”——Reid 教授。没有人能背下每个属性；需要时去查：

- **参考资料**：W3Schools CSS reference、cssreference.io、MDN CSS reference、Codecademy 的 Learn CSS 课程。
- **在浏览器中调试**：DevTools（Inspect element）会显示元素树、作用于所选元素的每条规则（被覆盖的会画上删除线——层叠的可视化）以及盒模型示意图；你还可以实时修改数值（幻灯片 7–8 和 52）。
- **浏览器兼容性**：标准已经稳定，但仍然值得在 caniuse.com 上查一下某个特性。
- **验证**：W3C Markup Validation Service 会检查你的 HTML（例如重复的 ID）。

> 🔗 **延伸阅读**：[W3Schools CSS 参考](https://www.w3schools.com/cssref/) · [cssreference.io](https://cssreference.io/) · [MDN CSS 参考](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference) · [Codecademy：Learn CSS](https://www.codecademy.com/learn/learn-css) · [YouTube：在浏览器中调试 CSS](https://www.youtube.com/watch?v=Z3HGJsNLQ1E) · [Can I use](https://caniuse.com/)
> 🔗 **延伸阅读**：[W3C Markup Validation Service](https://validator.w3.org)

## 12. 课堂问题与 Demo（附解答）

### 12.1 Question 1：哪段 CSS 能渲染出图中的 ZOT! ZOT! ZOT!？（幻灯片 22–27）

投票遵循惯常流程（幻灯片 22）：个人作答 → 公布回答 → 全班讨论 → 公布正确答案。

哪段 CSS 能渲染出

```html
<p class="para">
ZOT!
ZOT!
<em id="zot">ZOT!</em>
</p>
```

这个截图效果：一行文字，**UCI 蓝色条上的白色“ZOT! ZOT!”**，最后一个 **ZOT! 是黄色粗斜体**？

- **A**
  ```css
  p {
      font-family: 'Verdana';
      color: #0064a4; /*Blue*/
      background-color: white;
  }
  #em {
      color: #ffd200; /*Yellow*/
      font-weight: 700; /*Bold*/
  }
  ```
- **B**
  ```css
  .para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: white;
  }
  zot {
      color: #ffd200; /*Yellow*/
      font-style: italic;
      font-weight: 700; /*Bold*/
  }
  ```
- **C**
  ```css
  .para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: white;
  }
  em {
      color: #ffd200; /*Yellow*/
      font-weight: 700; /*Bold*/
  }
  ```
- **D**
  ```css
  #para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: white;
  }
  .em {
      color: #ffd200; /*Yellow*/
      font-style: italic;
      font-weight: 700; /*Bold*/
  }
  ```
- **E**
  ```css
  .para {
      font-family: 'Verdana';
      background-color: #0064a4; /*Blue*/
      color: #ffd200; /*Yellow*/
  }
  #zot {
      color: white;
      font-style: italic;
      font-weight: 700; /*Bold*/
  }
  ```

> ✍️ **先自己试一试。**

**答案：C**（在幻灯片 27 公布；仓库里的 `q1answer.css` 就是选项 C）。

`.para` 通过 class 匹配 `<p>` → 蓝色背景、白色 Verdana 文字。`em` 通过标签匹配 `<em>` → 黄色、粗体。斜体不需要任何规则：`<em>` 在浏览器默认样式下就是斜体（[§2.3](#23-为什么-h1-这么大默认值)）。

| 选项 | 实际效果 | 为什么错 |
|---|---|---|
| A | 白底蓝字；最后的 ZOT! 是蓝色，不是黄色也不是粗体 | 颜色弄反了，而且 `#em` 查找的是 `id="em"`，它并不存在 |
| B | 色条正确，但最后的 ZOT! 是白色且不是粗体 | `zot` 是*标签*选择器（没有 `<zot>` 元素）；id 需要写成 `#zot` |
| C | 蓝底白字，最后的 ZOT! 是黄色、粗体、斜体 | ✓ |
| D | 什么样式都没有——白底黑字 | `#para` 需要 `id="para"`（而这里是 class），`.em` 需要 `class="em"` |
| E | 黄色的“ZOT! ZOT!”和白色粗斜体的最后一个 ZOT! | 选择器正确，颜色弄反了 |

每个选项的计算样式（背景上的文字颜色、斜体、粗细）：

| 选项 | `<p>` | `<em>` |
|---|---|---|
| A | rgb(0, 100, 164) 文字，白底 | rgb(0, 100, 164)，斜体，400 |
| B | rgb(0, 100, 164) 底，白字 | 白色，斜体，400 |
| C | rgb(0, 100, 164) 底，白字 | rgb(255, 210, 0)，斜体，700 |
| D | 黑字，无背景 | 黑色，斜体，400 |
| E | rgb(0, 100, 164) 底，rgb(255, 210, 0) 文字 | 白色，斜体，700 |

```viz web-demo
{"title": "Question 1 check · q1answer.html + q1answer.css (option C)", "html": "    <p class=\"para\">ZOT! ZOT! <em id=\"zot\">ZOT!</em></p>", "css": ".para {\n    font-family: Verdana;\n    background-color: #0064a4;\n    color: white;\n}\n\nem {\n    color: #ffd200;\n    font-weight: 700;\n}", "js": "const s = el => { const c = getComputedStyle(el); return c.color + ' on ' + c.backgroundColor + ', ' + c.fontStyle + ', weight ' + c.fontWeight; };\nconsole.log('p:  ' + s(document.querySelector('p')));\nconsole.log('em: ' + s(document.querySelector('em')));", "height": 80}
```

> 🧪 **Demo 文件**：[q1answer.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/q1answer.html) · [q1answer.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W1_L2_Oct1_CSS/q1answer.css)

返回 [§3 元素、类与 ID 选择器](#3-元素类与-id-选择器)。

### 12.2 Demo 1：给课程表上色（幻灯片 19 · setup1 → solution1）

任务（`setup1.css` 里的 TODO 清单），针对 `setup1.html` 中的表格：

- 把表头行的字体大小增大到 150%
- 把 discussion 的背景改为 limegreen
- 把 lecture 的背景改为 royalblue
- 把 a1 的背景改为 saddlebrown
- 把 lecture 和 a1 的文字颜色改为白色

关键的标记：表头单元格是 `<th>`，方块是 `<div class="discussion">`、`<div class="lecture">` 和 `<div id="a1">`。

> ✍️ **先自己试一试。**

**答案**（`solution1.css`）：

```css
th {
	font-size: 150%;
}

.discussion {
	background-color: limegreen;
}

.lecture {
	background-color: royalblue;
	color: white;
}

#a1 {
	background-color: saddlebrown;
	color: white;
}
```

根据 HTML 提供的信息选择选择器：每个表头单元格用标签（`th`），重复出现的方块用 class（`.lecture`），唯一的作业用 id（`#a1`）。结果：更大的星期名称、绿色的 Discussion 方块、带白字的蓝色 Lecture 方块、带白字的棕色“Assignment due”方块。逐步 demo 见 [§4](#4-常用属性给课程表设置样式)。

### 12.3 Demo 2：边框、padding 与 margin（幻灯片 38 · setup2 → solution2）

`setup2.css` 以 Demo 1 的解答为起点。任务：

- 给所有单元格加 1 像素的实线边框
- 给表头单元格加 5 像素的 padding
- 给所有 discussion、lecture 和 assignment 加 5 像素的 margin

> ✍️ **先自己试一试。**

**答案**——`solution2.css` 新增的行：

```css
td, th {
	border-width: 1px;
	border-style: solid;
}

th {
	/* ...font-size: 150%; from Demo 1... */
	padding: 5px;
}

/* inside .discussion, .lecture and #a1 */
	margin: 5px;
```

“所有单元格”指 `td` 和 `th` 两者，所以用一条带选择器列表的规则。padding 在表头的边框内部；margin 在每个彩色方块的外部，把它从单元格边缘推开 5px——方块不再贴着边框。逐步 demo 见 [§6.2](#62-盒模型box-model)。

## 13. 速查与必记的 5 个要点

**选择器**

| 选择器 | 匹配 |
|---|---|
| `p` | 每个 `<p>`（元素 / 标签） |
| `.big` | class 中包含 `big` 的每个元素 |
| `#a1` | 唯一一个 `id="a1"` 的元素 |
| `div.widget.foo#baz` | 链式：满足所有条件的那个元素 |
| `td, th` | 选择器列表：任一 |
| `ul li` | 后代：任意深度 |
| `ul > li` | 仅直接子元素 |
| `p + h2` | 紧跟在兄弟元素 `p` 之后的 `h2` |
| `p ~ h2` | 兄弟元素 `p` 之后任意位置的 `h2` |
| `a:hover` | 伪类：处于某种状态的元素 |

**本讲涉及的属性**

| 分组 | 属性 |
|---|---|
| 文本 | `font-family`、`font-size`、`font-weight`、`font-style`、`color` |
| 盒子 | `background-color`、`opacity`、`width`、`height`、`padding(-top…)`、`margin(-right…)`、`border(-left…)`、`border-width`、`border-style`、`border-color` |
| 布局 | `position: static \| relative \| absolute \| fixed` |

**单位**：`px` 绝对单位 · `em` 相对于字体大小 · `%` 相对于父元素 · `in`/`cm` 用于打印。屏幕上优先使用 `em`/`%`。

**优先级，从高到低**：行内 `style` > `#id` > `.class` / `:pseudo-class` / 属性 > 元素。相同时：后面的规则获胜。

**必记的 5 个要点**

1. `.` 是 class，`#` 是 id，没有前缀是标签——前缀写错会悄无声息地什么都匹配不到（Question 1）。
2. 在优先级相同的规则中，**CSS 里最后写的那条**获胜；`class` 属性中 class 的顺序无关紧要。
3. id 在每个页面中是唯一的，一个元素最多只能有一个；class 可以复用，一个元素可以有多个。
4. 盒模型由内到外：content → padding（会应用背景）→ border（需要 style）→ margin（透明，隔开相邻元素）。
5. `ul li` 能选到孙元素，`ul > li` 不能；`p + h2` 表示*紧跟*在后面，`p ~ h2` 表示在后面的*任意位置*。
