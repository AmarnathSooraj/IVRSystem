import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./ui/Dashboard";
import StudentDetails from "./ui/StudentDetails";
import StaffDetails from "./ui/StaffDetails";

const pages = {
  dashboard: <Dashboard />,
  students: <StudentDetails />,
  staff: <StaffDetails />,
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {pages[activePage]}
    </Layout>
  );
}

export default App;
