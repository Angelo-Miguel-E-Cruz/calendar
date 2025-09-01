'use client'
import { useEffect, use, useReducer } from 'react'
import { DatabaseEvent, CalendarWithMembers } from '@/lib/exports'
import { createServerClient } from '@/lib/supabase/client'
import { EventSourceInput } from '@fullcalendar/core/index.js'
import Calendar from "@/components/utils/calendar";
import AddEvent from "@/components/modals/addEventModal";
import DeleteEvent from "@/components/modals/deleteEventModal";
import Reducer from "@/lib/reducers/reducer";
import { initialState } from "@/lib/states/states";
import { DropArg } from '@fullcalendar/interaction/index.js'

const supabase = createServerClient()

// custom hook for business logic
const useCalendarEvents = (id: string) => {

  const [state, dispatch] = useReducer(Reducer, initialState)

  const addEvent = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/calendars/${id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.newEvent.title,
          description: state.newEvent.description,
          start_time: state.newEvent.start_time,
          all_day: state.newEvent.allDay,
          end_time: state.newEvent.end_time
        })
      })

      const result = await response.json()
      const event: DatabaseEvent = result.event
      dispatch({ type: 'ADD_DB_EVENT', payload: event })
    } catch (error) {
      console.error('Error adding event:', error)
    } finally {
      dispatch({ type: 'RESET_PROPERTY', payload: 'newEvent' })
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })
    }
  }

  const handleDelete = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: 'DELETE'
      })

      dispatch({ type: 'REMOVE_DB_EVENT', payload: id })
    } catch (error) {
      console.error('Error deleting event:', error)
    } finally {
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })
      dispatch({ type: 'RESET_PROPERTY', payload: 'deleteId' })
    }
  }

  const fetchCalendar = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/calendars/${id}`)
      const data: { calendar: CalendarWithMembers } = await response.json()
      dispatch({ type: 'SET_PROPERTY', payload: { type: 'calendar', value: data.calendar } })
    } catch (error) {
      console.error('Error fetching calendar:', error)
    }
  }

  const fetchEvents = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/calendars/${id}/events`)
      const data: { events: DatabaseEvent[] } = await response.json()
      dispatch({ type: 'SET_PROPERTY', payload: { type: 'dbEvents', value: data.events || [] } })
    } catch (error) {
      console.error('Error fetching events:', error)
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

  return { state, dispatch, addEvent, handleDelete, fetchCalendar, fetchEvents, setupRealtimeSubscription }
}

export default function CalendarView({ params }: { params: Promise<{ id: string }> }) {

  const { id } = use(params)
  const { state, dispatch, addEvent, handleDelete, fetchCalendar, fetchEvents, setupRealtimeSubscription } = useCalendarEvents(id)


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

  useEffect(() => {
    fetchCalendar()
    fetchEvents()

    const cleanup = setupRealtimeSubscription()
    return cleanup
  }, [id])

  useEffect(() => {
    console.log(state.dbEvents)
  }, [state.dbEvents])

  return (
    <div className="p-6">
      <h1 className='text-2xl'>{state.calendar?.name}</h1>

      <Calendar
        allEvents={state.dbEvents}
        handleDateClick={handleDateClick}
        handleDeleteModal={handleDeleteModal}
      />

      <DeleteEvent
        isOpen={state.modals.showDeleteModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })}
        onCancel={handleCloseModal}
        handleDelete={handleDelete} />

      <AddEvent
        isOpen={state.modals.showModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })}
        eventTitle={state.newEvent.title}
        handleSubmit={addEvent}
        handleChange={handleChange}
        onCancel={handleCloseModal} />

    </div>
  )
}
