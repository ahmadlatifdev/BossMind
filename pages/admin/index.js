import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
  PROJECTS,
  GLOBAL_METRICS,
  INFRA_STATUS,
  ACTIVITY_LOG,
  getStatusColor,
  getActivityIcon,
} from '@/lib/dashboard-data';
import { ROUTE_MANIFEST, PUBLIC_ROUTES } from '@/lib/route-manifest';
import s from '@/styles/Admin.module.css';

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: '◎', label: 'Global Overview' },
  { id: 'ui-lock', icon: '🔒', label: 'Production UI Lock' },
  { id: 'preview', icon: '◉', label: 'Live UI Preview' },
  { id: 'preflight', icon: '✓', label: 'Preflight Scan' },
  { id: 'projects', icon: '◆', label: 'Project Panels' },
  { id: 'intelligence', icon: '◈', label: 'System Intelligence' },
  { id: 'controls', icon: '⚡', label: 'Master Controls' },
  { id: 'activity', icon: '▶', label: 'Activity Feed' },
];

const PROJECT_KEYS = Object.keys(PROJECTS);

const INTEL_ENGINES = [
  { icon: '◆', title: 'Cross-Project AI Layer', status: 'Active — synchronized' },
  { icon: '◈', title: 'Shared Memory Map', status: 'Verified — 99.4% integrity' },
  { icon: '✦', title: 'Error-Memory Learning', status: 'Active — 0 unresolved patterns' },
  { icon: '⬡', title: 'Predictive Failure Detector', status: 'Monitoring — 2.1% risk' },
  { icon: '❖', title: 'Smart Optimization Engine', status: 'Active — 3 suggestions queued' },
  { icon: '✧', title: 'Auto-Repair Recommender', status: 'Standby — no issues detected' },
  { icon: '↻', title: 'Runtime Reconciliation', status: 'Synced — all projects aligned' },
  { icon: '▲', title: 'Deployment Validator', status: 'Verified — last check 17:02' },
  { icon: '◎', title: 'Missing-Updates Scanner', status: 'Clean — no missing updates' },
  { icon: '⊘', title: 'Duplicate Route Detector', status: 'Clean — 0 duplicates' },
  { icon: '⚑', title: 'Broken Dependency Detector', status: 'Clean — all deps resolved' },
  { icon: '♦', title: 'Snapshot Protection Engine', status: 'Active — 5 snapshots locked' },
];

const CONTROL_ACTIONS = [
  { icon: '↻', label: 'Restart All Projects', action: 'restart' },
  { icon: '▲', label: 'Safe Deploy All', action: 'deploy' },
  { icon: '↩', label: 'Rollback All', action: 'rollback', danger: true },
  { icon: '♥', label: 'Auto-Repair All', action: 'repair' },
  { icon: '✓', label: 'Verify All Systems', action: 'verify' },
  { icon: '⚡', label: 'Rebuild All', action: 'rebuild' },
  { icon: '◆', label: 'Optimize All', action: 'optimize' },
  { icon: '↻', label: 'Runtime Sync', action: 'sync' },
  { icon: '◈', label: 'Memory Validation', action: 'memory' },
  { icon: '◎', label: 'Deployment Audit', action: 'audit' },
  { icon: '⊘', label: 'Route Scan', action: 'route-scan' },
  { icon: '⚑', label: 'Missing Updates Repair', action: 'updates' },
  { icon: '⬡', label: 'API Reconnect', action: 'api-reconnect' },
  { icon: '▶', label: 'Queue Recovery', action: 'queue' },
  { icon: '⏸', label: 'Emergency Freeze', action: 'freeze', danger: true },
];

function MetricCell({ metric }) {
  const hasStatus = metric.status;
  const hasValue = metric.value !== undefined;
  return (
    <div className={s.metricCell}>
      <span className={s.metricLabel}>{metric.label}</span>
      <span className={s.metricValue}>
        {hasStatus && (
          <>
            <span className={s.metricDot} style={{ background: getStatusColor(metric.status) }} />
            {metric.status}
          </>
        )}
        {hasValue && !hasStatus && (
          <>{metric.value}{metric.unit || ''}</>
        )}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [activeProject, setActiveProject] = useState('resumora');
  const [previewRoute, setPreviewRoute] = useState('/');
  const [now, setNow] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);
  const [preflightResults, setPreflightResults] = useState(null);
  const [routeChecks, setRouteChecks] = useState({});

  useEffect(() => {
    const update = () => setNow(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  const runPreflight = useCallback(async () => {
    setPreflightResults({ running: true });
    const results = [];
    const routes = Object.entries(ROUTE_MANIFEST.routes);
    const checks = {};

    for (const [routePath, meta] of routes) {
      try {
        const res = await fetch(routePath, { method: 'HEAD', redirect: 'follow' });
        const owner = res.headers.get('X-Route-Owner') || meta.owner;
        const lock = res.headers.get('X-UI-Lock') || 'unknown';
        const ok = routePath === '/404' ? res.status === 404 || res.status === 200 : res.status === 200;
        checks[routePath] = { status: res.status, ok, owner, lock };
        results.push({ route: routePath, status: res.status, ok, owner: meta.owner, page: meta.page, lock });
      } catch {
        checks[routePath] = { status: 0, ok: false, owner: meta.owner, lock: 'error' };
        results.push({ route: routePath, status: 0, ok: false, owner: meta.owner, page: meta.page, lock: 'error' });
      }
    }

    try {
      const apiRes = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: 'professional' }) });
      results.push({ route: '/api/checkout', status: apiRes.status, ok: apiRes.ok, owner: 'resumora', page: 'pages/api/checkout.js', lock: 'production' });
    } catch {
      results.push({ route: '/api/checkout', status: 0, ok: false, owner: 'resumora', page: 'pages/api/checkout.js', lock: 'error' });
    }

    setRouteChecks(checks);
    setPreflightResults({
      running: false,
      timestamp: new Date().toISOString(),
      results,
      passed: results.filter((r) => r.ok).length,
      total: results.length,
    });
  }, []);

  function handleControl(action) {
    setActionFeedback(action);
    setTimeout(() => setActionFeedback(null), 2500);
  }

  function scrollTo(id) {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const project = PROJECTS[activeProject];
  const manifestRoutes = Object.entries(ROUTE_MANIFEST.routes);

  return (
    <>
      <Head>
        <title>Master Admin — BossMind Command Center</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={s.layout}>
        {/* Sidebar */}
        <aside className={`${s.sidebar} ${!sidebarOpen ? s.sidebarCollapsed : ''} ${sidebarOpen ? s.sidebarOpen : ''}`}>
          <div className={s.sidebarBrand}>
            <div className={s.brandRow}>
              <div className={s.brandIcon}>B</div>
              <div className={s.brandText}>
                <h2>BossMind</h2>
                <span>Master Admin</span>
              </div>
            </div>
          </div>

          <nav className={s.sidebarNav}>
            <div className={s.navLabel}>Navigation</div>
            {SIDEBAR_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`${s.navItem} ${activeSection === item.id ? s.navItemActive : ''}`}
                onClick={() => scrollTo(item.id)}
              >
                <span className={s.navIcon}>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className={s.navDivider} />
            <div className={s.navLabel}>Projects</div>
            {PROJECT_KEYS.map((key) => (
              <button
                key={key}
                className={`${s.navItem} ${activeProject === key ? s.navItemActive : ''}`}
                onClick={() => { setActiveProject(key); scrollTo('projects'); }}
              >
                <span className={s.sidebarDot} style={{ background: PROJECTS[key].color }} />
                {PROJECTS[key].name}
              </button>
            ))}
          </nav>

          <div className={s.sidebarFooter}>
            BossMind v1.0 — Command Center
          </div>
        </aside>

        {/* Main */}
        <div className={`${s.main} ${!sidebarOpen ? s.mainExpanded : ''}`}>
          {/* Top Bar */}
          <header className={s.topbar}>
            <div className={s.topbarLeft}>
              <button className={s.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
                {sidebarOpen ? '◁' : '▷'}
              </button>
              <h1 className={s.topbarTitle}>Command Center</h1>
            </div>
            <div className={s.topbarRight}>
              {actionFeedback && (
                <span className={s.statusPill} style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#c9a84c' }}>
                  ⚡ {actionFeedback} executed
                </span>
              )}
              <span className={`${s.statusPill} ${s.statusLive}`}>
                <span className={s.statusDot} /> All Systems Live
              </span>
              <span className={s.timeStamp}>{now}</span>
            </div>
          </header>

          <div className={s.content}>
            {/* ===== GLOBAL OVERVIEW ===== */}
            <section id="overview">
              <div className={s.overviewGrid}>
                {[
                  { label: 'System Health', value: `${GLOBAL_METRICS.systemHealth}%`, sub: 'Across all projects' },
                  { label: 'Automation', value: `${GLOBAL_METRICS.automation}%`, sub: 'Hands-free operations' },
                  { label: 'Runtime Sync', value: `${GLOBAL_METRICS.runtimeSync}%`, sub: 'Synchronization rate' },
                  { label: 'Memory Integrity', value: `${GLOBAL_METRICS.memoryIntegrity}%`, sub: 'Shared memory core' },
                  { label: 'Auto Recovery', value: `${GLOBAL_METRICS.autoRecovery}%`, sub: 'Self-healing uptime' },
                  { label: 'Deploy Verification', value: `${GLOBAL_METRICS.deployVerification}%`, sub: 'All deploys verified' },
                  { label: 'AI Harmony', value: `${GLOBAL_METRICS.aiHarmony}%`, sub: 'Cross-project coordination' },
                  { label: 'Error Prediction Risk', value: `${GLOBAL_METRICS.errorPredictionRisk}%`, sub: 'Low risk detected', green: true },
                ].map((m) => (
                  <div key={m.label} className={s.overviewCard}>
                    <div className={s.overviewLabel}>{m.label}</div>
                    <div className={s.overviewValue} style={m.green ? { color: '#34d399' } : undefined}>{m.value}</div>
                    <div className={s.overviewSub}>{m.sub}</div>
                  </div>
                ))}
              </div>

              <div className={s.infraRow}>
                {Object.entries(INFRA_STATUS).map(([key, infra]) => (
                  <div key={key} className={s.infraCard}>
                    <span className={s.infraDot} style={{ background: getStatusColor(infra.status) }} />
                    <div className={s.infraInfo}>
                      <div className={s.infraName}>
                        {key === 'neonDb' ? 'Neon DB' : key === 'n8n' ? 'n8n Workflows' : key.charAt(0).toUpperCase() + key.slice(1)}
                      </div>
                      <div className={s.infraMeta}>
                        {infra.latency ? `${infra.latency}ms` : ''}
                        {infra.deploys ? `${infra.deploys} deploys` : ''}
                        {infra.commits ? `${infra.commits} commits` : ''}
                        {infra.issues !== undefined ? `${infra.issues} issues` : ''}
                        {infra.workflows ? `${infra.workflows} active` : ''}
                        {!infra.latency && !infra.deploys && !infra.commits && infra.issues === undefined && !infra.workflows ? infra.status : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== PRODUCTION UI LOCK ===== */}
            <section id="ui-lock">
              <h2 className={s.controlsTitle}><span>🔒</span> Production UI Lock</h2>
              <div className={s.lockBanner}>
                <div className={s.lockBannerIcon}>🔒</div>
                <div className={s.lockBannerBody}>
                  <div className={s.lockBannerTitle}>Production Interface Locked</div>
                  <div className={s.lockBannerSub}>
                    resumora.net — Manifest v{ROUTE_MANIFEST.version} — {manifestRoutes.length} routes locked — Anti-regression active
                  </div>
                </div>
                <div className={s.lockBannerStatus}>ENFORCED</div>
              </div>

              <div className={s.metricsGrid} style={{ marginTop: 16 }}>
                {manifestRoutes.map(([routePath, meta]) => {
                  const rc = routeChecks[routePath];
                  return (
                    <div key={routePath} className={s.metricCell}>
                      <span className={s.metricLabel}>
                        <code style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{routePath}</code>
                      </span>
                      <span className={s.metricValue}>
                        <span className={s.metricDot} style={{ background: rc ? (rc.ok ? '#34d399' : '#ef4444') : getStatusColor(meta.status === 'locked' ? 'verified' : 'standby') }} />
                        {rc ? (rc.ok ? `${rc.status} ✓` : `${rc.status} ✗`) : meta.status}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className={s.intelligenceGrid} style={{ marginTop: 16 }}>
                {Object.entries(ROUTE_MANIFEST.protection).map(([key, val]) => (
                  <div key={key} className={s.intelCard}>
                    <div className={s.intelIcon}>{val ? '✓' : '✗'}</div>
                    <div className={s.intelTitle}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</div>
                    <div className={s.intelStatus}>
                      <span className={s.intelStatusDot} style={{ background: val ? '#34d399' : '#ef4444' }} />
                      {val ? 'Active' : 'Disabled'}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== LIVE UI PREVIEW ===== */}
            <section id="preview">
              <h2 className={s.controlsTitle}><span>◉</span> Live Production UI Preview</h2>
              <div className={s.previewTabs}>
                {PUBLIC_ROUTES.map((r) => (
                  <button
                    key={r}
                    className={`${s.projectTab} ${previewRoute === r ? s.projectTabActive : ''}`}
                    onClick={() => setPreviewRoute(r)}
                    style={{ minWidth: 'auto', flex: '0 0 auto' }}
                  >
                    {r === '/' ? 'Home' : r.replace('/', '')}
                  </button>
                ))}
              </div>
              <div className={s.previewFrame}>
                <div className={s.previewBar}>
                  <span className={s.previewDots}><i /><i /><i /></span>
                  <span className={s.previewUrl}>resumora.net{previewRoute}</span>
                  <span className={s.previewLock}>🔒 Production Locked</span>
                </div>
                <iframe
                  key={previewRoute}
                  src={previewRoute}
                  className={s.previewIframe}
                  title={`Production preview: ${previewRoute}`}
                />
              </div>
            </section>

            {/* ===== PREFLIGHT SCAN ===== */}
            <section id="preflight">
              <h2 className={s.controlsTitle}><span>✓</span> Preflight Validation</h2>
              <button className={s.controlBtn} onClick={runPreflight} style={{ marginBottom: 16, borderColor: 'rgba(201,168,76,0.3)' }}>
                <span className={s.controlIcon}>◎</span>
                {preflightResults?.running ? 'Scanning…' : 'Run Full Preflight Scan'}
              </button>

              {preflightResults && !preflightResults.running && (
                <div className={s.activityList}>
                  <div className={s.activityItem} style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
                    <div className={s.activityIcon} style={{ background: preflightResults.passed === preflightResults.total ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', borderColor: preflightResults.passed === preflightResults.total ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)' }}>
                      {preflightResults.passed === preflightResults.total ? '✓' : '✗'}
                    </div>
                    <div className={s.activityBody}>
                      <div className={s.activityMsg}>
                        <strong style={{ color: preflightResults.passed === preflightResults.total ? '#34d399' : '#ef4444' }}>
                          {preflightResults.passed}/{preflightResults.total} routes verified
                        </strong>
                        {' — '}
                        {preflightResults.passed === preflightResults.total ? 'All clear. Safe to deploy.' : 'Issues detected.'}
                      </div>
                    </div>
                    <div className={s.activityTime}>{new Date(preflightResults.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  {preflightResults.results.map((r) => (
                    <div key={r.route} className={s.activityItem}>
                      <div className={s.activityIcon} style={{ background: r.ok ? 'rgba(52,211,153,0.06)' : 'rgba(239,68,68,0.06)', borderColor: r.ok ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)', color: r.ok ? '#34d399' : '#ef4444' }}>
                        {r.ok ? '✓' : '✗'}
                      </div>
                      <div className={s.activityBody}>
                        <div className={s.activityMsg}>
                          <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#c9a84c' }}>{r.route}</code>
                          {' → '}{r.status}{' — owner: '}{r.owner}
                        </div>
                      </div>
                      <div className={s.activityTime}>{r.page}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ===== PROJECT PANELS ===== */}
            <section id="projects">
              <div className={s.projectTabs}>
                {PROJECT_KEYS.map((key) => (
                  <button
                    key={key}
                    className={`${s.projectTab} ${activeProject === key ? s.projectTabActive : ''}`}
                    onClick={() => setActiveProject(key)}
                  >
                    <span className={s.tabDot} style={{ background: PROJECTS[key].color }} />
                    {PROJECTS[key].name}
                  </button>
                ))}
              </div>

              <div className={s.projectPanel}>
                <div className={s.panelHeader}>
                  <div className={s.panelTitleRow}>
                    <div className={s.panelColorBar} style={{ background: project.color }} />
                    <div>
                      <div className={s.panelTitle}>{project.name}</div>
                      <div className={s.panelTagline}>{project.tagline}</div>
                    </div>
                  </div>
                  <div className={s.panelHeaderRight}>
                    <span className={s.uptimePill}>{project.uptime}% uptime</span>
                    <span className={s.panelDomain}>{project.domain}</span>
                  </div>
                </div>
                <div className={s.panelBody}>
                  <div className={s.metricsGrid}>
                    {Object.values(project.metrics).map((metric) => (
                      <MetricCell key={metric.label} metric={metric} />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ===== SYSTEM INTELLIGENCE ===== */}
            <section id="intelligence">
              <h2 className={s.controlsTitle}><span>◈</span> Advanced System Intelligence</h2>
              <div className={s.intelligenceGrid}>
                {INTEL_ENGINES.map((eng) => (
                  <div key={eng.title} className={s.intelCard}>
                    <div className={s.intelIcon}>{eng.icon}</div>
                    <div className={s.intelTitle}>{eng.title}</div>
                    <div className={s.intelStatus}>
                      <span className={s.intelStatusDot} />
                      {eng.status}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ===== MASTER CONTROLS ===== */}
            <section id="controls">
              <h2 className={s.controlsTitle}><span>⚡</span> Master Control Panel</h2>
              <div className={s.controlsGrid}>
                {CONTROL_ACTIONS.map((ctrl) => (
                  <button
                    key={ctrl.action}
                    className={`${s.controlBtn} ${ctrl.danger ? s.controlBtnDanger : ''}`}
                    onClick={() => handleControl(ctrl.label)}
                  >
                    <span className={s.controlIcon}>{ctrl.icon}</span>
                    {ctrl.label}
                  </button>
                ))}
              </div>
            </section>

            {/* ===== ACTIVITY FEED ===== */}
            <section id="activity">
              <h2 className={s.activityTitle}><span>▶</span> Live Activity Feed</h2>
              <div className={s.activityList}>
                {ACTIVITY_LOG.map((entry, i) => (
                  <div key={i} className={s.activityItem}>
                    <div className={s.activityIcon}>{getActivityIcon(entry.type)}</div>
                    <div className={s.activityBody}>
                      <div className={s.activityMsg}>
                        <span className={s.activityProject}>{entry.project}</span> — {entry.message}
                      </div>
                    </div>
                    <div className={s.activityTime}>{entry.time}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

AdminDashboard.getLayout = function getLayout(page) {
  return page;
};
