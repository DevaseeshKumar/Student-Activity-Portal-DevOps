import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const AddEvent = () => {
  const [eventData, setEventData] = useState({
    name: "",
    description: "",
    date: "",
    venue: "",
    facultyId: "",
  });
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // new
  const navigate = useNavigate();

  // ✅ Session & error handler
  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...", { autoClose: 2000 });
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.response?.data || err.message || "An error occurred");
    }
  };

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/faculties", {
          withCredentials: true,
        });
        setFaculties(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        handleSessionError(err);
      } finally {
        setLoading(false);
      }
    };

    // Validate session before fetching
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => fetchFaculties())
      .catch((err) => handleSessionError(err));
  }, [navigate]);

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post("http://localhost:8080/api/admin/create-event", eventData, {
        withCredentials: true,
      });
      toast.success("Event created successfully!");
      setEventData({
        name: "",
        description: "",
        date: "",
        venue: "",
        facultyId: "",
      });
    } catch (err) {
      handleSessionError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} />
        <p className="text-center mt-10 text-indigo-600 text-lg">Loading...</p>
      </>
    );

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-indigo-800 mb-6 text-center">
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Event Name"
            value={eventData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={eventData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={eventData.venue}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
            required
          />

          <select
            name="facultyId"
            value={eventData.facultyId}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value="">-- Select Faculty --</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} - {faculty.department}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-2 rounded-lg text-white font-medium transition ${
              submitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? "Adding Event..." : "Add Event"}
          </button>
        </form>
      </motion.div>
    </>
  );
};

export default AddEvent;
