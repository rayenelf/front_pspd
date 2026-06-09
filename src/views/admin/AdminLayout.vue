<script setup lang="ts">
import { RouterView } from "vue-router";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import type { NavItem } from "@/components/dashboard/types";
import { LayoutDashboard, Users, ShieldCheck, Wallet, FileText, Flag } from "lucide-vue-next";

const items: NavItem[] = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
  { to: "/admin/prestataires", label: "Prestataires", icon: ShieldCheck },
  { to: "/admin/finances", label: "Finances", icon: Wallet },
  { to: "/admin/contenus", label: "Contenus", icon: FileText },
  { to: "/admin/signalements", label: "Signalements", icon: Flag },
];
</script>

<template>
  <DashboardShell title="Back-office Admin" role="Admin" :items="items">
    <RouterView />
  </DashboardShell>
</template>
