<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { cn } from "@/lib/utils";

const role = ref<"client" | "pro">("client");
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
    </form>
    <template #footer>
      Déjà inscrit ? <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Se connecter</RouterLink>
    </template>
  </AuthLayout>
</template>
