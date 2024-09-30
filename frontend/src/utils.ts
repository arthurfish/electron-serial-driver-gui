export function linespace(startValue: number, stopValue: number, cardinality: number): Array<number> {
    let arr: Array<number> = [];
    let step = (stopValue - startValue) / (cardinality - 1);
    for (let i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
    }
    return arr;
}

export function zip(arr1: Array<number>, arr2: Array<number>): [number, number][] {
    if(arr1.length != arr2.length) {
        throw Error("ZIPError: Two of them should has the same length!")
    }
    const length = arr1.length;
    let arr3: [number, number][] = []
    for (let i = 0; i < length; i++) {
        arr3.push([arr1[i], arr2[i]]);
        //console.log(`In zip: arr[${i}]=${arr3[i]}`);
    }
    return arr3
}