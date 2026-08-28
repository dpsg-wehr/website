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

export function getOptimizedImageMetadata(
    src: string,
    originalWidth: number,
    originalHeight: number
) {
    if (!src || src.startsWith('http') || !src.includes('/media/images/')) return null;

    // For this project, optimized images are in a subfolder named 'nextImageExportOptimizer'
    // e.g. /media/images/test.png -> /media/images/nextImageExportOptimizer/test-opt-1080.WEBP

    const targetWidth = 1080;
    const aspectRatio = originalWidth / originalHeight;
    if (!aspectRatio) return null;
    const targetHeight = Math.round(targetWidth / aspectRatio);

    const lastSlashIndex = src.lastIndexOf('/');
    const dir = src.substring(0, lastSlashIndex);
    const filenameWithExt = src.substring(lastSlashIndex + 1);
    const lastDotIndex = filenameWithExt.lastIndexOf('.');
    if (lastDotIndex === -1) return null;
    const filename = filenameWithExt.substring(0, lastDotIndex);

    const optimizedSrc = `${dir}/nextImageExportOptimizer/${filename}-opt-${targetWidth}.WEBP`;

    return {
        url: optimizedSrc,
        width: targetWidth,
        height: targetHeight,
    };
}
