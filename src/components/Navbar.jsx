import { Link } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
import { useEffect, useState } from "react";
import { auth } from "../firebase"; // Pastikan path sesuai dengan lokasi firebase.js
import { signOut, onAuthStateChanged } from "firebase/auth";

function NavigationBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  // <button
  //   onClick={() => {
  //     auth.signOut(); // Logout
  //     navigate("/login"); // Arahkan ke halaman login
  //   }}
  //   className="ml-4 bg-red-500 text-white py-2 px-4 rounded-full text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  // >
  //   Logout
  // </button>

  return (
    <Navbar expand="lg" bg="light" className="shadow-sm">
      <Container>
        <Navbar.Brand className="Brand" as={Link} to="/">
          {/* Angelic Salon & Spa */}
          <span className="text-pink-600">Angelic Salon & Spa</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/services">Services</Nav.Link>
            <Nav.Link as={Link} to="/about">About</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contact Us</Nav.Link>
            {user ? (
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;