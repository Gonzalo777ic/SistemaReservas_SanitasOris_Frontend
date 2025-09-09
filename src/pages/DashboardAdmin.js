// src/pages/DashboardAdmin.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css"; // Importa los estilos de Bootstrap
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useCallback, useEffect, useState } from "react"; // <-- Import useCallback
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/sass/styles.scss";
import StatsCards from "../components/dashboard/StatsCards";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import "./styles.css";

// Configuración de locales para date-fns
import { es } from "date-fns/locale";
const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function DashboardAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState({
    citas_pendientes: 0,
    citas_semana: 0,
    total_pacientes: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  // ⭐ Usa useCallback para memoizar la función y sus dependencias
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        cacheMode: "off",
      });

      // 🔹 Estadísticas generales
      const statsRes = await api.get(`admin/stats/?week_offset=${weekOffset}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(statsRes.data);

      // 🔹 Calendario: obtenemos reservas en la semana actual
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
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, weekOffset]); // <-- Agrega weekOffset aquí

  // ⭐ Ahora, el useEffect depende de fetchDashboardData
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      {/* Sidebar */}
      <Sidebar userRole="admin" />
      {/* Main Content */}
      <main className="flex-grow-1 p-3 overflow-auto">
        <div className="mb-4">
          <h1 className="h4 fw-bold text-dark">Panel del Administrador</h1>
          <p className="text-secondary">Resumen de actividad y calendario</p>
        </div>

        {loading ? (
          <p>Cargando datos del dashboard...</p>
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
              <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                views={["week", "day"]}
                defaultView="week"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
