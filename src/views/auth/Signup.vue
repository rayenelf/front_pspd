<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { cn } from "@/lib/utils";
import { registerAccount, type ClientType, type SignupRole } from "@/lib/auth";

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
    </form>
    <template #footer>
      Déjà inscrit ? <RouterLink to="/auth/login" class="font-semibold text-primary hover:underline">Se connecter</RouterLink>
    </template>
  </AuthLayout>
</template>
