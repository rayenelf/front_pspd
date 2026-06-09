<script setup lang="ts">
import { Star } from "lucide-vue-next";

const items = [
  { name: "Salma B.", city: "La Marsa", rating: 5, text: "J'ai réservé un plombier à 21h, il était là à 21h25. Devis clair, travail nickel.", service: "Plomberie" },
  { name: "Mehdi K.", city: "Sfax", rating: 5, text: "Le ménage hebdo a changé ma vie. Toujours la même équipe, super sympas.", service: "Ménage" },
  { name: "Inès T.", city: "Tunis", rating: 5, text: "Soutien scolaire pour ma fille — résultats visibles en 2 mois. Bravo Domivo.", service: "Soutien scolaire" },
];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20">
    <div class="mx-auto max-w-2xl text-center">
      <p class="text-sm font-semibold uppercase tracking-widest text-primary">Témoignages</p>
      <h2 class="mt-2 font-display text-3xl font-bold sm:text-4xl">Ils ne jurent plus que par Domivo</h2>
    </div>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      <figure v-for="t in items" :key="t.name" class="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div class="flex gap-0.5 text-primary">
          <Star v-for="i in t.rating" :key="i" class="h-4 w-4 fill-current" />
        </div>
        <blockquote class="mt-3 text-base text-foreground">"{{ t.text }}"</blockquote>
        <figcaption class="mt-5 flex items-center justify-between text-sm">
          <div>
            <p class="font-semibold">{{ t.name }}</p>
            <p class="text-muted-foreground">{{ t.city }}</p>
          </div>
          <span class="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{{ t.service }}</span>
        </figcaption>
      </figure>
    </div>
  </section>
</template>
