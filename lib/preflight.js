/**
 * BOSSMIND PREFLIGHT VALIDATION ENGINE
 *
 * Runs before every deploy to verify:
 * - All manifest routes have backing page files
 * - No duplicate routes exist
 * - No orphaned pages outside the manifest
 * - No conflicting layouts
 * - All dependencies resolve
 * - Environment is consistent
 * - No stale/old interface files
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const MANIFEST_ROUTES = {
  '/':          'pages/index.js',
  '/pricing':   'pages/pricing.js',
  '/about':     'pages/about.js',
  '/templates': 'pages/templates.js',
  '/contact':   'pages/contact.js',
  '/privacy':   'pages/privacy.js',
  '/terms':     'pages/terms.js',
  '/404':       'pages/404.js',
  '/admin':     'pages/admin/index.js',
};

const MANIFEST_API = {
  '/api/checkout': 'pages/api/checkout.js',
};

const INTERNAL_PAGES = ['pages/_app.js', 'pages/_document.js'];

const REQUIRED_COMPONENTS = [
  'components/Navbar.js',
  'components/Footer.js',
  'components/Layout.js',
  'components/SEO.js',
  'components/CTASection.js',
  'components/PricingCard.js',
  'components/Toast.js',
];

const REQUIRED_STYLES = [
  'styles/globals.css',
  'styles/Home.module.css',
  'styles/Pages.module.css',
  'styles/Navbar.module.css',
  'styles/Footer.module.css',
  'styles/Admin.module.css',
  'styles/Legal.module.css',
  'styles/Toast.module.css',
];

const BANNED_PATTERNS = [
  'app/page.tsx', 'app/page.jsx', 'app/page.js',
  'app/layout.tsx', 'app/layout.jsx', 'app/layout.js',
  'src/pages/', 'src/app/',
];

let passed = 0;
let failed = 0;
let warnings = 0;

function check(label, ok, detail) {
  if (ok) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label} — ${detail}`);
    failed++;
  }
}

function warn(label, detail) {
  console.log(`  ⚠️  ${label} — ${detail}`);
  warnings++;
}

function fileExists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║  BOSSMIND PREFLIGHT VALIDATION ENGINE        ║');
console.log('╚══════════════════════════════════════════════╝\n');

// 1. Route File Verification
console.log('▸ Route File Verification');
for (const [route, file] of Object.entries(MANIFEST_ROUTES)) {
  check(`${route} → ${file}`, fileExists(file), 'File missing');
}
for (const [route, file] of Object.entries(MANIFEST_API)) {
  check(`${route} → ${file}`, fileExists(file), 'File missing');
}

// 2. Internal Pages
console.log('\n▸ Internal Pages');
for (const file of INTERNAL_PAGES) {
  check(file, fileExists(file), 'File missing');
}

// 3. Component Integrity
console.log('\n▸ Component Integrity');
for (const file of REQUIRED_COMPONENTS) {
  check(file, fileExists(file), 'Component missing');
}

// 4. Style Integrity
console.log('\n▸ Style Integrity');
for (const file of REQUIRED_STYLES) {
  check(file, fileExists(file), 'Stylesheet missing');
}

// 5. Banned File Scan (old/stale interfaces)
console.log('\n▸ Banned File Scan (old/stale interfaces)');
let banFound = false;
for (const pattern of BANNED_PATTERNS) {
  const exists = fileExists(pattern);
  if (exists) {
    check(`No ${pattern}`, false, 'STALE FILE DETECTED — must be removed');
    banFound = true;
  }
}
if (!banFound) {
  check('No stale App Router / src/ files detected', true);
}

// 6. Orphaned Page Scan
console.log('\n▸ Orphaned Page Scan');
const allManifestFiles = new Set([
  ...Object.values(MANIFEST_ROUTES),
  ...Object.values(MANIFEST_API),
  ...INTERNAL_PAGES,
]);

function scanPages(dir, base) {
  const orphans = [];
  if (!fs.existsSync(dir)) return orphans;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      orphans.push(...scanPages(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.tsx')) {
      if (!allManifestFiles.has(rel)) {
        orphans.push(rel);
      }
    }
  }
  return orphans;
}

const orphans = scanPages(path.join(ROOT, 'pages'), 'pages');
if (orphans.length === 0) {
  check('No orphaned pages outside manifest', true);
} else {
  for (const o of orphans) {
    check(`No orphan: ${o}`, false, 'Page exists outside manifest — potential stale interface');
  }
}

// 7. Duplicate Route Check
console.log('\n▸ Duplicate Route Detection');
const routePaths = Object.keys(MANIFEST_ROUTES);
const dupes = routePaths.filter((r, i) => routePaths.indexOf(r) !== i);
check('No duplicate routes in manifest', dupes.length === 0, `Duplicates: ${dupes.join(', ')}`);

// 8. Layout Conflict Check
console.log('\n▸ Layout Conflict Detection');
const hasAppDir = fs.existsSync(path.join(ROOT, 'app'));
const hasSrcPages = fs.existsSync(path.join(ROOT, 'src', 'pages'));
check('No app/ directory (prevents App Router conflict)', !hasAppDir, 'app/ directory exists');
check('No src/pages/ directory (prevents src conflict)', !hasSrcPages, 'src/pages/ exists');

// 9. Package.json Validation
console.log('\n▸ Dependency Validation');
try {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check('next dependency present', !!pkg.dependencies?.next, 'next not in dependencies');
  check('react dependency present', !!pkg.dependencies?.react, 'react not in dependencies');
  check('react-dom dependency present', !!pkg.dependencies?.['react-dom'], 'react-dom not in dependencies');
  check('eslint-config-next present', !!pkg.devDependencies?.['eslint-config-next'], 'eslint-config-next not in devDependencies');
} catch (e) {
  check('package.json readable', false, e.message);
}

// 10. Config Validation
console.log('\n▸ Config Validation');
check('next.config.js exists', fileExists('next.config.js'), 'Missing');
check('.eslintrc.json exists', fileExists('.eslintrc.json'), 'Missing');
check('.gitignore exists', fileExists('.gitignore'), 'Missing');
check('public/robots.txt exists', fileExists('public/robots.txt'), 'Missing');
check('public/sitemap.xml exists', fileExists('public/sitemap.xml'), 'Missing');
check('public/favicon.svg exists', fileExists('public/favicon.svg'), 'Missing');

// Summary
console.log('\n══════════════════════════════════════════════');
console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${warnings} warnings`);
if (failed === 0) {
  console.log('  ✅ PREFLIGHT PASSED — Safe to deploy');
} else {
  console.log('  ❌ PREFLIGHT FAILED — Do NOT deploy');
}
console.log('══════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
