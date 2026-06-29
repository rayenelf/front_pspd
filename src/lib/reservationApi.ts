// ── API Réservation (Sprint 3 / Epic C) ─────────────────────────────────────
// Module dédié pour ne pas empiéter sur lib/api.ts. Réutilise le token JWT
// stocké par lib/auth. Côté prestataire (Dev B) : missions + transitions.
import { getAccessToken } from "@/lib/auth";
import type {
  Reservation,
  StatutReservation,
  Devis,
  CreateDevisRequest,
  ReservationImage,
} from "@/lib/reservation";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function call<T>(path: string, method: string, body?: unknown): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message ?? `Erreur ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Récupère un binaire protégé (image) et renvoie une URL objet utilisable dans <img>. */
async function fetchBlobUrl(path: string): Promise<string> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

export const reservationApi = {
  // ── Côté CLIENT ───────────────────────────────────────────────────────────
  /** Crée une réservation immédiate (US C1). */
  creer: (req: import("@/lib/reservation").CreateReservationRequest): Promise<Reservation> =>
    call("/api/reservations", "POST", req),

  /** Réservations du client connecté, filtrables par statut. */
  mesReservations: (statut?: StatutReservation): Promise<Reservation[]> =>
    call(`/api/reservations${statut ? `?statut=${statut}` : ""}`, "GET"),

  /** Détail d'une réservation. */
  getById: (id: string): Promise<Reservation> => call(`/api/reservations/${id}`, "GET"),

  /** Client annule sa réservation. */
  annuler: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/annuler`, "PATCH"),

  // ── Côté PRESTATAIRE ──────────────────────────────────────────────────────
  /** Missions du prestataire connecté, éventuellement filtrées par statut. */
  mesMissions: (statut?: StatutReservation): Promise<Reservation[]> =>
    call(`/api/reservations/mes-missions${statut ? `?statut=${statut}` : ""}`, "GET"),

  accepter: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/accepter`, "PATCH"),
  refuser:  (id: string): Promise<Reservation> => call(`/api/reservations/${id}/refuser`, "PATCH"),
  demarrer: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/demarrer`, "PATCH"),
  terminer: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/terminer`, "PATCH"),

  // ── Flow AVEC_DEVIS ────────────────────────────────────────────────────────
  /** Métadonnées des images de travail jointes par le client. */
  images: (reservationId: string): Promise<ReservationImage[]> =>
    call(`/api/reservations/${reservationId}/images`, "GET"),

  /** URL objet d'une image (flux authentifié → blob). */
  imageFileUrl: (reservationId: string, imageId: string): Promise<string> =>
    fetchBlobUrl(`/api/reservations/${reservationId}/images/${imageId}/file`),

  /** Devis associé à une réservation (404 si aucun). */
  getDevis: (reservationId: string): Promise<Devis> =>
    call(`/api/reservations/${reservationId}/devis`, "GET"),

  /** Le prestataire émet un devis pour la demande. */
  creerDevis: (reservationId: string, req: CreateDevisRequest): Promise<Devis> =>
    call(`/api/reservations/${reservationId}/devis`, "POST", req),

  /** Le client accepte le devis → réservation passe ACCEPTEE. */
  accepterDevis: (reservationId: string): Promise<Devis> =>
    call(`/api/reservations/${reservationId}/devis/accepter`, "PATCH"),

  /** Le client refuse le devis. */
  refuserDevis: (reservationId: string): Promise<Devis> =>
    call(`/api/reservations/${reservationId}/devis/refuser`, "PATCH"),
};
