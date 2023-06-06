<script setup lang="ts">
/*
 * IMPORTS
 */
import { ref } from "vue";
import { IRecord } from "../@types/global";
import { Header } from "vue3-easy-data-table";

/*
 * PROPS
 */
const { title, headers, data } = defineProps<{
  title: string;
  headers: Header[];
  data: unknown[];
}>();

/*
 * EMIT EVENTS
 */
const emit = defineEmits(["on-delete"]);

/*
 * CONSTANTS/ VARIABLES
 */

const selectedItems = ref<IRecord[]>([]);

/*
 * HELPERS/ EVENT HANDLERS
 */
// Emit the selected items to delete
const handleOnDelete = () => {
  emit("on-delete", selectedItems.value);
  selectedItems.value = [];
};
</script>

<template>
  <v-sheet class="pa-2 mt-5">
    <v-row class="align-center justify-space-between">
      <v-col class="justify-space-between">
        <h5 class="text-h5">{{ title }}</h5>
      </v-col>
      <v-col class="text-right">
        <v-tooltip text="Delete selected items">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="tonal" icon="mdi-delete-outline" @click="handleOnDelete" size="small" :disabled="selectedItems.length === 0"> </v-btn>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-sheet>
  <EasyDataTable :headers="headers" :items="data" class="table" :rows-per-page="10" hide-rows-per-page v-model:items-selected="selectedItems">
    <template #item-operation="record">
      <slot name="operation" :record="record"></slot>
    </template>
  </EasyDataTable>
</template>
