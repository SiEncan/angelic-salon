import { Crown, Star, Zap } from "lucide-react"

const CustomerRank = ({ totalBooks }) => {
  const getRank = (bookingCount) => {
    if (bookingCount >= 100) return "Diamond"
    if (bookingCount >= 50) return "Platinum"
    if (bookingCount >= 25) return "Gold"
    if (bookingCount >= 10) return "Silver"
    return "Bronze"
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case "Diamond":
        return "from-blue-400 to-purple-600"
      case "Platinum":
        return "from-slate-300 to-slate-500"
      case "Gold":
        return "from-yellow-400 to-yellow-600"
      case "Silver":
        return "from-gray-400 to-gray-600"
      case "Bronze":
        return "from-amber-600 to-amber-800"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case "Diamond":
        return <Zap className="w-3 h-3" />
      case "Platinum":
      case "Gold":
        return <Crown className="w-3 h-3" />
      case "Silver":
      case "Bronze":
        return <Star className="w-3 h-3" />
      default:
        return <Star className="w-3 h-3" />
    }
  }

  const rank = getRank(totalBooks)
  const colorClass = getRankColor(rank)
  const icon = getRankIcon(rank)

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${colorClass}`}
    >
      {icon}
      <span>{rank}</span>
    </div>
  )
}

export default CustomerRank
