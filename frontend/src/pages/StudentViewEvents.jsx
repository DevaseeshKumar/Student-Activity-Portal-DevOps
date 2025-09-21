import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../components/StudentNavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const eventsRes = await axios.get("http://localhost:8080/api/students/events", { withCredentials: true });
      setEvents(eventsRes.data);

      const regRes = await axios.get("http://localhost:8080/api/students/registered-events", { withCredentials: true });
      setRegisteredEvents(regRes.data.map(e => e.id));

      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.", { autoClose: 3000 });
        setTimeout(() => window.location.href = "/student/login", 3000);
      } else {
        toast.error("Failed to fetch events.", { autoClose: 3000 });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`http://localhost:8080/api/students/register-event/${eventId}`, {}, { withCredentials: true });
      setRegisteredEvents(prev => [...prev, eventId]);
      toast.success("Registered successfully!", { autoClose: 2000 });
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...", { autoClose: 3000 });
        setTimeout(() => window.location.href = "/student/login", 3000);
      } else {
        toast.error(err.response?.data || "Registration failed", { autoClose: 3000 });
      }
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      await axios.post(`http://localhost:8080/api/students/unregister-event/${eventId}`, {}, { withCredentials: true });
      setRegisteredEvents(prev => prev.filter(id => id !== eventId));
      toast.success("Unregistered successfully!", { autoClose: 2000 });
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Session expired. Redirecting to login...", { autoClose: 3000 });
        setTimeout(() => window.location.href = "/student/login", 3000);
      } else {
        toast.error("Unregistration failed", { autoClose: 3000 });
      }
    }
  };

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <StudentNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-blue-800">Events</h2>
          <input
            type="text"
            placeholder="Search events..."
            className="w-full md:w-64 px-4 py-2 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-blue-600">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="text-center text-red-500">No events found.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white border border-gray-200 shadow-md rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">{event.name}</h3>
                  <p className="text-gray-700 text-sm mb-1"><strong>Description:</strong> {event.description || "No description"}</p>
                  <p className="text-gray-700 text-sm mb-1"><strong>Date:</strong> {event.date}</p>
                  <p className="text-gray-700 text-sm mb-1"><strong>Venue:</strong> {event.venue}</p>
                  <p className="text-gray-700 text-sm mb-3"><strong>Faculty:</strong> {event.facultyName}</p>
                </div>

                <div className="mt-4">
                  {registeredEvents.includes(event.id) ? (
                    <button
                      onClick={() => handleUnregister(event.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Unregister
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentViewEvents;
