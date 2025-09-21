import React from "react";
import MainNavbar from "../components/MainNavbar";
import Footer from "../components/Footer";

const Privacy = () => {
  return (
    <>
      <MainNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-indigo-100 to-white px-6 py-24 text-gray-800">
        <div className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl p-12 border border-gray-200 text-center">
          <h1 className="text-4xl font-extrabold mb-6 text-indigo-700">Privacy Policy</h1>
          <p className="text-lg mb-8 text-gray-600">
            Your privacy is important to us. Here we explain how we collect, use, and protect your data while using the Student Activity Portal.
          </p>
          <ul className="text-left text-gray-700 list-disc list-inside space-y-2">
            <li>We do not share your personal information with third parties without consent.</li>
            <li>All user data is stored securely and encrypted where applicable.</li>
            <li>You can request data deletion at any time.</li>
            <li>Cookies are used only for enhancing user experience and session management.</li>
          </ul>
        </div>
      </div>

    </>
  );
};

export default Privacy;
