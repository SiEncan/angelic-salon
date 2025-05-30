import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import NavigationBar from "../components/NavigationBar";
import Carousel from "../components/Carousel";
import CustomerBookingModal from "../components/customer-profile/CustomerBookingModal";
import FeedbackModal from "../components/BookingFeedbackModal";

const HomePage = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);


  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackModalType, setFeedbackModalType] = useState("");
  const [feedbackModalTitle, setFeedbackModalTitle] = useState("");
  const [feedbackModalDescription, setFeedbackModalDescription] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserId(currentUser.uid);
        await fetchUserData(currentUser.uid);
      } else {
        setUserId(null);
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (currentUser) => {
    try {
      const userDocRef = doc(db, "users", currentUser);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setProfile(userDoc.data());
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-pink-300">
      <div className="max-w-screen-2xl mx-auto">
        
        <NavigationBar />

        <div className="grid grid-cols-2 md:grid-cols-2 grid-rows-1 gap-4 py-4 px-4">
          <div className="flex flex-col justify-center">
            <div className="font-extrabold text-xl md:text-4xl lg:text-5xl xl:text-7xl leading-tight mb-4 bg-gradient-to-br from-purple-400 to-pink-200 bg-clip-text text-transparent">
              <div>PERCAYA</div>
              <div>DIRI DATANG</div>
              <div className="md:hidden text-md bg-gradient-to-br from-purple-400 to-purple-300 text-white shadow-lg rounded-xl p-2 mt-2 w-fit">
                Dari Kamu!
              </div>
              <div className="hidden md:flex text-4xl lg:text-5xl bg-gradient-to-br from-purple-400 to-purple-300 text-white shadow-lg rounded-xl p-3 mt-2 w-fit">
                Dari Kamu!
              </div>
            </div>
            <p className="font-normal md:mt-4 text-xs lg:text-base xl:text-xl max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl text-slate-600">
              Temukan keindahan sejati dengan sentuhan ahli dari Angelic Salon &
              Spa. Wujudkan rambut impianmu dengan perawatan terbaik yang
              dirancang khusus untuk memancarkan pesonamu.
            </p>
            <button
              onClick={() => {
                if (userId) {
                  setIsBookingOpen(true);
                } else {
                  setFeedbackModalType("failed");
                  setFeedbackModalTitle("You need to be logged in.");
                  setFeedbackModalDescription("Please log in to book an appointment.");
                  setIsFeedbackModalOpen(true);
                }
              }}
              className="md:hidden w-fit bg-[#171A31] hover:bg-opacity-80 transition duration-200 text-xs sm:text-sm font-semibold shadow-lg rounded-lg px-3 py-2 text-white"
            >
              Book an Appointment
            </button>
            <button
               onClick={() => {
                if (userId) {
                  setIsBookingOpen(true);
                } else {
                  setFeedbackModalType("failed");
                  setFeedbackModalTitle("You need to be logged in.");
                  setFeedbackModalDescription("Please log in to book an appointment.");
                  setIsFeedbackModalOpen(true);
                }
              }}
              className="hidden md:flex w-fit bg-[#171A31] hover:bg-opacity-80 transition duration-200 font-semibold shadow-lg rounded-lg px-5 py-3 mt-2 text-white"
            >
              Book an Appointment
            </button>
          </div>
          
          {userId && profile && (
            <CustomerBookingModal
              userId={userId}
              profile={profile}
              isOpen={isBookingOpen}
              setIsOpen={setIsBookingOpen}
            />
          )}

          {/* SMALL */}
          <div className="flex h-[50%] w-full relative justify-center items-end md:hidden">
            <div className="h-[75%] w-full absolute bottom-0 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-300 shadow-lg rounded-xl"></div>
            <img src="/images/hero-image.png" className="relative" />
          </div>

          {/* L laptop - 1024P */}
          <div className="flex w-full relative justify-center items-end hidden md:flex xl:hidden">
            <div className="h-[75%] w-full absolute bottom-0 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-300 shadow-lg rounded-xl"></div>
            <img src="/images/hero-image.png" className="relative" />
          </div>

          {/* XL laptopL = 1440P */}
          <div className="flex w-full relative justify-center items-center hidden xl:flex">
            <div className="h-[75%] w-full absolute bottom-0 bg-gradient-to-br from-pink-400 via-pink-300 to-purple-300 shadow-lg rounded-xl"></div>
            <img src="/images/hero-image.png" className="relative" />
          </div>
        </div>

        <section className="text-center bg-purple-200 bg-opacity-50 rounded-3xl shadow-md mx-4 mt-16">
          <Carousel />
        </section>

        {/* About Section */}
        <section id="about" className="py-16">
          <h3 className="text-3xl font-bold mb-4 text-center">About Us</h3>
          <p className="text-gray-700 text-center max-w-2xl mx-auto">
            Angelic Salon & Spa is your sanctuary of serenity. We offer a full
            range of beauty and wellness treatments in a peaceful environment,
            designed to pamper and revitalize you.
          </p>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16">
          <h3 className="text-3xl font-bold mb-8 text-center">Our Services</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <ServiceCard
              title="Hair Styling"
              desc="Trendy and elegant cuts and styles."
            />
            <ServiceCard
              title="Facials"
              desc="Deep cleansing and glowing skin treatments."
            />
            <ServiceCard
              title="Massage Therapy"
              desc="Relaxing full-body massage sessions."
            />
          </div>
        </section>

        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          type={feedbackModalType}
          title={feedbackModalTitle}
          description={feedbackModalDescription}
          onClose={() => setIsFeedbackModalOpen(false)}
        />

        {/* Contact Section */}
        <section id="contact" className="py-16">
          <h3 className="text-3xl font-bold mb-4 text-center">Contact Us</h3>
          <p className="text-center text-gray-600 mb-6">
            Visit our salon or get in touch for appointments.
          </p>
          <div className="text-center">
            <p>📍 Jln. Padat Karya, Kota Prabumulih</p>
            <p>📞 0821-7526-6137</p>
            <p>Instagram: @angelic_salonspamuslimah</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-gray-500 py-6 text-sm border-t mt-12">
          © 2025 Angelic Salon & Spa. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

function ServiceCard({ title, desc }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg p-6 transition">
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}

export default HomePage;
