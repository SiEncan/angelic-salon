import { User, ShieldCheck, Calendar, Award } from 'lucide-react'

const ProfileCard = ({ profile, rank, bookingCount, setIsBookingOpen }) => {
  const rankClasses = {
    Bronze: "bg-amber-600 text-gray-900",
    Silver: "bg-gray-300 text-gray-700",
    Gold: "bg-yellow-300 text-yellow-700",
    Platinum: "bg-blue-200 text-blue-700",
    Diamond:
      "bg-gradient-to-r from-green-400 to-blue-500 text-white border-2 border-white shadow-lg transform scale-105",
  }

  return (
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

        <div className={`${rankClasses[rank]} px-4 py-2 rounded-full flex items-center gap-2 font-semibold`}>
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
  )
}

export default ProfileCard