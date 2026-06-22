<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import { api, type ApiError } from "@/lib/api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();

type State = "loading" | "success" | "error";
const state = ref<State>("loading");
const message = ref("");

async function verify() {
  const token = route.query.token as string | undefined;
  if (!token) {
    state.value = "error";
    message.value = t("auth.verifyEmail.invalidToken");
    return;
  }
  try {
    await api.verifyEmail(token);
    state.value = "success";
  } catch (e) {
    state.value = "error";
    message.value = (e as ApiError).message || t("auth.verifyEmail.fail");
  }
}

onMounted(verify);
</script>

<template>
  <AuthLayout
    :title="$t('auth.verifyEmail.title')"
    :subtitle="$t('auth.verifyEmail.subtitle')"
  >
    <div class="flex flex-col items-center gap-4 py-4 text-center">
      <template v-if="state === 'loading'">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p class="text-muted-foreground">{{ $t("auth.verifyEmail.verifying") }}</p>
      </template>

      <template v-else-if="state === 'success'">
        <div class="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl">✓</div>
        <p class="font-semibold text-green-700">{{ $t("auth.verifyEmail.successTitle") }}</p>
        <p class="text-sm text-muted-foreground">{{ $t("auth.verifyEmail.successText") }}</p>
        <RouterLink to="/auth/login">
          <Button class="bg-gradient-warm text-primary-foreground">{{ $t("auth.verifyEmail.login") }}</Button>
        </RouterLink>
      </template>

      <template v-else>
        <div class="grid h-14 w-14 place-items-center rounded-full bg-red-100 text-2xl">✕</div>
        <p class="font-semibold text-red-700">{{ message }}</p>
        <RouterLink to="/auth/login" class="text-sm text-primary hover:underline">
          {{ $t("auth.backToLogin") }}
        </RouterLink>
      </template>
    </div>
  </AuthLayout>
</template>
