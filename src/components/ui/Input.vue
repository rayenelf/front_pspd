<script setup lang="ts">
import { computed } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  class?: string;
  disabled?: boolean;
  defaultValue?: string | number;
  id?: string;
  name?: string;
  autocomplete?: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const classes = computed(() =>
  cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    props.class
  )
);
</script>

<template>
  <input
    :type="type ?? 'text'"
    :id="id"
    :name="name"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :value="modelValue ?? defaultValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :class="classes"
  />
</template>
