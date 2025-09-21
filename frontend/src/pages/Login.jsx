import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainNavbar from "../components/MainNavbar";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/students/login", formData, {
        withCredentials: true,
      });
      toast.success("Login successful", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      setTimeout(() => navigate("/student/dashboard"), 1500);
    } catch (err) {
      toast.error(err.response?.data || "Login failed", {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-50 px-4 py-20">
        <form
          onSubmit={handleLogin}
          className="bg-white border border-gray-200 p-10 rounded-3xl w-full max-w-md shadow-xl transition-all"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700">
            Student Login
          </h2>

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full mb-5 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition transform hover:scale-[1.02]"
          >
            Login
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
  