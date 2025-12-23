项目的技术难点 怎么调研方案 怎么从用户层考虑优化方案
前端给页面加水印 说说各种编码的特点
- js 数据类型 怎么区别array 和 object
string number boolean undefined null symbol  bigInt array object function 
typeof 无法区分  typeof []  'object' 
instanceof   有局限性 检测原型链   [] instanceof Array  // true  [] instanceof Object // true
constructor  是对象的内置属性 指向创建该对象的构造函数  arr.constructor === Array // true  arr.constructor === Object // false
但是有局限性 因为constructor是可以更改的 更改后就失效了 
引用数据类型是一直有constructor number、boolean、string 原始值本身无属性，访问时自动装箱为包装对象，包装对象有 constructor
null 和 undefined 无原型、无包装对象，访问 constructor 直接报错
Object.create(null) 创建的对象 原型链为空，未继承 Object.prototype，无 constructor 属性
Array.isArray()  最准确、最简洁判断方法 Array.isArray(null) // false  Array.isArray(undefined); // false
Object.prototype.toString.call() 「未被重写的原始版本」 最精准、兼容性最好的原生类型检测方法 
调用该方法时，会读取目标对象的内部属性 [[Class]]（一个字符串），
call() 的作用： Object.prototype.toString() 本身是挂载在 Object 原型上的方法，直接调用时 this 指向 Object.prototype；通过 call() 可以强制将 this 绑定到要检测的目标值上，
Object.prototype.toString.call([]) // "[object Array]"
// 封装成工具函数（推荐）
function getType(val) {
    return Object.prototype.toString.call(val).slice(8, -1); // 截取类型名（如 "Array"）
}
为什么不用普通的 toString() ？不同类型的对象重写了 toString() 方法 [1,2].toString() → "1,2"  普通对象的 toString() → 固定返回 "[object Object]"
- 原型链 es6 class 怎么设置原型 静态、实例方法
> class 本质是函数和原型链的语法糖，静态方法用static定义在类本身实力是不能访问的，实例方法定义在 prototype 上  extends实现继承设置原型
```
class Animal {
    constructor(type) {
        this.type = type;
    }
    move() { console.log(`${this.type}在移动`); }
    static isAnimal(obj) { return obj instanceof Animal; }
}
class Dog extends Animal {
    constructor(name) {
        super('狗');
        this.name = name;
    }
}
var dog = new Dog()
dog（实例）.__proto__ → Dog.prototype
Dog.prototype.__proto__ → Animal.prototype
Animal.prototype.__proto__ → Object.prototype
Object.prototype.__proto__ → null

Dog（类）.__proto__ → Animal（类）
Animal（类）.__proto__ → Function.prototype
Function.prototype.__proto__ → Object.prototype
Object.prototype.__proto__ → null
```

- let const区别 const 声明了数组 还能push元素么 为什么
let 块级作用域 声明变量  const 块级作用域 声明常量 声明必须赋值 不允许重新赋值
数组是「引用类型」：变量 arr 存储的是 “指向数组实际数据的内存地址”（堆内存），const 锁定的是这个 “地址指针”，而非堆内存里的数组内容；
push/ 修改元素：只是修改堆内存中数组的内部数据，并没有改变 arr 指向的内存地址，因此符合 const 的规则。

const 声明原始类型：栈内存的值不可改 → 完全不能重新赋值；
const 声明引用类型：栈内存的地址不可改 → 不能重新赋值，但可修改堆内存的内部数据；
let 无此限制：无论原始 / 引用类型，都可重新赋值（基本数据类型改值 / 引用数据类型改地址）。

- 经常用到的array 方法 类数组怎么转为数组
- 改变原数组的
    - push() 尾部添加 返回新数组长度
    - pop() 尾部删除 返回新数组长度
    - unshift() 头部添加  返回新数组长度
    - shift()  头部删除 返回新数组长度
    - splice() 任意位置增 / 删 / 改，返回被删除的元素数组
    - reverse() 数组反转 返回新数组
    - fill() 填充 返回新数组
    - sort() 排序 返回新数组
- 不改变原数组的
    - concat() 连接   返回新数组
    - join() 转成字符串  返回字符串
    - flat() 扁平化数据  返回新数组
    - forEach() 遍历 无返回值
    - map 返回新数组
    - filter() 返回新数组
    - find()  找第一个符合条件的元素，返回元素 /undefined
    - findIndex() 找第一个符合条件的索引，返回索引 /-1
    - some() 有一个符合条件返回 true
    - every() 所有元素符合条件返回 true
    - indexOf()  找元素首次出现的索引，返回索引 /-1
    - includes() 判断是否包含元素，返回布尔值
    - slice()  截取数组（含头不含尾），返回新数组
    - reduce()  返回新数组
- 类数组怎么转为数组   
    - 扩展运算符 [...arr]  
    - Array.from()    Array.from(arrLike, (item) => item * 2);
    - Array.prototype.slice.call() 原理：slice() 方法内部会根据 length 遍历索引，返回新数组   const arrLike = { 0: 10, 1: 20, length: 2 }; const arr = [].slice.call(arrLike); // [10,20]（简化写法，等效上面）

- dom 怎么添加事件
    - addEventListener   removeEventListener
    - btn.onclick = function() {}
    - 事件委托（事件代理） e.target：实际触发事件的元素（事件源） e.currentTarget：绑定事件的元素
- cookie localstorage 的区别 那些情况和设置 请求不会携带 cookie 
 1. 存储大小： cookie 4kb  localstorage 5M 
 2. 生命周期： cookie可这是过期时间  localstorage不会自动删除
 3. 服务器交互:  自动携带到同源请求的 HTTP 头中（Cookie 字段）  完全存储在客户端，默认不参与服务器交互
 4. 访问权限:  cookie客户端（JS）+ 服务端（HTTP 头）均可读写   localstorage仅客户端（JS）可读写
 5. 作用域: 可通过 Domain/Path 限制生效范围   localstorage同域名 / 同协议 / 同端口下共享
-  那些情况和设置 请求不会携带 cookie 
 1. httponly 仅能通过 HTTP/HTTPS 请求携带，客户端 JS 无法访问（document.cookie 读不到）；
 2. 跨域 协议 / 端口不匹配
 3. SameSite 属性  限制跨站请求时 Cookie 的携带规则
    - Strict 仅同站请求（同域名 + 同协议 + 同端口）携带，跨站（如跳转、跨域 AJAX）均不携带
    - Lax 跨站的「导航类请求」（如链接跳转、表单提交）携带，AJAX/Fetch 跨域不携带（默认值）
    - None 所有的都携带

- fetch 优缺点 怎么做polyfill
    - 优点: 语法简洁、语义清晰： 基于promise的链式调用，async await语法简繁
    - 优点: 流式的处理数据， XHR 只能「一次性接收完整响应】，而 Fetch的response.body 是 ReadableStream（可读流），可以「边接收边处理」，适合超大文件、实时日志、视频流等场景。
    - 缺点：错误的捕获上 即使响应是 404/500 等状态码，Fetch 也不会触发 catch，需手动判断 response.ok
    - 不支持取消请求
    - 无法直接监听请求 / 响应的进度（如文件上传进度）
    - 无超时默认配置， 需手动结合 Promise.race 实现超时逻辑，原生无 timeout 参数
```
    async function fetchData() {
        try {
            const response = await fetch('https://api.example.com/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: 1 }),
                credentials: 'include' // 跨域携带 Cookie
            });
            // 必须手动判断状态码，否则 404/500 不会进入 catch
            if (!response.ok) { 
                throw new Error(`HTTP 错误：${response.status}`);
            }
            const data = await response.json(); // 原生解析 JSON
            console.log(data);
        } catch (err) {
            console.error('请求失败：', err);
        }
    }
```
```
fetch('https://api.example.com/large-file.log')
  .then(response => {
    // 1. 获取可读流
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8'); // 解码二进制流为文本
    // 2. 逐段读取流（边读边处理）
    function readChunk() {
      reader.read().then(({ done, value }) => {
        if (done) {
          console.log('文件读取完成');
          return;
        }
        // 3. 处理当前段数据（比如实时打印日志）
        const chunk = decoder.decode(value);
        console.log('收到日志片段：', chunk);
        // 继续读取下一段
        readChunk();
      });
    }

    readChunk();
  });
```
```
    function timeoutPromise(delay) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`请求超时（${delay}ms）`));
            }, delay);
        });
    }
    function fetchData(url) {
        return fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }).then(response => {
            if (!response.ok) throw new Error(`HTTP 错误：${response.status}`);
            return response.json();
        });
    }
    // 结合 Promise.race 实现超时控制（5秒超时）
    async function requestWithTimeout(url) {
        try {
            // 谁先完成就执行谁：请求完成 / 5秒超时
            const result = await Promise.race([
                fetchData(url),       // 业务 Promise
                timeoutPromise(5000)  // 超时 Promise（5000ms = 5秒）
            ]);
            return result;
        } catch (err) {
            throw err;
        }
    }

    requestWithTimeout('https://api.example.com/data');
```

- flex: 1  flex: 1 1 0缩写
> Flex 项目的 flex 属性是 flex-grow、flex-shrink、flex-basis 的简写  flex: <flex-grow> <flex-shrink> <flex-basis>;
    -  flex-grow: 容器有剩余空间时，项目会按比例瓜分剩余空间（1 表示参与瓜分）
    - flex-shrink: 容器空间不足时，项目会按比例缩小（1 表示参与收缩）
    - flex-basis: 设置容器的初使尺寸 
- vue 使用nextTick 原因和场景 
 > 数据更新后， 立即操作 / 获取更新后的 DOM ---- 数据变了，想立刻用最新 DOM → 套一层 nextTick。
 - Vue 采用「异步更新 DOM」策略：当你修改 data 里的数据时，Vue 不会立刻更新 DOM，而是将数据变更缓存到「异步更新队列」，等当前同步代码执行完后，再批量更新 DOM（避免频繁操作 DOM 导致性能损耗）。
- Map Set WeakMap  WeakSet
> 区别 需要存对象，且希望对象不用时自动回收 → 用 WeakMap/WeakSet；需要遍历 / 存基本类型 → 用 Map/Set。
 1. map 
    - 键值对结合；
    - 键唯一，值可重复；
    - 键可以使任意类型（基本数据类型、对象、函数）；
    - size属性；
    - 常用方法：set(key, val)/get(key)/has(key)/delete(key)；
    - 遍历： 可按「键、值、键值对」遍历（keys()/values()/entries()）
```
    // 1. 用对象当键（普通对象做不到，对象键会被转为字符串）
    const objKey = { id: 1 };
    const map = new Map();
    map.set(objKey, '用户1'); 
    console.log(map.get(objKey)); // 输出：用户1（精准匹配对象键）

    // 2. 遍历 Map
    for (const [key, value] of map.entries()) {
    console.log(key, value); // {id:1}  用户1
    }
```
 2. set 
   - 值的结合；
   - 无重复值；
   - 值可以是任意类型；
   - size属性；
   - 常用方法： add(val)/has(val)/delete(val)/clear()；
   - 遍历：仅遍历「值」（keys()/values() 均返回值）
```
    // 1. 数组去重（前端最常用）
    const arr = [1, 2, 2, 3];
    const uniqueArr = [...new Set(arr)]; // [1,2,3]

    // 2. 判断值是否存在（比数组 indexOf 更高效）
    const set = new Set([1,2,3]);
    console.log(set.has(2)); // true
    console.log(set.has(4)); // false
```
3. WeakMap	键是对象（弱引用）、不可遍历、无 size
4. WeakSet	值是对象（弱引用）、不可遍历、无 size

- https 怎么保证数据安全
 - 数字证书 + CA认证
 1. 服务器的公钥会交给第三方权威机构（CA）认证，生成「数字证书」（包含公钥、服务器域名、CA 签名）
 2. 客户端拿到证书后，会验证 3 件事：证书是否由可信 CA 签发；证书域名是否和请求域名一致；证书是否未过期 / 未被吊销
 - 对称加密和非对称加密传递数据
1. 非对称加密
 - 服务器有一对「公钥 + 私钥」：公钥可公开，私钥自己保管；
 - 客户端请求时，服务器把「带数字证书的公钥」发给客户端；
 - 客户端生成一个「随机对称密钥」（后续传数据用），用服务器公钥加密后发回服务器；
 - 服务器用私钥解密，拿到这个对称密钥
2. 对称加密 （对称加密效率高，适合大量数据传输）。
- 客户端和服务器用刚才协商的「对称密钥」加密所有传输数据， （请求头、请求体、响应内容）

- 大型文件传输，前后端怎么处理 数据流上的具体操作 秒传、分片传输、断点传输的具体实现方案

最小生成树的定义和构建过程 算法实现思路
> 核心目标是：用最少的总权重，连接图中所有顶点，且不形成环路。
topN 问题 堆和递归如何配合使用 有没有其他方法
常用的排序算法 时间复杂度和空间复杂度
输入URL 到渲染的全过程
怎么度量一个页面渲染的速度 性能
跨域解决方案




web 应用中如何对静态资源加载失败的场最做降级处理
Q2.htm| 中前缀为 data-开头的元素厘性是什么?
Q3.移动端如何实现上拉加载，下拉刷新?
Q4.如何判断dom元素是否在可视区域
Q5.前端如何用 canvas 来做电影院选票功能
Q6.如何通过设置失效时间清除本地存储的数据?
Q7,如果不使用脚手架， 如果用 webpack 构建一个自己的 react应用
Q8.用 nodejs 实现一个命令行工具， 统计输入目录下面指定代码的行数
Q9,packagejson 里面 sideEffects 厘性的作用是啥
Q10.script 标签上有那些厘性，分别作用是啥?
Q11.为什么 SPA 应用都会提供一个 hash 路由，好处是什么?
Q12.[React]如何进行路由变化监听
Q14.web 网页如何禁止别人移除水印
Q15,用户访问页面白屏了， 原因是啥， 如何排查?
Q16.[代码实现JJS 中如何实现大对象深度对比
Q17,如何理解数据驱动视图， 有哪些核心要素

请求失败会弹出一个 toast,如何保证批量请求失败，只弹出一个 toast
如何减少项目里面 if-else
babel-runtime 作用是啥
如何做好前端监控方案
如何标准化处理线上用户反馈的问题
px 如何转为 rem
浏览器有同源策略，但是为何 cdn 请求资源的时候不会有 跨域限制
cookie 可以实现不同域共享吗
axios 是否可以取消请求
前端如何实现折叠面板效果?
dom 里面，如何判定a元素是否是b元素的子元
判断一个对象是否为空，包含了其原型链上是否有自定义 数据或者方法。该如何判定?
css 实现翻牌效果
flex:1代表什么
一般是怎么做代码重构的
如何清理源码里面没有被应用的代码， 主要是 JS、TS、 CSS 代码
前端应用 如何做国际化?
应用如何做应用灰度发
[微前端] 为何通常在 微前端 应用隔离， 不选择 iframe 方案
[微前端]Qiankun是如何做 JS 隔离的
[微前端] 微前端架构一般是如何做 JavaScript隔离
[React]循环渲染中 为什么推荐不用 index 做 key
[React]如何避免使用 context 的时候，引起整个挂载节 点树的重新渲染
前端如何实现截图?
当QPS达到峰值时,该如何处理?
JS 超过 Number 最大值的数怎么处理?
使用同一个链接，如何实现 PC 打开是 web 应用、手机打开是一个 H5 应用?
如何保证用户的使用体验
如何解决页面请求接口大规模并发问题
设计一套全站请求耗时统计工具
大文件上传了解多少
H5 如何解决移动端适配问题
站点一键换肤的实现方式有哪些?
如何实现网页加载进度条?
常见图片懒加载方式有哪些?
cookie 构成部分有哪些
扫码登录实现方式
DNS 协议了解多少
函数式编程了解多少?
前端水印了解多少?
什么是领域模型
一直在 window 上面挂东西是否有什么风险
深度 SEO优化的方式有哪些，从技术层面来说
小程序为什么会有两个线程
web 应用中如何对静态资源加载失败的场景做降级处理
html中前缀为 data-开头的元素属性是什么?
移动端如何实现上拉加载，下拉刷新
如何判断dom元素是否在可视区域
前端如何用 canvas 来做电影院选票功能
如何通过设置失效时间清除本地存储的数据?
如果不使用脚手架，如果用webpack构建一个自己的 react 应用
用 nodejs 实现一个命令行工具，统计输入目录下面指定代码的行数
package.json 里面 sideEffects 属性的作用是啥
script 标签上有那些属性，分别作用是啥?
为什么 SPA应用都会提供一个 hash 路由，好处是什么?
[React]如何进行路由变化监听
单点登录是是什么，具体流程是什么
web 网页如何禁止别人移除水印
用户访问页面白屏了，原因是啥，如何排查?
[代码实现] JS 中如何实现大对象深度对比
如何理解数据驱动视图，有哪些核心要素?vue-cli 都做了哪些事儿，有哪些功能?
JS 执行 100万个任务，如何保证浏览器不卡顿?
JS 放在 head 里和放在 body 里有什么区别?
Eslint 代码检查的过程是啥?
虚拟混动加载原理是什么， 用 JS 代码简单实现一个虚拟滚动加加载
[React]react-router和 原生路由区别
html的行内元素和块级元素的区别
介绍-下requestldleCallback api
documentFragment api是什么，有哪些使用场景?
git pull 和 git fetch 有啥区别?
前端如何做 页面主题色切换
前端视角-如何保证系统稳定性
如何统计长任务时间、长任务执行次数
V8 里面的 JIT 是什么?
用 JS 写一个 cookies 解析函数，输出结果为一个对象
vue 中 Scoped Styles 是如何实现样式隔离的， 原理是 啥?
样式隔离方式有哪些
在JS中，如何解决递归导致栈溢出问题?
站点如何防止爬虫?
在表单校验场景中，如何实现页面视口滚动到报错的位置
如何一次性渲染十万条数据还能保证页面不卡顿
[webpack]打包时 hash 码是如何生成的
如何从 0到1搭建前端基建
你在开发过程中，使用过哪些 TS 的特性或者能力?
JS 的加载会阻塞浏览器渲染吗?
浏览器对队头阻塞有什么优化?
Webpack 项目中通过 script 标签引入资源，在项目中如何 处理?
应用上线后，怎么通知用户刷新当前页面?
Eslint 代码检查的过程是啥?
HTTP是一个无状态的协议，那么Web应用要怎么保持用户 的登录态呢?
如何检测网页空闲状态(一定时间内无操作)
为什么Vite速度比 Webpack 快?
列表分页，快速翻页下的竞态问题
JS 执行 100 万个任务， 如何保证浏览器不卡顿?
git 仓库迁移应该怎么操作
如何禁止别人调试自己的前端页面代
web 系统里面，如何对图片进行优化?
OAuth2.0 是什么登录方式 单点登录是如何实现的? 常见的登录鉴权方式有哪些?
需要在跨域请求中携带另外一个域名下的 Cookie 该如何 操作?
vite 和 webpack 在热更新上有啥区别?
封装一个请求超时，发起重试的代码
前端如何设置请求超时时间 timeout
nodejs 如何充分利用多核 CPU?
后端一次性返回树形结构数据，数据量非常大,前端该如 何处理?
你认为组件封装的一些基本准则是什么?
页面加载速度提升(性能优化) 应该从哪些反向来思考?
前端日志埋点 SDK 设计思路
token 进行身份验证了解多少?
在前端应用如何进行权限设计?
[低代码】代码平台一般渲染是如何设计的?
[低代码】代码平台一般底层协议是怎么设计的
[Webpack]有哪些优化项目的手段?
IndexedDB存储空间大小是如何约束的?
浏览器的存储有哪些
[Webpack]如何打包运行时chunk，. 且在项目工程 中，如何去加载这个运行时chunk?
为何现在市面上做表格渲染可视化技术的，大多数都是 canvas ，而很少用svg的?
在你的项目中，使用过哪些 webpack plugin,说一下他 们的作用
在你的项目中，使用过哪些 webpack loader, 说一下他 们的作用
[React]如何避免不必要的渲染?
全局样式命名冲突和样式覆盖问题怎么解决?
[React]如何实现专场动画?
[React]从 React 层面上， 能做的性能优化有哪些?
[Vue]中为何不要把 v-if 和 v-for 同时用在同一个元素 上，原理是什么?
将静态资源缓存在本地的方式有哪些?
SPA首屏加载速度慢的怎么解决
axios 是如何区分是 nodejs 环境还是 浏览器环境的?
如何拦截 web 应用的请求
前端有哪些跨页面通信方式?

