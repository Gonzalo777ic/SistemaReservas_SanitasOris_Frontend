import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css"; // Importa los estilos de Bootstrap
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import { MdLogout } from "react-icons/md"; // Importamos el icono para cerrar sesión

export default function MyNavbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <Navbar bg="white" expand="lg" className="shadow-sm mb-4">
      <div className="container-fluid">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuthenticated ? (
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    {user?.picture && (
                      <img
                        src={user.picture}
                        alt="Avatar del usuario"
                        className="rounded-circle me-2"
                        style={{ width: "32px", height: "32px" }}
                      />
                    )}
                    <span>Bienvenido, {user?.given_name || "Usuario"}</span>
                  </div>
                }
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                >
                  <MdLogout className="me-2" /> Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link
                onClick={() => loginWithRedirect()}
                className="btn btn-primary text-white rounded-pill px-4"
              >
                Iniciar sesión
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}
