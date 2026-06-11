<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Textarea from "@/components/ui/Textarea.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import Switch from "@/components/ui/Switch.vue";
import { getCurrentUser, getInitials, getDisplayName } from "@/lib/auth";
import { api, type ApiError, type DocumentData, type TypeDocument } from "@/lib/api";

// ── Données depuis JWT ─────────────────────────────────────────────────────
const user = getCurrentUser();

const userForm = reactive({
  prenom:    user?.prenom    ?? "",
  nom:       user?.nom       ?? "",
  telephone: (user?.telephone !== "pending" ? user?.telephone : "") ?? "",
});

const proForm = reactive({
  nomCommercial:      "",   // chargé depuis /api/prestataires/me (dès B5)
  categoriePrincipale: "",
  zoneIntervention:   "",
  rayonKm:            10,
  langues:            "",
});

// ── Documents légaux (B9) ───────────────────────────────────────────────────
const DOC_TYPES: { value: TypeDocument; label: string }[] = [
  { value: "CIN",                 label: "Pièce d'identité (CIN)" },
  { value: "PATENTE_RC",          label: "Patente / RC" },
  { value: "ATTESTATION_FISCALE", label: "Attestation fiscale" },
  { value: "ASSURANCE_RC",        label: "Assurance RC pro" },
  { value: "DIPLOME",             label: "Diplôme / certification" },
];

const STATUT_LABEL: Record<string, string> = {
  EN_ATTENTE:   "En attente",
  VERIFICATION: "En vérification",
  VALIDE:       "Validé",
  SUSPENDU:     "Refusé",
};

const docs       = ref<DocumentData[]>([]);
const docType    = ref<TypeDocument>("CIN");
const docFile    = ref<File | null>(null);
const uploading  = ref(false);
const docMessage = ref<{ type: "success" | "error"; text: string } | null>(null);

function typeLabel(t: string) {
  return DOC_TYPES.find((d) => d.value === t)?.label ?? t;
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  docFile.value = target.files?.[0] ?? null;
}

async function loadDocuments() {
  try {
    docs.value = await api.getDocuments();
  } catch {
    /* silencieux : l'utilisateur verra l'erreur à l'upload si besoin */
  }
}

async function uploadDoc() {
  if (!docFile.value) {
    docMessage.value = { type: "error", text: "Choisissez un fichier." };
    return;
  }
  uploading.value  = true;
  docMessage.value = null;
  try {
    const created = await api.uploadDocument(docType.value, docFile.value);
    docs.value.push(created);
    docFile.value    = null;
    docMessage.value = { type: "success", text: "Document déposé — en attente de validation." };
  } catch (e) {
    const err = e as ApiError;
    docMessage.value = { type: "error", text: err.message || "Échec de l'envoi du document." };
  } finally {
    uploading.value = false;
  }
}

onMounted(loadDocuments);

// ── Feedback ───────────────────────────────────────────────────────────────
const saving  = ref(false);
const message = ref<{ type: "success" | "error"; text: string } | null>(null);

async function save() {
  saving.value  = true;
  message.value = null;
  try {
    await Promise.all([
      api.patchMe({
        prenom:    userForm.prenom    || undefined,
        nom:       userForm.nom       || undefined,
        telephone: userForm.telephone || undefined,
      }),
      api.patchPrestataire({
        nomCommercial:       proForm.nomCommercial       || undefined,
        categoriePrincipale: proForm.categoriePrincipale || undefined,
        zoneIntervention:    proForm.zoneIntervention    || undefined,
        rayonKm:             proForm.rayonKm             || undefined,
        langues:             proForm.langues             || undefined,
      }),
    ]);
    message.value = { type: "success", text: "Profil mis à jour avec succès." };
  } catch (e) {
    const err = e as ApiError;
    message.value = {
      type: "error",
      text: err.status === 401
        ? "Session expirée — reconnectez-vous."
        : "Erreur lors de la sauvegarde. Réessayez.",
    };
  } finally {
    saving.value = false;
  }
}

const initials    = user ? getInitials(user)    : "?";
const displayName = user ? getDisplayName(user) : "—";

// ── 2FA ────────────────────────────────────────────────────────────────────
const twoFaActive  = ref(false);
const twoFaSaving  = ref(false);
const twoFaMessage = ref<{ type: "success" | "error"; text: string } | null>(null);

async function toggle2fa(active: boolean) {
  twoFaSaving.value  = true;
  twoFaMessage.value = null;
  try {
    await api.toggle2fa(active);
    twoFaActive.value  = active;
    twoFaMessage.value = {
      type: "success",
      text: active ? "Double authentification activée." : "Double authentification désactivée.",
    };
  } catch (e) {
    const err = e as ApiError;
    twoFaActive.value  = !active;
    twoFaMessage.value = {
      type: "error",
      text: err.status === 403 || err.status === 401
        ? "Reconnectez-vous pour modifier ce paramètre."
        : "Erreur lors de la modification. Réessayez.",
    };
  } finally {
    twoFaSaving.value = false;
  }
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-6">

      <!-- Infos personnelles -->
      <PanelCard title="Informations personnelles">
        <div class="mb-5 flex items-center gap-4">
          <div class="grid h-16 w-16 place-items-center rounded-full bg-gradient-warm font-display text-xl font-bold text-primary-foreground">
            {{ initials }}
          </div>
          <div>
            <p class="font-semibold text-base">{{ displayName }}</p>
            <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>Prénom</Label>
            <Input v-model="userForm.prenom" placeholder="Votre prénom" />
          </div>
          <div class="space-y-2">
            <Label>Nom</Label>
            <Input v-model="userForm.nom" placeholder="Votre nom" />
          </div>
          <div class="space-y-2 sm:col-span-2">
            <Label>Téléphone</Label>
            <Input v-model="userForm.telephone" placeholder="+212 6 12 34 56 78" />
          </div>
        </div>
      </PanelCard>

      <!-- Profil professionnel -->
      <PanelCard title="Profil professionnel">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>Nom commercial</Label>
            <Input v-model="proForm.nomCommercial" placeholder="Ex: Plomberie Rapide" />
          </div>
          <div class="space-y-2">
            <Label>Métier / Spécialité</Label>
            <Input v-model="proForm.categoriePrincipale" placeholder="Plombier, électricien…" />
          </div>
          <div class="space-y-2">
            <Label>Zone d'intervention</Label>
            <Input v-model="proForm.zoneIntervention" placeholder="Ex: Casablanca" />
          </div>
          <div class="space-y-2">
            <Label>Rayon (km)</Label>
            <Input v-model.number="proForm.rayonKm" type="number" min="1" max="200" />
          </div>
          <div class="space-y-2 sm:col-span-2">
            <Label>Langues parlées</Label>
            <Input v-model="proForm.langues" placeholder="Arabe, Français, Anglais" />
          </div>
        </div>

        <!-- Feedback -->
        <p v-if="message" :class="[
          'mt-3 rounded-md px-3 py-2 text-sm font-medium',
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]">{{ message.text }}</p>

        <Button
          class="mt-5 bg-gradient-warm text-primary-foreground"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? "Enregistrement…" : "Enregistrer les modifications" }}
        </Button>
      </PanelCard>

      <!-- Documents -->
      <PanelCard title="Documents & vérification">
        <ul v-if="docs.length" class="space-y-2 text-sm">
          <li
            v-for="d in docs"
            :key="d.id"
            class="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <span>{{ typeLabel(d.type) }}</span>
            <Badge :variant="d.statut === 'VALIDE' ? 'default' : 'secondary'">
              {{ STATUT_LABEL[d.statut] ?? d.statut }}
            </Badge>
          </li>
        </ul>
        <p v-else class="text-sm text-muted-foreground">Aucun document déposé pour le moment.</p>

        <!-- Dépôt d'un document -->
        <div class="mt-4 space-y-3 border-t border-border pt-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <Label>Type de document</Label>
              <select
                v-model="docType"
                class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <option v-for="t in DOC_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label>Fichier</Label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                class="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
                @change="onFileChange"
              />
            </div>
          </div>

          <p v-if="docMessage" :class="[
            'rounded-md px-3 py-2 text-sm font-medium',
            docMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          ]">{{ docMessage.text }}</p>

          <Button
            class="bg-gradient-warm text-primary-foreground"
            :disabled="uploading"
            @click="uploadDoc"
          >
            {{ uploading ? "Envoi…" : "Déposer le document" }}
          </Button>
        </div>
      </PanelCard>
    </div>

    <!-- Statut compte -->
    <PanelCard title="Statut compte">
      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span>Compte</span><Badge>Actif</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span>Validation</span><Badge variant="secondary">En attente</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span>Email</span>
          <span class="max-w-[140px] truncate text-right text-muted-foreground text-xs">{{ user?.email }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>Rôle</span><Badge variant="secondary">Prestataire</Badge>
        </div>
      </div>

      <!-- 2FA -->
      <div class="mt-4 border-t border-border pt-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium">Double auth. (2FA)</p>
            <p class="text-xs text-muted-foreground mt-0.5">Code OTP à chaque connexion</p>
          </div>
          <Switch
            v-model="twoFaActive"
            :disabled="twoFaSaving"
            @update:modelValue="toggle2fa"
          />
        </div>
        <p v-if="twoFaMessage" :class="[
          'mt-2 rounded px-2 py-1.5 text-xs font-medium',
          twoFaMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]">{{ twoFaMessage.text }}</p>
      </div>
    </PanelCard>
  </div>
</template>
