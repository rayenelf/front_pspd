<script setup lang="ts">
import { RouterView } from "vue-router";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import type { NavItem } from "@/components/dashboard/types";
import { LayoutDashboard, Briefcase, Calendar, FileText, Star, User } from "lucide-vue-next";

const items: NavItem[] = [
  { to: "/pro", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/pro/missions", label: "Missions", icon: Briefcase },
  { to: "/pro/agenda", label: "Agenda", icon: Calendar },
  { to: "/pro/devis", label: "Devis", icon: FileText },
  { to: "/pro/avis", label: "Avis clients", icon: Star },
  { to: "/pro/profil", label: "Profil pro", icon: User },
];
</script>

<template>
  <DashboardShell title="Espace Prestataire" role="Prestataire" :items="items">
    <RouterView />
  </DashboardShell>
</template>
