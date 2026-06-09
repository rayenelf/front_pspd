<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{ modelValue?: boolean; class?: string; disabled?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [v: boolean] }>();

const classes = computed(() =>
  cn(
    "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    props.modelValue ? "bg-primary" : "bg-input",
    props.class
  )
);

const thumbClasses = computed(() =>
  cn(
    "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
    props.modelValue ? "translate-x-4" : "translate-x-0"
  )
);
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="classes"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span :class="thumbClasses" />
  </button>
</template>
