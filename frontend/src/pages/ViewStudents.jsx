import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewEventsStudent, setViewEventsStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.response?.data || err.message || "An error occurred");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/students", {
        withCredentials: true,
      });
      const studentData = Array.isArray(res.data) ? res.data : [];
      setStudents(studentData);
      setFilteredStudents(studentData);
    } catch (err) {
      handleSessionError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => fetchStudents())
      .catch((err) => handleSessionError(err));
  }, [navigate]);

  // Search handler
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term.toLowerCase()) ||
        student.email.toLowerCase().includes(term.toLowerCase()) ||
        student.department.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const attemptDelete = (studentId) => {
    setDeleteConfirm(studentId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/students/${deleteConfirm}`,
        { withCredentials: true }
      );
      toast.success("Student deleted successfully");
      setDeleteConfirm(null);
      setShowDeleteConfirm(false);
      fetchStudents();
    } catch (err) {
      handleSessionError(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        name: editStudent.name,
        email: editStudent.email,
        phone: editStudent.phone,
        department: editStudent.department,
        gender: editStudent.gender,
      };

      await axios.put(
        `http://localhost:8080/api/admin/students/${editStudent.id}`,
        payload,
        { withCredentials: true }
      );
      toast.success("Student updated successfully");
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      handleSessionError(err);
    }
  };

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="p-6 min-h-screen bg-gray-100">
        {/* Total Count */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Total Students: {students.length}
        </h2>

        {/* Search Bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name, email, or department..."
            className="w-full max-w-md border rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {loading ? (
          <p className="text-center text-indigo-600">Loading students...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="text-center text-red-500">No students found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStudents.map((student, index) => (
              <div
                key={student.id || index}
                className="bg-white rounded-2xl shadow-lg p-5 flex flex-col justify-between transition-transform transform hover:-translate-y-2 hover:scale-105 duration-300"
              >
                {/* Card Body */}
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
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
                    <strong>Gender:</strong> {student.gender}
                  </p>
                  <p>
                    <strong>Registered Events:</strong>{" "}
                    {student.registeredEvents?.length || 0}
                  </p>
                </div>

                {/* Card Actions */}
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => setEditStudent({ ...student })}
                      className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => attemptDelete(student.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => setViewEventsStudent(student)}
                    className="mt-2 w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium transition"
                  >
                    View Events
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-96 text-center">
            <h3 className="text-lg font-bold mb-4 text-red-600">
              Confirm Delete
            </h3>
            <p className="mb-6">Are you sure you want to delete this student?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-96">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
              Edit Student
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editStudent.name}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, name: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Name"
              />
              <input
                type="email"
                value={editStudent.email}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, email: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Email"
              />
              <input
                type="text"
                value={editStudent.phone}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, phone: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Phone"
              />
              <input
                type="text"
                value={editStudent.department}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, department: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Department"
              />
              <select
                value={editStudent.gender}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, gender: e.target.value })
                }
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditStudent(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Events Modal */}
      {viewEventsStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
              {viewEventsStudent.name}'s Registered Events
            </h3>
            {viewEventsStudent.registeredEvents &&
viewEventsStudent.registeredEvents.length > 0 ? (
  <ul className="list-disc list-inside text-gray-700">
    {viewEventsStudent.registeredEvents.map((event, idx) => (
      <li key={idx}>{event}</li>
    ))}
  </ul>
) : (
  <p className="text-center text-red-500">
    No events registered.
  </p>
)}

            <div className="flex justify-center mt-4">
              <button
                onClick={() => setViewEventsStudent(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewStudents;
