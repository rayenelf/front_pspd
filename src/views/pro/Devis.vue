<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const quotes = [
  { id: "DV-441", client: "Imane R.", service: "Rénovation SDB", amount: 4800, status: "Envoyé" },
  { id: "DV-438", client: "Tarek O.", service: "Installation cumulus", amount: 1900, status: "Accepté" },
  { id: "DV-431", client: "Houda L.", service: "Détection fuite", amount: 650, status: "En attente" },
  { id: "DV-420", client: "Karim B.", service: "Remplacement WC", amount: 1200, status: "Refusé" },
];

function variant(s: string) {
  if (s === "Accepté") return "default";
  if (s === "Refusé") return "destructive";
  return "secondary";
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-4">
      <StatCard label="Devis envoyés" value="38" hint="ce mois" />
      <StatCard label="Acceptés" value="22" hint="58% de conversion" />
      <StatCard label="En attente" value="9" />
      <StatCard label="Pipeline" value="14 800 MAD" />
    </div>
    <PanelCard title="Devis récents">
      <template #action>
        <Button size="sm" class="bg-gradient-warm text-primary-foreground">Nouveau devis</Button>
      </template>
      <div class="divide-y divide-border">
        <div v-for="q in quotes" :key="q.id" class="flex items-center justify-between py-3">
          <div>
            <p class="font-mono text-xs text-muted-foreground">{{ q.id }}</p>
            <p class="font-medium">{{ q.service }}</p>
            <p class="text-xs text-muted-foreground">{{ q.client }}</p>
          </div>
          <div class="flex items-center gap-4">
            <Badge :variant="variant(q.status)">{{ q.status }}</Badge>
            <span class="font-semibold">{{ q.amount }} MAD</span>
            <Button variant="ghost" size="sm">Voir</Button>
          </div>
        </div>
      </div>
    </PanelCard>
  </div>
</template>
