<script setup lang="ts">
const stats = [
  { value: "28k+", label: "Clients servis" },
  { value: "2 400", label: "Pros vérifiés" },
  { value: "4,9/5", label: "Note moyenne" },
  { value: "< 30 min", label: "Temps de réponse" },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16">
    <div class="grid divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
      <div v-for="s in stats" :key="s.label" class="px-6 py-8 text-center">
        <p class="font-display text-4xl font-bold text-primary">{{ s.value }}</p>
        <p class="mt-1 text-sm text-muted-foreground">{{ s.label }}</p>
      </div>
    </div>
  </section>
</template>
