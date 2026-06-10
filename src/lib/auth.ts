// ============================================================
// Helper d'authentification — autonome (sans Pinia).
// ⚠️ TEMPORAIRE : à remplacer par le store Pinia (tâche F1 du collègue).
//   Quand le store existe, migrer saveSession / getToken / getRole vers lui.
// Utilisé par : GoogleLoginButton.vue + OAuthCallback.vue (tâche Majd — F3).
// ============================================================

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const TOKEN_KEY = "pspd_access_token";
const REFRESH_KEY = "pspd_refresh_token";

export type Role = "CLIENT" | "PRESTATAIRE" | "ADMIN" | "SUPER_ADMIN";

/** URL d'entrée du flux OAuth2 Google (Spring redirige vers Google). */
export function googleLoginUrl(): string {
  return `${API_BASE}/oauth2/authorization/google`;
}

export function saveSession(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/** Décode le payload d'un JWT (sans vérifier la signature — usage front uniquement). */
export function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Récupère le rôle depuis l'access token courant. */
export function getRole(): Role | null {
  const token = getAccessToken();
  if (!token) return null;
  const claims = decodeJwt(token);
  return (claims?.role as Role) ?? null;
}

/** Route de destination selon le rôle après login. */
export function homeRouteForRole(role: Role | null): string {
  switch (role) {
    case "PRESTATAIRE":
      return "/pro";
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin";
    case "CLIENT":
    default:
      return "/client";
  }
}
