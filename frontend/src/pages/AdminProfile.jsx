import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";

const AdminProfile = () => {
  const [admin, setAdmin] = useState({ username: "", email: "" });
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then((res) => {
        setAdmin({ username: res.data.username, email: res.data.email });
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          toast.error("Session expired. Redirecting to login...");
          setTimeout(() => navigate("/admin/login"), 2000);
        } else {
          toast.error("Failed to fetch admin data");
        }
      });
  }, [navigate]);

  const handleProfileUpdate = async () => {
    try {
      await axios.put("http://localhost:8080/api/admin/update", admin, {
        withCredentials: true,
      });
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      await axios.put(
        "http://localhost:8080/api/admin/update-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data || "Failed to update password");
    }
  };

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">
          Admin Profile
        </h2>

        {/* Profile Section */}
        <div className="mb-8">
          <label className="block mb-1 font-semibold text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={admin.username}
            onChange={(e) => setAdmin({ ...admin, username: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
          />

          <label className="block mt-4 mb-1 font-semibold text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={admin.email}
            onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
          />

          <button
            onClick={handleProfileUpdate}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition"
          >
            Update Profile
          </button>
        </div>

        <hr className="border-gray-300 my-8" />

        {/* Password Section */}
        <h3 className="text-2xl font-bold text-green-700 mb-4">
          Change Password
        </h3>

        <label className="block mb-1 font-semibold text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400"
        />

        <label className="block mt-4 mb-1 font-semibold text-gray-700">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-400"
        />

        <button
          onClick={handlePasswordUpdate}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
        >
          Update Password
        </button>
      </motion.div>
    </>
  );
};

export default AdminProfile;
