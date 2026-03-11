import { NavLink } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Users, Banknote } from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, end: true },
  { label: "Fees Details", to: "/fees", icon: Banknote },
  { label: "Student Details", to: "/students", icon: GraduationCap },
  { label: "Staff Details", to: "/staff", icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="w-full lg:max-w-60 lg:h-full shrink-0 bg-sidebar border-b lg:border-r border-sideBlack/10">
      {/* Nav */}
      <nav className="flex lg:flex-col lg:pb-4">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 lg:w-full flex uppercase items-center justify-center lg:justify-start gap-2 lg:gap-3 px-4 lg:px-6 py-3 lg:py-4 border-r lg:border-r-0 lg:border-b border-mainBlack/5 text-[0.75rem] lg:text-[0.82rem] font-semibold transition-all duration-200 whitespace-nowrap ${
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
    </aside>
  );
}
