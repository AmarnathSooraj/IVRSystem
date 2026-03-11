import { useLocation } from "react-router-dom";
import { User } from "lucide-react";

const titles = {
  "/": "Dashboard",
  "/students": "Student Details",
  "/staff": "Staff Details",
};

export default function TopBar() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "IVR System";

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
        <div className="flex items-center gap-2 border-mainBlack/10">
          <div className="w-8 h-8 rounded-full bg-mainBlack flex items-center justify-center text-white">
            <User size={15} />
          </div>
          <span className="text-sm font-medium text-mainBlack hidden sm:block">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
