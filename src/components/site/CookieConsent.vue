<script setup lang="ts">
// Bandeau de consentement cookies (cahier des charges §22 — RGPD).
// Le choix est mémorisé dans localStorage ; le bandeau ne réapparaît plus
// tant que l'utilisateur n'a pas réinitialisé son choix.
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import Button from "@/components/ui/Button.vue";

const STORAGE_KEY = "pspd_cookie_consent";
const visible = ref(false);

onMounted(() => {
  visible.value = !localStorage.getItem(STORAGE_KEY);
});

function decide(choice: "accept" | "reject") {
  localStorage.setItem(STORAGE_KEY, choice);
  visible.value = false;
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur"
      role="dialog"
      aria-live="polite"
      aria-label="Consentement aux cookies"
    >
      <div class="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-muted-foreground">
          Nous utilisons des cookies pour améliorer votre expérience et mesurer l'audience.
          En savoir plus dans notre
          <RouterLink to="/confidentialite" class="font-medium text-primary hover:underline">politique de confidentialité</RouterLink>.
        </p>
        <div class="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" @click="decide('reject')">Refuser</Button>
          <Button size="sm" class="bg-gradient-warm text-primary-foreground" @click="decide('accept')">Accepter</Button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
