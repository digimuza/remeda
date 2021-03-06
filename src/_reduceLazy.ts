export type LazyResult<T> = LazyEmpty<T> | LazyNext<T> | LazyMany<T>;

interface LazyEmpty<T> {
  done: boolean;
  hasNext: false;
  hasMany?: false | undefined;
  next?: undefined;
}

interface LazyNext<T> {
  done: boolean;
  hasNext: true;
  hasMany?: false | undefined;
  next: T;
}

interface LazyMany<T> {
  done: boolean;
  hasNext: true;
  hasMany: true;
  next: T[];
}

export function _reduceLazy<T, K>(
  array: readonly T[],
  lazy: (item: T, index?: number, array?: readonly T[]) => LazyResult<K>,
  indexed?: boolean
) {
  return array.reduce((acc: K[], item, index) => {
    const result = indexed ? lazy(item, index, array) : lazy(item);
    if (result.hasMany === true) {
      acc.push(...result.next);
    } else if (result.hasNext === true) {
      acc.push(result.next);
    }
    return acc;
  }, []);
}
