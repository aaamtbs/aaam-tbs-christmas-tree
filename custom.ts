
/**
 * 使用這個文件來定義自訂的函式和積木。
 * 進一步了解：https://makecode.microbit.org/blocks/custom
 */

enum MyEnum {
    //% block="one"
    One,
    //% block="two"
    Two
}

/**
 * 自訂的積木
 */
//% weight=100 color=#0fbc11 icon=""
namespace custom {
    /**
     * TODO: 在此描述函式
     * @param n 在此描述參數, eg: 5
     * @param s 在此描述參數, eg: "Hello"
     * @param e 在此描述參數
     */
    //% block
    export function foo(n: number, s: string, e: MyEnum): void {
        // Add code here
    }

    /**
     * TODO: 在此描述函式
     * @param value 在此描述值, eg: 5
     */
    //% block
    export function fib(value: number): number {
        return value <= 1 ? value : fib(value -1) + fib(value - 2);
    }
}
