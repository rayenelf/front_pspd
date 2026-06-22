<script setup lang="ts">
import SiteShell from "@/components/site/SiteShell.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { CheckCircle2, TrendingUp, Calendar, Wallet } from "lucide-vue-next";
import cleaner from "@/assets/pro-cleaner.jpg";
import gardener from "@/assets/pro-gardener.jpg";

// `key` → pages.becomePro.perk<Key>.{title,desc}
const perks = [
  { icon: TrendingUp, key: "perkMissions" },
  { icon: Calendar, key: "perkAgenda" },
  { icon: Wallet, key: "perkPayments" },
];

const checks = ["checkFree", "checkNoCommit", "checkCommission"];

// `labelKey` → pages.becomePro.<labelKey>
const fields = [
  { labelKey: "fNomCommercial", placeholder: "Ex. Atelier Karim" },
  { labelKey: "fCategory", placeholder: "Plomberie" },
  { labelKey: "fPhone", placeholder: "+216 …" },
  { labelKey: "fEmail", placeholder: "vous@email.com", type: "email" },
  { labelKey: "fCity", placeholder: "Tunis" },
  { labelKey: "fZone", placeholder: "10 km" },
];
</script>

<template>
  <SiteShell>
    <section class="relative overflow-hidden bg-gradient-hero py-20 text-primary-foreground">
      <div class="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p class="text-sm font-semibold uppercase tracking-widest text-primary-glow">{{ $t("pages.becomePro.eyebrow") }}</p>
          <h1 class="mt-3 font-display text-4xl font-bold sm:text-6xl">
            {{ $t("pages.becomePro.title") }}
          </h1>
          <p class="mt-4 max-w-lg text-white/80">
            {{ $t("pages.becomePro.subtitle") }}
          </p>
          <ul class="mt-6 space-y-2 text-sm">
            <li v-for="b in checks" :key="b" class="flex items-center gap-2">
              <CheckCircle2 class="h-4 w-4 text-primary-glow" /> {{ $t(`pages.becomePro.${b}`) }}
            </li>
          </ul>
        </div>

        <form class="rounded-3xl bg-white p-6 text-foreground shadow-glow" @submit.prevent>
          <h2 class="font-display text-xl font-semibold">{{ $t("pages.becomePro.formTitle") }}</h2>
          <p class="mt-1 text-sm text-muted-foreground">{{ $t("pages.becomePro.formSubtitle") }}</p>
          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <div v-for="f in fields" :key="f.labelKey">
              <Label class="mb-1.5 block text-xs font-medium">{{ $t(`pages.becomePro.${f.labelKey}`) }}</Label>
              <Input :type="f.type" :placeholder="f.placeholder" />
            </div>
          </div>
          <Button class="mt-5 w-full bg-gradient-warm text-primary-foreground" size="lg">
            {{ $t("pages.becomePro.submit") }}
          </Button>
          <p class="mt-3 text-xs text-muted-foreground">
            {{ $t("pages.becomePro.terms") }}
          </p>
        </form>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-20">
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="p in perks" :key="p.key" class="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div class="grid h-12 w-12 place-items-center rounded-xl bg-gradient-warm text-primary-foreground shadow-glow">
            <component :is="p.icon" class="h-6 w-6" />
          </div>
          <h3 class="mt-4 font-display text-lg font-semibold">{{ $t(`pages.becomePro.${p.key}.title`) }}</h3>
          <p class="mt-1 text-sm text-muted-foreground">{{ $t(`pages.becomePro.${p.key}.desc`) }}</p>
        </div>
      </div>

      <div class="mt-16 grid gap-6 md:grid-cols-2">
        <figure class="overflow-hidden rounded-3xl">
          <img :src="cleaner" alt="Pro Domivo" class="h-80 w-full object-cover" loading="lazy" />
        </figure>
        <figure class="overflow-hidden rounded-3xl">
          <img :src="gardener" alt="Pro Domivo" class="h-80 w-full object-cover" loading="lazy" />
        </figure>
      </div>
    </section>
  </SiteShell>
</template>
