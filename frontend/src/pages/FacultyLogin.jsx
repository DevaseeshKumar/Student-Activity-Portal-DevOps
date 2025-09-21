import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/MainNavbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FacultyLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:8080/api/faculty/login",
        form,
        { withCredentials: true }
      );
      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
      setTimeout(() => {
        navigate("/faculty/dashboard");
      }, 1500);
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
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
            Faculty Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default FacultyLogin;
