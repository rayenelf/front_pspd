<script setup lang="ts">
// `labelKey` → résolu via $t dans le template.
const stats = [
  { value: "28k+", labelKey: "home.stats.clientsServed" },
  { value: "2 400", labelKey: "home.stats.prosVerified" },
  { value: "4,9/5", labelKey: "home.stats.avgRating" },
  { value: "< 30 min", labelKey: "home.stats.responseTime" },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-16">
    <div class="grid divide-y divide-border overflow-hidden rounded-3xl border border-border bg-card sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
      <div v-for="s in stats" :key="s.labelKey" class="px-6 py-8 text-center">
        <p class="font-display text-4xl font-bold text-primary">{{ s.value }}</p>
        <p class="mt-1 text-sm text-muted-foreground">{{ $t(s.labelKey) }}</p>
      </div>
    </div>
  </section>
</template>
