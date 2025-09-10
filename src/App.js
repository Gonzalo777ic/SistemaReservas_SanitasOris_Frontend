import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RedirectByRole from "./components/RedirectByRole";
import UserSync from "./components/UserSync";
import CitasDoctorPage from "./pages/CitasDoctorPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardDoctor from "./pages/DashboardDoctor";
import DashboardPaciente from "./pages/DashboardPaciente";
import HorarioDoctorPage from "./pages/HorarioDoctorPage";
import PacientesDoctorPage from "./pages/PacientesDoctorPage";
import PatientsAdmin from "./pages/PatientsAdmin";
import ProfilePage from "./pages/ProfilePage";
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
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<RedirectByRole />} />
        </Route>

        {/* Paciente */}
        <Route element={<PrivateRoute allowedRoles={["paciente"]} />}>
          <Route path="/dashboard-paciente" element={<DashboardPaciente />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/reservar" element={<ReservasPacientePage />} />
        </Route>

        {/* Doctor */}
        <Route element={<PrivateRoute allowedRoles={["doctor"]} />}>
          <Route path="/dashboard-doctor" element={<DashboardDoctor />} />
          <Route path="/horario-doctor" element={<HorarioDoctorPage />} />
          <Route path="/pacientes-doctor" element={<PacientesDoctorPage />} />
          <Route path="/citas" element={<CitasDoctorPage />} />
        </Route>

        {/* Perfil compartido */}
        <Route
          element={
            <PrivateRoute allowedRoles={["doctor", "paciente", "admin"]} />
          }
        >
          <Route path="/perfil" element={<ProfilePage />} />
        </Route>

        {/* Admin */}
        <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard-admin" element={<DashboardAdmin />} />
          <Route path="/pacientes" element={<PatientsAdmin />} />
          <Route path="/reservas-admin" element={<ReservasAdmin />} />
          <Route path="/users" element={<UsersAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
