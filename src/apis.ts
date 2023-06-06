import axios from "axios";
import { GOOGLE_MAP_API_KEY, PROXY_URL } from "./utils/constants";

export const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAP_API_KEY}`);
    if (response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }
    throw new Error("No address found for the provided coordinate");
  } catch (error) {
    throw new Error(`Failed to get the address${(error as Error).message?.length ? ": " + (error as Error).message : ""}`);
  }
};

export const getTimeZoneByCoordinates = async (latitude: number, longitude: number, currentTime: number) => {
  try {
    const response = await axios.get(`${PROXY_URL}https://maps.googleapis.com/maps/api/timezone/json?key=${GOOGLE_MAP_API_KEY}&timestamp=${currentTime}&location=${latitude}%2C${longitude}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get the time zone${(error as Error).message?.length ? ": " + (error as Error).message : ""}`);
  }
};
