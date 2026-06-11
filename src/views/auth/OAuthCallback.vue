<script setup lang="ts">
// Page de callback OAuth2 — tâche Majd (F3).
// Spring redirige ici après login Google avec ?token=...&refresh=...
// On stocke les tokens, on lit le rôle, puis on redirige vers le bon dashboard.
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const error = ref<string | null>(null);

onMounted(() => {
  const token = route.query.token as string | undefined;
  const refresh = route.query.refresh as string | undefined;

  if (!token || !refresh) {
    error.value = "Connexion Google échouée : tokens manquants.";
    return;
  }

  auth.setSession(token, refresh);
  router.replace(auth.homeRoute);
});
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    <template v-if="!error">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p class="text-muted-foreground">Connexion en cours…</p>
    </template>
    <template v-else>
      <p class="text-destructive">{{ error }}</p>
      <RouterLink to="/auth/login" class="text-primary hover:underline">
        Retour à la connexion
      </RouterLink>
    </template>
  </div>
</template>
