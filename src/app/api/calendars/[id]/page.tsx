'use client'
import { useEffect, useState } from 'react'
import { DatabaseEvent, Event, CalendarWithMembers } from '@/lib/exports'
import { createServerClient } from '@/lib/supabase/client'
import { databaseEventToCalendarEvent } from '@/lib/event-transformer'
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from "@fullcalendar/interaction"
import { EventSourceInput } from '@fullcalendar/core/index.js'

const supabase = createServerClient()

interface CalendarViewProps {
  params: {
    id: string
  }
}

export default function CalendarView({ params }: CalendarViewProps) {
  const [databaseEvents, setDatabaseEvents] = useState<DatabaseEvent[]>([])
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([])
  const [calendar, setCalendar] = useState<CalendarWithMembers | null>(null)

  useEffect(() => {
    fetchCalendar()
    fetchEvents()

    const cleanup = setupRealtimeSubscription()
    return cleanup
  }, [params.id])

  useEffect(() => {
    const transformed = databaseEvents.map(databaseEventToCalendarEvent)
    setCalendarEvents(transformed)
  }, [databaseEvents])

  const fetchCalendar = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/calendars/${params.id}`)
      const data: { calendar: CalendarWithMembers } = await response.json()
      setCalendar(data.calendar)
    } catch (error) {
      console.error('Error fetching calendar:', error)
    }
  }

  const fetchEvents = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/calendars/${params.id}/events`)
      const data: { events: DatabaseEvent[] } = await response.json()
      setDatabaseEvents(data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`calendar-${params.id}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `calendar_id=eq.${params.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDatabaseEvents(prev => [...prev, payload.new as DatabaseEvent])
          } else if (payload.eventType === 'UPDATE') {
            setDatabaseEvents(prev => prev.map(e =>
              e.id === (payload.new as DatabaseEvent).id ? payload.new as DatabaseEvent : e
            ))
          } else if (payload.eventType === 'DELETE') {
            setDatabaseEvents(prev => prev.filter(e => e.id !== (payload.old as DatabaseEvent).id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }

  return (
    <div className="p-6">
      <h1>{calendar?.name}</h1>

      {/* Pass calendarEvents to FullCalendar - it will only use id, title, start, allDay */}
      <FullCalendar
        events={calendarEvents as EventSourceInput}
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin
        ]}
        headerToolbar={{
          start: 'dayGridMonth,timeGridWeek,timeGridDay',
          center: 'title',
          end: 'today prevYear,prev,next,nextYear'
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day'
        }}
        allDaySlot={false}
        nowIndicator={true}
        editable={true}
        droppable={true}
        selectable={true}
        selectMirror={true}
      // ... other FullCalendar props
      />

      <div className="space-y-2">
        {databaseEvents.map((event) => (
          <div key={event.id} className="border p-3 rounded">
            <h3>{event.title}</h3>
            {event.description && <p>{event.description}</p>}
            <p>Start: {new Date(event.start_time).toLocaleString()}</p>
            <p>End: {new Date(event.end_time).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
