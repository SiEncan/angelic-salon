import { useState, useEffect } from "react"
import { auth, db } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore"
import NavigationBar from "../components/NavigationBar"
import { Calendar, Clock4 } from 'lucide-react'
import CustomerBookingModal from "../components/customer-profile/CustomerBookingModal";
import ProfileCard from "../components/customer-profile/ProfileCard"
import RankProgressSection from "../components/customer-profile/RankProgressSection"
import ActiveBookingsSection from "../components/customer-profile/ActiveBookingsSection"
import BookingHistorySection from "../components/customer-profile/BookingHistorySection"
import SkeletonLoading from "../components/customer-profile/Skeleton"
import SignInPrompt from "../components/customer-profile/SignInPrompt"

const ProfilePage = () => {
  const [userId, setUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeBookings, setActiveBookings] = useState([])
  const [historyBookings, setHistoryBookings] = useState([])
  const [bookingCount, setBookingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const fetchUserData = async (currentUser) => {
    try {
      const userDocRef = doc(db, "users", currentUser)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        setProfile(userDoc.data())
      }

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("customerId", "==", currentUser),
        orderBy("date", "desc")
      )

      const bookingsSnapshot = await getDocs(bookingsQuery)
      const bookingsData = []

      bookingsSnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      // Separate active and historical bookings
      const active = []
      const history = []

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

      bookingsData.forEach((booking) => {
        const statusUpdatedAt = booking.updatedAt?.toDate?.()
        const isRecentlyRejected = booking.status === "rejected" && statusUpdatedAt > oneHourAgo
        if (booking.status === "pending" || booking.status === "confirmed" || isRecentlyRejected) {
          active.push(booking)
        } else {
          history.push(booking)
        }
      })

      setActiveBookings(active)
      setHistoryBookings(history)
      setBookingCount(userDoc.data().bookingCount)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid)
        await fetchUserData(currentUser.uid)
      } else {
        setUserId(null)
        setProfile(null)
        setActiveBookings([])
        setHistoryBookings([])
        setBookingCount(0)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <SkeletonLoading />
  }

  if (!userId) {
    return <SignInPrompt />
  }

  const rank = getRank(bookingCount)

  return (
    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300 min-h-screen">
      <NavigationBar />
      <div className="max-w-screen-2xl mx-auto">
        <div className="px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-br from-purple-400 to-pink-200 bg-clip-text text-transparent">
            Customer Profile
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <ProfileCard
              profile={profile}
              rank={rank}
              bookingCount={bookingCount}
              setIsBookingOpen={setIsBookingOpen}
            />

            {/* Rank Progress */}
            <RankProgressSection rank={rank} bookingCount={bookingCount} setIsBookingOpen={setIsBookingOpen} />

            {/* Active Bookings Section */}
            <ActiveBookingsSection activeBookings={activeBookings} />

            {/* Booking History Section */}
            <BookingHistorySection
              historyBookings={historyBookings}
              setIsBookingOpen={setIsBookingOpen}
              onReviewSubmitted={() => fetchUserData(userId)}
            />

            {/* No Bookings Message */}
            {activeBookings.length === 0 && historyBookings.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-3">
                <div className="text-center py-8 text-gray-500">
                  <Clock4 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>You don't have any bookings yet.</p>
                  <div className="mt-4">
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="bg-gradient-to-r mx-auto from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 active:from-purple-700 active:to-pink-700 transition text-white px-6 py-3 rounded-lg font-semibold shadow-md flex items-center justify-center gap-2"
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

      <CustomerBookingModal
        userId={userId}
        profile={profile}
        isOpen={isBookingOpen}
        setIsOpen={setIsBookingOpen}
        onBookingSuccess={() => fetchUserData(userId)}
      />
    </div>
  )
}

// Helper function to determine rank based on booking count
const getRank = (bookingCount) => {
  if (!bookingCount) return "Bronze"

  return bookingCount >= 100
    ? "Diamond"
    : bookingCount >= 50
    ? "Platinum"
    : bookingCount >= 25
    ? "Gold"
    : bookingCount >= 10
    ? "Silver"
    : "Bronze"
}

export default ProfilePage