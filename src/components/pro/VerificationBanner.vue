<script setup lang="ts">
// Bandeau d'alerte affiché en haut de l'espace prestataire tant que le compte
// n'est pas validé ET qu'aucun document légal n'a été déposé.
// Le compte ne peut pas être vérifié sans documents → on invite à les déposer
// via une action rapide vers la page profil.
// La visibilité est pilotée par le parent (ProLayout), qui connaît déjà le statut.
import { useRouter } from "vue-router";
import { AlertTriangle, ArrowRight } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";

defineProps<{ visible: boolean }>();

const router = useRouter();

function goToProfile() {
  router.push("/pro/profil");
}
</script>

<template>
  <div
    v-if="visible"
    class="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
        <AlertTriangle class="h-5 w-5" />
      </span>
      <div>
        <p class="font-semibold text-amber-900">
          Votre compte ne peut pas être vérifié
        </p>
        <p class="text-sm text-amber-800">
          Il manque des documents légaux pour valider votre profil. Déposez vos
          pièces (CIN, patente, assurance…) pour que notre équipe puisse vérifier
          votre compte.
        </p>
      </div>
    </div>
    <Button
      class="shrink-0 gap-2 bg-amber-500 text-white hover:bg-amber-600"
      @click="goToProfile"
    >
      Ajouter mes documents
      <ArrowRight class="h-4 w-4" />
    </Button>
  </div>
</template>
