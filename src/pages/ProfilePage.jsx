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
import {
  User,
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock4,
} from "lucide-react";
import CustomerBookingButton from "../components/CustomerBookingButton";

const ProfilePage = () => {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [historyBookings, setHistoryBookings] = useState([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchUserData = async (currentUser) => {
    try {
      const userDocRef = doc(db, "users", currentUser);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("customerId", "==", currentUser),
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

      // Separate active and historical bookings
      const active = [];
      const history = [];

      bookingsData.forEach((booking) => {
        // Active bookings: pending, awaiting-confirmation, confirmed
        if (
          booking.status === "pending" ||
          booking.status === "awaiting-confirmation" ||
          booking.status === "confirmed" ||
          booking.status === "rejected"
        ) {
          active.push(booking);
        } else {
          // Historical bookings: completed, cancelled, no-show
          history.push(booking);
        }
      });

      setActiveBookings(active);
      setHistoryBookings(history);
      setBookingCount(userDoc.data().bookingCount || bookingsData.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        await fetchUserData(currentUser.uid);
      } else {
        setUserId(null);
        setProfile(null);
        setActiveBookings([]);
        setHistoryBookings([]);
        setBookingCount(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    if (time.toDate) {
      const date = time.toDate();
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return time;
  };

  // Get status details (icon, color, label)
  const getStatusDetails = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          label: "Menunggu Konfirmasi",
        };
      case "awaiting-confirmation":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          label: "Menunggu Konfirmasi",
        };
      case "confirmed":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          label: "Terkonfirmasi",
        };
      case "rejected":
        return {
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          label: "Ditolak",
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          label: "Selesai",
        };
      case "cancelled":
        return {
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          label: "Dibatalkan",
        };
      case "no-show":
        return {
          icon: <XCircle className="w-4 h-4" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          label: "Tidak Hadir",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          label: status || "Pending",
        };
    }
  };

  const SkeletonLine = ({
    width = "w-full",
    height = "h-4",
    className = "",
  }) => (
    <div
      className={`bg-gray-200 rounded ${width} ${height} ${className} animate-pulse`}
    />
  );

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
        <NavigationBar />
        <div className="max-w-screen-2xl mx-auto px-4 py-8">
          <div className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-br from-purple-400 to-pink-200 bg-clip-text text-transparent">
            Customer Profile
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skeleton Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-1 animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-purple-200 rounded-full mb-4" />
                <SkeletonLine width="w-32" className="mb-2" />
                <SkeletonLine width="w-40" className="mb-4" />
                <SkeletonLine width="w-28 h-6 rounded-full" />
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <SkeletonLine width="w-24" height="h-3" />
                    <SkeletonLine width="w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <SkeletonLine width="w-24" height="h-3" />
                    <SkeletonLine width="w-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Skeleton Rank Progress and Benefits */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 animate-pulse">
              <SkeletonLine width="w-48" height="h-6" className="mb-6" />
              <SkeletonLine width="w-full" height="h-4" className="mb-4" />
              <SkeletonLine width="w-full" height="h-4" className="mb-4" />
              <SkeletonLine width="w-full" height="h-4" className="mb-4" />
              <SkeletonLine width="w-full" height="h-4" className="mb-4" />
              <SkeletonLine width="w-full" height="h-4" />
            </div>

            {/* Skeleton Active Bookings */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3 animate-pulse">
              <SkeletonLine width="w-40" height="h-5" className="mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-3 border border-gray-100 shadow-sm"
                  >
                    <SkeletonLine className="w-full max-w-[160px]" />
                    <SkeletonLine className="w-full max-w-[120px]" />
                    <SkeletonLine className="w-full max-w-[120px]" />
                    <SkeletonLine className="w-full max-w-[100px]" />
                    <SkeletonLine className="w-full max-w-[120px]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton Booking History */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3 animate-pulse">
              <SkeletonLine width="w-40" height="h-5" className="mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 p-3 border border-gray-100 shadow-sm"
                  >
                    <SkeletonLine className="w-full max-w-[160px]" />
                    <SkeletonLine className="w-full max-w-[120px]" />
                    <SkeletonLine className="w-full max-w-[120px]" />
                    <SkeletonLine className="w-full max-w-[100px]" />
                    <SkeletonLine className="w-full max-w-[120px]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
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
                <h2 className="text-xl font-bold">{profile.fullName}</h2>
                <p className="text-gray-500 mb-4">{profile.email}</p>

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
                      {profile.createdAt.toDate().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
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

              {/* Booking Button - Mobile view */}
              <div className="mt-6 md:hidden">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2 w-full"
                >
                  <Calendar className="w-5 h-5" />
                  Book an Appointment
                </button>
              </div>
            </div>

            {/* Rank Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <h3 className="text-xl font-bold">Membership Rank</h3>

                {/* Booking Button - Desktop view */}
                <div className="hidden md:block">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Book an Appointment
                  </button>
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

            {/* Active Bookings Section */}
            {activeBookings.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock4 className="text-purple-500" />
                  Booking Aktif
                </h3>

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
                      {activeBookings.map((booking, index) => {
                        const statusDetails = getStatusDetails(booking.status);
                        const isLast = index === activeBookings.length - 1;

                        return (
                          <div
                            key={booking.id}
                            className={`grid grid-cols-5 gap-4 p-3 border border-gray-100 shadow-sm hover:bg-purple-50 transition-colors ${
                              isLast ? "rounded-b-lg" : ""
                            }`}
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
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusDetails.bgColor} ${statusDetails.textColor}`}
                                title={statusDetails.label === "Terkonfirmasi" ? "Booking terkonfirmasi, silahkan datang sesuai jadwal. Kami menantikan kedatangan Anda!" : statusDetails.label === "Menunggu Konfirmasi" ? "Booking Anda sedang diproses. Kami akan menghubungi Anda segera." : statusDetails.label === "Ditolak" ? "Booking ditolak, silahkan pilih jadwal lain atau hubungi kami untuk informasi lebih lanjut." : ""}
                                >
                                {statusDetails.icon}
                                {statusDetails.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile view - Enhanced card style layout */}
                  <div className="md:hidden space-y-3">
                    {activeBookings.map((booking) => {
                      const statusDetails = getStatusDetails(booking.status);
                      return (
                        <div
                          key={booking.id}
                          className={`rounded-lg overflow-hidden shadow-sm border ${
                            booking.status === "rejected"
                              ? "border-red-200"
                              : "border-gray-100"
                          }`}
                        >
                          <div
                            className={`p-3 ${
                              booking.status === "rejected"
                                ? "bg-gradient-to-r from-red-50 to-pink-50"
                                : booking.status === "confirmed"
                                ? "bg-gradient-to-r from-green-50 to-blue-50"
                                : "bg-gradient-to-r from-purple-100 to-pink-100"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-purple-900">
                                {booking.service ||
                                  booking.serviceName ||
                                  booking.services?.join(", ")}
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusDetails.bgColor} ${statusDetails.textColor}`}
                              >
                                {statusDetails.icon}
                                {statusDetails.label}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-white">
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

                            {booking.status === "rejected" && (
                              <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-100 text-sm text-red-700">
                                <p className="font-medium">Booking ditolak</p>
                                <p className="text-xs mt-1">
                                  Silahkan pilih jadwal lain atau hubungi kami
                                  untuk informasi lebih lanjut.
                                </p>
                              </div>
                            )}

                            {booking.status === "pending" && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-700">
                                <p className="font-medium">
                                  Menunggu konfirmasi
                                </p>
                                <p className="text-xs mt-1">
                                  Booking Anda sedang diproses. Kami akan
                                  menghubungi Anda segera.
                                </p>
                              </div>
                            )}

                            {booking.status === "confirmed" && (
                              <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700">
                                <p className="font-medium">
                                  Booking terkonfirmasi
                                </p>
                                <p className="text-xs mt-1">
                                  Silahkan datang sesuai jadwal. Kami menantikan
                                  kedatangan Anda!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Booking History Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-purple-500" />
                Riwayat Booking
              </h3>

              {historyBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  {/* Desktop view - Enhanced table */}
                  <div className="hidden md:block">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg p-3 border border-gray-100">
                      <div className="grid grid-cols-5 gap-4 font-medium text-gray-700">
                        <div>Service</div>
                        <div>Employee</div>
                        <div>Date</div>
                        <div>Time</div>
                        <div>Status</div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      {historyBookings.map((booking, index) => {
                        const statusDetails = getStatusDetails(booking.status);
                        const isLast = index === historyBookings.length - 1;
                        return (
                          <div
                            key={booking.id}
                            className={`grid grid-cols-5 gap-4 p-3 hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm ${
                              isLast ? "rounded-b-lg" : ""
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {booking.service ||
                                booking.serviceName ||
                                booking.services?.join(", ")}
                            </div>
                            <div className="text-gray-700 flex items-center">
                              <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mr-2 text-xs font-bold">
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
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusDetails.bgColor} ${statusDetails.textColor}`}
                              >
                                {statusDetails.icon}
                                {statusDetails.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile view - Enhanced card style layout */}
                  <div className="md:hidden space-y-3">
                    {historyBookings.map((booking) => {
                      const statusDetails = getStatusDetails(booking.status);
                      return (
                        <div
                          key={booking.id}
                          className="rounded-lg overflow-hidden shadow-sm border border-gray-100 opacity-80"
                        >
                          <div className="bg-gradient-to-r from-gray-100 to-gray-50 p-3">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-700">
                                {booking.service ||
                                  booking.serviceName ||
                                  booking.services?.join(", ")}
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusDetails.bgColor} ${statusDetails.textColor}`}
                              >
                                {statusDetails.icon}
                                {statusDetails.label}
                              </span>
                            </div>
                          </div>

                          <div className="p-3 bg-white">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                              <div>
                                <div className="text-xs text-gray-500">
                                  Employee
                                </div>
                                <div className="mt-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                                  {booking.employeeName}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-xs text-gray-500 mb-1">
                                  Date
                                </div>
                                <div className="font-medium text-gray-800">
                                  {formatDate(booking.date)}
                                </div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2">
                                <div className="text-xs text-gray-500 mb-1">
                                  Time
                                </div>
                                <div className="font-medium text-gray-800">
                                  {formatTime(booking.time)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No booking history found.</p>
                  <div className="mt-4">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="bg-gradient-to-r mx-auto from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Book an Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* No Bookings Message */}
            {activeBookings.length === 0 && historyBookings.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>You don't have any bookings yet.</p>
                  <div className="mt-4">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Your First Appointment
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustomerBookingButton
        userId={userId}
        profile={profile}
        isOpen={isBookingOpen}
        setIsOpen={setIsBookingOpen}
        onBookingSuccess={fetchUserData}
      />
    </div>
  );
};

const RankProgressBar = ({ currentRank, bookingCount, rankClasses }) => {
  const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
  const thresholds = [0, 5, 10, 20, 50];
  const currentRankIndex = ranks.indexOf(currentRank);

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
