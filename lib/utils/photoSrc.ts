const imageSizes = [16, 64, 128, 256, 384];
const deviceSizes = [640, 1080, 1920];

export function getOptimizedUrl(src: string, size: number) {
    const lastSlash = src.lastIndexOf('/');
    const lastDot = src.lastIndexOf('.');

    const path = src.substring(0, lastSlash);
    const filename = src.substring(lastSlash + 1, lastDot);

    return `${path}/nextImageExportOptimizer/${filename}-opt-${size}.WEBP`;
}

export function getSrcSet(src: string, width: number, height: number) {
    return imageSizes
        .concat(...deviceSizes)
        .filter((size) => size <= width)
        .map((size) => ({
            src: getOptimizedUrl(src, size),
            width: size,
            height: Math.round((size / width) * height),
        }));
}
