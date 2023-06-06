<script setup lang="ts">
/*
 * IMPORTS
 */
import { ref, onMounted } from "vue";
import { Header } from "vue3-easy-data-table";
import { useDisplay } from "vuetify";
import { IRecord, TSortBy, TPlace, ILatestPlace } from "../@types/global";
import { getTimeZoneByCoordinates, getAddressFromCoordinates } from "../apis";
import { updatePlacesInStore, getPlacesFromStore } from "../utils/store";
import Map from "../components/Map.vue";
import { getLocalTimeByOffset } from "../utils/helpers";
import { computed } from "vue";
import Table from "../components/Table.vue";

/*
 * CONSTANTS/ VARIABLES
 */
const headers: Header[] = [
  { text: "Name", value: "name" },
  { text: "Last Viewed", value: "lastViewed" },
  { text: "Operation", value: "operation" },
];
const { mobile } = useDisplay();
const markers = ref<IRecord[]>([]);
const searchValue = ref<string>("");
const userLocation = ref(null);
const snackbar = ref<{ show: boolean; color: string; message: string }>({ show: false, color: "red", message: "" });
const latestPlace = ref<ILatestPlace | undefined>();
const formattedPlaces = computed(() => markers.value.map((marker) => ({ ...marker, lastViewed: new Date(marker.lastViewed).toLocaleString() })));

/*
 * FUNCTIONS
 */
// Sort the places by lastViewed (default is in descending order)
const sortPlaces = (sortBy: TSortBy = "desc") => {
  if (markers.value.length) {
    if (sortBy === "asc") return markers.value.sort((a, b) => new Date(a.lastViewed).valueOf() - new Date(b.lastViewed).valueOf());
    else return markers.value.sort((a, b) => new Date(b.lastViewed).valueOf() - new Date(a.lastViewed).valueOf());
  }
};

// Trigger snackbar with custom message and color (default is error type)
const triggerSnackbar = (message = "Something went wrong", color = "red") => {
  snackbar.value = { ...snackbar.value, color, message, show: true };
};

// Update the search value and markers according to the result; warn user if the result is not available
const updateSearchResult = async (result: { lat?: number; lng?: number; name?: string } | null) => {
  if (result && result.lat && result.lng && result.name) {
    const { lat, lng, name } = result;
    searchValue.value = name;
    addPlace({ lat, lng, name });
  } else {
    triggerSnackbar("Location not found");
  }
};

// Update the latest searched place
const updateLatestPlace = async () => {
  if (markers.value[0]) latestPlace.value = { ...markers.value[0], ...(await getLatestPlaceTime(markers.value[0])) };
};

// Execute all the functions required for updating the places
const updatePlaces = () => {
  sortPlaces();
  updateLatestPlace();
  updatePlacesInStore(markers.value);
};

// Add place to the map and table
const addPlace = async (place: TPlace) => {
  const { lat, lng, name } = place;
  const duplicatedPlaceIndex = markers.value.findIndex((value) => value.name === name);
  if (duplicatedPlaceIndex !== -1) {
    markers.value[duplicatedPlaceIndex].lastViewed = new Date();
  } else {
    const location = { lat, lng };
    const id = Math.max(...markers.value.map((value) => value.id)) >= 0 ? Math.max(...markers.value.map((value) => value.id)) + 1 : 0;
    const newMarker = { ...location, id, name, lastViewed: new Date() };
    markers.value.unshift(newMarker);
  }
  updatePlaces();
};

// Delete places from the map and table
const deletePlaces = async (selectedPlaces: IRecord[]) => {
  if (selectedPlaces.length > 0) {
    markers.value = markers.value.filter((value) => !selectedPlaces.some((item) => value.id === item.id));
    updatePlaces();
  }
};

// Retrieve places from the store and update the markers
const getPlaces = async () => {
  markers.value = await getPlacesFromStore();
};

// Get the time zone and local time of the latest searched place
const getLatestPlaceTime = async (place: IRecord) => {
  const { lat, lng } = place;
  try {
    const timeZone = await getTimeZoneByCoordinates(lat, lng, Math.floor(Date.now() / 1000)); // currentTime in sec
    return { timeZone: timeZone.timeZoneName, localTime: getLocalTimeByOffset(timeZone.rawOffset, timeZone.dstOffset) };
  } catch (error) {
    triggerSnackbar((error as Error).message);
    return { timeZone: null, localTime: null };
  }
};

// Get the user's current location from their browser
const getUserLocation = () => {
  userLocation.value = null;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation.value = await getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (error.code == error.PERMISSION_DENIED) {
          triggerSnackbar("Location access is blocked, please unblock it to get your location");
        }
      }
    );
  }
};

// Get the first prediction if the exact result is not found
const getFirstPrediction = (): Promise<google.maps.GeocoderResult | null> => {
  return new Promise((resolve) => {
    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: searchValue.value }, (predictions: google.maps.places.QueryAutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
        resolve(null);
        return;
      }
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ placeId: predictions[0].place_id }).then(({ results }) => {
        resolve(results[0]);
      });
    });
  });
};

// Update search result and update when the search button is clicked
const handleSearchButtonOnClick = () => {
  if (!searchValue.value?.length) {
    triggerSnackbar("Please provide a place name");
    return;
  }
  const geocoder = new google.maps.Geocoder();
  geocoder.geocode({ address: searchValue.value }, async (results, status) => {
    let result;
    if (status === google.maps.GeocoderStatus.OK && results) {
      result = results[0];
    } else {
      result = await getFirstPrediction();
    }
    updateSearchResult({ lat: result?.geometry.location.lat(), lng: result?.geometry.location.lng(), name: result?.formatted_address });
  });
};

// Update the search result when the marker or the view location button on each row of the table is clicked
const handleMarkerOnClick = (marker: IRecord) => {
  updateSearchResult({ lat: marker.lat, lng: marker.lng, name: marker.name });
};

// Apply autocomplete to the search bar when the map (google service) is ready
const handleOnMapReady = (ready: boolean) => {
  if (ready) {
    const input = document.querySelector("input");
    const options = {
      types: ["geocode"],
    };
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.addListener("place_changed", async () => {
        let result: google.maps.places.PlaceResult | google.maps.GeocoderResult | null;
        result = autocomplete.getPlace();
        if (!result?.formatted_address) result = await getFirstPrediction();
        updateSearchResult({ lat: result?.geometry?.location?.lat(), lng: result?.geometry?.location?.lng(), name: result?.formatted_address });
      });
    }
  }
};

/*
 * VUE HOOKS
 */
// Retrieve and sort the places, update the latest searched place on mounted
onMounted(async () => {
  try {
    await getPlaces();
    sortPlaces();
    updateLatestPlace();
  } catch (error) {
    triggerSnackbar((error as Error).message);
  }
});
</script>

<template>
  <!-- LOCATION ACCESS BUTTON -->
  <div :class="['d-flex', mobile ? 'flex-column' : 'flex-row', mobile ? 'align-start' : 'align-center', 'mb-2', 'mt-5']">
    <v-btn @click="getUserLocation" prepend-icon=" mdi-home-map-marker" :class="[mobile ? 'mb-2' : 'mr-2']">Get My Location</v-btn>
    {{ userLocation }}
  </div>

  <!-- SEARCH BAR -->
  <v-text-field placeholder="Search location" v-model="searchValue" variant="underlined">
    <template #append>
      <v-btn icon="mdi-magnify" size="small" @click="handleSearchButtonOnClick"></v-btn>
    </template>
  </v-text-field>

  <!-- MAP -->
  <Map :latest-place="latestPlace" :markers="markers" @on-ready="handleOnMapReady" @on-update="updateSearchResult" />

  <!-- TABLE -->
  <Table :data="formattedPlaces" :headers="headers" title="Searched Places" @on-delete="deletePlaces">
    <template v-slot:operation="{ record }">
      <v-tooltip text="View Location" offset="1">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" @click="() => handleMarkerOnClick(record)" variant="plain" icon="mdi-map-search-outline" size="small"></v-btn>
        </template>
      </v-tooltip>
    </template>
  </Table>

  <!-- SNACKBAR -->
  <v-snackbar v-model="snackbar.show" color="red" min-width="auto">
    <p class="text-center">{{ snackbar.message }}</p>
  </v-snackbar>
</template>
