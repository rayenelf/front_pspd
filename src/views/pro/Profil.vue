<script setup lang="ts">
import { ref } from "vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Input from "@/components/ui/Input.vue";
import Label from "@/components/ui/Label.vue";
import Textarea from "@/components/ui/Textarea.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";

const nom = ref("Karim B.");
const metier = ref("Plombier");
const tarif = ref("200");
const zone = ref("Casablanca + 30 km");
const bio = ref("15 ans d'expérience, interventions rapides 7j/7. Garantie satisfaction.");

const docs: [string, string][] = [
  ["Pièce d'identité", "Vérifiée"],
  ["Attestation RC pro", "Vérifiée"],
  ["Certificat de qualification", "En attente"],
  ["RIB", "Vérifié"],
];
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="lg:col-span-2 space-y-6">
      <PanelCard title="Profil professionnel">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2"><Label>Nom affiché</Label><Input v-model="nom" /></div>
          <div class="space-y-2"><Label>Métier</Label><Input v-model="metier" /></div>
          <div class="space-y-2"><Label>Tarif horaire (MAD)</Label><Input v-model="tarif" /></div>
          <div class="space-y-2"><Label>Zone d'intervention</Label><Input v-model="zone" /></div>
          <div class="space-y-2 sm:col-span-2"><Label>Bio</Label><Textarea :rows="4" v-model="bio" /></div>
        </div>
        <Button class="mt-5 bg-gradient-warm text-primary-foreground">Enregistrer</Button>
      </PanelCard>
      <PanelCard title="Documents & vérification">
        <ul class="space-y-2 text-sm">
          <li v-for="[l, s] in docs" :key="l" class="flex items-center justify-between rounded-lg border border-border p-3">
            <span>{{ l }}</span><Badge :variant="s === 'En attente' ? 'secondary' : 'default'">{{ s }}</Badge>
          </li>
        </ul>
      </PanelCard>
    </div>
    <PanelCard title="Statut compte">
      <div class="space-y-3 text-sm">
        <div class="flex items-center justify-between"><span>Compte</span><Badge>Actif</Badge></div>
        <div class="flex items-center justify-between"><span>Niveau</span><Badge variant="secondary">Elite</Badge></div>
        <div class="flex items-center justify-between"><span>Visibilité</span><Badge>Top recherche</Badge></div>
        <div class="flex items-center justify-between"><span>Membre depuis</span><span class="text-muted-foreground">Jan 2024</span></div>
      </div>
    </PanelCard>
  </div>
</template>
