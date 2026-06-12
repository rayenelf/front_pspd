<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import AuthLayout from "@/components/auth/AuthLayout.vue";
import Button from "@/components/ui/Button.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import { verifyEmailAndCreateAccount, resendEmailVerification } from "@/lib/auth";

const router = useRouter();
const route = useRoute();

const email = ref("");
const code = ref("");
const isSubmitting = ref(false);
const isResending = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const resendMessage = ref("");

// Récupérer l'email depuis les paramètres de route
onMounted(() => {
  const emailParam = route.query.email as string;
  if (emailParam) {
    email.value = emailParam;
  } else {
    // Si pas d'email, rediriger vers l'inscription
    router.push("/auth/signup");
  }
});

async function submitVerification() {
  if (!email.value || !code.value) {
    errorMessage.value = "Veuillez saisir le code de vérification.";
    return;
  }

  if (!/^\d{6}$/.test(code.value)) {
    errorMessage.value = "Le code doit contenir exactement 6 chiffres.";
    return;
  }

  errorMessage.value = "";
  successMessage.value = "";
  isSubmitting.value = true;

  try {
    const result = await verifyEmailAndCreateAccount(email.value, code.value);
    successMessage.value = "Email vérifié ! Votre compte a été créé avec succès.";
    
    // Rediriger vers la page de connexion après 2 secondes
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Code de vérification invalide.";
  } finally {
    isSubmitting.value = false;
  }
}

async function resendCode() {
  if (!email.value) return;

  isResending.value = true;
  resendMessage.value = "";
  errorMessage.value = "";

  try {
    await resendEmailVerification(email.value);
    resendMessage.value = "Un nouveau code a été envoyé à votre adresse email.";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Impossible de renvoyer le code.";
  } finally {
    isResending.value = false;
  }
}

// Auto-focus et formatage du code
function formatCode(event: Event) {
  const input = event.target as HTMLInputElement;
  // Garder seulement les chiffres
  input.value = input.value.replace(/\D/g, "");
  // Limiter à 6 chiffres
  if (input.value.length > 6) {
    input.value = input.value.slice(0, 6);
  }
  code.value = input.value;
}
</script>

<template>
  <AuthLayout
    title="Vérifiez votre email"
    :subtitle="`Nous avons envoyé un code de vérification à ${email}`"
  >
    <div class="space-y-6">
      <!-- Affichage de l'email (non modifiable) -->
      <div class="rounded-lg bg-muted/30 p-4 text-center">
        <p class="text-sm text-muted-foreground mb-2">Code envoyé à :</p>
        <p class="font-medium">{{ email }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="submitVerification">
        <div class="space-y-2">
          <Label for="code">Code de vérification</Label>
          <Input 
            id="code"
            v-model="code"
            @input="formatCode"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="6"
            placeholder="123456"
            class="text-center text-2xl tracking-widest font-mono"
            autocomplete="one-time-code"
          />
          <p class="text-xs text-muted-foreground">
            Saisissez le code à 6 chiffres reçu par email
          </p>
        </div>

        <!-- Messages d'erreur et de succès -->
        <p v-if="errorMessage" class="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {{ errorMessage }}
        </p>
        <p v-else-if="successMessage" class="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {{ successMessage }}
        </p>
        <p v-else-if="resendMessage" class="rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700">
          {{ resendMessage }}
        </p>

        <Button 
          type="submit" 
          class="w-full bg-gradient-warm text-primary-foreground shadow-glow" 
          :disabled="isSubmitting || !code || code.length !== 6"
        >
          {{ isSubmitting ? "Vérification en cours…" : "Vérifier et créer le compte" }}
        </Button>
      </form>

      <!-- Lien pour renvoyer le code -->
      <div class="text-center space-y-3">
        <p class="text-sm text-muted-foreground">
          Vous n'avez pas reçu le code ?
        </p>
        <Button 
          variant="outline" 
          type="button"
          @click="resendCode"
          :disabled="isResending"
          class="w-full"
        >
          {{ isResending ? "Envoi en cours…" : "Renvoyer le code" }}
        </Button>
      </div>

      <!-- Instructions supplémentaires -->
      <div class="rounded-lg bg-muted/20 p-4">
        <h4 class="font-medium mb-2 text-sm">💡 Quelques conseils :</h4>
        <ul class="text-xs text-muted-foreground space-y-1">
          <li>• Vérifiez votre dossier spam/courrier indésirable</li>
          <li>• Le code expire au bout de 10 minutes</li>
          <li>• Vous disposez de 3 tentatives maximum</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <button 
        @click="router.push('/auth/signup')"
        class="text-sm text-primary hover:underline"
      >
        ← Retour à l'inscription
      </button>
    </template>
  </AuthLayout>
</template>