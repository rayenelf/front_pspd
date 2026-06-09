<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"];
const revenue = [3200, 4100, 3850, 5200, 6100, 7400];
const max = Math.max(...revenue);

const demands = [
  { c: "Imane R.", s: "Plomberie - WC", t: "il y a 12 min" },
  { c: "Karim B.", s: "Robinetterie", t: "il y a 1 h" },
  { c: "Nadia M.", s: "Chauffe-eau", t: "il y a 3 h" },
  { c: "Tarek O.", s: "Fuite cuisine", t: "hier" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Revenus du mois" value="7 400 MAD" hint="+21% vs mai" />
      <StatCard label="Missions terminées" value="28" hint="ce mois" />
      <StatCard label="Note moyenne" value="4.9 ★" hint="basée sur 142 avis" />
      <StatCard label="Taux d'acceptation" value="92%" />
    </div>
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <PanelCard title="Revenus des 6 derniers mois">
          <div class="flex h-48 items-end gap-3">
            <div v-for="(v, i) in revenue" :key="i" class="flex flex-1 flex-col items-center gap-2">
              <div class="flex w-full flex-1 items-end">
                <div class="w-full rounded-t-md bg-gradient-warm" :style="{ height: `${(v / max) * 100}%` }" />
              </div>
              <span class="text-xs text-muted-foreground">{{ months[i] }}</span>
            </div>
          </div>
        </PanelCard>
      </div>
      <PanelCard title="Demandes en attente">
        <template #action><Badge variant="secondary">4 nouvelles</Badge></template>
        <ul class="space-y-3 text-sm">
          <li v-for="d in demands" :key="d.c" class="rounded-lg border border-border p-3">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ d.c }}</span>
              <span class="text-xs text-muted-foreground">{{ d.t }}</span>
            </div>
            <p class="text-xs text-muted-foreground">{{ d.s }}</p>
            <div class="mt-2 flex gap-2">
              <Button size="sm" class="h-7 flex-1 bg-gradient-warm text-primary-foreground">Accepter</Button>
              <Button size="sm" variant="outline" class="h-7 flex-1">Décliner</Button>
            </div>
          </li>
        </ul>
      </PanelCard>
    </div>
  </div>
</template>
