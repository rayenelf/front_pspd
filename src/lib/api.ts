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
  deviceToken?: string;
}

export interface SessionData {
  sid: string;
  device: string;
  ip: string;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
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

// ── Catalogue & recherche (Epic B) ──────────────────────────────────────────

export interface CategorieData {
  id: string;
  libelle: string;
  slug: string;
  enfants: CategorieData[];
}

export interface ServiceData {
  id: string;
  categorieId: string;
  libelle: string;
  description: string | null;
  prixIndicatif: number | null;
  unite: string | null;
}

export interface SearchResultItem {
  prestataireId: string;
  nomCommercial: string;
  categoriePrincipale: string | null;
  note: number;
  certifie: boolean;
  langues: string | null;
  zoneIntervention: string | null;
  rayonKm: number;
  prixIndicatif: number | null;
  distanceKm: number | null;
  etaMin: number | null;
}

export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchParams {
  service?: string;
  prixMax?: number;
  noteMin?: number;
  certifie?: boolean;
  langue?: string;
  tri?: "mieuxNote" | "moinsCher";
  page?: number;
  size?: number;
}

// ── Admin — validation prestataires (B9) ────────────────────────────────────

export type StatutValidation = "EN_ATTENTE" | "VERIFICATION" | "VALIDE" | "SUSPENDU";

export interface AdminPrestataireData {
  userId: string;
  email: string;
  prenom: string | null;
  nom: string | null;
  telephone: string;
  nomCommercial: string;
  categoriePrincipale: string | null;
  zoneIntervention: string | null;
  statutValidation: StatutValidation;
  certifie: boolean;
  noteMoyenne: number;
  inscritLe: string;
  documents: DocumentData[];
}

export interface PrestataireStats {
  enAttente: number;
  enVerification: number;
  valides: number;
  suspendus: number;
  total: number;
}

/** Construit une query string en ignorant les valeurs vides/indéfinies. */
function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export const api = {
  getMe: (): Promise<UserData> =>
    apiFetch("/api/users/me"),

  patchMe: (data: UpdateUserPayload): Promise<UserData> =>
    apiFetch("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  /** Change le mot de passe (connecté). currentPassword optionnel pour compte OAuth. */
  changePassword: (currentPassword: string | undefined, newPassword: string): Promise<void> =>
    apiFetch("/api/users/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  /** Force le rafraîchissement des tokens (ex. après mise à jour du profil → JWT à jour). */
  refreshTokens: (): Promise<boolean> => tryRefresh(),

  patchPrestataire: (data: UpdatePrestatairePayload): Promise<void> =>
    apiFetch("/api/prestataires/me", { method: "PATCH", body: JSON.stringify(data) }),

  /** Envoie (ou renvoie) un OTP à l'utilisateur — endpoint public. */
  send2faOtp: (email: string): Promise<void> =>
    apiFetch("/api/auth/2fa/send", { method: "POST", body: JSON.stringify({ email }) }),

  /** Vérifie le code OTP et retourne les tokens JWT (+ device-token si rememberDevice). */
  verify2fa: (email: string, code: string, rememberDevice = false): Promise<AuthResponse> =>
    apiFetch("/api/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ email, code, rememberDevice }),
    }),

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

  /** Demande un lien de réinitialisation de mot de passe — endpoint public. */
  forgotPassword: (email: string): Promise<void> =>
    apiFetch("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  /** Applique le nouveau mot de passe via le token reçu — endpoint public. */
  resetPassword: (token: string, newPassword: string): Promise<void> =>
    apiFetch("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) }),

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

  /** Sessions/appareils de l'utilisateur (#3). */
  getSessions: (): Promise<SessionData[]> =>
    apiFetch("/api/users/me/sessions"),

  revokeSession: (sid: string): Promise<void> =>
    apiFetch(`/api/users/me/sessions/${sid}`, { method: "DELETE" }),

  logoutAllSessions: (): Promise<void> =>
    apiFetch("/api/users/me/sessions/logout-all", { method: "POST" }),

  /** Suppression de compte (RGPD, #6). */
  deleteAccount: (password?: string): Promise<void> =>
    apiFetch("/api/users/me", { method: "DELETE", body: JSON.stringify({ password }) }),

  // ── Catalogue & recherche (Epic B) ─────────────────────────────────────────

  /** Arbre des catégories actives — public (B1). */
  getCategories: (): Promise<CategorieData[]> =>
    apiFetch("/api/categories"),

  /** Services actifs d'une catégorie — public (B1). */
  getCategoryServices: (categorieId: string): Promise<ServiceData[]> =>
    apiFetch(`/api/categories/${categorieId}/services`),

  /** Recherche multi-critères de prestataires — public (B2/B3). */
  search: (params: SearchParams = {}): Promise<Page<SearchResultItem>> =>
    apiFetch(`/api/search${toQuery(params as Record<string, unknown>)}`),

  /** Crée une catégorie — ADMIN (B5). */
  createCategory: (libelle: string, slug: string, parentId?: string): Promise<CategorieData> =>
    apiFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify({ libelle, slug, parentId }),
    }),

  /** Crée un service dans une catégorie — ADMIN (B5). */
  createService: (data: {
    categorieId: string;
    libelle: string;
    description?: string;
    prixIndicatif?: number;
    unite?: string;
  }): Promise<ServiceData> =>
    apiFetch("/api/services", { method: "POST", body: JSON.stringify(data) }),

  /** Met à jour un service — ADMIN (B5). */
  updateService: (id: string, data: Partial<{
    libelle: string;
    description: string;
    prixIndicatif: number;
    unite: string;
  }>): Promise<ServiceData> =>
    apiFetch(`/api/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  /** Désactive (suppression logique) un service — ADMIN (B5). */
  deleteService: (id: string): Promise<void> =>
    apiFetch(`/api/services/${id}`, { method: "DELETE" }),

  // ── Admin — validation prestataires (B9) ───────────────────────────────────

  /** Compteurs de prestataires par statut — ADMIN. */
  adminPrestataireStats: (): Promise<PrestataireStats> =>
    apiFetch("/api/admin/prestataires/stats"),

  /** Liste des prestataires (filtre statut optionnel) — ADMIN. */
  adminListPrestataires: (statut?: StatutValidation): Promise<AdminPrestataireData[]> =>
    apiFetch(`/api/admin/prestataires${statut ? `?statut=${statut}` : ""}`),

  /** Décision de validation (VALIDE / SUSPENDU / VERIFICATION / EN_ATTENTE) — ADMIN. */
  adminDecideValidation: (
    prestataireId: string,
    statut: StatutValidation,
    motif?: string,
  ): Promise<AdminPrestataireData> =>
    apiFetch(`/api/admin/prestataires/${prestataireId}/validation`, {
      method: "PATCH",
      body: JSON.stringify({ statut, motif }),
    }),

  /**
   * Récupère un document légal et renvoie une URL blob à ouvrir/visualiser — ADMIN.
   * Passe par fetch authentifié (le JWT est dans l'en-tête, pas dans l'URL) :
   * ouvrir directement l'URL dans un onglet ne transmettrait pas le token.
   */
  adminViewDocument: async (documentId: string): Promise<string> => {
    const token = getAccessToken();
    const res = await fetch(`${BASE}/api/admin/documents/${documentId}/file`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, "Impossible d'ouvrir le document.");
    return URL.createObjectURL(await res.blob());
  },
};
