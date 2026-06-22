<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { api, type ApiError } from "@/lib/api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const token = ref("");
const password = ref("");
const confirm = ref("");
const submitting = ref(false);
const error = ref("");
const done = ref(false);

const tooShort = computed(() => password.value.length > 0 && password.value.length < 8);
const mismatch = computed(() => confirm.value.length > 0 && password.value !== confirm.value);
const canSubmit = computed(() =>
  password.value.length >= 8 && password.value === confirm.value && !!token.value
);

async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  error.value = "";
  try {
    await api.resetPassword(token.value, password.value);
    done.value = true;
  } catch (e) {
    error.value = (e as ApiError).message || t("auth.reset.invalidLink");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  token.value = (route.query.token as string) ?? "";
  if (!token.value) error.value = t("auth.reset.tokenMissing");
});
</script>

<template>
  <AuthLayout
    :title="$t('auth.reset.title')"
    :subtitle="$t('auth.reset.subtitle')"
  >
    <div v-if="done" class="space-y-4 text-center">
      <div class="grid h-14 w-14 mx-auto place-items-center rounded-full bg-green-100 text-2xl">✓</div>
      <p class="font-semibold text-green-700">{{ $t("auth.reset.doneTitle") }}</p>
      <p class="text-sm text-muted-foreground">
        {{ $t("auth.reset.doneText") }}
      </p>
      <RouterLink to="/auth/login">
        <Button class="bg-gradient-warm text-primary-foreground">{{ $t("auth.reset.login") }}</Button>
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div class="space-y-2">
        <Label for="pw">{{ $t("auth.reset.newPassword") }}</Label>
        <Input id="pw" v-model="password" type="password" :placeholder="$t('auth.reset.passwordMin')" />
        <p v-if="tooShort" class="text-xs text-red-600">{{ $t("auth.reset.tooShort") }}</p>
      </div>
      <div class="space-y-2">
        <Label for="cpw">{{ $t("auth.reset.confirm") }}</Label>
        <Input id="cpw" v-model="confirm" type="password" :placeholder="$t('auth.reset.confirmPlaceholder')" />
        <p v-if="mismatch" class="text-xs text-red-600">{{ $t("auth.reset.mismatch") }}</p>
      </div>

      <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

      <Button
        type="submit"
        class="w-full bg-gradient-warm text-primary-foreground shadow-glow"
        :disabled="!canSubmit || submitting"
      >
        {{ submitting ? $t("auth.reset.submitting") : $t("auth.reset.submit") }}
      </Button>
    </form>

    <template #footer>
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">{{ $t("auth.backToLogin") }}</RouterLink>
    </template>
  </AuthLayout>
</template>
