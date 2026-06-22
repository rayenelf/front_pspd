<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, RouterLink } from "vue-router";
import SiteShell from "@/components/site/SiteShell.vue";
import { findService } from "@/lib/services-data";
import Button from "@/components/ui/Button.vue";
import { CheckCircle2, MapPin, ShieldCheck, Star, Clock } from "lucide-vue-next";
import { api, type SearchResultItem } from "@/lib/api";

const { t } = useI18n();
const route = useRoute();
// Visuel/branding (icône, dégradé) : conservé depuis les données locales ;
// nom/tagline résolus via i18n (services.<slug>.*).
const service = computed(() => findService(route.params.slug as string));

// Prestataires réels (API) pour la catégorie correspondant au slug.
const pros     = ref<SearchResultItem[]>([]);
const loading  = ref(true);
const proError = ref<string | null>(null);

async function loadPros() {
  loading.value = true;
  proError.value = null;
  try {
    const slug = route.params.slug as string;
    const categories = await api.getCategories();
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) { pros.value = []; return; }
    const services = await api.getCategoryServices(cat.id);
    if (!services.length) { pros.value = []; return; }
    // On agrège les prestataires de tous les services de la catégorie (dédupliqués).
    const pages = await Promise.all(
      services.map((s) => api.search({ service: s.id, tri: "mieuxNote", size: 20 }))
    );
    const seen = new Set<string>();
    pros.value = pages.flatMap((p) => p.content).filter((r) => {
      if (seen.has(r.prestataireId)) return false;
      seen.add(r.prestataireId);
      return true;
    });
  } catch (e) {
    proError.value = t("pages.serviceDetail.errPros");
  } finally {
    loading.value = false;
  }
}

onMounted(loadPros);

const bullets = ["bulletQuote", "bulletEscrow", "bulletGuarantee", "bulletCancel"];
</script>

<template>
  <SiteShell>
    <template v-if="!service">
      <div class="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 class="font-display text-3xl font-bold">{{ $t("pages.serviceDetail.notFoundTitle") }}</h1>
        <p class="mt-2 text-muted-foreground">{{ $t("pages.serviceDetail.notFoundText") }}</p>
        <RouterLink to="/services" class="mt-6 inline-block text-primary underline">{{ $t("pages.serviceDetail.seeAll") }}</RouterLink>
      </div>
    </template>
    <template v-else>
      <section class="bg-gradient-hero py-16 text-primary-foreground">
        <div class="mx-auto max-w-7xl px-6">
          <RouterLink to="/services" class="text-sm text-white/70 hover:text-white">{{ $t("pages.serviceDetail.backAll") }}</RouterLink>
          <div class="mt-4 flex items-center gap-4">
            <div :class="`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${service.hue} text-secondary shadow-glow`">
              <component :is="service.icon" class="h-8 w-8" />
            </div>
            <div>
              <h1 class="font-display text-4xl font-bold sm:text-5xl">{{ $t(`services.${service.slug}.name`) }}</h1>
              <p class="mt-1 text-white/80">{{ $t(`services.${service.slug}.tagline`) }}</p>
            </div>
          </div>
          <div class="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><Star class="h-4 w-4 text-primary-glow" /> {{ $t("pages.serviceDetail.reviewsBadge") }}</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><Clock class="h-4 w-4" /> {{ service.duration }} {{ $t("pages.serviceDetail.durationAvg") }}</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><ShieldCheck class="h-4 w-4" /> {{ $t("pages.serviceDetail.prosVerified") }}</span>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 class="font-display text-2xl font-bold">{{ $t("pages.serviceDetail.prosTitle") }}</h2>

          <p v-if="loading" class="mt-6 text-muted-foreground">{{ $t("pages.serviceDetail.loadingPros") }}</p>
          <p v-else-if="proError" class="mt-6 text-sm text-red-700">{{ proError }}</p>
          <p v-else-if="!pros.length" class="mt-6 text-muted-foreground">
            {{ $t("pages.serviceDetail.noPros") }}
          </p>

          <div v-else class="mt-6 space-y-4">
            <div v-for="p in pros" :key="p.prestataireId" class="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-row sm:items-center">
              <div class="grid h-14 w-14 place-items-center rounded-full bg-gradient-warm font-display text-xl font-bold text-primary-foreground">
                {{ p.nomCommercial[0] }}
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold">{{ p.nomCommercial }}</h3>
                  <ShieldCheck v-if="p.certifie" class="h-4 w-4 text-primary" />
                </div>
                <p class="text-sm text-muted-foreground">
                  <Star class="mr-1 inline h-3 w-3 fill-primary text-primary" />
                  {{ Number(p.note).toFixed(1) }}
                  <template v-if="p.zoneIntervention"> · <MapPin class="mr-1 inline h-3 w-3" />{{ p.zoneIntervention }}</template>
                  <template v-if="p.langues"> · {{ p.langues }}</template>
                </p>
              </div>
              <div class="text-right">
                <p v-if="p.prixIndicatif" class="font-display text-lg font-bold">{{ $t("pages.serviceDetail.from") }} {{ p.prixIndicatif }} TND</p>
                <p v-if="p.etaMin != null" class="text-xs text-muted-foreground">{{ $t("pages.serviceDetail.arriveIn", { min: p.etaMin }) }}</p>
              </div>
              <Button class="bg-gradient-warm text-primary-foreground">{{ $t("pages.serviceDetail.reserve") }}</Button>
            </div>
          </div>
        </div>

        <aside class="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p class="text-sm text-muted-foreground">{{ $t("pages.serviceDetail.priceFromLabel") }}</p>
          <p class="font-display text-4xl font-bold text-primary">{{ service.startingAt }} TND</p>
          <p class="text-sm text-muted-foreground">{{ $t("pages.serviceDetail.perIntervention") }} · {{ service.duration }}</p>
          <ul class="my-6 space-y-2 text-sm">
            <li v-for="b in bullets" :key="b" class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /> {{ $t(`pages.serviceDetail.${b}`) }}</li>
          </ul>
          <Button class="w-full bg-gradient-warm text-primary-foreground" size="lg">{{ $t("pages.serviceDetail.requestQuote") }}</Button>
          <Button variant="outline" class="mt-2 w-full" size="lg">{{ $t("pages.serviceDetail.reserveNow") }}</Button>
        </aside>
      </section>
    </template>
  </SiteShell>
</template>
