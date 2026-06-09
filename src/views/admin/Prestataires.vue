<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const pending = [
  { name: "Anas L.", job: "Électricien", city: "Rabat", docs: "3/4" },
  { name: "Sofia M.", job: "Femme de ménage", city: "Casablanca", docs: "4/4" },
  { name: "Rachid B.", job: "Jardinier", city: "Marrakech", docs: "2/4" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-4">
      <StatCard label="Prestataires" value="3 218" />
      <StatCard label="En attente" value="12" hint="Validation KYC" />
      <StatCard label="Top performers" value="84" hint="Note > 4.8" />
      <StatCard label="Suspendus" value="6" />
    </div>
    <PanelCard title="Validations en attente">
      <div class="divide-y divide-border">
        <div v-for="p in pending" :key="p.name" class="flex items-center justify-between py-3">
          <div>
            <p class="font-medium">{{ p.name }} <span class="text-muted-foreground">· {{ p.job }}</span></p>
            <p class="text-xs text-muted-foreground">{{ p.city }} · documents {{ p.docs }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary">KYC</Badge>
            <Button size="sm" variant="outline">Examiner</Button>
            <Button size="sm" class="bg-gradient-warm text-primary-foreground">Valider</Button>
          </div>
        </div>
      </div>
    </PanelCard>
  </div>
</template>
