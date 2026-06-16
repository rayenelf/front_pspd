<script setup lang="ts">
import { onMounted, ref } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import { reservationApi } from "@/lib/reservationApi";
import { STATUT_LABELS, type Reservation, type StatutReservation } from "@/lib/reservation";

const missions = ref<Reservation[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const busyId = ref<string | null>(null);

function badgeVariant(s: StatutReservation): "default" | "secondary" | "destructive" {
  if (s === "ANNULEE" || s === "REFUSEE" || s === "EN_LITIGE") return "destructive";
  if (s === "TERMINEE") return "secondary";
  return "default";
}

async function charger() {
  loading.value = true;
  error.value = null;
  try {
    missions.value = await reservationApi.mesMissions();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

// Exécute une transition puis recharge la liste ; remonte l'erreur 422 éventuelle.
async function action(id: string, fn: (id: string) => Promise<Reservation>) {
  busyId.value = id;
  error.value = null;
  try {
    await fn(id);
    await charger();
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busyId.value = null;
  }
}

onMounted(charger);
</script>

<template>
  <PanelCard title="Mes missions">
    <p v-if="error" class="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {{ error }}
    </p>

    <p v-if="loading" class="py-6 text-center text-sm text-muted-foreground">Chargement…</p>

    <p v-else-if="missions.length === 0" class="py-6 text-center text-sm text-muted-foreground">
      Aucune mission pour le moment.
    </p>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th class="py-2">Réf.</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Statut</th>
            <th class="text-right">Montant</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in missions" :key="m.id" class="border-t border-border">
            <td class="py-3 font-mono text-xs">{{ m.id.slice(0, 8) }}</td>
            <td>{{ m.dateService }}</td>
            <td class="text-muted-foreground">{{ m.heureService?.slice(0, 5) }}</td>
            <td><Badge :variant="badgeVariant(m.statut)">{{ STATUT_LABELS[m.statut] }}</Badge></td>
            <td class="text-right">{{ m.prixConvenu != null ? `${m.prixConvenu} TND` : "—" }}</td>
            <td class="space-x-2 text-right">
              <template v-if="m.statut === 'EN_ATTENTE'">
                <Button size="sm" :disabled="busyId === m.id"
                        @click="action(m.id, reservationApi.accepter)">Accepter</Button>
                <Button size="sm" variant="destructive" :disabled="busyId === m.id"
                        @click="action(m.id, reservationApi.refuser)">Refuser</Button>
              </template>
              <Button v-else-if="m.statut === 'ACCEPTEE'" size="sm" :disabled="busyId === m.id"
                      @click="action(m.id, reservationApi.demarrer)">Démarrer</Button>
              <Button v-else-if="m.statut === 'EN_COURS'" size="sm" :disabled="busyId === m.id"
                      @click="action(m.id, reservationApi.terminer)">Terminer</Button>
              <span v-else class="text-xs text-muted-foreground">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelCard>
</template>
