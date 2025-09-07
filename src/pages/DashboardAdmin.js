import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css"; // Importa los estilos de Bootstrap
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/sass/styles.scss";
import StatsCards from "../components/dashboard/StatsCards";
import Sidebar from "../components/Sidebar";
import "./styles.css";

// Configuración de locales para date-fns
import { es } from "date-fns/locale";
const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
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

  // Fetch datos del dashboard
  const fetchDashboardData = async (offset = 0) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        cacheMode: "off",
      });

      // 🔹 Estadísticas generales
      const statsRes = await fetch(
        `http://localhost:8000/api/admin/stats/?week_offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!statsRes.ok) throw new Error("Error al cargar estadísticas");
      const statsData = await statsRes.json();
      setStats(statsData);

      // 🔹 Calendario: obtenemos reservas en la semana actual
      const calendarRes = await fetch(
        `http://localhost:8000/api/reservas/?week_offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!calendarRes.ok) throw new Error("Error al cargar calendario");
      const calendarData = await calendarRes.json();

      // Adaptar datos para React Big Calendar
      const adaptedAppointments = calendarData.map((r) => ({
        title: `${r.paciente} - ${r.procedimiento}`,
        start: new Date(r.fecha_hora),
        end: new Date(
          new Date(r.fecha_hora).getTime() + r.duracion_min * 60000
        ),
      }));
      setAppointments(adaptedAppointments);
    } catch (err) {
      console.error("❌ Error cargando datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(weekOffset);
  }, [weekOffset]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      {/* Sidebar */}
      <Sidebar userRole="admin" /> {/* Aquí se usa el nuevo componente */}
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
