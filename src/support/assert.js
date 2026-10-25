/**
 * Tiny assertion helpers.
 *
 * Scenarios must run under two different runners (Playwright's test runner and
 * Mocha/WDIO), so they cannot import either framework's expect. These helpers
 * throw the same shaped errors everywhere, and every message names the rule
 * that failed.
 */
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

export function assertMatch(value, matcher, message) {
  const ok = matcher instanceof RegExp ? matcher.test(String(value)) : String(value).includes(matcher);
  if (!ok) throw new Error(`${message}: "${String(value).slice(0, 200)}" does not match ${matcher}`);
}

export function assertArray(value, message) {
  if (!Array.isArray(value)) throw new Error(`${message}: expected an array, got ${typeof value}`);
}

export function assertLength(value, length, message) {
  if (!Array.isArray(value) || value.length !== length) {
    throw new Error(`${message}: expected ${length} items, got ${Array.isArray(value) ? value.length : typeof value}`);
  }
}
