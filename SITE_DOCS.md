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
`templates/` 主要放页面模板与参考模板：既包含 HTML5 UP 原始示例，也包含站内自定义模板（如 `course_notes.html`）。该目录默认不作为公开导航入口使用。

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

### Markdown 代码块

`tools/md-viewer/index.html` 现在使用 `Shiki` 做 fenced code block 语法高亮，主题对齐 VS Code 的 `Dark+`。  
这是纯静态前端方案：viewer 会在浏览器端按需加载高亮器；如果代码块没有语言标签，或高亮器/语法包没加载成功，则自动回退为普通深色代码框。  

如果希望代码框带颜色，仍然应该在三反引号后标注语言，例如：

````md
```cpp
int main() {}
```

```python
print("hello")
```
````

当前站内优先使用并已验证的语言标签：
- `cpp`
- `bash`
- `python`
- `text`（纯文本，无语法高亮，仅保留代码框样式）

也可以继续添加其他标准语言标签；如果 Shiki 能识别，就会按对应语法着色。  
没有语言标签的代码块仍然可以渲染，但会按纯文本显示，不会自动着色。

### 课程目录页的数据结构

每个课程 `index.html` 内嵌一个 `notesCatalog` 数组，结构：
```js
{
  week: "Week 1",
  title:   { "en-US": "...", "zh-CN": "..." },
  summary: { "en-US": "...", "zh-CN": "..." },
  availability: {
    "en-US": { note: "文件名.md" },   // 没有版本时可省略该键
    "zh-CN": { note: "文件名.md" }
  }
}
```

### md-viewer 的课程识别

`tools/md-viewer/index.html` 内有 `courseProfiles` 对象，用于匹配课程显示名、阅读器副标题和说明文案。**新增课程时必须同时在此添加一条**，否则阅读器页面显示不出合适的课程标题和介绍：
```js
"COURSE_CODE": {
  displayName: "显示名",
  "en-US": {
    headingBase: "英文副标题",
    descriptionTemplate: "包含 {course} 和 {weekPhrase} 占位符的英文说明"
  },
  "zh-CN": {
    headingBase: "中文副标题",
    descriptionTemplate: "包含 {course} 和 {weekPhrase} 占位符的中文说明"
  }
}
```

`md-viewer` 会从笔记文件名里自动提取 `Week N`，并拼接到顶部页头标题与说明文案里。  
例如 `ICS45C_Week1_Notes_en-US.md` 会显示成 `ICS 45C Week 1 Notes`。

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
2. 优先复制 `templates/course_notes.html` 到 `notes/course_notes/<COURSE>/index.html`
3. 修改课程页里的 `<title>`、页头课程名、`pageCopy`、`notesCatalog`、`createNoteUrl()`，并把模板中的相对路径从 `../` 改成 `../../../`
4. 在 `tools/md-viewer/index.html` 的 `courseProfiles` 中新增对应条目
5. 笔记 `.md` 文件放入新文件夹，命名遵循规范
6. 所有新文件执行 `chmod 644`（新建文件默认权限可能是 600，Apache 读不到会报 403）

---

## 注意事项

- `assets/js/*.min.js` 和 `tools/speedtest/` 是第三方文件，不要修改
- SASS 源文件（`assets/sass/`）与实际 `main.css` 已不同步，以 `main.css` 为准
- 页面级样式写在各页面 `<head>` 内的 `<style>` 块，不要改全局 `main.css` 来处理单页问题
- 移动端适配用 `@media (max-width: 736px)`（主题 small 断点）
- 只要改了模板相关实现，必须同步检查 `templates/` 与 `SITE_DOCS.md` 是否需要一起更新，避免模板、文档、实际页面三者漂移
