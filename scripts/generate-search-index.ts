import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { SearchItem } from '../src/types';

const CONTENT_DIRS = [
    { dir: 'content/posts', type: 'post' as const, baseRoute: '/posts' },
    { dir: 'content/pages', type: 'page' as const, baseRoute: '/pages' },
    { dir: 'content/gruppen', type: 'group' as const, baseRoute: '/pages/gruppen' },
];

function cleanContent(content: string): string {
    let result = content;

    // 0. Remove MDX exports (like export const metadata = ...)
    result = result.replace(/export const metadata = \{[\s\S]*?\n\}/g, ' ');

    // 1. Remove markdown images: ![alt](src) -> alt
    result = result.replace(/!\[(.*?)\]\(.*?\)/g, '$1');

    // 2. Remove markdown links: [text](url) -> text
    result = result.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    // 3. Extract text from component props like name="Wölflinge", label="...", etc.
    const propPattern = /\b(?:name|time|age|label|text|title|subtitle|desc)=["'](.*?)["']/g;
    let match;
    const extractedProps: string[] = [];
    while ((match = propPattern.exec(content)) !== null) {
        extractedProps.push(match[1]);
    }

    // 4. Remove all HTML/JSX tags but keep their inner content (if any)
    result = result.replace(/<[\s\S]*?>/g, ' ');

    // 5. Clean up remaining markdown
    result = result
        .replace(/[#*`>]/g, ' ') // Formatting symbols
        .replace(/\s+/g, ' ') // Consolidate whitespace
        .trim();

    return (result + ' ' + extractedProps.join(' ')).trim();
}

function generateSearchIndex() {
    const searchIndex: SearchItem[] = [];

    CONTENT_DIRS.forEach(({ dir, type, baseRoute }) => {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'));

        files.forEach((file) => {
            const filePath = path.join(dir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data, content } = matter(fileContent);

            let slug = file.replace('.mdx', '');
            let route = `${baseRoute}/${slug}`;

            // Special cases for custom routes
            if (slug === 'startseite' && type === 'page') {
                route = '/';
            } else if (slug === 'gallerie' && type === 'page') {
                route = '/gallerie';
            }

            // Extract Download components as Files
            const downloadPattern =
                /<Download\s+[^>]*src=["'](.*?)["'][^>]*title=["'](.*?)["'][^>]*\/>/g;
            let dMatch;
            while ((dMatch = downloadPattern.exec(fileContent)) !== null) {
                searchIndex.push({
                    title: dMatch[2],
                    content: `Datei: ${dMatch[2]}`,
                    slug: dMatch[1],
                    type: 'file',
                });
            }

            searchIndex.push({
                title: data.title || slug,
                content: cleanContent(content),
                slug: route,
                type: type,
            });
        });
    });

    const outDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    // Add manual entry for news page which doesn't have an MDX file
    searchIndex.push({
        title: 'News / Aktuelles',
        content:
            'Aktuelle Berichte, Informationen über unsere Aktivitäten, Zeltlager, Stammesaktionen und Neuigkeiten aus den Gruppen.',
        slug: '/news',
        type: 'page',
    });

    fs.writeFileSync(path.join(outDir, 'search-index.json'), JSON.stringify(searchIndex, null, 2));

    console.log(`Search index generated with ${searchIndex.length} items.`);
}

generateSearchIndex();
