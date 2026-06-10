<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Checkbox from "@/components/ui/Checkbox.vue";
import { googleLoginUrl } from "@/lib/auth";

const remember = ref(false);

// OAuth2 Google (tâche Majd — F3) : redirige vers Spring qui enchaîne vers Google.
function loginWithGoogle() {
  window.location.href = googleLoginUrl();
}
</script>

<template>
  <AuthLayout
    title="Bon retour 👋"
    subtitle="Connectez-vous pour gérer vos réservations et prestations."
  >
    <form class="space-y-4" @submit.prevent>
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" placeholder="vous@exemple.ma" />
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">Mot de passe</Label>
          <RouterLink to="/auth/forgot-password" class="text-xs text-primary hover:underline">Oublié ?</RouterLink>
        </div>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox v-model="remember" /> Se souvenir de moi
      </label>
      <Button class="w-full bg-gradient-warm text-primary-foreground shadow-glow">Se connecter</Button>
      <div class="relative py-2 text-center text-xs uppercase text-muted-foreground">
        <span class="absolute inset-0 top-1/2 -z-10 h-px bg-border" />
        <span class="bg-background px-3">ou continuer avec</span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" @click="loginWithGoogle">Google</Button>
        <Button variant="outline" type="button">Apple</Button>
      </div>
    </form>
    <template #footer>
      Pas encore de compte ? <RouterLink to="/auth/signup" class="font-semibold text-primary hover:underline">Créer un compte</RouterLink>
    </template>
  </AuthLayout>
</template>
