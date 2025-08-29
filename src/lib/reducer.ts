import { AppState, ActionType, initialState } from "./exports"

export default function Reducer(state: AppState, action: ActionType) {
  const { type } = action

  switch (type) {
    case 'ADD_EVENT':
      return {
        ...state,
        allEvents: [...state.allEvents, action.payload]
      }
    case 'REMOVE_EVENT':
      return {
        ...state,
        allEvents: state.allEvents.filter(events => events.id !== action.payload)
      }
    case 'TOGGLE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload.modal]: action.payload.isOpen
        }
      }
    case 'SET_PROPERTY':
      return {
        ...state,
        [action.payload.type]: action.payload.value
      }
    case 'RESET_PROPERTY':
      return {
        ...state,
        [action.payload]: initialState[action.payload]
      }
    case 'SET_NEW_EVENT':
      return {
        ...state,
        newEvent: {
          ...state.newEvent,
          ...action.payload
        }
      }
    default:
      return state
  }
}