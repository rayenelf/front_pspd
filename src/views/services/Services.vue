<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import Button from "@/components/ui/Button.vue";
import { Search, Star, BadgeCheck, MapPin, Clock, SlidersHorizontal, X } from "lucide-vue-next";
import { findService } from "@/lib/services-data";
import { api, type CategorieData, type ServiceData, type SearchResultItem } from "@/lib/api";
import { Boxes } from "lucide-vue-next";

// ── Données catalogue ────────────────────────────────────────────────────────
const categories   = ref<CategorieData[]>([]);
const services     = ref<ServiceData[]>([]);

// ── Filtres ──────────────────────────────────────────────────────────────────
const selectedCat     = ref<CategorieData | null>(null);
const selectedService = ref<ServiceData | null>(null);
const filtreCertifie  = ref(false);
const filtreNoteMin   = ref("");
const filtrePrixMax   = ref("");
const showFilters     = ref(false);

// ── Résultats ────────────────────────────────────────────────────────────────
const results   = ref<SearchResultItem[]>([]);
const searching = ref(false);
const error     = ref<string | null>(null);

// ── Icône + dégradé catégorie ────────────────────────────────────────────────
function visual(slug: string) {
  const s = findService(slug);
  return { icon: s?.icon ?? Boxes, hue: s?.hue ?? "from-slate-200 to-zinc-300" };
}

// ── Chargement catégories ────────────────────────────────────────────────────
async function loadCategories() {
  try {
    categories.value = await api.getCategories();
  } catch {}
}

// ── Sélection catégorie → charge ses services ────────────────────────────────
async function selectCat(c: CategorieData | null) {
  if (selectedCat.value?.id === c?.id) {
    selectedCat.value = null;
    services.value = [];
    selectedService.value = null;
    runSearch();
    return;
  }
  selectedCat.value = c;
  selectedService.value = null;
  services.value = [];
  if (c) {
    try {
      services.value = await api.getCategoryServices(c.id);
    } catch {}
  }
  runSearch();
}

// ── Sélection service ────────────────────────────────────────────────────────
function selectService(s: ServiceData | null) {
  selectedService.value = selectedService.value?.id === s?.id ? null : s;
  runSearch();
}

// ── Recherche ────────────────────────────────────────────────────────────────
async function runSearch() {
  searching.value = true;
  error.value = null;
  try {
    const page = await api.search({
      service:  selectedService.value?.id ?? undefined,
      category: selectedService.value ? undefined : (selectedCat.value?.id ?? undefined),
      certifie: filtreCertifie.value || undefined,
      noteMin:  filtreNoteMin.value ? Number(filtreNoteMin.value) : undefined,
      prixMax:  filtrePrixMax.value ? Number(filtrePrixMax.value) : undefined,
      tri: "mieuxNote",
      size: 50,
    });
    results.value = page.content;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    searching.value = false;
  }
}

function clearFilters() {
  selectedCat.value = null;
  selectedService.value = null;
  services.value = [];
  filtreCertifie.value = false;
  filtreNoteMin.value = "";
  filtrePrixMax.value = "";
  runSearch();
}

onMounted(async () => {
  await loadCategories();
  runSearch();
});

watch([filtreCertifie, filtreNoteMin, filtrePrixMax], runSearch);
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- ── En-tête ──────────────────────────────────────────────────────── -->
    <section class="bg-gradient-hero py-12 text-primary-foreground">
      <div class="mx-auto max-w-7xl px-6">
        <h1 class="font-display text-4xl font-bold">Trouver un prestataire</h1>
        <p class="mt-2 text-white/80">Choisissez une catégorie pour filtrer les résultats</p>
      </div>
    </section>

    <div class="mx-auto max-w-7xl px-6 py-8">

      <!-- ── Catégories (chips) ─────────────────────────────────────────── -->
      <div class="flex flex-wrap gap-2 pb-4">
        <button
          v-for="c in categories" :key="c.id"
          @click="selectCat(c)"
          :class="[
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
            selectedCat?.id === c.id
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent',
          ]"
        >
          <component :is="visual(c.slug).icon" class="h-4 w-4" />
          {{ c.libelle }}
        </button>
      </div>

      <!-- ── Services de la catégorie sélectionnée ─────────────────────── -->
      <div v-if="services.length" class="mb-4 flex flex-wrap gap-2 border-b border-border pb-4">
        <button
          v-for="s in services" :key="s.id"
          @click="selectService(s)"
          :class="[
            'rounded-full border px-3 py-1 text-xs font-medium transition',
            selectedService?.id === s.id
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-muted text-muted-foreground hover:border-primary/40',
          ]"
        >
          {{ s.libelle }}
          <span v-if="s.prixIndicatif" class="ml-1 opacity-70">· {{ s.prixIndicatif }} TND</span>
        </button>
      </div>

      <!-- ── Barre filtres + compteur ───────────────────────────────────── -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <span class="text-sm text-muted-foreground">
          <b class="text-foreground">{{ results.length }}</b> prestataire{{ results.length !== 1 ? "s" : "" }}
          <span v-if="selectedCat"> · {{ selectedCat.libelle }}</span>
          <span v-if="selectedService"> · {{ selectedService.libelle }}</span>
        </span>

        <button
          @click="showFilters = !showFilters"
          class="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <SlidersHorizontal class="h-4 w-4" />
          Filtres
        </button>

        <button
          v-if="selectedCat || filtreCertifie || filtreNoteMin || filtrePrixMax"
          @click="clearFilters"
          class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <X class="h-4 w-4" /> Réinitialiser
        </button>
      </div>

      <!-- ── Panneau filtres avancés ────────────────────────────────────── -->
      <div v-if="showFilters" class="mb-6 rounded-xl border border-border bg-card p-4">
        <div class="flex flex-wrap gap-4 text-sm">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="filtreCertifie" class="h-4 w-4 rounded" />
            Certifiés uniquement
          </label>
          <label class="flex items-center gap-2">
            Note min.
            <input v-model="filtreNoteMin" type="number" min="0" max="5" step="0.5" placeholder="ex: 4"
              class="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm" />
          </label>
          <label class="flex items-center gap-2">
            Prix max (TND)
            <input v-model="filtrePrixMax" type="number" min="0" step="10" placeholder="ex: 200"
              class="h-8 w-24 rounded-md border border-input bg-background px-2 text-sm" />
          </label>
        </div>
      </div>

      <!-- ── Résultats ──────────────────────────────────────────────────── -->
      <p v-if="error" class="py-6 text-center text-sm text-destructive">{{ error }}</p>

      <div v-if="searching" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i"
          class="h-44 animate-pulse rounded-2xl border border-border bg-muted" />
      </div>

      <div v-else-if="results.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="r in results" :key="r.prestataireId"
          :to="`/prestataires/${r.slug ?? r.prestataireId}`"
          class="block rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:shadow-md"
        >
          <!-- Avatar + nom -->
          <div class="flex items-start gap-3">
            <div class="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-warm text-sm font-bold text-primary-foreground">
              <span>{{ r.nomCommercial.slice(0, 2).toUpperCase() }}</span>
              <img
                :src="`/api/prestataires/${r.prestataireId}/avatar`" alt=""
                class="absolute inset-0 h-full w-full object-cover"
                @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <h3 class="truncate font-display text-base font-semibold">{{ r.nomCommercial }}</h3>
                <BadgeCheck v-if="r.certifie" class="h-5 w-5 shrink-0 text-primary" />
              </div>
              <p v-if="r.categoriePrincipale" class="text-xs text-muted-foreground">{{ r.categoriePrincipale }}</p>
            </div>
          </div>

          <!-- Note -->
          <div class="mt-3 flex items-center gap-1 text-sm">
            <Star class="h-4 w-4 fill-primary text-primary" />
            <span class="font-medium">{{ Number(r.note).toFixed(1) }}</span>
          </div>

          <!-- Zone + distance -->
          <div v-if="r.distanceKm != null || r.langues" class="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span v-if="r.distanceKm != null" class="inline-flex items-center gap-1">
              <MapPin class="h-3.5 w-3.5" /> {{ r.distanceKm }} km
            </span>
            <span v-if="r.etaMin != null" class="inline-flex items-center gap-1">
              <Clock class="h-3.5 w-3.5" /> ~{{ r.etaMin }} min
            </span>
            <span v-if="r.langues">{{ r.langues }}</span>
          </div>

          <!-- Prix -->
          <p v-if="r.prixIndicatif" class="mt-3 text-sm">
            À partir de <b class="text-primary">{{ r.prixIndicatif }} TND</b>
          </p>

          <div class="mt-4 rounded-lg bg-gradient-warm px-3 py-1.5 text-center text-xs font-semibold text-primary-foreground">
            Réserver
          </div>
        </RouterLink>
      </div>

      <div v-else-if="!searching" class="py-16 text-center">
        <Search class="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p class="text-muted-foreground">Aucun prestataire trouvé pour ces critères.</p>
        <button @click="clearFilters" class="mt-3 text-sm text-primary underline">
          Effacer les filtres
        </button>
      </div>

    </div>
  </div>
</template>
