# Kazuha @ UCI — Site Architecture

**Root:** `/home/kazuhak/public_html/`  
**Public URL:** `https://ics.uci.edu/~kazuhak/`  
**Base theme:** HTML5 UP "Forty"（已大量定制）  
**版本控制：** Git，`public_html/` 即仓库根目录

---

## 整体结构

```
public_html/
├── index.html / about.html / tools.html   # 顶层页面
├── notes/                                 # 笔记系统（见下）
├── tools/md-viewer/                       # Markdown 阅读器
├── tools/speedtest/                       # 第三方测速工具，勿动
├── remote_profiles/                       # Clash 订阅配置
├── resources/                             # 公开文件分发（目录可浏览）
├── assets/css/main.css                    # 全局样式，直接编辑
├── assets/js/main.js                      # 全局行为
└── assets/js/*.min.js                     # 第三方库，勿动
```

`assets/sass/` 是主题原始 SASS 源文件，**未接入构建流程**，`main.css` 直接手动维护。  
`templates/` 是 HTML5 UP 原始模板，仅供参考，不对外提供访问。

---

## 页面类型与 Header 行为

所有页面共用同一套 header（透明融入 ↔ 实心显示），但实现方式分两类：

### 类型 A：有 `#banner` 的页面
顶层目录页、notes 目录页等带大图 banner 的页面。

- `main.js` 通过 `scrollex` 插件自动监听 banner 位置
- 在 banner 内 → header `alt`（透明），滑出 banner → header `reveal`（实心）
- 滑回 banner 区域后，等 `scrollY === 0` 才重置回 `alt`
- **不需要页面内额外写任何 JS**

### 类型 B：无 banner 的自定义页面
课程目录页、about、md-viewer 等。

- `<header id="header">` 必须带 `class="alt"`（初始透明状态）
- 页面末尾**必须内嵌**滚动监听脚本：
  ```js
  (function() {
    const header = document.getElementById("header");
    let isRevealed = false;
    window.addEventListener("scroll", function() {
      const y = window.scrollY;
      if (!isRevealed && y > 80) {
        isRevealed = true;
        header.classList.remove("alt");
        header.classList.add("reveal");
      } else if (isRevealed && y <= 0) {
        isRevealed = false;
        header.classList.remove("reveal");
        header.classList.add("alt");
      }
    }, { passive: true });
  })();
  ```
- **新增此类页面时，以上两点缺一不可**

---

## 笔记系统

### 结构

每门课对应：
- `notes/course_notes/<COURSE>/index.html` — 课程笔记目录页（类型 B）
- 同目录下的 `.md` 文件 — 实际笔记内容

笔记通过 `tools/md-viewer/index.html` 渲染，用 URL 参数传递目标文件和语言。

### 语言系统

全站使用 BCP 47 语言标签：`en-US` / `zh-CN`（不用 `en`、`zh`、`cn` 等缩写）。

**文件命名规范：**
```
{课程代码}_{周次}_Notes_{语言}.md
示例：ICS45C_Week1_Notes_zh-CN.md
```

### 课程目录页的数据结构

每个课程 `index.html` 内嵌一个 `notesCatalog` 数组，结构：
```js
{
  week: "Week 1",
  title:   { "en-US": "...", "zh-CN": "..." },
  summary: { "en-US": "...", "zh-CN": "..." },
  availability: {
    "en-US": "文件名.md",   // null 表示暂无
    "zh-CN": "文件名.md"
  }
}
```

### md-viewer 的课程识别

`tools/md-viewer/index.html` 内有 `courseProfiles` 对象，用于匹配课程名称和页面描述。**新增课程时必须同时在此添加一条**，否则阅读器页面显示不出课程名和描述：
```js
"COURSE_CODE": {
  "en-US": { name: "显示名", description: "课程描述" },
  "zh-CN": { name: "显示名", description: "课程描述（中文）" }
}
```

---

## 访问控制

根目录 `.htaccess` 规则：
- `notes/course_notes/<name>/` 的 URL 无需带 `index.html`（RewriteRule 自动补全）
- `SITE_DOCS.md`、`README.*` 等文档文件返回 403

`remote_profiles/`：禁止目录列表，目录路径返回 404，文件 URL 正常访问。  
`remote_profiles/Clash/`：为 YAML 文件设置 Clash 订阅所需的 Content-Type 和 Header。  
`resources/`：开启 Fancy 目录列表，公开可浏览。

---

## 新增课程流程

1. `notes/course_notes/` 下建新文件夹
2. 复制现有课程的 `index.html`，修改 `<title>`、`pageCopy`、`notesCatalog`
3. 在 `tools/md-viewer/index.html` 的 `courseProfiles` 中新增对应条目
4. 笔记 `.md` 文件放入新文件夹，命名遵循规范
5. 所有新文件执行 `chmod 644`（新建文件默认权限可能是 600，Apache 读不到会报 403）

---

## 注意事项

- `assets/js/*.min.js` 和 `tools/speedtest/` 是第三方文件，不要修改
- SASS 源文件（`assets/sass/`）与实际 `main.css` 已不同步，以 `main.css` 为准
- 页面级样式写在各页面 `<head>` 内的 `<style>` 块，不要改全局 `main.css` 来处理单页问题
- 移动端适配用 `@media (max-width: 736px)`（主题 small 断点）
