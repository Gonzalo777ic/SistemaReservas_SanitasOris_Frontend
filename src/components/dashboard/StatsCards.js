// src/components/dashboard/StatsCards.js
import {
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
// StatsCards.js
export default function StatsCards({ stats, weekOffset, setWeekOffset }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-6">
      {/* Card 1 */}
      <div
        className="flex-1 relative p-4 h-28 rounded-xl shadow-lg text-white transform transition-transform duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
        }}
      >
        <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 text-white/50">
          <ClockIcon
            className="w-6 h-6"
            style={{ width: "1.5rem", height: "1.5rem" }}
            aria-hidden="true"
          />
        </div>
        <h2 className="text-xs uppercase tracking-wide opacity-80">
          Citas pendientes
        </h2>
        <p className="text-3xl font-bold mt-1">{stats.citas_pendientes}</p>
      </div>

      {/* Card 2 */}
      <div
        className="flex-1 relative p-4 h-28 rounded-xl shadow-lg text-white transform transition-transform duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        }}
      >
        <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 text-white/50">
          <CalendarDaysIcon
            className="w-6 h-6"
            style={{ width: "1.5rem", height: "1.5rem" }}
            aria-hidden="true"
          />
        </div>
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-xs uppercase tracking-wide opacity-80">
            Citas esta semana
          </h2>
          <div className="space-x-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="px-1 py-0.5 text-xs bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
            >
              ◀
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-1 py-0.5 text-xs bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors"
            >
              ▶
            </button>
          </div>
        </div>
        <p className="text-3xl font-bold">{stats.citas_semana}</p>
      </div>

      {/* Card 3 */}
      <div
        className="flex-1 relative p-4 h-28 rounded-xl shadow-lg text-white transform transition-transform duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        }}
      >
        <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 text-white/50">
          <UserGroupIcon
            className="w-6 h-6"
            style={{ width: "1.5rem", height: "1.5rem" }}
            aria-hidden="true"
          />
        </div>
        <h2 className="text-xs uppercase tracking-wide opacity-80">
          Total pacientes
        </h2>
        <p className="text-3xl font-bold mt-1">{stats.total_pacientes}</p>
      </div>
    </div>
  );
}
a;
