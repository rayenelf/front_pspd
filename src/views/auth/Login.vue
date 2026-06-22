<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { loginAccount, googleLoginUrl, facebookLoginUrl } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Checkbox from "@/components/ui/Checkbox.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const remember = ref(false);
const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

// Email non vérifié → on propose de renvoyer le lien.
const needsVerification = ref(false);
const resending = ref(false);
const resentOk = ref(false);

const router = useRouter();
const auth = useAuthStore();

// OAuth2 Google (F3 — Majd) : redirige vers Spring qui enchaîne vers Google.
function loginWithGoogle() {
  window.location.href = googleLoginUrl();
}

function loginWithFacebook() {
  window.location.href = facebookLoginUrl();
}

async function resendVerification() {
  resending.value = true;
  try {
    await api.resendVerification(email.value.trim());
    resentOk.value = true;
  } catch {
    /* réponse 204 quoi qu'il arrive côté backend */
    resentOk.value = true;
  } finally {
    resending.value = false;
  }
}

async function submitLogin() {
  errorMessage.value = "";
  needsVerification.value = false;
  resentOk.value = false;
  if (!email.value || !password.value) {
    errorMessage.value = t("auth.login.credentialsRequired");
    return;
  }

  isSubmitting.value = true;
  try {
    const resp = await loginAccount({ email: email.value.trim(), motDePasse: password.value });

    // 2FA active → le backend renvoie un challenge, on redirige vers la saisie OTP.
    if (resp.twoFactorRequired) {
      await router.push({ path: "/auth/2fa", query: { email: resp.email } });
      return;
    }

    if (resp.accessToken && resp.refreshToken) {
      auth.setSession(resp.accessToken, resp.refreshToken);
      await router.push(auth.homeRoute);
    } else {
      errorMessage.value = t("auth.login.invalidResponse");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : t("auth.login.genericError");
    if (msg === "EMAIL_NOT_VERIFIED") {
      needsVerification.value = true;
      errorMessage.value = t("auth.login.notVerified");
    } else if (msg === "ACCOUNT_SUSPENDED") {
      errorMessage.value = t("auth.login.suspended");
    } else {
      errorMessage.value = msg;
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <AuthLayout
    :title="$t('auth.login.title')"
    :subtitle="$t('auth.login.subtitle')"
  >
    <form class="space-y-4" @submit.prevent="submitLogin">
      <div class="space-y-2">
        <Label for="email">{{ $t("auth.emailLabel") }}</Label>
        <Input id="email" type="email" v-model="email" :placeholder="$t('auth.emailPlaceholder')" />
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">{{ $t("auth.passwordLabel") }}</Label>
          <RouterLink to="/auth/forgot-password" class="text-xs text-primary hover:underline">{{ $t("auth.login.forgot") }}</RouterLink>
        </div>
        <Input id="password" type="password" v-model="password" placeholder="••••••••" />
      </div>
      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox v-model="remember" /> {{ $t("auth.login.remember") }}
      </label>
      <Button type="submit" class="w-full bg-gradient-warm text-primary-foreground shadow-glow" :disabled="isSubmitting">
        {{ isSubmitting ? $t("auth.login.submitting") : $t("auth.login.submit") }}
      </Button>
      <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

      <!-- Email non vérifié → renvoi du lien -->
      <div v-if="needsVerification" class="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
        <p v-if="!resentOk">
          {{ $t("auth.login.checkInbox") }}
          <button type="button" class="font-semibold underline" :disabled="resending" @click="resendVerification">
            {{ resending ? $t("auth.login.resending") : $t("auth.login.resend") }}
          </button>.
        </p>
        <p v-else>{{ $t("auth.login.resentOk") }}</p>
      </div>

      <div class="relative py-2 text-center text-xs uppercase text-muted-foreground">
        <span class="absolute inset-0 top-1/2 -z-10 h-px bg-border" />
        <span class="bg-background px-3">{{ $t("auth.orContinue") }}</span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" @click="loginWithGoogle" class="gap-2">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </Button>
        <Button variant="outline" type="button" @click="loginWithFacebook" class="gap-2">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" fill="#1877F2"/>
          </svg>
          Facebook
        </Button>
      </div>
    </form>
    <template #footer>
      {{ $t("auth.login.noAccount") }} <RouterLink to="/auth/signup" class="font-semibold text-primary hover:underline">{{ $t("auth.login.createAccount") }}</RouterLink>
    </template>
  </AuthLayout>
</template>
