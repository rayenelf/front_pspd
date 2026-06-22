<script setup lang="ts">
import { RouterView } from "vue-router";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import type { NavItem } from "@/components/dashboard/types";
import { LayoutDashboard, Users, ShieldCheck, Wallet, FileText, Flag } from "lucide-vue-next";

const items: NavItem[] = [
  { to: "/admin", labelKey: "dash.nav.adminOverview", icon: LayoutDashboard },
  { to: "/admin/utilisateurs", labelKey: "dash.nav.adminUsers", icon: Users },
  { to: "/admin/prestataires", labelKey: "dash.nav.adminProviders", icon: ShieldCheck },
  { to: "/admin/finances", labelKey: "dash.nav.adminFinances", icon: Wallet },
  { to: "/admin/contenus", labelKey: "dash.nav.adminContents", icon: FileText },
  { to: "/admin/signalements", labelKey: "dash.nav.adminReports", icon: Flag },
];
</script>

<template>
  <DashboardShell :title="$t('dash.titles.admin')" role="Admin" :items="items">
    <RouterView />
  </DashboardShell>
</template>
