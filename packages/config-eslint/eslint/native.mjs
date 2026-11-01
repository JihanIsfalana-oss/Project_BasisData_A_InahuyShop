import { FlatCompat } from '@eslint/eslintrc'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'

const appDirectory = process.cwd()

const appRequire = createRequire(resolve(appDirectory, '__placeholder__.js'))

const expoConfigPath = appRequire.resolve('eslint-config-expo')
const expoConfigDirectory = dirname(expoConfigPath)

const compat = new FlatCompat({
  baseDirectory: appDirectory,
  resolvePluginsRelativeTo: expoConfigDirectory,
})

export const nativeConfig = [
  {
    ignores: ['.expo/**', 'dist/**', 'build/**', 'node_modules/**'],
  },
  ...compat.extends('expo'),
]

export default nativeConfig
