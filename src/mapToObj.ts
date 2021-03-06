import { PredIndexedOptional } from './_types';
import { purry } from './purry';

/**
 * Map each element of an array into an object using a defined callback function.
 * @param array The array to map.
 * @param fn The mapping function, which should return a tuple of [key, value], similar to Object.fromEntries
 * @returns The new mapped object.
 * @signature
 *    P.mapToObj(array, fn)
 * @signature
 *    P.mapToObj(fn)(array)
 * @example
 *    P.mapToObj([1, 2, 3], x => [String(x), x * 2]) // => {1: 2, 2: 4, 3: 6}
 *    P.pipe(
 *      [1, 2, 3],
 *      P.mapToObj(x => [String(x), x * 2])
 *    ) // => {1: 2, 2: 4, 3: 6}
 *    P.pipe(
 *      [0, 0, 0],
 *      P.mapToObj.indexed((x, i) => [i, i])
 *    ) // => {0: 0, 1: 1, 2: 2}
 * @category Array, Pipe
 */
export function mapToObj<T, K extends string | number | symbol, V>(
  array: readonly T[],
  fn: (element: T, index: number, array: readonly T[]) => [K, V]
): Record<K, V>;
export function mapToObj<T, K extends string | number | symbol, V>(
  fn: (element: T, index: number, array: readonly T[]) => [K, V]
): (array: readonly T[]) => Record<K, V>;

export function mapToObj() {
  return purry(_mapToObj(), arguments);
}

const _mapToObj = () => <T>(
  array: any[],
  fn: PredIndexedOptional<any, any>
) => {
  return array.reduce((result, element, index) => {
    const [key, value] = fn(element, index, array);
    result[key] = value;
    return result;
  }, {});
};
