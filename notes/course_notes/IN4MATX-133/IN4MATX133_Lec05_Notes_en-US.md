# IN4MATX 133: User Interface Software — Lecture 5: Javascript 2

## Table of Contents

- [1. The role of JavaScript](#1-the-role-of-javascript)
- [2. Loading, printing and syntax](#2-loading-printing-and-syntax)
- [3. Variables and types](#3-variables-and-types)
- [4. Conditionals, loops and strings](#4-conditionals-loops-and-strings)
- [5. Arrays](#5-arrays)
- [6. Objects and JSON](#6-objects-and-json)
- [7. Functions](#7-functions)
- [8. Functions are objects](#8-functions-are-objects)
- [9. Passing functions and callbacks](#9-passing-functions-and-callbacks)
- [10. forEach, map, filter and reduce](#10-foreach-map-filter-and-reduce)
- [11. Scope, hoisting, let and var](#11-scope-hoisting-let-and-var)
- [12. In-class Questions & Demos (with Solutions)](#12-in-class-questions--demos-with-solutions)
- [13. Quick Reference & Top 5 Things to Remember](#13-quick-reference--top-5-things-to-remember)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid, Fall 2026, Thursday 10/8
> Built from the Lecture 5 slides (62 pages) and the demo repo folder `W2_L2_Oct8_JavaScript`. Organized by concept, not by source.

> 📅 **Class logistics**: A1 is due Monday at 11:59pm.
> A2 is posted: start it early, students have found it much more challenging than A1. Questions go in the `#assignment2` Slack channel, and the lecture slides with all A2-related content are already posted.

Slides 53–62 come after the closing slide ("Some useful JavaScript methods and important notes"); their content is folded into the sections below, marked "(appendix)".

---

## 1. The role of JavaScript

The three web languages each have one job (slides 5–6):

| Language | Kind | Role |
|---|---|---|
| HTML | Markup language | Specify how content is rendered |
| CSS | Styling language | Visually style content |
| JavaScript | Programming language | Dynamically manipulate content |

**Why JavaScript?** It makes pages **dynamic**, **personalized**, and able to **interact with other sources**, like databases and APIs (slide 7). Slide 8 shows GitHub's "Top 10 programming languages on GitHub 2023–2025" chart: JavaScript was #1 until 2025, when TypeScript (JavaScript with types, [Lecture 7](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec07_Notes_en-US.md)) took the top spot, with Python and JavaScript next.

Despite the name, JavaScript is not Java (slides 9–10), and it shares more with Python (slide 11):

| JavaScript | Java |
|---|---|
| Interpreted language | Compiled language (into bytecode) |
| Executed by a JavaScript engine | Run in a Java Virtual Machine (JVM) |
| Engine runs the same code that a programmer writes | Bytecode is unreadable by people |
| Standardized through ECMAScript, but discrepancies exist | "Write once, deploy anywhere" |
| Debugging dependent on execution environment | Bugs found at compile time |
| Used in every browser without a plugin | Requires a plugin to be run in most browsers |

| JavaScript | Python |
|---|---|
| **Dynamically** typed | **Dynamically** typed |
| Widely used for **front-end** web development | Widely used for **back-end** web development |
| Relies on **semicolons** `;` and **curly braces** `{ }` for code blocks | Relies on **indentation** for code blocks |

Slide 12's message: **JavaScript is just a programming language.**

> 🔗 **Go deeper**: [GitHub Octoverse (language rankings)](https://octoverse.github.com/) · [freeCodeCamp: Python vs JavaScript](https://www.freecodecamp.org/news/python-vs-javascript-what-are-the-key-differences-between-the-two-popular-programming-languages/)

---

## 2. Loading, printing and syntax

**Loading.** Like an external stylesheet, a script is linked from the page (slide 13):

```html
<html>
  <head>
    <script src="test.js"></script>
  </head>
</html>
```

**Printing.** `console.log` writes to the **JavaScript Console**, not the page (slide 14):

```js
console.log("Hello, world!");
```

It won't be visible in the page; open the developer tools to see it (slide 14's screenshot: Safari's Develop menu → JavaScript Console).

**Syntax** (slide 15): JavaScript has functions and objects; they **look like Java but act differently**. It uses object-oriented principles such as encapsulation. If you get lost, ask: how does this relate to languages and OOP principles I already know, and where *specifically* is it different?

The repo's `lecture.html` loads `lecture.js`, which runs every snippet of this lecture in the console.

> 🧪 **Demo files**: [lecture.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/lectureExamples/lecture.html) · [lecture.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/lectureExamples/lecture.js)

> 🔗 **Go deeper**: [Douglas Crockford on JavaScript](https://www.crockford.com/javascript/javascript.html)

---

## 3. Variables and types

Variables are **dynamically typed**: the value has a type, the variable doesn't, so the same variable can hold a string and then a number. `typeof` tells you the current type. A declared but **unassigned variable has the value `undefined`** (slide 16):

```js
var x = 'hello'; //value is a string
console.log(typeof x); //string

x = 42; //value is now a Number
console.log(typeof x); //number

var hoursSlept;
console.log(hoursSlept); // undefined
```

`lecture.js` adds a follow-up: `hoursSlept += 2;` on that unassigned variable logs **`NaN`** (`undefined + 2`). Uncommenting `hoursSlept = 2;` first gives `4`.

**Type coercion** (slide 17). JavaScript converts types silently:

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

- `+` with a string **concatenates**, so `'40' + 2` is the string `'402'`.
- Minus isn't defined for strings, so JavaScript knows to convert `'40'` to a number: `36`.
- `==` converts both sides before comparing (`10 == '10'`, even `'' == 0`). `===` is **strict**: also compares the type. Use `===`.

**null, undefined and NaN** (appendix, slides 54–56):

| Value | Meaning | `typeof` | Falsy? |
|---|---|---|---|
| `null` | a nonexistent object: an object, just uninitialized | `object` | yes, but `null == false` is `false` |
| `undefined` | an undefined primitive value (like a number or string is a primitive) | `undefined` | yes, but `undefined == false` is `false` |
| `NaN` | Not a Number: the result of any computation on `undefined`, or any other impossible computation | `number` (despite the name) | yes |

```js
console.log('12' - 5); // 7
console.log('word' - 5);// NaN
console.log(undefined * 3);// NaN
console.log(typeof NaN);// number
if(NaN) {
console.log("It's not falsy!");
}
```

The `if(NaN)` block prints **nothing**: `NaN` is falsy. (`!nullObj` and `!undefinedObj` are both true, so slides 54–55's `"It's falsy"` lines do print.)

Step through the slide code (edit and Run to try your own):

```viz web-demo
{"title": "Slides 16–17 · lecture.js (variables and types)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "var x = 'hello'; //value is a string\nconsole.log(typeof x); //string\nx = 42; //value is now a Number\nconsole.log(typeof x); //number\n\nvar hoursSlept;\nconsole.log(hoursSlept);\n//hoursSlept = 2; // try uncommenting this\nhoursSlept += 2;\nconsole.log(hoursSlept);", "steps": [{"note": "Coercion: + joins strings, - converts to numbers.", "js": "\nconsole.log('40' + 2); //'402'\nconsole.log('40' - 4); //36"}, {"note": "== converts before comparing; === also compares the type.", "js": "\nvar num = 10;\nvar str = '10';\nconsole.log(num == str); //true\nconsole.log(num === str); //false\nconsole.log('' == 0); //true"}, {"note": "Slides 54–56: null, undefined and NaN.", "js": "\nvar nullObj = null;\nconsole.log(typeof nullObj); //object\nconsole.log(nullObj == false); //false\nconsole.log(typeof undefined); //undefined\nconsole.log('12' - 5); // 7\nconsole.log('word' - 5); // NaN\nconsole.log(undefined * 3); // NaN\nconsole.log(typeof NaN); // number\nif(NaN) {\n  console.log(\"It's not falsy!\");\n}"}]}
```

> ⚠️ **Pitfall**: `'40' + 2` is `'402'` but `'40' - 4` is `36`. Values read from a page or a form are strings, so "adding" them concatenates. And `==` hides type mismatches: `'' == 0` is `true`.

> 🔗 **Go deeper**: [codeburst: Understanding null, undefined and NaN](https://codeburst.io/understanding-null-undefined-and-nan-b603cb74b44c)

---

## 4. Conditionals, loops and strings

`if` / `else if` / `else` and the C-style `for` loop look like C++ (slide 18):

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

Output: `i is between 3 and 5`, then `0 1 2 3 4` on separate lines. (`lecture.js` logs `i` inside the loop instead of `x`, so the repo prints `4.4` five times; the slide's `x` is what's meant.)

**Methods** are called with dot notation (slide 19).; `toUpperCase()` returns a new string, so assign it back:

```js
var className = 'in4matx 133';
console.log(className);

className = className.toUpperCase();
console.log(className);

var part = className.substring(1, 4);
console.log(part);

console.log(className.indexOf('MATX') >= 0); //whether the substring appears
```

Output (matches the console screenshot on slide 19): `in4matx 133`, `IN4MATX 133`, `N4M` (`substring(1, 4)` = indices 1–3, end excluded, like Python's `s[1:4]`), `true` (`indexOf` returns the position, or `-1` if absent).

**String formatting** (slide 20): wrap the string in **backticks** instead of quotes, and insert variables with `${...}`, like a Python f-string:

```js
var className = 'in4matx 133';
console.log(`the class name is: ${className}`); // the class name is: in4matx 133
```

```viz web-demo
{"title": "Slides 18–20 · lecture.js (conditionals, loops, string methods, template literals)", "html": "<p>See the console.</p>", "height": 60, "js": "var i = 4.4;\n\nif(i > 5) {\n\tconsole.log('i is bigger than 5');\n} else if(i >= 3) {\n\tconsole.log('i is between 3 and 5');\n} else {\n\tconsole.log('i is less than 3');\n}\n\nfor(var x = 0; x < 5; x++) {\n\tconsole.log(x);\n}\n\nvar className = 'in4matx 133';\nconsole.log(className);\nclassName = className.toUpperCase();\nconsole.log(className);\nvar part = className.substring(1, 4);\nconsole.log(part);\nconsole.log(className.indexOf('MATX') >= 0); //whether the substring appears\nconsole.log(`the class name is: ${className}`);"}
```

> ⚠️ **Pitfall**: `${…}` only works inside backticks. In `'single'` or `"double"` quotes it is printed literally.

---

## 5. Arrays

Arrays are similar to Java's (and Python lists), but **can mix different types** and nest (slide 21). Access and assign with `[]`; **assigning out of bounds automatically grows the array**, leaving empty slots:

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

Consoles print the gap as `<7 empty items>` (Node) or `empty × 7` (Chrome); reading an empty slot gives `undefined` (Python would raise `IndexError`).

Arrays have their own methods (slide 22):

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

More useful array methods (appendix, slide 57):

- Arrays have stack functions: `.push()` and `.pop()` add and remove the **last** item.
- `.concat()` combines arrays: `[1, 2].concat([3, 4])` → `[ 1, 2, 3, 4 ]`.
- `.sort()` sorts "alphabetically/numerically by default", but can take a **comparator**. For example, sort by the `count` attribute of an object:

```js
array.sort(function(a, b) {
return a.count - b.count;
});
```

The comparator returns a negative number if `a` goes first, positive if `b` does.

```viz web-demo
{"title": "Slides 21–22 · lecture.js (arrays)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "var letters = ['a', 'b', 'c'];\nvar things = ['raindrops', 2.5, true, [5, 9, 8]]; //arrays can be nested\n\nconsole.log( letters[1] ); //=> \"b\"\nconsole.log( things[3][2] ); //=> 8\n\nletters[0] = 'z';\nconsole.log( letters ); //=> ['z', 'b', 'c']", "steps": [{"note": "Assigning out of bounds grows the array; the gap is empty slots.", "js": "\nletters[10] = 'g';\nconsole.log( letters );\nconsole.log( letters.length ); //=> 11"}, {"note": "push, join, indexOf, splice (slide 22).", "js": "\nvar array = ['i','n','f','x'];\narray.push('133');\nconsole.log(array);\nvar str = array.join('-');\nconsole.log(str);\nvar oIndex = array.indexOf('x'); //=> 3\narray.splice(oIndex, 1);\nconsole.log(array);"}, {"note": "Slide 57: pop, concat, and sort with and without a comparator.", "js": "\nconsole.log(array.pop(), array);\nconsole.log([1, 2].concat([3, 4]));\nconsole.log([10, 9, 1].sort()); // compares as strings!\nconsole.log([10, 9, 1].sort(function(a, b) { return a - b; }));"}]}
```

> ⚠️ **Pitfall**: the default `.sort()` compares elements **as strings**, even numbers: `[10, 9, 1].sort()` gives `[ 1, 10, 9 ]`. Pass `function(a, b) { return a - b; }` to sort numbers.

> 📝 **Practice**: [Demo 1](#121-demo-1-sum-and-count-evens-slide-23--setup1--solution1) (push, sum, count evens) · [Question 1](#122-question-1-what-will-be-shown-in-the-console-slides-2426) (trace an array)

> 🔗 **Go deeper**: [Medium: 10 useful JavaScript array methods](https://medium.com/@DaphneWatson/10-useful-javascript-array-methods-8ffe22e7a959)

---

## 6. Objects and JSON

A JavaScript **object** is an unordered set of key–value pairs: like a HashMap in Java or a **dictionary in Python**. They're sometimes called **associative arrays** (slide 27). Quotes around keys are optional:

```js
ages = {alice:40, bob:35, charles:13}
extensions = {'daniel':1622, 'in4matx':9937}
num_words = {1:'one', 2:'two', 3:'three'}
things = {num:12, dog:'woof', list:[1,2,3]}
empty = {}
empty = new Object(); //empty object
```

**Bracket access** (slide 28): values (or *properties*) are referenced with the `array[]` syntax. Unlike Python, a missing key is **not an error**; it gives `undefined`. Assigning to a new key adds it:

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

**Dot notation** (slide 29) does the same thing and chains into nested objects and arrays:

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

With the key in a variable (the slide's `topic`), use brackets: `person.favorites[topic]`; `.topic` would look for a key named `topic`.

**Useful object methods** (appendix, slide 58): `Object.keys(obj)` returns an array of the keys (order is not guaranteed), `Object.values(obj)` an array of the values, `Object.entries(obj)` an array of `[key, value]` pairs:

```js
obj = { pet1: 'Dog', pet2: 'Cat' };
console.log(Object.entries(obj));
// [ ["pet1", "Dog"], ["pet2", "Cat"] ]
```

```viz web-demo
{"title": "Slides 27–29, 58 · lecture.js (objects)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "ages = {alice:40, bob:35, charles:13}\n\nconsole.log( ages['alice'] ); //=> 40\nconsole.log( ages['fred']); //=> undefined\nages['alice'] = 41;\nconsole.log( ages['alice'] ); //=> 41\nages['fred'] = 19; //adds the key\n\nvar person = {\n  firstName: 'Alice',\n  lastName: 'Smith',\n  favorites: {\n    food: 'pizza',\n    numbers: [12, 42]\n  }\n};\nperson.lastName = 'Jones';\nconsole.log(person.firstName+' '+person.lastName); //\"Alice Jones\"\nconsole.log(person.favorites.food);\nperson.favorites.numbers.push(7);\nconsole.log(person.favorites.numbers);", "steps": [{"note": "Slide 58: Object.keys / values / entries.", "js": "\nconsole.log(Object.keys(ages));\nconsole.log(Object.values(ages));\nobj = { pet1: 'Dog', pet2: 'Cat' };\nconsole.log(Object.entries(obj));"}]}
```

**JSON** (JavaScript Object Notation, slide 30) is the text format based on this object syntax, used in many APIs to send and receive data. In JSON the keys **must** be in double quotes:

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

> 🔗 **Go deeper**: [w3schools: JSON](https://www.w3schools.com/js/js_json.asp) · [codeburst: Useful JavaScript array and object methods](https://codeburst.io/useful-javascript-array-and-object-methods-6c7971d93230)

---

## 7. Functions

Functions in JavaScript are like static methods in Java (slide 31): no class needed, **no access modifier or return type**, and **parameters have no type** (they are comma-separated):

```js
//JavaScript
function sayHello(name){
    return "Hello, "+name;
}
var msg = sayHello("IN4MATX 133");
```

(The slide sets this beside the Java version, `public static String sayHello(String name)` called from `main`.)

**All parameters are optional** (slide 32). A missing argument is `undefined`; extra arguments are ignored. No error either way:

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

Real outputs: `Hello, In4MATX 133` (the slide's comment capitalizes it differently from the argument), `Hello, undefined`, `Hello, IN4MATX`.

> ⚠️ **Pitfall**: calling with the wrong number of arguments is not an error in JavaScript (Python and C++ would refuse). A forgotten argument shows up later as `undefined` or `NaN`.

---

## 8. Functions are objects

"Now for the confusing part…" (slide 33): **a function is a value**, just like an array. The slides put the two side by side:

| With an array (slide 34–36, left) | With a function (right) |
|---|---|
| `var other = myArray;` then `other[1]` → `'b'` | `var other = sayHello;` then `other('everyone')` → prints `Hello, everyone` |
| second variable, same array | `var greet = sayHello2;` second variable, same function object |
| `obj.array = myArray;` then `obj.array[0]` → `'a'` | `obj.sayHi = sayHello;` then `obj.sayHi('all')` → prints `Hello, all` |
| `obj.otherArray = [1,2,3]` (assign a literal) | `obj.otherFunc = function() {…}` (assign a function literal) |

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

The last line is **how "non-static" methods are made** (slide 36): a function stored as a property of an object, called through that object. (Real output of `obj.sayHi('all')` is `Hello, all`, with the comma.)

**Anonymous values** (slides 37–39). `[4,5,6]` passed straight to `console.log` is an anonymous value: it has no variable name. Functions can be anonymous too:

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

The middle block is only an illustration: a nameless `function(person) {…}` on its own line is a **SyntaxError** ("Function statements require a function name"). Anonymous functions are always used as values: assigned, stored, or passed.

**The `this` keyword** (slide 40): `this` usually refers to the object that the method was called on. The slide's example:

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

Slide bug: as written this prints **`Hello, I'm undefined`**, because an arrow function has no `this` of its own (it uses the surrounding one, here the global `window`). With `sayHello: function() {…}` it prints `Hello, I'm Alice`. What arrows do "preserve" is the `this` of an enclosing method, for arrows written *inside* it. Step 3 below shows both.

```viz web-demo
{"title": "Slides 31–41 · lecture.js (functions are values)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "function sayHello(name) {\n    return \"Hello, \"+name;\n}\nconsole.log(sayHello(\"In4MATX 133\"));\nconsole.log(sayHello());\nconsole.log(sayHello(\"IN4MATX\",\"133\"));", "steps": [{"note": "A function is a value: store it in another variable or an object property.", "js": "\nvar other = sayHello;\nconsole.log(other('everyone'));\nvar obj = {};\nobj.sayHi = sayHello;\nconsole.log(obj.sayHi('all'));\nobj.otherFunc = function() {\n    return \"Hello world!\";\n}\nconsole.log(obj.otherFunc());"}, {"note": "Arrow syntax (slide 39).", "js": "\nvar sayHello2 = (person) => {\n   console.log(\"Hello, \"+person);\n}\nsayHello2('IN4MATX 133');"}, {"note": "Slide 40's code as written: an arrow method does NOT get the object as this.", "js": "\nvar alice = {\n  first: 'Alice',\n  sayHello:()=> {\n    console.log(\"Hello, I'm \" + this.first);\n  }\n};\nalice.sayHello();\nvar alice2 = {\n  first: 'Alice',\n  sayHello: function() {\n    console.log(\"Hello, I'm \" + this.first);\n  }\n};\nalice2.sayHello();"}, {"note": "Passing functions (slide 41): no parentheses when passing.", "js": "\nvar doAtOnce = function(funcA, funcB) {\n    funcA();\n    console.log(' and ');\n    funcB();\n    console.log(' at the same time! ');\n}\nvar patHead = function(name) {\n    console.log(\"pat your head\");\n}\nvar rubBelly = function(name) {\n    console.log(\"rub your belly\");\n}\ndoAtOnce(patHead, rubBelly);"}]}
```

> ⚠️ **Pitfall**: don't write object methods as arrow functions if they use `this`; use `function` (or the shorthand `sayHello() {…}`).

---

## 9. Passing functions and callbacks

Since functions are objects, they can be **passed like variables** (slide 41). Pass the function **without parentheses**: `patHead` is the function, `patHead()` would call it now and pass its result.

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

Output: `pat your head`, ` and `, `rub your belly`, ` at the same time! `.

A **callback function** is a function passed to *another* function for it to "call back to" and execute (slide 42):

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

With a `doHomework` that logs something, the two waiting lines print first, then the homework line.

The browser's `setTimeout(callback, ms)` is a callback API: it calls the function after `ms` milliseconds. The in-class demo on slide 43 uses it to print a message 5 seconds later and alternate "tick"/"tock" every second (see [Demo 2](#123-demo-2-hello-from-the-future-and-tick-tock-slide-43--setup2--solution2)).

> 📝 **Practice**: [Demo 2](#123-demo-2-hello-from-the-future-and-tick-tock-slide-43--setup2--solution2) (setTimeout callbacks)

---

## 10. forEach, map, filter and reduce

Arrays take callbacks for the common loops (the **functional programming** tools).

**forEach** (slide 44): to iterate through each item, call `forEach` and pass it a function to call on each array item:

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

Each prints `item: a`, `item: b`, `item: c`.

**map** (slide 45) applies the function to each element and returns a **new array** of the values it returned:

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

(The slide defines `squared` but then passes an identical anonymous function; `array.map(squared)` does the same.)

**filter** (slide 46) returns a new array of **only the elements for which the function returns true**:

```js
var array = [3,1,4,2,5];

var isACrowd = array.filter(function(n) {
   return n >= 3;
}); //returns [3,4,5]
```

**reduce** (slide 47) applies the function to each element to update an **accumulator**. The callback gets `(accumulator, current)` and must **return** the updated accumulator; the second argument to `reduce` is the starting value:

```js
var array = [1,2,3,4];

var sum = array.reduce(function(total, current) {
   var newTotal = total + current;
   return newTotal;
}, 0); //returns 1+2+3+4=10
```

| JavaScript | Python | Returns |
|---|---|---|
| `arr.forEach(f)` | `for x in arr: f(x)` | `undefined` |
| `arr.map(f)` | `[f(x) for x in arr]` | new array, same length |
| `arr.filter(f)` | `[x for x in arr if f(x)]` | new array, maybe shorter |
| `arr.reduce(f, init)` | `functools.reduce(f, arr, init)` | one value |

```viz web-demo
{"title": "Slides 44–47 · lecture.js (forEach, map, filter, reduce)", "interactive": true, "html": "<p>See the console.</p>", "height": 60, "js": "var array = ['a','b','c'];\narray.forEach(function(item) {\n   console.log(`item: ${item}`);\n});", "steps": [{"note": "map returns a NEW array of what the callback returns.", "js": "\nvar nums = [1,2,3];\nvar squares = nums.map(function(n) {\n   return n*n;\n});\nconsole.log(squares, nums);"}, {"note": "filter keeps the elements whose callback returns true.", "js": "\nvar isACrowd = [3,1,4,2,5].filter(function(n) {\n   return n >= 3;\n});\nconsole.log(isACrowd);"}, {"note": "reduce threads an accumulator through the array, starting at 0.", "js": "\nvar sum = [1,2,3,4].reduce(function(total, current) {\n   var newTotal = total + current;\n   return newTotal;\n}, 0);\nconsole.log(sum);"}]}
```

> ⚠️ **Pitfall**: `map` and `filter` don't change the original array; use the returned one. And a `map`/`filter`/`reduce` callback that forgets `return` produces `undefined`s.

> 📝 **Practice**: [Question 2](#124-question-2-which-will-set-max-to-the-max-slides-4850) (forEach vs reduce vs for)

> 🔗 **Go deeper**: [w3schools: Array reduce()](https://www.w3schools.com/jsref/jsref_reduce.asp)

---

## 11. Scope, hoisting, let and var

All appendix slides (59–62).

**Scoping** (slide 59): variables are scoped to wherever they are defined, so a variable defined within a function is only visible within that function:

```js
var globalScopedVar = "I'm global!";

function func() {
 var funcScopedVar = "I'm only visible in this function!";
 return funcScopedVar;
}

console.log(funcScopedVar); //undefined
```

Correction: the last line doesn't print `undefined`; it throws **`ReferenceError: funcScopedVar is not defined`**, which stops the script. The point stands: the name doesn't exist outside `func`.

**Hoisting** (slides 60–61). A function can be **declared** (`function name() {}`) or **expressed** (`var name = function() {}`); both are called the same way, `name()`, but are treated differently in scoping. Variable and function declarations get **hoisted**: they execute before the rest of the code. Assignment occurs later, where you specify it:

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

So a declared function can be called above its definition. With an expression, only the `var` is hoisted: calling it early fails with `TypeError: early is not a function`, because the variable is still `undefined`.

**let and var** (slide 62):

- `var` is scoped to the **function body**, while `let` is scoped to the **immediate brackets** `{ }` (like a C++ or Go block variable).
- Both are hoisted, but `let` is not initialized and produces reference errors if used before its line (`ReferenceError: Cannot access 't' before initialization`).
- The slide says that in strict mode, `let` variables cannot be redeclared. In fact a `let` redeclared in the same scope is an error in any mode (`Identifier 'b' has already been declared`), while `var a = 1; var a = 2;` is allowed.

```viz web-demo
{"title": "Slides 59–62 · scope, hoisting, let vs var", "html": "<p>See the console.</p>", "height": 60, "js": "console.log(foo); // hoisted, not yet assigned\nbar();            // hoisted declaration: works\nvar foo = 42;\nfunction bar() { console.log(\"bar ran\"); }\nconsole.log(foo);\n\ntry { early(); } catch (e) { console.log(e.name + \": \" + e.message); }\nvar early = function() {}; // expression: only the var is hoisted\n\nfunction scopes() {\n  if (true) { var v = 'var'; let l = 'let'; }\n  console.log(v);        // var: function-scoped\n  console.log(typeof l); // let: gone outside the { }\n}\nscopes();\n\ntry { console.log(t); } catch (e) { console.log(e.name + \": \" + e.message); }\nlet t = 1;\n\nfunction func() {\n  var funcScopedVar = \"I'm only visible in this function!\";\n  return funcScopedVar;\n}\nconsole.log(funcScopedVar); // slide 59 says undefined; it throws"}
```

> ⚠️ **Pitfall**: a `var` declared inside an `if` or `for` block is still visible in the whole function. Prefer `let` (and `const`) for block scoping.

> 🔗 **Go deeper**: [Stack Overflow: JavaScript function order (hoisting)](https://stackoverflow.com/questions/7609276/javascript-function-order-why-does-it-matter) · [Stack Overflow: let vs var](https://stackoverflow.com/questions/762011/what-is-the-difference-between-let-and-var)

> ➡️ **Next**: [Lecture 6](?kind=course_notes&course=IN4MATX-133&lang=en-US&note=IN4MATX133_Lec06_Notes_en-US.md) uses all of this to select and edit page elements (the DOM), react to events, and install packages with npm.

---

## 12. In-class Questions & Demos (with Solutions)

### 12.1 Demo 1: Sum and count evens (slide 23 · setup1 → solution1)

Slide 23 ("Array methods: setup1.js") is the live demo. The task, from `setup1.js`:

- add a 4 to the end of the list and print it again
- calculate and print out the sum of all of the numbers in the array
- count how many even numbers are in the array

Starter:

```js
var array = [6, 2, 8, 1, 2, 5, 3];
console.log('Array is ' + array);

array.push('4'); // what's wrong with this...?
console.log(array);
```

> ✍️ **Try it first.**

**Answer** (`solution1.js`): what's wrong is that `'4'` is a **string**. Push the number, then two loops:

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

Output (the same four lines as slide 23's console screenshot):

```
Array is 6,2,8,1,2,5,3
Array is now 6,2,8,1,2,5,3,4
Sum is 31
There are 5 even numbers in the array.
```

With the setup's `push('4')`, the sum loop reaches `27 + '4'` and turns into string concatenation: **`Sum is 274`**. With the callbacks from [section 10](#10-foreach-map-filter-and-reduce) this is `array.reduce((t, n) => t + n, 0)` and `array.filter(n => n % 2 == 0).length`.

```viz web-demo
{"title": "Demo 1 · solution1.js (plus the setup's push('4') bug)", "html": "<p>See the console.</p>", "height": 60, "js": "var array = [6, 2, 8, 1, 2, 5, 3];\nconsole.log('Array is ' + array);\n\n/*TODO:\n- add a 4 to the end of the list and print it again\n- calculate and print out the sum of all of the numbers in the array\n- count how many even numbers are in the array\n*/\n\narray.push(4);\nconsole.log('Array is now ' + array);\n\nvar sum = 0;\n\nfor(var i=0; i<array.length; i++) {\n\tsum += array[i];\n}\n\nconsole.log('Sum is ' + sum);\n\nevens = 0;\nfor(var i=0;i<array.length; i++) {\n\tif(array[i] % 2 == 0) {\n\t\tevens += 1;\n\t}\n}\nconsole.log('There are ' + evens + ' even numbers in the array.');\n\n\n\n// The setup's version: push a STRING '4'\nvar bad = [6, 2, 8, 1, 2, 5, 3];\nbad.push('4');\nvar badSum = 0;\nfor(var i=0; i<bad.length; i++) { badSum += bad[i]; }\nconsole.log('Sum with push(\\'4\\') is ' + badSum);"}
```

> 🧪 **Demo files**: [setup1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/setup1.js) · [solution1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/solution1.js) · [setup1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/setup1.html) · [solution1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo1/solution1.html)

Back to [5. Arrays](#5-arrays).

### 12.2 Question 1: What will be shown in the console? (slides 24–26)

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

> ✍️ **Try it first.**

**Answer: E** (highlighted on slide 26) — `number*fish*-2*blue*3*dog*2`.

| Line | Array afterwards |
|---|---|
| `array[5] = 'dog'` | `[ '1', 'fish', 2, 'blue', <1 empty item>, 'dog' ]` (grows; index 4 empty) |
| `array.push('2')` | `[ … , 'dog', '2' ]`, length 7 |
| `array[2] = array[6] - 4` | `'2' - 4` → `-2` (minus converts the string) |
| `array[0] = typeof array[2]` | `'number'` |
| `array[4] = array.indexOf('blue')` | `3` (fills the hole) |

Traps: B and D (identical on the slide) assume `undefined` everywhere; C treats `-` like `+` (`'24'`); A misplaces `'blue'`, which stays at index 3.

```viz web-demo
{"title": "Question 1 · q1.js (logs the array after every line)", "html": "<p>See the console.</p>", "height": 60, "source": "none", "js": "var array = ['1', 'fish', 2, 'blue'];\n\narray[5] = 'dog';\nconsole.log(array);\n\narray.push('2');\nconsole.log(array);\n\narray[2] = array[array.length - 1] - 4;\nconsole.log(array);\n\narray[0] = typeof array[2];\nconsole.log(array);\n\narray[4] = array.indexOf('blue');\nconsole.log(array);\n\nconsole.log(array.join('*'));"}
```

> 🧪 **Demo files**: [q1.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q1/q1.html) · [q1.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q1/q1.js)

Back to [5. Arrays](#5-arrays).

### 12.3 Demo 2: Hello from the future and tick-tock (slide 43 · setup2 → solution2)

Slide 43 ("Callback functions") shows `solution2.html` open with an empty console: the demo was run live. The task, from `setup2.js`:

- use `setTimeout()` to print "Hello from the future!" 5 seconds after the page is loaded
- alternate logging "ticks" and "tocks" every one second, creating a **named** function for tick and an **anonymous** function for tock

`setTimeout` takes two arguments: a callback function, and the time in ms until the function should be called. Starter:

```js
function helloFromTheFuture() {
	console.log("Hello from the future!");
}
```

> ✍️ **Try it first.**

**Answer** (`solution2.js`):

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

`helloFromTheFuture` is passed without parentheses. `tick` logs, then schedules the anonymous arrow function; that logs `tock` and schedules `tick` again, so they alternate forever. First ~6 seconds:

```
tick
tock
tick
tock
Hello from the future!
tick
```

At 5 s the hello timer and the third `tick` are both due; hello was scheduled first, so it wins.

```viz web-demo
{"title": "Demo 2 · solution2.js (wait ~5 s for the future)", "html": "<p>See the console.</p>", "height": 60, "js": "/*TODO:\n- use setTimeout() to print \"Hello from the future!\" 5 seconds after the page is loaded\n- alternate logging \"ticks\" and \"tocks\" every one second, creating a named function for tick and an anonymous function for tock\nsetTimeout takes two arguments: a callback function, time in MS until function should be called\nhttps://www.w3schools.com/jsref/met_win_settimeout.asp\n*/\n\nfunction helloFromTheFuture() {\n\tconsole.log(\"Hello from the future!\");\n}\n\nsetTimeout(helloFromTheFuture, 5000);\n\nfunction tick() {\n\tconsole.log('tick');\n\tsetTimeout(() => {\n\t\tconsole.log('tock');\n\t\tsetTimeout(tick, 1000);\n\t}, 1000);\n}\n\nsetTimeout(tick, 1000);"}
```

> 🧪 **Demo files**: [setup2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/setup2.js) · [solution2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/solution2.js) · [setup2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/setup2.html) · [solution2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/demo2/solution2.html)

> 🔗 **Go deeper**: [w3schools: setTimeout() (linked in setup2.js)](https://www.w3schools.com/jsref/met_win_settimeout.asp)

Back to [9. Passing functions and callbacks](#9-passing-functions-and-callbacks).
### 12.4 Question 2: Which will set max to the max? (slides 48–50)

Which will set `max` to the max of array `numbers`? (Whitespace does not matter in JavaScript.)

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

- **D** Two of the above
- **E** All of the above

> ✍️ **Try it first.**

**Answer: D** (highlighted on slide 50) — A and B work; C doesn't.

- **A** works: the callback updates the outer `max` for every element.
- **B** works: the accumulator (also named `max`, shadowing the outer one) starts at `-Infinity` and each call returns the larger value.
- **C** is broken: the loop never reads `numbers[i]`. It compares `num`, which doesn't exist here, so it throws **`ReferenceError: num is not defined`**. The fix is `if(numbers[i] > max) { max = numbers[i]; }`.

With `q2.js`'s `numbers = [1, 5, 10, 30, 6, 500]` the output is `A: 500`, `B: 500`, then the error:

```viz web-demo
{"title": "Question 2 · q2.js (C throws)", "html": "<p>See the console.</p>", "height": 60, "source": "none", "js": "var numbers = [1, 5, 10, 30, 6, 500];\n\n// ----- A ------\nvar max = Number.NEGATIVE_INFINITY;\n\nnumbers.forEach(function(num) {\n\tif(num > max) {\n\t\tmax = num;\n\t}\n});\n\nconsole.log(`A: ${max}`);\n\n\n// ----- B ------\nvar max = numbers.reduce(function(max, num) {\n\tif(num > max) {\n\t\tmax = num;\n\t}\n\treturn max;\n}, Number.NEGATIVE_INFINITY);\n\nconsole.log(`B: ${max}`);\n\n\n// ----- C ------\nvar max = Number.NEGATIVE_INFINITY;\n\nfor(var i=0;i < numbers.length; i++) {\n\tif(num > max) {\n\t\tmax = num;\n\t}\n}\n\nconsole.log(`C: ${max}`);"}
```

> 🧪 **Demo files**: [q2.html](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q2/q2.html) · [q2.js](https://github.com/travislindenreid/INF33-Demos/blob/main/W2_L2_Oct8_JavaScript/q2/q2.js)

Back to [10. forEach, map, filter and reduce](#10-foreach-map-filter-and-reduce).


---

## 13. Quick Reference & Top 5 Things to Remember

**Types and comparisons**

| Expression | Result |
|---|---|
| `typeof 'hi'` / `typeof 42` | `'string'` / `'number'` |
| `typeof null` / `typeof undefined` / `typeof NaN` | `'object'` / `'undefined'` / `'number'` |
| `'40' + 2` / `'40' - 4` | `'402'` / `36` |
| `10 == '10'` / `10 === '10'` / `'' == 0` | `true` / `false` / `true` |
| `undefined * 3`, `'word' - 5` | `NaN` |
| falsy | `null`, `undefined`, `NaN`, `0`, `''`, `false` |

**Strings and arrays**

| Call | Does |
|---|---|
| `s.toUpperCase()`, `s.substring(1, 4)`, `s.indexOf('x')` | new string; slice [1,4); position or `-1` |
| `` `text ${v}` `` | template literal |
| `a.push(x)` / `a.pop()` | add / remove last |
| `a.join('-')` | elements → one string |
| `a.indexOf(x)` | first index or `-1` |
| `a.splice(i, n)` | remove `n` items from index `i` (in place) |
| `a.concat(b)` | new combined array |
| `a.sort((x, y) => x - y)` | numeric sort (default sorts as strings) |

**Objects**

| Code | Does |
|---|---|
| `o['key']` / `o.key` | read (missing → `undefined`) |
| `o.key = v` | set or add |
| `Object.keys(o)` / `Object.values(o)` / `Object.entries(o)` | arrays of keys / values / `[key, value]` |

**Functions and callbacks**

| Code | Meaning |
|---|---|
| `function f(a) {…}` | declaration (hoisted) |
| `var f = function(a) {…}` | expression (only the `var` hoisted) |
| `var f = (a) => {…}` | arrow function (no own `this`) |
| `g(f)` vs `g(f())` | pass the function vs pass its result |
| `a.forEach(f)` / `a.map(f)` / `a.filter(f)` / `a.reduce(f, init)` | loop / transform / keep / accumulate |
| `setTimeout(f, ms)` | call `f` after `ms` milliseconds |
| `var` / `let` | function scope / block scope |

**Top 5 things to remember**

1. `+` with a string concatenates, `-` converts to numbers: `'40' + 2` is `'402'`, `'2' - 4` is `-2`. Use `===`, not `==`.
2. Assigning past the end of an array grows it with empty slots; reading a missing index or object key gives `undefined`, never an error.
3. Functions are values: store them in variables and object properties, and pass them **without parentheses** as callbacks.
4. `map` and `filter` return new arrays; `reduce` needs the callback to `return` the accumulator and a starting value.
5. `var` is function-scoped and hoisted as `undefined`; `let` is block-scoped and throws if used before its line. Arrow functions don't get their own `this`.
