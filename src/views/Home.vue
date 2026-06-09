<script setup lang="ts">
import SiteShell from "@/components/site/SiteShell.vue";
import Hero from "@/components/site/Hero.vue";
import Stats from "@/components/site/Stats.vue";
import CategoriesGrid from "@/components/site/CategoriesGrid.vue";
import HowItWorks from "@/components/site/HowItWorks.vue";
import Testimonials from "@/components/site/Testimonials.vue";
import ProCTA from "@/components/site/ProCTA.vue";
</script>

<template>
  <SiteShell>
    <Hero />
    <Stats />
    <CategoriesGrid />
    <HowItWorks />
    <Testimonials />
    <ProCTA />
  </SiteShell>
</template>
