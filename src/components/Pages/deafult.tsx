'use client'
import { useEffect, useReducer } from 'react'
import { Calendar, Error } from '@/lib/exports'
import AddCalendar from '../modals/addCalendarModal'
import Loading from '../utils/loading'
import { PencilSquareIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid"
import { initialListState } from '@/lib/states/states'
import ListReducer from '@/lib/reducers/listReducer'

export default function Default() {

  const [state, dispatch] = useReducer(ListReducer, initialListState)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;

    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  }

  // use custom hook ?
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
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { errorValue: true, message: error as string } })
    } finally {
      getCalendars()
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
  }

  const removeCalendar = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: { loadingValue: true, message: "Removing Calendar" } })
    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: 'DELETE'
      })
      getCalendars()
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { errorValue: true, message: error as string } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loadingValue: false } })
    }
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
    <div className="flex justify-center flex-col p-4">
      <div className='max-w-[1000px] w-full'>

      </div>
      <h1 className="text-center text-4xl font-bold mb-8"> Calendars</h1>

      <div className="flex justify-end-safe mb-8 gap-2">
        <button className={`p-2 rounded  text-white ${state.ui.isEditMode ? "bg-red-500 hover:bg-red-600" : "hover:bg-gray-300 dark:hover:bg-gray-700"}`}
          onClick={() => dispatch({ type: 'SET_UI', payload: { ui: 'isEditMode', value: !state.ui.isEditMode } })}>
          {!state.ui.isEditMode ?
            <PencilSquareIcon className="h-8 w-8 text-purple-600" />
            : <XMarkIcon className='h-8 w-8' />}
        </button>
        <button className="btn-add-calendar"
          onClick={() => dispatch({ type: 'SET_UI', payload: { ui: 'addCalendar', value: true } })}>
          <span className="text-lg"><PlusIcon className="h-6 w-6" /></span>
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center-safe gap-4 mx-auto">
        {
          state.calendars.map((calendar) => {
            return (
              <div className="calendar-card" key={calendar.id}>
                <div className='p-4 flex-1'>

                  <h2 className="text-lg font-bold">{calendar.name}</h2>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-200">
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
          })
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