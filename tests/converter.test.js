const test = require('node:test');
const assert = require('node:assert/strict');
const { binaryToText, normalizeBinary, textToBinary, getStats } = require('../script');

test('encodes UTF-8 text to binary bytes', () => {
  assert.equal(textToBinary('Bon'), '01000010 01101111 01101110');
  assert.equal(textToBinary('é'), '11000011 10101001');
  assert.equal(textToBinary('🚀'), '11110000 10011111 10011010 10000000');
});

test('decodes valid binary into text', () => {
  assert.equal(binaryToText('01000010 01101111 01101110'), 'Bon');
  assert.equal(binaryToText('11000011 10101001'), 'é');
});

test('normalizes friendly separators', () => {
  assert.equal(normalizeBinary('01000010,01101111;01101110'), '01000010 01101111 01101110');
});

test('rejects malformed binary', () => {
  assert.throws(() => binaryToText('0100002'), /groupes de 8 bits/);
  assert.throws(() => binaryToText('11100000'), /encoded data was not valid/);
});

test('reports useful stats', () => {
  assert.equal(getStats('é', 'text-to-binary'), '1 caractère · 2 octets');
  assert.equal(getStats('01000010 01101111', 'binary-to-text'), '2 octets');
});
