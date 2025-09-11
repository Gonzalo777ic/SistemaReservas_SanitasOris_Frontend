import {
  MdApps,
  MdDashboard,
  MdDateRange,
  MdHealing,
  MdPeople,
  MdPerson,
} from "react-icons/md";
import { NavLink } from "react-router-dom";
import logo from "../assets/sanitas_oris_logo.png";

const adminLinks = [
  { name: "Dashboard", href: "/dashboard-admin", icon: MdDashboard },
  { name: "Pacientes", href: "/pacientes", icon: MdPeople },
  { name: "Reservas", href: "/reservas-admin", icon: MdDateRange },
  { name: "Users", href: "/users", icon: MdApps },
  { name: "Procedimientos", href: "/procedimientos", icon: MdHealing },
  { name: "Perfil", href: "/perfil", icon: MdPerson },
];

const doctorLinks = [
  { name: "Dashboard", href: "/dashboard-doctor", icon: MdDashboard },
  { name: "Horario", href: "/horario-doctor", icon: MdDashboard },
  { name: "Mis pacientes", href: "/pacientes-doctor", icon: MdPeople },
  { name: "Citas", href: "/citas", icon: MdDateRange },
  { name: "Perfil", href: "/perfil", icon: MdPerson },
];

const patientLinks = [
  { name: "Dashboard", href: "/dashboard-paciente", icon: MdDashboard },
  { name: "Reservar Cita", href: "/reservar", icon: MdDateRange },
  { name: "Historial", href: "/historial-citas", icon: MdHealing },
  { name: "Perfil", href: "/perfil", icon: MdPerson },
];

const Sidebar = ({ userRole }) => {
  const links =
    {
      admin: adminLinks,
      doctor: doctorLinks,
      paciente: patientLinks,
    }[userRole] || []; // <-- Solución: Si no hay match, usa un array vacío.

  return (
    <aside
      className="bg-white shadow-sm d-flex flex-column"
      style={{ width: "250px" }}
    >
      <div className="p-3 border-bottom border-secondary-subtle">
        <img
          src={logo}
          alt="Sanitas Oris Logo"
          className="img-fluid"
          style={{ maxHeight: "15rem" }}
        />
      </div>
      <nav className="flex-grow-1 p-2">
        <ul className="nav flex-column">
          {/* El .map() ahora siempre recibirá un array, vacío o no. */}
          {links.map((link) => (
            <li className="nav-item" key={link.name}>
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  `nav-link rounded ${
                    isActive
                      ? "active fw-bold text-primary bg-primary bg-opacity-10"
                      : "text-secondary-emphasis"
                  }`
                }
              >
                <link.icon
                  className="me-2"
                  style={{ verticalAlign: "middle" }}
                />
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
