"use client"

import { Draggable, DropArg } from "@fullcalendar/interaction"
import { useEffect, useReducer, useState } from "react";
import { generateID, initialState } from "@/utils/exports";
import Calendar from "@/components/calendar";
import AddEvent from "@/components/Modals/addEventModal";
import DeleteEvent from "@/components/Modals/deleteEventModal";
import { Event } from "@/utils/exports";
import Reducer from "@/utils/reducer";

export default function Home() {

  // custom hook for business logic
  const useCalendarEvents = () => {

    const [state, dispatch] = useReducer(Reducer, initialState)

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


    const handleDelete = () => {
      dispatch({ type: 'REMOVE_EVENT', payload: state.deleteId })
      dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: false } })
      dispatch({ type: 'RESET_PROPERTY', payload: 'deleteId' })
    }

    return { state, dispatch, addEvent, handleDelete }
  }

  const { state, dispatch, addEvent, handleDelete } = useCalendarEvents()

  // sample data
  const [events, setEvents] = useState<Event[]>([
    { title: 'event 1', id: 1, start: "today", allDay: true },
    { title: 'event 2', id: 2, start: "today", allDay: false },
    { title: 'event 3', id: 3, start: "tomorrow", allDay: true },
    { title: 'event 4', id: 4, start: "tomorrow", allDay: false },
  ])

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

  // ui functions

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

  const handleDeleteModal = (data: { event: { id: string } }) => {
    dispatch({ type: 'TOGGLE_MODAL', payload: { modal: 'showDeleteModal', isOpen: true } })
    dispatch({ type: 'SET_PROPERTY', payload: { type: 'deleteId', value: Number(data.event.id) } })
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
          handleDeleteModal={handleDeleteModal}
          addEvent={addEvent}
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
        onCancel={handleCloseModal}
        handleDelete={handleDelete} />

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
