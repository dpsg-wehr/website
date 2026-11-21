'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import listPlugin from '@fullcalendar/react/list';
import deLocale from '@fullcalendar/react/locales/de';
import classicThemePlugin from '@fullcalendar/react/themes/classic';
import timeGridPlugin from '@fullcalendar/react/timegrid';

import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import publicEvents from '@/content/events/public.json';

import './Calendar.css';

export default function Calendar() {
    return (
        <div className="not-prose m-6 text-sm break-all">
            <FullCalendar
                height={670}
                aspectRatio={1}
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, classicThemePlugin]}
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
