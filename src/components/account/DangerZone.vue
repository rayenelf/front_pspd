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
      ? "Mot de passe incorrect."
      : err.message || "Échec de la suppression.";
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <PanelCard title="Zone de danger">
    <p class="text-sm text-muted-foreground">
      La suppression de votre compte est définitive. Vos données personnelles
      seront anonymisées et vous serez déconnecté de tous vos appareils.
    </p>

    <div v-if="!confirming" class="mt-4">
      <Button variant="outline" class="border-red-300 text-red-600 hover:bg-red-50" @click="confirming = true">
        Supprimer mon compte
      </Button>
    </div>

    <div v-else class="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50/50 p-4">
      <p class="text-sm font-medium text-red-700">Confirmez la suppression définitive.</p>
      <div class="space-y-2">
        <Label>Mot de passe <span class="text-xs text-muted-foreground">(si compte avec mot de passe)</span></Label>
        <Input v-model="password" type="password" placeholder="••••••••" />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex gap-2">
        <Button
          class="bg-red-600 text-white hover:bg-red-700"
          :disabled="deleting"
          @click="confirmDelete"
        >
          {{ deleting ? "Suppression…" : "Supprimer définitivement" }}
        </Button>
        <Button variant="outline" :disabled="deleting" @click="confirming = false">Annuler</Button>
      </div>
    </div>
  </PanelCard>
</template>
