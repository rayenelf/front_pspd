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

// ── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  getMe: (): Promise<UserData> =>
    apiFetch("/api/users/me"),

  patchMe: (data: UpdateUserPayload): Promise<UserData> =>
    apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  patchPrestataire: (data: UpdatePrestatairePayload): Promise<void> =>
    apiFetch("/api/prestataires/me", { method: "PATCH", body: JSON.stringify(data) }),
};
