<script setup lang="ts">
import { RouterLink } from "vue-router";
import StatCard from "@/components/dashboard/StatCard.vue";
import PanelCard from "@/components/dashboard/PanelCard.vue";
import Button from "@/components/ui/Button.vue";
import Badge from "@/components/ui/Badge.vue";

// Données de démonstration (remplacées par l'API en prod) ; `statusKey` → i18n.
const bookings = [
  { pro: "Karim B.", service: "Ménage complet", date: "Jeu. 12 juin, 09h", statusKey: "confirmed", price: "350 MAD" },
  { pro: "Salma T.", service: "Plomberie - fuite", date: "Sam. 14 juin, 14h", statusKey: "pending", price: "Devis" },
  { pro: "Youssef R.", service: "Électricité", date: "Mar. 17 juin, 11h", statusKey: "confirmed", price: "480 MAD" },
];

const suggestions = ["Grand nettoyage de printemps", "Entretien climatisation", "Tonte de pelouse", "Peinture chambre"];
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard :label="$t('client.home.statActive')" value="3" :hint="$t('client.home.statActiveHint')" />
      <StatCard :label="$t('client.home.statSpent')" value="1 240 MAD" :hint="$t('client.home.statSpentHint')" />
      <StatCard :label="$t('client.home.statFavorites')" value="7" />
      <StatCard :label="$t('client.home.statReviews')" value="14" :hint="$t('client.home.statReviewsHint')" />
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <PanelCard :title="$t('client.home.nextBookings')">
          <template #action>
            <RouterLink to="/client/reservations"><Button variant="ghost" size="sm">{{ $t("client.home.seeAll") }}</Button></RouterLink>
          </template>
          <div class="space-y-3">
            <div v-for="b in bookings" :key="b.service" class="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p class="font-semibold">{{ b.service }}</p>
                <p class="text-xs text-muted-foreground">{{ b.pro }} · {{ b.date }}</p>
              </div>
              <div class="text-right">
                <Badge :variant="b.statusKey === 'confirmed' ? 'default' : 'secondary'">{{ $t(`status.${b.statusKey}`) }}</Badge>
                <p class="mt-1 text-sm font-semibold">{{ b.price }}</p>
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
      <PanelCard :title="$t('client.home.suggestions')">
        <ul class="space-y-3 text-sm">
          <li v-for="s in suggestions" :key="s" class="flex items-center justify-between rounded-lg border border-border p-3">
            <span>{{ s }}</span><Button size="sm" variant="ghost">{{ $t("client.home.book") }}</Button>
          </li>
        </ul>
      </PanelCard>
    </div>
  </div>
</template>
