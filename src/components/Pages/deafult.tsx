'use client'
import { useEffect, useState } from 'react'
import { Calendar, Error } from '@/lib/exports'
import AddCalendar from '../modals/addCalendarModal'
import Loading from '../utils/loading'
import { PencilSquareIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";

export default function Default() {

  // use useReducer ?
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("Loading") // combine w loading state in useReducer
  const [error, setError] = useState<Error>({
    isError: false,
    errorMessage: ""
  })
  const [addCalendar, setAddCalendar] = useState(false)
  const [newCalendarName, setNewCalendarName] = useState("")
  const [isEditMode, setIsEditMode] = useState(false)

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
    setCalendars(newCalendars)
  }

  const getCalendars = async () => {
    setLoadingMessage("Fetching Calendars")
    setLoading(true)
    try {
      const response = await fetch('/api/calendars')
      const data: { calendars: Calendar[] } = await response.json()
      loadCalendars(data.calendars)
    } catch (error) {
      setError({
        isError: true,
        errorMessage: error as string
      })
    } finally {
      setLoading(false)
    }
  }

  const createCalendar = async () => {
    setLoadingMessage("Creating Calendar")
    setLoading(true)
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCalendarName,
          //description: 'Created from API test page' -> handle this
        })
      })
      const data = await response.json()
    } catch (error) {
      setError({
        isError: true,
        errorMessage: error as string
      })
    } finally {
      getCalendars()
      setLoading(false)
    }
  }

  const removeCalendar = async (id: string) => {
    setLoadingMessage("Removing Calendar")
    setLoading(true)
    try {
      const response = await fetch(`/api/calendars/${id}`, {
        method: 'DELETE'
      })
      getCalendars()
    } catch (error) {
      setError({
        isError: true,
        errorMessage: error as string
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewCalendarName(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    createCalendar()
    handleCloseModal()
  }

  const handleCloseModal = () => {
    setAddCalendar(false)
    setNewCalendarName("")
  }

  useEffect(() => {
    getCalendars()
  }, [])

  if (error.isError)
    console.error(error.errorMessage)


  return (
    <div className="flex justify-center flex-col p-4">
      <div className='max-w-[1000px] w-full'>

      </div>
      <h1 className="text-center text-4xl font-bold mb-8"> Calendars</h1>

      <div className="flex justify-end-safe mb-8 gap-2">
        <button className={`p-2 rounded  text-white ${isEditMode ? "bg-red-500 hover:bg-red-600" : "hover:bg-gray-300 dark:hover:bg-gray-700"}`}
          onClick={() => setIsEditMode(!isEditMode)}>
          {!isEditMode ?
            <PencilSquareIcon className="h-8 w-8 text-purple-600" />
            : <XMarkIcon className='h-8 w-8' />}
        </button>
        <button className="btn-add-calendar"
          onClick={() => setAddCalendar(true)}>
          <span className="text-lg"><PlusIcon className="h-6 w-6" /></span>
          Create
        </button>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 justify-items-center-safe gap-4 mx-auto">
        {
          calendars.map((calendar) => {
            return (
              <div className="calendar-card" key={calendar.id}>
                <div className='p-4 flex-1'>

                  <h2 className="text-lg font-bold">{calendar.name}</h2>

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-200">
                    Last update:
                    <span className='font-semibold'>{formatDateTime(calendar.updated_at)} </span>
                  </div>

                </div>
                {isEditMode && (
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


      {loading && (<Loading loadingMessage={loadingMessage} />)}

      <AddCalendar
        isOpen={addCalendar}
        onClose={() => setAddCalendar(false)}
        calendarTitle={newCalendarName}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        onCancel={handleCloseModal}
      />
    </div>
  )
}