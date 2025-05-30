const CustomerRank = ({ totalBooks }) => {
  const rankClasses = {
    Bronze: "bg-amber-600/20 text-amber-800 border border-amber-600",
    Silver: "bg-gray-300/20 text-gray-700 border border-gray-400",
    Gold: "bg-yellow-300/20 text-yellow-700 border border-yellow-400",
    Platinum: "bg-blue-100/30 text-blue-700 border border-blue-400",
    Diamond: "bg-gradient-to-r from-purple-400/20 to-blue-400/20 text-purple-700 border border-purple-400",
  }

  const rank =
    totalBooks >= 100
      ? "Diamond"
      : totalBooks >= 50
        ? "Platinum"
        : totalBooks >= 25
          ? "Gold"
          : totalBooks >= 10
            ? "Silver"
            : "Bronze"

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${rankClasses[rank] || "bg-gray-100 text-gray-700"}`}
    >
      {rank} Member
    </span>
  )
}

export default CustomerRank
