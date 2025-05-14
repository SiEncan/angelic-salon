import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import makeupArtistIcon from '../assets/icons/makeup-artist.svg';
import wellnessCenterIcon from '../assets/icons/wellnesscenter.svg';
import barberSalonIcon from '../assets/icons/barbersalon.svg';
import frisorsalonIcon from '../assets/icons/frisorsalon.svg';
import massageKlinikIcon from '../assets/icons/massageklinik.svg';
import fodterapeutIcon from '../assets/icons/fodterapeut.svg';
import creambath from '../assets/icons/creambath.png';
import handmassage from '../assets/icons/handmassage.png';
import menicure from '../assets/icons/menicure.png';
import ellipseIcon from '../assets/icons/ellipse.svg';

const services = [
  
  { id: 7, name: 'Cream Bath', icon: creambath },
  { id: 8, name: 'Hand Massage', icon: handmassage },
  { id: 9, name: 'Menicure', icon: menicure },
  { id: 1, name: 'Makeup-artist', icon: makeupArtistIcon },
  { id: 2, name: 'Wellnesscenter', icon: wellnessCenterIcon },
  { id: 3, name: 'Barbersalon', icon: barberSalonIcon },
  { id: 4, name: 'Frisørsalon', icon: frisorsalonIcon },
  { id: 5, name: 'Massageklinik', icon: massageKlinikIcon },
  { id: 6, name: 'Fodterapeut', icon: fodterapeutIcon },
];

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (currentIndex < services.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(services.length - 1);
    }
  };

  return (
    <div className="container my-5 d-flex align-items-center justify-content-center overflow-hidden" style={{ maxWidth: '1000px' }}>
      <button onClick={prevSlide} className="btn btn-light me-2">
        <ChevronLeft />
      </button>
      <div className="d-flex" style={{ overflow: 'hidden', width: '100%' }}>
        <div
          className="d-flex transition-transform"
          style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)`, transition: 'transform 0.3s ease-out', width: `${(services.length / 3) * 100}%` }}
        >
          {services.map((service) => (
            <div key={service.id} className="d-flex flex-column align-items-center" style={{ flex: '0 0 calc(100% / 4)' }}>
              <div className="position-relative my-5 d-flex align-items-center justify-content-center mb-2" style={{ width: '4rem', height: '4rem' }}>
                {/* <img src={ellipseIcon} alt="ellipse" className="position-absolute" style={{ width: '100%', left: '-10%' }} /> */}
                <img src={service.icon} alt={service.name} style={{ width: '100%', height: '100%', zIndex: '1' }} />
              </div>
              <p className="mt-3 text-center fw-medium">{service.name}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={nextSlide} className="btn btn-light ms-2">
        <ChevronRight />
      </button>
    </div>
  );
}
