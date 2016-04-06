import React, { Children } from 'react';

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 *
 * Thank you Dan Abramov for this code!
 */
export function compose(...funcs) {
  return (...args) => {
    /* istanbul ignore next */
    if (funcs.length === 0) {
      return args[0];
    }

    const last = funcs[funcs.length - 1];
    const rest = funcs.slice(0, -1);

    return rest.reduceRight((composed, f) => f(composed), last(...args));
  };
}

// :: (a -> boolean) => [a] => [a]
export const filter = f => x => x.filter(f);

// :: (a -> boolean) => [a] => [a]
export const all = f => x => {
  for (let i = 0; i < x.length; i++) {
    if (!f(x[i])) return false;
  }

  return true;
};

// :: a -> [a] -> [a]
export const without = (toRemove) => (point) =>
  filter((x) => !Object.is(x, toRemove))(point);

// :: [a] -> [a] -> [a]
export const withoutAll = (toRemove) => (point) =>
    filter(
      (x) => all(y => !Object.is(x, y))(toRemove)
    )(point);

// :: a -> [b]
export const uniqBy = x => y => {
  const checked = new Set();
  const result = [];

  y.forEach(a => {
    const prop = a[x];
    if (!checked.has(prop)) {
      checked.add(prop);
      result.push(a);
    }
  });

  return result;
};

/**
 * :: [a] -> [a] -> boolean
 *
 * Determines if an array, `point`, has any items that is not contained within
 * the `toCompare` array.
 *
 * @param toCompare
 *   The array to compare against.
 * @param point
 *   The array to check with.
 *
 * @return
 *   `true` if and only if `point` has at least one item that isn't
 *   contained within `toCompare`.
 */
export const containsUniq = (toCompare) => (point) =>
  withoutAll(toCompare)(point).length > 0;

// :: [[a]] -> [a]
export const concatAll = x => x.reduce((acc, cur) => [...acc, ...cur], []);

// :: (a => b) => [a] => [b]
export const map = f => x => x.map(f);

// :: (a => boolean) => [a] => a|undefined
export const find = f => x => x.find(f);

function KeyedComponent({ children }) {
  return Children.only(children);
}

//
/**
 * :: [Element] -> [Element]
 *
 * Ensures the given react elements have 'key' properties on them.
 *
 * @param  prefix
 *   The prefix for the keys.
 * @param  items
 *   The react elements.
 *
 * @return The keyed react elements.
 */
export function keyedElements(prefix : string, items : Array<Object>) {
  let index = 0;
  return items.map(x => {
    index++;
    return <KeyedComponent key={`${prefix}_${index}`}>{x}</KeyedComponent>;
  });
}
