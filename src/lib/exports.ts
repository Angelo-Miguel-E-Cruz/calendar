export function generateID(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export interface Event {
  id: number
  title: string
  start: Date | string
  allDay: boolean
}

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

export interface Error {
  isError: boolean
  errorMessage: string
}

export interface Calendar {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CalendarMember {
  id: string
  calendar_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface DatabaseEvent {
  id: string
  calendar_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CalendarWithMembers extends Calendar {
  calendar_members: (CalendarMember & {
    users: {
      email: string
      first_name: string
      last_name: string
    }
  })[]
}

export interface CalendarWithRole extends Calendar {
  calendar_members: { role: string }[]
}