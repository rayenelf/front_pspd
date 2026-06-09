<script setup lang="ts">
import { RouterLink } from "vue-router";
import SiteShell from "@/components/site/SiteShell.vue";
import { services } from "@/lib/services-data";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import { MapPin, Search, SlidersHorizontal, Star } from "lucide-vue-next";
</script>

<template>
  <SiteShell>
    <section class="bg-gradient-hero py-14 text-primary-foreground">
      <div class="mx-auto max-w-7xl px-6">
        <h1 class="font-display text-4xl font-bold sm:text-5xl">Tous nos services</h1>
        <p class="mt-3 max-w-xl text-white/80">Filtrez par besoin, ville ou disponibilité.</p>

        <div class="mt-8 grid gap-2 rounded-2xl bg-white p-2 text-foreground shadow-glow sm:grid-cols-[1fr_1fr_auto_auto]">
          <label class="flex items-center gap-2 px-3">
            <Search class="h-4 w-4 text-muted-foreground" />
            <Input class="border-0 shadow-none focus-visible:ring-0" placeholder="Service ou mot-clé" />
          </label>
          <label class="flex items-center gap-2 px-3 sm:border-l sm:border-border">
            <MapPin class="h-4 w-4 text-muted-foreground" />
            <Input class="border-0 shadow-none focus-visible:ring-0" placeholder="Ville" default-value="Tunis" />
          </label>
          <Button variant="outline" class="gap-2">
            <SlidersHorizontal class="h-4 w-4" /> Filtres
          </Button>
          <Button class="bg-gradient-warm text-primary-foreground">Rechercher</Button>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="s in services"
          :key="s.slug"
          :to="`/services/${s.slug}`"
          class="group flex gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-soft"
        >
          <div :class="`grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.hue} text-secondary`">
            <component :is="s.icon" class="h-7 w-7" />
          </div>
          <div class="flex-1">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-display text-lg font-semibold">{{ s.name }}</h3>
              <span class="flex items-center gap-1 text-xs text-muted-foreground">
                <Star class="h-3 w-3 fill-primary text-primary" /> 4,9
              </span>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">{{ s.tagline }}</p>
            <p class="mt-3 text-sm">
              dès <b>{{ s.startingAt }} TND</b> · {{ s.duration }}
            </p>
          </div>
        </RouterLink>
      </div>
    </section>
  </SiteShell>
</template>
