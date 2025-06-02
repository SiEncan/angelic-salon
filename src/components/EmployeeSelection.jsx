const EmployeeSelection = ({
  employeeList,
  date,
  time,
  endTime,
  services,
  existingBookings,
  selectedEmployee,
  setSelectedEmployee,
}) => {
  if (!date || !time || services.length === 0) return null

  const isEmployeeAvailable = (employee) => {
    return employee.isActive && !existingBookings.some(
      (booking) =>
        booking.employeeName === employee.name &&
        ((time >= booking.time && time < booking.endTime) || // Start time conflict
          (endTime > booking.time && endTime <= booking.endTime) || // End time conflict
          (time <= booking.time && endTime >= booking.endTime)), // New booking encompasses old booking
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
      <div className="grid grid-cols-2 gap-2">
        {employeeList.map((employee) => {
          const isAvailable = isEmployeeAvailable(employee)

          return (
            <button
              key={employee.name}
              onClick={() => isAvailable && setSelectedEmployee(employee.name)}
              disabled={!isAvailable}
              className={`p-2 rounded-lg border text-center transition-all
                ${
                  selectedEmployee === employee.name
                    ? "bg-purple-300 border-purple-500 text-purple-700"
                    : isAvailable
                      ? "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                      : "border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              <span className="font-bold">{employee.name}</span>
              <div className="text-xs mt-1 font-medium">
                {isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-500">Unavailable</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EmployeeSelection
