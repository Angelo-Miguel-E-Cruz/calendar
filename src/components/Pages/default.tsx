'use client'
import { useEffect, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/lib/exports'
import AddCalendar from '../modals/addCalendarModal'
import Loading from '../utils/loading'
import { PencilSquareIcon, PlusIcon, XMarkIcon, ClockIcon } from "@heroicons/react/20/solid"
import { initialListState } from '@/lib/states/states'
import ListReducer from '@/lib/reducers/listReducer'
import Fallback from './noCalendars'

// custom hook for business logic
const useListFunctions = () => {
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

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)

  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()

  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12 || 12

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`
}

export default function Default() {

  const router = useRouter()

  const { state, dispatch, getCalendars, createCalendar, removeCalendar } = useListFunctions()

  // add prefetching
  const navToCalendar = (calendarId: string) => {
    router.push(`/calendar/${calendarId}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ type: 'SET_UI', payload: { ui: 'newCalendarName', value: e.target.value } })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createCalendar()
    handleCloseModal()
  }

  const handleCloseModal = () => {
    dispatch({ type: 'SET_UI', payload: { ui: 'addCalendar', value: false } })
    dispatch({ type: 'SET_UI', payload: { ui: 'newCalendarName', value: "" } })
  }

  useEffect(() => {
    getCalendars()
  }, [])

  if (state.error.isError)
    console.error(state.error.errorMessage)

  return (
    <div className="flex justify-center flex-col px-20">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-300">Calendars</h1>{
          state.calendars.length > 0 ? (
            <div className="flex items-center gap-3">

              <button className={`${!state.ui.isEditMode ? "btn-edit-calendar" : "btn-remove-calendar"}`}
                onClick={() => dispatch({ type: 'SET_UI', payload: { ui: 'isEditMode', value: !state.ui.isEditMode } })}>
                {state.ui.isEditMode ? (
                  <>
                    <XMarkIcon className="h-4 w-4" />
                    <span className="text-md">Delete</span>
                  </>
                ) : (
                  <>
                    <PencilSquareIcon className="h-4 w-4" />
                    <span className="text-md">Edit</span>
                  </>
                )}
              </button>

              <button
                className="btn-add-calendar"
                onClick={() =>
                  dispatch({
                    type: "SET_UI",
                    payload: { ui: "addCalendar", value: true },
                  })
                }
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-md">Create</span>
              </button>
            </div>
          ) : (
            <></>
          )
        }
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto w-full">
        {!state.loading.isLoading &&
          state.calendars.length > 0 ? (
          state.calendars.map((calendar) => {
            return (
              <div className="group calendar-card"
                key={calendar.id}
                onClick={() => !state.ui.isEditMode && navToCalendar(calendar.id)}>
                <div className='p-4 flex-1'>

                  <h2 className="font-semibold text-lg text-card-foreground group-hover:text-purple-400 transition-colors">{calendar.name}</h2>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-200">
                    <span> <ClockIcon className='h-4 w-4' /> </span>
                    Last update:
                    <span className='font-semibold'>{formatDateTime(calendar.updated_at)} </span>
                  </div>

                </div>
                {state.ui.isEditMode && (
                  <button
                    className="bg-red-500 text-white w-8 h-full flex items-center justify-center rounded-r text-4xl"
                    onClick={() => removeCalendar(calendar.id)}>
                    <XMarkIcon className='h-8 w-8' />
                  </button>
                )}
              </div>
            )
          })) : (
          <Fallback openModal={() => dispatch({ type: 'SET_UI', payload: { ui: 'addCalendar', value: true } })} />
        )
        }
      </div>

      {state.loading.isLoading && (<Loading loadingMessage={state.loading.loadingMsg} />)}

      <AddCalendar
        isOpen={state.ui.addCalendar}
        onClose={() => dispatch({ type: 'SET_UI', payload: { ui: 'addCalendar', value: false } })}
        calendarTitle={state.ui.newCalendarName}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        onCancel={handleCloseModal}
      />
    </div>
  )
}