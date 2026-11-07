import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./layouts/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import Appointments from "./pages/Appointments";
import { Toaster } from "react-hot-toast";
import AdminRoute from "./routes/AdminRoute";
import AuditLogs from "./pages/AuditLogs";

export default function App() {
  return (
    <AuthProvider>
       <Toaster position="top-right" toastOptions={{ style: { borderRadius: "12px" } }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/audit" element={<AdminRoute><AuditLogs /></AdminRoute>} />
            {/* /patients et /appointments seront ajoutés ensuite */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}