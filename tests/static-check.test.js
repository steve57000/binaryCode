const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('index.html', 'utf8');
const workflow = fs.readFileSync('.github/workflows/build.yml', 'utf8');

test('page references required assets and accessible live regions', () => {
  assert.match(html, /<html lang="fr">/);
  assert.match(html, /<link rel="stylesheet" href="styles\.css"/);
  assert.match(html, /<script src="script\.js"><\/script>/);
  assert.match(html, /role="status" aria-live="polite"/);
});

test('GitHub Actions workflow uses Node 24 compatible actions', () => {
  assert.match(workflow, /actions\/checkout@v5/);
  assert.match(workflow, /actions\/setup-node@v5/);
  assert.match(workflow, /actions\/upload-artifact@v6/);
  assert.match(workflow, /node-version: 24/);
  assert.match(workflow, /FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true/);
});
