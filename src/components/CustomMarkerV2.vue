<script setup lang="ts">
/*
 * IMPORTS
 */

import { CustomMarker } from "vue3-google-map";
import { ILatestPlace } from "../@types/global";

/*
 * PROPS
 */
defineProps<{
  marker: ILatestPlace;
}>();
</script>

<template>
  <CustomMarker :options="{ position: { lat: marker.lat, lng: marker.lng }, anchorPoint: 'BOTTOM_CENTER' }">
    <div class="popover-arrow">
      <p class="text-subtitle-2">{{ marker?.name }}</p>
      <p><span class="font-weight-bold">Time Zone:</span> {{ marker?.timeZone ?? "Not Available" }}</p>
      <p><span class="font-weight-bold">Local Time:</span> {{ marker?.localTime?.toUTCString() ?? "Not Available" }}</p>
      <div class="popover-arrow__arrow"></div>
    </div>
  </CustomMarker>
</template>

<style scoped>
.popover-arrow {
  border: 1px solid var(--gray);
  color: var(--black);
  background-color: var(--white);
  position: relative;
  padding: 10px;
  max-width: 200px;
}

.popover-arrow__arrow {
  height: 0.5rem;
  width: 0.5rem;
  background-color: var(--white);
  position: absolute;
  bottom: -9px;
  left: 50%;
  border-bottom: 1px solid var(--gray);
  border-right: 1px solid var(--gray);
  transform: translate(-50%, -50%) rotate(45deg);
}
</style>
