"use client"

import { Draggable, DropArg } from "@fullcalendar/interaction"
import { useEffect, useReducer, useState } from "react";
import { generateID } from "@/utils/exports";
import { DialogPanel, DialogTitle } from "@headlessui/react";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import Calendar from "@/components/Calendar";
import Modal from "@/components/Modals";
import { Event } from "@/utils/exports";

interface AppState {
  allEvents: Event[],
  newEvent: Event,
  deleteId: number | null,
  modals: {
    showModal: boolean,
    showDeleteModal: boolean
  },
}

const initialState: AppState = {
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

type ActionType =
  | { type: 'ADD_EVENT', payload: Event }
  | { type: 'REMOVE_EVENT', payload: number | null }

  | { type: 'TOGGLE_MODAL', payload: { modal: keyof AppState['modals'], isOpen: boolean } }

  | { type: 'SET_PROPERTY', payload: { type: keyof AppState, value: number | Event } }

  | { type: 'SET_NEW_EVENT', payload: Partial<Event> }

  | { type: 'RESET_PROPERTY', payload: keyof AppState }
function Reducer(state: AppState, action: ActionType) {
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
        [action.payload]: initialState
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

export default function Home() {

  // sample data
  const [events, setEvents] = useState<Event[]>([
    { title: 'event 1', id: 1, start: "today", allDay: true },
    { title: 'event 2', id: 2, start: "today", allDay: false },
    { title: 'event 3', id: 3, start: "tomorrow", allDay: true },
    { title: 'event 4', id: 4, start: "tomorrow", allDay: false },
  ])

  const [state, dispatch] = useReducer(Reducer, initialState)

  useEffect(() => {
    let draggableElement = document.getElementById('draggable-el')

    if (draggableElement) {
      new Draggable(draggableElement, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          let title = eventEl.getAttribute("title")
          let id = eventEl.getAttribute("data-id")
          let start = eventEl.getAttribute("data-start")
          return { title, id, start }
        }
      })
    }
  }, [])

  // functions

  const handleDateClick = (arg: { date: Date, allDay: boolean }) => {
    dispatch({
      type: 'SET_NEW_EVENT', payload: {
        id: generateID(),
        start: arg.date,
        allDay: arg.allDay
      }
    })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: true } })
  }

  const addEvent = (data: DropArg) => {
    const event = {
      ...state.newEvent,
      id: generateID(),
      title: data.draggedEl.innerText,
      start: data.date.toISOString(),
      allDay: data.allDay
    }
    dispatch({ type: 'ADD_EVENT', payload: event })
  }

  const handleDeleteModal = (data: { event: { id: string } }) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: true } })
    dispatch({ type: 'SET_PROPERTY', payload: { type: 'deleteId', value: Number(data.event.id) } })
  }

  const handleDelete = () => {
    dispatch({ type: 'REMOVE_EVENT', payload: state.deleteId })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })
    dispatch({ type: 'RESET_PROPERTY', payload: 'deleteId' })
  }

  const handleCloseModal = () => {
    dispatch({ type: 'SET_NEW_EVENT', payload: initialState.newEvent })
    dispatch({ type: 'RESET_PROPERTY', payload: 'deleteId' })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({
      type: 'SET_NEW_EVENT', payload: {
        title: e.target.value
      }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch({ type: 'ADD_EVENT', payload: state.newEvent })
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })
    dispatch({ type: 'RESET_PROPERTY', payload: 'newEvent' })
  }

  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      <div className="grid grid-cols-10">
        <Calendar
          allEvents={state.allEvents}
          handleDateClick={handleDateClick}
          addEvent={addEvent}
          handleDeleteModal={handleDeleteModal}
        />

        <div id="draggable-el" className="ml-8 w-full border-2 p-2 rounded-md mt-16 lg:h-1/2 bg-violet-50">
          <h1 className="font-bold text-lg text-center">Drag Event</h1>
          {events.map((event) => (
            <div
              key={event.id}
              className="fc-event border-2 p-1 m-2 w-full rounded-md ml-auto text-center bg-white cursor-pointer"
              title={event.title}
              data-id={event.id}
              data-start={event.start}>
              {event.title}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={state.modals.showDeleteModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })}>
        <DialogPanel className="relative transform overflow-hidden rounded-lg
                bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center 
                      justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                  Delete Event
                </DialogTitle>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete this event?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm 
                      font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" onClick={handleDelete}>
              Delete
            </button>
            <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 
                      shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
          </div>
        </DialogPanel>
      </Modal>

      <Modal
        isOpen={state.modals.showModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })}>
        <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                Add Event
              </DialogTitle>
              <form action="submit" onSubmit={handleSubmit}>
                <div className="mt-2">
                  <input type="text" name="title" className="block w-full rounded-md border-0 py-1.5 text-gray-900 
                            shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                            focus:ring-2 
                            focus:ring-inset focus:ring-violet-600 
                            sm:text-sm sm:leading-6"
                    value={state.newEvent.title ?? ""} onChange={(e) => handleChange(e)} placeholder="Title" />
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:col-start-2 disabled:opacity-25"
                    disabled={state.newEvent.title === ''}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </DialogPanel>
      </Modal>
    </main>
  );
}
