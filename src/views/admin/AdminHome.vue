<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";

const cats: [string, number, number][] = [
  ["Ménage", 38, 4200],
  ["Plomberie", 22, 2480],
  ["Électricité", 14, 1610],
  ["Jardinage", 12, 1340],
  ["Peinture", 8, 980],
  ["Autres", 6, 720],
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Utilisateurs" value="18 420" hint="+312 / 7j" />
      <StatCard label="Prestataires actifs" value="3 218" hint="+48 / 7j" />
      <StatCard label="Réservations / mois" value="12 408" hint="+18% MoM" />
      <StatCard label="GMV mensuelle" value="2.4M MAD" hint="Commission: 192k" />
    </div>
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <PanelCard title="Top catégories (30j)">
          <div class="space-y-3">
            <div v-for="[n, pct, count] in cats" :key="n">
              <div class="flex justify-between text-sm">
                <span class="font-medium">{{ n }}</span>
                <span class="text-muted-foreground">{{ count }} · {{ pct }}%</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div class="h-full bg-gradient-warm" :style="{ width: `${pct}%` }" />
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
      <PanelCard title="Alertes">
        <template #action><Badge variant="destructive">5</Badge></template>
        <ul class="space-y-2 text-sm">
          <li class="rounded-lg border border-border p-3">3 prestataires en attente de validation KYC</li>
          <li class="rounded-lg border border-border p-3">2 signalements clients ouverts</li>
          <li class="rounded-lg border border-border p-3">1 litige paiement en cours</li>
          <li class="rounded-lg border border-border p-3">Quota SMS Twilio à 85%</li>
        </ul>
      </PanelCard>
    </div>
  </div>
</template>
