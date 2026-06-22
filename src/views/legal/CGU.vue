<script setup lang="ts">
import SiteShell from "@/components/site/SiteShell.vue";
</script>

<template>
  <SiteShell>
    <section class="mx-auto max-w-3xl px-6 py-16">
      <h1 class="font-display text-3xl font-bold">{{ $t("pages.cgu.title") }}</h1>
      <p class="mt-2 text-sm text-muted-foreground">{{ $t("pages.cgu.updated") }}</p>

      <div class="prose mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
        <div>
          <h2 class="font-semibold">{{ $t("pages.cgu.s1Title") }}</h2>
          <p>{{ $t("pages.cgu.s1Body") }}</p>
        </div>
        <div>
          <h2 class="font-semibold">{{ $t("pages.cgu.s2Title") }}</h2>
          <p>{{ $t("pages.cgu.s2Body") }}</p>
        </div>
        <div>
          <h2 class="font-semibold">{{ $t("pages.cgu.s3Title") }}</h2>
          <p>{{ $t("pages.cgu.s3Body") }}</p>
        </div>
        <div>
          <h2 class="font-semibold">{{ $t("pages.cgu.s4Title") }}</h2>
          <p>{{ $t("pages.cgu.s4Body") }}</p>
        </div>
        <p class="text-muted-foreground">{{ $t("pages.cgu.demo") }}</p>
      </div>
    </section>
  </SiteShell>
</template>
