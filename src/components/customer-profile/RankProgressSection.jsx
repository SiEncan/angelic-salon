import { Calendar } from 'lucide-react'

const RankProgressSection = ({ rank, bookingCount, setIsBookingOpen }) => {
  const rankClasses = {
    Bronze: "bg-amber-600 text-gray-900",
    Silver: "bg-gray-300 text-gray-700",
    Gold: "bg-yellow-300 text-yellow-700",
    Platinum: "bg-blue-200 text-blue-700",
    Diamond:
      "bg-gradient-to-r from-green-400 to-blue-500 text-white border-2 border-white shadow-lg transform scale-105",
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h3 className="text-xl font-bold">Membership Rank</h3>

        {/* Booking Button - Desktop view */}
        <div className="hidden md:block">
          <button
            onClick={() => setIsBookingOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Book an Appointment
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <RankProgressBar currentRank={rank} bookingCount={bookingCount} rankClasses={rankClasses} />

        <div className="bg-purple-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Rank Benefits</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">•</div>
              <span>
                <strong>Bronze:</strong> Welcome discount 5% on your first service
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">•</div>
              <span>
                <strong>Silver:</strong> 5% discount on weekdays (Monday-Friday)  
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">•</div>
              <span>
                <strong>Gold:</strong> Additional 5% discount on selected services
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">•</div>
              <span>
                <strong>Platinum:</strong> 10% discount on all services
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="min-w-4 mt-0.5">•</div>
              <span>
                <strong>Diamond:</strong> 15% discount + VIP treatment
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

const RankProgressBar = ({ currentRank, bookingCount, rankClasses }) => {
  const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
  const thresholds = [0, 10, 25, 50, 100]
  const currentRankIndex = ranks.indexOf(currentRank)

  const calculateProgress = () => {
    if (currentRank === "Diamond") return 100

    const currentThreshold = thresholds[currentRankIndex]
    const nextThreshold = thresholds[currentRankIndex + 1]
    const progress = ((bookingCount - currentThreshold) / (nextThreshold - currentThreshold)) * 100

    return Math.min(Math.max(progress, 0), 100)
  }

  const progress = calculateProgress()
  const nextRank = currentRank === "Diamond" ? null : ranks[currentRankIndex + 1]
  const bookingsToNextRank = currentRank === "Diamond" ? 0 : thresholds[currentRankIndex + 1] - bookingCount

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">{currentRank}</span>
        {nextRank && <span className="text-gray-500">{nextRank}</span>}
      </div>

      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${rankClasses[currentRank]}`} style={{ width: `${progress}%` }}></div>
      </div>

      {nextRank && (
        <p className="mt-2 text-sm text-gray-600">
          {bookingsToNextRank} more bookings to reach {nextRank} rank
        </p>
      )}

      <div className="mt-6 grid grid-cols-5 gap-1">
        {ranks.map((rank, index) => (
          <div key={rank} className="text-center">
            <div
              title={`${thresholds[index]} Bookings needed for ${rank} rank`}
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                index <= currentRankIndex ? rankClasses[rank] : "bg-gray-200 text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            <p className="text-xs mt-1">{rank}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RankProgressSection