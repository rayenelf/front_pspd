<script setup lang="ts">
import SiteShell from "@/components/site/SiteShell.vue";
</script>

<template>
  <SiteShell>
    <section class="mx-auto max-w-3xl px-6 py-16">
      <h1 class="font-display text-3xl font-bold">Politique de confidentialité</h1>
      <p class="mt-2 text-sm text-muted-foreground">Conforme au RGPD — Dernière mise à jour : juin 2026</p>

      <div class="prose mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
        <div>
          <h2 class="font-semibold">1. Données collectées</h2>
          <p>Nous collectons les données fournies à l'inscription (nom, email, téléphone,
            adresse) et, pour les prestataires, les documents légaux nécessaires à la
            vérification.</p>
        </div>
        <div>
          <h2 class="font-semibold">2. Finalités</h2>
          <p>Ces données servent à la mise en relation, au traitement des paiements, à la
            sécurité du compte et au respect de nos obligations légales.</p>
        </div>
        <div>
          <h2 class="font-semibold">3. Consentement et cookies</h2>
          <p>Votre consentement est recueilli à l'inscription (acceptation des CGU) et via le
            bandeau cookies. Vous pouvez modifier vos choix à tout moment.</p>
        </div>
        <div>
          <h2 class="font-semibold">4. Vos droits</h2>
          <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos
            données. La suppression de compte est disponible dans votre profil.</p>
        </div>
        <p class="text-muted-foreground">Document de démonstration — à compléter par le service juridique.</p>
      </div>
    </section>
  </SiteShell>
</template>
