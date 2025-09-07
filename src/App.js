import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RedirectByRole from "./components/RedirectByRole";
import UserSync from "./components/UserSync";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardDoctor from "./pages/DashboardDoctor";
import DashboardPaciente from "./pages/DashboardPaciente";
import HorarioDoctorPage from "./pages/HorarioDoctorPage";
import PatientsAdmin from "./pages/PatientsAdmin"; // 👈 Importamos la nueva página
import ReservasAdmin from "./pages/ReservasAdmin";
import ReservasPacientePage from "./pages/ReservasPacientePage";
import ReservasPage from "./pages/ReservasPage";
import UsersAdmin from "./pages/UsersAdmin";

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

        <Route
          path="/horario"
          element={
            <PrivateRoute allowedRoles={["doctor"]}>
              <HorarioDoctorPage />
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
        {/* 📋 Nueva ruta para la gestión de pacientes (solo para admin) */}
        <Route
          path="/pacientes"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <PatientsAdmin />
            </PrivateRoute>
          }
        />
        {/* 📋 Nueva ruta para la gestión de pacientes (solo para admin) */}
        <Route
          path="/reservas-admin"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <ReservasAdmin />
            </PrivateRoute>
          }
        />
        {/* 📋 Nueva ruta para la gestión de pacientes (solo para admin) */}
        <Route
          path="/users"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <UsersAdmin />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
