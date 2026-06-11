<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loginAccount } from "@/lib/auth";
import { RouterLink } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Checkbox from "@/components/ui/Checkbox.vue";

const remember = ref(false);
const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const router = useRouter();

async function submitLogin() {
  errorMessage.value = "";
  if (!email.value || !password.value) {
    errorMessage.value = "Email et mot de passe requis.";
    return;
  }

  isSubmitting.value = true;
  try {
    const resp = await loginAccount({ email: email.value.trim(), motDePasse: password.value });
    if (resp.token) localStorage.setItem("pspd_token", resp.token);
    // Redirect based on role
    if (resp.role === "CLIENT") {
      await router.push("/client");
    } else if (resp.role === "PRESTATAIRE") {
      await router.push("/pro");
    } else if (resp.role === "ADMIN" || resp.role === "SUPER_ADMIN") {
      await router.push("/admin");
    } else {
      await router.push("/");
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : "Erreur de connexion.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <AuthLayout
    title="Bon retour 👋"
    subtitle="Connectez-vous pour gérer vos réservations et prestations."
  >
    <form class="space-y-4" @submit.prevent="submitLogin">
      <div class="space-y-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" v-model="email" placeholder="vous@exemple.ma" />
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <Label for="password">Mot de passe</Label>
          <RouterLink to="/auth/forgot-password" class="text-xs text-primary hover:underline">Oublié ?</RouterLink>
        </div>
        <Input id="password" type="password" v-model="password" placeholder="••••••••" />
      </div>
      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox v-model="remember" /> Se souvenir de moi
      </label>
      <Button type="submit" class="w-full bg-gradient-warm text-primary-foreground shadow-glow" :disabled="isSubmitting">
        {{ isSubmitting ? "Connexion…" : "Se connecter" }}
      </Button>
      <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>
      <div class="relative py-2 text-center text-xs uppercase text-muted-foreground">
        <span class="absolute inset-0 top-1/2 -z-10 h-px bg-border" />
        <span class="bg-background px-3">ou continuer avec</span>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button">Google</Button>
        <Button variant="outline" type="button">Apple</Button>
      </div>
    </form>
    <template #footer>
      Pas encore de compte ? <RouterLink to="/auth/signup" class="font-semibold text-primary hover:underline">Créer un compte</RouterLink>
    </template>
  </AuthLayout>
</template>
