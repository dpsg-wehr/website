'use client';

import dynamic from 'next/dynamic';

const Calendar = dynamic(() => import('./Calendar'), {
    ssr: false,
    loading: () => <div className="h-[670px] w-full bg-gray-100 animate-pulse rounded-lg" />,
});

export default Calendar;
