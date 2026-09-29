import { useState, useEffect, lazy, Suspense } from 'react';
import type { SlideImage } from 'yet-another-react-lightbox';

const LightboxWrapper = lazy(() => import('./LightboxWrapper'));

export default function GlobalLightbox() {
    const [slides, setSlides] = useState<SlideImage[]>([]);
    const [lightBoxOpen, setLightboxOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const openLightbox = (src: string) => {
        const images = document.querySelectorAll('img[data-lightbox="true"]');
        const newSlides: SlideImage[] = Array.from(images).map((img) => {
            const htmlImg = img as HTMLImageElement;
            return {
                src: htmlImg.dataset.src || htmlImg.src,
                alt: htmlImg.dataset.alt || htmlImg.alt,
                title: htmlImg.dataset.alt || htmlImg.alt,
                width: htmlImg.dataset.width ? parseInt(htmlImg.dataset.width) : undefined,
                height: htmlImg.dataset.height ? parseInt(htmlImg.dataset.height) : undefined,
            };
        });

        setSlides(newSlides);

        let targetIndex = newSlides.findIndex((slide) => slide.src === src);
        if (targetIndex === -1) {
            targetIndex = newSlides.findIndex(
                (slide) => slide.src.endsWith(src) || src.endsWith(slide.src)
            );
        }

        if (targetIndex !== -1) {
            setIndex(targetIndex);
        }
        setLightboxOpen(true);
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const lightboxTrigger = target.closest('[data-lightbox="true"]');
            if (lightboxTrigger) {
                const src =
                    lightboxTrigger.getAttribute('data-src') ||
                    (lightboxTrigger as HTMLImageElement).src;
                if (src) {
                    openLightbox(src);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    if (!lightBoxOpen) return null;

    return (
        <Suspense fallback={null}>
            <LightboxWrapper
                open={lightBoxOpen}
                setOpen={setLightboxOpen}
                slides={slides}
                index={index}
            />
        </Suspense>
    );
}
