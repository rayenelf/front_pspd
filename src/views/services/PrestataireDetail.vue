<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import SiteShell from "@/components/site/SiteShell.vue";
import Button from "@/components/ui/Button.vue";
import { Star, ShieldCheck, MapPin, ArrowLeft, Compass } from "lucide-vue-next";
import { api, type PublicPrestataire } from "@/lib/api";

const route = useRoute();
const provider = ref<PublicPrestataire | null>(null);
const loading  = ref(true);
const notFound = ref(false);

async function load(slug: string) {
  loading.value = true;
  notFound.value = false;
  try {
    provider.value = await api.getPublicPrestataire(slug);
  } catch {
    notFound.value = true;
  } finally {
    loading.value = false;
  }
}

onMounted(() => load(route.params.slug as string));
// Recharge si on navigue d'un prestataire à un autre sans démonter la vue.
watch(() => route.params.slug, (slug) => { if (slug) load(slug as string); });

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}
</script>

<template>
  <SiteShell>
    <p v-if="loading" class="mx-auto max-w-3xl px-6 py-24 text-center text-muted-foreground">
      {{ $t("pages.providerDetail.loading") }}
    </p>

    <div v-else-if="notFound || !provider" class="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 class="font-display text-3xl font-bold">{{ $t("pages.providerDetail.notFound") }}</h1>
      <p class="mt-2 text-muted-foreground">{{ $t("pages.providerDetail.notFoundText") }}</p>
      <RouterLink to="/services" class="mt-6 inline-block text-primary underline">
        {{ $t("pages.providerDetail.backToServices") }}
      </RouterLink>
    </div>

    <template v-else>
      <!-- En-tête -->
      <section class="bg-gradient-hero py-14 text-primary-foreground">
        <div class="mx-auto max-w-7xl px-6">
          <RouterLink to="/services" class="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
            <ArrowLeft class="h-4 w-4" /> {{ $t("pages.providerDetail.backToServices") }}
          </RouterLink>
          <div class="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div class="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/15 font-display text-3xl font-bold ring-1 ring-white/20 backdrop-blur">
              <img v-if="provider.avatarUrl" :src="provider.avatarUrl" alt="" class="h-full w-full object-cover" />
              <span v-else>{{ initials(provider.nomCommercial) }}</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="font-display text-3xl font-bold sm:text-4xl">{{ provider.nomCommercial }}</h1>
                <ShieldCheck v-if="provider.certifie" class="h-6 w-6 text-primary-glow" />
              </div>
              <p v-if="provider.categoriePrincipale" class="mt-1 text-white/80">{{ provider.categoriePrincipale }}</p>
              <div class="mt-3 flex flex-wrap gap-3 text-sm text-white/80">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <Star class="h-4 w-4 text-primary-glow" /> {{ Number(provider.note).toFixed(1) }}
                </span>
                <span v-if="provider.certifie" class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <ShieldCheck class="h-4 w-4" /> {{ $t("pages.providerDetail.certified") }}
                </span>
                <span v-if="provider.zoneIntervention" class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
                  <MapPin class="h-4 w-4" /> {{ provider.zoneIntervention }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.6fr_1fr]">
        <!-- Portfolio -->
        <div>
          <h2 class="font-display text-2xl font-bold">{{ $t("pages.providerDetail.portfolio") }}</h2>
          <p v-if="!provider.portfolio.length" class="mt-4 text-muted-foreground">
            {{ $t("pages.providerDetail.noPortfolio") }}
          </p>
          <div v-else class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <a
              v-for="p in provider.portfolio"
              :key="p.id"
              :href="p.url"
              target="_blank"
              class="aspect-square overflow-hidden rounded-xl border border-border transition hover:opacity-90"
            >
              <img :src="p.url" alt="" class="h-full w-full object-cover" loading="lazy" />
            </a>
          </div>
        </div>

        <!-- Infos + CTA -->
        <aside class="h-fit rounded-2xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
          <dl class="space-y-3 text-sm">
            <div v-if="provider.langues" class="flex items-start justify-between gap-4">
              <dt class="text-muted-foreground">{{ $t("pages.providerDetail.languages") }}</dt>
              <dd class="text-right font-medium">{{ provider.langues }}</dd>
            </div>
            <div v-if="provider.zoneIntervention" class="flex items-start justify-between gap-4">
              <dt class="text-muted-foreground">{{ $t("pages.providerDetail.zone") }}</dt>
              <dd class="text-right font-medium">{{ provider.zoneIntervention }}</dd>
            </div>
            <div class="flex items-center justify-between gap-4">
              <dt class="text-muted-foreground">{{ $t("pages.providerDetail.radius") }}</dt>
              <dd class="inline-flex items-center gap-1 font-medium"><Compass class="h-4 w-4" /> {{ provider.rayonKm }} km</dd>
            </div>
          </dl>
          <Button class="mt-6 w-full bg-gradient-warm text-primary-foreground" size="lg">
            {{ $t("pages.providerDetail.requestQuote") }}
          </Button>
          <Button variant="outline" class="mt-2 w-full" size="lg">
            {{ $t("pages.providerDetail.book") }}
          </Button>
        </aside>
      </section>
    </template>
  </SiteShell>
</template>
