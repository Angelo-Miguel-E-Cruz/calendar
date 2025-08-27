import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ToggleThemeSwitcher } from './themeSwitcher'

export default function Navbar() {
  return (
    <nav className="flex mb-12 border-b border-b-violet-100 p-4">
      <SignedOut>
        <div className='flex justify-start w-full'>
          <h1 className="font-bold text-2xl text-gray-700">Calen
            <span className='text-purple-700'>Share</span>
          </h1>
          <div className='ml-auto'>
            <span className="text-sm mr-3">
              Theme:
            </span>
            <ToggleThemeSwitcher />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className='flex gap-3 w-full'>
          <h1 className="font-bold text-2xl text-gray-700">Calen
            <span className='text-purple-700'>Share</span>
          </h1>
          <div className='ml-auto flex gap-3'>
            <span className="text-sm mr-3">
              Theme:
            </span>
            <ToggleThemeSwitcher />
            <UserButton />
          </div>
        </div>
      </SignedIn>
    </nav>
  )
}