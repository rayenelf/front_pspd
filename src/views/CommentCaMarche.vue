<script setup lang="ts">
import SiteShell from "@/components/site/SiteShell.vue";
import HowItWorks from "@/components/site/HowItWorks.vue";
import { ShieldCheck, Wallet, MessageCircle, Star } from "lucide-vue-next";

const trust = [
  { icon: ShieldCheck, title: "Pros vérifiés", desc: "Pièces d'identité, patente, assurance et avis contrôlés." },
  { icon: Wallet, title: "Paiement séquestre", desc: "Votre argent n'est libéré qu'après validation de la mission." },
  { icon: MessageCircle, title: "Messagerie intégrée", desc: "Échangez photos et instructions sans partager votre numéro." },
  { icon: Star, title: "Avis transparents", desc: "Chaque mission est notée sur la qualité, la ponctualité et le prix." },
];
</script>

<template>
  <SiteShell>
    <section class="bg-gradient-hero py-20 text-primary-foreground">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary-glow">Notre fonctionnement</p>
        <h1 class="mt-3 font-display text-4xl font-bold sm:text-5xl">Simple. Sûr. Transparent.</h1>
        <p class="mt-4 text-white/80">Domivo a été pensé pour que chaque mission soit une bonne expérience — pour vous, et pour le pro.</p>
      </div>
    </section>
    <HowItWorks />
    <section class="mx-auto max-w-7xl px-6 py-20">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="t in trust" :key="t.title" class="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div class="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
            <component :is="t.icon" class="h-6 w-6" />
          </div>
          <h3 class="mt-4 font-display text-lg font-semibold">{{ t.title }}</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ t.desc }}</p>
        </div>
      </div>
    </section>
  </SiteShell>
</template>
