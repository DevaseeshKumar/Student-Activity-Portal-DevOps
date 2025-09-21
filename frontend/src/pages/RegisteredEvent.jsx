import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../components/StudentNavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisteredEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/students/registered-events", {
          withCredentials: true,
        });

        let data = Array.isArray(res.data) ? res.data : [res.data];

        // fetch attendance for each event
        const eventsWithAttendance = await Promise.all(
          data.map(async (event) => {
            try {
              const attRes = await axios.get(
                `http://localhost:8080/api/students/events/${event.id}/attendance`,
                { withCredentials: true }
              );
              return { ...event, attendance: attRes.data };
            } catch {
              return { ...event, attendance: null };
            }
          })
        );

        setEvents(eventsWithAttendance);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Redirecting to login...", { autoClose: 3000 });
          setTimeout(() => window.location.href = "/student/login", 3000);
        } else {
          toast.error("Failed to fetch registered events.", { autoClose: 3000 });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, []);

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <>
        <StudentNavbar />
        <div className="text-center py-10 text-blue-600 text-lg font-medium">
          Loading events...
        </div>
      </>
    );

  if (!events.length) {
    return (
      <>
        <StudentNavbar />
        <div className="text-center py-10 text-gray-600">
          You haven't registered for any event yet.
        </div>
      </>
    );
  }

  return (
    <>
      <StudentNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Count + Search */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <h2 className="text-3xl font-extrabold text-blue-700 mb-4 sm:mb-0">
            Registered Events
          </h2>

          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full shadow-md transition hover:scale-105 hover:shadow-lg">
            <span className="text-sm font-medium tracking-wide uppercase">Total</span>
            <span className="text-lg font-bold">{filteredEvents.length}</span>
            <span className="text-sm font-medium">Events</span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search events..."
          className="w-full sm:w-64 px-4 py-2 mb-6 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition duration-300 p-6"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h3>
              <p className="text-gray-600 mb-1">
                <strong>Description:</strong> {event.description || "No description"}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Date:</strong> {event.date}
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Venue:</strong> {event.venue}
              </p>

              {/* ✅ Attendance */}
              <p className="mt-2 text-sm">
                <strong>Attendance:</strong>{" "}
                {event.attendance === null
                  ? "Not Marked"
                  : event.attendance
                  ? "✅ Present"
                  : "❌ Absent"}
              </p>

              <div className="mt-4 border-t pt-4">
                <h4 className="text-lg font-semibold text-blue-600 mb-1">Faculty Info</h4>
                <p className="text-gray-700 text-sm">
                  <strong>Name:</strong> {event.facultyName}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Email:</strong> {event.facultyEmail || "N/A"}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong>Department:</strong> {event.facultyDepartment || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default RegisteredEvent;
