---
title: "响应式设计与 JavaScript（一）"
summary: "自适应与响应式设计、断点与媒体查询、流式网格、移动优先、Bootstrap 网格与组件，以及 JavaScript 的角色与历史入门。"
---

# IN4MATX 133: User Interface Software — Lecture 4：响应式设计与 JavaScript 1

## 目录

- [1. 普适计算时代的屏幕](#1-普适计算时代的屏幕)
- [2. 自适应设计与响应式设计](#2-自适应设计与响应式设计)
- [3. 测试响应式设计](#3-测试响应式设计)
- [4. 断点与媒体查询](#4-断点与媒体查询)
- [5. 流式网格与弹性图片](#5-流式网格与弹性图片)
- [6. 移动优先设计](#6-移动优先设计)
- [7. 基于网格的布局](#7-基于网格的布局)
- [8. 网格框架及其批评者](#8-网格框架及其批评者)
- [9. 配置 Bootstrap](#9-配置-bootstrap)
- [10. Bootstrap 网格系统](#10-bootstrap-网格系统)
- [11. Bootstrap 的默认样式与组件](#11-bootstrap-的默认样式与组件)
- [12. JavaScript 的角色](#12-javascript-的角色)
- [13. 其他 Web 语言与 JavaScript 的流行度](#13-其他-web-语言与-javascript-的流行度)
- [14. JavaScript 的历史与版本](#14-javascript-的历史与版本)
- [15. JavaScript 与 Java](#15-javascript-与-java)
- [16. 课堂问题与演示（附解答）](#16-课堂问题与演示附解答)
- [17. 速查与必记的 5 个要点](#17-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，10/6（周二）
> 内容整理自 Lecture 4 的幻灯片（共 85 页，包含关于自适应设计的“Extra slides”）以及演示代码仓库中的 `W2_L1_Oct6_Bootstrap` 文件夹。按概念组织，而不是按来源组织。

> 📅 **课程安排**：A1（响应式作品集）在午夜截止——幻灯片写的是“Monday (10/6)”，具体日期请以 Canvas 为准。
> 周五的 discussion 是线下进行的，之后所有的 discussion 也都是线下；如有变动，请查看 Canvas 上的“Discussion & Office Hours updates”页面。
> Slack 上有 A1 专用频道，可以在那里提问求助。
> A1 小贴士（幻灯片 60）：认真回答 README 里的问题——用 Question 2 为自己争取分数，尤其是 3C（描述你用到的进阶功能）。修复 HTML/CSS 校验和无障碍（accessibility）警告，或者在 README 里说明为什么忽略某些警告；错误和“已知问题”（known issues）是不可接受的，会扣分。善用浏览器的 Web Developer tools（查看 Console 报错、检查盒模型（box model）、使用分辨率模拟器）。如果你已经开始写了，可以把现有代码改造成使用 Bootstrap。

---

## 1. 普适计算时代的屏幕

回顾 [Lecture 1](lec-01.zh-CN.md#2-weiser-与计算的三次浪潮) 中 Weiser 的三次计算浪潮：**大型机**（“多对一”：许多人共用一台计算机）、**个人计算**（“一对一”）和**普适计算**（“一对多”：一个人拥有多台设备）。每一次浪潮都改变了网页需要适配的对象。

- **个人计算时代**：页面通常是 **960 px 宽**。当时大多数屏幕宽 1024 px（幻灯片写的是“1024x978”，常见尺寸其实是 1024x768），所以 960 能给垂直滚动条留出空间，而且 960 可以被许多列数整除（960 Grid System 就是基于它设计的）。
- **今天**：幻灯片 7 的显示分辨率图表涵盖了 Weiser 所说的 **tabs**（英寸级）、**pads**（码级）和 **boards**（英尺级，幻灯片上的标注如此）——有几十种分辨率。即使“只看 Apple 设备”（幻灯片 8，一张 iPhone/iPad 型号表），也涉及许多不同的逻辑宽度、高度和缩放比例。

那么该如何应对？有两种答案：**响应式设计**（responsive design）或**自适应设计**（adaptive design）。

> 🔗 **延伸阅读**：[960 Grid System](https://960.gs/) · [Wikipedia: Display resolution](https://en.wikipedia.org/wiki/Display_resolution) · [iOS Resolution (Apple device sizes)](https://www.ios-resolution.com/)

## 2. 自适应设计与响应式设计

- **自适应设计**：开发并维护**多套代码**，根据**设备类型**和屏幕尺寸改变布局。示意图中每种设备（桌面、平板、手机）各有一套独立的设计。
- **响应式设计**：开发**一套 HTML 和 CSS**，根据**屏幕尺寸**改变布局。一套设计适配所有设备。

| | 响应式设计 | 自适应设计 |
|---|---|---|
| **+** | 只需维护一套代码，面向未来 | 可以针对设备的能力和性能定制体验 |
| **−** | 性能较差：需要下载整个样式表 | 维护多套代码库困难得多 |
| **−** | 重点放在让页面“看起来正确”，而不是打造体验 | 开发只能局限于少数关键功能，因为每种设备都要单独实现 |

所以总的来说：**自适应性能更好**（加载时间更短），**响应式更容易开发**。

**Web 之外（幻灯片 19）。** 这两个术语来自 Web 开发，但原则同样适用于其他软件。许多游戏会发行到多个平台：界面通常会**按平台重新设计（自适应）**，而**响应式**设计用来处理同一平台上的不同分辨率——但也不绝对：导出为网页版和桌面版的游戏往往是响应式而不是自适应的。整个行业正在**从自适应设计转向响应式设计**（幻灯片 20），本讲接下来的内容也围绕后者展开。

**自适应设计的实践**（Extra slides，课上没讲）：
- *为什么要费这个劲？* 视频的加载量很大。为什么要发送比屏幕能渲染的更高的分辨率，白白浪费自己的带宽，还让视频卡顿（用户不满）？像 Google 这样的公司（幻灯片展示的是 Chrome 设备模式下的移动端 YouTube）承担得起这种开发负担。
- *检测设备*：**用户代理字符串**（user agent string）可以在 JavaScript 中通过 `navigator.userAgent` 获取。但通常有更好的办法——你真的在乎浏览器或操作系统吗？分辨率是不是就够了？而且这个字符串可能被伪造或不准确。
- *更好的做法*：在 **`<link>` 上使用媒体查询**，让浏览器加载对应的外部样式表：

```html
<!--HTML-->
<head>
  <link rel="stylesheet" media="screen and (device-width: 375px)
    and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="iPhone8.css">
</head>
```

下面的演示会打印当前浏览器的用户代理字符串（在你自己的浏览器里运行同样的代码，打印的就是你的）：

```viz web-demo
{"title": "Extra slide 84 · navigator.userAgent", "html": "<p>See the console.</p>", "js": "console.log(navigator.userAgent);\n", "height": 60}
```

> 📝 **练习**：[问题 1](#161-问题-1响应式与自适应的性能和开发成本幻灯片-1216) · [问题 2](#162-问题-2炉石传说用响应式还是自适应幻灯片-18)
> 🔗 **延伸阅读**：[Webflow: Adaptive vs. responsive design](https://webflow.com/blog/adaptive-vs-responsive-design) · [MDN: Browser detection using the user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent)

## 3. 测试响应式设计

Chrome 和 Firefox 都提供了无需拥有所有设备就能测试不同分辨率的工具：

- **Firefox**：响应式设计模式（Responsive Design Mode），快捷键 `ctrl + opt + M`（与幻灯片一致；Mac 快捷键）。
- **Chrome**：打开 DevTools 并使用设备模式（device mode）（幻灯片展示的是 Prof. Reid 的作品集页面被压缩到手机宽度的样子）。

> 🔗 **延伸阅读**：[Chrome DevTools: Device mode](https://developer.chrome.com/docs/devtools/device-mode/) · [MDN: Browser detection using the user agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Browser_detection_using_the_user_agent)

## 4. 断点与媒体查询

**断点**（breakpoint）是设计“崩坏”的那个点——到了这里，页面不再美观或不再可用，所以布局必须在此处改变。设计各有不同，但大多有 **3–5 个断点**：超小（老式手机）、小（手机）、中（平板）、大（笔记本或台式机）、超大（宽屏台式机或墙面显示器）。这同样有点类似 Weiser 的三类计算机（tabs、pads、boards）。

断点在 CSS 中用**媒体查询**（media query）来书写。查询可以写得非常具体：

```css
/* CSS */
@media screen and (device-width: 375px) and (device-height: 667px)
  and (-webkit-device-pixel-ratio: 2) {
  /* iPhone 8-specific CSS */
}
```

它的组成部分：`@media`；媒体类型（media type）——`screen`、`print`、`speech`、`all`；媒体特性（media feature）——`min-width`、`max-width`、`orientation`、`-webkit-min-device-pixel-ratio`，以及许许多多其他特性。通常你只需要把宽度划分成几个区间（幻灯片 24 和 49）：

```css
@media screen and (max-width: 640px) {
  /* small screens */
}
@media screen and (min-width: 640px and max-width: 1024px) {
  /* medium screens */
}
@media screen and (min-width: 1024px) {
  /* large screens */
}
```

> ⚠️ **易错点**：幻灯片中间那条查询是无效的——`(min-width: 640px and max-width: 1024px)` 把两个特性放在了同一对括号里，所以浏览器会认为它永远不匹配，中等屏幕就拿不到任何样式。每个特性都需要自己的括号：`@media screen and (min-width: 640px) and (max-width: 1024px)`。

下面的演示使用幻灯片上的三个区间，并修正了中间那条查询；请逐步切换视口宽度：

```viz web-demo
{"title": "Slides 24/49 · three breakpoints (fixed middle query)", "html": "<div class=\"box\">Resize me</div>\n", "css": ".box { padding: 20px; color: white; background: gray; }\n\n@media screen and (max-width: 640px) {\n  /* small screens */\n  .box { background: seagreen; }\n  .box::after { content: \" (small)\"; }\n}\n@media screen and (min-width: 640px) and (max-width: 1024px) {\n  /* medium screens */\n  .box { background: royalblue; }\n  .box::after { content: \" (medium)\"; }\n}\n@media screen and (min-width: 1024px) {\n  /* large screens */\n  .box { background: saddlebrown; }\n  .box::after { content: \" (large)\"; }\n}\n", "width": 375, "height": 90, "interactive": true, "steps": [{"note": "800px wide: only the medium query matches.", "width": 800}, {"note": "1200px wide: only the large query matches.", "width": 1200}]}
```

| 视口 | 匹配的查询 | 方框颜色 |
|---|---|---|
| 375px | `max-width: 640px` | 绿色“(small)” |
| 800px | `min-width: 640px` and `max-width: 1024px` | 蓝色“(medium)” |
| 1200px | `min-width: 1024px` | 棕色“(large)” |

## 5. 流式网格与弹性图片

响应式设计依赖两项技术：

- **流式网格**（fluid grids）：把内容排布在宽度可以变化的列中。Bootstrap 可以帮上忙（[第 10 节](#10-bootstrap-网格系统)）。
- **弹性图片**（flexible images）：让图片大小随屏幕布局变化。把图片放进能够适当缩放的容器里，并设置 `width: 100%`、`max-width: 100%`、`height: auto`，这样图片会随容器缩小，同时保持宽高比。

```css
img {
  max-width: 100%;  /* never wider than its container */
  height: auto;     /* keep the aspect ratio */
}
```

> 🔗 **延伸阅读**：[W3Schools: Media query examples](https://www.w3schools.com/css/css3_mediaqueries_ex.asp)

## 6. 移动优先设计

跨屏幕尺寸构建页面有两个方向：

- **“优雅降级”**（graceful degradation，移动端*最后*考虑）：先为桌面设计，再硬塞到更小的屏幕上——幻灯片的示意图把它标为“degraded, shoe-horned, short-sighted, crappy”（降级的、硬塞的、短视的、糟糕的）。
- **“渐进增强”**（progressive enhancement，移动端*优先*）：**先为移动端规划设计，再利用更多的屏幕空间让应用变得更好**——增加更多功能，并让现有功能更容易操作（“progressively enhanced, future-friendly, awesome”，渐进增强的、面向未来的、很棒的）。

**移动优先，而不是只做移动端。** 直接把移动端界面照搬到桌面会造成低效：导航时多余的点击，以及未被充分利用的屏幕空间（幻灯片中的例子：桌面显示器上的手机风格 Google Sheets 界面，以及 Windows 8 的磁贴开始屏幕）。所以要为移动端做规划，但也要考虑体验在桌面和其他设备上应当如何变化；不要只是把一切放大——要*增强*你的设计。

> 🔗 **延伸阅读**：[Prototypr: Mobile first, desktop worst](https://blog.prototypr.io/mobile-first-desktop-worst-f900909ae9e2)

## 7. 基于网格的布局

网格是排布内容的成熟工具（幻灯片把网格线叠加在一页中世纪手抄本上）。网格化的内容让人感觉熟悉、易于阅读；一般来说，最好追求**更少的线条**——但打破这条规则对于创意和吸引注意力很重要。

网格的组成部分（幻灯片 31 标注了一个新闻网站）：

- **行**（Rows）——水平的内容带。
- **列**（Columns）——把宽度划分成的竖向单元（示例用了 12 列：2 列的 logo、8 列的菜单、1 列的边距、2 | 8 | 2 的头图区域、1 | 10 | 1 的文章行）。
- **间距槽**（Gutters）——列与列之间的空隙。
- **内边距/间隔**（Padding/spacing）——由具体元素定义。

> 🔗 **延伸阅读**：[Rune Madsen: Grid systems (Printing Code lecture)](http://printingcode.runemadsen.com/lecture-grid/)

## 8. 网格框架及其批评者

基于网格的框架为你提供现成的流式网格：

| 框架 | 幻灯片上的说明 |
|---|---|
| **Bootstrap** | 最流行，扩展最多（本课程使用） |
| **Foundation** | 包含图标、拖放编辑器 |
| **Pure.css** | 文件体积小，仅 3.5KB |

网格框架让开发更容易。**那么它们有什么缺点？**

1. 它们**可能导致网页千篇一律**（Bootstrap 自带的示例模板——Album、Pricing、Checkout、Product、Cover、Carousel、Blog、Dashboard——看起来都是同一种风格）。
2. 它们**可能需要加载很多文件，拖累性能**（一条网络瀑布流，里面有几十个 jQuery/插件脚本）。
3. 它们**可能扼杀创造力**（基于相同组件构建的付费主题）。

960 Grid System 的发明者对网格批评者的反驳是：“Michael Phelps 沿着泳池底部画的线游泳，并不会让他成为一个才华较差的游泳运动员”——网格是一种指引，而不是对技能的限制。

> 🔗 **延伸阅读**：[Bootstrap](https://getbootstrap.com/) · [W3Schools: Bootstrap 5 get started](https://www.w3schools.com/bootstrap5/bootstrap_get_started.php) · [Foundation](https://get.foundation/) · [Pure.css](https://pure-css.github.io/)

## 9. 配置 Bootstrap

**直接下载**会得到 CSS 和 JavaScript 文件。**压缩版**（minified，`.min.css`、`.min.js`）经过压缩，加载更快；**`.map`** 文件用于辅助编辑预处理过的文件（本课不会用到）。我们目前使用 `bootstrap.min.css`，并且要在你自己的样式表**之前**加载，这样你的规则才能覆盖 Bootstrap 的：

```html
<link rel="stylesheet" href="css/bootstrap.min.css">
<link rel="stylesheet" href=“css/override.css">
```

也可以改用**内容分发网络（CDN）**：浏览器端缓存减轻了加载文件的负担（访问者可能已经在访问其他网站时缓存了 Bootstrap）。它还附带两个属性：
- `integrity`：一个哈希值，让浏览器检查下载的文件是否与预期完全一致——即使 CDN 服务器被攻破，也能保护你。
- `crossorigin`：有些导入需要凭据；`anonymous` 表示不需要。

```html
<link rel="stylesheet" href=“https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css”integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
```

> ⚠️ **易错点**：这两页幻灯片都含有幻灯片软件产生的弯引号（`“…”`）。有了它们，`href` 的值就变成了 `“css/override.css`（引号字符也在里面），文件会 404；在 CDN 那一行里，弯引号把 `integrity` 属性吞进了 URL，于是 Bootstrap 根本加载不了。要把每个引号都重新输入成直引号 `"`，并在 `integrity` 前加一个空格。修正后：
> `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">` ——用这一行，哈希能匹配，Bootstrap 的样式也会生效。

**指定视口（viewport）**，写在页面的 `<head>` 中。它设置设备宽度和缩放级别（用于缩放操作）：

```html
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
```

**指定容器（container）。** 所有 Bootstrap 内容都放在容器里。它只是一个类，所以任何元素都可以当容器：

```html
<div class="container">
  <!--Bootstrap content-->
</div>

<main class="container">
  <!--Bootstrap content-->
</main>
```

> 🔗 **延伸阅读**：[Bootstrap 5.3: Download](https://getbootstrap.com/docs/5.3/getting-started/download/)

## 10. Bootstrap 网格系统

网格有 **12 列**——12 的因数很多（1、2、3、4、6）。你写一个 `row`，并给每个子元素加上 `col-[size]-[number]` 类：`number` = 它占 12 列中的几列，`size` = 从哪个断点起生效。

| | 超小 | 小 | 中 | 大 | 超大 |
|---|---|---|---|---|---|
| 视口 | <576px | ≥576px | ≥768px | ≥992px | ≥1200px |
| 容器最大宽度 | 无（auto） | 540px | 720px | 960px | 1140px |
| 类前缀 | `.col-` | `.col-sm-` | `.col-md-` | `.col-lg-` | `.col-xl-` |

列数：12。间距槽宽度：30px（每列两侧各 15px）。可嵌套：是。可调整列顺序：是。（这张表和“15px 间距槽”来自 Bootstrap 4 的文档；在幻灯片加载的 Bootstrap 5.3 中，上面的断点和容器宽度依然成立，但每列每侧的内边距是 12px。）

**幻灯片中的规则：**
- **行是块级元素，列是行内元素**——列在行内并排排列。
- **超过 12 列的内容会在同一行内换行**：`3 + 6 + 4 = 13`，所以那个 4 会换到下一行。
- **尺寸数字是可选的**：单独的 `.col` 会按比例平分剩余空间。
- **没有指定尺寸的 `.col` 默认是最小尺寸（xs）**，即在所有宽度下都生效。
- **列出的最大尺寸会覆盖所有未列出的更大尺寸**：`col-12 col-md-8` = 小屏幕上占 100%，中等及以上占 67%（8/12）。

```html
<main class="container">
  <div class="row">
    <div class="col-3">A</div>
    <div class="col-6">B</div>
    <div class=“col-4">C</div>
    <div class=“col">D</div>
    <div class="col">E</div>
  </div>
</main>
```

结果（幻灯片 40，修正弯引号之后）：A（3）和 B（6）在第一行；C（4）放不下（3+6+4=13），换行；在第二行，C 占 4 列，D 和 E 平分剩下的 8 列（各 4 列）。如果保留幻灯片里的弯引号，C 和 D 的类就成了 `“col-4"` / `“col"`（带着引号字符），Bootstrap 会忽略它们，于是各自独占一整行。

```viz web-demo
{"title": "Slides 40 & 42 · Bootstrap grid (curly quotes fixed)", "libs": ["bootstrap"], "html": "<main class=\"container\">\n  <div class=\"row\">\n    <div class=\"col-3\">A</div>\n    <div class=\"col-6\">B</div>\n    <div class=\"col-4\">C</div>\n    <div class=\"col\">D</div>\n    <div class=\"col\">E</div>\n  </div>\n  <hr>\n  <div class=\"row\">\n    <div class=\"col-12 col-md-8\">.col-12 .col-md-8</div>\n    <div class=\"col-6 col-md-4\">.col-6 .col-md-4</div>\n  </div>\n  <div class=\"row\">\n    <div class=\"col-6\">.col-6</div>\n    <div class=\"col-6\">.col-6</div>\n  </div>\n</main>\n", "css": ".row > div { background: #0099ff; color: white; border: 1px solid white; text-align: center; }\n", "width": 1000, "height": 200, "interactive": true, "steps": [{"note": "375px (xs): .col-12 takes the whole row and .col-6 drops below it at half width; .col-6 stays 50% everywhere.", "width": 375}]}
```

| 类 | xs（375px） | md 及以上（1000px） |
|---|---|---|
| `col-12 col-md-8` | 100% | 67% |
| `col-6 col-md-4` | 50% | 33% |
| `col-6` | 50% | 50% |

**显示类（display classes）** 用来应用某种显示类型（如 `none` 或 `block`），并且可以与尺寸组合：
- `.d-none` 在所有尺寸下隐藏元素。
- `.d-md-none` 在 md 及更大尺寸下隐藏。
- `.d-md-block.d-none`（两个类一起）只在 sm 和 xs 下隐藏——`d-none` 先在所有尺寸下隐藏，再由 `d-md-block` 从 md 起把它重新显示出来。

**Bootstrap 的媒体查询**是以 Sass mixin 的形式书写的（Sass 会在本学期后面讲到）：

```css
/* Extra small devices (old phones, less than 768px) */
@include media-breakpoint-up(xs) { ... }
/* Small devices (phones, 768px and up) */
@include media-breakpoint-up(sm) { ... }
/* Medium devices (tablets, 992px and up) */
@include media-breakpoint-up(md) { ... }
/* Large devices (desktops, 1200px and up) */
@include media-breakpoint-up(lg) { ... }

// Example usage:
@include media-breakpoint-up(sm) {
  .some-class {
    display: block;
  }
}
```

> ⚠️ **易错点**：这些幻灯片注释里的像素值比上面的网格表整体错了一档（sm 是 ≥576px，md ≥768px，lg ≥992px，xl ≥1200px）。考试题以网格表为准。

> 📝 **练习**：[演示 1](#163-演示-1响应式课程表幻灯片-44--setup1--solution1) · [问题 3](#164-问题-3哪段代码能实现这个布局幻灯片-4548)
> 🔗 **延伸阅读**：[Bootstrap 5.3: Grid system](https://getbootstrap.com/docs/5.3/layout/grid/)

## 11. Bootstrap 的默认样式与组件

- **默认样式**：Bootstrap 会替你改动很多样式（标题、表单字段、按钮），并通过类的后缀添加自定义样式（例如幻灯片上的 Primary、Success、Info、Warning、Danger 等按钮变体）。
- **组件**：把元素预先组合成常见模式——导航栏、下拉菜单、提醒框（alert）等会简单得多。有些组件需要 JavaScript（还要加载 Bootstrap 的 JS 文件）。

> 🔗 **延伸阅读**：[Bootstrap CSS (default styling)](http://getbootstrap.com/css) · [Bootstrap 3.4: Components](https://getbootstrap.com/docs/3.4/components/)

## 12. JavaScript 的角色

“换挡”来讲第三种 Web 语言（课上说“如果还有时间”才介绍）。每种语言各司其职：

| 语言 | 类型 | 角色 |
|---|---|---|
| HTML | 标记语言 | 指定内容如何渲染 |
| CSS | 样式语言 | 为内容设置视觉样式 |
| JavaScript | 编程语言 | 动态操作内容 |

**为什么要用 JavaScript？** 它让页面变得**动态**，让页面变得**个性化**，让页面能够**与其他来源交互**，比如数据库和 API。

## 13. 其他 Web 语言与 JavaScript 的流行度

- 如今几乎可以用任何语言创建动态网站：**Ruby** 通过 Ruby on Rails，**Python** 通过 Django 或 web2py。
- 有些语言会**转译（transpile）为 JavaScript**：**TypeScript**（微软出品）引入了类型——课程后面会再讲 TypeScript；**Kotlin**（幻灯片写“by Google”；实际上它由 JetBrains 创建，并得到 Google 支持）既能运行在 Java 虚拟机上，*也*能编译成 JavaScript，把 Google 的所有平台连接了起来。
- **流行度**（GitHub Octoverse，2023–2025 年 GitHub 上前 10 名语言）：JavaScript 在 2024 年初之前一直排第 1，之后落到 Python 之后，再后来又落到 TypeScript 之后；到 2025 年 8 月，排名依次是 TypeScript、Python、JavaScript、Java、C#、PHP、Shell、C++、HCL、Go。JavaScript 加 TypeScript 仍然占据主导。

> 🔗 **延伸阅读**：[GitHub Octoverse](https://octoverse.github.com/)

## 14. JavaScript 的历史与版本

**JavaScript 是怎么成为 Web 开发中最流行的语言的？**

- **1995 年**：“最初以 Mocha 为名开发，该语言在 1995 年 9 月随 Netscape Navigator 2.0 的 beta 版首次发布时，正式名称是 LiveScript，后来才改名为 JavaScript。”当时 Java 的人气正在上升，所以这个名字是一种**营销噱头**；它本意是成为与 Java 的“桌面”相对的“Web”语言。
- **1997 年**：Netscape 把 JavaScript 提交给 **ECMA International**（欧洲计算机制造商协会，European Computer Manufacturers Association）作为行业标准；各版本被标准化为 **“ECMAScript”**，1997 年首次通过。
- **1990 年代末–2000 年代初**：出现了各种替代品——微软的 **JScript** 引擎，以及用于动态 Web 的 **Macromedia Flash**。两者都有点像 JavaScript，但标准不同。
- **趋于统一**：Firefox 在 2005 年问世，Adobe 收购了 Flash，JScript 也开始遵循标准。但各浏览器对该语言的实现仍有差异。
- **JavaScript 引擎**：SpiderMonkey（Firefox）、V8（Chrome、Node.js）、JavaScriptCore（Safari）、Chakra（IE 和 Edge，现已弃用）。

**版本。** ECMAScript 只是 JavaScript 的标准。每年都会发布新版本，但自 2015 年（ES6）以来标准变化不大。引擎和浏览器一直在追赶（幻灯片上的 ES6 兼容性表大部分是绿色，只有少数红色空缺），所以许多工具支持的是稍旧一些的标准版本。

**Polyfill** 用来确保用户的浏览器拥有最新的库：它们会下载新增函数的“填充”（fill）版本，这些版本是用已有函数重写的。也叫 **“shim”** 或 **“fallback”**（幻灯片展示的是 Polyfill.io，它通过一个 `<script>` 标签只提供每个浏览器所需的 polyfill）。

> 🔗 **延伸阅读**：[The history of JavaScript (Medium, Ben Aston)](https://medium.com/@benastontweet/lesson-1a-the-history-of-javascript-8c1ce3bffb17) · [ES6 compatibility table](https://compat-table.github.io/compat-table/es6/)

## 15. JavaScript 与 Java

尽管名字相似，这两者是毫无关系的语言：

| JavaScript | Java |
|---|---|
| 解释型语言 | 编译型语言（编译为字节码） |
| 由 JavaScript 引擎执行 | 在 Java 虚拟机（JVM）中运行 |
| 引擎运行的就是程序员写的代码 | 字节码人无法阅读 |
| 通过 ECMAScript 标准化，但存在差异 | “一次编写，到处部署”（Write once, deploy anywhere） |
| 调试依赖于执行环境 | 在编译时就能发现 bug |
| 基于原型（prototype based） | 基于类（class-based） |
| 所有浏览器无需插件即可使用 | 在大多数浏览器中需要插件才能运行 |

> 💡 **关键洞察**：用 Python 的话来说，JavaScript 的行为像解释执行的脚本（错误在那一行运行时才出现，而且取决于运行它的浏览器），而 Java 则类似 C++ 的先编译模型（许多 bug 在运行之前就能被发现）。

---

## 16. 课堂问题与演示（附解答）

### 16.1 问题 1：响应式与自适应的性能和开发成本（幻灯片 12–16）

下列说法哪一个是正确的？*（2 分钟自己思考；5 分钟与同学讨论。）* 幻灯片 16 换了种问法：总体而言，哪一种**性能**更好（加载时间更短）？总体而言，哪一种**更容易开发**？

- A. 响应式性能更好，也更容易开发
- B. 响应式性能更好，但自适应更容易开发
- C. 自适应性能更好，但响应式更容易开发
- D. 自适应性能更好，也更容易开发
- E. 没有区别（这个答案是错的）

> ✍️ **先自己试试。**

**答案：C**（幻灯片 16 上有标注）。自适应只给每台设备发送为它专门做的代码，所以加载量更小；响应式则要在所有设备上下载整个样式表。但响应式只有一套代码库，而自适应意味着要维护多套。A 和 B 把性能说反了；D 忽略了维护多套代码库的成本。回到[第 2 节](#2-自适应设计与响应式设计)。

### 16.2 问题 2：炉石传说用响应式还是自适应？（幻灯片 18）

假设你在开发《炉石传说》（Hearthstone）这款电子游戏，它既可以在手机上玩（左图），也可以在桌面上玩（右图）。你用来制作这款游戏的工具可以轻松地把同一个游戏项目导出为能在手机或 PC 上运行的可执行文件。你会采用响应式还是自适应设计？为什么？*（2 分钟自己思考；5 分钟与同学讨论。）*

> ✍️ **先自己试试。**

**答案**（讨论题；幻灯片 19 给出了要点）：对于不同的**平台**（手机与 PC），游戏通常会**重新设计界面——即自适应**——因为小屏幕上的触摸操作和大屏幕上的鼠标操作需要不同的布局（两张截图展示了不同的牌桌和操作控件）。而在同一个平台内，**响应式**设计负责处理众多分辨率。但也不绝对：导出为网页版和桌面版的游戏往往只做响应式。回到[第 2 节](#2-自适应设计与响应式设计)。

### 16.3 演示 1：响应式课程表（幻灯片 44 · setup1 → solution1）

幻灯片展示的“My 133 Schedule”在桌面上是一张表格，在手机上则是一摞单元格。任务（`setup1.html` 中的 TODO 注释）：

- 把表格变成 Bootstrap 的 container，把每一行变成 Bootstrap 的 row
- 在中等及以上屏幕上，让每个单元格成为宽度为 2 的列
- 在小屏幕和超小屏幕上隐藏表头行

起始代码是一个普通的 `<table>`（周一到周五的表头行，然后是两行单元格，里面是 Discussion / Lecture / Assignment due 的 `<div>`），并在 `setup1.css` 之前从 CDN 链接了 Bootstrap 5.1.3。

> ✍️ **先自己试试。**

**答案**（`solution1.html`；CSS 不变）。只添加了类：

```html
<table class="container">
	<tr class="row">
		<th class="d-none d-md-block col-md-2">Monday</th>
		<!-- … same for Tuesday–Friday -->
	</tr>
	<tr class="row">
		<td class="col-md-2">
			<div class="discussion">Discussion</div>
		</td>
		<td class="col-md-2">
			<div class="lecture">Lecture</div>
		</td>
		<!-- … every td gets col-md-2 -->
	</tr>
</table>
```

- `container` / `row` 把表格及其各行变成 Bootstrap 的网格（它只是一个类，所以连 `<table>` 都可以用）。
- `col-md-2` 让每个单元格从 md（≥768px）起占 12 列中的 2 列；低于 md 时没有尺寸类，所以每个单元格占满整行，单元格会堆叠起来。
- `d-none d-md-block` 在 md 以下隐藏星期名称，从 md 起显示。

在 375px 时，单元格每行一个堆叠起来，没有表头；在 1000px 时，表头行回来了，五天并排显示，每个占 2/12 宽（这一行没有占满：5 × 2 = 10 列）。请逐步切换：

```viz web-demo
{"title": "Slide 44 · Demo 1 solution1.html (Bootstrap 5.3 here; the repo loads 5.1.3)", "libs": ["bootstrap"], "html": "<div>\n   <h1>My 133 Schedule</h1>\n   <table class=\"container\">\n      <tr class=\"row\">\n         <th class=\"d-none d-md-block col-md-2\">Monday</th>\n         <th class=\"d-none d-md-block col-md-2\">Tuesday</th>\n         <th class=\"d-none d-md-block col-md-2\">Wednesday</th>\n         <th class=\"d-none d-md-block col-md-2\">Thursday</th>\n         <th class=\"d-none d-md-block col-md-2\">Friday</th>\n      </tr>\n      <tr class=\"row\">\n         <td class=\"col-md-2\">\n            <div class=\"discussion\">Discussion</div>\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n         </td>\n      </tr>\n      <tr class=\"row\">\n         <td class=\"col-md-2\">\n            <div class=\"discussion\">Discussion</div>\n            <div id=\"a1\">Assignment due</div>\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n\n         </td>\n         <td class=\"col-md-2\">\n            <div class=\"lecture\">Lecture</div>\n         </td>\n         <td class=\"col-md-2\">\n         </td>\n      </tr>\n   </table>\n</div>\n", "css": "td, th {\n\tborder-width: 1px;\n\tborder-style: solid;\n}\n\nth {\n\tfont-size: 150%;\n\tpadding: 5px;\n}\n\n.discussion {\n\tbackground-color: limegreen;\n\tmargin: 5px;\n}\n\n.lecture {\n\tbackground-color: royalblue;\n\tcolor: white;\n\tmargin: 5px;\n}\n\n#a1 {\n\tbackground-color: saddlebrown;\n\tcolor: white;\n\tmargin: 5px;\n}\n", "width": 375, "height": 330, "steps": [{"note": "md and up (1000px): header row visible, every cell is col-md-2.", "width": 1000}]}
```

> 🧪 **演示文件**：[setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/setup1.html) · [setup1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/setup1.css) · [solution1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/solution1.html) · [solution1.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/solution1.css)

回到[第 10 节](#10-bootstrap-网格系统)。

### 16.4 问题 3：哪段代码能实现这个布局？（幻灯片 45–48）

目标：在 **lg 屏幕（笔记本）**上：A | B（A 更宽），C | D（等宽），E 占满整行。在 **sm 屏幕（手机）**上：A 占满整行，B 占满整行，C | D（等宽），E 占满整行。*（2 分钟独立思考；5 分钟讨论并投票作答。）*

A.
```html
<div class="row">
  <div class="col-md-8 col-sm-12">A</div>
  <div class="col-md-4 col-sm-12”>B</div>
  <div class="col-md-6">C</div>
  <div class="col-md-6">D</div>
  <div class="col-12">E</div>
</div>
```

B.
```html
<div class="row">
  <div class="col-md-8 col-sm-12">A</div>
  <div class="col-md-4 col-sm-12”>B</div>
</div>
<div class="row">
  <div class="col-6">C</div>
  <div class="col-6">D</div>
  <div class="col-12">E</div>
</div>
```

C.
```html
<div class="row">
  <div class="col-8">A</div>
  <div class="col-4">B</div>
  <div class="col-sm-6">C</div>
  <div class=“col-sm-6">D</div>
</div>
<div class="row">
  <div class="col-md-6 col-xl-4">E</div>
</div>
```

- D. A 和 B
- E. B 和 C

> ✍️ **先自己试试。**

**答案：B**（幻灯片 48 上有标注；已通过渲染仓库中的 `q2.html` 验证，该文件包含这三个选项，且使用的是直引号）。

| 选项 | sm（600px） | lg（1000px） |
|---|---|---|
| A | A、B、**C、D**、E 全都占满整行——错误：C 和 D 只有 `col-md-6`，所以在 md 以下占满整行 | A\|B、C\|D、E ✓ |
| B | A、B 占满整行；C\|D；E 占满整行 ✓ | A\|B、C\|D、E ✓ |
| C | **A\|B 并排**——错误：`col-8`/`col-4` 在所有尺寸下都生效 | A\|B、C\|D，但 **E 只有半宽**（`col-md-6` 覆盖了 lg；`col-xl-4` 要从 1200px 才开始生效） |

所以 D（A 和 B）和 E（B 和 C）也是错的。关键规则：不带尺寸的类（`col-6`）在所有尺寸下生效；带尺寸的类（`col-md-6`）从该尺寸起生效，低于该尺寸时元素占满整行。

```viz web-demo
{"title": "Slides 45–48 · q2.html: options A, B, C", "libs": ["bootstrap"], "html": "<h1>A</h1>\n    <div class=\"container\">\n        <div class=\"row\">\n            <div class=\"col-md-8 col-sm-12 cell\">A</div>\n            <div class=\"col-md-4 col-sm-12 cell\">B</div>\n            <div class=\"col-md-6 cell\">C</div>\n            <div class=\"col-md-6 cell\">D</div>\n            <div class=\"col-12 cell\">E</div>\n        </div>\n    </div>\n\n\n    <h1>B</h1>\n    <div class=\"container\">\n        <div class=\"row\">\n            <div class=\"col-md-8 col-sm-12 cell\">A</div>\n            <div class=\"col-md-4 col-sm-12 cell\">B</div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col-6 cell\">C</div>\n            <div class=\"col-6 cell\">D</div>\n            <div class=\"col-12 cell\">E</div>\n        </div>\n    </div>\n\n\n    <h1>C</h1>\n    <div class=\"container\">\n        <div class=\"row\">\n            <div class=\"col-8 cell\">A</div>\n            <div class=\"col-4 cell\">B</div>\n            <div class=\"col-sm-6 cell\">C</div>\n            <div class=\"col-sm-6 cell\">D</div>\n        </div>\n        <div class=\"row\">\n            <div class=\"col-md-6 col-xl-4 cell\">E</div>\n        </div>\n    </div>\n", "css": ".cell {\n    background-color: #0099ff;\n    color: white;\n    text-align: center;\n    border-style: solid;\n    border-color: white;\n    border-width: 1px;\n    padding: 5px;\n}\n", "width": 600, "height": 560, "steps": [{"note": "lg (1000px): A, B and C all show A|B, C|D, but C's E is only half width; at sm (600px) only B matched the phone picture.", "width": 1000}]}
```

> ⚠️ **易错点**：幻灯片版本里含有弯引号（`col-sm-12”`、`“col-sm-6`）——照抄的话会破坏标记（元素丢失类，或者类的值一直延伸到下一个标签里）。仓库中的 `q2.html` 已经修正了它们。

> 🧪 **演示文件**：[q2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/q2.html) · [q2.css](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L1_Oct6_Bootstrap/q2.css)

回到[第 10 节](#10-bootstrap-网格系统)。

---

## 17. 速查与必记的 5 个要点

**响应式与自适应**

| | 响应式 | 自适应 |
|---|---|---|
| 代码 | 一套 HTML/CSS | 多套，按设备类型区分 |
| 改变布局的依据 | 屏幕尺寸 | 设备类型和屏幕尺寸 |
| 性能 | 较差（整个样式表） | 较好（量身定制） |
| 开发 | 更容易，面向未来 | 更难（多套代码库） |

**媒体查询**

| 组成 | 示例 |
|---|---|
| 媒体类型 | `screen`、`print`、`speech`、`all` |
| 媒体特性 | `min-width`、`max-width`、`orientation`、`-webkit-min-device-pixel-ratio` |
| 区间 | `@media screen and (min-width: 640px) and (max-width: 1024px) { … }` |
| 用在 link 上 | `<link rel="stylesheet" media="…" href="iPhone8.css">` |

**Bootstrap**

| 需求 | 代码 |
|---|---|
| 视口 | `<meta name="viewport" content="width=device-width,initial-scale=1">` |
| 容器 / 行 | `class="container"`、`class="row"` |
| 所有尺寸下的列 | `col-6`，或用 `col` 均分 |
| 从某个尺寸起生效的列 | `col-sm-*` ≥576、`col-md-*` ≥768、`col-lg-*` ≥992、`col-xl-*` ≥1200 |
| 处处隐藏 / 从 md 起隐藏 / md 以下隐藏 | `d-none` / `d-md-none` / `d-none d-md-block` |

**JavaScript 速记**：Mocha → LiveScript → JavaScript（Netscape，1995）；标准 = ECMAScript（ECMA，1997；自 2015 年起变化不大）；引擎：SpiderMonkey、V8、JavaScriptCore、Chakra；polyfill = shim = fallback。

**必记的 5 个要点**

1. 自适应性能更好；响应式更容易开发和维护。
2. 每个媒体特性都需要自己的括号：`(min-width: 640px) and (max-width: 1024px)`。
3. Bootstrap 的网格是 12 列；一行里超过 12 列就会换行，单独的 `col` 会平分剩下的空间。
4. 带尺寸的类从该断点**往上**生效；低于它时该列占满整行，而不带尺寸的 `col-*` 在所有尺寸下都生效。
5. JavaScript 是解释型、基于原型的，并且在所有浏览器中运行；它与编译型、基于类的 Java 毫无关系。
