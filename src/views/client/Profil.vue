<script setup lang="ts">
import { ref } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Button from "@/components/ui/Button.vue";
import Switch from "@/components/ui/Switch.vue";

const prefs = ref([
  { label: "Emails de confirmation", value: true },
  { label: "SMS de rappel", value: true },
  { label: "Notifications promo", value: false },
  { label: "Newsletter mensuelle", value: true },
]);

const prenom = ref("Salma");
const nom = ref("Bennani");
const email = ref("salma@domivo.ma");
const tel = ref("+212 6 12 34 56 78");
const adresse = ref("12 rue des Orangers, Casablanca");
const pwd = ref("");
const newPwd = ref("");
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-6">
      <PanelCard title="Informations personnelles">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2"><Label>Prénom</Label><Input v-model="prenom" /></div>
          <div class="space-y-2"><Label>Nom</Label><Input v-model="nom" /></div>
          <div class="space-y-2"><Label>Email</Label><Input v-model="email" /></div>
          <div class="space-y-2"><Label>Téléphone</Label><Input v-model="tel" /></div>
          <div class="space-y-2 sm:col-span-2"><Label>Adresse</Label><Input v-model="adresse" /></div>
        </div>
        <Button class="mt-5 bg-gradient-warm text-primary-foreground">Enregistrer</Button>
      </PanelCard>
      <PanelCard title="Sécurité">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2"><Label>Mot de passe actuel</Label><Input v-model="pwd" type="password" /></div>
          <div class="space-y-2"><Label>Nouveau mot de passe</Label><Input v-model="newPwd" type="password" /></div>
        </div>
        <Button variant="outline" class="mt-5">Mettre à jour</Button>
      </PanelCard>
    </div>
    <PanelCard title="Préférences">
      <div class="space-y-4 text-sm">
        <div v-for="p in prefs" :key="p.label" class="flex items-center justify-between">
          <span>{{ p.label }}</span><Switch v-model="p.value" />
        </div>
      </div>
    </PanelCard>
  </div>
</template>
