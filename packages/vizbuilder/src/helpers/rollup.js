// This is a copy of the group.js file in the package d3-array@2.4.0
// d3plus uses d3-array@1.2.4, and using both versions at the same time
// would be bothersome.

/**
 * Copyright 2010-2018 Mike Bostock
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the author nor the names of contributors may be used to
 *   endorse or promote products derived from this software without specific prior
 *   written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @template T
 * @typedef {(d: T, i: number, dd: T[]) => string} Accesor
 */

/**
 * @template T
 * @param {T[]} values
 * @param {...Accesor<T>} keys
 */
export function group(values, ...keys) {
  return nest(values, identity, identity, keys);
}

/**
 * @template T
 * @param {T[]} values
 * @param {...Accesor<T>} keys
 */
export function groups(values, ...keys) {
  return nest(values, Array.from, identity, keys);
}

/**
 * @template T
 * @param {T[]} values
 * @param {(i: T[]) => any} reduce
 * @param {...Accesor<T>} keys
 */
export function rollup(values, reduce, ...keys) {
  return nest(values, identity, reduce, keys);
}

/**
 * @template T
 * @param {T[]} values
 * @param {(i: T[]) => any} reduce
 * @param {...Accesor<T>} keys
 */
export function rollups(values, reduce, ...keys) {
  return nest(values, Array.from, reduce, keys);
}

/**
 * @template T
 * @param {T} i
 */
function identity(i) {
  return i;
}

/**
 * @template T
 * @param {T[]} values
 * @param {(groups: Map<string, T>) => any} map
 * @param {(items: T[]) => any} reduce
 * @param {Accesor<T>[]} keys
 */
function nest(values, map, reduce, keys) {
  return (function regroup(values, i) {
    if (i >= keys.length) return reduce(values);
    const groups = new Map();
    const keyof = keys[i++];
    let index = -1;
    for (const value of values) {
      const key = keyof(value, ++index, values);
      const group = groups.get(key);
      if (group) group.push(value);
      else groups.set(key, [value]);
    }
    for (const [key, values] of groups) {
      groups.set(key, regroup(values, i));
    }
    return map(groups);
  }(values, 0));
}
