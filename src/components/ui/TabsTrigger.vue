<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{ value: string; class?: string }>();
const ctx = inject<{ active: Ref<string>; setValue: (v: string) => void }>("tabs-context");

const classes = computed(() =>
  cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    ctx?.active.value === props.value ? "bg-background text-foreground shadow" : "",
    props.class
  )
);
</script>

<template>
  <button type="button" role="tab" :aria-selected="ctx?.active.value === value" :class="classes" @click="ctx?.setValue(value)">
    <slot />
  </button>
</template>
