// src/pages/DashboardDoctor.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import StatsCards from "../components/dashboard/StatsCards";
import DoctorCalendar from "../components/doctor/DoctorCalendar"; // Nuevo componente
import "./styles.css";

// 🆕 Nuevo custom hook para la lógica de datos
const useDoctorData = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const fetchDoctorDashboardData = async (offset) => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
          cacheMode: "off",
        });

        // Fetching stats
        const statsRes = await fetch(
          `http://localhost:8000/api/doctor/stats/?week_offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!statsRes.ok) throw new Error("Error fetching doctor stats");
        const statsData = await statsRes.json();
        setStats(statsData);

        // Fetching calendar data
        const calendarRes = await fetch(
          `http://localhost:8000/api/doctor/reservas/?week_offset=${offset}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!calendarRes.ok) throw new Error("Error fetching doctor calendar");
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
        console.error("❌ Error loading doctor dashboard data:", err);
        setError("Error al cargar los datos del panel.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorDashboardData(weekOffset);
  }, [weekOffset, getAccessTokenSilently]);

  return { stats, appointments, loading, error, weekOffset, setWeekOffset };
};

export default function DashboardDoctor() {
  const { user } = useAuth0();
  const { stats, appointments, loading, error, weekOffset, setWeekOffset } =
    useDoctorData();

  const doctorName = user?.name || "Doctor";

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
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
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
              <DoctorCalendar appointments={appointments} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
