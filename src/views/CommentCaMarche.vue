<script setup lang="ts">
import SiteShell from "@/components/site/SiteShell.vue";
import HowItWorks from "@/components/site/HowItWorks.vue";
import { ShieldCheck, Wallet, MessageCircle, Star } from "lucide-vue-next";

// `key` → clés i18n sous pages.how.trust.<key>.{title,desc}
const trust = [
  { icon: ShieldCheck, key: "verified" },
  { icon: Wallet, key: "escrow" },
  { icon: MessageCircle, key: "chat" },
  { icon: Star, key: "reviews" },
];
</script>

<template>
  <SiteShell>
    <section class="bg-gradient-hero py-20 text-primary-foreground">
      <div class="mx-auto max-w-3xl px-6 text-center">
        <p class="text-sm font-semibold uppercase tracking-widest text-primary-glow">{{ $t("pages.how.eyebrow") }}</p>
        <h1 class="mt-3 font-display text-4xl font-bold sm:text-5xl">{{ $t("pages.how.title") }}</h1>
        <p class="mt-4 text-white/80">{{ $t("pages.how.subtitle") }}</p>
      </div>
    </section>
    <HowItWorks />
    <section class="mx-auto max-w-7xl px-6 py-20">
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="t in trust" :key="t.key" class="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div class="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground">
            <component :is="t.icon" class="h-6 w-6" />
          </div>
          <h3 class="mt-4 font-display text-lg font-semibold">{{ $t(`pages.how.trust.${t.key}.title`) }}</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ $t(`pages.how.trust.${t.key}.desc`) }}</p>
        </div>
      </div>
    </section>
  </SiteShell>
</template>
