interface LoadingProp {
  loadingMessage: string
}

export default function Loading({ loadingMessage }: LoadingProp) {
  return (
    <div className="fixed inset-0 bg-black opacity-80 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-black">{loadingMessage}...</p>
      </div>
    </div>
  )
}