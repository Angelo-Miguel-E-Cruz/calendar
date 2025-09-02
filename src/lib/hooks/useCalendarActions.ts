import { EventApi } from "@fullcalendar/core/index.js"
import { useReducer } from "react"
import { DatabaseEvent, CalendarWithMembers, formatDate } from "../exports"
import Reducer from "../reducers/reducer"
import { initialState } from "../states/states"
import { createServerClient } from '@/lib/supabase/client'

const supabase = createServerClient()

// memo-ize?
export function useCalendarActions(id: string) {

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

  const fetchCalendar = async (setCalendarName: (name: string) => void, setCalendarId: (id: string) => void): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Fetching Calendar Info" } })
    try {
      const response = await fetch(`/api/calendars/${id}`)
      const data: { calendar: CalendarWithMembers } = await response.json()
      dispatch({ type: 'SET_PROPERTY', payload: { type: 'calendar', value: data.calendar } })
      setCalendarName(data.calendar.name)
      setCalendarId(data.calendar.id)
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