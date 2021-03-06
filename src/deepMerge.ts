import { isDefined, isArray, isObject } from './guards';
import { uniq } from './uniq';
import { clone } from './clone';
import { DeepPartial, DeepPartialObject } from './types';

function isCyclic(object: unknown) {
  const seenObjects = new WeakMap(); // use to keep track of which objects have been seen.
  function detectCycle(obj: unknown) {
    // If 'obj' is an actual object (i.e., has the form of '{}'), check
    // if it's been seen already.
    if (
      isObject(obj) &&
      Object.prototype.toString.call(obj) == '[object Object]'
    ) {
      if (seenObjects.has(obj)) {
        return true;
      }

      // If 'obj' hasn't been seen, add it to 'seenObjects'.
      // Since 'obj' is used as a key, the value of 'seenObjects[obj]'
      // is irrelevant and can be set as literally anything you want. I
      // just went with 'undefined'.
      seenObjects.set(obj, undefined);

      // Recurse through the object, looking for more circular references.
      for (var key in obj) {
        if (detectCycle(obj[key])) {
          return true;
        }
      }

      // If 'obj' is an array, check if any of it's elements are
      // an object that has been seen already.
    } else if (Array.isArray(obj)) {
      for (var i in obj) {
        if (detectCycle(obj[i])) {
          return true;
        }
      }
    }

    return false;
  }

  return detectCycle(object);
}

/**
 * Merging @param a and @param b recursively @param a is most important
 */
function recursiveMerge(a: unknown, b: unknown): unknown {
  if (isObject(a) && isObject(b)) {
    const output = { ...a };
    const keys = uniq([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      // If object cyclic I will not try to merge objects
      if (isCyclic(a[k])) {
        output[k] = a[k];
        continue;
      }
      output[k] = recursiveMerge(a[k], b[k]);
    }
    return output;
  }

  if (isArray(a) && isArray(b)) {
    // This step will nicely merge primitive values but will leave objects as duplicates
    return uniq(a.concat(b));
  }

  // If we here we know that a is primitive value if it's defined we chose a over b
  // Unless this value is empty string
  if (isDefined(a)) {
    return a;
  }

  return b;
}

/**
 * Merging object from left to right
 *
 * @param target - value be preserved if possible.
 * @param sources - value be preserved if possible.
 * @description
 * Consider following
 *
 * -  `array + obj = array`
 * -  `obj + array = obj`
 * -  `obj + obj = obj` (recursively merged)
 * -  `array + array = array` (removes duplicates using Set)
 * -  `(truthy plain value) + ob = (truthy plain value)`
 * -  `(truthy plain value) + undefined = (truthy plain value)`
 * -  `A(truthy plain value) + B(truthy plain value) = A(truthy plain value)`
 * -  `undefined + B(truthy plain value) = B(truthy plain value)`
 * -  `null + B(truthy plain value) = B(truthy plain value)`
 * 
 *
 * Handles circular references
 * @category Utility
 */
export function deepMergeLeft<T extends object, X extends DeepPartial<T>>(data: T, ...source: X[]): T;
export function deepMergeLeft<T extends object>(...sources: T[]): T;
export function deepMergeLeft<T extends object>(
  target: T,
  ...sources: DeepPartialObject<T>[]
): T {
  let output = { ...target } as unknown;
  for (const source of sources) {
    output = recursiveMerge(output, source);
  }
  return output as any;
}

/**
 * Merging object from right to left
 *
 * @param target value will be replaced if possible.
 * @description
 * Consider following
 * -  `array + obj = obj`
 * -  `obj + array = array`
 * -  `obj + obj = obj` (recursively merged)
 * -  `array + array = array` (removes duplicates using Set)
 * -  `(truthy plain value) + undefined = (truthy plain value)`
 * -  `A(truthy plain value) + B(truthy plain value) = B(truthy plain value)`
 * Handles circular references
 * @category Utility
 */

export function deepMergeRight<T extends object, X extends DeepPartial<T>>(data: T, ...source: X[]): T;
export function deepMergeRight<T extends object>(...sources: T[]): T;
export function deepMergeRight<T extends object>(
  target: T,
  ...sources: DeepPartialObject<T>[]
): T {
  let output = clone(target) as unknown;
  for (const source of sources) {
    // Only difference from mergeDeepLeft
    // That source go first and output last
    output = recursiveMerge(source, output);
  }
  return output as any;
}
