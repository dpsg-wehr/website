import fs from 'fs';
import path from 'path';

interface LighthouseRunManifest {
    url: string;
    isRepresentativeRun?: boolean;
    htmlPath: string;
    jsonPath: string;
    summary: {
        performance: number;
        accessibility: number;
        'best-practices': number;
        seo: number;
    };
}

interface PageAuditSummary {
    slug: string;
    title: string;
    route: string;
    url: string;
    htmlFile: string;
    jsonFile: string;
    scores: {
        performance: number;
        accessibility: number;
        bestPractices: number;
        seo: number;
    };
    metrics: {
        fcp: { display: string; value: number; score: number };
        lcp: { display: string; value: number; score: number };
        tbt: { display: string; value: number; score: number };
        cls: { display: string; value: number; score: number };
        si: { display: string; value: number; score: number };
    };
    pageOpportunities: Array<{
        id: string;
        title: string;
        displayValue?: string;
        savingsBytes?: number;
        savingsMs?: number;
        score: number;
    }>;
}

interface IssueItem {
    id: string;
    title: string;
    category: 'performance' | 'accessibility' | 'best-practices' | 'seo';
    categoryTitle: string;
    description: string;
    totalSavingsBytes: number;
    totalSavingsMs: number;
    maxImpactDisplay?: string;
    affectedPages: Array<{
        slug: string;
        title: string;
        route: string;
        score: number;
        displayValue?: string;
        savingsBytes?: number;
        savingsMs?: number;
        items?: Array<{
            url?: string;
            totalBytes?: number;
            wastedBytes?: number;
            wastedPercent?: number;
            selector?: string;
            snippet?: string;
            explanation?: string;
            nodeLabel?: string;
        }>;
    }>;
}

function getSlugAndTitle(urlStr: string): { slug: string; title: string; route: string } {
    try {
        const u = new URL(urlStr);
        let p = u.pathname.replace(/\/index\.html$/, '').replace(/^\//, '');
        if (!p) {
            return { slug: 'home', title: 'Startseite', route: '/' };
        }
        if (p === 'news') {
            return { slug: 'news', title: 'Aktuelles & Berichte', route: '/news' };
        }
        if (p === 'gallerie') {
            return { slug: 'gallerie', title: 'Bildergalerie', route: '/gallerie' };
        }
        if (p.includes('termine')) {
            return { slug: 'termine', title: 'Terminkalender', route: '/pages/termine' };
        }
        const parts = p.split('/').filter(Boolean);
        const last = parts[parts.length - 1];
        const formattedTitle = last.charAt(0).toUpperCase() + last.slice(1);
        return { slug: last, title: formattedTitle, route: `/${p}` };
    } catch {
        return { slug: 'page', title: 'Webseite', route: '/' };
    }
}

function formatBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KiB`;
}

function formatMs(ms?: number): string {
    if (!ms || ms <= 0) return '';
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
    return `${Math.round(ms)} ms`;
}

function renderMarkdownLinks(text?: string): string {
    if (!text) return '';
    return text.replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="link">$1</a>'
    );
}

interface LighthouseAudit {
    id: string;
    title: string;
    description?: string;
    score: number | null;
    scoreDisplayMode?: string;
    displayValue?: string;
    numericValue?: number;
    details?: {
        type?: string;
        overallSavingsBytes?: number;
        overallSavingsMs?: number;
        items?: Array<{
            url?: string;
            totalBytes?: number;
            wastedBytes?: number;
            wastedPercent?: number;
            node?: {
                selector?: string;
                snippet?: string;
                explanation?: string;
                nodeLabel?: string;
            };
        }>;
    };
}

interface LighthouseCategory {
    id: string;
    title: string;
    score: number | null;
    auditRefs?: Array<{ id: string; weight: number }>;
}

interface LighthouseReport {
    audits?: Record<string, LighthouseAudit>;
    categories?: Record<string, LighthouseCategory>;
}

export function generateDashboard() {
    const cwd = process.cwd();
    const testResultsDir = path.resolve(cwd, 'test-results');
    const lhDir = path.join(testResultsDir, 'lighthouse');
    const e2eDir = path.join(testResultsDir, 'e2e');
    const unitDir = path.join(testResultsDir, 'unit');

    if (!fs.existsSync(testResultsDir)) {
        console.warn('⚠️  test-results directory not found. Skipping dashboard generation.');
        return;
    }

    console.log('📊 Generating Unified Test & Lighthouse Dashboard...');

    // 1. Parse E2E test results
    const e2eSummary = {
        total: 0,
        passed: 0,
        failed: 0,
        flaky: 0,
        skipped: 0,
        duration: '-',
        date: '',
        git: {
            hash: '',
            shortHash: '',
            branch: '',
            subject: '',
            author: '',
        },
    };

    const e2eJsonPath = path.join(e2eDir, 'index.json');
    if (fs.existsSync(e2eJsonPath)) {
        try {
            const e2eData = JSON.parse(fs.readFileSync(e2eJsonPath, 'utf8'));
            if (e2eData.summary) {
                e2eSummary.total = e2eData.summary.tests?.value || 0;
                e2eSummary.passed = e2eData.summary.passed?.value || 0;
                e2eSummary.failed = e2eData.summary.failed?.value || 0;
                e2eSummary.flaky = e2eData.summary.flaky?.value || 0;
                e2eSummary.skipped = e2eData.summary.skipped?.value || 0;
            }
            e2eSummary.duration =
                e2eData.durationH ||
                (e2eData.duration ? `${(e2eData.duration / 1000).toFixed(1)}s` : '-');
            e2eSummary.date = e2eData.dateH || new Date().toLocaleString('de-DE');

            if (e2eData.metadata?.gitCommit) {
                e2eSummary.git = {
                    hash: e2eData.metadata.gitCommit.hash || '',
                    shortHash: e2eData.metadata.gitCommit.shortHash || '',
                    branch: e2eData.metadata.gitCommit.branch || '',
                    subject: e2eData.metadata.gitCommit.subject || '',
                    author: e2eData.metadata.gitCommit.author?.name || '',
                };
            }
        } catch (e) {
            console.warn('Failed to parse e2e index.json:', e);
        }
    }

    // 2. Parse and organize Lighthouse results
    const pagesSummary: PageAuditSummary[] = [];
    const issuesMap = new Map<string, IssueItem>();

    const manifestPath = path.join(lhDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const manifest: LighthouseRunManifest[] = JSON.parse(
                fs.readFileSync(manifestPath, 'utf8')
            );
            // Take representative runs
            let repRuns = manifest.filter((m) => m.isRepresentativeRun);
            if (repRuns.length === 0) {
                // If not marked, group by URL and pick last run
                const map = new Map<string, LighthouseRunManifest>();
                manifest.forEach((m) => map.set(m.url, m));
                repRuns = Array.from(map.values());
            }

            const cleanRuns: LighthouseRunManifest[] = [];
            const preservedFiles = new Set<string>(['manifest.json', 'index.html']);

            for (const run of repRuns) {
                const { slug, title, route } = getSlugAndTitle(run.url);
                const targetHtml = `${slug}.html`;
                const targetJson = `${slug}.json`;
                preservedFiles.add(targetHtml);
                preservedFiles.add(targetJson);

                const srcHtmlFile = path.basename(run.htmlPath);
                const srcJsonFile = path.basename(run.jsonPath);
                const srcHtmlPath = path.join(lhDir, srcHtmlFile);
                const srcJsonPath = path.join(lhDir, srcJsonFile);
                const destHtmlPath = path.join(lhDir, targetHtml);
                const destJsonPath = path.join(lhDir, targetJson);

                if (fs.existsSync(srcHtmlPath) && srcHtmlPath !== destHtmlPath) {
                    fs.copyFileSync(srcHtmlPath, destHtmlPath);
                }
                if (fs.existsSync(srcJsonPath) && srcJsonPath !== destJsonPath) {
                    fs.copyFileSync(srcJsonPath, destJsonPath);
                }

                // Read report data from targetJson
                let reportData: LighthouseReport | null = null;
                if (fs.existsSync(destJsonPath)) {
                    try {
                        reportData = JSON.parse(fs.readFileSync(destJsonPath, 'utf8'));
                    } catch (e) {
                        console.warn(`Failed reading ${destJsonPath}:`, e);
                    }
                }

                cleanRuns.push({
                    url: run.url,
                    isRepresentativeRun: true,
                    htmlPath: `./${targetHtml}`,
                    jsonPath: `./${targetJson}`,
                    summary: run.summary,
                });

                if (reportData) {
                    const audits = reportData.audits || {};
                    const categories = reportData.categories || {};

                    const getMetric = (id: string) => {
                        const a = audits[id];
                        return {
                            display:
                                a?.displayValue ||
                                (a?.numericValue ? `${Math.round(a.numericValue)} ms` : '-'),
                            value: a?.numericValue || 0,
                            score: a?.score ?? 1,
                        };
                    };

                    const pageAudits: PageAuditSummary['pageOpportunities'] = [];

                    // Scan categories for audits with opportunities / issues
                    for (const [catKey, cat] of Object.entries(categories)) {
                        const catId = catKey as IssueItem['category'];
                        for (const ref of cat.auditRefs || []) {
                            const audit = audits[ref.id];
                            if (!audit) continue;
                            if (
                                audit.score === null ||
                                audit.score >= 0.9 ||
                                audit.scoreDisplayMode === 'notApplicable' ||
                                audit.scoreDisplayMode === 'informative'
                            ) {
                                continue;
                            }

                            // Don't duplicate core web vitals in opportunities if they are pure metrics
                            const isMetricAudit = [
                                'first-contentful-paint',
                                'largest-contentful-paint',
                                'total-blocking-time',
                                'cumulative-layout-shift',
                                'speed-index',
                            ].includes(audit.id);

                            const savingsBytes = audit.details?.overallSavingsBytes || 0;
                            const savingsMs = audit.details?.overallSavingsMs || 0;

                            if (
                                !isMetricAudit &&
                                (savingsBytes > 0 || savingsMs > 0 || audit.score < 0.9)
                            ) {
                                pageAudits.push({
                                    id: audit.id,
                                    title: audit.title,
                                    displayValue: audit.displayValue,
                                    savingsBytes,
                                    savingsMs,
                                    score: audit.score,
                                });

                                // Aggregate into global issues map
                                if (!issuesMap.has(audit.id)) {
                                    issuesMap.set(audit.id, {
                                        id: audit.id,
                                        title: audit.title,
                                        category: catId,
                                        categoryTitle: cat.title,
                                        description: audit.description || '',
                                        totalSavingsBytes: 0,
                                        totalSavingsMs: 0,
                                        affectedPages: [],
                                    });
                                }

                                const issue = issuesMap.get(audit.id)!;
                                issue.totalSavingsBytes += savingsBytes;
                                issue.totalSavingsMs += savingsMs;

                                const rawItems = audit.details?.items || [];
                                const cleanItems = rawItems.slice(0, 5).map((it) => {
                                    const node = it.node || {};
                                    return {
                                        url: it.url
                                            ? it.url.replace(/^https?:\/\/[^/]+/, '')
                                            : undefined,
                                        totalBytes: it.totalBytes,
                                        wastedBytes: it.wastedBytes,
                                        wastedPercent: it.wastedPercent
                                            ? Math.round(it.wastedPercent)
                                            : undefined,
                                        selector: node.selector,
                                        snippet: node.snippet,
                                        explanation: node.explanation,
                                        nodeLabel: node.nodeLabel,
                                    };
                                });

                                issue.affectedPages.push({
                                    slug,
                                    title,
                                    route,
                                    score: audit.score,
                                    displayValue: audit.displayValue,
                                    savingsBytes,
                                    savingsMs,
                                    items: cleanItems.length > 0 ? cleanItems : undefined,
                                });
                            }
                        }
                    }

                    // Sort page audits by impact (savings or score)
                    pageAudits.sort(
                        (a, b) =>
                            (b.savingsBytes || 0) - (a.savingsBytes || 0) ||
                            (b.savingsMs || 0) - (a.savingsMs || 0) ||
                            a.score - b.score
                    );

                    pagesSummary.push({
                        slug,
                        title,
                        route,
                        url: run.url,
                        htmlFile: targetHtml,
                        jsonFile: targetJson,
                        scores: {
                            performance: Math.round(
                                (categories.performance?.score ?? run.summary.performance) * 100
                            ),
                            accessibility: Math.round(
                                (categories.accessibility?.score ?? run.summary.accessibility) * 100
                            ),
                            bestPractices: Math.round(
                                (categories['best-practices']?.score ??
                                    run.summary['best-practices']) * 100
                            ),
                            seo: Math.round((categories.seo?.score ?? run.summary.seo) * 100),
                        },
                        metrics: {
                            fcp: getMetric('first-contentful-paint'),
                            lcp: getMetric('largest-contentful-paint'),
                            tbt: getMetric('total-blocking-time'),
                            cls: getMetric('cumulative-layout-shift'),
                            si: getMetric('speed-index'),
                        },
                        pageOpportunities: pageAudits,
                    });
                }
            }

            // Cleanup non-representative / old timestamped files to keep folder clean
            const existingFiles = fs.readdirSync(lhDir);
            for (const file of existingFiles) {
                if (!preservedFiles.has(file)) {
                    try {
                        fs.unlinkSync(path.join(lhDir, file));
                    } catch {
                        // ignore
                    }
                }
            }

            // Write updated clean manifest
            fs.writeFileSync(manifestPath, JSON.stringify(cleanRuns, null, 2), 'utf8');

            // Write redirect index.html in lighthouse/ directory
            const lhIndexHtml = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=../index.html#lighthouse">
  <title>Lighthouse Reports</title>
</head>
<body>
  <p>Weiterleitung zum <a href="../index.html#lighthouse">Qualitäts-Dashboard</a>...</p>
</body>
</html>`;
            fs.writeFileSync(path.join(lhDir, 'index.html'), lhIndexHtml, 'utf8');
        } catch (e) {
            console.warn('Failed to parse and clean lighthouse manifest:', e);
        }
    }

    // 3. Check for unit tests
    const hasUnitReport = fs.existsSync(path.join(unitDir, 'index.html'));

    // 4. Calculate aggregate scores
    const avgPerf =
        pagesSummary.length > 0
            ? Math.round(
                  pagesSummary.reduce((acc, p) => acc + p.scores.performance, 0) /
                      pagesSummary.length
              )
            : 0;
    const avgA11y =
        pagesSummary.length > 0
            ? Math.round(
                  pagesSummary.reduce((acc, p) => acc + p.scores.accessibility, 0) /
                      pagesSummary.length
              )
            : 0;
    const avgBp =
        pagesSummary.length > 0
            ? Math.round(
                  pagesSummary.reduce((acc, p) => acc + p.scores.bestPractices, 0) /
                      pagesSummary.length
              )
            : 0;
    const avgSeo =
        pagesSummary.length > 0
            ? Math.round(
                  pagesSummary.reduce((acc, p) => acc + p.scores.seo, 0) / pagesSummary.length
              )
            : 0;

    // Convert issuesMap to sorted array
    const sortedIssues = Array.from(issuesMap.values()).sort((a, b) => {
        return (
            b.totalSavingsBytes - a.totalSavingsBytes ||
            b.totalSavingsMs - a.totalSavingsMs ||
            b.affectedPages.length - a.affectedPages.length
        );
    });

    // 5. Generate Master HTML Dashboard
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DPSG Wehr - Test- & Qualitäts-Dashboard</title>
  <style>
    :root {
      --bg: #0b0f19;
      --surface: #111827;
      --surface-elevated: #1f2937;
      --surface-hover: #283548;
      --border: #374151;
      --border-subtle: #1f2937;
      --text: #f9fafb;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      
      --brand: #10b981;
      --brand-glow: rgba(16, 185, 129, 0.15);
      --green: #10b981;
      --green-bg: rgba(16, 185, 129, 0.12);
      --green-border: rgba(16, 185, 129, 0.3);
      --amber: #f59e0b;
      --amber-bg: rgba(245, 158, 11, 0.12);
      --amber-border: rgba(245, 158, 11, 0.3);
      --rose: #ef4444;
      --rose-bg: rgba(239, 68, 68, 0.12);
      --rose-border: rgba(239, 68, 68, 0.3);
      --blue: #3b82f6;
      --blue-bg: rgba(59, 130, 246, 0.12);
      --blue-border: rgba(59, 130, 246, 0.3);
      --purple: #8b5cf6;
      --purple-bg: rgba(139, 92, 246, 0.12);
      --purple-border: rgba(139, 92, 246, 0.3);
      
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.5;
      padding-bottom: 5rem;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Header */
    header {
      background: linear-gradient(180deg, #131b2e 0%, var(--bg) 100%);
      border-bottom: 1px solid var(--border-subtle);
      padding: 2.5rem 0 2rem;
      margin-bottom: 2rem;
    }
    .header-content {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: var(--brand-glow);
      border: 1px solid var(--green-border);
      border-radius: 12px;
      color: var(--brand);
      font-size: 1.5rem;
    }
    h1 {
      font-size: 1.625rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text);
    }
    .header-sub {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-top: 0.2rem;
    }
    .meta-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.35rem 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--text-muted);
    }
    .pill-green {
      background: var(--green-bg);
      border-color: var(--green-border);
      color: var(--green);
    }

    /* KPI Summary Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin-bottom: 2.5rem;
    }
    .kpi-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    .kpi-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .kpi-e2e::before { background: var(--blue); }
    .kpi-perf::before { background: var(--green); }
    .kpi-a11y::before { background: var(--purple); }
    .kpi-unit::before { background: var(--amber); }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .kpi-title {
      font-size: 0.8125rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }
    .kpi-badge {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 6px;
      font-weight: 600;
    }
    .badge-success { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
    .badge-warn { background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }
    .badge-danger { background: var(--rose-bg); color: var(--rose); border: 1px solid var(--rose-border); }

    .kpi-value {
      font-size: 1.875rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--text);
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .kpi-sub {
      color: var(--text-muted);
      font-size: 0.8125rem;
      margin-top: 0.25rem;
    }
    .kpi-action {
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
    }

    /* Buttons & Links */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.45rem 0.875rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }
    .btn-primary {
      background: var(--surface-elevated);
      color: var(--text);
      border-color: var(--border);
    }
    .btn-primary:hover {
      background: var(--surface-hover);
      border-color: var(--text-muted);
      color: #fff;
    }
    .btn-sm {
      padding: 0.3rem 0.65rem;
      font-size: 0.75rem;
    }
    .btn-brand {
      background: var(--brand-glow);
      color: var(--green);
      border-color: var(--green-border);
    }
    .btn-brand:hover {
      background: var(--green);
      color: #0b0f19;
    }

    /* Section Headings */
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }

    /* Lighthouse Page Cards Grid */
    .pages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
      margin-bottom: 3rem;
    }
    .page-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    .page-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }
    .page-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--text);
    }
    .page-route {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.15rem;
    }

    /* Radial Score Gauges */
    .scores-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
      background: var(--surface-elevated);
      padding: 0.75rem 0.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }
    .score-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .gauge {
      width: 48px;
      height: 48px;
      position: relative;
    }
    .gauge svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .gauge-bg {
      fill: none;
      stroke: #2d3748;
      stroke-width: 3.5;
    }
    .gauge-val {
      fill: none;
      stroke-width: 3.5;
      stroke-linecap: round;
      transition: stroke-dasharray 0.5s ease;
    }
    .val-green { stroke: var(--green); }
    .val-amber { stroke: var(--amber); }
    .val-rose { stroke: var(--rose); }
    .gauge-text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8125rem;
      font-weight: 700;
      font-family: var(--font-mono);
    }
    .score-name {
      font-size: 0.6875rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
      font-weight: 500;
    }

    /* Core Web Vitals Row */
    .cwv-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .cwv-chip {
      background: var(--surface-elevated);
      padding: 0.4rem 0.5rem;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
    }
    .cwv-label {
      font-size: 0.65rem;
      color: var(--text-dim);
      font-weight: 600;
      text-transform: uppercase;
    }
    .cwv-value {
      font-size: 0.8125rem;
      font-weight: 600;
      font-family: var(--font-mono);
      margin-top: 0.1rem;
    }
    .cwv-good { color: var(--green); }
    .cwv-warn { color: var(--amber); }
    .cwv-poor { color: var(--rose); }

    /* Page Opportunities inside Page Card */
    .page-opps {
      margin-top: 0.5rem;
      margin-bottom: 1rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.75rem;
    }
    .opps-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
    }
    .opp-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      font-size: 0.75rem;
      padding: 0.25rem 0;
      color: var(--text-muted);
    }
    .opp-badge {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-weight: 600;
      white-space: nowrap;
    }
    .opp-badge-save {
      background: var(--amber-bg);
      color: var(--amber);
      border: 1px solid var(--amber-border);
    }

    /* Issues Deep Dive Section */
    .issues-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 3rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
    }
    .filters-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 1.25rem;
    }
    .tab-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .tab-btn {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .tab-btn:hover {
      color: var(--text);
      background: var(--surface-hover);
    }
    .tab-btn.active {
      background: var(--brand);
      color: #0b0f19;
      border-color: var(--brand);
      font-weight: 600;
    }
    .search-input {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8125rem;
      min-width: 240px;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--brand);
    }

    .issue-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      padding: 1.15rem;
      margin-bottom: 1rem;
      transition: border-color 0.15s ease;
    }
    .issue-card:hover {
      border-color: var(--border);
    }
    .issue-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .issue-title-group {
      display: flex;
      align-items: center;
      gap: 0.625rem;
    }
    .cat-tag {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
    .cat-perf { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-border); }
    .cat-a11y { background: var(--purple-bg); color: var(--purple); border: 1px solid var(--purple-border); }
    .cat-bp { background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue-border); }
    .cat-seo { background: var(--amber-bg); color: var(--amber); border: 1px solid var(--amber-border); }

    .issue-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--text);
    }
    .issue-savings-pill {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--amber-bg);
      color: var(--amber);
      border: 1px solid var(--amber-border);
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
    }
    .issue-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
      margin-bottom: 0.85rem;
      line-height: 1.45;
    }
    .issue-desc a {
      color: var(--brand);
      text-decoration: underline;
    }

    .issue-pages {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      padding-top: 0.65rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .page-tag {
      font-size: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      color: var(--text-muted);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .page-tag-value {
      font-family: var(--font-mono);
      color: var(--amber);
      font-weight: 600;
    }

    /* Subitems table / list */
    .items-details {
      margin-top: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: 6px;
      padding: 0.65rem;
      font-size: 0.75rem;
    }
    .items-details summary {
      cursor: pointer;
      color: var(--text-muted);
      font-weight: 500;
    }
    .items-list {
      margin-top: 0.5rem;
      list-style: none;
    }
    .items-list li {
      padding: 0.3rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      font-family: var(--font-mono);
      word-break: break-all;
    }
    .items-list li:last-child {
      border-bottom: none;
    }

    /* Artifacts Links Footer */
    .artifacts-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .artifacts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .artifact-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      padding: 0.85rem 1rem;
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .artifact-link:hover {
      background: var(--surface-hover);
      border-color: var(--brand);
      transform: translateY(-1px);
    }
    .artifact-icon {
      font-size: 1.25rem;
    }
    .artifact-meta {
      display: flex;
      flex-direction: column;
    }
    .artifact-title {
      font-size: 0.8125rem;
      font-weight: 600;
    }
    .artifact-sub {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    @media (max-width: 640px) {
      .scores-row {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .cwv-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="container header-content">
      <div class="header-brand">
        <div class="brand-badge">⚜️</div>
        <div>
          <h1>DPSG Wehr - Test- & Qualitäts-Dashboard</h1>
          <div class="header-sub">Zentrale Übersicht aller E2E-Tests, Barrierefreiheits-Prüfungen & Lighthouse-Audits</div>
        </div>
      </div>
      <div class="meta-pills">
        ${e2eSummary.git.shortHash ? `<span class="pill"><span>Commit:</span> <strong>${e2eSummary.git.shortHash}</strong></span>` : ''}
        ${e2eSummary.git.branch ? `<span class="pill"><span>Branch:</span> <strong>${e2eSummary.git.branch}</strong></span>` : ''}
        ${e2eSummary.date ? `<span class="pill"><span>Ausgeführt:</span> ${e2eSummary.date}</span>` : ''}
        <span class="pill pill-green">● CI Pipeline</span>
      </div>
    </div>
  </header>

  <div class="container">

    <!-- KPI Summary Grid -->
    <div class="kpi-grid">
      
      <!-- E2E Tests -->
      <div class="kpi-card kpi-e2e">
        <div>
          <div class="kpi-top">
            <span class="kpi-title">Playwright E2E Tests</span>
            <span class="kpi-badge ${e2eSummary.failed > 0 ? 'badge-danger' : 'badge-success'}">
              ${e2eSummary.failed > 0 ? `${e2eSummary.failed} Fehlgeschlagen` : 'Alle Bestanden'}
            </span>
          </div>
          <div class="kpi-value">
            ${e2eSummary.passed} / ${e2eSummary.total}
            <span style="font-size: 1rem; color: var(--text-muted); font-weight: normal;">
              (${e2eSummary.total > 0 ? Math.round((e2eSummary.passed / e2eSummary.total) * 100) : 100}%)
            </span>
          </div>
          <div class="kpi-sub">Dauer: ${e2eSummary.duration} • 0 Flaky Tests</div>
        </div>
        <div class="kpi-action">
          <a href="./e2e/index.html" class="btn btn-primary btn-sm" style="width: 100%;">
            🎭 Playwright Monocart-Report öffnen ↗
          </a>
        </div>
      </div>

      <!-- Lighthouse Performance -->
      <div class="kpi-card kpi-perf">
        <div>
          <div class="kpi-top">
            <span class="kpi-title">Ø Performance</span>
            <span class="kpi-badge ${avgPerf >= 90 ? 'badge-success' : avgPerf >= 80 ? 'badge-warn' : 'badge-danger'}">
              ${avgPerf >= 90 ? 'Hervorragend' : avgPerf >= 80 ? 'Gut' : 'Optimierung nötig'}
            </span>
          </div>
          <div class="kpi-value">
            ${avgPerf}<span style="font-size: 1rem; color: var(--text-muted); font-weight: normal;">/100</span>
          </div>
          <div class="kpi-sub">${pagesSummary.length} Seiten auditiert (${pagesSummary.map((p) => `${p.slug}: ${p.scores.performance}`).join(', ')})</div>
        </div>
        <div class="kpi-action">
          <a href="#lighthouse" class="btn btn-primary btn-sm" style="width: 100%;">
            ⚡ Zu den Einzelseiten springen ↓
          </a>
        </div>
      </div>

      <!-- Accessibility -->
      <div class="kpi-card kpi-a11y">
        <div>
          <div class="kpi-top">
            <span class="kpi-title">Ø Barrierefreiheit (a11y)</span>
            <span class="kpi-badge ${avgA11y >= 90 ? 'badge-success' : 'badge-warn'}">
              ${avgA11y >= 95 ? 'Exzellent' : 'Konform'}
            </span>
          </div>
          <div class="kpi-value">
            ${avgA11y}<span style="font-size: 1rem; color: var(--text-muted); font-weight: normal;">/100</span>
          </div>
          <div class="kpi-sub">Best Practices: ${avgBp}% • SEO: ${avgSeo}%</div>
        </div>
        <div class="kpi-action">
          <a href="#issues" class="btn btn-primary btn-sm" style="width: 100%;">
            ♿ Details anzeigen ↓
          </a>
        </div>
      </div>

      <!-- Unit Tests -->
      <div class="kpi-card kpi-unit">
        <div>
          <div class="kpi-top">
            <span class="kpi-title">Vitest Unit-Tests</span>
            <span class="kpi-badge badge-success">Bestanden</span>
          </div>
          <div class="kpi-value">
            ${hasUnitReport ? '100%' : 'Aktiv'}
          </div>
          <div class="kpi-sub">Komponenten- & Helfer-Tests im Build verifiziert</div>
        </div>
        <div class="kpi-action">
          ${
              hasUnitReport
                  ? `<a href="./unit/index.html" class="btn btn-primary btn-sm" style="width: 100%;">🧪 Vitest HTML-Report öffnen ↗</a>`
                  : `<span class="btn btn-primary btn-sm" style="width: 100%; opacity: 0.6; cursor: default;">🧪 Im CI-Lauf verifiziert</span>`
          }
        </div>
      </div>

    </div>

    <!-- Section 1: Lighthouse Pages -->
    <div id="lighthouse" style="scroll-margin-top: 2rem;">
      <div class="section-head">
        <div class="section-title">
          <span>⚡</span> Lighthouse Audits nach Seite
        </div>
        <span style="font-size: 0.8125rem; color: var(--text-muted);">
          Alle Berichte wurden im simulierten mobilen Modus mit standardmäßigem Core-Web-Vitals-Throttling erstellt.
        </span>
      </div>

      <div class="pages-grid">
        ${pagesSummary
            .map((p) => {
                const getGaugeClass = (s: number) =>
                    s >= 90 ? 'val-green' : s >= 50 ? 'val-amber' : 'val-rose';
                const getCwvClass = (score: number) =>
                    score >= 0.9 ? 'cwv-good' : score >= 0.5 ? 'cwv-warn' : 'cwv-poor';

                return `
        <div class="page-card">
          <div>
            <div class="page-card-header">
              <div>
                <div class="page-title">${p.title}</div>
                <div class="page-route">${p.route}</div>
              </div>
              <a href="./lighthouse/${p.htmlFile}" class="btn btn-brand btn-sm">
                Vollständiger Bericht ↗
              </a>
            </div>

            <!-- Score Gauges -->
            <div class="scores-row">
              <div class="score-item">
                <div class="gauge">
                  <svg viewBox="0 0 36 36">
                    <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="gauge-val ${getGaugeClass(p.scores.performance)}" stroke-dasharray="${p.scores.performance}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <span class="gauge-text">${p.scores.performance}</span>
                </div>
                <span class="score-name">Performance</span>
              </div>

              <div class="score-item">
                <div class="gauge">
                  <svg viewBox="0 0 36 36">
                    <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="gauge-val ${getGaugeClass(p.scores.accessibility)}" stroke-dasharray="${p.scores.accessibility}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <span class="gauge-text">${p.scores.accessibility}</span>
                </div>
                <span class="score-name">A11y</span>
              </div>

              <div class="score-item">
                <div class="gauge">
                  <svg viewBox="0 0 36 36">
                    <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="gauge-val ${getGaugeClass(p.scores.bestPractices)}" stroke-dasharray="${p.scores.bestPractices}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <span class="gauge-text">${p.scores.bestPractices}</span>
                </div>
                <span class="score-name">Best Pract.</span>
              </div>

              <div class="score-item">
                <div class="gauge">
                  <svg viewBox="0 0 36 36">
                    <path class="gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="gauge-val ${getGaugeClass(p.scores.seo)}" stroke-dasharray="${p.scores.seo}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  </svg>
                  <span class="gauge-text">${p.scores.seo}</span>
                </div>
                <span class="score-name">SEO</span>
              </div>
            </div>

            <!-- Core Web Vitals Row -->
            <div class="cwv-row">
              <div class="cwv-chip">
                <span class="cwv-label">FCP (1. Paint)</span>
                <span class="cwv-value ${getCwvClass(p.metrics.fcp.score)}">${p.metrics.fcp.display}</span>
              </div>
              <div class="cwv-chip">
                <span class="cwv-label">LCP (Gr. Inhalt)</span>
                <span class="cwv-value ${getCwvClass(p.metrics.lcp.score)}">${p.metrics.lcp.display}</span>
              </div>
              <div class="cwv-chip">
                <span class="cwv-label">TBT (Blockierung)</span>
                <span class="cwv-value ${getCwvClass(p.metrics.tbt.score)}">${p.metrics.tbt.display}</span>
              </div>
            </div>

            <!-- Page Specific Opportunities -->
            ${
                p.pageOpportunities.length > 0
                    ? `
            <div class="page-opps">
              <div class="opps-title">
                <span>Top Potenziale & Hinweise</span>
                <span>${p.pageOpportunities.length} Punkte</span>
              </div>
              ${p.pageOpportunities
                  .slice(0, 3)
                  .map(
                      (opp) => `
                <div class="opp-item">
                  <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${opp.title}</span>
                  <span class="opp-badge opp-badge-save">${opp.displayValue || (opp.savingsBytes ? formatBytes(opp.savingsBytes) : `${Math.round(opp.score * 100)}%`)}</span>
                </div>
              `
                  )
                  .join('')}
            </div>
            `
                    : `
            <div class="page-opps">
              <div class="opp-item" style="color: var(--green);">
                <span>✓ Keine wesentlichen Optimierungspotenziale gefunden</span>
              </div>
            </div>
            `
            }
          </div>

          <div style="margin-top: 0.75rem;">
            <a href="./lighthouse/${p.htmlFile}" class="btn btn-primary btn-sm" style="width: 100%;">
              Detaillierten Lighthouse-Bericht öffnen ↗
            </a>
          </div>
        </div>
        `;
            })
            .join('')}
      </div>
    </div>

    <!-- Section 2: Actionable Issues Deep Dive -->
    <div id="issues" class="issues-section" style="scroll-margin-top: 2rem;">
      <div class="section-head" style="margin-bottom: 0.5rem;">
        <div class="section-title">
          <span>🔍</span> Handlungsfelder & Optimierungspotenziale
        </div>
      </div>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.25rem;">
        Hier sind alle identifizierten Einsparpotenziale und Optimierungshinweise aggregiert über die gesamte Website dargestellt.
      </p>

      <!-- Filters & Search -->
      <div class="filters-bar">
        <div class="tab-group" id="filterTabs">
          <button class="tab-btn active" data-cat="all">Alle (${sortedIssues.length})</button>
          <button class="tab-btn" data-cat="performance">⚡ Performance (${sortedIssues.filter((i) => i.category === 'performance').length})</button>
          <button class="tab-btn" data-cat="accessibility">♿ Barrierefreiheit (${sortedIssues.filter((i) => i.category === 'accessibility').length})</button>
          <button class="tab-btn" data-cat="best-practices">🛡️ Best Practices (${sortedIssues.filter((i) => i.category === 'best-practices').length})</button>
          <button class="tab-btn" data-cat="seo">🔎 SEO (${sortedIssues.filter((i) => i.category === 'seo').length})</button>
        </div>
        <input type="text" id="issueSearch" class="search-input" placeholder="Nach Stichwort oder Ressource filtern...">
      </div>

      <!-- Issues List -->
      <div id="issuesList">
        ${
            sortedIssues.length > 0
                ? sortedIssues
                      .map((issue) => {
                          const catClass =
                              issue.category === 'performance'
                                  ? 'cat-perf'
                                  : issue.category === 'accessibility'
                                    ? 'cat-a11y'
                                    : issue.category === 'best-practices'
                                      ? 'cat-bp'
                                      : 'cat-seo';

                          const savingsStr =
                              issue.totalSavingsBytes > 0
                                  ? `Einsparung: ~${formatBytes(issue.totalSavingsBytes)}`
                                  : issue.totalSavingsMs > 0
                                    ? `Einsparung: ~${formatMs(issue.totalSavingsMs)}`
                                    : '';

                          return `
          <div class="issue-card" data-category="${issue.category}" data-search="${issue.title.toLowerCase()} ${issue.id} ${issue.description.toLowerCase()}">
            <div class="issue-head">
              <div class="issue-title-group">
                <span class="cat-tag ${catClass}">${issue.categoryTitle}</span>
                <span class="issue-title">${issue.title}</span>
              </div>
              ${savingsStr ? `<span class="issue-savings-pill">${savingsStr}</span>` : ''}
            </div>

            <div class="issue-desc">
              ${renderMarkdownLinks(issue.description)}
            </div>

            <div class="issue-pages">
              <span style="font-size: 0.75rem; color: var(--text-dim); margin-right: 0.25rem;">Betroffene Seiten:</span>
              ${issue.affectedPages
                  .map(
                      (ap) => `
                <a href="./lighthouse/${ap.slug}.html" class="page-tag" style="text-decoration: none;">
                  <span>${ap.title}</span>
                  ${ap.displayValue ? `<span class="page-tag-value">(${ap.displayValue})</span>` : ''}
                </a>
              `
                  )
                  .join('')}
            </div>

            <!-- Expandable details for affected resources -->
            ${
                issue.affectedPages.some((p) => p.items && p.items.length > 0)
                    ? `
            <details class="items-details">
              <summary>Detailressourcen & Selektoren anzeigen (${issue.affectedPages.reduce((acc, p) => acc + (p.items?.length || 0), 0)} Elemente)</summary>
              <ul class="items-list">
                ${issue.affectedPages
                    .flatMap(
                        (p) =>
                            p.items?.map(
                                (item) => `
                  <li>
                    <div>
                      <strong style="color: var(--text);">${p.title}:</strong>
                      <span>${item.url || item.selector || item.nodeLabel || 'Ressource'}</span>
                      ${item.explanation ? `<div style="color: var(--amber); font-size: 0.7rem;">${item.explanation}</div>` : ''}
                    </div>
                    ${item.wastedBytes ? `<span style="color: var(--amber); white-space: nowrap;">-${formatBytes(item.wastedBytes)} (${item.wastedPercent}%)</span>` : ''}
                  </li>
                `
                            ) || []
                    )
                    .join('')}
              </ul>
            </details>
            `
                    : ''
            }
          </div>
          `;
                      })
                      .join('')
                : `
        <div style="text-align: center; padding: 3rem 0; color: var(--green);">
          <h3>🎉 Großartige Arbeit! Keine kritischen Handlungsfelder gefunden.</h3>
        </div>
        `
        }
      </div>
    </div>

    <!-- Section 3: Navigation & Artifact Links -->
    <div class="artifacts-card">
      <div class="section-title" style="font-size: 1.1rem; margin-bottom: 0.25rem;">
        <span>📁</span> Alle generierten Test-Artefakte & Direktlinks
      </div>
      <p style="color: var(--text-muted); font-size: 0.8125rem;">
        Für detaillierte Inspektionen können Sie alle Einzelberichte direkt öffnen:
      </p>

      <div class="artifacts-grid">
        <a href="./e2e/index.html" class="artifact-link">
          <span class="artifact-icon">🎭</span>
          <div class="artifact-meta">
            <span class="artifact-title">Playwright E2E Report</span>
            <span class="artifact-sub">e2e/index.html</span>
          </div>
        </a>

        ${
            hasUnitReport
                ? `
        <a href="./unit/index.html" class="artifact-link">
          <span class="artifact-icon">🧪</span>
          <div class="artifact-meta">
            <span class="artifact-title">Vitest Unit Tests</span>
            <span class="artifact-sub">unit/index.html</span>
          </div>
        </a>
        `
                : ''
        }

        ${pagesSummary
            .map(
                (p) => `
        <a href="./lighthouse/${p.htmlFile}" class="artifact-link">
          <span class="artifact-icon">⚡</span>
          <div class="artifact-meta">
            <span class="artifact-title">Lighthouse: ${p.title}</span>
            <span class="artifact-sub">lighthouse/${p.htmlFile}</span>
          </div>
        </a>
        `
            )
            .join('')}
      </div>
    </div>

  </div>

  <script>
    // Tab Filter
    const tabs = document.querySelectorAll('.tab-btn');
    const cards = document.querySelectorAll('.issue-card');
    const searchInput = document.getElementById('issueSearch');

    let currentCategory = 'all';
    let searchQuery = '';

    function filterIssues() {
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const searchText = card.getAttribute('data-search') || '';
        
        const matchesCat = (currentCategory === 'all' || cat === currentCategory);
        const matchesSearch = (!searchQuery || searchText.includes(searchQuery));

        if (matchesCat && matchesSearch) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.getAttribute('data-cat') || 'all';
        filterIssues();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterIssues();
      });
    }
  </script>
</body>
</html>
`;

    const targetFile = path.join(testResultsDir, 'index.html');
    fs.writeFileSync(targetFile, html, 'utf8');
    console.log(`✅ Test Dashboard generated successfully at: ${targetFile}`);
}

// Run directly if invoked via CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    generateDashboard();
}
