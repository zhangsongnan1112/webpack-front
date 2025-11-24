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
    所有同步脚本（阻塞型 <script>）已下载并执行完毕
    所有 defer 脚本已下载并执行完毕
    不会等待 async 脚本、图片、CSS（某些情况除外）、iframe 等资源
4. window.addEventListener('unhandledrejection', callback) 捕获未处理的 Promise reject
5. window.addEventListener('error', (e) => { ... })，捕获 JS 语法 / 运行时错误、资源加载错误。
6. requestAnimationFrame（callback） 与浏览器刷新同步，下一次重绘前执行回调”，避免布局抖动
7. 跨页面发送消息  BroadcastChannel
    ```
    const channel = new BroadcastChannel('channel-name')  
    channel.postMessage(data)
    channel.addEventListener('message', (e) => { })
    ````
8. MutationObserver()监视 DOM 元素的属性变化、节点（增删移动）、文本内容

### JSON.stringify()的特点
-  对象的转化： '{"name":"Alice","age":30}'
- 数组的转化’[1,2,3]’， 
- 在对象中会忽略undefined,函数,symbol，在数组中会被转为 null， 
- 不支持循环引用。  
- NaN 和 Infinity 被转为 null， 
- 可传入函数或数组来控制哪些属性被序列化
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

### React fiber 解决了什么问题
在 React 15 及之前，组件的更新（如 setState）会触发递归遍历整个虚拟 DOM 树，这个过程是同步且不可中断的。Fiber 核心目标是：将渲染/更新过程拆分为可中断、可恢复的小任务，并根据优先级调度执行。
Fiber” 既指一种数据结构（每个 React 元素对应一个 Fiber 节点），也指整个增量渲染架构。

### 为什么需要 nextTick？ Vue.nextTick() 用于在下次 DOM 更新循环结束后执行回调
Vue 的数据更新是异步批量处理的：
当你修改响应式数据（如 this.count++），Vue 不会立即更新 DOM；
而是将所有变更收集到一个队列中，在下一个（微任务或宏任务）中统一更新 DOM，避免重复渲染。
优先使用 Promise.then（微任务）其次会降级到 mutationObserver() （微任务） 最后后降级到 setTimeout (宏任务)


### AI 的发展趋势是将重复性工作和简单需求开发自动化。当 AI 承担这些任务后，我们的价值体现在哪里？
从工作价值上看，首先在于精准定义问题。在复杂的业务场景中，真正的挑战往往不是“如何做”，而是“做什么”和“为什么做”。AI 擅长执行明确指令、优化已有流程，却无法理解业务背后的深层痛点、组织目标或用户未被言明的真实需求。
我们的核心价值，恰恰体现在：能够在信息模糊、目标冲突、资源受限的现实中，识别关键矛盾；将看似杂乱甚至相互抵触的诉求，提炼为清晰、可落地的问题；在技术可行性、锚定真正值得解决的问题。
因此，技术工作的本质从来不只是编码——编码只是实现价值的手段，而非目的本身。人类更需要成为“定义者”和“决策者”


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

### js 放在<head> 标签 和 </body> 前有什么区别
1. 加载时机不同 head中会阻塞html解析，body中不会阻塞html解析（因为后面没内容了）
2. head中无法获取DOM找不到Dom, body中可以安全的操作dom 
3. 会出现页面白屏直到脚本加载完成， </body> 可以很快的看见页面

### async defer 区别
-  <script src="app.js" defer></script> 异步下载 延迟执行， 不阻塞html解析， Dom已经ready 保持脚本顺序， 多个 defer 脚本会按照它们在 HTML 中的顺序执行
- <script src="app.js" async></script> 异步下载 下载完就执行 可能会阻塞html解析 执行阶段会阻塞解析, 不保证顺序，多个 async 脚本谁先下载完谁先执行，Dom可能没就绪


### 白屏 如何排查
- 资源加载失败（html/js/css）、
- 页面是否报错
- Network 查看资源 是否404/ 500  接口是否报错
- 控制台是否有代码报错
- DOM 是否有渲染，HTML加载不完整，JS未正确渲染内容
- 查看performance 是否有大量任务 阻塞了页面的渲染
- 其他用户 其他浏览器兼容性

### 前端如何解决页面请求接口大规模并发问题
1. 限制并发数量 ， 避免一次性发起过多请求导致的问题
2.控制请求频率：防抖、节流
3.合并请求 与 缓存 静态文件强缓存 ， localStorage、sessionStorage 或 IndexedDB 缓存数据
4.懒加载、预先加载、延期加载
5.取消不必要请求 页面卸载取消请求 new AbortController()

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
v8 引擎主要是 负责对我门的javascript 代码编译、执行。解析器将javascript经过词法分析（将代码拆分成一个最小的语法单元）和语法分析（组合成有层次的树形结构，树的每个节点对应代码中的一个语法结构） 代码转化成 AST 抽象语法树，解释器（即使翻译官）将AST转换成生成字节码， 编译器会将 AST 解析成机器代码  垃圾回收机制采用分代回收的思想，针对不同声明周期的对象采用不同的策略；分为新生代和老生代两种策略；新生代处理临时的对象（比如刚创建的对象 函数内部的局部变量，临时数组等）。将新生代的内存分两个等大的区域From（使用中） 和To(空闲)，回收时，遍历From区的存活对象，复制到To区。清空From区，之后From和To角色互换。优点：速度极快（只处理小部分内存），适合频繁创建和销毁的对象， 如果对象在多次回收后仍存活（说明可能是长期对象），会被 "晋升" 到老生代。老生代处理长期对象（存活比较久的对象，比如全局变量、缓存数据等）占用内存比较大，回收频率比较低的对象。采用标记清除（从根出发标记所有存活的对象，遍历内存删除未被标记的对象，清除后会产生内存碎片-空闲内存比较分散） 和标记整理（标记后不直接删除垃圾，而是将存活的对象往一端移动，清除边界外的内存，不管是垃圾还是碎片都会清除 -解决内存碎片）的策略


### 前端的攻击
- 跨站的脚本攻击xss： 向网页注入恶意脚本（通常是JavaScript），当其他用户浏览该页面，脚本会在其浏览器执行，用于盗取用户的cookie, session 来进行恶意操作
    - 反射型XSS：恶意脚本作为请求参数数（URL的一部分）服务器直接返回并执行，诱骗用户点击恶意链接触发
    - 存储型XSS：恶意脚本被永久地存储到服务器（评论区、论坛帖子），当其他用户访问时触发
    - DOM 型 XSS：攻击者利用前端代码对 DOM 操作的 “不安全处理”，在浏览器端注入恶意脚本并执行 
    - 前端防御：对内容进行转义，<<变为 &lt,  谨慎使用innerHTML ,优先使用textContent
- 跨站的请求伪造：攻击者诱骗用户在其已登录的受信任网站（如银行网站）上，执行一个非本意的操作（如转账）。利用的是浏览器会自动携带目标站点的Cookie的特性 
    - 用户登陆了银行网站， 攻击者诱骗用户点击了一个链接或访问一个恶意页面，该网站通过<img src="https://bank.com/transfer?to=attacker&amount=1000">发起 GET 请求，浏览器会自动将bank.com的 Cookie 附加到这个跨域请求中
    - 前端防御：Cookie 的SameSite属性，该属性会限制 “跨域请求时是否携带 Cookie”  SameSite=Strict。仅在同域请求时携带 Cookie（跨域请求完全不携带），能彻底阻止 CSRF。 但可能影响正常跨域功能（如第三方登录）。
    - SameSite=Lax（默认值）：仅在 “跨域的 GET 请求且是用户主动触发” 时携带 Cookie- 服务器生成一个随机的、不可预测的Token （在当前页面有效tio）存储在页面的表单隐藏字段或响应头里
    - 检查请求来源（Referer/Origin） 前端可在发送请求前检查 document.referrer（请求来源页面）或 location.origin
    - 点击劫持 攻击者使用一个透明的iframe覆盖在一个看似无害的网页按钮之上，诱使用户点击，实际上用户点击的是隐藏iframe中的某个敏感操作 
    - 设置允许哪写iframe 可以引入
























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