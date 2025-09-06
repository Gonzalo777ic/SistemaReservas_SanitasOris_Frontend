// src/pages/DashboardAdmin.js
import { useAuth0 } from "@auth0/auth0-react";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import StatsCards from "../components/dashboard/StatsCards";

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
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <img src="/logo.svg" alt="Logo" className="h-8" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/dashboard-admin"
            className="flex items-center p-2 rounded-lg text-blue-600 font-bold bg-blue-50"
          >
            📋 Dashboard
          </a>
          <a
            href="/pacientes"
            className="flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            🧑‍🤝‍🧑 Pacientes
          </a>
          <a
            href="/reservas"
            className="flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            📅 Reservas
          </a>
          <a
            href="/mensajes"
            className="flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            💬 Mensajes
          </a>
          <a
            href="/ajustes"
            className="flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            ⚙️ Ajustes
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Panel del Administrador
          </h1>
        </div>

        {loading ? (
          <p>Cargando datos del dashboard...</p>
        ) : (
          <>
            {/* Cards en fila */}
            <div className="w-full mx-auto">
              <StatsCards
                stats={stats}
                weekOffset={weekOffset}
                setWeekOffset={setWeekOffset}
              />
            </div>

            {/* Calendar Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
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
          </>
        )}
      </main>
    </div>
  );
}
