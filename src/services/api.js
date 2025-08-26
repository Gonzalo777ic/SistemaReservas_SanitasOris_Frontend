import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  // Esto asegura que se envíen cookies y se respete la sesión de Django
  withCredentials: true,
});

export default api;
