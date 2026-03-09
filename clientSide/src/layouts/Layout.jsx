import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import TopBar from "../components/ui/TopBar";

export default function Layout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
