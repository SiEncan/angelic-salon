import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BookingList.css";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        const bookingData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div id='booklist' className="container mt-5">
      <h2 className="mb-4 text-center">Daftar Booking</h2>

      {bookings.length === 0 ? (
        <div className="alert alert-info text-center">Belum ada booking.</div>
      ) : (
        <div className="row">
          {bookings.map((booking) => (
            <div key={booking.id} className="col-12 mb-3">
              <div className="card shadow w-75 mx-auto">
                <div className="card-body">
                  <h5 className="card-title">{booking.name}</h5>
                  <p className="card-text"><strong>Nomor Telepon:</strong> {booking.phone}</p>
                  <p className="card-text"><strong>Waktu:</strong> {booking.time} - {booking.endTime}</p>
                  <p className="card-text"><strong>Layanan:</strong> {booking.services.join(", ")}</p>
                  <p className="card-text">
                    <strong>HairStylist:</strong> <span className="badge bg-primary">{booking.employee}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
