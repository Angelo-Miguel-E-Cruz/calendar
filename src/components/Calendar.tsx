
import interactionPlugin, { DropArg } from "@fullcalendar/interaction"
import dayGridPlugin from '@fullcalendar/daygrid'
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid'
import { EventSourceInput } from '@fullcalendar/core/index.js'
import { Event } from "@/utils/exports";

interface CalendarProps {
  allEvents: Event[],
  handleDateClick: (arg: { date: Date, allDay: boolean }) => void,
  handleDeleteModal: (data: { event: { id: string } }) => void,
  addEvent: (data: DropArg) => void
}


export default function Calendar({ allEvents, handleDateClick, handleDeleteModal, addEvent }: CalendarProps) {
  return (
    <div className="col-span-8">
      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin
        ]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimelineWeek, dayGridMonth, timeGridWeek'
        }}
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
    </div>
  )
}