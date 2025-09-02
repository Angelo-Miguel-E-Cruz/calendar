"use client"
import { createContext, useContext } from "react"

interface CalendarContextType {
  calendarName: string;
  setCalendarName: (name: string) => void;
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function useCalendarContext() {
  const context = useContext(CalendarContext)

  console.log("useCalendarContext called, context value:", context);
  if (!context) {
    throw new Error("useCalendarContext hook must be used with a CalendarContext")
  }


  return context
}