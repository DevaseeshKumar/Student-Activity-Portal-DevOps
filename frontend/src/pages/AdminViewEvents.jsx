import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const AdminViewEvents = () => {
  const [events, setEvents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedEventStudents, setSelectedEventStudents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [showEditPopup, setShowEditPopup] = useState(false);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const navigate = useNavigate();


  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...", { autoClose: 2000 });
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.response?.data || err.message || "An error occurred");
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/events", {
        withCredentials: true,
      });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/faculties", {
        withCredentials: true,
      });
      setFaculties(res.data || []);
    } catch (err) {
      handleSessionError(err);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => {
        fetchEvents();
        fetchFaculties();
      })
      .catch(handleSessionError);
  }, [navigate]);

  const handleViewStudents = async (eventId) => {
    setFetchingStudents(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/api/admin/events/${eventId}/students`,
        { withCredentials: true }
      );
      setSelectedEventStudents(
        res.data.map((s) => ({ ...s, attendance: s.attendance ?? null }))
      );
      setShowPopup(true);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setFetchingStudents(false);
    }
  };

  const handleEditEvent = (event) => {
  setEditEvent({
    ...event,
    facultyId: event.facultyId ?? event.faculty?.id ?? "", // ✅ sets facultyId for the dropdown
  });
  setShowEditPopup(true);
};


  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8080/api/admin/events/${editEvent.id}`,
        {
          name: editEvent.name,
          description: editEvent.description,
          date: editEvent.date,
          venue: editEvent.venue,
          facultyId: editEvent.facultyId || null, // 🔹 Faculty reassignment here
        },
        { withCredentials: true }
      );
      toast.success("Event updated successfully");
      setShowEditPopup(false);
      fetchEvents();
    } catch (err) {
      handleSessionError(err);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      await axios.delete(`http://localhost:8080/api/admin/events/${eventToDelete.id}`, {
        withCredentials: true,
      });
      toast.success("Event deleted successfully");
      setShowDeletePopup(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err) {
      handleSessionError(err);
    }
  };

  if (loading)
    return (
      <>
        <ToastContainer position="top-center" autoClose={3000} theme="light" />
        <p className="text-center mt-10 text-indigo-600 text-lg">Loading events...</p>
      </>
    );

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="light" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 bg-gray-100 min-h-screen text-gray-900"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Events</h1>

        {events.length === 0 ? (
          <p className="text-center text-red-500">No events found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  {event.name}
                </h2>
                <p className="mb-1">{event.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {event.date}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Venue:</strong> {event.venue}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Faculty:</strong> {event.facultyName || "Unassigned"}
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleViewStudents(event.id)}
                    disabled={fetchingStudents}
                    className={`w-full py-2 rounded-lg text-white font-medium transition ${
                      fetchingStudents
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {fetchingStudents ? "Fetching Students..." : "View Students"}
                  </button>

                  <button
                    onClick={() => handleEditEvent(event)}
                    className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition"
                  >
                    Edit Event
                  </button>

                  <button
                    onClick={() => {
                      setEventToDelete(event);
                      setShowDeletePopup(true);
                    }}
                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔹 Edit Event Popup (with faculty dropdown) */}
        {showEditPopup && editEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg shadow-xl relative">
              <h2 className="text-2xl font-bold mb-4 text-center">Edit Event</h2>
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                <input
                  type="text"
                  value={editEvent.name}
                  onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
                  placeholder="Event Name"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <textarea
                  value={editEvent.description}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, description: e.target.value })
                  }
                  placeholder="Description"
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={editEvent.date}
                  onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                  placeholder="Date"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  value={editEvent.venue}
                  onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })}
                  placeholder="Venue"
                  className="w-full border px-3 py-2 rounded"
                  required
                />

                {/* 🔹 Faculty dropdown for reassign */}
                <select
  value={editEvent.facultyId || ""}
  onChange={(e) =>
    setEditEvent({ ...editEvent, facultyId: e.target.value })
  }
  className="w-full border px-3 py-2 rounded"
>
  <option value="">Assigned Faculty: {editEvent.facultyName || "Unassigned"}</option>
  {faculties.map((f) => (
    <option key={f.id} value={f.id}>
      {f.name} ({f.department})
    </option>
  ))}
</select>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditPopup(false)}
                    className="flex-1 px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🔹 Students Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg shadow-xl overflow-y-auto max-h-[85vh] relative">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Registered Students
              </h2>

              {selectedEventStudents.length === 0 ? (
                <p className="text-center text-gray-500">
                  No students have registered for this event.
                </p>
              ) : (
                <ul className="space-y-4">
                  {selectedEventStudents.map((student) => (
                    <li
                      key={student.id}
                      className="bg-gray-100 p-4 rounded-md shadow"
                    >
                      <p>
                        <strong>Name:</strong> {student.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {student.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {student.phone}
                      </p>
                      <p>
                        <strong>Department:</strong> {student.department}
                      </p>
                      <p>
                        <strong>Attendance:</strong>{" "}
                        {student.attendance === null
                          ? "Not Marked"
                          : student.attendance
                          ? "Present"
                          : "Absent"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => setShowPopup(false)}
                className="mt-6 px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* 🔹 Delete Confirmation Popup */}
        {showDeletePopup && eventToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-xl relative text-center">
              <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
              <p className="mb-6">
                Are you sure you want to delete <strong>{eventToDelete.name}</strong>?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteEvent}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeletePopup(false);
                    setEventToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default AdminViewEvents;
