<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { cn } from "@/lib/utils";
import { registerAccount, googleSignupUrl, facebookSignupUrl, type ClientType, type SignupRole } from "@/lib/auth";

const router = useRouter();

const role = ref<SignupRole>("CLIENT");
const form = reactive({
  type: "PARTICULIER" as ClientType,
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  motDePasse: "",
  confirmation: "",
  raisonSociale: "",
  matriculeFiscal: "",
  nomCommercial: "",
  categoriePrincipale: "",
});

const isPrestataire = computed(() => role.value === "PRESTATAIRE");
const isEntreprise = computed(() => form.type === "ENTREPRISE");

const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// OAuth2 Google (F3 — Majd) : convertit le rôle CLIENT/PRESTATAIRE → client/pro.
function signupWithGoogle() {
  window.location.href = googleSignupUrl(role.value === "PRESTATAIRE" ? "pro" : "client");
}

function signupWithFacebook() {
  window.location.href = facebookSignupUrl(role.value === "PRESTATAIRE" ? "pro" : "client");
}

async function submitSignup() {
  errorMessage.value = "";
  successMessage.value = "";

  if (form.motDePasse.length < 8) {
    errorMessage.value = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }

  if (form.motDePasse !== form.confirmation) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  isSubmitting.value = true;

  try {
    await registerAccount({
      role: role.value,
      type: form.type,
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
      motDePasse: form.motDePasse,
      raisonSociale: isEntreprise.value ? form.raisonSociale.trim() : undefined,
      matriculeFiscal: isEntreprise.value ? form.matriculeFiscal.trim() : undefined,
      nomCommercial: isPrestataire.value ? form.nomCommercial.trim() : undefined,
      categoriePrincipale: isPrestataire.value ? form.categoriePrincipale.trim() || undefined : undefined,
    });

    successMessage.value = "Compte créé. Vérifie tes messages pour poursuivre la validation.";
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
    title="Créer votre compte"
    subtitle="Rejoignez Domivo en moins d'une minute."
  >
    <div class="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-border p-1">
      <button
        v-for="r in (['client', 'pro'] as const)"
        :key="r"
        type="button"
        @click="role = r === 'client' ? 'CLIENT' : 'PRESTATAIRE'"
        :class="cn(
          'rounded-md py-2 text-sm font-medium transition',
          ((r === 'client' && role === 'CLIENT') || (r === 'pro' && role === 'PRESTATAIRE'))
            ? 'bg-gradient-warm text-primary-foreground shadow-glow'
            : 'text-foreground/70 hover:bg-muted'
        )"
      >
        {{ r === "client" ? "Je cherche un service" : "Je suis prestataire" }}
      </button>
    </div>
    <form class="space-y-4" @submit.prevent="submitSignup">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2"><Label for="fn">Prénom</Label><Input id="fn" v-model="form.prenom" autocomplete="given-name" placeholder="Salma" /></div>
        <div class="space-y-2"><Label for="ln">Nom</Label><Input id="ln" v-model="form.nom" autocomplete="family-name" placeholder="Bennani" /></div>
      </div>
      <div class="space-y-2"><Label for="em">Email</Label><Input id="em" v-model="form.email" type="email" autocomplete="email" placeholder="vous@exemple.ma" /></div>
      <div class="space-y-2"><Label for="ph">Téléphone</Label><Input id="ph" v-model="form.telephone" autocomplete="tel" placeholder="+212 6 12 34 56 78" /></div>
      <div class="space-y-2">
        <Label for="type">Type de compte</Label>
        <select
          id="type"
          v-model="form.type"
          class="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <option value="PARTICULIER">Particulier</option>
          <option value="ENTREPRISE">Entreprise</option>
        </select>
      </div>
      <div v-if="isEntreprise" class="grid gap-3 sm:grid-cols-2">
        <div class="space-y-2"><Label for="rs">Raison sociale</Label><Input id="rs" v-model="form.raisonSociale" placeholder="Société Atlas" /></div>
        <div class="space-y-2"><Label for="mf">Matricule fiscal</Label><Input id="mf" v-model="form.matriculeFiscal" placeholder="1234567P" /></div>
      </div>
      <div v-if="isPrestataire" class="space-y-2">
        <Label for="mc">Nom commercial</Label>
        <Input id="mc" v-model="form.nomCommercial" placeholder="ElecPro" />
      </div>
      <div v-if="isPrestataire" class="space-y-2">
        <Label for="cp">Catégorie principale</Label>
        <Input id="cp" v-model="form.categoriePrincipale" placeholder="Électricité, plomberie, nettoyage…" />
      </div>
      <div class="space-y-2"><Label for="pw">Mot de passe</Label><Input id="pw" v-model="form.motDePasse" type="password" autocomplete="new-password" placeholder="Minimum 8 caractères" /></div>
      <div class="space-y-2"><Label for="cpw">Confirmer le mot de passe</Label><Input id="cpw" v-model="form.confirmation" type="password" autocomplete="new-password" placeholder="Retapez le mot de passe" /></div>
      <p v-if="errorMessage" class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{{ errorMessage }}</p>
      <p v-else-if="successMessage" class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">{{ successMessage }}</p>
      <p class="text-xs text-muted-foreground">En continuant, vous acceptez les CGU et notre politique de confidentialité.</p>
      <Button type="submit" class="w-full bg-gradient-warm text-primary-foreground shadow-glow" :disabled="isSubmitting">
        {{ isSubmitting ? "Création en cours…" : role === "CLIENT" ? "Créer mon compte" : "Devenir prestataire" }}
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
      {{ role === "CLIENT" ? "S'inscrire en tant que client avec Google" : "S'inscrire en tant que prestataire avec Google" }}      </Button>
      <Button variant="outline" type="button" class="w-full gap-2" @click="signupWithFacebook">
        <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.01 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.08 24 18.09 24 12.07z" fill="#1877F2"/>
        </svg>
        Continuer avec Facebook
      </Button>
    </form>
    <template #footer>
      Déjà inscrit ? <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Se connecter</RouterLink>
    </template>
  </AuthLayout>
</template>
