import React, { useEffect, useState } from "react";
import axios from "axios";
import FacultyNavbar from "../components/FacultyNavbar";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

const FacultyDashboard = () => {
  const [faculty, setFaculty] = useState(null);
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facultyRes = await axios.get("http://localhost:8080/api/faculty/me", {
          withCredentials: true,
        });
        setFaculty(facultyRes.data);

        const eventsRes = await axios.get("http://localhost:8080/api/faculty/events", {
          withCredentials: true,
        });
        const assignedEvents = Array.isArray(eventsRes.data) ? eventsRes.data : [];
        setEvents(assignedEvents);

        // Fetch all students for assigned events
        let allStudents = [];
        for (const event of assignedEvents) {
          const stuRes = await axios.get(
            `http://localhost:8080/api/faculty/events/${event.id}/students`,
            { withCredentials: true }
          );
          const studentsWithEvent = stuRes.data.map((s) => ({
            ...s,
            attendance: s.attendance ?? null,
          }));
          allStudents = [...allStudents, ...studentsWithEvent];
        }
        setStudents(allStudents);

        setLoading(false);
      } catch (err) {
        console.error(err);

        if (err.response && err.response.status === 401) {
          toast.error("Session expired. Please log in again.", { theme: "light" });
          setTimeout(() => navigate("/faculty/login"), 2000);
        } else {
          toast.error("Failed to load dashboard data", { theme: "light" });
        }

        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <div className="p-6 text-center text-blue-600">Loading dashboard...</div>;

  // Attendance counts
  const presentCount = students.filter((s) => s.attendance === true).length;
  const absentCount = students.filter((s) => s.attendance === false).length;
  const notMarkedCount = students.filter((s) => s.attendance === null).length;

  const pieData = [
    { name: "Present", value: presentCount },
    { name: "Absent", value: absentCount },
    { name: "Not Marked", value: notMarkedCount },
  ];

  return (
    <>
      <FacultyNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="light" />

      <div className="min-h-screen bg-gray-100 p-6">
        {/* Faculty Name */}
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700">Welcome, {faculty?.name}</h1>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Assigned Events</h3>
            <p className="text-3xl font-bold mt-2">{events.length}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Total Students</h3>
            <p className="text-3xl font-bold mt-2">{students.length}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Present</h3>
            <p className="text-3xl font-bold mt-2">{presentCount}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg text-center">
            <h3 className="text-lg font-semibold">Absent</h3>
            <p className="text-3xl font-bold mt-2">{absentCount}</p>
          </div>
        </div>

        {/* Attendance Pie Chart */}
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4 text-gray-700">Attendance Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;
