import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import DashboardPaciente from "./pages/DashboardPaciente";
import ReservasPacientePage from "./pages/ReservasPacientePage";
import ReservasPage from "./pages/ReservasPage";
function App() {
  return (
    <Router>
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
