import { DatabaseEvent, CalendarWithMembers } from "../exports"
import { useCalendarState } from "./useCalendarState"

// memo-ize?
export function useSupaCalendar(id: string) {

  const { dispatch } = useCalendarState()

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

  return { fetchCalendar, fetchEvents }
}