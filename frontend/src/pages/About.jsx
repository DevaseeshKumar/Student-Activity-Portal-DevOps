import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

const About = () => {
  return (
    <>
      <MainNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-indigo-100 to-white px-6 py-24 text-gray-800">
        <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl p-12 border border-gray-200 text-center">
          <h1 className="text-4xl font-extrabold mb-6 text-indigo-700">About Us</h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            The Student Activity Portal is designed to streamline college events and activities.
            Admins, Faculty, and Students can interact in one central platform — manage events,
            assign tasks, track participation, and ensure smooth operations.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our goal is to enhance engagement, simplify event management, and foster a collaborative
            environment for everyone in your college community.
          </p>
        </div>
      </div>

    </>
  );
};

export default About;
