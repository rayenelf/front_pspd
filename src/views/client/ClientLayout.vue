<script setup lang="ts">
import { RouterView } from "vue-router";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import type { NavItem } from "@/components/dashboard/types";
import { LayoutDashboard, CalendarCheck, Receipt, Heart, User } from "lucide-vue-next";

const items: NavItem[] = [
  { to: "/client", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/client/reservations", label: "Mes réservations", icon: CalendarCheck },
  { to: "/client/factures", label: "Factures", icon: Receipt },
  { to: "/client/favoris", label: "Favoris", icon: Heart },
  { to: "/client/profil", label: "Profil", icon: User },
];
</script>

<template>
  <DashboardShell title="Espace Client" role="Client" :items="items">
    <RouterView />
  </DashboardShell>
</template>
