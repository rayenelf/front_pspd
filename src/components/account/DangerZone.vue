<script setup lang="ts">
// Suppression de compte (RGPD, #6).
import { ref } from "vue";
import { useRouter } from "vue-router";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { useAuthStore } from "@/stores/auth";
import { api, type ApiError } from "@/lib/api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const confirming = ref(false);
const password = ref("");
const deleting = ref(false);
const error = ref("");

async function confirmDelete() {
  deleting.value = true;
  error.value = "";
  try {
    await api.deleteAccount(password.value || undefined);
    await auth.logout();
    router.push("/");
  } catch (e) {
    const err = e as ApiError;
    error.value = err.status === 403
      ? t("account.danger.pwdWrong")
      : err.message || t("account.danger.errGeneric");
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <PanelCard :title="$t('account.danger.title')">
    <p class="text-sm text-muted-foreground">
      {{ $t("account.danger.desc") }}
    </p>

    <div v-if="!confirming" class="mt-4">
      <Button variant="outline" class="border-red-300 text-red-600 hover:bg-red-50" @click="confirming = true">
        {{ $t("account.danger.deleteBtn") }}
      </Button>
    </div>

    <div v-else class="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
      <p class="text-sm font-medium text-red-700">{{ $t("account.danger.confirmTitle") }}</p>
      <div class="space-y-2">
        <Label>{{ $t("account.danger.passwordLabel") }} <span class="text-xs text-muted-foreground">{{ $t("account.danger.passwordHint") }}</span></Label>
        <Input v-model="password" type="password" placeholder="••••••••" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex gap-2">
        <Button
          class="bg-red-600 text-white hover:bg-red-700"
          :disabled="deleting"
          @click="confirmDelete"
        >
          {{ deleting ? $t("account.danger.deleting") : $t("account.danger.deleteFinal") }}
        </Button>
        <Button variant="outline" :disabled="deleting" @click="confirming = false">{{ $t("account.danger.cancel") }}</Button>
      </div>
    </div>
  </PanelCard>
</template>
