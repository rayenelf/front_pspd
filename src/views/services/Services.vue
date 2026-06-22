<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import SiteShell from "@/components/site/SiteShell.vue";
import Input from "@/components/ui/Input.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import { ChevronLeft, Search, Star, BadgeCheck, Boxes, MapPin, Clock } from "lucide-vue-next";
import { findService } from "@/lib/services-data";
import {
  api,
  type CategorieData,
  type ServiceData,
  type SearchResultItem,
  type ApiError,
} from "@/lib/api";

const { t } = useI18n();

type View = "categories" | "services" | "results";
const view = ref<View>("categories");

const categories = ref<CategorieData[]>([]);
const loading    = ref(false);
const error      = ref<string | null>(null);

const activeCategorie = ref<CategorieData | null>(null);
const services        = ref<ServiceData[]>([]);

const activeService = ref<ServiceData | null>(null);
const results       = ref<SearchResultItem[]>([]);
const searching     = ref(false);

// Filtres de recherche (B2/B3)
const filtreCertifie = ref(false);
const filtreNoteMin  = ref<string>("");
const filtrePrixMax  = ref<string>("");
const filtreLangue   = ref<string>("");
const tri            = ref<"mieuxNote" | "moinsCher" | "proche" | "plusRapide">("mieuxNote");

// Géolocalisation (B4)
const userLat   = ref<number | null>(null);
const userLng   = ref<number | null>(null);
const rayon     = ref<number>(20);
const geoLoading = ref(false);
const geoError   = ref<string | null>(null);

function localiser() {
  geoError.value = null;
  if (!navigator.geolocation) {
    geoError.value = t("pages.servicesList.geoUnavailable");
    return;
  }
  geoLoading.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLat.value = pos.coords.latitude;
      userLng.value = pos.coords.longitude;
      geoLoading.value = false;
      runSearch();
    },
    () => {
      // Refus / échec → on retombe sur le centre de Tunis pour la démo.
      userLat.value = 36.8065;
      userLng.value = 10.1815;
      geoLoading.value = false;
      geoError.value = t("pages.servicesList.geoDenied");
      runSearch();
    },
    { timeout: 8000 }
  );
}

function resetGeo() {
  userLat.value = null;
  userLng.value = null;
  if (tri.value === "proche" || tri.value === "plusRapide") tri.value = "mieuxNote";
  runSearch();
}

/** Icône + dégradé : repris des mocks par slug, fallback générique. */
function visual(slug: string) {
  const s = findService(slug);
  return { icon: s?.icon ?? Boxes, hue: s?.hue ?? "from-slate-200 to-zinc-300" };
}

async function loadCategories() {
  loading.value = true;
  error.value = null;
  try {
    categories.value = await api.getCategories();
  } catch (e) {
    error.value = (e as ApiError).message || t("pages.servicesList.errCatalog");
  } finally {
    loading.value = false;
  }
}

async function openCategorie(c: CategorieData) {
  activeCategorie.value = c;
  services.value = [];
  view.value = "services";
  try {
    services.value = await api.getCategoryServices(c.id);
  } catch (e) {
    error.value = (e as ApiError).message || t("pages.servicesList.errServices");
  }
}

async function openService(s: ServiceData) {
  activeService.value = s;
  view.value = "results";
  await runSearch();
}

async function runSearch() {
  if (!activeService.value) return;
  searching.value = true;
  error.value = null;
  try {
    const geo = userLat.value != null && userLng.value != null;
    const page = await api.search({
      service:  activeService.value.id,
      certifie: filtreCertifie.value || undefined,
      noteMin:  filtreNoteMin.value ? Number(filtreNoteMin.value) : undefined,
      prixMax:  filtrePrixMax.value ? Number(filtrePrixMax.value) : undefined,
      langue:   filtreLangue.value || undefined,
      tri:      tri.value,
      lat:      geo ? userLat.value! : undefined,
      lng:      geo ? userLng.value! : undefined,
      rayon:    geo ? rayon.value : undefined,
      size:     50,
    });
    results.value = page.content;
  } catch (e) {
    error.value = (e as ApiError).message || t("pages.servicesList.errSearch");
  } finally {
    searching.value = false;
  }
}

function backToCategories() { view.value = "categories"; activeCategorie.value = null; }
function backToServices()   { view.value = "services";   activeService.value = null; }

onMounted(loadCategories);
</script>

<template>
  <SiteShell>
    <!-- En-tête -->
    <section class="bg-gradient-hero py-14 text-primary-foreground">
      <div class="mx-auto max-w-7xl px-6">
        <h1 class="font-display text-4xl font-bold sm:text-5xl">{{ $t("pages.servicesList.title") }}</h1>
        <p class="mt-3 max-w-xl text-white/80">
          {{ $t("pages.servicesList.subtitle") }}
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-12">
      <p v-if="error" class="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {{ error }}
      </p>

      <!-- ── Vue 1 : Catégories ─────────────────────────────────────────── -->
      <template v-if="view === 'categories'">
        <p v-if="loading" class="text-muted-foreground">{{ $t("pages.servicesList.loadingCatalog") }}</p>
        <p v-else-if="!categories.length" class="text-muted-foreground">
          {{ $t("pages.servicesList.emptyCatalog") }}
        </p>
        <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="c in categories"
            :key="c.id"
            type="button"
            class="group flex gap-4 rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:shadow-soft"
            @click="openCategorie(c)"
          >
            <div :class="`grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${visual(c.slug).hue} text-secondary`">
              <component :is="visual(c.slug).icon" class="h-7 w-7" />
            </div>
            <div class="flex-1">
              <h3 class="font-display text-lg font-semibold">{{ c.libelle }}</h3>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ c.enfants.length ? $t("pages.servicesList.subcatCount", { count: c.enfants.length }) : $t("pages.servicesList.seeServices") }}
              </p>
            </div>
          </button>
        </div>
      </template>

      <!-- ── Vue 2 : Services de la catégorie ───────────────────────────── -->
      <template v-else-if="view === 'services'">
        <button class="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" @click="backToCategories">
          <ChevronLeft class="h-4 w-4" /> {{ $t("pages.servicesList.backToCategories") }}
        </button>
        <h2 class="font-display text-2xl font-bold">{{ activeCategorie?.libelle }}</h2>

        <!-- Sous-catégories éventuelles -->
        <div v-if="activeCategorie?.enfants.length" class="mt-4 flex flex-wrap gap-2">
          <button v-for="sc in activeCategorie!.enfants" :key="sc.id" type="button" @click="openCategorie(sc)">
            <Badge variant="secondary" class="cursor-pointer px-3 py-1.5">{{ sc.libelle }}</Badge>
          </button>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button
            v-for="s in services"
            :key="s.id"
            type="button"
            class="rounded-2xl border border-border bg-card p-5 text-left transition hover:-translate-y-1 hover:shadow-soft"
            @click="openService(s)"
          >
            <h3 class="font-display text-lg font-semibold">{{ s.libelle }}</h3>
            <p v-if="s.description" class="mt-1 line-clamp-2 text-sm text-muted-foreground">{{ s.description }}</p>
            <p v-if="s.prixIndicatif" class="mt-3 text-sm">{{ $t("pages.servicesList.from") }} <b>{{ s.prixIndicatif }} TND</b>
              <span v-if="s.unite" class="text-muted-foreground"> · {{ s.unite }}</span>
            </p>
          </button>
        </div>
        <p v-if="!services.length" class="mt-6 text-muted-foreground">{{ $t("pages.servicesList.noServiceInCat") }}</p>
      </template>

      <!-- ── Vue 3 : Résultats prestataires ─────────────────────────────── -->
      <template v-else>
        <button class="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" @click="backToServices">
          <ChevronLeft class="h-4 w-4" /> {{ $t("pages.servicesList.backToServices") }}
        </button>
        <h2 class="font-display text-2xl font-bold">{{ activeService?.libelle }}</h2>

        <!-- Filtres + tri (B2/B3/B4) -->
        <div class="mt-5 space-y-3 rounded-xl border border-border bg-card p-4">
          <div class="flex flex-wrap items-center gap-3">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="filtreCertifie" @change="runSearch" class="h-4 w-4 rounded border-input" />
              {{ $t("pages.servicesList.certifiedOnly") }}
            </label>
            <label class="flex items-center gap-2 text-sm">
              {{ $t("pages.servicesList.minRating") }}
              <Input v-model="filtreNoteMin" type="number" min="0" max="5" step="0.5" class="h-9 w-20" @change="runSearch" />
            </label>
            <label class="flex items-center gap-2 text-sm">
              {{ $t("pages.servicesList.maxPrice") }}
              <Input v-model="filtrePrixMax" type="number" min="0" step="10" placeholder="TND" class="h-9 w-24" @change="runSearch" />
            </label>
            <label class="flex items-center gap-2 text-sm">
              {{ $t("pages.servicesList.language") }}
              <Input v-model="filtreLangue" :placeholder="$t('pages.servicesList.languagePlaceholder')" class="h-9 w-28" @change="runSearch" />
            </label>
            <label class="flex items-center gap-2 text-sm">
              {{ $t("pages.servicesList.sort") }}
              <select v-model="tri" @change="runSearch" class="h-9 rounded-md border border-input bg-background px-2 text-sm">
                <option value="mieuxNote">{{ $t("pages.servicesList.sortBest") }}</option>
                <option value="moinsCher">{{ $t("pages.servicesList.sortCheapest") }}</option>
                <option value="proche" :disabled="userLat === null">{{ $t("pages.servicesList.sortClosest") }}</option>
                <option value="plusRapide" :disabled="userLat === null">{{ $t("pages.servicesList.sortFastest") }}</option>
              </select>
            </label>
            <span class="ml-auto inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Search class="h-4 w-4" /> {{ $t("pages.servicesList.resultsCount", { count: results.length }) }}
            </span>
          </div>

          <!-- Géolocalisation (B4) -->
          <div class="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-sm">
            <Button v-if="userLat === null" variant="outline" size="sm" :disabled="geoLoading" @click="localiser">
              <MapPin class="mr-1 h-4 w-4" /> {{ geoLoading ? $t("pages.servicesList.locating") : $t("pages.servicesList.nearMe") }}
            </Button>
            <template v-else>
              <span class="inline-flex items-center gap-1 text-primary">
                <MapPin class="h-4 w-4" /> {{ $t("pages.servicesList.aroundMe") }}
              </span>
              <label class="flex items-center gap-2">
                {{ $t("pages.servicesList.radius") }}
                <select v-model.number="rayon" @change="runSearch" class="h-9 rounded-md border border-input bg-background px-2">
                  <option :value="5">5 km</option>
                  <option :value="10">10 km</option>
                  <option :value="20">20 km</option>
                  <option :value="50">50 km</option>
                </select>
              </label>
              <button class="text-muted-foreground underline" @click="resetGeo">{{ $t("pages.servicesList.disable") }}</button>
            </template>
            <span v-if="geoError" class="text-xs text-amber-600">{{ geoError }}</span>
          </div>
        </div>

        <p v-if="searching" class="mt-6 text-muted-foreground">{{ $t("pages.servicesList.searching") }}</p>
        <div v-else class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="r in results" :key="r.prestataireId" class="rounded-2xl border border-border bg-card p-5">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-display text-lg font-semibold">{{ r.nomCommercial }}</h3>
              <BadgeCheck v-if="r.certifie" class="h-5 w-5 shrink-0 text-primary" />
            </div>
            <p v-if="r.categoriePrincipale" class="text-sm text-muted-foreground">{{ r.categoriePrincipale }}</p>
            <div class="mt-3 flex items-center gap-1 text-sm">
              <Star class="h-4 w-4 fill-primary text-primary" /> {{ Number(r.note).toFixed(1) }}
            </div>
            <p v-if="r.langues" class="mt-2 text-xs text-muted-foreground">{{ r.langues }}</p>
            <div v-if="r.distanceKm != null" class="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span class="inline-flex items-center gap-1"><MapPin class="h-3.5 w-3.5" /> {{ r.distanceKm }} km</span>
              <span v-if="r.etaMin != null" class="inline-flex items-center gap-1"><Clock class="h-3.5 w-3.5" /> ~{{ r.etaMin }} min</span>
            </div>
            <p v-if="r.prixIndicatif" class="mt-3 text-sm">{{ $t("pages.servicesList.from") }} <b>{{ r.prixIndicatif }} TND</b></p>
          </div>
        </div>
        <p v-if="!searching && !results.length" class="mt-6 text-muted-foreground">
          {{ $t("pages.servicesList.noResults") }}
        </p>
      </template>
    </section>
  </SiteShell>
</template>
