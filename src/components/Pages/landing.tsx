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
          Welcome to <br /> CalenShare
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto text-pretty">
          Join thousands of users who trust us to deliver exceptional experiences. Get started today and discover
          what makes us different.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SignInButton >
            <button className="w-full rounded-2xl border border-white bg-purple-700 hvoer:scale-125 hover:bg-purple-500 text-white sm:w-auto px-7 py-3 text-lg font-semibold">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton >
            <button className="w-full rounded-2xl border border-purple-700 hover:bg-purple-500 hover:text-white  sm:w-auto px-7 py-3 text-lg font-semibold">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </div>
    </div >
  )
}