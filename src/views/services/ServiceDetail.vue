<script setup lang="ts">
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";
import SiteShell from "@/components/site/SiteShell.vue";
import { findService } from "@/lib/services-data";
import Button from "@/components/ui/Button.vue";
import { CheckCircle2, MapPin, ShieldCheck, Star, Clock } from "lucide-vue-next";

const route = useRoute();
const service = computed(() => findService(route.params.slug as string));

const pros = [
  { name: "Karim B.", rating: 4.9, jobs: 312, city: "Tunis", price: 45, eta: "30 min", verified: true },
  { name: "Salma T.", rating: 5.0, jobs: 187, city: "La Marsa", price: 40, eta: "45 min", verified: true },
  { name: "Mehdi K.", rating: 4.8, jobs: 421, city: "Ariana", price: 38, eta: "1h", verified: true },
];

const bullets = ["Devis transparent", "Paiement séquestre", "Garantie satisfaction", "Annulation gratuite"];
</script>

<template>
  <SiteShell>
    <template v-if="!service">
      <div class="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 class="font-display text-3xl font-bold">Service introuvable</h1>
        <p class="mt-2 text-muted-foreground">Cette catégorie n'existe pas ou plus.</p>
        <RouterLink to="/services" class="mt-6 inline-block text-primary underline">Voir tous les services</RouterLink>
      </div>
    </template>
    <template v-else>
      <section class="bg-gradient-hero py-16 text-primary-foreground">
        <div class="mx-auto max-w-7xl px-6">
          <RouterLink to="/services" class="text-sm text-white/70 hover:text-white">← Tous les services</RouterLink>
          <div class="mt-4 flex items-center gap-4">
            <div :class="`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${service.hue} text-secondary shadow-glow`">
              <component :is="service.icon" class="h-8 w-8" />
            </div>
            <div>
              <h1 class="font-display text-4xl font-bold sm:text-5xl">{{ service.name }}</h1>
              <p class="mt-1 text-white/80">{{ service.tagline }}</p>
            </div>
          </div>
          <div class="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><Star class="h-4 w-4 text-primary-glow" /> 4,9 (1 240 avis)</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><Clock class="h-4 w-4" /> {{ service.duration }} en moyenne</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><ShieldCheck class="h-4 w-4" /> Pros vérifiés</span>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 class="font-display text-2xl font-bold">Pros disponibles près de chez vous</h2>
          <div class="mt-6 space-y-4">
            <div v-for="p in pros" :key="p.name" class="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center">
              <div class="grid h-14 w-14 place-items-center rounded-full bg-gradient-warm font-display text-xl font-bold text-primary-foreground">
                {{ p.name[0] }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold">{{ p.name }}</h3>
                  <ShieldCheck v-if="p.verified" class="h-4 w-4 text-primary" />
                </div>
                <p class="text-sm text-muted-foreground">
                  <Star class="mr-1 inline h-3 w-3 fill-primary text-primary" />
                  {{ p.rating }} · {{ p.jobs }} missions · <MapPin class="mr-1 inline h-3 w-3" />{{ p.city }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-display text-lg font-bold">{{ p.price }} TND</p>
                <p class="text-xs text-muted-foreground">arrive en {{ p.eta }}</p>
              </div>
              <Button class="bg-gradient-warm text-primary-foreground">Réserver</Button>
            </div>
          </div>
        </div>

        <aside class="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p class="text-sm text-muted-foreground">À partir de</p>
          <p class="font-display text-4xl font-bold text-primary">{{ service.startingAt }} TND</p>
          <p class="text-sm text-muted-foreground">par intervention · {{ service.duration }}</p>
          <ul class="my-6 space-y-2 text-sm">
            <li v-for="b in bullets" :key="b" class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /> {{ b }}</li>
          </ul>
          <Button class="w-full bg-gradient-warm text-primary-foreground" size="lg">Demander un devis</Button>
          <Button variant="outline" class="mt-2 w-full" size="lg">Réserver maintenant</Button>
        </aside>
      </section>
    </template>
  </SiteShell>
</template>
