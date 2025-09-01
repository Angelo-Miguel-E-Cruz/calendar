
import interactionPlugin from "@fullcalendar/interaction"
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventApi, EventSourceInput } from '@fullcalendar/core/index.js'
import { DatabaseEvent } from "@/lib/exports";

interface CalendarProps {
  allEvents: DatabaseEvent[],
  handleDateClick: (arg: { date: Date, allDay: boolean }) => void,
  handleDeleteModal: (data: { event: { id: string } }) => void,
  handleResize: (data: { event: EventApi }) => void
}


export default function Calendar({ allEvents, handleDateClick, handleDeleteModal, handleResize }: CalendarProps) {

  const transformedEvents = allEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_time,
    end: event.end_time,
    allDay: event.allDay
  }))

  return (
    <FullCalendar
      plugins={[
        dayGridPlugin,
        interactionPlugin,
        timeGridPlugin
      ]}
      headerToolbar={{
        start: 'dayGridMonth,timeGridWeek,timeGridDay',
        center: 'title',
        end: 'today prevYear,prev,next,nextYear'
      }}
      buttonText={{
        today: 'Today',
        month: 'Month',
        week: 'Week',
        day: 'Day'
      }}
      allDaySlot={false}
      events={transformedEvents as EventSourceInput}
      nowIndicator={true}
      editable={true}
      eventResize={(event) => handleResize(event)}
      selectable={true}
      selectMirror={true}
      dateClick={handleDateClick}
      eventClick={(data) => handleDeleteModal(data)}
    />
  )
}