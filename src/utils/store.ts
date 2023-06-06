import { IRecord } from "../@types/global";

const STORE_NAME = "place-finder-store";

// Update list of searched places to session storage
export const updatePlacesInStore = (places: IRecord[]) => {
  sessionStorage.setItem(STORE_NAME, JSON.stringify(places));
};

// Get list of searched places from session storage
export const getPlacesFromStore = () => {
  return JSON.parse(sessionStorage.getItem(STORE_NAME) ?? "[]");
};
