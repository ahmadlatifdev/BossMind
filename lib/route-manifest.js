/**
 * BOSSMIND ROUTE MANIFEST — Single Source of Truth
 *
 * This manifest defines every approved route, its owner, and its locked
 * production state. No route may render outside this manifest.
 * Admin/testing environments must reference this manifest to prevent
 * rendering outdated or unauthorized interfaces.
 */

export const ROUTE_MANIFEST = {
  version: '1.0.0',
  lockedAt: '2026-05-12T18:54:00Z',
  project: 'Resumora',
  domain: 'resumora.net',

  routes: {
    '/':         { owner: 'resumora', type: 'public', page: 'pages/index.js',      layout: 'default', status: 'locked' },
    '/pricing':  { owner: 'resumora', type: 'public', page: 'pages/pricing.js',    layout: 'default', status: 'locked' },
    '/about':    { owner: 'resumora', type: 'public', page: 'pages/about.js',      layout: 'default', status: 'locked' },
    '/templates':{ owner: 'resumora', type: 'public', page: 'pages/templates.js',  layout: 'default', status: 'locked' },
    '/contact':  { owner: 'resumora', type: 'public', page: 'pages/contact.js',    layout: 'default', status: 'locked' },
    '/privacy':  { owner: 'resumora', type: 'public', page: 'pages/privacy.js',    layout: 'default', status: 'locked' },
    '/terms':    { owner: 'resumora', type: 'public', page: 'pages/terms.js',      layout: 'default', status: 'locked' },
    '/404':      { owner: 'resumora', type: 'public', page: 'pages/404.js',        layout: 'default', status: 'locked' },
    '/admin':    { owner: 'bossmind', type: 'admin',  page: 'pages/admin/index.js', layout: 'none',   status: 'locked' },
  },

  api: {
    '/api/checkout': { owner: 'resumora', method: 'POST', status: 'locked' },
  },

  protection: {
    productionUILock: true,
    antiRegressionProtection: true,
    antiOldLayoutRendering: true,
    routeOwnershipEnforcement: true,
    snapshotVerificationBeforeDeploy: true,
  },

  snapshot: {
    hash: null,
    timestamp: '2026-05-12T18:54:00Z',
    verifiedRoutes: 9,
    verifiedComponents: 7,
    verifiedStyles: 8,
  },
};

export const PUBLIC_ROUTES = Object.entries(ROUTE_MANIFEST.routes)
  .filter(([, r]) => r.type === 'public')
  .map(([path]) => path);

export const ADMIN_ROUTES = Object.entries(ROUTE_MANIFEST.routes)
  .filter(([, r]) => r.type === 'admin')
  .map(([path]) => path);

export function validateRoute(pathname) {
  const route = ROUTE_MANIFEST.routes[pathname];
  if (!route) return { valid: false, reason: 'Route not in manifest' };
  if (route.status !== 'locked') return { valid: false, reason: 'Route not locked' };
  return { valid: true, route };
}

export function getRouteOwner(pathname) {
  return ROUTE_MANIFEST.routes[pathname]?.owner || null;
}
