export function sayHello() {
    console.log('Hello from base.js!');
    document.body.innerHTML += '<p>模块加载成功hhh</p>';
}
sayHello()

const sum = (a, b) => {
    return a + b
}
console.log(sum(1, 3), 'sum(1,3)sum(1,3)sum(1,3)')

// const getData = async  () => {
//     const res = await fetch('/list')
// }
// getData()



