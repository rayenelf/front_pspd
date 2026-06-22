<script setup lang="ts">
import { RouterLink } from "vue-router";
import { MapPin, Instagram, Facebook, Twitter } from "lucide-vue-next";

// Chaque colonne résout son titre + ses libellés via i18n.
// `services` réutilise les noms de catégories (services.<slug>.name).
const cols = [
  {
    titleKey: "footer.cols.services",
    links: ["services.menage.name", "services.plomberie.name", "services.electricite.name", "services.jardinage.name", "services.bricolage.name", "services.demenagement.name"],
  },
  {
    titleKey: "footer.cols.company",
    links: ["footer.company.about", "footer.company.careers", "footer.company.press", "footer.company.blog"],
  },
  {
    titleKey: "footer.cols.help",
    links: ["footer.help.center", "footer.help.contact", "footer.help.terms", "footer.help.privacy"],
  },
];

const socials = [Instagram, Facebook, Twitter];
const year = new Date().getFullYear();
</script>

<template>
  <footer class="mt-24 border-t border-border bg-secondary text-secondary-foreground">
    <div class="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-4">
      <div>
        <RouterLink to="/" class="flex items-center gap-2 font-display text-xl font-bold">
          <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-warm">
            <MapPin class="h-4 w-4" />
          </span>
          Domivo
        </RouterLink>
        <p class="mt-4 max-w-xs text-sm text-secondary-foreground/70">
          {{ $t("footer.tagline") }}
        </p>
        <div class="mt-6 flex gap-3">
          <a v-for="(Icon, i) in socials" :key="i" href="#" class="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-primary">
            <component :is="Icon" class="h-4 w-4" />
          </a>
        </div>
      </div>
      <div v-for="col in cols" :key="col.titleKey">
        <h4 class="font-display text-sm font-semibold uppercase tracking-wider text-secondary-foreground/80">{{ $t(col.titleKey) }}</h4>
        <ul class="mt-4 space-y-2 text-sm text-secondary-foreground/70">
          <li v-for="l in col.links" :key="l">
            <a href="#" class="transition hover:text-primary">{{ $t(l) }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-secondary-foreground/60 sm:flex-row">
        <p>{{ $t("footer.rights", { year }) }}</p>
        <p>{{ $t("footer.crafted") }}</p>
      </div>
    </div>
  </footer>
</template>
