
import interactionPlugin, { DropArg } from "@fullcalendar/interaction"
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core/index.js'
import { Event } from "@/lib/exports";

interface CalendarProps {
  allEvents: Event[],
  handleDateClick: (arg: { date: Date, allDay: boolean }) => void,
  handleDeleteModal: (data: { event: { id: string } }) => void,
  addEvent: (data: DropArg) => void
}


export default function Calendar({ allEvents, handleDateClick, handleDeleteModal, addEvent }: CalendarProps) {
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
      events={allEvents as EventSourceInput}
      nowIndicator={true}
      editable={true}
      droppable={true}
      selectable={true}
      selectMirror={true}
      dateClick={handleDateClick}
      drop={(data) => addEvent(data)}
      eventClick={(data) => handleDeleteModal(data)}
    />
  )
}