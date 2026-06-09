<script setup lang="ts">
defineProps<{ label: string; value: string; hint?: string }>();
</script>

<template>
  <div class="rounded-xl border border-border bg-background p-5">
    <p class="text-xs uppercase tracking-wider text-muted-foreground">{{ label }}</p>
    <p class="mt-2 font-display text-2xl font-bold">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>
