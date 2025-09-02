
import { PlusIcon, CalendarDateRangeIcon } from "@heroicons/react/20/solid"

interface FallbackProps {
  openModal: () => void
}

export default function Fallback({ openModal }: FallbackProps) {
  return (
    <div className="md:col-span-2 flex flex-col items-center justify-center px-4">
      <button className="relative mb-8 cursor-pointer" onClick={openModal}>
        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <CalendarDateRangeIcon className="h-12 w-12 text-purple-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <PlusIcon className="h-4 w-4 text-white" />
        </div>
      </button>

      <h3 className="text-2xl font-bold text-foreground mb-3 text-balance text-gray-300">No calendars found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-8 text-balance leading-relaxed text-gray-300">
        Get started by creating your first calendar or asking your friend to invite you to join their
        calendar!
      </p>

      <button className="bg-purple-600 hover:bg-purple-700 px-6 text-white text-lg font-semibold rounded flex p-3 cursor-pointer" onClick={openModal}>
        <PlusIcon className="h-6 w-6 mr-2 place-self-center" />
        Create Your First Calendar
      </button>
    </div>
  )
}