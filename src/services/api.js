import { Auth0Client } from "@auth0/auth0-spa-js";
import axios from "axios";

const auth0 = new Auth0Client({
  domain: process.env.REACT_APP_AUTH0_DOMAIN,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  },
});

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await auth0.getTokenSilently();
    config.headers.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.warn("No se pudo obtener token:", err);
  }
  return config;
});

export default api;
