<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const reports = [
  { id: "R-220", subj: "Comportement inapproprié", from: "Imane R.", target: "Hicham K.", severity: "Haute", status: "Ouvert" },
  { id: "R-218", subj: "Travail non terminé", from: "Karim B.", target: "Anas L.", severity: "Moyenne", status: "En cours" },
  { id: "R-211", subj: "Litige paiement", from: "Nadia M.", target: "Salma T.", severity: "Haute", status: "Ouvert" },
  { id: "R-205", subj: "Annulation tardive", from: "Tarek O.", target: "Rachid B.", severity: "Basse", status: "Résolu" },
];
</script>

<template>
  <PanelCard title="Signalements">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr><th class="py-2">ID</th><th>Sujet</th><th>De</th><th>Cible</th><th>Sévérité</th><th>Statut</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="r in reports" :key="r.id" class="border-t border-border">
            <td class="py-3 font-mono text-xs">{{ r.id }}</td>
            <td class="font-medium">{{ r.subj }}</td>
            <td>{{ r.from }}</td>
            <td>{{ r.target }}</td>
            <td><Badge :variant="r.severity === 'Haute' ? 'destructive' : 'secondary'">{{ r.severity }}</Badge></td>
            <td><Badge :variant="r.status === 'Résolu' ? 'default' : 'secondary'">{{ r.status }}</Badge></td>
            <td class="text-right"><Button variant="ghost" size="sm">Traiter</Button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelCard>
</template>
