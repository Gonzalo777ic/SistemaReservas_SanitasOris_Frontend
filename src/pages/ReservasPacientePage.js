// src/pages/ReservasPacientePage.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import DoctoresList from "../components/reservas/DoctoresList";
import ProcedimientosCarousel from "../components/reservas/ProcedimientosCarousel";
import { api } from "../services/api";
import { crearReserva } from "../services/reservas";

export default function ReservasPacientePage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [procedimiento, setProcedimiento] = useState(null);

  const [formData, setFormData] = useState({
    fecha: "",
    hora: "",
    doctor: "",
  });

  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // 🔹 Cargar lista de doctores desde el backend
  useEffect(() => {
    const fetchDoctores = async () => {
      try {
        const token = await getAccessTokenSilently();

        const res = await api.get("doctores/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDoctores(res.data);
      } catch (err) {
        console.error("Error al obtener doctores:", err);
      }
    };

    fetchDoctores();
  }, [getAccessTokenSilently]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      const token = await getAccessTokenSilently();

      const fecha_hora = new Date(`${formData.fecha}T${formData.hora}`);

      const pacienteResponse = await api.get(
        `pacientes/by_email/${user.email}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const pacienteId = pacienteResponse.data.id;

      const reservaParaEnviar = {
        paciente_id: pacienteId,
        doctor_id: parseInt(formData.doctor),
        fecha_hora: fecha_hora.toISOString(),
      };

      console.log("Reserva a enviar:", reservaParaEnviar);

      await crearReserva(reservaParaEnviar, token);

      setMensaje("✅ Cita reservada con éxito");
      setFormData({ fecha: "", hora: "", doctor: "" });
    } catch (error) {
      console.error("Error al reservar cita:", error.response?.data || error);
      setMensaje("❌ Ocurrió un error al reservar la cita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <div>
        <h2>Reservar nueva cita</h2>
        <ProcedimientosCarousel onSelect={setProcedimiento} />
        {procedimiento && (
          <p>
            Seleccionaste: <strong>{procedimiento.nombre}</strong> (
            {procedimiento.duracion} min)
          </p>
        )}
        {/* 🔹 Mostrar doctores */}
        <DoctoresList
          doctores={doctores}
          onSelect={(doc) => setFormData({ ...formData, doctor: doc.id })}
        />{" "}
      </div>
      <h2>Reservar nueva cita</h2>
      <p>Paciente: {user?.name || "Paciente"}</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label>Hora:</label>
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div>
          <label>Doctor:</label>
          <select
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">-- Selecciona un doctor --</option>
            {doctores.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.nombre} {doc.apellido} ({doc.especialidad})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {loading ? "Reservando..." : "Reservar cita"}
        </button>
      </form>

      {mensaje && <p style={{ marginTop: "1rem" }}>{mensaje}</p>}
    </div>
  );
}
