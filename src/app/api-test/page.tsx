// app/api-test/page.tsx
'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'

export default function ApiTestPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  const addResult = (test: string, result: any, success: boolean) => {
    setResults(prev => [...prev, {
      test,
      result,
      success,
      timestamp: new Date().toISOString()
    }])
  }

  const clearResults = () => setResults([])

  const testGetCalendars = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/calendars')
      const data = await response.json()
      addResult('GET /api/calendars', { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('GET /api/calendars', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const testGetCalwithId = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calendars/aea9ba1d-9aec-478e-a120-0441d26d139c`)
      const data = await response.json()
      addResult('GET /api//id', { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('GET /api/calendars/id', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const testCreateCalendar = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Calendar ${Date.now()}`,
          description: 'Created from API test page'
        })
      })
      const data = await response.json()
      addResult('POST /api/calendars', { status: response.status, data }, response.ok)

      // Store calendar ID for other tests
      if (response.ok && data.calendar?.id) {
        window.lastCalendarId = data.calendar.id
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('POST /api/calendars', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const testRemoveCalendar = async () => {
    const calendarId = window.lastCalendarId
    if (!calendarId) {
      addResult('DELETE /api/calendars/[id]', { error: 'No calendar ID. Create a calendar first.' }, false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/calendars/${calendarId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      addResult(`DELETE /api/calendars/[id]`, { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('DELETE /api/calendars/[id]', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const testGetEvents = async () => {
    const calendarId = window.lastCalendarId
    if (!calendarId) {
      addResult('GET /api/calendars/[id]/events', { error: 'No calendar ID. Create a calendar first.' }, false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/calendars/${calendarId}/events`)
      const data = await response.json()
      addResult(`GET /api/calendars/${calendarId}/events`, { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('GET /api/calendars/[id]/events', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const testCreateEvent = async () => {
    const calendarId = window.lastCalendarId
    if (!calendarId) {
      addResult('POST /api/calendars/[id]/events', { error: 'No calendar ID. Create a calendar first.' }, false)
      return
    }

    setLoading(true)
    try {
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      const endTime = new Date(Date.now() + 25 * 60 * 60 * 1000)   // Tomorrow + 1hr

      const response = await fetch(`/api/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Test Event ${Date.now()}`,
          description: '',
          start_time: startTime.toISOString(),
          all_day: false
        })
      })
      const data = await response.json()
      if (response.ok && data.event?.id) {
        window.lastEventId = data.event.id
      }
      addResult(`POST /api/calendars/${calendarId}/events`, { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('POST /api/calendars/[id]/events', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }
  const testRemoveEvent = async () => {
    const calendarId = window.lastCalendarId
    const eventId = window.lastEventId
    if (!calendarId) {
      addResult('DELETE /api/calendars/[id]/events/[id]', { error: 'No calendar ID. Create a calendar first.' }, false)
      return
    }

    console.log(calendarId, eventId)

    setLoading(true)
    try {
      const response = await fetch(`/api/calendars/${calendarId}/events/${eventId}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      addResult(`DELETE /api/calendars/[id]/events/[id]`, { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('DELETE /api/calendars/[id]/events/[id]', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const testInviteUser = async () => {
    const calendarId = window.lastCalendarId
    if (!calendarId) {
      addResult('POST /api/calendars/[id]/members', { error: 'No calendar ID. Create a calendar first.' }, false)
      return
    }

    const email = prompt('Enter email to invite:')
    if (!email) return

    setLoading(true)
    try {
      const response = await fetch(`/api/calendars/${calendarId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      addResult(`POST /api/calendars/${calendarId}/members`, { status: response.status, data }, response.ok)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addResult('POST /api/calendars/[id]/members', { error: errorMessage }, false)
    } finally {
      setLoading(false)
    }
  }

  const runAllTests = async () => {
    clearResults()
    await testGetCalendars()
    await new Promise(resolve => setTimeout(resolve, 500)) // Small delay
    await testCreateCalendar()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testGetEvents()
    await new Promise(resolve => setTimeout(resolve, 500))
    await testCreateEvent()
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please sign in with Clerk to test the API endpoints.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Endpoint Tests</h1>

      <div className="mb-6 p-4 bg-blue-50 rounded text-black">
        <p><strong>Signed in as:</strong> {user.emailAddresses[0]?.emailAddress}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={testGetCalendars}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test GET Calendars
        </button>

        <button
          onClick={testGetCalwithId}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test GET  with ID
        </button>

        <button
          onClick={testCreateCalendar}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Create Calendar
        </button>

        <button
          onClick={testRemoveCalendar}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Remove Calendar
        </button>

        <button
          onClick={testGetEvents}
          disabled={loading}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test GET Events
        </button>

        <button
          onClick={testCreateEvent}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Create Event
        </button>

        <button
          onClick={testRemoveEvent}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Remove Event
        </button>

        <button
          onClick={testInviteUser}
          disabled={loading}
          className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50"
        >
          Test Invite User
        </button>

        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 disabled:opacity-50"
        >
          Run All Tests
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Test Results ({results.length})</h2>
        <button
          onClick={clearResults}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`border rounded p-4 ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-black">{result.test}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-1 rounded ${result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                  {result.success ? '✅ Success' : '❌ Failed'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-48 text-black">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        ))}
        {results.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No tests run yet. Click a test button above to start.
          </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Running test...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    lastCalendarId: string,
    lastEventId: string
  }
}