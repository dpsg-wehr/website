import fs from 'fs';
import path from 'path';

function formatBytes(bytes?: number): string {
    if (!bytes || bytes <= 0) return '';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KiB`;
}

function formatScore(val?: number): string {
    const s = Math.round((val || 0) * 100);
    const icon = s >= 90 ? '🟢' : s >= 80 ? '🟡' : '🔴';
    return `${icon} ${s}`;
}

function getPageLabel(urlStr: string): string {
    try {
        const u = new URL(urlStr);
        const p = u.pathname.replace(/\/index\.html$/, '') || '/';
        if (p === '/') return '`/` (Startseite)';
        if (p === '/news') return '`/news` (Aktuelles)';
        if (p === '/gallerie') return '`/gallerie` (Galerie)';
        if (p.includes('termine')) return '`/pages/termine` (Kalender)';
        return `\`${p}\``;
    } catch {
        return urlStr;
    }
}

interface IssueSummary {
    id: string;
    title: string;
    category: string;
    categoryTitle: string;
    totalSavingsBytes: number;
    totalSavingsMs: number;
    pages: Array<{
        url: string;
        displayValue?: string;
        savingsBytes?: number;
    }>;
}

interface MonocartItem {
    type?: string;
    status?: string;
    title?: string;
    location?: string;
    subs?: MonocartItem[];
}

interface LighthouseRunItem {
    url: string;
    isRepresentativeRun?: boolean;
    jsonPath: string;
    summary: {
        performance?: number;
        accessibility?: number;
        'best-practices'?: number;
        seo?: number;
    };
}

interface AuditItem {
    id: string;
    title: string;
    score: number | null;
    scoreDisplayMode?: string;
    displayValue?: string;
    details?: {
        overallSavingsBytes?: number;
        overallSavingsMs?: number;
    };
}

interface CategoryItem {
    score?: number | null;
    title?: string;
    auditRefs?: Array<{ id: string }>;
}

export function generateCiSummary() {
    let md = '### 🧪 Test Suite Results\n\n';

    // 1. Playwright E2E Summary
    const e2ePath = path.resolve('test-results/e2e/index.json');
    if (fs.existsSync(e2ePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(e2ePath, 'utf8'));
            const summary = data.summary || {};
            const total = summary.tests?.value || 0;
            const passed = summary.passed?.value || 0;
            const failed = summary.failed?.value || 0;
            const flaky = summary.flaky?.value || 0;
            const skipped = summary.skipped?.value || 0;
            const duration =
                data.durationH || (data.duration ? `${(data.duration / 1000).toFixed(1)}s` : '-');

            md += '#### 🎭 Playwright E2E Tests\n\n';
            md += '| Total | Passed | Failed | Flaky | Skipped | Duration |\n';
            md += '| :---: | :----: | :----: | :---: | :-----: | :------: |\n';
            md += `| **${total}** | ✅ ${passed} | ${failed > 0 ? `❌ ${failed}` : '0'} | ${flaky > 0 ? `⚠️ ${flaky}` : '0'} | ${skipped} | ⏱️ ${duration} |\n\n`;

            if (failed > 0 && Array.isArray(data.rows)) {
                md +=
                    '<details><summary>❌ <strong>Fehlgeschlagene Tests anzeigen</strong></summary>\n\n';
                const findFailed = (item: MonocartItem) => {
                    if (item.type === 'case' && item.status === 'failed') {
                        md += `- **${item.title || ''}** (\`${item.location || ''}\`)\n`;
                    }
                    if (Array.isArray(item.subs)) item.subs.forEach(findFailed);
                };
                data.rows.forEach(findFailed);
                md += '\n</details>\n\n';
            }
        } catch (e) {
            console.error('Failed reading E2E summary:', e);
        }
    }

    // 2. Lighthouse Audits Summary
    const manifestPath = path.resolve('test-results/lighthouse/manifest.json');
    if (fs.existsSync(manifestPath)) {
        try {
            const runs: LighthouseRunItem[] = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            const repRuns = runs.filter((r) => r.isRepresentativeRun);
            const activeRuns = repRuns.length > 0 ? repRuns : runs;

            if (activeRuns.length > 0) {
                md += '#### ⚡ Lighthouse Audits\n\n';
                md +=
                    '| Seite | Performance | Barrierefreiheit | Best Practices | SEO | LCP | TBT |\n';
                md +=
                    '| :--- | :---------: | :--------------: | :------------: | :-: | :-: | :-: |\n';

                const issues = new Map<string, IssueSummary>();

                for (const r of activeRuns) {
                    const jsonFile = path.basename(r.jsonPath);
                    const jsonPath = path.resolve('test-results/lighthouse', jsonFile);

                    let audits: Record<string, AuditItem> = {};
                    let categories: Record<string, CategoryItem> = {};

                    if (fs.existsSync(jsonPath)) {
                        try {
                            const repData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                            audits = repData.audits || {};
                            categories = repData.categories || {};
                        } catch {
                            // ignore json parse error
                        }
                    }

                    const perf = formatScore(
                        categories.performance?.score ?? r.summary.performance
                    );
                    const a11y = formatScore(
                        categories.accessibility?.score ?? r.summary.accessibility
                    );
                    const bp = formatScore(
                        categories['best-practices']?.score ?? r.summary['best-practices']
                    );
                    const seo = formatScore(categories.seo?.score ?? r.summary.seo);

                    const lcpVal = audits['largest-contentful-paint']?.displayValue || '-';
                    const tbtVal = audits['total-blocking-time']?.displayValue || '-';
                    const lcpScore = audits['largest-contentful-paint']?.score ?? 1;
                    const tbtScore = audits['total-blocking-time']?.score ?? 1;
                    const lcpIcon = lcpScore >= 0.9 ? '🟢' : lcpScore >= 0.5 ? '🟡' : '🔴';
                    const tbtIcon = tbtScore >= 0.9 ? '🟢' : tbtScore >= 0.5 ? '🟡' : '🔴';

                    md += `| ${getPageLabel(r.url)} | ${perf} | ${a11y} | ${bp} | ${seo} | ${lcpIcon} ${lcpVal} | ${tbtIcon} ${tbtVal} |\n`;

                    // Collect actionable issues (skip pure metric audits)
                    const ignoredAuditIds = new Set([
                        'first-contentful-paint',
                        'largest-contentful-paint',
                        'total-blocking-time',
                        'cumulative-layout-shift',
                        'speed-index',
                        'interactive',
                        'max-potential-fid',
                        'network-dependency-tree-insight',
                        'largest-contentful-paint-element',
                    ]);

                    for (const [catKey, cat] of Object.entries(categories)) {
                        for (const ref of cat.auditRefs || []) {
                            const a = audits[ref.id];
                            if (
                                !a ||
                                a.score === null ||
                                a.score >= 0.9 ||
                                a.scoreDisplayMode === 'notApplicable' ||
                                a.scoreDisplayMode === 'informative'
                            ) {
                                continue;
                            }
                            if (ignoredAuditIds.has(a.id)) continue;

                            const savingsBytes = a.details?.overallSavingsBytes || 0;
                            const savingsMs = a.details?.overallSavingsMs || 0;

                            if (!issues.has(a.id)) {
                                issues.set(a.id, {
                                    id: a.id,
                                    title: a.title,
                                    category: catKey,
                                    categoryTitle: cat.title || catKey,
                                    totalSavingsBytes: 0,
                                    totalSavingsMs: 0,
                                    pages: [],
                                });
                            }

                            const item = issues.get(a.id)!;
                            item.totalSavingsBytes += savingsBytes;
                            item.totalSavingsMs += savingsMs;
                            item.pages.push({
                                url: r.url,
                                displayValue: a.displayValue,
                                savingsBytes,
                            });
                        }
                    }
                }

                md += '\n';

                // Render actionable opportunities breakdown
                if (issues.size > 0) {
                    const sortedIssues = Array.from(issues.values()).sort(
                        (a, b) =>
                            b.totalSavingsBytes - a.totalSavingsBytes ||
                            b.pages.length - a.pages.length
                    );

                    md += '<details>\n';
                    md +=
                        '<summary>🔍 <strong>Optimierungspotenziale & Handlungsfelder (Klicken zum Aufklappen)</strong></summary>\n\n';

                    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
                    const catIcons: Record<string, string> = {
                        performance: '⚡ Performance',
                        accessibility: '♿ Barrierefreiheit',
                        'best-practices': '🛡️ Best Practices',
                        seo: '🔎 SEO',
                    };

                    for (const cat of categories) {
                        const catIssues = sortedIssues.filter((i) => i.category === cat);
                        if (catIssues.length === 0) continue;

                        md += `##### ${catIcons[cat] || cat}\n`;
                        for (const iss of catIssues) {
                            const savingsLabel =
                                iss.totalSavingsBytes > 0
                                    ? ` (Einsparung: **~${formatBytes(iss.totalSavingsBytes)}**)`
                                    : '';
                            const pagesList = iss.pages
                                .map(
                                    (p) =>
                                        `${getPageLabel(p.url)}${p.displayValue ? ` [${p.displayValue}]` : ''}`
                                )
                                .join(', ');
                            md += `- **${iss.title}**${savingsLabel}\n  - Betroffene Seiten: ${pagesList}\n`;
                        }
                        md += '\n';
                    }

                    md += '</details>\n\n';
                }
            }
        } catch (e) {
            console.error('Failed reading Lighthouse summary:', e);
        }
    }

    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile) {
        fs.appendFileSync(summaryFile, md, 'utf8');
        console.log('✅ CI Summary successfully written to $GITHUB_STEP_SUMMARY');
    } else {
        console.log('--- CI Summary Output ---');
        console.log(md);
    }
}

// Run directly when invoked
if (import.meta.url === `file://${process.argv[1]}`) {
    generateCiSummary();
}
