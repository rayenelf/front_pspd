<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import { cn } from "@/lib/utils";

const events: Record<number, { time: string; title: string }[]> = {
  3: [{ time: "09h", title: "Plomberie - Imane R." }],
  7: [{ time: "11h", title: "Chauffe-eau - Nadia M." }],
  12: [{ time: "14h", title: "Fuite - Karim B." }],
  14: [{ time: "10h", title: "Installation - Tarek O." }, { time: "16h", title: "Devis - Houda L." }],
  20: [{ time: "09h", title: "Maintenance - Imane R." }],
  25: [{ time: "13h", title: "Robinetterie - Salma B." }],
};

const days = Array.from({ length: 30 }, (_, i) => i + 1);
const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
</script>

<template>
  <PanelCard title="Juin 2026">
    <div class="grid grid-cols-7 gap-2 text-xs">
      <div v-for="d in weekDays" :key="d" class="py-2 text-center font-semibold text-muted-foreground">{{ d }}</div>
      <div
        v-for="d in days"
        :key="d"
        :class="cn('min-h-24 rounded-lg border border-border p-2', events[d] && 'bg-primary/5 border-primary/30')"
      >
        <div class="text-xs font-semibold">{{ d }}</div>
        <div class="mt-1 space-y-1">
          <div v-for="e in events[d] || []" :key="e.title" class="truncate rounded bg-gradient-warm px-1.5 py-0.5 text-[10px] text-primary-foreground">
            {{ e.time }} {{ e.title }}
          </div>
        </div>
      </div>
    </div>
  </PanelCard>
</template>
