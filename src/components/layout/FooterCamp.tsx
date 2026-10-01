interface FooterCampProps {
    className?: string;
}

export default function FooterCamp({ className = '' }: FooterCampProps) {
    return (
        <div
            className={`relative w-full overflow-hidden select-none pointer-events-none ${className}`}
            aria-hidden="true"
        >
            {/* Top clearance for tent roofs and flag banner */}
            <div className="relative w-full pt-[75px] sm:pt-[100px] md:pt-[125px] lg:pt-[150px]">
                {/* Grass ground spanning full height with repeating blades and matching grass texture */}
                <div
                    className="w-full relative h-[140px] sm:h-[180px] md:h-[220px] lg:h-[260px] bg-[url('/images/footer/grass.webp')] supports-[-webkit-touch-callout:none]:bg-[url('/images/footer/grass.webp')]"
                    style={{
                        backgroundImage: "url('/images/footer/grass.webp')",
                        backgroundRepeat: 'repeat-x',
                        backgroundPosition: 'left top',
                    }}
                >
                    {/* Tent illustration positioned precisely over the grassline */}
                    <div className="max-w-6xl mx-auto absolute inset-x-0 top-0 px-4 pointer-events-none">
                        <picture>
                            <source srcSet="/images/footer/tent.webp" type="image/webp" />
                            <img
                                src="/images/footer/tent.png"
                                alt=""
                                loading="lazy"
                                decoding="async"
                                width={728}
                                height={445}
                                className="absolute right-2 sm:right-6 md:right-10 lg:right-12 -top-[63px] sm:-top-[89px] md:-top-[111px] lg:-top-[135px] w-[340px] sm:w-[480px] md:w-[600px] lg:w-[728px] max-w-none pointer-events-none select-none"
                            />
                        </picture>
                    </div>
                </div>
            </div>
        </div>
    );
}
