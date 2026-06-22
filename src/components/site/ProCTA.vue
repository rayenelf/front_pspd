<script setup lang="ts">
import { RouterLink } from "vue-router";
import Button from "@/components/ui/Button.vue";
import { CheckCircle2 } from "lucide-vue-next";
import img from "@/assets/pro-electrician.jpg";

// Clés i18n sous home.proCta.bullets.<key>
const bulletKeys = ["missions", "agenda", "payment"];
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-20">
    <div class="overflow-hidden rounded-3xl bg-secondary text-secondary-foreground shadow-soft">
      <div class="grid lg:grid-cols-2">
        <div class="p-10 lg:p-14">
          <p class="text-sm font-semibold uppercase tracking-widest text-primary-glow">{{ $t("home.proCta.eyebrow") }}</p>
          <h2 class="mt-2 font-display text-3xl font-bold sm:text-4xl">
            {{ $t("home.proCta.title") }}
          </h2>
          <p class="mt-4 text-secondary-foreground/80">
            {{ $t("home.proCta.subtitle") }}
          </p>
          <ul class="mt-6 space-y-3">
            <li v-for="k in bulletKeys" :key="k" class="flex items-center gap-2 text-sm">
              <CheckCircle2 class="h-5 w-5 text-primary-glow" />
              {{ $t(`home.proCta.bullets.${k}`) }}
            </li>
          </ul>
          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink to="/devenir-prestataire">
              <Button size="lg" class="bg-gradient-warm text-primary-foreground hover:opacity-95">
                {{ $t("nav.becomePro") }}
              </Button>
            </RouterLink>
            <RouterLink to="/comment-ca-marche">
              <Button size="lg" variant="outline" class="border-white/20 bg-transparent text-secondary-foreground hover:bg-white/10">
                {{ $t("common.learnMore") }}
              </Button>
            </RouterLink>
          </div>
        </div>
        <div class="relative min-h-72 lg:min-h-0">
          <img :src="img" alt="Pro Domivo" class="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/10 to-transparent" />
        </div>
      </div>
    </div>
  </section>
</template>
