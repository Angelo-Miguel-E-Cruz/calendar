import { useReducer } from "react"
import { Calendar } from "../exports"
import ListReducer from "../reducers/listReducer"
import { initialListState } from "../states/states"

// memo-ize?
export function useListActions() {
  const [state, dispatch] = useReducer(ListReducer, initialListState)

  const loadCalendars = (data: any) => {
    const newCalendars: Calendar[] = data.map((calendar: Calendar) => {
      const newCalendar: Calendar = {
        id: calendar.id,
        name: calendar.name,
        description: calendar.description,
        owner_id: calendar.owner_id,
        created_at: calendar.created_at,
        updated_at: calendar.updated_at
      }
      return newCalendar
    })
    dispatch({ type: 'SET_CALENDAR', payload: newCalendars })
  }

  const getCalendars = async () => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Fetching Calendars" } })
    try {
      const response = await fetch('/api/calendars')
      const data: { calendars: Calendar[] } = await response.json()
      loadCalendars(data.calendars)
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { errorValue: true, message: error as string } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
  }

  const createCalendar = async () => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Creating Calendar" } })
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.ui.newCalendarName,
          //description: 'Created from API test page' -> handle this
        })
      })
      const data = await response.json()

      dispatch({ type: 'ADD_CALENDAR', payload: data as Calendar })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { errorValue: true, message: error as string } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
  }

  const removeCalendar = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Removing Calendar" } })
    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: 'DELETE'
      })

      dispatch({ type: 'REMOVE_CALENDAR', payload: id })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { errorValue: true, message: error as string } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
  }
  return { state, dispatch, getCalendars, createCalendar, removeCalendar }
}