<script setup lang="ts">
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";
import Button from "@/components/ui/Button.vue";

// Données de démonstration ; `statusKey` → libellé i18n + variante de badge.
const rows = [
  { id: "RV-1042", service: "Ménage", pro: "Karim B.", date: "12 juin 2026", statusKey: "confirmed", price: "350" },
  { id: "RV-1039", service: "Plomberie", pro: "Salma T.", date: "14 juin 2026", statusKey: "pending", price: "—" },
  { id: "RV-1031", service: "Électricité", pro: "Youssef R.", date: "17 juin 2026", statusKey: "confirmed", price: "480" },
  { id: "RV-1018", service: "Jardinage", pro: "Hicham K.", date: "02 juin 2026", statusKey: "completed", price: "260" },
  { id: "RV-1002", service: "Peinture", pro: "Amine L.", date: "20 mai 2026", statusKey: "cancelled", price: "0" },
];

function badgeVariant(s: string) {
  if (s === "completed") return "secondary";
  if (s === "cancelled") return "destructive";
  return "default";
}
</script>

<template>
  <PanelCard :title="$t('client.reservations.title')">
    <template #action>
      <Button size="sm" class="bg-gradient-warm text-primary-foreground">{{ $t("client.reservations.new") }}</Button>
    </template>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs uppercase text-muted-foreground">
          <tr><th class="py-2">{{ $t("client.reservations.ref") }}</th><th>{{ $t("client.reservations.service") }}</th><th>{{ $t("client.reservations.provider") }}</th><th>{{ $t("client.reservations.date") }}</th><th>{{ $t("client.reservations.statusCol") }}</th><th class="text-right">{{ $t("client.reservations.amount") }}</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-t border-border">
            <td class="py-3 font-mono text-xs">{{ r.id }}</td>
            <td class="font-medium">{{ r.service }}</td>
            <td>{{ r.pro }}</td>
            <td class="text-muted-foreground">{{ r.date }}</td>
            <td><Badge :variant="badgeVariant(r.statusKey)">{{ $t(`status.${r.statusKey}`) }}</Badge></td>
            <td class="text-right">{{ r.price === "—" ? "—" : `${r.price} MAD` }}</td>
            <td class="text-right"><Button variant="ghost" size="sm">{{ $t("client.reservations.details") }}</Button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </PanelCard>
</template>
