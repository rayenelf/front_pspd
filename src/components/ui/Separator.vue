<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{ class?: string; orientation?: "horizontal" | "vertical" }>();

const classes = computed(() =>
  cn(
    "shrink-0 bg-border",
    (props.orientation ?? "horizontal") === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
    props.class
  )
);
</script>

<template><div role="none" :class="classes" /></template>
