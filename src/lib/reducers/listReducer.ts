import { CalendarListState, ListActionType, initialListState } from "../exports/states/states"

export default function ListReducer(state: CalendarListState, action: ListActionType) {
  const { type } = action

  switch (type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          isLoading: action.payload.loadingValue,
          loadingMsg: action.payload.loadingValue && action.payload.message ? action.payload.message : "Loading"
        }
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: {
          isError: action.payload.errorValue,
          errorMessage: action.payload.errorValue && action.payload.message ? action.payload.message : ""
        }
      }
    case 'RESET_ERROR':
      return {
        ...state,
        error: initialListState.error
      }
    case 'SET_UI':
      return {
        ...state,
        ui: {
          ...state.ui,
          [action.payload.ui]: action.payload.value
        }
      }
    case 'SET_CALENDAR':
      return {
        ...state,
        calendars: action.payload
      }
    default:
      return state
  }
}