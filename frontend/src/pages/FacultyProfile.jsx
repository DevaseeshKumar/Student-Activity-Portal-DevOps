import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import FacultyNavbar from "../components/FacultyNavbar";

const FacultyProfile = () => {
  const [faculty, setFaculty] = useState(null);
  const [profileData, setProfileData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    gender: "",
    department: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/faculty/me", { withCredentials: true })
      .then((res) => {
        setFaculty(res.data);
        setProfileData({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          gender: res.data.gender,
          department: res.data.department,
        });
      })
      .catch(() => {
        toast.error("Failed to load profile");
      });
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8080/api/faculty/update`, profileData, {
        withCredentials: true,
      })
      .then(() => {
        toast.success("Profile updated successfully");
      })
      .catch(() => {
        toast.error("Failed to update profile");
      });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    axios.put(
  "http://localhost:8080/api/faculty/update-password",
  {
    currentPassword: passwordData.currentPassword,
    newPassword: passwordData.newPassword,
  },
  { withCredentials: true }
)
.then(() => {
  toast.success("Password updated successfully");
  setPasswordData({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
})
.catch((err) => {
  if (err.response?.status === 400) {
    toast.error(err.response.data || "Failed to update password");
  } else if (err.response?.status === 401) {
    toast.error("You are not logged in");
  } else {
    toast.error("Something went wrong");
  }
});

  };

  if (!faculty) return <div className="p-4">Loading...</div>;

  return (
    <>
      <FacultyNavbar />
      <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-6">
        <h1 className="text-2xl font-semibold mb-4">Faculty Profile</h1>

      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Faculty ID</label>
          <input
            type="text"
            name="id"
            value={profileData.id}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={profileData.name}
            onChange={handleProfileChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Phone</label>
          <input
            type="text"
            name="phone"
            value={profileData.phone}
            onChange={handleProfileChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Gender</label>
          <select
            name="gender"
            value={profileData.gender}
            onChange={handleProfileChange}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Department</label>
          <input
            type="text"
            name="department"
            value={profileData.department}
            onChange={handleProfileChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>

      <hr className="my-6" />

      <h2 className="text-xl font-semibold mb-4">Change Password</h2>
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Password
        </button>
      </form>

      <ToastContainer position="top-center" />
    </div>
    </>
  );
};

export default FacultyProfile;
