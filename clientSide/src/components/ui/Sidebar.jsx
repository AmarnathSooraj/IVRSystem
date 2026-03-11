import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Users, Banknote, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Fees Details", to: "/fees", icon: Banknote },
  { label: "Student Details", to: "/students", icon: GraduationCap },
  { label: "Staff Details", to: "/staff", icon: Users },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens/state here if implemented
    navigate("/login");
  };

  return (
    <aside className="w-full lg:max-w-60 lg:h-full shrink-0 bg-sidebar border-b lg:border-r border-sideBlack/10 flex flex-col">
      {/* Nav */}
      <nav className="flex lg:flex-col flex-1">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 lg:flex-none lg:w-full flex uppercase items-center justify-center lg:justify-start gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 border-r lg:border-r-0 lg:border-b border-mainBlack/5 text-[0.75rem] lg:text-[0.82rem] font-semibold transition-all duration-200 whitespace-nowrap ${
                isActive
                  ? "bg-[#333333]/80 text-white shadow-sm"
                  : "text-sideBlack hover:bg-[#F2F2F2] hover:text-black"
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button - Hidden on mobile, visible on desktop sidebar */}
      <button
        onClick={handleLogout}
        className="hidden lg:flex w-full items-center justify-start gap-3 px-6 py-4 text-red-600 hover:bg-red-50 text-[0.82rem] font-semibold uppercase transition-all duration-200 border-b border-mainBlack/5"
      >
        <LogOut size={16} className="shrink-0" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
