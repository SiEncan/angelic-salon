import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import BookingForm from "./BookingForm";
import NavigationBar from "./Navbar";
import "../styles/HeroSection.css";

const HeroSection = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <NavigationBar />

      <div className="hero">
      <div className="hero-overlay"></div>
        <div className="hero-content">
          <p style={{fontSize:16}}>Hair Salon, Masseuse, Beauty Salon</p>
          <h1>Create Your Own</h1>
          <h1>Unique Hair Story</h1>
          <p style={{marginTop:20, fontSize:16}}>Award Winning Hair Salon Based in UK.</p>
          <Button 
            style={{
              paddingTop: 13,
              paddingBottom: 13,
              paddingRight: 20,
              paddingLeft: 20,
              fontSize: 12,
              marginTop: 20,
              marginRight: 10,
              transition: 'all 0.3s ease',
            }} 
            onClick={() => setShow(true)}
            className="book-now-btn"
            >
            SCHEDULE AN APPOINMENT
          </Button>

          <Button 
            style={{
              paddingTop: 13,
              paddingBottom: 13,
              paddingRight: 20,
              paddingLeft: 20,
              fontSize: 12,
              marginTop: 20,
              color: '#C8BCAC',
              transition: 'all 0.3s ease',
            }}
            className="our-service-btn"
            >
            OUR SERVICE
          </Button>
        </div>
      </div>

      {/* Booking Form dalam Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book an Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BookingForm closeModal={() => setShow(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HeroSection;