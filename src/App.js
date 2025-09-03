import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RedirectByRole from "./components/RedirectByRole"; // 👈 importado
import UserSync from "./components/UserSync";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardDoctor from "./pages/DashboardDoctor";
import DashboardPaciente from "./pages/DashboardPaciente";
import ReservasPacientePage from "./pages/ReservasPacientePage";
import ReservasPage from "./pages/ReservasPage";

function App() {
  return (
    <Router>
      <Navbar />
      <UserSync />
      <Routes>
        {/* 🚀 Punto de entrada: redirige al dashboard correcto */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RedirectByRole />
            </PrivateRoute>
          }
        />

        {/* Paciente */}
        <Route
          path="/dashboard-paciente"
          element={
            <PrivateRoute allowedRoles={["paciente"]}>
              <DashboardPaciente />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <PrivateRoute allowedRoles={["paciente"]}>
              <ReservasPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservar"
          element={
            <PrivateRoute allowedRoles={["paciente"]}>
              <ReservasPacientePage />
            </PrivateRoute>
          }
        />

        {/* Doctor */}
        <Route
          path="/dashboard-doctor"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <DashboardDoctor />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/dashboard-admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
