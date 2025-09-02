"use client"

import { CalendarContext } from "@/lib/contexts/calendarContext";
import { useState } from "react";

export default function CalendarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [calendarName, setCalendarName] = useState<string>("")
  const [calendarId, setCalendarId] = useState<string>("")

  return (
    <CalendarContext.Provider value={{ calendarName, setCalendarName, calendarId, setCalendarId }}>
      {children}
    </CalendarContext.Provider>
  );
}