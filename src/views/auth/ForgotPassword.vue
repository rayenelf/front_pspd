<script setup lang="ts">
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
</script>

<template>
  <AuthLayout
    title="Mot de passe oublié ?"
    subtitle="Entrez votre email pour recevoir un lien de réinitialisation."
  >
    <form class="space-y-4" @submit.prevent>
      <div class="space-y-2"><Label for="em">Email</Label><Input id="em" type="email" placeholder="vous@exemple.ma" /></div>
      <Button class="w-full bg-gradient-warm text-primary-foreground shadow-glow">Envoyer le lien</Button>
    </form>
    <template #footer>
      <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Retour à la connexion</RouterLink>
    </template>
  </AuthLayout>
</template>
