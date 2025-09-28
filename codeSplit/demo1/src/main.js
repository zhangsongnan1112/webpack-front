import { sum } from './common.js'


console.log(sum(1,2,4,3,5), 111)

const btn = document.getElementById('btn')
btn.addEventListener('click', () => {
    import(/* webpackChunkName: "math" */'./math.js').then(res => {
        console.log(res, res.mathMin(1,4,0))
    })
})

