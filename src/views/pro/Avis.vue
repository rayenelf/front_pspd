<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import { Star } from "lucide-vue-next";

const reviews = [
  { client: "Imane R.", rating: 5, text: "Très ponctuel et propre, je recommande vivement !", date: "12 juin" },
  { client: "Karim B.", rating: 5, text: "Travail impeccable, prix juste.", date: "08 juin" },
  { client: "Nadia M.", rating: 4, text: "Bonne prestation, juste un peu en retard.", date: "02 juin" },
  { client: "Tarek O.", rating: 5, text: "Parfait, intervention rapide un dimanche.", date: "28 mai" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard label="Note moyenne" value="4.9 / 5" hint="142 avis" />
      <StatCard label="5 étoiles" value="87%" />
      <StatCard label="Taux de réponse" value="100%" />
    </div>
    <PanelCard title="Derniers avis">
      <div class="space-y-4">
        <div v-for="(r, i) in reviews" :key="i" class="rounded-lg border border-border p-4">
          <div class="flex items-center justify-between">
            <p class="font-semibold">{{ r.client }}</p>
            <span class="text-xs text-muted-foreground">{{ r.date }}</span>
          </div>
          <div class="mt-1 flex gap-0.5">
            <Star
              v-for="k in 5"
              :key="k"
              :class="(k - 1) < r.rating ? 'h-3.5 w-3.5 fill-primary text-primary' : 'h-3.5 w-3.5 text-muted-foreground'"
            />
          </div>
          <p class="mt-2 text-sm text-muted-foreground">{{ r.text }}</p>
        </div>
      </div>
    </PanelCard>
  </div>
</template>
