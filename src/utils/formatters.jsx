import { XCircle, Clock, CheckCircle2 } from "lucide-react"

export const formatDate = (timestamp) => {
  if (!timestamp) return "N/A"

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export const formatTime = (time) => {
  if (!time) return "N/A"

  if (time.toDate) {
    const date = time.toDate()
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return time
}

// Get status details (icon, color, label)
export const getStatusDetails = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        icon: <Clock className="w-4 h-4" />,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        label: "Menunggu Konfirmasi",
      }
    case "confirmed":
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        label: "Terkonfirmasi",
      }
    case "rejected":
      return {
        icon: <XCircle className="w-4 h-4" />,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        label: "Ditolak",
      }
    case "completed":
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        label: "Selesai",
      }
    case "cancelled":
      return {
        icon: <XCircle className="w-4 h-4" />,
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        label: "Dibatalkan",
      }
    case "in progress":
      return {
        icon: <Clock className="w-4 h-4" />,
        bgColor: "bg-purple-100",
        textColor: "text-purple-700",
        label: "Dalam Proses",
      }
      
    default:
      return {
        icon: <Clock className="w-4 h-4" />,
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        label: status || "Pending",
      }
  }
}