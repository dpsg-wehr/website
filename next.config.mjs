/** @type {import('next').NextConfig}*/
const nextConfig = {
    // Configure `pageExtensions` to include MDX files
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    trailingSlash: true,
    images: {
        loader: 'custom',
        imageSizes: [16, 64, 128, 256, 384],
        deviceSizes: [640, 1080, 1920],
    },
    output: 'export',
    transpilePackages: ['next-image-export-optimizer'],
    env: {
        nextImageExportOptimizer_imageFolderPath: 'public/media/images',
        nextImageExportOptimizer_exportFolderPath: 'out',
        nextImageExportOptimizer_exportFolderName: 'nextImageExportOptimizer',
        nextImageExportOptimizer_quality: '60',
        nextImageExportOptimizer_storePicturesInWEBP: 'true',
        nextImageExportOptimizer_generateAndUseBlurImages: 'true',
        nextImageExportOptimizer_imageSizes: '16,64,128,256,384',
        nextImageExportOptimizer_deviceSizes: '640,1080,1920',
    },
};

export default nextConfig;
