# Information and Computer Science 45C — Week 1 整合 Reading 笔记

## 目录

- [1. 课程全景与学习路径](#1-课程全景与学习路径)
- [2. 第一个程序与编译流程](#2-第一个程序与编译流程)
- [3. 变量、类型与初始化](#3-变量类型与初始化)
- [4. 输入输出与字符串](#4-输入输出与字符串)
- [5. 运算符、表达式与基本数据](#5-运算符表达式与基本数据)
- [6. 控制结构](#6-控制结构)
- [7. 函数、参数与作用域](#7-函数参数与作用域)
- [8. 数组与指针](#8-数组与指针)
- [9. GoogleTest 入门](#9-googletest-入门)
- [10. Sample Quiz 0（Week 2）](#10-sample-quiz-0)
- [11. 综合速查表](#11-综合速查表)

> UCI ICS 45C: Programming in C++ (35770)  
> 本笔记已将 `cpp4python` 与 `LearnCpp.com` 的 Week 1 重合内容合并，按学习顺序整理。

---

## 1. 课程全景与学习路径

Week 1 的核心目标不是“学很多语法”，而是建立一条完整的 C++ 入门链条：

1. 先理解一个 C++ 程序是如何从源代码变成可执行文件的
2. 再掌握程序的基本结构：`main()`、语句、注释、格式
3. 接着学习变量、类型、初始化、输入输出、表达式
4. 在此基础上进入条件、循环、函数、数组、指针
5. 最后接触测试工具 GoogleTest

**学习建议：**

- 手动输入示例代码，不要只看不敲
- 先猜输出，再运行验证
- 每次只改一小部分，观察变化
- 一边写一边编译，不要攒一大堆错误
- 不懂时优先定位“是哪一层出了问题”：语法、类型、逻辑，还是编译流程

**开发五步骤：**

1. **Define the problem**：要解决什么问题？
2. **Determine solution**：设计方案，尽量简洁、模块化、可处理错误
3. **Write the program**：写代码
4. **Compile**：编译成可执行文件
5. **Test and debug**：测试并修 bug

**增量开发法（来自 LearnCpp 1.11）：**

新手常犯的错误是试图一口气写完整个程序，然后面对一大堆错误手足无措。正确的做法是**增量开发**：

1. **一次只加一小块代码**（比如一个函数）
2. **编译**，确保没有语法错误
3. **测试**，确认这一块逻辑正确
4. **确认没问题后，再加下一块**

程序跑起来之后，工作并没有结束。接下来要做**代码清理（cleanup）**：

- 删掉或注释掉临时的调试代码
- 补上必要的注释
- 处理错误情况（error handling）
- 整理代码格式，确保遵循最佳实践
- 检查是否有可以简化或合并的冗余逻辑

> 💡 **先让程序跑起来，再让程序跑得好。** 不要一开始就追求完美——但也不要跑起来就不管了。

> 可以把 Week 1 理解成：先学会“程序怎么存在”，再学会“程序怎么跑起来”。

---

## 2. 第一个程序与编译流程

### 2.1 C++ vs Python：编译型 vs 解释型

C++ 是**编译型语言**，Python 是**解释型语言**。

```bash
g++ -o myprogram myprogram.cpp
./myprogram
```

- C++ 代码要先经过编译，才能运行
- 编译阶段会提前发现很多语法错误和类型错误
- 这也是 C++ “更严格”的来源之一

### 2.2 一个最小 C++ 程序

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!\n";
    return 0;
}
```

```text
// 输出:
Hello, world!
```

这个程序里有几个 Week 1 必须认识的元素：

- `#include <iostream>`：引入标准输入输出库
- `main()`：程序入口
- `{}`：代码块
- `;`：语句结束符
- `return 0;`：告诉操作系统程序成功结束

### 2.3 `main()`、语句和注释

**语句（statement）** 是 C++ 中最小的独立执行单位，通常以 `;` 结尾。

```cpp
int x;
x = 5;
std::cout << x;   // 输出: 5
return 0;
```

**注释（comments）** 有两种：

```cpp
// 单行注释
/* 多行
   注释 */
```

好的注释应该解释 **why**，而不只是解释 **what**。

### 2.4 头文件与命名空间

```cpp
#include <iostream>
using namespace std;
```

- `#include` 是**预处理指令**
- `<iostream>` 提供 `cout` 和 `cin`
- `using namespace std;` 让你可以少写 `std::`

不过更推荐显式写 `std::cout`、`std::cin`，因为：

- 可读性更清楚
- 减少命名冲突
- 更符合现代 C++ 习惯

### 2.5 编译器、链接器、加载器

完整流程可以理解为：

```text
源代码(.cpp/.hpp)
  -> 预处理器 preprocessor
  -> 编译器 compiler
  -> 目标文件 object file
  -> 链接器 linker
  -> 可执行文件
  -> 加载器 loader
  -> 从 main() 开始执行
```

各部分职责：

- **预处理器**：处理 `#include`、`#define` 等
- **编译器**：检查语法，把 `.cpp` 编译成目标文件
- **链接器**：把多个目标文件和库拼接起来
- **加载器**：程序运行时把可执行文件装入内存

**库（library）** 是预先写好、可复用的代码集合：

- 标准库：如 `iostream`、`string`
- 第三方库：比如后面会见到的 GoogleTest

### 2.6 代码格式与命名

- C++ 忽略大多数空白字符，但**人不忽略**
- 花括号风格保持一致
- 缩进要统一
- 标识符要有描述性

**命名规则：**

- 可以包含字母、数字、下划线
- 不能以数字开头
- 区分大小写
- 不能使用关键字，如 `int`、`return`、`while`

---

## 3. 变量、类型与初始化

### 3.1 对象、变量与静态类型

几个基础概念：

- **data**：数据
- **object**：内存中存值的一块区域
- **variable**：有名字的对象
- **identifier**：变量名

```cpp
int x;
double price;
bool done;
```

C++ 是**静态类型语言**：

- 变量创建时必须有类型
- 类型一旦确定，就决定了它如何存储和解释值

这和 Python 不一样。Python 写：

```python
x = 5
x = "hello"
```

而 C++ 中一个 `int x` 不能直接变成字符串变量。

### 3.2 定义、赋值、初始化

```cpp
int x;      // 定义
x = 5;      // 赋值

int a = 5;  // copy initialization
int b(5);   // direct initialization
int c{5};   // brace initialization
int d{};    // value initialization -> 0
```

Week 1 里最重要的结论：

- **定义变量时就初始化**
- **优先使用 `{}`**

```cpp
int x{4.5};   // 编译错误，阻止窄化转换
int y = 4.5;  // 可以编译，但值变成 4
```

所以 `{}` 更安全。

### 3.3 未初始化变量与 Undefined Behavior

```cpp
int x;
std::cout << x;   // 危险
```

如果局部变量没有初始化，它里面通常是**垃圾值**。

这会导致 **undefined behavior（UB）**：

- 可能输出奇怪的数字
- 可能崩溃
- 也可能“看起来没问题”

但“看起来没问题”不代表代码是对的。

**最佳实践：永远在创建变量时初始化它。**

### 3.4 常量与 magic numbers

```cpp
constexpr double pi{3.1415926};
constexpr char newline{'\n'};
```

- `constexpr` 表示编译期常量
- 常量不能被修改
- 用有名字的常量比直接写数字更清楚

```cpp
double area(double r) {
    return pi * r * r;
}
```

### 3.5 Week 1 常见基本类型

| 类型 | 作用 |
|------|------|
| `int` | 整数 |
| `float` / `double` | 浮点数 |
| `bool` | 真 / 假 |
| `char` | 单个字符 |
| `pointer` | 地址 |

修饰符：

- `short`
- `long`
- `unsigned`

它们会影响取值范围或内存占用。

---

## 4. 输入输出与字符串

### 4.1 `cout`、`cin`、`endl`

```cpp
#include <iostream>

int main() {
    int x{};
    std::cin >> x;
    std::cout << "You entered: " << x << '\n';
    return 0;
}
```

```text
// 输入: 42
// 输出:
You entered: 42
```

- `std::cout <<`：输出
- `std::cin >>`：输入
- `std::endl`：换行并刷新缓冲区
- `'\n'`：只换行，通常更高效

```cpp
std::cout << "Hello" << std::endl;
std::cout << "Hello\n";
```

Week 1 推荐优先用 `'\n'`。

### 4.2 insertion / extraction operator

```cpp
std::cout << "A" << "B" << '\n';   // 输出: AB
std::cin >> value;
```

- `<<`：insertion operator
- `>>`：extraction operator

它们可以链式使用：

```cpp
std::cout << "x = " << x << '\n';
```

### 4.3 单词输入 vs 整行输入

```cpp
std::string name{};
std::cin >> name;
```

这只会读到**下一个单词**，遇到空格就停。

如果要读一整行：

```cpp
#include <string>

std::string line{};
std::getline(std::cin, line);
```

### 4.4 `char` 和 `string`

```cpp
char letter{'A'};
std::string name{"Hello"};
```

- `'A'` 是 `char`
- `"Hello"` 是字符串字面量
- 在本课程里，看到单引号先想到“单个字符”

Python 里 `'a'` 和 `"a"` 几乎没差，但 C++ 里它们是不同概念。

### 4.5 `string` 基本操作

```cpp
#include <string>

std::string s{"Hello"};
std::cout << s[0] << '\n';         // 输出: H
std::cout << s.size() << '\n';     // 输出: 5

for (char c : s) {
    std::cout << c << ' ';
}
// 输出: H e l l o
```

- `s[i]`：按下标访问字符
- `s.size()`：长度
- range-based `for` 可以逐字符遍历

---

## 5. 运算符、表达式与基本数据

### 5.1 数值类型与整数除法

```cpp
std::cout << 7 / 3 << '\n';     // 2
std::cout << 7.0 / 3 << '\n';   // 2.333...
std::cout << 7 % 3 << '\n';     // 1
```

重要规则：

- `int / int` 做**整数除法**
- `%` 是取余，只用于整数

| Python | C++ |
|--------|-----|
| `7 // 3` | `7 / 3` |
| `7 / 3` | `7.0 / 3` |
| `2 ** 10` | `pow(2, 10)` |

### 5.2 布尔与逻辑运算

```cpp
bool flag{true};
bool test{false};
```

| Python | C++ |
|--------|-----|
| `and` | `&&` |
| `or` | `||` |
| `not` | `!` |

关系运算符：

- `<`
- `>`
- `<=`
- `>=`
- `==`
- `!=`

### 5.3 字面量与运算符

**字面量（literal）** 是代码中直接写出的值：

```cpp
5
3.14
'A'
"Hello"
true
```

**运算符（operator）** 是对值做运算的符号：

- 算术：`+ - * / %`
- 赋值：`= += -= *= /= %=`
- 比较：`== != < >`
- 逻辑：`&& || !`

### 5.4 自增、自减与优先级

```cpp
int x{10};
x++;
x--;
```

- `x++`：自增
- `x--`：自减

优先级不确定时，最安全的做法是**加括号**。

```cpp
2 + 3 * 4;    // 14
(2 + 3) * 4;  // 20
```

### 5.5 运算符优先级与结合性

当一个表达式中出现多个运算符时，C++ 根据**优先级（precedence）** 和**结合性（associativity）** 决定计算顺序。

**优先级**：数字越高，越先计算。

| 优先级 | 运算符 | 说明 | 结合性 |
|--------|--------|------|--------|
| 1（最高）| `::` | 作用域解析 | 左→右 |
| 2 | `()` `[]` `.` `->` `++`(后缀) `--`(后缀) | 后缀/调用 | 左→右 |
| 3 | `++`(前缀) `--`(前缀) `+`(一元) `-`(一元) `!` `~` `(type)` `*`(解引用) `&`(取址) `sizeof` | 前缀/一元 | 右→左 |
| 4 | `*` `/` `%` | 乘除取余 | 左→右 |
| 5 | `+` `-` | 加减 | 左→右 |
| 6 | `<<` `>>` | 位移 / 流操作 | 左→右 |
| 7 | `<` `<=` `>` `>=` | 关系比较 | 左→右 |
| 8 | `==` `!=` | 相等判断 | 左→右 |
| 9 | `&` | 按位与 | 左→右 |
| 10 | `^` | 按位异或 | 左→右 |
| 11 | `\|` | 按位或 | 左→右 |
| 12 | `&&` | 逻辑与 | 左→右 |
| 13 | `\|\|` | 逻辑或 | 左→右 |
| 14 | `?:` | 三元条件 | 右→左 |
| 15 | `=` `+=` `-=` `*=` `/=` `%=` 等 | 赋值 | 右→左 |
| 16（最低）| `,` | 逗号 | 左→右 |

**结合性**说明当优先级相同时，从哪边开始计算：

```cpp
// 左→右结合：同优先级从左算起
8 - 3 - 2     // = (8 - 3) - 2 = 3，不是 8 - (3 - 2) = 7

// 右→左结合：赋值从右算起
int a, b, c;
a = b = c = 5;   // = a = (b = (c = 5))，先赋 c，再 b，再 a
```

**常见例子：**

```cpp
2 + 3 * 4       // 14：* 优先级高于 +，先算 3*4=12，再算 2+12
!x == 0         // (!x) == 0：! 是一元运算符，优先级高于 ==
x = y == 5      // x = (y == 5)：== 优先级高于 =
a && b || c     // (a && b) || c：&& 优先级高于 ||
cout << x + 1   // cout << (x + 1)：+ 优先级高于 <<
```

> 💡 **最佳实践**：不确定优先级时，直接加括号 `()` —— 括号优先级最高，且让代码更易读。

### 5.6 表达式与表达式语句

```cpp
2 + 3
x = 5
x
```

这些都是**表达式（expression）**。

表达式加上分号后就成为**表达式语句**：

```cpp
x = 5;
```

### 5.7 核心结论

- C++ 中“值”和“类型”绑定得更紧
- 运算符会受到操作数类型影响
- `int / int` 是 Week 1 最容易掉坑的地方之一

---

## 6. 控制结构

### 6.1 `if / else if / else`

```cpp
if (score >= 90) {
    std::cout << "A\n";
} else if (score >= 80) {
    std::cout << "B\n";
} else {
    std::cout << "F\n";
}
```

- 条件必须写在 `()`
- 代码块通常写在 `{}`
- Python 的 `elif` 在 C++ 里写成 `else if`

### 6.2 `switch`

```cpp
switch (grade) {
    case 'A': std::cout << "Excellent"; break;
    case 'B': std::cout << "Good"; break;
    default:  std::cout << "Other";
}
```

特点：

- 适合离散值判断
- `case` 后常常要写 `break`
- `default` 类似“其他情况”

### 6.3 `while`

```cpp
int count{0};
while (count < 5) {
    std::cout << count << '\n';
    ++count;
}
```

```text
// 输出:
0
1
2
3
4
```

### 6.4 `for`

```cpp
for (int i{0}; i < 10; ++i) {
    std::cout << i << '\n';
}
```

```text
// 输出:
0
1
2
3
4
5
6
7
8
9
```

对应 Python：

| Python | C++ |
|--------|-----|
| `for i in range(10):` | `for (int i = 0; i < 10; ++i)` |

### 6.5 range-based `for`

```cpp
for (int n : nums) {
    std::cout << n << '\n';
}
```

这更像 Python 的：

```python
for x in nums:
    print(x)
```

### 6.6 `break` 与 `continue`

```cpp
for (int i{0}; i < 10; ++i) {
    if (i == 3) {
        continue;
    }
    if (i == 8) {
        break;
    }
    std::cout << i << '\n';
}
```

```text
// 输出: (跳过 3，在 8 时停止)
0
1
2
4
5
6
7
```

- `continue`：跳过本轮
- `break`：结束整个循环

---

## 7. 函数、参数与作用域

### 7.1 为什么要用函数

函数的五大价值（来自 LearnCpp 2.6）：

1. **组织（organization）**：把大问题拆成小问题，每个函数负责一件事
2. **复用（reusability）**：写一次，到处调用，避免重复代码（DRY 原则）
3. **测试（testing）**：小函数更容易单独测试，bug 更容易定位
4. **可扩展性（extensibility）**：更容易维护和扩展
5. **抽象（abstraction）**：调用者只需要知道函数**做什么**（接口），不需要知道**怎么做**（实现）

```cpp
// 调用者只需要知道：传入两个 int，返回它们的和
int result = add(3, 4);
// 不需要关心 add 内部是怎么实现的
```

抽象的好处：降低使用复杂度。就像你开车不需要知道发动机怎么工作，只需要知道踩油门加速、踩刹车减速。

> 💡 这个概念和 Week 2 学的 **封装（encapsulation）** 是一脉相承的：class 把数据和函数打包在一起，对外只暴露接口，隐藏内部实现。

**最好让一个函数只做一件事。**

### 7.2 定义函数

```cpp
int add(int a, int b) {
    return a + b;
}

void greet(std::string name) {
    std::cout << "Hello " << name << '\n';
}
```

- 函数必须写返回类型
- 参数也必须写类型
- `void` 表示无返回值

### 7.3 声明与定义

```cpp
double average(double x, double y);   // declaration

int main() {
    std::cout << average(2.0, 3.0) << '\n';   // 输出: 2.5
}

double average(double x, double y) {  // definition
    return (x + y) / 2.0;
}
```

- **声明**：告诉编译器“它存在”
- **定义**：给出真正实现
- 调用前，编译器至少要先见过声明

### 7.4 返回值与 `void`

```cpp
int getValueFromUser() {
    int input{};
    std::cin >> input;
    return input;
}
```

```cpp
void printHello() {
    std::cout << "Hello!\n";
}
```

规则：

- `int` 函数要返回 `int`
- `void` 函数不返回值
- 非 `void` 函数忘记 `return` 可能导致 UB

### 7.5 参数、实参、值传递

```cpp
void print(int x) {
    std::cout << x << '\n';
}

print(5);   // 输出: 5
```

- `x` 是参数（parameter / 形参）
- `5` 是实参（argument）

默认情况下，C++ 是**值传递（pass by value）**：

- 函数拿到的是副本
- 修改副本不会影响原变量

```cpp
void addOne(int x) {
    ++x;   // 只修改了副本，原变量不受影响
}

int a{5};
addOne(a);
std::cout << a << '\n';   // 输出: 5 (a 没有变)
```

### 7.6 局部作用域

```cpp
void func() {
    int x{5};
    std::cout << x;
}
```

- 局部变量在定义处创建
- 在所属代码块结束时销毁
- 不同函数里的同名局部变量互不影响

---

## 8. 数组与指针

### 8.1 数组

```cpp
int scores[5] = {90, 85, 78, 92, 88};
std::cout << scores[0] << '\n';   // 输出: 90
```

| Python list | C++ 数组 |
|-------------|----------|
| 动态大小 | 固定大小 |
| 可混合类型 | 必须同类型 |
| 越界有异常 | 越界可能 UB |
| `append()` | 不支持 |

### 8.2 数组作为参数

```cpp
double average(int list[], int length) {
    double total{0};
    for (int i{0}; i < length; ++i) {
        total += list[i];
    }
    return total / length;
}
```

函数接收数组时，通常要同时传长度。

### 8.3 指针

> 指针就是“存地址的变量”。

```cpp
int value{100};
int* ptr{&value};

std::cout << value << '\n';    // 输出: 100
std::cout << &value << '\n';   // 输出: 某内存地址，如 0x7ffd5e3a2b4c
std::cout << *ptr << '\n';     // 输出: 100
```

三件事必须分清：

- `&x`：取地址
- `int* ptr`：声明指针
- `*ptr`：解引用，取出指向的值

```cpp
*ptr = 2000;
std::cout << value << '\n';   // 2000
```

### 8.4 `nullptr`

```cpp
int* ptr{nullptr};
```

- `nullptr` 表示“不指向任何对象”
- 解引用空指针是严重错误

---

## 9. GoogleTest 入门

### 9.1 基本层次

```text
测试程序
  -> 测试套件
    -> 测试
      -> 断言
```

- **Assertion**：检查条件
- **Test**：一组断言
- **Test Suite**：相关测试的集合

### 9.2 `EXPECT_*` vs `ASSERT_*`

| 类型 | 失败后行为 | 适用场景 |
|------|-----------|---------|
| `EXPECT_*` | 非致命，继续执行 | 大多数情况 |
| `ASSERT_*` | 致命，立即停止当前函数 | 后续代码依赖该条件时 |

常见断言：

- `EXPECT_TRUE(condition)`
- `EXPECT_FALSE(condition)`
- `EXPECT_EQ(a, b)`
- `EXPECT_NE(a, b)`
- `EXPECT_LT(a, b)`
- `EXPECT_LE(a, b)`
- `EXPECT_GT(a, b)`
- `EXPECT_GE(a, b)`
- `EXPECT_STREQ(s1, s2)`

### 9.3 简单测试

```cpp
#include <gtest/gtest.h>

TEST(FactorialTest, HandlesZeroInput) {
    EXPECT_EQ(Factorial(0), 1);
}

TEST(FactorialTest, HandlesPositiveInput) {
    EXPECT_EQ(Factorial(1), 1);
    EXPECT_EQ(Factorial(2), 2);
    EXPECT_EQ(Factorial(3), 6);
}
```

规则：

- `TEST(测试套件名, 测试名)`
- 名字不能带下划线 `_`
- 同一个 suite 里的测试名不能重复

### 9.4 什么时候用 `ASSERT_*`

```cpp
TEST(QueueTest, DequeueWorks) {
    Queue q;
    q.Enqueue(1);
    int* n = q.Dequeue();

    ASSERT_NE(n, nullptr);
    EXPECT_EQ(*n, 1);

    delete n;
}
```

如果不先断言 `n != nullptr`，后面 `*n` 可能直接崩溃。

---

## 10. Sample Quiz 0

> ⚠️ **注意**：Sample Quiz 0 是 **Week 2** 的内容（Week 2 Thursday 考），这里保留作为提前参考。
>
> Assume all necessary `#include`s are present and correct.

### 10.1 运算符优先级

题目：

```cpp
x = +a + b * c - d / -e
y = z = -a - b / c * d
```

完全加括号后：

```cpp
(x = (((+a) + (b * c)) - (d / (-e))))
(y = (z = ((-a) - ((b / c) * d))))
```

### 10.2 写 `square`

```cpp
int square(int i) {
    return i * i;
}
```

### 10.3 输出 `1` 到 `10` 及其平方

```cpp
int main() {
    for (int i = 1; i <= 10; ++i) {
        std::cout << i << ' ' << square(i) << '\n';
    }
    return 0;
}
```

```text
// 输出:
1 1
2 4
3 9
4 16
5 25
6 36
7 49
8 64
9 81
10 100
```

### 10.4 对象生命周期

**题目：** 给出 C++ 中对象生命周期每一步的具体术语。

**答案：**

```
1) Birth（诞生）
   1a) Allocation    — 分配内存
   1b) Construction  — 构造对象
2) Life（存活）
3) Death（死亡）
   3a) Destruction   — 析构对象
   3b) Deallocation  — 释放内存
```

> ⚠️ 是 **Destruction**，不是 ~~Deconstruction~~。写错扣 5 分。

### 10.5 这题在考什么

这份 Quiz 其实在同时检查四件事：

- 你会不会读运算符优先级
- 你会不会写一个最小函数
- 你会不会写 `for` 循环
- 你有没有把“对象生命周期”概念记清楚

---

## 11. 综合速查表

| 概念 | Python | C++ |
|------|--------|-----|
| 输出 | `print("hi")` | `cout << "hi" << '\n';` |
| 输入 | `x = input()` | `cin >> x;` |
| 变量 | `x = 5` | `int x{5};` |
| 类型 | 动态 | 静态 |
| 整数除法 | `7 // 3` | `7 / 3` |
| 幂 | `2 ** 10` | `pow(2, 10)` |
| 布尔 | `True / False` | `true / false` |
| 逻辑 | `and / or / not` | `&& / || / !` |
| 条件 | `if x > 0:` | `if (x > 0) {}` |
| `elif` | `elif` | `else if` |
| 循环 | `for i in range(n):` | `for (int i = 0; i < n; ++i)` |
| 函数 | `def f(x):` | `int f(int x) {}` |
| 无返回值 | `def f():` | `void f() {}` |
| 字符 | `'a'` | `'a'` 是 `char` |
| 字符串 | `"abc"` | `std::string{"abc"}` |
| 数组 | `[1, 2, 3]` | `int a[]{1, 2, 3};` |
| 指针 | 无直接等价 | `int* p = &x;` |
| 空指针 | `None` | `nullptr` |
| 自增 | `x += 1` | `++x` 或 `x++` |
| 测试 | `assert` / `unittest` | GoogleTest |

**Week 1 最重要的五条记忆：**

1. C++ 是静态类型语言
2. 变量定义时就初始化，优先用 `{}`
3. `int / int` 是整数除法
4. `main()` 是程序入口
5. 函数必须先声明再调用；默认参数传递方式是值传递