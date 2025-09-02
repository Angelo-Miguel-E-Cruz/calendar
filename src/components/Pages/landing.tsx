import {
  SignInButton,
  SignUpButton
} from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        {/* Welcome Message */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance
        bg-linear-to-br from-purple-400 via-purple-600 to-slate-700 bg-clip-text text-transparent">
          Welcome to CalenShare
        </h1>
        <h2 className="text-3xl md:text-4xl font-semibold text-white mb-20 text-balance">
          Share Your Calendar
          <span className="block text-purple-400">Effortlessly</span>
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SignInButton >
            <button className="w-full rounded bg-purple-600 hover:scale-105 hover:bg-purple-700 text-white sm:w-auto px-7 py-3 text-lg font-semibold transition-all duration-75">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton >
            <button className="w-full rounded border text-white border-gray-300 hover:scale-105 hover:bg-white/10 sm:w-auto px-7 py-3 text-lg font-semibold transition-all duration-75">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </div >
  )
}