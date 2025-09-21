import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { FaUserTie, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const Home = () => {
  return (
    <>
      <MainNavbar />

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-indigo-100 to-white px-6 py-24 text-gray-800">
        <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl p-12 border border-gray-200 text-center transform transition duration-500 hover:scale-105">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-gray-900">
            Welcome to the{" "}
            <span className="text-indigo-600 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Student Activity Portal
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 leading-relaxed text-gray-600">
            A centralized platform for managing, organizing, and participating in
            college events — built for Admins, Faculty, and Students.
          </p>
          <Link to="/features">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-lg font-semibold shadow-lg transition transform hover:scale-105 hover:shadow-xl">
              Explore Features
            </button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-indigo-700 tracking-tight">
            Platform Roles & Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mx-auto max-w-6xl">
            {/* Admin Card */}
            <div className="bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 flex flex-col items-center">
              <FaUserTie className="text-5xl text-indigo-700 mb-4 transition-transform hover:scale-110" />
              <h3 className="text-xl font-bold mb-3 text-indigo-800">Admin</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                Manage users, create events, assign faculty, and configure platform-wide settings.
              </p>
            </div>

            {/* Faculty Card */}
            <div className="bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 flex flex-col items-center">
              <FaChalkboardTeacher className="text-5xl text-emerald-700 mb-4 transition-transform hover:scale-110" />
              <h3 className="text-xl font-bold mb-3 text-emerald-800">Faculty</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                View assigned events, track participation, and manage student attendance.
              </p>
            </div>

            {/* Student Card */}
            <div className="bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 flex flex-col items-center">
              <FaUserGraduate className="text-5xl text-yellow-700 mb-4 transition-transform hover:scale-110" />
              <h3 className="text-xl font-bold mb-3 text-yellow-800">Student</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                Discover, register, and attend events. Track your participation and engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-20 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Sign up now and join your college community in managing and participating in amazing events!
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/student/signup">
            <button className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-bold shadow-lg transition transform hover:scale-105">
              Student Signup
            </button>
          </Link>
          <Link to="/faculty/register">
            <button className="px-8 py-3 bg-emerald-400 hover:bg-emerald-500 text-gray-900 rounded-xl font-bold shadow-lg transition transform hover:scale-105">
              Faculty Register
            </button>
          </Link>
        </div>
      </section>


    </>
  );
};

export default Home;
