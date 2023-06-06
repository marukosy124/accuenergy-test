import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "vuetify/styles";
import "vuejs-google-maps/dist/vuejs-google-maps.css";
import "@mdi/font/css/materialdesignicons.css";
import Vue3EasyDataTable from "vue3-easy-data-table";
import "vue3-easy-data-table/dist/style.css";
import { vuetify } from "./config/vuetify";

const app = createApp(App);
app.use(vuetify).component("EasyDataTable", Vue3EasyDataTable).mount("#app");
