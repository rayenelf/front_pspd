<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";
const props = defineProps<{ class?: string }>();
const classes = computed(() =>
  cn("flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium", props.class)
);
</script>

<template><span :class="classes"><slot /></span></template>
