// ── Client HTTP centralisé (F2 — tâche Majd) ────────────────────────────────
// Injecte le JWT dans chaque requête, gère le refresh auto sur 401, et le
// format d'erreur unifié.
import { getAccessToken, getRefreshToken, saveSession, clearSession } from "@/lib/auth";

// Base vide par défaut → les chemins "/api/..." passent par le proxy Vite
// (/api → localhost:8081), ce qui évite les soucis de CORS en dev.
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Force une déconnexion propre + retour au login. */
function forceLogout(): never {
  clearSession();
  window.location.href = "/auth/login";
  throw new ApiError(401, "Session expirée");
}

// Évite plusieurs refresh simultanés : on partage la même promesse.
let refreshPromise: Promise<boolean> | null = null;

/** Tente de rafraîchir l'access token via /api/auth/refresh. Retourne true si OK. */
async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json().catch(() => null);
        if (data?.accessToken && data?.refreshToken) {
          saveSession(data.accessToken, data.refreshToken);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function apiFetch<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
  const token = getAccessToken();
  // Pour un envoi multipart (FormData), on laisse le navigateur poser le
  // Content-Type avec la boundary — on ne force PAS application/json.
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  });

  if (res.status === 401) {
    // Première 401 → on tente un refresh puis on rejoue la requête une seule fois.
    if (!_retried && (await tryRefresh())) {
      return apiFetch<T>(path, options, true);
    }
    forceLogout();
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface UserData {
  id: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  telephone: string;
  role: string;
  statutCompte: string;
  doubleAuthActive: boolean;
}

export interface UpdateUserPayload {
  prenom?: string;
  nom?: string;
  telephone?: string;
}

export interface UpdatePrestatairePayload {
  nomCommercial?: string;
  categoriePrincipale?: string;
  zoneIntervention?: string;
  rayonKm?: number;
  langues?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: string;
}

export type TypeDocument =
  | "CIN" | "PATENTE_RC" | "ATTESTATION_FISCALE" | "ASSURANCE_RC" | "DIPLOME";

export interface DocumentData {
  id: string;
  type: TypeDocument;
  urlFichier: string;
  statut: "EN_ATTENTE" | "VERIFICATION" | "VALIDE" | "SUSPENDU";
  verifieLe: string | null;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  getMe: (): Promise<UserData> =>
    apiFetch("/api/users/me"),

  patchMe: (data: UpdateUserPayload): Promise<UserData> =>
    apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  patchPrestataire: (data: UpdatePrestatairePayload): Promise<void> =>
    apiFetch("/api/prestataires/me", { method: "PATCH", body: JSON.stringify(data) }),

  /** Envoie (ou renvoie) un OTP à l'utilisateur — endpoint public. */
  send2faOtp: (email: string): Promise<void> =>
    apiFetch("/api/auth/2fa/send", { method: "POST", body: JSON.stringify({ email }) }),

  /** Vérifie le code OTP et retourne les tokens JWT — endpoint public. */
  verify2fa: (email: string, code: string): Promise<AuthResponse> =>
    apiFetch("/api/auth/2fa/verify", { method: "POST", body: JSON.stringify({ email, code }) }),

  /** Active ou désactive la 2FA — endpoint protégé (nécessite B5). */
  toggle2fa: (active: boolean): Promise<void> =>
    apiFetch("/api/users/me/2fa", { method: "POST", body: JSON.stringify({ active }) }),

  /** Déconnexion : blackliste l'access + le refresh token côté serveur (#2). */
  logout: (): Promise<void> =>
    apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    }),

  /** Valide le lien de vérification d'email — endpoint public. */
  verifyEmail: (token: string): Promise<void> =>
    apiFetch("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),

  /** Renvoie un lien de vérification d'email — endpoint public. */
  resendVerification: (email: string): Promise<void> =>
    apiFetch("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),

  /** Documents légaux du prestataire courant (B9). */
  getDocuments: (): Promise<DocumentData[]> =>
    apiFetch("/api/prestataires/me/documents"),

  /** Dépose un document légal (multipart) — PRESTATAIRE uniquement. */
  uploadDocument: (type: TypeDocument, file: File): Promise<DocumentData> => {
    const form = new FormData();
    form.append("type", type);
    form.append("file", file);
    return apiFetch("/api/prestataires/me/documents", { method: "POST", body: form });
  },
};
