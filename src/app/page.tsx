"use client"

import { DropArg } from "@fullcalendar/interaction"
import { useReducer } from "react";
import { generateID, initialState } from "@/utils/exports";
import Calendar from "@/components/calendar";
import AddEvent from "@/components/Modals/addEventModal";
import DeleteEvent from "@/components/Modals/deleteEventModal";
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
    <main className="flex p-4 row-start-2 items-center sm:items-start">
      <div className="w-full">
        <Calendar
          allEvents={state.allEvents}
          handleDateClick={handleDateClick}
          handleDeleteModal={handleDeleteModal}
          addEvent={addEvent}
        />
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
