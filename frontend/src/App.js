import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { lightTheme } from "./theme";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import EnquiryList from "./pages/EnquiryList";
import EnquiryForm from "./pages/EnquiryForm";
import EnquiryDetail from "./pages/EnquiryDetail";
import EnquiryReceipt from "./pages/EnquiryReceipt";
import FollowUps from "./pages/FollowUps";
import Admissions from "./pages/Admissions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/enquiries" element={<EnquiryList />} />
              <Route path="/enquiries/new" element={<ProtectedRoute roles={["reception", "admin", "counsellor"]}><EnquiryForm /></ProtectedRoute>} />
              <Route path="/enquiries/:id" element={<EnquiryDetail />} />
              <Route path="/enquiries/:id/receipt" element={<EnquiryReceipt />} />
              <Route path="/enquiries/:id/edit" element={<ProtectedRoute roles={["reception", "admin", "counsellor"]}><EnquiryForm /></ProtectedRoute>} />
              <Route path="/followups" element={<ProtectedRoute roles={["admin", "counsellor"]}><FollowUps /></ProtectedRoute>} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/reports" element={<ProtectedRoute roles={["admin", "counsellor"]}><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
