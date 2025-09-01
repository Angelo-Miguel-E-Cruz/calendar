export function generateID(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export function formatDate(input: string | Date, allDay?: boolean): string {
  var date: Date

  if (input instanceof Date) {
    date = input
  } else if (/^\d{2}:\d{2}$/.test(input)) {
    // case: "HH:mm"
    const [hours, minutes] = input.split(":").map(Number)
    const now = new Date()
    date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    )
  } else {
    date = new Date(input)
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date input: " + input)
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  if (allDay) {
    return `${year}-${month}-${day}`
  } else {
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
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