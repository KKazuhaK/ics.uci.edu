# IN4MATX 133: User Interface Software — Lecture 5：JavaScript 2

## 目录

- [1. JavaScript 的角色](#1-javascript-的角色)
- [2. 加载、输出与语法](#2-加载输出与语法)
- [3. 变量与类型](#3-变量与类型)
- [4. 条件、循环与字符串](#4-条件循环与字符串)
- [5. 数组](#5-数组)
- [6. 对象与 JSON](#6-对象与-json)
- [7. 函数](#7-函数)
- [8. 函数也是对象](#8-函数也是对象)
- [9. 传递函数与回调](#9-传递函数与回调)
- [10. forEach、map、filter 与 reduce](#10-foreachmapfilter-与-reduce)
- [11. 作用域、变量提升、let 与 var](#11-作用域变量提升let-与-var)
- [12. 课堂问题与演示（附解答）](#12-课堂问题与演示附解答)
- [13. 速查与必记的 5 个要点](#13-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，周四 10/8。内容整理自 Lecture 5 的幻灯片（共 62 页）和 demo 仓库文件夹 `W2_L2_Oct8_JavaScript`。按概念组织，而不是按来源组织。

> 📅 **课程安排**：A1 的截止时间是周一晚上 11:59。
> A2 已经发布：尽早开始，同学们普遍觉得它比 A1 难得多。有问题请发到 `#assignment2` Slack 频道，包含 A2 全部相关内容的课件已经上传。

幻灯片 53–62 位于结尾页（“Some useful JavaScript methods and important notes”）之后；它们的内容已并入下面各节，并标注为“（附录）”。

---

## 1. JavaScript 的角色

三种网页语言各司其职（幻灯片 5–6）：

| 语言 | 类型 | 作用 |
|---|---|---|
| HTML | 标记语言（markup language） | 指定内容如何呈现 |
| CSS | 样式语言（styling language） | 为内容设置视觉样式 |
| JavaScript | 编程语言 | 动态地操作内容 |

**为什么要用 JavaScript？**它让页面变得**动态**、**个性化**，并且能够与**其他数据源**（如数据库和 API）**交互**（幻灯片 7）。幻灯片 8 展示了 GitHub 的“2023–2025 年 GitHub 十大编程语言”图表：JavaScript 在 2025 年之前一直排名第一，2025 年 TypeScript（带类型的 JavaScript，见 [Lecture 7](lec-07.zh-CN.md)）升到第一，Python 和 JavaScript 紧随其后。

尽管名字相似，JavaScript 并不是 Java（幻灯片 9–10），它和 Python 反而有更多共同点（幻灯片 11）：

| JavaScript | Java |
|---|---|
| 解释型语言 | 编译型语言（编译成字节码） |
| 由 JavaScript 引擎执行 | 在 Java 虚拟机（JVM）中运行 |
| 引擎直接运行程序员写的代码 | 字节码人类无法阅读 |
| 通过 ECMAScript 标准化，但各实现之间仍有差异 | “Write once, deploy anywhere”（一次编写，到处部署） |
| 调试取决于执行环境 | 错误在编译时发现 |
| 所有浏览器都内置支持，无需插件 | 在大多数浏览器中需要插件才能运行 |

| JavaScript | Python |
|---|---|
| **动态**类型 | **动态**类型 |
| 广泛用于**前端**网页开发 | 广泛用于**后端**网页开发 |
| 用**分号** `;` 和**花括号** `{ }` 划分代码块 | 用**缩进**划分代码块 |

幻灯片 12 的结论：**JavaScript 只是一门编程语言。**

> 🔗 **深入阅读**：[GitHub Octoverse (language rankings)](https://octoverse.github.com/) · [freeCodeCamp: Python vs JavaScript](https://www.freecodecamp.org/news/python-vs-javascript-what-are-the-key-differences-between-the-two-popular-programming-languages/)

---

## 2. 加载、输出与语法

**加载。**和外部样式表一样，脚本通过链接引入页面（幻灯片 13）：

```html
<html>
  <head>
    <script src="test.js"></script>
  </head>
</html>
```

**输出。**`console.log` 写入的是 **JavaScript Console（控制台）**，而不是页面（幻灯片 14）：

```js
console.log("Hello, world!");
```

它不会显示在页面中；需要打开开发者工具才能看到（幻灯片 14 的截图：Safari 的 Develop 菜单 → JavaScript Console）。

**语法**（幻灯片 15）：JavaScript 有函数和对象；它们**看起来像 Java，但行为不同**。它使用封装（encapsulation）等面向对象原则。如果感到困惑，可以问自己：这和我已经掌握的语言与 OOP 原则有什么联系？*具体*不同在哪里？

仓库中的 `lecture.html` 会加载 `lecture.js`，后者在控制台中运行本讲的所有代码片段。

> 🧪 **Demo 文件**：[lecture.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/lectureExamples/lecture.html) · [lecture.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/lectureExamples/lecture.js)

> 🔗 **深入阅读**：[Douglas Crockford on JavaScript](https://www.crockford.com/javascript/javascript.html)

---

## 3. 变量与类型

变量是**动态类型**的：类型属于值，而不属于变量，所以同一个变量可以先存字符串、再存数字。`typeof` 可以告诉你当前的类型。已声明但**未赋值的变量，其值为 `undefined`**（幻灯片 16）：

```js
var x = 'hello'; //value is a string
console.log(typeof x); //string

x = 42; //value is now a Number
console.log(typeof x); //number

var hoursSlept;
console.log(hoursSlept); // undefined
```

`lecture.js` 还有一个后续例子：对这个未赋值的变量执行 `hoursSlept += 2;`，会输出 **`NaN`**（`undefined + 2`）。如果先取消注释 `hoursSlept = 2;`，结果则是 `4`。

**类型转换（type coercion）**（幻灯片 17）。JavaScript 会悄悄地转换类型：

```js
console.log('40' + 2); //'402'
console.log('40' - 4); //36

var num = 10;
var str = '10';

//comparisons: these will all be booleans (true/false)
console.log(num == str); //true
console.log(num === str); //false
console.log('' == 0); //true
```

- `+` 遇到字符串时会**拼接**，所以 `'40' + 2` 是字符串 `'402'`。
- 字符串没有定义减法，所以 JavaScript 知道要把 `'40'` 转换成数字：结果为 `36`。
- `==` 会先转换两边的类型再比较（`10 == '10'`，甚至 `'' == 0`）。`===` 是**严格**比较：同时比较类型。请使用 `===`。

**null、undefined 与 NaN**（附录，幻灯片 54–56）：

| 值 | 含义 | `typeof` | 是否为 falsy？ |
|---|---|---|---|
| `null` | 一个不存在的对象：它是对象，只是未初始化 | `object` | 是，但 `null == false` 为 `false` |
| `undefined` | 一个未定义的原始值（就像数字或字符串是原始值） | `undefined` | 是，但 `undefined == false` 为 `false` |
| `NaN` | Not a Number：对 `undefined` 做任何运算或任何其他不可能的运算的结果 | `number`（尽管名字如此） | 是 |

```js
console.log('12' - 5); // 7
console.log('word' - 5);// NaN
console.log(undefined * 3);// NaN
console.log(typeof NaN);// number
if(NaN) {
console.log("It's not falsy!");
}
```

`if(NaN)` 代码块**什么都不会打印**：`NaN` 是 falsy。（`!nullObj` 和 `!undefinedObj` 都为 true，所以幻灯片 54–55 中的 `"It's falsy"` 那几行会正常打印。）

逐步运行幻灯片中的代码（可以编辑后点击 Run 试试你自己的代码）：

```viz web-demo
{"title": "Slides 16–17 · lecture.js (variables and types)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "var x = 'hello'; //value is a string\nconsole.log(typeof x); //string\nx = 42; //value is now a Number\nconsole.log(typeof x); //number\n\nvar hoursSlept;\nconsole.log(hoursSlept);\n//hoursSlept = 2; // try uncommenting this\nhoursSlept += 2;\nconsole.log(hoursSlept);", "steps": [{"note": "Coercion: + joins strings, - converts to numbers.", "js": "\nconsole.log('40' + 2); //'402'\nconsole.log('40' - 4); //36"}, {"note": "== converts before comparing; === also compares the type.", "js": "\nvar num = 10;\nvar str = '10';\nconsole.log(num == str); //true\nconsole.log(num === str); //false\nconsole.log('' == 0); //true"}, {"note": "Slides 54–56: null, undefined and NaN.", "js": "\nvar nullObj = null;\nconsole.log(typeof nullObj); //object\nconsole.log(nullObj == false); //false\nconsole.log(typeof undefined); //undefined\nconsole.log('12' - 5); // 7\nconsole.log('word' - 5); // NaN\nconsole.log(undefined * 3); // NaN\nconsole.log(typeof NaN); // number\nif(NaN) {\n  console.log(\"It's not falsy!\");\n}"}]}
```

> ⚠️ **易错点**：`'40' + 2` 是 `'402'`，但 `'40' - 4` 是 `36`。从页面或表单读到的值都是字符串，所以“相加”实际上是拼接。而且 `==` 会掩盖类型不匹配：`'' == 0` 为 `true`。

> 🔗 **深入阅读**：[codeburst: Understanding null, undefined and NaN](https://codeburst.io/understanding-null-undefined-and-nan-b603cb74b44c)

---

## 4. 条件、循环与字符串

`if` / `else if` / `else` 以及 C 风格的 `for` 循环和 C++ 很像（幻灯片 18）：

```js
var i = 4.4;

if(i > 5) {
 console.log('i is bigger than 5');
} else if(i >= 3) {
 console.log('i is between 3 and 5');
} else {
 console.log('i is less than 3');
}

for(var x = 0; x < 5; x++) {
 console.log(x);
}
```

输出：`i is between 3 and 5`，然后 `0 1 2 3 4` 各占一行。（`lecture.js` 在循环里输出的是 `i` 而不是 `x`，所以仓库里的代码会把 `4.4` 打印五次；幻灯片上的 `x` 才是本意。）

**方法**用点号记法调用（幻灯片 19）；`toUpperCase()` 返回一个新字符串，所以要把结果赋值回去：

```js
var className = 'in4matx 133';
console.log(className);

className = className.toUpperCase();
console.log(className);

var part = className.substring(1, 4);
console.log(part);

console.log(className.indexOf('MATX') >= 0); //whether the substring appears
```

输出（与幻灯片 19 的控制台截图一致）：`in4matx 133`、`IN4MATX 133`、`N4M`（`substring(1, 4)` 取下标 1–3，不含结束位置，类似 Python 的 `s[1:4]`）、`true`（`indexOf` 返回位置，若不存在则返回 `-1`）。

**字符串格式化**（幻灯片 20）：用**反引号**代替引号包住字符串，并用 `${...}` 插入变量，类似 Python 的 f-string：

```js
var className = 'in4matx 133';
console.log(`the class name is: ${className}`); // the class name is: in4matx 133
```

```viz web-demo
{"title": "Slides 18–20 · lecture.js (conditionals, loops, string methods, template literals)", "html": "<p>See the console.</p>", "height": 60, "js": "var i = 4.4;\n\nif(i > 5) {\n\tconsole.log('i is bigger than 5');\n} else if(i >= 3) {\n\tconsole.log('i is between 3 and 5');\n} else {\n\tconsole.log('i is less than 3');\n}\n\nfor(var x = 0; x < 5; x++) {\n\tconsole.log(x);\n}\n\nvar className = 'in4matx 133';\nconsole.log(className);\nclassName = className.toUpperCase();\nconsole.log(className);\nvar part = className.substring(1, 4);\nconsole.log(part);\nconsole.log(className.indexOf('MATX') >= 0); //whether the substring appears\nconsole.log(`the class name is: ${className}`);"}
```

> ⚠️ **易错点**：`${…}` 只在反引号内有效。在 `'单引号'` 或 `"双引号"` 中，它会被原样打印出来。

---

## 5. 数组

数组和 Java 的数组（以及 Python 的 list）类似，但**可以混合不同类型**，也可以嵌套（幻灯片 21）。用 `[]` 访问和赋值；**越界赋值会自动扩展数组**，中间留下空槽：

```js
var letters = ['a', 'b', 'c'];
var numbers = [1, 2, 3];
var things = ['raindrops', 2.5, true, [5, 9, 8]]; //arrays can be nested
var empty = [];
var blank5 = new Array(5); //empty array with 5 items

//access using [] notation like Java
console.log( letters[1] ); //=> "b"
console.log( things[3][2] ); //=> 8

//assign using [] notation like Java
letters[0] = 'z';
console.log( letters ); //=> ['z', 'b', 'c']

//assigning out of bounds automatically grows the array
letters[10] = 'g';
console.log( letters);
    //=> [ 'z', 'b', 'c', , , , , , , , 'g' ]
console.log( letters.length ); //=> 11
```

控制台会把空档显示为 `<7 empty items>`（Node）或 `empty × 7`（Chrome）；读取空槽得到 `undefined`（Python 则会抛出 `IndexError`）。

数组有自己的方法（幻灯片 22）：

```js
//Make a new array
var array = ['i','n','f','x'];

//add item to end of the array
array.push('133');
console.log(array); //=> ['i','n','f','x','133']

//combine elements into a string
var str = array.join('-');
console.log(str); //=> "i-n-f-x-133"

//get index of an element (first occurrence)
var oIndex = array.indexOf('x'); //=> 3

//remove 1 element starting at oIndex
array.splice(oIndex, 1);
console.log(array); //=> ['i','n','f','133']
```

更多有用的数组方法（附录，幻灯片 57）：

- 数组具有栈的操作：`.push()` 和 `.pop()` 分别在**末尾**添加和移除元素。
- `.concat()` 用于合并数组：`[1, 2].concat([3, 4])` → `[ 1, 2, 3, 4 ]`。
- `.sort()` 默认“按字母顺序/数值顺序”排序，但可以传入一个**比较函数（comparator）**。例如，按对象的 `count` 属性排序：

```js
array.sort(function(a, b) {
return a.count - b.count;
});
```

比较函数在 `a` 应排在前面时返回负数，在 `b` 应排在前面时返回正数。

```viz web-demo
{"title": "Slides 21–22 · lecture.js (arrays)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "var letters = ['a', 'b', 'c'];\nvar things = ['raindrops', 2.5, true, [5, 9, 8]]; //arrays can be nested\n\nconsole.log( letters[1] ); //=> \"b\"\nconsole.log( things[3][2] ); //=> 8\n\nletters[0] = 'z';\nconsole.log( letters ); //=> ['z', 'b', 'c']", "steps": [{"note": "Assigning out of bounds grows the array; the gap is empty slots.", "js": "\nletters[10] = 'g';\nconsole.log( letters );\nconsole.log( letters.length ); //=> 11"}, {"note": "push, join, indexOf, splice (slide 22).", "js": "\nvar array = ['i','n','f','x'];\narray.push('133');\nconsole.log(array);\nvar str = array.join('-');\nconsole.log(str);\nvar oIndex = array.indexOf('x'); //=> 3\narray.splice(oIndex, 1);\nconsole.log(array);"}, {"note": "Slide 57: pop, concat, and sort with and without a comparator.", "js": "\nconsole.log(array.pop(), array);\nconsole.log([1, 2].concat([3, 4]));\nconsole.log([10, 9, 1].sort()); // compares as strings!\nconsole.log([10, 9, 1].sort(function(a, b) { return a - b; }));"}]}
```

> ⚠️ **易错点**：默认的 `.sort()` 会把元素**当作字符串**比较，数字也不例外：`[10, 9, 1].sort()` 得到 `[ 1, 10, 9 ]`。要对数字排序，请传入 `function(a, b) { return a - b; }`。

> 📝 **练习**：[演示 1](#121-演示-1求和并统计偶数幻灯片-23--setup1--solution1)（push、求和、统计偶数）· [问题 1](#122-问题-1控制台会显示什么幻灯片-2426)（追踪一个数组）

> 🔗 **深入阅读**：[Medium: 10 useful JavaScript array methods](https://medium.com/@DaphneWatson/10-useful-javascript-array-methods-8ffe22e7a959)

---

## 6. 对象与 JSON

JavaScript 的**对象（object）**是一组无序的键值对：类似 Java 中的 HashMap 或 **Python 中的字典**。它们有时也被称为**关联数组（associative arrays）**（幻灯片 27）。键两边的引号是可选的：

```js
ages = {alice:40, bob:35, charles:13}
extensions = {'daniel':1622, 'in4matx':9937}
num_words = {1:'one', 2:'two', 3:'three'}
things = {num:12, dog:'woof', list:[1,2,3]}
empty = {}
empty = new Object(); //empty object
```

**方括号访问**（幻灯片 28）：值（或称*属性*）用 `array[]` 语法引用。与 Python 不同，访问不存在的键**不会报错**，而是得到 `undefined`。给一个新键赋值就会添加它：

```js
//access ("look up") values
console.log( ages['alice'] ); //=> 40
console.log( ages['bob'] ); //=> 35
console.log( ages['charles'] ); //=> 13

//keys not in the object have undefined values
console.log( ages['fred']); //=> undefined

//assign values
ages['alice'] = 41;
console.log( ages['alice'] ); //=> 41

ages['fred'] = 19; //adds the key and assigns
                   //a value to it
```

**点号记法**（幻灯片 29）效果相同，并且可以链式访问嵌套的对象和数组：

```js
var person = {
  firstName: 'Alice',
  lastName: 'Smith',
  favorites: {
    food: 'pizza',
    numbers: [12, 42]
  }
};

var name = person.firstName; //get value of 'firstName' key
person.lastName = 'Jones'; //set value of 'lastName' key
console.log(person.firstName+' '+person.lastName); //"Alice Jones"

var topic = 'food'
var favFood = person.favorites.food; //object in the object
              //object         //value

var firstNumber = person.favorites.numbers[0]; //12
person.favorites.numbers.push(7); //push 7 onto the Array
```

当键存储在变量里时（幻灯片中的 `topic`），要用方括号：`person.favorites[topic]`；`.topic` 会去找名为 `topic` 的键。

**常用的对象方法**（附录，幻灯片 58）：`Object.keys(obj)` 返回键组成的数组（顺序不保证），`Object.values(obj)` 返回值组成的数组，`Object.entries(obj)` 返回 `[key, value]` 对组成的数组：

```js
obj = { pet1: 'Dog', pet2: 'Cat' };
console.log(Object.entries(obj));
// [ ["pet1", "Dog"], ["pet2", "Cat"] ]
```

```viz web-demo
{"title": "Slides 27–29, 58 · lecture.js (objects)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "ages = {alice:40, bob:35, charles:13}\n\nconsole.log( ages['alice'] ); //=> 40\nconsole.log( ages['fred']); //=> undefined\nages['alice'] = 41;\nconsole.log( ages['alice'] ); //=> 41\nages['fred'] = 19; //adds the key\n\nvar person = {\n  firstName: 'Alice',\n  lastName: 'Smith',\n  favorites: {\n    food: 'pizza',\n    numbers: [12, 42]\n  }\n};\nperson.lastName = 'Jones';\nconsole.log(person.firstName+' '+person.lastName); //\"Alice Jones\"\nconsole.log(person.favorites.food);\nperson.favorites.numbers.push(7);\nconsole.log(person.favorites.numbers);", "steps": [{"note": "Slide 58: Object.keys / values / entries.", "js": "\nconsole.log(Object.keys(ages));\nconsole.log(Object.values(ages));\nobj = { pet1: 'Dog', pet2: 'Cat' };\nconsole.log(Object.entries(obj));"}]}
```

**JSON**（JavaScript Object Notation，幻灯片 30）是基于这种对象语法的文本格式，许多 API 用它来发送和接收数据。在 JSON 中，键**必须**用双引号括起来：

```json
{
  "first_name": "Alice",
  "last_name": "Smith",
  "age": 40,
  "pets": ["rover", "fluffy", "mittens"],
  "favorites": {
    "music": "jazz",
    "food": "pizza",
    "numbers": [12, 42]
  }
}
```

> 🔗 **深入阅读**：[w3schools: JSON](https://www.w3schools.com/js/js_json.asp) · [codeburst: Useful JavaScript array and object methods](https://codeburst.io/useful-javascript-array-and-object-methods-6c7971d93230)

---

## 7. 函数

JavaScript 中的函数类似 Java 的静态方法（幻灯片 31）：不需要类，**没有访问修饰符，也没有返回类型**，并且**参数没有类型**（参数之间用逗号分隔）：

```js
//JavaScript
function sayHello(name){
    return "Hello, "+name;
}
var msg = sayHello("IN4MATX 133");
```

（幻灯片把它和 Java 版本并排展示：`public static String sayHello(String name)`，从 `main` 中调用。）

**所有参数都是可选的**（幻灯片 32）。缺少的参数是 `undefined`；多余的参数会被忽略。两种情况都不会报错：

```js
function sayHello(name)
{
    return "Hello, "+name;
}

//expected; parameter is assigned a value
sayHello("In4MATX 133"); //"Hello, IN4MATX 133"

//parameter not assigned value (left undefined)
sayHello(); //"Hello, undefined"

//extra parameters (values) are not assigned
//to variables, so are ignored
sayHello("IN4MATX","133"); //"Hello, IN4MATX"
```

实际输出：`Hello, In4MATX 133`（幻灯片注释里的大小写和传入的参数不一致）、`Hello, undefined`、`Hello, IN4MATX`。

> ⚠️ **易错点**：在 JavaScript 中，传入错误数量的参数不是错误（Python 和 C++ 会拒绝）。忘记传的参数会在之后以 `undefined` 或 `NaN` 的形式冒出来。

---

## 8. 函数也是对象

“接下来是令人困惑的部分……”（幻灯片 33）：**函数是一个值**，和数组一样。幻灯片把两者并排对比：

| 数组（幻灯片 34–36，左侧） | 函数（右侧） |
|---|---|
| `var other = myArray;` 然后 `other[1]` → `'b'` | `var other = sayHello;` 然后 `other('everyone')` → 输出 `Hello, everyone` |
| 第二个变量，指向同一个数组 | `var greet = sayHello2;` 第二个变量，指向同一个函数对象 |
| `obj.array = myArray;` 然后 `obj.array[0]` → `'a'` | `obj.sayHi = sayHello;` 然后 `obj.sayHi('all')` → 输出 `Hello, all` |
| `obj.otherArray = [1,2,3]`（赋值一个字面量） | `obj.otherFunc = function() {…}`（赋值一个函数字面量） |

```js
//assign function to variable
var sayHello2 = function(name) {
   console.log("Hello, "+name);
}

//second variable, same object
var greet = sayHello2;

//execute object named `greet`
greet('everyone');
    //prints "Hello, everyone"

var obj = {}
//assign function to object
obj.sayHi = sayHello;
//access with dot notation
obj.sayHi('all'); //prints "Hello all"

//assign literal (anonymous value)
obj.otherFunc = function() {
    console.log("Hello world!");
}
```

最后一段代码就是**“非静态”方法的创建方式**（幻灯片 36）：把函数存为对象的属性，并通过该对象调用。（`obj.sayHi('all')` 的实际输出是 `Hello, all`，带逗号。）

**匿名值（anonymous values）**（幻灯片 37–39）。直接传给 `console.log` 的 `[4,5,6]` 就是匿名值：它没有变量名。函数也可以是匿名的：

```js
//named function
function sayHello(person){
   console.log("Hello, "+person);
}

//anonymous function (no name!)
function(person) {
   console.log("Hello, "+person);
}

//anonymous function (value) assigned to variable
var sayHello = function(person) {
   console.log("Hello, "+person);
}

//anonymous functions often follow an "arrow" (abbreviated) syntax
var sayHello = (person) => {
   console.log("Hello, "+person);
}

sayHello('IN4MATX 133');
```

中间那段代码只是用来说明：单独一行没有名字的 `function(person) {…}` 会触发 **SyntaxError**（“Function statements require a function name”）。匿名函数总是作为值使用：被赋值、被存储或被传递。

**`this` 关键字**（幻灯片 40）：`this` 通常指调用该方法的那个对象。幻灯片中的例子：

```js
var alice = {
  first: 'Alice',
  last: 'Jones',
  sayHello:()=> {
    console.log("Hello, I'm " + this.first);
  }
};

alice.sayHello(); //=> "Hello, I'm Alice"
```

幻灯片中的错误：按原样运行会输出 **`Hello, I'm undefined`**，因为箭头函数没有自己的 `this`（它使用外层的 `this`，这里是全局的 `window`）。如果改成 `sayHello: function() {…}`，则输出 `Hello, I'm Alice`。箭头函数所“保留”的，是外层方法的 `this`，前提是箭头函数写在该方法*内部*。下面的第 3 步同时展示了这两种情况。

```viz web-demo
{"title": "Slides 31–41 · lecture.js (functions are values)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "function sayHello(name) {\n    return \"Hello, \"+name;\n}\nconsole.log(sayHello(\"In4MATX 133\"));\nconsole.log(sayHello());\nconsole.log(sayHello(\"IN4MATX\",\"133\"));", "steps": [{"note": "A function is a value: store it in another variable or an object property.", "js": "\nvar other = sayHello;\nconsole.log(other('everyone'));\nvar obj = {};\nobj.sayHi = sayHello;\nconsole.log(obj.sayHi('all'));\nobj.otherFunc = function() {\n    return \"Hello world!\";\n}\nconsole.log(obj.otherFunc());"}, {"note": "Arrow syntax (slide 39).", "js": "\nvar sayHello2 = (person) => {\n   console.log(\"Hello, \"+person);\n}\nsayHello2('IN4MATX 133');"}, {"note": "Slide 40's code as written: an arrow method does NOT get the object as this.", "js": "\nvar alice = {\n  first: 'Alice',\n  sayHello:()=> {\n    console.log(\"Hello, I'm \" + this.first);\n  }\n};\nalice.sayHello();\nvar alice2 = {\n  first: 'Alice',\n  sayHello: function() {\n    console.log(\"Hello, I'm \" + this.first);\n  }\n};\nalice2.sayHello();"}, {"note": "Passing functions (slide 41): no parentheses when passing.", "js": "\nvar doAtOnce = function(funcA, funcB) {\n    funcA();\n    console.log(' and ');\n    funcB();\n    console.log(' at the same time! ');\n}\nvar patHead = function(name) {\n    console.log(\"pat your head\");\n}\nvar rubBelly = function(name) {\n    console.log(\"rub your belly\");\n}\ndoAtOnce(patHead, rubBelly);"}]}
```

> ⚠️ **易错点**：如果对象方法里用到了 `this`，就不要把它写成箭头函数；请使用 `function`（或简写形式 `sayHello() {…}`）。

---

## 9. 传递函数与回调

由于函数是对象，它们可以像变量一样被**传递**（幻灯片 41）。传递函数时**不要加括号**：`patHead` 是函数本身，而 `patHead()` 会立刻调用它并传入其返回值。

```js
//anonymous function syntax
var doAtOnce = function(funcA, funcB) {
    funcA();
    console.log(' and ');
    funcB();
    console.log(' at the same time! ');
}

var patHead = function(name) {
    console.log("pat your head");
}

var rubBelly = function(name) {
    console.log("rub your belly");
}

doAtOnce(patHead, rubBelly);
```

输出：`pat your head`、` and `、`rub your belly`、` at the same time! `。

**回调函数（callback function）**是传给*另一个*函数、由后者“回头调用”并执行的函数（幻灯片 42）：

```js
function doLater(callback) {   // takes in a callback
  console.log("I'm waiting a bit...");
  console.log("Okay, time to work!");
  callback();
}

function doHomework() {
  ...
};

doLater(doHomework);           // pass in the callback function
```

假设 `doHomework` 会输出一些内容，则先打印两行等待信息，再打印作业那一行。

浏览器的 `setTimeout(callback, ms)` 就是一个回调 API：它在 `ms` 毫秒之后调用传入的函数。幻灯片 43 的课堂演示用它在 5 秒后打印一条消息，并每秒交替输出 “tick”/“tock”（见[演示 2](#123-演示-2来自未来的问候与-tick-tock幻灯片-43--setup2--solution2)）。

> 📝 **练习**：[演示 2](#123-演示-2来自未来的问候与-tick-tock幻灯片-43--setup2--solution2)（setTimeout 回调）

---

## 10. forEach、map、filter 与 reduce

数组的常见循环操作都接受回调函数（即**函数式编程**工具）。

**forEach**（幻灯片 44）：要遍历每个元素，调用 `forEach` 并传入一个函数，它会对每个数组元素调用该函数：

```js
//Iterate through an array
var array = ['a','b','c'];
var printItem = function(item) {
   console.log(`item: ${item}`);
}

array.forEach(printItem);   // printItem is the callback

//more common to use anonymous function
array.forEach(function(item) {
   console.log(`item: ${item}`);
});
```

两种写法都会输出 `item: a`、`item: b`、`item: c`。

**map**（幻灯片 45）对每个元素应用该函数，并返回由其返回值组成的**新数组**：

```js
var array = [1,2,3];
var squared = function(n) {
   return n*n;
};

array = array.map(function(n) {
   return n*n;
});
//array becomes [1,4,9]
```

（幻灯片定义了 `squared`，但随后传入的是一个相同的匿名函数；`array.map(squared)` 效果一样。）

**filter**（幻灯片 46）返回一个新数组，**只包含使函数返回 true 的元素**：

```js
var array = [3,1,4,2,5];

var isACrowd = array.filter(function(n) {
   return n >= 3;
}); //returns [3,4,5]
```

**reduce**（幻灯片 47）对每个元素应用函数来更新一个**累加器（accumulator）**。回调接收 `(accumulator, current)`，并且必须**返回**更新后的累加器；`reduce` 的第二个参数是初始值：

```js
var array = [1,2,3,4];

var sum = array.reduce(function(total, current) {
   var newTotal = total + current;
   return newTotal;
}, 0); //returns 1+2+3+4=10
```

| JavaScript | Python | 返回值 |
|---|---|---|
| `arr.forEach(f)` | `for x in arr: f(x)` | `undefined` |
| `arr.map(f)` | `[f(x) for x in arr]` | 新数组，长度相同 |
| `arr.filter(f)` | `[x for x in arr if f(x)]` | 新数组，可能更短 |
| `arr.reduce(f, init)` | `functools.reduce(f, arr, init)` | 一个值 |

```viz web-demo
{"title": "Slides 44–47 · lecture.js (forEach, map, filter, reduce)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "var array = ['a','b','c'];\narray.forEach(function(item) {\n   console.log(`item: ${item}`);\n});", "steps": [{"note": "map returns a NEW array of what the callback returns.", "js": "\nvar nums = [1,2,3];\nvar squares = nums.map(function(n) {\n   return n*n;\n});\nconsole.log(squares, nums);"}, {"note": "filter keeps the elements whose callback returns true.", "js": "\nvar isACrowd = [3,1,4,2,5].filter(function(n) {\n   return n >= 3;\n});\nconsole.log(isACrowd);"}, {"note": "reduce threads an accumulator through the array, starting at 0.", "js": "\nvar sum = [1,2,3,4].reduce(function(total, current) {\n   var newTotal = total + current;\n   return newTotal;\n}, 0);\nconsole.log(sum);"}]}
```

> ⚠️ **易错点**：`map` 和 `filter` 不会修改原数组；请使用它们返回的数组。另外，`map`/`filter`/`reduce` 的回调如果忘了写 `return`，得到的就全是 `undefined`。

> 📝 **练习**：[问题 2](#124-问题-2哪个能把-max-设为最大值幻灯片-4850)（forEach、reduce 与 for 的对比）

> 🔗 **深入阅读**：[w3schools: Array reduce()](https://www.w3schools.com/jsref/jsref_reduce.asp)

---

## 11. 作用域、变量提升、let 与 var

以下全部是附录幻灯片（59–62）。

**作用域（scoping）**（幻灯片 59）：变量的作用域限于它被定义的位置，所以在函数内部定义的变量只在该函数内可见：

```js
var globalScopedVar = "I'm global!";

function func() {
 var funcScopedVar = "I'm only visible in this function!";
 return funcScopedVar;
}

console.log(funcScopedVar); //undefined
```

更正：最后一行并不会打印 `undefined`；它会抛出 **`ReferenceError: funcScopedVar is not defined`**，并终止脚本。要点依然成立：在 `func` 之外，这个名字并不存在。

**变量提升（hoisting）**（幻灯片 60–61）。函数可以被**声明**（`function name() {}`），也可以被**表达**（`var name = function() {}`）；两者的调用方式都是 `name()`，但在作用域处理上有所不同。变量声明和函数声明会被**提升（hoisted）**：它们先于其余代码执行。赋值则发生在你写下它的位置：

```js
bar();
var foo = 42;
function bar() {}
//=> is interpreted as
var foo;
function bar() {}
bar();
foo = 42;
```

所以，用声明方式定义的函数可以在定义之前被调用。对于函数表达式，只有 `var` 被提升：过早调用会失败并报 `TypeError: early is not a function`，因为此时该变量仍是 `undefined`。

**let 与 var**（幻灯片 62）：

- `var` 的作用域是**函数体**，而 `let` 的作用域是**最近的花括号** `{ }`（类似 C++ 或 Go 的块级变量）。
- 两者都会被提升，但 `let` 不会被初始化，如果在声明那一行之前使用，会产生引用错误（`ReferenceError: Cannot access 't' before initialization`）。
- 幻灯片说在严格模式（strict mode）下 `let` 变量不能被重复声明。实际上，在同一作用域内重复声明 `let` 在任何模式下都是错误（`Identifier 'b' has already been declared`），而 `var a = 1; var a = 2;` 是允许的。

```viz web-demo
{"title": "Slides 59–62 · scope, hoisting, let vs var", "html": "<p>See the console.</p>", "height": 60, "js": "console.log(foo); // hoisted, not yet assigned\nbar();            // hoisted declaration: works\nvar foo = 42;\nfunction bar() { console.log(\"bar ran\"); }\nconsole.log(foo);\n\ntry { early(); } catch (e) { console.log(e.name + \": \" + e.message); }\nvar early = function() {}; // expression: only the var is hoisted\n\nfunction scopes() {\n  if (true) { var v = 'var'; let l = 'let'; }\n  console.log(v);        // var: function-scoped\n  console.log(typeof l); // let: gone outside the { }\n}\nscopes();\n\ntry { console.log(t); } catch (e) { console.log(e.name + \": \" + e.message); }\nlet t = 1;\n\nfunction func() {\n  var funcScopedVar = \"I'm only visible in this function!\";\n  return funcScopedVar;\n}\nconsole.log(funcScopedVar); // slide 59 says undefined; it throws"}
```

> ⚠️ **易错点**：在 `if` 或 `for` 块内用 `var` 声明的变量，在整个函数中仍然可见。请优先使用 `let`（和 `const`）获得块级作用域。

> 🔗 **深入阅读**：[Stack Overflow: JavaScript function order (hoisting)](https://stackoverflow.com/questions/7609276/javascript-function-order-why-does-it-matter) · [Stack Overflow: let vs var](https://stackoverflow.com/questions/762011/what-is-the-difference-between-let-and-var)

> ➡️ **下一讲**：[Lecture 6](lec-06.zh-CN.md) 会用到以上所有内容来选取和编辑页面元素（DOM）、响应事件，并用 npm 安装包。

---

## 12. 课堂问题与演示（附解答）

### 12.1 演示 1：求和并统计偶数（幻灯片 23 · setup1 → solution1）

幻灯片 23（“Array methods: setup1.js”）是现场演示。来自 `setup1.js` 的任务：

- 在列表末尾添加一个 4，并再次打印
- 计算并打印数组中所有数字的和
- 统计数组中有多少个偶数

起始代码：

```js
var array = [6, 2, 8, 1, 2, 5, 3];
console.log('Array is ' + array);

array.push('4'); // what's wrong with this...?
console.log(array);
```

> ✍️ **先自己试一试。**

**答案**（`solution1.js`）：问题在于 `'4'` 是一个**字符串**。应当 push 数字，然后用两个循环：

```js
array.push(4);
console.log('Array is now ' + array);

var sum = 0;

for(var i=0; i<array.length; i++) {
	sum += array[i];
}

console.log('Sum is ' + sum);

evens = 0;
for(var i=0;i<array.length; i++) {
	if(array[i] % 2 == 0) {
		evens += 1;
	}
}
console.log('There are ' + evens + ' even numbers in the array.');
```

输出（与幻灯片 23 控制台截图中的四行相同）：

```
Array is 6,2,8,1,2,5,3
Array is now 6,2,8,1,2,5,3,4
Sum is 31
There are 5 even numbers in the array.
```

如果用 setup 里的 `push('4')`，求和循环执行到 `27 + '4'` 时会变成字符串拼接：**`Sum is 274`**。用 [第 10 节](#10-foreachmapfilter-与-reduce)的回调，这两步可以写成 `array.reduce((t, n) => t + n, 0)` 和 `array.filter(n => n % 2 == 0).length`。

```viz web-demo
{"title": "Demo 1 · solution1.js (plus the setup's push('4') bug)", "html": "<p>See the console.</p>", "height": 60, "js": "var array = [6, 2, 8, 1, 2, 5, 3];\nconsole.log('Array is ' + array);\n\n/*TODO:\n- add a 4 to the end of the list and print it again\n- calculate and print out the sum of all of the numbers in the array\n- count how many even numbers are in the array\n*/\n\narray.push(4);\nconsole.log('Array is now ' + array);\n\nvar sum = 0;\n\nfor(var i=0; i<array.length; i++) {\n\tsum += array[i];\n}\n\nconsole.log('Sum is ' + sum);\n\nevens = 0;\nfor(var i=0;i<array.length; i++) {\n\tif(array[i] % 2 == 0) {\n\t\tevens += 1;\n\t}\n}\nconsole.log('There are ' + evens + ' even numbers in the array.');\n\n\n\n// The setup's version: push a STRING '4'\nvar bad = [6, 2, 8, 1, 2, 5, 3];\nbad.push('4');\nvar badSum = 0;\nfor(var i=0; i<bad.length; i++) { badSum += bad[i]; }\nconsole.log('Sum with push(\\'4\\') is ' + badSum);"}
```

> 🧪 **Demo 文件**：[setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/setup1.js) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/solution1.js) · [setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/setup1.html) · [solution1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/solution1.html)

返回 [5. 数组](#5-数组)。

### 12.2 问题 1：控制台会显示什么？（幻灯片 24–26）

```js
var array = ['1', 'fish', 2, 'blue'];
array[5] = 'dog';
array.push('2');
array[2] = array[array.length - 1] - 4;
array[0] = typeof array[2];
array[4] = array.indexOf('blue');
console.log(array.join('*'));
```

- **A** `number*fish*2*-1*dog*0`
- **B** `undefined*fish*2*undefined*dog*2`
- **C** `string*fish*2*24*dog*2`
- **D** `undefined*fish*2*undefined*dog*2`
- **E** `number*fish*-2*blue*3*dog*2`

> ✍️ **先自己试一试。**

**答案：E**（幻灯片 26 中高亮）——`number*fish*-2*blue*3*dog*2`。

| 代码行 | 执行后的数组 |
|---|---|
| `array[5] = 'dog'` | `[ '1', 'fish', 2, 'blue', <1 empty item>, 'dog' ]`（数组扩展；下标 4 为空） |
| `array.push('2')` | `[ … , 'dog', '2' ]`，长度为 7 |
| `array[2] = array[6] - 4` | `'2' - 4` → `-2`（减号会转换字符串） |
| `array[0] = typeof array[2]` | `'number'` |
| `array[4] = array.indexOf('blue')` | `3`（填上了空洞） |

陷阱：B 和 D（在幻灯片上完全相同）假设所有位置都是 `undefined`；C 把 `-` 当成了 `+`（得到 `'24'`）；A 把 `'blue'` 的位置弄错了，它仍然在下标 3。

```viz web-demo
{"title": "Question 1 · q1.js (logs the array after every line)", "html": "<p>See the console.</p>", "height": 60, "source": "none", "js": "var array = ['1', 'fish', 2, 'blue'];\n\narray[5] = 'dog';\nconsole.log(array);\n\narray.push('2');\nconsole.log(array);\n\narray[2] = array[array.length - 1] - 4;\nconsole.log(array);\n\narray[0] = typeof array[2];\nconsole.log(array);\n\narray[4] = array.indexOf('blue');\nconsole.log(array);\n\nconsole.log(array.join('*'));"}
```

> 🧪 **Demo 文件**：[q1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q1/q1.html) · [q1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q1/q1.js)

返回 [5. 数组](#5-数组)。

### 12.3 演示 2：来自未来的问候与 tick-tock（幻灯片 43 · setup2 → solution2）

幻灯片 43（“Callback functions”）展示了打开的 `solution2.html`，控制台是空的：这个演示是现场运行的。来自 `setup2.js` 的任务：

- 使用 `setTimeout()` 在页面加载 5 秒后打印 “Hello from the future!”
- 每隔一秒交替输出 “tick” 和 “tock”，其中 tick 用**具名**函数，tock 用**匿名**函数

`setTimeout` 接受两个参数：一个回调函数，以及距离调用该函数的时间（毫秒）。起始代码：

```js
function helloFromTheFuture() {
	console.log("Hello from the future!");
}
```

> ✍️ **先自己试一试。**

**答案**（`solution2.js`）：

```js
setTimeout(helloFromTheFuture, 5000);

function tick() {
	console.log('tick');
	setTimeout(() => {
		console.log('tock');
		setTimeout(tick, 1000);
	}, 1000);
}

setTimeout(tick, 1000);
```

`helloFromTheFuture` 传入时不加括号。`tick` 先输出，然后安排那个匿名箭头函数；后者输出 `tock` 并再次安排 `tick`，于是它们会永远交替下去。前约 6 秒的输出：

```
tick
tock
tick
tock
Hello from the future!
tick
```

在第 5 秒时，hello 定时器和第三个 `tick` 同时到期；hello 是先安排的，所以它先执行。

```viz web-demo
{"title": "Demo 2 · solution2.js (wait ~5 s for the future)", "html": "<p>See the console.</p>", "height": 60, "js": "/*TODO:\n- use setTimeout() to print \"Hello from the future!\" 5 seconds after the page is loaded\n- alternate logging \"ticks\" and \"tocks\" every one second, creating a named function for tick and an anonymous function for tock\nsetTimeout takes two arguments: a callback function, time in MS until function should be called\nhttps://www.w3schools.com/jsref/met_win_settimeout.asp\n*/\n\nfunction helloFromTheFuture() {\n\tconsole.log(\"Hello from the future!\");\n}\n\nsetTimeout(helloFromTheFuture, 5000);\n\nfunction tick() {\n\tconsole.log('tick');\n\tsetTimeout(() => {\n\t\tconsole.log('tock');\n\t\tsetTimeout(tick, 1000);\n\t}, 1000);\n}\n\nsetTimeout(tick, 1000);"}
```

> 🧪 **Demo 文件**：[setup2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/setup2.js) · [solution2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/solution2.js) · [setup2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/setup2.html) · [solution2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/solution2.html)

> 🔗 **深入阅读**：[w3schools: setTimeout() (linked in setup2.js)](https://www.w3schools.com/jsref/met_win_settimeout.asp)

返回 [9. 传递函数与回调](#9-传递函数与回调)。

### 12.4 问题 2：哪个能把 max 设为最大值？（幻灯片 48–50）

下面哪一个会把 `max` 设为数组 `numbers` 的最大值？（JavaScript 中空白字符无关紧要。）

- **A**

```js
var max = Number.NEGATIVE_INFINITY;
numbers.forEach(function(num) {
    if(num > max) {
        max = num;
    }
});
```

- **B**

```js
var max =
numbers.reduce(function(max, num) {
    if(num > max) {
        max = num;
    }
    return max;
}, Number.NEGATIVE_INFINITY);
```

- **C**

```js
var max = Number.NEGATIVE_INFINITY;
for(var i=0;i < numbers.length; i++) {
    if(num > max) {
        max = num;
    }
}
```

- **D** 上述中的两个
- **E** 上述全部

> ✍️ **先自己试一试。**

**答案：D**（幻灯片 50 中高亮）——A 和 B 可行；C 不行。

- **A** 可行：回调会针对每个元素更新外层的 `max`。
- **B** 可行：累加器（同样叫 `max`，遮蔽了外层的 `max`）从 `-Infinity` 开始，每次调用都返回较大的那个值。
- **C** 有问题：循环从未读取 `numbers[i]`。它比较的是 `num`，而这里并不存在这个变量，所以会抛出 **`ReferenceError: num is not defined`**。修正方法是 `if(numbers[i] > max) { max = numbers[i]; }`。

用 `q2.js` 中的 `numbers = [1, 5, 10, 30, 6, 500]`，输出为 `A: 500`、`B: 500`，随后报错：

```viz web-demo
{"title": "Question 2 · q2.js (C throws)", "html": "<p>See the console.</p>", "height": 60, "source": "none", "js": "var numbers = [1, 5, 10, 30, 6, 500];\n\n// ----- A ------\nvar max = Number.NEGATIVE_INFINITY;\n\nnumbers.forEach(function(num) {\n\tif(num > max) {\n\t\tmax = num;\n\t}\n});\n\nconsole.log(`A: ${max}`);\n\n\n// ----- B ------\nvar max = numbers.reduce(function(max, num) {\n\tif(num > max) {\n\t\tmax = num;\n\t}\n\treturn max;\n}, Number.NEGATIVE_INFINITY);\n\nconsole.log(`B: ${max}`);\n\n\n// ----- C ------\nvar max = Number.NEGATIVE_INFINITY;\n\nfor(var i=0;i < numbers.length; i++) {\n\tif(num > max) {\n\t\tmax = num;\n\t}\n}\n\nconsole.log(`C: ${max}`);"}
```

> 🧪 **Demo 文件**：[q2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q2/q2.html) · [q2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q2/q2.js)

返回 [10. forEach、map、filter 与 reduce](#10-foreachmapfilter-与-reduce)。

---

## 13. 速查与必记的 5 个要点

**类型与比较**

| 表达式 | 结果 |
|---|---|
| `typeof 'hi'` / `typeof 42` | `'string'` / `'number'` |
| `typeof null` / `typeof undefined` / `typeof NaN` | `'object'` / `'undefined'` / `'number'` |
| `'40' + 2` / `'40' - 4` | `'402'` / `36` |
| `10 == '10'` / `10 === '10'` / `'' == 0` | `true` / `false` / `true` |
| `undefined * 3`, `'word' - 5` | `NaN` |
| falsy 值 | `null`, `undefined`, `NaN`, `0`, `''`, `false` |

**字符串与数组**

| 调用 | 作用 |
|---|---|
| `s.toUpperCase()`, `s.substring(1, 4)`, `s.indexOf('x')` | 新字符串；切片 [1,4)；位置或 `-1` |
| `` `text ${v}` `` | 模板字面量（template literal） |
| `a.push(x)` / `a.pop()` | 在末尾添加 / 移除 |
| `a.join('-')` | 把元素合成一个字符串 |
| `a.indexOf(x)` | 第一个下标或 `-1` |
| `a.splice(i, n)` | 从下标 `i` 开始移除 `n` 个元素（原地修改） |
| `a.concat(b)` | 返回合并后的新数组 |
| `a.sort((x, y) => x - y)` | 数值排序（默认按字符串排序） |

**对象**

| 代码 | 作用 |
|---|---|
| `o['key']` / `o.key` | 读取（不存在 → `undefined`） |
| `o.key = v` | 设置或添加 |
| `Object.keys(o)` / `Object.values(o)` / `Object.entries(o)` | 键 / 值 / `[key, value]` 组成的数组 |

**函数与回调**

| 代码 | 含义 |
|---|---|
| `function f(a) {…}` | 声明（会被提升） |
| `var f = function(a) {…}` | 表达式（只有 `var` 被提升） |
| `var f = (a) => {…}` | 箭头函数（没有自己的 `this`） |
| `g(f)` 与 `g(f())` | 传递函数本身 与 传递它的返回值 |
| `a.forEach(f)` / `a.map(f)` / `a.filter(f)` / `a.reduce(f, init)` | 遍历 / 转换 / 筛选 / 累积 |
| `setTimeout(f, ms)` | `ms` 毫秒后调用 `f` |
| `var` / `let` | 函数作用域 / 块级作用域 |

**必记的 5 个要点**

1. `+` 遇到字符串会拼接，`-` 会转换成数字：`'40' + 2` 是 `'402'`，`'2' - 4` 是 `-2`。请使用 `===`，而不是 `==`。
2. 在数组末尾之后赋值会用空槽扩展数组；读取不存在的下标或对象的键会得到 `undefined`，不会报错。
3. 函数是值：可以把它们存入变量和对象属性，并**不加括号**地作为回调传递。
4. `map` 和 `filter` 返回新数组；`reduce` 要求回调 `return` 累加器，并需要一个初始值。
5. `var` 是函数作用域，且被提升为 `undefined`；`let` 是块级作用域，在声明行之前使用会抛出错误。箭头函数没有自己的 `this`。