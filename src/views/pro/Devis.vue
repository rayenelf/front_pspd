<script setup lang="ts">
// ── Devis prestataire (flow AVEC_DEVIS) ─────────────────────────────────────
// Le prestataire voit les demandes AVEC_DEVIS, consulte les images de travail
// jointes par le client, puis chiffre et envoie un devis (montant + durée +
// conditions). Le client acceptera/refusera de son côté.
import { computed, onMounted, reactive, ref } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Textarea from "@/components/ui/Textarea.vue";
import Label from "@/components/ui/Label.vue";
import { reservationApi } from "@/lib/reservationApi";
import {
  STATUT_DEVIS_LABELS,
  type Reservation,
  type Devis,
  type StatutDevis,
} from "@/lib/reservation";

const demandes = ref<Reservation[]>([]);
const devisParResa = reactive<Record<string, Devis | null>>({});
const loading = ref(true);
const error = ref<string | null>(null);

// Demande actuellement ouverte (consultation images + formulaire devis).
const ouverte = ref<Reservation | null>(null);
const images = ref<{ id: string; src: string }[]>([]);
const imagesLoading = ref(false);
const lightbox = ref<string | null>(null);

const form = reactive<{ montant: string; dureeEstimeeH: string; conditions: string }>({
  montant: "",
  dureeEstimeeH: "",
  conditions: "",
});
const submitting = ref(false);
const formError = ref<string | null>(null);

const stats = computed(() => {
  const all = Object.values(devisParResa).filter((d): d is Devis => d != null);
  return {
    aChiffrer: demandes.value.filter((r) => !devisParResa[r.id]).length,
    envoyes: all.filter((d) => d.statut === "ENVOYE").length,
    acceptes: all.filter((d) => d.statut === "ACCEPTE").length,
    pipeline: all
      .filter((d) => d.statut === "ENVOYE" || d.statut === "ACCEPTE")
      .reduce((s, d) => s + (d.montant ?? 0), 0),
  };
});

function devisVariant(s: StatutDevis): "default" | "secondary" | "destructive" {
  if (s === "ACCEPTE") return "default";
  if (s === "REFUSE") return "destructive";
  return "secondary";
}

async function charger() {
  loading.value = true;
  error.value = null;
  try {
    const missions = await reservationApi.mesMissions();
    demandes.value = missions.filter((m) => m.type === "AVEC_DEVIS");
    // Récupère le devis existant de chaque demande (peut ne pas exister → null).
    await Promise.all(
      demandes.value.map(async (r) => {
        try {
          devisParResa[r.id] = await reservationApi.getDevis(r.id);
        } catch {
          devisParResa[r.id] = null;
        }
      }),
    );
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function ouvrir(r: Reservation) {
  ouverte.value = r;
  formError.value = null;
  form.montant = "";
  form.dureeEstimeeH = "";
  form.conditions = "";
  images.value = [];
  imagesLoading.value = true;
  try {
    const metas = await reservationApi.images(r.id);
    images.value = await Promise.all(
      metas.map(async (m) => ({ id: m.id, src: await reservationApi.imageFileUrl(r.id, m.id) })),
    );
  } catch (e) {
    formError.value = "Impossible de charger les images : " + (e as Error).message;
  } finally {
    imagesLoading.value = false;
  }
}

function fermer() {
  ouverte.value = null;
  lightbox.value = null;
}

async function envoyerDevis() {
  if (!ouverte.value) return;
  const montant = Number(form.montant);
  if (!montant || montant <= 0) {
    formError.value = "Le montant doit être un nombre positif.";
    return;
  }
  submitting.value = true;
  formError.value = null;
  try {
    const devis = await reservationApi.creerDevis(ouverte.value.id, {
      montant,
      dureeEstimeeH: form.dureeEstimeeH ? Number(form.dureeEstimeeH) : null,
      conditions: form.conditions || null,
    });
    devisParResa[ouverte.value.id] = devis;
    fermer();
  } catch (e) {
    formError.value = (e as Error).message;
  } finally {
    submitting.value = false;
  }
}

onMounted(charger);
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-4">
      <StatCard label="À chiffrer" :value="String(stats.aChiffrer)" hint="demandes sans devis" />
      <StatCard label="Devis envoyés" :value="String(stats.envoyes)" />
      <StatCard label="Acceptés" :value="String(stats.acceptes)" />
      <StatCard label="Pipeline" :value="`${stats.pipeline} TND`" />
    </div>

    <PanelCard title="Demandes de devis">
      <p v-if="error" class="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {{ error }}
      </p>

      <p v-if="loading" class="py-6 text-center text-sm text-muted-foreground">Chargement…</p>

      <p v-else-if="demandes.length === 0" class="py-6 text-center text-sm text-muted-foreground">
        Aucune demande de devis pour le moment.
      </p>

      <div v-else class="divide-y divide-border">
        <div v-for="r in demandes" :key="r.id" class="flex items-center justify-between gap-4 py-3">
          <div class="min-w-0">
            <p class="font-mono text-xs text-muted-foreground">{{ r.id.slice(0, 8) }}</p>
            <p class="truncate font-medium">{{ r.description ?? "Demande de devis" }}</p>
            <p class="text-xs text-muted-foreground">
              Prévue le {{ r.dateService }} à {{ r.heureService?.slice(0, 5) }}
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-4">
            <Badge v-if="devisParResa[r.id]" :variant="devisVariant(devisParResa[r.id]!.statut)">
              {{ STATUT_DEVIS_LABELS[devisParResa[r.id]!.statut] }} · {{ devisParResa[r.id]!.montant }} TND
            </Badge>
            <Badge v-else variant="secondary">À chiffrer</Badge>
            <Button size="sm" @click="ouvrir(r)">
              {{ devisParResa[r.id] ? "Consulter" : "Voir & chiffrer" }}
            </Button>
          </div>
        </div>
      </div>
    </PanelCard>

    <!-- Panneau de consultation / chiffrage -->
    <div
      v-if="ouverte"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="fermer"
    >
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
        <div class="mb-4 flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold">Demande de devis</h3>
            <p class="text-xs text-muted-foreground">
              {{ ouverte.dateService }} à {{ ouverte.heureService?.slice(0, 5) }}
            </p>
          </div>
          <Button variant="ghost" size="sm" @click="fermer">Fermer</Button>
        </div>

        <p class="mb-4 rounded-md bg-muted px-3 py-2 text-sm">
          {{ ouverte.description ?? "Aucune description fournie." }}
        </p>

        <!-- Galerie des images de travail -->
        <div class="mb-5">
          <p class="mb-2 text-sm font-medium">Images de travail jointes par le client</p>
          <p v-if="imagesLoading" class="text-sm text-muted-foreground">Chargement des images…</p>
          <p v-else-if="images.length === 0" class="text-sm text-muted-foreground">
            Aucune image jointe.
          </p>
          <div v-else class="flex flex-wrap gap-3">
            <img
              v-for="img in images"
              :key="img.id"
              :src="img.src"
              alt="Image de travail"
              class="h-24 w-24 cursor-pointer rounded-md border border-border object-cover transition-transform hover:scale-105"
              @click="lightbox = img.src"
            />
          </div>
        </div>

        <!-- Formulaire de devis (uniquement si pas encore de devis) -->
        <form v-if="!devisParResa[ouverte.id]" class="space-y-4" @submit.prevent="envoyerDevis">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <Label for="montant">Montant (TND) *</Label>
              <Input id="montant" v-model="form.montant" type="number" placeholder="120" />
            </div>
            <div>
              <Label for="duree">Durée estimée (h)</Label>
              <Input id="duree" v-model="form.dureeEstimeeH" type="number" placeholder="2" />
            </div>
          </div>
          <div>
            <Label for="conditions">Conditions / précisions</Label>
            <Textarea
              id="conditions"
              v-model="form.conditions"
              :rows="3"
              placeholder="Déplacement inclus, fournitures en sus…"
            />
          </div>
          <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
          <div class="flex justify-end gap-2">
            <Button type="button" variant="ghost" @click="fermer">Annuler</Button>
            <Button type="submit" :disabled="submitting">
              {{ submitting ? "Envoi…" : "Envoyer le devis" }}
            </Button>
          </div>
        </form>

        <!-- Devis déjà émis : résumé en lecture seule -->
        <div v-else class="space-y-2 rounded-md border border-border p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Devis envoyé</span>
            <Badge :variant="devisVariant(devisParResa[ouverte.id]!.statut)">
              {{ STATUT_DEVIS_LABELS[devisParResa[ouverte.id]!.statut] }}
            </Badge>
          </div>
          <p class="text-sm">Montant : <strong>{{ devisParResa[ouverte.id]!.montant }} TND</strong></p>
          <p v-if="devisParResa[ouverte.id]!.dureeEstimeeH" class="text-sm">
            Durée estimée : {{ devisParResa[ouverte.id]!.dureeEstimeeH }} h
          </p>
          <p v-if="devisParResa[ouverte.id]!.conditions" class="text-sm text-muted-foreground">
            {{ devisParResa[ouverte.id]!.conditions }}
          </p>
          <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
        </div>
      </div>
    </div>

    <!-- Lightbox image plein écran -->
    <div
      v-if="lightbox"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      @click="lightbox = null"
    >
      <img :src="lightbox" alt="Image de travail" class="max-h-[90vh] max-w-full rounded-lg object-contain" />
    </div>
  </div>
</template>
