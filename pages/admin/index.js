import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  PROJECTS,
  GLOBAL_METRICS,
  INFRA_STATUS,
  ACTIVITY_LOG,
  getStatusColor,
  getActivityIcon,
} from '@/lib/dashboard-data';
import s from '@/styles/Admin.module.css';

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: '◎', label: 'Global Overview' },
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

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return '--:--'; }
}

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
  const [now, setNow] = useState('');
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    const update = () => setNow(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
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
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>System Health</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.systemHealth}%</div>
                  <div className={s.overviewSub}>Across all projects</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>Automation</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.automation}%</div>
                  <div className={s.overviewSub}>Hands-free operations</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>Runtime Sync</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.runtimeSync}%</div>
                  <div className={s.overviewSub}>Synchronization rate</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>Memory Integrity</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.memoryIntegrity}%</div>
                  <div className={s.overviewSub}>Shared memory core</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>Auto Recovery</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.autoRecovery}%</div>
                  <div className={s.overviewSub}>Self-healing uptime</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>Deploy Verification</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.deployVerification}%</div>
                  <div className={s.overviewSub}>All deploys verified</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>AI Harmony</div>
                  <div className={s.overviewValue}>{GLOBAL_METRICS.aiHarmony}%</div>
                  <div className={s.overviewSub}>Cross-project coordination</div>
                </div>
                <div className={s.overviewCard}>
                  <div className={s.overviewLabel}>Error Prediction Risk</div>
                  <div className={s.overviewValue} style={{ color: '#34d399' }}>{GLOBAL_METRICS.errorPredictionRisk}%</div>
                  <div className={s.overviewSub}>Low risk detected</div>
                </div>
              </div>

              {/* Infrastructure Status */}
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
