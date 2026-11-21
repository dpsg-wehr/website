import { describe, it, expect } from 'vitest';

import { getExcerpt } from './metadata';

describe('metadata utilities', () => {
    describe('getExcerpt', () => {
        it('should strip markdown and html tags', () => {
            const content = `
# Heading
This is a **bold** statement with a [link](https://example.com).
<Component>JSX content</Component>
![Image](/img.png)
Another line.
            `;
            const excerpt = getExcerpt(content);
            expect(excerpt).toBe('This is a bold statement with a link. JSX content Another line.');
        });

        it('should truncate text to the specified length at a space', () => {
            const content =
                'This is a very long sentence that should definitely be truncated at some point so that it fits into the meta description.';
            const excerpt = getExcerpt(content, 40);
            expect(excerpt).toBe('This is a very long sentence that...');
            expect(excerpt.length).toBeLessThan(45);
        });

        it('should handle short content without truncation', () => {
            const content = 'Short content.';
            const excerpt = getExcerpt(content);
            expect(excerpt).toBe('Short content.');
        });
    });
});
