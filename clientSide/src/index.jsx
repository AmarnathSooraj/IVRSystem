import { createBrowserRouter } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/ui/Dashboard";
import StudentDetails from "./pages/ui/StudentDetails";
import StaffDetails from "./pages/ui/StaffDetails";
import WebCaller from "./components/WebCaller";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "students", element: <StudentDetails /> },
      { path: "staff", element: <StaffDetails /> },
    ],
  },
  {
    path: "/make-call",
    element: <WebCaller />,
  },
]);

export default router;
