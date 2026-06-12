<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import { api, type ApiError } from "@/lib/api";

const route = useRoute();

type State = "loading" | "success" | "error";
const state = ref<State>("loading");
const message = ref("");

async function verify() {
  const token = route.query.token as string | undefined;
  if (!token) {
    state.value = "error";
    message.value = "Lien de vérification invalide (token manquant).";
    return;
  }
  try {
    await api.verifyEmail(token);
    state.value = "success";
  } catch (e) {
    state.value = "error";
    message.value = (e as ApiError).message || "Échec de la vérification.";
  }
}

onMounted(verify);
</script>

<template>
  <AuthLayout
    title="Vérification de l'email"
    subtitle="Activation de votre compte Domivo."
  >
    <div class="flex flex-col items-center gap-4 py-4 text-center">
      <template v-if="state === 'loading'">
        <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p class="text-muted-foreground">Vérification en cours…</p>
      </template>

      <template v-else-if="state === 'success'">
        <div class="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl">✓</div>
        <p class="font-semibold text-green-700">Votre email est confirmé !</p>
        <p class="text-sm text-muted-foreground">Vous pouvez maintenant vous connecter.</p>
        <RouterLink to="/auth/login">
          <Button class="bg-gradient-warm text-primary-foreground">Se connecter</Button>
        </RouterLink>
      </template>

      <template v-else>
        <div class="grid h-14 w-14 place-items-center rounded-full bg-red-100 text-2xl">✕</div>
        <p class="font-semibold text-red-700">{{ message }}</p>
        <RouterLink to="/auth/login" class="text-sm text-primary hover:underline">
          Retour à la connexion
        </RouterLink>
      </template>
    </div>
  </AuthLayout>
</template>
