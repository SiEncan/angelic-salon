import { useState, useEffect } from "react"
import { auth, db } from "../firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"

import NavigationBar from "../components/NavigationBar";
import ServiceCarousel from "../components/Carousel";
import CustomerBookingModal from "../components/customer-profile/CustomerBookingModal";
import FeedbackModal from "../components/BookingFeedbackModal";
import SpaImage from '../assets/images/spa.png';
import TreatmentImage from '../assets/images/beautytreatment.jpeg';
import NailArtImage from '../assets/images/nailart.jpeg';
import OwnerImage from '../assets/images/owner.jpg';

import { ChevronRight, ChevronDown, Star, Clock, MapPin, Phone, Instagram, Award } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"

const HomePage = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [userId, setUserId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [feedbackModalType, setFeedbackModalType] = useState("")
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("")
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("")

  const [latestReviews, setLatestReviews] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid)
        await fetchUserData(currentUser.uid)
      } else {
        setUserId(null)
        setProfile(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchUserData = async (currentUser) => {
    try {
      const userDocRef = doc(db, "users", currentUser)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        setProfile(userDoc.data())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
  const fetchLatestReviews = async () => {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "bookings"),
          where("review", "!=", ""),
          orderBy("createdAt", "desc"),
          limit(3)
        )
      );

      const reviews = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          return {
            id: docSnap.id,
            name: data.customerName || "Anonymous",
            rating: data.review?.rating || 0,
            comment: data.review?.comment || "No comment",
            createdAt: data.createdAt?.toDate() || new Date(),
            rank: getRank(data.bookingCount),
          };
        })
      );

      setLatestReviews(reviews.filter(r => r.rating > 0 || r.comment !== "No comment"));
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  fetchLatestReviews();
}, []);



  const handleBookingClick = () => {
    if (userId) {
      setIsBookingOpen(true)
    } else {
      setFeedbackModalType("failed")
      setFeedbackModalTitle("You need to be logged in")
      setFeedbackModalDescription("Please log in to book an appointment")
      setIsFeedbackModalOpen(true)
    }
  }

  const [categorizedServices, setCategorizedServices] = useState([])

  useEffect(() => {
    const fetchServicesAndCategories = async () => {
      try {
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, "serviceCategories"))
        const categories = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Fetch services
        const servicesSnapshot = await getDocs(collection(db, "services"))
        const services = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        // Group services by category and sort alphabetically
        const categorizedData = categories
          .map((category) => ({
            ...category,
            services: services
              .filter((service) => service.categoryId === category.id)
              .sort((a, b) => a.name.localeCompare(b.name)), // Sort services alphabetically
          }))
          .filter((category) => category.services.length > 0) // Only show categories with services
          .sort((a, b) => a.title.localeCompare(b.title)) // Sort categories alphabetically

        setCategorizedServices(categorizedData)
      } catch (error) {
        console.error("Error fetching services and categories: ", error)
      }
    }

    fetchServicesAndCategories()
  }, [])

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 min-h-screen">
      <NavigationBar />

      {/* Main Container with padding */}
      <div className="max-w-screen-2xl px-8 sm:px-6 md:px-12 lg:px-16 mx-auto">
        {/* Hero Section */}
        <section className="py-8 md:py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col justify-center"
            >
              <h1 className="font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                  PERCAYA DIRI
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                  DATANG
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-purple-400 to-pink-300 text-white px-4 py-2 rounded-lg shadow-lg mt-2">
                  Dari Kamu!
                </span>
              </h1>
              <p className="text-gray-700 text-base md:text-lg mt-4 max-w-lg">
                Temukan keindahan sejati dengan sentuhan ahli dari Angelic Salon & Spa. Wujudkan rambut impianmu dengan
                perawatan terbaik yang dirancang khusus untuk memancarkan pesonamu.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={handleBookingClick}
                  className="bg-gradient-to-r from-purple-500 to-pink-400 hover:from-purple-600 hover:to-pink-500 text-white font-medium rounded-full px-6 py-3 shadow-lg transform transition duration-300 hover:scale-105 flex items-center"
                >
                  Book an Appointment
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                <a
                  href="#services"
                  className="bg-white no-underline text-purple-600 border border-purple-200 hover:border-purple-300 font-medium rounded-full px-6 py-3 shadow-md transition duration-300 hover:shadow-lg"
                >
                  Our Services
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative overflow-visible"
            >
              <div className="absolute inset-0 h-[100%] max-h-[200px] top-20 sm:max-h-[350px] sm:top-10 md:max-h-[300px] md:top-10 lg:max-h-[350px] lg:top-20 xl:max-h-[550px] 2xl:max-h-[600px] xl:top-20 bg-gradient-to-br from-pink-400 via-purple-300 to-pink-300 rounded-3xl transform rotate-3 scale-95 opacity-70" />
              
              <img
                src="/images/hero-image.png"
                alt="Angelic Salon & Spa"
                className="relative"
              />

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg p-3 z-20">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">5.0 (200+ reviews)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Services Carousel */}
          <section className="py-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Featured Services
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our most popular beauty and wellness treatments</p>
          </div>
          <ServiceCarousel />
        </section>

        {/* About Section */}
        <section id="about" className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src={OwnerImage}
                  alt="Salon Interior"
                  className="rounded-2xl shadow-lg h-64 w-full object-cover transform -rotate-3"
                />
                <img
                  src={TreatmentImage}
                  alt="Beauty Treatment"
                  className="rounded-2xl shadow-lg h-48 object-cover mt-12 transform rotate-3"
                />
                <img
                  src={SpaImage}
                  alt="Spa Treatment"
                  className="rounded-2xl shadow-lg h-48 object-cover transform rotate-3"
                />
                <img
                  src={NailArtImage}
                  alt="Nail Art"
                  className="rounded-2xl shadow-lg h-64 object-cover -mt-8 transform -rotate-3"
                />
              </div>
              <div className="absolute -bottom-12 md:-bottom-6 -right-5 md:-right-12 xl:right-10 2xl:right-16 bg-gradient-to-br from-purple-500 to-pink-400 h-24 w-24 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                5+
                <br />
                Years
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  About Angelic Salon & Spa
                </span>
              </h2>
              <p className="text-gray-700 mb-6">
                Angelic Salon & Spa is your sanctuary of serenity. Founded in 2020, we have been providing premium
                beauty and wellness services to our valued clients.
              </p>
              <p className="text-gray-700 mb-6">
                Our team of skilled professionals is dedicated to delivering exceptional experiences that enhance your
                natural beauty and promote overall wellbeing. We use only the finest products and latest techniques to
                ensure outstanding results.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center">
                  <div className="bg-purple-100 rounded-full p-3 mb-3">
                    <Star className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Premium Quality</h3>
                  <p className="text-sm text-gray-600">Top-tier products and services</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center">
                  <div className="bg-pink-100 rounded-full p-3 mb-3">
                    <Clock className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold">Expert Staff</h3>
                  <p className="text-sm text-gray-600">Skilled and certified professionals</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                Our Services
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive beauty and wellness treatments tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categorizedServices.map((category) => (
              <ServiceCard
                key={category.id}
                title={category.title}
                description={category.description}
                services={category.services}
                icon={category.icon}
                color={category.color}
              />
            ))}
            {/* <ServiceCard
              title="Facial"
              description="Revitalize your skin with our specialized facial treatments"
              services={[
                { name: "Facial Green Tea", desc: "Antioxidant-rich treatment that soothes and detoxifies skin" },
                { name: "Facial Galvanic NU SKIN", desc: "Advanced treatment that enhances product absorption" },
                { name: "Facial Detox", desc: "Deep cleansing to remove impurities and toxins" },
                { name: "Totok Wajah", desc: "Traditional facial massage to improve circulation" },
              ]}
              icon="✨"
              color="from-purple-500 to-pink-400"
            />

            <ServiceCard
              title="Treatment"
              description="Specialized treatments for ultimate relaxation and wellness"
              services={[
                { name: "Ratus V", desc: "Traditional feminine care treatment with herbal ingredients" },
                { name: "Steam V", desc: "Gentle steam therapy for intimate wellness" },
                { name: "Spa SV", desc: "Comprehensive care package for feminine health" },
                { name: "Ear Candle", desc: "Ancient technique to remove excess wax and toxins" },
              ]}
              icon="💆‍♀️"
              color="from-blue-500 to-purple-400"
            />

            <ServiceCard
              title="Perawatan Kuku"
              description="Complete nail care services for beautiful hands and feet"
              services={[
                { name: "Menicure", desc: "Professional hand and nail care treatment" },
                { name: "Pedicure", desc: "Rejuvenating foot and nail care service" },
                { name: "Foot Spa", desc: "Luxurious foot treatment with massage" },
                { name: "Nail Polish & NailArt", desc: "Creative and stylish nail designs" },
                { name: "Eyelash & Sulam Alis", desc: "Beautiful eye enhancements" },
              ]}
              icon="💅"
              color="from-pink-500 to-red-400"
            />

            <ServiceCard
              title="Spa Aromatherapy"
              description="Therapeutic treatments using essential oils for mind and body"
              services={[
                { name: "Massage", desc: "Relaxing full-body massage with aromatic oils" },
                { name: "Bleaching", desc: "Skin brightening treatment for a radiant glow" },
                { name: "Milk Cleansing", desc: "Deep cleansing with milk and herbal oils" },
                { name: "Siatzu", desc: "Traditional Japanese body scrub for detoxification" },
                { name: "Steam", desc: "Relaxing steam therapy to open pores and relax muscles" },
                { name: "Lulur", desc: "Traditional Indonesian body scrub for smooth skin" },
              ]}
              icon="🌿"
              color="from-green-500 to-teal-400"
            />

            <ServiceCard
              title="Creambath"
              description="Nourishing hair treatments for healthy, shiny locks"
              services={[
                { name: "Creambath", desc: "Deep conditioning treatment with scalp massage" },
                { name: "Hair Mask", desc: "Intensive repair treatment for damaged hair" },
                { name: "Hair Spa", desc: "Complete hair therapy for ultimate rejuvenation" },
              ]}
              icon="💇‍♀️"
              color="from-yellow-500 to-amber-400"
            /> */}

            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl shadow-md p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-white rounded-full p-4 shadow-md mb-4">
                <ChevronRight className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-purple-800 mb-2">Discover More</h3>
              <p className="text-gray-700 mb-4">Visit our salon to explore our full range of services</p>
              <button
                onClick={handleBookingClick}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-full px-6 py-2 shadow-md transform transition duration-300 hover:scale-105"
              >
                Book Now
              </button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                What Our Clients Say
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear from our satisfied customers</p>
          </div>

          {latestReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestReviews.map((review) => (
                <TestimonialCard
                  key={review.id}
                  name={review.name || "Anonymous"}
                  rank={review.rank || "Regular Client"}
                  quote={review.comment}
                  rating={review.rating}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No reviews available yet. Be the first to share your experience!</p>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Contact Us
                  </span>
                </h2>
                <p className="text-gray-700 mb-8">Visit our salon or get in touch for appointments and inquiries</p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Location</h3>
                      <p className="text-gray-700">Jln. Padat Karya, Kota Prabumulih</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-700">0821-7526-6137</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-purple-100 rounded-full p-3 mr-4">
                      <Instagram className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Instagram</h3>
                      <p className="text-gray-700">@angelic_salonspamuslimah</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleBookingClick}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-full px-6 py-3 shadow-md transform transition duration-300 hover:scale-105"
                  >
                    Book an Appointment
                  </button>
                </div>
              </div>

              <div className="relative h-64 md:h-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!4v1748858499975!6m8!1m7!1sEOhfid4Q-LiaV9gBhH-HIA!2m2!1d-3.418882693502407!2d104.2614003930913!3f187.3342256732595!4f5.2513135101608555!5f0.7820865974627469"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-200">  
          <div className="text-center text-gray-500 text-sm">© 2025 Angelic Salon & Spa. All rights reserved.</div>
        </footer>
      </div>

      {/* Modals */}
      {userId && profile && (
        <CustomerBookingModal userId={userId} profile={profile} isOpen={isBookingOpen} setIsOpen={setIsBookingOpen} />
      )}

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        type={feedbackModalType}
        title={feedbackModalTitle}
        description={feedbackModalDescription}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  )
}

function ServiceCard({ title, description, services, color }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-md overflow-hidden"
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">{title}</h3>
          {title === "Facial" && <span role="img" aria-label="sparkles">✨</span>}
          {title === "Treatment" && <span role="img" aria-label="massage">💆‍♀️</span>}
          {title === "Nail Care" && <span role="img" aria-label="nail polish">💅</span>}
          {title === "Spa Aromatherapy" && <span role="img" aria-label="herb">🌿</span>}
          {title === "Creambath" && <span role="img" aria-label="haircut">💇‍♀️</span>}
          </div>
        <p className="mt-2 text-white text-opacity-90">{description}</p>
      </div>

      {/* Expandable Content */}
      <div className="p-6">
        <motion.div
          animate={{
            maxHeight: isExpanded ? `${(services.length * 101)}px` : '128px',
            opacity: isExpanded ? 1 : 0.95
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="overflow-hidden relative"
        >
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              </div>
            ))}
          </div>

          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          )}
        </motion.div>

        {/* Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-purple-600 font-medium text-sm flex items-center hover:text-purple-700 transition"
        >
          {isExpanded ? "Show less" : "Show more"}
          <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${isExpanded ? "rotate-[-180deg]" : ""}`} />
        </button>
      </div>
    </motion.div>
  )
}

function TestimonialCard({ name, rank, quote, rating = 0 }) {
  // Ensure rating is between 0 and 5
  const validRating = Math.min(Math.max(rating, 0), 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="bg-white rounded-3xl shadow-md p-6"
    >
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center text-white font-bold text-xl mr-4">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className={`bg-gradient-to-r ${rankClasses[rank]} px-3 py-1.5 rounded-full flex items-center gap-2 font-semibold text-xs w-fit`}>
            <Award className="w-4 h-4" />
            {rank} Member
          </p>
        </div>
      </div>
      <div className="mb-4">
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <Star
              key={starValue}
              className={`inline-block h-4 w-4 ${
                starValue <= validRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
              }`}
            />
          );
        })}
      </div>
      <p className="text-gray-700 italic">"{quote}"</p>
    </motion.div>
  );
}

const rankClasses = {
    Bronze: "from-amber-300 to-amber-500 text-gray-700",
    Silver: "from-gray-300 to-gray-400 text-gray-700",
    Gold: "from-yellow-300 to-yellow-500 text-yellow-700",
    Platinum: "from-slate-300 to-slate-400 text-slate-600",
    Diamond:
      "from-blue-400 to-purple-600 text-white",
  }

const ranks = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
const thresholds = [0, 10, 25, 50, 100];

const getRank = (bookingCount) => {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (bookingCount >= thresholds[i]) {
      return ranks[i];
    }
  }
  return "Bronze";
};

export default HomePage
