import { useState } from "react";
import axios from "../api/axiosInstance";
import MainNavbar from "../components/MainNavbar";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/forgot-password", { email });
      toast.success("Reset link sent. Check your email.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setEmail(""); // Clear input
    } catch (err) {
      toast.error("Email not found. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <>
      <MainNavbar />
      <ToastContainer />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800 px-4 py-20">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 border border-gray-300 dark:border-gray-700 transition-all">
          <h2 className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400 mb-6">
            Forgot Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition hover:scale-[1.02]"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
