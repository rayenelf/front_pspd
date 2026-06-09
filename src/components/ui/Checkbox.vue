<script setup lang="ts">
import { computed } from "vue";
import { Check } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = defineProps<{ modelValue?: boolean; class?: string; id?: string; disabled?: boolean }>();
const emit = defineEmits<{ "update:modelValue": [v: boolean] }>();

const classes = computed(() =>
  cn(
    "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
    props.modelValue ? "bg-primary text-primary-foreground" : "bg-background",
    props.class
  )
);
</script>

<template>
  <button
    type="button"
    role="checkbox"
    :id="id"
    :aria-checked="modelValue"
    :disabled="disabled"
    :class="classes"
    @click="emit('update:modelValue', !modelValue)"
  >
    <Check v-if="modelValue" class="h-3 w-3" />
  </button>
</template>
