<script setup lang="ts">
import { RouterLink } from "vue-router";
import { services } from "@/lib/services-data";
import { ArrowUpRight } from "lucide-vue-next";

const items = services.slice(0, 8);
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="text-sm font-semibold uppercase tracking-widest text-primary">{{ $t("home.categories.eyebrow") }}</p>
        <h2 class="mt-2 font-display text-3xl font-bold sm:text-4xl">{{ $t("home.categories.title") }}</h2>
      </div>
      <RouterLink to="/services" class="group inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary">
        {{ $t("home.categories.seeAll") }}
        <ArrowUpRight class="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </RouterLink>
    </div>

    <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <RouterLink
        v-for="s in items"
        :key="s.slug"
        :to="`/services/${s.slug}`"
        class="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-soft"
      >
        <div :class="`mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${s.hue} text-secondary`">
          <component :is="s.icon" class="h-6 w-6" />
        </div>
        <h3 class="font-display text-lg font-semibold">{{ $t(`services.${s.slug}.name`) }}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{{ $t(`services.${s.slug}.tagline`) }}</p>
        <p class="mt-4 text-xs text-muted-foreground">
          {{ $t("home.categories.from") }} <b class="text-foreground">{{ s.startingAt }} TND</b> · {{ s.duration }}
        </p>
      </RouterLink>
    </div>
  </section>
</template>
