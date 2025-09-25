#### DOMContentLoaded  
HTML文档已完全解析并构建成DOM树,构建出完整的DOM树后立即触发,不等待  <link> <img>等资源加载. DOM 已就绪，可安全操作
```
document.addEventListener('DOMContentLoaded', () => {
    // DOM 已就绪，可安全操作
    const header = document.getElementById('header');
    header.textContent = 'Hello DOM';
});
```


- load（window 事件) 当页面中所有资源（HTML、CSS、JS、图片、字体等）全部加载完成后触发.统计页面完全加载时间、初始化依赖所有资源的功能
- beforeunload 当页面即将被卸载（如关闭标签页、刷新页面、跳转链接）前触发。 提示用户是否确认离开（如未保存的表单）
- unload 面正在被卸载时触发（在 beforeunload 之后）。
- readystatechange 文档状态变化事件
    当文档的 readyState（加载状态）发生变化时触发 readyState 有三个值
    loading：文档正在加载中（初始状态）。
    interactive：DOM 解析完成（与 DOMContentLoaded 触发时机接近）。
    complete：所有资源加载完成（与 load 触发时机接近）。
- pageshow / pagehide. 视频的暂停恢复等
  pageshow： 页面被显示时触发（包括首次加载、从缓存中恢复显示）。
   pagehide：页面被隐藏时触发（如切换标签页、最小化窗口）。 
    window.addEventListener('pageshow', () => {
        console.log('页面被显示');
    });

loading（初始状态） → DOMContentLoaded（DOM 就绪） → load（所有资源加载完成） → pageshow（页面显示） → pagehide（页面隐藏） → beforeunload（即将卸载） →
unload（正在卸载）。
