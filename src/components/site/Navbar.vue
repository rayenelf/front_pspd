<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Menu, MapPin } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";

const links = [
  { to: "/services", label: "Services" },
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/devenir-prestataire", label: "Devenir prestataire" },
];

const open = ref(false);
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-warm text-primary-foreground shadow-glow">
          <MapPin class="h-4 w-4" />
        </span>
        Domivo
      </RouterLink>
      <nav class="hidden items-center gap-8 md:flex">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="text-sm font-medium text-foreground/80 transition hover:text-foreground"
          active-class="text-primary"
        >
          {{ l.label }}
        </RouterLink>
      </nav>
      <div class="hidden items-center gap-2 md:flex">
        <RouterLink to="/auth/login">
          <Button variant="ghost" size="sm">Se connecter</Button>
        </RouterLink>
        <RouterLink to="/auth/signup">
          <Button size="sm" class="bg-gradient-warm text-primary-foreground shadow-glow hover:opacity-95">
            S'inscrire
          </Button>
        </RouterLink>
      </div>
      <button
        aria-label="Menu"
        @click="open = !open"
        class="grid h-10 w-10 place-items-center rounded-md border border-border md:hidden"
      >
        <Menu class="h-5 w-5" />
      </button>
    </div>
    <div v-if="open" class="border-t border-border bg-background md:hidden">
      <div class="flex flex-col gap-1 px-4 py-3">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          @click="open = false"
          class="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {{ l.label }}
        </RouterLink>
        <div class="mt-2 flex gap-2">
          <RouterLink to="/auth/login" class="flex-1"><Button variant="outline" class="w-full">Se connecter</Button></RouterLink>
          <RouterLink to="/auth/signup" class="flex-1"><Button class="w-full bg-gradient-warm text-primary-foreground">S'inscrire</Button></RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>
