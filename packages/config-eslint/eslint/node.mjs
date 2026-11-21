import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export const nodeConfig = defineConfig([
  globalIgnores(['node_modules/**']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])

export default nodeConfig
