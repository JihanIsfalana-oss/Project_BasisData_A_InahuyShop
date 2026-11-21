import test from 'node:test'
import assert from 'node:assert/strict'
import { primitives, semantic, lightTheme, darkTheme } from '../src/index.js'

test('exports immutable token groups with required scale', () => {
  assert.ok(Object.isFrozen(primitives))
  assert.equal(primitives.spacing[4], '4px')
  assert.equal(primitives.spacing[8], '8px')
  assert.equal(primitives.controlHeight, 44)
  assert.equal(primitives.motion.fast, '150ms')
  assert.ok(semantic.color.primary)
  assert.ok(semantic.focus.ring)
  assert.ok(lightTheme.surface)
  assert.ok(darkTheme.surface)
  assert.deepEqual(Object.keys(lightTheme).sort(), Object.keys(darkTheme).sort())
})
