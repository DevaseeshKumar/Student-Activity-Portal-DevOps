import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaUserGraduate } from "react-icons/fa";

const Home = () => {
  return (
    <>
      <MainNavbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-white overflow-hidden px-6">
        {/* Background floating shapes */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-200 rounded-full opacity-20 animate-slow-pulse"></div>
        <div className="absolute -bottom-32 -right-16 w-60 h-60 bg-sky-300 rounded-full opacity-15 animate-slow-pulse"></div>
        <div className="absolute top-10 right-32 w-40 h-40 bg-sky-100 rounded-full opacity-10 animate-slow-pulse"></div>
        <div className="absolute bottom-10 left-32 w-48 h-48 bg-sky-200 rounded-full opacity-15 animate-slow-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-sky-50 rounded-full opacity-10 animate-slow-pulse"></div>

        <div className="max-w-6xl w-full flex flex-col md:flex-row items-center gap-10 relative z-10">
          
          {/* Left: Floating Student Icon */}
          <div className="flex-1 flex justify-center md:justify-start">
            <div className="bg-sky-500 rounded-full p-8 shadow-2xl animate-slow-bounce">
              <FaUserGraduate className="text-white text-8xl md:text-9xl" />
            </div>
          </div>

          {/* Right: Title & Buttons */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900">
              Welcome to{" "}
              <span className="text-sky-500">
                Student Activity Portal
              </span>
            </h1>
            <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-lg">
              Centralized platform to manage, participate, and track all your college events effortlessly.
            </p>
            <div className="flex gap-4 flex-wrap justify-center md:justify-start">
              <Link to="/features">
                <button className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
                  Explore Features
                </button>
              </Link>
              <Link to="/student/signup">
                <button className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Help Button */}
      <Link
        to="/contact"
        className="fixed bottom-6 right-6 bg-sky-500 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition transform hover:scale-110 z-50"
        title="Help & Support"
      >
        <span className="text-sm font-bold">HELP?</span>
      </Link>

      

      {/* Tailwind Custom Animations */}
      <style>
        {`
          @keyframes slow-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
          }
          .animate-slow-bounce {
            animation: slow-bounce 6s ease-in-out infinite;
          }

          @keyframes slow-pulse {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.2; }
          }
          .animate-slow-pulse {
            animation: slow-pulse 10s ease-in-out infinite;
          }
        `}
      </style>
    </>
  );
};

export default Home;
