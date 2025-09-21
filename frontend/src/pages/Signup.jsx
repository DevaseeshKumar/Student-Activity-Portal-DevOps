import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainNavbar from "../components/MainNavbar";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    department: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/students/signup", formData, {
        withCredentials: true,
      });
      toast.success("Signup successful!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });
    } catch (err) {
      toast.error(err.response?.data || "Signup failed", {
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
          onSubmit={handleSignup}
          className="bg-white border border-gray-200 p-10 rounded-3xl w-full max-w-md shadow-xl transition-all"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-indigo-700">
            Student Signup
          </h2>

          {["name", "email", "phone", "department", "password"].map((field) => (
            <input
              key={field}
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={field[0].toUpperCase() + field.slice(1)}
              value={formData[field]}
              onChange={handleChange}
              required
              className="w-full mb-5 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          ))}

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition transform hover:scale-[1.02]"
          >
            Signup
          </button>
        </form>
      </div>
    </>
  );
}

export default Signup;
