import { useReducer } from "react"
import Reducer from "../reducers/reducer"
import { initialState } from "../states/states"

export function useCalendarState() {

  const [state, dispatch] = useReducer(Reducer, initialState)

  return { state, dispatch }
}