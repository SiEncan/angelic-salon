const employeesList = ["Yuli", "Isni", "Dini"];

const EmployeeSelection = ({ date, services, existingBookings, time, endTime, selectedEmployee, setSelectedEmployee }) => {

  if (!date || !time || services.length === 0) return null;

  const availableEmployees = employeesList.filter((employee) => {
    return !existingBookings.some((booking) =>
      booking.employeeName === employee &&
      (
        (time >= booking.time && time < booking.endTime) ||  // Waktu mulai bentrok
        (endTime > booking.time && endTime <= booking.endTime) ||  // Waktu selesai bentrok
        (time <= booking.time && endTime >= booking.endTime) // Booking baru mencakup booking lama
      )
    );
  });

  return (
    <div className="mt-2">
      <h3 className="text-xl font-semibold">Select Employee:</h3>
      <div className="flex flex-wrap gap-2 mt-1">
        {employeesList.map((employee) => (
          <button
            key={employee}
            onClick={() => setSelectedEmployee(employee)}
            className={`px-3 py-1 border rounded ${
              selectedEmployee === employee
                ? "bg-blue-500 text-white"
                : availableEmployees.includes(employee)
                ? "bg-gray-200"
                : "bg-pink-400 text-white cursor-not-allowed"
            }`}
            disabled={!availableEmployees.includes(employee)}
          >
            {employee} {!availableEmployees.includes(employee) && "(Not Available)"}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmployeeSelection;
