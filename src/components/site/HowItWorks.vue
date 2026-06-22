<script setup lang="ts">
import { Search, CalendarCheck, Sparkles } from "lucide-vue-next";

// `key` → clés i18n home.how.steps.<key>.{title,desc}
const steps = [
  { icon: Search, key: "choose" },
  { icon: CalendarCheck, key: "book" },
  { icon: Sparkles, key: "enjoy" },
];
</script>

<template>
  <section class="bg-accent/40 py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mx-auto max-w-2xl text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary">{{ $t("home.how.eyebrow") }}</p>
        <h2 class="mt-2 font-display text-3xl font-bold sm:text-4xl">{{ $t("home.how.title") }}</h2>
      </div>
      <ol class="mt-12 grid gap-6 md:grid-cols-3">
        <li v-for="(s, i) in steps" :key="s.key" class="relative rounded-2xl border border-border bg-card p-7 shadow-soft">
          <span class="absolute -top-3 left-7 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            {{ $t("home.how.step") }} {{ i + 1 }}
          </span>
          <div class="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-warm text-primary-foreground shadow-glow">
            <component :is="s.icon" class="h-6 w-6" />
          </div>
          <h3 class="font-display text-xl font-semibold">{{ $t(`home.how.steps.${s.key}.title`) }}</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ $t(`home.how.steps.${s.key}.desc`) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>
