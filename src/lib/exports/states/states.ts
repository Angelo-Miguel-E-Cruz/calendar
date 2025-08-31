import { Calendar, Error } from "@/lib/exports"

export interface CalendarListState {
  calendars: Calendar[]
  loading: {
    isLoading: boolean
    loadingMsg: string
  }
  error: Error
  ui: {
    addCalendar: boolean
    isEditMode: boolean
    newCalendarName: string
  }
}

export const initialListState: CalendarListState = {
  calendars: [],
  loading: {
    isLoading: false,
    loadingMsg: "Loading"
  },
  error: {
    isError: false,
    errorMessage: ""
  },
  ui: {
    addCalendar: false,
    isEditMode: false,
    newCalendarName: ""
  }
}

export type ListActionType =
  | { type: 'SET_LOADING', payload: { loadingValue: boolean, message?: string } }

  | { type: 'SET_ERROR', payload: { errorValue: boolean, message?: string } }
  | { type: 'RESET_ERROR' }

  | { type: 'SET_UI', payload: { ui: keyof CalendarListState['ui'], value: boolean | string } }

  | { type: 'SET_CALENDAR', payload: Calendar[] }