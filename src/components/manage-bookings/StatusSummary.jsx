import { Clock, CheckCircle, XCircle, X } from "lucide-react"

const StatusSummary = ( {statusCounts} ) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Pending For Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <Clock className="h-5 w-5 text-yellow-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="h-5 w-5 text-red-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-gray-600">{statusCounts.cancelled}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <X className="h-5 w-5 text-gray-600" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{statusCounts.completed}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <CheckCircle className="h-5 w-5 text-blue-600" />
        </div>
      </div>
    </div>
  )
}

export default StatusSummary