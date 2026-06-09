<script setup lang="ts">
import { RouterLink } from "vue-router";
import { MapPin } from "lucide-vue-next";

defineProps<{ title: string; subtitle: string }>();
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <div class="relative hidden overflow-hidden bg-gradient-warm lg:block">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      <div class="relative flex h-full flex-col justify-between p-10 text-primary-foreground">
        <RouterLink to="/" class="flex items-center gap-2 font-display text-2xl font-bold">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-white/20 backdrop-blur">
            <MapPin class="h-5 w-5" />
          </span>
          Domivo
        </RouterLink>
        <div class="space-y-4">
          <p class="font-display text-3xl font-bold leading-tight">
            Tous les services de la maison. <br />Réservés en confiance.
          </p>
          <p class="max-w-md text-primary-foreground/80">
            Plus de 3 200 prestataires vérifiés, paiement sécurisé en séquestre, garantie satisfaction.
          </p>
        </div>
        <div class="flex gap-6 text-sm text-primary-foreground/80">
          <div><p class="font-display text-2xl font-bold text-primary-foreground">4.9/5</p>Note moyenne</div>
          <div><p class="font-display text-2xl font-bold text-primary-foreground">24/7</p>Support</div>
          <div><p class="font-display text-2xl font-bold text-primary-foreground">12k+</p>Réservations</div>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center bg-background px-6 py-10 sm:px-10">
      <div class="w-full max-w-md">
        <RouterLink to="/" class="mb-8 inline-flex items-center gap-2 font-display text-xl font-bold lg:hidden">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-warm text-primary-foreground">
            <MapPin class="h-4 w-4" />
          </span>
          Domivo
        </RouterLink>
        <h1 class="font-display text-3xl font-bold">{{ title }}</h1>
        <p class="mt-2 text-sm text-muted-foreground">{{ subtitle }}</p>
        <div class="mt-8"><slot /></div>
        <div v-if="$slots.footer" class="mt-6 text-center text-sm text-muted-foreground"><slot name="footer" /></div>
      </div>
    </div>
  </div>
</template>
