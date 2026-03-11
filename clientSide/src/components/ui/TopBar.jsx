import { useLocation, useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const titles = {
  "/": "Dashboard",
  "/students": "Student Details",
  "/staff": "Staff Details",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = titles[pathname] ?? "IVR System";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear any auth tokens/state here if implemented
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
        <h2 className="text-[1.46rem] font-medium uppercase tracking-tight text-mainBlack">
          COLLEGE OF ENGINEERING VADAKARA
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 border border-gray-100 hover:bg-gray-50 transition-colors p-1.5 pr-3 rounded-full"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <User size={15} />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Admin
            </span>
            <ChevronDown size={14} className="text-gray-400 ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100/50 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
