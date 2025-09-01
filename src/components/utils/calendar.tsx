
import interactionPlugin, { DropArg } from "@fullcalendar/interaction"
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core/index.js'

interface CalendarProps {
  allEvents: EventSourceInput,
  handleDateClick: (arg: { date: Date, allDay: boolean }) => void,
  handleDeleteModal: (data: { event: { id: string } }) => void
}


export default function Calendar({ allEvents, handleDateClick, handleDeleteModal }: CalendarProps) {
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
      events={allEvents}
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