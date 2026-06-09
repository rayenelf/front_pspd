<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

const rows = [
  { id: "M-2104", client: "Imane R.", service: "Plomberie", date: "14 juin", status: "En cours", price: 380 },
  { id: "M-2098", client: "Karim B.", service: "Robinetterie", date: "10 juin", status: "Confirmée", price: 260 },
  { id: "M-2071", client: "Nadia M.", service: "Chauffe-eau", date: "05 juin", status: "Terminée", price: 540 },
  { id: "M-2055", client: "Tarek O.", service: "Fuite cuisine", date: "29 mai", status: "Terminée", price: 320 },
  { id: "M-2031", client: "Houda L.", service: "Installation", date: "20 mai", status: "Annulée", price: 0 },
];

function variant(s: string) {
  if (s === "Annulée") return "destructive";
  if (s === "Terminée") return "secondary";
  return "default";
}
</script>

<template>
  <PanelCard title="Toutes les missions">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr><th class="py-2">Réf.</th><th>Client</th><th>Service</th><th>Date</th><th>Statut</th><th class="text-right">Montant</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-t border-border">
            <td class="py-3 font-mono text-xs">{{ r.id }}</td>
            <td>{{ r.client }}</td>
            <td class="font-medium">{{ r.service }}</td>
            <td class="text-muted-foreground">{{ r.date }}</td>
            <td><Badge :variant="variant(r.status)">{{ r.status }}</Badge></td>
            <td class="text-right">{{ r.price ? `${r.price} MAD` : "—" }}</td>
            <td class="text-right"><Button variant="ghost" size="sm">Ouvrir</Button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelCard>
</template>
