<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { cn } from "@/lib/utils";
import { googleSignupUrl } from "@/lib/auth";

const role = ref<"client" | "pro">("client");

function signupWithGoogle() {
  window.location.href = googleSignupUrl(role.value);
}
</script>

<template>
  <AuthLayout
    title="Créer votre compte"
    subtitle="Rejoignez Domivo en moins d'une minute."
  >
    <div class="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
      <button
        v-for="r in (['client', 'pro'] as const)"
        :key="r"
        @click="role = r"
        :class="cn(
          'rounded-md py-2 text-sm font-medium transition',
          role === r ? 'bg-gradient-warm text-primary-foreground shadow-glow' : 'text-foreground/70 hover:bg-muted'
        )"
      >
        {{ r === "client" ? "Je cherche un service" : "Je suis prestataire" }}
      </button>
    </div>
    <form class="space-y-4" @submit.prevent>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2"><Label for="fn">Prénom</Label><Input id="fn" placeholder="Salma" /></div>
        <div class="space-y-2"><Label for="ln">Nom</Label><Input id="ln" placeholder="Bennani" /></div>
      </div>
      <div class="space-y-2"><Label for="em">Email</Label><Input id="em" type="email" placeholder="vous@exemple.ma" /></div>
      <div class="space-y-2"><Label for="ph">Téléphone</Label><Input id="ph" placeholder="+212 6 12 34 56 78" /></div>
      <div v-if="role === 'pro'" class="space-y-2">
        <Label for="metier">Métier</Label>
        <Input id="metier" placeholder="Plombier, électricien, …" />
      </div>
      <div class="space-y-2"><Label for="pw">Mot de passe</Label><Input id="pw" type="password" placeholder="Minimum 8 caractères" /></div>
      <p class="text-xs text-muted-foreground">En continuant, vous acceptez les CGU et notre politique de confidentialité.</p>
      <Button class="w-full bg-gradient-warm text-primary-foreground shadow-glow">
        {{ role === "client" ? "Créer mon compte" : "Devenir prestataire" }}
      </Button>
      <div class="relative py-2 text-center text-xs uppercase text-muted-foreground">
        <span class="absolute inset-0 top-1/2 -z-10 h-px bg-border" />
        <span class="bg-background px-3">ou continuer avec</span>
      </div>
      <Button variant="outline" type="button" class="w-full gap-2" @click="signupWithGoogle">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {{ role === "client" ? "S'inscrire en tant que client avec Google" : "S'inscrire en tant que prestataire avec Google" }}
      </Button>
    </form>
    <template #footer>
      Déjà inscrit ? <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Se connecter</RouterLink>
    </template>
  </AuthLayout>
</template>
