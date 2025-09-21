import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StudentNavbar from "../components/StudentNavbar";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const COLORS = ["#00C49F", "#FF8042", "#FFBB28"];

const StudentDashboard = () => {
  const [totalEvents, setTotalEvents] = useState(0);
  const [registeredEventsCount, setRegisteredEventsCount] = useState(0);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, notMarked: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all events
        const allEventsRes = await axios.get("http://localhost:8080/api/students/events", { withCredentials: true });
        const allEvents = Array.isArray(allEventsRes.data) ? allEventsRes.data : [];
        setTotalEvents(allEvents.length);

        // Fetch registered events
        const regEventsRes = await axios.get("http://localhost:8080/api/students/registered-events", { withCredentials: true });
        const registeredEvents = Array.isArray(regEventsRes.data) ? regEventsRes.data : [regEventsRes.data];
        setRegisteredEventsCount(registeredEvents.length);

        // Fetch attendance for each registered event
        const eventsWithAttendance = await Promise.all(
          registeredEvents.map(async (event) => {
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

        // Calculate attendance stats
        const stats = { present: 0, absent: 0, notMarked: 0 };
        eventsWithAttendance.forEach((event) => {
          if (event.attendance === true) stats.present += 1;
          else if (event.attendance === false) stats.absent += 1;
          else stats.notMarked += 1;
        });
        setAttendanceStats(stats);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error("Session expired. Please login again.", { autoClose: 3000 });
          setTimeout(() => window.location.href = "/student/login", 3000);
        } else {
          toast.error("Failed to fetch dashboard data.", { autoClose: 3000 });
        }
      }
    };

    fetchDashboardData();
  }, []);

  const remainingEvents = totalEvents - registeredEventsCount;

  const pieData = [
    { name: "Registered", value: registeredEventsCount },
    { name: "Not Registered", value: remainingEvents > 0 ? remainingEvents : 0 },
  ];

  const attendancePieData = [
    { name: "Present", value: attendanceStats.present },
    { name: "Absent", value: attendanceStats.absent },
    { name: "Not Marked", value: attendanceStats.notMarked },
  ];

  return (
    <>
      <StudentNavbar />
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
      <div className="min-h-screen bg-gray-100 py-10 px-6">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Student Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-semibold mb-2">Total Events</h3>
            <p className="text-4xl font-bold text-blue-600">{totalEvents}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-semibold mb-2">Your Registrations</h3>
            <p className="text-4xl font-bold text-green-600">{registeredEventsCount}</p>
          </div>

          {/* Registration Pie Chart */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Event Registration Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Attendance Pie Chart */}
          {registeredEventsCount > 0 && (
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">Attendance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={attendancePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
