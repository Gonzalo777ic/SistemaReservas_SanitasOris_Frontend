import { render, screen } from "@testing-library/react";
import Unauthorized from "./Unauthorized";

describe("Unauthorized Component", () => {
  it("should render the unauthorized access message", () => {
    // Renderiza el componente en un DOM virtual
    render(<Unauthorized />);

    // Busca los elementos por su texto y verifica que estén en el documento
    const heading = screen.getByText("🚫 No tienes acceso");
    const paragraph = screen.getByText(
      "No tienes permisos para acceder a esta sección."
    );

    // Usa las aserciones para verificar que los elementos existen
    expect(heading).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
  });
});
