'use client'
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { ArrowLeftIcon, UsersIcon } from '@heroicons/react/20/solid'
import { useCalendarContext } from '@/lib/contexts/calendarContext'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { calendarName } = useCalendarContext()

  const navToHome = () => {
    router.push(`/`)
  }

  const isCalendarIdPage = pathname.startsWith("/calendar/") && pathname.split("/").length > 0

  return (
    <nav className="flex mb-8 border-b border-b-violet-100 p-4">
      <SignedOut>
        <div className='flex justify-start w-full'>
          <button className='cursor-pointer' onClick={() => navToHome()}>
            <h1 className="font-bold text-2xl text-gray-300">Calen
              <span className='text-purple-700'>Share</span>
            </h1>
          </button>
        </div>
      </SignedOut>
      <SignedIn>
        {!isCalendarIdPage ?
          (<div className='flex gap-3 w-full'>
            <button className='cursor-pointer' onClick={() => navToHome()}>
              <h1 className="font-bold text-2xl text-gray-300">Calen
                <span className='text-purple-700'>Share</span>
              </h1>
            </button>
            <div className='ml-auto flex gap-3'>
              <UserButton />
            </div>
          </div>
          ) : (
            <>
              <div className="flex items-center justify-between w-full">

                <div className="flex items-center gap-4">
                  <button className="btn-edit-calendar" onClick={() => navToHome()}>
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        {calendarName}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex items-center bg-purple-600 hover:bg-purple-700 text-white gap-2 py-1 px-2 rounded">
                    <UsersIcon className="h-4 w-4" />
                    Invite
                  </button>

                  <UserButton />
                </div>
              </div>
            </>
          )}
      </SignedIn>
    </nav >
  )
}