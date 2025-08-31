import { Calendar, Error, Event } from "@/lib/exports"

// List States
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

// Calendar States

export interface AppState {
  allEvents: Event[],
  newEvent: Event,
  deleteId: number | null,
  modals: {
    showModal: boolean,
    showDeleteModal: boolean
  },
}

export const initialState: AppState = {
  allEvents: [],
  newEvent: {
    id: 0,
    title: '',
    start: '',
    allDay: false
  },
  deleteId: null,
  modals: {
    showModal: false,
    showDeleteModal: false
  }
}

export type ActionType =
  | { type: 'ADD_EVENT', payload: Event }
  | { type: 'REMOVE_EVENT', payload: number | null }
  | { type: 'TOGGLE_MODAL', payload: { modal: keyof AppState['modals'], isOpen: boolean } }
  | { type: 'SET_PROPERTY', payload: { type: keyof AppState, value: number | Event } }
  | { type: 'SET_NEW_EVENT', payload: Partial<Event> }
  | { type: 'RESET_PROPERTY', payload: keyof AppState }