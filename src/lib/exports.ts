export function generateID(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export interface Event {
  id: number
  title: string
  start: Date | string
  allDay: boolean
}

export interface Error {
  isError: boolean
  errorMessage: string
}

export interface Calendar {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface CalendarMember {
  id: string
  calendar_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface DatabaseEvent {
  id: string
  calendar_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CalendarWithMembers extends Calendar {
  calendar_members: (CalendarMember & {
    users: {
      email: string
      first_name: string
      last_name: string
    }
  })[]
}

export interface CalendarWithRole extends Calendar {
  calendar_members: { role: string }[]
}