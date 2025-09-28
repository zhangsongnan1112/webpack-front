import './js/base.js'
import './css/index.css'
import './sass/index.scss'
import './sass/index.sass'



document.getElementById('btn').onclick = function () {
    import(/* webpackChunkName: 'sum'*/'./js/sum.js').then(res => {
        console.log(res.sum(1, 2), '动态引入')
    })
}
// document.addEventListener('DOMContentLoaded', () => {
//     const textEl = document.getElementById('textContent');
//     const btnEl = document.getElementById('toggleBtn');
//     let isExpanded = false;
//     // 切换展开/收起状态
//     btnEl.addEventListener('click', () => {

//         isExpanded = !isExpanded;

//         if (isExpanded) {
//             textEl.classList.remove('clamped');
//             btnEl.textContent = '收起';
//         } else {
//             textEl.classList.add('clamped');
//             btnEl.textContent = '展开';
//         }
//     });
// });