export function sum(...arg) {
    return arg.reduce((a, b) => a + b, 0);
}

export function subtract(...arg) {
    if (arg.length === 0) return 0;
    return arg.reduce((a, b) => a - b);
}
