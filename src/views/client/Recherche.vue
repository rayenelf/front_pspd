<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { Search, Star, BadgeCheck, MapPin, SlidersHorizontal, X } from "lucide-vue-next";
import { Boxes } from "lucide-vue-next";
import { api, type CategorieData, type SearchResultItem } from "@/lib/api";
import { findService } from "@/lib/services-data";

// ── Catalogue ────────────────────────────────────────────────────────────────
const categories = ref<CategorieData[]>([]);

// ── Filtres ──────────────────────────────────────────────────────────────────
const selectedCat    = ref<CategorieData | null>(null);
const filtreCertifie = ref(false);
const filtreNoteMin  = ref("");
const filtrePrixMax  = ref("");
const showFilters    = ref(false);

// ── Résultats ────────────────────────────────────────────────────────────────
const results   = ref<SearchResultItem[]>([]);
const searching = ref(false);
const error     = ref<string | null>(null);

function visual(slug: string) {
  const s = findService(slug);
  return { icon: s?.icon ?? Boxes, hue: s?.hue ?? "from-slate-200 to-zinc-300" };
}

function selectCat(c: CategorieData) {
  selectedCat.value = selectedCat.value?.id === c.id ? null : c;
  runSearch();
}

async function runSearch() {
  searching.value = true;
  error.value = null;
  try {
    const page = await api.search({
      category: selectedCat.value?.id ?? undefined,
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
  filtreCertifie.value = false;
  filtreNoteMin.value = "";
  filtrePrixMax.value = "";
  runSearch();
}

onMounted(async () => {
  try { categories.value = await api.getCategories(); } catch {}
  runSearch();
});

watch([filtreCertifie, filtreNoteMin, filtrePrixMax], runSearch);
</script>

<template>
  <div class="space-y-5">

    <!-- ── En-tête ──────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-xl font-bold">Trouver un prestataire</h1>
        <p class="text-sm text-muted-foreground">Filtrez par catégorie pour affiner les résultats</p>
      </div>
    </div>

    <!-- ── Catégories (chips) ─────────────────────────────────────────────── -->
    <div class="rounded-xl border border-border bg-background p-4">
      <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Catégories</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in categories" :key="c.id"
          @click="selectCat(c)"
          :class="[
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
            selectedCat?.id === c.id
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent',
          ]"
        >
          <component :is="visual(c.slug).icon" class="h-4 w-4" />
          {{ c.libelle }}
        </button>
      </div>

    </div>

    <!-- ── Barre résultats + filtres ─────────────────────────────────────── -->
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm text-muted-foreground">
        <span class="font-semibold text-foreground">{{ results.length }}</span>
        prestataire{{ results.length !== 1 ? "s" : "" }}
        <span v-if="selectedCat"> · {{ selectedCat.libelle }}</span>
      </span>

      <button
        @click="showFilters = !showFilters"
        :class="[
          'ml-auto inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition',
          showFilters ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent',
        ]"
      >
        <SlidersHorizontal class="h-4 w-4" />
        Filtres
      </button>

      <button
        v-if="selectedCat || filtreCertifie || filtreNoteMin || filtrePrixMax"
        @click="clearFilters"
        class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <X class="h-3.5 w-3.5" /> Effacer
      </button>
    </div>

    <!-- ── Filtres avancés ────────────────────────────────────────────────── -->
    <div v-if="showFilters" class="rounded-xl border border-border bg-background p-4">
      <div class="flex flex-wrap gap-5 text-sm">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="filtreCertifie" class="h-4 w-4 rounded border-input accent-primary" />
          Certifiés uniquement
        </label>
        <label class="flex items-center gap-2">
          Note min.
          <input v-model="filtreNoteMin" type="number" min="0" max="5" step="0.5" placeholder="ex: 4"
            class="h-8 w-20 rounded-md border border-input bg-card px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </label>
        <label class="flex items-center gap-2">
          Prix max (TND)
          <input v-model="filtrePrixMax" type="number" min="0" step="10" placeholder="ex: 200"
            class="h-8 w-24 rounded-md border border-input bg-card px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        </label>
      </div>
    </div>

    <!-- ── Skeleton chargement ───────────────────────────────────────────── -->
    <div v-if="searching" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="i in 6" :key="i" class="h-44 animate-pulse rounded-xl border border-border bg-muted" />
    </div>

    <!-- ── Erreur ─────────────────────────────────────────────────────────── -->
    <p v-else-if="error" class="py-6 text-center text-sm text-destructive">{{ error }}</p>

    <!-- ── Grille prestataires ───────────────────────────────────────────── -->
    <div v-else-if="results.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RouterLink
        v-for="r in results" :key="r.prestataireId"
        :to="`/client/prestataires/${r.slug ?? r.prestataireId}`"
        class="group flex flex-col rounded-xl border border-border bg-background p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
      >
        <!-- Avatar + nom -->
        <div class="flex items-center gap-3">
          <div class="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-warm text-sm font-bold text-white">
            <span>{{ r.nomCommercial.slice(0, 2).toUpperCase() }}</span>
            <img
              :src="`/api/prestataires/${r.prestataireId}/avatar`" alt=""
              class="absolute inset-0 h-full w-full object-cover"
              @error="(e) => ((e.target as HTMLImageElement).style.display = 'none')"
            />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <p class="truncate font-semibold">{{ r.nomCommercial }}</p>
              <BadgeCheck v-if="r.certifie" class="h-4 w-4 shrink-0 text-primary" />
            </div>
            <p class="truncate text-xs text-muted-foreground">{{ r.categoriePrincipale ?? "Prestataire" }}</p>
          </div>
        </div>

        <!-- Note + infos ────────────────────────────────────── -->
        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span class="inline-flex items-center gap-1 font-medium text-foreground">
            <Star class="h-3.5 w-3.5 fill-primary text-primary" />
            {{ Number(r.note).toFixed(1) }}
          </span>
          <span v-if="r.distanceKm != null" class="inline-flex items-center gap-1">
            <MapPin class="h-3.5 w-3.5" /> {{ r.distanceKm }} km
          </span>
          <span v-if="r.langues">{{ r.langues }}</span>
        </div>

        <p v-if="r.prixIndicatif" class="mt-2 text-sm">
          À partir de <span class="font-semibold text-primary">{{ r.prixIndicatif }} TND</span>
        </p>

        <!-- CTA ─────────────────────────────────────────────── -->
        <div class="mt-auto pt-4">
          <span class="block w-full rounded-lg bg-gradient-warm py-1.5 text-center text-xs font-semibold text-white transition group-hover:opacity-90">
            Voir le profil & réserver
          </span>
        </div>
      </RouterLink>
    </div>

    <!-- ── Vide ───────────────────────────────────────────────────────────── -->
    <div v-else class="flex flex-col items-center py-16 text-center">
      <Search class="mb-3 h-10 w-10 text-muted-foreground/30" />
      <p class="text-muted-foreground">Aucun prestataire trouvé pour ces critères.</p>
      <button @click="clearFilters" class="mt-3 text-sm text-primary underline">Effacer les filtres</button>
    </div>

  </div>
</template>
