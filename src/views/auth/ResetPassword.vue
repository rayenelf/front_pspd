<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { resetPassword } from "@/lib/auth";

const route = useRoute();
const router = useRouter();

const token = computed(() => String(route.query.token ?? ""));
const motDePasse = ref("");
const confirmation = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function submitResetPassword() {
  errorMessage.value = "";
  successMessage.value = "";

  if (!token.value) {
    errorMessage.value = "Le lien de réinitialisation est invalide ou incomplet.";
    return;
  }

  if (motDePasse.value.length < 8) {
    errorMessage.value = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }

  if (motDePasse.value !== confirmation.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await resetPassword({ token: token.value, motDePasse: motDePasse.value });
    successMessage.value = response.message;
    await router.push("/auth/login");
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Une erreur est survenue.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <AuthLayout
    title="Nouveau mot de passe"
    subtitle="Choisissez un mot de passe sécurisé pour retrouver l'accès à votre compte."
  >
    <form class="space-y-4" @submit.prevent="submitResetPassword">
      <div class="space-y-2">
        <Label for="pw">Nouveau mot de passe</Label>
        <Input id="pw" v-model="motDePasse" type="password" placeholder="Minimum 8 caractères" />
      </div>
      <div class="space-y-2">
        <Label for="cpw">Confirmer le mot de passe</Label>
        <Input id="cpw" v-model="confirmation" type="password" placeholder="Retapez le mot de passe" />
      </div>
      <p v-if="errorMessage" class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{{ errorMessage }}</p>
      <p v-else-if="successMessage" class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>
      <Button type="submit" class="w-full bg-gradient-warm text-primary-foreground shadow-glow" :disabled="isSubmitting">
        {{ isSubmitting ? "Réinitialisation…" : "Modifier mon mot de passe" }}
      </Button>
    </form>
    <template #footer>
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Retour à la connexion</RouterLink>
    </template>
  </AuthLayout>
</template>