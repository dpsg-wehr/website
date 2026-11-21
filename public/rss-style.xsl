<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <html lang="de">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title><xsl:value-of select="/rss/channel/title"/> (RSS-Feed)</title>
                <script>
                    try {
                        var theme = localStorage.getItem('theme');
                        if (!theme) {
                            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                        }
                        if (theme === 'dark') {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.add('light');
                        }
                    } catch (e) {}
                </script>
                <style>
                    :root {
                        --bg: #f3f4f6;
                        --card-bg: #ffffff;
                        --card-border: #e5e7eb;
                        --text: #111827;
                        --text-muted: #4b5563;
                        --primary: #2563eb;
                        --primary-hover: #1d4ed8;
                        --btn-secondary-bg: #f9fafb;
                        --btn-secondary-hover: #f3f4f6;
                        --badge-bg: #fef3c7;
                        --badge-border: #fde68a;
                        --badge-text: #92400e;
                        --input-bg: #f9fafb;
                        --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    }

                    :root.dark {
                        --bg: #374151;
                        --card-bg: #1f2937;
                        --card-border: #4b5563;
                        --text: #ffffff;
                        --text-muted: #9ca3af;
                        --primary: #2563eb;
                        --primary-hover: #3b82f6;
                        --btn-secondary-bg: #374151;
                        --btn-secondary-hover: #4b5563;
                        --badge-bg: rgba(120, 53, 15, 0.4);
                        --badge-border: rgba(180, 83, 9, 0.4);
                        --badge-text: #fde68a;
                        --input-bg: #111827;
                    }

                    @media (prefers-color-scheme: dark) {
                        :root:not(.light) {
                            --bg: #374151;
                            --card-bg: #1f2937;
                            --card-border: #4b5563;
                            --text: #ffffff;
                            --text-muted: #9ca3af;
                            --primary: #2563eb;
                            --primary-hover: #3b82f6;
                            --btn-secondary-bg: #374151;
                            --btn-secondary-hover: #4b5563;
                            --badge-bg: rgba(120, 53, 15, 0.4);
                            --badge-border: rgba(180, 83, 9, 0.4);
                            --badge-text: #fde68a;
                            --input-bg: #111827;
                        }
                    }

                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        background-color: var(--bg);
                        color: var(--text);
                        font-family: var(--font);
                        line-height: 1.6;
                        padding: 3rem 1.25rem;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }

                    .container {
                        width: 100%;
                        max-width: 580px;
                    }

                    .nav-back {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.375rem;
                        color: var(--text-muted);
                        text-decoration: none;
                        font-size: 0.875rem;
                        margin-bottom: 1.25rem;
                        transition: color 0.15s ease;
                    }

                    .nav-back:hover {
                        color: var(--primary);
                    }

                    .card {
                        background: var(--card-bg);
                        border: 1px solid var(--card-border);
                        border-radius: 1rem;
                        padding: 2rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
                    }

                    .badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.375rem;
                        background: var(--badge-bg);
                        color: var(--badge-text);
                        border: 1px solid var(--badge-border);
                        font-size: 0.75rem;
                        font-weight: 600;
                        padding: 0.25rem 0.625rem;
                        border-radius: 9999px;
                        margin-bottom: 1rem;
                    }

                    h1 {
                        font-size: 1.625rem;
                        font-weight: 800;
                        letter-spacing: -0.02em;
                        line-height: 1.25;
                        margin-bottom: 0.5rem;
                    }

                    .desc {
                        color: var(--text-muted);
                        font-size: 0.95rem;
                        margin-bottom: 1.5rem;
                    }

                    .info-box {
                        border-top: 1px solid var(--card-border);
                        padding-top: 1.5rem;
                        margin-bottom: 1.5rem;
                    }

                    .info-box h2 {
                        font-size: 0.9375rem;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                    }

                    .info-box p {
                        font-size: 0.875rem;
                        color: var(--text-muted);
                        line-height: 1.55;
                        margin-bottom: 1.25rem;
                    }

                    .url-group {
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 1.5rem;
                    }

                    .url-input {
                        flex: 1;
                        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                        font-size: 0.8125rem;
                        padding: 0.625rem 0.875rem;
                        border-radius: 0.5rem;
                        border: 1px solid var(--card-border);
                        background: var(--input-bg);
                        color: var(--text);
                        outline: none;
                        min-width: 0;
                    }

                    .url-input:focus {
                        border-color: var(--primary);
                    }

                    .btn-primary {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        background: var(--primary);
                        color: #ffffff;
                        border: none;
                        padding: 0.625rem 1rem;
                        font-size: 0.875rem;
                        font-weight: 600;
                        border-radius: 0.5rem;
                        cursor: pointer;
                        text-decoration: none;
                        white-space: nowrap;
                        transition: background-color 0.15s ease;
                    }

                    .btn-primary:hover {
                        background: var(--primary-hover);
                    }

                    .actions {
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                        border-top: 1px solid var(--card-border);
                        padding-top: 1.5rem;
                    }

                    @media (min-width: 480px) {
                        .actions {
                            flex-direction: row;
                        }
                    }

                    .btn-secondary {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.5rem;
                        background: var(--btn-secondary-bg);
                        color: var(--text);
                        border: 1px solid var(--card-border);
                        padding: 0.625rem 1rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        border-radius: 0.5rem;
                        text-decoration: none;
                        flex: 1;
                        transition: background-color 0.15s ease, border-color 0.15s ease;
                    }

                    .btn-secondary:hover {
                        background: var(--btn-secondary-hover);
                        border-color: var(--primary);
                    }

                    footer {
                        text-align: center;
                        margin-top: 2rem;
                        font-size: 0.8125rem;
                        color: var(--text-muted);
                    }

                    footer a {
                        color: inherit;
                        text-decoration: none;
                    }

                    footer a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <a href="/news" class="nav-back">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Zurück zu Aktuelles
                    </a>

                    <div class="card">
                        <span class="badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="6.18" cy="17.82" r="2.18"></circle>
                                <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.46-4.44-9.9-9.9-9.9z"></path>
                            </svg>
                            RSS-Feed
                        </span>

                        <h1><xsl:value-of select="/rss/channel/title"/></h1>
                        <p class="desc"><xsl:value-of select="/rss/channel/description"/></p>

                        <div class="info-box">
                            <h2>Wie abonniere ich diesen Feed?</h2>
                            <p>
                                Dies ist die Web-Vorschau unseres RSS-Feeds. Kopiere die Feed-Adresse und füge sie in deinen bevorzugten News-Reader ein (z. B. NetNewsWire, Thunderbird, Feedly, Reeder), um neue Berichte automatisch zu erhalten.
                            </p>

                            <div class="url-group">
                                <input type="text" readonly="readonly" class="url-input" id="feedUrl" onclick="this.select();"/>
                                <button type="button" class="btn-primary" id="copyBtn" onclick="copyFeedUrl()">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                    <span id="copyBtnText">Kopieren</span>
                                </button>
                            </div>

                            <div class="actions">
                                <a href="/news" class="btn-secondary">
                                    Aktuelle Berichte auf der Website lesen
                                </a>
                            </div>
                        </div>
                    </div>

                    <footer>
                        DPSG Stamm St. Bernhard Wehr • <a href="https://dpsg-wehr.de">dpsg-wehr.de</a>
                    </footer>
                </div>

                <script>
                    document.getElementById('feedUrl').value = window.location.href;

                    function copyFeedUrl() {
                        var urlInput = document.getElementById('feedUrl');
                        navigator.clipboard.writeText(urlInput.value).then(function() {
                            var text = document.getElementById('copyBtnText');
                            var orig = text.innerText;
                            text.innerText = 'Kopiert! ✓';
                            setTimeout(function() {
                                text.innerText = orig;
                            }, 2000);
                        });
                    }
                </script>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
