import type { Component } from "vue";

// `labelKey` → clé i18n résolue dans DashboardShell via $t.
export type NavItem = { to: string; labelKey: string; icon: Component };
