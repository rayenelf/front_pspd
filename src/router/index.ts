import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: () => import("@/views/Home.vue") },
    { path: "/services", component: () => import("@/views/services/Services.vue") },
    { path: "/services/:slug", component: () => import("@/views/services/ServiceDetail.vue") },
    { path: "/comment-ca-marche", component: () => import("@/views/CommentCaMarche.vue") },
    { path: "/devenir-prestataire", component: () => import("@/views/DevenirPrestataire.vue") },
    { path: "/auth/login", component: () => import("@/views/auth/Login.vue") },
    { path: "/auth/signup", component: () => import("@/views/auth/Signup.vue") },
    { path: "/auth/forgot-password", component: () => import("@/views/auth/ForgotPassword.vue") },
    { path: "/auth/callback", component: () => import("@/views/auth/OAuthCallback.vue") },
    {
      path: "/client",
      component: () => import("@/views/client/ClientLayout.vue"),
      children: [
        { path: "", component: () => import("@/views/client/ClientHome.vue") },
        { path: "reservations", component: () => import("@/views/client/Reservations.vue") },
        { path: "favoris", component: () => import("@/views/client/Favoris.vue") },
        { path: "factures", component: () => import("@/views/client/Factures.vue") },
        { path: "profil", component: () => import("@/views/client/Profil.vue") },
      ],
    },
    {
      path: "/pro",
      component: () => import("@/views/pro/ProLayout.vue"),
      children: [
        { path: "", component: () => import("@/views/pro/ProHome.vue") },
        { path: "missions", component: () => import("@/views/pro/Missions.vue") },
        { path: "agenda", component: () => import("@/views/pro/Agenda.vue") },
        { path: "devis", component: () => import("@/views/pro/Devis.vue") },
        { path: "avis", component: () => import("@/views/pro/Avis.vue") },
        { path: "profil", component: () => import("@/views/pro/Profil.vue") },
      ],
    },
    {
      path: "/admin",
      component: () => import("@/views/admin/AdminLayout.vue"),
      children: [
        { path: "", component: () => import("@/views/admin/AdminHome.vue") },
        { path: "utilisateurs", component: () => import("@/views/admin/Utilisateurs.vue") },
        { path: "prestataires", component: () => import("@/views/admin/Prestataires.vue") },
        { path: "finances", component: () => import("@/views/admin/Finances.vue") },
        { path: "contenus", component: () => import("@/views/admin/Contenus.vue") },
        { path: "signalements", component: () => import("@/views/admin/Signalements.vue") },
      ],
    },
    { path: "/:pathMatch(.*)*", component: () => import("@/views/NotFound.vue") },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
