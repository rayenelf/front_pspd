// ── Client HTTP centralisé (F2 — tâche Majd) ────────────────────────────────
// Injecte le JWT dans chaque requête, gère les erreurs au format unifié.
import { getAccessToken, clearSession } from "@/lib/auth";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> ?? {}),
    },
  });

  if (res.status === 401) {
    clearSession();
    window.location.href = "/auth/login";
    throw new ApiError(401, "Session expirée");
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
};
