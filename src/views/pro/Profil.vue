<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Textarea from "@/components/ui/Textarea.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import Switch from "@/components/ui/Switch.vue";
import SessionsPanel from "@/components/account/SessionsPanel.vue";
import DangerZone from "@/components/account/DangerZone.vue";
import { Camera, Trash2, ImagePlus, X } from "lucide-vue-next";
import { getCurrentUser, getInitials, getDisplayName } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { api, type ApiError, type DocumentData, type TypeDocument, type PhotoData,
         type ServiceData, type CategorieData } from "@/lib/api";
import { computed } from "vue";

const auth = useAuthStore();

// ── Données depuis JWT ─────────────────────────────────────────────────────
const user = getCurrentUser();

const userForm = reactive({
  prenom:    user?.prenom    ?? "",
  nom:       user?.nom       ?? "",
  telephone: (user?.telephone !== "pending" ? user?.telephone : "") ?? "",
});

const proForm = reactive({
  nomCommercial:      "",
  categoriePrincipale: "",
  zoneIntervention:   "",
  rayonKm:            10,
  langues:            "",
});

// Statut de validation réel du dossier (chargé depuis /api/prestataires/me).
const statutValidation = ref<string>("EN_ATTENTE");

const STATUT_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  EN_ATTENTE:   { label: "En attente",      variant: "secondary" },
  VERIFICATION: { label: "En vérification", variant: "secondary" },
  VALIDE:       { label: "Validé",          variant: "default" },
  SUSPENDU:     { label: "Refusé",          variant: "destructive" },
};

async function loadProfile() {
  try {
    const p = await api.getMyPrestataireProfile();
    proForm.nomCommercial       = p.nomCommercial ?? "";
    proForm.categoriePrincipale = p.categoriePrincipale ?? "";
    proForm.zoneIntervention    = p.zoneIntervention ?? "";
    proForm.rayonKm             = p.rayonKm ?? 10;
    proForm.langues             = p.langues ?? "";
    statutValidation.value      = p.statutValidation;
    avatarUrl.value             = p.avatarUrl;
  } catch {
    /* silencieux : le formulaire reste éditable même si le chargement échoue */
  }
}

// ── Mes services (sélection dans le catalogue + proposition) ─────────────────
const servicesAvailable  = ref<ServiceData[]>([]);
const selectedServiceIds = ref<string[]>([]);
const pendingServices    = ref<ServiceData[]>([]);
const categories         = ref<CategorieData[]>([]);
const savingServices     = ref(false);
const proposing          = ref(false);
const servicesMessage    = ref<{ type: "success" | "error"; text: string } | null>(null);
const showPropose        = ref(false);

const proposeForm = reactive({ categorieId: "", libelle: "", description: "" });

// Aplatit l'arbre des catégories pour grouper les services et alimenter le <select>.
const flatCategories = computed<{ id: string; libelle: string }[]>(() => {
  const out: { id: string; libelle: string }[] = [];
  const walk = (list: CategorieData[], prefix: string) => {
    for (const c of list) {
      const label = prefix ? `${prefix} › ${c.libelle}` : c.libelle;
      out.push({ id: c.id, libelle: label });
      if (c.enfants?.length) walk(c.enfants, label);
    }
  };
  walk(categories.value, "");
  return out;
});

function categorieLabel(id: string): string {
  return flatCategories.value.find((c) => c.id === id)?.libelle ?? "Autre";
}

// Services approuvés regroupés par catégorie (pour l'affichage en sections).
const servicesByCategorie = computed(() => {
  const groups = new Map<string, ServiceData[]>();
  for (const s of servicesAvailable.value) {
    if (!groups.has(s.categorieId)) groups.set(s.categorieId, []);
    groups.get(s.categorieId)!.push(s);
  }
  return [...groups.entries()].map(([categorieId, services]) => ({
    categorieId,
    libelle: categorieLabel(categorieId),
    services,
  }));
});

async function loadServices() {
  try {
    const [mes, cats] = await Promise.all([api.getMyServices(), api.getCategories()]);
    servicesAvailable.value  = mes.available;
    selectedServiceIds.value = mes.selectedIds;
    pendingServices.value    = mes.pending;
    categories.value         = cats;
  } catch {
    /* silencieux : la section reste utilisable au prochain chargement */
  }
}

async function saveServices() {
  savingServices.value = true;
  servicesMessage.value = null;
  try {
    await api.setMyServices(selectedServiceIds.value);
    servicesMessage.value = { type: "success", text: "Vos services ont été enregistrés." };
  } catch (e) {
    servicesMessage.value = { type: "error", text: (e as ApiError).message || "Échec de l'enregistrement." };
  } finally {
    savingServices.value = false;
  }
}

async function proposeNewService() {
  if (!proposeForm.categorieId || !proposeForm.libelle.trim()) {
    servicesMessage.value = { type: "error", text: "Choisissez une catégorie et un nom de service." };
    return;
  }
  proposing.value = true;
  servicesMessage.value = null;
  try {
    const created = await api.proposeService({
      categorieId: proposeForm.categorieId,
      libelle: proposeForm.libelle.trim(),
      description: proposeForm.description.trim() || undefined,
    });
    pendingServices.value.push(created);
    proposeForm.categorieId = "";
    proposeForm.libelle = "";
    proposeForm.description = "";
    showPropose.value = false;
    servicesMessage.value = {
      type: "success",
      text: "Service proposé — il sera visible après validation par un administrateur.",
    };
  } catch (e) {
    servicesMessage.value = { type: "error", text: (e as ApiError).message || "Échec de la proposition." };
  } finally {
    proposing.value = false;
  }
}

// ── Documents légaux (B9) ───────────────────────────────────────────────────
const openingDoc = ref<string | null>(null);   // id du document en cours d'ouverture

async function openDocument(id: string) {
  openingDoc.value = id;
  try {
    const url = await api.viewMyDocument(id);
    window.open(url, "_blank");
  } catch {
    docMessage.value = { type: "error", text: "Impossible d'ouvrir le document." };
  } finally {
    openingDoc.value = null;
  }
}

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

// ── Photos : avatar + portfolio (publiques) ─────────────────────────────────
const avatarUrl     = ref<string | null>(null);
const avatarSaving  = ref(false);
const photos        = ref<PhotoData[]>([]);
const photoUploading = ref(false);
const PORTFOLIO_MAX = 12;
const photoMessage  = ref<{ type: "success" | "error"; text: string } | null>(null);

const avatarInput = ref<HTMLInputElement | null>(null);
const photoInput  = ref<HTMLInputElement | null>(null);

async function loadPortfolio() {
  try {
    photos.value = await api.getPortfolio();
  } catch {
    /* silencieux */
  }
}

async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  avatarSaving.value = true;
  photoMessage.value = null;
  try {
    const { url } = await api.uploadAvatar(file);
    // Cache-buster pour forcer le rafraîchissement de l'image affichée.
    avatarUrl.value = `${url}?t=${Date.now()}`;
  } catch (err) {
    photoMessage.value = { type: "error", text: (err as ApiError).message || "Échec de l'envoi." };
  } finally {
    avatarSaving.value = false;
    if (avatarInput.value) avatarInput.value.value = "";
  }
}

async function removeAvatar() {
  avatarSaving.value = true;
  try {
    await api.deleteAvatar();
    avatarUrl.value = null;
  } catch (err) {
    photoMessage.value = { type: "error", text: (err as ApiError).message || "Échec de la suppression." };
  } finally {
    avatarSaving.value = false;
  }
}

async function onPhotoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  photoUploading.value = true;
  photoMessage.value = null;
  try {
    const created = await api.addPortfolioPhoto(file);
    photos.value.push(created);
  } catch (err) {
    photoMessage.value = { type: "error", text: (err as ApiError).message || "Échec de l'envoi de la photo." };
  } finally {
    photoUploading.value = false;
    if (photoInput.value) photoInput.value.value = "";
  }
}

async function removePhoto(id: string) {
  try {
    await api.deletePortfolioPhoto(id);
    photos.value = photos.value.filter((p) => p.id !== id);
  } catch (err) {
    photoMessage.value = { type: "error", text: (err as ApiError).message || "Échec de la suppression." };
  }
}

onMounted(() => {
  loadDocuments();
  loadProfile();
  loadPortfolio();
  loadServices();
});

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
    await api.refreshTokens();   // JWT à jour → header reflète le nouveau nom
    auth.refreshFromStorage();
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

// ── Changement de mot de passe ──────────────────────────────────────────────
const pwd     = ref("");
const newPwd  = ref("");
const confPwd = ref("");
const pwdSaving  = ref(false);
const pwdMessage = ref<{ type: "success" | "error"; text: string } | null>(null);
const isOAuth = !user?.prenom && !!user?.email;

async function changePassword() {
  pwdMessage.value = null;
  if (newPwd.value.length < 8) {
    pwdMessage.value = { type: "error", text: "Le nouveau mot de passe doit faire au moins 8 caractères." };
    return;
  }
  if (newPwd.value !== confPwd.value) {
    pwdMessage.value = { type: "error", text: "Les mots de passe ne correspondent pas." };
    return;
  }
  pwdSaving.value = true;
  try {
    await api.changePassword(pwd.value || undefined, newPwd.value);
    pwd.value = ""; newPwd.value = ""; confPwd.value = "";
    pwdMessage.value = { type: "success", text: "Mot de passe mis à jour. Vos autres appareils ont été déconnectés." };
  } catch (e) {
    const err = e as ApiError;
    pwdMessage.value = {
      type: "error",
      text: err.status === 403 ? "Mot de passe actuel incorrect." : (err.message || "Erreur lors du changement."),
    };
  } finally {
    pwdSaving.value = false;
  }
}

const initials    = user ? getInitials(user)    : "?";
const displayName = user ? getDisplayName(user) : "—";

// ── 2FA ────────────────────────────────────────────────────────────────────
const twoFaActive  = ref(false);
const twoFaSaving  = ref(false);
const twoFaMessage = ref<{ type: "success" | "error"; text: string } | null>(null);

// Synchronise l'état réel depuis le backend : sans ça le toggle restait
// toujours sur OFF alors que le 2FA pouvait être actif en base (l'utilisateur
// recevait donc un OTP à chaque connexion tout en voyant « désactivé »).
onMounted(async () => {
  try {
    const me = await api.getMe();
    twoFaActive.value = me.doubleAuthActive;
  } catch {
    /* silencieux : on garde l'état par défaut */
  }
});

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

      <!-- Mes services -->
      <PanelCard title="Mes services">
        <p class="text-sm text-muted-foreground">
          Sélectionnez les services que vous proposez. Vous n'apparaîtrez dans les résultats de
          recherche que pour les services cochés. Un service manquant ? Proposez-le ci-dessous.
        </p>

        <p v-if="servicesMessage" :class="[
          'mt-3 rounded-md px-3 py-2 text-sm font-medium',
          servicesMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]">{{ servicesMessage.text }}</p>

        <!-- Catalogue groupé par catégorie -->
        <div v-if="servicesByCategorie.length" class="mt-5 space-y-5">
          <div v-for="grp in servicesByCategorie" :key="grp.categorieId">
            <p class="mb-2 text-sm font-semibold">{{ grp.libelle }}</p>
            <div class="grid gap-2 sm:grid-cols-2">
              <label
                v-for="s in grp.services"
                :key="s.id"
                class="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-accent"
              >
                <input
                  type="checkbox"
                  :value="s.id"
                  v-model="selectedServiceIds"
                  class="h-4 w-4 rounded border-input"
                />
                <span>{{ s.libelle }}</span>
                <span v-if="s.prixIndicatif" class="ml-auto text-xs text-muted-foreground">
                  dès {{ s.prixIndicatif }} TND
                </span>
              </label>
            </div>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-muted-foreground">Aucun service au catalogue pour le moment.</p>

        <!-- Propositions en attente -->
        <div v-if="pendingServices.length" class="mt-5">
          <p class="mb-2 text-sm font-semibold">En attente de validation</p>
          <div class="flex flex-wrap gap-2">
            <Badge v-for="s in pendingServices" :key="s.id" variant="secondary" class="gap-1">
              {{ s.libelle }} · <span class="text-amber-600">en attente</span>
            </Badge>
          </div>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <Button
            class="bg-gradient-warm text-primary-foreground"
            :disabled="savingServices"
            @click="saveServices"
          >
            {{ savingServices ? "Enregistrement…" : "Enregistrer mes services" }}
          </Button>
          <button
            type="button"
            class="text-sm text-primary underline"
            @click="showPropose = !showPropose"
          >
            {{ showPropose ? "Annuler" : "+ Proposer un nouveau service (Autre)" }}
          </button>
        </div>

        <!-- Formulaire de proposition -->
        <div v-if="showPropose" class="mt-4 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label>Catégorie</Label>
              <select
                v-model="proposeForm.categorieId"
                class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="" disabled>Choisir une catégorie…</option>
                <option v-for="c in flatCategories" :key="c.id" :value="c.id">{{ c.libelle }}</option>
              </select>
            </div>
            <div class="space-y-1.5">
              <Label>Nom du service</Label>
              <Input v-model="proposeForm.libelle" placeholder="Ex: Installation borne de recharge" />
            </div>
          </div>
          <div class="space-y-1.5">
            <Label>Description (optionnel)</Label>
            <Textarea v-model="proposeForm.description" placeholder="Précisez en quoi consiste ce service…" />
          </div>
          <Button variant="outline" :disabled="proposing" @click="proposeNewService">
            {{ proposing ? "Envoi…" : "Soumettre la proposition" }}
          </Button>
        </div>
      </PanelCard>

      <!-- Photos (avatar + portfolio public) -->
      <PanelCard title="Photos & réalisations">
        <p class="text-sm text-muted-foreground">
          Votre photo de profil et vos réalisations sont visibles publiquement par les clients.
          (Indépendant des documents légaux ci-dessous, eux privés.)
        </p>

        <!-- Avatar -->
        <div class="mt-5 flex items-center gap-4">
          <div class="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-warm font-display text-2xl font-bold text-primary-foreground">
            <img v-if="avatarUrl" :src="avatarUrl" alt="Photo de profil" class="h-full w-full object-cover" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="space-y-1">
            <p class="text-sm font-medium">Photo de profil</p>
            <div class="flex gap-2">
              <Button variant="outline" size="sm" :disabled="avatarSaving" @click="avatarInput?.click()">
                <Camera class="mr-1 h-4 w-4" /> {{ avatarUrl ? "Changer" : "Ajouter" }}
              </Button>
              <Button v-if="avatarUrl" variant="ghost" size="sm" class="text-red-600 hover:bg-red-50" :disabled="avatarSaving" @click="removeAvatar">
                <Trash2 class="mr-1 h-4 w-4" /> Supprimer
              </Button>
            </div>
            <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onAvatarChange" />
          </div>
        </div>

        <!-- Portfolio -->
        <div class="mt-6 border-t border-border pt-5">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Mes réalisations</p>
            <span class="text-xs text-muted-foreground">{{ photos.length }}/{{ PORTFOLIO_MAX }}</span>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
            <div
              v-for="p in photos"
              :key="p.id"
              class="group relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img :src="p.url" alt="Réalisation" class="h-full w-full object-cover" loading="lazy" />
              <button
                type="button"
                class="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Supprimer la photo"
                @click="removePhoto(p.id)"
              >
                <X class="h-4 w-4" />
              </button>
            </div>

            <!-- Tuile d'ajout -->
            <button
              v-if="photos.length < PORTFOLIO_MAX"
              type="button"
              :disabled="photoUploading"
              class="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-50"
              @click="photoInput?.click()"
            >
              <span class="flex flex-col items-center gap-1 text-xs">
                <ImagePlus class="h-6 w-6" />
                {{ photoUploading ? "Envoi…" : "Ajouter" }}
              </span>
            </button>
          </div>
          <input ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onPhotoChange" />
        </div>

        <p v-if="photoMessage" :class="[
          'mt-4 rounded-md px-3 py-2 text-sm font-medium',
          photoMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]">{{ photoMessage.text }}</p>
      </PanelCard>

      <!-- Documents -->
      <PanelCard title="Documents & vérification">
        <ul v-if="docs.length" class="space-y-2 text-sm">
          <li
            v-for="d in docs"
            :key="d.id"
            class="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
          >
            <span class="font-medium">{{ typeLabel(d.type) }}</span>
            <div class="flex items-center gap-2">
              <Badge :variant="d.statut === 'VALIDE' ? 'default' : 'secondary'">
                {{ STATUT_LABEL[d.statut] ?? d.statut }}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                :disabled="openingDoc === d.id"
                @click="openDocument(d.id)"
              >
                {{ openingDoc === d.id ? "Ouverture…" : "Voir" }}
              </Button>
            </div>
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

      <!-- Sécurité — mot de passe -->
      <PanelCard title="Sécurité">
        <div v-if="isOAuth" class="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Compte lié à un fournisseur (Google/Facebook). Vous pouvez définir un mot de passe
          local ci-dessous (champ « actuel » non requis).
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-if="!isOAuth" class="space-y-2 sm:col-span-2">
            <Label>Mot de passe actuel</Label>
            <Input v-model="pwd" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div class="space-y-2">
            <Label>Nouveau mot de passe</Label>
            <Input v-model="newPwd" type="password" placeholder="Minimum 8 caractères" autocomplete="new-password" />
          </div>
          <div class="space-y-2">
            <Label>Confirmer</Label>
            <Input v-model="confPwd" type="password" placeholder="Retapez le mot de passe" autocomplete="new-password" />
          </div>
        </div>
        <p v-if="pwdMessage" :class="[
          'mt-3 rounded-md px-3 py-2 text-sm font-medium',
          pwdMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]">{{ pwdMessage.text }}</p>
        <Button variant="outline" class="mt-5" :disabled="pwdSaving" @click="changePassword">
          {{ pwdSaving ? "Mise à jour…" : "Mettre à jour le mot de passe" }}
        </Button>
      </PanelCard>

      <!-- Appareils connectés (#3) -->
      <SessionsPanel />

      <!-- Suppression de compte (#6) -->
      <DangerZone />
    </div>

    <!-- Statut compte -->
    <PanelCard title="Statut compte">
      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between">
          <span>Compte</span><Badge>Actif</Badge>
        </div>
        <div class="flex items-center justify-between">
          <span>Validation</span>
          <Badge :variant="STATUT_BADGE[statutValidation]?.variant ?? 'secondary'">
            {{ STATUT_BADGE[statutValidation]?.label ?? statutValidation }}
          </Badge>
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
