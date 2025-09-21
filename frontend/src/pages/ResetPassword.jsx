// ResetPassword.jsx
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import MainNavbar from "../components/MainNavbar";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return toast.error("Password is required");

    try {
      await axios.post("http://localhost:8080/api/admin/reset-password", {
        token,
        newPassword,
      });
      toast.success("Password reset successful!");
      navigate("/admin/login");
    } catch (err) {
      toast.error(
        err.response?.data || "Something went wrong. Try again later."
      );
    }
  };

  return (
    <>
      <MainNavbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Reset Password
          </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-4"
            placeholder="Enter new password"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default ResetPassword;
