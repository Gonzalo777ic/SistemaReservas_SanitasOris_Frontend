import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

test("renders App component with MemoryRouter", () => {
  // Renderiza el componente App dentro de un MemoryRouter para simular el enrutamiento
  // sin crear un router anidado.
  // El `initialEntries` es útil para probar una ruta específica.
  // Aquí estamos simulando la ruta de login.
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <App />
    </MemoryRouter>
  );

  // Usa una aserción para verificar que la página de login se renderiza.
  // Necesitas tener un elemento con el texto "Iniciar Sesión" en tu LoginPage.
  const loginHeader = screen.getByText(/Iniciar Sesión/i);
  expect(loginHeader).toBeInTheDocument();
});
