// ── API Réservation (Sprint 3 / Epic C) ─────────────────────────────────────
// Module dédié pour ne pas empiéter sur lib/api.ts. Réutilise le token JWT
// stocké par lib/auth. Côté prestataire (Dev B) : missions + transitions.
import { getAccessToken } from "@/lib/auth";
import type { Reservation, StatutReservation } from "@/lib/reservation";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function call<T>(path: string, method: string): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Erreur ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const reservationApi = {
  /** Missions du prestataire connecté, éventuellement filtrées par statut. */
  mesMissions: (statut?: StatutReservation): Promise<Reservation[]> =>
    call(`/api/reservations/mes-missions${statut ? `?statut=${statut}` : ""}`, "GET"),

  accepter: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/accepter`, "PATCH"),
  refuser:  (id: string): Promise<Reservation> => call(`/api/reservations/${id}/refuser`, "PATCH"),
  demarrer: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/demarrer`, "PATCH"),
  terminer: (id: string): Promise<Reservation> => call(`/api/reservations/${id}/terminer`, "PATCH"),
};
