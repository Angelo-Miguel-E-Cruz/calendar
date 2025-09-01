import { AppState, ActionType, initialState } from "../states/states"


export default function Reducer(state: AppState, action: ActionType) {
  const { type } = action

  switch (type) {
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
    case "ADD_DB_EVENT":
      return {
        ...state,
        dbEvents: [...state.dbEvents, action.payload]
      }
    case "UPDATE_DB_EVENT":
      return {
        ...state,
        dbEvents: state.dbEvents.map(e => e.id === action.payload.id ? action.payload.event : e)
      }
    case "REMOVE_DB_EVENT":
      return {
        ...state,
        dbEvents: state.dbEvents.filter(e => e.id !== action.payload)
      }
    default:
      return state
  }
}