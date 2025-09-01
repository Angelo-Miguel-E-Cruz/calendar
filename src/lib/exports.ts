export function generateID(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export interface DatabaseEvent {
  id: string // need in fc
  calendar_id: string
  title: string // need in fc
  description?: string
  start_time: string // need in fc
  end_time?: string
  allDay: boolean // need in fc
  created_by: string
  created_at: string
  updated_at: string
}

export interface NewEvent {
  title: string
  description: string | null
  start_time: string
  end_time: string | null
  allDay: boolean
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

export interface Error {
  isError: boolean
  errorMessage: string
}