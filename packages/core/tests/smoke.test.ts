import { test } from 'node:test';
import assert from 'node:assert/strict';

test('toolchain: tsx + node:test runs TypeScript', () => {
  const double = (n: number): number => n * 2;
  assert.equal(double(21), 42);
});
