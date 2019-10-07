/**
 * Returns the first argument whose type is not null or undefined.
 * It still returns NaN and false.
 * @template T
 * @param  {...T} args
 * @returns {T | undefined}
 */
export const firstTruthy = (...args) => args.find(token => token != null);

/**
 * Returns the first argument whose type is Boolean.
 * @param  {...any} args
 * @returns {boolean | undefined}
 */
export const firstBoolean = (...args) => args.find(token => typeof token === "boolean");
