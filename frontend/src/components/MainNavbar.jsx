import { Link } from "react-router-dom";

const MainNavbar = () => {
  const navLinks = [
    { label: "Admin Login", to: "/admin/login" },
    { label: "Faculty Register", to: "/faculty/register" },
    { label: "Faculty Login", to: "/faculty/login" },
    { label: "Student Login", to: "/student/login" },
    { label: "Student Signup", to: "/student/signup" },
  ];

  return (
    <nav className="bg-gradient-to-r from-fuchsia-700 via-pink-600 to-rose-600 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl sm:text-3xl font-extrabold tracking-wider text-white hover:text-yellow-300 transition duration-300"
          >
            🎓 Student Activity Portal
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative font-medium text-sm sm:text-base transition duration-300 hover:text-yellow-300 group"
              >
                {link.label}
                <span
                  className="absolute left-0 bottom-0 w-0 h-0.5 bg-yellow-300 transition-all duration-300 group-hover:w-full"
                ></span>
              </Link>
            ))}
          </div>

          {/* Mobile Hamburger (optional for mobile view) */}
          {/* You can add a hamburger menu here for better mobile UX */}
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
