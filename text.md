**1. `element.getBoundingClientRect()`**  
获取元素相对于视口的位置和大小信息。
**2. `IntersectionObserver`**  
异步监听元素与视口/根元素交叉状态，解决 `scroll` 事件监听可见性带来的性能问题。  
```js
const observer = new IntersectionObserver((entries) => {
    entries.forEach(item => {
        if (item.isIntersecting && item.intersectionRatio >= 1) {
            item.target.classList.add('red');
        }
    });
}, {
    // 可见比例达到 30%、100% 时触发回调
    threshold: [0.3, 1],
    root: null,                   // 观察视口（也可指定滚动容器）
    rootMargin: "100px 0px"       // 提前 100px 触发
});

const boxes = document.querySelectorAll('.hot');
boxes.forEach(el => observer.observe(el));

// ✅ 断开观察，防止内存泄漏（如组件卸载场景）
return () => observer.disconnect();
```
**3. `document.addEventListener('DOMContentLoaded', callback)`**  
- HTML 文档解析完成，DOM 构建完毕
- 所有同步 `script` 和 `defer` 脚本执行结束
- _不会_ 等待 `async` 脚本、图片、CSS、iframe 等资源

**4. `window.addEventListener('unhandledrejection', callback)`**  捕获未处理的 Promise reject 异常。

**5. `window.addEventListener('error', (e) => { ... })`**  
捕获 JS 语法/运行时错误，以及资源加载错误。

**6. `requestAnimationFrame(callback)`**  与浏览器刷新同步，下一次重绘前执行回调，避免布局抖动。  可用 `cancelAnimationFrame` 取消。

```js
const box = document.getElementById('box');
let startTime = null;
function animate(time) {
    if (!startTime) startTime = time;
    const elapsed = time - startTime;
    const distance = (elapsed / 1000) * 100;
    box.style.left = distance + 'px';
    if (distance < 500) {
        requestAnimationFrame(animate);
    }
}
requestAnimationFrame(animate);
```

**7. 跨页面发送消息：`BroadcastChannel`**

```js
const channel = new BroadcastChannel('channel-name');
channel.postMessage(data);
channel.addEventListener('message', (e) => {
    // ...
});
```
**8. `MutationObserver`**   监视 DOM 元素属性变化、节点增删/移动、文本内容修改等。

### `margin` 垂直重叠问题

**产生条件**  
- 仅发生在**块级元素**（行内/行内块元素不会重叠）  
- 必须都处于**普通文档流**（浮动、绝对/固定定位元素不会重叠）  
- 两元素之间**没有 border、padding、文字内容，且没有设置 `overflow: hidden`**  
- 典型场景：
    - **相邻兄弟元素之间**
    - **父元素与第一个或最后一个子块级元素之间**（父无 border/padding）

**相邻兄弟元素间的重叠解决办法**
- 使用 `padding` 替代其中一个元素的 `margin`
- 给元素加 `display: inline-block; width: 100%`
- 浮动元素（`float: left`），父容器清除浮动
- 加 `position: relative` 打破重叠

**父子块级元素间的重叠解决办法**
- 父元素设置 `border: 1px solid transparent`（透明边框，不影响实际布局）
- 父元素设置 `padding: 1px`（最小内边距）
- 父元素加 `display: flow-root;`（语义化、无副作用的块格式化上下文）
- 父元素加 `overflow: hidden`
- 父元素加 `display: flex`

> **注意**：如果父元素和子元素都设置了 `margin-top: 10px`，实际会导致父子顶部紧贴，且父元素整体向下移动 10px（取两者最大者！），而不是 20px。


### js 数据类型 怎么区别array 和 object
**基本数据类型**： `string` `number` `boolean` `undefined` `null` `symbol` `bigInt`  
**引用数据类型**： `object` `array` `function`

**数组与对象的区别方法：**
- **`typeof`**  不能区分数组和对象，例如：  
  ```js
  typeof []         // "object"
  typeof {}         // "object"
  ```

- **`instanceof`**  检测原型链关系：  
  ```js
  [] instanceof Array   // true
  [] instanceof Object  // true
  ```
  > 注意：在跨 iframe、多个全局环境或原型被修改情况下失效。

- **`constructor` 属性**  指向对象的构造函数：  
  ```js
  arr.constructor === Array   // true
  arr.constructor === Object  // false
  ```
  > 缺点：constructor 可被更改或覆盖，不完全可靠。原始值(number/boolean/string)访问 constructor 时会装箱。`null` 和 `undefined` 没有原型和 constructor，访问会报错。`Object.create(null)` 创建的对象无原型也无 constructor。

- **`Array.isArray()`**  
  最简便且推荐的判断数组方法：  
  ```js
  Array.isArray(null) // false
  Array.isArray([])   // true
  ```

- **`Object.prototype.toString.call()`**  
  最精准、兼容性最佳的类型检测：  
  ```js
  Object.prototype.toString.call([]) // "[object Array]"
  ```
  读取对象内部 `[[Class]]` 属性。  
  推荐封装方法：
  ```js
  function getType(val) {
    return Object.prototype.toString.call(val).slice(8, -1);
  }
  getType([]);      // "Array"
  getType({});      // "Object"
  getType('str');   // "String"
  ```
  `.call()` 作用：将 `toString` 的 this 指向需要检测的目标值。

> 🚩 **为什么不用普通的 toString()?**  
> - 各类对象的 toString 方法常被重写：  
>   `[1,2].toString()` → `"1,2"`  
>   普通对象的 `toString()` → `"[object Object]"` （无法区分类型）



### JSON.stringify()的特点
- **对象转字符串**：`{"name":"Alice","age":30}`
- **数组转字符串**：`[1,2,3]`
- **对象中的 `undefined`、`function`、`symbol`**：会被**忽略**（不序列化到结果）
- **数组中的 `undefined`、`function`、`symbol`**：会被转为 `null`
- **不支持循环引用**：遇到会抛错
- **NaN、Infinity**：会被转为 `null`
- **可选参数**：可传入函数（replacer）或数组过滤、控制序列化哪些属性
- **示例**：
  ```js
  // 对象属性值为 undefined/function/symbol 被忽略
  JSON.stringify({ a: undefined, b: function() {}, c: Symbol('id') });   // '{}'

  // 数组项为 undefined/function/symbol 转为 null
  JSON.stringify([undefined, function(){}, Symbol('x')]);   // '[null,null,null]'

  // NaN 和 Infinity 转为 null
  JSON.stringify({ x: NaN, y: Infinity }); // '{"x":null,"y":null}'
  ```

### 实现一个JSON.stringify()
```js
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

### Fiber
> **Fiber 是 React 用于实现增量渲染的架构。**
- **背景问题：**  
  在 React 15 及以前，虚拟 DOM 的构建和 diff 算法采用递归实现，这一过程无法被中断。如果组件树很大、结构复杂，长时间占用主线程，就会造成页面卡顿、白屏，用户体验差。

- **Fiber 的改进：**  
  Fiber 框架将整个渲染工作拆分为若干「可中断」「可恢复」的任务单元。每一个 React 元素都对应一个 Fiber 节点。Fiber 能够利用浏览器的空闲时间逐步完成渲染。

- **任务优先级机制：**  
  Fiber 支持任务优先级调度：
    - 用户交互（如输入/点击）优先级最高
    - 数据获取（如 fetch）次之
    - 低优先级或过期任务最后处理
  高优先级任务可以随时打断低优先级任务，确保交互最佳响应。

- **好处总结：**  
  - 页面切换、动画等场景下，UI 渲染更流畅
  - 渲染控制更灵活

**React 渲染的核心本质：**  
它是在内存中**构建新的虚拟 DOM（Fiber）**，并**执行 Diff 算法**，用以判断“是否需要更新真实 DOM，以及需要更新哪些 DOM”。这个过程只是 React 计算更新的前置操作，**渲染发生与否，不代表最终真实 DOM 就一定会变更**；即使最终没有产生 DOM 更新，渲染依然可能会被触发。

### 为什么 React 需要 Fiber，而 Vue 不需要？
> **核心原因：依赖追踪机制不同。**
- **依赖追踪说明**：组件在渲染时会用到某些状态（如 state、props）。如果框架能精确知道某个组件依赖了哪些数据，就能做到精准、局部的更新，否则就可能发生无计划的大面积重渲染。

#### React
- **更新触发**：React 默认是“手动触发更新”，没有自动依赖追踪。状态变化时一般会导致整颗树的自顶向下渲染（除非用 `memo`、`PureComponent` 等手动优化）。
- **更新特性**：即使某些组件的 props/state 实际没变化，仍然会参与本轮渲染，容易造成大量无效的更新。
- **Fiber 作用**：Fiber 把 React 的渲染拆解成可中断的小任务，在大批量组件更新时控制性能，防止主线程被长期阻塞。

#### Vue
- **响应式系统**：Vue 启动时会自动代理和跟踪模版里用到的每个响应式数据，建立“数据到组件”的依赖映射。
- **精准更新**：当响应式数据变化时，只有依赖这个数据的组件会被精准更新，其它部分完全不受影响。无需类似 React Fiber 的机制去切片任务、避免卡顿。

> **总结：**
> - **React** 没有内建依赖追踪，所以大面积渲染时需要 Fiber 提供性能保障。
> - **Vue** 依赖追踪精细，天生只会更新受影响的组件，无需 Fiber 这种架构。

### React 和 Vue 的 Diff 算法对比
React 和 Vue 均依赖虚拟 DOM 与 Diff 算法来高效更新真实 DOM。主要流程是：先构建新旧虚拟 DOM 树，随后比对两棵树的变化，只对差异部分做最小化操作。
#### React 的 Diff 算法
- **同层比较**：React 只会比较同一层级的节点，绝不会跨层级对比。
- **key 的作用**：通过 key 判断节点是否复用，key 相同则节点复用，不同则删除重建。
- **节点类型判断**：类型不同，直接销毁原节点并重新创建新节点。
- **优化点**：通过 key、只比较同层，显著减少比较次数，提升渲染性能。

#### Vue 的 Diff 算法
- **同样采用同层比较**，也依据 key 来判断节点复用与否。
- **额外优化**：
  - **最长递增子序列（LIS）**：对有 key 的子节点，通过 LIS 算法减少 DOM 移动的次数，提升列表的高效重排能力。
  - **静态提升**：Vue 在编译阶段会检测和标记静态节点，实现静态内容的跳过、缓存，减少不必要的比对。
  - **双端比较**：利用首尾指针，从两侧向中间“夹逼”，进一步加速列表 diff 过程。

> 总结：二者的重要共同点是“同层比较”和 key 标识，Vue 在此基础上通过更复杂的算法对复杂场景做了优化，使 DOM 操作更高效。

### 为什么需要 `nextTick`？
`Vue.nextTick()` 用于在下次 DOM 更新循环结束后执行回调。

- **Vue 的数据更新是异步且批量的。**
- 当你修改响应式数据（如 `this.count++`）时，Vue 不会立刻更新 DOM。
- 所有变更会被收集到一个队列中，然后在下一个（微任务或宏任务）中统一更新 DOM，避免重复渲染消耗资源。

**执行优先级：**

> - 首选微任务：`Promise.then`
> - 其次：`MutationObserver`（仍属微任务）
> - 最后降级：`setTimeout`（宏任务）

这样确保了回调总是在 DOM 更新完成后执行，适用于需要获得最新 DOM 状态的场景。


### AI 的发展趋势是推动重复性工作和简单需求的自动化，AI 逐步承接这些任务后，我们的核心价值将体现在哪里？

AI 越来越擅长执行标准明确、流程清晰的开发与操作，但它本质上仅能处理已定义、可量化的问题。面对复杂、多变且需求未明的业务环境——**真正的挑战往往不是“怎么做”，而是“做什么，为什么这样做”。**

1. **精准定义问题**：在信息不完全、诉求不一致、资源有约束时，能够洞察本质，提炼明确的问题和目标。
2. **跨领域理解与协调**：对业务环境、用户痛点、组织目标有深刻理解，并能权衡各方需求，形成可落地的方案。
3. **创新与决策能力**：发现未被满足的机会，制定解决方案，推动技术与实际价值的融合。

因此，技术工作的本质从不是单纯编写代码，而在于成为问题的发现者、定义者与决策推动者。编码仅是实现思路的工具，我们最重要的能力是创造性思维、战略性判断和持续学习适应变化的能力。

### 前端如何解决页面请求接口大规模并发问题
1. 限制并发数量 ， 避免一次性发起过多请求导致的问题
2. 控制请求频率：防抖、节流
3. 合并请求 与 缓存 静态文件强缓存 ， localStorage、sessionStorage 或 IndexedDB 缓存数据
4. 懒加载、预先加载、延期加载
5. 取消不必要请求 页面卸载取消请求 new AbortController()

### vite 原理

**开发阶段（极速响应、无需打包）**
- 基于原生 ES Module（ESM）：
  - 利用现代浏览器对 `<script type="module">` 的原生支持，将 CommonJS 自动转为 ESM 格式解析。
- **按需加载**：
  - 只对实际访问页面所需的模块进行实时编译和返回，因此启动速度与项目体积无关，几乎秒开。
- **No Bundle（不打包）**：
  - 跳过 Webpack 等传统构建工具的全量打包环节，每次请求什么就返回什么，开发体验极快。

**生产环境（优化打包）**
- 生产环境下仍需构建优化，vite 内置 Rollup：
  - 实现 `Tree Shaking`（摇树优化）、代码分割、压缩混淆等生产优化。
  - 保证最终产物体积小、性能高。

**动态重写 import 路径**
- 源码中的裸模块导入（如 `import vue from 'vue'`），会被 vite 自动转换成带 hash 的绝对路径，以兼容浏览器原生模块系统。
  ```js
  import { createApp } from '/node_modules/.vite/deps/vue.js?v=哈希值';
  ```
### 前端性能监控核心指标

- **FP（First Paint，首次绘制）**  
  浏览器首次将内容像素渲染到屏幕的时间（即“白屏”消失），标志页面开始加载。

- **FCP（First Contentful Paint，首次内容绘制）**  
  首次绘制文本、图片等有意义内容的时间点，比 FP 更直观反映用户感知“页面开始有内容”。

- **LCP（Largest Contentful Paint，最大内容绘制）**  
  视口内最大内容元素（如图片、大文本块等）渲染完成的时间，是页面加载“看起来完成”的关键用户体验指标（建议 < 2.5 秒）。

- **TTI（Time to Interactive，可交互时间）**  
  页面完全可响应用户输入操作（如点击、输入）的时间，期间无长任务阻塞。

- **CLS（Cumulative Layout Shift，累积布局偏移）**  
  页面视觉稳定性指标，衡量页面元素是否出现“跳动、乱移”等问题。

- **资源加载时长**  
  包括 HTML、CSS、JS、图片、API 接口等各类静态与动态资源的下载、解析、执行时间。


### 如何保证用户的使用体验

1. **页面响应速度控制**：建议页面响应速度控制在 3 秒以内，每增加 1 秒，用户流失率会增加约 7%。
2. **图片优化**：进行压缩与合并，采用懒加载（如 `loading="lazy"`），使用响应式图片（`srcset` & `sizes` 属性），根据设备屏幕尺寸加载合适大小的图片。
3. **代码分割与按需加载**：合理利用 Webpack、Vite 等工具的代码分割能力，将代码切分为小块，按需加载，并通过摇树优化移除未使用的生产代码。
4. **缓存管理**：为静态资源设置合理的 HTTP 缓存头（如 `Cache-Control`），静态文件使用强缓存，页面内容使用协商缓存。
5. **高频事件优化**：对 `resize`、`scroll`、`input` 等高频事件采用节流或防抖技术，提升性能体验。
6. **DOM 批量操作**：多次 DOM 操作可采用 `documentFragment`，批量更新，减少重绘与重排。
7. **动画实现**：建议使用 `transform` 和 `opacity` 属性实现动画，这些属性不会触发布局与重绘，提升动画流畅度。
8. **计算任务分离**：将复杂的数据处理或图像计算业务放入 Web Worker，避免主线程被阻塞，保证页面交互流畅。
9. **交互反馈及时**：交互操作的反馈应控制在 100 毫秒以内，提升用户响应体验。
10. **性能与错误监控**：建立性能监控系统和埋点机制，及时收集与分析错误日志。
11. **友好的加载体验**：合理设计 loading、骨架屏等过渡界面，优化首次加载体验。



### 跨域解决方案

> **跨域**：指因浏览器同源策略限制，不同协议、域名、端口的页面之间无法直接进行资源交互（如 AJAX 请求、DOM 操作）。

#### 1. **CORS（跨域资源共享）**
- **简介**：现代浏览器官方、主流的跨域解决方案。
- **实现方式**：后端设置响应头 `Access-Control-Allow-Origin: 域名`，支持指定/通配允许的跨域访问。
- **流程优化**：
  - **简单请求**（如 GET、普通 POST）：直接发送，浏览器自动处理。
  - **预检请求**（如 Content-Type 为 `application/json` 或自定义 header）：浏览器先发 `OPTIONS` 请求，经后端允许后才发真实请求。
- **优点**：
  - 官方标准，支持全部 HTTP 方法
  - 支持携带 Cookie
  - 仅需后端配置，前端无需特殊处理

#### 2. **JSONP**
- **简介**：早期主流跨域方案，利用 `<script>` 标签不受同源策略限制的特性实现，**仅支持 GET 请求**。
- **实现方式**：
  1. 前端定义全局回调函数（如 `callbackFn`）。
  2. 动态创建 `<script src="http://example.com/data?callback=callbackFn">` 标签。
  3. 后端返回形如 `callbackFn(data)` 的函数调用，前端即可接收处理数据。
- **限制**：
  - 只能 GET，不支持 POST/PUT 等其他请求
  - 不支持跨域携带 Cookie
  - 存在 XSS 安全风险

### HTTPS 如何保证数据安全？

#### 一、数字证书 & CA 认证
1. **数字证书申请与签发**  
   - 服务器向权威第三方机构（CA）申请证书，由 CA 对服务器“公钥”进行认证，生成数字证书（证书内容含公钥、服务器域名、CA签名等）。
2. **客户端校验证书**  
   - 客户端收到服务器证书后，会校验：
     - 证书是否由受信任的 CA 机构签发
     - 证书域名与访问域名是否一致
     - 证书有效期是否正常、未吊销

#### 二、加密通信流程
1. **非对称加密（密钥协商阶段）**
   - 服务器持有一对「公钥 & 私钥」（公钥公开、私钥保密）。
   - 客户端通过证书获得服务器公钥。
   - 客户端生成「随机对称密钥」，并用服务器公钥加密后发送给服务器。
   - 服务器接收后用私钥解密，拿到对称密钥。

2. **对称加密（数据传输阶段）**
   - 客户端与服务器后续全程，均使用刚才协商好的「对称密钥」来加密/解密数据（包括请求头、请求体、响应内容等）。
   - 优点：对称加密速度快，适合大数据量的安全传输。

> **总结：HTTPS 的安全保障 = 可信CA签发证书认证 + 非对称加密完成密钥协商 + 对称加密高效数据传输。**

### `flex: 1` / `flex: 1 1 0` 属性详解

Flex 的简写属性格式：  
`flex: <flex-grow> <flex-shrink> <flex-basis>;`

- **`flex-grow`**：定义项目在容器有剩余空间时的放大比例（如：1 表示参与分配剩余空间）。
- **`flex-shrink`**：定义项目在空间不足时的缩小比例（如：1 表示参与收缩）。
- **`flex-basis`**：设置项目的初始主轴尺寸（如：`0` 表示不预留主轴空间，`auto` 则由内容决定）。

常用缩写示例：  
- `flex: 1` 等同于 `flex: 1 1 0`，即占据剩余空间，可收缩，初始宽度为 0。
- `flex: 1 0 auto` 表示可放大但不可收缩，初始宽度为内容自动决定。


### Vue 中 `nextTick` 的作用及典型场景

#### 📌 为什么需要 `nextTick`？
- **核心原因**：Vue 采用“异步更新 DOM”策略。修改 `data` 后，DOM 不会立刻更新，而是先进入异步队列，待本轮同步代码执行完毕后，Vue 再统一批量更新 DOM —— 这样可以提升性能，避免频繁 DOM 操作带来的性能损耗。
- **典型痛点**：有些情况我们希望“**数据变了，马上要用最新的 DOM 元素**”，这时就需要用 `nextTick`。

#### ✅ 常见应用场景
- 数据变化后，需读取/操作最新 DOM（如获取宽高、获取输入框焦点、手动滚动等）：
    ```js
    // 错误示例（此时 DOM 还没更新）
    this.showInput = true;
    this.$refs.input.focus(); // 有可能拿到的是旧 DOM 或 undefined

    // 正确写法
    this.showInput = true;
    this.$nextTick(() => {
      this.$refs.input.focus(); // 此时一定是最新 DOM
    });
    ```

> **总结**：数据更新后要马上操作最新 DOM，务必套一层 `nextTick`。

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

### require 和 import 引入js 的区别
1. require 属于commonJS 模块规范   module.exports
    - 加载时机不同：运行时同步加载，执行在require语句才去加载，会阻塞后续代码，同步读取执行文件， 执行完成后才去继续下面代码
    - 值拷贝 基本类型：拷贝变量当前值，导出后内外变量相互独立，内部修改不影响外部导入值； 引用类型：拷贝内存引用地址，可修改内部属性（同步外部），但无法同步对象本身的引用替换
    - 支持动态导入：路径可使用变量、表达式拼接（如 require('./' + name + '.js')），语法灵活
    - 可以在代码的任何位置使用（包括条件语句、函数内部）
    - Node.js 环境原生支持，浏览器环境需要打包工具（如 webpack）转换
    - 导出方式：module.exports = {} 或 exports.xxx = xxx
2. import/export 属于ES6 模块规范   export / export default
    - 编译时（静态）异步加载，编译阶段就完成了解析，不阻塞运行时代码，底层异步加载模块
    - 实时绑定： 导入的变量不是拷贝，而是对导出变量的实时引用，内外共享同一变量实例， 导出模块内部修改变量，会实时同步到所有导入方。导入方仅拥有只读权限，无法直接修改绑定本身
    - 静态导入：路径必须是字符串字面量，不能使用变量
    - 必须写在文件顶部，不能在条件语句或函数内部使用（顶层导入）
    - 导出方式：export const/function/class 或 export default
    - Tree-shaking 友好：静态分析可以移除未使用的代码

### script 标签上的常用属性
1. **src**  
   指定要加载的外部 JavaScript 文件路径。如：`<script src="main.js"></script>`
2. **type**  
   指定脚本类型。常见值：
   - `text/javascript`（默认，通常可省略）
   - `module`  启用 ES6 模块（支持 `import/export`），如：`<script type="module" src="main.js"></script>`
   - 其他类型如 `application/json` 仅用于数据
3. **async**  
   异步加载脚本。脚本下载和页面同时进行，下载完成立即执行（不保证顺序）。适合独立、不依赖顺序的脚本。  
   如：`<script async src="a.js"></script>`
4. **defer**  
   脚本延迟执行。下载和页面解析并行，等 HTML 解析完成后按顺序执行所有 defer 脚本（只在 src 外链时有效）。适合依赖顺序的多个脚本。  
   如：`<script defer src="b.js"></script>`

5. **nomodule**  
   指定在**不支持 ES6 模块**的浏览器才加载，在支持模块的浏览器会忽略。通常用于兼容老浏览器：  
   ```
   <script type="module" src="modern.js"></script>
   <script nomodule src="legacy.js"></script>
   ```


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
```js
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

```js
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