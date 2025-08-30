import { Auth0Client } from "@auth0/auth0-spa-js";
import axios from "axios";

const auth0 = new Auth0Client({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    scope: "openid profile email", // agrega aquí si tu API pide scopes adicionales
  },
});

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  timeout: 10000, // evita que se quede colgado
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await auth0.getTokenSilently();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("No se pudo obtener token:", err);
  }
  return config;
});

export { api, auth0 };
