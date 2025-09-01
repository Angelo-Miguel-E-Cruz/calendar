import { Calendar, CalendarWithMembers, DatabaseEvent, NewEvent, Error } from "@/lib/exports"

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
  | { type: 'ADD_CALENDAR', payload: Calendar }
  | { type: 'REMOVE_CALENDAR', payload: string }

// Calendar States

export interface AppState {
  newEvent: NewEvent,
  deleteId: string | null,
  loading: {
    isLoading: boolean
    loadingMsg: string
  }
  modals: {
    showModal: boolean,
    showDeleteModal: boolean
  },
  dbEvents: DatabaseEvent[],
  calendar: CalendarWithMembers | null
}

export const initialState: AppState = {
  newEvent: {
    title: '',
    description: null,
    start_time: '',
    end_time: null,
    allDay: true
  },
  deleteId: null,
  loading: {
    isLoading: false,
    loadingMsg: "Loading"
  },
  modals: {
    showModal: false,
    showDeleteModal: false
  },
  dbEvents: [],
  calendar: null
}

export type ActionType =

  // Events
  | { type: 'ADD_DB_EVENT', payload: DatabaseEvent }
  | { type: 'UPDATE_DB_EVENT', payload: { id: string, event: DatabaseEvent } }
  | { type: 'REMOVE_DB_EVENT', payload: string | null }

  // UI
  | { type: 'TOGGLE_MODAL', payload: { modal: keyof AppState['modals'], isOpen: boolean } }
  | { type: 'SET_NEW_EVENT', payload: Partial<NewEvent> }

  // Util
  | { type: 'SET_PROPERTY', payload: { type: keyof AppState, value: string | DatabaseEvent[] | CalendarWithMembers | null } }
  | { type: 'RESET_PROPERTY', payload: keyof AppState }
  | { type: 'SET_LOADING', payload: { loadingValue: boolean, message?: string } }