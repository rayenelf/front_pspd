<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";

const categories = ["Ménage", "Plomberie", "Électricité", "Jardinage", "Peinture", "Climatisation", "Serrurerie", "Déménagement"];
const articles = [
  { title: "Comment choisir un bon plombier ?", status: "Publié", date: "10/06" },
  { title: "Guide ménage de printemps", status: "Brouillon", date: "08/06" },
  { title: "Tarifs moyens électricien 2026", status: "Publié", date: "01/06" },
];
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <PanelCard title="Catégories de services">
      <template #action>
        <Button size="sm" class="bg-gradient-warm text-primary-foreground">+ Ajouter</Button>
      </template>
      <div class="flex flex-wrap gap-2">
        <Badge v-for="c in categories" :key="c" variant="secondary" class="px-3 py-1.5">{{ c }}</Badge>
      </div>
    </PanelCard>
    <PanelCard title="Blog & articles">
      <template #action>
        <Button size="sm" variant="outline">Nouvel article</Button>
      </template>
      <ul class="divide-y divide-border">
        <li v-for="a in articles" :key="a.title" class="flex items-center justify-between py-3">
          <div>
            <p class="font-medium">{{ a.title }}</p>
            <p class="text-xs text-muted-foreground">{{ a.date }}</p>
          </div>
          <Badge :variant="a.status === 'Publié' ? 'default' : 'secondary'">{{ a.status }}</Badge>
        </li>
      </ul>
    </PanelCard>
  </div>
</template>
