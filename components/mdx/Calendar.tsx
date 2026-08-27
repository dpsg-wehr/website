'use client';

import FullCalendar from '@fullcalendar/react';
import deLocal from '@fullcalendar/core/locales/de';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
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
                locales={[deLocal]}
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
                buttonText={{
                    today: 'Heute',
                    month: 'Monat',
                    week: 'Woche',
                    day: 'Tag',
                    list: 'Liste',
                }}
                events={publicEvents}
                eventContent={(event) => <div className="event-title">{event.event.title}</div>}
            />
        </div>
    );
}
