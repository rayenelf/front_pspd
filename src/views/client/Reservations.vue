<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import ChatModal from "@/components/chat/ChatModal.vue";
import { reservationApi } from "@/lib/reservationApi";
import { STATUT_LABELS, type Reservation, type StatutReservation } from "@/lib/reservation";

const reservations = ref<Reservation[]>([]);
const loading  = ref(true);
const error    = ref<string | null>(null);
const busyId   = ref<string | null>(null);
const chatReservation = ref<Reservation | null>(null);

const onglets: { label: string; statut: StatutReservation | null }[] = [
  { label: "Toutes",      statut: null },
  { label: "En attente",  statut: "EN_ATTENTE" },
  { label: "Acceptées",   statut: "ACCEPTEE" },
  { label: "En cours",    statut: "EN_COURS" },
  { label: "Terminées",   statut: "TERMINEE" },
  { label: "Annulées",    statut: "ANNULEE" },
];
const filtre = ref<StatutReservation | null>(null);

const filtrees = computed(() =>
  filtre.value === null
    ? reservations.value
    : reservations.value.filter((r) => r.statut === filtre.value),
);

function compte(statut: StatutReservation | null) {
  return statut === null
    ? reservations.value.length
    : reservations.value.filter((r) => r.statut === statut).length;
}

function badgeVariant(s: StatutReservation): "default" | "secondary" | "destructive" {
  if (s === "ANNULEE" || s === "REFUSEE" || s === "EN_LITIGE") return "destructive";
  if (s === "TERMINEE") return "secondary";
  return "default";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatHeure(h: string) {
  return h?.slice(0, 5) ?? "";
}

function peutAnnuler(r: Reservation) {
  return r.statut === "EN_ATTENTE" || r.statut === "ACCEPTEE";
}

function peutDiscuter(r: Reservation) {
  return r.statut === "EN_ATTENTE" || r.statut === "ACCEPTEE" || r.statut === "EN_COURS";
}

async function charger() {
  loading.value = true;
  error.value   = null;
  try {
    reservations.value = await reservationApi.mesReservations();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function annuler(r: Reservation) {
  if (!confirm(`Annuler la réservation du ${formatDate(r.dateService)} ?`)) return;
  busyId.value = r.id;
  try {
    const updated = await reservationApi.annuler(r.id);
    const idx = reservations.value.findIndex((x) => x.id === r.id);
    if (idx !== -1) reservations.value[idx] = updated;
  } catch (e) {
    alert((e as Error).message);
  } finally {
    busyId.value = null;
  }
}

onMounted(charger);
</script>

<template>
  <PanelCard title="Mes réservations">
    <template #action>
      <RouterLink to="/services">
        <Button size="sm" class="bg-gradient-warm text-primary-foreground">Nouvelle réservation</Button>
      </RouterLink>
    </template>

    <!-- Onglets filtre -->
    <div class="mb-4 flex flex-wrap gap-2 border-b border-border pb-3">
      <button
        v-for="o in onglets"
        :key="String(o.statut)"
        @click="filtre = o.statut"
        :class="[
          'rounded-full px-3 py-1 text-xs font-medium transition',
          filtre === o.statut
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-accent',
        ]"
      >
        {{ o.label }}
        <span class="ml-1 opacity-70">({{ compte(o.statut) }})</span>
      </button>
    </div>

    <!-- Chargement -->
    <p v-if="loading" class="py-8 text-center text-sm text-muted-foreground">Chargement…</p>
    <p v-else-if="error" class="py-6 text-center text-sm text-destructive">{{ error }}</p>

    <!-- Tableau -->
    <div v-else-if="filtrees.length" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th class="py-2 pr-4">Réf.</th>
            <th class="pr-4">Date</th>
            <th class="pr-4">Heure</th>
            <th class="pr-4">Statut</th>
            <th class="pr-4 text-right">Montant</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtrees" :key="r.id" class="border-t border-border">
            <td class="py-3 pr-4 font-mono text-xs text-muted-foreground">
              {{ r.id.slice(0, 8).toUpperCase() }}
            </td>
            <td class="pr-4 font-medium">{{ formatDate(r.dateService) }}</td>
            <td class="pr-4 text-muted-foreground">{{ formatHeure(r.heureService) }}</td>
            <td class="pr-4">
              <Badge :variant="badgeVariant(r.statut)">{{ STATUT_LABELS[r.statut] }}</Badge>
            </td>
            <td class="pr-4 text-right">
              {{ r.prixConvenu != null ? `${r.prixConvenu} TND` : "—" }}
            </td>
            <td class="space-x-2 text-right">
              <Button
                v-if="peutDiscuter(r)"
                variant="secondary"
                size="sm"
                @click="chatReservation = r"
              >
                Discuter
              </Button>
              <Button
                v-if="peutAnnuler(r)"
                variant="ghost"
                size="sm"
                class="text-destructive hover:text-destructive"
                :disabled="busyId === r.id"
                @click="annuler(r)"
              >
                {{ busyId === r.id ? "…" : "Annuler" }}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vide -->
    <div v-else class="py-12 text-center">
      <p class="text-muted-foreground">Aucune réservation{{ filtre ? " dans cette catégorie" : "" }}.</p>
      <RouterLink to="/services" class="mt-3 inline-block text-sm text-primary underline">
        Trouver un prestataire
      </RouterLink>
    </div>
  </PanelCard>

  <ChatModal
    v-if="chatReservation"
    :reservation="chatReservation"
    role="CLIENT"
    @close="chatReservation = null"
  />
</template>
