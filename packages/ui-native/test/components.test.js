import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('native card source exposes accessible stable primitive', async () => {
  const source = await readFile(new URL('../src/components/Card.jsx', import.meta.url), 'utf8')
  assert.match(source, /accessibilityRole/)
  assert.match(source, /minHeight: 44/)
})
