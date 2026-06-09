<script setup lang="ts">
defineProps<{ title: string }>();
</script>

<template>
  <section class="rounded-xl border border-border bg-background">
    <header class="flex items-center justify-between border-b border-border px-5 py-3">
      <h2 class="font-display text-sm font-semibold">{{ title }}</h2>
      <slot name="action" />
    </header>
    <div class="p-5"><slot /></div>
  </section>
</template>
