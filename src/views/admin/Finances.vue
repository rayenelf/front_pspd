<script setup lang="ts">
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Badge from "@/components/ui/Badge.vue";

const tx = [
  { id: "TX-78021", type: "Commission", amount: 35, date: "12/06", status: "OK" },
  { id: "TX-78018", type: "Payout pro", amount: -2400, date: "12/06", status: "OK" },
  { id: "TX-78001", type: "Remboursement", amount: -150, date: "11/06", status: "OK" },
  { id: "TX-77989", type: "Commission", amount: 48, date: "11/06", status: "En attente" },
];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-4">
      <StatCard label="GMV (mois)" value="2.4M MAD" />
      <StatCard label="Commission" value="192k MAD" hint="Take rate 8%" />
      <StatCard label="Payouts à venir" value="142k MAD" />
      <StatCard label="Remboursements" value="3 200 MAD" />
    </div>
    <PanelCard title="Transactions récentes">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-xs uppercase text-muted-foreground">
            <tr><th class="py-2">ID</th><th>Type</th><th>Date</th><th class="text-right">Montant</th><th>Statut</th></tr>
          </thead>
          <tbody>
            <tr v-for="t in tx" :key="t.id" class="border-t border-border">
              <td class="py-3 font-mono text-xs">{{ t.id }}</td>
              <td>{{ t.type }}</td>
              <td class="text-muted-foreground">{{ t.date }}</td>
              <td :class="`text-right font-semibold ${t.amount < 0 ? 'text-destructive' : ''}`">{{ t.amount > 0 ? "+" : "" }}{{ t.amount }} MAD</td>
              <td><Badge :variant="t.status === 'OK' ? 'default' : 'secondary'">{{ t.status }}</Badge></td>
            </tr>
          </tbody>
        </table>
      </div>
    </PanelCard>
  </div>
</template>
