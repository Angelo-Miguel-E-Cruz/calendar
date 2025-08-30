'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { CalendarWithRole } from '@/lib/exports'

export default function Dashboard() {
  const [calendars, setCalendars] = useState<CalendarWithRole[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const { user } = useUser()

  useEffect(() => {
    fetchCalendars()
  }, [])

  const fetchCalendars = async (): Promise<void> => {
    try {
      const response = await fetch('/api/calendars')
      const data: { calendars: CalendarWithRole[] } = await response.json()
      setCalendars(data.calendars || [])
    } catch (error) {
      console.error('Error fetching calendars:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCalendar = async (name: string, description?: string): Promise<void> => {
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      })

      if (response.ok) {
        fetchCalendars()
      }
    } catch (error) {
      console.error('Error creating calendar:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1>My Calendars</h1>
      <button
        onClick={() => {/* Open create modal */ }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Calendar
      </button>

      <div className="grid gap-4 mt-4">
        {calendars.map((calendar) => (
          <div key={calendar.id} className="border p-4 rounded">
            <h3>{calendar.name}</h3>
            <p>{calendar.description}</p>
            <a href={`/calendar/${calendar.id}`}>View Calendar</a>
          </div>
        ))}
      </div>
    </div>
  )
}