import * as R from "ramda";

/**
 * Filter an object's with a function that takes two arguments, (key, value)
 * Example: filterKeyValue((k, v) => k === "a", {a: 1, b: 2})  => {a: 1}
 */
export const filterKeyValue = (pred: Function, obj: any) =>
    R.pipe(
        // @ts-ignore
        R.toPairs,
        // @ts-ignore
        R.filter(R.apply(pred)),
        R.fromPairs)(obj);