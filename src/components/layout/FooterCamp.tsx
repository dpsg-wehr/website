interface FooterCampProps {
    className?: string;
}

export default function FooterCamp({ className = '' }: FooterCampProps) {
    return (
        <div
            className={`pointer-events-none relative w-full overflow-hidden select-none [--tent-w:min(340px,calc(100vw-1.5rem))] sm:[--tent-w:480px] md:[--tent-w:600px] lg:[--tent-w:728px] ${className}`}
            aria-hidden="true"
        >
            {/* Top clearance for tent roofs and flag banner */}
            <div className="relative w-full pt-[75px] sm:pt-[100px] md:pt-[125px] lg:pt-[150px]">
                {/* Grass ground spanning full height with repeating blades and matching grass texture */}
                <div
                    className="relative h-[140px] w-full bg-[url('/images/footer/grass.webp')] supports-[-webkit-touch-callout:none]:bg-[url('/images/footer/grass.webp')] sm:h-[180px] md:h-[220px] lg:h-[260px]"
                    style={{
                        backgroundImage: "url('/images/footer/grass.webp')",
                        backgroundRepeat: 'repeat-x',
                        backgroundPosition: 'left top',
                    }}
                >
                    {/* Tent illustration positioned precisely over the grassline */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-6xl px-4">
                        <picture>
                            <source srcSet="/images/footer/tent.webp" type="image/webp" />
                            <img
                                src="/images/footer/tent.png"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                width={728}
                                height={445}
                                style={{
                                    width: 'var(--tent-w)',
                                    top: 'calc(14.2px - var(--tent-w) * (150 / 728))',
                                }}
                                className="pointer-events-none absolute right-2 max-w-none select-none sm:right-6 md:right-10 lg:right-12"
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </div>
    );
}
