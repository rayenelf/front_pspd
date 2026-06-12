<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { requestPasswordReset } from "@/lib/auth";

const email = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

async function submitForgotPassword() {
  errorMessage.value = "";
  successMessage.value = "";

  if (!email.value.trim()) {
    errorMessage.value = "Email requis.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await requestPasswordReset({ email: email.value.trim() });
    successMessage.value = response.message;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Une erreur est survenue.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <AuthLayout
    title="Mot de passe oublié ?"
    subtitle="Entrez votre email pour recevoir un lien de réinitialisation."
  >
    <form class="space-y-4" @submit.prevent="submitForgotPassword">
      <div class="space-y-2">
        <Label for="em">Email</Label>
        <Input id="em" v-model="email" type="email" placeholder="vous@exemple.ma" />
      </div>
      <p v-if="errorMessage" class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{{ errorMessage }}</p>
      <p v-else-if="successMessage" class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>
      <Button type="submit" class="w-full bg-gradient-warm text-primary-foreground shadow-glow" :disabled="isSubmitting">
        {{ isSubmitting ? "Envoi en cours…" : "Envoyer le lien" }}
      </Button>
    </form>
    <template #footer>
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Retour à la connexion</RouterLink>
    </template>
  </AuthLayout>
</template>
