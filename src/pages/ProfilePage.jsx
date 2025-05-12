"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import NavigationBar from "../components/NavigationBar";
import { User, ShieldCheck, Calendar, Clock, Award } from "lucide-react";
import CustomerBookingButton from "../components/CustomerBookingButton";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (currentUser) => {
    try {
      // Fetch user profile data from Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }

      // Fetch bookings from bookings collection where customerId matches current user
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("customerId", "==", currentUser.uid),
        orderBy("date", "desc")
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = [];

      bookingsSnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setBookings(bookingsData);
      setBookingCount(userDoc.data().bookingCount || bookingsData.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData(currentUser);
      } else {
        setUser(null);
        setProfile(null);
        setBookings([]);
        setBookingCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBookingSuccess = async () => {
    if (user) {
      await fetchUserData(user);
    }
  };

  // Calculate rank based on booking count
  const getRank = (bookingCount) => {
    if (!bookingCount) return "Bronze";

    return bookingCount >= 50
      ? "Diamond"
      : bookingCount >= 20
      ? "Platinum"
      : bookingCount >= 10
      ? "Gold"
      : bookingCount >= 5
      ? "Silver"
      : "Bronze";
  };

  const rankClasses = {
    Bronze: "bg-amber-600 text-gray-900",
    Silver: "bg-gray-300 text-gray-700",
    Gold: "bg-yellow-300 text-yellow-700",
    Platinum: "bg-blue-100 text-blue-700",
    Diamond:
      "bg-gradient-to-r from-green-400 to-blue-500 text-white border-2 border-white shadow-lg transform scale-105",
  };

  // Format date from Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle both Firestore Timestamp objects and date strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time from Firestore timestamp or time string
  const formatTime = (time) => {
    if (!time) return "N/A";

    // If it's a timestamp object with toDate method
    if (time.toDate) {
      const date = time.toDate();
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If it's already a time string
    return time;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
        <div className="max-w-screen-2xl mx-auto">
          <NavigationBar />
          <div className="flex justify-center items-center h-[70vh]">
            <div className="animate-pulse text-purple-500 text-xl">
              Loading profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
        <div className="max-w-screen-2xl mx-auto">
          <NavigationBar />
          <div className="flex flex-col justify-center items-center h-[70vh] px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-4">
              Please Sign In
            </h2>
            <p className="text-gray-700 text-center mb-6">
              You need to be signed in to view your profile.
            </p>
            <button
              className="bg-[#171A31] hover:bg-opacity-80 transition duration-200 font-semibold shadow-lg rounded-lg px-5 py-3 text-white"
              onClick={() => (window.location.href = "/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rank = getRank(bookingCount);
  const rankClass = rankClasses[rank];

  return (
    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
      <div className="max-w-screen-2xl mx-auto">
        <NavigationBar />

        <div className="px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-br from-purple-400 to-pink-200 bg-clip-text text-transparent">
            Customer Profile
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-1">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center mb-4">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-purple-500" />
                  )}
                </div>
                <h2 className="text-xl font-bold">
                  {profile?.displayName || user.displayName || "Customer"}
                </h2>
                <p className="text-gray-500 mb-4">{user.email}</p>

                <div
                  className={`${rankClass} px-4 py-2 rounded-full flex items-center gap-2 font-semibold`}
                >
                  <Award className="w-4 h-4" />
                  {rank} Member
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <ShieldCheck className="text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">
                      {user.metadata?.creationTime
                        ? new Date(
                            user.metadata.creationTime
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                    <p className="font-medium">{bookingCount}</p>
                  </div>
                </div>
              </div>

              {/* Booking Button - Added here for mobile view */}
              <div className="mt-6 md:hidden">
                <CustomerBookingButton
                  user={user}
                  profile={profile}
                  onBookingSuccess={handleBookingSuccess}
                />
              </div>
            </div>

            {/* Rank Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <h3 className="text-xl font-bold">Membership Rank</h3>

                {/* Booking Button - Added here for desktop view */}
                <div className="hidden md:block">
                  <CustomerBookingButton
                    user={user}
                    profile={profile}
                    onBookingSuccess={handleBookingSuccess}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <RankProgressBar
                  currentRank={rank}
                  bookingCount={bookingCount}
                  rankClasses={rankClasses}
                />

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Rank Benefits</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <span>
                        <strong>Bronze:</strong> Welcome discount 5% on your
                        first service
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <span>
                        <strong>Silver:</strong> 10% discount on all services
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <span>
                        <strong>Gold:</strong> 15% discount + free mini
                        treatment
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <span>
                        <strong>Platinum:</strong> 20% discount + priority
                        booking
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="min-w-4 mt-0.5">•</div>
                      <span>
                        <strong>Diamond:</strong> 25% discount + VIP treatment +
                        exclusive offers
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bookings History */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
              <h3 className="text-xl font-bold mb-4">Booking History</h3>

              {bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  {/* Desktop view - Enhanced table */}
                  <div className="hidden md:block">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg p-3 border border-gray-100">
                      <div className="grid grid-cols-5 gap-4 font-medium text-purple-800">
                        <div>Service</div>
                        <div>Employee</div>
                        <div>Date</div>
                        <div>Time</div>
                        <div>Status</div>
                      </div>
                    </div>
                    <div className="space-y-2 mt-2">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="grid grid-cols-5 gap-4 p-3 rounded-lg hover:bg-purple-50 transition-colors border border-gray-100 shadow-sm"
                        >
                          <div className="font-medium text-gray-800">
                            {booking.service ||
                              booking.serviceName ||
                              booking.services?.join(", ")}
                          </div>
                          <div className="text-gray-700 flex items-center">
                            <div className="px-3 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-2 text-xs font-bold">
                              {booking.employeeName}
                            </div>
                          </div>
                          <div className="text-gray-700">
                            {formatDate(booking.date)}
                          </div>
                          <div className="text-gray-700">
                            {formatTime(booking.time)}
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "upcoming" ||
                                    booking.status === "confirmed" ||
                                    booking.status === "Booked"
                                  ? "bg-blue-100 text-blue-700"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {booking.status || "pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile view - Enhanced card style layout */}
                  <div className="md:hidden space-y-3">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-lg overflow-hidden shadow-sm border border-gray-100"
                      >
                        {/* Card header with gradient */}
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3">
                          <div className="flex justify-between items-start">
                            <div className="font-medium text-purple-900">
                              {booking.service ||
                                booking.serviceName ||
                                booking.services?.join(", ")}
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "upcoming" ||
                                    booking.status === "confirmed" ||
                                    booking.status === "Booked"
                                  ? "bg-blue-100 text-blue-700"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {booking.status || "pending"}
                            </span>
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-3 bg-white">
                          {/* Employee row with avatar */}
                          <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                            <div>
                              <div className="text-xs text-gray-500">
                                Employee
                              </div>
                              <div className="mt-1 px-3 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-medium">
                                {booking.employeeName}
                              </div>
                            </div>
                          </div>

                          {/* Date and time */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-purple-50 rounded-lg p-2">
                              <div className="text-xs text-purple-700 mb-1">
                                Date
                              </div>
                              <div className="font-medium text-gray-800">
                                {formatDate(booking.date)}
                              </div>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-2">
                              <div className="text-xs text-pink-700 mb-1">
                                Time
                              </div>
                              <div className="font-medium text-gray-800">
                                {formatTime(booking.time)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No booking history found.</p>
                  <div className="mt-4">
                    <CustomerBookingButton
                      user={user}
                      profile={profile}
                      onBookingSuccess={handleBookingSuccess}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component to display rank progress
const RankProgressBar = ({ currentRank, bookingCount, rankClasses }) => {
  const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const thresholds = [0, 5, 10, 20, 50];
  const currentRankIndex = ranks.indexOf(currentRank);

  // Calculate progress to next rank
  const calculateProgress = () => {
    if (currentRank === "Diamond") return 100;

    const currentThreshold = thresholds[currentRankIndex];
    const nextThreshold = thresholds[currentRankIndex + 1];
    const progress =
      ((bookingCount - currentThreshold) / (nextThreshold - currentThreshold)) *
      100;

    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = calculateProgress();
  const nextRank =
    currentRank === "Diamond" ? null : ranks[currentRankIndex + 1];
  const bookingsToNextRank =
    currentRank === "Diamond"
      ? 0
      : thresholds[currentRankIndex + 1] - bookingCount;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">{currentRank}</span>
        {nextRank && <span className="text-gray-500">{nextRank}</span>}
      </div>

      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${rankClasses[currentRank]}`}
          style={{ width: `${progress}%` }}
        ></div>
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
              className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                index <= currentRankIndex
                  ? rankClasses[rank]
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {index + 1}
            </div>
            <p className="text-xs mt-1">{rank}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;
