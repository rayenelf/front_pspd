<script setup lang="ts">
import { RouterLink } from "vue-router";
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";

const bookings = [
  { pro: "Karim B.", service: "Ménage complet", date: "Jeu. 12 juin, 09h", status: "Confirmé", price: "350 MAD" },
  { pro: "Salma T.", service: "Plomberie - fuite", date: "Sam. 14 juin, 14h", status: "En attente", price: "Devis" },
  { pro: "Youssef R.", service: "Électricité", date: "Mar. 17 juin, 11h", status: "Confirmé", price: "480 MAD" },
];

const suggestions = ["Grand nettoyage de printemps", "Entretien climatisation", "Tonte de pelouse", "Peinture chambre"];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Réservations actives" value="3" hint="2 confirmées · 1 en attente" />
      <StatCard label="Dépensé ce mois" value="1 240 MAD" hint="+12% vs mois précédent" />
      <StatCard label="Prestataires favoris" value="7" />
      <StatCard label="Avis donnés" value="14" hint="Note moy. donnée: 4.8/5" />
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <PanelCard title="Prochaines réservations">
          <template #action>
            <RouterLink to="/client/reservations"><Button variant="ghost" size="sm">Tout voir</Button></RouterLink>
          </template>
          <div class="space-y-3">
            <div v-for="b in bookings" :key="b.service" class="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p class="font-semibold">{{ b.service }}</p>
                <p class="text-xs text-muted-foreground">{{ b.pro }} · {{ b.date }}</p>
              </div>
              <div class="text-right">
                <Badge :variant="b.status === 'Confirmé' ? 'default' : 'secondary'">{{ b.status }}</Badge>
                <p class="mt-1 text-sm font-semibold">{{ b.price }}</p>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
      <PanelCard title="Suggestions pour vous">
        <ul class="space-y-3 text-sm">
          <li v-for="s in suggestions" :key="s" class="flex items-center justify-between rounded-lg border border-border p-3">
            <span>{{ s }}</span><Button size="sm" variant="ghost">Réserver</Button>
          </li>
        </ul>
      </PanelCard>
    </div>
  </div>
</template>
