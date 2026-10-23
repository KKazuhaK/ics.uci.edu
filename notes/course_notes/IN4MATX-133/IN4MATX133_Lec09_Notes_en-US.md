# IN4MATX 133: User Interface Software — Lecture 9: Server-Side Development, Authentication, & Authorization

## Table of Contents

- [1. Server-side development and Node.js](#1-server-side-development-and-nodejs)
- [2. Node.js hello world: where is the JavaScript running?](#2-nodejs-hello-world-where-is-the-javascript-running)
- [3. Reading files with Node](#3-reading-files-with-node)
- [4. What a web framework needs, and Express](#4-what-a-web-framework-needs-and-express)
- [5. Express generator](#5-express-generator)
- [6. Authentication vs. authorization](#6-authentication-vs-authorization)
- [7. Passwords and sharing data with a third party](#7-passwords-and-sharing-data-with-a-third-party)
- [8. OAuth 2.0: terms and the four steps](#8-oauth-20-terms-and-the-four-steps)
- [9. OAuth 2.0 in your own Node/Express server](#9-oauth-20-in-your-own-nodeexpress-server)
- [10. Same-origin policy](#10-same-origin-policy)
- [11. OpenID Connect](#11-openid-connect)
- [12. In-class Questions & Demos (with Solutions)](#12-in-class-questions--demos-with-solutions)
- [13. Quick Reference & Top 5 Things to Remember](#13-quick-reference--top-5-things-to-remember)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid, Fall 2026, Thursday 10/22 (Week 4)
> Built from the Lecture 9 slides and the demo repo folder `W4_L2_Oct22_ServerAuth`. Organized by concept, not by source.
> Slides 65–100 come after the closing "Today's goals" and title pages ("More details on OAuth Flow", "More on Node and Express"); their content is merged into the matching sections below.

> 📅 **Class logistics**:
> **No Lecture 8 notes:** Tue 10/20 was cancelled — Prof. Reid was in London, where his indie game was picked for the Leftfield showcase at MCM London Comic Con. TA Ziqi gave this lecture (Thu 10/22).
> A2 due date is **not** moving; A3's will be pushed back a few days. A3 has an `#assignment3` Slack channel (partners, questions).
> A1 grades probably out next week; regrades: 2 days, via the form in the syllabus. Include all files, follow the naming conventions, and explain how to run anything unusual.
> Vega-Lite demo on Friday.

---

## 1. Server-side development and Node.js

**Node.js** runs JavaScript outside the browser, on a server. Its **event-driven, non-blocking I/O** model makes it efficient, so it's best for highly interactive pages. When a lot of computation is required, other frameworks are better — an event-driven loop is inefficient for heavy CPU work. For this course, its big plus is a lower threshold: we already know JavaScript.

Other server-side environments: **Ruby** (Ruby on Rails), **Python** (Django or web2py) — these days you can build a dynamic website in almost any language.

**npm** (Node package manager) comes with the Node download. It originally held libraries specifically for Node; now it hosts many JavaScript packages in general (it's the same npm from [Lecture 6](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec06_Notes_en-US.md)).

**What Node.js adds** to the JavaScript you know (slide 19):

- OS-level functionality, like reading and writing files
- tools for importing and managing packages
- the ability to listen on a port as a web server
- but it's still just JavaScript, and pretty basic as a web framework

**Processing model** (slide 83): requests are handled in a **single-threaded event loop** — every time someone loads a page Node manages, the request joins this loop. Requests are processed **asynchronously**: long-running jobs (file reads, etc.) go to a worker thread pool, and when the work is done the response goes back to the client via a callback.

> 💡 **Key Insight**: "Single-threaded" doesn't mean one request at a time: the loop hands slow I/O off and moves on. A CPU-heavy computation *does* block the loop — Node's weak spot.

## 2. Node.js hello world: where is the JavaScript running?

Slides 10–13 build up the smallest Node web server:

```js
var http = require('http');                          // require the http library
var server = http.createServer(function(req, res) {  // anonymous function with request and response parameters
  res.writeHead(200);                                // "Ok" status in the header
  res.end('Hello World');                            // write hello world text
});
server.listen(8080);                                 // listen on port 8080
```

Run it with `node file.js` (slide 14). `require` is Node's way of importing a library — like Python's `import`.

**Remember: Node.js is server-side JavaScript.** Slides 17–18 compare two setups that both use port 8080:

| | Server-side (`node hello.js`) | Client-side (`live-server`) |
|---|---|---|
| Who listens on 8080 | Node itself | live-server |
| Where the JS (and `console.log`) runs | the **terminal** | the **browser** |

Slide 17's `hello.js` adds `console.log('Hello, console');` after `server.listen(8080);`. Running it, the terminal prints:

```bash
$ node hello.js
Hello, console
```

and the browser at `localhost:8080` gets `200 OK` with body `Hello World` — nothing in its console.

Slide 18's client-side version:

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

> ⚠️ **Pitfall**: Browser JS has `document` but no `require('http')` or file access; Node has `require`, files and ports but no `document`.

## 3. Reading files with Node

The `fs` (file system) library reads files **asynchronously** — you pass a callback that runs once the read finishes (slide 81):

```js
var fs = require('fs');        // require the file system library
fs.readFile("/path/to/file", function(err, data) {
  console.log(data);           // read file, wait for asynchronous response
});
```

Without an encoding, `data` is a **Buffer** (raw bytes), not a string. Reading the demo's `133_class.json` this way prints:

```text
<Buffer 7b 0a 20 20 22 73 74 75 64 65 6e 74 73 22 3a 20 5b 22 41 6c 69 63 65 22 2c 20 22 42 6f 62 22 2c 20 22 43 68 65 73 74 65 72 22 2c 20 22 44 65 65 70 61 ... 67 more bytes>
```

`JSON.parse(data)` and `res.end(data)` both accept a Buffer.

Slide 82 combines `fs` with the HTTP server into a tiny **static file server** — the URL path picks the file:

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

`__dirname` is the folder the script lives in. Results with this server running next to `133_class.json`:

| Request | Status | Body |
|---|---|---|
| `/133_class.json` | 200 | the file's contents |
| `/` | 404 | `{"errno":-21,"code":"EISDIR","syscall":"read"}` (it's a folder) |
| `/nope.txt` | 404 | `{"errno":-2,"code":"ENOENT","syscall":"open","path":".../nope.txt"}` |

The in-class coding demo (slides 14–15) builds on this: return the `students` field of `133_class.json` as a comma-separated list. Slide 15 shows the result in the browser: `Alice, Bob, Chester, Deepali, Eduardo, Francisco`.

> 🧪 **Demo files**: [setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/setup1.js) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/solution1.js) · [133_class.json](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/133_class.json)

> ⚠️ **Pitfall**: A relative path like `fs.readFile('133_class.json', …)` is resolved against the folder you **ran** `node` from, not the script's folder. Run `solution1.js` from another directory and you get a 404 with `"code":"ENOENT"`. Use `__dirname + '/133_class.json'` to be safe.

> 📝 **Practice**: [Demo 1](#122-demo-1-serve-the-student-list-from-a-json-file-slides-1415--setup1--solution1)

## 4. What a web framework needs, and Express

A "good" server-side web framework needs (slide 20):

- **to speak HTTP** — accept connections, handle requests, send replies
- **routing** — map URLs to the server function for that URL
- **middleware support** — add data-processing layers, making it easy to add user sessions, security, compression, etc.

Node.js *can* do all three, but they're somewhat difficult to use, so people wrote extensions like **Express** — this is why Node made a package manager.

### 4.1 Express basics

**Express.js** is a fairly minimal web framework on top of Node: it can route HTTP requests, render HTML and configure middleware. Install it into `node_modules` with `npm install express`.

```js
var expressApp = express();
expressApp.get('/', function (httpRequest, httpResponse)
{
  httpResponse.send('hello world');
});
expressApp.listen(3000);
```

Slide 84 omits the import; the complete file starts with `var express = require('express');`. `GET /` returns `hello world` (200); any route you didn't define returns Express's default 404 page `Cannot GET /nope`.

### 4.2 Routing

Routes are registered **by HTTP method** (slide 86):

```js
expressApp.get(urlPath, requestProcessFunction);
expressApp.post(urlPath, requestProcessFunction);
expressApp.put(urlPath, requestProcessFunction);
expressApp.delete(urlPath, requestProcessFunction);
expressApp.all(urlPath, requestProcessFunction);
```

`urlPath` may contain **parameters**, e.g. `'/user/:user_id'`.

### 4.3 The request and response objects

`httpRequest` has a lot of properties (and middleware can add more):

| Property | Contains | `GET /user/42?foo=9` gives |
|---|---|---|
| `request.params` | URL route params | `{ user_id: '42' }` |
| `request.query` | query-string params | `{ foo: '9' }` |
| `request.body` | the parsed body (e.g. a JSON object that was sent) | `{ name: 'Ada' }` for a POST with JSON `{"name":"Ada"}` — only once `express.json()` middleware is added |

Note all params and query values are **strings** (`'42'`, `'9'`).

`httpResponse` has methods for setting HTTP response fields:

- `response.write(content)` — build up the response body
- `response.status(code)` — set the status code
- `response.end()` — end the request by responding to it (the only actual response!)
- `response.send(content)` — write content, then end

The slide says methods should be chained: `response.status(code).write(content1).write(content2).end();`

> ⚠️ **Pitfall**: That exact chain throws `TypeError: response.status(...).write(...).write is not a function`. `status()` returns the response (chainable), but `write()` returns a boolean. Fix: `response.status(200); response.write('content1'); response.write('content2'); response.end();` (body: `content1content2`), or just `response.status(200).send(...)`.

### 4.4 Middleware

Middleware gives other software the ability to manipulate requests before your handler sees them. It's a function with a third parameter, `next`:

```js
expressApp.all(urlPath, function (request, response, next) {
  // Do whatever processing on request (or setting response)
  next(); // pass control to the next handler
});
```

Examples (slide 90): check if a user is logged in, else send an error and **don't** call `next()`; parse the body as JSON into `request.body`, then `next()`; sessions, cookies, compression, encryption. A login check (my version):

```js
expressApp.all('/secret', function (request, response, next) {
  if (request.query.token !== 'abc') { response.status(401).send('Not logged in'); return; }
  next();
});
expressApp.get('/secret', function (request, response) { response.send('secret data'); });
```

`GET /secret` → `401 Not logged in`; `GET /secret?token=abc` → `200 secret data`.

### 4.5 Example servers (slides 91–92)

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

`express.static` is section 3's file server in one line (`GET /133_class.json` returns the file); unmatched requests fall through, so `GET /` still reaches the `'/'` route.

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

`in4matx133` isn't shown on the slide; with a stub backed by `133_class.json`, `/students/list` returns `["Alice","Bob","Chester","Deepali","Eduardo","Francisco"]` (`send` turns an array into JSON), `/students/Bob` returns `{"_id":"Bob"}`, and `/students/Zed` logs `Student with _id:Zed not found.` and returns `400 Not found` (404 would fit better).

## 5. Express generator

A tool that creates an application skeleton with a directory structure isolating the components — not required, but a useful starting point.

```bash
npm install express-generator -g   # install the tool globally
express myapp                      # generate a skeleton (adds boilerplate + common dependencies)
cd myapp                           # cd into the project directory first
npm install                        # install dependencies
npm start                          # run it
```

What each part is for:

| Path | Role |
|---|---|
| `package.json`, `package-lock.json`, `node_modules/` | library management and installed libraries |
| `public/` | public-facing images, stylesheets and JavaScript files |
| `routes/` | files that handle your URL mappings |
| `views/` | pages that need to be rendered, written for a view engine (Pug) |
| `app.js` | sets up middleware, routers, etc. |
| `bin/www` | sets up the port to listen on; the file run by `npm start` |

**routes/index.js** (slide 96):

```js
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });   // variable passed to renderer
});

module.exports = router;                       // so another file can import your router
```

**Views and Pug** (slides 97–98): the *view engine* Pug generates HTML from indentation-based templates; `extends` imports another file, `= title` and `#{title}` insert the variable passed to the renderer.

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

With `title: 'Express'`, `GET /` on a freshly generated app returns exactly:

```html
<!DOCTYPE html><html><head><title>Express</title><link rel="stylesheet" href="/stylesheets/style.css"></head><body><h1>Express</h1><p>Welcome to Express</p></body></html>
```

**app.js** (slide 99) — import route files, add middleware, use the routes:

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

`app.use('/users', usersRouter)` mounts the router, so `router.get('/')` in `routes/users.js` answers `GET /users`.

**bin/www** (slide 100):

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

> 💡 **Key Insight**: Under the generator's folders it's still section 2's `http.createServer(...).listen(port)` — the Express `app` is just the request handler function.

> 🔗 **Go deeper**: [Express: application generator](https://expressjs.com/en/starter/generator.html) · [Pug: getting started](https://pugjs.org/api/getting-started.html)

## 6. Authentication vs. authorization

**Authentication** is establishing and verifying identity:

- **Identification** — who are you? (username, account number, …)
- **Authentication** — prove it! (password, PIN, …)

**Authorization** comes after: once we know who the user is, what are they allowed to access or modify?

- The app can define permissions **up front based on role**: a student can access their own grades but not modify them; a TA and a professor can access and modify everyone's grades.
- Or the app can **ask the user to grant** certain permissions: a Twitter app asking "can I Tweet on your behalf?"

**Multi-factor authentication** should mix things you **have/possess** and things you **know**:

| Example | Factor 1 | Factor 2 | 2FA? |
|---|---|---|---|
| ATM | ATM card (have) | PIN (know) | yes |
| Password + code via SMS/push | password (know) | code proves you possess your phone (have) | yes |
| Two passwords | know | know | **no** |

**Two passwords ≠ two-factor authentication.**

> 📝 **Practice**: [Question 1](#121-question-1-good-two-factor-authentication-slide-26)

## 7. Passwords and sharing data with a third party

The **password protocol**: send a login and password; the server checks them, okays you, then sends whatever data you're allowed to see (you ↔ Bank of America). You must trust the server to store your password securely.

To give a **third party** (Mint, a financial aggregator) your bank data, you *could* hand over your username and password — why is that a bad idea?

- Now you have to trust another service to manage your password.
- What if you don't want them to have full access — e.g., Mint may load your savings account but not your checking account?
- What if you want to revoke access later? Changing your password works, but isn't a good solution.

## 8. OAuth 2.0: terms and the four steps

**OAuth 2.0** (open authorization) supports users in granting access to third-party applications **without sharing their passwords** with them, and lets users **revoke** that access at any time.

History: OAuth 1.0 was complex (worse than 2.0), had security vulnerabilities and shouldn't be used anymore. Google, Twitter and Yahoo! teamed up to propose 2.0, which is **not compatible** with 1.0.

### 8.1 Terminology

| Term | Meaning |
|---|---|
| **Client** | the third-party app that wants the resource owner's resources (e.g., the app you develop) |
| **Resource owner** (user) | the person whose data is being accessed |
| **Resource server** | the app that stores the resources (Spotify, Google, Facebook) |
| **Authorization and token endpoints** | URIs the resource owner authorizes requests from |
| **Authorization code** | a string the client uses to request access tokens |
| **Access token** | a string the client uses to access resources (songs on Spotify, Tweets, …); **expires** after some time |
| **Refresh token** | once the access token expires, exchanged for a new access token |

### 8.2 The four steps (Spotify's authorization-code flow)

```mermaid
sequenceDiagram
  participant App as Application (your server)
  participant Acc as Spotify Accounts Service
  participant User
  participant API as Spotify Web API
  App->>Acc: 1. client_id, response_type, redirect_uri, state, scope
  Acc->>User: display scopes, prompt login (if required)
  User-->>App: log in, authorize: code, state
  App->>Acc: 2. client_id, client_secret, grant_type, code, redirect_uri
  Acc-->>App: access_token, token_type, expires_in, refresh_token
  App->>API: 3. access_token
  API-->>App: requested data (JSON object)
  App->>Acc: 4. refresh token
  Acc-->>App: new access_token (JSON object)
```

1. **Request authorization** — ask the user to connect your app to their Spotify account, requesting only the data you need (profile, listening history, …).
2. **Get access & refresh tokens** — a separate step because access tokens expire; the refresh token gets a new valid one.
3. **Make API calls** — pass the access token in a GET to an endpoint, e.g. `https://api.spotify.com/v1/me` → JSON (birthdate, email, profile image). Endpoints exist for artists, albums, tracks…, often with a subresource: `https://api.spotify.com/v1/albums/{id}`.
4. **Refresh the access token** — Spotify tokens expire after **one hour**; then every request returns **401 (Unauthorized)**. Why expire? **So a user can revoke their privileges.**

### 8.3 Registering your app

On the Spotify developer dashboard you **create a new ID** for your app (slides 48–49). It gives you:

- **Client ID** — the ID of your app, **not secret**
- **Client secret** — the secret code used to get an access token
- and you must specify the **redirect URI** — where Spotify returns the user to

> 🔗 **Go deeper**: [Wikipedia: OAuth 2.0](https://en.wikipedia.org/wiki/OAuth#OAuth_2.0) · [Spotify: Authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/) · [Spotify: Get current user's profile](https://developer.spotify.com/documentation/web-api/reference/users-profile/get-current-users-profile/) · [Spotify: Web API reference](https://developer.spotify.com/documentation/web-api/reference/) · [Spotify developer dashboard](https://developer.spotify.com/dashboard/)

## 9. OAuth 2.0 in your own Node/Express server

The slides walk through the flow for **server-side JavaScript** (Node.js/Express). Some parts of OAuth can be done in the browser, but in **A3 all browser-side requests go to a Node.js/Express server**, which talks to Spotify.

### 9.1 The architecture

- **Authorizing**: a link on the page goes to `https://accounts.spotify.com/authorize/`; after the OAuth flow Spotify redirects to **your webserver**, which, once it has the tokens, redirects back to the client-side page.
- **API requests**: the browser makes an **HTTP request to your server** asking it to make the API request; the server calls Spotify and forwards the response.

### 9.2 Step 1: requesting authorization

Make a page with a link to `https://accounts.spotify.com/authorize/` and pass arguments in the **query string**:

| Parameter | Value |
|---|---|
| `client_id` | public ID of your app |
| `response_type` | the string `code` |
| `redirect_uri` | where to return to |
| `scope` | which permissions to ask for |

```text
https://accounts.spotify.com/authorize?
  response_type=code&
  client_id=6d81b7a55e894abdbf53143fb2901573&
  scope=user-read-private%20user-read-email&
  redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback
```

Special characters must be escaped with `encodeURIComponent()`: `'http://localhost:8888/callback'` → `http%3A%2F%2Flocalhost%3A8888%2Fcallback`, and the space between scopes → `%20`.

**Handling the response**: the user clicks "okay" and the browser redirects back to your server with extra URL parameters — `http://localhost:8888/callback?code=...`. In Express, read it from `req.query` (`req.query.code`).

### 9.3 Step 2: trading the code for an access token

Why? **Any website could send a user to that authorize URL** — client IDs are public. Only our app knows the **client secret**, which proves the client ID is ours.

Make a **POST** to `https://accounts.spotify.com/api/token`: POST sends content in the **body** (cannot be read by someone watching your traffic), GET puts it in the URI.

| Part | Field | Value |
|---|---|---|
| body | `grant_type` | the string `authorization_code` |
| body | `code` | the code from the authorization response |
| body | `redirect_uri` | must be the same as before |
| header | `Authorization` | client ID and client secret concatenated, as a Buffer (base64) |
| header | `Content-Type` | `application/x-www-form-urlencoded` |

Building them (slide 73):

```js
params = new URLSearchParams();
params.append('grant_type', 'authorization_code');   // etc.

headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Authorization': 'Basic ' + Buffer.from(my_client_id + ':' +
      my_client_secret).toString('base64')
};
```

Slide bug: slides 73, 75 and 77 have curly quotes in code (`‘grant_type’`) — use straight quotes. `Buffer` is Node-only; the browser has `btoa`.

Try it below — the browser builds the step-1 link and the step-2 body and header (edit the scope and press Run):

```viz web-demo
{"title": "Slides 67–73 · building the OAuth request pieces (edit the scope and press Run)", "html": "<a id=\"auth\" href=\"#\">Authorize</a>\n<p>Hover the link to see its URL; the request pieces are in the console.</p>", "js": "// Step 1: the link your page sends the user to (slides 67–68)\nconst client_id = '6d81b7a55e894abdbf53143fb2901573';\nconst redirect_uri = 'http://localhost:8888/callback';\nconst scope = 'user-read-private user-read-email';\nconst authorizeURL = 'https://accounts.spotify.com/authorize?' +\n  'response_type=code' +\n  '&client_id=' + client_id +\n  '&scope=' + encodeURIComponent(scope) +\n  '&redirect_uri=' + encodeURIComponent(redirect_uri);\nconsole.log(authorizeURL);\ndocument.getElementById('auth').href = authorizeURL;\n\n// Step 2: what the server sends to /api/token (slides 72–73)\nconst params = new URLSearchParams();\nparams.append('grant_type', 'authorization_code');\nparams.append('code', 'AQD...code-from-callback');\nparams.append('redirect_uri', redirect_uri);\nconsole.log('body:', params.toString());\n// Node uses Buffer.from(...).toString('base64'); the browser equivalent is btoa\nconsole.log('Authorization: Basic ' + btoa(client_id + ':' + 'my_client_secret'));", "height": 90, "interactive": true}
```

Console output:

```text
https://accounts.spotify.com/authorize?response_type=code&client_id=6d81b7a55e894abdbf53143fb2901573&scope=user-read-private%20user-read-email&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback
body: grant_type=authorization_code&code=AQD...code-from-callback&redirect_uri=http%3A%2F%2Flocalhost%3A8888%2Fcallback
Authorization: Basic NmQ4MWI3YTU1ZTg5NGFiZGJmNTMxNDNmYjI5MDE1NzM6bXlfY2xpZW50X3NlY3JldA==
```

(Secret and code are placeholders; Node's `Buffer` gives the identical string.)

**The response body** has the **access token**, **expires in**, and the **refresh token**. Store them in a database; in A3, a text file (bad form, but easier).

> ⚠️ **Pitfall**: Base64 is an *encoding*, not encryption — anyone who sees that header can decode the secret, so it travels only from your server to Spotify.

### 9.4 Step 3: making an API request

Pass the access token in the header — like the client ID and secret, but no need to convert it:

```js
'Authorization': 'Bearer ' + access_token
```

then GET an endpoint such as `https://api.spotify.com/v1/me` or `https://api.spotify.com/v1/albums/{id}`.

### 9.5 Step 4: refreshing the token

Same endpoint (`/api/token`) and headers as step 2; body `grant_type=refresh_token&refresh_token=...`.

> 🔗 **Go deeper**: [Spotify: Authorization guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/) · [MDN: encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) · [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) · [w3schools: Buffer.from()](https://www.w3schools.com/nodejs/met_buffer_from.asp) · [Security StackExchange: GET vs POST, which is more secure?](https://security.stackexchange.com/questions/33837/get-vs-post-which-is-more-secure)

## 10. Same-origin policy

An **origin** is scheme + host + port. Sites in the same domain but on **different ports are technically different origins**, so the browser would normally stop our live-server page (one port) from reading data from a script running on another port (like the Twitter proxy, or the A3 Spotify server).

Slide 78's table, compared against `http://www.example.com/dir/page.html`:

| URL | Same origin? | Reason |
|---|---|---|
| `http://www.example.com/dir/page2.html` | ✅ | same scheme, host, port |
| `http://www.example.com/dir2/other.html` | ✅ | (path ignored) |
| `http://username:password@www.example.com/dir2/other.html` | ✅ | (credentials ignored) |
| `http://www.example.com:81/dir/other.html` | ❌ | port |
| `https://www.example.com/dir/other.html` | ❌ | scheme |
| `http://en.example.com/dir/other.html` | ❌ | host |
| `http://example.com/dir/other.html` | ❌ | host (exact match) |
| `http://v2.www.example.com/dir/other.html` | ❌ | host (exact match) |
| `http://www.example.com:80/dir/other.html` | depends | explicit port; browser-dependent |

The browser's URL parser agrees (it normalizes `:80`, http's default, to the same origin); `localhost:8080` vs `localhost:8888` gives `false`:

```viz web-demo
{"title": "Slide 78 · same origin or not? (new URL(...).origin)", "html": "<p>See the console.</p>", "js": "const base = 'http://www.example.com/dir/page.html';\nconst urls = [\n  'http://www.example.com/dir/page2.html',\n  'http://www.example.com/dir2/other.html',\n  'http://username:password@www.example.com/dir2/other.html',\n  'http://www.example.com:81/dir/other.html',\n  'https://www.example.com/dir/other.html',\n  'http://en.example.com/dir/other.html',\n  'http://example.com/dir/other.html',\n  'http://v2.www.example.com/dir/other.html',\n  'http://www.example.com:80/dir/other.html'\n];\nconsole.log('base origin:', new URL(base).origin);\nfor (const u of urls) {\n  const o = new URL(u).origin;\n  console.log(o === new URL(base).origin ? 'same     ' : 'DIFFERENT', o);\n}\n// Lecture setting: live-server on 8080 vs your Node/Express server on 8888\nconsole.log(new URL('http://localhost:8080/').origin === new URL('http://localhost:8888/').origin);", "height": 60}
```

**But** the Twitter proxy and the A3 Spotify server **allow connections from other ports** — a CORS middleware in Express (slide 79):

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

So if they were public on the web, **anyone** could use your credentials for Twitter/Spotify API requests.

> ⚠️ **Pitfall**: The same-origin policy is enforced **by the browser**. A server (Node, `curl`) can request any URL; that's exactly why the A3 design routes Spotify calls through your server.

> 📝 **Practice**: [Question 2](#123-question-2-which-can-make-an-http-request-to-the-spotify-api-slide-58)

> 🔗 **Go deeper**: [Wikipedia: Same-origin policy](https://en.wikipedia.org/wiki/Same-origin_policy) · [leftlogic/twitter-proxy](https://github.com/leftlogic/twitter-proxy)

## 11. OpenID Connect

Seen a "sign in with Google" button (or "Continue with Facebook/Apple" on Spotify's login)? That's **OpenID Connect**, an added layer on top of OAuth.

| Benefits | Drawbacks |
|---|---|
| no need to get an ID for every service | Facebook/Google/Apple/etc. gather (more) information about you and the websites you go to |
| only one password to remember/store | |

> 🔗 **Go deeper**: [OpenID Connect](https://openid.net/connect/)

## 12. In-class Questions & Demos (with Solutions)

### 12.1 Question 1: "good" two-factor authentication (slide 26)

Which of these is an example of "good" two-factor authentication?

- A. A government agency requiring a birth certificate and a passport
- B. A store requiring a membership card and a PIN
- C. A website requiring a password and a security question
- D. Two of the above
- E. All of the above

> ✍️ **Try it first.**

**Answer: B.** Good 2FA mixes a factor you *have* with one you *know*. A is two things you have (two documents); C is two things you know — the "two passwords ≠ 2FA" case. Only B pairs a card (have) with a PIN (know), so D and E are out. (The slides don't show the revealed poll results; this follows directly from slide 25.) Back to [section 6](#6-authentication-vs-authorization).

### 12.2 Demo 1: serve the student list from a JSON file (slides 14–15 · setup1 → solution1)

Task (comment in `setup1.js`): create a webpage in Node which returns the `"students"` field of `133_class.json` as a comma-separated list.

```json
{
  "students": ["Alice", "Bob", "Chester", "Deepali", "Eduardo", "Francisco"],
  "quarter": "Fall",
  "year": 2019
}
```

Starter (`setup1.js`) — a server that answers every request with fixed text:

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

> ✍️ **Try it first.**

**Answer** (`solution1.js`): read the file inside the handler, parse it, `join` the array:

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

`node solution1.js` (from the folder holding the JSON), then `localhost:8080`:

```text
Alice, Bob, Chester, Deepali, Eduardo, Francisco
```

Key points: `res.end` goes **inside** the callback (outside, it would respond before the file is read); `join(', ')` is Python's `', '.join(...)`. Run from another directory, it returns 404 `ENOENT` — use `__dirname`. Back to [section 3](#3-reading-files-with-node).

> 🧪 **Demo files**: [setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/setup1.js) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W4_L2_Oct22_ServerAuth/solution1.js)

### 12.3 Question 2: which can make an HTTP request to the Spotify API? (slide 58)

Which can make an HTTP request to the Spotify API? (Assume the browser uses default settings.)

1. A browser open to spotify.com
2. A browser with client-side JavaScript at localhost:8888
3. A browser with server-side JavaScript at localhost:8888
4. A server running in the Spotify domain

- A. 4
- B. 1, 4
- C. 1, 2, 4
- D. 1, 3, 4
- E. 1, 2, 3, 4

> ✍️ **Try it first.**

**Answer: D (1, 3, 4)** — the answer the lecture's model gives; the slides don't show the revealed results.

- (1) ✅ treated as same-origin ("the Spotify domain"; strictly, by slide 78, `spotify.com` ≠ `api.spotify.com`).
- (2) ❌ client-side JS from `localhost:8888` is another origin; the browser blocks it.
- (3) ✅ the browser asks *your* server, and the server makes the request — servers aren't bound by the policy ([the A3 architecture](#91-the-architecture)).
- (4) ✅ a server, in the same domain anyway.

The trap is (2) vs (3): same port, different sender. (A server can opt in to other origins with CORS headers, slide 79; the question assumes it doesn't.) Back to [section 10](#10-same-origin-policy).

## 13. Quick Reference & Top 5 Things to Remember

**Node & Express**

| Code | Does |
|---|---|
| `http.createServer((req, res) => {...}).listen(8080)` | Node server; `res.writeHead(200)`, `res.end(body)` |
| `fs.readFile(path, (err, data) => {...})` | async read; `data` is a Buffer; use `__dirname` |
| `app.get/post/put/delete/all(path, fn)` | Express route; `'/user/:user_id'` for params |
| `req.params`, `req.query`, `req.body` | route params, query string, parsed body (`express.json()`) |
| `res.status(c)`, `res.write(x)`, `res.end()`, `res.send(x)` | `write` returns a boolean, so don't chain after it |
| `app.use((req, res, next) => {...})` | middleware; call `next()` to continue |
| `express.static(dir)`, `express.Router()`, `res.render(view, vars)` | static files, route files, Pug views |
| `npm install express-generator -g` → `express` → `npm install` → `npm start` | generator skeleton |

**OAuth 2.0 (Spotify)**

| Step | Request | Key fields |
|---|---|---|
| 1. Authorize | link → `accounts.spotify.com/authorize?...` | `client_id`, `response_type=code`, `redirect_uri`, `scope` → back with `?code=` |
| 2. Tokens | POST `accounts.spotify.com/api/token` | body `grant_type=authorization_code`, `code`, `redirect_uri`; header `Authorization: Basic base64(id:secret)`, `Content-Type: application/x-www-form-urlencoded` |
| 3. API call | GET `api.spotify.com/v1/me` etc. | header `Authorization: Bearer <access_token>` |
| 4. Refresh | POST `accounts.spotify.com/api/token` | body `grant_type=refresh_token`, `refresh_token`; same headers |

**Top 5 things to remember**

1. Node.js is server-side JavaScript: `console.log` goes to the terminal; it has files and ports but no DOM.
2. Authentication = prove who you are; authorization = what you may do. Good 2FA = *have* + *know*.
3. OAuth: authorize (code) → POST code + **client secret** for tokens → API calls with `Bearer` → refresh after expiry (1 h, then 401). Expiry lets users revoke.
4. Client ID is public; the secret stays on your server — why A3 routes through Node/Express.
5. Origin = scheme + host + port. The browser enforces the same-origin policy, servers don't; CORS lets a server opt in.
