import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentNavbar from "../components/StudentNavbar";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    name: "",
    phone: "",
    gender: "",
    department: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleSessionExpired = () => {
    toast.error("Session expired. Redirecting to login...", { autoClose: 3000 });
    setTimeout(() => navigate("/student/login"), 3000);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const studentRes = await axios.get(
          "http://localhost:8080/api/students/profile",
          { withCredentials: true }
        );
        setStudent(studentRes.data);

        setUpdateForm({
          name: studentRes.data.name || "",
          phone: studentRes.data.phone || "",
          gender: studentRes.data.gender || "",
          department: studentRes.data.department || "",
        });

        const allEventsRes = await axios.get(
          "http://localhost:8080/api/students/events",
          { withCredentials: true }
        );
        setTotalEvents(allEventsRes.data.length);

        const regRes = await axios.get(
          "http://localhost:8080/api/students/registered-events",
          { withCredentials: true }
        );
        const data = Array.isArray(regRes.data) ? regRes.data : [regRes.data];

        const eventsWithAttendance = await Promise.all(
          data.map(async (event) => {
            try {
              const attRes = await axios.get(
                `http://localhost:8080/api/students/events/${event.id}/attendance`,
                { withCredentials: true }
              );
              return { ...event, attendance: attRes.data ?? null };
            } catch {
              return { ...event, attendance: null };
            }
          })
        );

        setRegisteredEvents(eventsWithAttendance);
      } catch (err) {
        if (err.response?.status === 401) handleSessionExpired();
        else toast.error("Failed to load profile data.", { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleUpdate = async () => {
    try {
      await axios.put(
        "http://localhost:8080/api/students/profile",
        updateForm,
        { withCredentials: true }
      );
      setStudent({ ...student, ...updateForm });
      setShowUpdateModal(false);
      toast.success("Profile updated successfully!", { autoClose: 2000 });
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      else toast.error("Failed to update profile.", { autoClose: 3000 });
    }
  };

  const handlePasswordChange = async () => {
    try {
      await axios.put(
        "http://localhost:8080/api/students/profile/password",
        passwordForm,
        { withCredentials: true }
      );
      setShowPasswordModal(false);
      toast.success("Password changed successfully!", { autoClose: 2000 });
    } catch (err) {
      if (err.response?.status === 401) handleSessionExpired();
      else toast.error("Failed to change password.", { autoClose: 3000 });
    }
  };

  if (loading)
    return (
      <>
        <StudentNavbar />
        <div className="text-center py-10 text-blue-600 text-lg font-medium">
          Loading profile...
        </div>
      </>
    );

  if (!student)
    return (
      <>
        <StudentNavbar />
        <div className="text-center py-10 text-red-500">Failed to load profile.</div>
      </>
    );

  return (
    <>
      <StudentNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      {/* ...rest of your JSX for profile, modals, etc. */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, {student.name}
          </h1>
          <p className="text-gray-600"><strong>Email:</strong> {student.email}</p>
          <p className="text-gray-600"><strong>Phone:</strong> {student.phone}</p>
          <p className="text-gray-600"><strong>Gender:</strong> {student.gender}</p>
          <p className="text-gray-600"><strong>Department:</strong> {student.department}</p>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Update Details
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold">Total Events</h2>
            <p className="text-3xl font-bold mt-2">{totalEvents}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold">Your Registrations</h2>
            <p className="text-3xl font-bold mt-2">{registeredEvents.length}</p>
          </div>
        </div>

        {/* Registered Events List */}
        <div className="bg-white rounded-2xl shadow-md p-6 border">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">
            Your Registered Events
          </h2>

          {registeredEvents.length === 0 ? (
            <p className="text-gray-500">You haven’t registered for any events yet.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {registeredEvents.map((event, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-5"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-1"><strong>Description:</strong> {event.description || "N/A"}</p>
                  <p className="text-gray-600 mb-1"><strong>Date:</strong> {event.date}</p>
                  <p className="text-gray-600 mb-3"><strong>Venue:</strong> {event.venue}</p>
                  <p className="text-sm"><strong>Attendance:</strong> {event.attendance === null ? "Not Marked" : event.attendance ? "✅ Present" : "❌ Absent"}</p>

                  <div className="mt-3 border-t pt-3">
                    <h4 className="text-sm font-semibold text-blue-600 mb-1">Faculty Info</h4>
                    <p className="text-gray-700 text-sm"><strong>Name:</strong> {event.facultyName || "N/A"}</p>
                    <p className="text-gray-700 text-sm"><strong>Email:</strong> {event.facultyEmail || "N/A"}</p>
                    <p className="text-gray-700 text-sm"><strong>Department:</strong> {event.facultyDepartment || "N/A"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Details Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Update Details</h2>

            <input type="text" placeholder="Name" value={updateForm.name} onChange={e => setUpdateForm({ ...updateForm, name: e.target.value })} className="w-full mb-3 p-2 border rounded"/>
            <input type="text" placeholder="Phone" value={updateForm.phone} onChange={e => setUpdateForm({ ...updateForm, phone: e.target.value })} className="w-full mb-3 p-2 border rounded"/>
            <input type="text" placeholder="Gender" value={updateForm.gender} onChange={e => setUpdateForm({ ...updateForm, gender: e.target.value })} className="w-full mb-3 p-2 border rounded"/>
            <input type="text" placeholder="Department" value={updateForm.department} onChange={e => setUpdateForm({ ...updateForm, department: e.target.value })} className="w-full mb-3 p-2 border rounded"/>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowUpdateModal(false)} className="px-3 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handleUpdate} className="px-3 py-2 bg-blue-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <input type="password" placeholder="Old Password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })} className="w-full mb-3 p-2 border rounded"/>
            <input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full mb-3 p-2 border rounded"/>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowPasswordModal(false)} className="px-3 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={handlePasswordChange} className="px-3 py-2 bg-green-600 text-white rounded">Change</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
