import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";
import { FaUserTie, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const Features = () => {
  return (
    <>
      <MainNavbar />
      <section className="min-h-screen bg-gray-50 px-6 py-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-12 text-indigo-700">
            Platform Roles & Features
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mx-auto max-w-6xl">
            {/* Admin */}
            <div className="bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 flex flex-col items-center">
              <FaUserTie className="text-5xl text-indigo-700 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-indigo-800">Admin</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                Manage users, create events, assign faculty, and configure platform-wide settings.
              </p>
            </div>

            {/* Faculty */}
            <div className="bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 flex flex-col items-center">
              <FaChalkboardTeacher className="text-5xl text-emerald-700 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-emerald-800">Faculty</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                View assigned events, conduct events, and manage student attendance.
              </p>
            </div>

            {/* Student */}
            <div className="bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-50 p-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 flex flex-col items-center">
              <FaUserGraduate className="text-5xl text-yellow-700 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-yellow-800">Student</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                Discover, register, and attend events. Track your participation and engagement.
              </p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
};

export default Features;
