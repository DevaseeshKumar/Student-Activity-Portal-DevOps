import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";
import "react-toastify/dist/ReactToastify.css";

const ViewAllFaculty = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  // delete + reassign states
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReassign, setShowReassign] = useState(false);
  const [reassignFacultyId, setReassignFacultyId] = useState("");

  // edit faculty
  const [editFaculty, setEditFaculty] = useState(null);

  const navigate = useNavigate();

  const handleSessionError = (err) => {
    if (err.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 2000);
    } else {
      toast.error(err.response?.data || err.message || "An error occurred");
    }
  };

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

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/admin/me", { withCredentials: true })
      .then(() => fetchFaculties())
      .catch((err) => handleSessionError(err));
  }, [navigate]);

  // Try deleting faculty → just open modal
  const attemptDelete = (facultyId) => {
    setDeleteConfirm(facultyId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete without reassignment
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/faculties/${deleteConfirm}`, {
        withCredentials: true,
      });
      toast.success("Faculty deleted successfully");
      setDeleteConfirm(null);
      setShowDeleteConfirm(false);
      fetchFaculties();
    } catch (err) {
      if (
        err.response?.status === 400 &&
        err.response?.data.includes("Please provide replacementFacultyId")
      ) {
        // Faculty has events → show reassignment modal
        setShowDeleteConfirm(false);
        setShowReassign(true);
      } else {
        handleSessionError(err);
      }
    }
  };

  // Reassign and delete
  const handleReassignAndDelete = async () => {
    if (!reassignFacultyId) {
      toast.error("Please select another faculty to reassign events.");
      return;
    }
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/faculties/${deleteConfirm}?replacementFacultyId=${reassignFacultyId}`,
        { withCredentials: true }
      );
      toast.success("Faculty deleted and events reassigned successfully");
      setDeleteConfirm(null);
      setReassignFacultyId("");
      setShowReassign(false);
      fetchFaculties();
    } catch (err) {
      handleSessionError(err);
    }
  };

  // Update Faculty
  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/admin/faculties/${editFaculty.id}`,
        editFaculty,
        { withCredentials: true }
      );
      toast.success("Faculty updated successfully");
      setEditFaculty(null);
      fetchFaculties();
    } catch (err) {
      handleSessionError(err);
    }
  };

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="p-6 min-h-screen bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-700">
          All Faculty Members
        </h2>

        {loading ? (
          <p className="text-center text-indigo-600">Loading faculties...</p>
        ) : faculties.length === 0 ? (
          <p className="text-center text-red-500">No faculties found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white border">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="py-3 px-4 border">ID</th>
                  <th className="py-3 px-4 border">Name</th>
                  <th className="py-3 px-4 border">Email</th>
                  <th className="py-3 px-4 border">Phone</th>
                  <th className="py-3 px-4 border">Department</th>
                  <th className="py-3 px-4 border">Gender</th>
                  <th className="py-3 px-4 border">Approved</th>
                  <th className="py-3 px-4 border">Events</th>

                  <th className="py-3 px-4 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty.id} className="hover:bg-gray-100 transition">
                    <td className="py-2 px-4 border text-center">{faculty.id}</td>
                    <td className="py-2 px-4 border">{faculty.name}</td>
                    <td className="py-2 px-4 border">{faculty.email}</td>
                    <td className="py-2 px-4 border">{faculty.phone}</td>
                    <td className="py-2 px-4 border">{faculty.department}</td>
                    <td className="py-2 px-4 border">{faculty.gender}</td>
                    <td className="py-2 px-4 border text-center">
                      {faculty.approved ? "Yes" : "No"}
                    </td>
                    <td className="py-2 px-4 border text-center">
  {faculty.assignedEventsCount}
</td>

                    <td className="py-2 px-4 border text-center space-x-2">
                      <button
                        onClick={() => setEditFaculty({ ...faculty })}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => attemptDelete(faculty.id)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96 text-center">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this faculty?</p>
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

      {/* Reassign Modal */}
      {showReassign && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Reassign & Delete</h3>
            <p className="mb-4">
              This faculty has assigned events. Please reassign them before deletion:
            </p>

            <select
              value={reassignFacultyId}
              onChange={(e) => setReassignFacultyId(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            >
              <option value="">-- Select Faculty --</option>
              {faculties
                .filter((f) => f.id !== deleteConfirm)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department})
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  setReassignFacultyId("");
                  setShowReassign(false);
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignAndDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-lg font-semibold mb-4">Edit Faculty</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editFaculty.name}
                onChange={(e) => setEditFaculty({ ...editFaculty, name: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Name"
              />
              <input
                type="email"
                value={editFaculty.email}
                onChange={(e) => setEditFaculty({ ...editFaculty, email: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <input
                type="text"
                value={editFaculty.phone}
                onChange={(e) => setEditFaculty({ ...editFaculty, phone: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <input
                type="text"
                value={editFaculty.department}
                onChange={(e) =>
                  setEditFaculty({ ...editFaculty, department: e.target.value })
                }
                className="w-full border p-2 rounded"
                placeholder="Department"
              />
              <select
                value={editFaculty.gender}
                onChange={(e) =>
                  setEditFaculty({ ...editFaculty, gender: e.target.value })
                }
                className="w-full border p-2 rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFaculty.approved}
                  onChange={(e) =>
                    setEditFaculty({
                      ...editFaculty,
                      approved: e.target.checked,
                    })
                  }
                />
                Approved
              </label>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditFaculty(null)}
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

export default ViewAllFaculty;
