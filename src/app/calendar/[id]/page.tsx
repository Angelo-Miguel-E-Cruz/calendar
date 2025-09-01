'use client'
import { useEffect, use, useReducer } from 'react'
import { DatabaseEvent, CalendarWithMembers, formatDate } from '@/lib/exports'
import { createServerClient } from '@/lib/supabase/client'
import Calendar from "@/components/utils/calendar";
import AddEvent from "@/components/modals/addEventModal";
import DeleteEvent from "@/components/modals/deleteEventModal";
import Reducer from "@/lib/reducers/reducer";
import { initialState } from "@/lib/states/states";
import { EventApi } from '@fullcalendar/core/index.js';
import Loading from '@/components/utils/loading';

const supabase = createServerClient()

// custom hook for business logic
const useCalendarEvents = (id: string) => {

  const [state, dispatch] = useReducer(Reducer, initialState)

  // const detectDateType = (input: string): "time" | "datetime" | "invalid" => {
  //   if (/^\d{2}:\d{2}$/.test(input)) return "time";
  //   if (!isNaN(Date.parse(input))) return "datetime";
  //   return "invalid";
  // }

  const addEvent = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Adding Event" } })
    e.preventDefault()

    // var start, end: string

    // if (detectDateType(state.newEvent.start_time) === "datetime") {
    //   const startDate = new Date(Date.parse(state.newEvent.start_time))
    //   start = formatDate(startDate, state.newEvent.allDay)
    // } else {
    //   start = formatDate(state.newEvent.start_time, state.newEvent.allDay)
    // }

    // if (state.newEvent.end_time) {
    //   if (detectDateType(state.newEvent.end_time) === "datetime") {
    //     const endDate = new Date(Date.parse(state.newEvent.end_time))
    //     end = formatDate(endDate, state.newEvent.allDay)
    //   } else {
    //     end = formatDate(state.newEvent.end_time, state.newEvent.allDay)
    //   }
    // } else {
    //   end = start
    // }

    try {
      const response = await fetch(`/api/calendars/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.newEvent.title,
          description: state.newEvent.description,
          start_time: state.newEvent.start_time,
          allDay: state.newEvent.allDay,
          end_time: state.newEvent.start_time
        })
      })

      const result = await response.json()
      const event: DatabaseEvent = result.event
      dispatch({ type: 'ADD_DB_EVENT', payload: event })
    } catch (error) {
      console.error('Error adding event:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
      dispatch({ type: 'RESET_PROPERTY', payload: 'newEvent' })
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })
    }
  }

  const handleDelete = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Deleting Event" } })
    try {
      const response = await fetch(`/api/calendars/${id}/events/${state.deleteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log(errorData.error)
      }

      dispatch({ type: 'REMOVE_DB_EVENT', payload: state.deleteId })
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })
      dispatch({ type: 'RESET_PROPERTY', payload: 'deleteId' })
    }
  }

  const fetchCalendar = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Fetching Calendar Info" } })
    try {
      const response = await fetch(`/api/calendars/${id}`)
      const data: { calendar: CalendarWithMembers } = await response.json()
      dispatch({ type: 'SET_PROPERTY', payload: { type: 'calendar', value: data.calendar } })
    } catch (error) {
      console.error('Error fetching calendar:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
  }

  const fetchEvents = async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Fetching Events" } })
    try {
      const response = await fetch(`/api/calendars/${id}/events`)
      const data: { events: DatabaseEvent[] } = await response.json()
      dispatch({ type: 'SET_PROPERTY', payload: { type: 'dbEvents', value: data.events || [] } })
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`calendar-${id}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `calendar_id=eq.${id}`
        },
        (payload) => {
          const newEvent = payload.new as DatabaseEvent
          if (payload.eventType === 'INSERT') {
            dispatch({ type: 'ADD_DB_EVENT', payload: newEvent })
          } else if (payload.eventType === 'UPDATE') {
            dispatch({ type: 'UPDATE_DB_EVENT', payload: { id: newEvent.id, event: newEvent } })
          } else if (payload.eventType === 'DELETE') {
            dispatch({ type: 'REMOVE_DB_EVENT', payload: newEvent.id })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  const handleChangeEvent = async (data: { event: EventApi }) => {
    const startTime = formatDate(data.event.start!)
    const endTime = formatDate(data.event.end!)

    try {
      const response = await fetch(`/api/calendars/${id}/events/${data.event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_time: startTime,
          end_time: endTime
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log(errorData.error)
      }

      const newEvents = state.dbEvents.map((e) =>
        e.id === data.event.id
          ? { ...e, start_time: startTime, end_time: endTime }
          : e)

      dispatch({ type: 'SET_PROPERTY', payload: { type: 'dbEvents', value: newEvents } })
    } catch (error) {
      console.error('Error editing event:', error)
    } finally {
      console.log("done")
    }
  }

  return { state, dispatch, addEvent, handleDelete, fetchCalendar, fetchEvents, setupRealtimeSubscription, handleChangeEvent }
}

// add loading !

export default function CalendarView({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params)
  const { state, dispatch, addEvent, handleDelete, fetchCalendar, fetchEvents, setupRealtimeSubscription, handleChangeEvent } = useCalendarEvents(id)


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
    fetchCalendar()
    fetchEvents()

    const cleanup = setupRealtimeSubscription()
    return cleanup
  }, [id])

  return (
    <div className="px-6 pb-6">
      <h1 className='text-2xl'>{state.calendar?.name}</h1>

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
