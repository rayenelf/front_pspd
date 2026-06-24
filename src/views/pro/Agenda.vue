<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { ChevronLeft, ChevronRight } from "lucide-vue-next";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import { api, type AgendaEntry } from "@/lib/api";

const MONTHS_FR = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const WEEK_DAYS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const today = new Date();
const year  = ref(today.getFullYear());
const month = ref(today.getMonth() + 1); // 1-based

const entries  = ref<AgendaEntry[]>([]);
const loading  = ref(false);

// ── Grille calendrier ────────────────────────────────────────────────────────

const daysInMonth = computed(() => new Date(year.value, month.value, 0).getDate());

/** Décalage du premier jour (Lun=0 … Dim=6). */
const startOffset = computed(() => {
  const d = new Date(year.value, month.value - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
});

/** Cellules totales = décalage + jours + rembourrage pour compléter la grille. */
const cells = computed(() => {
  const total = startOffset.value + daysInMonth.value;
  const rows  = Math.ceil(total / 7);
  return Array.from({ length: rows * 7 }, (_, i) => {
    const day = i - startOffset.value + 1;
    return (day >= 1 && day <= daysInMonth.value) ? day : null;
  });
});

const isToday = (day: number) =>
  day === today.getDate() &&
  month.value === today.getMonth() + 1 &&
  year.value  === today.getFullYear();

// ── Événements par jour ──────────────────────────────────────────────────────

const eventsByDay = computed(() => {
  const map: Record<number, AgendaEntry[]> = {};
  for (const e of entries.value) {
    const day = parseInt(e.dateService.split("-")[2], 10);
    if (!map[day]) map[day] = [];
    map[day].push(e);
  }
  return map;
});

function formatHeure(h: string) {
  // "09:30:00" → "09h30"
  const [hh, mm] = h.split(":");
  return mm === "00" ? `${hh}h` : `${hh}h${mm}`;
}

// ── Navigation ───────────────────────────────────────────────────────────────

function prev() {
  if (month.value === 1) { month.value = 12; year.value--; }
  else month.value--;
}
function next() {
  if (month.value === 12) { month.value = 1; year.value++; }
  else month.value++;
}

// ── Chargement ───────────────────────────────────────────────────────────────

async function load() {
  loading.value = true;
  try {
    entries.value = await api.agendaForMonth(year.value, month.value);
  } catch {
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch([year, month], load);
</script>

<template>
  <PanelCard :title="`${MONTHS_FR[month - 1]} ${year}`">
    <template #action>
      <div class="flex items-center gap-1">
        <span v-if="loading" class="mr-2 text-xs text-muted-foreground">chargement…</span>
        <button @click="prev" class="rounded-md border border-border p-1 hover:bg-accent">
          <ChevronLeft class="h-3.5 w-3.5" />
        </button>
        <button @click="next" class="rounded-md border border-border p-1 hover:bg-accent">
          <ChevronRight class="h-3.5 w-3.5" />
        </button>
      </div>
    </template>

    <!-- Grille -->
    <div class="grid grid-cols-7 gap-1.5 text-xs">
      <!-- En-têtes jours -->
      <div
        v-for="d in WEEK_DAYS" :key="d"
        class="py-2 text-center font-semibold text-muted-foreground"
      >{{ d }}</div>

      <!-- Cellules -->
      <div
        v-for="(day, i) in cells" :key="i"
        :class="[
          'min-h-24 rounded-lg border p-1.5 transition',
          day === null        ? 'border-transparent bg-transparent'
          : isToday(day)      ? 'border-primary/40 bg-primary/5'
          : eventsByDay[day]  ? 'border-primary/20 bg-primary/[0.03]'
          : 'border-border',
        ]"
      >
        <template v-if="day !== null">
          <div
            :class="[
              'mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
              isToday(day) ? 'bg-primary text-primary-foreground' : 'text-foreground',
            ]"
          >{{ day }}</div>

          <div class="space-y-0.5">
            <div
              v-for="e in (eventsByDay[day] ?? [])" :key="e.id"
              :class="[
                'truncate rounded px-1 py-0.5 text-[10px] font-medium text-primary-foreground',
                e.statut === 'EN_COURS' ? 'bg-orange-500' : 'bg-gradient-warm',
              ]"
              :title="`${formatHeure(e.heureService)} · ${e.serviceLibelle} — ${e.clientNomComplet}`"
            >
              {{ formatHeure(e.heureService) }} {{ e.serviceLibelle }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Légende -->
    <div class="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-2.5 w-2.5 rounded-sm bg-gradient-warm"></span> Acceptée
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500"></span> En cours
      </span>
    </div>
  </PanelCard>
</template>
