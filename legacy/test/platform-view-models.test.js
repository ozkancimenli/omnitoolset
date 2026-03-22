import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPublicUrl, sanitizeReturnTo } from '../src/core/platform/view-models.js';

test('buildPublicUrl keeps relative paths when no public app url is configured', () => {
  assert.equal(buildPublicUrl('/products/review-booster', ''), '/products/review-booster');
});

test('buildPublicUrl expands to an absolute frontend url when provided', () => {
  assert.equal(
    buildPublicUrl('/products/review-booster', 'https://www.omnitoolset.com'),
    'https://www.omnitoolset.com/products/review-booster'
  );
});

test('sanitizeReturnTo allows absolute urls on the configured frontend origin', () => {
  assert.equal(
    sanitizeReturnTo(
      'https://www.omnitoolset.com/products/review-booster',
      '/products/review-booster',
      'https://www.omnitoolset.com'
    ),
    'https://www.omnitoolset.com/products/review-booster'
  );
});

test('sanitizeReturnTo rejects absolute urls on a different origin', () => {
  assert.equal(
    sanitizeReturnTo(
      'https://malicious.example.com/products/review-booster',
      '/products/review-booster',
      'https://www.omnitoolset.com'
    ),
    'https://www.omnitoolset.com/products/review-booster'
  );
});
