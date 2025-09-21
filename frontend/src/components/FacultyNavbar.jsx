import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FacultyNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/faculty/logout", {}, { withCredentials: true });
      toast.success("Logged out successfully!", { autoClose: 2000 });
    } catch (err) {
      toast.error("Error logging out. Clearing session...");
    } finally {
      setTimeout(() => navigate("/faculty/login"), 2000);
    }
  };

  const navLinks = [
    { label: "Dashboard", to: "/faculty/dashboard" },
    
    { label: "My Events", to: "/faculty/assigned-events" },
    { label: "Profile", to: "/faculty/profile" },
  ];

  return (
    <>
      <nav className="bg-gradient-to-r from-green-700 via-teal-600 to-cyan-600 shadow-xl text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center">
          {/* Logo */}
          <div className="text-3xl font-extrabold mb-2 sm:mb-0 tracking-wide">
            <Link
              to="/faculty/dashboard"
              className="hover:text-yellow-300 transition duration-300"
            >
              🎓 Faculty Panel
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm sm:text-base font-semibold transition duration-300 group ${
                  location.pathname === link.to
                    ? "text-yellow-300 drop-shadow-sm"
                    : "hover:text-yellow-300"
                }`}
              >
                {link.label}
                <span
                  className={`absolute left-0 bottom-0 h-0.5 bg-yellow-300 transition-all duration-300 ease-in-out ${
                    location.pathname === link.to ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
            ))}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 text-sm sm:text-base rounded-lg shadow-md font-semibold transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Toast Container */}
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
    </>
  );
};

export default FacultyNavbar;
