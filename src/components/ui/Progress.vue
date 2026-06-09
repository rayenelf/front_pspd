<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{ value?: number; class?: string }>();
const classes = computed(() => cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", props.class));
const fill = computed(() => `translateX(-${100 - (props.value ?? 0)}%)`);
</script>

<template>
  <div :class="classes">
    <div class="h-full w-full flex-1 bg-primary transition-all" :style="{ transform: fill }" />
  </div>
</template>
