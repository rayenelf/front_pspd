<script setup lang="ts">
import { Star } from "lucide-vue-next";
import Button from "@/components/ui/Button.vue";

const pros = [
  { name: "Karim B.", job: "Ménage", rating: 4.9, jobs: 142, price: "120 MAD/h" },
  { name: "Salma T.", job: "Plomberie", rating: 4.8, jobs: 88, price: "200 MAD/h" },
  { name: "Youssef R.", job: "Électricité", rating: 5.0, jobs: 64, price: "180 MAD/h" },
  { name: "Hicham K.", job: "Jardinage", rating: 4.7, jobs: 51, price: "100 MAD/h" },
];
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <div v-for="p in pros" :key="p.name" class="rounded-xl border border-border bg-background p-5">
      <div class="flex items-center gap-3">
        <div class="grid h-12 w-12 place-items-center rounded-full bg-gradient-warm font-display font-bold text-primary-foreground">
          {{ p.name[0] }}
        </div>
        <div>
          <p class="font-semibold">{{ p.name }}</p>
          <p class="text-xs text-muted-foreground">{{ p.job }}</p>
        </div>
      </div>
      <div class="mt-4 flex items-center gap-3 text-sm">
        <span class="flex items-center gap-1"><Star class="h-3.5 w-3.5 fill-primary text-primary" />{{ p.rating }}</span>
        <span class="text-muted-foreground">·</span>
        <span class="text-muted-foreground">{{ p.jobs }} {{ $t("client.favorites.missions") }}</span>
      </div>
      <p class="mt-2 font-display text-lg font-bold">{{ p.price }}</p>
      <div class="mt-4 flex gap-2">
        <Button size="sm" class="flex-1 bg-gradient-warm text-primary-foreground">{{ $t("client.favorites.book") }}</Button>
        <Button size="sm" variant="outline" class="flex-1">{{ $t("client.favorites.message") }}</Button>
      </div>
    </div>
  </div>
</template>
