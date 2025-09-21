import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-fuchsia-700 via-pink-600 to-rose-600 text-white py-8 mt-12 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 md:gap-0">
        {/* Brand Info */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-wide mb-1">
            🎓 Student Activity Portal
          </h2>
          <p className="text-sm text-pink-100">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center md:justify-end gap-6">
          <Link
            to="/about"
            className="relative font-medium text-sm sm:text-base hover:text-yellow-300 transition duration-300 group"
          >
            About
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            to="/contact"
            className="relative font-medium text-sm sm:text-base hover:text-yellow-300 transition duration-300 group"
          >
            Contact
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full"></span>
          </Link>
          <Link
            to="/privacy"
            className="relative font-medium text-sm sm:text-base hover:text-yellow-300 transition duration-300 group"
          >
            Privacy
            <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-300 transition-all group-hover:w-full"></span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
