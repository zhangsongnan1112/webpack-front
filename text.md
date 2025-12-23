1. element.getBoundingClientRect() 获取元素位置信息
2. IntersectionObserver() 异步监听元素与视口 / 根元素的交叉状态-解决scroll事件监听元素可见性带来的性能问题
    ```
        const observer = new IntersectionObserver((entries) => {
            console.log(entries, 'entries')
            entries.forEach(item => {
                if (item.isIntersecting && item.intersectionRatio >= 1) {
                    item.target.classList.add('red');
                }
            });
        }, {
            // 当元素可见比例达到 30%、50%、100% 时触发回调
            threshold: [0.3, 1],     // 默认值为 0（仅在元素刚进入视口时触发一次）
            root: null,  // 观察的跟元素， 必须是目标元素的祖先节点 监听元素在某个滚动容器内的可见性
            rootMargin: "100px 0px" // 根容器的扩展边距. , 元素进入视口前 100px 就触发回调
        });

        const boxes = document.querySelectorAll('.hot');
        console.log(boxes, 'boxes')
        boxes.forEach(el => observer.observe(el));

        // ✅ 清理：断开观察，防止内存泄漏和卸载后回调
        return () => {
            observer.disconnect();
        };
    ```
3. document.addEventListener('DOMContentLoaded', callback)
    HTML 文档已完全解析完成（DOM 树构建完毕）
    所有同步脚本（阻塞型 script）已下载并执行完毕
    所有 defer 脚本已下载并执行完毕
    不会等待 async 脚本、图片、CSS（某些情况除外）、iframe 等资源
4. window.addEventListener('unhandledrejection', callback) 捕获未处理的 Promise reject
5. window.addEventListener('error', (e) => { ... })，捕获 JS 语法 / 运行时错误、资源加载错误。
6. requestAnimationFrame（callback）  与浏览器刷新同步，下一次重绘前执行回调”，避免布局抖动 cancelAnimationFrame取消
    ```
    const box = document.getElementById('box')
    let startTime = null
    const animate = function(time) {
        if (!startTime) startTime = time;
        const scoped = time - startTime;
        const distance = (scoped / 1000) * 100;
        box.style.left = distance + 'px';
        if (distance < 500) {
            requestAnimationFrame(animate);
        }
    };
    requestAnimationFrame(animate)
    ```
7. 跨页面发送消息  BroadcastChannel
    ```
    const channel = new BroadcastChannel('channel-name')  
    channel.postMessage(data)
    channel.addEventListener('message', (e) => { })
    ````
8. MutationObserver()监视 DOM 元素的属性变化、节点（增删移动）、文本内容

### margin 重叠问题 
产生margin重叠（仅垂直方向）的必然条件： 
- 块元素（行内元素、行内块元素不会产生margin重叠）; 
- 布局时在普通文档流，脱离文档流的元素（float: left/right、position: absolute/fixed）不会触发；
- 元素之间无border、padding、文字、overflow: hidden；
- 相邻的兄弟节点间、 父元素与第一个 / 最后一个子块级元素（父无 border/padding）；
#####  相邻的兄弟节点间
- 用 padding 替代其中一个元素的 margin（无副作用）；
- 给元素加 display: inline-block + width: 100%；
- 给元素加 float: left + 父元素清浮动；
- position: relative

#### 父子节点
- 父元素加 border: 1px solid transparent（透明边框，不影响布局）；
- 父元素加 padding: 1px（最小内边距，分隔父子 margin）；
- 父元素加 display: flow-root（语义化，无副作用）；
- 父元素加 overflow: hidden
- 父元素加 display: flex
> 如果父元素设置marginTop:10 子元素也设置marginTop:10 结果：子元素和父元素顶部紧贴 （子元素的 10px margin 完全 “穿透” 到父元素外部）父元素整体向下移动 10px（取父子 margin 的最大值，这里两者都是 10px）

### js 数据类型 怎么区别array 和 object
> string number boolean undefined null symbol  bigInt array object function 
 - typeof 无法区分  typeof []  'object' 
 - instanceof   有局限性 检测原型链   [] instanceof Array  // true  [] instanceof Object // true
- constructor  是对象的内置属性 指向创建该对象的构造函数  arr.constructor === Array // true  arr.constructor === Object // false 但是有局限性 因为constructor是可以更改的 更改后就失效了 
引用数据类型是一直有constructor number、boolean、string 原始值本身无属性，访问时自动装箱为包装对象，包装对象有 constructor
- null 和 undefined 无原型、无包装对象，访问 constructor 直接报错
- Object.create(null) 创建的对象 原型链为空，未继承 Object.prototype，无 constructor 属性
- Array.isArray()  最准确、最简洁判断方法 Array.isArray(null) // false  Array.isArray(undefined); // false
- Object.prototype.toString.call() 「未被重写的原始版本」 最精准、兼容性最好的原生类型检测方法 
调用该方法时，会读取目标对象的内部属性 [[Class]]（一个字符串），
- call() 的作用： Object.prototype.toString() 本身是挂载在 Object 原型上的方法，直接调用时 this 指向 Object.prototype；通过 call() 可以强制将 this 绑定到要检测的目标值上，

```
Object.prototype.toString.call([]) // "[object Array]"
// 封装成工具函数（推荐）
function getType(val) {
    return Object.prototype.toString.call(val).slice(8, -1); // 截取类型名（如 "Array"）
}
```
> 为什么不用普通的 toString() ？不同类型的对象重写了 toString() 方法 [1,2].toString() → "1,2"  普通对象的 toString() → 固定返回 "[object Object]"



### JSON.stringify()的特点
-  对象的转化： '{"name":"Alice","age":30}'
- 数组的转化’[1,2,3]’， 
- 在对象中会忽略undefined,函数,symbol，在数组中会被转为 null， 
- 不支持循环引用。  
- NaN 和 Infinity 被转为 null， 
- 可传入函数或数组来控制哪些属性被序列化
- undefined、symbol、function，会直接被转成undefined  undefined在数组中会变转成null 在对象里会被忽略
```
JSON.stringify({ a: undefined, b: function() {}, c: Symbol('id') });   // '{}'
JSON.stringify([undefined, function(){}, Symbol('x')]);   // '[null,null,null]
JSON.stringify({ x: NaN, y: Infinity }); // '{"x":null,"y":null}'
```
### 实现一个JSON.stringify()
```
function myStringify(params, stack = []) {
    if (params === null) return 'null';
    const type = typeof params;
    if (type === 'string') return `"${params}"`
    if (type === 'boolean') return params ? 'true' : 'false';
    if (type === 'number') return isFinite(params) ? String(params) : 'null';
    if (type === 'undefined' || type === 'symbol' || type === 'function') return undefined;
    if (stack.includes(params)) {
        throw new TypeError('JSON');
    }
    stack.push(params);

    if (Array.isArray(params)) {
        const arr = params.map(item => {
            const str = myStringify(item, stack); // 递归传 stack
            return str === undefined ? 'null' : str;
        });
        return '[' + arr.join(',') + ']';
    } else {
        const parts = [];
        for (const [key, value] of Object.entries(params)) {
            const valueStr = myStringify(value, stack);
            if (valueStr !== undefined) {
                // key 也要转成 JSON 字符串（加双引号）
                const keyStr = `'${key}'`
                parts.push(keyStr + ':' + valueStr);
            }
        }
        return '{' + parts.join(',') + '}';
    }
    stack.pop();
}

```


### fiber
fiber是用来实现增量渲染的 react 15以前是递归的去构建虚拟DOM和diff算法，这个过程呢是不可以去中断的，如果组件树很大很复杂，就会导致主线程被占用很长时间，造成页面的卡顿和白屏 会影响用户体验，fiber框架 将我们整个渲染过拆分可以中断 可恢复的任务单元，可以利用浏览器的空闲时间 去逐步完成更新。fiber = 一个可中断的渲染任务单元（每一个元素对应一个fiber节点）fiber还引入了任务优先级 用户交互的优先级 > 数据获取 (fetch) > 过期任务 高优先级任务可以打断低优先级任务的执行 fiber的好处 可以实现更流畅的UI 更灵活的渲染控制

React 「渲染」的核心：它就是内存中构建新虚拟 DOM（Fiber） + 执行 Diff 算法的过程，是 React 确定 “是否需要更新真实 DOM、更新哪些 DOM” 的前置计算步骤 —— 这个过程是否执行，和最终是否更新真实 DOM 无关；哪怕最终不更新 DOM，「渲染」依然可能发生

### 为什么 react 需要fiber 而vue 不需要
本质原因： 追踪依赖的方式不一样 
（依赖追踪指的是：当组件使用了某些状态（state、prop））组件不知道自己用了哪些状态，不知道自己该不该更新
react： 手动的去触发更新 ，不会去自动的追踪依赖，而是触发整颗树的渲染，即时组件的prop/state没变化 也要引起一次大规模的更新 （除非用memo/PureComponent优化）
vue 采用的是响应式系统 + 响应的依赖追踪 组件初始化时自动的收集模版中用到的响应式数据作为依赖，只有依赖数据变化组件才会被更新，更新是精准的 局部的

### react的diff 和vue的diff
react 和 vue 都使用虚拟DOM和diff算法来高效更新真实DOM，通过diff算法来对比新旧虚拟 DOM 树。
React 的 diff 算法基于 “同层比较” 策略，它不会跨层级对比节点。通过 key 来判断是否为相同节点。节点类型不同会直接销毁DOM构建新的DOM树，节点类型和Key一样就会复用。
vue 同层比较。根据key. 查找最长的递归子序列，还会标记静态节点、变量提升、双端比较。

### 为什么需要 nextTick？ Vue.nextTick() 用于在下次 DOM 更新循环结束后执行回调
Vue 的数据更新是异步批量处理的：
当你修改响应式数据（如 this.count++），Vue 不会立即更新 DOM；
而是将所有变更收集到一个队列中，在下一个（微任务或宏任务）中统一更新 DOM，避免重复渲染。
优先使用 Promise.then（微任务）其次会降级到 mutationObserver() （微任务） 最后后降级到 setTimeout (宏任务)


### AI 的发展趋势是将重复性工作和简单需求开发自动化。当 AI 承担这些任务后，我们的价值体现在哪里？
从工作价值上看，首先在于精准定义问题。在复杂的业务场景中，真正的挑战往往不是“如何做”，而是“做什么”和“为什么做”。AI 擅长执行明确指令、优化已有流程，却无法理解业务背后的深层痛点、组织目标或用户未被言明的真实需求。
我们的核心价值，恰恰体现在：能够在信息模糊、目标冲突、资源受限的现实中，识别关键矛盾；将看似杂乱甚至相互抵触的诉求，提炼为清晰、可落地的问题；在技术可行性、锚定真正值得解决的问题。
因此，技术工作的本质从来不只是编码——编码只是实现价值的手段，而非目的本身。人类更需要成为“定义者”和“决策者”

### 前端如何解决页面请求接口大规模并发问题
1. 限制并发数量 ， 避免一次性发起过多请求导致的问题
2. 控制请求频率：防抖、节流
3. 合并请求 与 缓存 静态文件强缓存 ， localStorage、sessionStorage 或 IndexedDB 缓存数据
4. 懒加载、预先加载、延期加载
5. 取消不必要请求 页面卸载取消请求 new AbortController()

### vite 原理
- 开发阶段：基于原生 ES 模块（ESM），无需打包
    1. 利用现代浏览器对 < script type="module" > 的原生支持 , 将 CommonJS转为 ESM
    2. 按需加载：只编译和返回当前页面实际请求的模块，启动速度极快（与项目大小无关）
    3. 不打包（No Bundle）：跳过传统构建工具（如 Webpack）的全量打包过程
- 生产的时候仍然需要打包 
    1. 开发时不打包，但生产环境仍需优化 使用 Rollup 打包
    2. 内置使用 Rollup 进行 Tree Shaking、代码分割、压缩等
- 智能重写 import 路径
    1. 将源码中的裸导入（如 import vue from 'vue'）动态重写为合法 URL
    ```
        import { createApp } from '/node_modules/.vite/deps/vue.js?v=xxx';
    ```
### 前端性能监控指标
1. FP （First Paint，首次绘制）浏览器首次将像素渲染到屏幕的时间（白屏时间），标志页面开始加载。
2. FCP（First Contentful Paint，首次内容绘制）首次绘制文本、图片等有意义内容的时间，比 FP 更贴近用户感知
3. LCP（Largest Contentful Paint，最大内容绘制） 视口内最大内容元素（如图片、文本块）渲染完成的时间，核心用户体验指标（目标：< 2.5s）
4. TTI（Time to Interactive，可交互时间）页面加载后，用户可以流畅交互（点击、输入）的时间（无长任务阻塞）。
5. CLS（Cumulative Layout Shift，累积布局偏移）视觉稳定性：页面是否“乱跳”
6. 资源加载时间：HTML、CSS、JS、图片、接口等的下载、解析、执行时间


### 如何保证用户的使用体验
1. 控制页面的响应速度3s, 每增加1s 用户流失率增加7%
2. 图片优化 压缩、合并、懒加载loading="lazy”， 使用响应式图片（srcset & sizes属性），根据设备屏,幕尺寸加载合适大小的图片
3. 使用 Webpack、Vite 等工具的代码分割功能， 将代码拆分成多个小块，按需加载。摇树优化可以消除生产环境中未使用的代码。
4. 合理设置 HTTP 缓存头（如 Cache-Control），对静态资源使用强缓存， 对页面内容使用协商缓存。
5. 对 resize、scroll、input 等高频事件进行节流或防抖处理
6. 批量操作 DOM（使用 documentFragment）
7. 使用 transform 和 opacity 的属性实现动画，不会触发重排和重绘
8. 将复杂的计算任务（如数据处理、图像操作）放入 Web Worker，避免阻塞主线程，保证页面流畅。
9. 交互反馈在毫秒级别 100毫秒
10. 性能监控系统，埋点， 错误日志的收集
11. 合理的loading、骨架屏、



### 跨域解决方案
> 跨域是指浏览器因同源策略限制，阻止不同协议、域名、端口号页面之间进行资源交互（如AJAX请求、DOM操作）
1. CORS（跨域资源共享）现代浏览器默认支持的官方跨域解决方案，后端通过设置相应头，Access-Control-Allow-Origin ： 域名；明确的制定域名的跨域请求，简单请求（get 、post）预检请求（option）（content-Type: application/json）浏览器会先发送 OPTIONS 预检请求， 验证后端允许跨域后，再发送真实请求 
优势：官方标准、支持所有 HTTP 方法、支持携带 Cookie、无需前端额外处理（仅后端配置）
2. JSONP：早期解决跨域的主流方案 ， 用 script 标签不受同源策略限制的特性，通过动态创建 script 标签加载跨域资源，仅支持 GET 请求, 不支持跨域cookie携带。 易受xss攻击， 前端定义一个回调函数（如 callbackFn），用于接收跨域返回的数据；

###  https 怎么保证数据安全
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

### flex: 1  flex: 1 1 0 缩写
> Flex 项目的 flex 属性是 flex-grow、flex-shrink、flex-basis 的简写  flex: <flex-grow> <flex-shrink> <flex-basis>;
    - flex-grow: 容器有剩余空间时，项目会按比例瓜分剩余空间（1 表示参与瓜分）
    - flex-shrink: 容器空间不足时，项目会按比例缩小（1 表示参与收缩）
    - flex-basis: 设置容器的初使尺寸 

### vue 使用nextTick 原因和场景 
 > 数据更新后， 立即操作 / 获取更新后的 DOM ---- 数据变了，想立刻用最新 DOM → 套一层 nextTick。
 - Vue 采用「异步更新 DOM」策略：当你修改 data 里的数据时，Vue 不会立刻更新 DOM，而是将数据变更缓存到「异步更新队列」，等当前同步代码执行完后，再批量更新 DOM（避免频繁操作 DOM 导致性能损耗）。

### Map Set WeakMap  WeakSet
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


### cookie localstorage 的区别 那些情况和设置 请求不会携带 cookie 
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

### dom 怎么添加事件
- addEventListener   removeEventListener
- btn.onclick = function() {}
- 事件委托（事件代理） e.target：实际触发事件的元素（事件源） e.currentTarget：绑定事件的元素


### 经常用到的array 方法 类数组怎么转为数组
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

### let const区别 const 声明了数组 还能push元素么 为什么
let 块级作用域 声明变量  const 块级作用域 声明常量 声明必须赋值 不允许重新赋值
数组是「引用类型」：变量 arr 存储的是 “指向数组实际数据的内存地址”（堆内存），const 锁定的是这个 “地址指针”，而非堆内存里的数组内容；
push修改元素：只是修改堆内存中数组的内部数据，并没有改变 arr 指向的内存地址，因此符合 const 的规则。

const 声明原始类型：栈内存的值不可改 → 完全不能重新赋值；
const 声明引用类型：栈内存的地址不可改 → 不能重新赋值，但可修改堆内存的内部数据；
let 无此限制：无论原始 / 引用类型，都可重新赋值（基本数据类型改值 / 引用数据类型改地址）。



### 原型链 es6 class 怎么设置原型 静态、实例方法
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

### fetch 优缺点 怎么做polyfill

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


### 图片格式 png、jpg、jpeg、webp
- PNG： 无损压缩：解压后像素数据与原始完全一致，但是压缩率小。支持透明度，不支持动画。适合 logo、图标等。
- JPG / JPEG： 有损压缩：丢弃人眼不易察觉的高频信息。压缩率高，文件体积小；不支持透明度（背景必须是实色）；不支持动画；适合照片、自然图像等色彩丰富、细节多的场景
- WebP： 同时支持有损/无损 + 透明 + 动画，体积比 PNG/JPEG 小 25~35%

### 白屏 如何排查
- 资源加载失败（html/js/css）、
- 页面是否报错
- Network 查看资源 是否404/ 500  接口是否报错
- 控制台是否有代码报错
- DOM 是否有渲染，HTML加载不完整，JS未正确渲染内容
- 查看performance 是否有大量任务 阻塞了页面的渲染
- 其他用户 其他浏览器兼容性

### http
- http1.0 采用的是短链接（无持久链接） 一个请求需要创建和关闭链接，需要频繁的创建和关闭链接，对头阻塞严重，上一个链接未关闭 下一个链接就不能发起请求，并且只能开启一个TCP 链接，每次请求只能开一个tcp 。 个请求一个连接，串行执行，效率极低
- http1.1 默认长链接，允许在一个tcp 链接上发送多个请求，但是仍然存在队头阻塞的问题，原因是 一个tcp 内 返回数据的顺序和发送顺序必须保持一致 ，这是队头阻塞的原因， 但是一个同一个域名可以开启6到8个TCP 
- http2.0 采用多路复用，彻底解决的队头阻塞的问题， 一个TCP链接里面可以乱序的响应

### js 放在head 标签 和 body 前有什么区别
1. 加载时机不同 head中会阻塞html解析，body中不会阻塞html解析（因为后面没内容了）
2. head中无法获取DOM找不到Dom, body中可以安全的操作dom 
3. 会出现页面白屏直到脚本加载完成， 放到< /body > 可以很快的看见页面

### async defer 区别
-  < script src="app.js" defer> < /script > 异步下载 延迟执行， 不阻塞html解析， Dom已经ready 保持脚本顺序， 多个 defer 脚本会按照它们在 HTML 中的顺序执行
- < script src="app.js" async >< /script > 异步下载 下载完就执行 可能会阻塞html解析 执行阶段会阻塞解析, 不保证顺序，多个 async 脚本谁先下载完谁先执行，Dom可能没就绪


### 鼠标事件
1. click      click = mousedown + mouseup（且在同一元素上）
2. dbClick
3. mousedown  鼠标按键按下（任意键）	 拖拽开始、自定义交互
4. mouseup	   鼠标按键释放	拖拽结束、绘制完成
5. mousemove	鼠标在元素内移动	鼠标轨迹、悬停提示、画板
6. mouseenter	鼠标进入元素区域	❌ 不冒泡	显示 tooltip、高亮
7. mouseleave	鼠标离开元素区域	❌ 不冒泡	隐藏 tooltip、取消高亮
8. mouseover	鼠标进入元素或其子元素		较少单独使用（易误触发）
9. mouseout	鼠标离开元素或其子元素	 较少单独使用（易误触发）
10. contextmenu	右键点击（或键盘菜单键）自定义右键菜单


### Promise
1. 创建Promise 
    -  new Promise((resolve, reject) => { ... })   返回一个新的 Promise 对象。
    -  Promise.resolve(value)  返回一个状态为 fulfilled 的 Promise
    -  Promise.reject(reason)  返回一个状态为 rejected 的 Promise
2. Promise 实例方法
    - .then()   为 Promise 添加成功和失败的回调。返回一个新的 Promise 对象
    - .catch() 专门为 Promise 添加失败的回调。 返回一个新的 Promise 对象
    - .finally(onFinally)  添加一个无论成功或失败都会执行的回调   返回一个新的 Promise 对象
3.静态方法
    - Promise.all(iterable) 等待所有 Promise 都成功,一个失败就会立马返回   返回一个新的 Promise 对象
    - Promise.allSettled(iterable)  等待所有 Promise 都完成（无论成败） 返回一个始终成功的 Promise 对象。
    - Promise.race(iterable) 等待第一个完成的 Promise（无论成败）。 返回一个新的 Promise 对象
    - Promise.any(iterable) 只要有一个成功，就立即返回其结果  所有都失败时才失败 返回一个新的 Promise 对象


### 哪些css属性支持transition
1. 颜色类：color 、 background-color 、 background-color
2. 尺寸和位置：width、 height、 top/right/bottom/left、border- width、 border-radius、padding、margin
3. 透明度和可见性类：opacity、visibility
4. 背景与阴影:  background-position、background-size、 box-shadow、text-shadow
5. 变形与变化： transform ： translate、scale、rotate、skew 
6. 字体与文本：font-size、line-height
- 不支持的
1. 布局类： display 、position、float、overflow
2. 盒模型类：box-sizing、min-width/max-width/min-height/max-height：过渡效果不稳定。
3. 文本与字体类: font-family、text-align、white-space、 cursor、background-image


### react生命周期
1. 挂载阶段
- constructor 用于定义定义数据
- getDerivedStateFromProps(prop, state) 静态方法 用于更新state 
- render 
- componentDidMouted  组件完成挂载
2. 更新阶段
- getDerivedStateFromProps(prop, state) 静态方法 用于更新state 
- shouldComponentUpdate() 返回布尔值 判断组件是否渲染
- render
- getSnapshotBeforeUpdate() 
- componentShouldUpdate()
3. 卸载阶段
- componentWillUnMouted()
4. 错误捕获阶段
- state getDerivedStateFromError()
- componentDidCatch  用于捕获错误


### 加载css的方式
1. 在 HTML 中使用 < link rel="stylesheet" href="./index.css" >
    - link 并行加载css 多个link并行下载
    - 并行下载：CSS 与 HTML 文件同时下载（不阻塞html下载）
    - 不会阻塞Html解析，但是阻塞页面的渲染
    - 阻塞页面渲染：Render Tree 无法构建，用
2. 在style 或者是css 文件中 @import url('./index.css') || @import './index.css';; 会导致额外的网络请求, 浏览器解析到 @import时才会去加载对应文件
    - 串行加载css,必须等待父css加载完在加载子css
    - @import 不会阻塞Html解析，但是阻塞页面的渲染。但 不会阻塞 HTML 下载
- 在 JS 中创建 标签并插入到 DOM 中，实现动态加载. 按需加载样式（如用户切换主题时）
- import styles from './index.scss'; 将css模块转成js模块 像这种 引入的方式都是因为webpack配置了css-loader style-loader(也不能用在css文件内import是es_module 语法)

### 加载js的方式
1. < script src="./index.js"> < /script> < script async src="script.js">< /script>下载后立即执行 < script defer src="script.js"> < /script > 下载后文档解析完在执行
2. 动态脚本 按需引入 const script = document.createElement('script'); script.src = 'script.js'; document.head.appendChild(script);
3. es6 export function add(a, b) {return a + b;} import { add } from './math.js'; 在 HTML 中引入主文件，需添加 type="module" < script type="module" src="main.js"></script >
4. CommonJS  module.exports = { sum }; 或者 exports.sum = sum;  const { sum } = require('./utils.js');

### 不同标签间的通讯方式
1. url 
2. localStorage 
3. indexdb  (适合用于大量数据，操作繁琐些)
4. window.open  + postMessage()
  let channel =  window.open('#/list')
  channel.postMessage({
      type: 'notice',
      content: '新消息通知',
  })
  window.addEventListener('message', (e) => {
    if (e.data.type === 'notice') {
      alert(`通知：${e.data.content}`);
    }
  });

5. new BroadcastChannel(channelName)
const channel = new BroadcastChannel('my-channel');
document.getElementById('btn').onclick = function () {
  channel.postMessage({
      type: 'notice',
      content: '新消息通知',
  })
}
channel.onmessage = (event) => {
  if (event.data.type === 'notice') {
    alert(`通知：${event.data.content}`);
  }
};



###  Object.create() 
Object.create()用于创建一个新对象，并指定其原型；是实现原型式继承的核心工具。
```
    const obj = Object.create(null);
    console.log(obj.toString); // undefined（没有继承 Object.prototype）
    console.log(obj instanceof Object); // false
```
    
Object.create({}) 和 {} 是不一样的
- {} 的原型是 Object.prototype
- Object.create({}) 的原型是一个空对象（该空对象的原型才是 Object.prototype）
 
- class 本质是一个语法糖，它是基于原型和构造函数的继承机制，
    ```
    class Person {}
    class Student extends Person 
    Object.getPrototypeOf(Student) === Person  //  true
    Object.getPrototypeOf(Person) === Function.prototype。 // true

    ```
-  对于一个通过 extends 继承的类，它的 [[Prototype]] 就是它父类的引用  
-  对于一个普通的类（没有 extends），它的 [[Prototype]] 就是 Function.prototype
Object.getPrototypeOf(Array) === Function.prototype // true


### 页面的生命周期 
- readystatechange（文档状态变化）  
    - 触发时机：document.readyState 变化时
    - 三个状态值： 
        - "loading" → 初始状态，HTML 正在解析
        - "interactive" → DOM 构建完成（≈ DOMContentLoaded 触发前）；
        - "complete" → 所有资源加载完成（≈ window.onload 触发前）
    现代开发中较少直接使用，优先用 DOMContentLoaded 和 load
- DOMContentLoaded（DOM 内容加载完成）
    - HTML 解析完毕；所有同步脚本和 defer 脚本执行完毕；
    -  不等待：async 脚本、图片、CSS（部分浏览器等 CSS）、iframe
    - 主要用于： 埋点上报“首屏可交互时间”
- load
    - 触发时机：所有资源完全加载完成 包括： HTML、CSS、JS、 图片、字体、iframe、Web Worker
- beforeunload 页面即将卸载
    - 触发时机：用户尝试离开页面前（关闭、刷新、跳转）；
    - 唯一合法用途：提示用户确认离开（如未保存内容）
- unload（页面正在卸载）
    - 异步操作（如 fetch、setTimeout）会被浏览器忽略
    - 可使用 navigator.sendBeacon() 在 unload 或 pagehide 中发送日志。
- pageshow / pagehide（页面显示/隐藏） 处理往返缓存场景
    - pageshow：首次加载 或 从 bfcache 恢复（如点击浏览器后退按钮）；
    - pagehide：页面进入后台（切换标签、最小化）或 进入 bfcache。
    - 可用于恢复动画、加载视频、暂停/恢复游戏
```
1. readystatechange → "loading"
2. readystatechange → "interactive"   ≈
3. DOMContentLoaded                   ≈同一时刻
4. readystatechange → "complete"      ≈
5. window.load                        ≈同一时刻
6. pageshow（首次加载也会触发！）      在load事件之后触发
7. （用户操作...）
8. pagehide
9. beforeunload
10. unload

```
   
### 单点登录
 > 将身份 Token（如 JWT、会话令牌）存储在设置了 HttpOnly 的 Cookie 中，是比 localStorage 更安全的做法。
    HttpOnly 阻止 JavaScript 访问 Cookie，能有效防御 XSS（跨站脚本攻击）窃取凭证；
    localStorage 对前端脚本完全开放，一旦网站存在 XSS 漏洞，攻击者可直接读取并盗用用户身份，属于高危风险
1. 主子域名 SSO（同根域， 如 app1.example.com 和 auth.example.com）
    核心机制：利用cookie的domain共享能力（Domain=.example.com）
    - 用户访问子应用 → 未登录 → 跳转到认证中心  →  设置cookie   →   重定向回子应用   →  后续请求自动携带 Cookie
    ```
     Set-Cookie: token=xxx; Domain=.example.com; Path=/; Secure; HttpOnly; SameSite=Lax
    ```
    - 优点： 安全性高、前端无需处理token、用户在所有子域名下自动登录。
2. 跨域 SSO（不同域名，如 example.com 与 myapp.com）
   > 不要通过 URL 直接传递长期 Token（如 ?token=xxx)
   - 认证中心生成 一次性、短期（< 30 秒）的临时票据（ticket）
   - 重定向：https://myapp.com/sso?ticket=UNIQUE_TICKET
   - myapp.com 的后端立即用该 ticket 向认证中心兑换正式 Token；

#### cookie的属性
- Name=Value  必须项 sessionid=abc123
- Domain 控制哪些域名可以发送该 Cookie， 默认值：当前页面的完整域名
- Path  Cookie 生效的路径前缀， 只有当请求 URL 的路径 以 Path 开头时，
    Path=/admin → 仅 /admin 及其子路径（如 /admin/users）发送 Cookie
    Path=/ → 所有路径都发送。
- Secure —— 仅通过 HTTPS 传输 ， HTTP 请求（明文）不会发送
- HttpOnly —— 禁止 JavaScript 访问，前端 JS 无法通过 document.cookie 读取或修改该 Cookie
- SameSite —— 控制跨站请求是否携带 Cookie， 用于防御 CSRF（跨站请求伪造）
    - Strict： 任何跨站请求都不发送 Cookie， 安全性最高，但用户体验差（如微信点链接进来要重新登录）
    - Lax： 仅在“安全”的跨站导航时发送 GET 跳转（a标签href、地址栏输入）
        - 用户从外部网站点击链接跳转到你的网站 → 会携带 Cookie（保持登录状态）
        - 恶意网站通过 form、img、fetch() 等发起跨站请求 → 不会携带 Cookie（防 CSRF）
    - None： 所有跨站请求都发送 Cookie
- Expires —— 过期时间（绝对时间） 如 Expires=Wed, 21 Oct 2025 07:28:00 GMT
- Max-Age —— 过期时间（相对秒数）  Max-Age=3600（1 小时后过期）优先级高于 Expires

###  v8 引擎 垃圾回收机制
v8 引擎主要是 负责对我门的javascript 代码编译、执行。解析器将javascript经过词法分析（将代码拆分成一个最小的语法单元）和语法分析（组合成有层次的树形结构，树的每个节点对应代码中的一个语法结构） 代码转化成 AST 抽象语法树，解释器（即使翻译官）将AST转换成生成字节码， 编译器会将 AST 解析成机器代码垃圾回收机制采用分代回收的思想，针对不同声明周期的对象采用不同的策略；分为新生代和老生代两种策略；新生代处理临时的对象（比如刚创建的对象 函数内部的局部变量，临时数组等）。将新生代的内存分两个等大的区域From（使用中） 和To(空闲)，回收时，遍历From区的存活对象，复制到To区。清空From区，之后From和To角色互换。优点：速度极快（只处理小部分内存），适合频繁创建和销毁的对象， 如果对象在多次回收后仍存活（说明可能是长期对象），会被 "晋升" 到老生代。老生代处理长期对象（存活比较久的对象，比如全局变量、缓存数据等）占用内存比较大，回收频率比较低的对象。采用标记清除（从根出发标记所有存活的对象，遍历内存删除未被标记的对象，清除后会产生内存碎片-空闲内存比较分散） 和标记整理（标记后不直接删除垃圾，而是将存活的对象往一端移动，清除边界外的内存，不管是垃圾还是碎片都会清除 -解决内存碎片）的策略


### 前端的攻击
- 跨站的脚本攻击xss： 向网页注入恶意脚本（通常是JavaScript），当其他用户浏览该页面，脚本会在其浏览器执行，用于盗取用户的cookie, session 来进行恶意操作
    - 反射型XSS：恶意脚本作为请求参数数（URL的一部分）服务器直接返回并执行，诱骗用户点击恶意链接触发
    - 存储型XSS：恶意脚本被永久地存储到服务器（评论区、论坛帖子），当其他用户访问时触发
    - DOM 型 XSS：攻击者利用前端代码对 DOM 操作的 “不安全处理”，在浏览器端注入恶意脚本并执行 
    - 前端防御：对内容进行转义，<<变为 &lt,  谨慎使用innerHTML ,优先使用textContent
- 跨站的请求伪造：攻击者诱骗用户在其已登录的受信任网站（如银行网站）上，执行一个非本意的操作（如转账）。利用的是浏览器会自动携带目标站点的Cookie的特性 
    - 用户登陆了银行网站， 攻击者诱骗用户点击了一个链接或访问一个恶意页面，该网站通过< img src="https://bank.com/transfer?to=attacker&amount=1000">发起 GET 请求，浏览器会自动将bank.com的 Cookie 附加到这个跨域请求中
    - 前端防御：Cookie 的SameSite属性，该属性会限制 “跨域请求时是否携带 Cookie”  SameSite=Strict。仅在同域请求时携带 Cookie（跨域请求完全不携带），能彻底阻止 CSRF。 但可能影响正常跨域功能（如第三方登录）。
    - SameSite=Lax（默认值）：仅在 “跨域的 GET 请求且是用户主动触发” 时携带 Cookie- 服务器生成一个随机的、不可预测的Token （在当前页面有效tio）存储在页面的表单隐藏字段或响应头里
    - 检查请求来源（Referer/Origin） 前端可在发送请求前检查 document.referrer（请求来源页面）或 location.origin
    - 点击劫持 攻击者使用一个透明的iframe覆盖在一个看似无害的网页按钮之上，诱使用户点击，实际上用户点击的是隐藏iframe中的某个敏感操作 
    - 设置允许哪写iframe 可以引入


### git撤销更改
1. git 撤销本地更改 
- 第一步： git restore .   或 git checkout .  或   git restore 文件名 
2. git 撤销已经add 的 更改
- 第一步：git reset HEAD . 
-  第二步：git restore .  或  git checkout .  或   git restore 文件名 
3. git 撤销某次提交 已经推送到远端也可以这样撤销 git reset 适合只有自己开发的分支（要不然容易撤销别人的代码）
1. 软撤销 - 撤销后的更改会保留到工作区   git reset --soft HEAD~1      # HEAD~1 撤销最近1次提交，HEAD~2 撤销2次，
2. 硬撤销  - 彻底删除提交和代码修改  git reset --hard HEAD~1
3. 撤销某次更改 （保留后续提交）  git revert  提交ID
4. git fetch : 仅拉取远端仓库的更新（提交记录、分支、标签等）到本地，但不修改本地工作区 / 分支代码的命令。把远端的更新下载到本地的「远端追踪分支」。不会影响本地的修改。
```
# 拉取远端 origin 的所有更新（所有分支、标签）
git fetch origin
# 查看本地 main 与远端 origin/main 的差异
git log main..origin/main
# 查看具体代码差异
git diff main origin/main
```
```
执行完git fect后 ，想把远端的内容合并到本地，需要手动执行合并 / 变基（这也是 git pull 自动做的事）：

# 方式1：合并（会生成合并提交，保留历史）
git checkout main  # 确保在本地 main 分支
git merge origin/main  # 把 origin/main 的 X 合并到本地 main

# 方式2：变基（把本地提交“接”在 X 后面，历史更整洁）
git checkout main
git rebase origin/main

# 方式3：直接 git pull（等价于 fetch + merge）
git pull origin main
```























### redux 和 rematch
> Rematch 是基于 Redux 的封装，保留了 Redux 的核心能力（如中间件、时间旅行调试），但大幅简化了样板代码和配置流程，让状态管理更直观，rematch 不用管理繁琐的action
```
// rematch
const countModels =  {
    state: {
        count: 0
    },
    reducers: {
        increment: (state, payload) => ({
            ...state, 
            count: state.count + payload 
        }),
        decrement: (state, payload) => ({
            ...state, 
            count: state.count - payload
        }),
        reset: () => 0,
    },
    effects: (dispatch) => ({
        async incrementAsync(payload, rootState) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch.count.increment(payload);
        }
    }),
};

export default countModels

// index.js 
import count from './count'

const models = {
    count
}
export default models


// 使用 
import { useSelector, useDispatch } from 'react-redux';
const count = useSelector((state) => state.count.count)
const dispatch = useDispatch();

const increment = () => {
    dispatch.count.increment(1)
}
const incrementAsync = () => {
    dispatch.count.incrementAsync(1)
}
```

```
// redux 
const initialState = {
    count: 0
};
function counterReducer(state = initialState, action) {
    switch (action.type) {
        case 'INCREMENT':
            return {
                ...state, 
                count: state.count + action.count
            };
        case 'REDUCE':
            return {
                ...state,
                count: state.count - action.count
            };
        default:
            return state;
    }
}

export default counterReducer;

const initialState = {
    name: 'zz',
    age: 18
};

function userReducer(state = initialState, action) {
    switch (action.type) {
        case 'SETNAME':
            return {
                ...state,
                name: action.name
            };
        case 'ADDAGE':
            return {
                ...state,
                age: state.age + 1
            };
        default:
            return state;
    }
}

export default userReducer;

// index.js
import { createStore, combineReducers } from 'redux';
import counterReducer from './count';
import userReducer from './user';


const store = createStore(
    combineReducers({
        count: counterReducer, 
        user: userReducer    
    })

);
export default store;

// 使用

import { useSelector, useDispatch } from 'react-redux';
const count = useSelector(state => state.count.count);
const {name, age} = useSelector(state => state.user);
const dispatch = useDispatch();

const handleIncrement = () => {
    dispatch({ type: 'INCREMENT', count: 2 });
};
const handleRuduce = () => {
    dispatch({ type: 'REDUCE' , count: 2});
}
```