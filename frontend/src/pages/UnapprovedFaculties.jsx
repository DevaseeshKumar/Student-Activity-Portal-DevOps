import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const UnapprovedFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null); // ✅ Added admin state
  const navigate = useNavigate();

  // ✅ Common handler for session errors
  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.message || "An error occurred");
    }
  };

  // ✅ Fetch logged-in admin details
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then((res) => {
        setAdmin({ username: res.data.username, email: res.data.email });
      })
      .catch((err) => {
        handleSessionError(err);
      });
  }, [navigate]);

  // ✅ Fetch pending faculties
  const fetchUnapprovedFaculties = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/admin/unapproved-faculties",
        { withCredentials: true }
      );
      setFaculties(res.data);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnapprovedFaculties();
  }, []);

  // ✅ Approve faculty
  const handleApprove = async (id) => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/approve-faculty/${id}`,
        null,
        { withCredentials: true }
      );
      toast.success("Faculty approved and email sent");
      fetchUnapprovedFaculties();
    } catch (err) {
      handleSessionError(err);
    }
  };

  // ✅ Reject faculty
  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await axios.put(
        `http://localhost:8080/api/admin/reject-faculty/${id}`,
        null,
        { params: { reason }, withCredentials: true }
      );
      toast.success("Faculty rejected and email sent");
      fetchUnapprovedFaculties();
    } catch (err) {
      handleSessionError(err);
    }
  };

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-800">
          Pending Faculty Approvals
        </h1>

        

        {loading ? (
          <p className="text-center text-gray-600">Loading...</p>
        ) : faculties.length === 0 ? (
          <p className="text-center text-gray-600">
            No pending faculty approvals.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty, index) => (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300"
              >
                <h2 className="text-xl font-semibold text-indigo-800 dark:text-white">
                  {faculty.name}
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  <strong>Email:</strong> {faculty.email}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Department:</strong> {faculty.department}
                </p>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(faculty.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(faculty.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UnapprovedFaculties;
