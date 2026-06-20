import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import {
  isAuthenticated,
  getRole,
  getRefreshToken,
  clearSession,
  homeRouteForRole,
  type Role,
} from "@/lib/auth";

// `meta.roles` : si présent, route protégée — seuls ces rôles y accèdent.
// Absent → route publique.
declare module "vue-router" {
  interface RouteMeta {
    roles?: Role[];
  }
}

const routes: RouteRecordRaw[] = [
  { path: "/", component: () => import("@/views/Home.vue") },
  { path: "/services", component: () => import("@/views/services/Services.vue") },
  { path: "/services/:slug", component: () => import("@/views/services/ServiceDetail.vue") },
  { path: "/comment-ca-marche", component: () => import("@/views/CommentCaMarche.vue") },
  { path: "/cgu", component: () => import("@/views/legal/CGU.vue") },
  { path: "/confidentialite", component: () => import("@/views/legal/Confidentialite.vue") },
  { path: "/devenir-prestataire", component: () => import("@/views/DevenirPrestataire.vue") },
  { path: "/auth/login", component: () => import("@/views/auth/Login.vue") },
  { path: "/auth/signup", component: () => import("@/views/auth/Signup.vue") },
  { path: "/auth/forgot-password", component: () => import("@/views/auth/ForgotPassword.vue") },
  { path: "/auth/reset-password", component: () => import("@/views/auth/ResetPassword.vue") },
  { path: "/auth/callback", component: () => import("@/views/auth/OAuthCallback.vue") },
  { path: "/auth/2fa", component: () => import("@/views/auth/Verify2fa.vue") },
  { path: "/auth/verify-email", component: () => import("@/views/auth/VerifyEmail.vue") },
  {
    path: "/client",
    component: () => import("@/views/client/ClientLayout.vue"),
    meta: { roles: ["CLIENT"] },
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
    meta: { roles: ["PRESTATAIRE"] },
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
    meta: { roles: ["ADMIN", "SUPER_ADMIN"] },
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
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// ── Garde d'authentification + autorisation par rôle (F4 — Majd) ─────────────
router.beforeEach(async (to) => {
  // Rôles requis = ceux déclarés sur la route la plus profonde qui en a.
  const required = to.matched.find((r) => r.meta.roles)?.meta.roles;

  // Route publique → libre.
  if (!required) return true;

  // Access token absent/expiré : tenter un refresh silencieux avant de
  // renvoyer au login — le refresh token reste valable 7 jours.
  if (!isAuthenticated()) {
    let refreshed = false;
    if (getRefreshToken()) {
      const { api } = await import("@/lib/api"); // import dynamique : évite le cycle router ↔ api
      refreshed = await api.refreshTokens().catch(() => false);
    }
    if (!refreshed) {
      clearSession(); // tokens morts → purge propre avant le login
      return { path: "/auth/login", query: { redirect: to.fullPath } };
    }
  }

  // Authentifié mais mauvais rôle → renvoyé vers son propre espace.
  const role = getRole();
  if (!role || !required.includes(role)) {
    return homeRouteForRole(role);
  }

  return true;
});
