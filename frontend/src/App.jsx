import { Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyRegister from "./pages/FacultyRegister";
import FacultyLogin from "./pages/FacultyLogin";
import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyProfile from "./pages/FacultyProfile";
import Home from "./pages/Home";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SetFacultyPassword from "./pages/SetFacultyPassword";
import UnapprovedFaculties from "./pages/UnapprovedFaculties";
import AdminProfile from "./pages/AdminProfile";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ViewStudents from "./pages/ViewStudents";
import AddEvent from "./pages/AddEvent";
import ViewFaculty from "./pages/ViewFaculty";
import AdminViewEvents from "./pages/AdminViewEvents";
import StudentViewEvents from "./pages/StudentViewEvents";
import FacultyAssignedEvents from "./pages/FacultyAssignedEvents";
import RegisteredEvent from "./pages/RegisteredEvent";

import Footer from "./components/Footer"; // ✅ import Footer
import StudentDashboard from "./pages/StudentDashboard";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Features from "./pages/Features";

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/view-students" element={<ViewStudents />} />
            <Route path="/admin/addevent" element={<AddEvent />} />
            <Route path="/admin/view-faculty" element={<ViewFaculty />} />
            <Route path="/admin/view-events" element={<AdminViewEvents />} />

            {/* Faculty Routes */}
            <Route path="/faculty/register" element={<FacultyRegister />} />
            <Route path="/faculty/login" element={<FacultyLogin />} />
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/profile" element={<FacultyProfile />} />
            <Route path="/faculty/set-password" element={<SetFacultyPassword />} />
            <Route path="/admin/unapproved-faculties" element={<UnapprovedFaculties />} />
            <Route path="/faculty/assigned-events" element={<FacultyAssignedEvents />} />

            {/* Student Routes */}
            <Route path="/student/signup" element={<Signup />} />
            <Route path="/student/login" element={<Login />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/view-events" element={<StudentViewEvents />} />
            <Route path="/student/registered-event" element={<RegisteredEvent />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/features" element={<Features />} />
          </Routes>
        </div>
        <Footer /> {/* ✅ common footer */}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
