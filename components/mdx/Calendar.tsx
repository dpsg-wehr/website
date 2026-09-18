'use client';

import FullCalendar from '@fullcalendar/react';
import deLocale from '@fullcalendar/react/locales/de';

import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import listPlugin from '@fullcalendar/react/list';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import publicEvents from '@/content/events/public.json';
import './Calendar.css';

export default function Calendar() {
    return (
        <div className="not-prose text-sm break-all m-6">
            <FullCalendar
                height={670}
                aspectRatio={1}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
                initialView="dayGridMonth"
                locales={[deLocale]}
                locale="de"
                weekNumbers={true}
                headerToolbar={{
                    left: '',
                    center: 'title',
                    right: '',
                }}
                footerToolbar={{
                    left: 'prev,next',
                    center: '',
                    right: 'dayGridMonth,timeGridWeek,listYear',
                }}
                buttons={{
                    today: { text: 'Heute' },
                    dayGridMonth: { text: 'Monat' },
                    timeGridWeek: { text: 'Woche' },
                    listYear: { text: 'Liste' },
                }}
                events={publicEvents}
                eventContent={(event) => <div className="event-title">{event.event.title}</div>}
            />
        </div>
    );
}
