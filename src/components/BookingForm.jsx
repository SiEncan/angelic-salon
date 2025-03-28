import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const checkAvailability = async (selectedTime, selectedEndTime) => {
  const q = query(collection(db, "bookings"));
  const snapshot = await getDocs(q);
  const bookings = snapshot.docs.map(doc => doc.data());

  const availableEmployees = ["Ani", "Lusi", "Via"];

  bookings.forEach(booking => {
    const bookedStart = booking.time;
    const bookedEnd = booking.endTime;

    if (
      (selectedTime >= bookedStart && selectedTime < bookedEnd) ||
      (selectedEndTime > bookedStart && selectedEndTime <= bookedEnd) ||
      (selectedTime <= bookedStart && selectedEndTime >= bookedEnd)
    ) {
      const index = availableEmployees.indexOf(booking.employee);
      if (index !== -1) availableEmployees.splice(index, 1);
    }
  });

  return availableEmployees;
};

const BookingForm = ({ closeModal }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("");
  const [services, setServices] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const serviceOptions = [
    { name: "Potong Rambut", duration: 30 },
    { name: "Warnain Rambut", duration: 60 },
    { name: "Creambath", duration: 60 }
  ];

  useEffect(() => {
    if (!time || services.length === 0) {
      setAvailableEmployees([]);
      setSelectedEmployee("");
      return;
    }

    const endTime = calculateEndTime();
    checkAvailability(time, endTime).then((available) => {
      setAvailableEmployees(available);
    });
  }, [time, services]);

  const handleServiceChange = (serviceName) => {
    setServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const calculateEndTime = () => {
    if (!time || !time.includes(":") || services.length === 0) return "00:00";

    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "00:00";

    const totalMinutes =
      hours * 60 +
      minutes +
      services.reduce(
        (sum, service) =>
          sum + (serviceOptions.find((s) => s.name === service)?.duration || 0),
        0
      );

    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(
      endMinutes
    ).padStart(2, "0")}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !time || services.length === 0 || !selectedEmployee) {
      alert("Harap lengkapi semua data!");
      return;
    }

    const endTime = calculateEndTime();

    try {    
      await addDoc(collection(db, "bookings"), {
        name,
        phone,
        time,
        endTime,
        services,
        employee: selectedEmployee
      });
      alert("Booking berhasil!");
      closeModal();
      setName("");
      setPhone("");
      setTime("");
      setServices([]);
      setSelectedEmployee("");
    } catch (error) {
      console.error("Error booking:", error);
      alert("Terjadi kesalahan saat booking.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nama:</label>
        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Nomor Telepon:</label>
        <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Jam Kedatangan:</label>
        <input type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Pilih Layanan:</label>
        {serviceOptions.map((service) => (
          <div key={service.name} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={services.includes(service.name)}
              onChange={() => handleServiceChange(service.name)}
            />
            <label className="form-check-label">{service.name} ({service.duration} menit)</label>
          </div>
        ))}
      </div>

      {time && services.length > 0 && availableEmployees.length === 0 && (
        <div>
          <label className="form-label">Pilih HairStylist:</label>
          <p style={{ 
            backgroundColor: "#ffccd5", 
            color: "red", 
            fontWeight: "600", 
            padding: "4px",
            borderRadius: "8px",
            textAlign: "center"
          }}>
            Maaf, semua hairstylist sudah di-book pada jam ini.
          </p>
        </div>
      )}

      {time && availableEmployees.length > 0 && (
        <div className="mb-3">
        <label className="form-label">Pilih HairStylist:</label>
        <select className="form-select custom-select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} required>
          <option value="">-- Pilih HairStylist --</option>
          {["Ani", "Lusi", "Via"].map((employee) => {
            const isAvailable = availableEmployees.includes(employee);
            return (
              <option
                key={employee}
                value={isAvailable ? employee : ""}
                disabled={!isAvailable}
                className={isAvailable ? "available" : "not-available"}
                style={{
                  backgroundColor: isAvailable ? "#91c481" : "#ffccd5",
                  color: isAvailable ? "green" : "red",
                  fontWeight: isAvailable ? "bold" : "bold",
                }}
              >
                {employee} {isAvailable ? "(Available)" : "(Not Available)"}
              </option>
            );
          })}
        </select>
      </div>                 
      )}

      <button type="submit" className="btn btn-success w-100" disabled={!time || availableEmployees.length === 0}>
        Book Sekarang
      </button>
    </form>
  );
};

export default BookingForm;