// src/pages/DashboardAdmin.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import AdminCalendar from "../components/admin/AdminCalendar"; // Nuevo componente
import StatsCards from "../components/dashboard/StatsCards";
import { api } from "../services/api";
import "./styles.css";

// 🆕 Nuevo custom hook para la lógica de datos
const useAdminData = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState({
    citas_pendientes: 0,
    citas_semana: 0,
    total_pacientes: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        cacheMode: "off",
      });

      // 🔹 Estadísticas generales
      const statsRes = await api.get(`admin/stats/?week_offset=${weekOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);

      // 🔹 Calendario: obtenemos reservas
      const calendarRes = await api.get(`reservas/?week_offset=${weekOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const calendarData = calendarRes.data;

      // Adaptar datos para React Big Calendar
      const adaptedAppointments = calendarData.map((r) => {
        const procedimientoNombre = r.procedimiento
          ? r.procedimiento.nombre
          : "Sin Procedimiento";
        const pacienteNombre = r.paciente
          ? r.paciente.user.first_name + " " + r.paciente.user.last_name
          : "Paciente Desconocido";

        return {
          title: `${pacienteNombre} - ${procedimientoNombre}`,
          start: new Date(r.fecha_hora),
          end: new Date(
            new Date(r.fecha_hora).getTime() + r.duracion_min * 60000
          ),
        };
      });
      setAppointments(adaptedAppointments);
    } catch (err) {
      console.error("❌ Error cargando datos del dashboard:", err);
      setError("Error al cargar los datos del panel.");
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, weekOffset]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, appointments, loading, error, weekOffset, setWeekOffset };
};

export default function DashboardAdmin() {
  const { stats, appointments, loading, error, weekOffset, setWeekOffset } =
    useAdminData();

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="admin" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <div className="mb-4">
          <h1 className="h4 fw-bold text-dark">Panel del Administrador</h1>
          <p className="text-secondary">Resumen de actividad y calendario</p>
        </div>

        {loading ? (
          <p>Cargando datos del dashboard...</p>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : (
          <div className="container-fluid">
            {/* Cards en fila */}
            <div className="row g-3 mb-4">
              <StatsCards
                stats={stats}
                weekOffset={weekOffset}
                setWeekOffset={setWeekOffset}
              />
            </div>

            {/* Calendar Section */}
            <div className="card shadow-sm p-4">
              <AdminCalendar appointments={appointments} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
