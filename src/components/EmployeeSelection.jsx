const EmployeeSelection = ({
  employeeList,
  date,
  services,
  existingBookings,
  time,
  endTime,
  selectedEmployee,
  setSelectedEmployee,
}) => {
  if (!date || !time || services.length === 0) return null;

  const availableEmployees = employeeList.filter((employee) => {
    return !existingBookings.some(
      (booking) =>
        booking.employeeName === employee &&
        ((time >= booking.time && time < booking.endTime) || // Waktu mulai bentrok
          (endTime > booking.time && endTime <= booking.endTime) || // Waktu selesai bentrok
          (time <= booking.time && endTime >= booking.endTime)) // Booking baru mencakup booking lama
    );
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Employee
      </label>
      <div className="grid grid-cols-2 gap-2">
        {employeeList.map((employee) => {
          const isAvailable = availableEmployees.includes(employee);

          return (
            <button
              key={employee}
              onClick={() => isAvailable && setSelectedEmployee(employee)}
              disabled={!isAvailable}
              className={`p-2 rounded-lg border text-center transition-all
            ${
              selectedEmployee === employee
                ? "bg-purple-300 border-purple-500 text-purple-700"
                : isAvailable
                ? "border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                : "border-gray-200 bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            >
              <span className="font-bold">{employee}</span>
              <div className="text-xs mt-1 font-medium">
                {isAvailable ? (
                  <span className="text-green-600">Available</span>
                ) : (
                  <span className="text-red-500">Unavailable</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeSelection;
