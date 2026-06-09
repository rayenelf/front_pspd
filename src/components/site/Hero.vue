<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Search, MapPin, Star, ShieldCheck } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import heroImg from "@/assets/hero-pro.jpg";

const avatars = ["#fda4af", "#fcd34d", "#86efac"];
const query = ref("");
const city = ref("Tunis");
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-hero text-primary-foreground">
    <div aria-hidden class="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-float" />
    <div aria-hidden class="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary-glow/20 blur-3xl" />

    <div class="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
      <div class="relative z-10 animate-fade-up">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur">
          <ShieldCheck class="h-3.5 w-3.5 text-primary-glow" />
          +2 400 pros vérifiés près de chez vous
        </span>
        <h1 class="mt-6 font-display text-5xl font-bold leading-[1.05] text-balance sm:text-6xl lg:text-7xl">
          Un pro à domicile,
          <span class="block bg-gradient-to-r from-[oklch(0.85_0.16_60)] to-[oklch(0.92_0.12_85)] bg-clip-text text-transparent">
            en quelques clics.
          </span>
        </h1>
        <p class="mt-6 max-w-lg text-lg text-white/80">
          Ménage, plomberie, électricité, jardinage… Réservez le bon prestataire, au bon prix, près de chez vous.
        </p>

        <div class="mt-8 rounded-2xl bg-white p-2 shadow-glow">
          <div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <label class="flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-transparent transition focus-within:ring-primary">
              <Search class="h-4 w-4 text-muted-foreground" />
              <Input v-model="query" class="border-0 p-0 text-foreground shadow-none focus-visible:ring-0" placeholder="Quel service ?" />
            </label>
            <label class="flex items-center gap-2 rounded-xl px-3 py-2 ring-1 ring-transparent transition focus-within:ring-primary sm:border-l sm:border-border">
              <MapPin class="h-4 w-4 text-muted-foreground" />
              <Input v-model="city" class="border-0 p-0 text-foreground shadow-none focus-visible:ring-0" placeholder="Votre ville" />
            </label>
            <RouterLink to="/services">
              <Button size="lg" class="bg-gradient-warm font-semibold text-primary-foreground hover:opacity-95 w-full">
                Rechercher
              </Button>
            </RouterLink>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap items-center gap-6 text-sm text-white/70">
          <div class="flex items-center gap-1.5">
            <div class="flex -space-x-2">
              <span v-for="c in avatars" :key="c" class="h-7 w-7 rounded-full border-2 border-secondary" :style="{ background: c }" />
            </div>
            <span><b class="text-white">28 000+</b> clients satisfaits</span>
          </div>
          <div class="flex items-center gap-1.5">
            <Star class="h-4 w-4 fill-primary-glow text-primary-glow" />
            <span><b class="text-white">4,9/5</b> en moyenne</span>
          </div>
        </div>
      </div>

      <div class="relative">
        <div class="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-glow ring-1 ring-white/10">
          <img :src="heroImg" alt="Professionnel à domicile au travail" class="h-full w-full object-cover" width="1080" height="1350" />
          <div class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          <div class="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl bg-white/95 p-3 text-foreground shadow-soft backdrop-blur">
            <div class="grid h-10 w-10 place-items-center rounded-full bg-gradient-warm text-primary-foreground font-bold">K</div>
            <div class="flex-1">
              <p class="text-sm font-semibold">Karim · Plombier certifié</p>
              <p class="text-xs text-muted-foreground">Arrive dans 25 min · 4,9 ★</p>
            </div>
            <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">En route</span>
          </div>
        </div>
        <div class="absolute -left-6 top-10 hidden rounded-2xl bg-white p-4 text-foreground shadow-soft lg:flex animate-float">
          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheck class="h-5 w-5" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Paiement séquestre</p>
              <p class="text-sm font-semibold">100% sécurisé</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
