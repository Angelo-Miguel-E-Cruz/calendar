"use client"

import { CalendarContext } from "@/lib/contexts/calendarContext";
import { useState } from "react";

export default function CalendarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [calendarName, setCalendarName] = useState<string>("");

  console.log("CalendarProvider rendering with value:", { calendarName, setCalendarName });
  return (
    <CalendarContext.Provider value={{ calendarName, setCalendarName }}>
      {children}
    </CalendarContext.Provider>
  );
}