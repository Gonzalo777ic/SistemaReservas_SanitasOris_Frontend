import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/sass/styles.scss";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
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

export default function DashboardDoctor() {
  const { getAccessTokenSilently, user } = useAuth0();
  const [stats, setStats] = useState({
    citas_pendientes: 0,
    citas_semana: 0,
    total_pacientes: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchDoctorDashboardData = async (offset = 0) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
        cacheMode: "off",
      });

      // 🔹 Estadísticas del doctor
      const statsRes = await fetch(
        `http://localhost:8000/api/doctor/stats/?week_offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!statsRes.ok)
        throw new Error("Error al cargar estadísticas del doctor");
      const statsData = await statsRes.json();
      setStats(statsData);

      // 🔹 Calendario de reservas del doctor
      const calendarRes = await fetch(
        `http://localhost:8000/api/doctor/reservas/?week_offset=${offset}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!calendarRes.ok)
        throw new Error("Error al cargar el calendario del doctor");
      const calendarData = await calendarRes.json();

      const adaptedAppointments = calendarData.map((r) => ({
        title: `${r.paciente} - ${r.procedimiento}`,
        start: new Date(r.fecha_hora),
        end: new Date(
          new Date(r.fecha_hora).getTime() + r.duracion_min * 60000
        ),
      }));
      setAppointments(adaptedAppointments);
    } catch (err) {
      console.error("❌ Error cargando datos del dashboard del doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboardData(weekOffset);
  }, [weekOffset]);

  const doctorName = user?.name || "Doctor"; // Obtener el nombre del usuario de Auth0

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="doctor" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <div className="mb-4">
          <h1 className="h4 fw-bold text-dark">Bienvenido, {doctorName} 👋</h1>
          <p className="text-secondary">
            Resumen de tu actividad y calendario de citas
          </p>
        </div>

        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "calc(100vh - 100px)" }}
          >
            <p className="h5 text-muted">Cargando datos del panel...</p>
          </div>
        ) : (
          <div className="container-fluid">
            {/* Cards de estadísticas */}
            <div className="row g-3 mb-4">
              <StatsCards
                stats={stats}
                weekOffset={weekOffset}
                setWeekOffset={setWeekOffset}
              />
            </div>

            {/* Sección del calendario */}
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
