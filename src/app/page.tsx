"use client"

import { Draggable, DropArg } from "@fullcalendar/interaction"
import { useEffect, useReducer, useState } from "react";
import { generateID } from "@/utils/exports";
import Calendar from "@/components/calendar";
import AddEvent from "@/components/Modals/addEventModal";
import DeleteEvent from "@/components/Modals/deleteEventModal";
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

      <DeleteEvent
        isOpen={state.modals.showDeleteModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })}
        handleSubmit={handleDelete}
        onCancel={handleCloseModal} />

      <AddEvent
        isOpen={state.modals.showModal}
        onClose={() => dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showModal', isOpen: false } })}
        eventTitle={state.newEvent.title}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        onCancel={handleCloseModal} />
    </main>
  );
}
