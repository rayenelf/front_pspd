<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import SiteShell from "@/components/site/SiteShell.vue";
import { findService } from "@/lib/services-data";
import Button from "@/components/ui/Button.vue";
import { CheckCircle2, MapPin, ShieldCheck, Star, Clock } from "lucide-vue-next";
import { api, type SearchResultItem } from "@/lib/api";

const route = useRoute();
// Visuel/branding (icône, dégradé, tagline) : conservé depuis les données locales.
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
    proError.value = "Impossible de charger les prestataires.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadPros);

const bullets = ["Devis transparent", "Paiement séquestre", "Garantie satisfaction", "Annulation gratuite"];
</script>

<template>
  <SiteShell>
    <template v-if="!service">
      <div class="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 class="font-display text-3xl font-bold">Service introuvable</h1>
        <p class="mt-2 text-muted-foreground">Cette catégorie n'existe pas ou plus.</p>
        <RouterLink to="/services" class="mt-6 inline-block text-primary underline">Voir tous les services</RouterLink>
      </div>
    </template>
    <template v-else>
      <section class="bg-gradient-hero py-16 text-primary-foreground">
        <div class="mx-auto max-w-7xl px-6">
          <RouterLink to="/services" class="text-sm text-white/70 hover:text-white">← Tous les services</RouterLink>
          <div class="mt-4 flex items-center gap-4">
            <div :class="`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${service.hue} text-secondary shadow-glow`">
              <component :is="service.icon" class="h-8 w-8" />
            </div>
            <div>
              <h1 class="font-display text-4xl font-bold sm:text-5xl">{{ service.name }}</h1>
              <p class="mt-1 text-white/80">{{ service.tagline }}</p>
            </div>
          </div>
          <div class="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><Star class="h-4 w-4 text-primary-glow" /> 4,9 (1 240 avis)</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><Clock class="h-4 w-4" /> {{ service.duration }} en moyenne</span>
            <span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1"><ShieldCheck class="h-4 w-4" /> Pros vérifiés</span>
          </div>
        </div>
      </section>

      <section class="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 class="font-display text-2xl font-bold">Pros disponibles près de chez vous</h2>

          <p v-if="loading" class="mt-6 text-muted-foreground">Chargement des prestataires…</p>
          <p v-else-if="proError" class="mt-6 text-sm text-red-700">{{ proError }}</p>
          <p v-else-if="!pros.length" class="mt-6 text-muted-foreground">
            Aucun prestataire validé pour cette catégorie pour le moment.
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
                <p v-if="p.prixIndicatif" class="font-display text-lg font-bold">dès {{ p.prixIndicatif }} TND</p>
                <p v-if="p.etaMin != null" class="text-xs text-muted-foreground">arrive en ~{{ p.etaMin }} min</p>
              </div>
              <Button class="bg-gradient-warm text-primary-foreground">Réserver</Button>
            </div>
          </div>
        </div>

        <aside class="lg:sticky lg:top-24 h-fit rounded-2xl border border-border bg-card p-6 shadow-soft">
          <p class="text-sm text-muted-foreground">À partir de</p>
          <p class="font-display text-4xl font-bold text-primary">{{ service.startingAt }} TND</p>
          <p class="text-sm text-muted-foreground">par intervention · {{ service.duration }}</p>
          <ul class="my-6 space-y-2 text-sm">
            <li v-for="b in bullets" :key="b" class="flex items-center gap-2"><CheckCircle2 class="h-4 w-4 text-primary" /> {{ b }}</li>
          </ul>
          <Button class="w-full bg-gradient-warm text-primary-foreground" size="lg">Demander un devis</Button>
          <Button variant="outline" class="mt-2 w-full" size="lg">Réserver maintenant</Button>
        </aside>
      </section>
    </template>
  </SiteShell>
</template>
