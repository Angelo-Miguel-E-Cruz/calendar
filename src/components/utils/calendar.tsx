
import interactionPlugin from "@fullcalendar/interaction"
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core/index.js'
import { DatabaseEvent } from "@/lib/exports";

interface CalendarProps {
  allEvents: DatabaseEvent[],
  handleDateClick: (arg: { date: Date, allDay: boolean }) => void,
  handleDeleteModal: (data: { event: { id: string } }) => void
}


export default function Calendar({ allEvents, handleDateClick, handleDeleteModal }: CalendarProps) {
  console.log("calendar: ", allEvents)

  const validEvents = Array.isArray(allEvents) ? allEvents.filter(event =>
    event.title && event.start_time
  ) : []

  console.log("valid events:", validEvents)

  const transformedEvents = allEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start_time, // Map start_time to start
    end: event.end_time,     // Map end_time to end (can be null)
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
      droppable={true}
      selectable={true}
      selectMirror={true}
      dateClick={handleDateClick}
      eventClick={(data) => handleDeleteModal(data)}
    />
  )
}