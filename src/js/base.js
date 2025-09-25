export function sayHello() {
    console.log('Hello from base.js!');
    document.body.innerHTML += '<p>模块加载成功hhh</p>';
}
sayHello()

const sum = (a, b) => {
    return a + b
}
sum(1,2)

// const getData = async  () => {
//     const res = await fetch('/list')
// }
// getData()



