import { hash } from "./hash";
import { purry } from "./purry";


export interface CacheMechanism<R> {
    set: (key: string, data: R) => void
    get: (key: string) => R | undefined
}
export declare type ArgsType<T> = T extends (...args: infer U) => any ? U : [];
export interface CacheOptions<I extends any[], R> {
    cacheKeyFn?: (...args: I) => string
    cacheMechanism?: CacheMechanism<R>
}

/**
 * Function middleware that caches function output based on input
 * @param fn - target function
 * @param cacheFn - function that receives and return cache key
 * @signature
 *    const newFn = R.cache(fn)
 * @example
 *    const request = (url: string) => axios.get(url)
 *    const requestWithCache = R.cache(request, (url) => url)
 * @data_first
 */
export function cache<I extends (...args: any[]) => any>(fn: I, options?: CacheOptions<ArgsType<I>, ReturnType<I>>): I
/**
 * Function middleware that caches function output based on input
 * @param fn - target function
 * @param cacheFn - function that receives and return cache key
 * @signature
 *    const newFn = R.cache(fn)
 * @example
 *    const request = (url: string) => axios.get(url)
 *    const requestWithCache = R.pipe(request, R.cache((url) => url))
 * @data_last
 */
export function cache<I extends (...args: any[]) => any>(options?: CacheOptions<ArgsType<I>, ReturnType<I>>): (fn: I) => I
export function cache() {
    return purry(_cache, arguments);
}
function _cache<I extends any[], R>(fn: (...args: I) => R, options?: CacheOptions<I, R>): (...args: I) => R {
    const defaultCache = (): CacheMechanism<R> => {
        const cache: Record<string, R> = {}
        return {
            get: (key) => {
                return cache[key]
            },
            set: (key, data) => {
                cache[key] = data
            }
        }
    }    
    const defaultCacheFn = (...args: I) => hash(JSON.stringify(args))  
    const cacheFnF = options?.cacheKeyFn || defaultCacheFn
    const cacheMechanism = options?.cacheMechanism || defaultCache() 
    return (...args: I) => {
        const cacheId = cacheFnF(...args)
        const cached = cacheMechanism.get(cacheId)
        if (cached == null) {
            const result = fn(...args)
            if (result instanceof Promise) {
                return result.then((r) => {
                    cacheMechanism.set(cacheId, r)
                    return r
                }) as unknown as R
            }
            cacheMechanism.set(cacheId, result)
            return result as R
        }
        return cached
    }
}