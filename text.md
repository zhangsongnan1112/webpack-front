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

### Map、Set、WeakMap、WeakSet 对比 & 用法

> **选用建议**：  
> - 需存对象且希望被自动回收（如缓存） → 选 WeakMap / WeakSet  
> - 需遍历/存基本类型 → 选 Map / Set
---
#### 1. **Map** —— 键值对，键可为任意类型
  - 键值对结构，键唯一、值可重复
  - 键可为任意类型（对象、函数、基本类型等）
  - `size` 属性直接获取元素数量
  - 常用方法：`set(key, val)`、`get(key)`、`has(key)`、`delete(key)`
  - 遍历：「键」`keys()`｜「值」`values()`｜「键值对」`entries()`
```js
// 1. 用对象作为键（普通对象做不到！）
const objKey = { id: 1 };
const map = new Map();
map.set(objKey, '用户1');
console.log(map.get(objKey)); // 用户1（对象引用精准匹配键）

// 2. 遍历 Map
for (const [key, value] of map.entries()) {
console.log(key, value); // 输出：{id:1} 用户1
}
```
#### 2. **Set** —— 值的集合，无重复
  - 存储唯一值（类似数组，但无重复）
  - 值类型不限
  - `size` 属性
  - 常用方法：`add(val)`、`has(val)`、`delete(val)`、`clear()`
  - 遍历：`keys()/values()` 返回元素本身；仅遍历「值」
```js
// 1. 数组去重（常用！）
const arr = [1, 2, 2, 3];
const uniqueArr = [...new Set(arr)]; // [1, 2, 3]

// 2. 高效查重
const set = new Set([1, 2, 3]);
console.log(set.has(2)); // true
console.log(set.has(4)); // false
```
#### 3. **WeakMap**  
- 键必须是对象（且为弱引用）
- 键对象被回收后会自动释放（不会内存泄漏）
- **不可遍历**，无 `size` 属性

#### 4. **WeakSet**
- 值必须是对象（且为弱引用）
- 对象被回收后，集合自动释放引用
- **不可遍历**，无 `size` 属性



### cookie 与 localStorage 的区别及哪些情况下请求不会携带 cookie

**1. 存储大小**
- cookie：单个 4KB 左右
- localStorage：可达 5MB

**2. 生命周期**
- cookie：可设置过期时间，到期自动清除
- localStorage：除非手动清除，否则永久保存

**3. 与服务器的交互**
- cookie：每次同源 HTTP 请求自动携带（在请求头 Cookie 字段）
- localStorage：仅存于客户端，不会自动参与服务器通信

**4. 访问权限**
- cookie：客户端（JS）和服务端（HTTP 头）都可访问
- localStorage：仅客户端 JS 可读写，服务端无法直接操作

**5. 作用域/共享范围**
- cookie：可设置 Domain/Path 控制作用域，支持部分路径/子域共享
- localStorage：仅同源（同协议、域名、端口）下可共享

---

#### 哪些情况下、设置下，请求不会携带 cookie？

1. 设置了 `HttpOnly`
   - 只能通过 HTTP/HTTPS 请求携带，客户端 JS 无法访问（`document.cookie` 也读不到）

2. 跨域（包括协议、端口或主域不同）
   - 只有完全相同的协议+主域名+端口下才会携带；不同源的请求不会自动携带 cookie

3. SameSite 属性设置
   - `SameSite=Strict`：仅同站请求（完全同源）携带，跨站（如跳转、跨域 AJAX）都不携带
   - `SameSite=Lax`（默认）：跨站“导航类请求”（比如链接跳转、表单提交）会带上 cookie，但跨域的 AJAX/fetch 请求不会携带
   - `SameSite=None`：所有情况都携带，需要配合 `Secure` 使用（只能在 HTTPS 下生效）


### DOM 如何添加事件

1. **addEventListener / removeEventListener** 推荐使用，支持添加多个事件监听、可移除监听器。
   ```js
   element.addEventListener('click', handler);
   element.removeEventListener('click', handler);
   ```
2. **直接赋值事件处理函数** 简单快捷，但同类事件只能绑定一个处理函数。
   ```js
   btn.onclick = function () {
       // 事件处理逻辑
   }
   ```

3. **事件委托（事件代理）**
   - 通过为父元素绑定事件，利用事件冒泡处理子元素的事件
   - 常用属性说明：  
     - `e.target`：实际触发事件的元素（事件源）  
     - `e.currentTarget`：绑定事件的元素（委托的容器）

   ```js
   container.addEventListener('click', function(e) {
       if (e.target.matches('.child')) {
           // 针对 .child 元素的点击事件处理
       }
   });
   ```



### 常用的 Array 方法&类数组转数组

#### 🔄 会改变原数组
- `push()`：在尾部添加元素，返回新数组长度
- `pop()`：移除尾部元素，返回被删除元素
- `unshift()`：头部添加元素，返回新数组长度
- `shift()`：移除头部元素，返回被删除元素
- `splice()`：指定位置增/删/改，返回被删除的元素组成的数组
- `reverse()`：数组反转，返回操作后的新数组
- `fill()`：用一个值填充数组的全部或部分内容
- `sort()`：排序，默认按字符编码顺序，可自定义排序函数

#### ➖ 不改变原数组
- `concat()`：合并数组，返回新数组
- `join()`：数组转字符串
- `flat()`：扁平化嵌套数组
- `forEach(callback)`：遍历数组，无返回值
- `map(callback)`：遍历数组，按规则生成新数组
- `filter(callback)`：过滤元素，返回符合条件的新数组
- `find(callback)`：查找第一个符合条件的元素，返回元素或 `undefined`
- `findIndex(callback)`：查找第一个符合条件元素的索引，找不到返回 -1
- `some(callback)`：有任意元素满足条件则返回 `true`
- `every(callback)`：全部元素都满足条件才返回 `true`
- `indexOf(value)`：查找元素首次出现的位置，返回索引或 -1
- `includes(value)`：判断数组是否包含指定元素
- `slice(start, end)`：截取原数组的指定部分，返回新数组
- `reduce(callback, initialValue)`：遍历数组元素累计处理，返回累计的结果

#### 👀 类数组对象如何转换为真数组？

- **扩展运算符**  
  ```js
  const arr = [...arrLike];
  ```

- **Array.from**  
  ```js
  const arr = Array.from(arrLike); // 可以传 mapFn 做转换
  // 例：Array.from(arrLike, item => item * 2)
  ```

- **Array.prototype.slice.call**
  ```js
  const arr = Array.prototype.slice.call(arrLike);
  // 或者简写：[].slice.call(arrLike);
  ```

> 说明：类数组对象需要有 length 属性且用数字做键名。例如：  
> ```js
> const arrLike = {0: 10, 1: 20, length: 2};
> const arr = [].slice.call(arrLike); // [10, 20]
> ```


### `let` 与 `const` 的区别  
#### ⭐️ const 声明的数组还能 push 元素吗？为什么？

- `let`：块级作用域，用于声明变量  
- `const`：块级作用域，用于声明常量，声明时必须赋值，且不允许重新赋值

**数组是引用类型**  
- 声明：`const arr = [1, 2, 3]`
- 变量 `arr` 实际存储的是“指向堆内存中数组数据的地址”
- `const` 锁定**地址指针本身**，并不是锁定堆内存里的数组内容
- **可以做 arr.push(4)**  
    - 这是修改堆内存中数组的元素，未改变 `arr` 的指针地址，因此完全合法

**const 声明：**
- **原始类型（如 number、string）**：值存在栈内存，*完全不可变*（不可重新赋值、不可更改值）
- **引用类型（如 array、object）**：地址存于栈，*地址不能变*（不可重新赋值），**但该地址的对象内容可以变**（比如数组可 push、对象可增删属性）

**let** 无此限制：无论原始还是引用类型，都可以重新赋值（可以直接改值或改指针）

> 总结：  
> - `const` 声明的引用类型变量，**不能改变引用地址**，但可改变内部内容（比如数组 push）
> - `let` 声明的变量，可以随意改值或换地址

---

### 原型链 & ES6 class 如何设置原型、静态方法与实例方法

> `class` 是基于函数与原型链的语法糖。  
> - **静态方法**：使用 `static` 关键字定义在类本身（类名.方法），**实例无法访问**。  
> - **实例方法**：定义在原型（`prototype`）上，所有实例共享。  
> - `extends` 实现类的继承，自动设置原型链。  

```js
class Animal {
  constructor(type) {
    this.type = type;
  }
  // 实例方法：所有实例共享，定义在 Animal.prototype 上
  move() {
    console.log(`${this.type} 在移动`);
  }
  // 静态方法：只能通过 Animal.isAnimal() 调用
  static isAnimal(obj) {
    return obj instanceof Animal;
  }
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

### fetch 优缺点 & polyfill 实现

#### ✅ 优点
- **语法简洁*语义清晰,基于 Promise 链式调用，完美支持 `async/await`，代码更易读。
- **流式处理大数据**  与 XHR 只能一次性接收完整响应不同，Fetch 的 `response.body` 是 `ReadableStream`（可读流），可“边下载边处理”，适合超大文件、实时日志、视频流等场景。

#### ❌ 缺点
- **错误捕获需手动判断**  
  即使响应 404/500，fetch 也不会走 catch，需要用 `response.ok` 判断。
- **不支持取消请求**（原生 fetch，AbortController 支持需兼容性关注）
- **无法直接监听进度**（如文件上传进度，XHR 支持 `onprogress`）
- **无超时默认配置**  
  需结合 `Promise.race` 手动实现超时，原生 fetch 无 timeout 参数。

---

#### ✨ 基础 fetch 用法（POST为例）
```js
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 1 }),
      credentials: 'include' // 携带 Cookie（跨域）
    });
    // 必须手动判断状态码
    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.error('请求失败：', err);
  }
}
```

#### ✨ fetch 流式处理大文件/日志
```js
fetch('https://api.example.com/large-file.log')
  .then(response => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    // 递归读取流
    function readChunk() {
      reader.read().then(({ done, value }) => {
        if (done) {
          console.log('文件读取完成');
          return;
        }
        console.log('收到日志片段：', decoder.decode(value));
        readChunk();
      });
    }
    readChunk();
  });
```

#### ✨ fetch 超时处理 polyfill（封装 Promise.race）
```js
function timeoutPromise(delay) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`请求超时（${delay}ms）`)), delay);
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
// 超时封装：如5秒未响应自动 reject
async function requestWithTimeout(url) {
  try {
    const result = await Promise.race([
      fetchData(url),       // fetch 业务 Promise
      timeoutPromise(5000)  // 5秒超时 Promise
    ]);
    return result;
  } catch (err) {
    throw err;
  }
}

requestWithTimeout('https://api.example.com/data');
```



### 图片格式对比：PNG / JPG(JPEG) / WebP

- **PNG**
  - 无损压缩，解压还原像素，画质清晰
  - 支持透明，不支持动画
  - 通常用于 logo、图标、UI 元素等需要透明背景或高质量的图片场景

- **JPG / JPEG**
  - 有损压缩，通过舍弃高频信息换取更小体积
  - 不支持透明或动画，背景必须为实色
  - 适合存储照片、风景图、色彩丰富的图片

- **WebP**
  - 支持有损/无损压缩
  - 支持透明和动画
  - 同等质量下，体积比 PNG、JPEG 小 25~35%
  - 适合网页图片优化，但需注意部分旧浏览器兼容性


### 白屏问题排查清单

1. **资源加载异常**
   - 检查 HTML、CSS、JS 是否加载成功（可通过 Network 面板查看，是否有 404/500 等错误）。
2. **接口和页面报错**
   - 留意接口请求状态码、报错信息，是否有接口未响应或异常。
3. **控制台错误日志**
   - 打开开发者工具 Console，看是否有报错信息、报红。
4. **DOM 渲染情况**
   - 查看 Elements/DOM 结构，确认 DOM 是否被正常渲染，页面内容是否完整。
   - 留意 JS 渲染内容是否被正确动态填充。
5. **性能瓶颈**
   - 在 Performance 面板分析是否有大量任务，阻塞了主线程或页面渲染，导致白屏。
6. **浏览器兼容性**
   - 检查是否在其他用户或不同浏览器下复现，排查兼容性相关问题。


### HTTP 各版本特性对比

- **HTTP/1.0**  
  - 采用**短连接**（无持久连接），每个请求都需单独建立和关闭一次 TCP 连接。  
  - 频繁的 TCP 握手与断开导致性能低下，且**每次只能发起一个请求**，必须串行执行。  
  - 存在明显的**队头阻塞**问题：前一个请求未完成，后一个请求无法开始。

- **HTTP/1.1**  
  - 默认支持**长连接**（Connection: keep-alive），多个请求可复用同一个 TCP 连接。  
  - 但**同一个连接内的数据响应顺序与请求顺序必须一致**，若前面的响应没完成，后面的响应也会被阻塞（队头阻塞），影响性能。  
  - 为提升吞吐量，现实中多浏览器允许同一域名最多开启 6~8 条 TCP 连接。

- **HTTP/2.0**  
  - 支持**多路复用**，在一个 TCP 连接中可并发处理多个请求和响应，且互不干扰，可乱序返回。  
  - **彻底解决了队头阻塞问题**，极大提升网页资源加载效率。


### JS 放在 `<head>` 标签和 `<body>` 前的区别

1. **加载时机**
   - **`<head>` 中**：脚本加载和执行会**阻塞 HTML 解析**，页面渲染会被暂停，直到 JS 加载和执行完毕。
   - **`</body>` 前**：HTML 已经完成渲染，此时脚本不会再阻塞页面展示。

2. **DOM 可用性**
   - **`<head>` 中**：此时文档结构还未完全生成，脚本内直接操作 DOM 元素可能会出现“找不到节点”或“为 undefined”。
   - **`</body>` 前**：页面 DOM 已加载完成，可以**安全获取和操作 DOM**。

3. **用户体验（白屏）**
   - **`<head>` 中**：容易导致**白屏**——用户直到 JS 加载、解析、执行完毕后才能看到页面内容。
   - **`</body>` 前**：HTML 先于 JS 呈现，用户可**更快看到页面内容**，提升感知速度。

### `async` 与 `defer` 的区别

- **defer**  
  ```html
  <script src="app.js" defer></script>
  ```
  - 脚本和 HTML 解析同时进行（异步下载），不会阻塞页面解析。
  - 所有带 defer 的脚本会在 HTML 解析完毕（DOMContentLoaded 事件前）依次执行，**顺序与页面中引入顺序相同**。
  - 执行时 DOM 已经解析完成，可安全操作页面元素。
  - 适合需要依赖 DOM 或多个需按顺序执行的脚本。

- **async**  
  ```html
  <script src="app.js" async></script>
  ```
  - 脚本同样是异步下载，但下载完成后**立即执行**。
  - **不保证多个脚本的顺序**，谁先下载好就先执行。
  - 执行时页面可能还未解析完整，DOM 可能未就绪。
  - 适用于不依赖其它脚本或 DOM 的独立脚本（如埋点、广告等）。

**简要对比：**
- `defer`：异步下载、顺序执行、不阻塞解析，执行时 DOM 可用。
- `async`：异步下载，下载完成马上执行，不保证顺序，执行时可能 DOM 不可用。


### 鼠标事件
1. **click**：鼠标在同一元素上按下(`mousedown`)并松开(`mouseup`)，常用于按钮、普通点击交互。（支持冒泡）
2. **dblclick**：快速双击同一元素时触发，多用于编辑、特殊功能。（支持冒泡）
3. **mousedown**：鼠标按下任意键时触发，如拖拽开始、自定义交互起点。（支持冒泡）
4. **mouseup**：鼠标按键释放时触发，用于拖拽结束、绘制结束等场景。（支持冒泡）
5. **mousemove**：鼠标在元素内部移动时触发，常用于画板、悬停预览、检测鼠标轨迹等。（支持冒泡）
6. **mouseenter**：鼠标指针首次进入元素区域时触发，**不会冒泡**，常用于显示提示、元素高亮。
7. **mouseleave**：鼠标指针离开元素区域时触发，**不会冒泡**，常用于隐藏提示、取消高亮。
8. **mouseover**：鼠标进入元素或其子元素时触发，会冒泡，较少单独使用，易多次触发。
9. **mouseout**：鼠标离开元素或其子元素时触发，会冒泡，较少单独使用，易多次触发。
10. **contextmenu**：鼠标右键点击（或快捷键）时触发，常用来自定义右键菜单。（支持冒泡）


### Promise 基本语法与常用方法

#### 1. 创建 Promise
- `new Promise((resolve, reject) => { ... })`  
  创建一个新的 Promise 实例，代码块（executor）内调用 `resolve(value)` 或 `reject(reason)` 决定成功/失败。返回一个新的promise
- `Promise.resolve(value)`  
  返回一个状态为 *fulfilled*（已成功）的 Promise。
- `Promise.reject(reason)`  
  返回一个状态为 *rejected*（已失败）的 Promise。

#### 2. 实例方法
- `.then(onFulfilled, onRejected)`  
  添加成功和失败的回调，始终返回新的 Promise（支持链式调用）。
- `.catch(onRejected)`  
  添加失败的回调，相当于 `.then(undefined, onRejected)`。
- `.finally(onFinally)`  
  不论成功还是失败都会执行的回调，不影响后续链式调用。

#### 3. 静态方法
- `Promise.all(iterable)`  
  等待所有 Promise 全部 fulfilled，全部成功返回所有结果数组。若有一个失败立即返回失败。
- `Promise.allSettled(iterable)`  
  等待所有 Promise 都完成（无论成败），返回「每个 Promise 的最终结果对象」的数组。
- `Promise.race(iterable)`  
  只要有一个 Promise 完成（fulfilled/rejected），立即返回该结果。
- `Promise.any(iterable)`  
  只要有一个 Promise fulfilled，就立即返回其值。全部失败才进入 rejected。

### 支持 transition 的 CSS 属性

**常见可过渡属性分类：**

- **颜色相关**
  - `color`
  - `background-color`
  - `border-color`
  - `outline-color`

- **尺寸和位置**
  - `width`
  - `height`
  - `top` / `right` / `bottom` / `left`
  - `margin`
  - `padding`
  - `border-width`
  - `border-radius`
  - `outline-width`

- **透明度与可见性**
  - `opacity`
  - `visibility`（仅部分浏览器生效且建议慎用）

- **背景与阴影**
  - `background`
  - `background-position`
  - `background-size`
  - `box-shadow`
  - `text-shadow`

- **变换与动画**
  - `transform`（如 `translate`、`scale`、`rotate`、`skew`）

- **字体与文本**
  - `font-size`
  - `line-height`
  - `letter-spacing`
  - `word-spacing`

---

**不支持 transition 的常见属性：**

- **布局属性**
  - `display`
  - `position`
  - `float`
  - `overflow`

- **盒模型与特殊属性**
  - `box-sizing`
  - `min-width` / `max-width` / `min-height` / `max-height`（部分情况下支持不稳定）

- **文本与光标相关**
  - `font-family`
  - `text-align`
  - `white-space`
  - `cursor`
  - `background-image`


### React 生命周期

#### 1. 挂载阶段（Mounting）
- **constructor(props)**  
  初始化 state、绑定方法等
- **static getDerivedStateFromProps(props, state)**  
  根据 props 派生新的 state（少用）
- **render()**  
  渲染 UI
- **componentDidMount()**  
  组件挂载完成，可进行副作用操作（如数据请求）

#### 2. 更新阶段（Updating）
- **static getDerivedStateFromProps(props, state)**  
  同挂载阶段，根据 props 派生 state
- **shouldComponentUpdate(nextProps, nextState)**  
  返回布尔值，决定组件是否重新渲染
- **render()**  
  重新渲染 UI
- **getSnapshotBeforeUpdate(prevProps, prevState)**  
  获取更新前快照数据，返回值作为 componentDidUpdate 的第三个参数
- **componentDidUpdate(prevProps, prevState, snapshot)**  
  组件更新完成，可进行副作用操作

#### 3. 卸载阶段（Unmounting）
- **componentWillUnmount()**  
  组件卸载前，清理副作用（如定时器、事件监听等）

#### 4. 错误捕获阶段（Error Handling）
- **static getDerivedStateFromError(error)**  
  发生错误时用于更新 state
- **componentDidCatch(error, info)**  
  捕获并处理渲染过程中的异常



### 加载 CSS 的方式及优化建议

1. **`<link rel="stylesheet" href="./index.css">`**
    - 支持**并行加载**，多个 link 可同时下载 CSS 文件，提高页面首屏渲染速度。
    - **不会阻塞 HTML 下载与解析**，但会**阻塞页面渲染**，即 CSS 未加载完成前 Render Tree 无法构建，页面不会显示布局与样式。
    - 样式优化建议：
        - 合理拆分/合并 CSS 文件，减少 HTTP 请求次数。
        - 将关键 CSS 内联到 `<head>`，提升首屏渲染速度（Critical CSS）。
        - 用 `media` 属性实现按需加载，如 `media="print"`。
        - 可用 `preload` 预加载重要 CSS 文件：  
          `<link rel="preload" as="style" href="main.css" onload="this.rel='stylesheet'">`

2. **`@import` 引入 CSS**（可在 `<style>` 或 CSS 文件中使用）
    - 加载时机较晚，**需要等待父样式加载完成，才会串行加载 @import 的子样式**。
    - 不阻塞 HTML 解析，但同样**阻塞页面渲染**，且会造成额外的请求延迟，影响渲染性能。
    - 样式优化建议：
        - 尽量避免在生产环境使用 `@import`，优先使用 `<link>`。
        - 若用于按需加载，建议配合媒体查询，且减少层级嵌套。

3. **JavaScript 动态插入 `<link>` 或 `<style>` 标签**
    - 适用于**按需加载**或**主题切换**等场景，实现灵活的样式动态切换。
    - 仅在需要时加载对应样式，减少首屏负担。
    - 样式优化建议：
        - 配合懒加载策略和用户行为触发，异步插入并监听加载完成事件，提升用户体验。

4. **模块化样式加载（如：`import styles from './index.scss'`）**
    - 依赖 webpack 等工具的 `css-loader`、`style-loader`，将 CSS 作为模块引用到 JS 中，实现样式的模块化和作用域隔离。
    - 适合组件化开发，提升样式复用与维护性。
    - 样式优化建议：
        - 开启 CSS Modules，避免全局污染。
        - 结合 Tree Shaking 移除未使用样式，减小包体积。
        - 不支持 CSS 文件中直接使用 `import`（ES Module 语法），需通过 JS 环境与构建工具处理。

> **性能优化结论：**  
> - 推荐优先使用 `<link>` 方式，必要时内联关键 CSS。
> - 避免多重 `@import`，减少阻塞与请求链路。
> - 动态样式和模块化样式需配合构建、懒加载等策略，保障首屏性能和样式隔离。

### 加载 JS 的方式及优化建议

1. **`<script src="./index.js"></script>`、`<script async src="script.js"></script>`、`<script defer src="script.js"></script>`**
    - **普通方式**：直接插入 `<script src="..."></script>`。按照出现顺序解析并执行，**阻塞 HTML 解析**，影响首屏性能。
    - **async**：脚本和 HTML 并行下载，下载完成**立即执行**，不保证执行顺序。适用于互不依赖的脚本。
    - **defer**：脚本和 HTML 并行下载，页面解析完后**按顺序依次执行**。推荐用于优化加载和保持依赖顺序的多个脚本。
    - **样式优化建议**：
        - 尽量将 `<script>` 标签放在 `body` 底部或使用 `defer`，减少阻塞页面渲染。
        - 独立业务脚本、第三方统计分析等非关键脚本建议使用 `async`，减少对主线程的影响。
        - 合理拆分和异步加载 JS 文件，按需加载、避免冗余。

2. **动态插入脚本（按需加载）**
    - 方式：用 JS 动态创建 `<script>` 标签实现懒加载，如：
      ```js
      const script = document.createElement('script');
      script.src = 'script.js';
      document.head.appendChild(script);
      ```
    - **优化建议**：
        - 仅在用户触发或特定场景加载，减少初始加载体积。
        - 可以监听 `onload` 事件，保障依赖顺序。
        - 适合模块化业务、异步加载大体积库。

3. **ES6 模块化方式（type="module"）**
    - 示例：
      ```js
      // math.js
      export function add(a, b) { return a + b; }
      // main.js
      import { add } from './math.js';
      ```
      在 HTML 中需要 `<script type="module" src="main.js"></script>`
    - **样式优化建议**：
        - 支持 import/export 语法，自动异步加载，推荐现代项目使用。
        - 天然支持 Tree Shaking，移除未使用代码，减小体积。
        - 可结合 CDN、HTTP2 按需加载细粒度模块。

4. **CommonJS 规范（Node.js、打包工具）**
    - 用于服务端和打包环境，示例：
      ```js
      // utils.js
      module.exports = { sum };
      // 或者
      exports.sum = sum;

      // main.js
      const { sum } = require('./utils.js');
      ```
    - **优化建议**：
        - 浏览器环境需通过打包（如 webpack、rollup）转为浏览器可识别格式。
        - 整合多个模块文件，减少请求。
        - 可配合代码分割实现异步加载，减小首屏体积。

> **性能优化总结**：
> - 核心逻辑脚本建议用 `defer`，保障并行加载与执行顺序。
> - 非关键/三方库建议用 `async` 或动态插入，缩短首屏阻塞时间。
> - 模块化脚本结合打包工具优化体积和加载速度，实现更优加载链路。

### require 和 import 引入 js 的区别（无表格样式优化）

**1. `require`（CommonJS 模块规范，使用 `module.exports` 导出）**

- **加载时机**：运行时同步加载。执行到 `require` 语句时才去加载模块，会阻塞后续代码，只有加载并执行完成后才继续往下执行。
- **变量导出机制**：
  - 基本类型为值拷贝：导入模块获得的是当时导出的值，后续修改不会互相影响。
  - 引用类型为地址拷贝：导入模块获得的是对象的引用，属性变化可反映到导入方，但如果重新赋值不可同步。
- **导入灵活性**：支持动态导入，可用变量或表达式拼接路径，比如 `require('./' + name + '.js')`，可在任何代码位置使用（如条件、函数内部等）。
- **环境支持**：Node.js 原生支持，浏览器需用打包工具如 webpack 转换后使用。
- **导出写法**：`module.exports = {}` 或 `exports.xxx = xxx`。

**2. `import/export`（ES6 模块规范，使用 `export` 和 `export default` 导出）**

- **加载时机**：静态编译时异步加载。在编译阶段完成模块解析，不会阻塞运行时代码，底层自动异步加载。
- **变量导出机制**：
  - 实时绑定：导入变量并不是简单拷贝，而是对模块内部变量的“引用”，模块内部变量变化会实时反映到所有导入方（但导入方无法直接修改被导出的绑定）。
- **导入的限制**：
  - 只能静态导入，路径必须为字符串常量，不能用变量拼接。
  - 必须写在文件顶层，不能在条件、函数等代码块内使用。
- **导出写法**：可以用 `export const/function/class ...` 或 `export default ...`。
- **体积优化**：支持 Tree Shaking，能静态分析移除未使用代码，减小打包体积。


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


### 不同标签（页面）间的通讯方式

- **URL参数**  
  通过在URL中拼接参数进行信息传递，适合简单、明文的小数据传递。常见于页面跳转或嵌入iframe等。

- **localStorage**  
  各标签页可通过轮询localStorage或监听`storage`事件获取数据，实现通信。适合简单数据共享，缺点是同步性不强。

- **IndexedDB**  
  用于存储大量结构化数据并可在不同标签页间共享。适合体量大、结构化的数据场景，但操作较为繁琐。

- **window.open + postMessage**  
  一方打开窗口（`window.open`）或获取对方window对象后，通过`postMessage`进行通信。  
  示例：
  ```js
  // 父页面打开子窗口
  let channel = window.open('#/list');
  channel.postMessage({
    type: 'notice',
    content: '新消息通知',
  });
  window.addEventListener('message', (e) => {
    if (e.data.type === 'notice') {
      alert(`通知：${e.data.content}`);
    }
  });
  ```
  适合父子窗口、iframe与主页面间的结构化跨域通信。

- **BroadcastChannel**  
  通过新建通道名相同的BroadcastChannel对象，实现同源下多标签实时双向通信。API简单，实时性高。  
  示例：
  ```js
  const channel = new BroadcastChannel('my-channel');
  document.getElementById('btn').onclick = function () {
    channel.postMessage({
      type: 'notice',
      content: '新消息通知',
    });
  };
  channel.onmessage = (event) => {
    if (event.data.type === 'notice') {
      alert(`通知：${event.data.content}`);
    }
  };
  ```
  适合同源下任意标签、iframe实时消息广播。




### Object.create()

`Object.create()` 用于**创建一个新对象，并指定其原型**，是实现原型式继承的核心工具。

```js
const obj = Object.create(null);
console.log(obj.toString);           // undefined （没有继承 Object.prototype）
console.log(obj instanceof Object);  // false
```

#### Object.create({}) 和 {} 的区别

- `{}` 的原型是 **Object.prototype**
- `Object.create({})` 的原型是**一个空对象**（该空对象的原型才是 Object.prototype）

----

#### class 继承与原型链

> class 本质上是基于原型和构造函数的语法糖。

```js
class Person {}
class Student extends Person {}

Object.getPrototypeOf(Student) === Person            // true
Object.getPrototypeOf(Person) === Function.prototype // true
```

- **通过 `extends` 继承的类**，其 `[[Prototype]]`（即 `__proto__`）就是它父类的引用  
- **没有 `extends` 的普通类**，其 `[[Prototype]]` 是 `Function.prototype`

```js
Object.getPrototypeOf(Array) === Function.prototype // true
```



### 页面的生命周期

- **readystatechange**（文档状态变化）  
  - 触发：`document.readyState` 变化时
  - 状态值：
    - **loading**：初始状态，HTML 正在解析
    - **interactive**：DOM 树已构建完成（接近 DOMContentLoaded）
    - **complete**：所有资源加载完成（接近 window.onload）
  - 现代开发更推荐使用 DOMContentLoaded 和 load

- **DOMContentLoaded**（DOM 内容加载完成）
  - 触发：HTML 解析完毕，所有同步和 defer 脚本执行完毕
  - 不等待：async 脚本、图片、CSS（部分浏览器等 CSS）、iframe
  - 主要用于：监控页面“首屏可交互时间”

- **load**
  - 触发：全部资源（HTML、CSS、JS、图片、字体、iframe、Web Worker 等）加载完成

- **beforeunload**（页面即将卸载）
  - 触发：用户关闭、刷新、跳转页面前
  - 典型用途：弹窗提示“内容未保存”等

- **unload**（页面正在卸载）
  - 异步操作（如 fetch、setTimeout）会被浏览器忽略
  - 可用 navigator.sendBeacon() 发送日志

- **pageshow / pagehide**（页面显示/隐藏，适用于 bfcache 缓存场景）
  - pageshow：页面加载或从 bfcache 恢复（如浏览器后退）
  - pagehide：页面进入后台、切换标签或进入 bfcache
  - 场景：恢复动画、加载视频、暂停/恢复游戏等

---

**生命周期事件典型顺序如下：**

```text
1. readystatechange → "loading"
2. readystatechange → "interactive" （DOM 已构建）
3. DOMContentLoaded               （≈ 上一时刻）
4. readystatechange → "complete"  （资源加载完成）
5. window.load                    （≈ 上一时刻）
6. pageshow（首次加载也会触发，在 load 之后）
7. （用户操作...）
8. pagehide
9. beforeunload
10. unload
```

   
### 单点登录（SSO）

> **将身份 Token（如 JWT、会话令牌）存储在设置了 `HttpOnly` 的 Cookie 中要比放在 `localStorage` 更安全。**  
> - `HttpOnly` 可防止 JavaScript 读取 Cookie，有效防御 XSS 攻击窃取凭证。  
> - `localStorage` 对前端完全开放，只要存在 XSS 漏洞，攻击者可直接读取并盗用身份，风险极高。

---

#### 1. 主/子域名 SSO（同根域，例如 `app1.example.com` 和 `auth.example.com`）

利用 Cookie 的 `domain` 共享能力（如 `Domain=.example.com`），主域下所有子域自动带上该 Cookie。

**流程：**
1. 用户访问子应用（未登录状态）
2. 跳转到认证中心（单点登录入口）
3. 认证成功后，设置 Cookie
4. 重定向回子应用
5. 后续请求自动携带 Cookie，无需前端额外处理

```http
Set-Cookie: token=xxx; Domain=.example.com; Path=/; Secure; HttpOnly; SameSite=Lax
```
**优点：**
- 安全性高
- 前端无需关心 token 存储
- 用户在所有子域下自然保持登录态

#### 2. 跨域 SSO（不同主域，例如 `example.com` 和 `myapp.com`）

> **注意：不要通过 URL（如 `?token=xxx`）直接传递长期 Token！**

**推荐方案：使用一次性短效 ticket：**
- 认证中心生成一个**一次性、短期（30 秒内有效）临时票据（ticket）**。
- 跳转方式：
    ```
    https://myapp.com/sso?ticket=UNIQUE_TICKET
    ```
- `myapp.com` 的后端收到 ticket 后，**立即后台请求认证中心校验 ticket 并兑换为正式 Token**，并通过设置 Cookie 管理会话。


#### Cookie 常用属性说明

- **Name=Value**  
  Cookie 的名称和值，必须项。例如：`sessionid=abc123`

- **Domain**  
  指定哪些域名可以访问此 Cookie。  
  *默认值：当前页面完整域名*  
  例如：`Domain=.example.com`，则所有子域都携带该 Cookie。

- **Path**  
  Cookie 生效的路径前缀。仅当请求 URL 的路径以该值开头时才会发送 Cookie。  
  - 例如：`Path=/admin`，只有 `/admin` 及其子路径会携带 Cookie。  
  - `Path=/`，则所有路径都会发送该 Cookie。

- **Secure**  
  仅通过 HTTPS 传输，HTTP 明文请求不会携带该 Cookie。

- **HttpOnly**  
  禁止 JavaScript 访问。即前端 JS 无法通过 `document.cookie` 读取或修改该 Cookie，可有效防御 XSS。

- **SameSite**  
  用于防御 CSRF，控制跨站请求时是否携带 Cookie：
  - **Strict**：任何跨站请求都不发送 Cookie，安全性最高，但可能影响用户体验（如外部链接需重新登录）。
  - **Lax**（常用默认）：仅在用户主动跳转（如点击链接、地址栏输入）时发送 Cookie，常用于登录态维持。
    - 外部网站跳转到你的网站：会带 Cookie
    - 恶意表单、图片、fetch() 跨站请求不会带 Cookie，防 CSRF
  - **None**：无论何种跨站请求都发送 Cookie（需配合 Secure 使用）。

- **Expires**  
  绝对过期时间。例如：`Expires=Wed, 21 Oct 2025 07:28:00 GMT`

- **Max-Age**  
  相对过期时间（秒数），如 `Max-Age=3600`（1 小时后过期）。优先级高于 Expires。


### V8 引擎垃圾回收机制

V8 引擎主要负责 JavaScript 代码的编译和执行。它的处理流程如下：

1. **解析阶段**  
   解析器会对 JavaScript 代码进行词法分析（将代码拆分成最小的语法单元）和语法分析（将语法单元组合成树形结构——AST，抽象语法树）。

2. **执行阶段**  
   - **解释器**：将 AST 转换为字节码。
   - **编译器**：将热点代码进一步优化生成高效的机器码。

3. **垃圾回收（GC）机制**  
   V8 采用分代回收策略，根据对象的生命周期采用不同的回收方法，内存主要分为两代：
   
   #### 新生代（Young Generation）
   - **对象特点**：生命周期短，主要存放临时对象（如新建的对象、函数内部局部变量、临时数组等）。
   - **内存布局**：新生代内存被划分为两个相等区域——From 区（使用中）和 To 区（空闲）。
   - **回收过程**（Scavenge 算法/复制收集）：
     1. 遍历 From 区的存活对象，将其复制到 To 区。
     2. 清空 From 区。
     3. From 与 To 区角色互换。
   - **优点**：回收速度快，仅处理小块内存，适合频繁创建和销毁对象。
   - **对象晋升**：多次回收后仍存活的对象会晋升到老生代。
   
   #### 老生代（Old Generation）
   - **对象特点**：生命周期长，占用内存较大，例如全局变量、缓存数据等。
   - **回收频率**：相对于新生代回收频率低。
   - **回收方法**：
     - **标记-清除（Mark-Sweep）**：从根对象出发标记所有存活对象，遍历内存清除未被标记的对象。缺点是会产生内存碎片（可用空间分散）。
     - **标记-整理（Mark-Compact）**：标记后不直接删除垃圾对象，而是将存活对象移动到内存一端，统一清除边界外的空间，有效解决内存碎片问题。

> 总结：  
> - 新生代采用复制回收，快速高效，适合短生命周期对象。 
> - 老生代采用标记-清除和标记-整理，适合大对象和长生命周期对象，兼顾空间利用率和性能。



### 前端常见攻击方式

#### 1. 跨站脚本攻击（XSS）

- **定义**：攻击者向网页注入恶意脚本（通常为 JavaScript），当其他用户访问页面时，脚本会在其浏览器执行，用于盗取 Cookie、Session 等敏感信息或进行恶意操作。
- **常见类型**：
  - **反射型 XSS**：恶意脚本作为请求参数（如 URL）发送到服务器，服务器未经处理直接返回，用户点击恶意链接即触发。
  - **存储型 XSS**：恶意脚本被存储在服务器端（如评论区、论坛帖子等），其他用户访问时自动触发。
  - **DOM 型 XSS**：前端代码对 DOM 的不安全操作导致，攻击脚本仅在客户端注入和执行。
- **前端防御措施**：
  - 对用户内容进行转义（如 `<<` 转为 `&lt;`）。
  - 谨慎使用 `innerHTML`，优先使用 `textContent` 或 `innerText`。
  - 利用内容安全策略（CSP）限制页面可执行的脚本来源。

---

#### 2. 跨站请求伪造（CSRF）

- **定义**：攻击者诱使用户在已登录的受信任网站（如银行网站）上，执行非本意的操作（如转账）。CSRF 通常利用浏览器自动携带目标站点 Cookie 的特性。
- **攻击示例**：
  - 用户已登录某网站，攻击者诱导用户访问一个恶意页面，该页面通过如下请求发起跨域操作：  
    `<img src="https://bank.com/transfer?to=attacker&amount=1000" />`  
    浏览器会自动携带 bank.com 的 Cookie。

- **前端防御措施**：
  - 设置 `Cookie` 的 `SameSite` 属性：
    - `SameSite=Strict`：仅同域请求时携带 Cookie，能彻底阻止 CSRF（但可能影响部分功能）。
    - `SameSite=Lax`（默认）：仅在“用户主动触发的跨域 GET 请求”时携带 Cookie。
  - 实现 CSRF Token 校验：  
    生成随机、不可预测的 Token（页内生效），并通过表单隐藏字段或响应头传递，提交时校验 Token 合法性。
  - 检查请求来源（Referer/Origin）：  
    前端可在发送敏感请求前检查 `document.referrer` 或 `location.origin`，后端可校验请求头来源。
  - 防御点击劫持（Clickjacking）：  
    攻击者利用透明 iframe 覆盖敏感按钮，诱使用户点击。可通过设置响应头 `X-Frame-Options` 或 `Content-Security-Policy: frame-ancestors` 限定哪些页面可以嵌入当前页面。


### Git 撤销更改整理

#### 1. 撤销本地更改

- 撤销当前目录下所有未暂存（未 add）修改：
  ```bash
  git restore .
  # 或
  git checkout .
  # 或
  git restore 文件名
  ```

#### 2. 撤销已暂存（已 add）但未提交的更改

- 取消已添加到暂存区的更改：
  ```bash
  git reset HEAD .
  # 然后还原工作目录
  git restore .
  # 或
  git checkout .
  # 或
  git restore 文件名
  ```

#### 3. 撤销提交

> ⚠️ **注意：`git reset` 适用于自己开发的分支，若多人协作请勿轻易撤销推送后的提交！**

- **软撤销**（仅撤销提交，代码改动仍在工作区）
  ```bash
  git reset --soft HEAD~1      # 撤销最近 1 次提交
  git reset --soft HEAD~2      # 撤销最近 2 次提交
  ```
- **硬撤销**（彻底删除提交及相应代码更改）
  ```bash
  git reset --hard HEAD~1
  ```
- **撤销指定提交**（保留后续提交历史）
  ```bash
  git revert 提交ID
  ```

---

#### 4. 只拉取远端更新（fetch）

- `git fetch`：仅拉取远端仓库的提交、分支、标签到本地，不修改本地代码，不会影响本地更改。  
  远端更新会存储至本地的“远端追踪分支”。

  ```bash
  # 拉取远端 origin 的所有分支和标签
  git fetch origin

  # 查看本地 main 与远端 origin/main 的新提交
  git log main..origin/main

  # 查看具体代码差异
  git diff main origin/main
  ```

> 执行完 `git fetch` 后，需要手动将远端更新合入本地分支（`merge` 或 `rebase`），`git pull` 则自动完成这两步。如下：

#### 5. 合并远端改动到本地

- **方式一：合并（生成合并提交）**
  ```bash
  git checkout main    # 切换到本地 main 分支
  git merge origin/main
  ```
- **方式二：变基（提交历史更整洁）**
  ```bash
  git checkout main
  git rebase origin/main
  ```
- **方式三：直接拉取并合并**
  ```bash
  git pull origin main   # 等价于 fetch + merge
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