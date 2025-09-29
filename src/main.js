import './js/base.js'
import './css/index.css'
import './sass/index.scss'
import './sass/index.sass'
// import 'core-js'  全量引入 体积大
// import 'core-js/features/promise' 按需引入


document.getElementById('btn').onclick =  () => {
    import(
        /* webpackChunkName: 'sum'*/
        /* webpackPreload: true */
        './js/sum.js'
    )
        .then(res => {
})
}

document.addEventListener('DOMContentLoaded', () => {
    const textEl = document.getElementById('textContent');
    const btnEl = document.getElementById('toggleBtn');
    let isExpanded = false;
    // 切换展开/收起状态
    btnEl.addEventListener('click', () => {

        isExpanded = !isExpanded;

        if (isExpanded) {
            textEl.classList.remove('clamped');
            btnEl.textContent = '收起';
        } else {
            textEl.classList.add('clamped');
            btnEl.textContent = '展开';
        }
    });
});

new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    },1000)
})
console.log([1, 2].includes(1))
