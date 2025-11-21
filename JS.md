1. element.getBoundingClientRect() 获取元素位置信息
2. IntersectionObserver() 异步监听元素与视口 / 根元素的交叉状态
3. document.addEventListener('DOMContentLoaded', callback)DOM树构建完成后触发同步脚本和defer脚本执行完成后触发
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
