# IN4MATX 133: User Interface Software — Lecture 9：服务端开发、身份验证与授权

## 目录

- [1. 服务端开发与 Node.js](#1-服务端开发与-nodejs)
- [2. Node.js Hello World：JavaScript 在哪里运行？](#2-nodejs-hello-worldjavascript-在哪里运行)
- [3. 使用 Node 读取文件](#3-使用-node-读取文件)
- [4. Web 框架需要什么，以及 Express](#4-web-框架需要什么以及-express)
- [5. Express 生成器](#5-express-生成器)
- [6. 身份验证与授权](#6-身份验证与授权)
- [7. 密码与和第三方共享数据](#7-密码与和第三方共享数据)
- [8. OAuth 2.0：术语与四个步骤](#8-oauth-20术语与四个步骤)
- [9. 在你自己的 Node/Express 服务器中实现 OAuth 2.0](#9-在你自己的-nodeexpress-服务器中实现-oauth-20)
- [10. 同源策略](#10-同源策略)
- [11. OpenID Connect](#11-openid-connect)
- [12. 课堂问题与演示（附解答）](#12-课堂问题与演示附解答)
- [13. 速查与必记的 5 个要点](#13-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，周四 10/22（第 4 周）
> 内容整理自 Lecture 9 的幻灯片和 demo 仓库文件夹 `W4_L2_Oct22_ServerAuth`。按概念组织，而不是按来源组织。
> 幻灯片 65–100 位于结束语“Today's goals”和标题页（“More details on OAuth Flow”“More on Node and Express”）之后；其内容已并入下面对应的章节。

> 📅 **课程安排**：
> **没有 Lecture 8 笔记：** 周二 10/20 停课——Reid 教授在伦敦，他的独立游戏入选了 MCM London Comic Con 的 Leftfield 展映。本讲（周四 10/22）由助教 Ziqi 讲授。
> A2 的截止日期**不变**；A3 会推迟几天。A3 有一个 `#assignment3` Slack 频道（组队、提问）。
> A1 成绩大概下周公布；复议需在 2 天内提交，通过大纲中的表单。请包含所有文件、遵守命名约定，并说明如何运行任何特殊的内容。
> 周五有 Vega-Lite 演示。

---

## 1. 服务端开发与 Node.js

**Node.js** 在浏览器之外、服务器上运行 JavaScript。它采用**事件驱动的非阻塞 I/O**（event-driven, non-blocking I/O）模型，因此效率很高，最适合高度交互的页面。当需要大量计算时，其他框架更好——事件循环处理重度 CPU 任务时效率很低。对本课程而言，它最大的优势是门槛低：我们已经会 JavaScript 了。

其他服务端环境包括：**Ruby**（Ruby on Rails）、**Python**（Django 或 web2py）——如今几乎任何语言都可以用来构建动态网站。

**npm**（Node 包管理器）随 Node 一同下载。它最初只收录 Node 专用的库；现在它也托管许多通用的 JavaScript 包（它就是 [Lecture 6](lec-06.zh-CN.md) 中的同一个 npm）。

**Node.js 为你已经熟悉的 JavaScript 增加了**（幻灯片 19）：

- 操作系统级功能，例如读写文件
- 导入和管理包的工具
- 作为 Web 服务器监听端口的能力
- 但它仍然只是 JavaScript，作为 Web 框架来说相当基础

**处理模型**（幻灯片 83）：请求在**单线程事件循环**（single-threaded event loop）中处理——每当有人加载由 Node 管理的页面，请求都会加入这个循环。请求以**异步**方式处理：耗时的任务（读取文件等）交给工作线程池，工作完成后，响应通过**回调**返回给客户端。

> 💡 **关键点**：“单线程”并不意味着一次只能处理一个请求：事件循环会把慢速的 I/O 交出去，然后继续处理其他工作。而 CPU 密集型计算*确实*会阻塞事件循环——这是 Node 的弱点。

## 2. Node.js Hello World：JavaScript 在哪里运行？

幻灯片 10–13 逐步构建了最小的 Node Web 服务器：

```js
var http = require('http');                          // require the http library
var server = http.createServer(function(req, res) {  // anonymous function with request and response parameters
  res.writeHead(200);                                // "Ok" status in the header
  res.end('Hello World');                            // write hello world text
});
server.listen(8080);                                 // listen on port 8080
```

用 `node file.js` 运行它（幻灯片 14）。`require` 是 Node 导入库的方式——类似于 Python 的 `import`。

**记住：Node.js 是服务端 JavaScript。** 幻灯片 17–18 比较了两种都使用 8080 端口的设置：

| | 服务端（`node hello.js`） | 客户端（`live-server`） |
|---|---|---|
| 谁在监听 8080 | Node 本身 | live-server |
| JS（以及 `console.log`）在哪里运行 | **终端** | **浏览器** |

幻灯片 17 的 `hello.js` 在 `server.listen(8080);` 之后添加了 `console.log('Hello, console');`。运行后，终端输出：

```bash
$ node hello.js
Hello, console
```

而在 `localhost:8080` 的浏览器会收到 `200 OK`，响应体为 `Hello World`——浏览器控制台中什么也没有。

幻灯片 18 的客户端版本：

```html
<html>
  <head>
    <script src="./hello.js"></script>
  </head>
  <body>
    Hello, world
  </body>
</html>
```

```js
// hello.js
console.log('Hello, world');
```

> ⚠️ **易错点**：浏览器中的 JS 有 `document`，但没有 `require('http')` 或文件访问；Node 有 `require`、文件和端口，但没有 `document`。

## 3. 使用 Node 读取文件

`fs`（文件系统）库**异步**读取文件——你传入一个回调，它会在读取完成后运行（幻灯片 81）：

```js
var fs = require('fs');        // require the file system library
fs.readFile("/path/to/file", function(err, data) {
  console.log(data);           // read file, wait for asynchronous response
});
```

不指定编码时，`data` 是 **Buffer**（原始字节），而不是字符串。用这种方式读取演示中的 `133_class.json` 会输出：

```text
<Buffer 7b 0a 20 20 22 73 74 75 64 65 6e 74 73 22 3a 20 5b 22 41 6c 69 63 65 22 2c 20 22 42 6f 62 22 2c 20 22 43 68 65 73 74 65 72 22 2c 20 22 44 65 65 70 61 ... 67 more bytes>
```

`JSON.parse(data)` 和 `res.end(data)` 都接受 Buffer。

幻灯片 82 把 `fs` 和 HTTP 服务器组合成一个简单的**静态文件服务器**——URL 路径决定返回哪个文件：

```js
var http = require('http');
var fs = require('fs');
var server = http.createServer(function(req, res) {
fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
});
server.listen(8080);
```

`__dirname` 是脚本所在的文件夹。在 `133_class.json` 旁运行此服务器，结果如下：

| 请求 | 状态 | 响应体 |
|---|---|---|
| `/133_class.json` | 200 | 文件内容 |
| `/` | 404 | `{"errno":-21,"code":"EISDIR","syscall":"read"}`（它是一个文件夹） |
| `/nope.txt` | 404 | `{"errno":-2,"code":"ENOENT","syscall":"open","path":".../nope.txt"}` |

课堂编码演示（幻灯片 14–15）基于此：把 `133_class.json` 的 `students` 字段返回为逗号分隔的列表。幻灯片 15 在浏览器中展示的结果是：`Alice, Bob, Chester, Deepali, Eduardo, Francisco`。

> 🧪 **演示文件**：[setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/setup1.js) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/solution1.js) · [133_class.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/133_class.json)

> ⚠️ **易错点**：像 `fs.readFile('133_class.json', …)` 这样的相对路径，是相对于你**运行** `node` 时所在的文件夹解析的，而不是脚本所在的文件夹。在其他目录下运行 `solution1.js` 会得到 `"code":"ENOENT"` 的 404。为安全起见，使用 `__dirname + '/133_class.json'`。

> 📝 **练习**：[演示 1](#122-演示-1从-json-文件提供学生名单幻灯片-1415--setup1--solution1)

## 4. Web 框架需要什么，以及 Express

一个好的服务端 Web 框架（web framework）需要（幻灯片 20）：

- **支持 HTTP**——接受连接、处理请求、发送响应
- **路由**（routing）——把 URL 映射到处理该 URL 的服务器函数
- **中间件**（middleware）支持——添加数据处理层，便于加入用户会话、安全、压缩等功能

Node.js *能够*完成这三项，但使用起来有些困难，因此人们编写了 **Express** 之类的扩展——这也是 Node 需要包管理器的原因。

### 4.1 Express 基础

**Express.js** 是构建在 Node 之上的一个相当精简的 Web 框架：它可以路由 HTTP 请求、渲染 HTML 并配置中间件。使用 `npm install express` 将其安装到 `node_modules` 中。

```js
var expressApp = express();
expressApp.get('/', function (httpRequest, httpResponse)
{
  httpResponse.send('hello world');
});
expressApp.listen(3000);
```

幻灯片 84 省略了导入语句；完整文件开头是 `var express = require('express');`。`GET /` 返回 `hello world`（200）；任何你没有定义的路由都会返回 Express 默认的 404 页面 `Cannot GET /nope`。

### 4.2 路由

路由按 **HTTP 方法**注册（幻灯片 86）：

```js
expressApp.get(urlPath, requestProcessFunction);
expressApp.post(urlPath, requestProcessFunction);
expressApp.put(urlPath, requestProcessFunction);
expressApp.delete(urlPath, requestProcessFunction);
expressApp.all(urlPath, requestProcessFunction);
```

`urlPath` 可以包含**参数**，例如 `'/user/:user_id'`。

### 4.3 请求与响应对象

`httpRequest` 有很多属性（中间件还可以添加更多）：

| 属性 | 包含内容 | `GET /user/42?foo=9` 得到的结果 |
|---|---|---|
| `request.params` | URL 路由参数 | `{ user_id: '42' }` |
| `request.query` | 查询字符串参数 | `{ foo: '9' }` |
| `request.body` | 解析后的请求体（例如发送的 JSON 对象） | 对于携带 JSON `{"name":"Ada"}` 的 POST 请求得到 `{ name: 'Ada' }`——只有在添加了 `express.json()` 中间件之后才会有 |

注意，所有 params 和 query 的值都是**字符串**（`'42'`、`'9'`）。

`httpResponse` 提供用于设置 HTTP 响应字段的方法：

- `response.write(content)`——逐步构建响应体
- `response.status(code)`——设置状态码
- `response.end()`——结束请求并作出响应（唯一真正的响应！）
- `response.send(content)`——写入内容，然后结束

幻灯片提到应该链式调用：`response.status(code).write(content1).write(content2).end();`

> ⚠️ **易错点**：这个确切的链式调用会抛出 `TypeError: response.status(...).write(...).write is not a function`。`status()` 返回响应对象（可链式调用），但 `write()` 返回的是布尔值。修正方法：`response.status(200); response.write('content1'); response.write('content2'); response.end();`（响应体为 `content1content2`），或者直接使用 `response.status(200).send(...)`。

### 4.4 中间件

中间件使其他软件能够在你的处理函数看到请求之前对其进行处理。它是一个带有第三个参数 `next` 的函数：

```js
expressApp.all(urlPath, function (request, response, next) {
  // Do whatever processing on request (or setting response)
  next(); // pass control to the next handler
});
```

示例（幻灯片 90）：检查用户是否已登录，否则发送错误且**不**调用 `next()`；将请求体解析为 JSON 放入 `request.body`，然后调用 `next()`；会话、Cookie、压缩、加密。下面是一个登录检查（我的版本）：

```js
expressApp.all('/secret', function (request, response, next) {
  if (request.query.token !== 'abc') { response.status(401).send('Not logged in'); return; }
  next();
});
expressApp.get('/secret', function (request, response) { response.send('secret data'); });
```

`GET /secret` → `401 Not logged in`；`GET /secret?token=abc` → `200 secret data`。

### 4.5 示例服务器（幻灯片 91–92）

```js
var express = require('express');
var app = express(); // Creating an Express "App"
app.use(express.static(__dirname)); // Adding middleware
app.get('/', function (request, response) { // A simple request handler
  response.send('Simple web server of files from ' + __dirname);
});
app.listen(3000, function () { // Start Express on the requests
  console.log('Listening at http://localhost:3000 exporting the directory ' +
    __dirname);
});
```

`express.static` 用一行代码实现了第 3 节的文件服务器（`GET /133_class.json` 会返回该文件）；未匹配的请求会继续向下传递，因此 `GET /` 仍然会到达 `'/'` 路由。

```js
app.get('/students/list', function (request, response) {
  response.status(200).send(in4matx133.enrolledStudents());
  return;
});
app.get('/students/:id', function (request, response) {
  var id = request.params.id;
  var user = in4matx133.isEnrolled(id);
  if (user === null) {
    console.log('Student with _id:' + id + ' not found.');
    response.status(400).send('Not found');
    return;
  }
  response.status(200).send(user);
  return;
});
```

`in4matx133` 在幻灯片中没有给出；用一个以 `133_class.json` 为数据源的桩（stub）实现后，`/students/list` 返回 `["Alice","Bob","Chester","Deepali","Eduardo","Francisco"]`（`send` 会把数组转换为 JSON），`/students/Bob` 返回 `{"_id":"Bob"}`，而 `/students/Zed` 会记录 `Student with _id:Zed not found.` 并返回 `400 Not found`（404 会更合适）。

## 5. Express 生成器

一个生成应用骨架的工具，骨架中的目录结构将各组件隔离开——不是必需的，但是一个有用的起点。

```bash
npm install express-generator -g   # install the tool globally
express myapp                      # generate a skeleton (adds boilerplate + common dependencies)
cd myapp                           # cd into the project directory first
npm install                        # install dependencies
npm start                          # run it
```

各部分的作用：

| 路径 | 作用 |
|---|---|
| `package.json`、`package-lock.json`、`node_modules/` | 库管理与已安装的库 |
| `public/` | 对外公开的图片、样式表和 JavaScript 文件 |
| `routes/` | 处理 URL 映射的文件 |
| `views/` | 需要渲染的页面，使用视图引擎（Pug）编写 |
| `app.js` | 设置中间件、路由器等 |
| `bin/www` | 设置监听的端口；由 `npm start` 运行的文件 |

**routes/index.js**（幻灯片 96）：

```js
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });   // variable passed to renderer
});

module.exports = router;                       // so another file can import your router
```

**视图与 Pug**（幻灯片 97–98）：*视图引擎*（view engine）Pug 会根据基于缩进的模板生成 HTML；`extends` 导入另一个文件，`= title` 和 `#{title}` 插入传给渲染器的变量。

```text
//- layout.pug
doctype html
html
  head
    title= title
    link(rel='stylesheet', href='/stylesheets/style.css')
  body
    block content
```

```text
//- index.pug
extends layout
block content
  h1= title
  p Welcome to #{title}
```

使用 `title: 'Express'`，在新生成的应用上 `GET /` 返回的恰好是：

```html
<!DOCTYPE html><html><head><title>Express</title><link rel="stylesheet" href="/stylesheets/style.css"></head><body><h1>Express</h1><p>Welcome to Express</p></body></html>
```

**app.js**（幻灯片 99）——导入路由文件、添加中间件、使用路由：

```js
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');      // import route files
var app = express();
app.use(express.json());                          // to parse content as JSON
app.use(express.urlencoded({ extended: false })); // to parse URL-encoded (form) bodies
app.use(cookieParser());                          // to handle cookies (user state)
app.use(express.static(path.join(__dirname, 'public'))); // treat public/ as static content
app.use('/', indexRouter);                        // use route files
app.use('/users', usersRouter);
```

`app.use('/users', usersRouter)` 挂载路由器，因此 `routes/users.js` 中的 `router.get('/')` 会响应 `GET /users`。

**bin/www**（幻灯片 100）：

```js
var app = require('../app');
var http = require('http');
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
```

> 💡 **关键点**：在生成器的各个文件夹之下，仍然是第 2 节的 `http.createServer(...).listen(port)`——Express 的 `app` 只是请求处理函数。

> 🔗 **延伸阅读**：[Express: application generator](https://expressjs.com/en/starter/generator.html) · [Pug: getting started](https://pugjs.org/api/getting-started.html)

## 6. 身份验证与授权

**身份验证**（authentication）是建立并验证身份：

- **身份识别**（identification）——你是谁？（用户名、账号等）
- **身份验证**——证明一下！（密码、PIN 等）

**授权**（authorization）发生在之后：一旦知道用户是谁，接下来要问：他们被允许访问或修改什么？

- 应用可以**基于角色**预先定义权限：学生可以访问自己的成绩，但不能修改；助教和教授可以访问并修改所有人的成绩。
- 或者应用可以**请求用户授予**某些权限：例如 Twitter 应用询问“我可以代表你发推文吗？”

**多因素身份验证**（multi-factor authentication）应当混合使用你**拥有/持有**的东西和你**知道**的东西：

| 示例 | 因素一 | 因素二 | 是否双因素？ |
|---|---|---|---|
| ATM | ATM 卡（拥有） | PIN（知道） | 是 |
| 密码 + 通过短信/推送获得的验证码 | 密码（知道） | 验证码证明你持有手机（拥有） | 是 |
| 两个密码 | 知道 | 知道 | **否** |

**两个密码 ≠ 双因素身份验证。**

> 📝 **练习**：[问题 1](#121-问题-1好的双因素身份验证幻灯片-26)

## 7. 密码与和第三方共享数据

**密码协议**：发送登录名和密码；服务器检查它们，允许你进入，然后发送你有权查看的数据（你 ↔ Bank of America）。你必须信任服务器会安全地存储你的密码。

如果要把你的银行数据交给**第三方**（Mint，一个金融聚合服务），你*可以*把用户名和密码交给它——为什么这是个坏主意？

- 你现在必须信任另一个服务来管理你的密码。
- 如果你不希望它拥有完全访问权限呢？例如，Mint 可能只能读取你的储蓄账户，而不能读取支票账户。
- 如果你之后想撤销访问权限呢？修改密码可以做到，但这不是个好方案。

## 8. OAuth 2.0：术语与四个步骤

**OAuth 2.0** 是开放授权（open authorization）协议，它让用户**无需把密码交给**第三方应用，也能授予其访问权限，并允许用户随时**撤销**这些访问权限。

历史：OAuth 1.0 很复杂（比 2.0 更糟），存在安全漏洞，不应再使用。Google、Twitter 和 Yahoo! 共同提出了 2.0 版本，它与 1.0 **不兼容**。

### 8.1 术语

| 术语 | 含义 |
|---|---|
| **客户端**（client） | 想要访问资源所有者资源的第三方应用（例如你开发的应用） |
| **资源所有者**（resource owner，即用户） | 其数据正在被访问的人 |
| **资源服务器**（resource server） | 存储资源的应用（Spotify、Google、Facebook） |
| **授权与令牌端点**（authorization and token endpoints） | 资源所有者授权请求所用的 URI |
| **授权码**（authorization code） | 客户端用来请求访问令牌的字符串 |
| **访问令牌**（access token） | 客户端用来访问资源（Spotify 上的歌曲、推文等）的字符串；会在一段时间后**过期** |
| **刷新令牌**（refresh token） | 访问令牌过期后，用来换取新访问令牌的字符串 |

### 8.2 四个步骤（Spotify 的授权码流程）

```mermaid
sequenceDiagram
  participant App as 应用（你的服务器）
  participant Acc as Spotify Accounts Service
  participant User as 用户
  participant API as Spotify Web API
  App->>Acc: 1. client_id、response_type、redirect_uri、state、scope
  Acc->>User: 展示权限范围，必要时提示登录
  User-->>App: 登录并授权，返回 code、state
  App->>Acc: 2. client_id、client_secret、grant_type、code、redirect_uri
  Acc-->>App: access_token、token_type、expires_in、refresh_token
  App->>API: 3. access_token
  API-->>App: 请求到的数据（JSON 对象）
  App->>Acc: 4. refresh token
  Acc-->>App: 新的 access_token（JSON 对象）
```

1. **请求授权**——请用户将你的应用连接到其 Spotify 账户，只请求你需要的数据（个人资料、收听历史等）。
2. **获取访问令牌和刷新令牌**——这是单独的一步，因为访问令牌会过期；刷新令牌可以换取新的有效令牌。
3. **调用 API**——在 GET 请求中携带访问令牌访问某个端点，例如 `https://api.spotify.com/v1/me` 返回 JSON（生日、邮箱、头像）。还有针对艺术家、专辑、曲目等的端点，通常带有子资源：`https://api.spotify.com/v1/albums/{id}`。
4. **刷新访问令牌**——Spotify 的令牌在**一小时**后过期；之后每次请求都会返回 **401（Unauthorized）**。为什么要让它过期？**这样用户就可以撤销其授予的权限。**

### 8.3 注册你的应用

在 Spotify 开发者控制台中，你为应用**创建一个新的 ID**（幻灯片 48–49）。它会给你：

- **客户端 ID**（Client ID）——你应用的 ID，**不是机密**
- **客户端密钥**（client secret）——用来获取访问令牌的机密代码
- 还必须指定 **重定向 URI**（redirect URI）——Spotify 把用户送回的地址

> 🔗 **延伸阅读**：[Wikipedia: OAuth 2.0](https://en.wikipedia.org/wiki/OAuth#OAuth_2.0) · [Spotify: Authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/) · [Spotify: Get current user's profile](https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/) · [Spotify: Web API reference](https://developer.spotify.com/documentation/web-api/reference/) · [Spotify developer dashboard](https://developer.spotify.com/dashboard/)

## 9. 在你自己的 Node/Express 服务器中实现 OAuth 2.0

幻灯片以**服务端 JavaScript**（Node.js/Express）的视角讲解这个流程。OAuth 的部分步骤可以在浏览器中完成，但在 **A3** 中，所有浏览器端请求都发往一个 Node.js/Express 服务器，由它与 Spotify 通信。

### 9.1 架构

- **授权**：页面上的链接指向 `https://accounts.spotify.com/authorize/`；完成 OAuth 流程后，Spotify 会重定向到**你的 Web 服务器**，服务器拿到令牌后，再重定向回客户端页面。
- **API 请求**：浏览器向**你的服务器**发起 HTTP 请求，要求它发起 API 请求；服务器调用 Spotify 并转发响应。

### 9.2 第一步：请求授权

创建一个页面，其中有指向 `https://accounts.spotify.com/authorize/` 的链接，并通过**查询字符串**传递参数：

| 参数 | 值 |
|---|---|
| `client_id` | 你应用的公开 ID |
| `response_type` | 字符串 `code` |
| `redirect_uri` | 返回的地址 |
| `scope` | 要请求的权限 |

```text
https://accounts.spotify.com/authorize?
  response_type=code&
  client_id=6d81b7a55e894abdbf53143fb2901573&
  scope=user-read-private%20user-read-email&
  redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback
```

使用 `encodeURIComponent()` 对特殊字符进行转义：`'http://localhost:8888/callback'` → `http%3A%2F%2Flocalhost%3A8888%2Fcallback`，权限范围之间的空格 → `%20`。

**处理响应**：用户点击“好”，浏览器会带着额外的 URL 参数重定向回你的服务器——`http://localhost:8888/callback?code=...`。在 Express 中，从 `req.query` 读取（`req.query.code`）。

### 9.3 第二步：用授权码换取访问令牌

为什么？**任何网站都可以把用户发送到那个 authorize URL**——客户端 ID 是公开的。只有我们的应用知道**客户端密钥**，它能证明该客户端 ID 确实属于我们。

向 `https://accounts.spotify.com/api/token` 发起 **POST** 请求：POST 把内容放在**请求体**中（监听你流量的人无法读取），而 GET 把内容放在 URI 中。

| 位置 | 字段 | 值 |
|---|---|---|
| 请求体 | `grant_type` | 字符串 `authorization_code` |
| 请求体 | `code` | 授权响应中的 code |
| 请求体 | `redirect_uri` | 必须与之前相同 |
| 请求头 | `Authorization` | 客户端 ID 与客户端密钥拼接后，转为 Buffer 并进行 base64 编码 |
| 请求头 | `Content-Type` | `application/x-www-form-urlencoded` |

构造它们（幻灯片 73）：

```js
params = new URLSearchParams();
params.append('grant_type', 'authorization_code');   // etc.

headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Authorization': 'Basic ' + Buffer.from(my_client_id + ':' +
      my_client_secret).toString('base64')
};
```

幻灯片错误：幻灯片 73、75 和 77 的代码中使用了弯引号（`‘grant_type’`）——应使用直引号。`Buffer` 只属于 Node；浏览器中有 `btoa`。

在下面试一下——浏览器会构建第一步的链接，以及第二步的请求体和请求头（修改 scope 后点击 Run）：

```viz web-demo
{"title": "幻灯片 67–73 · 构建 OAuth 请求的各部分（修改 scope 后点击 Run）", "html": "<a id=\"auth\" href=\"#\">Authorize</a>\n<p>Hover the link to see its URL; the request pieces are in the console.</p>", "js": "// Step 1: the link your page sends the user to (slides 67–68)\nconst client_id = '6d81b7a55e894abdbf53143fb2901573';\nconst redirect_uri = 'http://localhost:8888/callback';\nconst scope = 'user-read-private user-read-email';\nconst authorizeURL = 'https://accounts.spotify.com/authorize?' +\n  'response_type=code' +\n  '&client_id=' + client_id +\n  '&scope=' + encodeURIComponent(scope) +\n  '&redirect_uri=' + encodeURIComponent(redirect_uri);\nconsole.log(authorizeURL);\ndocument.getElementById('auth').href = authorizeURL;\n\n// Step 2: what the server sends to /api/token (slides 72–73)\nconst params = new URLSearchParams();\nparams.append('grant_type', 'authorization_code');\nparams.append('code', 'AQD...code-from-callback');\nparams.append('redirect_uri', redirect_uri);\nconsole.log('body:', params.toString());\n// Node uses Buffer.from(...).toString('base64'); the browser equivalent is btoa\nconsole.log('Authorization: Basic ' + btoa(client_id + ':' + 'my_client_secret'));", "height": 90, "interactive": true}
```

控制台输出：

```text
https://accounts.spotify.com/authorize?response_type=code&client_id=6d81b7a55e894abdbf53143fb2901573&scope=user-read-private%20user-read-email&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback
body: grant_type=authorization_code&code=AQD...code-from-callback&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback
Authorization: Basic NmQ4MWI3YTU1ZTg5NGFiZGJmNTMxNDNmYjI5MDE1NzM6bXlfY2xpZW50X3NlY3JldA==
```

（密钥和授权码都是占位符；Node 的 `Buffer` 会得到完全相同的字符串。）

**响应体**中包含**访问令牌**、**过期时间**（expires in）和**刷新令牌**。把它们存入数据库；在 A3 中，存入文本文件（做法不规范，但更容易）。

> ⚠️ **易错点**：Base64 是一种*编码*，不是加密——任何看到该请求头的人都能解码出密钥，因此它只应在你的服务器与 Spotify 之间传输。

### 9.4 第三步：发起 API 请求

与客户端 ID 和密钥一样，将访问令牌放在请求头中，但不需要转换：

```js
'Authorization': 'Bearer ' + access_token
```

然后 GET 某个端点，例如 `https://api.spotify.com/v1/me` 或 `https://api.spotify.com/v1/albums/{id}`。

### 9.5 第四步：刷新令牌

使用与第二步相同的端点（`/api/token`）和请求头；请求体为 `grant_type=refresh_token&refresh_token=...`。

> 🔗 **延伸阅读**：[Spotify: Authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/) · [MDN: encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) · [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) · [w3schools: Buffer.from()](https://www.w3schools.com/nodejs/met_buffer_from.asp) · [Security StackExchange: GET vs POST, which is more secure?](https://security.stackexchange.com/questions/33837/get-vs-post-which-is-more-secure)

## 10. 同源策略

**源**（origin）由协议（scheme）、主机（host）和端口（port）组成。同一域名但**端口不同的站点在技术上是不同的源**，因此浏览器依据**同源策略**（same-origin policy）通常会阻止我们的 live-server 页面（一个端口）读取运行在另一个端口上的脚本的数据（例如 Twitter 代理，或 A3 的 Spotify 服务器）。

幻灯片 78 的表格，与 `http://www.example.com/dir/page.html` 进行比较：

| URL | 同源？ | 原因 |
|---|---|---|
| `http://www.example.com/dir/page2.html` | ✅ | 协议、主机、端口相同 |
| `http://www.example.com/dir2/other.html` | ✅ | （忽略路径） |
| `http://username:password@www.example.com/dir2/other.html` | ✅ | （忽略凭据） |
| `http://www.example.com:81/dir/other.html` | ❌ | 端口 |
| `https://www.example.com/dir/other.html` | ❌ | 协议 |
| `http://en.example.com/dir/other.html` | ❌ | 主机 |
| `http://example.com/dir/other.html` | ❌ | 主机（需完全匹配） |
| `http://v2.www.example.com/dir/other.html` | ❌ | 主机（需完全匹配） |
| `http://www.example.com:80/dir/other.html` | 取决于情况 | 显式端口；因浏览器而异 |

浏览器的 URL 解析器会把 `:80`（http 的默认端口）规范化为同一个源；`localhost:8080` 与 `localhost:8888` 则返回 `false`：

```viz web-demo
{"title": "幻灯片 78 · 是否同源？（new URL(...).origin）", "html": "<p>See the console.</p>", "js": "const base = 'http://www.example.com/dir/page.html';\nconst urls = [\n  'http://www.example.com/dir/page2.html',\n  'http://www.example.com/dir2/other.html',\n  'http://username:password@www.example.com/dir2/other.html',\n  'http://www.example.com:81/dir/other.html',\n  'https://www.example.com/dir/other.html',\n  'http://en.example.com/dir/other.html',\n  'http://example.com/dir/other.html',\n  'http://v2.www.example.com/dir/other.html',\n  'http://www.example.com:80/dir/other.html'\n];\nconsole.log('base origin:', new URL(base).origin);\nfor (const u of urls) {\n  const o = new URL(u).origin;\n  console.log(o === new URL(base).origin ? 'same     ' : 'DIFFERENT', o);\n}\n// Lecture setting: live-server on 8080 vs your Node/Express server on 8888\nconsole.log(new URL('http://localhost:8080/').origin === new URL('http://localhost:8888/').origin);", "height": 60}
```

**但是**，Twitter 代理和 A3 的 Spotify 服务器**允许来自其他端口的连接**——通过 Express 中的 CORS 中间件实现（幻灯片 79）：

```js
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  if (req.method === 'OPTIONS') return res.send(200);
  next();
});
```

因此，如果它们公开在网上，**任何人**都可以使用你的凭据发起 Twitter/Spotify API 请求。

> ⚠️ **易错点**：同源策略由**浏览器**强制执行。服务器（Node、`curl`）可以请求任何 URL；这正是 A3 的设计要将 Spotify 调用经由你的服务器转发的原因。

> 📝 **练习**：[问题 2](#123-问题-2哪些可以向-spotify-api-发起-http-请求幻灯片-58)

> 🔗 **延伸阅读**：[Wikipedia: Same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy) · [leftlogic/twitter-proxy](https://github.com/leftlogic/twitter-proxy)

## 11. OpenID Connect

是否见过“使用 Google 登录”按钮（或 Spotify 登录页上的“使用 Facebook/Apple 继续”）？那就是 **OpenID Connect**，它是构建在 OAuth 之上的一个额外层。

| 优点 | 缺点 |
|---|---|
| 无需为每项服务获取单独的 ID | Facebook/Google/Apple 等会收集（更多）你的个人信息，以及你访问的网站信息 |
| 只需记住和保存一个密码 | |

> 🔗 **延伸阅读**：[OpenID Connect](https://openid.net/connect/)

## 12. 课堂问题与演示（附解答）

### 12.1 问题 1：“好的”双因素身份验证（幻灯片 26）

以下哪一项是“好的”双因素身份验证的例子？

- A. 政府机构要求出示出生证明和护照
- B. 商店要求出示会员卡和 PIN
- C. 网站要求输入密码和安全问题
- D. 以上两项
- E. 以上全部

> ✍️ **先自己试一试。**

**答案：B。**好的双因素身份验证会混合你*拥有*的因素和你*知道*的因素。A 是两样你拥有的东西（两份证件）；C 是两样你知道的东西——即“两个密码 ≠ 双因素身份验证”的情形。只有 B 将卡片（拥有）与 PIN（知道）配对，因此 D 和 E 都排除。（幻灯片没有显示公布的投票结果；这直接由幻灯片 25 推出。）返回[第 6 节](#6-身份验证与授权)。

### 12.2 演示 1：从 JSON 文件提供学生名单（幻灯片 14–15 · setup1 → solution1）

任务（`setup1.js` 中的注释）：在 Node 中创建一个网页，返回 `133_class.json` 的 `"students"` 字段，格式为逗号分隔的列表。

```json
{
  "students": ["Alice", "Bob", "Chester", "Deepali", "Eduardo", "Francisco"],
  "quarter": "Fall",
  "year": 2019
}
```

起始代码（`setup1.js`）——一个对所有请求都返回固定文本的服务器：

```js
var http = require('http');
var fs = require('fs');
var server = http.createServer((req, res) => {
	console.log('here');
	res.writeHead(200);
	res.end("<strong>Bold text</strong>");
});
server.listen(8080);
```

> ✍️ **先自己试一试。**

**答案**（`solution1.js`）：在处理函数中读取文件、解析，然后用 `join` 连接数组：

```js
var server = http.createServer((req, res) => {
fs.readFile('133_class.json', (err,data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    var students = JSON.parse(data).students
    res.end(students.join(', '));
  });
});
server.listen(8080);
```

在包含 JSON 文件的文件夹中运行 `node solution1.js`，然后访问 `localhost:8080`：

```text
Alice, Bob, Chester, Deepali, Eduardo, Francisco
```

要点：`res.end` 必须放在回调**内部**（放在外部的话，会在文件被读取之前就已响应）；`join(', ')` 相当于 Python 的 `', '.join(...)`。从其他目录运行时会返回 404 `ENOENT`——请使用 `__dirname`。返回[第 3 节](#3-使用-node-读取文件)。

> 🧪 **演示文件**：[setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/setup1.js) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/solution1.js)

### 12.3 问题 2：哪些可以向 Spotify API 发起 HTTP 请求？（幻灯片 58）

以下哪些可以向 Spotify API 发起 HTTP 请求？（假设浏览器使用默认设置。）

1. 一个打开着 spotify.com 的浏览器
2. 一个在 localhost:8888 上运行、带有客户端 JavaScript 的浏览器
3. 一个在 localhost:8888 上运行、带有服务端 JavaScript 的浏览器
4. 一个运行在 Spotify 域中的服务器

- A. 4
- B. 1、4
- C. 1、2、4
- D. 1、3、4
- E. 1、2、3、4

> ✍️ **先自己试一试。**

**答案：D（1、3、4）**——这是讲座模型给出的答案；幻灯片没有显示公布的结果。

- （1）✅ 被视为同源（“Spotify 域”；严格来说，根据幻灯片 78，`spotify.com` ≠ `api.spotify.com`）。
- （2）❌ 来自 `localhost:8888` 的客户端 JS 属于另一个源；浏览器会阻止它。
- （3）✅ 浏览器请求的是*你的*服务器，由服务器发起请求——服务器不受该策略约束（[A3 架构](#91-架构)）。
- （4）✅ 一个服务器，无论如何都与其在同一域中。

陷阱在于 (2) 与 (3)：端口相同，但发起者不同。（服务器可以通过 CORS 头选择允许其他源，见幻灯片 79；此题假设它没有这样做。）返回[第 10 节](#10-同源策略)。

## 13. 速查与必记的 5 个要点

**Node 与 Express**

| 代码 | 作用 |
|---|---|
| `http.createServer((req, res) => {...}).listen(8080)` | Node 服务器；`res.writeHead(200)`、`res.end(body)` |
| `fs.readFile(path, (err, data) => {...})` | 异步读取；`data` 是 Buffer；使用 `__dirname` |
| `app.get/post/put/delete/all(path, fn)` | Express 路由；`'/user/:user_id'` 用于参数 |
| `req.params`、`req.query`、`req.body` | 路由参数、查询字符串、解析后的请求体（`express.json()`） |
| `res.status(c)`、`res.write(x)`、`res.end()`、`res.send(x)` | `write` 返回布尔值，因此不要在它之后链式调用 |
| `app.use((req, res, next) => {...})` | 中间件；调用 `next()` 继续 |
| `express.static(dir)`、`express.Router()`、`res.render(view, vars)` | 静态文件、路由文件、Pug 视图 |
| `npm install express-generator -g` → `express` → `npm install` → `npm start` | 生成器骨架 |

**OAuth 2.0（Spotify）**

| 步骤 | 请求 | 关键字段 |
|---|---|---|
| 1. 授权 | 链接 → `accounts.spotify.com/authorize?...` | `client_id`、`response_type=code`、`redirect_uri`、`scope` → 带着 `?code=` 返回 |
| 2. 令牌 | POST `accounts.spotify.com/api/token` | 请求体 `grant_type=authorization_code`、`code`、`redirect_uri`；请求头 `Authorization: Basic base64(id:secret)`、`Content-Type: application/x-www-form-urlencoded` |
| 3. API 调用 | GET `api.spotify.com/v1/me` 等 | 请求头 `Authorization: Bearer <access_token>` |
| 4. 刷新 | POST `accounts.spotify.com/api/token` | 请求体 `grant_type=refresh_token`、`refresh_token`；请求头相同 |

**必记的 5 个要点**

1. Node.js 是服务端 JavaScript：`console.log` 输出到终端；它有文件和端口，但没有 DOM。
2. 身份验证 = 证明你是谁；授权 = 你可以做什么。好的双因素身份验证 = *拥有* + *知道*。
3. OAuth：授权（得到 code）→ 用 code + **客户端密钥**请求令牌 → 使用 `Bearer` 调用 API → 过期后刷新（1 小时，之后返回 401）。过期机制让用户可以撤销权限。
4. 客户端 ID 是公开的；密钥必须留在你的服务器上——这就是 A3 要经由 Node/Express 转发的原因。
5. 源 = 协议 + 主机 + 端口。浏览器强制执行同源策略，服务器不受其约束；CORS 让服务器选择允许跨源访问。