<script setup lang="ts">
import { RouterView } from "vue-router";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import type { NavItem } from "@/components/dashboard/types";
import { LayoutDashboard, CalendarCheck, Receipt, Heart, User } from "lucide-vue-next";

const items: NavItem[] = [
  { to: "/client", labelKey: "dash.nav.clientOverview", icon: LayoutDashboard },
  { to: "/client/reservations", labelKey: "dash.nav.clientReservations", icon: CalendarCheck },
  { to: "/client/factures", labelKey: "dash.nav.clientInvoices", icon: Receipt },
  { to: "/client/favoris", labelKey: "dash.nav.clientFavorites", icon: Heart },
  { to: "/client/profil", labelKey: "dash.nav.clientProfile", icon: User },
];
</script>

<template>
  <DashboardShell :title="$t('dash.titles.client')" role="Client" :items="items">
    <RouterView />
  </DashboardShell>
</template>
