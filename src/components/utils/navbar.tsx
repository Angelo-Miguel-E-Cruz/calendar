'use client'
import {
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { ToggleThemeSwitcher } from './themeSwitcher'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const navToHome = () => {
    console.log(1)
    router.push(`/`)
  }

  const titleStyle = {
    color: 'var(--text-primary)',
  }

  return (
    <nav className="flex mb-12 border-b border-b-violet-100 p-4">
      <SignedOut>
        <div className='flex justify-start w-full'>
          <button className='cursor-pointer' onClick={() => navToHome()}>
            <h1 style={titleStyle} className="font-bold text-2xl">Calen
              <span className='text-purple-700'>Share</span>
            </h1>
          </button>
          <div className='ml-auto'>
            <ToggleThemeSwitcher />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <div className='flex gap-3 w-full'>
          <button className='cursor-pointer' onClick={() => navToHome()}>
            <h1 style={titleStyle} className="font-bold text-2xl">Calen
              <span className='text-purple-700'>Share</span>
            </h1>
          </button>
          <div className='ml-auto flex gap-3'>
            <ToggleThemeSwitcher />
            <UserButton />
          </div>
        </div>
      </SignedIn>
    </nav>
  )
}