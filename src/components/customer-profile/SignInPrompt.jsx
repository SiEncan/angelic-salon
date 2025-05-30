import NavigationBar from "../NavigationBar"

const SignInPrompt = () => {
  return (
    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        <NavigationBar />
        <div className="flex flex-col justify-center items-center h-[70vh] px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-4">Please Sign In</h2>
          <p className="text-gray-700 text-center mb-6">You need to be signed in to view your profile.</p>
          <button
            className="bg-[#171A31] hover:bg-opacity-80 transition duration-200 font-semibold shadow-lg rounded-lg px-5 py-3 text-white"
            onClick={() => (window.location.href = "/login")}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignInPrompt
