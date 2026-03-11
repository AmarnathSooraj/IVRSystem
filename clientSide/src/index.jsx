import { createBrowserRouter } from "react-router-dom";
import Layout from "./layouts/Layout";
import Dashboard from "./pages/ui/Dashboard";
import FeeDetails from "./pages/ui/FeeDetails";
import StudentDetails from "./pages/ui/StudentDetails";
import StaffDetails from "./pages/ui/StaffDetails";
import WebCaller from "./components/WebCaller";
import AuthPage from "./pages/ui/AuthPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "fees", element: <FeeDetails /> },
      { path: "students", element: <StudentDetails /> },
      { path: "staff", element: <StaffDetails /> },
    ],
  },
  {
    path: "/make-call",
    element: <WebCaller />,
  },
  {
    path: "/login",
    element: <AuthPage />,
  },
]);

export default router;
