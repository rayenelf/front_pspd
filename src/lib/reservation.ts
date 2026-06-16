// ── Contrat partagé Réservation (Sprint 3 / Epic C) ─────────────────────────
// Type miroir du backend `ReservationResponse`. Consommé par les deux écrans :
//   • Dev A → client (« Mes réservations »)
//   • Dev B → prestataire (« Mes missions »)
// Réf. cycle de vie : 12-state-reservation.png

export type TypeReservation = "IMMEDIATE" | "AVEC_DEVIS";

export type StatutReservation =
  | "EN_ATTENTE"
  | "ACCEPTEE"
  | "REFUSEE"
  | "EN_COURS"
  | "TERMINEE"
  | "ANNULEE"
  | "EN_LITIGE";

/** Réponse API d'une réservation (GET /api/reservations, /{id}). */
export interface Reservation {
  id: string;
  clientId: string;
  prestataireId: string;
  serviceId: string;
  adresseId: string;
  type: TypeReservation;
  statut: StatutReservation;
  dateService: string; // ISO date  "YYYY-MM-DD"
  heureService: string; // ISO time "HH:mm:ss"
  description: string | null;
  prixConvenu: number | null;
  creeLe: string; // ISO datetime
}

/** Corps de POST /api/reservations (US C1 — client). */
export interface CreateReservationRequest {
  prestataireId: string;
  serviceId: string;
  adresseId: string;
  dateService: string; // "YYYY-MM-DD"
  heureService: string; // "HH:mm"
}

/** Libellé + couleur d'affichage par statut (badges des deux écrans). */
export const STATUT_LABELS: Record<StatutReservation, string> = {
  EN_ATTENTE: "En attente",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  EN_COURS: "En cours",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
  EN_LITIGE: "En litige",
};
