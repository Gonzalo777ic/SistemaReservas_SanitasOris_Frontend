import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import DashboardDoctor from "./pages/DashboardDoctor";
import ReservasPage from "./pages/ReservasPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Esta ruta requiere login */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardDoctor />
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
      </Routes>
    </Router>
  );
}

export default App;
