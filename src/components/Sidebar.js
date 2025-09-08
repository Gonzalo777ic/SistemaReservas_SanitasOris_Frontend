import {
  MdApps,
  MdDashboard,
  MdDateRange,
  MdHealing,
  MdMessage,
  MdPeople,
  MdPerson,
} from "react-icons/md";
import logo from "../assets/sanitas_oris_logo.png";

const adminLinks = [
  { name: "Dashboard", href: "/dashboard-admin", icon: MdDashboard },
  { name: "Pacientes", href: "/pacientes", icon: MdPeople },
  { name: "Reservas", href: "/reservas-admin", icon: MdDateRange },
  { name: "Users", href: "/users", icon: MdApps },
];

const doctorLinks = [
  { name: "Dashboard", href: "/dashboard-doctor", icon: MdDashboard },
  { name: "Pacientes", href: "/pacientes", icon: MdPeople },
  { name: "Citas", href: "/citas", icon: MdDateRange },
  { name: "Mensajes", href: "/mensajes", icon: MdMessage },
  { name: "Perfil", href: "/perfil-doctor", icon: MdPerson },
];

const patientLinks = [
  { name: "Dashboard", href: "/dashboard-paciente", icon: MdDashboard },
  { name: "Reservar Cita", href: "/reservar", icon: MdDateRange },
  { name: "Historial", href: "/historial-citas", icon: MdHealing },
  { name: "Perfil", href: "/perfil-paciente", icon: MdPerson },
];

const Sidebar = ({ userRole = "patient" }) => {
  const links = {
    admin: adminLinks,
    doctor: doctorLinks,
    patient: patientLinks,
  }[userRole];

  return (
    <aside
      className="bg-white shadow-sm d-flex flex-column"
      style={{ width: "200px" }}
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
          {links.map((link) => (
            <li className="nav-item" key={link.name}>
              <a
                href={link.href}
                className={`nav-link rounded ${
                  window.location.pathname === link.href
                    ? "active fw-bold text-primary bg-primary bg-opacity-10"
                    : "text-secondary-emphasis"
                }`}
              >
                <link.icon
                  className="me-2"
                  style={{ verticalAlign: "middle" }}
                />
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
