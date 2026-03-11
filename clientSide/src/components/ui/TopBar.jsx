import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

const titles = {
  "/": "Dashboard",
  "/students": "Student Details",
  "/staff": "Staff Details",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = titles[pathname] ?? "IVR System";
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    // Get user info from localStorage
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user && user.name) {
          setUserName(user.name);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const handleLogout = () => {
    // Clear auth state
    localStorage.removeItem("adminUser");
    navigate("/login");
  };

  return (
    <header className="h-20 shrink-0 flex items-center justify-between px-6 bg-white border-b border-mainBlack/10">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="CEV Logo"
          className="w-18 h-12 object-contain"
        />
        <h2 className="text-sm md:text-[1.46rem] font-medium uppercase tracking-tight text-mainBlack">
          COLLEGE OF ENGINEERING VADAKARA
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile - Visible only on desktop */}
        <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-mainBlack/5">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-mainBlack leading-none">{userName}</span>
            <span className="text-[0.7rem] text-sideBlack font-medium uppercase tracking-wider">Super User</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#333333] flex items-center justify-center text-white shadow-sm">
            <User size={20} />
          </div>
        </div>

        {/* Logout button - Visible only on mobile */}
        <button
          onClick={handleLogout}
          className="lg:hidden p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
