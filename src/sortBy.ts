import { clone } from './clone';
import { isArray, isObject } from './guards';
import { pipe } from './pipe';
import { purry } from './purry';
import { type } from './type';

export type SortValue = boolean | number | string;
export type ComplexSort = {
  order?: 'asc' | 'desc';
  value: SortValue;
  compare?: (a: SortValue, b: SortValue) => number;
};
export type SortByProp = SortValue | ComplexSort | (SortValue | ComplexSort)[];
/**
 * Sorts the list according to the supplied function in ascending order.
 * Sorting is based on a native `sort` function. It's not guaranteed to be stable.
 * @param array - the array to sort
 * @param fn - the mapping function
 * @signature
 *    P.sortBy(array, fn)
 * @signature
 *    P.sortBy(fn)(array)
 * @example
 *    P.sortBy(
 *      [{ a: 1 }, { a: 3 }, { a: 7 }, { a: 2 }],
 *      x => x.a
 *    )
 *    // => [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 7 }]
 *
 *    P.pipe(
 *      [{ a: 1 }, { a: 3 }, { a: 7 }, { a: 2 }],
 *      P.sortBy(x => x.a)
 *    ) // => [{ a: 1 }, { a: 2 }, { a: 3 }, { a: 7 }]
 * @category Array, Pipe
 */
export function sortBy<T>(
  array: readonly T[],
  fn: (item: T) => SortByProp
): T[];
export function sortBy<T>(
  fn: (item: T) => SortByProp
): (array: readonly T[]) => T[];

export function sortBy() {
  return purry(_sortBy, arguments);
}

function _sortBy<T>(array: T[], fn: (item: T) => SortByProp): T[] {
  const copied = clone(array);
  const sortedArray = copied.sort((a, b) => {
    const aa = fn(a);
    const bb = fn(b);
    type SortFunction = (a: SortValue, b: SortValue) => number;
    /** Default comparison function */
    const defaultCompare = (a: SortValue, b: SortValue) => {
      return a < b ? -1 : a > b ? 1 : 0;
    };
    /** Easy way to swap order */
    const order = (
      order: 'asc' | 'desc',
      sortFn: SortFunction
    ): SortFunction => {
      switch (order) {
        case 'asc':
          return (a: SortValue, b: SortValue) => {
            return sortFn(a, b);
          };
        case 'desc':
          return (a: SortValue, b: SortValue) => {
            return sortFn(b, a);
          };
      }
    };

    const sortComplex = (
      aC: Exclude<SortByProp, Array<any>>,
      bC: Exclude<SortByProp, Array<any>>
    ) => {
      if (type(aC) !== type(bC)) {
        throw new Error("Can't compare two different types");
      }
      if (isObject(aC) && isObject(bC)) {
        const sortFn = order(aC.order || 'asc', bC.compare || defaultCompare);
        const orderScore = sortFn(aC.value, bC.value);
        return orderScore;
      }
      if (isObject(aC)) {
        throw new Error('Impossible error'); // Code should never throw this error .Using this only as typescript guard
      }
      if (isObject(bC)) {
        throw new Error('Impossible error'); // Code should never throw this error. Using this only as typescript guard
      }
      return order('asc', defaultCompare)(aC, bC);
    };
    if (isArray(aa) && isArray(bb)) {
      if (aa.length !== bb.length) {
        throw new Error(
          'Critical sortBy error. Comparison properties should be static'
        );
      }
      for (const sIndex of new Array(aa.length).fill(0).map((_, i) => i)) {
        const aaV = aa[sIndex];
        const bbV = bb[sIndex];
        if (type(aaV) !== type(bbV)) {
          throw new Error("Can't compare two different types");
        }
        const result = sortComplex(aaV, bbV);
        if (result !== 0) {
          return result;
        }
      }
    }

    if (type(aa) !== type(bb)) {
      throw new Error("Can't compare two different types");
    }

    if (isObject(aa) && isObject(bb)) {
      const sortFn = order(aa.order || 'asc', aa.compare || defaultCompare);
      const orderScore = sortFn(aa.value, bb.value);
      return orderScore;
    }
    if (isObject(aa)) {
      throw new Error('Impossible error'); // Code should never throw this error .Using this only as typescript guard
    }
    if (isObject(bb)) {
      throw new Error('Impossible error'); // Code should never throw this error. Using this only as typescript guard
    }

    return sortComplex(
      aa as Exclude<SortByProp, Array<any>>,
      bb as Exclude<SortByProp, Array<any>>
    );
  });

  return sortedArray;
}

const l = [
  {
    a: 4,
    x: 74,
  },
];

pipe(
  l,
  sortBy(a => a.a)
);
