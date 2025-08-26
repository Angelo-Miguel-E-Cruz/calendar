export function generateID(): number {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export interface Event {
  id: number
  title: string
  start: Date | string
  allDay: boolean
}