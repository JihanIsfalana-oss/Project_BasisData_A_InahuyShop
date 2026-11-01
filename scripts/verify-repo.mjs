import { execFileSync } from 'node:child_process'

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).split('\n').filter(Boolean)

const tracked = git('ls-files')
const failures = []

const trackedNodeModules = tracked.filter((file) => file.split('/').includes('node_modules'))
if (trackedNodeModules.length > 0) {
  failures.push(`node_modules ter-track (${trackedNodeModules.length} file)`)
}

const lockfileNames = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
const strayLockfiles = tracked.filter((file) => {
  const name = file.split('/').pop()
  return lockfileNames.includes(name) && file !== 'pnpm-lock.yaml'
})
if (strayLockfiles.length > 0) {
  failures.push(`lockfile selain root ditemukan: ${strayLockfiles.join(', ')}`)
}

const trackedEnv = tracked.filter((file) => {
  const name = file.split('/').pop()
  return name.startsWith('.env') && !name.endsWith('.example')
})
if (trackedEnv.length > 0) {
  failures.push(`file environment ter-track: ${trackedEnv.join(', ')}`)
}

if (failures.length > 0) {
  console.error('verify-repo GAGAL:')
  for (const failure of failures) console.error(` - ${failure}`)
  process.exit(1)
}

console.log('verify-repo OK: tidak ada node_modules, lockfile liar, atau .env yang ter-track.')
