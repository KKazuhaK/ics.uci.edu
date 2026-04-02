# Website Folder Guide

这个 `public_html/` 目录目前主要是静态网站根目录，但里面也混放了两个仅供个人存放文件使用的目录：`resources/` 和 `remote_profiles/`。

## 目录分层

- 网站页面层
  放主站页面与对外访问的静态页面。
- 网站资源层
  放页面共用的样式、脚本、图片、字体等前端资源。
- 工具层
  放可独立访问的小工具或子应用，建议每个工具单独成目录。
- 笔记层
  `notes/` 用于归档不同类型的 Markdown 笔记，建议使用 `notes/<notes_kind>/<course>/` 结构；查看器等展示页面放在 `tools/`。
- 模板层
  `templates/` 用于存放站点模板页或占位页，避免这些文件散落在根目录。
- 个人存放层
  `resources/` 和 `remote_profiles/` 仅作为个人文件区使用，不属于网站结构。

## 维护规则

1. 根目录下的 `.html` 文件都可能直接对应公开 URL，不要随意移动或重命名。
2. 新工具统一放到 `tools/<tool-name>/`，尽量保持自包含，避免和主站资源混放。
3. 课程笔记统一放到 `notes/course_notes/<course>/`，以 `.md` 原稿为主。
4. 如果某门课有多篇笔记，优先在 `notes/course_notes/<course>/index.html` 做课程入口页，再从那里跳到阅读工具。
5. 顶层入口页建议放在 `notes/index.html`，类型入口页建议放在 `notes/<notes_kind>/index.html`，用于从站点菜单统一引导到不同笔记集合。
6. 模板页建议集中放在 `templates/`，并在引用时统一使用该目录下的路径。
7. `resources/` 和 `remote_profiles/` 只是个人存放目录，不计入网站导航、页面结构或前端资源规划。
8. 如果要继续做网页整理，可以默认忽略这两个目录，把它们当作站点外的个人文件区。
9. 如果以后要继续精简目录，优先检查页面之间的链接关系，再决定是否归档或清理模板页。
