export const GOOGLE_MAP_API_KEY = import.meta.env.VITE_APP_GOOGLE_MAP_API_KEY;
export const ENV = import.meta.env.VITE_APP_ENV ?? "development"; // project environment (development/ production)
export const PROXY_URL = ENV === "development" ? "https://cors-anywhere.herokuapp.com/" : ""; // bypass cors error for dev testing
