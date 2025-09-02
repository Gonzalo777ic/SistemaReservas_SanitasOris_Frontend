import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import UserSync from "./components/UserSync";
import DashboardPaciente from "./pages/DashboardPaciente";
import ReservasPacientePage from "./pages/ReservasPacientePage";
import ReservasPage from "./pages/ReservasPage";

function App() {
  return (
    <Router>
      <Navbar />
      <UserSync />
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPaciente />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservas"
          element={
            <PrivateRoute>
              <ReservasPage />
            </PrivateRoute>
          }
        />
        {/* Nueva ruta para pacientes */}
        <Route
          path="/reservar"
          element={
            <PrivateRoute>
              <ReservasPacientePage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
