<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { api } from "@/lib/api";

const email = ref("");
const submitting = ref(false);
const sent = ref(false);

async function submit() {
  if (!email.value) return;
  submitting.value = true;
  try {
    await api.forgotPassword(email.value.trim());
  } catch {
    /* réponse 204 quoi qu'il arrive — pas de fuite sur l'existence du compte */
  } finally {
    submitting.value = false;
    sent.value = true; // on affiche toujours le même message
  }
}
</script>

<template>
  <AuthLayout
    title="Mot de passe oublié ?"
    subtitle="Entrez votre email pour recevoir un lien de réinitialisation."
  >
    <div v-if="sent" class="space-y-4 text-center">
      <div class="grid h-14 w-14 mx-auto place-items-center rounded-full bg-green-100 text-2xl">📧</div>
      <p class="text-sm text-muted-foreground">
        Si un compte existe pour <span class="font-medium text-foreground">{{ email }}</span>,
        un lien de réinitialisation vient d'être envoyé. Vérifiez votre boîte mail (et vos spams).
      </p>
      <RouterLink to="/auth/login">
        <Button class="bg-gradient-warm text-primary-foreground">Retour à la connexion</Button>
      </RouterLink>
    </div>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div class="space-y-2">
        <Label for="em">Email</Label>
        <Input id="em" v-model="email" type="email" placeholder="vous@exemple.ma" />
      </div>
      <Button
        type="submit"
        class="w-full bg-gradient-warm text-primary-foreground shadow-glow"
        :disabled="submitting"
      >
        {{ submitting ? "Envoi…" : "Envoyer le lien" }}
      </Button>
    </form>

    <template #footer>
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Retour à la connexion</RouterLink>
    </template>
  </AuthLayout>
</template>
