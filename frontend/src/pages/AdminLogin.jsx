import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api/axiosInstance";
import MainNavbar from "../components/MainNavbar";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/login", { email, password });
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (err) {
      toast.error("Invalid credentials", {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-white to-blue-50 px-4 py-20">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-xl p-10">
          <h2 className="text-4xl font-bold text-center text-indigo-700 mb-8">
            Admin Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-right">
            <Link
              to="/admin/forgot-password"
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
