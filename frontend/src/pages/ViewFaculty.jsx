import React, { useEffect, useMemo, useState } from "react";
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

  // busy flags to avoid duplicate requests
  const [busyDelete, setBusyDelete] = useState(false);
  const [busyReassign, setBusyReassign] = useState(false);
  const [busyUpdate, setBusyUpdate] = useState(false);

  // search
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // session / generic error handler
  const handleSessionError = (err) => {
    if (err?.response?.status === 401) {
      toast.error("Session expired. Redirecting to login...");
      setTimeout(() => navigate("/admin/login"), 1200);
    } else {
      const msg =
        (err?.response?.data &&
          (typeof err.response.data === "string"
            ? err.response.data
            : err.response.data.message || JSON.stringify(err.response.data))) ||
        err.message ||
        "An error occurred";
      toast.error(msg);
    }
  };

  // fetch faculties from backend
  const fetchFaculties = async () => {
    setLoading(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: extract message from many server shapes
  const extractErrorMessage = (err) => {
    if (!err?.response) return err?.message || "Unknown error";
    const data = err.response.data;
    if (!data) return `HTTP ${err.response.status}`;
    if (typeof data === "string") return data;
    if (typeof data === "object") {
      return data.message || data.error || JSON.stringify(data);
    }
    return String(data);
  };

  // Try deleting faculty → just open modal
  const attemptDelete = (facultyId) => {
    setDeleteConfirm(facultyId);
    setShowDeleteConfirm(true);
  };

  // Confirm delete without reassignment (robust)
  const handleConfirmDelete = async () => {
    // client-side pre-check: if faculty has assigned events, open reassign immediately
    const faculty = faculties.find((f) => f.id === deleteConfirm);
    if (faculty?.assignedEventsCount > 0) {
      setShowDeleteConfirm(false);
      setShowReassign(true);
      return;
    }

    setBusyDelete(true);
    try {
      await axios.delete(`http://localhost:8080/api/admin/faculties/${deleteConfirm}`, {
        withCredentials: true,
      });
      toast.success("Faculty deleted successfully");
      // reset state & refresh
      setDeleteConfirm(null);
      setShowDeleteConfirm(false);
      fetchFaculties();
    } catch (err) {
      console.error("Delete faculty error:", err);
      const message = extractErrorMessage(err);
      toast.error(message);

      // If server says replacement required (robust checks)
      const lower = (message || "").toLowerCase();
      if (
        err.response?.status === 400 ||
        err.response?.status === 409 ||
        lower.includes("replacement") ||
        lower.includes("provide replacement") ||
        lower.includes("reassign") ||
        lower.includes("assigned events") ||
        lower.includes("has events")
      ) {
        // show reassign modal
        setShowDeleteConfirm(false);
        setShowReassign(true);
        return;
      }

      // fallback: session handling or other errors
      handleSessionError(err);
    } finally {
      setBusyDelete(false);
    }
  };

  // Reassign and delete
  const handleReassignAndDelete = async () => {
    if (!reassignFacultyId) {
      toast.error("Please select another faculty to reassign events.");
      return;
    }

    setBusyReassign(true);
    try {
      // Ensure your backend expects replacementFacultyId as query param.
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
      console.error("Reassign & delete error:", err);
      const message = extractErrorMessage(err);
      toast.error(message);

      // If it's a session error or other, handle it (this call will redirect on 401)
      handleSessionError(err);
    } finally {
      setBusyReassign(false);
    }
  };

  // Update Faculty
  const handleUpdate = async () => {
    if (!editFaculty) return;
    setBusyUpdate(true);
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
      console.error("Update faculty error:", err);
      handleSessionError(err);
    } finally {
      setBusyUpdate(false);
    }
  };

  // search/filter logic
  const filteredFaculties = useMemo(() => {
    const term = (searchTerm || "").trim().toLowerCase();
    if (!term) return faculties;
    return faculties.filter((f) => {
      return (
        String(f.name || "").toLowerCase().includes(term) ||
        String(f.email || "").toLowerCase().includes(term) ||
        String(f.phone || "").toLowerCase().includes(term) ||
        String(f.department || "").toLowerCase().includes(term)
      );
    });
  }, [faculties, searchTerm]);

  return (
    <>
      <AdminNavbar />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="p-6 min-h-screen bg-gray-100">
        <h2 className="text-2xl font-semibold mb-4 text-center text-indigo-700">
          All Faculty Members
        </h2>

        {/* Search bar + counts */}
        <div className="flex flex-col items-center mb-6 gap-3 md:flex-row md:justify-between md:items-center">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-full max-w-xl">
              <div className="relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone or department..."
                  className="w-full border rounded-xl px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-sm bg-gray-200 hover:bg-gray-300"
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-700 mt-1 md:mt-0">
            <span className="font-medium">
              Showing {filteredFaculties.length}
            </span>{" "}
            of <span className="font-medium">{faculties.length}</span> faculties
          </div>
        </div>

        {loading ? (
          <p className="text-center text-indigo-600">Loading faculties...</p>
        ) : faculties.length === 0 ? (
          <p className="text-center text-red-500">No faculties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculties.map((faculty) => (
              <div
                key={faculty.id}
                className="bg-white rounded-2xl shadow-md p-5 border hover:shadow-lg transition relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{faculty.name}</h3>
                    <p className="text-sm text-gray-500">{faculty.department}</p>
                    <p className="mt-3 text-sm">
                      <span className="font-medium">Email: </span>
                      <span className="text-indigo-600">{faculty.email}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone: </span>
                      <span>{faculty.phone || "—"}</span>
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Gender: </span>
                      <span>{faculty.gender || "—"}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        faculty.approved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {faculty.approved ? "Approved" : "Unapproved"}
                    </div>

                    <div className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                      Events: {faculty.assignedEventsCount ?? 0}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditFaculty({ ...faculty })}
                      className="px-3 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium shadow-sm"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => attemptDelete(faculty.id)}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium shadow-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    <div>ID: {faculty.id}</div>
                    <div className="mt-1">{faculty.email}</div>
                  </div>
                </div>
              </div>
            ))}
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
                disabled={busyDelete}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={busyDelete}
              >
                {busyDelete ? "Deleting..." : "Yes, Delete"}
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
                disabled={busyReassign}
              >
                Cancel
              </button>
              <button
                onClick={handleReassignAndDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={busyReassign}
              >
                {busyReassign ? "Processing..." : "Confirm Delete"}
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
                value={editFaculty.name || ""}
                onChange={(e) => setEditFaculty({ ...editFaculty, name: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Name"
              />
              <input
                type="email"
                value={editFaculty.email || ""}
                onChange={(e) => setEditFaculty({ ...editFaculty, email: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <input
                type="text"
                value={editFaculty.phone || ""}
                onChange={(e) => setEditFaculty({ ...editFaculty, phone: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <input
                type="text"
                value={editFaculty.department || ""}
                onChange={(e) =>
                  setEditFaculty({ ...editFaculty, department: e.target.value })
                }
                className="w-full border p-2 rounded"
                placeholder="Department"
              />
              <select
                value={editFaculty.gender || ""}
                onChange={(e) => setEditFaculty({ ...editFaculty, gender: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editFaculty.approved}
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
                disabled={busyUpdate}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={busyUpdate}
              >
                {busyUpdate ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewAllFaculty;
