import { createRouter, createWebHistory } from "vue-router";
import BlackjackView from "../views/BlackjackView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: BlackjackView,
    },
  ],
});

export default router;
