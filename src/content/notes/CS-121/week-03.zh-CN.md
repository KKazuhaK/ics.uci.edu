---
title: "网络爬虫"
summary: "基本爬取循环、robots.txt 与 sitemap、礼貌性、爬虫陷阱、重复内容、新鲜度、分布式与聚焦爬取，以及伦理、隐私与版权。"
---

# CS 121: Information Retrieval — Week 3：网络爬虫

## 目录

- [1. 基本爬取算法](#1-基本爬取算法)
- [2. 爬取许可：robots.txt](#2-爬取许可robotstxt)
- [3. Sitemaps：提供给爬虫的信息](#3-sitemaps提供给爬虫的信息)
- [4. 为什么基本算法不够用](#4-为什么基本算法不够用)
- [5. 礼貌性与性能](#5-礼貌性与性能)
- [6. 爬虫陷阱](#6-爬虫陷阱)
- [7. 重复内容、数据噪声、客户端脚本与深网](#7-重复内容数据噪声客户端脚本与深网)
- [8. 何时重新爬取：新鲜度与年龄](#8-何时重新爬取新鲜度与年龄)
- [9. 分布式爬取](#9-分布式爬取)
- [10. 其他类型的爬取：聚焦爬取、桌面爬取、文档订阅源](#10-其他类型的爬取聚焦爬取桌面爬取文档订阅源)
- [11. 伦理与法律](#11-伦理与法律)
- [12. 隐私：你的爬虫留下了什么](#12-隐私你的爬虫留下了什么)
- [13. 版权、合理使用与法律案例](#13-版权合理使用与法律案例)
- [14. 课堂笔记与作业提示](#14-课堂笔记与作业提示)
- [15. 示例题（附解答）](#15-示例题附解答)
- [16. 速查与必记的 5 个要点](#16-速查与必记的-5-个要点)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Oct 14
> 整理自 Lecture 6.5（课堂）、7、8 和 9 的幻灯片（YuJa 视频，包括 tmux 加分视频，未收录）。按概念组织，而不是按讲次组织。
> 幻灯片致谢 Profs. C. Lopes、A. Krone-Martins、C. Manning、P. Nayak、H. Schütze 等教授，以及 Addison Wesley（2008）提供的爬虫图示。
> 📖 本周阅读：[Croft et al., *Search Engines: IR in Practice*，第 3 章 Crawls and Feeds](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

> 📅 **课程安排**：**Quiz 1 定于下周三（10月21日）课堂进行**：通过 Canvas 在线完成，使用你自己的笔记本电脑，在教室中进行。考试范围涵盖到测验日期为止的内容，允许开卷并可查看幻灯片；同一账号从超过两个 IP 访问 Canvas 会受到限制（L6.5 p9–10）。
> **Assignment 2（爬虫）已开放**：缓存服务器已上线，分组人数为 1–4 名学生（L6.5 p3–8）。
> A2 **测试期**至 10月23日晚上 9:00 结束——你必须在测试期间开发你的爬虫。服务器在 10月17–18日周末保持运行，但如果它崩溃，不保证会恢复。
> A2 **部署期**从 10月26日上午 8:00 开始，至 **10月30日晚上 9 点**结束（Canvas 截止日期；最后一张幻灯片 p8 写的是“Nov 30th”，这是笔误，前面的幻灯片写的是 10月30日）。部署期间爬取，最多 3 次。测试期间服务器可能停机约 8 小时，部署期间约 4 小时（除非它在夜间崩溃）。
> 你**和你所有的小组成员**都必须参加 A2 口试。
> A1 加分：录制一段简短视频，解释你的代码和思路，并上传到 Canvas（链接下周公布，L6.5 p2）。

---

## 1. 基本爬取算法

第 2 周介绍了爬虫：一个像人一样点击浏览的程序，获取 HTML 页面并跟随其中的链接（[第2周 §14](week-02.zh-CN.md#14-迈向网页爬取什么是算法)）。在架构图中，爬取属于 **文本获取（Text Acquisition）** 模块（[第1周 §10](week-01.zh-CN.md#10-搜索引擎架构)；L7 p3、p25 · L6.5 p12）。本周涵盖完整的算法，以及它可能出现的各种问题。

基本爬取算法（L7 p4–9，每张幻灯片逐条展示）：

1. 初始化一个 URL 队列，即**种子（seeds）**。
2. 重复以下步骤，直到队列中没有更多 URL：
   - 从队列中取出一个 URL；
   - 如果该页面允许爬取，则获取对应的页面；
   - 存储该页面的表示形式；
   - 从页面中提取 URL 并加入队列。

该队列称为**待爬队列（frontier）**。L7 p10–12 画出三个区域：**已爬取的网页**、**URL 待爬队列**、**网络的其余部分**。网络蜘蛛从种子页面出发：每次获取都会把一个页面移入“已爬取”，而它的链接则把“网络的其余部分”中的新页面拉入待爬队列。

Croft 版本的伪代码（L7 p13–15、p26 · L6.5 p13、p15 · L9 p3、p23）：

```text
procedure CrawlerThread(frontier)
    while not frontier.done() do
        website ← frontier.nextSite()
        url ← website.nextURL()
        if website.permitsCrawl(url) then
            text ← retrieveURL(url)
            storeDocument(url, text)
            for each url in parse(text) do
                frontier.addURL(url)
            end for
        end if
        frontier.releaseSite(website)
    end while
end procedure
```

两项主要工作：**在获得授权的前提下下载网页，并发现新的 URL**（L9 p3）。L7 p14–15 重点标出了 `website.permitsCrawl(url)`，即*你怎么知道网站是否允许爬取？*（[第 2 节](#2-爬取许可robotstxt)）。待爬队列先给出一个*站点*，然后再从中取出一个 URL；**礼貌性（politeness）**就在这里体现（[第 5 节](#5-礼貌性与性能)）。

“爬虫眼中的网络”（L9 p4，改编自 Addison Wesley）展示了四个主机，每个主机有三个页面（`www.cs.umass.edu`、`www.bbc.co.uk`、`www.whitehouse.gov`、`www.cnn.com`），页面之间有站内和跨站的链接；还有一台机器 `crawler.searchengine.com` 与这四个主机通信。箭头标示 `nextSite()` 和 `nextURL()`。下面的演示会爬取这张图（幻灯片没有给出种子，我选用了 umass 和 cnn 的首页）。可以逐步查看，也可以编辑图结构后点击运行：

```viz crawl-frontier
{"title": "基本爬取（L7 p4–15），作用于“爬虫眼中的网络”（L9 p4）", "web": "www.cs.umass.edu/index.html -> www.cs.umass.edu/courses, www.cs.umass.edu/news; www.cs.umass.edu/news -> www.bbc.co.uk/index.html, www.cnn.com/2006/09/story.html; www.bbc.co.uk/index.html -> www.bbc.co.uk/today, www.bbc.co.uk/2005/story.html; www.bbc.co.uk/2005/story.html -> www.whitehouse.gov/index.html; www.whitehouse.gov/index.html -> www.whitehouse.gov/news.html, www.whitehouse.gov/about.html; www.cnn.com/index.html -> www.cnn.com/2006/09/story.html, www.cnn.com/2003/04/story.html", "seeds": "www.cs.umass.edu/index.html, www.cnn.com/index.html", "interactive": true}
```

全部 12 个页面以 FIFO（广度优先）的顺序，在 12 次获取中被爬取。`www.cnn.com/2006/09/story.html` 被链接了两次，但只入队一次：待爬队列会记住它见过哪些 URL。

> ⚠️ **易错点**：“重复直到队列中没有更多 URL”只有在待爬队列拒绝已经见过的 URL 时才会结束。如果没有已见集合，两个互相链接的页面会无限循环。这与重复*内容*的检测不同（[第 7 节](#7-重复内容数据噪声客户端脚本与深网)）。

> 🔗 **延伸阅读**：[Croft §3.2 Crawling the Web（书中第 32 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.2.2 The Web Crawler（书中第 35 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 2. 爬取许可：robots.txt

**爬取前先礼貌地询问网站是否允许你爬取**（L7 p17、p19）。**机器人排除标准（Robots Exclusion Standard）**，又称 `robots.txt`，是网站可以放在根目录下的一个文件（`http://www.cnn.com/robots.txt`、`http://en.wikipedia.org/robots.txt`）。它的语法非常简单，但目前“没有正式/官方标准”。它基于**君子协定（honor basis）**运作，**它不是安全机制**：忽略它的爬虫仍然能拿到页面。

五个经典示例（L7 p18 · L6.5 p16–20，来自 robotstxt.org）：

| 目标 | robots.txt |
|---|---|
| 禁止所有机器人访问整个服务器 | `User-agent: *` / `Disallow: /` |
| 允许所有机器人完全访问 | `User-agent: *` / `Disallow:`（留空） |
| 禁止所有机器人访问站点的一部分 | `User-agent: *` / `Disallow: /cgi-bin/` / `Disallow: /tmp/` / `Disallow: /junk/` |
| 禁止单个机器人 | `User-agent: BadBot` / `Disallow: /` |
| 允许单个机器人 | `User-agent: Google` / `Disallow:` — 空行 — `User-agent: *` / `Disallow: /` |

（` / ` 用于分隔文件中的各行。）`Disallow:` 后面什么都不写，表示不禁止任何内容，即“全部允许”。`Disallow: /` 禁止一切，因为每个路径都以 `/` 开头。

> 🗣️ **课堂上**：“有一条优先级规则：如果存在专门针对某个机器人的段落，那么对该机器人适用的规则**只有**该段落中的规则！”（L6.5 p21）在“允许单个机器人”的例子中，Google 只读取它自己的分组（`Disallow:` 即全部允许），而永远看不到 `*` 分组中的 `Disallow: /`。

**禁止文件夹中的允许规则**（L7 p24）：你可以禁止某个文件夹，同时允许其中的一个资源，例如一个列出你*希望*被索引的链接的页面。CNN 的文件（L7 p21、p24）包含六行 `Sitemap:`、`User-agent: *`、若干 `Allow` 行，以及约 35 行 `Disallow`（`/*.jsx$`、`/ads/`、`/aol/`、`/audio/`、… `/partners/`、… `/search/`、… `/webview/`）。p24 幻灯片用方框标出了两组配对：`Allow: /audio/podcasts/` 与 `Disallow: /audio/`，以及 `Allow: /partners/ipad/live-video.json` 与 `Disallow: /partners/`（p21 的截图中只有第二个 `Allow`）。

幻灯片没有解释为什么 `Allow` 会胜出。今天的规则（RFC 9309、Google 以及较新的 Python）是**最长匹配**：最长的匹配路径获胜，平局时 `Allow` 获胜。下面的演示把这一规则应用于 CNN 文件的节选版本：

```viz robots-txt
{"title": "CNN 的 robots.txt 节选（L7 p21, p24）", "robots": "User-agent: *\nAllow: /audio/podcasts/\nAllow: /partners/ipad/live-video.json\nDisallow: /*.jsx$\nDisallow: /ads/\nDisallow: /audio/\nDisallow: /partners/\nDisallow: /search/", "urls": "/audio/podcasts/ep1.mp3, /audio/live.html, /partners/ipad/live-video.json, /partners/ipad/x.json, /2026/10/14/world/index.html, /video/player.jsx", "interactive": true}
```

允许访问：播客、`live-video.json` 和文章（没有规则匹配）。禁止访问：`/audio/live.html`、`/partners/ipad/x.json`，以及 `/video/player.jsx`（通配符规则 `/*.jsx$`）。用 Python 实现如下：

```python
from urllib.robotparser import RobotFileParser

rules = """User-agent: *
Allow: /audio/podcasts/
Allow: /partners/ipad/live-video.json
Disallow: /*.jsx$
Disallow: /audio/
Disallow: /partners/
"""
rp = RobotFileParser()
rp.parse(rules.splitlines())   # or set_url(...) + read()
for path in ["/audio/podcasts/ep1.mp3", "/audio/live.html",
             "/partners/ipad/live-video.json",
             "/video/player.jsx"]:
    url = "https://www.cnn.com" + path
    print(path, rp.can_fetch("MyCrawler", url))
```

```text
Python 3.13.17                       Python 3.11.17 / 3.12.3
/audio/podcasts/ep1.mp3 True         True
/audio/live.html False               False
/partners/ipad/live-video.json True  True
/video/player.jsx False              True
```

> ⚠️ **易错点**：较旧版本 Python 的 robotparser（已测试 3.11.17 和 3.12.3；openlab 上的 3.10 更旧）会采用文件中**第一条匹配的行**，并且把 `*` 和 `$` 当作字面字符。CNN 把 `Allow` 行放在最前面，因此只有 `/*.jsx$` 会出错。但如果把 `Disallow: /audio/` 放在 `Allow: /audio/podcasts/` 之上，旧解析器就会阻止播客。在演示中设置 `"match": "first"` 即可看到这一点。

> 📝 **练习**：[例题 15.3](#153-哪条-robotstxt-规则适用l7-p18--l65-p1621) · [例题 15.4](#154-允许规则位于被禁止的文件夹内l7-p24)

> 🔗 **延伸阅读**：[cnn.com/robots.txt](http://www.cnn.com/robots.txt) · [en.wikipedia.org/robots.txt](http://en.wikipedia.org/robots.txt) · [robotstxt.org: About /robots.txt](http://www.robotstxt.org/robotstxt.html) · [Croft §3.2.2 The Web Crawler（书中第 35 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 3. Sitemaps：提供给爬虫的信息

robots.txt 告诉爬虫**不要**去哪里。**Sitemaps**（由 Google 推出）让网站管理员向爬虫提供**正面**信息（L7 p20 · L9 p11）：

- 它们包含 **URL 列表**以及关于这些 URL 的数据，例如**修改时间**和**修改频率**。
- 它们**列在 robots.txt 中**（CNN 的前六行，以 `Sitemap: https://www.cnn.com/sitemaps/cnn/index.xml` 开头）。
- 它们由服务器管理员生成，通常通过脚本完成。
- 它们可以告诉爬虫那些**可能找不到的页面**，即没有被任何页面链接的页面。
- 它们给出页面的**相对重要性**，以及**何时检查页面是否有变化**的提示（更新频率）。

CNN 的 `index.xml`（L7 p22 · L6.5 p23）是一个 **sitemap 索引**：一个 `<sitemapindex>`，列出更多的 sitemap（`video-2020-01.xml`、`article-2020-01.xml`、…），每个都带有 `<lastmod>`。其中每一个（L7 p23 · L6.5 p24 · L9 p12）都是一个 `<urlset>`，每个页面对应一个 `<url>`：

```xml
<url>
  <loc>https://www.cnn.com/2012/01/25/world/gallery/wus-us-mia/index.html</loc>
  <lastmod>2012-01-25T18:24:37Z</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.5</priority>
  <image:image>
    <image:loc>https://i2.cdn.turner.com/cnnnext/dam/assets/120111071718-jpac1-plane-story-top.jpg</image:loc>
    <image:caption>Gunnery Sgt. Bryon Bebout with the wreckage of a B-24 …</image:caption>
  </image:image>
</url>
```

`<loc>` = URL，`<lastmod>` = 修改时间，`<changefreq>` = 修改频率，`<priority>` = 相对重要性。箭头（L7 p23、L9 p12）标示的是 `<lastmod>` 和 `<changefreq>`，爬虫用它们来决定*何时*再次访问（[第 8 节](#8-何时重新爬取新鲜度与年龄)）。

> 🔗 **延伸阅读**：[CNN sitemap 索引](https://www.cnn.com/sitemaps/cnn/index.xml) · [Croft §3.2.6 Sitemaps（书中第 43 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 4. 为什么基本算法不够用

基本算法在**理论上是正确的**，但在实践中**严重不足**（L7 p27–34，每帧一项）。它：

| # | 问题 | 参见 |
|---|---|---|
| 1 | 会惹恼网站管理员（不礼貌），它在滥用 Web 服务器 | [§5](#5-礼貌性与性能) |
| 2 | 非常慢，一次只处理一个页面 | [§5](#5-礼貌性与性能) |
| 3 | 会陷入陷阱和无限序列 | [§6](#6-爬虫陷阱) |
| 4 | 会在不知情的情况下获取重复内容 | [§7](#7-重复内容数据噪声客户端脚本与深网) |
| 5 | 会引入数据噪声 | [§7](#7-重复内容数据噪声客户端脚本与深网) |
| 6 | 会因客户端脚本而遗漏内容 | [§7](#7-重复内容数据噪声客户端脚本与深网) |

L6.5 的议程指出，重复内容和噪声的问题会在课程后面以“更多数学”的方式讲解。

---

## 5. 礼貌性与性能

### 5.1 礼貌性

**避免过于频繁地访问任何网站：网站是为人服务的，而不是为机器人服务的**（L7 p35）。如果忽视礼貌性，你的爬虫就是一次**拒绝服务（DoS）攻击**。要保持礼貌：**对同一服务器的请求之间使用人为延迟**。

### 5.2 性能：爬虫大部分时间在等待

获取一个页面需要经过多次网络往返（L9 p5）：

1. 爬虫（一个客户端程序）连接到 **域名系统（DNS）** 服务器。
2. DNS 将主机名转换为 **IP 地址**。
3. 爬虫连接到服务器主机的特定 **端口**。
4. 它发送一个 **HTTP 请求** 来获取该页面，通常是 `GET`。

粗略估算（L7 p36）：每次获取 500 毫秒，**一次一个地抓取 100万个页面需要 500,000 秒，约 5.8 天**，而且由于服务器无响应，实际情况“比这更糟”。大部分时间里线程都在**等待网络数据**。→ [例题 15.1](#151-爬取100万个网页的时间l7-p36)

L9 p6–9 逐条列出了这一权衡：

| | |
|---|---|
| 问题 | Web 爬虫花费大量时间**等待**请求的响应 |
| 解决方案 | 使用**线程**，一次获取数百个页面（或分布式地进行爬取，L7 p36） |
| 缺点 | 爬虫可能会向网站**泛滥请求** |
| 缓解措施 | **礼貌策略**：例如把请求分散到不同服务器，对同一 Web 服务器的请求之间设置延迟，……|

使用线程时，礼貌性更难控制，但仍然可以实现，例如让不同线程访问不同的服务器（L7 p36）。

**在哪里执行礼貌策略？**（L9 p10）“可以放在这里”：`website ← frontier.nextSite()`；“也可以放在这里”：`url ← website.nextURL()`。在演示中，每个主机在一次获取后必须休息 2 个 tick（时间刻）；`nextSite()` 会跳过正在休息的主机，当所有主机都在休息时，线程会等待：

```viz crawl-frontier
{"title": "礼貌性：每个主机休息 2 个 tick（L7 p35 · L9 p6–10）", "web": "www.cs.umass.edu/index.html -> www.cs.umass.edu/courses, www.cs.umass.edu/news; www.cs.umass.edu/news -> www.bbc.co.uk/index.html, www.cnn.com/2006/09/story.html; www.bbc.co.uk/index.html -> www.bbc.co.uk/today, www.bbc.co.uk/2005/story.html; www.bbc.co.uk/2005/story.html -> www.whitehouse.gov/index.html; www.whitehouse.gov/index.html -> www.whitehouse.gov/news.html, www.whitehouse.gov/about.html; www.cnn.com/index.html -> www.cnn.com/2006/09/story.html, www.cnn.com/2003/04/story.html", "seeds": "www.cs.umass.edu/index.html, www.cnn.com/index.html", "politeness": 2, "start": 8}
```

同样的 12 个页面现在需要 22 个 tick，而不是 12 个，其中 10 个用于等待。在单线程下，礼貌性会耗费时间，这也是爬虫会用许多线程访问许多主机的原因。

### 5.3 DNS 查询

在任何获取之前，爬虫必须把域名转换为 IP 地址（L7 p37）：`www.ics.uci.edu` → `128.195.1.83`。DNS 是一组分布式服务器：**延迟可能很高（2 秒并不罕见）**，常见实现是**阻塞式**的（一次只处理一个请求），而且结果会被**缓存**。若每次查询需要 800 毫秒，查询整个 Web 需要多长时间？幻灯片没有给出主机数量；按每百万个域名计算，约为 **9.3 天**（每次 2 秒则约 23 天）。→ [例题 15.2](#152-dns-查询耗时800毫秒l7-p37)

> 💡 **关键洞见**：爬虫是 **I/O 密集型（I/O-bound）** 的，在 Go 中使用 goroutine，在 Python 中使用线程或异步 I/O。按主机缓存 DNS 是最便宜的加速方法。

> 🔗 **延伸阅读**：[Croft §3.2.1 Retrieving Web Pages（书中第 33 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.2.2 The Web Crawler（书中第 35 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 6. 爬虫陷阱

**爬虫陷阱（crawler trap）**可能会把爬虫永远困在一个站点上：Web 服务器返回不断变化的 URL 和内容，通常来自动态页面（L7 p38）。陷阱可以是：

- **无意的**：例如**ICS 日历就是一个爬虫陷阱**。每个月份页面都链接到下一个月份，永无止境。
- **有意的**：一些网站管理员设置陷阱来惩罚不礼貌的爬虫（fleiner.com/bots），例如非常大的文档，它们*在 robots.txt 中被禁止*，目的是消耗资源，或破坏忽略 robots.txt 的爬虫中设计不良的解析器。

演示中的日历总是链接到一个从未见过的 URL（`?n=1`、`?n=2`、…），因此已见集合永远不起作用，只有 10 次获取的预算能让它停下来：

```viz crawl-frontier
{"title": "爬虫陷阱：ICS 日历（L7 p38）", "web": "www.ics.uci.edu/ -> www.ics.uci.edu/calendar, www.ics.uci.edu/about; www.ics.uci.edu/about -> www.ics.uci.edu/", "seeds": "www.ics.uci.edu/", "trap": "www.ics.uci.edu/calendar", "maxFetches": 10}
```

该站点只有 3 个真实页面，但 10 次获取中有 8 次都指向了日历，而待爬队列仍然没有清空。

> ⚠️ **易错点**：有意设置的陷阱针对的是**忽略 robots.txt** 的爬虫。遵守 robots.txt 是第一道防线；限制每个主机的页面数量或 URL 深度，以及发现几乎相同的页面，可以捕获无意的陷阱。

> 🔗 **延伸阅读**：[fleiner.com/bots — 让恶意机器人远离](http://www.fleiner.com/bots/)

---

## 7. 重复内容、数据噪声、客户端脚本与深网

**重复内容**（L7 p39）。完全重复和近似重复都非常普遍：副本、镜像站点、版本、垃圾信息、抄袭。研究发现 **30% 的网页是其他 70% 的[近似]重复**。它们几乎没有价值：对搜索引擎和用户来说都是噪声，用户应该只看到一份副本（也许附带一个“显示相似内容”的链接）。

| | 完全重复 | 近似重复 |
|---|---|---|
| 检测方法 | 简单：**哈希（hash）、校验和** | 较难：**页面指纹（fingerprint）** |
| 常见程度 | 少见 | 常见 |

**数据噪声**（L7 p40–41 · L6.5 p26）。页面包含与页面内容无关的部分，例如**广告、模板**，而噪声会损害检索效果。截图中用方框标出了顶部横幅广告以及左右两栏。**查找内容块**的技术 1 是**标签的累积分布**（*文档斜率曲线*，Finn、Kushmerick 与 Smyth，2001）。图中 x 轴为**词元（token）数量**（0–3,500），y 轴为**标签数量**（0–900）。曲线在标签密集处上升，在“**文本区域**”（约 1,000–1,500 个词元）几乎变平，那里就是正文内容。文献中还存在其他技术。

**客户端脚本**（L7 p42–43）。现代网站大量使用脚本（JavaScript、TypeScript），内容隐藏在 `XMLHttpRequest` 之后。要获取这些内容，必须与脚本交互，即**用户交互模拟**（例如 Selenium），这很困难。大多数爬虫不会这样做，因此这些内容从未被索引。

**深网（deep web）**（L7 p44）是爬虫很少涉足的地方：隐藏在**登录表单**后的内容、隐藏在 **JavaScript/TypeScript** 后的内容，以及**没有被任何地方链接**的站点（站点地图有助于处理这些内容，[第 3 节](#3-sitemaps提供给爬虫的信息)）。据估计，它的规模是**浅网的 400–500 倍**。

> 🔗 **延伸阅读**：[深网估计（doi:10.3998/3336451.0007.104）](http://dx.doi.org/10.3998/3336451.0007.104) · [Croft §3.2.5 Deep Web（书中第 41 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.7 Detecting Duplicates（书中第 60 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.8 Removing Noise（书中第 63 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 8. 何时重新爬取：新鲜度与年龄

### 8.1 新鲜度

页面会不断被**添加、删除和修改**（L9 p13）。**过时的**副本不再反映真实的页面，因此爬虫必须反复**重新访问**，以维持**新鲜度（freshness）**。HTTP 的 **`HEAD`** 请求返回的是页面的*相关信息*，而不是页面本身（L9 p14–15）：

```text
Client request:  HEAD /csinfo/people.html HTTP/1.1
                 Host: www.cs.umass.edu

Server response: HTTP/1.1 200 OK
                 Date: Thu, 03 Apr 2008 05:17:54 GMT
                 Server: Apache/2.0.52 (CentOS)
                 Last-Modified: Fri, 04 Jan 2008 15:28:39 GMT
                 ETag: "239c33-2576-2a2837c0"
                 Accept-Ranges: bytes
                 Content-Length: 9590
                 Connection: close
                 Content-Type: text/html; charset=ISO-8859-1
```

箭头指向 **`Last-Modified`**：将它与你存储副本的日期进行比较。你可以自己试一试（L9 p15）：

```bash
curl --head https://www.ics.uci.edu/~algol/index.html
```

你无法持续检查每个页面，应该检查**重要的**和**经常变化的**页面（L9 p16）。**新鲜度**是集合中新鲜页面所占的比例，而优化它是**危险的**：一个总是在更新的站点，在你的副本中几乎永远不是新鲜的，因此一个以新鲜度最大化为目标的引擎会*停止爬取它*。另一个指标是**年龄**。

### 8.2 新鲜度与年龄

图（L9 p17 · L6.5 p31–32）在同一时间轴上展示：爬取、更新、爬取、更新、爬取。

| 事件 | 新鲜度 | 年龄 |
|---|---|---|
| 爬取 | 1（副本与页面一致） | 0 |
| 爬取之后页面更新 | 降为 0 | 从 0 开始线性增长 |
| 下次爬取前又发生更新 | 保持为 0 | 继续增长（从*第一次错过的*变化开始计时） |
| 下一次爬取 | 恢复为 1 | 恢复为 0 |

新鲜度是非真即假的阶跃；年龄衡量副本**过时了多久**。

### 8.3 期望年龄

页面在上次爬取后 $t$ 天的期望年龄（L9 p18–20）：

$$\text{Age}(\lambda, t) = \int_0^t P(\text{page changed at time } x)\,(t - x)\,dx$$

$P(\text{page changed at time } x)$ 是页面在时刻 $x$ 发生变化的概率；$(t - x)$ 是该变化与现在之间的时间，即副本已经过时了多久（L9 p19）。平均而言，更新服从**泊松过程（Poisson process）**（Cho & Garcia-Molina，2003），因此到下一次更新的时间服从**指数分布（exponential）**，其均值为变化频率 $\lambda$（每天的变化次数）：

$$\text{Age}(\lambda, t) = \int_0^t \lambda e^{-\lambda x}\,(t - x)\,dx = t - \frac{1 - e^{-\lambda t}}{\lambda}$$

（闭式解是我推导的，已做数值检验。）L9 p21 对 $\lambda = 1/7$（每周一次变化）、$t$ 从 0 到约 7 天的情况作图：曲线**向上弯曲**，$t = 2$ 时为 0.26，$t = 4$ 时为 0.95，$t = 6$ 时为 1.97，$t = 7$ 时为 $7/e \approx 2.58$。

> 💡 **关键洞见**：“页面越老，不去爬取它的代价就越大”（L9 p21）。期望年龄的增长*快于*线性，因此每多等一天的代价都比前一天更大，对 $\lambda$ 较大的页面来说更是如此。

> 📝 **练习**：[例题 15.6](#156-每周变化一次时的期望年龄l9-p1821)

> 🔗 **延伸阅读**：[Croft §3.2.3 Freshness（书中第 37 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 9. 分布式爬取

使用多台计算机进行爬取有三个理由（L9 p22）：

1. 它让爬虫**更接近它所爬取的站点**，从而降低网络需求。
2. 它**减少每个爬虫需要记住的站点数量**，从而降低本地内存需求。
3. 它总体上**减少了本地所需的资源**。

分布式爬虫可能会使用**哈希函数**，根据 URL 的**主机部分**把 URL 分配给计算机或线程。这样每个主机只由一个爬虫负责，从而能保持礼貌。L9 p23–24 展示了五次 `CrawlerThread`，每次都高亮了 `(frontier)`：**边界信息应当共享**（一个已见集合，一份礼貌性状态）。

> 🔗 **延伸阅读**：[Croft §3.2.7 Distributed Crawling（书中第 44 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 10. 其他类型的爬取：聚焦爬取、桌面爬取、文档订阅源

**聚焦爬取（focused crawling）**（L9 p26）只下载与**某个特定主题**相关（或围绕特定时间事件）的页面，用于垂直搜索，或为某一主题改进搜索引擎。同一主题的页面倾向于**链接到同一主题的页面**。热门页面可以作为种子（例如用户搜索某个关键词后点击最多的页面），并由**文本分类器**判断页面是否属于该主题。

**桌面爬取（desktop crawls）**（L9 p27）用于桌面和企业搜索，与 Web 爬取不同：数据更容易找到（文件系统 ≈ 站点地图）；对更新做出快速响应更重要；它们必须节省磁盘、内存和 CPU（对用户透明）；必须处理多种文档格式；数据隐私也重要得多。

**文档订阅源（document feed）**（L9 p28–29）。许多文档只是被**发布**，即创建一次，很少更新，例如新闻、博客文章、新闻稿和电子邮件。来自同一来源的已发布文档形成一个序列，即文档订阅源；爬虫在订阅源的**末尾**寻找新文档。有两种类型：

- **推送订阅源（push feed）**会提醒订阅者有新文档，例如新闻社的订阅源。推送需要订阅，例如 **WebSub**。
- **拉取订阅源（pull feed）**要求订阅者定期检查新文档。最常见的拉取格式是 **RSS**，即 Really Simple Syndication / RDF Site Summary / Rich Site Summary。

RSS 示例（L9 p30–33）：

```xml
<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Search Engine News</title>
    <link>http://www.search-engine-news.org/</link>
    <description>News about search engines.</description>
    <language>en-us</language>
    <pubDate>Tue, 19 Jun 2008 05:17:00 GMT</pubDate>
    <ttl>60</ttl>

    <item>
      <title>Upcoming SIGIR Conference</title>
      <link>http://www.sigir.org/conference</link>
      <description>The annual SIGIR conference is coming!
        Mark your calendars and check for cheap
        flights.</description>
      <pubDate>Tue, 05 Jun 2008 09:50:11 GMT</pubDate>
      <guid>http://search-engine-news.org#500</guid>
    </item>
    ...
    <item>
      <title>New Search Engine Textbook</title>
      <link>http://www.cs.umass.edu/search-book</link>
      <description>A new textbook about search engines
        will be published soon.</description>
      <pubDate>Tue, 05 Jun 2008 09:33:01 GMT</pubDate>
      <guid>http://search-engine-news.org#499</guid>
    </item>
  </channel>
</rss>
```

第一个 `<item>` 之前是**订阅源频道信息**，每个 `<item>` 是**条目信息**（L9 p31）；箭头（p32–33）标出了 `<pubDate>` 和 `<ttl>`。对爬虫来说（L9 p34）：

- `<ttl>`（存活时间）是内容应被缓存的时长，**单位为分钟**，这里是 60。
- 订阅源像网页一样通过 HTTP `GET` 访问；使用 `HEAD` 来检查订阅源是否有变化。
- 订阅源很容易解析（它就是 XML），新信息也很容易找到：`GET`、解析，然后取出任何新的 `<item>` … `</item>` 条目。

> 🔗 **延伸阅读**：[W3C WebSub](https://www.w3.org/TR/websub/) · [Croft §3.2.4 Focused Crawling（书中第 41 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.3 Crawling Documents and Email（书中第 46 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.4 Document Feeds（书中第 47 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 11. 伦理与法律

> 🗣️ **课堂上**：**“你能做，不代表你就该做。”**这是第 8 讲的主旨（L8 p3、p18），课堂上也反复强调（L6.5 p29）。

**给机器人编写者的指南**（L8 p4）：这是 robotstxt.org 上的一份文本，写于 1993 年，年代久远但仍然非常切题。

| 准则 | 含义 |
|---|---|
| **再三考虑** | 你真的需要机器人吗？ |
| **承担责任** | 如果你的行为造成问题，要能迅速采取行动加以应对 |
| **本地测试** | 在把爬虫放给别人之前，先逐步扩大范围 |
| **不要占用资源** | Web 服务器首先是为人服务的。慢慢走，不要跑 |
| **保持跟进** | “了解你的机器人在做什么，并确保它始终处于控制之下，这至关重要” |

此外，还要**了解网站的爬取政策**，并**联系网站管理员**（L8 p5）。例子是 GitHub 的第 5 条“抓取与 API 使用限制”：研究人员可以抓取公开的非个人信息，*前提是*其成果为开放获取；档案管理人员可以抓取公开数据；为发送垃圾信息或出售用户个人信息（给猎头、招聘网站）而进行的抓取是被禁止的；所有使用都必须遵守 GitHub 的隐私声明。

**伦理比法律的范围更大**（L8 p6）：*法律*只是*伦理问题*这个大圆圈中的一个小圆圈。

**Web 与法律**（L8 p7–14）。Web 只有约 30 年的历史，是一个“狂野西部（或狂野的 Web……）”，法律很少、未经检验或已经过时，因此**你自己的判断和行为至关重要**。它诞生于 CERN，最初用于物理研究：Tim Berners-Lee 1989 年的提案，旨在解决 CERN 中复杂演化系统的信息丢失问题，方案是一个分布式超文本系统。约 1993 年的第一个网站至今仍然在线（p9），p10 展示了一张 1993 年 NeXT 浏览器的截图。

**最早的 Web 搜索引擎**（L8 p11）：

| 年份 | 引擎 | 新在哪里 |
|---|---|---|
| 1993 | W3Catalogue | 原始的目录 |
| 1993 | World Wide Web Wanderer | 第一个网络爬虫，最初用于测量 Web 的规模 |
| 1993 | JumpSearch | 爬取、索引、搜索：第一个“现代”引擎 |
| 1994 | Excite 和 RankDex | 启发了 Google PageRank 的排名系统 |
| 1994 | WebCrawler | 全文索引 |

（幻灯片写的是“JumpSearch”，但它自己的截图标题为“NCSA Mosaic – **JumpStation II** Document Search Page”。）

> 🔗 **延伸阅读**：[robotstxt.org: Guidelines for robot writers](http://www.robotstxt.org/guidelines.html) · [GitHub: scraping and API usage restrictions](https://help.github.com/en/github/site-policy/github-acceptable-use-policies#5-scraping-and-api-usage-restrictions) · [Berners-Lee's 1989 proposal](https://www.w3.org/History/1989/proposal.html) · [The first website](http://info.cern.ch/hypertext/WWW/TheProject.html) · [NeXT browser screenshot, 1993](http://info.cern.ch/NextBrowser1.html)

---

## 12. 隐私：你的爬虫留下了什么

“谁能冒犯谁”（L8 p15）：**用户**与**提供者**之间相互伤害，形成一个阴阳关系，伤害可能来自**个人信息（隐私）**，也可能来自**内容（安全）**。网站可以发布**隐私声明**，说明它们收集什么以及如何使用（L8 p16）。你的爬虫也会留下记录。L8 p17 展示了 Apache 访问日志的几行：

```text
66.249.66.18 - - [25/Jan/2012:00:18:27 -0800] "GET /xwiki/bin/export/Stats/CurrentYearActivity?format=rtf HTTP/1.1" 404 335 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
180.76.6.28 - - [25/Jan/2012:00:18:31 -0800] "GET / HTTP/1.1" 200 45 "-" "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
66.249.66.18 - - [25/Jan/2012:00:19:02 -0800] "GET /calswim/coverage-s1.png HTTP/1.1" 200 961543 "-" "Googlebot-Image/1.0"
173.192.98.90 - - [25/Jan/2012:00:33:00 -0800] "GET / HTTP/1.1" 404 290 "-" "Python-urllib/2.4"
80.165.186.186 - - [25/Jan/2012:01:21:24 -0800] "GET /events-dataset-api/ HTTP/1.1" 200 3214 "http://www.kdnuggets.com/datasets/index.html" "Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1"
180.76.5.65 - - [25/Jan/2012:02:18:20 -0800] "GET / HTTP/1.1" 200 45 "-" "Mozilla/5.0 (compatible; Baiduspider/2.0; …
```

每一行都记录了客户端 **IP**、**时间**、**请求**、**状态**、**字节数**、**来源页（referrer）**和**用户代理（user agent）**。Googlebot 和 Baiduspider 通过 URL 表明自己的身份；`Python-urllib/2.4` 是一个匿名脚本；那条 Firefox 日志则是一个人从 KDnuggets 跳转过来的。管理员可以看到谁在爬取什么、多久爬取一次。→ [例题 15.5](#155-阅读-apache-日志行l8-p17)

> 💡 **关键洞见**：给你的爬虫一个诚实、可识别的 User-Agent。管理员正是通过这样的日志行来决定是联系你还是封禁你。

> 🔗 **延伸阅读**：[UCI 隐私声明](http://uci.edu/privacy.php)

---

## 13. 版权、合理使用与法律案例

**版权**（L8 p19–20）。智力成果，例如 Web 内容和源代码，受版权法保护：这是一种“以美国宪法为基础、由法律授予的保护，适用于以有形媒介固定的原创作品”，无论是否发表（copyright.gov）。那么你能使用网络上的材料吗？

**合理使用（fair use）**（L8 p21–22）。为**批评、评论、新闻、教学、学术和研究**等目的进行复制，可能被视为合理使用，但这是一个非常模糊的领域。有四个因素决定某一具体使用是否合理：

1. **使用的目的和性质**，包括是否具有商业性，或是否为非营利的教育目的。
2. 受版权保护作品的**性质**。
3. 所使用部分的**数量和实质性**，相对于作品整体而言。
4. 对作品潜在市场或价值的**影响**。

**法律案例**（L8 p23–24）。两起案件都是依据“**侵占动产（trespass to chattels）**”获胜的，即干扰他人的财产，这里指他们的计算机系统。

| 案件 | 日期 | 发生了什么 | 裁决 |
|---|---|---|---|
| eBay vs. Bidder's Edge | 2000年5月24日 | eBay 阻止了 Bidder's Edge 的爬虫 | 故意、未经授权地干扰 eBay 的计算机系统，并造成损害 |
| American Airlines vs. FareChase | 2003年3月10日 | AA 阻止 FareChase 抓取 AA.com 的“web fares”（票价比较） | 故意、未经同意；损害了 AA 的网络和财产。同年晚些时候达成和解 |

更多内容可参阅 UCI 的计算机法研究生课程（L8 p25）。

> ⚠️ **易错点**：两起案件都与**爬取**有关（对服务器的负载，以及未经授权使用服务器），而不是复制文本。遵守 robots.txt 和礼貌性规则，不仅是良好的礼仪，也是法律层面的要求。

> 🔗 **延伸阅读**：[copyright.gov](http://www.copyright.gov) · [Copyright FAQ](https://www.copyright.gov/help/faq/faq-general.html) · [Fair use (FL-102)](https://www.copyright.gov/fls/fl102.html) · [eBay v. Bidder's Edge (Justia)](https://law.justia.com/cases/federal/district-courts/FSupp2/100/1058/2478126/) · [AA v. FareChase injunction (EFF)](https://www.eff.org/document/preliminary-injunction-american-airlines-v-farechase-inc) · [UCI Computer Law course](https://www.ics.uci.edu/~kay/courses/269/)

---

## 14. 课堂笔记与作业提示

来自 L6.5 p2、p11、p35–39：

- **A1 加分**：录制一段简短视频，解释你的代码和思路，并上传到 Canvas（链接下周公布）。
- **tmux**（本周额外的 YuJa 视频）可以在你退出登录后，让较长的 A2 爬取任务继续运行：

| 操作 | 命令 |
|---|---|
| 新建一个名为“mycrawler”的会话 | `tmux new -s mycrawler` |
| 连接到之前创建的会话 | `tmux attach -t mycrawler` |
| 列出机器上的会话 | `tmux ls` |
| 将屏幕分割为多个窗格 | `Ctrl+B`，松开后按 `%`（垂直分割）或 `"`（水平分割） |
| 关闭窗格 | `Ctrl+B` + `x` |
| 在窗格之间移动 | `Ctrl+B`，松开后按方向键 |
| 分离（离开 tmux 但不关闭它） | `Ctrl+B`，松开后按 `d` |

> ⚠️ **易错点**：**如果在 openlab 上，记下你所在的机器！**tmux 会话只存在于一台机器上。重新登录 openlab 时，你可能会被分配到另一台机器，那里的 `tmux attach` 会找不到任何会话。

- **A2 爬虫中的 `_pickle.PicklingError`**（L6.5 p39）。像 `Can't pickle local object <class 'spacetime.node.get_app.<locals>.App'>`（……“when serializing spacetime.node.get_app.`<locals>`.App class/object”）这样的错误，可以通过在 `launch.py` 中显式选择 `fork` 启动方式来修复：

```python
import multiprocessing
# ... existing imports ...

if __name__ == "__main__":
    multiprocessing.set_start_method("fork")   # first line in the main guard
    parser = ArgumentParser()
    # Keep the remaining code here unchanged.
```

---

## 15. 示例题（附解答）

### 15.1 爬取100万个网页的时间（L7 p36）

获取一个页面需要 500 毫秒。一次一个地爬取 100万个页面需要多长时间？使用线程后会有什么变化？

> ✍️ **先自己试一试。**

**解答。** $10^6 \times 0.5\ \text{s} = 500{,}000\ \text{s}$ ≈ 138.9 小时 ≈ **5.8 天**，实际上更糟（服务器无响应），而且几乎全部时间都在等待网络。若使用 $k$ 个线程并行（分布在不同服务器上以保持礼貌），理想时间为 $500{,}000 / k$ 秒：10 个线程约 13.9 小时，100 个约 1.4 小时，500 个约 17 分钟。返回 [第 5.2 节](#52-性能爬虫大部分时间在等待)。

### 15.2 DNS 查询耗时800毫秒（L7 p37）

一次 DNS 查询需要 800 毫秒，常见的解析器是阻塞式的（一次只处理一个请求）。“查询整个 Web”需要多长时间？

> ✍️ **先自己试一试。**

**解答。** 没有给出主机数量，因此按每 100万个域名计算：$10^6 \times 0.8\ \text{s} = 800{,}000\ \text{s} \approx 9.3$ 天；若每次 2 秒，约为 23 天。解决办法：**缓存**（一次查询可以服务于某个主机的所有 URL），并且不要阻塞，即并发地解析。返回 [第 5.3 节](#53-dns-查询)。

### 15.3 哪条 robots.txt 规则适用？（L7 p18 · L6.5 p16–21）

对 L7 p18 表格中的每个文件，`BadBot`、`Google` 和 `MyCrawler` 是否可以获取 `/`、`/tmp/a.html` 和 `/index.html`？

> ✍️ **先自己试一试。**

**解答。** 首先选择分组（指名该机器人的分组优先于 `*`），然后匹配路径。这些结果已用 Python 的 `urllib.robotparser` 验证：

| 文件 | BadBot | Google | MyCrawler |
|---|---|---|---|
| 全部禁止（`*`：`Disallow: /`） | 无 | 无 | 无 |
| 全部允许（`*`：`Disallow:`） | 全部 | 全部 | 全部 |
| 部分禁止（`*`：`/cgi-bin/`、`/tmp/`、`/junk/`） | `/`、`/index.html`（不含 `/tmp/a.html`） | 同上 | 同上 |
| 禁止单个机器人（`BadBot`：`Disallow: /`） | 无 | 全部（无分组适用） | 全部 |
| 允许单个机器人（`Google`：`Disallow:` + `*`：`Disallow: /`） | 无 | **全部** | 无 |

最后一行正是优先级规则：Google 自己的分组允许一切，`*` 分组对它不适用。核对：

```viz robots-txt
{"title": "允许单个机器人 + 优先级规则（L7 p18 · L6.5 p21）", "robots": "User-agent: Google\nDisallow:\n\nUser-agent: *\nDisallow: /", "urls": "/index.html, /tmp/a.html", "agent": "Google"}
```

（robotparser 会把分组名作为子串匹配，因此 `Googlebot/2.1` 也会匹配 `Google` 分组；RFC 9309 要求精确匹配令牌。）返回 [第 2 节](#2-爬取许可robotstxt)。

### 15.4 允许规则位于被禁止的文件夹内（L7 p24）

CNN 的规则为 `Allow: /audio/podcasts/`、`Allow: /partners/ipad/live-video.json`、`Disallow: /audio/` 和 `Disallow: /partners/`。判断 `/audio/podcasts/ep1.mp3`、`/audio/live.html`、`/partners/ipad/live-video.json` 和 `/partners/ipad/x.json` 是否允许访问。

> ✍️ **先自己试一试。**

**解答。** 找出路径是 URL 路径前缀的每一条规则，让最长的那条获胜：

| 路径 | 匹配的规则 | 胜出者 | 结论 |
|---|---|---|---|
| `/audio/podcasts/ep1.mp3` | `Allow: /audio/podcasts/`（16）、`Disallow: /audio/`（7） | Allow | **允许** |
| `/audio/live.html` | `Disallow: /audio/` | Disallow | 禁止 |
| `/partners/ipad/live-video.json` | `Allow: …/live-video.json`（30）、`Disallow: /partners/`（10） | Allow | **允许** |
| `/partners/ipad/x.json` | `Disallow: /partners/` | Disallow | 禁止 |

被禁止的文件夹是关闭的，只有网站希望被爬取的资源例外。只有因为 CNN 把 `Allow` 行放在最前面，“先匹配者胜出”的规则才会得出相同的答案。返回 [第 2 节](#2-爬取许可robotstxt)。

### 15.5 阅读 Apache 日志行（L8 p17）

将 `80.165.186.186 - - [25/Jan/2012:01:21:24 -0800] "GET /events-dataset-api/ HTTP/1.1" 200 3214 "http://www.kdnuggets.com/datasets/index.html" "Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1"` 拆分为各个字段。它是机器人吗？

> ✍️ **先自己试一试。**

**解答。** 使用 combined log format 的正则表达式解析：

| 字段 | 值 |
|---|---|
| 客户端 IP | `80.165.186.186` |
| 身份、用户 | `-`、`-`（未知） |
| 时间 | `25/Jan/2012:01:21:24 -0800` |
| 请求 | `GET /events-dataset-api/ HTTP/1.1` |
| 状态 | `200`（OK） |
| 字节数 | `3214` |
| 来源页 | `http://www.kdnuggets.com/datasets/index.html` |
| 用户代理 | Windows NT 5.1 上的 Firefox 9.0.1 |

这是一个人，而不是机器人：使用的是浏览器用户代理，并且来自 KDnuggets 的链接（来源页）。对比 `Python-urllib/2.4` 那一行：没有来源页，只有一个库的用户代理，是一个不说明运行者是谁的脚本。返回 [第 12 节](#12-隐私你的爬虫留下了什么)。

### 15.6 每周变化一次时的期望年龄（L9 p18–21）

若 $\lambda = 1/7$（每天的变化次数），页面在爬取后 2、4、6 和 7 天的期望年龄分别是多少？

> ✍️ **先自己试一试。**

**解答。** 对 $\lambda e^{-\lambda x}(t - x)$ 从 0 积分到 $t$，得到 $\text{Age}(\lambda, t) = t - (1 - e^{-\lambda t})/\lambda$：

| $t$（天） | 1 | 2 | 4 | 6 | 7 |
|---|---|---|---|---|---|
| 期望年龄（天） | 0.07 | 0.26 | 0.95 | 1.97 | 2.58 |

这与 L9 p21 的曲线相符（右端约 2.5，向上弯曲）；在 $t = 7$ 时，年龄恰好为 $7e^{-1}$。从第 4 天到第 6 天增加了约 1 天的期望年龄，从第 0 天到第 2 天只增加了约 0.26。返回 [第 8 节](#83-期望年龄)。

---

## 16. 速查与必记的 5 个要点

| robots.txt | 含义 |
|---|---|
| `User-agent: Name` | 针对该机器人的分组；如果存在，则**只有**它的规则适用于该机器人（L6.5 p21） |
| `Disallow: /` / `Disallow:` | 禁止一切 / 不禁止任何内容 |
| `Disallow: /tmp/` | 禁止以 `/tmp/` 开头的路径 |
| `Disallow: /audio/` 下的 `Allow: /audio/podcasts/` | 在关闭的文件夹中重新开放一个资源（最长匹配获胜） |
| `Sitemap: URL` | 站点地图的位置 |

| 爬虫问题（L7 p27–34） | 幻灯片中的解决方法 |
|---|---|
| 不礼貌 | 按主机设置人为延迟；在 `nextSite()` / `nextURL()` 中执行 |
| 慢（等待网络和 DNS） | 线程 / 分布式爬取；缓存 DNS |
| 陷阱 | 遵守 robots.txt；注意不断变化的 URL（例如 ICS 日历） |
| 重复内容 | 哈希/校验和（完全重复）、指纹（近似重复） |
| 噪声 | 内容块：标签累积分布 |
| 客户端脚本 | 用户交互模拟（Selenium），大多数爬虫会跳过它 |

| 术语 | 含义 |
|---|---|
| 待爬队列 | 等待爬取的 URL 队列，从种子开始 |
| `HEAD` | 只请求头部信息的 HTTP 请求（`Last-Modified`） |
| 新鲜度 | 集合中保持最新的比例 |
| 年龄 | 副本已经过时多久；$\text{Age}(\lambda,t) = \int_0^t \lambda e^{-\lambda x}(t-x)\,dx$ |
| 分布式爬取 | 对**主机**做哈希，分配给爬虫；共享待爬队列 |
| 推送 / 拉取订阅源 | 发布者提醒你（WebSub）/ 你轮询（RSS，`<ttl>` 以分钟计） |
| 深网 | 隐藏在登录、脚本之后或未被链接；是浅网的 400–500 倍 |
| 侵占动产 | eBay v. Bidder's Edge 与 AA v. FareChase 案的诉由（trespass to chattels） |

**必记的 5 个要点**

1. 爬取循环：待爬队列 → 是否允许？ → 获取 → 存储 → 提取 → 加入**未见过的**链接；礼貌性位于 `nextSite()`/`nextURL()` 中。
2. robots.txt：针对特定机器人的分组会完全覆盖 `*`；在被 `Disallow` 的文件夹中，`Allow` 通过**最长匹配**获胜；它基于君子协定，不是安全机制。
3. 爬取是 I/O 密集型的：100万个页面 × 500 毫秒 ≈ 单线程下 5.8 天，因此要使用多个线程，并且对每个主机保持礼貌。
4. 优化**新鲜度**可能会让你放弃变化快速的站点；**年龄**随着自上次爬取以来的时间增长，且增长快于线性。
5. “你能做，不代表你就该做”：遵循机器人编写者指南，标识你的机器人，并记住两起法律案例都与爬取有关（侵占动产）。
