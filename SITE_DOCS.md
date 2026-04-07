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
│   ├── course_notes/                      # 课程笔记
│   └── demo_notes/                        # LA/TA 演示笔记（见下）
├── tools/md-viewer/                       # Markdown 阅读器
├── tools/speedtest/                       # 第三方测速工具，勿动
├── remote_profiles/                       # Clash 订阅配置
├── resources/                             # 公开文件分发（目录可浏览）
├── assets/css/main.css                    # 全局样式，直接编辑
├── assets/js/main.js                      # 全局行为
└── assets/js/*.min.js                     # 第三方库，勿动
```

`assets/sass/` 是主题原始 SASS 源文件，**未接入构建流程**，`main.css` 直接手动维护。

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

笔记系统分为两个子分类，在 `notes/index.html` 主页并列展示：

#### Course Notes（课程笔记）

每门课对应：
- `notes/course_notes/<COURSE>/index.html` — 课程笔记目录页（类型 B）
- 同目录下的 `.md` 文件 — 实际笔记内容

笔记通过 `tools/md-viewer/index.html` 渲染，用 URL 参数传递目标文件和语言。

#### LA/TA Demo Notes（演示笔记）

LA/TA 教学用的交互式演示，结构：
```
notes/demo_notes/
├── index.html                  # Demo Notes 目录页（类型 A，按课程分组）
└── <COURSE>/
    ├── index.html              # 课程演示列表页（类型 B，卡片网格，数据驱动）
    └── <demo>.html             # 单个交互演示页面（类型 B）
```

课程列表页内嵌 `weekCatalog` 数组驱动卡片渲染（按 Week 分组），新增一周只需往数组加一条并放入对应 HTML 文件：
```js
{ week: 2, title: "Basic Types, Operators & Modules | Expressions & Strings", summary: "...", labs: 2, file: "week-2.html" }
```

Week 页面（如 `week-2.html`）包含该周所有 Lab 的交互演示，使用 tab 切换。支持 URL hash 直接链接到具体 Lab（如 `#lab-2_27`）。

演示页面的面包屑导航格式：`Notes / Demo Notes / <COURSE> / <Lab>`。

### Demo 代码高亮

演示页面中的代码块使用内置的 `highlightPy()` 函数做 VS Code Dark+（`#1e1e1e` 深色背景）风格的 Python 语法高亮。  
这是一个轻量级的纯前端正则 tokenizer，不依赖外部库，支持关键字、内置函数、字符串、数字、注释、运算符的着色。  
新增演示页面时，需要在页面 `<script>` 中包含 `highlightPy()` 和 `escHtml()` 两个函数，并在渲染代码框时调用 `highlightPy(code)` 替代直接输出纯文本。

### Demo 交互控件

- **步骤工具栏**：步骤按钮（Step 1/2/3/4）在左，Prev/Next 导航在右，同一行排列（`.step-toolbar`）
- **防跳动**：所有步骤切换函数通过 `keepScroll()` 包裹，防止内容高度变化导致页面滚动
- **导航按钮**：第一步时 Prev 按钮变灰（`.disabled`），最后一步时 Next 按钮变灰
- **内容可见性控制**：在 `labs` 数组中添加 `hidden: true` 可隐藏某个 Lab tab；在 `weekCatalog` 中添加 `hidden: true` 可隐藏某周卡片
- **变量监视面板**（`.var-watch`）：VS Code 调试器风格的变量面板，用于计算类 demo（如 Pizza Party），逐步展示变量值变化

### 语言系统

全站使用 BCP 47 语言标签：`en-US` / `zh-CN`（不用 `en`、`zh`、`cn` 等缩写）。

**文件命名规范：**
```
{课程代码}_{周次}_Notes_{语言}.md
示例：ICS45C_Week1_Notes_zh-CN.md
```

**中文笔记标题编号规范：**  
大标题（`##`）统一使用阿拉伯数字编号（`## 1.`、`## 2.`），不要使用中文数字（~~一、二、三~~）。子标题同理。英文版和中文版保持一致的编号风格。

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

### Markdown 数学公式

`tools/md-viewer/index.html` 支持 KaTeX 数学公式渲染（按需加载，仅在页面含 `$` 时才加载库）。

**Block math**（独立居中显示）：
````md
$$\boxed{E = mc^2}$$
````

或多行：
````md
$$
\frac{a}{b} + c
$$
````

**Inline math**（行内）：
```md
设 $x = 1$，则...
```

KaTeX 不支持的公式会静默降级显示为原始文本，不会破坏页面。

---

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

### md-viewer 目录侧边栏（TOC Sidebar）

当笔记包含 4 个以上标题时，页面右侧会出现 Notion 风格的目录侧边栏：

- **收起状态**：显示 ≡ 图标 + 缩略横条（minimap），横条宽度按标题级别区分（h1 最宽，h4 最窄）
- **展开状态**：鼠标悬停时横条消失，展开完整文字目录面板（280px 宽）
- **自动跟踪**：随页面滚动高亮当前标题，横条和面板同步滚动
- **点击跳转**：点击目录项平滑滚动到对应标题，跳转期间 TOC 不会因中间标题闪烁
- **移动端隐藏**：`max-width: 768px` 时 TOC 不显示
- **滚动隔离**：面板设有 `overscroll-behavior: contain`，防止滚动穿透到页面

TOC 相关的 CSS 类名：`#toc-sidebar`、`.toc-marks`、`.toc-marks-icon`、`.toc-marks-track`、`.toc-mark`、`.toc-panel`、`.toc-item`。  
JS 入口函数：`buildToc(contentEl)`，在笔记渲染和文件上传渲染后调用。

### md-viewer 大屏字体覆盖

全局 `main.css` 在 `min-width: 1681px` 时将 `body` 字体设为 `17pt`，在大屏显示器（如 32 寸）上偏大。  
md-viewer 页面内通过 `<style>` 将 `min-width: 1681px` 时的 `body` 字体覆盖为 `14pt`，仅影响阅读器页面。

### md-viewer 文件上传模式

当 URL 不含 `kind`、`course`、`note`、`file` 参数时，md-viewer 进入文件上传模式：

- 显示拖拽/选择区域，支持 `.md`、`.markdown`、`.txt` 文件
- 文件大小限制 5 MB
- 渲染后同样会触发 TOC、语法高亮、KaTeX
- "Open another file" 按钮可重置回上传界面

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
2. 复制一个现有课程页（如 `notes/course_notes/ICS-45C/index.html`）到 `notes/course_notes/<COURSE>/index.html`
3. 修改课程页里的 `<title>`、页头课程名、`pageCopy`、`notesCatalog`、`createNoteUrl()`
4. 在 `tools/md-viewer/index.html` 的 `courseProfiles` 中新增对应条目
5. 在 `index.html` 的 tiles 区域（`#one` section）新增一个 `<article>` 入口，替换一个 "Upcoming" 占位格
6. 笔记 `.md` 文件放入新文件夹，命名遵循规范
7. 所有新文件执行 `chmod 644`（新建文件默认权限可能是 600，Apache 读不到会报 403）

---

## AI 聊天系统

全站集成了 Mistral AI 聊天功能，分为两个入口：

### 浮窗 Ask AI（所有页面）

- **文件**：`assets/js/chat-widget.js`，由 `assets/js/main.js` 末尾动态加载
- **按钮**：固定在右下角的蓝色药丸按钮（附件图标 + "Ask AI"），与 md-viewer 的 TOP 按钮共存于 `#cw-btn-group` flex 容器
- **功能**：读取当前页面文本（最多 16000 字符）作为上下文，AI 回答与页面相关的问题
- **不加载**：`/tools/ask-ai/` 页面（独立聊天页）自动跳过
- **渲染**：支持 Markdown（粗体、斜体、代码块、列表、标题、链接）和 KaTeX 数学公式（`$`/`$$`/`\(\)`/`\[\]`，按需加载，流式实时渲染）
- **文件上传**：支持图片（Mistral Vision）、PDF（`document_url`）、文本文件（直接注入内容），最大 8MB，支持剪贴板粘贴图片

### 独立聊天页

- **文件**：`tools/ask-ai/index.html`
- **功能**：自由对话，不限于页面内容，支持文件上传（图片/PDF/文本）
- **认证**：双重登录方式
  - **Kazuha Hub SSO**：通过 Entra ID (Azure AD) OAuth 2.0，登录后签发 JWT（7天有效）
  - **Access Code**：通过 Cloudflare Worker 环境变量 `CHAT_PASSWORD`（支持多个逗号分隔），隐藏在 "Use Access Code" 折叠区
- **登录流程**：SSO 按钮 → Worker `/auth/login` → Entra ID 授权 → `/auth/callback` 换 code → 签发 JWT → 重定向回前端
- **Sitemap 知识库**：Worker 自动拉取 `sitemap.json`（1小时缓存），注入 system prompt 让 AI 了解全站结构
- **代码高亮**：Shiki（与 md-viewer 同库），按需加载，流式输出完成后自动上色
- **登录声明**：登录前展示使用须知（学术诚信、AI 不准确性、隐私等）

### Cloudflare Worker 代理

- **参考文件**：`tools/ask-ai/worker.js`（仅供参考，实际部署在 Cloudflare）
- **Worker URL**：`https://ics-uci-edu-chat-ai.kazuhahub.workers.dev`
- **环境变量**：
  - `MISTRAL_API_KEY` — Mistral API 密钥
  - `CHAT_PASSWORD` — 逗号分隔的 Access Code 列表
  - `AZURE_CLIENT_ID` — Entra ID 应用 Client ID
  - `AZURE_CLIENT_SECRET` — Entra ID Client Secret
  - `AZURE_TENANT_ID` — Entra ID 租户 ID
  - `JWT_SECRET` — JWT 签名密钥（HMAC-SHA256）
- **路由**：
  - `GET /auth/login` — 跳转 Entra ID 授权页
  - `GET /auth/callback` — OAuth 回调，换 code、签发 JWT、重定向
  - `POST /` — 聊天 API（`mode: "page"` 浮窗 / `mode: "chat"` 独立页）
- **认证逻辑**：JWT 或 Access Code，任一通过即可；JWT 登录会将用户名注入 system prompt
- **CORS**：仅允许 `https://ics.uci.edu` 和 `http://localhost`
- **Sitemap**：自动拉取 `sitemap.json` 作为 AI 知识库，1小时内存缓存
- **修改 prompt、模型或认证逻辑后需重新部署 Worker**

### Sitemap 知识库

- **文件**：`sitemap.json`，AI 的站点知识来源
- **自动生成**：`bash tools/generate-sitemap.sh`，扫描全站 HTML/MD 文件并生成
- **内容**：站点信息、所有页面路径/标题/分类、About Me 详细信息、Markdown 笔记列表

---

## 注意事项

- `assets/js/*.min.js` 和 `tools/speedtest/` 是第三方文件，不要修改
- SASS 源文件（`assets/sass/`）与实际 `main.css` 已不同步，以 `main.css` 为准
- 页面级样式写在各页面 `<head>` 内的 `<style>` 块，不要改全局 `main.css` 来处理单页问题
- 移动端适配用 `@media (max-width: 736px)`（主题 small 断点）
- 改了页面通用结构（header、footer、scroll 逻辑等）时，检查 `SITE_DOCS.md` 是否需要同步更新
