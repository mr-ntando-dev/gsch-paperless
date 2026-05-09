/**
 * Build-time source obfuscation script
 * Developer: devntando
 * Strips all comments from .js source files and replaces
 * readable local variable names with short mangled names
 * so the public repo is harder to reverse-engineer.
 *
 * Run: node scripts/obfuscate.js
 * (automatically called by npm run obfuscate before git push)
 */

const fs = require('fs')
const path = require('path')

const SRC = path.join(__dirname, '..', 'src')
const SKIP_DIRS = ['node_modules', '.next', '.git']

// Strip single-line and multi-line comments from JS/JSX
function stripComments(code) {
  // Remove block comments /* ... */
  code = code.replace(/\/\*[\s\S]*?\*\//g, '')
  // Remove single line comments // ... but NOT inside strings/URLs
  code = code.replace(/(?<!['":`])\/\/(?!.*['"`].*$).*/gm, '')
  return code
}

// Rename local variables in arrow function bodies to short names
// This is a lightweight pass — not full AST obfuscation
function mangleLocals(code) {
  const prefixMap = {
    'loading': '_l',
    'saving': '_s',
    'showForm': '_sf',
    'filterStatus': '_fs',
    'filterCare': '_fc',
    'selected': '_sel',
    'patients': '_pts',
    'admissions': '_adm',
    'observations': '_obs',
    'records': '_recs',
    'requests': '_reqs',
    'departments': '_dpts',
    'messages': '_msgs',
  }
  let result = code
  for (const [readable, mangled] of Object.entries(prefixMap)) {
    // Only mangle inside useState destructuring and local assignments
    result = result.replace(
      new RegExp(`\\bconst \\[${readable},`, 'g'),
      `const [${mangled},`
    )
    result = result.replace(
      new RegExp(`\\bset${readable[0].toUpperCase() + readable.slice(1)}\\b`, 'g'),
      `_set_${mangled.slice(1)}`
    )
  }
  return result
}

function processFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8')
  code = stripComments(code)
  // Only mangle non-API routes (keep API readable for debugging)
  if (!filePath.includes('/api/')) {
    code = mangleLocals(code)
  }
  fs.writeFileSync(filePath, code, 'utf8')
  console.log('Processed:', path.relative(SRC, filePath))
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (SKIP_DIRS.includes(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      processFile(full)
    }
  }
}

console.log('Starting obfuscation pass...')
walk(SRC)
console.log('Done. Source comments stripped and identifiers mangled.')
