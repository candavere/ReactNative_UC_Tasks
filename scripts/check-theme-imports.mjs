/**
 * A cheap static check that catches the most likely mistake in this project:
 * using a theme value (colors, spacing, fontSizes) in a file that never
 * imported it.
 *
 * This is not a full linter. It exists because that exact mistake - styles that
 * reference `spacing.md` in a file that forgot to import `spacing` - compiles
 * and bundles fine, and only crashes when the module is actually loaded at
 * runtime.
 *
 *   node scripts/check-theme-imports.mjs
 *
 * Exits non-zero if any file uses a theme value without importing it.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const THEME_VALUES = ['colors', 'spacing', 'fontSizes'];

// Every .js file in the project except this script and the node_modules.
function collectFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git' || entry === '.expo' || entry === 'dist') {
      continue;
    }
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      found.push(...collectFiles(full));
    } else if (entry.endsWith('.js')) {
      found.push(full);
    }
  }
  return found;
}

const files = collectFiles(ROOT);
let problems = 0;

console.log(`\nChecking ${files.length} files for missing theme imports...`);

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const name = relative(ROOT, file);

  // Does this file import from theme.js at all, and what did it take?
  const themeImport = source.match(/import\s*\{([^}]*)\}\s*from\s*'[^']*theme'/);

  for (const value of THEME_VALUES) {
    // Only count real usage in code, not the word appearing in a comment.
    const usesIt = new RegExp(`\\b${value}\\s*\\.`).test(
      source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''),
    );
    if (!usesIt) continue;

    const imported = themeImport && themeImport[1].split(',').some((n) => n.trim() === value);
    if (!imported) {
      problems++;
      console.log(`  FAIL  ${name} uses ${value}. but does not import it from theme.js`);
    }
  }
}

if (problems === 0) {
  console.log('  all theme values are properly imported\n');
} else {
  console.log(`\n${problems} problem(s) found\n`);
}

process.exit(problems ? 1 : 0);
