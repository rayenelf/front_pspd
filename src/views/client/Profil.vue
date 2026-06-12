<script setup lang="ts">
import { ref, reactive } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Button from "@/components/ui/Button.vue";
import Switch from "@/components/ui/Switch.vue";
import SessionsPanel from "@/components/account/SessionsPanel.vue";
import DangerZone from "@/components/account/DangerZone.vue";
import { getCurrentUser, getInitials, getDisplayName } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { api, type ApiError } from "@/lib/api";

const auth = useAuthStore();

// ── Données utilisateur depuis le JWT ──────────────────────────────────────
const user = getCurrentUser();

const form = reactive({
  prenom:  user?.prenom    ?? "",
  nom:     user?.nom       ?? "",
  email:   user?.email     ?? "",
  tel:     (user?.telephone !== "pending" ? user?.telephone : "") ?? "",
  adresse: "",   // table adresses — Phase 2
});

const pwd     = ref("");
const newPwd  = ref("");
const confPwd = ref("");
const pwdSaving  = ref(false);
const pwdMessage = ref<{ type: "success" | "error"; text: string } | null>(null);
const isOAuth = !user?.prenom && !!user?.email; // compte sans mot de passe local (heuristique)

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

const prefs = ref([
  { label: "Emails de confirmation", value: true },
  { label: "SMS de rappel",          value: true },
  { label: "Notifications promo",    value: false },
  { label: "Newsletter mensuelle",   value: true },
]);

// ── Feedback sauvegarde ────────────────────────────────────────────────────
const saving  = ref(false);
const message = ref<{ type: "success" | "error"; text: string } | null>(null);

async function save() {
  saving.value  = true;
  message.value = null;
  try {
    await api.patchMe({
      prenom:    form.prenom    || undefined,
      nom:       form.nom       || undefined,
      telephone: form.tel       || undefined,
    });
    // Rafraîchit le JWT pour que le nom affiché (header) reflète les changements.
    await api.refreshTokens();
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

const initials    = user ? getInitials(user)     : "?";
const displayName = user ? getDisplayName(user)  : "—";

// ── 2FA ────────────────────────────────────────────────────────────────────
const twoFaActive  = ref(false);   // sera sync depuis /api/users/me après B5
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
    twoFaActive.value  = !active;  // rollback
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

      <!-- Informations personnelles -->
      <PanelCard title="Informations personnelles">

        <!-- Avatar + nom -->
        <div class="mb-5 flex items-center gap-4">
          <div class="grid h-16 w-16 place-items-center rounded-full bg-gradient-warm font-display text-xl font-bold text-primary-foreground">
            {{ initials }}
          </div>
          <div>
            <p class="font-semibold text-base">{{ displayName }}</p>
            <p class="text-sm text-muted-foreground">{{ form.email }}</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label>Prénom</Label>
            <Input v-model="form.prenom" placeholder="Votre prénom" />
          </div>
          <div class="space-y-2">
            <Label>Nom</Label>
            <Input v-model="form.nom" placeholder="Votre nom" />
          </div>
          <div class="space-y-2">
            <Label>Email</Label>
            <Input v-model="form.email" type="email" disabled class="opacity-60 cursor-not-allowed" />
          </div>
          <div class="space-y-2">
            <Label>Téléphone</Label>
            <Input v-model="form.tel" placeholder="+212 6 12 34 56 78" />
          </div>
          <div class="space-y-2 sm:col-span-2">
            <Label>Adresse <span class="text-xs text-muted-foreground">(bientôt disponible)</span></Label>
            <Input v-model="form.adresse" placeholder="12 rue des Orangers, Casablanca" disabled class="opacity-60 cursor-not-allowed" />
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
          {{ saving ? "Enregistrement…" : "Enregistrer" }}
        </Button>
      </PanelCard>

      <!-- Sécurité -->
      <PanelCard title="Sécurité">
        <div v-if="isOAuth" class="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Votre compte est lié à un fournisseur (Google/Facebook). Vous pouvez définir
          un mot de passe local ci-dessous (le champ « actuel » n'est pas requis).
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

        <!-- Double authentification -->
        <div class="mt-6 border-t border-border pt-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-sm">Double authentification (2FA)</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                À chaque connexion, un code à 6 chiffres vous sera demandé.
              </p>
            </div>
            <Switch
              v-model="twoFaActive"
              :disabled="twoFaSaving"
              @update:modelValue="toggle2fa"
            />
          </div>
          <p v-if="twoFaMessage" :class="[
            'mt-3 rounded-md px-3 py-2 text-xs font-medium',
            twoFaMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          ]">{{ twoFaMessage.text }}</p>
        </div>
      </PanelCard>

      <!-- Appareils connectés (#3) -->
      <SessionsPanel />

      <!-- Suppression de compte (#6) -->
      <DangerZone />
    </div>

    <!-- Préférences -->
    <PanelCard title="Préférences notifications">
      <div class="space-y-4 text-sm">
        <div v-for="p in prefs" :key="p.label" class="flex items-center justify-between">
          <span>{{ p.label }}</span>
          <Switch v-model="p.value" />
        </div>
      </div>
    </PanelCard>
  </div>
</template>
