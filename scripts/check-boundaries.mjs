import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean)

const SCOPE = '@inahuyshop/'
const DEP_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
const pkg = (name) => `${SCOPE}${name}`

const WEB_APPS = ['storefront-web', 'admin-web']
const MOBILE_APPS = ['customer-mobile', 'admin-mobile']
const APPS = ['api', ...WEB_APPS, ...MOBILE_APPS]
const RUNTIME = [
  'contracts',
  'design-tokens',
  'domain',
  'validation',
  'api-client',
  'ui-web',
  'ui-native',
  'database',
].map(pkg)
const REACT_PACKAGES = ['react', 'react-dom', 'react-native']

const manifestPaths = git('ls-files', 'apps/*/package.json', 'packages/*/package.json').filter(
  (file) => file.split('/').length === 3,
)

const workspaces = new Map()
for (const path of manifestPaths) {
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  const deps = new Set()
  for (const field of DEP_FIELDS) {
    for (const name of Object.keys(manifest[field] ?? {})) deps.add(name)
  }
  workspaces.set(manifest.name, deps)
}

if (process.argv.includes('--graph')) {
  for (const [name, deps] of workspaces) {
    const internal = [...deps].filter((dep) => workspaces.has(dep)).sort()
    console.log(`${name} -> ${internal.length > 0 ? internal.join(', ') : '(tidak ada)'}`)
  }
}

const failures = []
const fail = (rule, message) => failures.push(`${rule}: ${message}`)
const depsOf = (name) => workspaces.get(name) ?? new Set()
const forbid = (rule, owner, forbidden) => {
  for (const dep of forbidden) {
    if (depsOf(owner).has(dep)) fail(rule, `${owner} tidak boleh bergantung pada ${dep}`)
  }
}

for (const name of [...APPS, ...RUNTIME]) {
  if (!workspaces.has(name)) fail('R0', `workspace tidak ditemukan: ${name}`)
}

for (const dep of depsOf(pkg('contracts'))) {
  if (dep.startsWith(SCOPE))
    fail('R1', `contracts tidak boleh bergantung pada package internal ${dep}`)
}

forbid('R2', pkg('design-tokens'), REACT_PACKAGES)

for (const ui of [pkg('ui-web'), pkg('ui-native')]) {
  forbid('R3', ui, [pkg('api-client'), pkg('database')])
}

forbid('R4', pkg('domain'), [pkg('ui-web'), pkg('ui-native'), pkg('api-client'), pkg('database')])
forbid('R5', 'api', [pkg('api-client'), pkg('ui-web'), pkg('ui-native')])

for (const [name, deps] of workspaces) {
  if (name !== 'api' && deps.has(pkg('database'))) {
    fail('R6', `${name} tidak boleh bergantung pada ${pkg('database')} (hanya api)`)
  }
}

for (const app of WEB_APPS) forbid('R7', app, [pkg('ui-native')])
for (const app of MOBILE_APPS) forbid('R7', app, [pkg('ui-web')])

if (failures.length > 0) {
  console.error('check-boundaries GAGAL:')
  for (const failure of failures) console.error(` - ${failure}`)
  process.exit(1)
}

console.log(`check-boundaries OK: ${workspaces.size} workspace, aturan R0-R7 terpenuhi.`)
