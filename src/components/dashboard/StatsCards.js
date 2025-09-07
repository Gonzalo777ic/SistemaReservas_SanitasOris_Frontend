import { ClockIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { Card } from "react-bootstrap";

export default function StatsCards({ stats, weekOffset, setWeekOffset }) {
  return (
    <>
      {/* Card 1 */}
      <div className="col-md-4">
        <Card className="shadow-sm border-0 h-100 rounded-3">
          <Card.Body
            className="text-white rounded-3"
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
            }}
          >
            <div className="position-absolute top-0 end-0 p-2 text-white-50">
              <ClockIcon className="icon-sm" aria-hidden="true" />
            </div>
            <p className="text-uppercase small opacity-80 mb-0">
              Citas pendientes
            </p>
            <h2 className="fw-bold display-6">{stats.citas_pendientes}</h2>
          </Card.Body>
        </Card>
      </div>

      {/* Card 2 */}
      <div className="col-md-4">
        <Card className="shadow-sm border-0 h-100 rounded-3">
          <Card.Body
            className="text-white rounded-3"
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            }}
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div className="flex-grow-1">
                <p className="text-uppercase small opacity-80 mb-0">
                  Citas esta semana
                </p>
                <h2 className="fw-bold display-6">{stats.citas_semana}</h2>
              </div>
              <div className="d-flex align-items-center">
                <button
                  onClick={() => setWeekOffset((w) => w - 1)}
                  className="btn btn-sm btn-light bg-white bg-opacity-25 text-white-50 me-1 rounded-3"
                  style={{
                    "--bs-btn-padding-y": ".25rem",
                    "--bs-btn-padding-x": ".5rem",
                    "--bs-btn-font-size": ".75rem",
                  }}
                >
                  ◀
                </button>
                <button
                  onClick={() => setWeekOffset((w) => w + 1)}
                  className="btn btn-sm btn-light bg-white bg-opacity-25 text-white-50 rounded-3"
                  style={{
                    "--bs-btn-padding-y": ".25rem",
                    "--bs-btn-padding-x": ".5rem",
                    "--bs-btn-font-size": ".75rem",
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Card 3 */}
      <div className="col-md-4">
        <Card className="shadow-sm border-0 h-100 rounded-3">
          <Card.Body
            className="text-white rounded-3"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            }}
          >
            <div className="position-absolute top-0 end-0 p-2 text-white-50">
              <UserGroupIcon className="icon-sm" aria-hidden="true" />
            </div>
            <p className="text-uppercase small opacity-80 mb-0">
              Total pacientes
            </p>
            <h2 className="fw-bold display-6">{stats.total_pacientes}</h2>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
