<script setup lang="ts">
import { Star } from "lucide-vue-next";

// name/city restent tels quels (noms propres) ; `textKey` et `serviceSlug`
// sont résolus via i18n.
const items = [
  { name: "Salma B.", city: "La Marsa", rating: 5, textKey: "t1", serviceSlug: "plomberie" },
  { name: "Mehdi K.", city: "Sfax", rating: 5, textKey: "t2", serviceSlug: "menage" },
  { name: "Inès T.", city: "Tunis", rating: 5, textKey: "t3", serviceSlug: "soutien-scolaire" },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20">
    <div class="mx-auto max-w-2xl text-center">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">{{ $t("home.testimonials.eyebrow") }}</p>
      <h2 class="mt-2 font-display text-3xl font-bold sm:text-4xl">{{ $t("home.testimonials.title") }}</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      <figure v-for="t in items" :key="t.name" class="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div class="flex gap-0.5 text-primary">
          <Star v-for="i in t.rating" :key="i" class="h-4 w-4 fill-current" />
        </div>
        <blockquote class="mt-3 text-base text-foreground">"{{ $t(`home.testimonials.items.${t.textKey}.text`) }}"</blockquote>
        <figcaption class="mt-5 flex items-center justify-between text-sm">
          <div>
            <p class="font-semibold">{{ t.name }}</p>
            <p class="text-muted-foreground">{{ t.city }}</p>
          </div>
          <span class="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{{ $t(`services.${t.serviceSlug}.name`) }}</span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
