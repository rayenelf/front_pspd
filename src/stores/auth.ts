// ============================================================
// Store de session Pinia (F1 — Majd).
// Source de vérité réactive de l'authentification.
// La persistance bas niveau (localStorage, décodage JWT) reste dans lib/auth.ts ;
// ce store en est la couche réactive partagée par les composants.
//
// Les actions login/register/refresh dépendent des endpoints du collègue
// (B6) — voir les TODO ci-dessous. setSession/logout sont opérationnels.
// ============================================================
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  saveSession,
  clearSession,
  getCurrentUser,
  getDisplayName,
  getInitials,
  homeRouteForRole,
  isAuthenticated as tokenIsValid,
  type UserInfo,
  type Role,
} from "@/lib/auth";

export const useAuthStore = defineStore("auth", () => {
  // ── État ───────────────────────────────────────────────────────────────────
  const user = ref<UserInfo | null>(getCurrentUser());

  // ── Getters ────────────────────────────────────────────────────────────────
  const isAuthenticated = computed(() => user.value !== null && tokenIsValid());
  const role            = computed<Role | null>(() => user.value?.role ?? null);
  const displayName     = computed(() => (user.value ? getDisplayName(user.value) : "—"));
  const initials        = computed(() => (user.value ? getInitials(user.value) : "?"));
  const email           = computed(() => user.value?.email ?? "");
  const homeRoute       = computed(() => homeRouteForRole(role.value));

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Enregistre une session à partir des tokens (OAuth2 callback, vérif 2FA…). */
  function setSession(accessToken: string, refreshToken: string) {
    saveSession(accessToken, refreshToken);
    user.value = getCurrentUser();
  }

  /** Recharge l'utilisateur depuis le token courant (ex. au démarrage de l'app). */
  function refreshFromStorage() {
    user.value = tokenIsValid() ? getCurrentUser() : null;
  }

  /** Déconnexion : révoque côté serveur (best-effort) puis purge tokens + état. */
  async function logout() {
    try {
      const { api } = await import("@/lib/api");
      await api.logout();
    } catch {
      /* best-effort : on purge la session locale quoi qu'il arrive */
    }
    clearSession();
    user.value = null;
  }

  // TODO B6 (collègue) : async function login(email, password) → POST /api/auth/login
  //   → si twoFactorRequired, retourner le challenge ; sinon setSession(tokens).
  // TODO B6 (collègue) : async function register(payload) → POST /api/auth/register.
  // TODO B6 (collègue) : async function refresh() → POST /api/auth/refresh (rotation).

  return {
    user,
    isAuthenticated,
    role,
    displayName,
    initials,
    email,
    homeRoute,
    setSession,
    refreshFromStorage,
    logout,
  };
});
