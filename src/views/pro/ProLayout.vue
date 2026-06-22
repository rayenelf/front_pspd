<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterView } from "vue-router";
import DashboardShell from "@/components/dashboard/DashboardShell.vue";
import VerificationBanner from "@/components/pro/VerificationBanner.vue";
import type { NavItem } from "@/components/dashboard/types";
import { LayoutDashboard, Briefcase, Calendar, FileText, Star, User } from "lucide-vue-next";
import { api } from "@/lib/api";

// Tous les onglets de l'espace prestataire.
const allItems: NavItem[] = [
  { to: "/pro", labelKey: "dash.nav.proDashboard", icon: LayoutDashboard },
  { to: "/pro/missions", labelKey: "dash.nav.proMissions", icon: Briefcase },
  { to: "/pro/agenda", labelKey: "dash.nav.proAgenda", icon: Calendar },
  { to: "/pro/devis", labelKey: "dash.nav.proQuotes", icon: FileText },
  { to: "/pro/avis", labelKey: "dash.nav.proReviews", icon: Star },
  { to: "/pro/profil", labelKey: "dash.nav.proProfile", icon: User },
];

// Tant que le compte n'est pas validé, on limite l'accès aux fonctions « pro » :
// seuls le tableau de bord et le profil (dépôt de documents) sont accessibles.
const LIMITED = new Set(["/pro", "/pro/profil"]);

const validated = ref(true);   // optimiste : on n'affiche pas le bandeau avant le chargement
const needsDocuments = ref(false);

const items = computed(() =>
  validated.value ? allItems : allItems.filter((it) => LIMITED.has(it.to)),
);

onMounted(async () => {
  try {
    const profile = await api.getMyPrestataireProfile();
    validated.value = profile.statutValidation === "VALIDE";
    // Bandeau : dossier non validé ET aucun document déposé.
    needsDocuments.value = !validated.value && profile.nombreDocuments === 0;
  } catch {
    /* silencieux : en cas d'échec on laisse l'accès complet par défaut */
  }
});
</script>

<template>
  <DashboardShell :title="$t('dash.titles.pro')" role="Prestataire" :items="items">
    <VerificationBanner :visible="needsDocuments" />
    <RouterView />
  </DashboardShell>
</template>
