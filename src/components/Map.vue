<script setup lang="ts">
/*
 * IMPORTS
 */
import { ref, watch } from "vue";
import { GoogleMap, Marker } from "vue3-google-map";
import { IRecord, ILatestPlace } from "../@types/global";
import { GOOGLE_MAP_API_KEY } from "../utils/constants";
import CustomMarkerV2 from "./CustomMarkerV2.vue";

/*
 * PROPS
 */
const { latestPlace, markers } = defineProps<{
  latestPlace?: ILatestPlace;
  markers: IRecord[];
}>();

/*
 * EMIT EVENTS HANDLERS
 */
const emit = defineEmits(["on-ready", "on-update"]);

/*
 * CONSTANTS/ VARIABLES
 */

const DEFAULT_LOCATION = { lat: 43.65107, lng: -79.347015 }; // default location: Toronto (avoid showing unknown location on the map at init)
const mapRef = ref<any>(null);

/*
 * HELPERS/ EVENT HANDLERS
 */

// Emit the marker to update
const handleMarkerOnClick = (marker: IRecord) => {
  emit("on-update", { lat: marker.lat, lng: marker.lng, name: marker.name });
};

/*
 * VUE HOOKS
 */
watch(
  () => mapRef.value?.ready,
  (ready) => {
    emit("on-ready", ready);
  }
);
</script>

<template>
  <div class="map-container">
    <GoogleMap
      :api-key="GOOGLE_MAP_API_KEY"
      :zoom="15"
      :center="latestPlace ? { lat: latestPlace?.lat, lng: latestPlace?.lng } : DEFAULT_LOCATION"
      :position="latestPlace ? { lat: latestPlace?.lat, lng: latestPlace?.lng } : DEFAULT_LOCATION"
      ref="mapRef"
    >
      <div v-for="marker in markers" :key="marker.id">
        <template v-if="marker.id === latestPlace?.id">
          <CustomMarkerV2 :marker="latestPlace" />
        </template>
        <template v-else>
          <Marker :options="{ position: { lat: marker.lat, lng: marker.lng } }" @click="handleMarkerOnClick(marker)" />
        </template>
      </div>
    </GoogleMap>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  padding-bottom: 40%;
}

.map-container > div {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
