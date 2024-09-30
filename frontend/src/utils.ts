export function linespace(startValue: number, stopValue: number, cardinality: number): Array<number> {
    let arr: Array<number> = [];
    let step = (stopValue - startValue) / (cardinality - 1);
    for (let i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}
