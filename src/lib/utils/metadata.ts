function stripHtmlTags(input: string): string {
    let previous: string;
    let current = input;
    // Iteratively remove tags to handle nested or malicious structures like <scr<iframe>ipt>
    const tagPattern = /<[^>]*>/g;

    do {
        previous = current;
        current = current.replace(tagPattern, '');
    } while (current !== previous);

    return current;
}

export function getExcerpt(content: string, length = 160): string {
    // 1. Remove entire lines that are headings or images
    let lines = content.split('\n');
    lines = lines.filter((line) => {
        const trimmed = line.trim();
        // Skip headings (#), images (![), and empty lines
        return !trimmed.startsWith('#') && !trimmed.startsWith('![') && trimmed.length > 0;
    });

    let plainText = lines.join(' ');

    // 2. Remove JSX tags (e.g., <Component ... />)
    plainText = stripHtmlTags(plainText);

    // 3. Remove Markdown symbols
    plainText = plainText
        .replace(/\[(.*?)\].*?\)/g, '$1') // Links (keep text)
        .replace(/[*_~`>]/g, '') // Bold, italic, strikethrough, code, blockquote
        .replace(/\s+/g, ' ') // Multiple spaces to single space
        .trim();

    // 4. Return truncated text
    if (plainText.length <= length) return plainText;

    // Try to cut at the last space before the limit
    const truncated = plainText.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > length * 0.8) {
        return truncated.substring(0, lastSpace).trim() + '...';
    }

    return truncated.trim() + '...';
}
