import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ReservasPage from "./pages/ReservasPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/reservas" replace />} />
        <Route path="/reservas" element={<ReservasPage />} />
      </Routes>
    </Router>
  );
}

export default App;
