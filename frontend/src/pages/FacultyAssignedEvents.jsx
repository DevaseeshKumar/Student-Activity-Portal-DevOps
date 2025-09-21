import React, { useEffect, useState } from "react";
import axios from "axios";
import FacultyNavbar from "../components/FacultyNavbar";

const FacultyAssignedEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedEventStudents, setSelectedEventStudents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/faculty/events", { withCredentials: true })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setEvents(res.data);
          setMessage("");
        } else {
          setMessage("No events assigned yet.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching assigned events", err);
        setMessage("Failed to fetch events.");
        setLoading(false);
      });
  }, []);

  const handleViewStudents = async (event) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/faculty/events/${event.id}/students`,
        { withCredentials: true }
      );

      const studentsWithAttendance = res.data.map((s) => ({
        ...s,
        attendance: s.attendance ?? null,
      }));

      setSelectedEventStudents(studentsWithAttendance);
      setCurrentEvent(event);
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  };

  const handleMarkAttendance = async (studentId, present) => {
    try {
      await axios.post(
        `http://localhost:8080/api/faculty/events/${currentEvent.id}/attendance`,
        null,
        {
          params: { studentId, present },
          withCredentials: true,
        }
      );

      setSelectedEventStudents((prev) =>
        prev.map((s) =>
          s.studentId === studentId ? { ...s, attendance: present } : s
        )
      );
    } catch (err) {
      console.error("Error marking attendance", err);
      alert("Failed to mark attendance.");
    }
  };

  return (
    <>
      <FacultyNavbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
          My Assigned Events
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading events...</p>
        ) : message ? (
          <p className="text-center text-red-600">{message}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold text-blue-800 mb-2">
                  {event.name}
                </h2>
                <p className="text-gray-700 mb-1">{event.description}</p>
                <p className="text-sm text-gray-600">
                  📅 <strong>Date:</strong> {event.date}
                </p>
                <p className="text-sm text-gray-600">
                  📍 <strong>Venue:</strong> {event.venue}
                </p>
                <button
                  onClick={() => handleViewStudents(event)}
                  className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
                >
                  View Registered Students
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-[95%] max-w-4xl shadow-xl overflow-y-auto max-h-[85vh] relative">
              <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
                Registered Students - {currentEvent?.name}
              </h2>

              {selectedEventStudents.length === 0 ? (
                <p className="text-center text-gray-500">
                  No students registered for this event.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Phone</th>
                        <th className="border p-2">Department</th>
                        <th className="border p-2">Attendance</th>
                        <th className="border p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEventStudents.map((student) => (
                        <tr key={student.studentId} className="hover:bg-gray-50">
                          <td className="border p-2">{student.name}</td>
                          <td className="border p-2">{student.email}</td>
                          <td className="border p-2">{student.phone}</td>
                          <td className="border p-2">{student.department}</td>
                          <td className="border p-2 text-center">
                            {student.attendance === null ? (
                              <span className="text-gray-500">Not Marked</span>
                            ) : student.attendance ? (
                              <span className="text-green-600 font-medium">
                                Present
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="border p-2 flex justify-center gap-2">
                            <button
                              onClick={() =>
                                handleMarkAttendance(student.studentId, true)
                              }
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                            >
                              Present
                            </button>
                            <button
                              onClick={() =>
                                handleMarkAttendance(student.studentId, false)
                              }
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                            >
                              Absent
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                onClick={() => setShowPopup(false)}
                className="mt-6 px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FacultyAssignedEvents;
