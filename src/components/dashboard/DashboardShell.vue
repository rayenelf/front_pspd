<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { MapPin, LogOut } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button.vue";
import type { NavItem } from "./types";
import { useAuthStore } from "@/stores/auth";

const props = defineProps<{
  title: string;
  role: "Client" | "Prestataire" | "Admin";
  items: NavItem[];
}>();

const route  = useRoute();
const router = useRouter();
const pathname = computed(() => route.path);

const auth = useAuthStore();
const { displayName, initials, email } = storeToRefs(auth);


function isActive(to: string) {
  const lower = "/" + props.role.toLowerCase();
  return pathname.value === to || (to !== lower && pathname.value.startsWith(to));
}

function logout() {
  auth.logout();
  router.push("/auth/login");
}
</script>

<template>
  <div class="flex min-h-screen bg-muted/30">
    <aside class="hidden w-64 shrink-0 flex-col border-r border-border bg-background lg:flex">
      <div class="flex h-16 items-center gap-2 border-b border-border px-5 font-display text-lg font-bold">
        <span class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-warm text-primary-foreground shadow-glow">
          <MapPin class="h-4 w-4" />
        </span>
        Domivo
      </div>
      <div class="px-5 py-4">
        <p class="text-xs uppercase tracking-wider text-muted-foreground">Espace</p>
        <p class="font-display text-base font-semibold">{{ role }}</p>
      </div>
      <nav class="flex-1 space-y-1 px-3">
        <RouterLink
          v-for="it in items"
          :key="it.to"
          :to="it.to"
          :class="cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
            isActive(it.to) ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-muted hover:text-foreground'
          )"
        >
          <component :is="it.icon" class="h-4 w-4" />
          {{ it.label }}
        </RouterLink>
      </nav>
      <div class="border-t border-border p-3">
        <Button variant="ghost" size="sm" class="w-full justify-start gap-2" @click="logout">

          <LogOut class="h-4 w-4" /> Déconnexion
        </Button>
      </div>
    </aside>
    <div class="flex flex-1 flex-col">
      <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-8">
        <div>
          <p class="text-xs text-muted-foreground">{{ role }}</p>
          <h1 class="font-display text-lg font-bold">{{ title }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <div class="hidden text-right sm:block">
            <p class="text-sm font-medium">{{ displayName }}</p>
            <p class="text-xs text-muted-foreground">{{ email }}</p>
          </div>
          <div class="grid h-10 w-10 place-items-center rounded-full bg-gradient-warm font-display text-sm font-bold text-primary-foreground">
            {{ initials }}
          </div>
        </div>
      </header>
      <nav class="flex gap-1 overflow-x-auto border-b border-border bg-background px-2 py-2 lg:hidden">
        <RouterLink
          v-for="it in items"
          :key="it.to"
          :to="it.to"
          :class="cn(
            'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium',
            pathname === it.to ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-muted'
          )"
        >
          {{ it.label }}
        </RouterLink>
      </nav>
      <main class="flex-1 px-4 py-6 sm:px-8 sm:py-8"><slot /></main>
    </div>
  </div>
</template>
