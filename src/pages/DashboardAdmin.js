// src/pages/DashboardAdmin.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export default function DashboardAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState({
    citas_pendientes: 0,
    citas_semana: 0,
    total_pacientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const fetchStats = async (offset = 0) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
        cacheMode: "off",
      });

      const res = await fetch(
        `http://localhost:8000/api/admin/stats/?week_offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Error al cargar estadísticas");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("❌ Error cargando estadísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(weekOffset);
  }, [weekOffset]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/dashboard-admin"
            className="block p-2 rounded hover:bg-gray-800"
          >
            📊 Dashboard
          </a>
          <a href="/doctores" className="block p-2 rounded hover:bg-gray-800">
            👨‍⚕️ Doctores
          </a>
          <a href="/pacientes" className="block p-2 rounded hover:bg-gray-800">
            🧑‍🤝‍🧑 Pacientes
          </a>
          <a href="/citas" className="block p-2 rounded hover:bg-gray-800">
            📅 Citas
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Panel del Administrador</h1>

        {loading ? (
          <p>Cargando estadísticas...</p>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="text-gray-600">Citas pendientes</h2>
                <p className="text-3xl font-bold">{stats.citas_pendientes}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="text-gray-600 flex justify-between items-center">
                  Citas esta semana
                  <div className="space-x-2">
                    <button
                      onClick={() => setWeekOffset((w) => w - 1)}
                      className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setWeekOffset((w) => w + 1)}
                      className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                    >
                      ▶
                    </button>
                  </div>
                </h2>
                <p className="text-3xl font-bold">{stats.citas_semana}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow">
                <h2 className="text-gray-600">Total pacientes</h2>
                <p className="text-3xl font-bold">{stats.total_pacientes}</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
