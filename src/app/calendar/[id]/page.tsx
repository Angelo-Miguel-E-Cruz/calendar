'use client'
import { useCalendarContext } from '@/lib/contexts/calendarContext';
import { useEffect, use } from 'react'
import Calendar from "@/components/utils/calendar";
import AddEvent from "@/components/modals/addEventModal";
import DeleteEvent from "@/components/modals/deleteEventModal";
import Loading from '@/components/utils/loading';
import { useCalendarActions } from '@/lib/hooks/useCalendarActions';
import { useSupaCalendar } from '@/lib/hooks/useSupaCalendar';
import { useCalendarState } from '@/lib/hooks/useCalendarState';


export default function CalendarView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { setCalendarName, setCalendarId } = useCalendarContext()
  const { addEvent, handleDelete, setupRealtimeSubscription, handleChangeEvent } = useCalendarActions(id)
  const { fetchCalendar, fetchEvents } = useSupaCalendar(id)
  const { state, dispatch } = useCalendarState()

  const handleDateClick = (arg: { date: Date, allDay: boolean }) => {
    dispatch({
      type: 'SET_NEW_EVENT', payload: {
        start_time: arg.date.toISOString(),
        allDay: arg.allDay
      }
    })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: true } })
  }

  const handleDeleteModal = (data: { event: { id: string } }) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: true } })
    dispatch({ type: 'SET_PROPERTY', payload: { type: 'deleteId', value: data.event.id } })
  }

  const handleCloseModal = () => {
    dispatch({ type: 'RESET_PROPERTY', payload: 'newEvent' })
    dispatch({ type: 'RESET_PROPERTY', payload: 'deleteId' })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ type: 'SET_NEW_EVENT', payload: { title: e.target.value } })
  }

  // const handleAllDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   dispatch({ type: 'SET_NEW_EVENT', payload: { allDay: e.target.checked } })
  // }

  // const handleStartTime = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   dispatch({ type: 'SET_NEW_EVENT', payload: { start_time: e.target.value } })
  // }

  // const handleEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   dispatch({ type: 'SET_NEW_EVENT', payload: { end_time: e.target.value } })
  // }

  useEffect(() => {
    fetchCalendar(setCalendarName, setCalendarId)
    fetchEvents()

    const cleanup = setupRealtimeSubscription()
    return cleanup
  }, [id])

  return (
    <div className="px-6 pb-6">

      {state.loading.isLoading && (<Loading loadingMessage={state.loading.loadingMsg} />)}

      <Calendar
        allEvents={state.dbEvents}
        handleDateClick={handleDateClick}
        handleDeleteModal={handleDeleteModal}
        handleChangeEvent={handleChangeEvent}
      />

      <DeleteEvent
        isOpen={state.modals.showDeleteModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })}
        onCancel={handleCloseModal}
        handleDelete={handleDelete} />

      <AddEvent
        isOpen={state.modals.showModal}
        allDay={state.newEvent.allDay}
        startTime={state.newEvent.start_time}
        endTime={state.newEvent.end_time}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })}
        eventTitle={state.newEvent.title}
        handleSubmit={addEvent}
        handleChange={handleChange}
        // changeAllDay={handleAllDayChange}
        // handleStartTime={handleStartTime}
        // handleEndTime={handleEndTime}
        onCancel={handleCloseModal} />

    </div>
  )
}
