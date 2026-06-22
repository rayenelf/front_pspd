<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";
import { Download } from "lucide-vue-next";

// Données de démonstration ; `statusKey` → libellé i18n.
const invoices = [
  { id: "INV-2026-0142", date: "02 juin", amount: 260, statusKey: "paid" },
  { id: "INV-2026-0128", date: "20 mai", amount: 480, statusKey: "paid" },
  { id: "INV-2026-0117", date: "08 mai", amount: 350, statusKey: "paid" },
  { id: "INV-2026-0099", date: "22 avr", amount: 150, statusKey: "refunded" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard :label="$t('client.invoices.statTotal')" value="3 480 MAD" />
      <StatCard :label="$t('client.invoices.statMonth')" value="610 MAD" />
      <StatCard :label="$t('client.invoices.statPayment')" value="•••• 4242" :hint="$t('client.invoices.statPaymentHint')" />
    </div>
    <PanelCard :title="$t('client.invoices.history')">
      <div class="divide-y divide-border">
        <div v-for="i in invoices" :key="i.id" class="flex items-center justify-between py-3">
          <div>
            <p class="font-mono text-xs text-muted-foreground">{{ i.id }}</p>
            <p class="text-sm font-medium">{{ i.date }} 2026</p>
          </div>
          <div class="flex items-center gap-4">
            <Badge :variant="i.statusKey === 'paid' ? 'default' : 'secondary'">{{ $t(`status.${i.statusKey}`) }}</Badge>
            <span class="font-semibold">{{ i.amount }} MAD</span>
            <Button variant="ghost" size="icon"><Download class="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </PanelCard>
  </div>
</template>
