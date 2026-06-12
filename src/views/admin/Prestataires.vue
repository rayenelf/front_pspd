<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import {
  api,
  type AdminPrestataireData,
  type PrestataireStats,
  type StatutValidation,
  type ApiError,
} from "@/lib/api";

// ── Libellés ─────────────────────────────────────────────────────────────────
const DOC_LABEL: Record<string, string> = {
  CIN: "Pièce d'identité (CIN)",
  PATENTE_RC: "Patente / RC",
  ATTESTATION_FISCALE: "Attestation fiscale",
  ASSURANCE_RC: "Assurance RC pro",
  DIPLOME: "Diplôme / certification",
};
const STATUT_LABEL: Record<StatutValidation, string> = {
  EN_ATTENTE: "En attente",
  VERIFICATION: "En vérification",
  VALIDE: "Validé",
  SUSPENDU: "Refusé",
};
const STATUT_VARIANT: Record<StatutValidation, "default" | "secondary" | "destructive"> = {
  EN_ATTENTE: "secondary",
  VERIFICATION: "secondary",
  VALIDE: "default",
  SUSPENDU: "destructive",
};

const TABS: { key: StatutValidation | "ALL"; label: string }[] = [
  { key: "EN_ATTENTE", label: "En attente" },
  { key: "VALIDE", label: "Validés" },
  { key: "SUSPENDU", label: "Refusés" },
  { key: "ALL", label: "Tous" },
];

// ── État ─────────────────────────────────────────────────────────────────────
const stats     = ref<PrestataireStats | null>(null);
const items     = ref<AdminPrestataireData[]>([]);
const activeTab = ref<StatutValidation | "ALL">("EN_ATTENTE");
const loading   = ref(false);
const expanded  = reactive<Record<string, boolean>>({});
const busy      = reactive<Record<string, boolean>>({});
const feedback  = ref<{ type: "success" | "error"; text: string } | null>(null);

function notify(type: "success" | "error", text: string) {
  feedback.value = { type, text };
  setTimeout(() => (feedback.value = null), 4000);
}

function fullName(p: AdminPrestataireData) {
  const n = [p.prenom, p.nom].filter(Boolean).join(" ");
  return n || p.email.split("@")[0];
}

// ── Chargement ───────────────────────────────────────────────────────────────
async function load() {
  loading.value = true;
  try {
    const [s, list] = await Promise.all([
      api.adminPrestataireStats(),
      api.adminListPrestataires(activeTab.value === "ALL" ? undefined : activeTab.value),
    ]);
    stats.value = s;
    items.value = list;
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec du chargement.");
  } finally {
    loading.value = false;
  }
}

function switchTab(key: StatutValidation | "ALL") {
  activeTab.value = key;
  load();
}

onMounted(load);

// ── Actions ──────────────────────────────────────────────────────────────────
async function openDocument(documentId: string) {
  try {
    const url = await api.adminViewDocument(documentId);
    window.open(url, "_blank");
  } catch (e) {
    notify("error", (e as ApiError).message || "Impossible d'ouvrir le document.");
  }
}

async function decide(p: AdminPrestataireData, statut: StatutValidation, motif?: string) {
  busy[p.userId] = true;
  try {
    await api.adminDecideValidation(p.userId, statut, motif);
    notify("success",
      statut === "VALIDE"
        ? `${fullName(p)} validé. Le prestataire est notifié.`
        : `${fullName(p)} refusé. Le prestataire est notifié.`);
    await load();
  } catch (e) {
    notify("error", (e as ApiError).message || "Échec de l'opération.");
  } finally {
    busy[p.userId] = false;
  }
}

function reject(p: AdminPrestataireData) {
  const motif = window.prompt("Motif du refus (transmis au prestataire par email) :", "");
  if (motif === null) return; // annulé
  decide(p, "SUSPENDU", motif);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Cartes de synthèse -->
    <div class="grid gap-4 sm:grid-cols-4">
      <StatCard label="En attente"  :value="String(stats?.enAttente ?? '—')" hint="À examiner" />
      <StatCard label="Validés"     :value="String(stats?.valides ?? '—')" />
      <StatCard label="Refusés"     :value="String(stats?.suspendus ?? '—')" />
      <StatCard label="Total"       :value="String(stats?.total ?? '—')" hint="Tous prestataires" />
    </div>

    <!-- Feedback -->
    <p v-if="feedback" :class="[
      'rounded-md px-3 py-2 text-sm font-medium',
      feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    ]">{{ feedback.text }}</p>

    <PanelCard title="Validation des prestataires">
      <!-- Onglets de filtre -->
      <template #action>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="t in TABS"
            :key="t.key"
            type="button"
            @click="switchTab(t.key)"
            :class="[
              'rounded-md px-3 py-1.5 text-sm font-medium transition',
              activeTab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            ]"
          >{{ t.label }}</button>
        </div>
      </template>

      <p v-if="loading" class="text-sm text-muted-foreground">Chargement…</p>
      <p v-else-if="!items.length" class="text-sm text-muted-foreground">
        Aucun prestataire dans cette catégorie.
      </p>

      <div v-else class="divide-y divide-border">
        <div v-for="p in items" :key="p.userId" class="py-3">
          <!-- Ligne principale -->
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium">
                {{ fullName(p) }}
                <span class="text-muted-foreground">· {{ p.categoriePrincipale || p.nomCommercial }}</span>
              </p>
              <p class="text-xs text-muted-foreground">
                {{ p.zoneIntervention || "Zone non renseignée" }} ·
                {{ p.documents.length }} document(s) ·
                {{ p.email }}
              </p>
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <Badge :variant="STATUT_VARIANT[p.statutValidation]">{{ STATUT_LABEL[p.statutValidation] }}</Badge>
              <Button size="sm" variant="outline" @click="expanded[p.userId] = !expanded[p.userId]">
                {{ expanded[p.userId] ? "Masquer" : "Examiner" }}
              </Button>
              <Button
                v-if="p.statutValidation !== 'VALIDE'"
                size="sm" class="bg-gradient-warm text-primary-foreground"
                :disabled="busy[p.userId]"
                @click="decide(p, 'VALIDE')"
              >Valider</Button>
              <Button
                v-if="p.statutValidation !== 'SUSPENDU'"
                size="sm" variant="outline"
                :disabled="busy[p.userId]"
                @click="reject(p)"
              >Refuser</Button>
            </div>
          </div>

          <!-- Détail : documents -->
          <div v-if="expanded[p.userId]" class="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Documents légaux
            </p>
            <ul v-if="p.documents.length" class="space-y-2">
              <li v-for="d in p.documents" :key="d.id" class="flex items-center justify-between text-sm">
                <span>{{ DOC_LABEL[d.type] ?? d.type }}</span>
                <div class="flex items-center gap-2">
                  <Badge :variant="STATUT_VARIANT[d.statut]">{{ STATUT_LABEL[d.statut] }}</Badge>
                  <Button size="sm" variant="outline" @click="openDocument(d.id)">Ouvrir</Button>
                </div>
              </li>
            </ul>
            <p v-else class="text-sm text-muted-foreground">
              Aucun document déposé — le prestataire doit téléverser ses pièces avant validation.
            </p>
          </div>
        </div>
      </div>
    </PanelCard>
  </div>
</template>
