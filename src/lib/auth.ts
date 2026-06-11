// ============================================================
// Helper d'authentification — autonome (sans Pinia).
// ⚠️ TEMPORAIRE : à remplacer par le store Pinia (tâche F1 du collègue).
//   Quand le store existe, migrer saveSession / getToken / getRole vers lui.
// Utilisé par : GoogleLoginButton.vue + OAuthCallback.vue (tâche Majd — F3).
// ============================================================

// URL absolue du backend — utilisée UNIQUEMENT pour les redirections OAuth2
// (navigation pleine page, hors proxy Vite). Le backend dev tourne sur 8081.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

const TOKEN_KEY = "pspd_access_token";
const REFRESH_KEY = "pspd_refresh_token";

export type Role = "CLIENT" | "PRESTATAIRE" | "ADMIN" | "SUPER_ADMIN";

/** Login Google — utilisateur existant (page Login). Pas de rôle. */
export function googleLoginUrl(): string {
  return `${API_BASE}/oauth2/authorization/google`;
}

/** Signup Google — nouveau compte avec rôle pré-sélectionné (page Signup). */
export function googleSignupUrl(role: "client" | "pro"): string {
  const backendRole = role === "pro" ? "PRESTATAIRE" : "CLIENT";
  return `${API_BASE}/api/auth/oauth2/google?role=${backendRole}`;
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

/**
 * Vrai si un access token valide et non expiré est présent.
 * Vérifie le claim `exp` (secondes epoch) ; un token expiré est purgé.
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  const claims = decodeJwt(token);
  if (!claims) return false;
  const exp = claims.exp as number | undefined;
  if (exp && exp * 1000 < Date.now()) {
    clearSession();
    return false;
  }
  return true;
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

// ── Infos utilisateur courantes (lues depuis le JWT décodé) ──────────────────

export interface UserInfo {
  uid: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  telephone: string | null;
  role: Role;
}

/** Retourne les infos de l'utilisateur connecté depuis le JWT local. */
export function getCurrentUser(): UserInfo | null {
  const token = getAccessToken();
  if (!token) return null;
  const c = decodeJwt(token);
  if (!c?.sub) return null;
  return {
    uid:       c.uid       as string,
    email:     c.sub       as string,
    prenom:    (c.prenom    as string) ?? null,
    nom:       (c.nom       as string) ?? null,
    telephone: (c.telephone as string) ?? null,
    role:      c.role      as Role,
  };
}

/** "Salma Bennani" ou à défaut la partie locale de l'email. */
export function getDisplayName(user: UserInfo): string {
  const parts = [user.prenom, user.nom].filter(Boolean);
  return parts.length ? parts.join(" ") : user.email.split("@")[0];
}

/** "SB", "SA", ou les deux premières lettres de l'email. */
export function getInitials(user: UserInfo): string {
  if (user.prenom && user.nom)
    return (user.prenom[0] + user.nom[0]).toUpperCase();
  if (user.prenom) return user.prenom.slice(0, 2).toUpperCase();
  if (user.nom)    return user.nom.slice(0, 2).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}
export type SignupRole = "CLIENT" | "PRESTATAIRE";

export type ClientType = "PARTICULIER" | "ENTREPRISE";

export interface SignupPayload {
  role: SignupRole;
  type: ClientType;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  motDePasse: string;
  raisonSociale?: string;
  matriculeFiscal?: string;
  nomCommercial?: string;
  categoriePrincipale?: string;
}

export interface SignupResponse {
  id: string;
  email: string;
  role: SignupRole;
  statutCompte: string;
}

function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL ?? "/api";
}

export async function registerAccount(payload: SignupPayload): Promise<SignupResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String(data.message)
        : typeof data === "string" && data
          ? data
          : "Impossible de créer le compte pour le moment.";

    throw new Error(message);
  }

  return data as SignupResponse;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface LoginResponse {
  id?: string;
  email: string;
  role?: SignupRole;
  statutCompte?: string;
  accessToken?: string;
  refreshToken?: string;
  twoFactorRequired?: boolean;
}

export async function loginAccount(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as any).message)
        : typeof data === "string" && data
        ? data
        : "Impossible de se connecter pour le moment.";

    throw new Error(message);
  }

  return data as LoginResponse;
}
