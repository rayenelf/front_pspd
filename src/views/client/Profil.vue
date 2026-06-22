<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
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
import { useI18n } from "vue-i18n";

const { t } = useI18n();
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
    pwdMessage.value = { type: "error", text: t("client.profile.pwdTooShort") };
    return;
  }
  if (newPwd.value !== confPwd.value) {
    pwdMessage.value = { type: "error", text: t("client.profile.pwdMismatch") };
    return;
  }
  pwdSaving.value = true;
  try {
    await api.changePassword(pwd.value || undefined, newPwd.value);
    pwd.value = ""; newPwd.value = ""; confPwd.value = "";
    pwdMessage.value = { type: "success", text: t("client.profile.pwdSuccess") };
  } catch (e) {
    const err = e as ApiError;
    pwdMessage.value = {
      type: "error",
      text: err.status === 403 ? t("client.profile.pwdWrong") : (err.message || t("client.profile.pwdErrGeneric")),
    };
  } finally {
    pwdSaving.value = false;
  }
}

const prefs = ref([
  { labelKey: "client.profile.prefEmails", value: true },
  { labelKey: "client.profile.prefSms",    value: true },
  { labelKey: "client.profile.prefPromo",  value: false },
  { labelKey: "client.profile.prefNewsletter", value: true },
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
    message.value = { type: "success", text: t("client.profile.saveSuccess") };
  } catch (e) {
    const err = e as ApiError;
    message.value = {
      type: "error",
      text: err.status === 401
        ? t("client.profile.saveErr401")
        : t("client.profile.saveErrGeneric"),
    };
  } finally {
    saving.value = false;
  }
}

const initials    = user ? getInitials(user)     : "?";
const displayName = user ? getDisplayName(user)  : "—";

// ── 2FA ────────────────────────────────────────────────────────────────────
const twoFaActive  = ref(false);

// Synchronise l'état réel depuis le backend (sinon le toggle restait sur OFF
// alors que le 2FA pouvait être actif en base → OTP reçu à chaque connexion).
onMounted(async () => {
  try {
    const me = await api.getMe();
    twoFaActive.value = me.doubleAuthActive;
  } catch {
    /* silencieux : on garde l'état par défaut */
  }
});
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
      text: active ? t("client.profile.twofaOn") : t("client.profile.twofaOff"),
    };
  } catch (e) {
    const err = e as ApiError;
    twoFaActive.value  = !active;  // rollback
    twoFaMessage.value = {
      type: "error",
      text: err.status === 403 || err.status === 401
        ? t("client.profile.twofaErrAuth")
        : t("client.profile.twofaErrGeneric"),
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
      <PanelCard :title="$t('client.profile.personalInfo')">

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
            <Label>{{ $t("client.profile.firstName") }}</Label>
            <Input v-model="form.prenom" :placeholder="$t('client.profile.firstNamePlaceholder')" />
          </div>
          <div class="space-y-2">
            <Label>{{ $t("client.profile.lastName") }}</Label>
            <Input v-model="form.nom" :placeholder="$t('client.profile.lastNamePlaceholder')" />
          </div>
          <div class="space-y-2">
            <Label>{{ $t("client.profile.email") }}</Label>
            <Input v-model="form.email" type="email" disabled class="opacity-60 cursor-not-allowed" />
          </div>
          <div class="space-y-2">
            <Label>{{ $t("client.profile.phone") }}</Label>
            <Input v-model="form.tel" placeholder="+212 6 12 34 56 78" />
          </div>
          <div class="space-y-2 sm:col-span-2">
            <Label>{{ $t("client.profile.address") }} <span class="text-xs text-muted-foreground">{{ $t("client.profile.addressSoon") }}</span></Label>
            <Input v-model="form.adresse" :placeholder="$t('client.profile.addressPlaceholder')" disabled class="opacity-60 cursor-not-allowed" />
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
          {{ saving ? $t("client.profile.saving") : $t("client.profile.save") }}
        </Button>
      </PanelCard>

      <!-- Sécurité -->
      <PanelCard :title="$t('client.profile.security')">
        <div v-if="isOAuth" class="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {{ $t("client.profile.oauthNote") }}
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div v-if="!isOAuth" class="space-y-2 sm:col-span-2">
            <Label>{{ $t("client.profile.currentPassword") }}</Label>
            <Input v-model="pwd" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>
          <div class="space-y-2">
            <Label>{{ $t("client.profile.newPassword") }}</Label>
            <Input v-model="newPwd" type="password" :placeholder="$t('client.profile.newPasswordPlaceholder')" autocomplete="new-password" />
          </div>
          <div class="space-y-2">
            <Label>{{ $t("client.profile.confirm") }}</Label>
            <Input v-model="confPwd" type="password" :placeholder="$t('client.profile.confirmPlaceholder')" autocomplete="new-password" />
          </div>
        </div>

        <p v-if="pwdMessage" :class="[
          'mt-3 rounded-md px-3 py-2 text-sm font-medium',
          pwdMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]">{{ pwdMessage.text }}</p>

        <Button variant="outline" class="mt-5" :disabled="pwdSaving" @click="changePassword">
          {{ pwdSaving ? $t("client.profile.updating") : $t("client.profile.updatePassword") }}
        </Button>

        <!-- Double authentification -->
        <div class="mt-6 border-t border-border pt-5">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-sm">{{ $t("client.profile.twofa") }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                {{ $t("client.profile.twofaDesc") }}
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
    <PanelCard :title="$t('client.profile.prefsTitle')">
      <div class="space-y-4 text-sm">
        <div v-for="p in prefs" :key="p.labelKey" class="flex items-center justify-between">
          <span>{{ $t(p.labelKey) }}</span>
          <Switch v-model="p.value" />
        </div>
      </div>
    </PanelCard>
  </div>
</template>
