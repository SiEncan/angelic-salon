import NavigationBar from "../NavigationBar"

const SkeletonLoading = () => {
  return (
    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
      <NavigationBar />
      <div className="max-w-screen-2xl mx-auto px-4 py-8">
        <div className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-br from-purple-400 to-pink-200 bg-clip-text text-transparent">
          Customer Profile
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Skeleton Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-1 animate-pulse">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-purple-200 rounded-full mb-4" />
              <SkeletonLine width="w-32" className="mb-2" />
              <SkeletonLine width="w-40" className="mb-4" />
              <SkeletonLine width="w-28 h-6 rounded-full" />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-purple-100 rounded-full" />
                <div className="flex-1 space-y-1">
                  <SkeletonLine width="w-24" height="h-3" />
                  <SkeletonLine width="w-32" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-purple-100 rounded-full" />
                <div className="flex-1 space-y-1">
                  <SkeletonLine width="w-24" height="h-3" />
                  <SkeletonLine width="w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Skeleton Rank Progress and Benefits */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 animate-pulse">
            <SkeletonLine width="w-48" height="h-6" className="mb-6" />
            <SkeletonLine width="w-full" height="h-4" className="mb-4" />
            <SkeletonLine width="w-full" height="h-4" className="mb-4" />
            <SkeletonLine width="w-full" height="h-4" className="mb-4" />
            <SkeletonLine width="w-full" height="h-4" className="mb-4" />
            <SkeletonLine width="w-full" height="h-4" />
          </div>

          {/* Skeleton Active Bookings */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3 animate-pulse">
            <SkeletonLine width="w-40" height="h-5" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 rounded-md sm:grid-cols-2 md:grid-cols-5 gap-4 p-3 border border-gray-100 shadow-sm"
                >
                  <SkeletonLine className="w-full max-w-[160px]" />
                  <SkeletonLine className="w-full max-w-[120px]" />
                  <SkeletonLine className="w-full max-w-[120px]" />
                  <SkeletonLine className="w-full max-w-[100px]" />
                  <SkeletonLine className="w-full max-w-[120px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton Booking History */}
          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3 animate-pulse">
            <SkeletonLine width="w-40" height="h-5" className="mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 rounded-md sm:grid-cols-2 md:grid-cols-5 gap-4 p-3 border border-gray-100 shadow-sm"
                >
                  <SkeletonLine className="w-full max-w-[160px]" />
                  <SkeletonLine className="w-full max-w-[120px]" />
                  <SkeletonLine className="w-full max-w-[120px]" />
                  <SkeletonLine className="w-full max-w-[100px]" />
                  <SkeletonLine className="w-full max-w-[120px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SkeletonLine = ({ width = "w-full", height = "h-4", className = "" }) => (
  <div className={`bg-gray-200 rounded ${width} ${height} ${className} animate-pulse`} />
)

export default SkeletonLoading
