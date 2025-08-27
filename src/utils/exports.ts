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