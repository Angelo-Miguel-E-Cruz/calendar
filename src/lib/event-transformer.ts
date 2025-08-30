// utils/event-transformers.ts
import { DatabaseEvent, Event } from '@/lib/exports'

export function databaseEventToCalendarEvent(dbEvent: DatabaseEvent): Event {
  return {
    id: parseInt(dbEvent.id) || Math.random(),
    title: dbEvent.title,
    start: dbEvent.start_time,
    allDay: false
  }
}

export function calendarEventToDatabase(
  calendarEvent: Partial<Event> & { title: string; start: string | Date },
  calendarId: string,
  userId: string,
  endTime?: string | Date,
  description?: string
): Omit<DatabaseEvent, 'id' | 'created_at' | 'updated_at'> {
  const startTime = typeof calendarEvent.start === 'string'
    ? calendarEvent.start
    : calendarEvent.start.toISOString()

  const endTimeFormatted = endTime
    ? (typeof endTime === 'string' ? endTime : endTime.toISOString())
    : startTime

  return {
    calendar_id: calendarId,
    title: calendarEvent.title,
    description: description || '',
    start_time: startTime,
    end_time: endTimeFormatted,
    created_by: userId,
  }
}