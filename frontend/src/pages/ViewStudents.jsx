import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit state
  const [editStudent, setEditStudent] = useState(null);

  const navigate = useNavigate();

  // ✅ Session & error handler
  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.response?.data || err.message || "An error occurred");
    }
  };

  // ✅ Fetch students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/students", {
        withCredentials: true,
      });
      setStudents(Array.isArray(res.data) ? res.data : []);
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

  // ✅ Attempt delete
  const attemptDelete = (studentId) => {
    setDeleteConfirm(studentId);
    setShowDeleteConfirm(true);
  };

  // ✅ Confirm delete
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

  // ✅ Update student
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/students/${editStudent.id}`,
        editStudent,
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
        <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">
          All Registered Students
        </h2>

        {loading ? (
          <p className="text-center text-indigo-600">Loading students...</p>
        ) : students.length === 0 ? (
          <p className="text-center text-red-500">No students found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white border">
              <thead className="bg-blue-600 text-white">
  <tr>
    <th className="py-3 px-4 border">ID</th>
    <th className="py-3 px-4 border">Name</th>
    <th className="py-3 px-4 border">Email</th>
    <th className="py-3 px-4 border">Phone</th>
    <th className="py-3 px-4 border">Gender</th>
    <th className="py-3 px-4 border">Department</th>
    <th className="py-3 px-4 border">Registered Events</th>
    <th className="py-3 px-4 border text-center">Actions</th>
  </tr>
</thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id || index} className="hover:bg-gray-100 transition">
                    <td className="py-2 px-4 border text-center">{index + 1}</td>
                    <td className="py-2 px-4 border">{student.name}</td>
                    <td className="py-2 px-4 border">{student.email}</td>
                    <td className="py-2 px-4 border">{student.phone}</td>
                    <td className="py-2 px-4 border">{student.gender}</td>
                    <td className="py-2 px-4 border">{student.department}</td>
                    <td className="py-2 px-4 border text-center">{student.eventCount}</td> 
                    <td className="py-2 px-4 border text-center space-x-2">
                      <button
                        onClick={() => setEditStudent({ ...student })}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => attemptDelete(student.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 text-center">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this student?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Student</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editStudent.name}
                onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Name"
              />
              <input
                type="email"
                value={editStudent.email}
                onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <input
                type="text"
                value={editStudent.phone}
                onChange={(e) => setEditStudent({ ...editStudent, phone: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <input
                type="text"
                value={editStudent.department}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, department: e.target.value })
                }
                className="w-full border p-2 rounded"
                placeholder="Department"
              />
              <select
                value={editStudent.gender}
                onChange={(e) =>
                  setEditStudent({ ...editStudent, gender: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditStudent(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewStudents;
