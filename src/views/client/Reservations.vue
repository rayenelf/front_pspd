<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const rows = [
  { id: "RV-1042", service: "Ménage", pro: "Karim B.", date: "12 juin 2026", status: "Confirmé", price: "350" },
  { id: "RV-1039", service: "Plomberie", pro: "Salma T.", date: "14 juin 2026", status: "En attente", price: "—" },
  { id: "RV-1031", service: "Électricité", pro: "Youssef R.", date: "17 juin 2026", status: "Confirmé", price: "480" },
  { id: "RV-1018", service: "Jardinage", pro: "Hicham K.", date: "02 juin 2026", status: "Terminé", price: "260" },
  { id: "RV-1002", service: "Peinture", pro: "Amine L.", date: "20 mai 2026", status: "Annulé", price: "0" },
];

function badgeVariant(s: string) {
  if (s === "Terminé") return "secondary";
  if (s === "Annulé") return "destructive";
  return "default";
}
</script>

<template>
  <PanelCard title="Toutes mes réservations">
    <template #action>
      <Button size="sm" class="bg-gradient-warm text-primary-foreground">Nouvelle réservation</Button>
    </template>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr><th class="py-2">Réf.</th><th>Service</th><th>Prestataire</th><th>Date</th><th>Statut</th><th class="text-right">Montant</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-t border-border">
            <td class="py-3 font-mono text-xs">{{ r.id }}</td>
            <td class="font-medium">{{ r.service }}</td>
            <td>{{ r.pro }}</td>
            <td class="text-muted-foreground">{{ r.date }}</td>
            <td><Badge :variant="badgeVariant(r.status)">{{ r.status }}</Badge></td>
            <td class="text-right">{{ r.price === "—" ? "—" : `${r.price} MAD` }}</td>
            <td class="text-right"><Button variant="ghost" size="sm">Détails</Button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelCard>
</template>
